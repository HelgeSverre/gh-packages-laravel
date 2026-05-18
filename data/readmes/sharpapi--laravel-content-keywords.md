# AI Content Keywords Generator for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-keywords.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-keywords)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-keywords.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-keywords)

This package provides a Laravel integration for the SharpAPI Content Keywords Generator. It allows you to generate keywords or tags from any text content, which is perfect for SEO optimization, content categorization, and more.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-content-keywords
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-content-keywords"
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
use SharpAPI\ContentKeywords\ContentKeywordsService;

$service = new ContentKeywordsService();

// Generate keywords from text
$keywords = $service->generateKeywords(
    'Your text content here',
    'English', // optional language
    10, // optional max quantity
    'professional', // optional voice tone
    'technology blog' // optional context
);

// $keywords will contain a JSON string with the generated keywords
```

## Parameters

- `text` (string): The text content to generate keywords from
- `language` (string|null): The language of the content (default: English)
- `maxQuantity` (int|null): Maximum number of keywords to generate
- `voiceTone` (string|null): The tone of voice for the keywords (e.g., professional, casual)
- `context` (string|null): Additional context to improve keyword relevance

## Response Format

The response is a JSON string containing an array of keywords:

```json
{
  "data": {
    "type": "api_job_result",
    "id": "b93aae27-87b8-4c68-925a-f6c991cc563c",
    "attributes": {
      "status": "success",
      "type": "content_keywords",
      "result": [
        "Las Vegas Grand Prix",
        "Max Verstappen",
        "Formel 1",
        "Lewis Hamilton",
        "Fernando Alonso"
      ]
    }
  }
}
```

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
