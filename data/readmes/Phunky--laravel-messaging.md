# Laravel Messaging

Wire up conversations between any Eloquent models. Users, teams, orders, support tickets — anything. Laravel Messaging handles conversations, participants, messages, and a lifecycle event system.

## Installation

```bash
composer require phunky/laravel-messaging
```

Packagist: [phunky/laravel-messaging](https://packagist.org/packages/phunky/laravel-messaging).

Optionally publish the config and migrations:

```bash
php artisan vendor:publish --tag="messaging-config"
php artisan vendor:publish --tag="messaging-migrations"
php artisan migrate
```

The `Messenger` facade is auto-discovered.

## Making models messageable

Any model that participates in conversations needs to implement `Messageable` and pull in the `HasMessaging` trait:

```php
use Phunky\LaravelMessaging\Contracts\Messageable;
use Phunky\LaravelMessaging\Traits\HasMessaging;

class User extends Authenticatable implements Messageable
{
    use HasMessaging;
}

class Order extends Model implements Messageable
{
    use HasMessaging;
}
```

Participant types mix freely. A `Customer` and an `Order` can share a conversation.

## Usage

### Sending messages

```php
use Phunky\LaravelMessaging\Facades\Messenger;

// Two users
Messenger::conversation($userA, $userB)->as($userA)->send('Hello');

// Cross-type (customer ↔ order)
Messenger::conversation($customer, $order)->as($customer)->send('Where is my order?');

// More than two participants
Messenger::conversation($userA, $userB, $userC)->as($userA)->send('Hey everyone');

// With metadata
Messenger::conversation($userA, $userB)->as($userA)->send('Hello', meta: ['source' => 'web']);

// Fetch messages without creating a conversation
Messenger::conversation($userA, $userB)->messages();
```

For workflows that must create extension-owned rows with the message, use
`MessagingService::sendMessageUsing()` so the callback runs inside the same
database transaction:

```php
$message = app(MessagingService::class)->sendMessageUsing(
    $conversation,
    $sender,
    'Hello with files',
    afterPersisted: function (Message $message) use ($attachments, $sender) {
        app(AttachmentService::class)->attachMany($message, $sender, $attachments);
    },
);
```

### Receipts and read state

```php
Messenger::conversation($userA, $userB)->as($userB)->unreadCount();
Messenger::conversation($userA, $userB)->as($userB)->markAllRead();

Messenger::message($id)->as($userB)->received();
Messenger::message($id)->as($userB)->read();

// Inbox — participating conversations, most recent first, with unread_count
Messenger::conversationsFor($userA)->with('latestMessage')->get();
```

### Events, edits, deletes

```php
// Custom per-message event — idempotent per participant + event name
Messenger::message($id)->as($userB)->recordEvent('message.voice.first_play', ['seconds' => 42]);

// Conversation-scoped events
Messenger::conversation($userA, $userB)->as($userB)->recordInviteAccepted(['invite_id' => 1]);
Messenger::conversation($userA, $userB)->as($userB)->recordMemberLeft();

// Edit and delete (sender only)
Messenger::message($id)->as($userA)->edit('Updated text');
Messenger::message($id)->as($userA)->delete();
```

Direct access via the trait:

```php
$userA->conversations;
$userA->messages;
```

Event name constants live on `Phunky\LaravelMessaging\MessagingEventName`.

## Extensions

The core ships with nothing beyond the basics for messaging, but it can easily be extended and below are some examples;


|                                                                                                             | What it adds              |
| ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| [phunky/laravel-messaging-reactions](https://packagist.org/packages/phunky/laravel-messaging-reactions)     | Per-message reactions     |
| [phunky/laravel-messaging-attachments](https://packagist.org/packages/phunky/laravel-messaging-attachments) | File and link attachments |
| [phunky/laravel-messaging-groups](https://packagist.org/packages/phunky/laravel-messaging-groups)           | Group conversations       |


Register extensions in `config/messaging.php`:

```php
'extensions' => [
    \LaravelMessagingReactions\ReactionsExtension::class,
    \LaravelMessagingAttachments\AttachmentExtension::class,
    \LaravelMessagingGroups\GroupsExtension::class,
],
```

Extension classes can use `RegistersMessagingExtensionResources` to register
their migration path, message macros, and message-delete cleanup consistently:

```php
class AttachmentsExtension implements MessagingExtension
{
    use RegistersMessagingExtensionResources;

    public function boot(Application $app): void
    {
        $this->registerMessagingMigrations($app, __DIR__.'/../database/migrations');
        $this->registerMessageMacro('attachments', function () {
            return $this->hasMany(Attachment::class);
        });
        $this->deleteRelatedModelsWhenMessageDeleted(Attachment::class);
    }
}
```

### Package roadmap

The next package boundaries should stay close to reusable behavior proven in the
playground app:

1. `laravel-messaging-inbox` — richer inbox projections, pinned/archived rows,
  and prebuilt unread/activity queries on top of the core `last_activity_at`
   and `messaging.inbox.updated` contracts.
2. `laravel-messaging-echo` — an official Echo/Reverb bridge with presence
  subscriptions, event-name constants, typing/recording whispers, and payload
   normalizers for Livewire or vanilla clients.
3. `laravel-messaging-media` — storage-backed attachments with validation
  presets, temporary/signed URLs, thumbnails, and gallery queries.
4. `laravel-messaging-moderation` — roles, muting, blocking, reports, removal
  reasons, and audit events.
5. `laravel-messaging-notifications`, `laravel-messaging-search`, and
  `laravel-messaging-mentions` — focused add-ons for delivery, discovery, and
   participant mention workflows once the inbox and client contracts are stable.

### Writing your own extension

Implement `Phunky\LaravelMessaging\Contracts\MessagingExtension`:

- `**register(Application $app)**` — bind services, register macros, define relationships
- `**boot(Application $app)**` — listen to lifecycle events, add migrations

Extensions can listen to `MessageSending`, `MessageSent`, `ConversationCreated`, etc., register macros on `Message`, and add their own migrations (the table prefix is applied automatically).

## Intercepting sends

`MessageSending` fires before the message hits the database and outside the transaction. Listeners can mutate the body, append metadata, or cancel the send entirely:

```php
use Phunky\LaravelMessaging\Events\MessageSending;

Event::listen(MessageSending::class, function (MessageSending $event) {
    $event->body = ai_moderate($event->body);
    $event->meta['moderated'] = true;

    if (contains_prohibited_content($event->body)) {
        $event->cancel(); // throws MessageRejectedException at the call site
    }
});
```

## Broadcasting

Set `broadcasting.enabled = true` in the config. Events that implement `ShouldBroadcast` — `ConversationCreated`, `MessageSent`, `MessageEdited`, `MessageDeleted`, `MessageReceived`, `MessageRead`, `AllMessagesRead` — will broadcast on **presence channels** in the format `{channel_prefix}.conversation.{conversationId}` (default prefix: `messaging`). `MessageSending` is never broadcast.

### Authorizing the channel

Presence channels require the authorizer to return an associative array of member metadata (or `null`/`false` to deny). At minimum expose an `id` and a `name`:

```php
// routes/channels.php
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('messaging.conversation.{conversationId}', function ($user, int $conversationId) {
    if (! $user->conversations()->whereKey($conversationId)->exists()) {
        return null;
    }

    return [
        'id' => $user->getKey(),
        'name' => $user->name,
    ];
});
```

### Client subscriptions

Clients must join the channel as a presence channel, not a private one:

```js
window.Echo.join(`messaging.conversation.${id}`)
    .here((members) => { /* initial members */ })
    .joining((member) => { /* someone came online in this thread */ })
    .leaving((member) => { /* someone left */ })
    .listen('.messaging.message.sent', (payload) => { /* ... */ });
```

### Broadcast payloads

Broadcast payloads include stable top-level identifiers so clients do not need
to inspect serialized Eloquent model internals:


| Event                                            | Stable payload keys                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `ConversationCreated`                            | `conversation_id`, `participant_ids`                                    |
| `MessageSent`, `MessageEdited`, `MessageDeleted` | `conversation_id`, `message_id`                                         |
| `MessageReceived`, `MessageRead`                 | `conversation_id`, `message_id`, `messaging_event_id`, `participant_id` |
| `AllMessagesRead`                                | `conversation_id`, `reader_type`, `reader_id`, `count`                  |


Extension events that extend `BroadcastableMessagingEvent` automatically include
`conversation_id`; extensions should add their own top-level resource ids.

### Inbox updates

The package maintains `conversations.last_activity_at` when messages are sent,
edited, deleted, or marked read. Extensions can call
`MessagingService::touchConversationActivity($conversation, activityAt: now(), activityType: 'reaction.updated')`
when their own activity should bump an inbox.

Set `broadcasting.inbox_channel_pattern` to broadcast participant-scoped inbox
updates. The pattern supports `{id}` and `{type}` placeholders:

```php
'broadcasting' => [
    'enabled' => true,
    'channel_prefix' => 'messaging',
    'inbox_channel_pattern' => 'App.Models.User.{id}',
],
```

Inbox broadcasts use the short name `messaging.inbox.updated` and include
`conversation_id`, `activity_type`, and `last_activity_at`.

### Typing (client whispers)

The package does not dispatch a PHP event for typing — it is a client-only concern. By convention, hosts use the reserved whisper event name `typing` on the same presence channel:

```js
// Sender
channel.whisper('typing', {
    messageable_type: 'App\\Models\\User',
    messageable_id: userId,
    name: userName,
    typing: true, // or false when the sender stops
});

// Receiver
channel.listenForWhisper('typing', (payload) => {
    // payload.typing === true|false, payload.name, payload.messageable_id
});
```

Because whispers are only delivered to currently-subscribed clients, typing is inherently scoped to participants who are online and have the channel open. Online status is derived from the presence member list.

## Lifecycle events


| Event                 | Fired                             | Properties                                    |
| --------------------- | --------------------------------- | --------------------------------------------- |
| `ConversationCreated` | New conversation created          | `$conversation`, `$participants`              |
| `MessageSending`      | Before persistence                | `$conversation`, `$sender`, `$body`, `$meta`  |
| `MessageSent`         | After persistence                 | `$message`, `$conversation`                   |
| `MessageEdited`       | Body updated                      | `$message`, `$originalBody`, `$conversation`  |
| `MessageDeleted`      | Soft-deleted                      | `$message`, `$conversation`                   |
| `MessageReceived`     | First `message.received` recorded | `$messagingEvent`, `$message`, `$participant` |
| `MessageRead`         | First `message.read` recorded     | `$messagingEvent`, `$message`, `$participant` |
| `AllMessagesRead`     | After `markAllRead()`             | `$conversation`, `$reader`, `$count`          |


## Custom models

Swap any model in `config/messaging.php` under `models`. Extend the package's base classes rather than replacing them — this keeps foreign keys and contracts intact. If your class name implies a different table name, set `protected $table = messaging_table('conversations')` to respect the configured prefix.

## Table prefix

Defaults to `messaging_`. Change it in config. Use the `messaging_table('conversations')` helper anywhere you need the full table name.

## License

MIT