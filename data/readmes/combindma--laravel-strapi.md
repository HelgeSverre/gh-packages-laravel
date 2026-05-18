# Laravel Strapi

[![Latest Version on Packagist](https://img.shields.io/packagist/v/combindma/laravel-strapi.svg?style=flat-square)](https://packagist.org/packages/combindma/laravel-strapi)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/combindma/laravel-strapi/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/combindma/laravel-strapi/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/combindma/laravel-strapi/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/combindma/laravel-strapi/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/combindma/laravel-strapi.svg?style=flat-square)](https://packagist.org/packages/combindma/laravel-strapi)

`combindma/laravel-strapi` is a Laravel package for consuming a Strapi v5 GraphQL API through a single service class. It ships with a configured GraphQL client, a Laravel facade, built-in caching, and DTOs for common content shapes such as SEO, pages, services, social links, privacy content, and contact details.

Instead of scattering GraphQL requests across controllers and views, the package centralizes Strapi access behind a small Laravel-friendly API. You can use its ready-made methods for structured content or drop down to the low-level `query()` method when you need to run a custom GraphQL query.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Cache and Webhooks](#cache-and-webhooks)
- [Expected Strapi Content Structure](#expected-strapi-content-structure)
- [Testing](#testing)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Credits](#credits)
- [License](#license)

## About Combind Agency

[Combine Agency](https://combind.ma?utm_source=github&utm_medium=banner&utm_campaign=package_name) is a leading web development agency specializing in building innovative and high-performance web applications using modern technologies. Our experienced team of developers, designers, and project managers is dedicated to providing top-notch services tailored to the unique needs of our clients.

If you need assistance with your next project or would like to discuss a custom solution, please feel free to [contact us](mailto:hello@combind.ma) or visit our [website](https://combind.ma?utm_source=github&utm_medium=banner&utm_campaign=package_name) for more information about our services. Let's build something amazing together!


## Installation

You can install the package via composer:

```bash
composer require combindma/laravel-strapi
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-strapi-config"
```

This is the contents of the published config file:

```php
return [
    'graphql_url' => env('STRAPI_GRAPHQL_URL'),
    'token' => env('STRAPI_TOKEN'),
    'timeout' => (int) env('STRAPI_TIMEOUT', 30),
    'webhook_secret' => env('STRAPI_WEBHOOK_SECRET', ''),
];
```

Example `.env` values:

```env
STRAPI_GRAPHQL_URL=https://your-strapi-domain.com/graphql
STRAPI_TOKEN=your-strapi-api-token
STRAPI_TIMEOUT=30
STRAPI_WEBHOOK_SECRET=your-strapi-webhook-secret
```

## Usage

The package registers `Combindma\Strapi\Strapi` as a singleton and exposes it through the `Strapi` facade.

### Resolve the service

```php
use Combindma\Strapi\Strapi;

$strapi = app(Strapi::class);
```

Or use the facade:

```php
use Combindma\Strapi\Facades\Strapi;

$seo = Strapi::seo('home');
```

### Available methods

The `Strapi` class currently provides these higher-level methods:

- `seo(string $documentId): SeoDto`
- `page(string $documentId): PageDto`
- `socialNetworks(): SocialDto`
- `privacy(): ?string`
- `contactInfos(): ContactDto`
- `services(): Illuminate\Support\Collection`
- `service(string $slug): ServicePageDto`
- `clearModel(string $model, ?string $documentId, ?string $slug): void`
- `query(GraphQL\Query $query, bool $resultsAsArray = false, array $variables = []): object|array`

All content methods are cached with Laravel's cache store, so repeated calls do not hit Strapi again until you clear the relevant cache entries.

### Example: fetch SEO and page content

```php
use Combindma\Strapi\Facades\Strapi;

$seo = Strapi::seo('home');
$page = Strapi::page('home');

$title = $seo->metaTitle;
$heroTitle = $page->hero?->title;
$sections = $page->sections;
```

### Example: fetch the services listing

```php
use Combindma\Strapi\Facades\Strapi;

$services = Strapi::services();

foreach ($services as $service) {
    echo $service->title;
    echo $service->slug;
    echo $service->image->url;
}
```

### Example: fetch a service details page

```php
use Combindma\Strapi\Facades\Strapi;

$service = Strapi::service('strategy');

$hero = $service->hero;
$logos = $service->logos->media;
$seo = $service->seo;
```

If the requested service does not exist, `service()` aborts with a `404`.

### Example: clear cached content manually

```php
use Combindma\Strapi\Facades\Strapi;

Strapi::clearModel('page', 'home', 'welcome');
Strapi::clearModel('service', null, 'strategy');
Strapi::clearModel('social', null, null);
```

This clears the relevant cache keys for the given model and also flushes the tagged cache for that model.

### Example: run a custom GraphQL query

```php
use Combindma\Strapi\Facades\Strapi;
use GraphQL\Query;
use GraphQL\RawObject;

$query = (new Query('page'))
    ->setArguments([
        'documentId' => new RawObject('"home"'),
    ])
    ->setSelectionSet([
        'title',
    ]);

$data = Strapi::query($query);

$title = $data->page->title;
```

### Returned data objects

The package maps Strapi responses into readonly DTOs so your application code can work with typed objects instead of raw arrays. Responsive images are normalized into `ResponsiveImageDto`, including a generated `srcset` string when Strapi image formats are available.

## Cache and Webhooks

This package stores Strapi content in Laravel cache forever after the first request. For example, the first time your application calls `Strapi::page('home')`, the content is fetched from Strapi and then saved in cache. Every later call reads from cache until that content is cleared.

When a user updates content in Strapi CMS, you should trigger cache invalidation through the built-in webhook endpoint so Laravel can forget the stale content and fetch the fresh version on the next request.

### 1. Configure the webhook secret

Add the webhook secret to your Laravel environment:

```env
STRAPI_WEBHOOK_SECRET=your-strapi-webhook-secret
```

The same secret must also be used in your Strapi webhook configuration.

### 2. Exclude the webhook route from CSRF protection

In `bootstrap/app.php`, add the exception inside the `withMiddleware()` callback:

```php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: ['/strapi/webhook']);
    })
    ->create();
```

### 3. Configure the webhook in Strapi

In Strapi, create a webhook that sends requests when content is updated.

Use this Laravel endpoint:

```text
https://domain.com/strapi/webhook
```

Use the same webhook secret you configured in Laravel.

In the Strapi webhook headers, add:

```text
Signature: your-strapi-webhook-secret
```

The package validates the `Signature` header against `STRAPI_WEBHOOK_SECRET` before clearing cache.

### 4. What happens when Strapi sends the webhook

When Strapi sends a valid webhook request, the package webhook controller calls `clearModel()` and removes the relevant cached content.

Examples:

- Updating a page can clear `page_{documentId}` and `seo_{documentId}`.
- Updating a service can clear `service_{slug}` and the tagged `service` cache.
- Updating singleton content such as social links, privacy content, or contact info can clear their single cached keys.

After that, the next request to Laravel loads the updated content from Strapi and stores it in cache again.

## Expected Strapi Content Structure

This package expects your Strapi project to expose specific GraphQL content types and field names. The easiest way to use the package successfully is to keep your Strapi content model aligned with the queries below.

If your content structure differs, you can still use the low-level `query()` method and map the response yourself.

### General rules

- The package expects the Strapi GraphQL API to be enabled.
- Field names should match exactly, because the package queries them directly.
- `seo()` and `page()` both read from the `page` GraphQL type by `documentId`.
- `service()` reads from the `services` GraphQL collection by `slug`.
- `documentId` is a Strapi system field in Strapi v5, so you do not need to create it manually.
- For rich content fields such as `content`, this package currently expects a string value. If you use a rich text editor, prefer one that stores HTML output.

### Recommended model overview

Use the following Strapi structure:

- `page` as a collection type
- `services` as a collection type
- `social` as a single type
- `privacy` as a single type
- `contact` as a single type
- Reusable components for `seo`, `hero`, `section`, `feature`, and `logos`

### `page` collection type

Used by:

- `seo(string $documentId)`
- `page(string $documentId)`

Recommended fields on `page`:

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `documentId` | System field | Automatically provided by Strapi v5. |
| `seo` | Component (single) | Required if you want `seo(string $documentId)` to work, because the package fetches SEO from `page.seo`. Use the reusable `seo` component described below. |
| `hero` | Component (single) | Use the reusable `hero` component described below. |
| `sections` | Component (repeatable) | Use the reusable `section` component described below. |

### `social` singleton

Used by:

- `socialNetworks()`

Recommended fields:

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `facebook` | Short text | URL string. |
| `linkedin` | Short text | URL string. |
| `instagram` | Short text | URL string. |
| `twitter` | Short text | URL string. |

### `privacy` singleton

Used by:

- `privacy()`

Recommended fields:

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `content` | Long text or custom rich text field returning HTML | Recommended when you want to render legal or CMS-authored content directly in Laravel views. |

### `contact` singleton

Used by:

- `contactInfos()`

Recommended fields:

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `email` | Short text | You can also use Strapi's `Email` field if you prefer validation in the CMS. |
| `phone` | Short text | Store formatted phone numbers as strings. |
| `address` | Long text | Useful for multiline addresses. |

### `services` collection type

Used by:

- `services()`
- `service(string $slug)`

Recommended fields on each `services` entry:

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `title` | Short text | Main service name. |
| `slug` | UID | Used by `service(string $slug)`. Make it unique. |
| `publishedAt` | System field | Automatically provided when Draft & Publish is enabled. |
| `updatedAt` | System field | Automatically provided by Strapi. |
| `hero` | Component (single) | Use the reusable `hero` component described below. |
| `logos` | Component (single) | Use the reusable `logos` component described below. |
| `sections` | Component (repeatable) | Use the reusable `section` component described below. |
| `seo` | Component (single) | Use the reusable `seo` component described below. |

### Recommended reusable components

#### `seo` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `metaTitle` | Short text | SEO page title. |
| `metaDescription` | Long text | SEO meta description. |
| `noIndex` | Boolean | Enables or disables indexing. |
| `metaImage` | Media (single image) | Open Graph / sharing image. |

#### `hero` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `title` | Short text | Main heading. |
| `label` | Short text | Small supporting label. |
| `description` | Long text | Introductory copy. |
| `cta` | Short text | CTA label text. |
| `image` | Media (single image) | Main hero image. |
| `video` | Media (single video) | Optional hero video. |

#### `section` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `title` | Short text | Section heading. |
| `label` | Short text | Small supporting label. |
| `content` | Long text or custom rich text field returning HTML | Best if your editor stores HTML output. |
| `bgColor` | Short text | Currently queried by the package, so keep the field present even if you only store a hex color. |
| `image` | Media (single image) | Optional section image. |
| `video` | Media (single video) | Optional section video. |
| `features` | Component (repeatable) | Use the reusable `feature` component described below. |

#### `feature` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `title` | Short text | Feature heading. |
| `label` | Short text | Small supporting label. |
| `description` | Long text | Feature copy. |
| `width` | Short text | Currently queried by the package, so keep the field present if your layout uses it. |
| `image` | Media (single image) | Optional feature image. |

#### `logos` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `title` | Short text | Optional section heading. |
| `media` | Component (repeatable) | Create a small repeatable component such as `logo_item` with one `image` field. |

#### `logo_item` component

| Field | Recommended Strapi field type | Notes |
| --- | --- | --- |
| `image` | Media (single image) | One client or partner logo. |

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Combind](https://github.com/combindma)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
