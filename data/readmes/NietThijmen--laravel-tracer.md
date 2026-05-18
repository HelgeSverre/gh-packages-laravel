# Laravel tracer

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nietthijmen/laravel-tracer.svg?style=flat-square)](https://packagist.org/packages/nietthijmen/laravel-tracer)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/nietthijmen/laravel-tracer/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/nietthijmen/laravel-tracer/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/nietthijmen/laravel-tracer/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/nietthijmen/laravel-tracer/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/nietthijmen/laravel-tracer.svg?style=flat-square)](https://packagist.org/packages/nietthijmen/laravel-tracer)

Get better insights in the patterns of your users with Laravel tracer, a package that allows you to easily trace user interactions in your Laravel application.

This can be used for a variety of use cases, such as:
- Analytics: Get insights in how users interact with your application, which routes are most popular, etc.
- Heuristics: Optimise the routes your users are actually using, for example by caching the most popular routes.
- Debugging: Get insights in how users are interacting with your application, which can help you identify issues and bugs.

This package doesn't use any external services, all traces are stored in your own database, so you have full control over the data and can easily query it to get the insights you need.


(This package is inspired by the work done by [protonemedia](https://github.com/protonemedia) their [package](https://github.com/protonemedia/laravel-tracer), but since they're package is archived for over 2 years, I decided to create a new package with the same functionality but with a more modern approach, and also with some additional features such as the prunable traces and extra configs.)

## Installation

You can install the package via composer:

```bash
composer require nietthijmen/laravel-tracer
php artisan laravel-tracer:install
```


This is optional but recommended, but the traces are [prunable](https://laravel.com/docs/12.x/eloquent#pruning-models), so you can set up a schedule to prune old traces, for example:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune', [
    '--model' => [
        \Nietthijmen\LaravelTracer\Models\UserTrace::class
    ],
])->daily();
````


## Usage
The package has 2 middleware, aliased as: traceUser & qualify
The qualify middleware allows you to "overwrite" the route name used for tracing, this is useful for when multiple routes can be grouped together, for example: all routes related to a specific resource.

```php
Route::middleware(['auth', 'traceUser', 'qualify:resource'])->group(function () {
    Route::get('/resource', [ResourceController::class, 'index'])->name('resource.index');
    Route::get('/resource/{id}', [ResourceController::class, 'show'])->name('resource.show');
});
```

You can then use the `UserTrace` model to query the traces, for example:

```php
use NietThijmen\LaravelTracer\Models\UserTrace;
$traces = UserTrace::where('qualified_route', 'resource')->get();
```

There's also some configs for the package which get auto-published when you run the install command, you can find them in `config/tracer.php`
These configs allow you to set what gets traced (user agent, ip address, etc.) and also allow you to set a custom model for the traces.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Thijmen Rierink](https://github.com/NietThijmen)
- [All Contributors](../../contributors)

