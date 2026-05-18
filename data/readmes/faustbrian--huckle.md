[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Huckle is an HCL-based multi-tenant configuration management package for Laravel. Define structured configurations with partitions, environments, and services — then export them directly to `.env` files or inject them into your application at runtime.

### Key Features

- **Multi-Tenant Hierarchies** — Organize config by partition/tenant, environment, provider, and service
- **HCL Syntax** — Type-safe, human-readable configuration with HashiCorp Configuration Language
- **Environment Exports** — Generate `.env` files or inject values via `putenv()` at runtime
- **Context-Based Queries** — Filter configurations by partition, environment, or custom tags
- **Credential Lifecycle** — Track expiration dates, rotation schedules, and sensitive value masking
- **Encryption Support** — Encrypt/decrypt configuration files for secure storage and deployment

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/) and Laravel 12+**

## Installation

```bash
composer require cline/huckle
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=huckle-config
```

## Documentation

- **[Getting Started](DOCS.md#doc-cookbooks-getting-started)** - Installation, configuration, and basic usage
- **[Environment Management](DOCS.md#doc-cookbooks-environment-management)** - Work with multiple environments
- **[Exports & Syncing](DOCS.md#doc-cookbooks-exports-syncing)** - Export to .env files and environment variables
- **[Connection Commands](DOCS.md#doc-cookbooks-connection-commands)** - Execute database CLI connections
- **[HCL Conversion](DOCS.md#doc-cookbooks-hcl-conversion)** - Convert between HCL and JSON formats
- **[Artisan Commands](DOCS.md#doc-cookbooks-artisan-commands)** - All available CLI commands

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

[ico-tests]: https://github.com/faustbrian/huckle/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/huckle.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/huckle.svg

[link-tests]: https://github.com/faustbrian/huckle/actions
[link-packagist]: https://packagist.org/packages/cline/huckle
[link-downloads]: https://packagist.org/packages/cline/huckle
[link-security]: https://github.com/faustbrian/huckle/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
