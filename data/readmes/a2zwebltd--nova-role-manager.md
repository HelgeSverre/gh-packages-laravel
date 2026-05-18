# Laravel Nova Role Manager

[![Packagist Version](https://img.shields.io/packagist/v/a2zwebltd/nova-role-manager.svg)](https://packagist.org/packages/a2zwebltd/nova-role-manager)
[![Downloads](https://img.shields.io/packagist/dt/a2zwebltd/nova-role-manager.svg)](https://packagist.org/packages/a2zwebltd/nova-role-manager)
![PHP](https://img.shields.io/badge/PHP-%5E8.2-blue)

A visual role and permission management tool for Laravel Nova. Built on Spatie's Laravel Permission package with automatic audit logging.

![Role Manager Interface](screenshots/Screenshot_2026-01-25_21-17-20.png)

## Installation

```bash
composer require a2zwebltd/nova-role-manager
```

## Quick Setup

### 1. Register the Tool

Add to `app/Providers/NovaServiceProvider.php`:

```php
use A2ZWeb\NovaRoleManager\RoleManager;

public function tools(): array
{
    return [
        new RoleManager,
    ];
}
```

### 2. Add new menu item

```php
MenuItem::make(__('Roles and Permissions Manager'))
    ->path('/role-manager')
```

### 3. Done!

You can now add permissions with sections / groups like this:
```php
Permission::create([
    'name' => 'viewPosts',
    'group' => 'Content Management / Blogs',
    'guard_name' => 'admin-dashboard',
]);
```

## Demo Data (Optional)

### Demo roles and permissions

```bash
php artisan db:seed --class="A2ZWeb\NovaRoleManager\Database\Seeders\RoleManagerDemoSeeder"
```

Demo data includes:
- **admin** guard with 3 roles (Admin, Editor, Author) and basic CRUD permissions
- **web** guard with 2 roles (Member, Contributor) and user-facing permissions
- Examples of nested groups (`Blog / Posts`, `Management / Settings / General`)
- Examples of ungrouped permissions (`Reports`, `Beta Features`)

## What's Included

- **Visual Interface**: Table-based permission management across multiple roles
- **Multi-Guard Support**: Manage permissions for different guards
- **Permission Grouping**: Organize permissions by section/group
- **Optional Audit Logging**: Track all role and permission changes (opt-in)
- **Auditable Models**: Drop-in replacements for Spatie models with automatic audit tracking

## Configuration (Optional)

Publish the config to customize behavior:

```bash
php artisan vendor:publish --tag=role-manager-config
```

### Enabling Audit Logging

The package includes auditable models for automatic change tracking. To enable:

**1. Set up Laravel Auditing:**

```bash
# Publish config and migration
php artisan vendor:publish --tag=config --provider="OwenIt\Auditing\AuditingServiceProvider"
php artisan vendor:publish --tag=migrations --provider="OwenIt\Auditing\AuditingServiceProvider"

# Run migration
php artisan migrate
```

**2. Use auditable models in `config/role-manager.php`:**

```php
'role_model' => \A2ZWeb\NovaRoleManager\Models\AuditableRole::class,
'permission_model' => \A2ZWeb\NovaRoleManager\Models\AuditablePermission::class,
```

**3. add a "View Audit Logs" button in `config/role-manager.php`**

```php
'enable_audit_logs' => true,
```

### Permission Checks

Control who can edit roles:

```php
'edit_permission' => 'editRoles',  // Set to null to allow all authenticated users
'view_audit_logs_permission' => 'viewAuditLogs',  // Set to null to allow all
```

### Permission Grouping

For best organization, use forward slashes in the `group` field:

```php
Permission::create([
    'name' => 'viewUsers',
    'group' => 'Admin Dashboard / Users',
    'guard_name' => 'admin',
]);
```

**Ungrouped Permissions:**

Permissions without slashes or empty groups are placed in a catch-all category:

```php
'ungrouped_permissions_category' => 'Other',  // Default category for ungrouped permissions
// 'ungrouped_permissions_category' => null,  // Set to null to hide ungrouped permissions
```

## Advanced

### Custom Permission Repository

Override how permissions are fetched:

```php
'permission_repository' => \App\Repositories\MyPermissionRepository::class,
```

Repository must have `allForGuard(string $guardName): Collection` method.

### Protected Roles

Prevent certain roles from being edited:

```php
'protected_roles' => [
    'SUPER_ADMIN',
],
```

### Guard Display Order

Control tab order:

```php
'guard_order' => [
    'admin-dashboard',
    'user-dashboard',
],
```

## Requirements

- Laravel 10, 11, 12, or 13
- Laravel Nova 5+
- Spatie Laravel Permission 5+
- PHP 8.2+

## License

MIT

## Security

If you discover a security vulnerability, please email contact@a2zweb.co.

## Credits

- [A2Z Web](https://a2zweb.co)
- [All Contributors](../../contributors)
