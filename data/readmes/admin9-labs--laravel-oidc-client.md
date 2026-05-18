# Laravel OIDC Client

[![Latest Version on Packagist](https://img.shields.io/packagist/v/admin9/laravel-oidc-client.svg?style=flat-square)](https://packagist.org/packages/admin9/laravel-oidc-client)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/admin9-labs/laravel-oidc-client/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/admin9-labs/laravel-oidc-client/actions?query=workflow%3Arun-tests+branch%3Amain)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen.svg?style=flat-square)](https://github.com/admin9-labs/laravel-oidc-client/actions?query=workflow%3Aphpstan)
[![Total Downloads](https://img.shields.io/packagist/dt/admin9/laravel-oidc-client.svg?style=flat-square)](https://packagist.org/packages/admin9/laravel-oidc-client)

English | [简体中文](docs/zh-CN/README.md)

A Laravel package for OIDC (OpenID Connect) authentication with PKCE support. Architecture-agnostic — works with Blade, Livewire, Inertia, or any Laravel stack.

## Features

- OIDC Authorization Code Flow with PKCE
- Pluggable authentication strategy via `OidcAuthenticator` interface
- Automatic user provisioning from OIDC claims
- Flexible user mapping configuration
- Token revocation and SSO logout support
- Rate limiting on all endpoints
- Event system for authentication lifecycle

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- Persistent session driver (redis, database, file)

## Installation

```bash
composer require admin9/laravel-oidc-client
php artisan vendor:publish --tag="oidc-client-config"
php artisan vendor:publish --tag="oidc-client-migrations"
php artisan migrate
```

## Configuration

Add to `.env`:

```env
OIDC_AUTH_SERVER_HOST=https://auth.example.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=http://localhost:8000/auth/callback
```

Update `app/Models/User.php`:

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'oidc_sub',
    'auth_server_refresh_token',
];

protected $hidden = [
    'password',
    'remember_token',
    'auth_server_refresh_token',
];

protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'auth_server_refresh_token' => 'encrypted',
    ];
}
```

## Usage

### Routes

The package registers these routes:

| Method | URI | Description |
|--------|-----|-------------|
| GET | `/auth/redirect` | Start OIDC flow |
| GET | `/auth/callback` | Handle callback, create session, redirect |

### How It Works

1. User visits `/auth/redirect` — redirected to your OIDC provider
2. After authentication, the provider redirects back to `/auth/callback`
3. The package exchanges the authorization code for tokens, fetches user info, and creates/updates the local user
4. The configured `OidcAuthenticator` handles login (default: web session guard) and returns a response

### Authentication Flow

```
Browser                    Your App                   OIDC Provider
  │                          │                            │
  ├── GET /auth/redirect ──→ │                            │
  │                          ├── Generate state + PKCE    │
  │                          ├── Store in session         │
  │  ←── 302 Redirect ──────┤                            │
  ├──────────────────────────────── Authorization ──────→ │
  │                          │                            ├── User authenticates
  │  ←───────────────────────────── 302 + code ──────────┤
  ├── GET /auth/callback ──→ │                            │
  │                          ├── Validate state           │
  │                          ├── Exchange code → tokens ─→│
  │                          │←── access_token ───────────┤
  │                          ├── Fetch userinfo ─────────→│
  │                          │←── user claims ────────────┤
  │                          ├── Find/create local user   │
  │                          ├── OidcAuthenticator        │
  │  ←── Response ───────────┤                            │
```

### Login Link

```html
<a href="/auth/redirect">Login with SSO</a>
```

### Handling Errors

Authentication errors are flashed to the session:

```php
@if (session('oidc_error'))
    <div class="alert alert-danger">
        Authentication failed: {{ session('oidc_error_description') }}
    </div>
@endif
```

### Logout

Create a logout controller using `OidcService`:

```php
use Admin9\OidcClient\Services\OidcService;

public function logout(Request $request, OidcService $oidcService)
{
    $user = $request->user();
    $oidcService->revokeAuthServerToken($user);

    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    if ($oidcService->isOidcUser($user)) {
        return redirect($oidcService->getSsoLogoutUrl());
    }

    return redirect('/');
}
```

### Custom Authenticator

By default, the package uses `SessionAuthenticator` which logs in via Laravel's web guard. For SPA/JWT scenarios, implement the `OidcAuthenticator` interface:

```php
use Admin9\OidcClient\Contracts\OidcAuthenticator;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticator implements OidcAuthenticator
{
    public function authenticate(Request $request, mixed $user, array $tokens, array $userInfo): Response
    {
        $jwt = /* generate your JWT */;
        return response()->json(['token' => $jwt]);
    }
}
```

Register it in `config/oidc-client.php`:

```php
'authenticator' => \App\Services\JwtAuthenticator::class,
```

### Events

The package dispatches two events during the authentication lifecycle:

| Event | Properties | When |
|-------|-----------|------|
| `OidcUserAuthenticated` | `$user`, `$userInfo`, `$isNewUser` | After successful authentication |
| `OidcAuthFailed` | `$errorCode`, `$errorMessage` | When authentication fails |

Example listener:

```php
// app/Listeners/LogOidcLogin.php
use Admin9\OidcClient\Events\OidcUserAuthenticated;

class LogOidcLogin
{
    public function handle(OidcUserAuthenticated $event): void
    {
        logger()->info('OIDC login', [
            'user_id' => $event->user->getKey(),
            'new' => $event->isNewUser,
        ]);
    }
}
```

### Optional Configuration

```env
OIDC_REDIRECT_URL=/dashboard              # Where to redirect after login (default: /dashboard)
OIDC_POST_LOGOUT_REDIRECT_URL=/           # Where Auth Server redirects after SSO logout (default: /)
```

## Documentation

- [Configuration](docs/configuration.md) - All config options and environment variables
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## License

MIT
