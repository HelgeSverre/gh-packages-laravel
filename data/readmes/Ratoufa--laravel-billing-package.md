# Laravel Billing

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ratoufa/laravel-billing.svg?style=flat-square)](https://packagist.org/packages/ratoufa/laravel-billing)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ratoufa/laravel-billing/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ratoufa/laravel-billing/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ratoufa/laravel-billing/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ratoufa/laravel-billing/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ratoufa/laravel-billing.svg?style=flat-square)](https://packagist.org/packages/ratoufa/laravel-billing)

A powerful Laravel billing package for payments and subscriptions, inspired by Laravel Cashier. Built specifically for West African markets with **FedaPay** integration, supporting Mobile Money (MTN, Moov, Togocel), one-time payments, recurring subscriptions, and marketplace features with commissions and payouts.

## Features

- **Multiple Payment Providers** - Extensible architecture with FedaPay as the default provider
- **Mobile Money Support** - MTN Mobile Money, Moov Money, Togocel T-Money with USSD Push
- **Subscriptions** - Full subscription lifecycle management with trials, grace periods, and plan swapping
- **One-time Payments** - Simple charge API for single payments
- **Marketplace Module** - Commission calculation, transaction tracking, and seller payouts
- **Webhook Handling** - Automatic webhook processing with signature verification
- **Multi-currency** - Support for XOF and other currencies
- **Localization** - French and English translations included

## Requirements

- PHP 8.4+
- Laravel 11.x or 12.x

## Installation

Install the package via Composer:

```bash
composer require ratoufa/laravel-billing
```

Run the install command to publish configuration and migrations:

```bash
php artisan billing:install
```

Or publish manually:

```bash
# Publish configuration
php artisan vendor:publish --tag="billing-config"

# Publish migrations
php artisan vendor:publish --tag="billing-migrations"

# Publish translations (optional)
php artisan vendor:publish --tag="billing-translations"
```

Run the migrations:

```bash
php artisan migrate
```

## Configuration

Add your FedaPay credentials to your `.env` file:

```env
BILLING_PROVIDER=fedapay

FEDAPAY_PUBLIC_KEY=pk_sandbox_xxxxxxxx
FEDAPAY_SECRET_KEY=sk_sandbox_xxxxxxxx
FEDAPAY_ENV=sandbox
FEDAPAY_CURRENCY=XOF
FEDAPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
```

### Full Configuration Options

```php
// config/billing.php

return [
    // Default billing provider
    'default' => env('BILLING_PROVIDER', 'fedapay'),

    // Provider configurations
    'providers' => [
        'fedapay' => [
            'driver' => 'fedapay',
            'public_key' => env('FEDAPAY_PUBLIC_KEY'),
            'secret_key' => env('FEDAPAY_SECRET_KEY'),
            'environment' => env('FEDAPAY_ENV', 'sandbox'),
            'currency' => env('FEDAPAY_CURRENCY', 'XOF'),
            'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),
        ],
    ],

    // Custom model classes (optional)
    'models' => [
        'plan' => \Ratoufa\Billing\Models\Plan::class,
        'subscription' => \Ratoufa\Billing\Models\Subscription::class,
        'payment' => \Ratoufa\Billing\Models\Payment::class,
    ],

    // Subscription settings
    'subscription' => [
        'grace_days' => 3,
        'retry' => [
            'enabled' => true,
            'max_attempts' => 3,
            'interval_hours' => 24,
        ],
    ],

    // Marketplace module (optional)
    'marketplace' => [
        'enabled' => false,
        'commission' => [
            'default_rate' => 0.10, // 10%
            'min_payout_amount' => 1000,
        ],
        'payout' => [
            'mode' => 'instant', // or 'batch'
        ],
    ],
];
```

## Basic Usage

### Setting Up the Billable Model

Add the `Billable` trait to your User model (or any model that can make payments):

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Ratoufa\Billing\Concerns\Billable;

final class User extends Authenticatable
{
    use Billable;

    // ...
}
```

Add the required columns to your users table:

```php
// In a migration
Schema::table('users', function (Blueprint $table) {
    $table->string('billing_provider')->nullable();
    $table->string('billing_provider_id')->nullable();
    $table->string('phone')->nullable();
});
```

### Creating Plans

Create subscription plans in your database:

```php
use Ratoufa\Billing\Models\Plan;

$plan = Plan::create([
    'name' => 'Pro Plan',
    'slug' => 'pro',
    'description' => 'Access to all features',
    'price' => 5000, // 5000 XOF
    'currency' => 'XOF',
    'interval' => 'month',
    'interval_count' => 1,
    'is_active' => true,
]);
```

## Subscriptions

### Creating a Subscription

```php
// Create a subscription with a trial period
$user->newSubscription('default', 'pro')
    ->trialDays(14)
    ->create();

// Or with a specific plan model
$plan = Plan::where('slug', 'pro')->first();
$user->newSubscription('default', $plan)->create();

// With additional metadata
$user->newSubscription('default', 'pro')
    ->withMetadata(['campaign' => 'launch'])
    ->create();
```

### Checking Subscription Status

```php
// Check if the user has a valid subscription
if ($user->subscribed('default')) {
    // User has an active subscription
}

// Check for a specific plan
if ($user->subscribed('default', 'pro')) {
    // User is subscribed to the pro plan
}

// Other status checks
$user->onTrial('default');       // Is on trial?
$user->onGracePeriod('default'); // Is in grace period after cancellation?
$user->hasActiveSubscription();  // Has any active subscription?

// Get the subscription instance
$subscription = $user->subscription('default');
$subscription->active();    // Is active?
$subscription->cancelled(); // Is cancelled?
$subscription->pastDue();   // Is past due?
$subscription->paused();    // Is paused?
```

### Managing Subscriptions

```php
$subscription = $user->subscription('default');

// Cancel at end of billing period
$subscription->cancel();

// Cancel immediately
$subscription->cancelNow();

// Resume a cancelled subscription (during grace period)
$subscription->resume();

// Pause a subscription
$subscription->pause();

// Unpause
$subscription->unpause();

// Swap to a different plan
$subscription->swap('premium');
// or
$subscription->swap($premiumPlan);
```

### Subscription Events

The package dispatches events for subscription lifecycle:

```php
use Ratoufa\Billing\Events\SubscriptionCreated;
use Ratoufa\Billing\Events\SubscriptionCancelled;
use Ratoufa\Billing\Events\SubscriptionResumed;
use Ratoufa\Billing\Events\SubscriptionSwapped;

// In EventServiceProvider
protected $listen = [
    SubscriptionCreated::class => [
        SendWelcomeEmail::class,
    ],
    SubscriptionCancelled::class => [
        SendCancellationEmail::class,
    ],
];
```

## One-Time Payments

### Creating a Payment

```php
// Create a payment and get checkout URL
$paymentIntent = $user->pay(5000, [
    'description' => 'Product purchase',
    'return_url' => route('payment.success'),
]);

// Redirect to checkout
return redirect($paymentIntent['checkout_url']);

// Or get just the checkout URL
$checkoutUrl = $user->getCheckoutUrl(5000, [
    'description' => 'Product purchase',
]);
```

### Direct Charge

```php
// Create a payment record
$payment = $user->charge(5000, [
    'description' => 'One-time purchase',
]);
```

## Mobile Money Payments (USSD Push)

For direct Mobile Money payments with USSD push (customer receives a prompt on their phone):

```php
use Ratoufa\Billing\Facades\Billing;

// Auto-detect operator from phone number
$result = Billing::chargeWithMobileMoney(
    billable: $user,
    amount: 5000,
    phoneNumber: '+22890123456'
);

// Specify operator manually
$result = Billing::chargeWithMobileMoney(
    billable: $user,
    amount: 5000,
    phoneNumber: '+22890123456',
    mode: 'mtn_open' // mtn_open, moov_tg, togocel, etc.
);

// Access the result
$result->paymentId;  // Payment record ID
$result->mode;       // Mobile Money mode used
$result->modeName;   // Human-readable name
$result->message;    // Message to show user
```

### Supported Mobile Money Operators

| Mode | Operator | Countries |
|------|----------|-----------|
| `mtn_open` | MTN Mobile Money | Benin, Ivory Coast, Cameroon |
| `mtn_ci` | MTN Ivory Coast | Ivory Coast |
| `moov_bj` | Moov Money | Benin |
| `moov_tg` | Moov Money | Togo |
| `togocel` | T-Money | Togo |

## Customer Management

```php
// Create customer in the billing provider
$customerId = $user->createAsCustomer([
    'phone' => '+22890123456',
]);

// Update customer information
$user->updateCustomer([
    'phone' => '+22890123456',
]);

// Sync (create or update)
$user->syncCustomer();
```

## Webhooks

The package automatically registers webhook routes. Configure your webhook endpoint in your payment provider:

```
https://your-app.com/billing/webhook/fedapay
```

### Webhook Events

```php
use Ratoufa\Billing\Events\PaymentSucceeded;
use Ratoufa\Billing\Events\PaymentFailed;

protected $listen = [
    PaymentSucceeded::class => [
        ActivateUserAccess::class,
    ],
    PaymentFailed::class => [
        NotifyUserOfFailure::class,
    ],
];
```

### Webhook Signature Verification

Enable signature verification in production:

```env
BILLING_VERIFY_WEBHOOK_SIGNATURE=true
FEDAPAY_WEBHOOK_SECRET=whsec_your_secret
```

## Recurring Payments (Scheduler)

Process recurring subscription payments with the Artisan command:

```bash
# Process all due subscriptions
php artisan billing:process-payments

# Dry run (see what would be processed)
php artisan billing:process-payments --dry-run

# Limit number of subscriptions
php artisan billing:process-payments --limit=100
```

Add to your scheduler (`app/Console/Kernel.php`):

```php
$schedule->command('billing:process-payments')->daily();
```

## Marketplace Module

Enable the marketplace module for handling commissions and seller payouts.

### Configuration

```env
BILLING_MARKETPLACE_ENABLED=true
BILLING_COMMISSION_RATE=0.10
BILLING_MIN_PAYOUT=1000
BILLING_PAYOUT_MODE=instant
```

### Setting Up Sellers

Add the `Commissionable` trait to your seller/organization model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Ratoufa\Billing\Concerns\Commissionable;

final class Organization extends Model
{
    use Commissionable;

    protected $fillable = [
        'name',
        'payout_phone',
        'payout_name',
        // ...
    ];
}
```

### Recording Sales with Commissions

```php
use Ratoufa\Billing\Services\CommissionCalculator;

$calculator = app(CommissionCalculator::class);

// Calculate commission
$commission = $calculator->calculate(
    grossAmount: 10000,
    commissionRate: 0.10 // 10% platform fee
);

// $commission->grossAmount     = 10000
// $commission->commissionRate  = 0.10
// $commission->commissionAmount = 1000
// $commission->netAmount       = 9000

// Record the transaction
$transaction = $organization->recordTransaction($commission, [
    'customer_email' => 'customer@example.com',
    'provider_transaction_id' => 'txn_123',
]);
```

### Seller Earnings

```php
// Get pending payout amount
$pending = $organization->pendingPayoutAmount();

// Get total earnings
$total = $organization->totalEarnings();

// Get total paid out
$paidOut = $organization->totalPaidOut();

// Get transactions awaiting payout
$transactions = $organization->transactionsAwaitingPayout();
```

### Processing Payouts

```php
use Ratoufa\Billing\Services\InstantPayoutService;
use Ratoufa\Billing\Data\PayoutData;
use Ratoufa\Billing\Enums\PayoutMethodEnum;

$payoutService = app(InstantPayoutService::class);

// Create and process a payout
$payoutData = new PayoutData(
    amount: $organization->pendingPayoutAmount(),
    currency: 'XOF',
    method: PayoutMethodEnum::MobileMoney,
    recipientPhone: $organization->payout_phone,
    recipientName: $organization->payout_name,
);

$payout = $payoutService->processPayout($organization, $payoutData);
```

### Batch Payout Processing

```bash
# Process scheduled payouts
php artisan billing:process-payouts

# Dry run
php artisan billing:process-payouts --dry-run
```

### Payout Events

```php
use Ratoufa\Billing\Events\PayoutCompleted;
use Ratoufa\Billing\Events\PayoutFailed;
use Ratoufa\Billing\Events\SaleCompleted;

protected $listen = [
    SaleCompleted::class => [
        NotifySellerOfSale::class,
    ],
    PayoutCompleted::class => [
        NotifySellerOfPayout::class,
    ],
];
```

## Using the Facade

```php
use Ratoufa\Billing\Facades\Billing;

// Get the default provider
$provider = Billing::driver();

// Use a specific provider
$provider = Billing::driver('fedapay');

// Create a payment intent
$intent = Billing::createPaymentIntent($user, 5000, [
    'description' => 'Purchase',
]);

// Check provider capabilities
Billing::supportsRecurringPayments(); // bool
Billing::supportsPaymentMethods();    // bool
```

## Extending with Custom Providers

Create a custom billing provider:

```php
<?php

namespace App\Billing\Providers;

use Ratoufa\Billing\Providers\AbstractProvider;
use Illuminate\Database\Eloquent\Model;

final class CustomProvider extends AbstractProvider
{
    public function name(): string
    {
        return 'custom';
    }

    public function createCustomer(Model $billable, array $options = []): string
    {
        // Implementation
    }

    public function charge(Model $billable, int $amount, array $options = []): Payment
    {
        // Implementation
    }

    public function createPaymentIntent(Model $billable, int $amount, array $options = []): array
    {
        // Implementation
    }

    // ... implement other methods
}
```

Register your provider in a service provider:

```php
use Ratoufa\Billing\BillingManager;

public function boot(): void
{
    $this->app->extend(BillingManager::class, function (BillingManager $manager) {
        $manager->extend('custom', function ($config) {
            return new CustomProvider($config);
        });

        return $manager;
    });
}
```

## Testing

```bash
# Run all tests
composer test

# Run specific test suites
composer test:unit          # Pest tests
composer test:types         # PHPStan analysis
composer test:lint          # Pint code style
composer test:type-coverage # Type coverage (100%)

# Fix code style
composer lint
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Just Chris](https://github.com/justchr1s)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
