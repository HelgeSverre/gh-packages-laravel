# Laravel Breadcrumbs

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vixen/laravel-breadcrumbs.svg?style=flat-square)](https://packagist.org/packages/vixen/laravel-breadcrumbs)
[![Total Downloads](https://img.shields.io/packagist/dt/vixen/laravel-breadcrumbs.svg?style=flat-square)](https://packagist.org/packages/vixen/laravel-breadcrumbs)

A simple breadcrumbs package for Laravel, with support for Blade and Inertia.js.

```php
// In your controller
crumbs('Posts', '/posts')->add('Show Post', route('posts.show', $post));
```

```html
<!-- In your Blade view -->
@crumbs
```

```tsx
// In your Inertia component
<Breadcrumbs items={breadcrumbs} />
```

## Installation

```shell
composer require vixen/laravel-breadcrumbs
```

The service provider is auto-discovered. To publish the config and views:

```shell
php artisan vendor:publish --tag="breadcrumbs-config"
php artisan vendor:publish --tag="breadcrumbs-views"
```

## Quick Start

Add breadcrumbs from your controller or routes file, then render them in your view.

### Adding Breadcrumbs

From a controller:

```php
public function show(Post $post)
{
    crumbs('Posts', '/posts')->add($post->title, route('posts.show', $post));
}
```

From your routes file:

```php
Route::get('posts', [PostController::class, 'index'])->crumbs(function (Breadcrumbs $crumbs) {
    $crumbs->add('Posts', '/posts');
});
```

### Rendering

In Blade, use the `@crumbs` directive or call `render()` directly:

```html
@crumbs

{{-- or with a custom view --}}
@crumbs(breadcrumbs::custom-view)
```

For Inertia.js, the breadcrumbs are available as a JSON-serializable array via `crumbs()->toArray()` or `crumbs()->toJson()`.

## Usage

### Notations

There are three interchangeable ways to interact with breadcrumbs:

**Helper function** (recommended):
```php
crumbs('Home', '/')->add('About', '/about');
```

**Facade:**
```php
use Vixen\Breadcrumbs\Facades\Crumbs;

Crumbs::add('Home', '/');
```

**Dependency injection:**
```php
use Vixen\Breadcrumbs\Breadcrumbs;

public function index(Breadcrumbs $crumbs)
{
    $crumbs->add('Home', '/');
}
```

### Options Array

Instead of separate arguments, you can pass an associative array:

```php
crumbs([
    'title' => 'Posts',
    'path' => '/posts',
    'extra' => ['icon' => 'newspaper'],
]);
```

### Multi-Item Positions

A position in the trail can hold multiple items by passing a sequential array. This is useful for rendering a dropdown selector instead of a single link:

```php
// Home > [Electronics | Clothing | Books] > Product Name
crumbs('Home', '/')
    ->add([
        ['title' => 'Electronics', 'path' => '/categories/electronics'],
        ['title' => 'Clothing', 'path' => '/categories/clothing'],
        ['title' => 'Books', 'path' => '/categories/books'],
    ])
    ->add($product->name, route('products.show', $product));
```

When iterating, a multi-item position is an array of `Breadcrumb` objects rather than a single one. Each item independently tracks its own `active` state.

### Custom Views

Publish the views and edit them, or create your own. The default view (`breadcrumbs::plain`):

```html
<nav aria-label="Breadcrumb">
    <ol role="list" style="display: flex; align-items: center; gap: 1rem">
        @foreach ($breadcrumbs as $breadcrumb)
            @if (!$loop->first)
                <li>/</li>
            @endif

            @if ($breadcrumb->active)
                <li>{{ $breadcrumb->title }}</li>
            @else
                <li>
                    <a href="{{ $breadcrumb->path }}">
                        {{ $breadcrumb->title }}
                    </a>
                </li>
            @endif
        @endforeach
    </ol>
</nav>
```

You can specify a different view globally in `config/breadcrumbs.php` or per-render:

```php
crumbs()->render('breadcrumbs::custom-view')
```

## API

### `Breadcrumbs::add(string|array $title, ?string $path = null, array $extra = [])`

| Parameter | Type            | Description                                                         |
|-----------|-----------------|---------------------------------------------------------------------|
| `$title`  | `string\|array` | The breadcrumb label, an options array, or a list of options arrays |
| `$path`   | `?string`       | A URL string. `null` means no link.                                 |
| `$extra`  | `array`         | Arbitrary extra data attached to the breadcrumb.                    |

When `$title` is an associative array, it is treated as a single breadcrumb with keys `title`, `path` (optional), and `extra` (optional).

When `$title` is a sequential array, each element is an options array and the items are grouped at a single position in the trail.

### `crumbs(string|array|callable|null $title = null, ?string $path = null, array $extra = [])`

Same as `Breadcrumbs::add()`, but also accepts a callable and returns the `Breadcrumbs` instance. Called without arguments, it simply returns the instance.

### `Breadcrumb` Properties

| Property | Type      | Description                                 |
|----------|-----------|---------------------------------------------|
| `title`  | `string`  | The breadcrumb label.                       |
| `path`   | `?string` | The URL, or `null` if none was provided.    |
| `active` | `bool`    | `true` when `path` matches the current URL. |
| `extra`  | `array`   | Arbitrary extra data.                       |

## Changelog

See [CHANGELOG](CHANGELOG.md) for all changes.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Alex Torscho](https://github.com/atorscho)
- [All Contributors](../../contributors)

## License

MIT. See [LICENSE](LICENSE.md) for details.
