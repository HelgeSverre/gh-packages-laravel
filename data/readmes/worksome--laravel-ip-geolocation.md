# Laravel IP Geolocation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/worksome/laravel-ip-geolocation.svg?style=flat-square)](https://packagist.org/packages/worksome/laravel-ip-geolocation)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/worksome/laravel-ip-geolocation/tests.yml?branch=main&style=flat-square&label=tests)](https://github.com/worksome/laravel-ip-geolocation/actions?query=workflow%3ATests+branch%3Amain)
[![GitHub Static Analysis Action Status](https://img.shields.io/github/actions/workflow/status/worksome/laravel-ip-geolocation/static.yml?branch=main&label=static%20analysis&style=flat-square)](https://github.com/worksome/laravel-ip-geolocation/actions?query=workflow%3A"Static%20Analysis"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/worksome/laravel-ip-geolocation.svg?style=flat-square)](https://packagist.org/packages/worksome/laravel-ip-geolocation)

A driver-based package to handle IP geolocation for Laravel

## Installation

You can install the package via composer:

```bash
composer require worksome/laravel-ip-geolocation
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="ip-geolocation-config"
```

## Usage

```php
use Worksome\IpGeolocation\Facades\IpGeolocation;

/** @var \Worksome\IpGeolocation\DataValues\Location $location */
$location = IpGeolocation::location('2606:4700:4700::1111');

echo $location->country;
echo $location->city;
echo $location->zipcode;
```

### The `about` command

This package adds information to the `artisan about` command. This information can be disabled by setting
the `ip-geolocation.features.about_command` configuration to `false`.

## Testing

```bash
composer test
```

## Changelog

Please see [GitHub Releases](https://github.com/worksome/laravel-ip-geolocation/releases) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Owen Voke](https://github.com/worksome)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
