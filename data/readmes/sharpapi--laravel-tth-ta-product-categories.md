# AI Tours & Activities Product Categorizer for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-tth-ta-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-ta-product-categories)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-tth-ta-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-ta-product-categories)

This package provides a Laravel integration for the SharpAPI Tours & Activities Product Categorization service. It allows you to automatically categorize tours and activities products with relevance scores, which is perfect for organizing product catalogs, improving search functionality, and enhancing product discovery.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-tth-ta-product-categories
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-tth-ta-product-categories"
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
use SharpAPI\TthTaProductCategories\TthTaProductCategoriesService;

$service = new TthTaProductCategoriesService();

// Categorize a tours & activities product
$categories = $service->toursAndActivitiesProductCategories(
    'Guided Hiking Tour of the Grand Canyon with Lunch',
    'Grand Canyon Village', // optional city
    'United States', // optional country
    'English', // optional language
    5, // optional max quantity of categories
    'professional', // optional voice tone
    'Full-day guided hiking tour with experienced guides, includes lunch and transportation' // optional context
);

// $categories will contain a JSON string with the categorization results
```

## Parameters

- `productName` (string): The name of the product to categorize
- `city` (string|null): The city related to the product (optional)
- `country` (string|null): The country related to the product (optional)
- `language` (string|null): The language for the response (optional)
- `maxQuantity` (int|null): Maximum number of categories to return (optional)
- `voiceTone` (string|null): The tone of voice for the response (optional)
- `context` (string|null): Additional context for better categorization (optional)

## Response Format

The response is a JSON string containing categories with weight scores:

```json
{
  "data": {
    "type": "api_job_result",
    "id": "55bc3311-d16e-4949-83a0-d367b7f79f89",
    "attributes": {
      "status": "success",
      "type": "tth_ta_product_categories",
      "result": [
        {
          "name": "Boat Tours",
          "weight": 9.5
        },
        {
          "name": "Nature & Wildlife Tours",
          "weight": 8.7
        },
        {
          "name": "Water Sports",
          "weight": 7.8
        },
        {
          "name": "Sightseeing Cruises",
          "weight": 9.2
        },
        {
          "name": "Day Trips",
          "weight": 8
        },
        {
          "name": "Eco Tours",
          "weight": 7.5
        },
        {
          "name": "Adventure Tours",
          "weight": 6.8
        },
        {
          "name": "Cultural Tours",
          "weight": 6
        },
        {
          "name": "Multi-day Tours",
          "weight": 5.5
        },
        {
          "name": "Private Sightseeing Tours",
          "weight": 5.2
        }
      ]
    }
  }
}
```

The weight score is a value between 1.0 and 10.0, where 10.0 represents 100% relevance.

## Features

- Automatically categorizes tours and activities products
- Provides relevance scores for each category
- Supports location-specific categorization with city and country parameters
- Works with multiple languages
- Allows for additional context to improve categorization accuracy
- Helps organize product catalogs and improve search functionality

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.