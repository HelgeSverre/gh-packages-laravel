<div class="filament-hidden">

![Laravel Mixpanel](https://raw.githubusercontent.com/jeffersongoncalves/laravel-mixpanel/master/art/jeffersongoncalves-laravel-mixpanel.png)

</div>

# Laravel Mixpanel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jeffersongoncalves/laravel-mixpanel.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/laravel-mixpanel)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/jeffersongoncalves/laravel-mixpanel/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/jeffersongoncalves/laravel-mixpanel/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/jeffersongoncalves/laravel-mixpanel.svg?style=flat-square)](https://packagist.org/packages/jeffersongoncalves/laravel-mixpanel)

This Laravel package seamlessly integrates the [Mixpanel JavaScript SDK](https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript) into your Blade templates. Easily track user interactions, page views, and product usage directly within your Laravel application, with all configuration managed via database settings using [spatie/laravel-settings](https://github.com/spatie/laravel-settings).

## Requirements

- PHP 8.2+
- Laravel 11+
- [spatie/laravel-settings](https://github.com/spatie/laravel-settings) configured (the `settings` table must exist)

## Installation

Install the package via composer:

```bash
composer require jeffersongoncalves/laravel-mixpanel
```

If you haven't already, publish the `spatie/laravel-settings` migration to create the `settings` table:

```bash
php artisan vendor:publish --provider="Spatie\LaravelSettings\LaravelSettingsServiceProvider" --tag="migrations"
```

Then publish and run the Mixpanel settings migration:

```bash
php artisan vendor:publish --tag=mixpanel-settings-migrations
php artisan migrate
```

## Usage

Add the Mixpanel script to your Blade layout (typically before `</head>`):

```blade
@include('mixpanel::script')
```

### Configuring Settings

Settings are stored in the database and can be managed via code:

```php
use JeffersonGoncalves\Mixpanel\Settings\MixpanelSettings;

$settings = app(MixpanelSettings::class);
$settings->project_token = 'YOUR_MIXPANEL_PROJECT_TOKEN';
$settings->save();
```

### Data Residency

Mixpanel supports data residency in the EU and India. Set the `api_host` accordingly:

```php
// EU Data Residency
$settings->api_host = 'https://api-eu.mixpanel.com';
$settings->save();

// India Data Residency
$settings->api_host = 'https://api-in.mixpanel.com';
$settings->save();
```

### Proxy Configuration

To route Mixpanel requests through your own proxy:

```php
$settings->api_host = 'https://proxy.yourdomain.com';
$settings->custom_lib_url = 'https://proxy.yourdomain.com/lib.min.js';
$settings->save();
```

### Available Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `project_token` | `?string` | `null` | Your Mixpanel project token (required for tracking) |
| `api_host` | `?string` | `null` | Custom API endpoint for data residency (EU: `https://api-eu.mixpanel.com`, India: `https://api-in.mixpanel.com`) or proxy |
| `custom_lib_url` | `?string` | `null` | Custom library URL for proxy setups |
| `debug` | `bool` | `false` | Enable debug logging to browser console |
| `autocapture` | `bool` | `true` | Automatically capture clicks, inputs, scrolls, and other user interactions |
| `track_pageview` | `string` | `'true'` | Track page views automatically. Values: `'true'`, `'false'`, `'full-url'`, `'url-with-path-and-query-string'`, `'url-with-path'` |
| `persistence` | `string` | `'cookie'` | Storage method for super properties (`'cookie'` or `'localStorage'`) |
| `cookie_expiration` | `int` | `365` | Cookie lifespan in days |
| `secure_cookie` | `bool` | `false` | Only transmit cookies over HTTPS |
| `cross_subdomain_cookie` | `bool` | `true` | Enable cookie persistence across subdomains |
| `ip` | `bool` | `true` | Use IP address for geolocation data |
| `property_blacklist` | `?string` | `null` | Comma-separated list of properties to exclude from tracking |
| `opt_out_tracking_by_default` | `bool` | `false` | Initialize with tracking disabled (for GDPR/privacy compliance) |
| `stop_utm_persistence` | `bool` | `false` | Disable automatic UTM parameter retention |
| `record_sessions_percent` | `int` | `0` | Percentage of sessions to record (0-100) |
| `record_heatmap_data` | `bool` | `false` | Enable heatmap data collection |

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
