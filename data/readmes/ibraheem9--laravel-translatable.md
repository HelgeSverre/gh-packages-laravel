# Laravel Translatable

<p align="center">
<a href="https://packagist.org/packages/ibraheem9/laravel-translatable"><img src="https://img.shields.io/badge/Laravel-10%20|%2011%20|%2012-red.svg" alt="Laravel Version"></a>
<a href="https://packagist.org/packages/ibraheem9/laravel-translatable"><img src="https://img.shields.io/badge/PHP-8.1+-blue.svg" alt="PHP Version"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

![Laravel Translatable Diagram](https://files.manuscdn.com/user_upload_by_module/session_file/310519663367720512/ZeGdRYvBKdBvlEFj.png)

A lightweight, high-performance Laravel package for handling model translations using a column-based approach. 

The power of this package is its simplicity: **just add the `Translatable` trait to your model, and all the translation magic happens automatically.**

## Why Column-Based?

Most translation packages use a separate database table for translations (one-to-many relationship). While flexible, this requires complex joins and slows down your queries. 

This package uses a **column-based approach** (e.g., `title_en`, `title_ar` in the same table). This is significantly faster and easier to query, making it the perfect choice for applications with 2-3 languages. If you need to support many languages (e.g., 10+), a table-based approach might be better, but for most bilingual or trilingual apps, this package offers maximum performance.

## Installation

```bash
composer require ibraheem9/laravel-translatable
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="translatable-config"
```

## How It Works (The Magic)

The package relies on a simple naming convention for your database columns:
`{column_name}_{language_code}` (e.g., `title_en`, `title_ar`).

### 1. Database Migration
Use the provided macros to easily create your translatable columns:

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->translatableString('title');       // Creates: title_en, title_ar
    $table->translatableText('description');   // Creates: description_en, description_ar
    $table->timestamps();
});
```

### 2. The Model
Just use the trait and add the columns to your `$fillable` array. The package will **automatically detect** the translatable columns based on your configuration.

```php
use Illuminate\Database\Eloquent\Model;
use Ibraheem9\Translatable\Traits\Translatable;

class Product extends Model
{
    use Translatable;

    protected $fillable = [
        'title_en', 'title_ar',
        'description_en', 'description_ar',
    ];
}
```

### 3. The Magic Accessor
When you access the base attribute (e.g., `title`), the package automatically checks the global application locale (`app()->getLocale()`) and returns the correct column!

```php
// If app()->getLocale() is 'en'
echo $product->title; // Returns the value of 'title_en'

// If app()->getLocale() is 'ar'
echo $product->title; // Returns the value of 'title_ar'
```

## Configuration

The published config file (`config/translatable.php`) allows you to customize the behavior:

```php
return [
    // The languages your application supports. 
    // These dictate the column suffixes (e.g., _en, _ar)
    'locales' => ['en', 'ar'],

    // The primary language used to auto-detect translatable columns 
    // from your model's $fillable array.
    'primary_locale' => 'en',

    // If a translation is missing in the current language, 
    // it will fallback to the next language in this chain.
    'fallback_chain' => ['ar', 'en'],

    // Automatically detect translatable columns from $fillable
    'auto_detect' => true,
];
```

## Setting the Global Language

The magic accessor relies on Laravel's global locale. You can set this using a Middleware.

### Web Middleware Example
Store the user's language preference in the session:

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        // Read language from session, default to Arabic
        $locale = Session::get('lang', 'ar');
        
        // Set the global app language
        App::setLocale($locale);
        
        return $next($request);
    }
}
```

### API Middleware Example
Read the language from the `Accept-Language` header:

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;

class SetApiLocale
{
    public function handle($request, Closure $next)
    {
        $locale = $request->header('Accept-Language', 'ar');
        
        if (in_array($locale, ['en', 'ar'])) {
            App::setLocale($locale);
        }
        
        return $next($request);
    }
}
```

## Querying Translations

The package provides powerful query scopes to search and sort by translations:

```php
// Search in the current language
Product::whereTranslationLike('title', '%bike%')->get();

// Search across ALL languages simultaneously
Product::whereTranslationLikeAny('title', '%دراجة%')->get();

// Order alphabetically by the current language
Product::orderByTranslation('title', 'asc')->get();
```

## Demo Application

Want to see it in action? Check out the [Laravel Translatable Demo](https://github.com/ibraheem9/laravel-translatable-demo) repository for a complete, working example with a bilingual UI, CRUD operations, and API endpoints.

## License

The MIT License (MIT). Please see the [License File](LICENSE) for more information.
