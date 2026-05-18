
# Laranums
Laranums is a Laravel package that turns PHP enums into a first-class, fully-featured domain primitive. One trait unlocks lookup, conversion, translations, attribute-driven UI metadata, navigation, filtering, comparison, ordering and more.

[![Packagist Downloads](https://img.shields.io/packagist/dt/lucastuzina/laranums.svg)](https://packagist.org/packages/lucastuzina/laranums)
![Version](https://img.shields.io/badge/version-2.0.0-darkgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Installation
```sh
composer require lucastuzina/laranums
```

## Quickstart
Drop the `Laranum` trait into any enum:

```php
use Lucastuzina\Laranums\Laranum;

enum Status: string
{
    use Laranum;

    case Active   = 'active';
    case Inactive = 'inactive';
    case Pending  = 'pending';
}

Status::fromValue('active');             // Status::Active
Status::toSelectOptions();               // ['active' => 'Active', 'inactive' => 'Inactive', …]
Status::Active->next();                  // Status::Inactive
Status::Active->in([Status::Pending]);   // false
```

## Documentation
Full docs live in the [`docs/`](docs/) directory:

- **[Case Attributes](docs/case-attributes.md)** — `#[Label]`, `#[Color]`, `#[Icon]`, `#[Description]` plus `label()`, `color()`, `icon()`, `description()`, `toSelectOptions()`.
- **[Trait Methods](docs/trait-methods.md)** — Every method the trait adds, organised by concern.
- **[Utility Enums](docs/utility-enums.md)** — Ready-to-use enums (Unit, HttpStatus, Day, Currency, Country, Language, …).
- **[Laravel Integration](docs/laravel-integration.md)** — Validation rules, Faker provider, Eloquent query macros.
- **[Artisan Command](docs/artisan-command.md)** — Scaffold new enums with `php artisan make:laranum`.

## Feature Overview

### Case Attributes
Attach UI metadata directly to cases — no `match` statements, no framework lock-in.

```php
use Lucastuzina\Laranums\Attributes\{Label, Color, Icon};

enum OrderStatus: string
{
    use Laranum;

    #[Label('Pending'), Color('yellow'), Icon('clock')]
    case PENDING = 'pending';

    #[Label('Paid'), Color('green'), Icon('check-circle')]
    case PAID = 'paid';
}

OrderStatus::PAID->color();   // 'green'
OrderStatus::toSelectOptions(); // ['pending' => 'Pending', 'paid' => 'Paid']
```
→ [Full details](docs/case-attributes.md)

### Method Cheatsheet
| Concern        | Methods                                                                          |
|----------------|----------------------------------------------------------------------------------|
| Lookup         | `fromName`, `fromValue`, `fromNameOrDefault`, `fromValueOrDefault`, `isValidName`, `isValidValue` |
| Metadata       | `className`                                                                      |
| Conversion     | `toArray`, `toArrayReversed`, `names`, `values`, `collect`                       |
| Translations   | `trans`, `transNames`, `transValues`                                             |
| Attributes     | `label`, `color`, `icon`, `description`, `toSelectOptions`                       |
| Navigation     | `first`, `last`, `count`, `at`, `index`, `next`, `previous`                      |
| Filtering      | `only`, `except`, `rand`, `random`                                               |
| Comparison     | `is`, `in`, `notIn`                                                              |
| Ordering       | `compare`, `lessThan`, `greaterThan`, `between`                                  |
| JSON           | `jsonSerialize`                                                                  |
| Validation     | `rule`, `ruleOnly`, `ruleExcept`                                                 |

→ [Full reference](docs/trait-methods.md)

### Utility Enums
Ready-to-use, domain-neutral enums that ship with the full `Laranum` trait baked in.

| Enum                 | Purpose                                                                     |
|----------------------|-----------------------------------------------------------------------------|
| `Unit`               | Length, weight, time, speed, temperature, … with built-in conversion.       |
| `HttpStatus`         | IANA status codes with category helpers (`isSuccess`, `isClientError`, …). |
| `HttpMethod`         | `isSafe`, `isIdempotent`, `hasRequestBody` per RFC 7231.                    |
| `Day`                | ISO-8601 weekdays with `isWeekday`, `isWeekend`, `short`.                   |
| `Month`              | Leap-year-aware `daysInMonth`, `quarter`, `short`.                          |
| `Quarter`            | `months()`, `firstMonth()`, `lastMonth()`.                                  |
| `Season`             | Meteorological seasons with hemisphere support.                             |
| `CardinalDirection`  | 8-point compass with `degrees`, `opposite`, `fromDegrees`.                  |
| `Continent`          | Seven-continent model with ISO codes.                                       |
| `Currency`           | ISO 4217 (~150 codes) with `symbol`, `decimals`, `format`.                  |
| `Country`            | All 249 ISO 3166-1 countries with `alpha3`, `numeric`, `dialCode`, `continent`, `flag`. |
| `Language`           | ISO 639-1 (~180 codes) with `nativeName`, `isRtl`.                          |

→ [Full details](docs/utility-enums.md)

### Laravel Integration
- **Validation:** `OrderStatus::rule()`, `::ruleOnly([...])`, `::ruleExcept([...])` — returns Laravel's native `Enum` rule, drop straight into a FormRequest.
- **Faker:** `$faker->enum(OrderStatus::class)` via `LaranumFakerProvider`.
- **Eloquent:** `Order::whereEnum('status', OrderStatus::PAID)` and `whereEnumNot`, `orWhereEnum` macros — accept enum instances or arrays directly.

→ [Full details](docs/laravel-integration.md)

### Artisan Command
```sh
php artisan make:laranum UserRole admin editor guest --type=string --lang=en,de
```
Scaffolds the enum and optional translation stubs under `lang/{locale}/enums.php`.

→ [Full details](docs/artisan-command.md)

## À la carte
If you don't want the whole trait, compose your own from the concerns under `Lucastuzina\Laranums\Concerns\*`:

```php
use Lucastuzina\Laranums\Concerns\{HasLookup, HasAttributes};

enum MyEnum: string
{
    use HasLookup, HasAttributes;
    // ...
}
```

## License
This package is open-sourced software licensed under the MIT license.
