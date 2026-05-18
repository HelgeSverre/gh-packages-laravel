# Laravel Resource Modifier

[![Test & Lint](https://github.com/toneflix/laravel-resource-modifier/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/toneflix/laravel-resource-modifier/actions/workflows/run-tests.yml)
[![Latest Stable Version](https://img.shields.io/packagist/v/toneflix-code/laravel-resource-modifier.svg)](https://packagist.org/packages/toneflix-code/laravel-resource-modifier)
[![Total Downloads](https://img.shields.io/packagist/dt/toneflix-code/laravel-resource-modifier.svg)](https://packagist.org/packages/toneflix-code/laravel-resource-modifier)
[![License](https://img.shields.io/packagist/l/toneflix-code/laravel-resource-modifier.svg)](https://packagist.org/packages/toneflix-code/laravel-resource-modifier)
[![PHP Version Require](https://img.shields.io/packagist/dependency-v/toneflix-code/laravel-resource-modifier/php)](https://packagist.org/packages/toneflix-code/laravel-resource-modifier)
[![codecov](https://codecov.io/gh/toneflix/laravel-resource-modifier/graph/badge.svg?token=2O7aFulQ9P)](https://codecov.io/gh/toneflix/laravel-resource-modifier)

<!-- ![GitHub Actions](https://github.com/toneflix/laravel-resource-modifier/actions/workflows/run-tests.yml/badge.svg) -->

A simple Laravel package that intercepts and help you customize, remove or modify the meta data on your Eloquent API Resource response, as well as automatically convert resource keys to camel case.

## Features

- Complete control over how Eloquent Api Resources are rendered and generated.
- Remove `meta` and `links` completely from the response if you want.
- If you choose to keep `meta` and `links`, you also have total control over `meta`'s [`to`, `from`, `links`, `path`, `total`, `per_page`, `last_page`, `current_page`] properties and `link`'s [`first`, `last`, `prev`, `next`] properties.
- Automatically convert resource keys to camel casing if needed.
- `php artisan mod:resource` to automatically generate API resources in place of `php artisan make:resource`;

## Installation

You can install the package via composer:

```bash
composer require toneflix-code/laravel-resource-modifier
```

## Package Discovery

Laravel automatically discovers and publishes service providers but optionally after you have installed Laravel Fileable, open your Laravel config file if you use Laravel below 11, `config/app.php` and add the following lines.

In the $providers array add the service providers for this package.

```php
ToneflixCode\ResourceModifier\ResourceModifierServiceProvider::class
```

If you use Laravel >= 11, open your `bootstrap/providers.php` and the above line to the array.

```php
return [
    ToneflixCode\ResourceModifier\ResourceModifierServiceProvider::class,
];
```

## Configuration

By default Laravel Resource Modifier doesn't really do anything different from what Laravel does, but now you can publish the configuration file and modify how Api Resources are presented by running the following artisan command.

Run `php artisan vendor:publish --tag="resource-modifier"`

## Generating Resources

To generate a resource class, you may use the `mod:resource` Artisan command. By default, resources will be placed in the `app/Http/Resources` directory of your application. Resources extend the `ToneflixCode\ResourceModifier\Services\Json\JsonResource` class:

```bash
artisan mod:resource UserResource
```

The configuration file will be copied to `config/resource-modifier.php`.

## Resource Collections

To create a resource collection, you should use the `--collection` flag when creating the resource. Or, including the word `Collection` in the resource name will indicate to Laravel that it should create a collection resource. Collection resources extend the `ToneflixCode\ResourceModifier\Services\Json\ResourceCollection` class:

```bash
php artisan mod:resource User --collection

php artisan mod:resource UserCollection
```

## Overwriting the `make:resource` command

If you want Laravel Resource Modifier to handle your `php artisan make:resource` command by default, you can create a new command named `ResourceMakeCommand` with the following signature:

```php
namespace App\Console\Commands;

use Symfony\Component\Console\Attribute\AsCommand;
use ToneflixCode\ResourceModifier\Commands\ResourceMakeCommand as ToneflixCodeResourceMakeCommand;

#[AsCommand(name: 'make:resource')]
class ResourceMakeCommand extends ToneflixCodeResourceMakeCommand
{
    protected $name = 'make:resource';
}
```

This will overide the default `ResourceMakeCommand` as Laravel will prefer user defined commands over built in ones, so the next time you call `php artisan make:resource UserCollection`, your collection will be created with the Laravel Resource Modifier signature.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email code@toneflix.com.ng instead of using the issue tracker.

## Credits

-   [Toneflix Code](https://github.com/toneflix)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
