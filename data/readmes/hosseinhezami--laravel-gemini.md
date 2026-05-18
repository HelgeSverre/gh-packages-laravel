# Laravel Gemini

A production-ready Laravel package to integrate with the Google Gemini API. Supports text, image, video, audio, long-context, structured output, files, caching, function-calling and understanding capabilities.

[![Version](https://img.shields.io/packagist/v/hosseinhezami/laravel-gemini.svg)](https://packagist.org/packages/hosseinhezami/laravel-gemini)
[![Downloads](https://img.shields.io/packagist/dt/hosseinhezami/laravel-gemini.svg)](https://packagist.org/packages/hosseinhezami/laravel-gemini)
[![Star](https://img.shields.io/packagist/stars/hosseinhezami/laravel-gemini.svg)](https://packagist.org/packages/hosseinhezami/laravel-gemini)
[![License](https://img.shields.io/packagist/l/hosseinhezami/laravel-gemini.svg)](https://packagist.org/packages/hosseinhezami/laravel-gemini)
[![Laravel Compatible](https://img.shields.io/badge/Laravel-10%2B-brightgreen.svg)](https://hosseinhezami.github.io/laravel-gemini)

## Features

- 🤖 Text generation with context and history
- 🖼️ Image generation and understanding
- 🎥 Video generation and analysis
- 🔊 Audio synthesis and transcription
- 📄 Document processing and understanding
- 🔍 Embeddings generation
- 📊 File management capabilities
- ⚡ Real-time streaming responses
- 🛡️ Configurable safety settings
- 🗄️ Caching for pre-processed content

## Installation

```bash
composer require hosseinhezami/laravel-gemini
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=gemini-config
```

Add your Gemini API key to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Configuration (detailed)

Configuration lives in `config/gemini.php`. Below are the most important keys and recommended defaults:

| Key | Description | Default |
|---|---:|---|
| `api_key` | Your Gemini API key. | `env('GEMINI_API_KEY')` |
| `base_uri` | Base API endpoint. | `https://generativelanguage.googleapis.com/v1beta/` |
| `default_provider` | Which provider config to use by default. | `gemini` |
| `timeout` | Request timeout in seconds. | `30` |
| `retry_policy.max_retries` | Retry attempts for failed requests. | `30` |
| `retry_policy.retry_delay` | Delay between retries in ms. | `1000` |
| `logging` | Log requests/responses (useful for debugging). | `false` |
| `stream.chunk_size` | Stream buffer chunk size. | `1024` |
| `stream.timeout` | Stream timeout (ms). | `1000` |
| `caching.default_ttl` | Default TTL for cache expiration (e.g., '3600s'). | `'3600s'` |
| `caching.default_page_size` | Default page size for listing caches. | `50` |

### Providers / models / methods

The `providers` array lets you map capability types to models and HTTP methods the provider uses:

| Provider | Capability | Config key | Default model | Default method |
|---|---:|---|---:|---|
| `gemini` | text | `providers.gemini.models.text` | `gemini-2.5-flash-lite` | `generateContent` |
| `gemini` | image | `providers.gemini.models.image` | `gemini-2.5-flash-image-preview` | `generateContent` or `predict` |
| `gemini` | video | `providers.gemini.models.video` | `veo-3.0-fast-generate-001` | `predictLongRunning` |
| `gemini` | audio | `providers.gemini.models.audio` | `gemini-2.5-flash-preview-tts` | `generateContent` |
| `gemini` | embeddings | `providers.gemini.models.embedding` | `gemini-embedding-001` | n/a (embeddings endpoint) |

**Speech config** (`providers.gemini.default_speech_config`) example:

```php
'default_speech_config' => [
    'voiceName' => 'Kore',
    // 'speakerVoices' => [
    //     ['speaker' => 'Joe', 'voiceName' => 'Kore'],
    //     ['speaker' => 'Jane', 'voiceName' => 'Puck'],
    // ],
],
```

## Dynamic API Key Configuration

By default, Laravel Gemini reads the API key from your `.env` file (`GEMINI_API_KEY`).

However, you can now **set the API key dynamically at runtime** using the new `setApiKey()` method.  
This is useful when you want to switch between multiple keys (e.g. per-user or per-request).

**Example:**

```php
use HosseinHezami\LaravelGemini\Facades\Gemini;

// Dynamically set API key (takes priority over .env)
Gemini::setApiKey('my-custom-api-key');

// Use Gemini as usual
$response = Gemini::text()
    ->prompt('Hello Gemini!')
    ->generate();

echo $response->content();
````

If `setApiKey()` is not called, the package will automatically use the default key from `.env`.

**ApiKey priority order:**

1. Manually set key via `Gemini::setApiKey()`
2. Config value (`config/gemini.php`)
3. `.env` variable (`GEMINI_API_KEY`)

---

## Builder APIs — full method reference

This package exposes a set of builder-style facades: `Gemini::text()`, `Gemini::image()`, `Gemini::video()`, `Gemini::audio()`, `Gemini::embeddings()`, `Gemini::files()` and `Gemini::caches()`.

Below is a concise reference of commonly available chainable methods and what they do. Method availability depends on the builder.

### Common response helpers (Response object)
When you call `->generate()` (or a polling save on long-running jobs) you typically get a response object with these helpers:

- `content()` — main textual output (string).  
- `model()` — model name used.  
- `usage()` — usage / billing info returned by the provider.  
- `requestId()` — provider request id.  
- `save($path)` — convenience method to download and persist a result to disk (media).

---

### Gemini::

```php
use HosseinHezami\LaravelGemini\Facades\Gemini;
```

### TextBuilder (`Gemini::text()`)

Use for: chat-like generation, long-context text, structured output, and multimodal understanding (text responses after uploading files).

Common methods:

| Method | Args | Description |
|---|---:|---|
| `model(string)` | model id | Choose model to use. |
| `prompt(string/array)` | user prompt or parts | Main prompt(s). |
| `system(string)` | system instruction | System-level instruction. |
| `history(array)` | chat history | Conversation history array (role/parts structure). |
| `structuredSchema(array)` | JSON Schema | Ask model to produce structured JSON (schema validation). |
| `temperature(float)` | 0.0-1.0 | Sampling temperature. |
| `maxTokens(int)` | token limit | Max tokens for generation. |
| `safetySettings(array)` | array | Safety thresholds from config. |
| `method(string)` | provider method | Override provider method name (e.g., `generateContent`). |
| `upload(string $type, string $path)` | (type, local-file-path) | Attach a file (image/document/audio/video) to the request. |
| `cache(array $tools = [], array $toolConfig = [], string $displayName = null, string $ttl = null, string $expireTime = null)` | optional params | Create a cache from current builder params and return cache name. |
| `getCache(string $name)` | cache name | Get details of a cached content. |
| `cachedContent(string $name)` | cache name | Use a cached content for generation. |
| `stream(callable)` | callback | Stream chunks (SSE / server events). |
| `generate()` | — | Execute request and return a Response object. |

**Notes on `history` structure**  
History entries follow a `role` + `parts` format:

```php
[
    ['role' => 'user', 'parts' => [['text' => 'User message']]],
    ['role' => 'model', 'parts' => [['text' => 'Assistant reply']]]
]
```

**Text**

```php
$response = Gemini::text()
    ->model('gemini-2.5-flash')
    ->system('You are a helpful assistant.')
    ->prompt('Write a conversation between human and Ai')
    ->history([
        ['role' => 'user', 'parts' => [['text' => 'Hello AI']]],
        ['role' => 'model', 'parts' => [['text' => 'Hello human!']]]
    ])
    ->temperature( 0.7)
    ->maxTokens(1024)
    ->generate();

echo $response->content();
```

**Streaming Responses**

```php
return response()->stream(function () use ($request) {
    Gemini::text()
        ->model('gemini-2.5-flash')
        ->prompt('Tell a long story about artificial intelligence.')
        ->stream(function ($chunk) {
            $text = $chunk['text'] ?? '';
            if (!empty(trim($text))) {
                echo "data: " . json_encode(['text' => $text]) . "\n\n";
                ob_flush();
                flush();
            }
        });
}, 200, [
    'Content-Type' => 'text/event-stream',
    'Cache-Control' => 'no-cache',
    'Connection' => 'keep-alive',
    'X-Accel-Buffering' => 'no',
]);
```

**Document Understanding**

```php
$response = Gemini::text()
    ->upload('document', $filePath) // image, video, audio, document
    ->prompt('Extract the key points from this document.')
    ->generate();

echo $response->content();
```

**Structured output**

```php
$response = Gemini::text()
    ->model('gemini-2.5-flash')
    ->structuredSchema([
    'type' => 'object',
    'properties' => [
        'name' => ['type' => 'string'],
        'age'  => ['type' => 'integer']
    ],
    'required' => ['name']
    ])
    ->prompt('Return a JSON object with name and age.')
    ->generate();

$json = $response->content(); // Parsable JSON matching the schema
```

---

### ImageBuilder (`Gemini::image()`)

Use for image generation.

| Method | Args | Description |
|---|---:|---|
| `model(string)` | model id | Model for image generation. |
| `prompt(string)` | prompt text | Image description. |
| `method(string)` | e.g. `predict` | Provider method (predict / generateContent). |
| `cache(array $tools = [], array $toolConfig = [], string $displayName = null, string $ttl = null, string $expireTime = null)` | optional params | Create a cache from current builder params and return cache name. |
| `getCache(string $name)` | cache name | Get details of a cached content. |
| `cachedContent(string $name)` | cache name | Use a cached content for generation. |
| `generate()` | — | Run generation. |
| `save($path)` | local path | Save image bytes to disk. |

**Image**

```php
$response = Gemini::image()
    ->model('gemini-2.5-flash-image-preview')
    ->method('generateContent')
    ->prompt('A futuristic city skyline at sunset.')
    ->generate();

$response->save('image.png');
```

---

### VideoBuilder (`Gemini::video()`)

Use for short or long-running video generation.

| Method | Args | Description |
|---|---:|---|
| `model(string)` | model id | Video model. |
| `prompt(string)` | prompt | Describe the video. |
| `cache(array $tools = [], array $toolConfig = [], string $displayName = null, string $ttl = null, string $expireTime = null)` | optional params | Create a cache from current builder params and return cache name. |
| `getCache(string $name)` | cache name | Get details of a cached content. |
| `cachedContent(string $name)` | cache name | Use a cached content for generation. |
| `generate()` | — | Initiates video creation (may be long-running). |
| `save($path)` | local path | Polls provider and saves final video file. |

**Note:** long-running video generation typically uses `predictLongRunning` or similar. The package abstracts polling & saving.

---

### AudioBuilder (`Gemini::audio()`)

Use for TTS generation.

| Method | Args | Description |
|---|---:|---|
| `model(string)` | model id | TTS model. |
| `prompt(string)` | text-to-speak | Audio file description |
| `voiceName(string)` | voice id | Select a voice (e.g. `Kore`). |
| `speakerVoices(array)` | speakers array | Speakers (e.g. [['speaker' => 'Joe', 'voiceName' => 'Kore'], ['speaker' => 'Jane', 'voiceName' => 'Puck']]). |
| `cache(array $tools = [], array $toolConfig = [], string $displayName = null, string $ttl = null, string $expireTime = null)` | optional params | Create a cache from current builder params and return cache name. |
| `getCache(string $name)` | cache name | Get details of a cached content. |
| `cachedContent(string $name)` | cache name | Use a cached content for generation. |
| `generate()` | — | Generate audio bytes. |
| `save($path)` | local path | Save generated audio (wav/mp3). |

---

### Embeddings (`Gemini::embeddings()`)

Accepts a payload array. Typical shape:

```php
$embeddings = Gemini::embeddings([
    'model' => 'gemini-embedding-001',
    'content' => ['parts' => [['text' => 'Text to embed']]],
]);

/* embedding_config */
// https://ai.google.dev/gemini-api/docs/embeddings
// 'embedding_config': {
//     'embedding_config': {
//         'task_type': 'SEMANTIC_SIMILARITY', // SEMANTIC_SIMILARITY, CLASSIFICATION, CLUSTERING, RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, CODE_RETRIEVAL_QUERY, QUESTION_ANSWERING, FACT_VERIFICATION
//         'embedding_dimensionality': 768 // 128, 256, 512, 768, 1536, 2048
//     }
// }
```
Return value is the raw embeddings structure (provider-specific). Use these vectors for semantic search, similarity, clustering, etc.

---

### Files API (`Gemini::files()`)

High level file manager for uploads used by the "understanding" endpoints.

| Method | Args | Description |
|---|---:|---|
| `upload(string $type, string $localPath)` | `type` in `[document,image,video,audio]` | Upload a local file and return a provider `uri` or `file id`. |
| `list()` | — | Return a list of uploaded files (metadata). |
| `get(string $id)` | file id | Get file metadata (name, uri, state, mimeType, displayName). |
| `delete(string $id)` | file id | Delete a previously uploaded file. |

**Files**

```php
// Upload a file
$uri = Gemini::files()->upload('document', $pathToFile);

// List all files
$files = Gemini::files()->list();

// Get file details
$fileInfo = Gemini::files()->get($file_id);

// Delete a file
$success = Gemini::files()->delete($file_id);
```

**Supported file types & MIME**

| Category | Extension | MIME type |
|---|---:|---|
| image | png | image/png |
| image | jpeg | image/jpeg |
| image | jpg | image/jpeg |
| image | webp | image/webp |
| image | heic | image/heic |
| image | heif | image/heif |
| video | mp4 | video/mp4 |
| video | mpeg | video/mpeg |
| video | mov | video/mov |
| video | avi | video/avi |
| video | flv | video/x-flv |
| video | mpg | video/mpg |
| video | webm | video/webm |
| video | wmv | video/wmv |
| video | 3gpp | video/3gpp |
| audio | wav | audio/wav |
| audio | mp3 | audio/mp3 |
| audio | aiff | audio/aiff |
| audio | aac | audio/aac |
| audio | ogg | audio/ogg |
| audio | flac | audio/flac |
| document | pdf | application/pdf |
| document | txt | text/plain |
| document | md | text/markdown |

---

### Caching API (`Gemini::caches()`)

High-level cache manager for pre-processing and storing content (prompts, system instructions, history, files) to reuse in generation requests, reducing latency and costs. Caches are model-specific and temporary.

| Method | Args | Description |
|---|---:|---|
| `create(string $model, array $contents, ?string $systemInstruction = null, array $tools = [], array $toolConfig = [], ?string $displayName = null, ?string $ttl = null, ?string $expireTime = null)` | required/optional params | Create a cached content and return CacheResponse. |
| `list(?int $pageSize = null, ?string $pageToken = null)` | optional params | List cached contents (supports pagination). |
| `get(string $name)` | cache name | Get details of a cached content. |
| `update(string $name, ?string $ttl = null, ?string $expireTime = null)` | cache name and expiration | Update cache expiration (TTL or expireTime). |
| `delete(string $name)` | cache name | Delete a cached content. |

**Caching**

```php
// Create a cache
$cache = Gemini::caches()->create(
    model: 'gemini-2.5-flash',
    contents: [['role' => 'user', 'parts' => [['text' => 'Sample content']]]],
    systemInstruction: 'You are a helpful assistant.',
    tools: [], // Optional
    toolConfig: [], // Optional
    displayName: 'My Cache', // Optional
    ttl: '600s' // Optional TTL (e.g., '300s') or expireTime: '2024-12-31T23:59:59Z'
);
$cacheName = $cache->name(); // e.g., 'cachedContents/abc123'

// List all caches
$caches = Gemini::caches()->list(pageSize: 50, pageToken: 'nextPageToken');

// Get cache details
$cacheInfo = Gemini::caches()->get($cacheName);

// Update cache expiration
$updatedCache = Gemini::caches()->update(
    name: $cacheName,
    ttl: '1200s' // Or expireTime: '2024-12-31T23:59:59Z'
);

// Delete a cache
$success = Gemini::caches()->delete($cacheName);
```

**CacheResponse Methods**

- `name()`: Returns the cache name (e.g., 'cachedContents/abc123')
- `displayName()`: Returns the Display Name (e.g., 'Default Cache')
- `model()`: Returns the model used
- `expireTime()`: Returns expiration
- `usageMetadata()`: Returns usage metadata
- `toArray()`: Full response as array

**Caching in Generation Builders**

Caching is also integrated into text, image, video, and audio builders for seamless use:

```php
// Create cache from builder params
$cacheName = Gemini::text()
    ->model('gemini-2.5-flash')
    ->prompt('Sample prompt')
    ->system('System instruction')
    ->history([['role' => 'user', 'parts' => [['text' => 'History item']]]]) // optional
    ->cache(
        tools: [], // optional
        toolConfig: [], // optional
        displayName: 'My Cache', // optional
        ttl: '600s' // optional, or expireTime
    );

// Get cache details from builder
$cacheInfo = Gemini::text()->getCache($cacheName);

// Use cached content in generation
$response = Gemini::text()
    ->prompt('Summarize this.')
    ->cachedContent($cacheName)
    ->generate();
```

For more details, refer to the [Gemini API Caching Documentation](https://ai.google.dev/api/caching).

---

## Streaming (Server-Sent Events)
The `stream` route uses `Content-Type: text/event-stream`. Connect from a browser or SSE client and consume `data: <json>` messages per chunk.

---

### Streaming behaviour

- Implemented using SSE (Server-Sent Events). The stream yields chunks where each chunk is typically `['text' => '...']`.
- Client should reconnect behaviorally for resilience and handle partial chunks.
- Use response headers:
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`
  - `X-Accel-Buffering: no`

---

## Tips, error handling & best practices

- Respect provider limits — pick appropriate `maxTokens` and `temperature`.  
- For large media (video) prefer long-running `predictLongRunning` models and rely on `save()` to poll and download final asset.  
- Use `safetySettings` from config for content filtering. You can override per-request.  
- When uploading user-supplied files, validate MIME type and size before calling `Gemini::files()->upload`.  
- For caching, use TTL wisely to avoid expired caches; always check expiration in responses.

---

## Artisan Commands

The package includes helpful Artisan commands:

| Command                      | Description                 |
|------------------------------|-----------------------------|
| `php artisan gemini:models`  | List available models.      |

---

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
