# Laravel cPanel Hosting

Laravel package for secure shared-hosting deployment endpoints and cPanel-friendly root hosting setup.

## Features

- Secure deploy endpoints with token or webhook signature validation
- Configurable deployment pipeline (`/deploy`)
- `.env` sync with optional backup and required-key validation
- Storage link fallback (`symlink` -> recursive copy)
- Installer command for config + root `index.php` and `.htaccess` stubs
- Dedicated deploy logging channel
- Optional MySQL legacy index-length compatibility

## Installation

```bash
composer require awaisjameel/laravel-cpanel-hosting
```

Run installer:

```bash
php artisan cpanel-hosting:install
```

## Configuration

Publish config manually if needed:

```bash
php artisan vendor:publish --tag="cpanel-hosting-config"
```

Key env values:

```dotenv
CPANEL_DEPLOY_ENABLED=false
CPANEL_DEPLOY_TOKEN=
CPANEL_DEPLOY_WEBHOOK_SECRET=
CPANEL_DEPLOY_PREFIX=deploy
CPANEL_DEPLOY_ALLOWED_IPS=
CPANEL_DEPLOY_LOG_CHANNEL=deploy
```

## Endpoints

When enabled, routes are exposed under `CPANEL_DEPLOY_PREFIX` (default `deploy`):

- `GET /deploy` full pipeline
- `GET /deploy/sync-env`
- `GET /deploy/clear`
- `GET /deploy/migrate`
- `GET /deploy/migrate-fresh`
- `GET /deploy/cache`
- `GET /deploy/queue-restart`
- `GET /deploy/storage-link`
- `GET /deploy/maintenance-down`
- `GET /deploy/maintenance-up`
- `GET /deploy/optimize`
- `GET /deploy/health`

Authentication:

- `X-Deploy-Token: {token}` header (preferred)
- `?token={token}` query parameter
- `X-Hub-Signature-256` / `X-Gitlab-Token` webhook verification when configured

## Security Notes

- Keep `CPANEL_DEPLOY_TOKEN` secret and rotate on exposure.
- Prefer header token over query token.
- Restrict with `CPANEL_DEPLOY_ALLOWED_IPS` when possible.
- Do not expose deploy routes with `APP_DEBUG=true`.
- `migrate-fresh` is destructive.

## Testing

```bash
composer test
```
