# Laravel Tenancy

A clean and simple multi-tenancy package for Laravel applications.

## Requirements

-   PHP 8.0+
-   Laravel 11.0+

## Installation

```bash
composer require saeedhosan/laravel-tenancy
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --provider="SaeedHosan\Tenancy\ServiceProvider"
```

Configure your `config/tenancy.php`:

```php
return [
    'tenant_model' => App\Models\Tenant::class,
    'tenant_key' => 'tenant_id',
    'resolver' => App\Tenancy\TenantResolver::class,
];
```

## Usage

### 1. Create a Tenant Resolver

Implement the `TenantResolver` contract:

```php
<?php

namespace App\Tenancy;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use SaeedHosan\Tenancy\Contracts\TenantResolver;

class TenantResolver implements TenantResolver
{
    public function tenantModel(): string
    {
        return \App\Models\Tenant::class;
    }

    public function tenantKey(): string
    {
        return 'tenant_id';
    }

    public function resolveUserTenant(?Authenticatable $user): ?Model
    {
        if (!$user) {
            return null;
        }

        return $user->tenant;
    }

    public function resolveRouteTenant(Request $request): ?Model
    {
        $tenantId = $request->route('tenant_id');

        return $tenantId
            ? $this->tenantModel()::find($tenantId)
            : null;
    }

    public function resolveAccessibleTenantKeys(?Authenticatable $user, ?Model $userTenant): array
    {
        if (!$user) {
            return [];
        }

        // Users with multiple tenant access
        if (method_exists($user, 'tenants')) {
            return $user->tenants()->pluck('id')->toArray();
        }

        return $userTenant ? [$userTenant->getKey()] : [];
    }

    public function shouldScope(?Authenticatable $user): bool
    {
        return $user !== null;
    }
}
```

### 2. Make Models Tenant-Aware

Use the `HasTenant` trait:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use SaeedHosan\Tenancy\Concerns\HasTenant;

class Post extends Model
{
    use HasTenant;

    protected $fillable = [];
}
```

The trait automatically:

-   Adds a global scope to filter by tenant
-   Auto-assigns `tenant_id` on model creation

### 3. Add the Middleware

Register the middleware in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \SaeedHosan\Tenancy\Http\Middleware\TenantMiddleware::class,
    ]);
})
```

## Available Methods

### Tenant Context

```php
// Get current tenant
currentTenant()->current();

// Get current tenant key
currentTenant()->tenantKey();

// Check if scoping is enabled
currentTenant()->shouldScope();

// Check if a tenant is accessible
currentTenant()->isTenantAccessible($tenantId);
```

### Query Scoping

```php
// Uses the current tenant context (default behavior)
Post::query()->get();

// Scope to specific tenant(s)
Post::query()->forTenant(1)->get();
Post::query()->forTenant([1, 2, 3])->get();
Post::query()->forTenant($tenantModel)->get();

// Bypass tenant scoping
Post::query()->withoutcurrentTenant()->get();
```

## License

MIT
