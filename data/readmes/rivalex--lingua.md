<div align="center">

<a href="https://rivalex.github.io/lingua-docs/" target="_blank" style="margin: 30px 0 50px !important;">
<figure>
<img src="resources/images/logoLinguaHorizzontal.svg" alt="Lingua Logo" width="500">
</figure>
</a>

---

### **The complete multilingual management system for Laravel**

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rivalex/lingua.svg)](https://packagist.org/packages/rivalex/lingua)
[![PHP Version](https://img.shields.io/badge/PHP-8.3%2B-blue)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-11--13-orange)](https://laravel.com)
[![License](https://img.shields.io/github/license/rivalex/lingua)](LICENSE.md)
[![codecov](https://codecov.io/github/rivalex/lingua/branch/main/graph/badge.svg?token=9RKRB8AYD6)](https://codecov.io/github/rivalex/lingua)
[![Tests](https://github.com/rivalex/lingua/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rivalex/lingua/actions/workflows/run-tests.yml)

Lingua brings **database-driven translations** to Laravel with a beautiful Livewire + Flux UI — install languages,
manage translations, and sync everything with a single command.

[Features](#-features) · [Installation](#-installation) · [Configuration](#-configuration) · [Artisan Commands](#-artisan-commands) · [Publishing](#-publishing) · [UI Guide](#-ui-guide) · [Facade](#-lingua-facade) · [Architecture](#-architecture)

</div>

---

<div align="center">

## [Official Documentation](https://rivalex.github.io/lingua-docs/)

</div>

---

## ✨ Features

| Feature                          | Description                                                                                                    |
|----------------------------------|----------------------------------------------------------------------------------------------------------------|
| **Database-backed translations** | All translations stored in the database, editable instantly without deployments                                |
| **Livewire UI**                  | Reactive, real-time language and translation management interface                                              |
| **Flux UI components**           | Modern, accessible UI built with Livewire Flux                                                                 |
| **Bi-directional sync**          | Push translations to the database or pull them back to local PHP/JSON files                                    |
| **Laravel Lang integration**     | Install 70+ languages with one command, auto-updated via `laravel-lang`                                        |
| **Rich text support**            | Translations can be plain text, HTML, or Markdown                                                              |
| **Language selector**            | Configurable sidebar, dropdown, modal, or headless language switcher for users                                 |
| **Translation statistics**       | Per-language coverage with progress bars, group breakdown, and missing-key drill-down                          |
| **DB-persisted settings**        | Selector mode and flag display managed from the UI — no config file changes needed                             |
| **Headless language selector**   | Zero-CSS semantic HTML component for full styling freedom with any CSS framework                               |
| **Progress tracking**            | Per-language completion percentage and missing-translation counts                                              |
| **RTL support**                  | First-class right-to-left language handling                                                                    |
| **Vendor translations**          | Manage package translations alongside your own                                                                 |
| **Database-agnostic**            | Full support for SQLite, MySQL, PostgreSQL, and SQL Server                                                     |
| **Lingua Facade**                | Fluent programmatic API for reading, writing, and managing languages and translations                          |
| **Fully tested**                 | 440+ tests with Pest, covering commands, Livewire components, Blade components, helpers, and the Lingua facade |
| **Documentation**                | Comprehensive documentation and guides available at [Lingua Docs](https://rivalex.github.io/lingua-docs/)      |

---

## 📦 Requirements

- PHP **8.3+**
- Laravel **11 | 12 | 13**
- Livewire **4.0+**
- Livewire Flux **2.0+**

---

## 🚀 Installation

### 1. Install via Composer

```bash
composer require rivalex/lingua
```

### 2. Run the interactive installer

```bash
php artisan lingua:install
```

The installer will:

- Publish the configuration file to `config/lingua.php`
- Publish and run the database migrations
- Seed the database with your default language and its translations
- Optionally star the repo on GitHub ⭐

That's it — Lingua is ready.

### 3. Access the UI

| Page         | URL                                           | Route name            |
|--------------|-----------------------------------------------|-----------------------|
| Languages    | `your-app.test/lingua/languages`              | `lingua.languages`    |
| Translations | `your-app.test/lingua/translations/{locale?}` | `lingua.translations` |
| Statistics   | `your-app.test/lingua/statistics`             | `lingua.statistics`   |
| Settings     | `your-app.test/lingua/settings`               | `lingua.settings`     |

---

## ⚙️ Configuration

After installation, `config/lingua.php` gives you full control:

```php
return [
    // Directory where local language files are stored
    'lang_dir' => lang_path(),

    // Application default locale
    'default_locale' => config('app.locale', 'en'),

    // Fallback locale when a translation is missing
    'fallback_locale' => config('app.fallback_locale', 'en'),

    // Middleware applied to Lingua's routes
    'middleware' => ['web'],

    // URL prefix for Lingua's management pages
    'routes_prefix' => 'lingua',

    // Session key used to store the active locale
    'session_variable' => 'locale',

    // Language selector widget settings
    'selector' => [
        'mode'       => 'sidebar',   // 'sidebar' | 'modal' | 'dropdown'
        'show_flags' => true,
    ],

    // Rich-text editor toolbar options
    'editor' => [
        'headings'      => false,
        'bold'          => true,
        'italic'        => true,
        'underline'     => true,
        'strikethrough' => false,
        'subscript'     => true,
        'superscript'   => true,
        'blockquote'    => false,
        'code-line'     => false,
        'code-block'    => false,
        'bullet'        => true,
        'ordered'       => true,
        'clear'         => true,
        'code-mode'     => false,
    ],
];
```

---

## 🛠 Artisan Commands

Lingua ships with a complete command suite for terminal-driven language and translation management.

### Language management

| Command                  | Description                                                                    |
|--------------------------|--------------------------------------------------------------------------------|
| `lingua:add {locale}`    | Install a new language: downloads files, creates DB record, syncs translations |
| `lingua:remove {locale}` | Remove a language: deletes files, cleans DB, reorders remaining languages      |
| `lingua:update-lang`     | Update all installed language files via Laravel Lang, then re-sync to database |

```bash
# Add Italian
php artisan lingua:add it

# Add Brazilian Portuguese
php artisan lingua:add pt_BR

# Remove French (the default language is protected)
php artisan lingua:remove fr

# Pull the latest translation strings from Laravel Lang and sync to DB
php artisan lingua:update-lang
```

### Translation sync

| Command                   | Description                                                   |
|---------------------------|---------------------------------------------------------------|
| `lingua:sync-to-database` | Import all local PHP/JSON translation files into the database |
| `lingua:sync-to-local`    | Export all database translations back to local PHP/JSON files |

```bash
# Populate the database from existing lang/ files (e.g. after a fresh install)
php artisan lingua:sync-to-database

# Write database translations to lang/ files (e.g. for version control or deployment)
php artisan lingua:sync-to-local
```

### Install command

```bash
# Interactive first-time setup wizard
php artisan lingua:install
```

---

## 📤 Publishing

Lingua ships several publishable groups so you can override only what you need.

### Publish everything at once

```bash
php artisan vendor:publish --provider="Rivalex\Lingua\LinguaServiceProvider"
```

### Publish individual tags

#### `lingua-config`

Publishes the configuration file to `config/lingua.php`.

```bash
php artisan vendor:publish --tag="lingua-config"
```

Use this when you want to customise routes, middleware, the language selector mode, the rich-text editor toolbar, or any
other package option. The file is well-commented and safe to edit — Lingua reads it on every request.

---

#### `lingua-migrations`

Publishes the database migrations to `database/migrations/`.

```bash
php artisan vendor:publish --tag="lingua-migrations"
```

Use this when you need to modify the `languages`, `language_lines`, or `lingua_settings` table schema — for example to
add indexes, change column types, or integrate with an existing translations table. After publishing, run
`php artisan migrate` as normal.

> **Note:** The `lingua:install` wizard publishes and runs the migrations automatically. Only publish manually if you
> need to customise the schema before running them.

---

#### `lingua-translations`

Publishes the package's own UI translation strings to `lang/vendor/lingua/`.

```bash
php artisan vendor:publish --tag="lingua-translations"
```

This exposes all the labels, headings, buttons, and messages used in the Lingua UI (e.g.
`lingua::lingua.languages.title`, `lingua::lingua.translations.save`). Override any string to translate the interface
into your application's language or to adapt the wording to your project's style.

The published files follow the standard Laravel vendor translation structure:

```
lang/
└── vendor/
    └── lingua/
        └── en/
            └── lingua.php
```

---

#### `lingua-views`

Publishes all Blade and Livewire views to `resources/views/vendor/lingua/`.

```bash
php artisan vendor:publish --tag="lingua-views"
```

Use this to customise the look and layout of the Languages page, Translations page, individual translation rows, modals,
or the language selector component. Laravel will use your published views instead of the package's defaults.

The full view tree is:

```
resources/views/vendor/lingua/
├── components/               # Blade anonymous components
│   ├── autocomplete.blade.php
│   ├── clipboard.blade.php
│   ├── editor.blade.php
│   ├── language-flag.blade.php
│   ├── menu-group.blade.php
│   └── message.blade.php
└── livewire/                 # Livewire component views
    ├── languages.blade.php
    ├── language-selector.blade.php
    ├── translations.blade.php
    └── translation/
        ├── create.blade.php
        ├── delete.blade.php
        ├── row.blade.php
        └── update.blade.php
```

> **Tip:** Only publish views you intend to change. Unpublished views are served directly from the package and will
> receive upstream updates automatically.

---

### Re-publishing after upgrades

After updating Lingua via Composer, re-publish any tags that may have changed:

```bash
# Force-overwrite previously published translations
php artisan vendor:publish --tag="lingua-translations" --force
```

The `--force` flag overwrites existing files. Omit it for views and config so your local customisations are not lost.

> **Note:** Compiled CSS and JavaScript assets are served directly from the package via Lingua's own asset route.
> Publishing assets to `public/` is not required and the `lingua-assets` tag is no longer supported.
> If you previously published assets, you can safely delete `public/vendor/lingua/` from your project.

---

## 🖥 UI Guide

### Languages page — `/lingua/languages`

The languages page is your control center for installed locales.

**Available actions:**

- **Add a language** — choose from 70+ locales; files are installed and translations synced automatically
- **Remove a language** — confirmation modal prevents accidental deletion; the default language is protected
- **Set the default language** — one click sets the new application default
- **Reorder languages** — drag-and-drop to control display order across the UI
- **Sync to database** — import all local `lang/` files into the database
- **Sync to local** — export database translations back to `lang/` files
- **Update via Laravel Lang** — pull the latest strings from upstream `laravel-lang` packages

Each language row shows the **completion percentage** and a count of **missing translations** so you can prioritise your
translation effort.

### Translations page — `/lingua/translations/{locale?}`

Manage individual translation strings with a filterable, paginated table.

**Available actions:**

- **Search** by key, group, or value
- **Filter** by locale, group, or translation type (text / HTML / Markdown)
- **Show only missing** translations for a locale to focus your translation work
- **Create** new custom translation entries
- **Edit** any string inline — the rich-text editor activates automatically for HTML and Markdown types
- **Delete** translations globally or for a specific locale only
- **Copy** the translation key to clipboard with one click

### Statistics page — `/lingua/statistics`

The statistics page gives you a bird's-eye view of your translation coverage.

**What it shows:**

- **Per-language coverage** — progress bar for each installed locale with the percentage of translated keys and a count of missing ones
- **Group breakdown** — table showing how many keys are translated per locale across each translation group
- **Missing-key drill-down** — click the missing count for any language to expand a list of untranslated keys with direct links to the translation editor
- **Vendor toggle** — include or exclude vendor translations from all statistics with a single switch

Link to the page from anywhere in your application:

```blade
<a href="{{ route('lingua.statistics') }}">Translation Statistics</a>
```

---

### Settings page — `/lingua/settings`

The settings page lets you configure Lingua's UI behaviour without touching config files or redeploying.

**What you can configure:**

- **Selector mode** — choose between `sidebar`, `modal`, `dropdown`, or `headless`
- **Flag icons** — toggle the display of country flag icons next to language names in the selector

Settings are stored in the `lingua_settings` database table and take effect immediately. Values from `config/lingua.php` continue to serve as the fallback when no database setting has been saved yet — no changes to your config file are required.

```blade
<a href="{{ route('lingua.settings') }}">Lingua Settings</a>
```

---

### RTL / LTR text direction

Some languages (Arabic, Hebrew, Persian, Urdu, …) are written right-to-left. Lingua stores the text direction for every
installed language and exposes it via `Lingua::getDirection()`. To support RTL layouts correctly you need to propagate
the direction to the root `<html>` tag so that the browser, CSS, and screen readers all behave correctly.

Add `dir` and `lang` attributes to the `<html>` element in your main Blade layout:

```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ Lingua::getDirection() }}">
```

`Lingua::getDirection()` returns `'rtl'` for right-to-left languages and `'ltr'` for all others. It uses the **current
application locale** by default, so it automatically follows every locale switch without any extra code.

You can also pass an explicit locale when you need the direction outside of the current request context:

```blade
{{-- e.g. inside a per-language preview or email template --}}
<html lang="ar" dir="{{ Lingua::getDirection('ar') }}">
```

#### Tailwind CSS

If your project uses Tailwind CSS, the `dir` attribute on `<html>` activates Tailwind's built-in `rtl:` variant
automatically — no additional configuration required:

```html

<div class="text-left rtl:text-right">…</div>
<div class="pl-4 rtl:pr-4 rtl:pl-0">…</div>
```

#### CSS logical properties (recommended)

For new layouts, prefer CSS logical properties over directional ones so the browser handles the flip for you:

```css
/* Instead of: padding-left / padding-right */
padding-inline-start: 1 rem; /* left in LTR, right in RTL */
padding-inline-end: 1 rem; /* Instead of: border-left */
border-inline-start: 1px solid;
```

#### Checking direction in Blade

```blade
@if (Lingua::getDirection() === 'rtl')
    {{-- RTL-specific markup or classes --}}
@endif
```

> **Note:** `Lingua::getDirection()` defaults to `'ltr'` if the locale is not found in the database, so it is always
> safe to call even before any language is installed.

---

### Language selector component

Embed a language switcher anywhere in your Blade layouts:

```blade
<livewire:lingua::language-selector />
```

Control the display mode via config or inline props:

```blade
{{-- sidebar (default), dropdown, or modal --}}
<livewire:lingua::language-selector mode="dropdown" :show-flags="false" />
```

> **Note:** To show or hide the language flags, set the `lingua.show_flags` config option to `true` or `false`.
> Alternatively, use the `:show-flags` prop to override the config setting for a specific instance.

#### Headless mode

The headless selector renders zero CSS and no framework-specific markup — just semantic HTML that you style entirely with your own CSS or utility classes. Use it when you want full control over the language switcher's appearance.

**Basic usage:**

```blade
<livewire:lingua::headless-language-selector />
```

The list is always present in the DOM. Show/hide it with CSS or Alpine.js `x-show` — no built-in trigger is provided by design.

**Named slots:**

Override the default button markup inside each language item using the `$item` slot, which receives the `Language` model:

```blade
<livewire:lingua::headless-language-selector>
    <x-slot:item="language">
        {{ $language->native }} ({{ $language->code }})
    </x-slot>
</livewire:lingua::headless-language-selector>
```

Override the rendering of the **currently selected** language with the `$current` slot (falls through to `$item` if not provided):

```blade
<livewire:lingua::headless-language-selector>
    <x-slot:current="language">
        <strong>{{ $language->native }}</strong>
    </x-slot>
    <x-slot:item="language">
        {{ $language->native }}
    </x-slot>
</livewire:lingua::headless-language-selector>
```

**CSS targeting API (`data-lingua-*` attributes):**

| Attribute              | Element                              |
|------------------------|--------------------------------------|
| `data-lingua-selector` | Root `<nav>` element                 |
| `data-lingua-list`     | The `<ul>` language list             |
| `data-lingua-item`     | Each `<li>` language entry           |
| `data-lingua-active`   | The `<li>` of the active language    |
| `data-lingua-button`   | The `<button>` inside each `<li>`    |
| `data-lingua-name`     | Language English display name `<span>` |
| `data-lingua-native`   | Language native name `<span>`        |
| `data-lingua-code`     | Language ISO code `<span>`           |

**Plain CSS example:**

```css
[data-lingua-selector] { display: flex; gap: 0.5rem; }
[data-lingua-item] { cursor: pointer; }
[data-lingua-active] { font-weight: bold; }
```

**Tailwind CSS example:**

```blade
<livewire:lingua::headless-language-selector>
    <x-slot:item="language">
        <span class="px-3 py-1 rounded hover:bg-gray-100">
            {{ $language->native }}
        </span>
    </x-slot>
</livewire:lingua::headless-language-selector>
```

---

## 💎 Lingua Facade

Lingua ships a static `Lingua` facade that gives you programmatic access to language and translation data from anywhere
in your application.

### Locale helpers

```php
use Rivalex\Lingua\Facades\Lingua;

// Current application locale (mirrors app()->getLocale())
Lingua::getLocale();          // 'en'

// Locale marked as default in the database
Lingua::getDefaultLocale();   // 'en'

// Check whether a locale is the default
Lingua::isDefaultLocale();          // true  — uses current app locale
Lingua::isDefaultLocale('fr');      // false

// Check whether a locale is installed
Lingua::hasLocale('fr');      // true / false

// Change the default locale (persisted in the database)
Lingua::setDefaultLocale('fr');
```

### Language metadata

```php
// English display name for a locale
Lingua::getLocaleName();          // 'English'  — uses current locale
Lingua::getLocaleName('fr');      // 'French'

// Native name
Lingua::getLocaleNative();        // 'English'
Lingua::getLocaleNative('ar');    // 'العربية'

// Text direction
Lingua::getDirection();           // 'ltr'
Lingua::getDirection('ar');       // 'rtl'
```

### Language collections

```php
// All installed languages (Eloquent Collection)
Lingua::languages();

// All languages with completion statistics
// Each model includes: total_strings, translated_strings, missing_strings, completion_percentage
Lingua::languagesWithStatistics();
```

### Translation statistics

```php
// Stats for a specific locale (or current locale if omitted)
Lingua::getLocaleStats('fr');
// [
//   'total'      => 1240,
//   'translated' => 980,
//   'missing'    => 260,
//   'percentage' => 79.03,
// ]
```

### Reading translations

```php
// All locale variants for a key (returns ?array)
Lingua::getTranslations('welcome');
// ['en' => 'Welcome', 'fr' => 'Bienvenue', 'de' => 'Willkommen']

// Single locale value (empty string if missing)
Lingua::getTranslation('welcome');           // uses current locale
Lingua::getTranslation('welcome', 'fr');     // 'Bienvenue'

// All translations for a group, optionally filtered to a locale
Lingua::getTranslationByGroup('validation');
Lingua::getTranslationByGroup('validation', 'fr'); // only rows that have a French value

// Raw Eloquent collection
Lingua::translations();
```

### Writing & deleting translations

```php
// Set a translation value (creates or updates; uses current locale if omitted)
Lingua::setTranslation('welcome', 'Bienvenue', 'fr');
Lingua::setTranslation('welcome', 'Welcome');          // current locale

// Remove a locale's value from a translation key
// If the locale is the default, the entire record is deleted
Lingua::forgetTranslation('welcome', 'fr');
Lingua::forgetTranslation('welcome');                  // current locale
```

### Language lifecycle

```php
// Install language files for a locale via laravel-lang (lang:add)
Lingua::addLanguage('fr');

// Remove language files for a locale via laravel-lang (lang:rm --force)
Lingua::removeLanguage('fr');
```

> **Note:** `addLanguage()` and `removeLanguage()` only manage language files on disk. Database records (Language model)
> and translation rows are handled separately — use the Artisan commands `lingua:add` / `lingua:remove` for a fully
> orchestrated operation that covers files, DB records, and sync in one step.

### Sync

```php
// Import all local lang/ files into the database
Lingua::syncToDatabase();

// Export all database translations to local lang/ files
Lingua::syncToLocal();
```

---

## 🏗 Architecture

### How translations are stored

Lingua stores translations in the `language_lines` table, extending
Spatie's [laravel-translation-loader](https://github.com/spatie/laravel-translation-loader). Each row holds **all
locales in a single JSON `text` column**, eliminating the need for per-locale rows:

```
group       | key          | text
------------|--------------|--------------------------------------------------------------
validation  | required     | {"en": "The :attribute field is required.", "it": "..."}
single      | Welcome      | {"en": "Welcome", "fr": "Bienvenue", "de": "Willkommen"}
```

This design allows instant locale switching at runtime without additional queries per language.

### Translation types

Each string is classified automatically during sync:

| Type       | Use case                        | Auto-detected when…       |
|------------|---------------------------------|---------------------------|
| `text`     | Plain strings, labels, messages | Default                   |
| `html`     | Rich content with HTML markup   | String contains HTML tags |
| `markdown` | Markdown-formatted content      | String parses as Markdown |

The type drives which editor is shown in the Translations UI.

### Bi-directional sync

```
lang/en/*.php       ─┐
lang/en.json         │  lingua:sync-to-database →  language_lines (DB)
lang/it/*.php        │
lang/it.json        ─┤
lang/vendor/…        │  ← lingua:sync-to-local
                    ─┘
```

- **`sync-to-database`** — reads every locale file (core + vendor packages) and upserts rows in `language_lines`,
  auto-creating `languages` records for any new locales discovered. The default locale is processed first and its keys
  form the reference set; keys absent from the default locale are skipped for other locales. Vendor keys are imported
  only when the vendor locale is installed in the `languages` table.
- **`sync-to-local`** — reads every row in `language_lines` and writes locale-specific PHP/JSON files back to `lang/`,
  including vendor subdirectories.

### Translation loading at runtime

Lingua registers a custom `LinguaManager` as the Laravel translation loader. At runtime it merges:

1. File-based translations from `lang/`
2. Database translations via Spatie's `Db` loader

Database translations take precedence, enabling live overrides without touching source files.

### Locale middleware

`LinguaMiddleware` is automatically appended to the `web` middleware group on boot. It:

1. Reads the active locale from the session (`lingua.session_variable`)
2. Falls back to the database default language
3. Calls `app()->setLocale()` and stores the locale in the session for the next request

---

## 🧪 Testing

```bash
# Run the full test suite
composer test

# Run with coverage report
composer test-coverage
```

The suite uses [Pest](https://pestphp.com) and covers:

- All 5 Artisan commands — happy paths and error handling
- All Livewire components — rendering, interactions, and event dispatching
- Bi-directional sync operations
- All blade components
- Helper functions

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss your proposed change, then submit a PR. Run
`composer lint` before pushing.

---

## 📄 License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.

---

<div align="center">

Built with ❤️ by [Alessandro Rivolta](https://github.com/rivalex)

Powered
by [Laravel](https://laravel.com) · [Livewire](https://livewire.laravel.com) · [Flux](https://fluxui.dev) · [Laravel Lang](https://laravel-lang.com) · [Spatie](https://spatie.be)

</div>
