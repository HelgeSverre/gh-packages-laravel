![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# Airports Database & Flight Duration Calculator for Laravel

## 🚀 Access comprehensive airport data and calculate flight durations with this Laravel package.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-airports-database-flight-duration-calculator.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-airports-database-flight-duration-calculator)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-airports-database-flight-duration-calculator.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-airports-database-flight-duration-calculator)

Check the details at SharpAPI's [Airports Database & Flight Duration Calculator](https://sharpapi.com/en/catalog/utility/airports-database-flight-duration-calculator) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Airports Database & Flight Duration Calculator package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-airports-database-flight-duration-calculator
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-airports-database-flight-duration-calculator
```

---
## Key Features

- **Airport Search**: Search for airports by name, IATA code, ICAO code, or city.
- **Airport Details**: Get detailed information about airports by IATA or ICAO code.
- **Flight Duration Calculation**: Calculate flight duration between two airports.
- **Country-based Airport Listing**: Get a list of airports in a specific country.

---

## Usage

You can inject the `AirportsDatabaseFlightDurationCalculatorService` class to access the functionality.

### Basic Workflow

1. **Search for Airports**: Use `searchAirports` to find airports by name, code, or city.
2. **Get Airport Details**: Use `getAirportByIataCode` or `getAirportByIcaoCode` to get detailed information about a specific airport.
3. **Calculate Flight Duration**: Use `calculateFlightDuration` to calculate the flight duration between two airports.
4. **List Airports by Country**: Use `getAirportsByCountry` to get a list of airports in a specific country.

---

### Controller Example

Here is an example of how to use `AirportsDatabaseFlightDurationCalculatorService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\AirportsDatabaseFlightDurationCalculator\AirportsDatabaseFlightDurationCalculatorService;

class AirportsController extends Controller
{
    protected AirportsDatabaseFlightDurationCalculatorService $airportsService;

    public function __construct(AirportsDatabaseFlightDurationCalculatorService $airportsService)
    {
        $this->airportsService = $airportsService;
    }

    /**
     * @throws GuzzleException
     */
    public function searchAirports(string $query)
    {
        $results = $this->airportsService->searchAirports($query);
        
        return response()->json($results);
    }

    /**
     * @throws GuzzleException
     */
    public function getAirportDetails(string $iataCode)
    {
        $airport = $this->airportsService->getAirportByIataCode($iataCode);
        
        return response()->json($airport);
    }

    /**
     * @throws GuzzleException
     */
    public function calculateFlightDuration(string $fromIataCode, string $toIataCode)
    {
        $duration = $this->airportsService->calculateFlightDuration($fromIataCode, $toIataCode);
        
        return response()->json($duration);
    }

    /**
     * @throws GuzzleException
     */
    public function getAirportsByCountry(string $countryCode)
    {
        $airports = $this->airportsService->getAirportsByCountry($countryCode);
        
        return response()->json($airports);
    }
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $airports = $this->airportsService->searchAirports('London');
} catch (ClientException $e) {
    echo $e->getMessage();
}
```

---

## Optional Configuration

You can customize the configuration by setting the following environment variables in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
SHARP_API_BASE_URL=https://sharpapi.com/api/v1
```

---

## Airport Data Format Example

```json
{
  "data": [
    {
      "id": "1ef266de-5a6c-67d6-86a1-06bb2780ed98",
      "icao": "00AA",
      "iata": "",
      "lid": "00AA",
      "name": "Aero B Ranch Airport",
      "city": "Leoti",
      "subdivision": "Kansas",
      "country": "US",
      "timezone": "America/Chicago",
      "elevation": 3435,
      "latitude": 38.7,
      "longitude": -101.47
    }
  ],
  "links": {
    "first": "https://sharpapi.com/api/v1/airports?page=1",
    "last": "https://sharpapi.com/api/v1/airports?page=1128",
    "prev": null,
    "next": "https://sharpapi.com/api/v1/airports?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1128,
    "per_page": 25,
    "to": 25,
    "total": 28186
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-airports-database-flight-duration-calculator/issues)
- Join our [Telegram community](https://t.me/sharpapi_community)

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for a detailed list of changes.

---

## Credits

- [A2Z WEB LTD](https://github.com/a2zwebltd)
- [Dawid Makowski](https://github.com/makowskid)
- Enhance your [Laravel AI](https://sharpapi.com/) capabilities!

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Follow Us

Stay updated with news, tutorials, and case studies:

- [SharpAPI on X (Twitter)](https://x.com/SharpAPI)
- [SharpAPI on YouTube](https://www.youtube.com/@SharpAPI)
- [SharpAPI on Vimeo](https://vimeo.com/SharpAPI)
- [SharpAPI on LinkedIn](https://www.linkedin.com/products/a2z-web-ltd-sharpapicom-automate-with-aipowered-api/)
- [SharpAPI on Facebook](https://www.facebook.com/profile.php?id=61554115896974)