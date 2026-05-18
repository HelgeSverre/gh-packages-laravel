# Laravel Claude

Laravel Claude is a Laravel 10/11/12 compatible package for strongly typed, convenient access to the Anthropic Claude API. It builds on the Laravel HTTP client, validates every payload before sending, and ships with a Facade for quick use.

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12
- A valid Anthropic Claude API key (`CLAUDE_API_KEY`)

## Installation

```bash
composer require gaalgergely/laravel-claude
```

If you want to customize the defaults, publish the configuration:

```bash
php artisan vendor:publish --tag=claude
```

## Configuration

Default values live in `config/claude.php`:

```php
return [
    'base_url' => env('CLAUDE_BASE_URL', 'https://api.anthropic.com/v1'),
    'api_key' => env('CLAUDE_API_KEY'),
    'anthropic_version' => env('CLAUDE_ANTHROPIC_VERSION', '2023-06-01'),
    'model' => env('CLAUDE_MODEL', 'claude-sonnet-4-5-20250929'),
    'max_tokens' => env('CLAUDE_MAX_TOKENS', 1024),
    'temperature' => env('CLAUDE_TEMPERATURE', 1.0),
    'timeout' => env('CLAUDE_TIMEOUT', 60),
    'retries' => env('CLAUDE_RETRIES', 1),
    'anthropic-beta' => env('CLAUDE_ANTHROPIC_BETA', 'files-api-2025-04-14'),
];
```

Key environment variables:

- `CLAUDE_API_KEY` (required)
- `CLAUDE_MODEL`, `CLAUDE_MAX_TOKENS`, `CLAUDE_TEMPERATURE` – defaults that validation fills in when missing fields are allowed.
- `CLAUDE_TIMEOUT`, `CLAUDE_RETRIES` – HTTP client tuning.
- `CLAUDE_ANTHROPIC_BETA` – beta header required for the Files API.

## Usage

Access the service through the `Claude` facade or via dependency injection.

### Quick message examples

Reference: [Claude Messages API](https://platform.claude.com/docs/en/api/messages)

```php
use GaalGergely\LaravelClaude\Facades\Claude;

$response = Claude::sendMessages([
    'system' => 'You are a helpful assistant.',
    'messages' => [
        ['role' => 'user', 'content' => 'Tell me a joke!'],
    ],
]);

// Plain text reply
$text = data_get($response, 'content.0.text');

// Send an image using base64 content
$responseWithUploadedImage = Claude::sendMessages([
    'model' => 'claude-sonnet-4.5-20250929',
    'max_tokens' => 1024,
    'messages' => [
        [
            'role' => 'user',
            'content' => [
                [
                    'type' => 'image',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => 'image/jpeg', // image/png, image/gif, image/webp
                        'data' => base64_encode(Storage::get('cat.jpg')),
                    ],
                ],
                [
                    'type' => 'text',
                    'text' => 'What is in the image above?',
                ],
            ],
        ],
    ],
]);

// Send an image by URL
$responseWithImageUrl = Claude::sendMessages([
    'model' => 'claude-sonnet-4.5-20250929',
    'max_tokens' => 1024,
    'messages' => [
        [
            'role' => 'user',
            'content' => [
                [
                    'type' => 'image',
                    'source' => [
                        'type' => 'url',
                        'url' => 'https://d2ph5hv9wocr4u.cloudfront.net/06/cat1589.jpg',
                    ],
                ],
                [
                    'type' => 'text',
                    'text' => 'What is in the image above?',
                ],
            ],
        ],
    ],
]);
```

### Streaming responses

Reference: [Claude Messages Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)

```php
$events = Claude::sendMessages([
    'messages' => [
        ['role' => 'user', 'content' => 'Give me a short overview of Laravel!'],
    ],
    'stream' => true,
]);

foreach ($events as $event) {
    // Individual SSE payloads arrive as JSON arrays
}
```

### Counting tokens

Reference: [Count Message Tokens](https://platform.claude.com/docs/en/api/messages/count_tokens)

```php
$result = Claude::countMessageTokens([
    'messages' => [
        ['role' => 'user', 'content' => 'How many tokens is this?'],
    ],
]);

$tokenCount = $result['input_tokens'] ?? null;
```

### Querying models

Reference: [Models API](https://platform.claude.com/docs/en/api/models)

```php
$models = Claude::listModels(limit: 20);
$opus = Claude::getModel('claude-3-opus-20240229');

// Paginate forward or backward with cursor-style parameters
$nextPage = Claude::listModels(afterId: data_get($models, 'last_id'));
$previousPage = Claude::listModels(beforeId: data_get($models, 'first_id'));
```

### Message batches

Reference: [Message Batches API](https://platform.claude.com/docs/en/api/messages/batches)

```php
$batch = Claude::createMessageBatch([
    'requests' => [
        [
            'custom_id' => 'req-1',
            'params' => [
                'messages' => [
                    ['role' => 'user', 'content' => 'Share a motivational quote!'],
                ],
            ],
        ],
    ],
]);

$status = Claude::retrieveMessageBatch($batch['id']);
$results = Claude::retrieveMessageBatchResults($batch['id']);

// List batches with cursor pagination
$batches = Claude::listMessageBatches(limit: 10);
$olderBatches = Claude::listMessageBatches(afterId: data_get($batches, 'last_id'));
```

### File operations

Reference: [Files API](https://platform.claude.com/docs/en/api/beta/files)

```php
$file = Claude::createFile([
    'name' => 'notes.txt',
    'content' => "Project notes...",
]);

$files = Claude::listFiles();
$metadata = Claude::getFileMetadata($file['id']);
$content = Claude::downloadFile($file['id']);
Claude::deleteFile($file['id']);

// Use cursor-style pagination to browse more files
$moreFiles = Claude::listFiles(afterId: data_get($files, 'last_id'), limit: 20);
```

## Validation and error handling

Every call validates the outgoing payload. On failure a `PayloadValidationException` is thrown with all validation messages and the original data:

```php
use GaalGergely\LaravelClaude\Exceptions\PayloadValidationException;

try {
    Claude::sendMessages([...]);
} catch (PayloadValidationException $e) {
    logger()->error('Claude payload error', $e->toArray());
}
```

If the API key is missing an `ApiKeyIsMissingException` is thrown, so ensure `CLAUDE_API_KEY` is set.
