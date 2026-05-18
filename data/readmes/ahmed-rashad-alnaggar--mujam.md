# Mujam - A Translation Manager

![I Stand With Palestine Badge](./arts/PalestineBadge.svg)

![I Stand With Palestine Banner](./arts/PalestineBanner.svg)

[![Latest Stable Version](https://img.shields.io/packagist/v/alnaggar/mujam)](https://packagist.org/packages/alnaggar/mujam)
[![Total Downloads](https://img.shields.io/packagist/dt/alnaggar/mujam)](https://packagist.org/packages/alnaggar/mujam)
[![License](https://img.shields.io/packagist/l/alnaggar/mujam)](https://packagist.org/packages/alnaggar/mujam)

**Mujam** is a Laravel translation management package that provides a flexible way to handle translations in your application. It supports various translation stores and allows for easy customization.

The name "**Mujam**" translates to "dictionary" or "lexicon" in Arabic, which reflects the purpose of the package as a translation management tool.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Laravel Translation Functions](#laravel-translation-functions)
- [Stores](#stores)
- [Caching](#caching)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Requirements

- PHP 7.3+
- Laravel 8+

## Installation

Install the package using Composer:

```bash
composer require alnaggar/mujam
```

Then, publish the configuration file:

```bash
php artisan vendor:publish --tag="mujam-config"
```

> [!NOTE]  
> If you intend to use the [database store](#database-store), publish the default migrations or create your own and update `config/mujam.php` accordingly.
>
> ```bash
> php artisan vendor:publish --tag="mujam-migrations"
> ```

## Configuration

The configuration file `config/mujam.php` contains the following keys:

- **default**: The default translation store.
- **stores**: The *enabled* translation stores, which include:
  - [database](#database-store)
  - [json](#json-store)
  - [mo](#mo-store)
  - [php](#php-store)
  - [po](#po-store)
  - [xliff](#xliff-store)
  - [yaml](#yaml-store)
  
  Refer to [creating custom store](#creating-custom-store) for guidance on supporting additional store types.

## Flat and Structured Stores

**Mujam** supports the two types of translation stores to suit different project needs:

1. **Flat Stores**: These stores use a simple key-value structure, ideal for straightforward translations. A common example is the [**JSON**](#json-store) store, where translations are stored in a flat format, making it easy to access and modify individual key-value pairs.

2. **Structured Stores**: These stores offer a more organized approach by supporting namespaces and groups, allowing for better organization and scalability. The [**PHP**](#php-store) store is a typical example, where translations are structured within files, grouped by namespace and language, providing a more modular and hierarchical way to manage translations.

## Usage

To integrate Mujam into your application, you can use its translation features through the facade or by utilizing the `mujam()` helper function.

You can call functions directly on the facade to interact with the default store, or use the `store()` method to target a specific store.

**Below are examples of how to utilize the facade functions:**

### Retrieving Translation

```php
$welcomeMessage = Mujam::store('php')->get(
    key: 'messages.welcome', 
    locale: 'en',
    fallback: true
);
```

Retrieve the translation for the specified `key` and `locale`, or `null` if not found.

If `locale` is `null`, the current application locale is used.

The `fallback` parameter controls fallback behavior:

- If a locale is provided, fallback to it.
- If `true` or `null`, fallback to application's fallback locale.
- If `false`, no fallback will be applied, using only translations from the specified `locale`.

Both flat and structured stores use the same function signature. Simply provide the translation `key` and the `locale` to get the translation for.

### Retrieving Translations

**For Flat Store**:

```php
$storeTranslations = Mujam::store('json')->getAll(
    locale: 'en',
    fallback: true
);
```

If `locale` is `null`, the current application locale is used.

The `fallback` parameter controls fallback behavior:

- If a locale is provided, fallback to it.
- If `true` or `null`, fallback to application's fallback locale.
- If `false`, no fallback will be applied, using only translations from the specified `locale`.

**For Structured Store**:

```php
$storeTranslations = Mujam::store('php')->getAll(
    group: 'messages',
    namespace: '*',
    locale: 'en',
    fallback: true
);
```

The `namespace` can be set to `*` to indicate the default namespace.

The `locale` parameter works the same as for the flat store.

The `fallback` parameter works the same as for the flat store.

### Adding Translations

**For Flat Store**:

```php
Mujam::store('json')->add(
    translations: ['Welcome to Mujam!' => 'Welcome to Mujam!'], 
    locale: 'en'
);
```

The `translations` are provided as an associative array, where keys are the translation keys and values are the corresponding translation strings.

The `locale` parameter determines for which locale the translations should be added:

- If `null`, translations are added to the current application locale.
- If `*`, translations are added to all available locales.
- If a specific locale is provided, translations are added to that locale.
- Multiple locales can also be specified, separated by `|`.

**For Structured Store**:

```php
Mujam::store('php')->add(
    translations: ['welcome' => 'Welcome to Mujam!'], 
    group: 'messages', 
    namespace: '*', 
    locale: 'en'
);
```

The `translations` parameter works the same as for the flat store.

The `namespace` can be set to `*` to indicate the default namespace.

The `locale` parameter works the same as for the flat store.

### Updating Translations

**For Flat Store**:

```php
Mujam::store('json')->update(
    translations: ['Welcome to Mujam!' => 'Welcome to the Translation Manager!'], 
    locale: 'en'
);
```

The `translations` are provided as an associative array, where keys are the translation keys and values are the corresponding translation strings.

The `locale` parameter specifies the locale for which translations should be updated:

- If `null`, translations are updated for the current application locale.
- If `*`, translations are updated for all available locales.
- If a specific locale is provided, translations are updated for that locale.
- Multiple locales can also be provided, separated by `|`.

**For Structured Store**:

```php
Mujam::store('php')->update(
    translations: ['welcome' => 'Welcome to the Translation Manager!'], 
    group: 'messages', 
    namespace: '*', 
    locale: 'en'
);
```

The `translations` parameter works the same as for the flat store.

The `namespace` can be set to `*` to indicate the default namespace.

The `locale` parameter works the same as for the flat store.

### Removing Translations

**For Flat Store**:

```php
Mujam::store('json')->remove(
    keys: ['Welcome to Mujam!'], 
    locale: 'en'
);
```

The `keys` parameter is an array of keys where each key represents a specific translation that will be removed.

The `locale` parameter specifies the locale for which translations should be removed:

- If `null`, the translations are removed from the current application locale.
- If `*`, the translations are removed from all available locales.
- If a specific locale is provided, translations are removed from that locale.
- Multiple locales can also be provided, separated by `|`.

**For Structured Store**:

```php
Mujam::store('php')->remove(
    items: ['welcome'], 
    group: 'messages', 
    namespace: '*', 
    locale: 'en'
);
```

The `items` parameter is an array of keys where each key represents a specific translation that will be removed.

The `namespace` can be set to `*` to indicate the default namespace.

The `locale` parameter works the same as for the flat store.

### Flushing Store

**For Flat Store**:

```php
Mujam::store('json')->flush(locale: '*');
```

The `locale` parameter specifies the locale for which translations should be removed:

- If `null`, all translations for the current application locale are removed.
- If `*`, all translations for all available locales are removed.
- If a specific locale is provided, all translations are removed for that locale.
- Multiple locales can also be provided, separated by `|`.

**For Structured Store**:

```php
Mujam::store('php')->flush(
    group: '*', 
    namespace: null, 
    locale: '*'
);
```

The `group` can be set to `*` to indicate all groups.

The `namespace` parameter specifies the namespace for which translations should be removed:

- If `null`, all translations for all namespaces are removed.
- If `*`, all translations for the default namespace are removed.
- If a specific namespace is provided, all translations are removed for that namespace.
- Multiple namespaces can also be provided, separated by `|`.

The `locale` parameter specifies the locale for which translations should be removed:

- If `null`, the translations are removed from the current application locale.
- If `*`, the translations are removed from all available locales.
- If a specific locale is provided, translations are removed from that locale.
- Multiple locales can also be provided, separated by `|`.

### Checking Translation Existence

```php
if (Mujam::store('php')->has(
    key: 'messages.welcome', 
    locale: 'en'
)) {
    // Translation exists
}
```

Check if a translation exists for the specified `key` and `locale`.

If `locale` is `null`, the current application locale is used.

Both flat and structured stores use the same function signature. Simply provide the translation `key` and the `locale` to check for the translation.

### Getting Store Structure

**For Flat Store**:

For retrieving an array of locales that have available translations:

```php
$storeLocales = Mujam::store('json')->getLocales();
```

**For Structured Store**:

For retrieving store structure:

```php
// Retrieves the store structure as an associative array with namespaces as the top-level keys, locales as the second-level keys, and groups as the third-level values.
$storeStructure = Mujam::store('php')->getStructure();
```

## Laravel Translation Functions

You can also use Laravel's `__` helper function or any other translation retrieval function, which will fetch translations from the provided and enabled stores.

```php
// Fetches the translation from the enabled stores.
$welcomeMessage = __('messages.welcome');

// Package translations continue to work as expected.
$packageTranslation = __('packageNamespace::group.item');
```

> [!NOTE]
> If multiple stores provide a translation for the same key, the last one defined will override the previous ones.

## Stores

### Database Store

- Driver: `database`
- Configuration:
  - `connection`: The database connection to use.
  - `table`: The table name to store translations in.
  - `columns`:
    - `namespace`: The column name for the translation namespace.
    - `group`: The column name for the translation group.
    - `item`: The column name for the translation item.
    - `locale`: The column name for the translation locale.
    - `value`: The column name for the translation value.
    - `created_at`: The column name for the translation created_at timestamp.
    - `updated_at`: The column name for the translation updated_at timestamp.

### JSON Store

- Driver: `json`
- Configuration:
  - `path`: A path or an array of paths from which JSON `translation` files are loaded and to which they are saved.
  - `flags`: A bitmask of flags to use when encoding JSON translations.

### MO Store

- Driver: `mo`
- Configuration:
  - `path`: A path or an array of paths from which MO translation files are loaded and to which they are saved.
  - `context_delimiter`: The delimiter to use when splitting context strings.
  - `plural_delimiter`: The delimiter to use when splitting plural strings.
  - `metadata`: An array of metadata to include in the MO files.

### PHP Store

- Driver: `php`
- Configuration:
  - `path`: A path or an array of paths from which PHP translation files are loaded and to which they are saved.

### PO Store

- Driver: `po`
- Configuration:
  - `path`: A path or an array of paths from which PO translation files are loaded and to which they are saved.
  - `context_delimiter`: The delimiter to use when splitting context strings.
  - `plural_delimiter`: The delimiter to use when splitting plural strings.
  - `metadata`: An array of metadata to include in the PO files.

### XLIFF Store

- Driver: `xliff`
- Configuration:
  - `path`: A path or an array of paths from which XLIFF translation files are loaded and to which they are saved.
  - `source_locale`: The source locale attribute to use in XLIFF files. Assigning `null` will use application's fallback locale.
  - `legacy`: Whether to use the XLIFF 1.2 (`true`) or XLIFF 2.0 format (`false`).

### YAML Store

- Driver: `yaml`
- Configuration:
  - `path`: A path or an array of paths from which YAML translation files are loaded and to which they are saved.
  - `dry`: Determines whether to generate anchors and aliases for similar **mappings** in the YAML structure.

### Creating Custom Store

You can register a new driver within the `boot` method of one of your application's service providers. To accomplish this, you should use the `extend` method of the `Mujam` facade:

```php
// Inside AppServiceProvider

public function boot()
{
    Mujam::extend(
        driver: 'customDriverName',
        resolver: function ($app, $config) {
            // return the custom store instance.
        }
    );
}
```

## Caching

**All** translation stores in **Mujam** support caching to improve performance and reduce repeated file or database reads.
Caching behavior is fully configurable through the `cache` key in each store’s configuration.

Caching can be customized per store to control how long translations remain valid, where they are stored, and how cache keys are organized.

**Example PHP cache configuration:**

```php
'stores' => [
    'php' => [
        'driver' => 'php',
        'path' => lang_path(),
        'cache' => [
            'enabled' => true,
            'store' => null, // Use application's default cache store
            'prefix' => 'mujam.php',
            'lifetime' => 9999999999, // Forever
        ],
    ],
]
```

Caching can be disabled by setting `enabled` to `false`, or by setting the entire `cache` key to `false`.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the GitHub repository.

## Credits

- Palestine banner and badge by [Safouene1](https://github.com/Safouene1/support-palestine-banner).

## License

**Mujam** is open-sourced software licensed under the [MIT license](LICENSE).
