# Artisan Translator for Laravel

**Artisan Translator** streamlines the localization workflow in Laravel applications. It automates the extraction of strings from Blade templates, translates them using Google's Gemini AI, and helps keep your language files clean by removing unused keys.

[![Tests](https://github.com/artryazanov/artisan-translator/actions/workflows/run-tests.yml/badge.svg)](https://github.com/artryazanov/artisan-translator/actions/workflows/run-tests.yml)
[![Coverage](.github/statuses/coverage.svg)](https://github.com/artryazanov/artisan-translator/actions/workflows/run-coverage.yml)
[![Pint](https://github.com/artryazanov/artisan-translator/actions/workflows/run-pint.yml/badge.svg)](https://github.com/artryazanov/artisan-translator/actions/workflows/run-pint.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/artryazanov/artisan-translator.svg?style=flat-square)](https://packagist.org/packages/artryazanov/artisan-translator)
[![Total Downloads](https://img.shields.io/packagist/dt/artryazanov/artisan-translator.svg?style=flat-square)](https://packagist.org/packages/artryazanov/artisan-translator)
[![PHP Version](https://poser.pugx.org/artryazanov/artisan-translator/require/php?style=flat-square)](https://packagist.org/packages/artryazanov/artisan-translator)
[![Laravel Version](https://img.shields.io/badge/Laravel-11%2F12-red?style=flat-square&logo=laravel)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

## Key Features

- **🔍 Automatic Extraction**: Scans Blade templates (`.blade.php`) for **raw text** wrapped in common helpers (e.g. `__('Hello')`), replaces them with translation keys, and saves the source strings to language files.
- **🤖 AI Translation**: Uses **Google Gemini** to translate your strings into multiple languages.
- **🚀 Batch Processing**: Translates strings in batches to optimize API usage and reduce costs/time.
- **🧹 Smart Cleanup**: Detects and removes translation keys that are no longer used in your codebase.
- **🛡️ Safe & Robust**: Preserves HTML tags and Laravel placeholders (`:name`, `{count}`) during translation. Includes retry mechanisms for API stability.

## Requirements

- **PHP**: 8.2 or higher
- **Laravel**: 11.0+ or 12.0+

## Installation

Install the package via Composer:

```bash
composer require --dev artryazanov/artisan-translator
```

The package will automatically register its service provider.

### Setup

1.  **Get a Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2.  **Configure Environment**: Add the key to your `.env` file:

    ```env
    GEMINI_API_KEY=your-api-key-here
    GEMINI_MODEL=gemma-3-27b-it
    ```

3.  **(Optional) Publish Configuration**: Customise default settings by publishing the config file:

    ```bash
    php artisan vendor:publish --provider="Artryazanov\ArtisanTranslator\ArtisanTranslatorServiceProvider" --tag="config"
    ```

## Usage

### 1. Extract Strings

Scan your `resources/views` directory to find static strings, replace them with translation keys in the Blade files, and save the original strings to your source language files (default: `en`).

```bash
php artisan translate:extract
```

**Options:**
- `--path=dir/name`: Limit scanning to a specific subdirectory within `resources/views`.
- `--dry-run`: Preview changes without modifying any files.
- `--force`: Overwrite existing keys in translation files if they overlap.

#### 📝 What strings are extracted?

The command scans for strings wrapped in `__('...')` or `@lang('...')`. It intelligently distinguishes between "plain text" that needs extraction and existing translation keys.

| String Type | Example | Action | Reason |
| :--- | :--- | :--- | :--- |
| **Plain Text** | `__('Hello World')` | ✅ **Extract** | Contains spaces or punctuation. |
| **Plain Text** | `@lang('Click here')` | ✅ **Extract** | Contains spaces. |
| **Existing Key** | `__('messages.welcome')` | ❌ **Ignore** | Looks like a key (dots, no spaces). |
| **Existing Key** | `@lang('auth.failed')` | ❌ **Ignore** | Looks like a key. |
| **Existing Key** | `__('forms/user.email')` | ❌ **Ignore** | Looks like a key (slashes allowed). |

### 2. Translate with AI

Translate your extracted strings from the source language to one or more target languages using Gemini.

```bash
php artisan translate:ai --targets=fr --targets=de
```

**Arguments & Options:**
- `source` (optional): Specify source language (defaults to `source_language` in config, usually `en`).
- `--targets`: **Required**. The target language code(s) (e.g., `fr`, `es`, `de`). Can be repeated.
- `--force`: Overwrite existing translations in the target files.

> **Note**: If you have `mcamara/laravel-localization` installed, the package can automatically detect supported locales if you omit `--targets`.

### 3. Cleanup Unused Translations

Keep your language files tidy by removing keys that are no longer referenced in your codebase.

```bash
php artisan translations:cleanup --dry-run
```

**Options:**
- `--dry-run`: List unused keys without deleting them (Recommended first step).
- `--force`: Skip the confirmation prompt and delete immediately.

## Configuration

### Main Config (`config/artisan-translator.php`)

| Option | Env Variable | Default | Description |
| :--- | :--- | :--- | :--- |
| `source_language` | `ARTISAN_TRANSLATOR_SOURCE_LANG` | `en` | The source language of your application. |
| `lang_root_path` | `ARTISAN_TRANSLATOR_LANG_ROOT` | `blade` | Subdirectory under `resources/lang/{locale}` where files are stored. |
| `ai_request_delay_seconds` | `ARTISAN_TRANSLATOR_AI_DELAY` | `2.0` | Minimum delay between AI API requests to avoid rate limits. |
| `gemini.api_key` | `GEMINI_API_KEY` | - | Your Google Gemini API Key. |
| `gemini.model` | `GEMINI_MODEL` | `gemma-3-27b-it` | The AI model to use. |

### Cleaner Config (`config/translation-cleaner.php`)

- **`scan_paths`**: Directories to scan for translation usage (defaults to `app_path()` and `resource_path('views')`).
- **`file_extensions`**: File types to scan (defaults to `*.php`, `*.blade.php`).
- **`translation_functions`**: Functions to look for (e.g., `__`, `trans`, `@lang`).

## Supported AI Models

You can use any string supported by the Gemini API, or one of the built-in Enum values:

- `gemini-3.0-pro`
- `gemini-3.0-flash`
- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemma-3-27b-it` (Default)

## Testing

Run the test suite to ensure everything is working correctly:

```bash
composer test
```

## License

MIT. See [LICENSE](LICENSE).
