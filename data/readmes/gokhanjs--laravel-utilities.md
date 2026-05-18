# laravel-utilities

A growing collection of Laravel patterns I've extracted from real production
projects in hospitality, payments, and document automation.

> **First entry:** a custom **model-translation pattern** — trait-based,
> separate translation tables, no third-party packages required.

---

## `model-translations/`

Multilingual Eloquent models without `spatie/laravel-translatable` or JSON
columns — just a trait, a base translation model, and a naming convention.

### Why this approach

| Use case | This pattern | JSON column | Spatie package |
|---|---|---|---|
| Many translatable fields per model | ✅ Clean | ❌ Bloated | ✅ |
| Query/filter per language at SQL level | ✅ Fast | ⚠️ Slow | ✅ |
| No external package dependency | ✅ | ✅ | ❌ |
| 1–2 simple fields, low traffic | ❌ Overkill | ✅ Simpler | ✅ |

Pick this when you have many translatable fields, need normalized data, and
want full control without locking into a package's API.

### Structure

```
model-translations/
├── Interfaces/          → Translation contracts
├── Migrations/          → Translation table schema
├── Models/              → Base model + ProductTranslation, etc.
├── Repositories/        → Data access layer
├── Scopes/              → Locale-aware query scopes
├── Traits/              → TranslationTrait (auto-resolves Model → ModelTranslation)
└── ProductController.php → Example usage
```

### How it works (short version)

- `TranslationTrait` adds `activeLanguage()` and translation accessors to any model
- Convention: `Product` → `ProductTranslation` (override via `translationClass()`)
- `Scopes/` provides query builder helpers for filtering by current locale
- `Repositories/` keeps translation queries out of controllers

See `model-translations/ProductController.php` for end-to-end usage.

---

## Stack

PHP · Laravel · Eloquent

## Roadmap

More patterns will be added as I extract them from production work — likely
candidates: validation rules (TR ID, IBAN), money/currency handling, and
API resource conventions.

## License

MIT
