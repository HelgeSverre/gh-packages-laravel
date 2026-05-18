# The Laravel Package config-walker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/t-labs-co/config-walker.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/config-walker)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/config-walker/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/t-labs-co/config-walker/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/config-walker/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/t-labs-co/config-walker/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/t-labs-co/config-walker.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/config-walker)

This package helps you grab all your data, like **database tables, enum, constants, hard code array, files or settings**, and turns it into a nice, organized hub. It's super handy for keeping things clean and avoiding copy-paste, so you can grab what you need quickly and cut down on extra coding.

## Work with us

We're PHP and Laravel whizzes, and we'd love to work with you! We can:

- Design the perfect fit solution for your app.
- Make your code cleaner and faster.
- Refactoring and Optimize performance.
- Ensure Laravel best practices are followed.
- Provide expert Laravel support.
- Review code and Quality Assurance.
- Offer team and project leadership.
- Delivery Manager 

## Features

- Centralize different config sources into a single hub.
- Support for database tables, enums, constants, hard-coded arrays, files, and settings.
- Easy integration with Laravel models and enums.
- Customizable configuration options.
- Helper functions for accessing and managing configurations.
- Automatically load configurations with Laravel's config system.

## PHP and Laravel Version Support

This package supports the following versions of PHP and Laravel:

- PHP: `^8.2`
- Laravel: `^11.0`, `^12.0`


## Installation

You can install the package via composer:

```bash
composer require t-labs-co/config-walker
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="config-walker-config"
```

## Usage

#### With Model 

Using Model trait `TLabsCo\ConfigWalker\ConfigWalkable` and custom your `walkable` method

```php
// Your Model App\Models\Category
class Category extends Model
{
    use HasFactory;
    use ConfigWalkable;

    // omit the rest 

    // Export book category to config 
    public function walkable(): array
    {
        return self::query()
            ->whereStatus(CategoryStatus::Published)
            ->whereType(CategoryType::Book)
            ->get()
            ->keyBy('slug')
            ->map(function ($cat) {
                return $cat->name;
            })
            ->toArray();
    }

    public function walkerKey(): string
    {
        return "category_" . CategoryType::Book->value;
    }
}

// Using TLabsCo\ConfigWalker\Facades\ConfigWalker to walk your model 
ConfigWalker::walk(Category::class);

// Get the key config with Category
ConfigWalker::get('category_book');

// walk your config Category with Override key and under Tag
ConfigWalker::walk(Category::class, 'book1', 'categories');

// Combine your custom config under Tag
ConfigWalker::walk(['fantasy' => 'Fantasy'], 'book1', 'categories');

// Get config instance under tag categories
$categoriesConfig = ConfigWalker::tag('categories');
// Get custom config key
$categoriesConfig->get('book1');
// Get all
$categoriesConfig->all();

```

#### With Enum

Using Enum trait `TLabsCo\ConfigWalker\EnumConfigWalkable` and custom your `walkable` method

```php

// Enum class
enum CategoryType: string
{
    use EnumConfigWalkable;

    case Post = 'post';
    case Product = 'product';
    case Book = 'book';
    case Page = 'page';
}

// Using TLabsCo\ConfigWalker\Facades\ConfigWalker to walk your Enum with TLabsCo\ConfigWalker\EnumConfigWalkable

ConfigWalker::walk(CategoryType::class);

// Get data from enum CategoryType, by default the key will be dashed case from enum name and without namespace
// For here '\App\Enums\CategoryType' to 'category_type'
ConfigWalker::get('category_type');

```

#### Helper

Using helper function to access config walker - like Laravel built-in `config()`  

```php

// Get Facade TLabsCo\ConfigWalker\Facades\ConfigWalker
config_walker()

// Get config key 
config_walker('your-key');

// Set data when input array
config_walker(['your-key' => 'your-value']);

```

#### Use to access Laravel config 

This package provide serveral ways to load with Laravel config

```php
// Load on fly or from your boot ServiceProvider to auto load from init
ConfigWalker::loadDefault();

// Setting in config-walker.php option
return [
    'loadWithAppConfig' => true
]

// Using default laravel config via ConfigWalker
ConfigWalker::tag('default')->get('key');
// Or 
ConfigWalker::makeDefault()->get('key');

// By default the Laravel will place under `default` group 
// so to get key from config
config('key')
// equal to
config_walker('default.key')

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
