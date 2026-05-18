# :package_description

[![Latest Version on Packagist](https://img.shields.io/packagist/v/:vendor_slug/:package_slug.svg?style=flat-square)](https://packagist.org/packages/:vendor_slug/:package_slug)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/:vendor_slug/:package_slug/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/:vendor_slug/:package_slug/actions?query=workflow%3Atests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/:vendor_slug/:package_slug.svg?style=flat-square)](https://packagist.org/packages/:vendor_slug/:package_slug)

<!--delete-->
---
**This is a skeleton repo for scaffolding new Laravel packages.**

It bundles the tooling we reach for on every package: Pest, PHPStan, Laravel Pint, Rector, and Orchestra Testbench. Run the configure script once and start writing code.

### Quick start

1. Click **"Use this template"** on GitHub to create a new repository.
2. Clone your new repo locally.
3. Run the setup script:

```bash
php configure.php
```

4. Replace this README section with your own documentation.
5. Start building in `src/`.

---
<!--/delete-->

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Requirements

- PHP ^8.3
- Laravel ^12.0 || ^13.0

## Installation

```bash
composer require :vendor_slug/:package_slug
```

Publish the config file:

```bash
php artisan vendor:publish --tag=":package_slug-config"
```

## Usage

```php
$skeleton = new VendorName\Skeleton();
echo $skeleton->echoPhrase('Hello, VendorName!');
```

## Testing & Quality

The skeleton ships with a full quality toolchain. Run everything at once:

```bash
composer test
```

Or run checks individually:

```bash
composer lint          # Auto-fix code style/refactors (Pint + Rector)
composer lint:rector   # Run Rector only
composer test:lint     # Check Pint + Rector without changing files
composer test:refactor # Check Rector without changing files
composer test:types    # Run PHPStan static analysis
composer test:unit     # Run Pest tests with coverage
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [:author_name](https://github.com/:author_username)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
