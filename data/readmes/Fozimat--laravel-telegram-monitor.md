# Laravel Telegram Monitor

Lightweight Telegram error monitoring for Laravel applications. This package hooks into Laravel's exception reporting flow and sends important error alerts directly to your Telegram chat or group.

## Features

- Zero extra runtime dependencies beyond Laravel's built-in HTTP client
- Laravel package auto-discovery support
- Duplicate error throttling to reduce alert spam
- Respects Laravel's normal exception reporting flow
- Keeps request payloads, headers, and cookies out of Telegram messages

## Requirements

- PHP 8.2+
- Laravel 10.x, 11.x, 12.x, or 13.x

## Installation

Install the latest stable release from Packagist:

```bash
composer require fozimat/laravel-telegram-monitor:^1.0
```

## Configuration

The package is auto-discovered by Laravel, so there is no need to register a service provider manually.

Optional: publish the config file if you want to keep package settings in your app config directory:

```bash
php artisan vendor:publish --tag=telegram-monitor-config
```

Add these variables to your application's `.env` file:

```env
ERROR_MONITORING_ENABLED=true
ERROR_MONITORING_CAPTURE_LOGS=true
ERROR_MONITORING_LEVEL=error
TELEGRAM_BOT_TOKEN=1234567890:ABCDefGhIjKlMnOpQrStUvWxYz
TELEGRAM_CHAT_ID=-100123456789
APP_NAME="My Laravel App"
APP_ENV=production
```

`ERROR_MONITORING_LEVEL` works as the minimum threshold for both reported exceptions and Laravel log events.
Exceptions handled by this package are treated as `error` severity events, while direct `Log::debug()`, `Log::info()`, `Log::warning()`, `Log::error()`, `Log::critical()`, and similar calls use their actual log level.

`ERROR_MONITORING_CAPTURE_LOGS` controls whether Laravel log events should be forwarded to Telegram. Leave it enabled if you want direct `Log::*` calls to be reported too.

Log levels are applied in this order:

```text
debug < info < notice < warning < error < critical < alert < emergency
```

The configured level acts as the minimum threshold, so that level and anything above it will be reported.

Examples:

- `ERROR_MONITORING_LEVEL=debug` reports: `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=info` reports: `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=notice` reports: `notice`, `warning`, `error`, `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=warning` reports: `warning`, `error`, `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=error` reports: `error`, `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=critical` reports: `critical`, `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=alert` reports: `alert`, `emergency`
- `ERROR_MONITORING_LEVEL=emergency` reports: `emergency`

## Usage

After installation and environment setup, the package will automatically send:

- Reportable exceptions from Laravel's exception handler
- Laravel log events such as `Log::error(...)`, `Log::critical(...)`, and `Log::alert(...)` when they pass the configured threshold

Example notification:

```text
Laravel Telegram Monitor
Environment: production
Level: ERROR
Time: 2026-05-02 10:30:00
URL: https://example.com/api/v1/sync
User ID: 42
Message: SQLSTATE[HY000] [2002] Connection refused
File: /var/www/app/Services/DatabaseService.php:45
```

## Testing

You can trigger a test exception with a temporary route:

```php
use Illuminate\Support\Facades\Route;

Route::get('/test-telegram-error', function () {
    throw new \Exception('This is a test exception for Laravel Telegram Monitor.');
});
```

Visit `/test-telegram-error` and confirm the message arrives in Telegram.

You can also test direct log reporting:

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/test-telegram-log', function () {
    Log::error('SSO callback failed.', [
        'message' => 'Invalid OAuth state.',
    ]);

    return 'Log sent.';
});
```
