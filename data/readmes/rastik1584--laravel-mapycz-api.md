# Laravel Mapy.com API

Unofficial Laravel package for the Mapy.com / Mapy.cz REST API.

This package is not affiliated with, endorsed by, or developed in cooperation with Mapy.com or Seznam.cz. It is an independent community package.

## Requirements

- PHP 8.1+
- Laravel 10, 11, 12, or 13

Framework-specific PHP minimums:

- Laravel 10: PHP 8.1+
- Laravel 11: PHP 8.2+
- Laravel 12: PHP 8.2+
- Laravel 13: PHP 8.3+

## Coverage

The package currently implements all `13/13` REST endpoints documented in the official Mapy.com API docs checked on April 7, 2026:

- `GET /v1/geocode`
- `GET /v1/suggest`
- `GET /v1/rgeocode`
- `GET /v1/routing/route`
- `GET /v1/routing/matrix-m`
- `GET /v1/static/map`
- `GET /v1/static/pano`
- `GET /v1/maptiles/{mapset}/{tileSize}/{z}/{x}/{y}`
- `GET /v1/maptiles/{mapset}/tiles.json`
- `GET /v1/elevation`
- `GET /v1/timezone/list-timezones`
- `GET /v1/timezone/timezone`
- `GET /v1/timezone/coordinate`

## Installation

```bash
composer require rastik1584/laravel-mapycz-api
```

Laravel package auto-discovery is supported.

Verified locally:

- Laravel 13 with `illuminate/support ^13.0`
- Orchestra Testbench 11
- PHPUnit 12

## Configuration

Publish configuration:

```bash
php artisan vendor:publish --provider="Rastik1584\\LaravelMapyczApi\\MapyczApiServiceProvider" --tag="config"
```

Set your API key in `.env`:

```dotenv
MAPYCZ_API_KEY=your-api-key
MAPYCZ_API_BASE_URL=https://api.mapy.cz/v1/
MAPYCZ_API_TIMEOUT=30
MAPYCZ_API_VERIFY_SSL=true
```

## Quick start

### Facade

```php
use Rastik1584\LaravelMapyczApi\Facades\MapyczApi;

$geocode = MapyczApi::geocode('Praha');
$route = MapyczApi::route([
    'start' => '14.40094,50.0711',
    'end' => '16.5990122,49.1718222',
    'routeType' => 'car_fast',
]);
$elevation = MapyczApi::elevations([
    'positions' => ['14.40094,50.0711'],
]);
$timezone = MapyczApi::timezoneInfo('Europe/Prague');
```

### Dependency injection

```php
use Rastik1584\LaravelMapyczApi\MapyczApi;

class MapController
{
    public function __construct(private MapyczApi $mapyczApi)
    {
    }

    public function show(): array
    {
        return $this->mapyczApi->geocode('Brno');
    }
}
```

## Response styles

JSON endpoints support both raw arrays and typed response objects.

Raw array examples:

- `geocode()`
- `suggest()`
- `reverse()`
- `route()`
- `matrixM()`
- `tileJson()`
- `elevations()`
- `listTimezones()`
- `timezoneInfo()`
- `timezoneByCoordinates()`

Typed response examples:

- `geocodeResult()`
- `suggestResult()`
- `reverseResult()`
- `routeResult()`
- `matrixResult()`
- `tileJsonResult()`
- `elevationsResult()`
- `listTimezonesResult()`
- `timezoneInfoResult()`
- `timezoneByCoordinatesResult()`

## Geocode examples

```php
use Rastik1584\LaravelMapyczApi\DTO\Geocoding\GeocodeParams;

$geocode = app(MapyczApi::class)->geocode('Praha');
$suggest = app(MapyczApi::class)->suggest('Pra');
$reverse = app(MapyczApi::class)->reverse(50.08861, 14.42212);

$filtered = app(MapyczApi::class)->geocoding()->geocode(
    new GeocodeParams(
        query: 'Praha',
        type: ['regional', 'poi'],
        locality: ['Praha', 'cz'],
        preferBBox: [14.2, 49.9, 14.7, 50.2]
    )
);

$typed = app(MapyczApi::class)->geocodeResult('Praha');
$firstName = $typed->items[0]->name;
```

Supported geocode and suggest filters in DTOs:

- `lang`
- `limit`
- `type`
- `locality`
- `preferBBox`
- `preferNear`
- `preferNearPrecision`

## Routing examples

```php
use Rastik1584\LaravelMapyczApi\DTO\Routing\RouteMapParams;
use Rastik1584\LaravelMapyczApi\DTO\Routing\MatrixMapParams;

$route = app(MapyczApi::class)->route(
    new RouteMapParams(
        start: [14.40094, 50.0711],
        end: [16.5990122, 49.1718222],
        routeType: 'car_fast'
    )
);

$matrix = app(MapyczApi::class)->matrixM(
    new MatrixMapParams(
        starts: [[14.40094, 50.0711], [14.3951303, 50.0704094]],
        ends: [[14.40194, 50.0721]],
        routeType: 'car_fast'
    )
);

$typedRoute = app(MapyczApi::class)->routeResult(
    new RouteMapParams(
        start: [14.40094, 50.0711],
        end: [16.5990122, 49.1718222],
        routeType: 'car_fast'
    )
);
```

## Static image examples

```php
use Rastik1584\LaravelMapyczApi\DTO\StaticMapParams;
use Rastik1584\LaravelMapyczApi\DTO\StaticPanoramaParams;

$filename = app(MapyczApi::class)->staticImage(
    storagePath: 'maps',
    params: new StaticMapParams(
        width: 400,
        height: 300,
        markers: [[
            'color' => 'red',
            'size' => 'normal',
            'points' => [
                ['lon' => 14.42212, 'lat' => 50.08861, 'label' => 'A'],
            ],
        ]]
    ),
    filename: 'map.png'
);

$shapeMap = app(MapyczApi::class)->staticImage(
    storagePath: 'maps',
    params: new StaticMapParams(
        width: 400,
        height: 300,
        markers: [[
            'points' => [
                ['lon' => 14.42212, 'lat' => 50.08861],
            ],
        ]],
        shapes: [
            [
                'color' => 'green',
                'width' => 2,
                'path' => [
                    [14.4196, 50.0869],
                    [14.4197, 50.0867],
                ],
            ],
            [
                'color' => 'blue',
                'fill' => '#82bd51aa',
                'polygon' => [[
                    [14.4219, 50.0869],
                    [14.4220, 50.0867],
                    [14.4223, 50.0867],
                ]],
            ],
        ]
    ),
    filename: 'shape-map.png'
);

$panorama = app(MapyczApi::class)->panoramaImage(
    storagePath: 'panorama',
    params: new StaticPanoramaParams(
        lon: 14.42212,
        lat: 50.08861
    ),
    filename: 'pano.jpg'
);
```

## Tile examples

```php
$tile = app(MapyczApi::class)->tile(
    mapset: 'basic',
    zoom: 6,
    x: 34,
    y: 21,
    path: 'tiles',
    tileSize: '256@2x',
    filename: 'tile.png',
    lang: 'en'
);

$tileJson = app(MapyczApi::class)->tileJson('basic', 'en');
$typedTileJson = app(MapyczApi::class)->tileJsonResult('basic', 'en');
```

## Elevation examples

```php
use Rastik1584\LaravelMapyczApi\DTO\ElevationParams;

$elevations = app(MapyczApi::class)->elevations(
    new ElevationParams(
        positions: [
            [14.40094, 50.0711],
            [14.3951303, 50.0704094],
        ],
        lang: 'en'
    )
);

$typedElevations = app(MapyczApi::class)->elevationsResult(
    new ElevationParams(
        positions: [[14.40094, 50.0711]]
    )
);
```

## Timezone examples

```php
use Rastik1584\LaravelMapyczApi\DTO\Timezone\TimezoneCoordinateParams;
use Rastik1584\LaravelMapyczApi\DTO\Timezone\TimezoneListParams;
use Rastik1584\LaravelMapyczApi\DTO\Timezone\TimezoneNameParams;

$list = app(MapyczApi::class)->listTimezones(
    new TimezoneListParams(lang: 'en')
);

$timezone = app(MapyczApi::class)->timezoneInfo(
    new TimezoneNameParams(timezone: 'Europe/Prague', lang: 'en')
);

$timezoneByCoordinates = app(MapyczApi::class)->timezoneByCoordinates(
    new TimezoneCoordinateParams(lon: 14.42076, lat: 50.08804)
);

$typedTimezone = app(MapyczApi::class)->timezoneInfoResult('Europe/Prague');
```

## Notes

- Binary endpoints for static maps, panorama images, and tiles store files through Laravel Storage and return the stored filename.
- Shared client caching is available for GET requests through `mapycz-api.cache.enabled` and `mapycz-api.cache.ttl`.
- The package exposes dedicated exceptions for missing API keys, invalid DTO payloads, and remote API failures.
- Route DTO validation enforces official limits for waypoint count and matrix size.
- Static map shapes can be passed as raw API strings or as structured `path` and `polygon` arrays.
- `functions()` was removed from the public API because it is not part of the currently documented and verified Mapy.com REST surface.

## Quality checks

Available Composer scripts:

- `composer test`
- `composer analyse`
- `composer format`
- `composer format:test`
- `composer qa`

## Official documentation

- https://api.mapy.com/v1/docs/
- https://api.mapy.com/v1/docs/geocode/
- https://api.mapy.com/v1/docs/routing/
- https://api.mapy.com/v1/docs/static/
- https://api.mapy.com/v1/docs/maptiles/
- https://api.mapy.com/v1/docs/elevation/
- https://api.mapy.com/v1/docs/timezone/

## License

MIT
