## Laravel NCBA Package by [Akika Digital](https://akika.digital)

The Laravel NCBA package allows you to transfer money through the NCBA Open Banking APIs. The package supports Laravel version 5 and above.

## Installation

You can install the package via composer:

```bash
composer require akika/laravel-ncba
```

After installing the package, publish the configuration file using the following command:

```bash
php artisan ncba:install
```

This will import ncba.php config file in your project config directory where you can set your NCBA related parameters and other configuration options.

## .env file Setup

Add the following configurations into your .env file

```bash
NCBA_ENV= # This value is either sandbox or production. This config variable - This is required to enable Laravel NCBA pick the required variables.
NCBA_DEBUG= # This value is true or false. If true, the app will write debug logs.
NCBA_SANDBOX_API_KEY= # The provided sandbox API Key. Contact NCBA for this key.
NCBA_SANDBOX_USERNAME= # Sandbox username
NCBA_SANDBOX_PASSWORD= # Sandbox password
NCBA_SANDBOX_URL= # Sandbox API URL
NCBA_PRODUCTION_API_KEY= # You will reveive this key after you are fully onboarded onto NCBA Online Banking API.
NCBA_PRODUCTION_USERNAME= # Production username
NCBA_PRODUCTION_PASSWORD= # Production password
NCBA_PRODUCTION_URL= # Production API URL
```

## Package Upgrade

To upgrade Laravel NCBA Package to the latest version, run the following command

```bash
composer update akika/laravel-ncba
```

## Usage

### Initialize NCBA

```php
use Akika\LaravelNcba\Ncba;

// You can initialize the class without passing any parameters. In this case, you must ensure the credentials are in the .env file
$ncba = new Ncba();

// or

// You can also override the variables as shown below. In this case, the package will ignore the variables in the config file.
$ncba = new Ncba($apiKey, $username, $password);
```

- The packag will process the credentials from the config variables provided

### Authentication

An AP token is required to authenticate and use NCBA API's. Below is how to authenticate.

```php
$ncba->authenticate();
```

## Account Details

Gets account details including account balance.

```php
$ncba->accountDetails($apiToken, $countryCode, $accountNo);
```

## Mini Statement

Gets a mini statement for the account

```php
$ncba->miniStatement($apiToken, $countryCode, $accountNo);
```

## Account Statement

Gets an account statement based on the the specified period of time. The date format is 'ddmmyyyy'

```php
$ncba->accountStatement($apiToken, $countryCode, $accountNo, $fromDate, $toDate);
```

### Check Transaction Status

```php
$ncba = new Ncba();
$response = $ncba->checkTransactionStatus($apiToken, $countryCode, $transactionID);
```

#### Success Response

Below is a sample result for a successful transaction.

```php
{
    "ErrorCode": "000",
    "ErrorMessage": "Success",
    "TransactionId": "String",
    "CoreReference": "String",
}
```

Below is a transaction successful result

```php
{
    "resultCode": "000",
    "statusDescription": "SUCCESS",
    "cbxReferenceNumber": "IFT123454-3",
    "txnReferenceNo": "FTX24211TAACS"
}
```

### Send Money to Another NCBA Customer (Internal Transfer)

```php
$ncba = new Ncba();

$response = $ncba->ift($apiToken, $country, $transactionID, $beneficiaryAccountNumber, $beneficiaryAccountName, $senderAccountNumber, $currency, $amount $narration);
```

#### IFT Payment rules

- The following rules apply when using the Laravel NCBA package

1. Transaction can be settled in all major currencies, i.e. KES, UGX, TZS, RWF, EUR, GBP & USD.
2. Settlement is immediate; real-time.
3. Payments will be within country of origin, local b2b.
4. Minimum payments of KES. 50 or its equivalent in other currency, no limit on Maximum payment.
5. Transactions processing is 24/7 – 365, including weekends and public holidays.

### Send Money to a Non-NCBA Customer (External Transfer)

```php
$ncba = new Ncba();

$response = $ncba->eft($apiToken, $amount, $beneficiaryAccountNumber, $beneficiaryBankBic, $beneficiaryName, $currency, $senderAccountNumber, $narration, $senderCountry, $transactionID, $senderCIF);
```

#### EFT payment rules.

1. Transaction can be settled in only in local currency, KES, UGX, TZS & RWF.
2. Settlement is processed T+ 1 day.
3. Payments will be within country of origin, local b2b.
4. Minimum payments of KES. 50 or its equivalent in other currency and a maximum of KES. 999,999 or it’s equivalent in other local currency.
5. Transactions processing is only on working days, Monday – Friday, excluding Weekends and Public Holidays.

### Send Money via RTGS (External Transfer)

```php
$ncba = new Ncba();

$response = $ncba->rtgs($apiToken, $beneficiaryAccountNumber, $beneficiaryBankBIC, $beneficiaryCountry, $beneficiaryName, $creditAmount, $creditCurrency, $debitCurrency, $narration, $senderAccountNumber, $senderCIF, $senderCountry, $purposeCode, $transactionID);
```

#### Payment Rules

- The following rules apply when using the Laravel NCBA package

1. Transaction settled in KES, USD,GBP,EUR,TZS,UGX & RWF.
2. Settlement is T+ 3hours on a working day, typically Monday – Friday before 15.00 HRS EAT.
3. Payments will be within Country of Origin.
4. Minimum payments of KES. 50 or its equivalent in any other acceptable currency with no maximum CAP.
5. Purpose of Payment Code (POP) will be required for all outgoing payments - The list of POP codes to be maintained to be shared during onboarding.

### Send Money via Pesalink (External Transfer)

```php
$ncba = new Ncba();

$response = $ncba->pesalink($apiToken, $beneficiaryAccountNumber, $beneficiaryBankBIC, $beneficiaryName, $amount, $currency, $narration, $senderAccountNumber, $senderCIF, $senderCountry, $transactionID);
```

#### Pesalink payment rules

1. Transaction settled in KES only.
2. Settlement is processed immediately.
3. Payments will be within Kenya only.
4. Minimum payments of KES. 50 or its equivalent in other currency and a maximum of KES. 999,999 or it’s equivalent in other local currency.
5. Payments are settled 24/7-365, including weekends and public holidays.

## Sample Responses

### Successful Transaction Sample Response

```bash
{
   "Response Code":0,
   "Reference":"FTC250124JEQT",
   "Description":"Success"
}
```

### Unsuccessful Transaction Sample Response

```bash
{
    "Response Code":11,
    "Reference":"DUPLICATE | FTC210920APDH",
    "Description":"ERROR"
}
```

### Transaction Status API Response

```php
{
    "Code": "000",
    "Description": "Success",
    "Transaction": {
        "Currency": "KES",
        "Amount": "100",
        "Date": "1/24/2025 12:37:21 PM",
        "AccountNumber": "7810710012",
        "Narrative": "Other",
        "CustomerReference": "250124093719",
        "CBSReference": "FTC250124JEQS",
        "ThirdPartyReference": null,
        "Status": "PASSED",
        "ThirdPartyStatus": null
    }
}
```

### KPLC Postpaid

NCBA offers a two-step API request as follows:

### KPLC postpaid validation

```php
/**
 * ...
 * @param $msisdn - the mobile number attached to the meter
 */
```

```php
$ncba->kplcPostpaidValidation($apiToken, $meterNumber, $msisdn);
```

### KPLC postpaid payment request

```php
$ncba->kplcPostpaid($apiToken, $validationId, $customerName, $meterNumber, $msisdn, $channelRef, $amount, $callbackUrl, $accountNumber, $reason = '');
```

## License

The Laravel NCBA package is open-sourced software licensed under the MIT license. See the LICENSE file for details.
