<p align="center">
  <img src="../../public/logo.png" alt="NanoPHP Logo" width="200">
</p>

<h1 align="center">NanoPHP Framework Core</h1>

<p align="center">
  <strong>The powerful engine behind NanoPHP applications</strong>
</p>

<p align="center">
  <a href="https://github.com/ermradulsharma/nanophp-framework/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://github.com/ermradulsharma/nanophp-framework"><img src="https://img.shields.io/badge/PHP-8.1%2B-777BB4.svg" alt="PHP Version"></a>
</p>

---

## 📦 About

This is the **core framework package** for NanoPHP. It provides the foundational components that power NanoPHP applications, including:

- **Routing Engine** - Fast route matching with FastRoute
- **Dependency Injection** - Powerful DI container with PHP-DI
- **Middleware Pipeline** - PSR-15 compliant middleware processing
- **View Engine** - Blade template compilation and rendering
- **Authentication System** - Session-based authentication with guards
- **Database Integration** - Eloquent ORM and query builder
- **Validation** - Comprehensive request validation
- **Console Commands** - 50+ built-in Artisan commands
- **Logging** - Monolog-based logging system
- **Facades** - Laravel-style static proxies

---

## 🏗️ Architecture

### Core Components

```
framework/
├── src/
│   ├── Application.php          # Application kernel
│   ├── Router.php               # Route management
│   ├── Facade.php               # Facade base class
│   ├── View.php                 # View rendering
│   ├── Auth.php                 # Authentication
│   ├── Database.php             # Database bootstrapping
│   ├── LogManager.php           # Logging
│   ├── AI.php                   # AI integration
│   ├── Auth/                    # Auth components
│   │   ├── SessionGuard.php
│   │   └── Gate.php
│   ├── Console/                 # Artisan commands
│   │   ├── Commands/
│   │   └── Kernel.php
│   ├── Facades/                 # Static facades
│   │   ├── Route.php
│   │   ├── View.php
│   │   └── Auth.php
│   ├── Middleware/              # Core middleware
│   │   ├── CsrfMiddleware.php
│   │   ├── TrimStrings.php
│   │   └── SecurityHeadersMiddleware.php
│   ├── Http/                    # HTTP components
│   │   └── Request.php
│   ├── Filesystem/              # Storage management
│   ├── Cache/                   # Caching system
│   ├── CoreDefinitions.php      # DI definitions
│   └── helpers.php              # Global helpers
└── composer.json
```

---

## 🔧 Installation

This package is automatically installed when you create a NanoPHP application:

```bash
composer create-project nanophp/nanophp my-project --stability=dev
```

Or add it to an existing project:

```bash
composer require nanophp/framework:dev-main
```

---

## 🎯 Key Features

### 1. Powerful Routing

```php
use Nano\Framework\Facades\Route;

Route::get('/users/{id}', 'UserController@show');
Route::post('/users', 'UserController@store')->middleware('auth');
```

### 2. Dependency Injection

```php
// Automatic constructor injection
class UserController
{
    public function __construct(
        private UserRepository $users,
        private Logger $log
    ) {}
}
```

### 3. Blade Templates

```blade
@extends('layouts.app')

@section('content')
    <h1>{{ $title }}</h1>
    @foreach($users as $user)
        <p>{{ $user->name }}</p>
    @endforeach
@endsection
```

### 4. Eloquent ORM

```php
// Elegant database queries
$users = User::where('active', true)
    ->with('posts')
    ->orderBy('created_at', 'desc')
    ->get();
```

### 5. Authentication

```php
use Nano\Framework\Facades\Auth;

// Login
Auth::attempt($credentials);

// Check authentication
if (Auth::check()) {
    $user = Auth::user();
}

// Logout
Auth::logout();
```

---

## 🛠️ Console Commands

The framework provides 50+ Artisan commands:

### Generators

- `make:controller` - Create a new controller
- `make:model` - Create a new model
- `make:middleware` - Create middleware
- `make:migration` - Create database migration
- `make:seeder` - Create database seeder
- `make:auth` - Scaffold authentication

### Database

- `migrate` - Run migrations
- `migrate:rollback` - Rollback migrations
- `migrate:fresh` - Drop all tables and re-run migrations
- `db:seed` - Seed the database

### Cache & Optimization

- `cache:clear` - Clear application cache
- `view:clear` - Clear compiled views
- `config:cache` - Cache configuration

### Development

- `serve` - Start development server
- `tinker` - Interactive REPL

---

## 🔌 Integration with Illuminate

NanoPHP leverages battle-tested Laravel components:

- **illuminate/database** - Eloquent ORM and Query Builder
- **illuminate/validation** - Request validation
- **illuminate/view** - Blade template engine
- **illuminate/filesystem** - File operations
- **illuminate/translation** - Localization
- **illuminate/events** - Event dispatcher

---

## 📚 Helper Functions

The framework provides Laravel-style global helpers:

```php
// Views
view('welcome', ['name' => 'John']);

// Routing
route('user.profile', ['id' => 1]);

// JSON responses
json(['status' => 'success']);

// Environment
env('APP_ENV', 'production');

// Paths
base_path('config/app.php');
storage_path('logs/app.log');

// String helpers
str_slug('Hello World'); // hello-world
str_random(16);

// Array helpers
array_get($array, 'key.nested', 'default');
```

---

## 🏛️ Design Patterns

NanoPHP implements industry-standard patterns:

- **Dependency Injection** - Loose coupling, testable code
- **Facade Pattern** - Clean, expressive syntax
- **Repository Pattern** - Data access abstraction
- **Middleware Pattern** - Request/response filtering
- **Service Container** - Automatic dependency resolution
- **PSR Standards** - PSR-7, PSR-11, PSR-15 compliant

---

## 🧪 Testing

The framework is designed for testability:

```php
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function test_user_creation()
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $this->assertEquals('John Doe', $user->name);
    }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

---

## 📄 License

The NanoPHP Framework is open-sourced software licensed under the [MIT license](../../LICENSE.md).

---

## 🙏 Acknowledgments

- **[Laravel](https://laravel.com)** - For inspiring our architecture and design philosophy
- **[Illuminate Components](https://github.com/illuminate)** - For providing robust, well-tested components
- **[PHP-DI](https://php-di.org/)** - For powerful dependency injection
- **[FastRoute](https://github.com/nikic/FastRoute)** - For blazing-fast routing
- **[Symfony Console](https://symfony.com/doc/current/components/console.html)** - For the command-line interface

---

<p align="center">Built with ❤️ for the PHP community</p>
