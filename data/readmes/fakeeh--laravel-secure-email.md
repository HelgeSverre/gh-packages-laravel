# Laravel SES Monitor

[![Latest Version](https://img.shields.io/packagist/v/fakeeh/laravel-secure-email.svg?style=flat-square)](https://packagist.org/packages/fakeeh/laravel-secure-email)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Total Downloads](https://img.shields.io/packagist/dt/fakeeh/laravel-secure-email.svg?style=flat-square)](https://packagist.org/packages/fakeeh/laravel-secure-email)

A production-ready Laravel package to monitor and handle AWS SES email complaints, bounces, and deliveries via SNS notifications. Automatically prevents sending emails to addresses that have bounced or complained.

**Compatible with Laravel 13** (PHP 8.3+)

## Features

- ✅ **Automatic Email Blocking**: Prevents sending to emails with bounces/complaints
- ✅ **SNS Webhook Handling**: Processes bounce, complaint, and delivery notifications
- ✅ **Auto Subscription Confirmation**: Automatically confirms SNS subscriptions
- ✅ **Flexible Configuration**: Customize rules for bounces and complaints
- ✅ **Event System**: Fire events for bounces, complaints, and deliveries
- ✅ **Database Storage**: Store all notifications for analysis
- ✅ **Permanent Bounce Protection**: Block emails with permanent bounces immediately
- ✅ **Subject-based Filtering**: Count bounces/complaints by email subject
- ✅ **Time-based Rules**: Set time windows for counting notifications
- ✅ **Laravel 13 Compatible**: Built for Laravel 13 with PHP 8.3+

## Requirements

- PHP 8.3 or higher
- Laravel 13.x
- AWS SES account with SNS configured

## Installation

### Step 1: Install via Composer

```bash
composer require fakeeh/laravel-secure-email
```

### Step 2: Publish Configuration and Migrations

```bash
# Publish config file
php artisan vendor:publish --tag=secure-email-config

# Publish migrations (optional, auto-loaded by default)
php artisan vendor:publish --tag=secure-email-migrations

# Run migrations
php artisan migrate
```

This will create two tables:
- `sns_subscriptions` - Stores SNS subscription confirmation requests
- `ses_notifications` - Stores bounce, complaint, and delivery notifications

### Step 3: Configure Your Environment

Add these variables to your `.env` file:

```env
# Enable/disable the package
SES_MONITOR_ENABLED=true

# Auto-confirm SNS subscriptions
SES_MONITOR_AUTO_CONFIRM=true

# Validate SNS message signatures
SES_MONITOR_VALIDATE_SNS=true

# Route configuration
SES_MONITOR_ROUTE_PREFIX=aws/sns/ses
SES_MONITOR_BOUNCES_ROUTE=bounces
SES_MONITOR_COMPLAINTS_ROUTE=complaints
SES_MONITOR_DELIVERIES_ROUTE=deliveries

# Bounce rules
SES_MONITOR_CHECK_BOUNCES=true
SES_MONITOR_MAX_BOUNCES=3
SES_MONITOR_CHECK_BOUNCES_BY_SUBJECT=false
SES_MONITOR_BLOCK_PERMANENT_BOUNCES=true
SES_MONITOR_BOUNCE_DAYS=30

# Complaint rules
SES_MONITOR_CHECK_COMPLAINTS=true
SES_MONITOR_MAX_COMPLAINTS=1
SES_MONITOR_CHECK_COMPLAINTS_BY_SUBJECT=true
SES_MONITOR_COMPLAINT_DAYS=0
```

## AWS Configuration

### Step 1: Create SNS Topics

In your AWS SNS console, create three HTTP/HTTPS topics:

1. **Bounces Topic**: `https://yourdomain.com/aws/sns/ses/bounces`
2. **Complaints Topic**: `https://yourdomain.com/aws/sns/ses/complaints`
3. **Deliveries Topic**: `https://yourdomain.com/aws/sns/ses/deliveries`

### Step 2: Configure SES to Send Notifications

1. Go to AWS SES Console
2. Select your verified domain or email
3. Click "Notifications" → "Edit Configuration"
4. Set the SNS topics:
   - **Bounces**: Select your bounces SNS topic
   - **Complaints**: Select your complaints SNS topic
   - **Deliveries**: Select your deliveries SNS topic (optional)

### Step 3: Subscription Confirmation

The package will automatically confirm subscriptions when auto-confirm is enabled. If not, you can:

```bash
# View unconfirmed subscriptions
php artisan secure-email:subscribe-urls

# Or manually visit the SubscribeURL in your database
```

## Usage

### Basic Usage

Once installed and configured, the package works automatically:

1. **Incoming Notifications**: AWS SNS sends notifications to your endpoints
2. **Storage**: Notifications are stored in the `ses_notifications` table
3. **Email Interception**: Before sending any email, the package checks if the recipient should be blocked
4. **Blocking**: Emails to blocked addresses are prevented from sending

### Checking if an Email is Blocked

```php
use Fakeeh\SecureEmail\Models\SesNotification;

// Check for permanent bounces
if (SesNotification::hasPermanentBounce('[email protected]')) {
    // Don't send email
}

// Count bounces for an email
$bounceCount = SesNotification::countBouncesForEmail('[email protected]');

// Count bounces with subject filter
$bounceCount = SesNotification::countBouncesForEmail(
    '[email protected]',
    'Weekly Newsletter',
    30 // days
);

// Count complaints
$complaintCount = SesNotification::countComplaintsForEmail('[email protected]');
```

### Querying Notifications

```php
use Fakeeh\SecureEmail\Models\SesNotification;

// Get all bounces
$bounces = SesNotification::bounces()->get();

// Get permanent bounces
$permanentBounces = SesNotification::permanentBounces()->get();

// Get complaints for a specific email
$complaints = SesNotification::complaints()
    ->forEmail('[email protected]')
    ->get();

// Get recent notifications (last 30 days)
$recent = SesNotification::recent(30)->get();

// Get notifications with specific subject
$notifications = SesNotification::withSubject('Newsletter')->get();

// Get deliveries
$deliveries = SesNotification::deliveries()->get();
```

### Listening to Events

The package fires events when notifications are received:

```php
use Fakeeh\SecureEmail\Events\SesBounceReceived;
use Fakeeh\SecureEmail\Events\SesComplaintReceived;
use Fakeeh\SecureEmail\Events\SesDeliveryReceived;

// In your EventServiceProvider
protected $listen = [
    SesBounceReceived::class => [
        YourBounceListener::class,
    ],
    SesComplaintReceived::class => [
        YourComplaintListener::class,
    ],
    SesDeliveryReceived::class => [
        YourDeliveryListener::class,
    ],
];
```

Example listener:

```php
namespace App\Listeners;

use Fakeeh\SecureEmail\Events\SesBounceReceived;

class HandleSesBounce
{
    public function handle(SesBounceReceived $event)
    {
        $notification = $event->getNotification();
        $email = $event->getEmail();
        
        if ($event->isPermanent()) {
            // Handle permanent bounce
            // e.g., mark user as unsubscribed
        }
    }
}
```

## Configuration

### Bounce Rules

```php
'rules' => [
    'bounces' => [
        'enabled' => true,
        'max_bounces' => 3, // Block after 3 bounces
        'check_by_subject' => false, // Count all bounces or just same subject
        'block_permanent_bounces' => true, // Block permanent bounces immediately
        'days_to_check' => 30, // Only count bounces in last 30 days (0 = all time)
    ],
],
```

### Complaint Rules

```php
'rules' => [
    'complaints' => [
        'enabled' => true,
        'max_complaints' => 1, // Block after 1 complaint
        'check_by_subject' => true, // Count complaints by subject
        'days_to_check' => 0, // Count all complaints (0 = all time)
    ],
],
```

### Custom Models

You can use your own models by extending the package models:

```php
// In your config/secure-email.php
'models' => [
    'subscription' => App\Models\CustomSnsSubscription::class,
    'notification' => App\Models\CustomSesNotification::class,
],
```

### Custom Routes

Customize the webhook endpoints:

```php
// In your config/secure-email.php
'route_prefix' => 'webhooks/ses',
'routes' => [
    'bounces' => 'bounce-notifications',
    'complaints' => 'complaint-notifications',
    'deliveries' => 'delivery-notifications',
],
```

This will create endpoints like:
- `https://yourdomain.com/webhooks/ses/bounce-notifications`
- `https://yourdomain.com/webhooks/ses/complaint-notifications`
- `https://yourdomain.com/webhooks/ses/delivery-notifications`

## Testing

```bash
composer test
```

## Security

If you discover any security-related issues, please email [email protected] instead of using the issue tracker.

## Credits

- Inspired by [oza75/laravel-ses-complaints](https://github.com/oza75/laravel-ses-complaints)
- Built for Laravel 13 compatibility

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Support

- Laravel 13.x
- PHP 8.3+

For older Laravel versions, please use a different package.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.
