# deixtra/laravel-starter-auth

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Packagist Version](https://img.shields.io/packagist/v/deixtra/laravel-starter-auth.svg)](https://packagist.org/packages/deixtra/laravel-starter-auth)
[![Total Downloads](https://img.shields.io/packagist/dt/deixtra/laravel-starter-auth.svg)](https://packagist.org/packages/deixtra/laravel-starter-auth)
[![PHP Version](https://img.shields.io/badge/PHP-8.3%2B-blue.svg)](https://www.php.net)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)

A production-ready Laravel 13 authentication scaffold with beautiful Tailwind CSS views, full password reset flow, middleware, migrations, controllers, and an interactive installer — set up in seconds.

---

## Features

- 🔐 **Full auth flow** — Login, Register, Logout, Forgot Password, Reset Password
- ⚡ **Interactive installer** — `php artisan auth-starter:install` guides you through every step
- 🎨 **Beautiful Tailwind CSS views** — Deep purple theme, ready to customize
- 🛡️ **Middleware included** — Auto-registered in `bootstrap/app.php`
- 📋 **Migrations included** — `users` & `password_reset_tokens` tables
- 🔑 **Flexible User model** — Use your existing `App\Models\User` or scaffold a new one
- ⚙️ **Custom naming** — Choose your own controller, middleware, routes file & views directory name
- 🌐 **Route prefix support** — Namespace all routes under `/auth/*` or any custom prefix
- ✅ **Zero config required** — Works out of the box with sensible defaults
- 📦 **Laravel 13 ready** — Built with PHP 8.3+ and Laravel 13 conventions

---

## Requirements

| Dependency | Version |
|------------|---------|
| PHP        | ^8.3    |
| Laravel    | ^13.0   |

---

## Installation

```bash
composer require deixtra/laravel-starter-auth
```

The service provider is auto-discovered — no manual registration needed.

---

## Setup

Run the interactive installer:

```bash
php artisan auth-starter:install
```

The installer will ask you:

1. **User model** — Use existing `App\Models\User` or create a new one
2. **Controller name** — Custom name for the auth controller
3. **Middleware name** — Custom name for the middleware
4. **Routes file name** — Custom name for the routes file
5. **Views location** — Where to publish the views
6. **Migrations** — Run migrations now or skip
7. **Route prefix** — Optional prefix e.g. `auth` → `/auth/login`

Use `--force` to overwrite already-published files:

```bash
php artisan auth-starter:install --force
```

---

## Configuration

After installation, edit `config/auth-starter.php`:

```php
return [
    // URL prefix for all auth routes. '' = /login, 'auth' = /auth/login
    'route_prefix' => env('AUTH_STARTER_PREFIX', ''),

    // Redirect here after login/registration
    'home' => '/dashboard',

    // Set false to disable registration entirely
    'registration_enabled' => true,

    // true = App\Models\User, false = package's own User model
    'use_existing_user_model' => true,

    // Published file names (set automatically by installer)
    'controller_name' => 'AuthController',
    'middleware_name'  => 'auth.starter',
    'routes_file'      => 'auth',
    'views_path'       => 'auth-starter',
];
```

Via `.env`:

```env
AUTH_STARTER_PREFIX=auth
```

---

## Routes

All routes are prefixed with `auth-starter.` for named route access.

| Method | URI                       | Name                            | Middleware |
|--------|---------------------------|---------------------------------|------------|
| GET    | `/login`                  | `auth-starter.login`            | guest      |
| POST   | `/login`                  | —                               | guest      |
| GET    | `/register`               | `auth-starter.register`         | guest      |
| POST   | `/register`               | —                               | guest      |
| GET    | `/forgot-password`        | `auth-starter.password.request` | guest      |
| POST   | `/forgot-password`        | `auth-starter.password.email`   | guest      |
| GET    | `/reset-password/{token}` | `auth-starter.password.reset`   | guest      |
| POST   | `/reset-password`         | `auth-starter.password.update`  | guest      |
| GET    | `/dashboard`              | `auth-starter.dashboard`        | auth       |
| POST   | `/logout`                 | `auth-starter.logout`           | auth       |

> Dashboard & logout have **no prefix** — always at `/dashboard` and `/logout`.

Use named routes in Blade:

```blade
<a href="{{ route('auth-starter.login') }}">Login</a>
<a href="{{ route('auth-starter.dashboard') }}">Dashboard</a>
```

---

## Middleware

The package includes `RedirectIfAuthenticated` middleware. The installer auto-injects the alias into `bootstrap/app.php`.

If auto-injection fails, add it manually:

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'auth.starter' => \Deixtra\LaravelStarterAuth\Http\Middleware\RedirectIfAuthenticated::class,
    ]);
})
```

---

## Customizing Views

Publish views to your application:

```bash
php artisan vendor:publish --tag=auth-starter-views
```

Published to `resources/views/vendor/auth-starter/` — edit freely, package uses your copies over defaults.

### View structure

```
resources/views/vendor/auth-starter/
├── layouts/
│   └── app.blade.php
├── auth/
│   ├── login.blade.php
│   ├── register.blade.php
│   ├── forgot-password.blade.php
│   └── reset-password.blade.php
└── dashboard.blade.php
```

---

## Publishing Individual Assets

```bash
# Config only
php artisan vendor:publish --tag=auth-starter-config

# Migrations only
php artisan vendor:publish --tag=auth-starter-migrations

# Views only
php artisan vendor:publish --tag=auth-starter-views

# Controllers only
php artisan vendor:publish --tag=auth-starter-controllers

# Middleware only
php artisan vendor:publish --tag=auth-starter-middleware
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Credits

Built with ❤️ by [Deixtra Private Limited](https://deixtra.com)

| | |
|---|---|
| 🌐 Website | [deixtra.com](https://deixtra.com) |
| 📧 Email | support@deixtra.com |
| 🐙 GitHub | [Deixtra-Private-Limited](https://github.com/Deixtra-Private-Limited/laravel-starter-auth) |
| 📦 Packagist | [deixtra/laravel-starter-auth](https://packagist.org/packages/deixtra/laravel-starter-auth) |