# Money Formatter

[![Latest Version on Packagist](https://img.shields.io/packagist/v/williamug/money-formatter.svg?style=flat-square)](https://packagist.org/packages/williamug/money-formatter/stats#major/all)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/williamug/money-formatter/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/williamug/money-formatter/actions?query=workflow%3Atests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/williamug/money-formatter.svg?style=flat-square)](https://packagist.org/packages/williamug/money-formatter/)

**The ultimate Laravel formatting package** with 15+ formatters for money, percentages, file sizes, phone numbers, credit cards, durations, and more. Includes Blade directives, helper functions, and a fluent API with support for multiple currencies and locales.

## Features

**15+ Powerful Formatters**
- Money & Currency formatting
- Percentage formatting
- File size (bytes to KB/MB/GB/TB)
- Number abbreviation (1K, 1M, 1B, 1T)
- Ordinal numbers (1st, 2nd, 3rd)
- Phone number formatting (international, national, dots)
- Credit card masking (secure)
- Duration formatting (seconds to human readable)
- Metric/SI prefix formatting
- Compact number notation
- Decimal to fraction conversion
- Number to words conversion
- And more!

**Multiple Ways to Use**
- Blade directives for templates (`@money`, `@percentage`, `@filesize`, etc.)
- Helper functions for quick usage (`format_money()`, `format_percentage()`, etc.)
- Facade for fluent API (`Money::format()`, `Money::percentage()`, etc.)
- Direct class instantiation for advanced usage

**Professional Features**
- Configurable decimal places, separators, and currency symbols
- Support for 8+ currencies (USD, EUR, GBP, UGX, KES, TZS, ZAR, and more)
- Locale-based formatting
- Parse formatted strings back to numbers
- Chainable methods for complex formatting


## Requirements

- PHP 8.2 or higher
- Laravel 10.x, 11.x, or 12.x
- PHP `intl` extension ([installation guide](https://www.php.net/manual/en/intl.installation.php))

## Installation

Install the package via composer:

```bash
composer require williamug/money-formatter
```

### Publish Configuration (Optional)

Publish the configuration file to customize default settings:

```bash
php artisan vendor:publish --tag=money-formatter-config
```

This creates `config/money-formatter.php` where you can configure:
- Default locale and currency
- Decimal places and separators
- Currency symbols
- And more...

## Usage

### Blade Directives

#### Format Money
```blade
@money(10000)
{{-- Output: 10,000.00 --}}

@money($invoice->total)
{{-- Output: 1,234.56 --}}
```

#### Format Money with Currency Symbol
```blade
@moneyWithSymbol(10000, 'USD')
{{-- Output: $ 10,000.00 --}}

@moneyWithSymbol($price, 'EUR')
{{-- Output: € 1,234.56 --}}
```

#### Format Currency with Locale
```blade
@currency(10000, 'USD', 'en_US')
{{-- Output: $10,000.00 --}}

@currency($amount, 'EUR', 'de_DE')
{{-- Output: 10.000,00 € --}}
```

#### Convert Number to Words
```blade
@numbertowords(10000)
{{-- Output: ten thousand --}}

@numbertowords(123456)
{{-- Output: one hundred twenty-three thousand four hundred fifty-six --}}
```

### Helper Functions

```php
// Format money
$formatted = format_money(10000);
// Returns: "10,000.00"

// Convert to words
$words = money_to_words(1234);
// Returns: "one thousand two hundred thirty-four"

// Format as currency
$currency = format_currency(10000, 'USD', 'en_US');
// Returns: "$10,000.00"

// Parse formatted money back to float
$amount = parse_money('10,000.00');
// Returns: 10000.0
```

### Facade

```php
use Williamug\MoneyFormatter\Facades\Money;

// Basic formatting
Money::format(10000);
// Returns: "10,000.00"

// Format with currency symbol
Money::formatWithSymbol(10000, 'USD');
// Returns: "$ 10,000.00"

// Convert to words
Money::toWords(1234);
// Returns: "one thousand two hundred thirty-four"

// Format with locale
Money::formatCurrency(10000, 'EUR', 'de_DE');
// Returns: "10.000,00 €"

// Parse formatted string
Money::parse('1,234.56');
// Returns: 1234.56

// Chain methods for custom formatting
Money::setDecimals(0)->format(10000);
// Returns: "10,000"

Money::setCurrency('EUR')->formatWithSymbol(10000);
// Returns: "€ 10,000.00"
```

### Direct Class Usage

```php
use Williamug\MoneyFormatter\MoneyFormatter;

$formatter = new MoneyFormatter();

// Format money
$result = $formatter->format(1234.56);
// Returns: "1,234.56"

// Customize formatting
$result = $formatter
    ->setDecimals(0)
    ->setCurrency('EUR')
    ->format(1234.56);
// Returns: "1,235"

// Format with symbol
$result = $formatter->formatWithSymbol(1234.56, 'USD');
// Returns: "$ 1,234.56"
```

## Advanced Formatters

### Percentage Formatting

```php
// Facade
Money::percentage(50); // "50.00%"
Money::percentage(75.5, 1); // "75.5%"
Money::percentage(100, 0, false); // "100" (without % sign)

// Helper
format_percentage(50); // "50.00%"

// Blade
@percentage(50) {{-- 50.00% --}}
```

### File Size Formatting

```php
// Facade
Money::fileSize(1024); // "1.00 KB"
Money::fileSize(1048576); // "1.00 MB"
Money::fileSize(1073741824); // "1.00 GB"

// Helper
format_filesize(1024); // "1.00 KB"

// Blade
@filesize(1024) {{-- 1.00 KB --}}
```

### Number Abbreviation

```php
// Facade
Money::abbreviate(1000); // "1.0K"
Money::abbreviate(1500000); // "1.5M"
Money::abbreviate(1000000000); // "1.0B"

// Helper
abbreviate_number(1000000); // "1.0M"

// Blade
@abbreviate(1000000) {{-- 1.0M --}}
```

### Ordinal Numbers

```php
// Facade
Money::ordinal(1); // "1st"
Money::ordinal(2); // "2nd"
Money::ordinal(3); // "3rd"
Money::ordinal(21); // "21st"

// Helper
format_ordinal(1); // "1st"

// Blade
@ordinal(1) {{-- 1st --}}
```

### Phone Number Formatting

```php
// Facade
Money::phone('1234567890', 'international'); // "+1 (123) 456-7890"
Money::phone('1234567890', 'national'); // "(123) 456-7890"
Money::phone('1234567890', 'dots'); // "123.456.7890"

// Helper
format_phone('1234567890'); // "+1 (123) 456-7890"

// Blade
@phone('1234567890') {{-- +1 (123) 456-7890 --}}
```

### Credit Card Masking

```php
// Facade
Money::creditCard('1234567890123456'); // "**** **** **** 3456"
Money::creditCard('1234567890123456', 'X', 4); // "XXXX XXXX XXXX 3456"

// Helper
format_creditcard('1234567890123456'); // "**** **** **** 3456"

// Blade
@creditcard('1234567890123456') {{-- **** **** **** 3456 --}}
```

### Duration Formatting

```php
// Facade
Money::duration(60); // "1 minute"
Money::duration(3600); // "1 hour"
Money::duration(86400); // "1 day"
Money::duration(90); // "1 minute, 30 seconds"
Money::duration(3665, true); // "1h, 1m" (short format)

// Helper
format_duration(3600); // "1 hour"

// Blade
@duration(3600) {{-- 1 hour --}}
```

### Additional Formatters

```php
// Metric notation (SI units)
Money::metric(1500, 2, 'W'); // "1.50kW"
Money::metric(1500000, 1, 'W'); // "1.5MW"

// Compact numbers (locale-aware)
Money::compact(1500000); // "1.5M"

// Decimal to fraction
Money::fraction(0.5); // "1/2"
Money::fraction(0.333, 100); // "1/3"

// Ordinal words
Money::ordinalWords(1); // "1st" (locale-dependent)
```

## Configuration

The `config/money-formatter.php` file provides extensive customization:

```php
return [
    // Default locale (e.g., 'en_US', 'de_DE')
    'default_locale' => 'en_US',

    // Default currency code
    'default_currency' => 'USD',

    // Number of decimal places
    'decimals' => 2,

    // Thousand separator
    'thousand_separator' => ',',

    // Decimal separator
    'decimal_separator' => '.',

    // Show currency symbol by default
    'show_symbol' => false,

    // Symbol position: 'before' or 'after'
    'symbol_position' => 'before',

    // Locale for number to words
    'words_locale' => 'en',

    // Currency symbols mapping
    'currency_symbols' => [
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
        'UGX' => 'UGX',
        // ... add more
    ],
];
```

## Advanced Examples

### Multiple Currency Formatting in a View

```blade
<div class="invoice">
    <h2>Invoice #{{ $invoice->number }}</h2>

    <p>Subtotal: @money($invoice->subtotal)</p>
    <p>Tax: @money($invoice->tax)</p>
    <p>Total: @moneyWithSymbol($invoice->total, 'USD')</p>

    <p class="words">
        Amount in words: @numbertowords($invoice->total)
    </p>
</div>
```

### Dynamic Currency Formatting

```php
// In your controller
$currencies = ['USD', 'EUR', 'GBP'];
$amount = 1234.56;

foreach ($currencies as $currency) {
    $formatted = Money::formatWithSymbol($amount, $currency);
    echo "$currency: $formatted\n";
}
```

### Custom Precision

```php
// Cryptocurrency with 8 decimals
$btc = Money::setDecimals(8)->format(0.00123456);
// Returns: "0.00123456"

// Whole numbers only
$quantity = Money::setDecimals(0)->format(1234.56);
// Returns: "1,235"
```

## Testing

Run the test suite:

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

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [williamug](https://github.com/Williamug)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
