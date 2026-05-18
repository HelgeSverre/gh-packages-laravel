# Localization for Laravel

[![Latest Stable Version](https://poser.pugx.org/smmahfujurrahman/localization/v)](https://packagist.org/packages/smmahfujurrahman/localization)
[![Total Downloads](https://poser.pugx.org/smmahfujurrahman/localization/downloads)](https://packagist.org/packages/smmahfujurrahman/localization)
[![License](https://poser.pugx.org/smmahfujurrahman/localization/license)](https://packagist.org/packages/smmahfujurrahman/localization)

A Laravel package that provides three Artisan commands to fully automate your translation workflow:

| Command | What it does |
|---|---|
| `localization:extract` | Scans all Blade files for `__()` / `@lang()` calls and extracts keys to a JSON file. Optionally auto-translates via Google Translate. |
| `localization:wrap` | Scans all Blade files and wraps un-translated static text with `__()` automatically. |
| `localization:sort` | Sorts any translation JSON file alphabetically by key. |

---

## Requirements

- PHP **8.1+**
- Laravel **10, 11, or 12**
- Internet connection (for `localization:extract` with a target language)

---

## Installation

```bash
composer require smmahfujurrahman/localization
```

Laravel auto-discovers the service provider. No manual registration needed.

---

## Publish Configuration (Recommended)

```bash
php artisan vendor:publish --tag=localization-config
```

This creates `config/localization.php` where you can customise all paths and settings:

```php
return [
    // Directory scanned by localization:wrap (default: resources/views)
    'views_path' => resource_path('views'),

    // Directory used by localization:extract and localization:sort
    // null = auto-detect (/lang on Laravel 9+, /resources/lang on older)
    'lang_path' => null,

    // Microsecond delay between Google Translate API calls (default: 100ms)
    'translate_delay' => 100000,

    // Backup directory prefix for localization:wrap (null = auto-generate)
    'backup_path' => null,

    // Filename for the empty key template (no language argument)
    'template_filename' => 'template_empty.json',

    // Source language for Google Translate (null = auto-detect)
    'source_language' => 'en',
];
```

---

## Usage

### `localization:extract` — Extract & Auto-Translate

Scan all Blade views and extract every `__('...')` and `@lang('...')` key into a JSON file.

```bash
# Create an empty template (lang/template_empty.json)
php artisan localization:extract

# Auto-translate to French (creates lang/fr.json)
php artisan localization:extract fr

# Auto-translate to Arabic
php artisan localization:extract ar

# Auto-translate to Bengali
php artisan localization:extract bn

# Auto-translate to German
php artisan localization:extract de
```

**Smart re-run:** If a target language file already exists, keys that already have a translation are preserved — only new/missing keys are translated. You can re-run safely without overwriting manual edits.

---

### `localization:wrap` — Wrap Un-Translated Text

Automatically find static English text in your Blade files and wrap it with `__()`.

```bash
# Always preview first!
php artisan localization:wrap --dry-run

# Apply changes to all Blade files
php artisan localization:wrap
```

A timestamped backup of your views directory is created automatically before any files are modified.

**Handles 21 patterns including:**
- Simple tag text: `<p>Dashboard</p>` → `<p>{{ __('Dashboard') }}</p>`
- Dynamic variables: `<span>{{ $type }} Management</span>` → `<span>{{ __(':type Management', ['type' => $type]) }}</span>`
- HTML attributes: `placeholder`, `title`, `alt`, `label`
- Fallback values: `{{ $var ?? 'Default' }}` → `{{ $var ?? __('Default') }}`
- Button text, long paragraphs, emoji text, and more

---

### `localization:sort` — Sort a Translation File

Sort any JSON translation file alphabetically by key for easier management.

```bash
php artisan localization:sort ar.json
php artisan localization:sort fr.json
php artisan localization:sort en.json
```

---

## Typical Workflow

```bash
# Step 1: Wrap any un-translated text in your Blade files (dry run first)
php artisan localization:wrap --dry-run
php artisan localization:wrap

# Step 2: Extract all translation keys
php artisan localization:extract

# Step 3: Auto-translate to your target languages
php artisan localization:extract ar
php artisan localization:extract fr
php artisan localization:extract bn

# Step 4: Sort the files for easier management
php artisan localization:sort ar.json
php artisan localization:sort fr.json
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributor

<p align="center">
  <a href="https://github.com/MahfujuRahman">
    <img src="https://github.com/MahfujuRahman.png" width="130" style="border-radius:50%; box-shadow: 0px 0px 15px rgba(0,0,0,0.2);">
  </a>
</p>

<p align="center">
  <a href="https://github.com/MahfujuRahman">
    <img src="https://img.shields.io/badge/S._M._Mahfujur_Rahman-Software_Engineer-0f172a?style=for-the-badge&logoColor=white" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/MahfujuRahman">
     <img src="https://img.shields.io/badge/dynamic/json?label=Organization&query=$.company&url=https%3A%2F%2Fapi.github.com%2Fusers%2FMahfujuRahman&color=0d9488&style=for-the-badge&logo=github&logoColor=white">
  </a>
  <a href="https://github.com/MahfujuRahman">
    <img src="https://img.shields.io/badge/Profile-View_Contributor-10b981?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

---

## Support

For support and questions:
- 📧 Email: mahfujur.dev@gmail.com