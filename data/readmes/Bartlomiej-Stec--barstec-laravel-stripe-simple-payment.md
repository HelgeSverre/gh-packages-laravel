
# Stripe simple one-time checkout for Laravel
This package is designed for seamless integration of simple Stripe payments with Laravel. It enables only one-time payments for a single item. The package encompasses table creation, payment generation using the Stripe API and PHP library, and payment verification.


## Support
If this package is helpful for you, you can support my work on Ko-fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S6PH8KM)


## Installation

1. Install composer package using command:

```bash
composer require barstec/laravel-stripe-simple-payment
```

2. Publish configuration files to your project

```bash
php artisan vendor:publish --provider="Barstec\Stripe\StripeServiceProvider"
```

4. Run migrations


```bash
php artisan migrate 
```
## Setup
Firstly you need to move environmental variables from .env.example to .env:

```bash
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
```
To enable testing mode, simply copy and paste the values from the Stripe testing environment above.

In the configuration file, you can define return routes, default values, the database table name, and the columns to be collected. After modifying columns, rerun the migration process.

In Stripe settings create webhook with endpoint matching notification_route from config and choose events: checkout.session.expired, checkout.session.completed

## Usage/Examples

To initiate a transaction, create a **Payload** object in your controller and assign values. Then, create a **Payment** object, pass the **Payload**, and call **redirect()**. This action will start the transaction and redirect the user to the Stripe payment page. By default **Payload** object is configured to handle single-item payment without delivery or additional costs. You can modify it using predefined methods. If you want to add value that is not available in **Payload** class, you can use **addAdditionalParam** method to pass it manually. 

```php
<?php

namespace App\Http\Controllers;

use Barstec\Stripe\Payload;
use Barstec\Stripe\Payment;

class StripeTestController extends Controller
{
    public function test()
    {
        $payload = new Payload();
        $payload->setAmount(1.29);
        $payload->setName("test");
        $payload->setCustomerEmail("email@example.com");
        $payload->setReturnUrl('http://127.0.0.1:8000');
        $payload->addAdditionalParam('phone_number_collection.enabled', true);
        $payment = new Payment($payload);
        return $payment->redirect();
    }
}


```
Upon transaction creation, the **StripeTransactionCreated** event is triggered. You can use it to retrieve the payload, transaction ID and session to associate the transaction with a specific user. To achieve this, create a listener and register it in your **EventServiceProvider**.
```php
protected $listen = [
    StripeTransactionCreated::class => [
        ExampleListener::class
    ]
];

```

By default, all transaction status changes are handled by the package. The **StripePaymentCompleted** event is triggered after receiving a *completed* signal from Stripe. For session expiration signal, the **StripeSessionExpired** event is triggered. 

## Author

[Bartłomiej Stec ](https://github.com/Bartlomiej-Stec)


## License
This package is distributed under the
[MIT](https://choosealicense.com/licenses/mit/)
license