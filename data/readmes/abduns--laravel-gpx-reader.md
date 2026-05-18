# laravel-gpx-reader

A Laravel package to read and work with GPX 1.1 files.

[![Tests](https://github.com/abduns/laravel-gpx-reader/actions/workflows/tests.yml/badge.svg)](https://github.com/abduns/laravel-gpx-reader/actions)
[![Version](https://img.shields.io/packagist/v/abduns/laravel-gpx-reader.svg)](https://packagist.org/packages/abduns/laravel-gpx-reader)
[![Downloads](https://img.shields.io/packagist/dt/abduns/laravel-gpx-reader.svg)](https://packagist.org/packages/abduns/laravel-gpx-reader)
[![License](https://img.shields.io/packagist/l/abduns/laravel-gpx-reader.svg)](LICENSE.md)

---

## Features

- Modern PHP support
- GPX 1.1 Support
- No External Dependencies
- Laravel Integration
- Type-Safe DTOs
- Validation with strict mode

---

## Installation

```bash
composer require abduns/laravel-gpx-reader
```

---

## Quick Start

```php
use Dunn\GpxReader\Facades\Gpx;

// From file
$gpx = Gpx::parseFromFile('path/to/file.gpx');

echo $gpx->creator;
```

---

## Why This Package?

- Existing solutions are outdated
- Missing modern PHP features
- Poor developer experience
- No standards compliance
- Too framework-coupled

This package focuses on simplicity, interoperability, and modern developer ergonomics.

---

## Usage

### Basic Usage

```php
use Dunn\GpxReader\Facades\Gpx;

// From file
$gpx = Gpx::parseFromFile('path/to/file.gpx');

// From string
$gpx = Gpx::parseFromString($xmlString);
```

### Advanced Usage

```php
// Access metadata
echo $gpx->creator;
echo $gpx->version;
if ($gpx->metadata) {
    echo $gpx->metadata->name;
    echo $gpx->metadata->desc;
    echo $gpx->metadata->time?->format('Y-m-d H:i:s');
}

// Access Waypoints
foreach ($gpx->waypoints as $waypoint) {
    echo "Waypoint: {$waypoint->name} ({$waypoint->latitude}, {$waypoint->longitude})";
    echo " - Elevation: {$waypoint->elevation}"; // Access elevation
}

// Access Routes
foreach ($gpx->routes as $route) {
    echo "Route: {$route->name}";
    foreach ($route->points as $point) {
        echo " - Point: {$point->latitude}, {$point->longitude}";
        echo " - Elevation: {$point->elevation}"; // Access elevation
    }
}

// Access Tracks
foreach ($gpx->tracks as $track) {
    echo "Track: {$track->name}";
    foreach ($track->segments as $segment) {
        foreach ($segment->points as $point) {
            echo " - Point: {$point->latitude}, {$point->longitude}";
            echo " - Elevation: {$point->elevation}"; // Access elevation
        }
    }
}
```

### Configuration

You can publish the config file with:

```bash
php artisan vendor:publish --tag="gpx-config"
```

```php
return [
    'strict_mode' => true, // Throw exceptions for invalid GPX structure
    'timezone' => 'UTC',
];
```

---

## Standards / Specifications

- GPX 1.1 Schema

References:

- https://www.topografix.com/gpx.asp

---

## Supported Features

| Feature | Support |
|---|---|
| GPX 1.1 parsing | ✅ |
| Track / Route / Waypoint | ✅ |
| Type-safe DTOs | ✅ |

---

## Compatibility

| Platform | Supported |
|---|---|
| PHP 8.2+ | ✅ |
| Laravel 11.0+ | ✅ |

---

## Design Goals

- Developer experience first
- Predictable APIs
- Minimal dependencies
- Strong typing
- Extensibility
- Interoperability

---

## Architecture

- Facade for ease of use
- DTOs for parsed GPX elements
- Native XML parsing

---

## Performance

| Operation | Time |
|---|---|
| Parse typical GPX | < 10ms |

---

## Testing

```bash
composer test
```

---

## Roadmap

- [ ] Add GPX generation/writing
- [ ] Support older GPX 1.0 schema

---

## Contributing

Contributions, issues, and discussions are welcome.

---

## Security

If you discover security issues, please report them responsibly.

---

## License

MIT
