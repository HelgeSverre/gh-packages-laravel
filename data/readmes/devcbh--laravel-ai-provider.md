# Laravel AI Provider

[![Latest Version on Packagist](https://img.shields.io/packagist/v/devcbh/laravel-ai-provider.svg?style=flat-square)](https://packagist.org/packages/devcbh/laravel-ai-provider)
[![Total Downloads](https://img.shields.io/packagist/dt/devcbh/laravel-ai-provider.svg?style=flat-square)](https://packagist.org/packages/devcbh/laravel-ai-provider)
[![License](https://img.shields.io/packagist/l/devcbh/laravel-ai-provider.svg?style=flat-square)](https://packagist.org/packages/devcbh/laravel-ai-provider)

A powerful, secure, and intuitive Laravel wrapper for multiple AI providers. Switch between OpenAI, Anthropic (Claude), Google (Gemini), Mistral, and Ollama with a single, fluent API.

---

## 🚀 Key Features

- **Multi-Provider Support**: unified API for OpenAI, Gemini, Claude, Mistral, and Ollama.
- **Privacy First (PII Masking)**: Automatically detect and mask sensitive data before it leaves your server.
- **Zero Liability Design**: Built-in tools for reversible masking or irreversible redaction.
- **Fluent & Expressive API**: Chain methods for configuration, role-setting, and driver switching.
- **Structured Output**: Enforce JSON schemas across all supported drivers.
- **Smart Failover**: Automatic provider fallback if your primary AI service is down.
- **Parallel Requests**: Handle multiple AI calls concurrently using Laravel's HTTP pool.
- **Prompt Templates**: Reusable templates for common tasks like Sentiment Analysis, Summarization, and more.
- **Streaming**: Real-time response streaming for chat interfaces.
- **Tool/Function Calling**: Easily bridge AI with your PHP logic.

---

## 📦 Installation

Install the package via composer:

```bash
composer require devcbh/laravel-ai-provider
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="ai-config"
```

## ⚙️ Configuration

Add your API keys to your `.env` file:

```env
# Default driver: openai, gemini, claude, mistral, ollama
LARAVEL_AURA_AI_DRIVER=openai

# Provider Keys
LARAVEL_AURA_OPENAI_API_KEY=your-api-key
LARAVEL_AURA_GEMINI_API_KEY=your-api-key
LARAVEL_AURA_CLAUDE_API_KEY=your-api-key
LARAVEL_AURA_MISTRAL_API_KEY=your-api-key
LARAVEL_AURA_OLLAMA_BASE_URL=http://localhost:11434
```

---

## 🛠 Usage

### Simple Question

```php
use Devcbh\LaravelAiProvider\Facades\Ai;

$response = Ai::ask('What is the capital of France?');
// Output: "The capital of France is Paris."
```

### JSON Response

Get structured data as a PHP array:

```php
$data = Ai::asJson('Return a list of 3 fruits in JSON format with "name" and "color" keys.');

// Returns: ['fruits' => [['name' => 'Apple', 'color' => 'Red'], ...]]
```

### Structured Output with Schema

Define a JSON schema to ensure the AI responds exactly how you expect.

```php
$schema = [
    'type' => 'object',
    'properties' => [
        'name' => ['type' => 'string'],
        'age' => ['type' => 'integer'],
        'hobbies' => [
            'type' => 'array',
            'items' => ['type' => 'string']
        ]
    ],
    'required' => ['name', 'age', 'hobbies']
];

$data = Ai::schema($schema, 'person_info')
    ->asJson('Tell me about a person named John.');

// Returns: ['name' => 'John', 'age' => 30, 'hobbies' => ['Reading', 'Cycling']]
```

### Asynchronous (Parallel) Requests

Execute multiple AI requests simultaneously to improve performance.

```php
// Simple parallel requests
$responses = Ai::async()->ask([
    'weather' => 'What is the weather in Tokyo?',
    'news' => 'What are the top news in Japan today?',
]);

// Fluent parallel requests with different drivers
$responses = Ai::async()
    ->add('gpt', Ai::driver('openai')->model('gpt-4o'))
    ->add('claude', Ai::driver('claude')->model('claude-3-5-sonnet-latest'))
    ->execute();
```

---

## 🛡 Security & Privacy (Zero Liability)

This package is designed for high-security environments where data privacy is paramount.

### PII Masking & Redaction

Automatically detect and mask sensitive information (emails, credit cards, API keys, etc.) before sending data to providers.

```php
// Reversible Masking (Default)
// Masks "john@example.com" -> "[EMAIL_1]" before sending, 
// then restores it when the AI responds.
$response = Ai::withPiiMasking()->ask('Tell my friend john@example.com hello.');

// Irreversible Redaction (Strict Mode)
// Permanently replaces PII with [REDACTED] - cannot be undone.
$response = Ai::scrubPii()->ask('My secret key is sk_12345');
```

Enable globally in `config/ai.php`:

```php
'pii_masking' => [
    'enabled' => true,
    'strict' => false, // Set to true for irreversible redaction
],
```

---

## 🧩 Prompt Templates

Templates provide a clean way to handle complex prompts.

```php
use Devcbh\LaravelAiProvider\Templates\SentimentTemplate;

$result = Ai::template(new SentimentTemplate(), [
    'text' => 'I absolutely love this new Laravel package!'
])->asJson();

// Returns: ['sentiment' => 'Positive', 'score' => 0.9]
```

### Available Templates

| Template | Purpose | Key Data Keys |
| :--- | :--- | :--- |
| `SentimentTemplate` | Analyze text sentiment | `text` |
| `SummarizationTemplate` | Summarize long content | `content`, `max_length` |
| `TranslationTemplate` | Multi-language translation | `text`, `target_language` |
| `CodeReviewTemplate` | Review code snippets | `code`, `language` |
| `PredictionTemplate` | Data sequence prediction | `data`, `target` |
| `FraudDetectionTemplate` | Identify suspicious patterns | `data` |
| `SeoOptimizerTemplate` | Generate SEO assets | `content`, `keywords` |
| ... and many more. | See `src/Templates` | |

---

## 🔄 Advanced Features

### Global Failover (Fallbacks)

Ensure your application stays up even if an AI provider goes down.

```php
// Fluent fallback
$response = Ai::fallback(['gemini', 'ollama'])
    ->ask('Write a haiku about servers.');
```

### Streaming Support

Stream responses in real-time for chat applications.

```php
$stream = Ai::stream('Write a long story about a space cat.');

foreach ($stream as $chunk) {
    echo $chunk;
    flush(); 
}
```

### Function Calling (Tools)

Allow AI to interact with your local PHP methods.

```php
Ai::withTools([[$orderService, 'getDetails']])
  ->ask("Where is my order #123?");
```

---

## 🔌 Supported Drivers

| Driver | JSON Response | Custom Schema | PII Masking | Streaming | Tools |
| :--- |:-------------:|:-------------:| :---: | :---: | :---: |
| **OpenAI** |       ✅       |       ✅       | ✅ | ✅ | ✅ |
| **Gemini** |       ✅       |       ✅       | ✅ | ✅ | ✅ |
| **Claude** |       ✅       |       ✅       | ✅ | ✅ | ✅ |
| **Mistral** |       ✅       |       ✅       | ✅ | ✅ | ✅ |
| **Ollama** |       X       |       X       | ✅ | ✅ | ✅ |

---

## 🧪 Testing

Since the package uses Laravel's `Http` client, you can use `Http::fake()` to mock AI responses in your tests:

```php
use Illuminate\Support\Facades\Http;
use Devcbh\LaravelAiProvider\Facades\Ai;

Http::fake([
    '*' => Http::response(['choices' => [['message' => ['content' => 'Mocked response']]]], 200),
]);

$response = Ai::ask('Hello?');
$this->assertEquals('Mocked response', $response);
```

---

## 📄 License & Disclaimer

- **License**: MIT License. See [LICENSE.md](LICENSE.md).
- **Disclaimer**: AI models can hallucinate. Please read our [AI Disclaimer](DISCLAIMER.md) before use.
- **Privacy**: PII detection happens entirely on your server. No data is stored or logged by this package.
