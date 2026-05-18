# Laravel Fast CRUD

[![CI](https://github.com/dev-toolbelt/laravel-fast-crud/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-toolbelt/laravel-fast-crud/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/dev-toolbelt/laravel-fast-crud/branch/main/graph/badge.svg)](https://codecov.io/gh/dev-toolbelt/laravel-fast-crud)
[![Latest Stable Version](https://poser.pugx.org/dev-toolbelt/laravel-fast-crud/v/stable)](https://packagist.org/packages/dev-toolbelt/laravel-fast-crud)
[![Total Downloads](https://poser.pugx.org/dev-toolbelt/laravel-fast-crud/downloads)](https://packagist.org/packages/dev-toolbelt/laravel-fast-crud)
[![License](https://poser.pugx.org/dev-toolbelt/laravel-fast-crud/license)](https://packagist.org/packages/dev-toolbelt/laravel-fast-crud)
[![PHP Version](https://img.shields.io/packagist/php-v/dev-toolbelt/laravel-fast-crud)](https://packagist.org/packages/dev-toolbelt/laravel-fast-crud)

A powerful Laravel package for rapid CRUD API scaffolding. Build complete RESTful APIs in minutes with minimal boilerplate, following best practices and the [JSend specification](https://github.com/omniti-labs/jsend).

## Features

- Works exclusively with Laravel 11+
- 9 pre-built actions (Create, Read, Update, Delete, Soft Delete, Restore, Search, Options, Export CSV)
- 14+ search operators for flexible filtering (eq, like, between, in, json, etc.)
- Multi-field term search via `filter[term]` with database-aware `LIKE`/`ILIKE`
- Built-in validation using Laravel's validation rules
- Automatic route registration with permission middleware support
- Hook system for customization without overriding entire methods
- Global and per-action configuration
- Soft delete with audit trail (who deleted and when)
- CSV export with custom column mapping and dot notation support
- Consistent API responses following JSend specification

## Requirements

- PHP ^8.2
- Laravel ^11.0

## Installation

```bash
composer require dev-toolbelt/laravel-fast-crud
```

Publish the configuration (optional):

```bash
php artisan vendor:publish --tag=fast-crud-config
```

## Quick Start

### 1. Create a Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use DevToolbelt\LaravelFastCrud\CrudController;

class ProductController extends CrudController
{
    protected function modelClassName(): string
    {
        return Product::query()->class;
    }
}
```

### 2. Register Routes

```php
use App\Http\Controllers\ProductController;
use DevToolbelt\LaravelFastCrud\Router;

Router::crud('products', ProductController::class, 'products');
```

That's it! You now have a complete CRUD API.

## Available Actions

| Action | Method | Route | Permission | Description |
|--------|--------|-------|------------|-------------|
| Search | `GET` | `/products` | `{module}.access.search` | List with filtering, sorting, pagination |
| Create | `POST` | `/products` | `{module}.access.create` | Create a new record |
| Read | `GET` | `/products/{id}` | `{module}.access.view` | Get a single record |
| Update | `PUT/PATCH` | `/products/{id}` | `{module}.access.update` | Update a record |
| Delete | `DELETE` | `/products/{id}` | `{module}.access.delete` | Permanently delete a record |
| Soft Delete | `DELETE` | `/products/{id}/soft` | `{module}.access.delete` | Soft delete with audit |
| Restore | `PATCH/PUT` | `/products/{id}/restore` | `{module}.access.restore` | Restore a soft deleted record |
| Options | `GET` | `/products/options` | **none** | Label-value pairs for HTML selects |
| Export CSV | `GET` | `/products/export-csv` | `{module}.access.exportCsv` | Export filtered data to CSV |

> **Note:** The `Options` route (`GET /options`) has no permission middleware and is always publicly
> accessible (subject to any other middleware applied to the surrounding route group). This makes it
> easy to populate HTML `<select>` fields and dropdowns without requiring the user to have explicit
> permissions.

## Search Operators

Filter your data with powerful operators via query string:

```
GET /products?filter[name][like]=Samsung&filter[price][gte]=100&filter[status][in]=active,pending
```

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `filter[status][eq]=active` |
| `neq` | Not equals | `filter[status][neq]=deleted` |
| `like` | Contains (ILIKE %value%) | `filter[name][like]=phone` |
| `in` | In list | `filter[status][in]=a,b,c` |
| `nin` | Not in list | `filter[status][nin]=x,y` |
| `gt` | Greater than | `filter[price][gt]=100` |
| `gte` | Greater than or equal | `filter[price][gte]=100` |
| `lt` | Less than | `filter[price][lt]=500` |
| `lte` | Less than or equal | `filter[price][lte]=500` |
| `btw` | Between (dates or numbers) | `filter[created_at][btw]=2024-01-01,2024-12-31` |
| `gtn` | Greater than or NULL | `filter[stock][gtn]=10` |
| `ltn` | Less than or NULL | `filter[stock][ltn]=5` |
| `nn` | Not null | `filter[deleted_at][nn]=1` |
| `json` | JSON contains | `filter[tags][json]=electronics` |

## Term Search

In addition to operator-based filters, Search supports a configurable term filter
that matches multiple fields using `LIKE` (MySQL/SQLite) or `ILIKE` (PostgreSQL).

### Usage

```
GET /products?filter[term]=john
```

### Controller Configuration

```php
class ProductController extends CrudController
{
    // Query key used in filter[...] (default: term)
    protected string $termFieldName = 'term';

    // Fields used in the generated where/orWhere block
    protected array $termFields = ['login', 'name', 'email'];
}
```

### Query Generated (Example)

For PostgreSQL, `filter[term]=john` with the fields above generates a query equivalent to:

```php
$query->where(function (Builder $query) use ($term): void {
    $query->where('login', 'ILIKE', "%{$term}%")
        ->orWhere('name', 'ILIKE', "%{$term}%")
        ->orWhere('email', 'ILIKE', "%{$term}%");
});
```

### Custom Term Key

```php
class ProductController extends CrudController
{
    protected string $termFieldName = 'q';
    protected array $termFields = ['name', 'sku'];
}
```

```
GET /products?filter[q]=galaxy
```

## Sorting

Sort by one or multiple fields (prefix with `-` for descending):

```
GET /products?sort=name              # ASC by name
GET /products?sort=-created_at       # DESC by created_at
GET /products?sort=category,-price   # ASC category, DESC price
```

## Pagination

```
GET /products?page=2                 # Go to page 2
GET /products?perPage=20             # 20 items per page (default: 40)
GET /products?page=3&perPage=10      # Page 3 with 10 items per page
GET /products?skipPagination=true    # Return all records
```

## Available Hooks

Customize behavior by overriding hooks in your controller:

| Action | Available Hooks |
|--------|-----------------|
| Create | `createValidateRules()`, `beforeCreateFill()`, `beforeCreate()`, `afterCreate()` |
| Read | `modifyReadQuery()`, `afterRead()` |
| Update | `updateValidateRules()`, `modifyUpdateQuery()`, `beforeUpdateFill()`, `beforeUpdate()`, `afterUpdate()` |
| Delete | `modifyDeleteQuery()`, `beforeDelete()`, `afterDelete()` |
| Soft Delete | `modifySoftDeleteQuery()`, `beforeSoftDelete()`, `afterSoftDelete()`, `getSoftDeleteUserId()` |
| Restore | `modifyRestoreQuery()`, `beforeRestore()`, `afterRestore()` |
| Search | `modifySearchQuery()`, `modifyFilters()`, `afterSearch()` |
| Options | `modifyOptionsQuery()`, `afterOptions()` |
| Export CSV | `modifyExportCsvQuery()` |

### Hook Examples

```php
class ProductController extends CrudController
{
    protected function modelClassName(): string
    {
        return Product::query()->class;
    }

    // Add data before filling the model
    protected function beforeCreateFill(array &$data): void
    {
        $data['created_by'] = auth()->id();
    }

    // Modify data before saving
    protected function beforeCreate(array &$data): void
    {
        $data['slug'] = Str::slug($data['name']);
    }

    // Dispatch events after creation
    protected function afterCreate(Model $record): void
    {
        event(new ProductCreated($record));
    }

    // Add eager loading and scopes to search
    protected function modifySearchQuery(Builder $query): void
    {
        $query->with(['category', 'brand'])
              ->where('is_active', true);
    }

    // Modify filters before they are applied to the query
    protected function modifyFilters(array $filters): array
    {
        // Force a filter regardless of what the client sends
        $filters['is_visible'] = ['eq' => true];

        // Remove a filter that should not be used by the client
        unset($filters['internal_code']);

        return $filters;
    }

    // Provide user ID for soft delete audit
    protected function getSoftDeleteUserId(): ?int
    {
        return auth()->id();
    }

    // Define validation rules for create
    protected function createValidateRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
        ];
    }

    // Define validation rules for update
    protected function updateValidateRules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
```

## Validation

The package provides built-in validation using Laravel's validation system. Define rules by overriding `createValidateRules()` or `updateValidateRules()` methods.

### Validation Error Response

When validation fails, a 400 response is returned with detailed error information:

```json
{
    "status": "fail",
    "data": [
        {
            "field": "email",
            "error": "required",
            "value": null,
            "message": "The email field is required."
        },
        {
            "field": "price",
            "error": "numeric",
            "value": "not-a-number",
            "message": "The price field must be a number."
        }
    ],
    "meta": []
}
```

Each error includes:
- `field`: The field that failed validation
- `error`: The rule name (e.g., `required`, `email`, `max`, `unique`)
- `value`: The submitted value
- `message`: Laravel's validation message

For detailed validation documentation, see:
- [Create Action - Validation](docs/create.md#validation)
- [Update Action - Validation](docs/update.md#validation)

## Configuration

```php
// config/devToolbelt/fast-crud.php

use DevToolbelt\Enums\Http\HttpStatusCode;

return [
    // Global settings (applied to all actions)
    'global' => [
        'find_field' => 'id',           // Field to find records by
        'find_field_is_uuid' => false,  // Validate as UUID before querying
        'validation' => [
            'http_status' => HttpStatusCode::BAD_REQUEST->value, // 400
        ],
    ],

    // Per-action settings (override global)
    'create' => [
        'method' => 'toArray',          // Model method called to serialize the record in the response
        'http_status' => HttpStatusCode::CREATED->value, // 201
    ],
    'read' => [
        'method' => 'toArray',          // Model method called to serialize the record in the response
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'update' => [
        'method' => 'toArray',          // Model method called to serialize the record in the response
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'delete' => [
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'soft_delete' => [
        'deleted_at_field' => 'deleted_at',
        'deleted_by_field' => 'deleted_by',
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'restore' => [
        'method' => 'toArray',          // Model method called to serialize the record in the response
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'search' => [
        'method' => 'toArray',          // Model method called to serialize each record in the response
        'per_page' => 40,
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'options' => [
        'default_value' => 'id',
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
    'export_csv' => [
        'method' => 'toArray',          // Model method called to serialize each record before export
        'http_status' => HttpStatusCode::OK->value, // 200
    ],
];
```

### Configurable HTTP Status Codes

Each action supports a configurable `http_status` option to customize the HTTP status code returned on successful responses:

```php
// Return 202 Accepted instead of 201 Created
'create' => [
    'method' => 'toArray',
    'http_status' => HttpStatusCode::ACCEPTED->value, // 202
],

// Return 204 No Content instead of 200 OK for delete
'delete' => [
    'http_status' => HttpStatusCode::NO_CONTENT->value, // 204
],
```

### Validation Error HTTP Status

All validation errors (empty payload, invalid UUID, required field, column not found) use the `global.validation.http_status` configuration:

```php
'global' => [
    'validation' => [
        'http_status' => HttpStatusCode::BAD_REQUEST->value, // 400 (default)
    ],
],
```

To return a different status code for validation errors:

```php
'global' => [
    'validation' => [
        'http_status' => HttpStatusCode::UNPROCESSABLE_ENTITY->value, // 422
    ],
],
```

Available status codes are defined in the `DevToolbelt\Enums\Http\HttpStatusCode` enum.

## Selective Route Registration

Include or exclude specific actions:

```php
// Only search and read (read-only API)
Router::crud('products', ProductController::class, 'products',
    only: ['search', 'read']
);

// Everything except permanent delete
Router::crud('products', ProductController::class, 'products',
    except: ['delete']
);
```

## CSV Export

Configure CSV export with custom columns and nested relationships:

```php
class ProductController extends CrudController
{
    protected string $csvFileName = 'products.csv';

    protected array $csvColumns = [
        'name' => 'Product Name',
        'category.name' => 'Category',    // Dot notation for relationships
        'price' => 'Price',
        'created_at' => 'Created At',
    ];
}
```

## API Response Format

All responses follow the [JSend specification](https://github.com/omniti-labs/jsend):

**Success Response:**
```json
{
    "status": "success",
    "data": { ... }
}
```

**Success with Pagination:**
```json
{
    "status": "success",
    "data": [ ... ],
    "meta": {
        "pagination": {
            "current": 1,
            "perPage": 40,
            "pagesCount": 5,
            "count": 200
        }
    }
}
```

**Fail Response (client error):**
```json
{
    "status": "fail",
    "data": [
        {
            "field": "id",
            "error": "recordNotFound",
            "message": "The record was not found with the given id"
        }
    ],
    "meta": []
}
```

**Empty Payload Error:**
```json
{
    "status": "fail",
    "data": [
        {
            "error": "emptyPayload",
            "message": "It was send a empty payload"
        }
    ],
    "meta": []
}
```

**Invalid UUID Error:**
```json
{
    "status": "fail",
    "data": [
        {
            "field": "id",
            "error": "invalidUuidFormat",
            "message": "The provided uuid format is invalid"
        }
    ],
    "meta": []
}
```

## Documentation

Detailed documentation for each component:

**Core:**
- [Router](docs/router.md) - Route registration and permission middleware

**Actions:**
- [Create Action](docs/create.md)
- [Read Action](docs/read.md)
- [Update Action](docs/update.md)
- [Delete Action](docs/delete.md)
- [Soft Delete Action](docs/soft-delete.md)
- [Restore Action](docs/restore.md)
- [Search Action](docs/search.md)
- [Options Action](docs/options.md)
- [Export CSV Action](docs/export-csv.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dev-toolbelt/laravel-fast-crud.git
cd laravel-fast-crud

# Install dependencies
composer install

# Run tests
composer test

# Run tests with coverage (requires PCOV or Xdebug)
composer test:coverage

# Check code style
composer phpcs

# Fix code style
composer phpcs:fix

# Run static analysis
composer phpstan
```

### Code Quality Requirements

| Check | Tool | Requirement |
|-------|------|-------------|
| Tests | PHPUnit | All tests must pass |
| Coverage | PCOV | Minimum **85%** coverage |
| Code Style | PHP CodeSniffer | PSR-12 compliant |
| Static Analysis | PHPStan | Level 6, no errors |

### Pull Request Guidelines

Before submitting a PR, ensure:

1. **All tests pass:** `composer test`
2. **Coverage is at least 85%:** `composer test:coverage`
3. **Code style is correct:** `composer phpcs`
4. **No static analysis errors:** `composer phpstan`

> **Important:** Pull requests with coverage below 85% will be automatically blocked by CI.

### Coverage Report

- **Dashboard:** [Codecov](https://codecov.io/gh/dev-toolbelt/laravel-fast-crud)
- **HTML Report:** [GitHub Pages](https://dev-toolbelt.github.io/laravel-fast-crud/)

## License

MIT License. See [LICENSE](LICENSE) for details.
