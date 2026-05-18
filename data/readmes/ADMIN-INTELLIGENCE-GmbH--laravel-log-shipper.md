# Laravel Log Shipper

[![Tests](https://github.com/ADMIN-INTELLIGENCE-GmbH/laravel-log-shipper/actions/workflows/tests.yml/badge.svg)](https://github.com/ADMIN-INTELLIGENCE-GmbH/laravel-log-shipper/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/adminintelligence/laravel-log-shipper.svg)](https://packagist.org/packages/adminintelligence/laravel-log-shipper)
[![License](https://img.shields.io/packagist/l/adminintelligence/laravel-log-shipper.svg)](https://packagist.org/packages/adminintelligence/laravel-log-shipper)

A Laravel package that ships your application logs to a central server.

## Companion Service: Logger

This package is designed to work with [**Logger**](https://github.com/ADMIN-INTELLIGENCE-GmbH/logger) — a centralized log aggregation service built with Laravel.

**Logger provides:**
- **Web Dashboard** — Search, filter, and browse logs with pagination
- **Multi-Project Support** — Manage logs from multiple applications with isolated project keys
- **Failing Controllers Report** — Identify error hotspots by controller
- **Retention Policies** — Configurable per-project log retention (7, 14, 30, 90 days, or infinite)
- **Webhook Notifications** — Slack/Discord/Mattermost-compatible alerts for errors and critical events
- **Dark Mode** — Full dark theme support

> **Note:** You can also use this package with any HTTP endpoint that accepts JSON log payloads.

## Requirements

- PHP 8.1 or higher
- Laravel 10, 11, 12, or 13
- A queue driver (recommended: Redis, database, or SQS)

## Installation

```bash
composer require adminintelligence/laravel-log-shipper
```

If you installed `1.4.0`, upgrade to `1.4.1`. This is a corrective follow-up release and does not require configuration changes.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=log-shipper-config
```

Add the following to your `.env` file:

```
LOG_SHIPPER_ENABLED=true
LOG_SHIPPER_ENDPOINT=https://your-log-server.com/api/ingest
LOG_SHIPPER_KEY=your-project-api-key
LOG_SHIPPER_QUEUE=redis
LOG_SHIPPER_QUEUE_NAME=logs
```

### Upgrading Configuration

If you're upgrading from a previous version and want to use the new features (IP obfuscation, enhanced status metrics, etc.), republish the configuration file:

```bash
php artisan vendor:publish --tag=log-shipper-config --force
```

> **⚠️ Warning:** This will overwrite your existing `config/log-shipper.php` file. Make sure to back up any custom configurations first, or manually merge the new options from the [published config](https://github.com/ADMIN-INTELLIGENCE-GmbH/laravel-log-shipper/blob/main/config/log-shipper.php).

> **Note:** Upgrading from `1.4.0` to `1.4.1` does not require republishing the configuration. `1.4.1` is a corrective release for packaging, lint compatibility, and release quality.

**New configuration options in recent versions:**
- `ip_obfuscation` - Privacy-compliant IP address obfuscation
- `max_payload_size` - Payload size limiting for security
- `status.metrics.foldersize` - Folder size monitoring
- `status.metrics.node_npm` - Node.js and npm version detection
- `status.metrics.dependency_checks` - Outdated package detection
- `status.metrics.security_audits` - Security vulnerability scanning
- `status.monitored_folders` - Folders to monitor for size metrics

## Usage

Add the log shipper channel to your `config/logging.php`:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['daily', 'log_shipper'],
        'ignore_exceptions' => false,
    ],

    'log_shipper' => [
        'driver' => 'custom',
        'via' => \AdminIntelligence\LogShipper\Logging\CreateCustomLogger::class,
        'level' => 'error', // Only ship errors and above
    ],
    
    // ... other channels
],
```

Now any log at the configured level or above will be shipped to your central server:

```php
Log::error('Something went wrong', ['order_id' => 123]);
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Enable/disable log shipping | `true` |
| `api_endpoint` | The URL of your log server | - |
| `api_key` | Your project's API key | - |
| `queue_connection` | Queue connection to use | `default` |
| `queue_name` | Queue name for log jobs | `default` |
| `retries` | Number of attempts before failing | `3` |
| `backoff` | Wait time between retries (seconds) | `[2, 5, 10]` |
| `circuit_breaker` | Circuit breaker configuration | `enabled` |
| `fallback_channel` | Local channel to use if shipping fails | `null` |
| `ip_obfuscation` | IP address obfuscation settings | `disabled` |
| `max_payload_size` | Max payload size in bytes | `1048576` |
| `sanitize_fields` | Fields to redact from logs | See config |
| `send_context` | Context data to include | See config |

## Log Payload

When a log event is shipped, the following data is sent:

### Core Log Data (Always Sent)

| Field | Type | Description |
|-------|------|-------------|
| `level` | string | Log level (error, warning, info, debug, etc.) |
| `message` | string | The log message |
| `context` | array | Any context array passed to the log call |
| `datetime` | string | Timestamp in `Y-m-d H:i:s.u` format |
| `channel` | string | The logging channel name |
| `extra` | array | Additional Monolog processor data |

### Optional Context Data

These fields can be toggled via the `send_context` configuration:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `user_id` | int\|null | enabled | Authenticated user's ID |
| `ip_address` | string\|null | enabled | Client IP address |
| `user_agent` | string\|null | enabled | Browser/client user agent string |
| `request_method` | string\|null | enabled | HTTP method (GET, POST, PUT, DELETE, etc.) |
| `request_url` | string\|null | enabled | Full request URL including query string |
| `route_name` | string\|null | enabled | Laravel route name |
| `controller_action` | string\|null | enabled | Controller and action handling the request |
| `app_env` | string\|null | enabled | Application environment (local, staging, production) |
| `app_debug` | bool\|null | enabled | Whether debug mode is enabled |
| `referrer` | string\|null | enabled | HTTP Referer header |

To disable specific context fields, update your `config/log-shipper.php`:

```php
'send_context' => [
    'user_id' => true,
    'ip_address' => true,
    'user_agent' => false, // disabled
    // ...
],
```

### Example Log Payload

Here is an example of the JSON payload sent for a log event:

```json
{
    "level": "error",
    "message": "Order processing failed",
    "context": {
        "order_id": 12345,
        "reason": "Payment declined"
    },
    "datetime": "2025-12-11 14:30:45.123456",
    "channel": "local",
    "extra": {},
    "user_id": "1",
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0...",
    "request_method": "POST",
    "request_url": "https://api.example.com/orders",
    "route_name": "orders.store",
    "controller_action": "App\\Http\\Controllers\\OrderController@store",
    "app_env": "production",
    "app_debug": false
}
```

## Status Monitoring

The package can automatically push system health metrics to your log server on a configurable interval. This helps you monitor the health of your application instances.

### Enable Status Push

Add the following to your `.env` file:

```env
LOG_SHIPPER_STATUS_ENABLED=true
LOG_SHIPPER_STATUS_ENDPOINT=https://your-log-server.com/api/stats
LOG_SHIPPER_STATUS_INTERVAL=5 # minutes (default: 5)
```

You can also configure the disk path to monitor:

```env
LOG_SHIPPER_DISK_PATH=/
```

#### Interval Configuration

The `LOG_SHIPPER_STATUS_INTERVAL` setting supports flexible scheduling:

| Interval | Behavior | Example |
|----------|----------|---------|
| 1-59 | Every N minutes | `5` = Every 5 minutes |
| 60-1439 | Every N hours | `120` = Every 2 hours, `180` = Every 3 hours |
| 1440+ | Daily | `1440` = Daily at midnight |

The scheduler automatically selects the appropriate cron expression based on your interval value.

### Collected Metrics

> **Note:** Status pushing relies on Laravel's scheduler. Ensure you have the scheduler running:
> `* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1`

### Example Status Payload

Here is an example of the JSON payload sent for a status update:

```json
{
    "timestamp": "2025-12-18T16:53:12+00:00",
    "app_name": "ticket",
    "app_env": "local",
    "app_debug": true,
    "instance_id": "Boxxy",
    "log_shipper_version": "1.4.1",
    "system": {
        "memory_usage": 33554432,
        "memory_peak": 33554432,
        "server_memory": {
            "total": 26841100288,
            "free": 23864168448,
            "used": 2976931840,
            "percent_used": 11.09
        },
        "cpu_usage": 0.18,
        "php_version": "8.4.15",
        "laravel_version": "12.42.0",
        "uptime": 25162,
        "disk_space": {
            "total": 269490393088,
            "free": 239698132992,
            "used": 29792260096,
            "percent_used": 11.06,
            "disks": [
                {
                    "path": "/",
                    "total": 269490393088,
                    "free": 239698132992,
                    "used": 29792260096,
                    "percent_used": 11.06
                },
                {
                    "path": "/boot/efi",
                    "total": 536870912,
                    "free": 499122176,
                    "used": 37748736,
                    "percent_used": 7.03
                }
            ]
        },
        "node_version": "v24.11.1",
        "npm_version": "11.6.2",
        "composer_outdated": 6,
        "npm_outdated": 9,
        "composer_audit": 0,
        "npm_audit": 0
    },
    "queue": {
        "error": "Could not fetch queue metrics"
    },
    "database": {
        "status": "connected",
        "latency_ms": 8.51
    },
    "cache": [],
    "filesize": [],
    "foldersize": {
        "upload": -1,
        "cache": 523732,
        "email-assets": -1
    }
}
```

### System Metrics Details

The status payload includes the following system metrics:

#### Core Status Data
| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO-8601 timestamp of the report |
| `app_name` | string | Application name from `config('app.name')` |
| `app_env` | string | Application environment (local, production, etc.) |
| `app_debug` | bool | Whether debug mode is enabled |
| `instance_id` | string | Hostname of the server |
| `log_shipper_version` | string | Version of the log shipper package |

#### System Object
| Field | Type | Description |
|-------|------|-------------|
| `memory_usage` | int | Current memory usage of the PHP process (bytes) |
| `memory_peak` | int | Peak memory usage of the PHP process (bytes) |
| `server_memory` | object | Server-level RAM metrics (see below) |
| `cpu_usage` | float\|null | CPU usage percentage or load average |
| `php_version` | string | PHP version |
| `laravel_version` | string | Laravel framework version |
| `uptime` | int\|null | System uptime in seconds (null if unavailable) |
| `disk_space` | object | Primary disk metrics + `disks` array of all mounted filesystems |
| `node_version` | string\|null | Node.js version (if enabled) |
| `npm_version` | string\|null | npm version (if enabled) |
| `composer_outdated` | int | Count of outdated Composer packages (if enabled) |
| `npm_outdated` | int | Count of outdated npm packages (if enabled) |
| `composer_audit` | int | Count of Composer security advisories (if enabled) |
| `npm_audit` | int | Count of npm security vulnerabilities (if enabled) |

#### Server Memory Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | int\|null | Total system RAM (bytes) |
| `free` | int\|null | Available system RAM (bytes) |
| `used` | int\|null | Used system RAM (bytes) |
| `percent_used` | float\|null | Percentage of RAM in use |

> **Note on macOS:** The `percent_used` includes filesystem cache. This is normal macOS behavior and does not indicate memory pressure.

#### Disk Space Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | int\|null | Total size of the primary disk (bytes) |
| `free` | int\|null | Free space on the primary disk (bytes) |
| `used` | int\|null | Used space on the primary disk (bytes) |
| `percent_used` | float\|null | Percentage of primary disk in use |
| `disks` | array | One entry per mounted filesystem (see below) |

Each entry in `disks` contains:
| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Mount point (e.g. `/`, `/boot/efi`, `C:`) |
| `total` | float | Total size of the filesystem (bytes) |
| `free` | float | Free space on the filesystem (bytes) |
| `used` | float | Used space on the filesystem (bytes) |
| `percent_used` | float | Percentage of the filesystem in use |

#### Queue Object
- **Size**: Queue jobs count (excluding the status job itself)
- **Connection**: Active queue connection

#### Database Object
- **Status**: Connection status (`connected` or `disconnected`)
- **Latency**: Query latency in milliseconds

#### Cache Object
- **Driver**: Active cache driver

#### Filesize Object
- **Files**: Sizes of specific monitored files (configurable)

#### Foldersize Object
- **Folders**: Total sizes of specific monitored folders, including all nested files (configurable)

To configure which metrics are sent or to monitor specific files/folders, publish the config and update the `status` section:

```php
'status' => [
    'metrics' => [
        'system' => true,
        'queue' => true,
        'database' => true,
        'cache' => false,
        'filesize' => true,
        'foldersize' => true,
        
        // Optional expensive metrics (disabled by default)
        'node_npm' => false,              // Node.js and npm versions
        'dependency_checks' => false,     // Outdated package counts
        'security_audits' => false,       // Security vulnerability counts
    ],

    'monitored_files' => [
        storage_path('logs/laravel.log'),
        storage_path('logs/worker.log'),
    ],
    
    'monitored_folders' => [
        storage_path('logs'),
        storage_path('app/cache'),
    ],
],
```

> **Performance Note:** The optional metrics (`node_npm`, `dependency_checks`, `security_audits`) can be slow as they execute shell commands. Enable these only if you need them and have increased the job timeout accordingly (default: 120 seconds).

> **Note:** Status pushing relies on Laravel's scheduler. Ensure you have the scheduler running:
> `* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1`

## Data Sanitization

The package automatically redacts sensitive fields from your logs. The following field patterns are redacted by default:

| Field Pattern | Examples |
|---------------|----------|
| `password` | password, user_password, password_hash |
| `password_confirmation` | password_confirmation |
| `credit_card` | credit_card, credit_card_number |
| `card_number` | card_number |
| `cvv` | cvv, card_cvv |
| `api_key` | api_key, stripe_api_key |
| `secret` | secret, client_secret |
| `token` | token, access_token, refresh_token |
| `authorization` | authorization |

Add additional fields to sanitize in the config file:

```php
'sanitize_fields' => [
    'password',
    'credit_card',
    'ssn', // add your own
    // ...
],
```

## IP Address Obfuscation

For privacy compliance (GDPR, CCPA), you can enable IP address obfuscation to anonymize client IP addresses before they are logged.

### Enable IP Obfuscation

Add the following to your `.env` file:

```env
LOG_SHIPPER_IP_OBFUSCATION_ENABLED=true
LOG_SHIPPER_IP_OBFUSCATION_METHOD=mask # or 'hash'
```

### Obfuscation Methods

#### Mask (Default)
Zeroes out the last octet of IPv4 addresses and the last 64 bits of IPv6 addresses:

- **IPv4:** `192.168.1.100` → `192.168.1.0`
- **IPv6:** `2001:db8:85a3::8a2e:370:7334` → `2001:db8:85a3::`

This method preserves geographic information while protecting individual privacy.

#### Hash
Generates a one-way hash of the IP address:

- **IPv4:** `192.168.1.100` → `ip_a3f5c8e91d2b4f67`
- **IPv6:** `2001:db8:85a3::8a2e:370:7334` → `ip_b9e4d1c72a8f3e56`

This method provides maximum privacy while maintaining consistency (the same IP always produces the same hash).

### Configuration

```php
// config/log-shipper.php
'ip_obfuscation' => [
    'enabled' => env('LOG_SHIPPER_IP_OBFUSCATION_ENABLED', false),
    'method' => env('LOG_SHIPPER_IP_OBFUSCATION_METHOD', 'mask'), // 'mask' or 'hash'
],
```

## Security Features

### HTTPS Enforcement

In production environments, the package **automatically enforces HTTPS** for the API endpoint. HTTP endpoints will be rejected to prevent credential leaks.

```env
# Accepted in production
LOG_SHIPPER_ENDPOINT=https://secure.example.com/api/ingest

# Rejected in production (only allowed in local/staging/testing)
LOG_SHIPPER_ENDPOINT=http://insecure.example.com/api/ingest
```

### Payload Size Limits

To prevent denial-of-service attacks via oversized log payloads, the package limits the maximum payload size:

```php
// config/log-shipper.php
'max_payload_size' => env('LOG_SHIPPER_MAX_PAYLOAD_SIZE', 1048576), // 1MB default
```

If a payload exceeds this limit, the context will be truncated and marked with `_truncated: true`.

## Sync Mode

By default, logs are shipped via queued jobs for better performance. If you prefer synchronous shipping (useful for debugging or simple setups), set:

```env
LOG_SHIPPER_QUEUE=sync
```

> **Note:** Sync mode will block your application until the HTTP request completes. Use queued mode in production for better performance.

## Batch Shipping

For high-traffic applications, dispatching a job for every log event can create significant queue pressure. You can enable batch shipping to buffer logs in Redis and ship them in chunks.

### Enable Batch Shipping

Add the following to your `.env` file:

```env
LOG_SHIPPER_BATCH_ENABLED=true
LOG_SHIPPER_BATCH_SIZE=100
LOG_SHIPPER_BATCH_INTERVAL=1 # Run every minute
```

### Requirements

- Redis connection (configured in `config/database.php`)
- Laravel Scheduler running

### How it Works

1. Logs are pushed to a Redis list (`log_shipper_buffer`) instead of dispatching a job immediately.
2. A scheduled command (`log-shipper:ship-batch`) runs every minute.
3. The command pops logs in batches (default: 100) and dispatches a single job per batch.
4. The job ships the batch to the log server in a single HTTP request.

## Reliability & Fault Tolerance

This package includes built-in mechanisms to ensure your application remains stable even if the log server is down.

### Retries & Backoff

If the log server returns a 4xx/5xx error or is unreachable, the job will automatically retry based on your configuration.

```php
// config/log-shipper.php
'retries' => 3,
'backoff' => [2, 5, 10], // Wait 2s, then 5s, then 10s
```

### Circuit Breaker

To prevent your queue from being flooded with failing jobs during an outage, the Circuit Breaker will temporarily stop dispatching new log jobs.

```php
// config/log-shipper.php
'circuit_breaker' => [
    'enabled' => true,
    'failure_threshold' => 5, // Open circuit after 5 consecutive failures
    'duration' => 300, // Keep circuit open for 5 minutes
],
```

When the circuit is open, logs are skipped entirely to protect your application's performance.

## Fallback Channel

If the log shipper fails to send logs (after all retries are exhausted), you can configure a fallback channel to ensure logs are not lost.

Add the following to your `.env` file:

```env
LOG_SHIPPER_FALLBACK=daily
```

When a failure occurs, the original log payload will be written to the specified channel, along with failure details in the context.

> **Important:** Do not set the fallback channel to `log_shipper` itself, as this will create an infinite loop. The package automatically prevents this scenario.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for reporting instructions.

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
