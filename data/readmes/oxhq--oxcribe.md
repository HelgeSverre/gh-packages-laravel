# Oxcribe

`Oxcribe` is a runtime-first Laravel package for generating and publishing API docs from the routes, middleware, bindings, and responses your app actually serves.

It boots Laravel, captures the real route graph, sends a strict `AnalysisRequest` to `oxinfer`, and merges runtime truth with static analysis before emitting OpenAPI and docs payloads.

## Status

`v0.1.4` is the current public preview release of `oxcribe`.

This release is aimed at Laravel teams that already ship APIs and want accurate docs without hand-maintained OpenAPI files. It is ready for real-world preview use on Laravel API projects, but it should still be treated as an early release: validate the output on your own routes before rolling it into a production docs workflow.

## Why Oxcribe

- use Laravel runtime as the source of truth for routes, middleware, guards, and bindings
- enrich runtime truth with `oxinfer` static analysis for request fields, resources, examples, and response overlays
- publish the same normalized docs payload to a local viewer or to `oxcloud`

The intended launch path is simple:

1. Install `oxcribe` inside the Laravel app.
2. Install or point to an `oxinfer` binary.
3. Issue one project-scoped publish token from Oxcribe Cloud.
4. Run `php artisan oxcribe:doctor`.
5. Run `php artisan oxcribe:publish`.
6. Open the hosted docs, explorer, and changelog for that version.

## What It Owns

- boots Laravel and snapshots real routes, middleware, bindings and action references
- keeps runtime auth/security as the source of truth for OpenAPI `security`
- merges static controller analysis, resources, request/response overlays and authorization hints from `oxinfer`
- exports an OpenAPI document with `x-oxcribe.*` metadata for runtime and static provenance

## Requirements

- PHP `8.2+`
- Laravel `10`, `11`, `12` or `13`
- a local `oxinfer` binary available on `PATH`, placed at `bin/oxinfer` inside the Laravel app, or configured in `config/oxcribe.php`

`oxinfer` is the Rust analysis engine behind `oxcribe`. Build it like this:

```bash
cargo build --locked --release
cargo test --locked
```

If `oxinfer` is not on `PATH`, either place it at `bin/oxinfer` in the Laravel app or point `oxcribe.oxinfer.binary` to the built binary.

## Install

```bash
composer require oxhq/oxcribe
php artisan vendor:publish --tag=oxcribe-config
```

If you do not already have `oxinfer`, install the matching release binary directly from GitHub:

```bash
php artisan oxcribe:install-binary v0.1.4
```

That command detects the local OS and architecture, downloads the release asset from `oxhq/oxinfer`, verifies its SHA-256 checksum, and installs it into the app-local binary path that `oxcribe` already resolves.

## Minimal Config

```php
// config/oxcribe.php
return [
    'oxinfer' => [
        'binary' => env('OXINFER_BINARY', 'oxinfer'),
        'working_directory' => env('OXINFER_WORKING_DIRECTORY'),
        'timeout' => (int) env('OXINFER_TIMEOUT', 120),
    ],
];
```

## Commands

```bash
php artisan oxcribe:analyze
php artisan oxcribe:export-openapi
php artisan oxcribe:publish
php artisan oxcribe:doctor
php artisan oxcribe:install-binary v0.1.4
```

Both commands support `--write=/absolute/path.json` and `--pretty`.
`oxcribe:publish` pushes the current OpenAPI document and `oxcribe.docs.v1` payload to `oxcloud`.

## Docs Data Endpoints

`oxcribe` exposes stable JSON endpoints. The package owns the data contract; your local app or `oxcloud` can render any viewer on top of it.

Enable docs in `config/oxcribe.php`:

```php
'docs' => [
    'enabled' => true,
    'route' => 'oxcribe/docs',
    'openapi_route' => 'oxcribe/openapi.json',
    'payload_route' => 'oxcribe/docs/payload.json',
],
```

Routes provided by the package:

- `GET /oxcribe/docs`
- `GET /oxcribe/openapi.json`
- `GET /oxcribe/docs/payload.json`

`/oxcribe/docs` is a package-owned local Vue viewer, similar in spirit to how Scramble serves its UI from the package itself.
The OpenAPI route is the canonical machine-readable document.
The payload route returns the richer `oxcribe.docs.v1` viewer payload, including generated examples, snippets, runtime metadata, and component schemas.
`oxcloud` can consume that same payload contract and host a more advanced version of the same experience.

## Publish To Oxcloud

Configure the publish target:

```env
OXCLOUD_BASE_URL=https://oxcloud.example.test
OXCLOUD_TOKEN=your-project-publish-token
OXCLOUD_TIMEOUT=30
OXCLOUD_DEFAULT_VERSION=dev
```

Then publish:

```bash
php artisan oxcribe:doctor
php artisan oxcribe:publish
php artisan oxcribe:publish --publish-version=2026.03.25
```

On success the command prints:

- the hosted version URL
- the explorer URL for the same version
- the changelog URL for the same version
- the project latest URL

The command sends:

- `contractVersion = "oxcloud.publish.v1"`
- `version`
- `openapi`
- `docsPayload`
- `source.appName`
- `source.appUrl`
- `source.framework = "laravel"`
- `source.packageVersion = "oxcribe v0.1.4"`

## Overrides

Runtime is the primary source of truth, but `oxcribe` also supports route-level overrides through `.oxcribe.php` or `oxcribe.overrides.php`.

- docs: [docs/overrides.md](docs/overrides.md)
- minimal example: [docs/minimal.oxcribe.php](docs/minimal.oxcribe.php)

## Supported Stacks

- Laravel core request/response/resource patterns
- runtime auth and middleware-derived OpenAPI security
- first-class publish visibility via `oxcribe.publish` / `oxcribe.private` middleware markers
- Inertia transport metadata
- Spatie `laravel-data`, `laravel-query-builder`, `laravel-permission`, `laravel-medialibrary` and `laravel-translatable`

## Current Limits

- `security` is derived from runtime middleware/auth, not from static authorization hints
- static authorization hints are exposed under `x-oxcribe.authorizationStatic`
- Livewire and non-Laravel stacks are out of scope
- preview release: validate generated docs on your own routes before depending on them as the only source of truth
- the local viewer is package-owned and does not depend on publishing frontend stubs into the host app

## Package Docs

- installation: [docs/installation.md](docs/installation.md)
- troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- compatibility and fixtures: [docs/compatibility.md](docs/compatibility.md)
- overrides: [docs/overrides.md](docs/overrides.md)
- release checklist: [docs/release.md](docs/release.md)
