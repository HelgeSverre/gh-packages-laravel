# Laravel PII Redactor Admin

> A secure, batteries-included **admin console** for [`padosoft/laravel-pii-redactor`](https://github.com/padosoft/laravel-pii-redactor) — built with Laravel 13, React 19, Vite and Tailwind v4.

<p>
  <a href="https://github.com/padosoft/laravel-pii-redactor-admin/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/padosoft/laravel-pii-redactor-admin/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://packagist.org/packages/padosoft/laravel-pii-redactor-admin"><img alt="Latest Version" src="https://img.shields.io/packagist/v/padosoft/laravel-pii-redactor-admin.svg?label=packagist"></a>
  <a href="https://packagist.org/packages/padosoft/laravel-pii-redactor-admin"><img alt="Total Downloads" src="https://img.shields.io/packagist/dt/padosoft/laravel-pii-redactor-admin.svg"></a>
  <a href="https://github.com/padosoft/laravel-pii-redactor-admin/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/packagist/l/padosoft/laravel-pii-redactor-admin.svg"></a>
  <img alt="PHP" src="https://img.shields.io/badge/php-%5E8.3-blue.svg">
  <img alt="Laravel" src="https://img.shields.io/badge/laravel-%5E13.0-red.svg">
  <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg">
  <img alt="React" src="https://img.shields.io/badge/react-19-61dafb.svg">
  <img alt="Tailwind" src="https://img.shields.io/badge/tailwind-v4-38bdf8.svg">
</p>

<p align="center">
  <img src="resources/screenshots/Laravel-pii-redactor-admin-dashboard.png" alt="Dashboard preview" width="100%">
</p>

---

## Table Of Contents

- [Why this package?](#why-this-package)
- [Features](#features)
- [Screenshots](#screenshots)
- [Requirements](#requirements)
- [Quick Start (5 minutes, junior-dev friendly)](#quick-start-5-minutes-junior-dev-friendly)
  - [1. Install the package](#1-install-the-package)
  - [2. Publish config & migrations](#2-publish-config--migrations)
  - [3. Enable the admin in `.env`](#3-enable-the-admin-in-env)
  - [4. Wire the authorization gates](#4-wire-the-authorization-gates)
  - [5. Open the console](#5-open-the-console)
- [Installation Variants](#installation-variants)
  - [Both packages on Packagist](#both-packages-on-packagist)
  - [Only this package on Packagist](#only-this-package-on-packagist)
  - [Neither package on Packagist](#neither-package-on-packagist)
  - [Local development from a checkout](#local-development-from-a-checkout)
- [Configuration](#configuration)
- [Authorization](#authorization)
- [Security Model](#security-model)
- [Demo Fixtures](#demo-fixtures)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Release](#release)
- [License](#license)
- [Credits](#credits)

---

## Why this package?

GDPR-grade PII redaction is only half the story — operators still need a **safe** way to:

- inspect what was redacted,
- detokenise on demand with a paper trail,
- tune detectors and custom rules,
- and share design-time examples with the team.

`laravel-pii-redactor-admin` ships that admin surface as a **drop-in Laravel package**: zero config in your host app, **disabled by default**, and locked down behind explicit Gates. No raw PII ever leaves the database.

## Features

| | |
| --- | --- |
| Dashboard | KPI cards (events, tokens, detokenises, errors) with light & dark themes |
| Playground | Paste text, run a redaction, inspect tokens — without persisting raw input |
| Token map | Browse stored tokens (originals never selected nor serialized) |
| Detokenise | Justification-gated, throttled, audited reverse lookup |
| Audit logs | Read-only timeline of every redact/detokenise event |
| Detectors | View built-in detectors and their patterns |
| Custom rules | Manage host-defined rules from the UI |
| Disabled by default | One env flag turns the whole console on or off |
| Pre-built assets | React/Tailwind compiled in-package; no host Vite config required |

## Screenshots

> Design references live in [`resources/screenshots`](resources/screenshots).

| Page | Preview |
| --- | --- |
| **Dashboard** | ![Dashboard](resources/screenshots/Laravel-pii-redactor-admin-dashboard.png) |
| **Dashboard (dark)** | ![Dark dashboard](resources/screenshots/Laravel-pii-redactor-admin-dashboard-dark.png) |
| **Playground** | ![Playground](resources/screenshots/Laravel-pii-redactor-admin-playground.png) |
| **Token map** | ![Token map](resources/screenshots/Laravel-pii-redactor-admin-tokenmap.png) |
| **Audit logs** | ![Audit logs](resources/screenshots/Laravel-pii-redactor-admin-logs.png) |
| **Detokenise** | ![Detokenise](resources/screenshots/Laravel-pii-redactor-admin-detokenize.png) |
| **Detectors** | ![Detectors](resources/screenshots/Laravel-pii-redactor-admin-detectors.png) |
| **Custom rules** | ![Custom rules](resources/screenshots/Laravel-pii-redactor-admin-custom-rules.png) |

## Requirements

| Tool | Version |
| --- | --- |
| PHP | `^8.3` |
| Laravel | `^13.0` |
| Composer | `^2.7` |
| Node.js | `>=24` (only needed if you want to rebuild assets) |
| Database | Anything Laravel supports (MySQL, PostgreSQL, SQLite…) |

> The compiled JS/CSS is shipped inside the package, so a host app **does not need Node** to run the console — only to develop it.

---

## Quick Start (5 minutes, junior-dev friendly)

> Follow these steps top-to-bottom on a Laravel 13 app where [`padosoft/laravel-pii-redactor`](https://github.com/padosoft/laravel-pii-redactor) is already installed and migrated.

### 1. Install the package

```bash
composer require padosoft/laravel-pii-redactor-admin
```

> **Both packages are not on Packagist yet?** Jump to [Installation Variants](#installation-variants) and come back here.

### 2. Publish config & migrations

```bash
php artisan vendor:publish --tag=pii-redactor-admin-config
php artisan vendor:publish --tag=pii-redactor-admin-migrations
php artisan migrate
```

What this does:

- copies `config/pii-redactor-admin.php` into your app so you can tweak it,
- adds the audit table migration that records every detokenise event,
- runs the migration so the table exists.

### 3. Enable the admin in `.env`

The console is **disabled by default**. Turn it on only in environments where you trust the audience (typically staging / a protected admin host):

```env
PII_REDACTOR_ADMIN_ENABLED=true
PII_REDACTOR_ADMIN_ROUTE_PREFIX=pii-redactor-admin
PII_REDACTOR_ADMIN_API_PREFIX=pii-redactor-admin/api
```

### 4. Wire the authorization gates

Add the three Gates somewhere they get registered (e.g. `app/Providers/AuthServiceProvider.php` `boot()`):

```php
use Illuminate\Support\Facades\Gate;

Gate::define('viewPiiRedactorAdmin', fn ($user) => $user->can('manage-pii-redactor'));
Gate::define('detokenisePiiRedactor', fn ($user) => $user->can('detokenise-pii'));
Gate::define('viewPiiRedactorRawSamples', fn ($user) => $user->can('view-raw-pii-samples'));
```

Tweak the inner `->can(...)` to match your existing permission system (Spatie, custom roles, hardcoded `$user->is_admin`, etc.). The package only **asks** these Gates — it never defines who passes them.

### 5. Open the console

Visit:

```
https://your-app.test/pii-redactor-admin
```

Logged in as a user that satisfies `viewPiiRedactorAdmin`, you should land on the dashboard. If you get a 403, your Gate returned `false`. If you get a 404, double-check `PII_REDACTOR_ADMIN_ENABLED=true` and that the config is cached (`php artisan config:clear`).

---

## Installation Variants

### Both packages on Packagist

```bash
composer require padosoft/laravel-pii-redactor-admin
```

### Only this package on Packagist

Add the **core package** repository in the host app first:

```bash
composer config repositories.pii-redactor vcs https://github.com/padosoft/laravel-pii-redactor
composer require padosoft/laravel-pii-redactor-admin
```

### Neither package on Packagist

Add both repositories before requiring the admin package:

```bash
composer config repositories.pii-redactor vcs https://github.com/padosoft/laravel-pii-redactor
composer config repositories.pii-redactor-admin vcs https://github.com/padosoft/laravel-pii-redactor-admin
composer require padosoft/laravel-pii-redactor-admin
```

### Local development from a checkout

```bash
composer config repositories.pii-redactor vcs https://github.com/padosoft/laravel-pii-redactor
composer config repositories.pii-redactor-admin path /absolute/path/to/laravel-pii-redactor-admin
composer require padosoft/laravel-pii-redactor-admin:@dev
php artisan vendor:publish --tag=pii-redactor-admin-config
php artisan vendor:publish --tag=pii-redactor-admin-migrations
php artisan migrate
```

> Composer ignores repositories declared **inside** a dependency, so you must declare the core package repository in the **host app** if it isn't on Packagist.

## Configuration

`config/pii-redactor-admin.php` exposes:

| Key | Env | Default | Purpose |
| --- | --- | --- | --- |
| `enabled` | `PII_REDACTOR_ADMIN_ENABLED` | `false` | Master switch — when `false`, **no** routes are registered. |
| `route_prefix` | `PII_REDACTOR_ADMIN_ROUTE_PREFIX` | `pii-redactor-admin` | UI mount path. |
| `api_prefix` | `PII_REDACTOR_ADMIN_API_PREFIX` | `pii-redactor-admin/api` | JSON API mount path used by the React app. |
| `middleware` | — | `['web', 'auth']` | Adjust to your auth stack (Sanctum, custom guards, etc.). |

> Always keep `web,auth` (or stricter) on **both** the UI and the API prefix.

## Authorization

| Ability | Required for |
| --- | --- |
| `viewPiiRedactorAdmin` | Loading any admin page |
| `detokenisePiiRedactor` | Submitting the detokenise form |
| `viewPiiRedactorRawSamples` | Showing raw scan samples in detector output |

Detokenise additionally requires:

- a token-shaped input (validated server-side),
- a justification of **at least 10 characters**,
- UI confirmation,
- per-user/per-route throttling,
- an audit row written **before** the result is returned.

## Security Model

- Token-map listing **never** selects or serializes token originals.
- Detokenise requires authorization, justification, token validation, throttling, and an audit row.
- Raw scan samples require a dedicated ability.
- Audit rows store metadata, counts, target hashes, status, and justification only — **no** raw text, redacted output, detokenised output, salts, API keys, or token originals.

## Demo Fixtures

Safe demo payloads live in [`resources/demo/admin-api-fixtures.json`](resources/demo/admin-api-fixtures.json) and are reused by Playwright. They intentionally omit token originals, raw samples, redacted output, salts, and API keys.

## Verification

Frontend development and CI use Node.js 24 or newer.

Every task must keep these gates green locally and in GitHub Actions:

```bash
composer validate --strict
vendor/bin/phpunit
npm run typecheck
npm run test
npm run build
npm run e2e
```

Fresh host install verification can be run from the package root (PowerShell):

```powershell
./scripts/verify-fresh-laravel-host.ps1
```

Release readiness notes live in [`docs/RELEASE.md`](docs/RELEASE.md).

## Troubleshooting

<details>
<summary><strong>404 on <code>/pii-redactor-admin</code></strong></summary>

- Confirm `PII_REDACTOR_ADMIN_ENABLED=true` is loaded (`php artisan config:clear`, then `php artisan tinker` → `config('pii-redactor-admin.enabled')`).
- Confirm the service provider is auto-discovered (it's listed in `composer.json` `extra.laravel.providers`). If you have `dont-discover` in your host `composer.json`, add it manually.
- Run `php artisan route:list | grep pii-redactor-admin`.
</details>

<details>
<summary><strong>403 once logged in</strong></summary>

- The `viewPiiRedactorAdmin` Gate returned `false`. Check the closure you wrote in step 4 of the Quick Start.
- Verify the Gate is actually registered: `Gate::abilities()` should include the three keys.
</details>

<details>
<summary><strong>Blank page / missing styles</strong></summary>

- Make sure `resources/dist` is present in the package (it's committed). If you cloned without `npm run build`, run it once.
- Confirm your host app isn't overriding the asset routes. The package serves its own JS/CSS via the admin route prefix.
</details>

<details>
<summary><strong>Migration error: table already exists</strong></summary>

- You probably ran the publish command twice. Remove the duplicate file from `database/migrations` and re-run `php artisan migrate`.
</details>

<details>
<summary><strong>Detokenise returns 422</strong></summary>

- Justification must be ≥ 10 characters.
- Token must match the format produced by the core redactor.
- Check the latest row in the audit table — it records the validation failure reason.
</details>

## Contributing

Pull requests are welcome! Before opening one:

1. Read [`AGENTS.md`](AGENTS.md), [`docs/LESSON.md`](docs/LESSON.md), and [`docs/PROGRESS.md`](docs/PROGRESS.md).
2. Keep PRs small and focused.
3. Run all gates from the [Verification](#verification) section.
4. Every PR goes through the [Copilot review loop](skills/copilot-pr-review-loop/SKILL.md).

Bug reports and feature ideas: [open an issue](https://github.com/padosoft/laravel-pii-redactor-admin/issues).

## Release

Current runtime release: [`v1.0.1`](https://github.com/padosoft/laravel-pii-redactor-admin/releases/tag/v1.0.1).

`v1.0.2` is reserved for the final docs/test-hardening ledger after `v1.0.1`. See [`docs/RELEASE.md`](docs/RELEASE.md) for the full release procedure.

## License

Released under the [Apache-2.0 License](LICENSE). © [Padosoft](https://github.com/padosoft).

## Credits

- Built on top of [`padosoft/laravel-pii-redactor`](https://github.com/padosoft/laravel-pii-redactor).
- UI powered by [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [Lucide](https://lucide.dev/) icons.
- Tested with [PHPUnit](https://phpunit.de/), [Vitest](https://vitest.dev/), and [Playwright](https://playwright.dev/).
