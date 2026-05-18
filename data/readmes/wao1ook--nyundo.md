# Nyundo: License Manager for Laravel

[![Latest Stable Version](https://poser.pugx.org/emanate/nyundo/v)](https://packagist.org/packages/emanate/nyundo)
[![Total Downloads](https://poser.pugx.org/emanate/nyundo/downloads)](https://packagist.org/packages/emanate/nyundo)
[![License](https://poser.pugx.org/emanate/nyundo/license)](https://packagist.org/packages/emanate/nyundo)

Nyundo is a simple license management package for Laravel applications. it allows you to easily enforce license expiration, grace periods, and display customizable warning messages or expiration pages.

## Installation

You can install the package via composer:

```bash
composer require emanate/nyundo
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="nyundo-config"
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
LICENSE_KEY="YOUR-LICENSE-KEY"
LICENSE_HOLDER="Your Company"
LICENSE_EXPIRATION_DATE="2025-12-31"
LICENSE_WARNING_DAYS=7
LICENSE_GRACE_PERIOD_DAYS=0
LICENSE_SUPPORT_PHONE="+2557123456789"
LICENSE_SUPPORT_EMAIL="support@example.com"
LICENSE_SUPPORT_HOURS="Monday - Friday, 9:00 AM - 5:00 PM"
NYUNDO_PASSWORD="your-strong-password"
```

### Config File

This is the contents of the published config file:

```php
return [
    'key' => env('LICENSE_KEY', null),
    
    'holder' => env('LICENSE_HOLDER', null),

    'warning_days' => (int) env('LICENSE_WARNING_DAYS', 7),

    'expiration_date' => env('LICENSE_EXPIRATION_DATE', null),
     
    'grace_period_days' => (int) env('LICENSE_GRACE_PERIOD_DAYS', 0),

    'support' => [
        'phone' => env('LICENSE_SUPPORT_PHONE', '+2557123456789'),
        'email' => env('LICENSE_SUPPORT_EMAIL', 'support@example.com'),
        'hours' => env('LICENSE_SUPPORT_HOURS', 'Monday - Friday, 9:00 AM - 5:00 PM'),
    ],

    'nyundo_password' => env('NYUNDO_PASSWORD', null),
];
```

## Usage

### Middleware

To enforce license checks, add the `nyundo.check-license` middleware to your routes in `routes/web.php`. 

For example, you can add it to your login route to show warnings to your users before they log in:

```php
Route::get('/login', [LoginController::class, 'showLoginForm'])
    ->middleware('nyundo.check-license')
    ->name('login');
```

Or protect an entire group of routes (this will redirect users to the expiration page if the license is fully expired):

```php
Route::middleware(['nyundo.check-license'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

### CLI Commands

#### Status Check
Check your license status directly from the terminal:

```bash
php artisan nyundo:status
```

#### Apply License
Apply a new license securely via the command line. This requires the `NYUNDO_PASSWORD` to be set in your `.env` file. If you omit the `--password` flag, you will be prompted to enter it securely.

```bash
php artisan nyundo:renew \
    --license-key="ABC-123" \
    --expiry-date="2026-12-31" \
    --warning-days=10 \
    --grace-period=5
```

## Customization

### Displaying Warnings in your UI

The middleware automatically prepares messages for you. Add this snippet to your Blade templates (e.g., in your login or dashboard views) to display them.

#### Basic Example:
```blade
@if(session('nyundo_license_warning'))
    <div class="alert alert-warning">
        {{ session('nyundo_license_warning') }}
    </div>
@endif
```

#### Tailwind + Lucide Example:
```blade
@if(session('nyundo_license_warning') || session('nyundo_license_error'))
    <div class="mb-6 p-4 rounded-lg flex items-start gap-3 border {{ session('nyundo_license_error') ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800' }}">
        <div class="shrink-0 p-1.5 rounded-full {{ session('nyundo_license_error') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' }}">
            <i class="w-4 h-4" data-lucide="{{ session('nyundo_license_error') ? 'alert-octagon' : 'alert-triangle' }}"></i>
        </div>
        <div class="text-sm leading-relaxed {{ session('nyundo_license_error') ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200' }}">
            <strong class="block mb-0.5">{{ session('nyundo_license_error') ? 'License Expired' : 'License Warning' }}</strong>
            {{ session('nyundo_license_error') ?? session('nyundo_license_warning') }}
        </div>
    </div>
@endif
```

### Customizing the Expiration Page

If you want to customize the full-screen expiration page, publish the views:

```bash
php artisan vendor:publish --tag="nyundo-views"
```

The view will be published to `resources/views/vendor/nyundo/expired.blade.php`.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Emanate Software](http://github.com/wao1ook)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
