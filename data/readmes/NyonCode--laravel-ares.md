# laravel-ares

`laravel-ares` is a Laravel package for the Czech ARES business register API. It provides a typed client, a facade, configurable caching, lookup events, ICO validation, static analysis support, and an artisan command for diagnostics.

## Features

- Typed public API through `AresClientInterface`
- `Ares` facade with convenience methods for common workflows
- Structured domain objects instead of one large flat payload object
- Configurable caching and HTTP timeouts
- Events for successful and failed lookups
- ICO normalization and checksum validation
- Explicit exceptions for invalid ICO and missing companies
- Pest test suite, PHPStan configuration, and GitHub Actions CI

## Requirements

- PHP 8.2+
- Laravel 10, 11, 12, or 13

## Installation

Install the package with Composer:

```bash
composer require nyoncode/laravel-ares
```

Publish the configuration file if you want local overrides:

```bash
php artisan vendor:publish --tag=laravel-ares::config
```

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `api_url` | `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest` | Base URL for the ARES REST API |
| `cache_ttl` | `86400` | Cache lifetime for successful lookups in seconds |
| `log_channel` | `stack` | Laravel log channel used for client errors |
| `http_options.timeout` | `5.0` | Request timeout in seconds |
| `http_options.connect_timeout` | `3.0` | Connection timeout in seconds |

Environment overrides:

- `ARES_API_URL`
- `ARES_CACHE_TTL`
- `ARES_LOG_CHANNEL`
- `ARES_HTTP_TIMEOUT`
- `ARES_HTTP_CONNECT_TIMEOUT`

## Usage

Use dependency injection when you want explicit contracts:

```php
use NyonCode\Ares\Contracts\AresClientInterface;

final class CompanyLookupService
{
    public function __construct(
        private readonly AresClientInterface $ares,
    ) {}

    public function companyName(string $ic): ?string
    {
        return $this->ares->findCompany($ic)?->name;
    }
}
```

Use the facade for concise application code:

```php
use NyonCode\Ares\Facades\Ares;

$normalizedIc = Ares::normalizeIc('27 074 358');
$company = Ares::findCompanyOrFail($normalizedIc);

dump($company->name);
dump($company->registeredOffice?->formatted);
dump($company->registration->naceCodes);
```

Public API:

- `findCompany(string $ic): ?CompanyData`
- `findCompanyRaw(string $ic): ?array`
- `findCompanyOrFail(string $ic): CompanyData`
- `forgetCompany(string $ic): bool`
- `isValidIc(string $ic): bool`
- `normalizeIc(string $ic): string`

## Domain Model

Successful lookups return `NyonCode\Ares\Data\CompanyData`:

```php
final class CompanyData
{
    public readonly string $ic;
    public readonly string $name;
    public readonly ?string $dic;
    public readonly ?string $dicSkDph;
    public readonly ?AddressData $registeredOffice;
    public readonly ?DeliveryAddressData $deliveryAddress;
    public readonly RegistrationData $registration;
    public readonly array $rawData;
}
```

Related DTOs:

- `AddressData` models the registered office
- `DeliveryAddressData` models the mailing address
- `RegistrationData` groups legal form, dates, source, file mark, NACE codes, and source statuses
- `RegistrationStatusData` represents one registry source status
- `RegistrationSourceState` is a typed enum for known ARES status values

`rawData` remains available as an escape hatch for fields the package does not map yet.

## Exceptions

The fail-fast API throws explicit domain exceptions:

- `NyonCode\Ares\Exceptions\InvalidIcException`
- `NyonCode\Ares\Exceptions\CompanyNotFoundException`

Malformed payloads are treated as failed lookups internally and surface through the failure event path.

## Events

The package dispatches:

- `NyonCode\Ares\Events\CompanyLookupSucceeded`
- `NyonCode\Ares\Events\CompanyLookupFailed`

## Artisan Command

The package includes an artisan helper for manual verification:

```bash
php artisan ares:test 27074358
```

The command renders a compact company summary including DIC, source, dates, registered office, delivery address, and register metadata.

## Quality Gates

Run the automated tests:

```bash
composer test
```

Run static analysis:

```bash
composer analyse
```

Run the formatter:

```bash
composer format
```

The repository includes a GitHub Actions workflow for:

- PHP/Laravel compatibility matrix tests
- PHPStan on the quality lane
- Pint on the quality lane

## Development Notes

- Successful lookups are cached under the `ares:company:{ic}` key format.
- Invalid ICO values are rejected before any HTTP request is sent.
- `forgetCompany()` invalidates cache entries using normalized ICO values.
- Failed HTTP responses, malformed payloads, and transport exceptions all dispatch `CompanyLookupFailed`.

## License

The package is open-sourced under the [MIT license](LICENSE).
