# :package_name

:package_description

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xbot-team/:package_name.svg?style=flat-square)](https://packagist.org/packages/xbot-team/:package_name)
[![Total Downloads](https://img.shields.io/packagist/dt/xbot-team/:package_name.svg?style=flat-square)](https://packagist.org/packages/xbot-team/:package_name)
[![License](https://img.shields.io/packagist/l/xbot-team/:package_name.svg?style=flat-square)](https://packagist.org/packages/xbot-team/:package_name)
[![PHP Version](https://img.shields.io/badge/php-%5E8.3-blue.svg?style=flat-square)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-%5E11.0%7C%7C%5E12.0-ff2d20.svg?style=flat-square)](https://laravel.com)

## Installation

You can install the package via composer:

```bash
composer require xbot-team/:package_name
```

### Laravel 11 / Laravel 12

The service provider and facade will be registered automatically.

### Laravel 10 or below

If you are using Laravel 10 or below, you need to register the service provider manually:

```php
// config/app.php
'providers' => [
    // ...
    XBot\Package\PackageServiceProvider::class,
],
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag=":package_name-config"
```

This is the contents of the published config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Configuration Options
    |--------------------------------------------------------------------------
    |
    | Add your package configuration options here.
    |
    */
];
```

## Usage

```php
$package = new XBot\Package();
echo $package->hello();
```

Or use the facade:

```php
use XBot\Package\Facades\Package;

Package::hello();
```

### Configuration

Add your package configuration options to your `.env` file:

```env
PACKAGE_OPTION=value
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [:author_name](https://github.com/:author_name)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
