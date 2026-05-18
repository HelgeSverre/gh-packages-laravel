# Laravel Ercaspay

A Laravel package for seamless integration with the Ercaspay payment gateway API.

[![License](https://img.shields.io/github/license/decodeblock/laravel-ercaspay.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/decodeblock/laravel-ercaspay.svg?style=flat-square)](https://packagist.org/packages/decodeblock/laravel-ercaspay)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/decodeblock/laravel-ercaspay/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/decodeblock/laravel-ercaspay/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Code Style Status](https://img.shields.io/github/actions/workflow/status/decodeblock/laravel-ercaspay/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/decodeblock/laravel-ercaspay/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/decodeblock/laravel-ercaspay.svg?style=flat-square)](https://packagist.org/packages/decodeblock/laravel-ercaspay)
[![Contributors](https://img.shields.io/github/contributors/decodeblock/laravel-ercaspay.svg?style=flat-square)](https://github.com/decodeblock/laravel-ercaspay/graphs/contributors)
[![PHP Version Support](https://img.shields.io/packagist/php-v/decodeblock/laravel-ercaspay.svg?style=flat-square)](https://www.php.net/)

## Features

-   Easy integration with Ercaspay payment gateway API
-   Support for multiple payment methods
-   Payment verification
-   Comprehensive error handling

## Requirements

-   PHP 8.3 or higher
-   Laravel 9.0 or higher
-   You need to reference the Ercaspay API documentation. [Click here for the documentation](https://docs.ercaspay.com/#2f601f17-0bde-44ba-971a-f8458cadb213)

## Installation

Install the package via composer:

```bash
composer require decodeblock/laravel-ercaspay
```

## Configuration

1. Publish the config file:

    ```bash
    php artisan vendor:publish --tag="ercaspay-config"
    ```

2. Add your Ercaspay credentials to your .env file:

    ```
    ERCASPAY_PUBLIC_KEY=your_public_key
    ERCASPAY_SECRET_KEY=your_secret_key
    ```

## Usage Example

Here are some examples of how to use this package:

### Generate Payment Reference UUID

```php
use Decodeblock\Ercaspay;

$ercaspay = new Ercaspay();
$referenceUuid = $ercaspay->generatePaymentReferenceUuid();
echo "Generated Reference UUID: " . $referenceUuid;
```

### Initiate a Transaction

```php
use Decodeblock\Ercaspay;

$ercaspay = new Ercaspay();
$referenceUuid = $ercaspay->generatePaymentReferenceUuid();
$response = $ercaspay->initiateTransaction([
    'paymentReference' => $referenceUuid,
    'amount' => 2000,
    'currency' => 'NGN',
    'description' => 'Payment for services',
    'paymentMethods' => 'card, bank-transfer',
    'customerName' => 'John Doe',
    'customerEmail' => 'john@example.com',
]);

print_r($response);

echo "Request status is: " . $response['responseMessage']

```

### Verify a Transaction

```php
$response = $ercaspay->verifyTransaction('transaction_reference');

print_r($response);
```

### Initiate a Bank Transfer

```php
$response = $ercaspay->initiateBankTransfer('transaction_reference');

print_r($response);
```

### Initiate a Card Transaction

```php
$transactionRef = 'TEST-REF-'.time();
$cardNumber = '4111111111111111';
$cardExpiryMonth = '12';
$cardExpiryYear = '25';
$cardCvv = '123';
$pin = '1234';

$response = $this->ercaspay->initiateCardTransaction(
    $request,
    $transactionRef,
    $cardNumber,
    $cardExpiryMonth,
    $cardExpiryYear,
    $cardCvv,
    $pin
);

print_r($response);
```

## Available Methods

Below are all the methods available in the package:

```php
/**
 * Initiates a new payment transaction
 *
 * @param array $data Transaction details including amount, reference etc
 * @return array Ercaspay API Response
 */
public function initiateTransaction(array $data): array
```

```php
/**
 * Verifies the status of a transaction
 *
 * @param string $transactionRef Transaction reference to verify
 * @return array Ercaspay API Response
 */
public function verifyTransaction(string $transactionRef): array
```

```php
/**
 * Initiates a bank transfer payment
 *
 * @param string $transactionRef Transaction reference
 * @return array Ercaspay API Response
 */
public function initiateBankTransfer(string $transactionRef): array
```

```php
/**
 * Initiates a USSD payment transaction
 *
 * @param string $transactionRef Transaction reference
 * @param string $bankName Name of bank for USSD
 * @return array Ercaspay API Response
 */
public function initiateUssdTransaction(string $transactionRef, string $bankName): array
```

```php
/**
     * Initiates a card payment transaction
     *
     * @param  Request  $request  HTTP request object
     * @param  string  $transactionRef  Transaction reference
     * @param  string  $cardNumber  Card number
     * @param  string  $cardExpiryMonth  Card expiry month
     * @param  string  $cardExpiryYear  Card expiry year
     * @param  string  $cardCvv  Card CVV code
     * @param  string  $pin  Card PIN
     * @return array Ercaspay API Response
     */
    public function initiateCardTransaction(Request $request, string $transactionRef, string $cardNumber, string $cardExpiryMonth, string $cardExpiryYear, string $cardCvv, string $pin): array
```

```php
/**
 * Gets list of banks that support USSD payments
 *
 * @return array Ercaspay API Response
 */
public function getBankListForUssd(): array
```

```php
/**
 * Generates a unique payment reference ID
 *
 * @return string UUID for payment reference
 */
public function generatePaymentReferenceUuid(): string
```

```php
/**
 * Fetches details for a transaction
 *
 * @param string $transactionRef Transaction reference
 * @return array Ercaspay API Response
 */
public function fetchTransactionDetails(string $transactionRef): array
```

```php
/**
 * Checks the current status of a transaction
 *
 * @param string $transactionRef Transaction reference
 * @param string $paymentReference Payment reference
 * @param string $paymentMethod Payment method used
 * @return array Ercaspay API Response
 */
public function fetchTransactionStatus(string $transactionRef, string $paymentReference, string $paymentMethod): array
```

```php
/**
 * Cancels a transaction
 *
 * @param string $transactionRef Transaction reference to cancel
 * @return array Ercaspay API Response
 */
public function cancelTransaction(string $transactionRef): array
```

To provide clear and helpful information about the exceptions in your README, you can include a dedicated section about error handling and exception types. This section should describe the different exceptions that developers may encounter while using your package, their causes, and how to handle them.

Here's a sample section you can include in your `README.md`:

---

## Error Handling and Exceptions

Your package may throw different types of exceptions based on the outcomes of HTTP requests made to the Ercaspay API. Below is a list of the key exceptions you should be aware of when integrating and working with this package:

### 1. `ErcaspayRequestException`

**Thrown when:**

-   There is an issue with the request, such as a failure in communication or missing parameters.
-   The error message is user-defined and includes detailed context from the API.

**Usage Example:**

```php
use YourPackage\Exceptions\ErcaspayRequestException;

try {
    // API call
} catch (ErcaspayRequestException $e) {
    // Access the error message
    echo $e->getMessage();

    // Access additional error data
    print_r($e->getResponse());
}
```

**What You Can Expect:**

-   `getMessage()` – Returns a description of the error (e.g., "Request failed").
-   `getCode()` – Provides the error code (could be an HTTP status code or `0` for network-related errors).
-   `getResponse()` – Returns additional data provided by the API or error context.

---

### 2. `ErcaspayClientErrorException`

**Thrown when:**

-   The API responds with a client-side error (HTTP status code 4xx).
-   This exception is thrown when a request is malformed or contains invalid parameters.

**Usage Example:**

```php
use YourPackage\Exceptions\ErcaspayClientErrorException;

try {
    // API call
} catch (ErcaspayClientErrorException $e) {
    // Log or handle the 4xx error appropriately
    echo $e->getMessage();

    // Access additional error data
    print_r($e->getResponse());
}
```

**What You Can Expect:**

-   Contains the same methods as `ErcaspayRequestException`.
-   Additional information about client-side issues, such as invalid parameters or incorrect input.

---

### 3. `ErcaspayServerErrorException`

**Thrown when:**

-   The API responds with a server-side error (HTTP status code 5xx).
-   This exception is used when something goes wrong on the server, such as a server crash or unavailable service.

**Usage Example:**

```php
use YourPackage\Exceptions\ErcaspayServerErrorException;

try {
    // API call
} catch (ErcaspayServerErrorException $e) {
    // Handle server-side issues, possibly by retrying or reporting to the support team
    echo $e->getMessage();

    // Access additional error data
    print_r($e->getResponse());
}
```

**What You Can Expect:**

-   Same structure as the other exceptions but specifically for server-related issues.
-   Contains error data related to server failures.

## Logging

This package provides logging capabilities to help you monitor and troubleshoot API interactions and errors. By default, important information about API requests, responses, and exceptions is logged, which can be useful for debugging and keeping track of system behavior.

### What is Logged?

The package logs the following information:

#### 1. API Request Details:

-   URL of the API endpoint
-   HTTP method (GET, POST, etc.)

#### 2. API Response Details:

-   HTTP status code of the response
-   Response body (if available)
-   Error messages (for failed requests)

#### 3. Exceptions:

-   Details of exceptions, including client and server errors
-   Stack trace and error context for easier debugging

## Changelog

Detailed changes for each release are documented in the [CHANGELOG](CHANGELOG.md).

## Contributing

We welcome contributions! Please see the [CONTRIBUTING](CONTRIBUTING.md) guide for details.

## Credits

-   **[Gabriel Ibenye](https://github.com/gabbyti)**
-   [All Contributors](../../contributors)

## License

This package is licensed under the [MIT License](LICENSE.md).
