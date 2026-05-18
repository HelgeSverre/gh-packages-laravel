# Laravel M-Pesa

[![Latest Version on Packagist](https://img.shields.io/packagist/v/felixmuhoro/laravel-mpesa.svg?style=flat-square)](https://packagist.org/packages/felixmuhoro/laravel-mpesa)
[![Total Downloads](https://img.shields.io/packagist/dt/felixmuhoro/laravel-mpesa.svg?style=flat-square)](https://packagist.org/packages/felixmuhoro/laravel-mpesa)
[![License](https://img.shields.io/packagist/l/felixmuhoro/laravel-mpesa.svg?style=flat-square)](LICENSE)

A modern, fully-typed **M-Pesa Daraja 2.0** integration for **Laravel 10 / 11 / 12 / 13**.
Battle-tested in production against real customer traffic — including the undocumented error codes Safaricom's own docs don't mention.

## Quick start

```bash
composer require felixmuhoro/laravel-mpesa
```

```php
use FelixMuhoro\Mpesa\Facades\Mpesa;

$response = Mpesa::stkPush(
    phone: '0712345678',
    amount: 100,
    reference: 'ORDER-1234',
    description: 'Payment for order 1234',
);

if ($response->accepted()) {
    // Persist $response->checkoutRequestId to reconcile with the callback
}
```

Full setup, callbacks, C2B, B2C, and result-code handling below.

## Why this package

Most M-Pesa Laravel packages on Packagist were built for Laravel 7/8 and return raw arrays. This one is different:

- **Laravel 10 / 11 / 12 / 13** first-class — PHP 8.1+ enums, readonly DTOs, typed properties
- **Exhaustive result-code dictionary** — 15+ Safaricom codes mapped including the undocumented `4999` (still processing, NOT failed)
- **Correct async handling** — STK query correctly distinguishes "payment pending" from "payment failed" so you never mark a successful payment as failed because you polled too early
- **Events-driven** — `PaymentSuccessful`, `PaymentFailed`, `StkPushInitiated` dispatched on every terminal state
- **Secure callbacks** — IP allow-listing (Safaricom's 12 production IPs preloaded) + optional query-string shared-secret middleware
- **HTTP Faking friendly** — uses Laravel's `Illuminate\Http\Client\Factory`, so tests never hit real Daraja

## Installation

```bash
composer require felixmuhoro/laravel-mpesa
```

Publish the config:

```bash
php artisan vendor:publish --tag=mpesa-config
php artisan vendor:publish --tag=mpesa-migrations
php artisan migrate
```

Add credentials to `.env`:

```env
MPESA_ENVIRONMENT=sandbox               # or "production"
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret

# STK Push
MPESA_STK_SHORT_CODE=174379
MPESA_STK_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_STK_CALLBACK_URL=https://yourapp.com/mpesa/callback/stk

# Optional: callback shared secret
MPESA_CALLBACK_SECRET_KEY=some-long-random-string
```

Get sandbox credentials free at [developer.safaricom.co.ke](https://developer.safaricom.co.ke).

## Usage

### 1. STK Push (Lipa Na M-Pesa Online)

```php
use FelixMuhoro\Mpesa\Facades\Mpesa;

$response = Mpesa::stkPush(
    phone: '0712345678',
    amount: 100,
    reference: 'ORDER-1234',
    description: 'Payment for order 1234'
);

if ($response->accepted()) {
    // Save $response->checkoutRequestId so you can match the callback later
    session(['mpesa_checkout' => $response->checkoutRequestId]);
}
```

Phone numbers are accepted in any Kenyan format — `0712...`, `712...`, `254712...`, `+254 712 345 678` — all normalise to Safaricom's required `2547XXXXXXXX`.

### 2. STK Query (check payment status)

```php
$result = Mpesa::stkQuery($checkoutRequestId);

if ($result->isCompleted()) {
    // Mark order paid
} elseif ($result->isPending()) {
    // Retry in a few seconds — the customer hasn't acted yet
} elseif ($result->isFailed()) {
    // Customer cancelled / wrong PIN / etc. — $result->message has details
}
```

### 3. Callbacks — handle via events

The package ships routes at `/mpesa/callback/stk`, `/mpesa/callback/c2b/confirm`, etc., already protected by IP allow-listing + optional shared-secret middleware.

Your job is to listen for events:

```php
// app/Providers/EventServiceProvider.php
use FelixMuhoro\Mpesa\Events\PaymentSuccessful;
use FelixMuhoro\Mpesa\Events\PaymentFailed;

protected $listen = [
    PaymentSuccessful::class => [MarkOrderPaid::class],
    PaymentFailed::class     => [NotifyCustomerOfFailure::class],
];
```

```php
// app/Listeners/MarkOrderPaid.php
public function handle(PaymentSuccessful $event): void
{
    Order::where('checkout_request_id', $event->payload->checkoutRequestId)
        ->update([
            'status'        => 'paid',
            'mpesa_receipt' => $event->payload->mpesaReceiptNumber,
            'paid_amount'   => $event->payload->amount,
            'paid_at'       => now(),
        ]);
}
```

### 4. C2B — receive paybill / till payments

Register your confirmation + validation URLs **once**:

```php
Mpesa::c2bRegisterUrls(
    confirmationUrl: route('mpesa.callback.c2b.confirm'),
    validationUrl:   route('mpesa.callback.c2b.validate'),
);
```

Listen for the same events (the C2B confirmation controller also dispatches `PaymentSuccessful`).

In **sandbox** you can simulate an inbound payment:

```php
Mpesa::c2bSimulate('0712345678', 50, 'BILL-99');
```

### 5. B2C — send money to customers

```php
Mpesa::b2cSend(
    phone: '0712345678',
    amount: 500,
    commandId: 'BusinessPayment',   // or SalaryPayment / PromotionPayment
    remarks: 'Referral bonus',
);
```

### 6. Account balance, status queries, reversals

```php
Mpesa::accountBalance();
Mpesa::transactionStatus('LKXXXX1234');
Mpesa::reverse('LKXXXX1234', 100, 'Wrong recipient');
```

## Handling result codes

Any time you receive a result code from Safaricom you can normalise it:

```php
use FelixMuhoro\Mpesa\Enums\ResultCode;

ResultCode::isCompleted('0');        // true
ResultCode::isFailed('1032');        // true — customer cancelled
ResultCode::isPending('4999');       // true — undocumented "still processing"
ResultCode::isPending('random-code');// true — unknown codes are treated as pending

ResultCode::resolve('1');
// ['status' => 'failed', 'message' => 'Insufficient M-Pesa balance...', 'code' => '1']
```

## Callback security

Production callbacks are protected out of the box:

- **IP allow-listing** — Safaricom's 12 production callback IPs are preloaded in config. Set `MPESA_CALLBACK_ALLOWED_IPS=""` to disable (NOT recommended in production).
- **Shared secret** — set `MPESA_CALLBACK_SECRET_KEY=...` and include `?key=...` in the callback URL you register with Safaricom.

Both are layered — requests that fail either check throw `InvalidCallbackException`.

## Testing

The package ships PHPUnit tests that mock Daraja responses using `Http::fake()`:

```bash
composer install
composer test
```

## Supported Laravel / PHP versions

| Package | PHP       | Laravel         |
|---------|-----------|-----------------|
| 1.x     | 8.1 – 8.4 | 10, 11, 12, 13  |

## Credits

- Author — [Felix Muhoro](https://felixmuhoro.dev) (`hi@felixmuhoro.dev`)
- Safaricom Daraja API docs — https://developer.safaricom.co.ke

## License

MIT — see [LICENSE](LICENSE).
