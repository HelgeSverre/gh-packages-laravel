# Laravel Auto Translate

[//]: # ([![Latest Version on Packagist]&#40;https://img.shields.io/packagist/v/zdearo/laravel-auto-translate.svg?style=flat-square&#41;]&#40;https://packagist.org/packages/zdearo/laravel-auto-translate&#41;)

[//]: # ([![GitHub Tests Action Status]&#40;https://img.shields.io/github/actions/workflow/status/zdearo/laravel-auto-translate/run-tests.yml?branch=main&label=tests&style=flat-square&#41;]&#40;https://github.com/zdearo/laravel-auto-translate/actions?query=workflow%3Arun-tests+branch%3Amain&#41;)

[//]: # ([![GitHub Code Style Action Status]&#40;https://img.shields.io/github/actions/workflow/status/zdearo/laravel-auto-translate/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square&#41;]&#40;https://github.com/zdearo/laravel-auto-translate/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain&#41;)

[//]: # ([![Total Downloads]&#40;https://img.shields.io/packagist/dt/zdearo/laravel-auto-translate.svg?style=flat-square&#41;]&#40;https://packagist.org/packages/zdearo/laravel-auto-translate&#41;)

A Laravel package for extracting and managing translation strings in your Laravel applications. This package helps you identify untranslated strings in your codebase and manage translations for multiple languages.

## Installation

You can install the package via composer in your Laravel project:

```bash
composer require zdearo/laravel-auto-translate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-auto-translate-config"
```

## Usage

### Extract Translations

This command scans your Laravel application for translation strings and extracts them to a JSON file:

```bash
php artisan translations:extract {locale}
```

Replace `{locale}` with your desired language code (e.g., `en`, `pt_BR`, `es_ES`).

The command will:
1. Scan your application for translation strings
2. Create a `new_strings_{locale}.json` file with the found strings
3. Optionally merge the new strings into your existing translation file

### Merge Translations

This command merges translated strings from `new_strings_{locale}.json` to your main translation file:

```bash
php artisan translations:merge {locale}
```

The command offers three merge options:
1. Only merge strings that have translations
2. Merge all strings (including empty translations)
3. Interactive mode: review each untranslated string

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- [Adryel Dearo](https://github.com/zdearo)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
