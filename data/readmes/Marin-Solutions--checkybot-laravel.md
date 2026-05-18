# Checkybot Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/marin-solutions/checkybot-laravel.svg?style=flat-square)](https://packagist.org/packages/marin-solutions/checkybot-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/Marin-Solutions/checkybot-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/Marin-Solutions/checkybot-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/marin-solutions/checkybot-laravel.svg?style=flat-square)](https://packagist.org/packages/marin-solutions/checkybot-laravel)

A Laravel package for defining and syncing monitoring checks to your Checkybot instance. Define uptime, SSL certificate, and API endpoint monitors using a beautiful fluent API inspired by Pest, and sync them with a single command.

## Quick Start

Get up and running in under 2 minutes:

```bash
# 1. Install the package
composer require marin-solutions/checkybot-laravel

# 2. Publish the routes file
php artisan vendor:publish --tag="checkybot-routes"

# 3. Publish the config (for API credentials)
php artisan vendor:publish --tag="checkybot-laravel-config"

# 4. Add credentials to .env
echo "CHECKYBOT_API_KEY=your-api-key" >> .env
echo "CHECKYBOT_PROJECT_ID=1" >> .env

# 5. Define your checks in routes/checkybot.php (see examples below)

# 6. Preview your checks
php artisan checkybot:sync --dry-run

# 7. Sync to Checkybot
php artisan checkybot:sync
```

## Installation

### Step 1: Install via Composer

```bash
composer require marin-solutions/checkybot-laravel
```

### Step 2: Publish Routes File

```bash
php artisan vendor:publish --tag="checkybot-routes"
```

This creates `routes/checkybot.php` where you'll define your monitoring checks using the fluent API.

### Step 3: Publish Configuration

```bash
php artisan vendor:publish --tag="checkybot-laravel-config"
```

### Step 4: Set Environment Variables

Add to your `.env` file:

```env
CHECKYBOT_API_KEY=your-api-key
CHECKYBOT_PROJECT_ID=1
CHECKYBOT_URL=https://checkybot.com
```

| Variable | Description |
|----------|-------------|
| `CHECKYBOT_API_KEY` | Your Checkybot API key (found in account settings) |
| `CHECKYBOT_PROJECT_ID` | The project ID to sync checks to |
| `CHECKYBOT_URL` | Checkybot instance URL (default: `https://checkybot.com`) |

### Step 5: Verify Installation

```bash
php artisan checkybot:sync --dry-run
```

## Defining Checks (Fluent API)

Define your checks in `routes/checkybot.php` using the expressive fluent API:

```php
<?php

use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

// Uptime Checks
Checkybot::uptime('homepage')
    ->url(config('app.url'))
    ->everyFiveMinutes();

Checkybot::uptime('api-server')
    ->url(config('app.url') . '/api')
    ->everyMinute()
    ->maxRedirects(5);

// SSL Certificate Checks
Checkybot::ssl('main-certificate')
    ->url(config('app.url'))
    ->daily();

// API Checks with Assertions (Pest-style!)
Checkybot::api('health-check')
    ->url(config('app.url') . '/api/health')
    ->everyFiveMinutes()
    ->withToken(config('services.monitoring.token'))
    ->expect('status')->toEqual('healthy')
    ->expect('database.connected')->toBeTrue()
    ->expect('queue.size')->toBeLessThan(1000);
```

## Uptime Checks

Monitor website availability and response times:

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

// Simple uptime check
Checkybot::uptime('homepage')
    ->url('https://example.com')
    ->everyFiveMinutes();

// With max redirects
Checkybot::uptime('blog')
    ->url('https://blog.example.com')
    ->every('10m')
    ->maxRedirects(5);

// Using interval helpers
Checkybot::uptime('critical-api')
    ->url('https://api.example.com')
    ->everyMinute();

Checkybot::uptime('dashboard')
    ->url('https://app.example.com/dashboard')
    ->everyFifteenMinutes();
```

### Interval Helpers

All Laravel scheduler interval helpers are available:

#### Seconds
| Method | Interval |
|--------|----------|
| `->everySecond()` | 1 second |
| `->everyTwoSeconds()` | 2 seconds |
| `->everyFiveSeconds()` | 5 seconds |
| `->everyTenSeconds()` | 10 seconds |
| `->everyFifteenSeconds()` | 15 seconds |
| `->everyTwentySeconds()` | 20 seconds |
| `->everyThirtySeconds()` | 30 seconds |

#### Minutes
| Method | Interval |
|--------|----------|
| `->everyMinute()` | 1 minute |
| `->everyTwoMinutes()` | 2 minutes |
| `->everyThreeMinutes()` | 3 minutes |
| `->everyFourMinutes()` | 4 minutes |
| `->everyFiveMinutes()` | 5 minutes |
| `->everyTenMinutes()` | 10 minutes |
| `->everyFifteenMinutes()` | 15 minutes |
| `->everyThirtyMinutes()` | 30 minutes |

#### Hours
| Method | Interval |
|--------|----------|
| `->hourly()` | 1 hour |
| `->everyTwoHours()` | 2 hours |
| `->everyThreeHours()` | 3 hours |
| `->everyFourHours()` | 4 hours |
| `->everySixHours()` | 6 hours |
| `->twiceDaily()` | 12 hours |

#### Days
| Method | Interval |
|--------|----------|
| `->daily()` | 1 day |
| `->weekly()` | 7 days |

#### Custom
| Method | Interval |
|--------|----------|
| `->every('5m')` | Custom interval |

## SSL Certificate Checks

Monitor SSL certificate expiration dates:

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

Checkybot::ssl('main-ssl')
    ->url('https://example.com')
    ->daily();

Checkybot::ssl('api-ssl')
    ->url('https://api.example.com')
    ->daily();

Checkybot::ssl('cdn-ssl')
    ->url('https://cdn.example.com')
    ->every('12h');
```

## API Endpoint Checks

Monitor API endpoints with optional response validation using Pest-style assertions:

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

// Simple API check
Checkybot::api('health')
    ->url('https://example.com/api/health')
    ->everyFiveMinutes();

// With authentication
Checkybot::api('authenticated-endpoint')
    ->url('https://example.com/api/status')
    ->everyFiveMinutes()
    ->withToken(config('services.monitoring.token'));

// With custom headers
Checkybot::api('custom-headers')
    ->url('https://example.com/api/data')
    ->everyFiveMinutes()
    ->headers([
        'Accept' => 'application/json',
        'X-Custom-Header' => 'value',
    ]);

// Or add headers one at a time
Checkybot::api('endpoint')
    ->url('https://example.com/api')
    ->withHeader('Authorization', 'Bearer token')
    ->withHeader('Accept', 'application/json')
    ->everyFiveMinutes();
```

### Response Assertions (Pest-style)

Chain assertions to validate JSON responses:

```php
Checkybot::api('health-check')
    ->url('https://example.com/api/health')
    ->everyFiveMinutes()
    ->expect('status')->toExist()
    ->expect('status')->toEqual('healthy')
    ->expect('database.connected')->toBeTrue()
    ->expect('cache.connected')->toBeTrue()
    ->expect('queue.size')->toBeLessThan(1000)
    ->expect('workers')->toBeGreaterThanOrEqual(1);
```

### Available Assertions

#### Existence
```php
->expect('path')->toExist()
->expect('path')->exists()       // alias
```

#### Equality
```php
->expect('status')->toEqual('healthy')
->expect('status')->toBe('healthy')      // alias
->expect('status')->equals('healthy')    // alias
->expect('status')->notToEqual('error')
->expect('status')->notToBe('error')     // alias
```

#### Comparisons
```php
->expect('count')->toBeGreaterThan(10)
->expect('count')->toBeGreaterThanOrEqual(10)
->expect('size')->toBeLessThan(1000)
->expect('size')->toBeLessThanOrEqual(1000)
```

#### Boolean
```php
->expect('active')->toBeTrue()
->expect('maintenance')->toBeFalse()
```

#### Type Checking
```php
->expect('id')->toBeType('integer')
->expect('id')->toBeInteger()     // alias
->expect('id')->toBeInt()         // alias
->expect('name')->toBeString()
->expect('active')->toBeBoolean()
->expect('active')->toBeBool()    // alias
->expect('items')->toBeArray()
->expect('data')->toBeObject()
```

#### Regex Matching
```php
->expect('version')->toMatch('/^v\d+\.\d+\.\d+$/')
->expect('email')->toMatchRegex('/^[a-z]+@example\.com$/')  // alias
```

## Real-World Examples

### E-commerce Application

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

// Critical pages - check every minute
Checkybot::uptime('storefront')
    ->url(config('app.url'))
    ->everyMinute();

Checkybot::uptime('checkout')
    ->url(config('app.url') . '/checkout')
    ->everyMinute();

Checkybot::uptime('cart')
    ->url(config('app.url') . '/cart')
    ->everyFiveMinutes();

// SSL
Checkybot::ssl('store-ssl')
    ->url(config('app.url'))
    ->daily();

// Payment gateway health
Checkybot::api('payment-gateway')
    ->url(config('app.url') . '/api/health/payments')
    ->everyFiveMinutes()
    ->expect('stripe_connected')->toBeTrue()
    ->expect('paypal_connected')->toBeTrue();

// Inventory service
Checkybot::api('inventory')
    ->url(config('app.url') . '/api/health/inventory')
    ->everyFiveMinutes()
    ->expect('status')->toEqual('operational');
```

### SaaS Application

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

// Core services
Checkybot::uptime('app')->url(config('app.url'))->everyMinute();
Checkybot::uptime('api')->url(config('app.url') . '/api')->everyMinute();
Checkybot::uptime('dashboard')->url(config('app.url') . '/dashboard')->everyFiveMinutes();

// SSL certificates
Checkybot::ssl('app-ssl')->url(config('app.url'))->daily();
Checkybot::ssl('api-ssl')->url(config('api.url', config('app.url')))->daily();

// Database health
Checkybot::api('database')
    ->url(config('app.url') . '/api/health/database')
    ->everyFiveMinutes()
    ->expect('status')->toEqual('connected')
    ->expect('latency_ms')->toBeLessThan(100);

// Redis health
Checkybot::api('redis')
    ->url(config('app.url') . '/api/health/redis')
    ->everyFiveMinutes()
    ->expect('status')->toEqual('connected');

// Queue health
Checkybot::api('queue')
    ->url(config('app.url') . '/api/health/queue')
    ->everyTenMinutes()
    ->expect('workers')->toBeGreaterThanOrEqual(1)
    ->expect('failed_jobs')->toBeLessThan(10)
    ->expect('queue_size')->toBeLessThan(1000);
```

### Multi-tenant Application

```php
use MarinSolutions\CheckybotLaravel\Facades\Checkybot;

Checkybot::uptime('main-app')
    ->url(config('app.url'))
    ->everyMinute();

Checkybot::uptime('tenant-portal')
    ->url(config('tenant.url', config('app.url') . '/tenant'))
    ->everyFiveMinutes();

Checkybot::uptime('admin-panel')
    ->url(config('admin.url', config('app.url') . '/admin'))
    ->everyFiveMinutes();

Checkybot::ssl('wildcard-ssl')
    ->url(config('app.url'))
    ->daily();

Checkybot::api('tenant-resolution')
    ->url(config('app.url') . '/api/health/tenants')
    ->everyFiveMinutes()
    ->expect('resolver_status')->toEqual('operational')
    ->expect('active_tenants')->toBeGreaterThan(0);
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Application
        run: # your deployment steps

      - name: Sync Checkybot Monitors
        run: php artisan checkybot:sync
        env:
          CHECKYBOT_API_KEY: ${{ secrets.CHECKYBOT_API_KEY }}
          CHECKYBOT_PROJECT_ID: ${{ secrets.CHECKYBOT_PROJECT_ID }}
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    - # your deployment steps
    - php artisan checkybot:sync
  variables:
    CHECKYBOT_API_KEY: $CHECKYBOT_API_KEY
    CHECKYBOT_PROJECT_ID: $CHECKYBOT_PROJECT_ID
```

### Laravel Forge (Post-Deployment Script)

```bash
cd /home/forge/example.com
php artisan checkybot:sync
```

### Laravel Envoyer (Deployment Hook)

Add as an "After" hook on the "Activate New Release" step:

```bash
cd {{ release }}
php artisan checkybot:sync
```

## Commands

```bash
# Sync all checks to Checkybot
php artisan checkybot:sync

# Preview changes without syncing
php artisan checkybot:sync --dry-run
```

## Troubleshooting

### "CHECKYBOT_API_KEY is not configured"

Make sure your `.env` file has the API key set:

```env
CHECKYBOT_API_KEY=your-api-key-here
```

Then clear the config cache:

```bash
php artisan config:clear
```

### "Duplicate check names found"

Each check name must be unique within its type:

```php
// Wrong - duplicate names
Checkybot::uptime('homepage')->url('https://example.com')->everyFiveMinutes();
Checkybot::uptime('homepage')->url('https://example.com/blog')->everyFiveMinutes();

// Correct - unique names
Checkybot::uptime('homepage')->url('https://example.com')->everyFiveMinutes();
Checkybot::uptime('blog')->url('https://example.com/blog')->everyFiveMinutes();
```

### "Connection timed out"

Check your `CHECKYBOT_URL` is correct and accessible. You can also increase the timeout in `config/checkybot-laravel.php`:

```php
'timeout' => 60, // seconds
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
