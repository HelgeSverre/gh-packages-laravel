# Filament Toggle Table Group Action

[![Latest Version on Packagist](https://img.shields.io/packagist/v/christmex/filament-toggle-table-group-action.svg?style=flat-square)](https://packagist.org/packages/christmex/filament-toggle-table-group-action)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/christmex/filament-toggle-table-group-action/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/christmex/filament-toggle-table-group-action/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/christmex/filament-toggle-table-group-action/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/christmex/filament-toggle-table-group-action/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/christmex/filament-toggle-table-group-action.svg?style=flat-square)](https://packagist.org/packages/christmex/filament-toggle-table-group-action)

<div class="filament-hidden">
    <img src="hero-filament-toggle-table-group-action.png" alt="Filament Toggle Table Group Action" width="100%">
</div>

Easily toggle row grouping in your Filament tables

## Installation

You can install the package via composer:

```bash
composer require christmex/filament-toggle-table-group-action
```

> [!IMPORTANT]
> If you have not set up a custom theme and are using Filament Panels follow the instructions in the [Filament Docs](https://filamentphp.com/docs/4.x/styling/overview#creating-a-custom-theme) first.

After setting up a custom theme add the plugin's views to your theme css file or your app's css file if using the standalone packages.

```css
@source '../../../../vendor/christmex/filament-toggle-table-group-action/resources/**/*.blade.php';
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-toggle-table-group-action-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-toggle-table-group-action-config"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="filament-toggle-table-group-action-views"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
use Christmex\FilamentToggleTableGroupAction\Actions\ToggleTableGroupAction;
//...
->toolbarActions([
    ToggleTableGroupAction::make()
])
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

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [christmex](https://github.com/christmex)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
