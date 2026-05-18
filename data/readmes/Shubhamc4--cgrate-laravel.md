# CGrate Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/shubhamc4/cgrate-laravel.svg)](https://packagist.org/packages/shubhamc4/cgrate-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/shubhamc4/cgrate-laravel.svg)](https://packagist.org/packages/shubhamc4/cgrate-laravel)
[![License](https://img.shields.io/packagist/l/shubhamc4/cgrate-laravel.svg)](https://github.com/shubhamc4/cgrate-laravel/blob/main/LICENSE)

A Laravel package for integrating with the CGrate payment service to process mobile money transactions in Zambia. This package provides a seamless Laravel wrapper around the [cgrate-php](https://github.com/Shubhamc4/cgrate-php) core package.

## Table of Contents

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Soap Methods](#available-soap-methods)
- [Available Static Helper Methods](#available-static-helper-methods)
- [Usage](#usage)
  - [Check Account Balance](#check-account-balance)
  - [Get Available Cash Deposit Issuers](#get-available-cash-deposit-issuers)
  - [Process Customer Payment](#process-customer-payment)
  - [Query Customer Payment](#query-customer-payment)
  - [Process Cash Deposit](#process-cash-deposit)
  - [Generate Transaction Reference](#generate-transaction-reference)
  - [Get Customer Account Issuer Name](#get-customer-issuer-name)
- [Events](#events)
- [Data Transfer Objects](#data-transfer-objects)
- [Artisan Commands](#artisan-commands)
- [Core PHP Package](#core-php-package)
- [Changelog](#changelog)
- [Credits](#credits)
- [License](#license)

## Introduction

[CGrate](https://cgrate.co.zm) ([543 Konse Konse](https://www.543.co.zm)) is a payment service provider based in Zambia that facilitates mobile money transactions. This Laravel package allows businesses to:

- Process payments from mobile money accounts
- Check account balances in real-time
- Verify transaction status
- Reverse/refund payments when necessary

The service operates via a SOAP API that requires WS-Security authentication. CGrate is widely used for integrating with local payment systems in Zambia, making it easier for businesses to accept mobile payments from customers.

For more information about CGrate payment service, visit their [official website](https://cgrate.co.zm) or contact their support team at support@cgrate.co.zm.

### Official Documentation

For detailed information on the CGrate SOAP API, including setup instructions, request formats, and response codes, please refer to the official [EVDSpec 2024.pdf](./docs/EVDSpec_2024.pdf) document. This comprehensive guide provides all the technical specifications required for integrating with the CGrate service.

## Requirements

- PHP 8.2 or higher
- Laravel 11.0 or higher
- PHP SOAP extension

## Installation

You can install the package via composer:

```bash
composer require shubhamc4/cgrate-laravel
```

The package will automatically register its service provider and facade through Laravel's package auto-discovery feature.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="CGrate\Laravel\CGrateServiceProvider"
```

This will create a `config/cgrate.php` configuration file in your application where you can modify the settings.

### Environment Variables

The package requires the following environment variables to be set in your `.env` file:

```env
# Required variables
CGRATE_USERNAME=your_username           # Your CGrate account username
CGRATE_PASSWORD=your_password           # Your CGrate account password

# Optional variables (with defaults)
CGRATE_TEST_MODE=true                   # Set to false for production
```

## Available Soap Methods

| Method                                               | Description                            |
| ---------------------------------------------------- | -------------------------------------- |
| `getAccountBalance()`                                | Get the account balance                |
| `getAvailableCashDepositIssuers()`                   | Get Available Cash Deposit Issuers     |
| `processCustomerPayment(PaymentRequestDTO $payment)` | Process a new customer payment         |
| `queryCustomerPayment(string $transactionReference)` | Check the status of a customer payment |
| `processCashDeposit(string $paymentReference)`       | Process Cash Deposit                   |

## Available Static Helper Methods

| Method                                                | Description                             |
| ----------------------------------------------------- | --------------------------------------- |
| `generateTransactionReference(string $prefix = 'CG')` | Generate a unique transaction reference |
| `getCustomerIssuerName(string $customerAccount)`      | Get Customer Account Issuer Name        |

## Usage

### Getting Account Balance

```php
use CGrate\Laravel\Facades\CGrate;

// Get account balance
try {
    $response = CGrate::getAccountBalance();

    if ($response->isSuccessful()) {
        echo 'Account Balance: ' . $response->balance;
    } else {
        echo 'Error: ' . $response->responseMessage;
    }
} catch (\CGrate\Php\Exceptions\CGrateException $e) {
    echo 'API Error: ' . $e->getMessage();
}
```

### Get Available Cash Deposit Issuers

```php
use CGrate\Laravel\Facades\CGrate;

try {
    $response = CGrate::getAvailableCashDepositIssuers();
    print_r($response);
} catch (\CGrate\Php\Exceptions\CGrateException $e) {
    echo "Exception: " . $e->getMessage();
}
```

### Processing a Payment

```php
use CGrate\Php\DTOs\PaymentRequestDTO;
use CGrate\Laravel\Facades\CGrate;

// Create a payment request
$payment = new PaymentRequestDTO(
    transactionAmount: 10.50,
    customerMobile: '260970000000', // Zambian mobile number format (without the + sign)
    paymentReference: 'INVOICE-123'
);

// Or use the factory method for convenience
$payment = PaymentRequestDTO::create(
    transactionAmount: 10.50,
    customerMobile: '260970000000',
    paymentReference: 'INVOICE-123'
);

// Process the payment
try {
    $response = CGrate::processCustomerPayment($payment);

    if ($response->isSuccessful()) {
        echo 'Payment successful! Payment ID: ' . $response->paymentID;
    } else {
        echo 'Payment failed: ' . $response->responseMessage;
    }
} catch (\CGrate\Php\Exceptions\ValidationException $e) {
    echo 'Validation Error: ' . $e->getMessage();
    foreach ($e->errors() as $field => $errors) {
        echo "\n- {$field}: " . implode(', ', $errors);
    }
} catch (\CGrate\Php\Exceptions\CGrateException $e) {
    echo 'API Error: ' . $e->getMessage();
}
```

### Query Customer Payment

```php
use CGrate\Laravel\Facades\CGrate;

// Query transaction status
try {
    $response = CGrate::queryCustomerPayment('INVOICE-123');

    if ($response->isSuccessful()) {
        echo 'Transaction reference: ' . $response->transactionReference;
    } else {
        echo 'Status query failed: ' . $response->responseMessage;
    }
} catch (\CGrate\Php\Exceptions\CGrateException $e) {
    echo 'API Error: ' . $e->getMessage();
}
```

### Process Cash Deposit

```php
use CGrate\Php\DTOs\CashDepositRequestDTO;
use CGrate\Laravel\Facades\CGrate;

$customerAccount = '260970000000';  // Customer account number

// Create a cash deposit request
$cashDeposit = new CashDepositRequestDTO(
    transactionAmount: 10.50,
    customerAccount: $customerAccount,
    issuerName: CGrate::getCustomerIssuerName($customerAccount),
    depositorReference: 'INVOICE-123'
);

// Or use the factory method for convenience
$cashDeposit = CashDepositRequestDTO::create(
    transactionAmount: 10.50,
    customerAccount: $customerAccount,
    issuerName: CGrate::getCustomerIssuerName($customerAccount),
    depositorReference: 'INVOICE-123'
);

try {
    $response = CGrate::processCashDeposit($cashDeposit);

    if ($response->isSuccessful()) {
        echo "Depositor reference: " . $response->depositorReference;
    } else {
        echo "Cash deposit failed: " . $response->responseMessage;
    }
} catch (\CGrate\Php\Exceptions\CGrateException $e) {
    echo "Exception: " . $e->getMessage();
}
```

## Events

The package includes following events that you can dispatch and listen for in your application:

| Event              | Description                                     | Properties                                                                                                                           |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PaymentProcessed` | Dispatch this when a payment is successful      | `response` (PaymentResponseDTO), `paymentData` (array)                                                                               |
| `PaymentFailed`    | Dispatch this when a payment fails              | `request` (PaymentRequestDTO), `errorMessage` (string), `responseCode` (ResponseCode or null), `exception` (CGrateException or null) |
| `CashDeposit`      | Dispatch this when a cash deposit is successful | `response` (CashDepositResponse), `cashDepositData` (array)                                                                          |

## Data Transfer Objects

The package uses DTOs to handle API requests and responses:

### Request DTOs

- `PaymentRequestDTO`: Contains payment request data (transactionAmount, customerMobile, paymentReference)

### Response DTOs

- `BalanceResponseDTO`: Contains account balance information
- `PaymentResponseDTO`: Contains payment response information
- `CashDepositResponse`: Contains payment reversal response information

## Artisan Commands

The package provides the following Artisan commands:

```bash
php artisan cgrate:balance
```

This command will check your account balance and display it in the console.

## Core PHP Package

This Laravel package is a wrapper around the [cgrate-php](https://github.com/Shubhamc4/cgrate-php) core package. The core package handles all the low-level SOAP API interactions, request validation, and response parsing.

If you need to use CGrate with a non-Laravel PHP application, you can use the core package directly. See the [cgrate-php repository](https://github.com/Shubhamc4/cgrate-php) for documentation on direct usage.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Shubham Chaudhary](https://github.com/shubhamc4)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
