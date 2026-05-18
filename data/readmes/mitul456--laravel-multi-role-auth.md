# Laravel Multi-Role Authentication Package

<div align="center">

![Laravel Version](https://img.shields.io/badge/Laravel-10.x%20%7C%2011.x%20%7C%2012.x-red)
![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Downloads](https://img.shields.io/badge/downloads-1k%2B-brightgreen)

A powerful, flexible, and production-ready multi-role authentication system for Laravel applications.

</div>

---

## 📋 Table of Contents

* Features
* Requirements
* Quick Start
* Installation
* Configuration
* Usage Guide
* Dynamic Role Management
* Artisan Commands
* Helper Functions
* Testing
* Troubleshooting
* Security
* License

---

## ✨ Features

* 🎭 Unlimited Roles
* 📊 Role Hierarchy (priority-based)
* 🔐 Permission-based access control
* 🛡️ Multi-Guard Support (web, api)
* 🎯 Smart role-based redirects
* 🚀 Middleware protection (`role:admin`)
* 🎨 Blade directives (`@role`, `@hasrole`)
* 📱 API ready
* 🎛️ Admin panel support
* ⌨️ Artisan commands

---

## 📦 Requirements

* PHP >= 8.1
* Laravel 10.x / 11.x / 12.x
* Composer (latest)
* Supported DB: MySQL, PostgreSQL, SQLite, SQL Server

---

## 🚀 Quick Start

```bash
composer require mitul456/laravel-multi-role-auth
php artisan multirole:install
php artisan migrate
```

Add trait to User model:

```php
use LaravelMultiRoleAuth\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

---

## ⚙️ Installation (Detailed)

```bash
composer require mitul456/laravel-multi-role-auth
php artisan multirole:install
```

(Optional)

```bash
php artisan vendor:publish --tag=multirole-config
```

---

## ⚙️ Configuration

`config/multirole.php`

```php
return [
    'default_role' => 'User',

    'role_hierarchy' => [
        'SuperAdmin',
        'Admin',
        'Moderator',
        'Editor',
        'User',
    ],

    'redirect_paths' => [
        'SuperAdmin' => '/superadmin/dashboard',
        'Admin' => '/admin/dashboard',
        'default' => '/dashboard',
    ],
];
```

---

## 📖 Usage Guide

### Assign Role

```php
$user->assignRole('Admin');
$user->syncRoles(['Editor', 'Moderator']);
```

### Check Role

```php
$user->hasRole('Admin');
$user->hasRole(['Admin', 'SuperAdmin']);
```

### Middleware

```php
Route::middleware(['auth', 'role:Admin'])->group(function () {
    //
});
```

### Blade

```blade
@role('admin')
    <p>Admin only</p>
@endrole
```

### Permission

```php
$user->can('edit-articles');
```

---

## 🎯 Dynamic Role Management

```php
Role::create(['name' => 'Manager']);

$user->assignRole('Manager');

if ($user->hasRole('Manager')) {
    //
}
```

---

## ⌨️ Artisan Commands

```bash
php artisan multirole:install
php artisan role:create "Manager"
php artisan role:assign 1 "Admin"
php artisan role:sync 1 "Editor" "Moderator"
```

---

## 🔧 Helper Functions

```php
hasRole($user, 'Admin');
currentUserRole();
canPerform('manage-users');
```

---

## 🧪 Testing

```bash
php artisan test
```

---

## 🔧 Troubleshooting

```bash
php artisan optimize:clear
composer dump-autoload
```

---

## 🔒 Security Tips

* Always use middleware
* Avoid client-side role checks
* Use permissions for sensitive actions

---

## 📄 License

MIT License

---

<div align="center">
Made with ❤️ by Mitul
</div>
