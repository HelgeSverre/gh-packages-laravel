# Cloud Message
<br>

<p align="center">
<a href="https://packagist.org/packages/medianet-dev/cloud-message" title="Latest Version on Packagist"><img src="https://img.shields.io/packagist/v/medianet-dev/cloud-message.svg?logo=composer"></a>
<a href="https://scrutinizer-ci.com/g/Medianet-Tunisia/cloud-message" title="Quality Score"><img src="https://img.shields.io/scrutinizer/quality/g/Medianet-Tunisia/cloud-message.svg?b=main"></a>
<a href="https://packagist.org/packages/medianet-dev/cloud-message" title="Total Downloads"><img src="https://img.shields.io/packagist/dt/medianet-dev/cloud-message.svg"></a>
</p>

---

Cloud Message is a Laravel package that provides a simple and unified way to send push notifications using Firebase Cloud Messaging (FCM) and Huawei Push Kit.

## Features

- Send push notifications via Firebase Cloud Messaging (FCM)
- Send push notifications via Huawei Push Kit
- Unified API for both FCM and Huawei
- Easy to use Facade
- Customizable configuration
- Robust error handling

## Requirements

- PHP 8.1+
- Laravel 9.x – 13.x

## Installation

You can install the package via composer:

```bash
composer require medianet-dev/cloud-message
```

## Configuration

After installation, publish the config file:

```bash
php artisan vendor:publish --provider="MedianetDev\CloudMessage\CloudMessageServiceProvider" --tag="config"
```

This will create a `config/cloud_message.php` file in your app's configuration directory. Here you can set your Firebase and Huawei credentials.

## Usage

### Using the Facade

You can use the `CloudMessage` facade to send notifications:

```php
use MedianetDev\CloudMessage\Facade\CloudMessage;

$message = [
    'title' => "Your notification title",
    'body' => "Your notification body",
];

$registrationTokens = [
    'token1',
    'token2'
];

// Send to Android devices
$results = CloudMessage::sendToTokens($message, $registrationTokens, 'android');

// Send to iOS devices
$results = CloudMessage::sendToTokens($message, $registrationTokens, 'ios');

// Send to Huawei devices
$results = CloudMessage::sendToTokens($message, $registrationTokens, 'huawei');
```

### Send to specific devices without using the Facade

You can also use the notification class directly:

```php
use MedianetDev\CloudMessage\Drivers\FirebaseNotification;
use MedianetDev\CloudMessage\Drivers\HuaweiNotification;

$message = [
    'title' => "Your notification title",
    'body' => "Your notification body",
];

$registrationTokens = [
    'token1',
    'token2'
];

$results = FirebaseNotification::sendToTokens($message, $registrationTokens);
$results = HuaweiNotification::sendToTokens($message, $registrationTokens);
```

### Subscribe to a Topic
```php
use MedianetDev\CloudMessage\Facade\CloudMessage;

$topic = 'guests';
$registrationTokens = [
    'token1',
    'token2'
];

$results = CloudMessage::subscribeToTopic($topic, $registrationTokens, 'ios');
```
This will subscribe the provided tokens to receive notifications for the given topic.

### Send to a Topic
```php
use MedianetDev\CloudMessage\Facade\CloudMessage;

$message = [
    'title' => "Your notification title",
    'body' => "Your notification body",
];

$topic = 'guests';

// Send to Android devices
$results = CloudMessage::sendToTopic($message, $topic, 'android');

// Send to iOS devices
$results = CloudMessage::sendToTopic($message, $topic, 'ios');

// Send to Huawei devices
$results = CloudMessage::sendToTopic($message, $topic, 'huawei');
```
This will send the notification to all devices subscribed to the given topic.


### Unsubscribe to a Topic
```php
use MedianetDev\CloudMessage\Facade\CloudMessage;

$topic = 'guests';
$registrationTokens = [
    'token1',
    'token2'
];

// Unsubscribe Android devices
$results = CloudMessage::unsubscribeToTopic($topic, $registrationTokens, 'android');

// Unsubscribe iOS devices
$results = CloudMessage::unsubscribeToTopic($topic, $registrationTokens, 'ios');
```
Removes the subscription of the tokens from the given topic.

### Configuration for Asynchronous Requests

For performance optimizations when sending notifications to large numbers of tokens, the package supports asynchronous multi-token requests.

To enable this feature, configure the `async_requests` option in the config file:

```php
return [
    // Other configurations...

    'async_requests' => env('CLOUD_MESSAGE_ASYNC_REQUESTS', false),
];
```

You will need to ensure your queue worker is running to process these asynchronous jobs. From the command line, run: `php artisan queue:work` 

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email adel.stiti@medianet.com.tn instead of using the issue tracker.

## Credits

- [Adel Stiti](https://github.com/adelstiti)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
