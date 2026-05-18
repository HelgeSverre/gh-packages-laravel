# A laravel first package to utilise the agent discovery protocol

[![Latest Version on Packagist](https://img.shields.io/packagist/v/marchampson/laravel-adp.svg?style=flat-square)](https://packagist.org/packages/marchampson/laravel-adp)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/marchampson/laravel-adp/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/marchampson/laravel-adp/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/marchampson/laravel-adp/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/marchampson/laravel-adp/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/marchampson/laravel-adp.svg?style=flat-square)](https://packagist.org/packages/marchampson/laravel-adp)

This package provides a Laravel middleware that implements the Agent Discovery Protocol (ADP). When enabled, it exposes a `/agent-discovery.json` endpoint that returns a list of all registered routes in your application, including their URIs, HTTP methods, and route names. This is useful for API discovery and documentation purposes.

The middleware can be easily added to your routes or middleware groups to selectively expose route information. The response format follows standard JSON conventions and can be consumed by any HTTP client.

## THIS PACKAGE IS STILL UNDER DEVELOPMENT AND NOT PRODUCTION READY

## Installation

You can install the package via composer:

```bash
composer require marchampson/laravel-adp
```

### Local Development

To test this package in another Laravel project during development:

1. In your Laravel project's `composer.json`, add the local repository:
```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../laravel-adp"
        }
    ]
}
```

2. Then require the package:
```bash
composer require marchampson/laravel-adp
```

This will create a symlink to your local package, allowing you to test changes immediately.

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-adp-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-adp-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-adp-views"
```

## Usage

```php
$laravelAdp = new MarcHampson\LaravelAdp();
echo $laravelAdp->echoPhrase('Hello, Marc Hampson!');
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

- [MarcHampson](https://github.com/marchampson)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
