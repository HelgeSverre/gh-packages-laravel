# Ecare SMS Laravel Package

**Version:** 1.0.0

A comprehensive Laravel package for integrating the Ecare SMS API. Send SMS messages, manage campaigns, and track message status programmatically.

## Features

- ✅ Send SMS to single or multiple recipients
- ✅ Send SMS campaigns using contact lists
- ✅ Retrieve SMS and campaign details
- ✅ View all messages with pagination
- ✅ Laravel Facade support
- ✅ Easy configuration
- ✅ Fluent API design

## Installation

### Via Composer

```bash
composer require ecare/sms
```

### Installation

1. **Publish the configuration file:**

```bash
php artisan vendor:publish --tag=ecaresms-config
```

2. **Update your `.env` file:**

```env
ECARE_SMS_API_TOKEN=your_api_token_here
ECARE_SMS_SENDER_ID=YourCompanyName
ECARE_SMS_TIMEOUT=30
ECARE_SMS_BASE_URL_V3=https://send.ecaresms.com/api/v3
ECARE_SMS_BASE_URL_HTTP=https://send.ecaresms.com/api/http
```

## Usage

### Basic Setup

The package is automatically registered in Laravel 5.5+. If you're using an older version, add the service provider to your `config/app.php`:

```php
'providers' => [
    // ...
    EcareSms\EcareSmsServiceProvider::class,
],

'aliases' => [
    // ...
    'EcareSms' => EcareSms\Facades\EcareSms::class,
]
```

### Sending SMS

#### Send to Single Recipient

```php
use EcareSms\Facades\EcareSms;

$response = EcareSms::sendSms(
    recipient: '31612345678',
    senderID: 'YourName',
    message: 'This is a test message'
);

// Response structure
// {
//     "status": "success",
//     "data": "sms reports with all details"
// }
```

#### Send to Multiple Recipients

```php
$response = EcareSms::sendSms(
    recipient: '31612345678,8801721970168',
    senderID: 'YourName',
    message: 'This is a test message'
);
```

#### Send with Scheduled Time

```php
$response = EcareSms::sendSms(
    recipient: '31612345678',
    senderID: 'YourName',
    message: 'This is a scheduled message',
    options: [
        'schedule_time' => '2021-12-20 07:00'
    ]
);
```

#### Send with DLT Template

```php
$response = EcareSms::sendSms(
    recipient: '31612345678',
    senderID: 'YourName',
    message: 'This is a DLT message',
    options: [
        'dlt_template_id' => 'your_template_id'
    ]
);
```

### Sending Campaigns

#### Send to Contact List

```php
$response = EcareSms::sendCampaign(
    contactListID: '6415907d0d37a',
    senderID: 'YourName',
    message: 'Campaign message to contact list'
);
```

#### Send Campaign to Multiple Contact Lists

```php
$response = EcareSms::sendCampaign(
    contactListID: '6415907d0d37a,6415907d0d7a6',
    senderID: 'YourName',
    message: 'Campaign message'
);
```

#### Send Scheduled Campaign

```php
$response = EcareSms::sendCampaign(
    contactListID: '6415907d0d37a',
    senderID: 'YourName',
    message: 'Scheduled campaign',
    options: [
        'schedule_time' => '2021-12-20 07:00'
    ]
);
```

### Retrieving Messages

#### Get Single SMS by ID

```php
$response = EcareSms::getSms('606812e63f78b');

// Response
// {
//     "status": "success",
//     "data": "sms data with all details"
// }
```

#### Get All Messages

```php
$response = EcareSms::getAllMessages();

// Response
// {
//     "status": "success",
//     "data": "sms reports with pagination"
// }
```

#### Get Campaign Details

```php
$response = EcareSms::getCampaign('606812e63f78b');

// Response
// {
//     "status": "success",
//     "data": "campaign data with all details"
// }
```

### Dependency Injection

Use dependency injection in your controllers and services:

```php
<?php

namespace App\Http\Controllers;

use EcareSms\Services\EcareSmsService;

class SmsController extends Controller
{
    public function send(EcareSmsService $smsService)
    {
        $response = $smsService->sendSms(
            '31612345678',
            'YourName',
            'Hello World!'
        );

        return response()->json($response);
    }
}
```

### Error Handling

```php
use EcareSms\Facades\EcareSms;
use Exception;

try {
    $response = EcareSms::sendSms(
        '31612345678',
        'YourName',
        'Test message'
    );

    if ($response['status'] === 'success') {
        // Handle success
        echo "SMS sent successfully";
    } else {
        // Handle API error
        echo "Error: " . $response['message'];
    }
} catch (Exception $e) {
    // Handle exception
    echo "Exception: " . $e->getMessage();
}
```

## API Parameters Reference

### Send SMS Endpoint

| Parameter       | Required | Type     | Description                                                          |
| --------------- | -------- | -------- | -------------------------------------------------------------------- |
| recipient       | Yes      | string   | Phone number(s). Use comma for multiple: `31612345678,8801721970168` |
| sender_id       | Yes      | string   | Sender name (max 11 chars for alphanumeric) or phone number          |
| type            | Yes      | string   | Must be `plain` for text messages                                    |
| message         | Yes      | string   | SMS message body                                                     |
| schedule_time   | No       | datetime | Scheduled time in format `Y-m-d H:i`                                 |
| dlt_template_id | No       | string   | DLT template ID for regulatory compliance                            |

### Send Campaign Endpoint

| Parameter       | Required | Type     | Description                                |
| --------------- | -------- | -------- | ------------------------------------------ |
| contact_list_id | Yes      | string   | Contact list ID(s). Use comma for multiple |
| sender_id       | Yes      | string   | Sender name (max 11 chars) or phone number |
| type            | Yes      | string   | Must be `plain` for text messages          |
| message         | Yes      | string   | Campaign message body                      |
| schedule_time   | No       | datetime | Scheduled time in format `Y-m-d H:i`       |
| dlt_template_id | No       | string   | DLT template ID                            |

## Testing

```bash
composer test
```

Or with coverage:

```bash
composer test -- --coverage
```

## Configuration Options

The configuration file (`config/ecaresms.php`) allows you to customize:

- **api_token**: Your Ecare SMS API token
- **default_sender_id**: Default sender identifier
- **timeout**: HTTP timeout for requests

## Environment Variables

```env
ECARE_SMS_API_TOKEN=your_api_token
ECARE_SMS_SENDER_ID=YourName
ECARE_SMS_TIMEOUT=30
```

## Response Format

All API responses follow this structure:

### Success Response

```json
{
  "status": "success",
  "data": "message or campaign data"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "A human-readable description of the error"
}
```

## API Documentation

For more information, visit the official [Ecare SMS API Documentation](https://ecaresms.com/api/docs)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Support

For issues, questions, or feature requests, please contact:

- Email: support@ecaresms.com
- Website: https://ecaresms.com

## Security

If you discover a security vulnerability, please send an email to security@ecaresms.com instead of using the issue tracker.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.

## Credits

- Developed for [Ecare SMS](https://ecaresms.com)
- Laravel integration by Ecare SMS Team

---

**Version:** 1.0.0
**Released:** March 27, 2026
**Status:** Production Ready ✓
