# SecureAPI Laravel Package

A professional, scalable package for Laravel applications providing JWT Authentication, a robust Role & Permission system (RBAC), and standardized API responses.

## Features

- **JWT Integration**: Seamlessly works with `php-open-source-saver/jwt-auth`.
- **RBAC System**: Role and Permission models with custom pivot tables (`role_permission`, `user_role`).
- **Standardized Responses**: Consistent JSON response structure (`status`, `message`, `data`, `errors`).
- **Middleware support**: Protect routes using `role:admin` syntax.
- **Easy Integration**: Package-specific trait for User models and controllers.

---

## Installation

### 1. Require via Composer
If the package is not yet on Packagist, add the following to your main app's `composer.json`:

```json
"repositories": [
    {
        "type": "path",
        "url": "../SecureAPI",
        "options": {
            "symlink": true
        }
    }
]
```

Then run:
```bash
composer require sky337/secure-api
```

### 2. Publish Configuration & Migrations
```bash
php artisan vendor:publish --provider="Sky337\SecureAPI\Providers\SecureAPIServiceProvider"
```

### 3. Run Migrations
```bash
php artisan migrate
```

---

## Configuration

The package configuration is available at `config/secure-api.php`. You can customize the default roles, permissions, and API response keys here.

---

## Usage

### User Model Integration
Add the `HasRoles` trait to your `User` model:

```php
use Sky337\SecureAPI\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

### Roles & Permissions
```php
$user->assignRole('admin');

if ($user->hasRole('admin')) {
    // Logic for admin
}

if ($user->hasAnyRole(['admin', 'editor'])) {
    // Logic for admin or editor
}
```

### Standard API Responses
Use the `ApiResponse` class or `ApiResponseTrait` in your controllers:

```php
use Sky337\SecureAPI\Classes\ApiResponse;

return ApiResponse::success($data, 'User fetched successfully');
return ApiResponse::error('Something went wrong', 400);
return ApiResponse::validationError($validator->errors());
```

**Standard Response Structure:**
```json
{
  "status": true,
  "message": "Success",
  "data": { ... },
  "errors": null
}
```

---

## Middleware usage

Protect your routes using the `role` middleware alias:

```php
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index']);
});

Route::middleware(['role:admin,manager'])->get('/reports', [ReportController::class, 'index']);
```

---

## Example Routes

```php
use Illuminate\Support\Facades\Route;
use Sky337\SecureAPI\Classes\ApiResponse;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::get('/profile', function() {
        return ApiResponse::success(auth()->user());
    });
});
```

---

## Contribution Guide

1. **Fork** the repository.
2. Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
