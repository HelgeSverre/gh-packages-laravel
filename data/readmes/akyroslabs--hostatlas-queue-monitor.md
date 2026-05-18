# HostAtlas Queue Monitor

Push Laravel queue metrics to [HostAtlas](https://hostatlas.app) for real-time monitoring, alerting, and visualization.

HostAtlas is an infrastructure visibility platform with 340+ features — server monitoring, uptime checks, incident management, attack defense, AI analysis, and more. The Queue Monitor package connects your Laravel queues to the HostAtlas dashboard, so you can track queue health alongside the rest of your infrastructure.

**[Sign up free](https://my.hostatlas.app/register)** — no credit card required.

---

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- A HostAtlas account with an API key

## Installation

```bash
composer require hostatlas/queue-monitor
```

The service provider is auto-discovered. No manual registration needed.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=hostatlas-queue-config
```

Add to your `.env`:

```env
HOSTATLAS_URL=https://my.hostatlas.app
HOSTATLAS_API_KEY=ha_your_api_key_here
HOSTATLAS_SERVER=web-prod-01
```

| Variable | Description | Default |
|----------|-------------|---------|
| `HOSTATLAS_URL` | Your HostAtlas instance URL | `https://my.hostatlas.app` |
| `HOSTATLAS_API_KEY` | API key from HostAtlas (Settings > API Keys) | — |
| `HOSTATLAS_SERVER` | Server hostname (must match a server in HostAtlas) | System hostname |

### Queue Selection

By default, all queues are auto-detected. To monitor specific queues only, edit `config/hostatlas-queue.php`:

```php
'queues' => ['default', 'emails', 'notifications'],
```

Use `['*']` to auto-detect all queues (default).

## Usage

### Via Scheduler (recommended)

Add to your `routes/console.php`:

```php
Schedule::command('hostatlas:queue-metrics')->everyMinute();
```

### Manual

```bash
php artisan hostatlas:queue-metrics
```

Example output:

```
  default: 42 pending, 2 failed
  emails: 8 pending, 0 failed
  Queue metrics reported to HostAtlas.
```

## Supported Queue Drivers

| Driver | Auto-detect Queues | Metrics |
|--------|-------------------|---------|
| **Redis** | Yes (scans Redis keys) | Size, failed, system type |
| **Database** | Yes (groups by queue column) | Size, failed, processing count |
| **SQS** | No (uses configured queue) | Size |

## What Gets Reported

Each queue reports:

- **Queue name** — auto-detected or configured
- **Pending jobs** — current queue size
- **Failed jobs** — count from `failed_jobs` table
- **Processing jobs** — currently being processed (database driver)
- **System type** — `laravel` (auto-set)

## API Push Endpoint

The package pushes to `POST {HOSTATLAS_URL}/api/v1/queue/push` with Bearer token authentication. You can also push metrics from any language or framework using the same endpoint:

```bash
curl -X POST https://my.hostatlas.app/api/v1/queue/push \
  -H "Authorization: Bearer ha_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "server": "web-prod-01",
    "queues": [
      {"name": "default", "size": 42, "failed": 2, "processing": 3, "system": "laravel"}
    ]
  }'
```

## Multi-System Support

The HostAtlas queue dashboard supports metrics from multiple systems:

- **Laravel** (this package)
- **BullMQ** (Node.js — via API push)
- **Sidekiq** (Ruby — via API push)
- **Celery** (Python — via API push)

## Security

- API key is transmitted via `Authorization: Bearer` header over HTTPS
- No sensitive data is collected — only queue names and counts
- 10-second HTTP timeout per request
- Errors are reported via Laravel's `report()` helper (logged, never thrown)

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by [Akyros Labs LLC](https://akyroslabs.com) — hello@akyroslabs.com

[HostAtlas](https://hostatlas.app) | [Documentation](https://hostatlas.app/tools/queue-monitor) | [Sign up free](https://my.hostatlas.app/register)