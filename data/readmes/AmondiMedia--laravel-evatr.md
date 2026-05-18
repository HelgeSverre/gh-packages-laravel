# VAT Validator

Laravel package for validating German and EU VAT identification numbers using the official German Federal Central Tax Office (Bundeszentralamt für Steuern) online service

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x or 12.x
- Guzzle HTTP Client

## Installation

You can install the package via composer:

```bash
composer require AmondiMedia/laravel-evatr
```

The package will automatically register its service provider.

## Usage

### Validation Rule

You can use the VAT validation rule in your validation rules:

```php
use AmondiMedia\VatValidator\Rules\ValidVatNumber;

$rules = [
    'vat_number' => ['required', new ValidVatNumber()],
];
```

### Using the Validation Rule Extension

You can also use the validation rule extension:

```php
$rules = [
    'vat_number' => ['required', 'valid_vat_number'],
];
```

The validation rule extension also supports validating country code and VAT number separately:

```php
$rules = [
    'country_code' => ['required', 'string', 'size:2'],
    'vat_number' => ['required', 'valid_vat_number:country_code,vat_number'],
];
```

## Configuration

The package uses the German eVatR service by default. You can publish the configuration file:

```bash
php artisan vendor:publish --provider="AmondiMedia\VatValidator\Providers\VatValidatorServiceProvider"
```

This will create a `vat_validator.php` file in your config directory.

### Environment Configuration

Add the following variable to your `.env` file:

```env
EVATR_REQUESTER_VAT_ID=DE123456789
```

- `EVATR_REQUESTER_VAT_ID`: Your German VAT identification number (Umsatzsteuer-Identifikationsnummer) that will be used as the requester in the eVatR API calls.

The package also includes these default configurations:
- API URL: https://evatr.bff-online.de/
- Request timeout: 10 seconds

## License

GNU General Public License. Please see [License File](LICENSE.md) for more information.
