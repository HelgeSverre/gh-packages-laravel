![](https://banners.beyondco.de/Laravel%20Request%20Forwarder.png?theme=light&packageManager=composer+require&packageName=moneo%2Flaravel-request-forwarder&pattern=architect&style=style_1&description=Forward+incoming+requests+to+another+addresses&md=1&showWatermark=0&fontSize=100px&images=server)

# Laravel Request Forwarder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/moneo/laravel-request-forwarder.svg?style=flat-square)](https://packagist.org/packages/moneo/laravel-request-forwarder)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/moneo/laravel-request-forwarder/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/moneo/laravel-request-forwarder/actions?query=workflow%3Arun-tests+branch%3Amain)
[![PHPStan](https://img.shields.io/github/actions/workflow/status/moneo/laravel-request-forwarder/phpstan.yml?branch=main&label=phpstan&style=flat-square)](https://github.com/moneo/laravel-request-forwarder/actions?query=workflow%3APHPStan+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/moneo/laravel-request-forwarder/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/moneo/laravel-request-forwarder/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/moneo/laravel-request-forwarder.svg?style=flat-square)](https://packagist.org/packages/moneo/laravel-request-forwarder)

**Forward incoming HTTP requests to multiple destinations -- asynchronously, reliably, and with zero config overhead.**

Some webhook providers only allow a single callback URL. This package sits behind that URL and fans the request out to as many targets as you need -- different servers, Slack, Discord, or any custom destination -- all processed through Laravel's queue system with automatic retries and failure logging.

### Highlights

- **Async by default** -- Requests are dispatched to a queue job so your response time stays fast.
- **Multi-target fan-out** -- Forward a single incoming request to one or many endpoints in parallel.
- **Custom providers** -- Ship your own delivery logic by implementing a single interface. Discord provider included.
- **Events on every delivery** -- `WebhookSent` and `WebhookFailed` events let you build dashboards, alerts, or audit logs.
- **Automatic retries** -- Configurable `tries` and exponential `backoff` per queue job, with failure logging out of the box.

![How it works](https://raw.githubusercontent.com/moneo/laravel-request-forwarder/main/workflow.png)

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
- [Usage](#usage)
  - [Middleware](#middleware)
  - [Facade / Programmatic](#facade--programmatic)
  - [Multiple Webhook Groups](#multiple-webhook-groups)
  - [Per-Target Headers](#per-target-headers)
  - [Per-Target Timeout](#per-target-timeout)
  - [Custom Providers](#custom-providers)
- [Events](#events)
- [Queue & Retry](#queue--retry)
- [Error Handling & Logging](#error-handling--logging)
- [Upgrade Guide (v1.x to v2.0)](#upgrade-guide-v1x-to-v20)
- [Testing](#testing)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Credits](#credits)
- [License](#license)

---

## Requirements

- **PHP** 8.2 or higher
- **Laravel** 11.x or 12.x

---

## Installation

Install the package via Composer:

```bash
composer require moneo/laravel-request-forwarder
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="request-forwarder-config"
```

---

## Quick Start

**1.** Set your target URL in `.env`:

```
REQUEST_FORWARDER_DEFAULT_URL=https://your-target.com/webhook
```

**2.** Add the middleware to any route you want to forward:

```php
Route::middleware('request-forwarder')
    ->post('/webhook', fn () => response()->json(['status' => 'ok']));
```

That's it. Every request hitting `/webhook` is now forwarded to your target asynchronously via the queue.

---

## Configuration Reference

After publishing, the config lives at `config/request-forwarder.php`:

```php
return [
    'default_webhook_group_name' => 'default',

    'webhooks' => [
        'default' => [
            'targets' => [
                [
                    'url'    => env('REQUEST_FORWARDER_DEFAULT_URL', 'https://example.com/webhook'),
                    'method' => 'POST',
                ],
            ],
        ],
    ],

    'timeout'    => 30,

    'queue_name'  => env('REQUEST_FORWARDER_QUEUE', ''),
    'queue_class' => Moneo\RequestForwarder\ProcessRequestForwarder::class,

    'tries'   => 3,
    'backoff' => [5, 30, 60],

    'log_failures' => true,
];
```

**Key-by-key breakdown:**

- **`default_webhook_group_name`** -- Which webhook group to use when the middleware is called without a parameter.
- **`webhooks`** -- A map of named groups. Each group contains a `targets` array. Every target needs at least a `url`. Optional keys per target: `method` (default `POST`), `provider`, `headers`, `timeout`.
- **`timeout`** -- Global HTTP timeout in seconds for outgoing requests. Can be overridden per target.
- **`queue_name`** -- The queue connection/name for async jobs. Leave empty to use Laravel's default queue.
- **`queue_class`** -- The job class used for dispatching. Override this if you need custom job logic.
- **`tries`** -- How many times a failed job is retried before being marked as permanently failed.
- **`backoff`** -- Seconds to wait between retries. Accepts a single integer or an array for progressive backoff.
- **`log_failures`** -- When `true`, failed deliveries are written to your Laravel log.

---

## Usage

### Middleware

Attach the `request-forwarder` middleware to any route. The middleware dispatches a queue job and lets the request continue normally -- your users see no delay.

```php
// Forward using the default webhook group
Route::middleware('request-forwarder')
    ->post('/webhook', fn () => 'OK');

// Forward using a named webhook group
Route::middleware('request-forwarder:payments')
    ->post('/payments/webhook', fn () => 'OK');
```

### Facade / Programmatic

Use the `RequestForwarder` facade when you need more control:

```php
use Moneo\RequestForwarder\Facades\RequestForwarder;

// Dispatch to queue (async)
RequestForwarder::sendAsync($request);
RequestForwarder::sendAsync($request, 'payments');

// Trigger immediately (sync) -- useful in jobs or artisan commands
RequestForwarder::triggerHooks('https://original-url.com/hook', ['key' => 'value']);
RequestForwarder::triggerHooks('https://original-url.com/hook', $data, 'payments');
```

### Multiple Webhook Groups

Define as many groups as you need. Each group is independently configurable:

```php
'webhooks' => [
    'default' => [
        'targets' => [
            ['url' => 'https://primary-backend.com/hook', 'method' => 'POST'],
        ],
    ],
    'payments' => [
        'targets' => [
            ['url' => 'https://accounting.internal/stripe', 'method' => 'POST'],
            [
                'url'      => 'https://discord.com/api/webhooks/...',
                'method'   => 'POST',
                'provider' => \Moneo\RequestForwarder\Providers\Discord::class,
            ],
        ],
    ],
],
```

### Per-Target Headers

Add authentication or custom headers to individual targets:

```php
'targets' => [
    [
        'url'     => 'https://api.partner.com/webhook',
        'method'  => 'POST',
        'headers' => [
            'Authorization'   => 'Bearer your-api-token',
            'X-Webhook-Secret' => 'shared-secret',
        ],
    ],
],
```

### Per-Target Timeout

Override the global timeout for slow endpoints:

```php
'targets' => [
    [
        'url'     => 'https://slow-service.example.com/hook',
        'method'  => 'POST',
        'timeout' => 60,
    ],
],
```

### Custom Providers

The default provider sends JSON over HTTP. Need a different format? Implement `ProviderInterface`:

```php
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\Response;
use Moneo\RequestForwarder\Providers\ProviderInterface;

class SlackProvider implements ProviderInterface
{
    public function __construct(private readonly Factory $client)
    {
    }

    public function send(string $url, array $params, array $webhook): Response
    {
        return $this->client
            ->timeout($webhook['timeout'] ?? 30)
            ->send('POST', $webhook['url'], [
                'json' => [
                    'text' => "Webhook from {$url}\n```" . json_encode($params, JSON_PRETTY_PRINT) . '```',
                ],
            ]);
    }
}
```

Register your provider in the target config:

```php
'targets' => [
    [
        'url'      => 'https://hooks.slack.com/services/REDACTED.../B.../xxx',
        'method'   => 'POST',
        'provider' => App\Webhooks\SlackProvider::class,
    ],
],
```

The package validates that every provider class exists and implements `ProviderInterface` before instantiation. Providers are resolved through Laravel's container, so constructor injection works out of the box.

---

## Events

Every delivery attempt dispatches an event you can hook into:

**`WebhookSent`** -- Dispatched after a successful HTTP response (any status code).

- `string $sourceUrl` -- The original incoming request URL.
- `string $targetUrl` -- The target the request was forwarded to.
- `int $statusCode` -- The HTTP status code returned by the target.

**`WebhookFailed`** -- Dispatched when the delivery throws any exception.

- `string $sourceUrl` -- The original incoming request URL.
- `string $targetUrl` -- The target that failed.
- `\Throwable $exception` -- The exception that was caught.

**Example listener:**

```php
use Moneo\RequestForwarder\Events\WebhookSent;
use Moneo\RequestForwarder\Events\WebhookFailed;

// In a service provider or event subscriber
Event::listen(WebhookSent::class, function (WebhookSent $event) {
    logger()->info("Forwarded to {$event->targetUrl}", [
        'status' => $event->statusCode,
    ]);
});

Event::listen(WebhookFailed::class, function (WebhookFailed $event) {
    logger()->error("Forward to {$event->targetUrl} failed", [
        'error' => $event->exception->getMessage(),
    ]);
});
```

---

## Queue & Retry

The middleware dispatches a `ProcessRequestForwarder` job. Configure its behavior in the config:

```php
'queue_name' => env('REQUEST_FORWARDER_QUEUE', 'webhooks'),
'tries'      => 3,
'backoff'    => [5, 30, 60], // wait 5s, then 30s, then 60s
```

- If `queue_name` is empty, Laravel's default queue is used.
- `tries` and `backoff` are validated at runtime; invalid values fall back to safe defaults (`3` tries, `[5, 30, 60]` backoff).

**Custom job class:** If you need to customize serialization, middleware, or tagging, extend the default job and point the config to your class:

```php
// app/Jobs/CustomForwarder.php
class CustomForwarder extends \Moneo\RequestForwarder\ProcessRequestForwarder
{
    public $timeout = 120;

    public function tags(): array
    {
        return ['webhook-forwarder', "group:{$this->webhookName}"];
    }
}
```

```php
// config/request-forwarder.php
'queue_class' => App\Jobs\CustomForwarder::class,
```

---

## Error Handling & Logging

The package is designed to never break your application flow:

- **Inside `triggerHooks`:** Each target is processed independently. If one target fails, the remaining targets still execute. Failed targets dispatch a `WebhookFailed` event and (when `log_failures` is `true`) write an error to your Laravel log.

- **Queue job failures:** When all retries are exhausted, the job's `failed()` method logs the final error with the source URL and webhook group name.

- **Strict validation:** Invalid URLs, unsupported HTTP methods, non-positive timeouts, non-existent provider classes, and malformed config shapes all throw `InvalidArgumentException` eagerly -- so misconfigurations surface during development, not in production.

---

## Upgrade Guide (v1.x to v2.0)

### Runtime requirements

- PHP `8.2+` (was `8.1+`).
- Laravel `11.x` or `12.x` (Laravel 10 support dropped; it reached EOL in February 2025).

### Config validation is now strict

v2.0 fails fast on invalid configuration instead of silently ignoring it. Check your webhook groups:

- `targets` must be a non-empty array.
- Each target must have a valid `url` (passes `FILTER_VALIDATE_URL`).
- `method` must be one of: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- `timeout` must be a positive number.
- `headers` must be an array of string keys with scalar values.

### Provider validation

- Custom providers must exist as classes and implement `ProviderInterface`.
- Invalid providers now trigger `WebhookFailed` instead of being silently skipped.

### Queue behavior

- Empty `queue_name` no longer forces an empty string -- it falls back to Laravel's default queue.
- `tries` and `backoff` are validated and normalized at runtime.

### Event typing

- `WebhookFailed::$exception` is now `\Throwable` (was `\Exception`).

### Recommended steps

1. Update your dependency: `composer require moneo/laravel-request-forwarder:^2.0`
2. Re-publish the config: `php artisan vendor:publish --tag="request-forwarder-config" --force`
3. Review your webhook groups against the validation rules above.
4. Run your test suite and verify webhook flows in staging.
5. Monitor logs for any `InvalidArgumentException` entries from the package.

---

## Testing

```bash
# Run the test suite
composer test

# Run static analysis
composer analyse

# Fix code style
composer format
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Emir Karşıyakalı](https://github.com/emir)
- [Emre Dipi](https://github.com/emredipi)
- [Mucahit Cucen](https://github.com/mcucen)
- [Semih Keskin](https://github.com/semihkeskindev)
- [Taha Caliskan](https://github.com/Tahaknd)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
