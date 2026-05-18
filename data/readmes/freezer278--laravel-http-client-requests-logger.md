# Package for fast setup for requests and responses logging for laravel http-client-based api clients

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vmorozov/laravel-http-client-requests-logger.svg?style=flat-square)](https://packagist.org/packages/vmorozov/laravel-http-client-requests-logger)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/freezer278/laravel-http-client-requests-logger/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/freezer278/laravel-http-client-requests-logger/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/freezer278/laravel-http-client-requests-logger/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/freezer278/laravel-http-client-requests-logger/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/vmorozov/laravel-http-client-requests-logger.svg?style=flat-square)](https://packagist.org/packages/vmorozov/laravel-http-client-requests-logger)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require vmorozov/laravel-http-client-requests-logger
```

## Usage

In class that uses laravel http client in constructor:

```php
use \VMorozov\LaravelHttpClientRequestsLogger\HttpClientRequestsLogger;

// .....

public function __construct(private HttpClientRequestsLogger $requestsLogger)
{
    $this->requestsLogger->setApiName('some api name');
}
```

In class that uses laravel http client in code that sets request options:
```php
Http::withMiddleware($this->requestsLogger->createLoggingMiddleware());
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

- [Volodymyr Morozov](https://github.com/v.morozov)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
