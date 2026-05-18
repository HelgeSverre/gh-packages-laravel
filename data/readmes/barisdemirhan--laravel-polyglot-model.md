<div align="center">

# Laravel Polyglot Model

[![Latest Version on Packagist](https://img.shields.io/packagist/v/barisdemirhan/laravel-polyglot-model.svg?style=flat-square)](https://packagist.org/packages/barisdemirhan/laravel-polyglot-model)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/barisdemirhan/laravel-polyglot-model/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/barisdemirhan/laravel-polyglot-model/actions?query=workflow%3A"Run+Tests"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/barisdemirhan/laravel-polyglot-model.svg?style=flat-square)](https://packagist.org/packages/barisdemirhan/laravel-polyglot-model)
[![License](https://img.shields.io/packagist/l/barisdemirhan/laravel-polyglot-model.svg?style=flat-square)](LICENSE.md)

**Elegant model translations for Laravel with polymorphic storage and eager loading support.**

[Documentation](https://barisdemirhan.github.io/laravel-polyglot-model) · [Report Bug](https://github.com/barisdemirhan/laravel-polyglot-model/issues) · [Request Feature](https://github.com/barisdemirhan/laravel-polyglot-model/issues)

</div>

---

## ✨ Features

- 🚀 **Simple API** - Intuitive trait-based approach
- 🔄 **Polymorphic Storage** - Single translations table for all models
- ⚡ **Eager Loading** - Optimized for performance with relationship loading
- 🎯 **Magic Getters** - Access translations like regular attributes
- 🔍 **Query Scopes** - Search across translated fields
- 💾 **Caching** - Built-in cache support for better performance
- 🎭 **Events** - Hooks for translation create/update/delete

## 📋 Requirements

- PHP 8.1+
- Laravel 10.x, 11.x, or 12.x

## 📦 Installation

```bash
composer require barisdemirhan/laravel-polyglot-model
```

Publish and run migrations:

```bash
php artisan vendor:publish --tag="polyglot-model-migrations"
php artisan migrate
```

Optionally publish the config file:

```bash
php artisan vendor:publish --tag="polyglot-model-config"
```

## 🚀 Quick Start

### 1. Add the trait to your model

```php
<?php

namespace App\Models;

use PolyglotModel\Contracts\TranslatableContract;
use PolyglotModel\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Post extends Model implements TranslatableContract
{
    use HasTranslations;

    protected array $translatableFields = [
        'title',
        'slug',
        'content',
    ];
}
```

### 2. Set and get translations

```php
// Create a post
$post = Post::create([
    'title' => 'Hello World',
    'slug' => 'hello-world',
]);

// Set translations
$post->setTranslate('title', 'tr', 'Merhaba Dünya');
$post->setTranslate('title', 'de', 'Hallo Welt');

// Get translations
$post->getTranslate('title', 'tr'); // "Merhaba Dünya"

// Magic getter (uses current locale)
App::setLocale('tr');
$post->title; // "Merhaba Dünya"
```

### 3. Query translations

```php
// Search in translated field
Post::searchTranslatable('title', 'Merhaba', 'tr')->get();

// Get posts with complete translations
Post::hasAllRequiredFieldsForLocaleScope('tr')->get();
```

## 🛠️ Available Methods

| Method                                  | Description            |
| --------------------------------------- | ---------------------- |
| `setTranslate($field, $locale, $value)` | Set translation        |
| `getTranslate($field, $locale)`         | Get translation        |
| `hasTranslation($field, $locale)`       | Check if exists        |
| `getAllTranslations()`                  | Get all as array       |
| `setPreferredLanguage($locale)`         | Set preferred language |

## ⚙️ Configuration

```php
// config/polyglot-model.php
return [
    'source_locale' => 'en',
    'fallback_locale' => 'en',
    'supported_locales' => ['en', 'tr', 'de', 'es', 'fr'],
    'cache' => [
        'enabled' => true,
        'ttl' => 3600,
    ],
];
```

## 🔧 Artisan Commands

```bash
php artisan polyglot:stats
php artisan polyglot:clean-orphaned
```

## 🧪 Testing

```bash
composer test
```

## 📄 License

MIT License. See [License File](LICENSE.md) for more information.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/barisdemirhan">Barış Demirhan</a>
</div>
