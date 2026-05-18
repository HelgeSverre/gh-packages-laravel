![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# Web Scraping API for Laravel

## 🚀 Powerful web scraping capabilities for your Laravel applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-web-scraping-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-web-scraping-api)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-web-scraping-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-web-scraping-api)

Check the details at SharpAPI's [Web Scraping API](https://sharpapi.com/en/catalog/utility/web-scraping-api) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Web Scraping API package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-web-scraping-api
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-web-scraping-api
```

---
## Key Features

- **HTML Extraction**: Extract the full HTML content of any webpage.
- **Structured Data Extraction**: Extract specific elements from webpages using CSS selectors.
- **Screenshot Capture**: Take screenshots of webpages.
- **Link Extraction**: Extract all links from a webpage.
- **Image Extraction**: Extract all images from a webpage.
- **JavaScript Rendering**: Properly render JavaScript-heavy websites.
- **Proxy Support**: Use proxies to avoid IP blocking.

---

## Usage

You can inject the `WebScrapingApiService` class to access the web scraping functionality.

### Basic Workflow

1. **Scrape a Webpage**: Use `scrapeWebpage` to get the full HTML content of a webpage.
2. **Extract Structured Data**: Use `extractStructuredData` to extract specific elements from a webpage using CSS selectors.
3. **Take a Screenshot**: Use `takeScreenshot` to capture a screenshot of a webpage.
4. **Extract Links**: Use `extractLinks` to extract all links from a webpage.
5. **Extract Images**: Use `extractImages` to extract all images from a webpage.

---

### Controller Example

Here is an example of how to use `WebScrapingApiService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\WebScrapingApi\WebScrapingApiService;

class ScrapingController extends Controller
{
    protected WebScrapingApiService $scrapingService;

    public function __construct(WebScrapingApiService $scrapingService)
    {
        $this->scrapingService = $scrapingService;
    }

    /**
     * @throws GuzzleException
     */
    public function scrapeWebpage(string $url)
    {
        $result = $this->scrapingService->scrapeWebpage($url);
        
        return response()->json($result);
    }

    /**
     * @throws GuzzleException
     */
    public function extractData(string $url)
    {
        $selectors = [
            'title' => 'h1',
            'paragraphs' => 'p',
            'links' => 'a',
        ];
        
        $result = $this->scrapingService->extractStructuredData($url, $selectors);
        
        return response()->json($result);
    }

    /**
     * @throws GuzzleException
     */
    public function takeScreenshot(string $url)
    {
        $options = [
            'width' => 1280,
            'height' => 800,
            'fullPage' => true,
        ];
        
        $result = $this->scrapingService->takeScreenshot($url, $options);
        
        return response()->json($result);
    }

    /**
     * @throws GuzzleException
     */
    public function extractLinks(string $url)
    {
        $result = $this->scrapingService->extractLinks($url);
        
        return response()->json($result);
    }

    /**
     * @throws GuzzleException
     */
    public function extractImages(string $url)
    {
        $result = $this->scrapingService->extractImages($url);
        
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
    $result = $this->scrapingService->scrapeWebpage('https://example.com');
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

## Web Scraping Data Format Example

```json
{
  "url": "https://sharpapi.com/",
  "timestamp": "2025-03-15T08:56:04.946195Z",
  "scraped_data": {
    "title": "AI-powered Workflow Automation API",
    "detected_language": "en",
    "headers": {
      "charset": "utf-8",
      "contentType": null,
      "viewport": ["width=device-width", "initial-scale=1"],
      "canonical": "https://sharpapi.com/",
      "csrfToken": "ju6SYrG2vXRDCBVCXYQ1RWH5dn1qxnFmHC7dqNc9"
    },
    "meta_tags": {
      "author": null,
      "image": null,
      "keywords": ["SharpAPI", "AI", "automation", "API"],
      "description": "Leverage AI API to streamline workflow in E-Commerce, Marketing, Content Management, HR Tech, Travel, and more."
    },
    "open_graph": {
      "og:title": "AI-powered Workflow Automation API",
      "og:type": "website",
      "og:URL": "https://sharpapi.com",
      "og:image": "https://sharpapi.com/build/assets/sharpapi-website-preview-ARuIroBi.png",
      "og:description": "Leverage AI API to streamline workflow in E-Commerce, Marketing, Content Management, HR Tech, Travel, and more."
    },
    "twitter_card": {
      "twitter:card": "summary",
      "twitter:site": "@sharpapi",
      "twitter:creator": "@a2zwebltd"
    },
    "content_structured": [
      {
        "tag": "h1",
        "content": "Automate workflows with AI-powered API"
      },
      {
        "tag": "h2",
        "content": "Leverage AI API for automation in E-Commerce, Marketing, Content Management, HR Tech, Travel, and more."
      }
    ],
    "links": {
      "internal": ["https://sharpapi.com/register", "https://sharpapi.com/en/catalog"],
      "external": ["https://github.com/sharpapi/", "https://chatgpt.com/g/g-4P3SFFu6Q-sharpapi-com-automate-with-ai"]
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-web-scraping-api/issues)
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