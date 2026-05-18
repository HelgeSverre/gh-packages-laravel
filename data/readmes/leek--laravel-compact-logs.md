# Laravel Compact Logs

Truncate verbose stack traces in Laravel log files. Instead of 100+ line stack traces per error, get the error message and the first few relevant frames.

**Before:**
```
[2026-02-12 08:37:31] local.ERROR: Connection refused {"exception":"[object] (PDOException...)
[stacktrace]
#0 /vendor/laravel/framework/src/.../Connection.php(420): PDO->prepare(...)
#1 /vendor/laravel/framework/src/.../Connection.php(827): ...
#2 /vendor/laravel/framework/src/.../Connection.php(794): ...
#3 /vendor/laravel/framework/src/.../Connection.php(411): ...
... 80 more lines of framework internals ...
```

**After:**
```
[2026-02-12 08:37:31] local.ERROR: Connection refused {"exception":"[object] (PDOException...)
[stacktrace]
#0 /vendor/laravel/framework/src/.../Connection.php(420): PDO->prepare(...)
#1 /vendor/laravel/framework/src/.../Connection.php(827): ...
#2 /vendor/laravel/framework/src/.../Connection.php(794): ...
... and 80 more frames"}
```

## Installation

```bash
composer require leek/laravel-compact-logs
```

That's it. The package auto-registers and applies to `single` and `daily` log channels by default.

## Configuration

Publish the config file to customize:

```bash
php artisan vendor:publish --tag=compact-logs-config
```

```php
// config/compact-logs.php
return [
    // Channels to apply truncation to (set to null to disable auto-registration)
    'channels' => ['single', 'daily'],

    // Max stack trace frames per exception
    'max_trace_depth' => (int) env('LOG_TRACE_DEPTH', 3),
];
```

### Environment Variable

```env
LOG_TRACE_DEPTH=5
```

### Manual Setup

If you prefer manual control, set `channels` to `null` in the config and add the tap directly to your `config/logging.php`:

```php
'single' => [
    'driver' => 'single',
    'tap'    => [\Leek\CompactLogs\CompactExceptionTap::class],
    'path'   => storage_path('logs/laravel.log'),
    'level'  => env('LOG_LEVEL', 'debug'),
],
```

## How It Works

The package provides a custom Monolog `LineFormatter` that overrides `normalizeException()` to truncate stack traces. A logging [tap](https://laravel.com/docs/logging#customizing-monolog-for-channels) applies this formatter to your configured channels.

- Stack traces are trimmed to `max_trace_depth` frames (default: 3)
- A `... and N more frames` indicator shows how many were omitted
- Previous exception chains are also truncated
- All other log formatting remains unchanged

## License

MIT
