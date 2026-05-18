# Request Tracer

Standalone request tracing package for Laravel. Captures outgoing HTTP and SOAP requests, and optionally incoming requests. All traces are stored asynchronously via queued jobs.

## Requirements

- PHP 8.4+
- Laravel 12+
- `ext-soap` and `ext-simplexml` (only if using SOAP tracing)

## Installation

```bash
composer require kolaybi/request-tracer
```

Publish the config:

```bash
php artisan vendor:publish --tag=request-tracer-config
php artisan migrate
```

## Configuration

```php
// config/kolaybi/request-tracer.php

return [
    'connection'       => env('REQUEST_TRACER_DB_CONNECTION'),
    'schema'           => env('REQUEST_TRACER_DB_SCHEMA'),

    'queue_connection' => env('REQUEST_TRACER_QUEUE_CONNECTION', 'redis'),
    'queue'            => env('REQUEST_TRACER_QUEUE', 'request_logging'),

    'tenant_column'    => 'tenant_id',
    'tenant_cast'      => 'integer', // 'integer', 'string', or any Eloquent cast type
    'user_cast'        => 'integer', // 'integer', 'string', or any Eloquent cast type

    'max_body_size'    => (int) env('REQUEST_TRACER_MAX_BODY_SIZE', 0),
    'retention_days'   => (int) env('REQUEST_TRACER_RETENTION_DAYS', 0),

    'mask_sensitive'   => (bool) env('REQUEST_TRACER_MASK_SENSITIVE', false),
    'mask_value'       => env('REQUEST_TRACER_MASK_VALUE', '[REDACTED]'),
    'sensitive_keys'   => env(
        'REQUEST_TRACER_SENSITIVE_KEYS',
        'authorization,proxy-authorization,cookie,set-cookie,x-api-key,api-key,apikey,token,access_token,refresh_token,id_token,password,passcode,secret,client_secret,private_key',
    ),

    'context_provider' => null,

    'outgoing' => [
        'enabled'     => env('REQUEST_TRACER_OUTGOING_ENABLED', true),
        'table'       => 'outgoing_request_traces',
        'model'       => OutgoingRequestTrace::class,
        'sample_rate' => (float) env('REQUEST_TRACER_OUTGOING_SAMPLE_RATE', 1.0),
        'only'        => env('REQUEST_TRACER_OUTGOING_ONLY', ''),   // Comma-separated host/path patterns (supports wildcards: 'api.example.com*')
        'except'      => env('REQUEST_TRACER_OUTGOING_EXCEPT', ''), // Comma-separated host/path patterns (supports wildcards: '*.internal.com*')
    ],

    'incoming' => [
        'enabled'               => env('REQUEST_TRACER_INCOMING_ENABLED', false),
        'table'                 => 'incoming_request_traces',
        'model'                 => IncomingRequestTrace::class,
        'sample_rate'           => (float) env('REQUEST_TRACER_INCOMING_SAMPLE_RATE', 1.0),
        'only'                  => env('REQUEST_TRACER_INCOMING_ONLY', ''), // Comma-separated paths (supports wildcards: 'api/orders*')
        'except'                => env('REQUEST_TRACER_INCOMING_EXCEPT', ''), // Comma-separated paths (supports wildcards: 'health*,telescope*')
        'capture_response_body' => (bool) env('REQUEST_TRACER_INCOMING_CAPTURE_RESPONSE', false),
        'channel_header'        => env('REQUEST_TRACER_INCOMING_CHANNEL_HEADER'), // Header name to read channel from (e.g. 'Channel')
    ],
];
```

If `REQUEST_TRACER_MASK_SENSITIVE=true`, matching keys in headers and JSON/form payloads are masked before storage.

## Middleware

Add `RequestTracerMiddleware` to your middleware stack. It generates a `trace_id` for every request and records incoming traces when enabled.

```php
// bootstrap/app.php

use KolayBi\RequestTracer\Middleware\RequestTracerMiddleware;

->withMiddleware(function (Middleware $middleware) {
    $middleware->prepend(RequestTracerMiddleware::class);
})
```

The middleware accepts an optional channel parameter to tag incoming traces by route group:

```php
// Per route group — channel set via middleware parameter
Route::middleware([RequestTracerMiddleware::class.':web'])->group(...)
Route::middleware([RequestTracerMiddleware::class.':mobile'])->group(...)

// Channel from request header — set incoming.channel_header in config
// Header value takes priority over middleware parameter
```

## Context Provider

Implement `TraceContextProvider` to supply tenant, user, and server information:

```php
use KolayBi\RequestTracer\Contracts\TraceContextProvider;

class AppTraceContextProvider implements TraceContextProvider
{
    public function tenantId(): int|string|null
    {
        return auth()->user()?->company_id;
    }

    public function userId(): int|string|null
    {
        return auth()->id();
    }

    public function clientIp(): ?string
    {
        return request()?->ip();
    }

    public function serverIdentifier(): ?string
    {
        return gethostname();
    }
}
```

Register it in your config:

```php
'context_provider' => AppTraceContextProvider::class,
```

## Usage

### HTTP Tracing

Outgoing HTTP requests are traced automatically when `outgoing.enabled` is `true`. Use `channel()` or `traceOf()` to tag requests:

```php
Http::channel('payment-gateway')->post('https://api.example.com/charge', $data);

Http::traceOf('bank-api')
    ->withTraceExtra(['order_id' => 123])
    ->get('https://bank.example.com/status');
```

### SOAP Tracing

Extend `TracingSoapClient` for traced SOAP calls:

```php
use KolayBi\RequestTracer\Soap\TracingSoapClient;

$client = TracingSoapClient::with('https://service.example.com?wsdl');

$client->channel('e-invoice')->SomeOperation($params);
```

`TracingSoapClient` supports lazy initialization — set the WSDL later if needed:

```php
$client = new TracingSoapClient();
$client->setWsdl('https://service.example.com?wsdl');
$client->setOptions(['soap_version' => SOAP_1_2]);
```

### Incoming Tracing

Enable in config:

```env
REQUEST_TRACER_INCOMING_ENABLED=true
```

The middleware records every incoming request with method, path, route, status, timing, headers, and optionally the response body.

> **Note:** `response_size` is always recorded regardless of the `capture_response_body` setting. It is read from the Symfony `Response` content when available, and falls back to the `Content-Length` header when content is unavailable.

## Debugging

Display a chronological waterfall of all traces linked to a `trace_id`:

```bash
php artisan request-tracer:waterfall 01JEXAMPLE123
```

The command first prints a summary header:

```
Trace ID …………………………………………………… 01JEXAMPLE123
Tenant ID ………………………………………………… 42
User ID ……………………………………………………… 7
Client IP ………………………………………………… 192.168.1.10
First Start …………………………………………… 2026-02-28 12:00:00.000
Last End …………………………………………………… 2026-02-28 12:00:01.250
Total Duration …………………………………… 1250ms
```

Followed by a waterfall table of all traces sorted by start time:

```
+---+-----+----------+------+-----------------------------------------------+--------+----------+-----------------+--------+-------------------------+
| # | ID  | Type     | Method | Endpoint                                    | Status | Duration | Channel         | Server | Start                   |
+---+-----+----------+------+-----------------------------------------------+--------+----------+-----------------+--------+-------------------------+
| 1 | 501 | INCOMING | POST | api.example.com/webhooks (api/webhooks)       | 200    | 1250ms   | —               | web-01 | 2026-02-28 12:00:00.000 |
| 2 | 830 | OUTGOING | GET  | https://bank.example.com/status?ref=abc       | 200    | 320ms    | bank-api        | web-01 | 2026-02-28 12:00:00.100 |
| 3 | 831 | OUTGOING | POST | https://payment.example.com/charge            | 201    | 890ms    | payment-gateway | web-01 | 2026-02-28 12:00:00.350 |
+---+-----+----------+------+-----------------------------------------------+--------+----------+-----------------+--------+-------------------------+
```

This is useful for inspecting the full request flow — incoming request plus all outgoing calls it triggered — in chronological order.

### Inspect

Drill into a single trace by its ULID with progressive verbosity:

```bash
# Metadata only (type, method, endpoint, status, duration, timing, sizes, etc.)
php artisan request-tracer:inspect 01JEXAMPLE123

# + request/response headers
php artisan request-tracer:inspect 01JEXAMPLE123 -v

# + request/response body (truncated to 20 lines)
php artisan request-tracer:inspect 01JEXAMPLE123 -vv

# + body at 40 lines + exception, message, stats, extra (outgoing)
php artisan request-tracer:inspect 01JEXAMPLE123 -vvv

# Everything, no truncation
php artisan request-tracer:inspect 01JEXAMPLE123 --full
```

The command searches both incoming and outgoing tables automatically — no need to specify which.

## Data Retention

### Table Rotation (recommended)

Rotate trace tables daily — the current table is atomically swapped with a fresh empty one, and the old data moves to a dated archive table (e.g. `outgoing_request_traces_20260309`). Archives older than `retention_days` are dropped automatically.

```bash
php artisan request-tracer:rotate
php artisan request-tracer:rotate --days=30
```

Schedule it to run daily:

```php
$schedule->command('request-tracer:rotate')->daily();
```

### Row-level Purge

Alternatively, delete old rows from the current table in chunks:

```bash
php artisan request-tracer:purge --days=30
php artisan request-tracer:purge --days=90 --chunk=10000
```

Or set `retention_days` in config and schedule it:

```php
$schedule->command('request-tracer:purge')->daily();
```

### Preserving Selected Traces

Some traces are operationally critical (e.g. integrations with external systems for audit purposes) and must survive rotation and retention. The `request-tracer:preserve` command sweeps rows matching configured glob patterns from the just-rotated archive table into a permanent `*_persistent` table.

Configure persist patterns per direction:

```env
REQUEST_TRACER_INCOMING_PERSIST=api/*,kolaybi/*
REQUEST_TRACER_OUTGOING_PERSIST=*api*
```

- **Incoming** patterns match `request->path()` (same as `INCOMING_ONLY`).
- **Outgoing** patterns match the trimmed `host + path` string (same as `OUTGOING_ONLY`).

Wire the command to run immediately after rotation:

```php
$schedule->command('request-tracer:rotate')
    ->daily()
    ->then(function () {
        $this->call('request-tracer:preserve');
    });
```

Backfill or re-run a specific archive:

```bash
php artisan request-tracer:preserve --date=20260511
php artisan request-tracer:preserve --all
php artisan request-tracer:preserve --direction=incoming
```

The command is idempotent: re-running over the same archive does not duplicate rows (uses `INSERT IGNORE` / `ON CONFLICT DO NOTHING` keyed on the ULID PK).

## How It Works

### Outgoing Traces

- `RequestSending` listener stores per-request trace metadata (`started_at`) in request attributes and `RequestTimingStore`
- `Http::channel()` / `Http::traceOf()` and `Http::withTraceExtra()` set per-request metadata in `request_tracer` attributes
- Event listeners (`ResponseReceived`, `ConnectionFailed`) build trace attributes and dispatch `StoreTraceJob`
- Any `X-Trace-*` headers present on requests/responses are stripped before persisting

### Incoming Traces

- `RequestTracerMiddleware` generates a `trace_id` and records start time
- After the response is returned, `IncomingTraceRecorder` builds attributes and dispatches `StoreTraceJob`
- The same `trace_id` links incoming and outgoing traces within a request

### SOAP Traces

- `TracingSoapClient` stores channel/extra as instance properties
- `__doRequest()` dispatches events with timing, channel, and extra
- Properties are reset after each call (no leakage between calls)

### Workers / Queue Jobs

- The middleware does not run on workers, but outgoing tracing works identically
- `trace_id` is lazily generated via `Context` on the first outgoing call
- Laravel resets `Context` between queue jobs, so each job gets a fresh `trace_id`

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/kolaybi/.github/blob/master/CONTRIBUTING.md) for details.

## License

Please see [License File](LICENSE.md) for more information.
