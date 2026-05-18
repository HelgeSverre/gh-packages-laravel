# Laravel MTN MoMo

[![Latest Version on Packagist](https://img.shields.io/packagist/v/akika/laravel-momo.svg?style=flat-square)](https://packagist.org/packages/akika/laravel-momo)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/akikadigital/laravel-momo/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/akika/laravel-momo/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/akikadigital/laravel-momo/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/akika/laravel-momo/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/akika/laravel-momo.svg?style=flat-square)](https://packagist.org/packages/akika/laravel-momo)

An unofficial MTN MoMo integration for Laravel.

## Installation

Install via Composer:

```bash
composer require akika/laravel-momo
```

Optionally, publish the package config (and optional resources):

```bash
php artisan vendor:publish --tag="laravel-momo-config"
```

## Configuration (.env)

You will need:

- A secondary key which you can retrieve from your MoMo developer account.
- A valid UUID for the `USER_REFERENCE_ID` through a tool like https://www.uuidgenerator.net or via the cli:

```bash
uuidgen | tr '[:upper:]' '[:lower:]'`
```

Set environment variables below in your `.env`:

```bash
MOMO_ENV=sandbox
MOMO_TARGET_ENVIRONMENT=sandbox
MOMO_CALLBACK_HOST=example.com # this should be your domain without the https part or path
MOMO_DISBURSEMENT_CALLBACK_URL=https://example.com/api/callbacks/momo # this should match the path to your callback route
MOMO_SANDBOX_SECONDARY_KEY=your_secondary_key_here
MOMO_SANDBOX_USER_REFERENCE_ID=your_uuid_v4_here
MOMO_SANDBOX_API_KEY=your_api_key_here   # set after running the create-api-key command
MOMO_PRODUCTION_SECONDARY_KEY=your_secondary_key_here
MOMO_PRODUCTION_USER_REFERENCE_ID=your_uuid_v4_here
MOMO_PRODUCTION_API_KEY=your_api_key_here   # set after running the create-api-key command
```

> Note:  
> When using `sandbox` mode, test using the Euro (EUR) currency, as that is the only currency that seems to work in sandbox mode.

For production, set:

- You can find all target environments [on this page.](https://momoapi.mtn.com/api-documentation/common-error)

```bash
MOMO_ENV=production
MOMO_TARGET_ENVIRONMENT=mtnghana
```

The full config file is at [config/momo.php](config/momo.php).

## Creating an API User

You can create an API user using the provided Artisan command. The command will use the configured secondary key and user reference id from your config, or prompt for them.

Interactive (recommended):

```bash
php artisan momo:create-api-user
```

Non-interactive (useful for CI or scripts):

```bash
php artisan momo:create-api-user --no-confirmation --secondary-key=YOUR_SECONDARY_KEY --user-reference-id=YOUR_UUID_V4
```

After success, the API user will be registered with MTN, and you can retrieve it via `php artisan momo:get-api-user` (if available) or using the library API.

## Creating an API Key

To create an API key for the registered API user run:

```bash
php artisan momo:create-api-key
```

The command prints the environment variable you should set (for example `MOMO_SANDBOX_API_KEY=...`). Add that value to your `.env` for the current environment.

You can also run non-interactively:

```bash
php artisan momo:create-api-key --no-confirmation --secondary-key=YOUR_SECONDARY_KEY --user-reference-id=YOUR_UUID_V4
```

## Transferring Funds (Disbursement)

Use the provided `MoMo` facade or the `MoMo` class directly to perform disbursements. The `disbursement()` product exposes `transfer()` and `getTransferStatus()`.

Example using the facade:

```php
use Akika\\MoMo\\Facades\\MoMo;
use Akika\\MoMo\\Enums\\Currency;

// transfer 10.00 UGX to a payee MSISDN
$referenceId = MoMo::disbursement()->transfer(
	10.00,
	Currency::UgandaShilling,
	externalId: 'your-unique-external-id',
	payeeMsisdn: '25677XXXXXXX',
	payerMessage: 'Payment for invoice #123',
	payeeNote: 'Thanks',
);

// $referenceId is the transfer reference you can use to query status
```

The method returns a reference/transaction id (string). You may use any value you like for `externalId`, but using a UUID or unique invoice id is recommended.

## Checking Transfer Status

Call `getTransferStatus()` with the reference id returned from `transfer()`:

```php
$status = MoMo::disbursement()->getTransferStatus($referenceId);
```

`$status` is an array containing the provider response including the status and any metadata:

```php
$status = [
    "amount" => "6.00",
    "currency" => "EUR",
    "financialTransactionId" => "554662921",
    "externalId" => "01KHXC2B1JQTKN16T8XHHTZX6A",
    "payee" => [
        "partyIdType" => "MSISDN",
        "partyId" => "0296631315"
    ],
    "payeeNote" => "Reprehenderit sequi fugiat ipsam sed.",
    "status" => "SUCCESSFUL"
];
```

Inspect the returned array for fields like `status`, `financialTransactionId`, etc.

## Facade / Programmatic Usage

You can instantiate `Akika\\MoMo\\MoMo` directly or use the provided facade `Akika\\MoMo\\Facades\\MoMo`.

Example using `Akika\\MoMo\\MoMo`:

```php
use Akika\\MoMo\\MoMo;
use Akika\\MoMo\\Facades\\MoMo as MoMoFacade;

$client = new MoMo();
$client->createApiUser();
$apiKey = $client->createApiKey();

```

Example using `Akika\\MoMo\\Facades\\MoMo` facade:

```php
use Akika\\MoMo\\Facades\\MoMo;

MoMo::createApiUser();
$apiKey = MoMo::createApiKey();
```

## Checking the Account Balance

You can retrieve the MoMo account balance via the `Disbursement` product. The method returns an array with the available balance and currency.

Example using the `MoMo` facade:

```php
use Akika\MoMo\Facades\MoMo;

$balance = MoMo::disbursement()->getAccountBalance();

// Example result:
// [
//   'availableBalance' => '123.45',
//   'currency' => 'EUR',
// ]
```

Example using the `MoMo` class directly:

```php
use Akika\MoMo\MoMo;

$client = new MoMo();
$balance = $client->disbursement()->getAccountBalance();
```

Check the returned array for `availableBalance` and `currency` when handling the response.

## Overriding configuration programmatically

You can override configuration values at runtime either by constructing a `MoMoConfig` and passing it to a product, or by using the `with()` helper on the `MoMo` facade to create a client with temporary overrides.

Example — instantiate `MoMoConfig` and pass it to the `Disbursement` product:

```php
use Akika\MoMo\MoMo;

$client = new MoMo(
    'your_secondary_key',       // overrides momo.<env>.secondary_key
	'your_user_reference_id',   // overrides momo.<env>.user_reference_id
	'your_api_key',
    'your_target_environment'  // overrides momo.target_environment
)
$referenceId = $client->disbursement()->transfer(
	10.00,
	Currency::UgandaShilling,
	externalId: 'invoice-123',
	payeeMsisdn: '25677XXXXXXX',
);
```

Example — use the `with()` helper on the facade to create a client with overrides:

```php
use Akika\\MoMo\\Facades\\MoMo;
use Akika\\MoMo\\Enums\\Currency;

$referenceId = MoMo::with(
	'your_secondary_key',
	'your_user_reference_id',
	'your_api_key',
    'your_target_environment'
)->disbursement()->transfer(
	10.00,
	Currency::UgandaShilling,
	externalId: 'invoice-123',
	payeeMsisdn: '25677XXXXXXX',
);
```

## Callbacks

You can register an endpoint in your application to receive MoMo callbacks (for example, transfer/disbursement notifications). Add the route to `routes/api.php` or `routes/web.php` depending on whether you want it under the `api` middleware group.

Example route (add to `routes/api.php`):

```php
use Illuminate\Http\Request;

Route::post('/callbacks/momo', function (Request $request) {
	$data = $request->all();

	info(__METHOD__, compact('data'));

	return response()->json(['message' => 'success']);
});
```

Notes:

- Ensure your `MOMO_DISBURSMENT_CALLBACK_URL` is set in your `.env` and reachable by MTN (use a public HTTPS URL in production; tools like `ngrok` can help during local development).
- Consider validating incoming requests (signatures, known headers or a shared secret) before trusting the payload in production.

Sample callback payload for a disbursement:

```json
{
    "amount": "6.00",
    "currency": "EUR",
    "financialTransactionId": "554662921",
    "externalId": "01KHXC2B1JQTKN16T8XHHTZX6A",
    "payee": {
        "partyIdType": "MSISDN",
        "partyId": "0296631315"
    },
    "payeeNote": "Reprehenderit sequi fugiat ipsam sed.",
    "status": "SUCCESSFUL"
}
```

The route above logs the callback payload with Laravel's `info()` helper and responds with a JSON success message. Adjust handling according to your application's needs (update transfer status, notify users, etc.).

## Tests

Run tests with:

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Akika Digital](https://github.com/akika)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md).
