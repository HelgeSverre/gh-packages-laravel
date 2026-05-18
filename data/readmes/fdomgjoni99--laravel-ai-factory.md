
# Laravel AI Factory

Laravel AI Factory is a developer-friendly package for generating realistic test data using AI models. It integrates seamlessly with Laravel factories and supports both AI-generated and manually defined fields, with the option to use bulk or individual inserts.

## 🚀 Features

-   ✅ Generate factory data using AI prompts
-   ✅ Supports OpenAI - Gemini and DeepSeek support coming soon...
-   ✅ Mix AI-generated fields with hardcoded or Faker-generated fields
-   ✅ Optional bulk insert for performance (without triggering model events)
-   ✅ Easy to extend and override

## 📦 Installation

```bash
composer require floriandomgjoni/laravel-ai-factory
```

## ⚙️ Configuration

Publish the config:
```bash
php artisan vendor:publish --tag=ai-factory-config
```
Update your `.env` with the appropriate API keys:
```ini
AI_FACTORY_DRIVER=openai
AI_FACTORY_OPENAI_API_KEY=your-api-key
AI_FACTORY_OPENAI_MODEL=gpt-4o-mini
```

or, for a local LLM:
```ini
AI_FACTORY_DRIVER=local
AI_FACTORY_LOCAL_URL=http://localhost:8080/v1/chat/completions
AI_FACTORY_LOCAL_API_KEY=""
AI_FACTORY_LOCAL_MODEL=Default
```

## 🧠 Defining AI Fields

In your factory, use the `HasAIFactory` trait and define the `aiFields()` method:
```php
<?php
use FlorianDomgjoni\AIFactory\Concerns\HasAIFactory;

class UserFactory extends Factory
{
    use HasAIFactory;

    protected $model = \App\Models\User::class;

    public function aiFields(): array
    {
        return [
            'name' => 'Generate a realistic full name',
            'email' => fn () => fake()->unique()->safeEmail(),
            'password' => fn () => bcrypt('password'),
            'api_token' => fn () => Str::random(60),
        ];
    }
}
```
-   Use a **string** for AI-generated fields (prompt).  
-   Use a **callable** for manual or faker-based fields.

**You also need to fill the $model property with the model class inside the factory. It is required in order to function properly.**

## 🛠 Usage

### Basic Usage
```php
User::factory()->count(5)->createWithAI();
```

### Override Fields
```php
User::factory()->count(3)->createWithAI([
    'email' => fn () => fake()->unique()->safeEmail(),
    'role' => fn () => 'admin'
]);
```

### Bulk Insert (faster, skips model events)
```php
User::factory()->count(100)->createWithAI([], true);
```

## 🧪 Example Prompt
```php
[
    'title' => 'Generate a blog post title related to technology',
    'content' => 'Generate a paragraph of blog content about AI',
    'published_at' => fn () => now()->subDays(rand(1, 30)),
]
```

## 📂 Config File

```php
return [
    'driver' => env('AI_FACTORY_DRIVER', 'openai'),

    'openai' => [
        'api_key' => env('AI_FACTORY_OPENAI_API_KEY'),
        'model' => env('AI_FACTORY_OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    'local' => [
        'url' => env('AI_FACTORY_LOCAL_URL', 'http://localhost:8080'),
        'api_key' => env('AI_FACTORY_LOCAL_API_KEY', null),
        'model' => env('AI_FACTORY_LOCAL_MODEL', null),
    ],
];
```

## 🛡 Error Handling

-   AI data generation is wrapped in try/catch.
-   Model creation errors are logged individually.
-   Invalid JSON or failed API calls will throw descriptive exceptions.

## 📄 License

This package is open-sourced software licensed under the MIT license.
