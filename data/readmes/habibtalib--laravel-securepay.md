<p align="center">
  <img src="assets/images/logo-securepay.svg" alt="SecurePay" width="200">
</p>

<h1 align="center">Laravel SecurePay</h1>

<p align="center">
  <strong>SecurePay v2 payment gateway package for Laravel</strong><br>
  FPX · DuitNow · Direct Debit · B2C · B2B
</p>

<p align="center">
  <a href="https://packagist.org/packages/habibtalib/laravel-securepay"><img src="https://img.shields.io/badge/version-1.0.0-3F69B2?style=flat-square" alt="Version"></a>
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-10%20|%2011%20|%2012-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel"></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-8.1%2B-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"></a>
</p>

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Auth** | Automatic authentication with token caching |
| 💳 **Payment Intents** | Create payments via SecurePay v2 API |
| 🏦 **Bank List** | FPX, DuitNow, Direct Debit bank queries |
| ✅ **HMAC Verification** | Secure callback signature verification |
| 📡 **Events** | `PaymentSuccessful` and `PaymentFailed` events |
| 🔄 **Auto-retry** | Token refresh on 401 with single retry |
| 🧪 **Sandbox** | Built-in sandbox/production environment toggle |
| 🏗️ **Laravel 10-12** | Supports Laravel 10, 11, and 12 |

## 🚀 Installation

```bash
composer require habibtalib/laravel-securepay
```

Publish the config:

```bash
php artisan vendor:publish --tag=securepay-config
```

## ⚙️ Configuration

Add to your `.env`:

```env
SECUREPAY_ENVIRONMENT=sandbox

# Sandbox credentials
SECUREPAY_SANDBOX_CLIENT_ID=your-sandbox-client-id
SECUREPAY_SANDBOX_CLIENT_SECRET=your-sandbox-secret

# Production credentials
SECUREPAY_CLIENT_ID=your-production-client-id
SECUREPAY_CLIENT_SECRET=your-production-secret

# URLs
SECUREPAY_CALLBACK_URL=https://yourapp.com/securepay/callback
SECUREPAY_REDIRECT_URL=https://yourapp.com/securepay/redirect
```

> Get your credentials from [SecurePay Console](https://console.securepay.my/) → Developer Tools

## 💳 Usage

### Create a Payment

```php
use HabibTalib\SecurePay\Facades\SecurePay;

$payment = SecurePay::createPayment([
    'order_number' => 'ORD-12345',
    'buyer_name' => 'Ali Ahmad',
    'buyer_email' => 'ali@example.com',
    'buyer_phone' => '60123456789',
    'amount' => 1500, // RM 15.00 (in cents!)
    'description' => 'Order #12345',
]);

// Redirect customer to payment page
return redirect($payment->getCheckoutUrl());
```

### Get Bank List

```php
// FPX B2C banks (default)
$banks = SecurePay::getBanks();

// FPX B2B banks
$banks = SecurePay::getBanks('fpx', 'b2b1');

// DuitNow retail banks
$banks = SecurePay::getBanks('duitnow', 'retail');

// Direct Debit
$banks = SecurePay::getBanks('direct_debit', 'b2c');
```

**Supported gateways:**

| Gateway | Types |
|---|---|
| `fpx` | `b2c`, `b2b1` |
| `duitnow` | `retail`, `corporate` |
| `direct_debit` | `b2c`, `b2b1` |

### Handle Callbacks

The package auto-registers callback routes. Listen for payment events in your `EventServiceProvider`:

```php
use HabibTalib\SecurePay\Events\PaymentSuccessful;
use HabibTalib\SecurePay\Events\PaymentFailed;

protected $listen = [
    PaymentSuccessful::class => [
        \App\Listeners\HandlePaymentSuccess::class,
    ],
    PaymentFailed::class => [
        \App\Listeners\HandlePaymentFailed::class,
    ],
];
```

Example listener:

```php
namespace App\Listeners;

use HabibTalib\SecurePay\Events\PaymentSuccessful;

class HandlePaymentSuccess
{
    public function handle(PaymentSuccessful $event): void
    {
        $payment = $event->payment;
        // $payment['status']           → 'successful'
        // $payment['reference_number'] → 'SP-123456'
        // $payment['order_number']     → 'ORD-12345'
        // $payment['intent_uuid']      → 'uuid-here'

        // Update your order, send email, etc.
        Order::where('order_number', $payment['order_number'])
            ->update(['status' => 'paid', 'payment_ref' => $payment['reference_number']]);
    }
}
```

### Verify Callback Manually

```php
$isValid = SecurePay::verifyCallback($request->all());
```

### Check Payment Status

```php
$status = SecurePay::getPaymentStatus('intent-uuid-here');
```

### Direct Client Access

```php
use HabibTalib\SecurePay\SecurePayClient;

$client = app(SecurePayClient::class);

// Get auth token
$token = $client->getAuthToken();

// Clear cached token
$client->clearAuthToken();
```

## 🔌 API Reference

### Environments

| Environment | Base URL |
|---|---|
| **Production** | `https://console.securepay.my/api` |
| **Sandbox** | `https://sandbox.securepay.dev/api` |

### Routes (auto-registered)

| Method | URI | Name | Description |
|---|---|---|---|
| `POST` | `/securepay/callback` | `securepay.callback` | Payment callback (CSRF excluded) |
| `GET` | `/securepay/redirect` | `securepay.redirect` | Customer redirect after payment |

> Publish routes for customization: `php artisan vendor:publish --tag=securepay-routes`

### Payment Intent Response

```php
$payment = SecurePay::createPayment([...]);

$payment->uuid;         // Intent UUID
$payment->checkoutUrl;  // Redirect URL for customer
$payment->status;       // 'pending'
$payment->orderNumber;  // Your order number
$payment->amount;       // Amount in cents
$payment->isSuccessful(); // true if checkout_url exists
$payment->toArray();    // Raw API response
```

### Exceptions

| Exception | When |
|---|---|
| `AuthenticationException` | Invalid credentials or auth failure |
| `PaymentException` | Missing required fields or payment error |
| `ApiException` | General API errors (4xx, 5xx) |

All extend `SecurePayException` for easy catching:

```php
use HabibTalib\SecurePay\Exceptions\SecurePayException;

try {
    $payment = SecurePay::createPayment([...]);
} catch (SecurePayException $e) {
    logger()->error('SecurePay error: ' . $e->getMessage());
}
```

## 📁 Structure

```
laravel-securepay/
├── config/securepay.php          # Configuration
├── routes/securepay.php          # Callback & redirect routes
├── src/
│   ├── SecurePayServiceProvider.php  # Auto-discovery provider
│   ├── SecurePayClient.php           # Main API client
│   ├── PaymentIntent.php             # Payment intent DTO
│   ├── Facades/SecurePay.php         # Facade
│   ├── Events/
│   │   ├── PaymentSuccessful.php
│   │   └── PaymentFailed.php
│   ├── Exceptions/
│   │   ├── SecurePayException.php
│   │   ├── AuthenticationException.php
│   │   ├── PaymentException.php
│   │   └── ApiException.php
│   └── Http/Controllers/
│       └── SecurePayCallbackController.php
└── tests/
```

## 📋 Changelog

### 1.0.0
- ✨ SecurePay v2 Payment Intents API
- 🔐 JWT authentication with Laravel cache
- 🏦 FPX, DuitNow, Direct Debit bank list
- 🛡️ HMAC-SHA256 callback verification
- 📡 Payment events (successful/failed)
- 🔄 Auto token refresh on 401

## 📜 License

MIT — see [LICENSE](LICENSE)

## 🔗 Links

| Resource | URL |
|---|---|
| SecurePay Website | [securepay.my](https://www.securepay.my/) |
| SecurePay Console | [console.securepay.my](https://console.securepay.my/) |
| v2 API Docs | [v2.docs.securepay.my](https://v2.docs.securepay.my/) |
| WooCommerce Plugin | [habibtalib/securepay-woocommerce](https://github.com/habibtalib/securepay-woocommerce) |

---

<p align="center">
  <sub>Built with ❤️ for Malaysian developers</sub><br>
  <sub>Powered by <a href="https://www.securepay.my/">SecurePay Sdn Bhd</a></sub>
</p>
