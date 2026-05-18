# Laravel Modules

[![Latest Stable Version](https://img.shields.io/packagist/v/sinemacula/laravel-modules.svg)](https://packagist.org/packages/sinemacula/laravel-modules)
[![Build Status](https://github.com/sinemacula/laravel-modules/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/sinemacula/laravel-modules/actions/workflows/tests.yml)
[![Maintainability](https://qlty.sh/gh/sinemacula/projects/laravel-modules/maintainability.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-modules)
[![Code Coverage](https://qlty.sh/gh/sinemacula/projects/laravel-modules/coverage.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-modules)
[![Total Downloads](https://img.shields.io/packagist/dt/sinemacula/laravel-modules.svg)](https://packagist.org/packages/sinemacula/laravel-modules)

A lightweight, convention-driven modular architecture package for Laravel. Replaces the standard `app/` directory with a
`modules/` directory where each subdirectory is a self-contained module following standard Laravel conventions.

Modules are auto-discovered at boot time and cached for performance. All standard Laravel conventions work inside each
module — there is no new API to learn.

## How It Works

Each subdirectory under `modules/` is a self-contained module with its own models, controllers, routes, commands,
listeners, events, observers, policies, and more:

```text
modules/
├── Foundation/              # Core framework module
│   ├── Console/             # Commands and schedule
│   └── Providers/           # Service providers
└── Billing/                 # Example domain module
    ├── Events/
    ├── Http/
    │   ├── Controllers/
    │   ├── Requests/
    │   ├── Resources/
    │   └── routes.php
    ├── Listeners/
    ├── Models/
    ├── Observers/
    └── Policies/
```

### What Gets Discovered

| Convention        | Module Path            | How It's Loaded                       |
|-------------------|------------------------|---------------------------------------|
| Routes            | `Http/routes.php`      | Passed to `withRouting(api: ...)`     |
| Console commands  | `Console/Commands/`    | Glob-based via `withCommands()`       |
| Scheduled tasks   | `Console/schedule.php` | Glob-based via `withCommands()`       |
| Event listeners   | `Listeners/`           | Glob-based via `withEvents()`         |
| Views             | `Resources/views/`     | Registered in `ModuleServiceProvider` |
| Translations      | `Resources/lang/`      | Registered in `ModuleServiceProvider` |
| Service providers | `Providers/`           | Loaded via `withProviders()`          |

Everything else — controllers, requests, resources, events, observers, policies, models, jobs, mail, notifications —
works via PSR-4 autoloading. No registration required.

### Artisan Commands

| Command              | Description                                                  |
|----------------------|--------------------------------------------------------------|
| `module:make {name}` | Scaffold a new module with the standard directory structure  |
| `module:list`        | List all discovered modules and their paths                  |
| `module:cache`       | Cache discovered module paths for faster resolution          |
| `module:clear`       | Clear the cached module paths                                |

`module:make Billing` creates:

```text
modules/Billing/
├── Console/Commands/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── routes.php
├── Listeners/
└── Models/
```

### Module Caching

Module paths are cached to `bootstrap/cache/modules.php` and integrated into Laravel's `optimize` / `optimize:clear`
lifecycle:

```bash
php artisan optimize        # Includes module:cache
php artisan optimize:clear  # Includes module:clear
```

## Installation

```bash
composer require sinemacula/laravel-modules
```

### 1. Edit `bootstrap/app.php`

Replace the default Laravel application with the modular variant:

```php
<?php

use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use SineMacula\Laravel\Modules\Application;
use SineMacula\Laravel\Modules\Configuration\Modules;

Modules::setBasePath(dirname(__DIR__));

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api      : Modules::routePaths(),
        health   : '/health',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {})
    ->withExceptions(function (Exceptions $exceptions): void {})
    ->create();
```

### 2. Update your autoload mapping

In your application's `composer.json`, point the PSR-4 autoload at the `modules/` directory:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "modules/"
        }
    }
}
```

Then run `composer dump-autoload`.

### 3. Create the `modules/` directory

Create a `modules/` directory at your project root and add your first module:

```bash
mkdir -p modules/Foundation/Providers
```

### 4. Wire up routing

Each module defines its own routes in `Http/routes.php`. These are automatically discovered and passed to
`withRouting()` as shown in the `bootstrap/app.php` example above.

## Requirements

- PHP ^8.3
- Laravel ^13.0

## Testing

```bash
composer test
composer test-coverage
composer check
```

## Contributing

Contributions are welcome via GitHub pull requests.

## Security

If you discover a security issue, please contact Sine Macula directly rather than opening a public issue.

## License

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
