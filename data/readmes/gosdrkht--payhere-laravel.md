# PayHere Laravel 🇱🇰

A clean, simple Laravel package for integrating **PayHere** payment 
gateway — built for Sri Lankan developers.

## Installation

composer require leadingedge/payhere-laravel

## Configuration

Publish the config file:

php artisan vendor:publish --tag=payhere-config

Add to your `.env` file:

PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX=true
PAYHERE_CURRENCY=LKR

## Usage

### Generate Checkout Form

use LeadingEdge\PayHere\Facades\PayHere;

$checkoutData = PayHere::buildCheckout([
    'order_id'   => 'ORDER-001',
    'items'      => 'Premium Plan',
    'amount'     => 2500.00,
    'first_name' => 'Kamal',
    'last_name'  => 'Perera',
    'email'      => 'kamal@email.com',
    'phone'      => '0771234567',
    'return_url' => route('payment.success'),
    'cancel_url' => route('payment.cancel'),
    'notify_url' => route('payment.notify'),
]);

### Verify Webhook Notification

if (PayHere::verifyNotification($request->all())) {
    // Payment confirmed ✅
}

## Requirements
- PHP 8.0+
- Laravel 9, 10, or 11

## License
MIT — Free to use

## Author
**Trishan** — [Leading Edge Solutions](https://leadingedgesolutions.lk) 🇱🇰