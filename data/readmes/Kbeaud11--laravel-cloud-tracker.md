# Laravel Cloud Tracker

Track usage-based infrastructure costs per model in [Laravel Cloud](https://cloud.laravel.com) environments. Built for observability — not billing.

Laravel Cloud Tracker gives you per-entity, per-feature cost visibility by wrapping expensive operations in a fluent API that measures execution time, calculates estimated cost across multiple infrastructure dimensions, and stores both granular events and aggregated monthly rollups.

## Why?

Laravel Cloud bills by usage: compute time, database CPU, cache operations, bandwidth, and more. When you run a multi-tenant SaaS, you need to understand **which tenants** consume **which resources** and **how much it costs**.

This package answers questions like:

- "How much compute does Organization X consume monthly?"
- "What's the most expensive feature across all tenants?"
- "Are our enterprise clients actually covering their infrastructure costs?"

It does **not** enforce billing, integrate with Stripe, or render UI. It's the observability layer that makes those things possible.

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- MySQL, PostgreSQL, or SQLite

## Installation

```bash
composer require kbeaud11/laravel-cloud-tracker
```

### Publish Configuration

```bash
php artisan vendor:publish --tag=cloud-tracker-config
```

### Publish & Run Migrations

```bash
php artisan vendor:publish --tag=cloud-tracker-migrations
php artisan migrate
```

This creates three tables:

| Table | Purpose |
|-------|---------|
| `model_tracking_policies` | Per-model tracking configuration (mode, feature lists, multiplier) |
| `model_usage_events` | Granular event log for every tracked operation |
| `model_usage_rollups` | Monthly aggregates per model + feature for fast querying |

## Configuration

After publishing, the config lives at `config/cloud-tracker.php`.

### Master Switch & Environments

```php
'enabled' => env('CLOUD_TRACKER_ENABLED', true),

'environments' => ['production', 'staging'],
```

Tracking is **disabled by default in local development**. The callback always executes — only timing, cost calculation, and DB writes are skipped.

### Laravel Cloud Plan

```php
'plan' => env('CLOUD_TRACKER_PLAN', 'growth'),
```

Stored for reference and future quota features. Does not affect per-unit rates (those are determined by instance selection).

Supported values: `starter`, `growth`, `business`, `enterprise`.

### Cost Dimensions

Every billable Laravel Cloud resource is represented as a cost dimension. Rates are pre-populated from [Laravel Cloud's published pricing](https://cloud.laravel.com/docs/pricing) (US East region).

#### Compute (Time-Based)

Select your instance size via environment variable:

```env
CLOUD_TRACKER_COMPUTE_INSTANCE=pro-2c-4g
```

Available instances:

| Instance | Monthly | Per Second |
|----------|---------|------------|
| `flex-1c-256m` | $4/mo | $0.00000165/s |
| `flex-2c-512m` | $8/mo | $0.00000331/s |
| `flex-4c-2g` | $16/mo | $0.00000661/s |
| `pro-1c-1g` | $20/mo | $0.00000827/s |
| `pro-2c-4g` | $40/mo | $0.00001650/s |
| `pro-4c-8g` | $80/mo | $0.00003310/s |

#### Queue Workers (Time-Based)

Queue workers use the same instance pricing as compute but are configured independently:

```env
CLOUD_TRACKER_QUEUE_INSTANCE=flex-2c-512m
```

#### Serverless Postgres (Time-Based)

Billed at $0.106/hour per vCPU:

```php
'postgres' => [
    'unit' => 'time',
    'per_second' => 0.00002944,
],
```

#### Cache / Valkey (Flat Monthly)

Flat monthly rate amortized over estimated operations:

```env
CLOUD_TRACKER_CACHE_TIER=1g
```

| Tier | Monthly |
|------|---------|
| `250m` | $6/mo |
| `1g` | $20/mo |
| `2g` | $40/mo |
| `5g` | $80/mo |
| `10g` | $140/mo |
| `25g` | $200/mo |
| `50g` | $272/mo |

Adjust `estimated_operations_per_month` to match your actual usage for more accurate per-operation cost.

#### WebSockets / Reverb (Flat Monthly)

```env
CLOUD_TRACKER_WEBSOCKET_MONTHLY=5.00
```

Amortized over `estimated_messages_per_month` (default: 1,000,000).

#### Bandwidth (Count-Based)

```php
'bandwidth' => [
    'unit' => 'count',
    'per_gb' => 0.10,
],
```

#### Object Storage (Count-Based)

```php
'storage' => [
    'unit' => 'count',
    'per_1k_operations' => 0.0005,
    'per_gb_month' => 0.02,
],
```

### Event Logging

```php
'log_events' => true,
```

Set to `false` to skip writing to `model_usage_events` and only maintain rollups. Reduces write volume in high-throughput scenarios.

### Default Dimension

```php
'default_dimension' => 'compute',
```

Applied when no dimension is explicitly chained on a `track()` call.

## Usage

### 1. Add the Trait to Your Billable Model

```php
use LaravelCloudTracker\Traits\TracksCloudCost;

class Organization extends Model
{
    use TracksCloudCost;
}
```

This provides three relationships:

```php
$org->trackingPolicy;  // MorphOne — the model's tracking configuration
$org->usageEvents;     // MorphMany — all granular usage events
$org->usageRollups;    // MorphMany — monthly rollup aggregates
```

### 2. Track an Operation

```php
use LaravelCloudTracker\Facades\CloudCost;

$result = CloudCost::for($organization)
    ->feature('smart_segment_rebuild')
    ->track(function () use ($segment) {
        return $segment->rebuild();
    });
```

The callback's return value is always passed through. Timing, cost calculation, event logging, and rollup upsert happen transparently.

### 3. Chain Multiple Dimensions

When an operation spans multiple infrastructure resources:

```php
CloudCost::for($organization)
    ->feature('live_dashboard_update')
    ->dimension('compute')
    ->dimension('postgres')
    ->dimension('cache', operations: 25)
    ->dimension('websocket', quantity: 3)
    ->track(function () use ($dashboard) {
        $data = $dashboard->aggregateMetrics();    // compute + postgres
        Cache::put("dashboard:{$dashboard->id}", $data); // cache
        broadcast(new DashboardUpdated($data));    // websocket
        return $data;
    });
```

Each dimension calculates cost independently based on its unit type, then all are summed.

For **time-based** dimensions (`compute`, `postgres`, `queue`), cost is derived from execution time automatically.

For **count-based** and **flat-monthly** dimensions (`cache`, `websocket`, `bandwidth`, `storage`), pass a quantity:

```php
->dimension('cache', quantity: 50)      // 50 cache operations
->dimension('websocket', quantity: 3)   // 3 messages broadcast
->dimension('bandwidth', quantity: 0.5) // 0.5 GB transferred
```

### 4. Force Tracking (Bypass Policy)

For admin or internal operations that should always be tracked regardless of the model's policy:

```php
CloudCost::for($organization)
    ->feature('admin_data_export')
    ->force()
    ->track(fn () => $exporter->run());
```

`force()` bypasses the tracking policy but still respects environment restrictions (local stays disabled).

### 5. Attach Metadata

Store arbitrary context with the event for debugging or reporting:

```php
CloudCost::for($organization)
    ->feature('csv_import')
    ->withMetadata([
        'job_id' => $this->job->getJobId(),
        'rows' => $rowCount,
        'file_size_mb' => $fileSizeMb,
    ])
    ->track(fn () => $importer->process($file));
```

Metadata is stored as JSON on the `model_usage_events` row.

## Tracking Policies

Every billable model can have a tracking policy that controls which features are tracked and at what cost multiplier. Policies are stored in the `model_tracking_policies` table (created by the package migration).

### Creating a Policy

```php
use LaravelCloudTracker\Models\TrackingPolicy;
use LaravelCloudTracker\Enums\TrackingMode;

// Track everything (default behavior even without a policy row)
TrackingPolicy::create([
    'billable_type' => $org->getMorphClass(),
    'billable_id' => $org->getKey(),
    'tracking_mode' => TrackingMode::ALL,
]);

// Track nothing
TrackingPolicy::create([
    'billable_type' => $org->getMorphClass(),
    'billable_id' => $org->getKey(),
    'tracking_mode' => TrackingMode::NONE,
]);

// Only track specific features
TrackingPolicy::create([
    'billable_type' => $org->getMorphClass(),
    'billable_id' => $org->getKey(),
    'tracking_mode' => TrackingMode::ALLOWLIST,
    'tracking_features' => ['segment_rebuild', 'csv_import', 'merge'],
]);

// Track everything except listed features
TrackingPolicy::create([
    'billable_type' => $org->getMorphClass(),
    'billable_id' => $org->getKey(),
    'tracking_mode' => TrackingMode::DENYLIST,
    'tracking_features' => ['debug', 'health_check'],
]);
```

Or via the trait relationship:

```php
$org->trackingPolicy()->create([
    'tracking_mode' => TrackingMode::ALL,
    'usage_multiplier' => 0.75, // Enterprise discount
]);
```

### Tracking Modes

| Mode | Behavior |
|------|----------|
| `all` | Track every feature. This is also the default when no policy row exists. |
| `none` | Track nothing. The callback still executes, but no timing or DB writes occur. |
| `allowlist` | Only track features listed in `tracking_features`. |
| `denylist` | Track everything **except** features listed in `tracking_features`. |

### Usage Multiplier

The `usage_multiplier` column scales all cost calculations for a model:

```php
// Enterprise client at 75% rate
$org->trackingPolicy()->update(['usage_multiplier' => 0.7500]);

// At-cost client at 100% (default)
$org->trackingPolicy()->update(['usage_multiplier' => 1.0000]);

// Premium support client at 150% markup
$org->trackingPolicy()->update(['usage_multiplier' => 1.5000]);
```

### Policy Resolution

Policy is evaluated **before** timing starts. When tracking is disabled for a model+feature:

- The callback still executes normally
- No `hrtime` calls
- No cost calculation
- No database writes
- Near-zero overhead

Policies are cached in memory for the duration of the request to avoid redundant queries.

## Querying Usage Data

### Via Relationships

```php
// All events for an organization
$org->usageEvents()->where('feature', 'merge')->get();

// Monthly rollups
$org->usageRollups()
    ->where('period_start', '2026-02-01')
    ->get();

// Total cost this month
$org->usageRollups()
    ->where('period_start', now()->startOfMonth())
    ->sum('total_cost');
```

### Via Models Directly

```php
use LaravelCloudTracker\Models\UsageRollup;
use LaravelCloudTracker\Models\UsageEvent;

// Top 10 most expensive features this month
UsageRollup::where('period_start', now()->startOfMonth())
    ->orderByDesc('total_cost')
    ->limit(10)
    ->get();

// Recent events with cost breakdown
UsageEvent::where('feature', 'segment_rebuild')
    ->latest()
    ->limit(50)
    ->get()
    ->each(function ($event) {
        // $event->cost_dimensions contains per-dimension breakdown:
        // [
        //     'compute' => ['ms' => 150.23, 'cost' => 0.00000024],
        //     'cache'   => ['quantity' => 25, 'cost' => 0.000015],
        // ]
    });
```

## Extending the Package

Both the policy resolver and cost calculator are bound to contracts in the service container. You can swap in your own implementations.

### Custom Policy Resolver

```php
use LaravelCloudTracker\Contracts\TrackingPolicyResolver;

class CustomPolicyResolver implements TrackingPolicyResolver
{
    public function shouldTrack(Model $model, string $feature): bool
    {
        // Your custom logic — check feature flags, plan tiers, etc.
    }

    public function getMultiplier(Model $model): float
    {
        // Dynamic pricing based on plan, usage tier, time of day, etc.
    }

    public function flush(): void
    {
        // Clear any caches
    }
}
```

Register in your `AppServiceProvider`:

```php
$this->app->singleton(
    \LaravelCloudTracker\Contracts\TrackingPolicyResolver::class,
    \App\Services\CustomPolicyResolver::class,
);
```

### Custom Cost Calculator

```php
use LaravelCloudTracker\Contracts\CostCalculator;

class VolumeTierCostCalculator implements CostCalculator
{
    public function calculate(float $executionTimeMs, array $dimensions, float $multiplier = 1.0): array
    {
        // Apply volume discounts, time-of-day pricing, etc.
    }
}
```

Register in your `AppServiceProvider`:

```php
$this->app->singleton(
    \LaravelCloudTracker\Contracts\CostCalculator::class,
    \App\Services\VolumeTierCostCalculator::class,
);
```

## How It Works

### Execution Flow

```
CloudCost::for($model)->feature('x')->track(fn () => ...)
│
├─ Validate: model and feature are set
├─ Check: config enabled?
├─ Check: environment allowed?
├─ Check: policy allows tracking? (skipped if force())
│
├─ Start hrtime
├─ Execute callback
├─ Stop hrtime → execution_time_ms
│
├─ Resolve dimensions (default to config default_dimension)
├─ Calculate cost per dimension × usage_multiplier
│
├─ Write to model_usage_events (if log_events enabled)
├─ Atomic upsert to model_usage_rollups
│
└─ Return callback result
```

### Cost Calculation

Each dimension type calculates cost differently:

| Unit Type | Formula | Examples |
|-----------|---------|----------|
| `time` | `execution_time_ms ÷ 1000 × per_second_rate` | compute, postgres, queue |
| `count` | `quantity × per_unit_rate` | bandwidth, storage |
| `flat_monthly` | `quantity × (monthly_rate ÷ estimated_ops_per_month)` | cache, websocket |

The total cost across all dimensions is then multiplied by the model's `usage_multiplier`.

### Rollup Aggregation

Rollups use an atomic database upsert keyed by `(billable_type, billable_id, feature, period_start)`. On conflict, `total_execution_ms`, `total_cost`, and `event_count` are incremented atomically — no read-then-write race conditions.

Compatible with MySQL, PostgreSQL, and SQLite.

## Testing

### Running Package Tests

```bash
composer install
./vendor/bin/phpunit
```

Tests run against an in-memory SQLite database with no external dependencies.

### Test Coverage

| Suite | Tests | Covers |
|-------|-------|--------|
| Feature/TrackingPolicyTest | 8 | All policy modes, multiplier, caching, trait relationships |
| Feature/CloudCostTrackingTest | 18 | Full tracking lifecycle, force bypass, dimension chaining, environment/config disabling, timing accuracy, metadata, event logging toggle |
| Unit/CostCalculationTest | 11 | All dimension unit types, multiplier scaling, multi-dimension summation, edge cases, unknown dimension errors |

### Testing in Your Application

The package respects the `environments` config. Add `'testing'` to track during tests, or leave it out to skip tracking entirely in your test suite:

```php
// config/cloud-tracker.php
'environments' => ['production', 'staging', 'testing'],
```

To assert tracking in your application tests:

```php
use LaravelCloudTracker\Models\UsageEvent;
use LaravelCloudTracker\Models\UsageRollup;

// Assert an event was recorded
$this->assertDatabaseHas('model_usage_events', [
    'billable_type' => $org->getMorphClass(),
    'billable_id' => $org->getKey(),
    'feature' => 'merge',
]);

// Assert rollup was created
$this->assertDatabaseHas('model_usage_rollups', [
    'feature' => 'merge',
    'period_start' => now()->startOfMonth()->toDateString(),
]);
```

## What This Package Is Not

- **Not a billing engine.** No Stripe, no invoices, no payment processing.
- **Not a UI.** No dashboards, charts, or admin panels.
- **Not real infrastructure introspection.** It doesn't read CloudWatch metrics or parse SQL queries. It estimates cost from execution time and configured rates.
- **Not a rate limiter or quota enforcer.** It observes — it doesn't restrict.

It is the **observability foundation** that makes all of those things possible.

## License

MIT
