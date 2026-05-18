# laravel-dashboard-plausible-tile

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kilobyteno/laravel-dashboard-plausible-tile.svg?style=flat-square)](https://packagist.org/packages/kilobyteno/laravel-dashboard-plausible-tile)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/kilobyteno/laravel-dashboard-plausible-tile/run-tests?label=tests)](https://github.com/kilobyteno/laravel-dashboard-plausible-tile/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/kilobyteno/laravel-dashboard-plausible-tile.svg?style=flat-square)](https://packagist.org/packages/kilobyteno/laravel-dashboard-plausible-tile)

A simple tile for showing Plausible analytics within for your dashboard.

This tile can be used on [the Laravel Dashboard](https://docs.spatie.be/laravel-dashboard).

![Screenshot 2022-05-30 at 21-27-06 Dashboard](https://user-images.githubusercontent.com/9788214/171050657-949908e9-ae7b-410c-910a-da5f7121be33.png)

## Installation

You can install the package via composer:

```bash
composer require kilobyteno/laravel-dashboard-plausible-tile
```

Publish config for [laravel-plausible](https://github.com/kilobyteno/laravel-plausible):

```bash
php artisan vendor:publish --tag="plausible-config"
```

Open `config/plausible.php` and add your Plausible API Key.

Then add this to `config/dashboard.php` under the `tile` key:
```php
'plausible' => [
    'refresh_interval_in_seconds' => 60,
    'domains' => [
        'kilobyte.no',
        'example.com',
    ],
],
```

Under "schedule" in `kernel.php` add:
```php
$schedule->command(FetchDataFromPlausibleCommand::class)->everyMinute();
```

## Usage

In your dashboard view you use the `livewire:plausible-tile` component.

```html
<x-dashboard>
    <livewire:plausible-tile position="a1:a8" />
</x-dashboard>
```

## Customizing the view

If you want to customize the view used to render this tile, run this command:

```bash
php artisan vendor:publish --provider="Kilobyteno\PlausibleTile\PlausibleTileServiceProvider" --tag="dashboard-plausible-tile-views"
```

## Testing

``` bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Kilobyte AS](https://github.com/kilobyteno)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
