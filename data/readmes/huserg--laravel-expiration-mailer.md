# Laravel Expiration Mailer

[![Latest Version on Packagist](https://img.shields.io/packagist/v/huserg/laravel-expiration-mailer.svg?style=flat-square)](https://packagist.org/packages/huserg/laravel-expiration-mailer)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/huserg/laravel-expiration-mailer/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/huserg/laravel-expiration-mailer/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/huserg/laravel-expiration-mailer/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/huserg/laravel-expiration-mailer/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/huserg/laravel-expiration-mailer.svg?style=flat-square)](https://packagist.org/packages/huserg/laravel-expiration-mailer)

---

This repo is a Laravel package to send an email to users when a secret or any value is about to expire.

---

## Installation

You can install the package via composer:

```bash
composer require huserg/laravel-expiration-mailer
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-expiration-mailer-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-expiration-mailer-config"
```

This is the contents of the published config file:

```php
return [
# for the moment it's empty
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-expiration-mailer-views"
```

## Usage

Configure your route in `routes/web.php`
```php
use Huserg\LaravelExpirationMailer\Http\Controllers\ExpirationMailerController;

Route::group(['prefix' => 'expirations'], function () {
    Route::get('', [ExpirationController::class, 'index'])->name('lem.expirations.index');
    Route::post('', [ExpirationController::class, 'store'])->name('lem.expirations.store');
    Route::post('{id}/force-send', [ExpirationController::class, 'forceSend'])->name('lem.expirations.force-send');
});
```

To override default 30 and 14 days schedule, add this to your `app/Console/Kernel.php`
```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('expiration-mailer:send-email')->daily(); # or any other schedule
}
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

- [:author_name](https://github.com/:author_username)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
