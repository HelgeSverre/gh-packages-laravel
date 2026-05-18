# Laravel Waiting Request

[![Latest Version on Packagist](https://img.shields.io/packagist/v/aihimel/laravel-waiting-request.svg?style=flat-square)](https://packagist.org/packages/aihimel/laravel-waiting-request)
[![Total Downloads](https://img.shields.io/packagist/dt/aihimel/laravel-waiting-request.svg?style=flat-square)](https://packagist.org/packages/aihimel/laravel-waiting-request)
[![Tests](https://github.com/aihimel/laravel-waiting-request/actions/workflows/phpunit.yml/badge.svg)](https://github.com/aihimel/laravel-waiting-request/actions/workflows/phpunit.yml)
[![Check Style](https://github.com/aihimel/laravel-waiting-request/actions/workflows/phpcs.yml/badge.svg)](https://github.com/aihimel/laravel-waiting-request/actions/workflows/phpcs.yml)

A simple implementation for holding requests until a job or background process is finished. This package allows you to conditionally block requests and wait for them to be unblocked within a specified timeout.

## Installation

You can install the package via composer:

```bash
composer require aihimel/laravel-waiting-request
```

## Configuration

You can publish the configuration file using:

```bash
php artisan vendor:publish --tag="waiting-request-config"
```

The published configuration file `config/waiting-request.php` contains the following defaults:

```php
return [
    'cache_prefix' => env('LW_REQUEST_CACHE_PREFIX', 'lw_request_'),
    'timeout' => env('LW_REQUEST_MAX_WAITING_TIME', 5), // Default timeout in seconds
    'check_interval' => env('LW_REQUEST_CHECK_INTERVAL', 250), // Default check interval in milliseconds
];
```

## Usage

### Basic Example

Suppose you have a resource that is being processed in the background (e.g., a large PDF generation or a data sync). You can block requests for this resource until the process is complete.

#### 1. Add a Blocker
In your controller or job where the background process starts:

```php
use Aihimel\LaravelWaitingRequest\Facades\LWRequest;

LWRequest::addBlocker(User::class, $user->id);
```

#### 2. Wait for Resolution
In the request that needs to wait for the resource:

```php
use Aihimel\LaravelWaitingRequest\Facades\LWRequest;

// This will wait until the blocker is removed or the timeout is reached
$resolved = LWRequest::whenResolved(User::class, $user->id);

if ($resolved) {
    // Process the request
} else {
    // Handle timeout
}
```

#### 3. Resolve the Blocker
When the background process is finished:

```php
use Aihimel\LaravelWaitingRequest\Facades\LWRequest;

LWRequest::resolveBlocker(User::class, $user->id);
```

### Checking if Blocked

You can also check if a resource is currently blocked without waiting:

```php
if (LWRequest::isBlocked(User::class, $user->id)) {
    // Resource is blocked
}
```

## Features & Bug Fixes

If you find any bugs or have a feature request, please [create an issue](https://github.com/aihimel/laravel-waiting-request/issues) on GitHub.

## Contributing

We welcome contributions! To become a contributor:

1. **Fork** the repository.
2. **Clone** your fork to your local machine.
3. **Create a branch** for your feature or bug fix.
4. **Commit** your changes with descriptive messages.
5. **Push** your branch to your fork.
6. **Submit a Pull Request** to the main repository.

### Local Development

This package comes with a Docker-based development environment.

#### Build container
```bash
docker compose --build
```

#### Run automated tests
```bash
docker exec laravel_waiting_request_app ./vendor/phpunit/phpunit/phpunit
```

#### Run PHPCS code inspection
```bash
docker exec laravel_waiting_request_app ./vendor/bin/phpcs
```

#### Run PHPCBF auto-fixer
```bash
docker exec laravel_waiting_request_app ./vendor/bin/phpcbf
```

## License

The GPL-3.0-or-later License. Please see [License File](LICENSE) for more information.
