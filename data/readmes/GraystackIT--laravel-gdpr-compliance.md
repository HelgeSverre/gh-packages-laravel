# Laravel GDPR Compliance

A comprehensive GDPR/DSGVO compliance toolkit for Laravel applications. Declare personal data on your Eloquent models, manage consent, export subject data, schedule erasure with grace periods and legal hold, and maintain a tamper-evident audit trail — all through a fluent PHP API.

## Features

- **Fluent personal data declaration** on any Eloquent model via a builder DSL
- **Registry-driven processing** — one config array lists all PII-holding models; no relation graph to maintain
- **Subject data export** (DSGVO Art. 15) as a structured JSON file, dispatched as a queue job
- **Subject data erasure** (DSGVO Art. 17) with configurable grace period, three retention modes (`delete`, `anonymize`, `legal_hold`), and deterministic processing order for FK safety
- **Per-purpose consent management** — append-only `consents` table, cookie consent helper, middleware
- **Policy version tracking** with subject acceptance records
- **Event-driven audit log** (`gdpr_audits`) that never stores PII values — only field names, event names, and metadata
- **7 built-in anonymizers** (name, email, phone, IP address, address, free text, static text) with custom alias support
- **Package inventory scanner** that reads `composer.lock` + `package-lock.json` and writes a JSON snapshot
- **4 Laravel Notifications** for deletion requested/cancelled/completed and export ready — overridable via config
- **3 middleware** for consent-gated routes, cookie propagation, and deletion-pending auth blocking
- **8 Artisan commands** for daily operations, reporting, pruning, and inventory scanning
- **3 queue jobs** for async export, deletion processing, and legal hold cleanup

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-gdpr-compliance
```

Publish the config and migrations:

```bash
php artisan vendor:publish --tag=gdpr-config
php artisan vendor:publish --tag=gdpr-migrations
php artisan migrate
```

Optionally publish translations and notification views for customization:

```bash
php artisan vendor:publish --tag=gdpr-lang
php artisan vendor:publish --tag=gdpr-views
```

## Quick Start

### 1. Declare personal data on your models

Every model that holds personal data implements `PersonalData` and uses one or more GDPR traits:

```php
namespace App\Models;

use GraystackIt\Gdpr\Contracts\PersonalData;
use GraystackIt\Gdpr\Enums\RetentionMode;
use GraystackIt\Gdpr\Support\PersonalDataBlueprint;
use GraystackIt\Gdpr\Traits\HasConsentRecords;
use GraystackIt\Gdpr\Traits\HasPersonalData;
use GraystackIt\Gdpr\Traits\IsPersonalDataSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements PersonalData
{
    use HasPersonalData, IsPersonalDataSubject, HasConsentRecords;

    public function personalData(PersonalDataBlueprint $b): PersonalDataBlueprint
    {
        return $b
            // PII: anonymize AND export
            ->field('name')->anonymizeWith('name')->exportable()
            ->field('email')->anonymizeWith('email')->exportable()
            ->field('phone')->anonymizeWith('phone')->exportable()

            // PII internal: anonymize only, do NOT export
            ->field('password')
                ->anonymizeWith('static_text', ['value' => '[ANONYMIZED]'])

            // Non-PII metadata: export only, never touched
            ->field('created_at')->exportable()
            ->field('locale')->exportable()

            ->retention(
                mode: RetentionMode::Delete,
                gracePeriodDays: 7,  // 0 = immediate, max 30
            )
            ->processOrder(1000); // subject is processed last
    }
}
```

Related models (that are NOT subjects) use `HasPersonalData` and define a scope:

```php
namespace App\Models;

use GraystackIt\Gdpr\Contracts\PersonalData;
use GraystackIt\Gdpr\Enums\RetentionMode;
use GraystackIt\Gdpr\Support\PersonalDataBlueprint;
use GraystackIt\Gdpr\Traits\HasPersonalData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Order extends Model implements PersonalData
{
    use HasPersonalData;

    public function personalData(PersonalDataBlueprint $b): PersonalDataBlueprint
    {
        return $b
            ->field('shipping_address')->anonymizeWith('address')->exportable()
            ->field('billing_email')->anonymizeWith('email')->exportable()
            ->field('total')->exportable()
            ->field('created_at')->exportable()
            ->retention(
                mode: RetentionMode::LegalHold,
                legalHoldDays: 3650,              // 10 years
                legalBasis: '§ 147 AO — tax record retention',
            )
            ->processOrder(100); // children before subject
    }

    public function scopePersonalDataForSubject(Builder $query, Model $subject): Builder
    {
        return match (true) {
            $subject instanceof \App\Models\User => $query->where('user_id', $subject->getKey()),
            default => $query->whereRaw('1 = 0'),
        };
    }
}
```

### 2. Register models in config

In `config/gdpr.php`, list every model that contains personal data:

```php
'models' => [
    \App\Models\User::class,
    \App\Models\Order::class,
    \App\Models\Address::class,
    \App\Models\Comment::class,

    // Vendor models with external profile and scope
    \Vendor\Package\ExternalModel::class => [
        'profile' => \App\Gdpr\Profiles\ExternalProfile::class,
        'scope'   => \App\Gdpr\Scopes\ExternalScope::class,
    ],
],
```

### 3. Use the API

```php
use GraystackIt\Gdpr\Facades\GDPR;

// --- Deletion ---
$user->requestDeletion();            // schedule with grace period
$user->deleteImmediately();          // skip grace, process now
$user->cancelDeletion();             // cancel during grace

GDPR::isDeletionPending($user);      // bool
User::whereDeletionPending()->get(); // query scope
User::whereNotDeletionPending()->get();

// --- Export ---
$request = $user->requestExport();   // creates a GdprRequest

// Dispatch the export job manually or let the command do it:
\GraystackIt\Gdpr\Jobs\PreparePersonalDataExportJob::dispatch($request->id);

// --- Consent ---
use GraystackIt\Gdpr\Enums\ConsentPurpose;

$user->grantConsent(ConsentPurpose::Analytics, 'cookie_banner');
$user->withdrawConsent(ConsentPurpose::Marketing);
$user->hasConsent(ConsentPurpose::Analytics);  // bool
$user->consentStatus();                         // ['necessary' => true, 'analytics' => true, ...]

// --- Package inventory ---
GDPR::packageInventory(); // returns array from last scan, or null
```

## Trait Reference

| Trait | Who uses it | What it provides |
|---|---|---|
| `HasPersonalData` | Any model with PII (User, Order, Address, ...) | Marker trait. No runtime behavior — the package reads personalData() via the registry. |
| `IsPersonalDataSubject` | Only subjects (User, Customer, ...) | `requestDeletion()`, `deleteImmediately()`, `cancelDeletion()`, `requestExport()`, `isDeletionPending()`, `scopeWhereDeletionPending()`, `scopeWhereNotDeletionPending()` |
| `HasConsentRecords` | Subjects that need consent tracking | `grantConsent()`, `withdrawConsent()`, `hasConsent()`, `consentStatus()`, `consents()` relationship |

## Per-Field DSL

Both behaviors are opt-in per field:

| Call | Effect |
|---|---|
| `->field('x')->anonymizeWith('alias')` | Anonymize only |
| `->field('x')->exportable()` | Export only |
| `->field('x')->anonymizeWith('alias')->exportable()` | Both |
| `->field('x')` (nothing further) | Throws on `build()` — the field is functionless |

### Built-in anonymizer aliases

| Alias | Class | Behavior |
|---|---|---|
| `name` | `NameAnonymizer` | Replaces with `"Anonymous User"` (configurable via `placeholder`) |
| `email` | `EmailAnonymizer` | Replaces with `anonymized_<random>@example.invalid` (configurable `domain`) |
| `phone` | `PhoneAnonymizer` | Replaces with `+00 000 0000000` (configurable `placeholder`) |
| `ip_address` | `IpAddressAnonymizer` | IPv4: masks last octet by default (`octet`), or `half` or `full`. IPv6: keeps first 4 groups. |
| `address` | `AddressAnonymizer` | Strings → `[REDACTED ADDRESS]`. Arrays → each value `[REDACTED]`. |
| `free_text` | `FreeTextAnonymizer` | Full replacement by default. Set `replace_email`, `replace_phone`, `replace_urls` to selectively replace patterns. |
| `static_text` | `StaticTextAnonymizer` | Returns `config.value` (default `[REDACTED]`). |

Register custom anonymizers in `config/gdpr.php`:

```php
'anonymizers' => [
    // ... built-in aliases
    'ssn' => \App\Gdpr\Anonymizers\SsnAnonymizer::class,
],
```

Your class must implement `GraystackIt\Gdpr\Contracts\Anonymizer`.

## Retention Modes

Configured per model via `->retention()`:

```php
->retention(
    mode: RetentionMode::Delete,       // 'delete' | 'anonymize' | 'legal_hold'
    gracePeriodDays: 7,                // 0 = immediate, max 30 (DSGVO Art. 12(3))
    legalHoldDays: 3650,               // required if mode = legal_hold
    legalBasis: '§ 147 AO',           // optional, recommended for legal_hold
)
```

| Mode | After grace | Terminal state |
|---|---|---|
| `delete` | Row is hard-deleted | `erased` |
| `anonymize` | Fields wiped via anonymizers, row stays | `anonymized` |
| `legal_hold` | Fields wiped, row retained until `hold_until` | `pending_legal_hold` → `erased` after expiry |

### Processing order

`->processOrder(int)` controls the sequence when multiple models are processed for the same subject. Lower numbers go first. Convention:

| Range | Use |
|---|---|
| 1–99 | Pivot/junction tables |
| 100–199 | Direct children (Order, Address, Comment) |
| 200–299 | Indirect children (LoginAttempt, Metrics) |
| 1000 | The subject itself |

This prevents FK constraint violations when children reference the subject with `NOT NULL` foreign keys.

## Deletion Lifecycle

```
$user->requestDeletion()
  → gdpr_deletions rows created per affected model (with retention snapshot)
  → Host model rows UNTOUCHED during grace
  → Cancellation at any time: $user->cancelDeletion()

Cron Pass 1 (gdpr:process-deletions, daily):
  → Grace expired: process per snapshot mode (delete/anonymize/legal_hold)
  → Each model follows its OWN retention, sorted by processOrder

Cron Pass 2:
  → Legal hold expired: mandatory forceDelete
```

**During the grace period, nothing is modified on host model rows.** The entire grace state lives in the `gdpr_deletions` table. This means:

- Cancellation is trivial — just flip the state
- The package never forces `SoftDeletes` on your models
- Auth behavior during grace is your app's decision (see below)

### Auth during grace

The package does not lock users out during grace. Use these helpers to implement your preferred UX:

```php
// In your auth logic
if (GDPR::isDeletionPending($user)) {
    // Block login, show banner, redirect, etc.
}

// Or as middleware on auth routes
Route::middleware('gdpr.no-deletion-pending')->group(function () {
    // ...
});

// Or as a query scope
User::whereNotDeletionPending()->where('email', $email)->first();
```

## Consent Management

### Database consent (authenticated users)

```php
$user->grantConsent(ConsentPurpose::Analytics, 'cookie_banner');
$user->withdrawConsent(ConsentPurpose::Analytics, 'profile_settings');
$user->hasConsent(ConsentPurpose::Analytics); // latest action wins
```

The `consents` table is **append-only**. Each grant and withdraw is a new row. The current state is the latest row per `(subject, purpose)`.

`ConsentPurpose::Necessary` always returns `true` without any database check.

### Cookie consent (anonymous visitors)

The `ConsentCookieManager` reads/writes a JSON cookie (`gdpr_consent`) with per-purpose booleans:

```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false,
  "embedded_content": true,
  "policy_version": "2026-04",
  "updated_at": "2026-04-08T12:00:00Z"
}
```

### Consent middleware

```php
// Block routes that require marketing consent
Route::middleware('gdpr.consent:marketing')->group(function () {
    // Returns 451 Unavailable For Legal Reasons if consent is missing
});

// Necessary always passes
Route::middleware('gdpr.consent:necessary')->group(function () {
    // Always accessible
});
```

## Audit Log

The `gdpr_audits` table records deletion/export pipeline events only. It **never** stores:

- Field values (only field names)
- Raw user agents or full IP addresses
- Consent grants/withdrawals (those live in `consents`)
- Policy acceptances (those live in `gdpr_policy_acceptances`)

After a subject is hard-deleted, their audit entries survive as orphans — the `subject_id` FK points nowhere, which means no re-identification is possible. This is by design.

Logged events: `deletion_requested`, `deletion_scheduled`, `deletion_cancelled`, `anonymization_completed`, `deletion_completed`, `legal_hold_started`, `legal_hold_expired`, `export_requested`, `export_completed`.

## Events

The package fires these events for external system integration (e.g., deleting Stripe customers, removing Mailchimp subscribers):

| Event | Payload | When |
|---|---|---|
| `PersonalDataDeletionRequested` | `GdprRequest` | `requestDeletion()` called |
| `PersonalDataDeletionCancelled` | `GdprRequest` | `cancelDeletion()` called |
| `PersonalDataAnonymized` | `GdprDeletion` | After fields wiped on a model |
| `PersonalDataErased` | `GdprDeletion` | After row hard-deleted |
| `LegalHoldStarted` | `GdprDeletion` | Row enters legal hold |
| `LegalHoldExpired` | `GdprDeletion` | Row exits legal hold (force-deleted) |
| `PersonalDataExported` | `GdprRequest` | Export job completed |

```php
use GraystackIt\Gdpr\Events\PersonalDataErased;

Event::listen(PersonalDataErased::class, function ($event) {
    // $event->deletion->subject_type, $event->deletion->subject_id
    // Clean up Stripe, Mailchimp, S3 avatars, etc.
});
```

## Notifications

Four mail notifications are sent automatically (when `config('gdpr.notifications.enabled')` is `true`):

| Notification | When | Final? |
|---|---|---|
| `PersonalDataDeletionRequestedNotification` | On `requestDeletion()` | No |
| `PersonalDataDeletionCancelledNotification` | On `cancelDeletion()` | Yes (email wiped) |
| `PersonalDataDeletionCompletedNotification` | After processing | Yes (email wiped) |
| `PersonalDataExportReadyNotification` | After export job | Yes (email wiped) |

The recipient email is **snapshotted** into `gdpr_requests.notification_email` at request time, so notifications work even after the subject's data has been anonymized or deleted. After the final notification, the email is wiped.

### Customizing notifications

**Text only**: publish translations with `php artisan vendor:publish --tag=gdpr-lang` and edit `lang/vendor/gdpr/en/gdpr.php`.

**Deep customization**: override the class in `config/gdpr.php`:

```php
'notifications' => [
    'deletion_requested' => \App\Notifications\MyDeletionRequested::class,
    'deletion_cancelled' => false,  // disable this notification
    'deletion_completed' => null,   // use package default
    'export_ready' => null,
],
```

## Artisan Commands

| Command | Purpose |
|---|---|
| `gdpr:process-deletions` | Run daily via scheduler. Processes grace-expired and legal-hold-expired rows. |
| `gdpr:export {subject} {id}` | Create an export request and dispatch the export job. |
| `gdpr:erase {subject} {id} [--now]` | Request deletion. `--now` skips grace. |
| `gdpr:audit [--subject=] [--id=] [--event=]` | Show recent audit entries with filters. |
| `gdpr:report` | Summary of requests, deletions, consent counts, audit counts. |
| `gdpr:packages-scan` | Scan `composer.lock` + `package-lock.json` and write inventory JSON. |
| `gdpr:cleanup-exports [--disk=local]` | Delete expired export files from storage. |
| `gdpr:prune [--dry-run] [--table=]` | Time-based pruning of audits, consents, policy acceptances, and stale notification emails. |

### Scheduling

Add to your `routes/console.php` or scheduler:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('gdpr:process-deletions')->daily();
Schedule::command('gdpr:cleanup-exports')->daily();
Schedule::command('gdpr:prune')->weekly();
```

### Package inventory

Wire the scanner into your host app's `composer.json`:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan gdpr:packages-scan"
    ]
}
```

Access the inventory programmatically:

```php
$inventory = GDPR::packageInventory();
// Returns: ['generated_at' => '...', 'composer' => [...], 'npm' => [...]]
```

## Pruning & Retention

The `gdpr:prune` command handles time-based cleanup:

| Table | Default retention | Special rules |
|---|---|---|
| `gdpr_audits` | 3 years (1095 days) | — |
| `consents` | 3 years | Latest row per `(subject, purpose)` is always preserved |
| `gdpr_policy_acceptances` | 3 years | — |
| `gdpr_requests.notification_email` | 7 days after terminal status | Wiped to `NULL`, row itself retained for 3 years |

Configure in `config/gdpr.php`:

```php
'retention' => [
    'audits_days' => 1095,
    'consents_days' => 1095,
    'policy_acceptances_days' => 1095,
    'notification_email_days' => 7,
],
```

## Database Tables

| Table | Purpose |
|---|---|
| `consents` | Append-only consent records (grant/withdraw) per subject and purpose |
| `gdpr_requests` | Top-level request lifecycle (export/delete), email snapshot |
| `gdpr_deletions` | One row per (request x affected model), retention snapshot, state machine, process_order |
| `gdpr_audits` | Event-driven audit log for the deletion/export pipeline |
| `gdpr_policy_versions` | Policy version definitions (privacy, imprint, ToS) |
| `gdpr_policy_acceptances` | Subject acceptance records per policy version |

## GDPR Compliance Notes

### Anonymization vs. pseudonymization

The `anonymize` mode replaces personal field values with non-identifying placeholders. Whether the result qualifies as true **anonymization** (GDPR no longer applies) or **pseudonymization** (GDPR still applies) depends on which fields you configure.

To achieve proper anonymization, ensure you mark **all** identifying fields — including quasi-identifiers:

- **Birthdate + ZIP + gender** can uniquely identify 87% of the US population (Sweeney 2000)
- **Behavioral patterns** in related tables (order timestamps, login times) may re-identify subjects
- **External datasets** can be joined to remaining data points

The package gives you the tooling. Field selection is your responsibility.

### Grace period

- Default `0` days (immediate processing). Opt in per model.
- Hard cap at **30 days** (DSGVO Art. 12(3): "without undue delay, in any event within one month").
- During grace, **no host model data is modified** — cancellation is a clean rollback.

### Legal hold

- Enabled via `RetentionMode::LegalHold` with `legalHoldDays`.
- The `legalBasis` field is optional but recommended — the audit log records it for compliance evidence.
- After `hold_until` expires, the row is **mandatorily** force-deleted by the cron command.

### Backups

The package cannot reach into backup files. If you restore from a backup, pending deletion requests should be re-applied. Document your backup retention in your privacy policy and ensure backups rotate within a documented window.

### Subject-to-subject references

When processing Subject A, the package never modifies Subject B — even if B has a foreign key to A. Use `onDelete('set null')` on FK migrations or listen to the `PersonalDataErased` event to handle cross-subject cleanup in your app code.

## Publishing Reference

| Tag | What it publishes | Required? |
|---|---|---|
| `gdpr-config` | `config/gdpr.php` | Yes |
| `gdpr-migrations` | `database/migrations/*.php` | Yes |
| `gdpr-lang` | `lang/vendor/gdpr/en/gdpr.php` | No — for text customization |
| `gdpr-views` | `resources/views/vendor/gdpr/notifications/*.blade.php` | No — for mail branding |
| `gdpr-notifications` | `app/Notifications/*.php` | No — for deep notification customization |
| `gdpr` | All of the above | Convenience |

## Testing

```bash
composer test
```

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.
