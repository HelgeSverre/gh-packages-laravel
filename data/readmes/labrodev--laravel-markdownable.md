# labrodev/laravel-markdownable

Read Markdown files with YAML front matter, convert to HTML, and expose structured page data.

## Features

- **MarkdownPageFileReader** — Read `.md` files by slug, list pages, resolve paths.
- **FrontMatterParser** — Parse YAML front matter and body (Spatie YAML Front Matter).
- **MarkdownToHtmlConverter** — Convert Markdown to HTML (League CommonMark, GFM).
- **MarkdownPageReader** — Orchestrator: read → parse → convert → return `PageData`.
- **PageData** — Readonly value object with slug, title, meta fields, body, bodyHtml; `toArray()` for views/SEO.
- **Contracts** — `MarkdownPageFileReaderContract`, `FrontMatterParserContract`, `MarkdownConverterContract` for type-hinting and swapping implementations or mocks.
- **Markdownable facade** — Static access to the page reader.

## Installation

```bash
composer require labrodev/laravel-markdownable
```

The service provider is registered automatically.

## Configuration

The package uses `config('site.content.paths.pages')` by default for the pages directory. To override, publish the config or set `MARKDOWNABLE_PAGES_PATH` in your `.env`.

```bash
php artisan vendor:publish --tag=markdownable-config
```

## Usage

```php
use Labrodev\Markdownable\Facades\Markdownable;

$page = Markdownable::getPageBySlug('about');
if ($page !== null) {
    $page->title;       // string
    $page->bodyHtml;    // string (HTML)
    $page->toArray();   // array for Blade/SEO (slug, title, meta_title, meta_description, og_image, sitemap, canonical, body, body_html)
}
```

Use `PageData::toArray()` when passing to Blade or SEO so keys match the usual array shape (`meta_title`, `meta_description`, `og_image`, `body_html`, etc.).

## Development

```bash
cd package/laravel-markdownable
composer install
composer run test      # Pest
composer run pint      # Lint (read-only)
composer run pint:fix  # Format
composer run stan      # PHPStan
composer run analysis  # Pint fix + PHPStan
```
