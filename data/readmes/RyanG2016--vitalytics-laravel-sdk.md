# Vitalytics Laravel SDK

Official Laravel SDK for [Vitalytics](https://github.com/RyanG2016/vitalytics-server) - Health monitoring, analytics tracking, and database health monitoring for your Laravel applications.

> **Note:** I've been using Vitalytics with my own apps in production for over 6 months and recently made it public. It may need some tweaking for general public use. If something doesn't work, please [create an issue](https://github.com/RyanG2016/vitalytics-laravel-sdk/issues) and I'll address it.

## Features

- **Health Monitoring** - Track crashes, errors, warnings, and info events
- **Analytics Tracking** - Track page views, feature usage, API calls, and custom events
- **Database Health Monitoring** - Monitor MariaDB/MySQL connection pool, query performance, buffer pool, and locks

## Requirements

- PHP 8.1+
- Laravel 10.x or 11.x

## Installation

### Option 1: Via GitHub (Recommended)

Add the repository to your `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/RyanG2016/vitalytics-laravel-sdk"
        }
    ]
}
```

Then install:

```bash
composer require vitalytics/laravel-sdk
```

### Option 2: Via Packagist (Coming Soon)

```bash
composer require vitalytics/laravel-sdk
```

### Publish Configuration

```bash
php artisan vendor:publish --tag=vitalytics-config
```

## Configuration

Add these environment variables to your `.env` file:

```env
# Required
VITALYTICS_BASE_URL=https://your-vitalytics-server.com
VITALYTICS_API_KEY=your-api-key
VITALYTICS_APP_IDENTIFIER=myapp-api

# Optional
VITALYTICS_DEVICE_ID=server-1
VITALYTICS_IS_TEST=false

# Health Monitoring (enabled by default)
VITALYTICS_HEALTH_ENABLED=true

# Analytics (disabled by default)
VITALYTICS_ANALYTICS_ENABLED=false

# Database Monitoring
VITALYTICS_DATABASE_MONITORING_ENABLED=false
VITALYTICS_DATABASE_CONNECTION=mysql
```

## Health Monitoring

### Automatic Exception Reporting

Add to your `app/Exceptions/Handler.php`:

```php
use Vitalytics\Facades\Vitalytics;

public function report(Throwable $e): void
{
    parent::report($e);

    if ($this->shouldReport($e)) {
        Vitalytics::crash(
            message: $e->getMessage(),
            stackTrace: $e->getTraceAsString(),
            context: [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => request()->fullUrl(),
                'user_id' => auth()->id(),
            ]
        );
    }
}
```

### Manual Event Reporting

```php
use Vitalytics\Facades\Vitalytics;

// Report a crash (unhandled exception)
Vitalytics::crash('Fatal error occurred', $exception->getTraceAsString(), [
    'user_id' => $userId,
]);

// Report an error
Vitalytics::error('Payment processing failed', [
    'order_id' => $order->id,
    'gateway' => 'stripe',
]);

// Report a warning
Vitalytics::warning('API rate limit approaching', [
    'current' => $current,
    'limit' => $limit,
]);

// Report info
Vitalytics::info('User completed onboarding', [
    'user_id' => $user->id,
]);
```

## Analytics Tracking

Enable analytics in your `.env`:

```env
VITALYTICS_ANALYTICS_ENABLED=true
```

### Usage

```php
use Vitalytics\Facades\VitalyticsAnalytics;

// Track page views
VitalyticsAnalytics::trackScreen('Dashboard');

// Track feature usage
VitalyticsAnalytics::trackFeature('report_generated', [
    'type' => 'monthly',
    'format' => 'pdf',
]);

// Track API calls (in middleware)
VitalyticsAnalytics::trackApiCall(
    $request->path(),
    $request->method(),
    $response->status(),
    $durationMs
);

// Track button clicks
VitalyticsAnalytics::trackClick('submit-button', [
    'form' => 'contact',
]);

// Track background jobs
VitalyticsAnalytics::trackJob('ProcessInvoice', 'completed', [
    'invoice_id' => $invoice->id,
]);

// Track search
VitalyticsAnalytics::trackSearch('laravel sdk', 15);

// Track custom events
VitalyticsAnalytics::trackEvent('custom_event', 'category', [
    'key' => 'value',
]);

// Manually flush events
VitalyticsAnalytics::flush();
```

## Database Health Monitoring

### Enable Database Monitoring

```env
VITALYTICS_DATABASE_MONITORING_ENABLED=true
VITALYTICS_DATABASE_CONNECTION=mysql
```

### Manual Check

```bash
# Test with dry-run (shows metrics without sending)
php artisan vitalytics:db-health --dry-run

# Run and send to Vitalytics
php artisan vitalytics:db-health

# Check a specific connection
php artisan vitalytics:db-health --connection=mysql_replica

# Output as JSON
php artisan vitalytics:db-health --dry-run --json
```

### Scheduled Monitoring

Add to your `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule): void
{
    // Check database health every 5 minutes
    $schedule->command('vitalytics:db-health')
        ->everyFiveMinutes()
        ->withoutOverlapping()
        ->runInBackground();
}
```

### Metrics Collected

| Category | Metrics | Default Thresholds |
|----------|---------|-------------------|
| Connection Pool | Current/max connections, usage % | Warning: 70%, Critical: 90% |
| Query Performance | Slow queries, QPS, uptime | Warning: 10, Critical: 50 slow queries |
| Buffer Pool | Size, usage %, hit ratio | Warning: 85%, Critical: 95% |
| Locks | Table locks waited, row lock waits | Warning: 5, Critical: 20 waits |
| Replication | IO/SQL thread status, lag | Error if stopped, Warning if lag > 60s |

### Event Levels

| Level | Condition | Alert |
|-------|-----------|-------|
| `info` | All metrics normal | No |
| `warning` | Warning threshold exceeded | No |
| `error` | Critical threshold exceeded | Yes |
| `crash` | Database connection failed | Yes (Critical) |

### Custom Thresholds

Override in `config/vitalytics.php`:

```php
'database' => [
    'thresholds' => [
        'connection_usage_warning' => 0.8,      // 80%
        'connection_usage_critical' => 0.95,    // 95%
        'slow_queries_warning' => 25,
        'slow_queries_critical' => 100,
    ],
],
```

## Queue Job Monitoring

Add to your `AppServiceProvider`:

```php
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Queue;
use Vitalytics\Facades\Vitalytics;

public function boot(): void
{
    Queue::failing(function (JobFailed $event) {
        Vitalytics::error('Queue job failed', [
            'job' => get_class($event->job),
            'exception' => $event->exception->getMessage(),
            'queue' => $event->job->getQueue(),
        ]);
    });
}
```

## Testing

Use test mode to send events without affecting production data:

```env
VITALYTICS_IS_TEST=true
VITALYTICS_ANALYTICS_IS_TEST=true
```

Or programmatically:

```php
Vitalytics::instance()->configure(
    baseUrl: config('vitalytics.base_url'),
    apiKey: config('vitalytics.api_key'),
    appIdentifier: config('vitalytics.app_identifier'),
    isTest: true
);
```

## License

MIT License. See [LICENSE](LICENSE) for details.
