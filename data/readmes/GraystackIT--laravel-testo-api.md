# graystackit/laravel-testo-cloud

A Laravel package for the **Testo Smart Connect API**, built on [Saloon 4](https://docs.saloon.dev/).

Retrieve historical measurements, alarm events, HACCP task records, device properties, device health status, measuring object configurations, and location hierarchies from Testo Smart Connect — all with a clean, Laravel-native interface.

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Installation

```bash
composer require graystackit/laravel-testo-api
```

Laravel auto-discovers the service provider. Then publish the config file:

```bash
php artisan vendor:publish --tag=testo-config
```

## Configuration

Add the following to your `.env` file:

```env
TESTO_API_KEY=your-api-key

# Optional — defaults shown
TESTO_REGION=eu                # eu | am | ap
TESTO_HTTP_TIMEOUT=30
TESTO_DOWNLOAD_TIMEOUT=120

# Store fetched measurements in the database (default: true)
TESTO_STORE_MEASUREMENTS=true

# Polling behaviour for testo:fetch-measurements
TESTO_POLL_INTERVAL=5          # seconds between status checks
TESTO_POLL_MAX_ATTEMPTS=60     # give up after this many checks (5 min total by default)
TESTO_DEFAULT_FROM_DAYS=7      # days to look back when --from is omitted
```

Generate your API key from the Smart Connect home page. Keys are valid for up to one year.

## Async Workflow

All data-export endpoints use the same two-step async pattern:

1. **Submit** a POST request → receive a `request_uuid`
2. **Poll** a GET request with that UUID until status is `Completed`
3. **Download** each URL in `dataUrls` using `downloadDataFile()`

```
submit() → Submitted → Processing → Completed
                                 ↓
                               Failed
```

## Usage

Resolve `TestoCloudClient` from the container or inject via constructor.

```php
use GraystackIT\TestoCloud\TestoCloudClient;

$client = app(TestoCloudClient::class);
```

---

### Measurements  `POST /v2/measurements`  •  `GET /v2/measurements/{uuid}`

```php
use Carbon\Carbon;

// 1. Submit
$submit = $client->submitMeasurementRequest(
    from:   Carbon::parse('2025-01-01'),
    to:     Carbon::parse('2025-01-31'),
    format: 'JSON',  // optional, default 'JSON'
);

echo $submit->requestUuid;

// 2. Poll
$status = $client->checkRequestStatus($submit->requestUuid);

if ($status->isCompleted()) {
    foreach ($status->dataUrls as $url) {
        $content = $client->downloadDataFile($url);
        // parse with MeasurementNdjsonParser...
    }
}
```

> `$from` must be strictly before `$to` — an `\InvalidArgumentException` is thrown otherwise.

#### Parse NDJSON measurement data

```php
use GraystackIT\TestoCloud\Parsers\MeasurementNdjsonParser;

$measurements = (new MeasurementNdjsonParser())->parse($content);
// [['timestamp' => '...', 'temperature' => 21.5, 'humidity' => 55.0], ...]
```

---

### Alarms  `POST /v3/alarms`  •  `GET /v3/alarms/{uuid}`

Retrieve historical alarm events for the configured account.

```php
use Carbon\Carbon;

// 1. Submit
$submit = $client->submitAlarmRequest(
    from: Carbon::parse('2025-01-01'),
    to:   Carbon::parse('2025-01-31'),
);

// 2. Poll
$status = $client->checkAlarmStatus($submit->requestUuid);

if ($status->isCompleted()) {
    foreach ($status->dataUrls as $url) {
        $content = $client->downloadDataFile($url);
    }
}
```

---

### Tasks  `POST /v3/tasks`  •  `GET /v3/tasks/{uuid}`

Retrieve quality-management / HACCP activity records executed by staff.

```php
$submit = $client->submitTaskRequest(
    from: Carbon::parse('2025-01-01'),
    to:   Carbon::parse('2025-01-31'),
);

$status = $client->checkTaskStatus($submit->requestUuid);

if ($status->isFailed()) {
    logger()->error($status->error);
}
```

---

### Device Properties  `POST /v3/devices/properties`  •  `GET /v3/devices/properties/{uuid}`

Retrieve device metadata including serial numbers, model codes, firmware versions,
calibration status, and equipment relationships.

> No date range required — returns current configuration.

```php
$submit = $client->submitEquipmentRequest(format: 'JSON');  // format optional

$status = $client->checkEquipmentStatus($submit->requestUuid);

if ($status->isCompleted()) {
    foreach ($status->dataUrls as $url) {
        $content = $client->downloadDataFile($url);
    }
}
```

---

### Device Status  `POST /v3/devices/status`  •  `GET /v3/devices/status/{uuid}`

Retrieve battery level, signal strength, last communication timestamp,
firmware version, and serial numbers for all devices.

> No date range required — returns current status snapshot.

```php
$submit = $client->submitSensorStatusRequest();

$status = $client->checkSensorStatus($submit->requestUuid);

if ($status->isCompleted()) {
    $content = $client->downloadDataFile($status->dataUrls[0]);
}
```

---

### Measuring Objects  `POST /v1/measuring-objects`  •  `GET /v1/measuring-objects/{uuid}`

Retrieve measuring-object configurations including `customer_uuid`,
`customer_site`, `product_family_id`, measurement settings, and channel assignments.

> No date range required — returns current configuration.

```php
$submit = $client->submitMeasuringObjectRequest();

$status = $client->checkMeasuringObjectStatus($submit->requestUuid);
```

---

### Locations  `POST /v1/locations`  •  `GET /v1/locations/{uuid}`

Retrieve the location hierarchy (sites, zones, rooms) associated with the account.

> No date range required — returns current location structure.

```php
$submit = $client->submitLocationRequest(format: 'JSON');  // format optional

$status = $client->checkLocationStatus($submit->requestUuid);

if ($status->isCompleted()) {
    foreach ($status->dataUrls as $url) {
        $content = $client->downloadDataFile($url);
    }

    // Optional metadata file
    if ($status->metadataUrl) {
        $meta = $client->downloadDataFile($status->metadataUrl);
    }
}
```

---

## Data Objects

### Submission response — `AsyncSubmitResponse`

Returned by every `submit*()` method.

| Property | Type | Description |
|---|---|---|
| `requestUuid` | `string` | UUID to use when polling status |
| `status` | `AsyncRequestStatus` | Enum — `Submitted` on initial response |

### Status response — `AsyncStatusResponse`

Returned by every `check*Status()` method.

| Property | Type | Description |
|---|---|---|
| `status` | `AsyncRequestStatus` | Current state (see enum below) |
| `dataUrls` | `string[]` | Download URLs (populated when completed) |
| `metadataUrl` | `?string` | Metadata file URL (populated when completed) |
| `error` | `?string` | Error message (populated when failed) |

Helper methods: `isCompleted()`, `isProcessing()`, `isFailed()`

### `AsyncRequestStatus` enum

```php
use GraystackIT\TestoCloud\Enums\AsyncRequestStatus;

AsyncRequestStatus::Submitted   // initial acknowledgment
AsyncRequestStatus::Processing  // API is preparing data ("In Progress" normalised)
AsyncRequestStatus::Completed   // data ready for download
AsyncRequestStatus::Failed      // see $response->error
```

The enum normalises all API status strings, including `"In Progress"` → `Processing`.

### Legacy measurement objects

Used by `checkRequestStatus()` (measurements only):

| Class | Properties |
|---|---|
| `MeasurementSubmitResponse` | `requestUuid`, `status` (string) |
| `MeasurementStatusResponse` | `status`, `dataUrls[]`, `metadataUrl`, `error`, helpers |

---

## Error Handling

All client methods throw `GraystackIT\TestoCloud\Exceptions\TestoApiException` on failure.

```php
use GraystackIT\TestoCloud\Exceptions\TestoApiException;

try {
    $submit = $client->submitAlarmRequest(Carbon::parse('2025-01-01'), Carbon::parse('2025-02-01'));
} catch (TestoApiException $e) {
    // HTTP errors, unexpected API responses
    logger()->error($e->getMessage(), ['code' => $e->getCode()]);
}
```

`submit*Request()` methods that accept a date range additionally throw `\InvalidArgumentException` when `$from >= $to`.

If `TESTO_API_KEY` is not configured, a `\RuntimeException` is thrown on container resolution.

---

## API Endpoint Reference

| Module | Submit | Check Status |
|---|---|---|
| Measurements | `POST /v2/measurements` | `GET /v2/measurements/{uuid}` |
| Alarms | `POST /v3/alarms` | `GET /v3/alarms/{uuid}` |
| Tasks | `POST /v3/tasks` | `GET /v3/tasks/{uuid}` |
| Device Properties | `POST /v3/devices/properties` | `GET /v3/devices/properties/{uuid}` |
| Device Status | `POST /v3/devices/status` | `GET /v3/devices/status/{uuid}` |
| Measuring Objects | `POST /v1/measuring-objects` | `GET /v1/measuring-objects/{uuid}` |
| Locations | `POST /v1/locations` | `GET /v1/locations/{uuid}` |

Base URL: `https://data-api.{region}.smartconnect.testo.com`

---

## Database Storage

### Migration

Run the migration to create the `testo_measurements` table:

```bash
php artisan migrate
```

To customise the migration before running it, publish it first:

```bash
php artisan vendor:publish --tag=testo-migrations
```

#### `testo_measurements` schema

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Auto-increment primary key |
| `logger_uuid` | string\|null | Logger device UUID (populated when available) |
| `measured_at` | timestamp | Timestamp of the measurement |
| `temperature` | decimal(8,4)\|null | Temperature reading |
| `humidity` | decimal(8,4)\|null | Humidity reading |
| `created_at` | timestamp | Record insertion time |
| `updated_at` | timestamp | Record update time |

### Model

```php
use GraystackIT\TestoCloud\Models\TestoMeasurement;

$recent = TestoMeasurement::where('measured_at', '>=', now()->subDay())->get();

foreach ($recent as $row) {
    echo $row->measured_at;   // Carbon instance
    echo $row->temperature;   // float|null
    echo $row->humidity;      // float|null
}
```

### Disabling automatic storage

Set `TESTO_STORE_MEASUREMENTS=false` in your `.env` (or `store_measurements => false` in `config/testo.php`) to fetch and parse data without writing to the database.

---

## Artisan Command

```bash
php artisan testo:fetch-measurements
```

Fetches historical measurements from the Testo API, parses the NDJSON response, and — when storage is enabled — persists every row to `testo_measurements`.

### Options

| Option | Default | Description |
|---|---|---|
| `--from=` | `default_from_days` ago | Start date (`Y-m-d`) |
| `--to=` | today | End date (`Y-m-d`) |
| `--format=` | `JSON` | Export format (`JSON` or `CSV`) |
| `--logger-uuid=` | _(all loggers)_ | Filter results to a single device UUID |

### Examples

```bash
# Last 7 days (default)
php artisan testo:fetch-measurements

# Specific date range
php artisan testo:fetch-measurements --from=2025-01-01 --to=2025-01-31

# Single device only
php artisan testo:fetch-measurements --from=2025-03-01 --to=2025-03-31 --logger-uuid=abc-123
```

### Console output

```
Fetching measurements from 2025-01-01 to 2025-01-31...
Request submitted. UUID: 9f4a1b2c-...
Polling for completion (max 60 attempts, 5s interval)...
  [1/60] Status: Submitted — waiting 5s...
  [2/60] Status: Processing — waiting 5s...
Status: completed.
Downloading 2 data file(s)...
  [1/2] Downloaded.
  [2/2] Downloaded.
Parsed 2880 measurement(s) across 2 file(s).

Total measurements parsed: 2880
Stored in database: 2880
```

---

## Testing

```bash
composer test
```

Tests use Saloon's `MockClient` — no real API calls are made.

## License

MIT
