# Paystack Payment Package

This is a Laravel package for integrating with the Paystack payment gateway. It supports customer creation, recurring plans, single payments, transaction verification, webhook verification, and refunds.

The package includes request validation guards before outbound calls and returns DTOs with transaction details that are useful to Rainwaves host applications.

## Installation

You can install the package via Composer:

```bash
composer require rainwaves/paystack-payment
```

For package development:

```bash
composer install
composer lint
composer test
```

## Configuration

Publish the config file in your Laravel application:

```bash
php artisan vendor:publish --provider="rainwaves\\PaystackPayment\\PaystackServiceProvider"
```

Set the Paystack credentials in your `.env` file:

- `PAYSTACK_SECRET_KEY=`
- `PAYSTACK_PUBLIC_KEY=`
- `PAYSTACK_WEBHOOK_SECRET=`
- `PAYSTACK_CALLBACK_URL=`
- `PAYSTACK_CANCEL_URL=`
- `PAYSTACK_CURRENCY=ZAR`
- `PAYSTACK_TIMEOUT=15`
- `PAYSTACK_RETRY=2`

Example config:

```php
return [
    'default' => env('PAYSTACK_PAYMENT_DRIVER', 'paystack'),
    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY', ''),
        'public_key' => env('PAYSTACK_PUBLIC_KEY', ''),
        'base_url' => env('PAYSTACK_BASE_URL', 'https://api.paystack.co'),
        'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET', env('PAYSTACK_SECRET_KEY', '')),
        'callback_url' => env('PAYSTACK_CALLBACK_URL'),
        'cancel_url' => env('PAYSTACK_CANCEL_URL'),
        'currency' => env('PAYSTACK_CURRENCY', 'ZAR'),
        'timeout' => (int) env('PAYSTACK_TIMEOUT', 15),
        'retry' => (int) env('PAYSTACK_RETRY', 2),
    ],
];
```

## Compatibility

- PHP: 8.2+
- Laravel: 12.x

## Versioning

Package versions should be published with Git tags, not by setting a `version` field in `composer.json`.

Recommended first stable release:

- `v1.0.0`

## Currency Rule

Keep the currency rule simple:

- the package should use the currency configured for the Paystack portfolio
- set that default in `paystack.paystack.currency`
- pass a currency in the DTO only when you need to override the configured default
- all amounts sent to Paystack must be in minor units

Examples:

- `ZAR 125.50` must be sent as `12550`
- `USD 25.00` must be sent as `2500`

If your product catalog stores prices in `USD` but the customer is checking out against a `ZAR` Paystack portfolio, convert the amount before calling the package and send the final Paystack currency amount in minor units.

## Usage

The main interface exposed by the package is `rainwaves\PaystackPayment\Contracts\PaymentGatewayInterface`.

### Laravel

```php
use Illuminate\Http\Request;
use rainwaves\PaystackPayment\Contracts\PaymentGatewayInterface;
use rainwaves\PaystackPayment\DTO\CheckoutInitializationData;
use rainwaves\PaystackPayment\DTO\CustomerData;
use rainwaves\PaystackPayment\DTO\PlanData;
use rainwaves\PaystackPayment\DTO\RefundData;
use rainwaves\PaystackPayment\DTO\WebhookPayload;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayInterface $payments,
    ) {}

    public function createCustomer(Request $request)
    {
        return $this->payments->createCustomer(new CustomerData(
            email: $request->string('email')->toString(),
            firstName: $request->string('first_name')->toString(),
            lastName: $request->string('last_name')->toString(),
            phone: $request->string('phone')->toString(),
            metadata: [
                'user_id' => $request->user()?->id,
            ],
        ));
    }

    public function createPlan()
    {
        return $this->payments->createPlan(new PlanData(
            name: 'Gold Plan',
            amountInMinor: 9900,
            interval: 'monthly',
            description: 'Monthly Gold subscription',
        ));
    }

    public function singlePayment(Request $request)
    {
        return $this->payments->initializeCheckout(new CheckoutInitializationData(
            reference: (string) str()->uuid(),
            email: $request->string('email')->toString(),
            amountInMinor: 12550,
            callbackUrl: config('paystack.paystack.callback_url'),
            metadata: [
                'type' => 'single_payment',
                'order_id' => $request->integer('order_id'),
            ],
        ));
    }

    public function subscriptionPayment(Request $request)
    {
        return $this->payments->initializeCheckout(new CheckoutInitializationData(
            reference: (string) str()->uuid(),
            email: $request->string('email')->toString(),
            amountInMinor: 9900,
            planCode: 'PLN_xxxxxxxx',
            customerCode: 'CUS_xxxxxxxx',
            callbackUrl: config('paystack.paystack.callback_url'),
            metadata: [
                'type' => 'subscription',
                'portfolio_id' => $request->integer('portfolio_id'),
            ],
        ));
    }

    public function verifyTransaction(string $reference)
    {
        return $this->payments->verifyTransaction($reference);
    }

    public function refund(string $reference)
    {
        return $this->payments->createRefund(new RefundData(
            transactionReference: $reference,
            amountInMinor: 9900,
            reason: 'Customer requested cancellation',
        ));
    }

    public function webhook(Request $request)
    {
        return $this->payments->verifyWebhook(new WebhookPayload(
            rawBody: $request->getContent(),
            headers: $request->headers->all(),
            payload: $request->all(),
        ));
    }
}
```

### Single Payments

For one-time payments, initialize checkout without a `planCode`:

```php
use rainwaves\PaystackPayment\DTO\CheckoutInitializationData;

$checkout = $payments->initializeCheckout(new CheckoutInitializationData(
    reference: 'ORDER-1001',
    email: 'customer@example.com',
    amountInMinor: 12550,
    metadata: [
        'type' => 'single_payment',
        'order_id' => 1001,
    ],
));

return redirect()->away($checkout->checkoutUrl);
```

### Subscriptions

For subscriptions, create the Paystack plan first, then initialize checkout with the returned `planCode`:

```php
use rainwaves\PaystackPayment\DTO\CheckoutInitializationData;
use rainwaves\PaystackPayment\DTO\PlanData;

$plan = $payments->createPlan(new PlanData(
    name: 'Premium Monthly',
    amountInMinor: 9900,
    interval: 'monthly',
));

$checkout = $payments->initializeCheckout(new CheckoutInitializationData(
    reference: 'SUB-1001',
    email: 'customer@example.com',
    amountInMinor: 9900,
    planCode: $plan->code,
));
```

### Optional Fields

- `CheckoutInitializationData::$callbackUrl`
- `CheckoutInitializationData::$planCode`
- `CheckoutInitializationData::$customerCode`
- `CheckoutInitializationData::$metadata`
- `CheckoutInitializationData::$currency`
- `PlanData::$description`
- `PlanData::$invoiceLimit`
- `PlanData::$metadata`
- `PlanData::$currency`
- `RefundData::$amountInMinor`
- `RefundData::$currency`
- `RefundData::$reason`
- `RefundData::$customerNote`
- `RefundData::$merchantNote`

### Validation Rules

The package validates common request mistakes before sending anything to Paystack:

- checkout amount must be greater than zero
- plan amount must be greater than zero
- refund amount must be greater than zero when provided
- checkout and customer emails must be valid email addresses
- checkout references, plan names, and plan intervals cannot be blank

Validation failures throw `rainwaves\PaystackPayment\Exceptions\InvalidPaymentRequestException`.

### Verification Details

`verifyTransaction()` returns more than the basic status fields. In addition to the reference and amount, the DTO can include:

- `customerEmail`
- `customerName`
- `authorizationReusable`
- `paidAt`
- `feesInMinor`
- `channel`
- `gatewayResponse`

Example:

```php
$transaction = $payments->verifyTransaction($reference);

if ($transaction->status === 'success' && $transaction->authorizationReusable) {
    // save reusable authorization details for future billing
}
```

### Webhooks

The package verifies the Paystack webhook signature using the configured webhook secret:

```php
$verification = $payments->verifyWebhook(new WebhookPayload(
    rawBody: $request->getContent(),
    headers: $request->headers->all(),
    payload: $request->all(),
));

if (! $verification->isValid) {
    abort(401, 'Invalid Paystack webhook signature.');
}
```

Webhook helpers are available on the verification DTO:

```php
if ($verification->isChargeSuccess()) {
    // activate payment locally
}

if ($verification->isSubscriptionCreate()) {
    // persist provider subscription details
}
```

## Notes

- The package returns DTOs so host applications can map provider responses into their own persistence and business logic.
- Single-payment and subscription activation flows remain the responsibility of the host application.
- Refund orchestration and local state transitions belong in the host application layer.

## Production Checklist

Before tagging a production release, run the checklist in [docs/sandbox-smoke-test.md](/home/eclaims/package-development/rainwaves/paystack-payment/docs/sandbox-smoke-test.md).

The first release notes are in [docs/release-notes-v1.0.0.md](/home/eclaims/package-development/rainwaves/paystack-payment/docs/release-notes-v1.0.0.md).
