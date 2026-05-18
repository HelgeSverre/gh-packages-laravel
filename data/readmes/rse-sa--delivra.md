# Delivra - Multi-Channel Laravel Notification Package

Delivra is a developer-friendly, multichannel Laravel notification package that combines SMS and Telegram messaging with a unified API, intelligent error handling, and extensive testing.

## Features

- **SMS Support**: Multiple Saudi gateways (Unifonic, Msegat, Yamamah, ShamelSMS)
- **Telegram Support**: All message types (Text, Photo, Video, Document, Poll, Location, Contact)
- **Hybrid Exception Strategy**: Single recipient throws immediately; batch sends all then throws with details
- **HTTP Timeouts**: Configurable timeouts and retries prevent hanging requests
- **Rich Response Objects**: Get message IDs, timestamps, and full API responses
- **Laravel Notifications**: Native integration with Laravel's notification channels
- **Fluent Interface**: Clean, chainable API for all operations

## Installation

```bash
composer require rse-sa/delivra
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=delivra-config
```

## Configuration

Set up your environment variables in `.env`:

```env
# SMS Configuration
DELIVRA_SMS_DRIVER=unifonic
DELIVRA_SMS_CREDITS=true

DELIVRA_SMS_UNIFONIC_KEY=your-key
DELIVRA_SMS_UNIFONIC_SENDER=your-sender

# Telegram Configuration
DELIVRA_TELEGRAM_TOKEN=your-bot-token
DELIVRA_TELEGRAM_CHAT_ID=your-default-chat-id
DELIVRA_TELEGRAM_PARSE_MODE=html

# HTTP Client Configuration
DELIVRA_HTTP_TIMEOUT=10
DELIVRA_HTTP_CONNECT_TIMEOUT=5
DELIVRA_HTTP_RETRIES=3
DELIVRA_HTTP_RETRY_DELAY=100
```

## Quick Start

### SMS

```php
use RSE\Delivra\Facades\Sms;

// Single recipient
sms()->to('9665000000')->body('Hello')->send();

// Multiple recipients (with partial failure tracking)
try {
    $batch = sms()->to(['9665000000', '9666000000'])->body('Hello')->send();
} catch (\RSE\Delivra\Exceptions\Sms\SmsBatchException $e) {
    $batch = $e->getBatchResponse();
    echo "Sent: {$batch->successfulCount()}, Failed: {$batch->failedCount()}";
    foreach ($batch->failures() as $failure) {
        echo "Failed to send to {$failure['number']}: {$failure['error']}";
    }
}

// Using facade
Sms::to('9665000000')->body('Hello')->send();

// Check balance
sms()->getBalance();
```

### Telegram

```php
use RSE\Delivra\Facades\Telegram;

// Send text message
telegram()->text('Hello <b>World</b>!')->to('123456789')->send();

// Send photo
telegram()->photo('/path/to/photo.jpg')
    ->caption('Look at this!')
    ->to('123456789')
    ->send();

// Send video
telegram()->video('/path/to/video.mp4')
    ->caption('Check this video')
    ->duration(30)
    ->to('123456789')
    ->send();

// Send document
telegram()->document('/path/to/file.pdf')
    ->caption('Here is the file')
    ->to('123456789')
    ->send();

// Send poll
telegram()->poll('What is your favorite color?', ['Red', 'Blue', 'Green'])
    ->to('123456789')
    ->send();

// Send location
telegram()->location(24.7136, 46.6753)
    ->to('123456789')
    ->send();

// Send contact
telegram()->contact('9665000000', 'John Doe')
    ->to('123456789')
    ->send();

// With buttons
telegram()->text('Click below')
    ->addUrlButton('Visit Site', 'https://example.com')
    ->to('123456789')
    ->send();

// Silent message
telegram()->text('Quiet message')->silently()->send();

// Protected content (prevents forwarding)
telegram()->text('Secret')->withProtectedContent()->send();
```

### Multiple Telegram Recipients

```php
// Send to multiple recipients
try {
    $batch = telegram()->text('Broadcast message')
        ->to(['chat-1', 'chat-2', 'chat-3'])
        ->send();
} catch (\RSE\Delivra\Exceptions\Telegram\TelegramBatchException $e) {
    $batch = $e->getBatchResponse();
    foreach ($batch->failures() as $failure) {
        echo "Failed to send to {$failure['chatId']}: {$failure['error']}";
    }
}
```

## Laravel Notifications

### SMS Notification

```php
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use RSE\Delivra\Sms\SmsBuilder;

class OrderShipped extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['sms']; // Use string alias
    }

    public function toSms($notifiable): SmsBuilder
    {
        return SmsBuilder::make()
            ->body("Your order has been shipped!");
    }
}
```

### Telegram Notification

```php
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use RSE\Delivra\Telegram\Messages\TextMessage;

class NewAlert extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['telegram'];
    }

    public function toTelegram($notifiable): TextMessage
    {
        return TextMessage::make()
            ->message('<b>New Alert!</b>')
            ->addUrlButton('View Details', 'https://example.com')
            ->asHtml();
    }
}
```

### Mixed Notification

```php
public function via($notifiable): array
{
    return ['mail', 'sms', 'telegram'];
}
```

### Notifiable Model

```php
use Illuminate\Notifications\Notifiable;

class User extends Model
{
    use Notifiable;

    public function routeNotificationForSms($notification): string
    {
        return $this->phone;
    }

    public function routeNotificationForTelegram($notification): string
    {
        return $this->telegram_chat_id;
    }
}
```

## Exception Handling

Delivra throws specific exceptions for different error scenarios:

### SMS Exceptions

```php
use RSE\Delivra\Exceptions\Sms\{
    SmsBatchException,
    InvalidPhoneNumberException,
    OutOfBalanceException,
    DriverNotFoundException,
    ApiErrorException
};

try {
    sms()->to('invalid')->body('Test')->send();
} catch (InvalidPhoneNumberException $e) {
    // Handle invalid number
    echo "Invalid number: {$e->getNumber()}";
} catch (OutOfBalanceException $e) {
    // Handle insufficient balance
    echo "Insufficient balance for driver: {$e->getDriver()}";
} catch (SmsBatchException $e) {
    // Handle batch failures
    $batch = $e->getBatchResponse();
    // Handle partial successes/failures
}
```

### Telegram Exceptions

```php
use RSE\Delivra\Exceptions\Telegram\{
    TelegramBatchException,
    InvalidTokenException,
    InvalidChatIdException,
    ApiErrorException,
    FileUploadException
};

try {
    telegram()->text('Test')->to('invalid-chat')->send();
} catch (InvalidChatIdException $e) {
    // Handle invalid chat ID
    echo "Invalid chat ID: {$e->getChatId()}";
} catch (TelegramBatchException $e) {
    // Handle batch failures
    $batch = $e->getBatchResponse();
    // Handle partial successes/failures
}
```

## Advanced Usage

### Custom SMS Driver

```php
use RSE\Delivra\Contracts\SmsDriver;
use RSE\Delivra\Sms\SmsResponse;

class CustomDriver extends SmsDriver
{
    public function formatNumber(string $number): string
    {
        // Custom number formatting
        return $number;
    }

    protected function sendSingle(string $recipient): SmsResponse
    {
        // Your implementation
        $response = new SmsResponse($this->driver, $recipient, $this->builder->getBody());
        return $response->setSuccessful();
    }

    public function getBalance(): ?int
    {
        // Return account balance
        return 100;
    }
}

// Register in config/delivra.php:
'sms' => [
    'drivers' => [
        'custom' => [
            'class' => CustomDriver::class,
            'api_key' => 'your-key',
        ],
    ],
],
```

### Response Objects

```php
use RSE\Delivra\Telegram\TelegramResponse;
use RSE\Delivra\Sms\SmsResponse;

// SMS Response
$smsResponse = sms()->to('9665000000')->body('Test')->send();
if ($smsResponse->successful()) {
    echo "Message ID: {$smsResponse->getMessageId()}";
    echo "Credits used: {$smsResponse->getCredits()}";
}

// Telegram Response
$telegramResponse = telegram()->text('Test')->to('123456')->send();
if ($telegramResponse->successful()) {
    echo "Message ID: {$telegramResponse->getMessageId()}";
    echo "Sent at: {$telegramResponse->getTimestamp()}";
}
```

## Configuration Reference

### SMS Configuration

```php
'sms' => [
    'default' => env('DELIVRA_SMS_DRIVER', 'null'),
    'credits' => env('DELIVRA_SMS_CREDITS', true),
    'drivers' => [
        'unifonic' => [
            'key' => env('DELIVRA_SMS_UNIFONIC_KEY'),
            'sender' => env('DELIVRA_SMS_UNIFONIC_SENDER'),
        ],
        // ... other drivers
    ],
],
```

### Telegram Configuration

```php
'telegram' => [
    'default_token' => env('DELIVRA_TELEGRAM_TOKEN'),
    'default_chat_id' => env('DELIVRA_TELEGRAM_CHAT_ID'),
    'parse_mode' => env('DELIVRA_TELEGRAM_PARSE_MODE', 'html'),
],
```

### HTTP Configuration

```php
'http' => [
    'timeout' => env('DELIVRA_HTTP_TIMEOUT', 10),         // Request timeout in seconds
    'connect_timeout' => env('DELIVRA_HTTP_CONNECT_TIMEOUT', 5),  // Connection timeout in seconds
    'retries' => env('DELIVRA_HTTP_RETRIES', 3),          // Number of retries
    'retry_delay' => env('DELIVRA_HTTP_RETRY_DELAY', 100), // Delay between retries in milliseconds
],
```

## Testing

```bash
composer test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security related issues, please email security@rse.sa instead of using the issue tracker.


## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
