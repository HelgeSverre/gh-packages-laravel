# Laravel WhatsApp

[![Latest Version on Packagist](https://img.shields.io/packagist/v/laraditz/whatsapp.svg?style=flat-square)](https://packagist.org/packages/laraditz/whatsapp)
[![Total Downloads](https://img.shields.io/packagist/dt/laraditz/whatsapp.svg?style=flat-square)](https://packagist.org/packages/laraditz/whatsapp)
![GitHub Actions](https://github.com/laraditz/whatsapp/actions/workflows/main.yml/badge.svg)

A comprehensive Laravel package for seamless integration with the Official WhatsApp Cloud API.

<a href="https://www.buymeacoffee.com/raditzfarhan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 200px !important;" ></a>

## Features

- Multi-account support (config-based or database-driven)
- Fluent API for sending all message types (text, image, video, document, audio, sticker, location, contacts, interactive, template, reaction)
- Template management (list, create, update, delete)
- Webhook handling with automatic signature verification
- Laravel events for incoming messages and status updates
- Database logging for API requests, messages, webhooks, and templates
- Laravel notification channel for WhatsApp
- Artisan commands for syncing templates and message statuses

## Requirements

- PHP 8.2+
- Laravel 11 or 12

## Installation

Install the package via Composer:

```bash
composer require laraditz/whatsapp
```

Publish the config file:

```bash
php artisan vendor:publish --tag=whatsapp-config
```

Publish and run migrations (required for logging and database account driver):

```bash
php artisan vendor:publish --tag=whatsapp-migrations
php artisan migrate
```

## Configuration

Add the following to your `.env` file:

```env
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
WHATSAPP_WEBHOOK_SECRET=your-app-secret
```

See [Configuration Guide](docs/configuration.md) for multi-account setup and all available options.

## Quick Start

### Sending Messages

```php
use Laraditz\Whatsapp\Facades\Whatsapp;

// Text message
Whatsapp::message()->to('60123456789')->text('Hello!')->send();

// Image
Whatsapp::message()
    ->to('60123456789')
    ->image(link: 'https://example.com/photo.jpg', caption: 'Check this out')
    ->send();

// Template message
Whatsapp::message()
    ->to('60123456789')
    ->template(name: 'order_update', language: 'en')
    ->component(type: 'body', parameters: [
        ['type' => 'text', 'text' => 'ORDER-123'],
    ])
    ->send();
```

### Managing Templates

```php
// List all templates
$response = Whatsapp::template()->list();

// Create a template
Whatsapp::template()->create(
    name: 'welcome_message',
    language: 'en',
    category: 'UTILITY',
    components: [
        ['type' => 'BODY', 'text' => 'Welcome, {{1}}!'],
    ],
);
```

### Laravel Notification

```php
use Illuminate\Notifications\Notification;
use Laraditz\Whatsapp\Channels\WhatsappChannel;
use Laraditz\Whatsapp\Messages\WhatsappMessage;

class OrderShipped extends Notification
{
    public function via($notifiable): array
    {
        return [WhatsappChannel::class];
    }

    public function toWhatsapp($notifiable): WhatsappMessage
    {
        return WhatsappMessage::create()
            ->template(name: 'order_update', language: 'en')
            ->component(type: 'body', parameters: [
                ['type' => 'text', 'text' => 'ORDER-123'],
            ]);
    }
}

// Send it
$user->notify(new OrderShipped($order));
```

### Multi-Account

```php
// Switch account
Whatsapp::account('support')->message()->to('60123456789')->text('Hi from support')->send();
```

## Artisan Commands

| Command                                                                   | Description                                                    |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `php artisan whatsapp:sync-templates`                                     | Sync all templates from the WhatsApp API to the local database |
| `php artisan whatsapp:sync-templates --account=support`                   | Sync templates for a specific account                          |
| `php artisan whatsapp:sync-messages`                                      | Sync message statuses for messages not yet delivered or read   |
| `php artisan whatsapp:sync-messages --account=default --since=2024-01-01` | Sync messages for a specific account and date range            |

## Documentation

- [Configuration Guide](docs/configuration.md) - Account drivers, logging, and all config options
- [Sending Messages](docs/sending-messages.md) - All message types with examples
- [Template Management](docs/template-management.md) - CRUD operations and syncing
- [Webhooks & Events](docs/webhooks.md) - Webhook setup and Laravel event handling
- [Notifications](docs/notifications.md) - Laravel notification channel integration
- [Error Handling](docs/error-handling.md) - Exception types and handling patterns

## Testing

```bash
composer test
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email raditzfarhan@gmail.com instead of using the issue tracker.

## Credits

- [Raditz Farhan](https://github.com/laraditz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
