# Laravel ClickHouse

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ariadata/laravel-clickhouse.svg?style=flat-square)](https://packagist.org/packages/ariadata/laravel-clickhouse)

**`ariadata/laravel-clickhouse`** — a Laravel database driver for [ClickHouse](https://clickhouse.com/) with Eloquent, the query builder, schema tooling, and ClickHouse-specific query helpers.

Forked and maintained from [`kundan-in/clickhouse-laravel`](https://github.com/kundan-in/clickhouse-laravel) with a new vendor namespace: **`Ariadata\LaravelClickHouse`**.

## Requirements

- PHP **8.3+**
- Laravel **13.x**
- ClickHouse server (HTTP interface, default port **8123**)

## Installation

```bash
composer require ariadata/laravel-clickhouse
```

Laravel will auto-discover `ClickHouseServiceProvider` and register the `ClickHouse` facade.

## Configuration

### 1. Publish config (optional)

```bash
php artisan vendor:publish --provider="Ariadata\LaravelClickHouse\ClickHouseServiceProvider" --tag="clickhouse-config"
```

### 2. Environment

```env
CLICKHOUSE_HOST=127.0.0.1
CLICKHOUSE_PORT=8123
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default
```

### 3. `config/database.php`

```php
'connections' => [
    // ...

    'clickhouse' => [
        'driver' => 'clickhouse',
        'host' => env('CLICKHOUSE_HOST', '127.0.0.1'),
        'port' => env('CLICKHOUSE_PORT', 8123),
        'username' => env('CLICKHOUSE_USERNAME', 'default'),
        'password' => env('CLICKHOUSE_PASSWORD', ''),
        'database' => env('CLICKHOUSE_DATABASE', 'default'),
        'settings' => [
            'readonly' => env('CLICKHOUSE_READONLY', 0),
            'max_execution_time' => env('CLICKHOUSE_MAX_EXECUTION_TIME', 60),
        ],
    ],
],
```

## Usage

### Eloquent model

```php
<?php

namespace App\Models;

use Ariadata\LaravelClickHouse\Database\ClickHouseModel;

class AnalyticsEvent extends ClickHouseModel
{
    protected $connection = 'clickhouse';

    protected $table = 'analytics_events';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'properties' => \Ariadata\LaravelClickHouse\Casts\ClickHouseJson::class,
            'tags' => \Ariadata\LaravelClickHouse\Casts\ClickHouseArray::class,
        ];
    }
}
```

### Facade

```php
use Ariadata\LaravelClickHouse\Facades\ClickHouse;

$rows = ClickHouse::select('SELECT * FROM analytics_events WHERE user_id = ?', [1]);

ClickHouse::healthCheck();
ClickHouse::getServerVersion();

ClickHouse::table('analytics_events')
    ->where('created_at', '>=', today())
    ->get();
```

### Schema (ClickHouse engines, `MergeTree`, etc.)

Use `Schema::connection('clickhouse')` with the package’s blueprint helpers — see `SPEC.md` and tests for examples.

## Migrating from `kundan-in/clickhouse-laravel`

1. Replace the Composer package with `ariadata/laravel-clickhouse`.
2. Find/replace namespace **`KundanIn\ClickHouseLaravel`** → **`Ariadata\LaravelClickHouse`** in your app (models, facades, casts, imports).
3. Republish config if you reference the old provider name in docs/scripts.

## Development

```bash
composer install
composer test
```

## License

MIT. See [LICENSE](LICENSE). Includes copyright of the original author; see [CHANGELOG.md](CHANGELOG.md).

## Contributing

Issues and pull requests are welcome in this repository’s GitHub project.
