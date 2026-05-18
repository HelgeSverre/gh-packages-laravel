# SolidFrame Laravel

Laravel bridge for SolidFrame architectural packages.

Auto-discovery, DI bindings, Artisan generators, database stores, and modular monolith support — all wired into Laravel.

## Installation

```bash
composer require solidframe/laravel
```

The service provider is auto-registered via Laravel's package discovery.

## Features at a Glance

| Feature | What You Get |
|---|---|
| **CQRS** | CommandBus, QueryBus, handler auto-discovery, middleware |
| **Event-Driven** | EventBus, listener auto-discovery, multi-listener |
| **Event Sourcing** | Database EventStore, SnapshotStore, migrations |
| **Saga** | Database SagaStore, `solidframe:saga:status` |
| **Modular** | Module auto-discovery, ModuleServiceProvider, routes/migrations/config |
| **Generators** | 10 `make:*` commands for DDD, CQRS, events, sagas, modules |

## Handler Auto-Discovery

SolidFrame automatically discovers your command handlers, query handlers, and event listeners by scanning your `app/` directory.

```php
// app/Application/Handler/PlaceOrderHandler.php
final readonly class PlaceOrderHandler implements CommandHandler
{
    public function __invoke(PlaceOrder $command): void { /* ... */ }
}

// That's it. No registration needed.
$commandBus->dispatch(new PlaceOrder('order-123', 'customer-456'));
```

Discovery works by scanning for classes that implement `CommandHandler`, `QueryHandler`, or `EventListener` marker interfaces and reading the `__invoke()` type hint.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=solidframe-config
```

```php
// config/solidframe.php
return [
    'discovery' => [
        'enabled' => true,
        'paths' => ['app'],
    ],
    'cqrs' => [
        'command_bus' => ['middleware' => []],
        'query_bus' => ['middleware' => []],
    ],
    'event_driven' => [
        'event_bus' => ['middleware' => []],
    ],
    'event_sourcing' => [
        'event_store' => [
            'driver' => 'database',
            'connection' => null,
            'table' => 'event_store',
        ],
        'snapshot_store' => [
            'driver' => 'database',
            'connection' => null,
            'table' => 'snapshots',
        ],
    ],
    'saga' => [
        'store' => [
            'driver' => 'database',
            'connection' => null,
            'table' => 'sagas',
        ],
    ],
    'modular' => [
        'path' => 'modules',
        'auto_discovery' => true,
    ],
];
```

## Artisan Commands

### Generators

```bash
# DDD
php artisan make:entity Order
php artisan make:value-object Email
php artisan make:aggregate-root Order

# CQRS
php artisan make:cqrs-command PlaceOrder --handler
php artisan make:command-handler PlaceOrderHandler --command-class=PlaceOrder
php artisan make:query GetOrderById --handler
php artisan make:query-handler GetOrderByIdHandler --query-class=GetOrderById

# Event-Driven
php artisan make:domain-event OrderPlaced --listener
php artisan make:event-listener SendOrderConfirmation --event-class=OrderPlaced

# Saga
php artisan make:saga PlaceOrderSaga

# Module
php artisan make:module Order
```

All generators support subdirectories: `php artisan make:entity Order/OrderItem`

### Operational

```bash
# List registered modules
php artisan solidframe:module:list

# View saga details
php artisan solidframe:saga:status {saga-id}
```

## Database Migrations

Publish migrations for event sourcing and saga stores:

```bash
php artisan vendor:publish --tag=solidframe-migrations
```

Three tables are created:
- `event_store` — domain events with optimistic concurrency control
- `snapshots` — aggregate snapshots
- `sagas` — saga state with associations

## Modular Monolith

### Create a Module

```bash
php artisan make:module Inventory
```

This creates:

```
modules/
└── Inventory/
    ├── InventoryModule.php
    ├── InventoryServiceProvider.php
    └── Database/
        └── Migrations/
```

### Module Service Provider

```php
use SolidFrame\Laravel\Modular\ModuleServiceProvider;

final class InventoryServiceProvider extends ModuleServiceProvider
{
    protected function module(): ModuleInterface
    {
        return new InventoryModule();
    }

    public function register(): void
    {
        parent::register();
        // custom bindings...
    }
}
```

`ModuleServiceProvider` automatically loads:
- `routes.php` from the module directory
- Migrations from `Database/Migrations/`
- `config.php` merged into `modules.{name}`

### Auto-Discovery

When `solidframe.modular.auto_discovery` is `true`, modules are discovered and booted automatically. List them with:

```bash
php artisan solidframe:module:list
```

## Middleware

Add middleware to buses via config:

```php
// config/solidframe.php
'cqrs' => [
    'command_bus' => [
        'middleware' => [
            App\Middleware\TransactionMiddleware::class,
            App\Middleware\LoggingMiddleware::class,
        ],
    ],
],
```

Middleware classes are resolved from the container with full dependency injection.

## DI Bindings

The service provider registers these as singletons:

| Interface | Implementation |
|---|---|
| `CommandBusInterface` | `CommandBus` with discovered handlers |
| `QueryBusInterface` | `QueryBus` with discovered handlers |
| `EventBusInterface` | `EventBus` with discovered listeners |
| `EventStoreInterface` | `DatabaseEventStore` or `InMemoryEventStore` |
| `SnapshotStoreInterface` | `DatabaseSnapshotStore` or `InMemorySnapshotStore` |
| `SagaStoreInterface` | `DatabaseSagaStore` or `InMemorySagaStore` |
| `ModuleRegistryInterface` | `InMemoryModuleRegistry` |

Store driver falls back to in-memory when the configured package is not installed.

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12

Optional packages (installed as needed):
- `solidframe/ddd` — for `make:entity`, `make:value-object`, `make:aggregate-root`
- `solidframe/cqrs` — for CommandBus, QueryBus, handler discovery
- `solidframe/event-driven` — for EventBus, listener discovery
- `solidframe/event-sourcing` — for EventStore, SnapshotStore
- `solidframe/modular` — for module support
- `solidframe/saga` — for SagaStore

## Related Packages

- [solidframe/core](../core) — Bus interfaces, Middleware
- [solidframe/ddd](../ddd) — Entity, ValueObject, AggregateRoot
- [solidframe/cqrs](../cqrs) — CommandBus, QueryBus
- [solidframe/event-driven](../event-driven) — EventBus, Listeners
- [solidframe/event-sourcing](../event-sourcing) — EventStore, Snapshots
- [solidframe/modular](../modular) — Module contracts
- [solidframe/saga](../saga) — Saga lifecycle
- [solidframe/symfony](../symfony) — Symfony alternative

## Contributing

This repository is a read-only split of the [solidframe/solidframe](https://github.com/solidframe/solidframe) monorepo, auto-synced on every push to `main`. Issues, pull requests, and discussions belong in the monorepo.
