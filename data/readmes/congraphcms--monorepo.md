# Congraph Monorepo

Congraph is a modular CMS/content platform built as a set of Composer packages. This repository is the development workspace for those packages and the shared tooling used to test, upgrade, and integrate them into Laravel applications.

## Packages

- [contracts](/Users/nikolap/git/np/congraph/packages/contracts/README.md)  
  Shared interfaces and repository contracts.
- [core](/Users/nikolap/git/np/congraph/packages/core/README.md)  
  Command bus, DTOs, validation, eventing, and package foundations.
- [locales](/Users/nikolap/git/np/congraph/packages/locales/README.md)  
  Locale management.
- [workflows](/Users/nikolap/git/np/congraph/packages/workflows/README.md)  
  Workflow and workflow-point state definitions.
- [filesystem](/Users/nikolap/git/np/congraph/packages/filesystem/README.md)  
  File storage metadata and image version handling.
- [eav](/Users/nikolap/git/np/congraph/packages/eav/README.md)  
  Entity-attribute-value content model and runtime.
- [entity-elastic](/Users/nikolap/git/np/congraph/packages/entity-elastic/README.md)  
  OpenSearch-backed delivery and indexing for entities.
- [laravel-api](/Users/nikolap/git/np/congraph/packages/laravel-api/README.md)  
  Laravel HTTP API layer for Congraph CRUD and delivery routes.

## Repository layout

- `packages/` contains the Composer packages.
- `tools/` contains shared test helpers and local automation scripts.
- `docker-compose.yml` starts PostgreSQL and OpenSearch for local development.
- `.env.testing.example` contains a baseline shared testing environment.

## Requirements

- PHP 8.4 recommended
- Composer 2
- Docker Desktop or compatible Docker runtime
- PostgreSQL 16+ or 17 for realistic integration testing
- OpenSearch 3.5 when working on `entity-elastic`

## Local services

Start shared services from the repo root:

```bash
docker compose up -d
```

The repo currently uses:

- PostgreSQL `17`
- OpenSearch `3.5.0`

## Monorepo test commands

From the repository root:

```bash
composer test
composer test:packages
composer test:pgsql
composer test:opensearch
```

What they do:

- `composer test` runs each package's default suite.
- `composer test:pgsql` runs PostgreSQL-backed suites for packages that define that script.
- `composer test:opensearch` runs OpenSearch-backed suites for packages that define that script.

Package-specific helpers:

- PostgreSQL runner: [tools/test-postgres-package.sh](/Users/nikolap/git/np/congraph/tools/test-postgres-package.sh)
- OpenSearch runner: [tools/test-opensearch-package.sh](/Users/nikolap/git/np/congraph/tools/test-opensearch-package.sh)
- package runner: [tools/test-packages.sh](/Users/nikolap/git/np/congraph/tools/test-packages.sh)

## Releasing packages

The monorepo includes a helper for preparing and publishing package releases from the current monorepo `HEAD`:

```bash
composer release:packages -- v2.0.2
```

By default this is a dry run. It computes package split SHAs and prints the exact branch/tag push commands without publishing anything.

Useful variants:

```bash
composer release:packages -- v2.0.2 --packages=core,eav,laravel-api
composer release:packages -- v2.0.2 --push
```

What it does:

- splits each selected package from `packages/<name>` using `git subtree split`
- targets the correct package repository under `congraphcms/*`
- pushes to `master` for most packages
- pushes to `main` for `laravel-api`

Recommended release flow:

1. commit and push the monorepo release changes
2. create and push the monorepo tag
3. run `composer release:packages -- <version>` and review the plan
4. run `composer release:packages -- <version> --push` from your own terminal
5. refresh Packagist packages if they do not auto-update immediately

## Database options

### Production recommendation

Use PostgreSQL for production.

Reasons:

- The packages are now validated against PostgreSQL.
- Several MySQL-specific assumptions were already removed during the Laravel 13 upgrade.
- PostgreSQL is the best target for the current package set and future work.

### Testing options

- SQLite in-memory  
  Best for fast package tests and lightweight local feedback.
- PostgreSQL  
  Best for realistic integration verification and upgrade confidence.
- OpenSearch  
  Required only for `entity-elastic`.

Recommended default development pattern:

1. run package tests with SQLite for quick iteration
2. run PostgreSQL-backed suites before merging database-related changes
3. run OpenSearch-backed suites when changing delivery/indexing behavior

## Setting up a fresh Laravel 13 Congraph app

The cleanest modern integration path is:

1. create a fresh Laravel 13 app
2. install Sanctum for authentication
3. install the Congraph packages from this monorepo using Composer path repositories
4. use `congraph/laravel-api` for the reusable HTTP layer
5. keep app-specific auth, user, and business controllers in the Laravel app

### 1. Create the app

```bash
laravel new congraph-app
```

or:

```bash
composer create-project laravel/laravel congraph-app
```

### 2. Add path repositories

In the app `composer.json`, add:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "/Users/nikolap/git/np/congraph/packages/*",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

### 3. Require Congraph packages

At minimum:

```bash
composer require \
  congraph/core \
  congraph/contracts \
  congraph/locales \
  congraph/workflows \
  congraph/filesystem \
  congraph/eav \
  congraph/entity-elastic \
  congraph/laravel-api
```

### 4. Install Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
php artisan migrate
```

Configure Sanctum in the Laravel 13 app and use `auth:sanctum` as the CMS/admin middleware.

### 5. Configure Congraph API

Create `config/congraph-api.php` in the host app:

```php
<?php

return [
    'enabled' => true,
    'route_prefix' => 'congraph/api/v1',
    'route_name_prefix' => 'CB.',
    'middleware' => ['api', 'auth:sanctum'],
    'delivery_middleware' => ['api'],
    'include_metadata' => true,
    'nested_include' => true,
];
```

### 6. Verify routes

```bash
php artisan route:list | grep congraph
```

You should see:

- static CRUD routes like `/congraph/api/v1/entities`
- typed entity routes like `/congraph/api/v1/{type}`
- delivery routes like `/congraph/api/v1/delivery/entities`
- typed delivery routes like `/congraph/api/v1/delivery/{type}`

### 7. Configure services

Typical app environment:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=congraph
DB_USERNAME=congraph
DB_PASSWORD=congraph

OPENSEARCH_HOSTS=127.0.0.1:9200
```

### 8. App responsibilities vs package responsibilities

Keep these in the Laravel app:

- Sanctum setup
- `User` model
- login/logout/token issuing endpoints
- policies and permission wiring
- project-specific controllers

Use `congraph/laravel-api` for:

- reusable Congraph CRUD endpoints
- typed content routes
- delivery routes
- shared API response/linking behavior

## Development workflow

### Install dependencies

Each package is intentionally isolated. Install dependencies package-by-package as needed:

```bash
cd packages/eav
composer update -W
```

### Typical package loop

```bash
cd packages/eav
composer update -W
composer test
composer test:pgsql
```

For `entity-elastic`:

```bash
cd packages/entity-elastic
composer update -W
composer test
composer test:pgsql
composer test:opensearch
```

### Focused OpenSearch suite runs

Example:

```bash
cd packages/entity-elastic
composer test:opensearch -- tests/integration/IndexAllCommandTest.php
```

## Contribution guidelines

### General rules

- Prefer local path repositories and monorepo package dependencies.
- Do not reintroduce MySQL-only SQL assumptions.
- Favor PostgreSQL-safe and SQLite-safe test behavior where possible.
- Add tests for real behavioral regressions, not only happy paths.
- Keep reusable CMS HTTP logic in `laravel-api`, not in host app copies.

### Package upgrade conventions established in this repo

- PHPUnit 12
- Orchestra Testbench `11.x-dev`
- Laravel 13-compatible package wiring
- env-driven database config for tests
- SQLite for quick feedback
- PostgreSQL as the realistic integration target
- OpenSearch for `entity-elastic`

### Before opening a PR or merging local work

Run the relevant package tests:

```bash
composer test
composer test:pgsql
composer test:opensearch
```

If you only changed one package, run its focused suite locally first.

## Migration notes from this upgrade cycle

This monorepo already completed a major Laravel 13 / PHP 8.4 modernization pass:

- all core packages were upgraded
- package test harnesses were modernized
- PostgreSQL-backed testing was added where it matters
- `entity-elastic` was modernized to OpenSearch
- `filesystem` was upgraded to Intervention Image v3
- `laravel-api` was introduced as the modern replacement for older copied app-local Congraph HTTP controllers

For the next major integration target, see:

- [Pravnikapi upgrade context](/Users/nikolap/git/np/congraph/docs/contexts/pravnikapi-upgrade-session.md)
- [Congraph project skill](/Users/nikolap/git/np/congraph/skills/congraph-project/SKILL.md)
