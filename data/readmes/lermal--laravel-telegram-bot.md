# lermal/laravel-telegram-bot

Laravel package for Telegram Bot API with webhook and polling support.

Language: **English** | [Русский](README.ru.md)

## Features

- Telegram API client with typed methods and raw API calls.
- Webhook mode with secret validation.
- Polling mode with retries, backoff, `--max-iterations`, and `--stop-when-empty`.
- Update dispatcher with handler pipeline.
- Built-in anti-spam for repeated chat commands.
- Telemetry events for polling and update processing lifecycle.

## Quick start

```bash
composer require lermal/laravel-telegram-bot
php artisan telegram:install
```

Then configure handlers in `config/telegram.php`.

## Requirements

- PHP 8.3+
- Laravel 13+

## Main commands

- `php artisan telegram:webhook:set {url?}`
- `php artisan telegram:webhook:info`
- `php artisan telegram:webhook:delete {--drop-pending-updates}`
- `php artisan telegram:poll {--once} {--max-iterations=} {--stop-when-empty}`
- `php artisan telegram:install`

## Documentation

Detailed setup, architecture notes, examples, and troubleshooting are in wiki:
<https://github.com/lermal/laravel-telegram-bot/wiki>

## Support

- Issues: <https://github.com/lermal/laravel-telegram-bot/issues>
- Source: <https://github.com/lermal/laravel-telegram-bot>

## Tests

```bash
composer test
```

## License

MIT
