# Laravel Scheduled Maintenance
[![Latest Version on Packagist](https://img.shields.io/packagist/v/emmanpbarrameda/laravel-scheduled-maintenance.svg?style=flat-square)](https://packagist.org/packages/emmanpbarrameda/laravel-scheduled-maintenance)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/emmanpbarrameda/laravel-scheduled-maintenance/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/emmanpbarrameda/laravel-scheduled-maintenance/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/emmanpbarrameda/laravel-scheduled-maintenance.svg?style=flat-square)](https://packagist.org/packages/emmanpbarrameda/laravel-scheduled-maintenance)
[![License](https://img.shields.io/packagist/l/emmanpbarrameda/laravel-scheduled-maintenance.svg?style=flat-square)](https://packagist.org/packages/emmanpbarrameda/laravel-scheduled-maintenance)

A modern Laravel package for scheduling app maintenance, showing upcoming downtime notices, and customizing the maintenance page. Supports Laravel 10, 11, and 12 with PHP 8.1 and newer.
<img width="1318" height="569" alt="image" src="https://github.com/user-attachments/assets/c33b57e3-8876-44a0-bca4-aeff3675381b" />

> A Modern Version of [laravel-scheduled-maintenance by James Burrow](https://github.com/churchportal/laravel-scheduled-maintenance)

---

# Requirements

| Requirement | Version |
|-------------|---------|
| PHP | ^8.1 (up to latest) |
| Laravel | ^10.0 \| ^11.0 \| ^12.0 |

---

# Installation

## Step 1
```bash
composer require emmanpbarrameda/laravel-scheduled-maintenance
```

## Step 2
Publish the config, migration, views, and assets:

```bash
php artisan vendor:publish --provider="Emmanpbarrameda\ScheduledMaintenance\ScheduledMaintenanceServiceProvider"
```

## Step 3
Run the migration:

```bash
php artisan migrate
```

## Step 4
Register the middleware in `bootstrap/app.php` (Laravel 11+):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->prepend(\Emmanpbarrameda\ScheduledMaintenance\Http\Middleware\CheckForScheduledMaintenance::class);
})
```

Or in `app/Http/Kernel.php` (Laravel 10):

```php
protected $middleware = [
    \Emmanpbarrameda\ScheduledMaintenance\Http\Middleware\CheckForScheduledMaintenance::class,
    // ...
];
```

---

## Full Documentation
Read the full installation and configuration guide here:
[Laravel Scheduled Maintenance by Emman](https://emmanpbarrameda.github.io/dev-notes/laravel-scheduled-maintenance/)


---

# Screenshots
<img width="1318" height="200" alt="image" src="https://github.com/user-attachments/assets/7e1ab202-559e-4936-aa91-f1cc3fc74b6c" />
<img width="1318" height="569" alt="image" src="https://github.com/user-attachments/assets/5ae9b6e7-2359-4d02-9340-6ce8bcc02f7d" />
<img width="1318" height="223" alt="image" src="https://github.com/user-attachments/assets/6d1bac5d-c1f8-4420-b03c-5f4125cc0157" />

---

# License

MIT - see [LICENSE](https://github.com/emmanpbarrameda/laravel-scheduled-maintenance?tab=MIT-1-ov-file) for details.

---

# Credits

- Original package by [James Burrow](https://github.com/churchportal/laravel-scheduled-maintenance)
- Modernized and maintained by [Emman P. Barrameda](https://github.com/emmanpbarrameda)
