# Codemetry Laravel

Laravel adapter for Codemetry - provides Artisan commands and service provider integration for Git repository analysis.

This package depends on [codemetry/core](https://github.com/albertoarena/codemetry-core).

**[Documentation](https://albertoarena.github.io/codemetry)** | **[Getting Started](https://albertoarena.github.io/codemetry/getting-started/installation/)**

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- Git

## Installation

```bash
composer require codemetry/laravel
```

This automatically installs `codemetry/core` as a dependency.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=codemetry-config
```

## Upgrading

Both `codemetry/laravel` and `codemetry/core` must be updated together to ensure compatibility:

```bash
composer update "codemetry/*"
```

Or explicitly:

```bash
composer update codemetry/laravel codemetry/core
```

> **Note:** Running `composer update codemetry/laravel` alone may not work because both packages are versioned together and require matching versions.

## Usage

```bash
# Table output (one row per day)
php artisan codemetry:analyze --days=7

# JSON output
php artisan codemetry:analyze --days=7 --format=json

# Filter by author or branch
php artisan codemetry:analyze --days=7 --author="Jane Doe" --branch=main

# Specify date range
php artisan codemetry:analyze --since=2024-01-01 --until=2024-01-31

# Enable AI-powered explanations (requires API keys in config)
php artisan codemetry:analyze --days=7 --ai=1
```

## Configuration

After publishing, edit `config/codemetry.php`:

```php
return [
    // Number of days to analyze by default
    'days' => 7,

    // Baseline period for normalization (in days)
    'baseline_days' => 56,

    // Follow-up fix detection horizon (in days)
    'follow_up_horizon_days' => 3,

    // AI configuration (optional)
    'ai' => [
        'enabled' => false,
        'engine' => 'openai', // openai, anthropic, deepseek, google
        'api_key' => env('CODEMETRY_AI_API_KEY'),
    ],
];
```

## AI Integration

AI integration is **opt-in** and **metrics-only**. Engines never receive raw code or diffs.

Supported engines:
- OpenAI
- Anthropic (Claude)
- DeepSeek
- Google

When AI is requested but unavailable (missing keys, API failure), analysis continues normally with a warning.

## Privacy

- The AI engine receives **aggregated metrics only** - never raw source code, full diffs, or file contents.
- All analysis runs locally via Git commands against your repository.
- No data is sent to external services unless AI engines are explicitly enabled.

## License

MIT
