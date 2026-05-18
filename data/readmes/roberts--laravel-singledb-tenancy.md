# Laravel Single Database Tenancy

[![Latest Version on Packagist](https://img.shields.io/packagist/v/roberts/laravel-singledb-tenancy.svg?style=flat-square)](https://packagist.org/packages/roberts/laravel-singledb-tenancy)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/roberts/laravel-singledb-tenancy/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/roberts/laravel-singledb-tenancy/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/roberts/laravel-singledb-tenancy/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/roberts/laravel-singledb-tenancy/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/roberts/laravel-singledb-tenancy.svg?style=flat-square)](https://packagist.org/packages/roberts/laravel-singledb-tenancy)

A Laravel package for single-database multi-tenancy. It offers automatic data isolation, tenant resolution by domain, and flexible routing, making it a complete solution for SaaS applications.

## Features

- **Automatic Tenant Resolution**: Resolve tenants by domain or subdomain.
- **Data Isolation**: Automatically scope Eloquent models to the current tenant.
- **Tenant Context**: Global helper functions (`current_tenant()`) to access the active tenant.
- **Smart Fallback**: Automatically fall back to a primary tenant if no tenant is resolved.
- **Caching**: Fast tenant resolution via configurable caching.
- **Tenant-Specific Routing**: Support for loading custom route files for each tenant.
- **Artisan Commands**: Built-in commands for migrations and diagnostics.
- **Forced Tenant Mode**: Simplify development and testing by forcing a specific tenant.

## Requirements

- PHP 8.5+
- Laravel 13.0+

## Installation

Install the package via Composer:

```bash
composer require roberts/laravel-singledb-tenancy
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-singledb-tenancy-migrations"
php artisan migrate
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="laravel-singledb-tenancy-config"
```

## Configuration

The package provides extensive configuration options in `config/singledb-tenancy.php`:

### Caching Configuration

```php
'caching' => [
    'enabled' => env('TENANT_CACHE_ENABLED', true),
    'store' => env('TENANT_CACHE_STORE', 'array'),
    'ttl' => env('TENANT_CACHE_TTL', 3600),
],
```

### Error Handling

```php
'failure_handling' => [
    'unresolved_tenant' => 'fallback', // fallback|continue|exception|redirect
],
```

## Basic Usage

### 1. Creating Tenants

```php
use Roberts\LaravelSingledbTenancy\Models\Tenant;

// Create a tenant with a root domain
$tenant = Tenant::create([
    'name' => 'Acme Corporation',
    'domain' => 'acme.com',
    'slug' => 'acme', // Auto-generated if not provided
]);

// Create a tenant with a subdomain
$tenant = Tenant::create([
    'name' => 'Beta Company',
    'domain' => 'beta.acme.com', // Full subdomain in domain field
    'slug' => 'beta',
]);

// Create another tenant with a different subdomain
$tenant = Tenant::create([
    'name' => 'Enterprise Division',
    'domain' => 'enterprise.acme.com', // Each subdomain gets its own entry
    'slug' => 'enterprise',
]);
```

### 2. Making Models Tenant-Aware

Add the `HasTenant` trait to your models. It automatically scopes queries to the current tenant, sets the `tenant_id` on creation, and adds a `tenant()` relationship.

```php
use Roberts\LaravelSingledbTenancy\Traits\HasTenant;

class Post extends Model
{
    use HasTenant;
    
    protected $fillable = ['tenant_id'];
}
```

This automatically applies tenant scoping to queries, sets tenant_id on creation, and provides a `tenant()` relationship.

### 3. Setting Up Middleware

Apply the tenant resolution middleware to your routes:

```php
// Domain resolution for all routes
Route::middleware(['web', 'tenant'])->group(function () {
    Route::get('/dashboard', DashboardController::class);
});

// Domain resolution only
Route::middleware(['web', 'tenant:domain'])->group(function () {
    Route::get('/custom', CustomController::class);
});
```

## Advanced Features

### Tenant-Aware Jobs

To make your queued jobs tenant-aware, simply use the `TenantAware` trait. It automatically captures the tenant context when the job is dispatched and restores it when the job is processed.

```php
use Roberts\LaravelSingledbTenancy\Concerns\TenantAware;

class ProcessReport implements ShouldQueue
{
    use TenantAware;

    public function handle()
    {
        // All Eloquent queries are automatically scoped to the correct tenant.
        $sales = Sale::all();
    }
}
```

### Tenant-Aware Commands

Create tenant-aware artisan commands by extending the `TenantAwareCommand` class. This automatically provides `--tenant=<id>` and `--all-tenants` options.

Implement your logic in the `handleTenant()` method, where the tenant context is guaranteed to be set.

```php
use Roberts\LaravelSingledbTenancy\Commands\TenantAwareCommand;

class GenerateReport extends TenantAwareCommand
{
    protected $signature = 'report:generate {--tenant=} {--all-tenants}';
    protected $description = 'Generate a sales report.';

    public function handleTenant()
    {
        $this->info('Generating report for: ' . current_tenant()->name);
    }
}
```

### Tenant Lifecycle Events

The package dispatches events to allow you to hook into the tenant lifecycle:

- `TenantCreated`: After a new tenant is created.
- `TenantResolved`: After the tenant context is set for a request.
- `TenantSuspended`: After a tenant is suspended.
- `TenantReactivated`: After a tenant is reactivated.
- `TenantDeleted`: After a tenant is soft deleted.

You can listen for these events in your `EventServiceProvider`:

```php
use Roberts\LaravelSingledbTenancy\Events\TenantCreated;

protected $listen = [
    TenantCreated::class => [
        'App\Listeners\SetupNewTenant',
    ],
];
```

### Tenant Context Management

The package provides global helper functions for tenant context:

```php
// Get current tenant
$tenant = current_tenant();
$tenantId = current_tenant_id();

// Check if tenant is set
if (has_tenant()) {
    // Tenant-specific logic
}

// Require tenant (throws exception if none set)
$tenant = require_tenant();

// Run code in specific tenant context
tenant_context()->runWith($tenant, function () {
    // This code runs with $tenant as current tenant
    $posts = Post::all(); // Only posts for $tenant
});
```

### Manual Tenant Context

You can manually set the tenant context:

```php
// Set tenant context
tenant_context()->set($tenant);

// Clear tenant context
tenant_context()->clear();

// Run without tenant context (see all data)
tenant_context()->runWithout(function () {
    $allPosts = Post::all(); // All posts across all tenants
});
```

### Model Scoping

Tenant-aware models are automatically scoped:

```php
// Automatically scoped to current tenant
$posts = Post::all();

// Query specific tenant
$posts = Post::forTenant($tenant)->get();

// Query all tenants (removes tenant scope)
$allPosts = Post::forAllTenants()->get();

// Custom tenant column (override default 'tenant_id')
class CustomModel extends Model
{
    use HasTenant;
    
    protected $tenantColumn = 'organization_id';
}
```

### Custom Route Files

You can create tenant-specific route files in the `routes/tenants/` directory. The file name should match the tenant's domain.

```
routes/
├── web.php              # Default routes for all tenants
└── tenants/
    ├── acme.com.php         # Routes for 'acme.com' tenant domain
    └── sub.acme.com.php   # Routes for 'sub.acme.com' tenant domain
```

**Important:** When a custom route file is found for a tenant, it **overrides** the default `routes/web.php` file. If you want to augment the default routes, you must manually include them at the botttom of your tenant's route file:

```php
// routes/tenants/acme.com.php
Route::get('/special', ...);

// Also load all the shared routes
require base_path('routes/web.php');
```

### Development and Testing

Force a specific tenant during development:

```bash
# .env
FORCE_TENANT_DOMAIN=dev.yourapp.com
```

Disable tenant resolution for tests that need to see all data:

```php
tenant_context()->runWithout(function () {
    $this->assertCount(10, Post::all()); // All tenant data
});
```

## Tenant Resolution

The package uses **domain-based resolution** to match the full request domain against the `domain` column in your tenants table. This works for both root domains and subdomains.

### How It Works

```php
// Root domain resolution
// Request: https://acme.com/dashboard
// Matches: Tenant with domain = 'acme.com'

// Subdomain resolution  
// Request: https://beta.acme.com/dashboard
// Matches: Tenant with domain = 'beta.acme.com'

// Deep subdomain resolution
// Request: https://api.beta.acme.com/dashboard  
// Matches: Tenant with domain = 'api.beta.acme.com'

// Custom domain resolution
// Request: https://customdomain.co.uk/dashboard
// Matches: Tenant with domain = 'customdomain.co.uk'
```

### Database Structure

Your tenants table should contain complete domain entries:

```php
// Example tenant records:
['id' => 1, 'name' => 'Main Site', 'domain' => 'acme.com', 'slug' => 'main']
['id' => 2, 'name' => 'Beta Site', 'domain' => 'beta.acme.com', 'slug' => 'beta'] 
['id' => 3, 'name' => 'API Site', 'domain' => 'api.acme.com', 'slug' => 'api']
['id' => 4, 'name' => 'Enterprise', 'domain' => 'enterprise.acme.com', 'slug' => 'enterprise']
['id' => 5, 'name' => 'Custom Domain', 'domain' => 'anotherdomain.com', 'slug' => 'another']
```

If no tenant is resolved, the Smart Fallback Logic can automatically fallback to a designated primary tenant.

## Smart Fallback Logic

The Smart Fallback Logic provides automatic fallback to a primary tenant when normal resolution fails. This ensures your application always has a valid tenant context, which is particularly useful for shared content or landing pages.

### How It Works

1. **Normal Resolution**: First attempts standard domain/subdomain resolution
2. **Fallback Check**: If no tenant is found and fallback is enabled, checks for primary tenant
3. **Primary Tenant**: Falls back to tenant with ID 1 (configurable)
4. **Smart Skipping**: Automatically skips fallback when no tenants exist in the database
5. **Suspension Respect**: Won't fallback to suspended primary tenant

### Caching Behavior

- Primary tenant existence is cached permanently once confirmed
- Cache is invalidated when tenants are deleted
- Tenant existence cache prevents unnecessary database queries

### Use Cases

- **Landing Pages**: Serve shared content when no tenant is specified
- **Marketing Sites**: Display default content for non-tenant visitors  
- **Development**: Consistent behavior during application setup
- **Error Recovery**: Graceful handling of misconfigured domains

## Management Commands

The package includes helpful Artisan commands for managing your tenancy setup:

### Add Tenant Column Command

Quickly add tenant_id columns to existing tables with proper foreign key constraints:

```bash
# Add tenant_id column to posts table
php artisan tenancy:add-tenant-column posts

# Add with custom options
php artisan tenancy:add-tenant-column posts --nullable --index --column=organization_id
```

### Tenancy Info Command

Display comprehensive information about your tenancy configuration and current state:

```bash
php artisan tenancy:info
```

This command shows:
- Resolution strategy status
- Caching configuration
- Current tenant context
- Database tenant statistics
- Smart Fallback Logic settings

### Caching

Tenant resolution results are cached automatically to improve performance. Cache is invalidated when tenants are modified.

## Error Handling

### Unresolved Tenant

When no tenant can be resolved from the request:

- `fallback` - Use Smart Fallback Logic to primary tenant
- `continue` - Continue without tenant context
- `exception` - Throw RuntimeException
- `redirect` - Redirect to specified route

Suspended (soft deleted) tenants are automatically blocked and will not be resolved.

## Security

### Super Admin

You can designate a single "super admin" user who has privileges over the entire tenancy system (e.g., for accessing a future admin panel). This is configured by setting an environment variable:

```bash
# .env
TENANCY_SUPER_ADMIN_EMAIL=super@admin.com
```

The package provides a `SuperAdmin` service to check if a user is the designated super admin:

```php
use Roberts\LaravelSingledbTenancy\Services\SuperAdmin;

$user = auth()->user();

if (app(SuperAdmin::class)->is($user)) {
    // User is the super admin
}
```

### Primary Tenant Authorization

The package includes a middleware to restrict access to routes that should only be available on the primary tenant's domain (i.e., the tenant with ID `1`). This is useful for creating a centralized admin panel.

To use it, simply add the `auth.primary` middleware to your routes:

```php
use Roberts\LaravelSingledbTenancy\Middleware\AuthorizePrimaryTenant;

Route::get('/tenancy-dashboard', ...)->middleware(AuthorizePrimaryTenant::class);
```

If a user attempts to access this route from any domain other than the primary tenant's, they will receive a `404 Not Found` error.

## Testing

Run the comprehensive test suite:

```bash
composer test                # Run tests  
composer test:coverage       # Run with coverage
composer analyse             # Static analysis
```

Test your tenant-aware code:

```php
use Roberts\LaravelSingledbTenancy\Models\Tenant;

class PostTest extends TestCase
{
    public function test_posts_are_scoped_to_tenant()
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();
        
        tenant_context()->set($tenant1);
        $post1 = Post::create(['title' => 'Tenant 1 Post']);
        
        tenant_context()->set($tenant2);
        $post2 = Post::create(['title' => 'Tenant 2 Post']);
        
        // Verify isolation
        tenant_context()->set($tenant1);
        $this->assertCount(1, Post::all());
        $this->assertEquals('Tenant 1 Post', Post::first()->title);
    }
}
```

## API Reference

### Models

#### Tenant

```php
// Properties
$tenant->id;           // Primary key
$tenant->name;         // Tenant display name
$tenant->slug;         // URL-safe identifier
$tenant->domain;       // Custom domain (optional)
$tenant->suspended_at; // Soft delete timestamp

// Methods
$tenant->isActive();                    // Check if tenant is active
$tenant->suspend();                     // Suspend tenant
$tenant->reactivate();                  // Reactivate tenant
$tenant->url($path = '/');              // Generate tenant URL
Tenant::resolveByDomain($domain);       // Find tenant by domain
Tenant::resolveBySlug($slug);           // Find tenant by slug
```

### Services

#### TenantContext

```php
// Set/get current tenant
tenant_context()->set($tenant);
$tenant = tenant_context()->get();
tenant_context()->clear();

// Run code in tenant context
tenant_context()->runWith($tenant, $callback);
tenant_context()->runWithout($callback);

// Check tenant state
tenant_context()->has();
tenant_context()->id();
```

#### TenantCache

Automatic caching of tenant resolution - no direct usage required.

### Middleware

#### TenantResolutionMiddleware

```php
// Apply to routes
Route::middleware('tenant')->group(...);           // All strategies
Route::middleware('tenant:domain')->group(...);    // Domain only
Route::middleware('tenant:subdomain')->group(...); // Subdomain only
```

## Configuration Reference

### Full Configuration File

```php
<?php

return [
    // Tenant model configuration
    'tenant_model' => \Roberts\LaravelSingledbTenancy\Models\Tenant::class,
    
    // Caching configuration
    'caching' => [
        'enabled' => env('TENANT_CACHE_ENABLED', true),
        'store' => env('TENANT_CACHE_STORE', 'array'),
        'ttl' => env('TENANT_CACHE_TTL', 3600),
    ],
    
    // Error handling
    'failure_handling' => [
        'unresolved_tenant' => 'fallback', // fallback|continue|exception|redirect
        'redirect_route' => 'tenant.select',
    ],
    
    // Development
    'development' => [
        'local_domains' => ['.test', '.local', '.localhost'],
        'force_tenant' => env('FORCE_TENANT_DOMAIN'),
    ],
];
```

## Environment Variables

```bash
# Tenant caching
TENANT_CACHE_ENABLED=true
TENANT_CACHE_STORE=redis
TENANT_CACHE_TTL=3600

# Development
FORCE_TENANT_DOMAIN=dev.yourapp.com
```

## Migration

This package includes a tenant migration that creates the `tenants` table:

```php
Schema::create('tenants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('domain')->nullable()->unique();
    $table->timestamps();
    $table->softDeletes('suspended_at');
});
```

Add `tenant_id` to your existing tables:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('tenant_id')->constrained();
});
```

Or use the built-in command:

```bash
php artisan tenancy:add-tenant-column posts
```

## Best Practices

1. **Always use the HasTenant trait** on models that should be tenant-aware
2. **Cache tenant resolution** in production for better performance
3. **Test tenant isolation** thoroughly to prevent data leaks
4. **Use tenant context helpers** instead of manual database queries
5. **Configure reserved subdomains** to avoid conflicts with system routes
6. **Implement proper error handling** for unresolved tenants

## Troubleshooting

**Tenant not resolving**: Verify middleware is applied, check configuration, ensure tenant exists
**Data leaking between tenants**: Confirm HasTenant trait usage and tenant context
**Cache issues**: Verify cache configuration and clear stale data
**Custom routes not loading**: Check file naming, path existence, and syntax

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Drew Roberts](https://github.com/drewroberts)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
