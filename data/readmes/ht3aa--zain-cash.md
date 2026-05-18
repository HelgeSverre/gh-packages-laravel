# ZainCash Integration For Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ht3aa/zain-cash.svg?style=flat-square)](https://packagist.org/packages/ht3aa/zain-cash)
[![Total Downloads](https://img.shields.io/packagist/dt/ht3aa/zain-cash.svg?style=flat-square)](https://packagist.org/packages/ht3aa/zain-cash)

A comprehensive Laravel package for integrating ZainCash payment gateway into your application. This package provides a simple and elegant way to handle payment transactions, webhooks, and transaction tracking with ZainCash.

![ZainCash Delivery Integration For Laravel](image.png)

## Features

- ✅ Easy integration with ZainCash payment gateway
- ✅ Automatic transaction tracking and management
- ✅ Polymorphic relationships - link transactions to any order model
- ✅ Webhook handling for payment status updates
- ✅ Check transaction status with ZainCash API
- ✅ Support for both production and test environments
- ✅ JWT token generation and validation
- ✅ Database transaction logging
- ✅ Custom webhook URL support
- ✅ Built-in error handling and logging

## Installation

You can install the package via composer:

```bash
composer require ht3aa/zain-cash
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="zain-cash-config"
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="zain-cash-migrations"
php artisan migrate
```

## Configuration

Add the following environment variables to your `.env` file:

```env
ZAIN_CASH_IS_PRODUCTION=false
ZAIN_CASH_MERCHANT_ID=your_merchant_id
ZAIN_CASH_MERCHANT_SECRET=your_merchant_secret
ZAIN_CASH_MSISDN=your_msisdn
ZAIN_CASH_WEBHOOK_URL="${APP_URL}/api/zain-cash/webhook"
ZAIN_CASH_CUSTOM_WEBHOOK_URL=
```

### Configuration Options

- `ZAIN_CASH_IS_PRODUCTION`: Set to `true` for production environment, `false` for testing
- `ZAIN_CASH_MERCHANT_ID`: Your ZainCash merchant ID
- `ZAIN_CASH_MERCHANT_SECRET`: Your ZainCash merchant secret key
- `ZAIN_CASH_MSISDN`: Your registered mobile number with ZainCash
- `ZAIN_CASH_WEBHOOK_URL`: The URL where ZainCash will send payment status updates
- `ZAIN_CASH_CUSTOM_WEBHOOK_URL`: (Optional) Custom URL to receive payment notifications in your app

## Usage

### Creating a Payment Transaction

To initiate a payment transaction, create a new `ZainCashTransaction` instance and pass it to the `initiateTransaction` method.

#### Basic Usage (Simple Order ID)

```php
use Ht3aa\ZainCash\Models\ZainCashTransaction;
use Ht3aa\ZainCash\Facades\ZainCash;

// Create a new transaction with simple order ID
$transaction = ZainCashTransaction::create([
    'amount' => 10000, // Amount in IQD (e.g., 10000 IQD)
    'service_type' => 'Product Purchase',
    'order_id' => 'ORDER-' . uniqid(),
    'redirect_url' => route('payment.callback'),
]);

// Initiate the transaction with ZainCash
$transaction = ZainCash::initiateTransaction($transaction);
$transaction->save();

// Redirect user to payment page
return redirect($transaction->payment_redirect_url);
```

#### Advanced Usage (Polymorphic Relationship)

Link the transaction directly to your Order model using polymorphic relationships:

```php
use App\Models\Order;
use Ht3aa\ZainCash\Models\ZainCashTransaction;
use Ht3aa\ZainCash\Facades\ZainCash;

// Create an order first
$order = Order::create([
    'user_id' => auth()->id(),
    'total' => 10000,
    // ... other order fields
]);

// Create a transaction linked to the order
$transaction = ZainCashTransaction::create([
    'amount' => $order->total,
    'service_type' => 'Product Purchase',
    'order_id' => $order->id,
    'order_type' => Order::class,
    'redirect_url' => route('payment.callback'),
]);

// Initiate the transaction with ZainCash
$transaction = ZainCash::initiateTransaction($transaction);
$transaction->save();

// Redirect user to payment page
return redirect($transaction->payment_redirect_url);
```

Now you can access the order from the transaction:

```php
$transaction = ZainCashTransaction::find(1);
$order = $transaction->order; // Returns the Order model instance
```

### Transaction Model

The `ZainCashTransaction` model includes the following attributes:

- `amount`: Payment amount in IQD
- `service_type`: Description of the service/product
- `order_id`: Unique order identifier (can be string or model ID for polymorphic relationship)
- `order_type`: Model class name for polymorphic relationship (e.g., `App\Models\Order`)
- `redirect_url`: URL to redirect after payment
- `token`: JWT token for the transaction
- `iat`: Token issued at timestamp
- `exp`: Token expiration timestamp
- `zain_cash_response`: Full response from ZainCash API
- `status`: Transaction status (pending, completed, failed, etc.)
- `payment_redirect_url`: URL to redirect user for payment
- `transaction_id`: ZainCash transaction ID

#### Polymorphic Relationship

The model includes a polymorphic `order()` relationship that allows you to link transactions to any order model:

```php
// Access the related order
$transaction = ZainCashTransaction::find(1);
$order = $transaction->order;

// Define inverse relationship in your Order model
class Order extends Model
{
    public function zainCashTransactions()
    {
        return $this->morphMany(ZainCashTransaction::class, 'order');
    }
}
```

### Webhook Handling

The package automatically registers a webhook route at `/api/zain-cash/webhook` to handle payment status updates from ZainCash.

When a payment is completed, ZainCash will send a callback to this URL with the transaction status. The webhook controller will:

1. Decode the JWT token from ZainCash
2. Update the transaction status in your database
3. (Optional) Forward the notification to your custom webhook URL

### Custom Webhook Notifications

If you want to receive notifications in your own application when a payment status is updated, set the `ZAIN_CASH_CUSTOM_WEBHOOK_URL` in your `.env` file:

```env
ZAIN_CASH_CUSTOM_WEBHOOK_URL=https://yourapp.com/api/payment-notification
```

The package will POST to this URL with the following payload:

```json
{
    "zain_cash_transaction_id": 123
}
```

You can then create your own controller to handle this:

```php
use Ht3aa\ZainCash\Models\ZainCashTransaction;

public function handlePaymentNotification(Request $request)
{
    $transaction = ZainCashTransaction::find($request->zain_cash_transaction_id);
    
    if ($transaction->status === 'success') {
        // Payment successful - update your order, send confirmation email, etc.
    } else {
        // Payment failed - handle accordingly
    }
}
```

### Checking Transaction Status

#### From Local Database

You can check the status of a transaction from your local database:

```php
use Ht3aa\ZainCash\Models\ZainCashTransaction;

$transaction = ZainCashTransaction::where('transaction_id', 'TRANS-123')->first();

if ($transaction->status === 'success') {
    // Payment completed
} elseif ($transaction->status === 'pending') {
    // Payment still pending
} else {
    // Payment failed or cancelled
}
```

#### From ZainCash API

You can also verify the transaction status directly from ZainCash API:

```php
use Ht3aa\ZainCash\Facades\ZainCash;

// Check transaction status from ZainCash
$response = ZainCash::checkTransaction('TRANS-123');

// Response includes:
// - id: Transaction ID
// - status: Current status
// - amount: Transaction amount
// - orderId: Your order ID
// ... other transaction details
```

This is useful for:
- Verifying payment status before fulfilling orders
- Reconciling payments with ZainCash
- Handling edge cases where webhook might have failed

### Using the Facade

The package provides a facade for easy access to all methods:

```php
use Ht3aa\ZainCash\Facades\ZainCash;

// Initiate a transaction
$transaction = ZainCash::initiateTransaction($zainCashTransaction);

// Check transaction status
$response = ZainCash::checkTransaction('transaction_id');
```

## Complete Example Flow

Here's a complete example of a payment flow with polymorphic relationships:

```php
use App\Models\Order;
use Ht3aa\ZainCash\Models\ZainCashTransaction;
use Ht3aa\ZainCash\Facades\ZainCash;
use Illuminate\Support\Facades\Mail;

// 1. Create order and initiate payment
public function initiatePayment(Request $request)
{
    // Create the order
    $order = Order::create([
        'user_id' => auth()->id(),
        'total' => $request->amount,
        'status' => 'pending',
    ]);

    // Create transaction linked to order
    $transaction = ZainCashTransaction::create([
        'amount' => $order->total,
        'service_type' => 'Product Purchase',
        'order_id' => $order->id,
        'order_type' => Order::class,
        'redirect_url' => route('payment.callback'),
    ]);

    // Initiate with ZainCash
    $transaction = ZainCash::initiateTransaction($transaction);
    $transaction->save();

    // Redirect user to payment page
    return redirect($transaction->payment_redirect_url);
}

// 2. Handle callback (optional - webhook handles status updates automatically)
public function paymentCallback(Request $request)
{
    return view('payment.processing', [
        'message' => 'Processing your payment...'
    ]);
}

// 3. Handle custom webhook notification
public function handlePaymentNotification(Request $request)
{
    $transaction = ZainCashTransaction::with('order')
        ->find($request->zain_cash_transaction_id);
    
    if ($transaction->status === 'success') {
        // Update order status using the polymorphic relationship
        $order = $transaction->order;
        $order->update([
            'status' => 'paid',
            'payment_status' => 'completed'
        ]);
            
        // Send confirmation email
        Mail::to($order->user)->send(new PaymentConfirmation($transaction));
        
        // Optional: Verify with ZainCash API
        $verification = ZainCash::checkTransaction($transaction->transaction_id);
        
        if ($verification['status'] === 'success') {
            // Process order fulfillment
        }
    } else {
        // Handle failed payment
        $transaction->order->update(['status' => 'payment_failed']);
    }
    
    return response()->json(['message' => 'Notification received']);
}

// 4. Check payment status (e.g., from admin panel)
public function checkPaymentStatus($transactionId)
{
    $transaction = ZainCashTransaction::where('transaction_id', $transactionId)->first();
    
    // Verify with ZainCash API
    $response = ZainCash::checkTransaction($transactionId);
    
    // Update local status if different
    if ($response['status'] !== $transaction->status) {
        $transaction->update(['status' => $response['status']]);
    }
    
    return response()->json([
        'local_status' => $transaction->status,
        'zaincash_status' => $response['status'],
        'order' => $transaction->order
    ]);
}
```

### Setting Up Your Order Model

To use polymorphic relationships, add the inverse relationship to your Order model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Ht3aa\ZainCash\Models\ZainCashTransaction;

class Order extends Model
{
    protected $fillable = ['user_id', 'total', 'status', 'payment_status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function zainCashTransactions()
    {
        return $this->morphMany(ZainCashTransaction::class, 'order');
    }
    
    public function latestZainCashTransaction()
    {
        return $this->morphOne(ZainCashTransaction::class, 'order')->latestOfMany();
    }
}
```

Now you can easily access transactions from orders:

```php
$order = Order::find(1);

// Get all ZainCash transactions for this order
$transactions = $order->zainCashTransactions;

// Get the latest transaction
$latestTransaction = $order->latestZainCashTransaction;

// Check payment status
if ($latestTransaction->status === 'success') {
    // Order is paid
}
```

## Testing

The package includes test credentials for the ZainCash sandbox environment. Make sure `ZAIN_CASH_IS_PRODUCTION` is set to `false` when testing.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Hasan Tahseen](https://github.com/ht3aa)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
