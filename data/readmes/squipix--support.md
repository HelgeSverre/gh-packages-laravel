# Support [![Packagist License][badge_license]](LICENSE.md) [![For Laravel][badge_laravel]][link-github-repo]

[![GitHub Workflow Status][badge_build]][link-github-status]
[![Coverage Status][badge_coverage]][link-github-status]
[![Scrutinizer Code Quality][badge_quality]][link-scrutinizer]
[![SensioLabs Insight][badge_insight]][link-insight]
[![GitHub Issues][badge_issues]][link-github-issues]

[![Packagist][badge_package]][link-packagist]
[![Packagist Release][badge_release]][link-packagist]
[![Packagist Downloads][badge_downloads]][link-packagist]

*By [Squipix&copy;](http://squipix.com/)* Forked from https://github.com/ARCANEDEV/Support

`squipix/support` is a collection of helpers and tools for SQUIPIX + Laravel projects. It provides a set of tools to streamline Laravel package and application development.

## Table of Contents

1. [Installation and Setup](_docs/1.Installation-and-Setup.md)
2. [Usage](_docs/2.Usage.md)
3. [Helpers](_docs/3.Helpers.md)
4. [Providers](_docs/4.Providers.md)
5. [Database](_docs/5.Database.md)
6. [Routing](_docs/6.Routing.md)
7. [Stubs](_docs/7.Stubs.md)

## Installation

You can install the package via composer:

```bash
composer require squipix/support
```

## Usage Summary

The library provides several components:

- **Helpers**: Global functions like `laravel_version()` and `route_is()`.
- **PackageServiceProvider**: Enhanced base provider for easy package resource registration.
- **Database**: Utilities like `PrefixedModel` for easy table prefixing.
- **Routing**: `RouteRegistrar` for fluent route definitions.
- **Stubs**: A flexible class for generating files from templates.

For detailed information, please check the [`_docs`](_docs) folder.

## Contribution

Feel free to submit any issues or pull requests, please check the [contribution guidelines](CONTRIBUTING.md).

## Security

If you discover any security related issues, please email info@squipix.com instead of using the issue tracker.

## Credits

- [SQUIPIX][link-author]
- [ARCANEDEV][link-arcan]
- [All Contributors][link-contributors]

[badge_license]:   https://img.shields.io/github/license/squipix/Support.svg?style=flat-square
[badge_laravel]:   https://img.shields.io/badge/Laravel-9.x%20to%2010.x-orange.svg?style=flat-square
[badge_build]:     https://img.shields.io/github/actions/workflow/status/squipix/Support/run-tests.yml?style=flat-square
[badge_coverage]:  https://img.shields.io/github/actions/workflow/status/squipix/Support/run-tests.yml?style=flat-square
[badge_quality]:   https://img.shields.io/scrutinizer/g/squipix/Support.svg?style=flat-square
[badge_insight]:   https://img.shields.io/sensiolabs/i/de0353dd-df17-4656-b9c0-1eea95aa30a2.svg?style=flat-square
[badge_issues]:    https://img.shields.io/github/issues/squipix/Support.svg?style=flat-square
[badge_package]:   https://img.shields.io/badge/package-squipix/support-blue.svg?style=flat-square
[badge_release]:   https://img.shields.io/github/v/release/squipix/Support.svg?style=flat-square
[badge_downloads]: https://img.shields.io/packagist/dt/squipix/support.svg?style=flat-square

[link-arcan]: https://github.com/arcanedev-maroc
[link-author]:        https://github.com/squipix
[link-github-repo]:   https://github.com/squipix/Support
[link-github-status]: https://github.com/squipix/Support/actions
[link-github-issues]: https://github.com/squipix/Support/issues
[link-contributors]:  https://github.com/squipix/Support/graphs/contributors
[link-packagist]:     https://packagist.org/packages/squipix/support
[link-scrutinizer]:   https://scrutinizer-ci.com/g/squipix/Support/?branch=master
[link-insight]:       https://insight.sensiolabs.com/projects/de0353dd-df17-4656-b9c0-1eea95aa30a2
