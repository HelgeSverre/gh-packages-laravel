# AI Content Proofreader for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-content-proofread.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-proofread)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-content-proofread.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-content-proofread)

This package provides a Laravel integration for the SharpAPI Content Proofreading service. It allows you to check and correct grammar, spelling, and style issues in text content, which is perfect for ensuring high-quality content in your applications.

## Installation

You can install the package via composer:

```bash
composer require sharpapi/laravel-content-proofread
```

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="sharpapi-content-proofread"
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
use SharpAPI\ContentProofread\ContentProofreadService;

$service = new ContentProofreadService();

// Proofread text
$proofreadText = $service->proofread(
    'This text has some gramatical errors and typos that need to be corected.'
);

// $proofreadText will contain the corrected text as a string
```

## Parameters

- `text` (string): The text content to proofread and check for grammar issues

## Response Format

```json
{
    "data": {
        "type": "api_job_result",
        "id": "2432f9ee-528a-4709-9916-2ab031df27ab",
        "attributes": {
            "status": "success",
            "type": "content_proofread",
            "result": "Red Bull's Max Verstappen says this weekend's Las Vegas Grand Prix is \"99% show and 1% sporting event\". \n\n The triple world champion said he is \"not looking forward\" to the razzmatazz around the race, the first time Formula 1 cars have raced down the city's famous Strip. \n\n Other leading drivers were more equivocal about the hype.\n\n Aston Martin's Fernando Alonso said: \"With the investment that has been made and the place we are racing, it deserves a little bit [of] different treatment and extra show.\" \n\n The weekend was kick-started on Wednesday evening with a lavish opening ceremony.\n\n It featured performances from several music stars, including Kylie Minogue and Journey, and culminated in the drivers being introduced to a sparsely populated crowd in rain by being lifted into view on hydraulic platforms under a sound-and-light show. \n\n Lewis Hamilton said: \"It's amazing to be here. It is exciting - such an incredible place, so many lights, a great energy, a great buzz. \n\n \"This is one of the most iconic cities there is.  It is a big show, for sure. It is never going to be like Silverstone [in terms of history and purity]. But maybe over time the people in the community here will grow to love the sport.\" \n\n Hamilton added: \"It is a business, ultimately. You'll still see good racing here. \n\n \"Maybe the  track will be good, maybe it will be bad. It was so-so on the [simulator]. Don't knock it 'til you try it. I hear there are a lot of people complaining about the direction [F1 president] Stefano [Domenicali] and [owners] Liberty have been going [but] I think they have been doing an amazing job.\""
        }
    }
}

## Features

- Corrects spelling errors
- Fixes grammatical mistakes
- Improves sentence structure
- Enhances readability
- Maintains the original meaning of the text

## Credits

- [Dawid Makowski](https://github.com/dawidmakowski)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.