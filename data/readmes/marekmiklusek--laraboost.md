![logo form my laravel package called_ laraboost(1)](https://github.com/user-attachments/assets/9dec43a5-3c60-4e17-a761-80959bf1cf4b)

<p align="center">
  <a href="https://packagist.org/packages/marekmiklusek/laraboost"><img src="https://img.shields.io/packagist/v/marekmiklusek/laraboost.svg" alt="Latest Stable Version"></a>
  <a href="https://packagist.org/packages/marekmiklusek/laraboost"><img src="https://img.shields.io/packagist/dt/marekmiklusek/laraboost.svg" alt="Downloads"></a>
  <a href="https://github.com/marekmiklusek/laraboost/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

## 🚀 Quick Application Bootstrapping

Tired of adding the same configuration code to every new Laravel project? This package automatically applies best practice configurations and installs essential development tools with a single command.

## ✨ Features

- 🔄 Automatically applies common Laravel configurations
- 🧰 Installs essential dev tools (Debugbar, Larastan, Rector)
- 📝 Creates pre-configured tool settings files
- 🛠️ Provides helpful artisan commands
- ⚡ Optimizes DB access with destructive command protection
- 📅 Configures Carbon for immutable dates
- 🔍 Sets up strict model usage with automatic eager loading
- 🌐 Enforces HTTPS in production
- 🚀 Configures Vite with aggressive prefetching

## 📋 Requirements

- PHP 8.3+
- Laravel 12+

## 📦 Installation

```bash
composer require marekmiklusek/laraboost
```

## 🔧 Usage

### Automatic Configuration

Once installed, the package will automatically apply all configurations:

- DB destructive command protection in production
- Carbon immutable dates
- Strict model usage with automatic eager loading
- HTTPS enforcement in production
- Vite with aggressive prefetching

### Installing Development Tools

Run the following command to install development tools:

```bash
php artisan install:dev-tools
```

This command will install the following packages via Composer:

- Laravel Debugbar
- Larastan (PHPStan for Laravel)
- Rector (PHP refactoring tool)

It will also create the following configuration files in your project root:

- `pint.json` - Laravel Pint configuration
- `phpstan.neon` - Larastan configuration
- `rector.php` - Rector configuration

### Creating Action Classes

Generate new action classes using the provided Artisan command:

```bash
php artisan make:action CreateTodoAction
```

This will create a new action class with the following structure:

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\DB;

final readonly class CreateTodoAction
{
    /**
     * Execute the action.
     */
    public function execute(): void
    {
        DB::transaction(function (): void {
            //
        });
    }
}
```

## 💻 Configuration Details

### Applied Configurations

```php
// Database commands
DB::prohibitDestructiveCommands(app()->isProduction());

// Date handling
Date::use(CarbonImmutable::class);

// Model configurations
Model::automaticallyEagerLoadRelationships();
Model::unguard();
Model::shouldBeStrict();

// URL handling
URL::forceHttps(app()->isProduction());

// Vite configuration
Vite::useAggressivePrefetching();
```

## 🧪 Development Tools

### Laravel Debugbar

A package that adds a debugging bar at the bottom of your pages during development, providing valuable information about queries, views, routes, and more.

### Larastan

A PHPStan wrapper for Laravel that provides static analysis for your Laravel application code.

### Rector

A tool for automated refactoring and upgrades of your PHP code.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
