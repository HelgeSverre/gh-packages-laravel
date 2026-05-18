# Laravel Parameter Tagging Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-parameter-tagging.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-parameter-tagging)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-robots-txt/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-parameter-tagging/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-parameter-tagging/fix-php-code-style-issues.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-parameter-tagging/actions?query=workflow%3A"Fix+PHP+code+style+issues")
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-parameter-tagging.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-parameter-tagging)


This package provides middleware for handling `gclid` and `utm` query parameters in laravel applications.

## Installation

You can install the package via Composer:

```bash
composer require fuelviews/laravel-parameter-tagging
```

### Register Middleware

Register middleware in your app/Http/Kernel.php file.

```php
    // GTM tracking...
    protected $middleware = [
        \Illuminate\Session\Middleware\StartSession::class,
        \Spatie\GoogleTagManager\GoogleTagManagerMiddleware::class,
    ];

    // Query params tracking...
    protected $middlewareGroups = [
        'web' => [
            \Fuelviews\ParameterTagging\Http\Middleware\HandleGclid::class,
            \Fuelviews\ParameterTagging\Http\Middleware\HandleUtm::class,
        ],
    ];
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

- [Thejmitchener](https://github.com/thejmitchener)
- [Fuelviews](https://github.com/fuelviews)
- [All Contributors](../../contributors)

## Support us

Fuelviews is a web development agency based in Portland, Maine. You'll find an overview of all our projects [on our website](https://fuelviews.com).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
