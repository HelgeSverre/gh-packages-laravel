
# SequenceNumber Package Documentation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ameax/sequence-number.svg?style=flat-square)](https://packagist.org/packages/ameax/sequence-number)  
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ameax/sequence-number/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ameax/sequence-number/actions?query=workflow%3Arun-tests+branch%3Amain)  
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ameax/sequence-number/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ameax/sequence-number/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)  
[![Total Downloads](https://img.shields.io/packagist/dt/ameax/sequence-number.svg?style=flat-square)](https://packagist.org/packages/ameax/sequence-number)

The **SequenceNumber** package provides an easy-to-use service for generating customizable sequence numbers. This is useful for generating unique identifiers such as invoice numbers, order IDs, or other sequences that follow a defined format.

---

## Features
- Supports customizable prefixes, suffixes, and number lengths.
- Configurable yearly resets.
- Supports check digits for validation.
- Format sequences with custom separators and year formats.
- Includes robust database-backed sequence tracking.
- Configurable default database connection for models.

---

## Installation

Install the package via Composer:

```bash
composer require ameax/sequence-number
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="sequence-number-migrations"
php artisan migrate
```

Optionally, publish the configuration file:

```bash
php artisan vendor:publish --tag="sequence-number-config"
```

---

## Configuration

The configuration file allows you to customize the behavior of the package. Below is the content of the `config/sequence-number.php` file:

```php
return [
    'connection' => null, // Set the default connection of the Models
];
```

### Explanation:
- **`connection`**: Defines the database connection to use for the `sequences` and `sequence_counters` models. If set to `null`, the default Laravel connection will be used. Set this to a specific connection name if your sequences should use a dedicated database.

#### Example:
```php
return [
    'connection' => 'tenant', // Use the tenant database connection
];
```

---

## Models and Fields

### **`Sequence` Model**
The `sequences` table stores the configuration for each sequence.

| Field                | Type            | Description                                                                                     |
|----------------------|-----------------|-------------------------------------------------------------------------------------------------|
| `id`                | `bigInteger`    | Primary key of the sequence configuration.                                                     |
| `token`             | `string`        | Unique identifier for the sequence.                                                           |
| `prefix`            | `string`        | Optional prefix to prepend to the sequence number.                                             |
| `suffix`            | `string`        | Optional suffix to append to the sequence number.                                              |
| `number_min_length` | `unsignedSmallInteger` | Minimum length of the sequence number, padded with leading zeros if needed.                   |
| `year_format`       | `enum`          | Format of the year (`none`, `2-digits`, `4-digits`).                                           |
| `year_separator`    | `enum`          | Separator to place after the year (e.g., `-`, `/`, `.`).                                       |
| `use_check_digit`   | `boolean`       | Whether to include a check digit for validation.                                               |
| `check_digit_separator` | `enum`      | Separator for the check digit.                                                                 |
| `check_digit_position` | `enum`        | Position of the check digit (`prefix`, `suffix`).                                              |
| `reset_yearly`      | `boolean`       | Whether to reset the sequence yearly.                                                          |
| `start_value`       | `unsignedInteger` | Starting value for the sequence.                                                              |
| `payload`           | `json`          | Additional metadata for the sequence.                                                         |
| `created_at`        | `timestamp`     | Timestamp when the sequence was created.                                                      |
| `updated_at`        | `timestamp`     | Timestamp when the sequence was last updated.                                                 |

### **`SequenceCounter` Model**
The `sequence_counters` table tracks the current value of a sequence.

| Field           | Type            | Description                                                                                     |
|-----------------|-----------------|-------------------------------------------------------------------------------------------------|
| `id`            | `bigInteger`    | Primary key of the sequence counter.                                                           |
| `sequence_id`   | `foreignId`     | Foreign key referencing the `sequences` table.                                                 |
| `current_value` | `integer`       | The current value of the sequence.                                                             |
| `year`          | `integer`       | The year of the last reset for the sequence.                                                   |
| `created_at`    | `timestamp`     | Timestamp when the counter was created.                                                        |
| `updated_at`    | `timestamp`     | Timestamp when the counter was last updated.                                                   |

---

## Usage

### Generating a Sequence Number

1. **Initialize the SequenceService**
   Use the `SequenceService::make()` method to create a service instance.

2. **Load a Sequence by Token**
   Use the `byToken(string $token)` method to load a sequence by its unique token.

3. **Generate the Next Sequence Number**
   Call `next()` to generate the next sequence number based on the configuration.

#### Using Sequence Service:
```php
use Ameax\SequenceNumber\Services\SequenceService;

$sequenceService = SequenceService::make()->byToken('invoice');
$nextSequence = $sequenceService->next();

echo $nextSequence; // Example: INV2023.001
```

#### Using Sequence Model:
```php
$sequence = Sequence::where('token', 'invoice')->first();

echo  $sequence->next();
```

### Validating a Sequence Number
Use the `validateSequenceNumber(string $sequenceNumber)` method to validate a sequence number with a check digit.

#### Example:
```php
$isValid = SequenceService::make()->byToken('invoice')->validateSequenceNumber('INV2023.001');
echo $isValid ? 'Valid' : 'Invalid';
```

---

## Configuration Examples

### Sequence Configuration Example
Create a sequence configuration in the `sequences` table:
```php
use Ameax\SequenceNumber\Models\Sequence;

$sequence = Sequence::create([
    'token' => 'invoice',
    'prefix' => 'INV',
    'number_min_length' => 3,
    'year_format' => '4-digits',
    'year_separator' => '.',
    'use_check_digit' => true,
    'check_digit_position' => 'suffix',
    'reset_yearly' => true,
    'start_value' => 1,
]);
```

---

## Testing

### Example Test Scenarios
```php
use Ameax\SequenceNumber\Models\Sequence;
use Ameax\SequenceNumber\Services\SequenceService;

// Create a sequence configuration
$sequence = Sequence::create([
    'token' => 'invoice',
    'prefix' => 'INV',
    'number_min_length' => 3,
]);

// Generate the first sequence number
expect(SequenceService::make()->byToken('invoice')->next())->toBe('INV001');

// Add a year format and separator
$sequence->update([
    'year_format' => '4-digits',
    'year_separator' => '-',
]);
expect(SequenceService::make()->byToken('invoice')->next())->toBe('INV2023-002');
```

### Running Tests
Run all tests using Pest or PHPUnit:
```bash
composer test
```

---

## Changelog

Refer to the [CHANGELOG](CHANGELOG.md) for details on recent changes.

---

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](CONTRIBUTING.md) file for guidelines.

---

## License

The MIT License (MIT). Please see the [LICENSE](LICENSE.md) file for more details.
