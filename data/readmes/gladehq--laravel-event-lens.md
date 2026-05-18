<p align="center">
    <img src="https://img.shields.io/packagist/v/gladehq/laravel-event-lens" alt="Latest Version">
    <img src="https://img.shields.io/packagist/php-v/gladehq/laravel-event-lens" alt="PHP Version">
    <img src="https://img.shields.io/badge/Laravel-10%20%7C%2011%20%7C%2012-FF2D20" alt="Laravel Version">
    <img src="https://img.shields.io/packagist/l/gladehq/laravel-event-lens" alt="License">
    <img src="https://img.shields.io/badge/tests-318%20passed-brightgreen" alt="Tests">
</p>

# Laravel Event Lens

**Deep observability for Laravel Events and Listeners.** Trace every dispatch, measure every listener, catch every anomaly — with zero changes to your existing event code.

Event Lens intercepts Laravel's event dispatcher to record execution traces with parent-child hierarchy, side-effect counts, payload snapshots, and millisecond-precision timing. The built-in dashboard provides waterfall visualization, health monitoring, flow mapping, and anomaly detection.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Dashboard](#dashboard)
- [Event Tagging](#event-tagging)
- [Model Linking](#model-linking)
- [Custom Watchers](#custom-watchers)
- [Health Monitoring](#health-monitoring)
- [Anomaly Detection](#anomaly-detection)
- [Notification Alerts](#notification-alerts)
- [Event Flow Map](#event-flow-map)
- [Comparison Mode](#comparison-mode)
- [Event Replay](#event-replay)
- [OpenTelemetry Export](#opentelemetry-export)
- [JSON API](#json-api)
- [CI Integration](#ci-integration)
- [Testing Utilities](#testing-utilities)
- [Artisan Commands](#artisan-commands)
- [Environment Variables](#environment-variables)
- [Octane Support](#octane-support)
- [Queue Tracing](#queue-tracing)
- [How It Differs from Telescope](#how-it-differs-from-telescope)
- [License](#license)

---

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12

No additional PHP extensions or JS build tools required.

## Installation

```bash
composer require gladehq/laravel-event-lens
```

```bash
php artisan event-lens:install
```

This publishes the config file and runs migrations. That's it — visit `/event-lens` to see the dashboard.

<details>
<summary>Manual installation</summary>

```bash
php artisan vendor:publish --tag=event-lens-config
php artisan migrate
```

Optionally publish views for customization:

```bash
php artisan vendor:publish --tag=event-lens-views
```

</details>

## Quick Start

Event Lens works out of the box. Once installed, every event in the `App\Events\*` namespace is automatically traced. No code changes needed.

```php
// This is already being traced
OrderPlaced::dispatch($order);
```

Visit `/event-lens` to see:
- The event dispatch and listener execution as a waterfall trace
- Query count, mail count, and HTTP calls per listener
- Payload snapshot with automatic redaction of sensitive keys
- Model changes captured from dirty Eloquent models
- Exception details with stack traces if a listener failed

---

## Configuration

All options are in `config/event-lens.php`:

### Core

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `true` | Master switch |
| `sampling_rate` | `1.0` | Percentage of events to record (0.0-1.0) |
| `namespaces` | `['App\Events\*']` | Event class patterns to monitor (wildcards supported) |
| `ignore` | `[]` | Event patterns to exclude, even if they match namespaces |
| `capture_backtrace` | `false` | Record file/line where events are dispatched. **Dev only** — expensive |
| `redacted_keys` | `['password', 'token', ...]` | Keys scrubbed from payloads before storage (case-insensitive) |

### Dashboard

| Key | Default | Description |
|-----|---------|-------------|
| `authorization` | `null` | Closure receiving `$user`, return `true` to allow access. Default: local env only |
| `middleware` | `['web']` | Middleware stack for dashboard routes |
| `path` | `'event-lens'` | URL prefix |

### Storage & Retention

| Key | Default | Description |
|-----|---------|-------------|
| `database_connection` | `null` | Separate DB connection for storage (`null` = app default) |
| `prune_after_days` | `7` | Days to retain data. Pruning runs daily via scheduler |
| `buffer_size` | `1000` | Max in-memory events before auto-flush to database |

### Detection Thresholds

| Key | Default | Description |
|-----|---------|-------------|
| `slow_threshold` | `100.0` | Milliseconds before flagging as slow |
| `storm_threshold` | `50` | Same-event dispatches per correlation before flagging as storm |
| `stale_threshold_days` | `30` | Days of inactivity before a listener is considered stale |
| `regression_threshold` | `2.0` | Multiplier for flagging performance regressions (e.g. 2.0 = 2x slower) |

### SLA Budgets

```php
'sla_budgets' => [
    'App\Listeners\SendEmail' => 500,     // 500ms budget
    'App\Events\OrderPlaced' => 200,      // 200ms for all listeners
    'App\Events\*' => 1000,              // Wildcard fallback
],
```

Resolution order: exact listener name > exact event name > wildcard pattern.

### Side-Effect Watchers

```php
'watchers' => [
    \GladeHQ\LaravelEventLens\Watchers\QueryWatcher::class,
    \GladeHQ\LaravelEventLens\Watchers\MailWatcher::class,
    \GladeHQ\LaravelEventLens\Watchers\HttpWatcher::class,
],
```

### Advanced

| Key | Default | Description |
|-----|---------|-------------|
| `allow_replay` | `false` | Enable event replay from dashboard. **Use with caution** |
| `otlp_endpoint` | `null` | OTLP endpoint for trace export |
| `otlp_service_name` | `null` | Service name in OTLP resource attributes |
| `alerts.enabled` | `false` | Enable Slack/mail/log alert notifications |
| `alerts.channels` | `[]` | Any combination of `'slack'`, `'mail'`, `'log'` |
| `alerts.slack_webhook` | `null` | Slack incoming webhook URL |
| `alerts.mail_to` | `null` | Email address for alerts |
| `alerts.cooldown_minutes` | `15` | Minutes between repeated alerts of the same type |
| `alerts.on` | `['storm', 'sla_breach', ...]` | Alert types to enable |

---

## Dashboard

Visit `/event-lens` (or your configured path). Access is restricted to the `local` environment by default.

### Authorization

```php
// config/event-lens.php
'authorization' => function ($user) {
    return $user && $user->isAdmin();
},
```

### Pages

**Stream** — Live event feed with real-time polling. Filter by event name, listener name, payload content, tags, date range, or toggle slow/errors/storms/SLA breaches/drift/N+1. Each row shows inline badges for all detected anomalies, request context (HTTP method + path, CLI command, or queue job), and a copy button for correlation IDs.

**Statistics** — Three-tab analytics dashboard:
- **Overview**: Daily volume chart with error overlay, execution time distribution histogram, event mix composition
- **Performance**: Top events by frequency with per-listener breakdown, slowest events, heaviest by query load
- **Errors**: Exception breakdown grouped by type with counts

**Health** — Five-tab diagnostic dashboard:
- **Audit**: Dead listeners, orphan events, stale listeners
- **Listener Health**: 0-100 reliability scores based on error rate, P95 latency, and query volume
- **SLA Compliance**: Budget vs actual execution time with compliance percentage
- **Blast Radius**: Event-to-listener dependency map with error/slow indicators
- **Regressions**: Listeners whose recent performance has degraded vs historical baseline

**Flow Map** — Directed graph visualization of event-to-listener relationships. SVG-based with edge colors indicating health (green to red) and thickness proportional to volume. Time range selector: 1h, 6h, 24h, 7d.

**Compare** — Side-by-side period analysis. Summary cards for throughput/latency/error rate deltas. Per-listener breakdown table sorted by degradation. Presets: hour, day, week.

**Waterfall** — Per-correlation execution tree with timing bars, side-effect counts, error propagation badges on ancestor nodes, compact/detailed toggle, and OTLP export button.

**Detail** — Single event deep-dive with payload inspection, exception context with collapsible stack trace, model changes as before/after diff table, tags, and event replay button.

---

## Event Tagging

Add structured metadata to events by implementing `Taggable`:

```php
use GladeHQ\LaravelEventLens\Contracts\Taggable;

class OrderPlaced implements Taggable
{
    public function __construct(
        public Order $order,
        public string $channel,
    ) {}

    public function eventLensTags(): array
    {
        return [
            'channel' => $this->channel,
            'priority' => $this->order->total > 1000 ? 'high' : 'normal',
        ];
    }
}
```

Tags appear as purple badges on the stream and are searchable via the "Tag Contains" filter.

---

## Model Linking

Associate Eloquent models with their event history:

```php
use GladeHQ\LaravelEventLens\Concerns\HasEventLens;

class Order extends Model
{
    use HasEventLens;
}

// Query events for a specific order
$order->eventLogs()->latest()->get();
```

Event Lens automatically detects Eloquent models in event public properties and stores `model_type`/`model_id` for polymorphic lookups. Dirty model state is captured as before/after change diffs.

---

## Custom Watchers

Track additional side effects by implementing `WatcherInterface`:

```php
use GladeHQ\LaravelEventLens\Contracts\WatcherInterface;

class RedisWatcher implements WatcherInterface
{
    protected array $stack = [];

    public function boot(): void
    {
        // Register listeners for Redis commands
    }

    public function start(): void
    {
        $this->stack[] = 0;
    }

    public function stop(): array
    {
        return ['redis' => array_pop($this->stack) ?? 0];
    }

    public function reset(): void
    {
        $this->stack = [];
    }
}
```

Register it:

```php
// config/event-lens.php
'watchers' => [
    \GladeHQ\LaravelEventLens\Watchers\QueryWatcher::class,
    \GladeHQ\LaravelEventLens\Watchers\MailWatcher::class,
    \GladeHQ\LaravelEventLens\Watchers\HttpWatcher::class,
    \App\Watchers\RedisWatcher::class,
],
```

Watchers use a stack-based scoping model to correctly attribute side effects to nested event chains.

---

## Health Monitoring

### Listener Health Scores

Each listener gets a 0-100 reliability score:

| Factor | Weight | Penalty |
|--------|--------|---------|
| Error rate | High | -40 at 100% errors |
| P95 latency | Medium | -30 when exceeding slow threshold |
| Query volume | Low | -10 for high query counts |

Scores are color-coded: green (80+), yellow (50-79), red (below 50).

### Dead Listener Audit

The audit tab cross-references your registered listeners (from `EventServiceProvider`) against recorded execution data. Listeners that are registered but have zero executions are flagged as dead — potential code to remove.

### Blast Radius

Maps each event to all its listeners with error and slow counts. Helps identify high-risk events whose failures would cascade through many listeners.

---

## Anomaly Detection

Event Lens detects five types of anomalies automatically:

| Anomaly | Badge | How It's Detected |
|---------|-------|-------------------|
| **Storm** | Red | Same event class fires > `storm_threshold` times in one correlation |
| **N+1** | Orange | Identical SQL fingerprint repeated 5+ times, or same event dispatched 5+ times |
| **SLA Breach** | Orange | Execution time exceeds configured budget |
| **Schema Drift** | Blue | Payload structure changes from recorded baseline (added/removed keys, type changes) |
| **Regression** | Severity-colored | Recent 24h average exceeds 7-day baseline by `regression_threshold` |

All anomalies are filterable on the stream page and surfaced in the health dashboard.

---

## Notification Alerts

Get notified on Slack, email, or log when anomalies occur:

```php
// config/event-lens.php
'alerts' => [
    'enabled' => true,
    'channels' => ['slack', 'mail'],
    'slack_webhook' => env('EVENT_LENS_SLACK_WEBHOOK'),
    'mail_to' => env('EVENT_LENS_ALERT_MAIL_TO'),
    'cooldown_minutes' => 15,
    'on' => ['storm', 'sla_breach', 'regression', 'error_spike'],
],
```

| Alert Type | Trigger | Timing |
|------------|---------|--------|
| `storm` | Event exceeds storm threshold | Inline during recording |
| `sla_breach` | Listener exceeds time budget | Inline during recording |
| `regression` | Critical severity regression detected | Scheduled (every 5 min) |
| `error_spike` | Error rate exceeds 10% with minimum volume | Scheduled (every 5 min) |

Per-type cooldown prevents notification fatigue. Alerts use atomic `Cache::add()` for thread-safe cooldown tracking.

---

## Event Flow Map

The `/event-lens/flow-map` page renders a directed graph of your event-to-listener architecture:

- **Event nodes** (indigo) on the left, **Listener nodes** (emerald) on the right
- **Edges** colored by health: green (healthy), amber (slow), red (error-prone)
- **Edge thickness** proportional to execution count
- **Time range selector**: 1h, 6h, 24h, 7d
- **Zoom controls** with SVG viewBox manipulation
- **Connection details table** below the graph with exact counts, avg time, and error rates

Built with server-rendered SVG and Alpine.js — no D3, Mermaid, or external JS dependencies.

---

## Comparison Mode

The `/event-lens/comparison` page provides before/after analysis:

- **Summary cards**: Throughput delta, average time delta, error rate delta (with percentage changes)
- **Listener breakdown**: Per-listener table sorted by degradation with status badges
- **Presets**: Last hour vs previous, Today vs yesterday, This week vs last week

Useful for evaluating the impact of deployments, config changes, or traffic shifts.

---

## Event Replay

Re-dispatch previously recorded events from the detail page:

```php
// config/event-lens.php
'allow_replay' => env('EVENT_LENS_ALLOW_REPLAY', false),
```

When enabled, root events show a "Replay" button. The original payload is deserialized (with internal metadata stripped) and the event is re-dispatched through Laravel's event system.

**Safety**: Disabled by default. Replayed events trigger the full listener pipeline including side effects (emails, DB writes, API calls). Enable only in development or staging.

---

## OpenTelemetry Export

Export event traces as OTLP spans to any OpenTelemetry-compatible backend (Jaeger, Zipkin, Datadog, Honeycomb). No additional PHP packages required — uses Laravel's HTTP client.

```php
// config/event-lens.php
'otlp_endpoint' => env('EVENT_LENS_OTLP_ENDPOINT'),        // e.g. https://otel.example.com
'otlp_service_name' => env('EVENT_LENS_OTLP_SERVICE_NAME'), // e.g. my-app
```

When configured, the waterfall page shows an "Export Trace" button. Each event log becomes a span with:

- `traceId` derived from the correlation ID
- `spanId` derived from the event ID
- `parentSpanId` linking to parent span
- Attributes: `event.name`, `event.listener`, `db.query_count`, `mail.count`, `http.call_count`, `error`, `exception.message`, `event_lens.storm`, `event_lens.sla_breach`

---

## JSON API

All dashboard endpoints support content negotiation. Send `Accept: application/json` to get JSON:

```bash
# Event stream
curl -H "Accept: application/json" https://your-app.com/event-lens

# Statistics
curl -H "Accept: application/json" https://your-app.com/event-lens/statistics

# Health
curl -H "Accept: application/json" https://your-app.com/event-lens/health

# Trace waterfall
curl -H "Accept: application/json" https://your-app.com/event-lens/{correlationId}

# Comparison
curl -H "Accept: application/json" https://your-app.com/event-lens/comparison?preset=day

# Polling endpoint (always JSON)
curl https://your-app.com/event-lens/api/latest?after_id=100
```

---

## CI Integration

Gate deployments on SLA compliance:

```bash
php artisan event-lens:assert-performance --period=24h --format=json
```

- Exit code `0`: All SLA budgets met
- Exit code `1`: Breaches found

```yaml
# GitHub Actions example
- name: Assert performance SLAs
  run: php artisan event-lens:assert-performance --period=24h --format=json
```

---

## Testing Utilities

Event Lens includes a test trait for asserting event behavior in your test suite:

```php
use GladeHQ\LaravelEventLens\Testing\AssertsEventLens;

class OrderTest extends TestCase
{
    use AssertsEventLens;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpEventLens(); // Swaps to in-memory buffer
    }

    protected function tearDown(): void
    {
        $this->tearDownEventLens();
        parent::tearDown();
    }

    public function test_order_placement_triggers_correct_chain(): void
    {
        OrderPlaced::dispatch($this->order);

        $this->assertEventDispatched(OrderPlaced::class);
        $this->assertEventLensChain(OrderPlaced::class, [
            SendConfirmationEmail::class,
            UpdateInventory::class,
            NotifyWarehouse::class,
        ]);
        $this->assertListenerUnder(SendConfirmationEmail::class, 500);
        $this->assertNoExceptions();
    }
}
```

### Available Assertions

| Method | Description |
|--------|-------------|
| `assertEventDispatched($event, $callback?)` | Assert event was dispatched. Optional callback receives each record |
| `assertEventNotDispatched($event)` | Assert event was not dispatched |
| `assertEventLensChain($event, $listeners)` | Assert event triggered exact listener chain in order |
| `assertListenerExecuted($listener)` | Assert listener was executed at least once |
| `assertListenerUnder($listener, $maxMs)` | Assert all executions completed within time threshold |
| `assertNoExceptions()` | Assert no recorded events contain exceptions |

---

## Artisan Commands

| Command | Description |
|---------|-------------|
| `event-lens:install` | Publish config and run migrations |
| `event-lens:status` | Show status, event count, sampling rate, monitored namespaces |
| `event-lens:clear --force` | Truncate all event data |
| `event-lens:prune --days=7 --dry-run` | Delete old events. `--dry-run` previews without deleting |
| `event-lens:audit` | Dead listener, orphan event, and stale listener audit |
| `event-lens:check-alerts` | Check for anomalies and fire notifications |
| `event-lens:trace {correlationId} --json` | Display trace tree in terminal with color-coded output |
| `event-lens:assert-performance --period=24h --format=json` | Assert SLA compliance (exit 0/1 for CI) |

Pruning and alert checking are auto-scheduled when configured — no manual cron entries needed.

---

## Environment Variables

```bash
# Core
EVENT_LENS_ENABLED=true
EVENT_LENS_SAMPLING_RATE=1.0
EVENT_LENS_BACKTRACE=false

# Replay
EVENT_LENS_ALLOW_REPLAY=false

# OpenTelemetry
EVENT_LENS_OTLP_ENDPOINT=https://otel.example.com
EVENT_LENS_OTLP_SERVICE_NAME=my-app

# Alerts
EVENT_LENS_ALERTS_ENABLED=false
EVENT_LENS_SLACK_WEBHOOK=https://hooks.slack.com/services/...
EVENT_LENS_ALERT_MAIL_TO=admin@example.com
EVENT_LENS_ALERT_COOLDOWN=15
```

Complex values (namespaces, ignore list, SLA budgets, watchers) must be configured in `config/event-lens.php` directly.

---

## Octane Support

Event Lens automatically resets all singleton state between Octane requests:

- Buffer flush
- Recorder state (call stack, correlation context, storm counters)
- All watcher stacks
- Request context resolver
- N+1 detector
- Schema tracker baseline cache

No configuration needed. Detected via `Laravel\Octane\Events\RequestReceived`.

---

## Queue Tracing

Correlation IDs propagate automatically into queued job payloads via `Queue::createPayloadUsing()`. Events dispatched inside a queued job inherit the parent correlation ID, linking traces across sync and async boundaries.

No configuration needed.

---

## How It Differs from Telescope

| Capability | Telescope | Event Lens |
|------------|-----------|------------|
| Focus | Full request lifecycle | Events & listeners |
| Parent-child tracing | - | Correlation + hierarchy |
| Waterfall visualization | - | Interactive timing bars |
| Side-effect tracking per listener | - | Queries, mails, HTTP calls |
| Model change tracking | - | Dirty state diffs |
| Polymorphic model linking | - | `HasEventLens` trait |
| Cross-queue correlation | - | Automatic propagation |
| Custom watchers | - | Pluggable `WatcherInterface` |
| Event tagging | - | `Taggable` interface |
| Storm detection | - | Configurable threshold |
| N+1 detection | - | Query + event patterns |
| SLA enforcement | - | Time budgets with compliance |
| Schema drift detection | - | Payload fingerprinting |
| Regression detection | - | Baseline comparison |
| Dead listener audit | - | Health dashboard |
| Listener health scores | - | 0-100 reliability |
| Blast radius mapping | - | Dependency visualization |
| Event flow map | - | Directed graph |
| Event replay | - | Dashboard button |
| OpenTelemetry export | - | Native OTLP spans |
| Notification alerts | - | Slack, mail, log |
| Comparison mode | - | Period-over-period |
| CI assertion | - | Exit code gating |
| JSON API | - | Content negotiation |
| Footprint | Heavy | Lightweight |

---

## License

MIT License. See [LICENSE](LICENSE) for details.
