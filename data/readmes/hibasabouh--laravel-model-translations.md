# Laravel Model Translations

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hibasabouh/laravel-model-translations.svg)](https://packagist.org/packages/hibasabouh/laravel-model-translations)
[![Total Downloads](https://img.shields.io/packagist/dt/hibasabouh/laravel-model-translations.svg)](https://packagist.org/packages/hibasabouh/laravel-model-translations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP](https://img.shields.io/packagist/php-v/hibasabouh/laravel-model-translations.svg)](https://packagist.org/packages/hibasabouh/laravel-model-translations)

A clean, database-driven approach to model translations in Laravel. Store translations in separate normalized tables and access them with elegant, locale-aware magic accessors.

## Why This Package?

Unlike JSON-based translation approaches, this package:

✅ **Relational structure** — Translations live in proper normalized tables  
✅ **Query support** — Filter models by translated content with `whereTranslation()`  
✅ **Indexing & constraints** — Add database indexes and unique constraints per locale  
✅ **Scalability** — Handles large datasets better than JSON columns  
✅ **Clean models** — Keeps base model focused, translations separated

If you prefer structured, relational translation tables over JSON columns, this package is for you.

---

## Requirements

| Laravel | PHP |
|---------|-----|
| 10.x    | ^8.1 |
| 11.x    | ^8.2 |
| 12.x    | ^8.2 |

---

## Quick Start

**1. Install**
```bash
composer require hibasabouh/laravel-model-translations
```

**2. Add the trait & define `$translatable`**
```php
use HibaSabouh\ModelTranslations\Traits\HasTranslations;

class Product extends Model
{
    use HasTranslations;

    protected array $translatable = ['name', 'description'];
}
```

**3. Create translation table**
```php
Schema::create('product_translations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->string('lang', 10);
    $table->string('name');
    $table->text('description')->nullable();
    $table->timestamps();
    
    $table->unique(['product_id', 'lang']);
});
```

**4. Create & access translations**
```php
Product::createWithTranslations([
    'sku' => 'LAPTOP-001',
    'name' => ['en' => 'Laptop', 'fr' => 'Ordinateur'],
]);

app()->setLocale('fr');
echo $product->name; // "Ordinateur"
```

**Done!**

---

## Features

- 🌍 **Locale-aware accessors** — `$model->name` automatically returns the current locale's value
- 🔄 **Fallback strategies** — Choose between `null`, app fallback, or first available translation
- 🔍 **Query scopes** — `whereTranslation()`, `whereAnyTranslation()` for filtering by translated content
- 💾 **Transactional CRUD** — All operations wrapped in database transactions
- 🎯 **Convention over configuration** — Auto-resolves translation model names
- ⚡ **Eager loading** — Configurable auto-eager-loading via global scope
- 🛠️ **Artisan command** — Scaffold translated models with a single command

---

## Installation

```bash
composer require hibasabouh/laravel-model-translations
```

### Publish Configuration

```bash
php artisan vendor:publish --tag=translatable-config
```

This creates `config/translatable.php`:

```php
return [
    'auto_load' => true,  // Eager load translations globally
    'fallback'  => 'app', // Fallback strategy: null, 'app', or 'first'
];
```

---

## Artisan Command

The package ships with a `translations:make-model` command that scaffolds everything you need in one step: the main model, the translation model (in the `Translations` sub-namespace), and optionally a migration and resource controller.

### Basic Usage

```bash
php artisan translations:make-model Product
```

This creates:
- `app/Models/Product.php` — with `HasTranslations` trait and `$translatable` property pre-configured
- `app/Models/Translations/ProductTranslation.php` — with `$fillable` set to `['product_id', 'lang']`

### Options

| Option | Description |
|--------|-------------|
| `--m`  | Create migrations for both the main model and its translation table |
| `--r`  | Create a resource controller for the main model |
| `--mr` | Create both migration and resource controller |

```bash
# With migration
php artisan translations:make-model Product --m

# With resource controller
php artisan translations:make-model Product --r

# With both
php artisan translations:make-model Product --mr
```

### What Gets Generated

**When `--m` is used**, the translation migration is pre-filled with the expected structure:

```php
Schema::create('product_translations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->string('lang');
    $table->timestamps();
});
```

You only need to add your translatable columns (e.g. `name`, `description`) — the foreign key, `lang`, and timestamps are already there.

**The main model** is set up with the trait and empty stubs ready to fill:

```php
use HibaSabouh\ModelTranslations\Traits\HasTranslations;

class Product extends Model
{
    use HasTranslations;

    protected $fillable = [];

    protected $translatable = [];
}
```

**The translation model** has `$fillable` bootstrapped with the foreign key and locale columns:

```php
class ProductTranslation extends Model
{
    protected $fillable = [
        'product_id',
        'lang',
    ];
}
```

> After running the command, add your translatable column names to both the migration and the `$fillable` / `$translatable` arrays.

---

## Setup Guide

### 1. Migration: Create Translation Table

For each translatable model, create a corresponding `{model}_translations` table:

```php
Schema::create('product_translations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->string('lang', 10);
    $table->string('name');
    $table->text('description')->nullable();
    $table->timestamps();
    
    $table->unique(['product_id', 'lang']); // One translation per locale
    $table->index('lang'); // Optional: speed up locale-specific queries
});
```

### 2. Translation Model

Create a translation model in the `Translations` sub-namespace:

```php
namespace App\Models\Translations;

use Illuminate\Database\Eloquent\Model;

class ProductTranslation extends Model
{
    protected $fillable = ['product_id', 'lang', 'name', 'description'];
}
```

> **Convention:** A `App\Models\Product` model resolves to `App\Models\Translations\ProductTranslation`.

### 3. Add Trait to Main Model

```php
namespace App\Models;

use HibaSabouh\ModelTranslations\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasTranslations;

    protected $fillable = ['sku', 'price', 'stock'];
    
    protected array $translatable = ['name', 'description'];
}
```

---

## Usage

### Creating Models

Pass translatable attributes as arrays keyed by locale:

```php
Product::createWithTranslations([
    'sku'   => 'LAPTOP-001',
    'price' => 999,
    'name'  => [
        'en' => 'Gaming Laptop',
        'fr' => 'Ordinateur Portable de Jeu',
        'ar' => 'حاسوب محمول للألعاب',
    ],
    'description' => [
        'en' => 'High-performance laptop for gaming',
        'fr' => 'Ordinateur haute performance pour les jeux',
    ],
]);
```

### Updating Models

```php
$product->updateWithTranslations([
    'price' => 899, // Update base attribute
    'name'  => [
        'en' => 'Gaming Laptop Pro', // Update existing
        'de' => 'Gaming-Laptop',      // Add new locale
    ],
]);

// Untouched translations ('fr', 'ar') remain unchanged
```

### Reading Translations

**Locale-aware accessor:**
```php
app()->setLocale('fr');
echo $product->name; // "Ordinateur Portable de Jeu"
```

**All translations at once:**
```php
$product->name_translations;
// ['en' => 'Gaming Laptop', 'fr' => 'Ordinateur Portable de Jeu', 'ar' => '...']
```

**Direct relationship access:**
```php
$product->translations; // Collection of all ProductTranslation records
$product->translations()->where('lang', 'en')->first();
```

### Querying by Translation

**Current locale (default):**
```php
app()->setLocale('en');
Product::whereTranslation('name', 'like', '%Laptop%')->get();
```

**Specific locale:**
```php
Product::whereTranslation('name', 'Ordinateur', '=', 'fr')->get();
```

**Any locale:**
```php
Product::whereAnyTranslation('name', 'like', '%Laptop%')->get();
```

**Chaining with OR:**
```php
Product::where('price', '<', 1000)
    ->whereTranslation('name', 'like', '%Pro%')
    ->orWhereAnyTranslation('description', 'like', '%gaming%')
    ->get();
```

---

## Advanced Usage

### First or Create

```php
Product::firstOrCreateWithTranslations(
    ['sku' => 'LAPTOP-001'], // Match condition
    [
        'price' => 999,
        'name'  => ['en' => 'Laptop', 'fr' => 'Ordinateur'],
    ]
);

// If match found: returns existing model (translations untouched)
// If no match: creates new model with translations
```

### Update or Create

```php
Product::updateOrCreateWithTranslations(
    ['sku' => 'LAPTOP-001'], // Match condition
    [
        'price' => 899,
        'name'  => ['en' => 'Gaming Laptop'],
    ]
);

// If match found: updates model AND translations
// If no match: creates new model with translations
```

### Custom Translation Model

Override the convention by defining `$translationModel`:

```php
class Product extends Model
{
    use HasTranslations;

    protected string $translationModel = \App\Models\CustomProductTranslation::class;
    protected array $translatable = ['name'];
}
```

---

## Configuration

Edit `config/translatable.php`:

```php
return [
    'auto_load' => true,  // Eager load translations on every query
    'fallback'  => 'app', // Fallback strategy when translation missing
];
```

### Fallback Strategies

| Strategy | Behavior |
|----------|----------|
| `null` | Returns `null` when translation missing |
| `'app'` | Falls back to `config('app.fallback_locale')` |
| `'first'` | Falls back to first available translation |

**Example:**
```php
config(['translatable.fallback' => 'app']);
config(['app.fallback_locale' => 'en']);

app()->setLocale('de'); // German not available
echo $product->name; // Falls back to English
```

### Auto-Loading Translations

When `auto_load` is `true`, all queries automatically eager load the `translations` relationship via a global scope. Disable for manual control:

```php
config(['translatable.auto_load' => false]);

Product::with('translations')->get(); // Manual eager loading
```

---

## Validation & Error Handling

### Missing `$translatable` Property

If a model uses the trait but doesn't define `$translatable`:

```php
MissingTranslatablePropertyException: App\Models\Product must define a $translatable property.
```

### Invalid Translation Format

Translatable attributes must be arrays:

```php
// ❌ Invalid
Product::createWithTranslations(['name' => 'Laptop']);

// ✅ Valid
Product::createWithTranslations(['name' => ['en' => 'Laptop']]);
```

Throws `InvalidTranslationFormatException` with a clear message:
```
The 'name' attribute must be an array of translations in the format: ['locale' => 'value'].
```

---

## Testing

```bash
composer test
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.

---

## Credits

- **Hiba Sabouh** — [GitHub](https://github.com/hibasabouh)
- All contributors

---

## Support

- **Issues:** [GitHub Issues](https://github.com/hibasabouh/laravel-model-translations/issues)
- **Source:** [GitHub Repository](https://github.com/hibasabouh/laravel-model-translations)
