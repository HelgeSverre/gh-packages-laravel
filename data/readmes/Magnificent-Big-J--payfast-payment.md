# Payfast Payment Package

A PHP package for integrating with the PayFast payment gateway. Supports one-time payments, recurring subscriptions, and ITN (Instant Transaction Notification) validation — for both vanilla PHP and Laravel.

## Installation

```bash
composer require rainwaves/payfast-payment
```

## Compatibility

| Package | PHP | Laravel |
|---------|-----|---------|
| v1.7.x  | 7.4 – 8.5 | 10 – 13 |

Laravel 10+ requires PHP 8.1+. Laravel 11+ requires PHP 8.2+. Laravel 12+ requires PHP 8.2+. Laravel 13+ requires PHP 8.3+.

## Configuration

### Laravel

Publish the config file:

```bash
php artisan vendor:publish --tag=payfast-config
```

Then set your credentials in `.env`:

```env
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_ENV=local
PAYFAST_RETURN_URL=https://example.com/success
PAYFAST_CANCEL_URL=https://example.com/cancel
PAYFAST_NOTIFY_URL=https://example.com/notify
PAYFAST_PASS_PHRASE=your_passphrase
```

> **Note:** The legacy unprefixed env names (`MERCHANT_ID`, `MERCHANT_KEY`, `ENVIRONMENT`, etc.) still work as fallbacks, but `PAYFAST_` prefixed names are recommended to avoid conflicts with other packages.

### Vanilla PHP

Pass a config array directly:

```php
$config = [
    'merchant_id'  => '10000100',
    'merchant_key' => '46f0cd694581a',
    'env'          => 'local',           // 'local' or 'production'
    'return_url'   => 'https://example.com/success',
    'cancel_url'   => 'https://example.com/cancel',
    'notify_url'   => 'https://example.com/notify',
    'pass_phrase'  => 'your_passphrase',
];
```

## Usage

### One-time Payment (Vanilla PHP)

```php
require 'vendor/autoload.php';

use rainwaves\PayfastPayment\PayFast;

$payFast = new PayFast($config);

$input = [
    'amount'             => 100.00,
    'item_name'          => 'Test Product',
    'name_first'         => 'John',
    'name_last'          => 'Doe',
    'email_address'      => 'john@example.com',
    'm_payment_id'       => 'order-1234',
    'email_confirmation' => true,
    'custom_str1'        => 'internal-ref',
];

echo $payFast->makePaymentWithAForm($input)->createForm();
```

A hidden-field HTML form is returned, which submits the user to PayFast.

### One-time Payment (Laravel — dependency injection)

```php
use rainwaves\PayfastPayment\Contract\PayFastInterface;

class PaymentController extends Controller
{
    public function __construct(private PayFastInterface $payFast) {}

    public function checkout(Request $request): string
    {
        $input = [
            'amount'        => 100.00,
            'item_name'     => 'Gold Plan',
            'email_address' => $request->user()->email,
            'm_payment_id'  => $request->user()->id,
        ];

        return $this->payFast->makePaymentWithAForm($input)->createForm();
    }
}
```

### Subscriptions

```php
use rainwaves\PayfastPayment\PayFastSubscription;
use rainwaves\PayfastPayment\Model\Frequency;

$payFast = new PayFastSubscription($config);

$input = [
    'amount'                    => 100.00,
    'item_name'                 => 'Gold Plan',
    'billing_date'              => '2026-05-01',
    'recurring_amount'          => 100.00,
    'frequency'                 => Frequency::MONTHLY,
    'cycles'                    => 0,   // 0 = indefinite
    'subscription_notify_email'   => true,
    'subscription_notify_webhook' => true,
    'subscription_notify_buyer'   => true,
];

echo $payFast->createSubscriptionWithAForm($input)->createForm();
```

### Optional Payment Fields

| Field | Description |
|-------|-------------|
| `payment_method` | Restrict to one method: `eft`, `cc`, `dc`, `bc`, `mp`, `mc`, `cd`, `sc` |
| `email_confirmation` | Send buyer a confirmation email (`true`/`false`) |
| `confirmation_address` | Override email for confirmation |
| `custom_int1..5` | Integer custom fields (passed through ITN) |
| `custom_str1..5` | String custom fields, max 255 chars each |

### Frequency Constants

```php
Frequency::DAILY      // 1
Frequency::WEEKLY     // 2
Frequency::MONTHLY    // 3
Frequency::QUARTERLY  // 4
Frequency::BI_ANNUAL  // 5
Frequency::ANNUAL     // 6
```

## ITN (Instant Transaction Notification) Validation

PayFast POSTs an ITN to your `notify_url` after each payment. **Validate all four checks** before acting on the notification.

```php
use rainwaves\PayfastPayment\Itn\PayFastItnValidator;
use rainwaves\PayfastPayment\Model\Route;

$payload = $_POST;
$rawBody = file_get_contents('php://input');
$isSandbox = config('payfast.env') !== 'production';

$validator = new PayFastItnValidator(
    $payload,
    config('payfast.pass_phrase'),
    $rawBody
);

// 1. Source IP — always first
if (!$validator->validateSourceIp($_SERVER['REMOTE_ADDR'], $isSandbox)) {
    http_response_code(403);
    exit;
}

// 2. Signature
if (!$validator->validateSignature()) {
    http_response_code(400);
    exit;
}

// 3. Amount — compare against your stored order amount
if (!$validator->validateAmount('100.00')) {
    http_response_code(400);
    exit;
}

// 4. Merchant ID
if (!$validator->validateMerchantId(config('payfast.merchant_id'))) {
    http_response_code(400);
    exit;
}

// 5. (Optional) Server-side confirmation with PayFast endpoint
$validateUrl = Route::getValidationUrl(config('payfast.env'));
if (!$validator->validateWithPayFastEndpoint($validateUrl)) {
    http_response_code(400);
    exit;
}

// 6. Replay-attack protection — pf_payment_id must be unique
$paymentId = $validator->getPaymentId();
// … check that $paymentId hasn't been processed before …

// 7. Handle the response
$response = $validator->response();

if ($response->isComplete()) {
    // fulfil order
}
```

> **Tip:** PayFast requires a passphrase on your account for recurring billing. Without one, subscription signatures will fail.

## Testing

```bash
vendor/bin/phpunit
```

## License

MIT
