# Tumeny Pay

[![Latest Version on Packagist](https://img.shields.io/packagist/v/shengamo/tumeny-pay.svg?style=flat-square)](https://packagist.org/packages/shengamo/tumeny-pay)
[![Total Downloads](https://img.shields.io/packagist/dt/shengamo/tumeny-pay.svg?style=flat-square)](https://packagist.org/packages/shengamo/tumeny-pay)

# A Laravel Package for integrating with Tumeny Pay.

This Laravel package integrates Tumeny Pay as a payment gateway into your Laravel application.

## Version Compatibility

| Laravel Version | Package Version |
|-----------------|-----------------|
| Laravel 11.x +  | 2.x             |
| Laravel 10.x    | 1.x             |
| Laravel 9.x     | 1.x             |

> **Important:** For Laravel 11 applications, you must use version 2.0 or above of this package due to changes in Laravel's caching implementation. For Laravel 10 and below, use version 1.x.

To install a specific version:
```bash
# For Laravel 11+
composer require shengamo/tumeny-pay:^2.0

# For Laravel 10 and below
composer require shengamo/tumeny-pay:^1.0
```

## Installation

1. Install the package via Composer:

    ```bash
    composer require shengamo/tumeny-pay
    ```

2. Publish the package migrations:

    ```bash
    php artisan vendor:publish --tag=Shengamo\TumenyPay\TumenyPayServiceProvider
    ```
   The package creates migrations for the shengamo_orders, shengamo_order_statuses and also the team_subscriptions (if
   it does not already exist). The statuses that are create are:

    - Pending - status 1
    - Success - status 2
    - Failed - status 3


3. Add the following environment variables to your `.env` file:

    ```env
    TUMENY_KEY=your_tumeny_key
    TUMENY_SECRET=your_tumeny_secret
    TUMENY_BASE_URL=https://tumeny.herokuapp.com/api/
    ```

*You can find your key and secret from your tumeny account. You need an active account an access to the API Key in order
to use this package.*

## Usage

### Payment Request

You can initiate a payment request using the `processPayment` method provided by the TumenyPay class.

```php
use Shengamo\TumenyPay\TumenyPay;

$tumeny = new TumenyPay();
$tumeny->processPayment('amount', 'plan name or default', 'Zambian mobile number', 'quantity of items', 'description');

// e.g. request a payment of K100 from the mobile number 0961234567.
$tumeny->processPayment(100, 'default', '0961234567', 1, 'custom description');
```

### Setup the verification of payments

To automatically verify pending order payments, add the following line to the schedule function in your
App\Console\Kernel.php file:

```php
use Shengamo\TumenyPay\Jobs\VerifyPendingOrderPayments;

$schedule->job(new VerifyPendingOrderPayments())->everyMinute();

```

The schedule will check the `shengamo_orders` table for all orders with a status of `pending (1)` and send a request to
the Tumeny API every minute. If there are no pending transactions, no request will be sent to the Tumeny API.

### Events & Listeners

Events are fired when ShengamoOrder is generated and also when the ShengamoOrder has been updated. You could register
these events in the EventServiceProvider.
If you would like to handle an action, for example, if you would like to add a subscription if the order is successful,
you could create an event listener that listens to the ShengamoOrderCreated Event.

For example, after creating a AddSubscriptionListener Listener class, the code below would handle subscription if order
is successful.

```php
class AddSubscriptionListener
{
    public function __construct()
    {
        //
    }

    public function handle(ShengamoOrderUpdated $event): void
    {;
        //If the order status is successful or 2
        if($event->shengamoOrder->status === 2)
        {
         // Add the subscription here
        }
    }
}

```

Add the events and listener in your App\Providers\EventServiceProvider like the example below.

```php
    protected $listen = [
        
        ShengamoOrderUpdated::class => [
            AddSubscriptionListener::class
        ],

    ];
```

### Manually firing the verification

In order to manually verify all the pending transactions in your shengamo_orders table, you can ran the artisan command.

```bash
php artisan tumeny:verify
```

### Testing

```bash
./vendor/bin/phpunit
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email mo@shengamo.com instead of using the issue tracker.

## Credits

- [Mo Malenga](https://github.com/shengamo)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
