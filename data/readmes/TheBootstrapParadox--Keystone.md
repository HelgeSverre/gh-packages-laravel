# BSPDX Keystone

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bspdx/keystone.svg?style=flat-square)](https://packagist.org/packages/bspdx/keystone)
[![Total Downloads](https://img.shields.io/packagist/dt/bspdx/keystone.svg?style=flat-square)](https://packagist.org/packages/bspdx/keystone)
[![License](https://img.shields.io/packagist/l/bspdx/keystone.svg?style=flat-square)](https://packagist.org/packages/bspdx/keystone)

A comprehensive, production-ready authentication package for Laravel 12 with an **API-first architecture**. Keystone combines the power of Laravel Fortify, Sanctum, Spatie Laravel Permission, and Spatie Laravel Passkeys to provide a full-featured auth system with:

-   🔐 **Standard Authentication** - Powered by Laravel Fortify
-   👥 **Role-Based Access Control (RBAC)** - Clean service layer API
-   📱 **TOTP Two-Factor Authentication** - Google Authenticator, Authy, etc.
-   🔑 **Passkey Authentication** - Modern WebAuthn/FIDO2 login
-   🛡️ **Passkey as 2FA** - Use passkeys as a second factor
-   🎨 **Optional Blade UI Components** - Pre-built views for Laravel projects
-   🌐 **API-First Design** - Works with React, Vue, mobile apps, or any frontend
-   🏢 **Multi-Tenancy Ready** - Optional tenant scoping

## Frontend Flexibility

**Keystone works with any frontend framework:**
- ✅ **React, Vue, Angular, Svelte** - Use the JSON API endpoints
- ✅ **Mobile Apps** - iOS, Android, React Native, Flutter
- ✅ **Laravel Blade** - Optional pre-built UI components included
- ✅ **Inertia.js** - Perfect for hybrid approaches

All controllers return JSON when requested, making Keystone truly framework-agnostic at the API level.

## Table of Contents

-   [Frontend Flexibility](#frontend-flexibility)
-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [User Model Setup](#user-model-setup)
    -   [Service Layer](#service-layer-new-in-v030)
    -   [Blade Components (Optional)](#blade-components-optional)
    -   [Routes](#routes)
    -   [Middleware](#middleware)
    -   [API Usage](#api-usage)
-   [Architecture](#architecture)
-   [HTTPS Setup](#https-setup)
-   [Multi-Tenancy](#multi-tenancy)
-   [Testing](#testing)
-   [Credits](#credits)
-   [License](#license)

## Requirements

-   PHP 8.2+
-   Laravel 12.0+
-   MySQL 5.7+ / PostgreSQL 9.6+ / SQLite 3.8.8+

## Installation

### Step 1: Install via Composer

```bash
composer require bspdx/keystone
```

### Step 2: Publish Configuration & Assets

```bash
# Publish the essentials: configuration and migrations
php artisan vendor:publish --tag=keystone-config --tag=keystone-migrations

# Publish Blade views (optional - only if you want to customize)
php artisan vendor:publish --tag=keystone-views

# Publish example routes
php artisan vendor:publish --tag=keystone-routes

# Publish database seeders
php artisan vendor:publish --tag=keystone-seeders
```

### Step 3: Run Migrations

```bash
php artisan migrate
```

This will create tables for:

-   Two-factor authentication columns in `users` table
-   Roles and permissions (Spatie)
-   Passkeys (Spatie)
-   Personal access tokens (Sanctum)

### Step 4: Seed Demo Data (Optional)

```bash
php artisan db:seed --class=KeystoneSeeder
```

This creates:

-   4 default roles: `super-admin`, `admin`, `editor`, `user`
-   Common permissions for each role
-   4 demo users (all with password: `password`)
    -   `superadmin@example.com` - Super Admin
    -   `admin@example.com` - Admin
    -   `editor@example.com` - Editor
    -   `user@example.com` - Regular User

### Step 5: Configure Fortify

In your `config/fortify.php`, ensure these features are enabled:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

## Configuration

The package configuration is located at `config/keystone.php`. Key settings:

### Enable/Disable Features

```php
'features' => [
    'registration' => true,
    'email_verification' => true,
    'two_factor' => true,
    'passkeys' => true,
    'passkey_2fa' => true,
    'api_tokens' => true,
    'update_profile' => true,
    'update_passwords' => true,
    'account_deletion' => false,
    'passwordless_login' => true,
    'show_permissions' => true,

    // Enable multi-tenant mode (adds tenant_id column to users, roles, and permissions tables)
    'multi_tenant' => env('KEYSTONE_MULTI_TENANT', false),
],
```

When `multi_tenant` is enabled, Keystone will add a nullable `tenant_id` column to users, roles, permissions, and pivot tables. Keystone uses **global scopes** for automatic tenant isolation (not Spatie's teams feature).

**Key Features:**
- **Automatic Filtering** - Authenticated users only see roles/permissions for their tenant
- **Global Roles/Permissions** - Set `tenant_id = NULL` for cross-tenant access
- **UUID Support** - Works with both UUID and bigint tenant IDs
- **Super-Admin Bypass** - Use `::withoutTenant()` for cross-tenant operations

**Example:**

```php
use BSPDX\Keystone\Models\KeystoneRole;

// Create global role (accessible to all tenants)
$superAdmin = KeystoneRole::withoutTenant()->create([
    'name' => 'super_administrator',
    'tenant_id' => null,
]);

// Create tenant-specific role (auto-scoped)
Auth::login($userInTenantA);
$manager = KeystoneRole::create(['name' => 'manager']);
// tenant_id automatically populated from auth()->user()->tenant_id
```

See [Multi-Tenancy Documentation](docs/multi-tenancy.md) for detailed architecture, usage examples, and migration guides.

### RBAC Settings

```php
'rbac' => [
    'default_role' => 'user',
    'super_admin_role' => 'super-admin',
],
```

### Passkey Settings

```php
'passkey' => [
    'rp_name' => env('APP_NAME', 'Laravel'),
    'rp_id' => env('PASSKEY_RP_ID', 'localhost'),
    'user_verification' => 'preferred',
    'allow_multiple' => true,
    'required_for_roles' => [
        // 'admin',
    ],
],
```

### Two-Factor Settings

```php
'two_factor' => [
    'qr_code_size' => 200,
    'recovery_codes_count' => 8,
    'required_for_roles' => [
        // 'admin',
    ],
],
```

## Usage

### User Model Setup

Add the `HasKeystone` trait to your `User` model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use BSPDX\Keystone\Traits\HasKeystone;

class User extends Authenticatable
{
    use Notifiable, HasKeystone;

    // ... rest of your model
}
```

This trait combines:

-   `HasApiTokens` (Sanctum)
-   `TwoFactorAuthenticatable` (Fortify)
-   `HasRoles` (Spatie Permission)
-   `HasPasskeys` (Spatie Passkeys)

### Service Layer (NEW in v0.3.0)

Keystone v0.3.0 introduces a clean service layer architecture to interact with roles, permissions, and passkeys. All external dependencies are now abstracted behind Keystone services.

#### Using Services in Controllers

```php
<?php

namespace App\Http\Controllers;

use BSPDX\Keystone\Services\Contracts\RoleServiceInterface;
use BSPDX\Keystone\Services\Contracts\PermissionServiceInterface;
use BSPDX\Keystone\Services\Contracts\AuthorizationServiceInterface;
use BSPDX\Keystone\Services\Contracts\PasskeyServiceInterface;

class AdminController extends Controller
{
    public function __construct(
        private RoleServiceInterface $roleService,
        private PermissionServiceInterface $permissionService,
        private AuthorizationServiceInterface $authService
    ) {}

    public function assignRole(User $user)
    {
        // Get all roles
        $roles = $this->roleService->getAllWithPermissions();

        // Assign roles to user
        $this->authService->assignRolesToUser($user, ['admin', 'editor']);

        // Check if user has role
        if ($this->authService->userHasRole($user, 'admin')) {
            // User is admin
        }
    }
}
```

**Benefits:**
- Clean dependency injection
- Easy to mock for testing
- No direct external package dependencies in your code
- Future-proof architecture

### Blade Components (Optional)

Keystone provides **optional** pre-built Blade components for Laravel projects. If you're using React, Vue, or another frontend framework, you can skip this section and use the JSON API endpoints instead.

**For Laravel Blade users:**

#### Login Form

```blade
<x-keystone::login-form
    :show-passkey-option="true"
    :show-remember-me="true"
    :show-register-link="true"
    :show-forgot-password="true"
/>
```

#### Register Form

```blade
<x-keystone::register-form
    :show-login-link="true"
    :required-fields="['name', 'email', 'password', 'password_confirmation']"
/>
```

#### Two-Factor Challenge

```blade
<x-keystone::two-factor-challenge
    :show-recovery-code-option="true"
/>
```

#### Passkey Registration

```blade
<x-keystone::passkey-register />
```

#### Passkey Login

```blade
<x-keystone::passkey-login />
```

### Routes

Keystone doesn't auto-register routes. Add them manually from the published examples:

**Web Routes** (`routes/keystone-web.php`):

```php
// Include in your routes/web.php
require __DIR__.'/keystone-web.php';
```

**API Routes** (`routes/keystone-api.php`):

```php
// Include in your routes/api.php
require __DIR__.'/keystone-api.php';
```

### Middleware

Keystone provides three middleware aliases:

#### Role Middleware

```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Only users with 'admin' role can access
});

// Multiple roles (OR logic)
Route::middleware(['auth', 'role:admin,editor'])->group(function () {
    // Users with 'admin' OR 'editor' role can access
});
```

#### Permission Middleware

```php
Route::middleware(['auth', 'permission:edit-posts'])->group(function () {
    // Only users with 'edit-posts' permission
});

// Multiple permissions
Route::middleware(['auth', 'permission:edit-posts,publish-posts'])->group(function () {
    // Users with either permission can access
});
```

#### 2FA Enforcement Middleware

```php
Route::middleware(['auth', '2fa'])->group(function () {
    // Ensures users with required roles have 2FA enabled
});
```

### Checking Permissions in Code

#### Traditional Approach (User Model Methods)

```php
// Check role
if (auth()->user()->hasRole('admin')) {
    // User is an admin
}

// Check permission
if (auth()->user()->can('edit-posts')) {
    // User can edit posts
}

// Check multiple roles
if (auth()->user()->hasAnyRole(['admin', 'editor'])) {
    // User has at least one of these roles
}

// Super admin check
if (auth()->user()->isSuperAdmin()) {
    // User is super admin (bypasses all permission checks)
}
```

#### Service Layer Approach (Recommended for Controllers)

```php
use BSPDX\Keystone\Services\Contracts\AuthorizationServiceInterface;

class PostController extends Controller
{
    public function __construct(
        private AuthorizationServiceInterface $authService
    ) {}

    public function edit(Post $post)
    {
        if ($this->authService->userHasPermission(auth()->user(), 'edit-posts')) {
            // User can edit posts
        }
    }
}
```

### API Usage

Keystone is designed with an **API-first architecture**, making it perfect for:
- Single Page Applications (React, Vue, Angular, Svelte)
- Mobile applications (iOS, Android, React Native, Flutter)
- Headless/decoupled architectures
- Microservices

#### Authentication

Use Sanctum for API authentication. All Keystone controllers automatically return JSON when the request has `Accept: application/json` header or uses `wantsJson()`:

```php
// Login endpoint (you need to create this)
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = $request->user();
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user,
    ]);
});
```

#### API Endpoints

All API routes are protected with `auth:sanctum` middleware. Example requests:

**Get All Roles:**

```bash
curl -X GET http://localhost/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Assign Role to User:**

```bash
curl -X POST http://localhost/api/users/1/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["admin"]}'
```

**Enable 2FA:**

```bash
curl -X POST http://localhost/api/user/two-factor-authentication \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture

Keystone v0.3.0+ uses an **API-first, service layer architecture** to isolate external dependencies and provide maximum flexibility for any frontend framework.

### Service Layer

All role, permission, and passkey operations go through dedicated services:

- **PasskeyService** - Manages WebAuthn/passkey operations
  - `registerOptions()`, `register()`, `authenticationOptions()`, `authenticate()`
- **RoleService** - Role CRUD and queries
  - `getAllWithPermissions()`, `create()`, `delete()`, `syncPermissions()`
- **PermissionService** - Permission CRUD and queries
  - `getAllWithRoles()`, `create()`, `delete()`, `syncToUser()`
- **AuthorizationService** - High-level authorization operations
  - `assignRolesToUser()`, `assignPermissionsToUser()`, `userHasRole()`, `userHasPermission()`

All services are registered in Laravel's service container with interface bindings and convenient aliases:
- `keystone.passkey`
- `keystone.roles`
- `keystone.permissions`
- `keystone.authorization`

### Models

Keystone provides its own model classes that extend Spatie's models:

- `BSPDX\Keystone\Models\KeystoneRole` - Extends Spatie's Role model
  - Adds `isSuperAdmin()` method
- `BSPDX\Keystone\Models\KeystonePermission` - Extends Spatie's Permission model

All type hints use these Keystone models, providing a consistent `BSPDX\Keystone` namespace throughout your application.

### Benefits

- **API-First** - Works with any frontend framework (React, Vue, mobile apps, etc.)
- **Testability** - Mock service interfaces in tests instead of facades
- **Maintainability** - All external dependencies isolated in service layer
- **Flexibility** - Easy to swap implementations or add caching/logging
- **Clean API** - No third-party classes in your controllers
- **Optional UI** - Blade components included but completely optional

## Multi-Tenancy

Keystone provides comprehensive multi-tenant support using **global scopes** for automatic tenant isolation. Roles and permissions can be global (accessible across all tenants) or tenant-specific (isolated per organization).

### Quick Start

Enable multi-tenancy in your `.env`:

```env
KEYSTONE_MULTI_TENANT=true
```

### Features

- **Automatic Tenant Filtering** - Global scopes automatically filter roles/permissions by authenticated user's tenant
- **Global Roles/Permissions** - Set `tenant_id = NULL` to make roles/permissions accessible across all tenants
- **Tenant-Specific Roles** - Roles with `tenant_id` are isolated to a single organization
- **UUID Support** - Works with both UUID and bigint tenant IDs
- **Super-Admin Bypass** - Use `::withoutTenant()` scope for cross-tenant operations

### Usage Examples

#### Creating Global Roles

```php
use BSPDX\Keystone\Models\KeystoneRole;

// Create a global role accessible to all tenants
$superAdmin = KeystoneRole::withoutTenant()->create([
    'name' => 'super_administrator',
    'title' => 'Super Administrator',
    'tenant_id' => null,  // Global role
]);
```

#### Creating Tenant-Specific Roles

```php
// tenant_id is auto-populated from authenticated user
Auth::login($userInTenantA);

$manager = KeystoneRole::create([
    'name' => 'department_manager',
    'title' => 'Department Manager',
    // tenant_id automatically set from auth()->user()->tenant_id
]);
```

#### Super-Admin Operations

```php
use BSPDX\Keystone\Facades\Keystone;

// View all roles across all tenants
$allRoles = KeystoneRole::withoutTenant()->get();

// Check if user can bypass tenant filtering
if (Keystone::canBypassPermissions($user)) {
    // User is super-admin
}
```

### Tenant Management Commands

Keystone provides artisan commands for managing tenants:

```bash
# List all tenants with statistics
php artisan keystone:list-tenants

# Show detailed information for a specific tenant
php artisan keystone:show-tenant {tenant_id}

# List roles for a specific tenant
php artisan keystone:list-roles --tenant={tenant_id}

# Create a tenant-specific role
php artisan keystone:create-role manager --tenant={tenant_id}

# Assign role to user within tenant context
php artisan keystone:assign-role admin --user={user_id} --tenant={tenant_id}
```

**Note:** Role and permission commands require tenant IDs when multi-tenancy is enabled.

### Learn More

For comprehensive documentation on multi-tenancy:
- [Multi-Tenancy Architecture](docs/multi-tenancy.md) - Global scopes vs Spatie teams
- [Multi-Tenant Usage Examples](docs/examples/multi-tenant-usage.md) - Common patterns and best practices
- Migration guides for upgrading from single-tenant to multi-tenant

## HTTPS Setup

**Passkeys require HTTPS!** See our detailed guide: [HTTPS Setup for Laravel Sail](docs/https-setup.md)

Quick summary:

1. Install `mkcert`:

    ```bash
    brew install mkcert  # macOS
    mkcert -install
    ```

2. Generate certificates:

    ```bash
    mkdir -p docker/ssl && cd docker/ssl
    mkcert localhost 127.0.0.1 ::1
    mv localhost+2.pem cert.pem
    mv localhost+2-key.pem key.pem
    ```

3. Update `.env`:

    ```env
    APP_URL=https://localhost
    SESSION_SECURE_COOKIE=true
    ```

4. Configure Nginx/Caddy to use the certificates

See the full guide for detailed instructions.

## Testing

Run the package tests:

```bash
composer test
```

Or with PHPUnit directly:

```bash
./vendor/bin/phpunit
```

## Customization

### Custom Blade Views

Publish the views and modify as needed:

```bash
php artisan vendor:publish --tag=keystone-views
```

Views will be in `resources/views/vendor/keystone/`.

### Custom Styling

All Blade components use CSS custom properties for easy theming:

```css
:root {
    --keystone-primary: #4f46e5;
    --keystone-primary-hover: #4338ca;
    --keystone-danger: #dc2626;
    --keystone-text: #1f2937;
    --keystone-border: #d1d5db;
    --keystone-bg: #ffffff;
    --keystone-radius: 0.5rem;
}
```

## Security

If you discover any security issues, please email info@bspdx.com instead of using the issue tracker.

## Credits

-   [BSPDX](https://github.com/TheBootstrapParadox)
-   Built with:
    -   [Laravel Fortify](https://github.com/laravel/fortify)
    -   [Laravel Sanctum](https://github.com/laravel/sanctum)
    -   [Spatie Laravel Permission](https://github.com/spatie/laravel-permission) *(abstracted)*
    -   [Spatie Laravel Passkeys](https://github.com/spatie/laravel-passkeys) *(abstracted)*

**Note:** Starting with v0.3.0, all Spatie dependencies are abstracted through Keystone's service layer, providing a clean `BSPDX\Keystone` namespace throughout your application.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

---

## Quick Start Example

Here's a complete example to get you started quickly:

### 1. Install Package

```bash
composer require bspdx/keystone
php artisan vendor:publish --tag=keystone-config
php artisan vendor:publish --tag=keystone-migrations
php artisan migrate
php artisan db:seed --class=KeystoneSeeder
```

### 2. Update User Model

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use BSPDX\Keystone\Traits\HasKeystone;

class User extends Authenticatable
{
    use HasKeystone;

    protected $fillable = ['name', 'email', 'password'];
}
```

### 3. Create Login Page

```blade
<!-- resources/views/auth/login.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <x-keystone::login-form />
</body>
</html>
```

### 4. Add Routes

```php
// routes/web.php
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

// Include Keystone routes
require __DIR__.'/keystone-web.php';
```

### 5. Test It Out

```bash
# Start server (with HTTPS for passkeys)
./vendor/bin/sail up

# Visit https://localhost/login
# Use demo credentials: admin@example.com / password
```

That's it! You now have a complete authentication system with 2FA, passkeys, and RBAC.

## Support

-   **Documentation:** [Full documentation](https://github.com/TheBootstrapParadox/Keystone/wiki)
-   **Issues:** [GitHub Issues](https://github.com/TheBootstrapParadox/Keystone/issues)
-   **Discussions:** [GitHub Discussions](https://github.com/TheBootstrapParadox/Keystone/discussions)
