# LionTech Laravel

[![Latest Version](https://img.shields.io/packagist/v/nokimaro/liontech-laravel?style=flat-square)](https://packagist.org/packages/nokimaro/liontech-laravel)
[![Tests](https://img.shields.io/github/actions/workflow/status/nokimaro/liontech-laravel/ci.yml?branch=master&style=flat-square&label=tests)](https://github.com/nokimaro/liontech-laravel/actions/workflows/ci.yml)
![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=flat-square&logo=php)
![Laravel](https://img.shields.io/badge/Laravel-11--13-FF2D20?style=flat-square&logo=laravel)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE.md)

Laravel integration for the [LionTech Payment Gateway](https://liontechnology.ai). Wraps [nokimaro/liontech-php-sdk](https://github.com/nokimaro/liontech-php-sdk) with a service provider, facade, and dependency injection support.

> **Note:** This is an unofficial, community-maintained package. LionTech has no official Laravel package.

## Features

- **Auto-Discovery**: Zero manual registration — works out of the box
- **Dependency Injection**: All API clients registered as singletons in the container
- **Facade**: Static access to the full SDK via `LionTech::` facade
- **Config Helper**: Environment-based configuration with validation
- **Eager Provider**: All bindings registered upfront for reliable config resolution
- **Secure**: Webhook signature verification and RSA card encryption via the SDK

## Requirements

- PHP 8.3 or higher
- Laravel 11, 12, or 13

## Installation

```bash
composer require nokimaro/liontech-laravel
```

The package registers itself automatically via Laravel's package auto-discovery.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
LIONTECH_ACCESS_TOKEN=your_access_token_here
LIONTECH_REFRESH_TOKEN=your_refresh_token_here

# Optional: sandbox mode
LIONTECH_SANDBOX=true
LIONTECH_BASE_URL=https://api.sandbox.liontechnology.ai
LIONTECH_SECURE_URL=https://secure.sandbox.liontechnology.ai

# Optional: pre-loaded public keys (path or PEM content)
LIONTECH_WEBHOOK_PUBLIC_KEY=/path/to/webhook-public.pem
LIONTECH_CARD_ENCRYPTION_PUBLIC_KEY=/path/to/card-public.pem
```

### Publish Configuration (optional)

```bash
php artisan vendor:publish --tag=liontech-config
```

## Usage

### Facade

```php
use Nokimaro\LionTech\Laravel\Facades\LionTech;
use Nokimaro\LionTech\Requests\CreateOrderRequest;
use Nokimaro\LionTech\ValueObjects\Currency;
use Nokimaro\LionTech\ValueObjects\Money;

$order = LionTech::orders()->create(new CreateOrderRequest(
    amount: new Money('100.00', Currency::USD),
    description: 'Order #1234',
    successUrl: 'https://your-site.com/success',
    declineUrl: 'https://your-site.com/decline',
    webhookUrl: 'https://your-site.com/webhook',
));
```

### Dependency Injection

Inject the SDK or individual clients directly into your controllers:

```php
use Nokimaro\LionTech\Client;
use Nokimaro\LionTech\Clients\PaymentsClient;

class PaymentController extends Controller
{
    // Inject the main client
    public function store(Client $liontech)
    {
        $payment = $liontech->payments()->create($request);
    }

    // Or inject individual clients
    public function index(PaymentsClient $payments)
    {
        return $payments->get($paymentId);
    }
}
```

### Multiple Accounts (Multi-tenant)

The service provider registers a single `Client` instance from your config — sufficient for most applications. If you need multiple accounts (e.g. each tenant has their own credentials), instantiate the SDK client directly:

```php
use Nokimaro\LionTech\Client;

// Create a client for a specific tenant
$client = new Client(
    accessToken: $tenant->liontech_access_token,
    refreshToken: $tenant->liontech_refresh_token,
    baseUrl: config('liontech.base_url'),
    secureUrl: config('liontech.secure_url'),
);

$order = $client->orders()->create($request);
```

This bypasses the container singleton entirely and gives full control over credentials per request or per tenant.

### Webhook Verification

```php
use Nokimaro\LionTech\Security\WebhookSignatureVerifier;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function handle(Request $request, WebhookSignatureVerifier $verifier)
    {
        if (! $verifier->verify($request->headers->all(), $request->getContent())) {
            abort(403, 'Invalid webhook signature');
        }

        // process webhook...

        return response()->json(['status' => 'ok']);
    }
}
```

### Card Encryption

```php
use Nokimaro\LionTech\Security\CardEncryptor;

class PaymentController extends Controller
{
    public function __construct(private readonly CardEncryptor $encryptor) {}

    public function encrypt()
    {
        $encrypted = $this->encryptor->encryptForPayment([
            'pan' => '4405639704015096',
            'cvv' => '123',
            'exp_month' => 12,
            'exp_year' => 2030,
            'cardHolder' => 'John Doe',
        ]);
    }
}
```

### Config Helper

```php
use Nokimaro\LionTech\Laravel\Config\LionTechConfig;

if (LionTechConfig::isConfigured()) {
    // safe to use SDK
}

if (LionTechConfig::isSandbox()) {
    // running in sandbox mode
}
```

## Available Clients

Access via the `LionTech` facade or dependency injection:

| Method | Description |
|--------|-------------|
| `LionTech::auth()` | Token refresh and authentication |
| `LionTech::orders()` | Order management |
| `LionTech::payments()` | Payment processing |
| `LionTech::refunds()` | Refund operations |
| `LionTech::payouts()` | Payout management |
| `LionTech::tokens()` | Saved payment methods |
| `LionTech::balances()` | Account balances |
| `LionTech::transfers()` | Transfer operations |
| `LionTech::signature()` | Webhook public key retrieval |
| `LionTech::encryptionKey()` | Card encryption public key retrieval |

The following helpers are registered as singletons and should be used via dependency injection:

| Class | Description |
|-------|-------------|
| `WebhookSignatureVerifier` | Webhook signature verification |
| `CardEncryptor` | Card data encryption |

For full API documentation, request/response objects, and examples see [nokimaro/liontech-php-sdk](https://github.com/nokimaro/liontech-php-sdk).

## Testing

```bash
# Run tests
composer test

# Run with coverage
composer test-coverage

# Static analysis
composer phpstan

# Code style
composer ecs
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md)
and report it via [GitHub Security Advisories](https://github.com/nokimaro/liontech-laravel/security/advisories/new).
**Do not** open a public issue.

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
