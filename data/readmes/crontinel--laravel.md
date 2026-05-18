# Crontinel Laravel

[![Latest Version](https://img.shields.io/packagist/v/crontinel/laravel.svg)](https://packagist.org/packages/crontinel/laravel)
[![CI](https://github.com/crontinel/laravel/actions/workflows/ci.yml/badge.svg)](https://github.com/crontinel/laravel/actions/workflows/ci.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/crontinel/laravel.svg)](https://packagist.org/packages/crontinel/laravel)
[![PHP](https://img.shields.io/badge/PHP-8.2%20%7C%208.3%20%7C%208.4-blue)](https://packagist.org/packages/crontinel/laravel)
[![Laravel](https://img.shields.io/badge/Laravel-11%20%7C%2012%20%7C%2013-red)](https://packagist.org/packages/crontinel/laravel)
[![License](https://img.shields.io/github/license/crontinel/laravel.svg)](LICENSE)

**Background job and cron monitoring for Laravel.** Monitors Horizon internals, queue depth, and cron health — things generic monitors can't see.

> Cronitor tells you a job ran. Crontinel tells you your Horizon supervisor is paused.

---

## What it monitors

| Monitor | What it sees |
|---|---|
| **Horizon** | Supervisor status per supervisor (not just "Horizon is running"), paused state, failed jobs per minute |
| **Queues** | Depth per queue, failed count, oldest job age — Redis and database drivers |
| **Cron jobs** | Every scheduled command run: exit code, duration, late detection |

---

## Requirements

- PHP 8.2, 8.3, or 8.4
- Laravel 11, 12, or 13

---

## Installation

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

That's it. Visit `/crontinel` in your browser.

`crontinel:install` publishes the config file and runs the migration for the `crontinel_runs` table.

**Cron run tracking is automatic** — Crontinel listens to Laravel's `ScheduledTaskFinished` and `ScheduledTaskFailed` events. No wrapping or modification of your scheduled commands needed.

---

## CLI health check

```bash
# Table output (human-readable)
php artisan crontinel:check

# JSON output (for CI/CD integration)
php artisan crontinel:check --format=json

# Check without firing alerts
php artisan crontinel:check --no-alerts
```

Exits with code `0` when all monitors are healthy, `1` if any alert is active. Use this in CI or monitoring pipelines.

---

## Configuration

After install, edit `config/crontinel.php`:

```php
return [
    // Dashboard URL path (default: /crontinel)
    'path' => env('CRONTINEL_PATH', 'crontinel'),

    // Dashboard middleware
    'middleware' => ['web', 'auth'],

    // Connect to Crontinel SaaS for multi-app hosted dashboards (optional)
    'saas_key' => env('CRONTINEL_API_KEY'),
    'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),

    'horizon' => [
        'enabled'                          => true,
        'supervisor_alert_after_seconds'   => 60,
        'failed_jobs_per_minute_threshold' => 5,
        'connection'                       => 'horizon', // Redis connection name for Horizon
    ],

    'queues' => [
        'enabled'                 => true,
        'watch'                   => [],    // empty = auto-discover
        'depth_alert_threshold'   => 1000,
        'wait_time_alert_seconds' => 300,
    ],

    'cron' => [
        'enabled'                  => true,
        'late_alert_after_seconds' => 120,
        'retain_days'              => 30,
    ],

    'alerts' => [
        'channel' => env('CRONTINEL_ALERT_CHANNEL'), // 'slack' or 'mail'
        'mail'  => ['to' => env('CRONTINEL_ALERT_EMAIL')],
        'slack' => ['webhook_url' => env('CRONTINEL_SLACK_WEBHOOK')],
    ],
];
```

### Environment variables

```env
# Dashboard path (optional)
CRONTINEL_PATH=crontinel

# Alerts — set channel to 'slack' or 'mail'
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/...
CRONTINEL_ALERT_EMAIL=ops@yourcompany.com

# SaaS reporting (optional)
CRONTINEL_API_KEY=your-api-key
```

---

## Alerts

Crontinel fires alerts when:

- Horizon is stopped or paused
- A supervisor process goes down
- Failed jobs per minute exceeds threshold
- Queue depth or oldest job age exceeds threshold
- A scheduled command exits with non-zero code
- A scheduled command is late (missed its expected run window)

Alerts **auto-resolve** and send a "resolved" notification when the issue clears.

**Alert deduplication:** The same alert won't fire more than once per 5 minutes for the same issue.

---

## Not using Horizon?

Set `horizon.enabled = false` in config. Queue and cron monitoring work independently of Horizon.

---

## Connecting to Crontinel SaaS

The OSS package works standalone. To get multi-app hosted dashboards, longer history, and team access, visit [crontinel.com](https://crontinel.com) to join the early access list.

---

## License

MIT — free forever. See [LICENSE](LICENSE).

Built by [Harun R Rayhan](https://github.com/HarunRRayhan) · [crontinel.com](https://crontinel.com)
