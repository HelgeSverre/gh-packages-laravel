# Laravel AgentMail

A Laravel package for interacting with the [AgentMail](https://agentmail.to) API. AgentMail provides programmatic email inboxes designed for AI agents.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

Install the package via Composer:

```bash
composer require polkachu/laravel-agentmail
```

The package auto-discovers its service provider via Laravel's package discovery.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=agentmail
```

This creates `config/agentmail.php`. Add your API key to `.env`:

```env
AGENTMAIL_API_KEY=your_api_key_here
```

By default the package points to `https://api.agentmail.to`. You can override this in `.env` if needed:

```env
AGENTMAIL_BASE_URL=https://api.agentmail.to
```

## Usage

All operations are accessed through the `Agentmail` facade.

### Inboxes

#### List inboxes

Returns an `InboxCollection` containing a Laravel `Collection` of `Inbox` objects.

```php
use Polkachu\LaravelAgentmail\Facades\Agentmail;

$collection = Agentmail::inboxes()->list();

foreach ($collection->inboxes as $inbox) {
    echo $inbox->inboxId;
}
```

Paginate with `limit` and `pageToken`:

```php
$collection = Agentmail::inboxes()->list(limit: 20);

// Fetch the next page
if ($collection->nextPageToken) {
    $nextPage = Agentmail::inboxes()->list(limit: 20, pageToken: $collection->nextPageToken);
}
```

#### Create an inbox

All parameters are optional. AgentMail will randomly generate a username if one is not provided.

```php
$inbox = Agentmail::inboxes()->create(
    username: 'support',
    domain: 'agentmail.to',
    displayName: 'Support Agent',
    clientId: 'my-app-client-id',
);

echo $inbox->inboxId;      // e.g. "inbox_abc123"
echo $inbox->displayName;  // e.g. "Support Agent <support@agentmail.to>"
```

#### Get an inbox

```php
$inbox = Agentmail::inboxes()->get('inbox_abc123');

echo $inbox->inboxId;
echo $inbox->podId;
echo $inbox->createdAt->toDateTimeString();
```

#### Update an inbox

Only the display name can be updated.

```php
$inbox = Agentmail::inboxes()->update('inbox_abc123', 'New Name <support@agentmail.to>');
```

#### Delete an inbox

```php
Agentmail::inboxes()->delete('inbox_abc123');
```

### The `Inbox` DTO

All inbox operations return an `Inbox` object with the following properties:

| Property       | Type      | Description              |
| -------------- | --------- | ------------------------ |
| `$inboxId`     | `string`  | Unique inbox identifier  |
| `$podId`       | `string`  | Pod the inbox belongs to |
| `$displayName` | `?string` | Display name string      |
| `$clientId`    | `?string` | Client identifier        |
| `$createdAt`   | `Carbon`  | Creation timestamp       |
| `$updatedAt`   | `Carbon`  | Last updated timestamp   |

### The `InboxCollection` DTO

`Agentmail::inboxes()->list()` returns an `InboxCollection` with the following properties:

| Property         | Type                | Description                                                 |
| ---------------- | ------------------- | ----------------------------------------------------------- |
| `$inboxes`       | `Collection<Inbox>` | List of inbox objects                                       |
| `$count`         | `int`               | Number of inboxes returned                                  |
| `$limit`         | `?int`              | Page size limit used                                        |
| `$nextPageToken` | `?string`           | Token to fetch the next page, or `null` if on the last page |

## Error Handling

Any non-2xx response throws an `AgentmailException`. It exposes:

- `$errorName` — the API's error name (e.g. `"NotFoundError"`, `"ValidationError"`)
- `getMessage()` — the human-readable error message from the API
- `getCode()` — the HTTP status code

```php
use Polkachu\LaravelAgentmail\Exceptions\AgentmailException;

try {
    $inbox = Agentmail::inboxes()->get('inbox_does_not_exist');
} catch (AgentmailException $e) {
    echo $e->errorName;    // "NotFoundError"
    echo $e->getMessage(); // "Inbox not found."
    echo $e->getCode();    // 404
}
```

## Testing

The package is tested with Pest PHP. To run the test suite:

```bash
composer test
```

In your own application tests, use Laravel's `Http::fake()` to mock AgentMail responses without making real API calls:

```php
use Illuminate\Support\Facades\Http;
use Polkachu\LaravelAgentmail\Facades\Agentmail;

Http::fake([
    '*/v0/inboxes*' => Http::response([
        'count' => 1,
        'inboxes' => [[
            'inbox_id' => 'inbox_abc',
            'pod_id'   => 'pod_123',
            'created_at' => '2024-01-01T00:00:00Z',
            'updated_at' => '2024-01-02T00:00:00Z',
        ]],
    ]),
]);

$collection = Agentmail::inboxes()->list();

expect($collection->count)->toBe(1);
```

## License

[MIT](https://opensource.org/license/MIT)
