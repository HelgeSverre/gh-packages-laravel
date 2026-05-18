# graystackit/laravel-helpspace-api

A Laravel package for the [HelpSpace API](https://documentation.helpspace.com/), built on [Saloon 4](https://docs.saloon.dev/).

Supports **Tickets**, **Messages**, **Reports**, and **Webhooks**.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-helpspace-api
```

The service provider is auto-discovered by Laravel.

Publish the config file:

```bash
php artisan vendor:publish --tag=helpspace-config
```

Add your credentials to `.env`:

```env
HELPSPACE_API_KEY=your-bearer-token
HELPSPACE_CLIENT_ID=your-client-id
HELPSPACE_BASE_URL=https://api.helpspace.com
```

---

## Configuration

After publishing, the config file lives at `config/helpspace.php`:

```php
return [
    'api_key'  => env('HELPSPACE_API_KEY'),
    'client_id' => env('HELPSPACE_CLIENT_ID'),
    'base_url' => env('HELPSPACE_BASE_URL', 'https://api.helpspace.com'),

    'defaults' => [
        'per_page' => 20,
    ],
];
```

---

## Usage

Resolve `HelpSpaceClient` from the container or inject it via the constructor:

```php
use GraystackIT\HelpSpace\HelpSpaceClient;

class SupportController extends Controller
{
    public function __construct(private HelpSpaceClient $helpspace) {}
}
```

---

## Tickets

**API reference:** https://documentation.helpspace.com/api-tickets

### List tickets

```php
$result = $this->helpspace->listTickets(
    perPage:  25,
    statuses: ['open', 'escalated'],
    contacts: ['customer@example.com'],
    tags:     ['billing'],
    createdBetween: '2024-01-01/2024-01-31',
);

foreach ($result['data'] as $ticket) {
    echo $ticket->id;           // int
    echo $ticket->subject;      // string
    echo $ticket->status;       // string (open|closed|waiting|escalated|spam|unassigned)
    echo $ticket->contactEmail; // string|null
    echo $ticket->contactName;  // string|null
    echo $ticket->assigneeName; // string|null
    echo $ticket->teamName;     // string|null
    print_r($ticket->tags);     // array
    echo $ticket->createdAt;    // ISO 8601 string
}

// Pagination metadata
$result['meta'];   // ['current_page' => 1, 'total' => 120, ...]
$result['links'];  // ['next' => '...', 'prev' => null, ...]
```

#### `listTickets()` parameters

| Parameter            | Type       | Default | Description                                          |
|---|---|---|---|
| `$perPage`           | `int`      | `20` (max 50) | Results per page                              |
| `$statuses`          | `string[]` | `[]`    | Filter by status values                              |
| `$contacts`          | `string[]` | `[]`    | Filter by contact email                              |
| `$assignees`         | `string[]` | `[]`    | Filter by assignee name or ID                        |
| `$tags`              | `string[]` | `[]`    | Filter by tag names                                  |
| `$subjects`          | `string[]` | `[]`    | Filter by subject text                               |
| `$bodies`            | `string[]` | `[]`    | Filter by body text                                  |
| `$subjectOrBody`     | `string[]` | `[]`    | Filter by subject or body                            |
| `$organizations`     | `string[]` | `[]`    | Filter by organization                               |
| `$teams`             | `string[]` | `[]`    | Filter by team                                       |
| `$createdBetween`    | `string\|null` | `null` | Date range `YYYY-MM-DD/YYYY-MM-DD`              |
| `$lastContactBetween`| `string\|null` | `null` | Date range `YYYY-MM-DD/YYYY-MM-DD`              |

**`TicketStatus` enum values:**

| Case          | API value     |
|---|---|
| `Unassigned`  | `unassigned`  |
| `Open`        | `open`        |
| `Escalated`   | `escalated`   |
| `Spam`        | `spam`        |
| `Waiting`     | `waiting`     |
| `Closed`      | `closed`      |

### Get a ticket

```php
$ticket = $this->helpspace->getTicket(101);
```

### Create a ticket

```php
$ticket = $this->helpspace->createTicket([
    'subject'      => 'Cannot access my account',
    'channel'      => ['id' => 'channel-uuid'],
    'from_contact' => ['email' => 'user@example.com', 'name' => 'John Doe'],
    'message'      => ['body' => '<p>I cannot log in since yesterday.</p>'],
    'tags'         => ['access', 'urgent'],
    // Optional:
    'skip_autoreply'      => false,
    'skip_notifications'  => false,
]);
```

### Update a ticket

```php
$ticket = $this->helpspace->updateTicket(101, [
    'status'   => 'closed',
    'assignee' => ['id' => 'agent-uuid'],
]);
```

### Delete a ticket

Soft-deleted tickets are permanently removed after 30 days.

```php
$this->helpspace->deleteTicket(101); // returns true
```

---

## Messages

**API reference:** https://documentation.helpspace.com/api-message

### List messages

Default types returned: `external`, `widget`, `forward`.

```php
// Default message types
$messages = $this->helpspace->listMessages(101);

// Include internal notes as well
$messages = $this->helpspace->listMessages(101, additionalTypes: ['internal']);

// Only return internal notes
$messages = $this->helpspace->listMessages(101, types: ['internal']);

foreach ($messages as $message) {
    echo $message->id;               // int
    echo $message->type;             // external|internal|forward|widget|...
    echo $message->fromContactEmail; // string
    echo $message->fromContactName;  // string
    echo $message->body;             // HTML string
    echo $message->createdAt;        // ISO 8601 string
    print_r($message->attachments);  // array
    print_r($message->to);           // array of recipient addresses
}
```

**`MessageType` enum values:**

| Case        | API value    | Default returned |
|---|---|---|
| `External`  | `external`   | Yes |
| `Widget`    | `widget`     | Yes |
| `Forward`   | `forward`    | Yes |
| `Internal`  | `internal`   | No  |
| `Error`     | `error`      | No  |
| `Bounce`    | `bounce`     | No  |
| `Event`     | `event`      | No  |
| `AiSummary` | `ai-summary` | No  |

### Get a message

```php
$message = $this->helpspace->getMessage(ticketId: 101, messageId: 77);
```

### Create a message

```php
$message = $this->helpspace->createMessage(101, [
    'from_contact' => ['email' => 'agent@example.com', 'name' => 'Support Agent'],
    'subject'      => 'Re: Cannot access my account',
    'body'         => '<p>We have reset your password. Please check your email.</p>',
    // Optional:
    'type'                  => 'external',      // default
    'to'                    => ['user@example.com'],
    'cc'                    => [],
    'bcc'                   => [],
    'skip_notifications'    => false,
    'send_mail_to_recipients' => true,
    // Attachments as base64 (max 5 MB combined)
    'attachments' => [
        ['file_name' => 'guide.pdf', 'mime_type' => 'application/pdf', 'data' => base64_encode($pdfBytes)],
    ],
]);
```

---

## Reports

**API reference:** https://documentation.helpspace.com/api-reports

### Channels report

```php
$report = $this->helpspace->getChannelsReport('2024-01-01', '2024-01-31');

print_r($report->dailyCounts);  // per-day opened/closed ticket counts
print_r($report->metrics);      // new, closed, open, waiting, escalated counts
print_r($report->channels);     // ticket volume by channel
print_r($report->tags);         // ticket volume by tag
print_r($report->topCustomers); // customers with most tickets
print_r($report->raw);          // full raw API response
```

### Performance report

```php
$report = $this->helpspace->getPerformanceReport('2024-01-01', '2024-01-31');

print_r($report->dailyCounts);  // per-day opened/closed counts
print_r($report->metrics);      // avg resolution time breakdown (days/hours/minutes)
print_r($report->topAgents);    // agents with most resolved tickets
print_r($report->raw);          // full raw API response
```

Both methods accept date strings in `YYYY-MM-DD` format. An `InvalidArgumentException` is thrown if either date is empty.

---

## Webhooks

**API reference:** https://documentation.helpspace.com/article/340/webhook

### Get webhook configuration

```php
$config = $this->helpspace->getWebhook();

echo $config->enabled;     // bool
echo $config->url;         // destination URL
echo $config->secret;      // validation hash (string|null)
print_r($config->headers); // custom headers [['key' => '...', 'value' => '...']]
print_r($config->trigger); // enabled event types per resource
echo $config->failedCount; // consecutive failure count (auto-disables on too many)
```

### Update webhook configuration

```php
$config = $this->helpspace->updateWebhook([
    'enabled' => true,
    'url'     => 'https://myapp.example.com/webhooks/helpspace',
    'secret'  => 'my-validation-secret',
    'headers' => [
        ['key' => 'X-App-Key', 'value' => 'my-app-key'],
    ],
    'trigger' => [
        'ticket'   => ['created' => true, 'updated' => true, 'deleted' => false],
        'customer' => ['created' => false],
        'tag'      => ['created' => false],
    ],
]);
```

### Get webhook error logs

```php
$logs = $this->helpspace->getWebhookLogs();

foreach ($logs as $log) {
    echo $log['status'];     // HTTP status code returned by your endpoint
    echo $log['response'];   // response body
    echo $log['created_at']; // when the failure occurred
}
```

---

## Exceptions

| Exception                  | When thrown                                                               |
|---|---|
| `HelpSpaceApiException`    | API returned 4xx/5xx, network failure, or non-JSON response               |
| `InvalidArgumentException` | Empty subject on `createTicket()`, empty body on `createMessage()`, or empty dates on report methods |

---

## Testing

This package uses Saloon's `MockClient` so you can test without real HTTP calls:

```php
use GraystackIT\HelpSpace\HelpSpaceClient;
use GraystackIT\HelpSpace\Connectors\HelpSpaceConnector;
use GraystackIT\HelpSpace\Requests\Tickets\ListTicketsRequest;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

$mockClient = new MockClient([
    ListTicketsRequest::class => MockResponse::make([
        'data'  => [
            [
                'id'           => 1,
                'subject'      => 'Test ticket',
                'status'       => 'open',
                'from_contact' => ['email' => 'user@example.com', 'name' => 'User'],
                'created_at'   => '2024-01-01T00:00:00Z',
            ],
        ],
        'meta'  => [],
        'links' => [],
    ], 200),
]);

$connector = app(HelpSpaceConnector::class);
$connector->withMockClient($mockClient);

$result = (new HelpSpaceClient($connector))->listTickets();
```

Run the package test suite:

```bash
composer install
vendor/bin/pest
```

---

## API Endpoints Reference

| Method                    | HTTP   | HelpSpace API Endpoint                          |
|---|---|---|
| `listTickets()`           | GET    | `/api/v1/tickets`                               |
| `getTicket()`             | GET    | `/api/v1/tickets/{id}`                          |
| `createTicket()`          | POST   | `/api/v1/tickets`                               |
| `updateTicket()`          | PATCH  | `/api/v1/tickets/{id}`                          |
| `deleteTicket()`          | DELETE | `/api/v1/tickets/{id}`                          |
| `listMessages()`          | GET    | `/api/v1/tickets/{id}/messages`                 |
| `getMessage()`            | GET    | `/api/v1/tickets/{id}/messages/{messageId}`     |
| `createMessage()`         | POST   | `/api/v1/tickets/{id}/messages`                 |
| `getChannelsReport()`     | POST   | `/api/v1/reports/channels`                      |
| `getPerformanceReport()`  | POST   | `/api/v1/reports/performance`                   |
| `getWebhook()`            | GET    | `/api/v1/webhook`                               |
| `updateWebhook()`         | POST   | `/api/v1/webhook`                               |
| `getWebhookLogs()`        | GET    | `/api/v1/webhook/logs`                          |

---

## License

MIT
