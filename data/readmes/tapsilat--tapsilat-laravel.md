# Tapsilat Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/tapsilat/tapsilat-laravel.svg?style=flat-square)](https://packagist.org/packages/tapsilat/tapsilat-laravel)
[![Tests](https://github.com/tapsilat/tapsilat-laravel/actions/workflows/tests.yml/badge.svg)](https://github.com/tapsilat/tapsilat-laravel/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/tapsilat/tapsilat-laravel.svg?style=flat-square)](https://packagist.org/packages/tapsilat/tapsilat-laravel)

Laravel integration package for the Tapsilat Payment Gateway. This package provides a seamless integration with the [Tapsilat PHP SDK](https://github.com/tapsilat/tapsilat-php) for Laravel applications.

## Requirements

- PHP 8.1+
- Laravel 10.x or 11.x

## Installation

Install the package via Composer:

```bash
composer require tapsilat/tapsilat-laravel
```

### Publish Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="tapsilat-config"
```

Or run the install command which will publish the config and add environment variables:

```bash
php artisan tapsilat:install
```

## Configuration

Add the following environment variables to your `.env` file:

```env
TAPSILAT_API_KEY=your_api_key_here
TAPSILAT_WEBHOOK_SECRET=your_webhook_secret_here

# Optional settings
TAPSILAT_BASE_URL=https://panel.tapsilat.dev/api/v1
TAPSILAT_TIMEOUT=30
TAPSILAT_DEFAULT_CURRENCY=TRY
TAPSILAT_DEFAULT_LOCALE=tr
TAPSILAT_PAYMENT_SUCCESS_URL=https://yoursite.com/payment/success
TAPSILAT_PAYMENT_FAILURE_URL=https://yoursite.com/payment/failure
TAPSILAT_LOGGING_ENABLED=false
```

## Usage

### Using the Facade

```php
use Tapsilat\Laravel\Facades\Tapsilat;

// Create a simple order
$order = Tapsilat::createSimpleOrder(
    amount: 100.00,
    buyerName: 'John',
    buyerSurname: 'Doe',
    buyerEmail: 'john@example.com'
);

// Get checkout URL
$checkoutUrl = $order->getCheckoutUrl();

// Redirect user to checkout
return redirect($checkoutUrl);
```

### Using Dependency Injection

```php
use Tapsilat\Laravel\TapsilatManager;

class PaymentController extends Controller
{
    public function __construct(
        private TapsilatManager $tapsilat
    ) {}

    public function createPayment(Request $request)
    {
        $order = $this->tapsilat->createSimpleOrder(
            100.00,
            'John',
            'Doe',
            'john@example.com'
        );

        return redirect($order->getCheckoutUrl());
    }
}
```

### Creating Orders with Full Options

```php
use Tapsilat\Laravel\Facades\Tapsilat;
use Tapsilat\Models\BuyerDTO;
use Tapsilat\Models\OrderCreateDTO;
use Tapsilat\Models\BasketItemDTO;
use Tapsilat\Models\BillingAddressDTO;

// Create buyer
$buyer = new BuyerDTO(
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    gsm_number: '+905551234567'
);

// Create basket items
$basketItem = new BasketItemDTO(
    category1: 'Electronics',
    category2: 'Phones',
    id: 'ITEM-001',
    item_type: 'PHYSICAL',
    name: 'iPhone 15 Pro',
    price: 50000.00,
    quantity: 1
);

// Create billing address
$billingAddress = new BillingAddressDTO(
    address: '123 Main St',
    city: 'Istanbul',
    contact_name: 'John Doe',
    country: 'TR',
    zip_code: '34000'
);

// Create order DTO
$orderDto = new OrderCreateDTO(
    amount: 50000.00,
    currency: 'TRY',
    locale: 'tr',
    buyer: $buyer,
    basket_items: [$basketItem],
    billing_address: $billingAddress,
    conversation_id: 'unique-conversation-id',
    payment_success_url: 'https://yoursite.com/success',
    payment_failure_url: 'https://yoursite.com/failure'
);

$order = Tapsilat::createOrder($orderDto);

return redirect($order->getCheckoutUrl());
```

### Order Operations

```php
use Tapsilat\Laravel\Facades\Tapsilat;
use Tapsilat\Models\RefundOrderDTO;

// Get order by reference ID
$order = Tapsilat::getOrder('order-reference-id');

// Get order by conversation ID
$order = Tapsilat::getOrderByConversationId('conversation-id');

// Get order list with pagination
$orders = Tapsilat::getOrderList(page: 1, perPage: 10);

// Cancel an order
Tapsilat::cancelOrder('order-reference-id');

// Refund an order (partial)
Tapsilat::refundOrderSimple(
    amount: 50.00,
    referenceId: 'order-reference-id'
);

// Refund entire order
Tapsilat::refundAllOrder('order-reference-id');

// Get order status
$status = Tapsilat::getOrderStatus('order-reference-id');

// Get order transactions
$transactions = Tapsilat::getOrderTransactions('order-reference-id');

// Get system order statuses
$statuses = Tapsilat::getSystemOrderStatuses();

// Process order accounting
use Tapsilat\Models\OrderAccountingRequest;
$accountingRequest = new OrderAccountingRequest('order-reference-id');
Tapsilat::orderAccounting($accountingRequest);

// Process order post-authorization
use Tapsilat\Models\OrderPostAuthRequest;
$postAuthRequest = new OrderPostAuthRequest(100.00, 'order-reference-id');
Tapsilat::orderPostAuth($postAuthRequest);
```

### Subscription Operations

```php
use Tapsilat\Laravel\Facades\Tapsilat;
use Tapsilat\Models\SubscriptionCreateRequest;
use Tapsilat\Models\SubscriptionBillingDTO;
use Tapsilat\Models\SubscriptionUserDTO;

// Create billing information
$billing = new SubscriptionBillingDTO(
    address: '123 Main St',
    city: 'Istanbul',
    contact_name: 'John Doe',
    country: 'TR',
    zip_code: '34000'
);

// Create user information
$user = new SubscriptionUserDTO(
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '5551234567'
);

// Create subscription request
$subscription = new SubscriptionCreateRequest(
    amount: 99.99,
    currency: 'TRY',
    title: 'Monthly Premium Plan',
    period: 30,
    cycle: 1,
    payment_date: 1,
    external_reference_id: 'sub-ext-123',
    success_url: 'https://yoursite.com/subscription/success',
    failure_url: 'https://yoursite.com/subscription/failure',
    billing: $billing,
    user: $user
);

$response = Tapsilat::createSubscription($subscription);
echo "Subscription Reference: " . $response->getReferenceId();

// Get subscription by reference ID
$subscription = Tapsilat::getSubscriptionByReferenceId('sub-reference-id');

// Get subscription by external ID
$subscription = Tapsilat::getSubscriptionByExternalId('sub-ext-123');

// List subscriptions
$subscriptions = Tapsilat::listSubscriptions(page: 1, perPage: 10);

// Cancel subscription
Tapsilat::cancelSubscriptionByReferenceId('sub-reference-id');
```

### Organization Settings

```php
use Tapsilat\Laravel\Facades\Tapsilat;

$settings = Tapsilat::getOrganizationSettings();
```

### Health Check

```php
use Tapsilat\Laravel\Facades\Tapsilat;

$health = Tapsilat::healthCheck();

// Or use artisan command
// php artisan tapsilat:health
```

## Webhook Handling

The package automatically registers a webhook endpoint at `/tapsilat/webhook` when you have configured `TAPSILAT_WEBHOOK_SECRET`.

### Available Events

Listen to these events in your application:

```php
use Tapsilat\Laravel\Events\OrderPaid;
use Tapsilat\Laravel\Events\OrderFailed;
use Tapsilat\Laravel\Events\OrderRefunded;
use Tapsilat\Laravel\Events\SubscriptionCreated;
use Tapsilat\Laravel\Events\SubscriptionCanceled;
use Tapsilat\Laravel\Events\SubscriptionPaymentSucceeded;
use Tapsilat\Laravel\Events\SubscriptionPaymentFailed;
use Tapsilat\Laravel\Events\WebhookReceived;
```

### Creating Event Listeners

```php
// app/Listeners/HandleOrderPaid.php
namespace App\Listeners;

use Tapsilat\Laravel\Events\OrderPaid;

class HandleOrderPaid
{
    public function handle(OrderPaid $event): void
    {
        $referenceId = $event->getReferenceId();
        $amount = $event->getAmount();
        $currency = $event->getCurrency();

        // Update your order status
        // Send confirmation email
        // etc.
    }
}
```

### Registering Listeners

In your `EventServiceProvider`:

```php
use Tapsilat\Laravel\Events\OrderPaid;
use Tapsilat\Laravel\Events\OrderFailed;
use App\Listeners\HandleOrderPaid;
use App\Listeners\HandleOrderFailed;

protected $listen = [
    OrderPaid::class => [
        HandleOrderPaid::class,
    ],
    OrderFailed::class => [
        HandleOrderFailed::class,
    ],
];
```

### Manual Webhook Verification

If you need to handle webhooks manually:

```php
use Tapsilat\Laravel\Facades\Tapsilat;

$payload = request()->getContent();
$signature = request()->header('X-Tapsilat-Signature');

if (Tapsilat::verifyWebhook($payload, $signature)) {
    // Process webhook
    $data = json_decode($payload, true);
}
```

## Accessing the Raw API Client

If you need direct access to the underlying Tapsilat PHP SDK:

```php
use Tapsilat\Laravel\Facades\Tapsilat;

$client = Tapsilat::client();

// Now you can use any method from the SDK directly
$response = $client->makeCustomRequest(...);
```

## Error Handling

```php
use Tapsilat\Laravel\Facades\Tapsilat;
use Tapsilat\APIException;

try {
    $order = Tapsilat::createSimpleOrder(100, 'John', 'Doe', 'john@example.com');
} catch (APIException $e) {
    // Handle Tapsilat API errors
    $statusCode = $e->statusCode;
    $errorCode = $e->code;
    $errorMessage = $e->error;

    Log::error('Tapsilat API Error', [
        'status_code' => $statusCode,
        'code' => $errorCode,
        'error' => $errorMessage,
    ]);
}
```

## Logging

Enable logging in your `.env` file:

```env
TAPSILAT_LOGGING_ENABLED=true
TAPSILAT_LOG_CHANNEL=stack
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you discover a security vulnerability, please send an e-mail to support@tapsilat.dev.

## Credits

- [Tapsilat](https://github.com/tapsilat)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
