# Auth

[![codecov](https://codecov.io/gh/patrikjak/auth/graph/badge.svg?token=A13B5F9FMZ)](https://codecov.io/gh/patrikjak/auth)

Simple auth package for Laravel apps. Requires `patrikjak/utils`.

## Installation

```bash
composer require patrikjak/auth
```

## Setup

Register both service providers in `bootstrap/providers.php`:

```php
use Patrikjak\Auth\AuthServiceProvider;
use Patrikjak\Utils\UtilsServiceProvider;

return [
    // ...
    UtilsServiceProvider::class,
    AuthServiceProvider::class,
];
```

Run the install command to publish all assets, config, migrations, and translations, remove default Laravel auth migrations, run fresh migrations, and seed default roles:

```bash
php artisan install:pjauth
```

Or publish individually:

```bash
php artisan vendor:publish --tag="pjauth-assets" --force
php artisan vendor:publish --tag="pjauth-config"
php artisan vendor:publish --tag="pjauth-migrations" --force
php artisan vendor:publish --tag="pjauth-translations" --force
php artisan vendor:publish --tag="pjauth-views" --force   # optional
```

To keep config up to date on every `composer update`, add to your `composer.json`:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan vendor:publish --tag=pjauth-config --force"
    ]
}
```

> Laravel cannot merge multidimensional arrays in config files, so the config must be re-published after updates.

## Configuration

All options live in `config/pjauth.php`.

### Custom User model

```env
AUTH_MODEL=App\Models\User
```

Default is `Patrikjak\Auth\Models\User`.

### Custom repository

```php
// config/pjauth.php
'repositories' => [
    'user' => \App\Repositories\UserRepository::class,
],
```

The custom implementation must implement `Patrikjak\Auth\Repositories\Interfaces\UserRepository`.

### Redirects

```php
'redirect_after_login'  => env('REDIRECT_AFTER_LOGIN', '/dashboard'),
'redirect_after_logout' => env('REDIRECT_AFTER_LOGOUT', '/'),
```

### Feature flags

All features are enabled by default except `register_via_invitation`:

```php
'features' => [
    'register'                => true,
    'login'                   => true,
    'password_reset'          => true,
    'change_password'         => true,
    'register_via_invitation' => false,
],
```

Routes are only registered when their respective feature is enabled.

## Routes

Web routes use `['web', 'guest']` middleware. API routes use `['web', 'guest']` for unauthenticated endpoints and `['web', 'auth']` for authenticated ones.

### Middleware

Use `VerifyRole` to protect routes by role:

```php
use Patrikjak\Auth\Http\Middlewares\VerifyRole;

Route::middleware(['web', 'auth', VerifyRole::withRole('admin')]);
```

Super admins pass all role checks.

## Roles

Default roles are defined in `config/pjauth.php` under `default_roles`. Use `pjauth:sync-roles` to seed them — see [Artisan Commands](#artisan-commands).

## Artisan Commands

### Sync roles

```bash
php artisan pjauth:sync-roles
```

Seeds roles from `pjauth.default_roles` config into the database (uses `firstOrCreate` — safe to re-run).

### Create users interactively

```bash
php artisan pjauth:create-users
```

Prompts for name, email, password, and role. Loops until you decline to add another user.

### Send register invite

```bash
php artisan pjauth:send-invite user@example.com
# or pass a role ID directly:
php artisan pjauth:send-invite user@example.com --role=<role-id>
```

If `--role` is not provided, available roles are listed and you are prompted to choose.

## Socialite (Google)

Enable in config (enabled by default) and add credentials:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Add to `config/services.php`:

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => sprintf('%s/auth/google/callback', env('APP_URL')),
],
```

## Register via Invitation

Enable the feature flag:

```php
'features' => [
    'register_via_invitation' => true,
],
```

When enabled, the invitation routes are registered. Google social login on the login screen remains available so existing users can still sign in via Google — only the "sign up with Google" button on the register screen is hidden, and Google OAuth cannot be used to create a new account.

Send an invite from the command line — see [Artisan Commands](#artisan-commands).

The invite email contains a tokenised link to `GET /register/{token}?email=...`. On submission it calls `POST /api/invite/register`.

## Change Password

Enable the feature flag (enabled by default):

```php
'features' => [
    'change_password' => true,
],
```

Call the authenticated endpoint:

```
PATCH api/change-password
```

Request body:

```json
{
    "current_password": "current_password",
    "password": "new_password",
    "password_confirmation": "new_password"
}
```

Old password validation is on by default. To skip it (e.g. admin resetting another user's password):

```json
{
    "password": "new_password",
    "password_confirmation": "new_password",
    "validate_current_password": false
}
```

## reCAPTCHA

Enabled by default on register, login, and password reset API endpoints. Disable globally:

```php
'recaptcha' => [
    'enabled' => false,
],
```

Or provide the keys:

```env
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```
