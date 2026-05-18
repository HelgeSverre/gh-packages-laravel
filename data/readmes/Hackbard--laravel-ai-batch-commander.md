# Laravel AI Batch Commander

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hackbard/laravel-ai-batch-commander.svg?style=flat-square)](https://packagist.org/packages/hackbard/laravel-ai-batch-commander)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/hackbard/laravel-ai-batch-commander/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/hackbard/laravel-ai-batch-commander/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/hackbard/laravel-ai-batch-commander/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/hackbard/laravel-ai-batch-commander/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/hackbard/laravel-ai-batch-commander.svg?style=flat-square)](https://packagist.org/packages/hackbard/laravel-ai-batch-commander)

Laravel package for AI batch API orchestration — zero-config polling, failure strategies, and completion hooks built on top of `laravel/ai`.

## Installation

You can install the package via composer:

```bash
composer require hackbard/laravel-ai-batch-commander
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="batch-commander-config"
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

- [Benjamin Klein](https://github.com/Hackbard)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
