![](https://banners.beyondco.de/Laravel%20API%20Response%20Formatter.png?theme=light&packageManager=composer+require&packageName=renslabs%2Flaravel-api-response-formatter&pattern=architect&style=style_1&description=Generate+Consistent%2C+Well-structured+JSON+Responses+In+Your+Laravel+Application.&md=1&showWatermark=0&fontSize=100px&images=https%3A%2F%2Flaravel.com%2Fimg%2Flogomark.min.svg)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/renslabs/laravel-api-response-formatter.svg?style=flat-square)](https://packagist.org/packages/renslabs/laravel-api-response-formatter)
[![Total Downloads](https://img.shields.io/packagist/dt/renslabs/laravel-api-response-formatter.svg?style=flat-square)](https://packagist.org/packages/renslabs/laravel-api-response-formatter)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

# Laravel API Response Formatter

`Laravel API Response Formatter` is a class that provides methods for formatting API responses in a standardized format. It simplifies the process of creating consistent and well-structured JSON responses in your API.

## Requirements

- PHP `^8.1 | ^8.2 | ^8.3`
- Laravel 8, 9, 10, 11 ,12 or 13

## Installation

You can install the package via composer:

```bash
composer require renslabs/laravel-api-response-formatter
```

The package will automatically register itself.

## Function List

The `Laravel API Response Formatter` class provides the following functions:

| Function             | Description                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `success()`          | Formats a success response with optional data, message, status, and HTTP code.            |
| `created()`          | Formats a created response with optional data, message, status, and HTTP code.            |
| `noContent()`        | Formats a no content response with optional data, message, status, and HTTP code.         |
| `error()`            | Formats an error response with optional data, message, status, and HTTP code.             |
| `unAuthenticated()`  | Formats an unauthenticated response with optional data, message, status, and HTTP code.   |
| `forbidden()`        | Formats a forbidden response with optional data, message, status, and HTTP code.          |
| `notFound()`         | Formats a not found response with optional data, message, status, and HTTP code.          |
| `methodNotAllowed()` | Formats a method not allowed response with optional data, message, status, and HTTP code. |
| `failedValidation()` | Formats a failed validation response with optional data, message, status, and HTTP code.  |

## Parameters

The functions in the `Laravel API Response Formatter` class accept the following parameters:

- `$data` (optional): The data to be included in the response. It can be of any type.
- `$message` (optional): The message to be included in the response. If not provided, a default message will be used.
- `$status` (optional): The success status of the response. Defaults to `true` for success responses and `false` for error responses.
- `$httpCode` (optional): The HTTP response code to be returned. It defaults to the corresponding HTTP status code for each response type.

## Example Usage

Here's an example of how you can use the `Laravel API Response Formatter` class in a user controller:

```php
<?php

use renslabs\ApiResponseFormatter\ApiResponse;

class UserController extends Controller
{
    public function show($id): JsonResponse
    {
        $user = User::find($id);

        if ($user) {
            return ApiResponse::success($user);
        } else {
            return ApiResponse::notFound(null, 'User not found');
        }
    }

    public function create(Request $request): JsonResponse
    {
        // Validation logic

        if ($validationFails) {
            return ApiResponse::failedValidation($validationErrors);
        }

        $user = User::create($request->all());

        return ApiResponse::created($user);
    }
}
```

In the above example, the `show()` method fetches a user by ID and returns a success response if the user exists. If the user is not found, it returns a not found response. The `create()` method performs validation and creates a new user. If the validation fails, it returns a failed validation response. Otherwise, it returns a created response with the created user.

```json
{
  "meta": {
    "code": 200,
    "success": true,
    "message": "OK"
  },
  "result": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

And for an error case:

```json
{
  "meta": {
    "code": 404,
    "success": false,
    "message": "User not found"
  },
  "result": null
}
```

The `meta` object contains information about the response, such as the response code, status, and message. The `result` object holds the actual response data.

Note: The examples provided are simplified and may require modifications to fit your specific use case

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email okriizaa@gmail.com instead of using the issue tracker.

## Credits

This package was created by [RensLabs](https://github.com/renslabs)

- [All Contributors](../../contributors)

## License

The Laravel API Response Formatter package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
