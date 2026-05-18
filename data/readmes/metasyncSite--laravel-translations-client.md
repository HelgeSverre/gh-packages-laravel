# Laravel Translations Client

A Laravel package for syncing translations between your application and a [Translation Manager](https://github.com/metasyncsite/translation-manager) instance.

## Requirements

- PHP 8.2+
- Laravel 11, 12, or 13

## Installation

```bash
composer require metasyncsite/laravel-translations-client
```

Publish the config file:

```bash
php artisan vendor:publish --tag=translations-client-config
```

## Configuration

Add the following to your `.env` file:

```env
TRANSLATIONS_URL=https://translations.yourapp.com
TRANSLATIONS_TOKEN=your-api-token
```

The API token is generated in Translation Manager under **API Tokens**. Each token is scoped to a project — all pushes go to that project.

Full config reference (`config/translations-client.php`):

```php
return [
    'url'          => env('TRANSLATIONS_URL'),
    'token'        => env('TRANSLATIONS_TOKEN'),

    // Defaults to Laravel's lang_path(). Override if your lang files live elsewhere.
    'lang_path'    => null,

    // File names to exclude from push (without locale prefix).
    // e.g. ['validation.php', 'passwords.php']
    'exclude_files' => [],

    // Whether to overwrite existing translations on push.
    'overwrite'    => true,
];
```

## Usage

### Push translations

Reads your local `lang/` directory and uploads translations to Translation Manager.

```bash
# Push all locales
php artisan translations:push

# Push a single locale
php artisan translations:push --locale=en

# Force-overwrite existing translations
php artisan translations:push --overwrite

# Preview what would be sent (no HTTP request)
php artisan translations:push --dry-run
```

### Pull translations

Downloads translations from Translation Manager and writes them into your `lang/` directory.

```bash
# Pull all locales
php artisan translations:pull

# Pull a single locale
php artisan translations:pull --locale=fr

# Write as JSON files instead of PHP arrays
php artisan translations:pull --format=json

# Preview what would be written (no files touched)
php artisan translations:pull --dry-run
```

## How it works

**Push** reads all PHP translation files (`lang/{locale}/*.php`) and JSON files (`lang/{locale}.json`), flattens nested keys to dot-notation, then posts them to the Translation Manager API.

**Pull** fetches all translations from Translation Manager and writes them back as PHP arrays (default) or JSON files into your `lang/` directory.

## License

MIT
