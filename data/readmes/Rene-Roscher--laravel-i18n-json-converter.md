![PVM Banner](assets/img.png)

# A Package for Laravel that converts PHP array-based translation files into flattened JSON files, making them compatible with e.g. xiCO2k/laravel-vue-i18n

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rene-roscher/laravel-i18n-json-converter.svg?style=flat-square)](https://packagist.org/packages/rene-roscher/laravel-i18n-json-converter)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/rene-roscher/laravel-i18n-json-converter/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/rene-roscher/laravel-i18n-json-converter/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/rene-roscher/laravel-i18n-json-converter.svg?style=flat-square)](https://packagist.org/packages/rene-roscher/laravel-i18n-json-converter)

A Package for Laravel that converts PHP array-based translation files into flattened JSON files, making them compatible with [xiCO2k/laravel-vue-i18n](https://github.com/xiCO2k/laravel-vue-i18n).

## Installation

You can install the package via composer:

```bash
composer require rene-roscher/laravel-i18n-json-converter
```

You can convert your PHP array-based translation files into flattened JSON files by running the following command:

```bash
php artisan i18n:convert
```

## Configure i18n for vue-i18n

```javascript
import { i18nVue } from 'laravel-vue-i18n'

// Register the i18n plugin like this
// Tested with Vue 3 (Inertia) and Vite 4
// You need to add the locales manually to the switch, dynamic loading is not supported yet
app.use(i18nVue, {
    resolve: async (lang) => {
        const langFiles = import.meta.glob('../lang/*.json', { eager: true })

        let modules
        switch (lang) {
            case 'en':
                modules = import.meta.glob('../lang/json/en/*.json', { eager: true })
                break
            case 'de':
                modules = import.meta.glob('../lang/json/de/*.json', { eager: true })
                break
        }

        const messages = langFiles[`../lang/${lang}.json`] || {}

        for (const path in modules) {
            const regex = new RegExp(`../lang/json/${lang}/(.+)\\.json$`)
            const match = path.match(regex)
            if (match) {
                const prefix = match[1]
                const moduleMessages = modules[path].default
                for (const key in moduleMessages) {
                    messages.default[`${prefix}.${key}`] = moduleMessages[key]
                }
            }
        }

        return messages
    }
})
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
