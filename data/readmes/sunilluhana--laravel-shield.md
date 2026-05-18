# Laravel Shield 🛡️

[![Latest Version on Packagist](https://img.shields.io/packagist/v/shieldapp/laravel-shield.svg?style=flat-square)](https://packagist.org/packages/shieldapp/laravel-shield)
[![PHP Version](https://img.shields.io/badge/php-%5E8.1-blue?style=flat-square)](https://packagist.org/packages/shieldapp/laravel-shield)
[![Laravel Version](https://img.shields.io/badge/laravel-10%20%7C%2011-red?style=flat-square)](https://packagist.org/packages/shieldapp/laravel-shield)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE.md)

A production-grade Laravel package for **IP threat detection & auto-banning**, **external health monitoring**, **real-time traffic analysis**, and **multi-channel alerting** — with a beautiful live dashboard.

---

## Features

- 🚫 **IP auto-banning** — sliding-window rate limiting; automatically blocks IPs that exceed configurable RPM thresholds
- 📡 **External health checks** — uptime, SSL certificate expiry, DNS, response time, security headers, domain expiry
- 📊 **Live dashboard** — real-time traffic map, threat level meter, audit log, ban management, and site monitors in one glassmorphism UI
- 🔔 **Multi-channel alerts** — Email, Slack (Block Kit), and WhatsApp (via Twilio) with per-channel cooldowns to prevent flooding
- 🗂️ **Audit log** — full trail of every DETECT, WARN, AUTO-BAN, BAN, UNBAN, and BLOCKED event
- ⚡ **Redis-first architecture** — all per-request counting stays in Redis; DB writes only for significant events
- 🔄 **Async logging** — optional queue-based DB writes to keep your request cycle fast
- 🤖 **Agent mode** — report CPU, RAM, disk, and queue stats from any server back to a central Shield instance
- 🧹 **Auto-pruning** — configurable retention windows automatically keep your tables lean
- 🔒 **Security hardened** — timing-safe API key comparison, cache-key injection prevention, SSL verification configurable

---

## Requirements

- PHP 8.1+
- Laravel 10 or 11
- A cache driver (Redis recommended for production; `array` works for testing)

---

## Installation

```bash
composer require shieldapp/laravel-shield
php artisan shield:install
```

`shield:install` publishes the config, runs migrations, and prints a setup checklist.

---

## Configuration

Publish the config file independently if needed:

```bash
php artisan vendor:publish --tag=shield-config
```

### Core `.env` variables

```env
# --- Core ---
SHIELD_ENABLED=true
SHIELD_DASHBOARD_PATH=shield               # URL path, e.g. "admin/shield"
SHIELD_WHITELIST=127.0.0.1,::1            # Comma-separated IPs never blocked

# --- Thresholds ---
SHIELD_AUTO_BAN_RPM=500                   # Auto-ban above this req/min
SHIELD_WARN_RPM=200                       # Log WARN event above this req/min
SHIELD_BAN_DURATION=                      # null = permanent; or minutes

# --- External checks ---
SHIELD_SSL_WARN_DAYS=14                   # Alert when SSL expires within N days
SHIELD_DOMAIN_WARN_DAYS=30               # Alert when domain expires within N days
SHIELD_RESPONSE_WARN_MS=1500             # Alert when response time exceeds N ms
SHIELD_VERIFY_SSL=true                    # Set false only in local dev

# --- Async logging (optional, requires a queue worker) ---
SHIELD_ASYNC_LOGGING=false               # true = DB writes happen on a queue
SHIELD_QUEUE=shield                      # Queue name for async log jobs

# --- Data retention ---
SHIELD_LOG_RETENTION_DAYS=30
SHIELD_CHECK_RETENTION_DAYS=7
SHIELD_BAN_RETENTION_DAYS=90
```

---

## Dashboard

Visit `/shield` in your browser (protected by `web` + `auth` middleware by default).

```
https://yourapp.com/shield
```

Customise the path and middleware in `config/shield.php`:

```php
'dashboard_path'       => 'admin/shield',
'dashboard_middleware' => ['web', 'auth', 'role:admin'],
```

### Dashboard features

| Feature | Description |
|---------|-------------|
| **Threat level meter** | Live LOW / MEDIUM / HIGH / CRITICAL indicator based on peak RPM vs your ban threshold |
| **Live traffic table** | Per-IP request counts, user agents, last-seen timestamps — updates every 4 s |
| **Risk badges** | Colour-coded LOW / MEDIUM / HIGH / CRITICAL per IP row |
| **Stat cards** | Active bans, auto-bans, log entries, and monitor count at a glance |
| **Site monitors** | Add any URL and see uptime, SSL, response time, and individual check badges |
| **Audit log** | Filterable full event trail with action colours |
| **Ban / unban** | Modal to add manual bans; one-click unban from the bans table |
| **Toast notifications** | In-browser alerts when new auto-bans are detected between polls |

---

## Multi-Channel Alerts

Alerts fire for: IP auto-ban, site down, SSL expiry.  
All channels are optional and independent — configure only the ones you need.

### Email

```env
SHIELD_ALERT_EMAIL=admin@yoursite.com
```

### Slack

Create an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack workspace:

1. Go to **api.slack.com/apps** → Create App → Incoming Webhooks
2. Activate Incoming Webhooks → Add to channel
3. Copy the webhook URL

```env
SHIELD_SLACK_WEBHOOK=https://hooks.slack.com/services/REDACTED.../B.../xxx
```

Alerts arrive as rich Block Kit messages with colour-coded headers, IP/URL detail fields, and a **View Dashboard** button.

### WhatsApp (via Twilio)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Enable the **WhatsApp Sandbox** (or a dedicated WhatsApp sender) in your Twilio console
3. Note your Account SID and Auth Token

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
SHIELD_WHATSAPP_FROM=whatsapp:+14155238886   # Twilio sandbox number (or your approved number)
SHIELD_WHATSAPP_TO=whatsapp:+447700000000    # The number that receives alerts
```

### Alert cooldown

To prevent flooding, the same alert for the same IP/URL won't re-fire until the cooldown window expires:

```php
// config/shield.php
'alert_cooldown_minutes' => 15,
```

---

## Async Logging (Queue)

By default every significant event (WARN, BAN, BLOCKED) is written to the database synchronously. Enable async mode to push DB writes onto a queue worker:

```env
SHIELD_ASYNC_LOGGING=true
SHIELD_QUEUE=shield
```

Start a queue worker on the `shield` queue:

```bash
php artisan queue:work --queue=shield
```

> **Note:** The `shield:active_ips` Redis map used by the live dashboard is always updated synchronously regardless of this setting — async mode only affects DB writes.

---

## Artisan Commands

```bash
# Run all health checks now (also prunes old data)
php artisan shield:check

# Check a specific URL
php artisan shield:check --url=https://example.com

# Print daily traffic + health summary report
php artisan shield:report
```

---

## Scheduler

Add the Laravel scheduler to your crontab and Shield registers itself automatically:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Shield registers:

| Command | Frequency |
|---------|-----------|
| `shield:check` | Every 5 minutes |
| `shield:report` | Daily at 08:00 |

Pruning of old traffic logs, check results, and expired bans runs inside `shield:check`.

---

## Middleware

The `IpShield` middleware is registered automatically for all HTTP routes via the service provider.

You can also apply it selectively:

```php
// routes/web.php
Route::middleware(['shield'])->group(function () {
    // ...
});
```

Or exclude specific routes from Shield checks by IP-whitelisting in your config.

---

## Agent Mode

Install Shield on any client server. It will POST CPU, RAM, disk, queue, and error stats back to your central Shield dashboard every 5 minutes.

```env
# On the remote (agent) server
SHIELD_AGENT_ENABLED=true
SHIELD_AGENT_ENDPOINT=https://your-shield-saas.com/shield/agent/report
SHIELD_AGENT_KEY=your-secret-api-key
```

On the receiving (hub) server, set the same key:

```env
SHIELD_AGENT_API_KEY=your-secret-api-key
```

### What can be monitored?

| Check | URL-only | With agent |
|-------|----------|------------|
| Uptime | ✅ | ✅ |
| Response time | ✅ | ✅ |
| SSL certificate | ✅ | ✅ |
| DNS records | ✅ | ✅ |
| Security headers | ✅ | ✅ |
| Domain expiry | ✅ | ✅ |
| CPU / RAM / disk | ❌ | ✅ |
| Queue depth | ❌ | ✅ |
| Error log count | ❌ | ✅ |
| IP traffic & bans | Own server only | ✅ |

---

## Data Retention

Shield automatically prunes old records during every `shield:check` run:

| Table | Default retention | Config key |
|-------|-------------------|------------|
| `shield_traffic_logs` | 30 days | `shield.log_retention_days` |
| `shield_check_results` | 7 days | `shield.check_retention_days` |
| `shield_ip_bans` (expired) | 90 days | `shield.ban_retention_days` |

Override in `.env`:

```env
SHIELD_LOG_RETENTION_DAYS=14
SHIELD_CHECK_RETENTION_DAYS=3
SHIELD_BAN_RETENTION_DAYS=60
```

---

## Testing

```bash
composer test
```

The test suite uses Orchestra Testbench with an in-memory SQLite database and the array cache driver — no Redis or MySQL required.

---

## Security

If you discover a security vulnerability please email **sunilluhanaa@gmail.com** rather than opening a public issue.

---

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for details.
