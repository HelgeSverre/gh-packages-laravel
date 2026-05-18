# Laravel WhatsApp Cloud

A Laravel package for integrating with the WhatsApp Cloud API.

## Requirements

- PHP 8.2+
- Laravel 12+

## Installation

```bash
composer require manzar/laravel-whatsapp-cloud
```

Publish config:

```bash
php artisan vendor:publish --tag=whatsapp-config
```

## Configuration

Set the following in `.env`:

```dotenv
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_API_VERSION=v25.0
WHATSAPP_BASE_URL=https://graph.facebook.com

WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_ENFORCE_SIGNATURE=true
WHATSAPP_WEBHOOK_PATH=/whatsapp/webhook
WHATSAPP_WEBHOOK_ENABLED=true
```

### Webhook security modes

- `WHATSAPP_WEBHOOK_ENFORCE_SIGNATURE=true`: signature required
- `WHATSAPP_WEBHOOK_ENFORCE_SIGNATURE=false`: signature optional (recommended only for local/testing)

## Basic usage

```php
use Manzar\WhatsAppCloud\Facades\WhatsApp;

// Text
WhatsApp::sendText('15551234567', 'Hello');

// Media
WhatsApp::sendImage('15551234567', 'https://example.com/image.jpg', 'Sample image');
WhatsApp::sendVideo('15551234567', 'https://example.com/video.mp4', 'Sample video');
WhatsApp::sendAudio('15551234567', 'https://example.com/audio.mp3');
WhatsApp::sendDocument('15551234567', 'https://example.com/invoice.pdf', 'Invoice attached', 'invoice.pdf');
WhatsApp::sendSticker('15551234567', 'https://example.com/sticker.webp');

// Location
WhatsApp::sendLocation('15551234567', 23.8103, 90.4125, 'Dhaka', 'Bangladesh');
WhatsApp::requestLocation('15551234567', 'Please share your location');

// Contacts
WhatsApp::sendContact('15551234567', [
    'name' => ['formatted_name' => 'John Doe', 'first_name' => 'John'],
    'phones' => [['phone' => '+15551234567', 'type' => 'CELL']],
]);

WhatsApp::sendContacts('15551234567', [
    [
        'name' => ['formatted_name' => 'John Doe', 'first_name' => 'John'],
        'phones' => [['phone' => '+15551234567', 'type' => 'CELL']],
    ],
    [
        'name' => ['formatted_name' => 'Jane Doe', 'first_name' => 'Jane'],
        'phones' => [['phone' => '+15557654321', 'type' => 'WORK']],
    ],
]);

// Interactive: buttons
WhatsApp::sendButtons('15551234567', 'Choose one', [
    'yes' => 'Yes',
    'no' => 'No',
]);

// Interactive: list
WhatsApp::sendList('15551234567', 'Pick an option', 'View', [
    'Main' => [
        ['id' => 'opt_1', 'title' => 'Option 1', 'description' => 'First option'],
        ['id' => 'opt_2', 'title' => 'Option 2'],
    ],
]);

// Template (without dynamic variables)
WhatsApp::sendTemplate('15551234567', 'welcome_message', 'en_US');

// Template (with dynamic variables)
WhatsApp::sendTemplate('15551234567', 'order_update', 'en_US', [
    [
        'type' => 'body',
        'parameters' => [
            ['type' => 'text', 'text' => 'John'],
            ['type' => 'text', 'text' => 'ORD-123'],
        ],
    ],
]);

// Flow
WhatsApp::sendFlow(
    '15551234567',
    'flow_id_123',
    'Start Flow',
    'published',
    'optional-flow-token',
    ['screen' => 'WELCOME']
);

// Reactions
WhatsApp::react('15551234567', 'wamid.HBgM...', '👍');
WhatsApp::unreact('15551234567', 'wamid.HBgM...');

// Read receipts
WhatsApp::markAsRead('wamid.HBgM...');
```

## Media helpers

```php
// Upload only
$uploaded = WhatsApp::uploadMedia('/path/to/photo.jpg', 'image/jpeg');

// Upload + send in one step
WhatsApp::uploadAndSendImage('15551234567', '/path/to/photo.jpg', 'image/jpeg', 'Caption');
WhatsApp::uploadAndSendVideo('15551234567', '/path/to/video.mp4', 'video/mp4', 'Video caption');
WhatsApp::uploadAndSendAudio('15551234567', '/path/to/audio.mp3', 'audio/mpeg');
WhatsApp::uploadAndSendDocument('15551234567', '/path/to/file.pdf', 'application/pdf', 'Invoice', 'invoice.pdf');
WhatsApp::uploadAndSendSticker('15551234567', '/path/to/sticker.webp', 'image/webp');
```

### Downloading received media

Incoming media messages (images, documents, audio, video, stickers) contain a `media_id`. Meta requires an authenticated request to fetch the binary — you cannot access the URL directly.

```php
use Manzar\WhatsAppCloud\Facades\WhatsApp;

// Option 1: get raw binary bytes (store in DB, stream to browser, etc.)
$bytes = WhatsApp::downloadMedia($incomingMessage->media_id);

// Stream directly to the browser
return response($bytes, 200)->header('Content-Type', 'image/jpeg');

// Option 2: save to a local path, returns the saved path
$path = WhatsApp::downloadMediaTo(
    $incomingMessage->media_id,
    storage_path('app/whatsapp/media/' . $incomingMessage->media_id . '.jpg')
);

// Option 3: use the media service directly for more control
$meta = WhatsApp::getMediaUrl($incomingMessage->media_id);
// $meta['url']       — authenticated temporary URL
// $meta['mime_type'] — e.g. image/jpeg
// $meta['sha256']    — checksum for verification
```

> **Note:** The temporary URL returned by `getMediaUrl()` expires quickly. Use `downloadMedia()` or `downloadMediaTo()` to fetch the binary immediately rather than storing the URL for later use.

## Template management

```php
$templates = WhatsApp::templates()->list();
$single = WhatsApp::templates()->get('order_update');

// Build payload with dynamic variable examples (recommended)
$payload = WhatsApp::buildTemplateCreatePayload(
    'order_update',
    'en_US',
    'UTILITY',
    [
        [
            'type' => 'body',
            'text' => 'Hi {{1}}, your order {{2}} is confirmed.',
        ],
    ],
    [
        'BODY' => [
            'body_text' => [['John', 'ORD-123']],
        ],
    ]
);

$created = WhatsApp::templates()->create($payload);

$created = WhatsApp::templates()->create([
    'name' => 'order_update',
    'language' => 'en_US',
    'category' => 'UTILITY',
    'components' => [
        [
            'type' => 'BODY',
            'text' => 'Hi {{1}}, your order {{2}} is confirmed.',
        ],
    ],
]);

$updated = WhatsApp::templates()->update('TEMPLATE_ID', [
    'category' => 'UTILITY',
]);

// Manager passthrough helper
WhatsApp::updateTemplate('TEMPLATE_ID', ['category' => 'UTILITY']);

$deleted = WhatsApp::templates()->delete('order_update');
```

### Dynamic variable requirement

When template creation text contains placeholders such as `{{1}}` or `{{2}}`, example values are required.

- `buildTemplateCreatePayload()` enforces examples at build time.
- `templates()->create()` validates that dynamic components include examples.

## Webhook routes

By default, the package registers:

- `GET /whatsapp/webhook` for verification
- `POST /whatsapp/webhook` for incoming events

Events dispatched:

- `Manzar\WhatsAppCloud\Events\WebhookReceived`
- `Manzar\WhatsAppCloud\Events\MessageReceived`
- `Manzar\WhatsAppCloud\Events\StatusUpdated`

## Validation limits

### Interactive buttons/list

- Reply buttons: max 3
- Reply button title: max 20 characters
- List button text: max 20 characters
- List sections: max 10
- Rows per section: max 10
- Total rows across all sections: max 10
- Row id: max 200 characters
- Row title: max 24 characters
- Row description: max 72 characters

### Template message

- Header component parameters: exactly 1
- Body component parameters: 1 to 10
- Button component parameters: exactly 1
- Button subtype: `url` or `quick_reply`

## Optional database persistence

The package can automatically persist webhook payloads, incoming messages, and delivery status updates to your database. It is **disabled by default** — zero tables are touched unless you opt in.

### Setup

1. Publish and run the migrations:

```bash
php artisan vendor:publish --tag=whatsapp-migrations
php artisan migrate
```

2. Enable in `.env`:

```dotenv
WHATSAPP_STORAGE_ENABLED=true
```

To also log every outgoing message:

```dotenv
WHATSAPP_LOG_OUTGOING=true
```

### Tables created

| Table | Contains |
|---|---|
| `whatsapp_webhook_logs` | Raw payload for every webhook request |
| `whatsapp_incoming_messages` | Normalised row per received message (text, image, interactive, etc.) |
| `whatsapp_message_statuses` | Every sent/delivered/read/failed status update with pricing and conversation info |
| `whatsapp_outgoing_messages` | Record per outgoing message with type-specific columns and delivery status |

### Models

```php
use Manzar\WhatsAppCloud\Models\WhatsAppIncomingMessage;
use Manzar\WhatsAppCloud\Models\WhatsAppOutgoingMessage;
use Manzar\WhatsAppCloud\Models\WhatsAppMessageStatus;
use Manzar\WhatsAppCloud\Models\WhatsAppWebhookLog;

// All unread incoming text messages
WhatsAppIncomingMessage::where('type', 'text')->latest()->get();

// All outgoing messages not yet delivered
WhatsAppOutgoingMessage::whereIn('status', ['pending', 'sent'])->get();

// Status history for a specific message
WhatsAppMessageStatus::where('wamid', 'wamid.HBgM...')->orderBy('sent_at')->get();
```

### Custom storage driver

Implement `Manzar\WhatsAppCloud\Contracts\WhatsAppStorageInterface` and bind it in your `AppServiceProvider`:

```php
use Manzar\WhatsAppCloud\Contracts\WhatsAppStorageInterface;

// In AppServiceProvider::register()
$this->app->bind(WhatsAppStorageInterface::class, MyCustomStorage::class);
```

Then set:

```dotenv
WHATSAPP_STORAGE_ENABLED=true
WHATSAPP_STORAGE_DRIVER=custom
```

## Notes

- Raw Graph API access remains available via `WhatsApp::raw()`.
- Flow payload support is provided as a foundation via `sendFlow()` and `flow()` builder access.
- Template update behavior depends on current Graph API support and permissions.