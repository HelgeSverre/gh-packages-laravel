# Laravel BRT Tracking

[![Latest Version on Packagist](https://img.shields.io/packagist/v/smart-dato/brt-tracking.svg?style=flat-square)](https://packagist.org/packages/smart-dato/brt-tracking)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/brt-tracking/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/smart-dato/brt-tracking/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/brt-tracking/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/smart-dato/brt-tracking/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/smart-dato/brt-tracking.svg?style=flat-square)](https://packagist.org/packages/smart-dato/brt-tracking)

This package provides a Laravel-friendly wrapper around the BRT VAS100 tracking SOAP
services. It allows you to resolve shipment identifiers based on your own references,
fetch full shipment details, and retrieve legends for statuses and events.  It also
includes utilities for caching and patching the WSDL files to ensure that PHP's SOAP
client uses secure HTTPS endpoints.

## Installation

You can install the package via composer:

```bash
composer require smart-dato/brt-tracking
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="brt-tracking-config"
```

This is the contents of the published config file:

```php
return [
];

```
Optionally you may cache the WSDL files to fix the http/https mismatch:

```bash
php artisan brt:cache-wsdl
```

## Usage
You can resolve the `BrtTrackingClient` from the service container or use the facade
provided by this package.  All methods return simple arrays or data objects for easy
consumption.

```php
use SmartDato\BrtTracking\Facades\BrtTracking;

// Look up a shipment id by your numeric reference
$shipmentId = BrtTracking::getShipmentIdByRMN(123456789);

// Fetch detailed shipment information
$shipment = BrtTracking::trackingByShipmentId($shipmentId);

// Retrieve legends for statuses and events
$esiti = BrtTracking::getLegendaEsiti();
$eventi = BrtTracking::getLegendaEventi();
```

See the published configuration file for all available options.

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

- [SmartDato](https://github.com/smart-dato)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
