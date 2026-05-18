## Laravel Weevo Package by [Akika Digital](https://akika.digital)

The Laravel Weevo package allows you to transfer money through the NCBA Open Banking APIs. The package supports Laravel version 5 and above.

## Installation

You can install the package via composer:

```bash
composer require akika/laravel-weevo
```

After installing the package, publish the configuration file using the following command:

```bash
php artisan weevo:install
```

## ENV Variables

You can add the following variables to your env file. Make sure to add the requested information.

```bash
WEEVO_ENV=
WEEVO_DEBUG=
WEEVO_SANDBOX_URL=
WEEVO_PRODUCTION_URL=
```

## Set Credentials

In case Weevo is initialized with null values, the following function can be called to set the credentials

```php
public function setCredentials($username, $apiKey, $apiSecret);
```

## Delivery Statuses

Below are the available statuses

```php
case Pending = 'pending';
case Assigned = 'assigned';
case Picked = 'picked';
case InTransit = 'in_transit';
case DeliveryInitiated = 'delivery_initiated';
case PaymentRequested = 'payment_requested';
case Delivered = 'delivered';
case Failed = 'failed';
case Cancelled = 'cancelled';
case Returning = 'returning';
case Returned = 'returned';
```
