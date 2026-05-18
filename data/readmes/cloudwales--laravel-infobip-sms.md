# Sends SMS messages through the InfoBip V3 API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cloudwal/laravel-infobip-sms.svg?style=flat-square)](https://packagist.org/packages/cloudwal/laravel-infobip-sms)
[![run-tests](https://github.com/cloudwales/laravel-infobit-sms/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/cloudwales/laravel-infobip-sms/actions/workflows/run-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/cloudwal/laravel-infobip-sms.svg?style=flat-square)](https://packagist.org/packages/cloudwal/laravel-infobip-sms)

This is a very simple package to send sms messages through the InfoBip API.

## Installation

You can install the package via composer:

```bash
composer require cloudwal/laravel-infobip-sms
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-infobip-sms-config"
```

This is the contents of the published config file:

```php
return [
   'debug' => env('INFOBIP_DEBUG', true),
    'sender' => env('INFOBIP_SENDER', 'Laravel'),
    'from' => env('INFOBIP_FROM_NUMBER', '0123456789'),
    'username' => env('INFOBIP_USERNAME', 'user'),
    'password' => env('INFOBIP_PASSWORD', '123456'),
    'host' => env('INFOBIP_HOST', 'https://test.api.infobip.com'),
];
```

## Usage

```php
use CloudWales\LaravelInfobitSms\LaravelInfobipSms;

$response = new LaravelInfobipSms();

// Send an SMS
return $response->sendSms(['0123456789', '12345678901'], 'Test SMS message');

// Send WhatsApp Message
return $response->sendWhatsApp('0123456789', 'Test WhatsApp message');

// Get the delivery report of the message
return $response->getMessageReport($response['bulkId']);

```

## Testing

```bash
composer test
```

## Upcoming


## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.


## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Cloud Wales](https://www.cloud-wales.co.uk)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
