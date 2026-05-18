# laravel-error-notifier

[![Latest Version](https://img.shields.io/packagist/v/alhumsi/laravel-error-notifier.svg)](https://packagist.org/packages/alhumsi/laravel-error-notifier)
[![Total Downloads](https://img.shields.io/packagist/dt/alhumsi/laravel-error-notifier.svg)](https://packagist.org/packages/alhumsi/laravel-error-notifier)
[![PHP Version](https://img.shields.io/packagist/php-v/alhumsi/laravel-error-notifier.svg)](https://packagist.org/packages/alhumsi/laravel-error-notifier)
[![License](https://img.shields.io/packagist/l/alhumsi/laravel-error-notifier.svg)](LICENSE)

Laravel package for actionable error notifications (Telegram, Slack, Discord) with contextual analysis and actionable suggestions.

## Highlights
- Auto-wires into Laravel’s exception handler once the service provider boots.
- Ships with Analyzer, MessageFormatter and Notifier abstractions for easy extension.
- Supports Slack, Telegram and Discord out of the box (drop-in HTTP hooks).
- Maps exception types to severity levels and channels, so high-signal alerts stay actionable.
- Ships with MarkdownV2-safe formatting plus JSON context blocks for deeper debugging.

## Screenshots
| Slack | Telegram | Discord |
|:---:|:---:|:---:|
| ![Slack Error](docs/images/slack_error.png) | ![Telegram Error](docs/images/telegram_error.png) | ![Discord Error](docs/images/discord_error.png) |

## Requirements
- PHP 8.2+
- Laravel 10.x, 11.x or 12.x (or any app relying on Illuminate components)
- Enabled HTTP client (`Illuminate\Support\Facades\Http`)
- Optional: queue workers if you decide to dispatch notifications asynchronously

## Installation
```bash
composer require alhumsi/laravel-error-notifier
php artisan vendor:publish --tag=error-notifier-config
```

Add the following to your `.env` (only the services you plan to use are required):
```
ERROR_NOTIFIER_SLACK_WEBHOOK=https://hooks.slack.com/services/REDACTED
ERROR_NOTIFIER_TELEGRAM_BOT_TOKEN=123456:ABC
ERROR_NOTIFIER_TELEGRAM_CHAT_ID=123456789
ERROR_NOTIFIER_DISCORD_WEBHOOK=https://discord.com/api/webhooks/xxx/yyy
ERROR_NOTIFIER_THROTTLE_ENABLED=true
ERROR_NOTIFIER_MAINTENANCE_ENABLED=false
```

> The package auto-discovers its service provider. No manual edits to `config/app.php` are necessary.

## Quickstart
1. Install and publish the config (see above).
2. Adjust `config/error-notifier.php` levels and channels:
   ```php
   'levels' => [
       'emergency' => ['slack', 'telegram'],
       'critical' => ['slack'],
       'error' => ['discord'],
   ];
   ```
3. Map custom exceptions to levels under the `analyzers` array.
4. Trigger any exception in your app; you should see a formatted alert on the configured channel(s).

The package hooks into Laravel’s reportable callback:
```php
$this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class)
    ->reportable(fn (Throwable $e) => app(ExceptionListener::class)->handle($e));
```

## Configuration Essentials
- `channels`: provide the transport credentials. Telegram needs `bot_token`, `chat_id` and optional `bot_url`.
- `levels`: severity => channels mapping. Empty arrays silence that severity.
- `analyzers`: class => severity override, allowing priority routing for specific exceptions.
- `icons`: severity => emoji mapping. Customize the visual indicator for each error level.

### Custom Icons
Define emojis or strings for each severity level in `config/error-notifier.php`:
```php
'icons' => [
    'emergency' => '🚨',
    'critical' => '🔥',
    'error' => '❌',
    // ...
],
```

### Custom Analyzer
Implement `alhumsi\ErrorNotifier\Contracts\AnalyzerInterface` and bind it inside a service provider:
```php
use alhumsi\ErrorNotifier\Contracts\AnalyzerInterface;
use App\Support\CustomAnalyzer;

public function register()
{
    $this->app->singleton(AnalyzerInterface::class, CustomAnalyzer::class);
}
```

### Custom Formatter
Provide your own `MessageFormatterInterface` implementation if you need per-channel formatting tweaks (attachments, embeds, etc.).

### Custom Notifier / Async Delivery
Swap `NotifierInterface` with a queue-backed implementation to push payloads to jobs or any other transport you prefer.

## Examples
See the additional guides under `docs/`:
- `docs/getting-started.md`: full walkthrough with publishing, environments and troubleshooting.
- `docs/examples.md`: channel routing, per-project overrides, manual invocation snippets.

## Local Testing
```bash
composer test
```
Includes an integration test (`tests/ErrorFlowTest.php`) that mocks the notifier and asserts both Slack and Telegram deliveries.

## Package Structure
```
laravel-error-notifier/
├── config/             # Configuration file
├── docs/               # Additional documentation
├── src/                # Source code
│   ├── Console/
│   │   └── FeatureLockCommand.php
│   ├── Contracts/
│   │   ├── AnalyzerInterface.php
│   │   ├── MessageFormatterInterface.php
│   │   └── NotifierInterface.php
│   ├── Http/
│   │   └── Middleware/
│   │       └── CheckFeatureLock.php
│   ├── Listeners/
│   │   ├── ExceptionListener.php
│   │   └── LogListener.php
│   ├── Services/
│   │   ├── FeatureLocker.php
│   │   └── Maintainer.php
│   ├── Analyzer.php    # Exception analyzer
│   ├── MessageFormatter.php # Notification formatter
│   ├── Notifier.php    # Notification sender
│   └── Throttler.php   # Rate limiting logic
├── tests/              # Automated tests
└── vendor/             # Composer dependencies
```

## Contributing
1. Fork & clone
2. Run `composer install`
3. Add or adjust tests
4. Open a PR with a summary of changes

## License
MIT © Abdullah ALhumsi
