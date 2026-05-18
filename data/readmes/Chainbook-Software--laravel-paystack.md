# Chainbook Paystack

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chainbook/paystack.svg?style=flat-square)](https://packagist.org/packages/chainbook/paystack)
[![Total Downloads](https://img.shields.io/packagist/dt/chainbook/paystack.svg?style=flat-square)](https://packagist.org/packages/chainbook/paystack)
[![License](https://img.shields.io/packagist/l/chainbook/paystack.svg?style=flat-square)](LICENSE)

A clean, simple Laravel package for [Paystack](https://paystack.com) payment integration. Supports transactions, customers, plans, subscriptions and webhook verification — with zero configuration beyond your API keys.

## Requirements

- PHP **^8.1**
- Laravel **^10 | ^11 | ^12**

## Installation

```bash
composer require chainbook/paystack
```

Laravel's auto-discovery will register the service provider and `Paystack` facade automatically.

### Publish the config file (optional)

```bash
php artisan vendor:publish --provider="Chainbook\Paystack\PaystackServiceProvider" --tag="paystack-config"
```

### Add your keys to `.env`

```env
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Usage

### Transactions

```php
use Chainbook\Paystack\Facades\Paystack;

// Initialize a transaction
$response = Paystack::initializeTransaction([
    'email'        => 'customer@example.com',
    'amount'       => 500000, // Amount in kobo/pesewas (= 5000 NGN/GHS)
    'reference'    => uniqid('ref_'),
    'callback_url' => 'https://yourapp.com/payment/callback',
]);

// $response['data']['authorization_url'] — redirect the user here

// Verify a transaction
$verification = Paystack::verifyTransaction('ref_abc123');

if ($verification['data']['status'] === 'success') {
    // Payment confirmed
}

// List transactions
$transactions = Paystack::listTransactions(['perPage' => 20, 'page' => 1]);

// Fetch a specific transaction
$transaction = Paystack::fetchTransaction(123456789);

// Charge a returning customer using saved authorization
$charge = Paystack::chargeAuthorization([
    'authorization_code' => 'AUTH_xxxxxxxx',
    'email'              => 'customer@example.com',
    'amount'             => 500000,
]);
```

### Customers

```php
// Create a customer
$customer = Paystack::createCustomer([
    'email'      => 'customer@example.com',
    'first_name' => 'Jane',
    'last_name'  => 'Doe',
    'phone'      => '+2348012345678',
]);

// Fetch a customer (by ID or customer code)
$customer = Paystack::fetchCustomer('CUS_xxxxxxxx');

// Update a customer
Paystack::updateCustomer('CUS_xxxxxxxx', ['first_name' => 'Janet']);

// List customers
$customers = Paystack::listCustomers(['perPage' => 50]);
```

### Plans & Subscriptions

```php
// Create a plan
$plan = Paystack::createPlan([
    'name'     => 'Monthly Premium',
    'interval' => 'monthly',
    'amount'   => 500000,
]);

// List plans / fetch / subscribe
$plans         = Paystack::listPlans();
$plan          = Paystack::fetchPlan('PLN_xxxxxxxx');
$subscription  = Paystack::createSubscription([
    'customer'   => 'CUS_xxxxxxxx',
    'plan'       => 'PLN_xxxxxxxx',
    'start_date' => now()->addDay()->toIso8601String(),
]);
$subscriptions = Paystack::listSubscriptions();
```

### Webhook Verification

```php
// routes/web.php
Route::post('/webhooks/paystack', function (Illuminate\Http\Request $request) {
    $signature = $request->header('X-Paystack-Signature');
    $computed  = hash_hmac('sha512', $request->getContent(), config('paystack.secret_key'));

    if ($signature !== $computed) {
        abort(400, 'Invalid signature');
    }

    $event = $request->json()->all();

    match ($event['event'] ?? null) {
        'charge.success'   => /* handle payment */ null,
        'transfer.success' => /* handle transfer */ null,
        default            => null,
    };

    return response('OK', 200);
})->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
```

### Get the Public Key (for frontend/JavaScript use)

```php
$publicKey = Paystack::getPublicKey();
```

---

## Configuration

After publishing, edit `config/paystack.php`:

```php
return [
    'public_key'     => env('PAYSTACK_PUBLIC_KEY'),
    'secret_key'     => env('PAYSTACK_SECRET_KEY'),
    'base_url'       => env('PAYSTACK_BASE_URL', 'https://api.paystack.co'),
    'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET'),
];
```

---

## Testing

```bash
composer test
```

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.
