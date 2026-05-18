# Laravel Array Macros

[![Latest Version on Packagist](https://img.shields.io/packagist/v/t-labs-co/laravel-array-macros.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/laravel-array-macros)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/laravel-array-macros/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/t-labs-co/laravel-array-macros/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/laravel-array-macros/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/t-labs-co/laravel-array-macros/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/t-labs-co/laravel-array-macros.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/laravel-array-macros)

The `Laravel Array Macros` package provides a collection of useful macros for Laravel's Arr helper, extending its functionality to simplify common array operations. These macros are designed to make working with arrays in Laravel more efficient and expressive, reducing boilerplate code and improving readability.

## Why Use This Package?

This package is ideal for developers who frequently work with arrays in Laravel and want to simplify their code. It provides a wide range of macros that cover common use cases, making array manipulation more intuitive and concise.

## Contact Us

(c) T.Labs & Co.
Contact for Work: T. <hongty.huynh@gmail.com>

Got a PHP or Laravel project? We're your go-to team! We can help you:
   - Architect the perfect solution for your specific needs.
   - Get cleaner, faster, and more efficient code.
   - Boost your app's performance through refactoring and optimization.
   - Build your project the right way with Laravel best practices.
   - Get expert guidance and support for all things Laravel.
   - Ensure high-quality code through thorough reviews.
   - Provide leadership for your team and manage your projects effectively.
   - Bring in a seasoned Technical Lead.

## Features

- `firstIf`: Returns the first element of an array if a condition is met.
- `lastIf`: Returns the last element of an array if a condition is met.
- `chunk`: Splits an array into chunks and applies a callback to each chunk.
- `getAnyValues`: Retrieves the first matching value from an array based on a list of keys.
- `hasAllValues`: Checks if all specified values exist in an array.
- `hasAnyValues`: Checks if any of the specified values exist in an array.
- `ifOk`: Returns the array if a condition is met, otherwise returns null.
- `isMissing`: Checks if a key is missing from an array.
- `missing`: Returns a list of keys that are missing from an array.
- `range`: Creates a range of numbers with optional steps.
- `renameKeys`: Renames keys in an array based on a mapping.
- `swap`: Swaps the values of two keys in an array.
- `validate`: Validates all items in an array using a rule or callable.
- `isNumeric`: Checks if all items in an array are numeric. Supports strict mode to ensure only integers and floats are considered numeric.
- `odd`: Filters an array to include only odd numbers. Supports optional sorting in ascending, descending, or no order.
- `even`: Filters an array to include only even numbers. Supports optional sorting in ascending, descending, or no order.

## Installation

You can install the package via composer:

```bash
composer require t-labs-co/laravel-array-macros
```

## Usage

### firstIf

Returns the first element of an array if a condition is met.

```php
$array = [1, 2, 3];
$result = Arr::firstIf($array, true); // Returns 1
```

### lastIf

Returns the last element of an array if a condition is met.

```php 
<?php
$array = [1, 2, 3];
$result = Arr::lastIf($array, true); // Returns 3
```

### chunk

Splits an array into chunks and applies a callback to each chunk.

```php 
<?php
$array = [1, 2, 3, 4, 5, 6];
$result = Arr::chunk($array, 2, fn($chunk) => array_sum($chunk)); // Returns [3, 7, 11]
```

### getAnyValues

Retrieves the first matching value from an array based on a list of keys.

```php 
<?php
$array = ['a' => 1, 'b' => 2, 'c' => 3];
$result = Arr::getAnyValues($array, ['b', 'c']); // Returns 2
```

### hasAnyValues

Checks if any of the specified values exist in an array.

```php
<?php
$array = ['a' => 1, 'b' => 2, 'c' => 3];
$result = Arr::hasAnyValues($array, [2, 4]); // Returns true
```


### hasAllValues

Checks if all specified values exist in an array.

```php
<?php
$array = ['a' => 1, 'b' => 2, 'c' => 3];
$result = Arr::hasAllValues($array, [1, 2]); // Returns true
```

### ifOk

Returns the array if a condition is met, otherwise returns null.

```php
<?php
$array = [1, 2, 3];
$result = Arr::ifOk($array, true); // Returns [1, 2, 3]
```

### missing

Returns a list of keys that are missing from an array.

```php
<?php
$array = ['a' => 1, 'b' => 2];
$result = Arr::missing($array, ['b', 'c']); // Returns ['c']
```

### isMissing

Checks if a key is missing from an array.

```php 
<?php
$array = ['a' => 1, 'b' => 2];
$result = Arr::isMissing($array, 'c'); // Returns true
```

### range

Creates a range of numbers with optional steps.

```php
<?php
$result = Arr::range(1, 5); // Returns [1, 2, 3, 4, 5]
$result = Arr::range(1, 10, 2); // Returns [1, 3, 5, 7, 9]
```

### renameKeys

Renames keys in an array based on a mapping.

```php 
<?php
$array = ['a' => 1, 'b' => 2];
$result = Arr::renameKeys($array, ['a' => 'x', 'b' => 'y']); // Returns ['x' => 1, 'y' => 2]
```

### swap 

Swaps the values of two keys in an array.

```php 
<?php
$array = ['a' => 1, 'b' => 2];
$result = Arr::swap($array, 'a', 'b'); // Returns ['a' => 2, 'b' => 1]
```

### validate

Validates all items in an array using a rule or callable.

```php
<?php
$array = [1, 2, 3];
$result = Arr::validate($array, 'integer'); // Returns true
```

### isNumeric

Checks if all items in an array are numeric. Supports strict mode to ensure only integers and floats are considered numeric.

```php
<?php
$array = [1, '2', 3.5];
$result = Arr::isNumeric($array); // Returns true
$result = Arr::isNumeric($array, true); // Returns false (strict mode)
```

### odd

Filters an array to include only odd numbers. Supports optional sorting in ascending, descending, or no order.

```php
<?php
$array = [1, 2, 3, 4, 5];
$result = Arr::odd($array); // Returns [1, 3, 5] (ascending order)
$result = Arr::odd($array, -1); // Returns [5, 3, 1] (descending order)
$result = Arr::odd($array, 0); // Returns [1, 3, 5] (no sorting)
```

### even

Filters an array to include only even numbers. Supports optional sorting in ascending, descending, or no order.

```php
<?php
$array = [1, 2, 3, 4, 5];
$result = Arr::even($array); // Returns [2, 4] (ascending order)
$result = Arr::even($array, -1); // Returns [4, 2] (descending order)
$result = Arr::even($array, 0); // Returns [2, 4] (no sorting)
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

- [T.](https://github.com/ty-huynh)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
