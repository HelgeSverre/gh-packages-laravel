# Netopay — Laravel package for NETOPIA Payments

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mariandumitru/netopay.svg?style=flat-square)](https://packagist.org/packages/mariandumitru/netopay)
[![Total Downloads](https://img.shields.io/packagist/dt/mariandumitru/netopay.svg?style=flat-square)](https://packagist.org/packages/mariandumitru/netopay)
[![License](https://img.shields.io/packagist/l/mariandumitru/netopay.svg?style=flat-square)](LICENSE.md)

A Laravel package for integrating with the [NETOPIA Payments](https://netopia-payments.com) API. Supports hosted-page card payments, recurring payments via saved card tokens, IPN webhook handling, 3DS authentication, and payment status retrieval.

The package handles all HTTP communication with Netopia and fires **Laravel events** your application listens to — keeping your business logic completely separate from the payment protocol.

---

## Requirements

- PHP 8.3+
- Laravel 13+

---

## Installation

```bash
composer require mariandumitru/netopay
```

The service provider and `Netopay` facade are registered automatically via Laravel package discovery.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=netopay-config
```

---

## Configuration

Add the following to your `.env` file:

```env
NETOPIA_SANDBOX=true

# Sandbox credentials
NETOPIA_API_KEY_SANDBOX=your-sandbox-api-key
NETOPIA_POS_SIGNATURE_SANDBOX=your-sandbox-pos-signature

# Live credentials
NETOPIA_API_KEY_LIVE=your-live-api-key
NETOPIA_POS_SIGNATURE_LIVE=your-live-pos-signature

# Where Netopia sends the IPN callback (must be publicly accessible)
NETOPIA_NOTIFY_URL=https://yourdomain.com/netopia/ipn

# Where Netopia redirects the user after payment
NETOPIA_REDIRECT_URL=https://yourdomain.com/netopia/return

# Where your app redirects the user after processing the return
NETOPIA_AFTER_PAYMENT_REDIRECT=/dashboard
```

Set `NETOPIA_SANDBOX=false` in production. The package automatically switches API keys and endpoints based on this value.

### Routes

The package registers two routes automatically:

| Method | URI | Description |
|---|---|---|
| `POST` | `/netopia/ipn` | Netopia IPN webhook |
| `GET\|POST` | `/netopia/return` | User return after payment |

> **Important:** Exclude these routes from CSRF verification in your `bootstrap/app.php` (Laravel 11+) or `App\Http\Middleware\VerifyCsrfToken.php` (Laravel 10):

```php
// bootstrap/app.php (Laravel 11+)
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'netopia/ipn',
        'netopia/return',
    ]);
})
```

You can disable the package routes entirely and register your own:

```php
// config/netopay.php
'routes' => [
    'enabled'    => false,
    'prefix'     => 'netopia',
    'middleware' => [],
],
```

---

## Usage

### 1. Initiating a payment

Build an `OrderData` DTO from your application's data and call `Netopay::start()`. This returns a `StartPaymentResponseDto` containing the Netopia-hosted page URL to redirect the user to.

```php
use MarianDumitru\Netopay\Dto\BillingData;
use MarianDumitru\Netopay\Dto\OrderData;
use MarianDumitru\Netopay\Facades\Netopay;

$billing = new BillingData(
    email:      $user->email,
    phone:      $billingProfile->phone,
    firstName:  $user->first_name,
    lastName:   $user->last_name,
    city:       $billingProfile->city,
    country:    $billingProfile->numericCountryCode, // ISO 3166-1 numeric (e.g. 642 for Romania)
    state:      $billingProfile->state,
    postalCode: $billingProfile->post_code,
    details:    $billingProfile->full_address,
);

$orderData = new OrderData(
    orderId:     $payment->uuid,   // your unique order identifier
    amount:      149.99,
    currency:    'RON',
    description: 'Subscription — 2 devices (Monthly)',
    billing:     $billing,
);

$response = Netopay::start($orderData);

// Redirect the user to Netopia's hosted payment page
return redirect($response->paymentUrl);
```

### 2. Handling payment outcomes

The package fires Laravel events from its webhook controller. Register listeners in your `AppServiceProvider` or `EventServiceProvider`:

```php
use MarianDumitru\Netopay\Events\NetopiaPaymentApproved;
use MarianDumitru\Netopay\Events\NetopiaPaymentFailed;
use MarianDumitru\Netopay\Events\NetopiaPaymentPending;
use MarianDumitru\Netopay\Events\NetopiaReturnReceived;

Event::listen(NetopiaPaymentApproved::class, HandlePaymentApproved::class);
Event::listen(NetopiaPaymentFailed::class, HandlePaymentFailed::class);
Event::listen(NetopiaPaymentPending::class, HandlePaymentPending::class);
Event::listen(NetopiaReturnReceived::class, HandleNetopiaReturn::class);
```

#### NetopiaPaymentApproved

Fired by the IPN controller when Netopia confirms a `Paid` or `Confirmed` status. This is where you fulfil the order.

```php
use MarianDumitru\Netopay\Events\NetopiaPaymentApproved;

class HandlePaymentApproved
{
    public function handle(NetopiaPaymentApproved $event): void
    {
        $status = $event->status; // PaymentStatusDto

        $payment = Payment::where('uuid', $status->orderId)->first();

        $payment->update([
            'status'              => 'paid',
            'provider_payment_id' => $status->providerPaymentId,
            'auth_code'           => $status->authCode,
            'rrn'                 => $status->rrn,
            'paid_at'             => now(),
        ]);

        // Save the card token for future recurring payments
        if ($status->paymentToken) {
            PaymentToken::updateOrCreate(
                ['user_id' => $payment->user_id],
                ['token' => $status->paymentToken],
            );
        }

        // Fulfil the order
        SubscriptionService::fulfil($payment);
    }
}
```

#### NetopiaReturnReceived

Fired when the user is redirected back to your application after completing (or abandoning) payment. Use this to look up the payment status and update your UI. For hosted-page flows, call `Netopay::retrieveStatus()`. For 3DS flows, call `Netopay::verifyAuth()` first if an auth token is present.

```php
use MarianDumitru\Netopay\Events\NetopiaReturnReceived;
use MarianDumitru\Netopay\Facades\Netopay;

class HandleNetopiaReturn
{
    public function handle(NetopiaReturnReceived $event): void
    {
        $payment = Payment::where('uuid', $event->orderId)->first();

        if (!$payment) {
            return;
        }

        // Check if a 3DS auth token was stored during the start call
        $authToken = data_get($payment->payload, 'start.customerAction.authenticationToken');

        if ($authToken) {
            // 3DS flow: verify authentication first
            $result = Netopay::verifyAuth(
                $event->orderId,
                $authToken,
                $payment->provider_payment_id,
                $event->formData,
            );
        } else {
            // Hosted-page flow: retrieve confirmed status
            $result = Netopay::retrieveStatus(
                $payment->provider_payment_id,
                $event->orderId,
            );
        }

        // Update your payment record with the result
        $payment->update(['status' => $result->state->value]);
    }
}
```

> **Note:** The IPN webhook (`NetopiaPaymentApproved`) and the return redirect (`NetopiaReturnReceived`) may arrive concurrently. Guard against double-fulfilment by checking your payment status before acting.

### 3. Recurring payments with a saved card token

Once a user has paid and you have saved their card token, use `startWithToken()` for merchant-initiated renewals. No redirect is needed — the payment is processed immediately.

```php
$response = Netopay::startWithToken($orderData, $savedToken);

if ($response->providerStatusCode === 3 || $response->providerStatusCode === 5) {
    // Payment approved — fulfil the order
}
```

### 4. Retrieving payment status manually

```php
$status = Netopay::retrieveStatus($ntpId, $orderId);

echo $status->state->value;    // 'paid', 'confirmed', 'failed', etc.
echo $status->authCode;
echo $status->rrn;
echo $status->paymentToken;
```

---

## Events Reference

| Event | Property | Type | Description |
|---|---|---|---|
| `NetopiaPaymentApproved` | `$status` | `PaymentStatusDto` | Payment is `Paid` (3) or `Confirmed` (5) |
| `NetopiaPaymentPending` | `$status` | `PaymentStatusDto` | Payment is awaiting 3DS (status 15) |
| `NetopiaPaymentFailed` | `$status` | `PaymentStatusDto` | Payment failed or was declined |
| `NetopiaReturnReceived` | `$orderId` | `string` | Your order identifier from the return URL |
| | `$formData` | `array` | Form data posted back by Netopia |
| | `$headers` | `array` | Request headers |

### `PaymentStatusDto` properties

| Property | Type | Description |
|---|---|---|
| `$orderId` | `string` | Your order ID |
| `$providerPaymentId` | `string` | Netopia's `ntpID` |
| `$state` | `PaymentStatus` | Enum: `Paid`, `Confirmed`, `Failed`, `Awaiting3DS`, `Pending` |
| `$authCode` | `?string` | Authorization code (available after verify-auth) |
| `$rrn` | `?string` | Retrieval Reference Number |
| `$amount` | `?float` | Amount charged |
| `$currency` | `?string` | Currency code |
| `$paymentToken` | `?string` | Saved card token for future recurring payments |
| `$errorCode` | `?string` | Netopia error code |
| `$errorMessage` | `?string` | Netopia error message |
| `$raw` | `?string` | Full raw JSON response from Netopia |

---

## Facade API

```php
use MarianDumitru\Netopay\Facades\Netopay;

// Initiate a hosted-page payment
Netopay::start(OrderData $orderData): StartPaymentResponseDto

// Initiate a merchant-initiated recurring payment
Netopay::startWithToken(OrderData $orderData, string $token): StartPaymentResponseDto

// Retrieve confirmed status from Netopia
Netopay::retrieveStatus(string $ntpId, string $orderId): PaymentStatusDto

// Complete a 3DS authentication
Netopay::verifyAuth(string $orderId, string $authToken, string $ntpId, array $formData): PaymentStatusDto

// Parse a raw IPN body without an API call (used internally)
Netopay::handleIpn(array $body, array $headers = []): PaymentStatusDto
```

---

## Testing

### Mocking the HTTP client

Use Laravel's `Http::fake()` to mock Netopia responses in your application tests without hitting the real API:

```php
use Illuminate\Support\Facades\Http;
use MarianDumitru\Netopay\Enums\PaymentStatus;

Http::fake([
    '*/payment/card/start' => Http::response([
        'customerAction' => [],
        'error'          => ['code' => '101', 'message' => 'Redirect user to payment page'],
        'payment'        => [
            'ntpID'      => '1234567',
            'status'     => 1,
            'paymentURL' => 'https://secure-sandbox.netopia-payments.com/ui/card?p=TEST',
        ],
    ], 200),
]);
```

### Mocking the client interface

For unit tests that should not touch HTTP at all, bind a fake implementation to `NetopiaClientInterface` in your test service provider:

```php
use MarianDumitru\Netopay\Contracts\NetopiaClientInterface;

$this->app->bind(NetopiaClientInterface::class, FakeNetopiaClient::class);
```

### Asserting events

```php
use Illuminate\Support\Facades\Event;
use MarianDumitru\Netopay\Events\NetopiaPaymentApproved;

Event::fake();

// ... trigger the IPN endpoint

Event::assertDispatched(NetopiaPaymentApproved::class, function ($event) {
    return $event->status->orderId === 'your-order-id';
});
```

> When asserting no package events were dispatched, prefer `Event::assertNotDispatched(SpecificEvent::class)` over `Event::assertNothingDispatched()`. The latter also catches internal Laravel framework events and will produce false failures.

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure tests pass before submitting:

```bash
composer test
composer analyse
composer format
```

## Security

If you discover a security vulnerability, please report it via the [GitHub Security Advisory](https://github.com/mariandumitru/netopay/security/advisories/new) rather than the public issue tracker.

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for details.
