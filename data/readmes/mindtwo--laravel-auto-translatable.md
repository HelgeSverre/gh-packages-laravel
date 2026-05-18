[![mindtwo GmbH](https://www.mindtwo.de/downloads/doodles/github/repository-header.png)](https://www.mindtwo.de/)

<div align="center">
  <p align="center">
    <img src="https://img.shields.io/github/check-runs/mindtwo/laravel-auto-translatable/main">
    <img src="https://img.shields.io/badge/php-%3E%3D%208.2-8892BF.svg">
    <img src="https://img.shields.io/badge/laravel-%3E%3D%2011.0-FF2D20.svg">
  </p>

  <strong>
    <h2 align="center">Laravel Auto-Translatable</h2>
  </strong>

  <p align="center">
    AI-powered translation package for Laravel with smart content chunking, extensible adapters, and automatic
    link replacement.
  </p>
</div>
<br />

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Token Configuration](#token-configuration)
  - [Available Configuration Options](#available-configuration-options)
- [Usage](#usage)
  - [Direct Translation](#direct-translation)
  - [Model Translation](#model-translation)
  - [Chunking Strategies](#chunking-strategies)
  - [Custom Post-Processors](#custom-post-processors)
- [Link Replacement](#link-replacement)
- [Events](#events)
- [Advanced Usage](#advanced-usage)
  - [Custom Adapters](#custom-adapters)
  - [Translation Status Tracking](#translation-status-tracking)
  - [Error Handling](#error-handling)
- [Testing](#testing)
- [License](#license)

## Features

- **AI-Powered Translations** - Uses any PRISM-supported provider (Anthropic, OpenAI, Google, etc.)
- **Smart Content Chunking** - Intelligent chunking for long content:
  - **Markdown**: Respects document structure, never breaks mid-section
  - **Plain Text**: Chunks at paragraph, sentence, or word boundaries
  - **Configurable**: Set custom strategies per field
- **Automatic Link Replacement** - Localize internal links in markdown content
- **Extensible Adapter System** - Built-in support for popular i18n packages:
  - `spatie/laravel-translatable`
  - `mindtwo/laravel-translatable`
  - Custom adapters supported

## Installation

Install via Composer:

```bash
composer require mindtwo/laravel-auto-translatable
```

Publish configuration and migrations:

```bash
php artisan vendor:publish --tag=auto-translatable-config
php artisan vendor:publish --tag=auto-translatable-migrations
php artisan migrate
```

## Configuration

Configure the package in `config/auto-translatable.php`:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | AI Provider Configuration
    |--------------------------------------------------------------------------
    */
    'provider' => env('AUTO_TRANSLATABLE_PROVIDER', 'anthropic'),
    'model' => env('AUTO_TRANSLATABLE_MODEL', 'claude-3-5-sonnet-20241022'),

    /*
    |--------------------------------------------------------------------------
    | Token Configuration
    |--------------------------------------------------------------------------
    */
    'chunk_size' => env('AUTO_TRANSLATABLE_CHUNK_SIZE', 80000),
    'output_tokens' => env('AUTO_TRANSLATABLE_OUTPUT_TOKENS', 100000),

    /*
    |--------------------------------------------------------------------------
    | Locales
    |--------------------------------------------------------------------------
    */
    'default_source_locale' => env('AUTO_TRANSLATABLE_SOURCE_LOCALE', 'en'),
    'available_locales' => ['de', 'en', 'fr', 'es', 'it', 'pt', 'nl', 'pl'],

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    */
    'queue_translations' => env('AUTO_TRANSLATABLE_QUEUE_ENABLED', true),
    'queue_connection' => env('AUTO_TRANSLATABLE_QUEUE_CONNECTION'),
    'queue_name' => env('AUTO_TRANSLATABLE_QUEUE_NAME', 'translations'),

    /*
    |--------------------------------------------------------------------------
    | Link Replacement
    |--------------------------------------------------------------------------
    */
    'link_replacement' => [
        'enabled' => false,
        'resolver' => null, // Class implementing LinkMappingResolver
        'internal_hosts' => [],
        'unmapped_links' => 'remove', // 'remove', 'keep', or 'warn'
    ],

    /*
    |--------------------------------------------------------------------------
    | Adapter & Auto-Apply
    |--------------------------------------------------------------------------
    */
    'adapter' => \Mindtwo\AutoTranslatable\Adapters\SpatieTranslatableAdapter::class,
    'auto_apply' => env('AUTO_TRANSLATABLE_AUTO_APPLY', false),
];
```

### Token Configuration

The `chunk_size` and `output_tokens` configuration is critical for handling long content correctly:

- **chunk_size**: Maximum input tokens per chunk (30-50% of model context window)
- **output_tokens**: Maximum tokens for model generation
- **Rule**: `chunk_size + output_tokens ≤ model_context_window`

**Examples for different scenarios:**

```php
// Conservative (handles Chinese→German expansion ~2x)
// Context window: 200,000 tokens
['chunk_size' => 60000, 'output_tokens' => 120000]

// Balanced (most European language pairs)
// Context window: 200,000 tokens
['chunk_size' => 80000, 'output_tokens' => 100000]

// Aggressive (German→English, content shrinks ~20%)
// Context window: 200,000 tokens
['chunk_size' => 100000, 'output_tokens' => 80000]
```

## Usage

### Direct Translation

Translate any string directly using the `TranslationService`:

```php
use Mindtwo\AutoTranslatable\Services\TranslationService;

class MyService
{
    public function __construct(
        private readonly TranslationService $translator,
    ) {}

    public function translateContent(): void
    {
        // Simple translation
        $result = $this->translator->translate(
            content: 'Hello World',
            sourceLocale: 'en',
            targetLocale: 'de'
        );

        echo $result->translated_content; // "Hallo Welt"
        echo $result->status; // TranslationStatus::COMPLETED
        echo $result->chunks_count; // 1
    }

    public function translateLongContent(): void
    {
        $longMarkdown = file_get_contents('article.md');

        // Automatically chunks large content
        $result = $this->translator->translate(
            content: $longMarkdown,
            sourceLocale: 'en',
            targetLocale: 'de',
            options: [
                'chunking_strategy' => 'markdown', // or 'plain', 'none', 'auto'
                'chunk_size' => 50000, // Override default
            ]
        );

        echo $result->chunks_count; // e.g., 3
        echo $result->translated_content; // Full translated content
    }
}
```

### Model Translation

Translate Eloquent models automatically using the `HasAutoTranslations` trait.

#### 1. Add Trait to Your Model

```php
use Illuminate\Database\Eloquent\Model;
use Mindtwo\AutoTranslatable\Concerns\HasAutoTranslations;
use Spatie\Translatable\HasTranslations;

class Post extends Model
{
    use HasTranslations;      // From spatie/laravel-translatable
    use HasAutoTranslations;  // From this package

    public array $translatable = ['title', 'body', 'excerpt'];

    /**
     * Define which fields should be auto-translated.
     */
    public function autoTranslatableFields(): array
    {
        return ['title', 'body', 'excerpt'];
    }

    /**
     * Optional: Define chunking strategies per field.
     */
    public function chunkingStrategies(): array
    {
        return [
            'title' => 'none',      // Don't chunk titles
            'body' => 'markdown',   // Smart markdown chunking
            'excerpt' => 'plain',   // Plain text chunking
        ];
    }
}
```

#### 2. Configure Adapter

Choose the appropriate adapter in your config:

```php
// For spatie/laravel-translatable
'adapter' => \Mindtwo\AutoTranslatable\Adapters\SpatieTranslatableAdapter::class,

// For mindtwo/laravel-translatable
'adapter' => \Mindtwo\AutoTranslatable\Adapters\MindtwoTranslatableAdapter::class,
```

#### 3. Translate Your Model

```php
// Translate to all configured locales
$post->autoTranslate();

// Translations are queued by default
// Set 'queue_translations' => false in config for synchronous translation

// Later, retrieve translations:
$post->getTranslation('title', 'de');    // "Deutscher Titel"
$post->getTranslation('body', 'fr');     // "Corps français"

// Access translation results
$results = $post->translationResults()
    ->where('status', TranslationStatus::COMPLETED)
    ->get();

foreach ($results as $result) {
    echo "{$result->field_name}: {$result->target_locale} - {$result->status}";
}
```

### Chunking Strategies

The package provides three chunking strategies:

#### 1. **Markdown Chunking** (`markdown`)

Smart chunking that preserves document structure:

```php
$result = $translator->translate(
    content: '# Heading\n\nParagraph...',
    sourceLocale: 'en',
    targetLocale: 'de',
    options: ['chunking_strategy' => 'markdown']
);

// Features:
// - Respects heading boundaries
// - Never breaks mid-paragraph
// - Preserves code blocks
// - Greedy packing of sections that fit together
```

#### 2. **Plain Text Chunking** (`plain`)

Intelligent text chunking with fallback levels:

```php
$result = $translator->translate(
    content: 'Long plain text...',
    sourceLocale: 'en',
    targetLocale: 'de',
    options: ['chunking_strategy' => 'plain']
);

// Chunking hierarchy:
// 1. Try paragraph boundaries (double newlines)
// 2. Fall back to sentence boundaries (. ! ?)
// 3. Last resort: word boundaries
```

#### 3. **No Chunking** (`none`)

Pass content as-is without chunking:

```php
$result = $translator->translate(
    content: 'Short title',
    sourceLocale: 'en',
    targetLocale: 'de',
    options: ['chunking_strategy' => 'none']
);
```

### Custom Post-Processors

Add custom post-processing logic:

```php
use Mindtwo\AutoTranslatable\Contracts\PostProcessor;
use Mindtwo\AutoTranslatable\Models\TranslationResult;

class CustomPostProcessor implements PostProcessor
{
    public function process(string $content, TranslationResult $result, array $context = []): string
    {
        // Your custom logic
        return str_replace('old', 'new', $content);
    }
}

// Use it
$result = $translator->translate(
    content: 'Some content',
    sourceLocale: 'en',
    targetLocale: 'de',
    options: [
        'post_processors' => [
            new CustomPostProcessor(),
        ],
    ]
);
```

## Link Replacement

Automatically localize internal links in markdown content.

### 1. Create a Link Mapping Resolver

```php
namespace App\Services;

use Mindtwo\AutoTranslatable\Contracts\LinkMappingResolver;

class BlogLinkResolver implements LinkMappingResolver
{
    /**
     * Provide static URL mappings.
     */
    public function getMapping(string $sourceLocale, string $targetLocale): array
    {
        return [
            '/blog/getting-started' => '/blog/erste-schritte',
            '/contact' => '/kontakt',
            '/about' => '/ueber-uns',
        ];
    }

    /**
     * Dynamic resolution for URLs not in static mapping.
     */
    public function resolve(string $url, string $sourceLocale, string $targetLocale): ?string
    {
        // Example: Fetch from database
        $post = Post::query()->where('slug', ltrim($url, '/'))->first();

        if ($post) {
            return '/' . $post->getTranslation('slug', $targetLocale);
        }

        return null;
    }
}
```

### 2. Configure Link Replacement

```php
'link_replacement' => [
    'enabled' => true,
    'resolver' => \App\Services\BlogLinkResolver::class,
    'internal_hosts' => [
        'https://example.com',
        'https://www.example.com',
    ],
    'unmapped_links' => 'remove', // Options: 'remove', 'keep', 'warn'
],
```

### 3. Example

**Input (English):**
```markdown
Read our [getting started guide](/blog/getting-started) and [contact us](/contact).
Also check out [this untranslated post](/blog/new-post).
Visit [Google](https://google.com) for more info.
```

**Output (German):**
```markdown
Read our [getting started guide](/blog/erste-schritte) and [contact us](/kontakt).
Also check out this untranslated post.
Visit [Google](https://google.com) for more info.
```

## Events

The package dispatches events throughout the translation lifecycle:

### TranslationCompleted

Fired when a single field translation completes successfully.

```php
use Mindtwo\AutoTranslatable\Events\TranslationCompleted;

Event::listen(TranslationCompleted::class, function (TranslationCompleted $event) {
    // $event->result - TranslationResult instance
    // $event->model - Model that was translated (if applicable)
    // $event->field - Field name that was translated

    Log::info("Translation completed: {$event->field} -> {$event->result->target_locale}");
});
```

### TranslationFailed

Fired when a translation fails.

```php
use Mindtwo\AutoTranslatable\Events\TranslationFailed;

Event::listen(TranslationFailed::class, function (TranslationFailed $event) {
    // $event->result - TranslationResult instance
    // $event->error - Error message
    // $event->model - Model that failed translation
    // $event->field - Field name that failed

    Log::error("Translation failed: {$event->field} - {$event->error}");

    // Optionally notify administrators
    Mail::to('admin@example.com')->send(new TranslationFailedNotification($event));
});
```

### ModelTranslationCompleted

Fired when all fields of a model have been processed (some may have failed).

```php
use Mindtwo\AutoTranslatable\Events\ModelTranslationCompleted;

Event::listen(ModelTranslationCompleted::class, function (ModelTranslationCompleted $event) {
    // $event->model - The translated model
    // $event->results - Collection of TranslationResult instances
    // $event->fields - Array of field names that were translated

    $successful = $event->results->where('status', TranslationStatus::COMPLETED)->count();
    $failed = $event->results->where('status', TranslationStatus::FAILED)->count();

    Log::info("Model translation completed: {$successful} successful, {$failed} failed");
});
```

### Manual Translation Application

Listen to events and apply translations manually:

First, disable auto applying:

```
AUTO_TRANSLATABLE_AUTO_APPLY=false
```

```php
use Mindtwo\AutoTranslatable\Events\ModelTranslationCompleted;
use Mindtwo\AutoTranslatable\Contracts\TranslatableAdapter;
use Mindtwo\AutoTranslatable\Adapters\SpatieTranslatableAdapter;

Event::listen(ModelTranslationCompleted::class, function (ModelTranslationCompleted $event) {
    // Review changes manually, e.g. through an admin interface, then:
    resolve(SpatieTranslatableAdapter::class)->applyTranslations($event->model, $event->results);
});
```

## Advanced Usage

### Custom Adapters

Create a custom adapter for your i18n package:

```php
namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Mindtwo\AutoTranslatable\Contracts\TranslatableAdapter;

class MyCustomAdapter implements TranslatableAdapter
{
    public function supports(Model $model): bool
    {
        return $model instanceof MyTranslatableModel;
    }

    public function getAvailableLocales(Model $model): array
    {
        return config('app.locales');
    }

    public function getSourceLocale(Model $model): string
    {
        return $model->source_locale ?? config('app.locale');
    }

    public function getFieldValue(Model $model, string $field, string $locale): ?string
    {
        return $model->translate($field, $locale);
    }

    public function applyTranslations(Model $model, string $locale, array $translations): void
    {
        foreach ($translations as $field => $value) {
            $model->setTranslation($field, $locale, $value);
        }
        $model->save();
    }
}
```

Register your adapter:

```php
'adapter' => \App\Services\MyCustomAdapter::class,
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Created by [mindtwo GmbH](https://mindtwo.de)

## Support

- **Issues**: [GitHub Issues](https://github.com/mindtwo/laravel-auto-translatable/issues)
- **Documentation**: [GitHub Repository](https://github.com/mindtwo/laravel-auto-translatable)
- **Email**: [info@mindtwo.de](mailto:info@mindtwo.de)
