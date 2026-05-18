# QiCard Payment Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/thejano/laravel-qicard-payment.svg)](https://packagist.org/packages/thejano/laravel-qicard-payment)
[![Total Downloads](https://img.shields.io/packagist/dt/thejano/laravel-qicard-payment.svg)](https://packagist.org/packages/thejano/laravel-qicard-payment)
[![Tests](https://github.com/thejano/laravel-qicard-payment/actions/workflows/tests.yml/badge.svg)](https://github.com/thejano/laravel-qicard-payment/actions/workflows/tests.yml)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.2-8892BF.svg)](https://php.net/)
[![Laravel Version](https://img.shields.io/badge/laravel-10.x%20%7C%2011.x%20%7C%2012.x-FF2D20.svg)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A Laravel package for integrating with QiCard Payment Gateway.

## Payment Flow

1. Initiate the payment with the appropriate API call.
2. Upon success, the Gateway responds with a result containing the `formUrl`.
3. Redirect the user to the `formUrl` to complete the payment.
4. The Gateway sends an asynchronous notification to the URL provided in the initial API call.
5. The user will be redirected to the `finishPaymentUrl` with payment status parameters.

## Installation

Install the package via Composer:

```sh
composer require thejano/laravel-qicard-payment
```

## Configuration

Publish the configuration file:

```sh
php artisan vendor:publish --provider="TheJano\QiCardPayment\Providers\QiCardPaymentServiceProvider"
```

This will create a `config/qicard.php` file.

Set your environment variables in `.env`:

```ini
QICARD_USERNAME=your_username
QICARD_PASSWORD=your_password
QICARD_TERMINAL_ID=your_terminal_id
QICARD_BASE_URL=https://uat-sandbox-3ds-api.qi.iq/api/v1
QICARD_CURRENCY=IQD
QICARD_LOCALE=en_US
QICARD_FINISH_URL=https://yourapp.com/payment/finish
QICARD_NOTIFICATION_URL=https://yourapp.com/payment/notification
```

## Usage

### Creating a Payment

```php
use TheJano\QiCardPayment\Services\QiCardPayment;
use TheJano\QiCardPayment\Helpers\TransactionHelper;

$requestId = TransactionHelper::generateRequestId();
$paymentData = QiCardPayment::make()->createPayment($requestId, 50000);

if ($paymentData->isSuccessful()) {
    return redirect($paymentData->getPaymentUrl());
}
```

### Using the Facade

```php
use TheJano\QiCardPayment\Facades\QiCardPayment;
use TheJano\QiCardPayment\Helpers\TransactionHelper;

$requestId = TransactionHelper::generateRequestId();
$paymentData = QiCardPayment::createPayment($requestId, 50000);

return redirect($paymentData->getPaymentUrl());
```

### With Customer Info

```php
use TheJano\QiCardPayment\Services\QiCardPayment;
use TheJano\QiCardPayment\Data\CustomerInfo;
use TheJano\QiCardPayment\Helpers\TransactionHelper;

$customerInfo = new CustomerInfo([
    'firstName' => 'John',
    'lastName' => 'Doe',
    'phone' => '009647xxxxxxxxx',
    'email' => 'john.doe@example.com',
]);

$requestId = TransactionHelper::generateRequestId();
$paymentData = QiCardPayment::make()->createPayment(
    $requestId,
    50000,
    'IQD',
    $customerInfo
);
```

### Checking Payment Status

```php
use TheJano\QiCardPayment\Facades\QiCardPayment;

$response = QiCardPayment::getPaymentStatus('payment-id-here');
```

### Canceling a Payment

```php
use TheJano\QiCardPayment\Facades\QiCardPayment;
use TheJano\QiCardPayment\Helpers\TransactionHelper;

$requestId = TransactionHelper::generateRequestId();
$response = QiCardPayment::cancelPayment('payment-id', $requestId, 50000);

if ($response->canceled) {
    // Payment canceled successfully
}
```

### Processing a Refund

```php
use TheJano\QiCardPayment\Facades\QiCardPayment;
use TheJano\QiCardPayment\Helpers\TransactionHelper;

$requestId = TransactionHelper::generateRequestId();
$refundResponse = QiCardPayment::refundPayment('payment-id', $requestId, 25000);

if ($refundResponse->isSuccessful()) {
    // Refund processed successfully
}
```

## Response Data Properties

### QiCardPaymentResponse

| Property | Type | Description |
|----------|------|-------------|
| `success` | bool | Indicates if the API request was successful |
| `requestId` | string\|null | Unique request identifier |
| `paymentId` | string\|null | Payment identifier |
| `amount` | float\|null | Payment amount |
| `confirmedAmount` | float\|null | Confirmed amount (after payment) |
| `currency` | string\|null | Currency code |
| `status` | string\|null | Payment status (see Payment Statuses) |
| `paymentType` | string\|null | Payment type (e.g., CARD) |
| `formUrl` | string\|null | URL to redirect user for payment |
| `canceled` | bool | Whether payment was canceled |
| `withoutAuthenticate` | bool | Whether 3DS authentication was bypassed |
| `details` | array\|null | Payment details (card info, auth info) |
| `cancels` | array\|null | List of cancel operations |
| `errorCode` | int\|null | Error code if failed |
| `errorMessage` | string\|null | Error message if failed |

#### Helper Methods

```php
$response->isSuccessful();        // API request was successful
$response->isPaid();              // Status is SUCCESS
$response->isCreated();           // Status is CREATED
$response->isFormShowed();        // Status is FORM_SHOWED
$response->isFailed();            // Status is FAILED
$response->isAuthenticationFailed(); // Status is AUTHENTICATION_FAILED
$response->isCanceled();          // Payment was canceled
$response->getMaskedPan();        // Get masked card number
$response->getPaymentSystem();    // Get card network (VISA, MASTER_CARD)
$response->getAuthId();           // Get authorization ID
$response->getRrn();              // Get retrieval reference number
```

### QiCardRefundResponse

| Property | Type | Description |
|----------|------|-------------|
| `success` | bool | Indicates if refund was successful |
| `requestId` | string\|null | Unique request identifier |
| `refundId` | string\|null | Refund identifier |
| `paymentId` | string\|null | Original payment identifier |
| `amount` | float\|null | Refund amount |
| `currency` | string\|null | Currency code |
| `status` | string\|null | Refund status |
| `message` | string\|null | Refund message |
| `details` | array\|null | Refund transaction details |

## Payment Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Payment has been created, awaiting user action |
| `FORM_SHOWED` | Payment form has been displayed to user |
| `SUCCESS` | Payment completed successfully |
| `FAILED` | Payment failed |
| `AUTHENTICATION_FAILED` | 3DS authentication failed |

## HTTP Response Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request processed successfully |
| `400` | Bad Request | Invalid request parameters or payment state |
| `401` | Unauthorized | Invalid credentials or missing authentication |
| `500` | Internal Server Error | Server-side error occurred |

## Error Codes

When a request fails, the response contains an `error` object:

```json
{
  "error": {
    "code": 18,
    "message": "INCORRECT_TRANSFER_STATE"
  }
}
```

| Code | Message | Description |
|------|---------|-------------|
| `18` | `INCORRECT_TRANSFER_STATE` | Payment is not in the correct state for the requested operation |

## Author

**Dr. Pshtiwan Mahmood**

- GitHub: [@drpshtiwan](https://github.com/drpshtiwan)
- Website: [thejano.com](https://thejano.com)

## License

This package is open-source and licensed under the [MIT License](LICENSE).

## API Documentation

For more details, visit the official API documentation:

[https://developers-gate.qi.iq/docs/intro](https://developers-gate.qi.iq/docs/intro)
