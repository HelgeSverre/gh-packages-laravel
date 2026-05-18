# Iraqi Payments Gateway for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ht3aa/payments-gateway.svg?style=flat-square)](https://packagist.org/packages/ht3aa/payments-gateway)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ht3aa/payments-gateway/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ht3aa/payments-gateway/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ht3aa/payments-gateway/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ht3aa/payments-gateway/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ht3aa/payments-gateway.svg?style=flat-square)](https://packagist.org/packages/ht3aa/payments-gateway)

A comprehensive Laravel package that allows your application to integrate with all major Iraqi payment gateways and other payment providers in one unified package.

## Supported Payment Gateways

- **FIB (First Iraqi Bank)** - Modern banking payment solution
- **Qi Card** - Popular Iraqi payment card system
- **ZainCash** - Mobile wallet payment gateway
- **Switch** - International payment processor (HyperPay)

## Installation

You can install the package via composer:

```bash
composer require ht3aa/payments-gateway
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="payments-gateway-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="payments-gateway-config"
```

## Configuration

After publishing the config file, add the following to your `.env` file:

### FIB Payment Configuration

```env
FIB_CLIENT_ID=your_client_id
FIB_CLIENT_SECRET=your_client_secret
FIB_IS_PRODUCTION=false
FIB_TEST_BASE_URL=https://test.fib.iq
FIB_PRODUCTION_BASE_URL=https://fib.iq
```

### Qi Card Configuration

```env
QI_CARD_API_URL=https://api.qicard.com
QI_CARD_TERMINAL_ID=your_terminal_id
QI_CARD_USERNAME=your_username
QI_CARD_PASSWORD=your_password
```

### ZainCash Configuration

```env
ZAINCASH_MERCHANT_ID=your_merchant_id
ZAINCASH_MERCHANT_SECRET=your_merchant_secret
ZAINCASH_MSISDN=your_msisdn
ZAINCASH_IS_PRODUCTION=false
```

### Switch Configuration

```env
SWITCH_BASE_URL=https://oppwa.com/v1
SWITCH_RESOURCE_PATH_BASE_URL=https://oppwa.com/v1
SWITCH_TOKEN=your_access_token
SWITCH_ENTITY_ID=your_entity_id
```

Add these configurations to your `config/services.php`:

```php
return [
    // ... other services
    
    'fib' => [
        'client_id' => env('FIB_CLIENT_ID'),
        'client_secret' => env('FIB_CLIENT_SECRET'),
        'is_production' => env('FIB_IS_PRODUCTION', false),
        'test_base_url' => env('FIB_TEST_BASE_URL'),
        'production_base_url' => env('FIB_PRODUCTION_BASE_URL'),
    ],
    
    'qi_card' => [
        'api_url' => env('QI_CARD_API_URL'),
        'terminal_id' => env('QI_CARD_TERMINAL_ID'),
        'username' => env('QI_CARD_USERNAME'),
        'password' => env('QI_CARD_PASSWORD'),
    ],
    
    'zaincash' => [
        'merchant_id' => env('ZAINCASH_MERCHANT_ID'),
        'merchant_secret' => env('ZAINCASH_MERCHANT_SECRET'),
        'msisdn' => env('ZAINCASH_MSISDN'),
        'is_production' => env('ZAINCASH_IS_PRODUCTION', false),
    ],
    
    'switch' => [
        'base_url' => env('SWITCH_BASE_URL'),
        'resource_path_base_url' => env('SWITCH_RESOURCE_PATH_BASE_URL'),
        'token' => env('SWITCH_TOKEN'),
        'entity_id' => env('SWITCH_ENTITY_ID'),
    ],
];
```

## Usage

The package automatically registers API routes under the `/payments-gateway` prefix.

### Available API Endpoints

#### FIB Payments
```
POST   /payments-gateway/fib-payments
GET    /payments-gateway/fib-payments/{id}
PUT    /payments-gateway/fib-payments/{id}
```

#### Qi Card Payments
```
POST   /payments-gateway/qi-card-payments
GET    /payments-gateway/qi-card-payments/{id}
PUT    /payments-gateway/qi-card-payments/{id}
POST   /payments-gateway/qi-card-payments/update/{id}  (Webhook)
```

#### ZainCash Transactions
```
POST   /payments-gateway/zain-cash-transactions
GET    /payments-gateway/zain-cash-transactions/{id}
GET    /payments-gateway/zain-cash-transactions/update/{id}  (Webhook)
```

#### Switch Checkouts
```
POST   /payments-gateway/switch-checkouts
PUT    /payments-gateway/switch-checkouts/{id}
```

### Using Services in Your Code

#### FIB Payment Example

```php
use Ht3aa\PaymentsGateway\Services\FibService;
use Ht3aa\PaymentsGateway\Models\FibPayment;

$fibService = new FibService();

// Create a payment
$payment = FibPayment::create([
    'order_id' => $orderId,
    'customer_id' => $customerId,
    'amount' => 100.00,
    'currency' => 'IQD',
]);

$payment = $fibService->createPayment($payment);

// Check payment status
$payment = $fibService->getPayment($payment);

// Refund a payment
$payment = $fibService->refundPayment($payment);
```

#### Qi Card Payment Example

```php
use Ht3aa\PaymentsGateway\Services\QiCardService;
use Ht3aa\PaymentsGateway\Models\QiCardPayment;

$qiCardService = new QiCardService();

// Create a payment
$payment = QiCardPayment::create([
    'order_id' => $orderId,
    'customer_id' => $customerId,
    'amount' => 50000,
    'currency' => 'IQD',
    'request_id' => Str::uuid(),
]);

$payment = $qiCardService->createPayment($payment);

// The payment will have a form_url for the customer to complete payment
redirect($payment->form_url);
```

#### ZainCash Transaction Example

```php
use Ht3aa\PaymentsGateway\Services\ZainCashService;
use Ht3aa\PaymentsGateway\Models\ZainCashTransaction;

$zainCashService = new ZainCashService();

// Initiate a transaction
$transaction = ZainCashTransaction::create([
    'order_id' => $orderId,
    'customer_id' => $customerId,
    'amount' => 25000,
    'service_type' => 'Your Service Name',
]);

$transaction = $zainCashService->initiateTransaction($transaction);

// Redirect user to payment page
redirect($transaction->payment_redirect_url);

// Check transaction status
$transaction = $zainCashService->checkTransaction($transaction);
```

#### Switch Checkout Example

```php
use Ht3aa\PaymentsGateway\Services\SwitchService;
use Ht3aa\PaymentsGateway\Models\SwitchCheckout;

$switchService = new SwitchService();

// Prepare checkout
$checkout = SwitchCheckout::create([
    'order_id' => $orderId,
    'customer_id' => $customerId,
    'amount' => 100.00,
    'currency' => 'USD',
    'payment_type' => 'DB',
]);

$checkout = $switchService->prepareCheckout($checkout);

// Update checkout after payment
$checkout = $switchService->updateCheckout($checkout, $resourcePath);
```

### Using Repositories

```php
use Ht3aa\PaymentsGateway\Repositores\FibPaymentRepository;
use Ht3aa\PaymentsGateway\Repositores\QiCardPaymentRepository;
use Ht3aa\PaymentsGateway\Repositores\ZainCashTransactionRepository;
use Ht3aa\PaymentsGateway\Repositores\SwitchCheckoutRepository;

// Inject repository in your controller
public function __construct(
    private FibPaymentRepository $fibPaymentRepository
) {}

// Create payment from order
$payment = $this->fibPaymentRepository->createPayment($orderId);

// Show payment
$payment = $this->fibPaymentRepository->showPayment($payment);

// Get by payment ID
$payment = $this->fibPaymentRepository->getByPaymentId($paymentId);
```

### Artisan Commands

Check payment status using artisan commands:

```bash
# Check FIB payment status
php artisan fib:check-payment-status

# Check Qi Card payment status
php artisan qi-card:check-payment-status
```

### Payment Status Enums

```php
use Ht3aa\PaymentsGateway\Enums\FibPaymentStatus;
use Ht3aa\PaymentsGateway\Enums\QiCardPaymentStatus;
use Ht3aa\PaymentsGateway\Enums\SwitchCheckoutStatus;
use Ht3aa\PaymentsGateway\Enums\ZainCashStatus;

// Example usage
if ($payment->status === FibPaymentStatus::PENDING) {
    // Handle pending payment
}
```

## Database Tables

The package creates the following tables:

- `fib_payments` - FIB payment transactions
- `qi_card_payments` - Qi Card payment transactions
- `zain_cash_transactions` - ZainCash transactions
- `switch_checkouts` - Switch payment checkouts

All tables include soft deletes and activity logging support.

## Testing

```bash
composer test
```

## Code Quality

Run code style fixes:

```bash
composer format
```

Run static analysis:

```bash
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Requirements

- PHP 8.4 or higher
- Laravel 11.0 or 12.0
- `spatie/laravel-activitylog` for activity logging
- `firebase/php-jwt` for JWT token handling (ZainCash)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Hasan Tahseen](https://github.com/ht3aa)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
