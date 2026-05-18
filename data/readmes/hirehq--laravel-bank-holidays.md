# Laravel Bank Holidays

[![Tests](https://img.shields.io/github/actions/workflow/status/hirehq/laravel-bank-holidays/tests.yml?branch=main&label=tests)](https://github.com/hirehq/laravel-bank-holidays/actions/workflows/tests.yml)

`hirehq/laravel-bank-holidays` adds UK-aware Carbon macros for working day calculations in Laravel applications, using the official GOV.UK bank holiday feed.

## Features

- Carbon macros for moving forward and backward by working day
- Predicate helpers for working days and bank holidays
- GOV.UK bank holiday feed integration with long-lived caching
- Support for `england-and-wales`, `scotland`, and `northern-ireland`
- Laravel package auto-discovery with publishable configuration

## Installation

```bash
composer require hirehq/laravel-bank-holidays
```

## Publish Configuration

```bash
php artisan vendor:publish --tag=bank-holidays-config
```

This publishes `config/bank_holidays.php` to your application.

## Configuration

```php
return [
    'division' => 'england-and-wales',
    'cache_days' => 31,
    'timezone' => null,
];
```

- `division`: `england-and-wales`, `scotland`, or `northern-ireland`
- `cache_days`: feed cache lifetime in days
- `timezone`: optional override; falls back to `app.timezone_display`, then `app.timezone`

The package always uses the official GOV.UK bank holiday endpoint over HTTPS and validates the response structure before caching it.

## Compatibility

| Package Version | Laravel | PHP |
| --- | --- | --- |
| current | 11.x, 12.x, 13.x | 8.2, 8.3, 8.4, 8.5 |

## Usage

```php
use Carbon\CarbonImmutable;

$date = CarbonImmutable::parse('2025-05-23');

$next = $date->addWorkingDay();
$previous = $date->subWorkingDay();

$isWorkingDay = $date->isWorkingDay();
$isBankHoliday = $date->isBankHoliday();
```

The package evaluates weekends and the configured UK bank holiday division when resolving working days.

## Testing

From the package directory:

```bash
composer install
composer test
composer refactor
```

## Contributing

Please review [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

## Security

Please report vulnerabilities according to [`SECURITY.md`](SECURITY.md).
Sensitive security reports can be sent to `security@hirehq.co.uk`.
