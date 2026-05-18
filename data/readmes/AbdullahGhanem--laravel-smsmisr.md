# Laravel SMS Misr (EGYPT)

[![Latest Stable Version](https://poser.pugx.org/ghanem/laravel-smsmisr/v/stable)](https://packagist.org/packages/ghanem/laravel-smsmisr) [![Total Downloads](https://poser.pugx.org/ghanem/laravel-smsmisr/downloads)](https://packagist.org/packages/ghanem/laravel-smsmisr) [![License](https://poser.pugx.org/ghanem/laravel-smsmisr/license)](https://packagist.org/packages/ghanem/laravel-smsmisr)

Laravel package to send SMS and SMS notifications via [SMS Misr](https://www.smsmisr.com/) from your Laravel application.

## Requirements

- PHP >= 8.1
- Laravel 10, 11, or 12
- SMS Misr account (username/password or API token)

## Installation

```bash
composer require ghanem/laravel-smsmisr
```

The package uses Laravel's auto-discovery, so the service provider and facade are registered automatically.

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Ghanem\LaravelSmsmisr\SmsmisrServiceProvider" --tag="smsmisr-config"
```

Add your credentials to `.env`:

```dotenv
SMSMISR_USERNAME=my_username
SMSMISR_PASSWORD=my_password
SMSMISR_SENDER=my_sender
SMSMISR_ENVIRONMENT=1
```

Or use token-based authentication:

```dotenv
SMSMISR_TOKEN=my_api_token
SMSMISR_SENDER=my_sender
SMSMISR_ENVIRONMENT=1
```

## Usage

### Sending SMS

```php
use Ghanem\LaravelSmsmisr\Facades\Smsmisr;

$response = Smsmisr::send('Hello world', '01012345678');

if ($response->isSuccessful()) {
    echo $response->message;
}
```

Using the service container:

```php
$response = app('smsmisr')->send('Hello world', '01012345678');
```

### Bulk SMS

Send to multiple recipients (up to 500K numbers per request):

```php
$response = Smsmisr::sendBulk('Hello everyone', [
    '01012345678',
    '01112345678',
    '01212345678',
]);
```

### OTP / Verification SMS

```php
$response = Smsmisr::sendVerify('1234', '01012345678', null, 'your-template');
```

### Scheduled SMS

```php
$response = Smsmisr::send(
    message: 'Happy Birthday!',
    to: '01012345678',
    scheduledAt: new DateTime('2026-04-01 09:00:00'),
);

// Also works with bulk
$response = Smsmisr::sendBulk(
    message: 'Sale starts now!',
    recipients: ['01012345678', '01112345678'],
    scheduledAt: new DateTime('2026-04-01 09:00:00'),
);
```

### Queue (Async Sending)

Send SMS in the background via Laravel queues:

```php
use Ghanem\LaravelSmsmisr\Facades\Smsmisr;

// Queue a single SMS
Smsmisr::queue('Hello', '01012345678');

// Queue bulk SMS
Smsmisr::queueBulk('Hello everyone', ['01012345678', '01112345678']);

// Queue verification SMS
Smsmisr::queueVerify('1234', '01012345678', null, 'your-template');
```

Configure the queue name in `.env`:

```dotenv
SMSMISR_QUEUE=sms
```

Or dispatch the jobs directly:

```php
use Ghanem\LaravelSmsmisr\Jobs\SendSmsJob;
use Ghanem\LaravelSmsmisr\Jobs\SendBulkSmsJob;
use Ghanem\LaravelSmsmisr\Jobs\SendVerifySmsJob;

SendSmsJob::dispatch('Hello', '01012345678');
SendBulkSmsJob::dispatch('Hello', ['01012345678', '01112345678']);
SendVerifySmsJob::dispatch('1234', '01012345678', null, 'template');
```

### Checking Balance

```php
$response = Smsmisr::balance();
echo $response->raw['balance'];

$response = Smsmisr::balanceVerify();
```

### Health Check

```php
if (Smsmisr::health()) {
    // API is reachable and credentials are valid
}
```

### Response Object

All API methods return a `SmsmisrResponse` object:

```php
$response->isSuccessful(); // bool
$response->isFailed();     // bool
$response->code;           // int (e.g. 1901)
$response->message;        // string
$response->raw;            // array (full API response)
$response->toArray();      // array
```

### Error Handling

```php
use Ghanem\LaravelSmsmisr\Exceptions\SmsmisrApiException;
use Ghanem\LaravelSmsmisr\Exceptions\SmsmisrAuthenticationException;
use Ghanem\LaravelSmsmisr\Exceptions\SmsmisrInsufficientBalanceException;
use Ghanem\LaravelSmsmisr\Exceptions\SmsmisrRateLimitException;

try {
    $response = Smsmisr::send('Hello', '01012345678');
} catch (SmsmisrAuthenticationException $e) {
    // Invalid credentials
} catch (SmsmisrInsufficientBalanceException $e) {
    // Not enough SMS credits
} catch (SmsmisrRateLimitException $e) {
    // Rate limit exceeded
} catch (SmsmisrApiException $e) {
    $e->getCode();       // Error code
    $e->getMessage();    // Error message
    $e->getResponse();   // Full response array
}
```

## Phone Number Normalization

The package automatically normalizes Egyptian phone numbers to international format:

- `01012345678` -> `201012345678`
- `+201012345678` -> `201012345678`
- `00201012345678` -> `201012345678`
- `010-1234-5678` -> `201012345678`

Disable in config:

```dotenv
SMSMISR_AUTO_NORMALIZE=false
```

### Validation Rule

```php
use Ghanem\LaravelSmsmisr\Rules\EgyptianPhoneNumber;

$request->validate([
    'phone' => ['required', new EgyptianPhoneNumber],
]);
```

Validates prefixes: `010`, `011`, `012`, `015`.

## Events

| Event | When | Properties |
|-------|------|------------|
| `SmsSending` | Before sending | `to`, `message`, `sender`, `type` |
| `SmsSent` | After success | `to`, `message`, `sender`, `response`, `type` |
| `SmsFailed` | On failure | `to`, `message`, `sender`, `exception`, `type` |
| `LowBalance` | Balance check alert | `smsBalance`, `verifyBalance`, `threshold` |

The `type` is `'sms'`, `'otp'`, or `'bulk'`.

```php
use Ghanem\LaravelSmsmisr\Events\SmsSent;
use Ghanem\LaravelSmsmisr\Events\LowBalance;

Event::listen(SmsSent::class, function (SmsSent $event) {
    logger("SMS sent to {$event->to}");
});

Event::listen(LowBalance::class, function (LowBalance $event) {
    // Send alert to admin
});
```

## Artisan Commands

```bash
# Display current SMS and Verify balance
php artisan smsmisr:balance

# Check balance against threshold and dispatch LowBalance event if below
php artisan smsmisr:check-balance
php artisan smsmisr:check-balance --threshold=500
```

Schedule the balance check in your `routes/console.php`:

```php
Schedule::command('smsmisr:check-balance')->daily();
```

## Notifications

```php
namespace App\Notifications;

use Ghanem\LaravelSmsmisr\SmsmisrChannel;
use Ghanem\LaravelSmsmisr\SmsmisrMessage;
use Illuminate\Notifications\Notification;

class OrderShipped extends Notification
{
    public function via($notifiable): array
    {
        return [SmsmisrChannel::class];
    }

    public function toSmsmisr($notifiable): SmsmisrMessage
    {
        return (new SmsmisrMessage('Your order has been shipped!', $notifiable->phone))
            ->sender('MyApp');
    }
}
```

### OTP Notification

```php
public function toSmsmisr($notifiable): SmsmisrMessage
{
    return (new SmsmisrMessage())
        ->to($notifiable->phone)
        ->asVerification('1234', 'your-template-id');
}
```

### Scheduled Notification

```php
public function toSmsmisr($notifiable): SmsmisrMessage
{
    return (new SmsmisrMessage('Reminder: appointment tomorrow', $notifiable->phone))
        ->scheduledAt(new DateTime('2026-04-01 09:00:00'));
}
```

### SmsmisrMessage API

```php
(new SmsmisrMessage(string $message, string $to))
    ->message(string $message)
    ->to(string $to)
    ->sender(string $sender)
    ->unicode(bool $unicode)
    ->asVerification(string $code, ?string $template)
    ->scheduledAt(DateTimeInterface $dateTime)
```

## Testing

### In Your Application

```php
use Ghanem\LaravelSmsmisr\Facades\Smsmisr;

public function test_order_sends_sms(): void
{
    Smsmisr::fake();

    // ... trigger SMS ...

    Smsmisr::assertSent('01012345678', 'Your order has been shipped!');
    Smsmisr::assertSentCount(1);
}
```

Available assertions:

```php
Smsmisr::fake();

// Sent
Smsmisr::assertSent($to, $message);
Smsmisr::assertSentCount($count);
Smsmisr::assertNothingSent();
Smsmisr::assertSentWithSchedule($to);

// Verification
Smsmisr::assertVerifySent($to, $code);
Smsmisr::assertVerifySentCount($count);

// Bulk
Smsmisr::assertBulkSent($message);
Smsmisr::assertBulkSentCount($count);
Smsmisr::assertBulkSentTo($recipients);

// Queue
Smsmisr::assertQueued($to, $message);
Smsmisr::assertQueuedCount($count);
Smsmisr::assertVerifyQueued($to, $code);
Smsmisr::assertNothingQueued();

// Inspect
Smsmisr::getSent();
Smsmisr::getBulk();
Smsmisr::getVerified();
Smsmisr::getQueued();
```

### Running Package Tests

```bash
composer test
```

## Configuration

| Key | Env Variable | Default | Description |
|-----|-------------|---------|-------------|
| `environment` | `SMSMISR_ENVIRONMENT` | `1` | 1 = Live, 2 = Test |
| `endpoint` | `SMSMISR_ENDPOINT` | `https://smsmisr.com/api/` | API endpoint |
| `username` | `SMSMISR_USERNAME` | `null` | Account username |
| `password` | `SMSMISR_PASSWORD` | `null` | Account password |
| `token` | `SMSMISR_TOKEN` | `null` | API token (alternative auth) |
| `sender` | `SMSMISR_SENDER` | `null` | Default sender name |
| `auto_normalize` | `SMSMISR_AUTO_NORMALIZE` | `true` | Auto-normalize phone numbers |
| `timeout` | `SMSMISR_TIMEOUT` | `30` | HTTP timeout (seconds) |
| `retries` | `SMSMISR_RETRIES` | `0` | Retry attempts on failure |
| `retry_delay` | `SMSMISR_RETRY_DELAY` | `100` | Delay between retries (ms) |
| `rate_limit` | `SMSMISR_RATE_LIMIT` | `null` | Max messages per minute |
| `queue` | `SMSMISR_QUEUE` | `null` | Queue name for async sending |
| `log_channel` | `SMSMISR_LOG_CHANNEL` | `null` | Log channel for SMS operations |
| `low_balance_threshold` | `SMSMISR_LOW_BALANCE_THRESHOLD` | `100` | Alert threshold for balance check |

## License

MIT

## Sponsor

[Become a Sponsor](https://github.com/sponsors/AbdullahGhanem)
