# ACS Monitor — Laravel Package

Open-source **Laravel package** for the
**[ACS Monitor](https://acsmon.com/)** REST API — the network and
infrastructure monitoring platform from
**[Anglia Computer Solutions](https://angliacomputersolutions.business/)**.

A first-class Laravel integration: service provider, facade, config
file, queueable jobs, and a typed event you can listen for. Wire your
Laravel app into ACS Monitor in under a minute.

> **Licensing:** this Laravel package is open source under the
> [MIT licence](../LICENSE). The ACS Monitor application it talks to
> is licensed commercial software with a **free 100-device tier** —
> see [acsmon.com](https://acsmon.com/) for tiers and pricing.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick start (facade)](#quick-start-facade)
- [Quick start (dependency injection)](#quick-start-dependency-injection)
- [Method reference](#method-reference)
- [Pagination & generators](#pagination--generators)
- [Filtering, sorting, searching](#filtering-sorting-searching)
- [Working with monitors](#working-with-monitors)
- [Working with alerts](#working-with-alerts)
- [Shipped queueable job](#shipped-queueable-job)
- [Listening for AlertEventReceived](#listening-for-alerteventreceived)
- [Error handling](#error-handling)
- [Token storage best practice](#token-storage-best-practice)
- [Recipes](#recipes)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Requirements

| Requirement | Minimum |
|---|---|
| PHP         | 8.1 |
| Laravel     | 10.x, 11.x, or 12.x |
| Guzzle      | 7.x (installed automatically) |

## Installation

```bash
composer require acsmon/laravel-client
```

The package auto-registers via `extra.laravel.providers`, so no manual
service-provider edits are needed. Publish the config file:

```bash
php artisan vendor:publish --tag=acsmon-config
```

That writes `config/acsmon.php`. Then add the env vars:

```bash
ACSMON_BASE_URL=https://monitoring.example.com
ACSMON_TOKEN='1|abc...'
# Or, if you'd rather log in at runtime:
# ACSMON_EMAIL=api@example.com
# ACSMON_PASSWORD='your-strong-password'
```

If you don't want to publish the config, the package falls back to
sensible defaults read from env directly.

## Configuration

The published `config/acsmon.php` exposes:

| Key | Env | Purpose |
|---|---|---|
| `base_url` | `ACSMON_BASE_URL` | Root URL of your ACS Monitor install |
| `token`    | `ACSMON_TOKEN`    | Long-lived bearer token (preferred) |
| `email`    | `ACSMON_EMAIL`    | Fallback: traded for a token at first use |
| `password` | `ACSMON_PASSWORD` | Fallback companion to `email` |
| `http.timeout`         | `ACSMON_TIMEOUT`         | Per-request timeout (seconds, default 30) |
| `http.connect_timeout` | `ACSMON_CONNECT_TIMEOUT` | TCP connect timeout (seconds, default 10) |
| `http.verify`          | `ACSMON_VERIFY_TLS`      | TLS verification (default `true`) |
| `cache.enabled` | `ACSMON_CACHE_ENABLED` | Enable response caching for low-churn endpoints |
| `cache.store`   | `ACSMON_CACHE_STORE`   | Specific cache store (null = default) |
| `cache.ttl`     | `ACSMON_CACHE_TTL`     | Cache TTL in seconds |
| `queue.connection` | `ACSMON_QUEUE_CONNECTION` | Queue connection used by shipped jobs |
| `queue.queue`      | `ACSMON_QUEUE_NAME`       | Queue name used by shipped jobs |

## Quick start (facade)

```php
use AcsMon\Laravel\Facades\AcsMonitor;

// List every device, lazily paginating
foreach (AcsMonitor::devices(['filter[status]' => 'down']) as $device) {
    Log::warning("{$device['name']} is DOWN", $device);
}

// Trigger a one-off SNMP poll
AcsMonitor::pollDevice(42);

// Create a service monitor
$monitor = AcsMonitor::createMonitor([
    'name'  => 'Public website',
    'type'  => 'https',
    'host'  => 'example.com',
    'port'  => 443,
    'check_interval_seconds' => 60,
    'config' => ['method' => 'GET', 'path' => '/', 'expected_status' => 200, 'ssl_verify' => true],
]);

// Acknowledge an alert
AcsMonitor::acknowledgeAlertEvent(9821, 'Investigating in INC-9421');
```

## Quick start (dependency injection)

The container resolves `AcsMonitorClient` as a singleton, so you can
type-hint it anywhere:

```php
use AcsMon\Laravel\AcsMonitorClient;

class StatusController extends Controller
{
    public function __invoke(AcsMonitorClient $api)
    {
        $down = collect();
        foreach ($api->devices(['filter[status]' => 'down']) as $d) {
            $down->push($d);
        }
        return view('status.index', ['down' => $down]);
    }
}
```

## Method reference

The facade proxies every method on `AcsMonitorClient`:

### Auth

| Method | HTTP |
|---|---|
| `AcsMonitor::login($email, $password): string` | `POST /auth/login` |
| `AcsMonitor::logout(): void` | `POST /auth/logout` |
| `AcsMonitor::token(): ?string` | (in-memory accessor) |
| `AcsMonitor::setToken(?string)` | (in-memory mutator) |

### Devices (SNMP)

| Method | HTTP |
|---|---|
| `AcsMonitor::devices(array $query = []): iterable` | `GET /devices` |
| `AcsMonitor::device(int $id): array` | `GET /devices/{id}` |
| `AcsMonitor::pollDevice(int $id): array` | `POST /devices/{id}/poll` |
| `AcsMonitor::deviceMetrics(int $id, array $query = []): array` | `GET /devices/{id}/metrics` |
| `AcsMonitor::deviceAlerts(int $id, array $query = []): array` | `GET /devices/{id}/alerts` |

### Service monitors

| Method | HTTP |
|---|---|
| `AcsMonitor::monitors(array $query = []): iterable` | `GET /monitors` |
| `AcsMonitor::monitor(int $id): array` | `GET /monitors/{id}` |
| `AcsMonitor::createMonitor(array $payload): array` | `POST /monitors` |
| `AcsMonitor::checkMonitor(int $id): array` | `POST /monitors/{id}/check` |
| `AcsMonitor::monitorResults(int $id, array $query = []): array` | `GET /monitors/{id}/results` |
| `AcsMonitor::monitorUptime(int $id, array $query = []): array` | `GET /monitors/{id}/uptime` |

### Alerts

| Method | HTTP |
|---|---|
| `AcsMonitor::alertEvents(array $query = []): iterable` | `GET /alert-events` |
| `AcsMonitor::acknowledgeAlertEvent(int $id, ?string $note = null): array` | `POST /alert-events/{id}/acknowledge` |
| `AcsMonitor::resolveAlertEvent(int $id, ?string $note = null): array` | `POST /alert-events/{id}/resolve` |

### System

| Method | HTTP |
|---|---|
| `AcsMonitor::systemHealth(): array` | `GET /system/health` |

## Pagination & generators

`devices()`, `monitors()`, and `alertEvents()` return PHP generators
that walk every page transparently. To collect into an array:

```php
$all = iterator_to_array(AcsMonitor::devices(), false);
```

To process in chunks (memory friendly for huge result sets):

```php
$chunk = [];
foreach (AcsMonitor::alertEvents(['filter[status]' => 'open']) as $ev) {
    $chunk[] = $ev;
    if (count($chunk) >= 500) {
        DB::table('alerts')->insert($chunk);
        $chunk = [];
    }
}
if ($chunk) DB::table('alerts')->insert($chunk);
```

## Filtering, sorting, searching

| Query param | Example | Effect |
|---|---|---|
| `search` | `'search' => 'core'` | Free-text search on name/host fields |
| `filter[<field>]` | `'filter[status]' => 'down'` | Exact-match filter (chainable) |
| `sort` | `'sort' => '-last_polled_at'` | Sort column. Prefix `-` for descending. |
| `per_page` | `'per_page' => 100` | Page size |
| `page` | `'page' => 3` | Start page |

```php
foreach (AcsMonitor::alertEvents([
    'filter[severity]' => 'critical',
    'filter[status]'   => 'open',
    'sort'             => '-triggered_at',
    'per_page'         => 50,
]) as $ev) {
    // …
}
```

## Working with monitors

```php
// Create
$monitor = AcsMonitor::createMonitor([
    'name'  => 'Login API health',
    'type'  => 'https',
    'host'  => 'api.example.com',
    'port'  => 443,
    'check_interval_seconds' => 60,
    'timeout_ms' => 5000,
    'config' => [
        'method'                => 'GET',
        'path'                  => '/health',
        'expected_status'       => 200,
        'expected_body_regex'   => '"ok":true',
        'ssl_verify'            => true,
        'alert_ssl_expiry_days' => 14,
    ],
]);

// Force an immediate re-check
AcsMonitor::checkMonitor($monitor['id']);

// Read the last 20 results
$recent = AcsMonitor::monitorResults($monitor['id'], ['per_page' => 20]);

// 30-day uptime for SLA reporting
$uptime = AcsMonitor::monitorUptime($monitor['id'], ['window' => '30d']);
```

Other supported `type` values: `ping`, `tcp`, `http`, `https`, `ssh`,
`smtp`, `ftp`, `pop3`, `imap`, `dns`, `mysql`, `redis`, `snmp`. Each
type has its own `config` schema — see the main project README.

## Working with alerts

```php
foreach (AcsMonitor::alertEvents([
    'filter[status]'   => 'open',
    'filter[severity]' => 'critical',
]) as $ev) {
    AcsMonitor::acknowledgeAlertEvent($ev['id'], 'Auto-ack from ' . gethostname());
}

AcsMonitor::resolveAlertEvent($ev['id'], 'Closed by INC-9421');
```

## Shipped queueable job

The package ships with `SyncAlertEventsJob` — a queueable job that
polls open alert events from ACS Monitor and dispatches an
`AlertEventReceived` event for each one. Schedule it from your
console kernel (`app/Console/Kernel.php` on Laravel 10, or
`bootstrap/app.php` on Laravel 11+):

```php
use AcsMon\Laravel\Jobs\SyncAlertEventsJob;

$schedule->job(new SyncAlertEventsJob())
    ->everyMinute()
    ->withoutOverlapping()
    ->name('acsmon-sync-alerts');
```

Pass a custom filter to the constructor to scope what gets pulled:

```php
new SyncAlertEventsJob([
    'filter[status]'   => 'open',
    'filter[severity]' => 'warning',
    'sort'             => '-triggered_at',
])
```

## Listening for AlertEventReceived

Forward open critical alerts into PagerDuty (or anywhere else):

```php
use AcsMon\Laravel\Events\AlertEventReceived;
use AcsMon\Laravel\Facades\AcsMonitor;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;

Event::listen(AlertEventReceived::class, function (AlertEventReceived $e) {
    if (!$e->isOpen() || $e->severity() !== 'critical') return;

    Http::asJson()->post('https://events.pagerduty.com/v2/enqueue', [
        'routing_key'  => config('services.pagerduty.routing_key'),
        'event_action' => 'trigger',
        'dedup_key'    => 'acsmon-' . $e->id(),
        'payload' => [
            'summary'  => ($e->event['monitor']['name'] ?? $e->event['device']['name'] ?? 'ACS')
                          . ': ' . ($e->event['current_value'] ?? 'down'),
            'severity' => 'critical',
            'source'   => 'ACS Monitor',
            'custom_details' => $e->event,
        ],
    ]);

    AcsMonitor::acknowledgeAlertEvent($e->id(), 'Forwarded to PagerDuty');
});
```

A working version lives in
[`examples/AppServiceProvider.example.php`](examples/AppServiceProvider.example.php).

## Error handling

Any non-2xx response throws `AcsMon\Laravel\Exceptions\AcsMonApiException`
with the HTTP status, parsed body, and (where present) validation
errors attached. Network errors throw with `status() === 0`.

```php
use AcsMon\Laravel\Exceptions\AcsMonApiException;

try {
    AcsMonitor::pollDevice(99999);
} catch (AcsMonApiException $e) {
    if ($e->status() === 404) {
        Log::info('Device gone, skipping');
        return;
    }
    if ($errors = $e->validationErrors()) {
        return response()->json(['errors' => $errors], 422);
    }
    if ($e->status() === 0) {
        // network/DNS/TLS — let the queue retry
        throw $e;
    }
    throw $e;
}
```

| Status | Meaning | Recovery |
|---|---|---|
| `401` | Token missing/expired | Re-issue token in Settings → Users |
| `403` | Authenticated but lacks the permission slug for that route | Grant the role via UI |
| `404` | Resource doesn't exist | Check the ID, no retry |
| `422` | Validation error — see `validationErrors()` | Fix the payload |
| `429` | Rate-limited | Back off (`Retry-After` header) |
| `500`+ | Server bug or upstream outage | Retry with backoff |
| `0`    | Network/DNS/TLS/timeout | Retry with backoff |

## Token storage best practice

- Issue a **dedicated API user** in Settings → Users with the minimum
  role needed (`viewer` for read-only, `operator` for ack/resolve,
  `admin` for full write).
- Put the token in your `.env` (`ACSMON_TOKEN`), then in your secrets
  manager for production (Vault, AWS Secrets Manager, Doppler,
  Infisical, etc.) — never commit it.
- Avoid `ACSMON_EMAIL` + `ACSMON_PASSWORD` in production; that mode
  exists for local development only.
- Rotate the token periodically (the package re-reads on every
  request lifecycle — bumping `.env` and clearing config cache is
  enough).

## Recipes

### Status page route

```php
use AcsMon\Laravel\Facades\AcsMonitor;

Route::get('/status', function () {
    $monitors = iterator_to_array(AcsMonitor::monitors(['per_page' => 200]), false);
    return view('status.index', ['monitors' => $monitors]);
});
```

See [`examples/routes.example.php`](examples/routes.example.php).

### CI/CD post-deploy verification (Artisan command)

```php
use AcsMon\Laravel\AcsMonitorClient;
use Illuminate\Console\Command;

class VerifyDeployment extends Command
{
    protected $signature = 'deploy:verify {monitor=117} {--timeout=300}';

    public function handle(AcsMonitorClient $api): int
    {
        $id = (int) $this->argument('monitor');
        $api->checkMonitor($id);

        $deadline = time() + (int) $this->option('timeout');
        while (time() < $deadline) {
            $m = $api->monitor($id);
            if ($m['status'] === 'up') {
                $this->info("✓ {$m['name']} is up ({$m['response_time_ms']}ms)");
                return self::SUCCESS;
            }
            sleep(10);
        }

        $this->error('Health monitor did not return to "up" within window');
        return self::FAILURE;
    }
}
```

### Sync ACS devices into your CMDB nightly

```php
use AcsMon\Laravel\AcsMonitorClient;

class SyncCmdb extends Command
{
    protected $signature = 'cmdb:sync';

    public function handle(AcsMonitorClient $api): int
    {
        foreach ($api->devices() as $d) {
            CmdbAsset::updateOrCreate(
                ['external_id' => "acsmon-{$d['id']}"],
                [
                    'hostname'  => $d['name'],
                    'ip'        => $d['ip_address'],
                    'status'    => $d['status'],
                    'last_seen' => $d['last_polled_at'],
                ],
            );
        }
        return self::SUCCESS;
    }
}
```

Schedule it:

```php
$schedule->command('cmdb:sync')->dailyAt('02:00');
```

### Weekly uptime CSV emailed to stakeholders

```php
use AcsMon\Laravel\Facades\AcsMonitor;

$rows = [['monitor', 'type', 'uptime_pct_7d', 'failed_checks_7d']];
foreach (AcsMonitor::monitors() as $m) {
    $u = AcsMonitor::monitorUptime($m['id'], ['window' => '7d']);
    $rows[] = [$m['name'], $m['type'], $u['uptime_percent'], $u['failed_checks']];
}

Storage::put('reports/uptime-' . now()->toDateString() . '.csv', collect($rows)
    ->map(fn ($r) => implode(',', $r))->implode("\n"));
```

## Testing

The package ships with a Pest 2/3 test suite that exercises the
client, service provider, facade, exception, event, and queueable
job — all without hitting the network (Guzzle's `MockHandler` is
used to simulate every response).

```bash
cd api-clients/laravel
composer install
composer test            # vendor/bin/pest
composer test:coverage   # with code-coverage report
```

Test layout:

```
tests/
├── Pest.php                                  ← binds TestCase to all suites
├── TestCase.php                              ← Orchestra Testbench base + Guzzle mock helper
├── Unit/
│   ├── AcsMonitorClientTest.php              ← request shape, auth header, pagination, errors
│   ├── AcsMonApiExceptionTest.php            ← status / body / validationErrors / chaining
│   └── AlertEventReceivedTest.php            ← payload accessors + sensible defaults
└── Feature/
    ├── ServiceProviderTest.php               ← container singleton, config, facade, publish tag
    └── SyncAlertEventsJobTest.php            ← job dispatches AlertEventReceived, walks pages, honours filters
```

The test suite uses
[`orchestra/testbench`](https://packages.tools/testbench) to boot a
minimal Laravel app, so the same suite runs across Laravel 10, 11,
and 12. To wire it into CI:

```yaml
# .github/workflows/tests.yml (or equivalent)
- run: composer install --prefer-dist --no-interaction
- run: composer test
```

Writing your own tests against the package is straightforward — fake
the underlying HTTP layer with Guzzle's `MockHandler`, or swap a
double into the container:

```php
use AcsMon\Laravel\AcsMonitorClient;

$this->app->instance(AcsMonitorClient::class, Mockery::mock(AcsMonitorClient::class)
    ->shouldReceive('pollDevice')->with(42)->once()
    ->andReturn(['queued' => true])
    ->getMock());
```

## Troubleshooting

**`InvalidArgumentException: ACS Monitor base URL is not configured`** —
You forgot `ACSMON_BASE_URL` in `.env`. Set it and run
`php artisan config:clear`.

**`AcsMonApiException ... HTTP 401`** — Token is missing, expired, or
belongs to a deleted user. Re-issue from Settings → Users.

**`AcsMonApiException ... HTTP 403`** — Authenticated but the user
lacks the permission slug. Promote the role via Settings → Users.

**`SyncAlertEventsJob` runs but nothing happens** — Either no events
match the filter, or no listener is registered for
`AlertEventReceived`. Confirm with `Event::fake()` in a test.

**The facade always returns the same token after I rotated it** — The
client is a singleton resolved once per request lifecycle. After
changing `.env`, run `php artisan config:clear` (and restart your
queue workers, since they hold long-lived processes).

**`SSL certificate problem`** — Either install a real cert on the
monitoring host, add the CA to PHP's `openssl.cafile`, or set
`ACSMON_VERIFY_TLS=false` in non-production environments only.

---

© [Anglia Computer Solutions Ltd.](https://angliacomputersolutions.business/) —
ACS Monitor is a product of Anglia Computer Solutions. Visit
**[acsmon.com](https://acsmon.com/)** for documentation, demos and licensing.
