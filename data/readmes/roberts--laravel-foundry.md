# Laravel package to manage monorepo functions of Foundry

[![Latest Version on Packagist](https://img.shields.io/packagist/v/roberts/laravel-foundry.svg?style=flat-square)](https://packagist.org/packages/roberts/laravel-foundry)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/roberts/laravel-foundry/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/roberts/laravel-foundry/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/roberts/laravel-foundry/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/roberts/laravel-foundry/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/roberts/laravel-foundry.svg?style=flat-square)](https://packagist.org/packages/roberts/laravel-foundry)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require roberts/laravel-foundry
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-foundry-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-foundry-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-foundry-views"
```

## Usage

```php
$laravelFoundry = new Roberts\LaravelFoundry();
echo $laravelFoundry->echoPhrase('Hello, Roberts!');
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

- [Drew Roberts](https://github.com/drewroberts)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
