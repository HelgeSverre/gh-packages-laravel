# Route Resource Paths Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/amdadulhaq/route-resource-paths-laravel.svg?style=flat-square)](https://packagist.org/packages/amdadulhaq/route-resource-paths-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/amdadulhaq/route-resource-paths-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/amdad121/route-resource-paths-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/amdad121/route-resource-paths-laravel/lint.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/amdad121/route-resource-paths-laravel/actions?query=workflow%3A"Fix+Code+Style"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/amdadulhaq/route-resource-paths-laravel.svg?style=flat-square)](https://packagist.org/packages/amdadulhaq/route-resource-paths-laravel)

This Laravel package allows you to define custom paths for create and edit routes in resource controllers. It extends the functionality of Laravel's resource routing by providing macros to set these paths globally or for specific resources.

## Features

- Set global custom paths for create and edit actions across all resource routes
- Customize paths individually for each resource route
- Support for both regular resource routes and singleton resource routes
- Works seamlessly with both `Route::resource()` and `Route::resources()` methods
- Override global settings with per-resource customization
- Zero configuration required - works out of the box

## Installation

You can install the package via composer:

```bash
composer require amdadulhaq/route-resource-paths-laravel
```

Once installed, the service provider will be registered automatically by Laravel.

## Requirements

- PHP 8.2 or higher
- Laravel 10.x, 11.x, 12.x, or 13.x

## Configuration

No additional configuration is required. The package uses Laravel's built-in service container to bind and replace the default resource registrar.

## Usage

### Setting Global Paths

To set custom paths for the create and edit actions that will apply globally to all resource routes, use the `Route::resourcePaths()` method:

```php
Route::resourcePaths([
    'create' => 'add',
    'edit' => 'change',
]);
```

After setting these global paths, all resource routes defined using `Route::resource()` will use these custom paths instead of the default ones.

### Using Global Paths with Route::resource()

The global paths will automatically be applied to all resource controllers like this:

```php
Route::resource('posts', PostController::class);
```

This will generate routes such as:

- `GET /posts/add` instead of `GET /posts/create`
- `GET /posts/{post}/change` instead of `GET /posts/{post}/edit`

### Using Global Paths with Route::resources()

You can also use the global paths when registering multiple resource controllers at once:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

This will apply the same custom paths to both photos and posts resource routes.

### Setting Custom Paths for Specific Resources

If you want to set custom paths for a specific resource, you can do so directly when defining the resource using the `paths()` method:

```php
Route::resource('users', UserController::class)->paths([
    'create' => 'add',
    'edit' => 'change',
]);
```

This will only affect the routes for the users resource:

- `GET /users/add` instead of `GET /users/create`
- `GET /users/{user}/change` instead of `GET /users/{user}/edit`

### Combining Global and Specific Paths

You can set global paths and override them for specific resources:

```php
// Set global paths
Route::resourcePaths([
    'create' => 'add',
    'edit' => 'change',
]);

// Use global paths for most resources
Route::resource('posts', PostController::class);

// Override for specific resource
Route::resource('users', UserController::class)->paths([
    'create' => 'register',
    'edit' => 'update',
]);
```

In this example:
- Posts will use `/posts/add` and `/posts/{post}/change`
- Users will use `/users/register` and `/users/{user}/update`

### Setting Paths for Multiple Resources

When registering multiple resources with `Route::resources()`, you can apply custom paths to all of them:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
])->paths([
    'create' => 'add',
    'edit' => 'modify',
]);
```

### Singleton Resource Paths

The package also supports singleton resources. Use the `Route::singletonPaths()` method to set global singleton paths:

```php
Route::singletonPaths([
    'create' => 'setup',
    'edit' => 'modify',
]);
```

Then define your singleton resource:

```php
Route::singleton('profile', ProfileController::class)->creatable();
```

This will generate the following routes:

- `GET /profile/setup` instead of `GET /profile/create`
- `GET /profile/modify` instead of `GET /profile/edit`

### Custom Paths for Specific Singleton Resources

You can also set custom paths per singleton resource:

```php
Route::singleton('profile', ProfileController::class)
    ->creatable()
    ->paths([
        'create' => 'setup',
        'edit' => 'modify',
    ]);
```

## API Reference

### Route Macros

#### `Route::resourcePaths(array $paths)`

Sets global custom paths for all resource routes.

**Parameters:**
- `$paths` (array): An associative array where keys are action names (`create`, `edit`) and values are the custom path strings.

**Example:**
```php
Route::resourcePaths([
    'create' => 'add',
    'edit' => 'change',
]);
```

#### `Route::singletonPaths(array $paths)`

Sets global custom paths for all singleton resource routes.

**Parameters:**
- `$paths` (array): An associative array where keys are action names (`create`, `edit`) and values are the custom path strings.

**Example:**
```php
Route::singletonPaths([
    'create' => 'setup',
    'edit' => 'modify',
]);
```

#### `Route::resources(array $resources)`

Registers multiple resource controllers at once and returns a chainable object that can apply custom paths.

**Parameters:**
- `$resources` (array): An associative array where keys are resource names and values are controller class names.

**Returns:** An object with a `paths()` method to apply custom paths.

**Example:**
```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
])->paths([
    'create' => 'add',
    'edit' => 'change',
]);
```

### Resource Registration Methods

#### `PendingResourceRegistration::paths(array $paths)`

Sets custom paths for a specific resource registration.

**Parameters:**
- `$paths` (array): An associative array where keys are action names (`create`, `edit`) and values are the custom path strings.

**Returns:** `PendingResourceRegistration` instance for method chaining.

**Example:**
```php
Route::resource('users', UserController::class)->paths([
    'create' => 'register',
    'edit' => 'update',
]);
```

#### `PendingSingletonResourceRegistration::paths(array $paths)`

Sets custom paths for a specific singleton resource registration.

**Parameters:**
- `$paths` (array): An associative array where keys are action names (`create`, `edit`) and values are the custom path strings.

**Returns:** `PendingSingletonResourceRegistration` instance for method chaining.

**Example:**
```php
Route::singleton('profile', ProfileController::class)
    ->creatable()
    ->paths([
        'create' => 'setup',
        'edit' => 'modify',
    ]);
```

## Complete Example

Here's a complete example showing various ways to use the package:

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;

// routes/web.php

// Set global paths for all resources
Route::resourcePaths([
    'create' => 'add',
    'edit' => 'change',
]);

// Set global paths for all singleton resources
Route::singletonPaths([
    'create' => 'setup',
    'edit' => 'modify',
]);

// Posts will use global paths: /posts/add, /posts/{post}/change
Route::resource('posts', PostController::class);

// Users will override global paths: /users/register, /users/{user}/update
Route::resource('users', UserController::class)->paths([
    'create' => 'register',
    'edit' => 'update',
]);

// Multiple resources with shared custom paths
Route::resources([
    'photos' => PhotoController::class,
    'albums' => AlbumController::class,
])->paths([
    'create' => 'upload',
    'edit' => 'edit',
]);

// Singleton with custom paths
Route::singleton('profile', ProfileController::class)
    ->creatable()
    ->paths([
        'create' => 'setup',
        'edit' => 'modify',
    ]);
```

## Troubleshooting

### Paths not working

If the custom paths are not working:

1. Ensure the service provider is registered (it should be auto-discovered in Laravel)
2. Check that you're calling the macro methods before defining your resources
3. Verify the package is installed correctly by checking `composer show amdadulhaq/route-resource-paths-laravel`

### Conflicts with other packages

If you're using other packages that also modify the resource registrar, ensure there are no conflicts by:

1. Checking the order of service provider registration
2. Testing with a fresh Laravel installation
3. Reviewing other packages' documentation

## Migration Guide

If you're upgrading from an older version:

1. No breaking changes - the API remains the same
2. Check the changelog for new features and improvements
3. Ensure your Laravel version meets the requirements (10.x, 11.x, 12.x, or 13.x)

## Credits

- [Amdadul Haq](https://github.com/amdad121)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Contributing

If you find any issues or have suggestions for improvements, feel free to create a pull request or open an issue on the [GitHub repository](https://github.com/amdad121/route-resource-paths-laravel).

## Support

For support, email amdadulhaq781@gmail.com or open an issue on GitHub.
