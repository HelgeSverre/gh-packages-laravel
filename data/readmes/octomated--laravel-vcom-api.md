# Easily access meteocontrol's VCOM-API in your laravel projects

[![Latest Version on Packagist](https://img.shields.io/packagist/v/octomated/laravel-vcom-api.svg?style=flat-square)](https://packagist.org/packages/octomated/laravel-vcom-api)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/octomated/laravel-vcom-api/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/octomated/laravel-vcom-api/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/octomated/laravel-vcom-api/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/octomated/laravel-vcom-api/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/octomated/laravel-vcom-api.svg?style=flat-square)](https://packagist.org/packages/octomated/laravel-vcom-api)

This is a laravel package making your meteocontrol data accessible with minimal configuration.

## Installation

You can install the package via composer:

```bash
composer require octomated/laravel-vcom-api
```

You can optionally publish the config file with:

```bash
php artisan vendor:publish --tag="vcom-api-config"
```

The contents of the published config file:

```php
return [
    'url' => env('MC_VCOM_API_URL', 'https://api.meteocontrol.de'),
    'username' => env('MC_VCOM_API_USERNAME'),
    'password' => env('MC_VCOM_API_PASSWORD'),
    'api_key' => env('MC_VCOM_API_KEY'),
    'auth_mode' => env('MC_VCOM_API_AUTH_MODE', 'oauth'),
];
```

Install this package, set your username, password and api key in your environment file, and you're good to go.
```bash
MC_VCOM_API_USERNAME=
MC_VCOM_API_PASSWORD=
MC_VCOM_API_KEY=
```

## Usage

```php
// let the dependency injection take care of resolving and configuring your VCOM-API client
// __construct(VcomApi $vcomApi)
// or make use of the facade for quick access
dump(VcomApi::systems()->get());

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

- [octomated](https://github.com/octomated)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
