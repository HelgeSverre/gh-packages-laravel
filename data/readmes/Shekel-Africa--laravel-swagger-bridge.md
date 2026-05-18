# Laravel Swagger Bridge

An automated, code-first OpenAPI specification generator for Laravel. This package bridges the gap between your Laravel codebase (Routes, FormRequests, and API Resources) and Swagger documentation without requiring verbose manual `@OA` annotations.

## Features

- **Auto-Route Discovery**: Automatically scans all routes starting with `api/`.
- **FormRequest Mapping**:
    - Maps `rules()` to Request Body (`POST/PUT/PATCH`) or Query Parameters (`GET/DELETE`).
    - Supports a dedicated `queryRules()` method for hybrid requests (e.g., `POST` with query params).
    - Intelligent type guessing (`integer`, `boolean`, `uuid`, `email`, `enum`).
- **Response Inference**:
    - Detects `JsonResource` and `AnonymousResourceCollection` from controller method return type hints.
    - Automatically extracts schema fields from the Resource's `toArray()` method using static analysis.
    - Handles PHP 8.0 Union Types (e.g., `: UserResource|JsonResponse`).
- **Path Parameter Detection**:
    - Automatically detects `{id}` style placeholders in routes.
    - Infers types (`integer`, `boolean`, `uuid`) from controller method type-hints and route `where` constraints.
- **Security & Middleware**:
    - Automatically adds Bearer authentication security schemes if `auth` or `client.auth` middleware is detected.
    - Auto-generates `401 Unauthenticated` and `403 Forbidden` responses for protected routes.
- **Readable Operation IDs**:
    - Prioritizes Laravel route names.
    - Falls back to a readable `path.to.endpoint.method` format.

## Requirements

- PHP: `^8.0.2`
- Laravel: `^9.0`
- `darkaonline/l5-swagger`: `^8.0`

## Installation

### 1. Add to your project
Add the package to your `composer.json` using a path repository if developing locally:

```json
"repositories": [
    {
        "type": "path",
        "url": "packages/shekel/laravel-swagger-bridge"
    }
],
```

Then run:
```bash
composer require shekel/laravel-swagger-bridge
```

### 2. Register the Processor
Add the bridge processor to your `config/l5-swagger.php` file:

```php
'scanOptions' => [
    'processors' => [
        new \Shekel\SwaggerBridge\Processors\LaravelProcessor(),
    ],
],
```

## Usage

### Documenting Requests
Simply use a `FormRequest` in your controller method. The bridge does the rest.

```php
public function store(CreateUserRequest $request) { ... }
```

### Documenting Responses
Add a return type hint to your controller method. The bridge will analyze the Resource's `toArray()` method to build the schema.

```php
public function show(User $user): UserResource
{
    return new UserResource($user);
}
```

### Documenting Summaries
Use standard PHP DocBlocks. The first line becomes the `summary`, and the rest becomes the `description`.

```php
/**
 * Register a new user
 * This endpoint handles user onboarding and triggers a welcome email.
 */
public function register(AuthRequest $request) { ... }
```

## Running Tests

Navigate to the package directory and run:
```bash
composer install
vendor/bin/phpunit
```

## License
MIT
