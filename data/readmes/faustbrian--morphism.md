[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Reusable polymorphic key mapping for Laravel packages. Provides a central registry to manage which primary key column (id, uuid, ulid) each model uses in polymorphic relationships.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/)** and Laravel 12+

## Installation

```bash
composer require cline/morphism
```

## Documentation

- **[Migrations](DOCS.md#doc-cookbooks-migrations)** - Blueprint macros for polymorphic columns
- **[Basic Usage](DOCS.md#doc-cookbooks-basic-usage)** - Core registry operations
- **[Strict Enforcement](DOCS.md#doc-cookbooks-strict-enforcement)** - Require all models to be mapped
- **[Config-Based Setup](DOCS.md#doc-cookbooks-config-based-setup)** - Configure via config files
- **[Package Integration](DOCS.md#doc-cookbooks-package-integration)** - Integrate into your own packages
- **[Testing](DOCS.md)** - Testing patterns and best practices

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

[ico-tests]: https://github.com/faustbrian/morphism/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/morphism.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/morphism.svg

[link-tests]: https://github.com/faustbrian/morphism/actions
[link-packagist]: https://packagist.org/packages/cline/morphism
[link-downloads]: https://packagist.org/packages/cline/morphism
[link-security]: https://github.com/faustbrian/morphism/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
