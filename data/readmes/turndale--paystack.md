# Laravel Paystack

A robust, Cashier-like Paystack integration package for Laravel 11+. This package provides an expressive, fluent interface to Paystack's subscription billing services, handling boilerplate subscription code so you can focus on building your application.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/turndale/paystack.svg?style=flat-square)](https://packagist.org/packages/turndale/paystack)
[![Total Downloads](https://img.shields.io/packagist/dt/turndale/paystack.svg?style=flat-square)](https://packagist.org/packages/turndale/paystack)
[![License](https://img.shields.io/packagist/l/turndale/paystack.svg?style=flat-square&kill_cache=1)](https://packagist.org/packages/turndale/paystack)

## Documentation

For full documentation, usage guides, and API reference, please visit:

**<a href="https://paystack.stephenasare.dev/" target="_blank">https://paystack.stephenasare.dev/</a>**

---

## Features

- **Complete API Wrapper**: Fluent interface for all Paystack API resources (Transactions, Subscriptions, Customers, etc.).
- **Webhooks**: Automatic handling of Paystack webhooks with event dispatching.
- **Type Safety**: Fully typed responses and resources.
- **Testing**: Fully tested with PHPUnit and Orchestra Testbench.

## Requirements

- PHP 8.2+
- Laravel 11.0+

## Installation

You can install the package via composer:

```bash
composer require turndale/paystack
```

After installing, publish the configuration file:

```bash
php artisan vendor:publish --tag=paystack-config
```

Add your Paystack keys to your `.env` file:

```env
PAYSTACK_PUBLIC_KEY=pk_test_xxxx
PAYSTACK_SECRET_KEY=sk_test_xxxx
PAYSTACK_PAYMENT_URL=https://api.paystack.co
```

## Quick Start

### 1. Use the Facade

You can access any Paystack resource using the `Paystack` facade.

```php
use Turndale\Paystack\Facades\Paystack;

// Initialize a transaction
$response = Paystack::transaction()->initialize([
    'email' => 'customer@email.com',
    'amount' => 5000 // NGN 50.00
]);

return redirect($response['data']['authorization_url']);
```

### 2. Manage Subscriptions

```php
// Create a subscription
Paystack::subscription()->create([
    'customer' => 'CUS_xxxx',
    'plan' => 'PLN_xxxx'
]);
```

### 3. Transaction Splits

```php
// Create a split
Paystack::transactionSplit()->create([
    'name' => 'Percentage Split',
    'type' => 'percentage',
    'currency' => 'NGN',
    'subaccounts' => [
        ['subaccount' => 'ACCT_xxxx', 'share' => 20]
    ]
]);
```

## Webhooks

The package automatically handles Paystack webhooks for you. Just set up your webhook URL in the Paystack Dashboard to point to:

`https://your-domain.com/paystack/webhook`

You can listen to events in your application:

```php
use Turndale\Paystack\Events\PaymentSuccess;

Event::listen(PaymentSuccess::class, function ($event) {
    // Handle successful payment...
});
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Credits

- [Stephen Asare](https://github.com/stephenasare)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

MIT

## Support

If you find this package helpful, please consider:
-  Starring the repository on [GitHub](https://github.com/turndale/paystack)
-  Following me on [Twitter/X](https://x.com/stephenasare1)

