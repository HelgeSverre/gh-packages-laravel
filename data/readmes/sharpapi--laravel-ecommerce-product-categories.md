![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Product Categories Generator for Laravel

## 🚀 Leverage AI API to generate product categories for E-commerce applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-ecommerce-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-product-categories)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-ecommerce-product-categories.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-ecommerce-product-categories)

Check the details at SharpAPI's [E-commerce API](https://sharpapi.com/en/catalog/ai/e-commerce) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Product Categories Generator package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-ecommerce-product-categories
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-ecommerce-product-categories
```

---
## Key Features

- **AI-Powered Category Generation**: Efficiently generate relevant categories for products with relevance scores.
- **Multi-language Support**: Generate product categories in multiple languages.
- **Customizable Output**: Control the number of categories returned and the voice tone.
- **Context-Aware Categorization**: Provide context to improve category relevance.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `EcommerceProductCategoriesService` class to access product categories generation functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Dispatch Job**: Send a product name to the API using `productCategories`, which returns a status URL.
2. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
3. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `EcommerceProductCategoriesService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\EcommerceProductCategories\EcommerceProductCategoriesService;

class ProductController extends Controller
{
    protected EcommerceProductCategoriesService $productCategoriesService;

    public function __construct(EcommerceProductCategoriesService $productCategoriesService)
    {
        $this->productCategoriesService = $productCategoriesService;
    }

    /**
     * @throws GuzzleException
     */
    public function getProductCategories(string $productName)
    {
        $statusUrl = $this->productCategoriesService->productCategories(
            $productName,
            'English',   // optional language
            5,   // optional maximum quantity
            'Tech-savvy',   // optional voice tone
            'Electronics, Gadgets'   // optional context
        );
        
        $result = $this->productCategoriesService->fetchResults($statusUrl);

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
    $statusUrl = $this->productCategoriesService->productCategories('Sony PlayStation 5', 'English', 5);
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

## Product Categories Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "6d3fec8c-34f8-4071-a5ba-af14910b4d77",
    "attributes": {
      "status": "success",
      "type": "ecommerce_product_categories",
      "result": [
        {
          "name": "Gaming Laptops",
          "weight": 10
        },
        {
          "name": "Razer Laptops",
          "weight": 10
        },
        {
          "name": "High-Performance Laptops",
          "weight": 9.5
        },
        {
          "name": "Laptops",
          "weight": 9
        },
        {
          "name": "Razer Gear",
          "weight": 8.5
        },
        {
          "name": "Electronics",
          "weight": 8
        },
        {
          "name": "Computers & Accessories",
          "weight": 7.5
        },
        {
          "name": "PC Gaming",
          "weight": 7
        },
        {
          "name": "Portable Computers",
          "weight": 6.5
        },
        {
          "name": "Tech Gadgets",
          "weight": 6
        }
      ]
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-ecommerce-product-categories/issues)
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