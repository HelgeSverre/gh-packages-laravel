# Laravel Query Filters

A lightweight Laravel package for advanced Eloquent filtering, including **global search, relationship filtering, operators, pagination, sorting, and custom filter classes**.

---

## Installation

```bash
composer require obrainwave/laravel-query-filters
```

Publish the config (optional):

```bash
php artisan vendor:publish --tag=query-filters-config
```

---

## Configuration

All defaults are in `config/query-filters.php`:

```php
return [

    'global_key' => 'q', // Query parameter key for global search

    'allowed_filters' => ['name', 'role'],

    'default_match' => 'exact', // exact, like, strict

    'filter_modes' => [
        // Custom per-filter matching, supports wildcards
        // 'email' => 'strict',
        // 'user.*' => 'like',
        // '*.status' => 'strict',
    ],

    'pagination' => [
        'per_page' => 10,
        'max_per_page' => 100,
    ],

    'sorting' => [
        'allowed_columns' => [], // e.g. ['name', 'created_at']
        'default' => null,       // e.g. 'created_at' or '-created_at'
    ],

    'operators' => [
        'enabled' => true,       // Enable operator-based filters
    ],

];
```

---

## Basic Usage

You can filter Eloquent models directly using the `filter()` scope. 

To use the query filters in your Laravel models, you must add the Filterable trait to the model. For example:

```php
use Illuminate\Database\Eloquent\Model;
use Obrainwave\LaravelQueryFilters\Filterable;

class User extends Model
{
    use Filterable;

    // Optional: define allowed columns in the model
    // protected $allowedFilters = ['name', 'email'];
}
```

Once the trait is added, you can call the `filter()` method on your model statically:

```php
use App\Models\User;

$users = User::filter([
    'status' => 'active',
    'role' => 'admin',
    'q' => 'john', // Global search
])->get(); // or ->first()
```

* Without Filterable, `filter()` won’t exist on your model.
* You can optionally define $allowedFilters in the model or rely on the config for auto-generated filters. If your `$allowedFilters` is protected, you have to define a public get method to access it. For example:

```php
    protected array $allowedFilters = ['status', 'name', 'role'];

    public function getAllowedFilters(): array
    {
        return $this->allowedFilters;
    }
```

If you know what you are doing, you can probably just leave `$allowedFilters` as public property

```php
public array $allowedFilters = ['status', 'name', 'role'];
```

Or you can actually allow all table columns to be filtered by setting the default value in `config/query-filters.php`

```bash
'allowed_filters'      => ['*']
```

And also supports laravel paginate and simplePaginate

```php

$users = User::filter([
    'status' => 'active',
    'role' => 'admin',
    'q' => 'john', // Global search
])->paginate(); // or simplePaginate() | Supports per_page from request or config
```

### URL Parameters

Filters also work directly from URL query parameters:

```
/users?status=active&role=admin&q=john&per_page=5&sort=-created_at
```
Which you can pass directly from your request helper or injected `Illuminate\Http\Request`

```php
use App\Models\User;

$users = User::filter(request())->paginate(); // Supports per_page from request or config
```
---

### Using Laravel Query Methods

After applying filters with the package, you can continue to use all standard Laravel query builder and Eloquent methods. For example:

```php
$users = User::filter($filters)->get();
$users = User::filter($filters)->paginate(15);
$users = User::filter($filters)->simplePaginate(10);
$user  = User::filter($filters)->first();
```
* `->get()` → retrieves all matching records.
* `->paginate()` → retrieves paginated results with page links.
* `->simplePaginate()` → retrieves simpler pagination without total count.
* `->first()` → retrieves the first matching record.

This allows you to combine filtering with any Laravel query workflow seamlessly.

---

## Features

### 1. **Global Search**

Search across multiple columns using a single query parameter:

```php
$users = User::filter(['q' => 'john'])->get();
```

Customize global search columns in your model:

```php
protected array $globalSearchColumns = ['name', 'email'];
```

Or provide a method:

```php
public function getGlobalSearchColumns(): array
{
    return ['name', 'email', 'username'];
}
```

---

### 2. **Allowed Filters**

Only specified filters are applied:

```php
protected array $allowedFilters = ['status', 'role', 'email'];
```

You can also set global defaults in the config.

---

### 3. **Operators**

Filter with operators like `gt`, `gte`, `lt`, `lte`, `between`, and `like`:

```php
$users = User::filter([
    'created_at' => ['gte' => '2025-01-01'],
    'age' => ['between' => [20, 30]]
])->get();
```

---

### 4. **Relationship Filtering**

Filter nested relationships using dot notation:

```php
$users = User::filter([
    'posts.title' => 'My Post',
    'or:posts.comments.body' => 'Great',
])->with(['posts.comments'])->paginate();
```

- Use `or:` prefix for OR conditions.
- Supports arrays of values (multiple OR conditions).
- Supports operators (gt, lt, between, like).

It also supports relationship filtering and can accept arrays of values. This allows you to filter related models based on multiple possible values. For example:

```php
$users = User::filter([
    'posts.title' => ['My Post', 'Laravel'],
    'or:posts.comments.body' => ['Great', 'Child filtering', 'Package'],
])
->with(['posts.comments'])
->paginate();
```

---

### 5. **Sorting**

Sort using query string or programmatically:

```php
$users = User::filter(['sort' => 'name,-created_at'])->get();
```

- Prefix `-` for descending.
- Only columns defined in `allowed_columns` are applied.

---

### 6. **Pagination**

Pagination works out-of-the-box with per-page overrides:

```php
$users = User::filter(request())->paginate(); // Defaults
$users = User::filter(request())->paginate(10); // Force per_page
```

OR

```php
$users = User::filter(request())->simplePaginate(); // Defaults
$users = User::filter(request())->simplePaginate(10); // Force per_page
```

- `per_page` from URL has top priority.
- Config default is fallback.
- `max_per_page` is enforced.

---

### 7. **Custom Filter Classes**

If you need full control, generate a filter class and handle your custom logic in it:

The auto method automatically generates filters for your model. It uses either the model’s database columns or the columns you specify in the config, so you can quickly enable filtering without defining each field manually.

```bash
php artisan make:filter UserFilter
```

Example `UserFilter`:

```php
namespace App\Filters;

use Obrainwave\LaravelQueryFilters\QueryFilter;

class UserFilter extends QueryFilter
{
    public function role($value)
    {
        $this->builder->where('role', $value); //You can alter this to 
        return $this;
    }

    public function status($value)
    {
        $this->builder->where('status', $value);
        return $this;
    }
}
```

Then use automatically by chaining your class method(s) to your model:

```php
$users = User::filter(request())->paginate();
```

- Your filter class is detected by convention (`UserFilter` for `User` model).
- All features (pagination, sorting, relationships, operators) work seamlessly.
- Supports **chaining**:

```php
$users = User::filter(['role' => 'admin'])
    ->status('inactive')
    ->role('user')
    ->with('posts')
    ->paginate();
```
---

### 8. **Chaining**

The filter returns a query builder proxy, so you can chain additional methods from your Custom Filter Class:

```php
$users = User::filter([
    'role' => 'admin',
    'status' => 'active',
])
->with(['posts.comments'])
->status('inactive')
->role('user')
->paginate();
```
---

### 9. **Case-insensitive Filtering**

By default, filters are **case-insensitive** (`exact` or `like`) except when configured otherwise (`strict`).


---

### 10. **Extending & Customization**

- Override `getAllowedFilters()` in your model.
- Override `getGlobalSearchKey()` or `$globalSearchKey` in your model.
- Override `getGlobalSearchColumns()` or `$globalSearchColumns`.
- Define per-filter matching using `filter_modes` config.

---

### Example: Full Feature Usage

```php
$users = User::filter([
    'role' => 'admin',
    'status' => 'active',
    'posts.comments.body' => 'Great',
    'sort' => '-created_at',
    'per_page' => 5
])
->with(['posts.comments'])
->paginate();
```

---

### Installation Notes

- Requires **PHP 8+**
- Supports **Laravel 9, 10, 11, 12**
- No additional dependencies for filtering.
- Works out-of-the-box with Eloquent models.

---

### License

MIT License.

---

### Contributing

We welcome contributions from everyone! If you have ideas, bug fixes, or improvements, feel free to open an issue or submit a pull request. Whether it’s enhancing filters, adding new features, or improving documentation, your contributions are highly appreciated.