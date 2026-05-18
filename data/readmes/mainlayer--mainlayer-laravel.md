# Mainlayer Laravel Package

Official Laravel package for **Mainlayer** — payment infrastructure for AI agents and modern APIs.

Quickly add payment gates, subscription tracking, and entitlement management to any Laravel application.

## Features

- **Payment Gating**: Middleware to protect routes behind Mainlayer entitlements
- **Facade API**: Clean, fluent access to Mainlayer endpoints via `Mainlayer::` facade
- **Database Caching**: Optional local caching of entitlements via cache or database drivers
- **Artisan Commands**: Setup wizard and subscription synchronization
- **Model Trait**: Easy subscription tracking on User or custom models
- **Comprehensive Logging**: Request/response logging for debugging
- **Retry Middleware**: Built-in exponential backoff for transient failures
- **Laravel 10+ & 11 Support**: Compatible with modern Laravel versions

## Installation

### 1. Composer

```bash
composer require mainlayer/mainlayer-laravel
```

### 2. Environment

Add to `.env`:

```env
MAINLAYER_API_KEY=ml_live_your_api_key
MAINLAYER_BASE_URL=https://api.mainlayer.fr
```

### 3. Publish Config (Optional)

```bash
php artisan vendor:publish --tag=mainlayer-config
```

### 4. Run Migrations

```bash
php artisan migrate
```

Or use the setup wizard:

```bash
php artisan mainlayer:setup
```

## Quick Start

### Protect Routes with Middleware

```php
use Illuminate\Support\Facades\Route;

Route::middleware('mainlayer')->group(function () {
    Route::get('/api/premium-data', [DataController::class, 'index']);
});

// Or protect specific routes with a custom resource:
Route::middleware('mainlayer:res_custom_resource')->group(function () {
    Route::get('/api/exclusive', [ExclusiveController::class, 'show']);
});
```

### Use the Facade

```php
use Mainlayer\Laravel\Facades\Mainlayer;

// Check an entitlement token
$result = Mainlayer::checkEntitlement($token, 'res_api_v1');
if ($result['valid']) {
    // Grant access
}

// Get entitlement details
$entitlement = Mainlayer::getEntitlement($entitlementId);

// List entitlements
$all = Mainlayer::listEntitlements(['status' => 'active']);

// Create a payment session
$session = Mainlayer::createPaymentSession([
    'resource' => 'res_api_v1',
    'amount' => 9900,
    'currency' => 'USD',
]);
```

### Track Subscriptions on Models

```php
use Illuminate\Database\Eloquent\Model;
use Mainlayer\Laravel\Traits\HasMainlayerSubscription;

class User extends Model
{
    use HasMainlayerSubscription;
}

// Check if user has active subscription
if ($user->active_subscription?) {
    // Grant premium access
}

// Get list of resource IDs user is entitled to
$resources = $user->mainlayer_entitlements; // ['res_api_v1', 'res_data_v2']

// Sync subscription state from API
$subscription = $user->sync_mainlayer_subscription!(wallet: $user->wallet);

// Check specific resource entitlement
if ($user->entitled_to?('res_premium')) {
    // Serve premium content
}
```

## Configuration

All configuration is in `config/mainlayer.php`:

```php
return [
    // Your Mainlayer API key
    'api_key' => env('MAINLAYER_API_KEY'),

    // API base URL (default: https://api.mainlayer.fr)
    'base_url' => env('MAINLAYER_BASE_URL', 'https://api.mainlayer.fr'),

    // HTTP timeout in seconds
    'timeout' => env('MAINLAYER_TIMEOUT', 30),

    // Cache strategy: 'cache' | 'database' | 'none'
    'cache_driver' => env('MAINLAYER_CACHE_DRIVER', 'cache'),

    // Cache time-to-live in seconds
    'cache_ttl' => env('MAINLAYER_CACHE_TTL', 60),

    // HTTP status for payment-required responses
    'middleware' => [
        'http_status' => 402,
        'message' => 'Payment Required.',
        'header' => 'X-Mainlayer-Entitlement',
    ],

    // Retry configuration
    'retries' => env('MAINLAYER_RETRIES', 2),
    'retry_delay' => env('MAINLAYER_RETRY_DELAY', 100),

    // Logging
    'logging' => [
        'enabled' => env('MAINLAYER_LOGGING', false),
        'channel' => env('MAINLAYER_LOG_CHANNEL', null),
    ],

    // Fail open on API outage
    'fail_open' => env('MAINLAYER_FAIL_OPEN', true),
];
```

## Artisan Commands

### Setup Wizard

Interactive setup with config publishing, migrations, and API verification:

```bash
php artisan mainlayer:setup

# Or skip prompts:
php artisan mainlayer:setup --publish --migrate --api-key=ml_live_your_key
```

### Sync Subscriptions

Synchronize subscription state from Mainlayer for a batch of users:

```bash
php artisan mainlayer:sync-subscriptions

# Filter by a specific resource:
php artisan mainlayer:sync-subscriptions --resource=res_api_v1

# Sync only expired subscriptions:
php artisan mainlayer:sync-subscriptions --expired-only

# Verbose output:
php artisan mainlayer:sync-subscriptions -v
```

### Check Subscriptions

Verify subscription status for debugging:

```bash
php artisan mainlayer:check-subscription {entitlementId}
```

## Middleware

The `mainlayer` middleware enforces payment requirements on protected routes.

### Default Behavior

```php
// Requires X-Mainlayer-Entitlement header
Route::middleware('mainlayer')->get('/api/data', fn() => 'Paid content');
```

### Custom Resource

```php
// Scopes the check to a specific resource ID
Route::middleware('mainlayer:res_custom')->get('/api/exclusive', ...);
```

### Fail-Open Mode

By default, if the Mainlayer API is unreachable, the middleware allows the request through (fail-open):

```env
MAINLAYER_FAIL_OPEN=false  # Strict mode: deny if API is unreachable
```

## Caching

Entitlement checks are cached locally to reduce API load and latency.

### Cache Driver Options

```env
# In-process Laravel cache (default)
MAINLAYER_CACHE_DRIVER=cache
MAINLAYER_CACHE_TTL=60

# Local database (persistent across requests)
MAINLAYER_CACHE_DRIVER=database
MAINLAYER_CACHE_TTL=300

# Disable caching
MAINLAYER_CACHE_DRIVER=none
```

## Testing

The package includes 15+ PHPUnit tests covering all major functionality:

```bash
composer test

# With coverage
composer test-coverage
```

Test files are in `tests/Unit/` and demonstrate mocking the Mainlayer API using Mockery.

## Examples

See the `examples/` directory for complete, runnable controller examples:

- `PaywallController.php` — Route protection and payment flow
- `SubscriptionController.php` — User subscription management

## Troubleshooting

### "Missing entitlement token" on protected routes

Ensure the client is sending the token in the correct header:

```bash
curl -H "X-Mainlayer-Entitlement: ent_abc123" http://localhost/api/paid
```

### Caching causing stale data

Lower `MAINLAYER_CACHE_TTL` for more frequent API checks, or disable with `MAINLAYER_CACHE_DRIVER=none`.

### API connectivity errors

Enable logging to debug:

```env
MAINLAYER_LOGGING=true
MAINLAYER_LOG_CHANNEL=stack
```

Then check `storage/logs/laravel.log`.

## Security

- API keys are never logged or transmitted in plain text
- Entitlement tokens are hashed before database storage
- All API communication uses HTTPS
- Sensitive configuration is environment-based

## License

MIT License. See LICENSE file for details.

## Support

- Documentation: https://docs.mainlayer.fr
- Issues: https://github.com/mainlayer/mainlayer-laravel/issues
- Contact: support@mainlayer.xyz

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and breaking changes.
