# The Laravel stubs according to Porifa's choice

[![Stable Version](https://img.shields.io/packagist/v/porifa/laravel-stubs.svg?style=flat)](https://packagist.org/packages/porifa/laravel-stubs)
[![GitHub Tests Action Status](<https://img.shields.io/github/workflow/status/porifa/laravel-stubs/pest?label=Tests%20(Pest)>)](https://github.com/porifa/laravel-stubs/actions?query=workflow%3Apest+branch%3Amain)
[![GitHub Code Style Action Status](<https://img.shields.io/github/workflow/status/porifa/laravel-stubs/Pint?label=Code%20Style%20(Pint)>)](https://github.com/porifa/laravel-stubs/actions?query=workflow%3A"Pint"+branch%3Amain)
[![StyleCI](https://github.styleci.io/repos/556416263/shield?style=flat&branch=main)](https://github.styleci.io/repos/556416263?branch=main)
[![Quality Score](https://img.shields.io/scrutinizer/g/porifa/laravel-stubs.svg?style=flat)](https://scrutinizer-ci.com/g/porifa/laravel-stubs)
[![Downloads](https://img.shields.io/packagist/dt/porifa/laravel-stubs.svg?style=flat)](https://packagist.org/packages/porifa/laravel-stubs)
[![License](https://img.shields.io/packagist/l/porifa/laravel-stubs.svg?style=flat)](https://packagist.org/packages/porifa/laravel-stubs)

This repo contains customized stubs according to Porifa's choice.

## Installation

You can install the package via composer:

```bash
composer require porifa/laravel-stubs --dev
```

## Usage

You can publish the stubs using this command:

```bash
php artisan porifa-stubs:publish
```

Optionally, you can keep your stubs up to date with every update, add this composer hook to your composer.json file:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan porifa-stubs:publish --force"
    ]
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/porifa/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Aamir Sohail KmAs](https://github.com/AamirSohailKmAs)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
