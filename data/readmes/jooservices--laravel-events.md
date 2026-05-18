# Laravel Events

[![CI](https://github.com/jooservices/laravel-events/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/jooservices/laravel-events/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jooservices/laravel-events/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jooservices/laravel-events)
[![PHP Version](https://img.shields.io/badge/PHP-8.5%2B-blue.svg)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Packagist Version](https://img.shields.io/packagist/v/jooservices/laravel-events)](https://packagist.org/packages/jooservices/laravel-events)

Lightweight Event Sourcing and Event Log persistence for Laravel with **MongoDB** storage. Store domain event payloads by aggregate and/or model change audit trails (prev/changed/diff) via Laravel's native event dispatcher.

Package name: `jooservices/laravel-events`

- **Laravel 12** · **PHP 8.5+**
- **MongoDB** via [mongodb/laravel-mongodb](https://github.com/mongodb/laravel-mongodb)

---

## Introduction

This package adds two persistence features on top of Laravel's event system:

1. **Event Sourcing** — Events implementing `EventSourcingInterface` are stored in a `stored_events` MongoDB collection (payload, aggregate id, metadata, user, time). Use for aggregate history, replay-oriented records, or audit by aggregate.
2. **Event Log** — Events implementing `LoggableModelInterface` are stored in an `event_logs` collection with previous/changed state and a per-field diff. Use for audit trails and compliance.

You dispatch events as usual; package subscribers persist them to MongoDB. No custom bus or queue required.

## Scope

Use this package when you need a reusable Laravel-standard base library for persisting event records or audit logs.

This package does **not**:

- replace Laravel's event dispatcher
- provide a projection/read-model framework
- provide a business analytics or reporting layer
- provide dashboards, projections, or analytics/reporting workflows
- provide AI agents, AI data fetching, or an AI runtime

## When to Use

| Need | Use |
|------|-----|
| Persist domain events by aggregate for historical inspection or replay-aware workflows | Event Sourcing |
| Persist model/entity changes with previous/current values and field diff | Event Log |
| Need both domain history and field-level audit | Use both, with separate focused events |
| Need dashboards, projections, analytics, or AI retrieval | Build that in the application layer |

---

## Quick Start

### Install

```bash
composer require jooservices/laravel-events
```

### Publish config (optional)

```bash
php artisan vendor:publish --tag=laravel-events-config
```

### Environment

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=your_db
EVENTS_EVENTSOURCING_ENABLED=true
EVENTS_EVENT_LOG_ENABLED=true
```

Ensure a `mongodb` connection exists in `config/database.php` (see [mongodb/laravel-mongodb](https://github.com/mongodb/laravel-mongodb)).

### Indexes

```bash
php artisan events:install-indexes
```

---

## Basic Usage

### Event Sourcing

Implement `EventSourcingInterface` and dispatch:

```php
use JOOservices\LaravelEvents\EventSourcing\Contracts\EventSourcingInterface;

class OrderCreated implements EventSourcingInterface
{
    public function __construct(public string $orderId, public array $items) {}

    public function payload(): array
    {
        return ['order_id' => $this->orderId, 'items' => $this->items];
    }

    public function aggregateId(): ?string
    {
        return $this->orderId;
    }
}

event(new OrderCreated('ORD-001', [['sku' => 'X', 'qty' => 2]]));
```

Events are stored in the `stored_events` collection. Optional: `occurredAt(): ?\Carbon\CarbonInterface`, `metadata(): array`. Use the `HasEventSourcingDefaults` trait to implement only `payload()` and `aggregateId()`.

Recommended metadata keys include `request_id`, `correlation_id`, `causation_id`, `source`, `channel`, `reason_code`, `schema_version`, `event_version`, `event_category`, and optional `tenant_id`. The `EventMetadata` helper exposes constants and small factory methods for those conventions.

Use `event_category` for a lightweight event type convention when you need broad categories such as `domain`, `integration`, `audit`, or `system` without introducing a full event taxonomy framework.

### Event Log (Audit)

Implement `LoggableModelInterface` (and optionally `HasLogAction`) and dispatch with prev/changed state. Use the `DefaultsToUpdatedAction` trait when the action is always `updated`:

```php
use JOOservices\LaravelEvents\EventLog\Concerns\DefaultsToUpdatedAction;
use JOOservices\LaravelEvents\EventLog\Contracts\LoggableModelInterface;
use JOOservices\LaravelEvents\EventLog\Contracts\HasLogAction;

class OrderUpdated implements LoggableModelInterface, HasLogAction
{
    use DefaultsToUpdatedAction;

    public function __construct(public Order $model, public array $prev) {}

    public function getLoggableType(): string { return $this->model->getMorphClass(); }
    public function getLoggableId(): string { return (string) $this->model->getKey(); }
    public function getPrev(): array { return $this->prev; }
    public function getChanged(): array { return $this->model->getAttributes(); }
}
```

Changes are stored in `event_logs` with a computed diff. Query by `entity_type` + `entity_id`.

Recommended action names are available from `JOOservices\LaravelEvents\EventLog\EventLogAction`: `created`, `updated`, `deleted`, `restored`, `status_changed`, `corrected`, `synchronized`, and `imported`.

---

## Querying

```php
use JOOservices\LaravelEvents\Query\EventLogQueryService;
use JOOservices\LaravelEvents\Query\StoredEventQueryService;

$events = app(StoredEventQueryService::class)->byAggregateId('ORD-001');
$domainEvents = app(StoredEventQueryService::class)->byEventCategory('domain');
$audit = app(EventLogQueryService::class)->byEntity('orders', 'ORD-001');
```

Query services return typed package data records and intentionally stay small.
Build dashboards, projections, and reporting in your application.

`JOOservices\...` is the canonical package namespace in `1.2.0`. The legacy `JooServices\...` namespace remains available for backward compatibility.

## Redaction

Recursive redaction is enabled by default for common secret keys:

```php
'redaction' => [
    'enabled' => true,
    'keys' => ['password', 'token', 'authorization'],
    'replacement' => '[REDACTED]',
],
```

This masks stored event payload/metadata and event log `prev`, `changed`,
`diff`, and `meta`. It is defensive masking, not a replacement for avoiding
secrets in dispatched events.

## Retention

Optional MongoDB TTL indexes are configured with:

```env
EVENTS_STORED_EVENTS_RETENTION_DAYS=
EVENTS_EVENT_LOGS_RETENTION_DAYS=365
```

Run `php artisan events:install-indexes` after changing retention settings.
MongoDB TTL deletion is asynchronous.

## Bulk Records

```php
use JOOservices\LaravelEvents\Data\StoredEventData;
use JOOservices\LaravelEvents\EventService;

app(EventService::class)->recordManyStoredEvents([
    new StoredEventData('OrderImported', ['order_id' => 'ORD-001'], 'ORD-001'),
]);
```

Bulk APIs normalize and redact each record before MongoDB batch insert.

---

## Documentation

Full documentation is in the **`./docs`** folder:

| Document | Description |
|----------|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [Architecture](docs/00-architecture/01-project-overview.md) | Design, data flow, diagrams |
| [Code structure](docs/00-architecture/02-repository-structure.md) | Package layout and namespaces |
| [Installation](docs/01-getting-started/01-installation.md) | Requirements and setup |
| [Configuration](docs/01-getting-started/02-configuration.md) | Config and context provider |
| [Decision Guide](docs/02-user-guide/10-best-practices.md) | Event Sourcing vs Event Log |
| [Event Sourcing](docs/02-user-guide/01-event-sourcing.md) | Stored events and aggregates |
| [Event Log](docs/02-user-guide/02-event-log.md) | Audit trail and diff |
| [Metadata](docs/02-user-guide/03-metadata-correlation-causation.md) | Metadata keys, versioning, corrections |
| [Operations](docs/02-user-guide/08-operations.md) | Indexes, query patterns, retention, production safety |
| [AI Integration](docs/04-development/13-optional-ai-integration.md) | Optional app-layer AI export examples |
| [Development](docs/04-development/01-setup.md) | Composer commands, CI, release, and contributor workflow |
| [Samples](docs/03-examples/01-basic-domain-event.md) | Complete code examples |
| [API Reference](docs/02-user-guide/11-api-reference.md) | EventService, interfaces, commands |

---

## Testing & Linting

```bash
composer test
composer test:coverage
composer lint       # Pint, PHPCS, PHPStan
composer lint:all   # lint + PHPMD + PHP-CS-Fixer
composer lint:fix   # Pint fix + PHP-CS-Fixer fix
composer check      # lint:all + test
composer ci         # lint:all + test:coverage
```

## Git Hooks

Composer installs Git hooks automatically on dependency install and update:

```bash
composer install
composer update
```

The hooks are managed by CaptainHook and enforce:

- `commit-msg`: Conventional Commits, for example `fix: Correct event metadata merge`
- `pre-commit`: PHP syntax linting, staged secret scanning with gitleaks, Pint, PHPCS, PHPStan, PHPMD, and PHP-CS-Fixer
- `pre-push`: gitleaks history scan when available, then `composer test`

If hooks need to be reinstalled manually:

```bash
vendor/bin/captainhook install --force --skip-existing
```

Install `gitleaks` locally to pass the pre-commit secret scan:

```bash
brew install gitleaks
```

## AI Contributor Support

AI contributor guidance is intentionally documentation-only:

- [AGENTS.md](AGENTS.md)
- [CLAUDE.md](CLAUDE.md)
- [AI Skills Map](ai/skills/README.md)
- [AI Skills Usage](ai/skills/USAGE.md)
- [Optional AI Integration](docs/04-development/13-optional-ai-integration.md)

The package does not include AI runtime code, AI data fetching, authorization, redaction, or tool execution.

## DTO-Style Records

The package uses small typed data records for normalized stored event and audit
log data. It follows `jooservices/dto` as a maturity baseline for repository
quality and docs structure, without depending on DTO domain internals.

## GitHub Actions

Configured workflows:

- `CI`: Composer metadata validation, Composer audit, Pint, PHPCS, PHPStan, PHPMD, PHP-CS-Fixer, PHPUnit coverage with a MongoDB service, a 95% minimum statement coverage gate, guarded Codecov upload, guarded SonarQube Cloud analysis, and non-blocking dependency review for pull requests
- `Release`: validate version tags, create GitHub releases, and trigger Packagist updates when Packagist secrets are configured
- `PR Labeler`: apply labels based on changed files
- `Semantic PR Title`: enforce Conventional Commit-style PR titles
- `OpenSSF Scorecard`: publish security posture results as SARIF
- `Secret Scanning`: run Gitleaks on pushes, pull requests, and manual dispatches

Coverage is archived as a workflow artifact. Codecov and SonarQube Cloud are optional and only run when repository secrets are configured, so README badges do not claim those services as mandatory package support.

---

## License

This project is licensed under the [MIT License](LICENSE).
