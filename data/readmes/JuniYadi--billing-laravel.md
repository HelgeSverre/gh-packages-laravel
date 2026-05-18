# Billing Laravel

Laravel integration for Billing Core. Provides Eloquent models, facades, service providers, and database migrations for seamless Laravel billing integration.

## Features

- **Laravel Facade** - Simple, expressive API via `Billing` facade
- **Eloquent Models** - Full ORM integration for all billing entities
- **Database Migrations** - Ready-to-use migrations for billing tables
- **ConfigResolver** - Flexible configuration (env or database-based)
- **Service Provider** - Auto-registration and configuration publishing
- **Webhook Routes** - Built-in webhook handling routes
- **Morph Relations** - Connect billing to any Eloquent model

## Requirements

- PHP 8.2 or higher
- Laravel 12.x

## Installation

Install via Composer:

```bash
composer require juniyadi/billing-laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=billing-config
```

Run migrations:

```bash
php artisan migrate
```

## Quick Start (Laravel)

```php
use Billing\Laravel\Facades\Billing;
use App\Models\User;

// Create a customer for a user
$user = User::find(1);
$customer = Billing::customer()->createForOwner($user, [
    'email' => $user->email,
    'name' => $user->name,
]);

// Create a one-time payment
$payment = Billing::payment()->charge([
    'amount' => 4999,
    'currency' => 'USD',
    'customer_id' => $customer->id,
]);

// Create a subscription
$subscription = Billing::subscription()->create([
    'customer_id' => $customer->id,
    'price_id' => 'premium_monthly',
    'amount' => 1999,
    'currency' => 'USD',
    'interval' => 'month',
    'trial_days' => 14,
]);
```

## Using with Eloquent Models

The package includes Eloquent models for all billing entities:

```php
use Billing\Laravel\Models\Customer;
use Billing\Laravel\Models\Payment;
use Billing\Laravel\Models\Subscription;

// Find customer with relations
$customer = Customer::with(['subscriptions', 'payments', 'paymentMethods'])
    ->where('owner_type', User::class)
    ->where('owner_id', $userId)
    ->first();

// Access customer's subscriptions
foreach ($customer->subscriptions as $subscription) {
    echo $subscription->planName . ': ' . $subscription->status;
}

// Query payments by status
$pendingPayments = Payment::where('status', 'pending')->get();
```

## MorphTo Relationship

Connect billing entities to any of your Eloquent models:

```php
use App\Models\User;
use Billing\Laravel\Facades\Billing;

$user = User::find(1);

// Customer is automatically linked to the user
$customer = $user->billingCustomer()->create([
    'email' => $user->email,
    'name' => $user->name,
]);

// Access customer through the relationship
echo $user->billingCustomer->email;
```

## Configuration

The package supports two configuration modes:

### Environment-Based (Default)

Set gateways in your `.env` file:

```env
BILLING_DEFAULT_GATEWAY=manual
MANUAL_API_KEY=your_api_key
MANUAL_WEBHOOK_SECRET=your_webhook_secret
```

### Database-Based

Enable dynamic configuration from the database:

```php
// config/billing.php
'use_database_config' => true,
```

Then configure gateways through the `billing_gateways` table.

## Package Structure

```
src/
├── BillingServiceProvider.php    # Service provider
├── Facades/
│   └── Billing.php               # Laravel Facade
├── Models/
│   ├── Customer.php              # Customer Eloquent model
│   ├── Payment.php               # Payment Eloquent model
│   ├── Subscription.php          # Subscription Eloquent model
│   ├── PaymentMethod.php         # PaymentMethod Eloquent model
│   ├── Gateway.php               # Gateway Eloquent model
│   ├── GatewayCredential.php     # GatewayCredential Eloquent model
│   └── GatewayLog.php            # GatewayLog Eloquent model
└── Support/
    └── ConfigResolver.php        # Configuration resolver

config/
└── billing.php                   # Configuration file

database/
├── migrations/                   # Database migrations
└── seeders/                      # Database seeders
```

## Documentation

- [Configuration](docs/configuration.md) - Setup and configuration options
- [Customer Management](docs/customers.md) - Working with customer models
- [Payments](docs/payments.md) - Processing payments
- [Subscriptions](docs/subscriptions.md) - Managing subscriptions
- [Gateways](docs/gateways.md) - Gateway configuration
- [Webhooks](docs/webhooks.md) - Webhook handling
- [Eloquent Models](docs/models.md) - Model reference

## Available Gateways

The package includes support for multiple payment gateways:

- **Manual** - Bank transfer payments (included)
- **Stripe** - Credit card payments (configuration included)
- **Xendit** - Southeast Asian payments (configuration included)
- **Midtrans** - Indonesian payments (configuration included)

## License

MIT License
