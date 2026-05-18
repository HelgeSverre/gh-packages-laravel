# Laravel Marking, Just Mark it

[![Latest Version on Packagist](https://img.shields.io/packagist/v/t-labs-co/laravel-marking.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/laravel-marking)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/laravel-marking/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/t-labs-co/laravel-marking/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/t-labs-co/laravel-marking.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/laravel-marking)

Laravel Marking is a flexible package for managing and normalizing marks in Laravel applications. It provides tools for marking, classification, normalization, and customizable configurations to streamline your application's marking system.

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

This package is extend and support all feature like tagging package, 

- `Mark Management`: Easily manage marks with a flexible and extensible structure.
- `Classification Support`: Classify marks into different categories for better organization.
- `Normalization`: Normalize mark values using customizable normalization logic.
- `Customizable Configurations`: Fully configurable via the marking configuration file.
- `Morphable Relationships`: Supports polymorphic relationships for marking multiple models.
- `Value Casting`: Automatically cast mark values based on their classification.

## Support PHP and Laravel Version

This package supports the following versions:

- **PHP**: `^8.2` or higher
- **Laravel**: `^11.0` or higher

## Installation

You can install the package via composer:

```bash
composer require t-labs-co/laravel-marking
```

You can publish the migrations and config with:

```bash
php artisan vendor:publish --provider="TLabsCo\LaravelMarking\MarkingServiceProvider"
```

The config `marking.php` content:

```php
return [
    'delimiters' => ',;',
    'glue' => ',',
    'classifications' => array_merge(
        ['general'],
        Arr::dot(explode(',', env('LARAVEL_MARKING_CLASSIFICATIONS', '')))
    ),
    'default_classification' => env('LARAVEL_MARKING_CLASSIFICATION_DEFAULT', 'general'),
    'default_value' => env('LARAVEL_MARKING_VALUE_DEFAULT', 1), // using to count or sum point
    'values_caster' => [
        'general' => 'strval', //
    ],
    'normalizer' => 'snake_case',
    'connection' => null,
    'throwEmptyExceptions' => false,
    'markedModels' => [],
    'model' => \TLabsCo\LaravelMarking\Models\Mark::class,
    'tables' => [
        'marking_marks' => 'marking_marks',
        'marking_markables' => 'marking_markables',
    ],
];
```

## Usage

### Add trait to your Models

Your models should use the Markable trait:

```php
use TLabsCo\LaravelMarking\Models\Markable;

class MyModel extends Eloquent
{
    use Markable;
}
```

### Adding and Removing Mark from a Model

Mark your models with the `marking()` method:

```php
// Pass in a delimited string:
$model->marking('Coffee,Cake,Fruit');

// Or an array:
$model->marking(['Coffee', 'Cake', 'Fruit']);
```

You can remove marks individually with `unmarking()` or entirely with `demarking()`:

```php
$model->marking('Coffee,Cake,Fruit');

$model->unmarking('Fruit');
// $model is now just marked with "Coffee" and "Cake"

$model->demarking();
// $model has no marks anymore
```

### Apply classification your marks

Config your classification from config file `marking.php`

```php
  'classifications' => ['general', 'drink', 'food']
```

Mark your models with your desired classification

```php
// Pass in a delimited string:
$model->marking('Cake,Fruit', classification: 'food');

// Or an array:
$model->marking(['Coffee'], classification: 'drink');
```

### Save the value to your marks

Config your value caster depend by classification from config file `marking.php`

```php
  'values_caster' => [
      'food' => 'intval', //
  ],
```

Mark your models with your desired value

```php
// Pass in a delimited string:
$model->marking('Fruit', ['value' => 2], classification: 'food');

// Or an array:
$model->marking([['name' => 'Coffee', 'value' => 2]], classification: 'drink');

// Or an array:
$model->marking(['Coffee' =>  ['value' => 2]], classification: 'drink');
```

### Interact with the value from your marks

Your models should use the `Markable` and `InteractMarkableValue` trait:

```php
use TLabsCo\LaravelMarking\Models\Markable;
use TLabsCo\LaravelMarking\Models\InteractMarkableValue;

class MyModel extends Eloquent
{
    use Markable;
    use InteractMarkableValue;
}
```

You also add value to your mark

```php
// Get values map by classification
$model->getMarkingValuesMap('food'); // ['Cake' => 1, 'Fruit' => 2]

// Sum vallues map by classification
$model->sumMarkingValues('food'); // 3

// Update or Add your mark with value in particular classification
$model->updateMarkingValue('Cake', 5, 'food'); // 'Cake' => 5

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
