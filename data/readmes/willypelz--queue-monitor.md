# Queue Monitor

[![Latest Version](https://img.shields.io/packagist/v/willypelz/queue-monitor.svg?style=flat-square)](https://packagist.org/packages/willypelz/queue-monitor)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Total Downloads](https://img.shields.io/packagist/dt/willypelz/queue-monitor.svg?style=flat-square)](https://packagist.org/packages/willypelz/queue-monitor)

A powerful Laravel queue monitoring package with database driver support, advanced metrics, and operational controls.

**Better than Horizon** - Full database driver support, advanced controls, lightweight, and easy to install.

![Queue Monitor Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Queue+Monitor+Dashboard)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-endpoints)
- [Comparison with Horizon](#comparison-with-horizon)
- [Requirements](#requirements)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- 📊 **Real-time Dashboard** - Monitor queue jobs with live updates
- 🎛️ **Operational Controls** - Pause, resume, throttle, and retry queues
- 📈 **Rich Metrics** - Track job success rates, runtime, and failures
- 💾 **Database Driver Support** - Full support for database queue driver
- 🚀 **Performance Optimized** - Indexed queries and efficient data retention
- 🔒 **Secure** - Customizable middleware for dashboard protection

## Installation

### Quick Install

```bash
composer require willypelz/queue-monitor
php artisan queue-monitor:install
```

That's it! Visit `http://your-app.test/queue-monitor` to see your dashboard.

> **✅ Auto-Discovery**: This package supports Laravel's auto-discovery feature. The service provider is automatically registered when you install the package.

> **🔒 HTTPS Ready**: All external resources use HTTPS to prevent mixed-content blocking. Works seamlessly with secure applications.

### Manual Installation

Install the package via Composer:

```bash
composer require willypelz/queue-monitor
```

Publish the configuration and migrations:

```bash
php artisan vendor:publish --provider="QueueMonitor\QueueMonitorServiceProvider"
```

Or publish individually:

```bash
# Publish config
php artisan vendor:publish --tag=queue-monitor-config

# Publish migrations
php artisan vendor:publish --tag=queue-monitor-migrations

# Publish views (optional, for customization)
php artisan vendor:publish --tag=queue-monitor-views
```

Run the migrations:

```bash
php artisan migrate
```

## Configuration

The configuration file is published to `config/queue-monitor.php`:

```php
return [
    // Dashboard route path
    'path' => 'queue-monitor',

    // Middleware for dashboard access
    'middleware' => ['web'],

    // Storage driver: 'database' or 'redis'
    'driver' => env('QUEUE_MONITOR_DRIVER', 'database'),

    // Redis configuration (when driver is 'redis')
    'redis' => [
        'connection' => env('QUEUE_MONITOR_REDIS_CONNECTION', 'default'),
    ],

    // Retention period in days
    'retention_days' => 14,

    // UI refresh interval
    'ui' => [
        'refresh_seconds' => 10,
    ],

    // Control settings
    'control' => [
        'pause_release_seconds' => 10,
        'throttle_default_rate_per_minute' => 60,
        'throttle_release_seconds' => 5,
    ],
];
```

### Storage Drivers

**Database Driver (Default)**
```env
QUEUE_MONITOR_DRIVER=database
```
- Persistent storage
- SQL queries supported
- Best for moderate volume

**Redis Driver (High Performance)**
```env
QUEUE_MONITOR_DRIVER=redis
QUEUE_MONITOR_REDIS_CONNECTION=default
```
- 20x faster than database
- Perfect for high-volume queues
- Memory-based with TTL expiration
- See [Redis Driver Guide](docs/redis-driver.md) for details

### Securing the Dashboard

Add authentication middleware to protect the dashboard:

```php
'middleware' => ['web', 'auth'],
```

Or create custom middleware for role-based access:

```php
'middleware' => ['web', 'auth', 'can:view-queue-monitor'],
```

## Usage

### Accessing the Dashboard

Once installed, visit the dashboard at:

```
http://your-app.test/queue-monitor
```

### Dashboard Features

- **Stats Overview**: View total, processed, failed, and processing jobs
- **Average Runtime**: Monitor job performance
- **Recent Jobs**: See the latest job executions
- **Queue Controls**: Pause, resume, throttle, or retry queues

### Queue Controls

#### Pause Queue

Temporarily stop processing jobs on a specific queue:

```bash
# Via Dashboard UI or API
POST /queue-monitor/api/control/pause
{
    "connection": "database",
    "queue": "default"
}
```

#### Resume Queue

Resume a paused queue:

```bash
POST /queue-monitor/api/control/resume
{
    "connection": "database",
    "queue": "default"
}
```

#### Throttle Queue

Limit the number of jobs processed per minute:

```bash
POST /queue-monitor/api/control/throttle
{
    "connection": "database",
    "queue": "default",
    "rate": 60
}
```

#### Retry Failed Jobs

Retry all failed jobs on a queue:

```bash
POST /queue-monitor/api/control/retry
{
    "connection": "database",
    "queue": "default"
}
```

### Programmatic Usage

You can also interact with the queue monitor programmatically:

```php
use QueueMonitor\Services\QueueControlService;

$control = app(QueueControlService::class);

// Pause a queue
$control->pause('database', 'default');

// Resume a queue
$control->resume('database', 'default');

// Throttle a queue
$control->throttle('database', 'default', 30);

// Check if paused
$isPaused = $control->isPaused('database', 'default');

// Get throttle rate
$rate = $control->getThrottleRate('database', 'default');
```

### Pruning Old Records

Keep your database clean by pruning old job records:

```bash
# Prune records older than 14 days (default)
php artisan queue-monitor:prune

# Prune records older than 7 days
php artisan queue-monitor:prune --days=7
```

Schedule automatic pruning in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('queue-monitor:prune')->daily();
}
```

## Driver Comparison

Choose the right storage driver for your needs:

| Feature | Database Driver | Redis Driver |
|---------|----------------|--------------|
| **Performance** | ~10ms per job | ~0.5ms per job (20x faster) |
| **Throughput** | 200 jobs/sec | 5,000+ jobs/sec |
| **Storage** | Persistent (disk) | Memory with TTL |
| **Data Retention** | Permanent | Configurable expiration |
| **Queries** | Full SQL support | Key-value only |
| **Setup** | Requires migrations | No migrations needed |
| **Best For** | Low-medium volume, SQL analytics | High volume, real-time updates |
| **Memory Usage** | Database storage | RAM (1-5 KB per job) |

### When to Use Redis

✅ Processing 1000+ jobs per minute
✅ Multiple servers sharing monitoring data
✅ Real-time dashboard updates required
✅ Want to reduce database load
✅ Already using Redis for cache/queues

### When to Use Database

✅ Low to medium job volume
✅ Need permanent data storage
✅ SQL queries for reporting
✅ Single server deployment
✅ Compliance/audit requirements

**To use database driver instead:**
```env
# .env
QUEUE_MONITOR_DRIVER=database
```

**See [Redis Driver Guide](docs/redis-driver.md) for detailed comparison and migration instructions.**

## API Endpoints

All API endpoints are prefixed with `/queue-monitor/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get dashboard statistics |
| GET | `/jobs` | Get recent jobs |
| POST | `/control/pause` | Pause a queue |
| POST | `/control/resume` | Resume a queue |
| POST | `/control/throttle` | Throttle a queue |
| POST | `/control/retry` | Retry failed jobs |

## Comparison with Horizon

| Feature | Queue Monitor | Horizon |
|---------|---------------|---------|
| Database Driver | ✅ Full support | ❌ Redis only |
| Custom Controls | ✅ Pause, throttle, retry | ⚠️ Limited |
| Lightweight | ✅ Minimal overhead | ❌ Heavy |
| Easy Installation | ✅ Composer only | ⚠️ Requires config |
| Real-time UI | ✅ Vue 3 | ✅ Vue 2 |
| Metrics Depth | ✅ Rich stats | ✅ Rich stats |
| Open Source | ✅ MIT | ✅ MIT |

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x, or 12.x
- Database (MySQL, PostgreSQL, SQLite, etc.) or Redis

## Documentation

- [Installation Guide](docs/installation.md) - Detailed installation instructions
- [Redis Driver Guide](docs/redis-driver.md) - **NEW!** High-performance Redis storage
- [Queue Controls](docs/controls.md) - Pause, resume, throttle, and retry
- [API Documentation](docs/api.md) - RESTful API endpoints
- [Middleware Setup](docs/middleware.md) - Job middleware configuration
- [Security Considerations](docs/security.md) - HTTPS, mixed-content prevention, and access control
- [API Endpoint Fix](docs/api-endpoint-fix.md) - Fix blocked:mixed-content for API calls
- [Advanced Features](docs/advanced.md) - Performance optimization, alerting, and more

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Security

If you discover any security-related issues, please email willypelz@example.com instead of using the issue tracker.

## Credits

- **Author**: Willy Pelz
- **Inspired by**: Laravel Horizon, romanzipp/laravel-queue-monitor
- **Built with**: Laravel, Vue.js 3, Tailwind CSS

## Support

- **Issues**: [GitHub Issues](https://github.com/willypelz/queue-monitor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/willypelz/queue-monitor/discussions)
- **Documentation**: [docs/](docs/)

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

**Made with ❤️ for the Laravel community**

