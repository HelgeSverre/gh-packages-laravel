# Lang-Helper

[![Latest Version on Packagist](https://img.shields.io/packagist/v/asnardd/lang-helper.svg?style=flat-square)](https://packagist.org/packages/asnardd/lang-helper)
[![Total Downloads](https://img.shields.io/packagist/dt/asnardd/lang-helper.svg?style=flat-square)](https://packagist.org/packages/asnardd/lang-helper)

A simple package for Laravel to help you create lang files easily with artisan

## Installation

You can install the package via composer:

```bash
composer require asnardd/lang-helper
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="lang-helper-config"
```

This is the contents of the published config file:

```php
return [
    'lang-folder' => 'lang',
    'new-file-content' => "<?php\n\nreturn[\n\t\n];"
];
```


## Usage

```bash
php artisan make:lang {name?} {lang?} {--O|overwrite}
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Asnardd](https://github.com/Asnardd)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
