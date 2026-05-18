# Laravel Aruba SMS

[![Latest Version on Packagist](https://img.shields.io/packagist/v/offline-agency/laravel-aruba-sms.svg?style=flat-square)](https://packagist.org/packages/offline-agency/laravel-aruba-sms)
[![Tests](https://img.shields.io/github/actions/workflow/status/offline-agency/laravel-aruba-sms/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/offline-agency/laravel-aruba-sms/actions/workflows/ci.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%206-brightgreen.svg?style=flat-square)](https://phpstan.org/)
[![codecov](https://codecov.io/gh/offline-agency/laravel-aruba-sms/branch/main/graph/badge.svg)](https://codecov.io/gh/offline-agency/laravel-aruba-sms)
[![Total Downloads](https://img.shields.io/packagist/dt/offline-agency/laravel-aruba-sms.svg?style=flat-square)](https://packagist.org/packages/offline-agency/laravel-aruba-sms)
[![License](https://img.shields.io/packagist/l/offline-agency/laravel-aruba-sms.svg?style=flat-square)](LICENSE)


Laravel notification channel and API client for the [Aruba SMS API Service](https://www.aruba.it/listino-sms.aspx). See the [official API documentation](https://smsdevelopers.aruba.it).

![Laravel Aruba SMS](https://banners.beyondco.de/Laravel%20Aruba%20SMS.png?theme=dark&packageManager=composer+require&packageName=offline-agency%2Flaravel-aruba-sms&pattern=aztec&style=style_2&description=Laravel+notification+channel+and+API+client+for+the+Aruba+SMS+API+Service&md=1&showWatermark=0&fontSize=100px&images=https%3A%2F%2Flaravel.com%2Fimg%2Flogomark.min.svg)

## Requirements

- PHP ^8.4
- Laravel ^12.0 or ^13.0

## Installation

### From Packagist (when published)

```bash
composer require offline-agency/laravel-aruba-sms
```

### Local development (path repository)

Add to your project's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "packages/offline-agency/laravel-aruba-sms",
            "options": {
                "symlink": true
            }
        }
    ]
}
```

Then:

```bash
composer require offline-agency/laravel-aruba-sms
```

### Publish config

```bash
php artisan vendor:publish --tag=aruba-sms-config
```

## Configuration

Copy `.env.example` or add these to your `.env`:

```env
# Required
ARUBA_SMS_ID=your_username
ARUBA_SMS_PASSWORD=your_password

# Optional
ARUBA_SMS_SENDER=YourBrand              # Default: YourBrand
ARUBA_SMS_SANDBOX=true                  # Default: false (set true for dev/test)
ARUBA_SMS_MINIMUM_SMS=50                # Low credit threshold
ARUBA_SMS_LOW_CREDIT_RECIPIENTS=admin@example.com,dev@example.com
```

| Variable | Description | Default |
|----------|-------------|---------|
| `ARUBA_SMS_ID` | Aruba SMS Panel username | (required) |
| `ARUBA_SMS_PASSWORD` | Aruba SMS Panel password | (required) |
| `ARUBA_SMS_BASE_URL` | API base URL | `https://smspanel.aruba.it/API/v1.0/REST/` |
| `ARUBA_SMS_SENDER` | Sender name on recipient's device | `YourBrand` |
| `ARUBA_SMS_MESSAGE_TYPE` | SMS type | `N` (Normal) |
| `ARUBA_SMS_SANDBOX` | Log instead of sending | `false` |
| `ARUBA_SMS_MINIMUM_SMS` | Low credit alert threshold | `50` |
| `ARUBA_SMS_LOW_CREDIT_RECIPIENTS` | Comma-separated admin emails | (empty) |

## Usage

### Via Notification Channel

Create a notification that uses the `aruba-sms` channel:

```php
use Illuminate\Notifications\Notification;
use OfflineAgency\ArubaSms\ArubaSmsMessage;

class OrderShippedNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['aruba-sms'];
    }

    public function toArubaSms($notifiable): ArubaSmsMessage
    {
        return (new ArubaSmsMessage())
            ->content("Your order #{$this->order->id} has been shipped")
            ->to($notifiable->phone_number);
    }
}
```

### Using the Built-in Generic Notification

```php
use OfflineAgency\ArubaSms\Notifications\SendSmsNotification;
use Illuminate\Support\Facades\Notification;

// Send to an on-demand notifiable (no User model needed)
Notification::route('aruba-sms', null)
    ->notify(new SendSmsNotification('Your message', '+393331234567'));

// Or send via a notifiable model
$user->notify(new SendSmsNotification('Your message', '+393331234567'));
```

### Direct Client Usage

```php
use OfflineAgency\ArubaSms\ArubaSmsClient;
use OfflineAgency\ArubaSms\ArubaSmsMessage;

$client = app(ArubaSmsClient::class);
$message = new ArubaSmsMessage('Hello!', '+393331234567');
$response = $client->sendMessage($message);
```

### Via Facade

```php
use OfflineAgency\ArubaSms\Facades\ArubaSms;
use OfflineAgency\ArubaSms\ArubaSmsMessage;

// Send a message
$message = new ArubaSmsMessage('Hello!', '+393331234567');
ArubaSms::sendMessage($message);

// Check remaining credits
$response = ArubaSms::checkSmsStatus();

// Get sending history
$response = ArubaSms::getSmsHistory('20260101000001');
```

### Backward Compatibility (Legacy Pattern)

Notifications with public `$message`, `$recipient`, `$message_type` properties work without implementing `toArubaSms()`:

```php
class LegacyNotification extends Notification
{
    public string $message = 'Hello';
    public string $recipient = '+393331234567';
    public string $message_type = 'N';

    public function via($notifiable): array
    {
        return ['aruba-sms'];
    }
}
```

## Artisan Commands

### `aruba:sms`

Manage the Aruba SMS Panel from the command line:

```bash
# Check remaining SMS credits
php artisan aruba:sms status

# View sending history
php artisan aruba:sms history --from=20260101000001 --to=20260201000001

# View history for a specific recipient
php artisan aruba:sms recipient-history --recipient=+393331234567 --from=20260101000001

# Send a test SMS
php artisan aruba:sms notification --phoneNumber=+393331234567

# Get raw remaining credit count (for scripting)
php artisan aruba:sms remaining-credit-raw
```

### `aruba:check-remaining-sms`

Check remaining credits and send email alerts if below threshold:

```bash
php artisan aruba:check-remaining-sms
```

Configure alert recipients via `ARUBA_SMS_LOW_CREDIT_RECIPIENTS` env variable.

## Phone Number Formatting

The package provides a `PhoneNumberFormatter` utility for Italian phone numbers:

```php
use OfflineAgency\ArubaSms\Support\PhoneNumberFormatter;

// Add +39 prefix and strip spaces
PhoneNumberFormatter::format('333 123 4567');    // '+393331234567'
PhoneNumberFormatter::format('+393331234567');   // '+393331234567' (unchanged)
PhoneNumberFormatter::format('+447911123456');   // '+447911123456' (non-IT preserved)

// Strip spaces only
PhoneNumberFormatter::stripSpaces('+39 333 123 4567'); // '+393331234567'
```

## Sandbox Mode

When `ARUBA_SMS_SANDBOX=true`, SMS messages are logged to the Laravel log instead of being sent to the Aruba API. This is useful for development and testing:

```
[2026-02-19 10:30:00] local.INFO: *** Aruba SMS DEBUG ***
[2026-02-19 10:30:00] local.INFO: Notification sent successfully!
[2026-02-19 10:30:00] local.INFO: Recipient: +393331234567
[2026-02-19 10:30:00] local.INFO: Message: Your code is 123456
[2026-02-19 10:30:00] local.INFO: Message Type: N
[2026-02-19 10:30:00] local.INFO: *** *** ***
```

## Testing

```bash
composer test              # Run tests
composer test:coverage     # Run with coverage (100% minimum)
composer analyse           # PHPStan level 6
composer format            # Fix code style (Pint)
composer format:check      # Check code style without fixing
```

All tests use Pest with `Http::fake()` and never call the real Aruba API.

## License

MIT
