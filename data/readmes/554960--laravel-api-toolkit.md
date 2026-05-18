# laravel-api-toolkit

Production-ready Laravel API starter kit. Auth, rate limiting, response formatting — all pre-configured.

> Uses [php-open-source-saver/jwt-auth](https://github.com/PHP-Open-Source-Saver/jwt-auth) (actively maintained)

---

## Quick Start

```bash
# Install
composer require sharey1332/laravel-api-toolkit

# Publish JWT config & generate secret
php artisan vendor:publish --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret

# Publish toolkit config
php artisan vendor:publish --tag=api-toolkit-config
```

**Configure `config/auth.php`:**

```php
'defaults' => [
    'guard' => 'api',
    'passwords' => 'users',
],

'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

**Update User model:**

```php
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
```

---

## Features

- 🔐 **JWT Authentication** — Login, register, refresh, logout
- 🚦 **Rate Limiting** — Configurable per-route limits
- 📦 **Consistent Response Format** — Success/error responses standardized
- ✅ **Request Validation** — Form requests with clean error messages
- 🛡️ **Exception Handling** — API-friendly error responses
- 📄 **Pagination Helper** — Cursor & offset pagination support

---

## Usage

### Response Helper

```php
use Sharey1332\ApiToolkit\Facades\ApiResponse;

// Success
return ApiResponse::success($data, 'User created', 201);

// Error
return ApiResponse::error('Validation failed', 422, $errors);

// Paginated
return ApiResponse::paginate($users);
```

**Output:**

```json
{
  "success": true,
  "message": "User created",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Auth Routes (auto-registered)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Rate Limiting

```php
// config/api-toolkit.php
'rate_limit' => [
    'enabled' => true,
    'max_attempts' => 60,
    'decay_minutes' => 1,
]
```

### Custom Validation

```php
use Sharey1332\ApiToolkit\Http\Requests\ApiRequest;

class StoreUserRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ];
    }
}
```

---

## Configuration

```php
// config/api-toolkit.php
return [
    'auth' => [
        'enabled' => true,
        'guard' => 'api',
        'user_model' => \App\Models\User::class,
        'ttl' => 60,
        'refresh_ttl' => 20160,
    ],
    'rate_limit' => [
        'enabled' => true,
        'max_attempts' => 60,
        'decay_minutes' => 1,
    ],
    'response' => [
        'wrap_key' => 'data',
        'include_status_code' => true,
    ],
    'routes' => [
        'enabled' => true,
        'prefix' => 'api/auth',
        'middleware' => ['api'],
    ],
];
```

---

## Requirements

- PHP 8.1+
- Laravel 10.x / 11.x / 12.x

---

## License

MIT

---

<div align="center">
<sub>built by <a href="https://github.com/sharey1332">@sharey1332</a></sub>
</div>
