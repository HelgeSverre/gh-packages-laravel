# LARAVEL TRIPAY

Package ini digunakan untuk berinteraksi dengan API milik Tripay.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hanzoalpha/laravel-tripay.svg?style=flat-square)](https://packagist.org/packages/hanzoalpha/laravel-tripay)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/hanzoalpha/laravel-tripay/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/hanzoalpha/laravel-tripay/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/hanzoalpha/laravel-tripay/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/hanzoalpha/laravel-tripay/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/hanzoalpha/laravel-tripay.svg?style=flat-square)](https://packagist.org/packages/hanzoalpha/laravel-tripay)

## Installation

You can install the package via composer:

```bash
composer require hanzoalpha/laravel-tripay
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-tripay-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-tripay-config"
```

This is the contents of the published config file:

```php
return [
    'tripay_api_production' => env('TRIPAY_API_PRODUCTION', false),
    'tripay_api_key' => env('TRIPAY_API_KEY'),
    'tripay_private_key' => env('TRIPAY_PRIVATE_KEY'),
    'tripay_merchant_code' => env('TRIPAY_MERCHANT_CODE')
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-tripay-views"
```

## Usage

```php
use HanzoAlpha\LaravelTripay\Networks\HttpClient;
$laravelTripay = new HanzoAlpha\LaravelTripay();
echo $laravelTripay->echoPhrase('Hello, HanzoAlpha!');
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

- [Hanzo Alpha](https://github.com/hanzoalpha)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
