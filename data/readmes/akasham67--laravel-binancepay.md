# Laravel Binance Pay

`codeglen/laravel-binancepay` is a Laravel package for Binance Pay order creation, order query, and webhook signature verification.

## Compatibility

- Laravel 10
- Laravel 11
- Laravel 12
- Laravel 13

## Installation

```bash
composer require codeglen/laravel-binancepay:dev-main
```

Publish config:

```bash
php artisan vendor:publish --tag=binancepay-config
```

## Configuration

Add environment values:

```dotenv
BINANCE_PAY_BASE_URL=https://bpay.binanceapi.com
BINANCE_PAY_CERTIFICATE_SN=your_binance_certificate_sn
BINANCE_PAY_SECRET_KEY=your_binance_secret_key
BINANCE_PAY_WEBHOOK_ENABLED=true
BINANCE_PAY_WEBHOOK_PATH=binancepay/webhook
```

## Usage

Create order:

```php
use Codeglen\BinancePay\Facades\BinancePay;

$response = BinancePay::createOrder([
    'merchantTradeNo' => 'ORDER-1001',
    'orderAmount' => 25.5,
    'currency' => 'USDT',
    'goods' => [
        'goodsType' => '01',
        'goodsCategory' => 'D000',
        'referenceGoodsId' => 'SKU-1001',
        'goodsName' => 'Starter Plan',
    ],
]);
```

Query order:

```php
$response = BinancePay::queryOrder('ORDER-1001');
```

DTO-based order creation:

```php
use Codeglen\BinancePay\DTO\OrderData;
use Codeglen\BinancePay\Facades\BinancePay;

$order = new OrderData(
    merchantTradeNo: 'ORDER-1002',
    currency: 'USDT',
    goodsName: 'Pro Plan',
    goodsCategory: 'D000',
    referenceGoodsId: 'SKU-1002',
    totalFee: 1000, // smallest currency unit expected by your integration
    extra: ['returnUrl' => 'https://example.com/paid']
);

$response = BinancePay::createOrder($order);
```

## Webhook Verification

When enabled, the package registers:

- `POST /binancepay/webhook` (or your configured `BINANCE_PAY_WEBHOOK_PATH`)

The controller validates Binance headers:

- `BinancePay-Timestamp`
- `BinancePay-Nonce`
- `BinancePay-Signature`

If signature verification succeeds and status is `PAID`, it dispatches:

- `Codeglen\BinancePay\Events\PaymentPaid`

Listen for the event in your app to complete payment fulfillment.

## Testing

```bash
composer test
```

## Author

Abul Kashem (<akasham67@gmail.com>)

## License

MIT
