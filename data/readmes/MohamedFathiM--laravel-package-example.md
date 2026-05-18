# Example Package using laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mohamedfathim/laravel-package-example.svg?style=flat-square)](https://packagist.org/packages/mohamedfathim/laravel-package-example)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mohamedfathim/laravel-package-example/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mohamedfathim/laravel-package-example/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mohamedfathim/laravel-package-example/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/mohamedfathim/laravel-package-example/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mohamedfathim/laravel-package-example.svg?style=flat-square)](https://packagist.org/packages/mohamedfathim/laravel-package-example)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require mohamedfathim/laravel-package-example
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-package-example-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-package-example-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-package-example-views"
```

## Usage

```php
$laravelPackageExample = new Example\LaravelPackageExample();
echo $laravelPackageExample->echoPhrase('Hello, Example!');
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

-   [Mohamed Fathi](https://github.com/MohamedFathiM)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
