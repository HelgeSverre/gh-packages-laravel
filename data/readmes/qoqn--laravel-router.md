# Laravel Router

Convention-based route discovery for Laravel controllers using PHP attributes.

## Status

[![Tests](https://github.com/qoqn/laravel-router/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/qoqn/laravel-router/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/qoqn/laravel-router/branch/master/graph/badge.svg)](https://codecov.io/gh/qoqn/laravel-router)

`laravel-router` is stable and released as `1.0.0`.

- PHP: `^8.3`
- Laravel components: `^13.0`
- Test coverage: PHPUnit 11 + Orchestra Testbench 11, with `src/` at 100% locally

## Highlights

- Attribute-driven route discovery with minimal registration boilerplate
- Support for nested controller resources and model-bound parameters
- Convention-based HTTP verb resolution with optional explicit overrides
- Middleware, `where` constraints, and inheritance-aware discovery
- Strict duplicate detection and optional skipped-route reporting

## Installation

You can install the package via Composer:

```bash
composer require poshtive/router
```

Optionally, you can publish the configuration file using:

```bash
php artisan vendor:publish --provider="Poshtive\Router\RouterServiceProvider" --tag="config"
```

## Testing

Run the package test suite with:

```bash
composer test
```

Generate a Clover coverage report for `src/` with:

```bash
composer test:coverage
```

## Configuration

After publishing, optionally edit `config/router.php`. Below are the available options.

### `convention` (string)

Controls how controller methods become routes. Default is `attribute_or_get`.

- `attribute_or_get`: Plain method names are treated as routes converted to kebab-case with GET unless overridden with an attribute.

  Example:

  ```php
  use Poshtive\Router\Attributes\Route;

  class UserController {
      public function index() {}            // GET /user

      #[Route(method: 'POST')]
      public function store() {}            // POST /user/store

      #[Route(method: ['PUT', 'PATCH'])]
      public function updateApp() {}        // PUT & PATCH /user/update-app
  }
  ```

- `prefix`: Method names start with the HTTP verb. Pattern: `{verb}{StudlyAction}` with action name will be converted to kebab-case.
  Example:

  ```php
  class UserController {
      public function getIndex() {}          // GET /user
      public function postStore() {}         // POST /user/store
      public function deleteDestroyApp() {}  // DELETE /user/destroy-app
  }
  ```

### `method_extends` (bool)

Include methods inherited from parent classes. Default is `false`.

- `false`: Only the concrete controller’s own methods are scanned.
- `true`: Parent class methods are also evaluated (useful for shared CRUD bases).

Example:

```php
use Poshtive\Router\Attributes\DoNotDiscover;

#[DoNotDiscover]
abstract class BaseCrudController {
    public function index() {}
}

class UserController extends BaseCrudController {
    public function show() {}
}
```

With `method_extends` = `true` both `index` and `show` register as `UserController` methods.

### `http_methods_map` (array)

Available only when `convention` = `attribute_or_get`.

Maps method names to HTTP verbs when no attribute is present. Accepts string or array.

Example:

```php
'http_methods_map' => [
    'store' => 'POST',
    'update' => ['PUT', 'PATCH'],
    'destroy' => 'DELETE',
],
```

Attribute precedence: If a `#[Route(method: ...)]` is present, it overrides this map.

### `report_skipped_routes` (bool)

Log intentionally skipped discovered methods, such as controllers marked with `#[DoNotDiscover]` or routes guarded by `#[LocalOnly]` outside the local environment. Default is `false`.

### `strict` (bool)

Fail route discovery when duplicate route names or duplicate `HTTP_VERB + URI` combinations are discovered. Default is `false`.

- `false`: Duplicate definitions are reported to the logger when available.
- `true`: Duplicate definitions throw an exception and stop registration.

### Sample Configuration

```php
return [
    'convention' => 'attribute_or_get',
    'method_extends' => false,
    'http_methods_map' => [
        'store' => 'POST',
        'update' => ['PUT', 'PATCH'],
        'destroy' => 'DELETE',
    ],
    'report_skipped_routes' => false,
    'strict' => false,
];
```

### Quick Decision Guide

- Prefer `prefix` for explicitness and zero attributes.
- Prefer `attribute_or_get` for clean method names + selective attributes.
- Enable `method_extends` when using abstract/base controllers for shared actions.
- Populate `http_methods_map` to reduce repetitive attributes for common REST verbs.
- Enable `report_skipped_routes` while integrating the package into an existing app.
- Enable `strict` once your route structure is stable and you want duplicate discovery to fail fast.

## Registering Routes

In your `routes/web.php`, add:

```php
use Poshtive\Router\Router;

Router::create()->discover(app_path('Http/Controllers'));
```

Please note that you can still define routes manually as usual.

## How It Works

The package scans the specified directory for controller classes and their public methods. It then registers routes based on the chosen convention and any attributes applied to the classes or methods.

In general, the route path is constructed as follows:

```
/folder-one/folder-two/controller-name/{parameter-1}/method-name/{parameter-2}/...
```

With some exception, see [Parameter Order](#parameter-order) and [Child Controllers](#child-controllers).

Only `public` methods are considered. Methods inherited from parent classes are included only if `method_extends` is set to `true` in the configuration. All other methods are ignored.

## Index Controller and Method

Controller named `IndexController` will have its name omitted from the route path. Also, method named `index` will have its name omitted from the route path.

Example:

```php
namespace App\Http\Controllers;

class IndexController {
    public function index() {}
    public function about() {}
}
```

Resulting route: `GET /` and `GET /about`.

```php
namespace App\Http\Controllers;

class UserController {
    public function index() {}
    public function show() {}
}
```

Resulting route: `GET /user` and `GET /user/show`.

```php
namespace App\Http\Controllers\Admin;

class IndexController {
    public function index() {}
    public function dashboard() {}
}
```

Resulting route: `GET /admin` and `GET /admin/dashboard`. And so on.

## Parameter / Model Binding

Method parameters are converted to route parameters in the order they appear in the method signature. Only primitive types (`int`, `string`) and classes extending `Illuminate\Database\Eloquent\Model` are considered.

Example:

```php
use Poshtive\Router\Attributes\Route;
use App\Models\User;

class UserController {
    public function show(int $id) {}

    public function edit(User $user) {}
}
```

This results in:

- `GET /user/{id}/show` with `{id}` as an integer.
- `GET /user/{user}/edit` with `{user}` as a model instance.

## Parameter Order

By default, parameters are ordered based on their appearance in the method signature.

```php
class UserController {
    public function update(int $id, string $section) {}
}
```

Results in `GET /user/{id}/update/{section}`, please note that the `id` parameter is placed before the method name. You can override this behavior using `keepOrder: true` in the `Route` attribute:

```php
use Poshtive\Router\Attributes\Route;

class UserController {
    #[Route(keepOrder: true)]
    public function update(int $id, string $section) {}
}
```

Results in `GET /user/update/{id}/{section}`.

## Child Controllers

When a controller name without the `Controller` suffix has a folder name matching it in the path, all the controllers inside that folder are treated as child controllers of that controller and the route registration is handled accordingly. See the example below for clarity.

Given the following structure:

```
app/Http/
└── Controllers/
    ├── UserController.php
    └── User/
        ├── ProfileController.php
        └── SettingsController.php
```

The routes will be registered as:

- `UserController` methods: `/user/{parameter}/method-name`
- `ProfileController` methods: `/user/{parameter1}/profile/{parameter2}/method-name`
- `SettingsController` methods: `/user/{parameter1}/settings/{parameter2}/method-name`

So, all the controller's methods inside the `User` folder must have at least one parameter that extends `Illuminate\Database\Eloquent\Model`. Registration will fail otherwise.

## Available Attributes

All attributes are in the `Poshtive\Router\Attributes` namespace.

### Route

Can be applied to `class` or `method`. Defines middleware, route path, HTTP method(s), and parameters order.

> [!NOTE]
> Only `middleware` are effective on `class` level. Other options are ignored.

Example:

```php
use Poshtive\Router\Attributes\Route;

#[Route(middleware: ['auth'])]
class UserController {
    #[Route(uri: 'profile', method: 'GET')]
    public function showProfile() {}

    #[Route(method: ['POST', 'PUT'], middleware: ['log'])]
    public function updateSection(int $id, string $section) {}

    #[Route(keepOrder: true)]
    public function customOrder(string $section, int $id) {}
}
```

This means:

- `GET /profile` with `auth` middleware.
- `POST` & `PUT /user/{id}/update-section/{section}` with `auth` and `log` middleware.
- `GET /user/custom-order/{section}/{id}` with `auth` middleware, preserving parameter order.

For information why `keepOrder` is needed here, see this section about [Parameter Order](#parameter-order).

### LocalOnly

Can be applied to `class` or `method`. Marks the route as local-only, meaning it will only be registered when the application is running in a local environment.

Example:

```php
use Poshtive\Router\Attributes\LocalOnly;

#[LocalOnly]
class UserController {
    public function index() {}
}
```

Means `GET /user` is only registered in local environment.

### DoNotDiscover

Can be applied to `class`. Marks all the controller's methods to be ignored during route discovery.

Example:

```php
use Poshtive\Router\Attributes\DoNotDiscover;

#[DoNotDiscover]
class UserController {
    public function index() {}
}
```

Means no routes from `UserController` will be registered.

Please note that the `Route` attribute if any, will still be effective to child classes.

Example:

```php
use Poshtive\Router\Attributes\DoNotDiscover;

#[DoNotDiscover]
#[Route(middleware: ['auth'])]
class AuthenticatedConcerns extends Controller {
}

class UserController extends AuthenticatedConcerns {
    public function index() {}
}
```

Means `GET /user` will be registered with `auth` middleware even though `AuthenticatedConcerns` itself is marked as `DoNotDiscover`.

### Where

Can be applied to `method`. Defines regex constraints for route parameters.

Example:

```php
use Poshtive\Router\Attributes\Where;

class UserController {
    #[Where('id', '\d+')]
    public function show(int $id) {}
}
```

Means `GET /user/{id}/show` will only match if `{id}` is numeric. If Multiple `Where` attributes are applied, all constraints must be satisfied.

```php
use Poshtive\Router\Attributes\Where;

class UserController {
    #[Where('id', '\d+')]
    #[Where('slug', '[a-z0-9-]+')]
    public function show(int $id, string $slug) {}
}
```

### IgnoreParentMiddleware

Can be applied to `class` or `method`. When applied to a class, it prevents middleware defined in parent classes from being inherited. When applied to a method, it prevents middleware defined at the class level from being applied to that specific method. This includes middleware defined by parent classes.

Example:

```php
use Poshtive\Router\Attributes\IgnoreParentMiddleware;

#[IgnoreParentMiddleware]
class UserController extends AuthenticatedConcerns {
    public function index() {}
}
```

Means `GET /user` will be registered without any middleware from `AuthenticatedConcerns` if any.

```php
use Poshtive\Router\Attributes\IgnoreParentMiddleware;
use Poshtive\Router\Attributes\Route;

#[Route(middleware: ['auth'])]
class AuthenticatedConcerns extends Controller {}

class UserController extends AuthenticatedConcerns {
    #[IgnoreParentMiddleware]
    public function show() {}

    public function app() {}
}
```

Means `GET /user/show` will be registered without any middleware from `AuthenticatedConcerns`. But, `GET /user/app` will still have the `auth` middleware.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Changelog

Release notes are tracked in [CHANGELOG.md](CHANGELOG.md).

## Licensing

This package is open-sourced software licensed under the [MIT license](LICENSE).
