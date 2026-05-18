# Laravel Server Info

[![CI](https://github.com/aporat/laravel-server-info/actions/workflows/ci.yml/badge.svg)](https://github.com/aporat/laravel-server-info/actions/workflows/ci.yml)
[![Latest Stable Version](https://poser.pugx.org/aporat/laravel-server-info/v/stable)](https://packagist.org/packages/aporat/laravel-server-info)
[![License](https://poser.pugx.org/aporat/laravel-server-info/license)](https://packagist.org/packages/aporat/laravel-server-info)

A Laravel package for reporting server and environment information such as PHP version, Laravel version, loaded extensions, and more. Perfect for debugging, monitoring, and diagnostics in Laravel applications.

## Features

- Display PHP version, SAPI, OS, and loaded extensions
- Display Laravel version, environment, debug mode, and configuration
- Extensible module system for custom information gathering
- Artisan command for easy access to server information
- Filter output by specific modules
- Support for custom modules via configuration

## Requirements

- PHP 8.4 or 8.5
- Laravel 12.x or 13.x

## Installation

Install the package via Composer:

```bash
composer require aporat/laravel-server-info
```

The package will automatically register its service provider.

### Publish Configuration (Optional)

If you want to customize the registered modules, publish the configuration file:

```bash
php artisan vendor:publish --provider="Aporat\ServerInfo\ServerInfoServiceProvider" --tag="config"
```

This will create a `config/server-info.php` file where you can configure which modules to load.

## Usage

### Display All Server Information

Run the Artisan command to display all server information:

```bash
php artisan server:info
```

**Example output:**
```
php.version: 8.4.0
php.sapi: cli
php.os: Linux
php.extensions: ["Core","date","libxml","openssl","pcre",...]
laravel.version: 12.0.0
laravel.env: local
laravel.debug: true
laravel.name: Laravel
laravel.timezone: UTC
```

### Filter by Module

You can filter the output to show information from a specific module:

```bash
php artisan server:info php
```

**Output:**
```
php.version: 8.4.0
php.sapi: cli
php.os: Linux
php.extensions: ["Core","date","libxml","openssl","pcre",...]
```

Or filter to show only Laravel information:

```bash
php artisan server:info laravel
```

**Output:**
```
laravel.version: 12.0.0
laravel.env: local
laravel.debug: true
laravel.name: Laravel
laravel.timezone: UTC
```

### Use in Code

You can also access the registry programmatically:

```php
use Aporat\ServerInfo\ModuleRegistry;

$registry = app(ModuleRegistry::class);
$allInfo = $registry->all();

// Returns an array like:
// [
//     'php.version' => '8.4.0',
//     'php.sapi' => 'cli',
//     'laravel.version' => '12.0.0',
//     ...
// ]
```

## Configuration

After publishing the configuration file, you can customize which modules are loaded in `config/server-info.php`:

```php
<?php

return [
    'modules' => [
        Aporat\ServerInfo\Modules\PhpModule::class,
        Aporat\ServerInfo\Modules\LaravelModule::class,

        // Add your custom modules here
        // App\ServerInfo\CustomModule::class,
    ],
];
```

## Built-in Modules

### PhpModule

Provides PHP runtime information:
- `php.version` - PHP version string
- `php.sapi` - Server API (cli, fpm, apache, etc.)
- `php.os` - Operating system
- `php.extensions` - Array of loaded PHP extensions

### LaravelModule

Provides Laravel application information:
- `laravel.version` - Laravel framework version
- `laravel.env` - Application environment (local, production, etc.)
- `laravel.debug` - Debug mode status
- `laravel.name` - Application name from config
- `laravel.timezone` - Application timezone

## Creating Custom Modules

You can create your own modules to report custom information. Here's how:

### 1. Create a Module Class

```php
<?php

namespace App\ServerInfo;

use Aporat\ServerInfo\Contracts\ModuleInterface;

class DatabaseModule implements ModuleInterface
{
    public function name(): string
    {
        return 'database';
    }

    public function info(): mixed
    {
        return [
            'driver' => config('database.default'),
            'connection' => DB::connection()->getName(),
            'version' => DB::select('SELECT VERSION() as version')[0]->version ?? 'unknown',
        ];
    }
}
```

### 2. Register Your Module

Add your module to `config/server-info.php`:

```php
'modules' => [
    Aporat\ServerInfo\Modules\PhpModule::class,
    Aporat\ServerInfo\Modules\LaravelModule::class,
    App\ServerInfo\DatabaseModule::class,
],
```

### 3. Use Your Module

```bash
php artisan server:info database
```

**Output:**
```
database.driver: mysql
database.connection: mysql
database.version: 8.0.32
```

### Module Interface

All modules must implement `Aporat\ServerInfo\Contracts\ModuleInterface`:

```php
interface ModuleInterface
{
    /**
     * Returns a unique name for this module.
     */
    public function name(): string;

    /**
     * Returns diagnostic info for this module.
     * Can be a scalar or associative array.
     */
    public function info(): mixed;
}
```

**Notes:**
- If `info()` returns an array, each key becomes `{module}.{key}`
- If `info()` returns a scalar, it becomes `{module}` directly
- Module names should be unique to avoid conflicts

## Testing

Run the test suite:

```bash
composer test
```

Run code style checks:

```bash
composer check
```

Run static analysis:

```bash
composer analyze
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Install dependencies: `composer install`
3. Run tests: `composer test`
4. Check code style: `composer check`

## Security

If you discover any security-related issues, please email aporat28@gmail.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Credits

- [Adar Porat](https://github.com/aporat)
- [All Contributors](https://github.com/aporat/laravel-server-info/contributors)

## Support

- [GitHub Issues](https://github.com/aporat/laravel-server-info/issues)
- [GitHub Repository](https://github.com/aporat/laravel-server-info)
