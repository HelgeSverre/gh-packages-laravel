# Laravel IG Downloader

`rastographer/igdownloader` is a Laravel package for extracting Instagram media metadata and serving that media through signed Laravel routes.

The package currently provides:

- URL parsing for Instagram post, reel, TV, and reels URLs.
- URL parsing for Instagram stories, story highlights, and profile URLs.
- A strategy-based extraction pipeline.
- Signed preview and download routes.
- Upstream HTTP fetching with optional proxy resolution.
- A reusable service contract for host applications.

The package does not currently provide:

- A frontend UI.
- Database migrations.
- A finished GraphQL extraction strategy.

## Compatibility

This package currently supports:

- PHP `^8.2`
- Laravel `^12.0`

This is based on the package `composer.json`. The package is not declared compatible with Laravel 10 or Laravel 11.

## Package Status

Current implementation status:

- `StoryStrategy` is implemented for story and highlight URLs.
- `ProfileStrategy` is implemented for profile-picture URLs.
- `CanonicalStrategy` is implemented.
- `EmbedStrategy` is implemented.
- `GraphQLStrategy` is a placeholder and returns `null`.
- Route auto-discovery is enabled through the package service provider.

## Prerequisites

Before installing the package into any Laravel application, confirm the following:

1. The application runs on PHP `8.2` or newer.
2. The application runs on Laravel `12`.
3. The application can make outbound HTTPS requests to Instagram and the media CDN hosts.
4. The application has a working cache store.
5. The application can generate signed URLs.
6. The application has a writable storage path for normal Laravel runtime operations.

Additional prerequisites when proxy rotation is required:

1. You must provide a `ProxyResolver` implementation.
2. If that resolver reads from the database, the host application must own the schema and migrations for that proxy storage.

## Installation

### Option 1: Local path repository

This is the current installation method used in this repository.

Add a path repository to the host application's `composer.json`:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "packages/rastographer/igdownloader",
      "options": {
        "symlink": true
      }
    }
  ],
  "require": {
    "rastographer/igdownloader": "^0.1.3"
  }
}
```

Then install it:

```bash
composer update rastographer/igdownloader
php artisan package:discover --ansi
```

### Option 2: Standard Composer install

Use this after the package is moved to a VCS repository or Packagist.

```bash
composer require rastographer/igdownloader
php artisan package:discover --ansi
```

## Service Provider Registration

The package uses Laravel package auto-discovery.

You do not need to manually register `Rastographer\IgDownloader\IgDownloaderServiceProvider` if Composer package discovery is working.

## Publishing Configuration

Publish the package config with:

```bash
php artisan vendor:publish --tag=igdownloader-config
```

This publishes the config to:

```text
config/igdownloader.php
```

## Configuration Reference

Default configuration lives in `config/igdownloader.php`.

### `routes`

- `enabled`: Controls whether the package registers routes automatically.
- `prefix`: URL prefix for the package routes. Default: empty string.
- `name`: Route name prefix. Default: `igdownloader.`
- `middleware`: Middleware stack for package routes. Default: `['web']`
- `throttle`: Throttle middleware applied to the fetch route. Default: `throttle:10,1`

Important: with the current default `prefix` of `''`, the package registers these paths directly at the application root:

- `POST /fetch`
- `GET /img`
- `GET /dl`

If the host application already uses those paths, set a prefix such as `ig`.

### `cache`

- `ttl`: Extraction result cache TTL in seconds.
- `signed_url_ttl_minutes`: TTL for signed preview and download URLs.
- `source_ttl`: TTL for stored source URL keys used by preview routes.

### `http`

- `user_agent`: User agent sent to upstream requests.
- `connect_timeout`: HTTP connection timeout in seconds.
- `timeout`: Total HTTP request timeout in seconds.
- `verify`: Whether TLS certificate verification is enabled.

### `security`

- `allowed_hosts`: List of hosts and base domains that are allowed for preview/download proxying.

This is a mandatory security boundary. Only URLs matching these hosts are allowed to be streamed through the package routes.

### `logging`

- `channel`: Laravel log channel used by the package.

Environment variable:

```env
IGDL_LOG_CHANNEL=instagram
```

### `proxy`

- `enabled`: Enables proxy resolution.
- `resolver`: Fully-qualified class name implementing `Rastographer\IgDownloader\Contracts\ProxyResolver`
- `pool`: Static config-based proxy pool used when no custom resolver class is provided

### `strategies`

- `order`: Ordered list of extraction strategies to attempt.
- `map`: Strategy key to class mapping.

Current default order:

```php
['story', 'profile', 'canonical', 'embed', 'graphql']
```

When a consuming application has an older published `igdownloader` config, the service provider appends any missing built-in strategies automatically so story/profile support can still resolve without a config crash.

## Environment Variables

The current host config supports these environment variables:

```env
IG_USER_AGENT="Mozilla/5.0"
IG_ALLOWED_HOSTS="cdninstagram.com,fbcdn.net"
IG_DOWNLOAD_TTL=10
IG_CACHE_TTL=86400
IG_PROXY_ENABLED=false
IG_STRATEGY_ORDER=embed,canonical,graphql
IGDL_LOG_CHANNEL=instagram
```

## Registered Routes

When routes are enabled, the package registers:

- `POST /fetch` as `igdownloader.fetch`
- `GET /img` as `igdownloader.preview`
- `GET /dl` as `igdownloader.download`

If `routes.prefix` is set to `ig`, the effective URLs become:

- `POST /ig/fetch`
- `GET /ig/img`
- `GET /ig/dl`

## Route Contracts

### `POST igdownloader.fetch`

Expected request payload:

```json
{
  "url": "https://www.instagram.com/p/XXXXXXXXXXX/",
  "expect": "any"
}
```

Validation rules:

- `url`: required, must be a valid URL.
- `expect`: optional, must be one of `image`, `video`, or `any`.

Supported URL categories now include:

- Post URLs such as `https://www.instagram.com/p/.../`
- Reel URLs such as `https://www.instagram.com/reel/.../` and `https://www.instagram.com/reels/.../`
- TV URLs such as `https://www.instagram.com/tv/.../`
- Story URLs such as `https://www.instagram.com/stories/{username}/{storyId}/`
- Story highlight URLs such as `https://www.instagram.com/stories/highlights/{highlightId}/`
- Profile URLs such as `https://www.instagram.com/{username}/`

Current successful response shape:

```json
{
  "ok": true,
  "shortcode": "ABC123XYZ90",
  "cover": "https://your-app.test/img?...",
  "items": [
    {
      "position": 1,
      "kind": "video",
      "preview": "https://your-app.test/img?...",
      "download": "https://your-app.test/dl?...",
      "url": "https://cdninstagram.com/...",
      "size": null,
      "quality": "1080p"
    }
  ],
  "schema_version": 2
}
```

Current error response shape:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_URL",
    "title": "Invalid link",
    "message": "That does not look like a valid Instagram link.",
    "help": "Example: https://www.instagram.com/p/XXXXXXXXXX/"
  }
}
```

Possible error codes currently returned by the package controller:

- `INVALID_URL`
- `NO_MEDIA`
- `RATE_LIMIT`
- `NETWORK`

### `GET igdownloader.preview`

This route streams an image-like preview response inline.

Requirements:

- The route must be signed.
- The `key` query parameter must map to a stored source URL.
- The resolved source URL must pass `allowed_hosts`.

### `GET igdownloader.download`

This route streams a file download response.

Requirements:

- The route must be signed.
- `u` must be a base64 encoded upstream URL.
- `h` must equal `sha256(u-decoded)`.
- The decoded source URL must pass `allowed_hosts`.

## Programmatic Usage

### Parse a URL

```php
use Rastographer\IgDownloader\Contracts\Downloader;

$parsed = app(Downloader::class)->parseUrl('https://www.instagram.com/reel/ABC123XYZ90/');
```

Returned shape:

```php
[
    'shortcode' => 'ABC123XYZ90',
    'kind' => 'reel',
]
```

### Fetch media by shortcode

```php
use Rastographer\IgDownloader\Contracts\Downloader;
use Rastographer\IgDownloader\DTO\ExtractionContext;

$result = app(Downloader::class)->fetch(
    'ABC123XYZ90',
    new ExtractionContext(preferredKind: 'reel', requestId: 'req-123')
);
```

`Downloader::fetch()` remains the shortcode-oriented contract. For story, highlight, and profile URLs, prefer the URL-based action below.

### Use the package action

```php
use Rastographer\IgDownloader\Services\FetchMediaAction;

$payload = app(FetchMediaAction::class)->handle(
    'https://www.instagram.com/stories/instagramuser/xxxxxxxxxxxxxxx/',
    'req-123'
);
```

## Proxy Integration

The package supports two proxy models:

1. Static config pool using `proxy.pool`
2. Custom resolver via `proxy.resolver`

### Custom resolver contract

Implement:

```php
Rastographer\IgDownloader\Contracts\ProxyResolver
```

Contract methods:

- `resolve(): ?ProxyDefinition`
- `reportSuccess(?ProxyDefinition $proxy): void`
- `reportFailure(?ProxyDefinition $proxy, ?string $reason = null): void`

### Example: database-backed resolver

This repository currently provides one at `app/IgDownloader/DatabaseProxyResolver.php`.

It selects enabled proxies from the host application's `proxies` table and updates:

- `success_count`
- `fail_count`
- `status`
- `last_checked_at`

Important: the package does not ship the `proxies` table migration. That schema belongs to the host application.

## Security Model

The package is designed to avoid exposing raw upstream URLs directly to the frontend.

Security controls currently implemented:

- Signed preview route
- Signed download route
- Short-lived signed URL TTL
- Upstream host allowlist enforcement
- URL integrity hash on download requests

You should not disable `allowed_hosts` checking in production.

## Logging

The package logs extraction attempts, hits, misses, exceptions, and fetch success summaries through the configured Laravel log channel.

If your application does not define a dedicated `instagram` channel, point `IGDL_LOG_CHANNEL` to an existing channel such as `stack` or `stderr`.

## Testing

The package includes tests under `packages/rastographer/igdownloader/tests`.

If you are running the package tests against a consuming Laravel application bootstrap, point the package test harness at that application:

```bash
IGDL_TEST_BASE_PATH=/path/to/your-app php /path/to/your-app/vendor/bin/pest packages/rastographer/igdownloader/tests --compact
```

In this workspace, the tests were run against the `snapigdownloader` host app bootstrap.

## Updating the Package

### If installed as a local path repository

The host application uses the working tree directly. Update process:

1. Change the package code under `packages/rastographer/igdownloader`
2. Run:

```bash
composer update rastographer/igdownloader --no-scripts
php artisan package:discover --ansi
```

3. Re-run the relevant tests.

### If installed from VCS or Packagist

```bash
composer update rastographer/igdownloader
php artisan package:discover --ansi
```

If the package introduces new config keys, republish or manually merge config changes:

```bash
php artisan vendor:publish --tag=igdownloader-config --force
```

Use `--force` carefully because it overwrites the published config file.

## Releasing a New Version

Recommended release workflow:

1. Update package code.
2. Update package tests.
3. Update version in the package `composer.json`.
4. Tag the release in the package repository.
5. Update consuming applications to the new version constraint.

## Current Limitations

These are current, precise limitations of the package as implemented today:

- Laravel 12 only.
- PHP 8.2+ only.
- No UI components or pages.
- No package migrations.
- No built-in database proxy storage.
- `GraphQLStrategy` is not implemented.
- Story, highlight, and profile extraction still depend on public Instagram markup remaining parseable.
- Public-story and highlight availability still depends on what Instagram exposes without authentication.

## Recommended Production Requirements

For production use, the consuming application should provide:

1. A stable cache backend such as Redis or Memcached.
2. A dedicated log channel.
3. A proxy resolver if upstream request rotation is required.
4. Monitoring for upstream rate limits and extraction failures.
5. A controlled route prefix if `/fetch`, `/img`, or `/dl` conflict with existing application routes.

## File Map

Core package entry points:

- `src/IgDownloaderServiceProvider.php`
- `src/Services/DownloaderManager.php`
- `src/Services/FetchMediaAction.php`
- `src/Services/InstagramHtmlMediaExtractor.php`
- `src/Strategies/StoryStrategy.php`
- `src/Strategies/ProfileStrategy.php`
- `src/Strategies/CanonicalStrategy.php`
- `src/Strategies/EmbedStrategy.php`
- `routes/web.php`

Host application integration example:

- `config/igdownloader.php`
- `app/IgDownloader/DatabaseProxyResolver.php`

Thank you!
