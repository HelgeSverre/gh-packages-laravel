# Laravel Taler


## Installation

This package is a Laravel wrapper around [`mirrorps/taler-php`](https://github.com/mirrorps/taler-php).
Laravel auto-discovers the service provider and facade, but you still need to:

1. Install the package
2. Install and bind a PSR-18 HTTP client
3. Configure the required Taler environment variables
4. Optionally publish the config file if you want app-level overrides
5. Clear cached config if your app uses it

Install the package:

```bash
composer require mirrorps/laravel-taler
```

## HTTP Client Setup

`laravel-taler` expects a PSR-18 HTTP client implementation.
If you want to use async package APIs the client must also support HTTPlug async requests.

A good default choice is the Guzzle 7 adapter:

```bash
composer require guzzlehttp/guzzle php-http/guzzle7-adapter
```

Then bind it in your Laravel app, for example in `app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Http\Adapter\Guzzle7\Client as GuzzleAdapterClient;
use Illuminate\Support\ServiceProvider;
use Psr\Http\Client\ClientInterface;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GuzzleAdapterClient::class, function (): GuzzleAdapterClient {
            return new GuzzleAdapterClient();
        });

        $this->app->singleton(ClientInterface::class, function (): ClientInterface {
            return $this->app->make(GuzzleAdapterClient::class);
        });
    }
}
```

Notes:

- Sync-only package methods need a PSR-18 client.
- Async package methods need a client that also implements `Http\Client\HttpAsyncClient`.
- If you do not bind a compatible client, async APIs will fail at runtime.

## Package Configuration

You can configure the package through `.env`.

If you want to customize the config file inside your app, publish it with:

```bash
php artisan vendor:publish --tag=taler-config
```

This creates `config/taler.php` in your Laravel application.

Then configure your environment variables:

```dotenv
TALER_BASE_URL=https://backend.demo.taler.net/instances/sandbox
TALER_TOKEN="Bearer secret-token:sandbox"
TALER_USERNAME=merchant-user
TALER_PASSWORD=merchant-password
TALER_INSTANCE_ID=default
TALER_SCOPE=readonly
TALER_DURATION_US=3600000000
TALER_DESCRIPTION="Backoffice session" //--- token description (optional) 
TALER_WRAP_RESPONSE=true
TALER_LOGGING_ENABLED=true
TALER_LOG_CHANNEL=
TALER_DEBUG_LOGGING_ENABLED=false
```

Configuration notes:

- `TALER_BASE_URL` is required.

- If `TALER_TOKEN` is set, it takes precedence over username/password login.
- If no token is provided, the package uses `TALER_USERNAME`, `TALER_PASSWORD`, and `TALER_INSTANCE_ID` to obtain a token.
- `TALER_SCOPE` defaults to `readonly`.
- `TALER_WRAP_RESPONSE` controls whether the underlying SDK wraps responses into DTOs when available.
- `TALER_LOGGING_ENABLED` is an explicit on/off switch for SDK logging. When set to `false`, a PSR-3 `NullLogger` is plugged into the SDK and Laravel's logging stack is bypassed entirely.
- `TALER_LOG_CHANNEL` selects which Laravel log channel receives SDK log records when logging is enabled. Leave empty to use your application's default channel, or set it to any channel defined in `config/logging.php`.
- `TALER_DEBUG_LOGGING_ENABLED` toggles the SDK's own DEBUG-level request/response logging. It is independent from `TALER_LOGGING_ENABLED`; error-level failure logs from the SDK are always emitted as long as logging is enabled.

### Logging

The underlying `mirrorps/taler-php` SDK accepts any PSR-3 `LoggerInterface` and owns all logging policy (log levels, redaction of sensitive headers/bodies, request/response previews). This package is only responsible for wiring Laravel's logging stack into the SDK, so you configure logging the same way you configure it for the rest of your Laravel app.

Three typical setups:

1. **Default channel (no extra configuration).** Leave `TALER_LOG_CHANNEL` empty and Taler logs flow into your default channel (`config('logging.default')`).

2. **Dedicated channel.** Declare a channel in `config/logging.php` and point `TALER_LOG_CHANNEL` at it:

   ```php
   // config/logging.php
   'channels' => [
       // ...
       'taler' => [
           'driver' => 'daily',
           'path' => storage_path('logs/taler.log'),
           'level' => env('TALER_LOG_LEVEL', 'debug'),
           'days' => 14,
       ],
   ],
   ```

   ```dotenv
   TALER_LOG_CHANNEL=taler
   TALER_DEBUG_LOGGING_ENABLED=true
   ```

3. **Silence SDK logging.** Set `TALER_LOGGING_ENABLED=false` to plug a `NullLogger` into the SDK.

Logging is resolved at the config layer: the active channel is locked in when the SDK client is first built (once per container lifetime, because the factory is bound as a singleton). If you change the logging configuration at runtime, forget the bindings before resolving them again:

```php
app()->forgetInstance(\Mirrorps\LaravelTaler\TalerManager::class);
app()->forgetInstance(\Mirrorps\LaravelTaler\Contracts\CreatesTalerClients::class);
app()->forgetInstance(\Mirrorps\LaravelTaler\Logging\LogChannelResolver::class);
```

For full runtime control (for example in tests), bind a custom PSR-3 logger by overriding `CreatesTalerClients` in a service provider or via `$app->bind(...)`.

If you cache config in your app, clear it after changing `.env`:

```bash
php artisan optimize:clear
```

## Installation Checklist

For a fresh Laravel app, the full setup looks like this:

```bash
composer require mirrorps/laravel-taler
composer require guzzlehttp/guzzle php-http/guzzle7-adapter
php artisan optimize:clear
```

After that:

1. Bind the HTTP client in `AppServiceProvider`
2. Add the Taler environment variables to `.env`
3. Optionally publish `config/taler.php` if you want to override package defaults in your app
4. Run a simple package call to verify connectivity

## Usage

### Orders API

Fetch order history:

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Order\Dto\GetOrdersRequest;

$orders = Taler::orders()->getOrders(new GetOrdersRequest(
    paid: true,
    limit: 20,
));
```

Query a single order:

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Order\Dto\GetOrderRequest;

$order = Taler::orders()->getOrder('order-123', new GetOrderRequest(
    token: 'claim-token',
));
```

Create an order:

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Order\Dto\Amount;
use Taler\Api\Order\Dto\OrderV0;
use Taler\Api\Order\Dto\PostOrderRequest;

$response = Taler::orders()->createOrder(new PostOrderRequest(
    order: new OrderV0(
        summary: 'Coffee beans',
        amount: new Amount('EUR:12.50'),
        order_id: 'order-123',
    ),
));
```

Refund an order:

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Order\Dto\RefundRequest;

$refund = Taler::orders()->refundOrder('order-123', new RefundRequest(
    refund: 'EUR:5.00',
    reason: 'Customer requested a partial refund',
));
```

Delete an order:

```php
use Mirrorps\LaravelTaler\Facades\Taler;

Taler::orders()->deleteOrder('order-123');
```

Forget selected order fields:

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Order\Dto\ForgetRequest;

Taler::orders()->forgetOrder('order-123', new ForgetRequest(
    fields: ['$.delivery_location'],
));
```

Async calls are available too:

```php
$promise = Taler::orders()->getOrdersAsync(['limit' => 20]);
$orderPromise = Taler::orders()->getOrderAsync('order-123');
```

If you want the resolved result immediately:

```php
$orders = Taler::orders()->getOrdersAsync(['limit' => 20])->wait();
$order = Taler::orders()->getOrderAsync('order-123')->wait();
```

### Instance Management API

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Dto\RelativeTime;
use Taler\Api\Instance\Dto\GetAccessTokensRequest;
use Taler\Api\Instance\Dto\GetKycStatusRequest;
use Taler\Api\Instance\Dto\GetMerchantStatisticsAmountRequest;
use Taler\Api\Instance\Dto\GetMerchantStatisticsCounterRequest;
use Taler\Api\Instance\Dto\InstanceAuthConfigToken;
use Taler\Api\Instance\Dto\InstanceConfigurationMessage;
use Taler\Api\Instance\Dto\InstanceReconfigurationMessage;
use Taler\Api\Instance\Dto\LoginTokenRequest;
```

List all instances (admin API):

```php
$instances = Taler::instance()->getInstances();
```

Fetch one instance:

```php
$instance = Taler::instance()->getInstance('default');
```

Create an instance:

```php
Taler::instance()->createInstance(new InstanceConfigurationMessage(
    id: 'coffee-shop',
    name: 'Coffee Shop',
    auth: new InstanceAuthConfigToken(password: 'super-secret'),
    address: new \Taler\Api\Dto\Location(country: 'DE', town: 'Berlin'),
    jurisdiction: new \Taler\Api\Dto\Location(country: 'DE'),
    use_stefan: false,
    default_wire_transfer_delay: new RelativeTime(d_us: 0),
    default_pay_delay: new RelativeTime(d_us: 0),
));
```

Update an instance:

```php
Taler::instance()->updateInstance('coffee-shop', new InstanceReconfigurationMessage(
    name: 'Coffee Shop Berlin',
    address: new \Taler\Api\Dto\Location(country: 'DE', town: 'Berlin'),
    jurisdiction: new \Taler\Api\Dto\Location(country: 'DE'),
    use_stefan: false,
    default_wire_transfer_delay: new RelativeTime(d_us: 0),
    default_pay_delay: new RelativeTime(d_us: 0),
));
```

Update instance authentication or trigger forgot-password:

```php
$challenge = Taler::instance()->updateAuth(
    'coffee-shop',
    new InstanceAuthConfigToken(password: 'new-secret'),
);

$challenge = Taler::instance()->forgotPassword(
    'coffee-shop',
    new InstanceAuthConfigToken(password: 'reset-secret'),
);
```

Retrieve an access token for an instance:

```php
$token = Taler::instance()->getAccessToken('coffee-shop', new LoginTokenRequest(
    scope: 'readonly',
    duration: new RelativeTime(d_us: 3600000000),
    description: 'Backoffice session',
));
```

List or revoke issued access tokens:

```php
$tokens = Taler::instance()->getAccessTokens(
    'coffee-shop',
    new GetAccessTokensRequest(limit: 20),
);

Taler::instance()->deleteAccessToken('coffee-shop');
Taler::instance()->deleteAccessTokenBySerial('coffee-shop', 42);
```

Check KYC status:

```php
$kycStatus = Taler::instance()->getKycStatus(
    'coffee-shop',
    new GetKycStatusRequest(lpt: 1, timeout_ms: 5000),
);
```

Read merchant statistics:

```php
$amountStats = Taler::instance()->getMerchantStatisticsAmount(
    'coffee-shop',
    'revenue',
    new GetMerchantStatisticsAmountRequest(by: 'ANY'),
);

$counterStats = Taler::instance()->getMerchantStatisticsCounter(
    'coffee-shop',
    'orders',
    new GetMerchantStatisticsCounterRequest(by: 'BUCKET'),
);
```

Delete or purge an instance:

```php
$challenge = Taler::instance()->deleteInstance('coffee-shop');
$challenge = Taler::instance()->deleteInstance('coffee-shop', purge: true);
```

All instance methods also support async variants by appending `Async`.

```php
$promise = Taler::instance()->getInstancesAsync();
$instances = $promise->wait();
```

### Inventory Management API

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Dto\RelativeTime;
use Taler\Api\Inventory\Dto\CategoryCreateRequest;
use Taler\Api\Inventory\Dto\GetProductsRequest;
use Taler\Api\Inventory\Dto\LockRequest;
use Taler\Api\Inventory\Dto\ProductAddDetail;
use Taler\Api\Inventory\Dto\ProductPatchDetail;
```

List all inventory categories:

```php
$categories = Taler::inventory()->getCategories();
```

Fetch one category and its products:

```php
$category = Taler::inventory()->getCategory(1);
```

Create a category:

```php
$created = Taler::inventory()->createCategory(new CategoryCreateRequest(
    name: 'Coffee',
    name_i18n: ['de' => 'Kaffee'],
));
```

Update a category:

```php
Taler::inventory()->updateCategory(1, new CategoryCreateRequest(
    name: 'Coffee Beans',
));
```

Delete a category:

```php
Taler::inventory()->deleteCategory(1);
```

List products:

```php
$products = Taler::inventory()->getProducts(new GetProductsRequest(
    limit: 20,
));
```

Fetch one product:

```php
$product = Taler::inventory()->getProduct('coffee-1kg');
```

Create a product:

```php
Taler::inventory()->createProduct(new ProductAddDetail(
    product_id: 'coffee-1kg',
    product_name: 'Coffee Beans 1kg',
    description: 'Roasted arabica beans',
    unit: 'bag',
    price: 'EUR:12.50',
    total_stock: 50,
    categories: [1],
));
```

Update a product:

```php
Taler::inventory()->updateProduct('coffee-1kg', new ProductPatchDetail(
    product_name: 'Coffee Beans 1kg',
    description: 'Roasted arabica beans',
    unit: 'bag',
    price: 'EUR:13.00',
    total_stock: 45,
    total_lost: 1,
    categories: [1],
));
```

Delete a product:

```php
Taler::inventory()->deleteProduct('coffee-1kg');
```

Fetch POS inventory details:

```php
$pos = Taler::inventory()->getPos();
```

Lock inventory for a frontend session:

```php
Taler::inventory()->lockProduct('coffee-1kg', new LockRequest(
    lock_uuid: '550e8400-e29b-41d4-a716-446655440000',
    duration: new RelativeTime(d_us: 30000000),
    quantity: 2,
));
```

All inventory methods also support async variants by appending `Async`.

```php
$promise = Taler::inventory()->getProductsAsync(new GetProductsRequest(limit: 20));
$products = $promise->wait();
```

### Bank Accounts API

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\BankAccounts\Dto\AccountAddDetails;
use Taler\Api\BankAccounts\Dto\AccountPatchDetails;
use Taler\Api\BankAccounts\Dto\BasicAuthFacadeCredentials;
use Taler\Api\BankAccounts\Dto\NoFacadeCredentials;
```

List all bank accounts:

```php
$accounts = Taler::bankAccounts()->getAccounts();
```

Fetch one bank account by `h_wire`:

```php
$account = Taler::bankAccounts()->getAccount($hWire);
```

Create a bank account:

```php
$response = Taler::bankAccounts()->createAccount(
    new AccountAddDetails(
        payto_uri: 'payto://iban/DE75512108001245126199?receiver-name=Sandbox',
        credit_facade_url: 'https://bank.example.test/facade',
        credit_facade_credentials: new BasicAuthFacadeCredentials(
            username: 'facade-user',
            password: 'facade-password',
        ),
    ),
);
```

Update a bank account:

```php
Taler::bankAccounts()->updateAccount(
    $hWire,
    new AccountPatchDetails(
        credit_facade_url: 'https://bank.example.test/facade/v2',
        credit_facade_credentials: new BasicAuthFacadeCredentials(
            username: 'facade-user',
            password: 'new-secret',
        ),
    ),
);
```

Remove a bank account:

```php
Taler::bankAccounts()->deleteAccount($hWire);
```

All bank-account methods can also run in async mode by appending `Async` to the method name.

Example async calls:

```php
$promise = Taler::bankAccounts()->getAccountsAsync();
$accounts = $promise->wait();
```

```php
$promise = Taler::bankAccounts()->createAccountAsync(
    new AccountAddDetails(
        payto_uri: 'payto://iban/DE75512108001245126199?receiver-name=Sandbox',
    ),
);

$response = $promise->wait();
```

### Config API

Fetch the merchant backend configuration:

```php
use Mirrorps\LaravelTaler\Facades\Taler;

$config = Taler::config()->getConfig();
```

Pass request headers when needed:

```php
$config = Taler::config()->getConfig([
    'X-Trace-Id' => 'merchant-config-check',
]);
```

Async access is available too:

```php
$promise = Taler::config()->getConfigAsync();
$config = $promise->wait();
```

### Two-factor authentication (TAN challenges)

Request TAN transmission for a challenge:

```php
use Mirrorps\LaravelTaler\Facades\Taler;

$info = Taler::twoFactorAuth()->requestChallenge(
    instanceId: 'default',
    challengeId: $challengeId,
    requestBody: [],
);
```

Confirm a challenge with the received TAN:

```php
use Taler\Api\TwoFactorAuth\Dto\MerchantChallengeSolveRequest;

Taler::twoFactorAuth()->confirmChallenge(
    instanceId: 'default',
    challengeId: $challengeId,
    requestBody: new MerchantChallengeSolveRequest(tan: $tan),
);
```

Async variants:

```php
use Mirrorps\LaravelTaler\Facades\Taler;

$promise = Taler::twoFactorAuth()->requestChallengeAsync(
    instanceId: 'default',
    challengeId: $challengeId,
    requestBody: [],
);
$info = $promise->wait();
```

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\TwoFactorAuth\Dto\MerchantChallengeSolveRequest;

$promise = Taler::twoFactorAuth()->confirmChallengeAsync(
    instanceId: 'default',
    challengeId: $challengeId,
    requestBody: new MerchantChallengeSolveRequest(tan: $tan),
);
$promise->wait();
```

### OTP Devices API

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\OtpDevices\Dto\GetOtpDeviceRequest;
use Taler\Api\OtpDevices\Dto\OtpDeviceAddDetails;
use Taler\Api\OtpDevices\Dto\OtpDevicePatchDetails;
```

List all OTP devices:

```php
$devices = Taler::otpDevices()->getOtpDevices();
```

Fetch one OTP device:

```php
$device = Taler::otpDevices()->getOtpDevice('pos-device-1');
```

Fetch one OTP device with optional query parameters:

```php
$device = Taler::otpDevices()->getOtpDevice(
    'pos-device-1',
    new GetOtpDeviceRequest(
        faketime: 1700000000,
        price: 'EUR:1.00',
    ),
);
```

Create an OTP device:

```php
Taler::otpDevices()->createOtpDevice(new OtpDeviceAddDetails(
    otp_device_id: 'pos-device-1',
    otp_device_description: 'Counter POS',
    otp_key: 'BASE32SECRET',
    otp_algorithm: 1,
));
```

Update an OTP device:

```php
Taler::otpDevices()->updateOtpDevice(
    'pos-device-1',
    new OtpDevicePatchDetails(
        otp_device_description: 'Counter POS (v2)',
    ),
);
```

Delete an OTP device:

```php
Taler::otpDevices()->deleteOtpDevice('pos-device-1');
```

All OTP-device methods also support async variants by appending `Async`.

```php
$promise = Taler::otpDevices()->getOtpDevicesAsync();
$devices = $promise->wait();
```

### Templates API

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\Dto\RelativeTime;
use Taler\Api\Templates\Dto\TemplateAddDetails;
use Taler\Api\Templates\Dto\TemplateContractDetails;
use Taler\Api\Templates\Dto\TemplatePatchDetails;
```

List all templates:

```php
$templates = Taler::templates()->getTemplates();
```

Fetch one template by id:

```php
$template = Taler::templates()->getTemplate('coffee-template');
```

Create a template:

```php
Taler::templates()->createTemplate(new TemplateAddDetails(
    template_id: 'coffee-template',
    template_description: 'Coffee checkout defaults',
    template_contract: new TemplateContractDetails(
        minimum_age: 0,
        pay_duration: new RelativeTime(d_us: 3600000000),
        summary: 'Coffee beans',
        currency: 'EUR',
        amount: 'EUR:12.50',
    ),
));
```

Update a template:

```php
Taler::templates()->updateTemplate(
    'coffee-template',
    new TemplatePatchDetails(
        template_description: 'Coffee checkout defaults (v2)',
        template_contract: new TemplateContractDetails(
            minimum_age: 0,
            pay_duration: new RelativeTime(d_us: 3600000000),
            summary: 'Coffee beans premium',
            currency: 'EUR',
            amount: 'EUR:14.00',
        ),
    ),
);
```

Delete a template:

```php
Taler::templates()->deleteTemplate('coffee-template');
```

All template methods also support async variants by appending `Async`.

```php
$promise = Taler::templates()->getTemplatesAsync();
$templates = $promise->wait();
```

### Donau charity API

Manage linked Donau charity instances for the current merchant instance (requires the merchant backend to support Donau; see `have_donau` in the config/version response).

```php
use Mirrorps\LaravelTaler\Facades\Taler;
use Taler\Api\DonauCharity\Dto\PostDonauRequest;
```

List linked charity instances:

```php
$response = Taler::donauCharity()->getInstances();
```

Link a charity (returns `null` on success with HTTP 204, or a `ChallengeResponse` when two-factor authentication is required with HTTP 202):

```php
$challenge = Taler::donauCharity()->createDonauCharity(new PostDonauRequest(
    donau_url: 'https://donau.example',
    charity_id: 7,
));
```

Unlink a charity by its Donau instance serial:

```php
Taler::donauCharity()->deleteDonauCharityBySerial(321);
```

Async variants append `Async` to the method name:

```php
$promise = Taler::donauCharity()->getInstancesAsync();
$instances = $promise->wait();
```

```php
use Taler\Api\DonauCharity\Dto\PostDonauRequest;

$promise = Taler::donauCharity()->createDonauCharityAsync(new PostDonauRequest(
    donau_url: 'https://donau.example',
    charity_id: 7,
));
$result = $promise->wait();
```

```php
$promise = Taler::donauCharity()->deleteDonauCharityBySerialAsync(321);
$promise->wait();
```

## Testing

```bash
composer test
```
---

## Funding

This project is funded through [NGI TALER Fund](https://nlnet.nl/taler), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/TalerPHP).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)