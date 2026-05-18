# Laravel Route Matrix

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gowelle/laravel-route-matrix.svg?style=flat-square)](https://packagist.org/packages/gowelle/laravel-route-matrix)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/gowelle/laravel-route-matrix/tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/gowelle/laravel-route-matrix/actions?query=workflow%3Atests+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/gowelle/laravel-route-matrix.svg?style=flat-square)](https://packagist.org/packages/gowelle/laravel-route-matrix)

A Laravel wrapper for the [Google Routes API](https://developers.google.com/maps/documentation/routes) with support for route calculation, distance matrices, and waypoint optimization.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Basic Route Calculation](#basic-route-calculation)
  - [Travel Modes](#travel-modes)
  - [Traffic-Aware Routing](#traffic-aware-routing)
  - [Route Modifiers](#route-modifiers)
  - [Alternative Routes](#alternative-routes)
  - [Waypoint Optimization](#waypoint-optimization)
- [Route Matrix](#route-matrix-distance-matrix)
  - [One to Many](#one-origin-to-multiple-destinations)
  - [Many to One](#multiple-origins-to-one-destination)
  - [Many to Many](#many-to-many-full-matrix)
  - [Courier Example](#real-world-example-courier-pickup--delivery)
- [Response Objects](#response-objects)
- [Eloquent Integration](#eloquent-integration-routable-trait)
- [Configuration](#configuration)
- [Exception Handling](#exception-handling)
- [Testing](#testing)
- [License](#license)

## Features

- 🚗 **Multiple Travel Modes** - Driving, walking, bicycling, two-wheeler, transit
- 🚦 **Traffic-Aware Routing** - Real-time and historical traffic data
- 📍 **Flexible Waypoints** - Coordinates, Place IDs, or addresses
- 📊 **Distance Matrix** - Calculate N×M origin-destination pairs
- 🎯 **Find Closest** - Get closest/fastest destination helpers
- ⚡ **Fluent API** - Elegant, chainable method calls
- 🧪 **Fully Tested** - 125+ tests with Pest PHP

## Requirements

- PHP 8.3+
- Laravel 11.x, 12.x, or 13.x
- Google Cloud API key with Routes API enabled

## Installation

Install the package via Composer:

```bash
composer require gowelle/laravel-route-matrix
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=google-routes-config
```

Add your Google API key to your `.env` file:

```env
GOOGLE_ROUTES_API_KEY=your-api-key-here
```

## Quick Start

```php
use Gowelle\LaravelRouteMatrix\Facades\GoogleRoutes;

// Posta -> Mlimani City Mall
$response = GoogleRoutes::from(['lat' => -6.8163, 'lng' => 39.2807])
    ->to(['lat' => -6.7724, 'lng' => 39.2083])
    ->get();

$route = $response->first();

echo "Distance: {$route->getDistanceInKilometers()} km";
echo "Duration: {$route->getFormattedDuration()}";
```

## Usage

### Basic Route Calculation

```php
use Gowelle\LaravelRouteMatrix\Facades\GoogleRoutes;

$response = GoogleRoutes::from(['lat' => -6.8163, 'lng' => 39.2807])
    ->to(['lat' => -6.7724, 'lng' => 39.2083])
    ->get();

// Access the first (recommended) route
$route = $response->first();
echo $route->distanceMeters;      // 8200
echo $route->duration;            // "900s"
echo $route->getDurationInSeconds(); // 900
```

### Using Addresses

```php
$response = GoogleRoutes::from('Julius Nyerere International Airport, Dar es Salaam')
    ->to('Mlimani City Mall, Dar es Salaam')
    ->get();
```

### Using Place IDs

```php
use Gowelle\LaravelRouteMatrix\ValueObjects\Waypoint;

// Example with Place IDs
$response = GoogleRoutes::from(Waypoint::fromPlaceId('ChIJ...' /* Posta */))
    ->to(Waypoint::fromAddress('Mlimani City Mall, Dar es Salaam'))
    ->get();
```

### With Intermediate Waypoints

```php
// Posta -> Kariakoo -> Magomeni -> Mlimani City
$response = GoogleRoutes::from(['lat' => -6.8163, 'lng' => 39.2807])
    ->via(['lat' => -6.8235, 'lng' => 39.2695]) // Kariakoo
    ->via(['lat' => -6.8059, 'lng' => 39.2536]) // Magomeni
    ->to(['lat' => -6.7724, 'lng' => 39.2083])
    ->get();

// Access individual legs
foreach ($route->legs as $leg) {
    echo "Leg distance: {$leg->distanceMeters}m\n";
}
```

### Travel Modes

```php
use Gowelle\LaravelRouteMatrix\Enums\TravelMode;

// Using enum
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->travelMode(TravelMode::DRIVE)
    ->get();

// Using shortcuts
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->driving()  // or walking(), bicycling(), transit()
    ->get();
```

### Traffic-Aware Routing

```php
use Gowelle\LaravelRouteMatrix\Enums\RoutingPreference;

$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->routingPreference(RoutingPreference::TRAFFIC_AWARE_OPTIMAL)
    ->get();

// Or use the shortcut
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->withOptimalTraffic()
    ->get();
```

### Route Modifiers

```php
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->avoidTolls()
    ->avoidHighways()
    ->avoidFerries()
    ->get();
```

### Alternative Routes

```php
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->withAlternatives()
    ->get();

// Get the main route
$mainRoute = $response->first();

// Get alternative routes
$alternatives = $response->getAlternatives();

foreach ($alternatives as $route) {
    echo "Alternative: {$route->getFormattedDuration()}\n";
}
```

### Fuel-Efficient Routes

```php
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->withFuelEfficientRoute()
    ->get();

$fuelEfficientRoute = $response->getFuelEfficientRoute();
```

### Waypoint Optimization

```php
$response = GoogleRoutes::from($origin)
    ->via($waypoint1)
    ->via($waypoint2)
    ->via($waypoint3)
    ->to($destination)
    ->optimizeWaypointOrder()
    ->get();

// Get the optimized order
$optimizedOrder = $response->first()->optimizedIntermediateWaypointIndex;
```

### Departure Time

```php
use Carbon\Carbon;

$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->departureTime(Carbon::now()->addHour())
    ->get();

// Or depart now
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->departNow()
    ->get();
```

### Extra Computations

```php
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->withTolls()
    ->withFuelConsumption()
    ->withTrafficOnPolyline()
    ->get();
```

### Custom Field Mask

Specify which fields to include in the response:

```php
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->fields([
        'routes.duration',
        'routes.distanceMeters',
        'routes.polyline.encodedPolyline',
        'routes.legs.steps',
        'routes.viewport',
    ])
    ->get();
```

### High Quality Polylines

```php
use Gowelle\LaravelRouteMatrix\Enums\PolylineEncoding;

$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->highQualityPolyline()
    ->get();

// Or use GeoJSON format
$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->geoJsonPolyline()
    ->get();
```

### Localization

```php
use Gowelle\LaravelRouteMatrix\Enums\Units;

$response = GoogleRoutes::from($origin)
    ->to($destination)
    ->language('es-ES')
    ->region('ES')
    ->units(Units::METRIC)  // or imperial()
    ->get();
```

### Complete Example

```php
use Gowelle\LaravelRouteMatrix\Facades\GoogleRoutes;
use Gowelle\LaravelRouteMatrix\Enums\TravelMode;
use Gowelle\LaravelRouteMatrix\Enums\RoutingPreference;
use Carbon\Carbon;

// Posta to Mlimani City with waypoints and options
$response = GoogleRoutes::from(['lat' => -6.8163, 'lng' => 39.2807])
    ->to(['lat' => -6.7724, 'lng' => 39.2083])
    ->via(['lat' => -6.8235, 'lng' => 39.2695]) // Kariakoo
    ->travelMode(TravelMode::DRIVE)
    ->routingPreference(RoutingPreference::TRAFFIC_AWARE_OPTIMAL)
    ->avoidTolls()
    ->departureTime(Carbon::now()->addHour())
    ->withAlternatives()
    ->withFuelEfficientRoute()
    ->language('en-US')
    ->metric()
    ->fields([
        'routes.duration',
        'routes.distanceMeters',
        'routes.polyline.encodedPolyline',
        'routes.legs',
        'routes.routeLabels',
    ])
    ->get();

// Process the response
$route = $response->first();

echo "Distance: " . $route->getDistanceInKilometers() . " km\n";
echo "Duration: " . $route->getFormattedDuration() . "\n";
echo "Polyline: " . $route->polyline?->encodedPolyline . "\n";

// Check for warnings
if (!empty($route->warnings)) {
    foreach ($route->warnings as $warning) {
        echo "Warning: {$warning}\n";
    }
}
```

## Eloquent Integration (Routable Trait)

You can make your Eloquent models "routable" by implementing the `Routable` contract and using the `HasRoute` trait. This allows you to pass models directly to the API headers.

1. Implement the interface and trait:

```php
use Illuminate\Database\Eloquent\Model;
use Gowelle\LaravelRouteMatrix\Contracts\Routable;
use Gowelle\LaravelRouteMatrix\Traits\HasRoute;

class Store extends Model implements Routable
{
    use HasRoute;
    
    // Optional: Customize how the waypoint is resolved
    // (Defaults to looking for lat/lng, latitude/longitude, or address attributes)
}
```

2. Use models in route requests:

```php
$store = Store::find(1);
$customer = User::find(5); // Assuming User also implements Routable

$response = GoogleRoutes::from($store)
    ->to($customer)
    ->get();
```

3. Or initiate directly from the model:

```php
$response = $store->routeTo($customer)
    ->driving()
    ->get();
```

## Response Caching

To reduce API costs and improve performance, you can enable built-in caching.

1. Configure caching in `config/google-routes.php`:

```php
'cache' => [
    'enabled' => true,
    'store' => 'redis', // or 'file', 'database'
    'ttl' => 3600,      // Cache duration in seconds
],
```

When enabled, identical requests (same origin, destination, and options) will be served from the cache for the specified TTL duration.

## Route Matrix (Distance Matrix)

The Route Matrix API allows you to calculate distances and travel times between multiple origins and destinations efficiently.

### One Origin to Multiple Destinations

```php
use Gowelle\LaravelRouteMatrix\Facades\GoogleRoutes;

$response = GoogleRoutes::matrix()
    ->addOrigin(['lat' => -6.8163, 'lng' => 39.2807]) // Posta (Your location)
    ->addDestination(['lat' => -6.8235, 'lng' => 39.2695]) // Kariakoo
    ->addDestination(['lat' => -6.7724, 'lng' => 39.2083]) // Mlimani City
    ->addDestination(['lat' => -6.7567, 'lng' => 39.2772]) // Masaki
    ->driving()
    ->get();

// Find the closest destination
$closest = $response->getClosestDestination(0);
echo "Closest: {$closest->getDistanceInKilometers()} km";

// Find the fastest destination
$fastest = $response->getFastestDestination(0);
echo "Fastest: {$fastest->getFormattedDuration()}";
```

### Multiple Origins to One Destination

```php
// Find which store/warehouse is closest to a customer
$response = GoogleRoutes::matrix()
    ->addOrigin(['lat' => -6.8163, 'lng' => 39.2807]) // Store A (Posta)
    ->addOrigin(['lat' => -6.8235, 'lng' => 39.2695]) // Store B (Kariakoo)
    ->addOrigin(['lat' => -6.7724, 'lng' => 39.2083]) // Store C (Mlimani City)
    ->addDestination(['lat' => -6.7567, 'lng' => 39.2772]) // Customer (Masaki)
    ->driving()
    ->get();

$closestStore = $response->getClosestOrigin(0);
echo "Ship from store at origin index: {$closestStore->originIndex}";
```

### Many to Many (Full Matrix)

```php
$response = GoogleRoutes::matrix()
    ->origins([
        ['lat' => -6.8163, 'lng' => 39.2807], // Posta
        ['lat' => -6.8235, 'lng' => 39.2695], // Kariakoo
    ])
    ->destinations([
        ['lat' => -6.7724, 'lng' => 39.2083], // Mlimani City
        ['lat' => -6.7567, 'lng' => 39.2772], // Masaki
    ])
    ->driving()
    ->withTraffic()
    ->get();

// Access specific element (origin 0 → destination 1)
$element = $response->get(0, 1);
echo "Distance: {$element->getDistanceInKilometers()} km";
echo "Duration: {$element->getFormattedDuration()}";

// Convert to 2D matrix format
$matrix = $response->toMatrix();
// $matrix[originIndex][destinationIndex] = RouteMatrixElement
```

### Sorting Results

```php
// Get all destinations sorted by distance (closest first)
$sortedByDistance = $response->sortedByDistance();

// Get all destinations sorted by duration (fastest first)
$sortedByDuration = $response->sortedByDuration();

// Get only elements where a route was found
$validRoutes = $response->withRoutes();
```

### RouteMatrixElement Properties

Each element in the matrix contains:
- `originIndex` - Index of the origin (0-based)
- `destinationIndex` - Index of the destination (0-based)
- `distanceMeters` - Distance in meters
- `duration` - Duration string (e.g., "1234s")
- `condition` - Route condition (ROUTE_EXISTS, ROUTE_NOT_FOUND)

Helper methods:
- `routeExists()` - Check if a route was found
- `getDurationInSeconds()` - Get duration as integer
- `getDistanceInKilometers()` - Get distance in km
- `getDistanceInMiles()` - Get distance in miles
- `getFormattedDuration()` - Get human-readable duration

### Real-World Example: Courier Pickup & Delivery

A courier needs to pick up packages from multiple stores and deliver to customers (some packages share the same destination):

```php
use Gowelle\LaravelRouteMatrix\Facades\GoogleRoutes;

// Courier's current location (Dar es Salaam - Posta)
$courierLocation = ['lat' => -6.8160, 'lng' => 39.2803];

// Stores to pickup from
$stores = [
    ['id' => 'store_1', 'name' => 'Kariakoo Market', 'lat' => -6.8235, 'lng' => 39.2695],
    ['id' => 'store_2', 'name' => 'Mlimani City Mall', 'lat' => -6.7724, 'lng' => 39.2083],
    ['id' => 'store_3', 'name' => 'Slipway Shopping', 'lat' => -6.7488, 'lng' => 39.2656],
];

// Packages with destinations (some share same customer)
$packages = [
    ['id' => 'pkg_1', 'store_id' => 'store_1', 'customer' => 'Masaki Customer', 'lat' => -6.7567, 'lng' => 39.2772],
    ['id' => 'pkg_2', 'store_id' => 'store_2', 'customer' => 'Masaki Customer', 'lat' => -6.7567, 'lng' => 39.2772],
    ['id' => 'pkg_3', 'store_id' => 'store_2', 'customer' => 'Mikocheni Customer', 'lat' => -6.7651, 'lng' => 39.2451],
    ['id' => 'pkg_4', 'store_id' => 'store_3', 'customer' => 'Kinondoni Customer', 'lat' => -6.7735, 'lng' => 39.2401],
];

// Get unique destinations (consolidate packages to same location)
$uniqueDestinations = collect($packages)
    ->unique(fn($pkg) => $pkg['lat'] . ',' . $pkg['lng'])
    ->values()
    ->all();

// STEP 1: Find optimal pickup order
$pickupRoute = GoogleRoutes::from($courierLocation);
foreach ($stores as $store) {
    $pickupRoute->via(['lat' => $store['lat'], 'lng' => $store['lng']]);
}

$lastStore = end($stores);
$response = $pickupRoute
    ->to(['lat' => $lastStore['lat'], 'lng' => $lastStore['lng']])
    ->optimizeWaypointOrder()
    ->driving()
    ->withTraffic()
    ->get();

$optimizedOrder = $response->first()->optimizedIntermediateWaypointIndex ?? [];
echo "Pickup order: " . implode(' → ', array_map(fn($i) => $stores[$i]['name'], $optimizedOrder));

// STEP 2: Calculate delivery matrix from last pickup
$deliveryMatrix = GoogleRoutes::matrix()
    ->addOrigin(['lat' => $lastStore['lat'], 'lng' => $lastStore['lng']])
    ->driving()
    ->withTraffic();

foreach ($uniqueDestinations as $dest) {
    $deliveryMatrix->addDestination(['lat' => $dest['lat'], 'lng' => $dest['lng']]);
}

$matrixResponse = $deliveryMatrix->get();

// Find closest delivery from last pickup
$firstDelivery = $matrixResponse->getClosestDestination(0);
echo "First delivery: {$uniqueDestinations[$firstDelivery->destinationIndex]['customer']}";
echo "ETA: {$firstDelivery->getFormattedDuration()}";

// STEP 3: Build full optimized route (pickups + deliveries)
$allStops = array_merge(
    array_map(fn($s) => ['lat' => $s['lat'], 'lng' => $s['lng'], 'type' => 'pickup', 'name' => $s['name']], $stores),
    array_map(fn($d) => ['lat' => $d['lat'], 'lng' => $d['lng'], 'type' => 'delivery', 'name' => $d['customer']], $uniqueDestinations)
);

$fullRoute = GoogleRoutes::from($courierLocation);
foreach ($allStops as $stop) {
    $fullRoute->via(['lat' => $stop['lat'], 'lng' => $stop['lng']]);
}

$optimizedResponse = $fullRoute
    ->to($courierLocation) // Return to base
    ->optimizeWaypointOrder()
    ->driving()
    ->withTraffic()
    ->get();

$route = $optimizedResponse->first();
echo "Total distance: {$route->getDistanceInKilometers()} km";
echo "Total time: {$route->getFormattedDuration()}";

// Display optimized route
$finalOrder = $route->optimizedIntermediateWaypointIndex ?? [];
foreach ($finalOrder as $index => $stopIndex) {
    $stop = $allStops[$stopIndex];
    $icon = $stop['type'] === 'pickup' ? '📦' : '🚚';
    echo ($index + 1) . ". {$icon} {$stop['name']}";
}
```

**Output:**
```
Pickup order: Kariakoo Market → Mlimani City Mall → Slipway Shopping

First delivery: Masaki Customer
ETA: 12 min

Total distance: 32.4 km
Total time: 1h 8m

1. 📦 Kariakoo Market
2. 📦 Mlimani City Mall
3. 🚚 Mikocheni Customer
4. 🚚 Kinondoni Customer  
5. 📦 Slipway Shopping
6. 🚚 Masaki Customer (2 packages)
```

## Response Objects

### RoutesResponse

The main response object containing:
- `routes` - Collection of Route objects
- `fallbackInfo` - Information about routing fallback (if any)
- `geocodingResults` - Geocoding information for address waypoints

### Route

Individual route containing:
- `distanceMeters` - Total distance in meters
- `duration` - Duration string (e.g., "165s")
- `polyline` - Encoded polyline or GeoJSON
- `legs` - Collection of RouteLeg objects
- `viewport` - Map bounding box
- `routeLabels` - Route type labels
- `warnings` - Route warnings

Helper methods:
- `getDurationInSeconds()` - Get duration as integer
- `getDistanceInKilometers()` - Get distance in km
- `getDistanceInMiles()` - Get distance in miles
- `getFormattedDuration()` - Get human-readable duration
- `isDefaultRoute()` - Check if default route
- `isFuelEfficient()` - Check if fuel-efficient route

## Configuration

The configuration file (`config/google-routes.php`) includes:

```php
return [
    'api_key' => env('GOOGLE_ROUTES_API_KEY'),
    'base_url' => env('GOOGLE_ROUTES_BASE_URL', 'https://routes.googleapis.com'),
    'timeout' => env('GOOGLE_ROUTES_TIMEOUT', 30),
    'defaults' => [
        'travel_mode' => env('GOOGLE_ROUTES_TRAVEL_MODE', 'DRIVE'),
        'language_code' => env('GOOGLE_ROUTES_LANGUAGE', 'en-US'),
        'units' => env('GOOGLE_ROUTES_UNITS', 'METRIC'),
        'routing_preference' => env('GOOGLE_ROUTES_ROUTING_PREFERENCE', 'TRAFFIC_AWARE'),
    ],
    'default_field_mask' => [
        'routes.duration',
        'routes.distanceMeters',
        'routes.polyline.encodedPolyline',
    ],

    /*
    |--------------------------------------------------------------------------
    | Response Caching
    |--------------------------------------------------------------------------
    |
    | Configure response caching to reduce API costs and improve performance.
    |
    */
    'cache' => [
        'enabled' => env('GOOGLE_ROUTES_CACHE_ENABLED', false),
        'store' => env('GOOGLE_ROUTES_CACHE_STORE', null),
        'ttl' => env('GOOGLE_ROUTES_CACHE_TTL', 3600),
    ],
];
```

## Exception Handling

The package throws specific exceptions:

```php
use Gowelle\LaravelRouteMatrix\Exceptions\GoogleRoutesException;
use Gowelle\LaravelRouteMatrix\Exceptions\InvalidApiKeyException;
use Gowelle\LaravelRouteMatrix\Exceptions\InvalidRequestException;
use Gowelle\LaravelRouteMatrix\Exceptions\NoRouteFoundException;

try {
    $response = GoogleRoutes::from($origin)
        ->to($destination)
        ->get();
} catch (InvalidApiKeyException $e) {
    // API key is missing or invalid
} catch (InvalidRequestException $e) {
    // Request parameters are invalid
} catch (NoRouteFoundException $e) {
    // No route could be found
} catch (GoogleRoutesException $e) {
    // Other API errors
}
```

## Testing

Run the test suite:

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email gowelle.john@icloud.com instead of using the issue tracker.

## Credits

- [Gowelle](https://github.com/gowelle)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
