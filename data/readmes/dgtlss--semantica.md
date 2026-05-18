# Semantica

A Laravel package that enables semantic search using vector embeddings for better relevance in content-heavy applications like blogs, e-commerce, or knowledge bases. Supports multiple AI providers including OpenAI, Google Gemini, and local Ollama models, with comprehensive security features and static analysis.

## Features

- Generate text embeddings using multiple AI providers (OpenAI, Gemini, Ollama)
- Automatic embedding generation for Eloquent models with `HasEmbeddings` trait
- Semantic search with configurable similarity metrics (cosine, euclidean, dot product)
- Configurable similarity thresholds and result caching
- Batch processing for performance optimization
- Artisan commands for indexing and reindexing existing data
- Comprehensive security features and input validation
- Static analysis with PHPStan and automated code quality tools
- Support for both cloud and local embedding models

## Installation

Install via Composer:

```bash
composer require dgtlss/semantica
```

Publish the configuration and migration:

```bash
php artisan vendor:publish --provider="Dgtlss\Semantica\Providers\SemanticaServiceProvider" --tag="semantica-config"
php artisan vendor:publish --provider="Dgtlss\Semantica\Providers\SemanticaServiceProvider" --tag="semantica-migrations"
```

Run the migration:

```bash
php artisan migrate
```

## Configuration

Choose your embedding provider and set the appropriate API keys in your `.env` file:

### OpenAI (Default)
```env
SEMANTICA_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
SEMANTICA_EMBEDDING_MODEL=text-embedding-3-small
```

### Anthropic
```env
SEMANTICA_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key-here
SEMANTICA_ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

### Gemini (Google)
```env
SEMANTICA_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
SEMANTICA_GEMINI_MODEL=text-embedding-004
```

### Ollama (Local Models)
```env
SEMANTICA_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
SEMANTICA_OLLAMA_MODEL=nomic-embed-text
```

### Additional Configuration
```env
SEMANTICA_AUTO_EMBED=false  # Disabled by default for security
SEMANTICA_CACHE_ENABLED=true
SEMANTICA_CACHE_TTL=3600
SEMANTICA_BATCH_SIZE=100
SEMANTICA_SIMILARITY_THRESHOLD=0.7
```

## Usage

### Automatic Embedding

Models using the `HasEmbeddings` trait will automatically have embeddings generated when saved **only if** `SEMANTICA_AUTO_EMBED=true` is set in your environment file. This is **disabled by default** for security reasons.

```php
// With SEMANTICA_AUTO_EMBED=true
$post = Post::create([
    'title' => 'Laravel Tips',
    'content' => 'Here are some useful Laravel tips...',
]);
// Embedding is automatically generated

// With SEMANTICA_AUTO_EMBED=false (default)
$post = Post::create([
    'title' => 'Laravel Tips',
    'content' => 'Here are some useful Laravel tips...',
]);
// No embedding generated - use manual embedding or artisan commands
```

### Manual Embedding

Use the service directly:

```php
use Dgtlss\Semantica\Services\EmbeddingService;

$embeddingService = app(EmbeddingService::class);
$embeddingService->embed($post);
```

### Semantic Search

Use the facade for searching:

```php
use Dgtlss\Semantica\Facades\Semantica;

$results = Semantica::search('PHP framework tutorials', App\Models\Post::class, 10, 0.8);

// Or get models directly
$posts = Semantica::searchModels('PHP framework tutorials', App\Models\Post::class);
```

### Commands

Index existing records:

```bash
php artisan semantica:index App\\Models\\Post
```

Reindex models:

```bash
php artisan semantica:reindex App\\Models\\Post
php artisan semantica:reindex --all
```

## Model Trait

To enable automatic embeddings for a model, use the `HasEmbeddings` trait:

```php
use Dgtlss\Semantica\Traits\HasEmbeddings;

class Post extends Model
{
    use HasEmbeddings;

    // Customize embedding fields (optional)
    public function getEmbeddingFields(): array
    {
        return ['title', 'excerpt', 'body'];
    }
}
```

## Security Considerations

### API Keys and Authentication
- API keys are stored securely in environment variables and never logged
- The package validates API key presence at service initialization
- Supports multiple providers with proper key validation

### Data Privacy and Protection
- **Auto-embedding is disabled by default** - must be explicitly enabled via `SEMANTICA_AUTO_EMBED=true`
- Text content is sanitized before sending to external APIs (HTML tags removed, whitespace normalized)
- Input validation prevents empty or malicious text from being processed
- Embeddings are hidden from model JSON serialization by default

### Input Validation and Sanitization
- Search queries are trimmed and validated for emptiness
- Model class names are validated to prevent class injection attacks
- Configured models are verified to be valid Eloquent classes
- Text length is limited to prevent abuse (8KB max)

### Performance and Abuse Prevention
- Embedding generation is rate-limited by external API constraints
- Batch processing limits prevent memory exhaustion
- Search results are capped (max 100 results)
- Similarity thresholds are clamped between 0.0 and 1.0

### Network Security
- HTTPS is enforced for API communications
- HTTP client includes retry logic for resilience
- Timeouts prevent hanging requests

### Configuration Security
- Sensitive configuration values are properly typed and validated
- Unsupported providers throw exceptions instead of falling back silently

### Logging and Monitoring
- Errors are logged without exposing sensitive information
- API failures include status codes but not response bodies in logs
- Performance metrics (text length, provider, model) are logged for monitoring

### Best Practices
- Regularly rotate API keys
- Monitor API usage and costs
- Use caching to reduce external API calls
- Test with mock providers in development
- Keep dependencies updated for security patches

## Supported Providers

- **OpenAI**: High-quality embeddings with multiple models available
- **Anthropic**: Currently not supported for embeddings (API doesn't provide embedding endpoints) - placeholder implementation
- **Gemini**: Google's embedding models via Generative AI API
- **Ollama**: Run embedding models locally using Ollama

## API Reference

### Facade Methods

```php
use Dgtlss\Semantica\Facades\Semantica;

// Search for similar content
$results = Semantica::search('query text', App\Models\Post::class, 10, 0.8);

// Get models directly
$posts = Semantica::searchModels('query text', App\Models\Post::class);

// Embed a model manually
Semantica::embed($model);
```

### Service Methods

```php
use Dgtlss\Semantica\Services\EmbeddingService;
use Dgtlss\Semantica\Services\SearchService;

$embeddingService = app(EmbeddingService::class);
$searchService = app(SearchService::class);

// Generate embedding for text
$embedding = $embeddingService->generateEmbedding('text');

// Embed a model
$embeddingService->embed($model);

// Search
$results = $searchService->search('query', App\Models\Post::class);
$models = $searchService->searchModels('query', App\Models\Post::class);
```

## Extending Providers

To add support for additional embedding providers, implement the `EmbeddingProviderInterface`:

```php
<?php

namespace Dgtlss\Semantica\Services\Providers;

use Dgtlss\Semantica\Services\Providers\EmbeddingProviderInterface;

class CustomProvider implements EmbeddingProviderInterface
{
    public function __construct(array $config) { /* ... */ }

    public function generateEmbedding(string $text): array { /* ... */ }

    public function getModel(): string { /* ... */ }

    public function getDimensions(): int { /* ... */ }
}
```

Then update the service provider to register your provider.

## Development and Quality Assurance

### Static Analysis

This package uses PHPStan for static analysis to ensure code quality:

```bash
vendor/bin/phpstan analyse
```

### Code Quality Tools

- **PHPStan**: Static analysis with strict level 8 configuration
- **Rector**: Automated code refactoring (run with `vendor/bin/rector process`)
- **Larastan**: Laravel-specific PHPStan extensions
- **Pest**: Modern PHP testing framework

### Testing

Run tests with Pest:

```bash
vendor/bin/pest
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure your API key is set in `.env` file with the correct name for your provider.

2. **Embedding Generation Fails**: Check your API key validity and network connectivity. For Ollama, ensure the service is running.

3. **Model Not Found During Search**: Ensure models using `HasEmbeddings` trait have been properly indexed using the artisan commands.

4. **Low Similarity Scores**: Adjust the similarity threshold or check if your content is being embedded correctly.

### Debug Commands

Index specific models:
```bash
php artisan semantica:index App\\Models\\Post
```

Reindex all models:
```bash
php artisan semantica:reindex --all
```

Check embeddings table:
```bash
php artisan tinker
>>> Dgtlss\Semantica\Models\Embedding::count()
```

## Requirements

- PHP 8.1+
- Laravel 10.0+ or 11.0+
- API key for chosen provider (OpenAI or Gemini) or Ollama installation for local models

## License

MIT License