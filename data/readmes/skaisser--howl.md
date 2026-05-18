<div align="center">

<img src="docs/public/logo-howl.svg" alt="Howl — Multi-driver Laravel notifier" width="420">

**Multi-driver Laravel notifier — Discord, Slack, and Telegram with rich embeds.**

*When something goes wrong, your app should howl into the night.*

<p>
  <a href="https://packagist.org/packages/skaisser/howl"><img src="https://img.shields.io/packagist/v/skaisser/howl.svg?style=for-the-badge&label=Packagist&color=ED4245" alt="Latest Version"></a>
  <a href="https://packagist.org/packages/skaisser/howl"><img src="https://img.shields.io/packagist/dt/skaisser/howl.svg?style=for-the-badge&label=Downloads&color=57F287" alt="Total Downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/packagist/l/skaisser/howl.svg?style=for-the-badge&label=License&color=4169E1" alt="License"></a>
</p>

<p>
  <a href="https://github.com/skaisser/howl/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/skaisser/howl/test.yml?style=for-the-badge&label=Tests&logo=github" alt="Tests"></a>
  <img src="https://img.shields.io/badge/Tests-487%20passing-success?style=for-the-badge&logo=pestphp" alt="487 Tests Passing">
  <img src="https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge&logo=codecov" alt="100% Coverage">
</p>

<p>
  <img src="https://img.shields.io/badge/PHP-8.3%20%7C%208.4-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.3 | 8.4">
  <img src="https://img.shields.io/badge/Laravel-12.x%20%7C%2013.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12 | 13">
  <img src="https://img.shields.io/badge/Pest-3.x%20%7C%204.x-5d3eef?style=for-the-badge&logo=pestphp&logoColor=white" alt="Pest 3 | 4">
</p>

<p>
  <img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  <img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white" alt="Slack">
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram">
</p>

**[📖 Full documentation at howl.skaisser.dev →](https://howl.skaisser.dev)**

</div>

---

## ✨ Why Howl?

A single driver-agnostic API for Discord, Slack, and Telegram. Drop it into any Laravel 12 or 13 app and start delivering rich, structured notifications in minutes.

- 🎯 **One fluent API for all three drivers** — switch per-call without touching business logic
- 🎨 **Rich, native formatting per platform** — Discord embeds, Slack Block Kit, Telegram HTML — with mentions, fields, code blocks, buttons, attachments
- 🛰️ **Channel failover & fan-out** — automatic backup channel dispatch on failure
- 📦 **Seven built-in event templates** — exceptions, deployments, audits, cron heartbeats, job failures, manual ops, generic info
- 🧪 **HowlFake test helper** — assert notifications without real HTTP calls; per-driver assertions
- ⚡ **Queue-aware** with exponential backoff and opt-in Redis rate limiting
- ✅ **100% line coverage** across 487 tests, enforced by `pest --coverage --min=100`
- 📚 **Versioned docs** at `howl.skaisser.dev` plus machine-readable `llms.txt` for AI agents

---

## 🛠️ Compatibility

| PHP | Laravel | Pest | PHPUnit | Testbench | Status |
|:---:|:-------:|:----:|:-------:|:---------:|:------:|
| 8.3 | 12.x | 3.x | 11.x | 10.x | ✅ |
| 8.3 | 13.x | 4.x | 12.x | 11.x | ✅ |
| 8.4 | 12.x | 3.x | 11.x | 10.x | ✅ |
| 8.4 | 13.x | 4.x | 12.x | 11.x | ✅ |

Composer constraints support all four combinations. CI validates the latest combo (PHP 8.4 × Laravel 13) on every push and PR targeting `main`; the other rows are validated locally before each release.

---

## 📦 Installation

```bash
composer require skaisser/howl
php artisan vendor:publish --tag=howl-config
```

Add your driver credentials to `.env`:

```env
HOWL_DRIVER=discord                            # discord | slack | telegram
HOWL_DEFAULT_CHANNEL=errors                    # primary channel name

# Discord
HOWL_DISCORD_DEFAULT=https://discord.com/api/webhooks/...

# Slack (optional — only if you use the slack driver)
HOWL_SLACK_BOT_TOKEN=xoxb-...
HOWL_SLACK_DEFAULT_CHANNEL=C0XXXXXXX

# Telegram (optional — only if you use the telegram driver)
HOWL_TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
HOWL_TELEGRAM_CHAT_ID=-1001234567890
```

---

## 🚀 Quick Start

```php
use Skaisser\Howl\Facades\Howl;
use Skaisser\Howl\Events\GenericExceptionEvent;

// Direct severity verbs — use config('howl.driver') by default
Howl::error(new GenericExceptionEvent($exception));
Howl::info('Scheduled job completed');
Howl::audit($auditEvent);

// Channel routing — per-call override beats event default beats config
Howl::on('audits')->audit($event);

// Per-call driver override — same payload, different destination
Howl::driver('slack')->info('Deploy succeeded');
Howl::driver('telegram')->error('Database connection lost');

// Chainable: pick driver + channel + severity in one go
Howl::driver('slack')->channel('deployments')->success('v1.2.0 shipped');
```

### 📨 Built-in event templates

```php
use Skaisser\Howl\Events\{
    GenericExceptionEvent,
    DeploymentEvent,
    AuditEvent,
    CronHeartbeatEvent,
    JobRetryExhaustedEvent,
    ManualOperationEvent,
    GenericInfoEvent,
};

Howl::error(new GenericExceptionEvent($e));
Howl::deployment(new DeploymentEvent(version: 'v1.2.0', env: 'production', commit: 'abc1234'));
Howl::audit(new AuditEvent(actor: $user->email, action: 'role.changed', target: $role));
```

---

## 🛰️ Channel Failover & Fan-Out

Configure a backup channel and pick the mode:

```php
// config/howl.php
'channel' => 'errors',
'channel_backup' => 'errors-backup',
'channel_mode' => 'failover',   // try primary; on failure, backup once
// or
'channel_mode' => 'fan_out',    // dispatch to BOTH channels in parallel
```

- **`failover`** (default): primary first, backup only on failure. `true` on first success, `false` if both fail.
- **`fan_out`**: dispatch to primary AND backup sequentially. `true` if at least one succeeds. **Doubles rate-limit consumption** — size your `RateLimiter::for()` quota accordingly.

---

## 🧪 Testing with HowlFake

```php
use Skaisser\Howl\Facades\Howl;

$fake = Howl::fake();

Howl::error('Something broke');
Howl::driver('slack')->info('Deploy started');

// Global assertions
$fake->assertSent(fn ($p) => $p->severity === 'error');
$fake->assertNothingSent(); // negation form
expect($fake->sent())->toHaveCount(2); // count via the sent() accessor

// Per-driver assertions (v1.0+)
$fake->assertSentVia('discord', fn ($p) => $p->severity === 'error');
$fake->assertSentVia('slack', fn ($p) => $p->severity === 'info');
$fake->assertSentViaNothing('telegram');
```

No real HTTP calls. No mocks of HTTP clients. Drop-in replacement.

---

## ⚡ Queue Mode + Rate Limiting

```env
HOWL_QUEUE=true
HOWL_QUEUE_CONNECTION=redis
HOWL_QUEUE_NAME=default
HOWL_RATE_LIMITER_KEY=howl-discord   # opt-in Redis rate limiter
```

```php
// AppServiceProvider::boot()
use Illuminate\Cache\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('howl-discord', fn () => Limit::perMinute(28));
```

`SendHowlJob` ships with 3 retries + exponential backoff. Queue-failure events always force sync to avoid recursive loops.

---

## 📖 Documentation

The full docs site at **[howl.skaisser.dev](https://howl.skaisser.dev)** covers everything in depth:

- 🚦 [Installation & Quick Start](https://howl.skaisser.dev/v1.0.0/guide/installation)
- 🤖 Drivers: [Discord](https://howl.skaisser.dev/v1.0.0/drivers/discord) · [Slack](https://howl.skaisser.dev/v1.0.0/drivers/slack) · [Telegram](https://howl.skaisser.dev/v1.0.0/drivers/telegram)
- 🎛️ [Configuration reference](https://howl.skaisser.dev/v1.0.0/configuration/reference)
- 🧪 [HowlFake testing guide](https://howl.skaisser.dev/v1.0.0/testing/howl-fake)
- 📜 [API reference](https://howl.skaisser.dev/v1.0.0/reference/api)
- ⬆️ [Upgrade guide v0.x → v1.0](https://howl.skaisser.dev/v1.0.0/upgrade)
- 📝 [Release notes](https://howl.skaisser.dev/v1.0.0/releases)

**For AI agents:** [llms.txt](https://howl.skaisser.dev/llms.txt) (index) · [llms-full.txt](https://howl.skaisser.dev/llms-full.txt) (inline)

---

## 🤝 Contributing

Issues and pull requests welcome at [github.com/skaisser/howl](https://github.com/skaisser/howl).

Before opening a PR, run the full suite locally:

```bash
composer install
vendor/bin/pest --parallel
vendor/bin/pest --coverage --min=100   # enforces 100% line coverage
vendor/bin/pint                         # code style
```

---

## 📜 License

MIT — see [LICENSE](LICENSE). Copyright © Shirleyson Kaisser.
