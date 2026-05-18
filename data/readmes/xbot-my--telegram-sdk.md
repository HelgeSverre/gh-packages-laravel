# Telegram Bot PHP SDK

An easy-to-use PHP Telegram Bot API SDK providing a high-performance client, semantic endpoints, comprehensive exception handling, and seamless Laravel integration.

---

## Features

* Ready to use out of the box
* Comprehensive exception handling
* Fluent chainable calls
* Flexible response transformations

## Installation

```bash
composer require xbot-my/telegram-sdk
```

### Laravel

```bash
php artisan vendor:publish --provider="XBot\\Telegram\\Providers\\TelegramServiceProvider"
```

## Quick Start

```php
use XBot\\Telegram\\Bot;

$bot = Bot::token('YOUR_BOT_TOKEN');

$me  = $bot->getMe()->toArray();
$msg = $bot->sendMessage(123456789, 'Hello')->toArray();
$bot->setWebhook('https://example.com/telegram/webhook');
```

## Webhook and Update Handling

* Set `TELEGRAM_WEBHOOK_SECRET` in your `.env`, and optionally `TELEGRAM_WEBHOOK_ROUTE_PREFIX`.
* The ServiceProvider registers default routes and middleware, validating the `X-Telegram-Bot-Api-Secret-Token` header.
* Implement `UpdateHandler` or extend `BaseUpdateHandler`:

```php
class StartHandler extends BaseUpdateHandler {
    protected function onMessage(array $u): void {
        if ($this->text($u) === '/start') $this->replyText($u, 'Welcome!');
    }
}
```

* Command routing can extend `CommandRouter`, e.g., `/start` → `onStart`, `/help foo` → `onHelp`.

## Examples

```php
// WebApp
$bot->answerWebAppQuery($queryId, [...]);
// Boosts
$bot->getUserChatBoosts($chatId, $userId);
// Stars
$bot->refundStarPayment($userId, $chargeId);
// Business
$bot->readBusinessMessage($chatId, $messageId);
```

## Telegram Bot API 9.2 Parameters

* `direct_messages_topic_id`: Send to channel topics
* `suggested_post_parameters`: Suggested posts
* `reply_parameters.checklist_task_id`: Reply to checklist tasks

```php
$bot->sendMessage($chatId, 'Hello', ['direct_messages_topic_id' => 1234]);
```

## Logging

* Controlled via environment variables:

    * `TELEGRAM_LOG_ENABLED`
    * `TELEGRAM_LOG_SUPPRESS_INFO`
    * `TELEGRAM_LOG_CHANNEL`
* Events: `telegram.request`, `telegram.response`, `telegram.retry`, etc.
