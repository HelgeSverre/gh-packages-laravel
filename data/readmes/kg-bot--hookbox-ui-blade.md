# Hookbox UI Blade

`kg-bot/hookbox-ui-blade` is a server-rendered Blade adapter for the Hookbox inbox and message details UI. It renders the normalized page data provided by `kg-bot/hookbox-ui-core`, so you get a Laravel Blade interface for browsing messages, reviewing attempts, and submitting replay requests without adding a frontend build step.

## Package Stack

- `kg-bot/hookbox-ui-blade` provides the Blade adapter, routes, views, and HTML replay redirect/flash flow.
- `kg-bot/hookbox-ui-core` provides the normalized UI contract, GET controllers, shared route settings, and replay safety inputs.
- `kg-bot/hookbox-ui-core` depends on `kg-bot/hookbox` for the underlying webhook inbox and replay services.

## Supported Versions

Laravel 12 and 13 are supported. Earlier Laravel versions are out of scope.

## Installation

Install the package:

```bash
composer require kg-bot/hookbox-ui-blade
```

Publish the shared UI Core config, the Blade adapter config, and the Blade views:

```bash
php artisan vendor:publish --tag=hookbox-ui-config
php artisan vendor:publish --tag=hookbox-ui-blade-config
php artisan vendor:publish --tag=hookbox-ui-blade-views
```

To avoid route collisions, disable the UI Core auto-loaded routes when using the Blade adapter:

```php
// config/hookbox-ui.php
'enabled' => false,
```

See [`docs/installation.md`](docs/installation.md) for the full install path and config examples.

## Routes

By default the package uses the shared `hookbox-ui` route settings from UI Core, including the default `hookbox` prefix.

Default routes:

- `GET /hookbox/messages` named `hookbox-ui.messages.index`
- `GET /hookbox/messages/{message}` named `hookbox-ui.messages.show`
- `POST /hookbox/messages/{message}/replay` named `hookbox-ui.messages.replay`

If you override `hookbox-ui.route_prefix` or `hookbox-ui.middleware`, the Blade adapter follows those shared UI Core settings.

## Authorization Abilities

The adapter expects these abilities:

- `viewHookboxInbox`
- `replayHookboxMessage`
- `viewRedactedPayload`

`viewHookboxInbox` gates the inbox and message pages. `replayHookboxMessage` controls replay form access and replay posts. `viewRedactedPayload` controls whether users may view redacted payload information exposed by the UI Core contract.

## Replay Safety Defaults

Replay stays dry run first by default. A live replay only happens when both conditions are true:

- the operator checks the live replay checkbox in the form
- `hookbox-ui.replay.allow_live=true`

If live replay is disabled in config, the Blade UI only offers dry run replay.

## Customization

The customization story is intentionally simple:

- publish `hookbox-ui-blade` config to change the brand and page title
- publish the Blade views to override markup or styling
- no frontend build step is required

## Scope

This package stays adapter-only and only renders the stable UI Core contract. Current scope includes the inbox page, message details page, attempt history, and replay form.

Out of scope:

- JavaScript adapters
- Livewire
- Vue
- Inertia
- Filament
- payload or body panels beyond the current UI Core contract
