# Laravel Chat Engine

A UI-agnostic, transport-agnostic, polymorphic chat engine for Laravel.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ritechoice23/laravel-chat-engine.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-chat-engine)
[![Tests](https://github.com/ritechoice23/laravel-chat-engine/actions/workflows/run-tests.yml/badge.svg)](https://github.com/ritechoice23/laravel-chat-engine/actions)
[![PHPStan](https://github.com/ritechoice23/laravel-chat-engine/actions/workflows/phpstan.yml/badge.svg)](https://github.com/ritechoice23/laravel-chat-engine/actions)
[![Total Downloads](https://img.shields.io/packagist/dt/ritechoice23/laravel-chat-engine.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-chat-engine)
[![License](https://img.shields.io/packagist/l/ritechoice23/laravel-chat-engine)](https://packagist.org/packages/ritechoice23/laravel-chat-engine)

## Features

- **Polymorphic Actors** - Users, Teams, Bots, or any model can chat
- **Thread Types** - Direct, Group, Channel, Broadcast, Custom
- **Rich Messages** - Text, Image, Video, Audio, File, Location, Contact, Custom
- **Attachments** - Multi-file uploads, view-once media, direct request uploads
- **Security** - Thread locks, PIN protection, E2E verification codes
- **Reactions** - Emoji reactions via `laravel-reactions` integration
- **Bookmarks** - Save/bookmark messages via `laravel-saveable` integration
- **Delivery Tracking** - Delivered and read receipts
- **Edit History** - Immutable message versions (configurable)
- **Soft/Hard Delete** - Configurable deletion modes
- **Authorization** - Built-in policies for threads and messages
- **Pipelines** - Message processing (sanitize, mentions, URLs, profanity)
- **Events** - Domain events for all actions
- **API Resources** - Ready-to-use JSON transformations

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x

## Installation

```bash
composer require ritechoice23/laravel-chat-engine
```

Publish the config file:

```bash
php artisan vendor:publish --tag="chat-engine-config"
```

Run migrations:

```bash
php artisan migrate
```

## Quick Start

Add the trait to your User model:

```php
use Ritechoice23\ChatEngine\Traits\CanChat;

class User extends Authenticatable
{
    use CanChat;
}
```

Start chatting:

```php
use Ritechoice23\ChatEngine\Facades\Chat;

// Create a thread
$thread = Chat::thread()->between($userA, $userB)->create();

// Send a message
$message = Chat::message()
    ->from($userA)
    ->to($thread)
    ->text('Hello!')
    ->send();

// React to message
$userB->react($message, '❤️');

// Bookmark message
$userB->saveItem($message);

// Mark as read
$message->markAsReadBy($userB);
```

## File Uploads

Upload files directly from Laravel requests:

```php
// Single file
Chat::message()
    ->from($request->user())
    ->to($thread)
    ->text('Check this out!')
    ->attachUpload($request->file('photo'))
    ->send();

// Multiple files
Chat::message()
    ->from($request->user())
    ->to($thread)
    ->attachUploads($request->file('attachments'))
    ->send();

// View-once (self-destructing)
Chat::message()
    ->from($request->user())
    ->to($thread)
    ->attachUploadViewOnce($request->file('secret'))
    ->send();
```

## Message Types

```php
// Text
Chat::message()->from($user)->to($thread)->text('Hello')->send();

// Image
Chat::message()->from($user)->to($thread)
    ->image('https://...', 'Caption')->send();

// Video
Chat::message()->from($user)->to($thread)
    ->video('https://...', 'thumb.jpg', 120)->send();

// File
Chat::message()->from($user)->to($thread)
    ->file('https://...', 'doc.pdf', 'application/pdf')->send();

// Location
Chat::message()->from($user)->to($thread)
    ->location(40.7128, -74.0060, 'NYC')->send();

// Contact
Chat::message()->from($user)->to($thread)
    ->contact('John Doe', '+1234567890', 'john@example.com')->send();
```

## Thread Types

```php
// Direct (1-on-1, automatically deduplicated)
Chat::thread()->between($userA, $userB)->create();

// Group
Chat::thread()->group('Team Chat')->participants([$u1, $u2, $u3])->create();

// Channel
Chat::thread()->channel('announcements')->create();

// Broadcast
Chat::thread()->broadcast('System Updates')->create();
```

## Documentation

See [`/docs`](docs/README.md) for complete documentation:

| Getting Started | Core Features | System | Advanced |
|-----------------|---------------|--------|----------|
| [Installation](docs/installation.md) | [Threads](docs/threads.md) | [Events](docs/events.md) | [Encryption](docs/encryption.md) |
| [Configuration](docs/configuration.md) | [Messages](docs/messages.md) | [Policies](docs/policies.md) | [Retention](docs/retention.md) |
| | [Attachments](docs/attachments.md) | [Pipelines](docs/pipelines.md) | [Scaling](docs/scaling.md) |
| | [Security](docs/security.md) | [Presence](docs/presence.md) | [Customization](docs/customization.md) |
| | [Delivery](docs/delivery.md) | [API Resources](docs/resources.md) | |
| | [Reactions](docs/reactions.md) | | |
| | [Bookmarks](docs/bookmarks.md) | | |

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you discover a security vulnerability, please send an email to [daramolatunde23@gmail.com](mailto:daramolatunde23@gmail.com). All security vulnerabilities will be promptly addressed.

## Credits

- [Daramola Babatunde Ebenezer](https://github.com/ritechoice23)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
