[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Postal Code is a Laravel package for validating and formatting postal codes across 180+ countries. It provides a fluent API with automatic normalization, country-specific formatting, and comprehensive exception handling.

This is a fork of [brick/postcode](https://github.com/brick/postcode) by Benjamin Morel, adapted for Laravel with additional features and a fluent API.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/) and Laravel 12+**

## Installation

```bash
composer require cline/postal-code
```

## Documentation

- **[Basic Usage](DOCS.md#doc-cookbooks-basic-usage)** - Validation, formatting, and the fluent API
- **[Custom Handlers](DOCS.md#doc-cookbooks-custom-handlers)** - Creating and registering country handlers
- **[Exception Handling](DOCS.md#doc-cookbooks-exception-handling)** - Handling validation errors gracefully
- **[Laravel Integration](DOCS.md#doc-cookbooks-laravel-integration)** - Validation rules, casts, Blade, and Livewire

## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please use the [GitHub security reporting form][link-security] rather than the issue queue.

## Credits

- [Brian Faust][link-maintainer]
- [Benjamin Morel][link-author]
- [All Contributors][link-contributors]

## License

The MIT License. Please see [License File](LICENSE.md) for more information.

[ico-tests]: https://github.com/faustbrian/postal-code/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/postal-code.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/postal-code.svg

[link-tests]: https://github.com/faustbrian/postal-code/actions
[link-packagist]: https://packagist.org/packages/cline/postal-code
[link-downloads]: https://packagist.org/packages/cline/postal-code
[link-security]: https://github.com/faustbrian/postal-code/security
[link-maintainer]: https://github.com/faustbrian
[link-author]: https://github.com/brick/postcode
[link-contributors]: ../../contributors
