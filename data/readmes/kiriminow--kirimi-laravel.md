# Laravel Kirimi

Official Laravel package for the [Kirimi WhatsApp API](https://kirimi.id). Provides a Facade, Notification channel, Artisan command, and helper function to send WhatsApp messages from any Laravel 10/11/12 application.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require kirimi/laravel-kirimi
```

The service provider is auto-discovered. No manual registration needed.

## Configuration

Add the following variables to your `.env` file:

```env
KIRIMI_USER_CODE=your_user_code
KIRIMI_SECRET=your_secret_key
KIRIMI_DEVICE_ID=your_default_device_id   # optional
KIRIMI_BASE_URL=https://api.kirimi.id      # optional
KIRIMI_TIMEOUT=30                          # optional, seconds
```

To publish the config file:

```bash
php artisan vendor:publish --tag=kirimi-config
```

This creates `config/kirimi.php` where you can review and customize all options.

## Usage

### Facade

Import the facade and call any method from `KirimiClient`:

```php
use Kirimi\Laravel\Facades\Kirimi;

// Send a regular message
Kirimi::sendMessage('device_001', '628123456789', 'Hello from Kirimi!');

// Send a message with media
Kirimi::sendMessage('device_001', '628123456789', 'Check this out!', 'https://example.com/image.jpg');

// Send fast (no typing effect)
Kirimi::sendMessageFast('device_001', '628123456789', 'Quick message');

// Generate OTP
Kirimi::generateOTP('device_001', '628123456789', ['otp_length' => 6]);

// List devices
$devices = Kirimi::listDevices();

// Check device status
$status = Kirimi::deviceStatus('device_001');
```

All methods from `kirimi/kirimi-php` `KirimiClient` are available through the facade.

### Notification Channel

Create a notification class and use the `kirimi` channel:

```php
use Illuminate\Notifications\Notification;
use Kirimi\Laravel\Messages\KirimiMessage;

class OrderPaid extends Notification
{
    public function __construct(private string $orderNumber) {}

    public function via($notifiable): array
    {
        return ['kirimi'];
    }

    public function toKirimi($notifiable): KirimiMessage
    {
        return (new KirimiMessage)
            ->to($notifiable->phone)
            ->device($notifiable->kirimi_device_id)  // optional, falls back to config default
            ->message("Order #{$this->orderNumber} has been paid. Thank you!");
    }
}
```

With media attachment:

```php
public function toKirimi($notifiable): KirimiMessage
{
    return KirimiMessage::create('Your invoice is ready.')
        ->to($notifiable->phone)
        ->mediaUrl('https://example.com/invoice.pdf');
}
```

Fast mode (no typing effect):

```php
return KirimiMessage::create('OTP: 123456')->to($notifiable->phone)->quick();
```

WABA (WhatsApp Business API) mode:

```php
return KirimiMessage::create('Hello via WABA')->to($notifiable->phone)->waba();
```

Trigger the notification as usual:

```php
$user->notify(new OrderPaid($order->number));
// or
Notification::send($users, new OrderPaid($order->number));
```

### Artisan Command

Send a message directly from the terminal:

```bash
# Basic
php artisan kirimi:send 628123456789 "Hello from CLI"

# With specific device
php artisan kirimi:send 628123456789 "Hello" --device=device_001

# With media URL
php artisan kirimi:send 628123456789 "Check this" --media=https://example.com/img.jpg

# Fast mode
php artisan kirimi:send 628123456789 "Quick hello" --fast
```

### Helper Function

Resolve the client from anywhere using the global `kirimi()` helper:

```php
kirimi()->sendMessage('device_001', '628123456789', 'Hello!');
kirimi()->generateOTP('device_001', '628123456789');
```

## License

MIT License. Copyright (c) 2026 Kirimi. See [LICENSE](LICENSE) for details.
