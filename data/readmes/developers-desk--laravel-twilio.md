# Laravel Twilio

A clean, Laravel-idiomatic Twilio integration package for SMS and WhatsApp (template-based) messaging.

Designed with proper separation of concerns, a stable public API, and future extensibility in mind.

## Features
- Send SMS using Twilio API
- Send WhatsApp template messages (ContentSid based)
- Facade-based API (Twilio::sms(), Twilio::whatsapp())
- Clean architecture (Service → Client → Resource)
- Laravel 9 / 10 / 11 / 12 compatible
- Configurable via .env or published config
- Testable (fixtures + HTTP fakes)

## Installation
Install via Composer

```bash
composer require developers-desk/laravel-twilio
```

Configuration
Publish config (optional)
```
php artisan vendor:publish --tag=twilio-config
```
This will publish:
```
config/twilio.php
```
Publishing is optional.
If not published, values are read directly from environment variables.
.env
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM=1234567890
TWILIO_FROM_WHATSAPP=1234567890
```
<b>Do not rename config keys.</b>
Only change values. Renaming keys will break the package.

## Usage
Send SMS
```
use DevelopersDesk\LaravelTwilio\Facades\Twilio;

Twilio::sms(
    "+919999999999",
    "Hello from Laravel Twilio"
);
```
Send WhatsApp Template Message

Twilio WhatsApp requires templates (ContentSid) for business-initiated messages.
```
use DevelopersDesk\LaravelTwilio\Facades\Twilio;

Twilio::whatsapp(
    "+919999999999",
    "HXxxxxxxxxxxxxx",
    [
        "1" => "John",
        "2" => "17-January-2026",
        "3" => "20-January-2026",
    ]
);
```
- ContentVariables are automatically JSON-encoded
- whatsapp: prefix is handled internally
- Free-form WhatsApp messages are not supported by default

## Architecture Overview
This package follows a clean Laravel package architecture:
```
Facade (public API)
   ↓
Service (use-cases)
   ↓
HTTP Client (Twilio transport)
   ↓
Resource (request definition)
```

Why this matters
- Easy to extend (Verify, Voice, WhatsApp session messages)
- Easy to test (HTTP layer isolated)
- No framework leakage into core logic
- Clear responsibilities

## Testing
- Tests include:
- Fixture-based tests
- HTTP-fake-friendly design
- Optional live credential testing for manual verification

Run tests:
```
vendor/bin/phpunit
```
Live Twilio credentials should be used only for manual smoke testing, not CI.

WhatsApp Notes (Important)
- WhatsApp template messages only
- Requires approved ContentSid
- Free-form messages depend on session state and are intentionally not exposed
- This avoids unreliable behavior and production issues

## Roadmap
- WhatsApp session-based messages (explicit API)
- Twilio Verify (OTP)
- Message status lookup
- Retry & failure handling
- Laravel Notification channel

## Maintainer Notes
- Facade aliases are auto-discovered
- Config keys are treated as public API
- No business logic in Service Providers
- Designed for long-term maintenance, not demos

## License <br>
MIT © Chandni Soni