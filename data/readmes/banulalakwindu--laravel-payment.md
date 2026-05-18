# Laravel Payment (`banulakwin/laravel-payment`)

Portable Laravel package for checkout-style payments: **multi-provider drivers**, shared DTOs, **domain events** normalized to `PaymentStatus`, and a small **HTTP callback** endpoint for provider webhooks.

Supported providers:

| Driver key | Class | Description |
|------------|-------|-------------|
| `onepay` | `OnepayPaymentProvider` | OnePay (Sri Lanka) checkout link + redirect (included by default) |
| `paypal` | `PaypalPaymentProvider` | PayPal Orders v2 (`CAPTURE`) — optional; requires `paypal/paypal-server-sdk` |
| `stripe` | `StripePaymentProvider` | Stripe Checkout Sessions — optional; requires `stripe/stripe-php` |

---

## Requirements

- PHP `^8.4`
- Laravel `^11.0|^12.0|^13.0` (`illuminate/support`, `http`, `routing`, `queue`, `events`)
- `paypal/paypal-server-sdk` `^2.0` — **only when** you enable the PayPal driver
- `stripe/stripe-php` `^16.0` or `^17.0` — **only when** you enable the Stripe driver

---

## Installation

### OnePay only

```bash
composer require banulakwin/laravel-payment
php artisan vendor:publish --tag=payment-config
```

Set `PAYMENT_DRIVER=onepay` (default). The published `config/payment.php` registers the OnePay driver only.

### Adding PayPal

```bash
composer require paypal/paypal-server-sdk
```

Add the driver to `config/payment.php`:

```php
'providers' => [
    'onepay' => \Banulakwin\Payment\Providers\Onepay\OnepayPaymentProvider::class,
    'paypal' => \Banulakwin\Payment\Providers\Paypal\PaypalPaymentProvider::class,
],
```

Configure `payment.paypal.*` (see PayPal section below).

### Adding Stripe

```bash
composer require stripe/stripe-php
```

Add the driver to `config/payment.php`:

```php
'providers' => [
    'onepay' => \Banulakwin\Payment\Providers\Onepay\OnepayPaymentProvider::class,
    'stripe' => \Banulakwin\Payment\Providers\Stripe\StripePaymentProvider::class,
],
```

Set `STRIPE_SECRET`, `STRIPE_KEY`, `STRIPE_WEBHOOK_SECRET`, and optional `STRIPE_CURRENCY` (see Stripe section below).

Auto-discovery registers `Banulakwin\Payment\PaymentServiceProvider`. The `payment()` helper and `PaymentGateway` contract resolve to `PaymentManager`.

---

## Configuration overview

| Config key | Purpose |
|------------|---------|
| `payment.default` | Default driver name (`env('PAYMENT_DRIVER', 'onepay')`). |
| `payment.providers` | Map of driver key → provider class implementing `PaymentProviderInterface`. |
| `payment.routes.*` | Enable/prefix/middleware for `POST /payment/{provider}/callback`. |
| `payment.webhook.*` | Queue name, connection, job tries, backoff for `ProcessPaymentWebhookJob`. |
| `payment.onepay.*` | OnePay credentials and API base URL. |
| `payment.paypal.*` | PayPal OAuth credentials (sandbox/live blocks). |

Route env vars: `PAYMENT_ROUTES_ENABLED`, `PAYMENT_ROUTE_PREFIX`, `PAYMENT_WEBHOOK_QUEUE`, `PAYMENT_WEBHOOK_CONNECTION`, `PAYMENT_WEBHOOK_TRIES`.

Environment variables are documented under each provider section below.

---

## Architecture

### Payment manager

`Banulakwin\Payment\Managers\PaymentManager` is registered as a **singleton**. It resolves the active driver from `payment.default` unless you override with `driver('paypal')`, etc.

```php
use Banulakwin\Payment\DTOs\CreatePaymentRequest;

// Default driver from config
$response = payment()->initiatePayment($request);

// Explicit driver
$response = payment()->driver('paypal')->initiatePayment($request);

// Low-level access to the provider instance
$provider = payment()->driver('onepay')->provider();
```

The global helper `payment()` is defined in `src/helpers.php` and returns `PaymentManager`.

### Provider contract

Each provider implements `Banulakwin\Payment\Contracts\PaymentProviderInterface`:

| Method | Role |
|--------|------|
| `createPaymentRequest(CreatePaymentRequest)` | Create a remote payment session; return redirect URL and provider transaction id. |
| `getTransaction(GetTransactionRequest)` | Fetch current state from the gateway (polling / reconciliation). |
| `handleWebhook(WebhookPayload)` | Map inbound callback body to a normalized `WebhookResponse`. |

### Data transfer objects

- **`CreatePaymentRequest`** — `amount`, `reference`, `currency`, `customerEmail`, optional `successUrl`, `cancelUrl`, customer name/phone, optional `items` (`PaymentItem[]`) + `shipping` (`PaymentShipping`) (PayPal uses them; Onepay ignores), `additionalData`, `metadata`.
- **`CreatePaymentResponse`** — `providerTransactionId`, `redirectUrl`, `PaymentStatus`, `raw` (provider JSON as array).
- **`GetTransactionRequest`** — `providerTransactionId`.
- **`GetTransactionResponse`** — ids, amount, currency, `PaymentStatus`, `raw`.
- **`WebhookPayload`** — `payload` (array), `headers`, `rawBody` (for signature verification if you extend providers).
- **`WebhookResponse`** — `referenceId`, `PaymentProvider` enum, `PaymentStatus`, `data`.

### Payment status (normalized)

`Banulakwin\Payment\Enums\PaymentStatus` is the **only** lifecycle model inside this package:

- `pending`, `authorized`, `captured`, `voided`, `refunded`, `failed`

Providers map gateway-specific states into these values. **Order fulfilment, subscriptions, and business rules** belong in your app (listeners, jobs, policies)—not inside the provider mapping.

### Payment provider enum

`Banulakwin\Payment\Enums\PaymentProvider`: `Onepay`, `Paypal` — carried on `WebhookResponse` for listeners.

---

## Events

All status events implement `Banulakwin\Payment\Contracts\PaymentStatusEvent` with `webhookData(): WebhookResponse`, so you can listen generically:

```php
use Banulakwin\Payment\Contracts\PaymentStatusEvent;

Event::listen(PaymentStatusEvent::class, function (PaymentStatusEvent $event): void {
    // $event->webhookData()
});
```

When `ProcessPaymentWebhookJob` exhausts retries, `PaymentWebhookProcessingFailed` is dispatched (provider key, payload, exception).

After a webhook is processed, `Banulakwin\Payment\Services\PaymentWebhookService` dispatches **one** Laravel event based on `PaymentStatus`:

| Status | Event class | Constructor argument |
|--------|-------------|-------------------------|
| `pending` | `PaymentPending` | `WebhookResponse $webhookData` |
| `authorized` | `PaymentAuthorized` | same |
| `captured` | `PaymentCaptured` | same |
| `voided` | `PaymentVoided` | same |
| `refunded` | `PaymentRefunded` | same |
| `failed` | `PaymentFailed` | same |

Register listeners in your app (e.g. mark order paid on `PaymentCaptured`, alert on `PaymentFailed`). Each event exposes `public WebhookResponse $webhookData` (property promotion).

If `referenceId` is empty, a **warning** is logged; if the status has no mapped event (should not happen for known statuses), processing is skipped with a warning.

---

## HTTP routes and queued webhooks

The package registers:

| Method | URI | Name | Middleware note |
|--------|-----|------|-----------------|
| `POST` | `/payment/{provider}/callback` | `payment.callback` | CSRF **disabled** for this route |

`{provider}` must match the **driver key** in `config('payment.providers')` (e.g. `onepay`, `paypal`).

**Flow:**

1. `CallbackController` calls `verifyWebhookSignature` on the provider (PayPal: REST signature verify when `webhook_id` is set; OnePay: confirms via `POST /v3/transaction/status/`).
2. On success, it builds a `WebhookPayload` and dispatches `ProcessPaymentWebhookJob` (implements `ShouldQueue`, configurable queue/tries/backoff).
3. The job calls `PaymentWebhookService::processQueuedWebhook($providerKey, $payload)`, which resolves the provider, runs `handleWebhook`, then `processWebhook` (status events).

**Response to the gateway:** JSON `{"received": true}` on success; `400` with `{"error":"Webhook verification failed"}` when verification fails. Processing is asynchronous after acceptance.

**Listener idempotency:** Use `referenceId` + status and a unique DB constraint so duplicate callbacks do not double-fulfil orders.

**Note:** PayPal’s **browser return** (user redirected back after approving payment) is **not** handled by this route—you implement GET routes in your app and call `handleWebhook` + `processWebhook` synchronously (see PayPal section).

---

## Provider: OnePay (`onepay`)

### Features

- Creates a checkout link via OnePay REST: `POST /v3/checkout/link/`.
- Redirect URL sent as `transaction_redirect_url` (from `CreatePaymentRequest::successUrl` or `config('payment.onepay.callback_url')`).
- **SHA-256 hash** over `app_id + currency + amount + hash_salt` for request integrity.
- **Get transaction** via `POST /v3/transaction/status/`.
- **Webhook** expects POST body fields used by OnePay callbacks: `status` (success when `1`), `transaction_id` (your reference).

### Configuration (`config/payment.php` → `onepay`)

| Key | Env | Notes |
|-----|-----|--------|
| `app_id` | `ONEPAY_APP_ID` | Merchant app id. |
| `app_token` | `ONEPAY_APP_TOKEN` | Bearer token for API calls. |
| `hash_salt` | `ONEPAY_HASH_SALT` | Hash salt for checkout link. |
| `callback_url` | `ONEPAY_CALLBACK_URL` | Default redirect if `successUrl` is omitted on `CreatePaymentRequest`. |
| `callback_token` | `ONEPAY_CALLBACK_TOKEN` | Reserved for app use; this package does not read it (verification uses the status API). |
| `base_url` | `ONEPAY_BASE_URL` | Default `https://api.onepay.lk`. |

### Driver and webhook URL

- Set `PAYMENT_DRIVER=onepay` (or use `payment()->driver('onepay')`).
- Point OnePay’s server callback to:  
  `POST https://your-app.test/payment/onepay/callback`  
  (route name: `payment.callback` with `provider=onepay`).

### Create payment (example)

```php
$response = payment()->driver('onepay')->initiatePayment(
    new \Banulakwin\Payment\DTOs\CreatePaymentRequest(
        amount: 1500.00,
        reference: 'ORDER-42',
        currency: 'LKR',
        customerEmail: 'buyer@example.com',
        successUrl: route('checkout.return', absolute: true), // optional; falls back to ONEPAY_CALLBACK_URL
        customerFirstName: 'Jane',
        customerLastName: 'Doe',
        customerPhone: '+94771234567',
        additionalData: 'Ticket booking',
    ),
);

return redirect()->away($response->redirectUrl);
```

### Callback payload (OnePay)

Example JSON from OnePay:

```json
{
  "transaction_id": "WQBV118E584C83CBA50C6",
  "status": 1,
  "status_message": "SUCCESS",
  "additional_data": ""
}
```

### Webhook verification and handling

OnePay does not use signed webhooks. This package:

1. **`verifyWebhookSignature`** — calls `/v3/transaction/status/` with `transaction_id` from the callback. Success callbacks (`status === 1`) require the API to report paid; failure callbacks require the API to report not paid.
2. **`handleWebhook`** — re-fetches status from the same API and sets `PaymentStatus` from the API (not the callback body alone). Callback fields are merged into `WebhookResponse::data` (`status_message`, `verified_via: status_api`, etc.).

Use callback `transaction_id` as `onepay_transaction_id` for the status API. Confirm against your OnePay docs if your integration uses a separate merchant reference vs IPG id.

### Errors

Failures throw `Banulakwin\Payment\Exceptions\PaymentException` with a readable message (HTTP errors, missing redirect fields, connection errors).

---

## Provider: PayPal (`paypal`)

### Features

- **Orders API v2** with intent **`CAPTURE`** (capture after buyer approval).
- **`purchase_unit.custom_id`** is set to your `CreatePaymentRequest::reference` (used to identify the order after capture).
- **`successUrl` / `cancelUrl` are required** — must be **absolute URLs** to **your** application routes (checkout / order flow). The package does not register PayPal return/cancel routes.
- After the buyer returns from PayPal, your app calls **`captureOrder`** indirectly via `handleWebhook` (see callbacks helper below).
- **`getTransaction`** uses `GET /v2/checkout/orders/{id}` and maps PayPal `status` to `PaymentStatus`.

### Configuration (`config/payment.php` → `paypal`)

Set `PAYPAL_ENVIRONMENT` to `sandbox` (default) or `live`. Credentials are read from the matching block:

| Config path | Env (sandbox example) | Notes |
|-------------|------------------------|--------|
| `paypal.environment` | `PAYPAL_ENVIRONMENT` | `sandbox` or `live`. |
| `paypal.sandbox.client_id` | `PAYPAL_SANDBOX_CLIENT_ID` | REST client id. |
| `paypal.sandbox.client_secret` | `PAYPAL_SANDBOX_CLIENT_SECRET` | REST secret. |
| `paypal.sandbox.api_url` | `PAYPAL_SANDBOX_API_URL` | Optional override. |
| `paypal.sandbox.payee_email` | `PAYPAL_SANDBOX_PAYEE_EMAIL` | Payee email when required. |
| `paypal.sandbox.payee_merchant_id` | `PAYPAL_SANDBOX_PAYEE_MERCHANT_ID` | Payee merchant id when required. |
| `paypal.sandbox.return_url` | `PAYPAL_SANDBOX_RETURN_URL` | Default return URL fallback. |
| `paypal.sandbox.cancel_url` | `PAYPAL_SANDBOX_CANCEL_URL` | Default cancel URL fallback. |
| `paypal.sandbox.webhook_id` | `PAYPAL_SANDBOX_WEBHOOK_ID` | Enables webhook signature verification. |
| `paypal.live.*` | `PAYPAL_LIVE_*` | Same keys for production. |

`CreatePaymentRequest::successUrl` and `cancelUrl` override return/cancel URLs per checkout when set.

### SDK

Uses `paypal/paypal-server-sdk` (`PaypalServerSdkClientBuilder`, `OrdersController`: `createOrder`, `getOrder`, `captureOrder`).

### Driver

- Set `PAYMENT_DRIVER=paypal` or `payment()->driver('paypal')`.

### Create payment (example)

You **must** pass both URLs:

```php
$response = payment()->driver('paypal')->initiatePayment(
    new \Banulakwin\Payment\DTOs\CreatePaymentRequest(
        amount: 19.99,
        reference: 'ORDER-42',
        currency: 'USD',
        customerEmail: 'buyer@example.com',
        successUrl: route('checkout.paypal.return', absolute: true),
        cancelUrl: route('checkout.paypal.cancel', absolute: true),
        additionalData: 'Blu-ray Cinema tickets',
    ),
);

return redirect()->away($response->redirectUrl);
```

#### Optional: item + shipping details (PayPal)

If you want PayPal’s checkout to populate `purchase_units[].items` and `purchase_units[].shipping`, pass `items` and `shipping` in `CreatePaymentRequest`.

Notes:
- Onepay driver ignores `items` and `shipping`.
- When `shipping` includes a valid recipient name + address, the PayPal driver uses `shipping_preference = SET_PROVIDED_ADDRESS` and sends **only** `purchase_units[].shipping.name` + `purchase_units[].shipping.address` (it does **not** send `shipping.options` to PayPal; that combination is invalid with `SET_PROVIDED_ADDRESS`).
- The merchant shipping fee is taken from the sum of `PaymentShipping::$options[*].amount` and sent as `purchase_units[].amount.breakdown.shipping` (with `item_total` / optional `discount` so `amount.value` matches your `CreatePaymentRequest::amount`).

- Example:

```php
$response = payment()->driver('paypal')->initiatePayment(
    new \Banulakwin\Payment\DTOs\CreatePaymentRequest(
        amount: 19.99,
        reference: 'ORDER-42',
        currency: 'USD',
        customerEmail: 'buyer@example.com',
        successUrl: route('checkout.paypal.return', absolute: true),
        cancelUrl: route('checkout.paypal.cancel', absolute: true),
        additionalData: 'Blu-ray Cinema tickets',
        items: [
            new \Banulakwin\Payment\DTOs\PaymentItem(
                name: 'Example Movie Bluray Disk',
                quantity: 1,
                unitAmount: new \Banulakwin\Payment\DTOs\Money(
                    currency: 'USD',
                    value: 19.99,
                ),
                description: 'Bluray Disk with Box Complete Set',
                sku: 'item-123',
                category: 'PHYSICAL_GOODS',
                imageUrl: null, // optional
            ),
        ],
        shipping: new \Banulakwin\Payment\DTOs\PaymentShipping(
            recipientFullName: 'John Doe',
            options: [
                new \Banulakwin\Payment\DTOs\PaymentShippingOption(
                    id: '1',
                    label: 'Standard Shipping',
                    selected: true,
                    type: 'SHIPPING',
                    amount: new \Banulakwin\Payment\DTOs\Money(
                        currency: 'USD',
                        value: 0.00,
                    ),
                ),
            ],
            address: new \Banulakwin\Payment\DTOs\PaymentAddress(
                addressLine1: '123 Main St',
                addressLine2: null,
                city: 'Colombo',
                state: 'Western',
                postalCode: '10000',
                countryCode: 'LK',
            ),
        ),
    ),
);
```

- `providerTransactionId` on the response is the **PayPal order id** (use for support / `getTransaction`).
- `redirectUrl` is the **approve** link from HATEOAS (`rel: approve`).

### Browser return and cancel (your routes)

PayPal redirects the buyer’s browser to:

- **Return:** your `successUrl` with query params `token` (order id) and `PayerID`.
- **Cancel:** your `cancelUrl` (you should include enough context in the URL to know which checkout to cancel, e.g. signed order id or UUID).

Use **`PaypalPaymentCallbacks`** to build a `WebhookPayload` without hand-rolling internal keys:

```php
use Banulakwin\Payment\Providers\Paypal\PaypalPaymentCallbacks;
use Banulakwin\Payment\Services\PaymentWebhookService;

// Return URL action — captures the order server-side
$payload = PaypalPaymentCallbacks::approvedReturn($request);
$webhook = payment()->driver('paypal')->provider()->handleWebhook($payload);
app(PaymentWebhookService::class)->processWebhook($webhook);

// Cancel URL action — same reference as CreatePaymentRequest::reference
$payload = PaypalPaymentCallbacks::userCancelledCheckout($reference, $request);
$webhook = payment()->driver('paypal')->provider()->handleWebhook($payload);
app(PaymentWebhookService::class)->processWebhook($webhook);
```

**Why synchronous `processWebhook` here?** So capture completes before you redirect or render a “thank you” page. The package `POST /payment/paypal/callback` path still **queues** jobs; PayPal’s hosted redirect flow is expected to hit **your** GET routes instead.

### `handleWebhook` behaviour (PayPal)

- Payload must include `_paypal_flow`:
  - **`return`** — reads `token` (PayPal order id), calls **capture**; on success → `Captured` with `referenceId` from `custom_id`; on API failure → `Failed` with `reason: capture_failed` (and resolves `reference` via `getOrder` when possible).
  - **`cancel`** — reads `reference` → `Failed` with `data.reason = cancelled` (user abandoned PayPal checkout).
- Any other shape throws `PaymentException` (“Unsupported PayPal callback payload”).

**Listener hint:** distinguish user cancel from a hard failure using `$event->webhookData->data['reason'] ?? null` (`cancelled` vs `capture_failed`).

### PayPal order status → `PaymentStatus` (`getTransaction`)

| PayPal `status` | Mapped status |
|-----------------|---------------|
| `COMPLETED` | `captured` |
| `APPROVED` | `authorized` |
| `VOIDED` | `voided` |
| `CREATED`, `PAYER_ACTION_REQUIRED`, `SAVED` | `pending` |
| (other) | `failed` |

### Errors

`PaymentException` for missing credentials, missing success/cancel URLs, invalid API responses, etc. PayPal SDK `ErrorException` is wrapped or logged where appropriate.

---

## Provider: Stripe (`stripe`)

Matches the flow used in apps like **Stripe Checkout Sessions** (create session → redirect → webhooks update payment state).

### Features

- **Checkout Session** (`mode: payment`) with redirect URL.
- **`client_reference_id`** and `metadata.reference` set from `CreatePaymentRequest::reference`.
- **Line items** from `CreatePaymentRequest::items` (`PaymentItem[]`), or a single line for `amount`.
- **Shipping** via `PaymentShipping` (selected option) or `metadata.shipping_amount` / `metadata.shipping_label`.
- **Tax** optional via `metadata.tax_amount` / `metadata.tax_label` (extra line item).
- **`metadata.stripe_customer_id`** — existing Stripe customer (guests use `customerEmail`).
- **`metadata.stripe_allowed_countries`** — array of ISO country codes for `shipping_address_collection`.
- **Webhooks** verified with `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET` (same as Laravel `Webhook::constructEvent`).
- **`getTransaction`** retrieves the Checkout Session and maps `status` / `payment_status`.
- **`refundPayment`** — pass `payment_intent_id` in `refundData` (included on completed session webhooks).

### Configuration (`config/payment.php` → `stripe`)

| Config key | Env | Notes |
|------------|-----|--------|
| `secret` | `STRIPE_SECRET` | Secret API key (`sk_...`). |
| `publishable_key` | `STRIPE_KEY` | Publishable key for frontend (optional in package). |
| `currency` | `STRIPE_CURRENCY` | Default `usd` (session uses `CreatePaymentRequest::currency`). |
| `webhook_secret` | `STRIPE_WEBHOOK_SECRET` | Endpoint signing secret (`whsec_...`). |

### Webhook route

Point Stripe to the package callback (or forward the raw body and headers):

`POST https://your-app.test/payment/stripe/callback`

Handled event types:

| Stripe event | `PaymentStatus` | Notes |
|--------------|-----------------|--------|
| `checkout.session.completed` | `captured` | Paid checkout |
| `checkout.session.expired` | `failed` | `data.reason = expired` |
| `checkout.session.async_payment_failed` | `failed` | Async payment methods |
| `payment_intent.payment_failed` | `failed` | Uses `metadata.reference` when present |
| `payment_intent.succeeded` | `captured` | |
| (other) | — | Ignored (`_skip_dispatch`) |

Your app listeners should update orders/payments (same pattern as a custom `StripeWebhookController`).

### Create payment (example)

```php
$response = payment()->driver('stripe')->initiatePayment(
    new \Banulakwin\Payment\DTOs\CreatePaymentRequest(
        amount: 99.99,
        reference: (string) $order->id,
        currency: 'usd',
        customerEmail: $order->email,
        successUrl: route('checkout.success', absolute: true),
        cancelUrl: route('checkout.cancel', absolute: true),
        items: [
            new \Banulakwin\Payment\DTOs\PaymentItem(
                name: 'Product name',
                quantity: 1,
                unitAmount: new \Banulakwin\Payment\DTOs\Money(currency: 'usd', value: 99.99),
            ),
        ],
        metadata: [
            'stripe_customer_id' => $user?->stripe_customer_id,
            'payment_id' => (string) $payment->id,
            'order_id' => (string) $order->id,
            'shipping_amount' => 12.50,
            'shipping_label' => 'Standard shipping',
            'tax_amount' => 8.25,
            'tax_label' => 'Tax (8.25%)',
        ],
    ),
);

$payment->update(['gateway_checkout_session_id' => $response->providerTransactionId]);

return redirect()->away($response->redirectUrl);
```

### Complex carts (e.g. multi-line + discount allocation)

The package accepts pre-built `PaymentItem[]` totals. Apps that allocate discounted line amounts (like a full cart service) should build `items` in the application layer and pass the final per-line `unitAmount` values into `CreatePaymentRequest` — the package does not load `Order` models.

### Refund example

```php
payment()->driver('stripe')->refund(
    captureId: 'pi_xxx',
    refundData: ['payment_intent_id' => 'pi_xxx'],
);
```

---

## Exceptions

- **`Banulakwin\Payment\Exceptions\PaymentException`** — configuration, validation, and provider-level failures during `createPaymentRequest` / `getTransaction` / unsupported webhook payloads (PayPal).

---

## Package layout (reference)

```
config/payment.php
src/
  Contracts/PaymentProviderInterface.php
  DTOs/
  Enums/PaymentProvider.php, PaymentStatus.php
  Events/
  Exceptions/PaymentException.php
  Http/Controllers/CallbackController.php
  Jobs/ProcessPaymentWebhookJob.php
  Managers/PaymentManager.php
  Providers/Onepay/OnepayPaymentProvider.php
  Providers/Paypal/PaypalPaymentProvider.php
  Providers/Paypal/PaypalPaymentCallbacks.php
  Providers/Stripe/StripePaymentProvider.php
  PaymentServiceProvider (registers callback route)
  Services/PaymentWebhookService.php
  PaymentServiceProvider.php
  helpers.php
```

---

## Adding another provider

1. Implement `PaymentProviderInterface` (stub `addTracking` / `refundPayment` with `[]` if unsupported).
2. Register the class in `config/payment.providers` under a new driver key.
3. Add a config array and env vars as needed; read them inside the provider via `config('payment.your_driver.*')`.
4. Map gateway callbacks to `WebhookResponse` with a `PaymentStatus` and your app’s `referenceId`.
5. If the gateway POSTs to your app, reuse `POST /payment/{provider}/callback` with `{provider}` equal to that key, or call `PaymentWebhookService::processWebhook` from your own controller.

Example registration:

```php
// config/payment.php
'providers' => [
    'onepay' => \Banulakwin\Payment\Providers\Onepay\OnepayPaymentProvider::class,
    'paypal' => \Banulakwin\Payment\Providers\Paypal\PaypalPaymentProvider::class,
    'stripe' => \App\Payments\StripePaymentProvider::class,
],
```

---

## Migrating from an app-coupled payment package

If you previously used a package that updated Eloquent `Payment` / `Order` models inside the library and dispatched `PaymentWebhookSucceeded` / `PaymentWebhookFailed`, this package is **portable**: it only dispatches status events. Move persistence into your listeners:

| Old event / behaviour | New approach |
|----------------------|--------------|
| `PaymentWebhookSucceeded` | Listen to `PaymentCaptured` (or `PaymentAuthorized` if you capture later) |
| `PaymentWebhookFailed` | Listen to `PaymentFailed` |
| DB update inside package webhook service | `PaymentCaptured` listener: load model by `referenceId`, update status in a transaction |
| `WebhookResponse::$event` (`payment_success`) | Use `WebhookResponse::$status` (`PaymentStatus::Captured`) |

Example listener:

```php
use Banulakwin\Payment\Events\PaymentCaptured;

Event::listen(PaymentCaptured::class, function (PaymentCaptured $event): void {
    $payment = Payment::query()
        ->where('provider_transaction_id', $event->webhookData->referenceId)
        ->first();

    if ($payment === null) {
        return;
    }

    $payment->update(['status' => 'paid']);
});
```

Adjust lookup fields to match your gateway (`referenceId` is OnePay `transaction_id`; PayPal often uses `custom_id` from `CreatePaymentRequest::reference`).

---

## Development

```bash
composer install
composer quality   # Pint + PHPStan + PHPUnit
```

---

## Licence

MIT — see [LICENSE](LICENSE).
