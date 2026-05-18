# Atlas

Expose selected Laravel routes as agent-readable Markdown and JSON without rewriting the controller or Blade view that already powers the browser experience.

## Install

```bash
composer require dgtlss/atlas
```

Publish the config if you want to customize negotiation, headers, metadata, or cache behavior:

```bash
php artisan vendor:publish --tag=atlas-config
```

## Compatibility

| Atlas | PHP | Laravel |
| --- | --- | --- |
| 1.0.x | 8.1+ | 10.x, 11.x, 12.x |
| 1.0.x | 8.4+ | 13.x provisional |

Laravel 13 stays declared in package metadata, but it should be treated as provisional until the stable framework release can be validated in CI without the experimental flag.

## Quick Start

```php
use Illuminate\Support\Facades\Route;

Route::get('/docs/getting-started', fn () => view('docs.getting-started'))
    ->name('docs.show')
    ->atlas();
```

HTML stays the default response for browsers. Atlas only transforms the response when the route is explicitly opted in and the request asks for a supported machine-readable format:

```bash
curl -H "Accept: text/markdown" https://example.com/docs/getting-started
curl -H "Accept: application/json" https://example.com/docs/getting-started
curl "https://example.com/docs/getting-started?atlas=markdown"
```

## Stable v1 Surface

- Route macro: `->atlas(array $options = [])`
- Middleware alias: `atlas`
- Contracts:
  - `Dgtlss\Atlas\Contracts\MarkdownTransformer`
  - `Dgtlss\Atlas\Contracts\JsonTransformer`
  - `Dgtlss\Atlas\Contracts\AtlasPresenter`

## Route Options

```php
Route::get('/knowledge-base/{article}', ShowArticleController::class)->atlas([
    'formats' => ['markdown', 'json'],
    'presenter' => App\Atlas\ArticlePresenter::class,
    'cache' => ['ttl' => 900, 'vary' => ['locale']],
    'metadata' => ['section' => 'knowledge-base'],
    'query_parameter' => 'format',
    'markdown_transformer' => App\Atlas\CustomMarkdownTransformer::class,
    'json_transformer' => App\Atlas\CustomJsonTransformer::class,
]);
```

Supported route options in v1:

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `formats` | `array<string>` | `['markdown', 'json']` | Restrict which transformed formats a route will serve. |
| `presenter` | `class-string<AtlasPresenter>|null` | `null` | Use explicit presenter output instead of generic HTML transformation. |
| `cache` | `bool|int|array` | package cache config | Enable transformed-response caching and override TTL/store/vary keys. |
| `metadata` | `array` | `[]` | Merge route-specific metadata into transformed responses. |
| `query_parameter` | `string|false` | config value | Rename or disable the format query override for a route. |
| `markdown_transformer` | `class-string<MarkdownTransformer>` | config value | Override Markdown generation for a route. |
| `json_transformer` | `class-string<JsonTransformer>` | config value | Override JSON generation for a route. |

## Negotiation Rules

Atlas only transforms routes that explicitly opt in with `->atlas()`.

Negotiation precedence in v1 is:

1. Query parameter override, if enabled globally and for the route.
2. `Accept` header negotiation for the formats allowed on that route.
3. Fall back to the original HTML response.

Examples:

```bash
curl "https://example.com/docs/getting-started?atlas=json"
curl "https://example.com/docs/getting-started?format=markdown"
curl -H "Accept: application/json" https://example.com/docs/getting-started
```

## Presenter Contract

Presenters take precedence over the generic HTML transformers when you need precise structured output.

```php
namespace App\Atlas;

use Dgtlss\Atlas\Contracts\AtlasPresenter;
use Dgtlss\Atlas\Support\AtlasContext;

class ArticlePresenter implements AtlasPresenter
{
    public function toMarkdown(AtlasContext $context): string
    {
        return "# {$context->title()}\n\nCustom article body";
    }

    public function toJson(AtlasContext $context): array
    {
        return [
            'title' => $context->title(),
            'url' => $context->url(),
            'content' => 'Custom article body',
            'summary' => 'Custom summary',
            'headings' => [],
            'metadata' => $context->metadata(),
        ];
    }
}
```

## Response Shape

Markdown responses can include frontmatter-style metadata, followed by the transformed page body:

```md
---
title: "Atlas Docs"
url: "https://example.com/docs/getting-started"
metadata: {"section":"docs"}
---

# Atlas Docs
```

JSON responses use these stable top-level keys:

```json
{
  "title": "Page title",
  "url": "https://example.com/docs/getting-started",
  "content": "Markdown-friendly readable content",
  "summary": "Short summary",
  "headings": [
    {
      "level": 1,
      "text": "Getting started",
      "id": "getting-started"
    }
  ],
  "metadata": {
    "section": "docs"
  }
}
```

## Config Defaults

Published config defaults:

```php
return [
    'enabled' => true,
    'allowed_environments' => null,
    'default_formats' => ['markdown', 'json'],
    'negotiation' => [
        'accept_header' => true,
        'allow_query_parameter' => true,
        'query_parameter' => 'atlas',
    ],
    'metadata' => [
        'include_frontmatter' => true,
        'defaults' => [],
    ],
    'headers' => [
        'canonical' => true,
        'source_url' => true,
    ],
    'cache' => [
        'enabled' => false,
        'store' => null,
        'ttl' => 600,
        'vary' => ['locale'],
    ],
];
```

Important config behaviors:

- `enabled`: disables Atlas globally while leaving your original routes untouched.
- `allowed_environments`: restricts transformation to specific app environments.
- `cache.vary`: cache keys vary by route, format, and the configured dimensions such as `locale` or `user`.
- `metadata.include_frontmatter`: controls whether Markdown responses prepend frontmatter-style metadata.
- `headers.canonical` and `headers.source_url`: add canonical/source attribution headers to transformed responses.

## Fallback Behavior

- Atlas only transforms routes that explicitly call `->atlas()`.
- Existing auth and authorization still run before transformation.
- Redirects, downloads, binary responses, and streamed responses fall back to their original response in v1.
- Successful non-HTML responses also fall back to their original response unless a presenter is explicitly configured.
- Unsupported or disallowed requested formats fall back to the original route response.

## Headers and Caching

Transformed responses preserve the original successful status code and copy through existing headers and cookies where possible. Atlas adds:

- `X-Atlas-Format`
- `X-Atlas-Source-URL` when enabled
- `Link: <...>; rel="canonical"` when enabled

If caching is enabled, Atlas stores transformed payloads per route and format, then further varies them by the configured cache dimensions.

## v1 Guarantees and Non-Goals

Atlas 1.0 guarantees:

- explicit route opt-in
- original route/controller execution before transformation
- Markdown and JSON outputs only
- presenter precedence over generic HTML transformation
- fallback to the original response for unsupported response types

Atlas 1.0 does not aim to provide:

- perfect conversion of highly interactive layouts
- deep client-rendered SPA extraction
- additional machine-readable formats beyond Markdown and JSON

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local testing and CI-lane commands.
