![Filament Info Pages Banner](./art/Filament%20Info%20Pages.png)
# Filament Info Pages

![Do not use](https://img.shields.io/badge/Under%20development-Don't%20use-red)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/rectitude-open/filament-info-pages.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-info-pages)
[![Tests](https://github.com/rectitude-open/filament-info-pages/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rectitude-open/filament-info-pages/actions/workflows/run-tests.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen)](https://phpstan.org/)
[![Total Downloads](https://img.shields.io/packagist/dt/rectitude-open/filament-info-pages.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-info-pages)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/rectitude-open/filament-info-pages/pulls)

Filament Info Pages provides a simple way to create and manage single-page content, such as "About Us" or "Privacy Policy" pages, directly within your Filament admin panel. It offers a straightforward interface for quickly adding and editing these informational pages without unnecessary complexity.

This package is also a standalone part of a CMS project: [FilaPress](https://github.com/rectitude-open/filapress).

> **Note:** This plugin relies on several excellent Laravel/Filament plugins. Before installing Filament Info Pages, you must ensure that all the following dependencies are installed and properly configured in your project.
[Eloquent Sluggable](https://github.com/cviebrock/eloquent-sluggable), [Filament Versionable](https://github.com/mansoorkhan96/filament-versionable), [Filament SEO](https://github.com/ralphjsmit/laravel-filament-seo), [Filament Curator](https://github.com/awcodes/filament-curator)

Resource | Page | Cluster | Migration | Model | Config | View | Localization
--- | --- | --- | --- | --- | --- | --- | ---
✅ | ❌| ❌ | ✅ | ✅ | ✅ | ❌ | ✅  

## Installation

You can install the package via composer:

```bash
composer require rectitude-open/filament-info-pages
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-info-pages-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-info-pages-config"
```

Optionally, you can publish the translations using

```bash
php artisan vendor:publish --tag="filament-info-pages-translations"
```

This is the contents of the published config file:

```php
return [
    'filament_resource' => RectitudeOpen\FilamentInfoPages\Resources\PageResource::class,
    'model' => RectitudeOpen\FilamentInfoPages\Models\Page::class,
    'navigation_sort' => 0,
    'navigation_icon' => 'heroicon-o-document-text',
    'datetime_format' => 'Y-m-d H:i:s',
    'editor_component_class' => \Filament\Forms\Components\RichEditor::class,
];
```

## Usage

The package provides a resource page that allows you to view Pages in your Filament admin panel. 

To use the resource page provided by this package, you need to register it in your Panel Provider first.

```php
namespace App\Providers\Filament;

use RectitudeOpen\FilamentInfoPages\FilamentInfoPagesPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                FilamentInfoPagesPlugin::make()
            ]);
    }
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Aspirant Zhang](https://github.com/aspirantzhang)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
