# Laravel Roles & Permissions

🔐 A simple and lightweight Laravel package for **role & permission management**.  
Easily assign roles to users, attach permissions to roles, protect routes with middleware,  
and use Blade directives like `@role` and `@permission`.

---

## Features
- 🚀 Assign multiple roles to users
- 🎯 Attach permissions to roles or directly to users
- 🔒 Middleware for roles & permissions (`role` and `permission`)
- 🖥 Blade directives: `@role`, `@permission`
- ⚡ Lightweight & easy to integrate
- 🛠 Compatible with **Laravel 10, 11, 12**

---

## Installation

Install via composer:

```bash
composer require murtaza1904/roles-permissions
````

Publish config & migrations:

```bash
php artisan vendor:publish --provider="Murtaza1904\RolesPermissions\RolesPermissionsServiceProvider"
php artisan migrate
```

---

## Usage

### Assigning Roles

```php
use App\Models\User;
use murtaza1904\RolesPermissions\Models\Role;

$user = User::find(1);
$role = Role::create(['name' => 'Editor']);

$user->assignRole($role);
```

### Assigning Permissions

```php
use murtaza1904\RolesPermissions\Models\Permission;

$permission = Permission::create(['name' => 'Edit Articles', 'slug' => 'edit-articles']);
$role->permissions()->attach($permission->id);
```

### Middleware

Protect routes with permissions and roles:

```php
Route::middleware(['role:Admin'])->group(function () {
    Route::get('/admin', function () {
        return 'Welcome, Admin!';
    });
});

Route::middleware(['permission:edit-articles'])->post('/articles', 'ArticleController@update');
```

### Blade Directives

```blade
@role('Admin')
    <p>Welcome, Admin!</p>
@endrole

@permission(['edit-articles', 'delete-articles'])
    <button>Manage Articles</button>
@endpermission
```

---

## Seeder Example

You can seed default permissions like this:

```php
use Illuminate\Database\Seeder;
use murtaza1904\RolesPermissions\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Users', 'slug' => 'view-users'],
            ['name' => 'Edit Users', 'slug' => 'edit-users'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }
    }
}
```

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).