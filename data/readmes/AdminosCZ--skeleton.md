# ADMINOS Skeleton

Starter Laravel + Filament template for client projects built on the ADMINOS platform.

## What you get out of the box

- Laravel 13 + Filament 4 admin panel at `/admin`
- Apple-vibe theme with five primary colour schemes (modrá, zelená, červená, magenta, černá), per-client logo / favicon upload, dark mode
- CZ / SK / EN localisation with role-gated admin language switcher
- Profile page with avatar upload
- Dynamic gradient background, sticky topbar, collapsible sidebar
- `adminos/core` plugin loader pre-wired — manifest-based plugin discovery from `composer.json > extra.adminos` works out of the box

## Creating a new client project

```bash
composer create-project adminos/skeleton my-client
cd my-client
composer setup
```

`composer setup` runs the canonical first-time bootstrap (install, copy `.env`, key generation, migrations, npm install, asset build).

Then visit `http://my-client.test/admin` (or whichever URL your local dev environment has parked the directory at — see [Herd](https://herd.laravel.com/) or `php artisan serve`).

## Adding ADMINOS modules

Each module is a separate composer package under the `adminos/` vendor:

```bash
composer require adminos/feedmanager
php artisan migrate
```

Modules auto-register through `extra.adminos` manifest discovery; no manual provider wiring required.

## Customising for the client

Override defaults without forking:

- `config/client.php` — config overrides
- `app/Custom/` — client-specific Filament pages, widgets, event listeners
- DI bindings in a custom service provider — swap interface implementations declared by ADMINOS modules

**Never edit code inside `vendor/adminos/`.** Updates to ADMINOS modules will overwrite changes. If a module doesn't expose the hook you need, raise an issue on `AdminosCZ/adminos` so the extension point can be added upstream.

## Requirements

- PHP 8.3+
- Node.js 20+
- A database (SQLite / MySQL / PostgreSQL)

## Status

This is a pre-stable preview. Public APIs marked `@api` follow SemVer; everything else may change without notice between `0.x` releases.

## License

Proprietary. See [LICENSE](LICENSE). Copyright © Rekoj.cz.

## Issues and pull requests

This repository is a **read-only mirror** generated from the [`AdminosCZ/adminos`](https://github.com/AdminosCZ/adminos) monorepo by a subtree-split GitHub Action. Pull requests and issues opened here cannot be merged. File them against the monorepo instead:

- Issues: https://github.com/AdminosCZ/adminos/issues
- Pull requests: https://github.com/AdminosCZ/adminos/pulls
