# Laravel Event Logs

[![Packagist Version](https://img.shields.io/packagist/v/codebar-ag/laravel-event-logs.svg)](https://packagist.org/packages/codebar-ag/laravel-event-logs)
[![Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-event-logs.svg)](https://packagist.org/packages/codebar-ag/laravel-event-logs/stats)
[![License](https://img.shields.io/packagist/l/codebar-ag/laravel-event-logs.svg)](https://github.com/codebar-ag/laravel-event-logs/blob/main/LICENSE)
[![PHP Version](https://img.shields.io/packagist/php-v/codebar-ag/laravel-event-logs?logo=php&logoColor=white)](https://packagist.org/packages/codebar-ag/laravel-event-logs)
[![Laravel Version](https://img.shields.io/badge/Laravel-13.x%2B-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![Tests](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/run-tests.yml/badge.svg)](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/run-tests.yml)
[![PHPStan](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/phpstan.yml/badge.svg)](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/phpstan.yml)
[![Coverage](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/pest-coverage.yml/badge.svg)](https://github.com/codebar-ag/laravel-event-logs/actions/workflows/pest-coverage.yml)

This package records HTTP requests and model lifecycle events as rows in your database. Configure a **dedicated database connection** for the `event_logs` table so logging stays isolated from your primary application data.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Database Connection](#database-connection)
  - [Schema Management](#schema-management)
  - [Configuration reference](#configuration-reference)
- [Upgrading](#upgrading)
- [Usage](#usage)
  - [Middleware Request Logging](#middleware-request-logging)
  - [Model Event Logging](#model-event-logging)
  - [Adding Context](#adding-context)

## Requirements

- Laravel 13+
- PHP 8.3+
- A database connection for event logs (can be your default connection, but a separate connection is recommended)

## Installation

### Composer Install

```bash
composer require codebar-ag/laravel-event-logs
```

### Publish Configuration

```bash
php artisan vendor:publish --provider="CodebarAg\\LaravelEventLogs\\LaravelEventLogsServiceProvider"
```

This publishes `config/laravel-event-logs.php` and `config/laravel-event-logs-exclude-routes-defaults.php` (Nova/Livewire route skip list). Override `exclude_routes` in the main config file if you need a custom list; you can delete the defaults file from your app if you inline the array.

### Publish Migrations (Optional)

If you want to customize the migrations or need them in your application's `database/migrations` directory, you can publish them:

```bash
php artisan vendor:publish --tag=laravel-event-logs-migrations
```

**Note**: Migrations are automatically loaded from the package, so publishing is optional. However, if you plan to use the `event-logs:schema:create` command, it's recommended to publish the migrations first, or the command will automatically publish them for you.

## Configuration

### Database Connection

By default, the package uses your application's default database connection. You can specify a custom database connection for event logs by setting the `connection` option in your configuration file:

```php
// config/laravel-event-logs.php
return [
    'enabled' => env('EVENT_LOGS_ENABLED', false),
    'connection' => env('EVENT_LOGS_CONNECTION', null), // Set to null to use default connection
    // ... other configuration
];
```

Or via environment variable:

```bash
EVENT_LOGS_CONNECTION=event_logs_db
```

This is useful when you want to store event logs in a separate database for better performance or isolation.

When `enabled` is `true`, `EventLog::isEnabled()` also requires `connection` to be a **non-empty** string. Set `EVENT_LOGS_CONNECTION` (or the config value) to your connection name; use your app’s default connection name explicitly if you do not use a dedicated logs connection.

### Schema Management

The package provides Artisan commands to manage the event logs database schema:

#### Create Schema

Create the database schema for event logs:

```bash
php artisan event-logs:schema:create
```

This command will:
- Check if the event logs connection is configured
- Exit successfully if the `event_logs` table already exists
- Publish package migrations to `database/migrations/` if needed
- Run `php artisan migrate` for the single package migration (`2026_04_10_000000_create_event_logs_table.php`), creating the full table (including `response_status`, `duration_ms`, and string `subject_id`) in one step
- Fail with Artisan output if `migrate` returns a non-zero exit code

**Note**: The command requires the `connection` configuration to be set. Migrations are published into your app so the path is under the application root (required by Laravel’s migrator).

#### Update Schema

Reconcile the live `event_logs` table with the package definition (columns and indexes in order). Use this when the table already exists but may be missing columns (for example after a partial manual setup or an old install):

```bash
php artisan event-logs:schema:update
```

This command will:

- Require the event logs `connection` configuration (same as create/drop)
- **Create** the full `event_logs` table if it is missing (same layout as the package migration)
- Otherwise **add** any missing columns, then try to **convert** legacy integer `subject_id` to `string(36)` when detected, then **ensure** indexes (duplicate index errors are ignored)
- Print what changed, or `Schema is already up to date.` when nothing was needed

Converting `subject_id` on MySQL, PostgreSQL, or SQL Server often needs **`doctrine/dbal`**; the package lists it under `composer suggest`. For apps that only use Laravel’s migration history on a clean database, `php artisan migrate` is usually enough.

#### Drop Schema

Drop the database schema for event logs:

```bash
php artisan event-logs:schema:drop
```

Or with the force option (no confirmation):

```bash
php artisan event-logs:schema:drop --force
```

This command will:
- Check if the event logs connection is configured
- Verify if the schema exists
- Drop the `event_logs` table if it exists

**Warning**: This will permanently delete all event logs data. Use with caution.

### Configuration reference

Published defaults live in `config/laravel-event-logs.php`. Common keys (see the file for the full list and inline comments):

| Area | Keys / env |
|------|------------|
| Feature toggle | `enabled` (`EVENT_LOGS_ENABLED`) |
| DB connection | `connection` (`EVENT_LOGS_CONNECTION`) — required when enabled |
| Writes | `persist_mode` (`EVENT_LOGS_PERSIST_MODE`: `sync` or `queued`), `queue.connection`, `queue.queue` |
| Sanitization | `sanitize.request_headers_exclude`, `sanitize.request_data_exclude` |
| Context stored on rows | `context.enabled`, `context.allow_keys` (comma-separated env `EVENT_LOGS_CONTEXT_ALLOW_KEYS`), `context.max_keys`, `context.max_json_bytes` |
| HTTP user lookup | `user_resolution.guards`, `user_resolution.scan_all_guards` |
| Route skipping | `exclude_routes` (defaults loaded from `config/laravel-event-logs-exclude-routes-defaults.php` in the package), `exclude_routes_match` (`EVENT_LOGS_EXCLUDE_ROUTES_MATCH`: `auto` default, or `exact`, `wildcard`) |

## Upgrading

The package ships **one** migration: [`database/migrations/2026_04_10_000000_create_event_logs_table.php`](database/migrations/2026_04_10_000000_create_event_logs_table.php). It creates `event_logs` with the full current schema (HTTP metrics columns, string `subject_id`, no Azure-era sync columns). If the table already exists, `up()` does nothing (safe when upgrading).

**If you previously published older package migrations** (`2025_08_09_*`, `2026_04_07_*`, `2026_04_08_*`), remove those files from your app’s `database/migrations` and publish again (or copy the new migration only) so you do not duplicate `create_event_logs` migrations.

**HTTP middleware** must remain a **terminable** middleware in the stack (Laravel invokes `terminate()` automatically when registered via `append` / the HTTP kernel). If you only call `handle()` in custom tests, call `terminate($request, $response)` yourself.

**Breaking changes (recent versions)**

- Azure Event Hubs and `EventLogTransport` were removed; logs are stored only in the database.
- `EventLog::toProviderPayload()`, `legacy_to_array_provider_payload`, and Azure-shaped `toArray()` are removed; use normal Eloquent `toArray()` / API resources as needed.
- `exclude_routes_match` defaults to `auto` so shipped `exclude_routes` prefix entries (e.g. `nova.`) work. Set `EVENT_LOGS_EXCLUDE_ROUTES_MATCH=exact` if you only list full route names.

## Usage

### Middleware Request Logging

The `EventLogMiddleware` automatically logs all HTTP requests after the response is available. Add it to your application:

#### Configuration

```php
// config/laravel-event-logs.php (illustrative — publish for full defaults)
return [
    'enabled' => env('EVENT_LOGS_ENABLED', false),
    'connection' => env('EVENT_LOGS_CONNECTION', null), // non-empty when enabled
    'persist_mode' => env('EVENT_LOGS_PERSIST_MODE', 'sync'),
    'exclude_routes_match' => env('EVENT_LOGS_EXCLUDE_ROUTES_MATCH', 'auto'),
    'exclude_routes' => [
        'livewire.',
        'nova.',
    ],
    'user_resolution' => [
        'guards' => null, // or e.g. ['web', 'sanctum']
        'scan_all_guards' => false,
    ],
    'context' => [
        'enabled' => true,
        'allow_keys' => [], // empty = all keys; or restrict via EVENT_LOGS_CONTEXT_ALLOW_KEYS
        'max_keys' => null,
        'max_json_bytes' => null,
    ],
    'sanitize' => [
        'request_headers_exclude' => [
            'authorization',
            'cookie',
            'x-csrf-token',
        ],
        'request_data_exclude' => [
            'password',
            'password_confirmation',
            '_token',
            'token',
        ],
    ],
];
```

#### Implementation

```php
// bootstrap/app.php
use CodebarAg\LaravelEventLogs\Middleware\EventLogMiddleware;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            EventLogMiddleware::class,
        ]);
    })
    ->create();
```

#### Logged Data

The middleware logs these HTTP request details:

- **Request Information**: Method, URL, route name, IP address
- **Response**: HTTP status code and duration in milliseconds
- **Request User**: Authenticated user type and ID (see `user_resolution` in config)
- **Request Data**: Sanitized headers and payload
- **Context**: Filtered application context (`context.*` config: allowlist, max keys, max JSON bytes)

Optional: set `persist_mode` to `queued` and configure `queue.connection` / `queue.queue` to write rows via `RecordEventLogJob`.

#### Example Output

```php
// Illustrative attributes persisted on the event_logs row (see EventLog model / toArray())
[
    'uuid' => '550e8400-e29b-41d4-a716-446655440000',
    'type' => 'http',
    'subject_type' => null,
    'subject_id' => null,
    'user_type' => 'App\Models\User',
    'user_id' => 456,
    'request_route' => 'users.store',
    'response_status' => 201,
    'duration_ms' => 42,
    'request_method' => 'POST',
    'request_url' => 'https://example.com/api/users',
    'request_ip' => '192.168.1.100',
    'request_headers' => ['Content-Type' => 'application/json'],
    'request_data' => ['name' => 'John', 'email' => 'john@example.com'],
    'event' => null,
    'event_data' => null,
    'context' => ['locale' => 'de_CH', 'environment' => 'production'],
    'created_at' => '2024-01-15T10:30:00+00:00',
]
```

### Model Event Logging

Use the `HasEventLogTrait` to automatically log model events (created, updated, deleted, restored). Rows are written through the same `EventLogRecorder` as HTTP logs, so `persist_mode` (`sync` or `queued`) applies here too.

#### Implementation

```php
<?php

namespace App\Models;

use CodebarAg\LaravelEventLogs\Traits\HasEventLogTrait;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasEventLogTrait;
    
    // Your model code...
}
```

#### Logged Data

The trait automatically logs these events:

- **`created`**: When a model is created
- **`updated`**: When a model is updated  
- **`deleted`**: When a model is deleted
- **`restored`**: When a soft-deleted model is restored (if using SoftDeletes)

Each model event logs:
- Event type (created, updated, deleted, restored)
- Model class and ID
- User who triggered the event
- Model attributes (for created events)
- Changes made (for updated events)
- Original values (for updated events)
- Dirty keys (for updated events)
- Context information

#### Example Output

```php
// Illustrative attributes when a User model is created:
[
    'uuid' => '550e8400-e29b-41d4-a716-446655440000',
    'type' => 'model',
    'subject_type' => 'App\Models\User',
    'subject_id' => '123',
    'user_type' => 'App\Models\User',
    'user_id' => 456,
    'request_route' => null,
    'response_status' => null,
    'duration_ms' => null,
    'request_method' => null,
    'request_url' => null,
    'request_ip' => null,
    'request_headers' => null,
    'request_data' => null,
    'event' => 'created',
    'event_data' => [
        'event' => 'created',
        'model_type' => 'App\Models\User',
        'model_id' => 123,
        'attributes' => ['name' => 'John', 'email' => 'john@example.com'],
        'changes' => [],
        'original' => [],
        'dirty_keys' => [],
    ],
    'context' => ['tenant_id' => 1],
    'created_at' => '2024-01-15T10:30:00+00:00',
]
```

### Adding Context

Use Laravel’s `Context` facade to add data that can be persisted on `event_logs` rows. What actually gets stored is filtered by the `context` config (`enabled`, optional `allow_keys`, `max_keys`, `max_json_bytes`) — see [Configuration reference](#configuration-reference).

For example, set context in middleware that runs **before** `EventLogMiddleware`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;

class SetRequestContext
{
    public function handle(Request $request, Closure $next)
    {
        // Add request context
        Context::add('locale', app()->getLocale());
        return $next($request);
    }
}
```

Register the context middleware before EventLogMiddleware:

```php
// bootstrap/app.php
use App\Http\Middleware\SetRequestContext;
use CodebarAg\LaravelEventLogs\Middleware\EventLogMiddleware;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            SetRequestContext::class,
            EventLogMiddleware::class,
        ]);
    })
    ->create();
```
