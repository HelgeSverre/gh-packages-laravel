# Laravel API Response

A lightweight Laravel package to standardize your API response structure.

---

## How This Package Works (Under the Hood)

This section explains how a Laravel package is built — useful if you're learning package development.

### Package Structure

```
zeyadrezk/api-response
├── config/api-response.php              # Publishable config file
├── helpers/helpers.php                  # Global helper function
├── src/
│   ├── ApiResponse.php                  # Main class — the actual logic
│   └── ApiResponseServiceProvider.php   # Registers the package into Laravel
├── tests/
│   ├── Pest.php                         # Pest test configuration
│   ├── TestCase.php                     # Base test case using Orchestra Testbench
│   └── ApiResponseTest.php             # Tests for all methods
└── composer.json                        # Autoloading, dependencies, auto-discovery
```

### 1. Config File (`config/api-response.php`)

Laravel packages can ship their own config files. The config defines the JSON keys used in responses. Users can publish it to customize keys without touching your code.

- `mergeConfigFrom()` in the ServiceProvider loads the default config
- `publishes()` allows users to run `php artisan vendor:publish` to copy it into their app's `config/` directory
- Values are accessed via `config('api-response.keys.status')`

### 2. ServiceProvider (`src/ApiResponseServiceProvider.php`)

Every Laravel package needs a ServiceProvider — it's the entry point that tells Laravel about your package.

- **`register()`** — runs early, used to merge config and bind classes to the container. No other services are available yet, so don't use them here.
- **`boot()`** — runs after all providers are registered. Used for publishing config, registering routes, views, migrations, etc.

Laravel auto-discovers this provider via the `extra.laravel.providers` key in `composer.json` — no manual registration needed.

### 3. Main Class (`src/ApiResponse.php`)

The core logic. A `final` class with static methods that build and return `JsonResponse` objects.

- `success()` — wraps data in a success envelope. Automatically detects `ResourceCollection` with a paginator and extracts pagination data.
- `error()` — returns an error envelope without an `errors` field.
- `validationError()` — returns an error envelope with a detailed `errors` field (e.g., field-level validation messages).
- `key()` — reads the config to resolve the JSON key name, allowing users to rename any key.

### 4. Helper Function (`helpers/helpers.php`)

A global `api()` function registered via `composer.json`'s `autoload.files`. This file is loaded on every request by Composer's autoloader.

```php
api()::success($data);
```

### 5. Auto-Discovery (`composer.json`)

The `extra.laravel` section tells Laravel to automatically register the ServiceProvider when the package is installed — no need for users to add anything to `config/app.php`.

```json
"extra": {
    "laravel": {
        "providers": [
            "Zeyadrezk\\ApiResponse\\ApiResponseServiceProvider"
        ]
    }
}
```

### 6. Testing with Pest + Orchestra Testbench

- **Orchestra Testbench** boots a real Laravel app in tests, so `config()`, `response()`, and other Laravel features work.
- **Pest** provides a clean syntax for writing tests.
- `TestCase.php` extends Testbench and registers the ServiceProvider.
- `Pest.php` tells Pest to use that TestCase for all tests.

---

## Requirements

- PHP 8.2+
- Laravel 12.x

## Installation

```bash
composer require zeyadrezk/api-response
```

The service provider is auto-discovered — no manual registration needed.

## Usage

```php
use Zeyadrezk\ApiResponse\ApiResponse;
```

### Success Response

```php
return ApiResponse::success(['id' => 1, 'name' => 'John'], 'User created', 201);
```

```json
{
    "status": true,
    "status_code": 201,
    "message": "User created",
    "data": { "id": 1, "name": "John" }
}
```

### Error Response

```php
return ApiResponse::error('Not found', 404);
```

```json
{
    "status": false,
    "status_code": 404,
    "message": "Not found"
}
```

### Validation Error

```php
return ApiResponse::validationError(
    errors: ['email' => ['The email field is required.']],
);
```

```json
{
    "status": false,
    "status_code": 422,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

### Paginated Response

Pass a `ResourceCollection` backed by a paginator and it's handled automatically:

```php
return ApiResponse::success(UserResource::collection($users));
```

```json
{
    "status": true,
    "status_code": 200,
    "message": null,
    "data": [{ "id": 1 }, { "id": 2 }],
    "pagination": {
        "current_page": 1,
        "from": 1,
        "last_page": 5,
        "per_page": 15,
        "to": 15,
        "total": 75
    }
}
```

### Meta

All methods accept an optional `meta` array:

```php
return ApiResponse::success($data, 'OK', 200, meta: ['version' => '1.0']);
```

```json
{
    "status": true,
    "status_code": 200,
    "message": "OK",
    "data": [],
    "meta": { "version": "1.0" }
}
```

## Configuration

Publish the config to customize response keys:

```bash
php artisan vendor:publish --tag=api-response-config
```

This creates `config/api-response.php`:

```php
return [
    'keys' => [
        'status'     => 'status',
        'status_code'=> 'status_code',
        'message'    => 'message',
        'data'       => 'data',
        'errors'     => 'errors',
        'pagination' => 'pagination',
        'meta'       => 'meta',
    ],
];
```

For example, change `'status' => 'success'` and responses will use `"success": true` instead of `"status": true`.

## Testing

```bash
composer test
```

## License

MIT
