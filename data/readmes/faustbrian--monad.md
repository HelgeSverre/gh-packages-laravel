[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

This package provides a Rust-aligned `Option`, `Result`, and `Either` types providing expressive, type-safe error handling and ergonomic controller helpers for Laravel applications.

## Requirements

> **Requires [PHP 8.4+](https://php.net/releases/)**

## Installation

```bash
composer require cline/monad
```

## Documentation

- **[Option Guide](DOCS.md)** - Complete guide with real-world examples for null-safe operations
- **[Result Guide](DOCS.md)** - Comprehensive error handling patterns with Ok/Err semantics
- **[Either Guide](DOCS.md)** - Advanced Left/Right branching for complex scenarios
- **[Transpose Guide](DOCS.md)** - Swapping nested monads (Option<Result> ↔ Result<Option>)
- **[Quick Reference](DOCS.md#doc-docs-quick-reference)** - API overview and highlights

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

[ico-tests]: https://github.com/faustbrian/monad/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/monad.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/monad.svg

[link-tests]: https://github.com/faustbrian/monad/actions
[link-packagist]: https://packagist.org/packages/cline/monad
[link-downloads]: https://packagist.org/packages/cline/monad
[link-security]: https://github.com/faustbrian/monad/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
