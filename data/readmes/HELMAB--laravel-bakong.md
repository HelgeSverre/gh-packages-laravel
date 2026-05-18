# Laravel Bakong

[![Latest Version on Packagist](https://img.shields.io/packagist/v/helmab/bakong.svg?style=flat-square)](https://packagist.org/packages/helmab/bakong)
[![Total Downloads](https://img.shields.io/packagist/dt/helmab/bakong.svg?style=flat-square)](https://packagist.org/packages/helmab/bakong)
[![License](https://img.shields.io/packagist/l/helmab/bakong.svg?style=flat-square)](https://packagist.org/packages/helmab/bakong)

Laravel package for the [Bakong Open API](https://api-bakong.nbc.gov.kh/document) (National Bank of Cambodia).

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require helmab/bakong
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=bakong-config
```

Add your credentials to `.env`:

```env
BAKONG_EMAIL=your-registered-email@example.com
```

Optionally set a token manually to skip auto-renewal:

```env
BAKONG_TOKEN=your-token-here
```

## Usage

### Using the Facade

```php
use Helmab\Bakong\Facades\Bakong;

// Check transaction by MD5
$transaction = Bakong::checkTransactionByMd5('d60f3db96913029a2af979a1662c1e72');

$transaction->hash;
$transaction->fromAccountId;
$transaction->toAccountId;
$transaction->currency;
$transaction->amount;
$transaction->description;
$transaction->createdDateMs;
$transaction->acknowledgedDateMs;
```

### Check Transaction by Hash

```php
$transaction = Bakong::checkTransactionByHash('dcd53430d3b3005d9cda36f1fe8dedc3714ccf18f886cf5d090d36fee67ef956');
```

### Check Transaction by Short Hash

```php
use Helmab\Bakong\Enums\Currency;

$transaction = Bakong::checkTransactionByShortHash('8465d722', 1.0, Currency::USD);
```

### Check Transaction by Instruction Reference

```php
$transaction = Bakong::checkTransactionByInstructionRef('00001234');
```

### Check Transaction by External Reference

```php
$transaction = Bakong::checkTransactionByExternalRef('DEV123456ZTH');
```

### Check Bakong Account

```php
$exists = Bakong::checkBakongAccount('user@bank'); // true or false
```

### Generate Deeplink

```php
use Helmab\Bakong\DTOs\DeeplinkSource;

$result = Bakong::generateDeeplink('0002010....');

// With source info
$source = new DeeplinkSource(
    appIconUrl: 'https://example.com/icon.png',
    appName: 'My App',
    appDeepLinkCallback: 'https://example.com/callback',
);

$result = Bakong::generateDeeplink('0002010....', $source);

$result->shortLink; // https://bakong.page.link/...
```

### Batch Check Transactions

```php
// By MD5 list
$items = Bakong::checkTransactionByMd5List([
    '0dbe08d3829a8b6b59844e51aa38a4e2',
    '7b0e5c36486d7155eb3ee94997fe9bfb',
]);

foreach ($items as $item) {
    $item->md5;       // MD5 hash
    $item->status;    // SUCCESS, NOT_FOUND, STATIC_QR
    $item->message;
    $item->data;      // Transaction or null
}

// By hash list
$items = Bakong::checkTransactionByHashList([
    'f0ae142842181535e678900bc5be1c3bd48d567ced77410a169fb672792968c8',
    '9036688e95cb3d1b621a9a989ebe64629d8c118654cfbc47f4d4991d72fc3b44',
]);
```

### Token Renewal

```php
$token = Bakong::renewToken();
```

Token is automatically renewed on the first API call or when a 401 response is received.

## Exception Handling

```php
use Helmab\Bakong\Exceptions\TransactionNotFoundException;
use Helmab\Bakong\Exceptions\TransactionFailedException;
use Helmab\Bakong\Exceptions\AuthenticationException;
use Helmab\Bakong\Exceptions\BakongException;

try {
    $transaction = Bakong::checkTransactionByMd5('...');
} catch (TransactionNotFoundException $e) {
    // Transaction not found (errorCode: 1)
} catch (TransactionFailedException $e) {
    // Transaction failed (errorCode: 3)
} catch (AuthenticationException $e) {
    // Unauthorized (errorCode: 6)
} catch (BakongException $e) {
    // Other API errors
    $e->responseCode;
    $e->errorCode;
    $e->responseMessage;
}
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
