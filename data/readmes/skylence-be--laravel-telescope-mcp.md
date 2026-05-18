# Laravel Telescope MCP

A powerful MCP (Model Context Protocol) server for Laravel Telescope, providing real-time monitoring, performance analysis, and debugging through Claude Code and other MCP clients.

## Features

- **STDIO & HTTP Support** - Use with Claude Code (stdio) or any HTTP client
- **Route Type Filtering** - Separate analysis for API vs Web routes (including Filament panels)
- **Performance Monitoring** - Request times, query analysis, N+1 detection
- **Health Scoring** - Context-aware health scores with different thresholds per route type
- **Exception Tracking** - Monitor and analyze application errors
- **Queue Monitoring** - Track job execution and failures
- **Cache Analysis** - Hit rates and operation tracking

## Installation

```bash
composer require skylence/laravel-telescope-mcp
```

Publish configuration (optional):

```bash
php artisan vendor:publish --tag=telescope-mcp-config
```

## Configuration

### Claude Code (STDIO Mode)

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "telescope": {
      "type": "stdio",
      "command": "php",
      "args": ["artisan", "mcp:start", "telescope"]
    }
  }
}
```

### Environment Variables

```env
TELESCOPE_MCP_ENABLED=true
TELESCOPE_MCP_AUTH_ENABLED=false
TELESCOPE_MCP_SLOW_REQUEST_MS=1000
TELESCOPE_MCP_SLOW_QUERY_MS=100
```

## Route Type Filtering

Routes are automatically categorized by middleware for separate analysis:

```php
// config/telescope-mcp.php
'overview' => [
    'route_groups' => [
        'api' => [
            'middleware' => ['api'],
        ],
        'web' => [
            'middleware' => ['web', 'panel:*'], // Includes Filament panels
        ],
    ],
    'thresholds' => [
        'api' => [
            'slow_request_ms' => 500,      // APIs should be fast
            'acceptable_error_rate' => 0.01,
        ],
        'web' => [
            'slow_request_ms' => 1500,     // Web pages can be slower
            'acceptable_error_rate' => 0.05,
        ],
    ],
],
```

The `panel:*` wildcard matches Filament panel middleware (e.g., `panel:app`, `panel:admin`).

## Available Tools

### telescope_overview
System health overview with performance metrics and route breakdown.

```
telescope_overview(period="1h", route_type="all", include_breakdown=true)
```

### requests
HTTP request analysis with filtering by route type.

```
requests(action="stats", route_type="api", period="1h")
requests(action="slow", route_type="web", min_duration=1000)
```

### queries
Database query analysis and N+1 detection.

```
queries(action="stats", period="1h")
queries(action="slow", min_time=100)
queries(action="duplicates")
```

### exceptions
Exception and error tracking.

```
exceptions(action="list", period="24h")
exceptions(action="stats")
```

### jobs
Queue job monitoring.

```
jobs(action="stats", period="1h")
jobs(action="failed")
```

### cache
Cache operation analysis.

```
cache(action="stats", period="1h")
```

### logs
Application log entries.

```
logs(action="list", level="error", period="1h")
```

## Quick Examples

**Health check:**
```
telescope_overview(period="1h", route_type="all")
```

**API-specific monitoring:**
```
telescope_overview(period="1h", route_type="api")
requests(action="stats", route_type="api")
```

**Find slow endpoints:**
```
requests(action="slow", route_type="api", min_duration=500)
```

**Detect N+1 queries:**
```
queries(action="duplicates", period="1h")
```

## Health Scoring

Health scores (0-100) are calculated with context-aware thresholds:

| Score | Status | Description |
|-------|--------|-------------|
| 90-100 | healthy | Everything optimal |
| 70-89 | good | Minor issues |
| 50-69 | warning | Needs attention |
| 0-49 | critical | Immediate action required |

API and web routes use different thresholds - APIs are judged more strictly.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12
- Laravel Telescope

## License

MIT
