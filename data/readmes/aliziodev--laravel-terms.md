# Laravel Terms

[![Tests](https://github.com/aliziodev/laravel-terms/actions/workflows/tests.yml/badge.svg)](https://github.com/aliziodev/laravel-terms/actions/workflows/tests.yml)
[![Latest Version](https://img.shields.io/packagist/v/aliziodev/laravel-terms.svg)](https://packagist.org/packages/aliziodev/laravel-terms)
[![Total Downloads](https://img.shields.io/packagist/dt/aliziodev/laravel-terms.svg)](https://packagist.org/packages/aliziodev/laravel-terms)
[![PHP Version](https://img.shields.io/packagist/php-v/aliziodev/laravel-terms.svg)](https://packagist.org/packages/aliziodev/laravel-terms)
[![License](https://img.shields.io/packagist/l/aliziodev/laravel-terms.svg)](LICENSE)

Lightweight, flat taxonomy package for Laravel. Attach reusable terms — tags, categories, brands, colors, sizes, or any custom type — to any Eloquent model via a polymorphic pivot, without nested-set complexity.

## Features

- **Flat term model** — no nested sets, no adjacency lists; one simple `terms` table
- **Polymorphic pivot** — attach terms to any model with a single trait
- **Type-based scoping** — built-in enum types (`tag`, `category`, `brand`, `color`, `size`) plus arbitrary string types
- **Context on pivot** — group term attachments by an optional context string (e.g. `primary`, `sidebar`), with context-aware sync and detach
- **Configurable morph key** — `numeric` (default), `uuid`, or `ulid`
- **Auto slug generation** — slugs derived from names, unique per type
- **`hasTerm()`** — fast boolean existence check without loading the relation
- **`whereHasTerms()`** — scope for AND / OR multi-term filtering
- **`Term::ordered()`** — scope to order terms by `order`
- **Minimal surface area** — manager, trait, one model, one migration

## Requirements

| Laravel | PHP   |
|---------|-------|
| 11.x    | 8.2+  |
| 12.x    | 8.2+  |
| 13.x    | 8.3+  |

## Installation

```bash
composer require aliziodev/laravel-terms
```

Run the installer (publishes config + migration, optionally migrates):

```bash
php artisan terms:install
```

Or publish manually:

```bash
php artisan vendor:publish --tag=terms-config
php artisan vendor:publish --tag=terms-migrations
php artisan migrate
```

## Configuration

`config/terms.php` — published to your app:

```php
return [
    'table_names' => [
        'terms'    => 'terms',
        'termables' => 'termables',
    ],

    // Supported: "numeric" (default), "uuid", "ulid"
    // Must match the primary key type of models using HasTerms.
    'morph_type' => 'numeric',

    // Built-in types. Arbitrary strings are also accepted at runtime.
    'types' => ['tag', 'category', 'brand', 'color', 'size'],

    // Swap in your own model if you need to extend Term.
    'model' => \Aliziodev\LaravelTerms\Models\Term::class,

    'slugs' => [
        'generate'            => true,
        'regenerate_on_update' => false,
    ],
];
```

## Usage

### 1. Add the trait to your model

```php
use Aliziodev\LaravelTerms\Traits\HasTerms;

class Product extends Model
{
    use HasTerms;
}
```

If your model uses UUID or ULID primary keys, set `morph_type` in `config/terms.php` to match.

### 2. Attach, sync, and detach terms

```php
use Aliziodev\LaravelTerms\Enums\TermType;

// Sync — replaces all existing tags with the new list
$product->syncTerms(['new-arrival', 'sale'], TermType::Tag);

// Attach — adds without removing existing terms
$product->attachTerms(['nike'], TermType::Brand);

// Detach specific terms
$product->detachTerms(['sale'], TermType::Tag);

// Detach all terms of a type
$product->detachTerms([], TermType::Tag);

// Detach everything
$product->detachTerms();

// Detach within a specific context only (other contexts remain untouched)
$product->detachTerms([], TermType::Tag, 'homepage');
$product->detachTerms(['sale'], TermType::Tag, 'homepage');
```

Custom string types work without any configuration:

```php
$product->syncTerms(['waterproof', 'breathable'], 'material');
```

### 3. Query

```php
// All terms attached to the model
$product->terms;

// Terms of a specific type
$product->termsOfType(TermType::Tag)->get();

// Fast boolean existence check — no collection loaded
$product->hasTerm(TermType::Brand, 'nike');    // true / false

// Find products that have a specific term
Product::whereHasTerm(TermType::Brand, 'nike')->get();

// Models that have ALL of the given terms (AND — default)
Product::whereHasTerms(TermType::Tag, ['new', 'sale'])->get();

// Models that have ANY of the given terms (OR)
Product::whereHasTerms(TermType::Tag, ['new', 'sale'], 'or')->get();
```

### 4. Context

Attach the same term under different contexts (e.g. display slots):

```php
$product->attachTerms(['red'], TermType::Color, 'primary');
$product->attachTerms(['blue'], TermType::Color, 'secondary');

// Syncing within a context leaves other contexts untouched
$product->syncTerms(['yellow'], TermType::Color, 'primary');

// Filter by context on the pivot
$product->termsOfType(TermType::Color)->wherePivot('context', 'primary')->get();
```

### 5. Facade

```php
use Aliziodev\LaravelTerms\Facades\Terms;

$term  = Terms::findOrCreate('Summer', TermType::Tag);
$terms = Terms::findOrCreateMany(['new', 'sale'], TermType::Tag);

Terms::attach($product, ['red'], TermType::Color);
Terms::sync($product, ['blue'], TermType::Color);
Terms::detach($product, ['red'], TermType::Color);
```

### 6. Term model scopes

```php
// Filter by type or slug
Term::query()->type('tag')->get();
Term::query()->slug('new-arrival')->first();

// Sort by order (asc by default)
Term::query()->type('tag')->ordered()->get();
Term::query()->ordered('desc')->get();
```

## Extending the Term model

Publish the config and swap `model`:

```php
// config/terms.php
'model' => App\Models\Term::class,
```

```php
namespace App\Models;

class Term extends \Aliziodev\LaravelTerms\Models\Term
{
    // Add relations, scopes, or accessors here
}
```

## Differences from laravel-taxonomy

| Feature | laravel-terms | laravel-taxonomy |
|---------|--------------|-----------------|
| Hierarchy | None (flat) | Nested set / adjacency list |
| Term ordering | `order` column | Full tree ordering |
| Pivot context | Yes | Varies |
| Migration complexity | 2 tables | 2 tables |
| Footprint | Minimal | Feature-rich |

Use **laravel-terms** when you need simple, flat labels. Use [laravel-taxonomy](https://github.com/aliziodev/laravel-taxonomy) when you need parent–child term trees.

## Testing

```bash
composer test
```

## License

MIT — see [LICENSE](LICENSE).
