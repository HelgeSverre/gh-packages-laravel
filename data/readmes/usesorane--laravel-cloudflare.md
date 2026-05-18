# Laravel Cloudflare

[![Latest Version](https://img.shields.io/packagist/v/ranetrace/laravel-cloudflare.svg)](https://packagist.org/packages/ranetrace/laravel-cloudflare)
[![Tests](https://img.shields.io/github/actions/workflow/status/ranetrace/laravel-cloudflare/laravel-package-tests.yml?branch=main&label=tests)](https://github.com/ranetrace/laravel-cloudflare/actions/workflows/laravel-package-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/ranetrace/laravel-cloudflare.svg)](https://packagist.org/packages/ranetrace/laravel-cloudflare)

Retrieve the current Cloudflare IP ranges, cache them, automatically update them, and access them through a simple service. 

Use the IP list in your `TrustProxies` middleware to trust all Cloudflare IPs automatically.

## Installation

Install the package via composer:

```bash
composer require ranetrace/laravel-cloudflare
```

(Optional) Publish the config file:

```bash
php artisan vendor:publish --tag="laravel-cloudflare"
```

## Laravel Boost Integration

This package includes built-in support for [Laravel Boost](https://github.com/laravel/boost), providing AI coding agents with context about how to use and configure this package.

When you run `php artisan boost:install` in a project that has this package installed:

- **A minimal guideline** is loaded with a quick command reference
- **The `laravel-cloudflare-setup` skill** becomes available for on-demand installation assistance, including the complete setup process, `bootstrap/app.php` middleware configuration, troubleshooting, and API reference

This approach keeps context overhead minimal while providing comprehensive help when needed. No additional configuration is required - Boost automatically discovers these resources from the package.

## Configuration

Content of the config file:

```php
return [
    'cache' => [
        // Cache store to use (null = default store)
        'store' => env('CLOUDFLARE_CACHE_STORE', null),

        // Primary cache keys ("current" – refreshed list) and fallback ("last_good" – permanent)
        'keys' => [
            'current' => [
                'all' => 'cloudflare:ips:current',
                'v4' => 'cloudflare:ips:v4:current',
                'v6' => 'cloudflare:ips:v6:current',
            ],
            'last_good' => [
                'all' => 'cloudflare:ips:last_good',
                'v4' => 'cloudflare:ips:v4:last_good',
                'v6' => 'cloudflare:ips:v6:last_good',
            ],
        ],

        // Time to live in seconds for the "current" list (null = forever). Default: 7 days.
        'ttl' => env('CLOUDFLARE_CACHE_TTL', 60 * 60 * 24 * 7),

        // Allow falling back to the last known good list when current is missing/expired.
        'allow_stale' => env('CLOUDFLARE_ALLOW_STALE', true),
    ],

    // HTTP client settings for fetching IP ranges from Cloudflare
    'http' => [
        'timeout' => env('CLOUDFLARE_HTTP_TIMEOUT', 10), // seconds
        // [attempts, sleepMilliseconds]
        'retry' => [env('CLOUDFLARE_HTTP_RETRY_ATTEMPTS', 3), env('CLOUDFLARE_HTTP_RETRY_SLEEP', 200)],
        'user_agent' => env('CLOUDFLARE_HTTP_USER_AGENT', 'Laravel-Cloudflare-IP-Fetcher/1.0 (+https://github.com/ranetrace/laravel-cloudflare)'),
        'endpoints' => [
            'ipv4' => 'https://www.cloudflare.com/ips-v4',
            'ipv6' => 'https://www.cloudflare.com/ips-v6',
        ],
    ],

    'logging' => [
        // Whether to log a warning when a fetch to Cloudflare endpoints fails
        'failed_fetch' => env('CLOUDFLARE_LOG_FAILED_FETCH', true),
    ],

    // Static fallback IPs to use when cache is empty (both current and last_good).
    'fallback' => [
        'ipv4' => [],
        'ipv6' => [],
    ],

    'diagnostics' => [
        // Enable the diagnostics route (default: false)
        'enabled' => env('CLOUDFLARE_DIAGNOSTICS_ENABLED', false),

        // Path for the diagnostics route
        'path' => env('CLOUDFLARE_DIAGNOSTICS_PATH', '/cloudflare-diagnose'),
    ],
];
```

## What it does

- Fetches Cloudflare IP ranges from:
	- https://www.cloudflare.com/ips-v4
	- https://www.cloudflare.com/ips-v6
- Validates IP ranges in CIDR notation before caching
- Caches the lists (default 7 days) and keeps a permanent fallback copy
- Provides commands to manage the cache:
    - `php artisan cloudflare:refresh` - fetch and cache the latest IPs
    - `php artisan cloudflare:cache-info` - view cache status (supports `--json` flag)
    - `php artisan cloudflare:clear` - clear cached IPs
- Dispatches events for extensibility:
    - `CloudflareIpsRefreshed` - fired when IPs are successfully refreshed
    - `CloudflareRefreshFailed` - fired when refresh fails
- Interact with the lists in your code via the `LaravelCloudflare` service:
    - `ipv4()`: get IPv4 addresses
    - `ipv6()`: get IPv6 addresses
    - `all()`: get all addresses (v4 + v6)
    - `refresh()`: fetch and cache immediately (returns bool success)
    - `cacheInfo()`: get info about the cached lists

## Quick usage

The most common use case is to trust Cloudflare proxies in your application.

1. Run the following command to fetch and cache the IPs initially:

```bash
php artisan cloudflare:refresh
```

2. Register the refresh command to your application's scheduler (`routes/console.php`):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('cloudflare:refresh')->twiceDaily(); // or ->daily(), ->hourly(), etc.
```

3. Trust Cloudflare proxies in `bootstrap/app.php`:

```php
use Ranetrace\LaravelCloudflare\LaravelCloudflare;

->withMiddleware(function (Middleware $middleware) {
    // Your other middleware interactions here...

    app()->booted(function () use ($middleware) {
        $cloudflareIps = app(\Ranetrace\LaravelCloudflare\LaravelCloudflare::class)->all();
        $ipsToTrust = [
            ...$cloudflareIps,
            // Add any other IPs you want to trust here
        ];
        $middleware->trustProxies(at: $ipsToTrust);
    });
})
```

Note: Use `app()->booted()` to ensure the application is fully booted and the cache is accessible.

4. Use the `cache-info` command to see information about the currently cached IPs.

```bash
php artisan cloudflare:cache-info
```

5. Enable the diagnostics route (optional) by setting `CLOUDFLARE_DIAGNOSTICS_ENABLED=true` in your `.env` file. Then visit `/cloudflare-diagnose` in your app to see how Cloudflare and your server headers are interpreted by Laravel.

6. If the `laravel_ip` in the diagnostics output from step 5 does not show your real client IP, read section [Determine which proxies to trust besides Cloudflare](#determine-which-proxies-to-trust-besides-cloudflare).

## The LaravelCloudflare service

```php
use Ranetrace\LaravelCloudflare\LaravelCloudflare;

$cloudflare = app(LaravelCloudflare::class);
$cloudflare->refresh(); // fetch and cache immediately
$v4Ips = $cloudflare->ipv4();
$v6Ips = $cloudflare->ipv6();
$allIps = $cloudflare->all();
$cacheInfo = $cloudflare->cacheInfo();
```

## Caching design (current + last_good)

To avoid network calls during request handling and still remain resilient if Cloudflare is temporarily unreachable, the package maintains two cache layers:

* current – the actively refreshed list with a configurable TTL (default 7 days).
* last_good – a permanent copy updated only after a successful refresh. It is not cleared on a failed refresh.

Lookup order for `ipv4()`, `ipv6()`, and `all()`:
1. current list
2. last_good list
3. config fallback (if configured)
4. (logs a warning and returns an empty array only if none of the above exist – typically only before the very first refresh)

Relevant config options (`config/laravel-cloudflare.php`):
* `cache.ttl` – lifetime for current list (seconds, null = forever).
* `cache.allow_stale` – whether to fall back to last_good when current missing.
* `cache.throw_on_empty` – throw exception when cache is empty instead of returning empty array (default: false).
* Distinct key sets under `cache.keys.current` and `cache.keys.last_good`.
* `fallback.ipv4` and `fallback.ipv6` – static IP arrays to use when cache is empty (see below).

Operational recommendation:
* Run `cloudflare:refresh` in your deployment pipeline and via the scheduler.
* Keep the TTL of last_good infinite (null) to ensure a fallback is always available.
* Regularly check logs and use `cloudflare:cache-info` to monitor cache status.

## Static fallback IPs (optional)

As a safety net, you can configure static fallback IPs that will be used when the cache is completely empty (e.g., before the first `cloudflare:refresh` runs). This ensures your app always has IPs to trust, even on first deployment.

```php
// In config/laravel-cloudflare.php
'fallback' => [
    'ipv4' => [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        // ... add more from https://www.cloudflare.com/ips-v4
    ],
    'ipv6' => [
        '2400:cb00::/32',
        '2606:4700::/32',
        // ... add more from https://www.cloudflare.com/ips-v6
    ],
],
```

**Note:** These fallback IPs are only used when both cache layers (current and last_good) are empty. Once `cloudflare:refresh` runs successfully, the cached IPs take precedence. Keep your fallback IPs updated periodically by checking https://www.cloudflare.com/ips/

## Diagnostics route (optional)

You can expose a small diagnostics endpoint to see how Cloudflare and your server headers are interpreted by Laravel.

**⚠️ SECURITY WARNING**: The diagnostics endpoint exposes information about your proxy configuration. By default, it uses only the `web` middleware without authentication. For production environments, you should:
- Keep it disabled (`CLOUDFLARE_DIAGNOSTICS_ENABLED=false`)
- Or add authentication middleware in the config file
- Or restrict access by IP address
- Or only enable it in development/staging environments

- Enable it via env/config:
    - `CLOUDFLARE_DIAGNOSTICS_ENABLED=true`
    - Optional custom path: `CLOUDFLARE_DIAGNOSTICS_PATH=/cloudflare-diagnose` (default is `/cloudflare-diagnose`)
    - Optional middleware: Configure in `config/laravel-cloudflare.php` (e.g., `['web', 'auth']`)
- When enabled, a GET endpoint is registered at the configured path and returns JSON like:

```json
{
    "laravel_ip": "203.0.113.5",
    "remote_addr": "172.16.0.10",
    "x_forwarded_for": "203.0.113.5, 172.16.0.10",
    "cf_connecting_ip": "203.0.113.5",
    "true_client_ip": "203.0.113.5",
    "server_https": "on",
    "is_secure": true
}
```

How to interpret:
- `laravel_ip`: The client IP as seen by Laravel after processing trusted proxies (i.e., the effective client IP).
- `remote_addr`: The direct connection IP (usually your load balancer or Cloudflare).
- `x_forwarded_for`: The full X-Forwarded-For header (may contain multiple IPs).
- `cf_connecting_ip`: The Cloudflare-specific header containing the original client IP (if present).
- `true_client_ip`: The True-Client-IP header (if present).
- `server_https`: The raw HTTPS server variable.
- `is_secure`: Whether Laravel considers the request secure (HTTPS).

If setup correctly, `laravel_ip` should match the actual client IP instead of a Cloudflare IP.

## Events

The package dispatches events that you can listen to for custom logic:

### CloudflareIpsRefreshed

Fired when IP ranges are successfully fetched and cached.

```php
use Ranetrace\LaravelCloudflare\Events\CloudflareIpsRefreshed;

// In your EventServiceProvider or listener
Event::listen(function (CloudflareIpsRefreshed $event) {
    // $event->ipv4 - array of IPv4 ranges
    // $event->ipv6 - array of IPv6 ranges

    Log::info('Cloudflare IPs refreshed', [
        'ipv4_count' => count($event->ipv4),
        'ipv6_count' => count($event->ipv6),
    ]);
});
```

### CloudflareRefreshFailed

Fired when the refresh operation fails (e.g., network error, empty response).

```php
use Ranetrace\LaravelCloudflare\Events\CloudflareRefreshFailed;

Event::listen(function (CloudflareRefreshFailed $event) {
    // $event->ipv4Empty - bool indicating if IPv4 fetch failed
    // $event->ipv6Empty - bool indicating if IPv6 fetch failed

    // Send alert to monitoring service
    if ($event->ipv4Empty && $event->ipv6Empty) {
        // Both failed - critical
    }
});
```

## Commands

### cloudflare:refresh

Fetches the latest IP ranges from Cloudflare and caches them. Returns exit code 0 on success, 1 on failure.

```bash
php artisan cloudflare:refresh
```

### cloudflare:cache-info

Displays information about the currently cached IP ranges.

```bash
# Human-readable output
php artisan cloudflare:cache-info

# JSON output for scripting
php artisan cloudflare:cache-info --json
```

### cloudflare:clear

Clears cached IP ranges. Useful for testing or troubleshooting.

```bash
# Clear all caches (current and last_good)
php artisan cloudflare:clear

# Clear only current cache
php artisan cloudflare:clear --current

# Clear only last_good cache
php artisan cloudflare:clear --last-good
```

## Why trusting proxies is important

Most production Laravel apps sit behind one or more proxies (CDNs, load balancers, etc.). Those proxies terminate TLS and forward the request to your app, typically attaching standard forwarding headers such as X-Forwarded-For/Proto/Host/Port.

Laravel will only use these headers if the request comes from a proxy you have explicitly trusted. Otherwise, Laravel ignores the headers (to prevent spoofing) and falls back to the direct connection details (REMOTE_ADDR, plain HTTP scheme, internal host/port).

When proxies are not trusted, several things can go wrong:

- Client IP is incorrect
    - `Request::ip()` shows the proxy or 127.0.0.1 instead of the real client.
    - Side effects: rate limiting and abuse protection over/under throttle, allow/deny lists misfire, audit logs and analytics record the wrong IP.

- HTTPS awareness is lost
    - `Request::isSecure()` may be false even when the original request was HTTPS.
    - Side effects: generated links use `http://` (mixed content), “force HTTPS” logic misbehaves, and cookies that require the `Secure` flag (e.g., SameSite=None) may be dropped by browsers, impacting auth / sessions.

- Host and port are wrong
    - Generated URLs (redirects, emails, pagination), signed URLs, and callback URLs may be invalid because they use internal host/port instead of the public ones.
    - Domain / subdomain routing or multi-tenant routing based on host can mis-route.

Trusting your proxies tells Laravel which upstream IPs/CIDRs are allowed to supply forwarding headers and which header set to honor. Then, Laravel normalizes the request's effective IP, scheme, host, and port. Thereby mitigating the above issues.

For security, avoid trusting all proxies unless your app is only reachable through a trusted network perimeter. Trusting the wrong IPs lets attackers spoof forwarding headers.

## Determine which proxies to trust besides Cloudflare

In addition to Cloudflare IPs, it's sometimes necessary to trust other proxies that forward traffic to your app.

- Receiving traffic via Cloudflare? Include the Cloudflare IP ranges from this package.
- Running a local web server in front of your app (e.g., Nginx → Octane)? Also include the local upstreams, commonly `127.0.0.1` and `::1`.
- Using a load balancer or ingress? Include its IP/CIDR (or the local web server that fronts your app).

Quick check: enable `CLOUDFLARE_DIAGNOSTICS_ENABLED=true` and visit `/cloudflare-diagnose`. If `laravel_ip` shows your real client IP and `is_secure` is true for HTTPS, you're set.

Security tip: trust only the proxies that truly forward traffic to your app; avoid `'*'` on public apps.

## Using with Laravel Octane

When you use this package to trust Cloudflare proxies via the `TrustProxies` middleware, while running behind Laravel Octane, keep the following in mind:

The proxy IP list you define in `bootstrap/app.php` is loaded into memory and only updates when the Octane workers restart.

Result: after you run `php artisan cloudflare:refresh`, workers do not immediately see the refreshed IP list.

Usually this is fine because:
- Cloudflare IP ranges rarely change.
- Octane workers restart after serving 500 requests by default.
- Octane workers restart when the application is deployed.

It can be a problem when:
- Your Octane workers do not restart soon enough for your needs (e.g., low traffic, high max requests setting, many workers).
- You want to always have the latest IPs in your Octane workers, no matter what.

If either applies:
- Restart the Octane workers with `php artisan octane:restart` after running `php artisan cloudflare:refresh`.

See the Laravel Octane documentation for more details: https://laravel.com/docs/octane

## Security Considerations

### Cache Store Security

The IP ranges cached by this package become your trusted proxy list. If an attacker can compromise your cache store (Redis, Memcached, etc.), they could inject malicious IPs into the trusted proxy list, allowing them to spoof forwarding headers.

**Recommendations:**
- Secure your cache store with proper authentication and network isolation
- Use a dedicated cache store for security-critical data if needed
- Monitor cache access logs for suspicious activity
- Document this risk in your security procedures

### IP Validation

The package validates that fetched IPs are in valid CIDR notation before caching. Invalid entries are logged and skipped. However, this is a format check only - it doesn't verify that the IPs are actually owned by Cloudflare.

### Exception Handling

By default, when the cache is empty (both current and last_good), methods return an empty array and log a warning. This could silently break proxy trust configuration.

To fail fast instead:
```php
// In config/laravel-cloudflare.php or .env
'throw_on_empty' => true, // or CLOUDFLARE_THROW_ON_EMPTY=true
```

When enabled, `all()`, `ipv4()`, and `ipv6()` will throw `EmptyCacheException` if no cached data is available.

### Diagnostics Endpoint

See the [Diagnostics route section](#diagnostics-route-optional) for important security warnings about this feature.

## License

Licensed under the MIT License. See `LICENSE.md`.
