<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Bank_of_Georgia_logo.png/250px-Bank_of_Georgia_logo.png" alt="Bank of Georgia" width="250">
</p>

# 🏦 Laravel BOG SDK

A comprehensive Laravel SDK for **Bank of Georgia** APIs. Covers all major BOG product lines with typed DTOs, automatic OAuth2 token management, and full test coverage.

[![CI](https://github.com/GiorgiGrdzelidze/laravel-bog-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/GiorgiGrdzelidze/laravel-bog-sdk/actions)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.3-blue)](composer.json)
[![License](https://img.shields.io/github/license/GiorgiGrdzelidze/laravel-bog-sdk)](LICENSE.md)

---

## 📋 Supported APIs

| API | Description | Status |
|-----|-------------|--------|
| 🏢 **Business Online (Bonline)** | Account balances, statements, today activities, currency rates, requisites | ✅ Full |
| 💳 **Payments v1** | E-commerce orders, refunds, pre-auth, saved cards, split payments | ✅ Full |
| 🍎 **Apple Pay** | Apple Pay payment completion | ✅ Full |
| 📱 **Google Pay** | Google Pay payment completion | ✅ Full |
| 💰 **iPay (legacy)** | Orders, refunds, subscriptions, pre-auth | ✅ Full |
| 📆 **Installment** | Calculator, checkout, order details | ✅ Full |
| 🧾 **Billing** | Payments, status, cancellation (OAuth2/Basic/API Key/HMAC) | ✅ Full |
| 🆔 **BOG-ID** | OpenID Connect: redirect, code exchange, userinfo | ✅ Full |
| 🌐 **Open Banking** | Identity assurance | ✅ Full |
| 🔮 **PSD2** | AIS/PIS (scaffolded for future) | 🔜 Planned |

---

## 📦 Requirements

- PHP 8.3+
- Laravel 12.x or 13.x

## 🚀 Installation

```bash
composer require giorgigrdzelidze/laravel-bog-sdk
```

The service provider is auto-discovered. To publish the config file:

```bash
php artisan vendor:publish --tag=bog-sdk-config
```

To publish the BOG Payments callback public key (for signature verification):

```bash
php artisan vendor:publish --tag=bog-sdk-keys
```

## ⚙️ Configuration

Add the following to your `.env` file. Only configure the APIs you plan to use:

```dotenv
# 🏢 Business Online (Bonline)
BOG_BONLINE_CLIENT_ID=your-client-id
BOG_BONLINE_CLIENT_SECRET=your-client-secret
BOG_BONLINE_ACCOUNTS=GE00BG0000000000000001,GE00BG0000000000000002
BOG_BONLINE_DEFAULT_ACCOUNT=GE00BG0000000000000001
BOG_BONLINE_DEFAULT_CURRENCY=GEL
BOG_BONLINE_CURRENCIES=GEL,USD,EUR

# 💳 Payments
BOG_PAYMENTS_CLIENT_ID=your-client-id
BOG_PAYMENTS_CLIENT_SECRET=your-client-secret

# 💰 iPay (legacy)
BOG_IPAY_CLIENT_ID=your-client-id
BOG_IPAY_CLIENT_SECRET=your-client-secret

# 📆 Installment
BOG_INSTALLMENT_CLIENT_ID=your-client-id
BOG_INSTALLMENT_CLIENT_SECRET=your-client-secret
BOG_INSTALLMENT_SHOP_ID=your-shop-id

# 🧾 Billing
BOG_BILLING_CLIENT_ID=your-client-id
BOG_BILLING_CLIENT_SECRET=your-client-secret
BOG_BILLING_AUTH=oauth2  # oauth2 | basic | apikey | hmac-sha256

# 🆔 BOG-ID (OpenID Connect)
BOG_ID_CLIENT_ID=your-client-id
BOG_ID_CLIENT_SECRET=your-client-secret
BOG_ID_REDIRECT_URI=https://your-app.com/auth/bog/callback

# 🌐 Open Banking
BOG_OB_CLIENT_ID=your-client-id
BOG_OB_CLIENT_SECRET=your-client-secret
```

### 🔧 Optional tuning

```dotenv
BOG_HTTP_TIMEOUT=15
BOG_HTTP_RETRY_TIMES=2
BOG_HTTP_RETRY_SLEEP_MS=250
BOG_TOKEN_CACHE_STORE=redis   # null = default cache driver
BOG_TOKEN_CACHE_PREFIX=bog-sdk:token:
BOG_TOKEN_CACHE_SAFETY_TTL=60 # seconds before token expiry to refresh
```

---

## ⚡ Quick Start

Use the `Bog` facade or resolve `BogClient` from the container:

```php
use GiorgiGrdzelidze\BogSdk\Facades\Bog;
// or
use GiorgiGrdzelidze\BogSdk\BogClient;

$client = app(BogClient::class);
```

---

## 🏢 Business Online (Bonline)

### 💰 Account Balance

```php
$balance = Bog::bonline()->balance()->get('GE29BG0000000123456789', 'GEL');

$balance->accountNumber;    // "GE29BG0000000123456789"
$balance->currency;         // "GEL"
$balance->availableBalance; // 5432.10
$balance->currentBalance;   // 5500.00
$balance->blockedAmount;    // 67.90
```

### 📄 Statement (with auto-pagination)

```php
// Single page (max 1000 records per request)
$page = Bog::bonline()->statement()->forPeriod(
    from: new DateTimeImmutable('2026-01-01'),
    to: new DateTimeImmutable('2026-01-31'),
    currency: 'GEL',
    accountNumber: 'GE29BG0000000123456789',
);

$page->id;    // statement ID for paging
$page->count; // total records across all pages
$page->records; // TransactionDto[]

// 🔄 Stream all pages automatically (generator)
foreach (Bog::bonline()->statement()->stream(
    from: new DateTimeImmutable('2026-01-01'),
    to: new DateTimeImmutable('2026-03-31'),
    currency: 'GEL',
    accountNumber: 'GE29BG0000000123456789',
) as $transaction) {
    echo $transaction->entryDate . ' — ' . $transaction->entryAmount;
    echo $transaction->senderName() . ' → ' . $transaction->beneficiaryName();
    echo $transaction->documentNomination;
}
```

### 📑 Statement Paging (manual)

Pages must be fetched sequentially — skipping is not allowed by the API.

```php
// Returns TransactionDto[] (flat array)
$records = Bog::bonline()->statement()->page(
    accountNumber: 'GE29BG0000000123456789',
    currency: 'GEL',
    statementId: (int) $page->id,
    pageNumber: 2,
);
```

### 📊 Statement Summary

```php
// V2 — by date range (no statement ID needed)
$summary = Bog::bonline()->summary()->forPeriod('GE29BG0000000123456789', 'GEL', '2026-01-01', '2026-01-31');

$summary['GlobalSummary']['CreditSum'];
$summary['GlobalSummary']['DebitSum'];
$summary['DailySummaries']; // day-by-day breakdown

// V1 — by statement ID
$summary = Bog::bonline()->summary()->get('GE29BG0000000123456789', 'GEL', $statementId);
```

### 📅 Today's Activities

```php
$activities = Bog::bonline()->todayActivities()->get('GE29BG0000000123456789', 'GEL');

foreach ($activities as $tx) {
    echo $tx->entryAmountDebit . ' / ' . $tx->entryAmountCredit . ' — ' . $tx->entryComment;
}
```

### 💱 Currency Rates

```php
// Commercial rate for a currency
$rate = Bog::bonline()->currencyRates()->commercial('USD');
echo "Buy: {$rate->buyRate}, Sell: {$rate->sellRate}";

// All major rates (USD, EUR, GBP)
$rates = Bog::bonline()->currencyRates()->list();

// Cross rate between two currencies (returns float)
$crossRate = Bog::bonline()->currencyRates()->crossRate('USD', 'EUR');

// NBG official rate (returns float)
$nbgRate = Bog::bonline()->currencyRates()->nbg('USD');
```

### 🏦 Multiple Accounts & Currencies

The SDK supports managing multiple bank accounts and currencies via comma-separated env variables:

```dotenv
BOG_BONLINE_ACCOUNTS=GE22BG0000000541687311,GE46BG0000000498609082
BOG_BONLINE_DEFAULT_ACCOUNT=GE22BG0000000541687311
BOG_BONLINE_CURRENCIES=GEL,USD,EUR
BOG_BONLINE_DEFAULT_CURRENCY=GEL
```

Access the configured lists in your code:

```php
$accounts = config('bog-sdk.bonline.accounts');
// ['GE22BG0000000541687311', 'GE46BG0000000498609082']

$currencies = config('bog-sdk.bonline.currencies');
// ['GEL', 'USD', 'EUR']

// Fetch balance for all accounts and currencies
foreach ($accounts as $iban) {
    foreach ($currencies as $currency) {
        $balance = Bog::bonline()->balance()->get($iban, $currency);
        echo "{$iban}: {$balance->availableBalance} {$currency}";
    }
}

// Stream transactions across all accounts and currencies
foreach ($accounts as $iban) {
    foreach ($currencies as $currency) {
        foreach (Bog::bonline()->statement()->stream($from, $to, $currency, $iban) as $tx) {
            // process each transaction
        }
    }
}
```

- `default_account` is used when no specific account is provided (e.g. by CLI commands).
- `default_currency` is the fallback when `currencies` is not set.
- When `BOG_BONLINE_CURRENCIES` is configured, commands automatically iterate over all currencies for each account.

### 🏛️ Account Requisites

```php
$requisites = Bog::bonline()->requisites()->get('GE29BG0000000123456789', 'GEL');

$requisites['BankName'];  // "Bank of Georgia"
$requisites['SwiftCode']; // "BAGAGE22"
```

---

## 💳 Payments v1

### 🛒 Create an Order

```php
use GiorgiGrdzelidze\BogSdk\Payments\Dto\CreateOrderRequestDto;
use GiorgiGrdzelidze\BogSdk\Payments\Dto\BasketItemDto;
use GiorgiGrdzelidze\BogSdk\Payments\Dto\BuyerDto;

$order = Bog::payments()->orders()->create(new CreateOrderRequestDto(
    callbackUrl: 'https://your-app.com/bog/callback',
    externalOrderId: 'ORDER-001',
    currency: 'GEL',
    totalAmount: 49.99,
    basket: [
        new BasketItemDto('SKU-001', 'Product name', quantity: 1, unitPrice: 49.99),
    ],
    successUrl: 'https://your-app.com/success',
    failUrl: 'https://your-app.com/fail',
    buyer: new BuyerDto('Giorgi Grdzelidze', 'giorgi@example.com', '+995599000000'),
    capture: 'automatic', // or 'manual' for pre-auth
    saveCard: false,
));

$order->id;          // BOG order UUID
$order->redirectUrl; // redirect the customer here 🔗
$order->detailsUrl;  // API URL to check status
```

### 🔍 Get Order Details

```php
$details = Bog::payments()->orders()->get($orderId);

$details->statusKey;       // "completed", "rejected", etc.
$details->totalAmount;     // 49.99
$details->currency;        // "GEL"
$details->paymentMethod;   // "card"
$details->cardMask;        // "4***1234"
$details->rrn;             // retrieval reference number
$details->externalOrderId; // "ORDER-001"
```

### ↩️ Refund / ❌ Cancel / ✅ Confirm Pre-auth

```php
// Full refund
Bog::payments()->orders()->refund($orderId);

// Partial refund
Bog::payments()->orders()->refund($orderId, amount: 10.00);

// Cancel (before completion)
Bog::payments()->orders()->cancel($orderId);

// Confirm pre-auth (capture = manual)
Bog::payments()->orders()->confirm($orderId, amount: 49.99);
```

### 💾 Saved Card Charges

```php
// Charge a saved card
Bog::payments()->cardCharges()->charge($parentOrderId, 25.00, 'GEL');

// Subscription charge
Bog::payments()->cardCharges()->subscription($parentOrderId, 9.99, 'GEL', 'SUB-001');

// Delete saved card
Bog::payments()->cardCharges()->deleteCard($parentOrderId);
```

### ✂️ Split Payments

```php
use GiorgiGrdzelidze\BogSdk\Payments\Dto\SplitAccountDto;

Bog::payments()->splitPayment()->create($orderId, [
    new SplitAccountDto('GE00ACCOUNT1', 30.00),
    new SplitAccountDto('GE00ACCOUNT2', 19.99),
]);
```

### 🍎 Apple Pay / 📱 Google Pay

```php
Bog::payments()->applePay()->complete($applePayTokenData);
Bog::payments()->googlePay()->complete($googlePayTokenData);
```

### 🔏 Verify Callback Signature

```php
// In your callback controller:
$callback = Bog::payments()->verifyCallback(
    rawBody: $request->getContent(),
    signatureHeader: $request->header('X-Signature'),
);

$callback->id;              // order ID
$callback->statusKey;       // "completed"
$callback->externalOrderId; // your order reference
$callback->totalAmount;     // 49.99
```

> 🔑 Publish the BOG callback public key first: `php artisan vendor:publish --tag=bog-sdk-keys`

---

## 💰 iPay (Legacy)

```php
use GiorgiGrdzelidze\BogSdk\IPay\Dto\IPayOrderRequestDto;
use GiorgiGrdzelidze\BogSdk\IPay\Dto\IPayItemDto;

$order = Bog::ipay()->orders()->create(new IPayOrderRequestDto(
    intent: 'CAPTURE',
    amount: 25.00,
    currency: 'GEL',
    items: [new IPayItemDto('SKU-1', 'Product', 1, 25.00)],
    callbackUrl: 'https://your-app.com/ipay/callback',
    redirectUrl: 'https://your-app.com/ipay/redirect',
));

$order->orderId;     // iPay order ID
$order->redirectUrl; // redirect customer 🔗

// 🔍 Check payment
$details = Bog::ipay()->orders()->get($orderId);

// ↩️ Refund
Bog::ipay()->orders()->refund($orderId);
Bog::ipay()->orders()->refund($orderId, amount: 10.00); // partial

// 🔄 Subscription
Bog::ipay()->orders()->subscription($orderId, 9.99);

// ✅ Pre-auth confirm
Bog::ipay()->orders()->preAuthConfirm($orderId, 25.00);
```

---

## 📆 Installment

### 🧮 Calculate Discounts

```php
use GiorgiGrdzelidze\BogSdk\Installment\Dto\CalculatorRequestDto;
use GiorgiGrdzelidze\BogSdk\Installment\Dto\InstallmentBasketItemDto;

$discounts = Bog::installment()->calculator()->discounts(new CalculatorRequestDto(
    clientType: 'standard',
    invoiceCurrency: 'GEL',
    basket: [new InstallmentBasketItemDto('PROD-1', 500.00, 1)],
    totalItemAmount: 500.00,
    totalAmount: 500.00,
));

foreach ($discounts as $discount) {
    echo "{$discount->month} months: {$discount->description} (fee: {$discount->amount})";
}
```

### 🛍️ Checkout & Details

```php
$result = Bog::installment()->checkout()->create([
    'shop_id' => config('bog-sdk.installment.shop_id'),
    'amount' => 500.00,
    'currency' => 'GEL',
    // ... other fields
]);

$details = Bog::installment()->checkout()->details($orderId);
$details->orderId; // "inst-order-123"
$details->status;  // "approved" ✅
```

### 🖥️ JS SDK Config Helper

```php
$jsConfig = Bog::installment()->jsConfig(
    basket: [
        ['product_id' => 'P1', 'total_item_amount' => 300.00, 'total_item_qty' => 1],
        ['product_id' => 'P2', 'total_item_amount' => 200.00, 'total_item_qty' => 1],
    ],
    onCompleteUrl: 'https://your-app.com/installment/complete',
);
// Returns: ['shop_id' => '...', 'basket' => [...], 'currency' => 'GEL', 'amount' => 500.00, ...]
```

### 📏 Validation Rules

```php
use GiorgiGrdzelidze\BogSdk\Support\InstallmentRules;

InstallmentRules::MIN_AMOUNT;     // 100.00 💵
InstallmentRules::MAX_AMOUNT;     // 10,000.00 💵
InstallmentRules::CURRENCY;       // "GEL"
InstallmentRules::ALLOWED_MONTHS; // [3, 6, 9, 12, 18, 24]
```

---

## 🧾 Billing

Supports four authentication methods: `oauth2`, `basic`, `apikey`, `hmac-sha256`.

```php
use GiorgiGrdzelidze\BogSdk\Billing\Dto\PaymentRequestDto;
use GiorgiGrdzelidze\BogSdk\Billing\Dto\PaymentInfoDto;

// 💵 Create payment
$response = Bog::billing()->payment(new PaymentRequestDto(
    amount: 100.00,
    currency: 'GEL',
    description: 'Invoice #123',
    externalId: 'INV-123',
));
$response->paymentId;   // "pay-uuid"
$response->status;      // "pending"
$response->redirectUrl; // redirect customer 🔗

// 🔍 Check status
$status = Bog::billing()->paymentStatus($paymentId);
$status->status; // "completed" ✅

// ❌ Cancel
$cancel = Bog::billing()->cancelPayment($paymentId);
$cancel->status; // "cancelled"

// ℹ️ Send additional info
Bog::billing()->sendPaymentInfo(new PaymentInfoDto($paymentId, ['note' => 'Extra info']));
```

---

## 🆔 BOG-ID (OpenID Connect)

```php
use GiorgiGrdzelidze\BogSdk\BogId\Enums\BogIdClaim;

// 1️⃣ Generate redirect URL
$url = Bog::bogId()->redirectUrl(
    scopes: [BogIdClaim::FPI->value, BogIdClaim::CI->value],
    redirectUri: 'https://your-app.com/auth/bog/callback',
    state: csrf_token(),
);
// Redirect user to $url 🔗

// 2️⃣ Exchange code for tokens (in callback controller)
$tokens = Bog::bogId()->exchangeCode($request->code, 'https://your-app.com/auth/bog/callback');
$tokens->accessToken;
$tokens->idToken;
$tokens->refreshToken;
$tokens->expiresIn;

// 3️⃣ Get user info
$user = Bog::bogId()->userinfo($tokens->accessToken);
$user->sub;            // unique user ID
$user->name;           // "Giorgi Grdzelidze"
$user->email;          // "giorgi@example.com"
$user->emailVerified;  // true ✅
$user->phoneNumber;    // "+995599000000"
$user->personalNumber; // "01001012345"
```

### 📋 Available BOG-ID Scopes

| Scope | Description |
|-------|-------------|
| `FPI` | 👤 Full personal info |
| `BPI` | 👤 Basic personal info |
| `PI`  | 👤 Personal info |
| `DI`  | 📄 Document info |
| `BI`  | 🏦 Bank info |
| `CI`  | 📞 Contact info |

---

## 🌐 Open Banking

### 🔐 Identity Assurance

```php
use GiorgiGrdzelidze\BogSdk\OpenBanking\Identity\Dto\IdentityRequestDto;

$result = Bog::openBanking()->identity()->assure(new IdentityRequestDto(
    personalNumber: '01001012345',
    documentNumber: 'DOC123456',
    birthDate: '1990-01-01',
));

$result->verified;   // true ✅
$result->firstName;  // "Giorgi"
$result->lastName;   // "Grdzelidze"
$result->confidence; // "HIGH"
```

---

## 🏷️ Enums

The SDK ships with typed enums for all known API codes:

```php
use GiorgiGrdzelidze\BogSdk\Payments\Enums\BogPaymentResponseCode;
use GiorgiGrdzelidze\BogSdk\Payments\Enums\OrderStatus;
use GiorgiGrdzelidze\BogSdk\Payments\Enums\PaymentMethod;
use GiorgiGrdzelidze\BogSdk\Payments\Enums\CaptureMethod;
use GiorgiGrdzelidze\BogSdk\Billing\Enums\BillingErrorCode;
use GiorgiGrdzelidze\BogSdk\Bonline\Enums\BonlineResultCode;
use GiorgiGrdzelidze\BogSdk\BogId\Enums\BogIdClaim;
use GiorgiGrdzelidze\BogSdk\Support\CurrencyCode;

// Each enum has a description() method 📖
BogPaymentResponseCode::REJECTED_INSUFFICIENT_FUNDS->description();
// "Insufficient funds"

OrderStatus::COMPLETED->value; // "completed"
PaymentMethod::CARD->value;    // "card"
CurrencyCode::GEL->value;     // "GEL"
```

---

## 🚨 Error Handling

All exceptions extend `BogSdkException`, making it easy to catch everything or be specific:

```php
use GiorgiGrdzelidze\BogSdk\Exceptions\BogSdkException;
use GiorgiGrdzelidze\BogSdk\Exceptions\BogHttpException;
use GiorgiGrdzelidze\BogSdk\Exceptions\BogAuthenticationException;
use GiorgiGrdzelidze\BogSdk\Exceptions\BogBillingException;
use GiorgiGrdzelidze\BogSdk\Exceptions\BogInvalidSignatureException;

try {
    $balance = Bog::bonline()->balance()->get($iban, 'GEL');
} catch (BogAuthenticationException $e) {
    // 🔑 OAuth credentials invalid or token fetch failed
} catch (BogHttpException $e) {
    $e->status;       // HTTP status code
    $e->body;         // raw response body
    $e->url;          // request URL
    $e->bogErrorCode; // BOG-specific error code (if present)
} catch (BogSdkException $e) {
    // 🛡️ Catch-all for any SDK error
}
```

### 🌳 Exception Hierarchy

```
BogSdkException (abstract)
├── 🔑 BogAuthenticationException     — OAuth2 token failures
├── ⚙️ BogConfigurationException      — Missing config or keys
├── 🌐 BogHttpException               — HTTP errors (4xx, 5xx) with metadata
├── 🔏 BogInvalidSignatureException   — Callback signature verification failed
├── 🏢 BogBonlineException            — Bonline-specific errors with result codes
├── 💳 BogPaymentException            — Payment errors
│   ├── ❌ BogPaymentDeclinedException  — Payment was declined
│   └── ⚠️ BogPaymentValidationException — Validation errors
├── 🧾 BogBillingException            — Billing errors with error codes and details
├── 💰 BogIPayException               — iPay errors
├── 📆 BogInstallmentException        — Installment errors
├── 🆔 BogIdException                 — BOG-ID/OIDC errors
└── 🌐 BogOpenBankingException        — Open Banking errors
```

---

## 🔐 Token Management

The SDK automatically manages OAuth2 tokens per domain:

- 🧠 **Runtime cache** — tokens are held in memory for the current request
- 💾 **Laravel cache** — tokens are persisted across requests using your configured cache driver
- ⏱️ **Safety TTL** — tokens are refreshed 60 seconds before expiry (configurable)
- 🔄 **Automatic retry** — on 401 responses, the token is refreshed and the request retried once

You can customize the cache store:

```dotenv
BOG_TOKEN_CACHE_STORE=redis
BOG_TOKEN_CACHE_PREFIX=bog-sdk:token:
BOG_TOKEN_CACHE_SAFETY_TTL=60
```

---

## 🍎 Apple Pay Domain Verification

To set up Apple Pay, publish the domain association file:

```bash
php artisan bog-sdk:publish-apple-domain-association
```

This copies the merchant verification file to `public/.well-known/apple-developer-merchantid-domain-association`.

---

## 🏗️ Architecture

```
src/
├── 🔑 Auth/
│   ├── Dto/AccessToken.php          — OAuth2 token DTO
│   └── TokenManager.php             — Per-domain OAuth2 token management with caching
├── 🧾 Billing/
│   ├── Dto/                         — PaymentRequest, PaymentResponse, PaymentStatus, Cancel, PaymentInfo
│   ├── Enums/BillingErrorCode.php   — Error code enum
│   └── BillingClient.php            — Multi-auth billing client (OAuth2/Basic/API Key/HMAC)
├── 🆔 BogId/
│   ├── Dto/                         — BogIdToken, BogIdUser
│   ├── Enums/BogIdClaim.php         — OIDC scope enum
│   └── BogIdClient.php              — Redirect, code exchange, userinfo
├── 🏢 Bonline/
│   ├── Dto/                         — Account, Balance, CurrencyRate, StatementPage, Summary, Transaction
│   ├── Endpoints/                   — Accounts, Balance, CurrencyRates, Requisites, Statement, Summary, TodayActivities
│   ├── Enums/BonlineResultCode.php  — Result code enum
│   └── BonlineClient.php            — Lazy-loaded endpoint orchestrator
├── 🖥️ Console/
│   └── PublishAppleDomainAssociationCommand.php
├── 📝 Contracts/
│   └── HttpClientContract.php       — Interface for HTTP client (get/post/put/patch/delete)
├── 🚨 Exceptions/                   — 14 exception classes with full hierarchy
├── 🌐 Http/
│   └── HttpClient.php               — Token-aware HTTP client with 401 retry
├── 📆 Installment/
│   ├── Dto/                         — CalculatorRequest, Discount, BasketItem, OrderDetails
│   ├── Endpoints/                   — Calculator, Checkout
│   └── InstallmentClient.php        — Checkout, calculator, JS config helper
├── 💰 IPay/
│   ├── Dto/                         — IPayItem, IPayOrderRequest, IPayOrderResponse, IPayPaymentDetails
│   ├── Endpoints/IPayOrdersEndpoint.php
│   └── IPayClient.php
├── 🌐 OpenBanking/
│   ├── Identity/
│   │   ├── Dto/                     — IdentityRequest, IdentityAssurance
│   │   └── IdentityClient.php
│   ├── Psd2/Psd2Client.php         — Scaffolded for future PSD2 implementation
│   └── OpenBankingClient.php
├── 💳 Payments/
│   ├── Dto/                         — BasketItem, Buyer, CreateOrderRequest/Response, OrderDetails, OrderCallback, SplitAccount
│   ├── Endpoints/                   — Orders, CardCharges, SplitPayment, ApplePay, GooglePay
│   ├── Enums/                       — BogPaymentResponseCode, OrderStatus, PaymentMethod, CaptureMethod
│   └── PaymentsClient.php           — Endpoint orchestrator + callback verification
├── 🛠️ Support/
│   ├── CurrencyCode.php             — Currency enum (GEL, USD, EUR, GBP)
│   ├── InstallmentRules.php         — Installment validation constants
│   └── SignatureVerifier.php        — RSA SHA256 callback signature verification
├── BogClient.php                    — Main client (bonline, payments, billing, ipay, installment, bogId, openBanking)
├── BogSdkServiceProvider.php        — Auto-discovery, config, singletons
└── Facades/Bog.php                  — Facade with full PHPDoc
```

---

## 🧪 Testing

The SDK ships with **110 tests and 315 assertions** ✅

```bash
# Run tests
composer test

# Run PHPStan (level 6)
composer phpstan

# Run code style check
composer pint -- --test

# Run all CI checks
composer ci
```

### 🧪 Testing in Your Application

The SDK works seamlessly with `Http::fake()`:

```php
use Illuminate\Support\Facades\Http;
use GiorgiGrdzelidze\BogSdk\BogClient;

Http::fake([
    // Fake the OAuth token endpoint
    'account.bog.ge/*' => Http::response([
        'access_token' => 'test-token',
        'expires_in' => 3600,
        'token_type' => 'Bearer',
    ]),
    // Fake the API endpoint
    'api.businessonline.ge/api/accounts/*/GEL' => Http::response([
        'AccountNumber' => 'GE00TEST',
        'Currency' => 'GEL',
        'AvailableBalance' => 1000.00,
        'CurrentBalance' => 1000.00,
        'BlockedAmount' => 0.0,
    ]),
]);

$balance = app(BogClient::class)->bonline()->balance()->get('GE00TEST', 'GEL');
assert($balance->availableBalance === 1000.00); // ✅
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

---

<p align="center">
  Made with ❤️ for the 🇬🇪 Georgian developer community
</p>
