# This is my package laravel-gtag

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vitorbizarra/laravel-gtag.svg?style=flat-square)](https://packagist.org/packages/vitorbizarra/laravel-gtag)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/vitorbizarra/laravel-gtag/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/vitorbizarra/laravel-gtag/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/vitorbizarra/laravel-gtag.svg?style=flat-square)](https://packagist.org/packages/vitorbizarra/laravel-gtag)

An package to easily setup Google GTag in Laravel apps

## Installation

You can install the package via composer:

```bash
composer require vitorbizarra/laravel-gtag
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-gtag-config"
```

This is the contents of the published config file:

```php
return [
    /*
     * The Google Analytics id, should be a code that looks something like "G-xxxx".
     */
    'id' => env('GTAG_ID', ''),

    /*
     * Enable or disable script rendering. Useful for local development.
     */
    'enabled' => env('GTAG_ENABLED', true),

    /*
     * Configures the Google Analytics script domain.
     */
    'domain' => env('GTAG_DOMAIN', 'www.googletagmanager.com'),
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-gtag-views"
```

## Usage

```html
{{-- layout.blade.php --}}
<head>
  @include('gtag::script')
  {{-- ... --}}
</head>
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

## Credits

- [Vitor Bizarra](https://github.com/vitorbizarra)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
