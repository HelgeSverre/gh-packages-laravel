# Laravel FIB Payment (First Iraqi Bank)

<p align="center">
  <a href="https://packagist.org/packages/hamoi1/laravel-fib-payment"><img src="https://img.shields.io/packagist/v/hamoi1/laravel-fib-payment.svg?style=flat-square" alt="Latest Version on Packagist"></a>
  <a href="https://packagist.org/packages/hamoi1/laravel-fib-payment"><img src="https://img.shields.io/packagist/php-v/hamoi1/laravel-fib-payment.svg?style=flat-square" alt="Supported PHP Version"></a>
  <a href="https://packagist.org/packages/hamoi1/laravel-fib-payment"><img src="https://img.shields.io/badge/Laravel-11.x%20|%2012.x%20|%2013.x-orange?style=flat-square" alt="Laravel Versions"></a>
  <a href="LICENSE"><img src="https://img.shields.io/packagist/l/hamoi1/laravel-fib-payment.svg?style=flat-square" alt="License"></a>
</p>

A modern, type-safe Laravel SDK for First Iraqi Bank (FIB) payment integration. This package provides a fluent API for payment creation, status tracking, cancellations, refunds, and webhook protection with full dependency injection support.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Architecture Overview](#architecture-overview)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Webhook Protection](#webhook-protection)
- [Testing](#testing)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Requirements

- PHP 8.2+
- Laravel 11.x, 12.x, or 13.x
- FIB Payment Gateway credentials (client_id and client_secret)

---

## Installation

Install via Composer:

```bash
composer require hamoi1/laravel-fib-payment
```

The package will auto-register via Laravel's discovery. Publish the configuration file:

```bash
php artisan vendor:publish --tag=fib-config
```

---

## Configuration

Add the following to your `.env` file:

```env
# Required
FIB_CLIENT_ID=your-fib-client-id
FIB_CLIENT_SECRET=your-fib-client-secret
FIB_ENVIRONMENT=stage

# Optional
FIB_CALLBACK_URL=https://your-app.test/fib/webhook
FIB_CURRENCY=IQD
FIB_TIMEOUT=15
FIB_CONNECT_TIMEOUT=5
FIB_RETRY_TIMES=3
FIB_RETRY_DELAY=200
FIB_CACHE_DRIVER=
FIB_REFUNDABLE_FOR=P7D
FIB_ALLOWED_CALLBACK_IPS=
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIB_CLIENT_ID` | Yes | - | OAuth2 client ID from FIB |
| `FIB_CLIENT_SECRET` | Yes | - | OAuth2 client secret from FIB |
| `FIB_ENVIRONMENT` | Yes | `stage` | Environment: `stage`, or `prod` |
| `FIB_CALLBACK_URL` | No | `http://127.0.0.1:8000/fib/callback` | Webhook endpoint for status updates |
| `FIB_CURRENCY` | No | `IQD` | Default currency: `IQD` or `USD` |
| `FIB_TIMEOUT` | No | `15` | HTTP request timeout in seconds |
| `FIB_CONNECT_TIMEOUT` | No | `5` | Connection timeout in seconds |
| `FIB_RETRY_TIMES` | No | `3` | Number of retry attempts for failed requests |
| `FIB_RETRY_DELAY` | No | `200` | Delay between retries in milliseconds |
| `FIB_CACHE_DRIVER` | No | - | Cache driver for OAuth tokens (null = default) |
| `FIB_REFUNDABLE_FOR` | No | `P7D` | ISO 8601 duration for refund window |
| `FIB_ALLOWED_CALLBACK_IPS` | No | - | Comma-separated IPs for webhook security |

### Environments

| Environment | Base URL | Use Case |
|-------------|----------|----------|
| `stage` | `https://fib.stage.fib.iq` | Testing with FIB staging apps |
| `prod` | `https://fib.prod.fib.iq` | Production transactions |

---

## Architecture Overview

### Design Principles

- **Dependency Injection**: No static methods - everything is injectable
- **Type Safety**: PHP 8.2+ features with `readonly` classes and strict types
- **DTO Pattern**: Data Transfer Objects for all API inputs/outputs
- **Enum Safety**: Enums for currencies, environments, statuses, and error reasons
- **Exception Hierarchy**: Specific exceptions for different error types
- **Token Caching**: Smart OAuth2 token caching with configurable drivers

## Usage

### 1. Quick Start with Facade

The simplest way to use the package:

```php
use Hamoi1\FibPayment\Facades\Fib;
use Hamoi1\FibPayment\Data\PaymentRequest;
use Hamoi1\FibPayment\Enums\Currency;

// Create a payment
$response = Fib::createPayment(new PaymentRequest(
    amount: 25000,
    currency: Currency::IQD,
    description: 'Order #1024',
    callbackUrl: route('fib.webhook'),
));

// Access response data
$paymentId = $response->paymentId;
$readableCode = $response->readableCode;
$qrCode = $response->qrCode;
```

### 2. Check Payment Status

```php
use Hamoi1\FibPayment\Facades\Fib;

$status = Fib::getPaymentStatus($paymentId);

// Helper methods
if ($status->isPaid()) {
    // Payment completed successfully
    $payerName = $status->paidBy?->name;
    $payerIban = $status->paidBy?->iban;
}

if ($status->isUnpaid()) {
    // Payment still pending
    $expiresAt = $status->validUntil;
}

if ($status->isDeclined()) {
    // Payment declined
    $reason = $status->decliningReason?->value;
}
```

### 3. Cancel or Refund Payments

```php
// Cancel an unpaid payment
$cancelled = Fib::cancelPayment($paymentId); // bool

// Refund a paid payment (within refundable window)
$refunded = Fib::refundPayment($paymentId); // bool
```

### 4. Dependency Injection (Recommended)

For better testability and cleaner architecture:

```php
use Hamoi1\FibPayment\Contracts\FibClientInterface;
use Hamoi1\FibPayment\Data\PaymentRequest;

final class CheckoutController
{
    public function __construct(
        private readonly FibClientInterface $fib
    ) {}

    public function store(Request $request): JsonResponse
    {
        $payment = $this->fib->createPayment(new PaymentRequest(
            amount: $request->input('amount'),
            description: "Order #{$request->input('order_id')}",
        ));

        return response()->json([
            'payment_id' => $payment->paymentId,
            'code' => $payment->readableCode,
        ]);
    }
}
```

---


## Error Handling

The package throws specific exceptions for different error scenarios:

### Exception Hierarchy

```
FibException (abstract base)
├── AuthenticationException (401/403)
├── RateLimitException (429)
└── PaymentFailedException (other HTTP errors)
```

### Handling Examples

```php
use Hamoi1\FibPayment\Exceptions\AuthenticationException;
use Hamoi1\FibPayment\Exceptions\RateLimitException;
use Hamoi1\FibPayment\Exceptions\PaymentFailedException;
use Hamoi1\FibPayment\Exceptions\FibException;

try {
    $response = Fib::createPayment($request);
} catch (AuthenticationException $e) {
    // Invalid credentials or token expired
    // HTTP 401 or 403
    Log::error('FIB auth failed: ' . $e->getMessage());
} catch (RateLimitException $e) {
    // Too many requests
    // HTTP 429
    Log::warning('FIB rate limit hit');
    // Retry after delay
} catch (PaymentFailedException $e) {
    // Other API errors (500, 400, etc.)
    Log::error('FIB payment error: ' . $e->getMessage());
} catch (FibException $e) {
    // Catch-all for any package exception
    Log::error('FIB error: ' . $e->getMessage());
}
```

---

## Webhook Protection

### Using the Middleware

Protect your webhook endpoint from invalid requests:

```php
use Hamoi1\FibPayment\Http\Middleware\VerifyFibWebhook;
use Illuminate\Support\Facades\Route;

Route::post('/fib/webhook', [PaymentController::class, 'handleWebhook'])
    ->middleware(VerifyFibWebhook::class)
    ->name('fib.webhook');
```

### Middleware Validation

The `VerifyFibWebhook` middleware validates:

1. **Required Fields**: Ensures `paymentId` and `status` are present
2. **Valid Status**: Checks status is one of `PAID`, `UNPAID`, or `DECLINED`
3. **IP Allowlist**: If `FIB_ALLOWED_CALLBACK_IPS` is set, validates request IP

### Webhook Controller Example

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Hamoi1\FibPayment\Enums\PaymentStatus;

final class PaymentController extends Controller
{
    public function handleWebhook(Request $request): JsonResponse
    {
        $paymentId = $request->input('paymentId');
        $status = PaymentStatus::from($request->input('status'));

        match ($status) {
            PaymentStatus::PAID => $this->markOrderAsPaid($paymentId),
            PaymentStatus::DECLINED => $this->markOrderAsDeclined($paymentId),
            PaymentStatus::UNPAID => null, // No action needed
        };

        return response()->json(['received' => true]);
    }

    private function markOrderAsPaid(string $paymentId): void
    {
        // Update your database
        Order::where('fib_payment_id', $paymentId)
            ->update(['status' => 'paid']);
    }

    private function markOrderAsDeclined(string $paymentId): void
    {
        Order::where('fib_payment_id', $paymentId)
            ->update(['status' => 'declined']);
    }
}
```

### IP Allowlist Configuration

Restrict webhooks to specific FIB server IPs:

```env
FIB_ALLOWED_CALLBACK_IPS=203.0.113.10,203.0.113.11
```

---

## Testing

### Mocking the Service

In your application tests, mock the interface:

```php
use Hamoi1\FibPayment\Contracts\FibClientInterface;
use Hamoi1\FibPayment\Data\PaymentResponse;
use Hamoi1\FibPayment\Data\PaymentStatusInfo;
use Hamoi1\FibPayment\Enums\PaymentStatus;
use Illuminate\Support\Facades\App;
use Mockery;

it('processes successful payment', function () {
    // Create mock
    $mock = Mockery::mock(FibClientInterface::class);

    // Define expected behavior
    $mock->shouldReceive('createPayment')
        ->once()
        ->andReturn(new PaymentResponse(
            paymentId: 'pay-test-123',
            readableCode: 'ABC123',
            qrCode: 'base64-encoded-qr-data',
            validUntil: now()->addHour()->toIso8601String(),
            personalAppLink: 'https://fib.iq/personal/pay-test-123',
            businessAppLink: 'https://fib.iq/business/pay-test-123',
            corporateAppLink: 'https://fib.iq/corporate/pay-test-123',
        ));

    // Bind mock to container
    App::instance(FibClientInterface::class, $mock);

    // Test your controller/service
    $response = $this->postJson('/api/checkout', [
        'amount' => 1000,
    ]);

    $response->assertOk()
        ->assertJsonPath('payment_id', 'pay-test-123');
});

it('handles paid webhook', function () {
    $mock = Mockery::mock(FibClientInterface::class);
    
    $mock->shouldReceive('getPaymentStatus')
        ->with('pay-test-456')
        ->andReturn(new PaymentStatusInfo(
            paymentId: 'pay-test-456',
            status: PaymentStatus::PAID,
            validUntil: now()->addHour()->toIso8601String(),
            amount: new \Hamoi1\FibPayment\Data\MonetaryValue(1000, \Hamoi1\FibPayment\Enums\Currency::IQD),
        ));

    App::instance(FibClientInterface::class, $mock);

    $response = $this->postJson('/fib/webhook', [
        'paymentId' => 'pay-test-456',
        'status' => 'PAID',
    ]);

    $response->assertOk();
});
```

### Package Quality Commands

Run these commands to ensure code quality:

```bash
# Run all checks
composer check

# Individual commands
composer lint      # Laravel Pint code style check
composer lint:fix  # Auto-fix code style
composer analyse   # PHPStan static analysis
composer test      # Pest tests
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Jwt issuer is not configured` | Your client_id isn't activated by FIB. Contact FIB support. |
| `401 Unauthorized` | Check client_id and client_secret in .env |
| `403 Forbidden` | Credentials may be valid but lack permissions |
| `429 Too Many Requests` | You're hitting rate limits. Implement exponential backoff. |
| Token cache issues | Run `php artisan cache:clear` |
| Config not loading | Run `php artisan config:clear` |

### Debug Endpoints

Add this to your routes for debugging:

```php
Route::get('/fib/debug', function () {
    return [
        'environment' => config('fib.environment'),
        'client_id' => config('fib.client_id') ? '***' . substr(config('fib.client_id'), -4) : 'NOT SET',
        'client_secret_set' => ! empty(config('fib.client_secret')),
        'callback_url' => config('fib.callback_url'),
        'base_url' => \Hamoi1\FibPayment\Enums\FibEnvironment::from(config('fib.environment'))->baseUrl(),
    ];
});
```

---

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.

