# Redae Core (applications core)

This repository contains only the base "core" on which we can publish and install public and private packages. It does not contain complete applications: its sole responsibility is to provide the foundation (configuration, layouts, utilities and assets) so that packages can be mounted on top of it.

## Purpose
- Keep a small and stable core for all the applications.
- Expose entry points, shared layouts and utilities.
- Allow packages (Composer / npm) to be installed and provide additional functionality.
- Serve as the CORE project for the installation of future public or private packages.
- Built on the latest available version of Laravel, constantly updated and designed to work together with the Laravel ecosystem.

## Important Structure
Review these key core files/entries:
- [composer.json](composer.json)
- [package.json](package.json)
- [bootstrap/app.php](bootstrap/app.php)
- [bootstrap/providers.php](bootstrap/providers.php)
- [vite.config.ts](vite.config.ts)
- [resources/js/app.ts](resources/js/app.ts)
- [resources/css/app.css](resources/css/app.css)
- [config/app.php](config/app.php)

## Recommended Workflow
1. Clone the core and prepare the environment:
   - cp .env.example .env
   - composer install
   - npm install

2. Frontend development:
   - npm run dev
   - For production: npm run build
   - If you don’t see UI changes, run `npm run build` or `npm run dev` as needed.

3. PHP development:
   - php artisan migrate --seed (if you need a database in your environment)
   - Run specific tests with `php artisan test --filter=...`

4. Package installation:
   - PHP (Composer): `composer require vendor/package`
   - JS (npm): `npm install @scope/package`
   - For local development packages you can use local repositories in `composer.json` or `npm link` / workspaces as you prefer.

## Quick Conventions and Rules
- This project uses Inertia + Vue 3; the client entry point is [resources/js/app.ts](resources/js/app.ts).
- The main stylesheets live in [resources/css/app.css](resources/css/app.css).
- Follow the core conventions for names, components and styles (reuse components in [resources/js/components](resources/js/components) whenever possible).
- For PHP code changes, maintain proper typing and PHPDoc; review [bootstrap/app.php](bootstrap/app.php) and [bootstrap/providers.php](bootstrap/providers.php) for framework bootstrap.

## Contributions and Changes
- Keep the core as small and stable as possible.
- For new functionality not strictly belonging to the core, create external packages (private or public).
- Document any public contract (APIs, hooks, slots, or events) that packages will consume.
