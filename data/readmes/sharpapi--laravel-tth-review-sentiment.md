# AI Travel & Hospitality Review Sentiment Analyzer for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-tth-review-sentiment.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-review-sentiment)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-tth-review-sentiment.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-tth-review-sentiment)

This package provides a Laravel integration for the SharpAPI Travel & Hospitality Review Sentiment Analysis service. It allows you to analyze customer reviews for travel, tourism, and hospitality products to determine sentiment (positive, negative, or neutral) with a confidence score.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-tth-review-sentiment
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-tth-review-sentiment"
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
use SharpAPI\TthReviewSentiment\TthReviewSentimentService;

$service = new TthReviewSentimentService();

// Analyze a travel or hospitality review
$sentiment = $service->travelReviewSentiment(
    'The hotel room was spacious and clean, but the staff was not very helpful and the breakfast was disappointing.'
);

// $sentiment will contain a JSON string with the sentiment analysis result
```

## Parameters

- `text` (string): The review text to analyze for sentiment

## Response Format

The response is a JSON string containing the sentiment analysis:

```json
{
  "data": {
    "type": "api_job_result",
    "id": "f85b7ac5-33cd-4796-8935-dc8c22219946",
    "attributes": {
      "status": "success",
      "type": "tth_review_sentiment",
      "result": {
        "score": 95,
        "opinion": "POSITIVE"
      }
    }
  }
}
```

Possible opinion values:
- `POSITIVE`: The review is predominantly positive
- `NEGATIVE`: The review is predominantly negative
- `NEUTRAL`: The review is neutral or balanced

The score is a value between 0 and 100, representing the confidence level of the sentiment analysis.

## Features

- Analyzes travel and hospitality reviews for sentiment
- Provides a confidence score for the sentiment analysis
- Identifies specific positive and negative aspects mentioned in the review
- Works with reviews for hotels, restaurants, tours, activities, and other travel-related services
- Helps businesses understand customer feedback at scale

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.