# PHP Role Permission Package (For Laravel Framework)

Laravel package to manage roles and CRUD-style permissions per module.

This package provides simple Role and Permission models, migrations, and artisan commands to install default roles and permissions from a config file. Permissions are modelled with per-action booleans (create, read, update, delete) and can be attached to roles. User-level permission overrides are stored separately.

## Current features

- Eloquent models: `Role`, `Permission` (with soft deletes).
- Permissions store per-action booleans: `create`, `read`, `update`, `delete`.
- Many-to-many relation between `roles` and `permissions` via `role_permissions` pivot. The pivot stores the per-action booleans for a role-permission relationship.
- A `user_permissions` table is present to store user-specific overrides for permissions.
- Config-driven permission definitions in `config/permissions.php` and an artisan command to install or update permissions from that config.
- A small command to create a default `super-admin` role.
- Service provider that publishes the config, loads package migrations, and registers console commands.

## Files of interest

- `config/permissions.php` — default permission definitions (name, slug, create/read/update/delete booleans).
- `src/Models/Permission.php` — permission model with `roles()` relationship.
- `src/Models/Role.php` — role model with `permissions()` relationship.
- `src/Helpers/PermissionHelper.php` — helper file (currently empty) intended for permission resolution logic.
- `src/Providers/RolePermissionsServiceProvider.php` — registers config, migrations and commands.
- `src/Commands/InstallPermissionsCommand.php` — reads `config/permissions.php` and `updateOrCreate` permissions.
- `src/Commands/InstallRolesCommand.php` — creates `super-admin` role if absent.
- `database/migrations/*` — migrations for `roles`, `permissions`, `role_permissions`, and `user_permissions`.

## Database schema (summary)

- `roles`:
	- `id`, `name`, `slug` (unique), timestamps, soft deletes

- `permissions`:
	- `id`, `name`, `slug` (unique), `create`, `read`, `update`, `delete` (booleans), timestamps, soft deletes

- `role_permissions` (pivot):
	- `id`, `role_id`, `permission_id`, `create`, `read`, `update`, `delete` (booleans), timestamps

- `user_permissions`:
	- `id`, `user_id`, `permission_id`, `create`, `read`, `update`, `delete` (booleans), timestamps

Note: `role_permissions` currently does not set default boolean values or foreign key constraints in the migration — see "Gaps" below.

## How to install

1. Require the package via composer (if published) or add to your project as a local package.

```sh
composer require kyawzinthet/role-permissions
```

2. Publish config:

```php
php artisan vendor:publish --provider="KyawZinThet\RolePermissions\Providers\RolePermissionsServiceProvider" --tag=config
```

3. Run migrations to create the tables:

```php
php artisan migrate
```

4. Seed default roles and permissions from config via command:

```php
php artisan install:role
php artisan install:permissions
```

## Usage notes

- Permissions are defined in `config/permissions.php` as an array of permission objects. Each permission has a `slug` and per-action booleans. Running `install:permissions` will ensure the `permissions` table matches the config.
- Roles have a many-to-many relationship with permissions. The pivot `role_permissions` stores the allowed actions for that role on the permission.
- User-level overrides are stored in `user_permissions`. The package does not currently include helpers to evaluate permissions or assign roles to users — `src/Helpers/PermissionHelper.php` is intentionally present as the place to implement permission resolution logic.

## Dynamic user model & trait usage

This package resolves your application's user model dynamically using Laravel's auth provider configuration. The migration and model helpers use:

```php
Config::get('auth.providers.users.model', \App\Models\User::class);
```

What this means for you:

- Set your user model in `config/auth.php` under `providers.users.model` if you use a custom user class or a different namespace. Example:

```php
'providers' => [
	'users' => [
		'driver' => 'eloquent',
		'model' => App\Models\User::class,
	],
],
```

- The `user_permissions` migration will instantiate your user model to determine the user table name, primary key name, and key type. If your user primary key is a string (for example `uuid` or `ulid`), the migration will create a `string('user_id')` column; otherwise it will create an `unsignedBigInteger('user_id')` column and add a foreign key referencing your users table.

- Because the migration instantiates your user model at migration time, make sure your user model can be constructed without requiring application services that are not available during migrations. If you prefer, you can modify the migration to hard-code the table/key types for your project.

Example `User` model usage

Add the trait and the relations expected by the package to your application `User` model. The included `PermissionHelper` trait calls `roles()` and `permissions()` on the user, so those relationships should exist.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use KyawZinThet\RolePermissions\Traits\PermissionHelper;
use KyawZinThet\RolePermissions\Models\Role;
use KyawZinThet\RolePermissions\Models\Permission;

class User extends Authenticatable
{
	use PermissionHelper;

	public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot('create', 'read', 'update', 'delete');
    }
}
```

Using the trait

- `hasRole(string $role)` — returns `true` if the user has a role with the given slug.
- `hasPermission(string $permission)` — returns `true` if the user has the permission slug directly or via any of their roles.

Example:

```php
if (auth()->user()->hasPermission('post')) {
	// allowed
}

if (auth()->user()->hasRole('admin')) {
	// admin-only logic
}
```

Migration note

- Run `php artisan migrate` after you have set `config/auth.php` to your intended user model so the `user_permissions` migration detects the correct user table and key type.
- If your user model uses dependency injection in its constructor or otherwise cannot be instantiated during migrations, consider editing the migration to use explicit table/key names or ensure the model can be constructed without side effects.

## Example (planned) permission check API

- PermissionHelper::can($user, 'user', 'read') // returns boolean
- Middleware example: `->middleware('permission:user,read')`

## License

MIT

