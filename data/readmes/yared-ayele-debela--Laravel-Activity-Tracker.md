# Yared Laravel Activity Tracker

Advanced activity logging for Laravel with IP, browser, location, device detection, and automatic model change tracking.

## Features

- **Rich activity data** — IP, browser, device, URL, location
- **Automatic model logging** — Track created, updated, deleted with `LogsActivity` trait
- **Model change detection** — Log what changed (e.g. "Price: 100 → 120")
- **Geolocation** — City and country from IP (via ip-api.com)
- **Activity timeline** — Query and display admin activity feed
- **Log cleanup** — `php artisan activity:clean` to remove old logs
- **Configurable** — Custom table name, location API, cleanup days

## Installation

```bash
composer require yared/laravel-activity-tracker
```

Publish config and run migrations:

```bash
php artisan vendor:publish --tag=activity-config
php artisan migrate
```

## Usage

### Manual Tracking

```php
use Yared\ActivityTracker\Facades\Activity;

// In a controller
Activity::track(auth()->user(), "created order #2001");

// With extra properties
Activity::track(auth()->user(), "exported report", [
    'format' => 'pdf',
    'rows' => 150,
]);
```

### Automatic Model Logging

Add the trait to any model:

```php
use Illuminate\Database\Eloquent\Model;
use Yared\ActivityTracker\Traits\LogsActivity;

class Order extends Model
{
    use LogsActivity;
}
```

Now every create, update, and delete is logged automatically. Updates include what changed:

```json
{
  "changes": {
    "status": ["pending", "shipped"],
    "price": [100, 120]
  }
}
```

### Activity Timeline

```php
use Yared\ActivityTracker\Models\ActivityLog;

// Latest activities
$activities = ActivityLog::latest()->take(50)->get();

// For a specific user
$activities = ActivityLog::forUser($userId)->latest()->get();

// Last 7 days
$activities = ActivityLog::recent(7)->get();
```

### Clean Old Logs

```bash
# Use config value (default: 90 days)
php artisan activity:clean

# Custom days
php artisan activity:clean --days=30
```

## Example Output

```
User 5 created order #2001
IP: 192.168.1.1
Browser: Chrome
Device: Linux Desktop
Location: Venice, IT
URL: /orders
```

## Configuration

Edit `config/activity.php`:

| Key | Description |
|-----|-------------|
| `table` | Database table name |
| `location_enabled` | Fetch location from IP |
| `location_api_url` | IP geolocation API |
| `cleanup_days` | Default days for `activity:clean` (0 = disabled) |
| `track_requests` | Log every request when using middleware |

## Middleware (Optional)

To log every API request, register the middleware:

```php
// app/Http/Kernel.php
protected $middlewareAliases = [
    'activity.track' => \Yared\ActivityTracker\Middleware\TrackRequest::class,
];
```

Then enable in config: `'track_requests' => true` and apply to routes.

## License

MIT
