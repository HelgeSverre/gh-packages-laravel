# NHTSA API for Laravel

Laravel package that integrates with the [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/) providing DTO-based helpers for VIN and WMI decoding.

## Installation

```bash
composer require sashalenz/nhtsa-api
```

If you are developing locally as part of this monorepo, ensure the path repository is registered in the root `composer.json` and run:

```bash
./vendor/bin/sail composer update sashalenz/nhtsa-api
```

Optionally publish the configuration:

```bash
php artisan vendor:publish --tag="nhtsa-api-config"
```

## Usage

```php
use Sashalenz\NhtsaApi\Data\Requests\DecodeVinRequestData;
use Sashalenz\NhtsaApi\Facades\NhtsaApi;

$response = NhtsaApi::decodeVin(DecodeVinRequestData::from([
    'vin' => '5UXWX7C5*BA',
    'modelYear' => 2011,
]));

$make = $response->variables()->first()?->value;
```

Available façade methods:

- `decodeVin` – повертає класичні змінні VIN (Make, Model, Body Class тощо) у вигляді колекції `VinDecodedVariableData` [в документації позначено як Decode VIN](https://vpic.nhtsa.dot.gov/api/).
- `decodeVinExtended` – доповнена версія з додатковими полями (зокрема дані NCSA), також повертає `VinDecodedVariableData`.
- `decodeVinValues` – повертає «плоский» результат у форматі ключ-значення (`VinDecodeFlatResponseData`), зручний для швидкого доступу до атрибутів.
- `decodeVinValuesExtended` – «плоский» розширений варіант з додатковими змінними, аналогічний `decodeVinValues`.
- `decodeWmi` – розшифровка WMI (World Manufacturer Identifier) та пов’язані метадані у вигляді `DecodeWmiResponseData`.

Each method accepts the relevant Data DTO request and returns a typed response DTO wrapping the API payload.

### Service layer with history logging

```php
use Sashalenz\NhtsaApi\Data\Requests\DecodeVinRequestData;
use Sashalenz\NhtsaApi\Services\NhtsaApiService;

$service = app(NhtsaApiService::class);

$make = $service->determineMake(DecodeVinRequestData::from([
    'vin' => 'WP0AA2A7GL',
    'modelYear' => 2016,
]));

$requests = $service->getVinRequestCount('WP0AA2A7GL');
```

Кожен запит логуються у таблицю `nhtsa_api_requests` із полями VIN, Vehicle Descriptor, Make, Model, Model Year, JSON значеннями та morph-зв’язком із ініціатором.

## Testing

```bash
./vendor/bin/sail test packages/nhtsa-laravel-api
```

When Docker is not available, run the tests within your Sail environment before committing changes.

