# AI URL Detector for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-detect-urls.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-detect-urls)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-detect-urls.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-detect-urls)

This package provides a Laravel integration for the SharpAPI URL Detection service. It allows you to automatically detect and extract URLs from text content, which is perfect for content moderation, data extraction, and link validation.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-content-detect-urls
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-content-detect-urls"
```

This is the contents of the published config file:

```php
return [
    'api_key' => env('SHARP_API_KEY'),
    'base_url' => env('SHARP_API_BASE_URL', 'https://sharpapi.com/api/v1'),
    'api_job_status_polling_wait' => env('SHARP_API_JOB_STATUS_POLLING_WAIT', 180),
    'api_job_status_polling_interval' => env('SHARP_API_JOB_STATUS_POLLING_INTERVAL', 10),
    'api_job_status_use_polling_interval' => env('SHARP_API_JOB_STATUS_USE_POLLING_INTERVAL', false),
];
```

Make sure to set your SharpAPI key in your .env file:

```
SHARP_API_KEY=your-api-key
```

## Usage

```php
use SharpAPI\ContentDetectUrls\ContentDetectUrlsService;

$service = new ContentDetectUrlsService();

// Detect URLs in text
$detectedUrls = $service->detectUrls(
    'Check out these websites: example.com, https://github.com, and www.laravel.com/docs'
);

// $detectedUrls will contain a JSON string with the detected URLs
```

## Parameters

- `text` (string): The text content to analyze for URLs

## Response Format

The response is a JSON string containing an array of detected URLs with their protocols:

```json
[
  {
    "url": "http://example.com",
    "protocol": "http"
  },
  {
    "url": "https://github.com",
    "protocol": "https"
  },
  {
    "url": "http://www.laravel.com/docs",
    "protocol": "http"
  }
]
```

## Features

- Automatically detects URLs in text content
- Works with various URL formats (with or without protocol, with or without www)
- Identifies the protocol for each URL
- Handles URLs with different TLDs (.com, .org, .io, etc.)
- Useful for content moderation, data extraction, and link validation

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.