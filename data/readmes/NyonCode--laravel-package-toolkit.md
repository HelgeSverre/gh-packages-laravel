# 📦 Laravel package toolkit

Laravel Package toolkit is a powerful tool designed to streamline the process of creating and managing packages for
Laravel. It provides a set of intuitive abstractions and helper methods for common package development tasks, enabling
developers to focus on building features rather than boilerplate code.

## Features

- Simple and expressive package configuration
- Automatic handling of routes, migrations, translations, and views
- Support for view components
- Built-in exception handling for package-specific errors
- Comprehensive language support
- Install command with customizable publishing options
- Conditional resource loading based on environment
- Lifecycle hooks for advanced customization
- Middleware registration and management

## Support Laravel

- **Laravel 10.x**
- **Laravel 11.x**
- **Laravel 12.x**
- **Laravel 13.x**

> **Note:** Laravel 9.x support was removed in v2.0 due to its end-of-life security status. If you need Laravel 9
> support, use the `^1.0` release.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Basic Configuration](#basic-configuration)
    - [Advanced Configuration](#advanced-configuration)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Name](#name)
- [Short name](#short-name)
- [Config](#config)
- [Routing](#routing)
- [Middlewares](#middlewares)
- [Migrations](#migrations)
- [Translations](#translations)
- [Commands](#commands)
- [Views](#views)
- [View Components](#view-components)
- [View Component Namespaces](#view-component-namespaces)
- [View Composers](#view-composers)
- [Shared Data](#view-shared-data)
- [Assets](#assets)
- [Providers](#providers)
- [Install Command](#install-command)
- [About Command](#about-command)
- [Publishing](#publishing)
- [Testing](#testing)
- [Upgrading from v1.x](#upgrading-from-v1x)
- [Versioning](#versioning)
- [License](#license)

## Installation

You can install the package via composer:

```bash
composer require nyoncode/laravel-package-toolkit
```

## Usage

### Basic Configuration

To use Laravel Package Builder, create a ServiceProvider for your package that extends
`NyonCode\LaravelPackageToolkit\PackageServiceProvider`:

```php
use NyonCode\LaravelPackageToolkit\PackageServiceProvider;
use NyonCode\LaravelPackageToolkit\Packager;
use NyonCode\LaravelPackageToolkit\Contracts\Packable;

class MyAwesomePackageServiceProvider extends PackageServiceProvider implements
    Packable
{
    public function configure(Packager $packager): void
    {
        $packager
            ->name('My Awesome Package')
            ->hasConfig()
            ->hasRoutes()
            ->hasMigrations()
            ->hasTranslations()
            ->hasViews();
    }
}
```

### Advanced Configuration

For more control over your package configuration, you can use additional methods and specify custom paths:

```php
use NyonCode\LaravelPackageToolkit\PackageServiceProvider;
use NyonCode\LaravelPackageToolkit\Packager;
use NyonCode\LaravelPackageToolkit\Contracts\Packable;

class AdvancedPackageServiceProvider extends PackageServiceProvider implements
    Packable
{
    public function configure(Packager $packager): void
    {
        $packager
            ->name('Advanced package')
            ->hasShortName('adv-pkg')
            ->hasConfig('custom-config.php')
            ->hasRoutes(['api.php', 'web.php'])
            ->hasMigrations('custom-migrations')
            ->hasTranslations('lang')
            ->hasViews('custom-views')
            ->hasComponents([
                'data-table' => DataTable::class,
                'modal' => Modal::class,
            ]);
    }

    public function registeringPackage(): void
    {
        // Custom logic before package registration
    }

    public function bootingPackage(): void
    {
        // Custom logic before package boot
    }
}
```

### Conditional registration resources

You can also use the `when()` method to conditionally register resources:

```php
use NyonCode\LaravelPackageToolkit\PackageServiceProvider;
use NyonCode\LaravelPackageToolkit\Packager;
use NyonCode\LaravelPackageToolkit\Contracts\Packable;

class ConditionalPackageServiceProvider extends PackageServiceProvider implements
    Packable
{
    public function configure(Packager $packager): void
    {
        $packager
            ->name('Conditional package')
            ->hasRoutes(['api.php', 'web.php'])
            ->hasMigrations('custom-migrations')
            ->hasTranslations('lang')
            ->hasViews('custom-views')
            ->when($this->isInLocal(), function ($packager) {
                $packager->hasConfig('local-config.php');
                $packager->hasCommands();
            })->when($this->isInProduction(), function ($packager) {
                $packager->hasConfig('production-config.php');
                $packager->hasRoutes('web.php');
            });
    }
}
```

Local and production resources will be registered when the `isInLocal()` and `isInProduction()` methods return `true`.

#### Additional Conditional Methods

The package provides several convenient methods for conditional loading:

```php
$packager
    // Environment-based conditions
    ->whenEnvironment(['local', 'testing'], function ($packager) {
        $packager->hasCommands(['DevCommand::class']);
    })
    ->whenProduction(function ($packager) {
        $packager->hasConfig('production-config.php');
    })
    ->whenLocal(function ($packager) {
        $packager->hasConfig('local-config.php');
    })
    
    // Runtime conditions
    ->whenConsole(function ($packager) {
        $packager->hasCommands();
    })
    
    // Class/extension existence
    ->whenClassExists('SomeClass', function ($packager) {
        $packager->hasConfig('optional-config.php');
    })
    ->whenExtensionLoaded('redis', function ($packager) {
        $packager->hasConfig('redis-config.php');
    });
```

---

## Lifecycle Hooks

The package provides lifecycle hooks that allow you to execute custom logic at specific points during package
registration and booting:

| **Hook Method**        | **Description**                      |
|------------------------|--------------------------------------|
| `registeringPackage()` | Called before `register()` is called |
| `registeredPackage()`  | Called after `register()` is called  |
| `bootingPackage()`     | Called before `boot()` is called     |
| `bootedPackage()`      | Called after `boot()` is called      |

### Using Lifecycle Hooks in Configuration

You can define lifecycle hooks directly in your package configuration:

```php
$packager
    ->name('My Package')
    ->registeringPackage(function ($packager) {
        // Logic executed before package registration
        Log::info('Registering My Package');
    })
    ->registeredPackage(function ($packager) {
        // Logic executed after package registration
        $this->app->singleton('my-service', MyService::class);
    })
    ->bootingPackage(function ($packager) {
        // Logic executed before package boot
        Event::listen('my-event', MyListener::class);
    })
    ->bootedPackage(function ($packager) {
        // Logic executed after package boot
        Log::info('My Package fully loaded');
    });
```

---

## Name

Define a name for the package:

```php
$packager->name('Package name');
```

---

## Short name

Define a custom short name for the package.
The hasShortName method is used to modify the name defined by `name()` if you prefer not to use the short version from
`$packager->name('Package name')`:

```php
$packager->hasShortName('custom-short-name');
```

The short name must be in kebab-case format and contain only lowercase letters, numbers, and hyphens.

---

## Config

To enable configuration in your package:

```php
$packager->hasConfig();
```

---
By default, this will load configuration from the `config` directory. For custom config files:

```php
$packager->hasConfig(['config.php', 'other-config.php']);
```

Or for specific file paths:

```php
$packager->hasConfig([
    '../www/config/config.php',
    '../api/config/other-config.php',
]);
```

To use an alternative directory for config files.

```php
$package->hasConfig(directory: 'customConfig');
```

---

## Routing

To enable routing in your package:

```php
$packager->hasRoutes();
```

By default, this will load routes from the `routes` directory. For custom route files:

```php
$packager->hasRoutes(['api.php', 'web.php']);
```

Or for specific file paths:

```php
$packager->hasRoute(['../www/routes/web.php', '../api/routes/api.php']);
```

To use an alternative directory for route files.

```php
$package->hasRoute(directory: 'webRouter');
```

---

## Middlewares

To register middleware for your package, use these methods:

### Register Middleware Aliases

To define route middleware aliases:

```php
$packager->hasMiddlewareAliases([
    'custom.alias' => \Vendor\Package\Http\Middleware\CustomMiddleware::class,
    'auth.custom' => \Vendor\Package\Http\Middleware\CustomAuthMiddleware::class,
]);
```

This allows you to assign the middleware to routes using its alias:

```php
Route::get('/example', fn () => 'Hello')->middleware('custom.alias');
```

### Register Middleware Groups

To push middleware into existing middleware groups:

```php
$packager->hasMiddlewareGroups([
    'web' => [
        \Vendor\Package\Http\Middleware\WebMiddleware::class,
    ],
    'api' => [
        \Vendor\Package\Http\Middleware\ApiMiddleware::class,
        \Vendor\Package\Http\Middleware\RateLimitMiddleware::class,
    ],
]);
```

This will automatically add your middleware to the specified groups (e.g. web, api).

### Register Middleware Globally

To register global middleware (executed for every request):

```php
$packager->hasMiddlewareGlobals([
    \Vendor\Package\Http\Middleware\GlobalMiddleware::class,
    \Vendor\Package\Http\Middleware\SecurityMiddleware::class,
]);
```

This middleware will be added to the middleware stack and is useful for applying middleware to all routes regardless of
their group.

## Migrations

The toolkit supports both **timestamped** and **timeless** migration files. Detection is automatic — simply call
`hasMigrations()` and the toolkit will handle both formats correctly.

### Timestamped migrations

Standard Laravel migration files with a date prefix:

```
database/migrations/
├── 2025_01_01_000000_create_users_table.php
└── 2025_01_01_000001_create_roles_table.php
```

To enable migrations:

```php
$packager->hasMigrations();
```

### Timeless migrations

Migration files without a date prefix. When published, the toolkit automatically prepends a sequential timestamp to
ensure correct execution order:

```
database/migrations/
├── create_posts_table.php
└── create_comments_table.php
```

Usage is identical — no extra configuration is needed:

```php
$packager->hasMigrations();
```

When a user runs `vendor:publish`, timeless files are published with a generated timestamp prefix (e.g.
`2025_03_20_143022_create_posts_table.php`). The original file names are preserved as the suffix.

### Mixed migrations

You can freely combine both formats in the same directory. Timestamped files keep their original prefix, and timeless
files receive an auto-generated one:

```
database/migrations/
├── 2025_01_01_000000_create_users_table.php   ← keeps original timestamp
├── create_posts_table.php                      ← gets timestamp on publish
└── create_comments_table.php                   ← gets timestamp on publish
```

### Specifying migration files

For specific file paths:

```php
$packager->hasMigrations([
    '../www/database/migrations/2023_01_01_000000_create_users_table.php',
    '../api/database/migrations/2023_01_01_000001_create_roles_table.php',
]);
```

This loads migrations from the `database/migrations` directory. For a custom directory:

```php
$packager->hasMigrations(directory: 'custom-migrations');
```

To use an alternative directory for migration files:

```php
$package->hasMigrations(
    ['2023_01_01_000000_create_users_table.php'],
    'userMigrations'
);
```

For more information about migrations, see [Laravel migrations](https://laravel.com/docs/9.x/migrations).

### Loading migrations without publishing

```php
$packager->canLoadMigrations();
```

This will load migrations directly when the package is registered, without requiring them to be published first. Works
with both timestamped and timeless migration files.

---

## Translations

To enable translations:

```php
$packager->hasTranslations();
```

This loads translations from the `lang` directory and automatically supports JSON translations.

For a custom directory:

```php
$packager->hasTranslations('custom-lang-directory');
```

The package automatically validates language directory names against supported language codes and detects JSON
translation files.

---

## Commands

To enable commands:

```php
$packager->hasCommands();
```

Defaults to loading commands from the `Commands` directory.
To use an alternative directory for command files.

```php
$packager->hasCommands(directory: 'custom-commands');
```

For single command:

```php
$packager->hasCommand('\Vendor\Package\Commands\CustomCommand::class');
```

Or for specific file names:

```php
$packager->hasCommands([
    '\Vendor\Package\Commands\CustomCommand::class',
    '\Vendor\Package\Commands\OtherCommand::class',
]);
```

For more information about commands, see [Laravel commands](https://laravel.com/docs/12.x/artisan).

---

## Views

To enable views:

```php
$packager->hasViews();
```

This loads views from the `resources/views` directory. For a custom directory:

```php
$packager->hasViews('custom-views');
```

You can also specify a custom views directory with a different path:

```php
$packager->hasViews(
    viewsPath: 'my-views', 
    directory: '../resources/my-views'
);
```

or

```php
$packager->hasViews(__DIR__.'/../resources/views/admin', 'admin', 'mypackage-admin');
```

---

## View Components

To register multiple view components:

```php
$packager->hasComponents(
    prefix: 'nyon',
    components: [
        'data-table' => DataTable::class,
        'modal' => Modal::class,
        Sidebar::class,
    ]
);
```

To register a single view component with an optional alias:

```php
$packager->hasComponent('nyon', Alert::class, 'custom-alert');
```

You can then use these components in your Blade templates:

```blade
<x-nyon-data-table :data="$users"/>
<x-nyon-modal title="User Details">
    <!-- Modal content -->
</x-modal>
<x-nyon-sidebar id="sidebar"/>
<x-nyon-custom-alert type="warning" message="This is a warning!"/>
```

---

## View Component Namespaces

To register multiple view component namespaces:

```php
$packager->hasComponentNamespaces(
    namespaces: [
        'nyon' => 'App\View\Components\Alert',
        'admin' => 'App\View\Components\Modal',
    ]
);
```

To register a single view component namespace with an optional alias:

```php
$packager->hasComponentNamespace('nyon', 'App\View\Components\Alert');
```

You can then use these namespaces in your Blade templates:

```blade
<x-nyon::alert :data="$users"/>
<x-admin::modal title="User Details">
    <!-- Modal content -->
</x-admin-modal>
```

---

## View Composers

To register multiple view composers:

```php
$packager
    ->hasViewComposer(
        views: 'nyon',
        composers: fn($view) => $view->with('test', 'test-value')
    )->hasViewComposer(
        views: ['viewName', 'anotherViewName'],
        composers: MyViewComposer::class
    );
```

You can also bind a composer to all views using the wildcard `*`:

```php
$packager->hasViewComposer('*', function ($view) {
    $view->with('globalData', 'available-everywhere');
});
```

---

## View Shared Data

To add shared data to views:

```php
$packager->hasSharedDataForAllViews(['key' => 'value', 'user' => 'john']);
```

This adds key-value pairs to the shared data array in the view. The shared data must have string keys and values must be
scalar, array, null, or implement the `Arrayable` interface.

For more information about shared data, see [Laravel shared data](https://laravel.com/docs/12.x/views#shared-data).

---

## Assets

To enable assets:

```php
$packager->hasAssets();
```

This loads assets from the `dist` directory by default. For a custom directory:

```php
$packager->hasAssets('public');
```

Assets will be published to `public/vendor/{package-short-name}` when using the publish command.

---

## Providers

To enable service providers:

```php
$packager->hasProvider('../stubs/MyProvider.stub');
```

Support for multiple service providers:

```php
$packager->hasProvider('../stubs/MyProvider.stub')
    ->hasProvider('../stubs/MyOtherProvider.stub');
```

```php
$packager->hasProviders([
    '../stubs/MyProvider.stub',
    '../stubs/MyOtherProvider.stub',
]);
```

Service providers will be published to `app/Providers/{ProviderName}.php` when using the publish command.

---

## Install Command

The package provides a powerful install command system that allows users to easily install and configure your package.

### Basic Install Command

To enable the install command:

```php
$packager->hasInstallCommand();
```

This creates a command `{package-short-name}:install` that users can run to install your package.

### Configuring the Install Command

You can configure what gets installed using a callback:

```php
$packager->hasInstallCommand(function (InstallCommand $command) {
    $command->publishConfig()
        ->publishMigrations()
        ->publishAssets()
        ->publishViews();
});
```

### Install Command Options

The install command supports several configuration options:

```php
$packager
    // Custom command name
    ->installCommandName('setup')  // Creates package:setup instead of package:install
    
    // Hide command from artisan list
    ->installCommandHidden(true)
    
    // Auto-install when package loads
    ->installOnRun(true)
    
    // Install only in specific environments
    ->installOnRunInEnvironment(['local', 'testing'])
    ->installOnRunInLocal()
    ->installOnRunInProduction();
```

### Pre-built Install Configurations

The package provides several pre-built installation configurations:

```php
// Quick install (config, migrations, assets)
$packager->hasQuickInstall();

// Full install (everything)
$packager->hasFullInstall();

// Minimal install (config only)
$packager->hasMinimalInstall();

// Development install (config, migrations, views, assets, routes in local only)
$packager->hasDevInstall();
```

### Advanced Install Command Configuration

For more advanced configurations, you can use the full callback approach:

```php
$packager->hasInstallCommand(function (InstallCommand $command) {
    $command
        ->publishConfig()
        ->publishMigrations()
        ->publishAssets()
        ->publishForEnvironment(['local'], 'routes')
        ->publishForProduction('config')
        ->beforeInstallation(function ($command) {
            $command->info('Starting installation...');
        })
        ->afterInstallation(function ($command) {
            $command->info('Installation completed!');
            $command->call('migrate');
        })
        ->askToStarRepoOnGitHub('https://github.com/your/repo');
});
```

### Available Publishing Methods

The install command supports the following publishing methods:

- `publishConfig()` / `publishConfigFile()` / `publishConfigFiles()`
- `publishMigrations()`
- `publishRoutes()` / `publishRouteFiles()`
- `publishTranslations()` / `publishTranslationFiles()` / `publishLanguageFiles()`
- `publishAssets()` / `publishPublicAssets()`
- `publishViews()` / `publishViewFiles()`
- `publishProviders()` / `publishServiceProviders()`
- `publishComponents()` / `publishViewComponents()`
- `publishComponentNamespaces()` / `publishViewComponentNamespaces()`
- `publishEverything()` / `publishAll()`
- `publishEssentials()` (config, migrations, assets)

### Conditional Publishing

You can conditionally publish resources:

```php
$command
    ->publishIf($someCondition, 'config', 'migrations')
    ->publishUnless($otherCondition, 'routes')
    ->publishForEnvironment(['local', 'testing'], 'routes')
    ->publishForProduction('config')
    ->publishForLocal('assets');
```

---

## About Command

Laravel Package Builder provides methods to add package information to Laravel's php artisan about command.

### hasAbout()

The hasAbout() method allows you to include your package's information in the Laravel About command. By default, it will
include the package's version.

```php
$packager->hasAbout();
```

### hasVersion()

The hasVersion() method lets you manually set the version of your package:

```php
$packager->hasVersion('1.0.0');
```

If no version is manually set, the package will automatically retrieve the version from your composer.json file.

### Customizing About Command Data

You can extend the about command information by implementing the `aboutData()` method in your service provider:

```php
public function aboutData(): array
{
    return [
        'Repository' => 'https://github.com/your/package',
        'Author' => 'Your Name',
        'License' => 'MIT',
        'Documentation' => 'https://docs.example.com',
    ];
}
```

This method allows you to add custom key-value pairs to the About command output for your package.
When you run `php artisan about`, your package's information will be displayed in a dedicated section.
This implementation allows for flexible and easy inclusion of package metadata in Laravel's system information command.

---

## Publishing

For publishing, you can use the following commands:

```bash
php artisan vendor:publish
```

`vendor:publish` show all the tags that can be used for publishing.

### Available Publishing Tags

Each resource type has its own publishing tag in the format `{package-short-name}::{resource-type}`:

- `{package-name}::config` - Configuration files
- `{package-name}::migrations` - Database migrations
- `{package-name}::routes` - Route files
- `{package-name}::translations` - Translation files
- `{package-name}::assets` - Public assets
- `{package-name}::views` - View files
- `{package-name}::providers` - Service providers
- `{package-name}::view-components` - View components
- `{package-name}::view-component-namespaces` - View component namespaces

### Example of using tags:

Use `php artisan vendor:publish --tag=package-short-name::config` for publish configuration files.

```bash
# Publish specific resources
php artisan vendor:publish --tag=my-package::config
php artisan vendor:publish --tag=my-package::migrations
php artisan vendor:publish --tag=my-package::assets

# Publish with force (overwrite existing files)
php artisan vendor:publish --tag=my-package::config --force
```

### Migration publishing behavior

When publishing migrations, the behavior depends on the file format:

- **Timestamped migrations** (e.g. `2025_01_01_000000_create_users_table.php`) are published as-is with their original
  filename.
- **Timeless migrations** (e.g. `create_posts_table.php`) automatically receive a timestamp prefix at the time of
  publishing to ensure correct execution order.
- **Mixed directories** are handled per-file — each file is treated individually based on whether it has a date prefix
  or not.

---

## Testing

```bash
composer test
```

The package includes comprehensive tests for all features including:

- Configuration loading and publishing
- Route registration
- Middleware registration
- Migration handling (timestamped, timeless, and mixed)
- Translation loading
- View and component registration
- Command registration
- Install command functionality
- Lifecycle hooks
- Conditional loading

---

## Upgrading from v1.x

Version 2.0 introduces the following breaking changes:

- **Dropped Laravel 9.x support** — Laravel 9 reached end-of-life and no longer receives security updates. If your
  project still depends on Laravel 9, continue using `^1.0`.
- **Minimum PHP version raised to 8.2** — Aligning with Laravel 11+ requirements.
- **Added Laravel 13.x support** — Full compatibility with the latest Laravel release.
- **Timeless migrations** — Migrations without a date prefix are now supported. This is a non-breaking addition but
  changes the internal publishing behavior when timeless files are detected. Existing timestamped migrations are
  unaffected.

To upgrade, update your `composer.json`:

```json
{
	"require": {
		"nyoncode/laravel-package-toolkit": "^2.0"
	}
}
```

Then run `composer update`. No code changes are required unless your package explicitly depends on Laravel 9 or PHP 8.1.

---

## Versioning

This package follows [Semantic Versioning](https://semver.org/) (SemVer).

Given a version number `MAJOR.MINOR.PATCH`, we increment the:

- **MAJOR** version when we make incompatible API changes
- **MINOR** version when we add functionality in a backwards compatible manner
- **PATCH** version when we make backwards compatible bug fixes

Additional labels for pre-release and build metadata are available as extensions to the `MAJOR.MINOR.PATCH` format.

### Compatibility Promise

- **Major versions** may contain breaking changes
- **Minor versions** will maintain backward compatibility within the same major version
- **Patch versions** will only contain bug fixes and security updates

We recommend using version constraints in your `composer.json` that allow for minor and patch updates but protect
against major version changes:

```json
{
	"require": {
		"nyoncode/laravel-package-toolkit": "^2.0"
	}
}
```

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.