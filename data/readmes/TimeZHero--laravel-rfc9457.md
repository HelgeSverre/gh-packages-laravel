# Laravel RFC 9457

A Laravel package that standardizes API error responses using the [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) specification. Exceptions opt in via a trait and PHP attributes — no base class required, no HTTP coupling on your domain exceptions.

## Installation

```bash
composer require timezhero/laravel-rfc9457
```

The service provider is auto-discovered.

## Quick start

**1. Register the handler** in `bootstrap/app.php`:

```php
use TimeZHero\Rfc9457\ProblemDetailsHandler;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function (Exceptions $exceptions): void {
        ProblemDetailsHandler::register($exceptions);
    })
    ->create();
```

**2. Scaffold an exception:**

```bash
php artisan make:problem-exception InsufficientStock
```

**3. Throw it:**

```php
throw new InsufficientStockException(productId: 42, requested: 30, available: 5);
```

Response (`409`, `application/problem+json`):

```json
{
    "type": "/problems/insufficient-stock",
    "title": "Insufficient Stock",
    "detail": "The requested quantity of 30 exceeds the available stock of 5.",
    "status": 409,
    "instance": "/api/orders",
    "product_id": 42,
    "requested": 30,
    "available": 5
}
```

Validation errors, HTTP exceptions, and generic 5xx are also wrapped automatically.

## CLI

| Command | What it does |
|---------|--------------|
| `php artisan make:problem-exception {name}` | Creates exception class + translation entry + documentation view |
| `php artisan vendor:publish --tag=rfc9457-config` | Publish config |
| `php artisan vendor:publish --tag=rfc9457-views` | Publish views to customize the docs layout |

## Advanced

### Manual exception

```php
#[Problem('Rate Limit Exceeded', Response::HTTP_TOO_MANY_REQUESTS)]
class RateLimitExceededException extends \RuntimeException
{
    use ProblemRfc9457;

    public function __construct(
        #[Extension(description: 'Seconds to wait before retrying.')]
        private readonly int $retryAfterSeconds,
    ) {
        parent::__construct('Internal log message');
    }

    protected function detail(): string
    {
        return __('exceptions.rate_limit_exceeded.detail', [
            'retry_after_seconds' => $this->retryAfterSeconds,
        ]);
    }
}
```

- `#[Problem]` — title + HTTP status. Type URI is derived from class name. Omit to auto-derive everything (defaults to 500)
- `#[Extension]` — marks properties as extension fields (snake_cased in output). Use `name:` to override the key
- `detail()` — user-facing message (separate from internal `$message`). Return `''` to omit
- `extensions()` — override to add computed fields at runtime. Merged with attribute extensions

### Translations

Convention-based in `lang/{locale}/exceptions.php`:

```php
'insufficient_stock' => [
    'title' => 'Insufficient Stock',
    'detail' => 'Requested :requested but only :available available.',
],
```

Falls back to the raw `#[Problem]` title if no translation exists.

### Documentation pages

Each exception gets a page at `/problems/{slug}`. Add a description view at `resources/views/vendor/rfc9457/details/{slug}.blade.php`. Extensions and metadata are rendered automatically.

### Configuration

```php
// config/rfc9457.php
return [
    'exception_namespace' => 'App\\Exceptions',
    'documentation' => [
        'enabled' => true,       // set false to disable route + views entirely
        'route_prefix' => '/problems',
    ],
];
```
