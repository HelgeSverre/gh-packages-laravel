# Laravel Auditable

Declarative model audit logging for Laravel using PHP attributes.

## Overview

Laravel Auditable provides a simple, attribute-based approach to audit logging for Eloquent models. Mark any model with the `#[Auditable]` attribute and all create, update, and delete events are automatically logged with detailed change tracking.

### Features

- Declarative `#[Auditable]` attribute on models
- Tracks `created`, `updated`, `deleted`, `soft_deleted`, and `restored` events
- Old/new value tracking for updates
- Column filtering (include, exclude, redact)
- Per-model event filtering
- Soft delete detection
- Boolean cast normalization
- JSON output for log aggregation (Datadog, Splunk, etc.)
- Extensible context providers for custom metadata
- Configurable formatters

## Requirements

- PHP 8.3+
- Laravel 11+

## Installation

```bash
composer require ss-ipg/laravel-auditable
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=auditable-config
```

## Quick Start

### 1. Configure a log channel

Add an `audit` channel to `config/logging.php`:

```php
'channels' => [
    // ...

    'audit' => [
        'driver' => 'daily',
        'path' => storage_path('logs/audit.log'),
        'level' => 'info',
        'days' => 14,
    ],
],
```

### 2. Add the attribute to a model

```php
use SSIPG\Auditable\Attributes\Auditable;

#[Auditable]
class User extends Model
{
    // ...
}
```

### 3. Enable audit logging

In your `.env` file:

```
AUDITABLE_ENABLED=true
```

That's it! All changes to the model will now be logged.

## Configuration

```php
// config/auditable.php

return [
    // Enable/disable audit logging at runtime
    'enabled' => env('AUDITABLE_ENABLED', false),

    // Environments where logging is permitted
    // Use ['*'] to allow all environments
    'environments' => ['local', 'production', 'staging'],

    // Log channel name (must exist in config/logging.php)
    'channel' => 'audit',

    // Context providers for adding custom metadata
    'context_providers' => [
        // App\Audit\CustomContextProvider::class,
    ],

    // Formatter class for serializing log entries
    'formatter' => SSIPG\Auditable\Formatters\JsonFormatter::class,
];
```

> **Note**: Set `environments` to `['*']` to enable audit logging in all environments regardless of `APP_ENV`.

## Attribute Options

The `#[Auditable]` attribute accepts several options:

| Option         | Type     | Default    | Description                                                       |
|----------------|----------|------------|-------------------------------------------------------------------|
| `columns`      | `?array` | `null`     | Only audit these columns. `null` = all columns.                   |
| `exclude`      | `array`  | `[]`       | Exclude these columns from auditing.                              |
| `redact`       | `array`  | `[]`       | Log that column changed, but show `[REDACTED]` instead of values. |
| `events`       | `array`  | All events | Which events to audit.                                            |
| `withOriginal` | `bool`   | `true`     | Include original values in update logs.                           |

### Examples

```php
use SSIPG\Auditable\Attributes\Auditable;
use SSIPG\Auditable\Enums\AuditAction;

// Audit everything (default)
#[Auditable]
class User extends Model {}

// Only audit specific columns
#[Auditable(columns: ['email', 'status'])]
class User extends Model {}

// Audit all except certain columns
#[Auditable(exclude: ['cached_data', 'last_seen_at'])]
class User extends Model {}

// Redact sensitive values
#[Auditable(redact: ['password', 'api_key'])]
class User extends Model {}

// Only audit deletions (compliance mode)
#[Auditable(events: [AuditAction::Deleted, AuditAction::SoftDeleted])]
class HighVolumeModel extends Model {}

// Don't track original values on updates (smaller logs)
#[Auditable(withOriginal: false)]
class User extends Model {}

// Combined options
#[Auditable(
    columns: ['email', 'password', 'role'],
    redact: ['password'],
    events: [AuditAction::Updated, AuditAction::Deleted],
    withOriginal: false,
)]
class User extends Model {}
```

## Log Output

Each audit entry is a JSON object with the following structure:

```json
{
  "action": "updated",
  "context": "web",
  "model": "App\\Models\\User",
  "model_id": 123,
  "user_id": 456,
  "ip": "192.168.1.1",
  "timestamp": "2026-01-07T15:30:00+00:00",
  "changes": {
    "email": {
      "old": "old@example.com",
      "new": "new@example.com"
    }
  }
}
```

### Default Fields

These fields are automatically included in every audit entry:

| Field       | Source                                                                |
|-------------|-----------------------------------------------------------------------|
| `action`    | The event type (`created`, `updated`, `deleted`, etc.)                |
| `context`   | `"web"` or `"cli"` based on how the application is running            |
| `model`     | The fully-qualified model class name                                  |
| `model_id`  | The model's primary key value                                         |
| `user_id`   | `auth()->id()` — the authenticated user, or `null` if unauthenticated |
| `ip`        | `request()->ip()` — the client IP address                             |
| `timestamp` | ISO 8601 formatted timestamp                                          |

### Changes Structure

The `changes` field varies by event type:

- **`created`**: All tracked attribute values
- **`updated`**: Only changed attributes with `old` and `new` values (or just new values if `withOriginal: false`)
- **`deleted`**, **`soft_deleted`**, **`restored`**: Only the model ID (`{"id": 123}`)

### Soft Delete Detection

When a model uses Laravel's `SoftDeletes` trait, the package automatically distinguishes between soft deletes and hard deletes:

- **`soft_deleted`**: Logged when `delete()` is called on a soft-deletable model
- **`deleted`**: Logged when `forceDelete()` is called, or when deleting a model without `SoftDeletes`
- **`restored`**: Logged when `restore()` is called on a soft-deleted model

No configuration is needed—the package detects the `SoftDeletes` trait automatically.

### Cast Normalization

The package respects your model's `$casts` to prevent false-positive change detection. For example:

```php
// In your model
protected $casts = ['is_active' => 'boolean'];

// These are considered equivalent (no update logged):
$model->is_active = true;
$model->is_active = 1;    // Cast to true
$model->is_active = '1';  // Cast to true
```

This applies to `boolean`, `integer`, `float`, `string`, `array`, and `json` casts.

## Context Providers

Context providers allow you to add custom metadata to every audit log entry. Create a class that implements `AuditContextProvider`:

```php
namespace App\Audit;

use Illuminate\Database\Eloquent\Model;
use SSIPG\Auditable\Contracts\AuditContextProvider;
use SSIPG\Auditable\Enums\AuditAction;

class CustomContextProvider implements AuditContextProvider
{
    public function getContext(Model $model, AuditAction $action): array
    {
        return [
            'custom_id' => $model->custom_id,
        ];
    }
}
```

Register the provider in `config/auditable.php`:

```php
'context_providers' => [
    App\Audit\CustomContextProvider::class,
],
```

## Custom Formatters

To customize the log output format, create a class that implements `AuditFormatter`:

```php
namespace App\Audit;

use SSIPG\Auditable\Contracts\AuditFormatter;

class CustomFormatter implements AuditFormatter
{
    public function format(array $payload): string
    {
        // Return your formatted string
        return json_encode($payload, JSON_PRETTY_PRINT);
    }
}
```

Register it in `config/auditable.php`:

```php
'formatter' => App\Audit\CustomFormatter::class,
```

## Auditing Pivot Tables

Standard `attach()`, `detach()`, and `sync()` operations bypass Eloquent model events. To audit pivot table changes, use a custom Pivot model:

```php
use Illuminate\Database\Eloquent\Relations\Pivot;
use SSIPG\Auditable\Attributes\Auditable;

#[Auditable]
class ProjectUserPivot extends Pivot
{
    protected $table = 'project_user';
}
```

Then reference it in your relationships:

```php
// app/Models/Project.php
public function users(): BelongsToMany
{
    return $this->belongsToMany(User::class)->using(ProjectUserPivot::class);
}

// app/Models/User.php
public function projects(): BelongsToMany
{
    return $this->belongsToMany(Project::class)->using(ProjectUserPivot::class);
}
```

## Testing

The package provides `Audit::fake()` for testing auditable models without writing to actual log files.

### Basic Usage

```php
use SSIPG\Auditable\Facades\Audit;
use SSIPG\Auditable\Enums\AuditAction;

public function test_user_creation_is_audited(): void
{
    Audit::fake();

    User::create(['name' => 'John', 'email' => 'john@example.com']);

    Audit::assertLogged(AuditAction::Created);
}
```

### Available Assertions

```php
// Assert an action was logged
Audit::assertLogged(AuditAction::Created);
Audit::assertLogged(AuditAction::Updated);
Audit::assertLogged(AuditAction::Deleted);
Audit::assertLogged(AuditAction::SoftDeleted);
Audit::assertLogged(AuditAction::Restored);

// Assert with callback for detailed matching
Audit::assertLogged(
    action: AuditAction::Created,
    callback: fn (array $entry) => $entry['model'] === User::class
        && $entry['changes']['email'] === 'john@example.com'
);

// Assert an action was NOT logged
Audit::assertNotLogged(AuditAction::Updated);

// Assert nothing was logged
Audit::assertNothingLogged();

// Assert exact count of entries
Audit::assertLoggedCount(2);

// Get all logged entries for inspection
$entries = Audit::logged();
$createdEntries = Audit::logged(AuditAction::Created);
```

### Entry Structure

Each captured entry contains:

```php
[
    'action'   => AuditAction::Created,  // The action enum
    'model'    => 'App\\Models\\User',   // Model class name
    'model_id' => 123,                   // Model primary key
    'changes'  => [                      // Changed attributes
        'name' => 'John',
        'email' => 'john@example.com',
    ],
]
```

## Known Limitations

- **Mass operations bypass events**: `Model::insert()`, `Model::update()` (query builder), and similar mass operations do not fire Eloquent events and will not be audited. Use model instances for auditable operations.
- **Timestamp columns excluded**: `created_at`, `updated_at`, and `deleted_at` are always excluded from change tracking (the audit log has its own timestamp).

## License

MIT License. See [LICENSE](LICENSE) for details.
