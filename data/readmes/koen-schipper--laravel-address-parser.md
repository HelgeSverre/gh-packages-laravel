# Laravel Dutch Address Parser

[![Latest Version on Packagist](https://img.shields.io/packagist/v/koenschipper/laravel-address-parser.svg?style=flat-square)](https://packagist.org/packages/koenschipper/laravel-address-parser)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/koenschipper/laravel-address-parser/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/koenschipper/laravel-address-parser/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/koenschipper/laravel-address-parser/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/koenschipper/laravel-address-parser/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/koenschipper/laravel-address-parser.svg?style=flat-square)](https://packagist.org/packages/koenschipper/laravel-address-parser)

A robust and simple Laravel package for parsing Dutch address data. This parser separates street names, house numbers, additions, postcodes, and cities from a single text string, even with complex formats.

## Features

- **Robust parsing**: Supports complex house number additions (e.g., `12 bis`, `12-a`, `12 rood`, `1/2`).
- **Smart recognition**: Works even without spaces between street and house number (e.g., `Kerkstraat12`).
- **Postcodes & Cities**: Recognizes and separates Dutch postcodes (`1234 AB`) and cities.
- **Special Addresses**: Also supports `Postbus` (PO Box) and `Antwoordnummer` formats.
- **Laravel Optimized**: Includes Facade, Helper, Validation Rule, and Artisan Command.
- **Address DTO**: Returns a structured `Address` object that is `Arrayable` and `JsonSerializable`.

## Installation

You can install the package via composer:

```bash
composer require koenschipper/laravel-address-parser
```

You can publish the config file with (optional):

```bash
php artisan vendor:publish --tag="laravel-address-parser-config"
```

## Usage

You can use the parser via the Facade, the helper function, or the Artisan command.

### Usage via Facade

The `LaravelAddressParser::parse()` method returns an `Address` object.

```php
use KoenSchipper\AddressParser\Facades\LaravelAddressParser;

// Full address
$address = LaravelAddressParser::parse('Kerkstraat 1, 1234 AB Amsterdam');

echo $address->street;               // Kerkstraat
echo $address->houseNumber;          // 1
echo $address->houseNumberAddition;  // (empty)
echo $address->fullHouseNumber;      // 1
echo $address->postcode;             // 1234 AB
echo $address->city;                 // Amsterdam

// More complex example
$address = LaravelAddressParser::parse('Laan 1940-1945 10 bis, 1234AB Utrecht');

echo $address->street;               // Laan 1940-1945
echo $address->houseNumber;          // 10
echo $address->houseNumberAddition;  // bis
echo $address->fullHouseNumber;      // 10 bis
echo $address->postcode;             // 1234 AB
echo $address->city;                 // Utrecht
```

### Usage via Helper

For quick access, you can use the helper function:

```php
$address = parse_dutch_address('Kerkstraat 1, 1234 AB Amsterdam');
```

### Street and Number Only (Array)

If you only want the street and the house number as a simple array:

```php
$result = LaravelAddressParser::parseAddress('Kerkstraat 1');
// [
//     'street' => 'Kerkstraat',
//     'house_number' => '1'
// ]
```

### Validation in Laravel

You can use the included validation rule in your Request classes or controllers:

```php
use KoenSchipper\AddressParser\Rules\DutchAddress;

$request->validate([
    'address' => ['required', new DutchAddress],
]);
```

### Artisan Command

Test addresses directly from your terminal:

```bash
php artisan address:parse "Kerkstraat 1, 1234 AB Amsterdam"
```

## Address Object Properties

The `Address` object has the following properties:

- `street`: The street name.
- `houseNumber`: Only the numerical part of the house number.
- `houseNumberAddition`: The addition (e.g., 'bis' or 'a').
- `fullHouseNumber`: House number including addition.
- `postcode`: Formatted postcode (`1234 AB`).
- `city`: The city or place of residence.

The object can also be converted to an array or JSON (with snake_case keys):

```php
$address->toArray();
/*
[
    'street' => 'Kerkstraat',
    'house_number' => '1',
    'house_number_addition' => '',
    'full_house_number' => '1',
    'postcode' => '1234 AB',
    'city' => 'Amsterdam'
]
*/

$address->toJson();
```

## Testing

```bash
composer test
```

## Need a Laravel Developer?

If you're looking for a dedicated Laravel developer to help you with your project, feel free to reach out via my website: [koenschipper.com](https://koenschipper.com).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Koen Schipper](https://github.com/koen-schipper)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
