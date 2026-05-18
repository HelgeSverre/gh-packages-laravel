# Queue Dashboard for [MoonShine Laravel admin panel](https://moonshine-laravel.com)

This package provides a convenient dashboard for monitoring and managing failed jobs in your Laravel application directly
from the Moonshine admin panel.

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./art/dashboard_dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./art/dashboard.png">
    <img alt="Queue Dashboard" src="./art/dashboard.png">
</picture>

---

## Compatibility

| MoonShine | Moonshine Queue Dashboard |
|:---------:|:-------------------------:|
| \>= v3.0  |        \>= v1.0.0         |
| \>= v4.0  |        \>= v2.0.0         |

## Features

- 📊 **Queue Overview**: View key metrics for all queues.
- 🔄 **Task Management**: View, resubmit, and delete failed tasks.
- 🎯 **Driver Support**: Works with Redis, Database, Sync, and other Laravel queue drivers.

## Requirements

- PHP 8.1 or higher
- Laravel 10.x or higher
- Moonshine 3.x or higher

## Installation

Install the package via Composer:

```bash
composer require dissnik/moonshine-queue-dashboard
```

## Usage

The dashboard will automatically appear in your MoonShine admin panel if `auto_menu` is enabled in config.

You can also manually add the dashboard to your resource:

```php
use DissNik\MoonShineQueueDashboard\Pages\QueueDashboardPage;

public function menu(): array
{
    return [
        // ... other menu items
        QueueDashboardPage::make(),
    ];
}
```

## Publish

### Configuration file

```shell
php artisan vendor:publish --tag=moonshine-queue-dashboard-config
```

```php
return [
    'auto_menu' => true,         // Automatically add to MoonShine menu
    'queues' => ['default'],     // Queues to monitor
    'auto_refresh' => false,     // Enable automatic data refresh
    'refresh_interval' => 10000, // Refresh interval in milliseconds
];
```

### Language files

```shell
php artisan vendor:publish --tag=moonshine-queue-dashboard-lang
```

### Assets files

```shell
php artisan vendor:publish --tag=moonshine-queue-dashboard-assets
```

### All files

```shell
php artisan vendor:publish --tag=moonshine-queue-dashboard
```

## Components

Package components can be used on other sites or resources.


### Failed Jobs

```php
use DissNik\MoonShineQueueDashboard\Components\FailedJobs;

FailedJobs::make();
```

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./art/failed_jobs_dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./art/failed_jobs.png">
    <img alt="Failed Jobs" src="./art/failed_jobs.png">
</picture>

### Queue Metrics

```php
use DissNik\MoonShineQueueDashboard\Components\QueueMetrics;

QueueMetrics::make();
```

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./art/queue_metrics_dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./art/queue_metrics.png">
    <img alt="Queue Metrics" src="./art/queue_metrics.png">
</picture>

> [!TIP]
> To refresh metrics use Fragment with name 'queue_metrics'

```php
use DissNik\MoonShineQueueDashboard\Components\QueueMetrics;
use MoonShine\Laravel\Components\Fragment;

Fragment::make([
    QueueMetrics::make(),
])
    ->name('queue_metrics')
```
