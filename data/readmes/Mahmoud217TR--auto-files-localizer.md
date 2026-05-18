# Auto Files Localizer for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mahmoud217tr/auto-files-localizer.svg?style=flat-square)](https://packagist.org/packages/mahmoud217tr/auto-files-localizer)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mahmoud217tr/auto-files-localizer/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mahmoud217tr/auto-files-localizer/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mahmoud217tr/auto-files-localizer/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/mahmoud217tr/auto-files-localizer/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mahmoud217tr/auto-files-localizer.svg?style=flat-square)](https://packagist.org/packages/mahmoud217tr/auto-files-localizer)

**Easy and Efficient Localiztion**

A Laravel Localization package that auto generate json locale files

![logo](assets/auto-files-localizer.svg)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Config](#config)
- [Usage](#usage)
    - [Dynamic Mode](#dynamic-mode)
    - [Extraction Mode](#extraction-mode)
- [Testing](#testing)
- [Changelog](#changelog)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Credits](#credits)
- [License](#license)

## Features

* Supports Laravel (8.X, 9.X, 10.X, 11.X).
* 2 Modes (Dynamic Mode, Extraction Mode).
* Fast and reliable.

## Installation

You can install the package via composer:

```bash
composer require mahmoud217tr/auto-files-localizer
```

## Config

To publish the package configuration file `config/auto-localizer.php` use the following command:

```bash
php artisan vendor:publish --tag="auto-files-localizer-config"
```

## Usage

It will automatically generate the locale `.json` file where the localized new words are sorted alphabetically.

**There are 2 modes for the package**

### Dynamic Mode

In this mode the translations will be generated dynamically **(On Request)** which means on upon calling the translation function the package will dynamically detect the current language and add the translations to the corresponding `JSON` file.

#### Notes
* Note that this mode shouldn't work on production for performance purposes, but if you want to change this behavior via the configuration file.

* This mode is not recommended using with `vite development` mode. If you want to use it please **build your assets first** using `npm run build` then activate the auto translation mode. **OTHERWISE YOUR APP WILL STUCK IN RELOAD LOOP**

#### Activiation
To activate the `dynamic` mode on `non-production` environment just add the following line to the `.env` file:

```
AUTO_LOCALIZER_ENABLED=true
```

And that's about it the autotranslator will add transaltions to there files sorted alphabetically.
To deactivate the dynamic mode just set the previous value to `false`.

#### Configurations

This mode have the following configurations:

```php
'dynamic' => [
    # Controls if the dynamic mode should work or not on non-production environments
    'enabled' => (bool) env('AUTO_LOCALIZER_ENABLED', false), 
    # Controls if the dynamic mode should work or on production environment (compined with the previous option)
    'production' => false,
],
```

### Extraction Mode

In this mode the translations will be extracted automatically from `views` or `php` files detecting translation functions adding the translations to the corresponding `JSON` file.

#### Command 

To extract the translations for a specific locale (`ar` for example) run the following command:

```shell
php artisan localizer:extract ar
```

The previous command will translate all `non-localized` phrases and all `ar-localized` phrases only.

#### Configurations

This mode have the following configurations:

```php
'extraction' => [
    # The directories where the translation scanner will scan
    'directories' => [
        'resources/views',
    ],
    # The file patterns that the translation scanner will scan
    'patterns' => [
        '*.php'
    ],
    # The translation functions or directives that scanner will detect (you should add your custom functions here)
    'functions' => [
        '__',
        'trans',
        '@lang',
    ],
],
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

- [Mahmoud Mahmoud](https://github.com/Mahmoud217TR)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
