![laravel-eupago-repo-banner](https://pbs.twimg.com/profile_banners/593785558/1671194657/1500x500)

# Laravel EuPago

A comprehensive Laravel package for integrating with the EuPago payment gateway API. Support for Multibanco, MB Way, Credit Card, Google Pay, Apple Pay, and Payouts management.

[![Latest version](https://img.shields.io/github/release/digitaldev-lx/laravel-eupago?style=flat-square)](https://github.com/digitaldev-lx/laravel-eupago/releases)
[![GitHub license](https://img.shields.io/github/license/digitaldev-lx/laravel-eupago?style=flat-square)](https://github.com/digitaldev-lx/laravel-eupago/blob/master/LICENSE)

## Requirements

| Release |    PHP    |       Laravel       |
|---------|:---------:|:-------------------:|
| 3.0.0   |  >= 8.4   | 11 \|\| 12 \|\| 13  |
| 2.3.0   | 8.3, 8.4  |    11 \|\| 12       |
| 2.2.0   |  >= 8.3   |         11          |
| 2.1.0   |  >= 8.1   |         10          |

## Installation

```bash
composer require digitaldev-lx/laravel-eupago
```

Publish the migration
```bash
php artisan vendor:publish --provider=DigitaldevLx\\LaravelEupago\\Providers\\EuPagoServiceProvider --tag=migrations
```

Run the migration
```bash
php artisan migrate
```

Publish the configuration file (optional)
```bash
php artisan vendor:publish --provider=DigitaldevLx\\LaravelEupago\\Providers\\EuPagoServiceProvider --tag=config
```

Publish the translations files (optional)
```bash
php artisan vendor:publish --provider=DigitaldevLx\\LaravelEupago\\Providers\\EuPagoServiceProvider --tag=translations
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
EUPAGO_ENV=test          # or 'prod'
EUPAGO_API_KEY=your_api_key
EUPAGO_CHANNEL=your_channel
```

There are two environments available: "test" and "prod". Use the "test" environment during development and switch to "prod" when your application is ready for production.

## Payment Methods

### Multibanco (MB) References

#### Usage

```php
use DigitaldevLx\LaravelEupago\MB\MB;

$order = Order::find(1);

$mb = new MB(
    $order->value,              // float: payment amount
    $order->id,                 // string: external identifier
    $order->date,               // string: start date (Y-m-d)
    $order->payment_limit_date, // string: end date (Y-m-d)
    $order->value,              // float: minimum value
    $order->value,              // float: maximum value
    0                           // bool: allow duplicated payments
);

try {
    $mbReferenceData = $mb->create();

    if ($mb->hasErrors()) {
        // handle errors
    }

    $order->mbReferences()->create($mbReferenceData);
} catch (\Exception $e) {
    // handle exception
}
```

Response format:
```php
[
    'success' => true,
    'state' => 0,
    'response' => "OK",
    'reference' => "000001236",
    'value' => "3.00000",
    'entity' => "11249",
]
```

#### Using the Trait

```php
use DigitaldevLx\LaravelEupago\Traits\Mbable;

class Order extends Model
{
    use Mbable;
}

// Retrieve references
$order = Order::find(1);
$mbReferences = $order->mbReferences;
```

#### Callback

The package handles callbacks automatically, updating the payment state and triggering events.

**Endpoint:** `GET /eupago/callback`
**Payment Method Code:** `PC:PT`

### MB Way References

#### Usage

```php
use DigitaldevLx\LaravelEupago\MBWay\MBWay;

$order = Order::find(1);

$mbway = new MBWay(
    $order->value,      // float: payment amount
    $order->id,         // int: external identifier
    $customer->phone,   // string: phone number (alias)
    'Order payment'     // string|null: optional description
);

try {
    $mbwayReferenceData = $mbway->create();

    if ($mbway->hasErrors()) {
        // handle errors
    }

    $order->mbwayReferences()->create($mbwayReferenceData);
} catch (\Exception $e) {
    // handle exception
}
```

#### Using the Trait

```php
use DigitaldevLx\LaravelEupago\Traits\Mbwayable;

class Order extends Model
{
    use Mbwayable;
}

// Retrieve references
$order = Order::find(1);
$mbwayReferences = $order->mbwayReferences;
```

#### Callback

**Endpoint:** `GET /eupago/callback`
**Payment Method Code:** `MW:PT`

### Credit Card

#### Single Payment

```php
use DigitaldevLx\LaravelEupago\CreditCard\CreditCard;

$creditCard = new CreditCard(
    150.00,                                // float: amount
    'ORDER-456',                           // string: identifier
    'https://example.com/success',         // string: success URL
    'https://example.com/fail',            // string: fail URL
    'https://example.com/back',            // string: back URL
    'EN',                                  // string: language (PT, EN, FR, ES)
    'EUR',                                 // string: currency
    'customer@example.com',                // string|null: customer email
    60                                     // int|null: minutes form up
);

try {
    $result = $creditCard->create();

    if ($result['success']) {
        // Redirect user to $result['redirect_url']
        // Store $result['reference'] and $result['transaction_id']
    }
} catch (\Exception $e) {
    // handle exception
}
```

**Maximum:** €3,999 per transaction
**Callback Code:** `CC:PT`

#### Recurring Payments (Subscriptions)

**Step 1: Create Authorization**

```php
use DigitaldevLx\LaravelEupago\CreditCard\CreditCardRecurrence;

$recurrence = new CreditCardRecurrence(
    'SUBSCRIPTION-123',                    // string: identifier
    'https://example.com/success',         // string: success URL
    'https://example.com/fail',            // string: fail URL
    'https://example.com/back',            // string: back URL
    'PT'                                   // string: language
);

try {
    $result = $recurrence->create();

    if ($result['success']) {
        // Redirect user to authorize subscription
        // Store $result['subscription_id']
    }
} catch (\Exception $e) {
    // handle exception
}
```

**Step 2: Execute Recurring Payment**

```php
use DigitaldevLx\LaravelEupago\CreditCard\CreditCardRecurringPayment;

$payment = new CreditCardRecurringPayment(
    'subscription-id-from-authorization',  // string: subscription ID
    50.00,                                 // float: amount
    'customer@example.com',                // string|null: customer email
    true                                   // bool: notify customer
);

try {
    $result = $payment->create();

    if ($result['success']) {
        // Payment processed
    }
} catch (\Exception $e) {
    // handle exception
}
```

#### Using the Trait

```php
use DigitaldevLx\LaravelEupago\Traits\Creditcardable;
use DigitaldevLx\LaravelEupago\Traits\Creditcardrecurrable;

class Order extends Model
{
    use Creditcardable;
}

class Subscription extends Model
{
    use Creditcardrecurrable;
}
```

### Google Pay

```php
use DigitaldevLx\LaravelEupago\GooglePay\GooglePay;

$googlePay = new GooglePay(
    150.00,                                // float: amount
    'ORDER-456',                           // string: identifier
    'https://example.com/success',         // string: success URL
    'https://example.com/fail',            // string: fail URL
    'https://example.com/back',            // string: back URL
    'EN',                                  // string: language
    'EUR',                                 // string: currency
    'customer@example.com',                // string|null: email
    'John',                                // string|null: first name
    'Doe',                                 // string|null: last name
    'PT',                                  // string|null: country code
    true,                                  // bool: notify customer
    60                                     // int|null: minutes form up
);

try {
    $result = $googlePay->create();

    if ($result['success']) {
        // Redirect to $result['redirect_url']
    }
} catch (\Exception $e) {
    // handle exception
}
```

**Maximum:** €99,999 per transaction
**Callback Code:** `GP:PT`

#### Using the Trait

```php
use DigitaldevLx\LaravelEupago\Traits\Googlepayable;

class Order extends Model
{
    use Googlepayable;
}
```

### Apple Pay

```php
use DigitaldevLx\LaravelEupago\ApplePay\ApplePay;

$applePay = new ApplePay(
    150.00,                                // float: amount
    'ORDER-456',                           // string: identifier
    'https://example.com/success',         // string: success URL
    'https://example.com/fail',            // string: fail URL
    'https://example.com/back',            // string: back URL
    'EN',                                  // string: language
    'EUR',                                 // string: currency
    'customer@example.com',                // string|null: email
    'John',                                // string|null: first name
    'Doe',                                 // string|null: last name
    'PT',                                  // string|null: country code
    true,                                  // bool: notify customer
    60                                     // int|null: minutes form up
);

try {
    $result = $applePay->create();

    if ($result['success']) {
        // Redirect to $result['redirect_url']
    }
} catch (\Exception $e) {
    // handle exception
}
```

**Callback Code:** `AP:PT`

#### Using the Trait

```php
use DigitaldevLx\LaravelEupago\Traits\Applepayable;

class Order extends Model
{
    use Applepayable;
}
```

## Payouts Management

### List Payouts

Retrieve all payouts for a specific date range using OAuth Bearer Token authentication.

```php
use DigitaldevLx\LaravelEupago\Payouts\Payout;

$payout = new Payout(
    '2024-01-01',              // string: start date (yyyy-mm-dd)
    '2024-01-31',              // string: end date (yyyy-mm-dd)
    'your-bearer-token'        // string: OAuth Bearer Token
);

try {
    $result = $payout->list();

    if ($result['success']) {
        foreach ($result['payouts'] as $payout) {
            // Process payout data
        }
    }
} catch (\Exception $e) {
    // handle exception
}
```

### List Payout Transactions

Retrieve all transaction details within a date range.

```php
use DigitaldevLx\LaravelEupago\Payouts\PayoutTransaction;

$transactions = new PayoutTransaction(
    '2024-01-01',              // string: start date (yyyy-mm-dd)
    '2024-01-31',              // string: end date (yyyy-mm-dd)
    'your-bearer-token'        // string: OAuth Bearer Token
);

try {
    $result = $transactions->list();

    if ($result['success']) {
        foreach ($result['transactions'] as $transaction) {
            // Process transaction data
            // Includes: trid, date, amount, payment_method, status
        }
    }
} catch (\Exception $e) {
    // handle exception
}
```

**Note:** For single-day queries, use the same date for both `start_date` and `end_date`.

## Callback Parameters

All payment callbacks receive the following parameters:

| Name          |       Type       | Description                    |
|---------------|:----------------:|--------------------------------|
| valor         |      float       | Payment amount                 |
| canal         |      string      | Channel identifier             |
| referencia    |      string      | Payment reference              |
| transacao     |      string      | Transaction ID                 |
| identificador |     integer      | External identifier            |
| mp            |      string      | Payment method code            |
| chave_api     |      string      | API key                        |
| data          | date:Y-m-d H:i:s | Transaction date               |
| entidade      |      string      | Entity code                    |
| comissao      |      float       | Commission                     |
| local         |      string      | Transaction location           |

## Events

The package dispatches events throughout the payment lifecycle.

### Reference Creation Events

- `MBReferenceCreated` / `MBReferenceCreationFailed`
- `MBWayReferenceCreated` / `MBWayReferenceCreationFailed`
- `CreditCardReferenceCreated` / `CreditCardReferenceCreationFailed`
- `CreditCardRecurrenceAuthorizationCreated` / `CreditCardRecurrenceAuthorizationCreationFailed`
- `CreditCardRecurringPaymentCreated` / `CreditCardRecurringPaymentCreationFailed`
- `GooglePayReferenceCreated` / `GooglePayReferenceCreationFailed`
- `ApplePayReferenceCreated` / `ApplePayReferenceCreationFailed`

### Payment Events

- `MBReferencePaid`
- `MBWayReferencePaid`
- `CreditCardReferencePaid`
- `GooglePayReferencePaid`
- `ApplePayReferencePaid`

### Expiration Events

- `MBReferenceExpired`
- `MBWayReferenceExpired`

### Callback Events

- `CallbackReceived` - Dispatched for all callbacks
- `InvalidCallbackReceived` - Dispatched when validation fails

### Listening to Events

**Auto-discovery (recommended):**

Create a listener class in `app/Listeners/` — Laravel automatically discovers it via the type-hinted `handle()` method:

```php
// app/Listeners/HandleMBPayment.php
namespace App\Listeners;

use DigitaldevLx\LaravelEupago\Events\MBReferencePaid;
use Illuminate\Support\Facades\Mail;

class HandleMBPayment
{
    public function handle(MBReferencePaid $event): void
    {
        $reference = $event->reference;

        $reference->mbable->update(['status' => 'paid']);

        Mail::to($reference->mbable->user)->send(
            new \App\Mail\PaymentConfirmed($reference)
        );
    }
}
```

No manual registration needed. Laravel scans `app/Listeners/` automatically.

**Manual registration:**

Register listeners in your `app/Providers/AppServiceProvider.php`:

```php
use DigitaldevLx\LaravelEupago\Events\MBReferencePaid;
use Illuminate\Support\Facades\Event;

public function boot(): void
{
    Event::listen(
        MBReferencePaid::class,
        SendPaymentConfirmationEmail::class,
    );
}
```

**Closure listeners:**

```php
use DigitaldevLx\LaravelEupago\Events\MBReferencePaid;
use Illuminate\Support\Facades\Event;

Event::listen(function (MBReferencePaid $event) {
    $reference = $event->reference;
    $reference->mbable->update(['status' => 'paid']);
});
```

## Commands

### Check Expired References

Check for expired payment references and dispatch expiration events:

```bash
php artisan eupago:check-expired
```

This command finds all MB references where `end_date` has passed and `state` is 0 (unpaid), then dispatches `MBReferenceExpired` event for each.

**Scheduling:**

**Laravel 11 & 12:**

Add to your `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('eupago:check-expired')->daily();
```

**Laravel 10:**

Add to your `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('eupago:check-expired')->daily();
}
```

## Testing

The package includes comprehensive test coverage using Pest PHP.

### Running Tests

```bash
# Run all tests
composer test

# Run with coverage (minimum 80% required)
composer test:coverage

# Run specific test file
vendor/bin/pest tests/Unit/MB/MBTest.php
```

### Code Style

```bash
# Fix code style with Pint
composer lint

# Check code style without fixing
composer lint:check
```

### Static Analysis

```bash
# Run Larastan Level 6 analysis
composer analyse
```

### Using Factories in Tests

```php
use DigitaldevLx\LaravelEupago\Models\MbReference;
use DigitaldevLx\LaravelEupago\Models\MbwayReference;
use DigitaldevLx\LaravelEupago\Models\CreditCardReference;
use DigitaldevLx\LaravelEupago\Models\GooglePayReference;
use DigitaldevLx\LaravelEupago\Models\ApplePayReference;

// Create unpaid reference
$reference = MbReference::factory()->create();

// Create paid reference
$paidReference = MbReference::factory()->paid()->create();

// Create expired reference
$expiredReference = MbReference::factory()->expired()->create();

// Other payment methods
$mbwayReference = MbwayReference::factory()->create();
$ccReference = CreditCardReference::factory()->paid()->create();
$googlePayReference = GooglePayReference::factory()->create();
$applePayReference = ApplePayReference::factory()->paid()->create();
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for details on recent changes.

## License

**digitaldev-lx/laravel-eupago** is open-sourced software licensed under the [MIT license](https://github.com/digitaldev-lx/laravel-eupago/blob/master/LICENSE).

## About DigitalDev

[DigitalDev](https://www.digitaldev.pt) is a digital transformation agency based in Lisbon, Portugal. We specialize in transforming ideas into digital solutions that drive business growth online.

With expertise in custom web development, system integration, DevOps, AI implementation, and advanced search systems, we help businesses scale beyond generic templates with practical, data-driven solutions. Our tech stack includes Laravel, Livewire, React, and modern cloud infrastructure.

**Contact:** geral@digitaldev.pt | +351 961 546 227
