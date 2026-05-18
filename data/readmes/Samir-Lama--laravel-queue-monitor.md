# Laravel Queue Monitor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/samirlama/laravel-queue-monitor.svg)](https://packagist.org/packages/samirlama/laravel-queue-monitor)
[![Total Downloads](https://img.shields.io/packagist/dt/samirlama/laravel-queue-monitor.svg)](https://packagist.org/packages/samirlama/laravel-queue-monitor)
[![License](https://img.shields.io/packagist/l/samirlama/laravel-queue-monitor.svg)](LICENSE)

A lightweight Laravel package for recording failed queue jobs and reviewing them from a simple web dashboard.

The package listens for Laravel's `JobFailed` event, stores the failed job connection, queue, payload, and exception message in a dedicated table, and provides a dashboard where failed jobs can be inspected and queued for retry.

## Features

- Records failed queue jobs automatically.
- Stores failed job metadata in the `failed_jobs_monitor` table.
- Provides a dashboard at `/queue-monitor` by default.
- Allows failed jobs to be pushed back onto their original queue.
- Supports configurable route path and middleware.
- Auto-registers with Laravel package discovery.

## Requirements

- PHP 8.1 or higher
- Laravel 10, 11, 12, or 13
- A configured Laravel queue connection

## Installation

Install the package with Composer:

```bash
composer require samirlama/laravel-queue-monitor
```

Run the package migration:

```bash
php artisan migrate
```

Laravel package discovery will register the service provider automatically.

## Configuration

Publish the configuration file if you want to customize the dashboard route or middleware:

```bash
php artisan vendor:publish --tag=queue-monitor-config
```

This creates `config/queue-monitor.php`:

```php
return [
    'route_path' => 'queue-monitor',
    'middleware' => ['web'],
];
```

### Route Path

By default, the dashboard is available at:

```text
/queue-monitor
```

Change `route_path` to mount the dashboard somewhere else:

```php
'route_path' => 'admin/queue-monitor',
```

### Middleware

The default middleware is `web`. For production applications, protect the dashboard with authentication or authorization middleware:

```php
'middleware' => ['web', 'auth'],
```

## Usage

Start your queue worker as usual:

```bash
php artisan queue:work
```

When a queued job fails, Laravel dispatches a `JobFailed` event. This package records that event in the `failed_jobs_monitor` table.

Visit the dashboard to review failed jobs:

```text
http://your-app.test/queue-monitor
```

Each recorded failure shows:

- Queue name
- Exception message
- Failure timestamp
- Retry action

## Retrying Jobs

The dashboard retry button pushes the original job payload back onto the recorded connection and queue.

After retrying a job, make sure a queue worker is running for that queue:

```bash
php artisan queue:work
```

## Database Table

The package creates a `failed_jobs_monitor` table with these columns:

- `id`
- `connection`
- `queue`
- `payload`
- `exception`
- `created_at`
- `updated_at`

This table is separate from Laravel's default `failed_jobs` table.

## Local Development

After cloning the package, install dependencies:

```bash
composer install
```

If you are testing the package inside a Laravel application, add it as a local path repository in the application's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../laravel-queue-monitor"
        }
    ]
}
```

Then require it from the Laravel application:

```bash
composer require samirlama/laravel-queue-monitor:@dev
```

## Security

The dashboard exposes failed job payloads and exception messages, which may contain sensitive data. Do not expose it publicly without authentication and authorization middleware.

## License

Laravel Queue Monitor is open-sourced software licensed under the MIT license.
