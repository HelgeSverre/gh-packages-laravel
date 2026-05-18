# Laravel AI Gemini Driver

A [Laravel AI](https://github.com/laravel/ai) provider that proxies [Gemini CLI](https://github.com/google-gemini/gemini-cli) and Antigravity endpoints to access Google's CloudCode-PA v1internal API. Use Gemini, Claude, and GPT models through a single unified interface with automatic rate-limit cascading, multi-endpoint fallback, and SSE streaming.

> [!WARNING]
> **Use at Your Own Risk**
>
> This package accesses Google's internal CloudCode-PA API through undocumented endpoints using OAuth credentials intended for Gemini CLI. This is **not an officially supported method** of accessing these models. Using this package may violate Google's Terms of Service and **could result in your Google account being suspended or banned**. The authors accept no responsibility for any consequences arising from its use.

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- [Laravel AI](https://github.com/laravel/ai) ^0.1 | ^0.2 (pre-release — expect breaking changes)
- OAuth credentials JSON produced by [Gemini CLI](https://github.com/google-gemini/gemini-cli)

## Installation

```bash
composer require ursamajeur/laravel-ai-gemini-driver
```

The service provider is auto-discovered — no manual registration needed.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=cloudcode-pa-config
```

## Configuration

### Authentication

This package requires an OAuth credentials JSON file produced by [Gemini CLI](https://github.com/google-gemini/gemini-cli). Run Gemini CLI at least once and authenticate — this generates the OAuth JSON that this package uses. The package handles token refresh automatically after that.

Set the path to your OAuth credentials in `.env`:

```dotenv
CLOUDCODE_PA_CREDENTIALS_PATH=storage/cloudcode-pa/oauth_creds.json
```

If not set, it defaults to `storage/cloudcode-pa/oauth_creds.json`. The package handles token refresh automatically.

### Project ID

The CloudCode-PA project ID is obtained during Gemini CLI onboarding. If not configured, the package will auto-discover it via the `loadCodeAssist` RPC.

```dotenv
CLOUDCODE_PA_PROJECT=your-project-id
```

### Models

Configure default models via environment variables:

```dotenv
CLOUDCODE_PA_DEFAULT_MODEL=claude-opus-4
CLOUDCODE_PA_CHEAPEST_MODEL=gemini-2.5-flash
CLOUDCODE_PA_SMARTEST_MODEL=claude-opus-4
CLOUDCODE_PA_RERANKING_MODEL=gemini-2.5-flash
```

## Supported Models

### Partner Models
| Model | Alias |
|-------|-------|
| Claude Opus 4 | `claude-opus-4` |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` |
| Claude Sonnet 4 | `claude-sonnet-4` |
| Claude Haiku 4.5 | `claude-haiku-4-5` |
| GPT-4.1 | `gpt-4-1` |
| GPT OSS 120B | `gpt-oss-120b-medium` |

### Gemini Models
| Model | Alias |
|-------|-------|
| Gemini 3 Pro (preview) | `gemini-3-pro-preview` |
| Gemini 3 Flash (preview) | `gemini-3-flash-preview` |
| Gemini 2.5 Pro | `gemini-2.5-pro` |
| Gemini 2.5 Flash | `gemini-2.5-flash` |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite` |
| Gemini 2.0 Flash | `gemini-2.0-flash` |

You can add custom model aliases in `config/cloudcode-pa.php` under the `models` key.

## Usage

The provider name is `cloudcode-pa`. Use it with [Laravel AI](https://github.com/laravel/ai)'s standard API:

```php
use Laravel\Ai\Ai;

// Text generation
$provider = Ai::textProvider('cloudcode-pa');

// Reranking
$provider = Ai::rerankingProvider('cloudcode-pa');
```

For the full API (text generation, streaming, multi-turn conversations, reranking), refer to the [Laravel AI documentation](https://github.com/laravel/ai).

## Key Features

### Model Cascade (Rate-Limit Fallback)

When a model returns `429 (Rate Limited)`, the gateway automatically cascades through a configurable fallback chain. Each step tries all configured endpoints before advancing to the next model.

Default cascade: `claude-opus-4` → `gemini-3-pro-preview` → `gemini-3-flash-preview` → `gemini-2.5-pro` → `gemini-2.5-flash`

Cascade only activates when using the default model — explicit model requests use endpoint fallback only.

```dotenv
CLOUDCODE_PA_CASCADE_ENABLED=true
```

Customize cascade steps in `config/cloudcode-pa.php`:

```php
'cascade' => [
    'enabled' => true,
    'steps' => [
        'claude-opus-4',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
    ],
],
```

### Multi-Endpoint Fallback

Multiple endpoints with independent quota pools are configured by default. On endpoint failure or rate limiting, the next endpoint is tried automatically. Endpoints are customizable in `config/cloudcode-pa.php`.

### Automatic Model Routing

Partner models (Claude, GPT) and Gemini models use different API protocols. The package detects the model type and routes automatically — no configuration needed.

### Timeouts

```dotenv
CLOUDCODE_PA_TIMEOUT=30            # Non-streaming requests (seconds)
CLOUDCODE_PA_STREAM_TIMEOUT=120    # SSE streaming requests (seconds)
CLOUDCODE_PA_CONNECT_TIMEOUT=10    # Connection timeout (seconds)
```

### Debug Logging

Enable request/response logging (credentials are always redacted):

```dotenv
CLOUDCODE_PA_DEBUG=true
```

## Testing

```bash
composer test
```

## License

MIT
