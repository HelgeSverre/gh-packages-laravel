# Laravel Foundation

`yezzmedia/laravel-foundation` is the shared platform core for Yezz Media package-based Laravel applications.

It provides the stable runtime that downstream platform packages build on: package registration, feature and permission registries, install and doctor orchestration, cache and rate-limit key factories, platform console commands, and reusable Testbench support for consumer packages.

## Version

Current release: `0.1.0`

## Requirements

- PHP `^8.3`
- Laravel `^13.0` support and console components
- `spatie/laravel-package-tools ^1.93`

## Installation

Install the package in the consuming Laravel application:

```bash
composer require yezzmedia/laravel-foundation
```

The service provider is auto-discovered.

## Configuration

Publish the package config when you need to override defaults:

```bash
php artisan vendor:publish --provider="YezzMedia\Foundation\FoundationServiceProvider" --tag="config"
```

Default configuration:

```php
return [
    'registry' => [
        'seal_after_boot' => true,
    ],

    'rate_limits' => [
        'separator' => ':',
    ],

    'cache' => [
        'prefix' => 'website',
        'separator' => ':',
    ],
];
```

## What The Package Provides

### Foundation runtime bootstrapping

`FoundationServiceProvider` registers the shared platform services that downstream packages consume.

It binds:

- `PackageRegistry`
- `FeatureRegistry`
- `PermissionRegistry`
- `OpsModuleRegistry`
- `SecurityRequestRegistry`
- `SecurityRequirementRegistry`
- `PackageManifestLoader`
- `PlatformPackageRegistrar`
- `InstallManager`
- `DoctorManager`
- `CacheKeyFactory`
- `RateLimitKeyFactory`
- `IntegrationManager`
- `ResolvesSiteContext`

After boot, foundation seals the registries by default so the normalized package state stays read-only during ordinary runtime flows.

### Package registration

Downstream packages integrate with foundation by registering a descriptor that implements `PlatformPackage`.

Foundation normalizes that descriptor through `PlatformPackageRegistrar` into the shared registries.

Supported capability contracts include:

- `RegistersFeatures`
- `DefinesPermissions`
- `DefinesAuditEvents`
- `ProvidesDoctorChecks`
- `ProvidesOpsModules`
- `DefinesInstallSteps`
- `DefinesRateLimiters`
- `DefinesCacheProfiles`
- `DefinesSecurityRequests`
- `DefinesSecurityRequirements`

Example registration pattern:

```php
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use YezzMedia\Foundation\Support\PlatformPackageRegistrar;

final class ExampleServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package->name('example-package');
    }

    public function packageBooted(): void
    {
        app(PlatformPackageRegistrar::class)->register(new ExamplePlatformPackage);
    }
}
```

### Registries and normalized state

Foundation provides central registries for the normalized platform surface:

- packages
- features
- permissions
- ops modules
- security requests
- security requirements

These registries are what install, doctor, package listing, and feature listing work against.

### HTTP middleware declarations and bridge

Foundation also provides a shared declaration surface for package-owned HTTP middleware wiring.

The relevant capability and runtime pieces are:

- `DefinesHttpMiddleware`
- `HttpMiddlewareDefinition`
- `HttpMiddlewareRegistry`
- `HttpMiddlewareResolver`
- `FoundationHttpMiddlewareBridge`

This lets downstream packages declare stable middleware definitions instead of patching the host bootstrap directly from package code.

Supported declaration kinds include:

- `alias`
- `web_prepend`
- `web_append`

Foundation resolves those declarations deterministically and applies them through the bridge at host boot time.

The foundation package itself currently ships:

- `ConfigureHttpMiddlewareBridgeInstallStep` to patch the standard Laravel 13 middleware bootstrap block when the host explicitly requests installation work
- `FoundationHttpMiddlewareBridgeConfiguredCheck` to verify that the host bootstrap actually applies the bridge during diagnostics

Typical host flow:

```bash
php artisan website:install --only=yezzmedia/laravel-foundation
php artisan website:doctor
```

This keeps package-owned middleware aliases and web-stack injections explicit, auditable, and consistent across consumer packages.

### Security governance declarations

Foundation now provides the shared declaration surface that downstream packages use to describe security intent without taking over runtime enforcement.

The new declaration contracts are:

- `DefinesSecurityRequests`
- `DefinesSecurityRequirements`

The new DTOs are:

- `SecurityRequestDefinition`
- `SecurityRequirementDefinition`

The new registries are:

- `SecurityRequestRegistry`
- `SecurityRequirementRegistry`

`PlatformPackageRegistrar` validates and registers both declaration types. The current normalized vocabulary supports:

- domains: `auth`, `identity`, `session`, `transport`, `runtime`, `secrets`
- levels: `required`, `recommended`, `optional`, `disallowed`
- enforcement modes: `observe_only`, `package_owned`, `centrally_enforced`

Security request definitions also support payload-shape validation, preview-field allowlists, and masked-field declarations so downstream governance tooling can stay explicit about what may be shown to operators.

Foundation's role remains declarative:

- feature packages declare security requests and requirements
- foundation validates and registers those declarations centrally
- downstream packages such as `yezzmedia/laravel-ops-security` evaluate and verify runtime reality

Foundation does not compute effective security policy and does not enforce authentication or settings behavior itself.

### Install and doctor workflows

`InstallManager` orchestrates declared install steps across registered platform packages.

- runs package install steps in deterministic order
- supports filtering with explicit package names
- carries one explicit `InstallContext` through the run so steps can react to operator intent
- supports explicit migration permission through `--migrate`
- supports explicit published-resource refresh through `--refresh-publish`
- supports explicit host bootstrap patching for the foundation HTTP middleware bridge
- stops on the first blocking failure
- reports executed, failed, and skipped steps through `InstallResult`

Migration note for consumer packages:

- custom install steps must now accept `InstallContext` in both `shouldRun()` and `handle()`
- packages that still implement the older no-context install-step signatures must update those method signatures before adopting the current foundation runtime

Foundation also registers itself into the package registry with priority `0`, so package inventory and downstream diagnostics always include the platform core.

`DoctorManager` aggregates declared doctor checks across registered platform packages.

- validates check metadata and result shape
- supports normalized statuses:
  - `passed`
  - `warning`
  - `failed`
  - `skipped`
- separates blocking failures from non-blocking output

### Console commands

Foundation exposes these platform commands:

```bash
php artisan website:install
php artisan website:install --only=yezzmedia/laravel-access
php artisan website:install --migrate
php artisan website:install --refresh-publish
php artisan website:doctor
php artisan website:packages
php artisan website:features
```

- `website:install` runs declared install steps
- `website:install --migrate` explicitly allows install steps to run required migrations
- `website:install --refresh-publish` explicitly allows install steps to refresh already published resources
- `website:doctor` reports declared doctor checks
- `website:packages` lists registered platform packages
- `website:features` lists registered platform features

Foundation currently declares one install step and one doctor check of its own:

- install step: `ConfigureHttpMiddlewareBridgeInstallStep`
- doctor check: `FoundationHttpMiddlewareBridgeConfiguredCheck`

### Audit persistence install flow

Foundation now supports explicit audit persistence setup inside `website:install` instead of using a separate top-level command.

Supported command shape:

```bash
php artisan website:install --configure-audit
php artisan website:install --configure-audit --audit-package=all
php artisan website:install --configure-audit --audit-package=yezzmedia/laravel-access
```

Behavior:

- `--configure-audit` starts an explicit audit-persistence setup flow
- `--audit-package=*` narrows the flow to selected installed packages
- `all` enables audit setup for every installed audit-capable package
- interactive package selection runs when `--configure-audit` is passed without `--audit-package`
- `--configure-access-audit` remains available as a deprecated access-only alias
- audit setup runs only package-owned audit install steps and does not execute ordinary install, migration, or seeding steps

### Key factories

Foundation ships reusable key factories for downstream packages:

- `CacheKeyFactory`
- `RateLimitKeyFactory`

These keep cross-package technical identifiers consistent.

### Events

Foundation emits platform lifecycle events such as:

- `PackageRegistered`
- `FeatureRegistered`
- `PermissionDefined`
- `OpsModuleDefined`
- `WebsiteInstalled`
- `DoctorChecksCompleted`

### Testing support

Foundation exposes a reusable Testbench base and helper concerns for consumer package tests:

- `YezzMedia\Foundation\Testing\FoundationTestCase`
- `YezzMedia\Foundation\Testing\Concerns\InteractsWithPackageRegistry`
- `YezzMedia\Foundation\Testing\Concerns\InteractsWithFeatureRegistry`
- `YezzMedia\Foundation\Testing\Concerns\InteractsWithDoctorManager`
- `YezzMedia\Foundation\Testing\Concerns\InteractsWithInstallManager`

These helpers keep consumer package tests on the real foundation registration path while reducing repetitive setup.

## Consumer package usage

Foundation is intended to be consumed by platform packages, not by feature code that wants to bypass package registration.

Use it when building packages that need to:

- declare stable permissions
- register features
- expose install steps or doctor checks
- participate in shared platform ops workflows
- test package registration through a real Testbench baseline

## Boost skills

The package ships package-native Boost skills for both sides of foundation work:

- `resources/boost/skills/foundation-package-development/`
- `resources/boost/skills/foundation-core-development/`

These document the approved package-consumer and core-runtime workflows for the foundation architecture.

## Development

Available package scripts:

```bash
composer test
composer analyse
composer format
```

## License

MIT
