# Laravel Loki

Zero-config Grafana Loki log driver for Laravel. Sends logs in real time to Loki via HTTP, with basic auth and built-in fault tolerance.

## Features

- **Zero-config** — just set `.env`, done
- **Real-time** — no cron job or scheduled command needed
- **Fault-tolerant** — if Loki is down, your app keeps running
- **Basic Auth** — supports authentication via reverse proxy
- **Batching** — buffers logs and sends them efficiently in batches
- **Auto-labels** — app, environment, server, level, channel are added automatically
- **No dependencies** — uses PHP's built-in cURL, no Guzzle required

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12
- PHP `ext-curl`
- A Grafana Loki server

## Installation

```bash
composer require bureaupartners/laravel-loki-logging
```

The service provider is loaded automatically (Laravel auto-discovery).

## Configuration

### 1. Add the Loki channel to `config/logging.php`

```php
'channels' => [

    'stack' => [
        'driver' => 'stack',
        'channels' => explode(',', env('LOG_STACK', 'daily,loki')),
        'ignore_exceptions' => false,
    ],

    'loki' => [
        'driver' => 'loki',
        'level' => env('LOG_LEVEL', 'debug'),
    ],

    // ... your other channels
],
```

### 2. Configure your `.env`

```env
LOG_CHANNEL=stack
LOG_STACK=daily,loki
LOG_LEVEL=debug

# Loki server URL
LOKI_URL=http://10.0.0.50:3100

# Unique name for this server
LOKI_SERVER=web-01

# Optional: basic auth (if you have a proxy with auth)
LOKI_AUTH_USER=
LOKI_AUTH_PASSWORD=
```

Done! All `Log::` calls now go to Loki and to your daily log file.

### 3. Optional: publish the config

```bash
php artisan vendor:publish --tag=loki-config
```

This creates `config/loki.php` where you can set extra labels, batch size, and timeouts.

## Usage

Just use Laravel's standard logging:

```php
use Illuminate\Support\Facades\Log;

Log::info('User logged in', ['user_id' => 123]);
Log::warning('Low stock', ['product' => 'SKU-456', 'stock' => 3]);
Log::error('Payment failed', ['order_id' => 789, 'gateway' => 'mollie']);
Log::debug('SQL query', ['query' => $sql, 'time_ms' => 45]);
```

Context is sent automatically as key=value pairs, so you can filter on it in Grafana.

## Querying in Grafana

Open Grafana → Explore → select Loki as the datasource.

```logql
# All logs from a server
{server="web-01"}

# Only errors from your app
{app="my-app", level="error"}

# Search by text
{app="my-app"} |= "Payment failed"

# Errors from a specific server
{server="web-01", level="error"}

# Filter by multiple levels
{app="my-app", level=~"error|warning"}

# Search by context values
{app="my-app"} |= "order_id=789"

# Count errors per 5 minutes (for dashboards/alerts)
count_over_time({app="my-app", level="error"}[5m])
```

## Advanced configuration

### Extra labels

In `config/loki.php`:

```php
'labels' => [
    'team' => 'backend',
    'version' => '2.1.0',
],
```

Or per channel in `config/logging.php`:

```php
'loki' => [
    'driver' => 'loki',
    'level' => 'debug',
    'labels' => [
        'service' => 'api',
    ],
],
```

### Multiple Loki channels

```php
'loki-errors' => [
    'driver' => 'loki',
    'level' => 'error',
    'url' => 'http://loki-production:3100',
],

'loki-debug' => [
    'driver' => 'loki',
    'level' => 'debug',
    'url' => 'http://loki-staging:3100',
],
```

### Channel config options

| Option | Env variable | Default | Description |
|--------|--------------|---------|-------------|
| `url` | `LOKI_URL` | `http://localhost:3100` | Loki server URL |
| `level` | `LOG_LEVEL` | `debug` | Minimum log level |
| `auth_user` | `LOKI_AUTH_USER` | ` ` | Basic auth username |
| `auth_password` | `LOKI_AUTH_PASSWORD` | ` ` | Basic auth password |
| `labels` | — | `[]` | Extra labels |
| `batch_size` | `LOKI_BATCH_SIZE` | `10` | Logs per batch |
| `timeout` | `LOKI_TIMEOUT` | `5` | HTTP timeout (sec) |
| `connect_timeout` | `LOKI_CONNECT_TIMEOUT` | `2` | Connect timeout (sec) |

## How it works

1. `Log::info()` calls the Loki handler
2. The handler buffers the log line (until `batch_size` is reached)
3. When the batch is full OR at the end of the PHP request → it sends everything to Loki via cURL
4. `WhatFailureGroupHandler` catches all errors — your app always keeps running
5. Labels (app, server, level, etc.) are added automatically

## License

MIT
