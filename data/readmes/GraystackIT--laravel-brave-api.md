# graystackit/laravel-brave-api

A Laravel package for the [Brave Search API](https://api.search.brave.com/), built on [Saloon 4](https://docs.saloon.dev/).

Supports **Web Search**, **Image Search**, **Video Search**, and **News Search**.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-brave-api
```

The service provider is auto-discovered by Laravel.

Publish the config file:

```bash
php artisan vendor:publish --tag=brave-search-config
```

Add your API key to `.env`:

```env
BRAVE_API_KEY=your-api-key
```

Get a key at [api.search.brave.com](https://api.search.brave.com/).

---

## Configuration

After publishing, the config file lives at `config/brave-search.php`:

```php
return [
    'api_key'  => env('BRAVE_API_KEY'),
    'base_url' => env('BRAVE_BASE_URL', 'https://api.search.brave.com'),

    'defaults' => [
        'count'       => 20,
        'safesearch'  => 'strict',
        'search_lang' => 'en',
        'country'     => 'us',
    ],
];
```

---

## Usage

Resolve `BraveSearchClient` from the container or inject it via the constructor:

```php
use GraystackIT\BraveSearch\BraveSearchClient;

class SearchController extends Controller
{
    public function __construct(private BraveSearchClient $brave) {}
}
```

---

### Web Search

**Endpoint:** `GET /res/v1/web/search`

`searchWeb()` returns a `WebSearchResponse` object with four properties:

| Property      | Type                  | Description                                        |
|---|---|---|
| `results`     | `WebResult[]`         | Matched web pages                                  |
| `spellcheck`  | `SpellcheckInfo\|null`| Query correction info (when the API corrected spelling) |
| `locations`   | `array`               | Local POI stubs `[{id, title}]` for a follow-up local query |
| `rich`        | `RichResultHint\|null`| Rich result hint (`vertical`, `callbackKey`)       |

```php
use GraystackIT\BraveSearch\Enums\Freshness;
use GraystackIT\BraveSearch\Enums\SafeSearch;

$response = $this->brave->searchWeb('laravel tutorial');

foreach ($response->results as $result) {
    echo $result->title;          // page title
    echo $result->url;            // page URL
    echo $result->description;    // meta description snippet
    echo $result->thumbnailUrl;   // preview image URL (may be empty)
    echo $result->age;            // e.g. "2 days ago" or ISO datetime
    echo $result->language;       // detected language code
    echo $result->familyFriendly; // bool
    print_r($result->extraSnippets); // array of extra text snippets
}

// Spell-check correction info (null when not present)
if ($response->spellcheck?->changed) {
    echo "Corrected '{$response->spellcheck->original}' to '{$response->spellcheck->corrected}'";
}

// Local POI stubs — use IDs with the Local POI endpoint
foreach ($response->locations as $location) {
    echo $location['id'];    // use with /res/v1/local/pois
    echo $location['title'];
}

// Rich result hint — use callback_key with the Rich endpoint
if ($response->rich !== null) {
    echo $response->rich->vertical;    // e.g. "weather", "stocks"
    echo $response->rich->callbackKey; // use with /res/v1/web/rich
}
```

#### Parameters

| Parameter            | Type                    | Default                | Description                                        |
|---|---|---|---|
| `$query`             | `string`                | — (required)           | Search query                                       |
| `$count`             | `int`                   | `10` (max 20)          | Number of results                                  |
| `$offset`            | `int`                   | `0` (max 9)            | Pagination offset                                  |
| `$safesearch`        | `SafeSearch`            | `SafeSearch::Moderate` | Safe search level                                  |
| `$searchLang`        | `string`                | `'en'`                 | Content language code                              |
| `$country`           | `string`                | `'us'`                 | Country code                                       |
| `$freshness`         | `Freshness\|string\|null` | `null`               | Recency filter; enum value or custom date range    |
| `$spellcheck`        | `bool`                  | `true`                 | Enable spell-check                                 |
| `$uiLang`            | `string\|null`          | `null`                 | UI language for response metadata (e.g. `'en-US'`) |
| `$extraSnippets`     | `bool`                  | `false`                | Request up to 5 extra snippets per result          |
| `$gogglesId`         | `string\|null`          | `null`                 | Goggle URL or inline definition for custom re-ranking |
| `$enableRichCallback`| `bool`                  | `false`                | Enable rich result hints in response               |
| `$options`           | `array`                 | `[]`                   | Extra query parameters (override defaults)         |

#### Filter by recency

```php
use GraystackIT\BraveSearch\Enums\Freshness;
use GraystackIT\BraveSearch\Enums\SafeSearch;

// Using a predefined enum value
$response = $brave->searchWeb(
    query:      'php 8.4 features',
    count:      5,
    freshness:  Freshness::PastWeek,
    safesearch: SafeSearch::Strict,
);

// Using a custom date range
$response = $brave->searchWeb(
    query:     'laravel release',
    freshness: '2024-01-01to2024-12-31',
);
```

**`Freshness` enum values:**

| Case            | API value | Meaning       |
|---|---|---|
| `PastDay`       | `pd`      | Past 24 hours |
| `PastWeek`      | `pw`      | Past week     |
| `PastMonth`     | `pm`      | Past month    |
| `PastYear`      | `py`      | Past year     |
| *(custom)*      | e.g. `'2024-01-01to2024-12-31'` | Specific date range |

**`SafeSearch` enum values:**

| Case       | API value  |
|---|---|
| `Off`      | `off`      |
| `Moderate` | `moderate` |
| `Strict`   | `strict`   |

#### Extra snippets and rich results

```php
// Request additional text snippets per result (requires AI/Data plan)
$response = $brave->searchWeb('laravel tutorial', extraSnippets: true);

// Enable rich result hints (weather, stocks, sports, etc.)
$response = $brave->searchWeb('weather london', enableRichCallback: true);

// Custom re-ranking with Goggles
$response = $brave->searchWeb('php', gogglesId: 'https://raw.githubusercontent.com/example/goggles/main/tech.goggle');
```

---

### Video Search

**Endpoint:** `GET /res/v1/videos/search`

```php
$results = $this->brave->searchVideos('laravel tutorial', count: 5);

foreach ($results as $result) {
    echo $result->title;          // video title
    echo $result->url;            // video page URL
    echo $result->description;    // video description
    echo $result->thumbnailUrl;   // thumbnail image URL
    echo $result->duration;       // e.g. "15:32"
    echo $result->views;          // view count (int or null)
    echo $result->creator;        // uploader/creator name
    echo $result->publisher;      // platform (e.g. "YouTube")
    echo $result->age;            // e.g. "1 week ago"
    echo $result->familyFriendly; // bool
}
```

#### Parameters

| Parameter    | Type                    | Default                | Description                                |
|---|---|---|---|
| `$query`     | `string`                | — (required)           | Search query                               |
| `$count`     | `int`                   | `10` (max 50)          | Number of results                          |
| `$offset`    | `int`                   | `0`                    | Pagination offset                          |
| `$safesearch`| `SafeSearch`            | `SafeSearch::Moderate` | Safe search level                          |
| `$searchLang`| `string`                | `'en'`                 | Language code                              |
| `$country`   | `string`                | `'us'`                 | Country code                               |
| `$freshness` | `Freshness\|string\|null` | `null`               | Recency filter; enum value or custom date range |
| `$options`   | `array`                 | `[]`                   | Extra query parameters (override defaults) |

```php
$results = $brave->searchVideos(
    query:     'php conference talks',
    freshness: Freshness::PastMonth,
    country:   'gb',
);

// Custom date range
$results = $brave->searchVideos('laravel', freshness: '2024-01-01to2024-06-30');
```

---

### News Search

**Endpoint:** `GET /res/v1/news/search`

```php
$results = $this->brave->searchNews('laravel 12 release', count: 10);

foreach ($results as $result) {
    echo $result->title;          // article headline
    echo $result->url;            // article URL
    echo $result->description;    // article summary
    echo $result->thumbnailUrl;   // article image URL (may be empty)
    echo $result->age;            // e.g. "3 hours ago"
    echo $result->sourceName;     // e.g. "Laravel News"
    echo $result->sourceUrl;      // source website URL
    echo $result->breaking;       // bool — true for breaking news
    echo $result->familyFriendly; // bool
}
```

#### Parameters

| Parameter        | Type                    | Default                | Description                                       |
|---|---|---|---|
| `$query`         | `string`                | — (required)           | Search query                                      |
| `$count`         | `int`                   | `10` (max 50)          | Number of results                                 |
| `$offset`        | `int`                   | `0`                    | Pagination offset                                 |
| `$safesearch`    | `SafeSearch`            | `SafeSearch::Moderate` | Safe search level                                 |
| `$searchLang`    | `string`                | `'en'`                 | Language code                                     |
| `$country`       | `string`                | `'us'`                 | Country code                                      |
| `$freshness`     | `Freshness\|string\|null` | `null`               | Recency filter; enum value or custom date range   |
| `$spellcheck`    | `bool`                  | `true`                 | Enable spell-check                                |
| `$extraSnippets` | `bool`                  | `false`                | Request extra snippets per result (AI/Data plans) |
| `$gogglesId`     | `string\|null`          | `null`                 | Goggle URL or inline definition for custom re-ranking |
| `$options`       | `array`                 | `[]`                   | Extra query parameters (override defaults)        |

```php
// Latest breaking tech news from the past day
$results = $brave->searchNews(
    query:     'artificial intelligence',
    count:     10,
    freshness: Freshness::PastDay,
    country:   'us',
);

// Custom date range with extra snippets
$results = $brave->searchNews(
    query:         'laravel',
    freshness:     '2024-06-01to2024-06-30',
    extraSnippets: true,
);
```

---

### Image Search

**Endpoint:** `GET /res/v1/images/search`

```php
use GraystackIT\BraveSearch\Enums\SafeSearch;

$results = $this->brave->searchImages('mountain landscape', count: 20);

foreach ($results as $result) {
    echo $result->url;          // full-size image URL
    echo $result->thumbnailUrl; // small preview URL
    echo $result->title;        // image title
    echo $result->sourceDomain; // e.g. "example.com"
}
```

#### Parameters

| Parameter    | Type        | Default           | Description                            |
|---|---|---|---|
| `$query`     | `string`    | — (required)      | Search query                           |
| `$count`     | `int`       | `20` (max 200)    | Number of results                      |
| `$safesearch`| `SafeSearch`| `SafeSearch::Strict` | Safe search level                   |
| `$searchLang`| `string`    | `'en'`            | Language code                          |
| `$country`   | `string`    | `'us'`            | Country code                           |
| `$spellcheck`| `bool`      | `true`            | Enable spell-check                     |
| `$options`   | `array`     | `[]`              | Extra query parameters                 |

```php
// German image search with moderate safe-search
$results = $brave->searchImages(
    query:      'running shoes',
    count:      10,
    safesearch: SafeSearch::Moderate,
    searchLang: 'de',
    country:    'de',
);
```

---

### Download an image

```php
use GraystackIT\BraveSearch\BraveImageDownloader;
use GraystackIT\BraveSearch\Exceptions\BraveApiException;

class ImageController extends Controller
{
    public function __construct(private BraveImageDownloader $downloader) {}

    public function download(string $url)
    {
        try {
            $bytes = $this->downloader->download($url);
            $mime  = $this->downloader->detectMimeType($bytes); // "image/jpeg", "image/png", ...

            return response($bytes, 200)->header('Content-Type', $mime ?? 'application/octet-stream');

        } catch (BraveApiException $e) {
            abort(502, 'Image download failed.');
        }
    }
}
```

---

## Exceptions

| Exception                  | When thrown                                                           |
|---|---|
| `BraveApiException`        | API returned 4xx/5xx, network failure, or non-JSON response           |
| `InvalidArgumentException` | Empty query string passed to `searchWeb`, `searchVideos`, or `searchNews` |

---

## Testing

This package uses Saloon's `MockClient` so you can test without making real HTTP calls:

```php
use GraystackIT\BraveSearch\BraveSearchClient;
use GraystackIT\BraveSearch\Connectors\BraveSearchConnector;
use GraystackIT\BraveSearch\Data\WebSearchResponse;
use GraystackIT\BraveSearch\Requests\SearchWebRequest;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

$mockClient = new MockClient([
    SearchWebRequest::class => MockResponse::make([
        'web' => [
            'results' => [
                [
                    'title'       => 'Example',
                    'url'         => 'https://example.com',
                    'description' => 'An example page.',
                ],
            ],
        ],
    ], 200),
]);

$connector = app(BraveSearchConnector::class);
$connector->withMockClient($mockClient);

$response = (new BraveSearchClient($connector))->searchWeb('example');

// $response is a WebSearchResponse
foreach ($response->results as $result) {
    echo $result->title;
}
```

Run the package test suite:

```bash
composer install
vendor/bin/pest
```

---

## API Endpoints Reference

| Method           | Brave API Endpoint            |
|---|---|
| `searchWeb()`    | `GET /res/v1/web/search`      |
| `searchVideos()` | `GET /res/v1/videos/search`   |
| `searchNews()`   | `GET /res/v1/news/search`     |
| `searchImages()` | `GET /res/v1/images/search`   |

---

## License

MIT
