# Fast API CRUD Scaffold Package

Generate API CRUD boilerplate in Laravel with a single command.

## Features

- Command: `make:fastapi {name} {flags?}`
- Supports Laravel `9` through `13`
- Generates:
  - model (always generated)
  - migration (`m`)
  - controller (`c`)
  - resource (`r`)
  - requests (`f`)
  - repository (`repo`)
- Controller ships with standard CRUD methods:
  - `index`, `show`, `store`, `update`, `destroy`
- Repository pattern included by default for clean separation.
- Optional route appending to `routes/api.php`.

## Installation

Install in your Laravel app:

```bash
composer require remonhasan/fastapi-crud-scaffold
```

If Composer shows dependency conflicts, update lock dependencies during install:

```bash
composer require remonhasan/fastapi-crud-scaffold -W
```

Publish config (optional):

```bash
php artisan vendor:publish --tag=fastapi-config
```

Publish stubs (optional):

```bash
php artisan vendor:publish --tag=fastapi-stubs
```

## Usage

```bash
php artisan make:fastapi Product --mode=crfrepo
```

This generates:

- `Product` model
- migration for `products` table
- `ProductController`
- `ProductResource`
- `ProductStoreRequest` and `ProductUpdateRequest`
- `ProductRepository`

### Flags

- `m` => migration
- `c` => controller
- `r` => resource
- `f` => requests
- `repo` => repository

### Single-purpose generation:

```bash
# Create model + migration only
php artisan make:fastapi Product --mode=m

# Create model + controller (+ repository automatically)
php artisan make:fastapi Product --mode=c
```

If flags are omitted, all generators run.

### Routes

- Add `--routes` to append `Route::apiResource(...)` to `routes/api.php`.
- Set `fastapi.auto_append_routes=true` in config for default auto-route behavior.
- Use `--no-routes` to explicitly skip route appending.

Examples:

```bash
php artisan make:fastapi Product --mode=crfrepo --routes
```
