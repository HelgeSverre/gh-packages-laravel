# DimePay Laravel SDK

[![Latest Version on Packagist](https://img.shields.io/packagist/v/osoobe/dimepay-laravel-sdk.svg?style=flat-square)](https://packagist.org/packages/osoobe/dimepay-laravel-sdk)
[![Tests](https://img.shields.io/github/actions/workflow/status/osoobe/dimepay-laravel-sdk/tests.yml?label=tests&style=flat-square)](https://github.com/osoobe/dimepay-laravel-sdk/actions)
[![PHP Version](https://img.shields.io/badge/php-%5E8.2-blue.svg?style=flat-square)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/laravel-10%20%7C%2011%20%7C%2012-red.svg?style=flat-square)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE.md)

A first-class Laravel SDK for the [DimePay](https://docs.dimepay.net) payment gateway. Handles everything — orders, hosted payments, card tokenization, auth/capture/void/refund, split payments (Dime Bridge), recurring subscriptions, webhooks, JWT signing, and full white-label extensibility.

---

## Table of Contents

- [Requirements](#requirements)
- [Before You Start](#before-you-start)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [CSRF Setup](#csrf-setup)
- [Configuration Reference](#configuration-reference)
- [How It Works](#how-it-works)
- [Usage](#usage)
  - [Orders](#orders)
  - [Payments — Hosted Page](#payments--hosted-page)
  - [Payments — Auth / Sale / Capture / Void / Refund](#payments--auth--sale--capture--void--refund)
  - [Card Tokenization](#card-tokenization)
  - [Dime Bridge — Split Payments](#dime-bridge--split-payments)
  - [Recurring / Subscriptions](#recurring--subscriptions)
- [Webhooks](#webhooks)
- [Events Reference](#events-reference)
- [Exception Handling](#exception-handling)
- [Facade & Dependency Injection](#facade--dependency-injection)
- [Multi-tenant / White-label](#multi-tenant--white-label)
- [Extending the Package](#extending-the-package)
- [Testing Your App](#testing-your-app)
- [Sandbox Credentials](#sandbox-credentials)
- [FAQ](#faq)
- [Changelog](#changelog)
- [License](#license)

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.2 |
| Laravel | ^10.0 \| ^11.0 \| ^12.0 |
| DimePay Account | [Sign up at dimepay.net](https://dimepay.net) |

---

## Before You Start

Before installing, you need:

1. **A DimePay account** — [Sign up here](https://dimepay.net)
2. **Your API credentials** — Go to your DimePay Dashboard → Developer section and generate:
   - `client_key` — sent with every API request as a header (e.g. `ck_xxxxxxxxxxxx`)
   - `secret_key` — used **server-side only** to sign JWT payloads (e.g. `sk_xxxxxxxxxxxx`)
3. **A webhook URL** — a publicly accessible HTTPS URL on your app that DimePay can POST payment events to (e.g. `https://yourapp.com/dimepay/webhook`)

> **Never expose your `secret_key` in frontend code, mobile apps, or version control.** It signs every payment request and must stay private.

---

## Installation

```bash
composer require osoobe/dimepay-laravel-sdk
```

The package auto-discovers itself. No manual provider registration needed.

Run the install command:

```bash
php artisan dimepay:install
```

This publishes:
- `config/dimepay.php` — main SDK config
- `config/webhook-client.php` — webhook handling config
- Webhook database migrations

---

## Environment Variables

Add these to your `.env` file:

```env
# ─── Required ────────────────────────────────────────────────
DIMEPAY_ENV=sandbox                          # 'sandbox' or 'production'
DIMEPAY_CLIENT_KEY=ck_your_client_key        # from DimePay dashboard
DIMEPAY_SECRET_KEY=sk_your_secret_key        # from DimePay dashboard — KEEP PRIVATE

# ─── Optional — only needed if you want to override defaults ─
DIMEPAY_PRODUCTION_URL=https://api.dimepay.app/dapi/v1
DIMEPAY_SANDBOX_URL=https://sandbox.api.dimepay.app/dapi/v1
DIMEPAY_TIMEOUT=30
DIMEPAY_RETRIES=2
DIMEPAY_RETRY_DELAY=500
DIMEPAY_LOGGING=true
DIMEPAY_LOG_CHANNEL=stack
DIMEPAY_LOG_LEVEL=debug
DIMEPAY_ROUTES_ENABLED=true
DIMEPAY_ROUTES_PREFIX=dimepay
DIMEPAY_WEBHOOK_SECRET=your_webhook_secret   # optional — for signature verification
```

---

## Database Setup

The SDK uses `spatie/laravel-webhook-client` to receive and queue incoming webhooks. This requires one database table.

Run the migrations:

```bash
php artisan migrate
```

This creates the `webhook_calls` table which stores every incoming webhook from DimePay for reliable queued processing.

> If you don't plan to receive webhooks (e.g. you only use the hosted payment page and don't need payment event callbacks), you can skip this step and set `DIMEPAY_ROUTES_ENABLED=false` in your `.env`.

---

## CSRF Setup

DimePay POSTs webhooks to your app. Since webhooks come from an external server they don't have a CSRF token and will be rejected by Laravel's CSRF middleware.

Exclude the webhook route in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'dimepay/webhook',
        // or use your custom prefix if you changed DIMEPAY_ROUTES_PREFIX
    ]);
})
```

For older Laravel (pre-11), add to `app/Http/Middleware/VerifyCsrfToken.php`:

```php
protected $except = [
    'dimepay/webhook',
];
```

---

## Webhook Client Configuration

After running `php artisan dimepay:install`, open `config/webhook-client.php` and find or add the `dimepay` entry:

```php
'configs' => [
    [
        'name'                  => 'dimepay',
        'signing_secret'        => env('DIMEPAY_WEBHOOK_SECRET'),
        'signature_header_name' => 'X-DimePay-Signature',
        'signature_validator'   => \Osoobe\DimePay\Webhooks\DimePaySignatureValidator::class,
        'webhook_profile'       => \Osoobe\DimePay\Webhooks\DimePayWebhookProfile::class,
        'webhook_response'      => \Spatie\WebhookClient\WebhookResponse\DefaultRespondsTo::class,
        'webhook_model'         => \Spatie\WebhookClient\Models\WebhookCall::class,
        'process_webhook_job'   => \Osoobe\DimePay\Webhooks\ProcessDimePayWebhookJob::class,
    ],
],
```

Set your webhook URL in the DimePay dashboard to:

```
https://yourapp.com/dimepay/webhook
```

---

## Configuration Reference

All options in `config/dimepay.php`:

```php
return [
    // 'sandbox' or 'production'
    'environment' => env('DIMEPAY_ENV', 'sandbox'),

    // Sent as client_key header on every API request
    'client_key' => env('DIMEPAY_CLIENT_KEY'),

    // Used server-side to sign JWT payloads — NEVER expose this
    'secret_key' => env('DIMEPAY_SECRET_KEY'),

    // Override base URLs if needed (e.g. proxies)
    'base_urls' => [
        'production' => env('DIMEPAY_PRODUCTION_URL', 'https://api.dimepay.app/dapi/v1'),
        'sandbox'    => env('DIMEPAY_SANDBOX_URL', 'https://sandbox.api.dimepay.app/dapi/v1'),
    ],

    // HTTP client options
    'timeout'     => 30,    // seconds
    'retries'     => 2,     // auto-retry on server errors
    'retry_delay' => 500,   // milliseconds between retries

    // Log all API responses — useful during development
    'logging' => [
        'enabled' => env('DIMEPAY_LOGGING', true),
        'channel' => env('DIMEPAY_LOG_CHANNEL', 'stack'),
        'level'   => env('DIMEPAY_LOG_LEVEL', 'debug'),
    ],

    // Built-in webhook/callback routes
    'routes' => [
        'enabled'    => env('DIMEPAY_ROUTES_ENABLED', true),
        'prefix'     => env('DIMEPAY_ROUTES_PREFIX', 'dimepay'),
        'middleware' => ['api'],
    ],

    // Webhook signature verification
    'webhook' => [
        'secret'    => env('DIMEPAY_WEBHOOK_SECRET'),
        'tolerance' => 300, // replay-attack window in seconds
    ],

    // JWT signing
    'jwt' => [
        'algorithm' => 'HS256',
        'ttl'       => 3600,
    ],
];
```

---

## How It Works

Every API call to DimePay follows this flow:

```
Your app
  → builds a Data object (e.g. CreateOrderData)
  → SDK signs it as a JWT using your secret_key
  → SDK sends { lang: "en", data: "<jwt>" } with client_key header
  → DimePay processes it
  → SDK hydrates the response into a typed DTO
  → SDK fires a Laravel event
  → Your app receives a typed response object
```

**Why JWTs?** DimePay uses JWT-signed payloads so the API can verify that the request came from your server and hasn't been tampered with in transit.

**Your `secret_key` never leaves your server.** It only signs the outgoing payload — it never goes in the request itself.

---

## Usage

### Orders

An order represents a purchase intent. Create one first, then either redirect to the hosted payment page or charge a saved card directly.

```php
use Osoobe\DimePay\Facades\DimePay;
use Osoobe\DimePay\Data\Orders\CreateOrderData;

$order = DimePay::orders()->create(new CreateOrderData(
    id: 'ORDER-' . uniqid(),         // your internal order ID
    total: 5000,                      // amount in major units (e.g. 5000 JMD)
    subtotal: 5000,
    currency: 'JMD',                  // USD, JMD, GBP, EUR, TTD, BBD, XCD
    email: 'customer@example.com',
    ipAddress: request()->ip(),
    referenceTransactionId: 'REF-' . uniqid(),
    webhookUrl: 'https://yourapp.com/dimepay/webhook',
    redirectUrl: 'https://yourapp.com/order/success',
    checkoutUrl: 'https://yourapp.com/checkout',
    items: [
        [
            'id'               => 'prod-1',
            'name'             => 'Product Name',
            'price'            => 5000,
            'quantity'         => 1,
            'sku'              => 'SKU-001',
            'shortDescription' => 'Product description',
            'imageUrl'         => 'https://yourapp.com/product.jpg',
        ],
    ],
    taxes: [],  // array of ['name' => '...', 'value' => 12, 'total' => 57.1]
));

// $order->orderUrl — redirect customer here to pay
return redirect($order->orderUrl);
```

**Required fields:**
| Field | Description |
|---|---|
| `id` | Your unique order ID |
| `total` | Total amount in major units |
| `subtotal` | Subtotal before tax/discount |
| `currency` | Currency code |
| `email` | Customer email |
| `ipAddress` | Customer IP address |
| `referenceTransactionId` | Your unique reference ID |
| `items` | At minimum one item with `id`, `name`, `price`, `quantity`, `sku`, `shortDescription`, `imageUrl` |
| `taxes` | Array of tax objects (can be empty `[]`) |

---

### Payments — Hosted Page

The hosted page is the simplest integration. DimePay handles the card form, 3DS, and everything else. You just redirect.

```php
use Osoobe\DimePay\Facades\DimePay;
use Osoobe\DimePay\Data\Orders\CreateOrderData;

$page = DimePay::payments()->hostedPage(new CreateOrderData(
    id: 'ORDER-001',
    total: 5000,
    subtotal: 5000,
    currency: 'JMD',
    email: 'customer@example.com',
    ipAddress: request()->ip(),
    referenceTransactionId: 'REF-001',
    webhookUrl: 'https://yourapp.com/dimepay/webhook',
    redirectUrl: 'https://yourapp.com/order/success',
    checkoutUrl: 'https://yourapp.com/checkout',
    items: [...],
    taxes: [],
));

return redirect($page->orderUrl);
```

The customer pays on DimePay's hosted page. When done, DimePay:
1. Redirects them to your `redirectUrl`
2. POSTs the payment result to your `webhookUrl`

---

### Payments — Auth / Sale / Capture / Void / Refund

These endpoints require a **saved card token** (`card_xxx`). You get one by going through the [Card Tokenization](#card-tokenization) flow first.

#### Sale (charge immediately)

```php
use Osoobe\DimePay\Data\Payments\DirectPaymentData;
use Osoobe\DimePay\Data\Payments\PaymentParamsData;

$payment = DimePay::payments()->sale(new DirectPaymentData(
    id: 'ORDER-001',
    total: 5000,
    subtotal: 5000,
    currency: 'JMD',
    email: 'customer@example.com',
    ipAddress: request()->ip(),
    referenceTransactionId: 'REF-001',
    paymentParams: new PaymentParamsData(
        source: 'TOKEN',
        token: 'card_xxxxxxxxxxxx',  // saved card token
    ),
    items: [...],
    taxes: [],
));

// $payment->id — transaction ID, save this for capture/void/refund
// $payment->status — 'COMPLETE', 'FAILED', etc.
```

#### Auth (hold funds, capture later)

```php
$auth = DimePay::payments()->authorize($directPaymentData);
$transactionId = $auth->id;  // save this
```

#### Capture

```php
$captured = DimePay::payments()->capture($transactionId);
```

#### Void

```php
$voided = DimePay::payments()->void($transactionId);
```

#### Refund

```php
$refunded = DimePay::payments()->refund($transactionId);
```

---

### Card Tokenization

Tokenization lets you save a customer's card securely without handling raw card numbers. The customer enters their card on DimePay's hosted form. You receive a reusable token via webhook.

**Step 1 — Create a card request:**

```php
use Osoobe\DimePay\Data\Cards\CardRequestData;

$cardRequest = DimePay::cards()->requestToken(new CardRequestData(
    id: 'CARD-REQ-' . uniqid(),
    webhookUrl: 'https://yourapp.com/dimepay/webhook',
    redirectUrl: 'https://yourapp.com/card-saved',
));

// Redirect or embed the card form
return redirect($cardRequest->cardUrl);
// or embed: <iframe src="{{ $cardRequest->cardUrl }}"></iframe>
```

**Step 2 — Customer completes the card form on DimePay's page**

**Step 3 — DimePay POSTs to your webhook with the saved card token:**

```json
{
  "type": "card.saved",
  "token": "card_xxxxxxxxxxxx",
  "card_request_token": "cr_xxxxxxxxxxxx",
  "card_scheme": "Visa",
  "last_four_digits": "1111",
  "card_expiry": "12/25"
}
```

**Step 4 — Save the `card_xxx` token to your database and use it for future payments.**

> **Note:** You cannot use raw card numbers directly with the Payments API. All card payments require a pre-tokenized `card_xxx` token obtained through this flow.

---

### Dime Bridge — Split Payments

Dime Bridge splits a single payment across multiple merchants in your marketplace.

> **Requires Dime Bridge to be enabled on your DimePay account.** Contact support@dimepay.net to enable it.

Each item must be tagged with a `merchantId`. The `split` array defines how much each merchant receives and what platform fee you take.

```php
$order = DimePay::orders()->create(new CreateOrderData(
    id: 'ORDER-001',
    total: 2000,
    subtotal: 2000,
    currency: 'USD',
    email: 'customer@example.com',
    ipAddress: request()->ip(),
    referenceTransactionId: 'REF-001',
    webhookUrl: 'https://yourapp.com/dimepay/webhook',
    redirectUrl: 'https://yourapp.com/order/success',
    checkoutUrl: 'https://yourapp.com/checkout',
    items: [
        [
            'id'               => 'book-1',
            'name'             => 'PHP Book',
            'price'            => 500,
            'quantity'         => 1,
            'sku'              => 'BOOK-1',
            'shortDescription' => '',
            'imageUrl'         => 'https://example.com/book.jpg',
            'merchantId'       => 'm4D8mQ1wMrdTUIg',  // tag item to merchant
        ],
        [
            'id'               => 'course-1',
            'name'             => 'Laravel Course',
            'price'            => 1500,
            'quantity'         => 1,
            'sku'              => 'COURSE-1',
            'shortDescription' => '',
            'imageUrl'         => 'https://example.com/course.jpg',
            'merchantId'       => 'm7UarSiV9zWxN6v',
        ],
    ],
    split: [
        ['merchantId' => 'm4D8mQ1wMrdTUIg', 'amount' => 500,  'fee' => 10],  // 10% platform fee
        ['merchantId' => 'm7UarSiV9zWxN6v', 'amount' => 1500, 'fee' => 30],  // 30% platform fee
    ],
    taxes: [],
));

return redirect($order->orderUrl);
```

**Rules:**
- Every item must have a `merchantId`
- Every `merchantId` in `items` must have a matching entry in `split`
- `sum(split[].amount)` must equal the total of items grouped by merchant
- `fee` is a percentage (e.g. `10` = 10%)

---

### Recurring / Subscriptions

Create a subscription by adding `isSubscription: true` and `subscriptionInstructions` to any order. Include `tokenize: true` to save the card for future billing cycles.

```php
use Osoobe\DimePay\Data\Orders\SubscriptionInstructionsData;

$order = DimePay::orders()->create(new CreateOrderData(
    id: 'SUB-' . uniqid(),
    total: 4900,
    subtotal: 4900,
    currency: 'USD',
    email: 'subscriber@example.com',
    ipAddress: request()->ip(),
    referenceTransactionId: 'REF-SUB-' . uniqid(),
    webhookUrl: 'https://yourapp.com/dimepay/webhook',
    redirectUrl: 'https://yourapp.com/subscription/activated',
    checkoutUrl: 'https://yourapp.com/pricing',
    isSubscription: true,
    tokenize: true,               // save card for future cycles
    subscriptionInstructions: new SubscriptionInstructionsData(
        recurringFrequency: 'MONTHLY',  // 'WEEKLY', 'MONTHLY', 'YEARLY'
        billingCycles: 12,              // number of recurring charges
    ),
    items: [
        [
            'id'               => 'plan-basic',
            'name'             => 'Basic Plan — Monthly',
            'price'            => 4900,
            'quantity'         => 1,
            'sku'              => 'PLAN-BASIC',
            'shortDescription' => 'Monthly subscription',
            'imageUrl'         => 'https://yourapp.com/plan.jpg',
        ],
    ],
    taxes: [],
));

return redirect($order->orderUrl);
```

Webhook events to listen for:
- `subscription.created` — after first checkout succeeds
- `invoice.payment_succeeded` — each successful recurring charge
- `invoice.payment_failed` — each failed recurring charge
- `subscription.canceled` / `subscription.paused`

---

## Webhooks

DimePay sends payment events to `POST /dimepay/webhook`. The SDK handles receiving, storing, and queued processing automatically via `spatie/laravel-webhook-client`.

**Full setup checklist:**
- [ ] `php artisan dimepay:install` run
- [ ] `php artisan migrate` run (creates `webhook_calls` table)
- [ ] CSRF exception added for `dimepay/webhook`
- [ ] `config/webhook-client.php` configured with DimePay classes
- [ ] Webhook URL set in DimePay dashboard: `https://yourapp.com/dimepay/webhook`
- [ ] Queue worker running: `php artisan queue:work`

**Listen to webhook events in your app:**

```php
// app/Providers/AppServiceProvider.php or EventServiceProvider.php

use Osoobe\DimePay\Events\DimePayWebhookReceived;

Event::listen(DimePayWebhookReceived::class, function ($event) {
    $type    = $event->type;    // e.g. 'payment.success', 'card.saved'
    $payload = $event->payload; // full webhook payload array

    match ($type) {
        'payment.success'           => handlePaymentSuccess($payload),
        'payment.failed'            => handlePaymentFailed($payload),
        'card.saved'                => saveCardToken($payload['token'], $payload),
        'subscription.created'      => activateSubscription($payload),
        'invoice.payment_succeeded' => renewSubscription($payload),
        'invoice.payment_failed'    => handleFailedRenewal($payload),
        default                     => null,
    };
});
```

Or use a dedicated listener class:

```php
// app/Listeners/HandleDimePayWebhook.php
class HandleDimePayWebhook
{
    public function handle(DimePayWebhookReceived $event): void
    {
        // $event->type, $event->payload
    }
}
```

> **Important:** Webhooks are processed in a queue. Make sure your queue worker is running in production (`php artisan queue:work` or a process manager like Supervisor).

---

## Events Reference

All events fire from service methods — not controllers — so they fire whether you use the built-in routes or call services directly.

| Event | Fired When | Properties |
|---|---|---|
| `OrderCreated` | Order created via `orders()->create()` | `$request` (CreateOrderData), `$response` (CreateOrderResponseData) |
| `HostedPaymentPageCreated` | Hosted page created | `$request`, `$response` (HostedPageResponseData) |
| `PaymentAuthorized` | Payment authorized | `$request` (DirectPaymentData), `$response` (PaymentResponseData) |
| `PaymentSaleProcessed` | Sale completed | `$request`, `$response` |
| `PaymentCaptured` | Payment captured | `$transactionId`, `$response` |
| `PaymentVoided` | Payment voided | `$transactionId`, `$response` |
| `PaymentRefunded` | Payment refunded | `$transactionId`, `$response` |
| `CardTokenRequested` | Card tokenization initiated | `$request` (CardRequestData), `$response` (CardRequestResponseData) |
| `DimePayWebhookReceived` | Incoming webhook received | `$type`, `$payload` |
| `DimePayRequestFailed` | Any API request fails | `$endpoint`, `$payload`, `$exception` |

---

## Exception Handling

All DimePay API errors are normalized into typed exceptions.

```php
use Osoobe\DimePay\Exceptions\DimePayAuthException;
use Osoobe\DimePay\Exceptions\DimePayValidationException;
use Osoobe\DimePay\Exceptions\DimePayNotFoundException;
use Osoobe\DimePay\Exceptions\DimePayServerException;
use Osoobe\DimePay\Exceptions\DimePayException;

try {
    $order = DimePay::orders()->create($data);
} catch (DimePayAuthException $e) {
    // HTTP 401 — wrong or missing client_key
    // Check DIMEPAY_CLIENT_KEY in .env
} catch (DimePayValidationException $e) {
    // HTTP 400 — bad payload, missing required fields
    // $e->getDetails() returns array of validation error messages
    return back()->withErrors($e->getDetails());
} catch (DimePayNotFoundException $e) {
    // HTTP 404 — order/payment not found
    abort(404);
} catch (DimePayServerException $e) {
    // HTTP 500 — DimePay server error
    // Safe to retry — the SDK automatically retries server errors
    abort(503, 'Payment service temporarily unavailable');
} catch (DimePayException $e) {
    // Catch-all for any other DimePay error
    logger()->error('DimePay error', [
        'status'  => $e->getStatus(),
        'code'    => $e->getErrorCode(),
        'message' => $e->getMessage(),
        'details' => $e->getDetails(),
    ]);
}
```

---

## Facade & Dependency Injection

**Via Facade:**

```php
use Osoobe\DimePay\Facades\DimePay;

DimePay::orders()    // → OrderServiceInterface
DimePay::payments()  // → PaymentServiceInterface
DimePay::cards()     // → CardServiceInterface
DimePay::jwt()       // → JwtSigner (for manual JWT signing)
```

**Via Dependency Injection:**

```php
use Osoobe\DimePay\Contracts\OrderServiceInterface;
use Osoobe\DimePay\Contracts\PaymentServiceInterface;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderServiceInterface $orders,
        private readonly PaymentServiceInterface $payments,
    ) {}

    public function checkout(Request $request)
    {
        $page = $this->payments->hostedPage($orderData);
        return redirect($page->orderUrl);
    }
}
```

---

## Multi-tenant / White-label

If you have multiple tenants with different DimePay credentials, use `withConfig()`:

```php
$payment = DimePay::withConfig([
    'client_key'  => $tenant->dimepay_client_key,
    'secret_key'  => $tenant->dimepay_secret_key,
    'environment' => $tenant->dimepay_env,
])->payments()->sale($data);
```

This returns a new manager instance with overridden config — the original singleton is unaffected. Safe to use in multi-tenant apps where each request may use different credentials.

---

## Extending the Package

### Override a service

Bind your own implementation in a service provider:

```php
use Osoobe\DimePay\Contracts\OrderServiceInterface;
use App\Services\MyOrderService;

// In AppServiceProvider::register()
$this->app->bind(OrderServiceInterface::class, MyOrderService::class);
```

Extend the base class:

```php
use Osoobe\DimePay\Services\OrderService;

class MyOrderService extends OrderService
{
    public function create(CreateOrderData $data): CreateOrderResponseData
    {
        // your logic before/after
        return parent::create($data);
    }
}
```

### Override controllers / routes

Publish the routes:

```bash
php artisan vendor:publish --tag=dimepay-routes
```

Edit `routes/dimepay.php` to point to your own controllers.

### Override webhook profile

Filter which webhook types get processed:

```php
use Spatie\WebhookClient\WebhookProfile\WebhookProfile;

class MyWebhookProfile implements WebhookProfile
{
    public function shouldProcess(Request $request): bool
    {
        return in_array($request->input('type'), [
            'payment.success',
            'card.saved',
        ]);
    }
}
```

Register in `config/webhook-client.php`:

```php
'webhook_profile' => \App\Webhooks\MyWebhookProfile::class,
```

---

## Testing Your App

Use `Http::fake()` to mock DimePay responses in your tests without hitting the real API:

```php
use Illuminate\Support\Facades\Http;
use Osoobe\DimePay\Facades\DimePay;
use Osoobe\DimePay\Data\Orders\CreateOrderData;

Http::fake([
    'sandbox.api.dimepay.app/*/orders' => Http::response([
        'order_url' => 'https://pay.sandbox.dimepay.app/e-order/test123',
    ], 201),
]);

$order = DimePay::orders()->create(new CreateOrderData(
    id: 'ORDER-TEST',
    total: 5000,
    subtotal: 5000,
    currency: 'JMD',
    email: 'test@example.com',
    ipAddress: '127.0.0.1',
    referenceTransactionId: 'REF-TEST',
    items: [...],
    taxes: [],
));

expect($order->orderUrl)->toBe('https://pay.sandbox.dimepay.app/e-order/test123');
```

---

## Sandbox Credentials

Use these when `DIMEPAY_ENV=sandbox`:

**API Base URL:** `https://sandbox.api.dimepay.app/dapi/v1`

**Test Cards:**

| Brand | Card Number | Expiry | CVV |
|---|---|---|---|
| Visa | `4111 1111 1111 1111` | `12/25` | `123` |
| Mastercard | `5555 5555 5555 4444` | `02/26` | `265` |
| Amex | `3782 822463 10005` | `03/26` | `7890` |
| Discover | `6445 6464 4564 4564` | `04/40` | `123` |
| UnionPay | `6279 8862 4809 4966` | `04/40` | `123` |

> **Note on card payments in sandbox:** You cannot pass raw card numbers to the Payments API. You must go through the card tokenization flow to get a `card_xxx` token first, even in sandbox.

---

## FAQ

**Q: Do I need to sign JWTs myself?**
No. The SDK signs all payloads automatically using your `secret_key`. You only need `DimePay::jwt()->sign([...])` if you're building a custom frontend integration.

**Q: Can I use this without the built-in routes?**
Yes. Set `DIMEPAY_ROUTES_ENABLED=false` and call services directly from your own controllers.

**Q: Can I process payments with raw card numbers?**
No. DimePay requires card tokenization first. All card payments use a `card_xxx` token obtained through the hosted card form. This is a PCI compliance requirement.

**Q: What's the difference between `orders()->create()` and `payments()->hostedPage()`?**
Both create a hosted payment page. `orders()->create()` is the Orders API endpoint (`/orders`), while `payments()->hostedPage()` is the Payments API endpoint (`/payments/hosted-page`). They accept the same payload and return an `order_url`. Use either depending on your flow.

**Q: Do I need a queue for webhooks?**
Yes, strongly recommended. Webhooks are processed via a queued job. Without a queue worker running, webhook processing will stall. Use `php artisan queue:work` locally or Supervisor/Horizon in production.

**Q: Does Dime Bridge work in sandbox?**
Dime Bridge (split payments) must be enabled on your DimePay account. Contact support@dimepay.net to enable it.

**Q: How do I get a saved card token for testing auth/sale?**
Run the card tokenization flow — create a card request, open the `card_url` in a browser, enter a test card, and your webhook will receive the `card_xxx` token.

**Q: Is this an official DimePay package?**
No. This is a community SDK by Osoobe. For official support, contact support@dimepay.net.

---

## `php artisan about`

The SDK registers itself with Laravel's `about` command:

```bash
php artisan about
```

```
DimePay SDK
  Environment ........ sandbox
  Logging ............ enabled
  Version ............ 1.0.0
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT — see [LICENSE.md](LICENSE.md).
