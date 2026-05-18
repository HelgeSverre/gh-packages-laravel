# Laravel Permissions Manager

[![Latest Version on Packagist](https://img.shields.io/packagist/v/deifhelt/laravel-permissions-manager.svg?style=flat-square)](https://packagist.org/packages/deifhelt/laravel-permissions-manager)
[![Total Downloads](https://img.shields.io/packagist/dt/deifhelt/laravel-permissions-manager.svg?style=flat-square)](https://packagist.org/packages/deifhelt/laravel-permissions-manager)
[![License](https://img.shields.io/packagist/l/deifhelt/laravel-permissions-manager.svg?style=flat-square)](https://packagist.org/packages/deifhelt/laravel-permissions-manager)

A powerful wrapper around `spatie/laravel-permission` that manages permissions and roles through a simple configuration file.

## Features

-   **Config-Driven**: Define permissions in `config/permissions.php`
-   **Auto-CRUD Generation**: Automatically generates CRUD permissions
-   **Smart Syncing**: Efficient database synchronization
-   **Smart Translations**: Automatic human-readable labels
-   **Policy Trait**: Simplify authorization with `HasPermissionCheck`

> **Note**: This package wraps `spatie/laravel-permission`. For advanced features like blade directives, middleware usage, caching, and direct role/permission assignment, see the [official Spatie documentation](https://spatie.be/docs/laravel-permission/v6/introduction).

## Installation

Install via Composer (Spatie Permission is included automatically):

```bash
composer require deifhelt/laravel-permissions-manager
```

Publish this package configuration:

```bash
php artisan vendor:publish --provider="Deifhelt\LaravelPermissionsManager\PermissionManagerServiceProvider"
```

This creates `config/permissions.php` (this package's permission definitions).

Publish Spatie Permission configuration and migrations:

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

This creates `config/permission.php` (Spatie's internal configuration) and migration files.

Clear config cache:

```bash
php artisan optimize:clear
```

Run migrations:

```bash
php artisan migrate
```

Add the `HasRoles` trait to your User model:

```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

## Configuration

### Standard CRUD Permissions

Define resources to auto-generate `read`, `create`, `update`, `destroy` permissions:

```php
// config/permissions.php

'permissions' => [
    'users',
    'posts',
    'products',
],
```

This generates: `read users`, `create users`, `update users`, `destroy users`, etc.

### Special Permissions

Add custom actions that don't fit the CRUD pattern:

```php
'special_permissions' => [
    'users' => ['ban', 'impersonate'],
    'system' => ['view-logs', 'maintenance-mode'],
],
```

This generates: `ban users`, `impersonate users`, `view-logs system`, etc.

### Super Admin (Bypass)

Define roles that bypass all permission checks (Super Admin). These roles are defined separately because they inherently have all permissions.

```php
// config/permissions.php
'super_admin_role' => 'admin', // Can be a string or array: ['admin', 'root']
```

**Note:**

1.  The `permissions:sync` command automatically creates these roles in the database for you.
2.  **Global Bypass**: This package registers a `Gate::before` callback. This ensures that `@can('any')`, `$user->can('any')`, and Policies automatically return `true` for these users, even if they have **0 permissions** in the database.

### Roles

Define standard roles and assign their specific permissions:

````php
'roles' => [
    // Manager - specific resources
    'manager' => [
        'users' => ['read', 'create', 'update'], // Specific actions
        'posts',                                  // All permissions for posts
    ],

    // Editor - explicit permission strings
    'editor' => [
        'read posts',
        'create posts',
        'update posts',
    ],
],

## Translations

Easily translate technical permissions (e.g., `create users`) into human-readable labels (e.g., "Crear Usuarios").

```bash
php artisan vendor:publish --tag=permissions-translations
````

Then use in your code:

````php
use Deifhelt\LaravelPermissionsManager\Facades\Permissions;

```php
use Deifhelt\LaravelPermissionsManager\Facades\Permissions;

// Returns ['name' => 'create users', 'label' => 'Crear Usuarios']
$all = Permissions::getPermissionsWithLabels();

// Translate a single permission
echo Permissions::translate('create users');
````

See [Translations Documentation](docs/translations.md) for full details.

> **Note**: The system automatically respects your `config('app.locale')` and any runtime locale changes.

## Sync Permissions

After configuring your permissions and roles, sync them to the database:

```bash
php artisan permissions:sync
```

### Alternative: Using Database Seeders

For automated deployments, CI/CD pipelines, or NativePHP applications where you can't run artisan commands interactively, use the included seeder:

```php
use Deifhelt\LaravelPermissionsManager\Database\Seeders\RolesAndPermissionsSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
    }
}
```

This is particularly useful for [NativePHP desktop applications](https://nativephp.com/docs/desktop/2/publishing/building) where the database is created on first run.

## Using with Policies

Use the `HasPermissionCheck` trait to simplify policy authorization:

```php
use Deifhelt\LaravelPermissionsManager\Traits\HasPermissionCheck;

class PostPolicy
{
    use HasPermissionCheck;

    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'read posts');
    }

    public function update(User $user, Post $post): bool
    {
        // Checks permission AND ownership (user_id)
        return $this->checkPermission($user, 'update posts', $post);
    }
}
```

**Features:**

-   **Admin Bypass**: Users with `admin` role automatically pass all checks
-   **Permission Validation**: Verifies user has required permission
-   **Ownership Check**: When passing a model, validates `user_id` matches

## Documentation

-   [Installation](docs/installation.md) - Complete setup guide including Laravel 11/12 middleware
-   [Configuration & Usage](docs/guide/README.md) - Deep dive into permissions, roles, and commands
-   [Translations](docs/translations/README.md) - Translate permissions automatically
-   [Policies](docs/policies/README.md) - Security patterns and trait usage

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
