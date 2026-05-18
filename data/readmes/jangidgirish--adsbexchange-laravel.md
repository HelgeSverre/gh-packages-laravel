# adsbexchange-laravel
Laravel HTTP client package for ADSBexchange Aircraft API

## Available client methods

```php
ADSBExchange::all();
ADSBExchange::totalAircraft();
ADSBExchange::filter([...]);

ADSBExchange::hex('A1B2C3');
ADSBExchange::hex(['A1B2C3', 'D4E5F6']);
ADSBExchange::icao('A1B2C3');
ADSBExchange::icao(['A1B2C3', 'D4E5F6']);
ADSBExchange::military();
ADSBExchange::callsign('UAL123');
ADSBExchange::registration('N123AB');
ADSBExchange::registration(['N123AB', 'N456CD']);
ADSBExchange::squawk('1200');

ADSBExchange::latLonDistance(25.2048, 55.2708, 250);
ADSBExchange::minimalLatLonDistance(25.2048, 55.2708, 250);
ADSBExchange::noHexDistanceAbove(250, 10000, 25.2048, 55.2708);
ADSBExchange::proximityRadius([
    ['lat' => 25.2048, 'lon' => 55.2708, 'radius' => 250],
]);

ADSBExchange::airport('KJFK');
ADSBExchange::airport(['KJFK', 'KLAX']);

ADSBExchange::geospatialBoundary([...]);
ADSBExchange::geospatialCountry('US');
ADSBExchange::geospatialCountrySubdivisions('US');
ADSBExchange::geospatialCountrySubdivision('US', 'CA');
ADSBExchange::geospatialRegion('europe');
ADSBExchange::geospatialContinent('north-america');

ADSBExchange::operationsIcao('A1B2C3');
ADSBExchange::operationsIcaos(['A1B2C3', 'D4E5F6']);
ADSBExchange::operationsAirport('KJFK');
ADSBExchange::operationsAirports(['KJFK', 'KLAX']);

ADSBExchange::traces('3d', 'trace_full_123456.json');
ADSBExchange::tracesHist(2026, 3, 22, '0f', 'trace_full_123456.json');
```

The package also keeps the legacy `hax()` and `search()` methods for backwards compatibility.
