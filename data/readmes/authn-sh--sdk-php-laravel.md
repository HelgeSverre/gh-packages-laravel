# authn-sh/sdk-php-laravel

Laravel package for [authn.sh](https://authn.sh) — auto-discovered service provider, container bindings, middleware, Blade directives, and an `Authn` facade. Wraps [`authn-sh/sdk-php`](https://github.com/authn-sh/sdk-php) for Laravel 11+.

## Requirements

- PHP **8.2+**
- Laravel **11+** (`^11.0 || ^12.0`)
- A PSR-18 HTTP client (Guzzle, Symfony HttpClient, etc.) — required by the underlying `authn-sh/sdk-php` SDK and auto-discovered via [`php-http/discovery`](https://docs.php-http.org/en/latest/discovery.html).

## Install

```bash
composer require authn-sh/sdk-php-laravel
```

The service provider auto-discovers. Publish the config:

```bash
php artisan vendor:publish --tag=authn-config
```

## Middleware

Register `authn` on routes that require a valid session JWT:

```php
Route::middleware('authn')->group(function () {
    Route::get('/dashboard', DashboardController::class);
});
```

## Blade directives

### `@authnSignedIn` / `@authnSignedOut`

```blade
@authnSignedIn
    <p>Welcome back, {{ Authn::auth()->sub }}</p>
@endauthnSignedIn

@authnSignedOut
    <a href="/login">Sign in</a>
@endauthnSignedOut
```

### `@authnHas`

Evaluates organization roles and permissions from the active session JWT:

```blade
@authnHas('role:org:admin')
    <a href="/admin">Admin panel</a>
@else
    <p>You do not have admin access.</p>
@endauthnHas

@authnHas('permission:org:billing:manage')
    <a href="/billing">Billing</a>
@endauthnHas
```

The argument must be prefixed with `role:` or `permission:`. Any other prefix raises an `InvalidArgumentException` at render time so typos fail loudly.

### `@authnHasConnectedAccount`

Renders the inner block when the active session JWT advertises an `ExternalAccount` linked to the named OAuth provider:

```blade
@authnHasConnectedAccount('google')
    <p>Connected to Google.</p>
@else
    <a href="/sign-in/sso-callback?provider=google">Connect Google</a>
@endauthnHasConnectedAccount
```

The matching route middleware `authn.connected:<provider_key>` fail-closes by redirecting to `authn.connected_accounts.redirect_url` (the `{provider}` placeholder is substituted with the route argument):

```php
Route::get('/integrations/google', [GoogleController::class, 'show'])
    ->middleware(['authn', 'authn.connected:google']);
```

### `@authnHasPasskey`

Renders the inner block based on the active session's passkey signal. Two modes:

- `verified` (default) — matches when the current session was authenticated by a passkey first-factor (`VerifiedClaims::wasVerifiedByPasskey()`).
- `enrolled` — matches whenever the user has at least one verified passkey on file (`VerifiedClaims::hasPasskey()`).

```blade
@authnHasPasskey
    <a href="/account/api-keys">Manage API keys</a>
@else
    <p>This area requires a passkey sign-in.</p>
@endauthnHasPasskey

@authnHasPasskey('enrolled')
    <p>You already have a passkey on file.</p>
@else
    <a href="/user/security/passkeys">Add your first passkey</a>
@endauthnHasPasskey
```

The matching route middleware `authn.requires_passkey[:<mode>]` fail-closes by redirecting unauthenticated requests to `authn.url.sign_in` and signed-in-but-under-authenticated requests to `authn.passkey.enroll_url`:

```php
Route::get('/account/security', [SecurityController::class, 'show'])
    ->middleware(['authn', 'authn.requires_passkey']);            // verified (default)

Route::get('/account/api-keys', [ApiKeyController::class, 'index'])
    ->middleware(['authn', 'authn.requires_passkey:verified']);

Route::get('/account/passkey-required-area', [Controller::class, 'show'])
    ->middleware(['authn', 'authn.requires_passkey:enrolled']);
```

The default mode is configurable via `authn.passkey.default_strict_mode` (env `AUTHN_PASSKEY_DEFAULT_STRICT_MODE`).

### `@authnHasEnterpriseAccount`

Renders the inner block based on the active session's enterprise-SSO signal. Two modes for the no-argument form:

- `verified` (default) — matches when the current session was authenticated through an enterprise IdP (`VerifiedClaims->enterpriseConnectionId !== null`).
- `linked` — matches whenever the user has at least one linked `EnterpriseAccount`, whether or not the current session is enterprise-SSO.

```blade
@authnHasEnterpriseAccount
    <p>You signed in via enterprise SSO.</p>
@else
    <a href="/sign-in/enterprise-sso">Sign in with your organization</a>
@endauthnHasEnterpriseAccount
```

With a connection-id argument, the directive matches when the active session's `enterpriseConnectionId` equals it OR when the user has a linked `EnterpriseAccount` for that connection:

```blade
@authnHasEnterpriseAccount('entcon_01HKX9SY9V7H7TF8C8K7J9X4ZA')
    <a href="/admin/enterprise">Org admin</a>
@endauthnHasEnterpriseAccount
```

The matching route middleware `authn.requires_enterprise_sso[:<mode>]` fail-closes by redirecting unauthenticated requests to `authn.url.sign_in` and signed-in-but-under-authenticated requests to `authn.enterprise_sso.redirect_url`:

```php
Route::get('/workspace', [WorkspaceController::class, 'show'])
    ->middleware(['authn', 'authn.requires_enterprise_sso']);            // verified (default)

Route::get('/workspace/admin', [WorkspaceAdminController::class, 'show'])
    ->middleware(['authn', 'authn.requires_enterprise_sso:verified']);

Route::get('/workspace/profile', [ProfileController::class, 'show'])
    ->middleware(['authn', 'authn.requires_enterprise_sso:linked']);
```

The default mode is configurable via `authn.enterprise_sso.default_strict_mode` (env `AUTHN_ENTERPRISE_SSO_DEFAULT_STRICT_MODE`).

## Facade methods

```php
use Authn\Sdk\Laravel\Facades\Authn;

$claims = Authn::auth();              // ?VerifiedClaims — null outside an authn-authenticated request
Authn::hasRole('org:admin');          // bool
Authn::hasPermission('org:foo:bar');  // bool
Authn::hasPasskey();                  // bool — defaults to the configured strict mode ("verified")
Authn::hasPasskey('enrolled');        // bool — true when the user has any verified passkey
Authn::hasEnterpriseSso();            // bool — defaults to the configured strict mode ("verified")
Authn::hasEnterpriseSso('linked');    // bool — true when the user has any linked EnterpriseAccount
```

## Development

```bash
composer install
composer test       # Pest + Orchestra Testbench
composer phpstan    # PHPStan + Larastan @ level 10
composer pint       # code style check
composer pint:fix   # apply fixes
```

CI runs the full suite on the **PHP 8.2 / 8.3 / 8.4 / 8.5 × Laravel 11 / 12** matrix.

## License

[AGPL-3.0-only](LICENSE).
