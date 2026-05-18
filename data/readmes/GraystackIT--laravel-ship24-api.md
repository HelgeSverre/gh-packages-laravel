# graystackit/laravel-ship24-api

Laravel package for the [Ship24](https://www.ship24.com/) shipment tracking API, built on [Saloon 4](https://docs.saloon.dev/).

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-ship24-api
```

Publish the config file:

```bash
php artisan vendor:publish --tag=ship24-config
```

Publish and run the migration (required for local tracking storage):

```bash
php artisan vendor:publish --tag=ship24-migrations
php artisan migrate
```

Add your API key to `.env`:

```env
SHIP24_API_KEY=your-api-key-here
```

## Configuration

| Key | Env | Default |
|---|---|---|
| `api_key` | `SHIP24_API_KEY` | — |
| `base_url` | `SHIP24_BASE_URL` | `https://api.ship24.com/public/v1` |
| `tracking_mode` | `SHIP24_TRACKING_MODE` | `latest` |
| `webhook.enabled` | `SHIP24_WEBHOOK_ENABLED` | `true` |
| `webhook.path` | `SHIP24_WEBHOOK_PATH` | `ship24/webhook` |
| `webhook.secret` | `SHIP24_WEBHOOK_SECRET` | — |

### Tracking modes

| Value | Behaviour |
|---|---|
| `latest` | Overwrites the local record with the most recent status only |
| `history` | Stores the full event array in the `events` JSON column |

---

## API Client

Inject or resolve `Ship24Client` from the container:

```php
use GraystackIT\Ship24\Ship24Client;

$client = app(Ship24Client::class);
```

---

### Create a tracker

```php
$tracker = $client->createTracker('1Z999AA10123456784', 'ORDER-001');

echo $tracker->trackerId;       // trk_abc123
echo $tracker->trackingNumber;  // 1Z999AA10123456784
echo $tracker->isTracked;       // true
```

---

### List all trackers (with pagination)

```php
$result = $client->listTrackers(page: 1, limit: 50);

foreach ($result['trackers'] as $tracker) {
    echo $tracker->trackerId . ': ' . $tracker->trackingNumber;
}

echo $result['total']; // total tracker count
echo $result['page'];  // 1
echo $result['limit']; // 50
```

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `$page` | `int` | `1` | Page number (min 1) |
| `$limit` | `int` | `20` | Results per page (1–500) |
| `$sort` | `int\|null` | `null` | Sort by `createdAt`: `1` = asc, `-1` = desc |

---

### Bulk create trackers (up to 100)

```php
use GraystackIT\Ship24\Data\BulkCreateResult;

$result = $client->bulkCreateTrackers([
    ['trackingNumber' => '1Z999AA10123456784', 'shipmentReference' => 'ORDER-001'],
    ['trackingNumber' => 'JD014600006228974097'],
    ['trackingNumber' => 'RA123456789DE', 'originCountryCode' => 'DE'],
]);

echo $result->status;       // success | partial | error
echo $result->requested;    // 3
echo $result->successCount; // 3
echo $result->errorCount;   // 0

foreach ($result->items as $item) {
    if ($item->success) {
        echo $item->tracker->trackerId;
    } else {
        echo $item->errorCode . ': ' . $item->errorMessage;
    }
}
```

Throws `\InvalidArgumentException` if the array is empty or has more than 100 items.

---

### Create and track (combined — single API call)

Creates a tracker and immediately returns its tracking results without a second request:

```php
$result = $client->createAndTrack(
    trackingNumber:        '1Z999AA10123456784',
    shipmentReference:     'ORDER-001',       // optional
    originCountryCode:     'US',              // optional
    destinationCountryCode: 'DE',             // optional
    destinationPostCode:   '10115',           // optional
    shippingDate:          '2024-06-01',      // optional (YYYY-MM-DD)
    courierCode:           ['ups'],           // optional (max 3)
);

echo $result->tracker->trackerId;
echo $result->shipment->statusMilestone; // delivered, in_transit, etc.
echo $result->latestEvent()?->status;

// Statistics (if returned by the API)
print_r($result->statistics);
```

---

### Update an existing tracker

```php
$tracker = $client->updateTracker('trk_abc123', [
    'isSubscribed'          => false,
    'originCountryCode'     => 'US',
    'destinationCountryCode'=> 'DE',
    'destinationPostCode'   => '10115',
    'shippingDate'          => '2024-06-01',
    'courierCode'           => ['ups'],
]);

echo $tracker->isSubscribed; // false
```

Throws `\InvalidArgumentException` if the updates array is empty.

---

### Get tracking results by tracker ID

```php
$results = $client->getTrackingResults('trk_abc123');

foreach ($results as $result) {
    echo $result->shipment->statusMilestone;
    echo $result->latestEvent()?->status;
}
```

---

### Get tracking results by tracking number

For when you have the tracking number but not the tracker ID:

```php
$results = $client->getTrackingResultsByTrackingNumber('1Z999AA10123456784');

foreach ($results as $result) {
    echo $result->tracker->trackerId;
    echo $result->shipment->currentCourierName;
    echo $result->shipment->originCountryCode;

    foreach ($result->events as $event) {
        echo $event->datetime . ' — ' . $event->status . ' — ' . $event->location;
    }
}
```

---

### Search by tracking number (per-call plan)

One-shot search without creating a persistent tracker. No tracker ID required:

```php
$results = $client->searchByTrackingNumber('JD014600006228974097');

foreach ($results as $result) {
    echo $result->shipment->currentCourierName;
    echo $result->shipment->originCountryCode;

    foreach ($result->events as $event) {
        echo $event->datetime . ' - ' . $event->status . ' - ' . $event->location;
    }
}
```

> **Note:** This uses the `/tracking/search` per-call endpoint — it does not create a persistent tracker and response time may be up to 1 minute.

---

## Trackable Models

Add the `IsTrackableByShip24` trait to any Eloquent model to attach Ship24 tracking data directly to it.

```php
use GraystackIT\Ship24\Traits\IsTrackableByShip24;

class Order extends Model
{
    use IsTrackableByShip24;
}
```

### Start tracking

Creates a Ship24 tracker and immediately stores the initial tracking result in a local `ship24_trackings` record linked to the model.

```php
$tracking = $order->startTracking('1Z999AA10123456784', 'ORDER-001');

echo $tracking->status_milestone; // in_transit
echo $tracking->carrier_name;     // UPS
```

### Sync tracking

Fetches the latest data from Ship24 and updates (or creates) the local record.

```php
$tracking = $order->syncTracking('1Z999AA10123456784');
```

### Read stored tracking data

```php
// All tracking records linked to this model
foreach ($order->trackings as $t) {
    echo $t->tracking_number . ': ' . $t->status_milestone;
}

// Most recently updated record
$latest = $order->latestTrackingStatus();
echo $latest?->status_milestone;  // delivered
echo $latest?->carrier_name;      // UPS
echo $latest?->latest_event_at;   // 2024-06-10 12:00:00
```

---

## Webhook

Ship24 can push tracking updates to your application in real-time. The package registers a POST endpoint automatically (disable via `SHIP24_WEBHOOK_ENABLED=false`).

**Default URL:** `POST /ship24/webhook`

Configure this URL in the [Ship24 dashboard](https://app.ship24.com/).

### Webhook secret validation

Set `SHIP24_WEBHOOK_SECRET` to enable request validation. Ship24 sends your secret as a Bearer token in the `Authorization` header on every webhook request — the package validates it with a timing-safe comparison.

```env
SHIP24_WEBHOOK_SECRET=your-webhook-secret
```

The webhook handler automatically:
1. Validates the `Authorization: Bearer <secret>` header (if a secret is configured)
2. Iterates the `trackings` array in the payload
3. Finds all `ship24_trackings` records matching each item's tracking number / tracker ID
4. Updates them according to the configured `tracking_mode`

---

## Artisan command

Manually refresh tracking data from the API (useful as a fallback when webhooks are unavailable):

```bash
# Refresh all ship24_trackings records
php artisan ship24:refresh

# Refresh a single record by its primary key
php artisan ship24:refresh 42
```

---

## Data objects

| Class | Key properties |
|---|---|
| `Tracker` | `trackerId`, `trackingNumber`, `shipmentReference`, `isSubscribed`, `isTracked`, `createdAt` |
| `Shipment` | `shipmentId`, `trackingNumber`, `statusCode`, `statusCategory`, `statusMilestone`, `originCountryCode`, `destinationCountryCode`, `courierIds` |
| `TrackingEvent` | `eventId`, `trackingNumber`, `datetime`, `status`, `statusCode`, `statusCategory`, `statusMilestone`, `location` |
| `TrackingResult` | `tracker`, `shipment`, `events[]`, `statistics`, `latestEvent()` |
| `BulkCreateResult` | `status`, `requested`, `successCount`, `errorCount`, `items[]` |
| `BulkCreateItem` | `success`, `tracker`, `errorCode`, `errorMessage` |

### `ship24_trackings` table columns

| Column | Type | Description |
|---|---|---|
| `trackable_id` / `trackable_type` | polymorphic | The linked Eloquent model |
| `tracking_number` | string | Parcel tracking number |
| `tracker_id` | string\|null | Ship24 internal tracker ID |
| `carrier_id` / `carrier_name` | string\|null | Active carrier |
| `status_code` / `status_category` / `status_milestone` | string\|null | Current status |
| `latest_event_at` | datetime\|null | Timestamp of the most recent event |
| `latest_event_status` / `latest_event_location` | string\|null | Latest event detail |
| `events` | json\|null | Full event array (history mode only) |
| `raw_shipment` | json\|null | Raw shipment payload from Ship24 |

---

## Error handling

All API errors throw `GraystackIT\Ship24\Exceptions\Ship24ApiException`:

```php
use GraystackIT\Ship24\Exceptions\Ship24ApiException;

try {
    $results = $client->getTrackingResultsByTrackingNumber('INVALID');
} catch (Ship24ApiException $e) {
    logger()->error('Ship24 error: ' . $e->getMessage());
    // $e->getCode() returns the HTTP status code
}
```

Input validation errors (empty bulk array, empty update fields, bulk > 100) throw `\InvalidArgumentException`.

---

## API endpoints reference

| Client method | HTTP | Endpoint |
|---|---|---|
| `createTracker()` | POST | `/trackers` |
| `listTrackers()` | GET | `/trackers` |
| `bulkCreateTrackers()` | POST | `/trackers/bulk` |
| `createAndTrack()` | POST | `/trackers/track` |
| `updateTracker()` | PATCH | `/trackers/{trackerId}` |
| `getTrackingResults()` | GET | `/trackers/{trackerId}/results` |
| `getTrackingResultsByTrackingNumber()` | GET | `/trackers/search/{trackingNumber}/results` |
| `searchByTrackingNumber()` | POST | `/tracking/search` |

---

## Testing

```bash
# API client tests (no database required)
vendor/bin/pest tests/Feature

# Integration tests (require pdo_sqlite or pdo_mysql)
vendor/bin/pest tests/Integration
```

Feature tests use Saloon's `MockClient` — no real API calls are made.

## License

MIT
