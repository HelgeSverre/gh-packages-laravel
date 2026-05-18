# Laravel Payment Gateway for Ecash (Syria)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/alhelwany/laravel-ecash.svg?style=flat-square)](https://packagist.org/packages/alhelwany/laravel-ecash)
[![Total Downloads](https://img.shields.io/packagist/dt/alhelwany/laravel-ecash.svg?style=flat-square)](https://packagist.org/packages/alhelwany/laravel-ecash)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mhdghaithalhelwany/laravel-ecash/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mhdghaithalhelwany/laravel-ecash/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mhdghaithalhelwany/laravel-ecash/phpstan.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/MhdGhaithAlhelwany/laravel-ecash/actions/workflows/phpstan.yml?query=workflow%3Aphpstan+branch%3Amain)

Simplify the integration of Ecash payments into your Laravel applications. This package offers a streamlined setup and intuitive API to process payments quickly and securely. 


## Installation

You can install the package via composer:

```bash
composer require alhelwany/laravel-ecash
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-ecash-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-ecash-config"
```

This is the contents of the published config file:

```php
return [
    'gatewayUrl' => env('ECASH_GATEWAY_URL', 'https://checkout.ecash-pay.co'),
    'terminalKey' => env('ECASH_TERMINAL_KEY', null),
    'merchantId' => env('ECASH_MERCHANT_ID', null),
    'merchantSecret' => env('ECASH_MERCHANT_SECRET', null),
];
```
## Getting Started
1. Setup your environment variables
2. Publish and run the migrations
3. To start the payment process, use the checkout method to create a payment model & generate the payment URL
4. Once the payment is complete, and the gateway redirects the user to the redirect URL, the payment status changes from PENDING to PROCESSING
5. Once the gateway calls the callback URL, the payment status Changes from PROCESSING to either FAILED or PAID
6. On each payment status change, a PaymentStatusUpdated event is fired, you may configure a listener to update the status of your order


## Enums
### Enums are in the namespace "Alhelwany\LaravelEcash\Enums"
```php
enum Lang: string
{
    case AR = 'AR';
    case EN = 'EN';
}
```
```php
enum Currency: string
{
    case SYP = 'SYP'; // The only available currency by the gateway so far 
}
```
```php
enum CheckoutType: string
{
    case QR = 'QR';
    case CARD = 'Card';
}
```
```php
enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case PAID = 'paid';
    case FAILED = 'failed';
}
```

## Exceptions
### InvalidAmountException
Thrown when the checkout function is called with negative or 0 amount. 

### InvalidConfigurationException
Thrown when trying to use the package before setting up the .env variables




## Events
### PaymentStatusUpdated
```php
namespace Alhelwany\LaravelEcash\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Alhelwany\LaravelEcash\Models\EcashPayment;

class PaymentStatusUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(private EcashPayment $paymentModel)
    {
    }

    public function getPaymentModel(): EcashPayment
    {
        return $this->paymentModel;
    }
}
```


## Important Note

``` 
The EcashPayment Model uses id of type UUID as a primary key
```


## Example Usage
### Checkout


```php
use App\Http\Controllers\Controller;

use Alhelwany\LaravelEcash\Facades\LaravelEcashClient;
use Alhelwany\LaravelEcash\DataObjects\PaymentDataObject;
use Alhelwany\LaravelEcash\Models\EcashPayment;
use Alhelwany\LaravelEcash\Enums\CheckoutType;
use Alhelwany\LaravelEcash\Enums\Lang;
use Alhelwany\LaravelEcash\Enums\Currency;

class ExampleController extends Controller
{
    public function checkout($request)
    {
        $paymentDataObject = new PaymentDataObject(CheckoutType::CARD, 100.10);

        $paymentDataObject->setRedirectUrl(route('payment-successful')); //optional
        $paymentDataObject->setLang(Lang::EN); //optional
        $paymentDataObject->setCurrency(Currency::SYP); //optional

        $model = LaravelEcashClient::checkout($paymentDataObject);

        // You may attach the EcashPayment model to your order
        return redirect($model['checkout_url']);
    }
}
```

## Testing

```bash
composer test
```

## Credits

- [Mhd Ghaith Alhelwany](https://github.com/MhdGhaithAlhelwany)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
