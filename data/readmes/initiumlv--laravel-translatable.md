# Laravel Translatable

A Laravel package that provides easy multi-language (i18n) support for Eloquent models. It automatically manages translations by separating translatable columns into dedicated translation tables, allowing you to store and retrieve model data in multiple languages seamlessly.

## Features

- **Automatic Translation Table Management** - Translatable columns are automatically moved to a separate `{table}_translations` table
- **Eloquent Integration** - Use the `HasTranslations` trait for automatic translation joins and locale-aware queries
- **Schema Builder** - Extended schema builder (`TranslatableSchema`) for creating and modifying translatable tables
- **Artisan Commands** - Generate migrations, cache translatable columns, and manage translations via CLI
- **Multi-Locale Support** - Save translations for multiple locales at once
- **Performance Caching** - Cache translatable columns to avoid database queries
- **Laravel 12 Compatible** - Built for modern Laravel applications

## Requirements

- PHP 8.2+
- Laravel 12.0+

## Installation

Install the package via Composer:

```bash
composer require initiumlv/laravel-translatable
```

Publish the configuration file (optional):

```bash
php artisan vendor:publish --tag="laravel-translatable-config"
```

## Configuration

The configuration file `config/translatable.php` contains the following options:

```php
return [
    // How to handle missing translations: 'strict', 'nullable', or 'fallback'
    'missing_translation_strategy' => 'strict',

    // Path where translatable column cache will be stored
    'cache_path' => 'bootstrap/cache/translatable.php',

    // Automatically regenerate cache after running migrations
    'auto_cache_after_migrate' => true,

    // Suffix used for translation tables (default: _translations)
    'table_suffix' => '_translations',

    // System columns to exclude when detecting translatable columns
    'system_columns' => ['id', 'locale'],
];
```

### Missing Translation Strategies

The `missing_translation_strategy` option controls how the package handles records without translations in the current locale:

| Strategy | Behavior |
|----------|----------|
| `strict` | **Default.** Only returns records that have a translation in the current locale. Uses INNER JOIN - records without translations are excluded. |
| `nullable` | Returns all records. Translatable columns will be `NULL` if no translation exists. Uses LEFT JOIN. |
| `fallback` | Returns all records. Uses `app.fallback_locale` translation when current locale doesn't exist. Uses LEFT JOIN with COALESCE. |

## Usage

### Creating Translatable Tables

Use the `TranslatableSchema` facade in your migrations to create tables with translatable columns:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Initium\LaravelTranslatable\Components\Database\Blueprint;
use Initium\LaravelTranslatable\Facades\TranslatableSchema;

return new class extends Migration
{
    public function up(): void
    {
        TranslatableSchema::create('products', function (Blueprint $table) {
            $table->id();

            // Non-translatable columns (stay in main table)
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            // Translatable columns (moved to products_translations table)
            $table->string('name')->translatable();
            $table->text('description')->nullable()->translatable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        TranslatableSchema::dropIfExists('products');
    }
};
```

This creates two tables:

**`products` table:**
| Column | Type |
|--------|------|
| id | bigint |
| price | decimal(10,2) |
| is_active | boolean |
| sort_order | integer |
| created_at | timestamp |
| updated_at | timestamp |

**`product_translations` table:**
| Column | Type |
|--------|------|
| id | bigint |
| product_id | bigint (foreign key) |
| locale | varchar |
| name | varchar |
| description | text (nullable) |

### Adding the Trait to Your Model

Add the `HasTranslations` trait to your Eloquent model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Initium\LaravelTranslatable\Components\Database\Concerns\HasTranslations;

class Product extends Model
{
    use HasTranslations;

    protected $guarded = [];
}
```

### Saving Translations

#### Save with Current Locale

```php
// Uses app()->getLocale() by default
$product = new Product();
$product->price = 99.99;
$product->is_active = true;
$product->name = 'English Product Name';
$product->description = 'English description';
$product->save();
```

#### Save with Specific Locale

```php
$product = new Product();
$product->price = 49.99;
$product->name = 'Latvian Product Name';
$product->description = 'Latvian description';
$product->save(locale: 'lv');
```

#### Save Multiple Translations at Once

```php
$product = new Product();
$product->price = 99.99;
$product->save();

$product->saveTranslations([
    'en' => ['name' => 'English Name', 'description' => 'English description'],
    'lv' => ['name' => 'Latvian Name', 'description' => 'Latvian description'],
    'de' => ['name' => 'German Name', 'description' => 'German description'],
]);
```

### Retrieving Translations

The `HasTranslations` trait automatically joins the translation table and filters by the current locale:

```php
// Set the application locale
app()->setLocale('en');

// Get product with English translations
$product = Product::find(1);
echo $product->name; // "English Name"
echo $product->description; // "English description"

// Switch locale
app()->setLocale('lv');

// Get product with Latvian translations
$product = Product::find(1);
echo $product->name; // "Latvian Name"
```

#### Query Without Translation Scope

To retrieve records without the automatic translation join:

```php
// Get all products regardless of translation availability
$products = Product::withoutTranslations()->get();
```

### Modifying Translatable Tables

#### Add New Translatable Columns

```php
TranslatableSchema::table('products', function (Blueprint $table) {
    $table->string('subtitle')->nullable()->translatable();
});
```

#### Modify Existing Translatable Columns

```php
TranslatableSchema::table('products', function (Blueprint $table) {
    $table->text('description')->nullable()->translatable()->change();
});
```

#### Drop Translatable Columns

```php
TranslatableSchema::table('products', function (Blueprint $table) {
    $table->dropTranslatable('subtitle');
});
```

### Supported Column Types

The following column types can be made translatable:

**Text Types:**

| Method | Description |
|--------|-------------|
| `string($column, $length)` | Variable length string |
| `text($column)` | Large text field |
| `mediumText($column)` | Medium text field |
| `longText($column)` | Very large text field |
| `json($column)` | JSON data |

**Numeric Types:**

| Method | Description |
|--------|-------------|
| `integer($column)` | Integer |
| `tinyInteger($column)` | Tiny integer |
| `smallInteger($column)` | Small integer |
| `mediumInteger($column)` | Medium integer |
| `bigInteger($column)` | Big integer |
| `unsignedInteger($column)` | Unsigned integer |
| `unsignedTinyInteger($column)` | Unsigned tiny integer |
| `unsignedSmallInteger($column)` | Unsigned small integer |
| `unsignedMediumInteger($column)` | Unsigned medium integer |
| `unsignedBigInteger($column)` | Unsigned big integer |
| `decimal($column, $total, $places)` | Decimal with precision |
| `unsignedDecimal($column, $total, $places)` | Unsigned decimal |
| `float($column, $precision)` | Floating point |
| `double($column)` | Double precision |

**Other Types:**

| Method | Description |
|--------|-------------|
| `boolean($column)` | Boolean true/false |

All column modifiers work as expected:

```php
$table->string('name', 100)->nullable()->default('Untitled')->translatable();
$table->decimal('local_price', 10, 2)->translatable(); // Price that varies by locale
$table->boolean('is_available')->default(true)->translatable(); // Availability per locale
```

## Artisan Commands

### Generate Translatable Migration

```bash
# Create a new translatable table
php artisan make:translatable-migration create_products_table --create=products

# Modify an existing translatable table
php artisan make:translatable-migration add_subtitle_to_products_table --table=products

# Auto-detect table name from migration name
php artisan make:translatable-migration create_categories_table
```

### Cache Translatable Columns

Generate a PHP cache file of translatable columns for improved performance:

```bash
php artisan translatable:cache
```

This scans your database for all `*_translations` tables and creates a cache file mapping tables to their translatable columns.

### Clear Cache

Remove the translatable columns cache:

```bash
php artisan translatable:clear
```

## API Reference

### TranslatableSchema Facade

| Method | Description |
|--------|-------------|
| `create($table, Closure $callback)` | Create a new translatable table |
| `table($table, Closure $callback)` | Modify an existing translatable table |
| `drop($table)` | Drop both main and translation tables |
| `dropIfExists($table)` | Safely drop both tables if they exist |
| `hasTable($table)` | Check if table exists |
| `hasColumn($table, $column)` | Check if column exists |
| `dropColumns($table, array $columns)` | Drop specific columns |
| `rename($from, $to)` | Rename table |
| `connection($name)` | Get builder for specific database connection |

### Blueprint Methods

| Method | Description |
|--------|-------------|
| `translatable()` | Mark column as translatable |
| `dropTranslatable($columns)` | Drop translatable columns |
| `getTranslatableColumns()` | Get new translatable columns |
| `getChangedTranslatableColumns()` | Get modified translatable columns |
| `getAllTranslatableColumns()` | Get all translatable columns |
| `hasTranslatableColumns()` | Check if blueprint has translatable columns |
| `getTranslationTableName()` | Get translation table name |
| `getTranslationForeignKey()` | Get foreign key name |

### HasTranslations Trait Methods

| Method | Description |
|--------|-------------|
| `getTranslatableAttributes()` | Get array of translatable column names |
| `getTranslationTableName()` | Get the translation table name |
| `getTranslationForeignKey()` | Get the foreign key column name |
| `save(array $options, ?string $locale)` | Save model with optional specific locale |
| `saveTranslations(array $translations)` | Save translations for multiple locales |
| `scopeWithoutTranslations($query)` | Query without automatic translation join |

## How It Works

1. **Column Separation**: When you call `->translatable()` on a column definition, it's marked for separation from the main table.

2. **Automatic Table Creation**: The `TranslatableSchemaBuilder` automatically creates a `{table}_translations` table with the translatable columns, a foreign key reference, and a locale column.

3. **Global Scope**: The `TranslationScope` is automatically applied to models using `HasTranslations`, joining the translation table and filtering by the current application locale.

4. **Atomic Saves**: Translation data is saved within database transactions to ensure data consistency.

5. **Pending Queue**: Translation attribute changes are queued before saving to avoid race conditions when setting multiple translatable attributes.

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

- [Kristians Jaunzems](https://github.com/Kristians)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
