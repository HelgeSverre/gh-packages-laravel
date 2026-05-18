# laravel-explainable-ai

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mukundhanmohan/laravel-explainable-ai.svg?style=flat-square)](https://packagist.org/packages/mukundhanmohan/laravel-explainable-ai)
[![License](https://img.shields.io/github/license/mukundhan-mohan/laravel-explainable-ai.svg?style=flat-square)](LICENSE)
[![Total Downloads](https://img.shields.io/packagist/dt/mukundhanmohan/laravel-explainable-ai.svg?style=flat-square)](https://packagist.org/packages/mukundhanmohan/laravel-explainable-ai)
[![Tests](https://img.shields.io/github/actions/workflow/status/mukundhan-mohan/laravel-explainable-ai/tests.yml?branch=main&style=flat-square&label=tests)](https://github.com/mukundhan-mohan/laravel-explainable-ai/actions/workflows/tests.yml)

`laravel-explainable-ai` is a Laravel-native AI orchestration and explainability toolkit for teams that want more than a raw provider SDK. It wraps prompt templates, structured outputs, heuristic explainability metadata, audit logging, cost tracking, caching, queue dispatch, and test helpers behind a Laravel-friendly API.

![laravel-explainable-ai demo](docs/assets/demo-terminal.svg)

The package is designed around a simple fluent developer experience:

```php
use LaravelExplainableAI\Facades\AI;

$result = AI::prompt('summarize_feedback')
    ->input(['feedback' => $text])
    ->withExplanation()
    ->withConfidence()
    ->provider('openai')
    ->model('gpt-4.1-mini')
    ->execute();
```

Typical normalized output:

```php
[
    'content' => 'Escalate this complaint to support.',
    'structured_output' => [
        'summary' => 'Customer is unhappy',
        'next_action' => 'Escalate this complaint to support.',
    ],
    'explanation' => [
        'summary' => 'Heuristic rationale based on refund, complaint, support.',
        'factors' => ['refund', 'complaint', 'support', 'schema-compliant structured output'],
        'confidence' => 0.86,
        'risk_flags' => ['customer_churn_risk'],
        'decision_trace' => [...],
    ],
    'usage' => [
        'input_tokens' => 100,
        'output_tokens' => 25,
        'total_tokens' => 125,
        'estimated_cost' => 0.00008,
        'currency' => 'USD',
    ],
    'provider' => 'openai',
    'model' => 'gpt-4.1-mini',
]
```

## Why explainability matters

Most application teams do not need fake claims about model internals. They need operational clarity:

- What prompt version was used
- What evidence patterns influenced the answer
- How confident the system appears to be
- Which risk flags should trigger human review
- How much the request cost
- Whether the answer was cached

This package frames explainability as heuristic rationale, decision trace, and confidence estimation built from observable request and response data.

## Features

- Provider-agnostic orchestration via contracts
- Fluent `AI` facade and request builder
- YAML prompt templates in `resources/prompts/*.yaml`
- Structured output parsing and validation
- Heuristic explainability metadata
- Confidence scoring and risk flagging
- Database audit logging and cost tracking
- Cache-aware execution
- Queue-based async execution
- Middleware safeguards for rate limiting, PII redaction, and safety checks
- `AI::fake()` testing support
- Artisan install, prompt generation, and prompt test commands

## Requirements

- PHP 8.2+
- Laravel 11+

## Installation

Install the package through Composer:

```bash
composer require mukundhanmohan/laravel-explainable-ai
```

Publish the package assets:

```bash
php artisan ai:install
```

Or publish assets individually:

```bash
php artisan vendor:publish --tag=explainable-ai-config
php artisan vendor:publish --tag=explainable-ai-migrations
php artisan vendor:publish --tag=explainable-ai-prompts
php artisan migrate
```

Add provider credentials to `.env`:

```dotenv
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4.1-mini
EXPLAINABLE_AI_PROVIDER=openai
```

## Configuration

The main package config lives at [`config/explainable-ai.php`](config/explainable-ai.php). It includes:

- Default provider selection
- Provider credentials and default models
- Prompt search paths
- Cache configuration
- Queue configuration
- Logging flags
- Explainability heuristics
- Rate limits
- Pricing tables for token cost estimation

## Quick start

### Basic prompt execution

```php
use LaravelExplainableAI\Facades\AI;

$response = AI::prompt('summarize_feedback')
    ->input(['feedback' => 'This is my third complaint and I want a refund.'])
    ->provider('openai')
    ->model('gpt-4.1-mini')
    ->execute();

$response->toArray();
```

### Explainability and confidence

```php
$response = AI::prompt('summarize_feedback')
    ->input(['feedback' => $feedback])
    ->withExplanation()
    ->withConfidence()
    ->execute();

$summary = $response->explanation?->summary;
$confidence = $response->explanation?->confidence;
```

### Structured output

You can rely on the schema from the prompt template or override it at runtime:

```php
$response = AI::prompt('classify_urgency')
    ->input(['message' => $message])
    ->schema([
        'type' => 'object',
        'required' => ['urgency', 'rationale'],
        'properties' => [
            'urgency' => ['type' => 'string'],
            'rationale' => ['type' => 'string'],
        ],
    ])
    ->execute();

$urgency = $response->structuredOutput['urgency'];
```

### Async execution

```php
AI::prompt('recommend_next_action')
    ->input(['case' => $case])
    ->provider('openai')
    ->async()
    ->execute();
```

This dispatches `LaravelExplainableAI\Queue\ExecuteAIRequestJob` using the package queue settings.

## Prompt templates

Prompt files live in `resources/prompts/*.yaml`.

Example:

```yaml
name: summarize_feedback
version: 1.0.0
system: |
  You summarize customer feedback for support operations.
  Provide a concise recommendation. If a schema is provided, return valid JSON only.
user: |
  Summarize this feedback and recommend the next step:
  {{ feedback }}
schema:
  type: object
  required:
    - summary
    - next_action
  properties:
    summary:
      type: string
    next_action:
      type: string
```

Included examples:

- [`resources/prompts/summarize_feedback.yaml`](resources/prompts/summarize_feedback.yaml)
- [`resources/prompts/classify_urgency.yaml`](resources/prompts/classify_urgency.yaml)
- [`resources/prompts/recommend_next_action.yaml`](resources/prompts/recommend_next_action.yaml)

## Explainability model

The package does not claim access to model internals. Instead it produces a practical explanation layer with:

- Summary: a concise heuristic rationale
- Factors: keyword and response-shape signals observed in input/output
- Confidence: a heuristic score derived from completeness, schema compliance, and provider signals when available
- Risk flags: keyword-based operational flags like churn or escalation risk
- Decision trace: a step-by-step trace of prompt rendering, provider completion, output parsing, and heuristic scoring

Core implementation lives in:

- [`src/Explainability/ExplainabilityEngine.php`](src/Explainability/ExplainabilityEngine.php)
- [`src/Explainability/ConfidenceScorer.php`](src/Explainability/ConfidenceScorer.php)
- [`src/Explainability/RiskFlagger.php`](src/Explainability/RiskFlagger.php)

## Logging and observability

The package stores audit and cost data in four tables:

- `ai_requests`
- `ai_responses`
- `ai_cost_records`
- `ai_prompt_versions`

Logging classes:

- [`src/Logging/AuditLogger.php`](src/Logging/AuditLogger.php)
- [`src/Logging/UsageLogger.php`](src/Logging/UsageLogger.php)

## Cache behavior

Responses are cached using a key derived from:

- Prompt name and version
- Input payload
- Provider and model
- Schema
- Explainability flags
- Rendered prompt content

Cache implementation:

- [`src/Caching/ResponseCache.php`](src/Caching/ResponseCache.php)
- [`src/Caching/CacheKeyGenerator.php`](src/Caching/CacheKeyGenerator.php)

## Testing

The package includes `AI::fake()` so application tests can avoid provider calls:

```php
use LaravelExplainableAI\Facades\AI;

AI::fake([
    [
        'content' => 'Escalate this complaint to support.',
        'provider' => 'openai',
        'model' => 'gpt-4.1-mini',
    ],
]);

$response = AI::prompt('summarize_feedback')
    ->input(['feedback' => 'Repeated refund complaint'])
    ->execute();
```

Core test coverage is included for:

- Prompt rendering
- OpenAI normalization
- Output parsing and repair
- Explainability generation
- Cache hits
- Async dispatch
- Facade fake support

Tests live under [`tests`](tests).

## Artisan commands

- `php artisan ai:install`
- `php artisan ai:prompt make {name}`
- `php artisan ai:test {prompt}`

## Architecture overview

Main runtime flow:

1. `AI::prompt(...)` builds an `AIRequest`
2. `AIManager` resolves provider/model defaults or dispatches async work
3. `AIExecutionPipeline` renders the prompt and applies middleware
4. Cache is checked
5. The provider executes the request
6. Structured output is parsed and validated
7. Explainability metadata is generated
8. Audit and cost data are stored
9. A normalized `AIResponse` is returned

Key entry points:

- [`src/Managers/AIManager.php`](src/Managers/AIManager.php)
- [`src/Managers/AIExecutionPipeline.php`](src/Managers/AIExecutionPipeline.php)
- [`src/Builders/AIRequestBuilder.php`](src/Builders/AIRequestBuilder.php)

## Extensibility

Contracts are defined for:

- [`src/Contracts/AIProviderInterface.php`](src/Contracts/AIProviderInterface.php)
- [`src/Contracts/PromptRepositoryInterface.php`](src/Contracts/PromptRepositoryInterface.php)
- [`src/Contracts/ExplanationEngineInterface.php`](src/Contracts/ExplanationEngineInterface.php)
- [`src/Contracts/OutputParserInterface.php`](src/Contracts/OutputParserInterface.php)

Placeholder providers are included for:

- Anthropic
- Gemini
- Ollama

The OpenAI path is the MVP implementation. The others are ready for provider-specific adapters.

## Roadmap

- Provider-specific adapters for Anthropic, Gemini, and Ollama
- Streaming responses
- Conversation memory primitives
- Richer schema support
- Response review workflows
- Per-tenant policy layers
- Telemetry integrations

## Local development status

The package source and tests are present in this repository. PHP syntax checks passed across `src`, `tests`, `config`, and `database`. Full PHPUnit execution was not run in this workspace because Composer dependencies are not installed yet.
