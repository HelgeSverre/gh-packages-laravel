# crumbls/fanout

[![tests](https://github.com/Crumbls/fanout/actions/workflows/tests.yml/badge.svg)](https://github.com/Crumbls/fanout/actions/workflows/tests.yml)
[![Latest Version](https://img.shields.io/github/v/release/Crumbls/fanout?include_prereleases)](https://github.com/Crumbls/fanout/releases)
[![License](https://img.shields.io/github/license/Crumbls/fanout)](LICENSE)

Catch incoming webhooks and fan them out to multiple downstream destinations — staging, dev, secondary services — with retries, signing, transformation, filtering, rate limiting, and replay.

Solves the "production webhooks never reach staging/dev" problem and the broader "I need to mirror webhooks across environments without writing a custom forwarder per source" problem.

```
                  +-------------------+
inbound webhook ->|  ReceiverController  | -- verify signature, persist FanoutEvent
                  +-------------------+
                            |
                            v one job per enabled endpoint
                  +-------------------+
                  | DeliverEventJob   |  queued, retryable, rate-limited
                  +-------------------+
                            |
            +--- filter ---+--- transform ---+--- sign ---+
            |                                              |
            v                                              v
   FanoutDelivery row updated              POST to destination URL
```

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- A queue driver (Redis, SQS, database — anything Laravel supports)

## Install

```bash
composer require crumbls/fanout
php artisan fanout:install
php artisan migrate
```

`fanout:install` publishes `config/fanout.php` and the two migrations into your app.

## Two ways to use it

### Pattern A — Tee from your existing handler

Your remote service keeps pointing at your existing prod webhook URL. Your handler runs as it always has, then fires off the mirror in one line:

```php
// in your existing webhook controller / job
use Crumbls\Fanout\Facades\Fanout;

public function handle(Request $request): Response
{
    $payload = $request->all();

    // ...your existing production logic...

    Fanout::dispatch('stripe-prod', $payload, $request->headers->all());

    return response()->noContent();
}
```

Two new lines, your prod handler stays exactly as it is. Use this when you already have working webhook handlers and just want them mirrored.

### Pattern B — Make fanout the receiver

Point the remote service at `https://prod.example.com/fanout/in/{profile}`. Configure your prod handler URL as one of the endpoints alongside staging/dev:

```php
'endpoints' => [
    'self'    => ['url' => 'https://prod.example.com/internal/handler', 'enabled' => true],
    'staging' => ['url' => env('STAGING_WEBHOOK_URL'),                   'enabled' => true],
    'dev'     => ['url' => env('DEV_WEBHOOK_URL'),                        'enabled' => env('FANOUT_DEV_ENABLED', false)],
],
```

Zero touches to existing app code, full audit trail of every hop. Trade-off: your prod handler now runs through the queue, adding a few hundred ms.

## Concepts

- **Profile** — one inbound webhook source. Identified by URL segment: `POST /{prefix}/{profile}`.
- **Endpoint** — one outbound destination configured under a profile. Each endpoint has its own URL, headers, signing, retries, rate limit, transform, and filter.
- **Event** — one inbound HTTP request that matched a profile (`fanout_events` row).
- **Delivery** — one attempt to push an event to one endpoint (`fanout_deliveries` row).
- **Persist mode** — per-profile choice between `full`, `metadata`, and `none`.

## Configuration

```php
// config/fanout.php
return [
    'route' => [
        'enabled'    => true,
        'prefix'     => env('FANOUT_ROUTE_PREFIX', 'fanout/in'),
        'middleware' => ['api'],
    ],

    'queue' => [
        'connection' => env('FANOUT_QUEUE_CONNECTION'),
        'queue'      => env('FANOUT_QUEUE', 'fanout'),
    ],

    'models' => [
        'event'    => Crumbls\Fanout\Models\FanoutEvent::class,
        'delivery' => Crumbls\Fanout\Models\FanoutDelivery::class,
    ],

    'profiles' => [

        'stripe-prod' => [
            'persist'                       => 'full',
            'validator'                     => Crumbls\Fanout\Validators\StripeSignatureValidator::class,
            'secret'                        => env('STRIPE_WEBHOOK_SECRET'),
            'signature_header'              => 'Stripe-Signature',
            'continue_on_endpoint_failure'  => true,

            'endpoints' => [
                'staging' => [
                    'url'              => env('STAGING_WEBHOOK_URL'),
                    'enabled'          => true,
                    'environment'      => 'staging',
                    'timeout'          => 10,
                    'headers'          => [
                        'X-Fanout-Source' => 'production',
                        'X-Fanout-Event'  => '{event.id}',
                    ],
                    'signer'           => Crumbls\Fanout\Signers\HmacSha256Signer::class,
                    'secret'           => env('STAGING_WEBHOOK_SECRET'),
                    'signature_header' => 'X-Fanout-Signature',
                    'retry'            => ['attempts' => 5, 'backoff' => 'exponential', 'base_seconds' => 5],
                    'rate_limit'       => ['per_minute' => 60],
                ],

                'dev' => [
                    'url'         => env('DEV_WEBHOOK_URL'),
                    'enabled'     => env('FANOUT_DEV_ENABLED', false),
                    'environment' => 'dev',
                ],
            ],
        ],

    ],
];
```

The remote service then sends webhooks to `https://your-app.test/fanout/in/stripe-prod`.

## Persist modes

Per-profile setting that controls how much of an inbound event is stored.

| Mode | Event row | Payload column | Delivery rows | Replayable | Use when |
|---|---|---|---|---|---|
| `full` (default) | yes | encrypted, full body | yes | yes | You want full audit + replay |
| `metadata` | yes | null | yes | no | You need a timeline / response codes but the body is too sensitive to keep |
| `none` | no | n/a | no | no | Pure forwarder — no DB writes |

In `none` mode the receiver dispatches ephemeral delivery jobs that carry the payload in the job constructor; failures land in Laravel's `failed_jobs` table.

## Encryption at rest

`payload`, `headers`, `request_payload`, `request_headers`, and `last_response_body` are all cast as Laravel `encrypted` / `encrypted:array`. Encryption key is your app `APP_KEY`.

If you need a different strategy — envelope encryption, per-tenant keys, KMS — extend the model and override the casts:

```php
namespace App\Models;

use Crumbls\Fanout\Models\FanoutEvent as BaseEvent;

class FanoutEvent extends BaseEvent
{
    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'payload' => MyKmsEncryptedArrayCast::class,
            'headers' => MyKmsEncryptedArrayCast::class,
        ]);
    }
}
```

Then point the package at it:

```php
// config/fanout.php
'models' => [
    'event'    => App\Models\FanoutEvent::class,
    'delivery' => Crumbls\Fanout\Models\FanoutDelivery::class,
],
```

## Validators (inbound)

Optional. If unconfigured, the receiver accepts any caller — only do that for trusted internal sources.

Built-in:
- `HmacSha256SignatureValidator` — generic. Configurable `signature_header` and optional `signature_prefix` (e.g. `sha256=`).
- `StripeSignatureValidator` — Stripe `t=<unix>,v1=<hash>` scheme with timestamp tolerance.
- `GithubSignatureValidator` — `X-Hub-Signature-256: sha256=<hash>`.
- `SpatieSignatureValidator` — compatible with `spatie/laravel-webhook-client`'s default `Signature` header.

Bring your own by implementing `Crumbls\Fanout\Contracts\SignatureValidator`:

```php
namespace App\Webhooks;

use Crumbls\Fanout\Contracts\SignatureValidator;

class ShopifyWebhookValidator implements SignatureValidator
{
    public function verify(string $rawBody, array $headers, array $config): bool
    {
        $secret = (string) ($config['secret'] ?? '');
        $provided = $headers['x-shopify-hmac-sha256'][0] ?? null;
        if ($secret === '' || $provided === null) {
            return false;
        }

        $expected = base64_encode(hash_hmac('sha256', $rawBody, $secret, true));

        return hash_equals($expected, $provided);
    }
}
```

Reference it from config:

```php
'validator' => App\Webhooks\ShopifyWebhookValidator::class,
'secret'    => env('SHOPIFY_WEBHOOK_SECRET'),
```

## Signers (outbound)

Per endpoint. Built-in:
- `HmacSha256Signer` — re-signs with the endpoint's own `secret`.
- `PassthroughSigner` — forwards the original signature header (only useful when the destination shares the source secret AND you don't transform the payload).

Implement `Crumbls\Fanout\Contracts\SignatureSigner` for custom schemes (e.g. JWT, Ed25519, or a vendor-specific scheme).

## Filters & transformers

Per endpoint, accepting class strings (closures can't live in cached config — register them at runtime via the manager if you need that).

```php
namespace App\Webhooks;

use Crumbls\Fanout\Contracts\PayloadFilter;
use Crumbls\Fanout\Models\FanoutEvent;
use Crumbls\Fanout\Support\EndpointConfig;

class DropTestEvents implements PayloadFilter
{
    public function shouldDeliver(array $payload, EndpointConfig $endpoint, ?FanoutEvent $event): bool
    {
        // For Stripe-style sources: livemode=false means it's a test event
        return ! ($payload['livemode'] ?? true);
    }
}
```

```php
namespace App\Webhooks;

use Crumbls\Fanout\Contracts\PayloadTransformer;
use Crumbls\Fanout\Models\FanoutEvent;
use Crumbls\Fanout\Support\EndpointConfig;

class StripPii implements PayloadTransformer
{
    public function transform(array $payload, EndpointConfig $endpoint, ?FanoutEvent $event): array
    {
        unset(
            $payload['data']['object']['email'],
            $payload['data']['object']['phone'],
            $payload['data']['object']['shipping']['address'],
        );

        return $payload;
    }
}
```

Then in config:

```php
'filter'    => App\Webhooks\DropTestEvents::class,
'transform' => App\Webhooks\StripPii::class,
```

## Header templating

Endpoint headers support these tokens:

- `{event.id}`
- `{event.type}`
- `{event.profile}`
- `{event.received_at}`

```php
'headers' => [
    'X-Fanout-Source' => 'production',
    'X-Fanout-Event'  => '{event.id}',
    'X-Event-Type'    => '{event.type}',
],
```

## Retries

Per endpoint:

```php
'retry' => [
    'attempts'     => 5,
    'backoff'      => 'exponential', // 'fixed' | 'linear' | 'exponential'
    'base_seconds' => 5,
],
```

Each attempt is its own queue job. Failed deliveries stay in `fanout_deliveries` with `status = failed` so they're easy to find and replay.

| Backoff | Delay between attempts (base = 5s) |
|---|---|
| `fixed` | 5, 5, 5, 5 |
| `linear` | 5, 10, 15, 20 |
| `exponential` | 5, 10, 20, 40 |

## Rate limiting

Per endpoint:

```php
'rate_limit' => ['per_minute' => 60],
```

When the limit is hit, the delivery is rescheduled with the resume time provided by Laravel's RateLimiter — without consuming a retry attempt.

## Replay

```bash
# Replay one event to all of its endpoints
php artisan fanout:replay 0193e4f7-...

# Replay just one endpoint
php artisan fanout:replay 0193e4f7-... --endpoint=staging

# Bulk replay every failed delivery (optionally scoped)
php artisan fanout:replay-failed --profile=stripe-prod --endpoint=dev
```

Programmatic equivalents:

```php
use Crumbls\Fanout\Facades\Fanout;

Fanout::replay($event);
Fanout::replay($eventId, endpoint: 'staging');
Fanout::replayFailed(profile: 'stripe-prod');
```

## Programmatic dispatch

Inject events into the pipeline as if a webhook had arrived (no signature check, since the call is internal):

```php
Fanout::dispatch('stripe-prod', $payload, $headers);
```

## Pruning

```bash
php artisan fanout:purge          # removes rows past their purgeable_at
php artisan fanout:purge --dry-run
```

Schedule it in `routes/console.php`:

```php
Schedule::command('fanout:purge')->daily();
```

Retention windows (`pruning.keep_events_days`, `pruning.keep_failed_events_days`) are baked onto each row's `purgeable_at` at write time, so pruning is a single indexed range delete.

## Worker

Run a dedicated worker on the fanout queue:

```bash
php artisan queue:work --queue=fanout
```

Horizon is supported out of the box.

## Recipes

### "I want staging to receive everything, but only flag dev when I'm actively debugging"

```php
'endpoints' => [
    'staging' => ['url' => env('STAGING_WEBHOOK_URL'), 'enabled' => true],
    'dev'     => ['url' => env('DEV_WEBHOOK_URL'),     'enabled' => env('FANOUT_DEV_ENABLED', false)],
],
```

Flip `FANOUT_DEV_ENABLED=true` only when you're working on something locally; flip it off when you're done.

### "I want my dev tunnel to receive only the events I'm actively debugging"

Combine an environment variable with a per-endpoint filter:

```php
class OnlyTheseEventTypes implements Crumbls\Fanout\Contracts\PayloadFilter
{
    public function __construct(private array $allowed) {}

    public function shouldDeliver(array $payload, $endpoint, $event): bool
    {
        return in_array($payload['type'] ?? null, $this->allowed, true);
    }
}
```

Bind it in your service provider so you can pass the array from env:

```php
$this->app->bind(OnlyTheseEventTypes::class, fn () => new OnlyTheseEventTypes(
    explode(',', (string) env('FANOUT_DEV_EVENT_TYPES', '')),
));
```

### "I want to strip PII before sending to dev/staging"

Use a `PayloadTransformer` (see the Filters & transformers section above).

### "Staging and dev verify their own HMAC; how do I sign with each one's secret?"

Configure `HmacSha256Signer` per endpoint with that endpoint's own secret:

```php
'staging' => [
    'signer' => HmacSha256Signer::class,
    'secret' => env('STAGING_WEBHOOK_SECRET'),
],
'dev' => [
    'signer' => HmacSha256Signer::class,
    'secret' => env('DEV_WEBHOOK_SECRET'),
],
```

### "Dev/staging verify against the *original* sender's secret"

Use `PassthroughSigner` — it forwards the original signature header verbatim. Only valid if you don't transform the payload (any byte change invalidates the signature).

### "I want to fire a test webhook into the pipeline from a tinker session"

```php
Fanout::dispatch('stripe-prod', [
    'type' => 'invoice.paid',
    'data' => ['object' => ['id' => 'in_123']],
]);
```

Returns a `FanoutEvent` you can then `replay()` or inspect.

### "I want to send the same payload elsewhere on demand later"

Find the event id in `fanout_events`, then:

```bash
php artisan fanout:replay <event_id> --endpoint=dev
```

Or programmatically:

```php
Fanout::replay($eventId, endpoint: 'dev');
```

## Troubleshooting

**`POST /fanout/in/{profile}` returns 404.** The profile name in the URL doesn't match a key in `config('fanout.profiles')`. Check spelling and that the config file isn't cached against an older version (`php artisan config:clear`).

**`POST /fanout/in/{profile}` returns 401.** Signature verification failed. Three things to check:
1. The `secret` config value matches what the sender is using.
2. The `signature_header` matches the header name the sender actually sets.
3. For Stripe-style validators, your server clock is within `tolerance` (default 300s) of the sender.

**Deliveries stay in `pending` and never run.** No worker is processing the `fanout` queue. Run `php artisan queue:work --queue=fanout` (or add the queue to your existing worker / Horizon supervisor).

**`encrypted:array` cast errors after a key rotation.** All historical payloads were encrypted with the old `APP_KEY`. Either keep the old key as a fallback (Laravel supports `APP_PREVIOUS_KEYS`), or `php artisan fanout:purge` if you don't need the history.

**A delivery row is stuck in `in_flight`.** This means a worker started the job but crashed before updating to a terminal state. The job will be retried by Laravel's queue framework (or stay stuck if your queue driver doesn't time-out long-running jobs). Manually requeue with `Fanout::replay($eventId, endpoint: 'staging')`.

**Stripe complains "no response within 30s" even though I'm returning 202 quickly.** Make sure you're not running the Stripe handler synchronously in `none` persist mode and waiting for downstream HTTP. The receiver always queues delivery — if it's blocking, something else (middleware, app boot) is slow.

**My `transform` callable isn't running.** Closures can't be stored in cached config. Either use a class string (recommended), or register the transformer at runtime in a service provider via `Fanout::extendTransformer('name', fn () => ...)`.

## Testing

```bash
composer install
vendor/bin/pest
```

The test suite covers all signature validators, both signers, every branch of the delivery job (success, retry, exhaustion, network errors, filter, transform, signing, throttle, disabled endpoints, terminal short-circuit), persistence in all three modes, replay, encryption at rest, model swappability, and the full receiver-to-destination integration path.

## License

MIT — see `LICENSE`.
