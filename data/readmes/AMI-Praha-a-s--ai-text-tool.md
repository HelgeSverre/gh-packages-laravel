# AmiPraha AiTextTool

`AmiPraha\AiTextTool` is a Laravel package for OpenAI-powered text operations with multilingual language packs.

## Features

- Text summarization with requested output length.
- Headline generation with requested max length.
- Translation using the same output language resolution as all other operations.
- Text repair (grammar, punctuation, readability improvements).
- Native language packs for multiple languages to improve output quality with non-English source text.

## Supported Languages

Languages are defined by the `AmiPraha\AiTextTool\Language` enum:

- `Language::English`
- `Language::Czech`
- `Language::Slovak`
- `Language::German`
- `Language::Spanish`

## Installation

```bash
composer require ami-praha/ai-text-tool
```

Publish package config:

```bash
php artisan vendor:publish --tag=ai-text-tool-config
```

Optional: publish language files so you can customize them:

```bash
php artisan vendor:publish --tag=ai-text-tool-languages
```

## Configuration

File: `config/ai-text-tool.php`

- `default_language`: default language used by package (must match a `Language` enum value).
- `custom_language_path`: optional directory with language files that override package language files.
- `openai_api_key`: OpenAI API key used for chat completion requests.
- `openai_model`: OpenAI model used by package operations.
- `openai_base_url`: optional OpenAI-compatible base URL (useful for gateways/proxies).
- `timeout`: HTTP timeout in seconds.

Example:

```php
return [
    'default_language' => 'english',
    'custom_language_path' => resource_path('ai-text-tool/languages'),
    'openai_api_key' => env('OPENAI_API_KEY'),
    'openai_model' => 'gpt-4.1-mini',
    'openai_base_url' => 'https://api.openai.com/v1',
    'timeout' => 60,
];
```

Environment variables:

```env
OPENAI_API_KEY=your-api-key
AI_TEXT_TOOL_LANGUAGE=english
AI_TEXT_TOOL_LANGUAGE_PATH=/full/path/to/language/files
AI_TEXT_TOOL_OPENAI_MODEL=gpt-4.1-mini
AI_TEXT_TOOL_OPENAI_BASE_URL=https://api.openai.com/v1
AI_TEXT_TOOL_TIMEOUT=60
```

## Usage

```php
use AmiPraha\AiTextTool\Facades\AiTextTool;
use AmiPraha\AiTextTool\Language;

$summary = AiTextTool::summarize($sourceText, 450);
$headline = AiTextTool::headline($sourceText, 50);
$translation = AiTextTool::translate($sourceText);
$repaired = AiTextTool::repair($sourceText);
```

### Fluent per-call output language override

All operations use the configured `default_language` for output. Use `usingLanguage()` to override the output language per call:

```php
$summary = AiTextTool::usingLanguage(Language::Czech)->summarize($sourceText, 450);
$headline = AiTextTool::usingLanguage(Language::German)->headline($sourceText, 50);
$translation = AiTextTool::usingLanguage(Language::Slovak)->translate($sourceText);
```

The override is immutable and per-call, so it does not change global config defaults.

### Optional source language hint

Use `fromLanguage()` to tell the LLM what language the source text is written in. This is optional -- when not provided, the model detects the source language automatically.

```php
$translation = AiTextTool::usingLanguage(Language::German)->fromLanguage(Language::Czech)->translate($sourceText);
$summary = AiTextTool::fromLanguage(Language::Czech)->summarize($sourceText, 300);
```

Both `usingLanguage()` and `fromLanguage()` are immutable and can be chained in any order.

## Requirements

- PHP 8.2+
- Laravel 12+
- OpenAI API key.
