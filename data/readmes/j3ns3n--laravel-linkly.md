# Laravel Linkly
## A Laravel Package for the Linkly API

![Release Version](https://img.shields.io/github/v/release/j3ns3n/laravel-linkly?logo=Github&label=Release)

![PHP Version](https://img.shields.io/packagist/dependency-v/j3ns3n/laravel-linkly/php?logo=php)
![Laravel Version](https://img.shields.io/packagist/dependency-v/j3ns3n/laravel-linkly/illuminate/support?label=Laravel&logo=laravel)

## Installation

```bash
composer require j3ns3n/laravel-linkly
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=linkly-config
```

Add your Linkly API key to your `.env` file:

```env
LINKLY_API_KEY=your-api-key-here
LINKLY_API_URL=https://app.linklyhq.com/api/v1/
LINKLY_WORKSPACE_ID=your-workspace-id
LINKLY_TIMEOUT=30
```

## Usage

### Using the Facade

```php
use J3ns3n\LaravelLinkly\Facades\Linkly;

// Create a new short link
$link = Linkly::createLink([
    'url' => 'https://example.com/very-long-url',
    'name' => 'My Example Link',
]);

echo $link->getShortUrl();
echo $link->getId();
```

### Using Dependency Injection

```php
use J3ns3n\LaravelLinkly\Client\LinklyClient;

class LinkController extends Controller
{
    public function __construct(protected LinklyClient $linkly)
    {
    }

    public function store(Request $request)
    {
        $link = $this->linkly->createLink([
            'url' => $request->input('url'),
            'name' => $request->input('name'),
        ]);

        return response()->json($link);
    }
}
```

### Using the LinkBuilder

You can use the builder pattern for more advanced link creation:

```php
use J3ns3n\LaravelLinkly\Facades\Linkly;

$link = Linkly::build('https://example.com')
    ->name('My Example Link')
    ->slug('my-slug')
    ->domain('custom.domain')
    ->cloaking()
    ->blockBots()
    ->forwardParams(false)
    ->webhook('https://webhook.site/abc')
    ->utm('newsletter', 'email', 'launch')
    ->openGraph('OG Title', 'OG Desc', 'https://img.com/og.png')
    ->expires('2025-12-31T23:59:59Z', 'https://expired.com')
    ->rules(['matches' => 'US', 'percentage' => 50, 'url' => 'https://us.com', 'what' => 'geo'])
    ->create();

// The returned $link is an instance of J3ns3n\LaravelLinkly\Resources\Link
```

### Available Methods

```php
// Create a link
$link = Linkly::createLink([
    'url' => 'https://example.com',
    'name' => 'Example',
]);

// Get a link by ID
$link = Linkly::getLink($link->getId());

// List all links
$links = Linkly::listLinks();

foreach ($links as $link) {
    echo $link->getShortUrl();
}

// Update a link
$link = Linkly::updateLink($link->getId(), [
    'name' => 'Updated Name',
]);

// Delete a link
Linkly::deleteLink($link->getId());
```

### Working with Link Resources

```php
$link = Linkly::getLink(LINK_ID);

// Access properties
echo $link->getId();
echo $link->getShortUrl();
echo $link->getOriginalUrl();

// Update the link
$link = $link->update([
    'name' => 'Updated Name',
    // ...other fields...
]);

// Delete the link
$deleted = $link->delete();

// Convert to array
$array = $link->toArray();

// Convert to JSON
$json = json_encode($link);
```

### Error Handling

```php
use J3ns3n\LaravelLinkly\Exceptions\LinklyException;

try {
    $link = Linkly::createLink([
        'url' => 'https://example.com',
    ]);
} catch (LinklyException $e) {
    Log::error('Linkly API error: ' . $e->getMessage());
    return response()->json(['error' => 'Failed to create link'], 500);
}
```

## Testing

```bash
composer test
composer pint
composer stan
```

## License

MIT