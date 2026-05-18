# saucebase/breadcrumbs

Breadcrumb definitions for Laravel applications that serve breadcrumbs as data, not HTML.

## Installation

```bash
composer require saucebase/breadcrumbs
```

## Defining breadcrumbs

Create `routes/breadcrumbs.php` and define breadcrumbs by route name:

```php
use Saucebase\Breadcrumbs\Breadcrumbs;
use Saucebase\Breadcrumbs\Generator as Trail;

Breadcrumbs::for('home', function (Trail $trail) {
    $trail->push('Home', route('home'));
});

Breadcrumbs::for('dashboard', function (Trail $trail) {
    $trail->parent('home');
    $trail->push('Dashboard', route('dashboard'));
});

// Route model binding
Breadcrumbs::for('post.show', function (Trail $trail, Post $post) {
    $trail->parent('dashboard');
    $trail->push($post->title, route('post.show', $post));
});
```

Each `push()` call accepts an optional third argument — an array of arbitrary attributes passed through to the breadcrumb item:

```php
$trail->push('Label', $url, ['icon' => 'home']);
```

### Generating breadcrumbs

```php
// Check if a breadcrumb exists for the current route
Breadcrumbs::exists('dashboard');

// Generate for the current route (reads from request)
$items = Breadcrumbs::current();

// Generate for a named route with parameters
$items = Breadcrumbs::generate('post.show', $post);
```

Each item in the returned collection has `title`, `url`, and `attributes` properties.

## Hooks

Use `before()` and `after()` to prepend or append items globally across all breadcrumb chains:

```php
// Prepend an item to every breadcrumb trail
Breadcrumbs::before(function (Trail $trail) {
    $trail->push('Home', route('home'));
});

// Append an item to every breadcrumb trail
Breadcrumbs::after(function (Trail $trail) {
    $trail->push('Help', route('help'));
});
```

## Config

Publish the config file with:

```bash
php artisan vendor:publish --tag=breadcrumbs-config
```

| Key | Default | Description |
|-----|---------|-------------|
| `files` | `base_path('routes/breadcrumbs.php')` | File(s) where breadcrumbs are defined |
| `unnamed-route-exception` | `true` | Throw `UnnamedRouteException` when the current route has no name |
| `missing-route-bound-breadcrumb-exception` | `true` | Throw `InvalidBreadcrumbException` when no breadcrumb is registered for the current route |
| `invalid-named-breadcrumb-exception` | `true` | Throw `InvalidBreadcrumbException` when calling `generate()` with an unregistered name |

## Testing

Override the current route in tests without making real HTTP requests:

```php
use Saucebase\Breadcrumbs\Breadcrumbs;

// Set the route that Breadcrumbs::current() will resolve against
Breadcrumbs::setCurrentRoute('post.show', $post);

$items = Breadcrumbs::current();

// Reset after the test
Breadcrumbs::clearCurrentRoute();
```

## Exceptions

| Exception | Thrown when |
|-----------|-------------|
| `UnnamedRouteException` | The current route has no name and `unnamed-route-exception` is `true` |
| `InvalidBreadcrumbException` | A breadcrumb name is not registered and the relevant config exception is `true` |
| `DuplicateBreadcrumbException` | `Breadcrumbs::for()` is called with a name that is already registered |

---

This package is a fork of [`diglactic/laravel-breadcrumbs`](https://github.com/diglactic/laravel-breadcrumbs) with Blade rendering removed. The `render()` / `view()` methods, the `manager-class` / `generator-class` config options, and the `facade/ignition-contracts` dependency have been stripped. Everything else is preserved.
