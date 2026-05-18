![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Related Job Positions Generator for Laravel

## 🚀 Leverage AI API to identify related job positions for HR Tech and recruitment applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-hr-related-job-positions.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-hr-related-job-positions)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-hr-related-job-positions.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-hr-related-job-positions)

Check the details at SharpAPI's [HR Tech API](https://sharpapi.com/en/catalog/ai/hr-tech) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Related Job Positions Generator package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-hr-related-job-positions
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-hr-related-job-positions
```

---
## Key Features

- **AI-Powered Related Job Positions Generation**: Efficiently identify job positions related to a given position with relevance scores.
- **Multi-language Support**: Generate related job positions in multiple languages.
- **Customizable Output**: Control the number of related job positions returned.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `HrRelatedJobPositionsService` class to access related job positions generation functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Dispatch Job**: Send a job position name to the API using `relatedJobPositions`, which returns a status URL.
2. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
3. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `HrRelatedJobPositionsService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\HrRelatedJobPositions\HrRelatedJobPositionsService;

class JobPositionsController extends Controller
{
    protected HrRelatedJobPositionsService $relatedJobPositionsService;

    public function __construct(HrRelatedJobPositionsService $relatedJobPositionsService)
    {
        $this->relatedJobPositionsService = $relatedJobPositionsService;
    }

    /**
     * @throws GuzzleException
     */
    public function getRelatedJobPositions(string $jobPositionName)
    {
        $statusUrl = $this->relatedJobPositionsService->relatedJobPositions(
            $jobPositionName,
            'English',   // optional language
            10   // optional maximum quantity
        );
        
        $result = $this->relatedJobPositionsService->fetchResults($statusUrl);

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
    $statusUrl = $this->relatedJobPositionsService->relatedJobPositions('PHP Developer', 'English', 10);
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

## Related Job Positions Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "80d0a822-0e2a-40e1-97fd-e7fd62ec9eb0",
    "attributes": {
      "status": "success",
      "type": "hr_related_job_positions",
      "result": {
        "job_position": "Flutter Mobile Developer",
        "related_job_positions": [
          {
            "name": "Android Developer",
            "weight": 8
          },
          {
            "name": "iOS Developer",
            "weight": 8.5
          },
          {
            "name": "MOBILE APP DEVELOPER",
            "weight": 9.5
          },
          {
            "name": "React Native Developer",
            "weight": 7.5
          },
          {
            "name": "Mobile-Entwickler für Flutter",
            "weight": 10
          },
          {
            "name": "Flutter-App-Entwickler",
            "weight": 9
          },
          {
            "name": "Mobile-App-Entwickler (Flutter)",
            "weight": 8
          },
          {
            "name": "Flutter-Entwickler",
            "weight": 10
          },
          {
            "name": "Cross-Platform Mobile Developer",
            "weight": 7
          },
          {
            "name": "Mobile-App-Entwickler",
            "weight": 9
          },
          {
            "name": "Mobile-Entwickler",
            "weight": 8
          },
          {
            "name": "App-Entwickler",
            "weight": 7
          },
          {
            "name": "iOS-Entwickler",
            "weight": 6
          },
          {
            "name": "Flutter Entwickler",
            "weight": 10
          },
          {
            "name": "Mobile App Entwickler",
            "weight": 9
          },
          {
            "name": "Android Entwickler",
            "weight": 8
          },
          {
            "name": "iOS Entwickler",
            "weight": 7.5
          }
        ]
      }
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-hr-related-job-positions/issues)
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