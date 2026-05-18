# SADAD Laravel

Laravel 10/11 package wrapping the [louis-innovations/sadad-php-sdk](https://github.com/louis-innovations/sadad-php-sdk) with Laravel conveniences: Service Provider, Facade, Events, built-in routes, and an Artisan command.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.1 |
| Laravel | ^10.0 or ^11.0 |
| louis-innovations/sadad-php-sdk | ^1.0 |

---

## Installation

```bash
composer require louis-innovations/sadad-laravel
```

The package auto-discovers via Laravel's package discovery. No manual provider registration required.

Publish the config file:

```bash
php artisan vendor:publish --tag=sadad-config
```

Optionally publish and run the transaction log migration:

```bash
php artisan vendor:publish --tag=sadad-migrations
php artisan migrate
```

---

## Environment Variables (.env)

Add the following to your `.env` file:

```dotenv
# Required
SADAD_MERCHANT_ID=1234567
SADAD_SECRET_KEY=your-secret-key-here
SADAD_WEBSITE=https://yourstore.com

# Environment: test | live (default: test)
SADAD_ENVIRONMENT=test

# Checkout version: v1.1 | v2.1 | v2.2 (default: v1.1)
SADAD_CHECKOUT_MODE=v1.1

# Language: eng | arb (default: eng)
SADAD_LANGUAGE=eng

# Callback and webhook URLs (SADAD will POST to these)
SADAD_CALLBACK_URL=https://yourstore.com/sadad/callback
SADAD_WEBHOOK_URL=https://yourstore.com/sadad/webhook

# Optional: prefix prepended to order IDs sent to SADAD
SADAD_ORDER_PREFIX=ORD-

# Redirect destinations after checkout callback
SADAD_REDIRECT_SUCCESS=/thank-you
SADAD_REDIRECT_FAILURE=/payment-failed

# Logging (default: false)
SADAD_LOGGING=true
SADAD_LOG_CHANNEL=stack

# Debug – logs raw request/response bodies (NEVER enable in production)
SADAD_DEBUG=false

# Log every webhook/callback to the sadad_transactions DB table
SADAD_LOG_TRANSACTIONS=false
```

---

## Facade Usage

```php
use LouisInnovations\SadadLaravel\Facades\Sadad;

// --- Checkout ---
$result = Sadad::checkout([
    'order_id'       => 'ORD-001',
    'amount'         => '100.000',
    'currency_code'  => 'QAR',
    'description'    => 'Order #001',
    'productdetail'  => [
        [
            'order_id'      => 'ORD-001',
            'amount'        => '100.000',
            'quantity'      => 1,
            'product_name'  => 'Dog Food 5kg',
        ],
    ],
]);

// Redirect to SADAD – the result includes a URL and hidden form parameters
return $result->toHtmlForm();           // auto-submitting HTML form
// or
return redirect($result->url);         // simple redirect (v2.x)

// --- Fetch a transaction ---
$transaction = Sadad::getTransaction('TXN123456');

// --- Refund ---
$refund = Sadad::refund('TXN123456');

// --- Create invoice ---
$invoice = Sadad::createInvoice([
    'customer_name'  => 'Ahmed Al-Mahmoud',
    'customer_email' => 'ahmed@example.com',
    'amount'         => '250.000',
    'currency_code'  => 'QAR',
    'due_date'       => '2025-12-31',
]);

// --- Share invoice ---
Sadad::shareInvoice('INV-001', 'email', 'customer@example.com');

// --- List invoices ---
$invoices = Sadad::listInvoices(['status' => 'pending']);
```

---

## Events

Listen for these events in your `EventServiceProvider` or `AppServiceProvider`:

| Event | When fired |
|---|---|
| `SadadWebhookReceived` | Every verified webhook received (before success/failure) |
| `SadadPaymentSucceeded` | Webhook or callback confirms successful payment |
| `SadadPaymentFailed` | Webhook or callback indicates failure/decline |
| `SadadRefundProcessed` | After a successful refund API call |

### Registering a listener

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Event;
use LouisInnovations\SadadLaravel\Events\SadadPaymentSucceeded;
use LouisInnovations\SadadLaravel\Events\SadadPaymentFailed;

Event::listen(SadadPaymentSucceeded::class, function ($event) {
    $order       = $event->result->orderNumber;
    $transaction = $event->result->transactionNumber;
    $amount      = $event->result->amount;

    // Mark order as paid, send confirmation email, etc.
    Order::where('order_number', $order)->update(['status' => 'paid']);
});

Event::listen(SadadPaymentFailed::class, function ($event) {
    // Notify customer, release reserved stock, etc.
});
```

### Event properties

**SadadPaymentSucceeded / SadadPaymentFailed / SadadWebhookReceived**

```php
$event->result->isSuccess         // bool
$event->result->message           // string
$event->result->transactionNumber // string
$event->result->orderNumber       // string
$event->result->amount            // float
$event->result->merchantId        // string
$event->result->isTestMode        // bool
$event->result->invoiceNumber     // string|null

$event->payload                   // array – raw POST payload from SADAD
```

**SadadRefundProcessed**

```php
$event->transactionNumber // string – the refunded transaction
$event->response          // array  – raw API response
```

---

## Webhook Setup

The package registers the following routes automatically:

```
POST /sadad/callback   → SadadCallbackController
POST /sadad/webhook    → SadadWebhookController  (signature-verified)
```

CSRF protection is automatically disabled for both routes.

Configure your SADAD merchant dashboard with:

- **Callback URL**: `https://yourstore.com/sadad/callback`
- **Webhook URL**: `https://yourstore.com/sadad/webhook`

The webhook route uses `VerifySadadWebhook` middleware which validates the SHA-256 checksumhash using your `SADAD_SECRET_KEY`. The controller always responds `200 {"status":"success"}` so SADAD stops retrying.

---

## Artisan Command

```bash
php artisan sadad:test
```

Validates your configuration and tests authentication with the SADAD API:

```
SADAD Payment Gateway – Configuration Test
--------------------------------------------------

 Setting          Value
 merchant_id      1234567
 secret_key       ************************5678
 website          https://yourstore.com
 environment      test
 ...

Validating required configuration...
  [OK] All required configuration values are present and valid.

Testing SADAD API authentication...
  [OK] Authentication successful – SADAD API is reachable.

--------------------------------------------------
SADAD configuration test passed.
```

---

## Transaction Logging (Optional)

To persist every webhook and callback event to a database table:

1. Publish and run the migration:

```bash
php artisan vendor:publish --tag=sadad-migrations
php artisan migrate
```

2. Enable logging in `.env`:

```dotenv
SADAD_LOG_TRANSACTIONS=true
```

This creates a `sadad_transactions` table with columns: `transaction_number`, `order_number`, `amount`, `currency`, `is_success`, `response_code`, `response_message`, `transaction_status`, `merchant_id`, `invoice_number`, `is_test_mode`, `source`, `raw_payload`.

---

## Checkout Versions

| Version | Description |
|---|---|
| `v1.1` | Standard hosted checkout (redirect with HTML form POST) |
| `v2.1` | Updated hosted checkout |
| `v2.2` | Embedded checkout page (`secure.sadadqa.com`) |

Set the default in `.env` with `SADAD_CHECKOUT_MODE`, or pass it per-request:

```php
Sadad::checkout($orderData, 'v2.2');
```

---

## Testing

```bash
composer test
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Louis Innovations](https://www.louis-innovations.com)
