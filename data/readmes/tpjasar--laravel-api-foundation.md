# Laravel API Foundation

Keeps your Laravel API consistent: versioned routes (v1, v2, v3…), same JSON shape for success and errors, and pagination. No config needed for new versions - just use them in the URL.

## Install

```bash
composer require tpjasar/laravel-api-foundation
```

Publish config (optional):

```bash
php artisan vendor:publish --tag=api-foundation-config
```

## Versioned routes

Hit `/api/v1/users`, `/api/v2/users`, `/api/v99/users`- all work. No need to add each version in config.

In `App\Providers\RouteServiceProvider` or `routes/api.php`:

```php
use Tpjasar\ApiFoundation\Route\VersionedRoute;

VersionedRoute::register(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{id}', [UserController::class, 'show']);
});
```

This registers `/api/v1/users`, `/api/v2/users`, `/api/v3/users`, etc. Get the current version in your handler: `request()->route('version')`.

## Response format

Success responses:

```php
use Tpjasar\ApiFoundation\Response\ApiResponse;

return ApiResponse::success($user, 'User found');
// { "data": {...}, "message": "User found" }

return ApiResponse::success($users);
// { "data": [...] }
```

## Error format

```php
return ApiResponse::error('Not found', 404, null, 404);
// { "error": { "code": 404, "message": "Not found" } }

return ApiResponse::error('Validation failed', 422, $validator->errors(), 422);
// { "error": { "code": 422, "message": "Validation failed", "details": {...} } }
```

## Pagination

```php
$users = User::paginate(15);
return ApiResponse::paginated($users);
// { "data": [...], "meta": { "current_page": 1, "per_page": 15, "total": 50, "last_page": 4 } }
```

## Config

Publish with `--tag=api-foundation-config`. You can change the JSON keys (data_key, error_key, etc.) and pagination meta keys. Set `prefix` to `''` if your routes are already under `api`.

## License

MIT

## Author

Muhammad Jasar T P
