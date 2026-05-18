# dwebserver/laravel-sanity-check

<!-- Badges: replace ORG/REPO if you fork, or keep dwebserver/laravel-sanity-check for this upstream. -->

[![CI](https://github.com/dwebserver/laravel-sanity-check/actions/workflows/ci.yml/badge.svg)](https://github.com/dwebserver/laravel-sanity-check/actions/workflows/ci.yml)
[![Latest Stable Version](https://poser.pugx.org/dwebserver/laravel-sanity-check/v/stable)](https://packagist.org/packages/dwebserver/laravel-sanity-check)
[![License](https://poser.pugx.org/dwebserver/laravel-sanity-check/license)](https://packagist.org/packages/dwebserver/laravel-sanity-check)
[![PHP Version Require](https://poser.pugx.org/dwebserver/laravel-sanity-check/require/php)](https://packagist.org/packages/dwebserver/laravel-sanity-check)
[![Monthly Downloads](https://poser.pugx.org/dwebserver/laravel-sanity-check/d/monthly)](https://packagist.org/packages/dwebserver/laravel-sanity-check)

<!--
Optional placeholders (uncomment after Packagist + tooling exist):

[![GitHub release](https://img.shields.io/github/v/release/ORG/REPO?sort=semver)](https://github.com/ORG/REPO/releases)
[![Codecov](https://codecov.io/gh/ORG/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/ORG/REPO)
[![GitHub issues](https://img.shields.io/github/issues/ORG/REPO)](https://github.com/ORG/REPO/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/ORG/REPO)](https://github.com/ORG/REPO/pulls)
-->

**Repository:** [github.com/dwebserver/laravel-sanity-check](https://github.com/dwebserver/laravel-sanity-check) · **Contact:** [info@dwebserver.net](mailto:info@dwebserver.net) · **Maintainer guide:** [`docs/releasing.md`](docs/releasing.md)

---

## Table of contents

1. [Overview](#1-overview)  
2. [Features](#2-features)  
3. [Screenshots and UI overview](#3-screenshots-and-ui-overview)  
4. [Installation](#4-installation)  
5. [Publish config, migrations, and views](#5-publish-config-migrations-and-views)  
6. [Basic usage](#6-basic-usage)  
7. [Dashboard usage](#7-dashboard-usage)  
8. [Artisan usage](#8-artisan-usage)  
9. [Configuration reference](#9-configuration-reference)  
10. [Route parameter resolvers](#10-route-parameter-resolvers)  
11. [Authorization](#11-authorization)  
12. [Persistence and cleanup](#12-persistence-and-cleanup)  
13. [JSON export](#13-json-export)  
14. [CI usage example](#14-ci-usage-example)  
15. [Testing](#15-testing)  
16. [Release process](#16-release-process)  
17. [Packagist publication](#17-packagist-publication)  
18. [Roadmap](#18-roadmap)  
19. [Contributing](#19-contributing)  
20. [License](#20-license)  

---

## 1. Overview

**Laravel route sanity checks for back-office teams.** This package adds an optional **admin dashboard** and an **Artisan command** that discover your application routes, resolve dynamic URL segments where possible, execute requests (via the HTTP kernel or an outbound HTTP client), and classify outcomes into summary buckets (2xx–5xx and ignored). Results can be **persisted** for history and trends, or kept **ephemeral** for one-off smoke tests. **JSON** (and optional **CSV**) export helps you plug results into monitoring, tickets, or CI artifacts.

Install it when you want **repeatable smoke coverage** of GET/HEAD (and optionally other) routes across **staging and CI**, without replacing full browser E2E suites. It complements—not replaces—feature tests and production APM.

---

## 2. Features

- **Route discovery** — Scans the Laravel router with configurable filters: name/URI prefixes, include/exclude patterns (`Str::is`), HTTP methods (default GET/HEAD with sensible HEAD deduplication), caps via `max_routes_per_run`.
- **Safe defaults** — Optional skipping of **signed** URLs, **throttled** routes, **closure** actions, and **vendor** package routes so scans focus on your app.
- **Two execution modes** — **`internal`**: `Request::create` + HTTP kernel (no outbound TCP; respects middleware). **`http`**: HTTP client against `APP_URL` (better for strict timeouts; see auth caveats below).
- **Response classification** — Maps results into legacy summary buckets (2xx, 3xx, 4xx, 5xx, ignored) with configurable redirect handling and ignored status codes (e.g. 419).
- **Blade dashboard** — Run checks from the browser, inspect the latest saved run, paginate and filter per bucket, optional run history.
- **Artisan command** — `sanity-check:run` with JSON output, `--no-save`, `--only` / `--except` / `--limit`; **non-zero exit** when any route lands in the **5xx** bucket (CI-friendly).
- **Persistence** — Optional database storage with **max run count** and **retention by day** pruning.
- **Exports** — JSON endpoints (on by default); CSV download optional.
- **Extension points** — Swap `RouteScanner`, `RouteTester`, or `ResultRepository` via config bindings; chain **parameter resolvers** for `{slug}` / `{id}` segments.
- **Production guardrails** — `allow_in_production`, `environment_allowlist`, and dashboard/command toggles.

---

## 3. Screenshots and UI overview

Replace the placeholders below after you capture screenshots in your environment (recommended: light and dark theme, post-run summary + bucket tables).

| Area | Placeholder |
|------|-------------|
| Dashboard (index) | ![Dashboard index](docs/screenshots/dashboard-index.png) |
| Run detail / buckets | ![Run detail](docs/screenshots/dashboard-run-detail.png) |
| History panel | ![History](docs/screenshots/dashboard-history.png) |

**UI overview (no images required):**

- **Index** — Default landing at `{dashboard_path}` (configurable, default `admin/sanity-check`). Shows the latest saved run when `save_runs` is true, or prompts to run when empty. **Run checks** submits a POST to `sanity-check.run`.
- **Run detail** — `GET {dashboard_path}/runs/{uuid}` (`sanity-check.show`). Per-route rows grouped into buckets with pagination query params `p_2xx`, `p_3xx`, etc.
- **Theme** — `ui_theme` is exposed on `<body>` as `sanity-theme--{value}` (default `dark`) for your admin layout/CSS.
- **Ephemeral runs** — With `save_runs=false`, the last run may still be reviewed via redirect/query flows documented in config; durable history is disabled.

---

## 4. Installation

Requirements: **PHP 8.1+**, **Laravel 10 / 11 / 12** (see `composer.json` `illuminate/*` constraints).

```bash
composer require dwebserver/laravel-sanity-check
```

Laravel will **auto-discover** `DynamicWeb\SanityCheck\SanityCheckServiceProvider` via `extra.laravel.providers`. Manual registration is only needed if discovery is disabled in your app.

---

## 5. Publish config, migrations, and views

```bash
# Full commented config (recommended starting point)
php artisan vendor:publish --tag=sanity-check-config

# Database migrations (optional copy; the package also loads migrations automatically—pick one strategy)
php artisan vendor:publish --tag=sanity-check-migrations

# Blade views (optional overrides)
php artisan vendor:publish --tag=sanity-check-views
```

Apply migrations when using SQL persistence:

```bash
php artisan migrate
```

**Important:** If you rely on the package’s **automatic migration loading**, avoid also running duplicate copies of the same migration files. Either publish migrations **or** use the package registration— not both for the same tables.

---

## 6. Basic usage

**Typical back-office use case:** After deploy, an operator opens the dashboard under `/admin/sanity-check`, runs a check against GET routes scoped to `admin.*` (via config), and scans for unexpected 5xx or redirects.

**Typical CI use case:** Pipeline runs `php artisan sanity-check:run --no-save --only="admin.*"` and fails the job if any server error appears.

Minimal configuration after publishing:

```php
<?php

declare(strict_types=1);

return [

    'enabled' => env('SANITY_CHECK_ENABLED', true),
    'enable_dashboard' => env('SANITY_CHECK_ENABLE_DASHBOARD', true),
    'enable_command' => env('SANITY_CHECK_ENABLE_COMMAND', true),

    'dashboard_path' => env('SANITY_CHECK_PATH', 'admin/sanity-check'),

    // Scope to your admin/API surface as needed
    'route_name_prefixes' => ['admin.'],
    'allowed_methods' => ['GET', 'HEAD'],

    'execution_mode' => env('SANITY_CHECK_EXECUTION_MODE', 'internal'),

    'save_runs' => env('SANITY_CHECK_SAVE_RUNS', true),

    'allow_in_production' => env('SANITY_CHECK_ALLOW_IN_PRODUCTION', false),
];
```

**Common use cases:**

| Goal | Approach |
|------|----------|
| Smoke-test admin GET routes after deploy | `route_name_prefixes` + dashboard or CLI `--only` |
| Keep production closed | `allow_in_production` false (default); allow CI via `environment_allowlist` |
| No database writes in CI | `sanity-check:run --no-save` or `save_runs` false |
| Reduce noise from redirects | `treat_redirects_as` → `success` or `ignored` |
| Skip package routes | `skip_vendor_routes` true (default) |

---

## 7. Dashboard usage

1. Visit **`/{dashboard_path}`** (default `admin/sanity-check`).  
2. Click **Run checks** — issues `POST` to route name **`sanity-check.run`** (CSRF applies with `web` middleware).  
3. Open a specific run: **`GET /{dashboard_path}/runs/{uuid}`** — route name **`sanity-check.show`**.

**Query parameters (run detail):**

- `q` — Search within route name / URI / resolved URI.  
- `bucket` — Focus one classification bucket (`2xx`, `3xx`, `4xx`, `5xx`, `ignored`).  
- `p_2xx`, `p_3xx`, … — Pagination per bucket.

**Named routes (fixed except dashboard index):**

| Name | Method | Purpose |
|------|--------|---------|
| `sanity-check.dashboard` | GET | Index (configurable name via `dashboard_route_name`) |
| `sanity-check.run` | POST | Trigger run |
| `sanity-check.show` | GET | Run detail |
| `sanity-check.export` | GET | JSON export (latest) |
| `sanity-check.export.run` | GET | JSON export by UUID |
| `sanity-check.export.csv` | GET | CSV (if enabled) |
| `sanity-check.export.csv.run` | GET | CSV by UUID (if enabled) |

If the package is **disabled**, **`enable_dashboard`** is false, or **environment/production** rules block access, routes respond **404** (by design).

---

## 8. Artisan usage

```text
php artisan sanity-check:run
    {--json : Print the full run payload as JSON}
    {--no-save : Do not persist this run}
    {--only= : Comma-separated Str::is patterns (name or URI)}
    {--except= : Comma-separated Str::is patterns excluded after config filters}
    {--limit= : Max routes to check after filters}
```

**Examples:**

```bash
# Human-readable table summary
php artisan sanity-check:run

# Machine-readable JSON on stdout (exit code still reflects 5xx)
php artisan sanity-check:run --json

# CI: no DB persistence, only admin routes, cap volume
php artisan sanity-check:run --no-save --only="admin.*" --limit=100

# Exclude noisy areas
php artisan sanity-check:run --except="debugbar.*,horizon.*"

# Combine flags
php artisan sanity-check:run --only="admin.*,api.health*" --no-save --json > sanity-report.json
```

**Exit codes:** `0` if no routes are classified into the **5xx** bucket; **non-zero** if the package is disabled, the environment is not allowed, options are invalid, or **any 5xx** occurred.

**Note:** The CLI path does **not** evaluate `authorization_ability` (no HTTP gate). Protect shell access in shared environments; use `enable_command` to disable registration if needed.

---

## 9. Configuration reference

The canonical schema and inline documentation live in **[`config/sanity-check.php`](config/sanity-check.php)**. Summary:

| Group | Keys (representative) | Purpose |
|-------|------------------------|---------|
| Toggles | `enabled`, `enable_dashboard`, `enable_command` | Master and feature switches |
| Dashboard | `dashboard_path`, `dashboard_route_name`, `middleware` | URL prefix, index route name, middleware stack |
| Discovery | `route_name_prefixes`, `route_uri_prefixes`, `include_*`, `exclude_*`, `allowed_methods`, `skip_*`, `max_routes_per_run` | What to scan |
| Execution | `execution_mode`, `follow_redirects`, `timeout_seconds` | How requests run |
| Classification | `treat_redirects_as`, `ignored_status_codes` | Buckets and noise |
| Auth | `authorization_ability`, `admin_user_resolver` | HTTP gate + user for internal requests |
| Parameters | `parameter_resolvers`, `default_parameter_strategy`, `default_parameter_placeholder`, `ignore_unresolvable_routes`, `ignore_missing_bound_models` | Dynamic URIs |
| Persistence | `save_runs`, `max_saved_runs`, `retention_days` | Storage and pruning |
| Exports | `enable_json_export`, `enable_csv_export` | HTTP export toggles |
| Safety | `allow_in_production`, `environment_allowlist` | Environment gates |
| UI | `ui_theme`, `results_per_page`, `about_panel_title`, `objective_text`, `show_history`, `history_limit` | Dashboard copy and layout |
| Extensions | `services.bindings` | Swap scanner/tester/repository implementations |

**Environment variables** are documented beside each option (e.g. `SANITY_CHECK_ENABLED`, `SANITY_CHECK_PATH`, `SANITY_CHECK_EXECUTION_MODE`, `SANITY_CHECK_ALLOW_IN_PRODUCTION`, …).

---

## 10. Route parameter resolvers

Laravel routes with `{id}`, `{slug}`, or `{user}` segments need **concrete values** to generate URLs and dispatch requests. The package resolves them in order:

1. **`parameter_resolvers`** — Map parameter names to classes implementing `DynamicWeb\SanityCheck\Contracts\ParameterResolverInterface` or to **closures** `(string $name, Route $route): ?string`.
2. **Built-in chain** — Config-mapped models, route model binding hints, then defaults.
3. **`default_parameter_strategy`** — `strict` (fail or ignore per `ignore_unresolvable_routes`) vs `placeholder` (use `default_parameter_placeholder`).

Example closure in config:

```php
'parameter_resolvers' => [
    'slug' => fn (string $parameterName, \Illuminate\Routing\Route $route): ?string => 'demo-slug',
],
```

See also **[`examples/ExampleIdParameterResolver.php`](examples/ExampleIdParameterResolver.php)** for a class-based resolver.

### Dynamic-route limitations (read this before production)

- **Signed URLs** — Routes using signature validation are skipped by default (`skip_signed_routes`); synthetic sanity URLs cannot reproduce valid signatures.
- **Implicit / explicit model binding** — Without a resolver or a discoverable model key, URLs may be invalid. Use `parameter_resolvers` or enable `ignore_missing_bound_models` / `ignore_unresolvable_routes` to skip or mark routes as ignored.
- **Internal mode and session auth** — `execution_mode=internal` does not magically log in a browser user. Use `admin_user_resolver` to attach an `Authenticatable` for sub-requests when your routes require auth.
- **HTTP mode and cookies** — `execution_mode=http` does **not** forward session cookies from the operator’s browser; it calls `APP_URL` as a client. Prefer **internal** mode for session-backed GET pages unless you add custom headers/tokens.
- **Closures and vendor routes** — Closure controllers may be skipped (`skip_closure_routes`); vendor routes are skipped by default (`skip_vendor_routes`).
- **Rate limits** — Throttled routes can be skipped (`skip_throttled_routes`) to avoid burning quotas.
- **Heuristic IDs** — Resolvers that guess database IDs (e.g. “first row”) can hit the wrong record; prefer deterministic fixtures or dedicated preview routes for checks.

---

## 11. Authorization

**Dashboard and export HTTP routes** use package middleware:

1. **`EnsureSanityCheckEnvironment`** — Enforces `enabled`, `allow_in_production`, and `environment_allowlist`.
2. **`AuthorizeSanityCheck`** — When `authorization_ability` is non-empty, requires an authenticated user who passes `Gate::check($ability, [])` (i.e. `can:{ability}`).

Define the ability in your app (example):

```php
use Illuminate\Support\Facades\Gate;

Gate::define('viewSanityCheck', function (?User $user): bool {
    return $user !== null && $user->isAdmin();
});
```

**Disable the gate** (trusted environments only): set `SANITY_CHECK_AUTH_ABILITY=` to empty in `.env`, or return `null` from the published config closure for `authorization_ability`.

**Artisan** does not use this gate — rely on shell access control and `enable_command`.

---

## 12. Persistence and cleanup

When **`save_runs`** is true, runs and per-route rows are stored via Eloquent models and migrations provided by the package.

**Retention controls:**

- **`max_saved_runs`** — Keep only the newest N runs (`0` = unlimited). Older runs are deleted.
- **`retention_days`** — Delete runs older than N days (`0` = disabled).

**Ephemeral mode:** `save_runs` false (or `--no-save` per invocation) avoids writing history; the dashboard may still surface the latest payload for review depending on cache/ephemeral behavior described in config.

---

## 13. JSON export

When **`enable_json_export`** is true (default):

- **Latest saved run:** `GET /{dashboard_path}/export` — `sanity-check.export`
- **By UUID:** `GET /{dashboard_path}/export/{uuid}` — `sanity-check.export.run`

Responses are JSON suitable for scripting (integrate with `curl`, monitors, or ticket systems). **Authorization and environment middleware apply** the same as the dashboard.

**CSV** — Enable `enable_csv_export` and use `sanity-check.export.csv` / `sanity-check.export.csv.run`.

---

## 14. CI usage example

Fail a GitHub Actions job when any admin GET route returns **5xx** (adjust `APP_ENV` / `SANITY_CHECK_ALLOW_IN_PRODUCTION` / `SANITY_CHECK_ENVIRONMENTS` so your pipeline is allowed to run the command):

```yaml
# .github/workflows/sanity-check.yml (illustrative)
name: Route sanity

on: [push, pull_request]

jobs:
  sanity-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      - run: composer install --prefer-dist --no-interaction
      - run: php artisan migrate --force
      - name: Run sanity check (fail on 5xx)
        run: php artisan sanity-check:run --no-save --only="admin.*" --json > sanity-report.json
```

GitLab / shell equivalent:

```bash
php artisan sanity-check:run --only="admin.*" --except="admin.webhooks.*" --no-save || exit 1
```

---

## 15. Testing

From a package clone or your dev install:

```bash
composer validate --strict
composer install
composer run lint      # Laravel Pint (dry run)
composer run analyse   # PHPStan on src/
composer test          # PHPUnit + Orchestra Testbench (SQLite :memory:)
```

The suite covers the service provider, discovery/filtering, execution/classification, persistence, dashboard HTTP behavior, Artisan options and exit codes, and JSON export shape. See **`tests/`** for fixtures and `tests/TestCase.php` for the Testbench setup.

---

## 16. Release process

Follow the full checklist in **[`docs/releasing.md`](docs/releasing.md)** (quality gates, tag push, Packagist, hotfixes).

Short version:

1. Update **[`CHANGELOG.md`](CHANGELOG.md)** with a dated section for the new version (Keep a Changelog style).  
2. Ensure **`composer.json`** version constraints and docs match the release.  
3. Tag with SemVer and a `v` prefix, e.g. `git tag -a v1.0.0 -m "Release 1.0.0"`.  
4. Push the tag: `git push origin v1.0.0`.  
5. Optional: the repository **[release workflow](.github/workflows/release.yml)** builds source and bundle artifacts when `v*.*.*` tags are pushed and attaches them to a GitHub Release.

---

## 17. Packagist publication

1. Ensure **`composer.json`** declares `"name": "dwebserver/laravel-sanity-check"` and correct **`support`** / **`homepage`** URLs (this repo: [github.com/dwebserver/laravel-sanity-check](https://github.com/dwebserver/laravel-sanity-check)).  
2. Push the code to a **public** Git host.  
3. On [packagist.org](https://packagist.org), **Submit** the repository URL.  
4. Enable the **GitHub service hook** (or equivalent) so pushes and tags update Packagist automatically.  
5. Create **git tags** such as `v1.0.0`; Composer exposes them as **`1.0.0`** (leading `v` is normalized). Users require with e.g. `composer require dwebserver/laravel-sanity-check:^1.0`.  
6. Do **not** rewrite tags that already map to a published version; ship a new patch/minor instead.

---

## 18. Roadmap

Ideas for future work (not commitments):

- Richer **HTTP client** auth (configurable headers / bearer tokens) for `execution_mode=http`.  
- Optional **parallel** dispatch with configurable concurrency.  
- **Webhook** or Slack notification on regressions.  
- Deeper **OpenAPI / route doc** integration for expected status codes.  
- First-party **Pest** examples alongside PHPUnit.

Suggestions and PRs are welcome — see [Contributing](#19-contributing).

---

## 19. Contributing

Please read **[`CONTRIBUTING.md`](CONTRIBUTING.md)** and **[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)**. Security-sensitive reports should follow **[`SECURITY.md`](SECURITY.md)** (contact: **info@dwebserver.net**).

---

## 20. License

This package is open source under the **MIT License**. See **[`LICENSE.md`](LICENSE.md)**.

Copyright (c) Dynamicweb.
