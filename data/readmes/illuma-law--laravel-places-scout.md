# Laravel Places Scout

[![Latest Version on Packagist](https://img.shields.io/packagist/v/illuma-law/laravel-places-scout.svg?style=flat-square)](https://packagist.org/packages/illuma-law/laravel-places-scout)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/illuma-law/laravel-places-scout/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/illuma-law/laravel-places-scout/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub PHPStan Action Status](https://img.shields.io/github/actions/workflow/status/illuma-law/laravel-places-scout/phpstan.yml?branch=main&label=phpstan&style=flat-square)](https://github.com/illuma-law/laravel-places-scout/actions?query=workflow%3Aphpstan+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/illuma-law/laravel-places-scout.svg?style=flat-square)](https://packagist.org/packages/illuma-law/laravel-places-scout)

A fluent Laravel package for interacting with the Google Places API using strictly typed DTOs.

Places Scout acts as a dedicated abstraction over the Google Maps Places API. Instead of dealing directly with raw HTTP requests and unstructured JSON arrays, this package provides an elegant, object-oriented API that maps Google's responses directly into fully typed PHP 8.3 Data Transfer Objects (DTOs) with IDE autocompletion out of the box.

## Features

- **Text Search**: Search for places using natural text queries with automatic pagination support.
- **Place Details**: Retrieve highly detailed information (phone, website, coordinates) about specific places using their Place ID.
- **Strongly Typed DTOs**: Immutable, `readonly` data transfer objects ensure data integrity.
- **Fluent Interface**: Clean, chainable API via Facade or Dependency Injection.
- **Multi-Tenant Friendly**: Supports overriding API keys on the fly.
- **Graceful Error Handling**: Suppresses exceptions on failed API requests (logging them instead) and returns `null`, preventing your application from crashing due to third-party API instability.

## Installation

You can install the package via composer:

```bash
composer require illuma-law/laravel-places-scout
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="places-scout-config"
```

## Configuration

Add your Google Places API key to your `.env` file:

```env
GOOGLE_PLACES_API_KEY=your_api_key_here
```

The published `config/places-scout.php` will use this key automatically:

```php
return [
    /**
     * Your Google Places API Key.
     * Obtain an API key from the Google Cloud Console:
     * https://console.cloud.google.com/google/maps-apis/credentials
     */
    'api_key' => env('GOOGLE_PLACES_API_KEY'),
];
```

## Usage & Integration

### Text Search

Search for places using a text query. It returns a `PlaceSearchResponse` DTO containing an array of `PlaceSearchResult` DTOs.

```php
use IllumaLaw\PlacesScout\Facades\PlacesScout;

// Basic text search
$response = PlacesScout::textSearch('Law firms in New York');

if ($response) {
    foreach ($response->results as $result) {
        echo $result->name;             // 'Smith & Associates'
        echo $result->placeId;          // 'ChIJ...'
        echo $result->formattedAddress; // '123 Main St, New York, NY'
        echo $result->latitude;         // 40.7128
        echo $result->longitude;        // -74.0060
        echo $result->rating;           // 4.8
    }

    // Handle pagination using the nextPageToken
    if ($response->nextPageToken) {
        $nextPage = PlacesScout::textSearch('Law firms in New York', $response->nextPageToken);
    }
}
```

### Place Details

Get detailed information about a specific place using its `place_id`. Returns a `PlaceDetails` DTO.

```php
use IllumaLaw\PlacesScout\Facades\PlacesScout;

$details = PlacesScout::getPlaceDetails('ChIJN1t_tDeuEmsRUsoyG83frY4');

if ($details) {
    echo $details->name;              // 'Google Australia'
    echo $details->phoneNumber;       // '(02) 9374 4000'
    echo $details->website;           // 'https://www.google.com.au/'
    echo $details->formattedAddress;  // '48 Pirrama Rd, Pyrmont NSW 2009, Australia'
    echo $details->rating;            // 4.4
    echo $details->userRatingsTotal;  // 123
    echo $details->latitude;          // -33.866651
    echo $details->longitude;         // 151.195827
}
```

### Dynamic API Keys (Multi-tenant support)

If your application allows users to provide their own Google Maps API credentials, you can override the default API key fluently per-request:

```php
use IllumaLaw\PlacesScout\Facades\PlacesScout;

$userApiKey = $user->settings->google_api_key;

// Override API key for this specific request
$response = PlacesScout::withApiKey($userApiKey)->textSearch('Restaurants in Paris');
```

### Dependency Injection

Instead of the Facade, you can inject the `PlacesScoutService` directly into your controllers or jobs:

```php
namespace App\Http\Controllers;

use IllumaLaw\PlacesScout\PlacesScoutService;

class LocationController extends Controller
{
    public function __construct(
        private PlacesScoutService $placesScout
    ) {}

    public function search(string $query)
    {
        $results = $this->placesScout->textSearch($query);

        return response()->json($results);
    }
}
```

## Testing

The package includes a comprehensive Pest test suite and requires 100% test coverage.

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
