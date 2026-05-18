# Laravel Payments

[![Latest Version on Packagist](https://img.shields.io/packagist/v/frolaxhq/laravel-payments.svg?style=flat-square)](https://packagist.org/packages/frolaxhq/laravel-payments)
[![Tests](https://img.shields.io/github/actions/workflow/status/frolaxhq/laravel-payments/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/frolaxhq/laravel-payments/actions?query=workflow%3Arun-tests+branch%3Amain)

A production-grade, gateway-agnostic payment abstraction for Laravel. One canonical payload for every gateway—forever.

## ✨ Features

- **One Canonical Payload** — Same shape for every gateway, always
- **Capability-Based Drivers** — Open/closed: core never branches on gateway name
- **Auto-Discovery** — Install a gateway addon package, it works immediately
- **Multi-Tenant Credentials** — ENV, database, or composite with priority & time windows
- **Universal Webhooks** — Idempotent, replay-safe webhook/return/cancel endpoints
- **Structured Logging** — Dot-notation, redacted, to DB + Laravel channels
- **Full CLI** — Generate gateways, list drivers, sync credentials, replay webhooks
- **Subscriptions** — Full lifecycle management with trial, pause, cancel, resume
- **Payment Methods** — Wallets, bank transfers, BNPL, QR codes, COD

## Installation

```bash
composer require frolaxhq/laravel-payments
```

Publish config and migrations:

```bash
php artisan vendor:publish --tag="payments-config"
php artisan vendor:publish --tag="payments-migrations"
php artisan migrate
```

## Quick Start

### Create a Payment

```php
use Frolax\Payment\Facades\Payment;

$result = Payment::gateway('stripe')->create([
    'order' => ['id' => 'ORD-123', 'description' => 'Premium Plan'],
    'money' => ['amount' => 29.99, 'currency' => 'USD'],
    'customer' => ['name' => 'John Doe', 'email' => 'john@example.com'],
    'urls' => [
        'return' => route('payments.return', 'stripe'),
        'cancel' => route('payments.cancel', 'stripe'),
        'webhook' => route('payments.webhook', 'stripe'),
    ],
]);

if ($result->requiresRedirect()) {
    return redirect($result->redirectUrl);
}
```

### Create a Subscription

Use the `SubscriptionManager` via the application container:

```php
use Frolax\Payment\SubscriptionManager;

$manager = app(SubscriptionManager::class);

$result = $manager->gateway('stripe')->create([
    'plan' => [
        'id' => 'plan_pro',
        'name' => 'Pro Plan',
        'money' => ['amount' => 49.99, 'currency' => 'USD'],
        'interval' => 'monthly',
        'trial_days' => 14,
    ],
    'customer' => ['name' => 'Jane Doe', 'email' => 'jane@example.com'],
    'urls' => ['return' => route('billing.return')],
]);

// Lifecycle
$manager->gateway('stripe')->cancel($subId);
$manager->gateway('stripe')->pause($subId);
$manager->gateway('stripe')->resume($subId);
```

### Refund a Payment

Use the `RefundManager` via the application container:

```php
use Frolax\Payment\RefundManager;

app(RefundManager::class)->gateway('stripe')->refund([
    'payment_id' => '01HQJ...',
    'money' => ['amount' => 10.00, 'currency' => 'USD'],
    'reason' => 'Customer requested',
]);
```

## Runtime Selectors

```php
// Multi-tenant
Payment::gateway('stripe')
    ->usingContext(['tenant_id' => 'tenant-abc'])
    ->create($payload);

// Switch profile
Payment::gateway('stripe')
    ->withProfile('live')
    ->create($payload);

// One-off credentials
Payment::gateway('stripe')
    ->usingCredentials(['key' => 'sk_live_...', 'secret' => '...'])
    ->create($payload);
```

## Driver System

Drivers implement `GatewayDriverContract` plus optional capability interfaces:

| Interface                     | Capability                     |
|-------------------------------|--------------------------------|
| `SupportsHostedRedirect`      | Redirect to hosted checkout    |
| `SupportsWebhookVerification` | Webhook signature verification |
| `SupportsRefund`              | Refund processing              |
| `SupportsStatusQuery`         | Payment status queries         |
| `SupportsRecurring`           | Subscription lifecycle         |
| `SupportsTokenization`        | Saved payment methods          |
| `SupportsCOD`                 | Cash on delivery               |

## Creating a Gateway

```bash
# Inline (in your app)
php artisan payments:make-gateway Bkash \
    --key=bkash --display="bKash" \
    --capabilities=redirect,webhook,refund \
    --credentials=key:required,secret:required

# As addon package
php artisan payments:make-gateway Bkash --addon \
    --key=bkash --display="bKash" \
    --capabilities=redirect,webhook,refund
```

## CLI Commands

```bash
php artisan payments:gateways                    # List all gateways
php artisan payments:make-gateway {name}         # Generate driver
php artisan payments:credentials:sync            # Validate credentials
php artisan payments:webhooks:replay {id}        # Replay webhook
```

## Events

| Event                     | When                           |
|---------------------------|--------------------------------|
| `PaymentCreated`          | Payment successfully created   |
| `PaymentVerified`         | Payment verified from callback |
| `PaymentFailed`           | Payment creation failed        |
| `PaymentCancelled`        | Payment cancelled by user      |
| `PaymentRefundRequested`  | Refund initiated               |
| `PaymentRefunded`         | Refund completed               |
| `SubscriptionCreated`     | Subscription created           |
| `SubscriptionRenewed`     | Subscription renewed           |
| `SubscriptionCancelled`   | Subscription cancelled         |
| `SubscriptionPaused`      | Subscription paused            |
| `SubscriptionResumed`     | Subscription resumed           |
| `SubscriptionTrialEnding` | Trial ending soon              |
| `PaymentMethodSaved`      | Payment method saved           |
| `PaymentMethodDeleted`    | Payment method deleted         |
| `WebhookReceived`         | Webhook received from gateway  |

## Database Tables

All tables use ULID primary keys and configurable table names:

**Core:** `payment_gateways`, `payment_gateway_credentials`, `payments`, `payment_attempts`, `payment_webhook_events`,
`payment_refunds`, `payment_logs`

**Subscriptions:** `payment_subscriptions`, `payment_subscription_items`, `payment_subscription_usage`

## Documentation

Full documentation available at [docs site](https://frolaxhq.github.io/laravel-payments):

- [Guide](docs/guide/) — Getting started, core concepts, usage, extending
- [Reference](docs/reference/) — Configuration, database schema, CLI, env vars
- [API Reference](docs/api/) — Contracts, Data, enums, events, models

## Testing

```bash
composer test
```

74 tests, 177 assertions. Tests use Orchestra Testbench with in-memory SQLite.

## License

MIT License. See [LICENSE.md](LICENSE.md).
