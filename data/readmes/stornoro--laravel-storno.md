# laravel-storno

Laravel package for [Storno](https://storno.ro) — self-hosted invoicing with Romanian e-Factura (ANAF) integration.

[![Tests](https://github.com/stornoro/laravel-storno/actions/workflows/tests.yml/badge.svg)](https://github.com/stornoro/laravel-storno/actions/workflows/tests.yml)
[![Latest Version](https://img.shields.io/packagist/v/storno/laravel-storno.svg)](https://packagist.org/packages/storno/laravel-storno)
[![License](https://img.shields.io/packagist/l/storno/laravel-storno.svg)](LICENSE)

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

---

## Installation

```bash
composer require storno/laravel-storno
```

Publish the config file:

```bash
php artisan vendor:publish --tag=storno-config
```

Add to your `.env`:

```env
STORNO_API_URL=https://invoices.yourapp.com
STORNO_API_KEY=your-api-key
STORNO_COMPANY_ID=your-company-uuid
```

---

## Quick Start

### Create a client and invoice

```php
use Storno\Laravel\Facades\Storno;
use Storno\Laravel\DTOs\Client;
use Storno\Laravel\DTOs\Invoice;
use Storno\Laravel\DTOs\InvoiceLine;

// 1. Create or find a client
$result = Storno::createClient(new Client(
    name: 'Acme SRL',
    type: 'company',
    email: 'billing@acme.ro',
    country: 'RO',
    city: 'București',
    cui: '12345678',
));

$clientId = $result['client']['id'];
$isNew = ! $result['existing'];

// 2. Create an invoice
$invoice = Storno::createInvoice(new Invoice(
    clientId: $clientId,
    currency: 'RON',
    paymentMethod: 'bank_transfer',
    orderNumber: 'ORD-2026-001',
    lines: [
        new InvoiceLine(
            description: 'Widget Pro',
            quantity: 2,
            unitPrice: 100.00,
            vatRate: 21,
        ),
        new InvoiceLine(
            description: 'Shipping',
            quantity: 1,
            unitPrice: 15.00,
            vatRate: 21,
        ),
    ],
));

$invoiceId = $invoice['invoice']['id'];

// 3. Issue the invoice (changes status from draft to issued)
if (config('storno.auto_issue')) {
    Storno::issueInvoice($invoiceId);
}

// 4. Download and store the PDF
$pdf = Storno::downloadPdf($invoiceId);
Storage::put("invoices/{$invoiceId}.pdf", $pdf);
```

### Submit to e-Factura (ANAF)

```php
// After issuing, optionally submit to Romanian e-Factura system
Storno::submitInvoice($invoiceId);
```

### Look up a company by CUI (Romanian tax ID)

```php
$company = Storno::anafLookup('12345678');
// Returns name, address, VAT status, etc.
```

---

## Configuration Reference

See `config/storno.php` for all options. Full docs at [docs.storno.ro](https://docs.storno.ro).

| Key | Default | Description |
|-----|---------|-------------|
| `api_url` | — | Your Storno instance URL |
| `api_key` | — | API key from Storno dashboard |
| `company_id` | — | Company UUID from Storno |
| `auto_issue` | `true` | Automatically issue invoices after creation |
| `auto_apply_vat_rules` | `true` | Apply VAT rules automatically |
| `document_series_id` | — | Default document series UUID |
| `invoice_language` | — | Invoice language (`ro`, `en`, etc.) |
| `payment_term_days` | `30` | Default payment term in days |
| `default_vat_rate` | `21` | Default VAT rate percentage |
| `shipping_vat_rate` | `21` | VAT rate for shipping lines |
| `default_unit` | `buc` | Default unit of measure |
| `shipping_label` | `Shipping` | Label for shipping line items |
| `discount_label` | `Discount` | Label for discount line items |
| `invoice_notes` | — | Default notes on invoices |
| `internal_note_format` | `#{order_number}` | Template for internal notes |
| `webhook_secret` | — | Secret for webhook signature verification |
| `webhook_path` | `storno/webhook` | URL path for the webhook endpoint |
| `webhook_middleware` | `['api']` | Middleware for the webhook route |
| `timeout` | `30` | HTTP request timeout (seconds) |
| `retry.times` | `3` | Number of retry attempts |
| `retry.sleep` | `1000` | Delay between retries (ms) |

---

## API Reference

All methods are available via the `Storno::` facade or by injecting `StornoClient`.

### Companies

```php
$companies = Storno::listCompanies();
```

### Clients

```php
// Create or find a client (idempotent by email/CUI)
$result = Storno::createClient(new Client(
    name: 'Acme SRL',
    type: 'company',       // 'company' or 'individual'
    email: 'billing@acme.ro',
    address: 'Str. Victoriei 1',
    city: 'București',
    county: 'Ilfov',
    country: 'RO',
    postalCode: '012345',
    phone: '+40700000000',
    cui: '12345678',
    vatCode: 'RO12345678',
    isVatPayer: true,
    registrationNumber: 'J40/1234/2020',
    bankName: 'BCR',
    bankAccount: 'RO49AAAA1B31007593840000',
    contactPerson: 'Ion Popescu',
    notes: 'VIP',
));
// Returns: ['client' => [...], 'existing' => bool]

// Get client by ID
$client = Storno::getClient('client-uuid');

// ANAF lookup by CUI
$company = Storno::anafLookup('12345678');
```

### Invoices

```php
// Create invoice
$invoice = Storno::createInvoice(new Invoice(
    clientId: 'client-uuid',
    lines: [...],
    currency: 'RON',             // 'RON', 'EUR', 'USD', etc.
    paymentMethod: 'bank_transfer', // 'bank_transfer'|'cash'|'card'|'cheque'|'other'
    issueDate: '2026-04-04',
    dueDate: '2026-05-04',
    orderNumber: 'ORD-001',
    internalNote: '#ORD-001',
    idempotencyKey: 'unique-key-for-order',
    autoApplyVatRules: true,
    documentSeriesId: 'series-uuid',
    language: 'ro',
    notes: 'Thank you for your business.',
));

// Get invoice
$invoice = Storno::getInvoice('invoice-uuid');

// Issue invoice (draft -> issued)
Storno::issueInvoice('invoice-uuid');

// Submit to e-Factura ANAF
Storno::submitInvoice('invoice-uuid');

// Download PDF (returns raw binary)
$pdfContent = Storno::downloadPdf('invoice-uuid');
file_put_contents('/path/to/invoice.pdf', $pdfContent);
```

### Document Series

```php
$series = Storno::listDocumentSeries();
// Returns array of series with id, name, prefix, nextNumber
```

### VAT Rates

```php
$rates = Storno::listVatRates();
// Returns array of available VAT rates for this company
```

### Webhooks

```php
// Register a webhook
$webhook = Storno::createWebhook(
    url: 'https://yourapp.com/storno/webhook',
    events: ['invoice.issued', 'invoice.validated', 'invoice.rejected', 'invoice.paid'],
    description: 'My app webhook',
);
// Returns: ['uuid' => '...', 'secret' => '...']
// Save the 'secret' as STORNO_WEBHOOK_SECRET in your .env

// Delete a webhook
Storno::deleteWebhook('webhook-uuid');
```

---

## Webhooks

### Setup

Register a webhook using the Artisan command (recommended):

```bash
php artisan storno:webhook:register
# or with explicit URL:
php artisan storno:webhook:register --url=https://yourapp.com/storno/webhook
```

The command automatically saves the secret to your `.env` file.

The webhook endpoint is registered automatically at `POST /storno/webhook` (configurable via `STORNO_WEBHOOK_PATH`).

### Events

Listen for Storno events in your `EventServiceProvider` or using `#[AsListener]`:

```php
use Storno\Laravel\Events\InvoiceIssued;
use Storno\Laravel\Events\InvoiceValidated;
use Storno\Laravel\Events\InvoiceRejected;
use Storno\Laravel\Events\InvoicePaid;
use Storno\Laravel\Events\WebhookReceived; // fires for every webhook

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen(InvoiceIssued::class, function (InvoiceIssued $event) {
            $invoiceId = $event->payload->data['invoiceId'];
            // Send confirmation email, update order status, etc.
        });

        Event::listen(InvoicePaid::class, function (InvoicePaid $event) {
            // Mark order as paid
        });

        Event::listen(InvoiceRejected::class, function (InvoiceRejected $event) {
            // Handle ANAF rejection — log, notify admin, etc.
        });
    }
}
```

The `WebhookPayload` object has:

```php
$event->payload->event      // e.g. 'invoice.issued'
$event->payload->id         // event UUID
$event->payload->data       // array with invoice data
$event->payload->occurredAt // ISO 8601 timestamp
$event->payload->raw        // full raw payload array
```

### Excluding the webhook route from CSRF

Add the webhook path to your `VerifyCsrfToken` middleware exceptions:

```php
// app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    'storno/webhook',
];
```

---

## Artisan Commands

### Test connection

```bash
php artisan storno:test
```

Verifies the API connection and lists companies on the instance.

### Register webhook

```bash
php artisan storno:webhook:register
php artisan storno:webhook:register --url=https://yourapp.com/storno/webhook
php artisan storno:webhook:register --url=... --events=invoice.issued --events=invoice.paid
php artisan storno:webhook:register --url=... --description="Production webhook"
```

### List document series

```bash
php artisan storno:series
```

Shows all available document series with their ID, prefix, and next number.

---

## Error Handling

```php
use Storno\Laravel\Exceptions\StornoApiException;
use Storno\Laravel\Exceptions\StornoConnectionException;
use Storno\Laravel\Exceptions\InvalidSignatureException;

try {
    $invoice = Storno::createInvoice($dto);
} catch (StornoApiException $e) {
    // HTTP 4xx/5xx from the Storno API
    $statusCode = $e->getStatusCode();   // int
    $body = $e->getResponseBody();       // array
    Log::error('Storno API error', ['status' => $statusCode, 'body' => $body]);
} catch (StornoConnectionException $e) {
    // Network error, timeout, etc.
    Log::error('Storno connection error', ['message' => $e->getMessage()]);
}
```

---

## Dependency Injection

You can inject `StornoClient` directly instead of using the facade:

```php
use Storno\Laravel\StornoClient;

class InvoiceService
{
    public function __construct(private StornoClient $storno) {}

    public function createForOrder(Order $order): array
    {
        return $this->storno->createInvoice(/* ... */);
    }
}
```

---

## Links

- [Storno website](https://storno.ro)
- [Documentation](https://docs.storno.ro)
- [GitHub](https://github.com/stornoro/laravel-storno)
- [Packagist](https://packagist.org/packages/storno/laravel-storno)

---

## License

MIT — see [LICENSE](LICENSE).
