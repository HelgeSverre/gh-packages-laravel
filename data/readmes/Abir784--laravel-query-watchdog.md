# Laravel Query Watchdog

 Laravel Query Watchdog is a Laravel 10-13 compatible package for monitoring slow database queries in production-like environments.

## Features

- Slow query capture
- SQL fingerprinting
- Aggregated percentile metrics
- Alert engine with cooldown and notification channels
- Regression detection by app version (p95 comparison)
- N+1 burst heuristic detection by request fingerprint repetition
- Dashboard with auth gate support
- One-command package installer

## Installation

```bash
composer require abirhossain/laravel-query-watchdog
```

```bash
php artisan query-watchdog:install --migrate
```

## Quick Start

1. Enable query monitoring and alerts in `.env`.
2. Configure dashboard access with allowed emails or a custom authorizer.
3. Generate traffic and open `/query-watchdog`.

Example `.env`:

```env
QUERY_WATCHDOG_ENABLED=true
QUERY_WATCHDOG_SLOW_QUERY_MS=200
QUERY_WATCHDOG_SAMPLE_RATE=0.02

QUERY_WATCHDOG_ALERTS_ENABLED=true
QUERY_WATCHDOG_ALERT_CHANNELS=log,slack
QUERY_WATCHDOG_ALERT_COOLDOWN_MINUTES=30
QUERY_WATCHDOG_REGRESSION_MULTIPLIER=2.0
QUERY_WATCHDOG_MIN_REGRESSION_MS=150
QUERY_WATCHDOG_ANALYSIS_WINDOW_MINUTES=60
QUERY_WATCHDOG_MIN_SAMPLES=20

QUERY_WATCHDOG_N_PLUS_ONE_ENABLED=true
QUERY_WATCHDOG_N_PLUS_ONE_MIN_REPETITIONS=12

QUERY_WATCHDOG_DASHBOARD_ALLOWED_EMAILS=dev1@company.com,dev2@company.com
QUERY_WATCHDOG_ALERT_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/REDACTED
```

## Notification Channel Abstraction

Channels are configured using `QUERY_WATCHDOG_ALERT_CHANNELS`.

- `log`
- `mail` (requires `QUERY_WATCHDOG_ALERT_MAIL_TO`)
- `slack` (requires `QUERY_WATCHDOG_ALERT_SLACK_WEBHOOK_URL`)

You can add custom channels by extending the dispatcher map in your app via container rebinding.

## Dashboard Authorization Gate

By default, dashboard routes are protected by:

- `web`
- `auth`
- `can:viewQueryWatchdog`

The package defines the `viewQueryWatchdog` gate and grants access when either:

1. app environment is local and `QUERY_WATCHDOG_DASHBOARD_ALLOW_LOCAL=true`
2. authenticated user email is listed in `QUERY_WATCHDOG_DASHBOARD_ALLOWED_EMAILS`
3. custom authorizer class (invokable) returns `true`

## Production Tuning Defaults

Recommended starting values:

- `QUERY_WATCHDOG_SLOW_QUERY_MS=250`
- `QUERY_WATCHDOG_SAMPLE_RATE=0.01`
- `QUERY_WATCHDOG_ALERT_COOLDOWN_MINUTES=30`
- `QUERY_WATCHDOG_REGRESSION_MULTIPLIER=2.0`
- `QUERY_WATCHDOG_MIN_SAMPLES=25`
- `QUERY_WATCHDOG_N_PLUS_ONE_MIN_REPETITIONS=15`
- `QUERY_WATCHDOG_RAW_RETENTION_DAYS=14`
- `QUERY_WATCHDOG_AGG_RETENTION_DAYS=90`

## Maintenance

Prune old records:

```bash
php artisan query-watchdog:prune
```

## Dashboard Column Reference

### Recent Fingerprints

| Column | Meaning |
| --- | --- |
| Hash | Short prefix of the fingerprint hash that identifies a normalized query shape. Click to open detail view. |
| Last Seen | Relative time since this fingerprint was last captured. |
| Latest Duration | Duration in milliseconds of the most recent event for this fingerprint. |
| Route / Command | Laravel route name or console command name associated with the latest event. `n/a` means context was not available. |

### Top Fingerprints

| Column | Meaning |
| --- | --- |
| Fingerprint | Fingerprint hash preview and a truncated canonical SQL shape for grouped queries. |
| Operation | SQL operation type detected from normalized SQL (`select`, `insert`, `update`, `delete`, or `other`). |
| Count | Total sampled/captured event count for this fingerprint in the selected window. |
| Max p95 (ms) | Highest p95 latency bucket recorded in the selected window. Useful for tail-latency monitoring. |
| Max duration (ms) | Single highest event duration recorded for this fingerprint in the selected window. |

### Fingerprint Detail: Recent Aggregates

| Column | Meaning |
| --- | --- |
| Bucket | Minute-level aggregation timestamp for the metric row. |
| Count | Number of events captured in that bucket. |
| Slow | Number of events in that bucket with duration greater than or equal to `QUERY_WATCHDOG_SLOW_QUERY_MS`. |
| p50 | Median latency (50th percentile) for events in the bucket. |
| p95 | 95th percentile latency for events in the bucket. |
| p99 | 99th percentile latency for events in the bucket. |
| Avg | Arithmetic mean latency for events in the bucket. |
| Max | Highest single-event latency in the bucket. |

### Fingerprint Detail: Recent Events

| Column | Meaning |
| --- | --- |
| Time | Timestamp when the query event was captured. |
| Duration | Single event duration in milliseconds. |
| Connection | Database connection name used by the query. |
| Route / Command | Route or command context tied to this event. |
| SQL | Truncated raw SQL captured for that event. |
