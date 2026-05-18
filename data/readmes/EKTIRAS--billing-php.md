# ektiras/billing-php

Official Laravel SDK for the **EKTIR Billing API** — issue Greek myDATA‑compliant
receipts, invoices and credit notes, manage products, track EU OSS sales,
await PDFs, and react to document state changes through Laravel events.

- Requires PHP 8.2+, Laravel 11 or 12.
- Talks to `https://billing.ektir.gr/api/v1` (override per-env).
- Async‑aware: ships a poller + events so your code reacts when myDATA
  submission completes and the PDF becomes downloadable.

### What's new in v0.5.0

- **Greek tax-office on the customer DTO** — `Customer::$doy`. Required
  for B2B invoices to GR-VAT counterparts; v0.4.0 silently dropped it.
- **Delivery notes (myDATA 9.3) + simplified invoices (1.6)** — builder
  shorthand `->deliveryNote()->delivery(startedAt, address, plate)` and
  `->simplified()` flag.
- **`->sendEmail()` re-enabled** — opt the server into mailing the PDF
  after MARK arrives (was prohibited under the v0.4.0 server).
- **`Documents::email($id, force?)`** — re-send endpoint.
- **`Documents::pdf($id)`** — bearer-authenticated PDF download. The
  legacy public signed URL flow is removed for security; `pdfBytes()`
  now uses the new endpoint with a v0.4.x fallback.
- **`Reports::ossQuarterly($year, $quarter)`** — backs the ΦΠΑ-ΟΣΣ
  quarterly return.
- **Webhook v2 signatures** —
  `WebhookSignature::verifyV2(body, header, secret, timestampMs)`
  enforces a 5-minute freshness window for replay rejection. Server
  also emits the `document.confirmed` event (+ matching SDK class).
- **Document DTO new fields** — `$isSimplified`, `$delivery*`,
  `$issuingSoftwareVersion`, `$sendEmailRequested`, `$emailedAt`,
  `$provisionalPdfPath`, `$vies*`, `$customerDoy`, plus
  `isProvisional()` / `hasPdfArtifact()` helpers.

### Previously, in v0.4.0

- **Real server webhooks** — `Billing::webhooks()->create([...])` + HMAC-SHA256
  signature verification helper. Replaces the polling fallback for apps
  that can receive inbound HTTP. See [§11](#11-webhooks).
- **Sandbox / test-mode keys** — issue a key with `--mode=test` to exercise
  the full issuance / webhook / PDF pipeline without filing real invoices
  with myDATA. Every response carries `X-Ektir-Mode`.
- **`products()->delete($id)`** — hard-delete; catches `ProductReferencedException`
  (409) when items still reference the product, so you can fall back to
  `toggle()`.
- **System endpoints** — `Billing::system()->health()`, `->info()`, `->me()`
  for uptime monitoring, version discovery, and reading your own
  rate-limit counters.
- **OpenAPI 3.1 spec** served at `/docs/api.json` (+ a rendered viewer at
  `/docs/api`). Use it to generate clients in JS/Python/Go.

Full details in [CHANGELOG.md](CHANGELOG.md).

---

## Contents

1. [Install & configure](#1-install--configure)
2. [Quick start](#2-quick-start)
3. [Authentication, keys & multi‑tenant apps](#3-authentication-keys--multi-tenant-apps)
4. [Issuing documents by country (receipt vs invoice)](#4-issuing-documents-by-country-receipt-vs-invoice)
5. [The async pipeline: myDATA → PDF → email](#5-the-async-pipeline-mydata--pdf--email)
6. [PDFs — awaiting, downloading, storing](#6-pdfs--awaiting-downloading-storing)
7. [Listing & filtering documents](#7-listing--filtering-documents)
8. [Cancelling (and the auto credit note)](#8-cancelling-and-the-auto-credit-note)
9. [Products — create, update, toggle, delete](#9-products--create-update-toggle-delete)
10. [EU OSS stats](#10-eu-oss-stats)
11. [Webhooks](#11-webhooks)
12. [Middleware patterns](#12-middleware-patterns)
13. [Error handling](#13-error-handling)
14. [Rate limits & retries](#14-rate-limits--retries)
15. [Testing your integration](#15-testing-your-integration)
16. [Reference — every endpoint](#16-reference--every-endpoint)

---

## 1. Install & configure

### From GitHub (recommended while pre-Packagist)

Add the VCS repository to your app's `composer.json`:

```json
{
  "repositories": [
    { "type": "vcs", "url": "https://github.com/EKTIRAS/billing-php" }
  ],
  "require": {
    "ektiras/billing-php": "^0.4"
  }
}
```

Then:

```bash
composer update ektiras/billing-php
```

### From a local checkout (monorepo / development)

```json
{
  "repositories": [
    { "type": "path", "url": "../ektir-billing/packages/ektir/billing-php" }
  ],
  "require": {
    "ektiras/billing-php": "*"
  }
}
```

Once the package is on Packagist, plain `composer require ektiras/billing-php`
is enough.

Publish the config:

```bash
php artisan vendor:publish --tag=ektir-billing-config
```

Add to `.env`:

```env
EKTIR_BILLING_URL=https://billing.ektir.gr/api/v1
EKTIR_BILLING_API_KEY=sk_live_...
EKTIR_BILLING_TIMEOUT=15
# Turn on the polling routine (see §11) once you have a DocumentTracker
EKTIR_BILLING_POLLER_ENABLED=false
```

---

## 2. Quick start

```php
use Ektir\Billing\DTO\Customer;
use Ektir\Billing\Facades\EktirBilling as Billing;

$customer = new Customer(
    email: 'anna@example.gr',
    country: 'GR',
    name: 'Anna Papadopoulou',
);

$doc = Billing::documents()->build()
    ->receipt()
    ->forCustomer($customer)
    ->addItem('SKU-BOOK-01', 1, 19.90)
    ->payCard()
    ->create();

// $doc->id, ->fullNumber, ->totalAmount are populated immediately
// ->mark, ->pdfUrl are null until the async pipeline finishes (see §5)
```

**The SDK does not send email on your behalf.** Fetch the PDF when it's
ready and mail it from your own app — that way the message comes from
your domain, with your branding, via your deliverability stack.

```php
// Block until ready (OK for sync flows / queued jobs):
$ready = Billing::documents()->awaitPdf($doc->id, timeoutSeconds: 120);

// Option A — share a link (valid 24h):
$link = Billing::documents()->pdfUrl($ready->id);
Mail::to($customer->email)->send(new InvoiceReadyMail($doc, $link));

// Option B — attach the bytes to your own Mailable:
// (inside your Mailable->attachments())
return [Billing::documents()->pdfAttachment($ready->id, 'invoice.pdf')];

// Option C — download and keep a copy:
$path = Billing::documents()->downloadPdf($ready->id, disk: 's3');
```

For async flows (issue now, mail later when the pipeline finishes)
listen to the `DocumentPdfReady` event — see §11.

---

## 3. Authentication, keys & multi‑tenant apps

The API authenticates with a **Bearer** token. The server stores the SHA‑256
hash of the key, so the plaintext value is shown only at issuance time. Each
key is bound to a single company + source code — everything your key does is
scoped to that pair.

The default key comes from `config('billing.api_key')` /
`EKTIR_BILLING_API_KEY`. For multi‑tenant SaaS apps where different tenants
have different EKTIR companies, use `withApiKey()` on a per‑request basis:

```php
$tenantBilling = Billing::withApiKey($tenant->ektir_api_key);
$tenantBilling->documents()->list();
```

`withApiKey` returns a new, isolated client — it does not mutate the singleton.

---

## 4. Issuing documents by country (receipt vs invoice)

The API applies Greek tax rules automatically, but **your choice of document
type and the fields you send matter**. Rules the VAT engine uses:

| Customer situation                              | Resulting VAT       | Document type        |
|-------------------------------------------------|---------------------|----------------------|
| Customer in Greece (`country: 'GR'`)            | Greek 24 %          | Whatever you chose   |
| EU B2B with valid VIES VAT number               | Reverse charge, 0 % | **Forced to invoice**|
| EU B2C under the €10k OSS threshold             | Greek 24 %          | Receipt or invoice   |
| EU B2C over the threshold                       | Destination rate    | Receipt or invoice   |
| Non‑EU                                          | Zero‑rated export   | Receipt or invoice   |

The builder makes the three common shapes explicit:

### 4.1 Greek B2C receipt

```php
$doc = Billing::documents()->build()
    ->receipt()
    ->forCustomer(new Customer(email: 'anna@example.gr', country: 'GR'))
    ->addItem('SKU-TSHIRT', 2, 15.00)
    ->payCard()
    ->create();
```

> **Important:** a *receipt* cannot mix goods and services in the same cart.
> The API returns `422 validation_failed` with message
> *"Cannot mix goods and services in a receipt."* Split into two receipts or
> issue an invoice instead.

### 4.2 EU B2B invoice (reverse charge)

```php
$doc = Billing::documents()->build()
    ->invoice()
    ->forCustomer(new Customer(
        email: 'billing@acme.de',
        country: 'DE',
        vatNumber: 'DE123456789',
        company: 'Acme GmbH',
    ))
    ->addItem('SKU-CONSULTING', 10, 80.00)
    ->payTransfer()
    ->paymentTermsDays(30)
    ->create();

// $doc->vatType === VatType::EuReverse, ->vatRate === 0.0
```

The API validates the VAT number live against **VIES** before issuing. If
VIES is unreachable or returns invalid, the document falls back to OSS
rules (see §4.3).

### 4.3 EU B2C over OSS threshold (destination VAT)

```php
$doc = Billing::documents()->build()
    ->receipt()
    ->forCustomer(new Customer(email: 'tom@example.fr', country: 'FR'))
    ->addItem('SKU-PDF-GUIDE', 1, 9.90)
    ->payCard()
    ->create();

// If YTD EU sales < €10k   → vatType=greek,   rate=24
// If YTD EU sales >= €10k  → vatType=eu_local, rate=20 (FR)
```

The threshold and the YTD total per country can be read via
[`Billing::stats()->euTotal()`](#10-eu-oss-stats).

### 4.4 Non‑EU (export)

```php
$doc = Billing::documents()->build()
    ->invoice()
    ->forCustomer(new Customer(email: 'hello@example.com', country: 'US'))
    ->addItem('SKU-BOOK-01', 5, 20.00)
    ->payCard()
    ->create();

// $doc->vatType === VatType::Zero, ->vatRate === 0.0
```

---

## 5. The async pipeline: myDATA → PDF

When `POST /documents` returns **201**, the document exists in the database
but **nothing has been sent to myDATA or rendered** yet. Two queued jobs
run in sequence server‑side:

```
POST /documents → 201 (status=pending, mark=null, pdf_url=null)
       │
       ├─► SubmitToMyData   → status becomes "submitted" (or "failed"/"offline"),
       │                       mark/uid/qr_url populated
       │
       └─► GenerateDocumentPdf → pdf_url populated (signed 24h URL)
```

Delivery to the customer is **your job** — the billing server deliberately
doesn't send email on your behalf. See §6 and §11 for patterns.

**Retry policy** (server‑side):

| Job               | Attempts | Backoff                    |
|-------------------|----------|----------------------------|
| SubmitToMyData    | 4        | 60s, 5m, 15m, 1h           |
| GenerateDocumentPdf | 2      | default                    |

So the worst realistic case for a pending document to reach `submitted` is
about 80 minutes. Pending docs older than that are almost certainly stuck —
the server logs an admin alert and the doc's status becomes `failed` or
`offline`.

**What that means for your code**: never assume `pdfUrl`, `mark`, or QR are
set directly after `create()`. Use `awaitPdf()` for short blocking flows,
or the poller + events for long‑lived apps (§11).

---

## 6. PDFs — awaiting, downloading, storing

The API produces a single PDF per document — bilingual (Greek + English) with
a scannable QR code linking to the myDATA receipt. The URL is
**signed** and valid for 24 hours from the moment the document is fetched.
Re‑`find($id)` to refresh the signature.

### 6.1 Blocking await (scripts, CLI, queued jobs)

```php
$doc = Billing::documents()->build()->receipt()->…->create();

// Wait up to 120s for the PDF to become available:
$ready = Billing::documents()->awaitPdf($doc->id, timeoutSeconds: 120);

if ($ready->hasPdf()) {
    $bytes = Billing::documents()->pdfBytes($ready->id);
    file_put_contents('/tmp/invoice.pdf', $bytes);
}
```

On timeout you get a `TimeoutException`; on myDATA failure the await returns
with `myDataStatus = failed` and `hasPdf() === false` — check both.

### 6.2 Download straight to a Laravel disk

```php
$path = Billing::documents()->downloadPdf(
    id: 123,
    disk: 's3',                       // or any disk; defaults to config
    path: 'customers/42/invoices',    // defaults to config
);
// $path = 'customers/42/invoices/Α_2026_00001.pdf'
```

Unsafe characters in `full_number` (Greek letters, slashes) are sanitised
into the filename.

### 6.3 Email the PDF from your own Mailable

The billing server deliberately does **not** send email to your customers.
You're expected to send the message yourself so it comes from your domain,
with your branding, via your mail provider. The SDK gives you two one-liners
for this.

**Attach the PDF to a Laravel Mailable.** `pdfAttachment()` returns an
`Illuminate\Mail\Attachment` that fetches bytes lazily (only when Laravel
renders the mail), so it's cheap to build:

```php
use Ektir\Billing\DTO\Document;
use Ektir\Billing\Facades\EktirBilling as Billing;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class InvoiceIssuedMail extends \Illuminate\Mail\Mailable
{
    public function __construct(public Document $doc) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Your receipt {$this->doc->fullNumber}");
    }

    public function content(): Content
    {
        return new Content(view: 'mail.invoice-issued', with: ['doc' => $this->doc]);
    }

    public function attachments(): array
    {
        return [
            Billing::documents()->pdfAttachment(
                $this->doc->id,
                filename: "{$this->doc->fullNumber}.pdf",
            ),
        ];
    }
}

// …somewhere in your app:
Mail::to($customer->email)->send(new InvoiceIssuedMail($doc));
```

**Or just send a link.** `pdfUrl()` returns a freshly-signed 24h URL —
stick it in your email body and skip the attachment entirely:

```php
$link = Billing::documents()->pdfUrl($doc->id);

Mail::to($customer->email)->send(new InvoiceIssuedMail($doc, $link));
```

The signed URL expires in 24 h; if you need a durable link, proxy it
through a route in your own app (see §6.4) and issue fresh signatures
on demand.

### 6.4 Stream the PDF back to a user's browser

Do **not** send the EKTIR URL to the browser directly — it expires in 24h
and re‑generating it on the server is cheap. Proxy it through your own
controller:

```php
use Ektir\Billing\Facades\EktirBilling as Billing;

Route::get('/invoices/{id}/pdf', function (int $id) {
    $bytes = Billing::documents()->pdfBytes($id); // re-fetches signed URL
    return response($bytes, 200, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="invoice.pdf"',
    ]);
})->middleware(['auth']);
```

### 6.5 What if the PDF never arrives?

Documents stuck in `pending` past the max retry window (about 80 minutes)
get moved to `failed` or `offline` by the server. `awaitPdf()` treats
`failed` as "stop waiting"; `offline` is treated as still pending because
the server's retry scheduler (`ektir:mydata:retry-offline`) will sweep it
later in the day. If you need to give up on `offline` too, pass a custom
predicate to `await()`:

```php
use Ektir\Billing\Enums\MyDataStatus;

$doc = Billing::documents()->await(
    $id,
    until: fn ($d) => $d->myDataStatus !== MyDataStatus::Pending,
    timeoutSeconds: 300,
);
```

---

## 7. Listing & filtering documents

```php
$page = Billing::documents()->list([
    'type'             => 'invoice',
    'status'           => 'submitted',
    'country'          => 'DE',
    'from'             => '2026-01-01',
    'to'               => '2026-03-31',
    'mark'             => '400009999',         // exact match
    'full_number'      => 'Α/2026',             // partial match
    'customer_email'   => 'acme',              // partial match
    'customer_company' => 'Acme',              // partial match
    'source'           => 'web_shop',          // exact match
    'page'             => 1,
    'per_page'         => 50,                   // max 100
]);

foreach ($page['data'] as $doc) {
    echo $doc->fullNumber.' → '.$doc->totalAmount.' EUR'.PHP_EOL;

    // Line items are included on GET — handy for reconciliation
    foreach ($doc->items as $item) {
        echo "  {$item->quantity}× {$item->productCode} @ {$item->unitPrice}".PHP_EOL;
    }
}

$meta = $page['meta'];  // current_page, last_page, total, ...
```

---

## 8. Cancelling (and the auto credit note)

The API does **not** delete anything — cancelling an invoice round‑trips
through myDATA's `CancelInvoice` and then **auto‑issues a matching credit
note** that is also stamped with its own ΜΑΡΚ.

```php
$result = Billing::documents()->cancel(id: 123, reason: 'Customer changed their mind');

// [
//   'id'             => 123,
//   'cancel_mark'    => '400001202604190001234',
//   'cancelled_at'   => '2026-04-19T10:12:31+02:00',
//   'credit_note_id' => 124,
// ]

$creditNote = Billing::documents()->find($result['credit_note_id']);
// Will go through the same async pipeline → its own PDF, its own email.
```

`cancel()` throws `CancelForbiddenException` (422) when the original doc
has no ΜΑΡΚ yet (still pending submission), is already cancelled, or
myDATA rejected the cancellation.

### 8.1 Regenerating a PDF

If the stored PDF is stale (you tweaked the template, the QR rendering
got upgraded, the original generation was flaky) call
`regeneratePdf()` to force the server to re-render. The server nulls
`pdf_path`, deletes the existing PDF from disk, and re-dispatches the
generation job:

```php
$doc = Billing::documents()->regeneratePdf(123);
// $doc->pdfUrl === null  — job is queued; poll or await as usual
$ready = Billing::documents()->awaitPdf(123);
```

Only allowed for `submitted` documents. Calling on `pending` / `failed` /
`offline` returns 422 — there's no legally-valid PDF to regenerate for
those states.

---

## 9. Products — create, update, toggle, delete

Products are the catalogue your line items reference via `product_code`.
The server validates that each `product_code` in a document's items exists
for your company+source and is active; an unknown or inactive code → 422.

```php
$product = Billing::products()->create([
    'code'         => 'SKU-BOOK-01',
    'name_el'      => 'Βιβλίο για Ελλάδα',
    'name_en'      => 'Book for Greece',
    'type'         => 'goods',      // goods | service
    'vat_category' => 1,            // 1=24%, 2=13%, 3=6%, 7=0%
    'vat_rate'     => 24.0,
    'e3_code'      => '561',        // Greek E3 tax form code
    'mydata_type'  => '1.1',        // 1.1|5.1|11.1|11.2|11.4
    'source'       => 'web_shop',
]);

$updated = Billing::products()->update($product->id, [
    'name_en' => 'Updated Book for Greece',
    'vat_rate' => 13.0,
    'vat_category' => 2,
]);

$toggled = Billing::products()->toggle($product->id);   // active ↔ inactive
```

Hard-delete a product that has never been used in any document:

```php
use Ektir\Billing\Exceptions\ProductReferencedException;

try {
    Billing::products()->delete($product->id);
} catch (ProductReferencedException $e) {
    // 409 — existing line items still reference this product.
    // Existing receipts must keep their product relation intact (Greek
    // tax law N.4308/2014: line items are append-only). Deactivate
    // instead of deleting:
    Billing::products()->toggle($product->id);
    Log::info("Deactivated {$product->code}: {$e->referencedBy()} docs use it.");
}
```

Listing returns only **active** products by default; pass
`includeInactive: true` to see disabled ones (useful for admin UIs):

```php
foreach (Billing::products()->list() as $p) {
    echo "{$p->code}: {$p->nameEn} ({$p->vatRate}%)".PHP_EOL;
}

foreach (Billing::products()->list(includeInactive: true) as $p) {
    echo ($p->active ? '[ON] ' : '[OFF] ').$p->code.PHP_EOL;
}
```

> **Multi‑tenant tip:** each API key is pinned to one `source` code. Products
> are unique per company+source, so the same `code` can legitimately exist in
> different sources owned by the same company.

---

## 10. EU OSS stats

Shows how close you are to the €10k threshold that flips OSS rules on.

```php
$stats = Billing::stats()->euTotal(year: 2026);

echo "YTD EU net sales: €{$stats->totalNet} / €{$stats->threshold}".PHP_EOL;

if ($stats->alertTriggered) {
    // 80% by default — warn the accountant
}

foreach ($stats->breakdownByCountry as $iso => $net) {
    echo "  {$iso}: €{$net}".PHP_EOL;
}
```

Surface this in your dashboard to let the accountant pre‑empt the threshold
flip (which switches from 24 % Greek VAT to the destination country's rate
for every new EU B2C sale).

### 10.1 Monthly revenue by source

`stats()->monthly()` returns the same data the web dashboard chart uses —
12 months trailing by default, broken down by source code:

```php
$m = Billing::stats()->monthly();       // last 12 months
$m = Billing::stats()->monthly(months: 24);   // last 24 months (max 36)

$m->months;              // ['2025-05', '2025-06', …, '2026-04']  (oldest→newest)
$m->bySource;            // ['web_shop' => [0, 120, 340, …], 'pos' => [..]]
$m->totalsBySource;      // ['web_shop' => 4123.50, 'pos' => 888.00]
$m->grandTotal;          // 5011.50
```

---

## 11. Webhooks

As of server v1.2 the EKTIR Billing API emits signed HTTP webhooks on
document state transitions. If your app can receive inbound HTTP, this
is the recommended path — see §11.0. The poller + events loop originally
shipped in v0.1 still works and is still useful for environments that
can't accept inbound HTTP (local dev, CI, background workers behind
NAT) — see §11.1 onwards.

### 11.0 Server-sent webhooks (recommended)

Create a subscription pointing at your ingestion URL. The server returns
the HMAC secret **exactly once** on creation — store it in your config
or secrets manager immediately.

```php
use Ektir\Billing\Facades\Billing;

$sub = Billing::webhooks()->create([
    'name'   => 'primary',
    'url'    => route('ektir.webhook'),
    'events' => [
        'document.submitted',
        'document.failed',
        'document.cancelled',
    ],
]);

Config::set('services.ektir.webhook_secret', $sub->secret); // store it now
```

Supported events:

| Event                  | Fires when                                           |
|------------------------|------------------------------------------------------|
| `document.created`     | A document is persisted (before myDATA submission).  |
| `document.submitted`   | myDATA accepted submission; `mark` is now populated. |
| `document.failed`      | myDATA permanently rejected.                         |
| `document.cancelled`   | Document was cancelled via `POST /documents/{id}/cancel`. |

Use `['*']` to subscribe to every current and future event.

Each delivery carries these headers:

- `X-Ektir-Event: document.submitted`
- `X-Ektir-Delivery: <uuid>`  — unique per attempt, idempotency key
- `X-Ektir-Signature: sha256=<hex hmac>`

The body shape:

```json
{
  "id": "0x…-…-uuid",
  "event": "document.submitted",
  "mode": "live",
  "created_at": "2026-04-20T12:34:56+00:00",
  "data": { "document": { "id": 42, "full_number": "Β-00042", "...": "..." } }
}
```

A Laravel ingestion endpoint using the bundled verifier:

```php
use Ektir\Billing\Security\WebhookSignature;

Route::post('/ektir/webhook', function (Request $request) {
    $ok = WebhookSignature::verify(
        $request->getContent(),
        $request->header('X-Ektir-Signature', ''),
        config('services.ektir.webhook_secret'),
    );
    abort_if(! $ok, 400, 'invalid signature');

    $event = $request->input('event');
    $doc   = $request->input('data.document');

    match ($event) {
        'document.submitted' => SendReceiptJob::dispatch($doc),
        'document.failed'    => AlertOpsJob::dispatch($doc),
        'document.cancelled' => MarkOrderRefunded::dispatch($doc),
        default              => null,
    };

    return response()->noContent();
})->name('ektir.webhook');
```

The server treats any 2xx as success. Non-2xx responses are retried
(5 attempts, exponential backoff: 30s → 2m → 10m → 30m → 1h). After
10 consecutive failures the subscription is auto-disabled. Use
`Billing::webhooks()->deliveries($id)` to inspect the last 50 delivery
attempts; `Billing::webhooks()->rotate($id)` regenerates the secret if
you suspect it leaked.

**Test mode + webhooks:** subscriptions created with a test key only
receive events for test-mode documents, and vice versa — so you can
safely exercise your handler against fake documents without live
traffic leaking in.

### 11.1 Legacy fallback: the poller + `DocumentTracker`

The poller needs to know which documents are still worth polling and how to
persist updates. Create a small Eloquent-backed tracker in your app:

```php
// app/Models/TrackedInvoice.php
class TrackedInvoice extends Model
{
    protected $fillable = ['ektir_id', 'mydata_status', 'pdf_url', 'mark'];
}
```

```php
// app/Billing/EloquentTracker.php
namespace App\Billing;

use App\Models\TrackedInvoice;
use Ektir\Billing\DTO\Document;
use Ektir\Billing\Support\DocumentTracker;

class EloquentTracker implements DocumentTracker
{
    public function pending(int $limit): iterable
    {
        $maxAge = now()->subMinutes(config('billing.poller.max_age_minutes'));

        return TrackedInvoice::query()
            ->whereIn('mydata_status', ['pending', 'offline'])
            ->orWhere(fn ($q) => $q->where('mydata_status', 'submitted')->whereNull('pdf_url'))
            ->where('created_at', '>=', $maxAge)
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'id'               => $row->ektir_id,
                'previous_status'  => $row->mydata_status,
                'previous_has_pdf' => $row->pdf_url !== null,   // required for DocumentPdfReady
            ]);
    }

    public function store(Document $doc): void
    {
        TrackedInvoice::updateOrCreate(
            ['ektir_id' => $doc->id],
            [
                'mydata_status' => $doc->myDataStatus->value,
                'pdf_url'       => $doc->pdfUrl,
                'mark'          => $doc->mark,
            ],
        );
    }
}
```

Bind it in `AppServiceProvider::register()`:

```php
$this->app->bind(\Ektir\Billing\Support\DocumentTracker::class, \App\Billing\EloquentTracker::class);
```

### 11.2 Turn the scheduler on

```env
EKTIR_BILLING_POLLER_ENABLED=true
```

The package registers the command with Laravel's scheduler automatically
(`everyMinute()` + `withoutOverlapping()`). Just make sure the scheduler
cron line is installed (`* * * * * php /path/to/artisan schedule:run`).

### 11.3 Listen to events

Now your code can treat document state changes like webhooks:

```php
use Ektir\Billing\Events\DocumentSubmitted;
use Ektir\Billing\Events\DocumentPdfReady;
use Ektir\Billing\Events\DocumentFailed;
use Illuminate\Support\Facades\Event;

Event::listen(DocumentSubmitted::class, function (DocumentSubmitted $e) {
    Log::info("myDATA accepted {$e->document->fullNumber} — ΜΑΡΚ {$e->document->mark}");
});

Event::listen(DocumentPdfReady::class, function (DocumentPdfReady $e) {
    // The PDF is ready. Send the email from YOUR server, branded as YOUR
    // company — use pdfAttachment() or pdfUrl() (see §6.3) inside your own
    // Mailable.
    Mail::to($e->document->raw['customer']['email'] ?? '')
        ->send(new \App\Mail\InvoiceIssuedMail($e->document));
});

Event::listen(DocumentFailed::class, function (DocumentFailed $e) {
    // Alert ops — myDATA permanently rejected
});
```

All three events implement Laravel's standard dispatch, so your listeners
can be queued just like any other.

### 11.4 Don't want Eloquent?

`DocumentTracker` is just an interface. A valid "tracker" can return IDs
from Redis, from a queue, from a hand‑rolled CSV, anything — as long as it
can tell the poller what to poll and save what it learned.

### 11.5 One‑off polling without the scheduler

You can always run the poller manually or wire it to a specific event in
your own codebase:

```bash
php artisan ektir:poll-documents --limit=10
```

---

## 12. Middleware patterns

### 12.1 Should I use a middleware?

Short answer: **no, not for API calls**. EKTIR Billing is something you
call from controllers and queued jobs, not a per‑request protection layer.

You might write a thin middleware for two legitimate reasons:

**(a) Inject a per‑tenant client into the container** so controllers
downstream can type‑hint `EktirBilling` without caring about key lookup:

```php
class BindTenantBilling
{
    public function handle($request, Closure $next)
    {
        $tenant = $request->user()?->currentTenant();
        if ($tenant?->ektir_api_key) {
            app()->bind(\Ektir\Billing\EktirBilling::class, function () use ($tenant) {
                return app(\Ektir\Billing\EktirBilling::class)->withApiKey($tenant->ektir_api_key);
            });
        }
        return $next($request);
    }
}
```

**(b) Block requests when the OSS threshold has flipped** (optional —
usually better surfaced as a banner than an error):

```php
class BlockIfOssFlipped
{
    public function handle($request, Closure $next)
    {
        $stats = \Ektir\Billing\Facades\EktirBilling::stats()->euTotal();
        if ($stats->totalNet >= $stats->threshold && ! session('oss_ack')) {
            return redirect('/settings/oss');
        }
        return $next($request);
    }
}
```

For the common case (periodic polling), **don't use middleware** — use the
scheduled poller from §11.

---

## 13. Error handling

All API errors are thrown as subclasses of `Ektir\Billing\Exceptions\EktirBillingException`.

| Exception                         | HTTP | When                                             |
|-----------------------------------|------|--------------------------------------------------|
| `AuthenticationException`         | 401/403 | Missing/invalid/inactive API key              |
| `RateLimitException`              | 429  | 60/min per key exceeded                          |
| `NotFoundException`               | 404  | Document or product not visible to your key      |
| `ValidationException`             | 422  | Body validation or domain error                  |
| `CancelForbiddenException`        | 422  | Doc unsubmittable / already cancelled            |
| `TimeoutException`                | —    | Connection timeout or `await()` timeout          |
| `EktirBillingException`           | *    | Anything else (generic fallback)                 |

Every exception exposes `->status`, `->errorCode`, and `->details`:

```php
use Ektir\Billing\Exceptions\ValidationException;
use Ektir\Billing\Exceptions\RateLimitException;

try {
    Billing::documents()->build()->receipt()->…->create();
} catch (ValidationException $e) {
    // $e->errors() => ['items' => ['...'], 'customer.email' => ['...']]
    return back()->withErrors($e->errors());
} catch (RateLimitException $e) {
    return response('Slow down', 429);
}
```

---

## 14. Rate limits & retries

- **60 requests/minute** per API key, **30 requests/minute** per IP for
  unauthenticated requests.
- The HTTP client retries on *connection* errors only (default 2 retries,
  400 ms sleep). It **does not** retry 4xx/5xx — those are thrown so you
  can decide. Tune via `config/billing.php` or env.
- The myDATA sandbox is occasionally slow on cold starts (20 s is common).
  That's why the default `timeout` is 15 s + retries — don't lower it in
  dev.

---

## 15. Testing your integration

### 15.0 Test-mode keys against a real server

When you want to exercise the full issuance pipeline against a running
billing server — myDATA calls skipped, PDFs watermarked, webhooks still
firing — ask an operator to generate a sandbox key:

```bash
php artisan api-key:generate --company=42 --name="acme sandbox" --source=vanta --mode=test
```

Test keys have a `test_` segment in their plaintext, and every authed
response includes `X-Ektir-Mode: test`. Documents created with a test
key end up with `mark: "TEST-<random>"`, PDFs are watermarked
"TEST MODE", and they never appear in live-key listings or stats. You
can point webhook subscriptions at a test-mode ingestion URL (also
created with the test key) to exercise your handlers end-to-end.

### 15.1 Unit / CI without a live server

The package uses Laravel's `Http` facade under the hood, so you can fake
everything with `Http::fake(...)` in your tests without spinning up the
real server:

```php
use Illuminate\Support\Facades\Http;
use Ektir\Billing\Facades\EktirBilling as Billing;

public function test_creating_a_receipt(): void
{
    Http::fake([
        '*/documents' => Http::response([
            'id' => 1,
            'document_type' => 'receipt',
            'full_number' => 'Α/2026/00001',
            'mydata_type' => '11.1',
            'mark' => null, 'uid' => null, 'qr_url' => null, 'pdf_url' => null,
            'vat_type' => 'greek', 'vat_rate' => 24.0,
            'net_amount' => 10.00, 'vat_amount' => 2.40, 'total_amount' => 12.40,
            'currency' => 'EUR',
            'mydata_status' => 'pending', 'mydata_environment' => null,
            'issued_at' => now()->toIso8601String(),
        ], 201),
    ]);

    $doc = Billing::documents()->build()
        ->receipt()
        ->forCustomer(new \Ektir\Billing\DTO\Customer(email: 'a@b.gr', country: 'GR'))
        ->addItem('SKU-1', 1, 10.00)
        ->payCard()
        ->create();

    $this->assertSame(12.40, $doc->totalAmount);
    $this->assertTrue($doc->myDataStatus === \Ektir\Billing\Enums\MyDataStatus::Pending);
}
```

For polling/event tests:

```php
use Illuminate\Support\Facades\Event;
use Ektir\Billing\Events\DocumentSubmitted;

Event::fake();

// ...run the command...
$this->artisan('ektir:poll-documents')->assertSuccessful();

Event::assertDispatched(DocumentSubmitted::class);
```

---

## 16. Reference — every endpoint

Full wire‑level reference for callers who want to bypass the SDK. All paths
are under `/api/v1`. All requests take `Authorization: Bearer <key>` and
`Accept: application/json`.

| Method | Path                                | SDK call                                       |
|--------|-------------------------------------|------------------------------------------------|
| POST   | `/documents`                        | `documents()->create($body)` / `build()`       |
| GET    | `/documents`                        | `documents()->list($filters)`                  |
| GET    | `/documents/{id}`                   | `documents()->find($id)`                       |
| POST   | `/documents/{id}/cancel`            | `documents()->cancel($id, $reason)`            |
| POST   | `/documents/{id}/regenerate-pdf`    | `documents()->regeneratePdf($id)`              |
| GET    | `/stats/eu-total`                   | `stats()->euTotal($year)`                      |
| GET    | `/stats/monthly`                    | `stats()->monthly($months)`                    |
| GET    | `/products` (`?include_inactive=1`) | `products()->list($includeInactive)`           |
| POST   | `/products`                         | `products()->create($body)`                    |
| PATCH  | `/products/{id}`                    | `products()->update($id, $body)`               |
| POST   | `/products/{id}/toggle`             | `products()->toggle($id)`                      |

> **Note on `send_email`**: passing this field to `POST /documents`
> now returns **422** with a helpful message — the server does not
> send email to end customers. See §6.3 for the integrator-owned
> email pattern.

**POST /documents** body:

```jsonc
{
  "document_type": "receipt | invoice | credit_note",
  "customer": {
    "email":     "string (required)",
    "country":   "XX (required, ISO 3166-1 alpha-2)",
    "name":      "string?",
    "company":   "string?",
    "vat_number":"string?",
    "address":   "string?",
    "city":      "string?",
    "postal":    "string?"
  },
  "items": [
    { "product_code": "SKU-…", "quantity": 1, "unit_price": 10.00 }
  ],
  "payment_method":     "card | transfer | cash",
  "payment_terms_days": 30,
  "notes":              "string?"
}
```

**Document response** (201 on create, 200 on read):

```jsonc
{
  "id": 123,
  "document_type": "receipt",
  "full_number": "Α/2026/00001",
  "mydata_type": "11.1",
  "mark": "400001202604190001234" ,
  "uid": "A1B2-C3D4",
  "qr_url": "https://mydataapi.aade.gr/…",
  "pdf_url": "https://billing.ektir.gr/documents/123/pdf?signature=…&expires=…",
  "vat_type": "greek",
  "vat_rate": 24.0,
  "net_amount": 10.00,
  "vat_amount": 2.40,
  "total_amount": 12.40,
  "currency": "EUR",
  "mydata_status": "submitted",
  "mydata_environment": "prod",
  "issued_at": "2026-04-19T12:34:56+02:00",
  "items": [
    {
      "product_code": "SKU-BOOK",
      "description_el": "Βιβλίο",
      "description_en": "Book",
      "item_type": "goods",
      "quantity": 2.0,
      "unit_price": 19.90,
      "vat_rate": 24.0,
      "net_total": 39.80,
      "vat_total": 9.55
    }
  ]
}
```

**Error envelope** (every 4xx/5xx):

```jsonc
{
  "error":   "validation_failed",
  "message": "The given data was invalid.",
  "details": {
    "customer.email": ["The email must be a valid email address."],
    "items": ["The items field must have at least 1 items."]
  }
}
```

---

## License

MIT © EKTIR.
