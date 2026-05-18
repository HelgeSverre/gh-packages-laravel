# T.LY Laravel URL Shortener API

Laravel wrapper for the [T.LY API](https://t.ly/docs), including full support for the endpoints in the T.LY Postman collection.

## Create an API Key

1. Register a [T.LY account](https://t.ly/register).
2. Create an [API token](https://t.ly/settings#/api).

## Installation

```bash
composer require tly/laravel-url-shortener-api
```

Publish config:

```bash
php artisan vendor:publish --provider="TLY\\LaravelUrlShortener\\TLYServiceProvider" --tag=config
```

Set environment values:

```dotenv
TLY_API_TOKEN=your_api_token_here
TLY_API_BASE_URL=https://api.t.ly/api/v1
```

## Usage

```php
use TLY\LaravelUrlShortener\Facades\TLYApi;
```

All methods return decoded JSON from the T.LY API.

### Quick Start

```php
$created = TLYApi::create([
    'long_url' => 'https://example.com',
    'description' => 'Example Link',
]);

$stats = TLYApi::stats('https://t.ly/abc1', [
    'start_date' => '2025-08-01T00:00:00Z',
    'end_date' => '2025-08-31T23:59:59Z',
]);
```

## Method Reference

### Short Links

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/link/shorten` | `POST` | `create(array $data)` |
| `/api/v1/link` | `GET` | `get(string $shortUrl)` |
| `/api/v1/link` | `PUT` | `update(array $data)` |
| `/api/v1/link` | `DELETE` | `delete(string $shortUrl)` |
| `/api/v1/link/list` | `GET` | `list(array $params = [])` |
| `/api/v1/link/list` | `GET` | `listShortLinks(array $params = [])` |
| `/api/v1/link/expand` | `POST` | `expand(string $shortUrl, ?string $password = null, array $payload = [])` |
| `/api/v1/link/bulk` | `POST` | `bulk(array $payload)` |
| `/api/v1/link/bulk/update` | `POST` | `bulkUpdate(array $payload)` |
| `/api/v1/link/stats` | `GET` | `stats(string $shortUrl, array $params = [])` |

Example:

```php
$expanded = TLYApi::expand('https://t.ly/OYXL', 'password123');

$links = TLYApi::listShortLinks([
    'search' => 'amazon',
    'tag_ids' => [1, 2, 3],
    'pixel_ids' => [1, 2, 3],
]);
```

### OneLinks

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/onelink/stats` | `GET` | `oneLinkStats(string $shortUrl, ?string $startDate = null, ?string $endDate = null, array $params = [])` |
| `/api/v1/onelink/stat` | `DELETE` | `deleteOneLinkStats(string $shortUrl)` |
| `/api/v1/onelink/list` | `GET` | `listOneLinks(array $params = [])` |

Example:

```php
$oneLinkStats = TLYApi::oneLinkStats(
    'https://t.ly/one',
    '2024-06-01',
    '2024-06-08'
);

$oneLinks = TLYApi::listOneLinks(['page' => 1]);
```

### UTM Preset Methods

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/link/utm-preset` | `POST` | `createUtmPreset(array $payload)` |
| `/api/v1/link/utm-preset` | `GET` | `listUtmPresets(array $params = [])` |
| `/api/v1/link/utm-preset/{id}` | `GET` | `getUtmPreset($id)` |
| `/api/v1/link/utm-preset/{id}` | `PUT` | `updateUtmPreset($id, array $payload)` |
| `/api/v1/link/utm-preset/{id}` | `DELETE` | `deleteUtmPreset($id)` |

Example:

```php
$preset = TLYApi::createUtmPreset([
    'name' => 'Newsletter Launch',
    'source' => 'newsletter',
    'medium' => 'email',
    'campaign' => 'fall_launch',
]);
```

### Pixels

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/link/pixel` | `POST` | `createPixel(array $payload)` |
| `/api/v1/link/pixel` | `GET` | `listPixels(array $params = [])` |
| `/api/v1/link/pixel/{id}` | `GET` | `getPixel($id)` |
| `/api/v1/link/pixel/{id}` | `PUT` | `updatePixel($id, array $payload)` |
| `/api/v1/link/pixel/{id}` | `DELETE` | `deletePixel($id)` |

Example:

```php
$pixel = TLYApi::createPixel([
    'name' => 'GTMPixel',
    'pixel_id' => 'GTM-xxxx',
    'pixel_type' => 'googleTagManager',
]);
```

### QR Codes

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/link/qr-code` | `GET` | `getQrCode(string $shortUrl, array $params = [])` |
| `/api/v1/link/qr-code` | `PUT` | `updateQrCode(array $payload)` |

Example:

```php
$qr = TLYApi::getQrCode('https://t.ly/c55j', [
    'output' => 'base64',
    'format' => 'eps',
]);
```

### Tags

| API Endpoint | Method | Service Method |
|---|---|---|
| `/api/v1/link/tag` | `GET` | `listTags(array $params = [])` |
| `/api/v1/link/tag` | `POST` | `createTag(array $payload)` |
| `/api/v1/link/tag/{id}` | `GET` | `getTag($id)` |
| `/api/v1/link/tag/{id}` | `PUT` | `updateTag($id, array $payload)` |
| `/api/v1/link/tag/{id}` | `DELETE` | `deleteTag($id)` |

Example:

```php
$tag = TLYApi::createTag(['tag' => 'fall2026']);
```

## License

MIT
