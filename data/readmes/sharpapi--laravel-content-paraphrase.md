# AI Content Paraphraser for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-paraphrase.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-paraphrase)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-paraphrase.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-paraphrase)

This package provides a Laravel integration for the SharpAPI Content Paraphrasing service. It allows you to rewrite text while maintaining its original meaning, which is perfect for creating unique content variations, avoiding plagiarism, and improving content readability.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-content-paraphrase
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-content-paraphrase"
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
use SharpAPI\ContentParaphrase\ContentParaphraseService;

$service = new ContentParaphraseService();

// Paraphrase text
$paraphrasedText = $service->paraphrase(
    'The quick brown fox jumps over the lazy dog.',
    'English', // optional language
    100, // optional max length
    'professional', // optional voice tone
    'blog post' // optional context
);

// $paraphrasedText will contain the paraphrased text as a string
```

## Parameters

- `text` (string): The text content to paraphrase
- `language` (string|null): The language for the paraphrased text (default: English)
- `maxLength` (int|null): Maximum length of the paraphrased text
- `voiceTone` (string|null): The tone of voice for the paraphrased text (e.g., professional, casual, friendly)
- `context` (string|null): Additional context to improve paraphrasing quality

## Response Format

```json
{
    "data": {
        "type": "api_job_result",
        "id": "385fec60-e73e-458c-a6c9-6e76e5a76661",
        "attributes": {
            "status": "success",
            "type": "content_paraphrase",
            "result": {
                "paraphrase": "Max Verstappen of Red Bull remarks that the Las Vegas Grand Prix is '99% show and 1% sport.' The triple world champion isn't thrilled about the spectacle, marking the first F1 race on the city's Strip. Other drivers, like Fernando Alonso, acknowledge the unique investment and setting. The event began with a grand ceremony featuring stars like Kylie Minogue. Bob Hamilton expressed excitement about the iconic city, noting the blend of show and sport, and praised F1's direction under Stefano Domenicali and Liberty."
            }
        }
    }
}

## Features

- Maintains the original meaning of the text
- Adjusts the writing style based on the specified voice tone
- Supports multiple languages
- Can limit the length of the output text
- Provides context-aware paraphrasing for better results

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.