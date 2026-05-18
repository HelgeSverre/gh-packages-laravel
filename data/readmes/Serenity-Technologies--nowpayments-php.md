# NOWPayments Laravel Package

A comprehensive Laravel package for integrating with the NOWPayments cryptocurrency payment processing API.

## Features

- **Complete API Coverage**: All 52 NOWPayments API endpoints supported
- **Type-Safe DTOs**: Request and Response DTOs with strict typing and numeric casting
- **Status Enums**: Type-safe payment, payout, conversion, and subscription statuses
- **Query Builders**: Fluent query builders for list endpoints
- **Webhook System**: IPN handler with HMAC-SHA512 verification, Laravel events, and controller trait
- **Laravel Events**: Auto-fired events for payment status changes, payouts, and conversions
- **Laravel Service Provider**: Easy integration with Laravel's DI container
- **Facade Support**: Convenient static access via `NowPayments` facade

## Installation

### 1. Require the package via Composer

```bash
composer require serenity_technologies/nowpayments
```

### 2. Publish the configuration file

```bash
php artisan vendor:publish --provider="SerenityTechnologies\NowPayments\NowPaymentsServiceProvider" --tag="nowpayments-config"
```

### 3. Configure your environment variables

Add the following to your `.env` file:

```env
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here
NOWPAYMENTS_DASHBOARD_EMAIL=your_dashboard_email@example.com
NOWPAYMENTS_DASHBOARD_PASSWORD=your_password
NOWPAYMENTS_BASE_URL=https://api.nowpayments.io
NOWPAYMENTS_TIMEOUT=30
NOWPAYMENTS_FIXED_RATE=false
NOWPAYMENTS_FEE_PAID_BY_USER=false
NOWPAYMENTS_DEFAULT_PAYOUT_CURRENCY=usdttrc20
```

## Usage

### Basic Usage via Facade

```php
use SerenityTechnologies\NowPayments\Facades\NowPayments;

// Check API status
$status = NowPayments::get('/v1/status');

// Or use the endpoint classes (recommended)
```

### Using Endpoint Classes (Recommended)

```php
use SerenityTechnologies\NowPayments\Services\PaymentService;
use SerenityTechnologies\NowPayments\DTOs\Request\PaymentRequest;

public function createPayment(PaymentService $paymentEndpoint)
{
    $request = new PaymentRequest(
        price_amount: 100.00,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: 'ORDER-123',
        order_description: 'Test payment'
    );
    
    $payment = $paymentEndpoint->createPayment($request);
    
    return response()->json([
        'payment_id' => $payment->payment_id,
        'pay_address' => $payment->pay_address,
        'pay_amount' => $payment->pay_amount,
    ]);
}
```

### Available Services

All endpoints are auto-resolved via Laravel's dependency injection:

#### Authentication & API Status

```php
use SerenityTechnologies\NowPayments\Services\AuthService;

$authEndpoint->getStatus(); // Returns ApiStatusResponse
$authEndpoint->authenticate($authRequest); // Returns AuthResponse
```

#### Currencies

```php
use SerenityTechnologies\NowPayments\Services\CurrencyService;

$currencyEndpoint->getAvailableCurrencies();
$currencyEndpoint->getFullCurrencies();
$currencyEndpoint->getMerchantCoins();
```

#### Payments

```php
use SerenityTechnologies\NowPayments\Services\PaymentService;

$paymentEndpoint->createPayment($request);
$paymentEndpoint->getPaymentStatus($paymentId);
$paymentEndpoint->getListPayments($queryBuilder);
$paymentEndpoint->getEstimate($estimateRequest);
$paymentEndpoint->getMinAmount($minAmountRequest);
```

#### Invoices

```php
use SerenityTechnologies\NowPayments\Services\InvoiceService;

$invoiceEndpoint->createInvoice($invoiceRequest);
$invoiceEndpoint->createInvoicePayment($invoicePaymentRequest);
```

#### Payouts

```php
use SerenityTechnologies\NowPayments\Services\PayoutService;

$payoutEndpoint->getBalance();
$payoutEndpoint->validateAddress($addressRequest);
$payoutEndpoint->createPayout($payoutRequest); // Requires auth
$payoutEndpoint->listPayouts($queryBuilder);
$payoutEndpoint->getPayoutStatus($payoutId);
$payoutEndpoint->verifyPayout($batchId, $verificationRequest);
$payoutEndpoint->cancelPayout($withdrawalId);
$payoutEndpoint->getMinWithdrawalAmount($coin);
$payoutEndpoint->getPayoutFeeEstimate();
```

#### Conversions

```php
use SerenityTechnologies\NowPayments\Services\ConversionService;

$conversionEndpoint->createConversion($conversionRequest);
$conversionEndpoint->listConversions($filters);
$conversionEndpoint->getConversionStatus($conversionId);
```

#### Sub-Partners (Customer Management)

```php
use SerenityTechnologies\NowPayments\Services\SubPartnerService;

$subPartnerEndpoint->createSubPartner($request);
$subPartnerEndpoint->getSubPartnerBalance($id);
$subPartnerEndpoint->listSubPartners($filters);
$subPartnerEndpoint->transferFunds($transferRequest);
$subPartnerEndpoint->getTransfer($id);
$subPartnerEndpoint->listTransfers($filters);
$subPartnerEndpoint->depositToSubPartner($depositRequest);
$subPartnerEndpoint->writeOffFromSubPartner($writeOffRequest);
$subPartnerEndpoint->createSubPartnerPayment($paymentRequest);
$subPartnerEndpoint->getSubPartnerPayments($filters);
```

#### Subscriptions (Recurring Payments)

```php
use SerenityTechnologies\NowPayments\Services\SubscriptionService;

$subscriptionEndpoint->createPlan($planRequest);
$subscriptionEndpoint->listPlans($filters);
$subscriptionEndpoint->getPlan($planId);
$subscriptionEndpoint->updatePlan($planId, $data);
$subscriptionEndpoint->createSubscription($subscriptionRequest);
$subscriptionEndpoint->listSubscriptions($filters);
$subscriptionEndpoint->getSubscription($subId);
$subscriptionEndpoint->deleteSubscription($subId);
```

#### Fiat Payouts

```php
use SerenityTechnologies\NowPayments\Services\FiatPayoutService;

$fiatPayoutEndpoint->getProviders();
$fiatPayoutEndpoint->getFiatCurrencies();
$fiatPayoutEndpoint->getCryptoCurrencies($provider, $currency);
$fiatPayoutEndpoint->getPaymentMethods($provider, $currency);
$fiatPayoutEndpoint->createAccount($accountRequest);
$fiatPayoutEndpoint->listAccounts($filters);
$fiatPayoutEndpoint->requestFiatPayout($payoutRequest);
$fiatPayoutEndpoint->listFiatPayouts($filters);
```

### Query Builders

For list endpoints, use query builders for fluent pagination and filtering. You have three options:

#### Option 1: Using Query Builders (Recommended for complex queries)

```php
use SerenityTechnologies\NowPayments\QueryBuilders\PaymentListQueryBuilder;

$queryBuilder = new PaymentListQueryBuilder();
$queryBuilder->setLimit(50)
    ->setPage(0)
    ->setSortBy('created_at')
    ->setOrderBy('desc')
    ->setDateFrom('2024-01-01')
    ->setDateTo('2024-12-31')
    ->setPaymentStatus('finished')
    ->setPayCurrency('btc')
    ->setPriceCurrency('usd')
    ->setOrderId('ORDER-123');

// Pass the builder directly to the endpoint
$payments = $paymentEndpoint->getListPayments($queryBuilder);
```

#### Option 2: Using DTOs (Recommended for simple queries)

```php
use SerenityTechnologies\NowPayments\DTOs\Request\PaymentListQuery;

$query = new PaymentListQuery(
    limit: 50,
    page: 0,
    sortBy: 'created_at',
    orderBy: 'desc',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    paymentStatus: 'finished',
    payCurrency: 'btc',
    priceCurrency: 'usd',
    orderId: 'ORDER-123'
);

$payments = $paymentEndpoint->getListPayments($query);
```

#### Option 3: Using Arrays (For backward compatibility)

```php
$query = [
    'limit' => 50,
    'page' => 0,
    'sort' => 'created_at',
    'order' => 'desc',
    'date_from' => '2024-01-01',
    'date_to' => '2024-12-31',
    'payment_status' => 'finished',
];

$payments = $paymentEndpoint->getListPayments($query);
```

#### Payout List Query Builder

```php
use SerenityTechnologies\NowPayments\QueryBuilders\PayoutListQueryBuilder;

$payoutBuilder = new PayoutListQueryBuilder();
$payoutBuilder->setLimit(20)
    ->setPage(0)
    ->setStatus('finished')
    ->setOrderBy('created_at')
    ->setOrder('desc')
    ->setDateFrom('2024-01-01')
    ->setDateTo('2024-12-31');

$payouts = $payoutEndpoint->listPayouts($payoutBuilder);
```

#### Available Query Builder Methods

**PaymentListQueryBuilder:**
- `setLimit(int $limit)` - Set limit (1-500)
- `setPage(int $page)` - Set page number
- `setSortBy(string $sortBy)` - Set sort field (payment_id, payment_status, created_at, etc.)
- `setOrderBy(string $orderBy)` - Set sort order (asc or desc)
- `setDateFrom(string $dateFrom)` - Set start date (YYYY-MM-DD or ISO 8601)
- `setDateTo(string $dateTo)` - Set end date (YYYY-MM-DD or ISO 8601)
- `setInvoiceId(int $invoiceId)` - Filter by invoice ID
- `setPaymentStatus(string $status)` - Filter by payment status
- `setPayCurrency(string $currency)` - Filter by payment currency
- `setPriceCurrency(string $currency)` - Filter by price currency
- `setOrderId(string $orderId)` - Filter by order ID
- `reset()` - Reset all filters

**PayoutListQueryBuilder:**
- `setLimit(int $limit)` - Set limit (default: 20)
- `setPage(int $page)` - Set page number (default: 0)
- `setBatchId(int $batchId)` - Filter by batch ID
- `setStatus(string $status)` - Filter by status (creating, waiting, processing, sending, finished, failed, rejected, cancelled)
- `setOrderBy(string $orderBy)` - Set sort field
- `setOrder(string $order)` - Set sort direction (asc or desc)
- `setDateFrom(string $dateFrom)` - Set start date (YYYY-MM-DD or ISO 8601)
- `setDateTo(string $dateTo)` - Set end date (YYYY-MM-DD or ISO 8601)
- `reset()` - Reset all filters to defaults

### Handling IPN Webhooks

#### Option 1: Using the Webhook Trait (Recommended)

```php
use SerenityTechnologies\NowPayments\Support\HandlesIpnWebhooks;
use Illuminate\Routing\Controller;

class NowPaymentsWebhookController extends Controller
{
    use HandlesIpnWebhooks;
}
```

Register the route in `routes/api.php`:
```php
Route::post('nowpayments/webhook', NowPaymentsWebhookController::class);
```

The trait automatically:
- Verifies the IPN signature
- Fires Laravel events (`PaymentStatusChanged`, `PayoutCompleted`, `ConversionFinished`)
- Returns a success/error JSON response

#### Option 2: Manual Handler

```php
use SerenityTechnologies\NowPayments\Handlers\IpnHandler;
use Illuminate\Http\Request;

public function handleWebhook(Request $request, IpnHandler $ipnHandler)
{
    try {
        $data = $ipnHandler->handleRequest($request);

        // Process the webhook data
        $paymentStatus = $data['payment_status'];
        $paymentId = $data['payment_id'];

        // Your business logic here

        return response()->json(['status' => 'success']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 403);
    }
}
```

#### Listening to Webhook Events

```php
use SerenityTechnologies\NowPayments\Events\PaymentStatusChanged;
use SerenityTechnologies\NowPayments\Events\PayoutCompleted;
use Illuminate\Support\Facades\Event;

Event::listen(PaymentStatusChanged::class, function (PaymentStatusChanged $event) {
    Log::info("Payment {$event->paymentId} status: {$event->status}");
});

Event::listen(PayoutCompleted::class, function (PayoutCompleted $event) {
    Log::info("Payout {$event->payoutId} completed with status: {$event->status}");
});
```

### Manual IPN Signature Verification

```php
use SerenityTechnologies\NowPayments\Handlers\IpnHandler;

$ipnHandler = new IpnHandler(config('nowpayments.ipn_secret'));
$isValid = $ipnHandler->verifySignature($postData, $signature);

// Check if this is a retry notification
$isRetry = $ipnHandler->isRetry($postData);
```

### Status Enums

Use type-safe enums for status checking:

```php
use SerenityTechnologies\NowPayments\Enums\PaymentStatus;

$status = PaymentStatus::from($paymentResponse->payment_status);

if ($status->isFinal()) {
    // Payment is finished (finished, failed, refunded, or expired)
}

if ($status->isSuccessful()) {
    // Payment completed successfully
}

if ($status->isPending()) {
    // Payment is still in progress
}
```

## Architecture

### Directory Structure

```
src/
├── Client/
│   └── NowPaymentsClient.php          # HTTP client wrapper
├── Config/
│   └── nowpayments.php                 # Package configuration
├── DTOs/
│   ├── Request/                        # Request DTOs (20 files)
│   └── Response/                       # Response DTOs (40 files)
├── Services/                          # API endpoint classes (9 files)
│   ├── AuthEndpoint.php
│   ├── CurrencyEndpoint.php
│   ├── PaymentEndpoint.php
│   ├── InvoiceEndpoint.php
│   ├── PayoutEndpoint.php
│   ├── ConversionEndpoint.php
│   ├── SubPartnerEndpoint.php
│   ├── SubscriptionEndpoint.php
│   └── FiatPayoutEndpoint.php
├── Events/
│   ├── NowPaymentsEvent.php            # Base event class
│   ├── PaymentStatusChanged.php        # Payment status change event
│   ├── PayoutCompleted.php             # Payout completion event
│   └── ConversionFinished.php          # Conversion finished event
├── Exceptions/
│   └── NowPaymentsException.php
├── Facades/
│   └── NowPayments.php                 # Laravel facade
├── Handlers/
│   └── IpnHandler.php                  # Webhook handler
├── QueryBuilders/
│   ├── PaymentListQueryBuilder.php
│   └── PayoutListQueryBuilder.php
├── Support/
│   ├── HandlesIpnWebhooks.php          # Controller trait for webhooks
│   ├── PaymentStatus.php               # Payment status enum
│   ├── PayoutStatus.php                # Payout status enum
│   ├── ConversionStatus.php            # Conversion status enum
│   └── SubscriptionStatus.php          # Subscription status enum
└── NowPaymentsServiceProvider.php     # Service provider
```

### Key Components

- **NowPaymentsClient**: Base HTTP client that handles authentication, headers, error handling, and JWT token expiration
- **Endpoint Classes**: High-level API methods that use DTOs and return typed responses
- **Request DTOs**: Immutable request objects with validation (URL format, positive amounts, required fields)
- **Response DTOs**: Readonly response objects with `fromArray()` factory methods and proper numeric casting
- **QueryBuilders**: Fluent builders for list endpoint query parameters
- **IpnHandler**: Webhook signature verification using HMAC-SHA512 with retry detection
- **HandlesIpnWebhooks**: Laravel controller trait for easy webhook setup with auto-event firing
- **Status Enums**: Type-safe enums for payment, payout, conversion, and subscription statuses
- **Laravel Events**: Auto-fired events for webhook processing

## API Services Coverage

| Category | Services | Status |
|----------|-----------|--------|
| Auth & API Status | 2 | ✅ |
| Currencies | 3 | ✅ |
| Payments | 6 | ✅ |
| Invoices | 2 | ✅ |
| Payouts | 9 | ✅ |
| Conversions | 3 | ✅ |
| Sub-Partners | 10 | ✅ |
| Subscriptions | 8 | ✅ |
| Fiat Payouts | 8 | ✅ |
| **Total** | **51** | **✅** |

## Requirements

- PHP 8.2+
- Laravel 10.x, 11.x, or 12.x
- Guzzle HTTP Client 7.x
- JSON extension
- Hash extension

## Development

### Running Tests

```bash
composer test
```

### Code Style

This package uses Laravel Pint for code style:

```bash
composer format
```

## License

MIT License. See [LICENSE](LICENSE) for more information.

## Support

For issues and feature requests, please create an issue in the repository.

## Credits

Developed by Serenity Technologies for NOWPayments API integration.
