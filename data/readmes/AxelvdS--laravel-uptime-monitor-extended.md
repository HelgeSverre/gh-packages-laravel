# Laravel Uptime Monitor Extended

![Status](https://img.shields.io/badge/status-stable-green)
![Version](https://img.shields.io/badge/version-1.1.10-blue)

An extended uptime monitoring package for Laravel that builds upon [Spatie's Laravel Uptime Monitor](https://github.com/spatie/laravel-uptime-monitor) with additional features including IP/ping monitoring, per-monitor frequency settings, active/inactive toggles, and built-in dashboard widgets.

**Architecture**: The core monitoring functionality is available for any Laravel project. If you're using [Laravel Filament](https://filamentphp.com), you can optionally enable Filament resources and widgets for a complete admin panel experience.

## Features

### Core Features (Available in All Laravel Projects)

- ✅ **IP Address Monitoring** - Monitor devices and servers via ping (ICMP)
- ✅ **URL Monitoring** - Monitor websites and APIs via HTTP/HTTPS (uses Spatie's functionality)
- ✅ **SSL Certificate Monitoring** - Automatic SSL certificate expiration checks
- ✅ **Per-Monitor Frequency** - Set different check intervals for each monitor
- ✅ **Active/Inactive Toggle** - Enable or disable monitoring per device/service
- ✅ **Response Checking** - Verify specific content in responses (login pages, API responses, etc.)
- ✅ **Configurable Log Retention** - Set how long to keep monitoring logs
- ✅ **Artisan Commands** - CLI commands for checking monitors and cleaning up logs

### Filament Integration (Optional)

If you're using Laravel Filament, you also get:

- ✅ **Monitor Resource** - Full CRUD interface for managing monitors
- ✅ **Dashboard Widgets** - Built-in Filament widgets for monitoring statistics
  - Devices up/down/SSL issues statistics widget
  - Table of devices currently down widget
  - Uptime graph widget showing trends over time
- ✅ **Native Filament Experience** - All features work seamlessly within your Filament admin panel

## Requirements

- PHP 8.1 or higher (PHP 8.3+ recommended)
- Laravel 10.0 or higher
- [Spatie Laravel Uptime Monitor](https://github.com/spatie/laravel-uptime-monitor) (v4.0+) - **Automatically installed as a dependency**

**Optional (for Filament integration):**
- [Laravel Filament](https://filamentphp.com) (v3.0+ or v4.0+)

## Installation

1. Install the package via Composer:

```bash
composer require axelvds/laravel-uptime-monitor-extended
```

> **Note**: Spatie's Laravel Uptime Monitor is automatically installed as a dependency. You don't need to install it separately.

2. Publish Spatie's migrations:

```bash
php artisan vendor:publish --provider="Spatie\UptimeMonitor\UptimeMonitorServiceProvider"
```

3. Publish this package's configuration and migrations:

```bash
php artisan vendor:publish --provider="AxelvdS\UptimeMonitorExtended\UptimeMonitorExtendedServiceProvider"
```

This will publish:
- Configuration file: `config/uptime-monitor-extended.php`
- Migrations: `database/migrations/` (extends monitors table and creates monitors_logs table)

4. Run the migrations:

```bash
php artisan migrate
```

This will automatically run migrations in the correct order:
1. **Spatie's migrations** - Creates the `monitors` table
2. **This package's migrations** - Extends the `monitors` table and creates the `monitors_logs` table

> **Note**: The migrations are timestamped to ensure they run in the correct order automatically. If you get an error about the `monitors` table not existing, make sure you've published Spatie's migrations first (step 2).

### Filament Integration (Optional)

If you're using Laravel Filament and want to use the Filament resources and widgets:

1. Install Filament (if not already installed):

```bash
composer require filament/filament:"^3.0|^4.0"
```

2. Register the resources and widgets in your Filament panel provider (typically `app/Providers/Filament/AdminPanelProvider.php`) and make sure they are not already there:

```php
use AxelvdS\UptimeMonitorExtended\Filament\UptimeMonitorExtendedFilamentServiceProvider;

public function panel(Panel $panel): Panel
{
    return $panel
        // ... your other panel configuration
        ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
        ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
        ->resources([
            // ... your other resources
        ])
        ->widgets([
            // ... your other widgets
        ]);
}

protected function boot(): void
{
    parent::boot();
    
    // Register uptime monitor resources and widgets
    UptimeMonitorExtendedFilamentServiceProvider::registerForPanel(
        $this->panel(static::new())
    );
}
```

Alternatively, you can register them directly in your panel method:

```php
use AxelvdS\UptimeMonitorExtended\Filament\Resources\MonitorResource;
use AxelvdS\UptimeMonitorExtended\Filament\Widgets\DevicesDownTableWidget;
use AxelvdS\UptimeMonitorExtended\Filament\Widgets\UpDownStatsWidget;
use AxelvdS\UptimeMonitorExtended\Filament\Widgets\UptimeGraphWidget;

public function panel(Panel $panel): Panel
{
    return $panel
        ->resources([
            MonitorResource::class,
            // ... your other resources
        ])
        ->widgets([
            UpDownStatsWidget::class,
            DevicesDownTableWidget::class,
            UptimeGraphWidget::class,
            // ... your other widgets
        ]);
}
```

## Configuration

After publishing the configuration file, you can customize the settings in `config/uptime-monitor-extended.php`:

```php
return [
    // Route prefix for dashboard
    'route_prefix' => env('UPTIME_MONITOR_ROUTE_PREFIX', 'uptime-monitor'),
    
    // Log retention in days (null = unlimited)
    'log_retention_days' => env('UPTIME_MONITOR_LOG_RETENTION_DAYS', 30),
    
    // Default check frequency in minutes
    'default_frequency_minutes' => env('UPTIME_MONITOR_DEFAULT_FREQUENCY', 5),
    
    // Ping configuration
    'ping' => [
        'timeout' => env('UPTIME_MONITOR_PING_TIMEOUT', 3),
        'count' => env('UPTIME_MONITOR_PING_COUNT', 1),
        'interval' => env('UPTIME_MONITOR_PING_INTERVAL', 0.2),
    ],
    
    // Filament configuration (optional)
    'filament' => [
        // Navigation label for the Monitor resource
        'navigation_label' => env('UPTIME_MONITOR_NAVIGATION_LABEL', 'Monitors'),
        
        // Optional: Navigation group (set to null or don't set to have no group)
        'navigation_group' => env('UPTIME_MONITOR_NAVIGATION_GROUP') ?: null,
    ],
    
    // Auto-schedule commands (default: true)
    'auto_schedule' => env('UPTIME_MONITOR_AUTO_SCHEDULE', true),
    
    // Dashboard configuration
    'dashboard' => [
        'enabled' => env('UPTIME_MONITOR_DASHBOARD_ENABLED', true),
        'graph_data_points' => env('UPTIME_MONITOR_GRAPH_DATA_POINTS', 24),
        'refresh_interval' => env('UPTIME_MONITOR_DASHBOARD_REFRESH', 60),
        'graph_height' => env('UPTIME_MONITOR_GRAPH_HEIGHT', 200), // pixels
    ],
];
```

## Usage

### Creating Monitors

#### HTTP/HTTPS Monitor

```php
use Spatie\UptimeMonitor\Models\Monitor;

// Create an HTTPS monitor
Monitor::create([
    'url' => 'https://example.com',
    'monitor_type' => 'https',
    'frequency_minutes' => 5,
    'is_active' => true,
    'look_for_string' => 'Welcome', // Optional: check for specific content
]);

// Create an HTTP monitor for an IP address
Monitor::create([
    'url' => 'http://192.168.1.100:8080',
    'monitor_type' => 'http',
    'frequency_minutes' => 1,
    'is_active' => true,
]);
```

#### Ping Monitor

```php
use Spatie\UptimeMonitor\Models\Monitor;

// Create a ping monitor for a server/device
Monitor::create([
    'url' => '192.168.1.1', // IP address
    'monitor_type' => 'ping',
    'frequency_minutes' => 1,
    'is_active' => true,
    'notes' => 'Main router',
]);
```

### Checking Monitors

Run the extended check command:

```bash
# Check all active monitors
php artisan uptime-monitor:check-extended

# Check a specific monitor
php artisan uptime-monitor:check-extended --monitor-id=1
```

### Scheduling Checks

**Automatic Scheduling (Default)**

By default, the package automatically registers scheduled commands. No manual configuration is required! The commands are scheduled to run:
- Monitor checks: Every minute
- Log cleanup: Daily

> **Note**: Automatic scheduling may not be visible in your `routes/console.php` file, but the commands are still registered and will run. If you prefer to see and control the scheduling explicitly, use manual scheduling below.

**Manual Scheduling (Optional)**

If you prefer to manually control scheduling or want to see the scheduled commands explicitly in your `routes/console.php` file, you can disable auto-scheduling by setting in your `.env`:

```env
UPTIME_MONITOR_AUTO_SCHEDULE=false
```

Then add to your `routes/console.php` (Laravel 11+):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('uptime-monitor:check-extended')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('uptime-monitor:cleanup-logs')
    ->daily()
    ->withoutOverlapping();
```

Or for Laravel 10, add to your `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Check monitors every minute
    $schedule->command('uptime-monitor:check-extended')
        ->everyMinute()
        ->withoutOverlapping()
        ->runInBackground();
    
    // Clean up old logs daily
    $schedule->command('uptime-monitor:cleanup-logs')
        ->daily()
        ->withoutOverlapping();
}
```

**Important:** Make sure your Laravel scheduler is running. Add this to your crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### Dashboard

#### Filament Dashboard (Recommended)

If you're using Filament, the package automatically provides:
- **Monitor Resource** - Full CRUD interface for managing monitors
- **Up/Down Stats Widget** - Statistics showing devices up/down/SSL issues
- **Devices Down Table Widget** - Table of monitors currently down
- **Uptime Graph Widget** - Visual graph showing uptime trends over time

These will appear in your Filament admin panel automatically once registered.

#### Legacy Dashboard (Non-Filament Projects)

For projects without Filament, a simple Blade-based dashboard is available:

Access the dashboard at: `http://your-app.com/uptime-monitor`

The dashboard provides:
- Real-time statistics (devices up/down/SSL issues)
- Uptime graph over time
- Table of devices currently down

**Note**: The legacy dashboard is automatically disabled if Filament is detected. To enable it manually, set `dashboard.enabled` to `true` in your config file.

### API Endpoints

The package provides API endpoints for dashboard data (only available when using the legacy dashboard):

- `GET /uptime-monitor/api/up-down-stats` - Get up/down statistics
- `GET /uptime-monitor/api/devices-down?limit=10` - Get list of devices down
- `GET /uptime-monitor/api/uptime-graph?hours=24&interval=60` - Get graph data

### Managing Monitors

```php
use Spatie\UptimeMonitor\Models\Monitor;

// Toggle active status
$monitor = Monitor::find(1);
$monitor->is_active = false;
$monitor->save();

// Update frequency
$monitor->frequency_minutes = 10;
$monitor->save();

// Get monitor logs
use AxelvdS\UptimeMonitorExtended\Models\MonitorLog;

$logs = MonitorLog::where('monitor_id', 1)
    ->orderBy('checked_at', 'desc')
    ->get();
```

## Monitor Types

- **`https`** - HTTPS monitoring with SSL certificate checks
- **`http`** - HTTP monitoring (no SSL checks)
- **`ping`** - ICMP ping monitoring for IP addresses
- **`tcp`** - TCP port monitoring (e.g., `192.168.1.1:22` or `example.com:3306`)

## Response Checking

For HTTP/HTTPS monitors, you can check for specific content in responses using the `look_for_string` field:

```php
Monitor::create([
    'url' => 'https://api.example.com/health',
    'monitor_type' => 'https',
    'look_for_string' => '{"status":"ok"}', // Check for this string in the response body
    'frequency_minutes' => 5,
]);
```

**How it works:**
- If `look_for_string` is set, after a successful HTTP response (status 200-399), the package checks if the string exists in the response body
- If the string is **not found**, the monitor is marked as `down` with the error message: "Required string '...' not found in response"
- If the string **is found**, the monitor remains `up`
- This is useful for verifying that login pages, API responses, or specific content is present on the page

**Example use cases:**
- Verify a login page contains "Welcome" or "Dashboard"
- Check that an API endpoint returns a specific JSON key
- Ensure a maintenance page doesn't appear (check for absence of "Maintenance Mode")

## Log Retention

Configure log retention in the config file or via environment variable:

```env
UPTIME_MONITOR_LOG_RETENTION_DAYS=30
```

Set to `null` to keep logs indefinitely.

## Platform Compatibility

### Ping Monitoring

Ping monitoring works on:
- ✅ Linux
- ✅ macOS
- ✅ Windows

Note: Some shared hosting environments may restrict ping functionality. In such cases, use HTTP monitoring instead.

## Events

This package extends Spatie's events. You can listen to:

- `Spatie\UptimeMonitor\Events\UptimeCheckFailed`
- `Spatie\UptimeMonitor\Events\UptimeCheckRecovered`
- `Spatie\UptimeMonitor\Events\UptimeCheckSucceeded`

## Database Schema

The package extends Spatie's `monitors` table with:

- `monitor_type` - Type of monitor (http, https, ping)
- `frequency_minutes` - Check frequency in minutes (per monitor)
- `is_active` - Active/inactive toggle
- `last_check_at` - Timestamp of last check
- `ping_timeout` - Ping timeout (for ping monitors)
- `notes` - Optional notes/description

It also creates a `monitors_logs` table for storing check history.

## Troubleshooting

### Ping not working

- Ensure your server has permission to execute ping commands
- Check if ping is available: `which ping` (Linux/Mac) or `where ping` (Windows)
- Some shared hosting may restrict ping - use HTTP monitoring instead

### Monitors not checking

- Ensure monitors are marked as `is_active = true`
- Check that the scheduled command is running
- Verify `frequency_minutes` is set correctly
- Check `last_check_at` to see when monitors were last checked

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).

## Credits

This package extends [Spatie's Laravel Uptime Monitor](https://github.com/spatie/laravel-uptime-monitor) package.

## Support

For issues and questions, please open an issue on GitHub.

