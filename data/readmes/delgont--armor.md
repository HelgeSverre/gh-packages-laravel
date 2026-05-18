![Delgont Armor Banner](https://raw.githubusercontent.com/delgont/armor/main/banner.jpg)

## Armor – Laravel Role & Permission Package

**Armor** is a powerful, flexible, and cache-friendly permission and role management package for Laravel applications. Designed with performance in mind, Armor allows you to define roles and permissions, assign them to users, and protect routes or actions effortlessly.

🔒 Built for speed  
⚙️ Highly customizable  
📦 Supports permission groups, caching, syncing, and more

---

#### Installation
```cmd
composer require delgont:armor

php artisan migrate
```

---

#### Restrict Access Using Permissions

1. Create Permission Registrar and Define the permissions.

```php
php artisan make:permissionRegistrar ExpensePermissionRegistrar
```

```php
<?php
namespace App;

use Delgont\Armor\PermissionRegistrar;

class ExpensePermissionRegistrar extends PermissionRegistrar
{
    const CAN_MANAGE_EXPENSES = 'can_manage_expenses';
    const CAN_ADD_EXPENSES = 'can_add_expenses';

    /**
     * Provide descriptions for each permission.
     *
     * @return array
     */
    public function descriptions(): array
    {
        return [
            self::CAN_MANAGE_EXPENSES => 'Allow user to manage expenses',
            self::CAN_ADD_EXPENSES => 'Allow user to add expenses',
        ];
    }
}

```

2. Register Permission Register in your Service Provider.

```php
<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Delgont\Armor\Armor;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application servipSycnces.
     *
     * @return void
     */
    public function boot()
    {

        Armor::registerPermissionRegistrars([
            \App\ExpensePermissionRegistrar::class,
        ]);

    }

}
```

3. Synchronize Permisions.

```cmd
php artisan armor:sync-permissions
```

---

#### Apply Permissions Directly to the Authenticatable Model

```php
<?php
namespace App;

use Delgont\Armor\Concerns\ModelHasPermissions;

class User extends Authenticatable
{
    use ModelHasPermissions;

}

```

```php

# Geting permissions of specific group
$permissions = app(\App\ExpensePermissionRegistrar::class)->getPermissionsFromDb();

# Get model which uses trait Delgont\Armor\Concerns\ModelHasPermissions
$user =  User::whereId(3)->first();

# Give permissions to user
$user->givePermissionTo($permissions);

# Withdrawal permissions from user
$user->withdrawPermissionsTo($permissions);

# Sync permissions from user
$user->syncPermissions($permissions);

# Check if model|user has permission
 if($user->hasPermission('can_manage_expenses')) {
    return 'User has the permission';
} else {
    return 'User does not have the permission';
}

# Check if model has any of the permissions
if($user->hasAnyPermission('can_add_expenses', 'can_manage_expenses')) {
    return 'User has the permission';
} else {
    return 'User does not have the permission';
}

# Protect Routes - Works only for user model which is authenticatable
Route::post('/expenses/add', 'ExpenseController@store')->middleware(['permission:can_add_expenses']);
```

---

📖 **Developed by**: [Stephen Okello](https://github.com/stephenokelloug)
