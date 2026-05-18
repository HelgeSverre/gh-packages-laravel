# LaravelToolkit

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gabrielesbaiz/laravel-toolkit.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/laravel-toolkit)
[![Total Downloads](https://img.shields.io/packagist/dt/gabrielesbaiz/laravel-toolkit.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/laravel-toolkit)

A **lightweight and powerful helper package** for Laravel that provides utilities for **strings**, **numbers**, **time**, **web**, and **phone number** operations.

## Features

- ✅ String utilities (*StringKit*)
- ✅ Number utilities (*NumberKit*)
- ✅ Time utilities (*TimeKit*)
- ✅ Web utilities (*WebKit*)
- ✅ Phone number utilities (*PhoneKit*)
- ✅ Works seamlessly with Laravel facades

## Installation

You can install the package via composer:

```bash
composer require gabrielesbaiz/laravel-toolkit
```

Laravel will automatically register the service provider and facades.

If necessary, you can manually add the service provider in `config/app.php`:

```bash
'providers' => [
    Gabrielesbaiz\LaravelToolkit\LaravelToolkitServiceProvider::class,
],
```
And the facades:

```bash
'aliases' => [
    'LaravelToolkit' => Gabrielesbaiz\LaravelToolkit\Facades\LaravelToolkit::class,
    'StringKit' => Gabrielesbaiz\LaravelToolkit\Facades\StringKit::class,
    'NumberKit' => Gabrielesbaiz\LaravelToolkit\Facades\NumberKit::class,
    'TimeKit' => Gabrielesbaiz\LaravelToolkit\Facades\TimeKit::class,
    'WebKit' => Gabrielesbaiz\LaravelToolkit\Facades\WebKit::class,
    'PhoneKit' => Gabrielesbaiz\LaravelToolkit\Facades\PhoneKit::class,
],
```

## Usage

```php
$laravelToolkit = new Gabrielesbaiz\LaravelToolkit();

echo $laravelToolkit->string()->startsWithLetter('Hello'); // true
echo $laravelToolkit->number()->toDecimalPoint('1.234,56'); // 1234.56
echo $laravelToolkit->time()->nowYear(); // 2025
echo $laravelToolkit->web()->isValidUrl('https://example.com'); // true
echo $laravelToolkit->phoneNumber()->removePhoneCode('+391234567890'); // 1234567890
```

Using facade:

```php
use LaravelToolkit;

LaravelToolkit::string()->startsWithLetter('Hello'); // true
LaravelToolkit::number()->toDecimalPoint('1.234,56'); // 1234.56
LaravelToolkit::time()->nowYear(); // 2025
LaravelToolkit::web()->isValidUrl('https://example.com'); // true
LaravelToolkit::phoneNumber()->removePhoneCode('+391234567890'); // 1234567890
```

Using dedicated facades:

### StringKit
```php
use StringKit;

StringKit::startsWithLetter("hello"); // true
StringKit::upperCase("hello"); // "HELLO"
StringKit::trimSpaces("  hello  "); // "hello"
```

### NumberKit
```php
use NumberKit;

NumberKit::numberIsBetween(10, 5, 15); // true
NumberKit::toThousandsDecimal(123456.789); // "123.456,79"
```

### TimeKit
```php
use TimeKit;

TimeKit::nowYear(); // 2025
TimeKit::dateComplete(now()); // "10/03/2025 14:30:00"
```

### WebKit
```php
use WebKit;

WebKit::isValidUrl("https://example.com"); // true
```

### PhoneKit
```php
use PhoneKit;

PhoneKit::normalizePhoneNumber("+39 123 456 7890"); // "1234567890"
```

## Available Methods

### **StringKit**
- `StringKit::clearNewLines(?string $string): ?string` - Removes newline characters.
- `StringKit::clearNonNumeric(?string $string): ?string` - Removes all non-numeric characters from a string.
- `StringKit::clearSpaces(?string $string): ?string` - Replaces multiple spaces with a single space.
- `StringKit::clearTabs(?string $string): ?string` - Removes tab characters.
- `StringKit::convertToFemale(?string $string): ?string` - Converts male name endings ('o') to female ('a').
- `StringKit::isFemale(?string $string): bool` - Determines if a name is female based on the last letter.
- `StringKit::normalizeNames(?string $string): ?string` - Normalizes names to title case, handling apostrophes.
- `StringKit::nullIfEmpty($string): ?string` - Returns null if the string is empty.
- `StringKit::snakeSpaces(?string $string): ?string` - Replaces spaces with underscores.
- `StringKit::startsWithLetter($string): bool` - Checks if a string starts with a letter.
- `StringKit::startsWithNumber($string): bool` - Checks if a string starts with a number.
- `StringKit::trimSpaces(?string $string): ?string` - Trims spaces from both sides of a string.
- `StringKit::upperCase(?string $string): ?string` - Converts the string to uppercase.
- `StringKit::zapSpaces(?string $string): ?string` - Removes all spaces and special characters.

### **NumberKit**
- `NumberKit::hasPositiveSum(array $values): bool` - Checks if the sum of values is positive.
- `NumberKit::numberIsBetween(float $number, float $min, float $max): bool` - Checks if a number is within a range.
- `NumberKit::roundDownToMultiple(float $number, ?int $multiple): float` - Rounds a number down to the nearest multiple.
- `NumberKit::rounded(mixed $value): float` - Rounds a number to two decimals.
- `NumberKit::rounded3(mixed $value): float` - Rounds a number to three decimals.
- `NumberKit::rounded4(mixed $value): float` - Rounds a number to four decimals.
- `NumberKit::roundUpToMultiple(float $number, ?int $multiple): float` - Rounds a number up to the nearest multiple.
- `NumberKit::toCommaString(float $value): string` - Converts a float value to a string with a comma as decimal separator and two fixed decimal places.
- `NumberKit::toCurrency(?string $value): float` - Converts a number to a rounded currency format.
- `NumberKit::toCurrencyIntString(?string $value): ?string` - Formats an integer as a currency string.
- `NumberKit::toCurrencyIntStringHtml(?string $value): ?string` - Formats an integer as a currency string with an HTML Euro sign.
- `NumberKit::toCurrencyString(?string $value): ?string` - Formats a number as a currency string.
- `NumberKit::toCurrencyStringHtml(?string $value): ?string` - Formats a number as a currency string with an HTML Euro sign.
- `NumberKit::toCurrencyStringWithSign(?string $value): ?string` - Formats a number as a currency string with a sign.
- `NumberKit::toDecimalComma(?string $value): string` - Converts a decimal point to a comma format.
- `NumberKit::toDecimalCommaString(?string $value): string` - Converts a decimal point to a comma formatand '—' for 0 values.
- `NumberKit::toDecimalPoint(?string $value): float` - Converts a formatted number to a decimal point.
- `NumberKit::toFloor(mixed $value): float` - Floors a number to two decimal places.
- `NumberKit::toInt(mixed $value, int $precision): int` - Converts a float to an integer with precision.
- `NumberKit::toIntString(?string $value): ?string` - Converts an integer value to a string, returning '—' if zero or null.
- `NumberKit::toPercentageIntString(?string $value): ?string` - Formats an integer as a percentage string.
- `NumberKit::toPercentageRoundString(?string $value): ?string` - Formats a rounded number as a percentage string.
- `NumberKit::toPercentageString(?string $value, ?int $decimals = null): ?string` - Formats a number as a percentage.
- `NumberKit::toPriceInt(mixed $value): int` - Converts a float to its integer price value (in cents).
- `NumberKit::toThousands(?string $value): string` - Formats a number with thousand separators.
- `NumberKit::toThousandsDecimal(?string $value): string` - Formats a number with thousands and two decimal places.
- `NumberKit::toThousandsString(?string $value): string` - Formats a number with thousand separators and '—' for 0 values.

### **TimeKit**

-  `TimeKit::timeDiff(Carbon $dateTo, Carbon $dateFrom, ?int $parts = 4): string` - Returns the time difference between two dates.
- `TimeKit::convertDateToDmy(?string $value): ?string` - Converts Y-m-d to d/m/Y.
- `TimeKit::convertDateToDmyhis(?string $value): ?string` - Converts Y-m-d to d/m/Y H:i:s.
- `TimeKit::convertDmyhisToDate(?string $value): ?string` - Converts d/m/Y H:i:s to Y-m-d.
- `TimeKit::convertDmyMinusToDate(?string $value): ?string` - Converts d-m-Y to Y-m-d.
- `TimeKit::convertDmyToDate(?string $value): ?string` - Converts d/m/Y to Y-m-d.
- `TimeKit::convertDmyToTimestamp(?string $value): ?string` - Converts d/m/Y to Y-m-d H:i:s.
- `TimeKit::convertIso8601ToDmyHi(?string $value): ?string` - Converts an ISO8601 date to d/m/Y H:i.
- `TimeKit::convertTimestampToDmy(?string $value): ?string` - Converts Y-m-d H:i:s to d/m/Y.
- `TimeKit::convertTimestampToDmyHi(?string $value): ?string` - Converts Y-m-d H:i:s to d/m/Y H:i.
- `TimeKit::countDaysBetween(Carbon $startDate, Carbon $endDate): int` - Counts the days between two dates.
- `TimeKit::countDiffDays(string $date): int` - Counts the days between now and a given date.
- `TimeKit::countDiffMonths(Carbon $endDate): int` - Counts the month difference between now and a given date.
- `TimeKit::dateBase(?Carbon $date): ?string` - Returns a base date in d/m/Y format.
- `TimeKit::dateComplete(?Carbon $date): ?string` - Returns a complete date in d/m/Y H:i:s format.
- `TimeKit::dateCompleteWithDay(?Carbon $date): ?string` - Returns a full date including the weekday.
- `TimeKit::diffHumans(?Carbon $value): ?string` - Returns a human-readable difference from now.
- `TimeKit::diffHumansComplete(?Carbon $value): ?string` - Returns a detailed human-readable difference.
- `TimeKit::diffHumansLong(?Carbon $value): ?string` - Returns a longer human-readable difference.
- `TimeKit::diffHumansShort(?Carbon $value): ?string` - Returns a shorter human-readable difference.
- `TimeKit::excelToCarbon(int $excelDate): Carbon` - Converts an Excel date to a Carbon date.
- `TimeKit::futureMonthNameLowercase(): string` - Retrieves the name of the month two months ahead.
- `TimeKit::googleDate(Carbon $date): int` - Converts a Carbon date to a Google date integer.
- `TimeKit::monthName(int $monthNumber): ?string` - Retrieves a month name by number.
- `TimeKit::monthNameLowercase(int $monthNumber): ?string` - Retrieves a lowercase month name by number.
- `TimeKit::months(): array` - Retrieves an array of month names.
- `TimeKit::monthsAbbreviations(): array` - Retrieves an array of abbreviated month names.
- `TimeKit::nextMonthNameLowercase(): string` - Retrieves the name of the next month.
- `TimeKit::nowFormat(): string` - Returns the current date and time in d/m/Y H:i:s format.
- `TimeKit::nowYear(): int` - Returns the current year.
- `TimeKit::pastMonthNameLowercase(): string` - Retrieves the name of the month two months ago.
- `TimeKit::previousMonthNameLowercase(): string` - Retrieves the name of the previous month.
- `TimeKit::thisMonthNameLowercase(): string` - Retrieves the name of the current month.
- `TimeKit::todayFormat(): string` - Returns today's date in d/m/Y format.

### **WebKit**
- `WebKit::isValidUrl(string $string): bool` - Checks if a string is a valid URL.
- `WebKit::removeMailTo(?string $string): ?string` - Removes 'mailto:' from an email string.

### **PhoneKit**
- `PhoneKit::normalizePhoneNumber(?string $string): ?string` - Normalizes a phone number by removing the country code and spaces.
- `PhoneKit::phoneNumberHide(?string $number): ?string` - Masks all but the last three digits of a phone number.
- `PhoneKit::removePhoneCode(?string $string): ?string` - Removes the international dialing code from a phone number.

## Testing

Run tests using Pest:

```bash
vendor/bin/pest
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Gabriele Sbaiz](https://github.com/gabrielesbaiz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
