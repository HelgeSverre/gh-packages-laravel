# Laravel Codice Fiscale Package

A comprehensive Laravel package for Italian Codice Fiscale (Tax Code) with Filament PHP v5 integration, validation, and multilingual geo-location support.

## Features

- ✅ **Unified Geo-Location Database**: Single table for Italian municipalities AND foreign states
- ✅ **Multilingual Support**: Italian, German, and English denominations
- ✅ **Action-Based Architecture**: Reusable actions for all operations
- ✅ **Validation Rules**: Both basic and strict validation against personal data
- ✅ **Console Commands**: Easy data synchronization from official ANPR sources
- ✅ **Alto Adige / Südtirol Support**: Special handling for bilingual region
- ✅ **Caching**: Built-in caching for Belfiore code lookups
- ✅ **Filament v5 Field Component**: Full-featured custom field with generator and validator
- ✅ **Filament Form Fields Trait**: Ready-to-use trait with all CF fields (firstname, lastname, DOB, gender, country, place, CF)

## Requirements

- PHP 8.2 | 8.3 | 8.4+
- Laravel 11.x | 12.x
- Filament 5.x (for previous version v1.0.0)
- Database: MySQL, PostgreSQL, MariaDB, or SQLite

## Installation

```bash
composer require kreatif/laravel-codice-fiscale
```

## Quick Start

### 1. Publish Configuration

```bash
php artisan vendor:publish --tag=codice-fiscale-config
```

### 2. Run Migrations

```bash
php artisan migrate
```

### 3. Sync Data

```bash
php artisan codice-fiscale:sync-geo-locations
```
__You might need to configure the `data_sources.csv.*.source` to this `__DIR__ . '/../vendor/kreatif/laravel-codice-fiscale/resources/data/csv/COL_VW_COMUNI_NAZIONI_ESTERE.csv'`.__

### 4. (Optional) Publish German Translation Data

```bash
php artisan vendor:publish --tag=codice-fiscale-data
```

## Usage

### Calculate Codice Fiscale

```php
use Kreatif\CodiceFiscale\Actions\CalculateCodiceFiscale;

$codiceFiscale = CalculateCodiceFiscale::calculate([
    'firstname' => 'Mario',
    'lastname' => 'Rossi',
    'dob' => '1990-01-01',
    'gender' => 'M',
    'pob' => 'Roma', // or codice_catastale like 'z222'. 
]);

// Result: RSSMRA90A01H501Z
```

### Validate Codice Fiscale

```php
use Kreatif\CodiceFiscale\Actions\ValidateCodiceFiscale;

// Basic validation (format and checksum)
$isValid = ValidateCodiceFiscale::isValid('RSSMRA90A01H501Z');

// Strict validation (compares against personal data)
$isValid = ValidateCodiceFiscale::isValidStrict('RSSMRA90A01H501Z', [
    'firstname' => 'Mario',
    'lastname' => 'Rossi',
    'dob' => '1990-01-01',
    'gender' => 'M',
    'pob' => 'Roma',
]);
```

### Find Belfiore Code

```php
use Kreatif\CodiceFiscale\Actions\FindBelfioreCode;

$code = FindBelfioreCode::find('Roma'); // Returns: H501
$code = FindBelfioreCode::find('Bozen'); // Returns: A952 (German name)
$code = FindBelfioreCode::find('Germany'); // Returns: Z112 (English name)
```

### Laravel Validation

#### Basic Validation

```php
use Kreatif\CodiceFiscale\Rules\ValidCodiceFiscale;

$validator = Validator::make($data, [
    'codice_fiscale' => ['required', 'string', new ValidCodiceFiscale],
]);

// Or use string-based rule:
$validator = Validator::make($data, [
    'codice_fiscale' => 'required|string|codice_fiscale',
]);
```

#### Strict Validation

```php
use Kreatif\CodiceFiscale\Rules\CodiceFiscaleMatchesData;

$validator = Validator::make($data, [
    'first_name' => 'required|string',
    'last_name' => 'required|string',
    'dob' => 'required|date',
    'gender' => 'required|in:M,F',
    'pob' => 'required|string',
    'codice_fiscale' => [
        'required',
        new CodiceFiscaleMatchesData([
            'firstname' => 'first_name',
            'lastname' => 'last_name',
            'dob' => 'dob',
            'gender' => 'gender',
            'pob' => 'pob',
        ])
    ],
]);

// Or with default field names:
$validator = Validator::make($data, [
    'codice_fiscale' => 'required|codice_fiscale_matches',
]);
```

### Query Geo-Locations

```php
use Kreatif\CodiceFiscale\Models\GeoLocation;

// Get all Italian municipalities
$comuni = GeoLocation::comuni()->valid()->get();

// Get municipalities
$altoAdige = GeoLocation::comuni()->get();

// Get all foreign states
$foreignStates = GeoLocation::foreignStates()->get();

```

## Console Commands

### Sync Municipalities

```bash
# Sync only Countries
php artisan codice-fiscale:sync-geo-locations --type=stato 

# Sync only muncipalities
php artisan codice-fiscale:sync-geo-locations --type=comune
```

## Documentation

Comprehensive documentation is available in the `.docs/` directory:

- **[README.md](.docs/README.md)** - Package overview and quick start
- **[DEV_NOTES.md](.docs/DEV_NOTES.md)** - Development notes and future enhancements

## Filament Integration

### Filament Form Fields Trait

The package provides a ready-to-use trait with pre-built Filament form fields for all Codice Fiscale data.

#### Out-of-the-Box (Simplest)

```php
use Kreatif\CodiceFiscale\Filament\Forms\Traits\HasUserBasicFilamentFields;

class UserForm
{
    use HasUserBasicFilamentFields;

    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            ...self::getAllCodiceFiscaleFields(),
            // Your other fields...
        ]);
    }
}
```

This single line gives you:
- ✅ Firstname & Lastname fields (grouped, responsive)
- ✅ Date of Birth with format (configurable creating format lang/{de,it,en,etc}/formats.php)
- ✅ Gender selector (M/F)
- ✅ Country of Birth (searchable, live updates)
- ✅ Place of Birth (dynamic: Select for Italy, TextInput for other countries)
- ✅ Codice Fiscale field with strict validation
- ✅ Multilingual labels (IT, EN, DE)

#### With Generator & Validator

```php
...self::getAllCodiceFiscaleFields(
    enableCFGenerator: true,
    enableCFValidator: true,
)
```

#### Individual Field Methods

For more control, use individual field methods:

```php
use Kreatif\CodiceFiscale\Filament\Forms\Traits\HasUserBasicFilamentFields;

class UserForm
{
    use HasUserBasicFilamentFields;

    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            self::getFirstnameField(),
            self::getLastnameField(),
            self::getDOBField(),
            self::getGenderField(),
            self::getCountryOfBirthField(),
            self::getPlaceOfBirthField(),
            self::getCodiceFiscaleField(
                enableGenerator: true,
                enableValidator: true
            ),
        ]);
    }
}
```

#### Composed Field Groups

```php
self::getNameFields(),          // Firstname + Lastname (grouped)
...self::getBirthFields(),      // DOB + Gender + Country + Place
self::getCodiceFiscaleField(),
```

#### Label Customization

All fields support label customization:

```php
// Use package labels (default)
self::getFirstnameField()

// Custom label
self::getFirstnameField(label: 'Your First Name')

// No label
self::getFirstnameField(label: false)

// Use your own translation key
self::getFirstnameField(label: __('my-app.firstname'))
```

Available label getter methods:
```php
self::getFirstnameLabel()       // Returns translated label
self::getLastnameLabel()
self::getDOBLabel()
self::getGenderLabel()
self::getCountryOfBirthLabel()
self::getPlaceOfBirthLabel()
self::getCodiceFiscaleLabel()
```


```
                self::getfirstNameField('firstname'),
                self::getLastNameField('lastname'),
                self::getDOBField('dob'),
                self::getGenderField('gender'),
                self::getCountryOfBirthField('cob'),
                self::getPlaceOfBirthField('pob', true, 'cob'),
                self::getCodiceFiscaleField()
//                    ->strict([ // in case the name of the fields are changed, and activate validation of CF, you  need to specify the name of the fields
//                        'firstname' => 'first_name',
//                        'lastname' => 'last_name',
//                        'dob' => 'dob',
//                        'gender' => 'gender',
//                        'cob' => 'cob',
//                        'pob' => 'pob',
//                    ])
                ,
```

#### Dynamic Place of Birth

The Place of Birth field automatically switches between:
- **Select dropdown** when country is Italy (searchable Italian municipalities)
- **Text input** when country is anything else (free text for foreign locations)

This happens automatically based on the Country of Birth field value.

### CodiceFiscale Field Component

#### Basic Usage

```php
use Kreatif\CodiceFiscale\Filament\Forms\Components\CodiceFiscale;

// Simple field
CodiceFiscale::make('codice_fiscale');

// With generator and validator
CodiceFiscale::make('codice_fiscale')
    ->generator()
    ->validator();
```

#### Full-Featured with Strict Validation

```php
CodiceFiscale::make('codice_fiscale')
    ->generator()      // Enable generator modal
    ->validator()      // Enable validator button
    ->strict([         // Enable strict validation
        'firstname' => 'first_name',
        'lastname' => 'last_name',
        'dob' => 'dob',
        'gender' => 'gender',
        'pob' => 'pob',
    ]);
```

#### Conditional Behavior

```php
CodiceFiscale::make('codice_fiscale')
    ->generator(fn($record) => !$record->exists)
    ->validator(fn($record) => $record->exists)
    ->verifyAgainst(fn($record, $get) => $record->type === 'person'
        ? ['firstName' => 'first_name', 'lastName' => 'last_name', ...]
        : null
    );
```

#### Custom Actions (Advanced)

Override the default actions with your own implementations:

```php
CodiceFiscale::make('codice_fiscale')
    ->generator()
    ->validator()
    ->usingFinder(MyCustomFinder::class)           // Custom Belfiore code finder
    ->usingCalculator(MyCustomCalculator::class)   // Custom CF calculator
    ->usingValidator(MyCustomValidator::class);    // Custom CF validator
```

## Credits

- **Provincia Autonoma di Bolzano**: German translation data (Pronotel)

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.


---

Made with ❤️ by [Kreatif](https://kreatif.it) for the Italian community and Alto Adige / Südtirol region.
