# Filament SEO Engine (`banulakwin/filament-seo-engine`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/filament-seo-engine.svg?style=flat-square)](https://packagist.org/packages/banulakwin/filament-seo-engine)
[![Tests](https://github.com/banulalakwindu/filament-seo-engine/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/filament-seo-engine/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/filament-seo-engine.svg?style=flat-square)](https://packagist.org/packages/banulakwin/filament-seo-engine)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Reusable Filament admin package for SEO management with **`banulakwin/laravel-seo-engine`**.

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`
- Filament `^5.0`
- `banulakwin/laravel-seo-engine` `^1.0`

---

## Installation

```bash
composer require banulakwin/filament-seo-engine
```

Register plugin in your panel:

```php
use Banulakwin\FilamentSeoEngine\FilamentSeoEnginePlugin;

->plugins([
    FilamentSeoEnginePlugin::make(),
])
```

---

## Features

- Static page SEO resource (`seo_meta` records with `model_type=static_page` by default).
- Reusable SEO form schema for `seo()` relationship tabs in existing resources.
- Reusable SEO infolist schema for view pages/tabs.
- Global search with page key, meta title, and description.
- Type-aware image uploads with aspect ratio presets.

---

## Reusable model SEO tab

Use in any edit page tab system that supports relationship-backed schema:

```php
use Banulakwin\FilamentSeoEngine\Schemas\SeoContentForm;

...SeoContentForm::relationshipSchema('seo')
```

For view pages/infolists:

```php
use Banulakwin\FilamentSeoEngine\Schemas\SeoContentInfolist;

SeoContentInfolist::section('seo')
```

---

## Runtime assumptions

- Host app uses `banulakwin/laravel-seo-engine`.
- SEO storage is centralized in `seo_meta`.
- Static pages use `model_type = config('seo.static_page_model_type', 'static_page')` and string `model_id`.
- Dynamic models use a `seo()` relation (typically via `Seoable`) and should be edited inline via reusable schemas.

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
  FilamentSeoEnginePlugin.php
  FilamentSeoEngineServiceProvider.php
  Resources/StaticPageSeos/
    StaticPageSeoResource.php
    Pages/
      ListStaticPageSeos.php
      EditStaticPageSeo.php
      ViewStaticPageSeo.php
    Schemas/
      StaticPageSeoInfolist.php
    Tables/
      StaticPageSeosTable.php
  Schemas/
    CommonImageUpload.php
    SeoContentForm.php
    SeoContentInfolist.php
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
