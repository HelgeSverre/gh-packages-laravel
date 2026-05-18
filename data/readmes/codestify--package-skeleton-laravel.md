# Paisa: Seamless Multi-Gateway Payment Streaming for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/manza/paisa.svg?style=flat-square)](https://packagist.org/packages/manza/paisa)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/manza/paisa/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/manza/paisa/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/manza/paisa/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/manza/paisa/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/manza/paisa.svg?style=flat-square)](https://packagist.org/packages/manza/paisa)

Paisa is a powerful, intuitive Laravel package that simplifies multi-gateway payment processing. With its fluent API, Paisa allows developers to effortlessly integrate and manage various payment gateways like Stripe, PayPal, and GoCardless. This package provides a unified, expressive interface for handling payments, authorizations, captures, refunds, and more.

## Key features:

- Fluent, chainable API for clear and concise payment logic
- Easy integration with multiple payment gateways
- Consistent interface across different payment providers
- Built-in support for common payment operations
- Extensible architecture for adding new gateways
- Laravel-friendly design with easy configuration

Streamline your payment processing with Paisa and experience the flow of effortless transactions in your Laravel applications.

## Installation

You can install the package via composer:

```bash
composer require manza/paisa
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="paisa-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="paisa-config"
```

This is the contents of the published config file:

```php
return [
    'default' => 'paypal',
    'gateways' => [
        'stripe' => [
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
        ],
        'paypal' => [
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'client_secret' => env('PAYPAL_CLIENT_SECRET'),
            'sandbox' => env('PAYPAL_SANDBOX', true),
        ],
        'gocardless' => [
            'access_token' => env('GOCARDLESS_ACCESS_TOKEN'),
            'environment' => env('GOCARDLESS_ENVIRONMENT', 'sandbox'),
        ],
    ],
];
```

## Usage

```php
use Manza\Paisa\Facades\Paisa;
use Manza\Paisa\PaymentGateways\Paypal\Enums\Status;

// create a payment request
$response = Paisa::make('paypal')
            ->purchase([
                'amount'    => '10.00',
                'currency'  => 'GBP',
                'returnUrl' => route('paypal.complete'),
                'cancelUrl' => route('paypal.cancel'),
            ]);

// You have access to following methods
$response->isRedirect();
$response->getTransactionReference();
$response->getRedirectUrl();

// Check if the order can be captured
$response = Paisa::make('paypal')
      ->fetchTransaction([
         'transactionReference' => $transactionReference
      ]);
      
$orderDetails = $response->getData();

if ($orderDetails['status'] !== Status::APPROVED) {
    throw new \Exception('Order is not in a state that can be captured. Current state: ' . $orderDetails['status']);
}

Paisa::make('paypal')
     ->complete([
        'transactionReference' => $transactionReference
     ])

```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
