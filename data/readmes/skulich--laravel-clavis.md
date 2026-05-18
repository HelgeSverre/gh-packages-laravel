# Laravel Clavis

[![Latest Version on Packagist](https://img.shields.io/packagist/v/skulich/laravel-clavis.svg)](https://packagist.org/packages/skulich/laravel-clavis)
![PHP Version Require](https://img.shields.io/packagist/php-v/skulich/laravel-clavis)
![Laravel Version](https://img.shields.io/badge/laravel-%5E12.0%20%7C%7C%20%5E13.0-red?logo=laravel)
[![Run Tests](https://github.com/skulich/laravel-clavis/actions/workflows/tests.yml/badge.svg)](https://github.com/skulich/laravel-clavis/actions)
![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/packagist/l/skulich/laravel-clavis.svg)
![Total Downloads](https://img.shields.io/packagist/dt/skulich/laravel-clavis.svg)

**Laravel Clavis** is a lightweight token-based authentication middleware package for Laravel APIs.

Perfect for **API-first applications** and **microservices** where you need simple and secure token-based authentication
without the overhead of Sanctum.

**Key benefits:**

- 🚀 **Quick Setup**: Create a token via CLI
- 🔒 **Secure**: Built on Laravel's native Hash generator
- 🎯 **Focused**: Designed for server-to-server scenarios
- 🧹 **Clean**: No migrations, No users, No dependencies

# Table of contents

* [Installation](#installation)
* [Usage](#usage)
    * [Generate Token](#generate-token)
    * [Rotate Token](#rotate-token)
    * [API Middleware](#api-middleware)
* [Failed Auth Events](#failed-auth-events)
* [Nota Bene](#nota-bene)
* [Tests](#tests)
* [Changelog](#changelog)
* [Contributing](#contributing)
* [License](#license)

## Installation

Install the package via Composer.

```shell
composer require skulich/laravel-clavis
```

## Usage

## Generate Token

Generate a new API token via CLI.

> The generated token is shown only once. Store it securely and share it over a safe channel.

```shell
php artisan clavis:token
```

## Rotate Token

Run the same command to rotate the token. The old token will stop working immediately after regeneration.

```shell
php artisan clavis:token
```

## API Middleware

Add the `clavis` middleware to your API routes.

```php
// Per Route
Route::get('/test', function (Request $request) {
    // return ...
})->middleware('clavis');

// Per Group
Route::middleware('clavis')->group(function () {
    // Route:: ...
});

// Globally in app/bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->appendToGroup('api', 'clavis');
})
```

## Failed Auth Events

Failed authentication attempts dispatch `Illuminate\Auth\Events\Failed` with guard `clavis` and a masked token.

```php
Event::listen(Failed::class, function (Failed $event) {
    if ($event->guard === 'clavis') {
        Log::warning('Clavis: unauthorized request', $event->credentials);
    }
});
```

## Nota Bene

- `CLAVIS_HASH` is a secret, treat it like `APP_KEY` — never commit it to version control.
- For internet-facing endpoints, apply Laravel's `throttle` middleware alongside `clavis` to mitigate brute-force attacks.

## Tests

Run the entire test suite:

```shell
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.
