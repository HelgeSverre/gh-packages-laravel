# This is my package filament-indonesia-regions

[![Latest Version on Packagist](https://img.shields.io/packagist/v/triptasoft/filament-indonesia-regions.svg?style=flat-square)](https://packagist.org/packages/triptasoft/filament-indonesia-regions)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/triptasoft/filament-indonesia-regions/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/triptasoft/filament-indonesia-regions/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/triptasoft/filament-indonesia-regions/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/triptasoft/filament-indonesia-regions/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/triptasoft/filament-indonesia-regions.svg?style=flat-square)](https://packagist.org/packages/triptasoft/filament-indonesia-regions)



A Filament plugin that provides Indonesian regional data (Provinces, Regencies, Districts, and Villages) **using the [Wilayah.id API](https://wilayah.id)**.  
No database or seeder required — all data is fetched on demand from the API.

## Features
- `Form fields` for provinces, regencies, districts, and villages.
- `Table column` to display region names.
- `Infolist entry` with label and code badge.

## Installation

You can install the package via composer:

```bash
composer require triptasoft/filament-indonesia-regions
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-indonesia-regions-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

## Form Field
```php
use Triptasoft\FilamentIndonesiaRegions\Forms\Components\RegionSelect;

RegionSelect::make()->label('Wilayah Indonesia'),
```

## Table Column
```php
use Triptasoft\FilamentIndonesiaRegions\Tables\Columns\RegionColumn;

RegionColumn::make('provinsi')->type('provinsi'),
RegionColumn::make('kabupaten')->type('kabupaten'),
RegionColumn::make('kecamatan')->type('kecamatan'),
RegionColumn::make('desa')->type('desa'),
```

## Infolist Entry
```php
use Triptasoft\FilamentIndonesiaRegions\Infolists\Entries\RegionEntry;

RegionEntry::make('provinsi')->type('provinsi'),
RegionEntry::make('kabupaten')->type('kabupaten'),
RegionEntry::make('kecamatan')->type('kecamatan'),
RegionEntry::make('desa')->type('desa'),
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [hazbu](https://github.com/triptasoft)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
