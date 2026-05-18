# Laravel User Token Management CLI

[![Latest Version on Packagist](https://img.shields.io/packagist/v/skulich/laravel-user-token-management-cli.svg)](https://packagist.org/packages/skulich/laravel-user-token-management-cli)
![PHP Version Require](https://img.shields.io/packagist/php-v/skulich/laravel-user-token-management-cli)
![Laravel Version](https://img.shields.io/badge/laravel-%5E12.42%20%7C%7C%20%5E13.0-red?logo=laravel)
[![Run Tests](https://github.com/skulich/laravel-user-token-management-cli/actions/workflows/tests.yml/badge.svg)](https://github.com/skulich/laravel-user-token-management-cli/actions)
![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/packagist/l/skulich/laravel-user-token-management-cli.svg)
![Total Downloads](https://img.shields.io/packagist/dt/skulich/laravel-user-token-management-cli.svg)

[//]: # ([![Code Coverage]&#40;https://img.shields.io/codecov/c/github/skulich/laravel-user-token-management-cli?logo=codecov&#41;]&#40;https://codecov.io/gh/skulich/laravel-user-token-management-cli&#41;)

A Laravel package that lets you create and delete users and tokens from the CLI.

This can be useful for API microservices where only one user is needed to access the API.

> **Note:**
> User token commands are available only when `Sanctum` is installed and the `User` model is tokenable.

> **Note:**
> This package provides only basic token support. It does not support abilities, expiration, etc.

# Table of contents

* [Installation](#installation)
* [Usage](#usage)
    * [User Commands](#user-commands)
    * [User Token Commands](#user-token-commands)
* [User Model Binding](#user-model-binding)
* [Tests](#tests)
* [Changelog](#changelog)
* [Contributing](#contributing)
* [License](#license)

## Installation

Install the package via Composer.

```shell
composer require skulich/laravel-user-token-management-cli
```

## Usage

The package provides six Artisan commands to manage users and their tokens.

### User Commands

Run these Artisan commands to manage users.

```shell
# create a new user
php artisan user:create

# delete a user
php artisan user:delete

# list users
php artisan user:list
```

### User Token Commands

Run these Artisan commands to manage user tokens.

```shell
# create a new token for the user
php artisan user:token:create

# delete tokens for the user
php artisan user:token:delete

# list user tokens
php artisan user:token:list
```

## User Model Binding

If your `User` model class is not located in the `App\Models\User` namespace,
you must bind `App\Models\User` to your implementation in the `boot()` method of `AppServiceProvider`.

```php
namespace App\Providers;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        app()->bind('\App\Models\User', fn () => resolve('\App\User'));
    }
}
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
