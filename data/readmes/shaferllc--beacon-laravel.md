# Beacon Laravel SDK

Laravel SDK for [Beacon](https://beaconstatus.com) status pages. Report incidents, update components, and send heartbeats from your Laravel application.

## Installation

```bash
composer require beacon-status/laravel
```

The package uses Laravel's auto-discovery, so the service provider and facade are registered automatically.

### Publish Configuration

```bash
php artisan vendor:publish --tag=beacon-config
```

### Environment Variables

Add these to your `.env` file:

```env
BEACON_API_TOKEN=your-api-token
BEACON_BASE_URL=https://app.beaconstatus.com
BEACON_PAGE_SLUG=your-page-slug
BEACON_TIMEOUT=10
BEACON_ASYNC=true
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `BEACON_API_TOKEN` | Yes | -- | API token from your Beacon dashboard |
| `BEACON_BASE_URL` | No | `https://app.beaconstatus.com` | Base URL of your Beacon instance |
| `BEACON_PAGE_SLUG` | Yes | -- | Default status page slug |
| `BEACON_TIMEOUT` | No | `10` | HTTP timeout in seconds |
| `BEACON_ASYNC` | No | `true` | Dispatch requests via the queue |

## Usage

You can use the `Beacon` facade or inject `BeaconClient` directly.

### Create an Incident

```php
use BeaconStatus\Laravel\Facades\Beacon;

Beacon::createIncident([
    'title' => 'Database connectivity issues',
    'impact' => 'major',
    'state' => 'investigating',
    'message' => 'We are investigating reports of database connectivity issues.',
]);
```

### Update an Incident

```php
Beacon::updateIncident($incidentId, [
    'impact' => 'minor',
    'state' => 'identified',
]);
```

### Add a Timeline Update

```php
Beacon::addIncidentUpdate($incidentId, 'The root cause has been identified. A fix is being deployed.');
```

### Resolve an Incident

A convenience method that marks the incident as resolved and optionally adds a final timeline update:

```php
Beacon::resolveIncident($incidentId, 'The issue has been resolved. All systems are operational.');
```

### Update a Component

```php
Beacon::updateComponent($componentId, [
    'status' => 'degraded_performance',
    'description' => 'Response times are elevated.',
]);
```

### Send a Heartbeat

Heartbeat pings do not require API token authentication -- the heartbeat token in the URL is sufficient:

```php
Beacon::heartbeat('your-heartbeat-token');
```

## Async vs Sync Mode

By default, `BEACON_ASYNC=true` dispatches all API calls to your queue. This keeps your application's response times unaffected by status page updates. The queued job retries up to 3 times with backoff intervals of 5, 15, and 30 seconds.

Set `BEACON_ASYNC=false` to make requests inline (synchronous). This is useful during development or when you need the API response immediately.

## Error Handling

The SDK is designed to never break your application. All errors are caught and logged as warnings. In sync mode, failed requests return an array with `success => false` and error details. In async mode, the queued job handles retries and logs failures.

## Development (Path Repository)

To develop against this package locally, add a path repository to your application's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "./packages/beacon-laravel"
        }
    ]
}
```

Then require the package:

```bash
composer require beacon-status/laravel:@dev
```

## License

MIT
