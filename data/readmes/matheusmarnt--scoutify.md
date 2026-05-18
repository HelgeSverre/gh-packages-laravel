<p align="center">
    <img src="art/scoutify.png" alt="Scoutify" width="750" />
</p>

<p align="center">
    <a href="https://packagist.org/packages/matheusmarnt/scoutify"><img src="https://img.shields.io/packagist/v/matheusmarnt/scoutify.svg?style=flat-square" alt="Latest Version on Packagist" /></a>
    <a href="https://github.com/matheusmarnt/scoutify/actions?query=workflow%3Atests+branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/matheusmarnt/scoutify/tests.yml?branch=main&label=tests&style=flat-square" alt="Tests" /></a>
    <a href="https://github.com/matheusmarnt/scoutify/actions?query=workflow%3Apint+branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/matheusmarnt/scoutify/pint.yml?branch=main&label=code+style&style=flat-square" alt="Code Style" /></a>
    <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square" alt="License" /></a>
    <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-11%7C12%7C13-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel" /></a>
    <a href="https://livewire.laravel.com"><img src="https://img.shields.io/badge/Livewire-3%7C4-FB70A9?style=flat-square" alt="Livewire" /></a>
    <a href="https://laravel.com/docs/scout"><img src="https://img.shields.io/badge/Scout-11%7C12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Scout" /></a>
    <a href="https://matheusmarnt.github.io/scoutify/"><img src="https://img.shields.io/badge/docs-online-7c3aed?style=flat-square" alt="Docs" /></a>
</p>

# Scoutify

⌘K global search modal for Laravel — multi-model Livewire UI powered by Scout.

> 📘 **Documentation**: <https://matheusmarnt.github.io/scoutify/>

Drops a production-ready ⌘K search experience into any Laravel application. Register Eloquent models, choose a Scout driver, and ship a keyboard-triggered modal that queries multiple model types simultaneously, groups results by type, and persists recent search history to session.

## Features

- **Livewire modal** — keyboard-triggered (`⌘K` / `Ctrl+K`) global search dialog
- **Zero-config discovery** — models under `app/Models/` using `Searchable` are auto-detected at boot
- **Grouped results** — results organised by model type with section headers and color tokens
- **Multiple drivers** — Meilisearch, Algolia, Typesense, or Database
- **Accent-insensitive highlight** — diacritic-free queries (`padrao`) match and highlight accented text (`Padrão`) via NFD normalization
- **Auto-discovered subtitles** — models with `description`, `subtitle`, `excerpt`, `summary`, `bio`, or `body` attributes surface them as result subtitles automatically; HTML is sanitized to plain text before display, so CMS fields render cleanly without escaped tags
- **Query hook** — per-model `globalSearchBuilder()` for custom filters, scopes, or infix matching
- **Recent searches** — configurable history, persisted to session
- **i18n** — ships with `pt_BR`, `en`, and `es` translations
- **Dark mode** — full dark mode support out of the box
- **WCAG AA** — accessible markup with focus management and keyboard navigation
- **Any blade-icons pack** — `globalSearchIcon()` accepts any icon name from any [Blade Icons](https://github.com/blade-ui-kit/blade-icons) pack installed via Composer (e.g. `ri-*`, `tabler-*`, `mdi-*`); fully-qualified names are auto-detected by matching against all registered pack prefixes and passed through as-is; short names fall back to the registered prefix (`heroicon-o-` by default; override via `Scoutify::types()->iconPrefix()` in a service provider)
- **File preview & download** — models implementing `HasGlobalSearchPreview` expose an inline file preview pane inside the modal. PDFs, images, and videos render natively; any other type falls back to an external-link/download button. Download is opt-in and dispatches a `scoutify:download` browser event you can handle with a single listener
- **Tailwind v4** — utility classes inlined, override via the fluent theme API

## Quick Start

```bash
composer require matheusmarnt/scoutify
php artisan scoutify:install
```

This will:
1. Prompt for a Scout driver (`meilisearch`, `algolia`, or `typesense`)
2. Install the driver's Composer packages
3. Publish `config/scoutify.php` and `config/scout.php`
4. Set `SCOUT_DRIVER` in `.env`

## Registering Models

Make your Eloquent models globally searchable:

```bash
php artisan scoutify:searchable
```

The command discovers Eloquent models under `app/Models/`, prompts you to pick which to register (or pass `--all`), and **automatically edits each chosen model file** to:

1. Import `Matheusmarnt\Scoutify\Concerns\Searchable` and `Matheusmarnt\Scoutify\Contracts\GloballySearchable`
2. Add `implements GloballySearchable` to the class declaration
3. Insert `use Searchable;` as the first statement in the class body

The command then rebuilds the type manifest so models appear in the UI immediately.

The `Searchable` trait provides sensible defaults for every interface method. Override as needed:

```php
public function globalSearchTitle(): string      { return $this->title; }
public function globalSearchSubtitle(): ?string  { return $this->author; }
public function globalSearchUrl(): string        { return route('articles.show', $this); }

public static function globalSearchGroup(): string  { return 'Articles'; }
public static function globalSearchLabel(): string  { return 'Articles'; }  // UI chip label
public static function globalSearchIcon(): string   { return 'heroicon-o-document-text'; }
public static function globalSearchColor(): string  { return 'blue'; }
```

> **Icon packs:** `globalSearchIcon()` accepts any icon name supported by [Blade Icons](https://github.com/blade-ui-kit/blade-icons). Fully-qualified names are auto-detected by matching against **all packs registered via Composer service providers** — not just those declared in `config/blade-icons.php`. Install any pack and use its prefix directly:
>
> ```bash
> composer require andreiio/blade-remix-icon        # ri-*
> composer require ricard0liveira/blade-tabler-icons  # tabler-*
> ```
>
> ```php
> public static function globalSearchIcon(): string { return 'ri-customer-service-2-fill'; }
> public static function globalSearchIcon(): string { return 'tabler-home'; }
> ```
>
> Short names (e.g. `user`) get the registered prefix prepended (`heroicon-o-` by default). Override in a service provider:
>
> ```php
> use Matheusmarnt\Scoutify\Facades\Scoutify;
>
> Scoutify::types()->iconPrefix('ri-');
> ```

> **`globalSearchSubtitle()` auto-discovery:** if your model has a `description`, `subtitle`, `excerpt`, `summary`, `bio`, or `body` attribute, the trait returns it automatically — HTML is sanitized to plain text (tags stripped, entities decoded, whitespace collapsed) then truncated to 150 chars. Override only when you need custom logic or a different field.

Use `--dry-run` to preview edits without touching files:

```bash
php artisan scoutify:searchable --dry-run
```

Then import your models into the Scout index:

```bash
php artisan scoutify:import
```

Add to your layout:

```blade
{{-- Desktop trigger: pill with label + ⌘K badge, visible on lg+ --}}
<x-scoutify::gs.trigger class="hidden lg:inline-flex" />

{{-- Mobile trigger: 44×44 px icon-only button, hidden on lg+ --}}
<x-scoutify::gs.trigger-mobile />

{{-- Modal: must be at root layout level, AFTER {{ $slot }} --}}
{{ $slot }}
<livewire:scoutify::modal />
```

> **Modal placement:** `<livewire:scoutify::modal />` must live at the root of your layout, **outside any collapsible or conditionally-rendered container** (sidebar, drawer, off-canvas nav, etc.). Livewire does not initialise components inside collapsed containers — placing the modal inside a collapsed sidebar means it will not mount until the sidebar is opened, causing the trigger to appear broken. The trigger component (`<x-scoutify::gs.trigger />`) can go anywhere.

## Customizing the Scout Query

Override `globalSearchBuilder()` on any model to apply custom filters, scopes, or driver-specific options:

```php
use Laravel\Scout\Builder;

public function globalSearchBuilder(Builder $builder, string $query): Builder
{
    return $builder->where('published', true);
}
```

> **Meilisearch note:** Meilisearch uses word-boundary prefix search. Substrings that are not word-prefixes (e.g. `"ano"` inside `"Mariano"`) return no results. If you need substring (infix) matching, override `globalSearchBuilder()` to configure Meilisearch's `attributesToSearchOn` or switch to the `database` driver which uses `LIKE`-based search.

## Opening the Modal Programmatically

Any element can open Scoutify without the official trigger component.

**Alpine (recommended):**
```html
<button x-data @click="$dispatch('scoutify:open')">Search</button>
```

**Plain JS / any context:**
```js
window.dispatchEvent(new CustomEvent('scoutify:open'))
```

**Inside a Livewire component:**
```html
<button wire:click="$dispatchTo('scoutify::modal', 'scoutify:open')">Search</button>
```

> **Do not use** `wire:click="$dispatch('scoutify:open')"` on plain Blade elements — outside a Livewire component tree, Livewire.js never initialises those directives.

## Visibility Gating (Authorization)

By default, Scoutify is **secure-by-default**:
- **Guests:** cannot see results (always denied).
- **Authenticated users:** can see results if they pass a registered policy check for `view` (e.g. `Gate::check('view', $record)`). If no policy exists for the model, authenticated users are allowed by default.

To customize this behavior per model, implement the `HasGlobalSearchVisibility` contract and use the fluent `VisibilityRule` builder:

```php
use Matheusmarnt\Scoutify\Authorization\VisibilityRule;
use Matheusmarnt\Scoutify\Contracts\HasGlobalSearchVisibility;

class Article extends Model implements GloballySearchable, HasGlobalSearchVisibility
{
    use Searchable;

    public function globalSearchVisibility(): VisibilityRule
    {
        return VisibilityRule::make()
            ->visibleToGuests()                  // expose to non-authenticated visitors
            ->orWhenAuthenticated()              // OR when authenticated +
                ->policy('view')                 //   passes registered policy
                ->orPermission('view-articles')  //   OR has Spatie permission
                ->orRole('admin')                //   OR has Spatie role
                ->orAttribute('is_active');      //   OR has boolean attribute true
    }
}
```

### Supported Rules

| Rule | Description |
|---|---|
| `->visibleToGuests()` | Allows guests to see results from this model. |
| `->policy(ability, ...args)` | Checks `Gate::check(ability, $record, ...args)`. |
| `->permission(name)` | Checks Spatie `hasPermissionTo()`. Supports array for multiple. |
| `->role(name)` | Checks Spatie `hasRole()`. Supports array for multiple. |
| `->attribute(name, expected)` | Compares `$record->name` with `expected` (default `true`). |
| `->using(Closure)` | Custom logic: `fn($record, $user) => bool`. |

Use `->mode(VisibilityMode::All)` to require **all** rules to pass (logical AND) instead of any (logical OR).

> **Spatie Integration:** `->permission()` and `->role()` require `spatie/laravel-permission`. Scoutify detects it automatically and fails closed if the package is missing when these rules are used.

### Global Configuration

Customize the default behavior in `config/scoutify.php`:

```php
'authorization' => [
    'default' => 'secure',          // secure | permissive | gate-only
    'gate_ability' => 'view',       // ability used for policy/gate checks
],
```

- `secure` (default): Guest denied, Auth checks gate if policy/gate exists, else allow.
- `permissive`: Everyone allowed.
- `gate-only`: Everyone (including guest if gate closure allows) must pass gate check; fails closed if gate/policy is missing.

## File Preview & Download

Any model can expose an inline file preview pane inside the search modal by implementing `HasGlobalSearchPreview`:

```php
use Matheusmarnt\Scoutify\Contracts\HasGlobalSearchPreview;
use Matheusmarnt\Scoutify\Support\PreviewDto;

class Document extends Model implements GloballySearchable, HasGlobalSearchPreview
{
    use Searchable;

    public function globalSearchPreview(): ?PreviewDto
    {
        // Storage-based file (disk + path)
        return PreviewDto::fromDisk(
            disk: 'documents',
            path: $this->file_path,
            filename: $this->original_name,  // optional; defaults to basename($path)
        );

        // OR: external / CDN URL
        // return PreviewDto::fromUrl('https://cdn.example.com/file.pdf');
    }
}
```

### How it works

- **PDFs, images, and videos** render inline inside the preview pane.
- **Other types** show a fallback with an external-link button.
- **Authorization** reuses the same `GlobalSearchAuthorizer` rules as search results — the record must be visible to the current user.
- **Signed route** (`scoutify.preview.stream`) is auto-registered. No manual route publishing needed.
- **Temporary URLs** — if the disk supports them (e.g. S3 with pre-signed URLs), Scoutify uses them directly; otherwise it streams through the signed route.
- **Keyboard accessible** — `Tab` / `Shift+Tab` cycle focus between the search input and the Preview / Download buttons on the active row. `Enter` on a focused button activates it without navigating to the record's route. Opening the preview auto-focuses the Back button; `Esc` closes the pane.

### Download

Implement the download by listening to the `scoutify:download` browser event:

```js
window.addEventListener('scoutify:download', (e) => {
    const a = document.createElement('a');
    a.href = e.detail.url;
    a.download = e.detail.filename ?? '';
    a.click();
});
```

### `PreviewDto` reference

| Factory method | When to use |
|---|---|
| `PreviewDto::fromDisk(disk, path, ...)` | File lives on a Laravel filesystem disk |
| `PreviewDto::fromUrl(url, ...)` | File is already a publicly-accessible URL |

Optional parameters: `mime`, `filename`, `sizeBytes`, `view` (custom Blade view), `ttl` (signed URL TTL in seconds, default 3600).

## Commands

| Command | Description |
|---|---|
| `scoutify:install` | Install driver packages, publish config, configure backend |
| `scoutify:doctor` | Verify driver config and backend connectivity |
| `scoutify:searchable` | Register models as globally searchable and rebuild manifest |
| `scoutify:rebuild` | Rebuild the type manifest from `app/Models/` |
| `scoutify:import` | Import registered models into Scout index |
| `scoutify:flush` | Flush registered models from Scout index |
| `scoutify:sync` | Flush then re-import |

## AI Assistance

Scoutify ships a two-tier AI documentation mechanism so any AI assistant can access current, version-pinned documentation and scaffold correct PHP code.

**Layer 1 — static files (any AI client, zero install):**

```
https://matheusmarnt.github.io/scoutify/llms.txt
https://matheusmarnt.github.io/scoutify/llms-full.txt
```

**Layer 2 — MCP server (Claude Code, Cursor, Codex, Gemini, Windsurf, Copilot, Cline):**

```bash
# Claude Code
claude mcp add scoutify -- npx -y @matheusmarnt/scoutify-mcp

# All other MCP clients — add to your mcpServers config:
# { "command": "npx", "args": ["-y", "@matheusmarnt/scoutify-mcp"] }
```

The MCP server exposes 8 tools: `search_docs`, `get_page`, `list_pages`, `get_antipatterns`, `scaffold_searchable_model`, `scaffold_visibility_rule`, `scaffold_theme_config`, `validate_snippet`.

→ [Full AI integration guide](https://matheusmarnt.github.io/scoutify/getting-started/ai-assistance/)

## Upgrading

Moving from v1.x to v2.x requires updating your `composer.json` constraint and removing legacy config keys **before** running `composer update`. Skipping this order causes a `RuntimeException` crash in the `post-update-cmd` step.

→ [v1.x → v2.0 upgrade guide](https://matheusmarnt.github.io/scoutify/upgrading/v2/)

## Documentation

- [Installation guide](docs/installation.md) — step-by-step setup, model registration, Tailwind config, customization
- [Production deployment](docs/production.md) — per-driver production configuration (Meilisearch, Algolia, Typesense, Database)
- [Upgrade guide](docs/upgrade.md) — v1.x → v2.0 migration steps

## Testing

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

MIT — see [LICENSE](LICENSE.md).
