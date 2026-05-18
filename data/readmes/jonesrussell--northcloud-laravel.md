# jonesrussell/northcloud-laravel

Shared Laravel package for North Cloud article ingestion via Redis pub/sub.

## Requirements

- PHP 8.4+
- Laravel 12
- ext-redis
- ext-pcntl

## Installation

```bash
composer require jonesrussell/northcloud-laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=northcloud-config
```

## Configuration

Add the following variables to your `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `NORTHCLOUD_REDIS_CONNECTION` | Redis connection name to use | `northcloud` |
| `NORTHCLOUD_CHANNELS` | Comma-separated Redis channels to subscribe to | `articles:default` |
| `NORTHCLOUD_MIN_QUALITY_SCORE` | Minimum quality score for ingested articles | `0` |

## Artisan Commands

| Command | Description |
|---------|-------------|
| `articles:subscribe` | Subscribe to Redis channels and ingest articles |
| `articles:status` | Show connection and configuration status |
| `articles:stats` | Display article statistics |
| `articles:test-publish` | Publish a test article to Redis |
| `articles:replay` | Re-process existing articles |

## Testing

```bash
vendor/bin/pest
```

## License

MIT
