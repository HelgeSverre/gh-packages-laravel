# Laravel Helpers ⚡

[![Latest Version on Packagist](https://img.shields.io/packagist/v/flavorly/laravel-helpers.svg?style=flat-square)](https://packagist.org/packages/flavorly/laravel-helpers)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/flavorly/laravel-helpers/run-tests?label=tests)](https://github.com/flavorly/laravel-helpers/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/workflow/status/flavorly/laravel-helpers/Check%20&%20fix%20styling?label=code%20style)](https://github.com/flavorly/laravel-helpers/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/flavorly/laravel-helpers.svg?style=flat-square)](https://packagist.org/packages/flavorly/laravel-helpers)


A small, yet powerful package that provides a set of helpers for your Laravel applications.

Helpers Provided:

- `EnumConcern`- A trait that allows you to get list enums, translate enums, compare, etc
- `Contracts` - Register service provider, Macros, Cache, etc
- `Data` - Option Data

## Installation

You can install the package via composer:

```bash
composer require flavorly/laravel-helpers
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="helpers-config"
```

## Testing

```bash
composer test
```

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [jon](https://github.com/flavorly)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
