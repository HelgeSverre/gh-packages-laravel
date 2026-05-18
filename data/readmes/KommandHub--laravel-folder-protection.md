# Laravel Folder Protection

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kommandhub/laravel-folder-protection.svg?style=flat-square)](https://packagist.org/packages/kommandhub/laravel-folder-protection)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/kommandhub/laravel-folder-protection/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/kommandhub/laravel-folder-protection/actions)
[![Total Downloads](https://img.shields.io/packagist/dt/kommandhub/laravel-folder-protection.svg?style=flat-square)](https://packagist.org/packages/kommandhub/laravel-folder-protection)

A simple Laravel package to protect your application (or specific routes) with Basic Authentication. This is particularly useful for staging or preview environments where you want to restrict access without setting up complex authentication.

## Installation

You can install the package via composer:

```bash
composer require kommandhub/laravel-folder-protection
```

The service provider will automatically register itself.

### Publish Configuration

You can publish the configuration file using:

```bash
php artisan vendor:publish --tag="folder-protection-config"
```

This will create a `config/folder-protection.php` file in your application.

## Configuration

You can configure the protection using environment variables in your `.env` file:

```env
FOLDER_PROTECTION_ENABLED=true
FOLDER_PROTECTION_USER=your_username
FOLDER_PROTECTION_PASSWORD=your_password
```

### Default Behavior
By default, the protection is enabled only when `APP_ENV` is set to `staging`.

| Environment Variable | Description | Default |
| --- | --- | --- |
| `FOLDER_PROTECTION_ENABLED` | Enable or disable the protection | `config('app.env') === 'staging'` |
| `FOLDER_PROTECTION_USER` | The username for Basic Auth | `null` |
| `FOLDER_PROTECTION_PASSWORD` | The password for Basic Auth | `null` |

*Note: The package also supports `APP_FOLDER_PROTECTION_USER` and `APP_FOLDER_PROTECTION_PASSWORD` for backward compatibility.*

## Usage

### Global Middleware

To protect your entire application, add the middleware to your `bootstrap/app.php` (Laravel 11+) or `app/Http/Kernel.php` (Laravel 10 and below).

#### Laravel 11 & 12

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\KommandHub\FolderProtection\Http\Middleware\FolderProtection::class);
})
```

#### Laravel 10 and below

```php
// app/Http/Kernel.php
protected $middleware = [
    // ...
    \KommandHub\FolderProtection\Http\Middleware\FolderProtection::class,
];
```

### Route-specific Middleware

You can also apply the middleware to specific routes or groups:

```php
Route::middleware([\KommandHub\FolderProtection\Http\Middleware\FolderProtection::class])->group(function () {
    Route::get('/staging-only', function () {
        // ...
    });
});
```

## Testing

```bash
composer test
```

### Code Coverage

To run tests with code coverage (requires Xdebug or PCOV):

```bash
composer test:coverage
```

The coverage reports will be generated in `build/coverage`.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [KommandHub](https://github.com/kommandhub)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
