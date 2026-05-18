# Laravel Searchable (Sift)

A lightweight and powerful Laravel package to make your Eloquent models searchable using a reusable trait. Designed with performance and real-world repository patterns in mind.

## Features

- **Trait-based architecture**: Simply add `use Sift;` to any model.
- **Relational Search**: Search across model relationships effortlessly.
- **JSON Search**: Deep search support for JSON columns.
- **Query Scope**: Provides a clean `search()` scope for your query builder.
- **Repository Compatible**: Perfect for projects using the Repository or Service pattern.
- **Lightweight**: Zero unnecessary dependencies, optimized for speed.
- **Customizable**: Configure operators, date formats, and case sensitivity.

## Installation

You can install the package via composer:

```bash
composer require searchkit/searchable
```

## Configuration

Publish the configuration file to customize the search behavior:

```bash
php artisan vendor:publish --provider="Searchkit\Searchable\SiftServiceProvider" --tag="config"
```

The published configuration file `config/searchable.php` allows you to control the search behavior globally:

- **`case_sensitive`**: Toggle between case-sensitive and case-insensitive searching.
- **`custom_operators`**: Set the default SQL operator (default is `LIKE`).
- **`enable_exact_match_search`**: When `true`, forces `=` operator for all searches.
- **`default_exclude_fields`**: Globally exclude columns like `id` or `password` from dynamic searches.
- **`custom_formats`**: Define how `date`, `time`, and `timestamp` fields are formatted at the database level during search.

## Usage

### 1. Setup BaseModel (Optional but Recommended)

It is common practice to include the trait in a `BaseModel` so it's available across all your models.

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Searchkit\Searchable\Sift;

class BaseModel extends Model
{
    use Sift;
}
```

### 2. Configure Your Models

Extend the `BaseModel` and define which fields should be searchable.

```php
namespace App\Models;

class Product extends BaseModel
{
    /**
     * Standard fields on the current model (populated in boot).
     */
    protected static $searchable = [];

    /**
     * Fields on model relationships.
     */
    protected static $relation_searchable = [
        'category' => ['title']
    ];

    /**
     * JSON columns on the current model.
     */
    protected static $json_searchable = [
        'data' => '*',           // Search all keys in the 'data' JSON column
        'meta' => ['brand']      // Search only the 'brand' key in the 'meta' JSON column
    ];

    /**
     * JSON columns on model relationships.
     */
    protected static $json_relation_searchable = [
        'category' => [
            'data' => '*',               // Search all keys in category's 'data' JSON
            'settings' => ['icon', 'type'] // Search specific keys in category's 'settings' JSON
        ]
    ];

    protected static function boot(): void
    {
        parent::boot();
        
        // Dynamically include all columns except 'slug' and 'deleted_at'
        self::$searchable = self::getSearchableFields(['slug', 'deleted_at']);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

## Detailed Search Configurations

The package supports a variety of configuration styles to suit your needs:

### Standard Search
You can either explicitly define searchable fields or dynamically include all columns while excluding specific ones.

#### Option A: Explicit Fields (Recommended for control)
Only the specified columns will be searchable.
```php
protected static $searchable = ['title', 'description', 'sku'];
```

#### Option B: Dynamic Fields (Recommended for speed)
Automatically make all columns searchable while excluding specific ones using the `boot()` method.
```php
protected static $searchable = [];

protected static function boot(): void
{
    parent::boot();
    
    // Automatically make all columns searchable except 'slug' and 'deleted_at'
    self::$searchable = self::getSearchableFields(['slug', 'deleted_at']);
}
```

### Relationship Search
Search columns in related tables.
```php
protected static $relation_searchable = [
    'category' => ['title'],
    'tags' => ['name']
];
```

### JSON Search (Current Model)
Search within JSON columns using different levels of granularity.
```php
// Case 1: Search all keys in a JSON column
protected static $json_searchable = ['data']; 
// OR
protected static $json_searchable = ['data' => '*'];

// Case 2: Search specific keys in a JSON column
protected static $json_searchable = [ 
    'data' => ['brand', 'model'] 
];
```

### JSON Search (Relationships)
Search within JSON columns belonging to related models.
```php
// Case 1: Search all keys in a related JSON column
protected static $json_relation_searchable = [ 
    'category' => [ 
        'data' => '*' 
    ] 
];

// Case 2: Search specific keys in a related JSON column
protected static $json_relation_searchable = [ 
    'category' => [ 
        'data' => ['icon', 'type'] 
    ] 
];
```

### 3. Basic Search Usage

The package provides a `search()` scope that you can chain onto any Eloquent query.

```php
// Search for products matching "iphone" in any searchable field or category title
$products = Product::query()->search('iphone')->get();
```

---

## Real-World Usage (Repository Pattern)

This package is built to shine in professional environments using the Repository pattern.

### Base Repository Example

```php
namespace App\Repositories;

use Illuminate\Database\Eloquent\Builder;

abstract class BaseRepository
{
    protected function getResult(Builder $query, ?array $data = null)
    {
        // Apply search if search_term is provided
        if (isset($data['search_term'])) {
            $query->search($data['search_term']);
        }

        // Apply other common filters (date, pagination, etc.)
        return $query->latest()->paginate($data['per_page'] ?? 15);
    }
}
```

### Product Repository Implementation

```php
namespace App\Repositories;

use App\Models\Product;

class ProductRepository extends BaseRepository
{
    public function getAll(?array $data = null)
    {
        $query = Product::query()->with('category');

        return $this->getResult($query, $data);
    }
}
```

---

## Sample Application

Want to see **Laravel Searchable (Sift)** in action inside a real Laravel project?

Check out the official sample application that demonstrates how to integrate the package using models, repositories, and controllers in a full Laravel setup:

👉 **[laravel-searchable-sample-app](https://github.com/Sandezh/laravel-searchable-sample-app)**

The sample app includes:
- A complete Laravel project wired up with `searchkit/searchable`
- `BaseModel` and model configurations with standard, relational, and JSON search fields
- A `BaseRepository` and concrete repositories using the `search()` scope
- Database seeders to populate test data and verify search results out of the box

---

## Requirements

- **PHP**: ^7.4 | ^8.0
- **Laravel**: ^8.0 | ^9.0 | ^10.0 | ^11.0 | ^12.0 | ^13.0

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
