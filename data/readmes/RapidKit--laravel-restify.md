# Laravel Restify

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rapidkit/laravel-restify.svg?style=flat-square)](https://packagist.org/packages/rapidkit/laravel-restify)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ramaID/laravel-restify/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ramaID/laravel-restify/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ramaID/laravel-restify/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ramaID/laravel-restify/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/rapidkit/laravel-restify.svg?style=flat-square)](https://packagist.org/packages/rapidkit/laravel-restify)

Is a powerful and intuitive package designed to accelerate REST API development within the Laravel ecosystem. With efficient and flexible capabilities, Restify presents an integrated and customizable solution for modern API development. Its seamless integration with Laravel ensures a streamlined experience, making it effortlessly scalable for projects of any size. Gain a development advantage with Laravel Restify — an elegant and feature-rich solution to meet your API needs.

## Installation

You can install the package via composer:

```bash
composer require rapidkit/laravel-restify --dev
```

## Usage

### Setup requirements

```bash
php artisan restify:setup
```

### Generate data object and controller class

```bash
php artisan restify:gen {name}
```

### Generate typescript type

```bash
php artisan typescript:transform
```

## Testing

```bash
composer test
```

### Development

```bash
composer config repositories.laravel-restify '{"type": "path", "url": "/Users/rama/Personal/meta-forge-phpunit/laravel-restify", "options": {"symlink": true}}'
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Qisthi Ramadhani](https://github.com/ramaID)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
