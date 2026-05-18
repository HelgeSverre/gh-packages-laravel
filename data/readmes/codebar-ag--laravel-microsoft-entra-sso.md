<img src="https://banners.beyondco.de/Laravel%20Microsoft%20Entra%20SSO.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-microsoft-entra-sso&pattern=circuitBoard&style=style_2&description=Microsoft+Entra+ID+SSO+authentication+for+Laravel.&md=1&showWatermark=0&fontSize=150px&images=home&widths=500&heights=500">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-microsoft-entra-sso.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-microsoft-entra-sso)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-microsoft-entra-sso.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-microsoft-entra-sso)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/fix-php-code-style-issues.yml)
[![PHPStan](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/phpstan.yml/badge.svg)](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/phpstan.yml)
[![Dependency Review](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/codebar-ag/laravel-microsoft-entra-sso/actions/workflows/dependency-review.yml)

Microsoft Entra ID (Azure AD) SSO authentication package for Laravel using OAuth2 + OpenID Connect.

## Requirements

- PHP 8.3, 8.4, or 8.5
- Laravel 13
- A Microsoft Entra app registration

## Installation

```bash
composer require codebar-ag/laravel-microsoft-entra-sso
```

Publish config (optional, recommended):

```bash
php artisan vendor:publish --tag=microsoft-entra-sso-config
```

Publish package translations (recommended if you want to customize text or add locales):

```bash
php artisan vendor:publish --tag=microsoft-entra-sso-translations
```

## Configuration

Set these environment variables:

```dotenv
MICROSOFT_ENTRA_SSO_TENANT_ID=your-tenant-id
MICROSOFT_ENTRA_SSO_CLIENT_ID=your-client-id
MICROSOFT_ENTRA_SSO_CLIENT_SECRET=your-client-secret
MICROSOFT_ENTRA_SSO_REDIRECT_URI=${APP_URL}/sso/microsoft/web/callback
```

Configure guards in `config/microsoft-entra-sso.php`:

```php
'guards' => [
    'web' => [
        'model' => App\Models\User::class,
        'redirect_after_login' => '/dashboard',
    ],
],
```

The configured model must implement `CodebarAg\MicrosoftEntraSSO\Contracts\SSOAuthenticatable` (typically via the `HasMicrosoftSSO` trait).

### Security and flow options

The package supports additional hardening options:

```php
'stateless' => false,
'state_ttl_seconds' => 300,
'allowed_redirect_hosts' => ['example.com', 'localhost'],
```

- `stateless`: skips session-bound state validation (useful for API/mobile callback workflows).
- `state_ttl_seconds`: rejects stale OAuth state values.
- `allowed_redirect_hosts`: prevents redirect URI host misuse.

### HTTP behavior

OAuth and Graph calls can be tuned:

```php
'http' => [
    'timeout' => 10,
    'connect_timeout' => 5,
    'retry_times' => 1,
    'retry_sleep_ms' => 200,
],
```

Use these values to set environment-specific resiliency for slow networks or transient upstream failures.

## Routes and controllers

The package registers two routes under the configured prefix (`sso/microsoft` by default):

- `GET /sso/microsoft/{guard}/redirect` -> `RedirectToMicrosoftController` (invokable)
- `GET /sso/microsoft/{guard}/callback` -> `HandleMicrosoftCallbackController` (invokable)

Named routes remain:

- `microsoft-entra-sso.redirect`
- `microsoft-entra-sso.callback`

## Socialite-like API usage

The facade resolves a manager/factory contract and supports driver resolution similar to Socialite:

```php
use CodebarAg\MicrosoftEntraSSO\Facades\MicrosoftEntraSSO;

$provider = MicrosoftEntraSSO::driver('microsoft');
```

Under the hood the provider offers:

- `getAuthorizationUrl($state, $codeVerifier)`
- `exchangeCodeForTokens($code, $codeVerifier)`
- `getUserFromToken($token)`
- `refreshAccessToken($refreshToken)`

## Services and methods

### Service resolution

Resolve the OAuth provider via facade/manager:

```php
use CodebarAg\MicrosoftEntraSSO\Facades\MicrosoftEntraSSO;

$provider = MicrosoftEntraSSO::driver('microsoft');
```

Resolve services directly from the container:

```php
use CodebarAg\MicrosoftEntraSSO\Services\MicrosoftOAuthService;
use CodebarAg\MicrosoftEntraSSO\Services\MicrosoftGraphService;

$oauth = app(MicrosoftOAuthService::class);
$graph = app(MicrosoftGraphService::class);
```

### Provider API (OAuth)

- `stateless(bool $stateless = true): static` - enable/disable session-less callback validation mode.
- `getAuthorizationUrl(string $state, string $codeVerifier): string` - build Microsoft authorize URL.
- `exchangeCodeForTokens(string $code, string $codeVerifier): SSOToken` - exchange callback code for tokens.
- `getUserFromToken(string $accessToken): SSOUser` - fetch current Microsoft user profile from Graph `/me`.
- `refreshAccessToken(string $refreshToken): SSOToken` - refresh an expired/expiring token.
- `setRedirectUri(string $uri): static` - override redirect URI at runtime.
- `getRedirectUri(): ?string` - inspect current redirect URI.

Static helpers on `MicrosoftOAuthService`:

- `generateState(): string` - generate random OAuth state.
- `generateCodeVerifier(): string` - generate PKCE verifier.
- `generateCodeChallenge(string $codeVerifier): string` - derive PKCE S256 challenge.

### Graph API helper service

- `getUserProfile(SSOAuthenticatable $user): array` - extended profile fields from Microsoft Graph.
- `getUserGroups(SSOAuthenticatable $user): Collection` - all Azure AD groups for the user (handles pagination).
- `getUserPhotoDataUri(SSOAuthenticatable $user): ?string` - profile photo as data URI (`null` when missing).
- `isUserInGroup(SSOAuthenticatable $user, string $groupId): bool` - efficient membership check (cache-aware).

### Model trait API (`HasMicrosoftSSO`)

- `findByMicrosoftId(string $microsoftId): ?static`
- `findOrCreateFromMicrosoft(array $microsoftUser): static`
- `linkMicrosoftAccount(array $microsoftUser): void`
- `updateMicrosoftTokens(array $microsoftUser): void`
- `hasMicrosoftSSOLinked(): bool`
- `isMicrosoftTokenExpired(): bool`
- `unlinkMicrosoftAccount(): void`

### Data objects

`SSOToken` helpers:

- `fromArray(array $payload): SSOToken`
- `toArray(): array`

`SSOUser` helpers:

- `fromGraphPayload(array $graphPayload): SSOUser`
- `withToken(SSOToken $token): SSOUser`
- `toArray(): array`

## Blade usage

Use the bundled button component in your login view:

```blade
<x-microsoft-entra-sso::sso-button guard="web" />
```

You can override the label with a translation key:

```blade
<x-microsoft-entra-sso::sso-button
    guard="web"
    label="microsoft-entra-sso.button.sign_in"
/>
```

## Translations

The package ships with JSON translations for:

- `lang/en.json`
- `lang/de.json`

After publishing (`microsoft-entra-sso-translations`), you can:

- edit existing keys in your application's `lang/en.json` and `lang/de.json`
- add additional locales by creating files like `lang/fr.json` with the same keys
- set `APP_LOCALE` (and optionally `APP_FALLBACK_LOCALE`) to control runtime language

## Tailwind v4 (plain Tailwind, no Flux)

This package does not require Flux or any frontend UI dependency.

If you use the provided Blade component styles, ensure Tailwind v4 scans the package classes. Add a source path in your app stylesheet:

```css
@import "tailwindcss";
@source "../../packages/codebar-ag/laravel-microsoft-entra-sso/resources/views/**/*.blade.php";
```

If your package is installed from `vendor/`, point `@source` at the vendor path instead:

```css
@import "tailwindcss";
@source "../../vendor/codebar-ag/laravel-microsoft-entra-sso/resources/views/**/*.blade.php";
```

Alternative: publish views and scan `resources/views/vendor/microsoft-entra-sso/**/*.blade.php`.

## Events and extension points

The package dispatches:

- `CodebarAg\MicrosoftEntraSSO\Events\SSOUserRegistered`
- `CodebarAg\MicrosoftEntraSSO\Events\SSOUserAuthenticated`

Both events are emitted during the callback flow after the package authenticates or registers a user.

You can listen to these events to add:

- custom provisioning
- role/group synchronization
- audit logging

## Troubleshooting

- `microsoft_entra_sso_error` in session:
  - Check Entra app credentials and callback URL.
  - Ensure guard exists in `config/microsoft-entra-sso.php`.
  - Ensure your app has a `login` route (or fallback redirect handling in your app).
  - If state errors occur, verify callback happens within `state_ttl_seconds`.
- Button appears unstyled:
  - Verify Tailwind v4 `@source` includes package Blade view paths.
  - Rebuild frontend assets after changing Tailwind sources.

## Quality Checks

Run linting:

```bash
composer lint
```

Run static analysis:

```bash
composer analyse
```

`composer analyse` runs PHPStan/Larastan using `phpstan.neon.dist` at level 9.

Run package tests:

```bash
composer test
```

Run coverage with enforced minimum:

```bash
composer test-coverage
```
