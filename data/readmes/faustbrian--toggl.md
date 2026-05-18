[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

A powerful Laravel feature flag package with conductor-based API, advanced strategies, time bombs, feature groups, and A/B testing support. Built for enterprise applications with fluent, chainable operations.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/)** and Laravel 11+

## Installation

```bash
composer require cline/toggl
```

## Documentation

- **[Getting Started](DOCS.md#doc-docs-readme)** - Installation, configuration, and first steps
- **[Basic Usage](DOCS.md#doc-docs-basic-usage)** - Core feature flag operations
- **[Strategies](DOCS.md#doc-docs-strategies)** - Boolean, time-based, percentage, scheduled, and conditional strategies
- **[Time Bombs](DOCS.md#doc-docs-time-bombs)** - Auto-expiring features with warnings
- **[Feature Groups](DOCS.md#doc-docs-feature-groups)** - Managing related features together
- **[Dependencies](DOCS.md#doc-docs-dependencies)** - Feature requirements and relationships
- **[Variants](DOCS.md#doc-docs-variants)** - A/B testing with weighted distribution
- **[Advanced Usage](DOCS.md#doc-docs-advanced-usage)** - Events, commands, and advanced patterns

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

[ico-tests]: https://github.com/faustbrian/toggl/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/toggl.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/toggl.svg

[link-tests]: https://github.com/faustbrian/toggl/actions
[link-packagist]: https://packagist.org/packages/cline/toggl
[link-downloads]: https://packagist.org/packages/cline/toggl
[link-security]: https://github.com/faustbrian/toggl/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
