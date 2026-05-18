# Aelura Laravel Bill Gateway

Multi-provider bill payments gateway for Laravel (airtime, data, TV, power, utilities).

This package provides a unified interface over multiple providers and normalizes their
APIs and catalog data (categories, billers, products):

- Interswitch Quickteller Bills v5 – fully implemented and production-ready
- Flutterwave Bills – fully implemented (catalog sync and purchases)
- Paystack Bills – placeholder for future integration
 - Paystack Payments (collector) – test endpoints included for payment initialization, verification, and webhook signature verification

## Installation

```bash
composer require egwudumebi/laravel-bill-gateway
composer require egwudumebi/laravel-bill-gateway:*
composer require egwudumebi/laravel-bill-gateway:dev-main
```

If you are not using package auto-discovery, register the service provider and facade
alias manually in your Laravel app.

## Configuration

Publish the config and migrations:

```bash
php artisan vendor:publish --tag=billing-config
php artisan vendor:publish --tag=billing-migrations
php artisan migrate
```

The main configuration file is `config/billing.php`.

### Interswitch Quickteller Bills v5

Example `.env` configuration for sandbox:

```env
BILLING_PROVIDER=interswitch

INTERSWITCH_LOGIN_URL=https://sandbox.interswitchng.com
INTERSWITCH_BILLS_BASE_URL=https://sandbox.interswitchng.com/quickteller-bills/api/v5
INTERSWITCH_CLIENT_ID=your_client_id
INTERSWITCH_CLIENT_SECRET=your_client_secret
INTERSWITCH_TERMINAL_ID=3PBL0001
```

Then run:

```bash
php artisan migrate
php artisan billing:sync
```

This will create the `bill_transactions`, `bill_categories`, `bill_providers`, and
`bill_products` tables and populate the catalog from Quickteller Bills v5.

### Flutterwave setup

```env
BILLING_PROVIDER=flutterwave

FLUTTERWAVE_SECRET_KEY=your_flw_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flw_public_key
FLUTTERWAVE_COUNTRY=NG
FLUTTERWAVE_ENV=sandbox
```

Then run (optionally scoped):

```bash
php artisan migrate
php artisan billing:sync --driver=flutterwave --scope=all
# or
php artisan billing:sync --driver=flutterwave --scope=data
php artisan billing:sync --driver=flutterwave --scope=cable
php artisan billing:sync --driver=flutterwave --scope=electricity
```

This will seed standard categories and discover billers/products for data, cable TV, and
electricity into `bill_categories`, `bill_providers`, and `bill_products` with
`provider=flutterwave`.

If you see zero counts, ensure your `FLUTTERWAVE_SECRET_KEY` is valid and your network
reaches `https://api.flutterwave.com/v3`.

### Notes on provider normalization

- The catalog is normalized into three tables (categories, billers, products) regardless
  of upstream shape. Each product retains a `payment_code` (Quickteller) or `item_code`
  (Flutterwave) as `payment_code` for internal consistency.
- The `BillProviderInterface` exposes consistent methods for purchases, validation and
  transaction status.

## Usage

Use the facade or resolve the manager from the container:

```php
use Aelura\BillGateway\DTOs\Requests\AirtimeRequest;
use Aelura\BillGateway\DTOs\Requests\PowerBillRequest;
use Aelura\BillGateway\DTOs\Requests\TvSubscriptionRequest;
use Aelura\BillGateway\Facades\BillGateway;

// Purchase airtime
$result = BillGateway::purchaseAirtime(new AirtimeRequest(
    phoneNumber: '08030000000',
    network: 'mtn',
    country: 'NG',
    currency: 'NGN',
    amount: 1000.0, // Naira
    productCode: 'BIL123', // Quickteller payment code
));

if ($result->success) {
    // $result->reference, $result->providerReference, $result->amount, $result->status
}

// Pay a power bill
$powerResult = BillGateway::payPowerBill(new PowerBillRequest(
    meterNumber: '1234567890',
    disco: 'ikeja-electric',
    country: 'NG',
    currency: 'NGN',
    amount: 5000.0,
    productCode: 'POW123',
));

// Pay a TV subscription
$tvResult = BillGateway::payTvSubscription(new TvSubscriptionRequest(
    smartcardNumber: '1234567890',
    provider: 'dstv',
    country: 'NG',
    currency: 'NGN',
    amount: 7000.0,
    productCode: 'TV123',
));

// Check transaction status

## Testing via cURL (Test Controllers)

This repository includes simple test controllers that expose standardized endpoints for
manual testing with cURL/PowerShell. The endpoints are:

- POST /api/test/airtime
- POST /api/test/data
- POST /api/test/power
- POST /api/test/tv
- POST /api/test/validate-customer

Set `BILLING_PROVIDER` in your `.env` to switch drivers between `interswitch` and
`flutterwave`. The same endpoints work for both.

Examples (PowerShell):

1) Airtime

```
$body = @{
  phone  = "08030000000"
  amount = 1000
  network = "mtn"
  # For Flutterwave airtime, productCode can be omitted. For Interswitch, provide a PaymentCode
  # productCode = "10902"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/airtime" -Method POST -Body $body -ContentType "application/json"
```

2) Data

```
$body = @{
  phone       = "08030000000"
  amount      = 1000
  network     = "mtn"
  # Use a productCode from bill_products (Quickteller paymentCode or Flutterwave item_code)
  productCode = "<your_code>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/data" -Method POST -Body $body -ContentType "application/json"
```

3) Power

```
$body = @{
  meterNumber = "1234567890"
  amount      = 5000
  disco       = "ikeja-electric"
  productCode = "<your_code>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/power" -Method POST -Body $body -ContentType "application/json"
```

4) TV

```
$body = @{
  smartcardNumber = "0000000001"
  amount          = 7000
  provider        = "dstv"
  productCode     = "<your_code>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/tv" -Method POST -Body $body -ContentType "application/json"
```

5) Validate customer

```
$body = @{
  customerId  = "08030000000"
  productCode = "<your_code>"
  # billerCode is optional and driver-specific
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/validate-customer" -Method POST -Body $body -ContentType "application/json"
```

### Expected responses

All test endpoints return a normalized JSON with keys like:

- success, status, message
- reference, provider_reference
- raw (provider response)
$status = BillGateway::checkTransactionStatus($result->reference);
```

### Webhooks

You can use the provided `InterswitchWebhookHandler` to normalize webhook payloads
from Quickteller Bills v5.

Example route and controller method:

```php
use Aelura\BillGateway\Webhooks\InterswitchWebhookHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::post('/webhooks/interswitch/bills', function (Request $request, InterswitchWebhookHandler $handler) {
    $event = $handler->handle($request);

    DB::table('bill_transactions')
        ->where('reference', $event['reference'])
        ->update([
            'status' => $event['status'],
            'external_reference' => $event['provider_reference'],
            'response_payload' => json_encode($event['raw']),
            'updated_at' => now(),
        ]);

    return response()->json(['status' => 'ok']);
});
```

### Other providers

- `flutterwave` is fully implemented (catalog sync, validation, purchases, status).
- `paystack_bills` is scaffolded for future work and not active yet.

## Paystack (Payments Collector)

This package includes minimal test endpoints to collect payments via Paystack. Use these
to initialize a payment, verify a transaction, and handle webhooks. These endpoints are
useful when you want to collect funds before triggering a bill purchase with another
provider.

### Setup

Add to your `.env`:

```
PAYSTACK_SECRET_KEY=sk_test_xxx_or_live
PAYSTACK_BASE_URL=https://api.paystack.co
```

No quotes and no trailing spaces. For live, set your live secret key.

### Test endpoints

- POST `/api/test/paystack/initialize`
- GET  `/api/test/paystack/verify/{reference}`
- POST `/api/test/paystack/webhook`

These are wired in `routes/api.php` and handled by `PaystackTestController`.

### Example usage (PowerShell)

1) Initialize transaction

```
$body = @{ email = "buyer@example.com"; amount = 1000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/paystack/initialize" -Method POST -Body $body -ContentType "application/json"
```

Open the `authorization_url` from the response to complete payment.

2) Verify by reference

```
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/paystack/verify/{reference}" -Method GET
```

3) Webhook handler

The webhook endpoint validates the `x-paystack-signature` header using your
`PAYSTACK_SECRET_KEY` with SHA-512 HMAC. Replace the echo-back with your own logic to
update transaction status.

```
# Normally Paystack will POST to your webhook. To simulate locally, compute the signature
# for the JSON body using PAYSTACK_SECRET_KEY and set it as x-paystack-signature.
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test/paystack/webhook" -Method POST -Body ($json) -ContentType "application/json" -Headers @{ 'x-paystack-signature' = '<computed_sha512>' }
```

### Notes

- Amounts are in kobo when sent to Paystack (e.g., 1000 Naira => 100000).
- Keep using Interswitch/Flutterwave endpoints for bills; collect funds with Paystack
  first if desired, then trigger provider-specific bill purchase.

## Extensibility

- Implement `Aelura\BillGateway\Contracts\BillProviderInterface` for new providers.
- Register your driver in `BillGatewayManager` and add config under `config/billing.php`.
- Reuse the console sync command `billing:sync` by implementing `syncCatalog()` and (optionally)
  `syncCatalogScoped()` in your provider.
