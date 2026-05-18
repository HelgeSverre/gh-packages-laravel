# Payment Made Easy

A comprehensive Laravel package for integrating multiple payment gateways with support for one-time payments, subscriptions/plans, disbursements/transfers, virtual accounts, and payment links — all behind a consistent interface.

## Supported Gateways

| Gateway         | One-Time | Subscriptions | Disbursements | Virtual Accounts | Payment Links |
| --------------- | :------: | :-----------: | :-----------: | :--------------: | :-----------: |
| **Paystack**    |    ✅     |       ✅       |       ✅       |        ✅         |       ✅       |
| **Flutterwave** |    ✅     |       ✅       |       ✅       |        ✅         |       ✅       |
| **Stripe**      |    ✅     |       ✅       |       —       |        —         |       ✅       |
| **Seerbit**     |    ✅     |       ✅       |       —       |        ✅         |       —       |
| **Monnify**     |    ✅     |     ⚠️ n/a     |       ✅       |        ✅         |       —       |
| **Squad**       |    ✅     |       —       |       ✅       |        ✅         |       —       |
| **Remita**      |    ✅     |       —       |       ✅       |        —         |       —       |
| **Budpay**      |    ✅     |       —       |       ✅       |        ✅         |       —       |
| **Interswitch** |    ✅     |       —       |       —       |        —         |       —       |
| **PayPal**      |    ✅     |       ✅       |       ✅       |        —         |       ✅       |
| **M-Pesa**      |    ✅     |       —       |       —       |        —         |       —       |
| **MTN MoMo**    |    ✅     |       —       |       ✅       |        —         |       —       |
| **Razorpay**    |    ✅     |       ✅       |       ✅       |        —         |       ✅       |
| **Paddle**      |    ✅     |       ✅       |       —       |        —         |       ✅       |

> ⚠️ Monnify implements `SubscriptionDriverInterface` for interface compatibility, but all subscription methods throw `SubscriptionException` — Monnify has no subscription API.

> Capability detection is done via `instanceof` — drivers only implement the interfaces they support. No breaking changes when new capabilities are added.

For **runtime checks** without resolving the driver from the container, use `NexusPay\PaymentMadeEasy\GatewayCapabilities`:

```php
use NexusPay\PaymentMadeEasy\GatewayCapabilities;
use NexusPay\PaymentMadeEasy\Contracts\SubscriptionDriverInterface;

if (GatewayCapabilities::driverImplements('paystack', SubscriptionDriverInterface::class)) {
    // safe to call subscription APIs
}

$slugs = GatewayCapabilities::gatewaysImplementing(SubscriptionDriverInterface::class);
```

---

## Installation

### 1. Install via Composer

```bash
composer require nexuspay/payment-made-easy
```

**PHP:** enable the **`bcmath`** extension (`ext-bcmath`); it is required by Composer for consistent amount conversion in drivers.

**Stripe:** the SDK is not installed with the package by default. If you use **`Payment::driver('stripe')`** or Stripe webhooks, add:

```bash
composer require stripe/stripe-php:^17.4
```

Without it, resolving the Stripe driver or handling Stripe webhooks throws a clear error pointing to this command.

**Outbound gateway HTTP:** drivers use Laravel’s **`Http`** facade (`illuminate/http`). Per-gateway **`http_timeout`** and **`http_verify`** in config apply to each request. For app-wide defaults (proxy, extra headers, timeouts), see the [Laravel HTTP client](https://laravel.com/docs/http-client) documentation — **`Http::globalOptions()`** is available from **Laravel 10.42** onward; on **Laravel 8–10.41** rely on those config keys or extend drivers as needed.

**Framework versions:** this package supports **Laravel 8.83+** through **Laravel 13** on **PHP 8.1+** (Laravel 13 requires **PHP 8.3+**). Match `illuminate/*` versions to your `laravel/framework` release.

### 2. Publish Configuration

```bash
php artisan vendor:publish --provider="NexusPay\PaymentMadeEasy\PaymentServiceProvider"
```

### 3. (Optional) Publish & Run Migrations

The package ships with migrations for recording payment activity to your database. This is opt-in:

```bash
# Publish migrations
php artisan vendor:publish --tag=payment-gateways-migrations

# Run migrations
php artisan migrate
```

Then enable recording in your `.env`:

```env
PAYMENT_RECORDING_ENABLED=true
PAYMENT_RECORD_WEBHOOKS=true
# Optional: persist transactions / transfers / subscriptions from first-class webhook events
PAYMENT_RECORDING_AUTO_WEBHOOK_EVENTS=false
```

### 4. Verify Your Setup

After adding credentials to your `.env`, run the following to confirm all gateways are configured correctly:

```bash
php artisan payment:gateways --configured
```

Gateways with missing credentials will be highlighted in yellow.

```env
# Default gateway & currency
PAYMENT_GATEWAY=paystack
PAYMENT_CURRENCY=NGN

# Paystack
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_CALLBACK_URL=https://yoursite.com/payment/callback
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
FLUTTERWAVE_CALLBACK_URL=https://yoursite.com/payment/callback
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CALLBACK_URL=https://yoursite.com/payment/callback

# Seerbit
SEERBIT_PUBLIC_KEY=your_seerbit_public_key
SEERBIT_SECRET_KEY=your_seerbit_secret_key
SEERBIT_BASE_URL=https://seerbitapi.com/api/v2
SEERBIT_CALLBACK_URL=https://yoursite.com/payment/callback
SEERBIT_WEBHOOK_SECRET=your_seerbit_webhook_secret

# Monnify
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
MONNIFY_WALLET_ACCOUNT_NUMBER=your_monnify_wallet_account
MONNIFY_CALLBACK_URL=https://yoursite.com/payment/callback
MONNIFY_WEBHOOK_SECRET=your_monnify_webhook_secret

# Squad (GTCo)
SQUAD_SECRET_KEY=your_squad_secret_key
SQUAD_PUBLIC_KEY=your_squad_public_key
SQUAD_BENEFICIARY_ACCOUNT=your_squad_beneficiary_account
SQUAD_CALLBACK_URL=https://yoursite.com/payment/callback
SQUAD_WEBHOOK_SECRET=your_squad_webhook_secret

# Remita
REMITA_API_KEY=your_remita_api_key
REMITA_MERCHANT_ID=your_remita_merchant_id
REMITA_SERVICE_TYPE_ID=your_remita_service_type_id
REMITA_SOURCE_ACCOUNT=your_remita_source_account
REMITA_CALLBACK_URL=https://yoursite.com/payment/callback

# Budpay
BUDPAY_SECRET_KEY=your_budpay_secret_key
BUDPAY_PUBLIC_KEY=your_budpay_public_key
BUDPAY_CALLBACK_URL=https://yoursite.com/payment/callback
BUDPAY_WEBHOOK_SECRET=your_budpay_webhook_secret

# Interswitch
INTERSWITCH_CLIENT_ID=your_interswitch_client_id
INTERSWITCH_CLIENT_SECRET=your_interswitch_client_secret
INTERSWITCH_MERCHANT_CODE=your_interswitch_merchant_code
INTERSWITCH_PAYABLE_CODE=your_interswitch_payable_code
INTERSWITCH_TERMINAL_ID=your_interswitch_terminal_id
INTERSWITCH_CALLBACK_URL=https://yoursite.com/payment/callback
INTERSWITCH_WEBHOOK_SECRET=your_interswitch_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_CURRENCY=USD
PAYPAL_BASE_URL=https://api.paypal.com
PAYPAL_CALLBACK_URL=https://yoursite.com/payment/callback
PAYPAL_CANCEL_URL=https://yoursite.com/payment/cancel

# M-Pesa (Safaricom)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_INITIATOR_NAME=your_mpesa_initiator
MPESA_SECURITY_CREDENTIAL=your_mpesa_security_credential
MPESA_CALLBACK_URL=https://yoursite.com/webhooks/payment-gateways/mpesa
MPESA_RESULT_URL=https://yoursite.com/webhooks/payment-gateways/mpesa
MPESA_TIMEOUT_URL=https://yoursite.com/webhooks/payment-gateways/mpesa

# MTN MoMo
MTNMOMO_COLLECTION_USER_ID=your_mtnmomo_collection_user_id
MTNMOMO_COLLECTION_API_KEY=your_mtnmomo_collection_api_key
MTNMOMO_COLLECTION_SUBSCRIPTION_KEY=your_mtnmomo_collection_subscription_key
MTNMOMO_DISBURSEMENT_USER_ID=your_mtnmomo_disbursement_user_id
MTNMOMO_DISBURSEMENT_API_KEY=your_mtnmomo_disbursement_api_key
MTNMOMO_DISBURSEMENT_SUBSCRIPTION_KEY=your_mtnmomo_disbursement_subscription_key
MTNMOMO_ENVIRONMENT=sandbox
MTNMOMO_CURRENCY=EUR
MTNMOMO_CALLBACK_URL=https://yoursite.com/webhooks/payment-gateways/mtnmomo

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_ACCOUNT_NUMBER=your_razorpay_x_account_number
RAZORPAY_CURRENCY=INR
RAZORPAY_CALLBACK_URL=https://yoursite.com/payment/callback
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Paddle
PADDLE_API_KEY=your_paddle_api_key
PADDLE_CLIENT_TOKEN=your_paddle_client_token
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
PADDLE_CURRENCY=USD
PADDLE_BASE_URL=https://api.paddle.com
PADDLE_CALLBACK_URL=https://yoursite.com/payment/callback

# Webhook settings
PAYMENT_WEBHOOKS_ENABLED=true
PAYMENT_WEBHOOK_VERIFY_SIGNATURE=true
# When true with verify on, HMAC gateways must have webhook_secret (or Monnify secret_key / Interswitch client_secret) set
PAYMENT_WEBHOOK_REQUIRE_SIGNING_SECRET=true
PAYMENT_WEBHOOK_LOG_EVENTS=true
PAYMENT_WEBHOOK_QUEUE_EVENTS=false
# full = log payload data; minimal = gateway + event type only (less PII in logs)
PAYMENT_WEBHOOK_LOG_DETAIL=full
# When true with log_detail=full, sensitive keys are redacted before logging (see WebhookLogSanitizerInterface)
PAYMENT_WEBHOOK_LOG_SANITIZE=true
# Optional: FQCN of a custom WebhookLogSanitizerInterface implementation
# PAYMENT_WEBHOOK_LOG_SANITIZER=
# Extra webhook keys to redact (merged with package defaults; suffix rules apply — see config)
# PAYMENT_WEBHOOK_LOG_REDACT_KEYS=
PAYMENT_WEBHOOK_IDEMPOTENCY_ENABLED=false
PAYMENT_WEBHOOK_IDEMPOTENCY_TTL=86400
# Optional abuse protection (see Webhooks section for middleware)
PAYMENT_WEBHOOK_THROTTLE_ENABLED=false
PAYMENT_WEBHOOK_THROTTLE_MAX_ATTEMPTS=60
PAYMENT_WEBHOOK_THROTTLE_DECAY_SECONDS=60
# Optional: force stack traces on unexpected webhook errors (HTTP 500). Omit to tie to APP_DEBUG (traces off in production).
# PAYMENT_WEBHOOK_LOG_UNEXPECTED_TRACE=
```

---

## One-Time Payments

Use the **default** gateway (`PAYMENT_GATEWAY` / config) or call `driver(...)` explicitly. Amounts are in **major** currency units unless a gateway note says otherwise.

```php
use NexusPay\PaymentMadeEasy\Facades\Payment;

// Default driver (same payload shape as your configured gateway)
$response = Payment::initializePayment([
    'email'        => 'customer@example.com',
    'amount'       => 5000.00,
    'reference'    => 'ORDER_123',
    'callback_url' => 'https://yoursite.com/payment/callback',
    'metadata'     => ['order_id' => '123', 'customer_id' => '456'],
]);

// Other drivers — same general flow; see Gateway-Specific Notes for redirects and quirks
Payment::driver('flutterwave')->initializePayment([
    'email'    => 'customer@example.com',
    'amount'   => 5000.00,
    'name'     => 'John Doe',
    'phone'    => '+2348123456789',
    'currency' => 'NGN',
]);

Payment::driver('stripe')->initializePayment([
    'email'    => 'customer@example.com',
    'amount'   => 50.00,
    'currency' => 'usd',
]);

Payment::driver('seerbit')->initializePayment([
    'email'    => 'customer@example.com',
    'amount'   => 5000.00,
    'currency' => 'NGN',
    'name'     => 'John Doe',
    'phone'    => '+2348123456789',
]);

// Paystack — hosted checkout
$response = Payment::driver('paystack')->initializePayment([
    'email'        => 'customer@example.com',
    'amount'       => 5000.00,
    'reference'    => 'ORDER_123',
    'callback_url' => 'https://yoursite.com/payment/callback',
    'metadata'     => ['order_id' => '123'],
]);

// Redirect customer to $response['data']['authorization_url']

// Verify after callback
$verification = Payment::driver('paystack')->verifyPayment('ORDER_123');

// Payment details by reference
$payment = Payment::driver('paystack')->getPayment('ORDER_123');

// Refund
$refund = Payment::driver('paystack')->refundPayment('ORDER_123', 2500.00); // partial
$full   = Payment::driver('paystack')->refundPayment('ORDER_123');           // full

// List transactions
$txns = Payment::driver('paystack')->getTransactions(['per_page' => 50, 'page' => 1]);
```

---

## Subscriptions & Plans

> Available on: **Paystack**, **Flutterwave**, **Stripe**, **Seerbit**

```php
use NexusPay\PaymentMadeEasy\Contracts\SubscriptionDriverInterface;

$driver = Payment::driver('paystack');

// --- Plans ---
$plan = $driver->createPlan([
    'name'     => 'Pro Monthly',
    'amount'   => 5000.00,
    'interval' => 'monthly',   // monthly | weekly | annually | quarterly
]);
$planCode = $plan['data']['plan_code'];

$driver->updatePlan($planCode, ['name' => 'Pro Monthly (Updated)']);
$driver->getPlan($planCode);
$driver->listPlans(['per_page' => 20]);
$driver->deletePlan($planCode);

// --- Subscriptions ---
$sub = $driver->createSubscription([
    'email'      => 'customer@example.com',
    'plan_code'  => $planCode,
    'start_date' => '2026-06-01T00:00:00.000Z', // optional
]);
$subCode = $sub['data']['subscription_code'];

$driver->getSubscription($subCode);
$driver->listSubscriptions(['plan' => $planCode]);
$driver->listCustomerSubscriptions('customer@example.com');
$driver->pauseSubscription($subCode);
$driver->resumeSubscription($subCode);
$driver->cancelSubscription($subCode);
```

### Stripe plans and subscriptions

Stripe maps plans to **Product + Price**. `createPlan()` returns a **Price ID** in `plan_code` — pass that to `createSubscription()`. Supported interval values: `day`, `week`, `month`, `year`.

```php
$stripePlan = Payment::driver('stripe')->createPlan([
    'name'     => 'Pro Monthly',
    'amount'   => 29.99,
    'currency' => 'usd',
    'interval' => 'month',
]);
$priceId = $stripePlan['data']['plan_code'];

Payment::driver('stripe')->createSubscription([
    'email'     => 'customer@example.com',
    'plan_code' => $priceId,
]);
```

---

## Disbursements & Transfers

> Available on: **Paystack**, **Flutterwave**, **Monnify**, **Squad**, **Remita**, **Budpay**, **PayPal**, **Razorpay**, **MTN MoMo**. Paystack and Flutterwave use **transfer recipients**; Monnify, Squad, Remita, and Budpay typically use **bank account** fields. PayPal, Razorpay X, and MTN use different payloads — see **Gateway-Specific Notes**.

```php
// Resolve an account number before transferring
$account = Payment::driver('paystack')->resolveAccountNumber([
    'account_number' => '0123456789',
    'bank_code'      => '044',
]);

// Create recipient
$recipient = Payment::driver('paystack')->createTransferRecipient([
    'name'           => 'Jane Doe',
    'account_number' => '0123456789',
    'bank_code'      => '044',
    'currency'       => 'NGN',
]);
$recipientCode = $recipient['data']['recipient_code'];

// Single transfer
$transfer = Payment::driver('paystack')->transfer([
    'amount'    => 10000.00,
    'recipient' => $recipientCode,
    'reason'    => 'Salary payout',
    'reference' => 'PAYOUT_001',
]);

// Bulk transfer
Payment::driver('paystack')->bulkTransfer([
    'transfers' => [
        ['amount' => 5000.00, 'recipient' => 'RCP_abc', 'reference' => 'B1'],
        ['amount' => 3000.00, 'recipient' => 'RCP_def', 'reference' => 'B2'],
    ],
]);

// Verify & list
Payment::driver('paystack')->verifyTransfer('PAYOUT_001');
Payment::driver('paystack')->listTransfers(['per_page' => 50]);

// List banks
$banks = Payment::driver('paystack')->listBanks(['country' => 'nigeria']);
```

### Bank-account style transfers (Monnify, Squad, Remita, Budpay)

```php
Payment::driver('monnify')->resolveAccountNumber([
    'account_number' => '0123456789',
    'bank_code'      => '044',
]);

Payment::driver('monnify')->transfer([
    'amount'                => 10000.00,
    'account_number'        => '0123456789',
    'bank_code'             => '044',
    'narration'             => 'Salary payout',
    'reference'             => 'MNFY_PAYOUT_001',
    'wallet_account_number' => config('payment-gateways.gateways.monnify.wallet_account_number'),
]);

Payment::driver('squad')->transfer([
    'account_number' => '0123456789',
    'bank_code'      => '044',
    'amount'         => 5000.00,
    'currency'       => 'NGN',
    'reference'      => 'SQ_PAYOUT_001',
    'narration'      => 'Salary',
]);

Payment::driver('remita')->bulkTransfer([
    'batchRef'  => 'BATCH_001',
    'narration' => 'Payroll',
    'transfers' => [
        ['amount' => 5000.00, 'account_number' => '0123456789', 'bank_code' => '044', 'name' => 'Jane Doe'],
    ],
]);

Payment::driver('budpay')->transfer([
    'amount'         => 5000.00,
    'currency'       => 'NGN',
    'account_number' => '0123456789',
    'bank_code'      => '044',
    'narration'      => 'Payout',
    'reference'      => 'BDP_PAYOUT_001',
]);
```

---

## Virtual Accounts

> Available on: **Paystack**, **Flutterwave**, **Seerbit**, **Monnify**, **Squad**, **Budpay**

```php
// Create a dedicated virtual account (bank transfer → auto-credited)
$va = Payment::driver('paystack')->createVirtualAccount([
    'email'          => 'customer@example.com',
    'name'           => 'Jane Doe',
    'bvn'            => '12345678901',
    'preferred_bank' => 'wema-bank',  // or 'titan-paystack'
]);

$accountNumber = $va['data']['account_number'];
$bankName      = $va['data']['bank']['name'];

Payment::driver('paystack')->getVirtualAccount($va['data']['id']);
Payment::driver('paystack')->listVirtualAccounts(['active' => true]);
Payment::driver('paystack')->deactivateVirtualAccount($va['data']['id']);
```

---

## Payment Links

> Available on: **Paystack**, **Flutterwave**, **Stripe**, **Seerbit**

```php
$link = Payment::driver('paystack')->createPaymentLink([
    'name'        => 'Product Launch Special',
    'amount'      => 2500.00,
    'description' => 'Early-bird ticket',
    'currency'    => 'NGN',
]);

$url = $link['data']['link'];

Payment::driver('paystack')->updatePaymentLink($link['data']['id'], ['amount' => 3000.00]);
Payment::driver('paystack')->getPaymentLink($link['data']['id']);
Payment::driver('paystack')->listPaymentLinks();
Payment::driver('paystack')->disablePaymentLink($link['data']['id']);
```

---

## Webhooks

Webhook routes are registered automatically:

```
POST /webhooks/payment-gateways/{gateway}
```

**Queueing:** Set `PAYMENT_WEBHOOK_QUEUE_EVENTS=true` to return `202` immediately and process the payload on the queue. The raw body is preserved so signature verification still works in the worker.

**Idempotency:** Set `PAYMENT_WEBHOOK_IDEMPOTENCY_ENABLED=true` to ignore duplicate deliveries with the same body (cache key per gateway + payload hash). Failed processing releases the lock so the provider can retry.

**Signing secrets:** With `PAYMENT_WEBHOOK_VERIFY_SIGNATURE` and `PAYMENT_WEBHOOK_REQUIRE_SIGNING_SECRET` both true (defaults), gateways that use HMAC (or Stripe’s signing secret) return **400** if the secret is missing, so you never verify with an empty key. **M-Pesa**, **MTN MoMo**, **Remita**, and **PayPal** skip this check (no shared HMAC secret in the same sense).

**Unexpected errors:** On HTTP **500** from the webhook controller, only the error message is logged by default; stack traces are included when **`APP_DEBUG`** is true. Set `PAYMENT_WEBHOOK_LOG_UNEXPECTED_TRACE=true` only if you explicitly want traces in logs (e.g. staging).

**Rate limiting:** Publish config and add the package middleware to `payment-gateways.webhooks.middleware`:

```php
// config/payment-gateways.php
'webhooks' => [
    // ...
    'throttle' => [
        'enabled' => env('PAYMENT_WEBHOOK_THROTTLE_ENABLED', false),
        // ...
    ],
    'middleware' => [
        \NexusPay\PaymentMadeEasy\Http\Middleware\ThrottlePaymentWebhooks::class,
    ],
],
```

`payment:webhook-replay` bypasses signature verification by design; keep it **console-only** in production.

Configure each gateway's dashboard to point to:

```
https://yoursite.com/webhooks/payment-gateways/paystack
https://yoursite.com/webhooks/payment-gateways/flutterwave
https://yoursite.com/webhooks/payment-gateways/stripe
https://yoursite.com/webhooks/payment-gateways/seerbit
https://yoursite.com/webhooks/payment-gateways/monnify
https://yoursite.com/webhooks/payment-gateways/squad
https://yoursite.com/webhooks/payment-gateways/remita
https://yoursite.com/webhooks/payment-gateways/budpay
https://yoursite.com/webhooks/payment-gateways/interswitch
https://yoursite.com/webhooks/payment-gateways/paypal
https://yoursite.com/webhooks/payment-gateways/mpesa
https://yoursite.com/webhooks/payment-gateways/mtnmomo
https://yoursite.com/webhooks/payment-gateways/razorpay
https://yoursite.com/webhooks/payment-gateways/paddle
```

### Available Events

| Event Class             | Fired When                           |
| ----------------------- | ------------------------------------ |
| `PaymentSuccessful`     | A payment completes successfully     |
| `PaymentFailed`         | A payment fails                      |
| `PaymentPending`        | A payment is pending                 |
| `RefundProcessed`       | A refund is processed                |
| `SubscriptionCreated`   | A subscription is activated          |
| `SubscriptionCancelled` | A subscription is cancelled          |
| `SubscriptionRenewed`   | A subscription renews / invoice paid |
| `TransferSuccessful`    | A transfer/payout succeeds           |
| `TransferFailed`        | A transfer/payout fails              |
| `DisputeCreated`        | A dispute is raised                  |
| `ChargebackCreated`     | A chargeback is raised               |

### Listening to Events

Register listeners in `app/Providers/EventServiceProvider.php` (or Laravel 11+ `AppServiceProvider` / `bootstrap/app.php` event discovery as you prefer):

```php
use NexusPay\PaymentMadeEasy\Events\PaymentSuccessful;
use NexusPay\PaymentMadeEasy\Events\PaymentFailed;
use NexusPay\PaymentMadeEasy\Events\PaymentPending;
use NexusPay\PaymentMadeEasy\Events\RefundProcessed;
use NexusPay\PaymentMadeEasy\Events\SubscriptionCreated;
use NexusPay\PaymentMadeEasy\Events\SubscriptionCancelled;
use NexusPay\PaymentMadeEasy\Events\SubscriptionRenewed;
use NexusPay\PaymentMadeEasy\Events\TransferSuccessful;
use NexusPay\PaymentMadeEasy\Events\TransferFailed;
use NexusPay\PaymentMadeEasy\Events\DisputeCreated;
use NexusPay\PaymentMadeEasy\Events\ChargebackCreated;

protected $listen = [
    PaymentSuccessful::class   => [App\Listeners\HandleSuccessfulPayment::class],
    PaymentFailed::class       => [App\Listeners\HandleFailedPayment::class],
    PaymentPending::class      => [App\Listeners\HandlePendingPayment::class],
    RefundProcessed::class     => [App\Listeners\HandleRefundProcessed::class],
    SubscriptionCreated::class   => [App\Listeners\HandleSubscriptionCreated::class],
    SubscriptionCancelled::class => [App\Listeners\HandleSubscriptionCancelled::class],
    SubscriptionRenewed::class   => [App\Listeners\HandleSubscriptionRenewed::class],
    TransferSuccessful::class    => [App\Listeners\HandleTransferSuccessful::class],
    TransferFailed::class        => [App\Listeners\HandleTransferFailed::class],
    DisputeCreated::class        => [App\Listeners\HandleDisputeCreated::class],
    ChargebackCreated::class     => [App\Listeners\HandleChargebackCreated::class],
];
```

```php
// app/Listeners/HandleSuccessfulPayment.php
class HandleSuccessfulPayment
{
    public function handle(PaymentSuccessful $event): void
    {
        $gateway   = $event->webhookEvent->getGateway();   // e.g. 'paystack'
        $eventType = $event->webhookEvent->getEventType(); // e.g. 'charge.success'
        $data      = $event->paymentData;

        // Normalized keys commonly include: reference, amount, currency, status,
        // customer_email, transaction_date, metadata

        // update order, send receipt, etc.
    }
}
```

Subscription and transfer listeners receive typed payloads: **`$event->subscriptionData`**, **`$event->invoiceData`** (renewals), **`$event->transferData`**, **`$event->reason`** (cancellations / failed transfers), **`$event->disputeData`**, **`$event->chargebackData`**.

### Manual processing with `WebhookManager`

For a custom route (e.g. non-standard path), resolve **`WebhookManager`** and pass the gateway slug plus the request. Catch **`WebhookException`** for invalid signatures or bad payloads.

```php
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use NexusPay\PaymentMadeEasy\WebhookManager;
use NexusPay\PaymentMadeEasy\Exceptions\WebhookException;

class CustomWebhookController extends Controller
{
    public function handle(Request $request, string $gateway, WebhookManager $webhookManager)
    {
        try {
            $webhookManager->handle($gateway, $request);

            return response()->json(['status' => 'success']);
        } catch (WebhookException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
```

Optional `.env` toggles (see the Installation env block for the full list):

```env
PAYMENT_WEBHOOKS_ENABLED=true
PAYMENT_WEBHOOK_VERIFY_SIGNATURE=true
PAYMENT_WEBHOOK_LOG_EVENTS=true
PAYMENT_WEBHOOK_QUEUE_EVENTS=false
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SEERBIT_WEBHOOK_SECRET=your_seerbit_webhook_secret
```

---

## Capability Detection

Check what a driver supports at runtime:

```php
use NexusPay\PaymentMadeEasy\Contracts\SubscriptionDriverInterface;
use NexusPay\PaymentMadeEasy\Contracts\DisbursementDriverInterface;
use NexusPay\PaymentMadeEasy\Contracts\VirtualAccountDriverInterface;
use NexusPay\PaymentMadeEasy\Contracts\PaymentLinkDriverInterface;

$driver = Payment::driver('paystack');

if ($driver instanceof SubscriptionDriverInterface) {
    $driver->createPlan([...]);
}

if ($driver instanceof DisbursementDriverInterface) {
    $driver->transfer([...]);
}

if ($driver instanceof VirtualAccountDriverInterface) {
    $driver->createVirtualAccount([...]);
}

if ($driver instanceof PaymentLinkDriverInterface) {
    $driver->createPaymentLink([...]);
}
```

> **Note:** Monnify implements `SubscriptionDriverInterface` but all methods throw `SubscriptionException`. Always wrap in try/catch or check before calling.

### Injecting `PaymentManager`

Use constructor injection when you need explicit gateway resolution or cleaner tests:

```php
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use NexusPay\PaymentMadeEasy\PaymentManager;
use NexusPay\PaymentMadeEasy\Contracts\SubscriptionDriverInterface;

class PaymentController extends Controller
{
    public function __construct(private PaymentManager $paymentManager) {}

    public function charge(Request $request)
    {
        $driver = $this->paymentManager->driver($request->gateway ?? 'paystack');

        return $driver->initializePayment([
            'email'     => $request->email,
            'amount'    => $request->amount,
            'reference' => $request->reference,
        ]);
    }

    public function createPlan(Request $request)
    {
        $driver = $this->paymentManager->driver($request->gateway ?? 'paystack');

        if (!$driver instanceof SubscriptionDriverInterface) {
            abort(422, 'Selected gateway does not support subscriptions.');
        }

        return $driver->createPlan($request->validated());
    }
}
```

---

## Gateway-Specific Notes

### Monnify

**Hosted checkout** — redirect the customer to **`checkoutUrl`** in the response:

```php
Payment::driver('monnify')->initializePayment([
    'email'       => 'customer@example.com',
    'amount'      => 5000.00,
    'currency'    => 'NGN',
    'name'        => 'John Doe',
    'description' => 'Order #123',
    'reference'   => 'ORDER_123',
]);
```

Monnify's primary use case is **virtual accounts** (reserved bank accounts). The package supports:

- Reserved account creation (`createVirtualAccount`) via POST `/api/v2/bank-transfer/reserved-accounts`
- Single and bulk disbursements
- Authentication is automatic — the driver fetches and caches a Bearer token via Basic Auth

```php
$va = Payment::driver('monnify')->createVirtualAccount([
    'email'             => 'customer@example.com',
    'name'              => 'Jane Doe',
    'bvn'               => '12345678901',
    'currency_code'     => 'NGN',
    'contract_code'     => config('payment-gateways.gateways.monnify.contract_code'),
    'reference'         => 'VA_' . uniqid(),
    'split_percentages' => [],
]);
```

### Squad (GTCo)

```php
Payment::driver('squad')->initializePayment([
    'email'     => 'customer@example.com',
    'amount'    => 5000.00,
    'currency'  => 'NGN',
    'reference' => 'TXN_' . uniqid(),
]);

// Virtual account
Payment::driver('squad')->createVirtualAccount([
    'customer_identifier' => 'customer_001',
    'email'               => 'customer@example.com',
    'name'                => 'Jane Doe',
]);
```

### Remita

Remita's payment flow uses a **Remita Retrieval Reference (RRR)**. `initializePayment()` returns an RRR that you use to construct the checkout URL. Pass the RRR as `$reference` to `verifyPayment()`.

```php
$result = Payment::driver('remita')->initializePayment([
    'email'       => 'customer@example.com',
    'amount'      => 5000.00,
    'description' => 'Invoice #1001',
    'reference'   => 'ORDER_1001',
]);

// Redirect to checkout: $result['data']['authorization_url']
// After callback, verify with RRR:
Payment::driver('remita')->verifyPayment($result['data']['rrr']);
```

### Budpay

Budpay uses a dual-header auth: Bearer token + `Encryption` header (HMAC-SHA512). This is handled internally; no extra configuration required.

```php
Payment::driver('budpay')->initializePayment([
    'email'     => 'customer@example.com',
    'amount'    => 5000.00,
    'reference' => 'BDP_' . uniqid(),
    'currency'  => 'NGN',
]);
```

### Interswitch (Webpay)

Interswitch uses **OAuth2 client_credentials** — the token is fetched and cached automatically. Amount is stored in kobo internally. Currency uses ISO 4217 numeric codes (e.g. `566` for NGN).

```php
Payment::driver('interswitch')->initializePayment([
    'email'     => 'customer@example.com',
    'amount'    => 5000.00,
    'reference' => 'ISW_' . uniqid(),
    'currency'  => 'NGN',
]);
```

### PayPal

PayPal uses **OAuth2 client_credentials** — the access token is fetched and cached automatically. Amounts are in major currency units (USD, EUR, etc.) as decimal strings. The driver covers payments, billing subscriptions, and Payouts (bulk disbursements).

```php
$order = Payment::driver('paypal')->initializePayment([
    'amount'   => 50.00,
    'currency' => 'USD',
    'email'    => 'customer@example.com',
]);
// Redirect to $order['links'][n]['href'] where rel == 'approve'
// After approval, capture using the order ID:
Payment::driver('paypal')->verifyPayment($order['id']);
```

PayPal webhooks use RSA-SHA256 certificate-based signing (not HMAC). The handler verifies that all required PayPal signature headers are present as a guard.

### M-Pesa (Safaricom Kenya)

M-Pesa uses **STK Push** — a prompt is sent to the customer's phone. Payment is **asynchronous**; the result is delivered to your `MPESA_CALLBACK_URL`.

```php
$response = Payment::driver('mpesa')->initializePayment([
    'phone'  => '254712345678',   // international format, no +
    'amount' => 500,              // KES whole number
]);
$checkoutRequestId = $response['data']['checkout_request_id'];

// Poll or wait for callback, then verify:
Payment::driver('mpesa')->verifyPayment($checkoutRequestId);
```

M-Pesa does not send HMAC signatures — secure your callback URLs via HTTPS.

### MTN MoMo

MTN MoMo uses two separate products (Collections and Disbursements), each with their own API User + Key + Subscription Key. Payments are also **asynchronous** — a push is sent to the customer's wallet, and the result is delivered to your `MTNMOMO_CALLBACK_URL`.

```php
$response = Payment::driver('mtnmomo')->initializePayment([
    'phone'    => '256771234567',   // MSISDN, no +
    'amount'   => 1000,
    'currency' => 'UGX',
]);
$referenceId = $response['data']['reference'];

// Poll for status:
Payment::driver('mtnmomo')->verifyPayment($referenceId);

// Disbursement:
Payment::driver('mtnmomo')->transfer([
    'phone'    => '256771234567',
    'amount'   => 1000,
    'currency' => 'UGX',
    'narration' => 'Salary payout',
]);
```

### Razorpay

Razorpay uses **Basic Auth** (key_id:key_secret) on every request. Amounts are in paise (1 INR = 100 paise), handled internally by `convertAmount()`. The driver supports payments, subscriptions, payouts (Razorpay X account required), and payment links.

```php
$order = Payment::driver('razorpay')->initializePayment([
    'email'    => 'customer@example.com',
    'amount'   => 499.00,
    'currency' => 'INR',
    'name'     => 'Jane Doe',
    'phone'    => '+919876543210',
]);
// Pass $order['id'], $order['data']['key_id'], etc. to Razorpay checkout.js
```

### Paddle

Paddle is a **Merchant of Record** for SaaS / digital goods. The driver targets the Paddle Billing API. Plans map to Prices, payments to Transactions, and payment links to Paddle's native Payment Links.

```php
$transaction = Payment::driver('paddle')->initializePayment([
    'amount'      => 29.99,
    'currency'    => 'USD',
    'description' => 'Pro plan',
    'email'       => 'customer@example.com',
]);
// Redirect to $transaction['data']['authorization_url']
```

Paddle webhooks use HMAC-SHA256 with the `Paddle-Signature: ts=...;h1=...` format, verified automatically.

---

## Security

Run **`composer audit`** regularly on consuming applications and keep gateway credentials in environment variables only (never commit secrets). Webhook replay (`payment:webhook-replay`) skips signature checks — restrict production use to trusted operators.

**Vulnerability disclosure:** do not use the public issue tracker for undisclosed security bugs. Follow **[SECURITY.md](SECURITY.md)** (private report and scope).

## Testing

Run the package's own test suite:

```bash
composer test          # all tests
composer test:unit     # unit tests only
composer test:feature  # feature tests only
```

The test suite covers:

| Test file                                   | What it tests                                            |
| ------------------------------------------- | -------------------------------------------------------- |
| `tests/Unit/PaymentManagerTest.php`         | driver resolution, interface detection, alias binding    |
| `tests/Unit/WebhookManagerTest.php`         | handler resolution, unknown gateway exception            |
| `tests/Unit/Drivers/PaystackDriverTest.php` | HTTP mock — initialize, verify, refund, error handling   |
| `tests/Unit/Drivers/RazorpayDriverTest.php` | HTTP mock — order creation, verify, refund, errors       |
| `tests/Feature/WebhookHandlingTest.php`     | full HTTP webhook flow — signature check, event dispatch |

In your own application, you can mock the `Payment` facade or bind a fake driver:

```php
// In your test
Payment::shouldReceive('driver->initializePayment')
    ->once()
    ->andReturn(['status' => true, 'data' => ['authorization_url' => 'https://...']]);
```

## Database Recording

When `PAYMENT_RECORDING_ENABLED=true`, use `PaymentRecorder` to persist activity:

```php
use NexusPay\PaymentMadeEasy\Services\PaymentRecorder;

$recorder = app(PaymentRecorder::class);

// After initializing a payment
$transaction = $recorder->recordTransaction('paystack', $requestData, $gatewayResponse);

// After verifying / receiving a webhook
$recorder->updateTransactionStatus('ORDER_001', 'successful', 'PS_GATEWAY_REF');

// Record a transfer
$transfer = $recorder->recordTransfer('paystack', $transferData, $transferResponse);

// Log a webhook event for auditing
$recorder->logWebhookEvent('paystack', $webhookEvent);

// Refunds (e.g. after a refund webhook) — appends `payment_refunds` rows and updates parent status
// (partially_refunded vs refunded from summed amounts). Optional 6th arg: provider refund id for dedupe.
$recorder->handleRefundWebhook('paystack', 'ORDER_001', 50.0, 'NGN', $rawPayload, 're_abc123');
```

With **`PAYMENT_RECORDING_AUTO_WEBHOOK_EVENTS=true`**, listeners also persist **`RefundProcessed`** (status `refunded` / `partially_refunded` + `payment_refunds` rows), **`DisputeCreated`** / **`ChargebackCreated`** (status `disputed` + **`payment_disputes`** rows), in addition to payment, transfer, and subscription outcomes.

### Available Models

| Model                 | Table                   | Purpose                             |
| --------------------- | ----------------------- | ----------------------------------- |
| `PaymentTransaction`  | `payment_transactions`  | One-time payment records            |
| `PaymentRefund`       | `payment_refunds`       | One row per refund (multi-refund history) |
| `PaymentDispute`      | `payment_disputes`      | Dispute / chargeback events (linked to transaction when present) |
| `PaymentSubscription` | `payment_subscriptions` | Subscription / billing records      |
| `PaymentTransfer`     | `payment_transfers`     | Disbursement / transfer records     |
| `PaymentWebhookLog`   | `payment_webhook_logs`  | Audit log for all incoming webhooks |

Use **`$transaction->refunds`** and **`$transaction->totalRefundedAmount()`** for reporting. Status **`partially_refunded`** is set when refunded sum is below the original amount; **`refunded`** when the sum covers the original (with a small float tolerance).

All models support polymorphic `payable` / `subscriber` / `initiator` relationships so you can link them to your own models (e.g. `User`, `Order`).

```php
// Attach a transaction to a user
$transaction->payable()->associate($user)->save();

// Scope helpers
PaymentTransaction::successful()->gateway('paystack')->get();
PaymentSubscription::active()->forEmail('user@example.com')->get();
PaymentTransfer::successful()->gateway('mtnmomo')->get();
```

---

## Artisan Commands

The package ships built-in Artisan commands for local development and debugging.

### `payment:gateways` — List all configured gateways

```bash
# List all 14 supported gateways with their capabilities
php artisan payment:gateways

# Show only gateways that have credentials configured
php artisan payment:gateways --configured
```

Output shows a capability matrix (Payments, Subscriptions, Disbursements, Virtual Accounts, Payment Links), marks the default gateway with `*`, and colour-codes each gateway as **ready** (green) or **missing env** (yellow) based on whether credentials are present in your `.env`.

---

### `payment:verify` — Verify a payment by reference

```bash
# Pretty-print the verification result
php artisan payment:verify paystack ORDER_123

# Dump the full raw API response as JSON
php artisan payment:verify paystack ORDER_123 --json
```

Useful for quickly checking a payment status from the command line without writing a temporary controller.

---

### `payment:webhook-replay` — Replay a logged webhook event

> Requires `PAYMENT_RECORDING_ENABLED=true` and migrations to have been run.

```bash
# Replay webhook log #42 — re-fires the stored event through the handler
php artisan payment:webhook-replay 42

# Dry-run — prints the stored payload without dispatching any events
php artisan payment:webhook-replay 42 --dry-run
```

Looks up the `PaymentWebhookLog` row by its primary key, reconstructs the original request, and routes it back through the appropriate webhook handler. The log's status is updated to `processed` on success or `failed` on error.

---

### `payment:transactions` — List recorded transactions

Requires the **`payment_transactions`** table (publish and run package migrations).

```bash
php artisan payment:transactions
php artisan payment:transactions --gateway=paystack --status=successful --limit=50
```

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for how to report issues, run tests, and submit pull requests.

## License

This package is released under the [MIT License](LICENSE).
