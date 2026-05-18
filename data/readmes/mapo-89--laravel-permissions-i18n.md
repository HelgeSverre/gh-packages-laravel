# Translations for Spatie Laravel Permission package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mapo-89/laravel-permissions-i18n.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-permissions-i18n)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mapo-89/laravel-permissions-i18n/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mapo-89/laravel-permissions-i18n/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mapo-89/laravel-permissions-i18n/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/mapo-89/laravel-permissions-i18n/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mapo-89/laravel-permissions-i18n.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-permissions-i18n)

This package provides ready-to-use translations (currently English and German) for all default messages of the [Spatie Permissions](https://github.com/spatie/laravel-permission) package.

## Installation

You can install the package via composer:

```bash
composer require mapo-89/laravel-permissions-i18n
```

Optionally, you can publish and run the translations with:

```bash
php artisan vendor:publish --tag="permissions-i18n-translations"
```

This will copy the JSON translation files into:

```bash
resources/lang/vendor/laravel-permissions-i18n/
```

## Usage

The package *automatically registers the JSON translations*. You can use them directly with Laravel’s `__()` helper:

```php
// Set the locale to German
app()->setLocale('de');

echo __('A permission `:permission` already exists for guard `:guard`.', [
    'permission' => 'edit articles',
    'guard' => 'web',
]);
// Output: "Eine Berechtigung `edit articles` existiert bereits für Guard `web`."
```
No additional initialization is required. Laravel will automatically fall back to English if the translation is not available.

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

- [mapo-89](https://github.com/mapo-89)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
