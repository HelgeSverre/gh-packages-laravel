# Laravel Permitted

[![Latest Version on Packagist](https://img.shields.io/packagist/v/williamug/laravel-permitted.svg?style=flat-square)](https://packagist.org/packages/williamug/laravel-permitted)
[![run-tests](https://github.com/Williamug/laravel-permitted/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Williamug/laravel-permitted/actions/workflows/run-tests.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/Williamug/laravel-permitted/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/Williamug/laravel-permitted/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/williamug/laravel-permitted.svg?style=flat-square)](https://packagist.org/packages/williamug/laravel-permitted)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

A powerful, flexible Laravel package for managing roles and permissions with **built-in multi-tenancy support** for both single-database and multi-database architectures. Production-tested and battle-hardened from real SaaS applications.

## Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes! 🚀
- **[Usage Examples](EXAMPLES.md)** - 7 real-world scenarios (Blog, SaaS, E-commerce, etc.)
- **[API Reference](API_REFERENCE.md)** - Complete method documentation
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Configuration Guide](#configuration)** - All config options explained below

**New to Laravel Permitted?** → Start with the [Quick Start Guide](QUICK_START.md)!

**Having issues?** → Check the [Troubleshooting Guide](TROUBLESHOOTING.md)!

---

## Why Laravel Permitted?

### **The Problem**
Most Laravel permission packages force you to choose:
- ❌ **Spatie Laravel-Permission**: No multi-tenancy support - requires manual implementation
- ❌ **Laravel Bouncer**: Single database only - can't scale to multi-database architecture
- ❌ **Other packages**: Either single-tenant only OR multi-tenant only - not both

### **The Solution: Laravel Permitted**

**One package that does it all:**
- Start with a **single-tenant** blog
- Scale to **multi-tenant SaaS** (single database)
- Grow to **enterprise** (multi-database per client)
- **Zero code changes** when scaling - just update config!

## Key Features

- **Flexible Multi-Tenancy**: Single database, multi-database, or no tenancy - your choice
- **Sub-Tenant Support**: Handle complex hierarchies (e.g., Organization → Departments)
- **Hierarchical Modules**: Organize permissions into modules and sub-modules
- **Role-Based Access Control (RBAC)**: Assign roles to users with granular permissions
- **Super Admin**: Bypass all permission checks for super admin role
- **Wildcard Permissions**: Use `content.*` to grant all content-related permissions
- **Middleware Protection**: Protect routes with role and permission middleware
- **Blade Directives**: Easy permission checks in views (`@role`, `@permission`, etc.)
- **Caching**: Built-in permission caching for blazing-fast performance
- **Laravel 10 & above**: Fully compatible with modern Laravel
- **PHP 8.1+**: Leverages modern PHP features
- **Battle-Tested**: Extracted from production SaaS serving 50+ organizations

## How Easy Is It?

### Installation: 3 Commands

```bash
composer require williamug/laravel-permitted

php artisan vendor:publish --tag=permitted-config

php artisan migrate
```

### Setup: Add 1 Line to User Model

```php
class User extends Authenticatable
{
    use HasRoles, HasPermissions;  // 👈 That's it!
}
```

### Create Roles & Permissions: Simple & Intuitive

```php
// Create permission
Permission::create(['name' => 'edit posts']);

// Create role
$editor = Role::create(['name' => 'Editor']);

// Give permission to role
$editor->givePermissionTo('edit posts');

// Assign role to user
$user->assignRole('Editor');
```

### Check Permissions: Natural & Readable

```php
// In controllers
if ($user->hasPermission('edit posts')) {
    // Allow
}

// In Blade views
@permission('edit posts')
    <button>Edit Post</button>
@endpermission

// In routes
Route::get('/posts/create', [...])
    ->middleware('permission:create posts');
```

### Scale to Multi-Tenant: Change 1 Config Setting

```php
// config/permitted.php
'multi_tenancy' => [
    'enabled' => true,  // 👈 Just flip this!
],
```

**That's it!** Zero code changes needed. Permissions automatically scope to organizations. 🎉

---

## Installation

Install via Composer:

```bash
composer require williamug/laravel-permitted
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=permitted-config
```

Run migrations:

```bash
php artisan migrate
```

## Quick Start

### Single-Tenant Application (Blog, CMS, Traditional App)

#### 1. Configuration

```php
// config/permitted.php

'multi_tenancy' => [
    'enabled' => false,  // 👈 That's it! Single-tenant mode
],
```

#### 2. Add Traits to User Model

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Williamug\Permitted\Traits\HasRoles;
use Williamug\Permitted\Traits\HasPermissions;

class User extends Authenticatable
{
    use HasRoles, HasPermissions;

    // Your user model code...
}
```

### Multi-Tenant Application (SaaS, Multi-Store, Multi-Organization)

#### 1. Configuration

```php
// config/permitted.php

'multi_tenancy' => [
    'enabled' => true,
    'mode' => 'single_database', // or 'multi_database'
],

'tenant' => [
    'model' => App\Models\Organization::class,
    'foreign_key' => 'organization_id',
],
```
#### 2. Add getTenantId() to User Model

```php
class User extends Authenticatable
{
    use HasRoles, HasPermissions;

    public function getTenantId()
    {
        return $this->organization_id;
    }
}
```

**Done!** Roles and permissions are now automatically scoped to organizations.


### 2. Create Roles and Permissions

```php
use Williamug\Permitted\Models\Role;
use Williamug\Permitted\Models\Permission;

// Create permissions
$editPosts = Permission::create(['name' => 'edit posts']);
$deletePosts = Permission::create(['name' => 'delete posts']);
$viewDashboard = Permission::create(['name' => 'view dashboard']);

// Create role
$admin = Role::create(['name' => 'admin']);

// Assign permissions to role
$admin->givePermissionTo($editPosts, $deletePosts, $viewDashboard);
```

### 3. Assign Roles to Users

```php
$user = User::find(1);

// Assign role
$user->assignRole('admin');

// Check role
if ($user->hasRole('admin')) {
    // User is an admin
}

// Check permission
if ($user->hasPermission('edit posts')) {
    // User can edit posts
}
```

---

## Understanding Modules & Sub-Modules (Optional Feature)

### What Are Modules?

**Modules** are logical groupings of related permissions. Think of them as categories or sections of your application.

**Example without modules (flat structure):**
```php
Permission::create(['name' => 'view users']);
Permission::create(['name' => 'create users']);
Permission::create(['name' => 'edit users']);
Permission::create(['name' => 'delete users']);
Permission::create(['name' => 'view posts']);
Permission::create(['name' => 'create posts']);
// ... 100 more permissions
```

**Example with modules (organized structure):**
```php
$userModule = Module::create(['name' => 'User Management']);
$contentModule = Module::create(['name' => 'Content Management']);

Permission::create(['name' => 'view users', 'module_id' => $userModule->id]);
Permission::create(['name' => 'create users', 'module_id' => $userModule->id]);
Permission::create(['name' => 'view posts', 'module_id' => $contentModule->id]);
Permission::create(['name' => 'create posts', 'module_id' => $contentModule->id]);
```

### What Are Sub-Modules?

**Sub-modules** provide even finer organization within modules.

**Example:**
```php
$academicModule = Module::create(['name' => 'Academic']);

$subjectsSubModule = SubModule::create([
    'module_id' => $academicModule->id,
    'name' => 'Subjects',
]);

Permission::create([
    'name' => 'manage subjects',
    'module_id' => $academicModule->id,
    'sub_module_id' => $subjectsSubModule->id,
]);
```

### When to Use Modules?

**Use modules when:**
- You have 50+ permissions
- Building admin panels with tabbed interfaces
- You want to grant access to entire sections at once
- You need to organize permissions in the UI

**Skip modules when:**
- Simple app with < 20 permissions
- You prefer Spatie-style flat permissions
- Integrating with third-party systems

### Enabling/Disabling Modules

```php
// config/permitted.php

'modules' => [
    'enabled' => false, // Default: disabled for simplicity
    'sub_modules' => [
        'enabled' => false, // Sub-modules are even more optional!
    ],
],
```

---

## Super Admin (Bypass All Permissions)

### What is Super Admin?

A **Super Admin** bypasses **all** permission checks automatically. Perfect for system administrators.

```php
// Assign super admin role
$user->assignRole('super admin');

// Now this user can do ANYTHING
$user->hasPermission('any permission'); // Always true
$user->hasPermission('non-existent permission'); // Still true!
```

### How to Use

```php
// Check if user is super admin
if ($user->isSuperAdmin()) {
    // Unrestricted access
}

// Blade directive
@superadmin
    <a href="/system/settings">System Settings</a>
@endsuperadmin
```

### Configuration Options

```php
// config/permitted.php

'super_admin' => [
    'enabled' => true,
    'role_name' => 'super admin', // Change this to your preference

    // Option 1: Custom callback (e.g., email whitelist)
    'callback' => fn($user) => $user->email === 'admin@example.com',

    // Option 2: Custom gate
    'via_gate' => 'is-system-admin',
],
```

### Security Warning ⚠️

Users with super admin can delete everything, access all data, and bypass all security checks.

**Best practices:**
1. Limit to 1-2 trusted individuals
2. Use email whitelist in production
3. Log all super admin actions
4. Never assign lightly in multi-tenant apps

**Example: Email Whitelist**
```php
'super_admin' => [
    'callback' => function ($user) {
        return in_array($user->email, ['admin@company.com', 'cto@company.com']);
    },
],
```

---

## Configuration

### Single-Tenant Application (Default)

```php
// config/permitted.php

'multi_tenancy' => [
    'enabled' => false,
    'mode' => 'none',
],
```

### Multi-Tenant (Single Database)

Perfect for SaaS applications where all tenants share one database:

```php
// config/permitted.php

'multi_tenancy' => [
    'enabled' => true,
    'mode' => 'single_database',
],

'tenant' => [
    'model' => App\Models\Company::class,
    'foreign_key' => 'company_id',

    // Optional: Sub-tenant support (e.g., Company -> Branch)
    'sub_tenant' => [
        'enabled' => true,
        'model' => App\Models\Branch::class,
        'foreign_key' => 'branch_id',
    ],
],
```

**Your User Model:**

```php
class User extends Authenticatable
{
    use HasRoles, HasPermissions;

    // Define how to get tenant ID
    public function getTenantId()
    {
        return $this->company_id;
    }

    // Optional: Define how to get sub-tenant ID
    public function getSubTenantId()
    {
        return $this->branch_id;
    }
}
```

### Multi-Tenant (Multi-Database)

For applications where each tenant has a separate database:

```php
'multi_tenancy' => [
    'enabled' => true,
    'mode' => 'multi_database',
],
```

## Usage Examples

### Working with Roles

```php
use Williamug\Permitted\Models\Role;

// Create role
$role = Role::create([
    'name' => 'editor',
    'display_name' => 'Content Editor',
    'description' => 'Can edit and publish content',
]);

// Find role
$admin = Role::findByName('admin');

// Assign role to user
$user->assignRole('editor');
$user->assignRole($role); // or pass the role object
$user->assignRole(['admin', 'editor']); // multiple roles

// Remove role
$user->removeRole('editor');

// Sync roles (removes all other roles)
$user->syncRoles(['admin', 'editor']);

// Check roles
if ($user->hasRole('admin')) {
    // User is admin
}

if ($user->hasAnyRole(['admin', 'editor'])) {
    // User has at least one of these roles
}

if ($user->hasAllRoles(['admin', 'editor'])) {
    // User has all these roles
}
```

### Working with Permissions

```php
use Williamug\Permitted\Models\Permission;

// Create permission
$permission = Permission::create([
    'name' => 'edit posts',
    'display_name' => 'Edit Posts',
    'description' => 'Can edit blog posts',
]);

// Create multiple permissions
Permission::createMany([
    'create posts',
    'edit posts',
    'delete posts',
    'publish posts',
]);

// Assign permission to role
$role->givePermissionTo('edit posts');
$role->givePermissionTo(['edit posts', 'delete posts']);

// Remove permission from role
$role->revokePermissionTo('delete posts');

// Sync permissions for role
$role->syncPermissions(['edit posts', 'create posts']);

// Check if user has permission
if ($user->hasPermission('edit posts')) {
    // User can edit posts
}

if ($user->hasAnyPermission(['edit posts', 'delete posts'])) {
    // User has at least one permission
}

if ($user->hasAllPermissions(['edit posts', 'delete posts'])) {
    // User has all permissions
}

// Check via specific role
if ($user->hasPermissionViaRole('edit posts', 'editor')) {
    // User has 'edit posts' permission via 'editor' role
}
```

### Using Modules (Hierarchical Permissions)

```php
use Williamug\Permitted\Models\Module;
use Williamug\Permitted\Models\SubModule;

// Create module
$users = Module::create([
    'name' => 'Users',
    'display_name' => 'User Management',
    'icon' => 'users',
]);

// Create sub-module
$userSettings = SubModule::create([
    'module_id' => $users->id,
    'name' => 'Settings',
    'display_name' => 'User Settings',
]);

// Create permission under sub-module
$permission = Permission::create([
    'name' => 'edit user settings',
    'module_id' => $users->id,
    'sub_module_id' => $userSettings->id,
]);

// Check module access
if ($user->hasModuleAccess('Users')) {
    // User has at least one permission in Users module
}

// Get all permissions in module
$modulePermissions = $users->getAllPermissions();
```

### Middleware Protection

Protect routes using middleware:

```php
// routes/web.php

// Require specific role
Route::get('/admin', function() {
    // Only users with 'admin' role can access
})->middleware('role:admin');

// Require one of multiple roles (OR)
Route::get('/dashboard', function() {
    // Users with 'admin' OR 'editor' role can access
})->middleware('role:admin|editor');

// Require specific permission
Route::get('/posts/edit', function() {
    // Only users with 'edit posts' permission can access
})->middleware('permission:edit posts');

// Require one of multiple permissions (OR)
Route::get('/posts/manage', function() {
    // Users with 'edit posts' OR 'delete posts' permission can access
})->middleware('permission:edit posts|delete posts');

// Require role OR permission
Route::get('/content', function() {
    // Users with 'admin' role OR 'manage content' permission can access
})->middleware('role_or_permission:admin|manage content');
```

### Blade Directives

Use in your Blade templates:

```blade
{{-- Check role --}}
@role('admin')
    <a href="/admin">Admin Panel</a>
@endrole

{{-- Alternative syntax --}}
@hasrole('admin')
    <a href="/admin">Admin Panel</a>
@endhasrole

{{-- Check any role --}}
@hasanyrole('admin|editor')
    <a href="/dashboard">Dashboard</a>
@endhasanyrole

{{-- Check all roles --}}
@hasallroles('admin|editor')
    <p>You are both admin and editor</p>
@endhasallroles

{{-- Check permission --}}
@permission('edit posts')
    <a href="/posts/edit">Edit Posts</a>
@endpermission

{{-- Alternative syntax --}}
@haspermission('edit posts')
    <a href="/posts/edit">Edit Posts</a>
@endhaspermission

{{-- Check any permission --}}
@hasanypermission('edit posts|delete posts')
    <a href="/posts/manage">Manage Posts</a>
@endhasanypermission

{{-- Check all permissions --}}
@hasallpermissions('edit posts|delete posts')
    <p>You can both edit and delete</p>
@endhasallpermissions

{{-- Check super admin --}}
@superadmin
    <a href="/system-settings">System Settings</a>
@endsuperadmin

{{-- Unless role --}}
@unlessrole('guest')
    <p>Welcome back!</p>
@endunlessrole

{{-- Unless permission --}}
@unlesspermission('view dashboard')
    <p>Dashboard access restricted</p>
@endunlesspermission
```

### Using the Facade

```php
use Williamug\Permitted\Facades\Permitted;

// Create role
$role = Permitted::createRole('manager', [
    'display_name' => 'Manager',
    'description' => 'Manages the team',
]);

// Create permission
$permission = Permitted::createPermission('approve requests');

// Find role
$admin = Permitted::findRole('admin');

// Get all roles
$roles = Permitted::getAllRoles();

// Get all permissions
$permissions = Permitted::getAllPermissions();

// Sync permissions for role
Permitted::syncPermissions('admin', ['edit posts', 'delete posts']);

// Assign role to user
Permitted::assignRoleToUser($user, 'admin');

// Check configuration
if (Permitted::isMultiTenancyEnabled()) {
    // Multi-tenancy is enabled
}

if (Permitted::areModulesEnabled()) {
    // Modules are enabled
}
```

### Wildcard Permissions

Enable in config:

```php
'wildcards' => [
    'enabled' => true,
],
```

Usage:

```php
// Create wildcard permission
Permission::create(['name' => 'users.*']);

// This grants all user-related permissions:
// - users.create
// - users.edit
// - users.delete
// - users.view
// etc.

$user->assignRole($role);

// All these will return true
$user->hasPermission('users.create');
$user->hasPermission('users.edit');
$user->hasPermission('users.delete');
$user->hasPermission('users.anything');
```

### Super Admin

Configure in `config/permitted.php`:

```php
'super_admin' => [
    'enabled' => true,
    'role_name' => 'super admin',
],
```

```php
// Create super admin role
$superAdmin = Role::create(['name' => 'super admin']);

// Assign to user
$user->assignRole('super admin');

// Super admin bypasses ALL permission checks
$user->hasPermission('anything'); // true
$user->hasPermission('edit posts'); // true
$user->hasPermission('delete universe'); // true
```

### Caching

Permissions are automatically cached for better performance. Configure in `config/permitted.php`:

```php
'cache' => [
    'enabled' => true,
    'expiration_time' => 3600, // 1 hour
    'key_prefix' => 'permitted',
],
```

Manually refresh cache:

```php
// Refresh user's permissions
$user->refreshPermissions();
```

## Advanced Usage

### Custom Tenant Resolution

Implement custom logic for tenant resolution:

```php
class User extends Authenticatable
{
    use HasRoles, HasPermissions;

    public function getTenantId()
    {
        // Custom logic to determine tenant
        return session('current_company_id') ?? $this->company_id;
    }

    public function getSubTenantId()
    {
        return session('current_branch_id') ?? $this->branch_id;
    }
}
```

### Scoped Queries

When multi-tenancy is enabled, all queries are automatically scoped:

```php
// Automatically scoped to current user's tenant
$roles = Role::all();
$permissions = Permission::all();

// Bypass scoping (use with caution)
$allRoles = Role::withoutGlobalScope(TenantScope::class)->get();
```

### Custom Models

Extend the base models:

```php
// app/Models/Role.php
namespace App\Models;

use Williamug\Permitted\Models\Role as BaseRole;

class Role extends BaseRole
{
    // Add custom methods or attributes
    public function getDisplayAttribute()
    {
        return ucwords($this->name);
    }
}
```

Update config:

```php
'models' => [
    'role' => App\Models\Role::class,
],
```

## Database Structure

The package creates the following tables:

- `roles` - Stores roles
- `permissions` - Stores permissions
- `modules` - Stores modules (if enabled)
- `sub_modules` - Stores sub-modules (if enabled)
- `role_user` - Pivot table for user-role relationship
- `permission_role` - Pivot table for permission-role relationship

With multi-tenancy enabled, `roles` table includes tenant columns automatically.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email asabawilliam@gmail.com or open an issue.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Credits

- **William Asaba** - One of the original implementers for ClinicPlus Hospital Management System
- Inspired by [spatie/laravel-permission](https://github.com/spatie/laravel-permission) but built from scratch to handle multi-tenancy

## Why This Package?

I created this package after finding that [spatie/laravel-permission](https://github.com/spatie/laravel-permission) couldn't handle our multi-tenant single-database architecture in ClinicPlus. This package solves that problem while maintaining a clean, Laravel-esque API.

### Key Differences from Spatie

- Built-in multi-tenancy support (single & multi-database)
- Hierarchical module/sub-module system
- Sub-tenant support (e.g., Company -> Branch)
- Simpler configuration for multi-tenant scenarios
- Production-tested in healthcare SaaS

## Real-World Usage

This package powers **ClinicPlus**, a hospital management system serving multiple healthcare facilities across Uganda, managing:
- 50+ healthcare facilities
- 200+ branches
- 1000+ concurrent users
- Millions of patient records

## More Examples

Check the `/examples` directory for more use cases:

- Hospital Management System (Multi-tenant with branches)
- E-commerce Platform (Multi-database per store)
- School Management System (Single-tenant)
- SaaS Application (Multi-tenant single database)


