# Internationalisation Package

[![run-tests](https://github.com/Pod-Point/countries/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Pod-Point/countries/actions/workflows/run-tests.yml)

This package provides Laravel and Lumen applications internationalisation features:

- List of all countries with data such as dialing codes, names, currencies...
- Limited countries supported by our applications with additional data such as locale, language...
- Laravel ViewComposers with some data pre-loaded.
- Facades and helpers for country, currencies and tax rates (VAT).
- Exchange rates for currencies via OpenExchangeRate's API implementation.

The countries are indexed using their uppercase ISO codes (alpha2/cca2).

## Installation

You can install the package via composer:

For Laravel 5.x and PHP <= 7.1
```bash
composer require pod-point/countries:^3.0
```

For Laravel 6.x and PHP >= 7.2
```bash
composer require pod-point/countries:^4.0
```

For Laravel 7.x or 8.x and PHP >= 7.3
```bash
composer require pod-point/countries:^5.0
```

Then, finally, if you're using a Laravel version which doesn't support Auto Discovery, add the service provider to your `config/app.php` providers array:

```php
'providers' => [
    PodPoint\I18n\CountriesServiceProvider::class,
]
```

If you're using Lumen, add the following line to your `bootstrap/app.php` file:

```php
$app->register(PodPoint\I18n\CountriesServiceProvider::class);
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Licence

The MIT Licence (MIT). Please see [Licence File](LICENCE.md) for more information.

---

<img src="https://d3h256n3bzippp.cloudfront.net/pod-point-logo.svg" align="right" />

Travel shouldn't damage the earth 🌍

Made with ❤️&nbsp;&nbsp;at [Pod Point](https://pod-point.com)
