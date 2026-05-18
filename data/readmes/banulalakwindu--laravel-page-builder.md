# Laravel Page Builder (`banulakwin/laravel-page-builder`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/laravel-page-builder.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-page-builder)
[![Tests](https://github.com/banulalakwindu/laravel-page-builder/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/laravel-page-builder/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/laravel-page-builder.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-page-builder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Portable Laravel package: a **CMS-style** layer where page **structure and defaults** are defined in PHP (per-page files under `app/Cms/Pages` by default, with optional fallback `config/pages.php`), synced into **`page_contents`**, and read at runtime **only from the database** via `PageService` (never from disk on web requests).

Supports **dynamic field types**, **file uploads (images)** on a configurable disk, **repeaters** and **groups** with **unlimited nesting** via a recursive field resolver.

---

## Requirements

- PHP `^8.2`
- Laravel `illuminate/*` `^11.0|^12.0|^13.0` (see `composer.json` for split packages)

---

## Installation

Registration is automatic via Composer `extra.laravel.providers`:

- `Banulakwin\PageBuilder\PageBuilderServiceProvider`

Optional facade alias (see **Resolving `PageService`**): `Page` → `Banulakwin\PageBuilder\Facades\Page`.

### Configure, migrate, sync

```bash
php artisan vendor:publish --tag=page-config
php artisan vendor:publish --tag=page-builder-config
php artisan migrate
php artisan page:sync
```

| Tag | Copies |
|-----|--------|
| `page-config` | `config/pages.php` — **optional fallback** when no files exist in `pages_path` |
| `page-builder-config` | `config/page-builder.php` — `pages_path`, optional registry cache, upload disk, migrations |
| `page-builder-migrations` | Package migration files → `database/migrations/` (optional; see **Database migrations** below) |

### Database migrations (same pattern as `banulakwin/laravel-seo-engine`)

By default, migrations are registered with **`loadMigrationsFrom()`** when **`config('page-builder.register_migrations')`** is **`true`** (default). Run **`php artisan migrate`** — no publish step is required.

To **own** migrations in the app: publish with **`php artisan vendor:publish --tag=page-builder-migrations`**, then set **`register_migrations` => false** in **`config/page-builder.php`** (or **`PAGE_BUILDER_REGISTER_MIGRATIONS=false`** in `.env`) so Laravel does not load the same files twice.

---

## Page definitions (`PageRegistry`)

1. **Primary:** one PHP file per page under **`config('page-builder.pages_path')`**, default **`app/Cms/Pages/{pageKey}.php`**. Filename (without `.php`) = page key. Each file **must** return:

```php
return [
    'sections' => [
        'hero' => [
            'fields' => [
                'title' => ['type' => 'text', 'default' => 'Welcome'],
                // …
            ],
        ],
    ],
];
```

2. **`Banulakwin\PageBuilder\Support\PageRegistry::all()`** loads and validates all files. If the directory is missing or empty, it returns **`config('pages.definitions', [])`** (or legacy top-level page keys in `config/pages.php`). Publish `page-config` for **`catalog`** (enable/disable) and optional **`definitions`** fallback.

### Page catalog (HTTP on/off)

`config/pages.php` may define **`catalog`**: each key is a page slug; value is **`['enabled' => true]`** or boolean shorthand. If **`catalog`** is non-empty, only listed keys with **`enabled`** true are treated as available. When **`catalog`** is empty, no gating is applied (backward compatible).

**Portable APIs (all live in the package):**

| API | Purpose |
|-----|---------|
| **`PageService::getPageWhenEnabled($slug)`** | Abort then return the same shape as **`getPage()`** (preferred in controllers). |
| **`PageService::getSectionWhenEnabled($slug, $section)`** | Abort then return **`getSection()`**. |
| **`page_when_enabled()`** / **`page_section_when_enabled()`** | Global helpers wrapping the service. |
| **`PageCatalog::enabled()`** / **`abortUnlessEnabled()`** | Check or abort without loading DB rows. |
| **`abort_unless_page_builder_page_enabled()`** | Global helper for **`PageCatalog::abortUnlessEnabled()`**. |
| Route middleware **`page-builder:{slug}`** | Alias registered by the service provider (override name via **`page-builder.middleware_alias`** / **`PAGE_BUILDER_MIDDLEWARE_ALIAS`**). Optional third segment: HTTP status, e.g. **`page-builder:home:403`**. |

Use **`getPage()`** / **`getSection()`** only when gating must not run (e.g. Filament, jobs).

### Common sections (shared across pages)

`config/pages.php` may define **`common_sections`**: section slugs and fields shared by every page (navbar, footer, etc.).

- On **`php artisan page:sync`**, those fields are stored under a reserved internal page key **`__common`** (not a public route slug).
- **`PageService::getPage($slug)`** merges **`__common`** sections first, then page-specific sections (`array_replace`). A page section with the same slug overrides a common section.
- **`PageService::getSection($slug, $section)`** loads **only** that page slug — it does **not** include `__common`. Use **`getPage()`** or load **`__common`** separately when you need shared content in one section.

For Inertia, pass field metadata without defaults/rules:

```php
use Banulakwin\PageBuilder\Support\PageRegistry;

$definitions = PageRegistry::publicFieldMetadataBySection('home');
$commonDefinitions = PageRegistry::publicFieldMetadataBySection('__common');
```

With **`@banulakwin/inertia-page-builder`**, use **`parseCmsSection($cms, 'section-slug', $definitions['section-slug'] ?? [])`** per section.

3. **`php artisan page:sync`** uses `PageRegistry::all()` (after clearing optional registry cache) and `firstOrCreate`s rows — **never overwrites** existing values.

See **[AGENTS.md](./AGENTS.md)** for step-by-step rules when adding pages or sections (AI-friendly).

### `config/pages.php` (merged key: `pages`)

Optional **fallback** only. Top-level keys are **page names** (e.g. `home`). Each page has `sections`; each section has `fields`.

Each field is an array with at least `type`. Supported types:

| Type | Behaviour |
|------|-----------|
| `text`, `textarea`, `url` | Read from request using dot path `{section}.{field}` (and nested paths for repeaters/groups). |
| `image` | If `Request::hasFile(path)`, file is stored on the field’s `disk` / `path` when set, otherwise `page-builder.upload_disk` / `page-builder.upload_directory`; otherwise existing path is read from request input. |
| `repeater` | Nested `fields` define each row; stored as **JSON** in one DB row for that field key. |
| `group` | Nested `fields`; stored as **JSON** object in one DB row. |

Optional `default` is used by `php artisan page:sync` only when creating a missing row (existing values are never overwritten).

#### Optional attributes on each field

All keys below are **optional** (in addition to `type` and usually `default`):

| Key | Purpose |
|-----|---------|
| `label` | Human label in admin / metadata for the frontend. |
| `rules` | List of Laravel **string** validation rules (e.g. `required`, `image`, `mimes:jpg,png`, `max:2048` in KB for files). |
| `meta` | Filament + Inertia hints: `aspect_ratio`, `aspect_ratio_mobile`, `width` / `height`, `width_mobile` / `height_mobile`, `min_height_mobile` / `min_height_desktop`, `max_height_mobile` / `max_height_desktop`, `sizes` (`<img sizes>`), `object_position`, `crop`, `image_editor`, etc. |
| `disk` | Filesystem disk for `image` uploads (`FieldResolver`, Filament `FileUpload`). |
| `path` | Directory on that disk for stored files (relative to disk root); when omitted, global upload directory / admin prefix applies. |

**Registry helpers** (for Filament CMS admin and Inertia props):

- `PageRegistry::sectionsForPage(string $page)` — raw `sections` for that page.
- `PageRegistry::fieldDefinitionsForPage(string $page)` — alias of `sectionsForPage`.
- `PageRegistry::publicFieldMetadataBySection(string $page)` — per-section field configs with `default` and `rules` stripped for safe client use; keeps `type`, `label`, `meta`, `disk`, `path`, and nested `fields`.

**Rule parsing** for admin / tooling: `Banulakwin\PageBuilder\Support\CmsFieldRules` (`isRequired`, `maxFileKilobytes`, `acceptedMimeTypes`, etc.).

### `config/page-builder.php` (merged key: `page-builder`)

| Config key | Purpose |
|------------|---------|
| `register_migrations` | Load package migrations via `loadMigrationsFrom()` (default `true`). Set `false` after publishing migrations into the app. Env: `PAGE_BUILDER_REGISTER_MIGRATIONS`. |
| `upload_disk` | Filesystem disk name (default `public`). Env: `PAGE_BUILDER_DISK`. |
| `upload_directory` | Directory on that disk (default `pages`). |
| `pages_path` | Absolute path to page PHP files, or empty string for `app_path('Cms/Pages')`. Env: `PAGE_BUILDER_PAGES_PATH`. |
| `registry_cache_ttl` | Seconds to cache `PageRegistry::all()`; `0` disables. Env: `PAGE_BUILDER_REGISTRY_CACHE_TTL`. |
| `registry_cache_key` | Cache key when TTL &gt; 0. Env: `PAGE_BUILDER_REGISTRY_CACHE_KEY`. |
| `middleware_alias` | Route middleware alias for **`EnsurePageBuilderPageIsEnabled`** (default `page-builder`). Env: `PAGE_BUILDER_MIDDLEWARE_ALIAS`. Set to empty string to skip registration. |

---

## Rules (design constraints)

- **Never change the DB schema** to add content fields — add them in **`app/Cms/Pages/*.php`** (or fallback `config/pages.php`) and run **`page:sync`** for new keys only.
- **Repeaters** (and nested structures) are stored as **JSON** in `page_contents.value`.
- **Images** store the **relative path** returned by `store()` (e.g. `pages/xxx.jpg` on the `public` disk → URL typically `/storage/pages/xxx.jpg` after `php artisan storage:link`).

---

## Database

Table: **`page_contents`**

| Column | Notes |
|--------|--------|
| `page` | Logical page name (`home`, …) |
| `section` | Section id (`hero`, …) |
| `key` | Field name (`title`, `items`, …) |
| `value` | `longText`, nullable — scalar string or JSON for complex fields |
| `deleted_at` | Nullable timestamp — **soft deletes** (`SoftDeletes` on `PageContent`) |

Unique index: **`(page, section, key)`** (applies to soft-deleted rows too). **`page:sync`** uses **`withTrashed()->firstOrCreate()`** so it does not insert a duplicate when a trashed row still exists; if the row was trashed, it is **`restore()`**d (defaults are not written over existing values). **`FieldResolver::handleSave`** uses **`withTrashed()->updateOrCreate()`** then **`restore()`** when the record was trashed.

---

## Architecture

### Model

`Banulakwin\PageBuilder\Models\PageContent` — fillable: `page`, `section`, `key`, `value`; uses **`SoftDeletes`** (`deleted_at`).

### Page service (singleton)

`Banulakwin\PageBuilder\Services\PageService`:

| Method | Returns |
|--------|---------|
| `getPage(string $page)` | `[section => [key => value]]` — merges **`__common`** then page-specific rows |
| `getSection(string $page, string $section)` | `[key => value]` for one section on that page only (no **`__common`** merge) |
| `getPageWhenEnabled(string $page)` | Same as **`getPage()`** after catalog check |
| `getSectionWhenEnabled(string $page, string $section)` | Same as **`getSection()`** after catalog check |

### Resolving `PageService` (prefer dependency injection)

Avoid `app(PageService::class)` in controllers: it hides dependencies and is harder to test than **constructor** or **method** injection.

**Recommended — method injection (shortest for a single action):**

```php
use Banulakwin\PageBuilder\Services\PageService;
use Inertia\Inertia;

public function index(PageService $pageService)
{
    return Inertia::render('Home', [
        'page' => $pageService->getPage('home'),
    ]);
}
```

**Also good — constructor injection (several actions use the service):**

```php
use Banulakwin\PageBuilder\Services\PageService;
use Inertia\Inertia;

public function __construct(
    protected PageService $pageService,
) {}

public function index()
{
    return Inertia::render('Home', [
        'page' => $this->pageService->getPage('home'),
    ]);
}
```

**Optional — facade** (nice syntax; hides the dependency, so prefer DI in application code):

```php
use Banulakwin\PageBuilder\Facades\Page;
use Inertia\Inertia;

return Inertia::render('Home', [
    'page' => Page::getPage('home'),
]);
```

**Optional — global helper** (`page('home')`) for Blade or one-off calls; use sparingly in large apps.

### Field resolver (singleton)

`Banulakwin\PageBuilder\Support\FieldResolver`:

- `handleSave(Request $request, string $page, string $section, array $fields): void`  
  Loops top-level `$fields`, runs `processField()` for each, **JSON-encodes** arrays, then `updateOrCreate` on `PageContent` for `(page, section, key)`.

- `processField(Request $request, array $config, string $path): mixed`  
  Recursive; request paths use **dot notation** rooted at the section name (e.g. `hero.title`, `hero.items.0.title`).

```php
use Banulakwin\PageBuilder\Support\FieldResolver;
use Banulakwin\PageBuilder\Support\PageRegistry;

public function update(Request $request, FieldResolver $fieldResolver)
{
    $pages = PageRegistry::all();
    $fields = (array) ($pages['home']['sections']['hero']['fields'] ?? []);

    $fieldResolver->handleSave($request, 'home', 'hero', $fields);

    return redirect()->back();
}
```

### Sync command

`php artisan page:sync` walks **`PageRegistry::all()`** (file definitions, else `config('pages')`) and uses **`firstOrCreate`** on `(page, section, key)` with encoded defaults. **Does not overwrite** existing rows.

### Helper

`page(string $page): array` — convenience wrapper around `PageService::getPage()`. Defined in `src/helpers.php` (loaded via Composer `autoload.files`). Prefer injecting `PageService` in controllers; the helper is fine for views or quick calls.

---

## Laravel / Inertia usage

### Controller (read)

Use **method or constructor injection** (see **Resolving `PageService`** above). Example with method injection:

```php
use Banulakwin\PageBuilder\Services\PageService;
use Inertia\Inertia;

public function index(PageService $pageService)
{
    return Inertia::render('Home', [
        'page' => $pageService->getPage('home'),
    ]);
}
```

### React (Inertia props)

Assume `page` is the prop above (or your app’s `cms` prop). Each **section key** is a slug; under it, each **field key** maps to a string. Repeaters are **JSON strings** in the DB — parse on the client if needed.

```tsx
const hero = page.hero ?? {};

<h1>{hero.title}</h1>
{hero.image ? <img src={`/storage/${hero.image}`} alt="" /> : null}

const items = JSON.parse(page.features?.items ?? '[]');
items.map((item: { title: string }) => …);
```

With **`@banulakwin/inertia-page-builder`**, call **`parseCmsSection(cms, 'hero')`** so `slug` comes from the section key; you do not need `slug` / `name` fields in the PHP definition unless they are real content.

Adjust `/storage/` prefix if you use a different disk or CDN.

---

## Example config shape

After publishing `page-config`, define pages in `config/pages.php`. Minimal example:

```php
return [
    'home' => [
        'sections' => [
            'hero' => [
                'fields' => [
                    'title' => ['type' => 'text', 'default' => 'Welcome'],
                    'subtitle' => ['type' => 'textarea', 'default' => ''],
                    'image' => ['type' => 'image', 'default' => null],
                ],
            ],
            'features' => [
                'fields' => [
                    'items' => [
                        'type' => 'repeater',
                        'fields' => [
                            'title' => ['type' => 'text'],
                            'description' => ['type' => 'textarea'],
                        ],
                    ],
                ],
            ],
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
  page-builder.php
  pages.php
database/migrations/
  *_create_page_contents_table.php
src/
  Console/SyncPageContent.php
  Facades/Page.php
  Models/PageContent.php
  Services/PageService.php
  Support/FieldResolver.php
  PageBuilderServiceProvider.php
  helpers.php
```

---

## License

MIT
