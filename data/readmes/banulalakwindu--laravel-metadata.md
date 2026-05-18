# Laravel Metadata (`banulakwin/laravel-metadata`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/laravel-metadata.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-metadata)
[![Tests](https://github.com/banulalakwindu/laravel-metadata/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/laravel-metadata/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/laravel-metadata.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-metadata)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Portable Laravel package: **config-driven** application metadata stored as **key/value rows per group**, with **typed field definitions** in PHP config and a **sync command** that inserts missing rows from defaults.

Use this for **site settings**, **feature flags**, **integration toggles**, and other **global key/value** data without new migrations when you add keys.

---

## Requirements

- PHP `^8.2`
- Laravel `illuminate/*` `^11.0|^12.0|^13.0` (see `composer.json` for split packages)

---

## Installation

Registration is automatic via Composer `extra.laravel.providers`:

- `Banulakwin\Metadata\MetadataServiceProvider`

Optional facade alias (see **Resolving `MetadataService`**): `Meta` → `Banulakwin\Metadata\Facades\Meta`.

### Configure, migrate, sync

```bash
php artisan vendor:publish --tag=meta-config
php artisan vendor:publish --tag=metadata-config
php artisan migrate
php artisan meta:sync
```

| Tag | Copies |
|-----|--------|
| `meta-config` | `config/meta.php` — define groups and fields (types + defaults) |
| `metadata-config` | `config/metadata.php` — migration registration |
| `metadata-migrations` | Package migration files → `database/migrations/` (optional; see **Database migrations** below) |

### Database migrations

By default, migrations are registered with **`loadMigrationsFrom()`** when **`config('metadata.register_migrations')`** is **`true`** (default). Run **`php artisan migrate`** — no publish step is required.

To **own** migrations in the app: publish with **`php artisan vendor:publish --tag=metadata-migrations`**, then set **`register_migrations` => false** in **`config/metadata.php`** (or **`METADATA_REGISTER_MIGRATIONS=false`** in `.env`) so Laravel does not load the same files twice.

---

## Configuration overview

### `config/meta.php` (merged key: `meta`)

Top-level keys are **group names** (e.g. `site`, `integrations`). Each group has a **`fields`** array: field key → definition with at least **`type`**, optional **`default`**.

Supported types for **`meta:sync`** (default encoding) and **`MetadataService::get()` / `getGroupDecoded()`** (decoding):

| Type | Stored in DB | Notes |
|------|----------------|------|
| `text`, `textarea`, `url`, `email` | Plain string | Default: empty string if omitted. |
| `image` | String path or null | Same idea as page-builder image path. |
| `integer` / `int` | Numeric string or null | Default omitted → `null` in DB. |
| `float` / `decimal` / `double` | Numeric string or null | Default omitted → `null` in DB. |
| `boolean` / `bool` | JSON boolean string (`true` / `false`) | Uses `json_encode` for storage. |
| `json` | JSON string | `default` is `json_encode`d. |
| `repeater` | JSON array | Same pattern as page-builder repeaters. |
| `group` | JSON object | Nested `fields` with recursive defaults (like page-builder `group`). |

Optional **`default`** is used by **`php artisan meta:sync`** only when creating a missing row (**existing values are never overwritten**).

### `config/metadata.php` (merged key: `metadata`)

| Config key | Purpose |
|------------|---------|
| `register_migrations` | Load package migrations via `loadMigrationsFrom()` (default `true`). Set `false` after publishing migrations into the app. Env: `METADATA_REGISTER_MIGRATIONS`. |
| `definitions` | Optional inline group definitions (same shape as `meta`); merged **after** `config('meta')`. |
| `definitions_path` | Absolute path, or empty string to use **`app/Cms/Metadata`**. Each **`{group}.php`** returns `['fields' => [...]]`; basename is the group name. Env: `METADATA_DEFINITIONS_PATH`. |
| `definitions_cache_ttl` | Seconds to cache merged definitions (`0` = off). **`meta:sync`** clears this cache when TTL is greater than zero. Env: `METADATA_DEFINITIONS_CACHE_TTL`. |
| `definitions_cache_key` | Cache store key for merged definitions. Env: `METADATA_DEFINITIONS_CACHE_KEY`. |

### `MetadataRegistry` (file + config merge)

`Banulakwin\Metadata\Support\MetadataRegistry` mirrors the **page-builder** idea: **`all()`** returns merged groups (for **`meta:sync`** and for **`MetadataService`** field types). **`fieldsForGroup('site')`** returns the `fields` map for one group. **`forgetCache()`** is called at the start of **`meta:sync`**.

---

## Rules (design constraints)

- **Do not change the DB schema** to add metadata keys — add them in **`config/meta.php`**, optional **`config/metadata.definitions`**, and/or **`app/Cms/Metadata/{group}.php`**, then run **`meta:sync`** for new keys only.
- **Complex values** (`json`, `repeater`, `group`) are stored as **JSON** in **`metadata_entries.value`**.
- If a field has **no `type` in config**, **`get()`** returns the **raw string** from the database; **`getGroupDecoded()`** leaves unknown keys as raw strings.

---

## Database

Table: **`metadata_entries`**

| Column | Notes |
|--------|--------|
| `group` | Logical namespace (`site`, `integrations`, …) |
| `key` | Field name |
| `value` | `longText`, nullable — scalar string or JSON for complex types |
| `deleted_at` | Nullable timestamp — **soft deletes** (`SoftDeletes` on `MetadataEntry`) |

Unique index: **`(group, key)`** (applies to soft-deleted rows too). **`meta:sync`** uses **`withTrashed()->firstOrCreate()`** so it does not insert a duplicate when a trashed row still exists; if the row was trashed, it is **`restore()`**d (defaults are not written over existing values).

---

## Architecture

### Model

`Banulakwin\Metadata\Models\MetadataEntry` — fillable: `group`, `key`, `value`; uses **`SoftDeletes`** (`deleted_at`).

### Metadata service (singleton)

`Banulakwin\Metadata\Services\MetadataService`:

| Method | Returns |
|--------|---------|
| `getGroup(string $group)` | `[key => raw string or null]` from the database |
| `getRaw(string $group, string $key)` | Single raw value or `null` |
| `get(string $group, string $key, mixed $default = null)` | Value decoded using **registry** field `type` when defined; otherwise raw string |
| `getGroupDecoded(string $group)` | All keys in that group with decoding applied where config exists |

### Resolving `MetadataService` (prefer dependency injection)

**Recommended — method injection:**

```php
use Banulakwin\Metadata\Services\MetadataService;
use Inertia\Inertia;

public function index(MetadataService $metadata)
{
    return Inertia::render('Home', [
        'site' => $metadata->getGroupDecoded('site'),
    ]);
}
```

**Optional — facade:**

```php
use Banulakwin\Metadata\Facades\Meta;
use Inertia\Inertia;

return Inertia::render('Home', [
    'site' => Meta::getGroupDecoded('site'),
]);
```

**Optional — global helper** (`meta_group('site')`) returns **raw** pairs only; use sparingly. Prefer **`MetadataService`** or **`Meta::getGroupDecoded()`** when you need typed values.

### Sync command

`php artisan meta:sync` walks **`config('meta')`** and uses **`firstOrCreate`** on **`(group, key)`** with encoded defaults. **Does not overwrite** existing rows.

### Helper

`meta_group(string $group): array` — convenience wrapper around **`MetadataService::getGroup()`** (raw strings). Defined in **`src/helpers.php`** (Composer **`autoload.files`**).

---

## Laravel / Inertia usage

### Controller (read, typed)

```php
use Banulakwin\Metadata\Services\MetadataService;
use Inertia\Inertia;

public function index(MetadataService $metadata)
{
    return Inertia::render('Home', [
        'supportEmail' => $metadata->get('site', 'support_email'),
        'flags' => $metadata->getGroupDecoded('feature_flags'),
    ]);
}
```

### React (Inertia props)

Scalars arrive as strings/numbers/booleans/objects depending on type and **`get()`** / **`getGroupDecoded()`**. JSON-backed fields are already decoded on the server when you use **`get()`** or **`getGroupDecoded()`**.

---

## Example config shape

After publishing **`meta-config`**, define groups in **`config/meta.php`**. Minimal example:

```php
return [
    'site' => [
        'fields' => [
            'support_email' => ['type' => 'email', 'default' => 'hello@example.com'],
            'maintenance' => ['type' => 'boolean', 'default' => false],
            'max_items' => ['type' => 'integer', 'default' => 10],
            'notes' => ['type' => 'json', 'default' => ['lines' => []]],
        ],
    ],
    'integrations' => [
        'fields' => [
            'analytics_id' => ['type' => 'text', 'default' => ''],
        ],
    ],
];
```

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
config/
  metadata.php
  meta.php
database/migrations/
  *_create_metadata_entries_table.php
src/
  Console/SyncMetadata.php
  Facades/Meta.php
  Models/MetadataEntry.php
  Services/MetadataService.php
  MetadataServiceProvider.php
  helpers.php
```

---

## License

MIT
