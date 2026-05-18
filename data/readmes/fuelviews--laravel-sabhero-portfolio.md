# SAB Hero Portfolio Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-sabhero-portfolio.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-portfolio)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-sabhero-portfolio.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-portfolio)

A Laravel package for managing and displaying before/after image portfolios with a dynamic slider component. Perfect for renovation projects, home improvements, design transformations, or any visual comparison showcase.

## Features

- Filament admin panel integration for easy content management
- Before/After interactive slider component
- Customizable portfolio types with Filament UI integration
- Responsive image handling with transparent PNG support
- Configurable media storage disk support
- Livewire components for seamless frontend integration
- Import/Export functionality (CSV and Laravel migration formats)

## Installation

You can install the package via composer:

```bash
composer require fuelviews/laravel-sabhero-portfolio
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="sabhero-portfolio-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="sabhero-portfolio-config"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="sabhero-portfolio-views"
```

## Integration

### 1. Attach to Filament Panel

Add the SabHero Portfolio plugin to your Filament panel provider:

```php
use Fuelviews\SabHeroArticle\Facades\SabHeroPortfolio;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            SabHeroPortfolio::make()
        ]);
}
```

## Usage

### Admin Panel

After installation, you'll find a new "Portfolio" section in your Filament admin panel where you can

1. Create, edit, and delete portfolio entries
2. Upload before and after images
3. Categorize entries by type
4. Control spacing and ordering
5. Publish/unpublish entries

### Import/Export

The package includes powerful import/export functionality for backing up, migrating, and managing portfolio content.

**Available Operations:**
- **CSV Export** - Export portfolios with before/after images to ZIP file
- **CSV Import** - Import portfolios from ZIP file with images
- **Migration Export** - Export as production-ready Laravel migration with markdown files

**Access in Filament:**
1. Navigate to Portfolio → Entries in your admin panel
2. Click "Import Portfolios" (top-right) to import from ZIP
3. Select portfolios and use "Bulk actions" dropdown for export options

**For Complete Documentation:**
See [IMPORT_EXPORT.md](IMPORT_EXPORT.md) for:
- Detailed file format specifications
- Step-by-step workflows and use cases
- Migration installation instructions
- Troubleshooting guide
- Best practices for backup and deployment

### Frontend Display

You can display the before/after slider in your Blade views using Livewire:

For all portfolio types

```php
@livewire('sabhero-portfolio::before-after-slider')
```
Or

```bladehtml
<livewire:sabhero-portfolio::before-after-slider />
```

For specific portfolio types

```php
@livewire('sabhero-portfolio::before-after-slider', ['type' => 'commercial'])
```

Or

```bladehtml
<livewire:sabhero-portfolio::before-after-slider type="commercial" />
```

### Custom Portfolio Types

You can define custom portfolio types in the configuration file. Each type requires:
- A unique key (used in the database)
- A label (displayed in the UI, stored in lowercase)
- A color (used in the Filament admin panel)

### Custom Media Storage

By default, the package uses the disk configured in your Spatie Media Library config. You can override this in the package config

```php
// config/sabhero-portfolio.php
    'media' => [
        'disk' => 'public',
    ],
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Requirements

- PHP 8.3 or higher
- Laravel 10.0 or higher
- Filament 3.0 or higher
- Spatie Media Library 10.0 or higher
- League CSV 9.0 or higher
- Symfony YAML 6.0 or higher

## Credits

- [Joshua Mitchener](https://github.com/thejmitchener)
- [Daniel Clark](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
 
