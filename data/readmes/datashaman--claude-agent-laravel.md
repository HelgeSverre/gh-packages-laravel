# Claude Agent Laravel

Laravel companion package for [datashaman/claude-agent-sdk](https://github.com/datashaman/claude-agent-sdk).

## Requirements

- PHP 8.2+
- Laravel 12+
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installed on the server

## Installation

```bash
composer require datashaman/claude-agent-laravel
```

The service provider and facade are auto-discovered. To publish the config:

```bash
php artisan vendor:publish --tag=claude-config
```

## Configuration

`config/claude.php`:

```php
return [
    'model' => env('CLAUDE_MODEL', 'sonnet'),
    'permission_mode' => env('CLAUDE_PERMISSION_MODE', 'default'),
    'system_prompt' => env('CLAUDE_SYSTEM_PROMPT', ''),
    'max_turns' => env('CLAUDE_MAX_TURNS', 0),
    'allowed_tools' => [],
    'queue' => env('CLAUDE_QUEUE'),
    'streaming' => [
        'enabled' => true,
        'route_prefix' => 'claude',
        'middleware' => ['web'],
    ],
];
```

## Usage

### Facade

```php
use DataShaman\Claude\AgentLaravel\Facades\Claude;

// Stream messages from a query
foreach (Claude::query('Explain dependency injection') as $message) {
    echo $message->getTextContent();
}

// Get a client with session persistence
$client = Claude::client(['model' => 'opus']);
foreach ($client->send('Hello') as $message) {
    echo $message->getTextContent();
}

// List sessions
$sessions = Claude::listSessions();

// Get session history
$messages = Claude::getSessionMessages('session-id');
```

### Artisan Commands

```bash
# Send a query
php artisan claude:query "Explain SOLID principles"

# With options
php artisan claude:query "Continue" --model=opus --session=abc123

# List sessions
php artisan claude:sessions:list

# Show session history
php artisan claude:sessions:show abc123
```

### Queue Integration

```php
use DataShaman\Claude\AgentLaravel\Jobs\ClaudeQueryJob;
use DataShaman\Claude\AgentLaravel\Events\ClaudeQueryCompleted;
use DataShaman\Claude\AgentLaravel\Events\ClaudeQueryFailed;

// Dispatch a query as a background job
ClaudeQueryJob::dispatch('Summarize this document');

// With overrides
ClaudeQueryJob::dispatch('Hello', ['model' => 'opus']);

// Listen for results in a listener or EventServiceProvider
// ClaudeQueryCompleted: $event->prompt, $event->response, $event->sessionId, $event->timestamp
// ClaudeQueryFailed: $event->prompt, $event->error, $event->exception
```

**Queue timeout**: Agent queries can take significant time. Configure your queue worker timeout accordingly:

```bash
php artisan queue:work --timeout=300
```

Consider using a dedicated queue for Claude jobs:

```env
CLAUDE_QUEUE=claude
```

### SSE Streaming

The package registers a `POST /{prefix}/stream` endpoint for Server-Sent Events streaming.

```javascript
const response = await fetch('/claude/stream', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
    },
    body: JSON.stringify({ prompt: 'Hello Claude' }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    // Parse SSE events from text
}
```

**Proxy buffering**: If using nginx, disable proxy buffering for the stream endpoint:

```nginx
location /claude/stream {
    proxy_buffering off;
    proxy_cache off;
}
```

### Livewire Component

Include the chat component in any Blade template (requires `livewire/livewire`):

```blade
<livewire:claude-chat />

<!-- With props -->
<livewire:claude-chat model="opus" system-prompt="You are helpful." session-id="abc123" />
```

To customize the view:

```bash
php artisan vendor:publish --tag=claude-views
```

## Testing

```bash
composer test
```

## License

MIT
