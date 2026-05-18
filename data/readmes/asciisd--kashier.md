[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

# Kashier Payment Gateway for Laravel

A Laravel package for integrating with the [Kashier](https://kashier.io) payment gateway in your Laravel applications.

## Overview

This package provides a simple and elegant way to integrate Kashier payment processing into your Laravel applications. It handles payment requests, callbacks, and webhooks with minimal configuration.

## Features

- Easy integration with Kashier payment gateway
- Support for multiple payment methods (cards, wallets, bank installments)
- Secure payment processing with hash verification
- Webhook handling for payment notifications
- Response handling for payment callbacks
- Event-driven architecture for custom payment processing logic

## Installation

You can install the package via composer:

```bash
composer require asciisd/kashier
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Asciisd\\Kashier\\Providers\\KashierServiceProvider" --tag="config"
```

Then, set your Kashier credentials in your `.env` file:

```
KASHIER_MID=your-merchant-id
KASHIER_API_KEY=your-api-key
KASHIER_SECRET_KEY=your-secret-key
KASHIER_MODE=test # or live
KASHIER_CURRENCY=EGP # or any other supported currency
KASHIER_CALLBACK_URL=https://your-website.com/payment-complete # optional custom redirect URL
```

## Usage

### Basic Payment Processing

```php
use Asciisd\Kashier\Facades\Kashier;

// Generate a payment URL
$paymentUrl = Kashier::buildPaymentUrl(
    amount: 100, // Amount in the smallest currency unit (e.g., piasters for EGP)
    orderId: 'order-123', // Your unique order ID
    attributes: [
        'customerName' => 'John Doe',
        'customerEmail' => 'john@example.com',
        'customerMobile' => '01234567890',
        // Additional attributes as needed
    ]
);

// Redirect the user to the payment URL
return redirect()->away($paymentUrl);
```

### Customizing Payment Methods

```php
use Asciisd\Kashier\Facades\Kashier;

// Allow only specific payment methods
$paymentUrl = Kashier::setAllowedMethods('card,wallet')
    ->buildPaymentUrl(100, 'order-123');
```

### Handling Payment Responses

The package automatically handles payment responses at the `/kashier/response` endpoint. You can listen for the `KashierResponseHandled` event to process successful payments:

```php
use Asciisd\Kashier\Events\KashierResponseHandled;
use Illuminate\Support\Facades\Event;

Event::listen(function (KashierResponseHandled $event) {
    $paymentData = $event->payload;
    
    // Process the payment data
    // $paymentData['paymentStatus'] contains the payment status
    // $paymentData['merchantOrderId'] contains your order ID
    // ...
});
```

#### Custom Redirect After Payment

By default, users are shown a receipt page after completing payment. If you prefer to redirect users to your own custom page, you can set the `KASHIER_CALLBACK_URL` in your `.env` file:

```
KASHIER_CALLBACK_URL=https://your-website.com/payment-complete
```

When this is configured, users will be redirected to your custom URL after payment processing, with all payment data included as query parameters. This allows you to create a completely custom post-payment experience.

### Handling Webhooks

Kashier will send webhook notifications to the `/kashier/webhook` endpoint. You can listen for the `KashierWebhookHandled` event to process these notifications:

```php
use Asciisd\Kashier\Events\KashierWebhookHandled;
use Illuminate\Support\Facades\Event;

Event::listen(function (KashierWebhookHandled $event) {
    $webhookData = $event->payload;
    
    // Process the webhook data
    // Update order status, send notifications, etc.
});
```

### Retrieving Transaction Details

```php
use Asciisd\Kashier\Facades\Kashier;

try {
    $transactionDetails = Kashier::getTransactionDetails('order-123');
    
    // Process transaction details
    // $transactionDetails['paymentStatus'] contains the payment status
    // ...
} catch (Exception $e) {
    // Handle error
}
```

## Security

The package automatically verifies the signature of incoming webhook and response requests to ensure they are legitimate and have not been tampered with.

## Events

- `KashierResponseHandled`: Dispatched when a payment response is received
- `KashierWebhookHandled`: Dispatched when a webhook notification is received

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/asciisd/kashier.svg?style=flat
[ico-license]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat
[ico-status]: https://github.com/asciisd/kashier/workflows/tests/badge.svg
[ico-scrutinizer]: https://img.shields.io/scrutinizer/coverage/g/asciisd/kashier.svg?style=flat
[ico-code-quality]: https://img.shields.io/scrutinizer/g/asciisd/kashier.svg?style=flat
[ico-downloads]: https://img.shields.io/packagist/dt/asciisd/kashier.svg?style=flat

[link-packagist]: https://packagist.org/packages/asciisd/kashier
[link-actions]: https://github.com/asciisd/kashier/actions
[link-scrutinizer]: https://scrutinizer-ci.com/g/asciisd/kashier/code-structure
[link-code-quality]: https://scrutinizer-ci.com/g/asciisd/kashier
[link-downloads]: https://packagist.org/packages/asciisd/kashier
[link-author]: https://github.com/asciisd
[link-contributors]: ../../contributors
