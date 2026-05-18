# zairakai/laravel-essentials

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![Packagist][packagist-badge]][packagist]
[![Downloads][downloads-badge]][packagist]
[![License][license-badge]][license]

[![PHP][php-badge]][php]
[![Laravel][laravel-badge]][laravel]
[![Static Analysis][phpstan-badge]][phpstan]
[![Code Style][pint-badge]][pint]

Essential Laravel helpers and Str macros with zero duplication and practical defaults.

---

## Features

- **Boolean helpers** — `is_true()`, `is_false()`
- **Math helpers** — `is_even()`, `is_odd()`
- **String helpers** — `generate_random_string()`
- **Format helpers** — `number_format_locale()`
- **Filesystem helpers** — `sanitize_filename()`
- **Validation helpers** — `is_valid_email()`, `is_valid_ip()`, `is_valid_mac()`, `is_valid_base64()`
- **Array helpers** — `recursive_array_replace()`
- **Str macros** — `Str::isEmail()`, `Str::isIp()`, `Str::isMac()`, `Str::isBase64()`
- **Stringable macros** — `Str::of(...)->isEmail()` and equivalents
- **Auto-loaded** — helpers and macros registered automatically via the service provider

---

## Install

```bash
composer require zairakai/laravel-essentials
```

No additional configuration needed — helpers are available globally after install.

---

## Usage

```php
// Boolean helpers
is_true($value);                     // strict === true
is_false($value);                    // strict === false

// Math helpers
is_even(2);                          // true
is_odd(3);                           // true

// Number formatting
number_format_locale(1234.56, 2);   // '1 234,56'

// String helper
generate_random_string(10, 'ALPHA'); // e.g. 'QWERTYUIOP'

// Validation helpers
is_valid_email('alice@example.com'); // true
is_valid_ip('192.168.1.1');          // true
is_valid_mac('00:1A:2B:3C:4D:5E');   // true
is_valid_base64('dGVzdA==');         // true

// Array helper
recursive_array_replace('foo', 'bar', ['key' => 'foo value']); // ['key' => 'bar value']

// Str macros
Str::isEmail('alice@example.com');   // true
Str::isIp('192.168.1.1');            // true
Str::isMac('00:1A:2B:3C:4D:5E');     // true
Str::isBase64('dGVzdA==');           // true
```

---

## Development

```bash
make quality        # pint + phpstan + rector + insights + markdownlint + shellcheck
make quality-fast   # pint + phpstan + markdownlint
make test           # phpunit / pest
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md][contributing] for the project-specific workflow and quality standards.

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->
[pipeline-main-badge]: https://gitlab.com/zairakai/php-packages/laravel-essentials/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/php-packages/laravel-essentials/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/php-packages/laravel-essentials/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/php-packages/laravel-essentials/commits/develop
[coverage-badge]: https://gitlab.com/zairakai/php-packages/laravel-essentials/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/php-packages/laravel-essentials/-/commits/main
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/php-packages/laravel-essentials?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/php-packages/laravel-essentials/-/releases
[packagist-badge]: https://img.shields.io/packagist/v/zairakai/laravel-essentials
[packagist]: https://packagist.org/packages/zairakai/laravel-essentials
[downloads-badge]: https://img.shields.io/packagist/dt/zairakai/laravel-essentials
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fphp-packages%2Flaravel-essentials?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/php-packages/laravel-essentials/-/issues
[php-badge]: https://img.shields.io/badge/php-8.4-blue?logo=php
[php]: https://www.php.net
[laravel-badge]: https://img.shields.io/badge/Laravel-12%20%7C%2013-red?logo=laravel
[laravel]: https://laravel.com
[phpstan-badge]: https://img.shields.io/badge/static%20analysis-phpstan-5B2C6F.svg?logo=php
[phpstan]: https://phpstan.org
[pint-badge]: https://img.shields.io/badge/code%20style-pint-22C55E.svg
[pint]: https://laravel.com/docs/pint
[ecosystem]: https://gitlab.com/zairakai
[contributing]: ./CONTRIBUTING.md
