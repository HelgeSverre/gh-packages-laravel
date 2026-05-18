# itsme® Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/martin-lechene/itsme-laravel.svg?style=flat-square)](https://packagist.org/packages/martin-lechene/itsme-laravel)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue.svg?style=flat-square)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12%20%7C%2013-red.svg?style=flat-square)](https://laravel.com)
[![Tests](https://img.shields.io/github/actions/workflow/status/martin-lechene/itsme-laravel/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/martin-lechene/itsme-laravel/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

A Laravel package for authenticating users via **itsme®** — Belgium's digital identity solution — using the **OpenID Connect 1.0** protocol.

> **Note:** This is a community package and is not officially maintained by itsme®. It is based on itsme®'s public OpenID Connect documentation.

---

## Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
  - [Add the itsme® button](#add-the-itsme-button)
  - [Routes](#routes)
  - [Facade](#facade)
  - [Middleware](#middleware)
  - [Events](#events)
  - [Artisan command](#artisan-command)
- [User data mapping](#-user-data-mapping)
- [Customization](#-customization)
  - [Customize the button](#customize-the-button)
  - [Override views](#override-views)
  - [Override translations](#override-translations)
  - [Customize user creation](#customize-user-creation)
- [Security](#-security)
- [Testing](#-testing)
- [Upgrade guide](#-upgrade-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Details |
|---|---|
| OpenID Connect 1.0 | Full OIDC authorization code flow |
| PKCE | Proof Key for Code Exchange (enabled by default) |
| JWT validation | Signature, expiration, audience, issuer, nonce |
| JWKS | Automatic public key retrieval from the JWKS endpoint |
| Auto-discovery | OpenID configuration discovered from the well-known endpoint |
| User management | Create or update users from itsme® claims on every login |
| Events | `ItsmeUserCreated`, `ItsmeUserAuthenticated`, `ItsmeAuthenticationFailed` |
| Middleware | `itsme.auth` — protect routes requiring itsme® authentication |
| Blade components | Ready-to-use itsme® button (3 sizes, customizable) |
| i18n | English and French translations included |
| Artisan | `php artisan itsme:test-config` — diagnose your configuration |
| Laravel 12 & 13 | Compatible with both versions |
| PHP 8.2+ | Requires PHP 8.2, 8.3, or 8.4 |

---

## 📋 Requirements

| Requirement | Version |
|---|---|
| PHP | `^8.2` |
| Laravel | `^12.0` or `^13.0` |
| GuzzleHTTP | `^7.0` |
| firebase/php-jwt | `^7.0` |

---

## 📦 Installation

### Step 1 — Install via Composer

```bash
composer require martin-lechene/itsme-laravel
```

The service provider and `Itsme` facade are registered automatically via Laravel's package auto-discovery.

### Step 2 — Publish the configuration

```bash
php artisan vendor:publish --tag=itsme-config
```

This creates `config/itsme.php`.

### Step 3 — Publish and run the migration

```bash
php artisan vendor:publish --tag=itsme-migrations
php artisan migrate
```

This adds an `itsme_id` column to your `users` table.

### Step 4 (optional) — Publish views

```bash
php artisan vendor:publish --tag=itsme-views
```

Publishes Blade views to `resources/views/vendor/itsme/`.

### Step 5 (optional) — Publish language files

```bash
php artisan vendor:publish --tag=itsme-lang
```

Publishes translations to `lang/vendor/itsme/`.

---

## ⚙️ Configuration

### Environment variables

Add the following to your `.env` file:

```dotenv
# ── Required ──────────────────────────────────────────────────────────────────
ITSME_CLIENT_ID=your_client_id
ITSME_CLIENT_SECRET=your_client_secret
ITSME_REDIRECT_URI=https://your-app.com/itsme/callback

# ── Environment ───────────────────────────────────────────────────────────────
# 'sandbox' (default) for development, 'production' for live
ITSME_ENVIRONMENT=sandbox

# ── Security (recommended: leave at defaults in production) ───────────────────
ITSME_USE_PKCE=true
ITSME_VERIFY_TOKEN=true
```

### config/itsme.php reference

```php
return [
    // OAuth 2.0 credentials
    'client_id'     => env('ITSME_CLIENT_ID'),
    'client_secret' => env('ITSME_CLIENT_SECRET'),
    'redirect'      => env('ITSME_REDIRECT_URI', '/itsme/callback'),

    // Environment: 'sandbox' or 'production'
    'environment'   => env('ITSME_ENVIRONMENT', 'sandbox'),

    // OpenID scopes to request
    'scopes'        => ['openid', 'profile', 'email', 'phone'],

    // PKCE (recommended)
    'use_pkce'                => env('ITSME_USE_PKCE', true),

    // JWT signature verification (always keep true in production)
    'verify_token_signature'  => env('ITSME_VERIFY_TOKEN', true),

    // Override discovery/issuer per environment (auto-configured by default)
    'environments' => [
        'sandbox' => [
            'discovery_url' => 'https://idp.sandbox.itsme.be/.well-known/openid-configuration',
            'issuer'        => 'https://idp.sandbox.itsme.be',
        ],
        'production' => [
            'discovery_url' => 'https://idp.itsme.be/.well-known/openid-configuration',
            'issuer'        => 'https://idp.itsme.be',
        ],
    ],
];
```

### itsme® portal setup

1. Sign up at the [itsme® developer portal](https://www.itsme-id.com/en-BE/business/developer)
2. Create an application and note your **Client ID** and **Client Secret**
3. Register your redirect URI (e.g. `https://your-app.com/itsme/callback`)
4. Test with the **sandbox** environment before going live

---

## 🚀 Usage

### Add the itsme® button

Include the Blade partial anywhere in your login view:

```blade
{{-- resources/views/auth/login.blade.php --}}

@include('itsme::itsme-button')
```

Or with custom options:

```blade
@include('itsme::itsme-button', [
    'text'  => __('itsme::itsme.button_text'),
    'size'  => 'large',   // 'small' | 'default' | 'large'
    'class' => 'mt-4 w-full',
])
```

### Routes

The package automatically registers two routes under the `web` middleware group:

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| `GET` | `/itsme/redirect` | `itsme.redirect` | Builds the authorization URL and redirects the user to itsme® |
| `GET` | `/itsme/callback` | `itsme.callback` | Handles the itsme® callback, creates/updates the user, and logs them in |

Link directly to the redirect route:

```blade
<a href="{{ route('itsme.redirect') }}">Sign in with itsme®</a>
```

### Facade

Use the `Itsme` facade when you need programmatic control:

```php
use ItsmeLaravel\Itsme\Facades\Itsme;

// Build the authorization URL (stores state/nonce in the session)
$url = Itsme::getAuthorizationUrl();
return redirect($url);

// Process the callback and get the merged ID token + UserInfo claims
$userInfo = Itsme::handleCallback($request);
// $userInfo['sub'], $userInfo['email'], $userInfo['given_name'], …
```

### Middleware

The package registers an `itsme.auth` middleware alias that protects routes requiring itsme® authentication. A logged-in user who authenticated via a different method will be logged out and redirected.

**Route-level protection:**

```php
// routes/web.php
Route::middleware(['auth', 'itsme.auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class);
});
```

**Controller-level protection:**

```php
class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'itsme.auth']);
    }
}
```

### Events

Listen to itsme® events anywhere in your application (e.g. in `EventServiceProvider` or via `#[AsEventListener]`):

#### `ItsmeUserCreated`

Fired when a **new** user is created via itsme®.

```php
use ItsmeLaravel\Itsme\Events\ItsmeUserCreated;

// Closure listener
Event::listen(ItsmeUserCreated::class, function (ItsmeUserCreated $event) {
    $event->user;     // Eloquent user model instance
    $event->userInfo; // Raw array of OIDC claims from itsme®
    
    // e.g. send a welcome email
    Mail::to($event->user)->send(new WelcomeMail());
});
```

```php
// Dedicated listener class
class SendWelcomeMail
{
    public function handle(ItsmeUserCreated $event): void
    {
        Mail::to($event->user)->send(new WelcomeMail());
    }
}
```

#### `ItsmeUserAuthenticated`

Fired on **every** successful login (new and returning users).

```php
use ItsmeLaravel\Itsme\Events\ItsmeUserAuthenticated;

Event::listen(ItsmeUserAuthenticated::class, function (ItsmeUserAuthenticated $event) {
    $event->user;     // Eloquent user model instance
    $event->userInfo; // Raw OIDC claims array

    // e.g. log the login
    \Log::info('itsme login', ['user_id' => $event->user->id]);
});
```

#### `ItsmeAuthenticationFailed`

Fired when authentication fails (invalid token, user denied, etc.).

```php
use ItsmeLaravel\Itsme\Events\ItsmeAuthenticationFailed;

Event::listen(ItsmeAuthenticationFailed::class, function (ItsmeAuthenticationFailed $event) {
    $event->error;            // string: error code or message
    $event->errorDescription; // string|null: human-readable description
});
```

### Artisan command

Diagnose your itsme® configuration and network connectivity:

```bash
php artisan itsme:test-config
```

Example output:

```
Testing Itsme Configuration...

Checking configuration...
  ✅ Client ID: your_client_id
  ✅ Client Secret: ***
  ✅ Redirect URI: https://your-app.com/itsme/callback
  ✅ Environment: sandbox
  ✅ Use PKCE: Yes
  ✅ Verify Token: Yes

Testing OpenID Connect discovery...
  ✅ Discovery successful
  ✅ Authorization endpoint: https://idp.sandbox.itsme.be/...
  ✅ Token endpoint: https://idp.sandbox.itsme.be/...
  ✅ UserInfo endpoint: https://idp.sandbox.itsme.be/...

✅ Configuration test completed!
```

---

## 📋 User data mapping

The package automatically maps itsme® OIDC claims to your User model on every login:

| itsme® claim | User model field | Notes |
|---|---|---|
| `sub` | `itsme_id` | Unique identifier — always present |
| `email` | `email` | May be absent if scope not requested |
| `email_verified` | `email_verified_at` | Set to `now()` when `true` |
| `given_name` | `first_name` | Part of the `profile` scope |
| `family_name` | `last_name` | Part of the `profile` scope |
| `name` | `name` | Full name; composed from given+family if absent |
| `phone_number` | `phone` | Part of the `phone` scope |

> The package silently skips fields that don't exist on your User model. Add columns to your users table (or publish and modify the migration) for any fields you want to persist.

---

## 🎨 Customization

### Customize the button

```blade
@include('itsme::itsme-button', [
    'text'  => 'Log in with itsme®',
    'size'  => 'large',          // 'small' | 'default' | 'large'
    'class' => 'my-custom-class',
])
```

Size reference:

| Size | Padding | Font size |
|------|---------|-----------|
| `small` | `8px 16px` | `14px` |
| `default` | `12px 24px` | `16px` |
| `large` | `16px 32px` | `18px` |

### Override views

After publishing views, edit them in `resources/views/vendor/itsme/`:

```
resources/views/vendor/itsme/
├── itsme-button.blade.php   ← The itsme® button
└── itsme-error.blade.php    ← Error display component
```

### Override translations

After publishing language files, edit them in `lang/vendor/itsme/`:

```
lang/vendor/itsme/
├── en/itsme.php
└── fr/itsme.php
```

The package automatically uses your application's locale (`config/app.php` → `locale`).

### Customize user creation

Listen to `ItsmeUserCreated` to run custom logic after a user is created (roles, notifications, etc.):

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    \ItsmeLaravel\Itsme\Events\ItsmeUserCreated::class => [
        \App\Listeners\AssignDefaultRole::class,
        \App\Listeners\SendWelcomeMail::class,
    ],
    \ItsmeLaravel\Itsme\Events\ItsmeUserAuthenticated::class => [
        \App\Listeners\UpdateLastLogin::class,
    ],
];
```

If you need to change **how** users are created/updated, you can extend `ItsmeController` and override the `createOrUpdateUser()` method, then update the route file:

```php
// app/Http/Controllers/MyItsmeController.php
use ItsmeLaravel\Itsme\Controllers\ItsmeController;

class MyItsmeController extends ItsmeController
{
    protected function createOrUpdateUser(array $userInfo)
    {
        return \App\Models\User::updateOrCreate(
            ['itsme_id' => $userInfo['sub']],
            [
                'name'  => $userInfo['name'] ?? 'Unknown',
                'email' => $userInfo['email'] ?? null,
                // add any extra fields you need
            ]
        );
    }
}
```

```php
// routes/web.php (or a service provider)
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MyItsmeController;

Route::get('/itsme/callback', [MyItsmeController::class, 'callback'])
     ->name('itsme.callback');
```

---

## 🔒 Security

The package implements all recommended OpenID Connect security measures:

| Measure | Description |
|---|---|
| **State** | A random per-request value stored in the session and verified in the callback to prevent CSRF attacks |
| **Nonce** | A random per-request value embedded in the ID token claim and verified on receipt to prevent replay attacks |
| **PKCE** | Proof Key for Code Exchange (S256 method) prevents authorization code interception attacks |
| **JWT signature** | The ID token signature is verified using the public keys from itsme®'s JWKS endpoint |
| **Token expiration** | The `exp` claim is verified against the current time |
| **Audience** | The `aud` claim is verified against your configured `client_id` |
| **Issuer** | The `iss` claim is verified against the expected issuer for your environment |

> **Production checklist**
> - Set `ITSME_ENVIRONMENT=production`
> - Set `ITSME_USE_PKCE=true` (default)
> - Set `ITSME_VERIFY_TOKEN=true` (default)
> - Ensure `ITSME_REDIRECT_URI` uses `https://`
> - Register **only** your production redirect URI in the itsme® portal

---

## 🧪 Testing

### Run the test suite

```bash
composer test
```

### Run with coverage

```bash
composer test-coverage
# HTML report generated in ./coverage/
```

### Static analysis

```bash
composer analyse
```

### Code style check

```bash
composer format -- --dry-run --diff
```

### In your own application

Use Laravel's `Http::fake()` to mock itsme® responses in your feature tests:

```php
use Illuminate\Support\Facades\Http;

Http::fake([
    '*/token'    => Http::response([
        'access_token' => 'fake_access_token',
        'id_token'     => $this->buildFakeIdToken(),
        'token_type'   => 'Bearer',
    ]),
    '*/userinfo' => Http::response([
        'sub'         => 'user-sub-123',
        'email'       => 'user@example.com',
        'given_name'  => 'Jane',
        'family_name' => 'Doe',
    ]),
]);

$response = $this->get('/itsme/callback?code=fake_code&state=' . session('itsme.state'));
$response->assertRedirect('/');
```

---

## 🔄 Upgrade guide

### From 1.0.x to 1.1.x

1. Run `composer update martin-lechene/itsme-laravel`
2. **Middleware alias registered**: The `itsme.auth` middleware alias is now automatically registered. If you previously registered it manually, remove the duplicate.
3. **Translation key added**: `itsme.errors.itsme_auth_required` has been added to both `en` and `fr` files. If you have published language files, add this key manually:
   - **EN**: `'itsme_auth_required' => 'This page requires authentication via Itsme.'`
   - **FR**: `'itsme_auth_required' => 'Cette page nécessite une authentification via Itsme.'`
4. **`laravel/socialite` removed** from dependencies — no action needed if your app uses it directly (it will remain in your own `composer.json`).

---

## 🗂 Project structure

```
martin-lechene/itsme-laravel/
├── config/
│   └── itsme.php                         ← Package configuration
├── database/migrations/
│   └── 2024_01_01_…_add_itsme_fields.php ← Adds itsme_id to users table
├── resources/
│   ├── lang/
│   │   ├── en/itsme.php                  ← English translations
│   │   └── fr/itsme.php                  ← French translations
│   └── views/
│       ├── itsme-button.blade.php        ← itsme® button component
│       └── itsme-error.blade.php         ← Error display component
├── routes/
│   └── web.php                           ← /itsme/redirect + /itsme/callback
└── src/
    ├── Console/Commands/
    │   └── TestItsmeConfig.php           ← php artisan itsme:test-config
    ├── Controllers/
    │   └── ItsmeController.php           ← Handles redirect + callback
    ├── Events/
    │   ├── ItsmeAuthenticationFailed.php
    │   ├── ItsmeUserAuthenticated.php
    │   └── ItsmeUserCreated.php
    ├── Exceptions/
    │   ├── AuthenticationFailedException.php
    │   ├── ConfigurationException.php
    │   ├── InvalidStateException.php
    │   ├── InvalidTokenException.php
    │   └── ItsmeException.php
    ├── Facades/
    │   └── Itsme.php                     ← Itsme facade
    ├── Middleware/
    │   └── RequireItsmeAuth.php          ← itsme.auth middleware
    ├── Services/
    │   ├── ItsmeService.php              ← Core OIDC flow
    │   ├── OpenIdDiscovery.php           ← Discovery + caching
    │   └── TokenValidator.php            ← JWT validation
    └── ItsmeServiceProvider.php
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for your changes
4. Make sure all tests pass: `composer test`
5. Check code style: `composer format -- --dry-run --diff`
6. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

---

## 📄 License

This package is open-source software licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [itsme®](https://www.itsme-id.com/) for their Belgian digital identity service
- [Laravel](https://laravel.com/) for the framework
- [firebase/php-jwt](https://github.com/firebase/php-jwt) for JWT handling
