# Laravel Auth

`zairakai/laravel-auth` centralizes the shared authentication runtime used by
Zairakai Laravel applications.

It is intentionally headless:

- It configures `laravel/fortify` for authentication flows.
- It configures `laravel/sanctum` for shared Blade and SPA sessions.
- It standardizes JSON and redirect responses for auth endpoints.
- It leaves views, domain-specific redirects, and user model details to each
  application.

## Scope

This package is designed for Laravel 12 applications.

`laravel/fortify` does not currently publish Laravel 13 support, so the package
is intentionally constrained until upstream compatibility is available.

## Installation

```bash
composer require zairakai/laravel-auth
```

Publish the configuration when application-level overrides are needed:

```bash
php artisan vendor:publish --tag=zairakai-config
```

## Configuration

The package exposes one config file: `config/laravel-auth.php`.

Key areas:

- `fortify`: shared Fortify runtime settings
- `features`: enabled Fortify features
- `sanctum`: stateful domain and guard settings
- `redirects`: default redirect targets for HTML requests

## Testing

```bash
make quality
make test-all
```
