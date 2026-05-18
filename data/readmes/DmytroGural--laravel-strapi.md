# Laravel Strapi

A Laravel package for integrating with **Strapi 5** CMS using an Eloquent-like model layer.

Instead of manually calling HTTP endpoints, you define model classes that map to Strapi content types and query them with a fluent builder — the same way you would with Eloquent.

> **Requires:** PHP 8.3+, Laravel 11+, Strapi 5

---

## Installation

```bash
composer require dgural/laravel-strapi
```

The service provider is registered automatically via Laravel's package auto-discovery. If you have disabled auto-discovery, add it manually to `bootstrap/providers.php`:

```php
return [
    // ...
    DGCode\Strapi\StrapiServiceProvider::class,
];
```

Publish the config file:

```bash
php artisan vendor:publish --tag=strapi-config
```

This creates `config/strapi.php` in your application. Add the following to your `.env`:

```env
STRAPI_BASE_URL=https://your-strapi-url.com
STRAPI_TOKEN=your-api-token

# Optional caching
STRAPI_CACHE_ACTIVE=true
STRAPI_CACHE_TTL=3600
```

---

## Defining Models

Generate a model with Artisan:

```bash
# Collection Type (default)
php artisan make:strapi-model Post

# Single Type
php artisan make:strapi-model Homepage --single
```

This creates `app/Strapi/Models/Post.php`:

```php
<?php

namespace App\Strapi\Models;

use DGCode\Strapi\StrapiModel;

class Post extends StrapiModel
{
    // Strapi content type API ID — auto-derived from class name if omitted
    // Post → 'posts', BlogPost → 'blog-posts'
    protected static string $contentType = 'posts';

    // 'collection' or 'single'
    protected static string $type = 'collection';

    // Standard Eloquent casts — all built-in cast types work
    protected $casts = [
        'publishedAt' => 'datetime',
        'publishedAt' => 'datetime:Y-m-d',  // with explicit format
        'viewCount'   => 'integer',
        'featured'    => 'boolean',
        'meta'        => 'array',
        'status'      => StatusEnum::class,
    ];

    // Relations to other Strapi content types
    protected array $strapiRelations = [
        'author' => Author::class,  // has-one
        'tags'   => Tag::class,     // has-many (auto-detected by indexed array)
    ];

    // Override cache TTL for this model (null = use global config)
    protected static ?int $cacheTtl = null;

    // Default items per page for paginate()
    protected static int $perPage = 25;
}
```

### Casts

`$casts` is inherited directly from Eloquent — all standard cast types work:

| Cast | PHP type |
|---|---|
| `'integer'` | `int` |
| `'float'` | `float` |
| `'boolean'` | `bool` |
| `'string'` | `string` |
| `'array'` | `array` |
| `'collection'` | `Illuminate\Support\Collection` |
| `'datetime'` | `Carbon\Carbon` |
| `'datetime:Y-m-d'` | `Carbon\Carbon` (serializes with given format) |
| `'decimal:2'` | `string` |
| `AsEnum::class` | Backed enum |
| Custom `CastsAttributes` | Any type |

### Strapi Relations

Relations to other Strapi content types are declared in `$strapiRelations` separately from `$casts`. This is necessary because Eloquent's cast system only handles scalar transformations — it has no concept of nested API objects.

```php
protected array $strapiRelations = [
    'author' => Author::class,   // has-one → Author instance
    'tags'   => Tag::class,      // has-many → Collection of Tag instances
];
```

The type (has-one vs has-many) is detected automatically from the response shape. Relations are only hydrated if the relation data is included in the Strapi response — use `->populate()` to request them:

```php
Post::query()->populate(['author', 'tags'])->get();

$post->author;        // Author instance
$post->author->name;  // string
$post->tags;          // Collection<Tag>
$post->tags->first(); // Tag instance
```

Without `->populate()`, relation fields will be `null` even if declared in `$strapiRelations`.

---

## Querying

### Fetching records

```php
// Get all records
$posts = Post::all();

// Fluent query builder
$posts = Post::query()
    ->where('status', 'published')
    ->orderByDesc('publishedAt')
    ->get();

// Find by documentId
$post = Post::find('clkgylmcc000008lcdd868feh');
$post = Post::findOrFail('clkgylmcc000008lcdd868feh');

// First matching record
$post = Post::query()->where('slug', 'hello-world')->first();
$post = Post::query()->where('slug', 'hello-world')->firstOrFail();
```

### Filtering

```php
// Equality (default)
->where('status', 'published')

// With Strapi operator
->where('viewCount', '$gte', 100)
->where('publishedAt', '$lt', '2025-01-01')

// Other helpers
->whereIn('category', ['news', 'blog'])
->whereNull('archivedAt')
->whereNotNull('featuredImage')
```

Supported Strapi operators: `$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$notIn`, `$contains`, `$startsWith`, `$endsWith`, and others from the [Strapi Filters docs](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication).

### Populating relations

```php
// Specific relations
->populate(['author', 'coverImage'])

// With nested options
->populate([
    'channel' => [
        'populate' => [
            'thumbnail' => true,
        ],
    ],
])

// Everything
->populate('*')
```

### Sorting & field selection

```php
->orderBy('publishedAt')
->orderByDesc('publishedAt')

// Limit returned fields (reduces response size)
->select(['title', 'slug', 'publishedAt'])
```

### Localisation

```php
->locale('de')
->locale('uk-UA')
```

### Pagination

`paginate()` is compatible with Eloquent's signature:

```php
$posts = Post::query()
    ->locale('uk-UA')
    ->orderByDesc('publishedAt')
    ->paginate();                    // uses $perPage from model (default 25)

$posts = Post::query()->paginate(10);

// $perPage as closure — receives $total as argument
$posts = Post::query()->paginate(fn ($total) => min($total, 100));

// Custom page name for the query string parameter
$posts = Post::query()->paginate(pageName: 'p');
```

`StrapiPaginator` extends `Illuminate\Pagination\LengthAwarePaginator` — all standard Laravel pagination methods work:

```php
$posts->items();         // array of model instances
$posts->total();         // total number of records
$posts->currentPage();   // current page number
$posts->lastPage();      // total pages
$posts->hasMorePages();  // bool
$posts->nextPageUrl();   // ?string
$posts->previousPageUrl(); // ?string
```

Blade rendering works without any additional setup:

```blade
{{ $posts->links() }}
```

`toArray()` includes both standard Laravel pagination keys and a Strapi-style `meta.pagination` block for API responses.

### Offset-based pagination

```php
// limit / offset — maps to Strapi's pagination[limit] / pagination[start]
Post::query()->limit(10)->offset(20)->get();
```

`limit` and `offset` are mutually exclusive with `paginate()` / `forPage()` — calling one resets the other.

### Single Types

```php
$homepage = Homepage::query()->populate('*')->first();
echo $homepage->heroTitle;
```

---

## Accessing Attributes

Each model exposes three system properties from the Strapi response:

```php
$post->documentId   // string — primary identifier (CUID), used for all API calls
$post->id           // ?int  — numeric DB row ID, present for reference only
$post->locale       // ?string — locale of this instance, e.g. 'uk-UA'
```

Attribute access works the same as Eloquent:

```php
$post = Post::find('abc123');

$post->title                    // raw string
$post->publishedAt              // Carbon instance (if cast)
$post->publishedAt->diffForHumans()
$post->author->name             // related model (if declared in $strapiRelations)
$post->getAttribute('title')    // explicit getter
$post->getAttributes()          // all scalar attributes as array
$post->toArray()                // documentId + id + attributes + relations
```

---

## Write Operations

### Create

```php
$post = Post::create([
    'title'  => 'New Post',
    'slug'   => 'new-post',
    'status' => 'draft',
]);

// With locale
Post::query()->locale('uk-UA')->create(['title' => 'Нова стаття']);
// POST /api/posts?locale=uk-UA
```

### Update

```php
// Via instance — only sends dirty (changed) attributes
$post->title = 'Updated Title';
$post->save();

// Via instance — fill and save
$post->update(['title' => 'Updated Title', 'status' => 'published']);

// Via static builder
Post::query()->update('abc123', ['status' => 'published']);
```

If the model instance has a `locale`, it is passed automatically:

```php
// $post->locale === 'uk-UA' (hydrated from Strapi response)
$post->title = 'Оновлено';
$post->save();
// PUT /api/posts/{documentId}?locale=uk-UA
```

### Delete

```php
$post->delete();
// DELETE /api/posts/{documentId}?locale=uk-UA  (if locale is set)

Post::query()->delete('abc123');
Post::query()->locale('uk-UA')->delete('abc123');
```

---

## Caching

Global cache settings are configured in `config/strapi.php`:

```env
STRAPI_CACHE_ACTIVE=true
STRAPI_CACHE_TTL=3600
```

Override per model:

```php
class Post extends StrapiModel
{
    protected static ?int $cacheTtl = 600; // 10 minutes for this model
}
```

Override per query:

```php
Post::query()->cache(300)->get();   // 5 minutes for this query
Post::query()->noCache()->get();    // bypass cache for this query
```

---

## Error Handling

| Exception | When |
|---|---|
| `StrapiNotFoundException` | 404 response, or `findOrFail()` / `firstOrFail()` finds nothing |
| `StrapiAuthException` | 401 / 403 response |
| `StrapiRequestException` | Any other non-2xx response |

```php
use DGCode\Strapi\Exceptions\StrapiNotFoundException;
use DGCode\Strapi\Exceptions\StrapiAuthException;
use DGCode\Strapi\Exceptions\StrapiRequestException;

try {
    $post = Post::findOrFail($documentId);
} catch (StrapiNotFoundException $e) {
    abort(404);
} catch (StrapiAuthException $e) {
    abort(403);
}
```

---

## Configuration Reference

```php
// config/strapi.php

return [
    'base_url' => env('STRAPI_BASE_URL', 'http://localhost:1337'),
    'token'    => env('STRAPI_TOKEN'),
    'timeout'  => env('STRAPI_TIMEOUT', 30),

    'cache' => [
        'active' => env('STRAPI_CACHE_ACTIVE', false),
        'ttl'    => env('STRAPI_CACHE_TTL', 3600),
    ],
];
```

---

## License

MIT
