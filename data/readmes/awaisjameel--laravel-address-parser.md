
# Laravel Address Parser

**Smart, opinionated parsing of single‑line US postal addresses into structured components for Laravel.**

[![Latest Version on Packagist](https://img.shields.io/packagist/v/awaisjameel/laravel-address-parser.svg?style=flat-square)](https://packagist.org/packages/awaisjameel/laravel-address-parser)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/awaisjameel/laravel-address-parser/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/awaisjameel/laravel-address-parser/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/awaisjameel/laravel-address-parser/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/awaisjameel/laravel-address-parser/actions?query=workflow%3A)
[![Total Downloads](https://img.shields.io/packagist/dt/awaisjameel/laravel-address-parser.svg?style=flat-square)](https://packagist.org/packages/awaisjameel/laravel-address-parser)

Laravel Address Parser helps you take messy user‑submitted single line US addresses and split them into reliable fields: `address1`, `address2` (unit), `city`, `state`, `zip` and optionally `county`. It applies pragmatic heuristics—street suffix detection, unit indicator extraction, normalization (whitespace + periods), and validation of state + ZIP formats—without depending on external APIs. Ideal for form ingestion, ETL pipelines, quick data cleanup, and pre‑validation before geocoding.

> Not a USPS CASS certified normalizer. It doesn't validate that an address physically exists; it simply parses and validates format.

---

## Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Usage Examples](#usage-examples)
6. [Facade, DI &amp; Helper Patterns](#facade-di--helper-patterns)
7. [Parsing Logic &amp; Heuristics](#parsing-logic--heuristics)
8. [County Parsing](#county-parsing)
9. [Validation Utilities](#validation-utilities)
10. [Formatting Addresses](#formatting-addresses)
11. [Configuration](#configuration)
12. [Error Handling](#error-handling)
13. [Edge Cases &amp; Limitations](#edge-cases--limitations)
14. [Testing](#testing)
15. [Performance](#performance)
16. [Roadmap](#roadmap)
17. [Contributing](#contributing)
18. [Security](#security)
19. [Support Us](#support-us)
20. [Credits](#credits)
21. [License](#license)

---

## Features

- ✅ Parse single‑line US addresses with or without commas
- ✅ Detect and extract unit indicators (`APT`, `STE`, `#12`, `FLOOR`, etc.)
- ✅ Supports ZIP (5‑digit) and ZIP+4 (extended) formats
- ✅ Validates US state abbreviations (full 50 + DC)
- ✅ Optional county parsing via comma‑separated form
- ✅ Normalizes periods after abbreviations (`St.` → `St`), collapses excess whitespace
- ✅ Graceful formatting back to a one‑line address
- ✅ Clear, typed exception (`AddressParsingException`) for invalid cases
- ✅ Simple, framework‑friendly (pure static methods), zero external API calls
- ✅ Battle‑tested with [Pest](https://pestphp.com/) test suite

---

## Requirements

| Component                      | Version                             |  |     |  |     |
| ------------------------------ | ----------------------------------- | - | --- | - | --- |
| PHP                            | 7.4 or ^8.2                         |  |     |  |     |
| Laravel (illuminate/contracts) | ^10                                 |  | ^11 |  | ^12 |
| Extension dependencies         | None beyond standard PHP + mbstring |  |     |  |     |

---

## Installation

Install via Composer:

```bash
composer require awaisjameel/laravel-address-parser
```

The package auto‑discovers. No manual provider registration required.

### Optional: Publish Config

Currently the config file is a placeholder for future tuning (custom suffixes, unit indicators, etc.). You can publish it now:

```bash
php artisan vendor:publish --tag="laravel-address-parser-config"
```

Published file at `config/address-parser.php`:

```php
return [
	// Reserved for future customization: e.g. 'extra_street_suffixes' => [],
	// 'extra_unit_indicators' => [],
];
```

> No migrations or views are shipped (ignore earlier generic template tags).

---

## Quick Start

```php
use Awaisjameel\LaravelAddressParser\LaravelAddressParser;

$parsed = LaravelAddressParser::parseAddressString('500 Elm Avenue Apt 4B Metropolis NY 10001');

/* Result:
[
  'address1' => '500 Elm Avenue',
  'address2' => 'APT 4B',
  'city'     => 'Metropolis',
  'state'    => 'NY',
  'zip'      => '10001',
  'county'   => null,
]
*/
```

---

## Usage Examples

### 1. Basic Parsing (No Commas)

```php
$parsed = LaravelAddressParser::parseAddressString('77 Broadway St #12 Gotham NJ 07001');
// address2 is '#12'
```

### 2. Comma‑Separated

```php
$parsed = LaravelAddressParser::parseAddressString('1600 Pennsylvania Avenue NW, Washington, DC 20500-0003');
```

### 3. With County (If Provided)

```php
$parsed = LaravelAddressParser::parseAddressStringWithCounty('123 Main St, Springfield, Greene, MO 65804');
// county => 'Greene'
```

### 4. County Method Without County

```php
$parsed = LaravelAddressParser::parseAddressStringWithCounty('1600 Pennsylvania Avenue NW, Washington, DC 20500');
// county => null
```

### 5. Format Back to One Line

```php
$formatted = LaravelAddressParser::formatAddress([
  'address1' => '123 Main St',
  'address2' => 'APT 4B',
  'city'     => 'Springfield',
  'state'    => 'IL',
  'zip'      => '62704',
]);
// "123 Main St APT 4B, Springfield, IL 62704"
```

### 6. Validation Helpers

```php
LaravelAddressParser::isValidState('TX');     // true
LaravelAddressParser::isValidZipCode('12345-6789'); // true
LaravelAddressParser::getValidStates();       // [ 'AL', 'AK', ... ]
```

---

## Facade, DI & Helper Patterns

Because all methods are static, you can call the class directly. A facade alias `LaravelAddressParser` is registered; if you prefer the facade style:

```php
use LaravelAddressParser; // Facade alias

$parsed = LaravelAddressParser::parseAddressString('500 Elm Avenue Apt 4B Metropolis NY 10001');
```

Dependency injection is not required, but you can wrap this in your own service if you want to enforce non‑static boundaries for test isolation.

---

## Parsing Logic & Heuristics

1. Normalize input: trim, collapse whitespace, remove trailing punctuation, strip periods after known abbreviations.
2. Extract trailing `STATE ZIP` using regex. Validate both.
3. Before the state/ZIP segment:
   - If no commas: locate rightmost known street suffix, everything after → city.
   - If commas: last comma part → city; remaining → address lines.
4. Unit detection:
   - Detect explicit unit parts after street suffix (e.g. `Apt 4B`, `#12`).
   - Handles units embedded at end of `address1` or separated by comma.
5. Normalizes unit casing (except leading `#`).
6. Returns structured array including a nullable `county` when parsed via county method.

Recognized street suffixes (subset): `ST`, `AVE`, `RD`, `DR`, `LN`, `CT`, `CIR`, `BLVD`, `PKWY`, `TRAIL`, `HWY`, `WAY`, `PL`, `LOOP`, `TER`, `EXPY`, etc.

Recognized unit indicators: `APT`, `SUITE`, `STE`, `UNIT`, `FLOOR`, `ROOM`, `BLDG`, `#`, `LOT`, `SPACE`, etc.

---

## County Parsing

Use `parseAddressStringWithCounty()` for either format:

1. `Street, City, County, ST ZIP`
2. `Street, City, ST ZIP` (county omitted → `county => null`)

If fewer than 3 comma‑separated parts exist (excluding state/ZIP) an exception is thrown.

---

## Validation Utilities

| Method                          | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `isValidZipCode(string $zip)` | 5‑digit or ZIP+4 pattern `12345` / `12345-6789` |
| `isValidState(string $state)` | Valid two‑letter US state (inclusive of DC)         |
| `getValidStates()`            | Returns internal list of state abbreviations         |

These do not consult external APIs; they are format checks only.

---

## Formatting Addresses

`formatAddress(array $components): string` builds a single line string from parsed parts. Missing `address2` is skipped; missing `address1` results in `City, ST ZIP` only.

```php
$oneLine = LaravelAddressParser::formatAddress($parsed);
```

---

## Configuration

Currently no runtime options are exposed. Future versions may allow:

- Extending street suffix list
- Extending unit indicator list
- Custom validation strategy or USPS API integration hooks

Feel free to open an issue with your use case.

---

## Error Handling

Parsing failures throw `Awaisjameel\LaravelAddressParser\AddressParsingException` with a human‑readable message. Common triggers:

- Empty or "0" input
- Cannot locate valid trailing `STATE ZIP`
- Invalid state abbreviation (e.g. `ZZ`)
- Invalid ZIP format
- Missing city segment
- Cannot identify street suffix when required

Always wrap user‑submitted data:

```php
try {
	$parsed = LaravelAddressParser::parseAddressString($raw);
} catch (AddressParsingException $e) {
	// Log, show validation error, fallback, etc.
}
```

---

## Edge Cases & Limitations

| Scenario                              | Behavior                                                      |
| ------------------------------------- | ------------------------------------------------------------- |
| Missing street suffix & no commas     | Throws exception                                              |
| Excess whitespace                     | Normalized                                                    |
| Periods after abbreviations (`St.`) | Removed                                                       |
| Mixed case units (`aPt 4b`)         | Uppercased →`APT 4B`                                       |
| Standalone `#12` unit               | Preserved exactly                                             |
| Non‑US addresses                     | Likely rejected (state + ZIP fail)                            |
| Addresses without house number        | Usually rejected unless suffix detection passes heuristics    |
| PO Boxes                              | Parsed as street if suffix logic permits (e.g.`PO BOX 123`) |

Not a full canonicalizer: it won't expand `NW` to `Northwest`, or validate delivery points.

---

## Testing

Run the full test suite (Pest):

```bash
composer test
```

Or with coverage:

```bash
composer test-coverage
```

Static analysis:

```bash
composer analyse
```

Code style (Laravel Pint):

```bash
composer format
```

---

## Performance

All operations are in‑memory string functions & a few regex matches. Suitable for real‑time form handling. For bulk ETL (hundreds of thousands of rows) you can batch process safely; memory footprint is minimal.

Micro‑optimizations (e.g. caching compiled regex) are intentionally deferred until a real hotspot is demonstrated.

---

## Roadmap

- Optional configuration for custom suffix/unit lists
- USPS address standardization adapter
- Geocoding integration hooks
- Bulk parsing helper with per‑record error collection
- Locale expansion (Canadian, UK parsing) via strategy interfaces

Have a request? Open an issue.

---

## Contributing

Contributions are welcome! Please:

1. Fork & create a feature branch
2. Add/adjust tests for new behavior
3. Run: `composer analyse`, `composer format`, `composer test`
4. Open a PR describing rationale & trade‑offs

For architectural changes, open an issue first for discussion.

---

## Security

If you discover a security vulnerability (e.g. pathological regex input leading to DoS), please email the author or open a private advisory. Avoid posting exploits publicly until a fix is released.

This library does not execute external processes or perform network calls, and stores no secrets.

---

## Support Us

If you find this package useful, consider supporting its development make sure to give a star on GitHub!

---

## Credits

- [awaisjameel](https://github.com/awaisjameel)
- Inspired by pragmatic parsing approaches in many OSS data-cleanup tools

---

## License

Released under the MIT License. See [`LICENSE.md`](LICENSE.md).

---

## FAQ

### Does it validate an address actually exists?

No. It validates format only. For existence use USPS, Smarty, Google, etc.

### Will it parse multi‑line addresses?

Only single‑line strings. Pre‑join lines ("address1 address2") before parsing, or use the county method if needed.

### Why static methods?

Low ceremony; no state. You can wrap them if you prefer dependency injection.

### Is the heuristics list exhaustive?

It covers common US street suffixes & unit indicators. You can extend in the future via config once exposed.

### Can I disable normalization?

Not yet. Planned via config.

---

## Example End‑to‑End Form Handling

```php
try {
	$parsed = LaravelAddressParser::parseAddressString(request('address_line'));

	// Persist
	CustomerAddress::create([
		'address1' => $parsed['address1'],
		'address2' => $parsed['address2'],
		'city'     => $parsed['city'],
		'state'    => $parsed['state'],
		'zip'      => $parsed['zip'],
		'county'   => $parsed['county'],
		'raw'      => request('address_line'),
	]);
} catch (AddressParsingException $e) {
	return back()->withErrors(['address_line' => $e->getMessage()]);
}
```

---

Happy parsing! 📨
