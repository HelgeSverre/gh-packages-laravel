![Apertus Logo](./assets/images/header.png)

# Laravel Client for Apertus LLM

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mmorand/laravel-apertus.svg?style=flat-square)](https://packagist.org/packages/mmorand/laravel-apertus)
[![Total Downloads](https://img.shields.io/packagist/dt/mmorand/laravel-apertus.svg?style=flat-square)](https://packagist.org/packages/mmorand/laravel-apertus)

The Apertus AI PHP Client enables seamless integration with the Apertus AI API, providing straightforward access to Swiss AI models for chat completions and model management.

More informations about Apertus AI can be found on their [website](https://www.swiss-ai.org/apertus) and [API Reference](https://platform.publicai.co/api).

## Features

- ✅ **Chat Completions** - Full conversation support with streaming
- ✅ **Model Management** - List available models
- ✅ **Laravel Integration** - Native Laravel support with Facades
- ✅ **Type Safety** - Fully typed DTOs using Spatie Laravel Data
- ✅ **Modern PHP** - Built with PHP 8.3+ and Saloon HTTP client

## Installation

You can install the package via Composer:

```bash
composer require mmorand/laravel-apertus
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="apertus-config"
```

This is the contents of the published config file:

```php
return [
    'api_key' => env('APERTUS_API_KEY'),
    'base_url' => env('APERTUS_BASE_URL', 'https://api.publicai.co'),
    'user_agent' => env('APERTUS_USER_AGENT', 'Apertus-Laravel-Client/1.0.0'),
    'timeout' => env('APERTUS_TIMEOUT', 60),
];
```

Add your Apertus API key to your `.env` file:

```env
APERTUS_API_KEY=your_api_key_here
APERTUS_BASE_URL=https://api.publicai.co
APERTUS_USER_AGENT=MyApp/1.0
APERTUS_TIMEOUT=30
```

Get your API key from the [Apertus AI Console](https://platform.publicai.co/settings/api-keys).

## Usage

### Basic Setup

Create an instance of the Apertus client to start interacting with the API:

```php
use Mmorand\Apertus\Apertus;
use Mmorand\Apertus\Enums\Model;

// Instantiate the client
$apertus = new Apertus(
    apiKey: config('apertus.api_key'),
    baseUrl: 'https://api.publicai.co',
    userAgent: 'MyApp/1.0'
);

// Or use the Facade (Laravel)
use Mmorand\Apertus\Facades\Apertus;

Apertus::chat();
Apertus::models();
```

### Chat Completions

Create a chat completion:

```php
use Mmorand\Apertus\Facades\Apertus;
use Mmorand\Apertus\Enums\Model;

$response = Apertus::chat()->create(
    model: Model::apertus8b,
    messages: [
        [
            'role' => 'user',
            'content' => 'Hello! Can you help me understand Swiss AI?',
        ]
    ],
    temperature: 0.7,
    maxTokens: 1000
);

/** @var \Mmorand\Apertus\Dto\Chat\ChatCompletionResponse $dto */
$dto = $response->dto();
```

### Model Management

List available models:

```php
$response = Apertus::models()->list();

/** @var \Mmorand\Apertus\Dto\Models\ModelsResponse $dto */
$dto = $response->dto();
```

### Artisan Commands

List available models using Artisan:

```bash
php artisan apertus:models
```

### Available Models

The following models are available in the Apertus API. You can use the `Model` enum in this package to refer to them.

| Enum Case           | Model Name                        | Documentation Link                                                            |
|---------------------|-----------------------------------|-------------------------------------------------------------------------------|
| `Model::apertus8b`  | `'swiss-ai/apertus-8b-instruct'`  | [Apertus 8b Docs](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509)   |
| `Model::apertus70b` | `'swiss-ai/apertus-70b-instruct'` | [Apertus 70b Docs](https://huggingface.co/swiss-ai/Apertus-70B-Instruct-2509) |

```php
use Mmorand\Apertus\Enums\Model;

Model::apertus8b  // swiss-ai/apertus-8b-instruct - Small Apertus model
Model::apertus70b // swiss-ai/apertus-70b-instruct - Complete Apertus model
```

## Testing

Run the tests with:

```bash
composer test
```

## Static Analysis

Analyze code with PHPStan:

```bash
composer analyse
```

## Code Style

Fix code style with Laravel Pint:

```bash
composer format
```

Inspired by the excellent work of [HelgeSverre](https://github.com/HelgeSverre) with his [Mistral package](https://github.com/HelgeSverre/mistral).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Disclaimer

Apertus AI and the Apertus logo are trademarks of their respective owners. This package is not affiliated with, endorsed by, or sponsored by Apertus AI. All trademarks and registered trademarks are the property of their respective owners.

See the [Terms and Conditions](https://publicai.co/tc) for more information.
