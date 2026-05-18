# EchoApi

⚠️ THIS LIBRARY IS NO LONGER SUPPORTED AND WILL SOON BE REMOVED!!! 

A simple package for generating API responses in Laravel.

## Installation

You can install the package via composer:

```
composer require mrgarest/echo-api
```

# Examples

Below are some examples using the methods for different responses.

## Success

To create a successful JSON response, you can use the method:

```php
return EchoApi::success();
```

Response result:

```json
{
  "success": true
}
```

### Adding additional data

If you want to add additional data to the response, you can pass an array with data to the `success()` method.

```php
$data = [
    'user' => [
        'id' => 21314,
        'role' => 'user',
        'email' => 'email@example.com'
    ]
];

return EchoApi::success($data);
```

Response result:

```json
{
  "success": true,
  "user": {
    "id": 21314,
    "role": "user",
    "email": "email@example.com"
  }
}
```

## Error

To create a JSON response with the HTTP error code, you can use the method:

```php
$httpStatus = Response::HTTP_NOT_FOUND; // 404 Not Found
return EchoApi::httpError($httpStatus);
```

Response result:

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Bad Request"
  }
}
```

### Custom error

If the standard HTTP error codes are not enough for you, you can use your own by creating them in the `config/echo-api.php` file.

```php
return EchoApi::findError('EXAMPLE');
```

Response result:

```json
{
  "success": false,
  "error": {
    "code": "EXAMPLE",
    "message": "Example of error data structure"
  }
}
```

*To get `echo-api.php`, don't forget to run `php artisan vendor:publish`.*

### Adding additional data

As with the `success()` method, you can add additional data to the responses for the `httpError()` and `findError()` methods.

```php
$data = [
    'error' = [
        'uuid' => '21e38f4d-3be8-457c-98da-3059a947e75b'
    ],
    'count' => 0,
    'data' => null
];
return EchoApi::httpError(Response::HTTP_NOT_FOUND, $data);
```

Response result:

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Bad Request",
    "uuid": "21e38f4d-3be8-457c-98da-3059a947e75b"
  },
  "count": 0,
  "data": null
}
```
