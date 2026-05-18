# Laravel Dadata API

Laravel package for working with [Dadata API](https://dadata.ru/) - address suggestions, data cleaning, company and bank information lookup.

## Features

- Address suggestions with FIAS support
- Address cleaning and standardization
- Phone number cleaning
- Company search by INN
- Bank search by BIC/SWIFT
- Delivery point IDs (CDEK, Boxberry, DPD)
- Full DTO support for type-safe data handling

## Requirements

- PHP 8.3+
- Laravel 12.0+
- [imjonos/laravel-base-dto](https://github.com/imjonos/laravel-base-dto) package
- Dadata account ([register](https://dadata.ru/))

## Installation

```bash
composer require imjonos/laravel-dadata-api
```

### Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=dadataapi.config
```

Add your Dadata credentials to `.env`:

```env
DADATA_TOKEN=your_api_token
DADATA_SECRET=your_secret_key
```

You can find your credentials in your [Dadata profile](https://dadata.ru/profile).

## Usage

### Address Suggestions

```php
use Nos\DadataApi\Facades\DadataApi;

// Get city suggestions
$collection = DadataApi::suggestCity('Москва');
foreach ($collection as $suggestion) {
    echo $suggestion->value;
    echo $suggestion->data->fiasId;
}

// Filter by country
$collection = DadataApi::suggestCity('London', ['GB']);

// Street suggestions (requires city FIAS ID)
$collection = DadataApi::suggestStreet('Ленина', $cityFiasId);

// House suggestions (requires street FIAS ID)
$collection = DadataApi::suggestHouse('10', $streetFiasId);
```

### Company Search

```php
use Nos\DadataApi\Facades\DadataApi;

// Search company by INN
$collection = DadataApi::suggestCompany('7707083893');
$company = $collection->first();

echo $company->value; // Company name
echo $company->data->inn;
echo $company->data->ogrn;
```

### Bank Search

```php
use Nos\DadataApi\Facades\DadataApi;

$collection = DadataApi::suggestBank('Сбербанк');
$bank = $collection->first();

echo $bank->value;
echo $bank->data->bic;
echo $bank->data->swift;
```

### Address Cleaning

```php
use Nos\DadataApi\Facades\DadataApi;

$address = DadataApi::cleanAddress('москва сухонская 11/-89');

echo $address->result; // г Москва, ул Сухонская, д 11, кв 89
echo $address->postalCode; // 127642
echo $address->geoLat; // 55.8783089
echo $address->geoLon; // 37.6537862
```

### Phone Cleaning

```php
use Nos\DadataApi\Facades\DadataApi;

$phone = DadataApi::cleanPhone('8(495)123-45-67');

echo $phone->phone; // +7 495 123-45-67
echo $phone->countryCode; // +7
echo $phone->timezone; // UTC+3
```

### Delivery Points

```php
use Nos\DadataApi\Facades\DadataApi;

// Get CDEK, Boxberry, DPD IDs by KLADR ID
$collection = DadataApi::suggestDeliveryId('3100400100000');
$delivery = $collection->first();

echo $delivery->data->cdekId;
echo $delivery->data->boxberryId;
echo $delivery->data->dpdId;
```

## Available Methods

All suggestion methods return `SuggestionCollection`:

| Method | Parameters | Description |
|--------|------------|-------------|
| `suggestCity` | `$query`, `$countryCodeISO`, `$count` | City suggestions |
| `suggestStreet` | `$query`, `$fiasId`, `$count` | Street suggestions |
| `suggestHouse` | `$query`, `$streetFiasId`, `$count` | House suggestions |
| `suggestCountry` | `$query`, `$count` | Country suggestions |
| `suggestAddress` | `$query`, `$fiasId?` | General address search |
| `suggestBank` | `$query` | Bank search |
| `suggestCompany` | `$inn` | Company by INN |
| `suggestDeliveryId` | `$kladrId` | Delivery point IDs |
| `suggestAddressById` | `$fiasId` | Address by FIAS ID |

Clean methods return DTO objects:

| Method | Parameters | Returns |
|--------|------------|---------|
| `cleanAddress` | `$address` | `AddressDTO` |
| `cleanPhone` | `$phone` | `PhoneDTO` |

## DTO Classes

### AddressDTO

Represents cleaned address with all details:

```php
$address->result; // Formatted address
$address->postalCode;
$address->region;
$address->city;
$address->street;
$address->house;
$address->flat;
$address->geoLat;
$address->geoLon;
$address->fiasId;
$address->qc; // Quality code
```

### PhoneDTO

Represents cleaned phone number:

```php
$phone->phone; // Formatted phone
$phone->countryCode;
$phone->cityCode;
$phone->provider;
$phone->timezone;
$phone->qc; // Quality code
```

### SuggestionDTO

Represents suggestion from search methods:

```php
$suggestion->value; // Display value
$suggestion->unrestrictedValue; // Full value
$suggestion->data; // SuggestionDataDTO
```

### SuggestionCollection

Collection of suggestions with utility methods:

```php
$collection->count();
$collection->first();
$collection->map(fn($item) => ...);
$collection->filter(fn($item) => ...);
$collection->each(fn($item) => ...);
```

## License

MIT License. See [license.md](license.md) for more information.