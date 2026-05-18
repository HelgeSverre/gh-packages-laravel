# Laravel HMAC Authentication

[![Tests](https://github.com/rickeysxhemz/hmacAuth/actions/workflows/tests.yml/badge.svg)](https://github.com/rickeysxhemz/hmacAuth/actions/workflows/tests.yml)
[![Packagist Version](https://img.shields.io/packagist/v/hmacauth/laravel-hmac-auth)](https://packagist.org/packages/hmacauth/laravel-hmac-auth)
[![Downloads](https://img.shields.io/packagist/dt/hmacauth/laravel-hmac-auth)](https://packagist.org/packages/hmacauth/laravel-hmac-auth)
[![License](https://img.shields.io/packagist/l/hmacauth/laravel-hmac-auth)](https://github.com/rickeysxhemz/hmacAuth/blob/main/LICENSE)

HMAC-based API authentication for Laravel 11/12.

## Install

```bash
composer require hmacauth/laravel-hmac-auth
php artisan hmac:install
php artisan migrate
php artisan hmac:generate
```

## Protect Routes

```php
Route::middleware('hmac.verify')->group(function () {
    Route::post('/api/resource', ResourceController::class);
});
```

## Documentation

See [docs/](docs/) for full documentation:

- [Getting Started](docs/getting-started.md)
- [Configuration](docs/configuration.md)
- [Client Examples](docs/clients/)
- [API Reference](docs/api-reference.md)
- [Commands](docs/commands.md)
- [Security](docs/security.md)
- [Troubleshooting](docs/troubleshooting.md)

## Requirements

- PHP 8.3+
- Laravel 11.x / 12.x
- Redis

## License

[MIT](https://github.com/rickeysxhemz/hmacAuth/blob/main/LICENSE)
