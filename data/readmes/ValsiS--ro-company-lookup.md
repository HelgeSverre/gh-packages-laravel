# Ro Company Lookup

[![Tests](https://img.shields.io/github/actions/workflow/status/ValsiS/ro-company-lookup/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ValsiS/ro-company-lookup/actions/workflows/run-tests.yml)
[![Validate](https://img.shields.io/github/actions/workflow/status/ValsiS/ro-company-lookup/run-tests.yml?branch=main&label=validate&style=flat-square)](https://github.com/ValsiS/ro-company-lookup/actions/workflows/run-tests.yml)
[![Latest Version](https://img.shields.io/github/v/release/ValsiS/ro-company-lookup.svg?style=flat-square)](https://github.com/ValsiS/ro-company-lookup/releases)
[![PHP Version](https://img.shields.io/badge/php-8.3%2B-8892BF.svg?style=flat-square)](https://www.php.net/)
[![Total Downloads](https://img.shields.io/github/downloads/ValsiS/ro-company-lookup/total.svg?style=flat-square)](https://github.com/ValsiS/ro-company-lookup/releases)
[![License](https://img.shields.io/github/license/ValsiS/ro-company-lookup.svg?style=flat-square)](LICENSE)

A production-ready Laravel package that retrieves Romanian company data by CUI from ANAF public web services. It returns clean DTOs, supports batching, caching, retries, circuit breaker, schema audit, and a very simple developer experience.

## Requirements

- PHP 8.3+
- Laravel 12+

## Compatibility

| PHP | Laravel | CI |
| --- | --- | --- |
| 8.3 | 12.x | [![PHP 8.3](https://img.shields.io/github/actions/workflow/status/ValsiS/ro-company-lookup/run-tests.yml?branch=main&label=php%208.3&style=flat-square)](https://github.com/ValsiS/ro-company-lookup/actions/workflows/run-tests.yml) |
| 8.5 | 12.x | [![PHP 8.5](https://img.shields.io/github/actions/workflow/status/ValsiS/ro-company-lookup/run-tests.yml?branch=main&label=php%208.5&style=flat-square)](https://github.com/ValsiS/ro-company-lookup/actions/workflows/run-tests.yml) |

## Quick start

```bash
composer require valsis/ro-company-lookup
```

```php
use Valsis\RoCompanyLookup\Facades\RoCompanyLookup;

return RoCompanyLookup::summaryOrResult('RO12345678');
```

Example response:

```json
{
  "exists": true,
  "cui": 12345678,
  "name": "EXEMPLU SRL",
  "caen": "6201",
  "registration_date": "01.01.2020",
  "vat_payer": false,
  "status": "ok",
  "message": null,
  "error": null,
  "code": null
}
```

## Installation

```bash
composer require valsis/ro-company-lookup
```

Publish the config file (optional):

```bash
php artisan vendor:publish --tag=ro-company-lookup-config
```

## Configuration

All configuration lives in `config/ro-company-lookup.php`.

Core options:

- `driver`: active driver, default `anaf`
- `timezone`: default query date timezone, default `Europe/Bucharest`
- `language`: output key naming, `ro` or `en`

Date formatting:

- `date_output_format`: fallback output format for dates (default `Y-m-d`)
- `date_output_formats`: per-language formats (default `ro => d.m.Y`, `en => Y-m-d`)

HTTP + ANAF:

- `anaf.base_url`, `anaf.endpoint`, `anaf.timeout`, `anaf.connect_timeout`
- `anaf.retries`, `anaf.backoff_ms`, `anaf.user_agent`

Cache + resilience:

- `cache_store`, `cache_prefix`, `cache_version`
- `cache_ttl_seconds`, `stale_ttl_seconds`
- `use_locks`, `lock_seconds`, `lock_wait_seconds`
- `throttle_seconds` (optional per-CUI guard)

Observability + safety:

- `logging.enabled`, `logging.channel`, `logging.level`
- `schema_audit.enabled`, `schema_audit.fail_on_unknown`, `schema_audit.snapshot_path`
- `circuit_breaker.enabled`, `circuit_breaker.failure_threshold`, `circuit_breaker.cooldown_seconds`

Raw payloads:

- `enable_raw` (include raw ANAF payloads in `meta.raw`)

## Usage

### Standard lookup

```php
use Valsis\RoCompanyLookup\Facades\RoCompanyLookup;

$company = RoCompanyLookup::lookup('RO123456');
$company = RoCompanyLookup::lookup('123456', new DateTimeImmutable('2024-01-10'));
```

The lookup accepts `RO123`, ` ro 123 `, or `123` and normalizes to an integer CUI. By default, the query date is "today" in `Europe/Bucharest`.

ANAF mapping is strict to the v9 payload fields (`date_generale`, `inregistrare_scop_Tva`, `adresa_domiciliu_fiscal`, `adresa_sediu_social`, etc.). Legacy/alternate key names are intentionally not mapped.

### Non-throwing API

```php
$result = RoCompanyLookup::tryLookup('RO123456');

if ($result->exists()) {
    $company = $result->data;
}
```

### Summary helpers (simplest UX)

```php
$summary = RoCompanyLookup::summary('RO123456');
$summary = RoCompanyLookup::summaryOrNull('RO123456'); // null if not found
$summary = RoCompanyLookup::summaryOrFail('RO123456'); // throws on invalid / not found
$summary = RoCompanyLookup::summarySafe('RO123456');   // standard summary payload (never throws)
$summary = RoCompanyLookup::summaryOrResult('RO123456'); // same payload, with status/error metadata
```

### Batch helpers

```php
$companies = RoCompanyLookup::batch(['RO123', 'RO456'])->get();
$results = RoCompanyLookup::batch(['RO123', 'BAD', 'RO456'])->tryGet();

$summaries = RoCompanyLookup::batchSummary(['RO1', 'RO2']);
$summaries = RoCompanyLookup::batchSummaryWithStatus(['RO1', 'RO2']);
$summaries = RoCompanyLookup::batchSummaryMap(['RO1', 'RO2']);
```

### Validation / normalization

```php
$isValid = RoCompanyLookup::isValidCui('RO123456');
$normalized = RoCompanyLookup::normalizeCui('  ro  123456 ');
```

After normalization, the CUI must be between 2 and 10 digits. Invalid input returns standardized error codes such as `invalid_cui`, `invalid_cui_too_short`, or `invalid_cui_too_long`.

### Date formatting (global + per request)

Global (config):

```php
// config/ro-company-lookup.php
'date_output_formats' => [
    'ro' => 'd.m.Y',
    'en' => 'Y-m-d',
],
```

Per request override:

```php
$formatted = RoCompanyLookup::lookupFormatted('RO123456', format: 'd.m.Y', language: 'ro');
$formatted = RoCompanyLookup::tryLookupFormatted('RO123456', format: 'Y-m-d', language: 'en');
```

## DTO structure (high level)

The main response is `CompanySimpleData`:

- `company` (CUI, names, trade register, profile)
- `caen` (primary CAEN)
- `address` (fiscal + registered office)
- `contact` (phones, emails)
- `legal` (current + history)
- `vat` (current + history)
- `vat_collection` (TVA la incasare)
- `inactive_status` (inactiv/reactivat)
- `split_vat`
- `meta` (source, query date, cache status, raw)

Company profile (`company.profile`) includes:

- `registration_date`
- `registration_status`
- `fiscal_office`
- `ownership_form`
- `e_invoice_status`
- `e_invoice_registration_date`
- `iban`

## Output examples

### Summary response

```json
{
  "exists": true,
  "valid": true,
  "status": "ok",
  "message": null,
  "error": null,
  "code": null,
  "cui": 12345678,
  "name": "EXEMPLU SRL",
  "caen": "6201",
  "registration_date": "01.01.2020",
  "vat_payer": false
}
```

`exists` is true only when `status` is `ok`. `valid` indicates whether the CUI input passed validation.

### Full response (excerpt, RO)

```json
{
  "firma": {
    "cui": 12345678,
    "nr_reg_com": "J2018000000001",
    "denumire": "EXEMPLU SRL",
    "profil": {
      "data_inregistrare": "01.01.2020",
      "stare_inregistrare": "INREGISTRAT din data 01.01.2020"
    }
  },
  "statut_tva": {
    "curent": { "cod": 1, "label": "Neplătitor TVA" }
  },
  "tva_incasare": { "activ": false },
  "stare_inactiv": { "este_inactiv": false },
  "split_tva": { "activ": false },
  "meta": { "sursa": "anaf" }
}
```

## Caching, retries, and resilience

- Results are cached by driver + CUI + date.
- Default cache TTL is 24 hours.
- When a request fails and a stale cache entry exists (within the configured stale TTL), the stale entry is returned with `meta.is_stale = true`.
- Bump `cache_version` to invalidate cache after mapping changes.
- Retries use exponential backoff and only trigger on 429 and 5xx responses.
- Circuit breaker (optional) opens after repeated 5xx responses and cools down for a configurable interval.
- Optional `throttle_seconds` guards rapid repeated queries per CUI.

## Errors

The package throws typed exceptions for error scenarios:

- `InvalidCuiException` for invalid input
- `LookupFailedException` for upstream failures
- `CircuitOpenException` when the circuit is open

For user-facing flows, prefer `tryLookup()` / `trySummary()` helpers.

## Artisan commands

```bash
php artisan ro-company-lookup:check 123456 --date=2024-01-10 --raw
php artisan ro-company-lookup:demo 123456
```

Example output (`ro-company-lookup:check`, fictive data):

```json
{
  "adresa": {
    "domiciliu_fiscal": {
      "formatat": "Str. Exemplu, Nr. 10, Mun. Test, Judet IL",
      "judet": "IL",
      "cod_judet": "01",
      "cod_judet_auto": "IL",
      "localitate": "Mun. Test",
      "cod_localitate": "999",
      "strada": "Str. Exemplu",
      "numar": "10",
      "cod_postal": "010101",
      "detalii": null
    },
    "sediu_social": {
      "formatat": "Str. Exemplu, Nr. 10, Mun. Test, Judet IL",
      "judet": "IL",
      "cod_judet": "01",
      "cod_judet_auto": "IL",
      "localitate": "Mun. Test",
      "cod_localitate": "999",
      "strada": "Str. Exemplu",
      "numar": "10",
      "cod_postal": "010101",
      "detalii": null
    }
  },
  "cod_caen": { "cod": "6201", "label": null, "versiune": null },
  "firma": {
    "cui": 12345678,
    "nr_reg_com": "J2018000000001",
    "denumire": "EXEMPLU SRL",
    "profil": {
      "data_inregistrare": "01.01.2020",
      "stare_inregistrare": "INREGISTRAT din data 01.01.2020"
    }
  },
  "statut_tva": {
    "curent": { "cod": 1, "label": "Neplătitor TVA", "data_inceput_tva": null }
  },
  "meta": { "sursa": "anaf", "data_interogare": "01.02.2026", "data_ceruta": "2026-02-01" }
}
```

Example output (`ro-company-lookup:demo`, fictive data):

```json
{
  "exists": true,
  "cui": 12345678,
  "name": "EXEMPLU SRL",
  "caen": "6201",
  "registration_date": "2020-01-01",
  "vat_payer": false
}
```

## Schema audit

Enable unknown-key detection and optional snapshots:

```php
'schema_audit' => [
    'enabled' => true,
    'fail_on_unknown' => false,
    'snapshot_path' => storage_path('logs/anaf-schema'),
],
```

## Documentation

- Full docs: `docs/wiki/Home.md`
- JSON Schemas: `docs/schemas`

## Testing

```bash
composer test
composer lint
composer analyse
composer ci
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Dependabot is enabled.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

The MIT License (MIT). See [LICENSE](LICENSE).
