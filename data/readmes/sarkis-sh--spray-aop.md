# Spray AOP
[![Latest Version](https://img.shields.io/packagist/v/sarkis-sh/spray-aop.svg)](https://packagist.org/packages/sarkis-sh/spray-aop)
[![Laravel](https://img.shields.io/badge/Laravel-10/11/12/13-FF2D20.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-%5E8.2-777BB4.svg)](https://www.php.net/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A lightweight, high-performance Aspect-Oriented Programming (AOP) package for Laravel, built specifically for PHP 8.2+ Attributes.

Spray AOP enables you to apply cross-cutting concerns to your application classes using native PHP Attributes and dynamically generated proxy classes. It hooks into the Laravel Service Container to automatically resolve proxied versions of your classes whenever aspects are detected, ensuring clean separation of logic with zero manual boilerplate.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Publish Configuration](#publish-configuration)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Create an Aspect and Attribute](#create-an-aspect-and-attribute)
  - [Example Aspect Attribute](#example-aspect-attribute)
  - [Example Aspect Handler](#example-aspect-handler)
  - [Full Examples of Generated Aspects](#full-examples-of-generated-aspects)
  - [Apply the Attribute](#apply-the-attribute)
  - [How It Works](#how-it-works)
- [Artisan Commands](#artisan-commands)
- [Production](#production)
- [Notes](#notes)
- [License](#license)

## Features

- Modern AOP: Leverages native PHP 8.2+ Attributes for declarative interception.
- Smart Proxy Engine: Automatic proxy generation with full method signature compatibility.
- Production-Ready: High-performance proxy caching to eliminate runtime I/O overhead.
- Seamless Integration: Automatically swaps target classes within the Laravel Service Container.
- Lifecycle Hooks: Simplified logic through Spray\Aop\Aspects\BaseAspect (Around, Before, After, and Exception hooks).
- Developer Experience: Powerful Artisan commands for proxy management (cache, clear, rebuild).
- Rapid Scaffolding: Built-in generator to create Aspects and Attributes in seconds (spray:make-aspect).

## Requirements

- PHP 8.2 or higher
- Laravel 10.0 or higher (compatible with 11.0, 12.0, 13.0)
- Composer for dependency management

## Installation

```bash
composer require sarkis-sh/spray-aop
```

Laravel will auto-discover the provider via `Spray\Aop\Providers\AopServiceProvider`.

## Publish Configuration

```bash
php artisan vendor:publish --tag=spray-aop-config
```

This publishes the configuration file to `config/spray-aop.php`.

## Configuration

The published config supports:

- `enabled` - Enable or disable the AOP engine entirely
- `storage_path` - Relative storage path for generated proxy classes
- `scan_paths` - Directories scanned for classes with AOP attributes
- `auto_generate` - Allow on-the-fly proxy generation when a proxy is missing

Default config values:

```php
return [
    'enabled' => env('SPRAY_AOP_ENABLED', true),
    'storage_path' => 'framework/aop/proxies',
    'scan_paths' => [
        app_path(),
    ],
    'auto_generate' => env('SPRAY_AOP_AUTO_GEN', true),
];
```

## Usage

### Create an Aspect and Attribute

You can create both using the built-in generator:

```bash
php artisan spray:make-aspect AuditLog
```

The generated files include:

- an Aspect handler class under `app/Aspects`
- a matching Attribute class under `app/Attributes`

#### Command Options

Customize your Aspect and Attribute generation with the following options:

| Option | Short | Description |
|--------|-------|-------------|
| `--before` | `-b` | Include the `before()` hook in the generated Aspect |
| `--after` | `-a` | Include the `after()` hook in the generated Aspect |
| `--around` | `-x` | Include the `handle()` (around) method for full control over method execution |
| `--exception` | `-e` | Include the `onException()` hook for exception handling logic |
| `--class` | `-c` | Allow the Attribute to target classes |
| `--method` | `-m` | Allow the Attribute to target methods |
| `--repeatable` | `-r` | Make the Attribute repeatable (allows multiple instances on the same target) |
| `--force` | - | Force creation even if the Aspect or Attribute already exists |

#### Examples

Generate with before and after hooks on methods:
```bash
php artisan spray:make-aspect Logging -b -a -m
```

Generate with exception handling on classes:
```bash
php artisan spray:make-aspect ErrorTracker -e -c
```

Generate a full-featured repeatable Aspect:
```bash
php artisan spray:make-aspect PerformanceMonitor -b -a -x -e -r
```

### Example Aspect Attribute

```php
namespace App\Attributes;

use Spray\Aop\Attributes\AspectAttribute;

#[\Attribute(\Attribute::TARGET_CLASS | \Attribute::TARGET_METHOD | \Attribute::IS_REPEATABLE)]
class AuditLog extends AspectAttribute
{
    public function __construct(string $action)
    {
        parent::__construct(\App\Aspects\AuditLogAspect::class, ['action' => $action]);
    }
}
```

### Example Aspect Handler

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;

class AuditLogAspect extends BaseAspect
{
    protected function before(array $invocation): void
    {
        logger()->info('Audit start', [
            'method' => $invocation['method'],
            'args' => $invocation['args'],
            'options' => $invocation['options'],
        ]);
    }

    protected function after(array $invocation, mixed $result): mixed
    {
        logger()->info('Audit completed', ['result' => $result]);
        return $result;
    }
}
```

The `$invocation` array contains the following keys:

- `'instance'`: The object instance being intercepted (the proxied class instance).
- `'method'`: The name of the method being called (e.g., `'create'`).
- `'args'`: An array of arguments passed to the method.
- `'options'`: The configuration options defined in the attribute (e.g., `['action' => 'user.created']`).

### Full Examples of Generated Aspects

Here are complete examples of aspects generated with different options using `php artisan spray:make-aspect`. Each example shows the Aspect class and its corresponding Attribute.

#### Before Hook Only (`--before`)

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;

class LoggingAspect extends BaseAspect
{
    protected function before(array $invocation): void
    {
        logger()->info('Method called', [
            'class' => get_class($invocation['instance']),
            'method' => $invocation['method'],
            'args' => $invocation['args'],
        ]);
    }
}
```

Corresponding Attribute:

```php
namespace App\Attributes;

use Spray\Aop\Attributes\AspectAttribute;

#[\Attribute(\Attribute::TARGET_METHOD)]
class Logging extends AspectAttribute
{
    public function __construct()
    {
        parent::__construct(\App\Aspects\LoggingAspect::class, []);
    }
}
```

#### After Hook Only (`--after`)

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;

class CachingAspect extends BaseAspect
{
    protected function after(array $invocation, mixed $result): mixed
    {
        // Cache the result
        cache()->put($invocation['method'], $result, 3600);
        return $result;
    }
}
```

#### Exception Hook Only (`--exception`)

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;
use Throwable;

class ErrorTrackingAspect extends BaseAspect
{
    protected function onException(array $invocation, Throwable $e): mixed
    {
        // Log the error
        logger()->error('Exception in method', [
            'method' => $invocation['method'],
            'exception' => $e->getMessage(),
        ]);
        throw $e; // Re-throw the exception
    }
}
```

#### Around Hook (`--around`)

For full control, use the `handle` method (around advice):

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;
use Closure;

class PerformanceAspect extends BaseAspect
{
    public function handle(array $invocation, Closure $next): mixed
    {
        $start = microtime(true);
        
        try {
            $result = $next($invocation); // Execute the original method
            
            $duration = microtime(true) - $start;
            logger()->info('Method performance', [
                'method' => $invocation['method'],
                'duration' => $duration,
            ]);
            
            return $result;
        } catch (Throwable $e) {
            $duration = microtime(true) - $start;
            logger()->error('Method failed', [
                'method' => $invocation['method'],
                'duration' => $duration,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
```

#### Combined Hooks (`--before --after --exception`)

```php
namespace App\Aspects;

use Spray\Aop\Aspects\BaseAspect;
use Throwable;

class AuditAspect extends BaseAspect
{
    protected function before(array $invocation): void
    {
        logger()->info('Audit: Method starting', [
            'method' => $invocation['method'],
            'args' => $invocation['args'],
        ]);
    }

    protected function after(array $invocation, mixed $result): mixed
    {
        logger()->info('Audit: Method completed', [
            'method' => $invocation['method'],
            'result' => $result,
        ]);
        return $result;
    }

    protected function onException(array $invocation, Throwable $e): mixed
    {
        logger()->error('Audit: Method failed', [
            'method' => $invocation['method'],
            'error' => $e->getMessage(),
        ]);
        throw $e;
    }
}
```

### Apply the Attribute

```php
use App\Attributes\AuditLog;

#[AuditLog('user.created')]
class UserService
{
    public function create(array $data)
    {
        // business logic
    }
}
```

### How It Works

- Laravel resolves a service from the container
- Spray AOP inspects the class for `AspectAttribute` usage
- If aspects exist, it generates or loads a proxy class
- Proxied methods execute through the `Spray\Aop\Engines\Pipeline`
- Each aspect is executed in order, with support for `before`, `after`, and exception handling
- Proxies are generated once and cached as plain PHP files, ensuring near-native execution speed

## Artisan Commands

- `php artisan spray:aop-cache` - Pre-generate all proxy classes for production
- `php artisan spray:aop-clear` - Remove all generated proxy classes
- `php artisan spray:aop-rebuild` - Clear and regenerate proxies immediately
- `php artisan spray:make-aspect` - Generate a new Aspect handler and Attribute

## Production

For production deployments, disable runtime generation and cache proxies ahead of time:

```env
SPRAY_AOP_AUTO_GEN=false
```

Then run:

```bash
php artisan spray:aop-cache
```

## Notes

- Spray AOP only intercepts public, non-static, non-final, non-constructor methods.
- It ignores Laravel internals and proxy classes to avoid bootstrap recursion.
- The package uses `storage/framework/aop/proxies` by default for generated PHP files.
- If you change the `storage_path` in the configuration, ensure the new directory is writable by the web server.

## License

MIT — see [LICENSE](LICENSE)

