# Laravel Plunk

<p align="center">
    <a href="https://packagist.org/packages/nextmigrant/laravel-plunk"><img src="https://img.shields.io/packagist/v/nextmigrant/laravel-plunk.svg?style=flat-square" alt="Latest Version on Packagist"></a>
    <a href="https://github.com/nextmigrant/laravel-plunk/actions?query=workflow%3Arun-tests+branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/nextmigrant/laravel-plunk/run-tests.yml?branch=main&label=tests&style=flat-square" alt="Tests"></a>
    <a href="https://github.com/nextmigrant/laravel-plunk/actions?query=workflow%3A%22Fix+PHP+code+style+issues%22+branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/nextmigrant/laravel-plunk/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square" alt="Code Style"></a>
    <a href="https://packagist.org/packages/nextmigrant/laravel-plunk"><img src="https://img.shields.io/packagist/dt/nextmigrant/laravel-plunk.svg?style=flat-square" alt="Total Downloads"></a>
</p>

A clean, expressive Laravel package for the [Plunk](https://useplunk.com) email platform. Send transactional emails, manage contacts, track events, and verify email addresses — all through a simple Facade.

**Works with Plunk SaaS and self-hosted instances.**

---

## Features

- 📧 **Transactional Emails** — Send with templates, attachments, custom headers, and reply-to
- 👥 **Contact Management** — Full CRUD with bulk ops, CSV import, and cursor pagination
- 📝 **Template Management** — Full CRUD with duplicate and usage tracking
- 📣 **Campaign Management** — Create, send, schedule, cancel, and track stats
- 🎯 **Segment Management** — Dynamic/static segments with member management
- 📡 **Event Tracking** — Track events with automatic contact upsert and workflow triggers
- ✅ **Email Verification** — Validate format, MX records, disposable domains, and typos
- 🔑 **Dual Key Support** — Secret key for admin APIs, public key for event tracking
- 🛡️ **Typed Exceptions** — `AuthenticationException`, `ValidationException`, `RateLimitException`, `BillingException`, `ConflictException`
- ⚡ **Built on Laravel HTTP Client** — Retries, timeouts, and `Http::fake()` for testing

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require nextmigrant/laravel-plunk
```

Publish the config file:

```bash
php artisan vendor:publish --tag="plunk-config"
```

Add your configuration to `.env`:

```env
PLUNK_SECRET_KEY=sk_your_secret_key
PLUNK_PUBLIC_KEY=pk_your_public_key           # Required for event tracking
PLUNK_BASE_API_URL=https://next-api.useplunk.com  # Override for self-hosted instances
```

## Quick Start

```php
use NextMigrant\Plunk\Plunk;

// Send a transactional email
Plunk::transactional()->send(
    to: 'user@example.com',
    subject: 'Welcome aboard!',
    body: '<h1>Welcome to our platform</h1>',
);

// Track an event
Plunk::events()->track(
    email: 'user@example.com',
    event: 'signed_up',
    data: ['plan' => 'pro'],
);

// Verify an email
$result = Plunk::verifyEmail('user@example.com');
// $result->valid, $result->isDisposable, $result->hasMxRecords, etc.
```

## Usage

### Transactional Emails

Send with inline content or a template. Requires either `template`, or both `subject` and `body`:

```php
// Inline content
Plunk::transactional()->send(
    to: 'user@example.com',                        // string, {name, email}, or array
    subject: 'Your Invoice',
    body: '<h1>Invoice #1234</h1>',
    from: ['name' => 'Acme', 'email' => 'billing@acme.com'],  // verified domain
    reply: 'support@acme.com',
    subscribed: true,
    data: ['invoice_id' => '1234'],                // contact data + template vars
    headers: ['X-Priority' => '1'],
    attachments: [
        [
            'filename' => 'invoice.pdf',
            'content' => base64_encode($pdfContent),
            'contentType' => 'application/pdf',
        ],
    ],
);

// Using a template (subject/body come from the template)
Plunk::transactional()->send(
    to: 'user@example.com',
    template: 'tpl_welcome',
    data: ['firstName' => 'John', 'plan' => 'pro'],
);
```

### Event Tracking

Track events to trigger Plunk workflows. Contacts are created automatically if they don't exist:

```php
Plunk::events()->track(
    email: 'user@example.com',
    event: 'plan_upgraded',
    data: ['plan' => 'enterprise', 'seats' => 50],
    subscribed: false,  // Subscription state for auto-created contacts
);
```

> **Note:** The `/v1/track` endpoint requires a public key (`pk_*`). Secret keys are not accepted for this endpoint. Set `PLUNK_PUBLIC_KEY` in your `.env`.

### Contact Management

#### Basic CRUD

```php
// List contacts (cursor-based pagination)
$result = Plunk::contacts()->list(
    search: 'john',    // Filter by email substring
    limit: 50,         // Items per page (max 100)
    cursor: $cursor,   // Cursor from previous response
);

foreach ($result['data'] as $contact) {
    echo $contact->email;       // Contact DTO
    echo $contact->subscribed;
}
// $result['cursor'], $result['hasMore'], $result['total']

// Get a single contact
$contact = Plunk::contacts()->get('contact_id');

// Create or upsert a contact
$result = Plunk::contacts()->create('new@example.com',
    subscribed: true,
    data: ['source' => 'api', 'plan' => 'free'],
);
// $result['_meta']['isNew'], $result['_meta']['isUpdate']

// Update a contact (PATCH)
$result = Plunk::contacts()->update('contact_id',
    subscribed: false,
    data: ['plan' => 'pro'],
);

// Delete a contact
Plunk::contacts()->delete('contact_id');

// Bulk email-existence check (max 500 emails)
$result = Plunk::contacts()->lookup(['a@example.com', 'b@example.com']);
```

#### Bulk Operations

All bulk operations are async and return a `jobId` for status polling:

```php
// Subscribe/unsubscribe/delete (up to 1,000 IDs)
$result = Plunk::contacts()->bulkSubscribe(['id_1', 'id_2', 'id_3']);
$result = Plunk::contacts()->bulkUnsubscribe(['id_1', 'id_2']);
$result = Plunk::contacts()->bulkDelete(['id_1']);

// Poll job status
$status = Plunk::contacts()->bulkStatus($result['jobId']);

// Import from CSV (max 5MB, queued)
$result = Plunk::contacts()->import('/path/to/contacts.csv');
$status = Plunk::contacts()->importStatus($result['jobId']);
```

### Templates

```php
// List templates (with pagination and filtering)
$result = Plunk::templates()->list(
    search: 'welcome',
    type: 'TRANSACTIONAL',  // or 'MARKETING'
    limit: 50,
);

// Get a single template
$template = Plunk::templates()->get('template_id');

// Create a template
$template = Plunk::templates()->create(
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    body: '<h1>Hello {{firstName}}</h1>',
    type: 'TRANSACTIONAL',  // or 'MARKETING'
);

// Update a template (PATCH)
$template = Plunk::templates()->update('template_id',
    subject: 'Updated Subject',
);

// Duplicate a template
$copy = Plunk::templates()->duplicate('template_id');

// Check what uses a template
$usage = Plunk::templates()->usage('template_id');

// Delete a template
Plunk::templates()->delete('template_id');
```

### Campaigns

```php
// List all campaigns
$campaigns = Plunk::campaigns()->list();

// Create a campaign (starts in DRAFT)
$result = Plunk::campaigns()->create(
    name: 'Product Launch',
    subject: 'Exciting news!',
    body: '<h1>We launched!</h1>',
    from: 'hello@acme.com',
    audienceType: 'ALL',          // 'ALL', 'SEGMENT', or 'FILTERED'
    segmentId: 'seg_123',         // required if SEGMENT
    audienceFilter: [...],        // required if FILTERED
);

// Send immediately
Plunk::campaigns()->send('campaign_id');

// Schedule for later
Plunk::campaigns()->send('campaign_id', scheduledFor: '2026-06-01T10:00:00Z');

// Cancel a scheduled/sending campaign
Plunk::campaigns()->cancel('campaign_id');

// Send a test email
Plunk::campaigns()->test('campaign_id', 'tester@example.com');

// Get campaign stats
$stats = Plunk::campaigns()->stats('campaign_id');
// $stats['sent'], $stats['opened'], $stats['clicked'], $stats['bounced']

// Duplicate / Update / Delete
$copy = Plunk::campaigns()->duplicate('campaign_id');
Plunk::campaigns()->update('campaign_id', [...]);
Plunk::campaigns()->delete('campaign_id');
```

### Segments

```php
// List all segments
$segments = Plunk::segments()->list();

// Create a segment
$result = Plunk::segments()->create(
    name: 'Pro Users',
    filters: ['data.plan' => 'pro'],
    trackMembership: true,
);

// Get segment members (page-based pagination)
$result = Plunk::segments()->contacts('segment_id', page: 1, pageSize: 100);

// Add/remove members (static segments)
Plunk::segments()->addMembers('segment_id',
    emails: ['a@example.com', 'b@example.com'],
    createMissing: true,
);
Plunk::segments()->removeMembers('segment_id', ['a@example.com']);

// Recompute membership (fires entry/exit events)
Plunk::segments()->compute('segment_id');

// Cheap count refresh (no events)
Plunk::segments()->refresh('segment_id');

// Update / Delete
Plunk::segments()->update('segment_id', ['name' => 'Updated Name']);
Plunk::segments()->delete('segment_id');
```

### Email Verification

```php
$verification = Plunk::verifyEmail('user@example.com');

$verification->valid;            // bool — overall result
$verification->email;            // string — the email checked
$verification->isDisposable;     // bool — is a disposable domain
$verification->isAlias;          // bool — is an alias address
$verification->isTypo;           // bool — likely contains a typo
$verification->suggestedEmail;   // string|null — correction if isTypo is true
$verification->isPlusAddressed;  // bool — uses + addressing
$verification->isPersonalEmail;  // bool — personal vs business
$verification->domainExists;     // bool — domain resolves
$verification->hasWebsite;       // bool — domain has a website
$verification->hasMxRecords;     // bool — MX records exist
$verification->reasons;          // array — human-readable explanations
```

## Configuration

The published config file (`config/plunk.php`):

```php
return [
    'secret_key' => env('PLUNK_SECRET_KEY'),
    'public_key' => env('PLUNK_PUBLIC_KEY'),
    'base_api_url'   => env('PLUNK_BASE_API_URL', 'https://next-api.useplunk.com'),
    'timeout'    => env('PLUNK_TIMEOUT', 30),
    'retry'      => [
        'times' => 3,
        'sleep' => 100, // milliseconds
    ],
];
```

## Error Handling

The package throws typed exceptions mapped from HTTP status codes. All exceptions expose `errorCode`, `requestId`, and `suggestion` from the Plunk error response:

```php
use NextMigrant\Plunk\Exceptions\AuthenticationException; // 401, 403
use NextMigrant\Plunk\Exceptions\BillingException;        // 402
use NextMigrant\Plunk\Exceptions\ConflictException;       // 409
use NextMigrant\Plunk\Exceptions\ValidationException;     // 422
use NextMigrant\Plunk\Exceptions\RateLimitException;      // 429
use NextMigrant\Plunk\Exceptions\PlunkException;          // All others

try {
    Plunk::transactional()->send(to: $email, subject: 'Hi', body: '<p>Hello</p>');
} catch (AuthenticationException $e) {
    // 401/403 — Invalid or missing API key
} catch (BillingException $e) {
    // 402 — Billing limit exceeded or upgrade required
} catch (ConflictException $e) {
    // 409 — Resource conflict (e.g., duplicate email)
} catch (ValidationException $e) {
    // 422 — Invalid request payload
    $e->response->json()['error']['errors']; // Field-level validation errors
} catch (RateLimitException $e) {
    // 429 — Exceeded 1,000 requests/minute
} catch (PlunkException $e) {
    // Any other API error
    $e->errorCode;   // e.g., 'INTERNAL_SERVER_ERROR'
    $e->requestId;   // For debugging with Plunk support
    $e->suggestion;  // Helpful fix guidance
    $e->response;    // Underlying HTTP response
}
```

## Testing

The package uses Laravel's HTTP client under the hood, so you can use `Http::fake()` in your application tests:

```php
use Illuminate\Support\Facades\Http;
use NextMigrant\Plunk\Plunk;

Http::fake([
    '*/v1/send' => Http::response(['success' => true]),
]);

Plunk::transactional()->send(
    to: 'user@example.com',
    subject: 'Test',
    body: '<p>Hello</p>',
);

Http::assertSent(fn ($request) =>
    str_contains($request->url(), '/v1/send')
    && $request['to'] === 'user@example.com'
);
```

Run the package test suite:

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [NextMigrant](https://github.com/nextmigrant)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
