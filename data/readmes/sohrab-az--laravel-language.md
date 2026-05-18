# Laravel Language Package

A simple and lightweight language management package for Laravel applications.

This package provides a database-driven approach to manage languages, including default language, active languages, and per-model language assignment.

---

## Features

- Store languages in database
- Define default language
- Enable/disable languages
- Assign language to Eloquent models
- Fluent service API for managing languages
- Built-in Eloquent trait for multilingual relations

---

## Installation

You can install the package via composer:

```bash
composer require sohrab-az/laravel-language
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=language-config
```

config/language.php

```php
return [

    'default' => 'en',

    'supported' => [
        [
            'code' => 'en',
            'name' => 'English',
            'direction' => 'ltr',
            'active' => true
        ],
        [
            'code' => 'fa',
            'name' => 'Persian',
            'direction' => 'rtl',
            'active' => true
        ],
    ],

];
```

## Migration

Run the migrations:

```bash
php artisan migrate
```

This will create a `languages` table and seed it based on your configuration.

## Database Structure

The languages table includes:

- `code` (string, unique)
- `name` (string)
- `direction` (enum: ltr, rtl)
- `is_active` (boolean)
- `is_default` (boolean)
- `meta` (json, nullable)

## Usage

### Language Manager

You can inject `LanguageManager` anywhere in your application:

```php
use Gitmag\Language\Services\LanguageManager;

class ExampleController
{
    public function __construct(protected LanguageManager $languageManager) {}

    public function index()
    {
        $languages = $this->languageManager->all();
        $active = $this->languageManager->active();
        $default = $this->languageManager->default();

        return $languages;
    }
}
```

## Set Default Language

```php
$languageManager->setDefault('fa');
```

## Activate / Deactivate Language

```php
$languageManager->activate('en');
$languageManager->deactivate('fa');
```

## Working with Eloquent Models

Use the `HasLanguage` trait in your model:

```php
use Gitmag\Language\Traits\HasLanguage;

class Post extends Model
{
    use HasLanguage;
}
```

## Assign Language to Model

```php
$post->setLanguage('en')->save();
```

or:

```php
$post->setLanguage($languageModel)->save();
```

## Query by Language

```php
Post::language('en')->get();
Post::language($languageId)->get();
Post::language($languageModel)->get();
```

## Default Language Scope

```php
Post::defaultLanguage()->get();
```

## Helpers

```php
$post->getLanguageCode();

$post->isLanguage('en');
```

## Service Provider

The package automatically registers:

- LanguageManager singleton
- Config file
- Migrations

## License

MIT