# Laravel Hive 🐝
<img src="https://i.imgur.com/FMc1luj.png">
<!-- [![Packagist Version](https://img.shields.io/packagist/v/anikrahman/laravel-hive.svg)](https://packagist.org/packages/anikrahman/laravel-hive)
[![License](https://img.shields.io/packagist/l/anikrahman/laravel-hive.svg)](https://github.com/anikrahman0/laravel-hive/blob/main/LICENSE) -->
<!-- [![PHP Version](https://img.shields.io/packagist/php-v/anikrahman/laravel-hive.svg)](https://www.php.net/) -->

A lightweight, production-ready **multi-tenant infrastructure package** for Laravel 12 applications. Laravel Hive focuses on **tenant resolution**, **isolation**, and **developer freedom** — without forcing authentication, UI, or hosting decisions.

---

## ✨ Features

- Subdomain-based tenant resolution (`acme.example.com`)  
- Optional custom domain support (`tenantdomain.com`)  
- Automatic tenant context binding  
- Tenant suspension & activation  
- Shared database or DB-per-tenant support  
- Automatic tenant scoping for Eloquent models  
- Artisan commands for tenant management  
- Fully compatible with Laravel 12

---

## 📦 Installation & Configuration

Follow these steps to install, configure, and start using Laravel Hive:

```bash
# 1. Require the package via Composer
composer require anikrahman/laravel-hive

# 2. Publish configuration
php artisan vendor:publish --tag=hive-config

# 3. Publish migrations
php artisan vendor:publish --tag=hive-migrations

# 4. Run migrations
php artisan migrate
```

---

## 🏁 User Guide (Usage Instructions)

After installing and configuring Laravel Hive, follow these steps:

### Step 1: Apply middleware to routes

Add the tenant middleware to any routes that need tenant-specific behavior:

```php
Route::middleware('hive.tenant')->group(function () {
    Route::get('/dashboard', function () {
        return Tenant::current()->name;
    });
});
```

### Step 2: Make models tenant-aware

Use the `BelongsToTenant` trait for any model that belongs to a tenant:

```php
use AnikRahman\Hive\Traits\BelongsToTenant;

class Post extends Model
{
    use BelongsToTenant;
}
```

All queries on these models are automatically scoped to the current tenant.

### Step 3: Create a tenant

Use the Artisan command:

```bash
php artisan tenant:create "Acme Corp" acme --plan=pro
```

- **"Acme Corp"** → tenant name
- **acme** → tenant subdomain  
- **--plan=pro** → optional plan/feature flag

This creates a tenant entry in the database.

### Step 4: Run migrations for a tenant (DB-per-tenant only)

```bash
php artisan tenant:migrate acme
```

Optional fresh reset:

```bash
php artisan tenant:migrate acme --fresh
```

### Step 5: Suspend or activate a tenant

```bash
php artisan tenant:status acme inactive
php artisan tenant:status acme active
```

Suspended tenants cannot access tenant-specific routes or data.

### Step 6: Access the current tenant in code

Anywhere in your Laravel application:

```php
$tenant = Tenant::current();
$tenantId = Tenant::id();
$plan = Tenant::plan();
```

This allows you to implement tenant-specific logic, feature toggles, or queries.

---

## 🔧 Requirements

- PHP 8.1 or higher
- Laravel 12.0 or higher 

## 🎯 Basic Usage

### 1. Define Tenant-Scoped Models

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use AnikRahman\Hive\Traits\BelongsToTenant;

class Product extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'price'];
}
```

### 2. Create and Manage Tenants

```bash
# Create a new tenant
php artisan tenant:create "My Company" mycompany --plan=pro

# List all tenants
php artisan tenant:list

# Suspend a tenant
php artisan tenant:suspend mycompany

# Activate a tenant
php artisan tenant:activate mycompany
```

### 3. Access Tenant Context

```php
// In controllers, services, or anywhere
$currentTenant = Tenant::current();

// Get tenant-specific data
$products = Product::where('tenant_id', Tenant::id())->get();

// Or let the trait handle it automatically
$products = Product::all(); // Auto-scoped to current tenant
```

---

## 🗂️ Database Strategies

Laravel Hive supports multiple database strategies:

### Shared Database (Default)
All tenants share the same database with a `tenant_id` column.

### Database Per Tenant
Each tenant gets its own database. Configure in `config/hive.php`:

```php
'database' => [
    'strategy' => 'database_per_tenant',
    'prefix' => 'tenant_',
],
```

---

## 🌐 Domain Configuration

Configure tenant domains in `.env`:

```env
APP_DOMAIN=example.com
TENANT_SUBDOMAIN_ENABLED=true
TENANT_CUSTOM_DOMAIN_ENABLED=false
```

---

## 🐛 Issues & Support

Found a bug or need help? [Open an issue](https://github.com/anikrahman0/laravel-hive/issues)

---

## 📜 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## 🙏 Credits

**Name:** Md Anik Rahman  
**Email:** anikrahman a7604366@gmail.com

---
