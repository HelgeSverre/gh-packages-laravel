# PayFast Core

[![Tests](https://github.com/mb-development/payfast-core/actions/workflows/tests.yml/badge.svg)](https://github.com/mb-development/payfast-core/actions)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/mb-development/payfast-core.svg)](https://packagist.org/packages/mb-development/payfast-core)
[![Total Downloads](https://img.shields.io/packagist/dt/mb-development/payfast-core.svg)](https://packagist.org/packages/mb-development/payfast-core)
[![License](https://img.shields.io/packagist/l/mb-development/payfast-core.svg)](LICENSE.md)
[![PHP](https://img.shields.io/packagist/php-v/mb-development/payfast-core.svg)](composer.json)

A first-class Laravel package for integrating the [PayFast](https://www.payfast.co.za) payment gateway. Handles once-off payments, recurring subscriptions, ITN (Instant Transaction Notification) verification, transaction logging, and webhook security — so you can focus on your application logic instead of boilerplate.

Developed and maintained by **[MB Development Pty Ltd](https://mbdevelopment.co.za)**.

---

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Once-Off Payments](#once-off-payments)
- [Handling ITN Callbacks](#handling-itn-callbacks)
- [The PayfastPaymentEvent](#the-payfastpaymentevent)
- [Transaction Logging](#transaction-logging)
- [Recurring Subscriptions](#recurring-subscriptions)
- [Webhook Middleware](#webhook-middleware)
- [Facade Reference](#facade-reference)
- [Events Reference](#events-reference)
- [Testing](#testing)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Requirements

| Requirement | Version          |
| ----------- | ---------------- |
| PHP         | `^8.1` and newer |
| Laravel     | `10.x` and newer |

---

## Installation

Install the package via Composer:

```bash
composer require mb-development/payfast-core
```

The service provider and `Payfast` facade are registered automatically via Laravel's package discovery. No manual registration is required.

---

## Configuration

### 1. Publish the config file

```bash
php artisan vendor:publish --tag=payfast-config
```

This creates `config/payfast.php` in your application.

### 2. Add your credentials to `.env`

```env
# Your PayFast merchant credentials
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a

# Optional — only required if you set a passphrase in your PayFast account
PAYFAST_PASSPHRASE=your_passphrase_here

# Set to false when going live
PAYFAST_SANDBOX=true

# URLs PayFast will redirect to or POST to after payment
PAYFAST_RETURN_URL=https://yourapp.com/payment/return
PAYFAST_CANCEL_URL=https://yourapp.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourapp.com/payfast/notify

# Validates that ITN requests come from known PayFast IPs — recommended in production
PAYFAST_VALIDATE_IP=true
```

### 3. Run migrations

```bash
php artisan vendor:publish --tag=payfast-migrations
php artisan migrate
```

This creates two tables: `payfast_transactions` and `payfast_subscriptions`.

---

## Once-Off Payments

### Redirect the user to PayFast (GET)

The simplest integration — build a signed URL and redirect:

```php
use MbDevelopment\PayfastCore\Facades\Payfast;

public function checkout(Request $request)
{
    $url = Payfast::buildPaymentUrl([
        'amount'        => '349.99',
        'item_name'     => 'Order #1042',
        'custom_str1'   => (string) $order->id,   // passed back in the ITN
        'name_first'    => $request->user()->first_name,
        'email_address' => $request->user()->email,
    ]);

    return redirect($url);
}
```

### POST form submission

For a seamless checkout experience, render a self-submitting form:

```php
use MbDevelopment\PayfastCore\Facades\Payfast;
use MbDevelopment\PayfastCore\Services\PayfastService;

public function checkout()
{
    $paymentData = Payfast::generatePaymentData([
        'amount'      => '349.99',
        'item_name'   => 'Order #1042',
        'custom_str1' => (string) $order->id,
    ]);

    $endpoint = app(PayfastService::class)->getPaymentEndpoint();

    return view('checkout', compact('paymentData', 'endpoint'));
}
```

```blade
{{-- resources/views/checkout.blade.php --}}
@include('payfast::payment-form', [
    'paymentData' => $paymentData,
    'endpoint'    => $endpoint,
    'buttonText'  => 'Pay R349.99',
    'autoSubmit'  => false,   // set true to skip the button and auto-redirect
])
```

### Using the `HasPayfastPayments` trait

Add the trait to any Eloquent model to generate payment URLs directly from the model:

```php
use MbDevelopment\PayfastCore\Traits\HasPayfastPayments;

class Order extends Model
{
    use HasPayfastPayments;

    public function getPayfastPaymentData(): array
    {
        return [
            'amount'      => $this->total,
            'item_name'   => "Order #{$this->id}",
            'custom_str1' => (string) $this->id,
        ];
    }
}

// In a controller:
return redirect($order->getPayfastPaymentUrl());
```

### Dependency injection

You can also resolve `PayfastInterface` directly from the container:

```php
use MbDevelopment\PayfastCore\Contracts\PayfastInterface;

class CheckoutController extends Controller
{
    public function __construct(protected PayfastInterface $payfast) {}

    public function pay(Request $request)
    {
        $url = $this->payfast->buildPaymentUrl([
            'amount'    => $request->amount,
            'item_name' => $request->item,
        ]);

        return redirect($url);
    }
}
```

---

## Handling ITN Callbacks

PayFast posts payment notifications to your `notify_url`. This package registers the route **automatically** — you do not need to add it yourself:

```
POST /payfast/notify
```

> **Important:** You must exclude this route from CSRF protection. Add it to the `$except` array in `app/Http/Middleware/VerifyCsrfToken.php`:
>
> ```php
> protected $except = [
>     'payfast/notify',
> ];
> ```

The built-in handler validates the ITN signature, optionally checks the source IP, persists the transaction to the database, and fires events for you to listen to.

---

## The PayfastPaymentEvent

`PayfastPaymentEvent` is the **single event you need to listen to** in order to react to any PayFast payment — once-off or subscription, successful or failed. It is fired on every valid ITN after the transaction has been persisted.

### Register your listener

Publish the ready-made stub listener:

```bash
php artisan vendor:publish --tag=payfast-stubs
```

This copies `HandlePayfastPayment.php` into `app/Listeners/`. Then register it in your `EventServiceProvider`:

```php
use MbDevelopment\PayfastCore\Events\PayfastPaymentEvent;
use App\Listeners\HandlePayfastPayment;

protected $listen = [
    PayfastPaymentEvent::class => [
        HandlePayfastPayment::class,
    ],
];
```

### Writing your listener

```php
use MbDevelopment\PayfastCore\Events\PayfastPaymentEvent;

class HandlePayfastPayment
{
    public function handle(PayfastPaymentEvent $event): void
    {
        // Activate an order after a successful once-off payment
        if ($event->isOnceOff() && $event->isComplete()) {
            $orderId = $event->customStr(1); // value you passed in custom_str1
            Order::find($orderId)?->markPaid();
        }

        // Grant access after a successful subscription payment
        if ($event->isSubscription() && $event->isComplete()) {
            $userId = $event->customStr(1);
            User::find($userId)?->grantSubscriptionAccess();
        }

        // Notify the customer when a payment fails
        if ($event->isFailed()) {
            Notification::route('mail', $event->buyerEmail())
                ->notify(new PaymentFailedNotification($event->transaction));
        }
    }
}
```

### PayfastPaymentEvent API reference

| Member                        | Type                        | Description                                                                |
| ----------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| `$event->paymentType`         | `string`                    | `'once_off'` or `'subscription'`                                           |
| `$event->paymentStatus`       | `string`                    | `'COMPLETE'`, `'FAILED'`, `'PENDING'`, `'CANCELLED'`                       |
| `$event->transaction`         | `PayfastTransaction`        | The persisted transaction record (always present)                          |
| `$event->subscription`        | `PayfastSubscription\|null` | Subscription record (subscriptions only, else `null`)                      |
| `$event->payload`             | `array`                     | The full raw ITN payload from PayFast                                      |
| `$event->isOnceOff()`         | `bool`                      | `true` for standard once-off payments                                      |
| `$event->isSubscription()`    | `bool`                      | `true` for recurring subscription payments                                 |
| `$event->isComplete()`        | `bool`                      | `true` when PayFast confirms payment success                               |
| `$event->isFailed()`          | `bool`                      | `true` when the payment failed                                             |
| `$event->isPending()`         | `bool`                      | `true` when the payment is still pending                                   |
| `$event->isCancelled()`       | `bool`                      | `true` when the payment was cancelled                                      |
| `$event->amountGross()`       | `float`                     | Gross amount before PayFast fees                                           |
| `$event->amountNet()`         | `float`                     | Net amount after PayFast fees                                              |
| `$event->pfPaymentId()`       | `string\|null`              | The PayFast payment ID (`pf_payment_id`)                                   |
| `$event->subscriptionToken()` | `string\|null`              | Subscription token (subscriptions only)                                    |
| `$event->customStr(int $n)`   | `string\|null`              | Value of `custom_str1`, `custom_str2`, or `custom_str3`                    |
| `$event->customInt(int $n)`   | `int\|null`                 | Value of `custom_int1` or `custom_int2`                                    |
| `$event->buyerFirstName()`    | `string\|null`              | Buyer's first name                                                         |
| `$event->buyerLastName()`     | `string\|null`              | Buyer's last name                                                          |
| `$event->buyerEmail()`        | `string\|null`              | Buyer's email address                                                      |
| `$event->itemName()`          | `string\|null`              | The `item_name` from the payment                                           |
| `$event->summary()`           | `string`                    | Human-readable log string e.g. `COMPLETE once_off — R349.99 — Order #1042` |

---

## Transaction Logging

Every valid ITN is automatically persisted to the `payfast_transactions` table via the `PayfastTransaction` model. No extra setup is needed.

```php
use MbDevelopment\PayfastCore\Models\PayfastTransaction;

// All completed transactions
PayfastTransaction::complete()->get();

// All failed transactions
PayfastTransaction::failed()->get();

// Find transactions for a specific order (stored in custom_str1)
PayfastTransaction::forReference($order->id)->get();

// Find transactions by buyer email
PayfastTransaction::forEmail('jane@example.com')->get();

// Status helpers on a single record
$tx = PayfastTransaction::find(1);

$tx->isComplete();   // bool
$tx->isFailed();     // bool
$tx->isPending();    // bool
$tx->raw_payload;    // array — the full ITN payload as received
```

---

## Recurring Subscriptions

### Creating a subscription payment

```php
use MbDevelopment\PayfastCore\Services\SubscriptionService;
use MbDevelopment\PayfastCore\Models\PayfastSubscription;

$service = app(SubscriptionService::class);

$paymentData = $service->generateSubscriptionPaymentData([
    'amount'      => 299.00,
    'item_name'   => 'Pro Plan — Monthly',
    'frequency'   => PayfastSubscription::FREQUENCY_MONTHLY,
    'cycles'      => 0,             // 0 = indefinite, or set a fixed number
    'custom_str1' => (string) $user->id,
]);

// Pass $paymentData and $endpoint to your Blade checkout view
```

### Frequency options

| Constant               | Value | Billing interval |
| ---------------------- | ----- | ---------------- |
| `FREQUENCY_MONTHLY`    | `3`   | Every month      |
| `FREQUENCY_QUARTERLY`  | `4`   | Every 3 months   |
| `FREQUENCY_BIANNUALLY` | `5`   | Every 6 months   |
| `FREQUENCY_ANNUALLY`   | `6`   | Every year       |

### Trial subscriptions

To offer a free or discounted first billing:

```php
$paymentData = $service->generateTrialSubscriptionPaymentData([
    'amount'    => 299.00,
    'item_name' => 'Pro Plan',
], trialAmount: 0.00); // first billing is free
```

### Using the `HasPayfastSubscriptions` trait

Add the trait to your `User` model (or any subscribable model):

```php
use MbDevelopment\PayfastCore\Traits\HasPayfastSubscriptions;

class User extends Authenticatable
{
    use HasPayfastSubscriptions;

    // Override to provide default subscription parameters for this model
    public function getPayfastSubscriptionDefaults(): array
    {
        return [
            'custom_str1' => (string) $this->id,
        ];
    }
}
```

Then in your controllers:

```php
// Redirect the user to PayFast to start their subscription
return redirect($user->newPayfastSubscriptionUrl([
    'amount'    => 299.00,
    'item_name' => 'Pro Plan',
    'frequency' => PayfastSubscription::FREQUENCY_MONTHLY,
]));

// Check subscription status
$user->subscribedToPayfast();         // bool — has an active subscription
$user->activePayfastSubscription();   // PayfastSubscription|null
$user->onPayfastTrial();              // bool — currently within trial period
$user->payfastSubscriptions();        // Eloquent relation — all subscriptions

// Cancel the active subscription via the PayFast API
$user->cancelPayfastSubscription();
```

### Managing subscriptions via the API

```php
$service = app(\MbDevelopment\PayfastCore\Services\SubscriptionService::class);

$service->fetchSubscription($token);      // fetch current status from PayFast
$service->pause($token);                  // pause billing
$service->unpause($token);               // resume billing
$service->cancel($token);                // cancel permanently
$service->updateAmount($token, 349.00);  // change the billing amount
```

### Subscription model helpers

```php
$subscription = PayfastSubscription::forToken($token)->firstOrFail();

$subscription->isActive();       // bool
$subscription->isPaused();       // bool
$subscription->isCancelled();    // bool
$subscription->onTrial();        // bool

$subscription->cancel();         // marks cancelled, sets cancelled_at timestamp
$subscription->pause();          // sets status to 'paused'
$subscription->resume();         // sets status back to 'active'

$subscription->frequencyLabel(); // 'Monthly', 'Quarterly', 'Bi-Annually', 'Annually'
$subscription->cycles_complete;  // int — number of billing cycles completed
$subscription->transactions;     // HasMany — related PayfastTransaction records
```

### Subscription events

| Event                          | When it fires                            | Payload                                     |
| ------------------------------ | ---------------------------------------- | ------------------------------------------- |
| `PayfastSubscriptionCreated`   | First successful billing for a new token | `$subscription`, `$payload`                 |
| `PayfastSubscriptionRenewed`   | A recurring billing cycle completes      | `$subscription`, `$transaction`, `$payload` |
| `PayfastSubscriptionCancelled` | `cancel()` is called on a subscription   | `$subscription`, `$payload`                 |

```php
use MbDevelopment\PayfastCore\Events\PayfastSubscriptionCreated;
use MbDevelopment\PayfastCore\Events\PayfastSubscriptionRenewed;
use MbDevelopment\PayfastCore\Events\PayfastSubscriptionCancelled;

// EventServiceProvider
protected $listen = [
    PayfastSubscriptionCreated::class   => [ActivateSubscription::class],
    PayfastSubscriptionRenewed::class   => [ExtendSubscription::class],
    PayfastSubscriptionCancelled::class => [NotifySubscriptionCancelled::class],
];
```

---

## Webhook Middleware

The `VerifyPayfastWebhook` middleware is registered automatically as the `payfast.webhook` alias. It independently verifies the MD5 signature and (optionally) the source IP address on any route you apply it to.

```php
// routes/api.php
Route::post('/my-payfast-endpoint', [MyController::class, 'handle'])
    ->middleware('payfast.webhook');
```

On a failed signature check it returns `400`. On an unrecognised source IP it returns `403`. Both cases report the exception to your application's exception handler.

> The built-in `POST /payfast/notify` route already handles ITN validation internally. Apply `payfast.webhook` to **additional custom routes** that need to accept signed PayFast requests.

---

## Facade Reference

```php
use MbDevelopment\PayfastCore\Facades\Payfast;

// Build a signed redirect URL for a GET-based checkout
Payfast::buildPaymentUrl(array $params): string;

// Generate the full payment data array (for a POST form submission)
Payfast::generatePaymentData(array $params): array;

// Generate an MD5 signature for an arbitrary data array
Payfast::generateSignature(array $data, ?string $passPhrase = null): string;

// Validate an ITN payload — throws PayfastException or InvalidSignatureException on failure
Payfast::validateItn(array $data): bool;
```

---

## Events Reference

| Event                          | Fired when                                      | Key data                                               |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------ |
| `PayfastItnReceived`           | Every valid ITN, before any processing          | `array $payload`                                       |
| `PayfastPaymentEvent`          | Every valid ITN, after transaction is persisted | `$transaction`, `$subscription`, type & status helpers |
| `PayfastPaymentComplete`       | ITN with `payment_status = COMPLETE`            | `array $payload`                                       |
| `PayfastPaymentFailed`         | ITN with any status other than `COMPLETE`       | `array $payload`                                       |
| `PayfastSubscriptionCreated`   | First billing for a new subscription token      | `$subscription`, `array $payload`                      |
| `PayfastSubscriptionRenewed`   | Recurring billing cycle completes               | `$subscription`, `$transaction`, `array $payload`      |
| `PayfastSubscriptionCancelled` | `cancel()` called on a subscription             | `$subscription`, `array $payload`                      |

> **Recommendation:** Use `PayfastPaymentEvent` for all your core application logic. The granular events (`PayfastPaymentComplete`, `PayfastSubscriptionCreated`, etc.) are available for targeted use-cases and third-party integrations.

---

## Testing

Run the test suite:

```bash
composer test
```

Run with code coverage (requires Xdebug or PCOV):

```bash
composer test-coverage
```

Format code with Laravel Pint:

```bash
composer format
```

The package ships with both unit and feature tests covering signature generation, ITN validation, transaction logging, subscription lifecycle management, the webhook middleware, and `PayfastPaymentEvent`.

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

Please ensure all tests pass and code is formatted with Pint before submitting a PR.

---

## Security

If you discover a security vulnerability, please **do not** open a public issue. Email us directly at [dev@mbdevelopment.co.za](mailto:dev@mbdevelopment.co.za) and we will address it promptly.

---

<p align="center">Built with ❤️ by <a href="https://mbdevelopment.co.za">MB Development Pty Ltd</a></p>
#
