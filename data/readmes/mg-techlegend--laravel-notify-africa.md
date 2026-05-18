# Laravel Notify Africa

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mg-techlegend/laravel-notify-africa.svg?style=flat-square)](https://packagist.org/packages/mg-techlegend/laravel-notify-africa)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mg-techlegend/laravel-notify-africa/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mg-techlegend/laravel-notify-africa/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/mg-techlegend/laravel-notify-africa/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/mg-techlegend/laravel-notify-africa/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mg-techlegend/laravel-notify-africa.svg?style=flat-square)](https://packagist.org/packages/mg-techlegend/laravel-notify-africa)

Send SMS through the [Notify Africa](https://notify.africa/) HTTP API from Laravel apps. This package provides a small typed client, a fluent message builder, structured response objects, Laravel Notification channel support, and a facade—using Laravel’s HTTP client (no direct Guzzle usage in your code).

## Installation

```bash
composer require mg-techlegend/laravel-notify-africa
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="laravel-notify-africa-config"
```

Laravel discovers the service provider and facade automatically from `composer.json` (`extra.laravel.providers` and `extra.laravel.aliases`). No manual registration is required in typical apps.

Set the following in your `.env` (values are read **only** through `config/notify-africa.php`):

| Variable | Description |
|----------|-------------|
| `NOTIFY_AFRICA_API_TOKEN` | Bearer API token from Notify Africa |
| `NOTIFY_AFRICA_SENDER_ID` | Default sender ID (can be overridden per message) |
| `NOTIFY_AFRICA_BASE_URL` | Optional; default `https://api.notify.africa` |
| `NOTIFY_AFRICA_TIMEOUT` | Request timeout in seconds (default `10`) |
| `NOTIFY_AFRICA_CONNECT_TIMEOUT` | Connect timeout in seconds (default `5`) |
| `NOTIFY_AFRICA_HTTP_RETRY_ATTEMPTS` | Total HTTP attempts per call (default `1` = no retries); see [HTTP retries](#http-retries) |
| `NOTIFY_AFRICA_HTTP_RETRY_DELAY_MS` | Delay in milliseconds between retries (default `250`) |
| `NOTIFY_AFRICA_DEFAULT_COUNTRY_CODE` | Optional; see [Phone numbers](#phone-numbers) |

## Configuration

Published config: `config/notify-africa.php`.

- **`api_token`** — required for real API calls (missing token throws when the client is built).
- **`sender_id`** — default sender; omit on the message object to use this value.
- **`http_retry_attempts`** / **`http_retry_delay_ms`** — optional resilient requests; see below.
- **`default_country_calling_code`** — digits only, no `+` (e.g. `255`). Used only for “local-looking” numbers; see below.

## HTTP retries

When `http_retry_attempts` is greater than `1`, the client retries **only** on connection failures and on HTTP **408**, **425**, **429**, and **5xx** responses. **4xx** errors such as **401** and **422** are not retried.

Retries use Laravel’s HTTP client (`throw: false` on the pending request) so the last response is always parsed and mapped to the same package exceptions. Increasing retries can mean duplicate SMS if a request succeeds at the gateway but the response never reaches your server—keep attempts conservative unless you accept that trade-off.

## Direct usage

Inject the entry service or use the facade:

```php
use TechLegend\LaravelNotifyAfrica\Facades\LaravelNotifyAfrica;
use TechLegend\LaravelNotifyAfrica\LaravelNotifyAfrica as NotifyAfrica;
use TechLegend\LaravelNotifyAfrica\NotifyAfricaMessage;

// Facade
$response = LaravelNotifyAfrica::sendSms(
    LaravelNotifyAfrica::message()
        ->to('255689737459')
        ->content('Hello from Laravel!')
        // ->senderId('CUSTOM') // optional override
);

// Container (class or string alias registered by the package)
$notify = app(NotifyAfrica::class);
// $notify = app('notify-africa');

$response = $notify->sendSms(
    NotifyAfricaMessage::make()
        ->to('255689737459')
        ->content('Hello!')
);
```

`$response` is a `SendSmsResponse` with `messageId`, `deliveryStatus` (e.g. `PROCESSING`), and envelope metadata.

### Bulk SMS

Uses the documented batch endpoint `POST /api/v1/api/messages/batch` (not a client-side loop):

```php
use TechLegend\LaravelNotifyAfrica\Facades\LaravelNotifyAfrica;

$response = LaravelNotifyAfrica::sendBulkSms(
    ['255763765548', '255689737839'],
    'Same text for everyone',
    // optional third argument: sender ID override; otherwise config default is used
);

// $response->messageCount, creditsDeducted, remainingBalance
```

### Delivery status

```php
$status = LaravelNotifyAfrica::getMessageStatus('156022');
// $status->status, $status->deliveredAt, etc.
```

## Exceptions

| Exception | When |
|-----------|------|
| `NotifyAfricaAuthenticationException` | HTTP 401 / 403 |
| `NotifyAfricaValidationException` | HTTP 400 / 422, or JSON envelope `status` ≠ 200 with HTTP 200 |
| `NotifyAfricaRequestException` | Other failures, non-JSON responses, 5xx, connection issues |

All extend `NotifyAfricaException` and expose `?array $payload` with the decoded JSON when available.

Local validation (empty phone, empty message, missing sender, invalid notification setup) throws `InvalidArgumentException` before any HTTP call. Many messages are prefixed with `[Notify Africa]` so logs are easy to filter.

## Laravel notifications

Use the channel class in `via()` and implement `toNotifyAfrica()` on your notification. The notifiable must define `routeNotificationForNotifyAfrica()` returning the recipient number (string).

```php
use Illuminate\Notifications\Notification;
use TechLegend\LaravelNotifyAfrica\Channels\NotifyAfricaChannel;
use TechLegend\LaravelNotifyAfrica\NotifyAfricaMessage;

class OrderShippedSms extends Notification
{
    public function via(object $notifiable): array
    {
        return [NotifyAfricaChannel::class];
    }

    public function toNotifyAfrica(object $notifiable): NotifyAfricaMessage
    {
        return NotifyAfricaMessage::make()
            ->content('Your order has shipped.');
        // Phone comes from routeNotificationForNotifyAfrica() when `to()` is omitted
    }
}
```

On your notifiable (e.g. `User` model):

```php
public function routeNotificationForNotifyAfrica(): string
{
    return $this->phone; // e.g. 2557… (see below)
}
```

If `toNotifyAfrica()` already sets `->to(...)`, that number is used; otherwise the channel applies the routed number.

## Phone numbers

The API expects international format **without** a leading `+` (e.g. `255XXXXXXXXX`). The package strips spaces and non-digits and removes a leading `+`.

If you set `default_country_calling_code` (e.g. `255`) and the number looks “local” (9–10 digits after normalization), that prefix is prepended. This is a simple heuristic—not a substitute for [libphonenumber](https://github.com/giggsey/libphonenumber-for-php) or full validation. Prefer passing fully qualified international numbers in production.

## Testing your app

In tests, use Laravel’s HTTP client fakes so no real SMS is sent:

```php
use Illuminate\Support\Facades\Http;

Http::fake([
    'https://api.notify.africa/api/v1/api/messages/send' => Http::response([
        'status' => 200,
        'message' => 'SMS sent successfully',
        'data' => ['messageId' => '1', 'status' => 'PROCESSING'],
    ], 200),
]);
```

If you change `notify-africa` config inside a test, clear resolved singletons or boot a fresh application before resolving `NotifyAfricaClient`, since it is registered as a singleton.

## Testing this package

```bash
composer test
composer analyse   # PHPStan
composer format    # Pint
```

## Assumptions (v1)

- Error semantics follow common HTTP usage (401/403 auth, 400/422 validation). If the live API differs, adjust mapping in `NotifyAfricaClient::mapFailure()` and keep tests in sync.
- Bulk sending uses the official batch API; behavior matches [Notify Africa SMS API](https://docs.notify.africa/docs/api/sms).
- No database tables, queues, webhooks, or logging persistence in v1.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Thomson Maguru](https://github.com/mg-techlegend)
- [All Contributors](../../contributors)

### Notify Africa and iPF Softwares

The **SMS API** behind this package is **[Notify Africa](https://notify.africa/)**, built and operated by **[iPF Softwares](https://github.com/iPFSoftwares)**. Documentation: [SMS API](https://docs.notify.africa/docs/api/sms). Official PHP client (separate from this Laravel package): [notify-africa-php](https://github.com/iPFSoftwares/notify-africa-php).

## License

The MIT License. See [LICENSE.md](LICENSE.md).
