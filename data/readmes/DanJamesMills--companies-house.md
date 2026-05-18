# Companies House Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danjamesmills/companies-house.svg?style=flat-square)](https://packagist.org/packages/danjamesmills/companies-house)
[![Tests](https://github.com/danjamesmills/companies-house/actions/workflows/tests.yml/badge.svg)](https://github.com/danjamesmills/companies-house/actions/workflows/tests.yml)
[![Code Style](https://github.com/danjamesmills/companies-house/actions/workflows/pint.yml/badge.svg)](https://github.com/danjamesmills/companies-house/actions/workflows/pint.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/danjamesmills/companies-house.svg?style=flat-square)](https://packagist.org/packages/danjamesmills/companies-house)
[![License](https://img.shields.io/packagist/l/danjamesmills/companies-house.svg?style=flat-square)](LICENSE.md)

A Laravel package for the [Companies House API](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference). Look up any UK company, its officers, filing history, charges, PSC data, and more, all with a clean fluent interface. Also supports the real-time Streaming API for keeping a local database in sync as changes happen.

```php
// Look up a company
$company = CompaniesHouse::company('09717426')->profile();

// Search for companies
$results = CompaniesHouse::search()->companies('ACME Ltd');

// Stream real-time changes
CompaniesHouseStream::companies(function (array $event) {
    // called for every company update as it happens
});
```

**Why use this package?**
- The raw Companies House API uses HTTP Basic Auth with non-obvious conventions, this package handles all of that for you
- Typed exceptions for every error case (401, 404, 429, 416) so you can handle them cleanly
- Streaming API support built in, with the correct Guzzle configuration for long-lived connections
- 99% test coverage, Laravel 10/11/12/13 compatible

> **API reference:** The full response shapes for every endpoint are documented in the [Companies House API spec](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference). The [Streaming API spec](https://developer-specs.company-information.service.gov.uk/streaming-api/reference) covers the real-time feed format.

## Contents

- [How it works](#how-it-works)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Company Profile](#company-profile)
  - [Officers](#officers)
  - [Charges (Mortgages)](#charges-mortgages)
  - [Filing History](#filing-history)
  - [Persons with Significant Control (PSC)](#persons-with-significant-control-psc)
  - [Search](#search)
  - [Disqualified Officers](#disqualified-officers)
  - [Officer Appointments](#officer-appointments-all-roles-for-one-person)
  - [Downloading Filing Documents](#downloading-filing-documents)
- [Per-request Configuration](#per-request-configuration)
  - [Swapping the API key](#swapping-the-api-key)
  - [Routing through a proxy](#routing-through-a-proxy)
- [Streaming API](#streaming-api)
  - [How it works](#how-it-works-1)
  - [The timepoint](#the-timepoint)
  - [Event envelope](#event-envelope)
  - [Basic usage](#basic-usage)
  - [Available streams](#available-streams)
  - [Resuming after a disconnect](#resuming-after-a-disconnect)
  - [Running as an Artisan command](#running-as-an-artisan-command)
  - [How Laravel keeps the connection alive](#how-laravel-keeps-the-connection-alive)
- [Streaming vs Polling](#streaming-vs-polling)
- [Rate Limiting](#rate-limiting)
  - [Handling Limits Programmatically](#handling-limits-programmatically)
- [ETags](#etags)
- [Caching with Laravel Cache](#caching-with-laravel-cache)
- [Storing to Database](#storing-to-database)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Example Responses](#example-responses)
- [Contributing](#contributing)
- [License](#license)

## How it works

The package authenticates every request using HTTP Basic Auth with your API key as the username and an empty password, exactly as the Companies House spec requires. All responses are returned as plain PHP arrays.

The package is organised into resources that mirror the API structure:

| Resource | Access via | Description |
|---|---|---|
| Company profile + address | `CompaniesHouse::company($number)` | Core company data |
| Officers | `->officers()` | Directors, secretaries, LLP members |
| Charges | `->charges()` | Mortgages and charges |
| Filing history | `->filingHistory()` | All filed documents |
| PSC | `->personsWithSignificantControl()` | Beneficial ownership |
| Search | `CompaniesHouse::search()` | All search endpoints |
| Documents | `CompaniesHouse::documents()` | Download actual PDFs |
| Disqualified officers | `CompaniesHouse::disqualifiedOfficers()` | Disqualification records |
| Officer appointments | `CompaniesHouse::officer($id)` | All roles for one officer |
| Streaming API | `CompaniesHouseStream::companies()` | Real-time change feed |

---

## Installation

```bash
composer require danjamesmills/companies-house
```

Publish the config file:

```bash
php artisan vendor:publish --tag="companies-house-config"
```

## Configuration

Add your Companies House API keys to `.env`:

```
# REST API key - for all on-demand endpoints
COMPANIES_HOUSE_API_KEY=your-api-key-here

# Streaming API key - for real-time change feeds (separate registration required)
COMPANIES_HOUSE_STREAM_API_KEY=your-stream-api-key-here
```

Get a REST API key by registering at the [Companies House Developer Hub](https://developer.company-information.service.gov.uk). Register it as an **API Key** application (not OAuth).

Get a streaming API key by registering a separate **Streaming API** application at [Your Applications](https://developer.company-information.service.gov.uk/manage-applications). REST and streaming keys are **not interchangeable**.

> **Security:** Never commit your API keys to source control. Store them in `.env` only.

---

## Usage

### Company Profile

```php
use DanJamesMills\CompaniesHouse\Facades\CompaniesHouse;

$company = CompaniesHouse::company('09717426')->profile();

// Key fields:
// $company['company_name']
// $company['company_number']
// $company['company_status']        (active, dissolved, liquidation, etc.)
// $company['type']                  (ltd, plc, llp, etc.)
// $company['date_of_creation']
// $company['registered_office_address']
// $company['etag']                  (changes when data changes, useful for caching)

$address = CompaniesHouse::company('09717426')->registeredOfficeAddress();

// Optional endpoints - will throw NotFoundException if no data exists for this company
$registers     = CompaniesHouse::company('09717426')->registers();
$insolvency    = CompaniesHouse::company('09717426')->insolvency();
$exemptions    = CompaniesHouse::company('09717426')->exemptions();
$establishments = CompaniesHouse::company('09717426')->ukEstablishments();
```

> **Note:** `registers`, `insolvency`, `exemptions`, `charges`, and `uk-establishments` throw a `NotFoundException` when the company has no data for that resource. This is normal, so always catch it.

### Officers

```php
// List all officers (directors, secretaries, etc.)
$officers = CompaniesHouse::company('09717426')->officers()->list();

// Key response fields:
// $officers['items']           - the officer records for this page
// $officers['total_results']   - total officers across all pages (active + resigned + inactive)
// $officers['active_count']    - number of currently active officers
// $officers['resigned_count']  - number of resigned officers
// $officers['inactive_count']  - number of inactive officers
// $officers['items_per_page']  - page size used (default 35, max 35)
// $officers['start_index']     - zero-based offset of the first item in this page

// Paginate through all officers
$startIndex = 0;
$itemsPerPage = 35;

do {
    $response = CompaniesHouse::company('09717426')->officers()->list(
        itemsPerPage: $itemsPerPage,
        startIndex: $startIndex,
    );

    foreach ($response['items'] as $officer) {
        // process each officer...
    }

    $startIndex += $itemsPerPage;
} while ($startIndex < $response['total_results']);

// Order results
$officers = CompaniesHouse::company('09717426')->officers()->list(
    orderBy: 'surname', // 'appointed_on', 'resigned_on', 'surname'
);

// Only active directors
$officers = CompaniesHouse::company('09717426')->officers()->list(registerType: 'directors');
// registerType options: 'directors', 'secretaries', 'llp-members'

// Get a specific appointment
$appointment = CompaniesHouse::company('09717426')->officers()->get('appointmentId');
```

### Charges (Mortgages)

```php
// All charges
$charges = CompaniesHouse::company('09717426')->charges()->list();

// Only outstanding charges
$charges = CompaniesHouse::company('09717426')->charges()->list(filter: 'outstanding');
// filter options: 'outstanding', 'part-satisfied', 'satisfied'

// Get a specific charge
$charge = CompaniesHouse::company('09717426')->charges()->get('chargeId');
```

### Filing History

```php
// All filings (most recent first)
$history = CompaniesHouse::company('09717426')->filingHistory()->list();

// Filter by category
$history = CompaniesHouse::company('09717426')->filingHistory()->list(category: 'accounts');
// categories: 'accounts', 'confirmation-statement', 'incorporation',
//             'officers', 'persons-with-significant-control', 'address', 'other'

// Paginate through all filings
$history = CompaniesHouse::company('09717426')->filingHistory()->list(
    itemsPerPage: 25,
    startIndex: 25,
);
// Total count is in $history['total_count']

// Get a specific filing
$filing = CompaniesHouse::company('09717426')->filingHistory()->get('transactionId');
```

### Persons with Significant Control (PSC)

```php
// List all PSCs
$pscs = CompaniesHouse::company('09717426')->personsWithSignificantControl()->list();

// Individual PSC (person)
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->individual('notificationId');

// Corporate entity PSC (a company owns shares)
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->corporateEntity('notificationId');

// Legal person PSC
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->legalPerson('notificationId');

// Beneficial owners
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->individualBeneficialOwner('notificationId');
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->corporateEntityBeneficialOwner('notificationId');
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->legalPersonBeneficialOwner('notificationId');

// Super secure PSCs (identity protected)
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->superSecure('superSecureId');
$psc = CompaniesHouse::company('09717426')->personsWithSignificantControl()->superSecureBeneficialOwner('superSecureId');

// PSC statements
$statements = CompaniesHouse::company('09717426')->personsWithSignificantControl()->listStatements();
$statement  = CompaniesHouse::company('09717426')->personsWithSignificantControl()->getStatement('statementId');

// Notifications for a specific PSC
$notifications = CompaniesHouse::company('09717426')->personsWithSignificantControl()->notifications('pscId');
```

### Search

```php
// Search for anything (companies, officers, disqualifications)
$results = CompaniesHouse::search()->all('ACME Ltd');

// Search companies only
$results = CompaniesHouse::search()->companies('ACME Ltd', itemsPerPage: 20);
$results = CompaniesHouse::search()->companies('ACME Ltd', restrictions: 'actively-trading');
// restrictions: 'actively-trading', 'liquidation', 'receivership', 'administration', etc.

// Search officers by name
$results = CompaniesHouse::search()->officers('John Smith');

// Search disqualified officers
$results = CompaniesHouse::search()->disqualifiedOfficers('John Smith');

// Advanced company search (multiple filters)
$results = CompaniesHouse::search()->advanced([
    'company_name_includes' => 'ACME',
    'company_status'        => ['active'],
    'company_type'          => ['ltd'],
    'sic_codes'             => ['62012'],
    'incorporated_from'     => '2010-01-01',
    'incorporated_to'       => '2020-12-31',
    'size'                  => 50,
]);

// Alphabetical search
$results = CompaniesHouse::search()->alphabetical('ACME');

// Dissolved companies
$results = CompaniesHouse::search()->dissolved('ACME', searchType: 'begins_with');
$results = CompaniesHouse::search()->dissolved('ACME',
    searchType:    'contains',
    dissolvedFrom: '2020-01-01',
    dissolvedTo:   '2023-12-31',
);
```

### Disqualified Officers

```php
// Natural person disqualifications
$disqualifications = CompaniesHouse::disqualifiedOfficers()->natural('officerId');

// Corporate body disqualifications
$disqualifications = CompaniesHouse::disqualifiedOfficers()->corporate('officerId');
```

### Officer Appointments (all roles for one person)

```php
// All companies a person is/was an officer of
$appointments = CompaniesHouse::officerAppointments('officerId');

// Paginate
$appointments = CompaniesHouse::officerAppointments('officerId', itemsPerPage: 25, startIndex: 0);
```

### Downloading Filing Documents

Every filing history item has a `links.document_metadata` URL. Pass it directly to `documents()`.

```php
$history = CompaniesHouse::company('09717426')->filingHistory()->list(category: 'accounts');

foreach ($history['items'] as $item) {
    // Paper-filed documents may not have a download link
    if (! isset($item['links']['document_metadata'])) {
        continue;
    }

    $metadataUrl = $item['links']['document_metadata'];

    // Check metadata first - confirms available formats and number of pages
    $meta = CompaniesHouse::documents()->metadata($metadataUrl);

    // Download as PDF (returns raw binary string)
    $pdf = CompaniesHouse::documents()->pdf($metadataUrl);
    Storage::put("filings/{$item['transaction_id']}.pdf", $pdf);

    // Or XHTML (machine-readable structured format, where available)
    $xhtml = CompaniesHouse::documents()->xhtml($metadataUrl);
}
```

> **Note:** `paper_filed: true` items may return a `NotFoundException` on download. Always check for `links.document_metadata` before attempting a download.

---

## Per-request Configuration

Both `withApiKey` and `withProxy` return a **new** manager instance. The application singleton is never modified, so other parts of your code are unaffected.

### Swapping the API key

Useful in multi-tenant applications where each user has their own Companies House API key registered with the Developer Hub:

```php
$profile = CompaniesHouse::withApiKey($user->ch_api_key)
    ->company('09717426')
    ->profile();

// The default key is still used everywhere else
$otherProfile = CompaniesHouse::company('12345678')->profile();
```

### Routing through a proxy

Pass a proxy URL string — the scheme controls the protocol (`http`, `https`, `socks4`, `socks5`):

```php
// HTTP proxy
$profile = CompaniesHouse::withProxy('http://proxy.example.com:8080')
    ->company('09717426')
    ->profile();

// SOCKS5 proxy
$profile = CompaniesHouse::withProxy('socks5://proxy.example.com:1080')
    ->company('09717426')
    ->profile();
```

For per-protocol control or a bypass list, pass an array:

```php
$profile = CompaniesHouse::withProxy([
        'http'  => 'http://proxy.example.com:8080',
        'https' => 'http://proxy.example.com:8080',
        'no'    => ['localhost', '127.0.0.1'],
    ])
    ->company('09717426')
    ->profile();
```

Both options can be chained together:

```php
$profile = CompaniesHouse::withApiKey($user->ch_api_key)
    ->withProxy('http://proxy.example.com:8080')
    ->company('09717426')
    ->profile();
```

> All resource methods (`company()`, `search()`, `documents()`, `disqualifiedOfficers()`, `officer()`) on the derived instance use the overridden key and/or proxy.

---

## Streaming API

### How it works

Instead of you calling Companies House and asking "what's changed?", the streaming API works the other way around: **your server makes one long HTTP connection to `stream.companieshouse.gov.uk` and leaves it open**. Companies House then pushes each change down that connection as it happens, line by line, indefinitely - like downloading an infinitely long file.

Your code processes each line (one JSON event per line) as it arrives. The connection stays open until the server closes it (maintenance, congestion) or your process dies. You are not polling anything, you are just reading from an open socket.

```
Your server  ──── GET /companies ────►  stream.companieshouse.gov.uk
             ◄─── event (line) ─────
             ◄─── event (line) ─────
             ◄─── (blank heartbeat) ─
             ◄─── event (line) ─────
             ◄─── ...forever... ────
```

### The timepoint

Every event includes a `timepoint`, a large integer that acts as a position marker in Companies House's queue. **You must save this after every event you successfully process.** It is the only way to resume without missing changes if your connection drops.

```
timepoint 187124872480  ← processed ✓ (saved)
timepoint 187124872481  ← processed ✓ (saved)
timepoint 187124872482  ← connection dropped here
                              ↓
          reconnect with timepoint 187124872482
          Companies House replays from that position
```

If you don't pass a timepoint, the stream starts from "right now" and you will miss any changes that happened while you were disconnected.

> **Prerequisites:**
> - A streaming API key registered separately at the Developer Hub (`COMPANIES_HOUSE_STREAM_API_KEY`) - REST keys do not work here
> - A PHP process that can run indefinitely (Artisan command under Supervisor, not a web request)
> - Maximum 2 concurrent connections per account

### Event envelope

Each line pushed down the connection is a JSON object with this structure:

```php
[
    'event' => [
        'timepoint'      => 187124872486, // save this after processing
        'published_at'   => '2024-03-15T10:30:00Z',
        'type'           => 'changed',    // 'changed' or 'deleted'
        'fields_changed' => ['company_status', 'date_of_cessation'],
    ],
    'resource_id'   => '09717426',        // the company number, officer ID, etc.
    'resource_kind' => 'company-profile',
    'resource_uri'  => '/company/09717426',
    'data'          => [ /* full resource, same shape as the on-demand REST API */ ],
]
```

### Basic usage

```php
use DanJamesMills\CompaniesHouse\Facades\CompaniesHouseStream;

// This call blocks until the connection is closed by the server.
// Run it inside a long-lived process (Artisan command), not a web request.
CompaniesHouseStream::companies(function (array $event) {
    $companyNumber = $event['resource_id'];
    $data          = $event['data'];
    $timepoint     = $event['event']['timepoint'];

    // 1. Do something with the change
    Company::updateOrCreate(
        ['company_number' => $companyNumber],
        ['name' => $data['company_name'], 'status' => $data['company_status']]
    );

    // 2. Save the timepoint AFTER successful processing so you can resume here
    Cache::put('ch.stream.timepoint', $timepoint);
});
```

### Available streams

```php
// Company profile changes
CompaniesHouseStream::companies($callback, $timepoint);

// Filing history changes
CompaniesHouseStream::filings($callback, $timepoint);

// Insolvency case changes
CompaniesHouseStream::insolvencyCases($callback, $timepoint);

// Charge (mortgage) changes
CompaniesHouseStream::charges($callback, $timepoint);

// Officer appointment changes
CompaniesHouseStream::officers($callback, $timepoint);

// PSC changes
CompaniesHouseStream::personsWithSignificantControl($callback, $timepoint);

// Disqualified officer changes
CompaniesHouseStream::disqualifiedOfficers($callback, $timepoint);

// Company exemption changes
CompaniesHouseStream::companyExemptions($callback, $timepoint);

// PSC statement changes
CompaniesHouseStream::pscStatements($callback, $timepoint);
```

> **Connection limit:** Companies House allows a maximum of **2 concurrent streaming connections per account**. Do not open multiple streams in a single process. Each method call opens one connection and blocks indefinitely. Run each stream as a separate OS process managed by Supervisor (see below).
>
> In practice, most applications only need `companies` and `filings`. The other streams (`insolvencyCases`, `charges`, `officers`, `personsWithSignificantControl`, `disqualifiedOfficers`, `companyExemptions`, `pscStatements`) are very low-volume and are often better served by polling the REST API on a schedule rather than holding a permanent streaming connection open.

### Resuming after a disconnect

Load the last saved timepoint and pass it when reconnecting. Companies House will replay every event from that position forward so nothing is missed:

```php
$lastTimepoint = Cache::get('ch.stream.timepoint'); // null on first run

CompaniesHouseStream::companies(
    callback:  fn (array $event) => processEvent($event),
    timepoint: $lastTimepoint, // null = start from now; integer = resume from here
);
```

If the saved timepoint is too old (Companies House only keeps a finite backlog), a `StreamRangeException` is thrown. At that point you will need to re-import a full data snapshot. Companies House publishes these separately, and each snapshot includes the timepoint it was taken at so you can resume without missing anything.

### Running as an Artisan command

The stream blocks for as long as the connection is alive. The recommended pattern is a dedicated Artisan command kept running by Supervisor:

```php
// app/Console/Commands/StreamCompaniesHouse.php

class StreamCompaniesHouse extends Command
{
    protected $signature   = 'companies-house:stream';
    protected $description = 'Process real-time Companies House change events';

    public function handle(): void
    {
        $timepoint = Cache::get('ch.stream.timepoint');

        $this->info('Connecting to Companies House stream' . ($timepoint ? " from timepoint {$timepoint}" : '') . '...');

        try {
            CompaniesHouseStream::companies(
                callback: function (array $event) {
                    // process the event...
                    Cache::put('ch.stream.timepoint', $event['event']['timepoint']);
                },
                timepoint: $timepoint,
            );
        } catch (StreamRangeException $e) {
            $this->error('Timepoint expired. Re-import a snapshot and update ch.stream.timepoint.');
        } catch (RateLimitException $e) {
            $this->warn('Rate limited. Waiting ' . ($e->getRetryAfter() ?? 60) . 's before reconnect.');
            sleep($e->getRetryAfter() ?? 60);
        }
    }
}
```

### How Laravel keeps the connection alive

A normal Laravel web request is limited to a few seconds and then times out. The streaming connection can run for hours or days, so **it cannot run inside a web request**. It must run in a long-lived PHP process. The standard way to handle this in Laravel is an Artisan command managed by [Supervisor](http://supervisord.org/).

Supervisor is a process manager that keeps your command running permanently. If the command exits (server restart, connection drop, exception), Supervisor automatically restarts it. Here is a minimal Supervisor config:

```ini
; /etc/supervisor/conf.d/companies-house-stream.conf

[program:companies-house-stream]
command=php /var/www/html/artisan companies-house:stream
directory=/var/www/html
autostart=true
autorestart=true
startretries=10
stdout_logfile=/var/log/supervisor/companies-house-stream.log
stderr_logfile=/var/log/supervisor/companies-house-stream.log
```

The flow is:
1. Supervisor starts `php artisan companies-house:stream`
2. The command connects to Companies House and starts processing events
3. If the connection drops (server maintenance, network blip), the command exits
4. Supervisor immediately restarts it
5. The command loads the last saved timepoint and reconnects, with no events missed

> **Laravel Horizon / queue workers are not the right tool here.** Queue workers process discrete jobs and then stop. The stream connection is continuous and cannot be expressed as a queued job.

---

## Streaming vs Polling

Here is how to decide between the two approaches. Both work fine within the rate limits.

**Polling the REST API (every N minutes)**

- Your Laravel scheduler calls `CompaniesHouse::company($number)->profile()` for each company you track
- Simple to understand and deploy, just a scheduled job
- Rate limit is **600 requests per 5-minute window** (2/second)
- Works fine for small datasets; 500 companies polled every 30 minutes is roughly 17 requests/minute, well within the limit
- Does not scale to large datasets; 50,000 companies every 30 minutes is 1,667 requests/minute, which exceeds the limit
- You will always be slightly out of date (up to 30 minutes behind)

**Streaming API (long-running connection)**

- One persistent connection, Companies House pushes changes to you within seconds
- Unlimited throughput, you receive every change regardless of how many companies there are
- Requires a dedicated long-running process managed by Supervisor (as shown above)
- More complex to deploy and monitor
- Requires a separate streaming API key

**Quick decision guide:**

| | Polling | Streaming |
|---|---|---|
| Dataset size | Small (< ~5,000) | Any size |
| Freshness needed | Minutes/hours is fine | Near real-time |
| Infrastructure | Scheduler only | Supervisor daemon |
| Setup complexity | Low | Medium |

---

## Rate Limiting

The API allows **600 requests per 5-minute window** per API key. Exceeding this returns a 429 which the package converts to a `RateLimitException`.

**Tips for staying within limits:**

- Cache responses where possible, company profiles and officer lists rarely change minute-to-minute
- Use the `etag` field to detect changes before fetching full data (see below)
- Process bulk lookups via queued jobs with rate-awareness, not in a single loop
- Contact Companies House if your application consistently needs more than 600/5min

### Handling Limits Programmatically

Every response from Companies House includes rate limit headers. After any call you can read them via `CompaniesHouse::rateLimit()`:

```php
use DanJamesMills\CompaniesHouse\Facades\CompaniesHouse;

$profile = CompaniesHouse::company('09717426')->profile();

$limit = CompaniesHouse::rateLimit();
// $limit->limit      - total requests allowed in the window (e.g. 600)
// $limit->remaining  - requests remaining before a 429 is returned (e.g. 597)
// $limit->resetAt    - Unix timestamp when the window resets (e.g. 1730107751)
// $limit->window     - window duration as a string (e.g. "5m")
```

Use this to build a dynamic back-off directly into your integration pipeline:

```php
$limit = CompaniesHouse::rateLimit();

if ($limit && $limit->remaining < 10) {
    // Nearly exhausted - sleep until the window resets before the next batch
    $wait = $limit->secondsUntilReset();
    sleep($wait > 0 ? $wait : 1);
}
```

Helper methods on the `RateLimit` object:

```php
$limit->secondsUntilReset(); // seconds until the window resets (0 if already past)
$limit->resetsAt();           // same value as a DateTimeImmutable instance
```

`rateLimit()` returns `null` before any request has been made in the current container lifecycle, and also when the headers are absent from a response (e.g. on error responses).

---

## ETags

Most API responses include an `etag` field in the JSON body. It is a hash that changes whenever the data changes. Store it alongside your cached data and compare it on subsequent fetches to avoid unnecessary updates.

```php
use App\Models\Company;

// First fetch - store the etag
$profile = CompaniesHouse::company('09717426')->profile();

Company::updateOrCreate(
    ['company_number' => '09717426'],
    [
        'data'       => $profile,
        'etag'       => $profile['etag'],
        'fetched_at' => now(),
    ]
);

// Later - check if data has changed before updating your local copy
$stored = Company::find('09717426');
$fresh  = CompaniesHouse::company('09717426')->profile();

if ($fresh['etag'] !== $stored->etag) {
    $stored->update([
        'data'       => $fresh,
        'etag'       => $fresh['etag'],
        'fetched_at' => now(),
    ]);
}
```

> For a batch of 500 companies, this means 500 requests to check for changes, with extra requests only for the ones that have actually changed, rather than fetching all 500 every time.

---

## Caching with Laravel Cache

```php
use Illuminate\Support\Facades\Cache;

// Cache company profile for 1 hour
$profile = Cache::remember("ch.company.09717426", 3600, function () {
    return CompaniesHouse::company('09717426')->profile();
});

// Cache officer list for 6 hours (changes infrequently)
$officers = Cache::remember("ch.officers.09717426", 21600, function () {
    return CompaniesHouse::company('09717426')->officers()->list();
});

// Bust the cache when an etag change is detected
Cache::forget("ch.company.09717426");
```

---

## Storing to Database

For applications that need offline reporting or historical tracking, store responses in your database.

**Example migration:**

```php
Schema::create('companies_house_companies', function (Blueprint $table) {
    $table->string('company_number', 8)->primary();
    $table->string('company_name');
    $table->string('company_status');
    $table->string('etag')->nullable();     // track changes
    $table->json('raw_data');               // full API response
    $table->timestamp('last_synced_at')->nullable();
    $table->timestamps();
});
```

**Sync job example with rate limit handling:**

```php
class SyncCompanyData implements ShouldQueue
{
    public function __construct(private string $companyNumber) {}

    public function handle(): void
    {
        $existing = CompaniesHouseCompany::find($this->companyNumber);

        try {
            $profile = CompaniesHouse::company($this->companyNumber)->profile();
        } catch (NotFoundException $e) {
            // Company may have been dissolved/removed from the register
            return;
        } catch (RateLimitException $e) {
            // Re-queue after the rate limit window resets (default 5 minutes)
            $this->release($e->getRetryAfter() ?? 300);
            return;
        }

        // Skip update if nothing has changed
        if ($existing && $existing->etag === $profile['etag']) {
            return;
        }

        CompaniesHouseCompany::updateOrCreate(
            ['company_number' => $this->companyNumber],
            [
                'company_name'   => $profile['company_name'],
                'company_status' => $profile['company_status'],
                'etag'           => $profile['etag'],
                'raw_data'       => $profile,
                'last_synced_at' => now(),
            ]
        );
    }
}
```

## Error Handling

All exceptions extend `CompaniesHouseException`, so you can catch that as a catch-all, or catch the specific types for fine-grained control.

| Exception | HTTP Status | Cause |
|---|---|---|
| `AuthenticationException` | 401 | API key is invalid or missing |
| `NotFoundException` | 404 | Company/resource not found, or optional resource has no data |
| `RateLimitException` | 429 | Exceeded rate limit (600 req/5min REST; reconnect backoff for streams) |
| `StreamRangeException` | 416 | Streaming timepoint is too old, re-import a snapshot |
| `CompaniesHouseException` | other | Any other API error |

```php
use DanJamesMills\CompaniesHouse\Exceptions\AuthenticationException;
use DanJamesMills\CompaniesHouse\Exceptions\CompaniesHouseException;
use DanJamesMills\CompaniesHouse\Exceptions\NotFoundException;
use DanJamesMills\CompaniesHouse\Exceptions\RateLimitException;

try {
    $company = CompaniesHouse::company('09717426')->profile();
} catch (AuthenticationException $e) {
    // Invalid API key - check COMPANIES_HOUSE_API_KEY in .env
} catch (NotFoundException $e) {
    // Company doesn't exist, or optional resource (registers, insolvency, etc.) has no data
} catch (RateLimitException $e) {
    // 600 req / 5 min limit hit
    $retryAfter = $e->getRetryAfter(); // seconds until reset, if provided
} catch (CompaniesHouseException $e) {
    $e->getMessage();    // Error description
    $e->getStatusCode(); // HTTP status code
    $e->getBody();       // Raw response body as array
}
```

> **Note:** Optional endpoints (`registers`, `insolvency`, `exemptions`, `charges`, `uk-establishments`) return a `NotFoundException` when a company has no data for that resource. This is normal behaviour, not an error.

## Testing

The package uses [Pest](https://pestphp.com/) with [Orchestra Testbench](https://orchestraplatform.com/docs/testbench) so tests run without a full Laravel application.

```bash
# From the package directory
cd packages/danjamesmills/companies-house

# Install dev dependencies
composer install

# Run all tests
composer test

# Run a specific suite
vendor/bin/pest --testsuite=Unit
vendor/bin/pest --testsuite=Feature

# Run with coverage (requires Xdebug or PCOV)
composer test-coverage
```

### Checking code style

```bash
# Check only (exit 1 if anything needs fixing)
composer format:check

# Auto-fix
composer format
```

The CI pipeline runs both checks automatically on every push and pull request.

---

## Example Responses

The [`examples/`](examples/) folder contains real API response dumps to help you understand the data shape and plan a database schema.

| File | Endpoint |
|------|----------|
| [company-profile.json](examples/company-profile.json) | `CompaniesHouse::company($number)->profile()` |
| [officers.json](examples/officers.json) | `->officers()->list()` |
| [charges.json](examples/charges.json) | `->charges()->list()` |
| [filing-history.json](examples/filing-history.json) | `->filingHistory()->list()` |
| [persons-with-significant-control.json](examples/persons-with-significant-control.json) | `->personsWithSignificantControl()->list()` |
| [disqualified-officer.json](examples/disqualified-officer.json) | `CompaniesHouse::disqualifiedOfficers()->natural($id)` |
| [officer-appointments.json](examples/officer-appointments.json) | `CompaniesHouse::officer($id)->list()` |
| [search-companies.json](examples/search-companies.json) | `CompaniesHouse::search()->companies($query)` |
| [document-metadata.json](examples/document-metadata.json) | `CompaniesHouse::documents()->metadata($url)` |

---

## Contributing

Contributions are welcome. To avoid wasted effort, please **open an issue first** to discuss what you have in mind, whether that's a bug report, a new endpoint, a design question, or something else. Pull requests that haven't been discussed in an issue may be closed without review.

1. Open an issue describing what you want to change and why
2. Wait for feedback before writing code
3. Fork the repository, create a branch, and submit a PR referencing the issue
4. Ensure `composer test` and `composer format:check` both pass

---

## License

MIT
