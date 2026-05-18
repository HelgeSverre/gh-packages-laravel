# Laravel History Logger

`history-logger` is a Laravel package that tracks model changes and stores JSON snapshots for each event in `history_logs`.

It helps developers by giving a built-in model history layer without writing repetitive audit logic in every project.

Key benefits:
- Automatic logging on model events (`created`, `updated`, `deleted`)
- Full data snapshot per entry for easier debugging and traceability
- Actor tracking (`actor_type`, `actor_id`) to know who changed what
- Built-in maintenance commands for pruning and clearing history data
- Optional ready-to-use history viewer page for fast inspection

## Requirements

- PHP 8.0+
- Laravel 8.75, 9.x, 10.x, 11.x, 12.x

## Installation

```bash
composer require fouadfawzi/history-logger
```

## Publish Package Files

Publish config:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-config"
```

Publish migrations:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-migrations"
```

Migration publishing behavior:
- `multi_tenant=false`: main migrations are always included.
- `multi_tenant=true` + `disable_main_db_in_multi_tenant_mode=false` (default): main + tenant migrations.
- `multi_tenant=true` + `disable_main_db_in_multi_tenant_mode=true`: tenant migrations only.

Optional explicit tags:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-migrations-main"
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-migrations-tenant"
```

Optional: publish views:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-views"
```

Run migrations:

```bash
php artisan migrate
```

## Basic Usage

Add the trait to any model:

```php
<?php

namespace App\Models;

use FouadFawzi\HistoryLogger\Traits\LogsHistory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use LogsHistory;

    // Per-model cap: keep only latest 1000 entries for this model.
    protected int $loggerMaxEntries = 1000;
}
```

Now `created`, `updated`, and `deleted` events are logged automatically.

## Who Made The Change (Actor)

The package can store who performed each change:
- `actor_type` (for example `App\Models\User`)
- `actor_id` (for example `5`)

By default, actor tracking is enabled and uses the current authenticated user.
If an action runs from CLI/queue/system without an authenticated user, actor fields stay `null`.

## Excluding Model Columns

You can exclude specific columns per model using a protected array:

```php
protected array $historyLoggerExcluded = [
    'updated_at',
    'internal_note',
];
```

You can also set global exclusions in `config/history-logger.php`:

```php
'excluded_columns' => ['created_at'],
```

## Accessing History

Each model using the trait gets a `historyLogs()` relation:

```php
$order = Order::find(1);
$logs = $order->historyLogs()->latest()->get();
```

The package also ships with a static query helper class:

```php
use FouadFawzi\HistoryLogger\Support\HistoryLog;
```

Get all logs (optional date range):

```php
$all = HistoryLog::list();

$betweenDates = HistoryLog::list(
    startDate: '2026-01-01 00:00:00',
    endDate: '2026-01-31 23:59:59'
);
```

Get logs by filters (`model`, `actor`, `startDate`, `endDate` are all optional):

```php
// Only model logs
$userLogs = HistoryLog::getBy(model: App\Models\User::class);

// Model + actor (recommended actor format)
$userLogsByAdmin = HistoryLog::getBy(
    model: App\Models\User::class,
    actor: ['type' => App\Models\Admin::class, 'id' => 7]
);

// Model + actor (positional actor format is also supported)
$userLogsByAdminPositional = HistoryLog::getBy(
    model: App\Models\User::class,
    actor: [App\Models\Admin::class, 7]
);

// Actor + date range
$actorLogs = HistoryLog::getBy(
    actor: ['type' => App\Models\User::class, 'id' => 5],
    startDate: now()->subWeek(),
    endDate: now()
);
```

Actor filter rules:
- `actor` can be `null`, `['type' => SomeClass::class]`, or `['type' => SomeClass::class, 'id' => 5]`.
- If actor `id` is provided, actor `type` is required.

## Configuration Options

Main config file: `config/history-logger.php`

Useful options:

```php
'events' => ['created', 'updated', 'deleted'],
'track_actor' => true,
'actor_guard' => null,
'max_entries' => 10000000,
'excluded_columns' => [],
'ignored_models' => [],
'multi_tenant' => false,
'disable_main_db_in_multi_tenant_mode' => false,
'only_tenant_mode' => false,
'tenant_migration_path' => database_path('migrations/tenant'),
'table_name' => 'history_logs',
'pivot_table_name' => 'history_loggables',
```

### Global Max Entries

Use `max_entries` to set a hard cap for the total number of rows in `history_logs`.

```php
'max_entries' => 10000000,
```

When this limit is reached, the package removes the oldest entries first, then inserts the newest one.  
This keeps the table size from ever growing above the configured limit.

### Per-Model Max Entries

For model-level caps, define this property on the model:

```php
protected int $loggerMaxEntries = 1000;
```

When this model class reaches 1000 history entries (for example all `User` logs), each new log entry removes the oldest one for that model class.

If you already use `loggerMAxEntries` naming in your codebase, it is also supported.

## Multi-Tenant Mode

If your app is multi-tenant:

1. Publish config.
2. Set:

```php
'multi_tenant' => true,
'disable_main_db_in_multi_tenant_mode' => false, // default: keep publishing main
'only_tenant_mode' => false,
'tenant_migration_path' => database_path('migrations/tenant'),
```

3. Publish migrations again with the same tag:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-migrations"
```

4. Run tenant migrations using your tenant workflow.

If you want to skip publishing main DB migrations when multi-tenant mode is enabled:

```php
'multi_tenant' => true,
'disable_main_db_in_multi_tenant_mode' => true, // publish tenant migrations only
'only_tenant_mode' => false,
```

`only_tenant_mode` controls migration loading for `php artisan migrate`:

```php
'only_tenant_mode' => true, // load tenant migration directory
```

## Optional History Viewer Route

This package ships with a simple Blade page to inspect history entries from the browser.

1. Enable the route and map your model alias in `config/history-logger.php`:

```php
'route' => [
    'enabled' => true,
    'prefix' => 'history-logger',
    'middleware' => ['web', 'auth'], // recommended
    'model_map' => [
        'orders' => App\Models\Order::class,
        'users' => App\Models\User::class,
    ],
],
```

2. Make sure the mapped model uses the `LogsHistory` trait.

3. Open:

`/history-logger/orders/1`

Where:
- `orders` is the key from `model_map`
- `1` is the model ID

4. Optional: publish and customize the Blade view:

```bash
php artisan vendor:publish --provider="FouadFawzi\HistoryLogger\HistoryLoggerServiceProvider" --tag="history-logger-views"
```

Published view location:

`resources/views/vendor/history-logger/history.blade.php`

## Maintenance Commands

Prune logs for a model class:

```bash
php artisan history-logger:prune "App\\Models\\User" --max=1000
```

This keeps only the latest 1000 history entries for `App\Models\User` and deletes older rows.
If related `history_logs` rows become orphaned, they are removed too.
`--max` is optional. If omitted, the command uses the model property `loggerMaxEntries` (if defined).

Clear all history rows and reset auto-increment:

```bash
php artisan history-logger:clear --force
```

`--force` skips the confirmation prompt and executes the delete immediately.

Quick end-to-end logger test:

```bash
php artisan history-logger:test "App\\Models\\User" --email="history-demo@example.com" --iterations=3 --show=5
```

Test date filters quickly:

```bash
php artisan history-logger:test-dates --start="2026-03-01 00:00:00" --end="2026-03-31 23:59:59"
```

With model + actor filters:

```bash
php artisan history-logger:test-dates \
  --model="App\\Models\\User" \
  --actor-type="App\\Models\\User" \
  --actor-id=5 \
  --start="2026-03-01 00:00:00" \
  --end="2026-03-31 23:59:59" \
  --preview=10
```

## License

MIT
