# Laravel Query Sentinel

[![CI](https://github.com/karimalihussein/laravel-query-sentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/karimalihussein/laravel-query-sentinel/actions/workflows/ci.yml)
[![Security](https://github.com/karimalihussein/laravel-query-sentinel/actions/workflows/security.yml/badge.svg)](https://github.com/karimalihussein/laravel-query-sentinel/actions/workflows/security.yml)

Enterprise-grade SQL performance diagnostics engine for Laravel. Runs EXPLAIN ANALYZE, scores queries across 5 weighted dimensions, detects 10 SQL anti-patterns, synthesizes index recommendations, estimates memory pressure under concurrency, tracks regressions over time, and simulates hypothetical indexes — all from a single `diagnose()` call or an interactive Artisan command.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Analysis Modes](#analysis-modes)
  - [Mode 1: Raw SQL Analysis](#mode-1-raw-sql-analysis)
  - [Mode 2: Query Builder / Eloquent Analysis](#mode-2-query-builder--eloquent-analysis)
  - [Mode 3: Closure Profiling](#mode-3-closure-profiling)
  - [Mode 4: Class Method Profiling](#mode-4-class-method-profiling)
  - [Mode 5: Full Deep Diagnostics](#mode-5-full-deep-diagnostics)
- [Interactive Query Scanning](#interactive-query-scanning)
  - [Setting Up DiagnoseQuery](#setting-up-diagnosequery)
  - [Running the Scanner](#running-the-scanner)
  - [How It Works](#how-it-works)
  - [Writing Diagnosable Methods](#writing-diagnosable-methods)
- [Automatic Profiling with Attributes](#automatic-profiling-with-attributes)
  - [Controller Profiling (Middleware)](#controller-profiling-middleware)
  - [Service Class Profiling (Container Proxy)](#service-class-profiling-container-proxy)
  - [Sampling and Thresholds](#sampling-and-thresholds)
  - [Fail on Critical](#fail-on-critical)
  - [Structured Logging](#structured-logging)
- [Console Commands](#console-commands)
- [Deep Diagnostic Features](#deep-diagnostic-features)
  - [22-Step Analysis Pipeline](#22-step-analysis-pipeline)
  - [Cardinality Drift Detection](#cardinality-drift-detection)
  - [Anti-Pattern Detection](#anti-pattern-detection)
  - [Index Synthesis](#index-synthesis)
  - [Confidence Scoring](#confidence-scoring)
  - [Concurrency Risk Analysis](#concurrency-risk-analysis)
  - [Memory Pressure Analysis](#memory-pressure-analysis)
  - [Regression Baselines](#regression-baselines)
  - [Hypothetical Index Simulation](#hypothetical-index-simulation)
  - [Workload Pattern Detection](#workload-pattern-detection)
  - [Plan Stability Analysis](#plan-stability-analysis)
- [Report Reference](#report-reference)
  - [Report Object (Single Query)](#report-object-single-query)
  - [DiagnosticReport Object (Full Diagnostics)](#diagnosticreport-object-full-diagnostics)
  - [ProfileReport Object (Multiple Queries)](#profilereport-object-multiple-queries)
  - [Grading System](#grading-system)
  - [Scoring Components](#scoring-components)
  - [Metrics Extracted](#metrics-extracted)
- [Built-in Rules](#built-in-rules)
- [Custom Rules](#custom-rules)
- [Extension Points](#extension-points)
- [Architecture](#architecture)
- [Testing](#testing)
- [License](#license)

---

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12
- MySQL 8.0.18+ (for EXPLAIN ANALYZE) or PostgreSQL

## Installation

> **Development only** — Install as a dev dependency. It will not be present in production when you run `composer install --no-dev`.

```bash
composer require --dev karimalihussein/laravel-query-sentinel
```

The service provider is auto-discovered. To publish the configuration:

```bash
php artisan vendor:publish --tag=query-sentinel-config
```

Two facades are registered automatically:

- `QuerySentinel` (primary)
- `QueryDiagnostics` (backward-compatible alias)

## Quick Start

```php
use QuerySentinel\Facades\QuerySentinel;

// Analyze a raw SQL query
$report = QuerySentinel::analyzeSql('SELECT * FROM users WHERE email = ?');

echo $report->grade;          // 'A'
echo $report->compositeScore; // 92.5
echo $report->passed;         // true

// Analyze an Eloquent builder (without executing it)
$builder = User::where('status', 'active')->select('id', 'name');
$report = QuerySentinel::analyzeBuilder($builder);

// Profile all queries in a closure (transaction-wrapped, rolled back)
$profile = QuerySentinel::profile(function () {
    $users = User::with('posts', 'comments')->paginate(15);
});

echo $profile->totalQueries;      // 3
echo $profile->nPlusOneDetected;  // false
echo $profile->worstGrade();      // 'B'

// Full deep diagnostics (22-step pipeline)
$diagnostic = QuerySentinel::diagnose('SELECT * FROM orders WHERE status = "pending"');

echo $diagnostic->effectiveGrade();       // Confidence-adjusted grade
echo $diagnostic->memoryPressure;         // Memory footprint analysis
echo $diagnostic->concurrencyRisk;        // Lock contention risk
echo count($diagnostic->findings);        // Severity-sorted findings
```

---

## Configuration

After publishing, edit `config/query-diagnostics.php`:

```php
return [

    // Database driver: 'mysql', 'pgsql', or 'sqlite'
    'driver' => env('QUERY_SENTINEL_DRIVER', 'mysql'),

    // Database connection name (null = default)
    'connection' => env('QUERY_SENTINEL_CONNECTION'),

    // Scoring weights (must sum to 1.0)
    'scoring' => [
        'weights' => [
            'execution_time'  => 0.30,
            'scan_efficiency' => 0.25,
            'index_quality'   => 0.20,
            'join_efficiency' => 0.15,
            'scalability'     => 0.10,
        ],
        'grade_thresholds' => [
            'A' => 90, 'B' => 75, 'C' => 50, 'D' => 25, 'F' => 0,
        ],
    ],

    // Rules to enable
    'rules' => [
        'enabled' => [
            \QuerySentinel\Rules\FullTableScanRule::class,
            \QuerySentinel\Rules\TempTableRule::class,
            \QuerySentinel\Rules\WeedoutRule::class,
            \QuerySentinel\Rules\DeepNestedLoopRule::class,
            \QuerySentinel\Rules\IndexMergeRule::class,
            \QuerySentinel\Rules\StaleStatsRule::class,
            \QuerySentinel\Rules\LimitIneffectiveRule::class,
            \QuerySentinel\Rules\QuadraticComplexityRule::class,
            \QuerySentinel\Rules\NoIndexRule::class,
        ],
    ],

    // Performance thresholds
    'thresholds' => [
        'max_execution_time_ms' => 1000,
        'max_rows_examined'     => 100_000,
        'max_loops'             => 10_000,
        'max_cost'              => 1_000_000,
        'max_nested_loop_depth' => 4,
    ],

    // Scalability projection targets
    'projection' => [
        'targets' => [1_000_000, 10_000_000],
    ],

    // Attribute-based automatic profiling (#[QueryDiagnose])
    'diagnostics' => [
        'enabled'              => env('QUERY_SENTINEL_DIAGNOSTICS_ENABLED', true),
        'global_sample_rate'   => (float) env('QUERY_SENTINEL_SAMPLE_RATE', 1.0),
        'default_threshold_ms' => (int) env('QUERY_SENTINEL_THRESHOLD_MS', 0),
        'classes' => [
            // Service classes to auto-profile:
            // \App\Services\LeadQueryService::class,
        ],
    ],

    // Interactive query scanning (#[DiagnoseQuery])
    'scan' => [
        'paths' => ['app', 'Modules'],
    ],

    // Deep analysis feature configs
    'cardinality_drift' => [
        'warning_threshold'  => 0.5,
        'critical_threshold' => 0.9,
    ],

    'anti_patterns' => [
        'or_chain_threshold'          => 3,
        'missing_limit_row_threshold' => 10000,
    ],

    'index_synthesis' => [
        'max_recommendations'   => 3,
        'max_columns_per_index' => 5,
    ],

    'memory_pressure' => [
        'high_threshold_bytes'     => 268435456,   // 256MB
        'moderate_threshold_bytes' => 67108864,     // 64MB
        'concurrent_sessions'      => 10,
    ],

    'hypothetical_index' => [
        'enabled'              => false,
        'max_simulations'      => 3,
        'timeout_seconds'      => 5,
        'allowed_environments' => ['local', 'testing'],
    ],

    'workload' => [
        'enabled'                 => true,
        'frequency_threshold'     => 10,
        'export_row_threshold'    => 100_000,
        'network_bytes_threshold' => 52428800,  // 50MB
    ],

    'regression' => [
        'enabled'                  => true,
        'storage_path'             => null,  // defaults to storage_path('query-sentinel/baselines')
        'max_history'              => 10,
        'score_warning_threshold'  => 10,
        'score_critical_threshold' => 25,
        'time_warning_threshold'   => 50,
        'time_critical_threshold'  => 200,
        'noise_floor_ms'           => 3,
        'minimum_measurable_ms'    => 5,
    ],
];
```

### Environment Variables

| Variable                             | Default | Description                            |
| ------------------------------------ | ------- | -------------------------------------- |
| `QUERY_SENTINEL_DRIVER`              | `mysql` | Database driver (`mysql`, `pgsql`)     |
| `QUERY_SENTINEL_CONNECTION`          | `null`  | Database connection name               |
| `QUERY_SENTINEL_DIAGNOSTICS_ENABLED` | `true`  | Enable attribute-based profiling       |
| `QUERY_SENTINEL_SAMPLE_RATE`         | `1.0`   | Global profiling sample rate (0.0-1.0) |
| `QUERY_SENTINEL_THRESHOLD_MS`        | `0`     | Global minimum cumulative time to log  |
| `QUERY_SENTINEL_FAIL_ON_CRITICAL`    | `false` | Throw exception on critical findings   |

---

## Analysis Modes

### Mode 1: Raw SQL Analysis

Analyze a raw SQL string. Validated for safety (only SELECT/WITH), sanitized, and run through EXPLAIN ANALYZE.

```php
use QuerySentinel\Facades\QuerySentinel;

$report = QuerySentinel::analyzeSql(
    "SELECT u.*, COUNT(p.id) as post_count
     FROM users u
     LEFT JOIN posts p ON p.user_id = u.id
     WHERE u.status = 'active'
     GROUP BY u.id
     ORDER BY post_count DESC
     LIMIT 20"
);

echo $report->grade;                        // 'B'
echo $report->compositeScore;               // 78.4
echo $report->result->metrics['rows_examined'];  // 15000
echo $report->result->metrics['has_filesort'];   // true

foreach ($report->recommendations as $rec) {
    echo "- {$rec}\n";
}
```

**Safety:** Only read-only SQL is accepted. Destructive statements throw `UnsafeQueryException`.

### Mode 2: Query Builder / Eloquent Analysis

Analyze a Builder instance **without executing it**. SQL and bindings are extracted via `toSql()` / `getBindings()`.

```php
$builder = User::query()
    ->where('status', 'active')
    ->where('created_at', '>=', now()->subDays(30))
    ->select('id', 'name', 'email');

$report = QuerySentinel::analyzeBuilder($builder);
echo $report->grade;  // 'A'
```

### Mode 3: Closure Profiling

Profile all database queries inside a closure. Captures via `DB::listen()`, wraps in transaction (rolled back), and analyzes each SELECT.

```php
$profile = QuerySentinel::profile(function () {
    $users = User::with(['posts', 'comments'])->where('active', true)->get();
    foreach ($users as $user) {
        $user->updateQuietly(['last_seen' => now()]);
    }
});

echo $profile->totalQueries;       // 12
echo $profile->analyzedQueries;    // 3 (SELECTs only)
echo $profile->nPlusOneDetected;   // false
echo $profile->worstGrade();       // 'C'
echo $profile->slowestQuery->result->executionTimeMs;  // 18.5
```

**Safety:** Transaction is always rolled back. No writes persist.

### Mode 4: Class Method Profiling

Profile a class method resolved from the Laravel container.

```php
$profile = QuerySentinel::profileClass(
    \App\Services\LeadQueryService::class,
    'getFilteredLeads',
    [$filterDTO, $page = 1],
);

echo $profile->totalQueries;
echo $profile->worstGrade();
```

### Mode 5: Full Deep Diagnostics

Run the full 22-step diagnostic pipeline with all deep analyzers.

```php
$diagnostic = QuerySentinel::diagnose(
    "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC LIMIT 50"
);

// Confidence-adjusted results
echo $diagnostic->effectiveGrade();          // 'B' (may differ from base grade)
echo $diagnostic->effectiveCompositeScore(); // 82.3

// Deep analysis sections (all nullable — available when analyzers are enabled)
$diagnostic->environment;          // Server config (buffer pool, InnoDB settings)
$diagnostic->executionProfile;     // Nested loops, B-tree depths, complexity
$diagnostic->cardinalityDrift;     // Estimation accuracy per table
$diagnostic->antiPatterns;         // 10 SQL anti-pattern detections
$diagnostic->indexSynthesis;       // ERS-ordered index recommendations with DDL
$diagnostic->confidence;           // 8-factor confidence score (0-1.0)
$diagnostic->concurrencyRisk;      // Lock scope, deadlock risk, contention
$diagnostic->memoryPressure;       // Sort/join/temp buffers, network transfer
$diagnostic->regression;           // Score/time/rows changes vs baseline
$diagnostic->hypotheticalIndexes;  // Simulated index impact (local/testing)
$diagnostic->workload;             // Export/burst/transfer patterns

// Severity-sorted findings with root-cause awareness
foreach ($diagnostic->findings as $finding) {
    echo "[{$finding->severity->value}] {$finding->title}\n";
    echo "  {$finding->description}\n";
    if ($finding->recommendation) {
        echo "  -> {$finding->recommendation}\n";
    }
}
```

---

## Interactive Query Scanning

The `query:scan` command discovers methods annotated with `#[DiagnoseQuery]`, presents an interactive list, and runs full EXPLAIN ANALYZE diagnostics on the selected query builder.

### Setting Up DiagnoseQuery

Add the `#[DiagnoseQuery]` attribute to methods that return a Query Builder:

```php
use QuerySentinel\Attributes\DiagnoseQuery;
use Illuminate\Database\Eloquent\Builder;

class OrderService
{
    #[DiagnoseQuery(label: 'Pending orders', description: 'Orders awaiting fulfillment')]
    public function pendingOrdersQuery(): Builder
    {
        return Order::query()
            ->where('status', 'pending')
            ->where('created_at', '>=', now()->subDays(30))
            ->with('customer')
            ->orderByDesc('created_at');
    }

    #[DiagnoseQuery(label: 'Revenue report')]
    public function revenueReportQuery(): Builder
    {
        return Order::query()
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
            ->where('status', 'completed')
            ->groupByRaw('DATE(created_at)')
            ->orderByDesc('date');
    }
}
```

### Running the Scanner

```bash
# Interactive mode — pick a method from the list
php artisan query:scan

# List all discovered methods
php artisan query:scan --list

# Filter by class, method, or label name
php artisan query:scan --filter=Order

# JSON output (for scripting)
php artisan query:scan --list --json

# Use a specific database connection
php artisan query:scan --connection=reporting

# Fail in CI if warnings found
php artisan query:scan --fail-on-warning
```

Example interactive session:

```
$ php artisan query:scan

Scanning for #[DiagnoseQuery] methods...
Found 3 diagnosable method(s):

 Select a method to diagnose:
  [0] Pending orders  (OrderService.php:15) — Orders awaiting fulfillment
  [1] Revenue report  (OrderService.php:28)
  [2] Active users query  (UserService.php:42)
 > 0

Diagnosing App\Services\OrderService::pendingOrdersQuery...

  ----------------------------------------------------------------------
  Diagnosed Method:
  Class:   App\Services\OrderService
  Method:  pendingOrdersQuery
  File:    /app/Services/OrderService.php:15
  Label:   Pending orders
  ----------------------------------------------------------------------

  Extracted SQL:
  ----------------------------------------------------------------------
  SELECT * FROM `orders` WHERE `status` = 'pending' AND ...
  ----------------------------------------------------------------------

Running EXPLAIN ANALYZE...

=========================================================
  PERFORMANCE ADVISORY REPORT
=========================================================

  Status:     PASS — No issues detected
  Grade:      A (94.2 / 100)
  Time:       1.45ms
  ...
```

### How It Works

1. **Scan** — Finder locates PHP files containing `DiagnoseQuery` in configured paths (`app/`, `Modules/`)
2. **Reflect** — PHP Reflection discovers annotated methods and extracts metadata
3. **Select** — Developer picks a method from the interactive list
4. **Resolve** — Class is resolved from the Laravel container (DI works normally)
5. **Execute** — Method is called inside `DB::beginTransaction()` to get the Builder
6. **Rollback** — Transaction is immediately rolled back (no side effects)
7. **Extract** — SQL and bindings are extracted from the Builder via `toSql()` / `getBindings()`
8. **Diagnose** — Full `Engine::diagnose()` pipeline runs EXPLAIN ANALYZE + all deep analyzers
9. **Report** — Full diagnostic report is rendered to the console

### Writing Diagnosable Methods

The annotated method must:

- **Return** an `Eloquent\Builder` or `Query\Builder` instance
- **Not execute** the query (no `->get()`, `->paginate()`, `->first()`)
- **Have no required parameters** (all params must be optional or have defaults)

If your production method takes parameters, create a dedicated diagnosis method:

```php
class ClientService
{
    // Production method — takes required parameters
    public function getFilteredClients(ClientFilterDTO $dto): LengthAwarePaginator
    {
        return $this->buildFilteredQuery($dto)->paginate($dto->perPage);
    }

    // Diagnosis method — no required params, returns Builder
    #[DiagnoseQuery(label: 'Filtered clients', description: 'Client search with date range')]
    public function buildDiagnosableQuery(): Builder
    {
        return Client::query()
            ->where('active', true)
            ->where('created_at', '>=', now()->subMonth())
            ->whereNotNull('email')
            ->orderByDesc('created_at');
    }
}
```

Configure which directories to scan:

```php
// config/query-diagnostics.php
'scan' => [
    'paths' => ['app', 'Modules'],  // Relative to base_path()
],
```

---

## Automatic Profiling with Attributes

The `#[QueryDiagnose]` attribute enables **zero-code-change runtime profiling**. Place it on any controller or service method to automatically capture, analyze, and log query performance during normal execution.

> **Two different attributes for two different purposes:**
> - `#[DiagnoseQuery]` — Interactive CLI scanning (returns a Builder, used with `query:scan`)
> - `#[QueryDiagnose]` — Runtime profiling (captures queries during execution, logs results)

### Controller Profiling (Middleware)

Register the middleware:

```php
// app/Http/Kernel.php (Laravel 10)
protected $routeMiddleware = [
    'query.diagnose' => \QuerySentinel\Interception\QueryDiagnoseMiddleware::class,
];
```

Apply to routes:

```php
Route::middleware(['auth:sanctum', 'query.diagnose'])->group(function () {
    Route::get('/leads', [LeadsController::class, 'index']);
});
```

Add the attribute:

```php
use QuerySentinel\Attributes\QueryDiagnose;

class LeadsController extends Controller
{
    #[QueryDiagnose]
    public function index(LeadFilterDTO $dto)
    {
        return LeadResource::collection(
            $this->service->getFilteredLeads($dto)
        );
    }

    #[QueryDiagnose(thresholdMs: 100, sampleRate: 0.25)]
    public function search(Request $request)
    {
        // Profiled 25% of the time, logged only if queries take > 100ms
        return $this->service->search($request->input('q'));
    }
}
```

Methods **without** the attribute pass through with zero overhead.

### Service Class Profiling (Container Proxy)

Register service classes in config:

```php
'diagnostics' => [
    'classes' => [
        \App\Services\LeadQueryService::class,
        \App\Services\ReportService::class,
    ],
],
```

Add attributes to methods:

```php
use QuerySentinel\Attributes\QueryDiagnose;

class LeadQueryService
{
    #[QueryDiagnose(thresholdMs: 50)]
    public function getFilteredLeads(LeadFilterDTO $dto): LengthAwarePaginator
    {
        return Client::query()
            ->with(['submissions', 'branch'])
            ->filter($dto)
            ->paginate($dto->perPage);
    }
}
```

When the service is resolved from the container, it is wrapped in a `MethodInterceptor` proxy that intercepts attributed methods and forwards everything else directly.

### Sampling and Thresholds

**Sampling** controls how often profiling activates:

```php
#[QueryDiagnose(sampleRate: 0.05)]  // Profile 5% of invocations
```

Effective rate: `min(methodRate, globalRate)`.

**Thresholds** filter logging noise:

```php
#[QueryDiagnose(thresholdMs: 200)]  // Only log if cumulative time >= 200ms
```

Effective threshold: `max(methodThreshold, globalDefault)`.

| Attribute Param | Config Key                         | Combination Logic                             |
| --------------- | ---------------------------------- | --------------------------------------------- |
| `sampleRate`    | `diagnostics.global_sample_rate`   | `min(method, global)` — most restrictive wins |
| `thresholdMs`   | `diagnostics.default_threshold_ms` | `max(method, global)` — highest bar wins      |

### Fail on Critical

Throw `PerformanceViolationException` on critical performance issues:

```php
#[QueryDiagnose(failOnCritical: true)]
public function criticalEndpoint() { ... }
```

Triggers when: worst grade is D/F, any query > 500ms, full table scan, or N+1 detected.

```php
try {
    $service->criticalEndpoint();
} catch (PerformanceViolationException $e) {
    $e->report;  // ProfileReport
    $e->class;   // 'App\Services\LeadQueryService'
    $e->method;  // 'criticalEndpoint'
}
```

### Structured Logging

Profiled invocations are logged as structured JSON:

```php
#[QueryDiagnose(logChannel: 'performance')]
```

```json
{
  "type": "query_sentinel_profile",
  "class": "App\\Services\\LeadQueryService",
  "method": "getFilteredLeads",
  "total_queries": 5,
  "cumulative_time_ms": 45.23,
  "grade": "B",
  "n_plus_one": false,
  "analyzed_at": "2026-02-27T14:30:00+00:00"
}
```

Log levels: **error** (D/F), **warning** (C or N+1), **info** (A/B).

---

## Console Commands

### `query:diagnose` — Analyze Raw SQL

```bash
# Full deep diagnostic report
php artisan query:diagnose "SELECT * FROM users WHERE email = 'test@example.com'"

# JSON output (CI-friendly)
php artisan query:diagnose "SELECT * FROM users WHERE id = 1" --json

# Shallow analysis (skip deep analyzers)
php artisan query:diagnose "SELECT * FROM users" --shallow

# Fail on warnings (CI gate)
php artisan query:diagnose "SELECT * FROM users" --fail-on-warning

# Specific database connection
php artisan query:diagnose "SELECT * FROM users" --connection=reporting
```

### `query:scan` — Interactive Builder Diagnosis

```bash
# Interactive selection
php artisan query:scan

# List all discovered methods
php artisan query:scan --list

# Filter + JSON
php artisan query:scan --filter=Order --json

# CI mode
php artisan query:scan --fail-on-warning
```

### Console Report Output

```
=========================================================
  PERFORMANCE ADVISORY REPORT
=========================================================

  Status:     PASS — No issues detected
  Grade:      A (92.5 / 100)
  Time:       1.23ms
  Findings:   0 critical  0 warnings  1 optimizations  1 info
  Driver:     mysql

  EXPLAIN ANALYZE Summary:
  ----------------------------------------------------------------------
  Total Execution Time:  1.23ms
  Rows Returned:         15
  Rows Examined:         150
  Selectivity:           10.0x
  Access Type:           REF
  Complexity:            O(log n)
  ----------------------------------------------------------------------

  Execution Plan Analysis:
  ----------------------------------------------------------------------
  Index Used:            YES
  Covering Index:        YES
  Weedout:               NO (good)
  Temporary Table:       NO (good)
  Filesort:              NO (good)
  Table Scan:            NO (good)
  Early Termination:     YES
  Indexes:  idx_users_email
  ----------------------------------------------------------------------

  Weighted Performance Score:
  ----------------------------------------------------------------------
  Composite Score:       92.5 / 100
  Grade:                 A
    execution_time     95/100  [|||||||||||||||||||.]  (30% weight)
    scan_efficiency    90/100  [||||||||||||||||||..]  (25% weight)
    index_quality      95/100  [|||||||||||||||||||.]  (20% weight)
    join_efficiency   100/100  [||||||||||||||||||||]  (15% weight)
    scalability        85/100  [|||||||||||||||||...]  (10% weight)
  ----------------------------------------------------------------------

  Scalability Estimation:
  ----------------------------------------------------------------------
  Table Size (rows):     10,000
  Risk:                  LOW
    at 1M:  GOOD  (projected 12.3ms)
    at 10M: MODERATE  (projected 123.0ms)
  ----------------------------------------------------------------------
```

### CI Integration

```yaml
# .github/workflows/query-check.yml
- name: Check query performance
  run: |
    php artisan query:diagnose \
      "SELECT * FROM leads WHERE status = 'active'" \
      --fail-on-warning --json
```

---

## Deep Diagnostic Features

When using `Engine::diagnose()` or `query:diagnose` / `query:scan`, the full 22-step pipeline runs automatically.

### 22-Step Analysis Pipeline

| Step | Phase | What It Does |
|------|-------|-------------|
| 1 | Base | EXPLAIN ANALYZE + parse metrics + score + rules |
| 2 | Environment | Collect MySQL config (buffer pool, InnoDB, cache warmth) |
| 3 | Execution Profile | Nested loop depth, B-tree depths, physical reads, complexity |
| 4 | Index Cardinality | Per-table index statistics and selectivity |
| 5 | Cardinality Drift | Estimated vs actual rows divergence |
| 6 | Join Analysis | Join strategy, fan-outs, join order |
| 7 | Anti-Patterns | 10 SQL anti-patterns (SELECT *, leading wildcard, etc.) |
| 8 | Index Synthesis | ERS-ordered composite index recommendations |
| 9 | Memory Pressure | Sort/join/temp buffers, concurrency-adjusted footprint |
| 10 | Concurrency Risk | Lock scope, deadlock risk, contention scoring |
| 11 | Plan Stability | Plan flip risk, volatility score, optimizer hints |
| 12 | Regression Safety | Implicit type conversions, collation mismatches |
| 13 | Confidence Score | 8-factor trustworthiness rating |
| 14 | Regression Baselines | Score/time/rows changes vs historical baseline |
| 15 | Hypothetical Indexes | Before/after EXPLAIN simulation (local/testing) |
| 16 | Workload Patterns | Repeated exports, API bursts, large transfers |
| 17 | Complexity | Scan + sort complexity classification |
| 18 | Explain Why | Human-readable insight (index choice, filesort reason, etc.) |
| 19 | Root-cause suppression | Remove misleading generic findings |
| 20 | Finding deduplication | Merge overlapping recommendations |
| 21 | Confidence gating | Downgrade severity when confidence is low |
| 22 | Consistency validation | Log-only internal coherence check |

### Cardinality Drift Detection

Compares optimizer row estimates against actual rows from EXPLAIN ANALYZE. Large deviations indicate stale statistics.

```php
$diagnostic->cardinalityDrift;
// [
//     'composite_drift_score' => 0.35,
//     'per_table' => [
//         'orders' => [
//             'estimated_rows' => 1000,
//             'actual_rows' => 5200,
//             'drift_ratio' => 0.81,
//             'direction' => 'under_estimated',
//             'severity' => 'warning',
//         ],
//     ],
//     'tables_needing_analyze' => ['orders'],
// ]
```

Config: `cardinality_drift.warning_threshold` (default 0.5), `cardinality_drift.critical_threshold` (default 0.9).

### Anti-Pattern Detection

Static SQL analysis for 10 common performance anti-patterns:

| Pattern | Severity | Why It Matters |
|---------|----------|---------------|
| `SELECT *` | Warning | Prevents covering index optimization |
| Functions on indexed columns | Warning | Breaks index usage (e.g., `WHERE YEAR(created_at) = 2026`) |
| Excessive OR chains | Warning | Inefficient range scans (threshold: 3+) |
| Correlated subqueries | Warning | Executes once per outer row |
| `NOT IN` with subquery | Warning | NULL handling issues, anti-join problems |
| Leading wildcard LIKE | Warning | Forces full table scan (`LIKE '%term'`) |
| Missing LIMIT on large result | Optimization | Unbounded memory consumption |
| `ORDER BY RAND()` | Warning | O(n log n) full sort |
| Redundant DISTINCT | Optimization | Unnecessary with PRIMARY/UNIQUE key |
| Implicit type conversion | Warning | Prevents index usage |

Config: `anti_patterns.or_chain_threshold` (default 3), `anti_patterns.missing_limit_row_threshold` (default 10000).

### Index Synthesis

Recommends optimal composite indexes using the **ERS principle** (Equality, Range, Sort, Select columns):

```php
$diagnostic->indexSynthesis;
// [
//     'recommendations' => [
//         [
//             'table' => 'orders',
//             'columns' => ['status', 'created_at', 'total'],
//             'type' => 'covering',
//             'ddl' => 'CREATE INDEX idx_orders_status_created_total ON orders(status, created_at, total)',
//             'estimated_improvement' => 'high',
//             'rationale' => 'Covers WHERE equality + range + SELECT columns',
//         ],
//     ],
// ]
```

Config: `index_synthesis.max_recommendations` (default 3), `index_synthesis.max_columns_per_index` (default 5).

### Confidence Scoring

Attaches a trustworthiness score (0-1.0) to the analysis based on 8 weighted factors:

| Factor | Weight | Measures |
|--------|--------|---------|
| Estimation accuracy | 25% | 1.0 minus composite drift score |
| Sample size | 20% | Actual rows (1.0 at 1000+ rows) |
| EXPLAIN ANALYZE available | 15% | 1.0 if supported, 0.3 otherwise |
| Cache warmth | 10% | 1.0 if buffer pool > 50% utilized |
| Statistics freshness | 10% | Ratio of non-stale tables |
| Plan stability | 10% | 1.0 if stable, 0.5 if flip risk |
| Query complexity | 5% | 0.7 if > 3 joins |
| Driver capabilities | 5% | Full support = 1.0 |

Labels: **high** (90%+), **moderate** (70-89%), **low** (50-69%), **unreliable** (<50%).

When confidence is low, findings are automatically downgraded (Critical to Warning at <70%, Critical/Warning down one level at <50%).

### Concurrency Risk Analysis

Evaluates lock contention, deadlock potential, and isolation impact:

```php
$diagnostic->concurrencyRisk;
// [
//     'lock_scope' => 'none',          // none, row, gap, range, table
//     'deadlock_risk' => 0.0,          // 0-1.0
//     'deadlock_risk_label' => 'low',  // low, moderate, high
//     'contention_score' => 0.0,
//     'isolation_impact' => 'MVCC consistent read — no locking',
//     'recommendations' => [],
// ]
```

### Memory Pressure Analysis

Estimates query memory footprint under concurrency:

```php
$diagnostic->memoryPressure;
// [
//     'memory_risk' => 'moderate',
//     'total_estimated_bytes' => 67108864,
//     'buffer_pool_pressure' => 0.15,
//     'network_pressure' => 'MODERATE',
//     'components' => [
//         'sort_buffer' => 2097152,
//         'join_buffers' => 524288,
//         'temp_table' => 8388608,
//     ],
//     'concurrency_adjusted' => [
//         'concurrent_sessions' => 10,
//         'concurrent_execution_memory' => 109051904,
//         'concurrent_network_transfer' => 524288000,
//     ],
// ]
```

Network pressure levels: **LOW** (<50MB), **MODERATE** (50-100MB), **HIGH** (100-200MB), **CRITICAL** (>200MB).

### Regression Baselines

Tracks query performance over time. Each `diagnose()` call saves a snapshot. Subsequent runs compare against the baseline to detect regressions.

```php
$diagnostic->regression;
// [
//     'has_baseline' => true,
//     'baseline_count' => 5,
//     'trend' => 'stable',           // stable, improving, degrading
//     'regressions' => [],           // Score/time/rows degradations
//     'improvements' => [
//         ['metric' => 'execution_time', 'baseline_value' => 12.5, 'current_value' => 8.3, 'change_pct' => -33.6],
//     ],
// ]
```

Smart regression detection:
- Normalizes for data growth (if rows grew >20%, checks per-row cost instead)
- Ignores sub-millisecond timing jitter (noise floor: 3ms)
- Detects plan changes (access type downgrades like `ref` to `ALL`)

Config: `regression.score_warning_threshold` (default 10%), `regression.time_warning_threshold` (default 50%).

### Hypothetical Index Simulation

Creates temporary indexes, runs EXPLAIN, compares before/after, then drops them. Only runs in local/testing environments.

```php
// Enable in config
'hypothetical_index' => [
    'enabled' => true,
    'allowed_environments' => ['local', 'testing'],
],
```

```php
$diagnostic->hypotheticalIndexes;
// [
//     'simulations' => [
//         [
//             'index_ddl' => 'CREATE INDEX idx_orders_status_created ON orders(status, created_at)',
//             'before' => ['access_type' => 'ALL', 'rows' => 50000],
//             'after' => ['access_type' => 'ref', 'rows' => 150],
//             'improvement' => 'significant',
//             'validated' => true,
//         ],
//     ],
//     'best_recommendation' => 'CREATE INDEX idx_orders_status_created ON orders(status, created_at)',
// ]
```

Improvement levels: **significant** (access type improved), **moderate** (>50% row reduction), **marginal** (>10%), **none**.

### Workload Pattern Detection

Tracks query execution patterns over time to detect systemic issues:

| Pattern | Severity | Triggers When |
|---------|----------|--------------|
| `REPEATED_FULL_EXPORT` | Critical | 100K+ row query executed 10+ times with 3+ full exports |
| `HIGH_FREQUENCY_LARGE_TRANSFER` | Warning | >50MB network transfer, 10+ executions |
| `API_MISUSE_BURST` | Warning | 5+ executions within 60 seconds |

Config: `workload.frequency_threshold` (default 10), `workload.export_row_threshold` (default 100K).

### Plan Stability Analysis

Detects optimizer plan flip risk from estimation deviations:

```php
$diagnostic->stabilityAnalysis;
// [
//     'volatility_score' => 25,        // 0-100
//     'volatility_label' => 'stable',  // stable (<30), moderate (30-59), volatile (60+)
//     'plan_flip_risk' => [
//         'is_risky' => false,
//         'deviations' => [],
//     ],
//     'optimizer_hints' => [],          // USE INDEX, FORCE INDEX, STRAIGHT_JOIN
//     'statistics_drift' => [],
// ]
```

---

## Report Reference

### Report Object (Single Query)

Returned by `analyzeSql()` and `analyzeBuilder()`:

```php
$report->grade;            // string — 'A', 'B', 'C', 'D', or 'F'
$report->compositeScore;   // float — 0.0 to 100.0
$report->passed;           // bool — true if no critical findings
$report->summary;          // string — human-readable summary
$report->recommendations;  // string[] — actionable suggestions
$report->scalability;      // array — growth projections
$report->mode;             // string — 'sql', 'builder', or 'profiler'
$report->analyzedAt;       // DateTimeImmutable

$report->toArray();
$report->toJson(JSON_PRETTY_PRINT);
$report->findingCounts();  // ['critical' => 0, 'warning' => 1, ...]
```

### DiagnosticReport Object (Full Diagnostics)

Returned by `diagnose()`:

```php
$diagnostic->report;              // Report — base analysis
$diagnostic->findings;            // Finding[] — severity-sorted
$diagnostic->environment;         // ?EnvironmentContext
$diagnostic->executionProfile;    // ?ExecutionProfile
$diagnostic->indexAnalysis;       // ?array
$diagnostic->joinAnalysis;        // ?array
$diagnostic->stabilityAnalysis;   // ?array
$diagnostic->safetyAnalysis;      // ?array
$diagnostic->cardinalityDrift;    // ?array
$diagnostic->antiPatterns;        // ?array
$diagnostic->indexSynthesis;      // ?array
$diagnostic->confidence;          // ?array
$diagnostic->concurrencyRisk;     // ?array
$diagnostic->memoryPressure;      // ?array
$diagnostic->regression;          // ?array
$diagnostic->hypotheticalIndexes; // ?array
$diagnostic->workload;            // ?array

$diagnostic->effectiveGrade();          // Confidence-capped grade
$diagnostic->effectiveCompositeScore(); // Confidence-capped score
$diagnostic->findingsByCategory('anti_pattern');
$diagnostic->findingCounts();           // By severity
$diagnostic->worstSeverity();

$diagnostic->toArray();
$diagnostic->toJson(JSON_PRETTY_PRINT);
```

### ProfileReport Object (Multiple Queries)

Returned by `profile()` and `profileClass()`:

```php
$profile->totalQueries;       // int
$profile->analyzedQueries;    // int — SELECT queries analyzed
$profile->cumulativeTimeMs;   // float
$profile->slowestQuery;       // ?Report
$profile->worstQuery;         // ?Report — lowest score
$profile->duplicateQueries;   // array — normalized SQL => count
$profile->nPlusOneDetected;   // bool
$profile->individualReports;  // Report[]
$profile->skippedQueries;     // string[] — non-SELECT queries

$profile->worstGrade();
$profile->hasCriticalFindings();
```

### Grading System

| Grade | Score Range | Meaning                                 |
| ----- | ----------- | --------------------------------------- |
| **A+** | 98 - 100   | Perfect — optimal execution plan        |
| **A**  | 90 - 97    | Excellent — well-optimized query        |
| **B**  | 75 - 89    | Good — minor optimization opportunities |
| **C**  | 50 - 74    | Fair — notable performance issues       |
| **D**  | 25 - 49    | Poor — significant performance problems |
| **F**  | 0 - 24     | Critical — severe performance issues    |

Score modifiers:
- **Context override** promotes to A (95+) when: LIMIT-optimized + covering index + no filesort + <10ms
- **Dataset dampening** applies log10 formula for large unbounded result sets
- **Confidence gating** caps grade when analysis confidence is low

### Scoring Components

| Component         | Default Weight | What It Measures                           |
| ----------------- | -------------- | ------------------------------------------ |
| `execution_time`  | 30%            | Query execution speed (3-regime model)     |
| `scan_efficiency` | 25%            | Ratio of rows returned vs rows examined    |
| `index_quality`   | 20%            | Index usage, covering index, access type   |
| `join_efficiency` | 15%            | Join type quality and nested loop depth    |
| `scalability`     | 10%            | Complexity class projection at scale       |

### Metrics Extracted

| Metric                  | Type     | Description                                        |
| ----------------------- | -------- | -------------------------------------------------- |
| `execution_time_ms`     | float    | EXPLAIN ANALYZE execution time                     |
| `rows_examined`         | int      | Total rows read from storage                       |
| `rows_returned`         | int      | Rows returned to client                            |
| `selectivity_ratio`     | float    | rows_examined / rows_returned                      |
| `complexity`            | string   | `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)` |
| `has_table_scan`        | bool     | Full table scan detected                           |
| `has_filesort`          | bool     | External sort operation                            |
| `has_temp_table`        | bool     | Temporary table created                            |
| `has_disk_temp`         | bool     | Temp table spilled to disk                         |
| `has_weedout`           | bool     | Semi-join weedout optimization                     |
| `has_index_merge`       | bool     | Index merge optimization                           |
| `has_covering_index`    | bool     | Query served entirely from index                   |
| `has_early_termination` | bool     | LIMIT-optimized early stop                         |
| `is_index_backed`       | bool     | Uses any index                                     |
| `is_intentional_scan`   | bool     | Full dataset retrieval (no WHERE, no LIMIT)        |
| `indexes_used`          | string[] | Index names used                                   |
| `tables_accessed`       | string[] | Table names accessed                               |

---

## Built-in Rules

| Rule                      | Severity         | Triggers When                                   |
| ------------------------- | ---------------- | ----------------------------------------------- |
| `FullTableScanRule`       | Critical         | Full table scan on > 10,000 rows                |
| `NoIndexRule`             | Critical         | No index used at all                            |
| `TempTableRule`           | Critical/Warning | Temporary table created (critical if on disk)   |
| `QuadraticComplexityRule` | Critical         | O(n^2) complexity detected                      |
| `DeepNestedLoopRule`      | Warning          | Nested loop depth exceeds threshold (default 4) |
| `StaleStatsRule`          | Warning          | Table statistics appear outdated                 |
| `LimitIneffectiveRule`    | Warning          | LIMIT clause doesn't prevent full scan          |
| `IndexMergeRule`          | Info             | Index merge optimization detected               |
| `WeedoutRule`             | Info             | Semi-join weedout strategy detected             |

---

## Custom Rules

Extend `BaseRule`:

```php
use QuerySentinel\Rules\BaseRule;

class SlowQueryRule extends BaseRule
{
    public function evaluate(array $metrics): ?array
    {
        $time = $metrics['execution_time_ms'] ?? 0;

        if ($time > 500) {
            return $this->finding(
                severity: 'critical',
                title: 'Slow query detected',
                description: sprintf('Query took %.0fms.', $time),
                recommendation: 'Add indexes or optimize the query.',
            );
        }

        return null;
    }

    public function key(): string { return 'slow_query'; }
    public function name(): string { return 'Slow Query Detection'; }
}
```

Register in config:

```php
'rules' => [
    'enabled' => [
        // Built-in rules...
        \App\QueryRules\SlowQueryRule::class,
    ],
],
```

---

## Extension Points

### Custom Drivers

Implement `DriverInterface` for other databases:

```php
use QuerySentinel\Contracts\DriverInterface;

$this->app->singleton(DriverInterface::class, MyCustomDriver::class);
```

### Custom Scoring Engine

Implement `ScoringEngineInterface`:

```php
use QuerySentinel\Contracts\ScoringEngineInterface;

$this->app->singleton(ScoringEngineInterface::class, MyCustomScoringEngine::class);
```

---

## Architecture

```
src/
├── Adapters/                  # Input adapters (Builder, Profiler, ClassMethod, SQL)
├── Analyzers/                 # 16 deep analyzers (cardinality, anti-patterns, memory, etc.)
├── Attributes/
│   ├── DiagnoseQuery.php      #   CLI scanning attribute (#[DiagnoseQuery])
│   └── QueryDiagnose.php      #   Runtime profiling attribute (#[QueryDiagnose])
├── Console/
│   ├── DiagnoseQueryCommand.php  # query:diagnose (raw SQL)
│   ├── ScanCommand.php           # query:scan (interactive builder diagnosis)
│   └── ReportRenderer.php        # 19-section console formatter
├── Contracts/                 # Interfaces (Driver, Analyzer, Scoring, etc.)
├── Core/
│   ├── Engine.php             #   Unified entry (5 modes + 22-step diagnose pipeline)
│   ├── ProfileReport.php      #   Multi-query aggregate report
│   └── QueryAnalyzer.php      #   Core 9-step analysis pipeline
├── Drivers/                   # MySQL, PostgreSQL, SQLite
├── Enums/                     # Severity, ComplexityClass
├── Exceptions/                # UnsafeQuery, PerformanceViolation, EngineAbort
├── Facades/                   # QuerySentinel, QueryDiagnostics
├── Interception/              # Runtime profiling (MethodInterceptor, Middleware, QueryCaptor)
├── Logging/                   # Structured JSON logging
├── Parsers/                   # EXPLAIN plan parser
├── Rules/                     # 9 built-in rules + RuleRegistry
├── Scanner/
│   ├── AttributeScanner.php   #   Discovers #[DiagnoseQuery] methods
│   └── ScannedMethod.php      #   Discovered method DTO
├── Scoring/                   # DefaultScoringEngine, ConfidenceScorer
├── Support/                   # Finding, DiagnosticReport, ExecutionGuard, SqlParser, etc.
└── QueryDiagnosticsServiceProvider.php
```

### Design Principles

- **Framework-agnostic core** — `QueryAnalyzer` operates on SQL strings with no Laravel dependency
- **Lazy adapter loading** — Adapters instantiated only when their Engine methods are called
- **Safety first** — `ExecutionGuard` blocks destructive SQL; `ProfilerAdapter` wraps in transaction+rollback
- **Zero overhead** — Non-attributed methods pass through with only a cached reflection lookup
- **Confidence-aware** — All findings are gated by analysis confidence; low confidence auto-downgrades severity
- **Root-cause-aware** — Generic index findings suppressed when the real issue is function wrapping or leading wildcard

---

## Testing

```bash
# Run all tests (849 tests, 2270 assertions)
vendor/bin/phpunit

# Run by suite
vendor/bin/phpunit --testsuite=Unit
vendor/bin/phpunit --testsuite=Feature

# Run specific test
vendor/bin/phpunit --filter=AttributeScannerTest

# Code style
vendor/bin/pint

# Static analysis (PHPStan level 6)
vendor/bin/phpstan analyse
```

---

## License

MIT
