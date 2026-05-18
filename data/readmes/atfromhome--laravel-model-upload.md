# Simple model upload using Laravel Excel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fromhome/laravel-model-upload.svg?style=flat-square)](https://packagist.org/packages/fromhome/laravel-model-upload)
[![PHPUnit](https://github.com/atfromhome/laravel-model-upload/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/atfromhome/laravel-model-upload/actions/workflows/run-tests.yml)
[![Laravel Pint](https://github.com/atfromhome/laravel-model-upload/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/atfromhome/laravel-model-upload/actions/workflows/fix-php-code-style-issues.yml)
[![Psalm](https://github.com/atfromhome/laravel-model-upload/actions/workflows/run-psalm-static-analyst.yml/badge.svg?branch=main)](https://github.com/atfromhome/laravel-model-upload/actions/workflows/run-psalm-static-analyst.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/atfromhome/laravel-model-upload.svg?style=flat-square)](https://packagist.org/packages/fromhome/laravel-model-upload)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require atfromhome/laravel-model-upload
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-model-upload-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-model-upload-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-model-upload-views"
```

## Usage

```php
$modelUpload = new FromHome\ModelUpload();
echo $modelUpload->echoPhrase('Hello, FromHome!');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Nuradiyana](https://github.com/nuradiyana)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
