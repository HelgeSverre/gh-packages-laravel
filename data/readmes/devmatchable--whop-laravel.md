# Whop Laravel

[![CI](https://github.com/devmatchable/whop-laravel/actions/workflows/ci.yml/badge.svg)](https://github.com/devmatchable/whop-laravel/actions/workflows/ci.yml)
[![PHP](https://img.shields.io/badge/PHP-8.4%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Larastan](https://img.shields.io/badge/Larastan-level%20max-2a6496)](https://github.com/larastan/larastan)

> [!WARNING]
> **This package is in active development and is not yet ready for production use.**
> The public API may change at any time before version `1.0.0` is released.
> Please do not depend on it in production projects until a stable release is published.

Laravel package for the [Whop PHP SDK](https://github.com/devmatchable/whop-php-sdk) —
auto-wires the `WhopApiClient` and `WebhookVerifier` from configuration, ships a
signature-verifying middleware, an overridable webhook route + handler, and two
artisan commands.

## What this is

A thin integration layer over the framework-agnostic
[`devmatchable/whop-php-sdk`](https://github.com/devmatchable/whop-php-sdk). It does
four things:

- Binds the SDK's `Matchable\Whop\WhopApiClient` and
  `Matchable\Whop\Webhook\WebhookVerifier` as container singletons, driven by the
  `whop` config.
- Registers a `whop.signature` middleware alias that verifies the Standard Webhooks
  signature on incoming requests and stashes the verified raw body on the request.
- Auto-mounts a webhook route at `whop.webhook_path` whose default handler dispatches
  a `WhopWebhookReceived` event — zero-config consumers only write a listener.
- Exposes `whop:check` and `whop:webhook:verify` artisan commands for setup
  validation and signature debugging.

The package owns *only* framework wiring. API logic, DTOs, and signature math live in
the SDK and are not duplicated here.

## Requirements

- PHP 8.4+
- Laravel 11, 12, or 13
- `devmatchable/whop-php-sdk` ^0.0.1

## Installation

```bash
composer require devmatchable/whop-laravel
```

Laravel package auto-discovery registers `WhopServiceProvider` and the `Whop` facade
alias automatically — no edits to `bootstrap/providers.php` or `config/app.php`.

Publish the config file:

```bash
php artisan vendor:publish --tag=whop-config
```

Set the required environment variables:

```dotenv
WHOP_API_KEY=...
WHOP_WEBHOOK_SECRET=whsec_...
WHOP_BUSINESS_ID=biz_...
# Optional overrides
# WHOP_BASE_URL=https://sandbox-api.whop.com/api/v1
# WHOP_WEBHOOK_PATH=/_whop/webhook
# WHOP_HTTP_CLIENT=
# WHOP_REGISTER_ROUTES=true
```

## Quick start

Resolve the `WhopApiClient` and call any SDK resource. Constructor injection is the
recommended path:

```php
use Matchable\Whop\WhopApiClient;

final readonly class CompanyLookup
{
    public function __construct(
        private WhopApiClient $whop,
    ) {
    }

    public function fetch(string $companyId): void
    {
        $company = $this->whop->companies->get($companyId);
        // ...
    }
}
```

The `Whop` facade resolves the same singleton. SDK resources are exposed as public
readonly properties on `WhopApiClient`, so reach them through the facade root:

```php
use Matchable\Whop\Package\Facades\Whop;

$company = Whop::getFacadeRoot()->companies->get($companyId);
```

(The facade is most useful for IDE autocompletion via its `@mixin WhopApiClient`
hint; in application code, prefer constructor injection.)

## Configuration reference

All keys live under `config/whop.php` and map 1:1 to environment variables:

| Key                | Env var               | Default                          | When to override                                                                 |
| ------------------ | --------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `api_key`          | `WHOP_API_KEY`        | *(required)*                     | Always — the Bearer token the `WhopApiClient` authenticates with.                |
| `webhook_secret`   | `WHOP_WEBHOOK_SECRET` | *(required)*                     | Always — the Standard Webhooks signing secret (`whsec_` prod / `ws_` sandbox).   |
| `base_url`         | `WHOP_BASE_URL`       | `https://api.whop.com/api/v1`    | Point at `https://sandbox-api.whop.com/api/v1` for non-production environments.  |
| `business_id`      | `WHOP_BUSINESS_ID`    | *(required)*                     | Always — every company-scoped Whop endpoint requires `company_id`; checked at boot, `app(WhopApiClient::class)` throws if unset. |
| `http_client`      | `WHOP_HTTP_CLIENT`    | `null`                           | Container id of a `Symfony\Component\HttpClient\Psr18Client` instance to inject. |
| `webhook_path`     | `WHOP_WEBHOOK_PATH`   | `/_whop/webhook`                 | Change the path the auto-route is mounted at; point Whop's webhook config at it. |
| `register_routes`  | `WHOP_REGISTER_ROUTES`| `true`                           | Set to `false` when wiring your own route — see "custom route" section below.    |

## Receiving webhooks — the auto-route

By default the package mounts a `POST` route at `whop.webhook_path` with the
`whop.signature` middleware applied and `WhopWebhookController` as the action. The
controller verifies the signature, decodes the JSON body, and hands off to the bound
`WhopWebhookHandlerInterface`. The default handler dispatches a
`WhopWebhookReceived` event, so zero-config integration is just a listener:

```php
use Matchable\Whop\Package\Events\WhopWebhookReceived;

final class HandleWhopWebhook
{
    public function handle(WhopWebhookReceived $event): void
    {
        // $event->payload    — decoded webhook JSON (array<string, mixed>)
        // $event->rawPayload — the verified raw request body
    }
}
```

Register it in your `EventServiceProvider`:

```php
protected $listen = [
    \Matchable\Whop\Package\Events\WhopWebhookReceived::class => [
        \App\Listeners\HandleWhopWebhook::class,
    ],
];
```

The controller responds with `204 No Content` on success, `401 Unauthorized` on an
invalid signature, and `400 Bad Request` on a body that is not decodable JSON.

## Receiving webhooks — custom route + middleware

Disable the auto-route and wire your own action. The `whop.signature` middleware
alias is registered unconditionally, so you keep signature verification:

```dotenv
WHOP_REGISTER_ROUTES=false
```

```php
// routes/web.php (or routes/api.php)
use App\Http\Controllers\MyWhopWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/whop', MyWhopWebhookController::class)
    ->middleware('whop.signature');
```

> **Laravel 12 CSRF note:** consumer-defined `POST` routes in the `web` group are
> CSRF-protected by default — Whop's request will be rejected with a 419 before
> `whop.signature` runs. To accept Whop webhooks at a `web`-group path, exclude it
> in `bootstrap/app.php`:
>
> ```php
> ->withMiddleware(function (Middleware $middleware) {
>     $middleware->validateCsrfTokens(except: ['webhooks/whop']);
> })
> ```
>
> Or register the route under `routes/api.php` — the `api` group has no CSRF.
> The auto-mounted `/_whop/webhook` route is registered as a standalone route
> outside the `web` group, so this only applies to consumer-defined routes.

Read the verified body from the request attributes — the middleware stashes it under
the `VerifyWhopSignature::VERIFIED_BODY_ATTRIBUTE` constant (`'whop.raw_body'`):

```php
use Illuminate\Http\Request;
use Matchable\Whop\Package\Http\Middleware\VerifyWhopSignature;

final class MyWhopWebhookController
{
    public function __invoke(Request $request)
    {
        $rawBody = (string) $request->attributes->get(
            VerifyWhopSignature::VERIFIED_BODY_ATTRIBUTE,
        );
        $payload = json_decode($rawBody, associative: true);
        // ...
    }
}
```

## Overriding the webhook handler

The default handler is bound as `WhopWebhookHandlerInterface =>
EventDispatchingWebhookHandler`. Three documented override paths:

1. **Rebind the interface to your own implementation:**

   ```php
   // app/Providers/AppServiceProvider.php
   use App\Whop\MyWebhookHandler;
   use Matchable\Whop\Package\Webhook\WhopWebhookHandlerInterface;

   public function register(): void
   {
       $this->app->bind(WhopWebhookHandlerInterface::class, MyWebhookHandler::class);
   }
   ```

2. **Extend `EventDispatchingWebhookHandler`** and override `handle()`:

   ```php
   use Matchable\Whop\Package\Webhook\EventDispatchingWebhookHandler;

   final class MyWebhookHandler extends EventDispatchingWebhookHandler
   {
       public function handle(array $payload, string $rawPayload): void
       {
           // pre-processing
           parent::handle($payload, $rawPayload);
           // post-processing
       }
   }
   ```

3. **Decorate** the bound instance with the container's `extend`:

   ```php
   use Matchable\Whop\Package\Webhook\WhopWebhookHandlerInterface;

   $this->app->extend(
       WhopWebhookHandlerInterface::class,
       fn (WhopWebhookHandlerInterface $inner) => new LoggingWebhookHandler($inner),
   );
   ```

## Artisan commands

```bash
# Verify config + perform a probe GET against the Whop API.
php artisan whop:check
```

`whop:check` exits with code 1 if any required key (`api_key`, `webhook_secret`,
`business_id`, `base_url`) is missing. With config in place it issues a live probe
against `/plans?company_id={WHOP_BUSINESS_ID}` to confirm the credentials reach Whop.

```bash
# Re-verify a captured webhook against the configured (or supplied) secret.
php artisan whop:webhook:verify \
    --payload-file=/tmp/whop-body.json \
    --id=msg_... \
    --timestamp=1714234567 \
    --signature='v1,...'
```

## Quality gates

```bash
composer cs        # Pint dry-run
composer cs:fix    # Pint apply
composer stan      # Larastan at level max
composer test      # Pest (unit + integration)
composer mutate    # pest --mutate --covered-only --everything --min=97
```

CI (`.github/workflows/ci.yml`) runs the matrix `PHP {8.4, 8.5} × Laravel {11, 12} ×
{highest, lowest} dependencies`. Pint, Larastan, and mutation testing run on the
canonical leg (PHP 8.4 / Laravel 12 / highest); Pest runs on every leg. Larastan
runs at `level: max` with **no baseline** — fix the code, do not weaken the level.

Laravel 13 is supported by the package's `require` constraints, but the CI matrix
does not yet include a Laravel 13 leg — adding one requires bumping the
`pestphp/pest`/`pestphp/pest-plugin-laravel` dev dependencies to `^4.0` (Pest v3
caps at Laravel 12). Track that as its own change.

## Versioning

Pre-1.0. The public API may change between minor releases until `1.0.0`. Pin a
specific version in production rather than a range until then.

## License

MIT — see [LICENSE](LICENSE).
