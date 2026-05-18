[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Tenancy is a composable multi-tenancy package for Laravel with explicit
context boundaries, pluggable tenant tasks, and landlord support.

## Requirements

> **Requires [PHP 8.5+](https://php.net/releases/) and Laravel 10+**

## Installation

```bash
composer require cline/tenancy
```

Publish config and migration stubs:

```bash
php artisan vendor:publish --tag=tenancy-config
php artisan vendor:publish --tag=tenancy-migrations
```

Run migrations:

```bash
php artisan migrate
```

## Quick Start

```php
use Cline\Tenancy\Facades\Tenancy;

Tenancy::runAsTenant('acme', function (): void {
    // tenant-scoped work...
});
```

## Core Concepts

- `Tenant` context: current tenant for request/job/command execution.
- `Landlord` context: top-level business division/owner for many tenants.
- `TaskInterface` pipeline: classes run on tenant switch (`makeCurrent/forgetCurrent`).

## Public API

```php
Tenancy::currentTenant();              // ?TenantContext
Tenancy::currentLandlord();      // ?LandlordContext
Tenancy::tenantId();             // int|string|null
Tenancy::landlordId();           // int|string|null
Tenancy::tenant('acme');         // ?TenantContext
Tenancy::landlord('division-a'); // ?LandlordContext
Tenancy::runAsTenant('acme', fn () => ...);
Tenancy::runAsLandlord('division-a', fn () => ...);
Tenancy::runAsSystem(fn () => ...);
tenant_action(fn () => ..., 'acme');      // namespaced helper
landlord_action(fn () => ..., 'division-a'); // namespaced helper
Tenancy::forgetCurrentTenant();
Tenancy::forgetCurrentLandlord();
Tenancy::resolveTenant(request());
Tenancy::resolveLandlord(request());
Tenancy::tenantResolver();
Tenancy::landlordResolver();
Tenancy::tenantConnection();           // resolved tenant DB connection
Tenancy::landlordConnection();         // resolved landlord DB connection
Tenancy::tenantIsolation();      // IsolationMode enum
Tenancy::landlordIsolation();    // IsolationMode enum
Tenancy::tenantScopedQueue('default'); // tenant:123:default
Tenancy::landlordScopedQueue('default'); // landlord:123:default
Tenancy::tenantPayload();              // queue-safe tenant payload
Tenancy::fromTenantPayload($payload);  // hydrate tenant context from payload
Tenancy::landlordPayload();            // queue-safe landlord payload
Tenancy::fromLandlordPayload($payload); // hydrate landlord context from payload
Tenancy::tenancyPayload();              // queue-safe payload
Tenancy::fromTenancyPayload($payload);  // hydrate context from payload
```

## Automatic Tenant Resolution

Configure resolver order in `config/tenancy.php`:

```php
'resolver' => [
    'resolvers' => [
        DomainTenantResolver::class,
        SubdomainTenantResolver::class,
        PathTenantResolver::class,
        AuthenticatedTenantResolver::class,
        SessionTenantResolver::class,
    ],
],
```

Use middleware:

```php
Route::tenant()->group(function (): void {
    Route::get('/dashboard', DashboardController::class);
});

Route::landlord()->group(function (): void {
    Route::get('/division-dashboard', DivisionDashboardController::class);
});
```

Use `tenant.optional` when tenant context is allowed but not required.
Use `tenant` when a request must resolve a tenant; unresolved requests
abort with `tenancy.http.abort_status` (default `404`).
Use `landlord.optional` and `landlord` for landlord context with the same
behavior.

Default resolver chain now includes authenticated-user and session-based
resolution after domain/subdomain/path resolvers. Header resolvers are
available but not enabled by default to reduce spoofing risk.
Domain lookups are canonicalized (case-insensitive, trailing dot trimmed).

## Tasks (Environment Preparation)

Tasks execute whenever tenant context switches.

```php
namespace App\Tenancy;

use Cline\Tenancy\Contracts\TaskInterface;
use Cline\Tenancy\TenantContext;

final class PrefixStorageTask implements TaskInterface
{
    public function makeCurrent(TenantContext $tenantContext): void
    {
        // prepare app env for this tenant
    }

    public function forgetCurrent(TenantContext $tenantContext): void
    {
        // restore app env
    }
}
```

Register tasks:

```php
'tasks' => [
    Cline\Tenancy\Tasks\SwitchTenantDatabaseTask::class,
    Cline\Tenancy\Tasks\PrefixCacheTask::class,
    App\Tenancy\PrefixStorageTask::class,
],
```

Built-in `PrefixCacheTask` uses:

```php
'cache' => [
    'prefix' => 'tenant',
    'delimiter' => ':',
],
```

## Queues and Artisan Commands

- Queue payload propagation is enabled by default (`tenancy.queue.propagate`).
- Worker job processing restores tenant (and landlord, when present) from
  payload.
- Worker job processing clears any existing context before hydrating payload.
- Queue names can be partitioned via `Tenancy::tenantScopedQueue('emails')`
  and `Tenancy::landlordScopedQueue('emails')`.
- `Tenancy::runAsTenant(...)` and `Tenancy::runAsLandlord(...)` fail fast by default
  when the requested context cannot be resolved.
- Tenant-aware commands:
  - `tenancy:migrate --tenant=<id|slug>` / `--all`
  - `tenancy:seed --tenant=<id|slug>` / `--all`
  - `tenancy:run <tenant> "<artisan command>"`
- Landlord-aware commands:
  - `tenancy:migrate-landlord --landlord=<id|slug>` / `--all`
  - `tenancy:seed-landlord --landlord=<id|slug>` / `--all`
  - `tenancy:run-landlord <landlord> "<artisan command>"`
- With `context.require_resolved=false`, unresolved `runAsTenant` and
  `runAsLandlord` execute in explicit system context to avoid stale state.
- `runAsSystem` always executes with both tenant and landlord context cleared.

## Landlord Support

Tenants can belong to a landlord (e.g., your 4 divisions):

```php
Tenancy::runAsLandlord('division-a', function (): void {
    // landlord-scoped orchestration
});

Tenancy::runAsTenant('tenant-acme', function (): void {
    // tenant-scoped logic
});
```

Migration stub includes both `landlords` and `tenants` tables with
`tenants.landlord_id` foreign key.

## Events

The package dispatches lifecycle events:

- `LandlordResolving`
- `LandlordResolved`
- `LandlordEnded`
- `TenantResolving`
- `TenantResolved`
- `TenantSwitched`
- `TenancyEnded`
- `LandlordSwitched`

## Helpers

```php
use function Cline\Tenancy\landlord;
use function Cline\Tenancy\landlord_action;
use function Cline\Tenancy\landlord_context;
use function Cline\Tenancy\landlord_route;
use function Cline\Tenancy\landlord_url;
use function Cline\Tenancy\tenancy;
use function Cline\Tenancy\tenancy_scheduler;
use function Cline\Tenancy\tenant;
use function Cline\Tenancy\tenant_action;
use function Cline\Tenancy\tenant_route;
use function Cline\Tenancy\tenant_url;

$url = tenant_url('acme', '/billing');
$route = tenant_route('tenant.dashboard', tenant: 'acme');
$divisionUrl = landlord_url('division-a', '/billing');
$divisionRoute = landlord_route('division.dashboard', landlord: 'division-a');
$landlord = landlord_context();
$tenant = tenant('acme');
$division = landlord('division-a');
$tenantResult = tenant_action(fn () => 'ok', 'acme');
$landlordResult = landlord_action(fn () => 'ok', 'division-a');
$tenancy = tenancy();
$scheduler = tenancy_scheduler();
```

## Console Commands

```bash
php artisan tenancy:create acme "Acme Inc" --domain=acme.example.test
php artisan tenancy:create-landlord division-west "Division West" --domain=division-west.example.test
php artisan tenancy:create tenant-west "Tenant West" --landlord=division-west
php artisan tenancy:list
php artisan tenancy:list-landlords
php artisan tenancy:migrate --tenant=acme
php artisan tenancy:seed --tenant=acme
php artisan tenancy:run acme "list"
php artisan tenancy:migrate-landlord --landlord=division-west
php artisan tenancy:seed-landlord --landlord=division-west
php artisan tenancy:run-landlord division-west "list"
php artisan tenancy:test
```

## Full Configuration Reference

All keys below live in `config/tenancy.php`.

| Key                                        | Default                                                     | Env                              | Description                                                                                                                            |
| ------------------------------------------ | ----------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tenant_model`                             | `Cline\Tenancy\Models\Tenant::class`                        | -                                | Tenant Eloquent model class implementing `Cline\Tenancy\Contracts\TenantInterface`.                                                    |
| `landlord_model`                           | `Cline\Tenancy\Models\Landlord::class`                      | -                                | Landlord Eloquent model class implementing `Cline\Tenancy\Contracts\LandlordInterface`.                                                |
| `primary_key_type`                         | `id`                                                        | `TENANCY_PRIMARY_KEY_TYPE`       | Primary key strategy: `id`, `uuid`, or `ulid`.                                                                                         |
| `connection`                               | `null`                                                      | `TENANCY_CONNECTION`             | Optional DB connection used by tenancy package migration stub.                                                                         |
| `table_names.landlords`                    | `landlords`                                                 | `TENANCY_LANDLORDS_TABLE`        | Landlords table name used by migration stub.                                                                                           |
| `table_names.landlord_domains`             | `landlord_domains`                                          | `TENANCY_LANDLORD_DOMAINS_TABLE` | Normalized landlord domain lookup table used by repository/domain resolver.                                                            |
| `table_names.tenants`                      | `tenants`                                                   | `TENANCY_TENANTS_TABLE`          | Tenants table name used by migration stub.                                                                                             |
| `table_names.tenant_domains`               | `tenant_domains`                                            | `TENANCY_TENANT_DOMAINS_TABLE`   | Normalized domain lookup table used by repository/domain resolver.                                                                     |
| `tasks`                                    | `[SwitchTenantDatabaseTask::class, PrefixCacheTask::class]` | -                                | Tasks run on tenant context switch.                                                                                                    |
| `config_mapping.mappings`                  | `[]`                                                        | -                                | Key/value map applied by `MapTenantConfigTask` when tenant context is switched.                                                        |
| `isolation`                                | `shared_database`                                           | -                                | Tenant isolation mode enum value (`shared_database`, `separate_schema`, `separate_database`) returned by `Tenancy::tenantIsolation()`. |
| `database.connection`                      | `null`                                                      | -                                | Fallback tenant DB connection returned by `Tenancy::tenantConnection()`.                                                               |
| `landlord.isolation`                       | `shared_database`                                           | -                                | Isolation mode for landlord context returned by `Tenancy::landlordIsolation()`.                                                        |
| `landlord.database.connection`             | `null`                                                      | -                                | Fallback landlord DB connection returned by `Tenancy::landlordConnection()`.                                                           |
| `cache.prefix`                             | `tenant`                                                    | -                                | Prefix base for `PrefixCacheTask`.                                                                                                     |
| `cache.delimiter`                          | `:`                                                         | -                                | Delimiter for generated cache prefixes.                                                                                                |
| `resolver.resolvers`                       | domain/subdomain/path/auth/session chain                    | -                                | Resolver classes in evaluation order.                                                                                                  |
| `resolver.header`                          | `X-Tenant`                                                  | -                                | Header name used by `HeaderTenantResolver`.                                                                                            |
| `resolver.central_domains`                 | `[]`                                                        | -                                | Domains treated as central/non-tenant for resolver logic.                                                                              |
| `resolver.path_segment`                    | `1`                                                         | -                                | Segment index used by `PathTenantResolver`.                                                                                            |
| `resolver.session_key`                     | `tenant`                                                    | -                                | Session key used by `SessionTenantResolver`.                                                                                           |
| `resolver.user_attribute`                  | `null`                                                      | -                                | Optional authenticated-user attribute path used by `AuthenticatedTenantResolver`.                                                      |
| `landlord.resolver.resolvers`              | domain/subdomain/path/auth/session chain                    | -                                | Landlord resolver classes in evaluation order.                                                                                         |
| `landlord.resolver.header`                 | `X-Landlord`                                                | -                                | Header name used by `HeaderLandlordResolver`.                                                                                          |
| `landlord.resolver.central_domains`        | `[]`                                                        | -                                | Domains treated as central/non-landlord for resolver logic.                                                                            |
| `landlord.resolver.path_segment`           | `1`                                                         | -                                | Segment index used by `PathLandlordResolver`.                                                                                          |
| `landlord.resolver.session_key`            | `landlord`                                                  | -                                | Session key used by `SessionLandlordResolver`.                                                                                         |
| `landlord.resolver.user_attribute`         | `null`                                                      | -                                | Optional authenticated-user attribute path used by `AuthenticatedLandlordResolver`.                                                    |
| `landlord.tasks`                           | `[]`                                                        | -                                | Tasks run on landlord context switch.                                                                                                  |
| `landlord.config_mapping.mappings`         | `[]`                                                        | -                                | Key/value map applied by `MapLandlordConfigTask` when landlord context is switched.                                                    |
| `landlord.domain_lookup.use_table`         | `true`                                                      | -                                | Use normalized `landlord_domains` table before JSON fallback in domain lookup; entries are auto-synced on landlord save/delete.        |
| `landlord.domain_lookup.cache.enabled`     | `false`                                                     | -                                | Enables landlord domain lookup cache.                                                                                                  |
| `landlord.domain_lookup.cache.ttl_seconds` | `60`                                                        | -                                | TTL for landlord domain lookup cache entries.                                                                                          |
| `landlord.domain_lookup.cache.store`       | `null`                                                      | -                                | Optional cache store for landlord domain lookup cache.                                                                                 |
| `landlord.domain_lookup.cache.prefix`      | `tenancy:domain:landlord:`                                  | -                                | Cache key prefix for landlord domain lookup cache entries.                                                                             |
| `context.require_resolved`                 | `true`                                                      | -                                | Throw when `runAsTenant`/`runAsLandlord` cannot resolve target context.                                                                |
| `context.enforce_coherence`                | `true`                                                      | -                                | Prevent mismatched tenant/landlord context combinations.                                                                               |
| `landlord.payload_key`                     | `landlord_id`                                               | -                                | Tenant payload key used to derive landlord context.                                                                                    |
| `landlord.sync_with_tenant`                | `true`                                                      | -                                | Automatically sync landlord context when tenant context is set.                                                                        |
| `scoping.require_current_tenant`           | `false`                                                     | -                                | Throw for `HasTenantId` models when querying/creating without active tenant.                                                           |
| `scoping.tenant_foreign_key`               | `tenant_id`                                                 | -                                | FK column used by `HasTenantId` and `BelongsToTenant` traits.                                                                          |
| `domain_lookup.use_table`                  | `true`                                                      | -                                | Use normalized `tenant_domains` table before JSON fallback in domain lookup; entries are auto-synced on tenant save/delete.            |
| `domain_lookup.cache.enabled`              | `false`                                                     | -                                | Enables tenant domain lookup cache.                                                                                                    |
| `domain_lookup.cache.ttl_seconds`          | `60`                                                        | -                                | TTL for tenant domain lookup cache entries.                                                                                            |
| `domain_lookup.cache.store`                | `null`                                                      | -                                | Optional cache store for tenant domain lookup cache.                                                                                   |
| `domain_lookup.cache.prefix`               | `tenancy:domain:tenant:`                                    | -                                | Cache key prefix for tenant domain lookup cache entries.                                                                               |
| `http.abort_status`                        | `404`                                                       | -                                | Status used by required middleware when tenant is not resolved.                                                                        |
| `session.tenant_scope_key`                 | `tenancy.tenant_id`                                         | -                                | Session key used by tenant scope middleware.                                                                                           |
| `session.landlord_scope_key`               | `tenancy.landlord_id`                                       | -                                | Session key used by landlord scope middleware.                                                                                         |
| `session.abort_status`                     | `403`                                                       | -                                | Status used when session scope does not match active context.                                                                          |
| `session.invalidate_on_mismatch`           | `true`                                                      | -                                | Invalidate session when tenant/landlord scope mismatch is detected.                                                                    |
| `routing.tenant_parameter`                 | `tenant`                                                    | -                                | Default tenant route parameter name used by helper APIs.                                                                               |
| `routing.landlord_parameter`               | `landlord`                                                  | -                                | Default landlord route parameter name used by helper APIs.                                                                             |
| `queue.prefix`                             | `tenant`                                                    | -                                | Prefix base for `Tenancy::tenantScopedQueue()`.                                                                                        |
| `queue.delimiter`                          | `:`                                                         | -                                | Delimiter for scoped queue names.                                                                                                      |
| `landlord.queue.prefix`                    | `landlord`                                                  | -                                | Prefix base for `Tenancy::landlordScopedQueue()`.                                                                                      |
| `landlord.queue.delimiter`                 | `:`                                                         | -                                | Delimiter for landlord scoped queue names.                                                                                             |
| `queue.default`                            | `default`                                                   | -                                | Default queue name used in integrations.                                                                                               |
| `queue.propagate`                          | `true`                                                      | -                                | If true, queue payload includes tenancy context and workers restore it.                                                                |
| `scheduler.fail_fast`                      | `true`                                                      | -                                | Stop on first scheduler tenant failure when true.                                                                                      |
| `impersonation.ttl_seconds`                | `300`                                                       | -                                | Default impersonation token TTL.                                                                                                       |
| `impersonation.cache_store`                | `null`                                                      | -                                | Optional cache store used for impersonation token storage.                                                                             |
| `impersonation.cache_prefix`               | `tenancy:impersonation:tenant:`                             | -                                | Cache key prefix for impersonation tokens.                                                                                             |
| `impersonation.query_parameter`            | `tenant_impersonation`                                      | -                                | Query parameter read by impersonation middleware.                                                                                      |

## Migration Customization Recipes

The published migration stub reads tenancy config at runtime.

Switch to UUID keys:

```php
'primary_key_type' => 'uuid',
```

Switch to ULID keys:

```php
'primary_key_type' => 'ulid',
```

Override tenancy table names:

```php
'table_names' => [
    'landlords' => 'business_units',
    'tenants' => 'accounts',
],
```

Override normalized tenant domain table:

```php
'table_names' => [
    'tenant_domains' => 'account_domains',
],
```

Run tenancy tables on a dedicated connection:

```php
'connection' => 'tenant_admin',
```

Environment example:

```dotenv
TENANCY_PRIMARY_KEY_TYPE=uuid
TENANCY_CONNECTION=tenant_admin
TENANCY_LANDLORDS_TABLE=business_units
TENANCY_TENANTS_TABLE=accounts
```

## Custom Tenant Models and Repositories

Custom tenant model:

```php
namespace App\Models;

use Cline\Tenancy\Contracts\TenantInterface;
use Cline\VariableKeys\Database\Concerns\HasVariablePrimaryKey;
use Illuminate\Database\Eloquent\Model;

final class Account extends Model implements TenantInterface
{
    use HasVariablePrimaryKey;

    protected $table = 'accounts';

    protected $guarded = [];

    protected $casts = [
        'domains' => 'array',
    ];

    public function id(): int|string
    {
        /** @var int|string $id */
        $id = $this->getAttribute('id');

        return $id;
    }

    public function slug(): string
    {
        return (string) $this->getAttribute('slug');
    }

    public function name(): string
    {
        return (string) $this->getAttribute('name');
    }

    public function domains(): array
    {
        return (array) $this->getAttribute('domains');
    }

    public function getContextPayload(): array
    {
        return [
            'id' => $this->id(),
            'slug' => $this->slug(),
        ];
    }
}
```

Register custom model classes in config:

```php
'tenant_model' => App\Models\Account::class,
'landlord_model' => App\Models\Division::class,
```

Custom tenant/landlord models must extend `Illuminate\Database\Eloquent\Model`
and implement their tenancy contracts.

When using a custom landlord model, implement
`Cline\Tenancy\Contracts\DomainAwareLandlordInterface` if you want
`landlord_url()` and normalized JSON-domain fallback matching to use model
domains directly.

Custom repository implementation:

```php
namespace App\Tenancy;

use App\Models\Account;
use Cline\Tenancy\Contracts\TenantInterface;
use Cline\Tenancy\Contracts\TenantRepositoryInterface;

final class AccountTenantRepository implements TenantRepositoryInterface
{
    public function findById(int|string $id): ?Tenant
    {
        return Account::query()->find($id);
    }

    public function findBySlug(string $slug): ?Tenant
    {
        return Account::query()->where('slug', $slug)->first();
    }

    public function findByDomain(string $domain): ?Tenant
    {
        return Account::query()->whereJsonContains('domains', $domain)->first();
    }

    public function findByIdentifier(int|string $identifier): ?Tenant
    {
        return is_numeric((string) $identifier)
            ? $this->findById($identifier) ?? $this->findBySlug((string) $identifier)
            : $this->findBySlug((string) $identifier);
    }

    public function all(): iterable
    {
        return Account::query()->cursor();
    }

    public function create(array $attributes): Tenant
    {
        return Account::query()->create($attributes);
    }
}
```

Bind your repository in your app service provider:

```php
use App\Tenancy\AccountTenantRepository;
use Cline\Tenancy\Contracts\TenantRepositoryInterface;

public function register(): void
{
    $this->app->singleton(TenantRepositoryInterface::class, AccountTenantRepository::class);
}
```

If your custom repository should participate in automatic normalized domain
table synchronization, also implement:

- `Cline\Tenancy\Contracts\SynchronizesTenantDomainLookupInterface`
- `Cline\Tenancy\Contracts\SynchronizesLandlordDomainLookupInterface`

## Operations Guide

Queue workers:

- Keep `tenancy.queue.propagate=true` for tenant-aware queued jobs.
- The package restores context on `JobProcessing` and always resets tenant
  and landlord context on `JobProcessed` and `JobExceptionOccurred`.
- Use `Tenancy::runAsTenant(...)` around dispatch when work is outside HTTP flow.
- Use `Tenancy::tenantScopedQueue('default')` to partition queue names by
  tenant, or `Tenancy::landlordScopedQueue('default')` for landlord queues.

Failure and retry behavior:

- Failed jobs are safe for retry because each processing attempt rehydrates
  tenant context from payload before the job runs.
- Context is reset after successful and exception paths, preventing context
  leakage in long-running workers.
- If you disable propagation, you must call `Tenancy::fromTenancyPayload()` or
  `Tenancy::runAsTenant()` manually in workers/jobs.

Artisan operations:

- Prefer `tenancy:migrate --all` and `tenancy:seed --all` for fleet-wide
  operations.
- Use `tenancy:run <tenant> "<command>"` for one-off tenant commands.
- Use `tenancy:test` in CI as a sanity check for resolver/tasks wiring.

## Upgrade Notes

- Follow semantic versioning; treat major upgrades as potentially breaking.
- Review `CHANGELOG.md` for every version bump.
- Re-publish config/migrations when new keys or schema defaults are
  introduced, then diff your local published files before applying.
- Re-run `php artisan tenancy:test` and your queue worker smoke tests after
  every upgrade.

## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information on what has
changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and
[CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please use the [GitHub
security reporting form][link-security] rather than the issue queue.

## Credits

- [Brian Faust][link-maintainer]
- [All Contributors][link-contributors]

## License

The MIT License. Please see [License File](LICENSE.md) for more
information.

[ico-tests]: https://github.com/faustbrian/tenancy/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/tenancy.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/tenancy.svg

[link-tests]: https://github.com/faustbrian/tenancy/actions
[link-packagist]: https://packagist.org/packages/cline/tenancy
[link-downloads]: https://packagist.org/packages/cline/tenancy
[link-security]: https://github.com/faustbrian/tenancy/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
