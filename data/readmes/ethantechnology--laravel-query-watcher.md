# Laravel Query Watcher

A Laravel package to monitor and log database queries with configurable thresholds and detailed performance metrics.

## Features

- 🔍 **Query Count Monitoring**: Track the number of queries executed per request/command
- ⚡ **Slow Query Detection**: Identify queries that exceed execution time thresholds
- 🎯 **Flexible Configuration**: Customize thresholds, log levels, and channels
- 🚫 **Path/Command Exclusions**: Exclude specific routes or artisan commands
- 🌍 **Environment-Specific**: Enable only in desired environments
- 📊 **Detailed Logging**: Optional query SQL and bindings in logs

## Installation

Install the package via Composer:

```bash
composer require eta/laravel-query-watcher
```

### Laravel Auto-Discovery

The package will automatically register its service provider in Laravel 5.5+.

### Manual Registration (Laravel 5.4 and below)

Add the service provider to `config/app.php`:

```php
'providers' => [
    // ...
    ETA\LaravelQueryWatcher\QueryWatcherServiceProvider::class,
],
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=query-watcher-config
```

This will create `config/query-watcher.php` with the following options:

### Main Configuration Options

```php
return [
    // Enable/disable the watcher
    'enabled' => env('QUERY_WATCHER_ENABLED', true),
    
    // Query count threshold
    'threshold' => env('QUERY_WATCHER_THRESHOLD', 50),
    
    // Log level (emergency, alert, critical, error, warning, notice, info, debug)
    'log_level' => env('QUERY_WATCHER_LOG_LEVEL', 'warning'),
    
    // Log channel (null for default)
    'log_channel' => env('QUERY_WATCHER_LOG_CHANNEL', null),
    
    // Slow query threshold in milliseconds (null to disable)
    'slow_query_threshold' => env('QUERY_WATCHER_SLOW_QUERY_THRESHOLD', 1000),
    
    // Log query SQL and bindings (be careful with sensitive data)
    'log_query_details' => env('QUERY_WATCHER_LOG_DETAILS', false),
    
    // Excluded paths (supports wildcards)
    'excluded_paths' => [
        // 'admin/*',
        // '_debugbar/*',
    ],
    
    // Excluded artisan commands
    'excluded_commands' => [
        // 'migrate',
        // 'db:seed',
    ],
];
```
QUERY_WATCHER_SLOW_QUERY_ENABLED=false

# Slow query threshold (milliseconds)
QUERY_WATCHER_SLOW_QUERY_THRESHOLD=1000

# Log query details (SQL and bindings)
QUERY_WATCHER_LOG_DETAILS=false

# Custom log channel
QUERY_WATCHER_LOG_CHANNEL=stack
```

## Usage

Once installed and configured, the package works automatically. It will:

1. **Monitor all database queries** on each request or artisan command
2. **Log warnings** when query count exceeds the threshold
3. **Detect slow queries** that exceed the execution time threshold
4. **Respect exclusions** for specific paths or commands

### Example Log Output

**High Query Count Warning:**
```
[2024-01-15 10:30:45] local.WARNING: [QueryWatcher] High number of DB queries detected on `api/users`: 75 queries (threshold: 50) 
{
    "path": "api/users",
    "query_count": 75,
    "threshold": 50,
    "slow_queries_count": 3
}
```

**Slow Query Warning:**
```
[2024-01-15 10:30:45] local.WARNING: [QueryWatcher] Slow query detected on `api/users`: 1250.50ms 
{
    "path": "api/users",
    "execution_time_ms": 1250.50
}
```

## Advanced Usage

### Using a Custom Log Channel

Create a custom log channel in `config/logging.php`:

```php
'channels' => [
    'query-watcher' => [
        'driver' => 'single',
        'path' => storage_path('logs/query-watcher.log'),
        'level' => 'warning',
    ],
],
```

Then update your `.env`:

```env
QUERY_WATCHER_LOG_CHANNEL=query-watcher
```

### Excluding Specific Paths

In `config/query-watcher.php`:

```php
'excluded_paths' => [
    'admin/*',
    '_debugbar/*',
    'api/webhooks/*',
],
```

### Excluding Artisan Commands

In `config/query-watcher.php`:

```php
'excluded_commands' => [
    'migrate',
    'migrate:*',
    'db:seed',
    'queue:work',
],
```

## Best Practices

1. **Sensitive Data**: Be cautious when enabling `log_query_details` as it may expose sensitive data in logs
2. **Production**: Consider disabling in production by setting `QUERY_WATCHER_ENABLED=false` or using a separate log channel
3. **Thresholds**: Adjust thresholds based on your application's normal query patterns
4. **Exclusions**: Exclude admin panels, debug tools, and high-traffic endpoints that you're aware of

## Requirements

- PHP 7.2 or higher
- Laravel 5.8, 6.x, 7.x, 8.x, 9.x, 10.x, or 11.x

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- [HaiHV](https://github.com/ethantechnology)

## Support

If you discover any security-related issues, please email support@ethan-tech.com instead of using the issue tracker.
