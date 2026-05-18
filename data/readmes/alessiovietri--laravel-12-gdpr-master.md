# Laravel 12 GDPR Master

**The gold-standard Laravel 12 package for full GDPR compliance**

Consent management with button parity, agnostic legal document tracking with versioning, data portability (Art. 20), right to erasure (Art. 17), automated data retention, immutable audit logging, cookie banner with preventive script blocking, and policy pages — all in one modular, extensible package built for Laravel 12 and PHP 8.3+.

---

## Table of Contents

- [Why This Package](#why-this-package)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Feature Toggles](#feature-toggles)
  - [Legal Documents (Agnostic Consent)](#legal-documents-agnostic-consent)
  - [Cookie Consent Categories](#cookie-consent-categories)
  - [Data Export](#data-export)
  - [Anonymization](#anonymization)
  - [Data Retention](#data-retention)
  - [Audit Logging](#audit-logging)
  - [Cookie Banner](#cookie-banner)
  - [Multi-Tenant Support](#multi-tenant-support)
- [User Model Setup](#user-model-setup)
- [Legal Document Consent](#legal-document-consent)
  - [Accepting Documents](#accepting-documents)
  - [Checking Acceptance](#checking-acceptance)
  - [Version Tracking](#version-tracking)
  - [Pending Documents](#pending-documents)
  - [Revoking Consent](#revoking-consent)
- [RequireLegalConsent Middleware](#requirelegalconsent-middleware)
  - [Basic Usage](#middleware-basic-usage)
  - [How It Works](#how-the-middleware-works)
  - [Consent Gate Page](#consent-gate-page)
  - [API Routes (JSON)](#api-routes-json)
- [Cookie Consent (Banner)](#cookie-consent-banner)
  - [Bulk Consent from Banner](#bulk-consent-from-banner)
  - [Checking Cookie Consent](#checking-cookie-consent)
  - [Preventive Script Blocking](#preventive-script-blocking)
- [Data Portability (Export)](#data-portability-export)
  - [Basic Export](#basic-export)
  - [Adding Custom Entities](#adding-custom-entities)
  - [Export Strategies](#export-strategies)
- [Right to Erasure (Anonymization)](#right-to-erasure-anonymization)
- [Data Retention & Pruning](#data-retention--pruning)
- [Cookie Banner & Frontend](#cookie-banner--frontend)
- [Events](#events)
- [Extending the Package](#extending-the-package)
  - [IoC Binding Overrides](#ioc-binding-overrides)
  - [Policy Customizer](#policy-customizer)
  - [Custom Export Strategy](#custom-export-strategy)
- [Publishing Assets](#publishing-assets)
- [Localization (i18n)](#localization-i18n)
- [Artisan Commands](#artisan-commands)
- [Database Schema](#database-schema)
- [Architecture Overview](#architecture-overview)
- [Testing](#testing)
- [License](#license)

---

## Why This Package


| GDPR Requirement                           | Article      | Implementation                                             |
| ------------------------------------------ | ------------ | ---------------------------------------------------------- |
| Lawful consent with equal accept/reject    | Art. 7       | Cookie banner with button parity + preventive blocking     |
| Versioned consent for legal documents      | Art. 7(2)    | Polymorphic consent table with `document_version` tracking |
| Right of access / data portability         | Art. 15, 20  | ZIP export with JSON/CSV strategy pattern                  |
| Right to erasure ("right to be forgotten") | Art. 17      | Soft anonymization or hard delete with event dispatch      |
| Storage limitation                         | Art. 5(1)(e) | Automated data retention pruning via scheduled command     |
| Records of processing activities           | Art. 30      | Immutable consent audit log with anonymized IP             |
| Data protection by design                  | Art. 25      | Modular architecture, IoC bindings, feature toggles        |


---

## Requirements


| Dependency | Version                  |
| ---------- | ------------------------ |
| PHP        | >= 8.3                   |
| Laravel    | >= 12.0                  |
| ext-zip    | Required for data export |


---

## Installation

### Quick Install

```bash
composer require alessiovietri/laravel-12-gdpr-master
php artisan gdpr:install
php artisan migrate
```

The `gdpr:install` command publishes config, migrations, translations, views, and frontend assets.

```bash
php artisan gdpr:install --force              # Overwrite existing files
php artisan gdpr:install --with-customizer    # Also publish GdprPolicyCustomizer to app/Gdpr/
```

### Manual Install

```bash
php artisan vendor:publish --tag=gdpr-config
php artisan vendor:publish --tag=gdpr-migrations
php artisan vendor:publish --tag=gdpr-translations
php artisan vendor:publish --tag=gdpr-views
php artisan vendor:publish --tag=gdpr-assets
php artisan vendor:publish --tag=gdpr-markdown
php artisan migrate
```

---

## Configuration

After publishing, edit `config/gdpr.php`.

### Feature Toggles

```php
'features' => [
    'consent_management' => true,
    'data_portability'   => true,
    'right_to_erasure'   => true,
    'data_retention'     => true,
    'audit_logging'      => true,
    'cookie_banner'      => true,
    'policy_pages'       => true,
    'legal_documents'    => true,
],
```

### Legal Documents (Agnostic Consent)

The heart of the consent architecture. Define **every** legal document your application needs consent for. The config only stores **structural data** — all display labels, page titles, and URL slugs are resolved from translation files at runtime:

```php
'legal_documents' => [
    'privacy_policy' => [
        'current_version' => '1.0.0',    // Bump when you update the document
        'required'        => true,        // Middleware will enforce acceptance
        'source'          => 'markdown',  // 'markdown' | 'view'
        'file'            => 'privacy-policy.md',
    ],
    'terms_of_service' => [
        'current_version' => '1.0.0',
        'required'        => true,
        'source'          => 'markdown',
        'file'            => 'terms-of-service.md',
    ],
    'cookie_policy' => [
        'current_version' => '1.0.0',
        'required'        => false,
        'source'          => 'markdown',
        'file'            => 'cookie-policy.md',
    ],
],
```

**Where do labels and routes come from?** Everything is in translation files:

```php
// lang/vendor/gdpr/en/gdpr.php
'documents' => [
    'privacy_policy'   => 'Privacy Policy',       // Display label
    'terms_of_service' => 'Terms of Service',
],
'routes' => [
    'privacy_policy'   => '/privacy-policy',       // URL slug
    'terms_of_service' => '/terms-of-service',
],

// lang/vendor/gdpr/it/gdpr.php
'documents' => [
    'privacy_policy'   => 'Informativa sulla Privacy',
    'terms_of_service' => 'Termini di Servizio',
],
'routes' => [
    'privacy_policy'   => '/informativa-privacy',
    'terms_of_service' => '/termini-di-servizio',
],
```

**How version tracking works:** when you update your Privacy Policy, bump `current_version` to `'2.0.0'`. The middleware and `hasAcceptedLatest()` will detect outdated consent and re-prompt users.

### Cookie Consent Categories

Separate from legal documents. The config only stores structural flags — labels and descriptions come from translation files:

```php
// config/gdpr.php — structural only
'consent' => [
    'button_parity'       => true,
    'preventive_blocking' => true,
    'expiration_days'     => 365,

    'categories' => [
        'necessary'   => ['required' => true,  'default' => true],
        'analytics'   => ['required' => false, 'default' => false],
        'marketing'   => ['required' => false, 'default' => false],
        'preferences' => ['required' => false, 'default' => false],
    ],
],
```

Labels are in the translation files:

```php
// lang/vendor/gdpr/en/gdpr.php
'categories' => [
    'analytics' => [
        'label'       => 'Analytics',
        'description' => 'Cookies that help us understand how visitors interact with the website.',
    ],
    // ...
],

// lang/vendor/gdpr/it/gdpr.php
'categories' => [
    'analytics' => [
        'label'       => 'Analitici',
        'description' => 'Cookie che ci aiutano a capire come i visitatori interagiscono con il sito.',
    ],
],
```

### Data Export

```php
'export' => [
    'default_strategy' => 'json',  // 'json' | 'csv'
    'disk'             => 'local',
    'path'             => 'gdpr-exports',
    'retention_hours'  => 48,
    'entities'         => [
        // \App\Models\Order::class,
    ],
],
```

### Anonymization

```php
'anonymization' => [
    'soft_anonymize'    => true,
    'placeholder_email' => 'anonymized-{id}@gdpr.invalid',
    'placeholder_name'  => 'Anonymized User',
    'user_columns'      => [
        'name'  => 'placeholder_name',
        'email' => 'placeholder_email',
    ],
    'queue' => false,
],
```

### Data Retention

```php
'retention' => [
    'enabled'      => true,
    'default_days' => 730,
    'models'       => [
        // \App\Models\ActivityLog::class => 365,
    ],
],
```

### Audit Logging

```php
'audit' => [
    'enabled'       => true,
    'anonymize_ip'  => true,  // 192.168.1.42 → 192.168.1.0
    'retention_days' => 1825, // 5 years
],
```

### Cookie Banner

```php
'cookie_banner' => [
    'position'              => 'bottom',
    'accept_button_class'   => 'gdpr-btn gdpr-btn-primary',
    'reject_button_class'   => 'gdpr-btn gdpr-btn-primary', // Same style = button parity
    'settings_button_class' => 'gdpr-btn gdpr-btn-secondary',
    'cookie_name'           => 'gdpr_consent',
    'cookie_lifetime'       => 365,
],
```

### Multi-Tenant Support

```php
'database' => [
    'connection'         => env('GDPR_DB_CONNECTION', null),
    'tenant_aware'       => env('GDPR_TENANT_AWARE', false),
    'tenant_connection'  => env('GDPR_TENANT_CONNECTION', 'tenant'),
    'central_connection' => env('GDPR_CENTRAL_CONNECTION', null),
],
```

When `tenant_aware` is `true`, all GDPR model queries automatically use the tenant connection.

---

## User Model Setup

Add the GDPR traits to your `User` model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use AlessioVietri\GdprMaster\Traits\HasGdpr;
use AlessioVietri\GdprMaster\Traits\LogsConsent;

class User extends Authenticatable
{
    use HasGdpr;
    use LogsConsent;
}
```

The consent system is **polymorphic** — you can apply these traits to any model (User, Tenant, Organization) that needs to track consent.

### Available Methods


| Method                                           | Returns        | Description                                       |
| ------------------------------------------------ | -------------- | ------------------------------------------------- |
| `acceptConsent('terms_of_service', 'v2.1')`      | `GdprConsent`  | Accept a legal document with version              |
| `hasAccepted('terms_of_service')`                | `bool`         | Check if any active consent exists                |
| `hasAccepted('terms_of_service', 'v2.1')`        | `bool`         | Check for a specific version                      |
| `hasAcceptedLatest('privacy_policy')`            | `bool`         | Check against `current_version` in config         |
| `revokeConsent('marketing')`                     | `GdprConsent`  | Revoke consent for a document type                |
| `acceptMultiple(['tos' => 'v2', 'pp' => '1.0'])` | `array`        | Accept multiple documents at once                 |
| `pendingLegalDocuments()`                        | `array`        | List required documents not yet accepted (latest) |
| `recordBulkConsent($items)`                      | `array`        | Record multiple cookie category consents          |
| `activeConsent('privacy_policy')`                | `?GdprConsent` | Get the active consent record                     |
| `activeConsents()`                               | `array`        | All active consents keyed by document type        |
| `gdprConsentState()`                             | `array`        | Map of `[document_type => bool]`                  |
| `consentHistory('terms_of_service')`             | `MorphMany`    | Full audit trail for a document type              |
| `isGdprAnonymized()`                             | `bool`         | Check if user has been anonymized                 |


---

## Legal Document Consent

### Accepting Documents

```php
// Simple — version auto-resolved from config
$user->acceptConsent('terms_of_service');

// Explicit version
$user->acceptConsent('terms_of_service', 'v2.1');

// With request context (captures IP + User-Agent for audit)
$user->acceptConsent('privacy_policy', '1.0.0', $request);

// With metadata
$user->acceptConsent('privacy_policy', '1.0.0', $request, [
    'source' => 'registration_form',
    'ip_country' => 'IT',
]);

// Multiple at once (e.g., registration form with checkboxes)
$user->acceptMultiple([
    'terms_of_service' => 'v2.1',
    'privacy_policy'   => '1.0.0',
], $request);
```

Every call creates a `gdpr_consents` record AND an immutable `gdpr_consent_logs` entry, then fires `GdprConsentUpdated`.

### Checking Acceptance

```php
// Has the user accepted ANY version of the Terms?
$user->hasAccepted('terms_of_service'); // true/false

// Has the user accepted a SPECIFIC version?
$user->hasAccepted('terms_of_service', 'v2.1'); // true/false

// Has the user accepted the LATEST version from config?
$user->hasAcceptedLatest('terms_of_service'); // true/false
```

### Version Tracking

When you update a legal document:

1. Edit the document content
2. Bump the version in config:

```php
'terms_of_service' => [
    'current_version' => '2.0.0', // was '1.0.0'
],
```

1. Users who accepted `1.0.0` will now fail `hasAcceptedLatest()` and be caught by the middleware

### Pending Documents

Check which required documents the user still needs to accept:

```php
$pending = $user->pendingLegalDocuments();
// ['terms_of_service', 'privacy_policy']

if (count($pending) > 0) {
    // Redirect to consent gate or show a prompt
}
```

### Revoking Consent

```php
$user->revokeConsent('marketing');
$user->revokeConsent('analytics', $request, ['reason' => 'user_requested']);
```

Revocation sets `revoked_at` on the consent record and creates an audit log with `action = 'revoked'`.

---

## RequireLegalConsent Middleware

A route middleware that blocks access unless the user has accepted the latest version of specified legal documents.

### Basic Usage {#middleware-basic-usage}

```php
use Illuminate\Support\Facades\Route;

// Require Terms of Service + Privacy Policy
Route::middleware('gdpr.consent:terms_of_service,privacy_policy')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class);
        Route::get('/settings', SettingsController::class);
    });

// Require only Terms of Service
Route::get('/checkout', CheckoutController::class)
    ->middleware('gdpr.consent:terms_of_service');
```

### How the Middleware Works

1. Checks if the authenticated user exists and has the `hasAcceptedLatest()` method
2. For each specified `document_type`, calls `$user->hasAcceptedLatest($type)`
3. If **all** are accepted, the request passes through
4. If any are **pending**:
  - **Web requests:** redirects to the consent-gate page with the intended URL saved in session
  - **JSON/API requests:** returns a `403` response with the list of pending documents

### Consent Gate Page

The package ships with a pre-built consent-gate page at `GET /gdpr/consent-required`. It displays:

- A list of pending documents with checkboxes
- Links to read the full document text
- A "Continue" button that POSTs to `gdpr/consent/accept-documents`

After acceptance, the user is redirected back to their originally intended URL.

**Customize the view:**

```bash
php artisan vendor:publish --tag=gdpr-views
```

Then edit `resources/views/vendor/gdpr/pages/consent-required.blade.php`.

### API Routes (JSON)

For API/SPA applications, the middleware returns structured JSON:

```json
{
    "message": "You must accept the required legal documents before accessing this resource.",
    "pending": ["terms_of_service", "privacy_policy"],
    "documents": {
        "terms_of_service": "/terms-of-service",
        "privacy_policy": "/privacy-policy"
    }
}
```

Your SPA can use this to show a consent modal or redirect to the document pages.

---

## Cookie Consent (Banner)

Cookie consent is separate from legal documents. It uses the same polymorphic table but is driven by the banner UI.

### Bulk Consent from Banner

```php
use AlessioVietri\GdprMaster\DTOs\ConsentData;

$categories = $request->input('categories');
// ['analytics' => true, 'marketing' => false, 'preferences' => true]

$consentItems = ConsentData::fromBannerPayload($categories, [
    'banner_version' => '2.1',
    'page_url'       => $request->url(),
]);

$user->recordBulkConsent($consentItems, $request);
```

### Checking Cookie Consent

```php
$user->hasAccepted('analytics');  // true/false
$user->hasAccepted('marketing');  // true/false
```

### Preventive Script Blocking

Replace standard `<script>` tags with GDPR-aware versions:

```html
<!-- Blocked until 'analytics' consent is given -->
<script type="text/plain" data-gdpr-category="analytics"
        data-gdpr-src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
        data-gdpr-async></script>

<!-- Inline script blocked until 'marketing' consent -->
<script type="text/plain" data-gdpr-category="marketing">
    fbq('init', '1234567890');
</script>
```

The `type="text/plain"` prevents execution. When consent is given, the included JS manager activates the scripts.

---

## Data Portability (Export)

### Basic Export

```php
use AlessioVietri\GdprMaster\Contracts\ExportUserDataContract;

class DataExportController extends Controller
{
    public function download(ExportUserDataContract $exporter)
    {
        $zipPath = $exporter->execute(auth()->user());
        return response()->download($zipPath)->deleteFileAfterSend();
    }
}
```

### Adding Custom Entities

Implement `Exportable` on your model and register it in config:

```php
use AlessioVietri\GdprMaster\Contracts\Exportable;

class Order extends Model implements Exportable
{
    public function gdprExportLabel(): string { return 'orders'; }

    public function gdprExportData(int|string $userId): Collection
    {
        return static::where('user_id', $userId)->get();
    }

    public function gdprExportColumns(): array
    {
        return ['id', 'status', 'total', 'created_at'];
    }
}
```

```php
// config/gdpr.php
'export' => ['entities' => [\App\Models\Order::class]],
```

### Export Strategies

Switch formats via config or create custom strategies:

```php
'export' => ['default_strategy' => 'csv'], // or 'json'
```

Custom strategy:

```php
use AlessioVietri\GdprMaster\Strategies\ExportStrategy;

class XmlExportStrategy implements ExportStrategy
{
    public function extension(): string { return 'xml'; }
    public function mimeType(): string { return 'application/xml'; }
    public function serialize(ExportableEntity $entity): string { /* ... */ }
}
```

---

## Right to Erasure (Anonymization)

```php
use AlessioVietri\GdprMaster\Contracts\AnonymizeUserContract;

$anonymizer = app(AnonymizeUserContract::class);
$count = $anonymizer->execute($user);
// name → "Anonymized User", email → "anonymized-42@gdpr.invalid"
// All consents revoked, UserAnonymized event fired
```

Implement `Anonymizable` on related models for automatic cascade:

```php
use AlessioVietri\GdprMaster\Contracts\Anonymizable;

class CustomerProfile extends Model implements Anonymizable
{
    public function gdprAnonymizableColumns(): array
    {
        return ['phone' => '000-000-0000', 'address' => 'REDACTED'];
    }

    public function gdprAnonymize(): bool
    {
        foreach ($this->gdprAnonymizableColumns() as $col => $placeholder) {
            $this->setAttribute($col, $placeholder);
        }
        return $this->save();
    }

    public function gdprShouldHardDelete(): bool { return false; }
}
```

---

## Data Retention & Pruning

Apply `HasDataRetention` + `Retainable` on models, register in config, then schedule:

```php
use AlessioVietri\GdprMaster\Contracts\Retainable;
use AlessioVietri\GdprMaster\Traits\HasDataRetention;

class ActivityLog extends Model implements Retainable
{
    use HasDataRetention;
}
```

```php
// config/gdpr.php
'retention' => ['models' => [\App\Models\ActivityLog::class => 365]],
```

```php
// routes/console.php
Schedule::command('gdpr:prune-data')->daily();
```

```bash
php artisan gdpr:prune-data --dry-run   # Preview
php artisan gdpr:prune-data             # Execute
```

---

## Cookie Banner & Frontend

Add to your layout:

```html
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('vendor/gdpr/css/gdpr.css') }}">
</head>
<body>
    {{ $slot }}
    <x-gdpr::cookie-banner />
    <script src="{{ asset('vendor/gdpr/js/gdpr.js') }}"></script>
</body>
```

Customize by publishing views (`--tag=gdpr-views`) or assets (`--tag=gdpr-assets`).

---

## Events


| Event                | Fired When                                   | Payload                              |
| -------------------- | -------------------------------------------- | ------------------------------------ |
| `GdprConsentUpdated` | Any consent is accepted, updated, or revoked | `$model`, `$consent`, `$data`        |
| `UserAnonymized`     | User data is fully anonymized                | `$user`, `$relatedRecordsAnonymized` |


```php
use AlessioVietri\GdprMaster\Events\GdprConsentUpdated;

class HandleConsentChange
{
    public function handle(GdprConsentUpdated $event): void
    {
        if ($event->isRevocation() && $event->documentType() === 'marketing') {
            // Unsubscribe from mailing list
        }
    }
}
```

---

## Extending the Package

### IoC Binding Overrides

Every action is resolved via contracts. Override in config or AppServiceProvider:

```php
// config/gdpr.php
'bindings' => [
    'export_action'    => \App\Gdpr\MyExporter::class,
    'anonymize_action' => \App\Gdpr\MyAnonymizer::class,
    'export_strategy'  => \App\Gdpr\XmlExportStrategy::class,
],
```

Or in code (wins over config):

```php
// AppServiceProvider::register()
$this->app->bind(ExportUserDataContract::class, MyExporter::class);
```

### Policy Customizer

```bash
php artisan gdpr:install --with-customizer
```

Override lifecycle hooks:

```php
class GdprPolicyCustomizer extends BaseCustomizer
{
    public function canExportData(Model $user): bool { return !$user->is_under_investigation; }
    public function canAnonymize(Model $user): bool { return !$user->orders()->pending()->exists(); }
    public function filterExportRecord(string $label, array $record): array { /* redact fields */ }
    public function afterAnonymization(Model $user): void { /* notify admins */ }
    public function afterExport(Model $user, string $path): void { /* log for audit */ }
    public function additionalConsentCategories(): array { /* runtime categories */ }
}
```

### Custom Export Strategy

Implement `ExportStrategy` and register via config `bindings.export_strategy`.

---

## Publishing Assets


| Tag                 | Destination                    | Content                   |
| ------------------- | ------------------------------ | ------------------------- |
| `gdpr-config`       | `config/gdpr.php`              | Configuration             |
| `gdpr-migrations`   | `database/migrations/`         | Database tables           |
| `gdpr-translations` | `lang/vendor/gdpr/`            | EN + IT translations      |
| `gdpr-views`        | `resources/views/vendor/gdpr/` | Blade components + pages  |
| `gdpr-assets`       | `public/vendor/gdpr/{css,js}/` | Cookie banner CSS + JS    |
| `gdpr-markdown`     | `resources/markdown/gdpr/`     | Policy/ToS Markdown stubs |


---

## Localization (i18n)

**Every frontend-facing string in the package is translatable.** Ships with English and Italian out of the box.

### What is translatable


| Layer                        | Translation key pattern                       | Example                            |
| ---------------------------- | --------------------------------------------- | ---------------------------------- |
| Cookie banner buttons & text | `gdpr::gdpr.banner.`*                         | `banner.accept_all`                |
| Cookie category labels       | `gdpr::gdpr.categories.{key}.label`           | `categories.analytics.label`       |
| Cookie category descriptions | `gdpr::gdpr.categories.{key}.description`     | `categories.analytics.description` |
| Legal document display names | `gdpr::gdpr.documents.{type}`                 | `documents.terms_of_service`       |
| Legal document page titles   | `gdpr::gdpr.pages.{type}`                     | `pages.privacy_policy`             |
| Legal document URL slugs     | `gdpr::gdpr.routes.{type}`                    | `routes.privacy_policy`            |
| Consent gate page            | `gdpr::gdpr.consent_gate.*`                   | `consent_gate.title`               |
| Middleware messages          | `gdpr::gdpr.middleware.*`                     | `middleware.consent_required`      |
| Export/erasure UI text       | `gdpr::gdpr.export.*`, `gdpr::gdpr.erasure.*` | `export.button`                    |
| Notification messages        | `gdpr::gdpr.notifications.*`                  | `notifications.consent_saved`      |


### Translatable URL slugs

URL paths for legal document pages are defined in translation files, not in config:

```php
// lang/vendor/gdpr/en/gdpr.php
'routes' => [
    'privacy_policy'   => '/privacy-policy',
    'terms_of_service' => '/terms-of-service',
],

// lang/vendor/gdpr/it/gdpr.php
'routes' => [
    'privacy_policy'   => '/informativa-privacy',
    'terms_of_service' => '/termini-di-servizio',
],
```

When `routes.locale_prefix` is `true` in config, routes are registered as `/{locale}/privacy-policy`, allowing locale-prefixed URLs like `/en/privacy-policy` and `/it/informativa-privacy`.

### Locale-aware Markdown content

Policy page content (Privacy Policy, Terms of Service, etc.) is loaded with a locale fallback chain:

```
1. resources/markdown/gdpr/{locale}/privacy-policy.md  (published, current locale)
2. resources/markdown/gdpr/{fallback}/privacy-policy.md (published, fallback locale)
3. resources/markdown/gdpr/privacy-policy.md            (published, no locale)
4. vendor package: resources/markdown/{locale}/...       (package, current locale)
5. vendor package: resources/markdown/{fallback}/...     (package, fallback locale)
6. vendor package: resources/markdown/...                (package, no locale)
```

The package ships with full EN and IT Markdown documents for Privacy Policy, Cookie Policy, and Terms of Service.

### Publishing translations

```bash
php artisan vendor:publish --tag=gdpr-translations
```

Files are published to `lang/vendor/gdpr/{en,it}/gdpr.php`.

### Adding a new language

1. Create `lang/vendor/gdpr/{locale}/gdpr.php` (copy from `en`)
2. Translate all values including the `routes` section for URL slugs
3. Create `resources/markdown/gdpr/{locale}/` with translated Markdown files
4. Set `app.locale` to your locale in config or per-request

### Using translations in Blade

```blade
{{ __('gdpr::gdpr.banner.accept_all') }}
{{ __('gdpr::gdpr.documents.terms_of_service') }}
{{ __('gdpr::gdpr.consent_gate.i_accept') }}
{{ __('gdpr::gdpr.categories.analytics.label') }}
```

### Key principle

**Config = structural/backend settings. Translations = everything the user sees.** The config file stores `current_version`, `required`, `source`, `file` — never labels, descriptions, or routes.

---

## Artisan Commands


| Command                          | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `gdpr:install`                   | Publish all assets                                 |
| `gdpr:install --with-customizer` | Also publish `GdprPolicyCustomizer` to `app/Gdpr/` |
| `gdpr:install --force`           | Overwrite existing files                           |
| `gdpr:prune-data`                | Delete records past retention period               |
| `gdpr:prune-data --dry-run`      | Preview without deleting                           |


---

## Database Schema

### `gdpr_consents`


| Column             | Type        | Description                                                   |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `id`               | bigint PK   | Auto-increment                                                |
| `model_type`       | string      | Polymorphic class (e.g. `App\Models\User`)                    |
| `model_id`         | bigint      | Polymorphic ID                                                |
| `document_type`    | string(64)  | `'privacy_policy'`, `'terms_of_service'`, `'analytics'`, etc. |
| `document_version` | string(32)  | `'1.0.0'`, `'v2.1'`, etc.                                     |
| `ip_address`       | string(45)  | Anonymized client IP                                          |
| `user_agent`       | string(512) | Browser user agent                                            |
| `metadata`         | JSON        | Additional context                                            |
| `accepted_at`      | timestamp   | When consent was given                                        |
| `revoked_at`       | timestamp   | When consent was revoked (null = active)                      |
| `created_at`       | timestamp   | Record creation                                               |
| `updated_at`       | timestamp   | Last modification                                             |


### `gdpr_consent_logs`


| Column             | Type        | Description                            |
| ------------------ | ----------- | -------------------------------------- |
| `id`               | bigint PK   | Auto-increment                         |
| `model_type`       | string      | Polymorphic class                      |
| `model_id`         | bigint      | Polymorphic ID                         |
| `consent_id`       | bigint FK   | References `gdpr_consents.id`          |
| `document_type`    | string(64)  | Document or category type              |
| `document_version` | string(32)  | Version at time of action              |
| `action`           | string(16)  | `'accepted'`, `'revoked'`, `'updated'` |
| `ip_address`       | string(45)  | Anonymized client IP                   |
| `user_agent`       | string(512) | Browser user agent                     |
| `metadata`         | JSON        | Additional context                     |
| `created_at`       | timestamp   | Immutable creation time                |


---

## Architecture Overview

```
src/
├── GdprServiceProvider.php             # IoC bindings, publishing, middleware alias
├── Contracts/
│   ├── Exportable.php                  # Interface for exportable models
│   ├── Anonymizable.php                # Interface for anonymizable models
│   ├── Retainable.php                  # Interface for retention-policy models
│   ├── ExportUserDataContract.php      # Action contract (IoC)
│   ├── AnonymizeUserContract.php       # Action contract (IoC)
│   └── PruneExpiredDataContract.php    # Action contract (IoC)
├── Traits/
│   ├── HasGdpr.php                     # Polymorphic relationships + state queries
│   ├── LogsConsent.php                 # Fluent consent API + audit engine
│   └── HasDataRetention.php            # Retention policy for any model
├── Actions/
│   ├── ExportUserDataAction.php        # ZIP archive via Strategy pattern
│   ├── AnonymizeUserAction.php         # Soft/hard anonymization
│   └── PruneExpiredDataAction.php      # Retention pruning + cleanup
├── Strategies/
│   ├── ExportStrategy.php              # Strategy interface
│   ├── JsonExportStrategy.php          # JSON with metadata
│   └── CsvExportStrategy.php           # Standard CSV
├── DTOs/
│   ├── ConsentData.php                 # Immutable consent DTO with factory methods
│   └── ExportableEntity.php            # Export data wrapper
├── Models/
│   ├── GdprConsent.php                 # Polymorphic, versioned, tenant-aware
│   └── GdprConsentLog.php             # Immutable audit log, tenant-aware
├── Events/
│   ├── GdprConsentUpdated.php          # Consent lifecycle event
│   └── UserAnonymized.php             # Anonymization complete event
├── Exceptions/
│   └── GdprComplianceException.php     # Semantic exception factories
├── Http/
│   ├── Controllers/
│   │   ├── ConsentController.php       # Cookie consent + document acceptance
│   │   ├── DataExportController.php    # Export download + anonymization
│   │   └── PolicyController.php        # Legal document page rendering
│   └── Middleware/
│       └── RequireLegalConsent.php     # Route middleware for document enforcement
├── Commands/
│   ├── GdprInstallCommand.php          # php artisan gdpr:install
│   └── PruneExpiredDataCommand.php     # php artisan gdpr:prune-data
├── Support/
│   └── GdprPolicyCustomizer.php        # Lifecycle hooks base class
└── View/Components/
    ├── CookieBanner.php                # <x-gdpr::cookie-banner />
    └── CookieSettings.php              # <x-gdpr::cookie-settings />
```

**Design Patterns:**


| Pattern                  | Where                                  | Purpose                                   |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| **Strategy**             | `ExportStrategy`                       | Swappable export formats                  |
| **Action Class**         | `Export/Anonymize/PruneAction`         | Single-responsibility business logic      |
| **DTO**                  | `ConsentData`, `ExportableEntity`      | Immutable typed data (PHP 8.3 `readonly`) |
| **Contract + IoC**       | All `*Contract` interfaces             | Full DI, override without forking         |
| **Polymorphic Relation** | `GdprConsent`, `GdprConsentLog`        | Any model can track consent               |
| **Template Method**      | `GdprPolicyCustomizer`                 | Lifecycle hooks                           |
| **Observer/Event**       | `GdprConsentUpdated`, `UserAnonymized` | Decoupled side-effects                    |


---

## Testing

```bash
composer install
./vendor/bin/pest
```

Example tests for your application:

```php
use AlessioVietri\GdprMaster\DTOs\ConsentData;
use AlessioVietri\GdprMaster\Contracts\AnonymizeUserContract;

it('accepts a legal document and creates audit log', function () {
    $user = User::factory()->create();

    $consent = $user->acceptConsent('terms_of_service', 'v1.0');

    expect($consent->isActive())->toBeTrue()
        ->and($consent->document_type)->toBe('terms_of_service')
        ->and($consent->document_version)->toBe('v1.0')
        ->and($user->gdprConsentLogs)->toHaveCount(1);
});

it('detects outdated document version', function () {
    $user = User::factory()->create();
    $user->acceptConsent('terms_of_service', '1.0.0');

    config(['gdpr.legal_documents.terms_of_service.current_version' => '2.0.0']);

    expect($user->hasAcceptedLatest('terms_of_service'))->toBeFalse()
        ->and($user->hasAccepted('terms_of_service', '1.0.0'))->toBeTrue();
});

it('blocks routes via middleware when consent is missing', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect();
});

it('anonymizes user data on erasure request', function () {
    $user = User::factory()->create(['name' => 'John Doe']);
    $user->acceptConsent('privacy_policy', '1.0');

    app(AnonymizeUserContract::class)->execute($user);

    $user->refresh();
    expect($user->name)->toBe('Anonymized User')
        ->and($user->isGdprAnonymized())->toBeTrue();
});
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with precision for the Laravel ecosystem. Contributions, issues, and PRs are welcome.