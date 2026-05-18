# Telegram Notifier for Laravel

[![Latest Version on Packagist](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/GabrielRavelo/telegram-notifier)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE.md)

A clean and modular Laravel package to send Telegram notifications. Built with architectural best practices, including **Service Providers**, **Facades**, and **Unit Testing** via Orchestra Testbench.

## Features
- ✅ **Decoupled Architecture**: Logic is isolated from the main application.
- ✅ **Facade Support**: Simple `Telegram::send()` syntax.
- ✅ **Queue Ready**: Fully compatible with Laravel Queues and Redis for asynchronous messaging.
- ✅ **Developer Friendly**: Includes configuration publishing and environment-based setup.

## Installation

Since this package is in development, add the repository to your project's `composer.json`:

```json
"repositories": [
    {
        "type": "vcs",
        "url": "[https://github.com/GabrielRavelo/telegram-notifier](https://github.com/gabrielravelo/telegram-notifier)"
    }
],
```

Then, install the package via Composer:

```bash
composer require gabrielravelo/telegram-notifier:dev-master
```

## Configuration

1. Publish the config file to your application:

```bash
php artisan vendor:publish --provider="GabrielRavelo\TelegramNotifier\TelegramServiceProvider" --tag="config"
```

2. Add your credentials to your .env file:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Usage

### Basic Usage

You can send a message from anywhere in your application using the Facade:

```php
use GabrielRavelo\TelegramNotifier\Facades\TelegramFacade as Telegram;

Telegram::send("Hello World! 🚀");
```

### Pro Tip: Using with Redis Queues

To avoid blocking the user request, dispatch the notification using a Laravel Job:

```php
// Inside your Job's handle method
public function handle()
{
    Telegram::send("Asynchronous message via Redis");
}
```

## Testing 

The package includes a test suite powered by Orchestra Testbench. To run tests:

```bash
vendor/bin/phpunit
```

## Security

If you discover any security-related issues, please use the GitHub issue tracker or contact the maintainer directly.

## License

The MIT License (MIT).