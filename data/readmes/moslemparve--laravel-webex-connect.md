# Laravel Webex Connect

Laravel package for sending SMS and OTP via Webex Connect (formerly IMImobile).

## Installation

Install via Composer:
```bash
composer require moslemparve/laravel-webex-connect
```

## Configuration

Publish the configuration file:
```bash
php artisan vendor:publish --tag=webex-connect-config
```

Add to your `.env`:
```env
WEBEX_SERVICE_ID=your-service-id
WEBEX_SERVICE_SECRET=your-service-secret
WEBEX_REGION=us
WEBEX_SENDER_ID=+1234567890
WEBEX_IS_SANDBOX=false
WEBEX_OTP_TEMPLATE="Your OTP code is {otp}. Valid for {validity} minutes."
WEBEX_OTP_EXPIRY_MINUTES=5
```

## Usage

### Send Single SMS
```php
use MoslemParve\WebexConnect\Facades\WebexConnect;

$result = WebexConnect::sendSms('+1234567890', 'Hello from Webex!');

if ($result['success']) {
    echo "Message sent! ID: " . $result['message_id'];
}
```

### Send Bulk SMS
```php
$recipients = ['+1234567890', '+0987654321'];
$result = WebexConnect::sendBulkSms($recipients, 'Bulk message to all!');
```

### Send OTP
```php
$result = WebexConnect::sendOtp('+1234567890');

if ($result['success']) {
    // Store OTP in database
    $otp = $result['otp'];
    $expiresAt = $result['expires_at'];
}
```

### Test Connection
```php
$result = WebexConnect::testConnection();
```

## License

MIT License. See [LICENSE](LICENSE) for more information.

## Credits

- [Moslem Parve](https://github.com/moslemparve)

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/moslemparve/laravel-webex-connect/issues).git a