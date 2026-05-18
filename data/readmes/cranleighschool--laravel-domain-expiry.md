# cranleighschool/domain-expiry

A Laravel 12+ package for monitoring domain expiry dates via direct WHOIS queries.

## Features

- Direct TCP WHOIS queries — no external API keys or services required
- 70+ TLDs supported out of the box, including two-part TLDs (`co.uk`, `com.au`, etc.)
- Built-in web dashboard at `/domain-expiry`
- JSON API endpoint for integration with other dashboards
- Artisan command for CLI checks and cron-based alerting
- Laravel Cache integration with configurable TTL
- Per-domain refresh via the dashboard UI
- Zero production dependencies beyond the Laravel framework

---

## Installation

```bash
composer require cranleighschool/domain-expiry
```

Publish the config file:

```bash
php artisan vendor:publish --tag=domain-expiry-config
```

---

## Configuration

Open `config/domain-expiry.php` and add your domains:

```php
'domains' => [
    'cranleighschool.org',
    'example.co.uk',
    'myproject.io',
],
```

### Protect the dashboard

By default the dashboard had the middleware `web` and `auth` attached. If you want to amend the middelware you can do that in the config file. Removing `auth` for example will make the dashboard accessible to all. 

```php
'dashboard' => [
    'enabled'    => true,
    'uri'        => '/domain-expiry',
    'middleware' => ['web', 'auth'],
],
```

### Urgency thresholds

```php
'thresholds' => [
    'critical' => 14,   // < 14 days  → red
    'warning'  => 30,   // < 30 days  → amber
    'notice'   => 60,   // < 60 days  → blue
],
```

### Cache settings

```php
'cache_store' => 'redis',  // null = default cache driver
'cache_ttl'   => 3600,     // 1 hour
```

### Add custom WHOIS servers

```php
'extra_whois_servers' => [
    'sch.uk' => 'whois.nic.uk',
],
```

---

## Usage

### Web Dashboard

Visit `/domain-expiry` (or your configured URI) to see the dashboard. Each row shows:
- Urgency badge (OK / NOTICE / WARNING / CRITICAL / EXPIRED / UNKNOWN)
- Days remaining with a progress bar
- Expiry date and time (UTC)
- WHOIS server used
- Per-domain refresh button

### JSON API

```
GET /domain-expiry/json
```

Returns:

```json
{
    "generated_at": "2025-10-01T09:00:00+00:00",
    "summary": { "ok": 3, "notice": 1, "warning": 0, "critical": 0, "expired": 0, "unknown": 0 },
    "domains": [
        {
            "domain": "example.com",
            "tld": "com",
            "server": "whois.verisign-grs.com",
            "expiry_date": "2026-05-12T00:00:00+00:00",
            "days": 223,
            "urgency": "ok",
            "error": null
        }
    ]
}
```

### Facade

```php
use CranleighSchool\DomainExpiry\Facades\DomainExpiry;

// Check a single domain
$result = DomainExpiry::check('example.com');
echo $result->daysUntilExpiry();    // 223
echo $result->urgencyLevel()->value; // "ok"

// Check many (sorted by soonest expiry)
$results = DomainExpiry::checkMany(['example.com', 'example.co.uk']);

// Only domains expiring within 30 days
$urgent = DomainExpiry::expiringSoon(['example.com', 'example.co.uk'], withinDays: 30);

// Force a fresh WHOIS query, bypassing the cache
$fresh = DomainExpiry::refresh('example.com');
```

### Importing domains from registrars

Pull all domains from your configured registrars and upsert them into the database:

```bash
php artisan domain-expiry:registrar-import
```

The package ships with [Gandi](https://www.gandi.net) and [Porkbun](https://porkbun.com) support. Set your credentials in `.env`:

```env
GANDI_ORGANISATION_API_KEY=your-key-here
PORKBUN_API_KEY=your-key-here
PORKBUN_SECRET_API_KEY=your-secret-here
```

#### Adding a custom registrar

Implement `RegistrarInterface` and tag it in your service provider — the import command picks it up automatically alongside the built-in registrars.

**1. Implement the interface**

```php
namespace App\Registrars;

use CranleighSchool\DomainExpiry\RegistrarInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class Namecheap implements RegistrarInterface
{
    /**
     *  Must return a collection of domain names (string), without any schema/protcol or extra data — just the domain name itself.)
     * eg: ["example.com", "mydomain.co.uk", "anotherdomain.io"]
     */
    public function getDomains(): Collection
    {
        return Http::get('https://api.namecheap.com/...')
            ->collect()
            ->pluck('Name');
    }
}
```

**2. Tag it in your `AppServiceProvider`**

```php
use App\Registrars\Namecheap;

public function register(): void
{
    $this->app->tag([Namecheap::class], 'domain-expiry.registrars');
}
```

---

### Artisan command

```bash
# Check all domains from config
php artisan domain-expiry:check

# Check specific domains
php artisan domain-expiry:check --domain=example.com --domain=example.co.uk

# Only show domains that need attention
php artisan domain-expiry:check --warn-only

# Output JSON
php artisan domain-expiry:check --json

# Bypass cache (force fresh WHOIS queries)
php artisan domain-expiry:check --refresh
```

The command exits with code `1` if any domain is CRITICAL or EXPIRED — useful for CI or monitoring scripts.

### Scheduled alerting

In `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

// Check daily at 08:00 and email if anything is expiring soon
Schedule::command('domain-expiry:check --warn-only')
    ->dailyAt('08:00')
    ->emailOutputOnFailure('admin@example.com');
```

---

## Testing

```bash
composer test
```

---

## Publishing views

To customise the dashboard blade template:

```bash
php artisan vendor:publish --tag=domain-expiry-views
```

The view will be published to `resources/views/vendor/domain-expiry/dashboard.blade.php`.

---

## Limitations

- Some registrars (Cloudflare, GoDaddy proxy registration) redact WHOIS data. These will show as `UNKNOWN`.
- WHOIS servers rate-limit aggressively — do not set `cache_ttl` too low in production.
- The `sch.uk` and other specialist TLDs may need adding via `extra_whois_servers`.

---

## Licence

MIT
