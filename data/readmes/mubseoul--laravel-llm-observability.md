# Laravel LLM Observability

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mubseoul/laravel-llm-observability.svg?style=flat-square)](https://packagist.org/packages/mubseoul/laravel-llm-observability)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mubseoul/laravel-llm-observability/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/mubseoul/laravel-llm-observability/actions?query=workflow%3Aci+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mubseoul/laravel-llm-observability.svg?style=flat-square)](https://packagist.org/packages/mubseoul/laravel-llm-observability)

A Laravel-native observability and cost tracking toolkit for LLM calls (OpenAI, Claude, Ollama, and more). Track every LLM request in your Laravel application with detailed metrics, enforce quotas, monitor costs, and gain insights through a beautiful Filament dashboard.

## Features

✨ **Comprehensive Tracking**
- Track tokens, latency, provider/model, cost estimates, and success/failure status
- User and team attribution for multi-tenant applications
- Detailed metadata capture (environment, route, IP, user agent)
- Optional storage of request/response bodies (with privacy controls)

💰 **Cost Management**
- Built-in pricing tables for OpenAI, Anthropic, and other providers
- Automatic cost calculation based on token usage
- Custom pricing providers for specialized models
- Cost aggregation by user, team, time period, or globally

🚦 **Quota Enforcement**
- Request, token, and cost limits (per day/month)
- Scoped quotas (global, per-user, per-team, per-API-key)
- Automatic quota resets via scheduled jobs
- Middleware for blocking requests when quotas exceeded

📊 **Filament Dashboard**
- Overview page with key metrics (requests, costs, latency, error rates)
- Detailed request logs with filtering and search
- Usage analytics by provider, model, user, and team
- Quota management interface
- Alert rule configuration

🔔 **Alerts & Webhooks**
- Configurable alert rules (cost thresholds, error rates, latency spikes)
- Webhook delivery with retry logic
- Laravel Notifications integration (mail, Slack, etc.)
- Audit trail for webhook deliveries

⚡ **Performance**
- Async recording via queue jobs
- Sampling support for high-volume applications
- Efficient data aggregation
- Configurable data retention

🔒 **Privacy & Security**
- Optional PII redaction
- Configurable sensitive data patterns
- Body storage disabled by default
- Secure webhook delivery

## Requirements

- PHP 8.2 or higher
- Laravel 10.x or 11.x
- (Optional) Filament 3.2+ for dashboard UI

## Installation

Install the package via Composer:

```bash
composer require mubseoul/laravel-llm-observability
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="llm-observability-config"
```

Run the migrations:

```bash
php artisan migrate
```

(Optional) If using Filament dashboard, install Filament:

```bash
composer require filament/filament:"^3.2"
php artisan filament:install --panels
```

## Configuration

The config file `config/llm-observability.php` provides extensive customization options:

### Recording Settings

```php
'recording' => [
    'enabled' => true,
    'mode' => 'async', // 'sync' or 'async'
    'sampling_rate' => 1.0, // 1.0 = 100%, 0.1 = 10%
    'store_bodies' => false, // Privacy: store raw prompts/responses
],
```

### Pricing Configuration

Update pricing as providers change their rates:

```php
'pricing' => [
    'openai' => [
        'gpt-4' => ['input' => 30.00, 'output' => 60.00],
        'gpt-4o' => ['input' => 5.00, 'output' => 15.00],
        // ... more models
    ],
    'anthropic' => [
        'claude-3-opus-20240229' => ['input' => 15.00, 'output' => 75.00],
        // ... more models
    ],
],
```

Prices are in USD per 1M tokens.

### Quota Defaults

```php
'quotas' => [
    'enabled' => true,
    'defaults' => [
        'user' => [
            'requests_per_day' => 1000,
            'cost_per_day' => 10.00,
        ],
    ],
],
```

## Usage

### Basic Recording

```php
use Mubseoul\LLMObservability\Facades\LLM;

$response = LLM::record([
    'provider' => 'openai',
    'model' => 'gpt-4',
    'prompt_tokens' => 150,
    'completion_tokens' => 75,
])->send(function () {
    return OpenAI::chat()->create([
        'model' => 'gpt-4',
        'messages' => [
            ['role' => 'user', 'content' => 'Hello!'],
        ],
    ]);
});
```

### With User Context

```php
LLM::record([
    'provider' => 'anthropic',
    'model' => 'claude-3-sonnet-20240229',
])
->withUser(auth()->id())
->withTeam(auth()->user()->currentTeam->id)
->send(function () {
    return Anthropic::messages()->create([...]);
});
```

### With Metadata

```php
LLM::record([
    'provider' => 'openai',
    'model' => 'gpt-4',
])
->withMetadata([
    'feature' => 'chat',
    'session_id' => session()->getId(),
])
->send(function () {
    // Your LLM call
});
```

### Manual Recording (without callback)

```php
LLM::record([
    'provider' => 'openai',
    'model' => 'gpt-4',
    'prompt_tokens' => 100,
    'completion_tokens' => 50,
    'latency_ms' => 1250,
    'status' => 'success',
])->recordRequest([
    'request_id' => 'custom-id',
]);
```

### Enforcing Quotas (Middleware)

Add the middleware to your routes:

```php
Route::middleware(['llm.quota'])->group(function () {
    Route::post('/api/chat', [ChatController::class, 'send']);
});
```

When a quota is exceeded, the middleware returns a 429 response:

```json
{
  "error": "Quota exceeded",
  "message": "Daily request limit exceeded",
  "quota_type": "requests_per_day"
}
```

### Programmatic Quota Checking

```php
use Mubseoul\LLMObservability\Services\QuotaEnforcer;

$enforcer = app(QuotaEnforcer::class);

$result = $enforcer->checkQuota(
    userId: auth()->id(),
    estimatedTokens: 1000,
    estimatedCost: 0.05
);

if (!$result['allowed']) {
    throw new Exception($result['reason']);
}
```

### Managing Quotas

```php
use Mubseoul\LLMObservability\Models\LLMQuota;

// Create a custom quota for a user
LLMQuota::create([
    'scope' => 'user',
    'scope_id' => '123',
    'requests_per_day' => 500,
    'cost_per_month' => 50.00,
    'enabled' => true,
]);

// Get or create quota with defaults
$quota = app(QuotaEnforcer::class)->getOrCreateQuota('user', '123');
```

### Creating Alert Rules

```php
use Mubseoul\LLMObservability\Models\LLMAlertRule;

LLMAlertRule::create([
    'name' => 'High Daily Cost Alert',
    'type' => 'cost_threshold',
    'scope' => 'global',
    'threshold_config' => [
        'cost_usd' => 100.00,
        'period' => 'day',
    ],
    'send_webhook' => true,
    'webhook_url' => 'https://your-app.com/webhooks/llm-alert',
    'enabled' => true,
]);
```

## Artisan Commands

### Prune Old Logs

```bash
# Prune all log types
php artisan llm:prune --all

# Prune specific types
php artisan llm:prune --requests --webhooks

# Force without confirmation
php artisan llm:prune --all --force
```

### Recalculate Aggregates

```bash
# Recalculate last 90 days
php artisan llm:recalc-aggregates

# Custom date range
php artisan llm:recalc-aggregates --from=2024-01-01 --to=2024-12-31
```

### View Pricing Table

```bash
# Show all pricing
php artisan llm:pricing

# Show specific provider
php artisan llm:pricing openai
```

## Dashboard

The Filament dashboard provides a comprehensive UI for monitoring and managing LLM usage.

Access the dashboard at: `/llm-observability` (configurable)

**Dashboard Features:**
- **Overview**: Real-time metrics for the last 24h, 7d, and 30d
- **Request Logs**: Searchable, filterable table of all LLM requests
- **Usage Analytics**: Breakdown by provider, model, user, and team
- **Quota Management**: Configure and monitor quotas
- **Alert Rules**: Create and manage alert thresholds

Configure dashboard settings in `config/llm-observability.php`:

```php
'dashboard' => [
    'enabled' => true,
    'prefix' => 'llm-observability',
    'middleware' => ['web', 'auth'],
],
```

## Scheduled Tasks

The package automatically registers these scheduled tasks:

- **Daily Quota Reset**: Runs at 00:01 daily
- **Monthly Quota Reset**: Runs on the 1st of each month at 00:05
- **Log Pruning**: Runs at 02:00 daily (if retention configured)

No manual scheduler configuration needed.

## Integration Examples

### OpenAI PHP SDK

```php
use OpenAI\Laravel\Facades\OpenAI;
use Mubseoul\LLMObservability\Facades\LLM;

$result = LLM::record([
    'provider' => 'openai',
    'model' => 'gpt-4',
])->send(function () {
    $response = OpenAI::chat()->create([
        'model' => 'gpt-4',
        'messages' => [
            ['role' => 'user', 'content' => 'Tell me a joke'],
        ],
    ]);

    return $response;
});

// Extract tokens from response if available
$tokens = $result->usage->totalTokens ?? null;
```

### Laravel HTTP Client

```php
use Illuminate\Support\Facades\Http;
use Mubseoul\LLMObservability\Facades\LLM;

$result = LLM::record([
    'provider' => 'anthropic',
    'model' => 'claude-3-sonnet-20240229',
])->send(function () {
    $response = Http::withHeaders([
        'x-api-key' => config('services.anthropic.key'),
        'anthropic-version' => '2023-06-01',
    ])->post('https://api.anthropic.com/v1/messages', [
        'model' => 'claude-3-sonnet-20240229',
        'max_tokens' => 1024,
        'messages' => [
            ['role' => 'user', 'content' => 'Hello!'],
        ],
    ]);

    return $response->json();
});
```

### Custom Provider

```php
LLM::record([
    'provider' => 'ollama',
    'model' => 'llama2',
    'input_chars' => strlen($prompt),
    'output_chars' => strlen($response),
])->send(function () use ($prompt) {
    return Http::post('http://localhost:11434/api/generate', [
        'model' => 'llama2',
        'prompt' => $prompt,
    ])->json();
});
```

## Testing

```bash
composer test
```

Run with coverage:

```bash
composer test-coverage
```

Run static analysis:

```bash
composer analyse
```

Format code:

```bash
composer format
```

## Security Considerations

### Privacy

- **Bodies Disabled by Default**: Raw prompts and responses are NOT stored unless explicitly enabled
- **Redaction Patterns**: Sensitive data (API keys, passwords) is automatically redacted from metadata
- **Configurable**: Add custom redaction patterns in config

```php
'recording' => [
    'store_bodies' => false, // Keep disabled for production
    'redact_patterns' => [
        '/api[_-]?key["\s:=]+([a-zA-Z0-9_\-]+)/i',
        '/bearer\s+([a-zA-Z0-9_\-\.]+)/i',
    ],
],
```

### Recommendations

1. **Review stored data**: Understand what metadata is captured
2. **Enable sampling**: Use sampling in high-volume environments
3. **Set retention limits**: Configure `retention.requests_days` to auto-prune old data
4. **Secure webhooks**: Use HTTPS and validate webhook signatures
5. **Audit access**: Restrict dashboard access with appropriate middleware

## Roadmap

- [ ] **Enhanced Analytics**: More dashboard widgets and charts
- [ ] **Export Functionality**: CSV/Excel export for finance teams
- [ ] **Budget Alerts**: Proactive budget threshold notifications
- [ ] **Multi-tenancy**: Enhanced team/organization isolation
- [ ] **Rate Limiting**: Built-in rate limiting by provider
- [ ] **Streaming Support**: Track streaming LLM responses
- [ ] **Cache Integration**: Track cache hits/misses for LLM responses
- [ ] **Provider Auto-detection**: Automatically detect provider from API calls
- [ ] **Prompt Templates**: Track and version prompt templates
- [ ] **A/B Testing**: Compare different models/prompts

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you discover a security vulnerability, please send an email to [security@mubseoul.com](mailto:security@mubseoul.com). All security vulnerabilities will be promptly addressed.

## Credits

- [Mubseoul](https://mubseoul.com)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
