# Laravel Key Rotate

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sergkulich/laravel-key-rotate.svg)](https://packagist.org/packages/sergkulich/laravel-key-rotate)
![PHP Version Require](https://img.shields.io/packagist/php-v/sergkulich/laravel-key-rotate)
![Laravel Version](https://img.shields.io/badge/laravel-%5E11.0%20-red?logo=laravel)
[![Run Tests](https://github.com/sergkulich/laravel-key-rotate/actions/workflows/tests.yml/badge.svg)](https://github.com/sergkulich/laravel-key-rotate/actions)
![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/packagist/l/sergkulich/laravel-key-rotate.svg)
[![Total Downloads](https://img.shields.io/packagist/dt/sergkulich/laravel-key-rotate.svg)](https://packagist.org/packages/sergkulich/laravel-key-rotate)

Laravel Key Rotate package allows automatically copy current `APP_KEY` and update `APP_PREVIOUS_KEYS` with it,
After that it will call `key:generate` artisan command to generate new `APP_KEY`, and, optionally, update all your
Eloquent Models encrypted fields.

The Command available only then `app()->runningInConsole()` as it may take a while to update Models.

> [!WARNING]
>
> The package is in beta. Use with caution.
>
> Never run in production without previous local testing and fresh `.env` copy and `DB` dump.

# Table of contents

* [Installation](#installation)
* [Usage](#usage)
* [Dive Deeper](#dive-deeper)
    * [The Event](#the-event)
    * [The Listener](#the-listener)
    * [Models](#models)
    * [Casts](#casts)
* [Tests](#tests)
* [Changelog](#changelog)
* [Contributing](#contributing)
* [License](#license)

## Installation

Install the package via composer:

```shell
composer require sergkulich/laravel-key-rotate
```

## Usage

Run artisan command to rotate the key.

```shell
php artisan key:rotate
```

Use `--force` option to run the command in production to avoid confirmation prompt.

```shell
php artisan key:rotate --force
```

## Dive deeper

Quick example of extended usage.

You need to register `KeyRotate::useListener()` only if you want your model encrypted fields to be re-encrypted.

```php
namespace App\Providers;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (app()->runningInConsole()) {
            // Subscribe The Listener to The Event
            KeyRotate::withListener()
                // Discover Models that are not in App\ namespace
                ->withDir(base_path('src/Domain'), 'Domain\\')
                // Exclude Models
                ->withoutModel(User::class)
                // Exclude Model Fields
                ->withoutModelFileds(Secret::class, ['secret'])
                // Without Cast
                ->withoutCast('encrypted:array')
                // With Custom Cast
                ->withCast(CustomCast::class);
        }
    }
}
```

### The Event

The `key:rotate` command fires an event after successful completion.

#### The Event Class

The package provides helper to get the event class name to subscribe listeners to it.

```php
$keyRotateEventClass = KeyRotate::getEventClass();

Event::listen($keyRotateEventClass, MyKeyRotateListener::class);
```

### The Listener

The package provides default listener that update encrypted models fields after key rotation.

#### The Listener Class

The package provides helper to get the listener class name in case you need it.

```php
KeyRotate::getListenerClass();
```

#### Get Instance of the Listener

Simply subscribe the listener to the event in your app service provider boot method.

```php
namespace App\Providers;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (app()->runningInConsole()) {
            KeyRotate::withListener();
        }
    }
}
```

Or get singleton instance of the listener and call it anywhere in your code.

```php
// Get Instance
$listener = KeyRotate::getListener();

// Call it either
$listener();
// or
$listener->handle();
```

### Models

The package discovers all Models in your `app()->path()` folder with `app()->getNamespace()` namespace.

But only then `app()->runningInConsole()`, so no unnecessary file scans happen during http requests.

#### Discover Models

It's possible to discover Models with defined namespace that are not located in your `app()->path()` but in a custom
directory.

```php
$listener->withDir(base_path('src/Domain'), 'NameSpace\\Domain\\');
```

#### Include Models

It's possible to include Model to be updated with the listener without scanning directories.

```php
$listener->withModel(CustomModel::class);
```

#### Exclude Models

It's possible to exclude Model from being updated with the listener.

```php
$listener->withoutModel(User::class);
```

#### Exclude Model Fields

It's possible to exclude some Model fields from being updated with the listener.

```php
$listener->withoutModelFields(User::class, ['encrypted_text', 'encrypted_array']);
```

### Casts

By default, the listener takes care of Laravel's predefined `encrypted` Casts.

```php
[
    'encrypted',
    'encrypted:array',
    'encrypted:collection',
    'encrypted:object',
    AsEncryptedArrayObject::class,
    AsEncryptedCollection::class,
];
```

At your disposal there are helpers to reduce the above list or extend it with your custom cast that implements
`Castable`, `CastsAttributes`, or `CastsInboundAttributes` interfaces.

```php
// Exclude cast
$listener->withoutCast('encrypted:array');

// Include cast
$listener->withCast(CustomCast::class);
```

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
