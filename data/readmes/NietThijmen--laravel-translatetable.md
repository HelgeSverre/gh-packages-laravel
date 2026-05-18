# Laravel translations to excel 📋 

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nietthijmen/laravel-translatetable.svg?style=flat-square)](https://packagist.org/packages/nietthijmen/laravel-translatetable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/nietthijmen/laravel-translatetable/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/nietthijmen/laravel-translatetable/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/nietthijmen/laravel-translatetable/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/nietthijmen/laravel-translatetable/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/nietthijmen/laravel-translatetable.svg?style=flat-square)](https://packagist.org/packages/nietthijmen/laravel-translatetable)


Have you ever gotten 90 e-mails about changing a single translation from a customer? I have,
So with this package you can give the client a easy spreadsheet to work in, the client can easily edit it from excel or google sheets,
Finally you import it with 1 command, and you're done!

You can even generate fully new translations with your localisation team without any programming knowledge


## Installation

You can install the package via composer:

```bash
composer require nietthijmen/laravel-translatetable
```


## Usage:
### Generating a spreadsheet
```bash
php artisan translations:generate-spreadsheet
```

### Generating translations from your spreadsheet
```php
php artisan translations:from-spreadsheet ~/Downloads/translations.xlsx
```

## Credits

- [NietThijmen](https://github.com/NietThijmen)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
