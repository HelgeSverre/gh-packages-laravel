# Simplifying Theme Integration

<!-- [![Latest Version](https://img.shields.io/packagist/v/pankaj/theme-converter.svg?style=flat-square)](https://packagist.org/packages/pankaj/theme-converter)
[![Total Downloads](https://img.shields.io/packagist/dt/pankaj/theme-converter.svg?style=flat-square)](https://packagist.org/packages/pankaj/theme-converter)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Tests](https://github.com/pankajsondagar07/theme-converter/actions/workflows/tests.yml/badge.svg)](https://github.com/pankajsondagar07/theme-converter/actions) -->

✨ **Automatically Convert HTML Themes to Laravel Blade Templates** ✨

The Laravel Theme Converter package simplifies theme integration by automatically converting HTML themes (AdminLTE, Gentella, Bootstrap, etc.) into fully functional Laravel Blade templates with a single command.

## 🔥 Features

- **One-command conversion** of HTML themes to Blade templates
- **Automatic layout detection** - identifies master templates
- **Smart asset handling** - rewrites paths using `asset()` helper
- **Template partials conversion** to Blade `@include` directives
- **Section detection** for headers, footers, and content areas
- **Supports popular admin themes**: AdminLTE, Gentella, CoreUI
- **Configurable rules** for custom theme structures
- **Preserves directory structure** from original theme

## Installation

You can install the package via composer:

```bash
composer require pankaj/theme-converter
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="theme-converter-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="theme-converter-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="theme-converter-views"
```

## Usage

```php
$themeConverter = new Pankaj\ThemeConverter();
echo $themeConverter->echoPhrase('Hello, Pankaj!');
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

- [Pankaj Sondagar](https://github.com/139882819+pankajsondagar07)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
