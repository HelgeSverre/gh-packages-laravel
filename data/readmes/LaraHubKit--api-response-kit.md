# LaraHub API Response Kit

**Vendor:** LaraHub | **Domain:** [larahub.io](https://www.larahub.io) | **Package:** `larahub/api-response-kit`

A Laravel package to standardize API responses, errors, and validation outputs across Laravel applications.

## Why

- Consistent JSON response schema across teams/projects
- Less boilerplate in controllers/services
- Predictable error + validation formats
- Optional request ID for tracing/debugging
- Environment-aware debug mode (hides sensitive info in production)
- Custom formatter support for project-specific schemas

---

## Features

| Feature | Description |
|---|---|
| Automatic response formatting | Wraps controller return values (arrays, models, collections) into standard JSON |
| Pagination support | Auto-detects `paginate()` / `cursorPaginate()` results and moves pagination metadata into `meta.pagination` |
| Global error handling | Converts exceptions into standardized JSON error responses (404, 403, 401, 500, etc.) |
| Validation error standardization | Formats Laravel validation errors into a clean, predictable structure |
| Configurable response schema | Customize response keys via config file |
| Request ID generation | Unique request ID (`LH-XXXXXX`) per request for debugging/logging |
| Facade support | Manual response control when automatic formatting is not needed |
| Middleware integration | Intercepts outgoing responses and applies formatting automatically |
| Debug mode | Full stack traces in dev; sensitive info (SQL, file paths) hidden in production |
| Custom formatters | Define your own response structure via custom formatter classes |

---

## Installation

```bash
composer require larahub/api-response-kit
```

## Publish Config

```bash
php artisan vendor:publish --tag=api-response-kit-config
```

This will publish `config/api-response-kit.php`.

---

## Response Schema

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {
    "request_id": "LH-XXXXXX",
    "timestamp": "2026-01-27T12:00:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": null,
  "meta": {
    "request_id": "LH-XXXXXX",
    "timestamp": "2026-01-27T12:00:00Z"
  }
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "The email field is required"
  },
  "meta": {
    "request_id": "LH-XXXXXX",
    "timestamp": "2026-01-27T12:00:00Z"
  }
}
```

---

## Basic Usage

When middleware is enabled, normal controller returns are automatically wrapped into the standard response schema.

```php
// Controller action — no changes needed
return User::query()->latest()->paginate();
```

---

## Pagination

### Auto-detection (middleware)

When the middleware is enabled, any `paginate()` or `cursorPaginate()` return value is automatically detected and reformatted. No changes needed in the controller:

```php
// Default per_page comes from config (default: 10)
return User::query()->latest()->paginate();

// Developer-defined per_page
return User::query()->latest()->paginate(15);

// Cursor pagination is also supported
return User::query()->latest()->cursorPaginate(10);
```

### Paginated response schema

```json
{
  "success": true,
  "message": "Success",
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "meta": {
    "request_id": "LH-XXXXXX",
    "timestamp": "2026-01-27T12:00:00Z",
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 10,
      "total": 50,
      "from": 1,
      "to": 10,
      "next_page_url": "https://example.com/api/users?page=2",
      "prev_page_url": null
    }
  }
}
```

### Manual usage (Facade)

```php
use LaraHub\ApiResponseKit\Facades\ApiResponseKit;

return ApiResponseKit::paginated(
    User::query()->latest()->paginate(15),
    'Users fetched successfully'
);
```

### Using the config per_page helper

Keep your per-page number in one place — `config/api-response-kit.php`:

```php
// Returns the value of pagination.per_page (default: 10)
return ApiResponseKit::paginated(
    User::query()->latest()->paginate(ApiResponseKit::perPage())
);
```

### Configuration

Publish the config and adjust the default:

```php
// config/api-response-kit.php
'pagination' => [
    'per_page' => env('API_RESPONSE_KIT_PER_PAGE', 10),
],
```

Or set it in `.env`:

```env
API_RESPONSE_KIT_PER_PAGE=15
```

---

## Manual Usage (Facade)

```php
use LaraHub\ApiResponseKit\Facades\ApiResponseKit;

// Success responses
ApiResponseKit::success($data, 'User fetched');          // 200
ApiResponseKit::created($data, 'Resource created');      // 201
ApiResponseKit::accepted($data, 'Request accepted');     // 202
ApiResponseKit::noContent();                             // 204

// Error responses
ApiResponseKit::badRequest('Invalid input', $errors);    // 400
ApiResponseKit::unauthorized('Please log in');           // 401
ApiResponseKit::forbidden('Access denied');              // 403
ApiResponseKit::notFound('Resource not found');          // 404
ApiResponseKit::methodNotAllowed();                      // 405
ApiResponseKit::conflict('Duplicate entry', $errors);   // 409
ApiResponseKit::unprocessableEntity('Failed', $errors); // 422
ApiResponseKit::tooManyRequests();                       // 429
ApiResponseKit::serverError('Oops', $errors);           // 500
ApiResponseKit::serviceUnavailable();                   // 503

// Validation errors
ApiResponseKit::validationError($errors, 'Validation failed');

// Exceptions
ApiResponseKit::exception($throwable);

// Request ID
$id = ApiResponseKit::getRequestId();
ApiResponseKit::setRequestId('my-trace-id');
```

---

## Middleware

The package registers a middleware alias:

- `api-response-kit`

Auto-registration is controlled by config keys:

- `api-response-kit.auto_middleware`
- `api-response-kit.middleware.enabled`
- `api-response-kit.middleware.global`
- `api-response-kit.middleware.exclude`

---

## Configuration

### Customizing Schema Keys and Defaults

Edit `config/api-response-kit.php`:

- `keys.*` — override key names (`success`, `message`, `data`, `errors`, `meta`)
- `default_message` — default success message
- `request_id_prefix` — prefix for generated request IDs

### Debug Mode

```php
return [
    'debug' => [
        'show_trace' => env('APP_DEBUG', false),
        'hide_sql_errors' => env('APP_ENV') === 'production',
    ],
];
```

In `APP_DEBUG=true` (development): full error details and stack traces are included.  
In production: SQL queries, stack traces, and file paths are hidden.

### Custom Formatters

You can provide your own formatter classes via config:

```php
return [
    'formatter' => null,
    'custom_formatters' => [
        // 'my_custom_format' => App\Formatters\MyCustomFormatter::class,
    ],
];
```

Config keys:

- `api-response-kit.formatter` — default formatter implementation
- `api-response-kit.custom_formatters` — named formatters
- `api-response-kit.formatters.*` — override built-in per type: `success` / `error` / `validation` / `exception`

For safety/backwards-compatibility, per-type overrides should extend the built-in formatter they replace.

---

## Package Architecture

### Folder Structure

```text
api-response-kit/
├── config/
│   └── api-response-kit.php
├── src/
│   ├── ApiResponseKitServiceProvider.php
│   ├── ApiResponseKit.php
│   ├── Facades/
│   │   └── ApiResponseKit.php
│   ├── Middleware/
│   │   └── ApiResponseKitMiddleware.php
│   ├── Formatters/
│   │   ├── SuccessFormatter.php
│   │   ├── ErrorFormatter.php
│   │   ├── ValidationFormatter.php
│   │   └── ExceptionFormatter.php
│   ├── Contracts/
│   │   └── ResponseFormatterInterface.php
│   └── Support/
│       ├── ResponseSchema.php
│       ├── RequestIdGenerator.php
│       └── ConfigResolver.php
├── tests/
│   ├── TestCase.php
│   ├── SuccessFormatterTest.php
│   ├── ErrorFormatterTest.php
│   └── MiddlewareTest.php
├── phpunit.xml
├── composer.json
└── README.md
```

### Core Components

| Component | Responsibility |
|---|---|
| `ApiResponseKitServiceProvider` | Register services, publish config, bind into Laravel container |
| `ApiResponseKitMiddleware` | Intercept responses, detect type, apply appropriate formatter |
| `SuccessFormatter` | Format successful responses |
| `ErrorFormatter` | Format generic errors and HTTP exceptions |
| `ValidationFormatter` | Format validation error responses |
| `ExceptionFormatter` | Convert exceptions into standardized JSON errors |
| `ResponseSchema` | Build final response structure based on config |
| `RequestIdGenerator` | Generate unique request IDs |
| `ConfigResolver` | Resolve configuration values dynamically |
| `ApiResponseKit` (Facade) | Manual response control when automatic formatting is not desired |

---

## Testing

The package ships with a PHPUnit test suite powered by **[Orchestra Testbench](https://github.com/orchestral/testbench)**, which boots a real Laravel application for each test.

### Requirements

| Dependency | Version |
|---|---|
| `phpunit/phpunit` | `^10.0 \| ^11.0` |
| `orchestra/testbench` | `^8.0 \| ^9.0 \| ^10.0` |

Install dev dependencies (first time only):

```bash
composer install
```

### Run the Test Suite

```bash
./vendor/bin/phpunit
```

Or via the `composer test` script if you add one:

```bash
# composer.json → scripts
"test": "vendor/bin/phpunit"
```

```bash
composer test
```

### Test Structure

| File | What it covers |
|---|---|
| `tests/TestCase.php` | Base class — boots the service provider, registers the facade, enables debug mode |
| `tests/SuccessFormatterTest.php` | `SuccessFormatter`, `ApiResponseKit::success/created/accepted/noContent/paginated`, request ID helpers, data normalisation |
| `tests/ErrorFormatterTest.php` | `ErrorFormatter`, `ValidationFormatter`, `ExceptionFormatter`, all `ApiResponseKit` error/HTTP-status helpers |
| `tests/MiddlewareTest.php` | `ApiResponseKitMiddleware` — pass-through conditions, success wrapping, pagination detection, error/validation formatting, exception catching |

### Test Environment

The base `TestCase` pre-configures the following for every test:

```php
$app['config']->set('app.env', 'testing');
$app['config']->set('app.debug', true);
$app['config']->set('api-response-kit.debug.show_trace', true);
$app['config']->set('api-response-kit.debug.hide_sql_errors', false);
```

Each test method receives a **fresh application instance**, so config overrides in one test cannot bleed into another.

### Example: Override Config Per Test

```php
public function test_exception_hides_details_in_production(): void
{
    $this->app['config']->set('api-response-kit.debug.show_trace', false);

    $data = $this->kit->exception(new \RuntimeException('secret'))->getData(true);

    $this->assertSame('An unexpected error occurred', $data['message']);
    $this->assertNull($data['errors']);
}
```

---

## Target Users

- Laravel backend developers
- API-driven applications (REST APIs)
- Development teams requiring standardized API contracts
- SaaS and enterprise Laravel projects

---

## Roadmap

### v2 (Planned)

- API versioning support
- Multiple response schemas
- Advanced logging integration

### v3 (Planned)

- API documentation auto-generation
- Frontend SDK integration
- Enterprise-level customization
