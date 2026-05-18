<div class="filament-hidden">

![Filament Metrics Fathom](https://raw.githubusercontent.com/jeffersongoncalves/filament-metrics-fathom/3.x/art/jeffersongoncalves-filament-metrics-fathom.png)

</div>

# Filament Metrics Fathom

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jeffersongoncalves/filament-metrics-fathom.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/filament-metrics-fathom)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/jeffersongoncalves/filament-metrics-fathom/fix-php-code-style-issues.yml?branch=3.x&label=code%20style&style=flat-square)](https://github.com/jeffersongoncalves/filament-metrics-fathom/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3A3.x)
[![Total Downloads](https://img.shields.io/packagist/dt/jeffersongoncalves/filament-metrics-fathom.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/filament-metrics-fathom)
[![License](https://img.shields.io/packagist/l/jeffersongoncalves/filament-metrics-fathom.svg?style=flat-square)](LICENSE.md)

A [Filament](https://filamentphp.com) plugin that integrates [Fathom Analytics](https://usefathom.com) into your admin panel. Get real-time visitor counts, pageview charts, top pages, referrers, browsers, countries and device breakdowns — all from your Filament dashboard.

## Features

- Settings page to configure Fathom API credentials directly from the panel
- 7 ready-to-use dashboard widgets (stats, charts, tables)
- Real-time visitor count with automatic polling (every 30s)
- Caching built-in to respect Fathom API rate limits (10 req/min)
- Multi-language support (English and Brazilian Portuguese)
- Fully configurable: enable/disable settings page and widgets independently

## Version Compatibility

| Plugin | Filament | Laravel | PHP | Livewire |
|--------|----------|---------|-----|----------|
| 1.x | 3.x | 10.x / 11.x | 8.2+ | 3.x |
| 2.x | 4.x | 11.x+ | 8.2+ | 3.x |
| **3.x** | **5.x** | **11.x+** | **8.2+** | **4.x** |

## Requirements

- PHP 8.2+
- [Filament](https://filamentphp.com) ^5.0
- [jeffersongoncalves/laravel-metrics-fathom](https://github.com/jeffersongoncalves/laravel-metrics-fathom) ^1.0
- [filament/spatie-laravel-settings-plugin](https://filamentphp.com/plugins/filament-spatie-settings) ^5.0

## Installation

You can install the package via composer:

```bash
composer require jeffersongoncalves/filament-metrics-fathom:"^3.0"
```

Publish and run the settings migration from the base package:

```bash
php artisan vendor:publish --tag="metrics-fathom-settings"
php artisan migrate
```

## Setup

Register the plugin in your Filament panel provider:

```php
use JeffersonGoncalves\Filament\MetricsFathom\FathomMetricsPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugin(FathomMetricsPlugin::make());
}
```

## Configuration

You can enable or disable features individually:

```php
FathomMetricsPlugin::make()
    ->settingsPage(false) // Disable the settings page
    ->widgets(false)      // Disable all widgets
```

## Widgets

The plugin provides 7 dashboard widgets:

| Widget | Description | Type |
|--------|-------------|------|
| **Current Visitors** | Real-time visitor count with top pages | Stats Overview (polls every 30s) |
| **Pageviews Chart** | Visits & pageviews over the last 30 days | Line Chart |
| **Top Pages** | Most visited pages with visit/pageview counts | Table |
| **Top Referrers** | Traffic sources with visit/unique counts | Table |
| **Top Browsers** | Browser distribution | Doughnut Chart |
| **Top Countries** | Country distribution with visit/unique counts | Table |
| **Top Devices** | Device type distribution (desktop, mobile, tablet) | Doughnut Chart |

All widgets include:

- Automatic error handling with user-friendly messages
- "Not Configured" state when API token is missing
- Built-in caching to respect Fathom API rate limits
- Multi-language support (English and Portuguese)

## Translations

The plugin supports English (`en`) and Brazilian Portuguese (`pt_BR`). You can publish the translations:

```bash
php artisan vendor:publish --tag="filament-metrics-fathom-translations"
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

- [Jefferson Goncalves](https://github.com/jeffersongoncalves)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
