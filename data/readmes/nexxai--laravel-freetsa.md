# Laravel RFC3161

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nexxai/laravel-freetsa.svg?style=flat-square)](https://packagist.org/packages/nexxai/laravel-freetsa)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/nexxai/laravel-freetsa/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/nexxai/laravel-freetsa/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/nexxai/laravel-freetsa/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/nexxai/laravel-freetsa/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/nexxai/laravel-freetsa.svg?style=flat-square)](https://packagist.org/packages/nexxai/laravel-freetsa)

`nexxai/laravel-rfc3161` is a thin Laravel interface for RFC 3161 timestamp providers. It creates timestamp requests, sends them to your selected provider, stores the request/response binary payloads, and verifies responses with provider-specific certificates.

## Breaking Changes

- The package namespace changed from `Nexxai\\FreeTsa\\...` to `Nexxai\\Rfc3161\\...`.
- Update all imports, config class references, and type hints to the new namespace.

## Installation

### Requirements

- PHP must be able to execute an `openssl` CLI binary for RFC 3161 verification.
- By default this package calls `openssl` from your `PATH`; set `TIMESTAMP_OPENSSL_BINARY` if your binary lives elsewhere.

You can install the package via composer:

```bash
composer require nexxai/laravel-rfc3161
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="rfc3161-migrations"
php artisan migrate
```

Add the package trait to your model so it gets the `timestampRecords()` polymorphic relationship:

```php
use Nexxai\Rfc3161\Concerns\HasRfc3161Timestamps;

class User extends Authenticatable
{
    use HasRfc3161Timestamps;
}
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="rfc3161-config"
```

This is the contents of the published config file:

```php
return [
    'default_provider' => env('TIMESTAMP_PROVIDER', \Nexxai\Rfc3161\Providers\FreeTsa::class),
    'hash_algorithm' => env('TIMESTAMP_HASH_ALGORITHM', 'sha512'),
    'openssl_binary' => env('TIMESTAMP_OPENSSL_BINARY', 'openssl'),
    'validate_certificate_chain' => env('TIMESTAMP_VALIDATE_CERTIFICATE_CHAIN', true),
    'certificates' => [
        'directory' => env('TIMESTAMP_CERTIFICATES_DIRECTORY', storage_path('app/timestamp/certificates')),
    ],
];
```

Provider endpoints and certificate chains are built into provider classes and are not user-configurable.

Set `TIMESTAMP_PROVIDER` to a provider class (for example `Nexxai\\Rfc3161\\Providers\\DigiCert`) to choose the default provider.

When overriding the provider in code, pass a provider object (for example `new DigiCert()`).

Before timestamp verification, download and store trusted certificates for your provider:

```bash
php artisan timestamp:download-certificates
```

If certificates are missing, verification will throw an exception with this command.

The package requests certificate inclusion in each TSQ (`-cert`) and, during verification, prefers the certificate chain embedded in the TSR for per-response validation. Local provider certificates are used as trust anchors (`-CAfile`) and as a fallback untrusted chain when a TSR does not include certificates.

When `TIMESTAMP_VALIDATE_CERTIFICATE_CHAIN=true`, the package validates trusted local certificates before requests and verification. If validation fails, it attempts one fresh re-download for that provider and throws an exception if validation still fails.

## Usage

`timestampFile()` is a method on the Eloquent model (`Nexxai\Rfc3161\Models\Timestamp`), not the facade (`Nexxai\Rfc3161\Facades\Timestamp`).

If you need both in the same file, alias them so calls stay explicit:

```php
use Nexxai\Rfc3161\Models\Timestamp as TimestampRecord;
use Nexxai\Rfc3161\Facades\Timestamp as TimestampFacade;

$timestamp = TimestampRecord::timestampFile($filePath, $invoice);
$rawResponse = TimestampFacade::requestTimestamp($filePath);
```

```php
use App\Models\Invoice;
use Nexxai\Rfc3161\Models\Timestamp;
use Nexxai\Rfc3161\Providers\DigiCert;

$invoice = Invoice::findOrFail(1);

// Creates a TSQ from file content, sends it to your configured default provider, and stores TSQ/TSR binary payloads.
$timestamp = Timestamp::timestampFile(
    storage_path('app/invoices/invoice-2026-04.pdf'),
    $invoice,
);

// You can choose a specific provider per request.
$timestamp = Timestamp::timestampFile(
    storage_path('app/invoices/invoice-2026-04.pdf'),
    $invoice,
    new DigiCert(),
);

// Verify stored query and response with locally downloaded provider certificates.
$isValid = $timestamp->verify();

// You can also verify explicit query/response data.
$isValid = $timestamp->verify($customTsqBinary, $customTsrBinary);
```

The `timestamps` table includes a nullable polymorphic relation (`timestampable_type`, `timestampable_id`) so any Eloquent model can own many timestamp records.

After adding the trait, access records with `$user->timestampRecords` (or call `$user->timestampRecords()` for the relation query).

## Testing

```bash
composer test
```

## Releases

This package uses Release Please to create and publish semver releases from `main`.

Use Conventional Commits in merged PRs so the version bump is predictable:

- `fix: ...` -> patch release (`x.y.Z`)
- `feat: ...` -> minor release (`x.Y.0`)
- `feat!: ...` or a `BREAKING CHANGE:` footer -> major release (`X.0.0`)

Example:

```text
feat: add certificate download command
fix: handle missing cert files before verify
feat!: rename timestampFile API to createFromFile
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [JT Smith](https://github.com/nexxai)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
