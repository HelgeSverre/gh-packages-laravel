# Laravel Composer Security Watch (CSW)

[![Tests](https://github.com/paulohps/laravel-csw/actions/workflows/run-tests.yml/badge.svg)](https://github.com/paulohps/laravel-csw/actions/workflows/run-tests.yml)
[![PHP Version](https://img.shields.io/badge/php-%5E8.3-blue)](https://www.php.net)
[![Laravel Version](https://img.shields.io/badge/laravel-11%7C12%7C13-red)](https://laravel.com)
[![License](https://img.shields.io/github/license/paulohps/laravel-csw)](LICENSE.md)

Automate `composer audit` in your Laravel application and receive vulnerability alerts via **Log, Slack, Discord, Email, or Database** — on a schedule or on demand.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | `^8.3` |
| Laravel | `^11.0 \| ^12.0 \| ^13.0` |
| Composer | `^2.4` (for `audit` command support) |

---

## Installation

Install the package via Composer:

```bash
composer require paulohps/laravel-csw
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="composer-security-watch-config"
```

---

## Configuration

The published config file is located at `config/composer-security-watch.php`.

```php
return [
    'enabled' => env('CSW_ENABLED', true),

    'schedule' => [
        'frequency' => env('CSW_SCHEDULE_FREQUENCY', '0 9 * * *'),
    ],

    'notify' => [

        // Job responsible for dispatching notifications.
        // Override 'class' for custom dispatch logic; set 'queue' to target a specific queue.
        'job' => [
            'class' => \LaravelCsw\Jobs\SendVulnerabilityNotificationsJob::class,
            'queue' => env('CSW_JOB_QUEUE', 'default'),
        ],

        'channels' => [
            'log' => [
                'enabled' => env('CSW_NOTIFY_LOG', true),
                'class'   => \LaravelCsw\Channels\LogChannel::class,
            ],
            'slack' => [
                'enabled'     => env('CSW_NOTIFY_SLACK', false),
                'class'       => \LaravelCsw\Channels\SlackChannel::class,
                'webhook_url' => env('CSW_SLACK_WEBHOOK_URL'),
            ],
            'discord' => [
                'enabled'     => env('CSW_NOTIFY_DISCORD', false),
                'class'       => \LaravelCsw\Channels\DiscordChannel::class,
                'webhook_url' => env('CSW_DISCORD_WEBHOOK_URL'),
            ],
            'email' => [
                'enabled'  => env('CSW_NOTIFY_EMAIL', false),
                'class'    => \LaravelCsw\Channels\EmailChannel::class,
                'to'       => env('CSW_EMAIL_TO'),
                'mailable' => \LaravelCsw\Mail\VulnerabilityReport::class,
            ],
            'database' => [
                'enabled' => env('CSW_NOTIFY_DATABASE', false),
                'class'   => \LaravelCsw\Channels\DatabaseChannel::class,
            ],
        ],
    ],
];
```

### Available environment variables

| Variable | Description |
|---|---|
| `CSW_ENABLED` | Enable/disable the package (`true`) |
| `CSW_SCHEDULE_FREQUENCY` | Cron expression for scheduled audit (`0 9 * * *`) |
| `CSW_NOTIFY_LOG` | Enable log channel (`true`) |
| `CSW_NOTIFY_SLACK` | Enable Slack channel (`false`) |
| `CSW_SLACK_WEBHOOK_URL` | Slack incoming webhook URL |
| `CSW_NOTIFY_DISCORD` | Enable Discord channel (`false`) |
| `CSW_DISCORD_WEBHOOK_URL` | Discord webhook URL |
| `CSW_NOTIFY_EMAIL` | Enable email channel (`false`) |
| `CSW_EMAIL_TO` | Recipient email address(es) |
| `CSW_NOTIFY_DATABASE` | Enable database channel (`false`) |
| `CSW_JOB_QUEUE` | Queue name for the notification job (`default`) |

---

## Usage

### Artisan Command

**Basic audit:**

```bash
php artisan csw:audit
```

Returns exit code `0` when clean, `1` when vulnerabilities are found — useful in CI pipelines.

**Audit + send notifications:**

```bash
php artisan csw:audit --notify
```

Dispatches `SendVulnerabilityNotificationsJob` which sends alerts to all enabled channels.

**Audit + update vulnerable packages:**

```bash
php artisan csw:audit --update
```

Runs `composer update vendor/package` for each affected package.

**Audit + update including all dependents:**

```bash
php artisan csw:audit --update --with-all
```

Passes `--with-all-dependencies` to composer update. Requires `--update`.

### Scheduled Audit

When `enabled` is `true`, CSW automatically registers a scheduled command at the configured cron frequency. Make sure your Laravel scheduler is running:

```bash
# Add to crontab
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

The scheduled command runs: `php artisan csw:audit --notify`

---

## Notification Channels

### Log (default: enabled)

Writes a `warning` log entry for each vulnerability. Uses your application's default log channel.

### Slack

Set up a [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) and add the URL to your config or `.env`:

```dotenv
CSW_NOTIFY_SLACK=true
CSW_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/REDACTED
```

### Discord

Create a webhook via **Server Settings > Integrations > Webhooks**:

```dotenv
CSW_NOTIFY_DISCORD=true
CSW_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
```

### Email

Supports single address or an array of addresses:

```dotenv
CSW_NOTIFY_EMAIL=true
CSW_EMAIL_TO=security@example.com
```

For multiple recipients, set in `config/composer-security-watch.php`:

```php
'email' => [
    'enabled' => true,
    'to'      => ['admin@example.com', 'security@example.com'],
],
```

To customise the email subject, headers, or template, override the `mailable` key with your own `Mailable` class. Its constructor must accept `array $vulnerabilities` as the first argument:

```php
'email' => [
    'enabled'  => true,
    'to'       => env('CSW_EMAIL_TO'),
    'mailable' => \App\Mail\MyVulnerabilityReport::class,
],
```

### Database

The database channel requires a migration. Install it with:

```bash
php artisan csw:install-database-channel
php artisan migrate
```

Then enable it:

```dotenv
CSW_NOTIFY_DATABASE=true
```

Vulnerabilities are stored in the `composer_security_vulnerabilities` table, accessible via the `VulnerabilityRecord` model:

```php
use LaravelCsw\Models\VulnerabilityRecord;

VulnerabilityRecord::latest('found_at')->get();
```

---

## Custom Notification Channels

Implement `LaravelCsw\Contracts\NotificationChannel` to create your own channel:

```php
use LaravelCsw\Contracts\NotificationChannel;
use LaravelCsw\Data\Vulnerability;

class PagerDutyChannel implements NotificationChannel
{
    public function send(array $vulnerabilities): void
    {
        foreach ($vulnerabilities as $vulnerability) {
            // Send to PagerDuty...
        }
    }
}
```

Register it in the `notify.channels` config array — the `class` key is what the notification job uses to resolve the channel:

```php
'notify' => [
    'channels' => [
        // ... existing channels ...
        'pager_duty' => [
            'enabled' => true,
            'class'   => \App\Channels\PagerDutyChannel::class,
        ],
    ],
],
```

You can also override a built-in channel by binding your own implementation in a service provider:

```php
// In AppServiceProvider::register()
$this->app->bind(
    \LaravelCsw\Channels\SlackChannel::class,
    \App\Channels\CustomSlackChannel::class,
);
```

---

## The Vulnerability Object

Notification channels receive an array of `LaravelCsw\Data\Vulnerability` objects:

```php
readonly class Vulnerability
{
    public string $packageName;
    public string $version;
    public string $advisoryId;
    public string $title;
    public ?string $link;
    public ?string $cve;
}
```

---

## Docker (local development)

A Docker environment is provided for running PHP and Composer without a local installation:

```bash
# Build the image
docker compose build

# Install dependencies
docker compose run --rm app composer install

# Run tests
docker compose run --rm app vendor/bin/pest

# Run audit
docker compose run --rm app php artisan csw:audit
```

---

## Testing

```bash
# Run all tests
composer test

# Run tests with coverage report (requires 100%)
composer test-coverage

# Apply code style
composer format
```

---

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
