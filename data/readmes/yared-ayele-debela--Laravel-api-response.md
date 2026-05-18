# Yared API Response

Advanced API response formatter for Laravel. Provides consistent, professional JSON responses for your API.

## Installation

```bash
composer require yared/api-response
```

Or for local development, add to your Laravel project's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../laravel-api-response"
        }
    ]
}
```

Then:

```bash
composer require yared/api-response
```

## Publish Config

```bash
php artisan vendor:publish --tag=api-response-config
```

## Usage

### Success Response

```php
use Yared\ApiResponse\Facades\ApiResponse;

return ApiResponse::success($user, "User fetched successfully");
```

### Error Response

```php
return ApiResponse::error("User not found", 404);
```

### Pagination

```php
return ApiResponse::paginate(User::paginate(10));
```

### Validation Errors

```php
return ApiResponse::error("Validation failed", 422, $validator->errors());
```

## Example Output

```json
{
    "success": true,
    "message": "Users retrieved",
    "data": [...],
    "meta": {
        "request_id": "f24e4f21-...",
        "timestamp": "2026-03-05T22:50:00+00:00"
    }
}
```

## Configuration

Edit `config/api-response.php` to customize:

- `success_key` - Key for success flag
- `message_key` - Key for message
- `data_key` - Key for data payload
- `meta_key` - Key for meta information
- `request_id` - Include unique request ID
- `include_timestamp` - Include response timestamp

## Middleware

Add `FormatApiResponse` middleware to API routes for automatic response formatting. Register in `app/Http/Kernel.php`:

```php
protected $middlewareAliases = [
    // ...
    'api.format' => \Yared\ApiResponse\Middleware\FormatApiResponse::class,
];
```

## License

MIT
