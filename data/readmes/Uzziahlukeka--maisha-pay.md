# This is a laravel way to interact with maishapay.com

[![Latest Version on Packagist](https://img.shields.io/packagist/v/uzhlaravel/maishapay.svg?style=flat-square)](https://packagist.org/packages/uzhlaravel/maishapay)
![GitHub Tests Action Status](https://github.com/uzziahlukeka/maisha-pay/actions/workflows/run-tests.yml/badge.svg)
![GitHub Code Style Action Status](https://github.com/uzziahlukeka/maisha-pay/actions/workflows/fix-php-code-style-issues.yml/badge.svg)
[![Total Downloads](https://img.shields.io/packagist/dt/uzhlaravel/maishapay.svg?style=flat-square)](https://packagist.org/packages/uzhlaravel/maishapay)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE.md)

## Installation

You can install the package via composer:

```bash
composer require uzhlaravel/maishapay
```

- if you want to have a live account, you need to register at https://www.maishapay.net/ or https://marchand.maishapay.online/dashboard
- if you want to have a sandbox account, you need to register at https://www.maishapay.net/ or https://marchand.maishapay.online/dashboard
- you need to get your public and secret keys from the dashboard
- you can set the gateway mode to 0 for sandbox and 1 for live

### automated installation 

```bash

php artisan maishapay:install

```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="maishapay-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="maishapay-config"
```

This is the contents of the published config file:

```php
return [

    'public_key' => env('MAISHAPAY_PUBLIC_KEY'),
    'secret_key' => env('MAISHAPAY_SECRET_KEY'),
    'gateway_mode' => env('MAISHAPAY_GATEWAY_MODE', 0),
    'base_url' => env('MAISHAPAY_BASE_URL', 'https://marchand.maishapay.online/api/collect'),
    'b2c_base_url' => env('MAISHAPAY_B2C_BASE_URL', 'https://marchand.maishapay.online/api/b2c'),
    'callback_url' => env('MAISHAPAY_CALLBACK_URL'),

];
```

Add these to your `.env` file:

```env
MAISHAPAY_PUBLIC_KEY=your-public-key
MAISHAPAY_SECRET_KEY=your-secret-key
MAISHAPAY_GATEWAY_MODE=0
MAISHAPAY_CALLBACK_URL=https://yourapp.com/maishapay/callback
# Optional: only needed if the B2C base URL changes
# MAISHAPAY_B2C_BASE_URL=https://marchand.maishapay.online/api/b2c
```


## Usage Mobile Money Payment

```php

use Uzhlaravel\Maishapay\Maishapay;
use Uzhlaravel\Maishapay\Models\MaishapayTransaction;
use Uzhlaravel\Maishapay\DataTransferObjects\MobileMoney;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;

// you can use it as a parameter to a controller method

  protected $maishapay;

    public function __construct(Maishapay $maishapay)
    {
        $this->maishapay = $maishapay;
    }
    
    // for MOBILEMONEY payment type
      
    // validating the request data
    $validatedData = $request->validate([
            'amount' => 'required|numeric',
            'currency' => 'required|string',
            'customerFullName' => 'required|string',
            'customerEmailAddress' => 'required|email',
            'provider' => 'required|string',
            'walletID' => 'required',
            'channel' => 'required|string',
        ]);
        
    //if you want to keep track of the transaction
     $transaction = MaishapayTransaction::create([
                'payment_type' => 'MOBILEMONEY',
                'provider' => $validatedData['provider'],
                'amount' => $validatedData['amount'],
                'currency' => $validatedData['currency'],
                'customer_full_name' => $validatedData['customerFullName'],
                'customer_email' => $validatedData['customerEmailAddress'],
                'wallet_id' => $validatedData['walletID'],
                'channel' => $validatedData['channel'],
                'transaction_reference'=> 'TXN_' . uniqid(),
                'status' => 'PENDING'
            ]);
            
     //then do the transactin
     $mobileMoney = new MobileMoney(
                amount: $validatedData['amount'],
                currency: $validatedData['currency'],
                customerFullName: $validatedData['customerFullName'],
                customerEmailAddress: $validatedData['customerEmailAddress'],
                provider: $validatedData['provider'],
                walletId: $validatedData['walletID'],
                transactionReference: $transaction->transaction_reference,
                callbackUrl: route('pricing')
            );

            // Process mobile money payment
            $response = $this->maishapay->processMobileMoneyPayment($mobileMoney);

            // Parse the response
            $responseData = $response->json();
            
            
        // or you can use implemetation directly in your controller method
                   
            $maishapay = new Uzhlaravel\Maishapay\Maishapay();
        
             $response = $this->maishapay->processMobileMoneyPayment($mobileMoney);
             
             ...(other code)

```

### Automate the database

```php

use Uzhlaravel\Maishapay\EnhancedMaishapayService;
use Uzhlaravel\Maishapay\Models\MaishapayTransaction;
use Uzhlaravel\Maishapay\DataTransferObjects\MobileMoney;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;

// you can use it as a parameter to a controller method

  protected $maishapay;

    public function __construct(
    private EnhancedMaishapayService $enhancedMaishapayService,
    )
    {
    
    }
    
      
    // validating the request data
    $validatedData = $request->validate([
            'amount' => 'required|numeric',
            'currency' => 'required|string',
            'customerFullName' => 'required|string',
            'customerEmailAddress' => 'required|email',
            'provider' => 'required|string',
            'walletID' => 'required',
            'channel' => 'required|string',
        ]);
        
            
     //then do the transactin
     $mobileMoney = new MobileMoney(
                amount: $validatedData['amount'],
                currency: $validatedData['currency'],
                customerFullName: $validatedData['customerFullName'],
                customerEmailAddress: $validatedData['customerEmailAddress'],
                provider: $validatedData['provider'],
                walletId: $validatedData['walletID'],
                transactionReference: $transaction->transaction_reference,
                callbackUrl: route('pricing')
            );

            // Process mobile money payment
            $response = $this->enhancedMaishapayService->processMobileMoneyPaymentWithLogging($mobileMoney);

            // Parse the response
            $responseData = $response->json();
            
            
        // or you can use implemetation directly in your controller method
                   
            $maishapay = new Uzhlaravel\Maishapay\Maishapay();
        
             $response = $this->maishapay->processMobileMoneyPayment($mobileMoney);
             
             ...(other code)

```

## Usage Bank Payment 

```php

//importing the class

use Uzhlaravel\Maishapay\Maishapay;
use Uzhlaravel\Maishapay\Models\MaishapayTransaction;
use Uzhlaravel\Maishapay\DataTransferObjects\MobileMoney;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;

// you can use it as a parameter to a controller method

// for BANK payment type V2

// validating the request data
$validatedData = $request->validate([
            'amount' => 'required|numeric',
            'currency' => 'required|string',
            'customerFullName' => 'required|string',
            'customerEmailAddress' => 'required|email',
            'provider' => 'required|string',
            'walletID' => 'required',
            'channel' => 'required|string',
        ]);
        
//  if you want to keep track
$transaction = MaishapayTransaction::query()->create([
                'payment_type' => 'CARD',
                'provider' => $validatedData['provider'], //visa or mastercard
                'amount' => $validatedData['amount'],
                'currency' => $validatedData['currency'],
                'customer_full_name' => $validatedData['customerFullName'],
                'customer_phone' => $validatedData['customerPhoneNumber'],
                'customer_email' => $validatedData['customerEmailAddress'],
                'channel' =>  $validatedData['channel'],
                'transaction_reference'=> 'TXN_' . uniqid(),
                'status' => 'PENDING'
            ]);

            $cardPayment = new CardPayment(
                amount: $validatedData['amount'],
                currency: $validatedData['currency'],
                customerEmailAddress: $validatedData['customerEmailAddress'],
                customerPhoneNumber: $validatedData['customerPhoneNumber'],
                provider: $validatedData['provider'],
                customerFullName: $validatedData['customerFullName'],
                transactionReference: $transaction->transaction_reference,
                callbackUrl: route('your-callback-route') // if different from the one in your .env file
            );

            $response = $this->maishapay->processCardPayment($cardPayment);

            $responseData = $response->json();        
            
            //make sure to redirect to the payment page : 
            
             return redirect($responseData['paymentPage']);
        (other code)

```

## Automate the database transactions : 

```php

//importing the class

use Uzhlaravel\Maishapay\Services\EnhancedMaishapayService ;
use Uzhlaravel\Maishapay\DataTransferObjects\CardPayment;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;


 private EnhancedMaishapayService $enhancedMaishapayService;

 $cardPayment = new CardPayment(
                amount: $validatedData['amount'],
                currency: $validatedData['currency'],
                customerEmailAddress: $validatedData['customerEmailAddress'],
                customerPhoneNumber: $validatedData['customerPhoneNumber'],
                provider: $validatedData['provider'],
                customerFullName: $validatedData['customerFullName'],
                transactionReference: $transaction->transaction_reference,
                callbackUrl: route('your-callback-route') // if different from the one in your .env file
            );
            
            $response = $this->enhancedMaishapayService->processCardPaymentWithLogging($cardPayment,true);

            $responseData = $response->json();        
            
            //make sure to redirect to the payment page : 

```

## Usage B2C (Business to Customer) Payment

B2C allows your business to send money directly to a customer's mobile money wallet — useful for payouts, refunds, salaries, or commissions.

```php
use Uzhlaravel\Maishapay\Maishapay;
use Uzhlaravel\Maishapay\DataTransferObjects\BusinessToCustomer;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;

// Inject via constructor or resolve from container
public function __construct(Maishapay $maishapay)
{
    $this->maishapay = $maishapay;
}

// Validate request
$validatedData = $request->validate([
    'amount'                => 'required|numeric',
    'currency'              => 'required|string',
    'customer_full_name'    => 'required|string',
    'customer_email'        => 'required|email',
    'provider'              => 'required|string',   // AIRTEL, ORANGE, MTN, VODACOM
    'wallet_id'             => 'required|string',   // recipient phone / wallet number
    'motif'                 => 'required|string',   // reason for the transfer
]);

$b2c = new BusinessToCustomer(
    amount:               $validatedData['amount'],
    currency:             $validatedData['currency'],
    customerFullName:     $validatedData['customer_full_name'],
    customerEmailAddress: $validatedData['customer_email'],
    provider:             $validatedData['provider'],
    walletId:             $validatedData['wallet_id'],
    motif:                $validatedData['motif'],
    callbackUrl:          route('your-callback-route') // optional
);

try {
    $response = $this->maishapay->processB2CPayment($b2c);
    $responseData = $response->json();
    // handle success
} catch (MaishapayException $e) {
    // handle error
}
```

### B2C with automatic database logging

```php
use Uzhlaravel\Maishapay\Services\EnhancedMaishapayService;
use Uzhlaravel\Maishapay\DataTransferObjects\BusinessToCustomer;
use Uzhlaravel\Maishapay\Exceptions\MaishapayException;

public function __construct(private EnhancedMaishapayService $enhancedMaishapayService)
{
}

$b2c = new BusinessToCustomer(
    amount:               '5000',
    currency:             'CDF',
    customerFullName:     'Jane Doe',
    customerEmailAddress: 'jane@example.com',
    provider:             'AIRTEL',
    walletId:             '0999000000',
    motif:                'Monthly commission payout',
);

$result = $this->enhancedMaishapayService->processB2CPaymentWithLogging($b2c);

if ($result['success']) {
    $transaction = $result['transaction']; // MaishapayTransaction model
    $apiResponse  = $result['response'];
} else {
    $error = $result['error'];
}
```

### B2C using the static create() helper

```php
$b2c = BusinessToCustomer::create([
    'amount'                => '5000',
    'currency'              => 'CDF',
    'customer_full_name'    => 'Jane Doe',
    'customer_email_address'=> 'jane@example.com',
    'provider'              => 'MTN',
    'wallet_id'             => '0810000000',
    'motif'                 => 'Refund for order #1234',
    'callback_url'          => 'https://yourapp.com/maishapay/callback', // optional
]);

$response = $this->maishapay->processB2CPayment($b2c);
```

### B2C database migration

Run the additional migration to support B2C transactions:

```bash
php artisan vendor:publish --tag="maishapay-migrations"
php artisan migrate
```

This adds:
- A `motif` column to `maishapay_transactions`
- `B2C` as a valid `payment_type` enum value

### Querying B2C transactions

```php
use Uzhlaravel\Maishapay\Models\MaishapayTransaction;

// All B2C transactions
$b2cTransactions = MaishapayTransaction::b2c()->get();

// B2C stats via EnhancedMaishapayService
$stats = $this->enhancedMaishapayService->getTransactionStats();
// $stats['b2c'] => total B2C transaction count
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [uzziahlukeka](https://github.com/uzhlaravel)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
