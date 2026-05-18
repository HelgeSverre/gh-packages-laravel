# Laravel Repository

A clean and flexible base repository package for Laravel that simplifies data access, enforces the Repository Pattern,
and keeps your application code organized, testable, and maintainable.

This package provides a reusable BaseRepository implementation with common Eloquent operations and a powerful filtering
system.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/mrtolouei/laravel-repository/actions/workflows/tests.yml/badge.svg)](https://github.com/mrtolouei/laravel-repository/actions/workflows/tests.yml)
[![Latest Stable Version](https://poser.pugx.org/mrtolouei/laravel-repository/v/stable)](https://packagist.org/packages/mrtolouei/laravel-repository)

---

## Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Basic Usage](#basic-usage)
5. [Available Methods](#available-methods)
6. [Filtering System](#filtering-system)
7. [Query Builder & Chainable Methods](#query-builder--chainable-methods)
8. [Persisting Queries](#persisting-queries)
9. [CRUD Operations](#crud-operations)
10. [Advanced Usage](#advanced-usage)
11. [Testing](#testing)
12. [Contributing](#contributing)
13. [License](#license)

---

## Features

- Clean BaseRepository implementation
- Built‑in query builder helpers
- Dynamic filtering system with multiple operators
- Support for nested and OR conditions
- Relation filtering using dot notation
- Fluent query chaining
- Works with Laravel 9+
- Fully testable and extendable

---

## Requirements

- PHP >= 8.0
- Laravel / Illuminate components >= 9.0

---

## Installation

```bash
  composer require mrtolouei/laravel-repository
```

No configuration or service provider registration is required.

---

## Basic Usage

Create a repository for your model by extending the `BaseRepository`.

### Example Model

```php
App\Models\User
```

### Create Repository

```php
namespace App\Repositories;

use App\Models\User;use MrTolouei\Repository\Repositories\BaseRepository;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    protected array $allowedFilters = [
        'email',
        'name',
        'age',
        'created_at',
    ];
}
```

---

## Available Methods

The `BaseRepository` provides many commonly used data access methods.

### Create

```php
$user = $repository->create([
    'email' => 'john@example.com',
    'name' => 'John'
]);
```

### Find

```php
$user = $repository->find($id);

$user = $repository->findOrFail($id);
```

### Update

```php
$repository->update($id, [
    'name' => 'Updated Name'
]);
```

### Delete

```php
$repository->delete($id);
```

### Restore (Soft Deletes)

```php
$repository->restore($id);
```

### Insert Multiple

```php
$repository->insert([
    ['email' => 'a@example.com'],
    ['email' => 'b@example.com']
]);
```

### Where

```php
$repository->where('age', '>', 18)->all();
```

### OR Where

```php
$repository
    ->where('age', 18)
    ->orWhere('age', 25)
    ->all();
```

### Where In

```php
$repository->whereIn('id', [1,2,3])->all();
```

### Where Not In

```php
$repository->whereNotIn('id', [4,5])->all();
```

### Order

```php
$repository->orderBy('created_at', 'desc')->all();
```

### Limit

```php
$repository->limit(10)->all();
```

### Pagination

```php
$repository->paginate(15);
```

### Aggregate Functions

```php
$repository->count();

$repository->sum('amount');

$repository->avg('rating');
```

### Existence Check

```php
$repository->where('email', 'john@example.com')->exists();
```

---

## Filtering System

The package includes a powerful **filtering trait** that allows structured filtering from arrays (useful for APIs).

Only fields listed in `$allowedFilters` can be filtered.

### Example

```php
$repository->filter([
    'age' => ['gte' => 18],
    'email' => ['like' => 'gmail']
])->all();
```

### Supported Operators

| Keyword | SQL Equivalent |
|---------|----------------|
| eq      | =              |
| neq     | !=             |
| gt      | >              |
| gte     | >=             |
| lt      | <              |
| lte     | <=             |
| like    | LIKE           |
| in      | IN (...)       |

### Using Filters

Example usage in a controller:

```php
public function index(Request $request)
{
    $repo = new UserRepository(new User());

    $users = $repo
        ->filter($request->query())  // apply filters
        ->orderBy('created_at', 'desc')
        ->paginate(15);

    return response()->json($users);
}
```

Example filter input (from query parameters or request body):

```json
{
  "email": {
    "like": "example.com"
  },
  "is_active": true,
  "or": [
    {
      "age": {
        "gte": 30
      }
    },
    {
      "roles.id": {
        "in": [
          1,
          2,
          3
        ]
      }
    }
  ]
}
```

### Explanation

- `email.like:` Finds users with email containing “example.com”
- `is_active:` Equals true
- `or` group: Matches users aged 30+ or belonging to roles with IDs 1, 2, 3

---

## Query Builder & Chainable Methods

All major query methods remain chainable:

| Method      | Description                                   | Example                                    |
|-------------|-----------------------------------------------|--------------------------------------------|
| query()     | Get Builder instance                          | $userRepo->query()->where('active', true); |
| where(...)  | Add where clause (supports array and closure) | $repo->where(['status' => 'active']);      |
| with([...]) | Eager load relations                          | $repo->with(['posts', 'roles']);           |
| orderBy()   | Add order clause                              | $repo->orderBy('created_at', 'desc');      |
| limit()     | Limit results                                 | $repo->limit(10)->all();                   |

---

## Persisting Queries

Preserve query state across multiple operations:

```php
$repo->persistQuery()
    ->where('is_active', true)
    ->orderBy('created_at', 'desc');

$firstActive = $repo->first();
$activeUsers = $repo->all();
```

Without calling `persistQuery()`, queries auto‑reset after each operation.

---

## CRUD Operations

```php
// Create
$newUser = $userRepo->create([
    'name' => 'Ali',
    'email' => 'ali@example.com',
]);

// Update
$updated = $userRepo->update($newUser->id, ['name' => 'Ali Tolouei']);

// Delete (soft)
$deletedCount = $userRepo->delete($newUser->id);

// Restore
$restoredCount = $userRepo->restore($newUser->id);

// Insert many
$userRepo->insert([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
]);

// First or create
$user = $userRepo->firstOrCreate(['email' => 'user@example.com'], ['name' => 'User']);

// Update or create
$user = $userRepo->updateOrCreate(['email' => 'user@example.com'], ['name' => 'Updated']);
```

---

## Advanced Usage

Powerful nested filter combinations with chaining:

```php
$users = $userRepo
    ->filter([
        'is_active' => true,
        'roles.id' => ['in' => [1, 5]],
        'or' => [
            ['created_at' => ['gte' => '2024-01-01']],
            ['name' => ['like' => 'Ali']],
        ],
    ])
    ->with(['profile', 'posts'])
    ->orderBy('created_at', 'desc')
    ->paginate(10);
```

---

## Testing

Run tests using PHPUnit:

```bash
  vendor/bin/phpunit
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).