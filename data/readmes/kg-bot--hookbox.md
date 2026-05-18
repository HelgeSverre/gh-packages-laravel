# Hookbox

Hookbox is the inbox for your Laravel webhooks. Receive, verify, dedupe, replay.

## Why

Laravel apps usually need the same inbound-webhook guarantees over and over: signature verification, durable storage, idempotency, replay, redaction, and retention. Hookbox packages those concerns into a headless core so applications and UI plugins can share one stable inbox model instead of rebuilding it per integration.

The core package is intentionally UI-free. Filament, Livewire, or other admin experiences belong in separate companion packages that consume Hookbox's documented read and replay contract.

## Support

- Laravel 12 on PHP 8.2+
- Laravel 13 on PHP 8.3+

## Quickstart

Current install flow:

```bash
composer require kg-bot/hookbox
php artisan vendor:publish --tag=hookbox-config
php artisan migrate
```

Hookbox loads its package migrations automatically when you run `php artisan migrate`. Publishing migrations is not part of the normal install flow.

If you also want a companion UI package, install Hookbox first and then run the installer wrapper command for the stack you want:

```bash
php artisan hookbox:install-ui blade
```

Supported installer targets today are `blade`, `vue`, `livewire`, and `filament`. The installer only adds a separate companion package; Hookbox core stays UI-free.

Hookbox registers a single receiver route at `POST /{route_prefix}/{source}`.

```php
// config/hookbox.php
return [
    'route_prefix' => 'webhooks',
    'queue' => [
        'connection' => null,
        'name' => null,
    ],
    'store_invalid_signatures' => true,
    'sources' => [
        'stripe' => [
            'verifier' => \Hookbox\Verifiers\StripeVerifier::class,
            'secret' => env('STRIPE_WEBHOOK_SECRET'),
            'tolerance' => 300,
            'redact' => ['$.data.object.customer_email'],
            'retention_days' => 30,
        ],
    ],
];
```

Receiver pipeline target:

1. Resolve the source by slug.
2. Capture raw request bytes before request parsing mutates them.
3. Verify the signature.
4. Deduplicate by `(source_id, idempotency_key)`.
5. Redact configured JSON paths for storage.
6. Persist the message.
7. Queue asynchronous processing.

Current package status: source configuration, signature verification, redacted message persistence, receipt persistence for replay reverification, dedupe, queued processing, in-process replay, pruning, repository/view APIs, the shared action registration API, and the current built-in verifier batch are implemented. UI companion packages remain future work.

## Configuring sources

Sources are registered through config and exposed at runtime via `Hookbox\SourceRegistry`. Each source is defined by an immutable `SourceDefinition` with a slug, name, verifier class, queue settings, redaction paths, and retention settings.

Built-in verifiers shipped today:

- `Hookbox\Verifiers\StripeVerifier`
- `Hookbox\Verifiers\GitHubVerifier`
- `Hookbox\Verifiers\ShopifyVerifier`
- `Hookbox\Verifiers\SlackVerifier`
- `Hookbox\Verifiers\MailgunVerifier`
- `Hookbox\Verifiers\StandardWebhooksVerifier`
- `Hookbox\Verifiers\PayPalVerifier`
- `Hookbox\Verifiers\AwsSnsVerifier`

Additional provider verifiers can be added by host applications through the `Hookbox\Contracts\Verifier` contract.

`Hookbox\Verifiers\PayPalVerifier` acquires an OAuth access token from PayPal before calling `verify-webhook-signature`, and expects `base_url`, `client_id`, `client_secret`, and `webhook_id` in the source config.

`Hookbox\Verifiers\AwsSnsVerifier` expects a source-configured `topic_arn`, validates the SNS `SigningCertURL`, fetches the certificate through the shared verifier transport, and verifies the RSA signature locally.

`Hookbox\Verifiers\StandardWebhooksVerifier` is the generic fallback for providers that publish a stable Standard Webhooks or compatible HMAC contract but do not justify a provider-named built-in verifier.

Make and Zapier do not ship as provider-specific built-in verifiers. Their outbound webhook auth story is user-configured request headers or basic auth rather than a stable provider-managed signature protocol, so the recommended Hookbox path is either `StandardWebhooksVerifier` for compatible senders or a small custom verifier in the host app.

## Writing a verifier

Verifiers turn a raw Laravel `Request` plus a `SourceDefinition` into three pieces of normalized receiver state:

- signature result
- idempotency key
- event type

Current contract:

```php
namespace Hookbox\Contracts;

use Hookbox\SourceDefinition;
use Hookbox\VerificationResult;
use Illuminate\Http\Request;

interface Verifier
{
    public function verify(Request $request, SourceDefinition $source): VerificationResult;

    public function idempotencyKey(Request $request, SourceDefinition $source): ?string;

    public function eventType(Request $request, SourceDefinition $source): ?string;
}
```

Verifier implementations should be fixture-tested with valid, tampered, and expired/replayed-timestamp cases.

## Writing actions

Actions receive persisted webhook messages through `Hookbox\WebhookActionContext`, not raw HTTP requests. That keeps the receiver fast and makes replay deterministic.

```php
namespace Hookbox\Contracts;

use Hookbox\WebhookActionContext;

interface WebhookAction
{
    public function handle(WebhookActionContext $context, \Closure $next): mixed;
}
```

```php
use Hookbox\Facades\Hookbox;

Hookbox::handle('stripe')
    ->when(eventType: 'invoice.paid')
    ->through(\App\WebhookActions\MarkInvoicePaid::class);
```

Use the facade or `Hookbox\HookboxActionRegistrar` to register actions during application boot. `WebhookActionRegistry` is the scoped runtime matcher that Hookbox hydrates from those public registrations.

Wildcard precedence is fixed when Hookbox resolves actions: `provider+event`, then `provider+*`, then `*+event`, then `*+*`.

`through()` appends actions exactly as configured, including duplicates. Conditions can be closures or classes that implement `Hookbox\Contracts\WebhookActionCondition`, and they are evaluated before the pipeline runs.

`WebhookActionContext::isDryRun()` is the guard rail for replay safety. Actions that perform side effects should explicitly branch on `isDryRun()` before touching external systems.

## Replay & dry-run model

Replay is an in-process service call. The core package does not expose replay over HTTP.

```php
namespace Hookbox;

final class ReplayService
{
    public function replay(WebhookMessage|string $messageOrId, ReplayOptions $options): WebhookAttempt;
}
```

`ReplayOptions::$dryRun` defaults to `true`. That default is locked. Replaying side-effecting events should require an explicit opt-in, not a footgun.

`forceReverify` will re-run source verification against the stored original request envelope so audits remain honest when secrets rotate.

`ReplayOptions::$actionsFilter` can restrict a replay run to a subset of already-matched action classes.

## PII redaction

Redaction is configured per source using a compact JSON-path-like syntax with dotted paths and `[*]` wildcards.

```php
'redact' => [
    '$.customer.email',
    '$.payment_method.card.number',
    '$.items[*].billing.email',
],
```

Order of operations is fixed:

1. verify against raw bytes
2. derive idempotency from raw bytes
3. hash raw bytes into `body_hash`
4. redact the storage copy
5. persist the redacted body

Redaction is irreversible at storage time. `hookbox_messages.body` remains redacted, while any stored receipts are internal replay-only state.

## Pruning

Messages are retained per source, defaulting to 30 days when `retention_days` is missing or malformed. The core supports both Laravel's `model:prune` flow and a package command:

```bash
php artisan hookbox:prune
```

Pruning a message must cascade to attempts.

## Events

Hookbox defines lifecycle events for both the receiver and replay paths:

- `Hookbox\Events\WebhookReceived`
- `Hookbox\Events\WebhookProcessed`
- `Hookbox\Events\WebhookProcessingFailed`
- `Hookbox\Events\WebhookReplayed`

Currently dispatched:

- `Hookbox\Events\WebhookReceived`
- `Hookbox\Events\WebhookProcessed`
- `Hookbox\Events\WebhookProcessingFailed`
- `Hookbox\Events\WebhookReplayed`

These events are part of the package's extension story for host apps and UI plugins.

## Stable contract for UI plugins

UI packages should depend only on the contract in this section. Everything else in the package is internal and may change in a minor release. Receipts are not part of the stable UI contract.

Stable read/replay services:

```php
Hookbox\Repositories\MessageRepository
    paginate(MessageFilters $filters, int $perPage): LengthAwarePaginator
    find(string $id): ?WebhookMessageView
    attempts(string $messageId): Collection
    metrics(MetricsRange $range): MetricsSummary

Hookbox\Repositories\SourceRepository
    all(): Collection
    find(string $slug): ?SourceView
    counters(string $slug, MetricsRange $range): SourceCounters

Hookbox\ReplayService::replay(
    Hookbox\Models\WebhookMessage|string $messageOrId,
    Hookbox\ReplayOptions $options,
): Hookbox\Models\WebhookAttempt
```

Stable DTOs:

- `Hookbox\Views\WebhookMessageView`
- `Hookbox\Views\WebhookAttemptView`
- `Hookbox\Views\SourceView`
- `Hookbox\Views\MetricsSummary`
- `Hookbox\Views\SourceCounters`

Stable filters and support types:

- `Hookbox\Repositories\MessageFilters`
- `Hookbox\Repositories\MetricsRange`
- `Hookbox\ReplayOptions`

Stable event payload shape:

- `WebhookReceived(WebhookMessageView $message)`
- `WebhookProcessed(WebhookMessageView $message, WebhookAttemptView $attempt)`
- `WebhookProcessingFailed(WebhookMessageView $message, WebhookAttemptView $attempt)`
- `WebhookReplayed(WebhookMessageView $message, WebhookAttemptView $attempt)`

Recommended authorization ability names for host apps and UI packages:

- `viewHookboxInbox`
- `replayHookboxMessage`
- `viewRedactedPayload`

Even though `ReplayService::replay()` currently returns an internal `WebhookAttempt` model, UI packages should treat the documented repositories, DTOs, filters, support types, and event payloads in this section as the stable integration surface. Receipts, migrations, jobs, queued handlers, and other implementation details are explicitly out of bounds for UI plugins.

## Migrating from spatie/laravel-webhook-client

Hookbox aims to be a drop-in upgrade path for projects already using `spatie/laravel-webhook-client`.

Suggested migration path:

1. Keep existing inbound endpoints.
2. Swap package config to Hookbox source definitions.
3. Move any request-filtering rules from Spatie `WebhookProfile` classes into Hookbox source-specific verification or handler selection logic.
4. Replace Spatie processing jobs with Hookbox handlers and replay workflows.
5. Move UI and operational workflows to the Hookbox read/replay contract.

Mapping guide:

- Spatie `configs[*].name` -> Hookbox source slug
- Spatie `signing_secret` -> Hookbox source `secret` or verifier-specific config
- Spatie `signature_header_name` -> verifier-specific config when the Hookbox verifier needs it
- Spatie `signature_validator` -> Hookbox verifier class
- Spatie `webhook_profile` -> custom filtering logic you should move into your Hookbox verifier, receiver rules, or downstream handler selection
- Spatie `process_webhook_job` -> Hookbox handler class or replay handler configuration
- Spatie `delete_after_days` -> Hookbox per-source `retention_days`

What does not translate directly:

- Hookbox does not expose the Spatie `WebhookProcessor` pipeline.
- Hookbox does not use Spatie `WebhookProfile` classes directly.
- Hookbox stores redacted message bodies plus internal replay receipts instead of Spatie's `webhook_calls` model shape.

Practical migration sequence:

1. Keep the same webhook URL and point it at Hookbox's receiver route.
2. Recreate each Spatie config entry as a Hookbox source.
3. Port any `WebhookProfile::shouldProcess()` conditions into Hookbox-specific filtering rules.
4. Port each Spatie `ProcessWebhookJob` into a Hookbox action that accepts `Hookbox\WebhookActionContext`.
5. Schedule pruning using `php artisan hookbox:prune` or `model:prune --model=Hookbox\\Models\\WebhookMessage`.
6. Move operational tooling to Hookbox repositories, events, and replay service.

Example config translation:

```php
// spatie/laravel-webhook-client
return [
    'configs' => [
        [
            'name' => 'stripe',
            'signing_secret' => env('STRIPE_WEBHOOK_SECRET'),
            'signature_header_name' => 'Stripe-Signature',
            'signature_validator' => \Spatie\WebhookClient\SignatureValidator\DefaultSignatureValidator::class,
            'webhook_profile' => \App\WebhookProfiles\OnlyInvoiceEvents::class,
            'process_webhook_job' => \App\Jobs\ProcessStripeWebhook::class,
        ],
    ],
    'delete_after_days' => 30,
];

// config/hookbox.php
return [
    'sources' => [
        'stripe' => [
            'name' => 'Stripe',
            'verifier' => \Hookbox\Verifiers\StripeVerifier::class,
            'secret' => env('STRIPE_WEBHOOK_SECRET'),
            'signature_header_name' => 'Stripe-Signature',
            'retention_days' => 30,
        ],
    ],
];
```

Then register actions at boot time:

```php
use Hookbox\Facades\Hookbox;

Hookbox::handle('stripe')
    ->when(eventType: 'invoice.paid')
    ->through(\App\WebhookActions\ProcessStripeWebhook::class);
```

In that translation, `OnlyInvoiceEvents` is no longer a reusable Spatie class. Recreate that rule either in the Stripe verifier's event typing/idempotency logic or as an action condition.

## Roadmap

- `0.1.x`: core receiver, persistence, replay, pruning, redaction, repositories, and migration docs for teams moving off `spatie/laravel-webhook-client`
- `0.2.x`: observability improvements, including OpenTelemetry hooks
- future companion packages: Filament and Livewire inbox UIs built strictly against the stable contract above
