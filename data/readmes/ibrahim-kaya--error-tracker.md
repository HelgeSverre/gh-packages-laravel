# Laravel Error Tracker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ibrahim-kaya/error-tracker.svg?style=flat-square)](https://packagist.org/packages/ibrahim-kaya/error-tracker)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.0-blue?style=flat-square)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-9%20%7C%2010%20%7C%2011%20%7C%2012-red?style=flat-square)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Turkish documentation:** [README.tr.md](README.tr.md)

A professional Laravel package that automatically captures, deduplicates, and stores all unhandled exceptions to the database — giving you a persistent, queryable history of every error your application encounters.

---

## Features

- **Zero-configuration capture** — automatically intercepts all unhandled exceptions via Laravel's `reportable()` hook. No changes to `Handler.php` or `bootstrap/app.php` required.
- **Smart deduplication** — identical errors (same class + message + file + line) are grouped into a single record. Only the occurrence count and last-seen timestamp update on repeat occurrences.
- **Manual capture** — catch blocks can report exceptions with one line using the `ErrorTracker::capture()` facade or Laravel's built-in `report()` helper.
- **Per-call severity override** — override the severity level for a specific capture call: `ErrorTracker::capture($e, ['severity' => 'critical'])`.
- **Full HTTP context** — stores the URL, HTTP method, client IP, user agent, authenticated user ID, sanitized request input, and selected headers alongside each error.
- **CLI & queue support** — exceptions from Artisan commands and queued jobs are captured with null HTTP fields.
- **PSR-3 severity levels** — configurable severity mapping by exception class (debug → emergency).
- **Status lifecycle** — triage errors as `open`, `resolved`, or `ignored` directly on the model.
- **Rich statistics** — 10+ static methods on the `ErrorLog` model for building dashboards and reports.
- **Artisan commands** — `error-tracker:stats` and `error-tracker:clear` for CLI management.
- **Async queue support** — writes can be dispatched asynchronously to keep response times fast.
- **Rate limiting** — prevents the same error from flooding the queue during bursts. Each unique fingerprint is throttled to a configurable number of dispatches per time window using the Laravel cache.
- **Privacy first** — configurable field exclusion (passwords, tokens, payment data) and a header whitelist.
- **Laravel 9 / 10 / 11 / 12 compatible.**

---

## Requirements

| Dependency | Version |
|------------|---------|
| PHP        | >= 8.0  |
| Laravel    | 9, 10, 11, or 12 |

---

## Installation

### 1. Install via Composer

```bash
composer require ibrahim-kaya/error-tracker
```

### 2. Run the migration

```bash
php artisan migrate
```

### 3. (Optional) Publish the configuration file

```bash
php artisan vendor:publish --tag=error-tracker-config
```

This copies the config file to `config/error-tracker.php` where you can customize it.

> The package works out of the box without publishing the config — sensible defaults are applied automatically.

---

## Configuration

After publishing the config, open `config/error-tracker.php`:

```php
return [

    // Toggle error tracking on/off without uninstalling the package.
    // Env key: ERROR_TRACKER_ENABLED
    'enabled' => env('ERROR_TRACKER_ENABLED', true),

    // Exception classes (and their subclasses) that should NOT be tracked.
    'excluded_exceptions' => [
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Session\TokenMismatchException::class,
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException::class,
    ],

    // Dispatch the DB write via a queue worker (true) or synchronously (false).
    // Env key: ERROR_TRACKER_QUEUE
    'use_queue' => env('ERROR_TRACKER_QUEUE', true),

    // Queue name to dispatch jobs onto.
    // Env key: ERROR_TRACKER_QUEUE_NAME
    'queue' => env('ERROR_TRACKER_QUEUE_NAME', 'default'),

    // Store sanitized request input alongside each error.
    'log_request_input' => true,

    // These request fields are always stripped before storage.
    'excluded_input_fields' => [
        'password', 'password_confirmation', 'token', '_token',
        'credit_card', 'cvv', 'card_number', 'ssn',
    ],

    // Store selected request headers (disabled by default for security).
    'log_request_headers' => false,

    // Only these headers are ever stored when log_request_headers is true.
    'logged_headers' => ['accept', 'accept-language', 'content-type', 'referer', 'origin'],

    // Map exception classes to PSR-3 severity levels.
    // Uses instanceof — parent classes cover all subclasses.
    'severity_map' => [
        \Illuminate\Database\QueryException::class => 'critical',
        \Illuminate\Database\Eloquent\ModelNotFoundException::class => 'warning',
        \Symfony\Component\HttpKernel\Exception\HttpException::class => 'warning',
    ],
];
```

### Environment Variables

| Key | Default | Description |
|-----|---------|-------------|
| `ERROR_TRACKER_ENABLED` | `true` | Enable or disable tracking |
| `ERROR_TRACKER_QUEUE` | `true` | Use queue for async writes |
| `ERROR_TRACKER_QUEUE_NAME` | `default` | Queue name for jobs |

---

## Usage

### Automatic Capture

Once installed, **nothing extra is needed**. All unhandled exceptions are automatically intercepted and stored. The package registers a `reportable()` callback through the ServiceProvider — your existing `Handler.php` or `bootstrap/app.php` is never modified.

### Manual Capture from Try-Catch Blocks

#### Option A — ErrorTracker Facade

```php
use IbrahimKaya\ErrorTracker\Facades\ErrorTracker;

try {
    $this->processPayment($order);
} catch (\Exception $e) {
    // Capture and continue — will not re-throw
    ErrorTracker::capture($e);

    return response()->json(['error' => 'Payment failed, please retry.'], 500);
}
```

#### Option B — Per-call Severity Override

```php
use IbrahimKaya\ErrorTracker\Facades\ErrorTracker;

try {
    $this->syncInventory();
} catch (\Exception $e) {
    // Override the severity level for this specific capture
    ErrorTracker::capture($e, ['severity' => 'critical']);
}
```

#### Option C — Laravel's Built-in `report()` Helper

Laravel's `report()` helper also triggers the package's `reportable()` callback:

```php
try {
    $this->sendWelcomeEmail($user);
} catch (\Exception $e) {
    report($e); // Works with ErrorTracker automatically
    // continue with the request...
}
```

---

### Querying Errors

Use the `ErrorLog` Eloquent model directly:

```php
use IbrahimKaya\ErrorTracker\Models\ErrorLog;

// Get all open errors, most recent first
$errors = ErrorLog::open()->orderByDesc('last_seen_at')->get();

// Get only critical errors
$critical = ErrorLog::withSeverity('critical')->get();

// Get errors for a specific exception class
$queryErrors = ErrorLog::forExceptionClass(\Illuminate\Database\QueryException::class)->get();

// Get errors within a date range
$rangeErrors = ErrorLog::dateRange('2024-01-01', '2024-03-31')->get();

// Find a specific error by fingerprint
$error = ErrorLog::where('fingerprint', $hash)->first();
```

### Status Management

```php
$error = ErrorLog::find(1);

// Mark as resolved — resolves and records resolved_at
$error->markResolved();

// Mark as ignored — records ignored_at
$error->markIgnored();

// Reopen a resolved or ignored error
$error->reopen();
```

---

### Statistics

All statistics are available as static methods on the `ErrorLog` model:

```php
use IbrahimKaya\ErrorTracker\Models\ErrorLog;

// Counts
ErrorLog::totalErrors();                // Total unique error groups
ErrorLog::totalErrors('open');          // Only open errors
ErrorLog::totalOccurrences();           // Sum of all occurrence counts
ErrorLog::openErrorCount();
ErrorLog::resolvedErrorCount();
ErrorLog::ignoredErrorCount();

// Rankings
ErrorLog::mostFrequent(10);             // Top 10 most-occurring errors
ErrorLog::mostRecent(10);               // Top 10 most recently seen

// Grouped aggregations
ErrorLog::statisticsByExceptionClass(5);  // Top 5 exception classes
ErrorLog::statisticsBySeverity();         // Counts grouped by severity
ErrorLog::statisticsByStatus();           // Counts grouped by status
ErrorLog::statisticsByFile(10);          // Top 10 most error-prone files

// Trends
ErrorLog::dailyStatistics(30);           // Daily counts for last 30 days
ErrorLog::errorsByDateRange('2024-01-01', '2024-12-31', 'open');

// Dashboard — single call that returns all of the above
$summary = ErrorLog::summaryStatistics(30);
// Returns: total_errors, total_occurrences, open_errors, resolved_errors,
//          ignored_errors, by_severity, by_exception_class, most_frequent,
//          most_recent, daily_trend
```

---

## Artisan Commands

### View Statistics

```bash
php artisan error-tracker:stats
php artisan error-tracker:stats --days=7
```

**Example output:**

```
  Error Tracker Statistics (last 30 days)
  ──────────────────────────────────────────────────────

  Overview
  Total unique errors:   42
  Total occurrences:     317

  Open:                  28
  Resolved:              10
  Ignored:               4

  By Severity
  +----------+--------------+--------------------+
  | Severity | Error Groups | Total Occurrences  |
  +----------+--------------+--------------------+
  | critical | 5            | 134                |
  | error    | 30           | 162                |
  | warning  | 7            | 21                 |
  +----------+--------------+--------------------+

  Top 5 Exception Classes
  +--------------------------------------------+--------+-------------+
  | Exception Class                            | Groups | Occurrences |
  +--------------------------------------------+--------+-------------+
  | Illuminate\Database\QueryException         | 5      | 134         |
  | ErrorException                             | 12     | 89          |
  +--------------------------------------------+--------+-------------+
```

### Clear Error Logs

```bash
# Delete all error logs (with confirmation prompt)
php artisan error-tracker:clear

# Delete only resolved errors
php artisan error-tracker:clear --status=resolved

# Delete resolved errors older than 30 days
php artisan error-tracker:clear --status=resolved --older-than=30

# Skip the confirmation prompt (for scheduled tasks)
php artisan error-tracker:clear --status=resolved --older-than=90 --force
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--status` | *(all)* | Filter by status: `open`, `resolved`, or `ignored` |
| `--older-than` | `0` | Only delete records last seen more than N days ago |
| `--force` | `false` | Skip the confirmation prompt |

---

## Laravel Compatibility

| Laravel | PHP | Supported |
|---------|-----|-----------|
| 9.x     | 8.0, 8.1 | ✅ |
| 10.x    | 8.1, 8.2 | ✅ |
| 11.x    | 8.2, 8.3 | ✅ |
| 12.x    | 8.2, 8.3, 8.4 | ✅ |

The package uses `ExceptionHandler::reportable()`, which has been available since Laravel 8 and works identically across all supported versions — including Laravel 11+'s new `bootstrap/app.php` skeleton.

---

## Security & Privacy

### What is stored

| Field | Description |
|-------|-------------|
| Exception class | The PHP class name of the exception |
| Message | The exception message text |
| File & line | Where in the codebase the exception occurred |
| Stack trace | Function call chain (arguments excluded) |
| URL, method | The request URL and HTTP verb |
| IP address | Client IP, supports IPv6 |
| User agent | Browser string |
| User ID | Authenticated user's ID (cast to string) |
| Request input | Sanitized — sensitive fields stripped |
| Headers | Only whitelisted headers when enabled |

### What is never stored

- Raw passwords or any field listed in `excluded_input_fields`
- `Authorization` headers, cookies, or session data
- Stack frame arguments (can contain models, closures, or large objects)
- File upload objects

### Rate Limiting

Rate limiting prevents the same error from flooding the queue and database when it fires thousands of times per second (e.g. an exception inside a loop).

**How it works:**
Each unique fingerprint is tracked in the Laravel cache. Once it is captured more than `max_attempts` times within `decay_seconds`, further dispatches are silently dropped until the window resets. The error group is still correctly recorded — only excess job dispatches are suppressed.

```php
// config/error-tracker.php
'rate_limiting' => [
    'enabled'        => env('ERROR_TRACKER_RATE_LIMITING', true),
    'max_attempts'   => 5,   // allow up to 5 dispatches per window
    'decay_seconds'  => 60,  // window resets after 60 seconds
],
```

```env
# Disable rate limiting entirely
ERROR_TRACKER_RATE_LIMITING=false
```

> **Note:** Rate limiting requires a cache driver that supports atomic increments (Redis, Memcached, or the database driver). If the cache driver is unavailable, the check fails open — captures are **never** dropped due to a cache failure.

---

### Excluding sensitive exception types

Add exception classes to the `excluded_exceptions` config key to prevent them from being tracked:

```php
'excluded_exceptions' => [
    \App\Exceptions\ExpectedBusinessException::class,
    \Illuminate\Validation\ValidationException::class,
    // ...
],
```

### Disabling tracking per environment

```env
# .env.local
ERROR_TRACKER_ENABLED=false
```

---

## Contributing

Contributions, issues, and feature requests are welcome. Please open an issue first to discuss what you would like to change.

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

**Author:** [İbrahim Kaya](https://ibrahimkaya.dev)
