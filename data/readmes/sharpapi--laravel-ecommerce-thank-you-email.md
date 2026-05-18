![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Thank You Email Generator for Laravel

## 🚀 Leverage AI API to generate personalized thank you emails for E-commerce applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-ecommerce-thank-you-email.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-thank-you-email)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-ecommerce-thank-you-email.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-thank-you-email)

Check the details at SharpAPI's [E-commerce API](https://sharpapi.com/en/catalog/ai/e-commerce) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Thank You Email Generator package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-ecommerce-thank-you-email
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-ecommerce-thank-you-email
```

---
## Key Features

- **AI-Powered Thank You Email Generation**: Efficiently create personalized thank you emails for your e-commerce platform.
- **Multi-language Support**: Generate thank you emails in multiple languages.
- **Customizable Length**: Control the length of the generated thank you email.
- **Voice Tone Control**: Set your preferred writing style for the thank you email.
- **Context-Aware Generation**: Provide additional context to improve email relevance.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `EcommerceThankYouEmailService` class to access thank you email generation functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Dispatch Job**: Send product name to the API using `generateThankYouEmail`, which returns a status URL.
2. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
3. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `EcommerceThankYouEmailService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\EcommerceThankYouEmail\EcommerceThankYouEmailService;

class EmailController extends Controller
{
    protected EcommerceThankYouEmailService $thankYouEmailService;

    public function __construct(EcommerceThankYouEmailService $thankYouEmailService)
    {
        $this->thankYouEmailService = $thankYouEmailService;
    }

    /**
     * @throws GuzzleException
     */
    public function generateThankYouEmail(string $productName)
    {
        $statusUrl = $this->thankYouEmailService->generateThankYouEmail(
            $productName,
            'English',   // optional language
            250,   // optional maximum length
            'Friendly',   // optional voice tone
            'Include information about our loyalty program'   // optional context
        );
        
        $result = $this->thankYouEmailService->fetchResults($statusUrl);

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
    $statusUrl = $this->thankYouEmailService->generateThankYouEmail('Sony PlayStation 5', 'English', 250);
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

## Thank You Email Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "8c3af4d1-a8ae-4c52-9656-4f26254b7b71",
    "attributes": {
      "status": "success",
      "type": "ecommerce_thank_you_email",
      "result": {
        "email": "Dear Customer,\n\nThank you for your recent purchase of the Razer Blade 16 Gaming Laptop: NVIDIA GeForce RTX 4090-13th Gen Intel 24-Core i9 HX CPU. We appreciate your business and are confident that you will enjoy the high performance and advanced features of your new laptop.\n\nWe look forward to serving you again. Please visit our store soon for more exciting products and offers.\n\nBest regards,\n[Your Company Name]"
      }
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-ecommerce-thank-you-email/issues)
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