# Laravel Quotes Package

A modular Laravel package that interacts with the [DummyJSON Quotes API](https://dummyjson.com/quotes), providing intelligent caching, rate limiting, and a Vue.js user interface for browsing quotes.

## Features

- 🚀 **Modern API Integration**: Uses Saloon for robust HTTP requests
- ⚡ **Intelligent Rate Limiting**: Configurable rate limits with automatic handling
- 🔍 **Binary Search Algorithm**: Efficient quote lookup with O(log n) complexity
- 💾 **Smart Caching**: Sequential array storage with automatic sorting
- 🎨 **Vue.js UI**: Modern TypeScript interface with Composition API
- 🐳 **Docker Ready**: Complete containerized development environment
- 🧪 **Comprehensive Testing**: Unit and feature tests with PestPHP

## Quick Start

1. Clone the repository
2. Run Docker Compose:
```bash
docker-compose up
```
3. Visit the application:
```
http://localhost:8080/quotes-ui
```

## Docker Build Process

The container automatically:

1. **Creates Fresh Laravel App**: Installs Laravel 12 in `/var/www/html`
2. **Links Package**: Configures Composer to use local package path
3. **Installs Dependencies**: Requires package and all dependencies
4. **Configures Environment**: Sets up testing environment with proper cache drivers
5. **Installs PestPHP**: Sets up testing framework with Laravel plugin
6. **Publishes Assets**: Makes package views and assets available
7. **Builds Frontend**: Compiles Vue.js assets
8. **Starts Server**: Launches Laravel development server on port 8080

## Building Assets

If you need to rebuild the frontend:

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

```env
QUOTES_API_URL=https://dummyjson.com
QUOTES_RATE_LIMIT=5
QUOTES_TIME_WINDOW=30
QUOTES_CACHE_DRIVER=file
```

### Config File

Publish and customize the config:

```php
// config/quotes.php
return [
    'api' => [
        'base_url' => env('QUOTES_API_URL', 'https://dummyjson.com'),
        'endpoint' => '/quotes',
    ],

    'rate_limit' => [
        'request_limit' => env('QUOTES_RATE_LIMIT', 5),
        'time_window' => env('QUOTES_TIME_WINDOW', 30),
    ],

    'cache' => [
        'driver' => env('QUOTES_CACHE_DRIVER', 'file'),
        'key' => 'quotes:storage',
        'rate_limit_key' => 'quotes:rate_limit',
    ],
];
```

## Usage

### Batch Import Command

Import unique quotes with automatic rate limit handling:

```bash
php artisan quotes:batch-import 20
```

The command provides real-time feedback:
- Progress tracking with current/fetched counts
- Rate limit notifications with wait times
- Automatic retry when limits are exceeded
- Uniqueness validation against cache and current run

### API Endpoints

```bash
# Get paginated quotes
GET /api/quotes?page=1&per_page=10

# Get specific quote by ID
GET /api/quotes/{id}

# Vue.js UI
GET /quotes-ui
```

### Using the Facade

```php
use Jesusdefreitas\QuotesPackage\Facades\Quote;

// Get a random quote
$quote = Quote::getRandom();

// Get quote by ID (uses binary search on cache)
$quote = Quote::getById(5);

// Get all cached quotes
$quotes = Quote::all();

// Get paginated quotes
$paginated = Quote::paginate(1, 10);
```

## Rate Limiting Strategy

This package implements a sophisticated rate limiting system:

- **Request Limit**: Maximum requests per time window (default: 5)
- **Time Window**: Duration in seconds (default: 30s)
- **Persistence**: Uses cache driver to maintain hit counts across requests
- **No Sleep Policy**: The service throws `RateLimitExceededException` instead of waiting
- **Automatic Retry**: Batch import command automatically waits for window reset

### Rate Limit Flow

1. Each API request increments a counter in cache
2. Counter is keyed by time window: `quotes:rate_limit:{window_id}`
3. When limit exceeded, exception is thrown with retry time
4. Smart commands catch exception and sleep automatically

## Architecture

The package follows Laravel best practices with a layered architecture:

1. **Service Layer**: `QuoteService` handles API communication
2. **Repository Pattern**: `CachedQuoteRepository` manages data access
3. **Cache Management**: `QuoteCacheManager` implements binary search logic
4. **Rate Limiting**: Middleware-based approach with persistent storage
5. **UI Layer**: Vue.js SPA with TypeScript and Composition API

## Testing

Run the test suite:

```bash
composer test
# or
php artisan test
```

### Test Coverage

- **Binary Search Algorithm**: Unit tests for search and insertion
- **Rate Limiting**: Feature tests with mocked API responses
- **API Integration**: Saloon connector testing with mock responses
- **Cache Operations**: Repository pattern testing

## License

This package is open-sourced software licensed under the MIT license.
