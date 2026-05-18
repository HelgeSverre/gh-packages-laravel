# Laravel GeoNode Client

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ericariyanto/laravel-geonode-client.svg?style=flat-square)](https://packagist.org/packages/ericariyanto/laravel-geonode-client)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ericariyanto/laravel-geonode-client/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ericariyanto/laravel-geonode-client/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ericariyanto/laravel-geonode-client/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ericariyanto/laravel-geonode-client/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ericariyanto/laravel-geonode-client.svg?style=flat-square)](https://packagist.org/packages/ericariyanto/laravel-geonode-client)

This Library provides a clean, modern Laravel package for interacting with GeoNode API v2+

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/Laravel GeoNode Client.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/Laravel GeoNode Client)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Installation

You can install the package via composer:

```bash
composer require ericariyanto/laravel-geonode-client
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-geonode-client-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$laravelGeoNodeClient = new EricAriyanto\LaravelGeoNodeClient();
echo $laravelGeoNodeClient->echoPhrase('Hello, EricAriyanto!');
```

```php
use EricAriyanto\LaravelGeoNodeClient\Facades\LaravelGeoNodeClient;

// List datasets
$datasets = LaravelGeoNodeClient::datasets()->list(['page_size' => 50]);

// Upload shapefile zip
$res = LaravelGeoNodeClient::datasets()->uploadFile(storage_path('tmp/parcel.zip'));

// Update keywords
LaravelGeoNodeClient::metadata()->updateTags(123, ['jalan','batas']);
```

```php
// Auto-detect & upload
LaravelGeoNodeClient::upload()->upload(storage_path('maps/jalan.zip'), [
    'title' => 'Peta Jalan Kalbar',
    'abstract' => 'Data jalan terbaru',
    'regions' => [1, 5],
    'keywords' => ['jalan','kalbar'],
]);

// Async upload
$task = LaravelGeoNodeClient::upload()->uploadAsync(storage_path('tmp/lahan.geojson'));
$status = LaravelGeoNodeClient::upload()->checkTask($task['task_id']);
```

## Styles Service (SLD)

```php
// List styles
$styles = LaravelGeoNodeClient::styles()->list();

// Get raw SLD
$sld = LaravelGeoNodeClient::styles()->getSld('peta_jalan_style');

// Upload/replace style
LaravelGeoNodeClient::styles()->upload('peta_jalan_style', $sld, true);

// Assign style to layer
LaravelGeoNodeClient::styles()->assignToLayer('layers:jalan_kota', 'peta_jalan_style');

// Sync to GeoServer (if GeoNode supports it)
LaravelGeoNodeClient::styles()->syncToGeoServer('peta_jalan_style');
```

## Advanced Metadata

```php
// Update bbox
LaravelGeoNodeClient::advancedMetadata()->updateBbox(123, [106.6, -6.5, 107.1, -6.0]);

// Update temporal extent
LaravelGeoNodeClient::advancedMetadata()->updateTemporal(123, ['start' => '2020-01-01', 'end' => '2023-12-31']);

// Update license
LaravelGeoNodeClient::advancedMetadata()->updateLicense(123, ['id' => 'cc-by', 'url' => 'https://creativecommons.org/licenses/by/4.0/']);

// Update contact
LaravelGeoNodeClient::advancedMetadata()->updateContact(123, ['name' => 'Dinas Peta', 'email' => 'peta@example.go.id']);

// Update attribution
LaravelGeoNodeClient::advancedMetadata()->updateAttribution(123, ['text' => 'Dinas Peta Kalbar', 'url' => 'https://kalbar.example.gov']);

// Full update
LaravelGeoNodeClient::advancedMetadata()->updateAll(123, [
    'bbox' => [106.6, -6.5, 107.1, -6.0],
    'temporal_extent' => ['start' => '2020-01-01', 'end' => '2023-12-31'],
    'license' => ['id' => 'cc-by'],
    'contact' => ['name' => 'Dinas Peta'],
]);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Eric Ariyanto](https://github.com/ericariyanto)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
