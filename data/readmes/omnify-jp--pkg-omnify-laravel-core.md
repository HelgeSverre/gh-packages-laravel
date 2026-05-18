# pkg-omnify-laravel-core

Laravel package for authentication and access control in Omnify services.

Supports two modes:
- **`standalone`** — Email/password login, managed entirely by this service.
- **`console`** — Login delegated to Omnify Console via OAuth SSO (JWT).

## Features

- Dual auth modes (standalone / console SSO)
- UUID primary keys on all models
- Scoped RBAC — roles/permissions tied to organization + branch
- Inertia.js pages for IAM (users, roles, permissions)
- Injectable layout — services bring their own shell
- Open redirect protection, rate limiting ready
- Dedicated SSO log channel
- Schema-driven models via Omnify

## Requirements

- PHP 8.2+
- Laravel 11+ / 12+
- SQLite 3.35+ / MySQL 8+ / PostgreSQL 13+

---

## Quick Start

### 1. Install

```bash
composer require omnifyjp/pkg-omnify-laravel-core
```

### 2. Publish & migrate

```bash
php artisan vendor:publish --tag=sso-migrations
php artisan migrate
```

### 3. Configure `.env`

```env
# 'standalone' hoặc 'console'
OMNIFY_AUTH_MODE=standalone
```

> For console mode, see [Console SSO Mode](#console-sso-mode) below.

### 4. Seed initial data (optional)

**Standalone mode** — seed a demo org with users, roles, permissions, branches:

```bash
php artisan db:seed --class=\\Omnify\\Core\\Database\\Seeders\\SsoStandaloneSeeder
```

This creates a Vietnamese demo company with:
- 3 roles: `admin`, `manager`, `staff`
- 10 permissions (`users.*`, `branches.*`, `reports.*`)
- 3 branches (Hà Nội HQ, HCM, Đà Nẵng)
- 5 locations
- 8 users (admin@abc-tech.vn / Admin@2024, etc.)

---

## Authentication Modes

### Standalone Mode

Users log in with email + password stored in this service's database.
No Console connection required.

**Routes registered automatically:**

| Method | Path | Name |
|--------|------|------|
| GET | `/login` | `login` |
| POST | `/login` | |
| POST | `/logout` | `logout` |
| GET | `/forgot-password` | `password.request` |
| POST | `/forgot-password` | `password.email` |
| GET | `/reset-password/{token}` | `password.reset` |
| POST | `/reset-password` | `password.update` |

**Relevant env vars:**

```env
OMNIFY_AUTH_MODE=standalone
OMNIFY_AUTH_REGISTRATION=false        # open registration on/off
OMNIFY_AUTH_PASSWORD_RESET=true
OMNIFY_AUTH_REDIRECT_AFTER_LOGIN=dashboard
OMNIFY_AUTH_REDIRECT_AFTER_LOGOUT=login
```

### Console SSO Mode

Login flow delegated to Omnify Console (OAuth2 + JWT). Users are synced automatically on first login.

**Flow:**

```
1. User visits /sso/login
2. Redirected to Console for authentication
3. Console redirects back to /sso/callback?code=...
4. Service exchanges code for JWT, syncs user locally
5. User is logged in (Laravel session)
```

**Relevant env vars:**

```env
OMNIFY_AUTH_MODE=console
SSO_CONSOLE_URL=https://console.omnify.jp
SSO_SERVICE_SLUG=your-service-slug
SSO_CALLBACK_URL=/sso/callback

# For bulk sync command (dev / staging)
SSO_SERVICE_SECRET=your-service-secret
```

**Bulk sync users from Console (dev/staging only):**

```bash
# Sync branches + users for an organization
php artisan sso:sync-from-console --organization=abc-tech

# Options
php artisan sso:sync-from-console --organization=abc-tech --dry-run
php artisan sso:sync-from-console --organization=abc-tech --users-only
php artisan sso:sync-from-console --organization=abc-tech --branches-only
php artisan sso:sync-from-console --organization=abc-tech --per-page=50
```

> **Production note:** The sync command calls Console via HTTPS API (`X-Service-Slug` + `X-Service-Secret`). The service never accesses Console's database directly. In production, users auto-sync on first SSO login — the bulk command is only needed to pre-populate data before first login.

---

## Models

All models use UUID primary keys.

| Model | Description | Console reference |
|-------|-------------|-------------------|
| `User` | Auth user | `console_user_id` |
| `Branch` | Branch mirror | `console_branch_id`, `console_organization_id` |
| `Location` | Location under a branch | `console_branch_id`, `console_organization_id` |
| `Role` | Local role with level | — |
| `Permission` | Local permission | — |
| `RolePermission` | Role ↔ Permission pivot | — |

### User fields

| Field | Type | Description |
|-------|------|-------------|
| `console_user_id` | uuid | Links to Console User |
| `console_organization_id` | uuid | Organization context |
| `console_access_token` | text | Encrypted (console mode) |
| `console_refresh_token` | text | Encrypted (console mode) |
| `console_token_expires_at` | timestamp | Token expiry |
| `email` | string | User email |
| `name` | string | Display name |
| `password` | string | Hashed (standalone mode only) |

### Scoped RBAC

Roles are assigned per organization + branch via the `role_user` pivot:

```
role_user
  user_id                  (FK → users.id)
  role_id                  (FK → roles.id)
  console_organization_id  (scope to org)
  console_branch_id        (scope to branch, nullable = org-wide)
```

User methods:

```php
$user->hasRole('admin')                          // any scope
$user->hasRoleInOrg('manager', $orgId)
$user->hasRoleInBranch('staff', $orgId, $branchId)
$user->hasPermission('users.create')
$user->hasAnyPermission(['users.create', 'users.update'])
```

---

## Middleware

Register in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'sso.auth'         => \Omnify\Core\Http\Middleware\SsoRoleCheck::class,
        'sso.organization' => \Omnify\Core\Http\Middleware\SsoOrganizationAccess::class,
        'sso.role'         => \Omnify\Core\Http\Middleware\SsoRoleCheck::class,
    ]);
})
```

Usage:

```php
// Require login
Route::middleware('sso.auth')->group(...);

// Require role (min level)
Route::middleware(['sso.auth', 'sso.role:admin'])->group(...);

// Require permission
Route::middleware(['sso.auth', 'sso.permission:users.create'])->group(...);
```

---

## IAM Pages

The package ships Inertia React pages for managing users, roles, and permissions.

Routes are mounted at `/admin/iam` by default (configurable via `SSO_ACCESS_PREFIX`).

| Path | Description |
|------|-------------|
| `/admin/iam/users` | User list + role assignment |
| `/admin/iam/users/{id}` | User detail |
| `/admin/iam/roles` | Role list |
| `/admin/iam/roles/create` | Create role |
| `/admin/iam/roles/{id}` | Role detail + permissions |
| `/admin/iam/permissions` | Permission list |

### Injectable Layout

IAM pages render inside whichever layout the host service provides. Set it once in your app:

```tsx
// resources/js/app.tsx (or providers)
import { IamLayoutProvider } from '@omnify-core/iam';
import AppLayout from '@/layouts/app-layout';

<IamLayoutProvider layout={AppLayout}>
  {children}
</IamLayoutProvider>
```

---

## Package Structure

```
pkg-omnify-laravel-core/
├── app/
│   ├── Console/Commands/
│   │   └── SyncFromConsoleCommand.php   # php artisan sso:sync-from-console
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                    # Standalone auth controllers
│   │   │   └── AccessPageController.php # IAM page controllers
│   │   ├── Middleware/
│   │   │   ├── SsoRoleCheck.php
│   │   │   └── SsoOrganizationAccess.php
│   │   └── Resources/
│   ├── Models/
│   │   ├── OmnifyBase/                  # Auto-generated base models
│   │   ├── User.php
│   │   ├── Branch.php
│   │   ├── Location.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   └── RolePermission.php
│   ├── Services/
│   │   ├── ConsoleApiService.php        # Console API client (SSO + service-to-service)
│   │   ├── ConsoleTokenService.php      # Token refresh
│   │   └── OrganizationAccessService.php
│   └── CoreServiceProvider.php
├── config/
│   └── omnify-auth.php                  # All configuration
├── database/
│   ├── factories/
│   ├── migrations/omnify/               # Auto-generated migrations
│   └── seeders/
│       └── SsoStandaloneSeeder.php      # Demo data for standalone mode
├── docs/                                # Extended documentation
├── resources/js/                        # IAM React components
│   ├── contexts/
│   ├── hooks/
│   └── pages/ (injected via Inertia)
├── routes/
│   ├── auth.php                         # Standalone auth routes
│   ├── sso.php                          # Console SSO routes
│   └── access.php                       # IAM admin routes
└── tests/
```

---

## Configuration Reference

Full config: `config/omnify-auth.php`

```php
'mode' => env('OMNIFY_AUTH_MODE', 'standalone'), // 'standalone' | 'console'

'standalone' => [
    'registration'             => env('OMNIFY_AUTH_REGISTRATION', false),
    'password_reset'           => env('OMNIFY_AUTH_PASSWORD_RESET', true),
    'redirect_after_login'     => env('OMNIFY_AUTH_REDIRECT_AFTER_LOGIN', 'dashboard'),
    'redirect_after_logout'    => env('OMNIFY_AUTH_REDIRECT_AFTER_LOGOUT', 'login'),
],

'console' => [
    'url'            => env('SSO_CONSOLE_URL', 'http://auth.test'),
    'service_slug'   => env('SSO_SERVICE_SLUG', ''),
    'callback_url'   => env('SSO_CALLBACK_URL', '/sso/callback'),
],

'service' => [
    'slug'         => env('SSO_SERVICE_SLUG', 'boilerplate'),
    'secret'       => env('SSO_SERVICE_SECRET', ''), // for sso:sync-from-console
    'callback_url' => env('SSO_CALLBACK_URL', '/sso/callback'),
],

'cache' => [
    'jwks_ttl'              => 60,
    'org_access_ttl'        => 300,
    'role_permissions_ttl'  => 3600,
],

'routes' => [
    'access_enabled'    => env('SSO_ACCESS_ROUTES_ENABLED', true),
    'access_prefix'     => env('SSO_ACCESS_PREFIX', 'admin/iam'),
    'auth_enabled'      => env('SSO_AUTH_ROUTES_ENABLED', true),
    'auth_prefix'       => env('SSO_AUTH_PREFIX', 'sso'),
],

'security' => [
    'allowed_redirect_hosts'  => [],    // env: SSO_ALLOWED_REDIRECT_HOSTS (comma-separated)
    'require_https_redirects' => true,
    'max_redirect_url_length' => 2048,
],

'logging' => [
    'enabled' => env('SSO_LOGGING_ENABLED', true),
    'channel' => env('SSO_LOG_CHANNEL', 'sso'),
    'level'   => env('SSO_LOG_LEVEL', 'debug'),
],
```

---

## Extended Documentation

| Document | Description |
|----------|-------------|
| [Installation](docs/getting-started/installation.md) | Step-by-step setup |
| [Configuration](docs/getting-started/configuration.md) | All env vars and config options |
| [Authentication](docs/guides/authentication.md) | Standalone + console auth flows |
| [Authorization](docs/guides/authorization.md) | RBAC, roles, permissions |
| [Scoped RBAC](docs/guides/scoped-rbac.md) | Org + branch scoped roles |
| [Middleware](docs/guides/middleware.md) | Available middleware |
| [IAM Pages](docs/guides/iam-pages.md) | IAM UI and injectable layout |
| [Injectable Layout](docs/guides/injectable-layout.md) | Host layout integration |
| [Security](docs/guides/security.md) | Open redirect, CSRF, etc. |
| [Seeders](docs/reference/seeders.md) | Standalone and console seeders |
| [API Reference](docs/reference/api.md) | Admin API endpoints |
| [Logging](docs/reference/logging.md) | SSO log channel |

## Testing

```bash
cd packages/pkg-omnify-laravel-core
../../../vendor/bin/pest
```

Or from project root:

```bash
php artisan test --compact
```

## License

MIT
