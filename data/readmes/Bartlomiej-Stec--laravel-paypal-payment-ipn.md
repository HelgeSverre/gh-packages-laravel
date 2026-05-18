
# Paypal pay now buttons with IPN verification for Laravel
This package facilitates seamless integration of PayPal payments via pay now buttons and IPN verification within Laravel. It's specifically designed for sellers without a PayPal business account, eliminating the need for access to the live API version.


## Support
If this package is helpful for you, you can support my work on Ko-fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S6PH8KM)


## Installation

1. Install composer package using command:

```bash
composer require barstec/laravel-paypal-payment-ipn
```

2. Publish configuration files to your project

```bash
php artisan vendor:publish --provider="Barstec\Paypal\PaypalServiceProvider"
```

4. Run migrations


```bash
php artisan migrate 
```
## Setup
Firstly you need to move environmental variables from .env.example to .env:

```bash
PAYPAL_MODE=dev
PAYPAL_EMAIL=
```
If you are in testing mode, set PAYPAL_MODE to **dev**. When in production, switch it to **prod**.

PAYPAL_EMAIL is the email address of the PayPal account where payments will be sent.

In the configuration file, you can define return routes, default values, the database table name, and the columns to be collected. After modifying columns, rerun the migration process.

Ensure that you specify the same notification route as in the PayPal IPN settings. This URL is used to verify transactions and is set by default to /api/paypal/notification.

**Important!** You should set your PayPal IPN settings to use encoding UTF-8. Otherwise, there is no guarantee that certain characters will be recognized correctly. You can set it up here: https://www.paypal.com/cgi-bin/customerprofileweb?cmd=_profile-language-encoding

## Usage/Examples

To initiate a transaction, create a **Payload** object in your controller and assign values. Then, create a **Payment** object, pass the **Payload**, and call **redirect()**. This action will start the transaction and redirect the user to the Paypal payment page. By default **Payload** object is configured to handle single-item payment without delivery or additional costs. You can modify it using predefined methods or by adding any fields you want using **setParams**.

```php
<?php

namespace App\Http\Controllers;

use Barstec\Paypal\Payload;
use Barstec\Paypal\Payment;

class PaypalController extends Controller
{
    public function paypalTest(){
        $payload = new Payload();
        $payload->setBusinessEmail("youremail@example.com");
        $payload->setItemName("Testowe");
        $payload->setAmount(1);
        $payment = new Payment($payload);
        return $payment->redirect();
    }
}

```
Upon transaction creation, the **PaypalTransactionCreated** event is triggered. You can use it to retrieve the payload and transaction ID to associate the transaction with a specific user. To achieve this, create a listener and register it in your **EventServiceProvider**.
```php
protected $listen = [
    PaypalTransactionCreated::class => [
        ExampleListener::class
    ]
];

```

By default, all transaction status changes are handled by the package. The **PaypalPaymentCompleted** event is triggered after receiving a *Completed* signal from Paypal. Otherwise, for status changes, the **PaypalPaymentStatusChanged** event is triggered. 

## Author

[Bartłomiej Stec ](https://github.com/Bartlomiej-Stec)


## License
This package is distributed under the
[MIT](https://choosealicense.com/licenses/mit/)
license