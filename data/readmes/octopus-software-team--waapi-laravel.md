# WAAPI Laravel Package

![WAAPI Logo](assets/cover.jpg)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/octopusteam/waapi-laravel.svg?style=flat-square)](https://packagist.org/packages/octopusteam/waapi-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/octopusteam/waapi-laravel.svg?style=flat-square)](https://packagist.org/packages/octopusteam/waapi-laravel)
[![License](https://img.shields.io/packagist/l/octopusteam/waapi-laravel.svg?style=flat-square)](https://packagist.org/packages/octopusteam/waapi-laravel)

This package provides a simple and expressive API for interacting with the WAAPI (WhatsApp API) service within a Laravel application.

## Features

- Send text messages, media, templates, stickers, voice notes, locations, and contacts.
- Fluent and expressive API.
- Automatic webhook route registration.
- **New** `WebhookReceived` event for incoming data.
- Integration with Webhook.site for easy debugging.
- Artisan command to renew Webhook.site token.

## Installation

```bash
composer require octopusteam/waapi-laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="OctopusTeam\Waapi\WaapiServiceProvider"
```

This will create a `config/waapi.php` file in your application.

## Configuration

Update your `.env` file with your WAAPI credentials:

```
WAAPI_APP_URL=https://waapi.octopusteam.net/api/create-message
WAAPI_APP_KEY=your_app_key
WAAPI_AUTH_KEY=your_auth_key
WAAPI_WEBHOOK_SITE_TOKEN=your_webhook_site_token
WAAPI_UPDATE_DEVICE_WEBHOOK=your_device_uuid_for_webhook_update
```

## Usage

### Sending Messages

You can send messages using the `Waapi` facade or by injecting the `Waapi` class.

```php
use OctopusTeam\Waapi\Facades\Waapi;

// Send a simple text message
Waapi::sendMessage('201xxxxxxxxx', 'Hello, world!');

// Send an OTP with custom message
$otp = Waapi::generateOtp();
Waapi::sendOtp('201xxxxxxxxx', $otp, false, false, ":otp is your verification code.");

// Send Media (File)
Waapi::sendMedia('201xxxxxxxxx', 'Here is your invoice', 'https://example.com/invoice.pdf');

// Send Template
Waapi::sendTemplate('201xxxxxxxxx', 'template_id', [
    'variables[{1}]' => 'Value 1',
    'variables[{2}]' => 'Value 2'
]);

// Send Sticker
Waapi::sendSticker('201xxxxxxxxx', 'https://example.com/sticker.webp');

// Send Voice Note
Waapi::sendVoice('201xxxxxxxxx', 'https://example.com/voice.mp3');

// Send Location
Waapi::sendLocation('201xxxxxxxxx', '30.0444', '31.2357');

// Send Contact
Waapi::sendContact('201xxxxxxxxx', 'John Doe', '201xxxxxxxxx', 'Octopus Team');
```

### Device Status & QR Code

```php
// Get Device Status
$status = Waapi::getDeviceStatus('device_id');

// Get QR Code
$qr = Waapi::getQrCode('device_id');
```

### Webhook Handling

The package can automatically register a webhook route to handle incoming data from WAAPI. To enable this, ensure the following is in your `config/waapi.php`:

```php
'webhook' => [
    'enabled' => true,
    'auto_register' => true,
],
```

By default, the route is `POST /api/webhook/whatsapp`.

#### Events

When a webhook is received, the package fires the `OctopusTeam\Waapi\Events\WebhookReceived` event. You can listen to this event in your application's `EventServiceProvider`.

```php
use OctopusTeam\Waapi\Events\WebhookReceived;

protected $listen = [
    WebhookReceived::class => [
        SendEmailNotification::class,
    ],
];
```

The event contains the webhook data in the `$data` property.

### Webhook.site Integration

For development and debugging, you can use the Webhook.site integration to inspect incoming webhook data.

```php
// Get the last 50 requests from Webhook.site
$data = Waapi::getWebhookSiteData(50);

// Get the decoded content from the last 50 requests
$content = Waapi::getWebhookSiteContent(50);

// Get a specific request by its ID
$request = Waapi::getWebhookSiteRequest('request-uuid');
```

### Artisan Command

To renew your `webhook.site` token automatically, you can run the following Artisan command. This will generate a new token, update your `.env` file, and update the webhook URL via the WAAPI service.

```bash
php artisan waapi:webhook-renew
```
