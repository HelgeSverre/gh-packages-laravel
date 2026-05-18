# Laravel URL

[![Latest Version on Packagist](https://img.shields.io/packagist/v/atldays/laravel-url.svg?logo=packagist&style=for-the-badge)](https://packagist.org/packages/atldays/laravel-url)
[![Total Downloads](https://img.shields.io/packagist/dt/atldays/laravel-url.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/atldays/laravel-url/stats)
[![CI](https://img.shields.io/github/actions/workflow/status/atldays/laravel-url/ci.yml?style=for-the-badge&label=CI)](https://github.com/atldays/laravel-url/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE.md)

`atldays/laravel-url` is a Laravel package for working with URLs in a more predictable, framework-friendly way.

At its core, the package builds on top of [spatie/url](https://github.com/spatie/url), adds Laravel integration, supports browser-specific schemes, provides sanitizer pipelines for unsafe input, ships validation rules, request macros, and optional integration with `spatie/laravel-data`.

## Why This Package Exists

Working with URLs in real applications is usually messier than simply parsing a clean string.

Inputs may come from:

- request headers such as `Origin` and `Referer`
- user-submitted form fields
- browser-specific URLs like `chrome-extension://...`
- values that contain control characters or broken UTF-8
- DTOs and data objects that need automatic casting

This package gives you a single Laravel-oriented layer for those cases while still relying on the excellent parsing foundation provided by `spatie/url`.

## Features

- `Atldays\Url\Url` value object built on top of `spatie/url`
- support for browser-specific schemes:
  `chrome-extension`, `moz-extension`, `chrome`, `opera`, `edge`
- URL factory with sanitizer profiles
- configurable sanitizer pipelines
- Laravel facade for short, expressive usage
- validation rules for generic URLs and browser URLs
- request macros for extracting typed URLs from headers
- optional `spatie/laravel-data` casts and transformer
- translations for validation messages

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`

## Installation

Install the package:

```bash
composer require atldays/laravel-url
```

If you want to customize sanitizer profiles, publish the config:

```bash
php artisan vendor:publish --tag="url-config"
```

If you want to use `spatie/laravel-data` integration, install it separately:

```bash
composer require spatie/laravel-data
```

## Quick Start

### Use the facade

```php
use Atldays\Url\Facades\Url;

$url = Url::make('https://example.com/path?sort=desc');
$url = Url::make(' "https://example.com/path?sort=desc" ', 'header');
$url = Url::makeOrNull($request->header('origin'), 'header');
```

### Use the factory directly

```php
use Atldays\Url\UrlFactory;

$factory = app(UrlFactory::class);

$url = $factory->make('https://example.com');
$safeUrl = $factory->makeOrNull($rawValue, 'header');
```

## The URL Value Object

The package provides `Atldays\Url\Url`, which extends Spatie's URL object and adds Laravel-oriented behavior.

### Browser-specific schemes

```php
use Atldays\Url\Url;

$url = Url::fromString('chrome-extension://extension-id/options.html');

$url->hasBrowserScheme(); // true
```

### Detect IP hosts

```php
$url = Url::fromString('https://127.0.0.1:8080/ping');

$url->isIpHost(); // true
```

### Get the base URL

```php
$url = Url::fromString('https://example.com:8443/path?x=1');

$url->getBase(); // https://example.com:8443
```

## Factory And Sanitizer Profiles

The recommended entry point for application code is `UrlFactory` or the `Url` facade.

Before the URL object is created, the factory runs the input through a configurable sanitizer pipeline.

### Default behavior

When you do not pass a profile explicitly, the factory uses the configured default profile:

```php
$url = Url::make($value);
```

### Explicit profile

```php
$url = Url::make($value, 'header');
```

### Available profiles

The package currently ships with two profiles:

- `default`
  General-purpose cleanup for regular application input
- `header`
  Cleanup for header values such as `Origin` and `Referer`

### Built-in sanitizers

- `HeaderValueSanitizer`
  Trims wrapping quotes and header-specific whitespace noise
- `ControlCharsSanitizer`
  Removes control characters before parsing
- `Utf8Sanitizer`
  Normalizes broken UTF-8 before the final URL object is created

### Configuration

```php
use Atldays\Url\Sanitizers\ControlCharsSanitizer;
use Atldays\Url\Sanitizers\HeaderValueSanitizer;
use Atldays\Url\Sanitizers\Utf8Sanitizer;

return [
    'default_profile' => 'default',

    'profiles' => [
        'default' => [
            ControlCharsSanitizer::class,
            Utf8Sanitizer::class,
        ],

        'header' => [
            HeaderValueSanitizer::class,
            ControlCharsSanitizer::class,
            Utf8Sanitizer::class,
        ],
    ],
];
```

You can add your own sanitizer classes as long as they implement:

```php
Atldays\Url\Sanitizers\UrlSanitizer
```

## Validation Rules

The package includes Laravel validation rules for both standard URLs and browser-specific URLs.

### Generic URL rule

```php
use Atldays\Url\Rules\Url;

Validator::make($data, [
    'website' => ['nullable', new Url()],
]);
```

This rule:

- supports `nullable`
- rejects non-string values
- accepts browser-specific URLs
- validates regular web URLs using Laravel-friendly behavior

### Browser URL rule

```php
use Atldays\Url\Rules\BrowserUrl;

Validator::make($data, [
    'extension_url' => ['nullable', new BrowserUrl()],
]);
```

This rule only accepts browser-specific schemes such as:

- `chrome-extension://...`
- `moz-extension://...`
- `chrome://...`
- `edge://...`
- `opera://...`

## Request Macros

The service provider registers a few request macros that return typed URL objects.

### `getUrlFromHeader`

```php
$url = request()->getUrlFromHeader('origin');
```

### `getOriginUrl`

```php
$origin = request()->getOriginUrl();
```

### `getRefererUrl`

```php
$referer = request()->getRefererUrl();
```

### `getFullUrl`

```php
$current = request()->getFullUrl();
```

These macros:

- parse values through the package factory
- use the `header` profile when reading headers
- return `null` or the provided default when parsing fails
- reject header URLs with IP hosts

## `spatie/laravel-data` Integration

If your project uses `spatie/laravel-data`, the package provides casts and a transformer under `src/Data`.

### `UrlCast`

Use `UrlCast` when the incoming value must already be a valid URL.

```php
use Atldays\Url\Data\Casts\UrlCast;
use Atldays\Url\Data\Transformers\UrlTransformer;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;

final class LinkData extends Data
{
    public function __construct(
        #[WithCast(UrlCast::class)]
        #[WithTransformer(UrlTransformer::class)]
        public \Atldays\Url\Contracts\Url|null $url,
    ) {}
}
```

### `ToUrlCast`

Use `ToUrlCast` when you want to coerce host-like values into full URLs.

Examples it can handle:

- `https://example.com/path`
- `example.com/path`
- `example.com`

```php
use Atldays\Url\Data\Casts\ToUrlCast;

final class HostData extends Data
{
    public function __construct(
        #[WithCast(ToUrlCast::class)]
        public \Atldays\Url\Contracts\Url|null $url,
    ) {}
}
```

### `UrlTransformer`

`UrlTransformer` converts the URL object back to its string representation when the data object is transformed.

## Contracts

The package exposes a small set of contracts under `Atldays\Url\Contracts`, including:

- `Url`
- `Query`
- `Segment`
- `Urlable`

These contracts are useful when you want to type against abstractions instead of the concrete URL implementation.

## Translations

Validation messages are provided through the package translation namespace:

```php
url::validation.url
url::validation.browser_url
```

If you want to publish the package translations into your Laravel application and customize them, run:

```bash
php artisan vendor:publish --tag="url-translations"
```

After publishing, you can override the package translations in:

```text
lang/vendor/url
```

## Testing

Run the test suite:

```bash
composer test
```

Check formatting:

```bash
composer format:test
```

Auto-fix formatting:

```bash
composer format
```

## Credits

- [Spatie URL](https://github.com/spatie/url) for the parsing foundation
- [Spatie Laravel Package Tools](https://github.com/spatie/laravel-package-tools)
- [Spatie Laravel Data](https://github.com/spatie/laravel-data) for optional DTO integration

## License

The MIT License. Please see [LICENSE.md](LICENSE.md) for more information.
