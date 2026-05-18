# Laravel Paystack

[![Latest Version on Packagist](https://img.shields.io/packagist/v/njoguamos/laravel-paystack.svg?style=flat-square)](https://packagist.org/packages/njoguamos/laravel-paystack)
![GitHub Actions Test Status](https://img.shields.io/github/actions/workflow/status/njoguamos/laravel-paystack/tests.yml?logo=github&label=Tests)
[![Total Downloads](https://img.shields.io/packagist/dt/njoguamos/laravel-paystack.svg?style=flat-square)](https://packagist.org/packages/NjoguAmos/laravel-paystack)

> [!WARNING]
> This package is still in development and it is not ready for production.

A Laravel package for integrating with Paystack payment gateway.

## Installation

You can install the package via composer:

```bash
composer require njoguamos/laravel-paystack
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="paystack-config"
```

This will publish a `paystack.php` configuration file to your config directory.

Add your Paystack API keys to your `.env` file:

```dotenv
#PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```

## Usage

You can find the documentation at [Documentation Site](https://paystack.njoguamos.me.ke)

## Testing

```bash
composer test
```

## Changelog

Please see [TODO]() for more information on what has changed recently.

## Contributing

Please see [TODO]() for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Njogu Amos](https://github.com/njoguamos)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
