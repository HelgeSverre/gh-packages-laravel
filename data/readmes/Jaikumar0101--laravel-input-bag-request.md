# Laravel InputBag

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jaikumar0101/laravel-inputbag.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-inputbag)
[![Total Downloads](https://img.shields.io/packagist/dt/jaikumar0101/laravel-inputbag.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-inputbag)
[![License](https://img.shields.io/packagist/l/jaikumar0101/laravel-inputbag.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-inputbag)

A fluent builder for standardizing request inputs (search, pagination, sorting) in Laravel applications. Simplify your controller logic and maintain consistent API responses across your application.

## Features

- 🔍 **Standardized Input Handling** - Automatically process search, pagination, and sorting parameters
- 🎯 **Fluent API** - Chain methods for clean and readable code
- ⚙️ **Configurable Defaults** - Set global defaults for pagination and sorting
- 🔧 **Custom Mappings** - Map custom request fields with ease
- 📦 **Type Safety** - Return as array or collection based on your needs
- 🚀 **Zero Configuration** - Works out of the box with sensible defaults
- ✨ **Auto-Load Custom Fields** - Define common fields once in config, use everywhere

## Requirements

- PHP 8.2 or higher
- Laravel 11.x or 12.x

## Installation

Install the package via Composer:

```bash
composer require jaikumar0101/laravel-inputbag
```

### Publish Configuration (Optional)

Publish the configuration file to customize default values:

```bash
php artisan vendor:publish --tag="inputbag-config"
```

This will create a `config/inputbag.php` file where you can customize defaults such as `per_page`, `sort_by`, `order_by`, and define custom fields.

## Quick Start

### Basic Usage

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $inputs = InputBag::make($request)->standard()->toArray();

        $products = Product::when($inputs['search'], fn($q) => 
                        $q->where('name', 'like', '%' . $inputs['search'] . '%'))
                    ->orderBy($inputs['sort_by'], $inputs['order_by'])
                    ->paginate($inputs['per_page']);

        return response()->json($products);
    }
}
```

### Using Facade

```php
use Jaikumar0101\LaravelInputbag\Facades\InputBag;

class ProductController extends Controller
{
    public function index()
    {
        // Request is automatically injected when using facade
        $inputs = InputBag::standard()->toArray();

        $products = Product::when($inputs['search'], fn($q) => 
                        $q->where('name', 'like', '%' . $inputs['search'] . '%'))
                    ->orderBy($inputs['sort_by'], $inputs['order_by'])
                    ->paginate($inputs['per_page']);

        return response()->json($products);
    }
}
```

## Standard Inputs

The `standard()` method processes the following request parameters:

| Parameter  | Default Value | Description                           |
|------------|---------------|---------------------------------------|
| `search`   | `null`        | Search query string                   |
| `page`     | `1`           | Current page number                   |
| `per_page` | `15`          | Number of items per page              |
| `sort_by`  | `id`          | Column to sort by                     |
| `order_by` | `desc`        | Sort direction (`asc` or `desc`)      |

## Custom Fields

### Method 1: Manual Mapping (Per Controller)

Map custom request fields on a per-controller basis:

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $inputs = InputBag::make($request)
            ->set('status', 'filter_status', 'active')
            ->set('category', 'category_id')
            ->set('min_price', 'price_min', 0)
            ->set('max_price', 'price_max', 999999)
            ->standard()
            ->toArray();

        // Use $inputs array in your query
    }
}
```

### Method 2: Auto-Load from Config (Application-Wide) ⭐ NEW

Define custom fields once in your config file, and they'll be automatically included in all controllers using `standard()`:

**1. Configure in `config/inputbag.php`:**

```php
return [
    'defaults' => [
        'per_page' => 15,
        'sort_by' => 'id',
        'order_by' => 'desc',
    ],

    'custom_fields' => [
        // Simple syntax: 'key' => 'request_parameter'
        'status' => 'status',
        
        // Advanced syntax with default value
        'category' => [
            'request_key' => 'category_id',
            'default' => null
        ],
        
        'featured' => [
            'request_key' => 'featured',
            'default' => false
        ],
        
        'min_price' => [
            'request_key' => 'price_min',
            'default' => 0
        ],
        
        'max_price' => [
            'request_key' => 'price_max',
            'default' => 999999
        ],
    ],
];
```

**2. Use in any controller:**

```php
class ProductController extends Controller
{
    public function index(Request $request)
    {
        // One line - all custom fields automatically loaded!
        $inputs = InputBag::make($request)->standard()->toArray();
        
        // Available automatically:
        // $inputs['search'], $inputs['page'], $inputs['per_page']
        // $inputs['sort_by'], $inputs['order_by']
        // $inputs['status'], $inputs['category'], $inputs['featured']
        // $inputs['min_price'], $inputs['max_price']
        
        $products = Product::query()
            ->when($inputs['search'], fn($q) => 
                $q->where('name', 'like', '%' . $inputs['search'] . '%'))
            ->when($inputs['category'], fn($q) => 
                $q->where('category_id', $inputs['category']))
            ->when($inputs['status'], fn($q) => 
                $q->where('status', $inputs['status']))
            ->when($inputs['featured'], fn($q) => 
                $q->where('featured', true))
            ->whereBetween('price', [$inputs['min_price'], $inputs['max_price']])
            ->orderBy($inputs['sort_by'], $inputs['order_by'])
            ->paginate($inputs['per_page']);
        
        return response()->json($products);
    }
}
```

**Benefits of Config-Based Custom Fields:**
- ✅ Define once, use everywhere
- ✅ Consistent across all controllers
- ✅ Easy to maintain
- ✅ Environment-specific defaults

### Combining Both Methods

You can combine config-based fields with manual fields:

```php
// Config has: status, category
$inputs = InputBag::make($request)
    ->set('special_filter', 'special_param', 'default')  // Add extra field
    ->standard()  // Loads standard + config fields
    ->toArray();

// Result: standard + config + manual fields
```

## Advanced Example

### E-commerce Product Listing (Array Access)

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $inputs = InputBag::make($request)
            ->set('brand', 'brand_id')
            ->set('in_stock', 'in_stock')
            ->standard()  // Also loads fields from config
            ->toArray();

        $products = Product::query()
            ->when($inputs['search'], function ($query) use ($inputs) {
                $query->where('name', 'like', '%' . $inputs['search'] . '%')
                      ->orWhere('description', 'like', '%' . $inputs['search'] . '%');
            })
            ->when($inputs['category'], fn($q) => 
                $q->where('category_id', $inputs['category']))
            ->when($inputs['brand'], fn($q) => 
                $q->where('brand_id', $inputs['brand']))
            ->when($inputs['status'], fn($q) => 
                $q->where('status', $inputs['status']))
            ->when($inputs['in_stock'], fn($q) => 
                $q->where('stock', '>', 0))
            ->when($inputs['featured'], fn($q) => 
                $q->where('featured', true))
            ->whereBetween('price', [$inputs['min_price'], $inputs['max_price']])
            ->orderBy($inputs['sort_by'], $inputs['order_by'])
            ->paginate($inputs['per_page']);

        return response()->json($products);
    }
}
```

### E-commerce Product Listing (Collection Access)

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $inputs = InputBag::make($request)
            ->set('brand', 'brand_id')
            ->set('in_stock', 'in_stock')
            ->standard()
            ->toCollection();  // Returns Collection!

        $products = Product::query()
            ->when($inputs->get('search'), function ($query) use ($inputs) {
                $query->where('name', 'like', '%' . $inputs->get('search') . '%')
                      ->orWhere('description', 'like', '%' . $inputs->get('search') . '%');
            })
            ->when($inputs->get('category'), fn($q) => 
                $q->where('category_id', $inputs->get('category')))
            ->when($inputs->get('brand'), fn($q) => 
                $q->where('brand_id', $inputs->get('brand')))
            ->when($inputs->get('status'), fn($q) => 
                $q->where('status', $inputs->get('status')))
            ->when($inputs->get('in_stock'), fn($q) => 
                $q->where('stock', '>', 0))
            ->when($inputs->get('featured'), fn($q) => 
                $q->where('featured', true))
            ->whereBetween('price', [
                $inputs->get('min_price', 0), 
                $inputs->get('max_price', 999999)
            ])
            ->orderBy($inputs->get('sort_by', 'id'), $inputs->get('order_by', 'desc'))
            ->paginate($inputs->get('per_page', 15));

        return response()->json($products);
    }
}
```

### Using Collection Methods for Advanced Filtering

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $inputs = InputBag::make($request)->standard()->toCollection();

        // Get only non-null filters
        $activeFilters = $inputs->filter(fn($value) => !is_null($value))
                                ->except(['page', 'per_page', 'sort_by', 'order_by']);

        // Build query dynamically
        $query = Product::query();

        // Apply search
        if ($inputs->has('search') && $inputs->get('search')) {
            $query->where('name', 'like', '%' . $inputs->get('search') . '%');
        }

        // Apply all active filters
        foreach ($activeFilters as $key => $value) {
            match($key) {
                'category' => $query->where('category_id', $value),
                'brand' => $query->where('brand_id', $value),
                'status' => $query->where('status', $value),
                'featured' => $query->where('featured', true),
                'in_stock' => $query->where('stock', '>', 0),
                default => null
            };
        }

        // Price range
        if ($inputs->has('min_price') || $inputs->has('max_price')) {
            $query->whereBetween('price', [
                $inputs->get('min_price', 0),
                $inputs->get('max_price', 999999)
            ]);
        }

        $products = $query->orderBy($inputs->get('sort_by', 'id'), $inputs->get('order_by', 'desc'))
                          ->paginate($inputs->get('per_page', 15));

        return response()->json([
            'data' => $products,
            'filters' => $activeFilters, // Return active filters to frontend
        ]);
    }
}
```

## Output Formats

### As Array

```php
$inputs = InputBag::make($request)->standard()->toArray();
// Returns: array

// Access values
$search = $inputs['search'];
$perPage = $inputs['per_page'];
```

### As Collection

```php
$inputs = InputBag::make($request)->standard()->toCollection();
// Returns: Illuminate\Support\Collection

// Access values using Collection methods
$search = $inputs->get('search');
$perPage = $inputs->get('per_page', 15); // with default
$category = $inputs->get('category');

// Use Collection helper methods
$hasSearch = $inputs->has('search');
$onlyFilters = $inputs->only(['category', 'status', 'featured']);
$exceptPagination = $inputs->except(['page', 'per_page']);

// Chain Collection methods
$filters = $inputs->filter(fn($value) => !is_null($value));
```

### When to Use Each Format

**Use Array** when:
- You need simple key-value access
- Working with traditional arrays
- Passing to functions expecting arrays

**Use Collection** when:
- You want Laravel Collection methods
- Need to transform/filter inputs
- Want null-safe access with defaults
- Chaining operations

## Configuration

After publishing the configuration file, you can customize:

```php
// config/inputbag.php

return [
    // Default values for standard fields
    'defaults' => [
        'per_page' => 15,      // Default items per page
        'sort_by' => 'id',     // Default sort column
        'order_by' => 'desc',  // Default sort direction
    ],

    // Custom fields auto-loaded with standard()
    'custom_fields' => [
        // Simple syntax
        'status' => 'status',
        
        // Advanced syntax
        'category' => [
            'request_key' => 'category_id',
            'default' => null
        ],
    ],
];
```

## API Reference

### Methods

#### `make(Request $request)`
Creates a new InputBag instance with the given request.

```php
InputBag::make($request)
```

**Parameters:**
- `$request` (Request): The HTTP request instance

#### `standard()`
Processes standard request inputs (search, page, per_page, sort_by, order_by) plus any custom fields defined in config.

```php
InputBag::make($request)->standard()
```

#### `set($key, $requestKey, $default = null)`
Maps a custom request field to the input bag.

```php
InputBag::make($request)->set('status', 'filter_status', 'active')
```

**Parameters:**
- `$key` (string): The key to store the value under in the result
- `$requestKey` (string): The request parameter name to look for
- `$default` (mixed, optional): Default value if request parameter is not present

#### `toArray()`
Returns the input bag as an array.

```php
InputBag::make($request)->standard()->toArray()
```

#### `toCollection()`
Returns the input bag as a Laravel Collection.

```php
InputBag::make($request)->standard()->toCollection()
```

#### `reset()`
Resets the input bag data.

```php
InputBag::make($request)->reset()
```

## Usage Patterns

### Pattern 1: Static make() Method (Recommended)

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

$inputs = InputBag::make($request)->standard()->toArray();
```

### Pattern 2: Facade (Auto-inject Request)

```php
use Jaikumar0101\LaravelInputbag\Facades\InputBag;

$inputs = InputBag::standard()->toArray();
```

### Pattern 3: Direct Instantiation

```php
use Jaikumar0101\LaravelInputbag\InputBag;
use Illuminate\Http\Request;

$bag = new InputBag($request);
$inputs = $bag->standard()->toArray();
```

## Example API Requests

### Basic Search and Pagination
```
GET /api/products?search=laptop&page=2&per_page=20
```

### Sorting
```
GET /api/products?sort_by=price&order_by=asc
```

### With Custom Filters
```
GET /api/products?search=phone&category=1&status=active&featured=1&price_min=100&price_max=1000
```

### Complete Example
```
GET /api/products?search=laptop&category=electronics&status=active&featured=1&price_min=500&price_max=2000&sort_by=price&order_by=asc&per_page=50&page=2
```

## Real-World Use Cases

### Multi-Tenant Application

```php
// config/inputbag.php
'custom_fields' => [
    'tenant_id' => [
        'request_key' => 'tenant',
        'default' => null
    ],
    'workspace_id' => [
        'request_key' => 'workspace',
        'default' => null
    ],
],

// All controllers automatically filter by tenant/workspace
$inputs = InputBag::make($request)->standard()->toArray();
```

### Blog/CMS

```php
// config/inputbag.php
'custom_fields' => [
    'status' => [
        'request_key' => 'status',
        'default' => 'published'
    ],
    'author' => 'author_id',
    'tag' => 'tag_id',
    'category' => 'category_id',
],
```

### E-commerce Platform

```php
// config/inputbag.php
'custom_fields' => [
    'category' => 'category_id',
    'brand' => 'brand_id',
    'in_stock' => [
        'request_key' => 'in_stock',
        'default' => null
    ],
    'on_sale' => 'on_sale',
    'min_price' => [
        'request_key' => 'price_min',
        'default' => 0
    ],
    'max_price' => [
        'request_key' => 'price_max',
        'default' => 999999
    ],
],
```

## Testing

Run the test suite:

```bash
composer test
```

Generate code coverage:

```bash
composer test-coverage
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Vulnerabilities

If you discover a security vulnerability within this package, please send an email to Jai Kumar at jaikumar43044@gmail.com. All security vulnerabilities will be promptly addressed.

## Credits

- [Jai Kumar](https://github.com/jaikumar0101)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

---

Made with ❤️ by [Jai Kumar](https://github.com/jaikumar0101)