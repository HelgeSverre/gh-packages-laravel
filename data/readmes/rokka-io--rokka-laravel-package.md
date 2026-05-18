# Rokka Laravel Client

<a href="https://packagist.org/packages/rokka/laravel"><img src="https://poser.pugx.org/rokka/laravel/d/total.svg" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/rokka/laravel"><img src="https://poser.pugx.org/rokka/laravel/v/stable.svg" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/rokka/laravel"><img src="https://poser.pugx.org/rokka/laravel/license.svg" alt="License"></a>

A thin wrapper around `rokka-io/rokka-client-php` with some convenience functions to play nice 
with Laravel.

## Installation

Via Composer:

``` bash
$ composer require rokka/laravel
```

If package auto discovery is disabled, you'll need to register the bundled service provider and 
the optional Facade inside `config/app.php`.
```php
'providers' => [
  // ...
  Rokka\RokkaLaravel\RokkaLaravelServiceProvider::class,
]
'aliases' => [
  // ...
  'Rokka' => Rokka\RokkaLaravel\Facades\Rokka::class
]
```

## Usage

⚠️ The API is still experimental and subject to change while we figure out the most ergonomic 
way to wrap the most commonly used functions inside `rokka-io/rokka-client-php`

### `Rokka` Facade

The `Rokka` Facade provides a concise interface to Rokka's main classes.

- `Rokka\Client\TemplateHelper` to generate and manipulate URLs in controllers and templates
- `Rokka\Client\Image` to interact with images
- `Rokka\Client\User` to manage users

Calls can also be scoped to a specific organization with `Rokka::org('env')->…`


```php
Rokka::getStackUrl('dba893', 'test-stack', 'jpg');
Rokka::images()->uploadSourceImage(…)
Rokka::manage()->createOrganization(…)
Rokka::org('my-org')->getStackUrl('dba893', 'test-stack', 'jpg');
```

### `rokka()` helper function

Currently the `rokka()` function exposes the same methods as the `Rokka` facade.

## Security

If you discover any security related issues, please email rokka@rokka.io instead of using 
the issue tracker.

## License

MIT. Please see the [license file](LICENSE.MD) for more information.
