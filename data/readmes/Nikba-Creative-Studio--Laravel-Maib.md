# laravel-maib

<p align="center">
  <img src="logo.svg" alt="Nikba Creative Studio" width="156" height="44">
</p>

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nikba/laravel-maib.svg)](https://packagist.org/packages/nikba/laravel-maib)
[![License](https://img.shields.io/packagist/l/nikba/laravel-maib.svg)](LICENSE)

A Laravel 12 package for the **maib e-Commerce API** — full coverage of all payment types, automatic token management, and HMAC-SHA256 callback webhook handling.

**API documentation:** https://docs.maibmerchants.md/e-commerce

---

## Features

- Direct payment (one-step charge)
- Two-step payment (hold → capture or cancel)
- Recurring payments (register card + server-side execute)
- One-click payments (register card + redirect execute)
- Payment refund (partial or full)
- Payment information query
- Saved card deletion
- Callback webhook handling with HMAC-SHA256 signature validation
- Laravel Events dispatched on successful/failed callbacks
- Automatic Bearer token generation, caching, and refresh
- Full PHPUnit test suite

---

## Requirements

| | Version |
|---|---|
| PHP | `^8.2` |
| Laravel | `^12.0` |

---

## Installation

```bash
composer require nikba/laravel-maib
```

### Publish the configuration

```bash
php artisan vendor:publish --tag=maib-config
```

### Environment variables

Add the following to your `.env` file:

```env
MAIB_PROJECT_ID=your-project-id
MAIB_PROJECT_SECRET=your-project-secret
MAIB_SIGNATURE_KEY=your-signature-key
MAIB_ENV=sandbox
MAIB_CALLBACK_ROUTE=/maib/callback
```

Credentials are available in [maibmerchants.md](https://maibmerchants.md) under your project settings.

---

## Configuration

After publishing, edit `config/maib.php`:

```php
return [
    'project_id'     => env('MAIB_PROJECT_ID'),
    'project_secret' => env('MAIB_PROJECT_SECRET'),
    'signature_key'  => env('MAIB_SIGNATURE_KEY'),
    'environment'    => env('MAIB_ENV', 'production'),
    'base_url'       => 'https://api.maibmerchants.md/v1',
    'callback_route' => env('MAIB_CALLBACK_ROUTE', '/maib/callback'),
    'cache_driver'   => env('MAIB_CACHE_DRIVER', null),
    'cache_prefix'   => 'maib_token',
];
```

---

## Usage

### Direct Payment

```php
use Nikba\LaravelMaib\Facades\Maib;
use Nikba\LaravelMaib\Dto\Requests\DirectPaymentRequest;
use Nikba\LaravelMaib\Dto\PaymentItem;
use Nikba\LaravelMaib\Enums\Currency;
use Nikba\LaravelMaib\Enums\Language;

$response = Maib::directPayment(
    new DirectPaymentRequest(
        amount:      99.99,
        currency:    Currency::MDL,
        clientIp:    $request->ip(),
        language:    Language::RO,
        orderId:     'ORDER-001',
        description: 'Order #001',
        callbackUrl: route('maib.callback'),
        okUrl:       route('payment.success'),
        failUrl:     route('payment.fail'),
        items: [
            new PaymentItem(id: '1', name: 'Product A', price: 99.99, quantity: 1),
        ],
    )
);

return redirect($response->payUrl);
```

### Two-Step Payment (Hold → Capture)

```php
use Nikba\LaravelMaib\Dto\Requests\CapturePaymentRequest;
use Nikba\LaravelMaib\Dto\Requests\HoldPaymentRequest;

// Step 1: Hold
$hold = Maib::hold(new HoldPaymentRequest(
    amount:   99.99,
    currency: Currency::MDL,
    clientIp: $request->ip(),
    language: Language::RO,
));

return redirect($hold->payUrl);

// Step 2: Capture (after callback confirms hold)
$capture = Maib::capture(new CapturePaymentRequest(
    payId:         $payId,
    confirmAmount: 99.99, // optional — omit to capture full hold amount
));
```

### Recurring Payments

```php
use Nikba\LaravelMaib\Dto\Requests\ExecuteRecurringRequest;
use Nikba\LaravelMaib\Dto\Requests\SaveCardRecurringRequest;

// Registration (once per customer — redirect to 3DS checkout)
$save = Maib::savecardRecurring(new SaveCardRecurringRequest(
    billerExpiry: '1228',
    clientIp:     $request->ip(),
    currency:     Currency::MDL,
    language:     Language::RO,
    email:        'user@example.com',
));

return redirect($save->payUrl);
// Callback will return billerId — store it for the customer.

// Server-side execution (no customer redirect)
$response = Maib::executeRecurring(new ExecuteRecurringRequest(
    billerId: $user->maib_biller_id,
    amount:   29.99,
    currency: Currency::MDL,
    orderId:  'SUBSCRIPTION-' . now()->format('Y-m'),
));

if ($response->status === \Nikba\LaravelMaib\Enums\TransactionStatus::OK) {
    // subscription renewed
}
```

### One-Click Payments

```php
use Nikba\LaravelMaib\Dto\Requests\ExecuteOneclickRequest;
use Nikba\LaravelMaib\Dto\Requests\SaveCardOneclickRequest;

// Registration
$save = Maib::savecardOneclick(new SaveCardOneclickRequest(
    billerExpiry: '1228',
    clientIp:     $request->ip(),
    currency:     Currency::MDL,
    language:     Language::RO,
    email:        'user@example.com',
));

return redirect($save->payUrl);

// Execution (redirects customer to checkout for 3DS confirmation)
$response = Maib::executeOneclick(new ExecuteOneclickRequest(
    billerId:  $user->maib_biller_id,
    amount:    49.99,
    currency:  Currency::MDL,
    clientIp:  $request->ip(),
    language:  Language::RO,
));

return redirect($response->payUrl);
```

### Refund

```php
use Nikba\LaravelMaib\Dto\Requests\RefundRequest;

$response = Maib::refund(new RefundRequest(
    payId:        $payId,
    refundAmount: 30.00, // optional — omit to refund the full amount
));
```

### Payment Info

```php
$info = Maib::payInfo($payId);

echo $info->status->value;   // 'OK', 'FAILED', etc.
echo $info->cardNumber;
```

### Delete Saved Card

```php
$response = Maib::deleteCard($billerId);
```

---

## Handling Callbacks

The package automatically registers the callback route at `MAIB_CALLBACK_ROUTE` (default: `/maib/callback`). This route is excluded from CSRF middleware.

Register this URL in your maibmerchants.md project settings.

**Allowed callback IPs (optional firewall rule):** `91.250.245.70`, `91.250.245.71`, `91.250.245.142`

### Listening for Events

```php
// In App\Providers\EventServiceProvider (or using #[AsEventListener])
use Nikba\LaravelMaib\Events\MaibPaymentFailed;
use Nikba\LaravelMaib\Events\MaibPaymentReceived;

Event::listen(MaibPaymentReceived::class, function (MaibPaymentReceived $event) {
    $payload = $event->payload;

    Order::where('maib_pay_id', $payload->payId)
        ->update([
            'status'      => 'paid',
            'rrn'         => $payload->rrn,
            'approval'    => $payload->approval,
            'card_number' => $payload->cardNumber,
        ]);
});

Event::listen(MaibPaymentFailed::class, function (MaibPaymentFailed $event) {
    Order::where('maib_pay_id', $event->payload->payId)
        ->update(['status' => 'failed']);
});
```

> **Important:** Always return HTTP 200 from your listener logic — the package's callback handler already does this. maib retries the callback at increasing intervals (`10, 60, 300, 600, 3600, 43200, 86400` seconds) if it does not receive a 200 response. Implement idempotency in your listeners.

---

## Testing

```bash
composer test
```

---

## Author

**Nicolai Bargan**  
[Nikba Creative Studio](https://nikba.com)  
[office@nikba.com](mailto:office@nikba.com)

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.
