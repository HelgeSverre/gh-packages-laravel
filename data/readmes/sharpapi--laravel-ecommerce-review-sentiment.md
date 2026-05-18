![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Product Review Sentiment Analysis for Laravel

## 🚀 Leverage AI API to analyze sentiment in product reviews for E-commerce applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-ecommerce-review-sentiment.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-review-sentiment)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-ecommerce-review-sentiment.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-review-sentiment)

Check the details at SharpAPI's [E-commerce API](https://sharpapi.com/en/catalog/ai/e-commerce) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Product Review Sentiment Analysis package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-ecommerce-review-sentiment
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-ecommerce-review-sentiment
```

---
## Key Features

- **AI-Powered Sentiment Analysis**: Efficiently analyze sentiment in product reviews with confidence scores.
- **Sentiment Classification**: Automatically classify reviews as POSITIVE, NEGATIVE, or NEUTRAL.
- **Confidence Scoring**: Get a confidence score (0-100%) for each sentiment classification.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `EcommerceReviewSentimentService` class to access sentiment analysis functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Dispatch Job**: Send a product review to the API using `productReviewSentiment`, which returns a status URL.
2. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
3. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `EcommerceReviewSentimentService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\EcommerceReviewSentiment\EcommerceReviewSentimentService;

class ReviewController extends Controller
{
    protected EcommerceReviewSentimentService $reviewSentimentService;

    public function __construct(EcommerceReviewSentimentService $reviewSentimentService)
    {
        $this->reviewSentimentService = $reviewSentimentService;
    }

    /**
     * @throws GuzzleException
     */
    public function analyzeSentiment(string $review)
    {
        $statusUrl = $this->reviewSentimentService->productReviewSentiment($review);
        
        $result = $this->reviewSentimentService->fetchResults($statusUrl);

        return response()->json($result->getResultJson());
    }
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $statusUrl = $this->reviewSentimentService->productReviewSentiment('This product is amazing! I love it.');
} catch (ClientException $e) {
    echo $e->getMessage();
}
```

---

## Optional Configuration

You can customize the configuration by setting the following environment variables in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
SHARP_API_JOB_STATUS_POLLING_WAIT=180
SHARP_API_JOB_STATUS_USE_POLLING_INTERVAL=true
SHARP_API_JOB_STATUS_POLLING_INTERVAL=10
SHARP_API_BASE_URL=https://sharpapi.com/api/v1
```

---

## Sentiment Analysis Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "7f829234-0e87-4796-a820-4f9fe5de5aab",
    "attributes": {
      "status": "success",
      "type": "ecommerce_review_sentiment",
      "result": {
        "score": "85",
        "opinion": "NEGATIVE"
      }
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-ecommerce-review-sentiment/issues)
- Join our [Telegram community](https://t.me/sharpapi_community)

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for a detailed list of changes.

---

## Credits

- [A2Z WEB LTD](https://github.com/a2zwebltd)
- [Dawid Makowski](https://github.com/makowskid)
- Enhance your [Laravel AI](https://sharpapi.com/) capabilities!

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Follow Us

Stay updated with news, tutorials, and case studies:

- [SharpAPI on X (Twitter)](https://x.com/SharpAPI)
- [SharpAPI on YouTube](https://www.youtube.com/@SharpAPI)
- [SharpAPI on Vimeo](https://vimeo.com/SharpAPI)
- [SharpAPI on LinkedIn](https://www.linkedin.com/products/a2z-web-ltd-sharpapicom-automate-with-aipowered-api/)
- [SharpAPI on Facebook](https://www.facebook.com/profile.php?id=61554115896974)