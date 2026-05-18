# Laravel OpenObserve

[![Tests](https://github.com/overworks/laravel-openobserve/actions/workflows/tests.yml/badge.svg?branch=0.x)](https://github.com/overworks/laravel-openobserve/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/minhyung/laravel-openobserve.svg?style=flat-square)](https://packagist.org/packages/minhyung/laravel-openobserve)
[![Total Downloads](https://img.shields.io/packagist/dt/minhyung/laravel-openobserve.svg?style=flat-square)](https://packagist.org/packages/minhyung/laravel-openobserve)

A Laravel package for integrating with [OpenObserve](https://openobserve.ai). Send your logs to OpenObserve for centralized log management and monitoring.

**[한국어 문서](README.ko.md)**

## Features

- Seamless integration with Laravel's logging system
- Efficient log transmission via batch processing
- Configurable additional fields on all log entries
- Direct API access through Facade
- Automatic exception information capture (class, message, code, file, line, trace)
- Artisan command for connection testing

## Requirements

- PHP 8.3+
- Laravel 11.x or 12.x

## Installation

Install the package via Composer:

```bash
composer require minhyung/laravel-openobserve
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=openobserve-config
```

## Configuration

Add OpenObserve connection details to your `.env` file:

```env
OPENOBSERVE_ENABLED=true
OPENOBSERVE_URL=http://localhost:5080
OPENOBSERVE_ORGANIZATION=default
OPENOBSERVE_STREAM=laravel-logs
OPENOBSERVE_EMAIL=your-email@example.com
OPENOBSERVE_PASSWORD=your-password
```

### All Configuration Options

| Option | Env Variable | Default |
|--------|-------------|---------|
| `enabled` | `OPENOBSERVE_ENABLED` | `false` |
| `url` | `OPENOBSERVE_URL` | `http://localhost:5080` |
| `organization` | `OPENOBSERVE_ORGANIZATION` | `default` |
| `stream` | `OPENOBSERVE_STREAM` | `default` |
| `auth.email` | `OPENOBSERVE_EMAIL` | - |
| `auth.password` | `OPENOBSERVE_PASSWORD` | - |
| `batch_size` | `OPENOBSERVE_BATCH_SIZE` | `100` |
| `timeout` | `OPENOBSERVE_TIMEOUT` | `5` |
| `ssl_verify` | `OPENOBSERVE_SSL_VERIFY` | `true` |
| `additional_fields` | `APP_ENV`, `APP_NAME` | `['environment', 'application']` |

### Laravel Logging Channel Setup

Add the OpenObserve channel to your `config/logging.php`:

```php
'channels' => [
    // ... existing channels

    'openobserve' => [
        'driver' => 'custom',
        'via' => \Minhyung\LaravelOpenObserve\Logging\OpenObserveLogger::class,
        'level' => env('LOG_LEVEL', 'debug'),
        'name' => 'openobserve',
    ],

    // Optionally add openobserve to a stack channel
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'openobserve'],
        'ignore_exceptions' => false,
    ],
],
```

Set the default log channel in your `.env` file:

```env
LOG_CHANNEL=stack  # or 'openobserve'
```

## Usage

### Laravel Logging

Use it just like standard Laravel logging:

```php
use Illuminate\Support\Facades\Log;

Log::info('User logged in', ['user_id' => 123]);
Log::error('An error occurred', ['error' => $exception->getMessage()]);
Log::warning('Warning message');
Log::debug('Debug information', ['data' => $debugData]);
```

### Direct Usage via Facade

Access the OpenObserve client directly through the Facade:

```php
use Minhyung\LaravelOpenObserve\Facades\OpenObserve;

// Send a single log entry
OpenObserve::send([
    'level' => 'info',
    'message' => 'User action',
    'user_id' => 123,
    'action' => 'purchase',
]);

// Add to batch (automatically sent when batch size is reached)
OpenObserve::addToBatch([
    'level' => 'info',
    'message' => 'Event occurred',
]);

// Manually flush the batch
OpenObserve::flush();
```

### Dependency Injection

```php
use Minhyung\LaravelOpenObserve\OpenObserveClient;

class SomeController extends Controller
{
    public function __construct(
        private OpenObserveClient $openObserve
    ) {}

    public function index()
    {
        $this->openObserve->send([
            'level' => 'info',
            'message' => 'Controller executed',
            'controller' => self::class,
        ]);
    }
}
```

### Connection Test

Test the connection to OpenObserve using the Artisan command:

```bash
php artisan openobserve:test
```

This will display your configuration and send a test log entry to verify connectivity.

## Testing

```bash
composer test
```

## Security Vulnerabilities

If you discover a security vulnerability, please email urlinee@gmail.com.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Credits

- [Minhyung Park](https://github.com/overworks)
- [All Contributors](../../contributors)
