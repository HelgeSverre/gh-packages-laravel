# Laravel WhatsApp Cloud API

Laravel-first wrapper for the WhatsApp Cloud API with fluent message builders, webhook handling, WhatsApp Flows support, conversational components, business-scoped user IDs, notifications, and a facade.

```bash
composer require mohapinkepane/laravel-whatsapp-cloud
```

---

## Table of Contents

- [Official WhatsApp Docs](#official-whatsapp-docs)
- [Installation](#installation)
- [Configuration](#configuration)
- [Sending Messages](#sending-messages)
- [Replying To Messages](#replying-to-messages)
- [Message Builders](#message-builders)
- [Laravel Notifications](#laravel-notifications)
- [Webhooks](#webhooks)
- [WhatsApp Flows](#whatsapp-flows)
- [Business-Scoped User IDs](#business-scoped-user-ids)
- [Conversational Components](#conversational-components)
- [Media Endpoints](#media-endpoints)
- [Artisan Commands](#artisan-commands)
- [Facade Reference](#facade-reference)
- [Quality](#quality)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Official WhatsApp Docs

This package stays close to the WhatsApp Cloud API. When you need platform-level rules, setup steps, or payload constraints, these are the best references:

- [WhatsApp Cloud API overview](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Get started guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages)
- [Webhook setup and payloads](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Message templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [WhatsApp Flows](https://developers.facebook.com/docs/whatsapp/flows)
- [Media messages](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media)
- [Conversational components](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components)

---

## Installation

```bash
composer require mohapinkepane/laravel-whatsapp-cloud
```

Publish the config file:

```bash
php artisan vendor:publish --tag="whatsapp-cloud-config"
```

This creates `config/whatsapp-cloud.php` in your application.

Before wiring the package into your app, complete Meta's [Get started guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) so you have a business app, a phone number ID, an access token, and webhook credentials.

---

## Configuration

At minimum, you need the same credentials described in Meta's [Get started guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started):

Set your WhatsApp Cloud API credentials in `.env`:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

By default, webhook parsing only processes payloads whose `metadata.phone_number_id` matches your configured `WHATSAPP_PHONE_NUMBER_ID`. This helps when one app receives events for multiple numbers.

If you plan to receive real events locally, expose your app over HTTPS and configure the webhook in the Meta app dashboard. Meta's [webhook docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks) cover the verification flow and payload delivery model.

### Optional settings

Flow endpoint encryption keys (only needed when using WhatsApp Flows with a custom endpoint):

```env
WHATSAPP_KEYS_PASSPHRASE=
WHATSAPP_PUBLIC_KEY=
WHATSAPP_PRIVATE_KEY=
```

HTTP client tuning:

```env
WHATSAPP_HTTP_TIMEOUT=30
WHATSAPP_HTTP_RETRY_TIMES=2
WHATSAPP_HTTP_RETRY_SLEEP_MS=200
WHATSAPP_RESTRICT_INBOUND_MESSAGES_TO_PHONE_NUMBER_ID=true
WHATSAPP_NOTIFICATION_PHONE_NUMBER_ID=
WHATSAPP_STRICT_MODE=true
WHATSAPP_ENABLE_WELCOME_MESSAGE=false
```

- `WHATSAPP_NOTIFICATION_PHONE_NUMBER_ID` lets notifications use a different default sending number.
- `WHATSAPP_STRICT_MODE` makes malformed outgoing payloads fail fast.
- `WHATSAPP_ENABLE_WELCOME_MESSAGE` is used when syncing conversational components.

---

## Sending Messages

For delivery rules, supported conversation windows, and message-type caveats, see Meta's [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

The package accepts either a plain phone number string or a `Recipient` instance. Use `Recipient::businessScopedUser(...)` when you already know you must send through the `recipient` field instead of `to`.

For readability, the public API generally exposes both explicit and compact variants where it helps, for example `to(...)` and `toRecipient(...)`, or `id()` and `identifier()`.

The facade is the primary way to use the package in application code:

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

WhatsAppCloud::sendMessage(
    '26750000000',
    TextMessage::create('Hello from Laravel')->previewUrl()
);
```

You can still resolve `WhatsAppClient` directly when you want container injection or lower-level control, but the examples in this README use the facade by default.

Most sections below focus on building the message payload. In application code, pair those builders with `WhatsAppCloud::sendMessage(...)`.

### Sending to business-scoped user IDs

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;
use Mohapinkepane\WhatsAppCloud\Support\Recipient;
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

WhatsAppCloud::sendMessage(
    Recipient::businessScopedUser('bsuid-123'),
    TextMessage::create('Hello via BSUID')
);
```

---

## Replying To Messages

This package supports WhatsApp message context directly. The examples below use the facade, which is the recommended entry point for application code.

### Fluent reply chaining

Use this when you already have a send call and want to attach the reply context clearly at the end:

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

WhatsAppCloud::sendMessage(
    '26750000000',
    TextMessage::create('Hello from facade')
)->replyTo('wamid.origin');
```

### Reply context on the message builder

Use this when you want the message object itself to carry the reply context:

```php
WhatsAppCloud::sendMessage(
    '26750000000',
    TextMessage::create('Hello from facade')->replyTo('wamid.origin')
);
```

The lower-level context method is also available:

```php
WhatsAppCloud::sendMessage(
    '26750000000',
    TextMessage::create('Hello from facade')->contextMessageId('wamid.origin')
);
```

### Replying from webhook events

If you are replying to an inbound webhook, use the convenience routing helper on the inbound user object:

```php
use Illuminate\Support\Facades\Event;
use Mohapinkepane\WhatsAppCloud\Events\MessageReceived;
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

Event::listen(MessageReceived::class, function (MessageReceived $event) {
    WhatsAppCloud::sendMessage(
        $event->message->user()->recipient(),
        TextMessage::create('Thanks for reaching out.')
            ->replyTo($event->message->id())
    );
});
```

---

## Message Builders

Every builder returns an immutable instance via `create()` and fluent methods. Call `toArray()` to inspect the raw payload.

Meta's payload rules still apply. When a message type has setup or platform constraints, the most useful place to confirm them is Meta's documentation.

Use these builders with `WhatsAppCloud::sendMessage(...)` or `WhatsAppMessage::using(...)` in notifications.

### Text

```php
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

TextMessage::create('Hello!')
    ->previewUrl()
    ->replyTo('wamid.origin');
```

### Media

See Meta's [media reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media) for supported upload and send behavior.

```php
use Mohapinkepane\WhatsAppCloud\Messages\MediaMessage;

// Send by URL
MediaMessage::create('image')
    ->url('https://example.com/photo.jpg')
    ->caption('Nice shot');

// Send by media ID
MediaMessage::create('document')
    ->id('MEDIA_ID')
    ->caption('Invoice')
    ->filename('invoice.pdf');
```

Supported types: `audio`, `document`, `image`, `sticker`, `video`.

### Template

Template messages require an approved template in WhatsApp Manager. For template approval, categories, and parameter rules, see Meta's [message template docs](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates).

```php
use Mohapinkepane\WhatsAppCloud\Components\TemplateComponent;
use Mohapinkepane\WhatsAppCloud\Messages\TemplateMessage;

TemplateMessage::create('purchase_receipt', 'en_US')
    ->addComponent(TemplateComponent::textBody('John Doe', '$100.00'));
```

Richer template parameters:

```php
use Mohapinkepane\WhatsAppCloud\Components\TemplateComponent;

// Header types
TemplateComponent::headerText('Welcome');
TemplateComponent::headerImage('https://example.com/banner.jpg');
TemplateComponent::headerVideo('https://example.com/clip.mp4');
TemplateComponent::headerDocument('https://example.com/doc.pdf', 'guide.pdf');

// Body types
TemplateComponent::currencyBody('$10.00', 'USD', 10000);
TemplateComponent::dateTimeBody('February 25, 1977');

// Button components
TemplateComponent::quickReplyButton(0, 'confirm');
TemplateComponent::urlButton(1, 'order-123');
TemplateComponent::copyCodeButton(2, 'PROMO2026');
```

### Reaction

Reactions target an existing WhatsApp message ID. Meta documents the behavior in the [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

```php
use Mohapinkepane\WhatsAppCloud\Messages\ReactionMessage;

ReactionMessage::create('wamid.origin', '👍');
```

### Location

```php
use Mohapinkepane\WhatsAppCloud\Messages\LocationMessage;

LocationMessage::create(-122.425332, 37.758056, 'Facebook HQ', '1 Hacker Way');
```

### Location request

Location requests are interactive messages, so client support and rendering still follow Meta's [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

```php
use Mohapinkepane\WhatsAppCloud\Messages\LocationRequestMessage;

LocationRequestMessage::create('Please share your location');
```

### Contacts

```php
use Mohapinkepane\WhatsAppCloud\Contacts\Address;
use Mohapinkepane\WhatsAppCloud\Contacts\Contact;
use Mohapinkepane\WhatsAppCloud\Contacts\Email;
use Mohapinkepane\WhatsAppCloud\Contacts\Name;
use Mohapinkepane\WhatsAppCloud\Contacts\Organization;
use Mohapinkepane\WhatsAppCloud\Contacts\Phone;
use Mohapinkepane\WhatsAppCloud\Contacts\Url;
use Mohapinkepane\WhatsAppCloud\Messages\ContactsMessage;

$contact = Contact::create(
    [Address::create('Menlo Park', 'United States')],
    '2012-08-18',
    [Email::create('test@example.com')],
    Name::create('John', 'John Smith', 'Smith'),
    Organization::create('WhatsApp', 'Manager'),
    [Phone::create('+1 (940) 555-1234', 'WORK', '16505551234')],
    [Url::create('https://example.com')],
);

ContactsMessage::create([$contact]);
```

### Interactive reply buttons

Interactive message rendering can vary by WhatsApp client. Meta's [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages) is the best place to confirm current limits.

```php
use Mohapinkepane\WhatsAppCloud\Components\InteractiveHeader;
use Mohapinkepane\WhatsAppCloud\Components\ReplyButton;
use Mohapinkepane\WhatsAppCloud\Messages\ReplyButtonsMessage;

ReplyButtonsMessage::create('Choose one option:')
    ->addHeader(InteractiveHeader::text('Welcome'))
    ->addFooter('Powered by MyApp')
    ->addButtons([
        ReplyButton::create(1, 'First'),
        ReplyButton::create(2, 'Second'),
    ]);
```

### Interactive list

```php
use Mohapinkepane\WhatsAppCloud\Components\ListRow;
use Mohapinkepane\WhatsAppCloud\Components\ListSection;
use Mohapinkepane\WhatsAppCloud\Messages\ListMessage;

ListMessage::create('Pick an option', 'View')
    ->addSection(ListSection::create('Events', [
        ListRow::create(1, 'Flights')->description('Book a flight'),
        ListRow::create(2, 'Hotels'),
    ]));
```

### Call to action URL

```php
use Mohapinkepane\WhatsAppCloud\Messages\CallToActionUrlMessage;

CallToActionUrlMessage::create('Learn more about our bot', 'Visit us', 'https://example.com');
```

### Flow message

Before sending flow messages, make sure the flow is created and published in Meta. See the official [WhatsApp Flows docs](https://developers.facebook.com/docs/whatsapp/flows).

```php
use Mohapinkepane\WhatsAppCloud\Components\FlowActionPayload;
use Mohapinkepane\WhatsAppCloud\Messages\FlowMessage;

FlowMessage::create(
    'FLOW_ID',
    'FLOW_TOKEN',
    'Start flow',
    'Take a quick survey',
    'draft',
    'navigate'
)->addActionPayload(
    FlowActionPayload::create('RECOMMEND', ['title' => 'hello'])
);
```

### Product message

Commerce messages depend on catalog and product setup in Meta Commerce Manager. Confirm the required identifiers in Meta's [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

```php
use Mohapinkepane\WhatsAppCloud\Messages\ProductMessage;

ProductMessage::create('Featured item', 'CATALOG_ID', 'SKU-123');
```

### Product list message

```php
use Mohapinkepane\WhatsAppCloud\Components\ProductItem;
use Mohapinkepane\WhatsAppCloud\Components\ProductSection;
use Mohapinkepane\WhatsAppCloud\Messages\ProductListMessage;

ProductListMessage::create('Browse products', 'CATALOG_ID')
    ->addSection(ProductSection::create('Popular', [
        ProductItem::create('SKU-123'),
        ProductItem::create('SKU-456'),
    ]));
```

### Raw payload escape hatch

If Meta adds a message shape before this package exposes a dedicated builder, you can still send the raw payload directly.

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

WhatsAppCloud::sendMessage('26750000000', [
    'messaging_product' => 'whatsapp',
    'type' => 'text',
    'text' => [
        'body' => 'Sent with a raw payload',
    ],
]);
```

---

## Laravel Notifications

The package includes a `WhatsAppChannel` so you can send WhatsApp messages through Laravel notifications.

This is still built on top of the same WhatsApp Cloud API send endpoint, so template and conversation-window rules remain the same.

### Define a notification

```php
use Illuminate\Notifications\Notification;
use Mohapinkepane\WhatsAppCloud\Notifications\WhatsAppChannel;
use Mohapinkepane\WhatsAppCloud\Notifications\WhatsAppMessage;

class OrderShipped extends Notification
{
    public function via(object $notifiable): array
    {
        return [WhatsAppChannel::class];
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        return WhatsAppMessage::text('Your order has shipped.');
    }
}
```

### Route the notification

Add `routeNotificationForWhatsApp` to your notifiable model:

```php
use Illuminate\Notifications\Notification;
use Mohapinkepane\WhatsAppCloud\Support\Recipient;

// Phone number
public function routeNotificationForWhatsApp(Notification $notification): string
{
    return '26750000000';
}

// Business-scoped user ID
public function routeNotificationForWhatsApp(Notification $notification): Recipient
{
    return Recipient::businessScopedUser('bsuid-123');
}
```

### Use richer builders in notifications

```php
use Mohapinkepane\WhatsAppCloud\Notifications\WhatsAppMessage;

public function toWhatsApp(object $notifiable): WhatsAppMessage
{
    return WhatsAppMessage::using(
        TextMessage::create('Shipped!')->replyTo('wamid.origin')
    );
}

// Or pass any message builder directly
public function toWhatsApp(object $notifiable): WhatsAppMessage
{
    return WhatsAppMessage::using(
        TemplateMessage::create('order_update', 'en_US')
    );
}

// Or override the recipient per-notification
public function toWhatsApp(object $notifiable): WhatsAppMessage
{
    return WhatsAppMessage::text('Important update')
        ->toPhoneNumber('26750000000');
}

// Or use a raw payload
public function toWhatsApp(object $notifiable): WhatsAppMessage
{
    return WhatsAppMessage::raw([
        'messaging_product' => 'whatsapp',
        'type' => 'text',
        'text' => ['body' => 'Raw notification payload'],
    ])->toRecipient('26750000000');
}
```

---

## Webhooks

If you are new to the webhook flow, read Meta's [webhook docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks) alongside this section.

### Routes

```php
use Illuminate\Support\Facades\Route;
use Mohapinkepane\WhatsAppCloud\Http\Controllers\WhatsAppWebhookController;

Route::get('/whatsapp/webhook', [WhatsAppWebhookController::class, 'verify']);
Route::post('/whatsapp/webhook', [WhatsAppWebhookController::class, 'handle']);
```

The GET route handles Meta webhook verification. The POST route validates signatures, parses inbound payloads, and dispatches Laravel events.

When `WHATSAPP_RESTRICT_INBOUND_MESSAGES_TO_PHONE_NUMBER_ID=true`, the webhook parser ignores entries whose `metadata.phone_number_id` does not match your configured `phone_number_id`.

### Custom webhook controller

If you want to handle inbound messages yourself instead of relying on event listeners, extend `BaseWhatsAppWebhookController` and override the protected hooks you need. The package still handles signature validation, payload parsing, typed DTO creation, and the default JSON webhook response.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Mohapinkepane\WhatsAppCloud\Http\Controllers\BaseWhatsAppWebhookController;
use Mohapinkepane\WhatsAppCloud\Inbound\IncomingMessage;
use Mohapinkepane\WhatsAppCloud\Webhooks\WebhookPayload;
use Mohapinkepane\WhatsAppCloud\Webhooks\WebhookStatus;

final class BotWebhookController extends BaseWhatsAppWebhookController
{
    protected function handleIncomingMessage(Request $request, IncomingMessage $message, WebhookPayload $payload): void
    {
        // Your bot logic here.
        // You already get a parsed IncomingMessage and IncomingUser DTO.
    }

    protected function handleIncomingStatus(Request $request, WebhookStatus $status, WebhookPayload $payload): void
    {
        // Optional status handling.
    }
}

Route::get('/whatsapp/webhook', [BotWebhookController::class, 'verify']);
Route::post('/whatsapp/webhook', [BotWebhookController::class, 'handle']);
```

Useful hooks when extending the controller:

- `handleIncomingMessage()`
- `handleIncomingStatus()`
- `handleWebhookPayload()`
- `webhookResponse()`
- `parseWebhookPayload()`
- `ensureValidSignature()`

If you want a hybrid approach, your custom controller can still call the package dispatch helpers:

- `dispatchWelcomeRequested()`
- `dispatchMessageReceived()`
- `dispatchSpecializedMessageEvents()`
- `dispatchStatusUpdated()`

### Events

| Event                      | When                                                    |
| -------------------------- | ------------------------------------------------------- |
| `MessageReceived`          | Any incoming message                                    |
| `ReactionReceived`         | Incoming reaction                                       |
| `MediaReceived`            | Incoming media (audio, document, image, sticker, video) |
| `OrderReceived`            | Incoming order/product interaction                      |
| `SystemMessageReceived`    | System messages (number changes, etc.)                  |
| `InteractiveReplyReceived` | Button, list, or flow replies                           |
| `WelcomeRequested`         | Incoming `request_welcome` message                      |
| `StatusUpdated`            | Delivery status updates                                 |

### Listen for events

```php
use Illuminate\Support\Facades\Event;
use Mohapinkepane\WhatsAppCloud\Events\MessageReceived;
use Mohapinkepane\WhatsAppCloud\Events\StatusUpdated;

Event::listen(MessageReceived::class, function (MessageReceived $event) {
    $event->message->id();
    $event->message->sender();
    $event->message->text();
});

Event::listen(StatusUpdated::class, function (StatusUpdated $event) {
    $event->status->id();
    $event->status->status();
    $event->status->conversationId();
    $event->status->pricingCategory();
});
```

### Inbound message helpers

```php
Event::listen(MessageReceived::class, function (MessageReceived $event) {
    $message = $event->message;

    // Text
    $message->text();

    // Sender identity (BSUID-aware)
    $message->sender();
    $message->user()->recipient();
    $message->user()->recipientIdentifier();
    $message->user()->recipientField();
    $message->user()->userId();
    $message->user()->parentUserId();
    $message->user()->phoneNumber();

    // Media
    $media = $message->media();
    $media->id();
    $media->type();
    $media->mimeType();

    // Reaction
    $reaction = $message->reaction();
    $reaction->emoji();
    $reaction->messageId();

    // Location
    $location = $message->location();
    $location->longitude();
    $location->latitude();
    $location->name();

    // Order
    $order = $message->order();
    $order->catalogId();
    $order->items()[0]->productRetailerId();
    $order->items()[0]->quantity();

    // System
    $system = $message->system();
    $system->type();
    $system->newWaId();

    // Interactive replies
    $reply = $message->interactiveReply();
    $reply->type();
    $reply->id();
    $reply->title();
    $reply->flowResponse();

    // Contact cards
    foreach ($message->contacts() as $contact) {
        $contact->formattedName();
    }
});
```

---

## WhatsApp Flows

This section focuses on the Laravel integration points. For flow authoring, publishing, encryption requirements, and runtime behavior, use Meta's [WhatsApp Flows docs](https://developers.facebook.com/docs/whatsapp/flows) as the primary reference.

### Flow endpoint controller

Extend `FlowEndpointController` and wire a route:

```php
use Illuminate\Support\Facades\Route;
use Mohapinkepane\WhatsAppCloud\Flows\FlowEndpointController;
use Mohapinkepane\WhatsAppCloud\Flows\FlowRouter;

final class SurveyFlowController extends FlowEndpointController
{
    protected function expectedFlowToken(): ?string
    {
        return 'FLOW_TOKEN';
    }

    protected function flowRouter(): ?FlowRouter
    {
        return (new FlowRouter())
            ->on('INIT', null, fn (array $payload): array => [
                'screen' => 'WELCOME',
                'data' => ['name' => $payload['data']['name'] ?? 'Guest'],
            ])
            ->on('data_exchange', 'WELCOME', fn (array $payload): array => [
                'screen' => 'DONE',
                'data' => $payload['data'] ?? [],
            ]);
    }

    protected function getNextScreen(array $decryptedBody): array
    {
        return ['screen' => 'FALLBACK'];
    }
}

Route::post('/whatsapp/flows/survey', [SurveyFlowController::class, 'handleFlow']);
```

`FlowEndpointController` handles the encrypted request/response cycle for you. Your controller only needs to decide what the next flow payload should be.

### Generate flow keys

```bash
php artisan whatsapp:generate-key-pair my-passphrase
```

Copy the printed environment values to `.env`, then publish the public key to Meta:

```bash
php artisan whatsapp:publish-public-key
```

---

## Business-Scoped User IDs

WhatsApp can send business-scoped user IDs (BSUIDs) in webhook payloads. This package supports both legacy phone-number identifiers and the newer BSUID fields.

The goal is simple: you should not have to care whether the user came in as a BSUID, parent BSUID, or phone number when replying.

**Inbound identity resolution order:**

1. `user_id` / `from_user_id` (preferred)
2. `parent_user_id` / `from_parent_user_id`
3. `wa_id` / `from` (legacy phone number)

```php
use Illuminate\Support\Facades\Event;
use Mohapinkepane\WhatsAppCloud\Events\MessageReceived;
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;
use Mohapinkepane\WhatsAppCloud\Messages\TextMessage;

Event::listen(MessageReceived::class, function (MessageReceived $event) {
    $user = $event->message->user();

    $user->recipient(); // ready-to-send Recipient instance
    $user->recipientField(); // "recipient" for BSUIDs, "to" for phone numbers
    $user->recipientIdentifier(); // concrete outbound identifier value
    $user->businessScopedId(); // first available BSUID: userId, then parentUserId
    $user->businessScopedUserId(); // alias for businessScopedId()
    $user->identifier(); // convenience alias for the resolved identifier
    $user->id(); // canonical identifier
    $user->userId(); // BSUID when available
    $user->parentUserId(); // parent BSUID when available
    $user->phoneNumber(); // phone number when available

    WhatsAppCloud::sendMessage(
        $user->recipient(),
        TextMessage::create('Thanks for reaching out.')
    );
});
```

Use `recipient()` when you want the package to choose the correct outbound field automatically.

**Outbound routing:**

- When sending to a BSUID, the package uses `recipient` in the API payload
- When sending to a phone number, the package uses `to`
- `Recipient::businessScopedUser(...)` and `Recipient::phoneNumber(...)` make this explicit

---

## Conversational Components

Manage commands, prompts, and welcome messages on your business phone number.

If you need the product behavior and limits behind these features, Meta's [conversational components docs](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components) are the authoritative reference.

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

// Fetch current settings
$current = WhatsAppCloud::conversationalComponents()->json();

// Sync settings from config/whatsapp-cloud.php
WhatsAppCloud::syncConversationalComponents();
```

Configure components in `config/whatsapp-cloud.php`:

```php
'conversational_components' => [
    'enable_welcome_message' => true,
    'commands' => [
        ['command_name' => 'help', 'command_description' => 'Get help'],
    ],
    'prompts' => ['Book a flight', 'Check order status'],
],
```

Sync via artisan:

```bash
php artisan whatsapp:sync-conversational-components
```

---

## Media Endpoints

These helpers wrap Meta's media endpoints. For MIME support, lifecycle details, and download semantics, see Meta's [media reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media).

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

// Upload
$response = WhatsAppCloud::uploadMedia(storage_path('app/invoice.pdf'), 'application/pdf');
$mediaId = $response->json('id');

// Get download URL
$url = WhatsAppCloud::mediaUrl($mediaId);

// Get raw media details
$details = WhatsAppCloud::media($mediaId);

// Delete
WhatsAppCloud::deleteMedia($mediaId);
```

### Mark messages as read

This maps to Meta's message status update behavior in the [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

WhatsAppCloud::markMessageAsRead('wamid.MESSAGE_ID');
```

### Show typing indicator

Typing indicators are sent through the same message status update flow and are tied to a message you are replying to.

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

WhatsAppCloud::showTypingIndicator('wamid.MESSAGE_ID');

// Alias
WhatsAppCloud::typingIndicator('wamid.MESSAGE_ID');
```

---

## Artisan Commands

```bash
# Generate RSA key pair for WhatsApp Flows
php artisan whatsapp:generate-key-pair my-passphrase

# Publish public key to Meta
php artisan whatsapp:publish-public-key

# Sync conversational components from config
php artisan whatsapp:sync-conversational-components
```

---

## Facade Reference

The `WhatsAppCloud` facade resolves to `WhatsAppClient`.

```php
use Mohapinkepane\WhatsAppCloud\Facades\WhatsAppCloud;

WhatsAppCloud::sendMessage($recipient, $message);
WhatsAppCloud::sendMessage($recipient, $message)->replyTo('wamid.id');
WhatsAppCloud::markMessageAsRead('wamid.id');
WhatsAppCloud::showTypingIndicator('wamid.id');
WhatsAppCloud::typingIndicator('wamid.id');
WhatsAppCloud::uploadMedia($path, $mime);
WhatsAppCloud::mediaUrl('MEDIA_ID');
WhatsAppCloud::deleteMedia('MEDIA_ID');
WhatsAppCloud::conversationalComponents();
WhatsAppCloud::syncConversationalComponents();
WhatsAppCloud::get($path);
WhatsAppCloud::post($path, $payload);
WhatsAppCloud::delete($path);
```

The alias is registered automatically via Laravel auto-discovery.

If you prefer constructor injection instead of the facade, resolve `Mohapinkepane\WhatsAppCloud\Client\WhatsAppClient` from the container and use the same methods.

---

## Disclaimer

This is an independent community package. It is not affiliated with, endorsed by, or maintained by Meta or WhatsApp.

Platform rules such as template approval, pricing, delivery windows, rate limits, and account review remain defined by Meta. Use the official documentation linked above when you need the authoritative platform behavior.

See [DISCLAIMER.md](DISCLAIMER.md) for the longer form notice.

---

## Quality

```bash
composer test
composer integration-test
composer analyse
vendor/bin/pint --test
vendor/bin/rector process --dry-run
```

### Real integration tests

`composer integration-test` sends real outbound messages to the WhatsApp Cloud API. It is intentionally separated from `composer test` so the default suite stays fast and offline.

Use `.env.integration.example` as the starting point, then copy its values into `.env.integration`. The integration suite loads `.env.integration` automatically.

Required environment variables:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEST_RECIPIENT=
```

Optional overrides for the live suite:

```env
WHATSAPP_GRAPH_BASE_URL=https://graph.facebook.com
WHATSAPP_GRAPH_API_VERSION=v23.0
WHATSAPP_HTTP_TIMEOUT=30
WHATSAPP_HTTP_RETRY_TIMES=2
WHATSAPP_HTTP_RETRY_SLEEP_MS=200

WHATSAPP_TEST_MEDIA_IMAGE_URL=
WHATSAPP_TEST_MEDIA_AUDIO_URL=
WHATSAPP_TEST_MEDIA_DOCUMENT_URL=
WHATSAPP_TEST_MEDIA_STICKER_URL=
WHATSAPP_TEST_MEDIA_VIDEO_URL=

WHATSAPP_TEST_LOCATION_LATITUDE=
WHATSAPP_TEST_LOCATION_LONGITUDE=
WHATSAPP_TEST_LOCATION_NAME=
WHATSAPP_TEST_LOCATION_ADDRESS=

WHATSAPP_TEST_TEMPLATE_ENABLED=true
WHATSAPP_TEST_TEMPLATE_NAME=hello_world
WHATSAPP_TEST_TEMPLATE_LANGUAGE=en_US
WHATSAPP_TEST_TEMPLATE_BODY_VALUES=

WHATSAPP_TEST_FLOW_ID=
WHATSAPP_TEST_FLOW_TOKEN=
WHATSAPP_TEST_FLOW_CTA=
WHATSAPP_TEST_FLOW_BODY=
WHATSAPP_TEST_FLOW_MODE=published
WHATSAPP_TEST_FLOW_ACTION=navigate
WHATSAPP_TEST_FLOW_SCREEN=
WHATSAPP_TEST_FLOW_DATA_JSON=

WHATSAPP_TEST_CATALOG_ID=
WHATSAPP_TEST_PRODUCT_RETAILER_ID=
WHATSAPP_TEST_PRODUCT_RETAILER_IDS=

WHATSAPP_TEST_BUSINESS_SCOPED_RECIPIENT=
```

The live suite covers plain text, URL previews, image/audio/document/sticker/video media, contacts, location, location requests, reply buttons, lists, CTA URL messages, contextual replies, and reactions. Template, flow, commerce, and business-scoped recipient coverage auto-skip until their extra identifiers are configured.

Non-template messages still depend on WhatsApp's customer service window rules. If delivery is accepted by the API but nothing appears on the device, verify the recipient has an open conversation window with the business phone number. Meta documents that behavior in the [send messages guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.
