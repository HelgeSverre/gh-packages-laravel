# Laravel Markdown for Agents

[![Tests](https://github.com/moneo/laravel-markdown-for-agents/actions/workflows/tests.yml/badge.svg)](https://github.com/moneo/laravel-markdown-for-agents/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/moneo/laravel-markdown-for-agents/graph/badge.svg)](https://codecov.io/gh/moneo/laravel-markdown-for-agents)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/moneo/markdown-for-agents.svg)](https://packagist.org/packages/moneo/markdown-for-agents)
[![PHP Version](https://img.shields.io/packagist/php-v/moneo/markdown-for-agents.svg)](https://packagist.org/packages/moneo/markdown-for-agents)
[![Laravel Version](https://img.shields.io/badge/laravel-11.x%20%7C%2012.x-FF2D20.svg)](https://laravel.com)
[![PHPStan Level](https://img.shields.io/badge/phpstan-level%208-4FC921.svg)](https://phpstan.org)
[![Code Style](https://img.shields.io/badge/code%20style-Laravel%20Pint-F36E21.svg)](https://laravel.com/docs/pint)
[![License](https://img.shields.io/packagist/l/moneo/markdown-for-agents.svg)](https://packagist.org/packages/moneo/markdown-for-agents)

A Laravel package that unifies Cloudflare's three Markdown conversion services under one elegant API.

## Services

| Service | Driver Key | Description |
|---|---|---|
| **Markdown for Agents** | `agents` | Content negotiation via `Accept: text/markdown` on any Cloudflare-enabled URL. Free, no auth. |
| **Workers AI toMarkdown** | `workers_ai` | Converts files (PDF, DOCX, images, etc.) to Markdown via REST API. Auth required. |
| **Browser Rendering** | `browser` | Headless browser renders JS-heavy pages then converts to Markdown. Auth required. |

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x

## Installation

```bash
composer require moneo/markdown-for-agents
```

Publish the config file:

```bash
php artisan vendor:publish --tag=markdown-for-agents-config
```

## Configuration

Add your Cloudflare credentials to `.env`:

```env
# Required for workers_ai and browser drivers
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN=your-api-token

# Optional overrides
MFA_DRIVER=agents
MFA_CACHE=true
MFA_CACHE_STORE=redis
MFA_CACHE_TTL=3600
```

The `agents` driver does not require credentials.

## Usage

### Convert a URL

```php
use Moneo\MarkdownForAgents\Facades\MarkdownForAgents;

$result = MarkdownForAgents::url('https://example.com')->convert();

$result->markdown;       // string — the converted content
$result->tokens;         // int — estimated token count
$result->contentSignals; // ?array — ['ai-train' => 'yes', ...]
$result->driver;         // string — which driver was used
$result->fromCache;      // bool — served from cache?
```

### Convert a file

```php
// Single file
$result = MarkdownForAgents::file('/path/to/document.pdf')->convert();

// Laravel UploadedFile
$result = MarkdownForAgents::file($request->file('document'))->convert();

// Batch conversion
$results = MarkdownForAgents::files([$pdf, $image, $spreadsheet])->convert();

foreach ($results as $result) {
    echo "{$result->name}: {$result->tokens} tokens\n";
}
```

### Convert raw HTML

```php
$result = MarkdownForAgents::driver('browser')
    ->html('<div><h1>Hello</h1><p>World</p></div>')
    ->convert();
```

### Choose a driver

```php
// Use the browser driver for JS-heavy pages
$result = MarkdownForAgents::driver('browser')
    ->url('https://spa-app.com')
    ->waitUntil('networkidle0')
    ->convert();
```

### Fallback

If the primary driver fails, automatically retry with another:

```php
$result = MarkdownForAgents::url('https://example.com')
    ->withFallback('browser')
    ->convert();
```

### Browser options

```php
$result = MarkdownForAgents::driver('browser')
    ->url('https://example.com')
    ->waitUntil('networkidle0')
    ->userAgent('MyBot/1.0')
    ->rejectPatterns(['/^.*\.(css|font)/'])
    ->cookies([['name' => 'session', 'value' => 'abc', 'domain' => '.example.com']])
    ->authenticate('user', 'pass')
    ->convert();
```

### Cache control

Caching is enabled by default for URL and HTML conversions:

```php
// Skip cache for this request
$result = MarkdownForAgents::url($url)->noCache()->convert();

// Custom TTL (seconds)
$result = MarkdownForAgents::url($url)->cache(7200)->convert();

// Clear cache
MarkdownForAgents::clearCache('https://example.com');
MarkdownForAgents::flushCache();
```

### Conditional fluent API

`PendingConversion` uses Laravel's `Conditionable` and `Tappable` traits:

```php
$result = MarkdownForAgents::url($url)
    ->when($useBrowser, fn ($c) => $c->waitUntil('networkidle0'))
    ->unless($isAdmin, fn ($c) => $c->noCache())
    ->convert();
```

### Supported formats

```php
$formats = MarkdownForAgents::supportedFormats();
// Returns SupportedFormat[] — delegates to Workers AI
```

## Driver Comparison

| Scenario | Recommended Driver |
|---|---|
| Cloudflare-enabled site | `agents` (fastest, free) |
| PDF, DOCX, XLSX, images | `workers_ai` (only option) |
| SPA / JS-heavy page | `browser` (full render) |
| Non-Cloudflare site | `browser` |
| Raw HTML string | `browser` |
| Make your app agent-ready | Middleware (local, no API) |

## Middleware

Add the middleware to routes to make your Laravel app respond with Markdown when AI agents request it:

```php
Route::get('/blog/{slug}', [BlogController::class, 'show'])
    ->middleware('markdown-for-agents');
```

When a request includes `Accept: text/markdown`, the middleware converts HTML responses to Markdown locally using `league/html-to-markdown`. No Cloudflare API calls are made.

Response headers added:
- `Content-Type: text/markdown; charset=utf-8`
- `Vary: accept`
- `x-markdown-tokens: {count}`
- `Content-Signal: ai-train=yes, search=yes, ai-input=yes`

## Artisan Commands

```bash
# Convert a URL
php artisan markdown:convert https://example.com
php artisan markdown:convert https://example.com --driver=browser
php artisan markdown:convert https://example.com --save=output.md

# Convert a file
php artisan markdown:convert /path/to/document.pdf

# List supported formats
php artisan markdown:formats

# Clear cache
php artisan markdown:cache:clear
php artisan markdown:cache:clear --url=https://example.com
```

## Events

Two events are dispatched during conversions:

- `MarkdownConverted` — on success (includes result, source, duration)
- `ConversionFailed` — on failure (includes source, driver, exception)

```php
use Moneo\MarkdownForAgents\Events\MarkdownConverted;

Event::listen(MarkdownConverted::class, function (MarkdownConverted $event) {
    Log::info("Converted {$event->source} in {$event->duration}s");
});
```

## Custom Drivers

Register custom drivers that implement `MarkdownConverterInterface`:

```php
use Moneo\MarkdownForAgents\Facades\MarkdownForAgents;

MarkdownForAgents::extend('custom', function ($app) {
    return new MyCustomDriver($app['config']);
});

$result = MarkdownForAgents::driver('custom')->url($url)->convert();
```

## Testing

The package uses `orchestra/testbench`. All tests mock HTTP responses -- no real API calls.

```bash
composer test
```

When testing your own app's code that uses this package, mock the facade:

```php
use Moneo\MarkdownForAgents\Facades\MarkdownForAgents;
use Moneo\MarkdownForAgents\DTOs\ConversionResult;

MarkdownForAgents::shouldReceive('url->convert')
    ->andReturn(new ConversionResult(...));
```

## License

MIT
