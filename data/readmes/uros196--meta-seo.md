# Meta Tags (SEO)

The Meta functionality provides a centralized way to manage all meta tags required for proper SEO optimization and social media display.

## What is the Meta functionality for?

This module allows you to:
- Set basic meta data (title, description, image) at the application level.
- Define "fallback" values that will be used if a specific page does not have its own data.
- Easily modify meta data within controllers or any part of the code before the page is rendered.
- Automatically generate Open Graph (`og:`) and Twitter tags.
- Manage robots instructions (`index`, `noindex`).

## Requirements

- PHP 8.1 or higher
- Laravel 9.0 or higher

## Installation

You can install the package via composer:

```bash
composer require upantelic/meta-seo
```

## Setup

The package is automatically registered via Laravel's auto-discovery. You can immediately use the `Meta` facade or the `MetaManager` class.

### Customization (Optional)

If you want to define default (global) values for your site, you can create a factory and register it as a singleton in your application's `AppServiceProvider`.

#### 1. Creating a Factory (MetaFactory)

First, you can create a factory that will define the default (global) values for your site. The factory serves to define in one place what happens if you forget to set a title or description on a page.

```php
namespace App\Support\Meta;

use MetaSeo\Items\OgMetaItem;use MetaSeo\Items\TwitterMetaItem;use MetaSeo\MetaManager;use MetaSeo\Enums\MetaField;

class MetaFactory
{
    public static function default(): MetaManager
    {
        // Retrieving data from application settings
        $siteTitle = settings('site_name') ?? 'My Website';
        $siteDescription = settings('site_description') ?? 'Welcome to our portal.';

        return (new MetaManager)
            // Base URL
            ->setUrl(url()->current())
            
            // Twitter data
            ->addItem((new TwitterMetaItem(MetaField::TwitterCard))->setValue('summary_large_image'))
            
            // Open Graph data
            ->addItem((new OgMetaItem(MetaField::OgType))->setValue('website'))
            ->addItem(MetaField::OgSiteName->buildItem()->setValue($siteTitle))
            
            // Title and description with fallback values
            // If setTitle() is not called later, these values will be used
            ->setTitleWithFallback($siteTitle)
            ->setDescriptionWithFallback($siteDescription)
            
            // Default image for social sharing
            ->setImageWithFallback(asset('assets/images/default-share.jpg'))
            
            // Allow indexing by default
            ->noIndex(false);
    }
}
```

### 2. Registration in AppServiceProvider

Once you have the factory, register `MetaManager` in the container:

```php
use App\Support\Meta\MetaFactory;
use MetaSeo\MetaManager;

public function register()
{
    $this->app->singleton(MetaManager::class, function () {
        return MetaFactory::default();
    });
}
```

## Usage in Controllers

When you want to change meta data for a specific page (e.g., a news article or a product), use the `Meta` facade.

```php
use MetaSeo\Facade\Meta;

public function show(Article $article)
{
    Meta::setTitle($article->title)
        ->setDescription($article->summary)
        ->setImage($article->image_url)
        // You can also add a completely custom meta tag
        ->item('my-custom-tag', ['content' => 'value']);

    return view('article.show', compact('article'));
}
```

### Shortcut Methods and Synchronization

To save time, several methods act as "shortcuts" by automatically setting multiple related tags at once. For example, `setTitle()` doesn't just set the basic `<title>`, it also sets `og:title` and `twitter:title`.

The following shortcut methods are available:
- `setTitle($value)` / `setTitleWithFallback($value, $fallback)` - sets `title`, `og:title`, and `twitter:title`.
- `setDescription($value)` / `setDescriptionWithFallback($value, $fallback)` - sets `description`, `og:description`, and `twitter:description`.
- `setImage($url)` / `setImageWithFallback($url, $fallback)` - sets `og:image` and `twitter:image`.
- `setUrl($url)` - sets `og:url` and `twitter:url`.

#### Overriding individual tags

Even if you use a shortcut method, you can still modify each attribute individually afterwards.

```php
Meta::setTitle('Main Page Title')
    // This will override ONLY the Open Graph title set by the shortcut above
    ->ogItem(MetaField::OgTitle, 'Different Title for Facebook');
```

### Accessing and Modifying Items

There are several ways to access specific meta items. A key feature of the `MetaManager` is that **accessing an item will automatically create it** if it doesn't already exist.

#### 1. Using specialized methods
For common tags, you can use dedicated methods:
```php
$titleItem = Meta::title(); // Accesses the 'title' item
$descItem = Meta::description(); // Accesses the 'description' item
```

#### 2. Using the generic `item()` method
You can access any tag by its string key or `MetaField` enum. If it's the first time you are accessing it, the item will be initialized:
```php
// These will create the items if they don't exist
Meta::item('keywords')->setValue('cms, laravel, seo');
Meta::item(MetaField::OgLocale)->setValue('en_US');
```

#### 3. Accessing Open Graph and Twitter items
While `item()` works for everything, you can use prefix-specific helpers:
```php
// Automatically handles the 'og:' prefix
Meta::ogItem('image:alt', 'Description of the image');

// Automatically handles the 'twitter:' prefix
Meta::twitterItem('site', '@my_handle');
```

### Adding Items Directly

While `item()` is useful for quick access or lazy initialization, you might sometimes want to instantiate and configure a meta item before adding it to the manager. For this, use the `addItem()` method.

#### 1. Passing a standard object
You can pass any class instance that implements `MetaItemInterface` (like `MetaItem`, `OgMetaItem`, or `TwitterMetaItem`):

```php
use MetaSeo\Items\OgMetaItem;

Meta::addItem((new OgMetaItem('og:type'))->setValue('article'));
```

#### 2. Using Enums
The `MetaField` enum provides a convenient `buildItem()` method that automatically resolves the correct class for you and returns a pre-configured instance:

```php
use MetaSeo\Enums\MetaField;

Meta::addItem(MetaField::OgSiteName->buildItem()->setValue('My Website Name'));
```

### Fallback values

Methods like `setTitleWithFallback($title, $fallback)` are key. They ensure you always have valid data. If `$title` is empty, the system will try to use `$fallback`. If that is also empty, the previously defined value from the factory will remain.

### Alternative Fallback Methods

In addition to the `setTitleWithFallback()` and `setDescriptionWithFallback()` methods, you can use alternative methods that set fallback values and automatically activate them:

```php
// Set fallback title and activate it immediately
Meta::fallbackTitle('Default Site Title');

// Set fallback description and activate it immediately
Meta::fallbackDescription('Default site description');
```

These methods are useful when you want to ensure a fallback value is always used, regardless of whether a primary value is set later. They synchronize the fallback across all related tags (title, og:title, twitter:title).

### Robots Meta Tags

You can control how search engines index your pages using the `noIndex()` method:

```php
// Prevent search engines from indexing this page
Meta::noIndex(true);  // Sets: <meta name="robots" content="noindex,nofollow">

// Allow search engines to index this page (default)
Meta::noIndex(false); // Sets: <meta name="robots" content="index,follow">
```

This is particularly useful for:
- Admin pages
- User profile pages
- Temporary or draft content
- Pages with duplicate content

For more information about robots meta tags, see [Google's documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

### Managing Meta Items

#### Clearing all meta items

If you need to reset all meta items to their initial state:

```php
Meta::clear();
```

This removes all registered meta items and resets the excluded keys list to its default state (only `title` excluded).

#### Getting all registered items

You can retrieve all registered meta items as an array:

```php
$items = Meta::getItems();

foreach ($items as $key => $item) {
    echo $key . ': ' . $item->getValue();
}
```

This is useful for debugging or when you need to inspect what meta tags are currently registered.

## Rendering in Blade

In your main layout file (e.g., `layout.blade.php`), inside the `<head>` section, add:

```blade
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title>{!! Meta::title()->getValue() !!}</title>
    {!! Meta::renderItems() !!}
    
    <!-- Other links and scripts -->
</head>
```

The `renderItems()` method will automatically generate all tags:
- `<meta name="description" content="...">`
- `<meta property="og:title" content="...">`
- `<meta name="twitter:title" content="...">`
- And all others you have added.

### Excluding and Including tags

By default, the `title` key is **automatically excluded** from `renderItems()`. This is because the title is usually handled manually via the HTML `<title>` tag, as shown in the example above.

If you want to change this behavior and include the `title` in the automated rendering, you can use the `include()` method:

```php
Meta::include('title');
```

Similarly, if you want to exclude other tags from being rendered:

```php
Meta::exclude('description');
```

## Available Methods

The `MetaManager` provides the following public methods:

| Method                                                                      | Description                                                        |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------|
| `clear()`                                                                   | Clear all registered meta items and reset to initial state         |
| `title()`                                                                   | Get or create the title meta item                                  |
| `description()`                                                             | Get or create the description meta item                            |
| `item(string\|MetaField $key, array $attributes = [])`                      | Get or create a generic meta item by key                           |
| `ogItem(string\|MetaField $key, ?string $content = null)`                   | Get or create an Open Graph meta item                              |
| `twitterItem(string\|MetaField $key, ?string $content = null)`              | Get or create a Twitter meta item                                  |
| `addItem(MetaItemInterface $item)`                                          | Add a pre-configured meta item to the manager                      |
| `exclude(array\|string\|MetaField $keys)`                                   | Exclude specific keys from rendering                               |
| `include(array\|string\|MetaField $keys)`                                   | Include previously excluded keys in rendering                      |
| `getItems()`                                                                | Get all registered meta items as an array                          |
| `renderItems()`                                                             | Render all registered meta tags as HTML                            |
| `setTitle(string $title)`                                                   | Set title and sync to og:title and twitter:title                   |
| `setTitleWithFallback(string $title, ?string $fallback = null)`             | Set title with fallback value                                      |
| `fallbackTitle(string $title)`                                              | Set fallback title and activate it immediately                     |
| `setDescription(string $description)`                                       | Set description and sync to og:description and twitter:description |
| `setDescriptionWithFallback(string $description, ?string $fallback = null)` | Set description with fallback value                                |
| `fallbackDescription(string $description)`                                  | Set fallback description and activate it immediately               |
| `setUrl(string $url)`                                                       | Set canonical URL and sync to og:url and twitter:url               |
| `setImage(string $url)`                                                     | Set social share image for og:image and twitter:image              |
| `setImageWithFallback(string $url, ?string $fallback = null)`               | Set social share image with fallback value                         |
| `noIndex(bool $status = true)`                                              | Control search engine indexing (robots meta tag)                   |

## Advanced Usage Examples

### Conditional Meta Tags Based on Content Type

You can set different meta-tags based on the type of content being displayed:

```php
public function show($id)
{
    $content = Content::findOrFail($id);
    
    // Set common meta data
    Meta::setTitle($content->title)
        ->setDescription($content->summary);
    
    // Set type-specific Open Graph tags
    if ($content->type === 'article') {
        Meta::ogItem(MetaField::OgType, 'article')
            ->ogItem('article:published_time', $content->published_at)
            ->ogItem('article:author', $content->author->name);
    } elseif ($content->type === 'video') {
        Meta::ogItem(MetaField::OgType, 'video.other')
            ->ogItem('video:duration', $content->duration)
            ->setImage($content->thumbnail_url);
    }
    
    return view('content.show', compact('content'));
}
```

### Dynamic Meta Tags from Model

You can create a trait or method in your models to automatically populate meta tags:

```php
// In your model
trait HasMetaTags
{
    public function applyMetaTags(): void
    {
        Meta::setTitle($this->meta_title ?? $this->title)
            ->setDescription($this->meta_description ?? $this->summary)
            ->setImage($this->getFirstMediaUrl('featured') ?: asset('images/default-og.jpg'))
            ->setUrl(url()->current());
        
        // Set noindex for draft content
        if ($this->status === 'draft') {
            Meta::noIndex(true);
        }
    }
}

// In your controller
public function show(Article $article)
{
    $article->applyMetaTags();
    
    return view('article.show', compact('article'));
}
```

### Handling Multiple Languages

When working with multilingual content, you can set locale-specific meta tags:

```php
public function show(Article $article)
{
    $locale = app()->getLocale();
    
    Meta::setTitle($article->getTranslation('title', $locale))
        ->setDescription($article->getTranslation('summary', $locale))
        ->ogItem(MetaField::OgLocale, $locale)
        ->ogItem('og:locale:alternate', $locale === 'en' ? 'sr_RS' : 'en_US');
    
    return view('article.show', compact('article'));
}
```

### Debugging Meta Tags

During development, you can inspect all registered meta tags:

```php
// In your controller or middleware
if (app()->environment('local')) {
    $items = Meta::getItems();
    
    foreach ($items as $key => $item) {
        logger()->debug("Meta tag: {$key}", [
            'value' => $item->getValue(),
            'group' => $item->getGroup()
        ]);
    }
}
```

## Best Practices

1. **Always set fallback values in your factory** - This ensures that every page has valid meta data even if you forget to set it in a controller.

2. **Use the factory pattern** - Create a centralized `MetaFactory` class to define your default meta configuration. This makes it easier to maintain and update.

3. **Set meta tags as early as possible** - Set meta tags in your controllers before rendering views to ensure they're available when the layout is rendered.

4. **Use type-specific Open Graph tags** - Set appropriate `og:type` values (article, video, product, etc.) to improve how your content appears on social media.

5. **Test social sharing** - Use tools like [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator) to verify your meta tags.

6. **Don't forget about images** - Always provide high-quality images for social sharing. The recommended size is 1200x630 pixels for Open Graph images.

7. **Use noIndex wisely** - Apply `noIndex()` to admin pages, user profiles, search results, and any content you don't want indexed by search engines.

8. **Keep descriptions concise** - Meta descriptions should be between 150-160 characters for optimal display in search results.

9. **Avoid duplicate content** - Use canonical URLs (`setUrl()`) to indicate the preferred version of a page when you have similar or duplicate content.

10. **Monitor and update** - Regularly review your meta tags and update them based on SEO best practices and social media platform requirements.
