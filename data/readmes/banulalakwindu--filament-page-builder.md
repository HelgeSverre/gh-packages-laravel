# Filament Page Builder (`banulakwin/filament-page-builder`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/filament-page-builder.svg?style=flat-square)](https://packagist.org/packages/banulakwin/filament-page-builder)
[![Tests](https://github.com/banulalakwindu/filament-page-builder/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/filament-page-builder/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/filament-page-builder.svg?style=flat-square)](https://packagist.org/packages/banulakwin/filament-page-builder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Reusable Filament admin package for CMS content managed by **`banulakwin/laravel-page-builder`**.

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`
- Filament `^5.0`
- `banulakwin/laravel-page-builder` `^1.0`

---

## Installation

```bash
composer require banulakwin/filament-page-builder
```

Register plugin in your panel:

```php
use Banulakwin\FilamentPageBuilder\FilamentPageBuilderPlugin;

->plugins([
    FilamentPageBuilderPlugin::make(),
])
```

---

## Features

- CMS resource for `page_contents` with page-wise browsing and section grouping.
- Shows only keys currently defined in `PageRegistry::all()` (stale DB rows are hidden).
- Toolbar page selector with Filament-native dropdown UX and auto-apply.
- Section groups are collapsible and collapsed by default.
- Human-friendly labels for page and section slugs.
- Type-aware editing for:
  - scalar fields: `text`, `textarea`, `url`, `color`, `image`, `richtext`
  - `group` fields: schema-driven nested fields from config (supports nested `group` / `repeater`)
  - `repeater` fields: schema-driven item rows from config (supports nested `group` / `repeater`)
- Repeater rows auto-generate configured fields when a new item is added.

---

## Runtime assumptions

- Host app uses `banulakwin/laravel-page-builder`.
- Page definitions come from `app/Cms/Pages/*.php` (or configured page-builder path).
- Field values are persisted in `page_contents.value` (JSON for repeaters/groups).

---

## Current UI behavior

- List page:
  - page selector in toolbar (`Page` dropdown)
  - grouped by `section`
  - grouping controls hidden to keep UX simple
- Edit page:
  - `group` fields open as schema-driven nested fields from config
  - `repeater` fields open as schema-driven item rows from config
  - scalar fields use a type-aware component (`url`, `color`, `image`, `richtext`, etc.)

---

## Notes

- For repeater/group nested subfields, this package supports recursive JSON persistence while keeping config-defined shape.
- If a custom field type needs a specialized component (e.g. media picker), extend the field component resolver in `EditPageBuilderContent`.

Reusable helpers `CommonImageUpload` and `CommonRichEditor` under `Banulakwin\FilamentPageBuilder\Schemas` may be imported in app Filament forms.

---

## Testing

```bash
composer test          # Run PHPUnit
composer pint          # Fix code style
composer phpstan       # Static analysis
composer quality       # Run all (pint + phpstan + test)
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Run `composer quality` to ensure tests and style pass
4. Commit and push
5. Open a pull request

---

## Package layout (reference)

```
src/
  FilamentPageBuilderPlugin.php
  FilamentPageBuilderServiceProvider.php
  Resources/PageBuilderContents/
    PageBuilderContentResource.php
    Pages/
      ListPageBuilderContents.php
      EditPageBuilderContent.php
      ViewPageBuilderContent.php
    Schemas/
      PageBuilderContentForm.php
      PageBuilderContentInfolist.php
    Tables/
      PageBuilderContentsTable.php
  Schemas/
    CommonImageUpload.php
    CommonRichEditor.php
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
