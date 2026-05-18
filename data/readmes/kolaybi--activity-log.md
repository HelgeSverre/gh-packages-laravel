# Activity Log

Standalone activity logging package for Laravel. Logs human-readable business events with i18n entry resolution, queue support, and multi-tenant context.

## Requirements

- PHP 8.4+
- Laravel 12+

## Installation

```bash
composer require kolaybi/activity-log
```

The service provider is auto-discovered. Publish the config and migration:

```bash
php artisan vendor:publish --tag=activity-log-config
php artisan vendor:publish --tag=activity-log-migrations
php artisan migrate
```

## Configuration

```php
// config/kolaybi/activity-log.php

return [
    'model'            => \KolayBi\ActivityLog\Models\Activity::class,
    'context_provider' => null, // falls back to NullContextProvider
    'connection'       => null, // uses default database connection
    'table'            => 'activities',
    'queue'            => [
        'connection' => 'sync',
    ],
];
```

## Usage

### Define an activity group

Create a backed string enum implementing `ActivityGroup`:

```php
use KolayBi\ActivityLog\Contracts\ActivityGroup;

enum MyActivityGroup: string implements ActivityGroup
{
    case NONE    = 'none';
    case COMPANY = 'company';
    case USER    = 'user';
}
```

### Create a concrete activity

Extend `AbstractActivity`, set the `GROUP` constant, and implement `parameters()`:

```php
use KolayBi\ActivityLog\AbstractActivity;

class CompanyCreatedActivity extends AbstractActivity
{
    protected const MyActivityGroup GROUP = MyActivityGroup::COMPANY;

    public function __construct(
        private readonly Company $company,
    ) {}

    protected function parameters(): array
    {
        return [
            'company_name' => $this->company->name,
            'company_type' => $this->company->company_type->value,
        ];
    }
}
```

### Log an activity

```php
CompanyCreatedActivity::with($company)->log();
```

The `log()` method dispatches the record creation as a queued closure. Context (creator, tenant) is resolved eagerly before dispatch, since `Auth`/`Request` aren't available inside queued closures.

### Context provider

Implement `ActivityContextProvider` to supply creator and tenant IDs:

```php
use KolayBi\ActivityLog\Contracts\ActivityContextProvider;

class MyContextProvider implements ActivityContextProvider
{
    public function creatorId(): int|string|null
    {
        return Auth::id();
    }

    public function tenantId(): int|string|null
    {
        return tenant()?->id;
    }
}
```

Register it in your config:

```php
'context_provider' => \App\Providers\MyContextProvider::class,
```

Or bind it directly in a service provider:

```php
$this->app->singleton(
    \KolayBi\ActivityLog\Contracts\ActivityContextProvider::class,
    \App\Providers\MyContextProvider::class,
);
```

### Entry resolution (i18n)

The `Activity` model provides an `entry` attribute that resolves a human-readable string via Laravel's translation system:

```php
// Translation key: activities.App\Activities\CompanyCreatedActivity
// lang/en/activities.php:
// 'App\Activities\CompanyCreatedActivity' => ':company_name (:company_type) was created.',

$activity->entry; // "Acme Corp (regular) was created."
```

Parameters that contain enum references are resolved automatically:

```php
protected function parameters(): array
{
    return [
        'status' => [
            'enum'     => Status::class,
            'value'    => $this->model->status->value,
            'function' => 'label',
        ],
    ];
}
```

### Custom Activity model

Extend the package model and update the config:

```php
use KolayBi\ActivityLog\Models\Activity as BaseActivity;

class Activity extends BaseActivity
{
    protected $connection = 'my_connection';

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'group' => MyActivityGroup::class,
        ]);
    }
}
```

```php
'model' => \App\Models\Activity::class,
```

## Database schema

| Column       | Type              | Notes                        |
|--------------|-------------------|------------------------------|
| `id`         | ULID              | Primary key                  |
| `created_at` | Timestamp         |                              |
| `updated_at` | Timestamp         |                              |
| `deleted_at` | Timestamp         | Soft deletes                 |
| `tenant_id`  | String (nullable) | Indexed                      |
| `creator_id` | String (nullable) | Indexed                      |
| `group`      | String            | Indexed                      |
| `type`       | String            | Indexed, activity class FQCN |
| `parameters` | JSON              | Translation parameters       |

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/kolaybi/.github/blob/master/CONTRIBUTING.md) for details.

## License

Please see [License File](LICENSE.md) for more information.
