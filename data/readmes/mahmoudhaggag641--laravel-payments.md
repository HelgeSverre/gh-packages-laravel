![Laravel Payments](resources/images/banner.png)

# Laravel Payments

A comprehensive and flexible Laravel package for handling payments, subscriptions, and webhooks across multiple gateways including **Stripe**, **PayPal**, and **Paymob**.

## Requirements

- **PHP**: >= 8.2
- **Laravel**: >= 11

## Table of Contents

- [1. Installation](#1-installation)
- [2. Publishing Package Files](#2-publishing-package-files)
- [3. Configuration](#3-configuration-configpaymentphp)
- [4. Environment Variables](#4-environment-variables)
- [5. Supported Gateways](#5-supported-gateways)
- [6. Using Gateway Enums](#6-using-gateway-enums)
- [7. Using the Payment Facade](#7-using-the-payment-facade)
- [8. Using the Payable Trait](#8-using-the-payable-trait)
- [9. Using the Subscribable Trait](#9-using-the-subscribable-trait)
- [10. Gateway Payload & Parameters](#10-gateway-payload--parameters)
- [11. Web & Webhook Routes](#11-web--webhook-routes)
- [12. Events & Listeners](#12-events--listeners)
- [13. Models & Database](#13-models--database)
- [14. Views & Translations](#14-views--translations)
- [15. Debug Mode & Logging](#15-debug-mode--logging)
- [16. Custom Gateways](#16-custom-gateways)
- [17. Screenshots from default routes](#17-screenshots-from-default-routes)
- [18. Testing](#18-testing)
- [19. License](#19-license)
- [20. Contact](#20-contact)

## 1. Installation

Install the package via Composer:

```bash
composer require mhaggag/laravel-payments
```

---

## 2. Publishing Package Files

Publish all package assets:

```bash
php artisan vendor:publish --provider="MHaggag\Payments\PaymentsServiceProvider"
```

Or publish selectively:

```bash
# Migrations (REQUIRED)
php artisan vendor:publish --tag=payments-migrations

# Config (OPTIONAL)
php artisan vendor:publish --tag=payments-config

# Views (OPTIONAL)
php artisan vendor:publish --tag=payments-views

# Translations (OPTIONAL)
php artisan vendor:publish --tag=payments-translations
```

Run migrations:

```bash
php artisan migrate
```

---

## 3. Configuration (`config/payments.php`)

All package behavior is controlled from **one config file**:

```php
use MHaggag\Payments\Console\PaypalWebhookCommand;
use MHaggag\Payments\Console\StripeWebhookCommand;
use MHaggag\Payments\Enums\GatewayName;

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    */
    'default' => env('PAYMENT_DEFAULT_GATEWAY', GatewayName::STRIPE),

    /*
    |--------------------------------------------------------------------------
    | Default Currency
    |--------------------------------------------------------------------------
    */
    'default_currency' => env('PAYMENT_DEFAULT_CURRENCY', 'USD'),

    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    | * On enable it, will set 3 routes
    |        POST  payments/checkout ............ payments.checkout › MHaggag\Payments\Http\Controllers\PaymentController@checkout
    |        GET   payments/success/{gateway} ... payments.success  › MHaggag\Payments\Http\Controllers\PaymentController@success
    |        GET   payments/cancel/{gateway} .... payments.cancel   › MHaggag\Payments\Http\Controllers\PaymentController@cancel
    */
    'route' => [
        'enabled' => env('PAYMENT_ROUTE_ENABLED', true),
        'prefix' => env('PAYMENT_ROUTE_PREFIX', 'payments'),
        'middleware' => ['web'],
        'name_prefix' => env('PAYMENT_ROUTE_NAME_PREFIX', 'payments.'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Model Configuration
    |--------------------------------------------------------------------------
    */
    'models' => [
        'payment' => \MHaggag\Payments\Models\Payment::class,
        'subscription' => \MHaggag\Payments\Models\Subscription::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateways Configuration
    |--------------------------------------------------------------------------
    */
    'gateways' => [
        GatewayName::STRIPE => [
            'class' => \MHaggag\Payments\Gateways\StripeGateway::class,
            'api_key' => env('STRIPE_API_KEY'),
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
            'mode' => env('STRIPE_MODE', 'test'),
            'currency' => env('STRIPE_CURRENCY', 'usd'),
        ],

        GatewayName::PAYPAL => [
            'class' => \MHaggag\Payments\Gateways\PaypalGateway::class,
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'client_secret' => env('PAYPAL_CLIENT_SECRET'),
            'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
            'mode' => env('PAYPAL_MODE', 'sandbox'),
            'currency' => env('PAYPAL_CURRENCY', 'USD'),
        ],

        GatewayName::PAYMOB => [
            'class' => \MHaggag\Payments\Gateways\PaymobGateway::class,
            'api_key' => env('PAYMOB_API_KEY'),
            'secret_key' => env('PAYMOB_SECRET_KEY'),
            'public_key' => env('PAYMOB_PUBLIC_KEY'),
            'hmac_secret' => env('PAYMOB_HMAC_SECRET'),
            'integration_id' => env('PAYMOB_INTEGRATION_ID'),
            'moto_integration_id' => env('PAYMOB_MOTO_INTEGRATION_ID'),
            'mode' => env('PAYMOB_MODE', 'test'),
            'currency' => env('PAYMOB_CURRENCY', 'EGP'),
            'region' => env('PAYMOB_REGION', 'EGY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | * with built in payments.verify_signature midlleware that you can remove it to prevent the signature verification.
    | * On enable it, will set 3 routes
    |       POST  payments/webhook/{gateway} ........ MHaggag\Payments\Http\Controllers\WebhookController@handle
    */
    'webhook' => [
        'enabled' => env('PAYMENT_ROUTE_WEBHOOK_ENABLED', true),
        'prefix' => '/payments/webhook',
        'middleware' => ['api', 'payments.verify_signature'],

        'events' => [
            'stripe' => StripeWebhookCommand::DEFAULT_EVENTS,
            'paypal' => PaypalWebhookCommand::DEFAULT_EVENTS,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Events Configuration
    |--------------------------------------------------------------------------
    */
    'events' => [
        'payment' => [
            'received' => \MHaggag\Payments\Events\PaymentRedirectReceived::class,
            'processed' => \MHaggag\Payments\Events\PaymentRedirectProcessed::class,
        ],
        'webhook' => [
            'received' => \MHaggag\Payments\Events\PaymentWebhookReceived::class,
            'processed' => \MHaggag\Payments\Events\PaymentWebhookProcessed::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    */
    'logging' => [
        'enabled' => env('PAYMENT_LOGGING_ENABLED', false),
        'channel' => env('PAYMENT_LOGGING_CHANNEL', 'stack'),
        'level' => env('PAYMENT_LOGGING_LEVEL', 'info'),
    ],
];
```

---

## 4. Environment Variables

Add these variables to your `.env` file to configure the package:

```env
# General
PAYMENT_DEFAULT_GATEWAY=stripe
PAYMENT_DEFAULT_CURRENCY=USD
PAYMENT_ROUTE_ENABLED=true
PAYMENT_ROUTE_PREFIX=payments
PAYMENT_ROUTE_NAME_PREFIX=payments.
PAYMENT_ROUTE_WEBHOOK_ENABLED=true
PAYMENT_LOGGING_ENABLED=true
PAYMENT_LOGGING_CHANNEL=stack
PAYMENT_LOGGING_LEVEL=info

# Stripe
STRIPE_API_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MODE=test
STRIPE_CURRENCY=usd

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_MODE=sandbox
PAYPAL_CURRENCY=USD

# Paymob
PAYMOB_API_KEY=...
PAYMOB_SECRET_KEY=...
PAYMOB_PUBLIC_KEY=...
PAYMOB_HMAC_SECRET=...
PAYMOB_INTEGRATION_ID=...
PAYMOB_MOTO_INTEGRATION_ID=...
PAYMOB_MODE=test
PAYMOB_CURRENCY=EGP
PAYMOB_REGION=EGY
```

---

## 5. Supported Gateways

- Stripe
- PayPal
- Paymob
- Easily extendable with custom gateways

Each gateway has:
- Its own config section
- Its own payload definition

---

## 6. Using Gateway Enums

Select the gateway for a payment process using the `GatewayName` enum:

```php
use MHaggag\Payments\Enums\GatewayName;

GatewayName::STRIPE;
GatewayName::PAYPAL;
GatewayName::PAYMOB;
```

Example:

```php
use MHaggag\Payments\Facades\Payment;

Payment::gateway(GatewayName::Stripe);
```

---

## 7. Using the Payment Facade

The `Payment` facade provides a fluent interface to construct and execute payment requests.

### Available Methods

- **`gateway(string $name)`**: Set the payment gateway driver, or use the default in `config/payments.php` with `default` key.
- **`withPayload(array $payload)`**: Pass gateway-specific parameters (including the next methods parameters and any custom parameters).

**Or you can set your payload as separate methods:**

- **`amount(float $amount, ?string $currency = null)`**: Set the amount to charge.
- **`currency(string $currency)`**: Set the currency (e.g., 'USD').
- **`for(Model $payable)`**: Associate the payment with a model.
- **`isSubscription(bool $isSubscription = true)`**: Flag as subscription.
- **`items(array $items)`**: Set items. See gateway documentation for structure.
- **`metadata(array $metadata)`**: Set metadata.
- **`description(string $description)`**: Set description.
- **`redirectUrls(string $successUrl, string $cancelUrl)`**: Set success and cancel URLs. Default URLs are configured in `config/payments.php` under the `route` key.

You can review the [Gateways Payloads & Parameters](#gateways--payloads) section for more details and any custom parameters you may need to pass to the gateway individually.

**Execution Methods**

- **`create()`**: Create a payment intent/transaction.
- **`checkout()`**: Initiate a checkout session that will return `checkout_url` for redirect to payment page.
- **`refund(Model $payment, ?float $amount = null)`**: Refund a payment.
- **`handleRedirect(string $gateway, array $payload)`**: Handle gateway redirect.
- **`verifySignature(string $gateway, Request $request)`**: Handle gateway verification signature.
- **`handleWebhook(string $gateway, array $payload)`**: Process incoming webhooks.

### Examples

**Basic Payment:**

```php
use MHaggag\Payments\Facades\Payment;
use MHaggag\Payments\Enums\GatewayName;

Payment::gateway(GatewayName::PAYPAL)
    ->amount(50)
    ->currency('EUR')
    ->description('Order #123')
    ->redirectUrls(route('payment.success'), route('payment.cancel'))
    ->isSubscription()
    ->items([
        {
            'name' => 'Product A',
            'price' => 10,
            'quantity' => 2,
        },
        {
            'name' => 'Product B',
            'price' => 20,
            'quantity' => 1,
        },
    ])
    ->metadata([
        'order_id' => 123,
    ])
    ->checkout();

// Or can you set all with
Payment::gateway(GatewayName::PAYPAL)
    ->withPayload([
        'amount' => 50,
        'currency' => 'EUR',
        'description' => 'Order #123',
        'success_url' => route('payment.success'),
        'cancel_url' => route('payment.cancel'),
        'allow_promotion_codes' => true,
        'is_subscription' => false,
        'items' => [
            {
                'name' => 'Product A',
                'amount' => 10,
                'quantity' => 2,
            },
            {
                'name' => 'Product B',
                'amount' => 20,
                'quantity' => 1,
            },
        ],
        'metadata' => [
            'order_id' => 123,
        ],
    ])
    ->checkout();
```

---

## 8. Using the `Payable` Trait

Attach payments to any Eloquent model:

```php
use MHaggag\Payments\Traits\Payable;

class User extends Model
{
    use Payable;
}
```

Usage:

```php
$user->payment(GatewayName::STRIPE)
    ->amount(100)
    ->currency('USD')
    ->checkout();
```

### Available Methods

- **`payment(string $gateway)`**: Initiate a payment process, and using all previous methods in the payment facade.
---
- **`payments()`**: Get all payments relationship.
- **`successfulPayments()`**: Get successful payments relationship.
- **`pendingPayments()`**: Get pending payments relationship.
- **`failedPayments()`**: Get failed payments relationship.
- **`refundedPayments()`**: Get refunded payments relationship.
- **`lastPayment()`**: Get the latest payment model.
- **`totalPaid()`**: Get total amount paid.
- **`totalRefunded()`**: Get total amount refunded.
- **`hasPayments()`**: Check if model has any payments.
- **`hasSuccessfulPayment()`**: Check if model has successful payment.
- **`hasPendingPayment()`**: Check if model has pending payment.

### Scopes

- **`hasPaymentWithStatus(string $status)`**: Filter models by payment status.
- **`hasPaymentWithGateway(string $gateway)`**: Filter models by gateway.

---

## 9. Using the `Subscribable` Trait

Using it with `Payable` Trait when you want to support subscriptions mode.

```php
use MHaggag\Payments\Traits\Subscribable;

class User extends Model
{
    use Subscribable;
}
```

Usage:

```php
$user->subscribe(GatewayName::PAYPAL)
    ->amount(20)
    ->currency('USD')
    ->checkout();
```

### Available Methods

- **`subscribe(string $gateway)`**: Initiate a subscription process, and using all previous methods in the payment facade.
---
- **`subscriptions()`**: Get all subscriptions relationship.
- **`activeSubscriptions()`**: Get active subscriptions relationship.
- **`canceledSubscriptions()`**: Get canceled subscriptions relationship.
- **`trialingSubscriptions()`**: Get trialing subscriptions relationship.
- **`latestSubscription()`**: Get the latest subscription model.
- **`isSubscribed()`**: Check if model has an active subscription.
- **`onTrial()`**: Check if model is currently on trial.

### Scopes

- **`hasSubscriptionWithStatus(string $status)`**: Filter models by subscription status.
- **`hasSubscriptionWithGateway(string $gateway)`**: Filter models by gateway.

---

## 10. Gateway Payload & Parameters

Each gateway defines specific parameters.

### Stripe

```php
Payment::gateway(GatewayName::STRIPE)
    // Special parameters for stripe
    ->payload([
        'payment_method_types' => ['card'],
        'customer' => $user->name,
        'customer_email' => $user->email,
        'client_reference_id' => $user->id, // Optional, the default will be payment->uuid
        'subscription_data' => [], // if you want to create a subscription
        'allow_promotion_codes' => true,
        'source' => '', // Token, card reference, etc when using create method instead of checkout
        'items' => [
            // items can be 
            {
                'name' => 'Product A',
                'amount' => 10,
                'quantity' => 2,
            },
            
            // Or
            {
                'price_id' => 'stripe_price_id',
                'quantity' => 1,
            },

            // if you do not pass any items, the default will be the payment amount, and name will be description.
        ],
    ]);

/**
 * Note: By using isSubscription() method to enable subscription mode
 * You must provide at least one recurring price in `subscription` mode when using prices.
 */
Payment::gateway(GatewayName::STRIPE)
    ->withPayload([])
    ->isSubscription()
    ->items([
        ['price_id' => 'price_1St7q................', 'quantity' => 1]
    ])
```

**Test Card Details**
Card Number: 4242424242424242
Expiration Date: 12/34
CVV: 123

### PayPal

```php
Payment::gateway(GatewayName::PAYPAL)
    // Special parameters for paypal
    ->payload([
        'brand_name' => 'Your Brand', // default will be app name
        'locale' => 'en_US', // default will be 'en_US'
        'source' => '', // Token, card reference, etc when using create method instead of checkout
        'items' => [
            // items can be 
            {
                'name' => 'Product A',
                'amount' => 10,
                'quantity' => 2,
                'description' => 'Product A description'
            },

            // if you do not pass any items, the default will be the payment amount, and name will be description.
        ],
    ]);

/**
 * Note: By using isSubscription() method to enable subscription mode
 * You must send plan_id that you created in paypal.
 */
Payment::gateway(GatewayName::PAYPAL)
    ->withPayload([
        'plan_id' => 'paypal_plan_id',
    ])
    ->isSubscription()
```

### Paymob

```php
Payment::gateway(GatewayName::PAYMOB)
    ->withPayload([
        'notification_url' => 'notification_url', // default will be configured in config/payments.php under the webhook key
        'billing_data' => [
            "email" => "mhaggag@gmail.com", // required
            "first_name" => "mahmoud", // required
            "last_name" => "haggag", // required
            "phone_number" => "+201121xxxxxx", // required
            "apartment" => "dumy", // optional
            "street" => "dumy", // optional
            "building" => "dumy", // optional
            "city" => "dumy", // optional
            "country" => "dumy", // optional
            "floor" => "dumy", // optional
            "state" => "dumy" // optional
        ],
        'items' => [ // optional
            [
                'name' => 'Item name',
                'amount' => 100,
                'quantity' => 1,
                'description' => 'Item description'
            ],
        ],
        'special_reference' => $user->uuid, // Optional, the default will be payment->uuid
    ]);

/**
 * Note: By using isSubscription() method to enable subscription mode
 * You must send plan_id that you created in next step.
 */
$plan = Payment::driver(GatewayName::PAYMOB)->createSubscriptionPlan([
    'name' => 'Test Plan',
    'amount' => 100,
    'frequency' => 7, // Values can be (7, 15, 30, 60, 90, 180, 360)
    'use_transaction_amount' => true, // default is true
    'reminder_days' => 2, // optional
    'retrial_days' => 2, // optional
    'number_of_deductions' => 2, // default is null
    'webhook_url' => 'webhook_url', // default will be configured in config/payments.php under the webhook key
]);

Payment::gateway(GatewayName::PAYMOB)
    ->withPayload([
        'plan_id' => $plan['id'],
    ])
    ->isSubscription()
/**
 * Subscription creation is being done by completing one 3DS transaction to save the customer's card and connect it with the subscription.
 */
```

**Card Test Credentials**
Card Number: 2223000000000007
Expiration Date: 01/39
CVV: 100
Card Holder Name: Test Account

**Wallet Test Credentials**
Wallet Number: 01010101010
MPin Code: 123456
OTP: 123456

---

## 11. Web & Webhook Routes

Enable or disable routes from config, and by default the webhook routes use the `payments.verify_signature` middleware to verify the signature or use the verifySignature method on the facade. You can control all these by `route` and `webhook` keys in `config/payments.php`:

```php
'route' => [
    'enabled' => env('PAYMENT_ROUTE_ENABLED', true),
    'prefix' => env('PAYMENT_ROUTE_PREFIX', 'payments'),
    'middleware' => ['web'],
    'name_prefix' => env('PAYMENT_ROUTE_NAME_PREFIX', 'payments.'),
]

'webhook' => [
    'enabled' => env('PAYMENT_ROUTE_WEBHOOK_ENABLED', true),
    'prefix' => '/payments/webhook',
    'middleware' => ['api', 'payments.verify_signature'],
]
```

Default web URLs (you can see the screenshots below):

- POST `/payments/checkout`
- GET  `/payments/success/{gateway}`
- GET  `/payments/cancel/{gateway}`

Default webhook URLs:

- POST `/payments/webhook/{gateway}`

---

**Also, you can create webhook events by this commands:**
```bash
php artisan stripe:webhook
            # Available options (optional)
            --url=https://domain.com/payments/webhook/stripe
            --api-version=2022-08-01
            --disabled=false

php artisan paypal:webhook
            # Available options (optional)
            --url=https://domain.com/payments/webhook/paypal
```
- This command will create a webhook by default values in `config/payments.php` under the `webhook` key.
- By this key, you can custom the webhook url and events that you want to handle.
- Default webhook url is: `https://domain.com/payments/webhook/{gateway}`.
- And default events that will create. Will be the package need to handle the all payment/subscription process logic to all functions.
---

## 12. Events & Listeners

You can customize your events instead of using in `config/payments.php` by adding them to the `events` key:

```php
'events' => [
    'payment' => [
        'received' => \MHaggag\Payments\Events\PaymentRedirectReceived::class,
        'processed' => \MHaggag\Payments\Events\PaymentRedirectProcessed::class,
    ],
    'webhook' => [
        'received' => \MHaggag\Payments\Events\PaymentWebhookReceived::class,
        'processed' => \MHaggag\Payments\Events\PaymentWebhookProcessed::class,
    ],
]
```

**Available Events on using handleRedirect method on facade**

- `events.payment.received` default is `PaymentRedirectReceived`
- `events.payment.processed` default is `PaymentRedirectProcessed`

**Available Events on using handleWebhook method on facade**

- `events.webhook.received` default is `PaymentWebhookReceived`
- `events.webhook.processed` default is `PaymentWebhookProcessed`

### Listening to Events

```php
Event::listen(PaymentRedirectProcessed::class, function ($event) {
    logger('Payment success:', $event->payment->toArray());
});

Event::listen(PaymentWebhookProcessed::class, function ($event) {
    logger('Webhook processed:', $event->payment->toArray());
});
```

---

## 13. Models & Database

Published migrations create tables for:
- payments
- subscriptions (if enabled)

Override models in config:

```php
'models' => [
    'payment' => \MHaggag\Payments\Models\Payment::class,
    'subscription' => \MHaggag\Payments\Models\Subscription::class,
],
```

---

## 14. Views & Translations

### Views

Publish views:

```bash
php artisan vendor:publish --tag=payments-views
```

Customize checkout, success, and error pages.

### Translations

Publish language files:

```bash
php artisan vendor:publish --tag=payments-translations
```

Add your own language:

```text
lang/fr/success.php
```

---

## 15. Debug Mode & Logging

Enable debug mode:

```env
PAYMENT_LOGGING_ENABLED=true
```

This logs:
- Gateway requests
- Payloads
- Responses
- Webhook data

---

## 16. Custom Gateways

You can add your own gateway by extending the `MHaggag\Payments\Gateways\BaseGateway` class.

1. **Create your gateway class:**

```php
namespace App\Payments\Gateways;

use MHaggag\Payments\Gateways\BaseGateway;
use Illuminate\Database\Eloquent\Model;

class MyCustomGateway extends BaseGateway
{
    public function createCheckout(array $payload): array
    {
        // Implement logic to create checkout session/transaction
        // Return ['checkout_url' => '...', 'session_id' => '...']
    }

    public function handleRedirect(array $payload): Model
    {
        // Verify payment status and update the payment model
    }
    
    // Implement other required methods...
}
```

2. **Register in `config/payments.php`:**

```php
'gateways' => [
    'custom_gateway' => [
        'class' => \App\Payments\Gateways\MyCustomGateway::class,
        'api_key' => env('CUSTOM_API_KEY'),
    ],
],
```

---

## 17. Screenshots from default routes

### Success

| English | Arabic |
| :---: | :---: |
| ![Sample success view as English](resources/images/laravel-payments-en-1.png) | ![Sample success view as Arabic](resources/images/laravel-payments-ar-1.png) |

### Cancel

| English | Arabic |
| :---: | :---: |
| ![Sample cancel view as English](resources/images/laravel-payments-en-2.png) | ![Sample cancel view as Arabic](resources/images/laravel-payments-ar-2.png) |

### Error

| English | Arabic |
| :---: | :---: |
| ![Sample error view as English](resources/images/laravel-payments-en-3.png) | ![Sample error view as Arabic](resources/images/laravel-payments-ar-3.png) |

---

## 18. Testing

```bash
php artisan test

```bash
./vendor/bin/phpunit
```

Mock gateways are included for local testing.

---

## 19. License

MIT License.

---

## Final Notes

This package is designed to be:
- Framework-native
- Fully configurable
- Easy to extend
- Safe for production use

If you need custom gateways, advanced subscriptions, or multi-tenant support, extend the base gateway class or contact me for assistance.

Happy coding 🚀

## 20. Contact

If you have any questions, suggestions, or need support, feel free to contact me:

- **Email**: [mahmoudhaggag641@gmail.com](mailto:mahmoudhaggag641@gmail.com)
- **Phone**: +201121300234
- **LinkedIn**: [Mahmoud Haggag](https://linkedin.com/in/mahmoudhaggag641)