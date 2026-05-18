<div align="center">

<img src=".github/assets/banner.svg" alt="phone-country-resolver" width="100%">

<br/>

[![Packagist Version](https://img.shields.io/packagist/v/wal3fo/phone-country?style=flat-square&color=6ee7b7&labelColor=0d1117)](https://packagist.org/packages/wal3fo/phone-country)
[![Total Downloads](https://img.shields.io/packagist/dt/wal3fo/phone-country?style=flat-square&color=818cf8&labelColor=0d1117)](https://packagist.org/packages/wal3fo/phone-country)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-777BB4?style=flat-square&labelColor=0d1117)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-8--13-FF2D20?style=flat-square&labelColor=0d1117)](https://laravel.com)
[![License](https://img.shields.io/packagist/l/wal3fo/phone-country?style=flat-square&color=fb923c&labelColor=0d1117)](LICENSE)

<br/>

**Resolve ISO 3166-1 alpha-2 country codes from phone numbers.**  
Rich metadata · Flag & geography · Number formatting · HTML card output · Zero dependencies.

<br/>

```bash
composer require wal3fo/phone-country
```

</div>

---

## Features

| Feature | Method | Description |
|---|---|---|
| 🔍 Country resolution | `resolveCountryCode()` | Returns the ISO alpha-2 code from any phone format |
| 🌐 Rich analysis | `analyze()` | Full country metadata, number type, formatting, and more |
| 🏳️ Flag & geography | `analyze()` | Emoji flag, region, continent, and capital city |
| 💱 Currency & language | `analyze()` | ISO 4217 currency, currency name, and primary language |
| 🕐 Timezone | `analyze()` | IANA timezone for 180+ countries |
| 📐 Formatting | `analyze()` | National and international number formats |
| 🖼️ HTML card | `toHtml()` | Self-contained, styled HTML card — no external dependencies |
| ✅ Validation rule | `PhoneCountryRule` | Laravel validation rule with allowlist and strict mode |

---

## Quick start

```php
use Wal3fo\PhoneCountry\PhoneCountryService;

$analysis = PhoneCountryService::analyze('+212612345678');

// ── Country & identity ────────────────────────────────────
$analysis->countryCode;        // 'MA'
$analysis->countryName;        // 'Morocco'
$analysis->flag;               // '🇲🇦'
$analysis->dialingCode;        // '212'
$analysis->e164;               // '+212612345678'

// ── Geography ─────────────────────────────────────────────
$analysis->region;             // 'Northern Africa'
$analysis->continent;          // 'Africa'
$analysis->capital;            // 'Rabat'

// ── Cultural metadata ─────────────────────────────────────
$analysis->timezone;           // 'Africa/Casablanca'
$analysis->currency;           // 'MAD'
$analysis->currencyName;       // 'Moroccan Dirham'
$analysis->language;           // 'Arabic'

// ── Number analysis ───────────────────────────────────────
$analysis->nationalNumber;     // '612345678'
$analysis->numberType;         // 'MOBILE'
$analysis->isValid;            // true
$analysis->isPossible;         // true
$analysis->digitCount;         // 9

// ── Formatting ────────────────────────────────────────────
$analysis->formatNational;        // '61 23 45 67 8'
$analysis->formatInternational;   // '+212 612 345 678'

// ── Input metadata ────────────────────────────────────────
$analysis->raw;                // '+212612345678'
$analysis->normalized;         // '212612345678'
$analysis->inputFormat;        // 'E164'
$analysis->usedFallback;       // false
$analysis->resolvedAt;         // '2025-01-01T00:00:00+00:00'

// ── Output helpers ────────────────────────────────────────
$analysis->explanation;        // HTML <ul> summary card
$analysis->toArray();          // full associative array
$analysis->toJson();           // JSON string
$analysis->toHtml();           // self-contained HTML card
```

---

## Core methods

### `resolveCountryCode()`

Resolves a phone number and returns the ISO 3166-1 alpha-2 country code.

```php
PhoneCountryService::resolveCountryCode('+212612345678');       // 'MA'
PhoneCountryService::resolveCountryCode('00212612345678');      // 'MA'
PhoneCountryService::resolveCountryCode('0612345678', 'MA');    // 'MA'  ← local fallback
PhoneCountryService::resolveCountryCode('0612345678');          // 'XX'  ← unresolvable
```

Returns `'XX'` when the number cannot be resolved to any country.

### `analyze()`

Analyzes a phone number and returns a rich `PhoneAnalysis` value object.

```php
$analysis = PhoneCountryService::analyze('+33612345678');

$analysis->countryCode;   // 'FR'
$analysis->countryName;   // 'France'
$analysis->flag;          // '🇫🇷'
$analysis->timezone;      // 'Europe/Paris'
$analysis->currency;      // 'EUR'
$analysis->language;      // 'French'
$analysis->numberType;    // 'MOBILE'
$analysis->isValid;       // true
$analysis->toHtml();      // styled HTML card
```

With a local number and fallback country:

```php
$analysis = PhoneCountryService::analyze('0612345678', 'MA');
$analysis->countryCode;   // 'MA'
$analysis->e164;          // '+212612345678'
$analysis->inputFormat;   // 'LOCAL'
$analysis->usedFallback;  // true
```

### Validation rule

```php
use Wal3fo\PhoneCountry\Rules\PhoneCountryRule;

// Any valid international number
'phone' => ['required', new PhoneCountryRule()]

// With Morocco as local fallback
'phone' => ['required', new PhoneCountryRule('MA')]

// Restrict to a country allowlist
'phone' => ['required', new PhoneCountryRule(['MA', 'FR', 'ES'])]

// Strict mode — reject local 0xxx format
'phone' => ['required', new PhoneCountryRule('MA', strict: true)]
```

Example in a Form Request:

```php
use Wal3fo\PhoneCountry\Rules\PhoneCountryRule;

class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string'],
            'phone' => ['required', 'string', new PhoneCountryRule('MA')],
        ];
    }
}
```

### Dependency injection

```php
class UserProfileController extends Controller
{
    public function __construct(
        protected PhoneCountryService $phoneService
    ) {}

    public function update(Request $request)
    {
        $analysis = $this->phoneService->analyze($request->phone_number);

        $user->update([
            'phone'        => $analysis->e164,
            'country_code' => $analysis->countryCode,
        ]);
    }
}
```

---

## `analyze()` — rich pipeline

### 🌐 Country metadata

Every resolved number returns full geographic and cultural data:

```php
$a = PhoneCountryService::analyze('+966512345678');  // Saudi Arabia

$a->countryCode;    // 'SA'
$a->countryName;    // 'Saudi Arabia'
$a->flag;           // '🇸🇦'
$a->region;         // 'Western Asia'
$a->continent;      // 'Asia'
$a->capital;        // 'Riyadh'
$a->currency;       // 'SAR'
$a->currencyName;   // 'Saudi Riyal'
$a->language;       // 'Arabic'
$a->timezone;       // 'Asia/Riyadh'
```

Covers 180+ countries with IANA timezone · ISO 4217 currency · capital city · world region.

### 📐 Number formatting

`analyze()` produces both national and international formatted strings:

```php
$a = PhoneCountryService::analyze('+212612345678');
$a->formatNational;        // '61 23 45 67 8'
$a->formatInternational;   // '+212 612 345 678'
$a->nationalNumber;        // '612345678'
$a->digitCount;            // 9

$b = PhoneCountryService::analyze('+33612345678');
$b->formatNational;        // '61 23 45 67'
$b->formatInternational;   // '+33 612 345 678'
```

### 🔢 Number type & validity

```php
$a = PhoneCountryService::analyze('+212612345678');
$a->numberType;   // 'MOBILE'
$a->isValid;      // true   — passes length check for MA (exactly 9 digits)
$a->isPossible;   // true   — within ±1 of expected range

$b = PhoneCountryService::analyze('+18005551234');
$b->numberType;   // 'TOLL_FREE'

$c = PhoneCountryService::analyze('+19005551234');
$c->numberType;   // 'PREMIUM'
```

**Number types:** `MOBILE` · `FIXED_LINE` · `TOLL_FREE` · `PREMIUM` · `UNKNOWN`

### 🖼️ HTML card output

`toHtml()` returns a fully self-contained, styled card with no external dependencies:

```php
$html = PhoneCountryService::analyze('+212612345678')->toHtml();
// Returns a <div class="pcr-card"> with inline CSS, flag, badges, and a data table
```

Ideal for debug views, Blade partials, or API responses that render in a browser.

The `explanation` magic property returns an HTML `<ul>` list summary:

```php
echo PhoneCountryService::analyze('+33612345678')->explanation;
// <ul>
//   <li><strong>Number:</strong> +33612345678</li>
//   <li><strong>Country:</strong> 🇫🇷 France (+33)</li>
//   ...
// </ul>
```

### 🔄 Input format detection

`analyze()` recognizes and normalizes multiple input formats:

```php
PhoneCountryService::analyze('+212612345678')->inputFormat;    // 'E164'
PhoneCountryService::analyze('00212612345678')->inputFormat;   // 'DOUBLE_ZERO'
PhoneCountryService::analyze('212612345678')->inputFormat;     // 'NUMERIC'
PhoneCountryService::analyze('0612345678', 'MA')->inputFormat; // 'LOCAL'
```

---

## `PhoneAnalysis` reference

### Properties

| Property | Type | Description |
|---|---|---|
| `raw` | `string` | Original input as-is |
| `normalized` | `string` | Cleaned digits (no `+`, spaces, or dashes) |
| `e164` | `string` | Canonical E.164 format, e.g. `+212612345678` |
| `nationalNumber` | `string` | Number without the country calling code |
| `dialingCode` | `string` | Numeric calling code, e.g. `212` |
| `countryCode` | `string` | ISO 3166-1 alpha-2, e.g. `MA` |
| `countryName` | `string` | Full English name, e.g. `Morocco` |
| `flag` | `string` | Emoji flag, e.g. `🇲🇦` |
| `region` | `string` | World region, e.g. `Northern Africa` |
| `continent` | `string` | Continent, e.g. `Africa` |
| `capital` | `string` | Capital city, e.g. `Rabat` |
| `currency` | `string` | ISO 4217 code, e.g. `MAD` |
| `currencyName` | `string` | Currency name, e.g. `Moroccan Dirham` |
| `language` | `string` | Primary language, e.g. `Arabic` |
| `timezone` | `string` | IANA timezone, e.g. `Africa/Casablanca` |
| `numberType` | `string` | `MOBILE` / `FIXED_LINE` / `TOLL_FREE` / `PREMIUM` / `UNKNOWN` |
| `isValid` | `bool` | Passes basic length check for the country |
| `isPossible` | `bool` | Within ±1 digit of expected length |
| `digitCount` | `int` | Total digit count of `nationalNumber` |
| `formatNational` | `string` | National format, e.g. `06 12 34 56 78` |
| `formatInternational` | `string` | International format, e.g. `+212 612 345 678` |
| `inputFormat` | `string` | `E164` / `DOUBLE_ZERO` / `NUMERIC` / `LOCAL` |
| `usedFallback` | `bool` | `true` if `localCountryCode` fallback was applied |
| `resolvedAt` | `string` | ISO 8601 UTC timestamp of resolution |

### Methods & magic properties

| Name | Description |
|---|---|
| `toArray()` | Full associative array — ready for JSON responses |
| `toJson(int $flags)` | JSON string (default: `JSON_PRETTY_PRINT \| JSON_UNESCAPED_UNICODE`) |
| `toHtml()` | Self-contained HTML card with inline CSS |
| `toUl()` | HTML `<ul>` summary list |
| `$analysis->explanation` | Magic alias for `toUl()` |

---

## Examples

| Input | Country | Name | Format |
|---|---|---|---|
| `+212612345678` | `MA` | Morocco | `E164` |
| `00212612345678` | `MA` | Morocco | `DOUBLE_ZERO` |
| `212612345678` | `MA` | Morocco | `NUMERIC` |
| `0612345678` + `'MA'` | `MA` | Morocco | `LOCAL` |
| `+33612345678` | `FR` | France | `E164` |
| `+18005551234` | `US` | United States | `E164` (toll-free) |
| `+966512345678` | `SA` | Saudi Arabia | `E164` |
| `0612345678` | `XX` | Unknown | `LOCAL` |

---

## Installation & configuration

```bash
composer require wal3fo/phone-country

# Optionally publish the config
php artisan vendor:publish --tag=phone-country-config
```

```php
// config/phone-country.php
return [
    'default_country' => env('PHONE_COUNTRY_DEFAULT', 'XX'),
    'unknown_code'    => 'XX',
];
```

```env
PHONE_COUNTRY_DEFAULT=MA
```

**Performance** — for high-volume workloads, cache `analyze()` results:

```php
$analysis = Cache::remember("phone_analysis:{$phone}", 3600, fn () =>
    PhoneCountryService::analyze($phone)
);
```

---

## File structure

```
src/
├── PhoneCountryService.php          ← Main service — resolveCountryCode() and analyze()
├── PhoneCountryServiceProvider.php  ← Laravel service provider
├── PhoneAnalysis.php                ← Rich value object returned by analyze()
├── PhoneResult.php                  ← Lightweight value object
├── CountryMetadata.php              ← Static map: flag, region, capital, currency, language, timezone
├── Rules/
│   └── PhoneCountryRule.php         ← Laravel validation rule
└── AI/
    ├── PhoneNormalizer.php          ← Input cleaning & repair
    ├── NanpDisambiguator.php        ← +1 area-code map (25+ NANP countries)
    ├── FraudDetector.php            ← Toll-free / premium / VOIP signal detection
    ├── MetadataEnricher.php         ← Extended metadata enrichment
    └── PhoneExplainer.php           ← Plain-language explanation generator
config/
└── phone-country.php
```

---

## Changelog

### v1.0.0
- Initial release with `resolveCountryCode()` and longest-prefix matching
- Added `analyze()` returning `PhoneAnalysis` value object
- Added `PhoneAnalysis` with flag, region, continent, capital, currency name, language, timezone
- Added national and international number formatting (`formatNational`, `formatInternational`)
- Added `isPossible` and `digitCount` for length plausibility checks
- Added input format detection (`E164`, `DOUBLE_ZERO`, `NUMERIC`, `LOCAL`)
- Added `usedFallback` and `resolvedAt` metadata
- Added `toHtml()` — self-contained HTML card with inline CSS
- Added `toJson()` and `toArray()` for API responses
- Added `explanation` magic property returning an HTML `<ul>` summary
- Added `CountryMetadata` — static map for 180+ countries
- Added `PhoneCountryRule` — Laravel validation rule with allowlist and strict mode
- Added `AI/` — PhoneNormalizer, NanpDisambiguator, FraudDetector, MetadataEnricher, PhoneExplainer

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for full details.
