# Laravel EGN

[![Latest Stable Version](https://img.shields.io/packagist/v/metalinvestremko/laravel-egn?style=flat-square)](https://packagist.org/packages/metalinvestremko/laravel-egn)
[![Total Downloads](https://img.shields.io/packagist/dt/metalinvestremko/laravel-egn?style=flat-square)](https://packagist.org/packages/metalinvestremko/laravel-egn)
[![License](https://img.shields.io/packagist/l/metalinvestremko/laravel-egn?style=flat-square)](https://packagist.org/packages/metalinvestremko/laravel-egn)
[![PHP Version](https://img.shields.io/packagist/dependency-v/metalinvestremko/laravel-egn/php?style=flat-square)](https://packagist.org/packages/metalinvestremko/laravel-egn)
[![Tests](https://github.com/MetalinvestRemko/laravel-egn/actions/workflows/tests.yml/badge.svg)](https://github.com/MetalinvestRemko/laravel-egn/actions/workflows/tests.yml)

A Laravel package for validating, parsing, and generating Bulgarian EGN numbers (ЕГН).

## Features

- Validate Bulgarian EGN numbers
- Parse EGN into birth date and gender
- Generate valid EGN numbers with optional constraints:
  - gender (`male|female|m|f`)
  - exact date (`date`) or partial date (`year`, `month`, `day`)
  - region prefix (`0..99`)
  - batch generation (`generate($count, ...)`)
- Resolve rich EGN metadata via `details()`:
  - localized output (`bg` / `en`)
  - birth date formatting and weekday
  - age
  - region name and serial range
  - birth order within region parity
  - zodiac sign
- Native Laravel validation rule: `egn`

## Requirements

- PHP `^8.1`
- Laravel components:
  - `illuminate/support ^10.0|^11.0|^12.0`
  - `illuminate/validation ^10.0|^11.0|^12.0`

## Installation

```bash
composer require metalinvestremko/laravel-egn
```

## Configuration (Optional)

Publish the config file:

```bash
php artisan vendor:publish --tag=egn-config
```

Config file: `config/egn.php`

```php
return [
    'start_year' => 1800,
    'end_year' => 2099,
];
```

These values define the default random generation range when `year` is not explicitly provided.

## Usage

### Validate EGN

```php
use MetalinvestRemko\LaravelEgn\Facades\Egn;

$isValid = Egn::validate('6101057509'); // true
```

### Laravel Validation Rule

```php
$request->validate([
    'egn' => ['required', 'egn'],
]);
```

### Parse EGN

```php
$parsed = Egn::parse('6101057509');

// [
//   'year' => 1961,
//   'month' => 1,
//   'day' => 5,
//   'gender' => 0, // 0 = female, 1 = male
// ]
```

### Get Detailed Metadata

```php
$detailsArray = Egn::details('8702260780'); // default format: array
$detailsObject = Egn::details('8702260780', 'object');
$detailsCollection = Egn::details('8702260780', 'collection');
$detailsEn = Egn::details('8702260780', 'array', 'en');
```

`details()` returns `null` for invalid EGN.

Locale behavior:

- If locale is provided, only `bg` and `en` are accepted
- Unsupported locale values fallback to `bg`
- If locale is omitted, package attempts `app()->getLocale()` and still restricts to `bg|en`

Example (`array`, `en` locale):

```php
[
    'egn' => '8702260780',
    'valid' => true,
    'locale' => 'en',
    'gender' => 'female',
    'gender_code' => 'female',
    'birth_date' => [
        'iso' => '1987-02-26',
        'year' => 1987,
        'month' => 2,
        'day' => 26,
        'weekday' => 'Thursday',
        'formatted' => '26 February 1987 (Thursday) (1987-02-26)',
    ],
    'age' => 38,
    'region' => [
        'code' => 78,
        'name' => 'Burgas',
        'range_start' => 44,
        'range_end' => 93,
    ],
    'birth_order' => 18,
    'zodiac' => [
        'name' => 'Pisces',
        'range' => '19 February - 20 March',
        'label' => 'Pisces (19 February - 20 March)',
    ],
]
```

### Generate One EGN

All options are optional.

```php
$egn = Egn::generateOne([
    'gender' => 'female', // male|female|m|f
    'year' => 1996,       // optional
    'month' => 8,         // optional
    'day' => 14,          // optional
    'region' => 22,       // optional, 0..99
]);
```

### Generate Multiple EGNs

```php
$egns = Egn::generate(50, [
    'month' => 2,
    'day' => 29,
]);
```

### Use Exact Date

```php
$egn = Egn::generateOne([
    'date' => '2004-06-12',
    'gender' => 'male',
]);
```

`date` accepts `DateTimeInterface|string|null`.

## Generation Options Reference

- `gender`: `male|female|m|f`
- `date`: exact date as `DateTimeInterface|string`
- `year`: integer in configured range
- `month`: integer `1..12`
- `day`: integer `1..31` (validated against month/year)
- `region`: integer `0..99`

Notes:

- `date` takes precedence over `year/month/day`
- Invalid combinations (for example impossible date constraints) throw `InvalidArgumentException`

## Region Mapping

The package resolves region names from the EGN serial (digits 7-9) using inclusive upper bounds.

| Upper Bound | Region (EN) |
|---|---|
| `43` | Blagoevgrad |
| `93` | Burgas |
| `139` | Varna |
| `169` | Veliko Tarnovo |
| `183` | Vidin |
| `217` | Vratsa |
| `233` | Gabrovo |
| `281` | Kardzhali |
| `301` | Kyustendil |
| `319` | Lovech |
| `341` | Montana |
| `377` | Pazardzhik |
| `395` | Pernik |
| `435` | Pleven |
| `501` | Plovdiv |
| `527` | Razgrad |
| `555` | Ruse |
| `575` | Silistra |
| `601` | Sliven |
| `623` | Smolyan |
| `721` | Sofia City |
| `751` | Sofia District |
| `789` | Stara Zagora |
| `821` | Dobrich |
| `843` | Targovishte |
| `871` | Haskovo |
| `903` | Shumen |
| `925` | Yambol |
| `999` | Other / Unknown |

## API Reference

```php
validate(string $egn): bool
parse(string $egn): ?array
details(string $egn, string $format = 'array', ?string $locale = null): array|object|collection|null
generateOne(array $options = []): string
generate(int $count = 1, array $options = []): array
```

## Testing

```bash
composer test
```

## Contributing

Contributions are welcome. Please open an issue or pull request with a clear description and test coverage for behavioral changes.

## Security

If you discover a security issue, please report it privately to the maintainer before opening a public issue.

## Related Website

- [Check and generate valid Bulgarian EGN numbers](https://egn.bg/)

## License

MIT License. See [LICENSE](LICENSE).
