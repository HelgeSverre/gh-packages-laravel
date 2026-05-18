# Laravel Checkeeper

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bhaidar/laravel-checkeeper.svg?style=flat-square)](https://packagist.org/packages/bhaidar/laravel-checkeeper)
[![Total Downloads](https://img.shields.io/packagist/dt/bhaidar/laravel-checkeeper.svg?style=flat-square)](https://packagist.org/packages/bhaidar/laravel-checkeeper)

A comprehensive Laravel package for the Checkeeper API v3. Send physical checks via USPS, UPS, or FedEx, or generate PDFs for self-printing.

## Features

- **Full API Coverage** - Complete implementation of Checkeeper API v3
- **Type-Safe** - Readonly DTOs with typed properties throughout
- **Fluent Queries** - Powerful filter builder for searching checks
- **Webhook Support** - Automatic signature verification and event dispatching
- **Queue Integration** - Async check creation
- **Event-Driven** - Laravel events for check operations
- **Well Tested** - Comprehensive Pest test suite
- **Laravel 11+** - Built for modern Laravel applications

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Creating Checks](#creating-checks)
  - [Basic Check Creation](#basic-check-creation)
  - [Using Type-Safe DTOs](#using-type-safe-dtos)
  - [Delivery Methods](#delivery-methods)
  - [Bulk Check Creation](#bulk-check-creation)
  - [Async Check Creation](#async-check-creation)
- [Querying Checks](#querying-checks)
  - [List All Checks](#list-all-checks)
  - [Filtering Checks](#filtering-checks)
  - [Check Status](#check-status)
  - [Tracking Events](#tracking-events)
  - [Cancel Check](#cancel-check)
  - [Download Check Images](#download-check-images)
- [Webhooks](#webhooks)
  - [Webhook Setup](#webhook-setup)
  - [Listening to Events](#listening-to-events)
  - [Example Listeners](#example-listeners)
  - [Webhook Security](#webhook-security)
- [Team & Templates](#team--templates)
- [Events](#events)
- [Exception Handling](#exception-handling)
- [Complete Application Example](#complete-application-example)
- [Testing Your Integration](#testing-your-integration)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Requirements

- PHP 8.2+
- Laravel 11.0+

## Installation

Install via Composer:

```bash
composer require bhaidar/laravel-checkeeper
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=checkeeper-config
```

Add your API credentials to `.env`:

```env
CHECKEEPER_API_KEY=your-api-key-here
CHECKEEPER_WEBHOOK_SECRET=your-webhook-secret
```

Optional queue configuration:

```env
CHECKEEPER_QUEUE_ENABLED=true
CHECKEEPER_QUEUE_CONNECTION=redis
CHECKEEPER_QUEUE_NAME=checkeeper
```

## Configuration

The package configuration file is located at `config/checkeeper.php`:

```php
return [
    // API authentication
    'api_key' => env('CHECKEEPER_API_KEY'),

    // API endpoint
    'base_url' => env('CHECKEEPER_BASE_URL', 'https://api.checkeeper.com/v3'),

    // HTTP timeout (seconds)
    'timeout' => 30,

    // Webhook configuration
    'webhooks' => [
        'enabled' => true,
        'secret' => env('CHECKEEPER_WEBHOOK_SECRET'),
        'route' => 'checkeeper/webhook',
        'middleware' => ['api'],
    ],

    // Queue configuration
    'queue' => [
        'enabled' => true,
        'connection' => env('CHECKEEPER_QUEUE_CONNECTION', 'default'),
        'queue' => env('CHECKEEPER_QUEUE_NAME', 'checkeeper'),
    ],
];
```

## How It Works

The Laravel Checkeeper package provides a clean, Laravel-friendly interface to the Checkeeper API. Here's how the components work together:

### Architecture Overview

```
Your Application
    |
Checkeeper Facade
    |
CheckkeeperClient (HTTP Client)
    |
Resources (Check, Team, Template)
    |
Checkeeper API
    |
Check Mailing Service
```

### Core Components

1. **Facade (`Checkeeper`)** - Main entry point for all operations
2. **Resources** - Organized API endpoints (Checks, Team, Templates)
3. **DTOs** - Type-safe data transfer objects
4. **Events** - Laravel events for check operations and webhooks
5. **Jobs** - Queue jobs for async operations
6. **Filter Builder** - Fluent query builder for searching checks

### Request Flow

```php
// 1. Create check data (DTO or array)
$checkData = new CheckData(...);

// 2. Optionally specify delivery method
$delivery = new DeliveryData(method: DeliveryMethod::UspsFirstClass);

// 3. Send to Checkeeper via Facade
$result = Checkeeper::checks()->create($checkData, $delivery);

// 4. Package handles HTTP request with retry logic
// 5. Returns typed CheckStatusData response
echo $result->id; // "check-abc123"

// 6. Webhooks notify you of status changes
// 7. Events fired for your listeners
```

## Creating Checks

### Basic Check Creation

Create a check using a simple array:

```php
use Bhaidar\Checkeeper\Facades\Checkeeper;

$result = Checkeeper::checks()->create([
    'bank' => [
        'routing' => '123456789',
        'account' => '987654321',
    ],
    'payer' => [
        'line1' => 'My Company Inc',
        'line2' => '123 Business St',
        'line3' => 'Suite 100',
        'line4' => 'New York, NY 10001',
    ],
    'payee' => [
        'line1' => 'Vendor Services LLC',
        'line2' => '456 Supplier Ave',
        'line3' => 'Los Angeles, CA 90210',
    ],
    'signer' => [
        'type' => 'text',
        'value' => 'Jane Smith',
    ],
    'amount' => 50000,              // $500.00 (amount in cents)
    'number' => 1001,
    'date' => '2024-02-29',
    'memo' => 'Invoice #12345',
    'nonce' => 'unique-id-12345',   // prevents duplicates
]);

// Result contains check ID and status
echo $result->id;            // "check-abc123"
echo $result->status->value; // "processing"
```

### Using Type-Safe DTOs

**Recommended approach** for type safety and IDE autocomplete:

```php
use Bhaidar\Checkeeper\Facades\Checkeeper;
use Bhaidar\Checkeeper\DataTransferObjects\CheckData;
use Bhaidar\Checkeeper\DataTransferObjects\BankData;
use Bhaidar\Checkeeper\DataTransferObjects\PayerData;
use Bhaidar\Checkeeper\DataTransferObjects\PayeeData;
use Bhaidar\Checkeeper\DataTransferObjects\SignerData;
use Bhaidar\Checkeeper\Enums\SignerType;
use Illuminate\Support\Str;

$checkData = new CheckData(
    bank: new BankData(
        routing: '123456789',
        account: '987654321'
    ),
    payer: new PayerData(
        line1: 'My Company Inc',
        line2: '123 Business St',
        line3: 'Suite 100',
        line4: 'New York, NY 10001'
    ),
    payee: new PayeeData(
        line1: 'Vendor Services LLC',
        line2: '456 Supplier Ave',
        line3: 'Los Angeles, CA 90210'
    ),
    signer: new SignerData(
        type: SignerType::Text,
        value: 'Jane Smith'
    ),
    amount: 50000,
    number: 1001,
    memo: 'Invoice #12345',
    nonce: 'payment-' . Str::uuid()
);

$result = Checkeeper::checks()->create($checkData);
```

**Adding a Company Logo:**

```php
use Illuminate\Support\Facades\Storage;

$payer = new PayerData(
    line1: 'My Company Inc',
    line2: '123 Business St',
    logo: base64_encode(Storage::get('company-logo.png'))
);
```

**Using Image Signature:**

```php
$signer = new SignerData(
    type: SignerType::Png,
    value: base64_encode(Storage::get('ceo-signature.png'))
);
```

### Delivery Methods

Delivery is specified **separately** from check data and passed as the second argument to `create()` or `createBulk()`. This matches the Checkeeper API payload structure where `delivery` is a sibling to `checks`:

```json
{
    "checks": [{ ... }],
    "delivery": { "method": "usps.first_class" }
}
```

```php
use Bhaidar\Checkeeper\DataTransferObjects\DeliveryData;
use Bhaidar\Checkeeper\DataTransferObjects\AddressData;
use Bhaidar\Checkeeper\Enums\DeliveryMethod;

// First class mail
$delivery = new DeliveryData(
    method: DeliveryMethod::UspsFirstClass
);

$result = Checkeeper::checks()->create($checkData, $delivery);

// Priority mail
$delivery = new DeliveryData(
    method: DeliveryMethod::UspsPriority
);

$result = Checkeeper::checks()->create($checkData, $delivery);

// Overnight shipping (bundled to one address)
$delivery = new DeliveryData(
    method: DeliveryMethod::UpsNextDay,
    bundleAddress: new AddressData(
        name: 'John Doe',
        line1: '789 Main St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
        phone: '555-123-4567'
    )
);

$result = Checkeeper::checks()->create($checkData, $delivery);

// PDF return (no mailing, get PDF to print yourself)
$delivery = new DeliveryData(
    method: DeliveryMethod::Pdf
);

$result = Checkeeper::checks()->create($checkData, $delivery);
```

**No delivery specified** defaults to the team's configured delivery method:

```php
$result = Checkeeper::checks()->create($checkData);
```

**Available Delivery Methods:**

| Enum | Value | Description |
|------|-------|-------------|
| `DeliveryMethod::UspsFirstClass` | `usps.first_class` | USPS First Class Mail |
| `DeliveryMethod::UspsPriority` | `usps.priority` | USPS Priority Mail |
| `DeliveryMethod::UpsTwoDay` | `ups.two_day` | UPS 2-Day Shipping |
| `DeliveryMethod::UpsNextDay` | `ups.next_day` | UPS Next Day Air |
| `DeliveryMethod::FedexTwoDay` | `fedex.two_day` | FedEx 2-Day |
| `DeliveryMethod::FedexOvernight` | `fedex.overnight` | FedEx Overnight |
| `DeliveryMethod::Pdf` | `pdf` | Return PDF only |

### Bulk Check Creation

Create multiple checks in a single API request. Delivery applies to **all** checks in the batch:

```php
$checks = [
    [
        'bank' => ['routing' => '123456789', 'account' => '111111'],
        'payer' => ['line1' => 'My Company'],
        'payee' => ['line1' => 'Vendor A'],
        'signer' => ['type' => 'text', 'value' => 'Jane Smith'],
        'amount' => 25000,
        'number' => 1001,
        'nonce' => 'check-001',
    ],
    [
        'bank' => ['routing' => '123456789', 'account' => '111111'],
        'payer' => ['line1' => 'My Company'],
        'payee' => ['line1' => 'Vendor B'],
        'signer' => ['type' => 'text', 'value' => 'Jane Smith'],
        'amount' => 35000,
        'number' => 1002,
        'nonce' => 'check-002',
    ],
];

// Without delivery (uses team default)
$result = Checkeeper::checks()->createBulk($checks);

// With delivery
$delivery = new DeliveryData(method: DeliveryMethod::UspsPriority);
$result = Checkeeper::checks()->createBulk($checks, $delivery);

// Result contains:
echo "Created: " . count($result['checks']); // New checks
echo "Duplicates: " . count($result['existing']); // Checks with duplicate nonce
echo "Total credits: " . $result['total_credits']; // Cost in credits
```

**Using DTOs for bulk:**

```php
$checksData = [
    new CheckData(/* ... */),
    new CheckData(/* ... */),
    new CheckData(/* ... */),
];

$delivery = new DeliveryData(method: DeliveryMethod::UspsFirstClass);
$result = Checkeeper::checks()->createBulk($checksData, $delivery);
```

### Async Check Creation

**Recommended for production** to avoid blocking your application:

```php
use Bhaidar\Checkeeper\Jobs\CreateCheckJob;

// Dispatch to queue
CreateCheckJob::dispatch($checkData);

// With delay
CreateCheckJob::dispatch($checkData)->delay(now()->addMinutes(5));

// On specific queue
CreateCheckJob::dispatch($checkData)->onQueue('payments');

// With callback URL (for your own tracking)
CreateCheckJob::dispatch($checkData, callbackUrl: 'https://yourapp.com/check-created');
```

**Listen for completion:**

```php
// app/Providers/EventServiceProvider.php

use Bhaidar\Checkeeper\Events\CheckCreated;
use App\Listeners\NotifyAccountingOfCheckCreation;

protected $listen = [
    CheckCreated::class => [
        NotifyAccountingOfCheckCreation::class,
    ],
];
```

## Querying Checks

### List All Checks

```php
$checks = Checkeeper::checks()->list();

foreach ($checks as $check) {
    echo "{$check->id}: {$check->status->value}\n";
}
```

### Filtering Checks

Use the fluent filter builder for powerful queries:

```php
use Bhaidar\Checkeeper\Enums\CheckStatus;

$checks = Checkeeper::checks()
    ->filter()
    ->whereEquals('status', CheckStatus::Delivered->value)
    ->whereGreaterThan('amount', 10000)
    ->whereBetween('date', '2024-01-01', '2024-12-31')
    ->whereContains('memo', 'Invoice')
    ->sortBy('created', 'desc')
    ->get();
```

**Available Filter Methods:**

```php
// Equality
->whereEquals('field', 'value')
->whereNotEquals('field', 'value')

// Comparison
->whereLessThan('amount', 10000)
->whereLessThanOrEqual('amount', 10000)
->whereGreaterThan('amount', 10000)
->whereGreaterThanOrEqual('amount', 10000)

// Lists
->whereIn('status', ['delivered', 'printed'])
->whereNotIn('status', ['cancelled'])

// Text search
->whereContains('memo', 'Invoice')

// Ranges
->whereBetween('date', '2024-01-01', '2024-12-31')

// Sorting
->sortBy('created', 'desc')
->sortBy('amount', 'asc')
```

**Filterable Fields:**

- `id`, `request_id`, `template_id`
- `status`, `ship_method`, `test`
- `number`, `date`, `amount`, `memo`, `note`
- `payer_line1`, `payer_line2`, `payer_line3`, `payer_line4`
- `payee_line1`, `payee_line2`, `payee_line3`, `payee_line4`
- `meta`, `created`, `updated`

**Raw filter array:**

```php
$checks = Checkeeper::checks()->list([
    'filters[status][$eq]' => 'delivered',
    'filters[amount][$gt]' => 10000,
    'sort' => 'created:desc',
]);
```

### Check Status

Get current status of a check:

```php
$status = Checkeeper::checks()->status('check-abc123');

echo $status->id;              // "check-abc123"
echo $status->status->value;   // "delivered"
echo $status->created;         // "2024-02-29 10:00:00"
echo $status->updated;         // "2024-03-02 14:30:00"
echo $status->trackingUrl;     // "https://tools.usps.com/..."
```

**Available Check Statuses:**

| Status | Description |
|--------|-------------|
| `Processing` | Check is being prepared |
| `Ready` | Check is ready for printing |
| `Printed` | Check has been printed |
| `Mailed` | Check has been sent |
| `Delivered` | Check delivered to recipient |
| `Cancelled` | Check was cancelled |
| `Returned` | Check returned to sender |

### Tracking Events

Get detailed tracking information:

```php
$events = Checkeeper::checks()->tracking('check-abc123');

foreach ($events as $event) {
    echo "{$event->event}: {$event->eventDate}\n";
    if ($event->location) {
        echo "  Location: {$event->location->city}, {$event->location->state}\n";
    }
}
```

### Cancel Check

Cancel a check before it's printed or mailed:

```php
$cancelled = Checkeeper::checks()->cancel('check-abc123');

if ($cancelled) {
    echo "Check cancelled successfully";
}
```

**Note:** Checks can only be cancelled if they haven't been printed yet.

### Download Check Images

Download check images as JPG or PDF:

```php
use Illuminate\Support\Facades\Storage;

// Get JPG image
$imageData = Checkeeper::checks()->image('check-abc123', 'jpg');
Storage::put('checks/check-abc123.jpg', $imageData);

// Get PDF
$pdfData = Checkeeper::checks()->image('check-abc123', 'pdf');
Storage::put('checks/check-abc123.pdf', $pdfData);

// Download in controller
public function download($checkId)
{
    $pdfData = Checkeeper::checks()->image($checkId, 'pdf');

    return response()->streamDownload(function () use ($pdfData) {
        echo $pdfData;
    }, "check-{$checkId}.pdf");
}
```

**Get voucher image:**

```php
$voucherData = Checkeeper::checks()->voucherImage('check-abc123');
Storage::put('vouchers/voucher-abc123.jpg', $voucherData);
```

## Webhooks

Webhooks allow Checkeeper to notify your application in real-time when check statuses change.

### Webhook Setup

1. **The webhook route is auto-registered** at `/checkeeper/webhook`
2. **Configure the URL in Checkeeper dashboard**: `https://yourapp.com/checkeeper/webhook`
3. **Set webhook secret** in `.env`:
   ```env
   CHECKEEPER_WEBHOOK_SECRET=your-webhook-secret-from-dashboard
   ```

The package automatically:
- Verifies webhook signatures using HMAC SHA256
- Dispatches `WebhookReceived` event
- Returns 200 OK immediately

### Listening to Events

Register listeners in your `EventServiceProvider`:

```php
use Bhaidar\Checkeeper\Events\WebhookReceived;
use Bhaidar\Checkeeper\Events\CheckCreated;
use Bhaidar\Checkeeper\Events\CheckCancelled;

protected $listen = [
    WebhookReceived::class => [
        LogWebhookActivity::class,
        ProcessCheckStatusUpdate::class,
    ],

    CheckCreated::class => [
        SendCheckCreatedNotification::class,
        UpdateInvoiceStatus::class,
    ],

    CheckCancelled::class => [
        RefundPayment::class,
        NotifyAccounting::class,
    ],
];
```

### Example Listeners

#### Update Invoice When Check Delivered

```php
namespace App\Listeners;

use Bhaidar\Checkeeper\Events\WebhookReceived;
use App\Models\Invoice;

class MarkInvoiceAsPaid
{
    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;

        if ($payload['event'] !== 'check.delivered') {
            return;
        }

        $invoice = Invoice::where('check_id', $payload['check_id'])->first();

        if (! $invoice) {
            return;
        }

        $invoice->update([
            'status' => 'paid',
            'paid_at' => $payload['delivered_at'],
        ]);

        $invoice->customer->notify(new CheckDeliveredNotification($invoice));
    }
}
```

#### Log All Webhook Activity

```php
namespace App\Listeners;

use Bhaidar\Checkeeper\Events\WebhookReceived;
use Illuminate\Support\Facades\Log;

class LogWebhookActivity
{
    public function handle(WebhookReceived $event): void
    {
        Log::info('Checkeeper webhook received', [
            'event' => $event->payload['event'] ?? 'unknown',
            'check_id' => $event->payload['check_id'] ?? null,
            'received_at' => $event->receivedAt,
        ]);
    }
}
```

### Webhook Security

The package automatically verifies webhook signatures using the `VerifyWebhookSignature` middleware:

1. Extracts `X-Checkeeper-Signature` header
2. Validates using HMAC SHA256 with your webhook secret
3. Rejects invalid signatures with 401 Unauthorized

**No additional configuration needed** - just ensure your webhook secret is set in `.env`.

**Disable webhooks** if needed:

```php
// config/checkeeper.php
'webhooks' => [
    'enabled' => false,
],
```

## Team & Templates

### Get Team Information

```php
$info = Checkeeper::team()->info();

echo $info['name'];
echo $info['credits'];
```

### List Available Templates

```php
$templates = Checkeeper::templates()->list();

foreach ($templates as $template) {
    echo "{$template['id']}: {$template['name']}\n";
}
```

**Use a template when creating checks:**

```php
$checkData = new CheckData(
    // ... other fields
    templateId: 'template-123'
);
```

## Events

The package dispatches Laravel events for key operations:

### CheckCreated

Fired after successful check creation.

```php
use Bhaidar\Checkeeper\Events\CheckCreated;

class SendCheckCreatedEmail
{
    public function handle(CheckCreated $event): void
    {
        $check = $event->check;       // CheckStatusData
        $metadata = $event->metadata;  // array

        Mail::to($recipient)->send(new CheckCreatedMail($check));
    }
}
```

### CheckCancelled

Fired after check cancellation.

```php
use Bhaidar\Checkeeper\Events\CheckCancelled;

class RefundCancelledCheck
{
    public function handle(CheckCancelled $event): void
    {
        $checkId = $event->checkId;

        Refund::create(['check_id' => $checkId]);
    }
}
```

### WebhookReceived

Fired when webhook is received and verified.

```php
use Bhaidar\Checkeeper\Events\WebhookReceived;

class ProcessWebhookPayload
{
    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;       // array
        $signature = $event->signature;   // string
        $receivedAt = $event->receivedAt; // string (ISO 8601)

        match ($payload['event']) {
            'check.printed' => $this->handlePrinted($payload),
            'check.mailed' => $this->handleMailed($payload),
            'check.delivered' => $this->handleDelivered($payload),
            default => null,
        };
    }
}
```

## Exception Handling

The package throws typed exceptions for different error scenarios:

```php
use Bhaidar\Checkeeper\Exceptions\AuthenticationException;
use Bhaidar\Checkeeper\Exceptions\ValidationException;
use Bhaidar\Checkeeper\Exceptions\NotFoundException;
use Bhaidar\Checkeeper\Exceptions\CheckkeeperException;

try {
    $result = Checkeeper::checks()->create($checkData);
} catch (AuthenticationException $e) {
    // Invalid API key (401/403)
    Log::error('Checkeeper auth failed', ['error' => $e->getMessage()]);

} catch (ValidationException $e) {
    // Invalid check data (422)
    return back()->withErrors($e->errors);

} catch (NotFoundException $e) {
    // Check not found (404)
    abort(404, 'Check not found');

} catch (CheckkeeperException $e) {
    // Other API errors
    Log::error('Checkeeper error', [
        'status' => $e->statusCode,
        'message' => $e->getMessage(),
        'errors' => $e->errors,
    ]);
}
```

## Complete Application Example

Here's a complete example of a vendor payment system:

```php
use Bhaidar\Checkeeper\Facades\Checkeeper;
use Bhaidar\Checkeeper\DataTransferObjects\CheckData;
use Bhaidar\Checkeeper\DataTransferObjects\BankData;
use Bhaidar\Checkeeper\DataTransferObjects\PayerData;
use Bhaidar\Checkeeper\DataTransferObjects\PayeeData;
use Bhaidar\Checkeeper\DataTransferObjects\SignerData;
use Bhaidar\Checkeeper\DataTransferObjects\DeliveryData;
use Bhaidar\Checkeeper\Enums\SignerType;
use Bhaidar\Checkeeper\Enums\DeliveryMethod;
use Bhaidar\Checkeeper\Events\WebhookReceived;
use Bhaidar\Checkeeper\Jobs\CreateCheckJob;

// Step 1: Create payment record
$payment = Payment::create([
    'invoice_id' => $invoice->id,
    'vendor_id' => $vendor->id,
    'amount' => 50000, // $500.00
    'status' => 'pending',
]);

// Step 2: Prepare check data
$checkData = new CheckData(
    bank: new BankData(
        routing: config('company.bank_routing'),
        account: config('company.bank_account')
    ),
    payer: new PayerData(
        line1: config('company.name'),
        line2: config('company.address'),
        logo: base64_encode(Storage::get('company-logo.png'))
    ),
    payee: new PayeeData(
        line1: $vendor->name,
        line2: $vendor->address
    ),
    signer: new SignerData(
        type: SignerType::Png,
        value: base64_encode(Storage::get('ceo-signature.png'))
    ),
    amount: $payment->amount,
    number: $payment->check_number,
    memo: "Invoice #{$invoice->number}",
    nonce: "payment-{$payment->id}"
);

// Step 3: Create check with delivery method
$delivery = new DeliveryData(method: DeliveryMethod::UspsFirstClass);
$result = Checkeeper::checks()->create($checkData, $delivery);

$payment->update([
    'check_id' => $result->id,
    'status' => 'sent_to_printer',
]);

// Or queue it for async processing
CreateCheckJob::dispatch($checkData);

// Step 4: Listen for webhook events
// app/Listeners/UpdatePaymentStatus.php
class UpdatePaymentStatus
{
    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;
        $checkId = $payload['check_id'];

        $payment = Payment::where('check_id', $checkId)->first();

        if (! $payment) {
            return;
        }

        match ($payload['event']) {
            'check.printed' => $payment->update(['status' => 'printed']),
            'check.mailed' => $payment->update(['status' => 'mailed']),
            'check.delivered' => $payment->update([
                'status' => 'delivered',
                'delivered_at' => $payload['delivered_at'],
            ]),
            'check.returned' => $payment->update(['status' => 'returned']),
            default => null,
        };

        $payment->vendor->notify(new CheckStatusUpdated($payment));
    }
}

// Step 5: Display status to user
// resources/views/payments/show.blade.php
```

```blade
<div class="payment-status">
    <h3>Payment #{{ $payment->id }}</h3>

    <div class="status-badge {{ $payment->status }}">
        {{ ucfirst($payment->status) }}
    </div>

    @if($payment->check_id)
        <div class="tracking">
            <h4>Tracking</h4>
            @foreach($tracking as $event)
                <div class="event">
                    <span>{{ $event->event }}</span>
                    <span>{{ $event->eventDate }}</span>
                    <span>{{ $event->location->city ?? '' }}</span>
                </div>
            @endforeach
        </div>

        <a href="{{ route('payments.download', $payment) }}" class="btn">
            Download Check Image
        </a>
    @endif
</div>
```

## Testing Your Integration

Use HTTP fakes to test your Checkeeper integration:

```php
use Bhaidar\Checkeeper\Facades\Checkeeper;
use Illuminate\Support\Facades\Http;

test('can create vendor payment', function () {
    Http::fake([
        'api.checkeeper.com/*' => Http::response([
            'data' => [
                'checks' => [
                    ['id' => 'check-123', 'status' => 'processing']
                ],
                'total_credits' => 1,
            ],
        ], 201),
    ]);

    $vendor = Vendor::factory()->create();
    $invoice = Invoice::factory()->create(['vendor_id' => $vendor->id]);

    $payment = Payment::create([
        'invoice_id' => $invoice->id,
        'vendor_id' => $vendor->id,
        'amount' => 50000,
    ]);

    CreateCheckJob::dispatchSync($checkData);

    expect($payment->fresh())
        ->check_id->toBe('check-123')
        ->status->toBe('sent_to_printer');
});

test('updates payment status on webhook', function () {
    $payment = Payment::factory()->create(['check_id' => 'check-123']);

    $payload = json_encode([
        'event' => 'check.delivered',
        'check_id' => 'check-123',
        'delivered_at' => now()->toIso8601String(),
    ]);

    $signature = hash_hmac('sha256', $payload, config('checkeeper.webhooks.secret'));

    $this->postJson('/checkeeper/webhook', json_decode($payload, true), [
        'X-Checkeeper-Signature' => $signature,
    ])->assertOk();

    expect($payment->fresh()->status)->toBe('delivered');
});
```

## API Reference

### Check Operations

```php
// List checks (returns Collection of CheckStatusData)
Checkeeper::checks()->list(array $filters = []): Collection

// Create single check (delivery is separate from check data)
Checkeeper::checks()->create(CheckData|array $data, ?DeliveryData $delivery = null): CheckStatusData

// Create multiple checks (delivery applies to all checks)
Checkeeper::checks()->createBulk(array $checks, ?DeliveryData $delivery = null): array

// Get check status
Checkeeper::checks()->status(string $id): CheckStatusData

// Get tracking events
Checkeeper::checks()->tracking(string $id): Collection

// Cancel check
Checkeeper::checks()->cancel(string $id): bool

// Get check image (jpg or pdf)
Checkeeper::checks()->image(string $id, string $type = 'jpg'): string

// Add attachment
Checkeeper::checks()->attachment(string $id, string $file): bool

// Get voucher image
Checkeeper::checks()->voucherImage(string $id): string

// Fluent filter builder
Checkeeper::checks()->filter(): CheckFilterBuilder
```

### Team Operations

```php
Checkeeper::team()->info(): array
```

### Template Operations

```php
Checkeeper::templates()->list(): Collection
```

### Available DTOs

| DTO | Description |
|-----|-------------|
| `CheckData` | Check payload (bank, payer, payee, signer, amount, etc.) |
| `BankData` | Bank routing and account numbers |
| `PayerData` | Payer/company info (lines 1-4, logo) |
| `PayeeData` | Payee/recipient info (lines 1-4) |
| `SignerData` | Signature (text name or image) |
| `AddressData` | Full address (name, lines, city, state, zip, country, phone) |
| `DeliveryData` | Delivery method and optional bundle address |
| `CheckStatusData` | API response (id, status, created, updated, trackingUrl) |
| `TrackingEventData` | Tracking event (event, subevent, eventDate, location) |

### Available Enums

| Enum | Values |
|------|--------|
| `DeliveryMethod` | `UspsFirstClass`, `UspsPriority`, `UpsTwoDay`, `UpsNextDay`, `FedexTwoDay`, `FedexOvernight`, `Pdf` |
| `CheckStatus` | `Processing`, `Ready`, `Printed`, `Mailed`, `Delivered`, `Cancelled`, `Returned` |
| `SignerType` | `Text`, `Png`, `Gif`, `Jpg` |

## Testing

Run the package test suite:

```bash
composer test
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security issues, please email security@example.com instead of using the issue tracker.

## Credits

- [Bilal Haidar](https://github.com/bhaidar)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
