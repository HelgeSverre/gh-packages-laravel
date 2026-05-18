# Laravel Star Schema

Star schema dimensional modeling for Laravel. Define fact tables, dimension tables, and query analytics data with a fluent API.

Works with MySQL, PostgreSQL, and SQLite.

## Installation

```bash
composer require skylence/laravel-star-schema
```

Publish the config file:

```bash
php artisan vendor:publish --tag="star-schema-config"
```

Run migrations:

```bash
php artisan migrate
```

Seed the date dimension:

```bash
php artisan star-schema:seed-dates
```

## Quick Start

### 1. Define a Fact

A fact represents a measurable business event — an order, a payment, a stock movement.

```php
namespace App\StarSchema\Facts;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Skylence\StarSchema\Contracts\FactDefinition;

class SalesOrderFact implements FactDefinition
{
    public function name(): string
    {
        return 'sales_orders';
    }

    public function sourceModel(): string
    {
        return Order::class;
    }

    public function query(): Builder
    {
        return Order::query();
    }

    public function measures(): array
    {
        return [
            'total_amount' => 'Total Amount',
            'quantity'     => 'Item Count',
        ];
    }

    public function dimensions(): array
    {
        return [
            'customer_id' => CustomerDimension::class,
            'product_id'  => ProductDimension::class,
        ];
    }

    public function degenerateDimensions(): array
    {
        return [
            'order_number' => 'Order Number',
        ];
    }

    public function dateColumn(): string
    {
        return 'ordered_at';
    }

    public function grain(): string
    {
        return 'One row per order';
    }
}
```

### 2. Register It

In `config/star-schema.php`:

```php
'facts' => [
    App\StarSchema\Facts\SalesOrderFact::class,
],
```

### 3. Query It

```php
use Carbon\CarbonImmutable;
use Skylence\StarSchema\StarQuery;
use Skylence\StarSchema\Enums\Range;

// Revenue per day for the last 30 days
$trend = StarQuery::fact('sales_orders')
    ->between(
        CarbonImmutable::now()->subDays(29),
        CarbonImmutable::now(),
    )
    ->perDay()
    ->sum('total_amount');

// Returns Collection<TrendValue> with gap-filled dates
foreach ($trend as $point) {
    echo "{$point->date}: {$point->value}\n";
}

// Using preset ranges
$trend = StarQuery::range('sales_orders', Range::Last30Days)
    ->perWeek()
    ->avg('total_amount');

// Single scalar value
$total = StarQuery::fact('sales_orders')
    ->between($from, $to)
    ->scalar('total_amount');

// Growth rate vs previous period
$growth = StarQuery::fact('sales_orders')
    ->between($from, $to)
    ->growthRate('total_amount');
// => ['current' => 15000, 'previous' => 12000, 'growth' => 25.0]
```

## Fluent Query API

| Method | Description |
|---|---|
| `StarQuery::fact($fact)` | Start a query for a registered fact (name or instance) |
| `StarQuery::range($fact, Range::YTD)` | Start a query with a preset date range |
| `->between($from, $to)` | Set the date range |
| `->perDay()` | Group by day |
| `->perWeek()` | Group by week |
| `->perMonth()` | Group by month |
| `->perQuarter()` | Group by quarter |
| `->perYear()` | Group by year |
| `->grain(TimeGrain::Monthly)` | Set grain with enum |
| `->where('status', 'paid')` | Filter by column value |
| `->where('status', ['paid', 'shipped'])` | Filter by multiple values (whereIn) |
| `->groupBy('customer_id')` | Group by dimension |
| `->withoutGapFilling()` | Disable zero-filling for missing periods |
| `->sum('amount')` | Aggregate with SUM |
| `->avg('amount')` | Aggregate with AVG |
| `->count()` | Aggregate with COUNT |
| `->min('amount')` | Aggregate with MIN |
| `->max('amount')` | Aggregate with MAX |
| `->scalar('amount')` | Get a single aggregated value (no time grouping) |
| `->growthRate('amount')` | Compare current vs previous period |

All time-series methods return `Collection<TrendValue>` where each `TrendValue` has `date` (string) and `value` (float|int) properties.

## Date Ranges

The `Range` enum provides common presets:

| Range | Period |
|---|---|
| `Range::Today` | Start of today to now |
| `Range::Yesterday` | Full day yesterday |
| `Range::Last7Days` | Last 7 days |
| `Range::Last30Days` | Last 30 days |
| `Range::Last90Days` | Last 90 days |
| `Range::MonthToDate` | Start of current month to now |
| `Range::QuarterToDate` | Start of current quarter to now |
| `Range::YearToDate` | Start of current year to now |
| `Range::LastMonth` | Full previous month |
| `Range::LastQuarter` | Full previous quarter |
| `Range::LastYear` | Full previous year |
| `Range::All` | All time (from 2000-01-01) |

## Artisan Commands

```bash
# Seed date dimension (2020-2035 by default)
php artisan star-schema:seed-dates
php artisan star-schema:seed-dates --start-year=2015 --end-year=2040
php artisan star-schema:seed-dates --fiscal-start=4  # April fiscal year

# Aggregate facts into snapshot rows
php artisan star-schema:aggregate
php artisan star-schema:aggregate --fact=sales_orders --grain=monthly
php artisan star-schema:aggregate --from=2025-01-01 --to=2025-01-31

# Sync dimension tables from source models
php artisan star-schema:sync-dimensions
php artisan star-schema:sync-dimensions --dimension=customer

# Prune old snapshots based on retention config
php artisan star-schema:prune
```

## Configuration

See the full [configuration reference](docs/configuration.md).

Key settings in `config/star-schema.php`:

```php
return [
    'table_prefix' => 'star_',        // Table name prefix
    'connection'    => null,           // Dedicated analytics DB connection

    'date_dimension' => [
        'start_year'             => 2020,
        'end_year'               => 2035,
        'fiscal_year_start_month' => 1,   // 1=Jan, 4=Apr, 7=Jul
        'locale'                 => null, // 'nl', 'fr', 'de', etc.
        'holidays'               => [],   // Array or callable
    ],

    'retention' => [
        'daily'     => 90,    // Keep daily snapshots for 90 days
        'weekly'    => 365,   // Keep weekly snapshots for 1 year
        'monthly'   => null,  // Keep forever
        'quarterly' => null,
        'yearly'    => null,
    ],

    'facts'      => [],  // Register FactDefinition classes
    'dimensions' => [],  // Register DimensionDefinition classes
];
```

## Advanced Usage

- [Defining Dimensions](docs/dimensions.md) — Dimension definitions, SCD types, hierarchies
- [Snapshot Aggregation](docs/aggregation.md) — Pre-computed snapshots, scheduling, retention
- [Database Adapters](docs/adapters.md) — Multi-database support and custom adapters
- [Configuration Reference](docs/configuration.md) — Full config options

## Database Support

| Database | Version | Status |
|---|---|---|
| MySQL | 8.0+ | Supported |
| PostgreSQL | 14+ | Supported |
| SQLite | 3.x | Supported |

## Testing

```bash
composer test
```

## License

MIT
