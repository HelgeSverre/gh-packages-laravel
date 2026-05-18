# Package for intengation with Pago

[![Latest Version on Packagist](https://img.shields.io/packagist/v/inisiatif/laravel-pago.svg?style=flat-square)](https://packagist.org/packages/atInisiatifZakat/laravel-pago)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/atInisiatifZakat/laravel-pago/run-tests?label=tests)](https://github.com/atInisiatifZakat/laravel-pago/actions?query=workflow%3A%22Running+phpunit%22+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/workflow/status/atInisiatifZakat/laravel-pago/Fix%20PHP%20code%20style%20issues?label=code%20style)](https://github.com/atInisiatifZakat/laravel-pago/actions?query=branch%3Amain+workflow%3A%22Running+ECS%22)
[![Total Downloads](https://img.shields.io/packagist/dt/atInisiatifZakat/laravel-pago.svg?style=flat-square)](https://packagist.org/packages/inisiatif/laravel-pago)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require inisiatif/laravel-pago
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="pago-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="pago-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$laravelPago = new Pago\LaravelPago();
echo $laravelPago->echoPhrase('Hello, Pago!');
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

- [Nuradiyana](https://github.com/atInisiatifZakat)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
