# Laravel Access

`yezzmedia/laravel-access` is the persistent authorization runtime for the Yezz Media Laravel platform.

It turns foundation-declared permission names into persisted `spatie/laravel-permission` records, manages explicit role composition and user-role assignment, exposes a super-admin gate bypass, and provides audit, diagnostics, setup commands, and reusable package testing helpers for consumer packages.

## Version

Current release: `0.1.0`

## Requirements

- PHP `^8.4`
- Laravel `^13.0` components
- `spatie/laravel-permission ^7.0`
- `yezzmedia/laravel-foundation ^0.1`

Optional:

- `spatie/laravel-activitylog ^5.0` for persisted authorization audit records

## Installation

Install the package in the consuming Laravel application:

```bash
composer require yezzmedia/laravel-access
```

For persisted audit records through Activitylog:

```bash
composer require spatie/laravel-activitylog
```

The package service provider is auto-discovered.

## Configuration

Publish the package config when you need to override defaults:

```bash
php artisan vendor:publish --provider="YezzMedia\Access\AccessServiceProvider" --tag="config"
```

Default configuration:

```php
return [
    'audit' => [
        'driver' => null,
    ],

    'super_admin' => [
        'enabled' => false,
        'role_name' => null,
    ],

    'cache' => [
        'permission_map' => [
            'enabled' => false,
        ],
    ],

    'roles' => [
        'apply_default_role_hints' => false,
    ],
];
```

## What The Package Provides

### Foundation registration surface

`AccessPlatformPackage` declares the stable access surface through foundation.

Declared features:

- `access.permissions`
- `access.roles`
- `access.assignments`
- `access.super_admin`
- `access.audit`

Declared audit events:

- `access.permissions.synchronized`
- `access.roles.synchronized`
- `access.user_role.assigned`
- `access.user_role.removed`

Declared install steps:

- `PublishPermissionConfigInstallStep`
- `ConfigureAccessAuditInstallStep`
- `PublishPermissionMigrationsInstallStep`
- `EnsurePermissionStoreReadyInstallStep`
- `SyncPermissionsInstallStep`
- `SeedRolesFromPermissionHintsInstallStep`

Declared doctor checks:

- `AccessAuditConfiguredCheck`
- `PermissionsSynchronizedCheck`
- `SuperAdminConfiguredCheck`

Declared security governance entries:

- request: `access.request.identity.privileged-mfa`
- requirement: `access.identity.privileged-mfa`

Declared ops modules:

- none by design in the current V1 surface

Declared permissions:

- none directly; consumer packages declare stable permission names through foundation and access persists them into the runtime store

### Permission synchronization

`PermissionSyncService` synchronizes declared foundation permission definitions into the persistent permission store.

- synchronizes all registered package permissions
- can synchronize one package only
- ignores `defaultRoleHints` during ordinary permission sync
- dispatches `PermissionsSynchronized`
- invalidates permission-map cache keys after successful sync

```php
use YezzMedia\Access\Support\PermissionSyncService;

$result = app(PermissionSyncService::class)->sync();
```

### Role synchronization

`RoleManager` composes persisted roles from explicit `RoleDefinition` input.

- synchronizes one role or many roles deterministically
- fails fast when referenced permissions are missing
- can seed roles from `defaultRoleHints` only when explicit hint seeding is enabled
- dispatches `RolesSynchronized`

```php
use YezzMedia\Access\Data\RoleDefinition;
use YezzMedia\Access\Support\RoleManager;

app(RoleManager::class)->syncRole(new RoleDefinition(
    name: 'content_editor',
    label: 'Content Editor',
    description: 'Can publish and archive content.',
    permissionNames: [
        'content.pages.publish',
        'content.pages.archive',
    ],
));
```

### User-role assignment

`UserRoleManager` assigns or removes one existing persisted role for one user.

- fails fast when the referenced role does not exist
- emits events only on real state changes
- treats repeated assignment/removal as a no-op
- blocks removal of the configured super-admin role when that would reduce the qualified operator count below the enforced minimum
- invalidates global and user-specific permission-map cache keys

```php
use YezzMedia\Access\Support\UserRoleManager;

app(UserRoleManager::class)->assignRole($user, 'content_editor', $actor);
app(UserRoleManager::class)->removeRole($user, 'content_editor', $actor);
```

### Super-admin bootstrap

`SuperAdminGateBootstrapper` registers a central `Gate::before()` bypass for one configured role.

- disabled by default
- requires `access.super_admin.role_name` when enabled
- returns `true` for users with the configured role and `null` otherwise

When the configured super-admin path is active, the package also emits governance visibility through the optional ops-security broker integration described below.

### Security governance visibility

`AccessPlatformPackage` now declares the package security-governance surface through foundation:

- security request: `access.request.identity.privileged-mfa`
- security requirement: `access.identity.privileged-mfa`

The package uses `AccessSecurityVisibilityReporter` as an optional runtime bridge to `yezzmedia/laravel-ops-security`.

Current behavior:

- super-admin bootstrap can submit privileged-account MFA visibility requests
- super-admin gate usage can record runtime evidence for privileged account access
- the super-admin doctor check can emit the same governance signal during diagnostics
- the integration degrades silently when the `YezzMedia\OpsSecurity\Contracts\SecurityRequestBroker` contract is not installed or not bound

The current request preview schema includes:

- `role`
- `channel`
- `ability`
- `actor_reference`

`actor_reference` is declared as masked preview data. This keeps operator visibility explicit without turning the access package into a raw identity export surface.

## Permission lookup and cache invalidation

`PermissionMap` exposes a narrow read-only lookup surface over persisted permissions.

- `all(): list<string>`
- `forRole(string $role): list<string>`
- `has(string $permission): bool`

When `access.cache.permission_map.enabled` is enabled, `PermissionMap` caches global and role-specific lookups and `PermissionCacheManager` owns invalidation keys for:

- all permissions
- one role
- one user

## Audit integration

The package emits these access audit events through foundation metadata and runtime listeners:

- `access.permissions.synchronized`
- `access.roles.synchronized`
- `access.user_role.assigned`
- `access.user_role.removed`

Those event keys are the same keys declared by `AccessPlatformPackage`, so package metadata and runtime output stay aligned.

Audit writing is controlled through `access.audit.driver`:

- `null`: use `NullAuthorizationAuditWriter`
- `activitylog`: use `ActivityLogAuthorizationAuditWriter`

To enable persisted audit records:

```php
return [
    'audit' => [
        'driver' => 'activitylog',
    ],
];
```

If `activitylog` is configured but `spatie/laravel-activitylog` is not installed, the package fails explicitly during binding.

## Doctor checks

The package registers three doctor checks through foundation:

- `audit_configured`
  - `skipped` when the host ops audit provider is not configured in the current environment
  - `passed` when `access.audit.driver` is configured for `activitylog`
  - `warning` when access audit persistence is intentionally disabled
  - `failed` when an unsupported audit driver is configured
- `permissions_synchronized`
  - `passed` when declared permissions exist in persistence
  - `warning` when stale extra permissions remain persisted
  - `failed` when declared permissions are missing or persistence cannot be read
  - `skipped` when no permission definitions are registered yet
- `super_admin_configured`
  - `passed` when super-admin bootstrap is enabled and valid
  - `failed` when enabled but invalid
  - `skipped` when disabled

## Setup commands

The package exposes thin operational commands:

```bash
php artisan website:sync-permissions
php artisan website:seed-roles
```

- `website:sync-permissions` runs the real permission sync path
- `website:seed-roles` seeds roles from `defaultRoleHints` only when `access.roles.apply_default_role_hints=true`

## Foundation install workflow

Access integrates with foundation through `DefinesInstallSteps` so the host can prepare the permission store through the central installer instead of package-specific setup commands.

Supported install sequence:

- publish permission config when missing
- publish Spatie permission migrations when missing or when new published migrations are required
- ensure the permission store is ready before synchronization
- synchronize declared permissions through the existing runtime service

Use the central installer like this:

```bash
php artisan website:install --only=yezzmedia/laravel-access
php artisan website:install --only=yezzmedia/laravel-access --migrate
php artisan website:install --only=yezzmedia/laravel-access --refresh-publish
php artisan website:install --only=yezzmedia/laravel-access --configure-access-audit
php artisan website:install --configure-audit --audit-package=yezzmedia/laravel-access
php artisan website:install --configure-audit --audit-package=all
```

Important behavior:

- `--migrate` is required when the permission store is missing or when published access migrations are still pending
- `--refresh-publish` refreshes already published access resources intentionally instead of doing so during ordinary runs
- `--configure-audit --audit-package=yezzmedia/laravel-access` runs only the access audit setup step and enables `access.audit.driver=activitylog`
- `--configure-access-audit` remains available as a deprecated access-only shortcut for the same audit setup
- permission synchronization is blocked until pending published access migrations are resolved

`PermissionStoreSetup` owns these readiness checks and host-side setup actions for the runtime.

### Audit installer compatibility

Foundation now exposes a generic audit installer while keeping access compatible with the older shortcut.

Supported audit commands:

```bash
php artisan website:install --configure-audit --audit-package=yezzmedia/laravel-access
php artisan website:install --configure-audit --audit-package=all
```

Compatibility rule:

- `--configure-access-audit` remains temporarily available as a deprecated alias for access only

## Consumer package integration

Consumer packages should declare permissions through the foundation `DefinesPermissions` capability instead of writing directly into access internals.

Access reads those declarations through foundation registries and turns them into persistent runtime state.

Packages that want central security review should also declare security requirements and requests through foundation, then let `yezzmedia/laravel-ops-security` aggregate and verify them. Access itself uses that model for privileged-account MFA visibility rather than inventing a package-local governance surface.

## Testing support

The package exposes reusable testing helpers through package autoload:

- `YezzMedia\Access\Tests\AccessTestCase`
- `YezzMedia\Access\Tests\Concerns\InteractsWithPermissionSync`
- `YezzMedia\Access\Tests\Concerns\InteractsWithRoles`

These helpers keep tests on the real runtime path while reducing repetitive setup.

Example:

```php
use Tests\TestCase;
use YezzMedia\Foundation\Data\PermissionDefinition;

it('syncs declared permissions', function (): void {
    $this->registerPermissionDefinitions('yezzmedia/laravel-content', [
        new PermissionDefinition('content.pages.publish', 'yezzmedia/laravel-content', 'Publish pages'),
    ]);

    $this->syncPermissions();

    $this->assertSyncedPermissions(['content.pages.publish']);
});
```

## Boost skill

The package ships a package-native Boost skill for access work:

- `resources/boost/skills/access-package-development/`

It documents the supported access functions, boundaries, operational workflows, and testing patterns for this package.

## Development

Available package scripts:

```bash
composer test
composer analyse
composer format
```

## License

MIT
