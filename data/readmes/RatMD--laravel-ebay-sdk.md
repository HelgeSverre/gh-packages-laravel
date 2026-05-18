<p align="center">
    <a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a>
</p>

<p align="center">
    <a href="https://laravel.com" target="_blank">Laravel</a> is an accessible and powerful <a href="http://php.net" target="_blank">PHP</a> web application framework with an expressive and elegant syntax.
</p>

---

# eBay SDK for Laravel

> [!CAUTION]
> This is an **work-in-progress** eBay SDK in an alpha stage. Not all APIs have been fully tested 
> or can be tested due to user, marketplace, country restrictions, or sandbox limitations.
> While the SDK should be usable, breaking changes may occur at any time, including minor releases.

A Laravel SDK for integrating with eBay APIs, featuring OAuth authentication, webhook notifications, 
event handling, and practical utilities for common workflows. The SDK supports both Modern REST APIs 
and Traditional (XML/SOAP) eBay APIs and is designed to evolve alongside eBay’s platform.

- [Documentation Page](https://ebay-sdk.rat.md)
- [OAuth Authorize with eBay](https://ebay-sdk.rat.md/guide/authorize.html)
- [Receive eBay Platform Notifications](https://ebay-sdk.rat.md/guide/webhook.html)
- [Handle Marketplace Account Deletions](https://ebay-sdk.rat.md/guide/marketplace.html)

## Features

- OAuth 2.0 authentication flow (authorization and callback).
- Support for Platform Notifications and Marketplace Account Deletions.
- Optional route and controller integration for OAuth, Marketplace and Webhooks.
- Support for Modern REST APIs and Traditional XML/SOAP APIs (XML-only).
- Dispatches Laravel events for all supported eBay notification types.

## Requirements

- PHP ≥ 8.2
- Laravel ≥ 11 | ≥ 12 | ≥ 13

> [!TIP]
> We strongly recommend a task-scheduling enabled and queue-based Laravel setup to handle
> performance-intensive processes and, most importantly, to process eBay webhook notifications
> in a compliant and reliable manner (See [Configuration](https://ebay-sdk.rat.md/guide/configuration#webhook-configuration)).

## Installation

Install the package via composer:

```bash
composer require rat.md/laravel-ebay-sdk
```

Publish the configuration file with:

```bash
php artisan vendor:publish --tag="ebay-sdk-config"
```

## Basic Usage

[Visit the Documentation Page for more details](https://ebay-sdk.rat.md/guide/start.html#basic-usage)

```php
use Rat\eBaySDK\API\InventoryAPI\InventoryItem\GetInventoryItem;
use Rat\eBaySDK\Client;

$client = new Client();
$client->setRefreshToken($refreshToken);
$response = $client->execute(new GetInventoryItem('MyCustomSKU'));
```

## Testing

To run the test suite, you first need to provide your eBay Sandbox credentials. So, create an 
`.env.testing` file in the package root directory with the following details:

```ini
EBAY_CLIENT_ID='<Your Sandbox Client ID>'
EBAY_CLIENT_SECRET='<Your Sandbox Client Secret>'
EBAY_REDIRECT_URI='<Your Sandbox Redirect URI>'
EBAY_DEV_ID='<Your Sandbox Dev ID>'
EBAY_API_ENVIRONMENT='sandbox'

EBAY_CACHING=false
EBAY_DEBUG=true
EBAY_LOCALE='<Your-Language>'

EBAY_COMPATIBILITY_LEVEL=1395
EBAY_SITE_ID=16
```

If you're unsure about your `EBAY_SITE_ID` refer to [src/Enums/SiteCode.php](src/Enums/SiteCode.php) 
or the official documentation page at [developer.ebay.com](https://developer.ebay.com/devzone/xml/docs/Reference/eBay/types/SiteCodeType.html) 

Install the required composer dependencies using:

```sh
composer install
```

Now, generate a valid and working refresh token using Testbench:

```sh
./vendor/bin/testbench ebay:authorize --testing
```

This will output an authorization URL in the console.

1. Open this URL in your browser
2. Sign in using your Sandbox account (not your production one)
3. Grant access for the requested scopes
4. After successful authorization, you will be redirected to eBay's oAuth page

Once you see the success message, copy the full redirected URL and pass it back to the command (and 
Yes, the quotes matter. Especially on Windows, where everything breaks if you blink wrong.)

```sh
./vendor/bin/testbench ebay:authorize "https://auth2.ebay.com/..." --testing
```

If the `.env.testing` file exists, the command will automatically create or update your 
`PEST_EBAY_REFRESH_TOKEN=<token>`, if not, the token will be printed to the console instead.

Once the refresh token is available, you can run the tests using:

```sh
./vendor/bin/pest
```

## Changelog

We provide an aggregated list of eBay API changes on our [documentation page](https://ebay-sdk.rat.md/changelog/overview.html)
as well as via [RSS feeds](https://ebay-sdk.rat.md/changelog/feeds.html).

For changes specific to this Laravel package, please refer to the [CHANGELOG](CHANGELOG.md).

## License
Published under MIT License \
Copyright © 2024 - 2026 Sam @ rat.md

This software is not an official eBay product and is not associated with, sponsored by, or endorsed 
by eBay Inc.
