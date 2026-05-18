# IMsb Link for Laravel

A Laravel package that bridges your Eloquent models with the **USPS Intelligent Mail for Small Business (IMsb) Tool** so you can run a Full‑Service mailing without anyone hand‑editing CSVs.

It exports your records as an IMsb‑ready CSV, and after USPS does its thing it imports the result back — writing the assigned Intelligent Mail barcode, tray ID, presort date, and AMS‑corrected addresses onto your records.

---

## What is the IMsb Tool, and why does this exist?

The [IMsb Tool](https://postalpro.usps.com/intelligent-mail-small-business) is a free USPS web app for small mailers (under 50,000 pieces per mailing). You give it a list of addresses; it validates them against USPS's Address Management System (AMS), presorts them, assigns each piece a unique Intelligent Mail barcode (IMb), generates printable address labels and tray labels, and submits the postage statement electronically. In exchange you get Full‑Service automation discounts.

The catch: **IMsb has no API.** The whole workflow is browser‑driven file upload and file download. So if your records live in a Laravel app, every mailing means somebody exporting a CSV by hand, uploading it through the Business Customer Gateway, downloading the result, opening Excel, and copying barcodes back into the database. That's tedious and error‑prone.

This package automates both halves of that round trip. Your Laravel app stays the source of truth; IMsb is just a step in the middle.

---

## How the round trip works

```
┌──────────────────┐    1. Generate CSV      ┌──────────────┐
│ Your Eloquent    │ ──────────────────────▶ │ IMsb-ready   │
│ models           │                         │ address.csv  │
│ (e.g. Customer)  │                         └──────┬───────┘
└──────────────────┘                                │
                                                    │ 2. You upload to
                                                    │    USPS BCG / IMsb
                                                    ▼
                                            ┌──────────────┐
                                            │ IMsb Tool    │
                                            │ — AMS check  │
                                            │ — presort    │
                                            │ — assigns    │
                                            │   IMb codes  │
                                            └──────┬───────┘
                                                    │ 3. You download
                                                    │    result file(s)
                                                    ▼
┌──────────────────┐    4. Import results    ┌──────────────┐
│ imsb_pieces +    │ ◀────────────────────── │ result.csv   │
│ source models    │                         │ (mail merge  │
│ updated          │                         │  or updated  │
└──────────────────┘                         │  address     │
                                             │  list)       │
                                             └──────────────┘
```

The glue is the **`contactid`** field — IMsb echoes whatever value you put there back in its result downloads, which lets us match each returned row to the original record. By default we use the model's primary key.

---

## Installation

Requires **PHP 8.2+** and **Laravel 11 or 12**.

```bash
composer require jersey-mike/imsb-tool-link
```

Publish the config and run migrations:

```bash
php artisan vendor:publish --tag=imsb-config
php artisan vendor:publish --tag=imsb-migrations
php artisan migrate
```

The package creates two tables — `imsb_jobs` (one row per mailing) and `imsb_pieces` (one row per piece, with the IMb data once it returns).

---

## Quick start

### 1. Make a model exportable

Add the trait, declare a column map, and you're done.

```php
use Illuminate\Database\Eloquent\Model;
use JerseyMike\ImsbLink\Concerns\ImsbExportable;
use JerseyMike\ImsbLink\Contracts\Mappable;

class Customer extends Model implements Mappable
{
    use ImsbExportable;

    public function imsbMap(): array
    {
        return [
            'name'        => fn ($c) => trim("{$c->first_name} {$c->last_name}"),
            'company'     => 'company',
            'address'     => 'street1',
            'sec-address' => 'street2',
            'city'        => 'city',
            'state'       => 'state',
            'zip'         => 'postal_code',
        ];
    }
}
```

The keys on the left are **canonical IMsb column names** (taken straight from the USPS user guide — see [the schema reference](#schema-reference) below). The values on the right are either column names on your model or closures that receive the model instance.

### 2. Register the model with the package

In `config/imsb.php`:

```php
'exportables' => [
    'customers' => \App\Models\Customer::class,
],
```

The key (`customers`) is the human label shown in the UI dropdown.

### 3. Run a mailing

Visit `/imsb` in your browser. You'll see a job list and a **New export** button. Pick `customers`, give the job a name, click generate.

The package will:

1. Run `Customer::imsbQuery()` (override this on your model if you need a custom default scope) and stream every row through `imsbMap()`.
2. Apply IMsb's per‑column max lengths (50 for most fields, 28 for urbanization, 10 for ZIP, etc.) — over‑length values are truncated and the truncations are recorded as warnings on the job.
3. Escape any cell that starts with `=`, `+`, `-`, or `@` so a malicious record can't smuggle a spreadsheet formula past somebody downstream.
4. Snapshot every row into `imsb_pieces` keyed by `(imsb_job_id, contactid)`.
5. Save the CSV to disk and offer it for download.

Take that CSV, log into the [Business Customer Gateway](https://gateway.usps.com/), open the IMsb tool, run your mailing, and download either:

- The **Mail Merge file** — contains `encodedimbno`, `presorttrayid`, `presortdate` for every successfully validated piece. This is the one you usually want.
- The **Updated Address List** — AMS‑corrected version of your input, including any rows IMsb couldn't validate (DPV‑unmatched).

Back in `/imsb/jobs/{id}`, upload the result file. The importer will:

1. Auto‑detect which of the two shapes you uploaded (by looking for `encodedimbno` in the headers).
2. Match each row to an existing piece by `contactid`.
3. Write the IMb data onto the piece, mark its AMS status, and stash the corrected address as JSON.
4. **Write back** the IMb fields onto the source model — by default `imb_barcode`, `imb_tray_id`, and `imb_presort_date`. Models without those columns are silently skipped, so the mailing history in `imsb_pieces` always exists even if you don't want to denormalize onto your records.

Re‑uploading the same file is safe; the importer is idempotent on `(job_id, contactid)`.

---

## Configuration

`config/imsb.php`:

```php
return [
    'routes' => [
        'enabled'    => true,                  // disable to drop the UI
        'prefix'     => 'imsb',
        'middleware' => ['web'],               // add 'auth' / your gate here
        'name'       => 'imsb.',
    ],

    'disk' => env('IMSB_DISK', 'local'),       // any Storage disk
    'path' => 'imsb',                          // sub-directory on the disk

    'exportables' => [
        // 'customers' => \App\Models\Customer::class,
    ],

    'export' => [
        'name_format'           => 'combined', // 'combined' (=> 'name')   or 'split' (=> fname/mname/lname)
        'city_state_zip_format' => 'split',    // 'split' (=> city/state/zip) or 'combined'
        'overflow'              => 'truncate', // 'truncate' | 'reject' | 'ignore'
    ],

    'write_back' => [
        'imb_barcode'      => 'encodedimbno',
        'imb_tray_id'      => 'presorttrayid',
        'imb_presort_date' => 'presortdate',
    ],
];
```

The `name_format` and `city_state_zip_format` options control which header set the exporter emits. Match them to whatever keys you used in `imsbMap()`.

---

## Programmatic use

You don't have to use the UI. Both halves are services you can resolve from the container:

```php
use JerseyMike\ImsbLink\Services\CsvExporter;
use JerseyMike\ImsbLink\Services\ResultImporter;

// Export — optionally pass a custom Builder for filtering.
$job = app(CsvExporter::class)->export(
    Customer::class,
    Customer::query()->where('mailing_list', 'spring-2026'),
    name: 'Spring 2026 mailer',
);

// $job->file_path now points at the CSV on the configured disk.
// Download it however you like.

// Later, after the user uploads the IMsb result:
app(ResultImporter::class)->import($job, $uploadedFile->getRealPath());
```

The exporter and importer both expose a `warnings()` method and persist warnings onto the job for display.

---

## Schema reference

Taken from the [IMsb Tool User Guide (April 2024)](https://postalpro.usps.com/), pages 19–24, 42, and 63–66.

### Upload columns (case‑insensitive, any order)

| Column | Max | Notes |
| --- | --- | --- |
| `name` | 50 | Combined name. Use **either** this **or** the split form below. |
| `fname` / `mname` / `lname` | 50 each (combined ≤50) | Split name. Aliases `first name`, `middle name`, `last name` accepted. |
| `company` | 50 | Optional. |
| `urbanization` | 28 | Puerto Rico addresses only. |
| `address` | 50 | **Required** — primary delivery address. |
| `sec-address` | 50 | Suite / apt / PMB. |
| `city-state-zip` | 50 | Combined last‑line. Use **either** this **or** the split form below. |
| `city` / `state` / `zip` | 50 / 25 / 10 | Combined length must be < 51. |
| `contactid` | — | User‑supplied key echoed back in result downloads. We default to the model PK. |

Minimum required to produce a valid address: name + address + city/state/zip (or the combined equivalents).

### Result downloads

The package recognises two shapes:

- **Mail Merge file** — has `encodedimbno`, `presorttrayid`, `presortdate` plus the AMS‑validated address fields.
- **Updated Address List** — AMS‑corrected version of the input. Rows IMsb couldn't validate are kept (without IMb data) and marked `unmatched`.

Both are matched back to original pieces via `contactid`.

---

## Testing

```bash
composer install
vendor/bin/phpunit
```

The test suite uses Orchestra Testbench against an in‑memory SQLite database and exercises:

- Header generation for both name/CSZ layouts.
- Length truncation, formula‑injection escaping, alias canonicalization.
- A full export → fixture‑based import → write‑back round trip.
- The "row in the result file that wasn't in the original export" case (records a warning).
- Updated‑Address‑List handling (no `encodedimbno` ⇒ marked `unmatched`).

---

## Limitations and non‑goals

- **No live API.** USPS doesn't offer one for IMsb. The human still does the upload/download in the BCG. This package handles everything either side of that.
- **Not a Move Update method.** AMS validates that an address is a real deliverable point; it does not verify that the named recipient still lives there. (Same caveat USPS prints in the IMsb guide.)
- **Not for Mail Service Providers.** USPS forbids using IMsb to prepare mail on behalf of others. If that's your use case, look at certified Full‑Service software vendors instead.
- **Per‑mailing limits.** IMsb caps individual mailings at < 50,000 pieces entered at a BMEU. The annual cap was removed in 2023, but the per‑mailing one still applies.

---

## Credits and license

Built by [Mike Assad](https://github.com/jersey-mike). Schema and behaviour derived from the USPS *Intelligent Mail for Small Business (IMsb) Tool — User Guide, April 2024*.

MIT licensed. See [LICENSE](LICENSE).
