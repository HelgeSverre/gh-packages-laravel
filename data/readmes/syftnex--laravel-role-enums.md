# Laravel Role Enums

[![Test](https://github.com/syftnex/laravel-role-enums/actions/workflows/ci.yml/badge.svg)](https://github.com/syftnex/laravel-role-enums/actions/workflows/ci.yml)
[![Latest Version](https://img.shields.io/packagist/v/syftnex/laravel-role-enums.svg)](https://packagist.org/packages/syftnex/laravel-role-enums)
[![PHP](https://img.shields.io/badge/PHP-8.2+-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11%20|%2012%20|%2013-red)](https://laravel.com)
[![License](https://img.shields.io/packagist/l/syftnex/laravel-role-enums.svg)](LICENSE)

Infrastructure package to use PHP Backed Enums as roles in Laravel.

This package ships **infrastructure only**. It does not ship any pre-defined roles.

## Installation

```bash
composer require syftnex/laravel-role-enums
```

Publish package files:

```bash
php artisan vendor:publish --tag=role-enums
```

## Configuration

`config/role-enums.php`

```php
return [
    'middleware_alias' => 'role',
    'default_column' => 'role',
    'directives' => [
        'role' => 'role',
        'unless_role' => 'unlessRole',
        'end_unless_role' => 'endUnlessRole',
    ],
    'enums' => [
        'platform' => \App\Enums\PlatformRole::class,
        'org' => \App\Enums\OrgRole::class,
    ],
];
```

## Route Middleware

```php
Route::middleware('role:platform,super_admin')->group(function () {
    Route::get('/admin', AdminController::class);
});

Route::middleware('role:platform,admin,super_admin')->group(function () {
    Route::get('/ops', OpsController::class);
});

Route::middleware('role:org,owner,org_role')->group(function () {
    Route::resource('/projects', ProjectController::class);
});

Route::middleware('role.min:platform,admin')->group(function () {
    Route::get('/reports', ReportsController::class);
});
```

- `role:{alias},{value}[,{value2},...][,{column}]` does strict match checks and accepts OR logic across multiple values.
- `role.min:{alias},{value}[,{column}]` calls `isAtLeast()` when available on your enum.
- For explicit columns, keep the column as the final parameter (example: `role:org,owner,org_role`).

## Blade Directives

```blade
@role('org', 'admin')
    <button>Invite Member</button>
@endrole

@unlessRole('platform', 'restricted')
    <a href="/dashboard">Dashboard</a>
@endUnlessRole
```

Blade checks are guest-safe and return false when no user is authenticated.

Optional directive renaming in config:

```php
'directives' => [
    'role' => 'roleCheck',
    'unless_role' => 'unlessRoleCheck',
    'end_unless_role' => 'endUnlessRoleCheck',
],
```

## HasRole Trait

```php
use Syftnex\RoleEnums\Traits\HasRole;

class User extends Authenticatable
{
    use HasRole;

    protected array $roleColumns = [
        'platform' => 'platform_role',
    ];

    protected $casts = [
        'platform_role' => \App\Enums\PlatformRole::class,
    ];
}
```

```php
$user->hasRole('platform', 'super_admin');
$user->getRole('platform');
$user->isAtLeastRole('platform', 'admin');

User::whereRole('platform', 'admin')->get();
User::whereNotRole('platform', 'viewer')->get();
User::whereAtLeastRole('platform', 'admin')->get();
```

If an enum does not implement `isAtLeast()`, `isAtLeastRole()` throws `UnsupportedOperationException`.
`whereAtLeastRole()` throws the same exception when the enum does not support hierarchy checks.

## Enum options() helper

```php
use Syftnex\RoleEnums\Concerns\ProvidesOptions;
use Syftnex\RoleEnums\Contracts\HasOptions;

enum PlatformRole: string implements HasOptions
{
    use ProvidesOptions;

    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Viewer = 'viewer';
}

PlatformRole::options();
// ['super_admin' => 'Super Admin', 'admin' => 'Admin', 'viewer' => 'Viewer']
```

## Generator

```bash
php artisan make:role-enum UserStatus --migration=users --trait
```

Generates:

- `app/Enums/UserStatus.php`
- `database/migrations/*_add_user_status_to_users_table.php`
- `app/Traits/HasUserStatusRole.php`

Generated stubs are parseable PHP and include commented guidance for enum cases,
optional hierarchy (`isAtLeast`), and model cast examples.

## What This Package Does Not Do

- Does not ship pre-defined role enums or cases.
- Does not create role/permission tables.
- Does not define how roles map to permissions.
- Does not replace Gates or Policies.

## Quality Commands

```bash
composer test
composer lint
composer analyse
composer coverage
```

`composer coverage` requires an installed PHP coverage driver (`xdebug` or `pcov`).
