# Laravel I18n

<br>
<p align="center"><img src="./repo/banner.png" /></p>
<br>

<p align="center">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/beliven-it/laravel-i18n.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-i18n)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-i18n/run-tests.yml?branch=main&label=tests&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-i18n/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-i18n/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-i18n/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/beliven-it/laravel-i18n.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-i18n)

</p>

A powerful Laravel package for managing translations with ease. Scan your codebase for translation keys, export them to Excel for translators, and import them back seamlessly. Supports both PHP array files and JSON translations.

## Installation

You can install the package via composer:

```bash
composer require beliven-it/laravel-i18n
```

## Features

- 🔍 **Scan** - Automatically scan your codebase for translation keys (`__()`, `trans()`, `@lang()`)
- 📤 **Export** - Export all translations to Excel format for easy editing by translators
- 📥 **Import** - Import translations back from Excel with merge or overwrite modes
- 🌐 **Dual Format Support** - Handles both PHP array files and JSON translations
- 🎯 **Smart Detection** - Automatically distinguishes between structured (PHP) and simple (JSON) translations
- 📊 **Excel Integration** - Uses PhpSpreadsheet for reliable Excel file handling

## How It Works

The package intelligently handles two types of translations:

### PHP Array Files (Structured Translations)
Keys with dots are stored in PHP array files with nested structure:
```php
__('messages.welcome')        // → lang/en/messages.php
__('clinic/detail.title')     // → lang/en/clinic/detail.php
```

### JSON Files (Simple String Translations)
Keys without dots are stored in JSON files:
```php
__('Welcome')                 // → lang/en.json
__('My Translation')          // → lang/en.json
```

## Usage

### Scanning for Translation Keys

Scan your application code to find all translation keys:

```bash
# Scan and add missing keys to all locales
php artisan i18n:manage scan

# Scan for a specific locale only
php artisan i18n:manage scan --locale=en
```

The scanner will:
- Find all `__()`, `trans()`, and `@lang()` calls in your code
- Create appropriate translation files (PHP or JSON)
- Add missing keys to existing files
- Show a summary of created files and added keys

**Example output:**
```
Scanning for translation keys...
  ✓ Created en/messages.php -> welcome
  + Added en/clinic.php -> detail.title
  
Scan complete!
┌────────────────────────┬───────┐
│ Metric                 │ Count │
├────────────────────────┼───────┤
│ Total keys found       │ 45    │
│ Files created          │ 2     │
│ Keys added             │ 12    │
│ Keys already existing  │ 33    │
└────────────────────────┴───────┘
```

### Exporting Translations

Export all translations to an Excel file for translators:

```bash
# Export to default location (storage/app/translations.xlsx)
php artisan i18n:manage export

# Export to custom location
php artisan i18n:manage export --output=/path/to/translations.xlsx
```

The Excel file will contain:
- **Locale** - The language code (en, it, fr, etc.)
- **Path** - The file path (lang/en/messages.php or lang/en.json)
- **Key** - The translation key
- **Value** - The translation value

### Importing Translations

Import translations back from Excel:

```bash
# Import with merge mode (default - keeps existing translations)
php artisan i18n:manage import --input=/path/to/translations.xlsx

# Import with overwrite mode (replaces entire files)
php artisan i18n:manage import --input=/path/to/translations.xlsx --overwrite
```

**Example output:**
```
Importing translations from: /path/to/translations.xlsx (mode: merge)

Import complete!
┌────────────────┬───────┐
│ Metric         │ Count │
├────────────────┼───────┤
│ Files created  │ 1     │
│ Keys added     │ 15    │
│ Keys updated   │ 8     │
└────────────────┴───────┘
```

### Programmatic Usage

You can also use the services directly in your code:

#### Scanning

```php
use Beliven\I18n\Services\TranslationScanner;
use Beliven\I18n\Services\TranslationFileManager;

$scanner = app(TranslationScanner::class);
$fileManager = app(TranslationFileManager::class);

// Scan for translation keys
$foundKeys = $scanner->scan(['app', 'resources']);

// Parse a key to determine its type
$parsed = $scanner->parseKey('messages.welcome');
// Returns: ['type' => 'php', 'file' => 'messages', 'key' => 'welcome']

$parsed = $scanner->parseKey('Welcome');
// Returns: ['type' => 'json', 'file' => null, 'key' => 'Welcome']
```

#### Managing Translation Files

```php
use Beliven\I18n\Services\TranslationFileManager;

$manager = app(TranslationFileManager::class);

// PHP files
$manager->addKey('en', 'messages', 'welcome', 'Welcome!');
$translations = $manager->loadFile('en', 'messages');

// JSON files
$manager->addJsonKey('en', 'Welcome', 'Welcome!');
$jsonTranslations = $manager->loadJsonFile('en');
```

#### Exporting

```php
use Beliven\I18n\Services\TranslationExporter;

$exporter = app(TranslationExporter::class);
$result = $exporter->export('/path/to/output.xlsx');

// Returns:
// [
//     'locales' => 3,
//     'rows' => 150,
//     'file' => '/path/to/output.xlsx'
// ]
```

#### Importing

```php
use Beliven\I18n\Services\TranslationImporter;

$importer = app(TranslationImporter::class);

// Merge mode
$stats = $importer->import('/path/to/input.xlsx', false);

// Overwrite mode
$stats = $importer->import('/path/to/input.xlsx', true);

// Returns:
// [
//     'files_created' => 2,
//     'keys_added' => 25,
//     'keys_updated' => 10
// ]
```

## Workflow Example

Here's a typical workflow for managing translations:

1. **Develop** - Write your code using translation functions:
   ```php
   echo __('Welcome');                    // Simple string
   echo __('messages.greeting', ['name' => $user->name]);  // Structured
   ```

2. **Scan** - Find all translation keys in your codebase:
   ```bash
   php artisan i18n:manage scan
   ```

3. **Export** - Export to Excel for your translators:
   ```bash
   php artisan i18n:manage export --output=translations.xlsx
   ```

4. **Translate** - Send the Excel file to translators

5. **Import** - Import the translated file back:
   ```bash
   php artisan i18n:manage import --input=translated.xlsx
   ```

6. **Done** - Your application now has all translations!

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/beliven-it/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](https://github.com/beliven-it/.github/blob/main/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Fabrizio Gortani](https://github.com/beliven-it)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
