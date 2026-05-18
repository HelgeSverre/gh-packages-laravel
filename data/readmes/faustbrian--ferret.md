[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Ferret is a Laravel package for searching and loading configuration files in various formats. It provides a flexible way to find and load configuration from multiple locations and formats.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/) and Laravel 12+**

## Installation

```bash
composer require cline/ferret
```

## Documentation

- **[Directory Loading](DOCS.md#doc-cookbooks-directory-loading)** - Load entire directories of config files with dot-notation access
- **[Combining Configs](DOCS.md#doc-cookbooks-combining-configs)** - Merge multiple config files with deep/shallow merging
- **[Format Conversion](DOCS.md#doc-cookbooks-format-conversion)** - Convert between JSON, YAML, NEON, XML, INI, and PHP
- **[Encryption](DOCS.md#doc-cookbooks-encryption)** - Encrypt and decrypt sensitive configuration files

## Supported Formats

| Format | Extension | Read | Write |
| ------ | --------- | ---- | ----- |
| JSON   | .json     | ✓    | ✓     |
| YAML   | .yaml     | ✓    | ✓     |
| NEON   | .neon     | ✓    | ✓     |
| XML    | .xml      | ✓    | ✓     |
| INI    | .ini      | ✓    | ✓     |
| PHP    | .php      | ✓    | ✓     |

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

[ico-tests]: https://github.com/faustbrian/ferret/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/ferret.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/ferret.svg

[link-tests]: https://github.com/faustbrian/ferret/actions
[link-packagist]: https://packagist.org/packages/cline/ferret
[link-downloads]: https://packagist.org/packages/cline/ferret
[link-security]: https://github.com/faustbrian/ferret/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
