# Laravel Whatsapp Cloud API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/blissjaspis/laravel-whatsapp-cloud-api.svg?style=flat-square)](https://packagist.org/packages/blissjaspis/laravel-whatsapp-cloud-api)
[![Total Downloads](https://img.shields.io/packagist/dt/blissjaspis/laravel-whatsapp-cloud-api.svg?style=flat-square)](https://packagist.org/packages/blissjaspis/laravel-whatsapp-cloud-api)

Laravel package to interact with the WhatsApp Cloud API.

## Upgrade Guide

### Upgrading from 1.x to 2.0

**Breaking Change:** The config key `bussiness_phone_number_id` has been renamed to `business_phone_number_id` (typo fix).

If you were accessing the config directly in your code:
```php
// Before (1.x)
config('whatsapp-cloud-api.bussiness_phone_number_id')

// After (2.0)
config('whatsapp-cloud-api.business_phone_number_id')
```

Note: If you only use the `.env` file and environment variables, no changes are needed.

## Requirements

- PHP 8.2 or higher
- Laravel 11, 12 or 13

## Installation

You can install the package via composer:

```bash
composer require blissjaspis/laravel-whatsapp-cloud-api
```

## Configuration

First, publish the configuration file:

```bash
php artisan vendor:publish --provider="BlissJaspis\\WhatsappCloudApi\\WhatsappServiceProvider" --tag="config"
```

This will create a `config/whatsapp-cloud-api.php` file.

Next, you need to add the following environment variables to your `.env` file:

```dotenv
WHATSAPP_VERSION_SDK=v19.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_COUNTRY_CODE=+62
```

- `WHATSAPP_VERSION_SDK`: The WhatsApp Cloud API version you want to use.
- `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business Phone Number ID.
- `WHATSAPP_ACCESS_TOKEN`: Your System User Access Token.
- `WHATSAPP_COUNTRY_CODE`: Your country code.

## Usage

### Sending a Text Message

You can send a text message using the `Whatsapp` facade.

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Text;

$response = Whatsapp::message()
    ->to('081234567890') // or ->to('6281234567890', false)
    ->body(Text::message('Hello from Laravel!')->build())
    ->send();

if ($response->successful()) {
    // Message sent successfully
}
```

The `to()` method automatically adds the country code from the configuration. If you want to use a phone number with the country code already included, you can pass `false` as the second argument.

### Sending other types of messages

This package supports sending various types of messages. Here are some examples:

#### Image

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Image;

Whatsapp::message()
    ->to('081234567890')
    ->body(Image::create('https://example.com/image.jpg')->build())
    ->send();

// or with caption
Whatsapp::message()
    ->to('081234567890')
    ->body(Image::create('your-media-id')->isNotUrl()->caption('your caption')->build())
    ->send();
```

#### Document

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Document;

Whatsapp::message()
    ->to('081234567890')
    ->body(Document::create('https://example.com/document.pdf')->filename('your-file-name.pdf')->caption('your caption')->build())
    ->send();
```

#### Audio

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Audio;

Whatsapp::message()
    ->to('081234567890')
    ->body(Audio::create('your-media-id')->build())
    ->send();
```

#### Video

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Video;

Whatsapp::message()
    ->to('081234567890')
    ->body(Video::create('your-media-id')->build())
    ->send();
```

#### Sticker
```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;
use BlissJaspis\WhatsappCloudApi\Support\Sticker;

Whatsapp::message()
    ->to('081234567890')
    ->body(Sticker::create('your-media-id')->build())
    ->send();
```

### Mark a message as read

You can mark a message as read using the `readMessage` method.

```php
use BlissJaspis\WhatsappCloudApi\Facades\Whatsapp;

Whatsapp::readMessage('message-id');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Bliss Jaspis](https://github.com/blissjaspis)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.