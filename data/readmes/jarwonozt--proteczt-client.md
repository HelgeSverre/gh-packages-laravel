# Proteczt Client

[![Packagist Version](https://img.shields.io/packagist/v/tecnozt/proteczt-client)](https://packagist.org/packages/tecnozt/proteczt-client)
[![PHP Version](https://img.shields.io/packagist/php-v/tecnozt/proteczt-client)](https://packagist.org/packages/tecnozt/proteczt-client)
[![License](https://img.shields.io/packagist/l/tecnozt/proteczt-client)](LICENSE)

Laravel client package for [Proteczt](https://github.com/tecnozt/proteczt) — a remote license management system. Install this package in your distributed Laravel applications to control access from a central Proteczt server.

----

## Requirements

| Dependency | Version |
|-----------|---------|
| PHP | ^8.2 |
| Laravel | ^11.0 or ^12.0 |

---

## Installation

```bash
composer require tecnozt/proteczt-client
```

Laravel auto-discovery registers the service provider automatically. No manual registration needed.

---

## Configuration

### 1. Publish the config file

```bash
php artisan vendor:publish --tag=proteczt-config
```

This creates `config/proteczt.php` in your application.

### 2. Add environment variables to `.env`

```env
PROTECZT_API_URL=https://your-proteczt-server.com
PROTECZT_API_TOKEN=your-api-token-here
PROTECZT_DOMAIN=your-app-domain.com   # Optional — auto-detected if omitted

# Optional tuning
PROTECZT_AUTO_REGISTER=true
PROTECZT_SKIP_LOCAL=true
PROTECZT_CACHE_DURATION=0        # 0 = real-time (check every request), 60-300 = reduce API load
PROTECZT_TIMEOUT=10
PROTECZT_VERIFY_SSL=true
```

> **Get your API token:** Login to your Proteczt server dashboard → **API Tokens** → Generate New Token.

### 3. Register the middleware

Apply license checking to your routes. In `bootstrap/app.php` (Laravel 11+):

```php
use Tecnozt\Proteczt\Http\Middleware\CheckProtecztLicense;

->withMiddleware(function (Middleware $middleware) {
    // Apply to all web routes:
    $middleware->append(CheckProtecztLicense::class);

    // Or apply only to specific route groups (recommended):
    $middleware->alias([
        'proteczt' => CheckProtecztLicense::class,
    ]);
})
```

Then in your routes:

```php
// routes/web.php
Route::middleware('proteczt')->group(function () {
    // Protected routes
});
```

### 4. Register your application

```bash
php artisan proteczt:register
```

This sends your application details (name, domain, hostname) to the Proteczt server. This also happens automatically on the first web request if `auto_register` is enabled.

---

## How It Works

```
┌─────────────────────┐           Register / Check Status           ┌─────────────────────┐
│  Laravel App        │ ─────────────────────────────────────────>  │  Proteczt Server    │
│  (Client)           │                                              │  (License API)      │
│                     │  { active: true/false }                     │                     │
│  CheckProteczt      │ <─────────────────────────────────────────  │                     │
│  License Middleware │                                              └─────────────────────┘
└─────────────────────┘
        │
        ├─ active: true  → Request continues normally
        └─ active: false → 403 License Inactive page (or JSON)
```

1. **First boot:** Service provider registers the app with Proteczt (stored in `storage/app/.proteczt_registered`).
2. **Every request:** Middleware checks license status (cached for 1 hour by default).
3. **If active:** Request passes through normally.
4. **If inactive/expired:** Returns 403 with an error page (or JSON for API requests).
5. **If server is unreachable:** Fail-open — request is allowed to prevent downtime.

---

## Artisan Commands

| Command | Description |
|---------|-------------|
| `php artisan proteczt:register` | Register this app to Proteczt server |
| `php artisan proteczt:register --force` | Re-register (overwrite existing) |
| `php artisan proteczt:check` | Check license status (from cache) |
| `php artisan proteczt:check --fresh` | Check status (bypass cache) |
| `php artisan proteczt:refresh` | Force-refresh license cache |

---

## Controlling Your App from the Server

Once installed, you control the application entirely from the Proteczt dashboard:

| Action | Effect |
|--------|--------|
| Set status → **Inactive** | App blocked within 1 hour (or immediately after `proteczt:refresh`) |
| Set status → **Active** | App resumes within 1 hour |
| Set **Expired At** date | App automatically blocked on that date |
| **Delete** client | App unregistered — future check-status returns inactive |

---

## Facade

```php
use Tecnozt\Proteczt\Facades\Proteczt;

// Check if license is active
if (Proteczt::isActive()) {
    // proceed
}

// Get full status with data
$status = Proteczt::checkStatus();
// $status['active']      → bool
// $status['data']        → array|null (app info from server)
// $status['fail_open']   → bool (true if server was unreachable)

// Force refresh
Proteczt::refreshStatus();

// Register (usually automatic)
Proteczt::register();
```

---

## Publishing Views

To customise the "License Inactive" error page:

```bash
php artisan vendor:publish --tag=proteczt-views
```

This copies the view to `resources/views/vendor/proteczt/errors/license-expired.blade.php`.

---

## Configuration Reference

| Key | Env Variable | Default | Description |
|-----|-------------|---------|-------------|
| `api_url` | `PROTECZT_API_URL` | — | Proteczt server URL **(required)** |
| `api_token` | `PROTECZT_API_TOKEN` | — | Bearer token from Proteczt **(required)** |
| `domain` | `PROTECZT_DOMAIN` | `null` (auto) | Override domain detection |
| `auto_register` | `PROTECZT_AUTO_REGISTER` | `true` | Auto-register on first request |
| `skip_local` | `PROTECZT_SKIP_LOCAL` | `true` | Skip check in `local`/`testing` env |
| `cache_duration` | `PROTECZT_CACHE_DURATION` | `0` | Cache TTL in seconds (0 = no cache, real-time enforcement) |
| `timeout` | `PROTECZT_TIMEOUT` | `10` | HTTP request timeout in seconds |
| `verify_ssl` | `PROTECZT_VERIFY_SSL` | `true` | Verify SSL certificates |

---

## Security

- **API token** is stored in `.env` and never exposed to end users.
- **Cache keys** are SHA-256 hashed (domain + token) to prevent enumeration.
- **Fail-open by design:** If the Proteczt server is unreachable, your clients will not experience downtime. If you prefer fail-closed, override `isActive()` via the service container.
- **HTTPS strongly recommended** in production. The `verify_ssl` option should always be `true`.
- A `401`/`403` response from the server (e.g., invalid token) immediately returns `inactive` without caching.

---

## Testing

```bash
# Check if the package is correctly integrated
php artisan proteczt:check

# Force block your app to test the error page
# → Go to Proteczt dashboard → Clients → Set status to Inactive
# → Clear cache:
php artisan proteczt:refresh
# → Visit any route — you should see the license error page

# Re-enable your app
# → Set status to Active in the dashboard
php artisan proteczt:refresh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App not registering | Check `PROTECZT_API_URL` and `PROTECZT_API_TOKEN` in `.env` |
| App always blocked | Check client status in Proteczt dashboard |
| Stale status after change | Run `php artisan proteczt:refresh` |
| SSL error in local | Set `PROTECZT_VERIFY_SSL=false` (local only) |
| Skip not working | Set `PROTECZT_SKIP_LOCAL=true` and `APP_ENV=local` |

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT — see [LICENSE](LICENSE).

---

**Made with ❤️ by [Tecnozt](https://tecnozt.com)**
