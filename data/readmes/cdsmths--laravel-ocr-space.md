
[![Latest Version on Packagist](https://img.shields.io/packagist/v/cdsmths/laravel-ocr-space.svg?style=flat-square)](https://packagist.org/packages/cdsmths/laravel-ocr-space)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/cdsmths/laravel-ocr-space/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/cdsmths/laravel-ocr-space/actions/workflows/tests.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/cdsmths/laravel-ocr-space/formats.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/cdsmths/laravel-ocr-space/actions?query=workflow%3A"formats"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/cdsmths/laravel-ocr-space.svg?style=flat-square)](https://packagist.org/packages/cdsmths/laravel-ocr-space)

![laravel-ocr-space-social-card](https://github.com/user-attachments/assets/4333e2bc-1f5c-401f-9646-76bb57314057)

# Laravel OCR Space

Laravel OCR Space is a package that allows you to use the [OCR.Space](https://ocr.space/ocrapi) API in your Laravel application for Optical Character Recognition (OCR).

## Installation

You can install the package via composer:

```bash
composer require cdsmths/laravel-ocr-space
```

You can publish the config file with:

```bash
php artisan vendor:publish --provider="Codesmiths\LaravelOcrSpace\LaravelOcrSpaceServiceProvider" --tag="laravel-ocr-space"
```

## Usage

### Get a free Ocr.Space api key

You can get a free api key from [ocr.space](https://ocr.space/ocrapi/freekey). This key is required to use the package.

You should add this key to your `.env`:

```
OCR_SPACE_API_KEY="YOUR API KEY"
```

### Parsing an Image file

```php
use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Facades\OcrSpace;

$filePath = 'path/to/image.jpg';

$result = OcrSpace::parseImageFile(
    $filePath,
    OcrSpaceOptions::make(),
);

dd($result);
```

### Parsing an Image URL

```php
use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Facades\OcrSpace;

$imageUrl = 'https://example.com/image.jpg';

$options = new \Codesmiths\LaravelOcrSpace\OcrSpaceOptions();

$result = OcrSpace::parseImageUrl(
    $imageUrl,
    OcrSpaceOptions::make(),
);

dd($result);
```

### Parsing an base64 encoded image

```php
use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Facades\OcrSpace;

$base64Image = 'base64 encoded image';

$result = OcrSpace::parseBase64Image(
    $base64Image,
    OcrSpaceOptions::make(),
);

dd($result);
```

### Parsing an binary image

```php

use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Facades\OcrSpace;

$binaryImage = file_get_contents('path/to/image.jpg');

// File type is required for binary images
$options = OcrSpaceOptions::make()
    ->fileType('image/jpg');

$result = OcrSpace::parseBinaryImage(
    $binaryImage,
    $options,
);

dd($result);
```

### Parsing with parseImage method

```php
use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Facades\OcrSpace;
use Codesmiths\LaravelOcrSpace\Enums\InputType;

$filePath = 'path/to/image.jpg';

$result = OcrSpace::parseImage(
    InputType::File
    $filePath,
    OcrSpaceOptions::make(),
);

dd($result);
```

### Options

You can pass options to the `parseImageFile`, `parseImageUrl`, `parseBase64Image`, `parseBinaryImage` and `parseImage` methods.

```php
use Codesmiths\LaravelOcrSpace\OcrSpaceOptions;
use Codesmiths\LaravelOcrSpace\Enums\Language;
use Codesmiths\LaravelOcrSpace\Enums\OcrSpaceEngine;

// All possible options
$options = OcrSpaceOptions::make()
        ->language(Language::English)
        ->overlayRequired(true)
        ->fileType('image/png')
        ->detectOrientation(true)
        ->isCreateSearchablePdf(true)
        ->isSearchablePdfHideTextLayer(true)
        ->scale(true)
        ->isTable(true)
        ->OCREngine(OcrSpaceEngine::Engine1); // Engine1, Engine2, or Engine3

```

#### OCR Engines

OCR.Space provides three different OCR engines:

- **Engine1**: The original OCR engine, best for standard documents
- **Engine2**: Improved OCR engine with better accuracy for most use cases
- **Engine3**: The latest engine with significantly superior text recognition capabilities

You can specify which engine to use:

```php
use Codesmiths\LaravelOcrSpace\Enums\OcrSpaceEngine;

// Use Engine 1
$options = OcrSpaceOptions::make()->ocrEngine(OcrSpaceEngine::Engine1);

// Use Engine 2
$options = OcrSpaceOptions::make()->ocrEngine(OcrSpaceEngine::Engine2);

// Use Engine 3 (recommended for best accuracy)
$options = OcrSpaceOptions::make()->ocrEngine(OcrSpaceEngine::Engine3);
```

### Response

All methods return an instance of `Codesmiths\LaravelOcrSpace\OcrSpaceResponse` which has the following methods:

```php
$response->getParsedResults(); // Returns an Collection `ParsedResult`
$response->getOCRExitCode(); // Returns the exit code
$response->getIsErroredOnProcessing(); // Returns a boolean
$response->getErrorMessage(); // Returns the error message
$response->getErrorMessageDetails(); // Returns the error message details
$response->getProcessingTimeInMilliseconds(); // Returns the processing time in milliseconds
$response->getSearchablePdfUrl(); // Returns the searchable pdf url
$response->hasSearchablePdfUrl(); // Returns if the response has a searchable pdf url
$response->hasError(); // Returns if the response has an error
$response->hasParsedResults(); // Returns if the response has parsed results
```

### Parsed Results

If you want to get value from `getParsedResults()`, you can use the following methods:

```php
$parsedResults = $response->getParsedResults();

$parsedResults->first()->getParsedText(), // Returns the parsed text from the first parsed result
$parsedResults->first()->getTextOverlay(), // Returns the text overlay from the first parsed result
$parsedResults->first()->getFileParseExitCode(), // Returns the file parse exit code from the first parsed result
$parsedResults->first()->getErrorMessage(), // Returns the error message from the first parsed result
$parsedResults->first()->getErrorDetails(), // Returns the error message details from the first parsed result
$parsedResults->first()->getSerializedParsedText(), // Returns the serialized parsed text from the first parsed result
```


# License / Credits

This package our Codesmiths is not affiliated with [OCR.Space](https://ocr.space/ocrapi) and is not an official package. It is a wrapper around the OCR.Space API.

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
