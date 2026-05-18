# Laravel PayFast

A modern, feature-complete Laravel package for [PayFast](https://www.payfast.co.za) payment gateway integration. Built with PHP 8.3+ and supports Laravel 11/12.

## Features

- **Redirect Payments** - Standard PayFast hosted payment page
- **Onsite Payments** - Embedded payment engine (no redirect)
- **ITN Webhooks** - Automatic signature & IP validation with Laravel events
- **Subscriptions** - Standard recurring and ad hoc (tokenization) billing
- **Refunds** - Full and partial refund processing
- **Transaction History** - Date range queries with pagination
- **Split Payments** - Automatic fund splitting between accounts
- **SPA Support** - JSON API endpoints with Vue 3 and React components
- **Blade Components** - Drop-in payment form components
- **Sandbox Support** - Toggle between test and production environments

## Requirements

- PHP 8.3+
- Laravel 11 or 12

## Installation

```bash
composer require tumelo/laravel-payfast
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=payfast-config
```

Add your PayFast credentials to `.env`:

```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_TESTING=true

PAYFAST_RETURN_URL=https://yourapp.com/payment/success
PAYFAST_CANCEL_URL=https://yourapp.com/payment/cancel
PAYFAST_NOTIFY_URL=https://yourapp.com/payfast/webhook
```

## Quick Start

### Simple Payment (Redirect)

```php
use Tumelo\PayFast\Facades\PayFast;
use Tumelo\PayFast\Data\PaymentData;
use Tumelo\PayFast\Data\CustomerData;

// In your controller
public function checkout()
{
    $formData = PayFast::buildFormData(new PaymentData(
        merchantPaymentId: 'ORDER-001',
        amount: 199.99,
        itemName: 'Premium Widget',
        customer: new CustomerData(
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
        ),
    ));

    return view('payment.redirect', [
        'formData' => $formData,
        'processUrl' => PayFast::getProcessUrl(),
    ]);
}
```

### Onsite Payment (Embedded)

```php
$result = PayFast::onsite(new PaymentData(
    merchantPaymentId: 'ORDER-002',
    amount: 99.99,
    itemName: 'Basic Widget',
));

// Returns: ['uuid' => '...', 'form_data' => [...], 'process_url' => '...']
```

### Blade Component

```blade
{{-- Redirect payment form --}}
<x-payfast::payment-form :data="$paymentData" />

{{-- With auto-submit (redirect immediately) --}}
<x-payfast::payment-form :data="$paymentData" :auto-submit="true" />

{{-- Custom submit button text --}}
<x-payfast::payment-form :data="$paymentData" submit-text="Complete Purchase" />

{{-- Onsite (embedded) payment --}}
<x-payfast::payment-form :data="$paymentData" :onsite="true" />
```

## Subscriptions

### Create a Subscription

```php
use Tumelo\PayFast\Data\SubscriptionData;
use Tumelo\PayFast\Enums\SubscriptionType;
use Tumelo\PayFast\Enums\BillingFrequency;

$formData = PayFast::buildSubscriptionFormData(new SubscriptionData(
    merchantPaymentId: 'SUB-001',
    amount: 49.99,
    itemName: 'Monthly Plan',
    subscriptionType: SubscriptionType::STANDARD,
    frequency: BillingFrequency::MONTHLY,
    cycles: 0, // indefinite
    customer: new CustomerData(
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
    ),
));
```

### Manage Subscriptions

```php
// Fetch subscription details
$details = PayFast::subscriptions()->fetch('subscription-token');

// Pause for 2 cycles
PayFast::subscriptions()->pause('subscription-token', 2);

// Resume
PayFast::subscriptions()->unpause('subscription-token');

// Cancel
PayFast::subscriptions()->cancel('subscription-token');

// Update
PayFast::subscriptions()->update('subscription-token', [
    'cycles' => 6,
    'amount' => 5999,
]);

// Ad hoc charge (tokenized billing)
PayFast::subscriptions()->adhocCharge(
    token: 'subscription-token',
    amount: 149.99,
    itemName: 'One-time upgrade',
);
```

## Refunds

```php
use Tumelo\PayFast\Data\RefundData;

$result = PayFast::refund(new RefundData(
    paymentId: 'pf_123456',
    amount: 50.00,
    reason: 'Customer request',
));

if ($result->isSuccessful()) {
    // Refund processed
}
```

## Transaction History

```php
// Fetch by date range
$transactions = PayFast::transactionHistory(
    from: now()->subMonth(),
    to: now(),
);

// Convenience methods
$today = PayFast::transactions()->daily(now());
$thisWeek = PayFast::transactions()->weekly(now());
$thisMonth = PayFast::transactions()->monthly(now());

// Fetch single transaction
$transaction = PayFast::fetchTransaction('pf_payment_id');
```

## Webhook Events

The package automatically handles ITN (Instant Transaction Notification) callbacks and dispatches Laravel events. Register listeners in your app:

```php
// In EventServiceProvider or using Event::listen
use Tumelo\PayFast\Events\PaymentCompleted;
use Tumelo\PayFast\Events\PaymentFailed;
use Tumelo\PayFast\Events\PaymentPending;
use Tumelo\PayFast\Events\SubscriptionCreated;
use Tumelo\PayFast\Events\SubscriptionCancelled;
use Tumelo\PayFast\Events\RefundProcessed;

Event::listen(PaymentCompleted::class, function (PaymentCompleted $event) {
    $event->merchantPaymentId;       // Your order ID
    $event->payFastPaymentId;        // PayFast's payment ID
    $event->transaction->amountGross; // Total amount
    $event->transaction->amountNet;   // After fees
    $event->transaction->customer;    // CustomerData object
    $event->raw;                      // Raw ITN array
});

Event::listen(SubscriptionCreated::class, function (SubscriptionCreated $event) {
    $event->token;      // Subscription token for future API calls
    $event->transaction; // TransactionResult
});
```

### Webhook Route

The ITN webhook endpoint is automatically registered at `/payfast/webhook` (configurable in `config/payfast.php`). It includes:

- **IP validation** - Ensures requests come from PayFast servers
- **Signature validation** - Verifies request integrity
- **Merchant ID validation** - Confirms the request is for your account

## SPA Integration (Vue 3 / React)

### Enable API Endpoints

In your `.env`:

```env
PAYFAST_SPA_ENABLED=true
```

### Publish Frontend Components

```bash
# Vue 3
php artisan vendor:publish --tag=payfast-vue

# React
php artisan vendor:publish --tag=payfast-react
```

### Vue 3 Usage

```vue
<template>
    <PayFastPayment
        :amount="199.99"
        item-name="Premium Widget"
        payment-id="ORDER-001"
        :customer="{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }"
        @success="handleSuccess"
        @cancelled="handleCancelled"
        @error="handleError"
    />
</template>

<script setup>
import { PayFastPayment } from './components/payfast/PayFastPayment.vue'

function handleSuccess(data) { /* ... */ }
function handleCancelled() { /* ... */ }
function handleError(error) { /* ... */ }
</script>
```

**Using the composable directly:**

```ts
import { usePayFast } from './components/payfast/usePayFast'

const { initiatePayment, loading, error, result, submitRedirectForm } = usePayFast()

async function pay() {
    const response = await initiatePayment({
        merchant_payment_id: 'ORDER-001',
        amount: 99.99,
        item_name: 'Widget',
    })

    if (response?.type === 'redirect') {
        submitRedirectForm(response.process_url, response.form_data)
    }
}
```

### React Usage

```tsx
import { PayFastPayment } from './components/payfast/PayFastPayment'

function CheckoutPage() {
    return (
        <PayFastPayment
            amount={199.99}
            itemName="Premium Widget"
            paymentId="ORDER-001"
            customer={{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }}
            onSuccess={(data) => console.log('Success:', data)}
            onCancelled={() => console.log('Cancelled')}
            onError={(error) => console.error(error)}
        />
    )
}
```

**Using the hook directly:**

```ts
import { usePayFast } from './components/payfast/usePayFast'

function CheckoutPage() {
    const { initiatePayment, loading, error, submitRedirectForm } = usePayFast()

    async function handleCheckout() {
        const response = await initiatePayment({
            merchant_payment_id: 'ORDER-001',
            amount: 99.99,
            item_name: 'Widget',
        })

        if (response?.type === 'redirect') {
            submitRedirectForm(response.process_url!, response.form_data!)
        }
    }

    return <button onClick={handleCheckout} disabled={loading}>Pay Now</button>
}
```

### API Endpoints

When SPA mode is enabled, these JSON endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payfast/initiate` | Create payment (redirect or onsite) |
| POST | `/api/payfast/subscription` | Create subscription |
| GET | `/api/payfast/transaction/{id}` | Fetch transaction status |
| POST | `/api/payfast/refund` | Process refund |
| GET | `/api/payfast/history` | Fetch transaction history |

## Custom Fields

Pass custom data through PayFast for retrieval in ITN callbacks:

```php
$payment = new PaymentData(
    merchantPaymentId: 'ORDER-001',
    amount: 100.00,
    itemName: 'Widget',
    customStrings: [
        'custom_str1' => 'order-reference',
        'custom_str2' => 'user-metadata',
    ],
    customIntegers: [
        'custom_int1' => 42,
    ],
);
```

Access them in your event listener:

```php
Event::listen(PaymentCompleted::class, function ($event) {
    $ref = $event->transaction->customStrings['custom_str1']; // 'order-reference'
    $meta = $event->transaction->customIntegers['custom_int1']; // 42
});
```

## Signature Generation

Generate and verify PayFast signatures:

```php
$signature = PayFast::generateSignature($data);
$isValid = PayFast::isValidSignature($data, $signature);
```

## Configuration

Full configuration options in `config/payfast.php`:

```php
return [
    'merchant_id'  => env('PAYFAST_MERCHANT_ID'),
    'merchant_key' => env('PAYFAST_MERCHANT_KEY'),
    'passphrase'   => env('PAYFAST_PASSPHRASE'),
    'testing'      => env('PAYFAST_TESTING', true),
    'return_url'   => env('PAYFAST_RETURN_URL'),
    'cancel_url'   => env('PAYFAST_CANCEL_URL'),
    'notify_url'   => env('PAYFAST_NOTIFY_URL'),

    'urls' => [
        'sandbox'    => 'https://sandbox.payfast.co.za',
        'production' => 'https://www.payfast.co.za',
    ],

    'itn' => [
        'validate_ip'        => true,
        'allowed_ips'        => ['197.97.145.144/28', '41.74.179.192/27'],
        'validate_signature' => true,
    ],

    'webhook_route' => '/payfast/webhook',

    'spa' => [
        'enabled'    => env('PAYFAST_SPA_ENABLED', false),
        'prefix'     => 'api/payfast',
        'middleware'  => ['api', 'auth:sanctum'],
    ],
];
```

## Testing

The package includes a full test suite:

```bash
composer test
```

Or run specific suites:

```bash
vendor/bin/phpunit --testsuite=Unit
vendor/bin/phpunit --testsuite=Feature
```

## Sandbox Testing

1. Create a sandbox account at [sandbox.payfast.co.za](https://sandbox.payfast.co.za)
2. Set `PAYFAST_TESTING=true` in your `.env`
3. Use sandbox credentials for `PAYFAST_MERCHANT_ID` and `PAYFAST_MERCHANT_KEY`
4. All payments will use the sandbox environment

## Publishing Assets

```bash
# Config only
php artisan vendor:publish --tag=payfast-config

# Blade views (for customization)
php artisan vendor:publish --tag=payfast-views

# Vue 3 components
php artisan vendor:publish --tag=payfast-vue

# React components
php artisan vendor:publish --tag=payfast-react
```

## License

MIT License. See [LICENSE](LICENSE) for details.
