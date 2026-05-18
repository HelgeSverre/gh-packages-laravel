# Laravel Testable requests

[![Build Status](https://github.com/markwalet/laravel-testable-requests/workflows/tests/badge.svg)](https://github.com/markwalet/laravel-testable-requests/actions)
[![Total Downloads](https://img.shields.io/packagist/dt/markwalet/laravel-testable-requests)](https://packagist.org/packages/markwalet/laravel-testable-requests)
[![Latest Stable Version](https://img.shields.io/packagist/v/markwalet/laravel-testable-requests)](https://packagist.org/packages/markwalet/laravel-testable-requests)
[![License](https://img.shields.io/packagist/l/markwalet/laravel-testable-requests)](https://packagist.org/packages/markwalet/laravel-testable-requests)

A Laravel package to make request testing easier.

This package is based on [a Gist](https://gist.github.com/colindecarlo/9ba9bd6524127fee7580ae66c6d4709d) from [Colin DeCarlo](https://github.com/colindecarlo).

## Installation
You can install this package with composer:

```shell
composer require --dev markwalet/laravel-testable-requests
```

## Documentation

The documentation is still being worked on. For now, please look at how these classes are used by Colin himself in a [Laracon Online talk in 2021](https://youtu.be/mC-MbQSHWec)

### Changes made in comparison to the video:
- Improved type hinting
- Added `defaultData()` method to the request
- Added `assertFailsValidationFor()` method to the validation result.

## Testing

Run the package test suite with:

```shell
composer test
```
