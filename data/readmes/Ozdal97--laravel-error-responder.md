# Laravel Error Responder

Standardized JSON error responses for Laravel APIs.
Drop the trait into your `App\Exceptions\Handler` and stop hand-rolling
inconsistent error payloads in every project.

- ✅ Default `application/json` formatter
- ✅ RFC 7807 (`application/problem+json`) formatter
- ✅ Typed exceptions: `NotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `Validation`, `RateLimit`, `ServiceUnavailable`
- ✅ Sane defaults for `WWW-Authenticate`, `Retry-After`
- ✅ Optional debug payload (file / line / trace) – auto-disabled in production
- ✅ Pest test suite, PHP 8.2+, Laravel 10/11

---

## Install

```bash
composer require ozdal/laravel-error-responder
```

The service provider auto-registers via Laravel package discovery.

Publish the config (optional):

```bash
php artisan vendor:publish --tag=error-responder-config
```

## Wire into your exception handler

```php
// app/Exceptions/Handler.php

use Ozdal\ErrorResponder\Http\Concerns\RendersApiErrors;

class Handler extends ExceptionHandler
{
    use RendersApiErrors;

    public function render($request, Throwable $e)
    {
        if ($this->wantsJson($request)) {
            return $this->renderApiError($e, $request);
        }

        return parent::render($request, $e);
    }
}
```

That's it. Every API exception is now rendered through one consistent shape.

## Throwing typed exceptions

```php
use Ozdal\ErrorResponder\Exceptions\NotFoundException;
use Ozdal\ErrorResponder\Exceptions\ConflictException;
use Ozdal\ErrorResponder\Exceptions\ValidationException;

throw NotFoundException::for('User', $id);

throw new ConflictException('Slug already taken.', ['slug' => $slug]);

throw new ValidationException('Invalid input.', [
    'email' => ['The email field is required.'],
]);
```

## Response shape — default formatter

```json
{
  "error": {
    "code": "not_found",
    "message": "User [42] could not be found.",
    "status": 404,
    "details": { "resource": "User", "id": 42 },
    "request": { "path": "/api/users/42", "method": "GET" }
  }
}
```

## Response shape — RFC 7807

Set `ERROR_RESPONDER_FORMATTER=rfc7807` and you get:

```json
{
  "type": "https://errors.example.com/not_found",
  "title": "Not Found",
  "status": 404,
  "detail": "User [42] could not be found.",
  "instance": "/api/users/42",
  "code": "not_found",
  "resource": "User",
  "id": 42
}
```

with `Content-Type: application/problem+json`.

## Force JSON on selected routes

```php
Route::middleware(['force-json'])->group(function () {
    Route::get('/api/v1/...', ...);
});
```

## Configuration

| Key                       | Env                          | Default     |
|---------------------------|------------------------------|-------------|
| `formatter`               | `ERROR_RESPONDER_FORMATTER`  | `default`   |
| `debug`                   | `ERROR_RESPONDER_DEBUG`      | env-derived |
| `type_base_uri`           | `ERROR_RESPONDER_TYPE_URI`   | `https://errors.example.com/` |
| `trace_frames`            | —                            | `15`        |
| `codes`                   | —                            | sane defaults per status |

## Testing the package

```bash
composer install
composer test
```

## License

MIT © Mustafa Ozdal
