<p align="center">
  <img src="realm-banner-custom.svg" width="100%" alt="Laravel Realm">
</p>

<p align="center">
  <a href="https://packagist.org/packages/mahdisphp/laravel-realm"><img src="https://img.shields.io/packagist/v/mahdisphp/laravel-realm" alt="Version"></a>
  <a href="https://packagist.org/packages/mahdisphp/laravel-realm"><img src="https://img.shields.io/packagist/dt/mahdisphp/laravel-realm" alt="Downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/packagist/l/mahdisphp/laravel-realm" alt="License"></a>
</p>

---

## What is Realm?

Realm adds multi-tenancy to your Laravel app with a single trait and a safety-first approach. It's designed for the 80% of SaaS apps that need row-level tenant isolation in a single database.

**Column strategy only.** Database-per-tenant and schema-per-tenant strategies are coming in v1.0.

### What makes Realm different?

- **Fail-closed by default.** If no tenant context is active, queries on tenant models return empty results — not all tenants' data. Data leaks should be impossible by default.
- **Clean naming.** The `Realm` facade and `Tenant` model are separate classes with zero method overlap. No ambiguity.
- **One trait, one macro.** Add `BelongsToRealm` to a model and `$table->realm()` to a migration. That's it.
- **Octane-ready.** Context is automatically reset between requests. No manual setup required.

### What Realm is NOT (yet)

- Battle-tested. This is a new package. Use in production at your own risk and report bugs.
- A replacement for [stancl/tenancy](https://tenancyforlaravel.com/). Stancl has years of production edge cases discovered and fixed. If you need database-per-tenant today, use stancl.

## Requirements

- PHP 8.2+
- Laravel 11, 12, or 13

## Installation

```bash
composer require mahdisphp/laravel-realm
php artisan realm:install
```

## Quick Start

### 1. Add the trait to your model

```php
use Realm\Traits\BelongsToRealm;

class Project extends Model
{
    use BelongsToRealm;
}
```

### 2. Add the column to your migration

```php
Schema::create('projects', function (Blueprint $table) {
    $table->id();
    $table->realm();  // Adds realm_id + index
    $table->string('name');
    $table->timestamps();
});
```

### 3. Wrap your routes

```php
// Tenant routes — realm context is resolved automatically
Route::realm(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('projects', ProjectController::class);
});

// Central routes — guaranteed no tenant context
Route::central(function () {
    Route::get('/', [MarketingController::class, 'index']);
});
```

### 4. That's it

```php
// Inside a tenant route, queries are scoped automatically
Project::all();           // Only current tenant's projects
Project::create([...]);   // realm_id set automatically

// Outside tenant context (strict mode) — returns empty, not everything
Project::all();           // [] — fail-closed, logged warning
```

## Key Concepts

### The Facade vs The Model

```php
// FACADE — context management (Realm)
Realm::current();                    // Get active Tenant model
Realm::id();                         // Get active tenant ID
Realm::key();                        // Get active tenant key
Realm::check();                      // True if tenant set & tenancy enabled
Realm::isTenancyDisabled();          // True inside withoutTenancy()
Realm::run('acme', fn() => ...);     // Execute in a tenant's context
Realm::withoutTenancy(fn() => ...);  // Disable all scoping
Realm::forget();                     // Clear active tenant (keep tenancy state)

// FACADE — secrets
Realm::setSecret('acme', 'key', 'value');
Realm::getSecret('acme', 'key');
Realm::deleteSecret('acme', 'key');

// MODEL — data operations (Tenant)
Tenant::create(['key' => 'acme', 'name' => 'Acme Corp']);
Tenant::where('active', true)->get();
```

### Strict Mode (Default: ON)

When no tenant context is active:
- **Model queries** return empty results (`WHERE 0 = 1`) and log a warning
- **Model creates** throw `NoActiveRealmException`
- Cache and storage fall back to global (unprefixed) space

### Escape Hatches

```php
// Bypass query scope for ONE query (cache/storage still scoped)
Project::withoutRealm()->get();

// Bypass ALL scoping (queries + cache + storage)
Realm::withoutTenancy(fn() => Project::all());

// Query a specific tenant
$acme = Tenant::where('key', 'acme')->first();
Project::forRealm($acme)->get();
```

### Shared vs Tenant Models

Not every model needs tenant scoping:

```php
// TENANT MODEL — scoped, has realm_id
class Project extends Model { use BelongsToRealm; }

// SHARED MODEL — no trait, no realm_id, available to all tenants
class Category extends Model { /* no BelongsToRealm */ }

// Relationships work across the boundary:
// $project->category works (Category is not scoped)
```

## Cache / Queue / Storage Isolation

### Cache Key Prefixing

When a tenant is active, all cache keys are automatically prefixed with `realm:{tenant_key}:`. No code changes needed.

```php
// Inside tenant 'acme' context:
Cache::put('settings', $data);  // Actually stores as realm:acme:settings
Cache::get('settings');          // Reads from realm:acme:settings

// Inside withoutTenancy — reads/writes global keys
Realm::withoutTenancy(fn() => Cache::get('settings'));  // Reads 'settings' (global)
```

### Queue Context Propagation

Add the `RealmAwareJob` trait to your jobs. It captures the tenant context at dispatch time and restores it when the job is processed.

```php
use Realm\Traits\RealmAwareJob;
use Realm\Integrations\RealmQueueMiddleware;

class GenerateReport implements ShouldQueue
{
    use RealmAwareJob;

    public function middleware(): array
    {
        return $this->realmMiddleware();
    }

    public function handle(): void
    {
        // Realm context is automatically restored here
    }
}
```

- In strict mode, dispatching without context throws `NoActiveRealmException`
- If the tenant is deleted between dispatch and processing, the job is failed
- If the tenant is deactivated, the job is released with a configurable delay

### Storage Path Prefixing

All storage paths are automatically prefixed with `tenants/{tenant_key}/`:

```php
// Inside tenant 'acme' context:
Storage::put('logo.png', $file);  // Stores at tenants/acme/logo.png
Storage::get('logo.png');          // Reads from tenants/acme/logo.png
```

## Encrypted Secrets

Store sensitive per-tenant configuration (API keys, tokens) encrypted at rest:

```php
// On the Tenant model
$tenant->setSecret('stripe_key', 'sk_live_...');
$tenant->getSecret('stripe_key');   // Returns decrypted value
$tenant->deleteSecret('stripe_key');

// Via the Facade
Realm::setSecret('acme', 'stripe_key', 'sk_live_...');
Realm::getSecret('acme', 'stripe_key');
```

Secrets are:
- Encrypted via Laravel's `Crypt` facade
- Hidden from `toArray()` / `toJson()` (never accidentally serialized)
- Cascade-deleted when the tenant is deleted

## Tenant User Relationships

The `tenant_users` pivot table links users to tenants with roles:

```php
// Attach a user
$tenant->users()->attach($user, ['role' => 'owner']);

// Query users
$tenant->users;                              // All users for this tenant
$tenant->users()->wherePivot('role', 'owner')->first();
```

## Per-Tenant Config Overrides

Store non-sensitive config overrides in the tenant's `data` JSON column:

```php
$tenant = Tenant::create([
    'key' => 'acme',
    'name' => 'Acme Corp',
    'data' => [
        'config' => [
            'app.name' => 'Acme Dashboard',
            'mail.from.name' => 'Acme Support',
        ],
    ],
]);

// Inside Realm::run() or middleware, config() returns tenant-specific values
Realm::run($tenant, function () {
    config('app.name'); // 'Acme Dashboard'
});
// After run(), original config values are restored
```

> API keys and secrets should use `setSecret()`, not config overrides.

## Resolvers

Realm resolves the tenant from the incoming request using a pipeline of resolvers. The first match wins.

| Resolver | Config | Example |
|----------|--------|---------|
| `SubdomainResolver` | `realm.subdomain.domain` | `acme.myapp.com` |
| `HeaderResolver` | `realm.header.name` | `X-Realm: acme` |
| `PathResolver` | `realm.path.segment` | `myapp.com/acme/dashboard` |
| `DomainResolver` | — | `app.acmecorp.com` (full custom domain) |
| `QueryResolver` | `realm.query.parameter` | `?realm=acme` |
| `SessionResolver` | `realm.session.key` | Session-based switching |
| `AuthResolver` | — | Resolves from authenticated user's tenant |

Configure active resolvers in `config/realm.php`:

```php
'resolvers' => [
    SubdomainResolver::class,
    HeaderResolver::class,
    // Add more as needed
],
```

## Commands

```bash
php artisan realm:create acme "Acme Corp"              # Create a tenant
php artisan realm:delete acme                           # Delete (with confirmation)
php artisan realm:delete acme --force                   # Delete without confirmation
php artisan realm:list                                  # List all tenants
php artisan realm:check                                 # Diagnostic health check
php artisan realm:check --realm=acme                    # Inspect specific tenant
php artisan realm:test                                  # Verify isolation works
php artisan realm:exec acme "cache:clear"               # Run command as tenant
php artisan realm:run-for-each "cache:clear"            # Run command for all tenants
php artisan realm:run-for-each "reports:generate" --only=acme --only=globex
```

## Testing

```php
use Realm\Testing\RealmTestHelpers;

class ProjectTest extends TestCase
{
    use RealmTestHelpers;

    public function test_projects_are_isolated(): void
    {
        $acme = $this->createRealm('acme');
        $globex = $this->createRealm('globex');

        $this->actingAsRealm($acme, fn() => Project::create(['name' => 'Acme Project']));
        $this->actingAsRealm($globex, fn() => Project::create(['name' => 'Globex Project']));

        $this->assertRealmCount($acme, Project::class, 1);
        $this->assertRealmMissing($acme, Project::class, ['name' => 'Globex Project']);
    }
}
```

## Blueprint Macro

```php
$table->realm();                   // Default: restrictOnDelete (safe)
$table->realm(cascade: true);      // Opt-in: cascadeOnDelete
```

`restrictOnDelete` is the default — deleting a tenant fails with a foreign key error, forcing you to handle data cleanup explicitly.

## Configuration

After installation, the config lives at `config/realm.php`:

- `strategy` — `'column'` (only option currently)
- `resolvers` — array of resolver classes
- `strict` — `true` (fail-closed on missing context)
- `cache.prefix` — `true` (auto-prefix cache keys per tenant)
- `queue.context` — `true` (propagate tenant context to queued jobs)
- `storage.prefix_path` — `true` (auto-prefix storage paths per tenant)
- `user_model` — the user model class for tenant-user relationships
- `on_fail` — `'abort'` (abort/redirect/exception on resolution failure)

## Why not stancl/tenancy?

Use stancl if you need database-per-tenant today — it has years of battle-testing we don't. Realm is for the 80% of SaaS apps that only need column-based row isolation and want it with one trait, one macro, and fail-closed defaults out of the box.

## Roadmap

- **v0.1** — Column strategy, subdomain + header resolution, strict mode, test helpers
- **v0.2** (current) — Cache/queue/storage isolation, encrypted secrets, tenant users, 5 new resolvers, per-tenant config overrides, `realm:delete`/`realm:exec`/`realm:run-for-each` commands
- **v1.0** — Database-per-tenant and schema-per-tenant strategies

## License

MIT. See [LICENSE](LICENSE).
