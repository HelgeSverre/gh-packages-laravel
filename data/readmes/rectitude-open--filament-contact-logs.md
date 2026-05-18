![Filament Contact Logs Banner](./art/Filament%20Contact%20Logs.png)
# Filament Contact Logs

![Do not use](https://img.shields.io/badge/Under%20development-Don't%20use-red)
[![Tests](https://github.com/rectitude-open/filament-contact-logs/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rectitude-open/filament-contact-logs/actions/workflows/run-tests.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen)](https://phpstan.org/)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/rectitude-open/filament-contact-logs.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-contact-logs)
[![Total Downloads](https://img.shields.io/packagist/dt/rectitude-open/filament-contact-logs.svg?style=flat-square)](https://packagist.org/packages/rectitude-open/filament-contact-logs)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/rectitude-open/filament-contact-logs/pulls)

Filament Contact Logs is a Filament plugin designed to display contact form submissions collected from your website. Ideal for "Contact Us" pages or similar modules, it provides a read-only interface for viewing user-submitted information such as name, email, subject, and message.

This package is also a standalone part of a CMS project: [FilaPress](https://github.com/rectitude-open/filapress).

Resource | Page | Cluster | Migration | Model | Config | View | Localization
--- | --- | --- | --- | --- | --- | --- | ---
✅ | ❌| ❌ | ✅ | ✅ | ✅ | ❌ | ✅  


## Installation

You can install the package via composer:

```bash
composer require rectitude-open/filament-contact-logs
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-contact-logs-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-contact-logs-config"
```

Optionally, you can publish the translations using

```bash
php artisan vendor:publish --tag="filament-contact-logs-translations"
```

This is the contents of the published config file:

```php
return [
    'filament_resource' => RectitudeOpen\FilamentContactLogs\Resources\ContactLogResource::class,
    'model' => RectitudeOpen\FilamentContactLogs\Models\ContactLog::class,
    'navigation_sort' => 101,
    'navigation_icon' => 'heroicon-o-envelope-open',
    'datetime_format' => 'Y-m-d H:i:s',
    'navigation_badge' => true,
];
```

## Usage

The package provides a resource page that allows you to view Contact Logs in your Filament admin panel. 

To use the resource page provided by this package, you need to register it in your Panel Provider first.

```php
namespace App\Providers\Filament;

use RectitudeOpen\FilamentContactLogs\FilamentContactLogsPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->plugins([
                FilamentContactLogsPlugin::make()
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
