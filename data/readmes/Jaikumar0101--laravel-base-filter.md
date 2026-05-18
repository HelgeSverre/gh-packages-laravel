# Laravel Base Filter

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jaikumar0101/laravel-base-filter.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-base-filter)
[![Total Downloads](https://img.shields.io/packagist/dt/jaikumar0101/laravel-base-filter.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-base-filter)
[![License](https://img.shields.io/packagist/l/jaikumar0101/laravel-base-filter.svg?style=flat-square)](https://packagist.org/packages/jaikumar0101/laravel-base-filter)

A powerful and flexible Laravel package for building and applying query filters with ease. This package provides a fluent interface for constructing complex database queries with filters, search, sorting, relations, and custom callbacks.

## Features

- 🔍 **Flexible Filtering**: Build complex where conditions, whereIn, and relation filters
- 🎯 **Advanced Relationship Filters**: Filter with `whereHas` and `whereDoesntHave` using custom callbacks
- ⚡ **Raw SQL Support**: Execute complex SQL expressions with `whereRaw` for advanced queries
- 🔧 **Callback Conditions**: Use `whereCallback` for complete control over complex nested queries
- 🔎 **Smart Search**: Search across multiple columns including relationships
- 🔄 **Sorting**: Easy sorting with customizable defaults
- 🗑️ **Soft Delete Support**: Handle trashed records with ease
- 🎨 **Custom Filters**: Add custom filter logic with callables
- 🎭 **Fluent API**: Chainable methods for clean, readable code
- ⚙️ **Configurable**: Customize defaults via config file
- 🧪 **Well Tested**: Comprehensive test suite included
- 🎭 **Facade Support**: Use facades or dependency injection

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x, or 12.x

## What's New in v1.1 🎉

### Advanced Relationship Filters
- **`setWhereHas()`** - Filter records based on relationship existence with custom callback conditions
- **`setWhereDoesntHave()`** - Inverse filtering - exclude records with specific relationships

### Raw SQL & Complex Conditions  
- **`setWhereRaw()`** - Execute complex SQL expressions for advanced filtering needs
- **`setWhereCallback()`** - Build complex nested where clauses with complete query builder control

### Enhanced Power & Flexibility
These new features enable you to build more sophisticated filters for real-world scenarios like:
- Multi-level relationship filtering
- Complex date calculations and comparisons
- Custom business logic with raw SQL
- Dynamic conditional filtering based on user permissions

See the [complete documentation](#advanced-relationship-filters-new) and [examples](EXAMPLES.md) for usage details.

## Installation

Install the package via Composer:

```bash
composer require jaikumar0101/laravel-base-filter
```

Publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="Jaikumar0101\LaravelBaseFilter\QueryFilterServiceProvider"
```

## Basic Usage

### Creating Filters

```php
use Jaikumar0101\LaravelBaseFilter\Facades\QueryFilter;

// Using the facade
$filters = QueryFilter::make()
    ->setWhere('status', '=', 'active')
    ->setSearch($request->get('search'), ['name', 'email'])
    ->setSort('created_at', 'desc')
    ->toArray();

// Or using the helper function
$filters = query_filter()
    ->setWhere('company_id', '=', auth()->user()->company_id)
    ->setWhereIn('role', ['admin', 'manager'])
    ->setSearch($request->search, ['code', 'reference'])
    ->toArray();
```

### Applying Filters

```php
use Jaikumar0101\LaravelBaseFilter\Facades\FilterApplier;
use App\Models\User;

// Apply filters to a query
$query = User::query();
$filteredQuery = FilterApplier::on($query, $filters)->applyAll();
$users = $filteredQuery->paginate(15);

// Or use the helper
$users = filter_applier(User::query(), $filters)
    ->applyAll()
    ->paginate(15);
```

## Advanced Usage

### Custom Filters with Callables

Add custom filter logic using callbacks:

```php
$filters = QueryFilter::make()
    ->setWhere('status', '=', 'active')
    ->setCustom('price_range', function ($query, $value) {
        if (isset($value['min'])) {
            $query->where('price', '>=', $value['min']);
        }
        if (isset($value['max'])) {
            $query->where('price', '<=', $value['max']);
        }
    }, ['min' => 100, 'max' => 500])
    ->toArray();

// Apply custom filters
FilterApplier::on($query, $filters)->applyAll();
```

### Searching Relationships

```php
$filters = QueryFilter::make()
    ->setSearch($request->search, [
        'name',
        'email',
        'company.name',           // Search in related company
        'profile.bio'             // Search in profile relation
    ])
    ->toArray();
```

### Full Name Search

```php
$filters = QueryFilter::make()
    ->setSearch($request->search, [
        'full_name',  // Automatically searches CONCAT(first_name, ' ', last_name)
        'email'
    ])
    ->toArray();
```

### Filtering by Relations

```php
$filters = QueryFilter::make()
    ->setRelation('company', 'status', 'active')
    ->setRelation('roles', 'name', 'admin', '=')
    ->setRelationCustom('posts', function ($query) {
        $query->where('published', true)
              ->where('views', '>', 100);
    })
    ->toArray();
```

### Advanced Relationship Filters (NEW)

#### WhereHas with Custom Callbacks

```php
// Filter users who have published posts with over 100 views
$filters = QueryFilter::make()
    ->setWhereHas('posts', function ($query) {
        $query->where('published', true)
              ->where('views', '>', 100);
    })
    ->toArray();

// Multiple whereHas conditions
$filters = QueryFilter::make()
    ->setWhereHas('company', fn($q) => $q->where('status', 'active'))
    ->setWhereHas('roles', fn($q) => $q->whereIn('name', ['admin', 'manager']))
    ->toArray();
```

#### WhereDoesntHave (Inverse Filtering)

```php
// Users without any posts
$filters = QueryFilter::make()
    ->setWhereDoesntHave('posts')
    ->toArray();

// Users without published posts
$filters = QueryFilter::make()
    ->setWhereDoesntHave('posts', fn($q) => $q->where('published', true))
    ->toArray();

// Invoices without successful payments
$filters = QueryFilter::make()
    ->setWhereDoesntHave('payments', fn($q) => $q->where('status', 'success'))
    ->toArray();
```

### Raw SQL Conditions (NEW)

```php
// Year-based filtering
$filters = QueryFilter::make()
    ->setWhereRaw('YEAR(created_at) = ?', [2024])
    ->toArray();

// Complex calculations
$filters = QueryFilter::make()
    ->setWhereRaw('(quantity * unit_price) - discount > ?', [1000])
    ->setWhereRaw('DATEDIFF(due_date, invoice_date) > ?', [30])
    ->toArray();

// Profit margin analysis
$filters = QueryFilter::make()
    ->setWhereRaw('((selling_price - cost_price) / cost_price * 100) >= ?', [20])
    ->toArray();
```

### Callback-Based Where Conditions (NEW)

```php
// Complex nested where conditions
$filters = QueryFilter::make()
    ->setWhereCallback(function ($query) {
        $query->where(function ($q) {
            $q->where('status', 'active')
              ->orWhere('status', 'pending');
        })->where('amount', '>', 100);
    })
    ->toArray();

// Dynamic complex conditions
$filters = QueryFilter::make()
    ->setWhere('company_id', '=', $companyId)
    ->setWhereCallback(function ($query) use ($isUrgent) {
        if ($isUrgent) {
            $query->where(function ($q) {
                $q->where('priority', 'high')
                  ->orWhere('due_date', '<', now()->addDays(3));
            });
        }
    })
    ->toArray();
```

### Soft Delete Handling

```php
$filters = QueryFilter::make()
    ->setTrashed('with')  // Include trashed records
    ->toArray();

$filters = QueryFilter::make()
    ->setTrashed('only')  // Only trashed records
    ->toArray();
```

### Between Filters

```php
$filters = QueryFilter::make()
    ->setBetween('created_at', '2024-01-01', '2024-12-31')
    ->setBetween('price', 100, 500)
    ->toArray();
```

### Where Null/Not Null

```php
$filters = QueryFilter::make()
    ->setWhereNull('deleted_at')
    ->setWhereNotNull('email_verified_at')
    ->toArray();
```

### Or Where Conditions

```php
$filters = QueryFilter::make()
    ->setOrWhere([
        ['status', '=', 'active'],
        ['priority', '=', 'high']
    ])
    ->toArray();
```

### Scopes Support

```php
$filters = QueryFilter::make()
    ->setScope('active')
    ->setScope('verified')
    ->setScope('premium', [true])  // Pass parameters to scope
    ->toArray();
```

### Complete Example

```php
use Jaikumar0101\LaravelBaseFilter\Facades\QueryFilter;
use Jaikumar0101\LaravelBaseFilter\Facades\FilterApplier;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $filters = QueryFilter::make()
            ->setWhere('company_id', '=', auth()->user()->company_id)
            ->setWhereIn('status', $request->get('statuses', []))
            ->setSearch($request->search, [
                'code',
                'reference',
                'customer.name',
                'customer.email'
            ])
            ->setBetween('invoice_date', $request->date_from, $request->date_to)
            ->setRelation('customer', 'status', 'active')
            ->setSort($request->sort_by ?? 'invoice_date', $request->order_by ?? 'desc')
            ->setCustom('overdue', function ($query) {
                $query->where('due_date', '<', now())
                      ->where('status', '!=', 'paid');
            })
            ->toArray();

        $invoices = FilterApplier::on(Invoice::query(), $filters)
            ->applyAll()
            ->with(['customer', 'items'])
            ->paginate(15);

        return view('invoices.index', compact('invoices'));
    }
}
```

### Advanced Real-World Example

```php
use Jaikumar0101\LaravelBaseFilter\Facades\QueryFilter;
use Jaikumar0101\LaravelBaseFilter\Facades\FilterApplier;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $filters = QueryFilter::make()
            // Basic filters
            ->setWhere('company_id', '=', auth()->user()->company_id)
            ->setWhereIn('status', $request->input('statuses', []))
            
            // Advanced relationship filters
            ->setWhereHas('customer', function ($query) {
                $query->where('status', 'active')
                      ->where('verified', true);
            })
            
            // Orders with premium products
            ->setWhereHas('items.product', function ($query) use ($request) {
                if ($request->has('premium_only')) {
                    $query->where('tier', 'premium')
                          ->where('price', '>', 500);
                }
            })
            
            // Exclude orders with cancelled payments
            ->setWhereDoesntHave('payments', fn($q) => $q->where('status', 'cancelled'))
            
            // Complex date calculations
            ->setWhereRaw('DATEDIFF(delivery_date, order_date) <= ?', [7])
            
            // High-value orders
            ->setWhereRaw('(subtotal + tax - discount) > ?', [$request->min_value ?? 0])
            
            // Complex nested conditions
            ->setWhereCallback(function ($query) use ($request) {
                if ($request->has('urgent_filter')) {
                    $query->where(function ($q) {
                        $q->where('priority', 'urgent')
                          ->orWhere('delivery_date', '<', now()->addDays(2));
                    });
                }
            })
            
            // Search
            ->setSearch($request->search, [
                'order_number',
                'reference',
                'customer.name',
                'customer.email',
            ])
            
            // Sorting
            ->setSort($request->sort_by ?? 'order_date', $request->order_by ?? 'desc')
            ->toArray();

        $orders = FilterApplier::on(Order::query(), $filters)
            ->applyAll()
            ->with(['customer', 'items.product', 'payments'])
            ->paginate($request->per_page ?? 20);

        return view('orders.index', compact('orders'));
    }
}
```

## API Reference

### QueryFilter Methods

#### `make(array $initialData = []): self`
Create a new filter instance with optional initial data.

#### `setWhere(string $column, string $operator, $value): self`
Add a where condition.

#### `setWheres(array $conditions): self`
Add multiple where conditions at once.

#### `setWhereIn(string $column, array $values): self`
Add a whereIn condition.

#### `setWhereNull(string $column): self`
Add a whereNull condition.

#### `setWhereNotNull(string $column): self`
Add a whereNotNull condition.

#### `setWhereHas(string $relation, callable $callback): self`
Filter records based on relationship existence with custom conditions.

#### `setWhereDoesntHave(string $relation, ?callable $callback = null): self`
Filter records that don't have a relationship, optionally with conditions.

#### `setWhereRaw(string $sql, array $bindings = []): self`
Add a raw SQL where condition with parameter bindings.

#### `setWhereCallback(callable $callback): self`
Add a complex where condition using a callback for full query builder control.

#### `setBetween(string $column, $from, $to): self`
Add a between condition.

#### `setOrWhere(array $conditions): self`
Add OR where conditions.

#### `setTrashed(string $mode): self`
Set soft delete mode ('with', 'only', or null).

#### `setSearch(?string $search, array $columns = []): self`
Set search term and searchable columns.

#### `setSort(string $column, string $direction = 'desc'): self`
Set sorting column and direction.

#### `setRelation(string $relation, string $key, $value, $operator = '='): self`
Filter by relationship.

#### `setRelationCustom(string $relation, callable $callback): self`
Add custom relationship filter with callback.

#### `setCustom(string $name, callable $callback, $value = null): self`
Add a custom filter with callback.

#### `setScope(string $name, array $parameters = []): self`
Apply model scope.

#### `toArray(): array`
Get filters as array.

#### `get(string $key, $default = null)`
Get specific filter value.

### FilterApplier Methods

#### `on(Builder $query, array $filters): self`
Create applier instance.

#### `applyAll(): Builder`
Apply all filters and return the query.

#### `applyTrashed(): self`
Apply soft delete filters.

#### `applyWheres(): self`
Apply where conditions.

#### `applyWhereIns(): self`
Apply whereIn conditions.

#### `applyWhereNulls(): self`
Apply whereNull conditions.

#### `applyBetweens(): self`
Apply between conditions.

#### `applyOrWheres(): self`
Apply OR where conditions.

#### `applyWhereRaw(): self`
Apply raw SQL where conditions.

#### `applyWhereHas(): self`
Apply whereHas relationship filters.

#### `applyWhereDoesntHave(): self`
Apply whereDoesntHave relationship filters.

#### `applySearch(): self`
Apply search filters.

#### `applySorting(): self`
Apply sorting.

#### `applyRelations(): self`
Apply relationship filters.

#### `applyScopes(): self`
Apply model scopes.

#### `applyCustomFilters(): self`
Apply custom filters.

#### `getQuery(): Builder`
Get the query builder instance.

#### `only(array $types): self`
Apply only specific filter types. Available types: `'trashed'`, `'where'`, `'whereIn'`, `'whereNull'`, `'between'`, `'orWhere'`, `'whereRaw'`, `'whereHas'`, `'whereDoesntHave'`, `'search'`, `'relations'`, `'relationCustom'`, `'scopes'`, `'custom'`, `'sort'`.

**Example:**
```php
// Apply only whereHas and search filters, skip everything else
$query = FilterApplier::on(User::query(), $filters)
    ->only(['whereHas', 'search'])
    ->getQuery();
```

#### `except(array $types): self`
Apply all filters except specified types. Uses the same type names as `only()`.

**Example:**
```php
// Apply all filters except sorting
$query = FilterApplier::on(User::query(), $filters)
    ->except(['sort'])
    ->getQuery();
```

## Configuration

The published config file (`config/query-filter.php`) allows you to customize:

```php
return [
    'defaults' => [
        'sort_by' => 'id',
        'sort_order' => 'desc',
        'search_operator' => 'like',
    ],
    'search' => [
        'enable_full_name' => true,
        'case_sensitive' => false,
    ],
];
```

## Testing

Run the tests:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Support

If you discover any issues or have questions, please open an issue on [GitHub](https://github.com/Jaikumar0101/laravel-base-filter/issues).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email jaikumar43044@gmail.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Credits

- [Jai Kumar](https://github.com/Jaikumar0101)
- [All Contributors](https://github.com/Jaikumar0101/laravel-base-filter/contributors)

## Links

- [GitHub Repository](https://github.com/Jaikumar0101/laravel-base-filter)
- [Packagist](https://packagist.org/packages/jaikumar0101/laravel-base-filter)
- [Issues](https://github.com/Jaikumar0101/laravel-base-filter/issues)
