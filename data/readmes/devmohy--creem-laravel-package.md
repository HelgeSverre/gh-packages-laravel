# CREEM Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/devmohy/creem-laravel.svg?style=flat-square)](https://packagist.org/packages/devmohy/creem-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/devmohy/creem-laravel.svg?style=flat-square)](https://packagist.org/packages/devmohy/creem-laravel)
[![License](https://img.shields.io/packagist/l/devmohy/creem-laravel.svg?style=flat-square)](https://packagist.org/packages/devmohy/creem-laravel)

Official Laravel package for [CREEM](https://creem.io), providing a clean, Laravel-native way to integrate payments, subscriptions, and webhooks.

## Features

- **Facade Support**: Simple API calls via `Creem::createCheckout()` and more.
- **Webhook Integration**: Middleware-protected webhook routing with automatic event dispatching.
- **Artisan Commands**: Easily manage your CREEM configuration and sync products.
- **SaaS Ready**: Designed for subscriptions and one-time payments.
- **CI/CD Ready**: Pre-configured GitHub Actions for automated testing.
- **Code Quality**: Built-in support for Laravel Pint to maintain clean code.

## Installation

You can install the package via composer:

```bash
composer require devmohy/creem-laravel
```

You should publish the config file with:

```bash
php artisan vendor:publish --tag="creem-config"
```

This is the contents of the published config file:

```php
return [
    'api_key' => env('CREEM_API_KEY'),
    'webhook_secret' => env('CREEM_WEBHOOK_SECRET'),
    'api_base_url' => env('CREEM_API_BASE_URL', 'https://api.creem.io/v1'),
];
```

## Usage

### Create a Checkout Session

```php
use Creem\CreemLaravel\Facades\Creem;

$response = Creem::createCheckout([
    'product_id' => 'prod_12345',
    'success_url' => route('checkout.success'),
    'cancel_url' => route('checkout.cancel'),
    'customer' => [
        'email' => 'user@example.com',
    ],
]);

if ($response->successful()) {
    $checkoutUrl = $response->json('checkout_url');
    return redirect($checkoutUrl);
}
```

### Get Product Details

```php
$product = Creem::getProduct('prod_12345');
$allProducts = Creem::getProducts();
```

### Search Products

You can also search for products with detailed query parameters:

```php
$products = Creem::searchProducts([
    'limit' => 10,
    'page' => 1,
    // other filters supported by CREEM API
]);
```

### Customer Management

```php
// Get a customer
$customer = Creem::getCustomer('cus_123');

// List customers
$customers = Creem::listCustomers([
    'page_size' => 10,
    'page_number' => 1,
]);

// Generate Billing Portal Link
$response = Creem::createPortalLink([
    'customer_id' => 'cus_123',
]);

return redirect($response->json('customer_portal_link'));
```

### Subscription Management

```php
// Retrieve a subscription
$subscription = Creem::getSubscription('sub_123');

// Cancel a subscription
Creem::cancelSubscription('sub_123');

// Pause a subscription
Creem::pauseSubscription('sub_123');

// Update a subscription (e.g., change quantity)
Creem::updateSubscription('sub_123', [
    'items' => [
        ['id' => 'item_123', 'units' => 5]
    ]
]);

// Upgrade a subscription
Creem::upgradeSubscription('sub_123', [
    'product_id' => 'prod_premium',
    'update_behavior' => 'proration-charge-immediately',
]);
```

### Licenses

Manage software licenses directly from your application:

```php
// Validate a license key
$license = Creem::validateLicense('ABC-123-XYZ', 'instance_unique_id');

if ($license->json('status') === 'active') {
    // Grant access
}

// Activate a license
Creem::activateLicense('ABC-123-XYZ', 'My Macbook Pro');

// Deactivate a license
Creem::deactivateLicense('ABC-123-XYZ', 'instance_unique_id');
```

### Transactions

```php
// Get a transaction
$transaction = Creem::getTransaction('txn_123');

// List transactions
$transactions = Creem::listTransactions([
    'customer_id' => 'cus_123',
    'status' => 'succeeded',
]);
```

### Discounts & Coupons

```php
// Retrieve a discount by ID or Code
$discount = Creem::getDiscount('SAVE10');

// Create a discount
Creem::createDiscount([
    'name' => 'Black Friday',
    'code' => 'BF2024',
    'type' => 'percentage',
    'percentage' => 20,
    'duration' => 'once',
    'applies_to_products' => ['prod_123'],
]);

// Delete a discount
Creem::deleteDiscount('disc_123');
```

### Webhooks

To handle webhooks, you can use the built-in controller or define your own route using the provided middleware.

#### Built-in Route (Optional)

Add this to your `routes/api.php`:

```php
Route::post('/creem/webhook', \Creem\CreemLaravel\Http\Controllers\WebhookController::class)
    ->middleware(\Creem\CreemLaravel\Http\Middleware\VerifyWebhookSignature::class);
```

#### Events

The package dispatches events when a webhook is received:

- `Creem\CreemLaravel\Events\WebhookReceived`
- `Creem\CreemLaravel\Events\CheckoutSucceeded`
- `Creem\CreemLaravel\Events\SubscriptionUpdated`

You can listen to these events in your `EventServiceProvider`:

```php
protected $listen = [
    \Creem\CreemLaravel\Events\CheckoutSucceeded::class => [
        \App\Listeners\HandleSuccessfulPayment::class,
    ],
];
```

#### Example Listener

Here is how you might implement a listener to handle a successful checkout:

```php
namespace App\Listeners;

use Creem\CreemLaravel\Events\CheckoutSucceeded;
use Illuminate\Support\Facades\Log;

class HandleSuccessfulPayment
{
    public function handle(CheckoutSucceeded $event): void
    {
        $payload = $event->payload;
        $customerId = $payload['customer_id'] ?? null;

        Log::info("Payment received for customer: {$customerId}");

        // Grant access, update database, email user, etc.
    }
}
```

## Commands

### Set Webhook Secret

Generates or sets the `CREEM_WEBHOOK_SECRET` in your `.env` file.

```bash
php artisan creem:webhook-secret
```

### Sync/List Products

Fetches and displays all products from your CREEM dashboard.

```bash
php artisan creem:sync-products
```

## Demo Application

A fully functional demo application is included in the `demo/` directory, showcasing:

- **Pricing Page**: Displays products dynamically fetched from CREEM API
- **Checkout Flow**: Complete payment integration with CREEM
- **Customer Portal**: Subscription management interface
- **Webhook Handling**: Real-time event processing

### Running the Demo Locally

```bash
cd demo
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

Visit `http://127.0.0.1:8000` to see the demo in action.

### Deploy Demo for Free

The demo can be deployed to **Render.com** completely free! See [demo/DEPLOYMENT.md](demo/DEPLOYMENT.md) for step-by-step instructions.

**Live Demo**: [Coming Soon]

## Testing

```bash
composer test
```

## Security

If you discover any security related issues, please email devmohy@gmail.com instead of using the issue tracker.

## Credits

- [Mohammed Yayah](https://github.com/devmohy)
- [CREEM](https://github.com/creem)


## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Community

- [Issue Tracker](https://github.com/devmohy/creem-laravel-package/issues)
- [Pull Requests](https://github.com/devmohy/creem-laravel-package/pulls)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
