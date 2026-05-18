# Laravel InvoiceXpress

[![Tests](https://github.com/digitaldev-lx/laravel-invoice-express/actions/workflows/tests.yml/badge.svg)](https://github.com/digitaldev-lx/laravel-invoice-express/actions/workflows/tests.yml)
[![Latest Stable Version](https://img.shields.io/packagist/v/digitaldev-lx/laravel-invoice-express.svg)](https://packagist.org/packages/digitaldev-lx/laravel-invoice-express)
[![License](https://img.shields.io/packagist/l/digitaldev-lx/laravel-invoice-express.svg)](LICENSE)
[![PHP Version](https://img.shields.io/packagist/php-v/digitaldev-lx/laravel-invoice-express.svg)](composer.json)

A Laravel package for the **InvoiceXpress API V2** — the Portuguese invoicing platform certified by the Autoridade Tributária (certificate #192). Covers the entire V2 API surface: invoices, simplified invoices, credit notes, debit notes, receipts, estimates (quotes / proformas / fees notes), guides (transport / shipping / devolution / global), purchase orders, clients, items, taxes, sequences, accounts, treasury and SAF-T export.

Built and battle-tested by [Digitaldev](https://digitaldev.pt).

---

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick start](#quick-start)
- [Authentication](#authentication)
- [Resources](#resources)
  - [Clients](#clients)
  - [Items](#items)
  - [Taxes](#taxes)
  - [Sequences](#sequences)
  - [Accounts](#accounts)
  - [Treasury](#treasury)
  - [SAF-T export](#saf-t-export)
  - [Invoices and other invoicing documents](#invoices-and-other-invoicing-documents)
  - [Estimates](#estimates)
  - [Guides](#guides)
  - [Purchase orders](#purchase-orders)
- [Document lifecycle](#document-lifecycle)
- [Generating PDFs](#generating-pdfs)
- [Sending documents by email](#sending-documents-by-email)
- [QR codes](#qr-codes)
- [Recording payments](#recording-payments)
- [Multi-account runtime](#multi-account-runtime)
- [Webhooks](#webhooks)
- [Console commands](#console-commands)
- [Eloquent integration](#eloquent-integration)
- [Events](#events)
- [Exceptions and error handling](#exceptions-and-error-handling)
- [Retry, backoff and rate limiting](#retry-backoff-and-rate-limiting)
- [Logging](#logging)
- [Testing your integration](#testing-your-integration)
- [DTO reference](#dto-reference)
- [Enum reference](#enum-reference)
- [Configuration reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Requirements

- **PHP** 8.4+
- **Laravel** 12.x or 13.x
- An **InvoiceXpress account** with an API key (free trial at <https://www.app.invoicexpress.com/sign_up>)

---

## Installation

Install via Composer:

```bash
composer require digitaldev-lx/laravel-invoice-express
```

The service provider is auto-discovered via Laravel's package discovery.

Publish the configuration file (optional but recommended):

```bash
php artisan vendor:publish --tag=invoiceexpress-config
```

Run the migrations to create the webhook log table:

```bash
php artisan migrate
```

(Optional) Publish translations to customise webhook/error messages:

```bash
php artisan vendor:publish --tag=invoiceexpress-translations
```

---

## Configuration

### Required environment variables

```env
INVOICEEXPRESS_ACCOUNT_NAME=your-account-subdomain
INVOICEEXPRESS_API_KEY=your-api-key
```

- **`INVOICEEXPRESS_ACCOUNT_NAME`** — the subdomain of your account; if your dashboard URL is `https://acme.app.invoicexpress.com/`, this value is `acme`.
- **`INVOICEEXPRESS_API_KEY`** — generate at <https://www.app.invoicexpress.com/users/api>. Treat it like a password.

### Optional environment variables

```env
# HTTP behaviour
INVOICEEXPRESS_TIMEOUT=15
INVOICEEXPRESS_RETRY_TIMES=3
INVOICEEXPRESS_RETRY_BACKOFF_MS=1000
INVOICEEXPRESS_RATE_LIMIT=780
INVOICEEXPRESS_CACHE=redis
INVOICEEXPRESS_LOG=false
INVOICEEXPRESS_LOG_CHANNEL=stack

# Webhooks
INVOICEEXPRESS_WEBHOOKS_ENABLED=true
INVOICEEXPRESS_WEBHOOKS_PREFIX=invoiceexpress/webhooks
INVOICEEXPRESS_WEBHOOK_SECRET=whsec_your_shared_secret
INVOICEEXPRESS_WEBHOOKS_LOG=true

# Two-layer persistence (opt-in)
INVOICEEXPRESS_PERSIST=false
```

See the [configuration reference](#configuration-reference) for what each key does.

---

## Quick start

```php
use DigitaldevLx\LaravelInvoiceExpress\Facades\InvoiceExpress;
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\Client;
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\DocumentItem;
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\Invoice;
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\Tax;
use DigitaldevLx\LaravelInvoiceExpress\Enums\Country;
use DigitaldevLx\LaravelInvoiceExpress\Enums\DocumentType;

// 1. Create or upsert a client
$client = InvoiceExpress::clients()->create(new Client(
    name: 'Acme Lda',
    code: 'ACM-001',
    email: 'finance@acme.pt',
    fiscalId: '500000000',
    address: 'Rua das Flores 1',
    city: 'Lisboa',
    postalCode: '1000-001',
    country: Country::PT,
));

// 2. Create a draft invoice
$invoice = InvoiceExpress::invoices()->create(new Invoice(
    type: DocumentType::Invoice,
    date: '2026-05-01',
    dueDate: '2026-05-31',
    items: [
        new DocumentItem(
            name: 'Consultoria',
            quantity: 4,
            unitPrice: 100.00,
            tax: new Tax(name: 'IVA23', value: 23.0),
        ),
    ],
    client: ['name' => 'Acme Lda', 'fiscal_id' => '500000000'],
));

$invoiceId = (int) $invoice['id'];

// 3. Move it through the lifecycle
InvoiceExpress::invoices()->finalize($invoiceId);

// 4. Generate a PDF and email the customer
$pdfBytes = InvoiceExpress::invoices()->pdf($invoiceId);

InvoiceExpress::invoices()->email($invoiceId, new EmailMessage(
    to: new EmailRecipient(email: 'finance@acme.pt'),
    subject: 'A sua fatura',
    body: 'Em anexo a fatura referente aos serviços prestados.',
));

// 5. Mark as paid when the bank wire arrives
InvoiceExpress::invoices()->payment($invoiceId, new Payment(
    paymentMechanism: PaymentMethod::BankTransfer,
    amount: 492.00,
    paymentDate: '2026-05-15',
));
```

---

## Authentication

InvoiceXpress uses **API key authentication** passed as a query string parameter (`?api_key=…`). The package handles this automatically: every request is built against `https://{account_name}.app.invoicexpress.com/{endpoint}.json?api_key={key}`.

Communication is HTTPS-only. The API key never travels in the body, headers or logs (unless `INVOICEEXPRESS_LOG=true`, in which case make sure your log channel scrubs query strings).

---

## Resources

All resources are accessible via the `InvoiceExpress` facade or by injecting `DigitaldevLx\LaravelInvoiceExpress\InvoiceExpress`. The manager caches resource instances, so `InvoiceExpress::invoices()` always returns the same object during a request.

```php
use DigitaldevLx\LaravelInvoiceExpress\Facades\InvoiceExpress;

InvoiceExpress::clients();        // \Resources\Clients
InvoiceExpress::items();          // \Resources\Items
InvoiceExpress::taxes();          // \Resources\Taxes
InvoiceExpress::sequences();      // \Resources\Sequences
InvoiceExpress::accounts();       // \Resources\Accounts
InvoiceExpress::treasury();       // \Resources\Treasury
InvoiceExpress::saft();           // \Resources\Saft
InvoiceExpress::invoices();       // \Resources\Documents\Invoices
InvoiceExpress::estimates();      // \Resources\Documents\Estimates
InvoiceExpress::guides();         // \Resources\Documents\Guides
InvoiceExpress::purchaseOrders(); // \Resources\Documents\PurchaseOrders
```

### Clients

```php
// List clients (returns the raw API envelope)
$result = InvoiceExpress::clients()->all([
    'page' => 1,
    'per_page' => 30,
]);

// Find by id
$client = InvoiceExpress::clients()->find(42);

// Find by name (case-insensitive, must match exactly)
$client = InvoiceExpress::clients()->findByName('Acme Lda');

// Find by code (your internal code)
$client = InvoiceExpress::clients()->findByCode('ACM-001');

// Create
$client = InvoiceExpress::clients()->create(new Client(
    name: 'Acme Lda',
    fiscalId: '500000000',
    country: Country::PT,
));

// Update
InvoiceExpress::clients()->update($id, ['email' => 'new@acme.pt']);

// List invoices for a single client
$invoices = InvoiceExpress::clients()->invoices($id, ['status' => 'final']);
```

Dispatches `ClientCreated` / `ClientUpdated` events.

### Items

```php
InvoiceExpress::items()->all();
InvoiceExpress::items()->find($id);

InvoiceExpress::items()->create(new Item(
    name: 'Consultoria',
    description: 'Hora de consultoria sénior',
    unitPrice: 100.00,
    unit: 'h',
    taxId: 7,
    taxName: 'IVA23',
    taxRate: 23.0,
));

InvoiceExpress::items()->update($id, ['unit_price' => 125.00]);
InvoiceExpress::items()->delete($id);
```

Dispatches `ItemCreated` / `ItemUpdated` events.

### Taxes

```php
InvoiceExpress::taxes()->all();
InvoiceExpress::taxes()->find($id);
InvoiceExpress::taxes()->create(new Tax(name: 'IVA23', value: 23.0, region: 'PT'));
InvoiceExpress::taxes()->update($id, ['value' => 24.0]);
InvoiceExpress::taxes()->delete($id);
```

The `TaxRegion` enum encodes the three Portuguese tax regions and their default rates:

```php
use DigitaldevLx\LaravelInvoiceExpress\Enums\TaxRegion;

TaxRegion::PtMainland->defaultRates(); // ['normal' => 23.0, 'intermediate' => 13.0, 'reduced' => 6.0]
TaxRegion::Azores->defaultRates();     // ['normal' => 16.0, 'intermediate' => 9.0,  'reduced' => 4.0]
TaxRegion::Madeira->defaultRates();    // ['normal' => 22.0, 'intermediate' => 12.0, 'reduced' => 5.0]
```

For exemptions use the `VatExemptionCode` enum (M01–M99 per Portaria 195/2020) — `VatExemptionCode::M07->description()` returns the legal text.

### Sequences

```php
InvoiceExpress::sequences()->all();
InvoiceExpress::sequences()->find($id);

InvoiceExpress::sequences()->create(new Sequence(
    serie: '2026',
    documentType: 'Invoice',
    currentSequenceNumber: 1,
    defaultSequence: true,
));

InvoiceExpress::sequences()->update($id, ['default_sequence' => true]);

// Make it the active sequence for new documents of that type
InvoiceExpress::sequences()->setCurrent($id);

// Register a series with the AT (after entering the validation code obtained
// from the Portal das Finanças)
InvoiceExpress::sequences()->register($id, 'AAJ23K');
```

### Accounts

The `accounts()` resource maps to the InvoiceXpress *banking accounts* (cash, current account, etc.) used by treasury movements.

```php
InvoiceExpress::accounts()->all();
InvoiceExpress::accounts()->find($id);
InvoiceExpress::accounts()->create(new Account(name: 'Caixa', accountType: 'cash'));
InvoiceExpress::accounts()->update($id, ['name' => 'Caixa 1']);
InvoiceExpress::accounts()->delete($id);
```

### Treasury

```php
InvoiceExpress::treasury()->all(['date_from' => '2026-05-01']);
InvoiceExpress::treasury()->find($id);

InvoiceExpress::treasury()->create(new TreasuryMovement(
    accountId: 1,
    amount: 250.00,
    date: '2026-05-15',
    description: 'Recebimento Acme',
    movementType: 'credit',
    categoryId: 5,
));

InvoiceExpress::treasury()->update($id, ['amount' => 300.0]);
InvoiceExpress::treasury()->delete($id);

// Helpers
InvoiceExpress::treasury()->categories();
InvoiceExpress::treasury()->accounts();
```

### SAF-T export

```php
$xml = InvoiceExpress::saft()->generate(2026, 4); // raw XML for April 2026
file_put_contents(storage_path('saft-2026-04.xml'), $xml);
```

You can also use the `invoiceexpress:saft` console command — see [Console commands](#console-commands).

### Invoices and other invoicing documents

The same `invoices()` resource issues every invoice-shaped document by switching the `DocumentType`. Routing to `invoices.json`, `simplified_invoices.json`, `credit_notes.json`, etc. happens automatically.

| `DocumentType` | Endpoint root | Use case |
|---|---|---|
| `Invoice` | `invoices.json` | Standard invoice |
| `SimplifiedInvoice` | `simplified_invoices.json` | Up to €1000 (€100 for non-companies) |
| `InvoiceReceipt` | `invoice_receipts.json` | Invoice + receipt in a single document |
| `CreditNote` | `credit_notes.json` | Refunds / corrections |
| `DebitNote` | `debit_notes.json` | Additional charges |
| `Receipt` | `receipts.json` | Receipt against a previous invoice |
| `CashInvoice` | `cash_invoices.json` | Paid-on-the-spot invoice |
| `VatMossInvoice` | `vat_moss_invoices.json` | EU VAT MOSS reporting |

```php
InvoiceExpress::invoices()->all(['status' => 'final', 'date_from' => '2026-01-01']);
InvoiceExpress::invoices()->find($id);

// Default type is Invoice
InvoiceExpress::invoices()->create($invoiceDto);

// Override the type to issue a credit note from the same Invoice DTO shape
InvoiceExpress::invoices()->create(
    new Invoice(
        type: DocumentType::CreditNote,
        date: '2026-05-15',
        items: [...],
        client: [...],
    ),
);

// Or pass it explicitly
InvoiceExpress::invoices()->create($invoiceDto, DocumentType::SimplifiedInvoice);

InvoiceExpress::invoices()->update($id, ['observations' => 'Updated note']);
```

### Estimates

The `estimates()` resource targets four document types via `EstimateType`:

| `EstimateType` | Endpoint | Use case |
|---|---|---|
| `Quote` | `quotes.json` | Sales quotes |
| `Proforma` | `proformas.json` | Pro-forma invoices |
| `FeesNote` | `fees_notes.json` | Honorary fees notes |
| `Estimate` | `estimates.json` | Generic estimates |

```php
$quote = InvoiceExpress::estimates()->create(new Estimate(
    type: EstimateType::Quote,
    date: '2026-05-01',
    dueDate: '2026-06-01',
    items: [new DocumentItem(name: 'Hour', unitPrice: 50.0)],
    client: ['name' => 'Acme'],
));

InvoiceExpress::estimates()->all(EstimateType::Proforma, ['status' => 'final']);
InvoiceExpress::estimates()->find(99, EstimateType::Quote);
InvoiceExpress::estimates()->update(99, ['observations' => 'Revised'], EstimateType::Quote);
```

### Guides

The `guides()` resource targets four guide types via `GuideType`:

| `GuideType` | Endpoint | Use case |
|---|---|---|
| `Transport` | `transports.json` | Goods transport (mandatory for AT) |
| `Shipping` | `shippings.json` | Shipping note |
| `Devolution` | `devolutions.json` | Returns / devolutions |
| `Global` | `globals.json` | Global / consolidated guides |

```php
InvoiceExpress::guides()->create(new Guide(
    type: GuideType::Transport,
    date: '2026-05-15',
    loadedAt: '2026-05-15 10:00',
    loadedFrom: 'Lisboa',
    loadedTo: 'Porto',
    vehicleRegistration: '00-AA-00',
    items: [new DocumentItem(name: 'Pallet', quantity: 2)],
    client: ['name' => 'Acme'],
));
```

### Purchase orders

```php
InvoiceExpress::purchaseOrders()->all();
InvoiceExpress::purchaseOrders()->find($id);

InvoiceExpress::purchaseOrders()->create(new PurchaseOrder(
    date: '2026-05-15',
    deliveryDate: '2026-05-25',
    items: [new DocumentItem(name: 'Sourcing', unitPrice: 1000.0)],
    supplier: ['name' => 'Vendor Lda', 'fiscal_id' => '500000001'],
));

InvoiceExpress::purchaseOrders()->update($id, ['delivery_date' => '2026-05-30']);
```

---

## Document lifecycle

Every Document resource (`invoices()`, `estimates()`, `guides()`, `purchaseOrders()`) ships with the same lifecycle methods, sourced from reusable concerns.

```
draft  ─finalize()──▶  final  ─settle()──▶  settled
                       │
                       └─cancel()──▶  canceled
```

### Programmatic state changes

```php
$id = (int) $invoice['id'];

// Specific verb shortcuts (recommended)
InvoiceExpress::invoices()->finalize($id);
InvoiceExpress::invoices()->cancel($id, 'Cliente desistiu');
InvoiceExpress::invoices()->settle($id, 'Pago via TB');

// Or the generic API
InvoiceExpress::invoices()->changeState($id, DocumentState::Final);
```

Each transition dispatches a typed event:

| Transition | Event |
|---|---|
| → Final | `DocumentFinalized` |
| → Settled | `DocumentPaid` |
| → Canceled | `DocumentCanceled` (carries the optional reason) |
| → Deleted | `DocumentDeleted` |

### Related documents

```php
$related = InvoiceExpress::invoices()->relatedDocuments($id);
// ['related_documents' => [['id' => 8, 'type' => 'Receipt'], ...]]
```

---

## Generating PDFs

The InvoiceXpress flow is two-step: first request a temporary PDF URL, then download it. The package exposes both:

```php
// Step 1 only — JSON envelope with a 24-hour pdfUrl
$envelope = InvoiceExpress::invoices()->pdfUrl($id);
$url = $envelope['output']['pdfUrl'];

// Or both steps in one call — returns the binary body
$pdfBytes = InvoiceExpress::invoices()->pdf($id);
file_put_contents(storage_path('invoice.pdf'), $pdfBytes);

// Second copy (carries the "2.ª via" watermark)
$pdfBytes = InvoiceExpress::invoices()->pdf($id, secondCopy: true);
```

`pdf()` dispatches a `PdfGenerated` event with the document type, id and byte size.

---

## Sending documents by email

```php
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\EmailMessage;
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\EmailRecipient;

InvoiceExpress::invoices()->email($id, new EmailMessage(
    to: new EmailRecipient(email: 'finance@acme.pt'),
    subject: 'A sua fatura nº FAC2026/123',
    body: 'Em anexo a fatura referente aos serviços de Maio.',
    cc: new EmailRecipient(email: 'contabilidade@acme.pt'),
    logo: true,
));
```

Dispatches `EmailSent` carrying the message and the API response.

---

## QR codes

Available for documents whose type implements the QR concern (invoices and guides):

```php
$qr = InvoiceExpress::invoices()->qrCode($id);
// ['output' => ['qrCodeUrl' => '...']]

$qr = InvoiceExpress::guides()->qrCode($guideId);
```

---

## Recording payments

```php
use DigitaldevLx\LaravelInvoiceExpress\DataTransferObjects\Payment;
use DigitaldevLx\LaravelInvoiceExpress\Enums\PaymentMethod;

// Register a payment against an invoice
InvoiceExpress::invoices()->payment($id, new Payment(
    paymentMechanism: PaymentMethod::BankTransfer,
    amount: 246.00,
    paymentDate: '2026-05-15',
    observations: 'IBAN PT50…',
));

// Cancel a previously-registered payment
InvoiceExpress::invoices()->cancelPayment($id, $paymentId, note: 'Erro de imputação');
```

`PaymentMethod` enum values follow SAF-T codes:

| Method | Code |
|---|---|
| `Cash` | `NU` |
| `Cheque` | `CH` |
| `BankTransfer` | `TB` |
| `DirectDebit` | `CD` |
| `MultibancoReference` | `MB` |
| `MBWay` | `MW` |
| `CreditCard` | `CC` |
| `PayPal` | `PP` |
| `PromissoryNote` | `LC` |
| `Compensation` | `CS` |
| `Other` | `OU` |

`PaymentReceived` and `PaymentCanceled` events are dispatched.

---

## Multi-account runtime

Switch credentials at runtime — useful when one Laravel app serves multiple billing identities (e.g. a SaaS hosting accounting practices):

```php
$secondCompany = InvoiceExpress::useAccount('outra-empresa', 'api-key-da-outra');

$secondCompany->invoices()->all();
$secondCompany->saft()->generate(2026, 4);

// The default singleton is unchanged
InvoiceExpress::client()->accountName(); // 'your-default-account'
```

`useAccount()` returns a fresh manager bound to a clone of the HTTP client with the new credentials. Resource caches are isolated per clone, so events still fire correctly.

---

## Webhooks

InvoiceXpress can push notifications when invoices are issued, finalised, paid or cancelled. The package registers the receiving endpoint for you.

### 1. Enable the receiver

```env
INVOICEEXPRESS_WEBHOOKS_ENABLED=true
INVOICEEXPRESS_WEBHOOKS_PREFIX=invoiceexpress/webhooks
INVOICEEXPRESS_WEBHOOK_SECRET=whsec_a_long_random_string
INVOICEEXPRESS_WEBHOOKS_LOG=true
```

The route becomes `POST https://your.app/invoiceexpress/webhooks` (the route name is `invoiceexpress.webhooks.handle`). Default middleware is `['api']`; override via `config('invoiceexpress.webhooks.route_middleware')`.

### 2. Sign the payload

Either configure InvoiceXpress to send `X-InvoiceXpress-Signature: <hmac>` (where `<hmac>` is the hex-encoded HMAC-SHA256 of the raw body keyed with your secret), or place a reverse proxy that adds the signature for you.

If `INVOICEEXPRESS_WEBHOOK_SECRET` is unset, signature verification is skipped (a warning is logged) — useful for local dev with `expose`/`ngrok`.

### 3. React to events

```php
use DigitaldevLx\LaravelInvoiceExpress\Events\DocumentPaid;
use DigitaldevLx\LaravelInvoiceExpress\Events\WebhookReceived;

class HandlePaidInvoice
{
    public function handle(DocumentPaid $event): void
    {
        $documentId = $event->documentId;
        $type = $event->type;
        $payload = $event->data;
        // sync your Order, send a thank-you email, etc.
    }
}

// Or listen to everything generically:
class LogWebhook
{
    public function handle(WebhookReceived $event): void
    {
        Log::info('InvoiceXpress webhook', $event->payload->toArray());
    }
}
```

### 4. Audit log

When `INVOICEEXPRESS_WEBHOOKS_LOG=true` (default), every received payload is persisted to `invoice_express_webhook_logs`:

```php
use DigitaldevLx\LaravelInvoiceExpress\Models\InvoiceExpressWebhookLog;

$lastFinalized = InvoiceExpressWebhookLog::query()
    ->where('event', 'document.finalized')
    ->latest('received_at')
    ->first();
```

---

## Console commands

```bash
# Smoke-test the API key
php artisan invoiceexpress:test-connection
php artisan invoiceexpress:test-connection --account=other --key=other-api-key

# Tabular dump of all sequences
php artisan invoiceexpress:sync-sequences

# Generate a SAF-T XML for a given period
php artisan invoiceexpress:saft --year=2026 --month=4 --out=storage/saft.xml
```

All commands accept `--account=` and `--key=` for ad-hoc multi-account use.

---

## Eloquent integration

For applications where each domain row (Order, Subscription, …) maps to a single InvoiceXpress invoice, use the trait shortcut:

```php
use DigitaldevLx\LaravelInvoiceExpress\Concerns\HasInvoiceExpressDocuments;

final class Order extends Model
{
    use HasInvoiceExpressDocuments;
}
```

Add the columns:

```php
// database/migrations/.._add_invoiceexpress_to_orders.php
$table->unsignedBigInteger('invoiceexpress_document_id')->nullable()->index();
$table->string('invoiceexpress_document_type')->nullable();
$table->string('invoiceexpress_state')->nullable();
$table->string('invoiceexpress_account_name')->nullable();
```

Use:

```php
$order = Order::find(1);

$order->createInvoiceXpressInvoice($invoiceDto);
$order->finalizeInvoiceXpress();
$order->emailInvoiceXpress($emailMessage);
$order->settleInvoiceXpress(new Payment(
    paymentMechanism: PaymentMethod::BankTransfer,
    amount: $order->total,
    paymentDate: now()->toDateString(),
));
$order->cancelInvoiceXpress('Customer refunded');

$pdf = $order->downloadInvoiceXpressPdf();

// Predicates
$order->invoiceXpressDocumentId();   // ?int
$order->invoiceXpressIsFinalized();  // bool
$order->invoiceXpressIsPaid();
$order->invoiceXpressIsCanceled();
```

---

## Events

Subscribe in your `EventServiceProvider` (or rely on event auto-discovery in Laravel 11+):

| Event | Fires when |
|---|---|
| `ClientCreated`, `ClientUpdated` | Client mutated through the API |
| `ItemCreated`, `ItemUpdated` | Item mutated through the API |
| `DocumentCreated` | A draft document is issued |
| `DocumentFinalized` | A document is finalised |
| `DocumentPaid` | A document is settled |
| `DocumentCanceled` | A document is canceled |
| `DocumentDeleted` | A document is deleted |
| `EmailSent` | A document was emailed |
| `PdfGenerated` | A PDF body was downloaded |
| `PaymentReceived` | A payment was registered |
| `PaymentCanceled` | A payment was canceled |
| `WebhookReceived` | A signed webhook was received |
| `WebhookSignatureFailed` | A webhook with a bad signature was rejected |

Each event is a `final readonly` class; properties are public and immutable.

---

## Exceptions and error handling

The exception hierarchy is granular so you can branch on the specific failure:

```
RuntimeException
└── InvoiceExpressException                 (base — catch this for "any failure")
    ├── AuthenticationException             (HTTP 401, exposes accountName)
    ├── BadRequestException                 (HTTP 400)
    ├── ValidationException                 (HTTP 422 — exposes field-level errors)
    ├── NotFoundException                   (HTTP 404 — exposes resource + id)
    ├── RateLimitException                  (HTTP 429 — exposes retryAfter)
    ├── ServerException                     (HTTP 5xx)
    ├── UnknownEndpointException            (developer error: missing attribute)
    └── WebhookException                    (invalid signature / malformed payload)
```

Example:

```php
use DigitaldevLx\LaravelInvoiceExpress\Exceptions\RateLimitException;
use DigitaldevLx\LaravelInvoiceExpress\Exceptions\ValidationException;

try {
    InvoiceExpress::invoices()->create($dto);
} catch (ValidationException $e) {
    foreach ($e->getFieldErrors() as $field => $message) {
        logger()->warning("InvoiceXpress validation: {$field} — {$message}");
    }
} catch (RateLimitException $e) {
    sleep($e->retryAfter); // or release the queued job with a delay
}
```

---

## Retry, backoff and rate limiting

InvoiceXpress allows **780 requests per minute per account**.

The HTTP client retries `429`/`5xx`/connection failures using `Http::retry()` with exponential backoff (1s → 2s → 4s by default). Knobs:

```env
INVOICEEXPRESS_RETRY_TIMES=3        # 0 disables retry
INVOICEEXPRESS_RETRY_BACKOFF_MS=1000
```

If you set `INVOICEEXPRESS_CACHE=redis` (or any cache store), the client also throttles **preventively**: it raises `RateLimitException` locally once 95% of the per-minute quota is reached, so queued jobs back off cleanly before InvoiceXpress 429s you.

```php
use DigitaldevLx\LaravelInvoiceExpress\Exceptions\RateLimitException;

try {
    InvoiceExpress::invoices()->all();
} catch (RateLimitException $e) {
    $this->release($e->retryAfter); // queueable job back-off
}
```

---

## Logging

```env
INVOICEEXPRESS_LOG=true
INVOICEEXPRESS_LOG_CHANNEL=stack
```

When enabled, every request logs `method`, `endpoint` and `status` to the chosen Laravel log channel at `debug` level. The API key is **not** included in the log payload, but it is part of the URL — make sure your log channel does not echo full URLs verbatim.

---

## Testing your integration

The package itself uses `Http::fake()`. Your application can do the same:

```php
use Illuminate\Support\Facades\Http;
use DigitaldevLx\LaravelInvoiceExpress\Facades\InvoiceExpress;

it('creates an invoice on the API', function (): void {
    Http::fake([
        '*invoicexpress.com/invoices.json*' => Http::response([
            'invoice' => ['id' => 99, 'status' => 'draft'],
        ], 201),
    ]);

    $result = InvoiceExpress::invoices()->create($invoiceDto);

    expect($result['id'])->toBe(99);
    Http::assertSent(fn ($request) => $request->method() === 'POST'
        && str_contains($request->url(), '/invoices.json'));
});
```

To assert events:

```php
use Illuminate\Support\Facades\Event;
use DigitaldevLx\LaravelInvoiceExpress\Events\DocumentCreated;

Event::fake();

InvoiceExpress::invoices()->create($invoiceDto);

Event::assertDispatched(DocumentCreated::class);
```

For webhooks, `postJson()` against `/invoiceexpress/webhooks` with a valid `X-InvoiceXpress-Signature` header — see `tests/Feature/WebhookControllerTest.php` for a worked example.

---

## DTO reference

All DTOs are `final readonly class` and implement a `toArray()` / `fromArray()` contract.

| DTO | Purpose |
|---|---|
| `Address` | Postal address with optional `Country` enum |
| `Client` | Customer profile (name, fiscal id, contacts, language) |
| `Item` | Catalogue item (name, unit price, unit, tax) |
| `Tax` | Tax definition (name, rate, region, exemption) |
| `Sequence` | Document numbering sequence |
| `Account` | Banking account (cash, current account, …) |
| `DocumentItem` | Line item inside a document |
| `Invoice` | Invoice / credit note / debit note / receipt body |
| `Estimate` | Quote / proforma / fees note body |
| `Guide` | Transport / shipping / devolution / global guide |
| `PurchaseOrder` | Purchase order body |
| `Payment` | Payment record (mechanism, amount, date) |
| `TreasuryMovement` | Treasury debit/credit movement |
| `EmailRecipient` | Email address + optional name |
| `EmailMessage` | Subject, body, recipients, logo flag |
| `WebhookPayload` | Decoded webhook event |

All DTOs accept either typed enums or their raw string equivalents to keep the call sites flexible.

---

## Enum reference

| Enum | Notable methods |
|---|---|
| `DocumentType` | `endpointRoot()`, `label()`, `isInvoiceLike()`, `isEstimate()`, `isGuide()`, `supportsQrCode()`, `supportsPayment()` |
| `DocumentState` | `apiAction()`, `isTerminal()`, `label()` |
| `EstimateType` | `payloadKey()`, `endpointPath()` |
| `GuideType` | `payloadKey()`, `endpointPath()` |
| `Country` | `isPortugal()`, `isEU()` |
| `Currency` | `symbol()` |
| `Language` | `label()` |
| `PaymentMethod` | `code()` (SAF-T abbreviation), `label()` |
| `VatExemptionCode` | `description()` (Portuguese legal text) |
| `TaxRegion` | `label()`, `defaultRates()` |
| `WebhookEvent` | `isLifecycle()` |

---

## Configuration reference

The published `config/invoiceexpress.php` exposes:

| Key | Type | Default | Description |
|---|---|---|---|
| `account_name` | string | env | Subdomain of your InvoiceXpress account |
| `api_key` | string | env | API key (treat like a password) |
| `timeout` | int | `15` | Request timeout in seconds |
| `retry.times` | int | `3` | Retry attempts on 429/5xx (`0` disables) |
| `retry.backoff_ms` | int | `1000` | Base backoff in ms (exponential thereafter) |
| `retry.on_status` | int[] | `[429,500,502,503,504]` | Status codes to retry |
| `rate_limit` | int | `780` | Per-account/minute quota used by the preventive throttler |
| `cache_store` | string\|null | env | Cache store for the throttler (omit to disable) |
| `log_requests` | bool | `false` | Log every request at debug level |
| `log_channel` | string | `stack` | Laravel log channel for request logs |
| `webhooks.enabled` | bool | `true` | Register the webhook route |
| `webhooks.route_prefix` | string | `invoiceexpress/webhooks` | Path prefix |
| `webhooks.route_middleware` | array | `['api']` | Middleware applied to the route |
| `webhooks.signing_secret` | string\|null | env | Shared secret for HMAC-SHA256 verification |
| `webhooks.log_payloads` | bool | `true` | Persist every payload to `invoice_express_webhook_logs` |
| `persistence.enabled` | bool | `false` | Reserved for future two-layer Eloquent sync |
| `persistence.tables.*` | array<string,string> | (defaults) | Override table names if you have collisions |

---

## Troubleshooting

**`AuthenticationException: Authentication failed`** — confirm `INVOICEEXPRESS_ACCOUNT_NAME` and `INVOICEEXPRESS_API_KEY`. Run `php artisan invoiceexpress:test-connection` to isolate the problem.

**`NotFoundException` for an existing document** — InvoiceXpress sometimes lags on indexing newly-created documents. Add a small retry, or look up via `find()` instead of `findByCode()`.

**`ValidationException` on create** — call `$e->getFieldErrors()` to list the offending fields. The most common culprits are missing `client.name`/`client.fiscal_id` and unknown `tax_exemption` codes (use the `VatExemptionCode` enum).

**Webhook returns 500 with "Invalid InvoiceXpress webhook signature"** — the signing secret on your side does not match what InvoiceXpress (or your reverse proxy) signs with. Set `INVOICEEXPRESS_WEBHOOK_SECRET` to an empty value temporarily to bypass verification while you investigate.

**Tests can't load `invoice_express_webhook_logs`** — the package migration ships under `database/migrations`. In Orchestra Testbench, call `loadMigrationsFrom(__DIR__.'/../database/migrations')` from your test case (the package's own `TestCase` does this).

**SAF-T command outputs nothing** — InvoiceXpress requires the period to be already finalised on its side. Try a past month with at least one finalised invoice.

---

## Contributing

Pull requests are welcome. Before opening one:

```bash
composer format          # Pint
composer analyse         # PHPStan level 6
composer test            # Pest
```

CI runs the same checks against PHP 8.4 with Laravel 12 and 13.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Security

If you find a security issue, please do **not** open a public issue. Email `geral@digitaldev.pt` with the details and we'll respond within 48 hours.

---

## License

MIT © [DigitalDev](https://digitaldev.pt). See [LICENSE](LICENSE).
