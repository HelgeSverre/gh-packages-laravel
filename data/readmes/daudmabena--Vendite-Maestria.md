# Vendite & Maestria

**Vendite & Maestria** is a Laravel e-commerce platform built as a modular monolith: domain logic lives in isolated packages under `domains/`, and the root app composes them.

## Application design

- The root Laravel app is the composition layer (HTTP entrypoints, global config, shared runtime).
- Business capabilities are split into isolated domain packages under `domains/`.
- Each domain is loaded as a local Composer path package (`repositories: domains/*`), then auto-registered via service providers.
- Domains keep their own routes, migrations, models, resources, and tests to preserve bounded contexts and reduce coupling.

## Domain modules

Current modules live in `domains/`:

- `shop-core`: channels, locales, currencies, countries, zones, tax and shipping categories.
- `catalog`: products, variants, taxons, options, attributes, pricing, images, reviews, and translations.
- `customer`: customers, addresses, and customer groups.
- `checkout`: orders, order items/units, adjustments, payment methods, and payments.
- `fulfillment`: shipping methods, shipments, and shipment units.
- `promotion`: promotions, rules, actions, channel assignment, and coupons.
- `content`: storefront contact and content-oriented models.
- `reporting`: reporting-focused domain capabilities.

Reference: [domains folder on GitHub](https://github.com/daudmabena/Vendite-Maestria/tree/main/domains)

## Module layout convention

Each domain follows the same package structure:

```text
domains/<module>/
  composer.json
  src/
  routes/
  database/
  resources/
  tests/
```

## Getting started

### Requirements

- PHP 8.3+
- [Composer](https://getcomposer.org/)
- **Node.js** (includes **npm**) — current LTS is fine; Vite and the frontend toolchain need a working `node` and `npm`.

### Install Node.js and npm

Pick one approach:

- **Official installer:** download from [https://nodejs.org](https://nodejs.org) (LTS) and install.
- **macOS (Homebrew):** `brew install node`
- **Version managers:** [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), or [asdf](https://asdf-vm.com/) — install Node LTS, then use the `node` / `npm` they provide.

Verify:

```bash
node -v
npm -v
```

### First-time project setup

From the project root:

1. **Environment**

   ```bash
   cp .env.example .env   # if you do not already have .env
   php artisan key:generate
   ```

   Edit `.env` and set `APP_URL` and your **database** connection (`DB_*` for MySQL/PostgreSQL, or `DB_CONNECTION=sqlite` and point `DB_DATABASE` at a SQLite file if you use SQLite).

2. **PHP dependencies**

   ```bash
   composer install
   ```

3. **JavaScript dependencies** (required for `npm run dev` / Vite; run after clone or whenever `package.json` changes)

   ```bash
   npm install
   ```

4. **Database migrations**

   ```bash
   php artisan migrate
   ```

   Optional: seed demo data if you add seeders:

   ```bash
   php artisan db:seed
   ```

5. **Production-style frontend build** (optional for local dev; needed for deployed assets)

   ```bash
   npm run build
   ```

### One-command setup

If your database is already configured in `.env`, you can run everything Composer wires up (install, key, migrate, `npm install`, build):

```bash
composer setup
```

Note: `composer setup` uses `php artisan migrate --force` and `npm install --ignore-scripts`. Adjust `.env` first so migrations target the correct database.

### Development

Requires `npm install` so `vite` exists under `node_modules/.bin`.

```bash
composer dev
```

Starts the app server, queue worker, log tail (`pail`), and Vite (`npm run dev`) together.

If you prefer to run pieces yourself:

```bash
php artisan serve
php artisan queue:listen
npm run dev
```

### Database and migrations (reference)

| Command | Purpose |
| -------- | -------- |
| `php artisan migrate` | Run pending migrations |
| `php artisan migrate:status` | List migration state |
| `php artisan migrate:fresh` | Drop all tables and re-run migrations (**destructive**) |
| `php artisan migrate:fresh --seed` | Fresh migrate then seed |
| `php artisan migrate:rollback` | Roll back the last batch |

Domain packages register their migrations with Laravel; you do not run separate migrate commands per folder.

### Other useful commands

| Command | Purpose |
| -------- | -------- |
| `composer test` | Clear config cache and run the test suite |
| `php artisan optimize:clear` | Clear application, config, route, and view caches |
| `vendor/bin/pint` | Format PHP with Laravel Pint (if you use it locally) |
| `npm run build` | Build frontend assets for production |

### Tests

```bash
composer test
```

## Contribution notes

- Prefer adding behavior in the appropriate domain package rather than the root app.
- Keep domain boundaries explicit; cross-domain dependencies should be intentional and minimal.
- Add or update tests in the touched domain package.

## License

MIT
