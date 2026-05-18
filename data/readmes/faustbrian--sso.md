[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

# SSO

Laravel-first SSO, OIDC, SAML, and SCIM primitives with package-owned
provider persistence, owner-scoped provider configuration, external
subject linkage, and consumer adapters for local principal and
provisioning concerns.

## Requirements

> **Requires [PHP 8.5+](https://php.net/releases/)** and Laravel 10+

## Installation

```bash
composer require cline/sso
```

## Usage

`cline/sso` is designed to own the SSO persistence layer. Consumers
should normally integrate through `Cline\SSO\SsoManager` and bind the
business-facing contracts documented in [`DOCS.md`](DOCS.md), rather than
querying package tables or models directly.

The published configuration is grouped by concern, including `cache`,
`drivers`, `login`, `routes`, `models`, `table_names`, `foreign_keys`,
and `contracts`.

## Documentation

See [`DOCS.md`](DOCS.md).

For package vocabulary and real-world term mappings, see
[`TERMINOLOGY.md`](TERMINOLOGY.md).

## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information on what has
changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and
[CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please use the GitHub
security reporting form rather than the issue queue.

## Credits

- [Brian Faust][link-maintainer]
- [All Contributors][link-contributors]

## License

The MIT License. Please see [LICENSE.md](LICENSE.md) for more
information.

[ico-tests]: https://github.com/faustbrian/sso/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/sso.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/sso.svg

[link-tests]: https://github.com/faustbrian/sso/actions
[link-packagist]: https://packagist.org/packages/cline/sso
[link-downloads]: https://packagist.org/packages/cline/sso
[link-security]: https://github.com/faustbrian/sso/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
