# AI Content Translator for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-translate.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-translate)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-translate.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-translate)

This package provides a Laravel integration for the SharpAPI Content Translation service. It allows you to translate text to different languages with AI-powered accuracy, which is perfect for multilingual applications, content localization, and more.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-content-translate
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-content-translate"
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
use SharpAPI\ContentTranslate\ContentTranslateService;

$service = new ContentTranslateService();

// Translate text to a different language
$translatedText = $service->translate(
    'Hello, how are you today?',
    'Spanish', // target language
    'friendly', // optional voice tone
    'casual conversation' // optional context
);

// $translatedText will contain the translated text as a string
```

## Parameters

- `text` (string): The text content to translate
- `language` (string): The target language for translation
- `voiceTone` (string|null): The tone of voice for the translation (e.g., professional, casual, friendly)
- `context` (string|null): Additional context to improve translation accuracy

## Response Format

```json
{
    "data": {
        "type": "api_job_result",
        "id": "5de4887a-0dfd-49b6-8edb-9280e468c210",
        "attributes": {
            "status": "success",
            "type": "content_translate",
            "result": {
                "content": "The rise in sea levels threatens to engulf the Maldives where fresh water is already starting to run out, but the new president of the Indian Ocean archipelago refuses any relocation of its population abroad. In an interview with AFP, President Mohamed Muizzu, a 45-year-old civil engineering graduate trained in the United Kingdom, instead promises an ambitious program of land rehabilitation and island elevation, which environmental organizations criticize.",
                "to_language": "English",
                "from_language": "French"
            }
        }
    }
}

## Supported Languages

The service supports a wide range of languages, including but not limited to:
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Chinese
- Japanese
- Arabic
- And many more

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.