## Laravel Mwaloni Package by [Mwaloni Limited](https://mwaloni.com)

This Laravel package provides convenient methods for integrating [Mwaloni](https://mwaloni.com) functionalities into your Laravel application.

## Installation

You can install the package via composer:

```bash
composer require akika/laravel-mwaloni
```

After installing the package, publish the configuration file using the following command:

```bash
php artisan mwaloni:install
```

This will generate a mwaloni.php file in your config directory where you can set your Mwaloni credentials and other configuration options.

## .env file Setup

Add the following configurations into the .env file

```bash
MWALONI_ENV= # sandbox|production
MWALONI_DEBUG= # true|false
MWALONI_URL_SANDBOX= # Can be added for local tests
```

NOTE:

- The mwaloni.php config file sets the default `MWALONI_ENV` value to `sandbox`. This will always load sandbox url and credentials.
- It also sets the default debug mode to true. When true, the package will log into the log destination provided
- The other variables except `MWALONI_ENV` and `MWALONI_DEBUG` will be provided by Mwaloni during onboarding.
- When debug mode is set to true, Mwaloni will log both data object and result on every API call

## Function Responses

All responses, will be in json format as received from the Mwaloni portal.

### Sample failed response

```bash
{
   "status":"01",
   "message":"Service not found",
}
```

### Sample successful transaction response

```bash
{
   "status":"00",
   "message":"Cashout was successful."
}
```

## Usage

### Initializing Mwaloni

To initialize Mwaloni, paste the following code within your code.

```php
use Akika\LaravelMwaloni\Mwaloni; // Paste before class definition

/**
 *
   * Initialize the Mwaloni class using credentials provided
   *
   * @param string $serviceId
   * @param string $username
   * @param string $password
   * @param string $apiKey
   */

$mwaloni = new Mwaloni($serviceId, $username, $password, $apiKey); // Paste code where appropriate in your code.
```

### Authentication

Authentication si required in order to consume Mwaloni APIs. The function below will perform authentication.

```php
$response = $mwaloni->authenticate();
```

#### Authentication result

```bash
{
   "status":"00",
   "message":"Success",
   "data":{
      "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.xxxx.xxxxxx",
      "tokenType":"Bearer",
      "expiresIn":3600
   }
}
```

- A generated token can be used for up to 60 minutes.

#### Setting token

- On successful authentication, use the following function to set up the toke for use on subsequent calls.

```php

/**
 *
   * Set the API token
   *
   * @param string $token
   */

$response = $mwaloni->setToken($token); // $data->token
```

### Query account balance

```php
$response = $mwaloni->fetchBalance();
```

A successful balance query response will have the below structure:

```bash
{
   "status":"00",
   "message":"Success",
   "balance":3250544,
   "balanceBreakdown":{
      "utilityBalance":3250544,
      "workingBalance":0
   }
}
```

### Send money to mpesa enabled lines

```php
/**
 *
   * Send money to a mobile number
   *
   * @param string $orderNumber - The order number
   * @param string $phoneNumber - The phone number
   * @param float $amount - The amount to send
   * @param string $description - The description of the transaction
   *
   * @return mixed
   */

$response = $mwaloni->mobile($orderNumber, $phoneNumber, $amount, $description);
```

### Send to mpesa till number

```php

/**
   *
   * Send money to a till number
   *
   * @param string $orderNumber - The order number
   * @param string $accountName - The name of the account holder
   * @param string $accountNumber - The till number
   * @param float $amount - The amount to send
   * @param string $description - The description of the transaction
   *
   * @return mixed
   */

$response = $mwaloni->till($orderNumber, $accountName, $accountNumber, $amount, $description);
```

### Send to mpesa paybill

```php
/**
   *
   * Send money to a paybill number
   *
   * @param string $accountReference - The account reference
   * @param string $orderNumber - The order number
   * @param string $accountName - The name of the account holder
   * @param string $accountNumber - The paybill number
   * @param float $amount - The amount to send
   * @param string $description - The description of the transaction
   *
   * @return mixed
   */

$response = $mwaloni->paybill($accountReference, $orderNumber, $accountName, $accountNumber, $amount, $description);
```

### Send to bank via ift

```php
/**
 *
   * Send money to a bank account through ift
   *
   * @param string $orderNumber - The order number
   * @param string $accountName - The name of the account holder
   * @param string $accountNumber - The account number
   * @param string $address - The address of the account holder
   * @param string $countryCode - The country code
   * @param float $amount - The amount to send
   * @param string $currencyCode - The currency code
   * @param string $description - The description of the transaction
   *
   * @return mixed
   */

$response = $mwaloni->ift($orderNumber, $accountName, $accountNumber, $address, $countryCode, $amount, $currencyCode, $description);
```

### Send to bank via eft

```php

/**
 *
   * Send money to a bank account through eft
   *
   * @param string $orderNumber - The order number
   * @param string $accountNumber - The account number
   * @param string $accountName - The name of the account holder
   * @param string $bankCode - The bank code
   * @param string $bankName - The name of the bank
   * @param string $bankCountryCode - The country code of the bank
   * @param string $bankCIF - The CIF/Swift Code of the bank
   * @param string $accountAddress - The address of the account holder
   * @param float $amount - The amount to send
   * @param string $currencyCode - The currency code
   * @param string $description - The description of the transaction
   *
   * @return mixed
   */

$response = $mwaloni->eft($orderNumber, $accountNumber, $accountName, $bankCode, $bankName, $bankCountryCode, $bankCIF, $accountAddress, $amount, $currencyCode, $description);
```

### Send to bank via pesalink

```php

/**
   *
   * Send money to a bank account through pesalink
   *
   * @param string $orderNumber - The order number
   * @param string $accountNumber - The account number
   * @param string $accountName - The name of the account holder
   * @param string $bankName - The name of the bank
   * @param string $bankCountryCode - The country code of the bank
   * @param string $bankCIF - The CIF/Swift Code of the bank
   * @param float $amount - The amount to send
   * @param string $currencyCode - The currency code
   * @param string $description - The description of the transaction
   *
   * @return mixed
*/

$response = $mwaloni->pesalink($orderNumber, $accountNumber, $accountName, $bankName, $bankCountryCode, $bankCIF, $amount, $currencyCode, $description);
```

### Send to bank via rtgs

```php

/**
   *
   * Send money to a bank account through rtgs
   *
   * @param string $orderNumber - The order number
   * @param string $accountNumber - The account number
   * @param string $accountName - The name of the account holder
   * @param string $bankName - The name of the bank
   * @param string $swiftCode - The swift code of the bank
   * @param string $address - The address of the account holder
   * @param string $bankCountryCode - The country code of the bank
   * @param float $amount - The amount to send
   * @param string $currencyCode - The currency code
   * @param string $description - The description of the transaction
   *
   * @return mixed
*/

$response = $mwaloni->rtgs($orderNumber, $accountNumber, $accountName, $bankName, $swiftCode, $address, $bankCountryCode, $amount, $currencyCode, $description);
```

### Send via Stanbic

```php
/**
 * Send money to a Stanbic bank account
   * 
   * @param string $orderNumber - The order number
   * @param string $bankName - The name of the bank
   * @param string $accountNumber - The account number
   * @param string $accountName - The name of the account holder
   * @param string $bankCode - The bank code
   * @param float $amount - The amount to send
   * @param string $description - The description of the transaction
   */
$response = $mwaloni->sendStanbic($orderNumber, $bankName, $accountNumber, $accountName, $bankCode, $amount, $description)
```

### Send via MoMo

```php
/**
     * Send money via MTN Mobile Money
     *
     * @param string $orderNumber
     * @param string $accountNumber
     * @param float $amount
     * @param string $description
     * @return mixed
     */
$response = $mwaloni->sendMomo($orderNumber, $accountNumber, $amount, $description);
```

### Query transaction status

```php

/**
 *
   * Fetch the status of a transaction
   *
   * @param string $orderNumber
   *
   * @return mixed
   */
$response = $mwaloni->getStatus($orderNumber);
```

### KPLC Postpaid

```php
/**
 *
   * Send money to a KPLC postpaid account
   *
   * @param string $meterNumber - The meter number
   * @param string $accountNumber - The account number
   * @param string $msisdn - The phone number attached to the account
   * @param float $amount - The amount to send
   *
   * @return mixed
   */

$response = $mwaloni->kplcPostpaid($meterNumber, $accountNumber, $msisdn, $amount);
```

### Perform contact lookup

```php
/**
 *
   * Fetch the status of a transaction
   *
   * @param string $orderNumber
   *
   * @return mixed
   */
$response = $mwaloni->contactLookup($contact);
```

### Send SMS

```php

/**
 *
   * Send an SMS
   *
   * @param string $phone
   * @param string $message
   *
   * @return mixed
   */

$response = $mwaloni->sendSms($phone, $message);
```
