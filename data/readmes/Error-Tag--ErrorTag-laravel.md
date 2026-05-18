# ErrorTag

[![Latest Version on Packagist](https://img.shields.io/packagist/v/error-tag/errortag-laravel.svg?style=flat-square)](https://packagist.org/packages/error-tag/errortag-laravel)
[![tests](https://github.com/Error-Tag/ErrorTag-laravel/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Error-Tag/ErrorTag-laravel/actions/workflows/run-tests.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/error-tag/errortag-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/error-tag/errortag-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/error-tag/errortag-laravel.svg?style=flat-square)](https://packagist.org/packages/error-tag/errortag-laravel)

**ErrorTag** is an error monitoring and observability platform. This package is the client SDK that captures errors from your Laravel application and sends them to the ErrorTag dashboard for analysis, alerting, and team collaboration.

## Requirements

- **PHP**: 8.1 or higher
- **Laravel**: 10.x, 11.x, or 12.x
- **HTTP Client**: Guzzle (included with Laravel)

## Features

- **Automatic Error Capture** - Hooks into Laravel's exception handler
- **Intelligent Error Grouping** - Groups similar errors using fingerprints
- **Privacy-First** - Sanitizes sensitive data (passwords, tokens, headers)
- **Works Everywhere** - Sync mode (no queue required) or async via queue
- **Rich Context** - Captures request, user, and application data
- **Circuit Breaker** - Prevents infinite loops and server overload
- **Highly Configurable** - Sample rates, ignored exceptions, and more
- **Fully Tested** - Comprehensive test coverage with Pest

## Installation

Install the package via Composer:

```bash
composer require error-tag/errortag-laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="errortag-laravel-config"
```

Add your ErrorTag API key to `.env`:

```env
ERRORTAG_KEY=project_xxxxx
ERRORTAG_ENV=production
```

## Quick Start

Once installed, ErrorTag automatically captures all unhandled exceptions.

**By default, errors are sent synchronously** (no queue worker required). This works perfectly on shared hosting, local development, and production.

Test your setup:

```bash
php artisan errortag:test --send-test-error
```

### Queue Configuration (Optional)

For high-traffic applications, you can enable async sending via queue:

```env
ERRORTAG_USE_QUEUE=true
ERRORTAG_QUEUE_CONNECTION=database
```

**Important:** Only enable queues if you have workers running via cron or supervisor.

**For shared hosting with cron:** Add this to your crontab:
```bash
* * * * * php /path/to/artisan queue:work --stop-when-empty --tries=2 --max-time=50
```

## Usage

### Automatic Capture

```php
// This exception is automatically captured
throw new Exception('Something went wrong!');
```

### Manual Reporting

```php
use ErrorTag\ErrorTag\Facades\ErrorTag;

try {
    processPayment($order);
} catch (Exception $e) {
    ErrorTag::captureException($e);
}
```

### Adding Context

```php
ErrorTag::context([
    'order_id' => $order->id,
    'payment_provider' => 'stripe',
]);
```

## Configuration

### Laravel Version Compatibility

**Laravel 11+ and 12+**
ErrorTag automatically registers via its service provider. You can also manually configure exception reporting in `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    // ErrorTag is auto-registered, but you can customize here if needed
})->create();
```

**Laravel 10 and below**
ErrorTag automatically registers via its service provider using the `reportable()` method. No manual configuration needed. Just install the package and configure your `.env` file.

### Sync vs Async Sending

**Sync Mode (Default - Recommended)**
```env
ERRORTAG_USE_QUEUE=false
ERRORTAG_SYNC_TIMEOUT=2  # Fast timeout to avoid blocking requests
```

- Works immediately after installation
- No queue worker required
- Perfect for shared hosting
- Great for low-medium traffic

**Async Mode (Queue)**
```env
ERRORTAG_USE_QUEUE=true
ERRORTAG_QUEUE_CONNECTION=database
ERRORTAG_TIMEOUT=5
```

- Better for high-traffic apps
- Doesn't block user requests
- Requires queue worker running

### Other Options

```env
# Disable ErrorTag in local environment
ERRORTAG_ENABLED=true

# Sample rate (capture 50% of errors)
ERRORTAG_SAMPLE_RATE=0.5

# Don't capture request body (privacy)
ERRORTAG_CAPTURE_BODY=false

# Circuit breaker (stop after 5 failures)
ERRORTAG_CIRCUIT_BREAKER_THRESHOLD=5
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [William Asaba](https://github.com/Error-Tag)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
