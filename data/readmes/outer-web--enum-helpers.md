![Enum helpers](./docs/images/github-banner.png)

# Enum helpers

[![Latest Version on Packagist](https://img.shields.io/packagist/v/outerweb/enum-helpers.svg?style=flat-square)](https://packagist.org/packages/outerweb/enum-helpers)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/outerweb/enum-helpers/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/outer-web/enum-helpers/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/outerweb/enum-helpers/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/outer-web/enum-helpers/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/outerweb/enum-helpers.svg?style=flat-square)](https://packagist.org/packages/outerweb/enum-helpers)

This package provides a set of traits you can use to extend the functionality of your enums in Laravel.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Changelog](#changelog)
-   [License](#license)

## Installation

You can install the package via composer:

```bash
composer require outerweb/enum-helpers
```

## Usage

### Collection support

Add the following trait to your backed enum to get collection support:

```php
use Outerweb\EnumHelpers\HasCollectionSupport;

enum MyEnum: string
{
    use HasCollectionSupport;

    case Foo = 'foo';
    case Bar = 'bar';

    public function getLabel(): string
    {
        return match ($this) {
            self::Foo => 'Foo label',
            self::Bar => 'Bar label',
        };
    }
}
```

This allows you to collect enum cases easily into a Laravel collection:

```php
$collection = MyEnum::collect(); // Collection{'foo' => MyEnum::Foo, 'bar' => MyEnum::Bar}
```

### Getting a collection of values

You can get a collection of enum values using the `collect('value')` method:

```php
$values = MyEnum::collect('value'); // Collection{'foo' => 'foo', 'bar' => 'bar'}
```

### Getting a collection of return values of a function

You can get a collection of return values of a function by passing the function name to the `collect()` method:

```php
$mapped = MyEnum::collect('getLabel'); // Collection{'foo' => 'Foo label', 'bar' => 'Bar label'}
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
