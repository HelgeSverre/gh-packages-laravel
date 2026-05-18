# lornequinn/blog

Modular blog package suite for Laravel. One required core, optional packages for everything else. **Build a blog package, not a CMS.**

The editor surface lives in [MCP](https://modelcontextprotocol.io) — Claude talks to your site via [`lornequinn/blog-mcp`](packages/blog-mcp). There is no web admin UI in this suite, and there never will be. The site is a renderer.

## The packages

This repo is a monorepo. Each directory under `packages/` is an independently-installable Composer package, auto-mirrored to its own GitHub repo by the splitter on push to `main`.

| Package | Role | Status |
|---------|------|--------|
| [`lornequinn/blog-core`](packages/blog-core) | Post, Tag, DataType + Component registries, ShortcodeParser, BodyPipeline, `GET /posts/{slug}` | shipped v0.1 |
| [`lornequinn/blog-markdown`](packages/blog-markdown) | Markdown body renderer (League/CommonMark), wired into the BodyPipeline | shipped v0.1 |
| [`lornequinn/blog-mcp`](packages/blog-mcp) | MCP server — list/get/create/update/delete/publish/unpublish/describe-data-types/validate-post | shipped v0.1 |
| `lornequinn/blog-seo` | Meta tags, sitemap, OG, JSON-LD | Phase 4 |
| `lornequinn/blog-rss` | RSS, Atom, JSON Feed | Phase 4 |
| `lornequinn/blog-geo` | AI-citation surface — capsules, llms.txt | Phase 7+ |
| `lornequinn/blog-media` | Featured images, variants, alt-text enforcement | Phase 7+ |
| `lornequinn/blog-api` | Read-only JSON:API | Phase 7+ |
| `lornequinn/blog-search` | SQLite FTS5 default + Meilisearch driver | Phase 7+ |
| `lornequinn/blog-flatfile` | Markdown-file storage adapter (read-only at v1) | Phase 7+ |
| `lornequinn/blog-data-*` | Reusable DataType packages, extracted only on second use | as-needed |
| `lornequinn/blog-comments` | Threaded comments + moderation | deferred — first traffic-bearing consumer |
| `lornequinn/blog-auth` | Email + magic-link auth (required by `blog-comments`) | deferred with comments |
| `lornequinn/blog-dataview` | Obsidian/Dataview-style faceted query UI | future |

## Quick start for a consumer app

In a fresh Laravel 12.41+ or 13.x app:

```bash
composer require lornequinn/blog-core lornequinn/blog-markdown lornequinn/blog-mcp
php artisan vendor:publish --tag=blog-core-migrations
php artisan migrate
php artisan vendor:publish --tag=ai-routes
```

Register the MCP server in `routes/ai.php`:

```php
use Laravel\Mcp\Facades\Mcp;
use LorneQuinn\Blog\Mcp\BlogServer;

Mcp::local('blog', BlogServer::class);
```

Now `GET /posts/{slug}` renders any published Post with markdown + shortcode-resolved Component HTML, and Claude can read/write Posts via:

```bash
php artisan mcp:start blog
```

Point your Claude Code / Claude Desktop MCP host config at that command. See [packages/blog-mcp/README.md](packages/blog-mcp/README.md) for a sample `.mcp.json`.

## Architecture

Three concepts. Cleanly separated.

- **`Post`** — title, body, slug, status. Always renders with `posts.show`. No `kind` or `template` field — rendering is a Blade concern.
- **`DataType`** — structured queryable records attached to a Post (`RaceResults`, `EpisodeRatings`, `MovieMetadata`, …). Each gets its own Eloquent model and migration. Each declares Laravel validation rules.
- **`Component`** — Blade components that render a DataType. Multiple Components can render the same DataType differently (e.g. `FinishingTable` and `PodiumStrip` both render `RaceResults`).

**Component placement** — inline shortcodes in the body: `[[component-name attr=value]]`. Escape literals with a leading backslash: `\[[demo]]`.

**Body pipeline order:**

```
raw body
  → blog-core      (ShortcodeParser  — priority 0)
  → blog-markdown  (CommonMark       — priority 100, html_input='allow')
  → output HTML
```

Shortcodes resolve first, against the raw body. Markdown then passes the resolved HTML through. This is opposite to the natural reading and exists because CommonMark HTML-escapes `"` to `&quot;` in any text, which would otherwise break the shortcode regex on quoted attribute values. See [`packages/blog-markdown/README.md`](packages/blog-markdown/README.md) for the gory details.

**Storage** — DB-default (SQLite floor). Posts and DataType records are Eloquent models with proper migrations. Flatfile mode (read-only at v1) is the deliberate opt-in via `blog-flatfile` when that ships.

## Developing the packages

This repo uses Composer path repositories to symlink the packages into one another at dev time, so a change to `blog-core` is immediately visible to `blog-markdown` and `blog-mcp`.

Inside each package directory:

```bash
composer install
./vendor/bin/pest
./vendor/bin/phpstan analyse
```

From the monorepo root:

```bash
composer install                            # installs root dev deps (Pint)
./vendor/bin/pint --test                    # check style across all packages
./vendor/bin/pint                           # fix style
```

CI runs Pest + PHPStan (level 8 + Larastan) on PHP 8.3 and 8.4 for every package, plus Pint across the whole tree, on every push to `main` and every PR.

### Adding a new package

1. Create `packages/<name>/` with the usual scaffolding (`composer.json`, `src/`, `tests/`, `phpstan.neon`, `phpunit.xml`, `.gitignore`, `README.md`).
2. Add the package to `.github/workflows/ci.yml`'s test matrix.
3. Add the package to `.github/workflows/split.yml`'s split matrix.
4. Create the public mirror repo: `gh repo create lornequinn/<name> --public --description "..."`.
5. Push to `main` — the splitter populates the mirror automatically.

### Releasing

Tags follow `<package>/v<version>`, e.g. `blog-core/v0.2.0`. Pushing a tag triggers the splitter's `split_tag` job, which propagates the tag to the corresponding mirror. Packagist auto-updates from the mirror.

## Requirements

- PHP 8.3 or 8.4
- Laravel 12.41+ or 13.x

## Licence

MIT. See [LICENSE](LICENSE).
