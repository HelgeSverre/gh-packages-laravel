# Laravel Make Action

[![Tests](https://github.com/ibaiicb/laravel-make-action/actions/workflows/run-tests.yml/badge.svg)](https://github.com/ibaiicb/laravel-make-action/actions/workflows/run-tests.yml)
[![PHPStan](https://github.com/ibaiicb/laravel-make-action/actions/workflows/phpstan.yml/badge.svg)](https://github.com/ibaiicb/laravel-make-action/actions/workflows/phpstan.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/ibaiicb/laravel-make-action.svg)](https://packagist.org/packages/ibaiicb/laravel-make-action)
[![PHP Version](https://img.shields.io/packagist/php-v/ibaiicb/laravel-make-action.svg)](https://packagist.org/packages/ibaiicb/laravel-make-action)
[![License](https://img.shields.io/github/license/ibaiicb/laravel-make-action.svg)](LICENSE)

A Laravel package that adds a `make:action` Artisan command to generate Action classes following the single responsibility principle.

## Requirements

- PHP 8.1+
- Laravel 10, 11 or 12

## Installation

```bash
composer require ibaiicb/laravel-make-action
```

The package registers itself automatically via Laravel's package discovery.

## Usage

### Basic action

```bash
php artisan make:action SendWelcomeEmail
```

Generates `app/Actions/SendWelcomeEmail.php`:

```php
<?php

namespace App\Actions;

class SendWelcomeEmail
{
    public function handle(): void
    {
        //
    }
}
```

### Invokable action (`--invokable` / `-i`)

```bash
php artisan make:action SendWelcomeEmail --invokable
```

Generates a class with `__invoke()` instead of `handle()`.

### Queued action (`--queued` / `-q`)

```bash
php artisan make:action SendWelcomeEmail --queued
```

Generates a class implementing `ShouldQueue` with all the required queue traits.

### With an accompanying test (`--test`)

```bash
php artisan make:action SendWelcomeEmail --test
```

Generates the action and a Pest test at `tests/Feature/Actions/SendWelcomeEmailTest.php`.

### Nested namespaces

Use `/` as separator to generate actions in sub-namespaces:

```bash
php artisan make:action Auth/LoginUser
# → app/Actions/Auth/LoginUser.php  (namespace App\Actions\Auth)

php artisan make:action Billing/Subscription/CancelSubscription
# → app/Actions/Billing/Subscription/CancelSubscription.php
```

### Overwrite an existing action (`--force`)

```bash
php artisan make:action SendWelcomeEmail --force
```

## Configuration

Publish the config file to customise the default namespace and method name:

```bash
php artisan vendor:publish --tag=laravel-make-action-config
```

`config/make-action.php`:

```php
return [
    'namespace' => 'Actions',   // generates under App\Actions
    'method'    => 'handle',    // main method name (ignored for --invokable)
];
```

## Customising stubs

Publish the stubs to tailor the generated code:

```bash
php artisan vendor:publish --tag=laravel-make-action-stubs
```

This copies the stubs to `stubs/vendor/laravel-make-action/`. The command will use your published stubs automatically.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

Please see [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
