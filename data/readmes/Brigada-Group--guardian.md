# Brigada Guardian

Private Laravel monitoring package. Runs security audits, health checks, and real-time event monitoring. Reports everything to Discord — with a built-in web dashboard.

**Full observability for Laravel** — self-hosted, Discord-native, and with a built-in monitoring dashboard.

## Requirements

- PHP ^8.2
- Laravel ^11.0 or ^12.0
- A [Discord](https://discord.com) incoming webhook **if** you want Discord alerts (`GUARDIAN_DISCORD_WEBHOOK` can be omitted if you only use other channels; see below)
- Membership in the [Brigada-Group](https://github.com/Brigada-Group) GitHub organization (for the private package)

## Team Access Setup

Before installing, each developer needs access to the private repository:

### For org admins

1. Go to [Brigada-Group members](https://github.com/orgs/Brigada-Group/people)
2. Click **Invite member** and enter the developer's GitHub username or email
3. Grant access to the `guardian` repository (at minimum **Read** role)

### For developers

Once you've accepted the org invite, create a personal access token:

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Name it something like `composer-brigada`
4. Select the **`repo`** scope (required for private repos)
5. Click **Generate token** and copy the `ghp_...` value immediately

Then configure Composer (one-time per machine):

```bash
composer config --global github-oauth.github.com ghp_YOUR_TOKEN
```

> **Note:** Use `--global` so the token works across all projects on your machine. Never commit tokens to version control.

## Installation & configuration (step by step)

### 1. Add the private Composer repository

In your Laravel app’s root `composer.json`, add the VCS repository (org access + token must be set up as in [Team Access Setup](#team-access-setup) below):

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/Brigada-Group/guardian.git"
        }
    ]
}
```

### 2. Require the package

```bash
composer require brigada/guardian
```

### 3. Run the install command

This **publishes** `config/guardian.php`, publishes the client-error asset tag, and runs **migrations** for Guardian tables:

```bash
php artisan guardian:install
```

You can **publish only the config** later (or on another environment) with:

```bash
php artisan vendor:publish --tag=guardian-config
```

### 4. Finish `.env` (and optional `config/guardian.php`)

After publishing, merge the following into your `.env` as needed. Anything optional can be skipped.

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `GUARDIAN_DISCORD_WEBHOOK` | Optional | Discord incoming webhook URL. If unset, Discord alerts are skipped (no crash). |
| `GUARDIAN_PROJECT_NAME` | Optional | Defaults to `APP_NAME`. |
| `GUARDIAN_ENVIRONMENT` | Optional | Defaults to `APP_ENV`; used for alerting and Hub payloads. |
| `GUARDIAN_HUB_URL` | For Guardian Hub | Base URL of your hub (no `/api/ingest/...` suffix). |
| `GUARDIAN_HUB_PROJECT_ID` | For Guardian Hub | Project id from the Hub. |
| `GUARDIAN_HUB_API_TOKEN` | For Guardian Hub | Bearer token the Hub accepts for ingest. |

Tuning (thresholds, disabled checks, monitoring categories, `hub.async`, etc.) lives in **`config/guardian.php`**. Run `php artisan config:clear` after editing `.env`, and `php artisan config:cache` in production if you cache config.

**Environment gating:** by default `guardian.enabled_environments` only includes `production`. Local/staging apps should set `GUARDIAN_ENVIRONMENT=production` **or** add `'local'` / `'staging'` to `enabled_environments` in the published config, or many features (including audits) will no-op.

### 5. Scheduler (cron)

Guardian registers tasks on Laravel’s schedule (health checks, heartbeat, `guardian:audits`, etc.). Your server **must** invoke the scheduler every minute:

```cron
* * * * * cd /path-to-your-app && php artisan schedule:run >> /dev/null 2>&1
```

Check that jobs are listed:

```bash
php artisan schedule:list
```

### 6. Queue workers (if you use Hub ingest or `hub.async`)

When `config('guardian.hub.async')` is `true` (default), Guardian forwards hub ingest payloads as **queued Laravel jobs** on the queue from `config('guardian.hub.queue')` (default: `default`). You **must** run a worker that processes that queue, for example:

```bash
php artisan queue:work --queue=default
```

(or Horizon / Supervisor equivalent). Without a worker, audits and other ingest events will pile up in Redis/DB and never reach the Hub.

### 7. Verify

```bash
php artisan guardian:test
```

(requires `GUARDIAN_DISCORD_WEBHOOK` to be set).

For Hub connectivity, use your Hub logs or temporarily set `QUEUE_CONNECTION=sync` locally to see HTTP errors inline when running `php artisan guardian:audits`.

---

## Removing Guardian

Queued hub-ingest payloads are serialized using PHP classes from this package under `Brigada\Guardian\Transport`. If you run **`composer remove brigada/guardian`** while those jobs are still pending, workers may throw **`Job is incomplete class` / `PHP_Incomplete_Class`** and retry until the queue is clean — use `guardian:purge-queue-jobs` first (see below).

**Recommended order:**

1. **Stop** queue workers (Supervisor, Horizon, etc.).
2. **Purge Guardian jobs** while the package is still installed:

   ```bash
   php artisan guardian:purge-queue-jobs
   ```

   Use `php artisan guardian:purge-queue-jobs --dry-run` first to see what would be deleted. This command cleans the **database** `jobs` table when your default queue driver is `database`, and prunes matching rows from **`failed_jobs`** when Laravel stores failures in the database.

3. **Redis (or other non-database queues):** `guardian:purge-queue-jobs` cannot delete Guardian jobs selectively from Redis. If your default connection is Redis, **clear that queue** (after pausing workers), e.g.:

   ```bash
   php artisan queue:clear redis --queue=default
   ```

   Replace `redis` and queue name with your connection/queue. Clearing removes **all** jobs on that queue, not only Guardian’s.

4. **Remove the package:**

   ```bash
   composer remove brigada/guardian
   ```

5. **Optional:** Remove published `config/guardian.php` and any migrations you no longer want (Guardian’s migrations may have already created `guardian_*` tables—you can drop them manually if you are decommissioning monitoring).

The `guardian:install` command also prints this removal reminder on first setup.

## What It Monitors

### Cron-Based Health Checks (23 checks)

| Schedule | Checks |
|----------|--------|
| **Every 5 min** | Failed job spikes, stale queue jobs, scheduler heartbeat |
| **Hourly** | Disk space, memory, database/Redis connectivity, log error spikes, queue sizes, Horizon status, storage size |
| **Daily** | Composer audit, npm audit, SSL certificate expiry, .env safety, file permissions, pending migrations, PHP/OS version EOL, config cache staleness, insecure packages, CSRF/CORS config |
| **Weekly** | Full trend report comparing this week vs last week |

### Real-Time Event Monitoring (8 categories)

| Category | What It Captures | Alerts On |
|----------|-----------------|-----------|
| **Requests** | Every HTTP request (method, URI, duration, status) | Slow requests (>5s), high error rates |
| **Outgoing HTTP** | External API calls via Laravel HTTP client | Slow responses, 5xx errors, connection failures |
| **Database Queries** | Slow queries and N+1 patterns | Queries exceeding threshold, N+1 detection |
| **Mail** | Email send/fail events | Delivery failures |
| **Notifications** | All notification channel results | Failed notifications on any channel |
| **Cache** | Hit/miss ratios (aggregated per minute) | Low hit rate (<50%) |
| **Commands** | Artisan command execution and exit codes | Failed commands (non-zero exit), slow commands |
| **Scheduled Tasks** | Individual task completion, duration, failures | Failed tasks, slow tasks |

### Exception Tracking

Every uncaught exception is sent to Discord in real-time with:
- Exception class, message, and stack trace
- URL, status code, user info, IP address
- Deduplication (same exception only alerts once per 5 minutes)

## Dashboard

Guardian includes a built-in monitoring dashboard accessible at `/guardian` (configurable). It provides a real-time view of all monitoring data with interactive charts and tables.

### Pages

| Page | What It Shows |
|------|---------------|
| **Overview** | Key metrics (requests, error rate, response time, cache hit rate), response time and error charts, recent alerts |
| **Requests** | Response time histogram, slowest endpoints, filterable request log |
| **Queries** | Slow queries, N+1 detections, query volume trends |
| **Outgoing HTTP** | External API performance by host, failure rates |
| **Jobs & Scheduler** | Command exit codes, scheduled task status, failures |
| **Mail** | Sent vs failed chart, delivery failures |
| **Notifications** | Channel breakdown, failure rates by channel |
| **Cache** | Hit rate over time, per-store breakdown, read/write ratios |
| **Exceptions** | Grouped by class, occurrence counts, trend chart, expandable details |
| **Health Checks** | Status grid for all 23 checks, Run Now buttons |

### Stack

- **Blade + Alpine.js 3 + Chart.js 4** via CDN — zero build step required
- **30-second polling** with automatic pause when tab is hidden or idle
- **Dark/light mode** toggle with localStorage persistence
- Self-contained — no impact on your host app's middleware, routes, or assets

### Enabling the Dashboard

The dashboard is enabled by default. Configure it in `config/guardian.php`:

```php
'dashboard' => [
    'enabled' => true,
    'path' => 'guardian',           // URL prefix: /guardian
    'allowed_ips' => [],            // Empty = no IP restriction
    'poll_interval' => 30,          // Seconds between data refreshes
    'per_page' => 50,               // Rows per table page
],
```

### Access Control

The dashboard requires **both** a Gate check and an optional IP whitelist.

**1. Define the gate** in your `AuthServiceProvider` or `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('viewGuardianDashboard', function ($user) {
    return $user->is_admin; // Your logic here
});
```

**2. Optionally restrict by IP:**

```php
'dashboard' => [
    'allowed_ips' => ['127.0.0.1', '10.0.0.0/24'],
],
```

If `allowed_ips` is empty, only the gate check is enforced.

### API Endpoints

Each dashboard page has a corresponding JSON API endpoint at `/guardian/api/{section}`. These are rate-limited (60 requests/minute per IP) and return `Cache-Control: no-store` headers. The dashboard's own requests are excluded from Guardian's request monitoring.

## Security

Guardian includes several security features to protect sensitive data in monitoring logs and Discord alerts.

### SQL Sanitization

Sensitive values in SQL queries are redacted before storage:

```php
// Stored as: select * from users where email = '[REDACTED]' and id = ?
'security' => [
    'sanitize_sql' => true,     // Enabled by default
],
```

### Stack Trace Sanitization

Exception messages and stack traces sent to Discord are automatically cleaned:
- Base paths stripped from file references
- Values after `password=`, `token=`, `secret=`, `key=`, `authorization=` are redacted
- Bearer tokens are redacted

### Header Filtering

Only safe headers are included in Discord exception alerts (whitelist approach):

```php
'security' => [
    'safe_headers' => ['User-Agent', 'Referer', 'Accept', 'Content-Type'],
],
```

Headers like `Authorization`, `Cookie`, `X-CSRF-Token`, and `X-API-Key` are never sent to Discord.

### IP Anonymization (GDPR)

Optionally anonymize IP addresses in request logs:

```php
'security' => [
    'anonymize_ip' => false,    // Set to true to enable
],
```

When enabled, the last octet of IPv4 addresses is zeroed (`192.168.1.42` becomes `192.168.1.0`), and the last 80 bits of IPv6 addresses are zeroed.

### Mail Recipient Hashing

Optionally hash email recipients before storage:

```php
'security' => [
    'hash_mail_recipients' => false,    // Set to true to enable
],
```

When enabled, email addresses are stored as SHA-256 hashes, allowing unique recipient counting without storing PII.

### Discord Webhook Validation

Guardian validates that the configured webhook URL points to a Discord domain (`discord.com` or `discordapp.com`). Non-Discord URLs trigger a warning log but are still allowed (for proxy setups).

## Commands

```bash
php artisan guardian:install                     # Publish config & assets + run migrations
php artisan guardian:test                        # Send test notification to Discord
php artisan guardian:purge-queue-jobs            # Strip Guardian ingest jobs from DB queue/failed_jobs (before composer remove)
php artisan guardian:purge-queue-jobs --dry-run # Preview deletes only
php artisan guardian:audits                      # Composer + npm audit → Guardian Hub ingest (scheduled daily too)
php artisan guardian:verify TOKEN                # Guardian Hub connection verification flow
php artisan guardian:run hourly                   # Run hourly checks
php artisan guardian:run daily                    # Run daily checks
php artisan guardian:run --check=DiskSpaceCheck   # Run a single check
php artisan guardian:status                       # View latest results locally
php artisan guardian:prune                        # Delete old monitoring data
php artisan guardian:prune --days=7               # Override retention period
php artisan guardian:prune --dry-run              # Preview what would be deleted
```

## Configuration

Publish and edit `config/guardian.php`:

```bash
php artisan vendor:publish --tag=guardian-config
```

### Disable checks

```php
'disabled_checks' => [
    \Brigada\Guardian\Checks\HorizonStatusCheck::class,
    \Brigada\Guardian\Checks\NpmAuditCheck::class,
],
```

### Adjust health check thresholds

```php
'thresholds' => [
    'disk_percent' => ['warning' => 70, 'critical' => 85],
    'queue_size'   => ['warning' => 50, 'critical' => 200],
    'db_response_ms' => ['warning' => 50, 'critical' => 200],
],
```

### Configure real-time monitoring

Each monitoring category can be individually enabled/disabled with its own thresholds:

```php
'monitoring' => [
    'requests' => [
        'enabled' => true,
        'slow_threshold_ms' => 5000,
        'error_rate_threshold' => 50,
        'error_rate_window_minutes' => 5,
    ],
    'queries' => [
        'enabled' => true,
        'slow_threshold_ms' => 500,
        'n_plus_one_threshold' => 10,
    ],
    'outgoing_http' => [
        'enabled' => true,
        'slow_threshold_ms' => 10000,
    ],
    'cache' => [
        'enabled' => true,
        'low_hit_rate_threshold' => 50,
    ],
    'commands' => [
        'enabled' => true,
        'slow_threshold_ms' => 60000,
        'ignored' => ['some:noisy-command'],
    ],
    'scheduled_tasks' => [
        'enabled' => true,
        'slow_threshold_ms' => 300000,
    ],
],
```

### Data retention

Control how long monitoring data is kept before `guardian:prune` cleans it up:

```php
'retention' => [
    'results_days' => 30,
    'request_logs_days' => 7,
    'query_logs_days' => 7,
    'cache_logs_days' => 7,
    'mail_logs_days' => 30,
    'command_logs_days' => 30,
    'scheduled_task_logs_days' => 30,
],
```

### Environment gating

```php
'enabled_environments' => ['production', 'staging'],
```

### Ignored exceptions

```php
'exceptions' => [
    'enabled' => true,
    'dedup_minutes' => 5,
    'ignored_exceptions' => [
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Illuminate\Auth\AuthenticationException::class,
    ],
],
```

## Request Monitoring Middleware

The request monitoring middleware is available as `Brigada\Guardian\Http\Middleware\RequestMonitor`. Register it in your application's middleware stack to capture request metrics.

For **Laravel 11+** (bootstrap/app.php):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\Brigada\Guardian\Http\Middleware\RequestMonitor::class);
})
```

For **Laravel 10** (app/Http/Kernel.php):

```php
protected $middleware = [
    // ...
    \Brigada\Guardian\Http\Middleware\RequestMonitor::class,
];
```

## Scheduling

Guardian auto-registers its cron checks via the service provider. Ensure the Laravel scheduler is running:

```
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

Schedule times are configurable:

```php
'notifications' => [
    'daily_summary_time' => '06:00',
    'weekly_summary_day' => 'monday',
],
```

## Discord Notifications

- Color-coded embeds: red = critical, orange = warning, green = ok, blue = test
- Duplicate alerts suppressed within configurable windows (default: 60 min for checks, 5 min for events)
- Daily and weekly summary reports aggregate all check results
- Rate limit handling with automatic retry on 429 responses

## CI / Server Setup

For CI pipelines and production servers, use a token stored as a secret.

### GitHub Actions

Add `COMPOSER_GITHUB_TOKEN` as a repository secret, then:

```yaml
- run: composer config github-oauth.github.com ${{ secrets.COMPOSER_GITHUB_TOKEN }}
- run: composer install
```

### Production Servers

```bash
composer config --global github-oauth.github.com ghp_YOUR_DEPLOY_TOKEN
```

Use a dedicated machine user or fine-grained token with read-only access to the `guardian` repo.

## Database Tables

Guardian creates the following tables:

| Table | Purpose |
|-------|---------|
| `guardian_results` | Health check results + deduplication |
| `guardian_request_logs` | HTTP request metrics |
| `guardian_outgoing_http_logs` | External API call tracking |
| `guardian_query_logs` | Slow queries and N+1 patterns |
| `guardian_mail_logs` | Email delivery tracking |
| `guardian_notification_logs` | Notification channel results |
| `guardian_cache_logs` | Cache hit/miss aggregations |
| `guardian_command_logs` | Artisan command execution |
| `guardian_scheduled_task_logs` | Scheduled task tracking |
