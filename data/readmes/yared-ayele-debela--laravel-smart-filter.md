# Laravel Smart Filter

A professional Laravel package that automatically converts HTTP query parameters into Eloquent query filters. Eliminate repetitive filtering logic in your Laravel APIs.

Instead of writing manual filtering logic in controllers, simply write:

![Products list with filter buttons and results table](docs/images/demo-screenshot.png)
*Screenshot: Products page with quick filter links (All, Price > 100, Search, Category, Sort, etc.) and a table displaying filtered results.*

```php
Product::filter()->get();
```

The package automatically parses request query parameters and applies filters.

## Installation

```bash
composer require yared/laravel-smart-filter
```

The package supports Laravel auto-discovery. For manual registration, add the service provider to `config/app.php`:

```php
'providers' => [
    // ...
    Yared\SmartFilter\SmartFilterServiceProvider::class,
],
```

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=smart-filter-config
```

## Quick Start

### 1. Add the Trait to Your Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Yared\SmartFilter\Traits\HasSmartFilter;

class Product extends Model
{
    use HasSmartFilter;
}
```

### 2. Use in Your Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return Product::filter()->paginate();
    }
}
```

That's it! Your API now supports automatic filtering from query parameters.

![Before vs After: Manual filtering code vs single line with Smart Filter](docs/images/before-after.png)
*Before/After: Compare verbose manual filtering logic in controllers vs. the single-line `Product::filter()->paginate()` approach.*

## Supported Filter Types

### Basic Equality

```
/api/products?category=phone
```

### Comparison Operators

| Parameter | Example | SQL Equivalent |
|-----------|---------|----------------|
| Greater than | `?price>100` | `WHERE price > 100` |
| Less than | `?price<500` | `WHERE price < 500` |
| Greater or equal | `?price>=100` | `WHERE price >= 100` |
| Less or equal | `?price<=500` | `WHERE price <= 500` |
| Not equal | `?status!=draft` | `WHERE status != 'draft'` |

### Range Filters

```
/api/products?price_between=100,500
```

Applies `WHERE price BETWEEN 100 AND 500`.

### Sorting

```
/api/products?sort=-price    # Descending order
/api/products?sort=price     # Ascending order
/api/products?sort=-price,name  # Multiple columns
```

### Search

```
/api/products?search=iphone
```

Applies `LIKE %iphone%` across configurable searchable columns (default: `name`, `description`).

### Relationship Filtering

Filter by related model attributes using dot notation:

```
/api/products?category.name=electronics
```

Internally converts to:

```php
$query->whereHas('category', function ($q) {
    $q->where('name', 'electronics');
});
```

Supports nested relationships: `?category.parent.name=electronics`

### Natural Language Filtering

Human-readable filter syntax:

```
/api/products?filter=price > 100 and stock > 0
```

Supported operators: `>`, `<`, `>=`, `<=`, `=`, `!=`  
Logical operators: `and`, `or`

### JSON Column Filtering

```
/api/products?attributes->color=red
```

### Pagination

```
/api/products?page=2&per_page=10
```

## Debug Mode

Add `debug=true` to see what filters were applied:

```
/api/products?price>100&category=phone&debug=true
```

Response includes metadata:

```json
{
    "data": [...],
    "filters_applied": [
        "price > 100",
        "category = phone"
    ],
    "sorting": "price DESC"
}
```

For debug metadata with pagination, use `filterAndPaginate()`:

```php
return Product::filterAndPaginate();
```

![Debug mode response showing filters_applied and sorting metadata](docs/images/debug-response.png)
*Debug mode: API response with `filters_applied` and `sorting` metadata when `?debug=true` is used.*

## Configuration

Publish the config file and customize:

```php
// config/smart-filter.php

return [
    'searchable' => ['name', 'description'],
    'reserved' => ['page', 'per_page', 'sort', 'search', 'filter', 'debug'],
    'range_suffix' => '_between',
];
```

### Model-Specific Searchable Columns

Override searchable columns per model:

**Option 1: Property**

```php
class Product extends Model
{
    use HasSmartFilter;

    protected array $searchable = ['name', 'description', 'sku'];
}
```

**Option 2: Method**

```php
class Product extends Model
{
    use HasSmartFilter;

    public function getSearchableColumns(): array
    {
        return ['name', 'description', 'sku'];
    }
}
```

**Option 3: Inline Options**

```php
Product::filter(request(), ['searchable' => ['name', 'sku']])->get();
```

## API Usage Examples

| Request | Description |
|---------|-------------|
| `/api/products?price>100` | Price greater than 100 |
| `/api/products?price>100&price<500` | Price between 100 and 500 |
| `/api/products?category=phone` | Category equals phone |
| `/api/products?category.name=electronics` | Related category name |
| `/api/products?search=iphone` | Search in name/description |
| `/api/products?sort=-price` | Sort by price descending |
| `/api/products?filter=price > 100 and stock > 0` | Natural language |
| `/api/products?price_between=100,500` | Range filter |
| `/api/products?attributes->color=red` | JSON column |
| `/api/products?price>100&debug=true` | With debug metadata |

## Architecture

The package follows clean architecture with separated responsibilities:

- **QueryParser** - Parses HTTP query parameters into structured filter data
- **FilterBuilder** - Applies parsed filters to Eloquent queries
- **QueryDebugger** - Records and outputs applied filters for debugging

![Architecture flow: HTTP Request → QueryParser → FilterBuilder → Eloquent](docs/images/architecture-flow.png)
*Architecture: Request with query params flows through QueryParser, FilterBuilder, and into Eloquent.*

## Facade (Optional)

Register the facade in `config/app.php`:

```php
'aliases' => [
    'SmartFilter' => Yared\SmartFilter\Facades\SmartFilter::class,
],
```

Usage:

```php
use SmartFilter;

$query = Product::query();
SmartFilter::apply($query);
$products = $query->get();
```

## Requirements

- PHP 8.1+
- Laravel 9.x, 10.x, 11.x, or 12.x

## License

MIT License
