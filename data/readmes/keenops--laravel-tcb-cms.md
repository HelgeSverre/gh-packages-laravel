# Laravel TCB CMS

A Laravel package for integrating with Tanzania Commercial Bank's Cash Management System (CMS) API. This package enables payment reference creation, IPN (Instant Payment Notification) handling, reconciliation, and reference cancellation.

## Requirements

- PHP 8.2+
- Laravel 11.x, 12.x, or 13.x

## Installation

Install the package via Composer:

```bash
composer require keenops/laravel-tcb-cms
```

The package will auto-register its service provider and facade.

### Publish Configuration

```bash
php artisan vendor:publish --tag=tcb-cms-config
```

### Run Migrations

```bash
php artisan migrate
```

This creates the `tcb_cms_transactions` table for transaction logging.

## Configuration

Add the following environment variables to your `.env` file:

```env
TCB_CMS_API_KEY=your-api-key
TCB_CMS_PARTNER_CODE=PART-YOURCODE
TCB_CMS_PROFILE_ID=1234567890
TCB_CMS_BASE_URL=https://partners.tcbbank.co.tz
TCB_CMS_RECONCILIATION_BASE_URL=https://partners.tcbbank.co.tz:8444
TCB_CMS_IPN_ROUTE=/tcb-cms/ipn
TCB_CMS_VERIFY_IP=false
TCB_CMS_ALLOWED_IPS=
TCB_CMS_TIMEOUT=30
TCB_CMS_RETRY_TIMES=3
TCB_CMS_LOGGING_ENABLED=true
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `api_key` | Your TCB CMS API key | - |
| `partner_code` | Your partner code assigned by TCB | - |
| `profile_id` | Your profile ID | - |
| `base_url` | TCB CMS API base URL | `https://partners.tcbbank.co.tz` |
| `reconciliation_base_url` | Reconciliation API base URL | `https://partners.tcbbank.co.tz:8444` |
| `ipn.route` | IPN callback route | `/tcb-cms/ipn` |
| `ipn.middleware` | Middleware for IPN route | `['api']` |
| `verify_ip` | Enable IP verification for IPN | `false` |
| `allowed_ips` | Comma-separated allowed IPs | - |
| `timeout` | HTTP request timeout (seconds) | `30` |
| `retry_times` | Number of retry attempts | `3` |
| `logging.enabled` | Enable transaction logging | `true` |

## Usage

### Using the Facade

```php
use Keenops\LaravelTcbCms\Facades\TcbCms;
```

### Create a Payment Reference

Create a payment reference for a customer to make payments:

```php
$response = TcbCms::createReference(
    reference: '999MYREF001',
    name: 'John Doe',
    mobile: '0712345678',
    message: 'Invoice #12345',
);

if ($response->isSuccessful()) {
    echo "Account No: " . $response->accountNo;
    echo "Reference No: " . $response->referenceNo;
} else {
    echo "Error: " . $response->message;
}
```

With optional amount and expiry date:

```php
$response = TcbCms::createReference(
    reference: '999MYREF001',
    name: 'John Doe',
    mobile: '0712345678',
    message: 'Invoice #12345',
    amount: 50000.00,
    expiryDate: '2024-12-31',
);
```

### Cancel a Payment Reference

```php
$response = TcbCms::cancelReference(referenceNo: '999MYREF001');

if ($response->isSuccessful()) {
    echo "Reference cancelled successfully";
}
```

### Reconciliation

Fetch all transactions within a date range:

```php
use Carbon\Carbon;

$response = TcbCms::reconcile(
    startDate: Carbon::now()->subDays(7),
    endDate: Carbon::now(),
);

if ($response->isSuccessful()) {
    echo "Total Transactions: " . $response->totalCount;
    echo "Total Amount: " . $response->totalAmount;

    foreach ($response->transactions as $transaction) {
        echo $transaction->transactionId;
        echo $transaction->reference;
        echo $transaction->amount;
        echo $transaction->payerName;
        echo $transaction->transactionDate->format('Y-m-d H:i:s');
    }
}
```

## Handling Payment Notifications (IPN)

The package automatically registers an IPN route at `/tcb-cms/ipn` (configurable). When TCB Bank sends a payment notification, the package dispatches a `PaymentReceived` event.

### Create an Event Listener

```php
// app/Listeners/HandleTcbPayment.php

namespace App\Listeners;

use Keenops\LaravelTcbCms\Events\PaymentReceived;

class HandleTcbPayment
{
    public function handle(PaymentReceived $event): void
    {
        $payload = $event->payload;

        // Access payment details
        $transactionId = $payload->transactionId;
        $reference = $payload->reference;
        $amount = $payload->amount;
        $payerName = $payload->payerName;
        $payerMobile = $payload->payerMobile;
        $transactionDate = $payload->transactionDate;

        // Update your order/invoice
        $order = Order::where('payment_reference', $reference)->first();

        if ($order) {
            $order->markAsPaid($transactionId, $amount);
        }
    }
}
```

### Register the Listener

```php
// app/Providers/EventServiceProvider.php

use Keenops\LaravelTcbCms\Events\PaymentReceived;
use App\Listeners\HandleTcbPayment;

protected $listen = [
    PaymentReceived::class => [
        HandleTcbPayment::class,
    ],
];
```

Or using Laravel 11+ event discovery, the listener will be auto-registered.

## Available Events

| Event | Description | Payload |
|-------|-------------|---------|
| `PaymentReceived` | Dispatched when IPN callback is received | `IpnPayload $payload` |
| `ReferenceCreated` | Dispatched on successful reference creation | `CreateReferenceRequest $request`, `CreateReferenceResponse $response` |
| `ReferenceCancelled` | Dispatched on successful reference cancellation | `CancelReferenceRequest $request`, `CancelReferenceResponse $response` |
| `ReconciliationCompleted` | Dispatched after successful reconciliation | `ReconciliationRequest $request`, `ReconciliationResponse $response` |

## Payment Channel Helper

Get payment instructions for different channels:

```php
use Keenops\LaravelTcbCms\Enums\PaymentChannel;

// Get instructions for a specific channel
$instructions = PaymentChannel::TcbMobile->getPaymentInstructions('999MYREF001');
// "Open TCB Mobile App > Payments > Bill Payments > Enter Reference: 999MYREF001"

// Get all channels with instructions
$channels = PaymentChannel::allWithInstructions('999MYREF001');

foreach ($channels as $value => $channel) {
    echo $channel['label'];        // "TCB Mobile Banking"
    echo $channel['instructions']; // Payment instructions
}
```

Available channels:
- `TCB_MOBILE` - TCB Mobile Banking
- `TCB_BRANCH` - TCB Branch
- `TCB_ATM` - TCB ATM
- `USSD` - USSD Banking
- `INTERNET_BANKING` - Internet Banking
- `AGENT_BANKING` - Agent Banking
- `PESALINK` - PesaLink

## Transaction Logging

All API requests and IPN callbacks are logged to the `tcb_cms_transactions` table when logging is enabled.

### Query Transaction Logs

```php
use Keenops\LaravelTcbCms\Models\TcbTransaction;

// Get all transactions for a reference
$transactions = TcbTransaction::forReference('999MYREF001')->get();

// Get all successful transactions
$successful = TcbTransaction::successful()->get();

// Get all failed transactions
$failed = TcbTransaction::failed()->get();

// Get transactions by type
$ipnLogs = TcbTransaction::ofType('ipn')->get();
$createLogs = TcbTransaction::ofType('create_reference')->get();
$cancelLogs = TcbTransaction::ofType('cancel_reference')->get();
$reconcileLogs = TcbTransaction::ofType('reconciliation')->get();
```

### Disable Logging

Set `TCB_CMS_LOGGING_ENABLED=false` in your `.env` file or update the config:

```php
// config/tcb-cms.php
'logging' => [
    'enabled' => false,
],
```

## IP Verification for IPN

For additional security, enable IP verification to only accept IPN callbacks from TCB Bank's servers:

```env
TCB_CMS_VERIFY_IP=true
TCB_CMS_ALLOWED_IPS=192.168.1.1,192.168.1.2
```

## Error Handling

The package throws specific exceptions for different error scenarios:

```php
use Keenops\LaravelTcbCms\Exceptions\TcbCmsException;
use Keenops\LaravelTcbCms\Exceptions\ApiConnectionException;
use Keenops\LaravelTcbCms\Exceptions\InvalidApiKeyException;
use Keenops\LaravelTcbCms\Exceptions\InvalidReferenceException;

try {
    $response = TcbCms::createReference(...);
} catch (InvalidApiKeyException $e) {
    // Invalid API key
} catch (ApiConnectionException $e) {
    // Connection failed
} catch (TcbCmsException $e) {
    // General API error
    $context = $e->context(); // Additional error context
}
```

## Response Status Codes

```php
use Keenops\LaravelTcbCms\Enums\ResponseStatus;

ResponseStatus::Success;         // 0 - Successful operation
ResponseStatus::Failure;         // 1 - Operation failed
ResponseStatus::ConnectionError; // 2 - Connection error
ResponseStatus::ApiKeyError;     // 4 - Invalid API key
```

## Testing

Run the package tests:

```bash
composer test
```

Or using Pest directly:

```bash
vendor/bin/pest
```

### Mocking in Your Application Tests

```php
use Illuminate\Support\Facades\Http;
use Keenops\LaravelTcbCms\Facades\TcbCms;

it('creates an order with payment reference', function () {
    Http::fake([
        '*/api/v1/cms/reference/create' => Http::response([
            'status' => 0,
            'message' => 'Reference created successfully',
            'accountNo' => '240123456789',
            'referenceNo' => '999MYREF001',
            'partnerCode' => 'TEST-PARTNER',
        ], 200),
    ]);

    $response = TcbCms::createReference(
        reference: '999MYREF001',
        name: 'John Doe',
        mobile: '0712345678',
        message: 'Test Order',
    );

    expect($response->isSuccessful())->toBeTrue();
});
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Credits

- [Kimwalu](https://github.com/kimwalu)

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/keenops/laravel-tcb-cms/issues).
