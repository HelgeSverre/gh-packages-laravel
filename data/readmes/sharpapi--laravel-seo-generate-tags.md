# AI SEO Meta Tag Generator for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-seo-generate-tags.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-seo-generate-tags)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-seo-generate-tags.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-seo-generate-tags)

This package provides a Laravel integration for the SharpAPI SEO Meta Tag Generator. It allows you to automatically generate all important META tags for your web content, which is perfect for improving your website's SEO and social media sharing appearance.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-seo-generate-tags
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-seo-generate-tags"
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
use SharpAPI\SeoGenerateTags\SeoGenerateTagsService;

$service = new SeoGenerateTagsService();

// Generate SEO meta tags
$seoTags = $service->generateSeoTags(
    'Your page content or URL here. Make sure to include links and image URLs for better results.',
    'English', // optional language
    'professional' // optional voice tone
);

// $seoTags will contain a JSON string with the generated meta tags
```

## Parameters

- `text` (string): The text content or URL to generate meta tags from
- `language` (string|null): The language for the meta tags (default: English)
- `voiceTone` (string|null): The tone of voice for the meta tag content (e.g., professional, casual)

## Response Format

The response is a JSON string containing various meta tags:

```json
{
  "data": {
    "type": "api_job_result",
    "id": "397676a9-599b-4f6d-822a-d9d9f32b3890",
    "attributes": {
      "status": "success",
      "type": "seo_generate_tags",
      "result": {
        "meta_tags": {
          "title": "Las Vegas Grand Prix: A Showstopper Event",
          "author": "",
          "og:url": "",
          "og:type": "article",
          "keywords": "Las Vegas Grand Prix, Max Verstappen, Formula 1, F1, Lewis Hamilton, Fernando Alonso",
          "og:image": "",
          "og:title": "Las Vegas Grand Prix: A Showstopper Event",
          "description": "Max Verstappen and other F1 stars share their thoughts on the Las Vegas Grand Prix.",
          "og:site_name": "",
          "twitter:card": "summary",
          "twitter:image": "",
          "twitter:title": "Las Vegas Grand Prix: A Showstopper Event",
          "og:description": "Max Verstappen and other F1 stars share their thoughts on the Las Vegas Grand Prix.",
          "twitter:creator": "",
          "twitter:description": "Max Verstappen and other F1 stars share their thoughts on the Las Vegas Grand Prix."
        }
      }
    }
  }
}
```

## Features

- Generates SEO-optimized page titles
- Creates compelling meta descriptions
- Provides relevant keywords
- Includes Open Graph tags for social media sharing
- Adds Twitter Card meta tags
- Optimizes content for search engines

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.