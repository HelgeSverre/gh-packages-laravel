# Laravel Local LLM SDK

Modern, multi-driver, failover-ready local LLM integration for Laravel.

[![PHP Version](https://img.shields.io/badge/PHP-8.4%2B-777BB4?style=flat&logo=php)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/Laravel-12%2B-FF2D20?style=flat&logo=laravel)](https://laravel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Static Analysis](https://img.shields.io/badge/PHPStan-Level%209-brightgreen)](phpstan.neon)
[![Code Style](https://img.shields.io/badge/Code%20Style-Pint-blue)](pint.json)

## Why Laravel Local LLM SDK?

| Feature | Description |
|---------|-------------|
| **Zero Cloud Dependency** | Run LLMs entirely on your local infrastructure |
| **Enterprise Ready** | Type-safe, tested, and PSR-compliant |
| **Modern PHP 8.4** | Strict typing, readonly classes, union types |
| **Production Tested** | Comprehensive test suite with 100% coverage goals |

## Quick Links

- [📘 Documentation](docs/index.html)
- [⚙️ API Reference](#api-reference)
- [🧪 Testing](#testing)
- [🚀 Roadmap](#roadmap)
- [📦 Packagist](https://packagist.org/packages/laravel-local-llm/sdk)

## Overview

Laravel Local LLM SDK is a modern, enterprise-grade Laravel package designed to integrate local Large Language Models (LLMs) such as Ollama and LM Studio into your Laravel applications.

## Features

- **Multi-Driver Architecture** - Support for Ollama, LM Studio, AirLLMLlama, and OpenAI-compatible local servers
- **Intelligent Failover** - Automatic fallback to healthy drivers
- **Auto-Detection** - Automatically detect available local LLM engines
- **Streaming Support** - Server-Sent Events (SSE) for real-time responses
- **Token-Based Authentication** - Built-in API token system with rate limiting
- **Usage Tracking** - Track token usage and quotas
- **Builder Pattern** - Fluent API for building requests
- **Event-Driven** - Dispatch events for observability
- **Embeddings Support** - Generate vector embeddings for semantic search
- **Tool Calling** - Define and use tools/functions with LLMs
- **Batch Processing** - Process multiple requests efficiently
- **Webhooks** - Send LLM events to external services
- **Metrics** - Prometheus-compatible metrics for monitoring
- **Caching** - Cache model lists and health status

## Requirements

- PHP 8.4+
- Laravel 12+
- Composer 2+
- Local LLM engine (Ollama, LM Studio, or OpenAI-compatible server)

## Installation

```bash
composer require laravel-local-llm/sdk
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="LaravelLocalLlm\LocalLlmServiceProvider" --tag="llm-config"
```

### Environment Variables

```env
# Default driver
LLM_DEFAULT_DRIVER=ollama

# Ollama
LLM_OLLAMA_ENABLED=true
LLM_OLLAMA_URL=http://localhost:11434
LLM_OLLAMA_DEFAULT_MODEL=llama3.2

# LM Studio
LLM_LMSTUDIO_ENABLED=true
LLM_LMSTUDIO_URL=http://localhost:1234/v1
LLM_LMSTUDIO_DEFAULT_MODEL=llama-3.2-1b-instruct

# OpenAI Compatible
LLM_OPENAI_COMPATIBLE_ENABLED=false
LLM_OPENAI_COMPATIBLE_URL=http://localhost:8080/v1

# Failover
LLM_FAILOVER_ENABLED=true

# Auto-detection
LLM_AUTO_DETECT=true
```

## Usage

### Using the Facade

```php
use LaravelLocalLlm\Facades\LocalLlm;
use LaravelLocalLlm\DTO\Message;

// Simple chat
$response = LocalLlm::chat(
    new ChatRequest(
        model: 'llama3.2',
        messages: [
            Message::user('Hello, how are you?'),
        ]
    )
);

echo $response->content;
```

### Using the Builder

```php
$response = LocalLlm::chatWithBuilder()
    ->model('llama3.2')
    ->withUserMessage('Hello, how are you?')
    ->temperature(0.7)
    ->send();

echo $response->content;
```

### Streaming

```php
LocalLlm::chatWithBuilder()
    ->model('llama3.2')
    ->withUserMessage('Tell me a story')
    ->stream(true)
    ->sendStream(function ($chunk) {
        echo $chunk->content;
        
        if ($chunk->finished) {
            echo "\nDone!\n";
        }
    });
```

### Using Specific Driver

```php
$response = LocalLlm::chat(
    new ChatRequest(...),
    Driver::LM_STUDIO
);
```

### Failover

```php
$response = LocalLlm::chatWithFailover(new ChatRequest(...));
```

### Checking Models

```php
$models = LocalLlm::models();
```

### Health Check

```php
$isHealthy = LocalLlm::health();
```

## Embeddings

Generate vector embeddings for semantic search:

```php
use LaravelLocalLlm\Facades\LocalLlm;
use LaravelLocalLlm\DTO\EmbeddingRequest;

// Single text
$response = LocalLlm::embeddings(new EmbeddingRequest(
    model: 'text-embedding-3-small',
    input: 'Hello world'
));

$embedding = $response->embeddings[0]->embedding;

// Multiple texts
$response = LocalLlm::embeddings(new EmbeddingRequest(
    model: 'text-embedding-3-small',
    input: ['Hello world', 'Goodbye world']
));
```

## Batch Processing

Process multiple chat requests efficiently:

```php
use LaravelLocalLlm\Facades\LocalLlm;
use LaravelLocalLlm\DTO\BatchChatRequest;
use LaravelLocalLlm\DTO\ChatRequest;
use LaravelLocalLlm\DTO\Message;

$requests = [
    new ChatRequest(model: 'llama3.2', messages: [Message::user('Hello')]),
    new ChatRequest(model: 'llama3.2', messages: [Message::user('How are you?')]),
    new ChatRequest(model: 'llama3.2', messages: [Message::user('Tell me a joke')]),
];

$batchResponse = LocalLlm::batchChat(new BatchChatRequest($requests));

echo "Total requests: " . $batchResponse->count();
echo "Total tokens: " . $batchResponse->totalTokens();
echo "Avg latency: " . $batchResponse->averageLatencyMs() . "ms";
```

## Token Authentication

### Creating Tokens

```php
use LaravelLocalLlm\Models\LlmToken;
use Illuminate\Support\Facades\Hash;

$token = LlmToken::create([
    'name' => 'API Token',
    'hashed_token' => Hash::make('your-secret-token'),
    'abilities' => ['chat', 'stream'],
    'rate_limit' => 60,
    'monthly_quota' => 1000000,
]);
```

### Using Tokens

Include the token in your request:

```bash
curl -H "Authorization: Bearer your-secret-token" \
  https://your-app.com/api/llm/chat
```

### Middleware

Protect your routes:

```php
Route::middleware(['llm.guard:chat,stream'])->group(function () {
    Route::post('/llm/chat', [LlmController::class, 'chat']);
});
```

## Events

- `ChatCompleted` - Dispatched when a chat request completes
- `StreamChunkReceived` - Dispatched for each streaming chunk

```php
Event::listen(\LaravelLocalLlm\Events\ChatCompleted::class, function ($event) {
    log::info('Chat completed', [
        'model' => $event->response->model,
        'latency' => $event->response->latencyMs,
    ]);
});
```

## Webhooks

Send LLM events to external services:

```php
use LaravelLocalLlm\Webhooks\WebhookDispatcher;

$webhook = new WebhookDispatcher();

$webhook->register('chat.completed', 'https://your-app.com/webhooks/llm', [
    'secret' => env('WEBHOOK_SECRET'),
]);

$webhook->dispatchChatCompleted($request, $response, $driver);
```

## Metrics

Track LLM usage with Prometheus-compatible metrics:

```php
use LaravelLocalLlm\Services\Metrics;

$metrics = new Metrics();

$metrics->recordRequest('ollama', 'llama3.2', 150.5, 20, 50);
$metrics->recordRequest('ollama', 'llama3.2', 120.0, 15, 45);

// Get per-model metrics
$allMetrics = $metrics->getMetrics();

// Get aggregate metrics
$aggregate = $metrics->getAggregateMetrics();
// ['total_requests' => 2, 'avg_latency_ms' => 135.25, ...]

// Export to Prometheus format
$prometheus = $metrics->toPrometheusFormat();
```

## Helpers

Utility functions for common tasks:

```php
use LaravelLocalLlm\Helpers\TokenCalculator;
use LaravelLocalLlm\Helpers\ResponseFormatter;

// Estimate tokens
$tokens = TokenCalculator::estimateTokens('Hello world');

// Calculate cost
$cost = TokenCalculator::calculateCost(100, 50, 0.001, 0.002);

// Format response
$html = ResponseFormatter::markdown('**bold** and *italic*');

// Extract code blocks
$codeBlocks = ResponseFormatter::extractCode($markdown);
```

## Console Commands

```bash
# Check driver health
php artisan llm:health

# Check specific driver
php artisan llm:health --driver=ollama

# List models
php artisan llm:models

# List models for specific driver
php artisan llm:models --driver=lmstudio

# Clear cache
php artisan llm:clear-cache
```

## Extending

### Custom Driver

```php
use LaravelLocalLlm\Contracts\DriverInterface;
use LaravelLocalLlm\Enums\Driver;
use LaravelLocalLlm\DTO\ChatRequest;
use LaravelLocalLlm\DTO\ChatResponse;

class CustomDriver implements DriverInterface
{
    public function getDriver(): Driver
    {
        return Driver::OLLAMA; // or new Driver('custom')
    }

    public function chat(ChatRequest $request): ChatResponse
    {
        // Implementation
    }

    public function stream(ChatRequest $request, callable $onChunk): void
    {
        // Implementation
    }

    public function models(): array
    {
        // Implementation
    }

    public function health(): bool
    {
        // Implementation
    }

    public function isEnabled(): bool
    {
        return true;
    }
}
```

## Testing

```bash
composer test
```

## License

MIT License - see [LICENSE](LICENSE) for details.
