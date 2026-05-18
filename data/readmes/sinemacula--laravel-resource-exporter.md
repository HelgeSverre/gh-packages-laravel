# Laravel Resource Exporter

[![Latest Stable Version](https://img.shields.io/packagist/v/sinemacula/laravel-resource-exporter.svg)](https://packagist.org/packages/sinemacula/laravel-resource-exporter)
[![Build Status](https://github.com/sinemacula/laravel-resource-exporter/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/sinemacula/laravel-resource-exporter/actions/workflows/tests.yml)
[![Maintainability](https://qlty.sh/gh/sinemacula/projects/laravel-resource-exporter/maintainability.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-resource-exporter)
[![Code Coverage](https://qlty.sh/gh/sinemacula/projects/laravel-resource-exporter/coverage.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-resource-exporter)
[![Total Downloads](https://img.shields.io/packagist/dt/sinemacula/laravel-resource-exporter.svg)](https://packagist.org/packages/sinemacula/laravel-resource-exporter)

Laravel Resource Exporter is a Laravel integration package for converting `JsonResource` and
`ResourceCollection` payloads into export-friendly formats.

The package includes:

- a manager (`ExportManager`) for resolving configured drivers
- built-in CSV and XML drivers
- a facade (`SineMacula\Exporter\Facades\Exporter`) for convenient usage
- extension hooks for custom export drivers without changing core package code

## Features

- Export arrays, single resources, and resource collections
- Select a driver explicitly (`csv`, `xml`) or use the configured default
- Exclude fields consistently across drivers using `withoutFields()`
- Customize per-driver options through `config/exporter.php`
- Register custom drivers via `ExportManager::extend()`

## Supported Drivers

- `csv`
- `xml`

## Installation

To install the Laravel Resource Exporter, run the following command in your project directory:

```bash
composer require sinemacula/laravel-resource-exporter
```

## Configuration

After installation, publish the package configuration:

```bash
php artisan vendor:publish --provider="SineMacula\Exporter\ExporterServiceProvider"
```

This creates `config/exporter.php`, where you can control:

- `default`: the default exporter name
- `exporters`: named exporters and their `driver` + options
- `alias`: container/facade accessor alias (defaults to `exporter`)

## Usage

### Basic usage

```php
use SineMacula\Exporter\Facades\Exporter;
use App\Http\Resources\YourResource;

// Export a single resource as CSV
$csv = Exporter::format('csv')->exportItem(new YourResource($item));

// Export a collection as XML
$xml = Exporter::format('xml')->exportCollection(YourResource::collection($collection));
```

### Field exclusion

```php
$csv = Exporter::format('csv')
    ->withoutFields(['internal_id', 'debug'])
    ->exportCollection(YourResource::collection($collection));
```

### On-demand exporters

```php
use SineMacula\Exporter\Facades\Exporter;

// Build an exporter from ad-hoc config
$exporter = Exporter::build([
    'driver' => 'csv',
    'delimiter' => ';',
]);
```

### Custom drivers

```php
use SineMacula\Exporter\ExportManager;

app(ExportManager::class)->extend('json', function ($app, array $config) {
    return new App\Exporters\JsonExporter($config);
});
```

## Testing

```bash
composer test
composer test-coverage
composer check
```

## Contributing

Contributions are welcome via GitHub pull requests.

## Security

If you discover a security issue, please contact Sine Macula directly rather than opening a public issue.

## License

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
