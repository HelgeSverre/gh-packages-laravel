[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

A powerful Laravel package that orchestrates sequential execution of migrations and operations. Ensures database changes and business logic run in chronological order during deployments, preventing conflicts and maintaining data integrity.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/)** and Laravel 11+

## Installation

```bash
composer require cline/sequencer
```

## Quick Start

Create an operation, implement the `handle()` method, and execute sequentially with `php artisan sequencer:process`. See [Getting Started](DOCS.md#doc-docs-readme) for detailed examples.

## Documentation

- **[Getting Started](DOCS.md#doc-docs-readme)** - Installation, configuration, and first operation
- **[Basic Usage](DOCS.md#doc-docs-readme)** - Core operations and sequential execution
- **[Monitoring & Status](DOCS.md)** - Check pending, completed, and failed operations
- **[Orchestration Strategies](DOCS.md)** - Sequential, batch, transactional, dependency-based, and scheduled execution
- **[Advanced Operations](DOCS.md)** - Retries, timeouts, batching, chaining, middleware, unique operations, encryption, tags, lifecycle hooks
- **[Programmatic Usage](DOCS.md)** - Facade API, conditional execution, status checks, error handling
- **[Events](DOCS.md)** - Operation lifecycle events for logging, monitoring, and custom workflows
- **[Rollback Support](DOCS.md)** - Automatic rollback on failures
- **[Dependencies](DOCS.md)** - Explicit operation ordering
- **[Conditional Execution](DOCS.md)** - Runtime execution conditions
- **[Skip Operations](DOCS.md)** - Skip operations at runtime with SkipOperationException
- **[Advanced Usage](DOCS.md)** - Transactions, async operations, observability

## Key Features

- ✅ **Orchestration Strategies** - Sequential, batch, transactional, dependency-based, scheduled execution
- ✅ **Flexible Execution** - Switch strategies via config or fluent API
- ✅ **Dependency Resolution** - Explicit operation dependencies with topological sorting
- ✅ **Conditional Execution** - Skip operations based on runtime conditions
- ✅ **Async Operations** - Queue operations for background processing
- ✅ **Retry Mechanisms** - Automatic retries with configurable backoff
- ✅ **Rollback Support** - Automatic rollback of executed operations when failures occur
- ✅ **Encryption** - Automatic payload encryption for sensitive operations
- ✅ **Lifecycle Hooks** - Before/after/failed callbacks for operation execution
- ✅ **Monitoring** - Pulse/Telescope integration with lifecycle events
- ✅ **Testing Helpers** - Comprehensive testing support
- ✅ **Atomic Locking** - Prevent concurrent execution in multi-server environments

## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please use the [GitHub security reporting form][link-security] rather than the issue queue.

## Credits

- [Brian Faust][link-maintainer]
- [All Contributors][link-contributors]

## License

The MIT License. Please see [License File](LICENSE.md) for more information.

[ico-tests]: https://github.com/faustbrian/sequencer/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/sequencer.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/sequencer.svg

[link-tests]: https://github.com/faustbrian/sequencer/actions
[link-packagist]: https://packagist.org/packages/cline/sequencer
[link-downloads]: https://packagist.org/packages/cline/sequencer
[link-security]: https://github.com/faustbrian/sequencer/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
