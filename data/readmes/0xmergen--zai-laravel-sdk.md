# ZAI Laravel SDK

[![Latest Version](https://img.shields.io/packagist/v/0xmergen/zai-laravel-sdk)](https://packagist.org/packages/0xmergen/zai-laravel-sdk)
[![License](https://img.shields.io/packagist/l/0xmergen/zai-laravel-sdk)](LICENSE)
[![Total Downloads](https://img.shields.io/packagist/dt/0xmergen/zai-laravel-sdk)](https://packagist.org/packages/0xmergen/zai-laravel-sdk)
[![PHP](https://img.shields.io/packagist/php-v/0xmergen/zai-laravel-sdk)](https://packagist.org/packages/0xmergen/zai-laravel-sdk)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com/docs/12.x)

A powerful, elegant Laravel SDK for [Z.AI](https://api.z.ai) (Zhipu AI) API. Integrate advanced AI capabilities including chat completion, image generation, and OCR layout parsing into your Laravel applications with type-safe DTOs, fluent interfaces, and comprehensive error handling.

## Features

- **Chat Completion** - Support for GLM-4.7, GLM-4.6, GLM-4.6V, GLM-4.5 series with thinking mode, tools/function calling, and streaming responses
- **Vision (Multimodal)** - Image and video understanding with GLM-4.6V series for document analysis, frontend replication, and visual search
- **Image Generation** - Generate images using `glm-image` and `cogview-4-250304` models with customizable quality and size
- **OCR & Layout Parsing** - Extract text, tables, and formulas from PDFs and images with detailed layout information
- **Type-Safe DTOs** - Request/Response objects with full PHP type hints and fluent builders
- **Smart Validation** - Pre-request validation based on model capabilities
- **Comprehensive Error Handling** - Structured exceptions with retry detection and detailed error codes
- **Laravel Integration** - Facade, Dependency Injection, and Artisan command support

## Requirements

- **PHP**: 8.4 or higher
- **Laravel**: 12.0 or higher
- **Extensions**: `json`, `curl`

## Installation

Install the package via Composer:

```bash
composer require 0xmergen/zai-laravel-sdk
```

### Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=zai-sdk-config
```

Add your API key to your `.env` file:

```env
ZAI_API_KEY=your_api_key_here
```

> You can obtain an API key from [https://api.z.ai](https://api.z.ai)

### Optional Configuration

All configuration options in `config/zai-sdk.php` have sensible defaults:

```env
# Override default API endpoints if needed
ZAI_BASE_URL=https://api.z.ai/api/paas/v4/chat/completions
ZAI_IMAGE_BASE_URL=https://api.z.ai/api/paas/v4/images/generations
ZAI_OCR_BASE_URL=https://api.z.ai/api/paas/v4/layout_parsing

# Default model for chat completion
ZAI_DEFAULT_MODEL=glm-4.7

# Request timeout (seconds)
ZAI_TIMEOUT=30

# Retry configuration
ZAI_RETRY_TIMES=2
ZAI_RETRY_SLEEP=100
```

## Usage

### Chat Completion

#### Basic Chat

```php
use Zai\LaravelSdk\Facades\ZaiSdk;
use Zai\LaravelSdk\DataTransferObjects\ChatCompletionRequest;
use Zai\LaravelSdk\Constants\ChatModel;

$request = ChatCompletionRequest::make(
    model: ChatModel::GLM_4_7,
    messages: [
        ['role' => 'user', 'content' => 'Explain quantum computing in simple terms.']
    ]
);

$response = ZaiSdk::chatCompletion($request);

echo $response->content();
// "Quantum computing is a type of computation that..."
```

#### With Parameters

```php
$request = ChatCompletionRequest::make(ChatModel::GLM_4_7, $messages)
    ->withTemperature(0.7)       // 0.0 - 1.0 (default varies by model)
    ->withTopP(0.9)              // 0.01 - 1.0
    ->withMaxTokens(2000)        // Maximum tokens to generate
    ->withUser('user-123');      // User identifier for tracking
```

#### Streaming Responses

```php
$request = ChatCompletionRequest::make(ChatModel::GLM_4_7, $messages)
    ->withStreaming();

foreach (ZaiSdk::chatCompletionStream($request) as $chunk) {
    echo $chunk;        // Stream each chunk as it arrives
    ob_flush();
    flush();
}
```

#### Thinking Mode

Enable reasoning for complex tasks (supported models only):

```php
$request = ChatCompletionRequest::make(ChatModel::GLM_4_7, $messages)
    ->withThinking('enabled');   // or 'disabled'

$response = ZaiSdk::chatCompletion($request);

// Access reasoning content
echo $response->reasoningContent();  // Chain-of-thought reasoning
echo $response->content();           // Final answer
```

#### Function / Tool Calling

```php
$request = ChatCompletionRequest::make(ChatModel::GLM_4_7, $messages)
    ->withTools([
        [
            'type' => 'function',
            'function' => [
                'name' => 'get_weather',
                'description' => 'Get the current weather for a location',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'location' => [
                            'type' => 'string',
                            'description' => 'City name, e.g. San Francisco'
                        ]
                    ],
                    'required' => ['location']
                ]
            ]
        ]
    ])
    ->withToolChoice('auto');

$response = ZaiSdk::chatCompletion($request);

if ($response->hasToolCalls()) {
    foreach ($response->toolCalls() as $toolCall) {
        echo $toolCall->function->name;               // 'get_weather'
        print_r($toolCall->function->argumentsAsArray());  // ['location' => 'Tokyo']
    }
}
```

#### JSON Mode

Force JSON output:

```php
$request = ChatCompletionRequest::make(ChatModel::GLM_4_7, $messages)
    ->withResponseFormat('json');

$response = ZaiSdk::chatCompletion($request);
$data = json_decode($response->content(), true);
```

### Image Generation

#### Basic Image Generation

```php
use Zai\LaravelSdk\Facades\ZaiSdk;
use Zai\LaravelSdk\DataTransferObjects\ImageGenerationRequest;
use Zai\LaravelSdk\Constants\ImageModel;

$request = ImageGenerationRequest::make(
    model: ImageModel::GLM_IMAGE,
    prompt: 'A serene mountain landscape at sunset, digital art style'
);

$response = ZaiSdk::imageGeneration($request);

echo $response->imageUrl();  // URL to the generated image (expires in 30 days)
```

#### Custom Size and Quality

```php
$request = ImageGenerationRequest::make(ImageModel::GLM_IMAGE, $prompt)
    ->withQuality(ImageModel::QUALITY_HD)     // 'hd' or 'standard'
    ->withSize('1728x960')                    // Width x Height
    ->withUser('user-123');

// Recommended sizes for glm-image:
// 1280x1280, 1568x1056, 1056x1568, 1472x1088, 1088x1472, 1728x960, 960x1728
```

#### Multiple Images

```php
$urls = $response->imageUrls();  // Array of all generated image URLs
foreach ($urls as $url) {
    echo $url . "\n";
}
```

### OCR / Layout Parsing

Extract structured data from PDFs and images:

```php
use Zai\LaravelSdk\Facades\ZaiSdk;
use Zai\LaravelSdk\DataTransferObjects\LayoutParsingRequest;
use Zai\LaravelSdk\Constants\OcrModel;

// From URL or base64
$request = LayoutParsingRequest::make('https://example.com/document.pdf')
    ->withPageRange(1, 5)                 // Pages 1-5 only
    ->withLayoutVisualization()           // Get visual layout images
    ->withRequestId('unique-request-id')
    ->withUserId('user-123');

$response = ZaiSdk::layoutParsing($request);

// Get Markdown format
echo $response->md_results();

// Extract specific elements
$tables = $response->tables();           // All tables across pages
$images = $response->images();           // All detected images
$texts = $response->allTextContent();    // All text elements

// Page-specific access
$elements = $response->pageElements(1);   // Elements on page 1
echo "Page 1 has " . $response->elementCount(1) . " elements";

// Access individual element details
foreach ($elements as $element) {
    if ($element->isTable()) {
        echo "Table at: " . json_encode($element->boundingBox()) . "\n";
        echo "Content: " . $element->content . "\n";
    }
}

// Document info
echo "Total pages: " . $response->data_info->num_pages;
```

### Dependency Injection

```php
use Zai\LaravelSdk\ZaiSdk;
use Zai\LaravelSdk\DataTransferObjects\ChatCompletionRequest;

class ChatService
{
    public function __construct(
        private readonly ZaiSdk $zai
    ) {}

    public function generateResponse(string $userMessage): string
    {
        $request = ChatCompletionRequest::make('glm-4.7', [
            ['role' => 'user', 'content' => $userMessage]
        ]);

        $response = $this->zai->chatCompletion($request);

        return $response->content();
    }
}
```

### Artisan Command

Check your SDK configuration:

```bash
php artisan zai:info
```

Output:
```
ZAI Laravel SDK

+---------+-----------------------------------------+
| Property | Value                                   |
+---------+-----------------------------------------+
| Name     | ZAI Laravel SDK                         |
| Version  | 1.0.0                                   |
| API URL  | https://api.z.ai/api/paas/v4/...        |
| API Key  | sk-abc123...xyz9                        |
+---------+-----------------------------------------+
```

## Available Models

### Chat Models

| Model | Context | Max Tokens | Thinking | Tools | Vision |
|-------|---------|------------|----------|-------|--------|
| `glm-4.7` | 128K | 131,072 | ✅ | ✅ | ❌ |
| `glm-4.7-flash` | 128K | 131,072 | ✅ | ✅ | ❌ |
| `glm-4.7-flashx` | 128K | 131,072 | ✅ | ✅ | ❌ |
| `glm-4.6` | 200K | 131,072 | ✅ | ✅ | ✅ |
| `glm-4.6v-flash` | 128K | 131,072 | ✅ | ✅ | ✅ |
| `glm-4.5` | 128K | 98,304 | ✅ | ✅ | ✅ |
| `glm-4.5-air` | 128K | 98,304 | ✅ | ✅ | ❌ |
| `glm-4.5-x` | 128K | 98,304 | ✅ | ✅ | ❌ |
| `glm-4.5-airx` | 128K | 98,304 | ✅ | ✅ | ❌ |
| `glm-4.5-flash` | 128K | 98,304 | ✅ | ✅ | ❌ |
| `glm-4-32b-0414-128k` | 128K | 16,384 | ❌ | ❌ | ❌ |

### Image Models

| Model | Default Size | Max Size | HD Quality |
|-------|--------------|----------|------------|
| `glm-image` | 1280x1280 | 2048x2048 | ✅ |
| `cogview-4-250304` | 1024x1024 | 2048x2048 | ❌ |

### OCR Models

| Model | Supported Formats | Max Pages |
|-------|-------------------|-----------|
| `glm-ocr` | PDF, JPG, PNG | 100 |

## Error Handling

The SDK provides structured exceptions for different error scenarios:

```php
use Zai\LaravelSdk\Exceptions\{
    ZaiApiException,
    ZaiAuthenticationException,
    ZaiRateLimitException,
    ZaiValidationException
};

try {
    $response = ZaiSdk::chatCompletion($request);
} catch (ZaiAuthenticationException $e) {
    // Invalid API key, expired token, etc.
    logger()->error('ZAI Authentication failed: ' . $e->getMessage());
} catch (ZaiRateLimitException $e) {
    // Rate limit exceeded, high concurrency, etc.
    logger()->warning('ZAI rate limit: ' . $e->getMessage());

    // Check if retryable
    if ($e->isRetryable()) {
        sleep(1);
        // Retry request
    }
} catch (ZaiValidationException $e) {
    // Invalid parameters, unsupported model, etc.
    logger()->error('Validation error: ' . $e->getMessage());
} catch (ZaiApiException $e) {
    // General API error
    logger()->error('ZAI error: ' . $e->getMessage());
    logger()->error('Error code: ' . $e->errorCode);
}
```

## Testing

The package includes Pest tests. Run them with:

```bash
composer test
```

Or via Pest directly:

```bash
./vendor/bin/pest
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [0xmergen](https://github.com/0xmergen)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.

## Author

Made with ❤️ by [0xmergen](https://github.com/0xmergen)

- **Twitter**: [@0xm3rg3n](https://x.com/0xm3rg3n)
- **GitHub**: [0xmergen](https://github.com/0xmergen)
