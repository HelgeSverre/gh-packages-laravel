---
outline: deep
title: "LaraJS Query - Dynamic API Query Builder for Laravel"
description: "LaraJS Query simplifies Eloquent models filtering, sorting, and including relationships with a flexible interface for client-side querying in Laravel applications"
author: "LaraJS Team"
head:
  - - meta
    - name: keywords
      content: LaraJS Query, Laravel query builder, Laravel filtering, API query builder, Laravel sorting, Laravel relationships, Eloquent query builder, Laravel pagination, dynamic filtering, Laravel API, Eloquent models, Laravel repository pattern
  - - meta
    - name: robots
      content: index, follow
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: LaraJS Query - Dynamic API Query Builder for Laravel
  - - meta
    - name: twitter:description
      content: Build powerful and flexible Laravel Eloquent queries with LaraJS Query for dynamic filtering, sorting, and relationship handling
  - - meta
    - name: twitter:image
      content: https://docs.larajs.com/larajs.png
  - - meta
    - property: og:title
      content: LaraJS Query - Dynamic API Query Builder for Laravel
  - - meta
    - property: og:description
      content: Build powerful and flexible Laravel Eloquent queries with LaraJS Query for dynamic filtering, sorting, and relationship handling
  - - meta
    - property: og:url
      content: https://docs.larajs.com/packages/larajs-query.html
  - - meta
    - property: og:image
      content: https://docs.larajs.com/larajs.png
  - - meta
    - property: og:type
      content: article
  - - link
    - rel: canonical
      href: https://docs.larajs.com/packages/larajs-query.html
---

# LaraJS Query

Dynamic HTTP query parameter builder for Laravel Eloquent. Filter, sort, search, include relationships, select fields, and paginate using a functional query syntax.

## Installation

```bash
composer require larajs/query:^2.0
```

**Requirements**: PHP 8.3+, Laravel 11/12/13

## Quick Start

```php
use App\Models\User;
use LaraJS\Query\LaraJSQuery;
use LaraJS\Query\DTO\{QueryParserAllowDTO, QueryParserRequestDTO};

class UserController
{
    use LaraJSQuery;

    public function index(Request $request)
    {
        return User::query()
            ->applyLaraJSQuery(
                QueryParserRequestDTO::fromArray($request->query()),
                QueryParserAllowDTO::fromArray([
                    'filter' => ['name', 'email'],
                    'include' => ['posts', 'roles'],
                    'sort' => ['name', 'created_at'],
                ])
            )
            ->get();
    }
}
```

**Usage**:
```http
GET /api/users?filter=equals(name,'John')&sort=name&include[]=posts&pagination[limit]=10
```

## Filtering

Filter with functional IBM-style syntax. All filters support relationship variants (e.g., `equalsRelation`, `greaterThanRelation`).

| **Function** | **Example** |
|---|---|
| `equals` | `?filter=equals(name,'Smith')` |
| `greaterThan` / `lessThan` | `?filter=greaterThan(age,'25')` |
| `greaterOrEqual` / `lessOrEqual` | `?filter=greaterOrEqual(price,'100')` |
| `contains` / `startsWith` / `endsWith` | `?filter=contains(title,'Laravel')` |
| `any` | `?filter=any(status,'active','pending')` |
| `between` | `?filter=between(created_at,'2025-01-01','2025-12-31')` |
| `has` | `?filter=has(posts,'1')` |
| `relation` | `?filter=relation(author,equals(country,'US'))` |
| `and` / `or` / `not` | `?filter=and(equals(role,'admin'),greaterThan(age,'25'))` |

## Sorting

Sort by single/multiple columns, including relationships via BelongsToThrough.

| **Type** | **Example** |
|---|---|
| Ascending | `?sort=name` |
| Descending | `?sort=-name` |
| Multiple | `?sort=name,-created_at` |
| Relationship | `?sort=author.name` |
| Relationship Count | `?sort=posts_count` |

## Searching

LIKE-based search across columns and relationships.

| **Type** | **Example** |
|---|---|
| Single column | `?search[column]=name&search[value]=john` |
| Multiple columns | `?search[column]=name,email&search[value]=john` |
| Relationship | `?search[column]=author.name&search[value]=smith` |

## Including Relationships

Eager load relationships with nested support, aggregates, and filtering.

| **Type** | **Example** |
|---|---|
| Single | `?include[]=posts` |
| Multiple | `?include[]=posts&include[]=roles` |
| Nested | `?include[]=posts.comments` |
| Aggregates | `?include[]=posts\|count&include[]=roles\|exists` |
| Filtered | `?include[]=posts\|and(equals(status,'published'))` |

Supported aggregates: `count`, `exists`, `sum`, `min`, `max`, `avg`

## Selecting Fields

Project specific columns via select parameter.

```
?select=id,name,email
```

## Date Filtering

Filter by date ranges. Auto-calculates startOfDay/endOfDay boundaries.

| **Type** | **Example** |
|---|---|
| Array format | `?date[column]=created_at&date[value][0]=2025-01-01&date[value][1]=2025-12-31` |
| Filter syntax | `?filter=between(created_at,'2025-01-01','2025-12-31')` |

## Pagination

Three pagination types with configurable limits (default 25, max 500).

| **Type** | **Example** |
|---|---|
| Default | `?pagination[limit]=25&pagination[page]=1` |
| Simple | `?pagination[type]=simple&pagination[limit]=25&pagination[page]=1` |
| Cursor | `?pagination[type]=cursor&pagination[cursor]=...` |

## Security: Allow-List Whitelisting

Control queryable fields for each endpoint. By default, nothing is exposed — explicitly whitelist what clients can query.

```php
$allow = QueryParserAllowDTO::fromArray([
    ‘field’   => [‘id’, ‘name’, ‘email’],         // Projectable columns
    ‘filter’  => [‘name’, ‘email’, ‘status’],     // Filterable fields
    ‘sort’    => [‘name’, ‘created_at’],          // Sortable columns
    ‘include’ => [‘posts’, ‘roles’],              // Includable relations
    ‘search’  => [‘name’, ‘email’],               // Searchable fields
    ‘date’    => [‘created_at’],                  // Date-filterable fields
]);
```

## Repository Pattern

Use repositories to separate business logic from HTTP concerns.

```php
// Repository
class UserRepository extends ReadRepository
{
    public function __construct()
    {
        parent::__construct(new User(), 25, 500);
    }
}

// Controller
class UserController
{
    public function __construct(private UserRepository $users) {}

    public function index(Request $request)
    {
        return $this->users->findAll(
            QueryParserAllowDTO::fromArray([...])
        );
    }
}
```

See `/docs/deployment-guide.md` for complete repository patterns.

## Documentation

- **[Official Docs](https://docs.larajs.com/packages/larajs-query.html)** — Full online documentation
- **[docs/project-overview-pdr.md](docs/project-overview-pdr.md)** — Project scope, requirements, architecture
- **[docs/system-architecture.md](docs/system-architecture.md)** — Detailed request lifecycle, component interactions
- **[docs/codebase-summary.md](docs/codebase-summary.md)** — File structure, data flow, algorithms
- **[docs/code-standards.md](docs/code-standards.md)** — PHP 8.3 patterns, naming conventions, security
- **[docs/deployment-guide.md](docs/deployment-guide.md)** — Installation, configuration, usage examples
- **[docs/project-roadmap.md](docs/project-roadmap.md)** — v2.0.0 status, planned features, roadmap
