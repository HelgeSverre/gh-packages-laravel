# Laravel package for payfort

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sevaske/payfort.svg?style=flat-square)](https://packagist.org/packages/sevaske/payfort)
[![Total Downloads](https://img.shields.io/packagist/dt/sevaske/payfort.svg?style=flat-square)](https://packagist.org/packages/sevaske/payfort)

This Laravel plugin lets you work with the Payfort Payment API and manage multiple merchants easily.

# Beta version

**Note**: This version is currently in beta. Use at your own risk.

## Requirements

- PHP 8.1+
- Laravel 10+

## Installation

You can install the package via composer:

```bash
composer require sevaske/payfort
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="payfort-config"
```

This is the contents of the published config file (payfort.php):

```php
return [
    'sandbox_mode' => env('PAYFORT_SANDBOX_MODE', false),
    'debug_mode' => env('PAYFORT_DEBUG_MODE', false),
    'log_channel' => env('PAYFORT_LOG_CHANNEL', env('LOG_CHANNEL', 'stack')),

    /*
    |--------------------------------------------------------------------------
    | Merchant Configuration
    |--------------------------------------------------------------------------
    |
    | This section allows you to configure multiple merchants for your application.
    | Each merchant can have its own unique settings, such as merchant identifier,
    | access code, and SHA phrases for secure transactions. You can easily
    | switch between different merchants using the Payfort::merchant({name}) method.
    | The default merchant is specified under 'default', while additional merchants
    | can be defined by adding their own unique keys.
    |
    */
    'merchants' => [
        'default' => [
            'merchant_identifier' => env('PAYFORT_MERCHANT_IDENTIFIER'),
            'access_code' => env('PAYFORT_ACCESS_CODE'),
            'sha_request_phrase' => env('PAYFORT_SHA_REQUEST_PHRASE'),
            'sha_response_phrase' => env('PAYFORT_SHA_RESPONSE_PHRASE'),
            'sha_type' => env('PAYFORT_SHA_TYPE', 'sha256'),
        ],
        'apple' => [
            'merchant_identifier' => env('PAYFORT_APPLE_MERCHANT_IDENTIFIER'),
            'access_code' => env('PAYFORT_APPLE_ACCESS_CODE'),
            'sha_request_phrase' => env('PAYFORT_APPLE_SHA_REQUEST_PHRASE'),
            'sha_response_phrase' => env('PAYFORT_APPLE_SHA_RESPONSE_PHRASE'),
            'sha_type' => env('PAYFORT_APPLE_SHA_TYPE', 'sha256'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Here you can configure webhooks for your application. These settings
    | define where your server will receive responses from Amazon Payment
    | Services after a transaction is processed, as well as where offline
    | notifications will be received for any status updates regarding
    | transactions and orders. You can also specify the middleware that
    | should be applied to the webhook routes.
    |
    */
    'webhook' => [
        'feedback' => [
            'enabled' => env('PAYFORT_WEBHOOK_FEEDBACK_ENABLED', true),
            'uri' => env('PAYFORT_WEBHOOK_FEEDBACK_URI', '/payfort/webhook/feedback/{merchant?}'),
            'middlewares' => [
                \Sevaske\Payfort\Http\Middlewares\PayfortWebhookSignature::class,
            ],
        ],
        'notification' => [
            'enabled' => env('PAYFORT_WEBHOOK_NOTIFICATION_ENABLED', true),
            'uri' => env('PAYFORT_WEBHOOK_NOTIFICATION_URI', '/payfort/webhook/notification/{merchant?}'),
            'middlewares' => [
                \Sevaske\Payfort\Http\Middlewares\PayfortWebhookSignature::class,
            ],
        ],
    ],
];
```

Add the following lines to your `.env` file and set values:

```dotenv
PAYFORT_SANDBOX_MODE=true
PAYFORT_DEBUG_MODE=true
PAYFORT_LOG_CHANNEL=stack
# merchant: default
PAYFORT_MERCHANT_IDENTIFIER=
PAYFORT_ACCESS_CODE=
PAYFORT_SHA_REQUEST_PHRASE=
PAYFORT_SHA_RESPONSE_PHRASE=
# merchant: apple
PAYFORT_APPLE_MERCHANT_IDENTIFIER=
PAYFORT_APPLE_ACCESS_CODE=
PAYFORT_APPLE_SHA_REQUEST_PHRASE=
PAYFORT_APPLE_SHA_RESPONSE_PHRASE=
```

## Multiple merchants

You can add new merchants in config/payfort.php.

```php
use \Sevaske\Payfort\Payfort;

// getting merchant
$defaultMerchant = Payfort::merchant();
$anotherMerchant = Payfort::merchant('apple');
```

## Usage

```php
use \Sevaske\PayfortApi\Signature;
use \Sevaske\PayfortApi\Http\Response as PayfortResponse;
use \Sevaske\PayfortApi\Http\Responses\CheckStatusResponse;
use \Sevaske\Payfort\Payfort;

try {
    $response = Payfort::merchant('default')
        ->api()
        ->checkStatus(merchantReference: 'ORDER-123456'); // CheckStatusResponse
        
    $response->jsonSerialize();    // Parsed response as array
    $response->authorizedAmount(); // ?string
    $response->capturedAmount();   // ?string
    $response->refundedAmount();   // ?string
} catch (\Sevaske\PayfortApi\Exceptions\PayfortException $exception) {
    // handle
}

// using callback
$response = $merchant->api()->checkStatus('12345', callback: function (
    CheckStatusResponse $response,
    array $request
) {
    // ... 
    return $response;
});

// api calls
 Payfort::merchant()->api()->checkStatus();
 Payfort::merchant()->api()->createToken();
 Payfort::merchant()->api()->recurring();
 Payfort::merchant()->api()->refund();
 Payfort::merchant()->api()->updateToken();
 Payfort::merchant()->api()->voidAuthorization();

// custom request
Payfort::merchant()->api()->request([
    'query_command' => 'CHECK_STATUS',
    'merchant_reference' => 'ORDER-123456',
]); // PayfortResponse

// custom raw request (raw response with no validations)
Payfort::merchant()->api()->rawRequest(['foo' => 'bar'], 'uri', 'POST'); // ResponseInterface

// calculation signature
$signature = (new Signature(shaPhrase: '', shaType: 'sha256'))->calculate(['foo' => 'bar']);
```

## Webhook events

This package triggers events that allow developers to handle Payfort webhook data according to their application logic. The events provide all necessary data from the webhook requests, enabling customized handling of feedback and notification events.

### Available events

- **`PayfortFeedbackReceived`**  
  Triggered when feedback data is received from Payfort. This event provides access to the Payfort merchant and data from the webhook request.

- **`PayfortNotificationReceived`**  
  Triggered when a notification is received from Payfort. It also includes the Payfort merchant and webhook data.

### Event data

Each event includes:
- `getMerchantName()`: The merchant name.
- `getPayload()`: The `POST` data sent by Payfort in the webhook.
- `getMerchant()`: An instance of `Merchant` containing merchant-specific information.

### Setting up event listeners

To handle these events, you need to create listeners in your application and register them in your `EventServiceProvider`.

#### 1. Create a listener

Create a custom listener to handle `PayfortFeedbackReceived`:

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Sevaske\Payfort\Events\PayfortFeedbackReceived;

class HandlePayfortFeedback implements ShouldQueue
{
    public function handle(PayfortFeedbackReceived $event)
    {
        // Access event data
        $event->getMerchantName(); // string
        $event->getPayload() // request data
        $event->getMerchant(); // Sevaske\Payfort\Merchant

        // Custom logic for handling feedback webhook data
        // For example, logging data or updating the database
    }
}
```

#### 2. Register the listener

In your `EventServiceProvider`, map the event to the listener:

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Sevaske\Payfort\Events\PayfortFeedbackReceived;
use App\Listeners\HandlePayfortFeedback;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PayfortFeedbackReceived::class => [
            HandlePayfortFeedback::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
```

## Debug mode

Enables debug mode for logging detailed request/response information. You can set the "log_channel".

## Contribution

You are welcome to contribute or use https://github.com/sevaske/payfort-api to work with the API directly.

## What to expect

- **Feature Set**: Some features might be incomplete or subject to change based on user feedback and further development.
- **Stability**: Although we strive for stability, you may encounter issues or bugs. Please report any problems you find.
- **Support**: We provide basic support for beta users, but responses might be slower compared to stable releases.

Thank you for trying out our beta version and helping us make it better!

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
