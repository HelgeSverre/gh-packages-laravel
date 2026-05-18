# TreniTardi

[![release](https://github.com/marcocot/trenitardi/actions/workflows/release.yaml/badge.svg)](https://github.com/marcocot/trenitardi/actions/workflows/release.yaml)
[![PHP 8.4](https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white)](https://www.php.net)
[![Laravel 12](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![Livewire 4](https://img.shields.io/badge/Livewire-4-FB70A9?logo=livewire&logoColor=white)](https://livewire.laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A mobile-first web app to monitor Italian train status in real time, powered by the ViaggiaTreno public API. No accounts, no database — just punch in a train number and get live updates.

## What it does

- Real-time train status via the ViaggiaTreno public API
- Stop-by-stop breakdown with delays and platform info
- Save favorite trains locally in your browser (no login needed)
- Deep-linkable train pages — share a `/status/{trainNumber}` URL directly

## Stack

- **Laravel 12** — application framework
- **Livewire 4** — reactive components (single-file, no build step for PHP)
- **Tailwind CSS 4** — styling
- **Alpine.js** — client-side state (favorites via `localStorage`)
- **ViaggiaTreno API** — the data source

## Getting started

```bash
git clone git@github.com:marcocot/trenitardi.git
cd trenitardi
composer run setup
composer run dev
```

The app will be available at `http://localhost:8000`.

> `composer run setup` handles everything: installing PHP/JS deps, copying `.env`, generating the app key, and building assets.

## Running tests

```bash
php artisan test --compact
```

To check code style without fixing anything:

```bash
composer lint:check
```

To auto-fix style issues:

```bash
composer lint
```

## Architecture notes

All data comes from two ViaggiaTreno API calls:

1. `/cercaNumeroTrenoTrenoAutocomplete/{trainNumber}` — resolves the train ID and origin station
2. `/andamentoTreno/{trainId}/{trainNumber}/{timestamp}` — returns the full status JSON

The `TrainService` handles both calls. DTOs in `app/DTOs/` map the Italian API keys to typed English properties, validated with `webmozart/assert`. The Livewire component stores raw API data as `?array` and exposes typed DTOs via `#[Computed]` properties.

## Deployment

The app ships as a single Docker image published to `registry.homelab.devncode.it/trenitardi-web` by GitHub Actions on every GitHub **release**. Tags are multi-arch (`linux/amd64`, `linux/arm64`) and the versioning follows the release tag (`v1.2.3` → `1.2.3`, `1.2`, `latest`).

Local image workflows are driven by `just`:

```bash
just build                 # build single-arch local image
just login                 # docker login (expects REGISTRY_USERNAME / REGISTRY_PASSWORD)
just push TAG=1.2.3        # buildx multi-arch push
just release v1.2.3        # tag + gh release (triggers CI publish)
```

The container listens on port `8080` and is designed to sit behind a reverse proxy (Traefik/nginx) that handles TLS.

## Contributing

PRs are welcome. The `release` workflow (lint + tests) runs automatically on every pull request — make sure both jobs are green before requesting a review.
