# Laravel vite package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-vite.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-vite)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-vite/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-vite/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-vite/fix-php-code-style-issues.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-vite/actions?query=workflow%3A"Fix+PHP+code+style+issues")
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-vite.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-vite)

Laravel vite package quickly integrates opinionated vite configuration into laravel projects.

## Installation

You can require the package and it's dependencies via composer:

```bash
composer require fuelviews/laravel-vite
```

You can install vite, dotenv, and their dependencies with:

```bash
php artisan vite:install
```

## Usage

You can add @vite directives into the <head> of your layout blade with:

```php
@vite(['resources/css/app.css', 'resources/js/app.js'])
````

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

- [Thejmitchener](https://github.com/thejmitchener)
- [Fuelviews](https://github.com/fuelviews)
- [Vite](https://github.com/vitejs/vite)
- [All Contributors](../../contributors)

## Support us

Fuelviews is a web development agency based in Portland, Maine. You'll find an overview of all our projects [on our website](https://fuelviews.com).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
