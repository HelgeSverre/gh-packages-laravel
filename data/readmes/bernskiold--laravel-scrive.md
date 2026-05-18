# A Laravel package to work with the Scrive e-signing service.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bernskioldmedia/laravel-scrive.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-scrive)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/bernskioldmedia/laravel-scrive/run-tests?label=tests)](https://github.com/bernskioldmedia/laravel-scrive/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/workflow/status/bernskioldmedia/laravel-scrive/Check%20&%20fix%20styling?label=code%20style)](https://github.com/bernskioldmedia/laravel-scrive/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bernskioldmedia/laravel-scrive.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-scrive)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require bernskioldmedia/laravel-scrive
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-scrive-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$laravelScrive = new BernskioldMedia\LaravelScrive();
echo $laravelScrive->echoPhrase('Hello, BernskioldMedia!');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Bernskiold Media](https://github.com/bernskioldmedia)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
