# Laravel Telegram Notifications

[![Tests](https://github.com/samuelterra22/laravel-telegram-notifications/actions/workflows/run-tests.yml/badge.svg)](https://github.com/samuelterra22/laravel-telegram-notifications/actions/workflows/run-tests.yml)
[![PHPStan](https://github.com/samuelterra22/laravel-telegram-notifications/actions/workflows/phpstan.yml/badge.svg)](https://github.com/samuelterra22/laravel-telegram-notifications/actions/workflows/phpstan.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/samuelterra22/laravel-telegram-notifications.svg)](https://packagist.org/packages/samuelterra22/laravel-telegram-notifications)
[![Total Downloads](https://img.shields.io/packagist/dt/samuelterra22/laravel-telegram-notifications.svg)](https://packagist.org/packages/samuelterra22/laravel-telegram-notifications)
[![License](https://img.shields.io/packagist/l/samuelterra22/laravel-telegram-notifications.svg)](https://packagist.org/packages/samuelterra22/laravel-telegram-notifications)

A complete Laravel package for integrating the Telegram Bot API with Laravel applications. Send messages, notifications, log errors, use interactive keyboards, support multiple bots and forum topics.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Sending Messages via Facade](#sending-messages-via-facade)
  - [Laravel Notifications Channel](#laravel-notifications-channel)
  - [Message Types](#message-types)
  - [Text Formatting Methods](#text-formatting-methods)
  - [Interactive Keyboards](#interactive-keyboards)
  - [Fluent Message Builder](#fluent-message-builder)
  - [Broadcasting](#broadcasting)
  - [Edit, Delete, Forward & Copy Messages](#edit-delete-forward--copy-messages)
  - [Chat Actions](#chat-actions)
  - [Chat Management](#chat-management)
  - [Bot Management & Commands](#bot-management--commands)
  - [Webhook Management & Middleware](#webhook-management--middleware)
  - [File Operations](#file-operations)
  - [Callbacks & Inline Queries](#callbacks--inline-queries)
  - [Moderation](#moderation)
  - [Advanced Options](#advanced-options)
  - [Message Effects](#message-effects)
  - [Reactions](#reactions)
  - [MarkdownV2 Escaping](#markdownv2-escaping)
  - [Blade View Rendering](#blade-view-rendering)
  - [Media Group Builder](#media-group-builder)
  - [Payments & Invoices](#payments--invoices)
  - [Gifts](#gifts)
  - [Stories](#stories)
  - [Checklists](#checklists)
- [Logging (Monolog Handler)](#logging-monolog-handler)
- [Artisan Commands](#artisan-commands)
- [Webhook Handler](#webhook-handler)
- [Queued Broadcasting](#queued-broadcasting)
- [Error Handling](#error-handling)
- [Multi-Bot Support](#multi-bot-support)
- [Enums Reference](#enums-reference)
- [Typed Responses](#typed-responses)
- [Testing](#testing)
- [API Quick Reference](#api-quick-reference)
- [Roadmap](#roadmap)
- [Development](#development)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

## Features

- **13 message builders**: text, photo, document, video, audio, voice, animation, location, venue, contact, poll, sticker, dice
- **Facade convenience methods**: send photos, videos, stickers, video notes, media groups, and more directly via `Telegram::`
- **Laravel Notifications channel**: use `toTelegram()` in your notification classes
- **Monolog log handler**: send error logs directly to Telegram with emoji, stack traces, and app context
- **Multi-bot support**: configure and switch between multiple bots at runtime
- **Forum/Topics support**: send messages to specific forum topics via `message_thread_id`
- **Interactive keyboards**: inline keyboards, reply keyboards, force reply, and keyboard removal with fluent builders
- **10 inline button types**: URL, callback, web app, login URL, switch inline query, copy text, pay, and more
- **Fluent API**: `Telegram::message($chatId)->html('text')->silent()->send()`
- **Broadcast support**: send messages to multiple chats with rate limiting and failure callbacks
- **Typed response objects**: `TelegramResponse` with `messageId()`, `date()`, `chat()`, `text()` accessors
- **Auto message splitting**: messages exceeding 4096 characters are split automatically
- **Message effects**: animated visual effects (confetti, fire) via `effect()` on all message builders (Bot API 7.4+)
- **Expandable blockquotes**: collapsible text sections via `expandableQuote()`
- **Blade view rendering**: use Blade templates for message content via `view()`
- **MarkdownV2 auto-escaping**: `MarkdownV2::escape()` helper and `escapedMarkdown()` builder method
- **TelegramMediaGroup builder**: fluent builder for sending media albums via notification channel
- **Reactions**: `setMessageReaction()` for emoji and custom emoji reactions
- **Payments & invoices**: `sendInvoice()`, `createInvoiceLink()`, Telegram Stars support
- **Gifts**: `sendGift()`, `getAvailableGifts()`
- **Stories**: `postStory()`, `editStory()`, `deleteStory()`
- **Checklists**: `TelegramChecklist` fluent builder for structured task lists
- **Configurable retry with backoff**: exponential backoff with jitter for rate limit handling
- **Queued broadcasting**: dispatch broadcasts as Laravel queue jobs via `queue()`
- **Webhook handler**: abstract `WebhookHandler` class for routing incoming updates
- **`telegram:send` command**: send messages from the command line
- **Rate limit handling**: built-in retry-after handling with configurable exponential backoff
- **Webhook verification middleware**: validate incoming webhook requests via secret token
- **Chat action shortcuts**: `typing()`, `uploadingPhoto()`, `recordingVideo()`, and more
- **`$options` parameter on all methods**: pass any Telegram Bot API parameter without falling back to raw `call()`
- **Rich error objects**: `TelegramApiException` with status code, API method, retry-after, and rate limit detection
- **Fully testable**: all HTTP calls via Laravel's `Http::` facade, easily mocked with `Http::fake()`
- **Zero external dependencies**: uses Laravel's built-in HTTP client
- **99.9% test coverage**: 785 tests with 1439 assertions

## Requirements

- PHP 8.2+
- Laravel 11 or 12

## Installation

```bash
composer require samuelterra22/laravel-telegram-notifications
```

Publish the config file:

```bash
php artisan vendor:publish --tag=telegram-notifications-config
```

## Configuration

Add to your `.env`:

```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_TOPIC_ID=42
```

All available environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | *(required)* |
| `TELEGRAM_BOT_USERNAME` | Bot username (without @) for integration links | `null` |
| `TELEGRAM_CHAT_ID` | Default chat ID for the bot | `null` |
| `TELEGRAM_TOPIC_ID` | Default forum topic ID | `null` |
| `TELEGRAM_BOT` | Name of the default bot | `default` |
| `TELEGRAM_API_BASE_URL` | Telegram API base URL (useful for local Bot API server) | `https://api.telegram.org` |
| `TELEGRAM_TIMEOUT` | HTTP timeout in seconds | `10` |
| `TELEGRAM_LOG_ENABLED` | Enable Telegram log handler | `false` |
| `TELEGRAM_LOG_BOT` | Bot to use for logging | `default` |
| `TELEGRAM_LOG_CHAT_ID` | Chat ID for log messages | `null` |
| `TELEGRAM_LOG_TOPIC_ID` | Topic ID for log messages | `null` |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token for webhook verification | `null` |
| `TELEGRAM_RETRY_MAX_ATTEMPTS` | Max retry attempts on rate limit | `3` |
| `TELEGRAM_RETRY_BASE_DELAY_MS` | Base delay in milliseconds | `1000` |
| `TELEGRAM_RETRY_USE_JITTER` | Add random jitter to delays | `true` |

The config file `config/telegram-notifications.php` supports multiple bots:

```php
return [
    'default' => env('TELEGRAM_BOT', 'default'),

    'bots' => [
        'default' => [
            'token' => env('TELEGRAM_BOT_TOKEN'),
            'username' => env('TELEGRAM_BOT_USERNAME'),
            'chat_id' => env('TELEGRAM_CHAT_ID'),
            'topic_id' => env('TELEGRAM_TOPIC_ID'),
        ],
        'alerts' => [
            'token' => env('TELEGRAM_ALERTS_BOT_TOKEN'),
            'username' => env('TELEGRAM_ALERTS_BOT_USERNAME'),
            'chat_id' => env('TELEGRAM_ALERTS_CHAT_ID'),
        ],
    ],

    'api_base_url' => env('TELEGRAM_API_BASE_URL', 'https://api.telegram.org'),
    'timeout' => (int) env('TELEGRAM_TIMEOUT', 10),

    'logging' => [
        'enabled' => (bool) env('TELEGRAM_LOG_ENABLED', false),
        'bot' => env('TELEGRAM_LOG_BOT', 'default'),
        'chat_id' => env('TELEGRAM_LOG_CHAT_ID'),
        'topic_id' => env('TELEGRAM_LOG_TOPIC_ID'),
    ],

    'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),

    'retry' => [
        'max_attempts' => (int) env('TELEGRAM_RETRY_MAX_ATTEMPTS', 3),
        'base_delay_ms' => (int) env('TELEGRAM_RETRY_BASE_DELAY_MS', 1000),
        'use_jitter' => (bool) env('TELEGRAM_RETRY_USE_JITTER', true),
    ],
];
```

## Quick Start

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Send a simple message
Telegram::sendMessage('-1001234567890', 'Hello from Laravel!');

// Send with fluent builder
Telegram::message('-1001234567890')
    ->html('<b>Hello!</b> Welcome to the app.')
    ->send();

// Send a photo
Telegram::sendPhoto('-1001234567890', 'https://example.com/photo.jpg', 'Caption');

// Use in a Laravel Notification
$user->notify(new OrderShipped($order));
```

## Usage

### Sending Messages via Facade

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Simple message
Telegram::sendMessage('-1001234567890', 'Hello from Laravel!');

// Message with parse mode
Telegram::sendMessage('-1001234567890', '<b>Bold</b> and <i>italic</i>', 'HTML');

// Message to a forum topic
Telegram::sendMessage('-1001234567890', 'Error report', topicId: '42');

// Using a specific bot
Telegram::bot('alerts')->call('sendMessage', [
    'chat_id' => '-1001234567890',
    'text' => 'ALERT!',
]);
```

### Laravel Notifications Channel

Create a notification class with a `toTelegram()` method:

```php
use Illuminate\Notifications\Notification;
use SamuelTerra22\TelegramNotifications\Messages\TelegramMessage;

class OrderShipped extends Notification
{
    public function __construct(private Order $order) {}

    public function via(mixed $notifiable): array
    {
        return ['telegram'];
    }

    public function toTelegram(mixed $notifiable): TelegramMessage
    {
        return TelegramMessage::create()
            ->bold('Order Shipped!')
            ->line('')
            ->line("Order #{$this->order->id}")
            ->line("Tracking: {$this->order->tracking_code}")
            ->button('Track Order', $this->order->tracking_url)
            ->button('View Order', route('orders.show', $this->order));
    }
}
```

Send notifications:

```php
// Via a notifiable model
$user->notify(new OrderShipped($order));

// On-demand (without a model)
Notification::route('telegram', '-1001234567890')
    ->notify(new OrderShipped($order));
```

Add the routing method to your notifiable model:

```php
public function routeNotificationForTelegram(): ?string
{
    return $this->telegram_chat_id;
}
```

You can return any message type from `toTelegram()` (not just `TelegramMessage`):

```php
public function toTelegram(mixed $notifiable): TelegramPhoto
{
    return TelegramPhoto::create()
        ->photo($this->order->receipt_image_url)
        ->caption("Receipt for Order #{$this->order->id}");
}
```

### Message Types

All message builders share these methods via the `HasSharedParams` trait:

| Method | Description |
|--------|-------------|
| `to(string $chatId)` | Set the target chat ID |
| `topic(string $topicId)` | Set the forum topic/thread ID |
| `bot(string $bot)` | Set which bot to use |

All builders also support `silent()` and `protected()` to disable notifications and protect content from forwarding/saving.

#### Text Message

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramMessage;

TelegramMessage::create()
    ->to('-1001234567890')
    ->bold('Title')
    ->line('Regular text')
    ->italic('Italic text')
    ->underline('Underlined')
    ->strikethrough('Deleted text')
    ->code('inline_code()')
    ->pre('echo "code block";', 'php')
    ->link('Click here', 'https://example.com')
    ->spoiler('Hidden text')
    ->quote('A blockquote')
    ->silent()
    ->protected()
    ->disableWebPagePreview()
    ->replyTo('42');
```

#### Photo

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramPhoto;

TelegramPhoto::create()
    ->to('-1001234567890')
    ->photo('https://example.com/image.jpg') // URL or file_id
    ->caption('Photo caption')
    ->spoiler();
```

#### Document

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramDocument;

TelegramDocument::create()
    ->to('-1001234567890')
    ->document('https://example.com/report.pdf') // URL or file_id
    ->caption('Monthly report')
    ->thumbnail('https://example.com/thumb.jpg')
    ->disableContentTypeDetection();
```

#### Video

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramVideo;

TelegramVideo::create()
    ->to('-1001234567890')
    ->video('https://example.com/video.mp4') // URL or file_id
    ->caption('Check this out!')
    ->duration(120)
    ->width(1920)
    ->height(1080)
    ->dimensions(1920, 1080) // shortcut for width + height
    ->streaming()            // optimize for streaming playback
    ->spoiler();
```

#### Audio

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramAudio;

TelegramAudio::create()
    ->to('-1001234567890')
    ->audio('https://example.com/song.mp3') // URL or file_id
    ->caption('Now playing')
    ->performer('Artist Name')
    ->title('Song Title')
    ->duration(240)
    ->thumbnail('https://example.com/cover.jpg');
```

#### Voice

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramVoice;

TelegramVoice::create()
    ->to('-1001234567890')
    ->voice('https://example.com/voice.ogg') // URL or file_id
    ->caption('Voice message')
    ->duration(30);
```

#### Animation (GIF)

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramAnimation;

TelegramAnimation::create()
    ->to('-1001234567890')
    ->animation('https://example.com/animation.gif') // URL or file_id
    ->caption('Funny GIF')
    ->width(320)
    ->height(240)
    ->duration(5)
    ->thumbnail('https://example.com/thumb.jpg')
    ->spoiler();
```

#### Sticker

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramSticker;

TelegramSticker::create()
    ->to('-1001234567890')
    ->sticker('CAACAgIAAxkBAAI...') // file_id, URL, or sticker set name
    ->emoji('thumbs up');
```

#### Location

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramLocation;

TelegramLocation::create()
    ->to('-1001234567890')
    ->coordinates(-23.5505, -46.6333)   // latitude, longitude
    ->livePeriod(3600)                  // live location for 1 hour (60-86400 seconds)
    ->horizontalAccuracy(50.0)          // accuracy in meters (0-1500)
    ->heading(90)                       // direction in degrees (1-360)
    ->proximityAlertRadius(100);        // alert when within N meters
```

You can also set coordinates individually:

```php
TelegramLocation::create()
    ->latitude(-23.5505)
    ->longitude(-46.6333);
```

#### Venue

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramVenue;

TelegramVenue::create()
    ->to('-1001234567890')
    ->coordinates(-23.5505, -46.6333)
    ->title('Ibirapuera Park')
    ->address('Av. Pedro Alvares Cabral, Sao Paulo')
    ->foursquareId('4b5bc7eef964a520e22529e3')
    ->foursquareType('parks_outdoors/park')
    ->googlePlaceId('ChIJ...')
    ->googlePlaceType('park');
```

#### Contact

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramContact;

TelegramContact::create()
    ->to('-1001234567890')
    ->phoneNumber('+5511999999999')
    ->firstName('Samuel')
    ->lastName('Terra')
    ->vcard("BEGIN:VCARD\nVERSION:3.0\nFN:Samuel Terra\nEND:VCARD");
```

#### Poll

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramPoll;

// Regular poll
TelegramPoll::create()
    ->to('-1001234567890')
    ->question('What time works best?')
    ->options(['08:00', '10:00', '14:00', '16:00'])
    ->allowsMultipleAnswers()
    ->anonymous(false);

// Quiz mode (with correct answer)
TelegramPoll::create()
    ->to('-1001234567890')
    ->question('What is the capital of Brazil?')
    ->options(['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador'])
    ->quiz(2, 'Brasilia has been the capital since 1960'); // correct option index, explanation

// Auto-close poll
TelegramPoll::create()
    ->to('-1001234567890')
    ->question('Quick vote!')
    ->options(['Yes', 'No'])
    ->openPeriod(300)    // auto-close after 5 minutes
    // or ->closeDate($timestamp)  // close at specific time
    // or ->closed()               // send as already closed
```

#### Dice

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramDice;

TelegramDice::create()
    ->to('-1001234567890')
    ->dice();          // random value 1-6
    // ->darts()       // random value 1-6
    // ->basketball()  // random value 1-5
    // ->football()    // random value 1-5
    // ->bowling()     // random value 1-6
    // ->slotMachine() // random value 1-64
    // ->emoji('custom')
```

#### Facade-Only Types

These types don't have dedicated builder classes but are available via the Facade:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Video Note (round video)
Telegram::sendVideoNote($chatId, 'video_note_file_id');

// Media Group (album of photos/videos)
Telegram::sendMediaGroup($chatId, [
    ['type' => 'photo', 'media' => 'https://example.com/1.jpg', 'caption' => 'First'],
    ['type' => 'photo', 'media' => 'https://example.com/2.jpg'],
    ['type' => 'video', 'media' => 'https://example.com/video.mp4'],
]);
```

### Text Formatting Methods

`TelegramMessage` provides fluent methods for HTML formatting:

| Method | Output | Example |
|--------|--------|---------|
| `content(string $text)` | Raw text | `Hello world` |
| `line(string $text)` | Appends text + newline | `Line 1\nLine 2` |
| `bold(string $text)` | `<b>text</b>` | **text** |
| `italic(string $text)` | `<i>text</i>` | *text* |
| `underline(string $text)` | `<u>text</u>` | <u>text</u> |
| `strikethrough(string $text)` | `<s>text</s>` | ~~text~~ |
| `code(string $text)` | `<code>text</code>` | `text` |
| `pre(string $text, ?string $lang)` | `<pre><code class="lang">text</code></pre>` | Code block |
| `link(string $text, string $url)` | `<a href="url">text</a>` | [text](url) |
| `spoiler(string $text)` | `<tg-spoiler>text</tg-spoiler>` | Hidden text |
| `quote(string $text)` | `<blockquote>text</blockquote>` | Blockquote |
| `expandableQuote(string $text)` | `<blockquote expandable>text</blockquote>` | Collapsible quote |

Change parse mode:

```php
use SamuelTerra22\TelegramNotifications\Enums\ParseMode;

TelegramMessage::create()
    ->parseMode(ParseMode::MarkdownV2)
    ->content('*bold* _italic_ `code`');
```

Messages exceeding 4096 characters are automatically split into multiple messages using `splitContent()`.

### Interactive Keyboards

#### Inline Keyboard

Inline keyboards appear below the message:

```php
use SamuelTerra22\TelegramNotifications\Keyboards\InlineKeyboard;

$keyboard = InlineKeyboard::make()
    ->url('Open App', 'https://app.example.com')
    ->url('Docs', 'https://docs.example.com')
    ->row()
    ->callback('Confirm', 'action:confirm:123')
    ->callback('Cancel', 'action:cancel:123');

TelegramMessage::create()
    ->to($chatId)
    ->content('Choose an option:')
    ->keyboard($keyboard);
```

All inline button types:

| Method | Description | Parameters |
|--------|-------------|------------|
| `url(text, url, columns)` | Opens a URL | `string $text, string $url, int $columns = 2` |
| `callback(text, data, columns)` | Sends callback query | `string $text, string $data, int $columns = 2` |
| `webApp(text, url, columns)` | Opens a Web App | `string $text, string $webAppUrl, int $columns = 2` |
| `loginUrl(text, loginUrl, columns)` | Authentication button | `string $text, array\|string $loginUrl, int $columns = 2` |
| `switchInlineQuery(text, query, columns)` | Switch to inline in any chat | `string $text, string $query = '', int $columns = 2` |
| `switchInlineQueryCurrentChat(text, query, columns)` | Switch to inline in current chat | `string $text, string $query = '', int $columns = 2` |
| `switchInlineQueryChosenChat(text, options, columns)` | Switch inline with chat picker | `string $text, array $options = [], int $columns = 2` |
| `copyText(text, textToCopy, columns)` | Copies text to clipboard | `string $text, string $textToCopy, int $columns = 2` |
| `pay(text, columns)` | Payment button | `string $text, int $columns = 2` |
| `button(button, columns)` | Add a custom `Button` instance | `Button $button, int $columns = 2` |
| `row()` | Start a new button row | |

The `$columns` parameter controls auto-layout: buttons are placed in rows of N columns. Use `row()` to force a new row.

```php
// Extended button types example
$keyboard = InlineKeyboard::make()
    ->loginUrl('Login', 'https://example.com/auth')
    ->switchInlineQuery('Search Everywhere', 'query')
    ->row()
    ->switchInlineQueryCurrentChat('Search Here', 'query')
    ->switchInlineQueryChosenChat('Pick Chat', ['allow_user_chats' => true])
    ->row()
    ->copyText('Copy Code', 'ABC-123-XYZ')
    ->pay('Pay $10');
```

#### Custom Button Objects

For full control, use the `Button` class:

```php
use SamuelTerra22\TelegramNotifications\Keyboards\Button;

$button = Button::url('Visit Site', 'https://example.com');
$button = Button::callback('Click Me', 'callback_data');
$button = Button::webApp('Open App', 'https://app.example.com');
$button = Button::loginUrl('Login', ['url' => 'https://example.com/auth']);
$button = Button::switchInlineQuery('Search', 'default query');
$button = Button::switchInlineQueryCurrentChat('Search Here', '');
$button = Button::switchInlineQueryChosenChat('Pick Chat', ['allow_user_chats' => true]);
$button = Button::copyText('Copy', 'text to copy');
$button = Button::pay('Buy Now');

$keyboard = InlineKeyboard::make()->button($button);
```

#### Reply Keyboard

Reply keyboards replace the device keyboard:

```php
use SamuelTerra22\TelegramNotifications\Keyboards\ReplyKeyboard;

$keyboard = ReplyKeyboard::make()
    ->button('Option A')
    ->button('Option B')
    ->row()
    ->requestContact('Share Contact')
    ->requestLocation('Share Location')
    ->resize()                       // fit keyboard to buttons
    ->oneTime()                      // hide after one press
    ->placeholder('Choose...')       // input field placeholder
    ->selective()                    // show only to specific users
    ->persistent();                  // keep keyboard visible
```

| Method | Description |
|--------|-------------|
| `button(text, columns)` | Simple text button |
| `requestContact(text, columns)` | Request user's phone number |
| `requestLocation(text, columns)` | Request user's location |
| `row()` | Start a new button row |
| `resize(bool)` | Resize keyboard to fit buttons |
| `oneTime(bool)` | Hide keyboard after one button press |
| `placeholder(string)` | Input field placeholder text |
| `selective(bool)` | Show only to mentioned/replied-to users |
| `persistent(bool)` | Keep keyboard always visible |

#### Force Reply & Remove Keyboard

```php
use SamuelTerra22\TelegramNotifications\Keyboards\ForceReply;
use SamuelTerra22\TelegramNotifications\Keyboards\ReplyKeyboardRemove;

// Force the user to reply
$forceReply = ForceReply::make()
    ->placeholder('Type your answer...')
    ->selective();

// Remove the reply keyboard
$remove = ReplyKeyboardRemove::make()
    ->selective();

// Use with any message
TelegramMessage::create()
    ->to($chatId)
    ->content('Please answer:')
    ->replyKeyboard($forceReply);
```

#### Checking Keyboard State

```php
$keyboard = InlineKeyboard::make();
$keyboard->isEmpty(); // true

$keyboard->url('Click', 'https://example.com');
$keyboard->isEmpty(); // false
```

### Fluent Message Builder

Build and send messages with a chainable interface that returns typed `TelegramResponse` objects:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

$response = Telegram::message('-1001234567890')
    ->html('<b>Important Update</b>')
    ->silent()
    ->protected()
    ->disablePreview()
    ->keyboard($inlineKeyboard)
    ->replyTo($previousMessageId)
    ->topic('42')
    ->send();

$response->ok();         // true
$response->messageId();  // 123
$response->date();       // Carbon instance
$response->text();       // 'Important Update'
$response->chat();       // ['id' => -1001234567890, 'type' => 'supergroup', ...]
```

Available methods on `PendingMessage`:

| Method | Description |
|--------|-------------|
| `text(string $text)` | Set message text (default parse mode) |
| `html(string $text)` | Set text with HTML parse mode |
| `markdown(string $text)` | Set text with MarkdownV2 parse mode |
| `silent()` | Disable notification sound |
| `protected()` | Protect content from forwarding/saving |
| `disablePreview()` | Disable web page link previews |
| `keyboard(ReplyMarkupInterface $markup)` | Attach any keyboard/reply markup |
| `replyTo(int\|string $messageId)` | Reply to a specific message |
| `topic(string $topicId)` | Send to a forum topic |
| `sendWhen(bool $condition)` | Only send if condition is true |
| `send()` | Execute and return `TelegramResponse` |

#### Conditional Sending

```php
Telegram::message($chatId)
    ->text('Only sent if condition is true')
    ->sendWhen($user->wantsNotifications())
    ->send();
```

### Broadcasting

Send the same message to multiple chats with rate limiting and error handling:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

$responses = Telegram::broadcast(['-100001', '-100002', '-100003'])
    ->html('<b>Announcement</b>')
    ->silent()
    ->keyboard($keyboard)
    ->rateLimit(50) // 50ms delay between each send
    ->onFailure(function (string $chatId, Throwable $e) {
        Log::warning("Failed to send to {$chatId}: {$e->getMessage()}");
    })
    ->send();

// $responses is an array of TelegramResponse objects
```

You can also add recipients dynamically:

```php
$broadcast = Telegram::broadcast()
    ->to('-100001', '-100002')
    ->to('-100003')
    ->text('Hello everyone!')
    ->send();
```

Available methods on `PendingBroadcast`:

| Method | Description |
|--------|-------------|
| `to(string ...$chatIds)` | Add chat IDs to the broadcast list |
| `text(string $text)` | Set message text |
| `html(string $text)` | Set text with HTML parse mode |
| `markdown(string $text)` | Set text with MarkdownV2 parse mode |
| `silent()` | Disable notification sound |
| `protected()` | Protect content |
| `keyboard(ReplyMarkupInterface $markup)` | Attach keyboard |
| `rateLimit(int $milliseconds)` | Delay between sends (default: 0) |
| `onFailure(callable $callback)` | Handle per-chat failures: `fn(string $chatId, Throwable $e)` |
| `send()` | Execute broadcast, returns `array` of `TelegramResponse` |

### Edit, Delete, Forward & Copy Messages

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Edit message text
Telegram::editMessageText($chatId, $messageId, 'Updated text');

// Edit message caption
Telegram::editMessageCaption($chatId, $messageId, 'New caption');

// Edit reply markup (keyboard)
Telegram::editMessageReplyMarkup($chatId, $messageId, $inlineKeyboard->toArray());

// Edit message media
Telegram::editMessageMedia($chatId, $messageId, [
    'type' => 'photo',
    'media' => 'https://example.com/new-photo.jpg',
]);

// Delete a single message
Telegram::deleteMessage($chatId, $messageId);

// Delete multiple messages at once
Telegram::deleteMessages($chatId, [$msgId1, $msgId2, $msgId3]);

// Forward a message to another chat
Telegram::forwardMessage($toChatId, $fromChatId, $messageId);

// Copy a message (sends as new, without "Forwarded from" header)
Telegram::copyMessage($toChatId, $fromChatId, $messageId);
```

### Chat Actions

Show what the bot is "doing" to the user:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;
use SamuelTerra22\TelegramNotifications\Enums\ChatAction;

// Shortcut methods
Telegram::typing($chatId);
Telegram::uploadingPhoto($chatId);
Telegram::uploadingDocument($chatId);
Telegram::recordingVideo($chatId);
Telegram::recordingVoice($chatId);

// Using the enum directly
Telegram::sendChatAction($chatId, ChatAction::Typing);
Telegram::sendChatAction($chatId, ChatAction::ChooseSticker);
Telegram::sendChatAction($chatId, ChatAction::FindLocation);
Telegram::sendChatAction($chatId, ChatAction::RecordVideoNote);
Telegram::sendChatAction($chatId, ChatAction::UploadVideoNote);
```

### Chat Management

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Get chat info
$chat = Telegram::getChat($chatId);

// Get a specific member's info
$member = Telegram::getChatMember($chatId, $userId);

// Get total member count
$count = Telegram::getChatMemberCount($chatId);

// Pin a message
Telegram::pinChatMessage($chatId, $messageId);
Telegram::pinChatMessage($chatId, $messageId, disableNotification: true);

// Unpin a specific message or all messages
Telegram::unpinChatMessage($chatId, $messageId);
Telegram::unpinAllChatMessages($chatId);
```

### Bot Management & Commands

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Get bot info
$me = Telegram::getMe();

// Set bot commands (shown in the menu)
Telegram::setMyCommands([
    ['command' => 'start', 'description' => 'Start the bot'],
    ['command' => 'help', 'description' => 'Show help'],
    ['command' => 'settings', 'description' => 'Bot settings'],
]);

// Get current commands
$commands = Telegram::getMyCommands();

// Delete all commands
Telegram::deleteMyCommands();
```

### Webhook Management & Middleware

#### Setting Up Webhooks

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Set webhook
Telegram::setWebhook('https://example.com/telegram/webhook');

// Set webhook with secret token
Telegram::setWebhook('https://example.com/webhook', secretToken: 'my-secret');

// Get current webhook info
$info = Telegram::getWebhookInfo();

// Delete webhook
Telegram::deleteWebhook();
Telegram::deleteWebhook(dropPendingUpdates: true);
```

#### Verifying Incoming Webhooks

Protect your webhook endpoint with the built-in middleware:

```env
TELEGRAM_WEBHOOK_SECRET=your-secret-token
```

```php
// In your routes file
Route::post('/telegram/webhook', TelegramWebhookController::class)
    ->middleware('telegram.webhook');
```

The `telegram.webhook` middleware checks the `X-Telegram-Bot-Api-Secret-Token` header against your configured secret. If no secret is configured, all requests pass through.

### File Operations

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Get file info (returns file_path for downloading)
$file = Telegram::getFile($fileId);
// Download URL: https://api.telegram.org/file/bot<token>/<file_path>
```

#### Uploading Local Files

Use the low-level `TelegramBotApi::upload()` method for sending local files:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

Telegram::bot()->upload('sendDocument', [
    'chat_id' => $chatId,
    'caption' => 'Uploaded file',
], 'document', '/path/to/local/file.pdf');

Telegram::bot()->upload('sendPhoto', [
    'chat_id' => $chatId,
    'caption' => 'Local photo',
], 'photo', '/path/to/image.jpg');
```

### Callbacks & Inline Queries

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Answer a callback query (from inline keyboard button press)
Telegram::answerCallbackQuery($callbackQueryId, 'Done!');
Telegram::answerCallbackQuery($callbackQueryId, 'Are you sure?', showAlert: true);

// Answer an inline query
Telegram::answerInlineQuery($inlineQueryId, [
    [
        'type' => 'article',
        'id' => '1',
        'title' => 'Result',
        'input_message_content' => ['message_text' => 'Selected result'],
    ],
]);
```

### Moderation

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Ban a user
Telegram::banChatMember($chatId, $userId);

// Ban with expiry
Telegram::banChatMember($chatId, $userId, ['until_date' => now()->addDays(7)->timestamp]);

// Unban a user
Telegram::unbanChatMember($chatId, $userId);
Telegram::unbanChatMember($chatId, $userId, ['only_if_banned' => true]);
```

### Advanced Options

All Facade methods accept an optional `$options` array as the last parameter. This lets you pass **any** Telegram Bot API parameter without falling back to raw `call()`:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;
use SamuelTerra22\TelegramNotifications\Keyboards\InlineKeyboard;

// Send with extra options
Telegram::sendMessage($chatId, 'Hello', options: [
    'reply_markup' => InlineKeyboard::make()->callback('OK', 'ok'),
    'disable_notification' => true,
    'protect_content' => true,
    'message_thread_id' => 42,
]);

// reply_markup auto-encodes: ReplyMarkupInterface instances and arrays → JSON
Telegram::sendPhoto($chatId, $photoUrl, 'Caption', options: [
    'reply_markup' => $keyboard,  // auto-encoded to JSON
    'has_spoiler' => true,
]);

// Any Telegram Bot API parameter works
Telegram::sendMessage($chatId, 'Reply to this', options: [
    'reply_parameters' => ['message_id' => 123],
    'link_preview_options' => ['is_disabled' => true],
]);
```

#### Raw API Calls

For any Telegram Bot API method not wrapped by the package:

```php
// call() throws TelegramApiException on error
$result = Telegram::bot()->call('getChatAdministrators', [
    'chat_id' => $chatId,
]);

// callSilent() never throws (returns bool), safe for non-critical paths
$success = Telegram::bot()->callSilent('leaveChat', [
    'chat_id' => $chatId,
]);
```

### Message Effects

All message builders support the `effect()` method for animated visual effects (Bot API 7.4+):

```php
// All message builders support the effect() method (Bot API 7.4+)
TelegramMessage::create()
    ->to($chatId)
    ->content('Congratulations!')
    ->effect('5104841245755180586'); // confetti animation

TelegramPhoto::create()
    ->to($chatId)
    ->photo('https://example.com/photo.jpg')
    ->effect('5104841245755180586');
```

### Reactions

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Add emoji reaction
Telegram::setMessageReaction($chatId, $messageId, [
    ['type' => 'emoji', 'emoji' => 'thumbs up'],
]);

// Big animated reaction
Telegram::setMessageReaction($chatId, $messageId, [
    ['type' => 'emoji', 'emoji' => 'fire'],
], isBig: true);

// Custom emoji reaction
Telegram::setMessageReaction($chatId, $messageId, [
    ['type' => 'custom_emoji', 'custom_emoji_id' => '5368324170671202286'],
]);
```

### MarkdownV2 Escaping

```php
use SamuelTerra22\TelegramNotifications\Helpers\MarkdownV2;
use SamuelTerra22\TelegramNotifications\Messages\TelegramMessage;

// Escape special characters manually
$safe = MarkdownV2::escape('Hello_World *bold* [link](url)');
// Result: 'Hello\_World \*bold\* \[link\]\(url\)'

// Use the fluent builder method (auto-sets MarkdownV2 parse mode)
TelegramMessage::create()
    ->to($chatId)
    ->escapedMarkdown('Price: $10.00 (50% off!)')
    ->send();
```

### Blade View Rendering

Use Blade templates for message content:

```php
// Use a Blade template for message content
TelegramMessage::create()
    ->to($chatId)
    ->view('telegram.order-shipped', [
        'order' => $order,
        'tracking_url' => $trackingUrl,
    ]);

// With custom parse mode
TelegramMessage::create()
    ->to($chatId)
    ->view('telegram.alert', ['title' => 'Warning'], 'MarkdownV2');
```

Example Blade template (`resources/views/telegram/order-shipped.blade.php`):

```blade
<b>Order Shipped!</b>

Order #{{ $order->id }}
Status: {{ $order->status }}
<a href="{{ $tracking_url }}">Track your order</a>
```

### Media Group Builder

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramMediaGroup;

// Send an album of photos
TelegramMediaGroup::create()
    ->to($chatId)
    ->photo('https://example.com/1.jpg', 'First photo')
    ->photo('https://example.com/2.jpg', 'Second photo')
    ->video('https://example.com/video.mp4', 'A video')
    ->silent();

// Use in a notification
public function toTelegram(mixed $notifiable): TelegramMediaGroup
{
    return TelegramMediaGroup::create()
        ->photo($this->receipt->image_url, 'Receipt')
        ->document($this->receipt->pdf_url, 'PDF Receipt');
}
```

### Payments & Invoices

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Send an invoice (Telegram Stars)
Telegram::sendInvoice(
    chatId: $chatId,
    title: 'Premium Access',
    description: '30 days of premium features',
    payload: 'premium_30d_user_123',
    currency: 'XTR', // Telegram Stars
    prices: [['label' => 'Premium Access', 'amount' => 100]],
);

// Send invoice with third-party payment provider
Telegram::sendInvoice(
    chatId: $chatId,
    title: 'Product',
    description: 'Description',
    payload: 'product_123',
    currency: 'USD',
    prices: [['label' => 'Product', 'amount' => 1000]], // $10.00
    providerToken: 'your-provider-token',
);

// Create a shareable invoice link
$result = Telegram::createInvoiceLink(
    title: 'Donation',
    description: 'Support our project',
    payload: 'donation_user_123',
    currency: 'XTR',
    prices: [['label' => 'Donation', 'amount' => 50]],
);

// Answer pre-checkout query (in webhook handler)
Telegram::answerPreCheckoutQuery($preCheckoutQueryId, ok: true);
Telegram::answerPreCheckoutQuery($preCheckoutQueryId, ok: false, errorMessage: 'Item out of stock');

// Answer shipping query
Telegram::answerShippingQuery($shippingQueryId, ok: true, shippingOptions: [
    ['id' => 'standard', 'title' => 'Standard', 'prices' => [['label' => 'Shipping', 'amount' => 500]]],
]);

// Refund a Telegram Stars payment
Telegram::refundStarPayment($userId, $telegramPaymentChargeId);

// Get Telegram Stars transactions
$transactions = Telegram::getStarTransactions(offset: 0, limit: 100);
```

#### Paid Media

```php
Telegram::sendPaidMedia($chatId, starCount: 10, media: [
    ['type' => 'photo', 'media' => 'https://example.com/exclusive.jpg'],
], caption: 'Exclusive content');
```

### Gifts

```php
// Send a gift to a user
Telegram::sendGift($userId, $giftId, text: 'Happy birthday!');

// Get available gifts
$gifts = Telegram::getAvailableGifts();
```

### Stories

```php
// Post a story
Telegram::postStory($chatId, content: ['type' => 'photo', 'photo' => 'photo_file_id'], caption: 'Check this out!');

// Edit a story
Telegram::editStory($chatId, $storyId, content: ['type' => 'photo', 'photo' => 'new_photo_id']);

// Delete stories
Telegram::deleteStory($chatId, $storyId);
Telegram::deleteStories($chatId, [$storyId1, $storyId2]);
```

### Checklists

```php
use SamuelTerra22\TelegramNotifications\Messages\TelegramChecklist;

// Create a checklist
TelegramChecklist::create()
    ->to($chatId)
    ->title('Sprint Tasks')
    ->checkedItem('Design review')
    ->checkedItem('Write tests')
    ->uncheckedItem('Implementation')
    ->uncheckedItem('Code review')
    ->item('Deploy', checked: false);

// Via facade
Telegram::sendChecklist($chatId, 'Todo', [
    ['text' => 'Buy groceries', 'checked' => false],
    ['text' => 'Clean house', 'checked' => true],
]);

// Use in a notification
public function toTelegram(mixed $notifiable): TelegramChecklist
{
    return TelegramChecklist::create()
        ->title('Deployment Checklist')
        ->checkedItem('Tests passing')
        ->uncheckedItem('Deploy to production');
}
```

#### Suggested Posts

```php
Telegram::approveSuggestedPost($chatId, $messageId);
Telegram::declineSuggestedPost($chatId, $messageId);
```

#### Profile Management

```php
Telegram::setMyProfilePhoto($photoFileId);
Telegram::setMyProfilePhoto($photoFileId, isPersonal: true);
Telegram::removeMyProfilePhoto();
```

#### Streaming Message Drafts

```php
// Send partial/draft messages (Bot API 9.3, useful for AI/LLM streaming)
Telegram::sendMessageDraft($chatId, 'Partial response so far...');
Telegram::sendMessageDraft($chatId, 'Complete response.', businessConnectionId: 'conn_123');
```

## Logging (Monolog Handler)

Send application logs directly to Telegram. The handler uses `callSilent()` internally, so it **never** crashes your application even if the Telegram API is unreachable.

### Setup

Add the Telegram channel to `config/logging.php`:

```php
'channels' => [
    // ...
    'telegram' => [
        'driver' => 'custom',
        'via' => \SamuelTerra22\TelegramNotifications\Logging\CreateTelegramLogger::class,
        'level' => env('LOG_TELEGRAM_LEVEL', 'error'),
    ],
],
```

Configure in `.env`:

```env
TELEGRAM_LOG_ENABLED=true
TELEGRAM_LOG_CHAT_ID=-1001234567890
TELEGRAM_LOG_TOPIC_ID=99
LOG_TELEGRAM_LEVEL=error
```

### Usage

```php
// Send errors to Telegram
Log::channel('telegram')->error('Something went wrong');

// With context
Log::channel('telegram')->critical('Payment failed', [
    'order_id' => 123,
    'amount' => 99.99,
]);

// With exception
Log::channel('telegram')->error($exception->getMessage(), [
    'exception' => $exception,
]);
```

### Exception Handler Integration

Report all exceptions to Telegram in `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->reportable(function (\Throwable $e) {
        try {
            if (config('telegram-notifications.logging.enabled')) {
                Log::channel('telegram')->error($e->getMessage(), [
                    'exception' => $e,
                ]);
            }
        } catch (\Throwable) {
            // Never break the application
        }
    });
})
```

### Log Message Format

Log messages are formatted with:

- Level emoji (e.g. CRITICAL, ERROR, WARNING)
- Application name and environment
- Authenticated user info (ID and email, when available)
- Message text
- Exception class, file, and line number (when applicable)
- Truncated stack trace (max 2000 chars)
- Total message capped at 4096 characters (Telegram limit)

If HTML formatting fails, the handler automatically falls back to plain text.

## Artisan Commands

### `telegram:get-me`

Display bot information:

```bash
php artisan telegram:get-me
php artisan telegram:get-me --bot=alerts
```

Output shows: ID, Name, Username, Is Bot, Can Join Groups, Can Read Messages, Supports Inline.

### `telegram:set-webhook`

Manage webhook configuration:

```bash
# Set webhook URL
php artisan telegram:set-webhook --url=https://example.com/telegram/webhook

# Set with secret token
php artisan telegram:set-webhook --url=https://example.com/webhook --secret=my-secret

# Set for a specific bot
php artisan telegram:set-webhook --url=https://example.com/webhook --bot=alerts

# Delete webhook
php artisan telegram:set-webhook --delete

# Delete and drop pending updates
php artisan telegram:set-webhook --delete --drop-pending
```

### `telegram:send`

Send a message from the command line:

```bash
# Send a message
php artisan telegram:send "Hello from CLI"

# Send to specific chat
php artisan telegram:send "Alert!" --chat=-1001234567890

# Send silently to a topic using a specific bot
php artisan telegram:send "Deploy complete" --bot=alerts --topic=42 --silent
```

## Webhook Handler

The package provides an abstract `WebhookHandler` base class for processing incoming Telegram updates. Create a concrete handler by extending it:

```php
use Illuminate\Http\JsonResponse;
use SamuelTerra22\TelegramNotifications\Http\WebhookHandler;
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

class MyBotHandler extends WebhookHandler
{
    protected function onStartCommand(array $message, string $args): JsonResponse
    {
        Telegram::sendMessage($message['chat']['id'], 'Welcome! Use /help for commands.');
        return $this->ok();
    }

    protected function onHelpCommand(array $message, string $args): JsonResponse
    {
        Telegram::sendMessage($message['chat']['id'], 'Available commands: /start, /help');
        return $this->ok();
    }

    protected function onMessage(array $message): JsonResponse
    {
        // Handle non-command messages
        Telegram::sendMessage($message['chat']['id'], "You said: {$message['text']}");
        return $this->ok();
    }

    protected function onCallbackQuery(array $callbackQuery): JsonResponse
    {
        Telegram::answerCallbackQuery($callbackQuery['id'], 'Button pressed!');
        return $this->ok();
    }
}
```

Register it in your routes:

```php
Route::post('/telegram/webhook', function (Request $request) {
    return app(MyBotHandler::class)->handle($request);
})->middleware('telegram.webhook');
```

The handler automatically routes updates:
- `/command args` -> `onCommandCommand($message, $args)` (dynamic method dispatch)
- `/command@BotName args` -> strips the `@BotName` portion
- Plain messages -> `onMessage($message)`
- Callback queries -> `onCallbackQuery($callbackQuery)`
- Inline queries -> `onInlineQuery($inlineQuery)`
- Pre-checkout queries -> `onPreCheckoutQuery($query)`
- Shipping queries -> `onShippingQuery($query)`
- Message reactions -> `onMessageReaction($reaction)`
- Unknown commands -> `onUnknownCommand($command, $message, $args)`
- Unrecognized updates -> `onUnhandledUpdate($update)`

## Queued Broadcasting

Dispatch broadcasts as Laravel queue jobs for background processing:

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Dispatch broadcast as a queued job
Telegram::broadcast($chatIds)
    ->html('<b>Scheduled announcement</b>')
    ->rateLimit(50)
    ->queue();

// Dispatch to a specific queue
Telegram::broadcast($chatIds)
    ->text('Newsletter')
    ->queue('telegram');

// Dispatch to a specific connection
Telegram::broadcast($chatIds)
    ->text('Important update')
    ->queue(connection: 'redis');
```

The `SendTelegramBroadcast` job handles individual failures gracefully -- if sending to one chat fails, it continues to the rest.

## Error Handling

API errors throw `TelegramApiException` with rich context:

```php
use SamuelTerra22\TelegramNotifications\Exceptions\TelegramApiException;

try {
    Telegram::sendMessage($chatId, 'Hello');
} catch (TelegramApiException $e) {
    $e->getMessage();              // Human-readable error
    $e->getStatusCode();           // HTTP status code (e.g. 400, 403, 429)
    $e->getApiMethod();            // API method called (e.g. 'sendMessage')
    $e->getTelegramDescription();  // Original Telegram error description
    $e->getRetryAfter();           // Seconds to wait (only on 429), null otherwise
    $e->isRateLimited();           // true if HTTP 429
}
```

### Rate Limiting

The package handles HTTP 429 (Too Many Requests) with configurable exponential backoff:

1. When a `429` response is received, the client retries with exponential backoff
2. If the response includes `retry_after`, that value is used as the delay
3. Otherwise, delay doubles each attempt: base_delay * 2^(attempt-1)
4. Optional jitter adds randomness to prevent thundering herd
5. After `max_attempts` retries, `TelegramApiException` is thrown

Configure via `config/telegram-notifications.php` or environment variables:

```php
'retry' => [
    'max_attempts' => (int) env('TELEGRAM_RETRY_MAX_ATTEMPTS', 3),
    'base_delay_ms' => (int) env('TELEGRAM_RETRY_BASE_DELAY_MS', 1000),
    'use_jitter' => (bool) env('TELEGRAM_RETRY_USE_JITTER', true),
],
```

### Silent Calls

For non-critical paths where you don't want exceptions:

```php
// Returns true on success, false on any error (never throws)
$success = Telegram::bot()->callSilent('sendMessage', [
    'chat_id' => $chatId,
    'text' => 'Optional notification',
]);
```

The logging handler (`TelegramHandler`) always uses `callSilent()` to ensure log delivery failures never crash your application.

## Multi-Bot Support

### Configuration

```php
// config/telegram-notifications.php
'default' => 'default',

'bots' => [
    'default' => [
        'token' => env('TELEGRAM_BOT_TOKEN'),
        'username' => env('TELEGRAM_BOT_USERNAME'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
    ],
    'alerts' => [
        'token' => env('TELEGRAM_ALERTS_BOT_TOKEN'),
        'username' => env('TELEGRAM_ALERTS_BOT_USERNAME'),
        'chat_id' => env('TELEGRAM_ALERTS_CHAT_ID'),
    ],
    'support' => [
        'token' => env('TELEGRAM_SUPPORT_BOT_TOKEN'),
        'username' => env('TELEGRAM_SUPPORT_BOT_USERNAME'),
        'chat_id' => env('TELEGRAM_SUPPORT_CHAT_ID'),
        'topic_id' => env('TELEGRAM_SUPPORT_TOPIC_ID'),
    ],
],
```

### Switching Bots

```php
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Use the default bot
Telegram::sendMessage($chatId, 'From default bot');

// Switch to another bot
Telegram::bot('alerts')->call('sendMessage', [
    'chat_id' => $chatId,
    'text' => 'From alerts bot',
]);

// In message builders
TelegramMessage::create()
    ->bot('alerts')
    ->to($chatId)
    ->content('Sent via alerts bot');

// In fluent builder - uses the default bot
Telegram::message($chatId)->text('Hello')->send();

// Access bot config
Telegram::getDefaultBot();   // 'default'
Telegram::getBotsConfig();   // full bots config array
```

### Bot Usernames & Integration Links

Each bot can have its own `username` for generating `t.me` integration links:

```php
// Get bot username
Telegram::getUsername();           // 'your_bot'
Telegram::getUsername('alerts');   // 'alerts_bot'

// Generate integration links
Telegram::getIntegrationLink();
// => 'https://t.me/your_bot'

Telegram::getIntegrationLink('abc123');
// => 'https://t.me/your_bot?start=abc123'

Telegram::getIntegrationLink('start_param', 'alerts');
// => 'https://t.me/alerts_bot?start=start_param'
```

Bots are lazy-loaded: the `TelegramBotApi` instance for each bot is only created when first accessed via `bot()`.

## Enums Reference

### ParseMode

```php
use SamuelTerra22\TelegramNotifications\Enums\ParseMode;

ParseMode::HTML;        // 'HTML'
ParseMode::MarkdownV2;  // 'MarkdownV2'
ParseMode::Markdown;    // 'Markdown' (legacy)
```

### ChatAction

```php
use SamuelTerra22\TelegramNotifications\Enums\ChatAction;

ChatAction::Typing;           // 'typing'
ChatAction::UploadPhoto;      // 'upload_photo'
ChatAction::RecordVideo;      // 'record_video'
ChatAction::UploadVideo;      // 'upload_video'
ChatAction::RecordVoice;      // 'record_voice'
ChatAction::UploadVoice;      // 'upload_voice'
ChatAction::UploadDocument;   // 'upload_document'
ChatAction::ChooseSticker;    // 'choose_sticker'
ChatAction::FindLocation;     // 'find_location'
ChatAction::RecordVideoNote;  // 'record_video_note'
ChatAction::UploadVideoNote;  // 'upload_video_note'
```

## Typed Responses

The fluent builder returns `TelegramResponse` objects with typed accessors:

```php
$response = Telegram::message($chatId)->text('Hello')->send();
```

| Method | Return Type | Description |
|--------|-------------|-------------|
| `ok()` | `bool` | Whether the API request succeeded |
| `messageId()` | `?int` | The sent message ID |
| `date()` | `?Carbon` | Message timestamp as Carbon instance |
| `chat()` | `?array` | Chat data (`id`, `type`, `title`, etc.) |
| `text()` | `?string` | Message text content |
| `result()` | `array` | Full API result object |
| `toArray()` | `array` | Raw response data |

## Testing

The package uses Laravel's `Http::fake()` for all API calls, making it trivial to test:

```php
use Illuminate\Support\Facades\Http;
use SamuelTerra22\TelegramNotifications\Facades\Telegram;

// Fake all Telegram API calls
Http::fake([
    'api.telegram.org/*' => Http::response([
        'ok' => true,
        'result' => ['message_id' => 1],
    ]),
]);

// Test sending a message
Telegram::sendMessage('-1001234567890', 'Hello');

// Assert it was sent
Http::assertSent(function ($request) {
    return str_contains($request->url(), '/sendMessage')
        && $request['text'] === 'Hello';
});
```

### Testing Notifications

```php
Http::fake([
    'api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 1]]),
]);

$user->notify(new OrderShipped($order));

Http::assertSent(function ($request) {
    return str_contains($request->url(), '/sendMessage')
        && str_contains($request['text'], 'Order Shipped');
});
```

### Testing with Sequences

```php
Http::fake(function ($request) {
    static $count = 0;
    $count++;
    return Http::response([
        'ok' => true,
        'result' => ['message_id' => $count],
    ]);
});
```

### Asserting No Calls Were Made

```php
Http::fake();

// ... code that conditionally sends ...

Http::assertNothingSent();
```

## API Quick Reference

### Telegram Facade Methods

#### Messaging

| Method | Parameters | Returns |
|--------|------------|---------|
| `sendMessage` | `string $chatId, string $text, ?string $parseMode = 'HTML', ?string $topicId = null, array $options = []` | `array` |
| `sendPhoto` | `string $chatId, string $photo, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendDocument` | `string $chatId, string $document, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendVideo` | `string $chatId, string $video, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendAudio` | `string $chatId, string $audio, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendVoice` | `string $chatId, string $voice, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendAnimation` | `string $chatId, string $animation, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendSticker` | `string $chatId, string $sticker, array $options = []` | `array` |
| `sendVideoNote` | `string $chatId, string $videoNote, array $options = []` | `array` |
| `sendMediaGroup` | `string $chatId, array $media, array $options = []` | `array` |
| `sendLocation` | `string $chatId, float $latitude, float $longitude, array $options = []` | `array` |
| `sendVenue` | `string $chatId, float $lat, float $lng, string $title, string $address, array $options = []` | `array` |
| `sendContact` | `string $chatId, string $phone, string $firstName, ?string $lastName = null, array $options = []` | `array` |
| `sendPoll` | `string $chatId, string $question, array $options, array $extra = []` | `array` |
| `sendDice` | `string $chatId, ?string $emoji = null, array $options = []` | `array` |

#### Message Operations

| Method | Parameters | Returns |
|--------|------------|---------|
| `editMessageText` | `string $chatId, int\|string $messageId, string $text, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `editMessageCaption` | `string $chatId, int\|string $messageId, string $caption, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `editMessageReplyMarkup` | `string $chatId, int\|string $messageId, array $replyMarkup, array $options = []` | `array` |
| `editMessageMedia` | `string $chatId, int\|string $messageId, array $media, array $options = []` | `array` |
| `deleteMessage` | `string $chatId, int\|string $messageId, array $options = []` | `array` |
| `deleteMessages` | `string $chatId, array $messageIds, array $options = []` | `array` |
| `forwardMessage` | `string $chatId, string $fromChatId, int\|string $messageId, array $options = []` | `array` |
| `copyMessage` | `string $chatId, string $fromChatId, int\|string $messageId, array $options = []` | `array` |

#### Chat Actions & Management

| Method | Parameters | Returns |
|--------|------------|---------|
| `sendChatAction` | `string $chatId, ChatAction $action, array $options = []` | `array` |
| `typing` | `string $chatId` | `array` |
| `uploadingPhoto` | `string $chatId` | `array` |
| `uploadingDocument` | `string $chatId` | `array` |
| `recordingVideo` | `string $chatId` | `array` |
| `recordingVoice` | `string $chatId` | `array` |
| `getChat` | `string $chatId, array $options = []` | `array` |
| `getChatMember` | `string $chatId, int\|string $userId, array $options = []` | `array` |
| `getChatMemberCount` | `string $chatId, array $options = []` | `array` |
| `pinChatMessage` | `string $chatId, int\|string $messageId, bool $disableNotification = false, array $options = []` | `array` |
| `unpinChatMessage` | `string $chatId, ?int $messageId = null, array $options = []` | `array` |
| `unpinAllChatMessages` | `string $chatId, array $options = []` | `array` |

#### Bot & Webhook

| Method | Parameters | Returns |
|--------|------------|---------|
| `getMe` | | `array` |
| `setMyCommands` | `array $commands, array $options = []` | `array` |
| `getMyCommands` | `array $options = []` | `array` |
| `deleteMyCommands` | `array $options = []` | `array` |
| `getFile` | `string $fileId, array $options = []` | `array` |
| `setWebhook` | `string $url, ?string $secretToken = null, array $options = []` | `array` |
| `deleteWebhook` | `bool $dropPendingUpdates = false, array $options = []` | `array` |
| `getWebhookInfo` | | `array` |

#### Callbacks, Queries & Moderation

| Method | Parameters | Returns |
|--------|------------|---------|
| `answerCallbackQuery` | `string $id, ?string $text = null, bool $showAlert = false, array $options = []` | `array` |
| `answerInlineQuery` | `string $id, array $results, array $options = []` | `array` |
| `setMessageReaction` | `string $chatId, int\|string $messageId, array $reaction, bool $isBig = false, array $options = []` | `array` |
| `banChatMember` | `string $chatId, int\|string $userId, array $options = []` | `array` |
| `unbanChatMember` | `string $chatId, int\|string $userId, array $options = []` | `array` |

#### Payments & Commerce

| Method | Parameters | Returns |
|--------|------------|---------|
| `sendInvoice` | `string $chatId, string $title, string $description, string $payload, string $currency, array $prices, ?string $providerToken = null, array $options = []` | `array` |
| `createInvoiceLink` | `string $title, string $description, string $payload, string $currency, array $prices, ?string $providerToken = null, array $options = []` | `array` |
| `answerPreCheckoutQuery` | `string $preCheckoutQueryId, bool $ok, ?string $errorMessage = null, array $options = []` | `array` |
| `answerShippingQuery` | `string $shippingQueryId, bool $ok, ?array $shippingOptions = null, ?string $errorMessage = null, array $options = []` | `array` |
| `refundStarPayment` | `int\|string $userId, string $telegramPaymentChargeId, array $options = []` | `array` |
| `getStarTransactions` | `?int $offset = null, ?int $limit = null, array $options = []` | `array` |
| `sendPaidMedia` | `string $chatId, int $starCount, array $media, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `sendGift` | `int\|string $userId, string $giftId, ?string $text = null, ?string $textParseMode = null, array $options = []` | `array` |
| `getAvailableGifts` | `array $options = []` | `array` |

#### Stories

| Method | Parameters | Returns |
|--------|------------|---------|
| `postStory` | `string $chatId, array $content, ?int $activePeriod = null, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `editStory` | `string $chatId, int\|string $storyId, array $content, ?string $caption = null, ?string $parseMode = 'HTML', array $options = []` | `array` |
| `deleteStory` | `string $chatId, int\|string $storyId, array $options = []` | `array` |
| `deleteStories` | `string $chatId, array $storyIds, array $options = []` | `array` |

#### Checklists & Other

| Method | Parameters | Returns |
|--------|------------|---------|
| `sendChecklist` | `string $chatId, string $title, array $checklist, array $options = []` | `array` |
| `sendMessageDraft` | `string $chatId, string $text, ?string $parseMode = 'HTML', ?string $businessConnectionId = null, array $options = []` | `array` |
| `approveSuggestedPost` | `string $chatId, int\|string $messageId, array $options = []` | `array` |
| `declineSuggestedPost` | `string $chatId, int\|string $messageId, array $options = []` | `array` |
| `setMyProfilePhoto` | `string $photo, bool $isPersonal = false, array $options = []` | `array` |
| `removeMyProfilePhoto` | `bool $isPersonal = false, array $options = []` | `array` |

#### Fluent Builders

| Method | Parameters | Returns |
|--------|------------|---------|
| `message` | `string $chatId` | `PendingMessage` |
| `broadcast` | `array $chatIds = []` | `PendingBroadcast` |
| `bot` | `?string $name = null` | `TelegramBotApi` |

### TelegramBotApi Methods

| Method | Description |
|--------|-------------|
| `call(string $method, array $params = [])` | Make API call, throws `TelegramApiException` on error |
| `callSilent(string $method, array $params = [])` | Make API call, returns `bool` (never throws) |
| `upload(string $method, array $params, string $fileField, string $filePath)` | Upload local file via multipart |
| `getToken()` | Get the bot token |
| `getBaseUrl()` | Get the API base URL |
| `getTimeout()` | Get the HTTP timeout |

## Roadmap

All features from the original roadmap have been implemented. Future ideas:

- **TelegramVideoNote builder** - Fluent builder for round video messages
- **Conversation/state management** - Multi-step interactive flows with state serialization
- **Database-backed bot/chat models** - Eloquent models for persistent bot and chat management
- **Batch queue integration** - `Bus::batch()` support for broadcast progress tracking
- **Mini App support** - Enhanced Web App button and data validation helpers

## Development

Docker-based development (PHP 8.4 CLI Alpine):

```bash
make build                          # Build Docker image
make install                        # Install Composer dependencies
make test                           # Run all tests
make test-coverage                  # Tests with HTML coverage report
make test-filter FILTER=BotApi      # Run filtered tests
make format                         # Format code with Laravel Pint
make analyse                        # Static analysis with PHPStan level 5
make shell                          # Open shell in container
make clean                          # Remove containers and volumes
```

Without Docker:

```bash
composer test                       # vendor/bin/pest
composer test-coverage              # vendor/bin/pest --coverage --min=95
composer format                     # vendor/bin/pint
composer analyse                    # vendor/bin/phpstan
vendor/bin/pest --filter=ClassName  # Run a single test file
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please ensure tests pass and code follows the project style (Laravel Pint).

This project uses [conventional commits](https://www.conventionalcommits.org/) for automatic versioning:

- `fix: description` — patch release
- `feat: description` — minor release
- `feat!: description` — major release

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
