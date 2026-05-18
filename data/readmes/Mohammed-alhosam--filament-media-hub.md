# Filament Media Hub

A reusable media library package for Laravel 12 and Filament v4, built on top of [Spatie Media Library](https://github.com/spatie/laravel-medialibrary).

Filament Media Hub provides a central media library, reusable picker fields, inline RichEditor image insertion, media usage tracking, and folder-based organization for admin panels that need stricter editorial workflows than a simple upload field.

## Highlights

- Central media library UI for Filament
- Folder tree with breadcrumbs and scoped browsing
- Reusable `MediaHubPicker` field for Filament forms
- RichEditor image insertion from the media library
- Media usage tracking through `media_usages`
- Soft deletes for folders and assets
- Protection against deleting assets that are already in use
- Validation rules for folder hierarchy and sibling uniqueness
- Arabic-first and RTL-safe UI support

## Requirements

- PHP 8.2+
- Laravel 12
- Filament v4
- Spatie Media Library v11

## Installation

Install the package:

```bash
composer require alhosam/filament-media-hub
```

Publish the configuration and migrations:

```bash
php artisan vendor:publish --tag=filament-media-hub-config
php artisan vendor:publish --tag=filament-media-hub-migrations
```

Run the migrations and publish Filament assets:

```bash
php artisan migrate
php artisan filament:assets
```

Validate the installation:

```bash
php artisan media-hub:doctor
```

## Register The Filament Plugin

Register the plugin inside your Filament panel provider:

```php
use Alhosam\FilamentMediaHub\Filament\Plugins\FilamentMediaHubPlugin;

return $panel
    ->plugin(FilamentMediaHubPlugin::make());
```

The Laravel package service provider is discovered automatically through Composer package discovery.

## Basic Usage

### Featured image

```php
use Alhosam\FilamentMediaHub\Filament\Components\MediaHubPicker;

MediaHubPicker::featured('hero_media_asset_id', 'Hero image');
```

### Gallery

```php
MediaHubPicker::gallery('gallery_media_asset_ids', 'Gallery');
```

### Documents

```php
MediaHubPicker::documents('document_media_asset_ids', 'Documents');
```

### Rich editor

```php
use Alhosam\FilamentMediaHub\Filament\Forms\Components\MediaHubRichEditor;

MediaHubRichEditor::make('body')
    ->label('Content');
```

## What The Package Enforces

- Reusable media relationships should prefer the central media library
- Used assets cannot be deleted
- Non-empty folders cannot be deleted without transferring their contents
- Folder names must be unique within the same parent level
- Folder parent changes must also respect sibling uniqueness
- Rich editor images store `media-asset:{id}`
- Asset usages are synchronized into `media_usages`

## Configuration

The package publishes a `filament-media-hub.php` config file with options for:

- model classes
- storage disk
- media collection name
- image conversions
- library-only default mode
- accepted MIME types per media type

## Local Path Repository Development

If you are developing the package inside a monorepo or a shared workspace, consume it through a Composer path repository:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "packages/alhosam/filament-media-hub",
            "options": {
                "symlink": true
            }
        }
    ],
    "require": {
        "alhosam/filament-media-hub": "^1.0"
    }
}
```

This mirrors real package consumption much more accurately than using root-level PSR-4 mappings.

## Included Command

The package ships with a health-check command:

```bash
php artisan media-hub:doctor
```

It validates:

- package config availability
- plugin class availability
- required database tables
- published package CSS asset

## Development

Run the package tests directly from the package repository:

```bash
composer install
composer test
vendor/bin/pint --test
```

The repository also includes:

- GitHub Actions CI for PHPUnit on PHP 8.2 and 8.3
- GitHub Actions clean-install smoke test against a fresh Laravel 12 app
- `CONTRIBUTING.md`
- issue templates
- pull request template

## Packagist Release Workflow

The package is prepared for public Composer distribution as:

```bash
composer require alhosam/filament-media-hub
```

For release and Packagist publication steps, see:

- [`docs/packagist-release-checklist.md`](docs/packagist-release-checklist.md)

## Current Status

The package is already being used in a production-style Laravel 12 + Filament v4 project for:

- news content
- sliders
- banners
- destinations
- locations
- homepage sections
- travel guides
- heritage sites
- tourism packages
- author profiles

It has also been validated in a clean Laravel 12 application through:

- a dedicated GitHub Actions `smoke-install` workflow
- a real local smoke-test app installed through Composer path repository consumption

## Roadmap

Current hardening status:

- package test suite: complete
- clean-host installation validation: automated through CI
- compatibility helper layers: retained only where they help smooth host adoption
- Packagist release checklist: complete

## License

MIT

