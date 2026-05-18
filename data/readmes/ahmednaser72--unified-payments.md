# Laravel Payments Package

A unified Laravel payment gateway package supporting **MyFatoorah** and **UPayments** (standard and multi-vendor modes). Built with clean architecture, comprehensive testing, and full support for Laravel 7 through Laravel 12+.

## Features

- ✅ **Unified API**: Single interface for multiple payment gateways
- ✅ **MyFatoorah Support**: Full integration with MyFatoorah payment gateway
- ✅ **UPayments Support**: Standard and multi-vendor modes (single vendor per project)
- ✅ **Complete Payment Flow**: Initiate, status check, refunds, callbacks, and webhooks
- ✅ **Laravel 7-12+ Compatible**: Works across all modern Laravel versions
- ✅ **Clean Architecture**: Well-structured, maintainable codebase
- ✅ **Comprehensive Testing**: Unit and integration tests included
- ✅ **Event-Driven**: Dispatches events for payment lifecycle
- ✅ **Web & API Ready**: Works seamlessly in both web and API contexts

## Installation

Install the package via Composer:

```bash
composer require unified/payments
```

### Publish Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=payments-config
```

This will create `config/payments.php` in your application.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Default Gateway
PAYMENT_DEFAULT_GATEWAY=myfatoorah

# MyFatoorah Configuration
MYFATOORAH_API_KEY=your-api-key
MYFATOORAH_BASE_URL=https://api.myfatoorah.com
MYFATOORAH_TEST_MODE=true
MYFATOORAH_WEBHOOK_SECRET=your-webhook-secret

# UPayments Standard Mode
UPAYMENTS_MODE=standard
UPAYMENTS_API_KEY=your-api-key
UPAYMENTS_MERCHANT_ID=your-merchant-id
UPAYMENTS_BASE_URL=https://api.upayments.com
UPAYMENTS_TEST_MODE=true
UPAYMENTS_WEBHOOK_SECRET=your-webhook-secret

# UPayments Multi-Vendor Mode
UPAYMENTS_MODE=multi_vendor
UPAYMENTS_PARENT_API_KEY=parent-api-key
UPAYMENTS_PARENT_MERCHANT_ID=parent-merchant-id
UPAYMENTS_VENDOR_IBAN=KW91KFHO1122334455611223344556
UPAYMENTS_VENDOR_KNET_CHARGE=5
UPAYMENTS_VENDOR_KNET_CHARGE_TYPE=percentage
UPAYMENTS_VENDOR_CC_CHARGE=10
UPAYMENTS_VENDOR_CC_CHARGE_TYPE=percentage
UPAYMENTS_SHOW_SUB_MERCHANT_DETAILS=false
UPAYMENTS_BASE_URL=https://api.upayments.com
UPAYMENTS_TEST_MODE=true
UPAYMENTS_WEBHOOK_SECRET=your-webhook-secret
```

### Configuration File Structure

The `config/payments.php` file includes:

- **Default Gateway**: Set your preferred default gateway
- **Gateway Configurations**: Individual settings for each gateway
- **HTTP Settings**: Timeout, retry attempts, logging
- **Webhook Settings**: Signature verification configuration

## Usage

### Complete Examples

#### Example 1: Web Application - Full Payment Flow

```php
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;
use Tocaan\Payments\DTO\PaymentStatusRequest;
use Tocaan\Payments\DTO\RefundRequest;
use Tocaan\Payments\Exceptions\PaymentException;

class PaymentController extends Controller
{
    /**
     * Initiate payment for an order
     */
    public function initiate(Request $request, Order $order)
    {
        try {
            // Validate order
            if ($order->status !== 'pending') {
                return back()->with('error', 'Order cannot be paid');
            }

            // Create payment request
            $paymentRequest = new InitiatePaymentRequest(
                amount: $order->total,
                currency: $order->currency ?? 'KWD',
                orderId: $order->id,
                options: [
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'return_url' => route('payment.return', ['gateway' => 'myfatoorah']),
                    'cancel_url' => route('payment.cancel'),
                    'callback_url' => route('payment.webhook', ['gateway' => 'myfatoorah']),
                    'metadata' => [
                        'order_id' => $order->id,
                        'customer_id' => $order->customer_id,
                        'description' => "Order #{$order->id}",
                    ],
                ]
            );

            // Initiate payment using default gateway
            $response = Payment::initiate($paymentRequest);

            // Update order with transaction ID
            $order->update([
                'transaction_id' => $response->transactionId,
                'payment_status' => 'pending',
            ]);

            // Redirect to payment gateway
            if ($response->requiresRedirect()) {
                return redirect($response->paymentUrl);
            }

            return back()->with('error', 'Failed to initiate payment');

        } catch (PaymentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Check payment status manually
     */
    public function checkStatus(Order $order)
    {
        try {
            if (!$order->transaction_id) {
                return response()->json(['error' => 'No transaction ID'], 400);
            }

            $statusRequest = new PaymentStatusRequest(
                transactionId: $order->transaction_id,
                options: [
                    'order_id' => $order->id,
                ]
            );

            $status = Payment::status($statusRequest);

            // Update order status
            if ($status->isSuccessful()) {
                $order->update(['payment_status' => 'paid', 'paid_at' => now()]);
            } elseif ($status->isFailed()) {
                $order->update(['payment_status' => 'failed']);
            }

            return response()->json([
                'status' => $status->status,
                'amount' => $status->amount,
                'currency' => $status->currency,
                'failure_reason' => $status->failureReason,
            ]);

        } catch (PaymentException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create refund for an order
     */
    public function refund(Request $request, Order $order)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $order->total,
            'reason' => 'required|string|max:255',
        ]);

        try {
            if (!$order->transaction_id) {
                return back()->with('error', 'No transaction ID found');
            }

            if ($order->payment_status !== 'paid') {
                return back()->with('error', 'Order is not paid');
            }

            $refundRequest = new RefundRequest(
                transactionId: $order->transaction_id,
                amount: $request->amount,
                options: [
                    'reason' => $request->reason,
                    'invoice_id' => $order->transaction_id,
                ]
            );

            $refund = Payment::refund($refundRequest);

            if ($refund->isSuccessful()) {
                // Create refund record
                $order->refunds()->create([
                    'refund_id' => $refund->refundId,
                    'amount' => $request->amount,
                    'reason' => $request->reason,
                    'status' => 'completed',
                ]);

                return back()->with('success', 'Refund processed successfully');
            }

            return back()->with('error', 'Refund failed: ' . ($refund->failureReason ?? 'Unknown error'));

        } catch (PaymentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
```

#### Example 2: API Application - RESTful Payment Endpoints

```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;
use Tocaan\Payments\DTO\PaymentStatusRequest;
use Tocaan\Payments\DTO\RefundRequest;
use Tocaan\Payments\Exceptions\AuthenticationException;
use Tocaan\Payments\Exceptions\ValidationException;
use Tocaan\Payments\Exceptions\TransportException;
use Tocaan\Payments\Exceptions\ProviderException;

class PaymentApiController extends Controller
{
    /**
     * POST /api/payments/initiate
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'gateway' => 'nullable|in:myfatoorah,upayments',
        ]);

        try {
            $gateway = $request->input('gateway') ?? config('payments.default');
            
            $paymentRequest = new InitiatePaymentRequest(
                amount: $request->amount,
                currency: $request->currency,
                orderId: $request->order_id,
                options: [
                    'customer_name' => $request->customer_name,
                    'customer_email' => $request->customer_email,
                    'customer_phone' => $request->customer_phone,
                    'return_url' => $request->input('return_url'),
                    'cancel_url' => $request->input('cancel_url'),
                    'callback_url' => $request->input('callback_url'),
                    'metadata' => $request->input('metadata', []),
                ]
            );

            $response = Payment::driver($gateway)->initiate($paymentRequest);

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_id' => $response->transactionId,
                    'payment_url' => $response->paymentUrl,
                    'invoice_id' => $response->invoiceId,
                    'requires_redirect' => $response->requiresRedirect(),
                ],
            ], 201);

        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Authentication failed',
                'message' => $e->getMessage(),
            ], 401);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
            ], 400);

        } catch (TransportException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Network error',
                'message' => $e->getMessage(),
            ], 503);

        } catch (ProviderException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Payment gateway error',
                'message' => $e->getMessage(),
                'provider_response' => $e->getProviderResponse(),
            ], 502);
        }
    }

    /**
     * GET /api/payments/status/{transactionId}
     */
    public function status(string $transactionId, Request $request): JsonResponse
    {
        try {
            $gateway = $request->input('gateway') ?? config('payments.default');
            
            $statusRequest = new PaymentStatusRequest(
                transactionId: $transactionId,
                options: [
                    'order_id' => $request->input('order_id'),
                ]
            );

            $status = Payment::driver($gateway)->status($statusRequest);

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_id' => $status->transactionId,
                    'status' => $status->status,
                    'amount' => $status->amount,
                    'currency' => $status->currency,
                    'order_id' => $status->orderId,
                    'is_successful' => $status->isSuccessful(),
                    'is_pending' => $status->isPending(),
                    'is_failed' => $status->isFailed(),
                    'failure_reason' => $status->failureReason,
                ],
            ]);

        } catch (PaymentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/payments/refund
     */
    public function refund(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'gateway' => 'nullable|in:myfatoorah,upayments',
        ]);

        try {
            $gateway = $request->input('gateway') ?? config('payments.default');
            
            $refundRequest = new RefundRequest(
                transactionId: $request->transaction_id,
                amount: $request->amount,
                options: [
                    'reason' => $request->reason,
                    'invoice_id' => $request->input('invoice_id'),
                ]
            );

            $refund = Payment::driver($gateway)->refund($refundRequest);

            return response()->json([
                'success' => $refund->isSuccessful(),
                'data' => [
                    'refund_id' => $refund->refundId,
                    'transaction_id' => $refund->transactionId,
                    'status' => $refund->status,
                    'amount' => $refund->amount,
                    'is_successful' => $refund->isSuccessful(),
                    'is_pending' => $refund->isPending(),
                    'is_failed' => $refund->isFailed(),
                    'failure_reason' => $refund->failureReason,
                ],
            ], $refund->isSuccessful() ? 200 : 400);

        } catch (PaymentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

#### Example 3: Using Specific Gateway

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

// MyFatoorah
$request = new InitiatePaymentRequest(/* ... */);
$response = Payment::driver('myfatoorah')->initiate($request);

// UPayments Standard
$response = Payment::driver('upayments')->initiate($request);

// UPayments Multi-Vendor (automatically used if mode is set to multi_vendor)
$response = Payment::driver('upayments')->initiate($request);
```

### Web Integration

The package provides built-in routes and controllers for handling payment returns and webhooks.

#### Built-in Routes

The package automatically registers these routes:

```php
// Return URL (GET)
Route::get('/payments/return/{gateway}', [PaymentReturnController::class, 'handle'])
    ->name('payments.return');

// Webhook URL (POST)
Route::post('/payments/webhook/{gateway}', [PaymentWebhookController::class, 'handle'])
    ->name('payments.webhook');
```

#### Return URL Handler

When a customer returns from the payment gateway, they'll be redirected to:

```
/payments/return/{gateway}
```

**Example URLs:**
- `/payments/return/myfatoorah`
- `/payments/return/upayments`

**The controller automatically:**
- Validates the gateway parameter
- Verifies the payment signature
- Dispatches `PaymentSucceeded` or `PaymentFailed` events
- Handles both JSON and HTML responses
- Redirects to success/cancel URLs with flash messages

**Custom Return Handler Example:**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\ReturnVerificationRequest;

class CustomPaymentReturnController extends Controller
{
    public function handle(Request $request, $gateway)
    {
        try {
            $verificationRequest = ReturnVerificationRequest::fromRequest($request);
            $result = Payment::driver($gateway)->verifyReturn($verificationRequest);

            if ($result->isSuccessful()) {
                // Update your order
                $order = Order::where('transaction_id', $result->transactionId)->first();
                if ($order) {
                    $order->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }

                // Redirect based on request type
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'transaction_id' => $result->transactionId,
                    ]);
                }

                return redirect()->route('orders.show', $order)
                    ->with('success', 'Payment completed successfully');
            }

            // Handle failed payment
            return redirect()->route('orders.show', $order)
                ->with('error', $result->failureReason ?? 'Payment failed');

        } catch (\Exception $e) {
            \Log::error('Payment return error: ' . $e->getMessage());
            return redirect()->route('home')
                ->with('error', 'Payment verification failed');
        }
    }
}
```

#### Webhook Handler

Configure your webhook URL in the payment gateway dashboard:

```
/payments/webhook/{gateway}
```

**Example URLs:**
- `https://yourdomain.com/payments/webhook/myfatoorah`
- `https://yourdomain.com/payments/webhook/upayments`

**The controller automatically:**
- Validates the gateway parameter
- Verifies webhook signature
- Dispatches appropriate events (`PaymentSucceeded`, `PaymentFailed`, `RefundSucceeded`)
- Returns proper HTTP responses (200 for success, 401 for invalid signature)

#### Webhook Data Structure

**UPayments Webhook Data** ([Reference](https://developers.upayments.com/reference/webhook)):

```php
// Success webhook payload
[
    'payment_id' => '12345',
    'result' => 'captured', // or 'authorized', 'failed', 'cancelled'
    'post_date' => '2024-01-01 12:00:00',
    'tran_id' => 'TXN123456',
    'ref' => 'REF123',
    'track_id' => '019ae3cc7da914644b7efd5638cdc83fv2', // Use this for status check
    'auth' => 'AUTH123',
    'order_id' => 'ORDER-123',
    'requested_order_id' => 'ORDER-123',
    'refund_order_id' => null,
    'payment_type' => 'knet', // or 'credit_card', 'apple_pay', etc.
    'invoice_id' => 'INV123',
    'transaction_date' => '2024-01-01 12:00:00',
    'receipt_id' => 'RCP123',
    'trn_udf' => 'Custom data',
    'amount' => 100.00,
    'currency' => 'KWD',
]

// Failed/Cancelled webhook payload
[
    'result' => 'failed', // or 'cancelled', 'error'
    'track_id' => '019ae3cc7da914644b7efd5638cdc83fv2',
    'order_id' => 'ORDER-123',
    'error' => 'Payment declined',
    // ... other fields
]
```

**MyFatoorah Webhook Data** ([Reference](https://docs.myfatoorah.com/docs/webhook-v2)):

```php
// Webhook payload structure
[
    'InvoiceId' => 12345,
    'InvoiceStatus' => 'Paid', // or 'Pending', 'Failed', 'Canceled'
    'InvoiceValue' => 100.00,
    'Currency' => 'KWD',
    'CustomerReference' => 'ORDER-123', // This is your order_id
    'TransactionId' => 789,
    // ... other fields
]

// Signature is sent in header: MyFatoorah-Signature
```

**Custom Webhook Handler Example:**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\WebhookRequest;

class CustomPaymentWebhookController extends Controller
{
    public function handle(Request $request, $gateway)
    {
        try {
            $webhookRequest = WebhookRequest::fromRequest($request);
            $result = Payment::driver($gateway)->verifyWebhook($webhookRequest);

            if (!$result->isValid) {
                \Log::warning('Invalid webhook signature', [
                    'gateway' => $gateway,
                    'payload' => $request->all(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature',
                ], 401);
            }

            // Process webhook based on gateway and result
            if ($gateway === 'upayments') {
                // UPayments uses 'result' field
                $resultValue = $request->input('result');
                if ($resultValue === 'captured' || $resultValue === 'authorized') {
                    $this->handlePaymentSuccess($result, $request);
                } else {
                    $this->handlePaymentFailure($result, $request);
                }
            } else {
                // MyFatoorah - result is determined by verification
                if ($result->isSuccessful()) {
                    $this->handlePaymentSuccess($result, $request);
                } else {
                    $this->handlePaymentFailure($result, $request);
                }
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            \Log::error('Webhook processing error: ' . $e->getMessage(), [
                'gateway' => $gateway,
                'payload' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Webhook processing failed',
            ], 500);
        }
    }

    protected function handlePaymentSuccess($result)
    {
        $order = Order::where('transaction_id', $result->transactionId)->first();
        if ($order) {
            $order->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            // Send notification, update inventory, etc.
        }
    }

    protected function handlePaymentFailure($result)
    {
        $order = Order::where('transaction_id', $result->transactionId)->first();
        if ($order) {
            $order->update([
                'status' => 'failed',
                'failure_reason' => $result->failureReason,
            ]);
        }
    }

    protected function handleRefund($result, $request)
    {
        $refundId = $request->input('refund_id');
        // Process refund...
    }
}
```

### Event Listeners

The package dispatches events for all payment lifecycle events. Register listeners in your `EventServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Tocaan\Payments\Events\PaymentSucceeded;
use Tocaan\Payments\Events\PaymentFailed;
use Tocaan\Payments\Events\RefundSucceeded;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PaymentSucceeded::class => [
            \App\Listeners\UpdateOrderStatus::class,
            \App\Listeners\SendPaymentConfirmationEmail::class,
            \App\Listeners\UpdateInventory::class,
            \App\Listeners\CreateInvoice::class,
        ],
        PaymentFailed::class => [
            \App\Listeners\LogPaymentFailure::class,
            \App\Listeners\NotifyAdmin::class,
        ],
        RefundSucceeded::class => [
            \App\Listeners\UpdateRefundStatus::class,
            \App\Listeners\SendRefundConfirmation::class,
        ],
    ];
}
```

#### Example Listeners

**Update Order Status:**

```php
<?php

namespace App\Listeners;

use App\Models\Order;
use Tocaan\Payments\Events\PaymentSucceeded;

class UpdateOrderStatus
{
    public function handle(PaymentSucceeded $event)
    {
        $order = Order::where('order_id', $event->orderId)->first();
        
        if ($order) {
            $order->update([
                'status' => 'paid',
                'payment_status' => 'completed',
                'transaction_id' => $event->transactionId,
                'paid_at' => now(),
                'gateway' => $event->gateway,
            ]);

            // Log payment details
            \Log::info('Payment succeeded', [
                'order_id' => $event->orderId,
                'transaction_id' => $event->transactionId,
                'amount' => $event->amount,
                'gateway' => $event->gateway,
            ]);
        }
    }
}
```

**Send Confirmation Email:**

```php
<?php

namespace App\Listeners;

use App\Mail\PaymentConfirmation;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use Tocaan\Payments\Events\PaymentSucceeded;

class SendPaymentConfirmationEmail
{
    public function handle(PaymentSucceeded $event)
    {
        $order = Order::where('order_id', $event->orderId)->first();
        
        if ($order && $order->customer_email) {
            Mail::to($order->customer_email)->send(
                new PaymentConfirmation($order, $event)
            );
        }
    }
}
```

**Log Payment Failure:**

```php
<?php

namespace App\Listeners;

use App\Models\Order;
use Tocaan\Payments\Events\PaymentFailed;

class LogPaymentFailure
{
    public function handle(PaymentFailed $event)
    {
        $order = Order::where('order_id', $event->orderId)->first();
        
        if ($order) {
            $order->update([
                'payment_status' => 'failed',
                'failure_reason' => $event->failureReason,
            ]);

            \Log::warning('Payment failed', [
                'order_id' => $event->orderId,
                'transaction_id' => $event->transactionId,
                'failure_reason' => $event->failureReason,
                'gateway' => $event->gateway,
                'gateway_data' => $event->gatewayData,
            ]);
        }
    }
}
```

**Handle Refund:**

```php
<?php

namespace App\Listeners;

use App\Models\Refund;
use Tocaan\Payments\Events\RefundSucceeded;

class UpdateRefundStatus
{
    public function handle(RefundSucceeded $event)
    {
        Refund::updateOrCreate(
            ['refund_id' => $event->refundId],
            [
                'transaction_id' => $event->transactionId,
                'amount' => $event->amount,
                'status' => 'completed',
                'gateway' => $event->gateway,
                'processed_at' => now(),
            ]
        );
    }
}
```

### Advanced Usage Cases

#### Case 1: Polling Payment Status

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\PaymentStatusRequest;

public function pollPaymentStatus($transactionId, $maxAttempts = 10)
{
    $attempt = 0;
    
    while ($attempt < $maxAttempts) {
        $statusRequest = new PaymentStatusRequest($transactionId);
        $status = Payment::status($statusRequest);

        if ($status->isSuccessful()) {
            return ['status' => 'success', 'data' => $status];
        }

        if ($status->isFailed()) {
            return ['status' => 'failed', 'reason' => $status->failureReason];
        }

        // Wait before next attempt
        sleep(2);
        $attempt++;
    }

    return ['status' => 'timeout'];
}
```

#### Case 2: Partial Refund

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\RefundRequest;

// Refund partial amount
$refundRequest = new RefundRequest(
    transactionId: '12345',
    amount: 25.00, // Partial refund
    options: [
        'reason' => 'Item returned',
        'invoice_id' => 'INV-123',
    ]
);

$refund = Payment::refund($refundRequest);
```

#### Case 3: Multiple Gateways in Same Application

```php
use Tocaan\Payments\Facades\Payment;

// Determine gateway based on order or customer
$gateway = $order->preferred_gateway ?? config('payments.default');

// Or based on amount
$gateway = $order->total > 1000 ? 'upayments' : 'myfatoorah';

$response = Payment::driver($gateway)->initiate($request);
```

#### Case 4: Error Handling with Retry Logic

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\Exceptions\TransportException;

public function initiateWithRetry($request, $maxRetries = 3)
{
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            return Payment::initiate($request);
        } catch (TransportException $e) {
            $attempt++;
            
            if ($attempt >= $maxRetries) {
                throw $e;
            }
            
            // Wait before retry
            sleep(pow(2, $attempt)); // Exponential backoff
        }
    }
}
```

#### Case 5: Custom Metadata for Tracking

```php
$request = new InitiatePaymentRequest(
    amount: 100.00,
    currency: 'KWD',
    orderId: 'ORDER-123',
    options: [
        'metadata' => [
            'campaign_id' => 'SUMMER2024',
            'affiliate_id' => 'AFF123',
            'source' => 'mobile_app',
            'user_id' => auth()->id(),
            'custom_fields' => [
                'shipping_method' => 'express',
                'discount_code' => 'SAVE10',
            ],
        ],
    ]
);
```

## UPayments Multi-Vendor Mode

The package supports UPayments multi-vendor mode with **single vendor per project** constraint.

### Configuration

Set `UPAYMENTS_MODE=multi_vendor` and configure:

```env
UPAYMENTS_MODE=multi_vendor
UPAYMENTS_PARENT_API_KEY=your-parent-api-key
UPAYMENTS_PARENT_MERCHANT_ID=your-parent-merchant-id
UPAYMENTS_VENDOR_IBAN=KW91KFHO1122334455611223344556
UPAYMENTS_VENDOR_KNET_CHARGE=5
UPAYMENTS_VENDOR_KNET_CHARGE_TYPE=percentage
UPAYMENTS_VENDOR_CC_CHARGE=10
UPAYMENTS_VENDOR_CC_CHARGE_TYPE=percentage
```

Or in `config/payments.php`:

```php
'upayments' => [
    'mode' => 'multi_vendor',
    'multi_vendor' => [
        'parent_merchant' => [
            'api_key' => env('UPAYMENTS_PARENT_API_KEY'),
            'merchant_id' => env('UPAYMENTS_PARENT_MERCHANT_ID'),
        ],
        'vendor' => [
            'iban_number' => env('UPAYMENTS_VENDOR_IBAN'),
            'knet_charge' => env('UPAYMENTS_VENDOR_KNET_CHARGE', 0),
            'knet_charge_type' => env('UPAYMENTS_VENDOR_KNET_CHARGE_TYPE', 'percentage'),
            'cc_charge' => env('UPAYMENTS_VENDOR_CC_CHARGE', 0),
            'cc_charge_type' => env('UPAYMENTS_VENDOR_CC_CHARGE_TYPE', 'percentage'),
            'show_sub_merchant_details' => env('UPAYMENTS_SHOW_SUB_MERCHANT_DETAILS', false),
        ],
        'base_url' => env('UPAYMENTS_BASE_URL'),
        'test_mode' => env('UPAYMENTS_TEST_MODE', true),
    ],
],
```

**Configuration Notes:**
- `iban_number`: The IBAN of the sub-merchant where funds will be deposited (required)
- `knet_charge` / `cc_charge`: Commission amount for the main merchant (required)
  - For percentage: e.g., `5` means 5%
  - For fixed: e.g., `0.5` means 0.5 KWD
- `knet_charge_type` / `cc_charge_type`: Must be either `"fixed"` or `"percentage"` (required)
- `show_sub_merchant_details`: If `true`, sub-merchant logo/name will be shown in payment link instead of main merchant
- `enabled_payment_methods`: Control which payment methods are available (optional)
- Only **one vendor** is supported per project (single sub-merchant constraint)

**Example Commission Calculation:**
- Order amount: 100 KWD
- KNET charge: 5% → Main merchant gets 5 KWD, Vendor gets 95 KWD
- CC charge: 10% → Main merchant gets 10 KWD, Vendor gets 90 KWD

### Usage

The API remains the same. The driver automatically uses the multi-merchant API with `extraMerchantData`:

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

$request = new InitiatePaymentRequest(
    amount: 100.00,
    currency: 'KWD',
    orderId: 'ORDER-123',
    options: [
        'customer_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_phone' => '+96512345678',
        'return_url' => route('payment.return'),
        'cancel_url' => route('payment.cancel'),
        'callback_url' => route('payment.webhook'),
        // Optional: Provide products array for multi-vendor
        'metadata' => [
            'products' => [
                [
                    'name' => 'Product 1',
                    'description' => 'Product description',
                    'price' => 50.00,
                    'quantity' => 1,
                ],
                [
                    'name' => 'Product 2',
                    'description' => 'Another product',
                    'price' => 50.00,
                    'quantity' => 1,
                ],
            ],
            'description' => 'Order description',
            'language' => 'en',
        ],
    ]
);

$response = Payment::driver('upayments')->initiate($request);
```

The driver will:
- Use parent merchant credentials for authentication
- Automatically build `extraMerchantData` array with vendor IBAN and charges
- Include commission configuration (KNET and Credit Card charges)
- Handle vendor-specific operations automatically
- Support single vendor per project (as per your requirement)

**How Multi-Vendor Works:**
- The main merchant (parent) receives commission based on configured charges
- The sub-merchant (vendor) receives the remaining amount minus commission
- Funds are deposited to the vendor's IBAN account
- Commission is calculated based on charge type (fixed or percentage)

## Error Handling

The package provides typed exceptions for comprehensive error handling:

### Exception Types

```php
use Tocaan\Payments\Exceptions\AuthenticationException;
use Tocaan\Payments\Exceptions\ValidationException;
use Tocaan\Payments\Exceptions\TransportException;
use Tocaan\Payments\Exceptions\ProviderException;
use Tocaan\Payments\Exceptions\PaymentException; // Base exception
```

### Complete Error Handling Example

```php
<?php

namespace App\Services;

use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;
use Tocaan\Payments\Exceptions\AuthenticationException;
use Tocaan\Payments\Exceptions\ValidationException;
use Tocaan\Payments\Exceptions\TransportException;
use Tocaan\Payments\Exceptions\ProviderException;

class PaymentService
{
    public function initiatePayment($order)
    {
        try {
            $request = new InitiatePaymentRequest(/* ... */);
            $response = Payment::initiate($request);
            
            return [
                'success' => true,
                'data' => $response,
            ];

        } catch (AuthenticationException $e) {
            // Invalid API credentials
            \Log::error('Payment authentication failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Payment gateway authentication failed',
                'message' => 'Please contact support',
            ];

        } catch (ValidationException $e) {
            // Invalid request data (missing fields, invalid amounts, etc.)
            \Log::warning('Payment validation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Invalid payment request',
                'message' => $e->getMessage(),
            ];

        } catch (TransportException $e) {
            // Network/connection error (timeout, DNS failure, etc.)
            \Log::error('Payment network error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'previous' => $e->getPrevious()?->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Network error',
                'message' => 'Please try again later',
                'retryable' => true,
            ];

        } catch (ProviderException $e) {
            // Gateway-specific error (declined card, insufficient funds, etc.)
            $providerResponse = $e->getProviderResponse();
            
            \Log::error('Payment provider error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'provider_response' => $providerResponse,
                'code' => $e->getCode(),
            ]);

            return [
                'success' => false,
                'error' => 'Payment processing failed',
                'message' => $this->getUserFriendlyMessage($e, $providerResponse),
                'provider_response' => $providerResponse,
            ];

        } catch (\Exception $e) {
            // Unexpected error
            \Log::critical('Unexpected payment error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'An unexpected error occurred',
                'message' => 'Please contact support',
            ];
        }
    }

    protected function getUserFriendlyMessage($exception, $providerResponse)
    {
        // Map provider error codes to user-friendly messages
        $errorCode = $providerResponse['error_code'] ?? null;
        
        $messages = [
            'INSUFFICIENT_FUNDS' => 'Insufficient funds in your account',
            'CARD_DECLINED' => 'Your card was declined',
            'EXPIRED_CARD' => 'Your card has expired',
            'INVALID_CARD' => 'Invalid card details',
        ];

        return $messages[$errorCode] ?? $exception->getMessage();
    }
}
```

### Error Response Structure

All exceptions extend `PaymentException` and provide:

- **Message**: Human-readable error message
- **Code**: HTTP status code or error code
- **Previous**: Original exception (for TransportException)
- **ProviderResponse**: Gateway response data (for ProviderException)

### Best Practices

1. **Always catch specific exceptions** before catching the base exception
2. **Log errors** with context (order ID, transaction ID, etc.)
3. **Provide user-friendly messages** while logging technical details
4. **Handle retryable errors** (TransportException) with exponential backoff
5. **Store provider responses** for debugging and support

## Real-World Examples

### Example: E-commerce Checkout Flow

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

class CheckoutController extends Controller
{
    public function processCheckout(Request $request)
    {
        $cart = Cart::where('user_id', auth()->id())->with('items')->first();
        
        // Create order
        $order = Order::create([
            'user_id' => auth()->id(),
            'total' => $cart->total,
            'currency' => 'KWD',
            'status' => 'pending',
            'customer_name' => auth()->user()->name,
            'customer_email' => auth()->user()->email,
            'customer_phone' => $request->phone,
            'shipping_address' => $request->address,
        ]);

        // Create payment request
        $paymentRequest = new InitiatePaymentRequest(
            amount: $order->total,
            currency: $order->currency,
            orderId: (string) $order->id,
            options: [
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'return_url' => route('checkout.success', $order),
                'cancel_url' => route('checkout.cancel', $order),
                'callback_url' => route('payment.webhook', ['gateway' => 'myfatoorah']),
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'items_count' => $cart->items->count(),
                    'shipping_method' => $request->shipping_method,
                ],
            ]
        );

        try {
            $response = Payment::initiate($paymentRequest);
            
            // Save transaction ID
            $order->update(['transaction_id' => $response->transactionId]);
            
            // Clear cart
            $cart->items()->delete();
            
            // Redirect to payment
            return redirect($response->paymentUrl);
            
        } catch (\Exception $e) {
            \Log::error('Checkout failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'Payment initiation failed. Please try again.');
        }
    }

    public function success(Order $order)
    {
        // Verify payment status
        try {
            $statusRequest = new \Tocaan\Payments\DTO\PaymentStatusRequest($order->transaction_id);
            $status = Payment::status($statusRequest);
            
            if ($status->isSuccessful()) {
                return view('checkout.success', compact('order'));
            }
        } catch (\Exception $e) {
            \Log::error('Payment verification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
        
        return redirect()->route('checkout.cancel', $order);
    }
}
```

### Example: Subscription Payment

```php
<?php

namespace App\Services;

use App\Models\Subscription;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

class SubscriptionService
{
    public function initiateSubscriptionPayment(Subscription $subscription)
    {
        $paymentRequest = new InitiatePaymentRequest(
            amount: $subscription->plan->price,
            currency: 'KWD',
            orderId: "SUB-{$subscription->id}",
            options: [
                'customer_name' => $subscription->user->name,
                'customer_email' => $subscription->user->email,
                'return_url' => route('subscription.payment.return', $subscription),
                'callback_url' => route('payment.webhook', ['gateway' => 'upayments']),
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'plan_id' => $subscription->plan_id,
                    'billing_cycle' => $subscription->billing_cycle,
                    'type' => 'subscription',
                ],
            ]
        );

        $response = Payment::driver('upayments')->initiate($paymentRequest);
        
        $subscription->update([
            'transaction_id' => $response->transactionId,
            'payment_status' => 'pending',
        ]);

        return $response;
    }
}
```

### Example: Multi-Currency Support

```php
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

// Support multiple currencies
$supportedCurrencies = ['KWD', 'USD', 'EUR', 'SAR'];

if (!in_array($request->currency, $supportedCurrencies)) {
    return back()->with('error', 'Currency not supported');
}

$paymentRequest = new InitiatePaymentRequest(
    amount: $order->total,
    currency: $request->currency,
    orderId: $order->id,
    options: [
        // ... other options
    ]
);
```

## Testing

Run the test suite:

```bash
composer test
```

Or with PHPUnit directly:

```bash
vendor/bin/phpunit
```

The package includes:
- Unit tests for drivers
- Integration tests for payment flows
- Signature verification tests
- HTTP client mocking

### Testing Your Integration

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Http;
use Tocaan\Payments\Facades\Payment;
use Tocaan\Payments\DTO\InitiatePaymentRequest;

class PaymentTest extends TestCase
{
    public function test_payment_initiation()
    {
        // Mock HTTP response
        Http::fake([
            'api.myfatoorah.com/v2/SendPayment' => Http::response([
                'IsSuccess' => true,
                'Data' => [
                    'InvoiceId' => '12345',
                    'InvoiceURL' => 'https://myfatoorah.com/pay/12345',
                ],
            ]),
        ]);

        $request = new InitiatePaymentRequest(
            amount: 100.00,
            currency: 'KWD',
            orderId: 'TEST-123',
            options: [
                'customer_email' => 'test@example.com',
            ]
        );

        $response = Payment::driver('myfatoorah')->initiate($request);

        $this->assertNotNull($response->transactionId);
        $this->assertNotEmpty($response->paymentUrl);
    }
}
```

## Requirements

- PHP 7.4 or higher
- Laravel 7.0 or higher

## Supported Laravel Versions

- Laravel 7.x
- Laravel 8.x
- Laravel 9.x
- Laravel 10.x
- Laravel 11.x
- Laravel 12.x

## Security

- All webhook signatures are verified automatically
- Return URLs are validated before processing
- Sensitive data is never logged
- HMAC SHA256 signature verification supported

## Best Practices

### 1. Always Verify Payment Status

Don't rely solely on return URLs. Always verify payment status using the status API:

```php
// After customer returns from payment gateway
$status = Payment::status(new PaymentStatusRequest($transactionId));

if ($status->isSuccessful()) {
    // Process order
}
```

### 2. Use Webhooks for Reliable Payment Confirmation

Webhooks are more reliable than return URLs. Always implement webhook handlers:

```php
// Webhook is called by gateway even if customer doesn't return
Route::post('/payments/webhook/{gateway}', [PaymentWebhookController::class, 'handle']);
```

**Important Notes:**
- **UPayments**: Webhook includes `track_id` which should be used to check payment status via `/get-payment-status/{track_id}` API
- **MyFatoorah**: Webhook signature is in `MyFatoorah-Signature` header, uses HMAC SHA-256 with Base64 encoding
- Always verify webhook signatures before processing
- Webhooks are mandatory - use `notificationUrl` parameter in payment initiation

### 3. Implement Idempotency

Prevent duplicate processing:

```php
// Check if payment already processed
$order = Order::where('transaction_id', $transactionId)->first();

if ($order && $order->status === 'paid') {
    return; // Already processed
}

// Process payment...
```

### 4. Log All Payment Operations

Always log payment operations for debugging and auditing:

```php
\Log::info('Payment initiated', [
    'order_id' => $order->id,
    'transaction_id' => $response->transactionId,
    'amount' => $order->total,
    'gateway' => 'myfatoorah',
]);
```

### 5. Handle Timeouts and Retries

Payment gateways may timeout. Implement retry logic:

```php
try {
    $response = Payment::initiate($request);
} catch (TransportException $e) {
    // Retry with exponential backoff
    sleep(2);
    $response = Payment::initiate($request);
}
```

### 6. Validate Amounts Before Processing

Always validate amounts match:

```php
$status = Payment::status($statusRequest);

if ($status->amount !== $order->total) {
    \Log::warning('Amount mismatch', [
        'expected' => $order->total,
        'received' => $status->amount,
    ]);
    // Handle mismatch
}
```

### 7. Secure Webhook Endpoints

Protect webhook endpoints from unauthorized access:

```php
// In your webhook controller
public function handle(Request $request, $gateway)
{
    // Signature verification is automatic, but you can add additional checks
    if (!in_array($request->ip(), config('payments.allowed_webhook_ips', []))) {
        \Log::warning('Unauthorized webhook attempt', ['ip' => $request->ip()]);
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    // Process webhook...
}
```

## Troubleshooting

### Payment Initiation Fails

**Symptoms:**
- `AuthenticationException` thrown
- Payment URL not generated
- Gateway returns error

**Solutions:**
1. Check API credentials in `.env` file
2. Verify gateway is in test mode if testing
3. Check network connectivity to gateway
4. Review gateway response in `$response->gatewayResponse`
5. Verify base URL is correct
6. Check API key permissions in gateway dashboard

**Debug Code:**
```php
try {
    $response = Payment::initiate($request);
} catch (ProviderException $e) {
    \Log::error('Payment initiation failed', [
        'error' => $e->getMessage(),
        'provider_response' => $e->getProviderResponse(),
    ]);
}
```

### Payment Status Always Pending

**Symptoms:**
- Status check returns "pending"
- Payment never completes

**Solutions:**
1. Verify webhook is configured correctly
2. Check webhook URL is publicly accessible
3. Verify signature verification is working
4. Check gateway dashboard for payment status
5. Ensure callback URL is correct

### Webhook Not Received

**Symptoms:**
- Webhook endpoint not called
- Events not dispatched

**Solutions:**
1. Verify webhook URL is publicly accessible (use ngrok for local testing)
2. Check webhook secret configuration matches gateway dashboard
3. Ensure signature verification is enabled
4. Check gateway dashboard for webhook logs and delivery status
5. Verify webhook URL format: `https://yourdomain.com/payments/webhook/{gateway}`
6. Check firewall/security settings
7. **UPayments**: Ensure `notificationUrl` is provided in charge request
8. **MyFatoorah**: Verify webhook is configured in MyFatoorah dashboard

**Test Webhook Locally:**
```bash
# Use ngrok to expose local server
ngrok http 8000

# Update webhook URL in gateway dashboard to:
# https://your-ngrok-url.ngrok.io/payments/webhook/myfatoorah
# https://your-ngrok-url.ngrok.io/payments/webhook/upayments
```

**Webhook Signature Headers:**
- **MyFatoorah**: Header name is `MyFatoorah-Signature` (case-sensitive)
- **UPayments**: Header name is `X-Signature` or in payload as `signature` field

### Return URL Not Working

**Symptoms:**
- Customer redirected but payment not verified
- Events not dispatched

**Solutions:**
1. Verify return URL is correct in payment request
2. Check gateway allows the return URL domain
3. Ensure signature verification is working
4. Check if gateway sends data via GET or POST
5. Verify controller handles both JSON and HTML responses

### Multi-Vendor Issues

**Symptoms:**
- `ValidationException` on multi-vendor configuration
- Commission not calculated correctly
- Funds not deposited to vendor

**Solutions:**
1. Verify parent merchant credentials (API key and merchant ID)
2. Check vendor IBAN number is correct and valid (format: KW followed by 28 digits)
3. Ensure charge types are either "fixed" or "percentage" (lowercase)
4. Verify charge amounts are properly configured:
   - For percentage: use numbers like `5` for 5%
   - For fixed: use decimal numbers like `0.5` for 0.5 KWD
5. Confirm mode is set to `multi_vendor` in `.env`
6. Check that `extraMerchantData` is being sent correctly (see API logs)
7. Verify that only one vendor is configured (single vendor constraint)
8. Ensure products array is provided in metadata if you want custom product details
9. Check parent merchant account has multi-vendor feature enabled

### Refund Fails

**Symptoms:**
- Refund request returns error
- Refund status stays pending

**Solutions:**
1. Verify transaction ID is correct
2. Check refund amount doesn't exceed original payment
3. Ensure refund is within allowed time window
4. Verify refund is allowed for the payment method used
5. Check gateway dashboard for refund status
6. Review refund policies in gateway documentation

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Authentication failed` | Invalid API key | Check `.env` file |
| `Invalid gateway specified` | Gateway name typo | Use `myfatoorah` or `upayments` |
| `Invalid signature` | Webhook signature mismatch | Verify webhook secret |
| `Transaction ID not found` | Invalid transaction ID | Check transaction ID format |
| `Payment gateway error` | Gateway-specific issue | Check gateway response |
| `Connection error` | Network timeout | Check internet connection |

## Contributing

Contributions are welcome! Please ensure:

- Code follows PSR-12 coding standards
- Tests are included for new features
- Documentation is updated
- All tests pass

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Support

For issues and questions:
- Check the documentation above
- Review gateway-specific documentation:
  - [MyFatoorah Laravel Docs](https://docs.myfatoorah.com/docs/laravel)
  - [UPayments UInterfaceV2](https://developers.upayments.com/reference/uinterface-features)
  - [UPayments Multi-Vendor API](https://developers.upayments.com/reference/multi-vendor-api)
- Open an issue on GitHub

## FAQ

### Q: Can I use both MyFatoorah and UPayments in the same application?

**A:** Yes! You can switch between gateways dynamically:

```php
// Use MyFatoorah for some orders
$response1 = Payment::driver('myfatoorah')->initiate($request1);

// Use UPayments for other orders
$response2 = Payment::driver('upayments')->initiate($request2);
```

### Q: How do I test payments without real transactions?

**A:** Set `TEST_MODE=true` in your `.env` file and use test API keys provided by the gateway. The package will use test endpoints automatically.

### Q: Can I process payments without redirecting the user?

**A:** Yes, but it depends on the gateway. Some gateways support direct API payments. Check the gateway documentation for available payment methods.

### Q: How do I handle partial refunds?

**A:** Simply specify a partial amount in the refund request:

```php
$refundRequest = new RefundRequest(
    transactionId: '12345',
    amount: 25.00, // Partial amount
    options: ['reason' => 'Partial refund']
);
```

### Q: What happens if a webhook fails?

**A:** The gateway will retry webhooks according to their retry policy. Your webhook handler should be idempotent to handle duplicate calls safely.

### Q: Can I customize the payment page?

**A:** Payment pages are hosted by the gateway. However, you can:
- Pass custom metadata that may be displayed
- Use whitelabel options if supported by the gateway
- Customize return URLs and success pages

### Q: How do I switch between test and production modes?

**A:** Update the `TEST_MODE` environment variable:

```env
# Test mode
MYFATOORAH_TEST_MODE=true
UPAYMENTS_TEST_MODE=true

# Production mode
MYFATOORAH_TEST_MODE=false
UPAYMENTS_TEST_MODE=false
```

### Q: What currencies are supported?

**A:** Supported currencies depend on the gateway:
- **MyFatoorah**: KWD, USD, EUR, SAR, AED, and more
- **UPayments**: KWD and other supported currencies

Check gateway documentation for full currency list.

### Q: How do I handle multiple payment attempts for the same order?

**A:** Store the transaction ID and check if payment already exists:

```php
$existingPayment = Payment::where('order_id', $order->id)
    ->where('status', 'paid')
    ->first();

if ($existingPayment) {
    return redirect()->route('order.show', $order);
}

// Create new payment...
```

### Q: Can I use this package with Laravel Queue?

**A:** Yes! You can dispatch payment operations to queues:

```php
ProcessPaymentJob::dispatch($order)->onQueue('payments');
```

### Q: How do I get payment history?

**A:** The package doesn't store payment history. You should store payment records in your database:

```php
// After successful payment
PaymentRecord::create([
    'order_id' => $order->id,
    'transaction_id' => $status->transactionId,
    'amount' => $status->amount,
    'currency' => $status->currency,
    'gateway' => 'myfatoorah',
    'status' => $status->status,
    'paid_at' => now(),
]);
```

### Q: Is webhook signature verification required?

**A:** Highly recommended for security. The package verifies signatures automatically if `verify_signature` is enabled in config. Always enable it in production.

### Q: Can I use this with Laravel Cashier?

**A:** This package is for one-time payments. For subscriptions, consider using Laravel Cashier or implementing subscription logic on top of this package.

## Testing

الحزمة تحتوي على اختبارات شاملة تغطي جميع الوظائف. لاختبار الحزمة بدون تثبيتها في مشروع حقيقي:

### تشغيل الاختبارات

```bash
# Install dependencies
composer install

# Run all tests
composer test

# Run tests with coverage
composer test-coverage
```

### أنواع الاختبارات

- **Unit Tests**: اختبار كل class بشكل منفصل
- **Integration Tests**: اختبار التدفق الكامل للعمليات

الاختبارات تستخدم Laravel HTTP fakes لمحاكاة استجابات البوابات بدون إجراء طلبات حقيقية.

لمزيد من التفاصيل، راجع [TESTING.md](TESTING.md).

## Reference Documentation

- [UPayments Multi-Merchant API Documentation](https://developers.upayments.com/reference/multi-vendor-api)
- [MyFatoorah Laravel Package Documentation](https://docs.myfatoorah.com/docs/laravel)
- [UPayments UInterfaceV2 Features](https://developers.upayments.com/reference/uinterface-features)
- [UPayments Webhook Documentation](https://developers.upayments.com/reference/webhook)
- [UPayments Payment Status API](https://developers.upayments.com/reference/checkpaymentstatus)
- [MyFatoorah Webhook Signature](https://docs.myfatoorah.com/docs/webhook-signature)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details on changes and version history.
