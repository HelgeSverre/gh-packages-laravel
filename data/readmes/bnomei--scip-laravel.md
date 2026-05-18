# scip-laravel

[![Laravel 11-13](https://flat.badgen.net/badge/Laravel/11-13?color=F05340)](https://laravel.com)
![PHP 8.3+](https://flat.badgen.net/badge/PHP/8.3%2B?color=4E5B93&icon=php&label)
[![Tests](https://github.com/bnomei/scip-laravel/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/bnomei/scip-laravel/actions/workflows/tests.yml)
[![License](https://flat.badgen.net/badge/license/MIT?color=999999)](LICENSE)
[![Discord](https://flat.badgen.net/badge/discord/bnomei?color=7289da&icon=discord&label)](https://discordapp.com/users/bnomei)
[![Buymecoffee](https://flat.badgen.net/badge/icon/donate?icon=buymeacoffee&color=FF813F&label)](https://www.buymeacoffee.com/bnomei)

`scip-laravel` is a Laravel-aware SCIP generator for Laravel applications. Install it into the Laravel app you want to index as a dev dependency only. It is an indexing and code-intelligence tool, not a production runtime dependency.

`scip-laravel` builds on:

- [`scip-php`](https://github.com/davidrjenni/scip-php) for baseline PHP SCIP indexing
- [`Surveyor`](https://github.com/laravel/surveyor) for Laravel-aware analysis metadata
- [`Ranger`](https://github.com/laravel/ranger) for Laravel application inventories such as routes, models, broadcast surfaces, and Inertia pages

Consumers should execute the repo-local `vendor/bin/scip-laravel` binary to generate a merged `index.scip`. What this package adds on top of those three pillars is the Laravel-specific merge and enrichment layer, so AI agents can retrieve Laravel-native concepts from the SCIP file, not just raw PHP symbols. In practice that includes:

- Eloquent model members such as declared properties, declared methods, static methods, constants, attributes, accessors, mutators, relations, and supported model-style reads and writes from PHP, Blade, and Volt; syntactically declared members resolve precisely when statically knowable, while dynamic Eloquent members such as magic attributes, unresolved relation-style properties, and other runtime-only indirection remain best-effort
- named routes as first-class symbols, with definitions in `routes/*.php` and references from `route(...)`, `to_route(...)`, `request()->routeIs(...)`, `redirect()->route(...)`, plus controller links and supported Volt and full-page Livewire route anchors
- Blade views and component edges from `view()`, `@extends`, `@include*`, `<x-...>`, `<livewire:...>`, `@livewire(...)`, and supported local prefixed components such as `flux:*`
- Livewire and Volt component semantics such as supported `wire:model`, `wire:click`, `wire:submit`, Blade-local props and slots, route-bound model usage, and validation keys
- Inertia page names and contract symbols for page props and shared data from `Inertia::render(...)` back to local page files
- broadcast channel names and payload contract symbols from channel definitions, `broadcastOn()`, and broadcast payload usage
- config keys as first-class symbols from `config/*.php`, with references from `config(...)`, `Config::get(...)`, and `app('config')->get(...)`
- translation keys as first-class precise symbols from PHP and JSON lang files, with raw-key display names and references from `__()`, `trans()`, `trans_choice()`, `Lang::get()`, and `@lang`, using one stable symbol per raw key shared across locale variants in the same translation family
- environment variables as first-class symbols from `.env.example` and `.env`, with references from `env(...)` lookups including defaulted forms such as `env('KEY', false)`

## Compatibility

- Laravel: 11, 12, and 13
- PHP: `^8.3`

The package bundles a compatible `scip-php` runtime inside this repository so Composer installs do not depend on an unpublished upstream tag.

The vendored `packages/scip-php` copy is intentionally patched locally for performance and bootstrap compatibility. See [packages/scip-php/LOCAL_PATCHES.md](/Users/bnomei/Sites/scip-laravel/packages/scip-php/LOCAL_PATCHES.md) and do not update that directory blindly from upstream.

## Install

Install it into the target Laravel app as a local dev dependency:

```bash
composer require --dev bnomei/scip-laravel
```

Do not add it as a production dependency. Consumers should invoke the repo-local binary from that install.

The target Laravel app must have a readable `composer.json`, `composer.lock`, `vendor/autoload.php`, and `vendor/composer/installed.php`.

## Usage

Generate `index.scip` in the current Laravel app:

```bash
vendor/bin/scip-laravel
```

Generate to a custom path:

```bash
vendor/bin/scip-laravel --output=build/index.scip
```

Index a different Laravel app from outside its root:

```bash
vendor/bin/scip-laravel /path/to/laravel-app
```

Show the CLI contract:

```bash
vendor/bin/scip-laravel --help
```

## Usage With AI-Assisted Development

If you use AI coding tools, [Frigg](https://github.com/bnomei/frigg) is a good companion to `scip-laravel`.

`scip-laravel` generates a Laravel-aware `index.scip`. Frigg is a local-first, read-only MCP server for code understanding that can use optional SCIP overlays alongside source-backed repository indexing. In practice, that means better navigation and code search for PHP, Blade, and adjacent repositories without turning this package into a hosted service or runtime dependency. Think of it as PHPStorm with the Laravel Idea plugin but for your agents.

## CLI

```text
vendor/bin/scip-laravel [--output=index.scip] [--config=scip-laravel.php] [--mode=safe|full] [--strict] [--feature=models,routes,views,inertia,broadcast,config,translations,env] [target-root]
```

- `target-root` defaults to the current working directory.
- Relative `target-root` values resolve from the current working directory.
- Relative `--config` and `--output` values resolve from the resolved target root.
- `--feature` is an explicit allow-list override.

## Modes

- `full` is the default whenever `--mode` is omitted. It boots the target app as-is and prioritizes maximum discovery.
- `safe` applies deterministic runtime overrides before Laravel boot for cache, session, queue, mail, filesystem, broadcast, and database-related settings where possible. Use `--mode=safe` when you need that behavior.
- `--strict` makes enabled enricher failures fatal. Without it, post-baseline enricher failures fail open.

## Config

An optional repo-root `scip-laravel.php` file may return:

```php
<?php

return [
    'output' => 'index.scip',
    'mode' => 'full',
    'strict' => false,
    'features' => [
        'models',
        'routes',
        'views',
        'inertia',
        'broadcast',
        'config',
        'translations',
        'env',
    ],
];
```

CLI flags override config defaults for `output`, `config`, `mode`, and `feature`. If `--mode` is omitted, the config `mode` is used when present; otherwise the default is `full`. `--strict` only elevates to `true`.

## Notes

- Smoke-tested in this repository against a real Laravel 13 skeleton.
- If the target is not a supported Laravel app, the command exits with an explicit diagnostic.

## Local Testbeds

A repeatable local Flux testbed is available under [fixtures/flux-app/README.md](/Users/bnomei/Sites/scip-laravel/fixtures/flux-app/README.md).

Prepare the local checkout:

```bash
./fixtures/flux-app/scaffold.sh
```

Run `scip-laravel` against it:

```bash
./fixtures/flux-app/index.sh
```

Recent local warmed runs on the prepared Flux acceptance fixture are around the 0.8 second mark end-to-end via `./fixtures/flux-app/index.sh`, so it is also the easiest way to sanity-check indexing performance while working on compiler changes.

Prepare the acceptance-ready fixture variant with the repo-owned probes and normalized no-dev install:

```bash
./fixtures/flux-app/prepare-acceptance.sh
```

## Tests

Run the full package suite:

```bash
vendor/bin/phpunit
```

Run the Laravel acceptance integration coverage:

```bash
vendor/bin/phpunit --filter LaravelEnrichersAcceptanceTest
vendor/bin/phpunit --filter RuntimeModesAcceptanceTest
```

Run the deterministic Flux snapshot verification:

```bash
vendor/bin/phpunit --filter FluxSnapshotTest
```
