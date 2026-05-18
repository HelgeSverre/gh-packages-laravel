# Laravel Multilingual Routes

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chinleung/laravel-multilingual-routes.svg?style=flat-square)](https://packagist.org/packages/chinleung/laravel-multilingual-routes)
[![Build Status](https://github.com/chinleung/laravel-multilingual-routes/workflows/tests/badge.svg)](https://github.com/chinleung/laravel-multilingual-routes/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/chinleung/laravel-multilingual-routes.svg?style=flat-square)](https://packagist.org/packages/chinleung/laravel-multilingual-routes)

A package to register multilingual routes for your application.

## Versioning

| Version  | Laravel Version |
| ------------- | ------------- |
| v6 | 13.x  |
| v5 | 12.x  |
| v4 | 10.x, 11.x  |
| v3  | 9.x  |
| v2  | Older than 9.x  |

## Installation

You can install the package via composer:

```bash
composer require chinleung/laravel-multilingual-routes
```

To detect and change the locale of the application based on the request automatically, you can add the middleware to your `bootstrap/app.php`. It must be the first item in the `web` middleware group.

``` php
$middleware->web(
    prepend: [
        DetectRequestLocale::class,
    ]
); 
```

## Configuration

By default, the application locales are only going to be `en` and the default locale is not prefixed. If you want to prefix the default locale, please run the following command to publish the configuration file:

``` bash
php artisan vendor:publish --provider="ChinLeung\MultilingualRoutes\MultilingualRoutesServiceProvider" --tag="config"
```

If your application supports different locales, you can either set a `app.locales` configuration or follow the configuration instructions from [chinleung/laravel-locales](https://github.com/chinleung/laravel-locales#configuration).

## Example

Instead of doing this:

``` php
Route::get('/', 'ShowHomeController')->name('en.home');
Route::get('/fr', 'ShowHomeController')->name('fr.home');
```

You can accomplish the same result with:

``` php
Route::multilingual('/', 'ShowHomeController')->name('home');
```

A [demo repository](https://github.com/chinleung/laravel-multilingual-routes-demo) has been setup to showcase the basic usage of the package.

## Usage

### Quick Usage

Once you have configured the locales, you can start adding routes like the following example in your `routes/web.php`:

``` php
Route::multilingual('test', 'TestController');
```

This will generate the following:

| Method   | URI     | Name    | Action                              |
|----------|---------|---------|-------------------------------------|
| GET\|HEAD | test | en.test | App\Http\Controllers\TestController |
| GET\|HEAD | fr/teste   | fr.test | App\Http\Controllers\TestController |

Note the `URI` column is generated from a translation file located at `resources/lang/{locale}/routes.php` which contains the key of the route like the following:

``` php
<?php

// resources/lang/fr/routes.php

return [
  'test' => 'teste'
];
```

**Important for Resource Routes:** When using `multilingualResource`, don't forget to add translations for all resource route segments that contain parameters:

```php
Route::multilingualResource('test', 'TestController');
```

```php
<?php

// resources/lang/fr/routes.php

return [
   'test' => 'teste',
   'test/{test}' => 'teste/{test}'
];
```

This will generate the following:

| Method    | URI                        | Name              | Action                                    |
|-----------|----------------------------|-------------------|-------------------------------------------|
| GET\|HEAD | test                       | en.test.index     | App\Http\Controllers\TestController@index |
| GET\|HEAD | test/create                | en.test.create    | App\Http\Controllers\TestController@create |
| POST      | test                       | en.test.store     | App\Http\Controllers\TestController@store |
| GET\|HEAD | test/{test}                | en.test.show      | App\Http\Controllers\TestController@show |
| GET\|HEAD | test/{test}/edit           | en.test.edit      | App\Http\Controllers\TestController@edit |
| PUT       | test/{test}                | en.test.update    | App\Http\Controllers\TestController@update |
| DELETE    | test/{test}                | en.test.destroy   | App\Http\Controllers\TestController@destroy |
| GET\|HEAD | fr/teste                   | fr.test.index     | App\Http\Controllers\TestController@index |
| GET\|HEAD | fr/teste/create            | fr.test.create    | App\Http\Controllers\TestController@create |
| POST      | fr/teste                   | fr.test.store     | App\Http\Controllers\TestController@store |
| GET\|HEAD | fr/teste/{test}            | fr.test.show      | App\Http\Controllers\TestController@show |
| GET\|HEAD | fr/teste/{test}/edit       | fr.test.edit      | App\Http\Controllers\TestController@edit |
| PUT       | fr/teste/{test}            | fr.test.update    | App\Http\Controllers\TestController@update |
| DELETE    | fr/teste/{test}            | fr.test.destroy   | App\Http\Controllers\TestController@destroy |

To retrieve a route, you can use the `localized_route(string $name, array $parameters, string $locale = null, bool $absolute = true)` instead of the `route` helper:

```php
localized_route('test'); // Returns the url of the current application locale
localized_route('test', [], 'fr'); // Returns https://app.test/fr/teste
localized_route('test', [], 'en'); // Returns https://app.test/test
```

To retrieve the current route in another locale, you can use the `current_route(string $locale = null)` helper:

```php
current_route(); // Returns the current request's route
current_route('fr'); // Returns the current request's route in French version
current_route('fr', route('fallback')); // Returns the fallback route if the current route is not registered in French
```

To check if the current route matches a specific route name (without locale prefix), you can use the `current_route_is(string $name)` helper:

```php
current_route_is('home'); // Returns true if current route is 'en.home', 'fr.home', etc.
current_route_is('photos.show'); // Returns true if current route is 'en.photos.show', 'fr.photos.show', etc.
```

### Renaming the routes

```php
Route::multilingual('test', 'TestController')->name('foo');
```

| Method   | URI     | Name   | Action                              |
|----------|---------|--------|-------------------------------------|
| GET\|HEAD | test | en.foo | App\Http\Controllers\TestController |
| GET\|HEAD | fr/teste   | fr.foo | App\Http\Controllers\TestController |

### Renaming a route based on the locale

```php
Route::multilingual('test', 'TestController')->names([
  'en' => 'foo',
  'fr' => 'bar',
]);
```

| Method   | URI     | Name   | Action                              |
|----------|---------|--------|-------------------------------------|
| GET\|HEAD | test | en.foo | App\Http\Controllers\TestController |
| GET\|HEAD | fr/teste   | fr.bar | App\Http\Controllers\TestController |

### Skipping a locale

```php
Route::multilingual('test', 'TestController')->except(['fr']);
```

| Method   | URI     | Name    | Action                              |
|----------|---------|---------|-------------------------------------|
| GET\|HEAD | test    | en.test | App\Http\Controllers\TestController |

### Restricting to a list of locales

```php
Route::multilingual('test', 'TestController')->only(['fr']);
```


| Method   | URI     | Name    | Action                              |
|----------|---------|---------|-------------------------------------|
| GET\|HEAD | fr/teste | fr.test | App\Http\Controllers\TestController |

### Changing the method of the request

```php
Route::multilingual('test', 'TestController')->method('post');
```

| Method | URI     | Name    | Action                              |
|--------|---------|---------|-------------------------------------|
| POST   | test | en.test | App\Http\Controllers\TestController |
| POST   | fr/teste   | fr.test | App\Http\Controllers\TestController |

### Registering a view route


```php
// Loads test.blade.php
Route::multilingual('test');
```

| Method   | URI     | Name    | Action                              |
|----------|---------|---------|-------------------------------------|
| GET\|HEAD | test | en.test | Illuminate\Routing\ViewController |
| GET\|HEAD | fr/teste   | fr.test | Illuminate\Routing\ViewController |


### Registering a view route with a different key for the route and view

```php
// Loads welcome.blade.php instead of test.blade.php
Route::multilingual('test')->view('welcome');
```

| Method   | URI     | Name    | Action                              |
|----------|---------|---------|-------------------------------------|
| GET\|HEAD | test | en.test | Illuminate\Routing\ViewController |
| GET\|HEAD | fr/teste   | fr.test | Illuminate\Routing\ViewController |

### Passing data to the view

```php
Route::multilingual('test')->data(['name' => 'Taylor']);
Route::multilingual('test')->view('welcome', ['name' => 'Taylor']);
```

### Redirect localized route

```php
Route::multilingual('support');
Route::multilingual('contact')->redirect('support');
```

### Check localized route

```php
Request::localizedRouteIs('home');
```

### Signing localized routes

```php
URL::signedLocalizedRoute('unsubscribe', ['user' => 1]);
URL::temporarySignedLocalizedRoute('unsubscribe', now()->addMinutes(30), ['user' => 1]);
```

### Multilingual Resource Routes

You can also register multilingual resource routes using the `multilingualResource` method:

```php
Route::multilingualResource('photos', 'PhotoController');
```

This will generate all the standard resource routes for each configured locale:

| Method    | URI                        | Name              | Action                                    |
|-----------|----------------------------|-------------------|-------------------------------------------|
| GET\|HEAD | photos                     | en.photos.index   | App\Http\Controllers\PhotoController@index |
| GET\|HEAD | photos/create              | en.photos.create  | App\Http\Controllers\PhotoController@create |
| POST      | photos                     | en.photos.store   | App\Http\Controllers\PhotoController@store |
| GET\|HEAD | photos/{photo}             | en.photos.show    | App\Http\Controllers\PhotoController@show |
| GET\|HEAD | photos/{photo}/edit        | en.photos.edit    | App\Http\Controllers\PhotoController@edit |
| PUT       | photos/{photo}             | en.photos.update  | App\Http\Controllers\PhotoController@update |
| DELETE    | photos/{photo}             | en.photos.destroy | App\Http\Controllers\PhotoController@destroy |
| GET\|HEAD | fr/photos                  | fr.photos.index   | App\Http\Controllers\PhotoController@index |
| GET\|HEAD | fr/photos/create           | fr.photos.create  | App\Http\Controllers\PhotoController@create |
| POST      | fr/photos                  | fr.photos.store   | App\Http\Controllers\PhotoController@store |
| GET\|HEAD | fr/photos/{photo}          | fr.photos.show    | App\Http\Controllers\PhotoController@show |
| GET\|HEAD | fr/photos/{photo}/edit     | fr.photos.edit    | App\Http\Controllers\PhotoController@edit |
| PUT       | fr/photos/{photo}          | fr.photos.update  | App\Http\Controllers\PhotoController@update |
| DELETE    | fr/photos/{photo}          | fr.photos.destroy | App\Http\Controllers\PhotoController@destroy |

#### Limiting resource routes to specific actions

```php
Route::multilingualResource('photos', 'PhotoController')->only(['index', 'show']);
```

#### Excluding specific actions

```php
Route::multilingualResource('photos', 'PhotoController')->except(['create', 'edit']);
```

#### Custom parameter names

```php
Route::multilingualResource('photos', 'PhotoController')->parameters([
    'photos' => 'photo_id'
]);
```

#### Limiting to specific locales

```php
Route::multilingualResource('photos', 'PhotoController')->onlyLocales(['fr']);
Route::multilingualResource('photos', 'PhotoController')->exceptLocales(['en']);
```

#### Laravel 12.x Resource Features

All Laravel 12.x resource route features are supported:

```php
// Customize missing model behavior
Route::multilingualResource('photos', 'PhotoController')
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });

// Include soft deleted models
Route::multilingualResource('photos', 'PhotoController')->withTrashed(['show']);

// Apply constraints to specific parameters
Route::multilingualResource('photos', 'PhotoController')->whereParam('photos', '[0-9]+');
```

#### Using chainable methods

Like regular multilingual routes, you can chain all the same methods:

```php
// Set custom name
Route::multilingualResource('photos', 'PhotoController')->name('gallery');

// Add middleware
Route::multilingualResource('photos', 'PhotoController')->middleware(['auth', 'verified']);

// Add route constraints
Route::multilingualResource('photos', 'PhotoController')->where('photos', '[0-9]+');

// Set default parameters
Route::multilingualResource('photos', 'PhotoController')->defaults(['format' => 'json']);

// Exclude specific locales
Route::multilingualResource('photos', 'PhotoController')->exceptLocales(['en']);

// Set different names per locale
Route::multilingualResource('photos', 'PhotoController')->names([
    'en' => 'pictures',
    'fr' => 'images'
]);

// Chain multiple methods together
Route::multilingualResource('photos', 'PhotoController')
    ->only(['index', 'show', 'edit'])
    ->exceptLocales(['en'])
    ->name('gallery')
    ->middleware('auth')
    ->parameters(['photos' => 'photo_id'])
    ->withTrashed(['show'])
    ->missing(function (Request $request) {
        return redirect()->route('gallery.index');
    });
```

## Upgrading from 1.x to 2.x

To update from 1.x to 2.x, you simply have to rename the namespace occurrences in your application from `LaravelMultilingualRoutes` to `MultilingualRoutes`. The most common use case would be the `DetectRequestLocale` middleware.

## Testing

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email hello@chinleung.com instead of using the issue tracker.

## Credits

- [Chin Leung](https://github.com/chinleung)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Laravel Package Boilerplate

This package was generated using the [Laravel Package Boilerplate](https://laravelpackageboilerplate.com).
