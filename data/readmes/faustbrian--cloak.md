[![GitHub Workflow Status][ico-tests]][link-tests]
[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

------

Cloak is a security-focused Laravel package that prevents sensitive information from leaking through exception messages and stack traces. It automatically sanitizes database credentials, API keys, tokens, and other sensitive data before they reach your users or logs.

## Requirements

> **Requires [PHP 8.5+](https://php.net/releases/) and Laravel 11+**

## Installation

```bash
composer require cline/cloak
```

## Documentation

- **[Getting Started](https://docs.cline.sh/cloak/getting-started)** - Installation, configuration, and basic usage
- **[Custom Patterns](https://docs.cline.sh/cloak/patterns)** - Configure regex patterns to match your sensitive data
- **[Exception Handling](https://docs.cline.sh/cloak/exception-handling)** - Fine-grained control over exception sanitization
- **[Real-World Examples](https://docs.cline.sh/cloak/examples)** - Practical examples for common scenarios
- **[Security Best Practices](https://docs.cline.sh/cloak/security-best-practices)** - Production configuration and monitoring

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

[ico-tests]: https://github.com/faustbrian/cloak/actions/workflows/quality-assurance.yaml/badge.svg
[ico-version]: https://img.shields.io/packagist/v/cline/cloak.svg
[ico-license]: https://img.shields.io/badge/License-MIT-green.svg
[ico-downloads]: https://img.shields.io/packagist/dt/cline/cloak.svg

[link-tests]: https://github.com/faustbrian/cloak/actions
[link-packagist]: https://packagist.org/packages/cline/cloak
[link-downloads]: https://packagist.org/packages/cline/cloak
[link-security]: https://github.com/faustbrian/cloak/security
[link-maintainer]: https://github.com/faustbrian
[link-contributors]: ../../contributors
