# Laravel Job Log

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codeldev/laravel-job-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-job-log)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-job-log/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/codeldev/laravel-job-log/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-job-log/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/codeldev/laravel-job-log/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/codeldev/laravel-job-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-job-log)

A simple Laravel package that automatically logs all jobs queued and processed by your application to the database. It listens to Laravel's built-in Job Events to record information without wrapping or modifying the Queue itself. Ships with configurable table names, a swappable Eloquent model, and a built-in prune command to manage retention.

---

## Requirements

- PHP 8.4+
- Laravel 13+

---

## Installation

You can install the package via composer:

```bash
composer require codeldev/laravel-job-log
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="job-log-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="job-log-config"
```

This is the contents of the published config file:

```php
return [
    'prune_days' => (int) env('JOB_LOG_PRUNE_DAYS', 365),
    'model' => CodelDev\LaravelJobLog\Models\LaravelJobLog::class,
    'table' => env('JOB_LOG_TABLE', 'job_log'),
];
```

### Environment Variables

The following env variables are available to configure the package using your env file.

```dotenv
JOB_LOG_PRUNE_DAYS=365
JOB_LOG_TABLE=job_log
```

---

## Usage

Once installed, the package automatically logs every job. No additional setup is required.

### Pruning Old Records

Add to your `routes/console.php` file:

```php
Schedule::command('job-log:prune')
    ->weeklyOn(1, '02:30')
    ->withoutOverlapping();
```

Run manually:

```bash
php artisan job-log:prune
```

---

## Querying the Data

The package provides an Eloquent model you can use directly:

```php
use CodelDev\LaravelJobLog\Models\LaravelJobLog;
use CodelDev\LaravelJobLog\Enums\LaravelJobRunStatusEnum;

// Get all logs
LaravelJobLog::all();

// Filter by status
LaravelJobLog::query()
->where('status', LaravelJobRunStatusEnum::SUCCEEDED)
->get();

LaravelJobLog::query()
->where('status', LaravelJobRunStatusEnum::FAILED)
->get();

LaravelJobLog::query()
->where('status', LaravelJobRunStatusEnum::RUNNING)
->get();

// Filter by job class
LaravelJobLog::query()
    ->where('job', 'App\\Jobs\\MyJob')
    ->get();

// Filter by queue
LaravelJobLog::query()
    ->where('queue', 'default')
    ->get();

// Jobs from the last 24 hours
LaravelJobLog::query()
    ->where('started_at', '>=', now()->subDay())
    ->get();

// Slow jobs (over 1 second)
LaravelJobLog::query()
    ->where('duration_ms', '>', 1000)
    ->orderBy('duration_ms', 'desc')
    ->get();

// Failed jobs with exception details
LaravelJobLog::query()
    ->where('status', LaravelJobRunStatusEnum::FAILED)
    ->with('failedJob')
    ->get();

// Paginate results
LaravelJobLog::query()
    ->orderBy('created_at', 'desc')
    ->paginate(15);
```

---

### Available Fields

**LaravelJobLog**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID primary key |
| `job_uuid` | `string\|null` | Laravel's internal job UUID |
| `job` | `string` | Fully qualified job class name |
| `queue` | `string` | Queue name (e.g. `default`) |
| `attempt` | `int` | Attempt number |
| `started_at` | `CarbonImmutable` | When the job started processing |
| `completed_at` | `CarbonImmutable\|null` | When the job finished |
| `status` | `LaravelJobRunStatusEnum` | `RUNNING` (1), `SUCCEEDED` (2), or `FAILED` (3) |
| `duration_ms` | `int\|null` | Execution time in milliseconds |
| `failed_job_id` | `int\|null` | Foreign key to Laravel's `failed_jobs` table |
| `created_at` | `CarbonImmutable\|null` | Record creation timestamp |
| `updated_at` | `CarbonImmutable\|null` | Record update timestamp |

**LaravelJobFailed** (read-only view of Laravel's `failed_jobs` table)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-incrementing primary key |
| `uuid` | `string` | Job UUID |
| `connection` | `string` | Queue connection name |
| `queue` | `string` | Queue name |
| `payload` | `string` | Serialized job payload |
| `exception` | `string` | Exception message and stack trace |
| `failed_at` | `CarbonImmutable` | When the job failed |

The `LaravelJobLog` model has a `failedJob()` relationship that links to `LaravelJobFailed` via the `failed_job_id` column, giving you access to the full exception details for failed jobs.

---

## Using a Custom Model

You can extend the package model to add your own behaviour, scopes, or relationships. Create your custom model, extend the package model, then update the config:

```php
use CodelDev\LaravelJobLog\Models\LaravelJobLog as BaseJobLog;

class JobLog extends BaseJobLog
{
    public function scopeFailed($query)
    {
        return $query->where('status', LaravelJobRunStatusEnum::FAILED);
    }
}
```

Then in `config/job-log.php`:

```php
'model' => \App\Models\JobLog::class,
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
