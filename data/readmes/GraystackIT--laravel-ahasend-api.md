# laravel-ahasend-api

A production-ready Laravel package for the [Ahasend](https://ahasend.com) transactional email API, powered by **Saloon v4**.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13
- Saloon 4.x
- Symfony Mailer 6.4 / 7.x (bundled with Laravel)

## Installation

```bash
composer require graystackit/laravel-ahasend-api
```

The service provider is auto-discovered via Laravel's package discovery.

### Publish config

```bash
php artisan vendor:publish --tag=ahasend-config
```

### Publish & run migrations (optional — only needed for database storage driver)

```bash
php artisan vendor:publish --tag=ahasend-migrations
php artisan migrate
```

## Configuration

Set the following variables in your `.env` file:

```dotenv
AHASEND_API_KEY=your-api-key
AHASEND_ACCOUNT_ID=your-account-id
AHASEND_FROM_ADDRESS=hello@yourdomain.com
AHASEND_FROM_NAME="Your App"

# Optional
AHASEND_BASE_URL=https://api.ahasend.com/v2
AHASEND_WEBHOOK_SECRET=your-webhook-secret
AHASEND_STORE_LOGS=true
AHASEND_STORAGE_DRIVER=database   # "log" or "database"
AHASEND_RETRY_TIMES=3
AHASEND_RETRY_DELAY_MS=500
```

> **Note:** `AHASEND_ACCOUNT_ID` is required. You can find your account ID in the Ahasend dashboard.

## Usage

### Dependency injection

```php
use GraystackIT\Ahasend\AhasendService;

class OrderController
{
    public function __construct(private readonly AhasendService $mailer) {}

    public function confirm(): void
    {
        $this->mailer->sendHtml(
            to:          [['email' => 'customer@example.com', 'name' => 'Jane']],
            subject:     'Order confirmed',
            htmlContent: '<p>Your order is confirmed!</p>',
            textContent: 'Your order is confirmed!',
        );
    }
}
```

### Plain-text email

```php
$mailer->sendText(
    to:          [['email' => 'user@example.com']],
    subject:     'Hello',
    textContent: 'Hello from Ahasend!',
);
```

### HTML email

```php
$mailer->sendHtml(
    to:          [['email' => 'user@example.com']],
    subject:     'Hello',
    htmlContent: '<h1>Hello!</h1>',
    textContent: 'Hello!',   // optional plain-text fallback
);
```

### Email with attachments

```php
$mailer->sendWithAttachments(
    to:          [['email' => 'user@example.com']],
    subject:     'Your invoice',
    attachments: [
        ['path' => storage_path('invoices/inv-001.pdf')],           // file path
        ['name' => 'data.csv', 'content' => $csvBase64, 'mime_type' => 'text/csv'], // raw
    ],
    htmlContent: '<p>Please find your invoice attached.</p>',
);
```

### CC / BCC

Pass `cc` and `bcc` arrays to any convenience method. When CC or BCC recipients are present the package automatically routes the request to the Ahasend conversational endpoint (`POST /messages/conversation`), which is the only endpoint that supports those fields:

```php
$mailer->sendHtml(
    to:          [['email' => 'a@example.com']],
    subject:     'Test',
    htmlContent: '<p>Hi</p>',
    cc:          [['email' => 'b@example.com']],
    bcc:         [['email' => 'c@example.com']],
);
```

### Low-level `EmailMessage`

```php
use GraystackIT\Ahasend\Data\EmailMessage;

$message = new EmailMessage(
    fromEmail:   'from@example.com',
    fromName:    'Sender',
    to:          [['email' => 'to@example.com']],
    subject:     'Custom',
    htmlContent: '<p>Hello</p>',
);

$ahasendMessageId = $mailer->send($message);
```

## Webhook handling

Register your endpoint URL in the Ahasend dashboard:

```
https://yourdomain.com/ahasend/webhook
```

The path is configurable via `AHASEND_WEBHOOK_PATH`. Incoming events fire Laravel events you can listen to:

| Ahasend event | Laravel event |
|---|---|
| `message.delivered` | `MailDelivered` |
| `message.opened` | `MailOpened` |
| `message.failed` | `MailFailed` |
| `message.bounced` | `MailBounced` |

### Listening to events

```php
// In EventServiceProvider or a listener class:
Event::listen(MailDelivered::class, function (MailDelivered $event): void {
    // $event->messageId, $event->recipient, $event->payload
});
```

## Laravel Mail driver

The package registers a native Laravel mail transport driver so you can send any standard Laravel `Mailable` through AhaSend without touching your existing Mailable code.

### 1. Configure the mailer

Add an `ahasend` entry to the `mailers` array in `config/mail.php`:

```php
// config/mail.php
'mailers' => [
    // ... other mailers ...

    'ahasend' => [
        'transport' => 'ahasend',
    ],
],
```

The transport reads API credentials and sender defaults from the `ahasend` config (i.e. the same `AHASEND_*` variables you already set).

To make AhaSend the **default** mailer, update your `.env`:

```dotenv
MAIL_MAILER=ahasend
```

### 2. Send a Mailable

```php
use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

// Uses the default mailer if MAIL_MAILER=ahasend
Mail::to('customer@example.com')->send(new OrderShipped($order));

// Or target the driver explicitly
Mail::mailer('ahasend')
    ->to('customer@example.com')
    ->cc('manager@example.com')
    ->send(new OrderShipped($order));
```

### 3. Example Mailable

```php
<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class OrderShipped extends Mailable
{
    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your order has shipped');
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.order-shipped',   // resources/views/emails/order-shipped.blade.php
            text: 'emails.order-shipped-text',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath(storage_path("invoices/{$this->order->id}.pdf"))
                ->as('invoice.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
```

### 4. Required `.env` variables

```dotenv
AHASEND_API_KEY=your-api-key
AHASEND_ACCOUNT_ID=your-account-id
AHASEND_FROM_ADDRESS=hello@yourdomain.com
AHASEND_FROM_NAME="Your App"

# Make AhaSend the default mailer
MAIL_MAILER=ahasend
```

### Supported features

| Feature | Supported |
|---|---|
| HTML body | Yes |
| Plain-text body | Yes |
| Multiple `To` recipients | Yes |
| CC | Yes |
| BCC | Yes |
| File attachments | Yes (auto base64 encoded) |
| From address / name | Yes (from Mailable or config fallback) |

### Transport internals

The driver is implemented as `GraystackIT\Ahasend\Mail\AhaSendTransport`, which extends Symfony's `AbstractTransport`. It converts the Symfony `Email` object into the `EmailMessage` DTO used by `AhasendService::send()`, preserving all recipients, headers, and attachments. Errors thrown by `AhasendService` are re-wrapped as Symfony `TransportException` so Laravel's mail system handles them consistently.

---

## Mailable tracking

Use the `TracksAhasendMail` trait in any Mailable to attach a UUID `X-Ahasend-Message-Id` header and (optionally) store the outgoing record in the database:

```php
use GraystackIT\Ahasend\Traits\TracksAhasendMail;
use Illuminate\Mail\Mailable;

class OrderShipped extends Mailable
{
    use TracksAhasendMail;

    public function build(): self
    {
        $this->initAhasendTracking(recipient: $this->order->email);

        return $this->subject('Your order has shipped')
                    ->view('emails.order-shipped');
    }
}
```

---

## Messages

Retrieve and manage sent or scheduled messages via `MessageService`.

```php
use GraystackIT\Ahasend\Services\MessageService;
use GraystackIT\Ahasend\Enums\MessageStatus;

class MyController
{
    public function __construct(private readonly MessageService $messages) {}
}
```

### Get a single message

```php
$message = $messages->get('msg-abc123');

echo $message->id;          // 'msg-abc123'
echo $message->subject;     // 'Hello World'
echo $message->status->value; // 'delivered'
echo $message->status->isTerminal(); // true
```

### List messages

Uses cursor-based pagination:

```php
$result = $messages->list(
    limit:  25,           // optional — max results to return
    after:  'cursor-xyz', // optional — cursor for the next page
    before: 'cursor-abc', // optional — cursor for the previous page
);

foreach ($result['data'] as $message) {
    echo $message->id . ': ' . $message->subject;
}

// $result['meta'] contains cursor pagination info
```

### Cancel a scheduled message

```php
$cancelled = $messages->cancel('msg-scheduled-001'); // true on success
```

---

## SMTP Credentials

Manage programmatic SMTP credentials via `SmtpCredentialService`.

```php
use GraystackIT\Ahasend\Services\SmtpCredentialService;

class MyController
{
    public function __construct(private readonly SmtpCredentialService $smtp) {}
}
```

### Create an SMTP credential

```php
// Global credential (can send from any domain)
$credential = $smtp->create('My Application');

// Scoped credential (restricted to specific domains)
$credential = $smtp->create(
    name:    'My Application',
    scope:   'scoped',
    domains: ['yourdomain.com', 'anotherdomain.com'],
);

// Sandbox credential (no real emails sent)
$credential = $smtp->create('Test App', sandbox: true);

// Save the password — the API will not return it again.
echo $credential->id;       // 'cred-xyz'
echo $credential->username; // 'smtp_my_application'
echo $credential->password; // 'generated-secret' (only available on create)
echo $credential->host;     // 'smtp.ahasend.com'
echo $credential->port;     // 587
```

### List all SMTP credentials

Uses cursor-based pagination:

```php
$credentials = $smtp->list(
    limit:  10,           // optional
    after:  'cursor-xyz', // optional
    before: 'cursor-abc', // optional
);

foreach ($credentials as $cred) {
    echo $cred->id . ': ' . $cred->name;
}
```

### Get a single SMTP credential

```php
$credential = $smtp->get('cred-xyz');
```

### Delete an SMTP credential

```php
$smtp->delete('cred-xyz'); // true on success
```

---

## Suppressions

Manage the suppression list via `SuppressionService`.

```php
use GraystackIT\Ahasend\Services\SuppressionService;

class MyController
{
    public function __construct(private readonly SuppressionService $suppressions) {}
}
```

### Add a suppression

```php
$suppression = $suppressions->create(
    email:     'user@example.com',
    expiresAt: '2026-12-31T00:00:00Z', // RFC3339 datetime — required
    reason:    'User unknown',          // optional
    domain:    'example.com',           // optional — restrict to a sending domain
);

echo $suppression->email;  // 'user@example.com'
```

### List suppressions

Uses cursor-based pagination:

```php
$result = $suppressions->list(
    limit:  50,                    // optional
    after:  'cursor-xyz',          // optional
    before: 'cursor-abc',          // optional
    domain: 'example.com',         // optional — filter by sending domain
    email:  'user@example.com',    // optional — filter by recipient email
);

foreach ($result['data'] as $suppression) {
    echo $suppression->email;
}

// $result['meta'] contains cursor pagination info
```

### Delete a specific suppression

```php
$suppressions->delete('user@example.com'); // true on success
```

### Delete all suppressions

```php
$suppressions->deleteAll(); // true on success
```

---

## Reports

Retrieve analytics data via `ReportService`.

```php
use GraystackIT\Ahasend\Services\ReportService;

class MyController
{
    public function __construct(private readonly ReportService $reports) {}
}
```

All date/time parameters use RFC3339 format (e.g. `2024-01-01T00:00:00Z`).

### Bounce statistics

```php
$stats = $reports->bounceStatistics(
    fromTime:     '2024-01-01T00:00:00Z', // optional
    toTime:       '2024-01-31T23:59:59Z', // optional
    senderDomain: 'gmail.com',             // optional — filter by sending domain
);

echo $stats->totalSent;        // 1000
echo $stats->hardBounces;      // 50
echo $stats->softBounces;      // 20
echo $stats->hardBounceRate;   // 5.0  (percent)
echo $stats->totalBounceRate;  // 7.0
```

### Deliverability breakdown

```php
$breakdown = $reports->deliverabilityBreakdown(
    fromTime:         '2024-01-01T00:00:00Z', // optional
    toTime:           '2024-01-31T23:59:59Z', // optional
    senderDomain:     'yourdomain.com',        // optional
    recipientDomains: 'gmail.com,outlook.com', // optional — comma-separated
    tags:             'transactional,welcome', // optional — comma-separated
    groupBy:          'day',                   // optional — hour, day, week, month
);

echo $breakdown->totalSent;      // 500
echo $breakdown->totalDelivered; // 480
echo $breakdown->deliveryRate;   // 96.0

foreach ($breakdown->domains as $domain) {
    echo $domain['domain'] . ': ' . $domain['rate'] . '%';
}
```

### Delivery time analytics

```php
$analytics = $reports->deliveryTimeAnalytics(
    fromTime:     '2024-01-01T00:00:00Z', // optional
    toTime:       '2024-01-31T23:59:59Z', // optional
    senderDomain: 'yahoo.com',             // optional
);

echo $analytics->averageDeliverySeconds; // 45.7
echo $analytics->medianDeliverySeconds;  // 30.0
echo $analytics->totalDelivered;         // 900

// Breakdown by hour-of-day and calendar day
foreach ($analytics->byHour as $hour) {
    echo "Hour {$hour['hour']}: {$hour['avg_delivery_seconds']}s avg";
}
```

---

## Error handling

All service methods throw `AhasendException` on API errors. The exception wraps the Saloon `RequestException` and exposes the HTTP status code.

```php
use GraystackIT\Ahasend\Exceptions\AhasendException;

try {
    $messages->get('nonexistent-id');
} catch (AhasendException $e) {
    echo $e->getCode();    // 404
    echo $e->getMessage(); // "Ahasend API error [404]: ..."
}
```

---

## Testing

```bash
composer test
```

## License

MIT
