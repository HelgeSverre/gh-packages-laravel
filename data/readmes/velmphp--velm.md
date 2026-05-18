# Velm

A Composable, JIT-Compiled Modular Framework for Laravel. Develop with no strings attached!

[![Latest Version on Packagist](https://img.shields.io/packagist/v/velm/velm.svg?style=flat-square)](https://packagist.org/packages/velm/velm)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/velmphp/velm/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/velmphp/velm/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/velmphp/velm/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/velmphp/velm/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/velm/velm.svg?style=flat-square)](https://packagist.org/packages/velm/velm)

Velm is a runtime composition framework for Laravel that lets you build logical models and services whose behavior is composed dynamically from multiple classes across packages and modules. Instead of inheritance, traits, or static overrides, Velm uses pipelines to determine how behavior is executed at runtime. It is heavily inspired by Odoo

## Installation

You can install the package via composer:

```bash
composer require velm/velm
```

Then run the installation command

```bash
php artisan velm:install
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="velm-config"
```

## Documentation
Visit the [Documentation](https://velm.vercel.app) for more details on how to use Velm and its features.

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

- [Samson Maosa](https://github.com/coolsam726)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
