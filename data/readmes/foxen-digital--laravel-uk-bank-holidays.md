# Laravel UK Bank Holidays

A Laravel package providing easy access to official UK bank holiday data from GOV.UK with intelligent caching and territorial support.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/foxen/laravel-uk-bank-holidays.svg?style=flat-square)](https://packagist.org/packages/foxen/laravel-uk-bank-holidays)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/foxen/laravel-uk-bank-holidays/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/foxen/laravel-uk-bank-holidays/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/foxen/laravel-uk-bank-holidays.svg?style=flat-square)](https://packagist.org/packages/foxen/laravel-uk-bank-holidays)

## Features

- Fetches data directly from the official [GOV.UK bank holidays API](https://www.gov.uk/bank-holidays.json)
- Intelligent caching with configurable duration
- Support for all UK territories: England & Wales, Scotland, and Northern Ireland
- Clean, Laravel-native API with Facade support
- Blade directive for conditional rendering
- Carbon integration for date handling

## Installation

Install the package via Composer:

```bash
composer require foxen/laravel-uk-bank-holidays
```

The package will auto-register its service provider and facade.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="uk-bank-holidays-config"
```

This will create a `config/uk-bank-holidays.php` file with the following options:

```php
return [
    // Default territory when none is specified
    'default_territory' => env('UK_BANK_HOLIDAY_TERRITORY', 'england-and-wales'),

    // Cache duration in seconds (default: 24 hours)
    'cache_duration' => env('UK_BANK_HOLIDAY_CACHE', 86400),

    // Cache key prefix
    'cache_key_prefix' => 'uk-bank-holidays',

    // GOV.UK API URL (override for testing)
    'api_url' => env('UK_BANK_HOLIDAY_API', 'https://www.gov.uk/bank-holidays.json'),
];
```

## Usage

### Basic Usage

```php
use Foxen\BankHolidays\Facades\BankHolidays;

// Check if a date is a bank holiday
if (BankHolidays::isHoliday('2026-01-01')) {
    echo "It's a bank holiday!";
}

// Check using a Carbon instance
if (BankHolidays::isHoliday(now())) {
    echo "No deliveries today!";
}
```

### Available Territories

- `england-and-wales` (default)
- `scotland`
- `northern-ireland`

```php
// Check a specific territory
BankHolidays::isHoliday('2026-11-30', 'scotland'); // St Andrew's Day - Scotland only
```

### Get All Holidays for a Year

```php
$holidays = BankHolidays::forYear(2026);

foreach ($holidays as $holiday) {
    echo $holiday->title;   // "New Year's Day"
    echo $holiday->date;    // "2026-01-01"
    echo $holiday->notes;   // Additional notes (often empty)
    echo $holiday->bunting; // true/false (decorative flag)
}

// For a specific territory
$scottishHolidays = BankHolidays::forYear(2026, 'scotland');
```

### Get the Next Bank Holiday

```php
// Next holiday from today
$next = BankHolidays::next();
echo $next->title; // "Good Friday"

// Next holiday from a specific date
$next = BankHolidays::next('2026-12-20');
echo $next->title; // "Christmas Day"

// Returns null if no future holidays in data
$next = BankHolidays::next('2030-01-01');
```

### Get Holidays Within a Date Range

```php
// Get all holidays in Q1 2026
$holidays = BankHolidays::between('2026-01-01', '2026-03-31');

// Returns empty collection if no holidays in range
$holidays = BankHolidays::between('2026-02-01', '2026-02-14');
```

### Get Holiday Details for a Specific Date

```php
$holiday = BankHolidays::get('2026-12-25');

if ($holiday) {
    echo $holiday->title; // "Christmas Day"
}

// Returns null if not a holiday
$holiday = BankHolidays::get('2026-01-02'); // null
```

### Clear Cache

```php
// Clear all cached data
BankHolidays::clearCache();
```

## Blade Directive

Use the `@bankholiday` directive in your Blade templates:

```blade
{{-- Check if today is a bank holiday --}}
@bankholiday
    <p>Note: Today is a bank holiday - no deliveries!</p>
@endbankholiday

{{-- Check a specific date --}}
@bankholiday('2026-01-01')
    <p>New Year's Day - Offices closed</p>
@else
    <p>Normal working day</p>
@endbankholiday

{{-- Check with territory --}}
@bankholiday('2026-11-30', 'scotland')
    <p>St Andrew's Day - Scotland only</p>
@endbankholiday
```

## Holiday Object

The `Holiday` data transfer object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Name of the bank holiday |
| `date` | string | Date in Y-m-d format |
| `notes` | string | Additional notes (often empty) |
| `bunting` | bool | Whether decorative bunting is displayed |
| `territory` | string | The territory this holiday belongs to |

Methods:
- `toCarbon()` - Returns a Carbon instance of the date
- `toArray()` - Converts the holiday to an array

## Error Handling

The package throws specific exceptions for invalid input:

```php
use Foxen\BankHolidays\Exceptions\InvalidDateException;
use Foxen\BankHolidays\Exceptions\InvalidTerritoryException;
use Foxen\BankHolidays\Exceptions\ApiConnectionException;

try {
    BankHolidays::isHoliday('invalid-date');
} catch (InvalidDateException $e) {
    // Handle invalid date format
}

try {
    BankHolidays::forYear(2026, 'invalid-territory');
} catch (InvalidTerritoryException $e) {
    // Handle invalid territory
}
```

## Testing

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [MrKareth](https://github.com/mrkareth)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
