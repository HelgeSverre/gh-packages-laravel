![Filament Ban Manager Banner](./art/Filament%20Ban%20Manager.png)
# Filament Ban Manager

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rectitude-open/filament-ban-manager.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-ban-manager)
[![Tests](https://github.com/rectitude-open/filament-ban-manager/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rectitude-open/filament-ban-manager/actions/workflows/run-tests.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen)](https://phpstan.org/)
[![Total Downloads](https://img.shields.io/packagist/dt/rectitude-open/filament-ban-manager.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-ban-manager)


Filament Ban Manager is a user-friendly plugin that provides complete ban management (both models and IPs) for your Filament panel, built on top of the [Banhammer](https://github.com/mchev/banhammer) package.

This package is also a standalone part of a CMS project: [FilaPress](https://github.com/rectitude-open/filapress).

## Installation

You can install the package via composer:

```bash
composer require rectitude-open/filament-ban-manager
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-ban-manager-migrations"
php artisan migrate
```
> Note: The migrations from the Banhammer package have been integrated and optimized in this plugin, so you do not need to publish Banhammer's migrations separately.

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-ban-manager-config"
```

Optionally, you can publish the config file of the Banhammer package:

```bash
php artisan vendor:publish --provider="Mchev\Banhammer\BanhammerServiceProvider" --tag="config"
```

This is the contents of the published config file:

```php
return [
    'filament_resource' => RectitudeOpen\FilamentBanManager\Resources\BanResource::class,
    'model' => RectitudeOpen\FilamentBanManager\Models\Ban::class,
    'navigation_sort' => 0,
    'navigation_icon' => 'heroicon-o-shield-exclamation',
    'datetime_format' => 'Y-m-d H:i:s',
];
```

Optionally, you can publish the translations using

```bash
php artisan vendor:publish --tag="filament-ban-manager-translations"
```

## Usage

The package provides a Ban resource that allows you to create and delete bans for both models and IP addresses.

To use the resource page provided by this package, you need to register it in your Panel Provider first.

```php
namespace App\Providers\Filament;

use RectitudeOpen\FilamentBanManager\FilamentBanManagerPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                FilamentBanManagerPlugin::make()
            ]);
    }
}    
```

For more advanced ban features, please refer to the documentation of the [Banhammer](https://github.com/mchev/banhammer) package.

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
