# AI Hospitality Product Categorizer for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-tth-hospitality-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-hospitality-product-categories)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-tth-hospitality-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-hospitality-product-categories)

This package provides a Laravel integration for the SharpAPI Hospitality Product Categorization service. It allows you to automatically categorize hospitality products with relevance scores, which is perfect for organizing product catalogs, improving search functionality, and enhancing product discovery.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-tth-hospitality-product-categories
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-tth-hospitality-product-categories"
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
use SharpAPI\TthHospitalityProductCategories\TthHospitalityProductCategoriesService;

$service = new TthHospitalityProductCategoriesService();

// Categorize a hospitality product
$categories = $service->hospitalityProductCategories(
    'Luxury Ocean View Suite with Balcony',
    'Miami Beach', // optional city
    'United States', // optional country
    'English', // optional language
    5, // optional max quantity of categories
    'professional', // optional voice tone
    'Spacious suite with king bed, private balcony, ocean views, and complimentary breakfast' // optional context
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
    "id": "afb7cc23-23a5-479c-92a9-be983792dabc",
    "attributes": {
      "status": "success",
      "type": "tth_hospitality_product_categories",
      "result": [
        {
          "name": "Adult Only Hotels",
          "weight": 10
        },
        {
          "name": "Luxury Hotels",
          "weight": 8.5
        },
        {
          "name": "Boutique Hotels",
          "weight": 7.5
        },
        {
          "name": "Romantic Getaways",
          "weight": 7
        },
        {
          "name": "City Hotels",
          "weight": 6.5
        },
        {
          "name": "Couples Retreats",
          "weight": 6
        }
      ]
    }
  }
}
```

The weight score is a value between 1.0 and 10.0, where 10.0 represents 100% relevance.

## Features

- Automatically categorizes hospitality products
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