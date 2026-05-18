# Code Usage Telemetry

Laravel package that ships the runtime telemetry tooling used detect which controllers, jobs, events, listeners and commands actually run in production.

## Installation

```bash
composer require qwerkon/code-usage
```

The package is auto-discovered but you can manually register `Qwerkon\CodeUsage\Providers\CodeUsageServiceProvider` in `config/app.php` if needed.

## Configuration

Publish the default configuration when you first install the package:

```bash
php artisan vendor:publish --tag=code-usage-config
```

Key settings:

- `code_usage.enabled` – master switch (set via `CODE_USAGE_ENABLED`).
- `code_usage.sample_rate` – float between 0.0 and 1.0 to sample hits.
- `code_usage.throttle_per_minute` – maximum records per symbol per minute.
- `code_usage.include_namespaces` / `exclude_namespaces` – limit what symbols are tracked.
- `code_usage.meta_enabled` – whether to persist contextual metadata.
- `code_usage.queue_connection` / `queue_name` – configure where `FlushCodeUsageBatchJob` runs.

## Runtime

When enabled the package:

1. Registers the `track-code-usage` middleware to log each routed controller action.
2. Swaps the event dispatcher to capture event/listener invocations.
3. Hooks `JobProcessing`, `JobProcessed`, `CommandStarting`, `CommandFinished` to track jobs and commands.
4. Buffers hits per request and flushes via `FlushCodeUsageBatchJob` (with a sync fallback).

The buffer uses `code_usage_hits`/`code_usage_symbols`/`code_usage_meta` tables defined in the bundled migrations.

## Artisan helpers

- `php artisan code-usage:report` – prints top hitters and “never seen” symbols per kind.
- `php artisan code-usage:prune --days=30` – removes hits older than `retention_days`.
