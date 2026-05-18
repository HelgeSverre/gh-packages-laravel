# ProofAge Laravel Client — Age Verification for Laravel

**Platform:** https://proofage.xyz | **Packagist:** https://packagist.org/packages/proofage/laravel-client

A Laravel package for integrating with the ProofAge API, featuring automatic HMAC authentication and a fluent interface.

## About ProofAge

ProofAge is an online age verification platform enabling websites to confirm users meet minimum age requirements through a hosted, privacy-focused KYC process — without server-side document handling. It supports alcohol/tobacco/cannabis commerce, adult content platforms, gambling sites, and age-restricted subscriptions.

This package provides a first-class Laravel integration: a service provider with auto-discovery, a facade, HMAC-signed webhook middleware, and a setup verification command.

## Installation

Install the package via Composer:

```bash
composer require proofage/laravel-client
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="ProofAge\Laravel\ProofAgeServiceProvider" --tag="config"
```

Configure your environment variables:

```env
PROOFAGE_API_KEY=your-api-key
PROOFAGE_SECRET_KEY=your-secret-key
PROOFAGE_BASE_URL=https://api.proofage.xyz
PROOFAGE_VERSION=v1
```

## Setup Verification

After configuration, verify your setup using the built-in command:

```bash
php artisan proofage:verify-setup
```

### Successful Setup Output

When everything is configured correctly, you should see:

```
✅ Configuration is valid
✅ Workspace connection successful
✅ Webhook URL is configured https://yoursite.com/webhooks/proof-age
✅ Webhook route found: POST webhooks/proof-age -> App\Http\Controllers\WebhookController@handleProofAgeWebhook
✅ Webhook route is protected with VerifyWebhookSignature middleware
✅ ProofAge setup verified successfully!
```

### What the Command Checks

The verification command ensures:

1. **Configuration** - API keys and base URL are properly set
2. **Workspace Connection** - Can successfully connect to ProofAge API
3. **Webhook URL** - Webhook endpoint is configured in your workspace
4. **Route Existence** - Laravel route exists for the webhook path
5. **HTTP Method** - Route accepts POST requests
6. **Security Middleware** - Route is protected with HMAC signature verification

### Troubleshooting

If you see errors about missing middleware, add it to your webhook route:

```php
Route::post('/webhooks/proof-age', [WebhookController::class, 'handleProofAgeWebhook'])
    ->middleware('proofage.verify_webhook');
```

## Usage

### Basic Usage

```php
use ProofAge\Laravel\Facades\ProofAge;

// Get workspace information
$workspace = ProofAge::workspace()->get();

// Create a verification
$verification = ProofAge::verifications()->create([
    'callback_url' => 'https://your-app.com/webhook',
    'metadata' => ['user_id' => 123]
]);

// Get verification details
$verification = ProofAge::verifications()->find('verification-id');

// Accept consent for verification
ProofAge::verifications('verification-id')->acceptConsent([
    'consent_version_id' => 1,
    'text_sha256' => 'hash-value'
]);

// Upload media
ProofAge::verifications('verification-id')->uploadMedia([
    'type' => 'selfie',
    'file' => $uploadedFile
]);

// Submit verification
ProofAge::verifications('verification-id')->submit();
```

### Using the Client Directly

```php
use ProofAge\Laravel\ProofAgeClient;

$client = app(ProofAgeClient::class);
$workspace = $client->workspace()->get();
```

## Webhook Security

The package includes middleware to verify HMAC signatures on incoming webhook requests from ProofAge.

### Using the Middleware

Apply the middleware to your webhook routes:

```php
// In your routes/web.php or routes/api.php
Route::post('/proofage/webhook', [WebhookController::class, 'handle'])
    ->middleware('proofage.verify_webhook');
```

Or apply it to a route group:

```php
Route::middleware(['proofage.verify_webhook'])->group(function () {
    Route::post('/proofage/decision-webhook', [WebhookController::class, 'handleDecision']);
    Route::post('/proofage/track-webhook', [WebhookController::class, 'handleStatusChanged']);
});
```

### How It Works

The middleware:

1. Checks that `PROOFAGE_SECRET_KEY` is configured
2. Verifies the `X-HMAC-Signature` header is present
3. Generates the expected signature using the same algorithm as ProofAge
4. Compares signatures using `hash_equals()` for timing-safe comparison
5. Returns appropriate error responses for invalid requests

## Multiple Workspaces

Some applications need separate verification flows for different user roles. For example, a marketplace where buyers go through a basic age check while sellers require full identity verification -- each with its own ProofAge workspace, credentials, and webhook endpoint.

The package supports this out of the box. All shared settings (`base_url`, `version`, `timeout`, etc.) are inherited from the default `proofage` config, so additional workspaces only need their own `api_key` and `secret_key`.

### Example: marketplace with buyer and seller verification

#### 1. Configure credentials for each workspace

The default workspace (buyers) is configured via `config/proofage.php` as usual. For sellers, add a second set of credentials anywhere in your application config -- `config/services.php` is a common choice:

```php
// config/services.php
'proofage_seller' => [
    'api_key' => env('PROOFAGE_SELLER_API_KEY'),
    'secret_key' => env('PROOFAGE_SELLER_SECRET_KEY'),
],
```

```env
# .env
# Buyer workspace (default)
PROOFAGE_API_KEY=pk_live_...
PROOFAGE_SECRET_KEY=sk_live_...

# Seller workspace
PROOFAGE_SELLER_API_KEY=pk_live_...
PROOFAGE_SELLER_SECRET_KEY=sk_live_...
```

#### 2. Create verifications with the correct client

The `ProofAge` facade and `app(ProofAgeClient::class)` singleton always use the default (buyer) workspace. For the seller workspace, use `ProofAgeClientFactory`:

```php
use ProofAge\Laravel\Facades\ProofAge;
use ProofAge\Laravel\ProofAgeClientFactory;

// Buyer verification -- uses default proofage.* config
$buyerVerification = ProofAge::verifications()->create([
    'callback_url' => 'https://marketplace.com/webhooks/proofage',
]);

// Seller verification -- uses services.proofage_seller config
$sellerClient = app(ProofAgeClientFactory::class)->make('services.proofage_seller');
$sellerVerification = $sellerClient->verifications()->create([
    'callback_url' => 'https://marketplace.com/webhooks/proofage-seller',
]);
```

#### 3. Set up separate webhook routes

Each workspace sends webhooks signed with its own secret key. Use the middleware's config prefix parameter to verify signatures with the correct credentials:

```php
// routes/api.php

// Buyer webhooks -- verified with default proofage.* keys
Route::post('/webhooks/proofage', [BuyerWebhookController::class, 'handle'])
    ->middleware('proofage.verify_webhook');

// Seller webhooks -- verified with services.proofage_seller keys
Route::post('/webhooks/proofage-seller', [SellerWebhookController::class, 'handle'])
    ->middleware('proofage.verify_webhook:services.proofage_seller');
```

#### 4. Verify setup for each workspace

```bash
# Check the buyer (default) workspace
php artisan proofage:verify-setup

# Check the seller workspace
php artisan proofage:verify-setup --config=services.proofage_seller
```

The command checks configuration, API connectivity, webhook route existence, and that the middleware uses the matching config prefix -- so you'll be warned if the keys would mismatch.

### Config resolution

When a custom config prefix is used, the following resolution rules apply:

| Key | Resolution |
|-----|-----------|
| `api_key` | Read from the specified prefix (required) |
| `secret_key` | Read from the specified prefix (required) |
| `base_url` | Specified prefix, falls back to `proofage.base_url` |
| `version` | Specified prefix, falls back to `proofage.version` |
| `timeout` | Specified prefix, falls back to `proofage.timeout` |
| `retry_attempts` | Specified prefix, falls back to `proofage.retry_attempts` |
| `retry_delay` | Specified prefix, falls back to `proofage.retry_delay` |
| `webhook_tolerance` | Specified prefix, falls back to `proofage.webhook_tolerance` (default: 300s) |

Additional workspaces only need `api_key` and `secret_key`. If a workspace connects to a different ProofAge environment (e.g. staging), add `base_url` under the same prefix and it will take priority over the default.

## API Methods

### Workspace

- `workspace()->get()` - Get workspace information
- `workspace()->getConsent()` - Get consent information

### Verifications

- `verifications()->create(array $data)` - Create a new verification
- `verifications()->find(string $id)` - Get verification by ID
- `verifications(string $id)->acceptConsent(array $data)` - Accept consent
- `verifications(string $id)->uploadMedia(array $data)` - Upload media files
- `verifications(string $id)->submit()` - Submit verification for processing

## Error Handling

The client throws specific exceptions for different error types:

```php
use ProofAge\Laravel\Exceptions\ProofAgeException;
use ProofAge\Laravel\Exceptions\AuthenticationException;
use ProofAge\Laravel\Exceptions\ValidationException;

try {
    $verification = ProofAge::verifications()->create($data);
} catch (AuthenticationException $e) {
    // Handle authentication errors
} catch (ValidationException $e) {
    // Handle validation errors
} catch (ProofAgeException $e) {
    // Handle other API errors
}
```

### Webhook Exception Handling

The webhook middleware throws `WebhookVerificationException` on invalid requests. By default, the exception renders a JSON error response:

```json
{
    "error": {
        "code": "INVALID_SIGNATURE",
        "message": "HMAC signature is invalid"
    }
}
```

To customize this response, register a renderable in your application's exception handler:

**Laravel 11+ (`bootstrap/app.php`):**

```php
use ProofAge\Laravel\Exceptions\WebhookVerificationException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->renderable(function (WebhookVerificationException $e) {
        return response()->json([
            'error' => [
                'code' => $e->errorCode,
                'message' => $e->getMessage(),
            ],
        ], $e->statusCode);
    });
})
```

**Laravel 10 (`app/Exceptions/Handler.php`):**

```php
use ProofAge\Laravel\Exceptions\WebhookVerificationException;

public function register(): void
{
    $this->renderable(function (WebhookVerificationException $e) {
        return response()->json([
            'error' => [
                'code' => $e->errorCode,
                'message' => $e->getMessage(),
            ],
        ], $e->statusCode);
    });
}
```

## Testing

```bash
composer test
```

## Additional Resources

- **Platform:** https://proofage.xyz
- **Live Demo:** https://demo.proofage.xyz
- **Node SDK:** `@proofage/node` on npm

### Integrations for other platforms

| Platform | Repository | Use-case |
|---|---|---|
| **Node.js** | [ProofAge/node-client](https://github.com/ProofAge/node-client) | Node.js age verification client — HMAC-signed API calls, webhook verification for Express, Hono, Next.js and other Node.js frameworks |
| **WordPress** | [ProofAge/wordpress-plugin](https://github.com/ProofAge/wordpress-plugin) | Age gate plugin for WordPress — WooCommerce age verification, age-restricted pages, adult content gating |
| **Laravel** | this repo | Laravel age verification client — HMAC-signed API calls, webhook handling, middleware for age-restricted routes |
| **Next.js** | [ProofAge/demo](https://github.com/ProofAge/demo) | Full-stack age verification demo with JS SDK, server routes, and webhook receiver |

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
