# Laravel Queue Watchdog

A Laravel package to monitor queue failures and send notifications based on thresholds and time windows.

## Features
- **Digest Mode (Time-Bucket)**: Instead of immediate alerts, it collects all failures within a time window and sends a summary report.
- **Threshold Monitoring**: Alert only when X jobs fail within Y minutes.
- **Queue Filtering**: Precisely control which queues to monitor (supports wildcards and exclusions).
- **Aggregation Strategies**: 
    - `all`: Count all failures.
    - `unique_jobs`: Count failures per job class.
    - `unique_exceptions`: Count failures per exception type.
- **Cooldown**: Prevent notification spam with a configurable cooldown period after a report is sent.
- **Multi-channel Notifications**: Support for Mail, Slack, and any other Laravel notification channel.

## Installation

```bash
composer require kreatif/laravel-queue-watchdog
```

*Note: If you plan to use the Slack notification channel, you must also install the official Laravel Slack notification package:*

```bash
composer require laravel/slack-notification-channel
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag="laravel-queue-watchdog-config"
```
or 

```bash
php artisan vendor:publish --tag="queue-watchdog-config"
```

The configuration allows you to define thresholds, aggregation strategies, and notification channels.

### How it works: Digest Mode

The watchdog uses a **Time-Bucket** model to ensure no failure information is lost:
1. The first failure on a monitored queue starts a "Collection Window" (defined by `window_minutes`).
2. All subsequent failures during this window are collected in a cache-based bucket.
3. At the end of the window, an analysis job runs.
4. If the total count of failures is >= `failure_limit`, a summary notification is sent via your configured channels.
5. A `cooldown_minutes` period then starts, during which no new collection windows will begin.

#### Configuration Tips:
- **Real-time Alerts**: Set `window_minutes` to `0` or `false` and `failure_limit` to `1` to receive a notification immediately for every failure.
- **Strict Digest**: Set `window_minutes` to `10` and `failure_limit` to `1` to get a summary of all failures every 10 minutes.
- **Threshold Digest**: Set `window_minutes` to `5` and `failure_limit` to `10` to only be notified if at least 10 jobs fail within a 5-minute burst.

### Queue Filtering

You can precisely control which queues are monitored using the `queues` array in the config file. It supports wildcards and exclusions:

- `*`: Monitor all queues.
- `default`: Monitor only the "default" queue.
- `!ignored`: Exclude the "ignored" queue.
- `sync*`: Monitor any queue starting with "sync" (e.g., `sync-users`, `sync-orders`).

Example:
```php
'queues' => ['*', '!update', 'report', 'sync*'],
```

## Usage

The package automatically listens for the `Illuminate\Queue\Events\JobFailed` event and tracks failures in your cache. No additional setup is required beyond configuration.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
