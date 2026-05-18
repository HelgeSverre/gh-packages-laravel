# Laravel API Helpers

[![Tests](https://github.com/mahmoud-almalah/laravel-api-helpers/actions/workflows/test.yml/badge.svg)](https://github.com/mahmoud-almalah/laravel-api-helpers/actions)
[![Packagist](https://img.shields.io/packagist/v/mahmoud-almalah/laravel-api-helpers)](https://packagist.org/packages/mahmoud-almalah/laravel-api-helpers)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A clean and elegant Laravel package that provides a consistent and customizable structure for your API development. It includes standardized responses, strict Data Transfer Objects (DTOs), API query filtering, and exception handling.

---

## ✨ Features

- ✅ **Consistent JSON Responses** for success, errors, collections, and resources.
- ✅ **Data Transfer Objects (DTO)** for type-safe request handling and validation.
- ✅ **API Query Filtering** to easily filter and sort Eloquent models.
- ✅ **Standardized Exception Handling** via `ApiExceptionHandler` class.
- ✅ **Laravel 11+** Support.
- ✅ Full test coverage with [Pest](https://pestphp.com).

---

## 📦 Installation

```bash
composer require mahmoud-almalah/laravel-api-helpers
```

---

## ⚙️ Configuration

You can publish the configuration file to customize the internal settings:

```bash
php artisan vendor:publish --tag=api-helpers-config
```

This will publish `config/api-helpers.php`.

---

## 🚀 Usage

### 1️⃣ Standardized Responses

Use the `ApiResponse` class to return consistent JSON responses.

#### Success Response
```php
use MahmoudAlmalah\LaravelApiHelpers\Responses\ApiResponse;

public function index()
{
    return ApiResponse::success(
        data: ['foo' => 'bar'],
        message: 'Operation successful'
    );
}
```

#### Error Response
```php
use MahmoudAlmalah\LaravelApiHelpers\Responses\ApiResponse;
use Symfony\Component\HttpFoundation\Response;

public function error()
{
    return ApiResponse::error(
        message: 'Something went wrong',
        status: Response::HTTP_BAD_REQUEST
    );
}
```

#### Resource/Model Response
Wraps your Eloquent model or JsonResource.

```php
use MahmoudAlmalah\LaravelApiHelpers\Responses\ApiResponse;
use App\Http\Resources\UserResource;

public function show(User $user)
{
    return ApiResponse::model(
        key: 'user',
        resource: new UserResource($user),
        message: 'User retrieved successfully'
    );
}
```

#### Collection Response
Handles pagination metadata automatically.

```php
use MahmoudAlmalah\LaravelApiHelpers\Responses\ApiResponse;
use App\Http\Resources\UserResource;

public function index()
{
    $users = User::paginate(10);
    
    return ApiResponse::collection(
        key: 'users',
        resource: UserResource::collection($users),
        message: 'Users list'
    );
}
```

---

### 2️⃣ Data Transfer Objects (DTO)

Replace basic arrays or `FormRequest` validation with strict DTOs.

**Define your DTO:**
```php
namespace App\DTOs;

use MahmoudAlmalah\LaravelApiHelpers\DTO\DataTransferObject;

class CreateUserDTO extends DataTransferObject
{
    public string $name;
    public string $email;
    public ?string $role = 'user';
    
    /**
     * Define validation rules.
     */
    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['nullable', 'string', 'in:admin,user'],
        ];
    }
}
```

**Use in Controller:**
```php
public function store(Request $request)
{
    // Validates request and maps to DTO
    $dto = CreateUserDTO::fromRequest($request);
    
    // Use strictly typed properties
    User::create($dto->toArray());
    
    return ApiResponse::success(message: 'User created');
}
```

---

### 3️⃣ API Query Filtering & Sorting

Allow clients to filter and sort results easily via query parameters.

**In your Model:**
```php
use MahmoudAlmalah\LaravelApiHelpers\Concerns\HasApiFilters;

class User extends Model
{
    use HasApiFilters;
    
    // Allow filtering by these columns
    protected array $filterable = ['status', 'role', 'type'];
    
    // Allow sorting by these columns
    protected array $sortable = ['created_at', 'name'];
    
    // Define custom filter logic (optional)
    public function scopeActive(Builder $query, $value): void
    {
        if ($value) {
            $query->where('active', true);
        }
    }
}
```

**In Controller:**
```php
// GET /users?filter[status]=active&filter[active]=1&sort=-created_at
public function index(Request $request)
{
    $users = User::filter($request->query('filter'))
                 ->sort($request->query('sort'))
                 ->paginate();
                 
    return ApiResponse::collection('users', UserResource::collection($users));
}
```

---

### 4️⃣ Standardized Exception Handling

Catch exceptions and return consistent JSON error responses, including detailed debug info in local development.

**Setup in `bootstrap/app.php` (Laravel 11+):**

```php
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use MahmoudAlmalah\LaravelApiHelpers\Exceptions\ApiExceptionHandler;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiExceptionHandler::render($e);
            }
        });
    })->create();
```

**Debug Info (Local Environment):**
When `APP_ENV=local`, exceptions will include debug details:

```json
{
    "success": false,
    "message": "Call to undefined method App\\Models\\User::unknown()",
    "status": 500,
    "debug": {
        "exception": {
            "class": "BadMethodCallException",
            "file": "/var/www/html/app/Http/Controllers/UserController.php",
            "line": 45,
            "trace": [...]
        },
        "request": {
            "method": "GET",
            "url": "http://localhost/api/users",
            "input": []
        },
        "time": "2023-10-25T14:30:00+00:00"
    }
}
```

In **Production**, it safely returns:
```json
{
    "success": false,
    "message": "Server Error",
    "status": 500
}
```

---

## ✅ Output Format

Success Response:
```json
{
  "success": true,
  "message": "Users list",
  "data": {
    "users": [...]
  },
  "meta": {
    "current_page": 1,
    "total": 50
  }
}
```

Error Response:
```json
{
  "success": false,
  "message": "Resource not found",
  "status": 404
}
```

---

## 🧪 Testing

Run the test suite:

```bash
composer test
```

## 📄 License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.
