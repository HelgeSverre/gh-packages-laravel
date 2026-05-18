# paddle-billing

[![Packagist Version](https://img.shields.io/packagist/v/brunocfalcao/paddle-billing?style=flat-square)](https://packagist.org/packages/brunocfalcao/paddle-billing)
[![PHP](https://img.shields.io/badge/php-8.2%2B-8892BF?style=flat-square)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-12-FF2D20?style=flat-square)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-27ae60?style=flat-square)](LICENSE)

A batteries-included Paddle Billing integration for Laravel. One install command wires up credentials, webhook handling, structured database tables, Blade directives, and a typed event system — so you ship, not configure.

---

## What's in the box

- **`paddle-billing:install`** — interactive CLI that configures `.env`, publishes config & migrations, and optionally sets up Pushover
- **Auto webhook handling** — every Paddle event stored raw; `transaction.completed` triggers structured upserts and fires a typed `PurchaseCompleted` event your app listens to
- **`@paddleJs` / `@paddleInit`** — Blade directives for clean script loading and environment-aware SDK initialization
- **`paddle_price_id()` / `paddle_checkout_url()`** — helpers that always return the right value for the active environment
- **Multi-domain checkout URL override** — when multiple sites share one Paddle account, pass `checkout.url` per transaction so Paddle emails link to the correct domain
- **`PurchaseCompleted` event** — decoupled, typed event your app listens to for emails, access grants, or anything else
- **Pushover** — optional push notification on every completed payment

---

## Requirements

- PHP 8.2+
- Laravel 12
- [`laravel/cashier-paddle`](https://github.com/laravel/cashier-paddle) ^2.0

---

## Installation

```bash
composer require brunocfalcao/paddle-billing
```

Run the interactive installer:

```bash
php artisan paddle-billing:install
```

The installer walks you through:

| Step | What it configures |
|---|---|
| 1 | Sandbox toggle — live vs. test mode |
| 2 | Live credentials — Seller ID, API Key (`pdl_live_apikey_…`), Client-side Token (`live_…`), Webhook Secret, Price ID |
| 3 | Sandbox credentials — same set from [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com) |
| 4 | Checkout URL override — auto-set from `APP_URL` for multi-domain Paddle accounts |
| 5 | Paddle Retain key *(optional)* |
| 6 | Currency — defaults to `USD` |
| 7 | Pushover *(optional)* — App Key + User Key |
| 8 | Run migrations |

The installer is **idempotent** — existing `.env` values are pre-filled and updated in-place. Safe to re-run.

---

## Configuration

`config/paddle-billing.php` (published via `vendor:publish --tag=paddle-billing-config`):

```php
return [
    'sandbox' => env('PADDLE_SANDBOX', false),

    'live' => [
        'seller_id'         => env('PADDLE_SELLER_ID'),
        'client_side_token' => env('PADDLE_CLIENT_SIDE_TOKEN'),
        'api_key'           => env('PADDLE_API_KEY'),
        'webhook_secret'    => env('PADDLE_WEBHOOK_SECRET'),
        'price_id'          => env('PADDLE_PRICE_ID'),
        'checkout_url'      => env('PADDLE_CHECKOUT_URL'),
    ],

    'sandbox_credentials' => [
        'seller_id'         => env('PADDLE_SANDBOX_SELLER_ID'),
        'client_side_token' => env('PADDLE_SANDBOX_CLIENT_SIDE_TOKEN'),
        'api_key'           => env('PADDLE_SANDBOX_API_KEY'),
        'webhook_secret'    => env('PADDLE_SANDBOX_WEBHOOK_SECRET'),
        'price_id'          => env('PADDLE_SANDBOX_PRICE_ID'),
        'checkout_url'      => env('PADDLE_SANDBOX_CHECKOUT_URL'),
    ],

    'path'         => env('CASHIER_PATH', 'paddle'),
    'sandbox_path' => env('CASHIER_SANDBOX_PATH', 'paddle-sandbox'),

    'currency'        => env('CASHIER_CURRENCY', 'USD'),
    'currency_locale' => env('CASHIER_CURRENCY_LOCALE', 'en'),

    'retain_key' => env('PADDLE_RETAIN_KEY'),

    'pushover' => [
        'app_key'  => env('PUSHOVER_APP_KEY'),
        'user_key' => env('PUSHOVER_USER_KEY'),
    ],

    // Map Paddle event types to your app listener classes.
    // StorePaddleEvent always runs and is not listed here.
    'listeners' => [
        // 'transaction.paid' => \App\Listeners\HandlePayment::class,
    ],
];
```

---

## Blade directives

Place these before `</body>` in your checkout layout:

```blade
@paddleJs
@paddleInit
```

`@paddleJs` loads the Paddle.js v2 script (synchronously — available immediately for your init code).

`@paddleInit` sets the sandbox environment when enabled and calls `Paddle.Initialize()` with your client-side token. Both are driven by config — no manual environment checks needed.

---

## Checkout

Use `paddle_price_id()` to always get the correct price ID for the active environment:

```blade
<script>
function openCheckout(customData) {
    Paddle.Checkout.open({
        items: [{ priceId: '{{ paddle_price_id() }}', quantity: 1 }],
        customData: customData,
        eventCallback: function(data) {
            if (data.name === 'checkout.completed') {
                // post-payment UI feedback
            }
        },
    });
}
</script>
```

Any key/value in `customData` is stored in `purchase_metadata` after the webhook arrives.

---

## Webhook handling

`StorePaddleEvent` is automatically wired to Cashier's `WebhookReceived` event. No registration needed.

On every incoming webhook:

1. **Stores the raw payload** in `paddle_events`, deduped by `paddle_event_id`
2. On `transaction.completed` — upserts `customers` by `paddle_customer_id`, upserts `products` by `paddle_price_id`, creates a `purchases` record, stores each `custom_data` key/value in `purchase_metadata`
3. **Fires `PurchaseCompleted`** — your app handles the rest

For additional Paddle event types, register listeners in config:

```php
'listeners' => [
    'transaction.paid'    => \App\Listeners\HandlePayment::class,
    'subscription.paused' => \App\Listeners\HandlePause::class,
],
```

> **Important: Laravel auto-event-discovery caveat**
>
> Laravel 12 auto-discovers listeners by inspecting type-hinted `handle()` methods. If your listener accepts `WebhookReceived $event`, Laravel will register it as a **direct** listener — meaning it fires on **every** Paddle webhook, regardless of event type, bypassing the config-based routing above.
>
> To prevent this, always guard your listeners with an event type check:
>
> ```php
> public function handle(WebhookReceived $event): void
> {
>     if (($event->payload['event_type'] ?? '') !== 'transaction.paid') {
>         return;
>     }
>
>     // your logic here
> }
> ```
>
> Without this guard, a `transaction.updated` event (fired when the checkout page opens) will trigger your `transaction.paid` handler — causing premature payment processing.

---

## The `PurchaseCompleted` event

```php
Brunocfalcao\PaddleBilling\Events\PurchaseCompleted
```

| Property | Type | Description |
|---|---|---|
| `$purchase` | `Purchase` | The created purchase record |
| `$customer` | `Customer` | The upserted customer record |
| `$product` | `Product` | The upserted product record |
| `$customData` | `array` | Raw `custom_data` from the Paddle payload |

Register your listener in `AppServiceProvider::boot()`:

```php
use Brunocfalcao\PaddleBilling\Events\PurchaseCompleted;
use App\Listeners\SendPurchaseConfirmation;

Event::listen(PurchaseCompleted::class, SendPurchaseConfirmation::class);
```

Example listener:

```php
class SendPurchaseConfirmation
{
    public function handle(PurchaseCompleted $event): void
    {
        $githubUsername = $event->customData['github_username'] ?? null;

        Mail::to($event->customer->email)
            ->send(new PurchaseConfirmation($event->purchase, $githubUsername));
    }
}
```

Your mailable, your models, your logic — completely decoupled from the package.

---

## Database tables

The package publishes one migration: `paddle_events` (raw webhook store).

Your app provides the structured tables and model classes. The package resolves them via config — override in `config/paddle-billing.php` if your namespaces differ:

```php
'models' => [
    'customer' => \App\Models\Customer::class,
    'product'  => \App\Models\Product::class,
    'purchase' => \App\Models\Purchase::class,
],
```

Recommended schema:

```
customers        — paddle_customer_id (unique), email, name
products         — paddle_price_id (unique), name, description, price (cents), currency
purchases        — customer_id (FK), product_id (FK), paddle_transaction_id (unique), status, invoice_url
purchase_metadata — purchase_id (FK), key, value
```

---

## `HasPaddleCheckout` trait

Add to any billable model:

```php
use Brunocfalcao\PaddleBilling\Traits\HasPaddleCheckout;

class User extends Authenticatable
{
    use HasPaddleCheckout;
}
```

| Method | Description |
|---|---|
| `isSandbox(): bool` | Whether sandbox mode is active |
| `paddleCheckoutOptions(priceId, customData, returnUrl, discountId)` | Builds checkout options — server-side transaction when `checkout_url` is set, client-side otherwise. Pass `discountId` to auto-apply a Paddle discount. |

---

## Multi-domain checkout URL

When multiple sites share the same Paddle account, the default payment link domain may point to the wrong site. Set `checkout_url` in config to override:

```env
PADDLE_CHECKOUT_URL=https://yoursite.com
PADDLE_SANDBOX_CHECKOUT_URL=https://yoursite.com
```

When configured, `paddleCheckoutOptions()` creates the transaction server-side via the Paddle API with `checkout.url`, then returns a `transactionId` for `Paddle.Checkout.open()`. Paddle emails and receipts will link to your domain. When not configured, the original client-side flow is used (no behavior change).

The install command auto-sets both values from `APP_URL`.

---

## Pushover

Sends a push notification to your device on every completed payment. Configure via install or manually:

```env
PUSHOVER_APP_KEY=your-app-key
PUSHOVER_USER_KEY=your-user-key
```

---

## License

MIT — [Bruno Falcão](https://github.com/brunocfalcao)
