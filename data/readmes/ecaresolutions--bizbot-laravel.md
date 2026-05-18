# BizBot Laravel Package

A clean, minimal Laravel package to send **WhatsApp** and **SMS** messages via the [BizBot](https://bizbot.one) API.

---

## Requirements

- PHP >= 7.4
- Laravel 9, 10, 11, or 12
- GuzzleHttp 7

---

## Installation

```bash
composer require bizbot/laravel-bizbot
```

Laravel will auto-discover the `BizbotServiceProvider` - no manual registration needed.

### Publish Config (optional)

```bash
php artisan vendor:publish --tag=bizbot-config
```

---

## Configuration

Add these variables to your `.env` file:

```env
# BizBot WhatsApp API
BIZBOT_API_URL=https://api.bizbot.one
BIZBOT_API_KEY=your_bizbot_api_key_here
BIZBOT_CHANNEL_GUID=your_channel_guid_here

# Ecare SMS API
BIZBOT_SMS_BASE_URL=https://send.ecaresms.com
BIZBOT_SMS_SEND_PATH=/api/v3/sms/send
BIZBOT_SMS_HTTP_SEND_PATH=/api/http/sms/send
BIZBOT_SMS_API_TOKEN=your_ecare_sms_api_token_here
BIZBOT_SMS_SENDER_ID=YourSenderId
BIZBOT_SMS_TYPE=plain

# HTTP timeout in seconds (default: 15)
# Applied to both WhatsApp and SMS requests
BIZBOT_TIMEOUT=15

# Optional: SMS-only timeout in seconds (must be > 0)
BIZBOT_SMS_TIMEOUT=30
```

---

## Usage

Resolve `BizbotManager` from the Laravel container:

```php
$bizbot = app(\Bizbot\BizbotManager::class);
```

### Send WhatsApp Message

```php
$result = $bizbot->sendWhatsApp('+8801711111111', 'Your order has been confirmed!');

if ($result['ok']) {
    // Message sent successfully
} else {
    // $result['error'] contains the reason
}
```

### Send SMS

```php
$result = $bizbot->sendSms('+8801711111111', 'Your OTP is 1234');

if ($result['ok']) {
    // SMS sent
} else {
    echo $result['error'];
}
```

### Deliver (WhatsApp with SMS Fallback)

Tries WhatsApp first. If it fails, automatically falls back to SMS.

```php
$result = $bizbot->deliver('+8801711111111', 'Your order #1234 is on the way!');

// $result = [
//   'whatsapp' => true|false,
//   'sms'      => true|false,
//   'success'  => true|false,
//   'errors'   => [],
// ]

if ($result['success']) {
    // At least one channel succeeded
}
```

---

## Use in Controller

```php
use Bizbot\BizbotManager;

class OrderController extends Controller
{
    public function __construct(protected BizbotManager $bizbot) {}

    public function notify(Order $order)
    {
        $phone   = $order->customer_phone;
        $message = "Hi {$order->customer_name}, your order #{$order->id} is confirmed!";

        $result = $this->bizbot->deliver($phone, $message);

        return response()->json($result);
    }
}
```

---

## Phone Number Format

The package automatically handles Bangladesh phone number formats:

| Input              | Normalized      |
|--------------------|-----------------|
| `01711111111`      | `8801711111111` |
| `1711111111`       | `8801711111111` |
| `+8801711111111`   | `8801711111111` |
| `8801711111111`    | `8801711111111` |

---

## SMS Provider

This package uses **Ecare SMS API v3** for SMS delivery.
It sends SMS using:

- Endpoint: `POST /api/v3/sms/send`
- Fallback endpoint (auto on 404): `POST /api/http/sms/send`
- Auth header: `Authorization: Bearer {BIZBOT_SMS_API_TOKEN}`
- Payload fields: `recipient`, `sender_id`, `type`, `message`

---

## Package Structure

```
bizbot-laravel/
|-- src/
|   |-- BizbotServiceProvider.php   <- Laravel service provider
|   |-- BizbotManager.php           <- Main package interface
|   |-- Services/
|   |   |-- WhatsAppService.php     <- WhatsApp sender
|   |   `-- SmsService.php          <- SMS sender
|   `-- Clients/
|       `-- BizbotApiClient.php     <- Guzzle HTTP client
|-- config/
|   `-- bizbot.php                  <- Package config
|-- composer.json
`-- README.md
```

---

## License

MIT (c) [Mostafizur Rahman](https://withfizz.com)
