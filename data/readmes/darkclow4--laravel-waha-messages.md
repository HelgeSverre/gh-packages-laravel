# Laravel WAHA Messages

A Laravel package for seamless integration with [WAHA (WhatsApp HTTP API)](https://waha.devlike.pro/). Send messages, manage sessions, handle groups, contacts, and chats — all through a clean, fluent API.

> [!WARNING]
> **Unofficial API Notice**
> WAHA is an unofficial WhatsApp API. Please use this package responsibly. Sending messages too quickly, sending spam, or violating WhatsApp's Terms of Service may result in your WhatsApp number being permanently banned or blocked by Meta. Use at your own risk.

## Requirements

- PHP 8.3+
- Laravel 11.x or above
- A running [WAHA](https://github.com/devlikeapro/waha) instance

## Installation

Add the package to your Laravel project:

```bash
composer require darkclow4/laravel-waha-messages
```

The service provider and facade are auto-discovered. To publish the config file:

```bash
php artisan vendor:publish --tag=waha-config
```

## Configuration

Add the following to your `.env` file:

```env
WAHA_URL=http://localhost:3000
WAHA_API_KEY=your-api-key
WAHA_SESSION=default
WAHA_TIMEOUT=30
WAHA_CONNECT_TIMEOUT=10
WAHA_RETRY_TIMES=3
WAHA_RETRY_SLEEP=100
```

| Variable | Description | Default |
|---|---|---|
| `WAHA_URL` | Base URL of your WAHA server | `http://localhost:3000` |
| `WAHA_API_KEY` | API key for authentication | `null` |
| `WAHA_SESSION` | Default session name | `default` |
| `WAHA_TIMEOUT` | Request timeout (seconds) | `30` |
| `WAHA_CONNECT_TIMEOUT` | Connection timeout (seconds) | `10` |
| `WAHA_RETRY_TIMES` | Number of retry attempts | `3` |
| `WAHA_RETRY_SLEEP` | Delay between retries (ms) | `100` |

## Quick Start

```php
use LaravelWaha\WahaMessages\Facades\Waha;

// Send a text message
Waha::messages()->sendText('1111111111111@c.us', 'Hello from Laravel!');
```

## Usage

### Sending Messages

#### Text Message

```php
Waha::messages()->sendText('1111111111111@c.us', 'Hello World!');

// With a specific session
Waha::messages()->sendText('1111111111111@c.us', 'Hello!', 'my-session');
```

#### Image Message

```php
Waha::messages()->sendImage(
    chatId: '1111111111111@c.us',
    url: 'https://example.com/photo.jpg',
    caption: 'Check out this image!',
);
```

#### Video Message

```php
Waha::messages()->sendVideo(
    chatId: '1111111111111@c.us',
    url: 'https://example.com/video.mp4',
    caption: 'Watch this video!',
);
```

#### File / Document Message

```php
Waha::messages()->sendFile(
    chatId: '1111111111111@c.us',
    url: 'https://example.com/report.pdf',
    filename: 'monthly-report.pdf',
);
```

#### Location Message

```php
Waha::messages()->sendLocation(
    chatId: '1111111111111@c.us',
    latitude: -6.200000,
    longitude: 106.816666,
    title: 'Jakarta',
);
```

#### Contact vCard

```php
Waha::messages()->sendContact(
    chatId: '1111111111111@c.us',
    contact: [
        'fullName' => 'John Doe',
        'phoneNumber' => '+1111111111111',
    ],
);
```

#### Mark as Seen

```php
Waha::messages()->sendSeen('1111111111111@c.us');
```

#### Typing Indicator

```php
// Start typing
Waha::messages()->startTyping('1111111111111@c.us');

// Stop typing
Waha::messages()->stopTyping('1111111111111@c.us');
```

---

### Human-Like Messaging

Send messages that simulate real human behavior. The flow automatically executes in this order:

1. **Mark as seen** — Read receipt appears on the chat
2. **Start typing** — Typing indicator shows up
3. **Delay** — Waits based on the message character count
4. **Stop typing** — Typing indicator disappears
5. **Send message** — The actual message is delivered

```php
// Basic usage
Waha::humanLike()->sendText('1111111111111@c.us', 'Hello!');

// With a specific session
Waha::humanLike()->sendText('1111111111111@c.us', 'Hello!', 'my-session');
```

#### Configuring Typing Speed

You can fine-tune the typing delay using a fluent API:

```php
Waha::humanLike()
    ->msPerChar(100)     // 100ms per character (default: 300)
    ->minDelay(1000)     // Minimum 1 second delay (default: 2000ms)
    ->maxDelay(15000)    // Maximum 15 second delay (default: 10000ms)
    ->sendText('1111111111111@c.us', 'This message will take longer to "type"...');
```

| Option | Description | Default |
|---|---|---|
| `msPerChar(int)` | Milliseconds per character | `300` |
| `minDelay(int)` | Minimum delay in ms | `2000` |
| `maxDelay(int)` | Maximum delay in ms | `10000` |

> **Tip:** A short message like "Hi!" (3 chars × 300ms = 900ms) will use the `minDelay` instead. A very long message will be capped at `maxDelay`.

---

### Session Management

```php
// List all sessions
$sessions = Waha::sessions()->list();

// Create a new session
Waha::sessions()->create(['name' => 'my-session']);

// Start / Stop / Logout
Waha::sessions()->start('my-session');
Waha::sessions()->stop('my-session');
Waha::sessions()->logout('my-session');

// Get session details
$session = Waha::sessions()->get('my-session');

// Get QR code for authentication
$qr = Waha::sessions()->qr('my-session');

// Request authentication code
Waha::sessions()->requestCode('my-session', [
    'phoneNumber' => '1111111111111',
]);

// Update a session
Waha::sessions()->update('my-session', ['webhooks' => [...]]);

// Delete a session
Waha::sessions()->delete('my-session');
```

---

### Chat Management

```php
// Get chats overview
$chats = Waha::chats()->overview();

// Get messages from a specific chat
$messages = Waha::chats()->messages('1111111111111@c.us', limit: 50);

// Delete a chat
Waha::chats()->deleteChat('1111111111111@c.us');

// Use a specific session
$chats = Waha::chats()->overview('my-session');
```

---

### Group Management

```php
// List all groups
$groups = Waha::groups()->list();

// Create a group
Waha::groups()->create('Project Team', [
    '1111111111111@c.us',
    '1111111111112@c.us',
]);

// Get group details
$group = Waha::groups()->get('120363001234567890@g.us');

// Add participants
Waha::groups()->addParticipants('120363001234567890@g.us', [
    '1111111111113@c.us',
]);

// Remove participants
Waha::groups()->removeParticipants('120363001234567890@g.us', [
    '1111111111113@c.us',
]);
```

---

### Contact Management

```php
// List all contacts
$contacts = Waha::contacts()->list();

// Get a specific contact
$contact = Waha::contacts()->get('1111111111111@c.us');

// Check if a phone number exists on WhatsApp
$result = Waha::contacts()->checkExists('1111111111111');
// Returns: ['numberExists' => true, 'chatId' => '1111111111111@c.us']

// Get profile picture URL
$picture = Waha::contacts()->profilePicture('1111111111111@c.us');
```

---

### Using the Client Directly

You can also inject `WahaClient` directly via dependency injection:

```php
use LaravelWaha\WahaMessages\WahaClient;

class NotificationService
{
    public function __construct(
        private WahaClient $waha,
    ) {}

    public function sendAlert(string $phone, string $message): void
    {
        $this->waha->messages()->sendText("{$phone}@c.us", $message);
    }
}
```

## Error Handling

The package throws specific exceptions for API errors:

```php
use LaravelWaha\WahaMessages\Exceptions\WahaException;
use LaravelWaha\WahaMessages\Exceptions\WahaAuthenticationException;
use LaravelWaha\WahaMessages\Exceptions\WahaNotFoundException;

try {
    Waha::sessions()->get('non-existent');
} catch (WahaNotFoundException $e) {
    // Session not found (404)
    $e->getStatusCode();    // 404
    $e->getResponseBody();  // ['message' => '...']
} catch (WahaAuthenticationException $e) {
    // Invalid API key (401)
} catch (WahaException $e) {
    // Any other API error
}
```

## Chat ID Format

WAHA uses the following chat ID formats:

| Type | Format | Example |
|---|---|---|
| Individual | `{phone}@c.us` | `1111111111111@c.us` |
| Group | `{id}@g.us` | `120363001234567890@g.us` |

> **Note:** Phone numbers should include the country code without the `+` prefix.

## License

MIT
