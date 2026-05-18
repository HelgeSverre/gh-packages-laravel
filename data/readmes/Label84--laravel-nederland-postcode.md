# Nederland Postcode Laravel

![Nederland Postcode API](./docs/nederlandpostcodeapi.png)

Nederland Postcode Laravel makes it easy to integrate Dutch address validation and energy label lookups into your Laravel application using the [Nederland Postcode API](https://nederlandpostcode.nl).

**Key features:**

- Validate and retrieve Dutch addresses by postcode and house number
- Retrieve coordinates (latitude and longitude) for addresses
- Fetch energy labels (energielabel) for residential and commercial buildings
- Check your API usage quota

This package is a Laravel wrapper for [Nederland Postcode PHP](https://github.com/Label84/php-nederland-postcode).

Register for free at [nederlandpostcode.nl](https://nederlandpostcode.nl) to obtain your **test API key**.

## Table of Contents

- [Laravel Support](#laravel-support)
- [Installation](#installation)
- [Usage](#usage)
  - [Address Endpoint](#address-endpoint)
    - [Single Address](#single-address)
    - [Multiple Addresses](#multiple-addresses)
  - [Energy Label Endpoint](#energy-label-endpoint)
  - [Quota Endpoint](#quota-endpoint)
- [Error Handling](#error-handling)

## Laravel Support

| Version | Release |
|---------|---------|
| 13.x    | ^1.3    |
| 12.x    | ^1.3    |

## Installation

Install the package via Composer:

```bash
composer require label84/laravel-nederland-postcode
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Label84\NederlandPostcode\Laravel\NederlandPostcodeServiceProvider" --tag="config"
```

Add your API key to your `.env` file:

```env
NEDERLAND_POSTCODE_API_KEY="your_api_key_here"
```

## Usage

### Address Endpoint

The address endpoint allows you to fetch address information from the Nederland Postcode API.

You can search addresses using either the `find` method for a single address or the `list` method for multiple addresses. The `find` method will throw an exception if no address is found or if multiple addresses are found for the given postcode and house number (ie. when the house number has multiple additions like A, B, C, etc.).

The following optional attributes can be requested to be included in the response:

- `coordinates`: Includes latitude and longitude of the address.
- `district`: Includes the official and name of the district that the address belongs to.
- `function`: Includes the function of the address (e.g. residential, commercial, healthcare, etc.).
- `location_status`: Includes the location status of the address (e.g. active, in development, etc.).
- `property_status`: Includes the property status of the address (e.g. in use, under construction, etc.).
- `surface_area`: Includes the surface area of the property in square meters.
- `construction_year`: Includes the construction year of the property.

#### Single Address

To fetch a single address for a given postcode and house number, you can use the `find` method.

The `postcode` and `number` parameters are required. The `addition` parameter is optional.

```php
use Label84\NederlandPostcode\Laravel\Facades\NederlandPostcode;

$address = NederlandPostcode::find(
        postcode: '1118BN',
        number: 800,
        addition: null,
        attributes: [
            AddressAttributesEnum::COORDINATES,
        ]
    );
```

This will return an `Address` object like this:

```php
Address {
    postcode: "1118BN",
    number: 800,
    addition: null,
    street: "Schiphol Boulevard",
    city: "Schiphol",
    municipality: "Haarlemmermeer",
    province: "Noord-Holland",
    coordinates: Coordinates {
        latitude: 52.30528553688755,
        longitude: 4.750645160863609
    },
    district: District {
        official: "Schiphol",
        name: "Schiphol"
    },
    function: "kantoorfunctie",
    location_status: "verblijfsobject in gebruik",
    property_status: "pand in gebruik",
    surface_area: 10398.0,
    construction_year: 2019
}
```

When no address is found for the given postcode and number, an `AddressNotFoundException` is thrown. If multiple addresses are found, a `MultipleAddressesFoundException` is thrown.

#### Multiple Addresses

To fetch multiple addresses for a given postcode and house number, you can use the `list` method.

The `postcode` and `number` parameters are required. The `addition` parameter is optional.

```php
use Label84\NederlandPostcode\Laravel\Facades\NederlandPostcode;

$addresses = NederlandPostcode::list(
        postcode: '1015CN',
        number: 10,
        addition: null,
        attributes: [
            'coordinates',
        ]
    );
```

This will return an `AddressCollection` object like this:

```php
AddressCollection {
    items: [
        Address {
            postcode: "1015CN",
            number: 10,
            addition: 'A',
            street: "Keizersgracht",
            city: "Amsterdam",
            municipality: "Amsterdam",
            province: "Noord-Holland",
            coordinates: Coordinates {
                latitude: 52.379401496779124,
                longitude: 4.889216673725493
            },
            ...
        },
        Address {
            postcode: "1015CN",
            number: 10,
            addition: 'B',
            street: "Keizersgracht",
            city: "Amsterdam",
            municipality: "Amsterdam",
            province: "Noord-Holland",
            coordinates: Coordinates {
                latitude: 52.379401496779124,
                longitude: 4.889216673725493
            },
            ...
        }, {
            ...
        },
        ...
    ]
}
```

### Energy Label Endpoint

The energy label endpoint allows you to fetch energy label information for a given postcode and house number (with optional addition).

```php
use Label84\NederlandPostcode\Laravel\Facades\NederlandPostcode;

$energyLabels = NederlandPostcode::energyLabels()->get(
    postcode: '1118BN',
    number: 800,
    addition: null,
);
```

This will return an `EnergyLabelCollection` object like this:

```php
EnergyLabelCollection {
    items: [
        EnergyLabel {
            postcode: "1118BN",
            number: 800,
            addition: null,
            street: "Schiphol Boulevard",
            city: "Schiphol",
            inspectionDate: DateTime("2022-08-02"),
            validUntilDate: DateTime("2032-08-02"),
            constructionType: "utiliteitsbouw",
            buildingType: null,
            energyLabel: "A+++",
            maxEnergyDemand: 98.4,
            maxFossilEnergyDemand: 55.48,
            minRenewableShare: 55.3
        }, {
            ...
        }
    ]
}
```

### Quota Endpoint

The quota endpoint allows you to check your current API usage and limits. This endpoint does not increase your usage quota.

> [!NOTE]
> Values may lag behind the actual usage. They're cached for up to five minutes, so the `used` and `limit` numbers might not be fully up-to-date.

```php
use Label84\NederlandPostcode\Laravel\Facades\NederlandPostcode;

$quota = NederlandPostcode::usage();
```

This will return an `Quota` object like this:

```php
Quota {
    used: 1500,
    limit: 10000,
}
```

## Error Handling

The package throws a `NederlandPostcodeException` for any errors encountered during the API request. You can catch this exception to handle errors gracefully:

```php
use Label84\NederlandPostcode\Exceptions\NederlandPostcodeException;

try {
    $addresses = NederlandPostcode::find(
        postcode: 'INVALID',
        number: 123,
        addition: null,
    );
} catch (NederlandPostcodeException $exception) {
    // handle error
}
```

When calling the `find` method, if no address is found, an `AddressNotFoundException` is thrown. If multiple addresses are found, a `MultipleAddressesFoundException` is thrown.

When a network or HTTP error occurs during the API request, a `NederlandPostcodeRequestException` is thrown, which wraps the original `RequestException`.

## Contributing

```bash
./vendor/bin/phpstan analyse
```

```bash
./vendor/bin/pint
```

```bash
./vendor/bin/phpunit
```

## License

[MIT](https://opensource.org/licenses/MIT)
