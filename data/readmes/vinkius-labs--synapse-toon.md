<p align="center">
  <strong>Synapse TOON</strong><br>
  <em>High-performance API payload optimization engine for Laravel</em>
</p>

<p align="center">
  <a href="https://github.com/vinkius-labs/synapse-toon/actions/workflows/tests.yml"><img src="https://github.com/vinkius-labs/synapse-toon/actions/workflows/tests.yml/badge.svg" alt="Tests"></a>
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
  <a href="https://packagist.org/packages/vinkius-labs/synapse-toon"><img src="https://img.shields.io/packagist/v/vinkius-labs/synapse-toon.svg" alt="Latest Version"></a>
  <a href="https://packagist.org/packages/vinkius-labs/synapse-toon"><img src="https://img.shields.io/packagist/dt/vinkius-labs/synapse-toon.svg" alt="Total Downloads"></a>
  <a href="https://php.net"><img src="https://img.shields.io/badge/PHP-8.2%2B-8892BF.svg" alt="PHP 8.2+"></a>
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-FF2D20.svg" alt="Laravel"></a>
</p>

---

Synapse TOON transforms verbose JSON API responses into ultra-dense representations, reducing token consumption by **25–45%** while preserving full semantic fidelity. Ship faster APIs and pay dramatically less for LLM inference.

Every runtime surface ships with an explicit `SynapseToon` prefix, making package ownership obvious in your codebase and eliminating class-name collisions.

## Highlights

- **Cost Savings First** — Reduce LLM API bills by 25–45% through entropy-aware encoding, adaptive compression, and smart routing.
- **Performance Native** — HTTP/3 detection, Brotli/Gzip negotiation, and SSE streaming deliver sub-100 ms response times.
- **Observable by Default** — Log, Prometheus, and Datadog drivers expose savings metrics and ROI in real time.
- **Production Ready** — Queue-aware batch jobs, edge caching, and complexity-aware routing keep high-traffic APIs responsive.
- **Framework Native** — Middleware aliases, response macros, and Octane preloading for zero-friction Laravel integration.
- **Zero Lock-in** — Bring your own vector stores, LLM clients, and cache drivers via lightweight contracts.

## Requirements

| Dependency | Version |
|:-----------|:--------|
| PHP | 8.2+ |
| Laravel | 11.x \| 12.x |
| ext-brotli | Optional (recommended) |
| ext-zlib | Optional |

## Installation

```bash
composer require vinkius-labs/synapse-toon
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=synapse-toon-config
```

Register middleware in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(append: [
        \VinkiusLabs\SynapseToon\Http\Middleware\SynapseToonCompressionMiddleware::class,
        \VinkiusLabs\SynapseToon\Http\Middleware\SynapseToonHttp3Middleware::class,
    ]);
})
```

## Quick Start

### Encode a response

```php
use VinkiusLabs\SynapseToon\Facades\SynapseToon;

// Before: 1,247 tokens → After: 683 tokens (45% reduction)
$encoded = SynapseToon::encoder()->encode([
    'products' => Product::with('category', 'reviews')->get(),
    'meta' => ['page' => 1, 'per_page' => 50],
]);

return response()->synapseToon($encoded);
```

### Stream an LLM response

```php
return response()->synapseToonStream($llmStream, function ($chunk) {
    return [
        'delta' => $chunk['choices'][0]['delta']['content'],
        'usage' => $chunk['usage'] ?? null,
    ];
});
```

### Route by complexity

```php
$target = SynapseToon::router()->route($payload, [
    'complexity' => 0.4,
    'tokens' => 512,
]);
```

### Build RAG context

```php
$context = SynapseToon::rag()->buildContext(
    'How do I implement OAuth2 in Laravel?',
    ['user_id' => auth()->id()]
);
```

### Dispatch a batch job

```php
use VinkiusLabs\SynapseToon\Jobs\SynapseToonProcessLLMBatchJob;

SynapseToonProcessLLMBatchJob::dispatch($prompts, [
    'queue'      => 'llm-batch',
    'connection' => 'openai',
    'batch_size' => 50,
]);
```

## Architecture Overview

| Component | Purpose |
|:----------|:--------|
| `SynapseToonEncoder` / `SynapseToonDecoder` | Lossless TOON codec with dictionary support and entropy-aware heuristics |
| `SynapseToonCompressor` | Adaptive Brotli, Gzip, and Deflate selection based on `Accept-Encoding` |
| `SynapseToonSseStreamer` | Server-Sent Events with zero-copy chunking and buffer flush guardrails |
| `SynapseToonEdgeCache` | Encode-once edge cache helper tuned for Redis and Octane workloads |
| `SynapseToonMetrics` | Driver-agnostic metrics (Log, Prometheus, Datadog, or custom drivers) |
| `SynapseToonProcessLLMBatchJob` | Queue-friendly batch encoder for up to 100 prompts per dispatch |
| `SynapseToonLLMRouter` | Complexity-aware model router with pluggable LLM client implementations |
| `SynapseToonRagService` | Vector-store abstraction with snippet thresholds and metadata braiding |
| `SynapseToonGraphQLAdapter` | Lighthouse / Rebing GraphQL pipeline with TOON encoding built in |
| `SynapseToonPayloadAnalyzer` | Token analytics and savings calculator for middleware and dashboards |

## Real-World Impact

| Scenario | Before | After | Savings |
|:---------|-------:|------:|--------:|
| E-commerce feed (500 items) | 47,200 tokens | 26,100 tokens | **44.7%** |
| Chat completion with context | 3,840 tokens | 2,310 tokens | **39.8%** |
| GraphQL nested query | 2,156 tokens | 1,405 tokens | **34.8%** |
| RAG context injection | 1,920 tokens | 1,152 tokens | **40.0%** |
| Batch job (50 prompts) | 12,500 tokens | 7,000 tokens | **44.0%** |

**Average token reduction: 40.7%**

## Documentation

| Guide | Description |
|:------|:------------|
| [Getting Started](docs/getting-started.md) | Installation, first response, and quick tips |
| [Configuration](docs/configuration.md) | Full reference for every config option |
| [Encoding & Compression](docs/encoding-compression.md) | TOON algorithm deep-dive and compression strategies |
| [Streaming & SSE](docs/streaming-sse.md) | Server-Sent Events for real-time LLM responses |
| [Metrics & Analytics](docs/metrics-analytics.md) | Prometheus, Datadog, and custom driver setup |
| [RAG Integration](docs/rag-integration.md) | Vector-store abstraction and context building |
| [Batch Processing](docs/batch-processing.md) | Queue-native batch encoding and fan-out |
| [GraphQL Adapter](docs/graphql-adapter.md) | Lighthouse / Rebing integration |
| [Edge Cache](docs/edge-cache.md) | Multi-tier caching strategies |
| [HTTP/3 Optimization](docs/http3-optimization.md) | HTTP/3 detection and header optimization |
| [Cost Optimization](docs/cost-optimization.md) | Maximize ROI with concrete strategies |
| [Performance Tuning](docs/performance-tuning.md) | Latency and throughput optimization |
| [Technical Reference](docs/technical-reference.md) | Container bindings, macros, and full API |

## Testing

Run the test suite locally via Docker:

```bash
docker compose build
docker compose run --rm app bash -c "composer install --no-interaction && vendor/bin/phpunit"
```

Or, if you have PHP 8.2+ installed locally:

```bash
composer install
vendor/bin/phpunit
```

## Compatibility

| Component | Support |
|:----------|:--------|
| Laravel | 11.x, 12.x |
| PHP | 8.2, 8.3 |
| Octane | Swoole, RoadRunner, FrankenPHP |
| HTTP/3 | Full detection and optimization |
| Brotli | Optional (`ext-brotli`) |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md). **Do not open a public issue.**

## Changelog

All notable changes are documented in the [Changelog](CHANGELOG.md).

## License

Copyright 2026 Vinkius Labs

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.
