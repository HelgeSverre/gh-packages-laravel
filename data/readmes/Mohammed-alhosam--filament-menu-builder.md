# Filament Menu Builder

Reusable menu builder package for Laravel 12 and Filament v4.

## Features

- hierarchical menu locations and menus
- multi-level menu items with maximum depth enforcement
- mega menu and mega column item types
- dynamic menu sources through a registry
- model target resolvers through a registry
- frontend Blade renderer
- cache-aware menu building with automatic invalidation
- Filament resources for locations, menus, item management, and preview

## Installation

```bash
composer require alhosam/filament-menu-builder
php artisan vendor:publish --tag=filament-menu-builder-config
php artisan vendor:publish --tag=filament-menu-builder-migrations
php artisan migrate
```

Register the plugin in your Filament panel:

```php
use Alhosam\FilamentMenuBuilder\Filament\Plugins\FilamentMenuBuilderPlugin;

->plugin(FilamentMenuBuilderPlugin::make())
```

## Blade usage

Render a menu by location:

```blade
<x-filament-menu-builder::menu location="header" />
```

Render a menu with a custom variant:

```blade
<x-filament-menu-builder::menu location="footer" variant="mobile" />
```

## Dynamic sources

Register application-specific dynamic collections:

```php
use Alhosam\FilamentMenuBuilder\Support\MenuBuilder;

MenuBuilder::registerSource('news.latest', \App\MenuSources\LatestNewsMenuSource::class);
MenuBuilder::registerSource('events.upcoming', \App\MenuSources\UpcomingEventsMenuSource::class);
```

Each source must implement:

```php
Alhosam\FilamentMenuBuilder\Contracts\MenuSourceInterface
```

## Target resolvers

Keep the package generic and let the host application resolve model links:

```php
use Alhosam\FilamentMenuBuilder\Support\MenuBuilder;

MenuBuilder::registerTargetResolver('news_article', \App\MenuTargets\NewsArticleMenuTargetResolver::class);
```

Each resolver must implement:

```php
Alhosam\FilamentMenuBuilder\Contracts\MenuTargetResolverInterface
```

## Admin experience

The package provides:

- menu locations resource
- menus resource
- full-page menu items management
- menu preview page

## Included console command

```bash
php artisan menu-builder:doctor
```

This prints:

- configured locations
- registered dynamic sources
- registered target resolvers

## Development

Run formatting:

```bash
vendor/bin/pint
```

Run tests:

```bash
vendor/bin/phpunit
```

## License

MIT
