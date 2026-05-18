# Paged Index for Laravel

Paged Index helps you build server-driven, paginated listings in Laravel applications. It exposes a fluent API for combining filtering, sorting, eager-loading relationships, pagination, and optional resource transformation into a single response object.

## Requirements
- Laravel 11 or 12

## Installation
1. Install the package:
   ```bash
   composer require m3team/paged-index
   ```
2. (Optional) Publish the configuration to customize request key names and defaults:
   ```bash
   php artisan vendor:publish --tag=paged-index-config
   ```

## Request keys
By default, the library reads these query-string keys (all configurable in `config/paged-index.php`):
- `page_index` – zero-based page number.
- `page_size` – number of items per page.
- `sort_column` – allowed column or key defined via `allowedSorts()`.
- `sort_direction` – `asc` or `desc`.
- `filters[]` – keyed filter values matched against `allowedFilters()`.
- `relationships[]` – relationships to eager load when using an Eloquent builder, subject to `allowedRelationships()`.

## Quick start
Use `PagedIndex::fromRequest()` to turn an Eloquent or query builder into a paginated response.

```php
use App\Http\Resources\UserResource;
use App\Models\User;
use M3Team\PagedIndex\PagedIndex;

class UserController
{
    public function index()
    {
        return PagedIndex::fromRequest(User::query(), UserResource::class)
            ->allowedSorts(['id', 'name', 'email'])
            ->allowedFilters([
                'name' => 'name',                 // simple where
                'email' => fn ($q, $value) => $q->where('email', 'like', "%{$value}%"),
            ])
            ->allowedRelationships([
                'posts',
                'profile' => fn ($query) => $query->where('active', true),
            ])
            ->getObjects();
    }
}
```

The returned `PagedIndexCollection` JSON structure is:
```json
{
  "objects": [/* transformed items */],
  "total": 42,
  "page_index": 0,
  "page_size": 15
}
```

### How it works
1. Query parameters are validated and merged with defaults.
2. Allowed relationships are eager loaded only when they are allowlisted with `allowedRelationships()` and only on Eloquent builders.
3. Sorting and filtering are applied using the `allowedSorts`/`allowedFilters` map you provide. Each entry can be a column name or a closure receiving the builder.
4. Pagination skips/limits the query when `page_size` is greater than zero.
5. The collection is optionally transformed with a Laravel API resource class, then wrapped in `PagedIndexCollection`.

## Generator command
Create a plain application class for paged-index composition:
```bash
php artisan make:paged_index UserPagedIndex
```
Classes are placed in `app/Http/PagedIndexes`.

## Deprecated class
The legacy `DatabasePagedIndex` remains for backward compatibility but is deprecated as of v5. Use `PagedIndex` for new code.
