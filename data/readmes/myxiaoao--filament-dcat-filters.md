<div align="center">

# Filament Dcat Filters

**Bring Dcat Admin's powerful filter features to Filament**

Built with PHP 8.3+ for Laravel 12/13 and Filament v4/v5

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cooper/filament-dcat-filters.svg?style=flat-square)](https://packagist.org/packages/cooper/filament-dcat-filters)
[![Total Downloads](https://img.shields.io/packagist/dt/cooper/filament-dcat-filters.svg?style=flat-square)](https://packagist.org/packages/cooper/filament-dcat-filters)
[![run-tests](https://github.com/myxiaoao/filament-dcat-filters/actions/workflows/run-tests.yml/badge.svg)](https://github.com/myxiaoao/filament-dcat-filters/actions/workflows/run-tests.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/php-8.3+-purple.svg)](https://www.php.net)
[![Laravel](https://img.shields.io/badge/laravel-12.x%20%7C%2013.x-red.svg)](https://laravel.com)
[![Filament](https://img.shields.io/badge/filament-4.x%20%7C%205.x-orange.svg)](https://filamentphp.com)

<img src="./art/filters.png" alt="Filament Dcat Filters Screenshot" width="800">

---

A modern collection of enhanced filters inspired by [Dcat Admin](https://github.com/jqhph/dcat-admin), combining intuitive UI components with powerful filtering capabilities for [Filament](https://filamentphp.com) admin panels.

[English Documentation](#features) | [中文文档](README_CN.md)

</div>

## Features

### Core Filters
- 🎯 **Scope Filter** - Tab-style quick filters for common queries
- 📊 **Range Filter** - Simplified date/number range filtering (3 lines of code!)
- 📅 **Date Component Filter** - Filter by year, month, or day separately
- 🔍 **SelectTable Filter** - Modal table selector with search and pagination
- 🎭 **Modal Select Filter** - Dcat Admin style modal with full table display
- 🔢 **Between Filter** - Numeric range filtering shortcut
- 🙈 **Hidden Filter** - URL parameter-based filtering without UI

### Quick Filters
- ⚡ **LIKE Filter** - Text search with wildcard control (supports NOT LIKE)
- 📋 **IN Filter** - Multiple value selection (supports NOT IN)
- 🔢 **Comparison Filter** - Comparison operators (>, <, >=, <=, =, !=)
- ✅ **Boolean Filter** - True/false/all toggle for boolean fields
- 🔘 **Null Filter** - NULL/NOT NULL value filtering
- 📝 **Enum Filter** - Auto-generate options from PHP 8.1+ Enum classes
- 🔍 **FullText Filter** - Search across multiple fields simultaneously
- 📆 **Relative Date Filter** - Pre-defined date range shortcuts

### Specialized Filters
- 🗄️ **JSON Filter** - Query JSON/JSONB columns with path access
- 🏷️ **FindInSet Filter** - Query comma-separated values using FIND_IN_SET
- 🔤 **Regex Filter** - Pattern matching with regular expressions
- 📱 **InputMask Filter** - Formatted input with masks (phone, credit card, etc.)
- 📍 **GeoLocation Filter** - Geographic proximity filtering with Haversine formula
- 🔗 **Filter Group** - Combine filters with AND/OR logic

### New in v2.0
- 🗑️ **SoftDelete Filter** - Built-in soft delete visibility control (withTrashed/onlyTrashed)
- 🔍 **Exists Filter** - Filter by relationship existence (whereHas/whereDoesntHave)
- 📊 **Aggregate Filter** - Filter by relationship aggregates (count, sum, avg, max, min + having)
- ⚖️ **Column Compare Filter** - Compare two database columns (whereColumn)
- 🧩 **Advanced JSON Filter** - Array contains, path exists, key exists for JSON columns
- 🕐 **Timezone Aware Date Filter** - Auto timezone conversion between user and database
- 🔀 **Morph Relation Filter** - MorphTo and MorphToMany polymorphic relationship filtering
- 📐 **Filter State Protocol** - Declarative `FilterStateDescriptor` for all 29 filters
- 🚦 **Database Driver Fail-Fast** - Runtime driver compatibility checks with clear errors
- 🔄 **Sort Presets** - Quick sort shortcuts with export/import support
- 🔗 **Nested Relationships** - Deep path filtering (`author.company.country`)
- 🔎 **Remote Search** - Server-side search for SelectTableFilter (large datasets)
- 📊 **Capability Matrix** - Auto-generated via `php artisan dcat-filters:matrix`

### Advanced Features
- 🔄 **Reset All Filters** - One-click reset button for all active filters
- 💾 **Filter State Persistence** - Remember filter states across sessions
- 🔗 **URL Query Parameter Sync** - Shareable filter URLs without page reload
- 🔗 **Cascading Select Filter** - Dynamic dependent dropdowns
- ♿ **Accessibility Support** - ARIA labels and keyboard navigation
- 📋 **Filter Presets** - Save and load filter combinations
- 🔢 **Scope Badge Counts** - Display record counts on scope tabs
- 📤 **Filter Export/Import** - Share filter configurations via URL or JSON
- 🔄 **Sort Presets** - Quick sort shortcuts with shareable state

### Additional Features
- 🎨 **Highly Customizable** - Extensive customization options for each filter
- 📱 **Mobile Friendly** - Responsive design for all screen sizes
- 🌐 **Bilingual Docs** - Complete English and Chinese documentation
- ✅ **Fully Tested** - Comprehensive test coverage with 1073 tests

## Version Compatibility

| Filament | Filament Dcat Filters | PHP    | Laravel |
|----------|----------------------|--------|---------|
| 5.x      | 2.x                  | ^8.3   | ^12.0 \| ^13.0 |
| 4.x      | 2.x                  | ^8.3   | ^12.0 \| ^13.0 |

## Installation

You can install the package via composer:

```bash
composer require cooper/filament-dcat-filters
```

Optionally, you can publish the config file:

```bash
php artisan vendor:publish --tag="filament-dcat-filters-config"
```

Optionally, you can publish the views:

```bash
php artisan vendor:publish --tag="filament-dcat-filters-views"
```

## Quick Start

### Scope Filter

Perfect for quick filtering with tab-style buttons:

```php
use Cooper\FilamentDcatFilters\Filters\ScopeFilter;

ScopeFilter::make('status')
    ->scopes([
        'all' => 'All',
        'active' => 'Active',
        'inactive' => 'Inactive',
    ])
```

**[View detailed documentation →](docs/en/scope-filter.md)**

### Range Filter

Simplified date/number range filtering:

```php
use Cooper\FilamentDcatFilters\Filters\RangeFilter;

RangeFilter::make('created_at')->datetime()
```

**[View detailed documentation →](docs/en/range-filter.md)**

### SelectTable Filter

Modal table selector with search and pagination:

```php
use Cooper\FilamentDcatFilters\Filters\SelectTableFilter;

SelectTableFilter::make('user_id')
    ->relationship('user', 'name')
    ->multiple()
```

**[View detailed documentation →](docs/en/select-table-filter.md)**

### Date Component Filter

Filter by year, month, or day components:

```php
use Cooper\FilamentDcatFilters\Filters\DateComponentFilter;

DateComponentFilter::make('created_at')->year()
DateComponentFilter::make('birth_date')->month()
DateComponentFilter::make('published_at')->day()
```

**[View detailed documentation →](docs/en/date-component-filter.md)**

### Modal Select Filter

Dcat Admin style modal with full table display:

```php
use Cooper\FilamentDcatFilters\Filters\ModalSelectFilter;

ModalSelectFilter::make('user_id')
    ->model(User::class, 'name', 'id')
    ->dialogTitle('Select User')
    ->displayColumns(['id' => 'ID', 'name' => 'Name', 'email' => 'Email'])
    ->searchable(['name', 'email'])
    ->multiple()
```

**[View detailed documentation →](docs/en/modal-select-filter.md)**

### Quick Filters

Built-in filters for common operations:

```php
use Cooper\FilamentDcatFilters\Filters\{LikeFilter, InFilter, ComparisonFilter, BetweenFilter};

// LIKE search (with NOT LIKE support)
LikeFilter::make('title'),
LikeFilter::make('spam_keywords')->notLike(), // Exclude matches

// IN array (with NOT IN support)
InFilter::make('category_id')
    ->options(Category::pluck('name', 'id')->toArray()),
InFilter::make('blocked_users')->notIn(), // Exclude selected

// Comparison (>, <, =, >=, <=, !=)
ComparisonFilter::make('views')->gte()->label('Minimum Views'),

// Between (numeric range)
BetweenFilter::make('price')->label('Price Range'),
```

**[View detailed documentation →](docs/en/quick-filters.md)**

### Boolean Filter

Dedicated true/false/all toggle for boolean fields:

```php
use Cooper\FilamentDcatFilters\Filters\BooleanFilter;

BooleanFilter::make('is_active')
    ->label('Status')
    ->trueLabel('Active')
    ->falseLabel('Inactive')

// Quick presets
BooleanFilter::active()      // is_active field
BooleanFilter::published()   // is_published field
BooleanFilter::enabled()     // is_enabled field
```

### Null Filter

Filter for NULL or NOT NULL values:

```php
use Cooper\FilamentDcatFilters\Filters\NullFilter;

NullFilter::make('deleted_at')
    ->nullLabel('Not Deleted')
    ->notNullLabel('Deleted')

// Quick presets
NullFilter::deleted()    // deleted_at field
NullFilter::assigned()   // Check if field is assigned
NullFilter::empty()      // Check if field is empty/filled
```

### Enum Filter

Auto-generate options from PHP 8.1+ Enum classes:

```php
use Cooper\FilamentDcatFilters\Filters\EnumFilter;

EnumFilter::make('status')
    ->enum(OrderStatus::class)
    ->multiple()
    ->exclude([OrderStatus::Cancelled])
```

### FullText Filter

Search across multiple fields simultaneously:

```php
use Cooper\FilamentDcatFilters\Filters\FullTextFilter;

FullTextFilter::make('search')
    ->searchIn(['name', 'email', 'phone'])
    ->placeholder('Search users...')
    ->minLength(2)
    ->debounce(300)
```

### Relative Date Filter

Pre-defined date range shortcuts:

```php
use Cooper\FilamentDcatFilters\Filters\RelativeDateFilter;

RelativeDateFilter::make('created_at')
    ->only(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month'])

// Quick presets
RelativeDateFilter::common()     // Common date ranges
RelativeDateFilter::weekly()     // Week/month focused
RelativeDateFilter::reporting()  // Quarter/year focused
```

### Hidden Filter

URL parameter-based filtering (no UI):

```php
use Cooper\FilamentDcatFilters\Filters\HiddenFilter;

// Pre-filter by tenant
HiddenFilter::make('tenant_id')
    ->default(auth()->user()->tenant_id)
    ->eq()
```

**[View detailed documentation →](docs/en/advanced-features.md#hiddenfilter-usage-guide)**

### SoftDelete Filter

Control soft-deleted record visibility:

```php
use Cooper\FilamentDcatFilters\Filters\SoftDeleteFilter;

SoftDeleteFilter::make('trashed')
// Or toggle mode:
SoftDeleteFilter::make('trashed')->toggle()
```

**[View detailed documentation →](docs/en/soft-delete-filter.md)**

### Exists Filter

Filter by relationship existence:

```php
use Cooper\FilamentDcatFilters\Filters\ExistsFilter;

ExistsFilter::make('has_comments')->relationship('comments')
ExistsFilter::make('no_orders')->relationship('orders')->notExists()
```

**[View detailed documentation →](docs/en/exists-filter.md)**

### Aggregate Filter

Filter by relationship aggregate values:

```php
use Cooper\FilamentDcatFilters\Filters\AggregateFilter;

AggregateFilter::make('order_count')
    ->relationship('orders')
    ->count()
    ->gte()
```

**[View detailed documentation →](docs/en/aggregate-filter.md)**

### Column Compare Filter

Compare two database columns:

```php
use Cooper\FilamentDcatFilters\Filters\ColumnCompareFilter;

ColumnCompareFilter::make('profitable')
    ->leftColumn('price')
    ->rightColumn('cost')
    ->gt()
```

**[View detailed documentation →](docs/en/column-compare-filter.md)**

### Advanced JSON Filter

Structural JSON queries:

```php
use Cooper\FilamentDcatFilters\Filters\AdvancedJsonFilter;

AdvancedJsonFilter::make('tags')->arrayContains()
AdvancedJsonFilter::make('metadata')->pathExists('settings.theme')
AdvancedJsonFilter::make('config')->hasKey('notifications')
```

**[View detailed documentation →](docs/en/advanced-json-filter.md)**

### Timezone Aware Date Filter

Date range with automatic timezone conversion:

```php
use Cooper\FilamentDcatFilters\Filters\TimezoneAwareDateFilter;

TimezoneAwareDateFilter::make('created_at')
    ->userTimezone('Asia/Shanghai')
```

**[View detailed documentation →](docs/en/timezone-aware-date-filter.md)**

### Morph Relation Filter

Polymorphic relationship filtering:

```php
use Cooper\FilamentDcatFilters\Filters\MorphRelationFilter;

// MorphTo mode
MorphRelationFilter::make('commentable')
    ->morphTo()
    ->types(['post' => Post::class, 'video' => Video::class])

// MorphToMany mode
MorphRelationFilter::make('tags')
    ->morphToMany()
    ->model(Tag::class)
    ->titleColumn('name')
```

**[View detailed documentation →](docs/en/morph-relation-filter.md)**

### Remote Search (Server-Side)

For large datasets, use server-side search:

```php
SelectTableFilter::make('user_id')
    ->model(User::class)
    ->remoteSearch()
    ->searchColumns(['name', 'email'])
    ->searchDebounce(300)
```

**[View detailed documentation →](docs/en/select-table-filter.md#remote-search-server-side)**

### Reset All Filters

Add a one-click reset button:

```php
use Cooper\FilamentDcatFilters\Concerns\HasResetFilters;

class ListUsers extends ListRecords
{
    use HasResetFilters;

    protected function getHeaderActions(): array
    {
        return [
            $this->getResetFiltersAction(),
        ];
    }
}
```

**[View detailed documentation →](docs/en/reset-filters.md)**

### Filter State Persistence

Remember filter states across sessions:

```php
use Cooper\FilamentDcatFilters\Concerns\HasFilterPersistence;

class ListUsers extends ListRecords
{
    use HasFilterPersistence;

    protected string $filterPersistenceKey = 'users-list-filters';
}
```

**[View detailed documentation →](docs/en/filter-persistence.md)**

### URL Query Parameter Sync

Shareable filter URLs:

```php
use Cooper\FilamentDcatFilters\Concerns\SyncsFiltersToUrlWithoutHistory;

class ListUsers extends ListRecords
{
    use SyncsFiltersToUrlWithoutHistory;
}
```

**[View detailed documentation →](docs/en/url-sync.md)**

### Cascading Select Filter

Dynamic dependent dropdowns:

```php
use Cooper\FilamentDcatFilters\Filters\CascadingSelectFilter;

CascadingSelectFilter::make('location')
    ->levels([
        'country' => [
            'label' => 'Country',
            'options' => fn () => Country::pluck('name', 'id'),
        ],
        'state' => [
            'label' => 'State',
            'options' => fn ($country) => State::where('country_id', $country)->pluck('name', 'id'),
            'dependsOn' => 'country',
        ],
        'city' => [
            'label' => 'City',
            'options' => fn ($state) => City::where('state_id', $state)->pluck('name', 'id'),
            'dependsOn' => 'state',
        ],
    ])
```

**[View detailed documentation →](docs/en/cascading-filters.md)**

## Documentation

### Core Filters
- 📖 [Scope Filter](docs/en/scope-filter.md) - Tab-style quick filters
- 📖 [Range Filter](docs/en/range-filter.md) - Date/number range filtering
- 📖 [Date Component Filter](docs/en/date-component-filter.md) - Year/Month/Day filtering
- 📖 [SelectTable Filter](docs/en/select-table-filter.md) - Modal table selector
- 📖 [Modal Select Filter](docs/en/modal-select-filter.md) - Dcat Admin style modal table selector
- 📖 [Quick Filters](docs/en/quick-filters.md) - LIKE, IN, GT, LT, BETWEEN filters

### Specialized Filters
- 📖 [JSON Filter](docs/en/json-filter.md) - Query JSON/JSONB columns with path access
- 📖 [FindInSet Filter](docs/en/find-in-set-filter.md) - Query comma-separated values
- 📖 [Regex Filter](docs/en/regex-filter.md) - Pattern matching with regular expressions
- 📖 [InputMask Filter](docs/en/input-mask-filter.md) - Formatted input with masks
- 📖 [GeoLocation Filter](docs/en/geo-location-filter.md) - Geographic proximity filtering
- 📖 [Filter Group](docs/en/filter-group.md) - Combine filters with AND/OR logic

### New Filter Types
- 📖 [SoftDelete Filter](docs/en/soft-delete-filter.md) - Soft delete visibility control
- 📖 [Exists Filter](docs/en/exists-filter.md) - Relationship existence filtering
- 📖 [Aggregate Filter](docs/en/aggregate-filter.md) - Relationship aggregate filtering
- 📖 [Column Compare Filter](docs/en/column-compare-filter.md) - Column comparison
- 📖 [Advanced JSON Filter](docs/en/advanced-json-filter.md) - Structural JSON queries
- 📖 [Timezone Aware Date Filter](docs/en/timezone-aware-date-filter.md) - Timezone conversion
- 📖 [Morph Relation Filter](docs/en/morph-relation-filter.md) - Polymorphic relationships
- 📖 [Capability Matrix](docs/en/capability-matrix.md) - Auto-generated filter capabilities

### Advanced Features
- 📖 [Reset All Filters](docs/en/reset-filters.md) - One-click reset functionality
- 📖 [Filter State Persistence](docs/en/filter-persistence.md) - Session-based filter memory
- 📖 [URL Query Parameter Sync](docs/en/url-sync.md) - Shareable filter URLs
- 📖 [Cascading Select Filter](docs/en/cascading-filters.md) - Dynamic dependent dropdowns
- 📖 [Accessibility](docs/en/accessibility.md) - ARIA labels and keyboard support
- 📖 [Advanced Features](docs/en/advanced-features.md) - API support, Hidden filters
- 📖 [Concerns (Traits)](docs/en/concerns-traits.md) - Filter presets, badge counts, export/import

### Guides & References
- 📖 [Usage Examples](docs/en/usage-example.md) - Complete working examples
- 📖 [Demo Guide](docs/en/demo-guide.md) - Interactive demonstrations
- 📖 [Comparison with Dcat Admin](docs/en/comparison.md) - Feature comparison
- 📖 [Package Structure](docs/en/package-structure.md) - Package architecture
- 📖 [Documentation Structure](docs/en/documentation-structure.md) - Documentation organization
- 📖 [Future Improvements](docs/en/future-improvements.md) - Roadmap and planned features

## Facade Usage

You can also use the Facade for quick access:

```php
use Cooper\FilamentDcatFilters\Facades\FilamentDcatFilters;

FilamentDcatFilters::scopeFilter('status')->scopes([...]);
FilamentDcatFilters::rangeFilter('created_at')->datetime();

// All available filter shortcuts
FilamentDcatFilters::booleanFilter('is_active');
FilamentDcatFilters::nullFilter('deleted_at');
FilamentDcatFilters::enumFilter('status');
FilamentDcatFilters::fullTextFilter('search');
FilamentDcatFilters::hiddenFilter('tenant_id');
FilamentDcatFilters::filterGroup('combined');
FilamentDcatFilters::softDeleteFilter('trashed');
FilamentDcatFilters::existsFilter('has_comments');
FilamentDcatFilters::aggregateFilter('order_count');
FilamentDcatFilters::columnCompareFilter('profitable');
FilamentDcatFilters::advancedJsonFilter('tags');
FilamentDcatFilters::timezoneAwareDateFilter('created_at');
FilamentDcatFilters::morphRelationFilter('commentable');
```

## Artisan Command

Generate a custom filter class using the Artisan command:

```bash
php artisan make:dcat-filter MyCustom
```

This creates `app/Filament/Filters/MyCustomFilter.php`.

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Filter type to extend | `basic` |
| `--force` | Overwrite existing file | `false` |

### Available Types

| Type | Base Class |
|------|-----------|
| `basic` | `Filament\Tables\Filters\Filter` |
| `like` | `LikeFilter` |
| `in` | `InFilter` |
| `comparison` | `ComparisonFilter` |
| `boolean` | `BooleanFilter` |
| `null` | `NullFilter` |
| `enum` | `EnumFilter` |
| `range` | `RangeFilter` |
| `between` | `BetweenFilter` |
| `scope` | `ScopeFilter` |
| `regex` | `RegexFilter` |
| `fulltext` | `FullTextFilter` |
| `json` | `JsonFilter` |
| `date-component` | `DateComponentFilter` |
| `select-table` | `SelectTableFilter` |
| `modal-select` | `ModalSelectFilter` |
| `hidden` | `HiddenFilter` |
| `relative-date` | `RelativeDateFilter` |
| `cascading-select` | `CascadingSelectFilter` |
| `find-in-set` | `FindInSetFilter` |
| `input-mask` | `InputMaskFilter` |
| `geo-location` | `GeoLocationFilter` |
| `filter-group` | `FilterGroup` |
| `soft-delete` | `SoftDeleteFilter` |
| `exists` | `ExistsFilter` |
| `aggregate` | `AggregateFilter` |
| `column-compare` | `ColumnCompareFilter` |
| `advanced-json` | `AdvancedJsonFilter` |
| `timezone-date` | `TimezoneAwareDateFilter` |
| `morph-relation` | `MorphRelationFilter` |

### Examples

```bash
# Create a basic filter
php artisan make:dcat-filter ProductStatus

# Create a filter extending LikeFilter
php artisan make:dcat-filter ProductSearch --type=like

# Create a filter extending ComparisonFilter
php artisan make:dcat-filter MinPrice --type=comparison

# Overwrite existing
php artisan make:dcat-filter ProductStatus --force
```

## Capability Matrix

Generate a capability matrix of all filters:

```bash
php artisan dcat-filters:matrix
php artisan dcat-filters:matrix --format=json
php artisan dcat-filters:matrix --output=docs/matrix.md
```

See the [full capability matrix](docs/en/capability-matrix.md).

## Testing

```bash
composer test
```

## Code Quality

```bash
# Format code
composer format

# Static analysis
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you discover any security-related issues, please email `myxiaoao@gmail.com`.

## Credits

- [Cooper](https://github.com/myxiaoao)
- Inspired by [Dcat Admin](https://github.com/jqhph/dcat-admin)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
