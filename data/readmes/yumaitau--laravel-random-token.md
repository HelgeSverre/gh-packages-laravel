# Laravel Random Token

[![Latest Version on Packagist](https://img.shields.io/packagist/v/yumaitau/laravel-random-token.svg?style=flat-square)](https://packagist.org/packages/yumaitau/laravel-random-token)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/yumaitau/laravel-random-token/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/yumaitau/laravel-random-token/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/yumaitau/laravel-random-token/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/yumaitau/laravel-random-token/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/yumaitau/laravel-random-token.svg?style=flat-square)](https://packagist.org/packages/yumaitau/laravel-random-token)

A simple package to generate random tokens (but safe) tokens to be used in user facing applications.

## Installation

You can install the package via composer:

```bash
composer require yumaitau/laravel-random-token
```

Optionally, you can publish the "bad words" file with:

```bash
php artisan vendor:publish --tag="random-token-translations"
```

## Usage

```php
$token = \YumaIt\RandomToken\RandomToken::generate(); // ABCD12 
```

Optionally, you can pass the length of the token:

```php
$token = \YumaIt\RandomToken\RandomToken::generate(8); // ABCD1234
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.


## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [YumaIT](https://github.com/yumaitau)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
