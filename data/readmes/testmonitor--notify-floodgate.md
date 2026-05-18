# Notify Floodgate

[![Latest Stable Version](https://poser.pugx.org/testmonitor/notify-floodgate/v/stable)](https://packagist.org/packages/testmonitor/notify-floodgate)
[![CircleCI](https://img.shields.io/circleci/project/github/testmonitor/notify-floodgate.svg)](https://circleci.com/gh/testmonitor/notify-floodgate)
[![StyleCI](https://styleci.io/repos/1206988940/shield)](https://styleci.io/repos/1206988940)
[![License](https://poser.pugx.org/testmonitor/notify-floodgate/license)](https://packagist.org/packages/testmonitor/notify-floodgate)

A Laravel package that prevents notification floods by buffering queued notifications within a time window. When a single notification arrives, it is sent as-is. When multiple notifications of the same type arrive within the window, they are grouped into a single summary notification.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Preparing Your Notification](#preparing-your-notification)
  - [Sending a Summary](#sending-a-summary)
  - [Customizing the Buffer Window](#customizing-the-buffer-window)
  - [Customizing the Threshold](#customizing-the-threshold)
  - [Bypassing the Floodgate](#bypassing-the-floodgate)
  - [Customizing the Summary Notification](#customizing-the-summary-notification)
- [Tests](#tests)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Installation

This package can be installed through Composer:

```bash
composer require testmonitor/notify-floodgate
```

The package will register itself automatically via Laravel's package discovery.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=floodgate-config
```

## Configuration

The configuration file is located at `config/floodgate.php`:

```php
return [

    /*
     * The number of seconds to wait before flushing a notification buffer.
     * During this window, additional notifications of the same type are
     * grouped and sent as a single summary.
     */
    'delay' => 10,

    /*
     * The notification class used to send a summary when multiple notifications
     * are buffered. Swap this for your own class to fully customize the output.
     */
    'summary' => \TestMonitor\Floodgate\Notifications\SummaryNotification::class,

    /*
     * Cache store and key prefix used to hold buffered notifications.
     * The store must support atomic locks (e.g. Redis, Memcached, database).
     */
    'cache' => [
        'store' => null,
        'prefix' => 'floodgate',
    ],

];
```

## Usage

### Preparing Your Notification

Add the `Gateable` trait and a `middleware` method to any queued notification you want to throttle:

```php
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use TestMonitor\Floodgate\Concerns\Gateable;
use TestMonitor\Floodgate\Middleware\ThrottlesNotifications;

class IssueAssigned extends Notification implements ShouldQueue
{
    use Queueable, Gateable;

    public function middleware(): array
    {
        return [new ThrottlesNotifications];
    }

    // ...
}
```

That's all the setup required. The floodgate will now buffer notifications within the configured delay window and send a summary when the threshold is exceeded.

### Sending a Summary

Implement `toSummary` on your notification to define what the summary looks like. It receives all buffered notification instances and should return an array shaped like your `toArray` method:

```php
public function toSummary(array $items): array
{
    return [
        'message' => ':count issues have been assigned to you',
        'url' => route('issues.index'),
        'icon' => 'exclamation-circle',
        'properties' => ['count' => count($items)],
    ];
}
```

When a summary is sent, the `toArray` method on each individual notification is passed to the summary mail view as `$items`, allowing you to include per-item detail alongside the grouped summary.

### Customizing the Buffer Window

Pass a custom delay in seconds to `ThrottlesNotifications` to override the configured default:

```php
public function middleware(): array
{
    return [new ThrottlesNotifications(delay: 60)];
}
```

### Customizing the Threshold

By default, a summary is sent whenever more than one notification is buffered. Raise the threshold to allow a number of originals through before switching to a summary:

```php
public function middleware(): array
{
    return [new ThrottlesNotifications(threshold: 3)];
}
```

With a threshold of `3`, up to three notifications are delivered individually. A fourth within the same window triggers a summary instead.

### Bypassing the Floodgate

Send a notification immediately, skipping the buffer entirely, by calling `withoutThrottling()`:

```php
$user->notify((new IssueAssigned($issue))->withoutThrottling());
```

### Customizing the Summary Notification

The default `SummaryNotification` renders a mail view with `$summary` and `$items` variables. Publish the view to customise it:

```bash
php artisan vendor:publish --tag=floodgate-views
```

For full control, replace the summary class in the configuration:

```php
'summary' => App\Notifications\IssueSummaryNotification::class,
```

Your custom class receives `$summary`, `$notifications`, and `$channels` in its constructor. Extend the default to override only what you need:

```php
use TestMonitor\Floodgate\Notifications\SummaryNotification;

class IssueSummaryNotification extends SummaryNotification
{
    protected function subject(): string
    {
        return 'Your issue activity summary';
    }
}
```

## Tests

The package contains a full test suite. Run it using:

```bash
composer test
```

## Changelog

Refer to [CHANGELOG](CHANGELOG.md) for more information.

## Contributing

Refer to [CONTRIBUTING](CONTRIBUTING.md) for contributing details.

## Credits

* **Thijs Kok** - *Lead developer* - [ThijsKok](https://github.com/thijskok)
* **Stephan Grootveld** - *Developer* - [Stefanius](https://github.com/stefanius)
* **Frank Keulen** - *Developer* - [FrankIsGek](https://github.com/frankisgek)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
