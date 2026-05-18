![Filament Site Snippets Banner](./art/Filament%20Site%20Snippets.png)
# Filament Site Snippets

[![Tests](https://github.com/rectitude-open/filament-site-snippets/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rectitude-open/filament-site-snippets/actions/workflows/run-tests.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen)](https://phpstan.org/)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/rectitude-open/filament-site-snippets.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-site-snippets)
[![Total Downloads](https://img.shields.io/packagist/dt/rectitude-open/filament-site-snippets.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-site-snippets)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/rectitude-open/filament-site-snippets/pulls)

This Filament plugin provides a simple way to manage "snippets" – small, reusable pieces of content like text, rich text, or images – directly from your Filament admin panel. These snippets can be easily integrated into various parts of your website, such as footer copyright notices, site taglines, or other dynamic content elements that you want to manage centrally.

This package is also a standalone part of a CMS project: [FilaPress](https://github.com/rectitude-open/filapress).

Resource | Page | Cluster | Migration | Model | Config | View | Localization
--- | --- | --- | --- | --- | --- | --- | ---
✅ | ❌| ❌ | ✅ | ✅ | ✅ | ❌ | ✅  

## Installation

You can install the package via composer:

```bash
composer require rectitude-open/filament-site-snippets
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-site-snippets-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-site-snippets-config"
```

Optionally, you can publish the translations using

```bash
php artisan vendor:publish --tag="filament-site-snippets-translations"
```

This is the contents of the published config file:

```php
return [
    'filament_resource' => RectitudeOpen\FilamentSiteSnippets\Resources\SiteSnippetResource::class,
    'model' => RectitudeOpen\FilamentSiteSnippets\Models\SiteSnippet::class,
    'navigation_sort' => 0,
    'navigation_icon' => 'heroicon-o-puzzle-piece',
    'editor_component_class' => \Filament\Forms\Components\RichEditor::class,
];
```

## Usage

The package provides a resource page that allows you to view snippets in your Filament admin panel. 

To use the resource page provided by this package, you need to register it in your Panel Provider first.

```php
namespace App\Providers\Filament;

use RectitudeOpen\FilamentSiteSnippets\FilamentSiteSnippetsPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                FilamentSiteSnippetsPlugin::make()
            ]);
    }
}
```

### Retrieving Snippets in Your Application

This package also provides a helper class `RectitudeOpen\FilamentSiteSnippets\FilamentSiteSnippets` to easily retrieve snippet values in your application code (e.g., in your Blade views, controllers, or services).

Here are some common ways to use it:

```php
use RectitudeOpen\FilamentSiteSnippets\FilamentSiteSnippets;

$copyright = FilamentSiteSnippets::get('footer_copyright');
$allSnippets = FilamentSiteSnippets::all();
if(FilamentSiteSnippets::exists('promo_banner_text')) { ... }
```

### Cache Management

Snippets are cached by default to improve performance. You can clear the cache for a specific snippet or all snippets:

```php
// Clear cache for a specific snippet
FilamentSiteSnippets::clearCache('footer_copyright');

// Clear cache for all snippets
FilamentSiteSnippets::clearCache();
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
