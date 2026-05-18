# Number Converter for Laravel

A Laravel package to convert **numbers written in words** into **numeric values**, and vice versa.

## ✨ Features

- Convert `"two hundred million"` → `200000000`
- Convert `"Three Hundred Thousand"` → `300000`
- Convert `200000000` → `"two hundred million"`
- Convert `300000` → `"Three Hundred Thousand"`
- Format `1234567.89` → `₹12,34,567.89`
- Format `1234567.89` with currency code `"USD"` → `$1,234,567.89`
- Convert `12345678.89` with currency code `"INR"` → `"one crore, twenty-three lakh, forty-five thousand, six hundred and seventy-eight rupees and eighty-nine paise"`

---

## 📦 Installation

Install via [Packagist](https://packagist.org/packages/jayen/number-converter) using Composer:

```bash
composer require jayen/number-converter
```

---

## 🚀 Usage

### Using the Facade

```php
use Jayen\NumberConverter\Facades\NumberConverter;

$number = NumberConverter::wordsToNumber("One Thousand Two Hundred Thirty Four");
// Output: 1234

$words = NumberConverter::numberToWords("1234");
// Output: one thousand, two hundred and thirty-four

$currency = NumberConverter::formatCurrency(1234567.89, 'USD');
// Output: $1,234,567.89

$withoutSymbol = NumberConverter::formatCurrency(1234567.89, 'INR', false);
// Output: INR 12,34,567.89

$currencyWords = NumberConverter::numberToCurrencyWords(12345678.89, 'INR');
// Output: one crore, twenty-three lakh, forty-five thousand, six hundred and seventy-eight rupees and eighty-nine paise

$usdWords = NumberConverter::numberToCurrencyWords(1234567.89, 'USD');
// Output: one million, two hundred and thirty-four thousand, five hundred and sixty-seven dollars and eighty-nine cents
```

### Using Dependency Injection

```php
use Jayen\NumberConverter\NumberConverter;

public function convert(NumberConverter $converter)
{
    $number = $converter->wordsToNumber("Five Million Six Hundred");
    // Output: 5600000

    $words = $converter->numberToWords("5600000");
    // Output: Five Million Six Hundred

    $number = $converter->wordsToNumber("Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven");
    // Output: 1234567

    $amount = $converter->formatCurrency(1234567.89, 'INR');
    // Output: ₹12,34,567.89

    $amountWords = $converter->numberToCurrencyWords(1234567.89, 'USD');
    // Output: one million, two hundred and thirty-four thousand, five hundred and sixty-seven dollars and eighty-nine cents
}
```

### Currency Codes

```php
NumberConverter::formatCurrency(1234567.89, 'INR'); // ₹12,34,567.89
NumberConverter::formatCurrency(1234567.89, 'USD'); // $1,234,567.89
NumberConverter::formatCurrency(1234567.89, 'EUR'); // €1,234,567.89
NumberConverter::formatCurrency(1234567.89, 'GBP'); // £1,234,567.89
NumberConverter::formatCurrency(1234567.89, 'JPY'); // ¥1,234,568
```

### Currency Words

```php
NumberConverter::numberToCurrencyWords(12345678.89, 'INR');
// one crore, twenty-three lakh, forty-five thousand, six hundred and seventy-eight rupees and eighty-nine paise

NumberConverter::numberToCurrencyWords(1234567.89, 'USD');
// one million, two hundred and thirty-four thousand, five hundred and sixty-seven dollars and eighty-nine cents

NumberConverter::numberToCurrencyWords(1234567.89, 'JPY');
// one million, two hundred and thirty-four thousand, five hundred and sixty-eight yen
```

Supported currency codes: `INR`, `USD`, `EUR`, `GBP`, `JPY`, `AUD`, `CAD`, `CNY`, `AED`.

---

## 📜 License

This package is open-sourced software licensed under the [MIT license](LICENSE).
