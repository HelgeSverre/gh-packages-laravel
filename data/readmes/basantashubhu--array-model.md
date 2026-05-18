# Array Model

`basanta/array-model` is a lightweight Laravel-friendly library that lets you treat in-memory arrays like model records with collection-style querying and bulk operations.

It is useful when you want model-like behavior without a database layer.

## Features

- Define simple model classes backed by arrays
- Create records with model-like syntax
- Query records with `where()` and multi-condition filtering
- Define model relationships (`hasMany`, `hasOne`, `belongsTo`)
- Lazy load relationships on first property access or in bulk with `load()`
- Bulk update filtered results
- Delete filtered results from the in-memory store
- Convert model store to plain arrays
- Built on top of Laravel Collection APIs

## Requirements

- PHP `^8.0`
- Laravel Framework `>=10.0`

## Installation

Install via Composer:

```bash
composer require basanta/array-model
```

## Quick Start

Create a model class by extending `Basanta\ArrayModel\ArrayModel`:

```php
<?php

namespace App\ArrayModels;

use Basanta\ArrayModel\ArrayModel;

class User extends ArrayModel {}
```

Create records:

```php
User::create(['id' => 1, 'name' => 'Alice', 'role' => 'admin', 'active' => true]);
User::create(['id' => 2, 'name' => 'Bob', 'role' => 'editor', 'active' => false]);
User::create(['id' => 3, 'name' => 'Cara', 'role' => 'admin', 'active' => true]);
```

Query records:

```php
$admins = User::where('role', 'admin');        // Laravel-style where
$activeAdmins = User::where(['role' => 'admin', 'active' => true]); // multi-condition
```

Get all records as array:

```php
$all = User::array();
```

## Relationships and Lazy Loading

Define relationships directly on your array model:

```php
<?php

namespace App\ArrayModels;

use Basanta\ArrayModel\ArrayModel;

class User extends ArrayModel
{
    public function posts()
    {
        return $this->hasMany(Post::class, 'user_id', 'id');
    }
}

class Post extends ArrayModel
{
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
```

Lazy load on first access:

```php
$user = User::where('id', 1)->first();
$posts = $user->posts; // relationship method is executed and cached
```

Bulk lazy load for all records:

```php
User::load('posts');
User::load(['posts']);
```

## How It Works

Each model subclass gets its own in-memory `Collection` instance (stored statically per class).  
All static calls are proxied to that collection, so you can use collection-driven patterns while working with model objects.

## API Reference

### `ArrayModel`

#### `static factory()`
Returns the in-memory `Basanta\ArrayModel\Collection` for the calling model class.

#### `static create(array $attributes): static`
Creates a new model instance and stores it in the class collection.

#### `static update(array $where, array $attributes): bool`
Finds matching items using `where($where)` and updates them.

#### `static array(): array`
Returns the full model store as a plain array.

#### `static load(...$relationship): Basanta\ArrayModel\Collection`
Lazy-loads one or more relationships for all records in the model store.  
Accepts variadic relation names or a single array of relation names.

#### `toArray(): array`
Converts the current model object to a plain array.

#### Relationship helpers
- `hasMany($relatedClass, $foreignKey, $localKey): Basanta\ArrayModel\Collection`
- `hasOne($relatedClass, $foreignKey, $localKey): ?Basanta\ArrayModel\ArrayModel`
- `belongsTo($relatedClass, $foreignKey, $ownerKey): ?Basanta\ArrayModel\ArrayModel`

#### Magic attributes
- `$model->key` reads via `offsetGet`
- `$model->key = $value` writes via `offsetSet`
- Missing keys return `null`

### `Collection`

Extends `Illuminate\Support\Collection` and adds model-focused behavior.

#### `where($key, $operator = null, $value = null): static`

Supports:
- Standard Laravel Collection `where(...)` usage
- Array-based multi-condition usage (delegates to `whereMany`)

#### `whereMany(array $conditions): static`

Supports two condition formats:

1. Associative format:

```php
User::where([
    'role' => 'admin',
    'active' => true,
]);
```

2. List format (each rule can be `[key, value]` or `[key, operator, value]`):

```php
User::where([
    ['id', '>=', 2],
    ['role', 'admin'],
]);
```

Supported operators:

- `=`, `==`, `===`
- `!=`, `<>`, `not`, `!==`
- `>`, `>=`, `<`, `<=`
- `in`, `not in` (automatically inferred when comparison value is an array)

Invalid formats or unsupported operators throw exceptions.

#### `update(array $attributes): bool`
Bulk-updates all items in the current filtered collection.

#### `delete(): bool`
Removes all items in the current filtered collection from the model store.

## Usage Patterns

### Filter and bulk update

```php
User::where(['role' => 'editor'])->update(['active' => true]);
```

### Filter and delete

```php
User::where(['active' => false])->delete();
```

### Use advanced operators

```php
$selected = User::where([
    ['id', 'in', [1, 3]],
    ['role', 'not', 'guest'],
]);
```

## Behavior Notes

- Data is **in-memory only** (no database persistence).
- Store lifetime is tied to the current PHP process/request lifecycle.
- Records are class-scoped (each model subclass has an isolated store).
- Relationship results are cached on first property access (e.g. `$user->posts`).
- This package is best suited for transient/model-like data handling, testing helpers, or non-persistent workflows.

## Error Handling

The package throws exceptions for:

- Calling internals from classes not extending `ArrayModel`
- Invalid `whereMany` condition formats
- Unsupported query operators
- Calling `load()` with a relationship method that does not exist

Use `try/catch` around dynamic filter construction if conditions may be user-defined.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests (if applicable)
4. Open a pull request

## License

No explicit license is currently declared in `composer.json`.  
If you plan to use this package in production or redistribute it, confirm licensing with the maintainer first.
