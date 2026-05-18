# Laravel Keywords Database

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pstoute/laravel-keywords-database.svg?style=flat-square)](https://packagist.org/packages/pstoute/laravel-keywords-database)
[![License](https://img.shields.io/packagist/l/pstoute/laravel-keywords-database.svg?style=flat-square)](https://packagist.org/packages/pstoute/laravel-keywords-database)

A Laravel package for building a centralized keyword database shared across multiple applications. Perfect for SEO tools, rank trackers, and keyword research platforms that need to share data efficiently.

## Overview

When building multiple SEO-related applications (rank trackers, keyword research tools, content optimization platforms), you often need to store and share keyword data. This package provides:

- **Centralized keyword storage** - One database for all your applications
- **SERP results caching** - Reduce API costs by sharing search results
- **Keyword metrics by location** - Store volume, CPC, and competition data per location
- **Keyword research sessions** - Track and share research across apps
- **Connection resilience** - Built-in retry logic for database operations

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Rank Tracker  │     │ Keyword Research│     │  SEO Dashboard  │
│   Application   │     │   Application   │     │   Application   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Keywords Database     │
                    │      (PostgreSQL)       │
                    └─────────────────────────┘
```

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- PostgreSQL 14+ (recommended) or MySQL 8+

## Installation

```bash
composer require pstoute/laravel-keywords-database
```

The package will auto-register its service provider.

## Configuration

### 1. Publish the configuration file

```bash
php artisan vendor:publish --tag=laravel-keywords-database-config
```

### 2. Add environment variables

```env
KEYWORDS_DB_HOST=your-database-host
KEYWORDS_DB_PORT=5432
KEYWORDS_DB_DATABASE=keywords_database
KEYWORDS_DB_USERNAME=your-username
KEYWORDS_DB_PASSWORD=your-password
```

### 3. Run migrations

```bash
php artisan keywords-db:migrate
```

Or publish and customize migrations:

```bash
php artisan vendor:publish --tag=laravel-keywords-database-migrations
php artisan migrate --path=database/migrations/laravel-keywords-database
```

## Usage

### Finding or Creating Keywords

```php
use Pstoute\KeywordsDatabase\Models\SharedKeyword;
use Pstoute\KeywordsDatabase\Facades\KeywordsDatabase;

// Using the model directly
$keyword = SharedKeyword::findOrCreateKeyword('best seo tools', 'us');

// Using the facade
$keyword = KeywordsDatabase::findOrCreate('best seo tools', 'us');

// Bulk operations
$keywords = KeywordsDatabase::bulkFindOrCreate([
    'seo software',
    'keyword research tools',
    'rank tracking',
], 'us');
```

### Working with Location Metrics

```php
use Pstoute\KeywordsDatabase\Models\KeywordLocationMetrics;

// Get metrics for a keyword in a specific location
$metrics = $keyword->getLocationMetrics($locationId);

// Check if metrics need refresh
if ($metrics->needsRefresh()) {
    // Fetch fresh data from your API provider
}

// Update metrics
$metrics->update([
    'avg_monthly_searches' => 12000,
    'cpc_average' => 2.50,
    'competition' => 0.75,
    'competition_level' => 'HIGH',
    'fetched_at' => now(),
]);
```

### Storing SERP Results

```php
use Pstoute\KeywordsDatabase\Models\SerpResult;

// Create a SERP result
$serpResult = SerpResult::create([
    'keyword_id' => $keyword->id,
    'location_id' => $locationId,
    'device' => 'desktop',
    'status' => 'completed',
    'results' => $serpData, // Array of SERP listings
    'searched_at' => now(),
]);

// Find position for a URL
$position = $serpResult->getPositionForUrl('https://example.com');

// Check if result is still fresh
if (!$serpResult->isFresh()) {
    // Fetch new SERP data
}
```

### Keyword Research Sessions

```php
use Pstoute\KeywordsDatabase\Models\KeywordResearchSession;
use Pstoute\KeywordsDatabase\Models\KeywordResearchResult;

// Create a research session
$session = KeywordResearchSession::create([
    'team_id' => $teamId,
    'seed_keyword' => 'seo tools',
    'location_id' => $locationId,
    'research_types' => ['suggestions', 'related', 'questions'],
    'status' => 'pending',
]);

// Mark as started
$session->markStarted();

// Add results
KeywordResearchResult::create([
    'session_id' => $session->id,
    'seed_keyword_id' => $seedKeyword->id,
    'discovered_keyword_id' => $discoveredKeyword->id,
    'location_id' => $locationId,
    'research_type' => 'suggestions',
    'search_volume' => 5000,
    'keyword_difficulty' => 45,
    'search_intent' => 'commercial',
]);

// Mark as completed
$session->markCompleted(keywordsFound: 150, actualCost: 0.15);
```

### Database Connection Resilience

The package includes built-in retry logic for handling transient database failures:

```php
use Pstoute\KeywordsDatabase\Services\DatabaseConnectionHelper;

$result = DatabaseConnectionHelper::executeWithRetry(function () {
    return SharedKeyword::where('keyword', 'like', '%seo%')->get();
});

// Check connection status
$status = DatabaseConnectionHelper::getConnectionStatus();
if (!$status['connected']) {
    // Handle connection failure
}
```

## Artisan Commands

### Check connection status

```bash
php artisan keywords-db:status
```

### View database statistics

```bash
php artisan keywords-db:stats
```

### Run migrations

```bash
php artisan keywords-db:migrate
```

### Cleanup expired SERP tasks

```bash
# Preview what would be cleaned up
php artisan keywords-db:cleanup-expired --dry-run

# Clean up tasks older than 48 hours
php artisan keywords-db:cleanup-expired --hours=48
```

## Building Your Own Integrations

This package provides the data layer. You'll need to implement your own:

### 1. Location Sync Command

Sync locations from your SERP API provider:

```php
// Example for DataForSEO
class SyncLocationsCommand extends Command
{
    public function handle()
    {
        $response = Http::withBasicAuth($login, $password)
            ->get('https://api.dataforseo.com/v3/serp/google/locations');

        foreach ($response->json()['tasks'][0]['result'] as $location) {
            SerpLocation::updateOrCreate(
                ['criteria_id' => $location['location_code']],
                [
                    'location_id' => $location['location_code'],
                    'name' => $location['location_name'],
                    'country_code' => $location['country_iso_code'],
                    'target_type' => $location['location_type'],
                ]
            );
        }
    }
}
```

### 2. Keyword Metrics Fetcher

Fetch keyword metrics from your provider:

```php
class FetchKeywordMetrics extends Command
{
    public function handle()
    {
        $keywords = SharedKeyword::whereDoesntHave('locationMetrics', function ($q) {
            $q->where('location_id', $this->locationId)->fresh();
        })->limit(100)->get();

        foreach ($keywords as $keyword) {
            $metrics = $this->apiClient->getKeywordMetrics($keyword->keyword);

            KeywordLocationMetrics::updateOrCreate(
                ['keyword_id' => $keyword->id, 'location_id' => $this->locationId],
                [
                    'avg_monthly_searches' => $metrics['search_volume'],
                    'cpc_average' => $metrics['cpc'],
                    'competition' => $metrics['competition'],
                    'fetched_at' => now(),
                ]
            );
        }
    }
}
```

## Compatible Data Providers

This package is provider-agnostic. Implement the `KeywordProviderInterface` for your preferred service:

- [DataForSEO](https://dataforseo.com/)
- [SerpApi](https://serpapi.com/)
- [SEMrush API](https://www.semrush.com/api/)
- [Ahrefs API](https://ahrefs.com/api)
- [Moz API](https://moz.com/products/api)

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `keywords` | Core keyword storage with intent probabilities |
| `keyword_histories` | Monthly historical data |
| `serp_google_locations` | Geographic locations for searches |
| `serp_google_countries` | Country data |
| `serp_google_domains` | Google domains (google.com, google.co.uk, etc.) |
| `serp_google_languages` | Language data |
| `serp_results` | Cached SERP results |
| `keyword_location_metrics` | Location-specific keyword metrics |
| `keyword_research_sessions` | Research session tracking |
| `keyword_research_results` | Discovered keywords from research |

## Configuration Options

```php
// config/laravel-keywords-database.php

return [
    // Database connection name
    'connection' => env('KEYWORDS_DB_CONNECTION', 'keywords_database'),

    // Connection retry settings
    'retry' => [
        'max_attempts' => 3,
        'delay_ms' => 100,
        'multiplier' => 2,
    ],

    // Caching settings
    'cache' => [
        'enabled' => true,
        'ttl' => 86400, // 24 hours
        'prefix' => 'keyword:',
    ],

    // Data freshness thresholds
    'freshness' => [
        'serp_results_hours' => 24,
        'metrics_days' => 7,
        'research_days' => 7,
    ],
];
```

## Testing

```bash
composer test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Credits

- [Paul Stoute](https://github.com/pstoute)
