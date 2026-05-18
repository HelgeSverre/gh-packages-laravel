![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Spam Detection for Laravel

## 🚀 Leverage AI API to detect spam content in text for content moderation.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-detect-spam.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-detect-spam)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-detect-spam.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-detect-spam)

Check the details at SharpAPI's [Content API](https://sharpapi.com/en/catalog/ai/content) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Spam Detection package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-content-detect-spam
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-content-detect-spam
```

---
## Key Features

- **AI-Powered Spam Detection**: Efficiently detect spam content in any text.
- **Confidence Scoring**: Get a confidence score (0-100%) for spam classification.
- **Detailed Explanations**: Receive explanations for why content is classified as spam or not.
- **Content Moderation**: Perfect for moderating user-generated content.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `ContentDetectSpamService` class to access spam detection functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Dispatch Job**: Send text content to the API using `detectSpam`, which returns a status URL.
2. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
3. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `ContentDetectSpamService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\ContentDetectSpam\ContentDetectSpamService;

class ContentController extends Controller
{
    protected ContentDetectSpamService $spamDetectionService;

    public function __construct(ContentDetectSpamService $spamDetectionService)
    {
        $this->spamDetectionService = $spamDetectionService;
    }

    /**
     * @throws GuzzleException
     */
    public function checkForSpam(string $text)
    {
        $statusUrl = $this->spamDetectionService->detectSpam($text);
        
        $result = $this->spamDetectionService->fetchResults($statusUrl);

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
    $statusUrl = $this->spamDetectionService->detectSpam('Buy cheap medications now! Click here for amazing deals!');
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

## Spam Detection Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "f7d3eec2-7ba6-4104-9f30-ff418428de2c",
    "attributes": {
      "status": "success",
      "type": "content_detect_spam",
      "result": {
        "pass": false,
        "score": 85,
        "reason": "The message appears to be a solicitation for financial services, which is a common characteristic of spam."
      }
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-content-detect-spam/issues)
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