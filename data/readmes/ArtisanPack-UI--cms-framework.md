# ArtisanPack UI CMS Framework

[![Latest Version on Packagist](https://img.shields.io/packagist/v/artisanpack-ui/cms-framework.svg?style=flat-square)](https://packagist.org/packages/artisanpack-ui/cms-framework)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/artisanpack-ui/cms-framework/run-tests?label=tests)](https://github.com/artisanpack-ui/cms-framework/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/workflow/status/artisanpack-ui/cms-framework/Check%20&%20fix%20styling?label=code%20style)](https://github.com/artisanpack-ui/cms-framework/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/artisanpack-ui/cms-framework.svg?style=flat-square)](https://packagist.org/packages/artisanpack-ui/cms-framework)

A comprehensive Laravel package that provides back-end support for building a CMS with any front-end framework. This package offers a complete set of features for content management, user management, authentication, and more.

## Features

- **Content Management**: Content types, taxonomies, and media management
- **Admin Interface**: Admin pages, dashboard widgets, and settings management
- **User Management**: User roles, permissions, and profiles
- **Authentication**: Two-factor authentication with Laravel Sanctum integration
- **Notifications**: Comprehensive notification system
- **Themes & Plugins**: Support for themes and plugins ⚠️ **Experimental in Beta**
- **Core Updates**: Automatic update checking and management with rollback support
- **PWA Support**: Progressive Web App features
- **Audit Logging**: Track changes and user actions

## Requirements

- PHP 8.2 or higher
- Laravel 12.0 or higher
- Laravel Sanctum 4.1 or higher

## Quick Installation

You can install the CMS Framework package by running the following composer command:

```bash
composer require artisanpack-ui/cms-framework
```

After installation, publish the configuration file:

```bash
php artisan vendor:publish --tag=cms-framework-config
```

Run the migrations to set up the database tables:

```bash
php artisan migrate
```

## Documentation

📚 **[Complete Documentation](docs/)**

- **[Installation Guide](docs/installation.md)** - Detailed installation and setup instructions
- **[Configuration](docs/configuration.md)** - Configuration options and environment setup
- **[Usage Guide](docs/usage.md)** - Comprehensive usage examples and tutorials
- **[API Documentation](docs/api.md)** - Complete REST API reference
- **[Migration Guide](docs/migration.md)** - Migrating from other CMS frameworks
- **[Testing](docs/testing.md)** - Testing strategies and examples
- **[Performance & Troubleshooting](docs/performance.md)** - Optimization and common issues
- **[Contributing](docs/contributing.md)** - Development and contribution guidelines

## Quick Start

### Content Types

Register a custom content type:

```php
use ArtisanPackUI\CMSFramework\Features\ContentTypes\ContentTypeManager;

app(ContentTypeManager::class)->register('product', [
    'name' => 'Product',
    'plural' => 'Products',
    'description' => 'Products for the store',
    'supports' => ['title', 'editor', 'thumbnail'],
]);
```

### Admin Pages

Register a custom admin page:

```php
use ArtisanPackUI\CMSFramework\Features\AdminPages\AdminPagesManager;

app(AdminPagesManager::class)->addPage([
    'title' => 'Custom Settings',
    'slug' => 'custom-settings',
    'callback' => function() {
        return view('custom.settings');
    }
]);
```

### Settings

Register and retrieve settings:

```php
use ArtisanPackUI\CMSFramework\Features\Settings\SettingsManager;

// Register a setting
app(SettingsManager::class)->register('site_name', 'My Awesome Site');

// Get a setting
$siteName = app(SettingsManager::class)->get('site_name');
```

### Customization with Hooks

The CMS Framework uses hooks and filters for extensive customization:

```php
// addFilter and addAction are global helper functions provided by the framework

// Add a filter
addFilter('ap.cms.migrations.directories', function($directories) {
    $directories[] = __DIR__ . '/database/migrations';
    return $directories;
});

// Add an action
addAction('ap.cms.after_content_save', function($content) {
    // Do something after content is saved
});
```

## Experimental Features

The following features are **experimental** in the 1.0.0 release and should be used with caution in production environments:

### Plugin System

The plugin system provides a foundation for extending the CMS with custom functionality.

**What Works:**
- Plugin model with activation/deactivation tracking
- Plugin manager for lifecycle management
- Plugin installation and validation
- Plugin update manager integration

**Known Limitations:**
- Plugin lifecycle hooks not fully implemented
- No plugin dependency management
- Limited plugin configuration API
- No plugin marketplace integration

**Recommendation:** Use for testing and development. Not recommended for production until full lifecycle support is added in a future release.

### Theme System

The theme system allows customization of the CMS appearance.

**What Works:**
- Theme manager with theme discovery
- Theme activation mechanism
- JSON manifest validation
- Basic theme structure

**Known Limitations:**
- Asset compilation not implemented
- No child theme support
- Limited theme customization API
- No theme preview functionality

**Recommendation:** Use for testing and development. Full theme support including asset compilation and child themes will be added in a future release.

### Reporting Issues

If you encounter issues with experimental features, please report them on our [issue tracker](https://github.com/ArtisanPack-UI/cms-framework/issues) with the `experimental` label.

## Contributing

We welcome contributions! Please see **[Contributing Guide](docs/contributing.md)** for details on:

- Development setup
- Code style guidelines
- Testing requirements
- Submission process

## Security

If you discover a security vulnerability, please send an email to security@artisanpack.com. All security vulnerabilities will be promptly addressed.

## Credits

- [Jacob Martella](https://github.com/jacobmartella)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Changelog

Please see **[CHANGELOG.md](CHANGELOG.md)** for more information on what has changed recently.
