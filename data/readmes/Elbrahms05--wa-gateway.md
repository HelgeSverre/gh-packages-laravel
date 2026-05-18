# elbrahms/wa-gateway

[![Latest Version on Packagist](https://img.shields.io/packagist/v/elbrahms/wa-gateway.svg?style=flat-square)](https://packagist.org/packages/elbrahms/wa-gateway)
[![PHP Version Require](https://img.shields.io/packagist/php-v/elbrahms/wa-gateway.svg?style=flat-square)](https://packagist.org/packages/elbrahms/wa-gateway)
[![License](https://img.shields.io/packagist/l/elbrahms/wa-gateway.svg?style=flat-square)](LICENSE.md)

Laravel package for sending WhatsApp messages through the **Whatsms** gateway API.  
Supports text, media, polls, stickers, buttons, lists, locations, vCards, and device/user management.

---

## Requirements

- PHP ≥ 8.1
- Laravel 11 or 12
- A running [Whatsms](https://whatsms.fite-ne.com) gateway instance

---

## Installation

```bash
composer require elbrahms/wa-gateway
```

The service provider and facade are registered automatically via Laravel's package discovery.

Publish the config file:

```bash
php artisan vendor:publish --tag=wa-gateway-config
```

---

## Configuration

Add these variables to your `.env`:

```env
WA_GATEWAY_URL=https://whatsms.fite-ne.com
WA_GATEWAY_API_KEY=your_api_key_here
WA_GATEWAY_SENDER=22799749554
WA_GATEWAY_TIMEOUT=30
WA_GATEWAY_VERIFY_SSL=true
```

---

## Usage

### Via the Facade

```php
use Elbrahms\WaGateway\Facades\WaGateway;

// Send a text message
WaGateway::sendMessage('22799123456', 'Hello from Laravel!');

// Send an image
WaGateway::sendMedia('22799123456', 'image', 'https://example.com/photo.jpg', 'Check this out!');

// Send a document
WaGateway::sendMedia('22799123456', 'document', 'https://example.com/report.pdf');

// Send a poll
WaGateway::sendPoll('22799123456', 'Favourite color?', ['Red', 'Blue', 'Green']);

// Send a sticker
WaGateway::sendSticker('22799123456', 'https://example.com/sticker.webp');

// Send a location
WaGateway::sendLocation('22799123456', '13.5137', '2.1098');

// Send a vCard
WaGateway::sendVcard('22799123456', 'Ibrahim Sidi', '22799000000');

// Check if a number is on WhatsApp
$result = WaGateway::checkNumber('22799123456');
// $result['msg']['exists'] === true
```

### Button Message

```php
WaGateway::sendButton(
    number: '22799123456',
    message: 'How can we help?',
    buttons: [
        ['type' => 'reply',  'displayText' => 'Support'],
        ['type' => 'url',    'displayText' => 'Website', 'url' => 'https://fite-ne.com'],
        ['type' => 'call',   'displayText' => 'Call us', 'phoneNumber' => '22799749554'],
        ['type' => 'copy',   'displayText' => 'Copy code', 'copyCode' => 'PROMO2025'],
    ],
    footer: 'Powered by WaGateway'
);
```

### List Message

```php
WaGateway::sendList(
    number: '22799123456',
    message: 'Choose a department',
    title: 'Our Departments',
    buttonText: 'View list',
    list: ['Sales', 'Support', 'Billing', 'Technical'],
    footer: 'We reply within 24 h'
);
```

### Device Management

```php
// Generate QR code to connect a device
$qr = WaGateway::generateQr('22799749554');
// $qr['qrcode'] is a base64-encoded PNG — display or save it

// Create a new device
WaGateway::createDevice('22799000001', 'https://yourapp.com/webhook');

// Get device information
$info = WaGateway::deviceInfo('22799749554');

// Disconnect a device
WaGateway::disconnectDevice('22799749554');
```

### User Management (admin only)

```php
// Create a user
WaGateway::createUser(
    username: 'newuser',
    password: 'secret123',
    email: 'newuser@example.com',
    expire: 30,
    limitDevice: 5
);

// Get user info
$user = WaGateway::userInfo('newuser');
```

### Dependency Injection

```php
use Elbrahms\WaGateway\WaGateway;

class NotificationService
{
    public function __construct(protected WaGateway $wa) {}

    public function notify(string $phone, string $text): void
    {
        $this->wa->sendMessage($phone, $text);
    }
}
```

### Override Sender Per Call

Every method accepts an optional `$sender` parameter:

```php
WaGateway::sendMessage('22799123456', 'Hello!', sender: '22788868500');
```

---

## Error Handling

All methods throw `Elbrahms\WaGateway\Exceptions\WaGatewayException` on failure:

```php
use Elbrahms\WaGateway\Exceptions\WaGatewayException;

try {
    WaGateway::sendMessage('22799123456', 'Hello!');
} catch (WaGatewayException $e) {
    logger()->error('WaGateway error: ' . $e->getMessage(), $e->getErrors());
}
```

---

## Webhook Payload

When your device receives a message the gateway will `POST` to your webhook URL:

```json
{
  "device": "22799749554",
  "message": "Hello!",
  "from": "22799123456",
  "name": "Contact Name",
  "participant": null,
  "ppUrl": "https://...",
  "media": null
}
```

---

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md).