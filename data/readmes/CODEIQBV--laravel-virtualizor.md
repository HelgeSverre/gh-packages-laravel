# Laravel Virtualizor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codeiqbv/laravel-virtualizor.svg?style=flat-square)](https://packagist.org/packages/codeiqbv/laravel-virtualizor)
[![Total Downloads](https://img.shields.io/packagist/dt/codeiqbv/laravel-virtualizor.svg?style=flat-square)](https://packagist.org/packages/codeiqbv/laravel-virtualizor)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

A Laravel package that provides a clean and elegant way to interact with the Virtualizor API. This package offers a fluent interface for both Admin and Enduser APIs, making it easy to manage your Virtualizor infrastructure from your Laravel application.

## Features

- 🚀 Full support for both Admin and Enduser APIs
- 💪 Fluent interface with proper type hinting
- 🛡️ Comprehensive error handling
- 📝 Extensive documentation
- ⚡ Laravel integration with config file and facade
- 🧪 Well tested

## Requirements

- PHP 8.0 or higher
- Laravel 10.0 or higher

## Installation

You can install the package via composer:

```bash
composer require codeiqbv/laravel-virtualizor
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag="virtualizor-config"
```

Add your credentials to `.env`:

```env
VIRTUALIZOR_ADMIN_KEY=your_admin_key
VIRTUALIZOR_ADMIN_PASS=your_admin_pass
VIRTUALIZOR_ADMIN_IP=your_admin_ip
VIRTUALIZOR_ADMIN_PORT=4085

VIRTUALIZOR_ENDUSER_KEY=your_enduser_key
VIRTUALIZOR_ENDUSER_PASS=your_enduser_pass
VIRTUALIZOR_ENDUSER_IP=your_enduser_ip
VIRTUALIZOR_ENDUSER_PORT=4083

VIRTUALIZOR_DEBUG=false
```

## Usage

### Admin API
Check our wiki to find out how you do certain calls. It is easy. You can also check the Virtualizor API docs, we covered almost every endpoint and are still working on adding more. In the WIKI directory we try to add documentation as best as we can.


## Error Handling

The package throws `VirtualizorApiException` for API errors:

```php
use CODEIQ\Virtualizor\Exceptions\VirtualizorApiException;

try {
    $users = VirtualizorAdmin::users()->list();
} catch (VirtualizorApiException $e) {
    $message = $e->getMessage();
    $context = $e->getContext(); // Available when debug is enabled
}
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
