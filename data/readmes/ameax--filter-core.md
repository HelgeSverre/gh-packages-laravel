# Filter Core

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ameax/filter-core.svg?style=flat-square)](https://packagist.org/packages/ameax/filter-core)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ameax/filter-core/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ameax/filter-core/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ameax/filter-core/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ameax/filter-core/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ameax/filter-core.svg?style=flat-square)](https://packagist.org/packages/ameax/filter-core)

A powerful, type-safe filtering system for Laravel applications. Filter Core provides a clean API for building complex database queries with automatic value sanitization, validation, and support for relations.

## Features

- **6 Filter Types**: Boolean, Integer, Text, Select, Date, Decimal filters
- **18 Match Modes**: IS, IS_NOT, ANY, NONE, CONTAINS, GT, LT, BETWEEN, REGEX, EMPTY, DATE_RANGE, and more
- **AND/OR Logic**: Complex nested filter groups with FilterSelection
- **Relation Filtering**: Filter through Eloquent relationships with `whereHas()`
- **Collection Filtering**: Apply the same filter logic to in-memory Collections
- **Date Filtering**: Quick selections, relative ranges, fiscal years, timezone support
- **Decimal Filtering**: Precision control, stored-as-integer support for prices
- **Quick Filter Presets**: Database-driven, user-configurable date range presets
- **Value Sanitization**: Automatic conversion of input values (e.g., `"true"` → `true`)
- **Value Validation**: Laravel validation rules with descriptive error messages
- **Dynamic Filters**: Create filters at runtime without class definitions
- **JSON Serialization**: Persist and restore filter configurations with optional model binding
- **Debugging Tools**: SQL preview, bindings interpolation, human-readable explanations

## Installation

```bash
composer require ameax/filter-core
```

Publish the migrations:

```bash
php artisan vendor:publish --tag="filter-core-migrations"
php artisan migrate
```

Optionally publish the config:

```bash
php artisan vendor:publish --tag="filter-core-config"
```

## Quick Start

### 1. Create a Filter

```php
use Ameax\FilterCore\Filters\SelectFilter;

class StatusFilter extends SelectFilter
{
    public function column(): string
    {
        return 'status';
    }

    public function options(): array
    {
        return [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'pending' => 'Pending',
        ];
    }
}
```

### 2. Add Filterable Trait to Model

```php
use Ameax\FilterCore\Concerns\Filterable;

class User extends Model
{
    use Filterable;

    protected static function filterResolver(): \Closure
    {
        return fn () => [
            StatusFilter::class,
            CountFilter::class,
        ];
    }
}
```

### 3. Apply Filters

```php
use Ameax\FilterCore\Data\FilterValue;

// Simple filter
$users = User::query()
    ->applyFilter(FilterValue::for(StatusFilter::class)->is('active'))
    ->get();

// Multiple filters with AND
$users = User::query()
    ->applyFilters([
        FilterValue::for(StatusFilter::class)->any(['active', 'pending']),
        FilterValue::for(CountFilter::class)->gt(10),
    ])
    ->get();
```

### 4. Use Filter Selections for Complex Logic

```php
use Ameax\FilterCore\Selections\FilterSelection;
use Ameax\FilterCore\Selections\FilterGroup;

// AND logic (default)
$selection = FilterSelection::make()
    ->where(StatusFilter::class)->is('active')
    ->where(CountFilter::class)->gt(10);

// OR logic
$selection = FilterSelection::makeOr()
    ->where(StatusFilter::class)->is('active')
    ->where(StatusFilter::class)->is('pending');

// Nested: count > 10 AND (status = 'active' OR status = 'pending')
$selection = FilterSelection::make()
    ->where(CountFilter::class)->gt(10)
    ->orWhere(function (FilterGroup $g) {
        $g->where(StatusFilter::class)->is('active');
        $g->where(StatusFilter::class)->is('pending');
    });

$users = User::query()->applySelection($selection)->get();
```

### 5. Debug Your Filters

```php
$selection = FilterSelection::make()
    ->forModel(User::class)
    ->where(StatusFilter::class)->is('active')
    ->where(CountFilter::class)->gt(10);

// SQL with placeholders
$selection->toSql();
// → "select * from `users` where `status` = ? and `count` > ?"

// SQL with values interpolated
$selection->toSqlWithBindings();
// → "select * from `users` where `status` = 'active' and `count` > 10"

// Human-readable explanation
$selection->explain();
// → "StatusFilter IS 'active' AND CountFilter GT 10"

// Full debug info
$selection->debug();
// → ['sql' => ..., 'sql_with_bindings' => ..., 'bindings' => [...], 'filters' => [...], 'explanation' => ...]
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/guides/01-getting-started.md) | Installation and basic setup |
| [Filter Types](docs/guides/02-filter-types.md) | All 6 filter types explained |
| [Match Modes](docs/guides/03-match-modes.md) | All 19 match modes explained |
| [Filter Selections](docs/guides/04-filter-selections.md) | AND/OR logic with nested groups |
| [Relation Filters](docs/guides/05-relation-filters.md) | Filter through relationships |
| [Collection Filtering](docs/guides/06-collection-filtering.md) | In-memory collection filtering |
| [Dynamic Filters](docs/guides/07-dynamic-filters.md) | Runtime filter creation |
| [Validation](docs/guides/08-validation-sanitization.md) | Input validation and sanitization |
| [Advanced Usage](docs/guides/09-advanced-usage.md) | Custom logic and extensibility |
| [Date Filter](docs/guides/10-date-filter.md) | Date filtering with timezone support |

## Quick Reference

### Filter Types

| Type | Use Case | Key Modes |
|------|----------|-----------|
| `SelectFilter` | Predefined options | `is`, `any`, `none` |
| `IntegerFilter` | Numeric values | `gt`, `lt`, `between` |
| `TextFilter` | Text search | `contains`, `startsWith`, `regex` |
| `BooleanFilter` | True/False | `is` |
| `DateFilter` | Date/DateTime columns | `dateRange`, `notInDateRange` |
| `DecimalFilter` | Decimal/Float values | `gt`, `lt`, `between` |

### Date Filter

```php
use Ameax\FilterCore\Filters\DateFilter;
use Ameax\FilterCore\DateRange\DateRangeValue;

// Static filter class
class CreatedAtFilter extends DateFilter
{
    public function column(): string
    {
        return 'created_at';
    }

    // Enable timezone conversion for DATETIME columns
    public function hasTime(): bool
    {
        return true;
    }
}

// Dynamic filter
$filter = DateFilter::dynamic('created_at')
    ->withColumn('created_at')
    ->withTime(); // DATETIME with timezone support

// Quick selections
DateRangeValue::today();
DateRangeValue::thisWeek();
DateRangeValue::thisMonth();
DateRangeValue::thisQuarter();
DateRangeValue::thisYear();

// Relative ranges
DateRangeValue::lastDays(30);
DateRangeValue::nextDays(7);
DateRangeValue::lastMonths(3);

// Specific periods
DateRangeValue::quarter(2, yearOffset: 0);  // Q2 this year
DateRangeValue::month(6, yearOffset: -1);   // June last year
DateRangeValue::fiscalYear(startMonth: 7);  // July-June fiscal year

// Custom ranges
DateRangeValue::between('2024-01-01', '2024-12-31');
DateRangeValue::from('2024-06-01');
DateRangeValue::until('2024-12-31');
```

### Decimal Filter

```php
use Ameax\FilterCore\Filters\DecimalFilter;

// For price columns stored as cents (integer)
class PriceFilter extends DecimalFilter
{
    public function column(): string
    {
        return 'price_cents';
    }

    public function storedAsInteger(): bool
    {
        return true; // User enters 19.99, query uses 1999
    }

    public function precision(): int
    {
        return 2;
    }
}

// Dynamic filter
$filter = DecimalFilter::dynamic('price')
    ->withColumn('price_cents')
    ->withStoredAsInteger(true)
    ->withPrecision(2);
```

### Match Modes

```php
// Equality
->is('value')           // = value
->isNot('value')        // != value

// Sets
->any(['a', 'b'])       // IN (a, b)
->none(['a', 'b'])      // NOT IN (a, b)

// Comparison
->gt(10)                // > 10
->gte(10)               // >= 10
->lt(100)               // < 100
->lte(100)              // <= 100
->between(10, 100)      // BETWEEN 10 AND 100

// Text
->contains('text')      // LIKE %text%
->startsWith('pre')     // LIKE pre%
->endsWith('fix')       // LIKE %fix
->regex('^pattern')     // REGEXP

// Null
->empty()               // IS NULL
->notEmpty()            // IS NOT NULL
```

### Relation Filters

```php
// In filterResolver
protected static function filterResolver(): \Closure
{
    return fn () => [
        StatusFilter::class,                    // Direct filter
        CompanyStatusFilter::via('company'),    // Filter through relation
    ];
}

// Usage
User::query()
    ->applyFilter(FilterValue::for(CompanyStatusFilter::class)->is('active'))
    ->get();
```

### Dynamic Filters

```php
use Ameax\FilterCore\Filters\SelectFilter;
use Ameax\FilterCore\Filters\DateFilter;
use Ameax\FilterCore\Filters\DecimalFilter;

// Select filter
$filter = SelectFilter::dynamic('status')
    ->withColumn('status')
    ->withOptions(['active' => 'Active', 'inactive' => 'Inactive']);

// Date filter with timezone
$filter = DateFilter::dynamic('created_at')
    ->withColumn('created_at')
    ->withTime()
    ->withPastOnly();

// Decimal filter for prices
$filter = DecimalFilter::dynamic('price')
    ->withColumn('price_cents')
    ->withStoredAsInteger(true)
    ->withPrecision(2);
```

### JSON Serialization

```php
// Save
$json = $selection->toJson();

// Load
$selection = FilterSelection::fromJson($json);

// With model binding for self-validation and execution
$selection = FilterSelection::make('Active Users', User::class)
    ->where(StatusFilter::class)->is('active');

$json = $selection->toJson();
$restored = FilterSelection::fromJson($json);
$restored->validate();  // Self-validates against User model
$users = $restored->execute();  // Self-executes on User model
```

## Configuration

```php
// config/filter-core.php
return [
    // User model for FilterPreset ownership
    'user_model' => \App\Models\User::class,

    // Timezone for date/datetime filter queries
    // When filtering "today" in Europe/Berlin, converts to UTC for DB
    'timezone' => 'Europe/Berlin',
];
```

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

- [Michael Schmidt](https://github.com/69188126+ms-aranes)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
