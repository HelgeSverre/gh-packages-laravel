# ArtisanPack UI Icons

An extensibility layer for custom icon sets that integrates seamlessly with `blade-ui-kit/blade-icons` and `livewire-ui-components`. This package provides a simple, flexible way to register and use custom SVG icon sets in your Laravel applications without the overhead of hardcoded icon libraries.

## Features

- **Zero Hardcoded Icons:** No memory-heavy icon arrays - bring your own icons
- **Seamless Integration:** Built on `blade-ui-kit/blade-icons` foundation
- **Dual Registration System:** Configure via config files or register programmatically via events  
- **Third-Party Extensible:** Other packages can register icon sets via event hooks
- **Font Awesome Pro Ready:** Easy integration with Font Awesome Pro and other premium icon sets
- **Performance Optimized:** Minimal memory footprint and fast loading

## Installation

Install the package via Composer:

```bash
composer require artisanpack-ui/icons
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=artisanpack-package-config
```

## Quick Start

### 1. Configure Your Icon Sets

Edit `config/artisanpack/icons.php` to register your icon sets:

```php
return [
    'sets' => [
        'fa' => [
+            'path' => resource_path('icons/fontawesome-pro'),
+            'prefix' => 'fa',
+        ],
+        'brand' => [
+            'path' => resource_path('icons/custom-brand'),
+            'prefix' => 'brand',
+        ],
    ],
];
```

### 2. Organize Your Icons

Place your SVG files in the configured directories:

```
resources/
├── icons/
│   ├── fontawesome-pro/
│   │   ├── home.svg
│   │   └── user.svg
│   └── custom-brand/
│       ├── logo.svg
│       └── badge.svg
```

### 3. Use Icons in Blade Templates

```blade
{{-- Using Font Awesome Pro icons with 'fa' prefix --}}
<x-icon-fa-home class="w-6 h-6" />
<x-icon-fa-user class="w-5 h-5 text-blue-500" />

{{-- Using custom brand icons with 'brand' prefix --}}
<x-icon-brand-logo class="w-8 h-8" />
<x-icon-brand-badge class="w-4 h-4" />
```

## Registration Methods

### Config-Based Registration

The simplest approach - define icon sets in your `config/artisanpack/icons.php`:

```php
return [
    'sets' => [
        'hero' => [
            'path'   => resource_path('icons/heroicons'), 
            'prefix' => 'hero'
        ],
+       'tabler' => [
            'path'   => resource_path('icons/tabler'),
            'prefix' => 'tabler'
        ],
    ],
];
```

### Event-Driven Registration

Perfect for packages that want to register their own icon sets:

```php
use ArtisanPackUI\Icons\Registries\IconSetRegistration;

// In a service provider or event listener
addFilter('ap.icons.register-icon-sets', function (IconSetRegistration $registry) {
    $registry->addSet(__DIR__ . '/../../resources/icons', 'mypackage');
    return $registry;
});
```

## Documentation

For comprehensive documentation, visit the [docs](docs) directory:

### Getting Started
- **[Installation Guide](docs/guide/installation.md)** - Complete setup instructions
- **[Usage Examples](docs/guide/usage-examples.md)** - Practical implementation examples
- **[Architecture Overview](docs/guide/architecture.md)** - How the extensibility layer works

### Advanced Usage
- **[Extension API](docs/guide/extension-api.md)** - Third-party package integration
- **[Migration Guide](docs/guide/migration.md)** - Upgrading from v1.x
- **[Deprecation Strategy](docs/guide/deprecation-strategy.md)** - v1.x support timeline and migration assistance
- **[Service Provider](docs/guide/service-provider.md)** - Laravel integration details

## Requirements

- PHP 8.2 or higher
- Laravel 12.0 or higher
- `blade-ui-kit/blade-icons` ^1.8

## Contributing

As an open source project, this package is open to contributions from anyone. Please [read through the contributing guidelines](CONTRIBUTING.md) to learn more about how you can contribute to this project.
