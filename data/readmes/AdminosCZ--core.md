# ADMINOS Core

Core framework for ADMINOS — a Laravel + Filament admin platform with plugin architecture.

This package provides the foundational service provider, plugin registry, and extension points consumed by ADMINOS modules (feed manager, rental, service, …) and by downstream client projects built on `adminos/skeleton`.

## Status

Early scaffold. Public API is not yet stable. Breaking changes may happen between `0.x` releases.

Classes marked with the `@api` annotation are the public surface — later releases will respect SemVer against them. Anything else is internal and may change without notice.

## Installation

```bash
composer require adminos/core
```

The service provider is auto-discovered via Laravel's `extra.laravel.providers` mechanism — no manual registration required.

## Requirements

- PHP 8.3+
- Laravel 13+

## License

Proprietary. See [LICENSE](LICENSE). Copyright © Rekoj.cz.

## Issues and pull requests

This repository is a **read-only mirror** generated from the [`AdminosCZ/adminos`](https://github.com/AdminosCZ/adminos) monorepo by a subtree-split GitHub Action. Pull requests and issues opened here cannot be merged. File them against the monorepo instead:

- Issues: https://github.com/AdminosCZ/adminos/issues
- Pull requests: https://github.com/AdminosCZ/adminos/pulls
