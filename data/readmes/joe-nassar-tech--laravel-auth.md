# joe-404/laravel-auth

A drop-in, config-driven authentication library for Laravel 13. Install one package, run one command, and your app has registration, email verification, login, token refresh, password reset, session management, Google OAuth, API tokens, and a full account-status workflow — all through a uniform JSON API with no frontend coupling.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/joe-404/laravel-auth.svg?style=flat-square)](https://packagist.org/packages/joe-404/laravel-auth)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue?style=flat-square)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12%2B%20%7C%2013%2B-red?style=flat-square)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | `^8.2` |
| Laravel | `^12.0` or `^13.0` |
| Laravel Sanctum | `^4.0` (installed automatically) |
| Laravel Socialite | `^5.0` (installed automatically) |
| Spatie Permission | `^6.0` (installed automatically) |
| Redis | phpredis or predis (recommended) |

---

## Installation

```bash
composer require joe-404/laravel-auth
php artisan auth:install
```

Add the required traits to `app/Models/User.php`:

```php
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;        // required for account deletion
use Joe404\LaravelAuth\Concerns\HasAccountStatus;    // optional helper trait

class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable, SoftDeletes, HasAccountStatus;
}
```

Set the minimum environment variables:

```env
AUTH_MODE=both
AUTH_VERIFICATION_METHOD=both
MAIL_MAILER=smtp
MAIL_FROM_ADDRESS=hello@yourapp.com
```

> Full install walkthrough, manual install steps, and troubleshooting: **[docs/installation.md](docs/installation.md)**

---

## Quick Start

Three-step registration, then login:

```bash
# Step 1 — Submit email, receive OTP + magic link
curl -sX POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
# → { "data": { "temp_token": "uuid", "method": "both", "expires_in": 10 } }

# Step 2 — Verify with OTP code from email
curl -sX POST http://localhost/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"482910"}'
# → { "data": { "completion_token": "uuid" } }

# Step 3 — Set password and create account
curl -sX POST http://localhost/auth/register/complete \
  -H "Content-Type: application/json" \
  -d '{"completion_token":"uuid","password":"Secret123!","password_confirmation":"Secret123!"}'
# → { "data": { "user": {...}, "token": "1|abc...", "refresh_token": "xyz..." } }

# Login
curl -sX POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123!"}'
# → { "data": { "user": {...}, "token": "...", "refresh_token": "..." } }
```

Every response uses the same envelope:

```json
{ "success": true,  "message": "...", "data":   { } }
{ "success": false, "message": "...", "errors": { } }
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Initiate registration (send OTP / magic link) |
| `POST` | `/auth/register/verify-otp` | — | Verify OTP → receive `completion_token` |
| `GET`  | `/auth/register/verify-magic/{token}` | — | Verify magic link → receive `completion_token` |
| `POST` | `/auth/register/complete` | — | Set password and create user |
| `POST` | `/auth/email/resend-verification` | — | Resend OTP / magic link |
| `POST` | `/auth/login` | — | Login (password) |
| `POST` | `/auth/logout` | ✓ | Revoke current session |
| `POST` | `/auth/logout/all` | ✓ | Revoke all sessions |
| `GET`  | `/auth/me` | ✓ | Current user + roles |
| `POST` | `/auth/token/refresh` | — | Rotate refresh token |
| `POST` | `/auth/password/forgot` | — | Request password reset |
| `POST` | `/auth/password/reset/verify-otp` | — | Verify reset OTP → `reset_token` |
| `GET`  | `/auth/password/reset/magic/{token}` | — | Verify reset magic link → `reset_token` |
| `POST` | `/auth/password/reset/confirm` | — | Set new password (auto-login) |
| `POST` | `/auth/password/change` | ✓ | Change password (authenticated) |
| `GET`  | `/auth/sessions` | ✓ | List sessions |
| `DELETE` | `/auth/sessions/{id}` | ✓ | Revoke a session |
| `GET`  | `/auth/social/google/redirect` | — | Google OAuth redirect |
| `GET`  | `/auth/social/google/callback` | — | Google OAuth callback |
| `GET`  | `/auth/social/{provider}/link/confirm/{token}` | — | Confirm social account link |
| `GET`  | `/auth/api-tokens` | ✓ | List your API tokens |
| `POST` | `/auth/api-tokens` | ✓ | Create an API token |
| `DELETE` | `/auth/api-tokens/{id}` | ✓ | Revoke an API token |
| `GET`  | `/auth/admin/api-tokens` | admin | List all API tokens |
| `POST` | `/auth/admin/api-tokens` | admin | Create a system token |
| `PATCH` | `/auth/admin/api-tokens/{id}` | admin | Update a token |
| `DELETE` | `/auth/admin/api-tokens/{id}` | admin | Revoke any token |
| `GET`  | `/auth/admin/users/{id}/status` | admin | Get user status |
| `POST` | `/auth/admin/users/{id}/status` | admin | Change user status (suspend / disable / restore) |
| `GET`  | `/auth/admin/users/{id}/status/history` | admin | Status audit log |
| `POST` | `/auth/admin/users/{id}/notes` | admin | Add admin note |
| `POST` | `/auth/account/deactivate` | ✓ | Self-pause account |
| `DELETE` | `/auth/account` | ✓ | Self-delete account (30-day grace) |

> Routes are mounted at `/auth` by default. Set `routes.prefix` in `config/auth_system.php` to change (e.g. `api/v1/auth`).

---

## Documentation

| Document | What it covers |
|---|---|
| [Installation](docs/installation.md) | Setup, `auth:install`, manual install, troubleshooting |
| [Configuration](docs/configuration.md) | Every config key and `.env` variable |
| [Customization](docs/customization.md) | Extra fields, transformers, referral codes, OTP channel, response format, email templates, all 6 contracts |
| [Events](docs/events.md) | All lifecycle events, payloads, listeners, queueing |
| [Localization](docs/localization.md) | Multi-language messages, translation files, all message keys |
| [Account Status](docs/account-status.md) | Status workflow, `auth.active` middleware, timed bans, audit log |
| [Account Deletion](docs/account-deletion.md) | Self-delete, grace period, auto-restore, purge worker |
| [Upgrading](docs/upgrading.md) | Version changelog, breaking changes, outdated versions |
| [AI Context](docs/AI_Context.md) | Full repo snapshot for AI assistants |

---

## License

MIT. See [LICENSE](LICENSE).
