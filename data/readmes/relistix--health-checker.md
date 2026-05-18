# relistix/health-checker

A Laravel package that integrates [Healthchecks.io](https://healthchecks.io/docs/) to monitor:

- **queue worker availability** — by dispatching a probe job that pings Healthchecks.io when (and only when) a worker processes it,
- **mail server availability** — by sending a probe email to a Healthchecks.io email-ping address,
- and offers a **configurable ping URL builder** for use in your own scheduled jobs and commands.

No persistent storage. No UI. Configure it, schedule the commands, watch your Healthchecks.io dashboard.

Compatible with **Laravel 10, 11, and 12** on **PHP 8.1+**.

---

## Installation

```bash
composer require relistix/health-checker
```

The service provider is auto-discovered.

Publish the config:

```bash
php artisan vendor:publish --tag=healthchecker-config
```

Optionally publish the mail probe view (only if you want to customize the body):

```bash
php artisan vendor:publish --tag=healthchecker-views
```

---

## Configuration overview

Open `config/healthchecker.php`. Two top-level arrays drive the package:

- `queue_checks.<name>` — one entry per queue you want to monitor.
- `mail_checks.<name>` — one entry per mail flow you want to monitor.

Each is seeded with a `default` entry. Add more entries to monitor multiple queues or multiple mail flows; reference them by name from the commands.

### Required env vars per feature

| You want to… | Set these env vars (for the `default` check) |
|--------------|----------------------------------------------|
| Build any Healthchecks.io ping URL | `HEALTHCHECKER_BASE_URL` (defaults to `https://hc-ping.com`) and **either** a UUID **or** a ping-key + slug pair (see below). |
| Use a UUID-style check | `HEALTHCHECKER_QUEUE_DEFAULT_UUID` (or `HEALTHCHECKER_MAIL_DEFAULT_UUID`) — the UUID of the check from the Healthchecks.io UI. |
| Use a slug-style check | `HEALTHCHECKER_PING_KEY` (your Healthchecks.io project ping key, applied to all slug-based checks) **and** `HEALTHCHECKER_QUEUE_DEFAULT_SLUG` (or `HEALTHCHECKER_MAIL_DEFAULT_SLUG`). The per-check `ping_key` overrides the global one if set. |
| Probe a queue | The ping target above **and** `HEALTHCHECKER_QUEUE_DEFAULT_NAME` (the queue the probe job will be dispatched onto). Optionally `HEALTHCHECKER_QUEUE_DEFAULT_CONNECTION`. |
| Probe a mail server | `HEALTHCHECKER_MAIL_DEFAULT_RECIPIENT` (the Healthchecks.io email-ping address for the check, e.g. `<unique>@hc-ping.com`). Optionally `HEALTHCHECKER_MAIL_DEFAULT_SUBJECT` and `HEALTHCHECKER_MAIL_DEFAULT_MAILER`. |

Multiple checks: copy the `default` entry under `queue_checks` or `mail_checks`, give it a new key, point it at different env vars.

### Master on/off switch

Set `HEALTHCHECKER_ENABLED=false` (default: `true`) to short-circuit every part of the package. Both scheduled commands return `SUCCESS` without dispatching or sending mail, and `QueueHealthPingJob::handle()` no-ops if a job was already on the queue when the flag flipped. Use this to silence probe traffic in local and dev environments without removing the scheduled commands or unsetting your check UUIDs.

### HTTP client tuning

- `HEALTHCHECKER_HTTP_TIMEOUT` — request timeout in seconds (default `5`).
- `HEALTHCHECKER_HTTP_RETRIES` — extra retries on failure (default `0`, i.e. one attempt total).

---

## Commands

### `healthchecker:check-queue`

Dispatches a queue health-probe job onto a configured queue. When a worker picks it up, the job POSTs a small JSON body to the configured Healthchecks.io ping URL. If the worker is down, the ping never arrives and Healthchecks.io alerts on the missed check-in.

```bash
php artisan healthchecker:check-queue                          # uses 'default' check
php artisan healthchecker:check-queue emails                   # uses 'emails' check
php artisan healthchecker:check-queue emails --queue=high      # override queue
php artisan healthchecker:check-queue emails --connection=sqs  # override connection
```

### `healthchecker:check-mail`

Sends a plain-text probe email to the configured recipient.

```bash
php artisan healthchecker:check-mail                              # uses 'default' check
php artisan healthchecker:check-mail reports                      # uses 'reports' check
php artisan healthchecker:check-mail reports --to=other@host.com  # override recipient
```

Both commands are designed to fail gracefully: missing or incomplete configuration is logged extensively (including the check name and exactly what is missing) and returns a non-zero exit code. **Pinging never throws** — a network failure, a misconfigured URL, or a mail-server outage will be logged but will not break your scheduler.

---

## Scheduling

Scheduling is the host application's responsibility. Add the commands to your scheduler however you normally do:

**Laravel 11+ (`routes/console.php`):**

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('healthchecker:check-queue')->everyFiveMinutes();
Schedule::command('healthchecker:check-mail')->hourly();

// Multiple checks:
Schedule::command('healthchecker:check-queue emails')->everyFiveMinutes();
Schedule::command('healthchecker:check-queue reports --queue=reports')->everyTenMinutes();
```

**Laravel 10 (`app/Console/Kernel.php`):**

```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('healthchecker:check-queue')->everyFiveMinutes();
    $schedule->command('healthchecker:check-mail')->hourly();
}
```

Make sure `php artisan schedule:run` is wired into cron, and that workers are running (`php artisan queue:work` for the queues you probe).

---

## Using the URL builder directly

For ad-hoc pings from your own code:

```php
use Relistix\HealthChecker\Support\PingUrlBuilderFactory;
use Relistix\HealthChecker\Support\Pinger;

public function runImport(PingUrlBuilderFactory $factory, Pinger $pinger): void
{
    $urls = $factory->forQueueCheck('imports'); // or $factory->forMailCheck('reports')

    $pinger->ping($urls->start());

    try {
        // ... do work ...
        $pinger->ping($urls->success(), ['rows' => $count]);
    } catch (\Throwable $e) {
        $pinger->ping($urls->fail(), ['error' => $e->getMessage()]);
        throw $e;
    }
}
```

Both factory methods return a `Relistix\HealthChecker\Contracts\PingUrlBuilder` — typehint against the contract in your own code if you want to fake it in tests.

Available URL variants on `PingUrlBuilder`:

| Method | URL form |
|--------|----------|
| `success()` | `<base>/<uuid>` |
| `fail()` | `<base>/<uuid>/fail` |
| `start()` | `<base>/<uuid>/start` |
| `log()` | `<base>/<uuid>/log` |
| `exitStatus(int $code)` | `<base>/<uuid>/<code>` |

(Slug-style URLs use `<base>/<ping_key>/<slug>` instead of `<base>/<uuid>`.)

---

## Testing

```bash
composer test
# or a single test:
./vendor/bin/phpunit --filter PingUrlBuilderTest
```

Tests use [Orchestra Testbench](https://github.com/orchestral/testbench) and Laravel's built-in `Http::fake()`, `Queue::fake()`, and `Mail::fake()`.

---

## License

MIT — see [LICENSE](LICENSE).
