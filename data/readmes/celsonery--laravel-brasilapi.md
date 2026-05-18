# Laravel BrasilApi Package - By Celso Nery
## A little package utility to work with Brasil Api services

[![Maintainer](http://img.shields.io/badge/maintainer-@celsonery-blue.svg?style=flat-square)](https://twitter.com/celsonery)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/celsonery/laravel-brasilapi.svg?style=flat-square)](https://packagist.org/packages/celsonery/laravel-brasilapi)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/celsonery/laravel-brasilapi/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/celsonery/laravel-brasilapi/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/celsonery/laravel-brasilapi/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/celsonery/laravel-brasilapi/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/celsonery/laravel-brasilapi.svg?style=flat-square)](https://packagist.org/packages/celsonery/laravel-brasilapi)

## Installation

You can install the package via composer:

```bash
composer require celsonery/brasilapi
```

You can publish the config file with:

```bash
php artisan brasilapi:install
```
or 

```bash
php artisan vendor:publish --tag="brasilapi-config"
```

This is the contents of the published config file:

```php
return [
    base_url => env('BASE_URL', 'https://brasilapi.com.br/api')
];
```

## Usage

- Via Facade

```php
use CelsoNery\BrasilApi\Facades\BrasilApi;

$response = BrasilApi::cep('00100001');

return $response;
```

- Via DI
```php
use CelsoNery\BrasilApi\BrasilApiService;

public function index(BrasilApiService $service)
{
    return $service->cep('00100001');
}
```

## Testing

```bash
composer tests
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Celso Nery](https://github.com/celsonery)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
