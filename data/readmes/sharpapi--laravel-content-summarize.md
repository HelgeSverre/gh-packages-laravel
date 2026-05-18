![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# Content Summarize API for Laravel

## 🚀 Powerful AI text summarization capabilities for your Laravel applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-summarize.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-summarize)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-summarize.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-summarize)

Check the details at SharpAPI's [Content Summarize API](https://sharpapi.com/en/catalog/content/content-summarize) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Content Summarize API package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-content-summarize
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-content-summarize
```

---
## Key Features

- **Text Summarization**: Generate concise summaries of long-form content
- **Customizable Length**: Control the length of the generated summaries
- **Multi-language Support**: Summarize content in multiple languages
- **Preserve Key Information**: Maintain the most important points from the original text
- **AI-Powered**: Leverage advanced AI models for high-quality summarization

---

## Usage

You can inject the `ContentSummarizeService` class to access the text summarization functionality.

### Basic Workflow

1. **Summarize Text**: Use the service to generate concise summaries of your content.

---

### Controller Example

Here is an example of how to use `ContentSummarizeService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\ContentSummarize\ContentSummarizeService;

class SummarizeController extends Controller
{
    protected ContentSummarizeService $summarizeService;

    public function __construct(ContentSummarizeService $summarizeService)
    {
        $this->summarizeService = $summarizeService;
    }

    /**
     * @throws GuzzleException
     */
    public function summarizeText(string $text)
    {
        $result = $this->summarizeService->summarize($text);
        
        return response()->json($result);
    }

    /**
     * @throws GuzzleException
     */
    public function summarizeWithOptions(string $text)
    {
        $options = [
            'max_length' => 200,
            'language' => 'en',
        ];
        
        $result = $this->summarizeService->summarize($text, $options);
        
        return response()->json($result);
    }
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $result = $this->summarizeService->summarize($longText);
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

## Response Format

```json
{
    "data": {
        "type": "api_job_result",
        "id": "5fa45f0e-6680-4f64-8528-3f085a87bd2f",
        "attributes": {
            "status": "success",
            "type": "content_summarize",
            "result": {
                "summary": "Max Verstappen thinks the Las Vegas Grand Prix is more showbiz than sport, while Lewis Hamilton and Fernando Alonso are soaking up the glitz. Expect hydraulic platforms, light shows, and maybe some racing. Don't knock it 'til you try it!"
            }
        }
    }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-content-summarize/issues)
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