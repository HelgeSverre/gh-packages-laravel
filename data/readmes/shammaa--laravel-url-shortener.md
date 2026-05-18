# Laravel URL Shortener

A professional, feature-rich URL shortener package for Laravel with password protection, QR codes, advanced analytics, hidden UTM tracking, and much more.

## Features

- 🔒 **Password Protection** - Protect your links with passwords
- 📊 **Advanced Analytics** - Track clicks, locations, devices, browsers, and more
- 🎯 **Hidden UTM Tracking** - Track UTM parameters without showing them in URLs
- 📱 **QR Code Generation** - Automatic QR code generation for all links
- ⏰ **Link Expiry** - Set expiration dates for links
- 🔢 **Click Limits** - Limit the number of clicks per link
- 🌍 **Geographic Tracking** - Track visitor locations (country, city)
- 📱 **Device Tracking** - Track devices, browsers, platforms
- 🔗 **Custom Domains** - Use custom domains for shortened URLs
- 🚀 **High Performance** - Optimized with caching
- 🔌 **API Support** - Full REST API included
- 📈 **Real-time Analytics** - Real-time visit tracking
- 🎨 **Professional UI** - Beautiful password protection page
- 🔗 **Model Integration** - Automatic short links for Eloquent models

## Installation

```bash
composer require shammaa/laravel-url-shortener
```

Publish configuration and migrations:

```bash
php artisan vendor:publish --tag=url-shortener-config
php artisan vendor:publish --tag=url-shortener-migrations
php artisan migrate
```

## Quick Start

### Basic Usage

```php
use Shammaa\LaravelUrlShortener\Facades\UrlShortener;

// Create a simple short link
$link = UrlShortener::create([
    'destination_url' => 'https://example.com/very-long-url',
]);

echo $link->short_url; // https://yoursite.com/s/abc123
```

### Using Helper Function

```php
// Simple
$link = short_url('https://example.com');

// With options
$link = short_url('https://example.com', [
    'title' => 'My Link',
    'password' => 'secret123',
    'expires_in_days' => 7,
    'click_limit' => 50,
]);
```

## Features in Detail

### Password Protection

```php
$link = UrlShortener::create([
    'destination_url' => 'https://example.com/secret',
    'password' => 'my-password',
]);
```

Users will be prompted for a password when accessing the link. The password is verified in session, so they don't need to enter it again.

### QR Code Generation

QR codes are automatically generated for all links:

```php
$link = UrlShortener::create([
    'destination_url' => 'https://example.com',
]);

// Access QR code
$qrCodeUrl = $link->qr_code_path; // Storage path

// Or via API
GET /api/url-shortener/links/{key}/qr-code
```

### Hidden UTM Tracking

Track UTM parameters without showing them in the URL:

```php
$link = UrlShortener::create([
    'destination_url' => 'https://example.com',
    'utm_parameters' => [
        'utm_source' => 'newsletter',
        'utm_medium' => 'email',
        'utm_campaign' => 'promo2024',
    ],
    'utm_hidden' => true, // Hide in URL but track internally
]);
```

The UTM parameters will be tracked in analytics but won't appear in the destination URL.

### Link Expiry

```php
// Expires in 30 days
$link = UrlShortener::create([
    'destination_url' => 'https://example.com',
    'expires_in_days' => 30,
]);

// Or set specific date
$link = UrlShortener::create([
    'destination_url' => 'https://example.com',
    'expires_at' => now()->addMonths(3),
]);
```

### Click Limits

```php
$link = UrlShortener::create([
    'destination_url' => 'https://example.com',
    'click_limit' => 100, // Stops working after 100 clicks
]);
```

### Advanced Analytics

The package automatically tracks:
- Total clicks
- Unique visitors (by IP)
- Geographic location (country, city)
- Device types (desktop, mobile, tablet)
- Browsers and platforms
- Referrers
- UTM parameters
- Time-based statistics

**Access analytics:**

```php
$link = UrlShortener::findByKey('abc123');

// Get statistics
$totalClicks = $link->clicks_count;
$uniqueClicks = $link->visits()->distinct('ip_address')->count();
$clicksToday = $link->visits()->today()->count();
$clicksByCountry = $link->visits()->selectRaw('country, COUNT(*) as clicks')
    ->groupBy('country')
    ->get();
```

## Using with Models

The `HasShortLink` trait automatically creates short links for any Eloquent model with a **model prefix + random code** format (e.g., `post-xyz1`, `article-abc2`).

### Basic Usage

```php
use Shammaa\LaravelUrlShortener\Traits\HasShortLink;

class Post extends Model
{
    use HasShortLink;
    
    protected $fillable = ['title', 'slug', 'content'];
}

// Create short link
$post = Post::create(['title' => 'My Article']);
$post->createShortLink();

echo $post->short_url; // https://yoursite.com/s/post-xyz1
echo $post->shortLink->key; // post-xyz1
```

### How It Works

1. **Extracts model name** → `Post` becomes `post`
2. **Generates random code** → `xyz1` (4 characters by default)
3. **Combines them** → `post-xyz1`
4. **Ensures uniqueness** → Checks database and regenerates if needed

### Key Format

The trait generates keys in format: `{model-name}-{random-code}`

```php
$post->createShortLink();      // Key: "post-xyz1"
$article->createShortLink();   // Key: "article-abc2"
$product->createShortLink();   // Key: "product-def3"
```

### Custom Prefix

You can customize the prefix using a database field or method:

**Option 1: Database Field**

```php
// Migration
Schema::table('posts', function (Blueprint $table) {
    $table->string('short_link_prefix')->nullable();
});

// Usage
$post->short_link_prefix = 'blog';
$post->createShortLink();
// Key: "blog-xyz1" (instead of "post-xyz1")
```

**Option 2: Override Method**

```php
class Post extends Model
{
    use HasShortLink;
    
    protected function getShortLinkPrefix(): string
    {
        return 'blog'; // Always use "blog" as prefix
    }
}
```

**Priority Order:**
1. Custom field: `short_link_prefix`
2. Custom method: `getShortLinkPrefix()`
3. Model name: Auto-extracted (default)

### Custom Destination URL

```php
class Post extends Model
{
    use HasShortLink;
    
    public function getShortLinkUrl(): string
    {
        return route('posts.show', $this);
    }
}
```

### Automatic Creation

Create short links automatically when model is created:

```php
class Post extends Model
{
    use HasShortLink;
    
    protected static function booted()
    {
        static::created(function ($post) {
            $post->createShortLink(['title' => $post->title]);
        });
    }
}
```

### Complete Example

```php
// Model
class Post extends Model
{
    use HasShortLink;
    protected $fillable = ['title', 'slug', 'content'];
}

// Routes
Route::get('/posts/{post}', [PostController::class, 'show'])
    ->name('posts.show');

// Controller
public function show(Post $post)
{
    return view('posts.show', ['post' => $post]);
}

// Blade Template
@if($post->hasShortLink())
    <a href="{{ $post->short_url }}" target="_blank">
        Share: {{ $post->short_url }}
    </a>
@endif
```

### Configuration

Customize random code length:

```php
// config/url-shortener.php
'model_key_length' => 4, // Default: 4 characters

// Or via .env
URL_SHORTENER_MODEL_KEY_LENGTH=6
```

## API Usage

### Endpoints

```bash
# Create link
POST /api/url-shortener/links
{
    "destination_url": "https://example.com",
    "title": "My Link",
    "password": "secret",
    "expires_in_days": 30,
    "click_limit": 100
}

# Get link
GET /api/url-shortener/links/{key}

# Get analytics
GET /api/url-shortener/links/{key}/analytics

# Get QR code
GET /api/url-shortener/links/{key}/qr-code

# Update link
PUT /api/url-shortener/links/{key}
{
    "is_active": false,
    "expires_at": "2024-12-31 23:59:59"
}

# Delete link
DELETE /api/url-shortener/links/{key}
```

## Configuration

Edit `config/url-shortener.php`:

```php
// Short URL prefix
'prefix' => 's', // Links will be: /s/abc123

// Key length for manually created links
'key_length' => 6,

// Model key length (for HasShortLink trait)
'model_key_length' => 4,

// QR Code settings
'qr_code' => [
    'enabled' => true,
    'size' => 200,
    'format' => 'svg', // svg or png
],

// UTM tracking
'utm' => [
    'enabled' => true,
    'hidden' => true, // Hide in URL but track internally
],

// Tracking options
'track_visits' => true,
'track_ip_address' => true,
'track_user_agent' => true,
'track_referer' => true,
'track_geo' => false, // Requires geolocation service
```

## Performance

- **Smart Caching** - Links are cached for fast retrieval
- **Optimized Queries** - Efficient database queries with proper indexing
- **Minimal Overhead** - Lightweight tracking with minimal performance impact

## License

MIT

## Author

Shadi Shammaa

## Support

For issues and feature requests, please use the GitHub issue tracker.
