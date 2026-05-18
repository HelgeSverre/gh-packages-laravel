
[![Packagist](https://img.shields.io/packagist/v/dominservice/conversations.svg)]()
[![Latest Version](https://img.shields.io/github/release/dominservice/conversations.svg?style=flat-square)](https://github.com/dominservice/conversations/releases)
[![Total Downloads](https://img.shields.io/packagist/dt/dominservice/conversations.svg?style=flat-square)](https://packagist.org/packages/dominservice/conversations)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

# Laravel Conversations - Complete Messaging System

A powerful, flexible, and feature-rich messaging system for Laravel applications. Build real-time chat, messaging platforms, support systems, and communication tools with ease.

## Features

- 💬 **Complete Messaging System** - Private and group conversations with full message history
- ⚡ **Real-time Communication** - Built-in broadcasting support for instant messaging
- 🔌 **Multiple Broadcasting Drivers** - Support for Pusher, Laravel WebSockets, Firebase, MQTT, and Socket.IO
- 📎 **File Attachments** - Support for images, documents, audio, and video files with security features
- 🖼️ **Image Optimization** - Automatic image resizing, format conversion, and thumbnail generation
- 🌐 **RESTful API** - Ready-to-use API endpoints for web and mobile applications
- 🪝 **Extensible Hook System** - Customize behavior without modifying core code
- 🌍 **Multilingual Support** - Easily translate all messages to any language
- 📱 **Mobile-Friendly** - Works seamlessly with mobile applications
- 🔒 **Secure** - Built with security best practices including virus scanning for attachments
- 📝 **TypeScript Support** - Type definitions for Vue and React components

## Compatibility

| Package Version | Laravel Compatibility |
|-----------------|-----------------------|
| 1.*             | 5.6 - 9.*             |
| 2.*             | 8.* - 11.*            |
| 3.*             | 9.* - 13.*            |

> **Note:** Version 3.0.0 introduces significant new features including real-time broadcasting, hooks system, API endpoints, and multilingual support.

## Installation

### 1. Install via Composer

```bash
composer require dominservice/conversations
```

### 2. Publish Configuration and Migrations

```bash
php artisan vendor:publish --provider="Dominservice\Conversations\ConversationsServiceProvider"
```

This will publish all assets including config, migrations, translations, and routes. If you want to publish specific assets, you can use one of the following tags:

```bash
# Publish only configuration
php artisan vendor:publish --tag=conversations-config

# Publish only migrations
php artisan vendor:publish --tag=conversations-migrations

# Publish only translations
php artisan vendor:publish --tag=conversations-translations

# Publish only routes
php artisan vendor:publish --tag=conversations-routes

# Publish only frontend components
php artisan vendor:publish --tag=conversations-components

# Publish only TypeScript definitions
php artisan vendor:publish --tag=conversations-typescript

# Publish all assets
php artisan vendor:publish --tag=conversations
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Register Service Provider (Laravel < 5.5)

For Laravel 5.5 and above, the package will be auto-discovered. For older versions, add the service provider to `config/app.php`:

```php
'providers' => [
    // Other service providers...
    Dominservice\Conversations\ConversationsServiceProvider::class,
],

'aliases' => [
    // Other aliases...
    'Conversations' => Dominservice\Conversations\Facade\Conversations::class,
]
```

> **Note:** If you're experiencing issues with the package not appearing in the vendor:publish list, make sure your application has properly registered the service provider. You can manually register it in your `config/app.php` file even if you're using Laravel 5.5+ to ensure it's loaded correctly.

## Quick Start

### Basic Usage

```php
// Create a new conversation
$conversationId = Conversations::create([$user1Id, $user2Id], null, null, 'Hello!');

// Add a message to a conversation
Conversations::addMessage($conversationId, 'How are you doing?');

// Get all conversations for a user
$conversations = Conversations::getConversations($userId);

// Get messages in a conversation
$messages = Conversations::getMessages($conversationId, $userId);
```

### Real-time Chat

Enable broadcasting in your `.env` file:

```
CONVERSATIONS_BROADCASTING_ENABLED=true
CONVERSATIONS_BROADCASTING_DRIVER=pusher
```

Then use the broadcasting features:

```php
// Broadcast that a user is typing
ConversationsBroadcasting::broadcastUserTyping($conversationId, $userId, $userName);
```

## Documentation

Comprehensive documentation is available to help you get the most out of the package:

- [Examples & Usage Guide](README-EXAMPLES.md) - Code examples and implementation guides
- [Integration Guides](README-INTEGRATION.md) - Detailed guides for integrating with Laravel Breeze, Jetstream, Livewire, Inertia.js, Sanctum, and Nova
- [API Documentation](README-API.md) - Information about the REST API endpoints
- [GraphQL API Documentation](README-GRAPHQL.md) - Information about the GraphQL API
- [Frontend Components](README-COMPONENTS.md) - Ready-to-use Vue and React components
- [TypeScript Support](README-COMPONENTS.md#typescript-support) - Type definitions for Vue and React components
- [Broadcasting Documentation](README-BROADCASTING.md) - Information about real-time broadcasting
- [Hooks Documentation](README-HOOKS.md) - Information about the hook system
- [Translations Documentation](README-TRANSLATIONS.md) - Information about customizing messages
- [Routes Documentation](README-ROUTES.md) - Information about customizing API routes

## Upgrading from laravel_chat

This package is a continuation of the [dominservice/laravel_chat](https://github.com/dominservice/laravel_chat) package. If you're upgrading:

1. Install this package alongside the old one
2. Run migrations (they include data migration scripts)
3. Remove the old package

Always make a backup before performing this operation!

## Testing

The package includes automated tests to ensure functionality works as expected. To run the tests:

### Requirements

- PHP with SQLite extension enabled (`php-sqlite3`)

If you don't have the SQLite extension installed, you can install it on Ubuntu/Debian with:

```bash
sudo apt-get install php-sqlite3
```

On CentOS/RHEL:

```bash
sudo yum install php-sqlite3
```

### Running Tests

```bash
composer install
vendor/bin/phpunit
```

Alternatively, you can use the provided script:

```bash
./run-tests.sh
```

### Continuous Integration

This package uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The workflow includes:

- Running tests on multiple PHP versions (8.1, 8.2, 8.3) and Laravel versions (9.*, 10.*, 11.*)
- Code style checking with PHP_CodeSniffer (PSR-12)
- Static analysis with PHPStan
- Automated releases when tags are pushed

The CI/CD pipeline ensures that all code changes are thoroughly tested before being merged into the main branch. You can see the workflow configuration in the `.github/workflows/ci-cd.yml` file.

## Usage Examples

Here are some common usage examples. For more detailed examples, see the [Examples & Usage Guide](README-EXAMPLES.md).

### Creating and Managing Conversations

```php
// Create a new conversation between users
$conversationId = Conversations::create([$user1Id, $user2Id], null, null, 'Initial message');

// Add a message to an existing conversation
$messageId = Conversations::addMessage($conversationId, 'Hello, how are you?');

// Create a conversation or add to existing one if it exists
$messageId = Conversations::addMessageOrCreateConversation([$user1Id, $user2Id], 'Hello!');

// Get conversation ID between specific users
$conversationId = Conversations::getIdBetweenUsers([$user1Id, $user2Id]);

// Check if a user is part of a conversation
$isUserInConversation = Conversations::existsUser($conversationId, $userId);

// Delete a conversation (for a specific user)
Conversations::delete($conversationId, $userId);
```

### Reading Messages and Conversations

```php
// Get all conversations for a user
$conversations = Conversations::getConversations($userId);

// Get messages in a conversation
$messages = Conversations::getMessages($conversationId, $userId);

// Get only unread messages
$unreadMessages = Conversations::getUnreadMessages($conversationId, $userId);

// Get count of all unread messages for a user
$unreadCount = Conversations::getUnreadCount($userId);

// Get count of unread messages in a specific conversation
$conversationUnreadCount = Conversations::getConversationUnreadCount($conversationId, $userId);
```

### Message Status Management

```php
// Mark a message as read
Conversations::markAsRead($conversationId, $messageId, $userId);

// Mark a message as unread
Conversations::markAsUnread($conversationId, $messageId, $userId);

// Mark a message as deleted
Conversations::markAsDeleted($conversationId, $messageId, $userId);

// Mark a message as archived
Conversations::markAsArchived($conversationId, $messageId, $userId);

// Mark all messages in a conversation as read
Conversations::markReadAll($conversationId, $userId);

// Mark all messages in a conversation as unread
Conversations::markUnreadAll($conversationId, $userId);
```

### Read Receipts and "Seen By" Functionality

```php
// Get all users who have read a specific message
$readBy = Conversations::getMessageReadBy($messageId);

// Get all messages in a conversation with their read status for all users
$messagesWithReadStatus = Conversations::getConversationReadBy($conversationId);

// Example of accessing read receipt information
foreach ($messagesWithReadStatus as $message) {
    echo "Message: {$message['content']}\n";
    echo "Read by {$message['read_count']} users\n";

    foreach ($message['read_by'] as $user) {
        echo "- {$user->name} ({$user->email})\n";
    }
}
```

#### API Endpoints for Read Receipts

The package provides API endpoints for retrieving read receipt information:

- `GET /api/conversations/{uuid}/messages/{messageId}/read-by` - Get all users who have read a specific message
- `GET /api/conversations/{uuid}/read-by` - Get all messages in a conversation with their read status

#### Real-time Read Receipts

When broadcasting is enabled, the `message.read` event includes information about who has read the message:

```javascript
Echo.private(`conversation.${conversationId}`)
    .listen('.message.read', (e) => {
        console.log(`Message ${e.message_id} was read by ${e.user.name}`);
        console.log(`Total readers: ${e.read_count}`);

        // Update UI to show who has seen the message
        updateSeenByList(e.message_id, e.read_by);
    });
```

### Message Reactions

The package supports emoji reactions to messages, similar to popular messaging platforms:

```php
// Add a reaction to a message
$reactionId = Conversations::addReaction($messageId, '👍');

// Remove a reaction from a message
Conversations::removeReaction($messageId, '👍');

// Get all reactions for a message
$reactions = Conversations::getMessageReactions($messageId);

// Get a summary of reactions (grouped by emoji with count)
$reactionsSummary = Conversations::getMessageReactionsSummary($messageId);

// Check if a message has reactions
$message = ConversationMessage::with('reactions')->find($messageId);
if ($message->hasReactions()) {
    // Message has reactions
}

// Check if a user has reacted to a message with a specific emoji
if ($message->hasUserReaction($userId, '👍')) {
    // User has reacted with thumbs up
}
```

#### API Endpoints for Reactions

The package provides API endpoints for managing reactions:

- `GET /api/conversations/{uuid}/messages/{messageId}/reactions` - Get all reactions for a message
- `POST /api/conversations/{uuid}/messages/{messageId}/reactions` - Add a reaction to a message
- `DELETE /api/conversations/{uuid}/messages/{messageId}/reactions/{reaction}` - Remove a reaction from a message

#### Real-time Reaction Updates

When broadcasting is enabled, reaction events are broadcast in real-time:

```javascript
Echo.private(`conversation.${conversationId}`)
    .listen('.message.reaction.added', (e) => {
        console.log(`${e.user.name} reacted with ${e.reaction} to message ${e.message_id}`);
        // Update UI to show the new reaction
        updateReactions(e.message_id, e.reactions_summary);
    })
    .listen('.message.reaction.removed', (e) => {
        console.log(`${e.user.name} removed ${e.reaction} from message ${e.message_id}`);
        // Update UI to remove the reaction
        updateReactions(e.message_id, e.reactions_summary);
    });
```

### Attachments

The package supports file attachments with various security and optimization features:

```php
// Add a message with attachments
$file = $request->file('attachment');
$messageId = Conversations::addMessageWithAttachments($conversationId, 'Check out this file!', [$file]);

// Get attachments for a message
$message = ConversationMessage::with('attachments')->find($messageId);
$attachments = $message->attachments;

// Check if a message has attachments
if ($message->hasAttachments()) {
    $firstAttachment = $message->getFirstAttachment();
    $attachmentUrl = $firstAttachment->getUrlAttribute();

    // For images, get thumbnails
    if ($firstAttachment->isImage()) {
        $thumbnailUrl = $firstAttachment->getThumbnailUrl('small');
    }

    // Check if attachment requires a warning
    if ($firstAttachment->requiresWarning()) {
        // Show warning to user
    }
}
```

### Message Editing

The package allows users to edit their messages within a configurable time window:

```php
// Edit a message
$updatedMessage = Conversations::editMessage($messageId, 'This is the updated content');

// Check if a message is editable by the current user
$isEditable = Conversations::isMessageEditable($messageId);

// Set whether a message is editable (override the time limit)
Conversations::setMessageEditable($messageId, false); // Disable editing for this message
```

#### API Endpoints for Message Editing

The package provides API endpoints for message editing:

- `PUT /api/conversations/{uuid}/messages/{messageId}` - Edit a message
- `GET /api/conversations/{uuid}/messages/{messageId}/editable` - Check if a message is editable

#### Real-time Message Editing Updates

When broadcasting is enabled, message edit events are broadcast in real-time:

```javascript
Echo.private(`conversation.${conversationId}`)
    .listen('.message.edited', (e) => {
        console.log(`Message ${e.message_id} was edited by ${e.user.name}`);
        console.log(`New content: ${e.content}`);

        // Update UI to show the edited message
        updateMessageContent(e.message_id, e.content, e.edited_at);
    });
```

### Message Threading

The package supports threaded replies to messages, similar to popular messaging platforms:

```php
// Reply to a message
$replyMessageId = Conversations::replyToMessage($parentMessageId, 'This is a reply to the parent message');

// Add a message with a parent ID
$messageId = Conversations::addMessage($conversationId, 'This is a reply', false, false, [], $parentMessageId);

// Check if a message is a reply
$message = ConversationMessage::find($messageId);
if ($message->isReply()) {
    // Message is a reply to another message
    $parentMessage = $message->parent;
}

// Get all replies to a message
$message = ConversationMessage::with('replies')->find($parentMessageId);
if ($message->hasReplies()) {
    $replies = $message->replies;
}

// Get the thread root (the topmost parent in a thread)
$threadRoot = $message->getThreadRoot();
```

#### API Endpoints for Message Threading

The package provides API endpoints for message threading:

- `POST /api/conversations/{uuid}/messages/{messageId}/reply` - Reply to a message
- `GET /api/conversations/{uuid}/messages/{messageId}/thread` - Get all messages in a thread

#### Real-time Thread Updates

When broadcasting is enabled, new replies in a thread are broadcast as regular messages with a parent_id field:

```javascript
Echo.private(`conversation.${conversationId}`)
    .listen('.message.sent', (e) => {
        if (e.parent_id) {
            console.log(`New reply to message ${e.parent_id}: ${e.content}`);
            // Update UI to show the new reply in the thread
            addReplyToThread(e.parent_id, e);
        }
    });
```

### Helper Functions

The package also provides helper functions for easier usage:

```php
// Create a conversation
$conversationId = conversation_create([$user1Id, $user2Id], null, null, 'Initial message');

// Add a message
$messageId = conversation_add_message($conversationId, 'Hello!');

// Get conversations
$conversations = conversations($userId);

// Get messages
$messages = conversation_messages($conversationId, $userId);

// Mark as read
conversation_mark_as_read($conversationId, $messageId, $userId);
```

## Why Choose Laravel Conversations?

- **Complete Solution**: Everything you need for a messaging system in one package
- **Highly Customizable**: Extensive configuration options and hook system
- **Well-Documented**: Comprehensive documentation with examples
- **Actively Maintained**: Regular updates and improvements
- **Production Ready**: Used in production applications
- **Mobile Compatible**: Works with web and mobile applications
- **Real-time Capable**: Built-in broadcasting support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Credits

- [dominservice](https://github.com/dominservice)
- [tzookb/tbmsg](https://github.com/tzookb/tbmsg) (Original inspiration)
- [All Contributors](../../contributors)


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dominservice)

## Server-Rendered Web Panel (v3)

Package now supports a mobile-first server-rendered panel that can be used without building a custom chat UI from scratch.

### What is included

- Optional web routes for conversation panel (`/conversation` by default)
- Theme switch: `bootstrap` or `tailwind`
- Package JS runtime for messaging flow (`panel.js`)
- Package CSS for panel layout (`panel.css`)
- Integration callbacks for project-specific business rules

### Publish tags (new)

```bash
php artisan vendor:publish --tag=conversations-web-routes
php artisan vendor:publish --tag=conversations-views
php artisan vendor:publish --tag=conversations-assets
```

### Basic config

```php
'web' => [
    'enabled' => true,
    'prefix' => 'conversation',
    'middleware' => ['web', 'auth'],
    'route_name_prefix' => 'conversations.web.',
],

'ui' => [
    'theme' => 'bootstrap', // bootstrap | tailwind
    'view' => 'conversations::panel.index',
    'contacts_endpoint' => null,
    'assets' => [
        'css' => 'vendor/conversations/css/panel.css',
        'js' => 'vendor/conversations/js/panel.js',
    ],
],
```

### Integration callbacks (new)

```php
'integrations' => [
    'ui' => [
        'contacts_provider' => null,
        'conversations_provider' => null,
        'conversation_delete' => null,
    ],
],
```

These callbacks allow package-first behavior while still adapting to project-level rules (e.g. only contacts can start a conversation, custom delete policy, custom contact source).
