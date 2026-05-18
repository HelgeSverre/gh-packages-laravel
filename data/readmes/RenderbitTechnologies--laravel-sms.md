# Laravel SMS

[![Tests](https://github.com/RenderbitTechnologies/laravel-sms/actions/workflows/tests.yml/badge.svg)](https://github.com/RenderbitTechnologies/laravel-sms/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/renderbit/laravel-sms.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-sms)
[![PHP Version](https://img.shields.io/packagist/php-v/renderbit/laravel-sms.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-sms)
[![License](https://img.shields.io/packagist/l/renderbit/laravel-sms.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-sms)

A Laravel package to send transactional SMS messages through supported SMS gateways. Built with simplicity, scalability, and performance in mind.

## 🚀 Features

* Simple API to send SMS
* Support for multiple providers (via api-based architecture)
* Queue-friendly and retry-safe
* Customizable sender name and API URL
* Laravel-native configuration and logging
* Facade & dependency injection support

## 📦 Installation

Install via Composer:

```bash
composer require renderbit/laravel-sms
```

## 🛠 Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=sms-config
```

This will publish `config/sms.php`.

Example `config/sms.php`:

```php
return return [
    'url' => env('SMS_API_URL', '<default-preconfigured-url>'),
    'query_params' => [
        'user' => env('SMS_USER'),
        'password' => env('SMS_PASSWORD'),
        'senderid' => env('SMS_SENDER_ID', 'IEMUEM'),
        'channel' => 'trans',
        'DCS' => 0,
        'flashsms' => 0,
        'route' => '1'
    ],
    'number_field' => env('SMS_NUMBER_FIELD', 'number'),
    'message_field' => env('SMS_MESSAGE_FIELD', 'text'),
];;
```

Update your `.env` file:

```env
SMS_USER=
SMS_PASSWORD=
SMS_SENDER_ID='IEMUEM'
SMS_API_URL='http://1.1.1.1/api/SendSMS?'
SMS_NUMBER_FIELD='number'
SMS_MESSAGE_FIELD='text'
```

## ✉️ Usage

You can send an SMS using the facade or the `SmsClient` class:

### Using Facade

```php
use Sms;

Sms::send('+919999999999', 'Hello, your OTP is 123456');
```

### Using Dependency Injection

```php
use Renderbit\Sms\SmsClient;

class NotificationService
{
    public function __construct(protected SmsClient $sms) {}

    public function notify($phone, $message)
    {
        $this->sms->send($phone, $message);
    }
}
```

## ✅ Example Response Handling

The `send` method returns a `bool`:

```php
$success = Sms::send($phoneNumber, $message);

if (!$success) {
    // Log failure or retry
}
```

## 🧪 Testing

To fake SMS sending during tests:

```php
Sms::shouldReceive('send')
    ->once()
    ->with('+919999999999', 'Test message')
    ->andReturn(true);
```

## 📁 Directory Structure (Core)

* `SmsClient`: Main entry point, handles sms sending logic.
* `Facades\Sms`: Facade accessor for SmsClient class.
* `config\sms`: Default configs that can be overridden after publishing.
* `SmsServiceProvider`: Auto-discovery and binding.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).
