# enessvg/laravel-telegram-deployer

English | [Turkce](./README.tr.md)

Telegram webhook-triggered, TOTP-protected, queue-based deploy/action runner for Laravel.

## Supported Versions

- Laravel 11.x
- Laravel 12.x
- Laravel 13.x (PHP 8.3+)

## Command Format

Only this format is supported:

`/run {action} [key=value ...] {token}`

Examples:

- `/run deploy 123456`
- `/run seed class=Database\\Seeders\\UserSeeder 123456`

## Features

- Telegram webhook secret validation
- Chat/User allowlist authorization
- TOTP validation (`period`, `digits`, `window`)
- Replay protection (single use per token+window)
- Global single-run lock
- Fail-fast action pipeline (`artisan` + `shell`)
- DB run logs (`telegram_deployer_runs`)
- Telegram status messaging

## Installation (Host App)

1. Install the package:

```bash
composer require enessvg/laravel-telegram-deployer
```

2. Publish config and migrations:

```bash
php artisan vendor:publish --tag=telegram-deployer-config
php artisan vendor:publish --tag=telegram-deployer-migrations
```

3. Add these env keys to `.env` (fill values as needed):

```dotenv
TELEGRAM_DEPLOYER_BOT_TOKEN=
TELEGRAM_DEPLOYER_WEBHOOK_PATH=
TELEGRAM_DEPLOYER_WEBHOOK_SECRET=
TELEGRAM_DEPLOYER_ALLOWED_CHAT_IDS=
TELEGRAM_DEPLOYER_ALLOWED_USER_IDS=

TELEGRAM_DEPLOYER_OTP_SECRET=
TELEGRAM_DEPLOYER_OTP_PERIOD=
TELEGRAM_DEPLOYER_OTP_DIGITS=
TELEGRAM_DEPLOYER_OTP_WINDOW=
TELEGRAM_DEPLOYER_OTP_ISSUER=
TELEGRAM_DEPLOYER_OTP_LABEL=

TELEGRAM_DEPLOYER_QUEUE_CONNECTION=
TELEGRAM_DEPLOYER_QUEUE=

TELEGRAM_DEPLOYER_GLOBAL_LOCK_KEY=
TELEGRAM_DEPLOYER_GLOBAL_LOCK_SECONDS=

TELEGRAM_DEPLOYER_STEP_TIMEOUT=
TELEGRAM_DEPLOYER_WORKING_DIRECTORY=
```

4. Run migrations:

```bash
php artisan migrate --force
```

5. Run a queue worker.
6. Set Telegram webhook.

## Artisan Commands

- `php artisan telegram-deployer:generate-secret`
- `php artisan telegram-deployer:generate-secret --qr` (prints QR in terminal if `qrencode` is installed)
- `php artisan telegram-deployer:set-webhook {url?}`

## Core Config Keys

- `telegram.bot_token`
- `telegram.webhook_path`
- `telegram.webhook_secret`
- `telegram.allowed_chat_ids`
- `telegram.allowed_user_ids`
- `otp.secret`, `otp.period`, `otp.digits`, `otp.window`
- `queue.connection`, `queue.name`
- `locks.global_lock_seconds`
- `actions`

## Parameterized Action Example

```php
'actions' => [
    'seed' => [
        [
            'type' => 'artisan',
            'command' => 'db:seed --class={class} --force',
        ],
    ],
],
```
