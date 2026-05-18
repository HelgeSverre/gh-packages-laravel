# Laravel Archmap

Generate Laravel architecture documentation from your codebase.

## Installation

```bash
composer require madaryastudio/laravel-archmap --dev
```

## Publish Config

```bash
php artisan vendor:publish --tag=archmap-config
```

## Commands

```bash
php artisan archmap:generate
php artisan archmap:generate --format=plantuml
php artisan archmap:generate --fresh
php artisan archmap:routes
php artisan archmap:erd
php artisan archmap:classes
php artisan archmap:docs
php artisan archmap:report
php artisan archmap:components
php artisan archmap:sequence --route="POST /api/orders"
php artisan archmap:ci --fail-on=critical
php artisan archmap:clean
```

## Default Output

```text
docs/architecture.md
docs/archmap-report.json
docs/diagrams/erd.mmd
docs/diagrams/routes.mmd
docs/diagrams/classes.mmd
docs/diagrams/components.mmd
docs/diagrams/sequences/*.mmd
```

Jika memakai `--format=plantuml`, file diagram akan dihasilkan sebagai `.puml`.

## Notes

- Package ini bersifat static analysis, jadi flow dinamis tertentu mungkin tidak terdeteksi.
- Sequence diagram menggunakan deteksi berbasis route/controller/dependency sehingga hasilnya berupa estimasi.
