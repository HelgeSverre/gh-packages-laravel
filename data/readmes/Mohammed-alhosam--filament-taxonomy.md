# Filament Taxonomy

Reusable taxonomy management for Laravel 12 and Filament v4.

## Features

- taxonomy definitions with configurable keys and max depth
- hierarchical terms with anti-cycle protection
- sibling uniqueness checks for names and slugs
- single-screen tree manager for create, edit, move, merge, delete, and restore
- safe delete workflow with child transfer and attached-content transfer
- host-level taxonomy type registry
- host-level usage resolver and mover registry
- Filament admin resources and tree workspace
- doctor command for package readiness checks

## Installation

```bash
composer require alhosam/filament-taxonomy
php artisan vendor:publish --tag=filament-taxonomy-config
php artisan vendor:publish --tag=filament-taxonomy-migrations
php artisan migrate
php artisan filament:assets
```

Register the plugin in your Filament panel:

```php
use Alhosam\FilamentTaxonomy\Filament\Plugins\FilamentTaxonomyPlugin;

->plugin(FilamentTaxonomyPlugin::make())
```

## Basic usage

Create taxonomies from the Filament admin panel, then manage their terms from the `Tree` page.

The package keeps term management in a single workspace:

- create root terms
- add child terms
- edit and move terms
- merge terms
- soft delete with transfer options
- restore archived terms

## Register taxonomy types

```php
use Alhosam\FilamentTaxonomy\Services\TaxonomyTypeRegistry;

app(TaxonomyTypeRegistry::class)->register('news', [
    'label' => 'News Categories',
]);
```

## Register usage resolvers and movers

```php
use Alhosam\FilamentTaxonomy\Services\TaxonomyUsageRegistry;
use App\Taxonomy\Movers\NewsTaxonomyUsageMover;
use App\Taxonomy\Resolvers\NewsTaxonomyUsageResolver;

app(TaxonomyUsageRegistry::class)->registerResolver('news', NewsTaxonomyUsageResolver::class);
app(TaxonomyUsageRegistry::class)->registerMover('news', NewsTaxonomyUsageMover::class);
```

Resolvers count attached content for a term. Movers transfer attached content when a term is deleted or merged.

## Doctor command

```bash
php artisan taxonomy:doctor
```

## Development

```bash
composer test
composer format
```
