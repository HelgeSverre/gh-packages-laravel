# Laravel Label Graph

[![CI](https://github.com/birdcar/laravel-label-graph/actions/workflows/ci.yaml/badge.svg)](https://github.com/birdcar/laravel-label-graph/actions/workflows/ci.yaml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/birdcar/laravel-label-graph.svg)](https://packagist.org/packages/birdcar/laravel-label-graph)
[![Total Downloads](https://img.shields.io/packagist/dt/birdcar/laravel-label-graph.svg)](https://packagist.org/packages/birdcar/laravel-label-graph)
[![License](https://img.shields.io/packagist/l/birdcar/laravel-label-graph.svg)](https://packagist.org/packages/birdcar/laravel-label-graph)

Laravel package for **hierarchical labels with multiple parents** (DAG), **lquery pattern matching** (`priority.*`, `*.bug`), and **materialized path routes** for fast queries. Unlike traditional trees, labels can belong to multiple hierarchies—a "Wireless Gaming Mouse" can appear in both "Electronics > Mice" AND "Gaming > Accessories".

## Perfect For

- **E-commerce categories**: Products in multiple categories
- **Issue tracker labels**: GitHub-style hierarchical labels with pattern queries
- **Content taxonomy**: Nested topics with fast ancestor/descendant lookups
- **Permission hierarchies**: Complex permission structures with multiple inheritance

## Not For

- **Simple flat tags**: Use [spatie/laravel-tags](https://github.com/spatie/laravel-tags) instead
- **Single-parent trees**: Consider [kalnoy/nestedset](https://github.com/lazychaser/laravel-nestedset) if you don't need multi-parent

## Installation

```bash
composer require birdcar/laravel-label-graph
```

Publish and run migrations:

```bash
php artisan vendor:publish --tag=label-graph-migrations
php artisan migrate
```

Optionally publish the config:

```bash
php artisan vendor:publish --tag=label-graph-config
```

## Quick Start

### Create Labels

```php
use Birdcar\LabelGraph\Models\Label;
use Birdcar\LabelGraph\Models\LabelRelationship;

// Create root labels
$priority = Label::create(['name' => 'Priority']);
$high = Label::create(['name' => 'High']);
$critical = Label::create(['name' => 'Critical']);

// Create hierarchy
LabelRelationship::create([
    'parent_label_id' => $priority->id,
    'child_label_id' => $high->id,
]);

LabelRelationship::create([
    'parent_label_id' => $high->id,
    'child_label_id' => $critical->id,
]);

// Routes are automatically generated:
// priority
// priority.high
// priority.high.critical
```

### Attach Labels to Models

```php
use Birdcar\LabelGraph\Models\Concerns\HasLabels;

class Ticket extends Model
{
    use HasLabels;
}

// Attach routes by path
$ticket->attachRoute('priority.high.critical');
$ticket->attachRoute('type.bug');

// Query by exact route
Ticket::whereHasRoute('priority.high')->get();

// Query by pattern (lquery-style: * matches zero or more labels)
Ticket::whereHasRouteMatching('priority.*')->get();  // priority and descendants
Ticket::whereHasRouteMatching('*.bug')->get();       // any path ending in bug

// Query descendants/ancestors
Ticket::whereHasRouteDescendantOf('priority')->get();
Ticket::whereHasRouteAncestorOf('priority.high.critical')->get();
```

### Query Routes Directly

```php
use Birdcar\LabelGraph\Models\LabelRoute;

// Find routes by pattern
LabelRoute::wherePathMatches('priority.*')->get();

// Find descendants of a path
LabelRoute::whereDescendantOf('priority')->get();

// Find ancestors of a path
LabelRoute::whereAncestorOf('priority.high.critical')->get();
```

## Documentation

Full documentation available at [birdcar.github.io/laravel-label-graph](https://birdcar.github.io/laravel-label-graph)

- [When to Use](https://birdcar.github.io/laravel-label-graph/#/when-to-use) - Decision guide for package selection
- [Package Comparison](https://birdcar.github.io/laravel-label-graph/#/comparison) - vs spatie/laravel-tags, kalnoy/nestedset
- [Implementation Guide](https://birdcar.github.io/laravel-label-graph/#/llm-implementation-brief) - Complete integration walkthrough
- [Installation](https://birdcar.github.io/laravel-label-graph/#/installation)
- [Models & Relationships](https://birdcar.github.io/laravel-label-graph/#/models)
- [HasLabels Trait](https://birdcar.github.io/laravel-label-graph/#/traits)
- [Query Scopes & Patterns](https://birdcar.github.io/laravel-label-graph/#/query-scopes)
- [Query Cookbook](https://birdcar.github.io/laravel-label-graph/#/llm-query-cookbook) - 20+ query examples
- [Architecture](https://birdcar.github.io/laravel-label-graph/#/architecture)

## Requirements

- PHP 8.3+
- Laravel 11.0+ or 12.0+
- SQLite, MySQL 8.0+, or PostgreSQL 14+

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `./vendor/bin/pest`
4. Run linting: `./vendor/bin/pint && ./vendor/bin/phpstan analyse`
5. Commit your changes with a descriptive message
6. Push to your branch and create a Pull Request

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.
