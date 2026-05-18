# Apilot — Rest API Package for Laravel

> Rapid REST API development with model-based and service-based CRUD controllers, automatic OpenAPI 3.0.3 documentation, and a flexible hook system.

## Features

- **Model-based CRUD** — Extend `ModelCrudController`, set `$model`, get five fully working endpoints with zero boilerplate.
- **Service-based CRUD** — Extend `ServiceCrudController` and implement `CrudServiceInterface` for non-Eloquent data sources (external APIs, custom repositories).
- **Lifecycle hooks** — Intercept and modify any CRUD operation via a comprehensive set of hooks (`beforeStore`, `afterStore`, `modifyIndexQuery`, `beforeDestroy`, …).
- **Automatic filtering, sorting, and pagination** — Declare allowed fields; the package handles the query logic.
- **OpenAPI 3.0.3 generation** — Live spec at `/api/doc`, exportable via Artisan command, with optional built-in validation.
- **Attribute-based documentation** — `#[OpenApiMeta]` and `#[OpenApiProperty]` for fine-grained spec control.

## Requirements

- PHP 8.3+
- Laravel 12.x or 13.x

## Installation

```bash
composer require didasto/apilot
```

If your application does not use package auto-discovery, register the provider manually in `config/app.php`:

```php
'providers' => [
    Didasto\Apilot\ApilotServiceProvider::class,
],
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=apilot
```

## Quick Start

### Model-based Controller

**1. The Eloquent model** (`app/Models/Post.php`):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['title', 'body', 'status'];
}
```

**2. The controller** (`app/Http/Controllers/Api/PostController.php`):

```php
<?php

namespace App\Http\Controllers\Api;

use Didasto\Apilot\Controllers\ModelCrudController;
use Didasto\Apilot\Enums\AllowedFilter;
use App\Models\Post;

class PostController extends ModelCrudController
{
    protected string $model = Post::class;
    protected array $allowedFilters = ['status' => AllowedFilter::EXACT];
    protected array $allowedSorts   = ['title', 'created_at'];
}
```

**3. The route** (`routes/api.php`):

```php
use Didasto\Apilot\Routing\CrudRouteRegistrar;
use App\Http\Controllers\Api\PostController;

CrudRouteRegistrar::resource('posts', PostController::class);
```

**First request:**

```bash
curl http://localhost/api/posts
# {"data":[...],"meta":{"current_page":1,"last_page":1,"per_page":15,"total":2},"links":{...}}
```

### Service-based Controller

Use this approach when data lives outside your database — an external REST API, a legacy system, or a custom repository.

**1. The service** (`app/Services/ProductService.php`):

```php
<?php

namespace App\Services;

use Didasto\Apilot\Contracts\CrudServiceInterface;
use Didasto\Apilot\Dto\PaginatedResult;
use Didasto\Apilot\Dto\PaginationParams;

class ProductService implements CrudServiceInterface
{
    public function list(array $filters, array $sorting, PaginationParams $pagination): PaginatedResult
    {
        // Fetch from external API or custom source
        return new PaginatedResult(items: [], total: 0, perPage: $pagination->perPage, currentPage: $pagination->page);
    }

    public function find(int|string $id): mixed { /* ... */ }
    public function create(array $data): mixed   { /* ... */ }
    public function update(int|string $id, array $data): mixed { /* ... */ }
    public function delete(int|string $id): bool { /* ... */ }
}
```

**2. The controller** (`app/Http/Controllers/Api/ProductController.php`):

```php
<?php

namespace App\Http\Controllers\Api;

use App\Services\ProductService;
use Didasto\Apilot\Controllers\ServiceCrudController;

class ProductController extends ServiceCrudController
{
    protected string $serviceClass = ProductService::class;
}
```

**3. The route:**

```php
CrudRouteRegistrar::resource('products', ProductController::class)->only(['index', 'show']);
```

## Configuration

All options are in `config/apilot.php`:

| Key | Default | Description |
|-----|---------|-------------|
| `prefix` | `'api'` | Route prefix for all registered routes |
| `middleware` | `['api']` | Global middleware applied to all routes |
| `pagination.default_per_page` | `15` | Default items per page |
| `pagination.max_per_page` | `100` | Hard limit for `per_page` parameter |
| `pagination.per_page_param` | `'per_page'` | Query parameter name |
| `sorting.param` | `'sort'` | Query parameter name for sorting |
| `filtering.param` | `'filter'` | Query parameter name for filtering |
| `openapi.enabled` | `true` | Enable/disable the `/api/doc` route |
| `openapi.path` | `'doc'` | Path for the live spec (relative to prefix) |
| `openapi.info.title` | `APP_NAME . ' Documentation'` | OpenAPI spec title |
| `openapi.info.version` | `'1.0.0'` | OpenAPI spec version |
| `openapi.default_security` | `'bearer'` | Security scheme: `'bearer'`, `'basic'`, `'apiKey'`, or `null` |
| `openapi.export_path` | `storage_path('app/openapi.json')` | Default export path for Artisan command |

## Filtering

Declare allowed filters in your controller:

```php
use Didasto\Apilot\Enums\AllowedFilter;

protected array $allowedFilters = [
    'status' => AllowedFilter::EXACT,   // WHERE status = ?
    'title'  => AllowedFilter::PARTIAL, // WHERE title LIKE %?%
    'status' => AllowedFilter::SCOPE,   // $query->status($value) — calls a model scope
];
```

**Filter types:**

| Type | SQL | Example request |
|------|-----|-----------------|
| `EXACT` | `WHERE field = ?` | `?filter[status]=published` |
| `PARTIAL` | `WHERE field LIKE %?%` | `?filter[title]=laravel` |
| `SCOPE` | Calls `$query->fieldName($value)` | `?filter[status]=published` |

Empty filter values (`?filter[status]=`) are silently ignored.

## Sorting

Declare allowed sort fields in your controller:

```php
protected array $allowedSorts = ['title', 'created_at', 'status'];
```

**Request format:** `?sort=field` (ascending) or `?sort=-field` (descending). Multiple fields: `?sort=status,-created_at`.

Undeclared sort fields and array injections (`?sort[]=title`) are silently ignored.

## Pagination

All index endpoints return paginated responses.

```
GET /api/posts?page=2&per_page=25
```

**Response format:**

```json
{
    "data": [ ... ],
    "meta": {
        "current_page": 2,
        "last_page": 10,
        "per_page": 25,
        "total": 250
    },
    "links": {
        "first": "http://example.com/api/posts?page=1",
        "last":  "http://example.com/api/posts?page=10",
        "prev":  "http://example.com/api/posts?page=1",
        "next":  "http://example.com/api/posts?page=3"
    }
}
```

Non-numeric or negative `per_page` values fall back to the configured default. The value is capped at `max_per_page`. Non-numeric or negative `page` values default to `1`.

## Hook System

Override any hook method in your controller to intercept or modify the CRUD lifecycle.

### Hook Reference

| Hook | Called In | Parameters | Return | Description |
|------|-----------|------------|--------|-------------|
| `modifyIndexQuery` | `index` | `$query, $request` | `mixed` | Modify the query before filtering/sorting |
| `afterIndex` | `index` | `$result, $request` | `mixed` | Transform the paginator after fetching |
| `afterShow` | `show` | `$item, $request` | `mixed` | Transform the item after fetching |
| `beforeStore` | `store` | `$data, $request` | `array` | Modify or enrich validated data before insert |
| `afterStore` | `store` | `$item, $request` | `mixed` | Post-process the newly created item |
| `beforeUpdate` | `update` | `$item, $data, $request` | `array` | Modify data before update |
| `afterUpdate` | `update` | `$item, $request` | `mixed` | Post-process the updated item |
| `beforeDestroy` | `destroy` | `$item, $request` | `bool` | Return `false` to abort deletion (responds 403) |
| `afterDestroy` | `destroy` | `$item, $request` | `void` | Run cleanup after deletion |
| `transformResponse` | all except `destroy` | `$data, $action, $request` | `mixed` | Final transformation of the response data |
| `getStatusCode` | all | `$action` | `int` | Override response status code per action |

### Hook Execution Order

**index:** `modifyIndexQuery` → filtering → sorting → pagination → `afterIndex` → resource mapping → `transformResponse`

**show:** `afterShow` → resource wrap → `transformResponse`

**store:** validation → `beforeStore` → model create → `afterStore` → resource wrap → `transformResponse`

**update:** find → validation → `beforeUpdate` → model update → `afterUpdate` → resource wrap → `transformResponse`

**destroy:** find → `beforeDestroy` (false = 403) → delete → `afterDestroy`

### Example: Typical Hook Usage

```php
<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Didasto\Apilot\Controllers\ModelCrudController;
use App\Models\Post;

class PostController extends ModelCrudController
{
    protected string $model = Post::class;

    protected function beforeStore(array $data, Request $request): array
    {
        // Automatically attach the authenticated user
        $data['user_id'] = $request->user()->id;
        return $data;
    }

    protected function modifyIndexQuery(mixed $query, Request $request): mixed
    {
        // Show only the authenticated user's posts
        return $query->where('user_id', $request->user()->id);
    }

    protected function beforeDestroy(mixed $item, Request $request): bool
    {
        // Only the owner may delete their post
        return $item->user_id === $request->user()->id;
    }
}
```

## OpenAPI Documentation

### Live Spec

A live OpenAPI 3.0.3 spec is available at `/api/doc` (JSON) once routes are registered. Use it with Swagger UI:

```html
<SwaggerUI url="https://yourapp.com/api/doc" />
```

### Artisan Command

```bash
# Export spec to the configured path (storage/app/openapi.json by default)
php artisan apilot:generate-spec

# Output to stdout (pipe into sdk generators, etc.)
php artisan apilot:generate-spec --stdout

# Custom output path
php artisan apilot:generate-spec --path=public/openapi.json

# Validate the spec before saving (exits with status 1 on failure)
php artisan apilot:generate-spec --validate
```

**SDK generation example:**

```bash
php artisan apilot:generate-spec --stdout | openapi-generator-cli generate -i /dev/stdin -g typescript-axios -o ./sdk
```

### OpenAPI Attributes

**`#[OpenApiMeta]`** — Override the controller-level spec metadata:

```php
use Didasto\Apilot\Attributes\OpenApiMeta;

#[OpenApiMeta(summary: 'Blog Posts', description: 'Manage blog posts.', tags: ['Posts'])]
class PostController extends ModelCrudController { ... }
```

**`#[OpenApiProperty]`** — Override schema properties derived from a FormRequest:

```php
use Didasto\Apilot\Attributes\OpenApiProperty;

class PostRequest extends FormRequest
{
    #[OpenApiProperty(properties: [
        'published_at' => ['type' => 'string', 'format' => 'date-time', 'nullable' => true],
    ])]
    public function rules(): array { ... }
}
```

## Middleware

### ForceJsonResponse

By default, Laravel returns an HTML error page when a request is missing the `Accept: application/json` header. The `ForceJsonResponse` middleware prevents this by forcing the header on every request.

The middleware is registered as a named alias `apilot.json` and is **not applied automatically**. Apply it where needed:

```php
// In routes/api.php
CrudRouteRegistrar::resource('posts', PostController::class)
    ->middleware(['apilot.json', 'auth:sanctum']);

// Or globally in app/Http/Kernel.php (Laravel 10 and earlier)
protected $middlewareGroups = [
    'api' => [
        \Didasto\Apilot\Http\Middleware\ForceJsonResponse::class,
        // ...
    ],
];

// Laravel 11+ bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->appendToGroup('api', \Didasto\Apilot\Http\Middleware\ForceJsonResponse::class);
})
```

## CrudServiceInterface

Implement this interface when using `ServiceCrudController`:

```php
interface CrudServiceInterface
{
    // Return a paginated list of items, applying filters and sorting.
    public function list(array $filters, array $sorting, PaginationParams $pagination): PaginatedResult;

    // Return a single item by ID, or null if not found.
    public function find(int|string $id): mixed;

    // Create and return a new item.
    public function create(array $data): mixed;

    // Update and return the item with the given ID.
    public function update(int|string $id, array $data): mixed;

    // Delete the item. Returns true on success.
    public function delete(int|string $id): bool;
}
```

`PaginationParams` carries `$page` (int) and `$perPage` (int).

`PaginatedResult` constructor: `__construct(array $items, int $total, int $perPage, int $currentPage)`.

## API Response Formats

### Success Responses

**200 — Single resource (show, update):**
```json
{
    "data": {
        "id": 1,
        "title": "My Post",
        "status": "published"
    }
}
```

**200 — Collection (index):**
```json
{
    "data": [ { "id": 1, "title": "My Post" } ],
    "meta": { "current_page": 1, "last_page": 1, "per_page": 15, "total": 1 },
    "links": { "first": "...", "last": "...", "prev": null, "next": null }
}
```

**201 — Created resource (store):**
```json
{
    "data": {
        "id": 42,
        "title": "New Post",
        "status": "draft"
    }
}
```

**204 — No content (destroy):** Empty response body.

### Error Responses

**404 — Resource not found:**
```json
{
    "error": {
        "message": "Resource not found.",
        "status": 404
    }
}
```

**403 — Action not allowed (beforeDestroy returned false):**
```json
{
    "error": {
        "message": "Action not allowed.",
        "status": 403
    }
}
```

**422 — Validation error:**
```json
{
    "message": "The title field is required.",
    "errors": {
        "title": ["The title field is required."]
    }
}
```

## Documentation

Full documentation is available in the [`docs/`](docs/README.md) directory:

- [Installation](docs/01-installation.md)
- [Quick Start](docs/02-quick-start.md)
- [Model CRUD Controller](docs/03-model-crud-controller.md)
- [Service CRUD Controller](docs/04-service-crud-controller.md)
- [Route Registration](docs/05-route-registration.md)
- [Filtering](docs/06-filtering.md)
- [Sorting](docs/07-sorting.md)
- [Pagination](docs/08-pagination.md)
- [Hooks](docs/09-hooks.md)
- [OpenAPI Generation](docs/10-openapi-generation.md)
- [Middleware](docs/11-middleware.md)
- [Error Handling](docs/12-error-handling.md)
- [Configuration](docs/13-configuration.md)
- [Testing](docs/14-testing.md)
- [Advanced Examples](docs/15-advanced-examples.md)

## Testing

```bash
# Run all package tests
docker run --rm -v $(pwd):/app -w /app composer php ./vendor/bin/phpunit

# Run a specific test
docker run --rm -v $(pwd):/app -w /app composer php ./vendor/bin/phpunit --filter=FullWorkflowTest
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
