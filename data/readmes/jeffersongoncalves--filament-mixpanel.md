<div class="filament-hidden">

![Filament Mixpanel](https://raw.githubusercontent.com/jeffersongoncalves/filament-mixpanel/3.x/art/jeffersongoncalves-filament-mixpanel.png)

</div>

# Filament Mixpanel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jeffersongoncalves/filament-mixpanel.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/filament-mixpanel)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/jeffersongoncalves/filament-mixpanel/fix-php-code-style-issues.yml?branch=3.x&label=code%20style&style=flat-square)](https://github.com/jeffersongoncalves/filament-mixpanel/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3A3.x)
[![Total Downloads](https://img.shields.io/packagist/dt/jeffersongoncalves/filament-mixpanel.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/filament-mixpanel)
[![License](https://img.shields.io/packagist/l/jeffersongoncalves/filament-mixpanel.svg?style=flat-square)](LICENSE.md)

Filament plugin for Mixpanel analytics — tracking script injection and Settings Page to manage Mixpanel configuration directly from your Filament panel. Supports Filament v3, v4, and v5.

## Installation

You can install the package via composer:

```bash
composer require jeffersongoncalves/filament-mixpanel
```

This package depends on [jeffersongoncalves/laravel-mixpanel](https://github.com/jeffersongoncalves/laravel-mixpanel) which provides the core Mixpanel analytics integration for Laravel applications.

## Requirements

- PHP 8.2 or higher
- Laravel 11.0 or higher
- Filament 5.0

## Usage

### 1. Register the Plugin

Add the plugin to your `PanelProvider`:

```php
use JeffersonGoncalves\Filament\Mixpanel\MixpanelPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            MixpanelPlugin::make(),
        ]);
}
```

This will automatically:
- Inject the Mixpanel tracking script into your panel
- Add a **Settings Page** to manage your Mixpanel configuration

### 2. Run Settings Migration

If you haven't already, publish the `spatie/laravel-settings` migration to create the `settings` table:

```bash
php artisan vendor:publish --provider="Spatie\LaravelSettings\LaravelSettingsServiceProvider" --tag="migrations"
```

Then publish and run the Mixpanel settings migration:

```bash
php artisan vendor:publish --tag=mixpanel-settings-migrations
php artisan migrate
```

### 3. Manage Settings

Navigate to **Settings > Mixpanel Analytics** in your Filament panel to configure:

- **Project Configuration** — Project Token, API Host, Custom Library URL
- **Tracking & Debug** — Debug Mode, Autocapture, Track Page Views
- **Storage & Cookies** — Persistence method, Cookie Expiration, Secure Cookie, Cross Subdomain
- **Privacy & Geolocation** — IP Geolocation, Property Blacklist, Opt Out by Default, UTM Persistence
- **Advanced Features** — Session Recording percentage, Heatmap Data collection

### Disabling the Settings Page

If you only want the tracking script injection without the settings page:

```php
MixpanelPlugin::make()
    ->settingsPage(false),
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

- [Jefferson Goncalves](https://github.com/jeffersongoncalves)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
