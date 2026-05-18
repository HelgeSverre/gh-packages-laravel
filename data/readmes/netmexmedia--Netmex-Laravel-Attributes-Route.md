# Netmex - Laravel Attributes: Route

[![Packagist Version](https://img.shields.io/packagist/v/netmex/laravel-attributes.svg)](https://packagist.org/packages/netmex/laravel-attributes)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Lightweight Laravel package to define and register HTTP routes using PHP Attributes on controllers and methods.

Key features
- Define routes declaratively with a `#[Route(...)]` PHP Attribute on controllers and methods.
- Convert attributes into a compact `RouteMetadata` value object via a parser.
- Cache discovered metadata with optional automatic invalidation based on controller file mtimes.
- A `Registrar` service that wires metadata into the Laravel router (route registration and model binding helpers).

Table of Contents
- Installation
- Quick Usage
- Class-level group attributes
- Service Provider
- Configuration
- Commands
- Contributing
- License & Maintainer

## Installation

Install the package via Composer:

```bash
composer require netmex/laravel-attributes
```

The package supports Laravel's package auto-discovery. If you don't use auto-discovery, register the service provider in your application:

```php
// config/app.php
'providers' => [
    // ...
    Netmex\Attributes\Route\AttributesRouteServiceProvider::class,
];
```

## Quick Usage

Annotate controller classes and methods using the package attribute `Netmex\Laravel\Attributes\Route`.

Method-level example:

```php
use Netmex\Laravel\Attributes\Route;

final class PostController
{
    #[Route(path: '/posts', name: 'posts.index', methods: ['GET'])]
    public function index()
    {
        // controller action
    }

    #[Route(path: '/posts/{id}', name: 'posts.show', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function show(int $id)
    {
        // controller action
    }
}
```

Class-level (group) example — apply a prefix and default middleware or naming:

```php
use Netmex\Laravel\Attributes\Route;

#[Route(path: '/admin', name: 'admin.', middleware: ['auth'])]
final class Admin\DashboardController
{
    #[Route(path: '/dashboard', name: 'dashboard')]
    public function index() {}
}
```

## Service Provider & Services

The package registers the following services in the container via `AttributesRouteServiceProvider`:
- `Discovery\ControllerDiscovery` — discover controller classes from the configured path/namespace.
- `Parser\AttributeParser` — parse attributes (Reflection) into `RouteMetadata` instances.
- `Cache\RouteMetadataCache` — cache and return metadata arrays/objects.
- `Registrar\Registrar` and `Registrar\RouteRegistrar` — register routes into `Illuminate\Routing\Router` and apply model binding.

## Configuration

Publish or review `config/attributes-route.php` for the following options:

- `cache_key` (string) — cache key prefix (default: `attributes_route_metadata`).
- `cache_ttl` (int|null) — TTL in seconds (null = forever).
- `auto_invalidate` (bool) — append a mtime-based hash to the cache key so metadata is automatically invalidated when controller files change.

## Commands

The package includes a console command to clear the metadata cache. You can call it via artisan (command name is provided by the package service provider):

```bash
php artisan attributes-route:clear
```

## Contributing

Contributions welcome. Suggested improvements and tests:
- Integration tests using `Orchestra\Testbench` to assert `Registrar::register()` registers routes into the router.
- Tests for the console cache-clear command and cache invalidation behavior.
- Add documentation examples showing `php artisan route:list` after registration.

## License
MIT License
