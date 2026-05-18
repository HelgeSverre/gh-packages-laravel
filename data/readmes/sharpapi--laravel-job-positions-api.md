![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# Job Positions Database API for Laravel

## 🚀 Access a comprehensive database of job positions for your Laravel applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-job-positions-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-job-positions-api)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-job-positions-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-job-positions-api)

Check the details at SharpAPI's [Job Positions API](https://sharpapi.com/en/catalog/utility/job-positions-api) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Job Positions API package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-job-positions-api
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-job-positions-api
```

---
## Key Features

- **Job Position Search**: Search for job positions by title or keyword.
- **Job Position Details**: Get detailed information about specific job positions.

---

## Usage

You can inject the `JobPositionsApiService` class to access the job positions database functionality.

### Basic Workflow

1. **Search for Job Positions**: Use `searchJobPositions` to find job positions by title or keyword.
2. **Get Job Position Details**: Use `getJobPositionById` to get detailed information about a specific job position.

---

### Controller Example

Here is an example of how to use `JobPositionsApiService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\JobPositionsApi\JobPositionsApiService;

class JobPositionsController extends Controller
{
    protected JobPositionsApiService $jobPositionsService;

    public function __construct(JobPositionsApiService $jobPositionsService)
    {
        $this->jobPositionsService = $jobPositionsService;
    }

    /**
     * @throws GuzzleException
     */
    public function searchJobPositions(string $query)
    {
        $results = $this->jobPositionsService->searchJobPositions($query);
        
        return response()->json($results);
    }

    /**
     * @throws GuzzleException
     */
    public function getJobPositionDetails(string $positionId)
    {
        $position = $this->jobPositionsService->getJobPositionById($positionId);
        
        return response()->json($position);
    }
    
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $positions = $this->jobPositionsService->searchJobPositions('developer');
} catch (ClientException $e) {
    echo $e->getMessage();
}
```

---

## Optional Configuration

You can customize the configuration by setting the following environment variables in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
SHARP_API_BASE_URL=https://sharpapi.com/api/v1
```

---

## Job Position Data Format Example

```json
{
  "data": {
    "id": "18f73cda-db62-454b-aa53-aa26acb196b7",
    "name": "Billing Manager",
    "slug": "billing-manager",
    "related_job_positions": [
      {
        "id": "445b1023-2c3c-41c4-a986-08d8400e52a5",
        "name": "Accounts Receivable Manager",
        "slug": "accounts-receivable-manager",
        "weight": 9
      },
      {
        "id": "f6749359-de3a-4c32-ac31-75e059197a0f",
        "name": "Billing Coordinator",
        "slug": "billing-coordinator",
        "weight": 8
      },
      {
        "id": "bd8f8374-a717-4474-be41-5582a67b4ff9",
        "name": "Billing Supervisor",
        "slug": "billing-supervisor",
        "weight": 9.5
      }
    ]
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-job-positions-api/issues)
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