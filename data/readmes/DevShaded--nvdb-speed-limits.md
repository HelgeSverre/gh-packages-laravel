# NVDB Speed Limits for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/devshaded/nvdb-speed-limits.svg?style=flat-square)](https://packagist.org/packages/devshaded/nvdb-speed-limits)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/devshaded/nvdb-speed-limits/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/devshaded/nvdb-speed-limits/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/devshaded/nvdb-speed-limits/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/devshaded/nvdb-speed-limits/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/devshaded/nvdb-speed-limits.svg?style=flat-square)](https://packagist.org/packages/devshaded/nvdb-speed-limits)

A Laravel package for fetching speed limits from the Norwegian NVDB API.

---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Get Speed Limit for a Coordinate](#get-speed-limit-for-a-coordinate)
  - [Get Speed Limit with Expanded Search](#get-speed-limit-with-expanded-search)
  - [Get Speed Limits for Multiple Coordinates](#get-speed-limits-for-multiple-coordinates)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Credits](#credits)
- [License](#license)

---

## Features
- Fetches speed limits from the Norwegian NVDB API for given coordinates
- Supports searching with an expanding radius if no speed limit is found initially
- Batch lookup for multiple coordinates
- Configurable API endpoint, search radius, and coordinate bounds
- Designed for Laravel, but can be used in any PHP project

---

## Installation

Install the package via Composer:

```bash
composer require devshaded/nvdb-speed-limits
```

Publish the config file (optional):

```bash
php artisan vendor:publish --tag="nvdb-speed-limits-config"
```

---

## Configuration

The configuration file allows you to customize API settings, search parameters, and coordinate bounds. Example:

```php
return [
    'api' => [
        'base_url' => 'https://nvdbapiles-v3.atlas.vegvesen.no',
        'timeout' => 30,
        'headers' => [
            'accept' => 'application/vnd.vegvesen.nvdb-v3-rev1+json',
            'X-Client' => 'LaravelNvdbSpeedLimits/1.0',
        ],
    ],
    'search' => [
        'default_radius' => 0.0001, // ~11 meters
        'max_radius' => 0.005,      // ~550 meters
        'radius_multiplier' => 3,   // For expanding search
    ],
    'bounds' => [
        'latitude' => [57, 72],
        'longitude' => [4, 32],
    ],
];
```

---

## Usage

Import the facade or use the class directly:

```php
use DevShaded\NvdbSpeedLimits\Facades\NvdbSpeedLimits;
// or
use DevShaded\NvdbSpeedLimits\NvdbSpeedLimits;
```

### Get Speed Limit for a Coordinate

```php
$result = NvdbSpeedLimits::getSpeedLimit(59.9139, 10.7522);

if ($result->found) {
    echo "Speed limit: " . $result->recommended['speed'] . " km/h";
} else {
    echo "No speed limit found.";
}
```

#### Optional: Specify a Search Radius

```php
$result = NvdbSpeedLimits::getSpeedLimit(59.9139, 10.7522, 100); // 100 meters
```

### Get Speed Limit with Expanded Search

This method will automatically expand the search radius until a speed limit is found or the maximum radius is reached.

```php
$result = NvdbSpeedLimits::getSpeedLimitWithExpandedSearch(59.9139, 10.7522);

if ($result->found) {
    echo "Speed limit: " . $result->recommended['speed'] . " km/h";
}
```

### Get Speed Limits for Multiple Coordinates

You can pass an array of coordinates (with `lat`/`lng` or `latitude`/`longitude` keys):

```php
$coordinates = [
    ['lat' => 59.9139, 'lng' => 10.7522],
    ['latitude' => 60.3913, 'longitude' => 5.3221],
    ['lat' => 61.1234, 'lng' => 11.5678],
];

$results = NvdbSpeedLimits::getSpeedLimitsForCoordinates($coordinates);

foreach ($results as $item) {
    if ($item['error']) {
        echo "Error for coordinate (" . json_encode($item['coordinate']) . "): " . $item['error'] . "\n";
    } else {
        echo "Speed limit at (" . $item['coordinate']['lat'] . ", " . $item['coordinate']['lng'] . "): " . $item['result']->recommended['speed'] . " km/h\n";
    }
}
```

---

## Error Handling

- If invalid coordinates are provided, an `InvalidCoordinatesException` will be thrown.
- For batch lookups, errors are included in the result array for each coordinate.
- Always check the `found` property on the result object to determine if a speed limit was found.

---

## Testing

Run the tests with:

```bash
composer test
```

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

## Credits

- [DevShaded](https://github.com/DevShaded)

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
