<h1 align="center">Laravel Translator (WORK IN PROGRESS)</h1>
<p align="center">
  <a href="https://packagist.org/packages/vwinck-dev/laravel-translations">
    <img src="https://img.shields.io/packagist/v/vwinck-dev/laravel-translator?color=f28d1a&style=flat-square" alt="Packagist Version">
  </a>
  <a href="https://packagist.org/packages/vwinck-dev/laravel-translator">
    <img src="https://img.shields.io/packagist/dt/vwinck-dev/laravel-translator?style=flat-square" alt="Total Downloads">
  </a>
  <a href="https://opensource.org/license/mit">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/vwinck-dev/laravel-translator/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/vwinck-dev/laravel-translator/ci.yml?style=flat-square&label=CI" alt="CI Status">
  </a>
</p>

<p align="center">
  Translation files and localization utilities for Laravel - publish, manage and extend your app's translations with a single Artisan command.
</p>

---

## Features

- **Auto-discovery** - zero configuration, works out of the box with Laravel's package system
- **Artisan integration** - publish and update translations via `lang:update`
- **JSON-based** - simple, human-readable translation files
- **Multi-locale** - grow your supported languages incrementally
- **CI/CD ready** - version-controlled translations that fit neatly into automated pipelines

---

## Requirements

- PHP **8.1+**
- Laravel ^**10.x**

---

## Installation

```bash
composer require vwinck-dev/laravel-translator
```

The package registers itself automatically via Laravel's auto-discovery. No manual provider or alias registration needed.

---

## Publishing Translations

To publish the translation files to your application's `lang/` directory, run:

```bash
php artisan lang:update
```

Alternatively, use the standard Artisan vendor publish command:

```bash
php artisan vendor:publish --tag=translations
```

---

## Available Locales

| Locale | Language              | Status |
|--------|-----------------------|--------|
| `en`   | English               | ✅     |
| `pt_BR`| Portuguese (Brazil)   | ✅     |

> Want to add a new locale? See [Contributing](#contributing).

---

## Project Structure

```
lang/
├── en.json       # English (base)
└── pt_BR.json    # Portuguese (Brazil)
```

Each file is a flat JSON map of the original string to its translation - compatible with Laravel's `__()` and `trans()` helpers out of the box.

---

## Usage

Use Laravel's built-in translation helpers anywhere in your application:

```php
// Blade
{{ __('Attach files by dragging & dropping, selecting or pasting them.') }}

// PHP
__('Attach files by dragging & dropping, selecting or pasting them.');
```

The corresponding `pt_BR.json` entry:

```json
{
  "Attach files by dragging & dropping, selecting or pasting them.": "Anexe arquivos arrastando, selecionando ou colando."
}
```

---

## Roadmap

- [ ] Missing translation detection
- [ ] Translation diff command
- [ ] Vendor package translation support
- [ ] Remote synchronization
- [ ] Automatic merge support
- [ ] Per-locale installer commands

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-locale`
3. Commit your changes: `git commit -m 'feat: add fr locale'`
4. Push and open a Pull Request

Please follow the existing file naming conventions and ensure your JSON is valid before submitting.

---

## License

Distributed under the [MIT License](https://opensource.org/license/mit). © vwinck-dev