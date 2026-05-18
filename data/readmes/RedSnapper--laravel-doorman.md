# Laravel Doorman

This package provides traits to use to quickly scaffold role based permissions to your laravel project.

Once installed we can do the following:

````php

// Give a permission to a role
$role->givePermissionTo('view users');

// Assign a user to a role
$user->assignRole($role);

// Check if a user has permission to
$user->can('view users');

````

Permissions are registered with Laravel's gate and so it is possible to check using any laravel gate methods.

## Installation

````
composer require rs/laravel-doorman
````

The service provider will be automatically registered.

Configuration file can be published using the artisan command.

```bash
php artisan vendor:publish --tag="doorman-config"
````

## Configuration

Configuration allows you to specify which models you would like to use for the Role and Permission. By default they use 
models defined by the package. If extra functionality is required or you would like to use your own models then they can
be updated here.

## Migrations

````
php artisan migrate
````

This will run the default migrations needed. If you like to change the default migrations you can publish the migration files. 

```bash
php artisan vendor:publish --tag="doorman-migrations"
````

If you dont want any migrations to run then you can disable the migrations in the config file.

## Basic usage

### User

Add the `HasPermissionsViaRoles` trait to your `User` model.

```php
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Redsnapper\LaravelDoorman\Models\Traits\HasPermissionsViaRoles;
    
    class User extends Authenticatable
    {
        use HasPermissionsViaRoles;
    
        // ...
    }
```

A role can be assigned to any user:

```php
$user->assignRole('writer');

// You can also assign multiple roles at once
$user->assignRole('editor', 'admin');
// or as an array
$user->assignRole(['editor', 'admin']);
```

A role can be removed from a user:

```php
$user->removeRole('editor');
```

Roles can also be synced:

```php
// All current roles will be removed from the user and replaced by the array given
$user->syncRoles(['editor', 'admin']);
```

You can determine if a user has a certain role:

```php
$user->hasRole($role);
```


Permissions and roles can be accessed from the user using the `HasPermissionsViaRoles` trait.

```php
// permissions relaitionship
$permissions = $user->permissions;
// roles relationship
$roles = $user->roles

```

You can check if a user has a permission:

```php
$user->hasPermissionTo('edit users'); // Name of permission
$user->hasPermissionTo($somePermission->id); // Id of permission
$user->hasPermissionTo($somePermission); // Permission Model
```



### Permissions and roles

A permission can be assigned to a role using 1 of these methods:

```php
$role->givePermissionTo($permission);
$permission->assignRole($role);
```

Multiple permissions can be synced to a role using 1 of these methods:

```php
$role->syncPermissions($permissions);
$permission->syncRoles($roles);
```

A permission can be removed from a role using 1 of these methods:

```php
$role->revokePermissionTo($permission);
$permission->removeRole($role);
```

## Permission and role customization

If you would like to setup your own permission and role models then you can update the configuration to use your own models.

The existing doorman models can be extended or the models can use the existing traits.

When implementing your own models the models must fulfil the `Role` and `Permission` Contracts.

An example of a role model.

```php
namespace App;

use Illuminate\Database\Eloquent\Model;
use Redsnapper\LaravelDoorman\Models\Contracts\Role as RoleContract;
use Redsnapper\LaravelDoorman\Models\Traits\HasPermissions;

class Role extends Model implements RoleContract
{
    use HasPermissions;

}
```

An example of the permission model.

```php
namespace App;

use Illuminate\Database\Eloquent\Model;
use Redsnapper\LaravelDoorman\Models\Contracts\Permission as PermissionContract;
use Redsnapper\LaravelDoorman\Models\Traits\HasRoles;
use Redsnapper\LaravelDoorman\Models\Traits\PermissionIsFindable;

class Permission extends Model implements PermissionContract
{
    use HasRoles, PermissionIsFindable;

}
```
