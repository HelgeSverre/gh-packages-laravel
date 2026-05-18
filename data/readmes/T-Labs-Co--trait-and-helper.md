# This package provides a collection of useful traits and helper functions to enhance your Laravel applications

[![Latest Version on Packagist](https://img.shields.io/packagist/v/t-labs-co/trait-and-helper.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/trait-and-helper)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/trait-and-helper/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/t-labs-co/trait-and-helper/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/t-labs-co/trait-and-helper/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/t-labs-co/trait-and-helper/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/t-labs-co/trait-and-helper.svg?style=flat-square)](https://packagist.org/packages/t-labs-co/trait-and-helper)

This package provides a collection of useful traits and helper functions to enhance your Laravel applications. It includes traits for array access, bulk deletion, and more, making it easier to manage common tasks in your projects.

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

- `HasArrayAccessTrait`: Provides array-like access to object properties.
- `ReadOnlyTrait`: Protects models from being modified
- `BulkDeleteTrait`: Simplifies bulk deletion of Eloquent models with transaction support.
- `AutoFillableTrait`: Automatically with mass assignment only attributes from table data.
- `EnumHelperTrait`: Provides helper methods for working with PHP enums. 
- `PropertyConfigurable`: Alows you to manage dynamic configurations stored in attributes like settings or extras. It provides methods for accessing, updating, and caching configuration values, making it easy to work with flexible data structures in your models.
- Additional helper functions to streamline common tasks.

## PHP and Laravel Version Support

This package supports the following versions of PHP and Laravel:

- PHP: `^8.2`
- Laravel: `^11.0`, `^12.0`

## Installation

You can install the package via composer:

```bash
composer require t-labs-co/trait-and-helper
```

## Usage

```php
###
# HasArrayAccessTrait
###
class DataObject implements \ArrayAccess
{
    use HasArrayAccessTrait;

    protected $options;
    
    public function __construct($initData = [])
    {
        $this->options = $initData;
    }

    protected function arrayDataKey()
    {
        return 'options';
    }
}

// using 
$dataObject = new DataObject();
$dataObject->get($key);
$dataObject->set($key, $value);
$dataObject->has($key);

### 
# ReadOnlyTrait
# This simply protection for your read model
### 

class Category extends Model
{
    use HasFactory;
    use ReadOnlyTrait;
    // ...

}

// using
// if you get $category->save();
// this will throw an exception: Can not save the read-only model Category

// We can enable or disable read only on the fly 
$category->disableReadOnly()->save();



###
# BulkDeleteTrait
# this simply using transaction and make delete model with event trigger 
###

class Category extends Model
{
    use HasFactory;
    use BulkDeleteTrait;
    //...
}

// Using simple delete
Category::deletes(Category::where('name', 'unknown'));
Category::deletes($category);
Category::deletes($categoryCollection);
Category::deletes(Category::where('name', 'unknown')->get());

// Force delete
Category::forceDeletes(Category::where('name', 'unknown'));
// delete quitely
Category::deletesQuietly(Category::where('name', 'unknown'));


###
# AutoFillableTrait
# this trait automatically popular mass assignment only attributes from table columns.
###

class Category extends Model
{
    use HasFactory;
    use AutoFillableTrait;
    //...
    // this model don't need to config $fillable attributes it will auto fetch from database table and perform mass-assignment
}
// using 
$category = new Category();
$category->fill($data); // 
$category->save();

```

###
# PropertyConfigurable
# This trait allows you to manage dynamic configurations stored in attributes like settings or extras. It provides methods for accessing, updating, and caching configuration values, making it easy to work with flexible data structures in your models.
###

Add using trait `PropertyConfigurable`

```php
// 
class Product extends Model
{
    use PropertyConfigurable;

    // Make `settings` and `extras` fillable
    protected $fillable = [
        'name',
        'settings',
        'extras',
    ];

    // Add `settings` and `extras` to casts
    protected $casts = [
        'settings' => 'array',
        'extras' => 'array',
    ];

    // Optionally, override the property config key
    protected $propertyConfigKey = 'settings';

    // Or define a custom config key getter
    protected function getPropertyConfigKey()
    {
        return 'settings';
    }
}

Using the config in application

```php
$product = Product::find(1);

// Access the `settings` configuration
$config = $product->config();
$value = $config->get('key'); // Get a specific key from settings
```

You can update the configuration values dynamically.

```php
$product = Product::find(1);

// Update a specific key in the `settings` configuration
$product->config()->set('key', 'new value');

// Save the changes
$product->save();
```

Clearing Cached Configurations

```php 
// You can clear the cached configuration values if needed.
$product = Product::find(1);

// Clear the cached configuration
$product->clearConfigCached();
```

Using a Custom Config Attribute

```php
class Product extends Model
{
    use PropertyConfigurable;

    protected $fillable = ['name', 'settings', 'extras'];
    protected $casts = ['settings' => 'array', 'extras' => 'array'];

    public function getExtrasAttribute()
    {
        return $this->config()->makePropertyConfig($this, 'extras');
    }
}

// Access the `extras` configuration
$product = Product::find(1);
$extras = $product->extras->get('extra_key');
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

- [T.Labs & Co](https://github.com/t-labs-co)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
