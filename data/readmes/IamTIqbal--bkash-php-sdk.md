# bKash PHP SDK & Laravel Package (Unofficial)

⚠️ Disclaimer  
This is an unofficial community-driven integration for bKash Tokenized Checkout.  
This project is not affiliated with or endorsed by bKash or Bangladesh Bank.

> **Developer:** [Tamim Iqbal](https://tamimiqbal.com) — IT Manager & AI Developer

A PHP SDK and Laravel package for **bKash Tokenized Checkout** (Bangladesh). Easily integrate bKash payments in any PHP or Laravel application.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Initiate Payment](#initiate-payment)
  - [Handle Callback](#handle-callback)
  - [Check Transaction Status](#check-transaction-status)
  - [Utilities](#utilities)
- [Payment Flow](#payment-flow)
- [Status Codes](#status-codes)
- [Gotchas & Troubleshooting](#gotchas--troubleshooting)
- [Security Notes](#security-notes)
- [Testing](#testing)
- [License](#license)

## Features

- Unofficial bKash gateway for PHP & Laravel
- Secure API communication with bKash Tokenized Checkout
- Redirect-based payment flow with callback handling
- Example usage for both plain PHP and Laravel

## Requirements

- PHP 7.4+ with cURL enabled
- For Laravel: Laravel 8+ (recommended)

## Installation

### Composer

```
composer require iamtiqbal/bkash-php-sdk
```

### Manual Installation

1. Download or clone this repository:
   ```
   git clone https://github.com/IamTIqbal/bkash-php-sdk.git
   ```
2. Copy the `src/` folder into your project.
3. (For Laravel) Copy `config/bkash.php` to your config directory.
4. (For plain PHP) Copy `examples/php-config.php` and update with your credentials.
5. Require the classes in your code:
   ```php
   require_once '/path/to/src/BkashClient.php';
   ```
6. Follow the usage examples in the README or `examples/` folder.

## Quick Start

- Configure your credentials (see config/bkash.php or examples/php-config.php)
- Initiate a payment using the SDK
- Redirect user to bKash
- Handle callback for payment confirmation

## API Reference

### Authentication

Authenticate using your bKash Tokenized Checkout credentials. See `BkashClient::getIdToken()`.

### Initiate Payment

Create a payment and get the redirect URL. See `BkashClient::createPayment()`.

### Handle Callback

Handle the callback from bKash and execute the payment. See `BkashClient::executePayment()`.

### Check Transaction Status

Handled by `executePayment` during callback. Inspect the returned data for transaction status.

### Utilities

- Invoice generation (see examples)
- Payment metadata (extend as needed)

## Payment Flow

1. Customer initiates checkout
2. SDK authenticates and creates payment
3. Customer is redirected to bKash
4. bKash redirects to your callback URL
5. SDK executes payment and confirms status

## Status Codes

- `Completed` = Success
- Other = Failed/Cancelled

## Gotchas & Troubleshooting

- Store currency must be **BDT**
- Use correct credentials (test vs production)
- Ensure SSL is enabled for callback URL

## Security Notes

- Never hardcode credentials in code
- Use HTTPS for all callbacks and checkout pages

## Testing

- Use bKash sandbox credentials for testing
- Test full payment flow (initiate, redirect, callback)

## License

MIT License. See LICENSE file for details.
