# Hookbox UI Core

Hookbox UI Core is the shared backend-only package for Hookbox inbox and replay experiences. It is JSON-first by default through the responder contract and does not render framework-specific UI.

## Support

Hookbox UI Core supports Laravel 12 and 13 on PHP 8.2+.

## What It Provides

Laravel apps that want a Hookbox inbox still need the same backend concerns over and over: request parsing, authorization, pagination defaults, normalized page data, and safe replay orchestration. Hookbox UI Core packages those concerns into a headless backend layer so Blade, Livewire, Filament, Vue, or other adapters can share one stable UI-core surface instead of rebuilding it per stack.

The package currently provides:

- route registration for inbox, message detail, and replay endpoints
- inbox query parsing and pagination defaults
- authorization checks for inbox access, replay, and redacted payload visibility
- normalized inbox and message-detail view models
- JSON responses by default via `Hookbox\UiCore\Contracts\HookboxUiResponder`
- replay orchestration that defaults to dry-run behavior

## Dependencies

`hookbox-ui-core` depends on `kg-bot/hookbox` for the stable read and replay contract. UI Core sits on top of that package and does not read Hookbox internal models, receipts, jobs, queued handlers, or other implementation details directly.

Supported integration surface:

- `Hookbox\Repositories\MessageRepository`
- `Hookbox\Repositories\SourceRepository`
- `Hookbox\ReplayService`
- `Hookbox\ReplayOptions`
- `Hookbox\Repositories\MessageFilters`
- `Hookbox\Repositories\MetricsRange`
- `Hookbox\Views\WebhookMessageView`
- `Hookbox\Views\WebhookAttemptView`
- `Hookbox\Views\SourceView`
- `Hookbox\Views\MetricsSummary`
- `Hookbox\Views\SourceCounters`

## Installation

This package depends on the published `kg-bot/hookbox` Composer package.

To install dependencies for local development in this repository, run:

```bash
composer install
```

For a release install in a consuming Laravel application, require UI Core. Composer will install its `kg-bot/hookbox` dependency automatically:

```bash
composer require kg-bot/hookbox-ui-core
```

If you need to override package defaults, publish the config with:

```bash
php artisan vendor:publish --tag=hookbox-ui-config
```

Additional installation details are documented in [`docs/installation.md`](docs/installation.md).

## Default Routes

When `hookbox-ui.enabled` is `true`, the package registers these routes under `hookbox-ui.route_prefix`, which defaults to `hookbox`:

- `GET /hookbox/messages`
- `GET /hookbox/messages/{message}`
- `POST /hookbox/messages/{message}/replay`

Default config keys:

- `enabled`
- `route_prefix`
- `middleware`
- `pagination.per_page`
- `replay.allow_live`

## Authorization

The package expects these Laravel abilities to exist:

- `viewHookboxInbox`
- `replayHookboxMessage`
- `viewRedactedPayload`

`viewHookboxInbox` gates the inbox and message detail endpoints. `replayHookboxMessage` gates replay requests. `viewRedactedPayload` is exposed in the JSON page payload so adapters can decide whether to show redacted content affordances.

## Replay Safety Defaults

Replay stays dry-run by default.

- Message details expose `defaultsToDryRun: true`
- The replay endpoint only performs a live replay when the request explicitly sends `live_replay=true`
- Live replay still requires `hookbox-ui.replay.allow_live` to be enabled

## Out Of Scope

This repository is intentionally backend-only. It does not render Blade, Livewire, Inertia, Vue, Filament, or any other framework-specific interface.

Adapter packages are intentionally out of scope for this repository. Future UI packages should consume UI Core rather than reimplementing Hookbox inbox and replay business rules.

## Additional Docs

- [`docs/installation.md`](docs/installation.md)
- [`docs/ui-contract.md`](docs/ui-contract.md)
- [`docs/examples/json-responses.md`](docs/examples/json-responses.md)
