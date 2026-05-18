# Bersiv API Response

Bersiv API Response is a lightweight Laravel package for returning consistent JSON API responses.

It provides a semantic facade for common API response scenarios, including authentication, validation, data retrieval, process handling, external API failures, rate limits, AI answers, and system errors.

Instead of repeating response structures and messages in every controller, you can return a clear purpose-based response:

```php
<?php

use NBDev\BersivApiResponse\Facades\BersivApiResponse;

return BersivApiResponse::detail('user', $user_resource);
```

## Name

`Bersiv` means `response` or `answer` in Kurdish.

The package name reflects its purpose: providing clear and consistent API responses for Laravel applications.

## Purpose

The package is designed to make API responses:

- consistent across endpoints
- easier to read in controllers
- easier to document for frontend developers
- easier to translate and customize
- predictable for API clients

## Response Structure

### Success Response

Success responses use `success: true` and place payloads under `data`.

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": []
}
```

### Failure Response

Failure responses use `success: false` and place payloads under `errors`.

```json
{
  "success": false,
  "message": "The request failed.",
  "errors": []
}
```

Empty payloads default to empty arrays instead of `null`.

## Empty Payload Behavior

Empty payloads do not always mean failure.

List-style methods return `200 OK` even when the result is empty:

- `list()`
- `filteredList()`
- `searchResults()`
- `attributesList()`
- `valuesList()`
- `attributeRanges()`
- `dateRange()`

Some methods treat an empty payload as a missing result:

- `detail()` returns `404 Not Found` when the resource payload is empty.
- `aiAnswer()` returns `404 Not Found` when no answer is available.

## Features

- Consistent success and failure JSON structures
- Facade-based semantic response methods
- Dedicated response classes for common HTTP scenarios
- Action-based response generators
- Authentication response helpers
- Data response helpers
- Validation response helpers
- Process response helpers
- AI response helper
- Rate limit response helper
- External API failure response helpers
- System error response helper
- Array and `JsonResource` payload support
- Namespaced translation support
- Publishable translation files
- PHPUnit and Orchestra Testbench test coverage
- Laravel Pint code style checks
- Larastan / PHPStan static analysis

## Requirements

- PHP 8.2 or higher
- Laravel application compatible with the package version
- Composer

## Installation

```bash
composer require nbdev/bersiv-api-response
```

Laravel package discovery registers the service provider automatically.

## Basic Usage

```php
<?php

use Illuminate\Http\JsonResponse;
use NBDev\BersivApiResponse\Facades\BersivApiResponse;

class AuthController
{
    public function login(): JsonResponse
    {
        return BersivApiResponse::login([
            'user' => [
                'id' => 1,
                'email' => 'navid@example.com',
            ],
            'token' => [
                'token' => 'sample-token',
                'device_name' => 'web',
            ],
        ]);
    }
}
```

Example response:

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": 1,
      "email": "navid@example.com"
    },
    "token": {
      "token": "sample-token",
      "device_name": "web"
    }
  }
}
```

## More Examples

### Validation Failure

```php
<?php

return BersivApiResponse::invalidInputs(
    errors: [
        'email' => ['The email field is required.'],
    ],
);
```

Example response:

```json
{
  "success": false,
  "message": "Invalid input.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Empty List Response

```php
<?php

return BersivApiResponse::list('user');
```

Example response:

```json
{
  "success": true,
  "message": "No user found.",
  "data": []
}
```

### Detail Not Found Response

```php
<?php

return BersivApiResponse::detail('user');
```

Example response:

```json
{
  "success": false,
  "message": "user not found.",
  "errors": []
}
```

## Available Facade Groups

| Group          | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| AI             | Return AI-generated answers or missing-answer failures.           |
| Authentication | Return login, logout, token, and unauthenticated responses.       |
| Data           | Return detail, list, search, filter, range, and values responses. |
| External API   | Return responses for rejected or unavailable third-party APIs.    |
| Process        | Return responses for accepted, finished, or rejected processes.   |
| Rate Limit     | Return too many requests responses.                               |
| System         | Return internal server error responses.                           |
| Validation     | Return invalid inputs, invalid attributes, and captcha failures.  |

## Translations

The package uses namespaced translation keys.

```php
<?php

__('bersiv-api-response::auths.successful.login');
__('bersiv-api-response::auths.failures.unauthenticated');

__('bersiv-api-response::messages.failures.invalid_inputs');
__('bersiv-api-response::messages.successful.model_found', [
    'model' => 'user',
]);
```

Publish translations with:

```bash
php artisan vendor:publish --tag=bersiv-api-response-translations
```

The files will be copied to:

```text
lang/vendor/bersiv-api-response
```

## Documentation

- [Installation](docs/installation.md)
- [Response Types](docs/responses.md)
- [Facade API Reference](docs/facade-api-reference.md)
- [Usage Examples](docs/usage-examples.md)
- [Authentication Responses](docs/authentication.md)
- [Translations](docs/translations.md)
- [PHPDoc Guide](docs/phpdoc-guide.md)
- [Testing](docs/testing.md)
- [Publishing Checklist](docs/publishing-checklist.md)

## Code Quality

Run the test suite:

```bash
composer test
```

Check code style without changing files:

```bash
composer pint-test
```

Fix code style automatically:

```bash
composer pint
```

Run static analysis:

```bash
composer analyse
```

## License

MIT
