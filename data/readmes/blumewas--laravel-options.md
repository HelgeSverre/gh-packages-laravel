# A package to create options for Laravel applications

[![Latest Version on Packagist](https://img.shields.io/packagist/v/blumewas/laravel-options.svg?style=flat-square)](https://packagist.org/packages/blumewas/laravel-options)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/blumewas/laravel-options/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/blumewas/laravel-options/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/blumewas/laravel-options/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/blumewas/laravel-options/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/blumewas/laravel-options.svg?style=flat-square)](https://packagist.org/packages/blumewas/laravel-options)



## Installation

You can install the package via composer:

```bash
composer require blumewas/laravel-options
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-options-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-options-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-options-views"
```

## Usage

```php
$variable = new blumewas\LaravelOptions();
echo $variable->echoPhrase('Hello, VendorName!');
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

- [:author_name](https://github.com/:author_username)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
