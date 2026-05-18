# Laravel Google Product Categories is a package for Laravel providing Google’s Product Categories to your app.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jwcobb/laravel-google-product-categories.svg?style=flat-square)](https://packagist.org/packages/jwcobb/laravel-google-product-categories)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/jwcobb/laravel-google-product-categories/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/jwcobb/laravel-google-product-categories/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/jwcobb/laravel-google-product-categories/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/jwcobb/laravel-google-product-categories/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/jwcobb/laravel-google-product-categories.svg?style=flat-square)](https://packagist.org/packages/jwcobb/laravel-google-product-categories)

This package provides [migrations](database/migrations) and a [Model](src/Models/GoogleProductCategory.php) for [Google Product Categories](https://support.google.com/merchants/answer/6324436?hl=en) so that you can easily use them in your app.

## Installation

You can install the package via composer:

```bash
composer require jwcobb/laravel-google-product-categories
```

You can run the installer using:

```bash
php artisan google-product-categories:install
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="google-product-categories-migrations"
php artisan migrate
```


## Usage
You can use `JWCobb\LaravelGoogleProductCategories\Models\GoogleProductCategory` directly or you may choose to extend it using your own model if you wish to add additional relationships.
```php
namespace App\Models;

use JWCobb\LaravelGoogleProductCategories\Models\GoogleProductCategory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends GoogleProductCategory
{
    protected $table = 'google_product_categories';
    
    public function products(): HasMany
    {
        return $this->hasMany(__CLASS__, 'product_category_id');
    }

}
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

- [J Cobb](https://github.com/jwcobb)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
