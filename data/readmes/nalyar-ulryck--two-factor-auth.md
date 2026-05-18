# Two Factor Authentication Package for Laravel

A Laravel package that provides Two Factor Authentication (2FA) using TOTP (Time-based One-Time Password) with Google Authenticator–compatible apps. It supports both **Blade (monolith)** and **API** stacks.

## Features

- **TOTP 2FA** — Generate and validate one-time codes via [Google2FA](https://github.com/antonioribeiro/google2fa).
- **QR Code** — Display QR codes for easy setup in authenticator apps (e.g. Google Authenticator).
- **Enable & verify** — Flow to enable 2FA for users and verify codes on login.
- **Middleware** — Protect routes so that 2FA is required after login.
- **Dual stack** — Install either Blade views (monolith) or API-only resources via `2fa:install`.
- **Configurable** — Redirect after verification and other options in `config/twofactor.php`.
- **Migrations** — Adds `google2fa_secret` to the `users` table.

## Requirements

- PHP ^8.1
- Laravel ^10.10
- [pragmarx/google2fa-laravel](https://github.com/antonioribeiro/google2fa-laravel) ^2.2
- [bacon/bacon-qr-code](https://github.com/Bacon/BaconQrCode) ^3.0

## Installation

### 1. Require the package

Add the package path to your project's `composer.json`:

```json
"repositories": [
    {
        "type": "path",
        "url": "./packages/NalyarUlryck/two-factor-auth"
    }
]
```

Then install:

```bash
composer require nalyar-ulryck/two-factor-auth
```

### 2. Publish configuration (optional)

To customize redirects and other options:

```bash
php artisan vendor:publish --tag=config
```

Edit `config/twofactor.php` as needed (e.g. `redirect_after_verify2fa`).

### 3. Run migrations

Add the `google2fa_secret` column to your `users` table:

```bash
php artisan migrate
```

### 4. Install the 2FA stack

Choose either Blade (full UI) or API-only:

```bash
# Blade stack (views, routes, middleware wiring)
php artisan 2fa:install blade

# API-only stack
php artisan 2fa:install api
```

Follow the on-screen instructions to add the middleware to the routes you want to protect.

## Configuration

| Key | Description |
|-----|-------------|
| `routes.redirect_after_verify2fa` | Route name to redirect to after successful 2FA verification (default: `home`). |

Config file: `config/twofactor.php` (after publishing).

## Usage

### Protecting routes

Apply the `twofactor` middleware to routes that require 2FA:

```php
Route::middleware(['auth', 'twofactor'])->group(function () {
    Route::get('/dashboard', ...)->name('home');
    // ...
});
```

- If the user has no `google2fa_secret`, they are shown the **enable 2FA** flow (or API response).
- If they have a secret but haven’t verified in this session, they are shown the **verify 2FA** page (or API response).
- After successful verification, `2fa_authenticated` is set in the session and they can access protected routes.

### Package routes (under `twofactor` prefix)

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET | `/twofactor/enable-2fa` | `enable2fa` | Get QR code / enable 2FA |
| POST | `/twofactor/verify-2fa` | `verify2fa` | Verify OTP (enable or login) |
| GET | `/twofactor/verify-2fa` | `verify-2fa` | Show verify 2FA page |
| POST | `/twofactor/back-login` | `back-login` | Logout and redirect to login |

All are under `web` and `auth` middleware.

### User model

Ensure your `User` model has a nullable `google2fa_secret` column (added by the package migration). No trait is required; the package uses `Auth::user()` and `User::find($id)`.

## License

MIT. See [LICENSE](LICENSE) if present.

## Author

**Nalyar Ulryck** — [raylanzeeroo@outlook.com](mailto:raylanzeeroo@outlook.com)
