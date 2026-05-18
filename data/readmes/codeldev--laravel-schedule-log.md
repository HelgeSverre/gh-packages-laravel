# Laravel Schedule Log

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codeldev/laravel-schedule-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-schedule-log)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-schedule-log/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/codeldev/laravel-schedule-log/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-schedule-log/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/codeldev/laravel-schedule-log/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/codeldev/laravel-schedule-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-schedule-log)

A simple Laravel package that automatically logs every scheduled command execution to your database. It listens to Laravel's built-in scheduler
events to record information without wrapping or modifying the scheduler itself. Ships with configurable table names, swappable Eloquent models, and a built-in prune command to manage retention.

**Pest Tests:** 100% Code Coverage | **PHP Stan**: Level Max

---

## Requirements

- PHP 8.4+
- Laravel 13+

---

## Installation

You can install the package via composer:

```bash
composer require codeldev/laravel-schedule-log
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="schedule-log-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="schedule-log-config"
```

This is the contents of the published config file:

```php
return [
    'prune_days' => (int) env('SCHEDULE_LOG_PRUNE_DAYS', 365),
    'models' => [
        'commands' => CodelDev\LaravelScheduleLog\Models\LaravelScheduledCommand::class,
        'history'  => CodelDev\LaravelScheduleLog\Models\LaravelScheduledCommandHistory::class,
    ],
    'tables' => [
        // Stores the scheduled commands
        'commands' => env('SCHEDULE_LOG_TABLE_COMMANDS', 'scheduled_commands'),
        'history'  => env('SCHEDULE_LOG_TABLE_HISTORY', 'scheduled_commands_history'),
    ],
];
```

### Environment Variables

The following env variables are available to configure the package using your env file.

```dotenv
SCHEDULE_LOG_PRUNE_DAYS=365
SCHEDULE_LOG_TABLE_COMMANDS=scheduled_commands
SCHEDULE_LOG_TABLE_HISTORY=scheduled_commands_history
```

---

## ⚠️ Required!

> In order for the output to be stored for each command, you must add the `storeOutput()` method to your schedule command.

```php
Schedule::command('custom:command')
    ->storeOutput()
    ->weeklyOn(1, '02:30')
    ->withoutOverlapping();
```

---

## Usage

Add to your `routes/console.php` file:

```php
Schedule::command('schedule-log:prune')
    ->weeklyOn(1, '02:30')
    ->withoutOverlapping();
```

Run manually:

```bash
php artisan schedule-log:prune
```

---

## Querying the Data

The package provides two Eloquent models you can use directly:

```php
use CodelDev\LaravelScheduleLog\Models\LaravelScheduledCommand;
use CodelDev\LaravelScheduleLog\Models\LaravelScheduledCommandHistory;

// Get all logged commands
$commands = LaravelScheduledCommand::all();

// Get history for a specific command
$history = LaravelScheduledCommand::query()
    ->where('command', 'inspire')
    ->with('history')
    ->first()
    ->history;

// Get all failed runs
$failed = LaravelScheduledCommandHistory::query()
    ->where('status', LaravelScheduledRunStatusEnum::FAILED)
    ->latest('started_at')
    ->get();

// Get the last run for a command
$lastRun = LaravelScheduledCommandHistory::query()
    ->whereHas('scheduledCommand', fn ($q) => $q->where('command', 'inspire'))
    ->latest('started_at')
    ->first();
```

---

### Available Fields

**LaravelScheduledCommand**

| Field         | Type               |
|---------------|--------------------|
| `id`          | `string` (UUID)    |
| `command`     | `string`           |
| `description` | `string\|null`     |
| `created_at`  | `CarbonImmutable`  |
| `updated_at`  | `CarbonImmutable`  |

**LaravelScheduledCommandHistory**

| Field                  | Type                           |
|------------------------|--------------------------------|
| `id`                   | `string` (UUID)                |
| `scheduled_command_id` | `string` (UUID)                |
| `started_at`           | `CarbonImmutable`              |
| `completed_at`         | `CarbonImmutable\|null`        |
| `status`               | `LaravelScheduledRunStatusEnum`|
| `output`               | `string\|null`                 |
| `error`                | `string\|null`                 |
| `duration_ms`          | `int\|null`                    |
| `created_at`           | `CarbonImmutable`              |
| `updated_at`           | `CarbonImmutable`              |

---

## Using Custom Models

You can extend the package models to add your own behaviour, scopes, or relationships. Create your custom model, extend the package model, then update the config:

```php
use CodelDev\LaravelScheduleLog\Models\LaravelScheduledCommandHistory as BaseHistory;

class ScheduledCommandHistory extends BaseHistory
{
    public function scopeFailed($query)
    {
        return $query->where('status', LaravelScheduledRunStatusEnum::FAILED);
    }
}
```

Then in `config/schedule-log.php`:

```php
'models' => [
    'commands' => \App\Models\ScheduledCommand::class,
    'history'  => \App\Models\ScheduledCommandHistory::class,
],
```

---

## Testing

```bash
composer test
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

---

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

---

## Credits

- [CodelDev](https://github.com/CodelDev)

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
