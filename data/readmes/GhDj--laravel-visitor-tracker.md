# Laravel Visitor Tracker

[![Tests](https://github.com/ghdj/laravel-visitor-tracker/actions/workflows/tests.yml/badge.svg)](https://github.com/ghdj/laravel-visitor-tracker/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/ghdj/laravel-visitor-tracker.svg)](https://packagist.org/packages/ghdj/laravel-visitor-tracker)
[![License](https://img.shields.io/packagist/l/ghdj/laravel-visitor-tracker.svg)](https://packagist.org/packages/ghdj/laravel-visitor-tracker)

A comprehensive visitor tracking package for Laravel applications with analytics, geolocation, and bot detection.

**🚀 Zero External Dependencies** - Uses only Laravel's built-in features and native PHP for all functionality.

## Features

- 📊 **Comprehensive Tracking** - Track page views, unique visitors, and sessions
- 🤖 **Native Bot Detection** - Detect 100+ bots/crawlers without external packages
- 📱 **Native Device Detection** - Identify browsers, platforms, and device types using regex
- 🌍 **Geolocation** - Optional IP-based location tracking (using Laravel's HTTP client)
- 🔒 **GDPR Compliant** - GDPR Safe Mode for consent-free tracking, IP anonymization, DNT support
- ⚡ **Performance** - Queue support for async tracking, statistics caching
- 📈 **Rich Statistics** - Browser, platform, device, country, referrer analytics
- 🎯 **Flexible Exclusions** - Exclude paths, IPs, user agents, status codes
- 🔧 **Zero Dependencies** - Only uses Laravel's illuminate packages

## Requirements

- PHP 8.1+
- Laravel 10.x, 11.x, or 12.x

## Installation

```bash
composer require ghdj/laravel-visitor-tracker
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="visitor-tracker-config"
```

Run the migrations:

```bash
php artisan migrate
```

## Configuration

The configuration file is located at `config/visitor-tracker.php`. Key options include:

```php
return [
    // Enable/disable tracking globally
    'enabled' => env('VISITOR_TRACKER_ENABLED', true),
    
    // Paths to exclude from tracking
    'exclude' => [
        'paths' => ['api/*', 'admin/*'],
        'methods' => ['OPTIONS', 'HEAD'],
        'status_codes' => [301, 302, 404, 500],
        'ips' => [],
        'user_agents' => [],
    ],
    
    // Bot tracking
    'bots' => [
        'track' => false,
        'detect' => true,
        'additional_patterns' => [], // Add custom bot patterns
    ],
    
    // Custom parser patterns
    'parser' => [
        'additional_browsers' => [], // Add custom browser patterns
        'additional_platforms' => [], // Add custom platform patterns
    ],
    
    // Geolocation (optional - uses Laravel HTTP client)
    'geolocation' => [
        'enabled' => env('VISITOR_TRACKER_GEOLOCATION', false),
        'provider' => 'ip-api', // ip-api (free), ipinfo, ipapi
    ],
    
    // GDPR compliance
    'privacy' => [
        'gdpr_safe_mode' => env('VISITOR_TRACKER_GDPR_SAFE', false),
        'anonymize_ip' => env('VISITOR_TRACKER_ANONYMIZE_IP', false),
        'respect_dnt' => true,
    ],
    
    // Data retention
    'retention' => [
        'days' => 90,
    ],
    
    // Queue for async tracking
    'queue' => [
        'enabled' => env('VISITOR_TRACKER_QUEUE', false),
    ],
];
```

## Usage

### Middleware

Add the tracking middleware to your routes:

```php
// In routes/web.php
Route::middleware(['track-visitor'])->group(function () {
    Route::get('/', [HomeController::class, 'index']);
    // ... more routes
});

// Or globally in bootstrap/app.php (Laravel 11)
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \Ghdj\VisitorTracker\Middleware\TrackVisitor::class,
    ]);
})
```

### Using the Facade

```php
use Ghdj\VisitorTracker\Facades\VisitorTracker;

// Get statistics
$stats = VisitorTracker::stats();

// Total visitors (unique)
$totalVisitors = $stats->totalVisitors();

// Total page views
$totalPageViews = $stats->totalPageViews();

// Currently online visitors
$onlineNow = $stats->onlineVisitors();

// Today's visitors
$todayVisitors = $stats->todayVisitors();

// Visitors in last N days
$weeklyVisitors = $stats->visitorsLastDays(7);

// Most visited pages
$topPages = $stats->mostVisitedPages(10);

// Top referrers
$topReferrers = $stats->topReferrers(10);

// Browser statistics
$browsers = $stats->browserStats();

// Platform/OS statistics
$platforms = $stats->platformStats();

// Device type statistics
$devices = $stats->deviceStats();

// Country statistics (requires geolocation)
$countries = $stats->countryStats();

// Summary of all stats
$summary = $stats->summary();
```

### Using the Helper Function

```php
// Get tracker instance
$tracker = visitor();

// Get statistics
$stats = visitor()->stats()->summary();
$online = visitor_stats()->onlineVisitors();
```

### Blade Directives

```blade
<div class="stats">
    <p>Total Visitors: @totalVisitors</p>
    <p>Total Page Views: @totalPageViews</p>
    <p>Online Now: @onlineVisitors</p>
    <p>Today's Visitors: @todayVisitors</p>
</div>
```

### Working with Models

```php
use Ghdj\VisitorTracker\Models\Visitor;
use Ghdj\VisitorTracker\Models\Visit;

// Get all visitors
$visitors = Visitor::all();

// Get online visitors
$online = Visitor::online()->get();

// Get visitors excluding bots
$humans = Visitor::excludeBots()->get();

// Get authenticated visitors only
$authenticated = Visitor::authenticated()->get();

// Get visitors from date range
$recent = Visitor::between(now()->subWeek(), now())->get();

// Get visits for a specific path
$homeVisits = Visit::path('/')->get();

// Get visits with referrers
$referred = Visit::withReferrer()->get();
```

### Using Native Services Directly

```php
use Ghdj\VisitorTracker\Services\UserAgentParser;
use Ghdj\VisitorTracker\Services\BotDetector;

// Parse user agent
$parser = new UserAgentParser();
$result = $parser->parse($request->userAgent());
// Returns: ['browser' => 'Chrome', 'browser_version' => '120.0', 'platform' => 'Windows', ...]

// Detect bots
$detector = new BotDetector();
$isBot = $detector->isBot($request->userAgent());
$botName = $detector->getBotName($request->userAgent());
$category = $detector->getBotCategory($request->userAgent()); // search_engine, social_media, ai_bot, etc.
```

### Adding Custom Patterns

```php
// Add custom browser detection
$parser = new UserAgentParser();
$parser->addBrowserPatterns([
    'MyCustomBrowser' => '/MyCustomBrowser\/([0-9.]+)/',
]);

// Add custom bot detection
$detector = new BotDetector();
$detector->addPatterns(['mycustombot', 'anotherbot']);
$detector->addBotNames(['mycustombot' => 'My Custom Bot']);

// Or via config
// config/visitor-tracker.php
'parser' => [
    'additional_browsers' => [
        'MyBrowser' => '/MyBrowser\/([0-9.]+)/',
    ],
],
'bots' => [
    'additional_patterns' => ['mycustombot'],
],
```

### Listening to Events

```php
use Ghdj\VisitorTracker\Events\VisitorTracked;

// In EventServiceProvider or using Event facade
Event::listen(VisitorTracked::class, function (VisitorTracked $event) {
    $visitor = $event->visitor;
    $visit = $event->visit;
    
    // Custom logic here
    logger("New visit from {$visitor->ip} to {$visit->path}");
});
```

### Artisan Commands

```bash
# Show visitor statistics
php artisan visitor-tracker:stats
php artisan visitor-tracker:stats --detailed

# Prune old data
php artisan visitor-tracker:prune
php artisan visitor-tracker:prune --days=30
php artisan visitor-tracker:prune --force
```

### Scheduling Data Pruning

Add to your `routes/console.php` or scheduler:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('visitor-tracker:prune --force')->daily();
```

## Behind a Reverse Proxy / CDN

If your app sits behind Cloudflare, AWS ALB, nginx, or any other reverse proxy,
you **must** configure Laravel's `TrustProxies` middleware **before** enabling
visitor tracking. Without it, every request will appear to come from the proxy's
IP address — breaking IP exclusions, geolocation accuracy, and IP anonymization.

For Laravel 11/12, in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*'); // Or a specific list of proxy IPs
})
```

For Laravel 10, see `app/Http/Middleware/TrustProxies.php`.

> **Tip:** trust only the proxies you actually own. Setting `at: '*'` accepts
> any `X-Forwarded-For` header, which is fine when only your proxy can reach
> the app, but unsafe if the app is also directly accessible.

## Dashboard Authentication

> **Security:** When `dashboard.enabled` is `true`, the package will refuse to
> boot unless at least one of `dashboard.token`, `dashboard.gate`, or an `auth*`
> entry in `dashboard.middleware` is configured. The check is auto-skipped in
> the `testing` environment so your test suite can exercise the controller
> directly. To bypass it intentionally elsewhere (e.g. you front the dashboard
> with a network-level access control), set
> `visitor-tracker.dashboard.allow_unprotected = true`.


The dashboard is **always protected**. Choose an authentication method based on your site:

### Option 1: Token Authentication (Sites Without Login)

For sites without user authentication, use a secret token:

```env
# Add to your .env file (NEVER commit this!)
VISITOR_TRACKER_TOKEN=your-secret-token-here
```

Enable the dashboard in `config/visitor-tracker.php`:

```php
'dashboard' => [
    'enabled' => true,
    'token' => env('VISITOR_TRACKER_TOKEN'),
    'middleware' => ['web'], // No 'auth' needed
],
```

Access the dashboard via:
- **URL**: `/admin/visitor-tracker?token=your-secret-token-here`
- **Header**: `X-Visitor-Tracker-Token: your-secret-token-here`
- **Bearer**: `Authorization: Bearer your-secret-token-here`

### Option 2: Laravel Auth (Sites With Login)

For sites with user authentication:

```php
'dashboard' => [
    'enabled' => true,
    'middleware' => ['web', 'auth'],
],
```

### Option 3: Gate Authorization (Role-Based Access)

For admin-only access with Laravel Gates:

```php
// In AuthServiceProvider
Gate::define('view-visitor-stats', function ($user) {
    return $user->is_admin;
});

// In config/visitor-tracker.php
'dashboard' => [
    'enabled' => true,
    'middleware' => ['web', 'auth'],
    'gate' => 'view-visitor-stats',
],
```

## Geolocation Providers

All providers use Laravel's built-in HTTP client - no external packages required.

### ip-api.com (Free, No API Key)

```env
VISITOR_TRACKER_GEOLOCATION=true
VISITOR_TRACKER_GEO_PROVIDER=ip-api
```

### ipinfo.io

```env
VISITOR_TRACKER_GEOLOCATION=true
VISITOR_TRACKER_GEO_PROVIDER=ipinfo
VISITOR_TRACKER_GEO_API_KEY=your_api_key
```

## Queue Support

For high-traffic sites, enable queue processing:

```env
VISITOR_TRACKER_QUEUE=true
VISITOR_TRACKER_QUEUE_CONNECTION=redis
VISITOR_TRACKER_QUEUE_NAME=tracking
```

## GDPR Safe Mode

To track **anonymous aggregate statistics without requiring user consent**, enable GDPR Safe Mode:

```env
VISITOR_TRACKER_GDPR_SAFE=true
```

When enabled, the following personal data is **NOT collected**:

| Data | Status | Notes |
|------|--------|-------|
| IP Address | ❌ Not stored | Not even anonymized |
| User ID | ❌ Not stored | No link to authenticated users |
| Persistent Cookie | ❌ Not used | Session-only identification |
| Full User Agent | ❌ Not stored | Only parsed for aggregate stats |
| City / Region | ❌ Not stored | Only country-level location |
| Coordinates | ❌ Not stored | No lat/long |

> **Note on session fallback:** GDPR Safe Mode identifies visitors by Laravel's
> session ID (which lives in a session cookie that expires when the browser closes
> if you set `SESSION_LIFETIME` accordingly). If the request has no session
> available at all, the tracker falls back to a daily hash of the User-Agent
> string for aggregate counting only — this is not individually identifying but
> does group same-UA requests within a single calendar day. To get the strongest
> guarantees, ensure your tracked routes go through the `web` middleware group.

**What IS still collected** (anonymous, aggregate data):

| Data | Purpose |
|------|---------|
| Page view counts | Traffic analytics |
| Browser name | Chrome, Firefox, etc. |
| Platform name | Windows, macOS, etc. |
| Device type | Mobile, desktop, tablet |
| Country | Broad geographic distribution |
| Referrer domain | Traffic sources |

```php
// Check if GDPR safe mode is enabled
if (VisitorTracker::isGdprSafeMode()) {
    // No personal data being collected
}
```

## Detected Browsers

Chrome, Firefox, Safari, Edge, Opera, Brave, Vivaldi, Samsung Browser, UC Browser, Yandex, IE, and more.

## Detected Platforms

Windows (XP through 11), macOS, iOS, Android, Linux, Ubuntu, Chrome OS, FreeBSD.

## Detected Bots

100+ bot patterns including:
- **Search Engines**: Google, Bing, Yahoo, DuckDuckGo, Baidu, Yandex
- **Social Media**: Facebook, Twitter, LinkedIn, Pinterest, Slack, Discord
- **AI/LLM**: GPTBot, ClaudeBot, Anthropic, CCBot, Perplexity
- **SEO Tools**: Ahrefs, SEMrush, Moz, Majestic
- **Monitoring**: UptimeRobot, Pingdom, DataDog, New Relic
- **HTTP Clients**: cURL, Wget, Python Requests, Postman, Axios

## Testing

```bash
composer test
```

## Code Quality

```bash
# Run code style fixer
composer format

# Run static analysis
composer analyse
```

## Why Zero Dependencies?

- **Smaller footprint** - No additional packages to install or maintain
- **Better performance** - Native regex is fast and efficient
- **Full control** - Easily extend patterns via configuration
- **Security** - Less attack surface, no supply chain concerns
- **Reliability** - Only depends on Laravel core packages

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
