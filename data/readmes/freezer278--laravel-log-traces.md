# Logs tracing for laravel framework

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vmorozov/laravel-log-traces.svg?style=flat-square)](https://packagist.org/packages/vmorozov/laravel-log-traces)
[![Tests](https://img.shields.io/github/actions/workflow/status/freezer278/laravel-log-traces/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/freezer278/laravel-log-traces/actions/workflows/run-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/vmorozov/laravel-log-traces.svg?style=flat-square)](https://packagist.org/packages/vmorozov/laravel-log-traces)

A Laravel package for providing log tracing (trace ids and span ids) in your Laravel application.  
This package makes it easy to debug your application by providing a way to trace logs for specific api requests or console commands and identify issues.

## Installation

1. Install the package via composer:

```bash
composer require vmorozov/laravel-log-traces
```
2. Publish vendor files:
```bash
php artisan vendor:publish --provider="VMorozov\\LaravelLogTraces\\LogTracesServiceProvider"
```

## Upgrading version
1. Update the package version in `composer.json`
2. Run 
```bash
composer update vmorozov/laravel-log-traces
```

## Usage

This package provides a middleware that adds trace ids to the logs and console commands.  
It adds a `trace_id` field and `span_id` field to the log context to identify current trace and span of app execution in the logs.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/spatie/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Vladimir Morozov](https://github.com/vmorozov)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
