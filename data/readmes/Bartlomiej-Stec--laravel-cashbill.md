
# Cashbill payment system for Laravel

Package for easily integrating Cashbill payments with Laravel.

## Compatibility

This package supports **Laravel 10, 11, 12, and 13**.

## Support
If this package is helpful for you, you can support my work on Ko-fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S6PH8KM)


## Installation

1. Install composer package using command:

```bash
  composer require barstec/laravel-cashbill
```

2. Publish configuration files to your project

```bash
  php artisan vendor:publish --provider="Barstec\Cashbill\CashbillServiceProvider"
```

4. Run migrations


```bash
  php artisan migrate 
```
## Setup
Firstly you need to move environmental variables from .env.example to .env:

```bash
CASHBILL_MODE=dev
CASHBILL_SHOP_ID=
CASHBILL_SECRET_KEY=
```
If you are in testing mode, set CASHBILL_MODE to **dev**. When in production, switch it to **prod**. Retrieve the remaining variables from the CashBill shop settings.

In the configuration file, you can define return routes, default values, the database table name, and the columns for collecting personal data. After modifying columns, rerun the migration process.

Ensure that you specify the same notification route as in the CashBill shop settings. This URL is used to verify transactions and is set by default to /api/cashbill/notification

## Usage/Examples

To initiate a transaction, create a **Payload** object in your controller and assign values. To link your item to the transaction use **additionalData** field. Then, create a **Payment** object, pass the **Payload**, and call **redirect()**. This action will start the transaction and redirect the user to the Cashbill payment page. You can also create a **PersonalData** object. The *first name*, *surname*, and *email address* will be automatically filled on the Cashbill page. 

```php
<?php

namespace App\Http\Controllers;

use Barstec\Cashbill\Payload;
use Barstec\Cashbill\Payment;
use Barstec\Cashbill\PersonalData;

class CashbillExample extends Controller
{
    public function handle()
    {
        $payload = new Payload();
        $payload->setTitle("Example title");
        $payload->setAmount(9.5);
        $payload->setAdditionalData($productId); //Use this field to link transaction to the item

        $personalData = new PersonalData();
        $personalData->setEmail("email@example.com");
        $personalData->setFirstName("Name");
        $personalData->setSurname("Surname");
        $payload->setPersonalData($personalData);

        $payment = new Payment($payload);
        return $payment->redirect();
    }
}
```
Upon transaction creation, the **TransactionCreated** event is triggered. You can use it to retrieve the payload and order ID to associate the transaction with a specific user. To achieve this, create a listener and register it in your **EventServiceProvider**.
```php
protected $listen = [
    TransactionCreated::class => [
        ExampleListener::class
    ]
];

```

By default, all transaction status changes are handled by the package. The **TransactionSuccessfullyCompleted** event is triggered after receiving a *PositiveFinish* signal from Cashbill. Otherwise, for status changes, the **TransactionStatusChanged** event is triggered.

If you prefer to update order data manually, you can create an **Order** object by passing a specific order ID to the constructor and then calling the **update()** method, which returns a **PaymentDetails** object.
```php
$order = new Order($orderId);
$paymentDetails = $order->update();
```

## Author

[Bartłomiej Stec ](https://github.com/Bartlomiej-Stec)


## License
This package is distributed under the
[MIT](https://choosealicense.com/licenses/mit/)
license
