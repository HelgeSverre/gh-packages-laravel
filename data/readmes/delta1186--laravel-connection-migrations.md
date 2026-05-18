# Laravel Connection Migrations

[![Tests](https://github.com/delta1186/laravel-connection-migrations/actions/workflows/tests.yml/badge.svg)](https://github.com/delta1186/laravel-connection-migrations/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/delta1186/laravel-connection-migrations.svg)](https://packagist.org/packages/delta1186/laravel-connection-migrations)
[![License](https://img.shields.io/github/license/delta1186/laravel-connection-migrations.svg)](LICENSE)

Per-connection migration path configuration for Laravel multi-database applications.

Stop passing `--path` on every migration command. Add a `migrations` key to any database connection in `config/database.php` and all migration commands will resolve the correct directory automatically when `--database` is used.

---

## The Problem

Multi-database Laravel apps typically have migrations spread across multiple directories:

```
database/
  migrations/
    2024_01_01_000000_create_users_table.php   ← default (mysql)
  migrations/
    crm/
      2024_01_01_000000_create_orders_table.php ← crm connection
    analytics/
      2024_01_01_000000_create_events_table.php ← analytics connection
```

Without this package, you have to pass `--path` every single time:

```bash
php artisan migrate --database=crm --path=database/migrations/crm
php artisan migrate:rollback --database=crm --path=database/migrations/crm
php artisan migrate:status --database=crm --path=database/migrations/crm
php artisan make:migration create_orders_table --path=database/migrations/crm
```

That's error-prone and tedious. This package lets you configure the path once and forget about it.

---

## The Solution

Add a `migrations` key to each connection in `config/database.php`:

```php
'connections' => [

    'mysql' => [
        'driver' => 'mysql',
        // ...
    ],

    'crm' => [
        'driver' => 'sqlsrv',
        // ...
        'migrations' => 'database/migrations/crm',  // ← add this
    ],

    'analytics' => [
        'driver' => 'pgsql',
        // ...
        'migrations' => 'database/migrations/analytics',  // ← and this
    ],

],
```

Now every migration command resolves the path automatically:

```bash
php artisan migrate --database=crm
php artisan migrate:rollback --database=crm
php artisan migrate:reset --database=crm
php artisan migrate:status --database=crm
php artisan make:migration create_orders_table --database=crm
```

---

## Installation

```bash
composer require delta1186/laravel-connection-migrations
```

The package uses Laravel's [auto-discovery](https://laravel.com/docs/packages#package-discovery) — no need to register the service provider manually.

**Requirements:** PHP 8.2+, Laravel 12.x

---

## Usage

### Step 1 — Configure your connections

In `config/database.php`, add a `migrations` key (relative to your app's base path) to any non-default connection:

```php
'connections' => [

    'mysql' => [
        'driver'    => 'mysql',
        'host'      => env('DB_HOST', '127.0.0.1'),
        'database'  => env('DB_DATABASE', 'app'),
        // No 'migrations' key needed for the default connection
    ],

    'crm' => [
        'driver'    => 'sqlsrv',
        'host'      => env('CRM_DB_HOST'),
        'database'  => env('CRM_DB_DATABASE'),
        'username'  => env('CRM_DB_USERNAME'),
        'password'  => env('CRM_DB_PASSWORD'),
        'migrations' => 'database/migrations/crm',  // relative to base_path()
    ],

],
```

### Step 2 — Use `--database` without `--path`

```bash
# Create a migration — goes to database/migrations/crm automatically
php artisan make:migration create_orders_table --database=crm

# Run migrations for the crm connection
php artisan migrate --database=crm

# Roll back the last batch on crm
php artisan migrate:rollback --database=crm

# Check migration status for crm
php artisan migrate:status --database=crm

# Reset all crm migrations
php artisan migrate:reset --database=crm
```

### `migrate:fresh` and `migrate:refresh`

These commands delegate internally to `migrate` via `$this->call()`, so they inherit the path resolution automatically — no extra configuration needed.

### `schema:dump --prune`

When using `schema:dump --prune` with a connection that has a `migrations` key configured, the correct per-connection migrations directory will be pruned (not the default `database/migrations`):

```bash
php artisan schema:dump --database=crm --prune
# Prunes database/migrations/crm instead of database/migrations
```

---

## How It Works

### Path resolution priority

For `migrate`, `migrate:rollback`, `migrate:reset`, and `migrate:status`, the path is resolved in this order:

1. **`--path` flag** — explicit path always wins
2. **Connection `migrations` config key** — used when `--database` is set and the connection has a `migrations` key
3. **Default `database/migrations`** — fallback when no config key is present

### `make:migration` and `$connection` injection

When you run `make:migration --database=crm`:

- The migration file is written to the connection's configured `migrations` directory (or `database/migrations` if no key is set).
- If the connection is **not** the default connection, `protected $connection = 'crm';` is automatically injected into the generated migration class.

```php
// Generated by: php artisan make:migration create_orders_table --database=crm

return new class extends Migration
{
    protected $connection = 'crm';

    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

If `--database` is the **default** connection (e.g. `mysql`), `$connection` is **not** injected — the migration will use the default connection as expected.

### Explicit `--path` always wins

If you pass `--path`, the `migrations` config key is ignored entirely. This lets you override on a per-run basis without touching your config.

```bash
# Uses --path, ignores the 'migrations' key in config
php artisan migrate --database=crm --path=database/migrations/special
```

### How the package hooks in (no framework modification)

The package's service provider runs at boot and re-binds Laravel's migration command class names in the IoC container with thin subclasses. Because Laravel's `MigrationServiceProvider` is a [deferred provider](https://laravel.com/docs/providers#deferred-providers) (it only resolves when a migration command actually runs), the package's bindings are always registered first and take precedence. No monkey-patching, no Composer patches — just standard Laravel service container re-binding.

### Custom stubs

If you have published custom migration stubs to your application's `stubs/` directory, those will still take precedence over this package's stubs. The `{{ connection }}` placeholder is only required if you want the `$connection` property auto-injected — if you use your own stubs without it, everything else still works normally.

---

## Configuration Reference

| Config key | Type | Description |
|---|---|---|
| `database.connections.{name}.migrations` | `string` | Path (relative to `base_path()`) where migrations for this connection live. Only string values are recognised; arrays are ignored. |

There is no `php artisan vendor:publish` step — the package reads from your existing `config/database.php`.

---

## FAQ

**Does this affect the default connection?**
No. When `--database` is not passed, or when it matches `database.default`, all existing behavior is preserved unchanged.

**What if I don't set a `migrations` key on a connection?**
It falls back to the default `database/migrations` directory — same behavior as before.

**Does this work with `migrate:fresh --seed`?**
Yes. `migrate:fresh` internally calls `migrate` via `$this->call()`, so it inherits the connection path resolution automatically.

**Can I still use `--path` to override?**
Yes. An explicit `--path` always takes priority over the `migrations` config key.

**Will this break my existing migrations?**
No. The `$connection` parameter added to migration stubs defaults to `null`, which renders the `{{ connection }}` placeholder as an empty string — producing identical output to the original stubs for all existing workflows.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for recent changes.

## License

MIT — see [LICENSE](LICENSE).
