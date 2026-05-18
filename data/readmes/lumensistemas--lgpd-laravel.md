# LGPD Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/lumensistemas/lgpd-laravel.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/lgpd-laravel)
[![Tests](https://img.shields.io/github/actions/workflow/status/lumensistemas/lgpd-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/lumensistemas/lgpd-laravel/actions/workflows/run-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/lumensistemas/lgpd-laravel.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/lgpd-laravel)

A Laravel package for LGPD (Lei Geral de Proteção de Dados) compliance. Provides models, enums, and migrations for managing data subjects, consent tracking, and processing activity records as required by Brazilian data protection law.

## Installation

You can install the package via composer:

```bash
composer require lumensistemas/lgpd-laravel
```

Publish the config file:

```bash
php artisan vendor:publish --tag=lgpd-config
```

Publish the migrations (optional, for customization):

```bash
php artisan vendor:publish --tag=lgpd-migrations
```

Publish the language files (optional):

```bash
php artisan vendor:publish --tag=lgpd-lang
```

Run the migrations:

```bash
php artisan migrate
```

## Usage

### Data Subjects

The `DataSubject` model is the central reference point for all personal data associated with an individual. The `document_hash` field uses blind indexing for searchable encryption.

```php
use LumenSistemas\Lgpd\Models\DataSubject;

$subject = DataSubject::create([
    'document_hash' => $cpf,
]);
```

### Consent Tracking (Art. 8)

Track consent grants and revocations. Consent must be free, informed, and unambiguous under the LGPD.

```php
use LumenSistemas\Lgpd\Models\Consent;
use LumenSistemas\Lgpd\Enums\LegalBasis;

$consent = Consent::create([
    'data_subject_id' => $subject->id,
    'purpose' => 'Send marketing emails',
    'legal_basis' => LegalBasis::CONSENT,
    'granted_at' => now(),
    'ip_address' => request()->ip(),
    'user_agent' => request()->userAgent(),
]);

// Revoke consent
$consent->update(['revoked_at' => now()]);

// Query scopes
Consent::active()->get();   // granted, not revoked, not expired
Consent::revoked()->get();  // revoked consents
Consent::expired()->get();  // past expiry date
```

### Processing Activities Registry (Art. 37)

Maintain a compliance registry of your organization's data processing operations as required by the LGPD. This is a catalog of *what* processing your system does, not a per-event audit log.

```php
use LumenSistemas\Lgpd\Models\ProcessingActivity;
use LumenSistemas\Lgpd\Enums\LegalBasis;
use LumenSistemas\Lgpd\Enums\DataSensitivity;

ProcessingActivity::create([
    'activity' => 'user_registration',
    'legal_basis' => LegalBasis::CONTRACT,
    'sensitivity' => DataSensitivity::PERSONAL,
    'purpose' => 'Collect user data to create account',
    'data_categories' => ['name', 'email', 'cpf'],
    'retention_period' => '5 years',
    'processed_at' => now(),
]);
```

### Data Subject Requests (Art. 18)

Track requests from data subjects exercising their rights. Includes query scopes for status filtering and overdue detection (15-day deadline per Art. 18, §3).

```php
use LumenSistemas\Lgpd\Models\DataSubjectRequest;
use LumenSistemas\Lgpd\Enums\DataSubjectRight;
use LumenSistemas\Lgpd\Enums\RequestStatus;

// Create a request
$request = DataSubjectRequest::create([
    'data_subject_id' => $subject->id,
    'right' => DataSubjectRight::ACCESS,
    'status' => RequestStatus::PENDING,
    'requested_at' => now(),
]);

// Update status
$request->update([
    'status' => RequestStatus::COMPLETED,
    'responded_at' => now(),
    'response_notes' => 'Data export sent to customer email.',
]);

// Query scopes
DataSubjectRequest::pending()->get();
DataSubjectRequest::overdue()->get();       // default 15 days
DataSubjectRequest::overdue(30)->get();     // custom deadline
```

### Personal Data Classification

Use the `HoldsPersonalData` interface and `HasPersonalData` trait on any model that contains personal data. Declare the sensitivity of each column via `dataClassification()`.

```php
use Illuminate\Database\Eloquent\Model;
use LumenSistemas\Lgpd\Concerns\HasPersonalData;
use LumenSistemas\Lgpd\Contracts\HoldsPersonalData;
use LumenSistemas\Lgpd\Enums\DataSensitivity;

class User extends Model implements HoldsPersonalData
{
    use HasPersonalData;

    public function dataClassification(): array
    {
        return [
            'name'  => DataSensitivity::PERSONAL,
            'email' => DataSensitivity::PERSONAL,
            'cpf'   => DataSensitivity::SENSITIVE,
        ];
    }
}
```

### Anonymization and Masking (Art. 18, IV)

Add the `Anonymizable` trait for anonymization and display masking capabilities.

```php
use LumenSistemas\Lgpd\Concerns\Anonymizable;

class User extends Model implements HoldsPersonalData
{
    use HasPersonalData, Anonymizable;

    // ...
}
```

**Anonymize** — permanently replaces classified fields in memory. Does NOT auto-save, so your app controls authorization and logging:

```php
$user->anonymize()->save();

$user->isAnonymized(); // true
```

**Mask** — returns masked values for display without modifying the model:

```php
$user->masked();
// ['name' => 'L***s', 'email' => 'l***************m', 'cpf' => '1*********0']

$user->masked(['email']);
// ['email' => 'l***************m']
```

Override `anonymizedValue()` or `maskedValue()` for custom strategies per column:

```php
protected function maskedValue(string $column, string $value): string
{
    return match ($column) {
        'email' => preg_replace('/^(.).*(@.*)$/', '$1***$2', $value) ?? '***',
        'cpf'   => '***.***.'.mb_substr($value, 6, 3).'-'.mb_substr($value, 9, 2),
        default => mb_substr($value, 0, 1).'****',
    };
}
```

### Enums

The package provides enums matching the LGPD articles:

**DataSensitivity** — Data classification levels:
`PUBLIC`, `INTERNAL`, `PERSONAL`, `SENSITIVE`

**LegalBasis (Art. 7)** — Legal bases for data processing:
`CONSENT`, `LEGAL_OBLIGATION`, `PUBLIC_ADMINISTRATION`, `RESEARCH`, `CONTRACT`, `LEGAL_PROCEEDINGS`, `LIFE_PROTECTION`, `HEALTH`, `LEGITIMATE_INTEREST`, `CREDIT_PROTECTION`

**DataSubjectRight (Art. 18)** — Data subject rights:
`ACCESS`, `CORRECTION`, `ANONYMIZATION`, `PORTABILITY`, `DELETION`, `SHARING_INFO`, `CONSENT_INFO`, `CONSENT_REVOCATION`, `OPPOSITION`

**RequestStatus** — DSR workflow status:
`PENDING`, `IN_PROGRESS`, `COMPLETED`, `DENIED`

All enums provide `label()` and `description()` methods with translations in English and Brazilian Portuguese.

```php
use LumenSistemas\Lgpd\Enums\LegalBasis;

LegalBasis::CONSENT->label();       // "Consent" or "Consentimento"
LegalBasis::CONSENT->description(); // Full description with article reference
```

`DataSensitivity::highest()` returns the most sensitive level from a list — useful when determining the overall sensitivity of a set of columns:

```php
use LumenSistemas\Lgpd\Enums\DataSensitivity;

DataSensitivity::highest([
    DataSensitivity::PERSONAL,
    DataSensitivity::SENSITIVE,
]); // DataSensitivity::SENSITIVE
```

### Configuration

The config file (`config/lgpd.php`) allows you to:

**Multi-tenancy** — Enable tenant isolation with a configurable column name:

```php
'multi_tenancy' => [
    'enabled' => true,
    'column' => 'tenant_id',
],
```

**Table names** — Customize table names to avoid conflicts:

```php
'tables' => [
    'data_subjects' => 'data_subjects',
    'consents' => 'consents',
    'processing_activities' => 'processing_activities',
    'data_subject_requests' => 'data_subject_requests',
],
```

**Models** — Swap model implementations with your own:

```php
'models' => [
    'data_subject' => App\Models\CustomDataSubject::class,
],
```

## Testing

```bash
composer test:all
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/lumensistemas/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Lucas Vasconcelos](https://github.com/lucasvscn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
