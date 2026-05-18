# Whatsapp Laravel Package for Kedeka.com
Laravel package to use whatsapp api kedeka.com

## Installation

You can install the package via composer:

add vcs repository first
```json
"repositories": [
    {
        "name": "kedeka/whatsapp-laravel",
        "type": "vcs",
        "url": "https://github.com/kedeka/whatsapp-laravel"
    }
],
```

then run
```bash
composer require kedeka/whatsapp-laravel
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="whatsapp-config"
```

This is the contents of the published config file:

```php
return [
    'key' => env('WHATSAPP_API_KEY'),
    'sender' => env('WHATSAPP_API_SENDER'),
    'device' => env('WHATSAPP_API_DEVICE'),
    'url' => env('WHATSAPP_API_URL', 'https://kedeka.com/api'),
    'enable' => env('WHATSAPP_API_ENABLE') ?: false
];
```

## Configure .env

to use these package you need to add these configuration in your .env file
- set your `WHATSAPP_API_URL` with your api url.
- set your `WHATSAPP_API_KEY` with your api key.
- set your `WHATSAPP_API_SENDER` with the phone number of your device.
- set your `WHATSAPP_API_DEVICE` with your device unique key.
- set your `WHATSAPP_API_ENABLE` with true or false to enable or disable the whatsapp, if you don't set this to true then by default the value will be false.

## Usage

### Check Phone Number Is Whatsapp Contact

```php
use Kedeka\Whatsapp\OnWhastApp;

$phone = '0822544179xx'; // receipt whatsapp number

app(OnWhastApp::class)->check($phone);
```

### Send Text Message

```php
use Kedeka\Whatsapp\SendMessage;
use Kedeka\Whatsapp\Enums\MessageType;

$phone = '0822544179xx'; // receipt whatsapp number

$message = [
    'text' => 'Your message goes here',
];

app(SendMessage::class)->to($phone, $message, MessageType::Text);
```

### Send Text With Image Message

```php
use Kedeka\Whatsapp\SendMessage;
use Kedeka\Whatsapp\Enums\MessageType;

$phone = '0822544179xx'; // receipt whatsapp number

$message = [
    'text' => 'Your message goes here',
    'image_url' => 'https://example.com/your-cute-image.jpg',
];

app(SendMessage::class)->to($phone, $message, MessageType::Image);
```

### Send Text With Button Message

```php
use Kedeka\Whatsapp\SendMessage;
use Kedeka\Whatsapp\Enums\MessageType;

$phone = '0822544179xx'; // receipt whatsapp number

$message = [
    'text' => 'Your message goes here',
    'footer' => 'Your footer message',
    'buttons' => [
        ['label' => 'Button 1', 'type' => 'reply'],
        ['label' => 'Button 2', 'type' => 'url', 'url' => 'https://deka.dev'],
        ['label' => 'Button 3', 'type' => 'call', 'phone' => '62822544179xx'],
        // you can only send max: 3 buttons
    ],
];

app(SendMessage::class)->to($phone, $message, MessageType::Button);
```

### Send Text With Template Button Message

```php
use Kedeka\Whatsapp\SendMessage;
use Kedeka\Whatsapp\Enums\MessageType;

$phone = '0822544179xx'; // receipt whatsapp number

$message = [
    'text' => 'Your message goes here',
    'footer' => 'Your footer message',
    'templateButtons' => [
        ['id' => 'button-1', 'label' => 'Button 1', 'type' => 'reply'],
        ['id' => 'button-2', 'label' => 'Button 2', 'type' => 'url', 'url' => 'https://deka.dev'],
        ['id' => 'button-3', 'label' => 'Button 3', 'type' => 'call', 'phone' => '62822544179xx'],
        ...
    ],
];

app(SendMessage::class)->to($phone, $message, MessageType::Template);
```

### Send Text Section and Lists Item Message

```php
use Kedeka\Whatsapp\SendMessage;
use Kedeka\Whatsapp\Enums\MessageType;

$phone = '0822544179xx'; // receipt whatsapp number

$message = [
    'text' => 'Your message goes here',
    'footer' => 'Your footer message',
    'list' => [
        [
            'title' => 'Section 1',
            'rows' => [
                ['title' => 'List 1', 'description' => 'Description 1'],
                ['title' => 'List 2', 'description' => 'Description 2'],
                ['title' => 'List 3', 'description' => 'Description 3'],
                ...
            ]
        ],
        [
            'title' => 'Section 2',
            'rows' => [
                ['title' => 'List 1', 'description' => 'Description 1'],
                ['title' => 'List 2', 'description' => 'Description 2'],
                ['title' => 'List 3', 'description' => 'Description 3'],
                ...
            ]
        ],
    ]
];

app(SendMessage::class)->to($phone, $message, MessageType::List);
```

### Message Type
| command to use            | type          | variable                              |
|---------------------------|---------------|---------------------------------------|
| MessageType::Text          | Text          | text (required)    |
| MessageType::Image         | Text & Image  | text (required), image_url (required) |
| MessageType::Button        | Text & Button | text (required), buttons[] (required), footer (optional),   |
| MessageType::Template      | Template      | text (required), templateButtons[] (required), footer (optional) |
| MessageType::List          | List          | text (required), list[] (required), footer (optional),   |

### Send Contact / VCARD

```php
use Kedeka\Whatsapp\SendContact;

$phone = '0822544179xx'; // receipt whatsapp number
$contact = '62822511610xx'; // contact whatsapp number, must start with country code eg. 62
$name = 'Rilo Arbabillah'; // required
$nickname = 'Rilo'; // optional
$organization = 'DEKA'; // optional

app(SendContact::class)->to($phone, $contact, $name, $nickname, $organization);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/spatie/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Rizky Hajar](https://github.com/riskihajar)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
