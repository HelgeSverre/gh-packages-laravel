# Laravel SMS (`banulakwin/laravel-sms`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/laravel-sms.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-sms)
[![Tests](https://github.com/banulalakwindu/laravel-sms/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/laravel-sms/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/laravel-sms.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-sms)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Portable Laravel SMS package with multi-provider driver architecture. Currently supports **TextLK** with scheduled message support.

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`

---

## Installation

```bash
composer require banulakwin/laravel-sms
php artisan vendor:publish --tag=sms-config
```

---

## Configuration

Add these environment variables to your `.env`:

```env
SMS_DRIVER=textlk
TEXTLK_SMS_API_KEY=your_api_key_here
TEXTLK_SMS_SENDER_ID=YourName
```

---

## Usage

### Send SMS

```php
use Banulakwin\Sms\DTOs\SendSmsRequest;

// Send to a single recipient (uses default driver)
$response = sms()->send(new SendSmsRequest(
    recipients: ['94712345678'],
    message: 'Your OTP is 1234',
));

// Send to multiple recipients
$response = sms()->send(new SendSmsRequest(
    recipients: ['94712345678', '94771234567', '94701234567'],
    message: 'Bulk notification message',
));

// Override sender ID per-request
$response = sms()->send(new SendSmsRequest(
    recipients: ['94712345678'],
    message: 'Hello!',
    senderId: 'CustomName',
));
```

### Schedule SMS

```php
$response = sms()->schedule(
    new SendSmsRequest(
        recipients: ['94712345678'],
        message: 'Happy Birthday!',
    ),
    scheduleTime: '2025-12-25 10:00',
);
```

### Explicit Driver Selection

```php
$response = sms()->driver('textlk')->send(new SendSmsRequest(
    recipients: ['94712345678'],
    message: 'Hello via TextLK!',
));
```

### Response Handling

```php
if ($response->success) {
    echo "Sent! Cost: {$response->cost}";
    echo "Status: {$response->status->value}"; // 'sent', 'scheduled', 'failed'
} else {
    echo "Failed: {$response->message}";
}

// Access raw provider response
$rawData = $response->raw;
```

---

## Features

- Multi-provider driver architecture (TextLK included).
- Sri Lankan phone number normalization (94XXXXXXXXX format).
- Scheduled SMS delivery support.
- DTO-based request/response for type safety.
- Global `sms()` helper function.
- Configurable provider registration.
- Comprehensive logging for debugging.

---

## Phone Number Normalization

The TextLK provider automatically normalizes phone numbers to the Sri Lankan format:

| Input | Output |
|-------|--------|
| `94712345678` | `94712345678` |
| `0712345678` | `94712345678` |
| `+94712345678` | `94712345678` |
| `712345678` | `94712345678` |

Non-Sri-Lankan numbers are skipped and logged.

---

## Testing

```bash
composer test          # Run PHPUnit
composer pint          # Fix code style
composer phpstan       # Static analysis
composer quality       # Run all (pint + phpstan + test)
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Run `composer quality` to ensure tests and style pass
4. Commit and push
5. Open a pull request

---

## Package layout (reference)

```
src/
  SmsServiceProvider.php
  helpers.php
  Contracts/
    SmsProviderInterface.php
  DTOs/
    SendSmsRequest.php
    SendSmsResponse.php
  Enums/
    SmsProvider.php
    SmsStatus.php
  Exceptions/
    SmsException.php
  Managers/
    SmsManager.php
  Providers/
    TextLk/
      TextLkSmsProvider.php
config/
  sms.php
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
