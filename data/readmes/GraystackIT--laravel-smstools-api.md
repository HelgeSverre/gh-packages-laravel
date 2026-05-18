# graystackit/laravel-smstools-api

A Laravel package for the [Smstools API](https://www.smstools.at/), built on [Saloon 4](https://docs.saloon.dev/).

Send SMS messages to single or multiple recipients, schedule delivery, use test mode, and route through subaccounts — all with a clean, Laravel-native interface.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-smstools-api
```

Laravel auto-discovers the service provider and registers the `Smstools` facade. Then publish the config file:

```bash
php artisan vendor:publish --tag=smstools-config
```

## Configuration

Add the following to your `.env` file:

```env
SMSTOOLS_CLIENT_ID=your-client-id
SMSTOOLS_CLIENT_SECRET=your-client-secret

# Optional — defaults shown
SMSTOOLS_BASE_URL=https://api.smsgatewayapi.com/v1
SMSTOOLS_TIMEOUT=30
```

Obtain your credentials from the Smstools dashboard under **Advanced → API authentication**.

If `SMSTOOLS_CLIENT_ID` or `SMSTOOLS_CLIENT_SECRET` is not set, a `RuntimeException` is thrown when the client is first resolved from the container.

## Usage

Inject `SmstoolsClient` via the constructor, resolve it from the container, or use the `Smstools` facade.

### Send to a single recipient

```php
use GraystackIT\SmstoolsApi\Facades\Smstools;

$result = Smstools::messages()->send(
    to: '436501234567',
    message: 'Hello from Laravel!',
    sender: 'MyApp',
);

echo $result['messageid']; // h2md1ewkyzjkuyn9ak7pryw1evtyw3x
```

### Send to multiple recipients

```php
$result = Smstools::messages()->send(
    to: ['436501234567', '436501234568'],
    message: 'Hello everyone!',
    sender: 'MyApp',
);

echo count($result['messageids']); // 2
```

### Schedule a message

```php
$result = Smstools::messages()->send(
    to: '436501234567',
    message: 'Your appointment is tomorrow.',
    sender: 'MyApp',
    date: '2026-06-01 09:00',
);
```

### All optional parameters

```php
$result = Smstools::messages()->send(
    to: '436501234567',
    message: 'Test message',
    sender: 'MyApp',
    date: '2026-06-01 10:00',   // Scheduled send time (yyyy-MM-dd HH:mm)
    reference: 'order-999',      // Custom reference string (max 255 chars)
    test: true,                  // Validate without sending — no credits used
    subid: 42,                   // Send from a specific subaccount
);
```

### Using dependency injection

```php
use GraystackIT\SmstoolsApi\SmstoolsClient;

class SmsController extends Controller
{
    public function __construct(private SmstoolsClient $sms) {}

    public function notify(): void
    {
        $this->sms->messages()->send(
            to: '436501234567',
            message: 'Your order has shipped.',
            sender: 'MyShop',
        );
    }
}
```

## Error handling

All API errors throw `GraystackIT\SmstoolsApi\Exceptions\SmstoolsException` (extends `RuntimeException`).

```php
use GraystackIT\SmstoolsApi\Exceptions\SmstoolsException;

try {
    $result = Smstools::messages()->send(
        to: '436501234567',
        message: 'Hello',
        sender: 'MyApp',
    );
} catch (SmstoolsException $e) {
    echo $e->getMessage();       // Human-readable error from the API error code map
    echo $e->getStatusCode();    // HTTP status code (e.g. 400, 401)
    echo $e->getApiErrorCode();  // Smstools API error code (e.g. 104, 108) or null
}
```

### Common API error codes

| Code | Meaning |
|---|---|
| 104 | Invalid credentials |
| 108 | Not enough credits |
| 109 | Sender name cannot be empty |
| 111 | Invalid sender name (max 11 chars or 14 digits) |
| 118 | Message exceeds 612 characters |
| 121 | Scheduled date is invalid or in the past |
| 131 | Number is on the opt-out list |
| 200 | IP address not allowed |

---

## Contact Management

Manage contacts via `Smstools::contacts()` (or inject `SmstoolsClient`).

```php
use GraystackIT\SmstoolsApi\Facades\Smstools;

// Add a contact
$result = Smstools::contacts()->add(
    firstname: 'Jane',
    number:    '436501234567',
    lastname:  'Doe',     // optional
    groupid:   5,         // optional
);
echo $result['id']; // new contact ID

// Update a contact (only pass fields you want to change)
Smstools::contacts()->update(
    id:        42,
    firstname: 'Janet',
    number:    '436509876543',
);

// Search contacts
$result = Smstools::contacts()->search(
    query:   'Jane',
    groupid: 5,       // optional filter
    limit:   100,
    page:    1,
);

// List all contacts
$result = Smstools::contacts()->list(
    groupid: 5,   // optional filter
    limit:   100,
    page:    1,
);

// Remove a contact
Smstools::contacts()->remove(42);
```

---

## Account Operations

```php
// Account details
$account = Smstools::account()->details();

// Credit balance
$balance = Smstools::account()->balance();
echo $balance['balance'];   // '42.50'
echo $balance['currency'];  // 'EUR'

// Transaction history
$history = Smstools::account()->history(
    from:  '2024-01-01',   // optional
    to:    '2024-01-31',   // optional
    limit: 100,
    page:  1,
);

// Inbox — all messages across all inboxes
$inbox = Smstools::account()->inbox(
    limit: 100,
    page:  1,
    type:  'sms',   // optional: "sms", "whatsapp", or "call"
);

// Inbox — messages from a specific inbox number
$inbox = Smstools::account()->inboxByNumber(
    inboxNr: 1,
    limit:   100,
    page:    1,
    type:    'sms',   // optional: "sms", "whatsapp", or "call"
);

// Statistics
$stats = Smstools::account()->statistics(
    year:  '2024',   // optional, YYYY format
    month: '01',     // optional, MM format
);
echo $stats['sent'];
echo $stats['delivered'];
```

---

## Message Templates

```php
// Add a template ({firstname} and {lastname} are replaced on send)
$result = Smstools::templates()->add(
    name:     'Welcome',
    template: 'Hi {firstname}, welcome to MyApp!',
);
echo $result['id'];

// Update a template (only pass fields to change)
Smstools::templates()->update(
    id:       10,
    template: 'Hi {firstname}! Welcome.',
);

// List all templates
$result = Smstools::templates()->list();

// Get a specific template
$template = Smstools::templates()->get(10);
echo $template['name'];
echo $template['template'];

// Remove a template
Smstools::templates()->remove(10);
```

---

## Birthday Messages

Schedule an SMS to be sent automatically on a contact's birthday.

```php
// Add a birthday message
$result = Smstools::birthdayMessages()->add(
    firstname: 'Jane',
    number:    '436501234567',
    birthday:  '06-15',                    // MM-dd format
    message:   'Happy Birthday {firstname}! 🎂',
    sender:    'MyApp',
    lastname:  'Doe',   // optional
    groupid:   3,       // optional
);
echo $result['id'];

// List all birthday messages
$result = Smstools::birthdayMessages()->list();

// Get a specific birthday message
$entry = Smstools::birthdayMessages()->get(7);
echo $entry['firstname'];
echo $entry['birthday'];

// Update a birthday message (only pass fields to change)
Smstools::birthdayMessages()->update(
    id:      7,
    message: 'Wishing you a wonderful birthday!',
    sender:  'NewSender',
);

// Remove a birthday message
Smstools::birthdayMessages()->remove(7);
```

---

## Opt-out Management

```php
// List all opt-out numbers
$result = Smstools::optouts()->list(limit: 100, page: 1);

// Add a number to the opt-out list
Smstools::optouts()->add('436501234567');

// Remove a number from the opt-out list
Smstools::optouts()->remove('436501234567');
```

---

## Webhooks

Register and manage webhook endpoints that Smstools will call on SMS events.

```php
use GraystackIT\SmstoolsApi\Facades\Smstools;

use GraystackIT\SmstoolsApi\Enums\WebhookMethod;

// List all registered webhooks
$result = Smstools::webhooks()->list();
foreach ($result['webhooks'] as $hook) {
    echo $hook['id'] . ': ' . implode(', ', $hook['webhook_types']) . ' → ' . $hook['webhook_endpoint'];
}

// Create a webhook
$result = Smstools::webhooks()->create(
    webhookEndpoint: 'https://yourapp.com/sms/webhook',
    webhookMethod:   WebhookMethod::Post,
    webhookTypes:    ['sms_inbound', 'sms_delivered'],
);
echo $result['secret']; // shared secret for signature verification

// Delete a webhook by its secret token (returned when the webhook was created)
Smstools::webhooks()->delete('ccc14fb1-bf8c-4ebf-882c-caccd4c95a2c');
```

---

## Testing

Tests use Saloon's `MockClient` — no real API calls are made.

```php
use GraystackIT\SmstoolsApi\Connectors\SmstoolsConnector;
use GraystackIT\SmstoolsApi\Requests\SendMessageRequest;
use GraystackIT\SmstoolsApi\SmstoolsClient;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

$mockClient = new MockClient([
    SendMessageRequest::class => MockResponse::make(
        ['messageid' => 'abc123'],
        200
    ),
]);

$connector = new SmstoolsConnector('client-id', 'client-secret');
$connector->withMockClient($mockClient);

$result = (new SmstoolsClient($connector))->messages()->send(
    to: '436501234567',
    message: 'Hello',
    sender: 'MyApp',
);
```

Run the package test suite:

```bash
vendor/bin/pest
```

## License

MIT.
