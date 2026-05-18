# Nomi.ai Laravel Wrapper for PHP Library

[![Latest Version on Packagist](https://img.shields.io/packagist/v/oliverearl/nomiai-php-laravel.svg?style=flat-square)](https://packagist.org/packages/oliverearl/nomiai-php-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/oliverearl/nomiai-php-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/oliverearl/nomiai-php-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/oliverearl/nomiai-php-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/oliverearl/nomiai-php-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/oliverearl/nomiai-php-laravel.svg?style=flat-square)](https://packagist.org/packages/oliverearl/nomiai-php-laravel)

This is a wrapper for the [Nomi.ai PHP library](https://github.com/oliverearl/nomiai-php) for easy integration into
Laravel applications. [Nomi.ai](https://www.nomi.ai) is a companionship application that uses artificial intelligence.

You will need at least PHP 8.3 with the JSON extension, and Laravel 11 or above.

## Installation

You can install the package via composer:

```bash
composer require oliverearl/nomiai-php-laravel
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="nomiai-php-laravel-config"
````

## Usage

To get started, you simply need to add your Nomi.ai API key to your `.env.` file under `NOMIAI_API_KEY`. You can also
provide a custom endpoint under `NOMIAI_ENDPOINT` if you need this functionality.

From here, you can access the Nomi.ai PHP library using its facade. Laravel will automatically use your default
HTTP library, however that might be configured.

```php
use \Nomiai\PhpSdk\Laravel\Facades\NomiAI;

/** @var array<int, \Nomiai\PhpSdk\Resources\Nomi> $nomis */
$nomis = NomiAI::getNomis();

$conversation = NomiAi::sendMessageToNomi(collect($nomis)->first(), 'Hello Nomi!');
```

Please check the PHP library documentation for more information on available functionality.

## Testing

Tests are run using the [Pest](https://pestphp.com/) testing framework. You can run the suite like so:

```bash
composer test
```

## Code Style

Laravel Pint is used to maintain the PER coding style. The linter can be run using:

```bash
composer format
```

There are Pest architecture tests that also attempt to maintain certain conventions, including the use of strict
typing where possible.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Your contributions are warmly welcomed! Anything from documentation, to optimisations, and additional tests. Pull requests must pass the existing test suite and conform to the required code style.

For new functionality, adequate tests must be included!

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md) for responsible disclosure procedures.

## Credits

- [Oliver Earl](https://github.com/oliverearl)
- [Nomi.ai](https://www.nomi.ai)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
