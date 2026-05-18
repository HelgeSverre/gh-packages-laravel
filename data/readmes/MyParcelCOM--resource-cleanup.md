# resource-cleanup

[![Tests](https://github.com/myparcelcom/resource-cleanup/actions/workflows/tests.yml/badge.svg)](https://github.com/myparcelcom/resource-cleanup/actions/workflows/tests.yml)

A Laravel package to permanently delete soft-deleted or expired records based on a defined "cleanable" query scope or after a configurable cutoff date.

## Requirements

- PHP 8.2+
- Laravel 9, 10, 11, or 12

## Installation

```bash
composer require myparcelcom/resource-cleanup
```

Update Laravel's package auto-discovery cache

```bash
php artisan package:discover
```

Publish the config file:

```bash
php artisan vendor:publish --tag=resource-cleanup-config
```

## Configuration

`config/resource-cleanup.php`:

```php
return [
    // Records older than this many days will be deleted (default: 90)
    'default_retention_days' => env('RESOURCE_CLEANUP_RETENTION_DAYS', 90),

    // Valid models to clean up
    'models' => [
        \App\Models\Order::class,
        \App\Models\AuditLog::class,
    ],
];
```

## Usage

### Artisan Command

Run cleanup for all models defined in the config:

```bash
php artisan resource-cleanup:run
```

Target specific models from the config:

```bash
php artisan resource-cleanup:run --model=App\\Models\\Order
```

Preview what would be deleted without deleting anything:

```bash
php artisan resource-cleanup:run --dry-run
```

### Per-Model Cutoff Dates

Implement the `CleanableResource` contract on any model to define its own retention period:

```php
use Illuminate\Database\Eloquent\Builder;
use MyParcelCom\ResourceCleanup\Contracts\CleanableResource;

class AuditLog extends Model implements CleanableResource
{
    public static function scopeCleanable(): Builder
    {
        // narrow down the query scope by adding where() clauses
        return self::query();
    }
}
```

## Testing

### With Docker (recommended)

Build the container and run the test suite:

```bash
docker compose run --rm app
```

Run a specific test or filter:

```bash
docker compose run --rm app vendor/bin/phpunit --filter test_it_deletes_soft_deleted_records
```

Drop into a shell inside the container:

```bash
docker compose run --rm app bash
```

Run Composer commands without installing PHP locally:

```bash
docker compose run --rm app composer require some/package
```

### Without Docker

```bash
composer install
composer test
```
