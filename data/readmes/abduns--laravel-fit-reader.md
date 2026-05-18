# laravel-fit-reader

A focused, developer-friendly Laravel package to read and parse Garmin `.fit` activity files.

[![Tests](https://github.com/abduns/laravel-fit-reader/actions/workflows/tests.yml/badge.svg)](https://github.com/abduns/laravel-fit-reader/actions)
[![Version](https://img.shields.io/packagist/v/abduns/laravel-fit-reader.svg)](https://packagist.org/packages/abduns/laravel-fit-reader)
[![Downloads](https://img.shields.io/packagist/dt/abduns/laravel-fit-reader.svg)](https://packagist.org/packages/abduns/laravel-fit-reader)
[![License](https://img.shields.io/packagist/l/abduns/laravel-fit-reader.svg)](LICENSE.md)

---

## Features

- Modern PHP support
- Lightweight and fast
- Typed API
- DTO Support
- Laravel Integration
- Extensible architecture

---

## Installation

```bash
composer require abduns/laravel-fit-reader
php artisan vendor:publish --tag="fit-reader-config"
```

---

## Quick Start

```php
use Dunn\FitReader\Facades\FitReader;

// Read from a local path
$activity = FitReader::fromPath(storage_path('app/activities/run.fit'));

echo "Total Distance: " . $activity->totalDistanceMeters . " meters";
```

Example output:

```text
Total Distance: 5000.5 meters
```

---

## Why This Package?

- Existing solutions are outdated or rely on external binaries
- Missing modern PHP features
- Poor developer experience
- No standards compliance
- Not built specifically for Laravel 12+

This package provides a native PHP implementation for parsing FIT files, converting raw data into easy-to-use Data Transfer Objects (DTOs).

---

## Usage

### Basic Usage

```php
use Dunn\FitReader\Facades\FitReader;

$activity = FitReader::fromPath(storage_path('app/activities/run.fit'));

// Activity Summary
echo "Start Time: " . $activity->startTime->format('Y-m-d H:i:s');
echo "Sport: " . $activity->getSportName(); // e.g., "running", "cycling", "swimming"
```

### Advanced Usage

```php
use Illuminate\Http\Request;
use Dunn\FitReader\Facades\FitReader;

class ActivityController extends Controller
{
    public function store(Request $request)
    {
        $file = $request->file('activity_file');
        
        // Parse the uploaded file directly
        $activity = FitReader::fromUploadedFile($file);
        
        // Export entire activity as array
        $array = $activity->toArray();
        $json = $activity->toJson();
        
        return response()->json([
            'distance' => $activity->totalDistanceMeters,
            'duration' => $activity->totalDurationSeconds,
            'records_count' => $activity->records->count(),
        ]);
    }
}
```

### Configuration

```php
return [
    'units' => [
        'raw_values' => false, // Set to true if you want raw values instead of converted units
    ],
];
```

---

## Standards / Specifications

References:

- Flexible and Interoperable Data Transfer (FIT) Protocol

---

## Supported Features

| Feature | Support |
|---|---|
| Activity Parsing | ✅ |
| Records (Time Series Data) | ✅ |
| Laps Data | ✅ |
| Exporting Data | ✅ |
| Detecting Activity Type | ✅ |

---

## Compatibility

| Platform | Supported |
|---|---|
| PHP 8.2+ | ✅ |
| Laravel 12.x | ✅ |

---

## Design Goals

- Developer experience first
- Predictable APIs
- Minimal dependencies
- Strong typing
- Extensibility
- Native PHP Implementation

---

## Architecture

- Decoded streams into typed DTOs (`FitActivity`, `FitRecord`, `FitLap`)
- Facade for ease of use
- Native file parsing without binary dependencies

---

## Performance

| Operation | Time |
|---|---|
| Parse typical FIT file | < 50ms |

---

## Testing

```bash
composer test
```

---

## Roadmap

- [ ] Support writing/editing FIT files

---

## Contributing

Contributions, issues, and discussions are welcome.

---

## Security

If you discover security issues, please report them responsibly.

---

## License

MIT
