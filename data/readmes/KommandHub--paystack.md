<p align="center">
    <img alt="Paystack logo" title="Paystack" height="200" src="./paystack.png" width="50%"/>
</p>

# Paystack PHP Library

[![PHP Composer](https://github.com/KommandHub/paystack/actions/workflows/tests.yml/badge.svg)](https://github.com/KommandHub/paystack/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/kommandhub/paystack.svg?style=flat-square)](https://packagist.org/packages/kommandhub/paystack)
[![Total Downloads](https://img.shields.io/packagist/dt/kommandhub/paystack.svg?style=flat-square)](https://packagist.org/packages/kommandhub/paystack)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

A framework-agnostic PHP library for integrating [Paystack](https://paystack.com) payments using SOLID principles and PSR standards. It provides a clean, object-oriented interface to the Paystack API and works in any PHP environment.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Initialization](#initialization)
  - [Using Guzzle and Nyholm PSR-7](#using-guzzle-and-nyholm-psr-7)
  - [Bringing Your Own HTTP Client](#bringing-your-own-http-client)
- [Response Structure](#response-structure)
- [Error Handling](#error-handling)
- [Resources](#resources)
  - [Transactions](#transactions)
  - [Customers](#customers)
  - [Transfers](#transfers)
  - [Subscriptions](#subscriptions)
  - [Plans](#plans)
  - [Splits](#splits)
  - [Subaccounts](#subaccounts)
  - [Refunds](#refunds)
  - [Verification](#verification)
  - [Settlements](#settlements)
  - [Miscellaneous](#miscellaneous)
- [Webhook Handling](#webhook-handling)
- [Testing](#testing)
- [Development (Docker)](#development-docker)
- [Code Quality](#code-quality)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

- PHP **8.1** or higher
- A PSR-18 HTTP client (e.g. `guzzlehttp/guzzle`, `symfony/http-client`)
- PSR-17 HTTP factory (e.g. `nyholm/psr7`, `guzzlehttp/psr7`)

## Installation

```bash
composer require kommandhub/paystack
```

If you don't already have a PSR-18 client and PSR-17 factory, install popular ones:

```bash
composer require guzzlehttp/guzzle nyholm/psr7
```

---

## Quick Start

```php
use Kommandhub\Paystack\Paystack;
use GuzzleHttp\Client;
use Nyholm\Psr7\Factory\Psr17Factory;

$factory  = new Psr17Factory();
$paystack = new Paystack(
    secretKey:      'sk_live_your_secret_key',
    client:         new Client(),
    requestFactory: $factory,
    streamFactory:  $factory
);

// Initialize a transaction
$response = $paystack->transactions()->initialize([
    'email'  => 'customer@example.com',
    'amount' => 500000, // amount in kobo (NGN 5,000)
]);

header('Location: ' . $response['data']['authorization_url']);
exit;
```

---

## Initialization

### Using Guzzle and Nyholm PSR-7

```php
use Kommandhub\Paystack\Paystack;
use GuzzleHttp\Client;
use Nyholm\Psr7\Factory\Psr17Factory;

$factory  = new Psr17Factory();

$paystack = new Paystack(
    secretKey:      'sk_live_your_secret_key',
    client:         new Client(),
    requestFactory: $factory,
    streamFactory:  $factory
);
```

### Bringing Your Own HTTP Client

Implement `Kommandhub\Paystack\Contracts\HttpClientInterface` to wrap any HTTP layer you prefer, then pass it directly:

```php
use Kommandhub\Paystack\Paystack;
use App\Http\MyCustomHttpClient;

$paystack = new Paystack(
    secretKey:  'sk_live_your_secret_key',
    httpClient: new MyCustomHttpClient()
);
```

---

## Response Structure

Every resource method returns an associative array that mirrors the Paystack API JSON response:

```php
[
    'status'  => true,           // bool – whether the request succeeded
    'message' => 'Authorized',   // string – human-readable status message
    'data'    => [ ... ],        // array – the actual payload (varies by endpoint)
]
```

Always check `$response['status']` before consuming `$response['data']`.

---

## Error Handling

All resource methods throw `Kommandhub\Paystack\Exceptions\PaystackException` on HTTP or API errors. Wrap calls in a try/catch block:

```php
use Kommandhub\Paystack\Exceptions\PaystackException;

try {
    $response = $paystack->transactions()->verify('invalid_ref');
} catch (PaystackException $e) {
    // Log or display $e->getMessage()
    echo 'Paystack error: ' . $e->getMessage();
}
```

---

## Resources

### Transactions

Handle payment initialization, verification, and retrieval.

```php
// Initialize a transaction
$response = $paystack->transactions()->initialize([
    'email'        => 'customer@example.com',
    'amount'       => 500000,                         // in kobo
    'callback_url' => 'https://your-site.com/callback',
]);

$authorizationUrl = $response['data']['authorization_url'];

// Verify a transaction
$response = $paystack->transactions()->verify('transaction_reference');

// List transactions (supports query params: perPage, page, customer, status, etc.)
$response = $paystack->transactions()->list(['perPage' => 20, 'page' => 1]);

// Fetch a single transaction by ID
$response = $paystack->transactions()->fetch('12345678');
```

---

### Customers

Manage your customer database.

```php
// Create a customer
$response = $paystack->customers()->create([
    'email'      => 'customer@example.com',
    'first_name' => 'John',
    'last_name'  => 'Doe',
    'phone'      => '+2348012345678',
]);

// List customers (supports query params: perPage, page, etc.)
$response = $paystack->customers()->list(['perPage' => 50]);

// Fetch a customer by email or customer code
$response = $paystack->customers()->fetch('customer@example.com');
$response = $paystack->customers()->fetch('CUS_xxxxxxxxxx');

// Update a customer
$response = $paystack->customers()->update('CUS_xxxxxxxxxx', [
    'first_name' => 'Jane',
]);
```

---

### Transfers

Send money to customers or vendors.

```php
// Create a transfer recipient
$response = $paystack->transfers()->recipient([
    'type'           => 'nuban',
    'name'           => 'John Doe',
    'account_number' => '0001234567',
    'bank_code'      => '058',
    'currency'       => 'NGN',
]);

$recipientCode = $response['data']['recipient_code'];

// Initiate a transfer
$response = $paystack->transfers()->initiate([
    'source'    => 'balance',
    'amount'    => 50000,
    'recipient' => $recipientCode,
    'reason'    => 'Payment for services',
]);

// List transfers (supports query params: perPage, page, customer, etc.)
$response = $paystack->transfers()->list(['perPage' => 20]);

// Fetch a single transfer by ID or transfer code
$response = $paystack->transfers()->fetch('TRF_xxxxxxxxxx');

// Verify a transfer by reference
$response = $paystack->transfers()->verify('transfer_reference');
```

---

### Subscriptions

Manage recurring payments.

```php
// Create a subscription
$response = $paystack->subscriptions()->create([
    'customer'   => 'CUS_xxxxxxxxxx',
    'plan'       => 'PLN_xxxxxxxxxx',
    'start_date' => '2026-01-01T00:00:00.000Z', // optional
]);

// List subscriptions (supports query params: perPage, page, customer, plan)
$response = $paystack->subscriptions()->list(['plan' => 'PLN_xxxxxxxxxx']);

// Fetch a subscription by ID or subscription code
$response = $paystack->subscriptions()->fetch('SUB_xxxxxxxxxx');

// Enable a subscription
$response = $paystack->subscriptions()->enable([
    'code'  => 'SUB_xxxxxxxxxx',
    'token' => 'email_token',
]);

// Disable a subscription
$response = $paystack->subscriptions()->disable([
    'code'  => 'SUB_xxxxxxxxxx',
    'token' => 'email_token',
]);

// Generate a self-service management link for the customer
$response = $paystack->subscriptions()->manageLink('SUB_xxxxxxxxxx');
$managementUrl = $response['data']['link'];

// Email the management link directly to the customer
$response = $paystack->subscriptions()->sendManageLink('SUB_xxxxxxxxxx');
```

---

### Plans

Create and manage payment plans for subscriptions.

```php
// Create a plan
$response = $paystack->plans()->create([
    'name'     => 'Monthly Premium',
    'amount'   => 500000,   // in kobo
    'interval' => 'monthly', // daily | weekly | monthly | annually
]);

// List plans (supports query params: perPage, page, status, interval, amount)
$response = $paystack->plans()->list(['interval' => 'monthly']);

// Fetch a plan by ID or plan code
$response = $paystack->plans()->fetch('PLN_xxxxxxxxxx');

// Update a plan
$response = $paystack->plans()->update('PLN_xxxxxxxxxx', [
    'name'   => 'Monthly Premium Plus',
    'amount' => 750000,
]);
```

---

### Splits

Split payments between multiple subaccounts.

```php
// Create a split
$response = $paystack->splits()->create([
    'name'         => 'Revenue Split',
    'type'         => 'percentage',  // percentage | flat
    'currency'     => 'NGN',
    'subaccounts'  => [
        ['subaccount' => 'ACCT_xxxxxxxxxx', 'share' => 20],
    ],
    'bearer_type'  => 'subaccount',  // subaccount | account | all-proportional | all
    'bearer_subaccount' => 'ACCT_xxxxxxxxxx',
]);

// List splits (supports query params: name, active, sort_by, perPage, page, from, to)
$response = $paystack->splits()->list(['active' => true]);

// Fetch a split by ID
$response = $paystack->splits()->fetch('SPL_xxxxxxxxxx');

// Update a split
$response = $paystack->splits()->update('SPL_xxxxxxxxxx', [
    'name'   => 'Updated Revenue Split',
    'active' => true,
]);

// Add or update a subaccount in a split
$response = $paystack->splits()->addSubaccount('SPL_xxxxxxxxxx', [
    'subaccount' => 'ACCT_yyyyyyyyyy',
    'share'      => 30,
]);

// Remove a subaccount from a split
$response = $paystack->splits()->removeSubaccount('SPL_xxxxxxxxxx', [
    'subaccount' => 'ACCT_yyyyyyyyyy',
]);
```

---

### Subaccounts

Manage subaccounts for split payments and marketplace settlements.

```php
// Create a subaccount
$response = $paystack->subaccounts()->create([
    'business_name'    => 'Acme Stores',
    'settlement_bank'  => '058',
    'account_number'   => '0001234567',
    'percentage_charge' => 18.2,
]);

// List subaccounts (supports query params: perPage, page, from, to)
$response = $paystack->subaccounts()->list(['perPage' => 50]);

// Fetch a subaccount by ID or subaccount code
$response = $paystack->subaccounts()->fetch('ACCT_xxxxxxxxxx');

// Update a subaccount
$response = $paystack->subaccounts()->update('ACCT_xxxxxxxxxx', [
    'percentage_charge' => 20.0,
    'description'       => 'Updated description',
]);
```

---

### Refunds

Process full or partial refunds for transactions.

```php
// Create a refund (omit 'amount' for a full refund)
$response = $paystack->refunds()->create([
    'transaction' => 'transaction_reference',
    'amount'      => 50000, // optional – partial refund in kobo
]);

// List refunds (supports query params: reference, currency, from, to, perPage, page)
$response = $paystack->refunds()->list(['reference' => 'transaction_reference']);

// Fetch a refund by reference
$response = $paystack->refunds()->fetch('refund_reference');
```

---

### Verification

Verify customer account and card information.

```php
// Resolve a bank account number
$response = $paystack->verification()->resolveAccount('0001234567', '058');
$accountName = $response['data']['account_name'];

// Resolve a card BIN (first 6 digits)
$response = $paystack->verification()->resolveCardBin('539983');
$cardInfo  = $response['data']; // bank, card_type, brand, etc.
```

---

### Settlements

Retrieve settlement reports and their associated transactions.

```php
// List settlements (supports query params: perPage, page, status, subaccount, from, to)
$response = $paystack->settlements()->list(['from' => '2026-01-01']);

// Fetch transactions for a specific settlement
$response = $paystack->settlements()->transactions('settlement_id', ['perPage' => 100]);
```

---

### Miscellaneous

Access supporting reference data from the Paystack API.

```php
// List supported banks (supports query params: country, use_cursor, perPage, etc.)
$response = $paystack->miscellaneous()->listBanks(['country' => 'nigeria']);

// List supported countries
$response = $paystack->miscellaneous()->listCountries();

// List states for Address Verification Service (AVS)
$response = $paystack->miscellaneous()->listStates('US');
```

---

## Webhook Handling

Paystack sends webhook events to your endpoint for asynchronous notifications. Always validate the signature before processing:

```php
// webhook.php

$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
$secret    = 'sk_live_your_secret_key';

if (hash_hmac('sha512', $payload, $secret) !== $signature) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = json_decode($payload, true);

match ($event['event']) {
    'charge.success'      => handleChargeSuccess($event['data']),
    'transfer.success'    => handleTransferSuccess($event['data']),
    'subscription.create' => handleSubscriptionCreate($event['data']),
    default               => null,
};

http_response_code(200);
```

> **Tip:** Respond with HTTP `200` as quickly as possible and process webhook payloads asynchronously (e.g. via a queue) to avoid timeouts.

---

## Testing

```bash
composer test
```

---

## Development (Docker)

This project includes a Docker environment for easy development.

### Requirements

- Docker
- Docker Compose

### Getting Started

| Command        | Description                    |
|----------------|-------------------------------|
| `make build`   | Build and start the container  |
| `make shell`   | Open a shell inside container  |
| `make test`    | Run the test suite             |
| `make lint`    | Run static analysis (PHPStan)  |
| `make format`  | Fix code style (PHP CS Fixer)  |
| `make down`    | Stop and remove containers     |

Or use `docker-compose` directly:

```bash
docker-compose up -d
docker-compose exec app sh
```

---

## Code Quality

| Tool | Command | Purpose |
|------|---------|---------|
| [PHPStan](https://phpstan.org) | `composer lint` | Static analysis |
| [PHP CS Fixer](https://cs.symfony.com) | `composer format` | Code style enforcement |

Please ensure both pass before submitting a pull request.

---

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see the [License File](LICENSE) for more information.
