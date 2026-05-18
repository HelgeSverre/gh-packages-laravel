# Laravel Nepali Payment Gateway

A comprehensive Laravel package for integrating Nepali payment gateways (eSewa, Khalti, and ConnectIps) with optional database tracking and payment management.

## Features

✅ **Multiple Gateway Support**
- eSewa integration
- Khalti integration  
- ConnectIps integration

✅ **Database Integration (Optional)**
- Track payment history
- Store gateway responses
- Polymorphic payment associations
- UUID support

✅ **Event System**
- Payment lifecycle events
- Custom event listeners

✅ **Query Scopes & Helpers**
- Easy payment retrieval
- Status filtering
- Gateway filtering

## Installation

Install the package via Composer:

```bash
composer require jaap-tech/laravel-nepali-payment
```

The package will auto-register the service provider.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=nepali-payment-config
```

This creates `config/nepali-payment.php` with the following structure:

```php
return [
    'esewa' => [
        'product_code' => env('ESEWA_PRODUCT_CODE'),
        'secret_key'   => env('ESEWA_SECRET_KEY'),
        'success_url'   => env('ESEWA_SUCCESS_URL'),
        'failure_url'   => env('ESEWA_FAILURE_URL'),
    ],
    'khalti' => [
        'secret_key' => env('KHALTI_SECRET_KEY'),
        'environment' => strtolower(env('KHALTI_ENVIRONMENT', 'test')),
        'success_url'   => env('KHALTI_SUCCESS_URL'),
        'website_url'   => env('KHALTI_WEBSITE_URL'),
    ],
    'connectips' => [
        'merchant_id' => env('CONNECTIPS_MERCHANT_ID'),
        'app_id' => env('CONNECTIPS_APP_ID'),
        'app_name' => env('CONNECTIPS_APP_NAME'),
        'private_key_path' => env('CONNECTIPS_PRIVATE_KEY_PATH'),
        'password' => env('CONNECTIPS_PASSWORD'),
        'environment' => strtolower(env('CONNECTIPS_ENVIRONMENT', 'test')),
    ],
    'database' => [
        'enabled' => env('NEPALI_PAYMENT_DATABASE_ENABLED', false),
    ],
];
```

### Environment Variables

Add these to your `.env` file:

**eSewa:**
```
ESEWA_PRODUCT_CODE=your_product_code
ESEWA_SECRET_KEY=your_secret_key
ESEWA_SUCCESS_URL=https://yourapp.com/payment/success # (optional)
ESEWA_FAILURE_URL=https://yourapp.com/payment/failure # (optional)
```

**Khalti:**
```
KHALTI_SECRET_KEY=your_secret_key
KHALTI_ENVIRONMENT=test  # or 'live'
KHALTI_SUCCESS_URL=https://yourapp.com/payment/success # (optional)
KHALTI_WEBSITE_URL=https://yourapp.com # (optional)
```

**ConnectIps:**
```
CONNECTIPS_MERCHANT_ID=your_merchant_id
CONNECTIPS_APP_ID=your_app_id
CONNECTIPS_APP_NAME=your_app_name
CONNECTIPS_PRIVATE_KEY_PATH=/path/to/private/key
CONNECTIPS_PASSWORD=your_password
CONNECTIPS_ENVIRONMENT=test  # or 'live'
```

**Database Integration:**
```
NEPALI_PAYMENT_DATABASE_ENABLED=true
```

## Quick Start

### Basic Payment Flow (Without Database)

```php
use NepaliPayment;

// Initiate eSewa payment
$response = NepaliPayment::esewa()->payment([
    'amount' => 1000,
    'transaction_uuid' => 'unique-id-123', # optional, can be generated automatically
    'success_url' => route('payment.success'), # optional, can be set in config
    'failure_url' => route('payment.failure'), # optional, can be set in config
]);

// Redirect to payment gateway
$response->redirect();
```

### With Database Integration

First, enable the database integration:

```bash
# 1. Publish migrations
php artisan vendor:publish --tag=nepali-payment-migrations

# 2. Run migrations
php artisan migrate

# 3. Enable in .env
NEPALI_PAYMENT_DATABASE_ENABLED=true
```

Now you can track payments:

```php
use NepaliPayment;

// Initiate payment with gateway
$response = NepaliPayment::esewa()->payment([
    'amount' => 1000,
    'transaction_uuid' => 'unique-id-123', # optional, can be generated automatically
    'success_url' => route('payment.success'), # optional, can be set in config
    'failure_url' => route('payment.failure'), # optional, can be set in config
]);

// Record verification
$verification = NepaliPayment::esewa()->verify([
    'total_amount' => 1000,
    'transaction_uuid' => 'same-unique-id-123',
]);
```

## Database Models

### Payment Model

The `Payment` model stores all payment records with full lifecycle tracking.

**Scopes:**

```php
// Find payment by reference ID
PaymentTransaction::byReference('ref-123')->first();

// Filter by gateway
PaymentTransaction::byGateway('esewa')->get();

// Filter by status
PaymentTransaction::byStatus('completed')->get();

// Completed payments only
PaymentTransaction::completed()->get();

// Failed payments only
PaymentTransaction::failed()->get();

// Pending/processing payments
PaymentTransaction::pending()->get();

// Filter by payable type and ID
PaymentTransaction::forPayable('App\Models\User', $userId)->get();
```

**Methods:**

```php
$payment = Payment::find($id);

// Check status
$payment->isCompleted();
$payment->isFailed();
$payment->isPending();

// Update status
$payment->markAsProcessing();
$payment->markAsCompleted();
$payment->markAsFailed('Reason for failure');
$payment->markAsCancelled();

// Relationships
$payment->payable;        // The associated model (User, Order, etc)
```

## Helper Functions

Quick helpers for common operations:

```php
// Check if database is enabled
nepali_payment_enabled();

// Find payments
nepali_payment_find('ref-123');                    // by reference

// Query payments
nepali_payment_get_by_status('completed')->paginate();
nepali_payment_get_by_gateway('khalti')->latest()->get();
```

## Events

The package dispatches events at key lifecycle points:

```php
use JaapTech\NepaliPayment\Events\{
    PaymentInitiatedEvent,
    PaymentProcessingEvent,
    PaymentCompletedEvent,
    PaymentFailedEvent,
};

// Listen to events in EventServiceProvider
protected $listen = [
    PaymentCompletedEvent::class => [
        \App\Listeners\SendPaymentConfirmation::class,
        \App\Listeners\UpdateUserBalance::class,
    ],
    PaymentFailedEvent::class => [
        \App\Listeners\NotifyPaymentFailure::class,
    ],
];

// Or listen inline
Event::listen(PaymentCompletedEvent::class, function ($event) {
    // $event->payment
});
```

## Verify Configuration

Check if all gateway configurations are valid:

```bash
php artisan nepali-payment:check
```

Output example:
```
Checking Nepali Payment Gateway Configuration:
- esewa: ✅ configured
- khalti: ✅ configured
- connectips: ⚠️  missing keys: environment
```

## Example: Complete Payment Flow

```php
// PaymentController.php
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use NepaliPayment;
use JaapTech\NepaliPayment\Models\PaymentTransaction;

class PaymentController extends Controller
{
    public function create(Order $order)
    {
        // Initiate payment with gateway
        $response = NepaliPayment::esewa()->payment([
            'amount' => $order->total,
            'transaction_uuid' => $payment->reference_id,
            'success_url' => route('payment.verify', $payment->id),
            'failure_url' => route('payment.failed', $payment->id),
        ]);

        return $response->redirect();
    }

    public function verify(PaymentTransaction $payment)
    {
        // Get gateway response
        $verification = NepaliPayment::esewa()->verify([
            'total_amount' => $payment->amount,
            'transaction_uuid' => $payment->reference_id,
        ]);

        if ($verification->isSuccess()) {
            NepaliPayment::completePayment(
                $payment,
                gatewayTransactionId: $payment->reference_id,
                responseData: $verification->toArray()
            );

            return redirect()->route('order.show', $payment->payable)
                ->with('success', 'Payment completed successfully!');
        } else {
            NepaliPayment::failPayment($payment, 'Gateway verification failed');

            return redirect()->route('payment.create', $payment->payable)
                ->with('error', 'Payment verification failed');
        }
    }

    public function failed(PaymentTransaction $payment)
    {
        NepaliPayment::failPayment($payment, 'User cancelled payment');
        
        return redirect()->route('payment.create', $payment->payable)
            ->with('error', 'Payment was cancelled');
    }
}
```

## Troubleshooting

**"Database integration is not enabled"** error
- Make sure `NEPALI_PAYMENT_DATABASE_ENABLED=true` in `.env`
- Run migrations: `php artisan migrate`

**"Missing config for nepali-payment"** error
- Check all required environment variables are set in `.env`
- Run: `php artisan nepali-payment:check`

**Payment not being saved to database**
- Verify database is enabled in config
- Check database connection is working
- Ensure migrations have been run

## License

This package is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, questions, or contributions, visit the [GitHub repository](https://github.com/aryanmalla19/laravel-nepali-payment).
