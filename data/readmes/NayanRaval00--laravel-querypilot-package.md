# QueryPilot 🚀

AI-powered natural language search for Laravel applications. Connect your database, ask questions in plain English, and let AI handle the queries — no SQL required.

[![Latest Version](https://img.shields.io/packagist/v/nayanraval/query-pilot.svg)](https://packagist.org/packages/nayanraval/query-pilot)
[![Total Downloads](https://img.shields.io/packagist/dt/nayanraval/query-pilot.svg)](https://packagist.org/packages/nayanraval/query-pilot)
[![License](https://img.shields.io/packagist/l/nayanraval/query-pilot.svg)](https://packagist.org/packages/nayanraval/query-pilot)

---

## Features

- 🤖 **Natural language to database** — ask questions in plain English, get instant results
- 🔗 **Auto-detects Eloquent relationships** — automatically builds JOIN queries from your models
- 🖼️ **Image URL resolution** — automatically generates public URLs for image columns
- ⚡ **Query caching & performance tracking** — built-in cache with execution time monitoring
- 🛡️ **SQL injection protection** — validates all queries before execution
- 🎯 **Multi-provider support** — works with Gemini, OpenAI, Anthropic, and more via Laravel AI SDK

---

## Requirements

- PHP 8.1+
- Laravel 11.0+ or 12.0+
- `laravel/ai` package (installed automatically)

---

## Installation

### Step 1: Install the package

```bash
composer require nayanraval/query-pilot
```

### Step 2: Publish the configuration file

```bash
php artisan vendor:publish --tag=querypilot-config
```

This creates `config/querypilot.php` in your application.

### Step 3: Configure your AI provider

Add to your `.env` file:

```dotenv
# AI Provider (gemini, openai, anthropic, etc.)
QUERYPILOT_PROVIDER=gemini

# API Key for your chosen provider
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Customize limits
QUERYPILOT_MAX_ROWS=100
QUERYPILOT_CACHE_TTL=60
```

> **💡 Tip:** You can use any provider supported by the [Laravel AI SDK](https://laravel.com/docs/ai-sdk). Configure additional providers in `config/ai.php`.

### Step 4: Configure your database tables

Edit `config/querypilot.php` and add the tables you want to expose to AI:

```php
'tables' => [
    'users' => [
        'label'      => 'Registered users',
        'model'      => \App\Models\User::class,
        'searchable' => ['id', 'name', 'email', 'created_at'],
        'image'      => 'avatar',        // column that holds image path
        'image_disk' => 'public',        // Laravel storage disk
    ],
    'products' => [
        'label'      => 'Products catalog',
        'model'      => \App\Models\Product::class,
        'searchable' => ['id', 'name', 'sku', 'price', 'stock', 'user_id'],
        'image'      => 'image',
        'image_disk' => 'public',
    ],
],
```

### Step 5: Ensure your Eloquent models have relationships defined

QueryPilot automatically reads your Eloquent relationships to build JOIN queries:

```php
// app/Models/User.php
public function products()
{
    return $this->hasMany(Product::class);
}

public function profile()
{
    return $this->hasOne(Profile::class);
}
```

---

## Usage

### Full API Response Example

```php
use QueryPilot\QueryPilotAgent;

Route::get('/api/query', function () {
    try {
        $start = microtime(true);
        $agent = app(QueryPilotAgent::class);

        $response = $agent->prompt(
            request('q', 'Give me the first user with their profile'),
            provider: config('querypilot.provider')
        );

        return response()->json([
            'success'       => true,
            'answer'        => $response['answer'] ?? '',
            'table'         => $response['table'] ?? '',
            'count'         => $response['count'] ?? 0,
            'rows'          => $response['rows'] ?? [],
            'total_time_ms' => round((microtime(true) - $start) * 1000),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
        ], 500);
    }
});
```

### Example Queries

```php
// Simple queries
"Show me all users"
"Give me products under $50"
"Find users who registered today"

// Queries with relationships
"Show me John with his profile and products"
"Get users with their latest posts"
"Find products and their owner details"

// Filtered queries
"Show me active products with stock greater than 10"
"Get users whose email contains gmail"
"Find the 5 most recent posts"
```

---

## Response Structure

```json
{
    "success": true,
    "answer": "Here are the 3 users who signed up this month: John Doe, Jane Smith, and Bob Wilson.",
    "table": "users",
    "count": 3,
    "rows": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "avatar": "avatars/john.jpg",
            "avatar_url": "http://localhost/storage/avatars/john.jpg",
            "created_at": "2026-04-15 10:30:00"
        }
    ],
    "total_time_ms": 1243
}
```

---

## Configuration

### Available Providers

QueryPilot supports all providers from the Laravel AI SDK:

- **Gemini** (Google) — `provider: 'gemini'`
- **OpenAI** (GPT-4, GPT-4o) — `provider: 'openai'`
- **Anthropic** (Claude) — `provider: 'anthropic'`
- **Groq** — `provider: 'groq'`
- **Local models** via Ollama

Configure your preferred provider in `config/ai.php`:

```php
// config/ai.php
'default' => env('AI_PROVIDER', 'gemini'),

'providers' => [
    'gemini' => [
        'driver' => 'gemini',
        'key'    => env('GEMINI_API_KEY'),
        'model'  => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    ],
    'openai' => [
        'driver' => 'openai',
        'key'    => env('OPENAI_API_KEY'),
        'model'  => env('OPENAI_MODEL', 'gpt-4o'),
    ],
],
```

### Cache Configuration

```dotenv
QUERYPILOT_CACHE_TTL=60  # Cache results for 60 seconds
```

Set to `0` to disable caching.

### Query Limits

```dotenv
QUERYPILOT_MAX_ROWS=100  # Maximum rows returned per query
```

---

## Security

QueryPilot includes built-in protection against SQL injection:

- ✅ Only `SELECT` queries are allowed
- ✅ Blocks dangerous keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, etc.)
- ✅ Only whitelisted tables and columns can be queried
- ✅ Validates all JOIN clauses against configured models
- ✅ Sanitizes user input before query execution

**Important:** Only expose tables you want users to search. Never add sensitive tables like `password_resets`, `sessions`, or admin-only tables to the config.

---

## Troubleshooting

### "Table X is not allowed"

Add the table to `config/querypilot.php` under the `tables` array.

### "Column Y is not allowed"

Add the column to the `searchable` array for that table.

### AI returns "No data found" for existing records

Check that:
1. Your Eloquent models have relationships defined
2. The `model` key in config points to the correct model class
3. Foreign key columns are included in the `searchable` array

### Image URLs not resolving

Ensure:
1. `image` column name matches exactly
2. `image_disk` is set correctly (usually `'public'`)
3. Storage is linked: `php artisan storage:link`

---

## Testing

```bash
# Run package tests
php artisan test tests/Feature/QueryPilotTest.php
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Credits

**Author:** Nayan Raval  
**Email:** [ravalnayan029@gmail.com](mailto:ravalnayan029@gmail.com)  
**GitHub:** [github.com/NayanRaval00](https://github.com/NayanRaval00)

Built with ❤️ using the [Laravel AI SDK](https://laravel.com/docs/ai-sdk)

---

## Support

- 📧 Email: ravalnayan029@gmail.com