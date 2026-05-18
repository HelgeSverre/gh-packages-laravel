# ZevPay for Laravel

Laravel integration for [ZevPay Checkout](https://docs.zevpaycheckout.com). Provides a service provider, facade, webhook handling with signature verification, and event dispatching.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require zevpay/laravel
```

The package uses Laravel auto-discovery, so no manual provider registration is needed.

Publish the config file:

```bash
php artisan vendor:publish --tag=zevpay-config
```

Add your API keys to `.env`:

```env
ZEVPAY_SECRET_KEY=sk_live_your_secret_key
ZEVPAY_PUBLIC_KEY=pk_live_your_public_key
ZEVPAY_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Usage

### Facade

```php
use ZevPay\Laravel\Facades\ZevPay;

// Initialize a checkout session
$session = ZevPay::checkout()->initialize([
    'amount' => 500000, // ₦5,000 in kobo
    'email' => 'customer@example.com',
    'reference' => 'ORDER-123',
    'callback_url' => 'https://yoursite.com/callback',
]);

// Verify a checkout session
$result = ZevPay::checkout()->verify($sessionId);

// Create a transfer
$transfer = ZevPay::transfers()->create([
    'type' => 'bank_transfer',
    'amount' => 100000,
    'account_number' => '0123456789',
    'bank_code' => '044',
    'narration' => 'Payout',
]);

// Create an invoice
$invoice = ZevPay::invoices()->create([
    'customer_name' => 'Jane Doe',
    'customer_email' => 'jane@example.com',
    'due_date' => '2026-04-01',
    'line_items' => [
        ['description' => 'Web design', 'quantity' => 1, 'unit_price' => 5000000],
    ],
]);
```

### Dependency injection

```php
use ZevPay\ZevPay;

class PaymentController extends Controller
{
    public function checkout(ZevPay $zevpay)
    {
        $session = $zevpay->checkout->initialize([
            'amount' => 500000,
            'email' => 'customer@example.com',
        ]);

        return redirect($session['checkout_url']);
    }
}
```

### Available resources

| Resource | Facade accessor | Methods |
|----------|----------------|---------|
| Checkout | `ZevPay::checkout()` | `initialize`, `verify`, `get`, `selectPaymentMethod` |
| Transfers | `ZevPay::transfers()` | `create`, `list`, `get`, `verify`, `listBanks`, `resolveAccount`, `calculateCharges`, `getBalance` |
| Invoices | `ZevPay::invoices()` | `create`, `list`, `get`, `update`, `send`, `cancel` |
| Static PayID | `ZevPay::staticPayId()` | `create`, `list`, `get`, `update`, `deactivate`, `reactivate` |
| Dynamic PayID | `ZevPay::dynamicPayId()` | `create`, `list`, `get`, `deactivate` |
| Virtual Accounts | `ZevPay::virtualAccounts()` | `create`, `list`, `get` |
| Wallet | `ZevPay::wallet()` | `get`, `update`, `listMembers`, `addMember`, `removeMember`, `updateMember` |

## Webhooks

The package registers a webhook route at `POST /webhooks/zevpay` with automatic signature verification.

### Setup

1. Copy the webhook URL (`https://yoursite.com/webhooks/zevpay`)
2. Paste it in your [ZevPay Dashboard](https://dashboard.zevpaycheckout.com) webhook settings
3. Copy the webhook secret and add it to `.env` as `ZEVPAY_WEBHOOK_SECRET`

### Listening to events

Register listeners in your `EventServiceProvider` or use closures:

```php
use ZevPay\Laravel\Events\ChargeSuccess;
use ZevPay\Laravel\Events\TransferSuccess;
use ZevPay\Laravel\Events\WebhookReceived;

// Listen to a specific event
class HandleChargeSuccess
{
    public function handle(ChargeSuccess $event): void
    {
        $reference = $event->payload['data']['reference'];
        $amount = $event->payload['data']['amount'];

        // Update your order, send receipt, etc.
    }
}

// Or listen to all webhook events
class LogAllWebhooks
{
    public function handle(WebhookReceived $event): void
    {
        logger()->info("ZevPay webhook: {$event->eventType}", $event->payload);
    }
}
```

### Available events

| Event class | Webhook type |
|-------------|-------------|
| `ChargeSuccess` | `charge.success` |
| `TransferSuccess` | `transfer.success` |
| `TransferFailed` | `transfer.failed` |
| `TransferReversed` | `transfer.reversed` |
| `InvoiceCreated` | `invoice.created` |
| `InvoiceSent` | `invoice.sent` |
| `InvoicePaymentReceived` | `invoice.payment_received` |
| `InvoicePaid` | `invoice.paid` |
| `InvoiceOverdue` | `invoice.overdue` |
| `InvoiceCancelled` | `invoice.cancelled` |
| `WebhookReceived` | All events (generic) |

### Custom webhook path

Change the webhook path in your `.env`:

```env
ZEVPAY_WEBHOOK_PATH=api/webhooks/zevpay
```

### CSRF exemption

The webhook route is automatically excluded from CSRF verification since it uses the `VerifyWebhookSignature` middleware. If you're using Laravel 11+ with the default middleware stack, no additional configuration is needed. For older versions, add the path to your `VerifyCsrfToken` middleware:

```php
protected $except = [
    'webhooks/zevpay',
];
```

## Artisan commands

```bash
# Verify your API keys are configured correctly
php artisan zevpay:verify-keys

# Send a test webhook to your endpoint
php artisan zevpay:webhook-test
php artisan zevpay:webhook-test transfer.success
```

## Configuration

```php
// config/zevpay.php
return [
    'secret_key' => env('ZEVPAY_SECRET_KEY'),
    'public_key' => env('ZEVPAY_PUBLIC_KEY'),

    'webhook' => [
        'secret' => env('ZEVPAY_WEBHOOK_SECRET'),
        'path' => env('ZEVPAY_WEBHOOK_PATH', 'webhooks/zevpay'),
    ],

    'options' => [
        'base_url' => env('ZEVPAY_BASE_URL', 'https://api.zevpaycheckout.com'),
        'timeout' => (int) env('ZEVPAY_TIMEOUT', 30),
        'max_retries' => (int) env('ZEVPAY_MAX_RETRIES', 2),
    ],
];
```

## Error handling

The package uses the [ZevPay PHP SDK](https://docs.zevpaycheckout.com/sdks/php) exception hierarchy:

```php
use ZevPay\Exceptions\ValidationException;
use ZevPay\Exceptions\AuthenticationException;
use ZevPay\Exceptions\NotFoundException;

try {
    ZevPay::checkout()->initialize([/* ... */]);
} catch (ValidationException $e) {
    // $e->details contains field-level errors
} catch (AuthenticationException $e) {
    // Invalid API key
} catch (NotFoundException $e) {
    // Resource not found
}
```

## License

MIT
