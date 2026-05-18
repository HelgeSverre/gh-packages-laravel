# Filterable Overview widget

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hans-thomas/filterable-overview-widget.svg?style=flat-square)](https://packagist.org/packages/hans-thomas/filterable-overview-widget)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/hans-thomas/filament-filterable-overview-widget/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/hans-thomas/filterablestatsoverviewwidget/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/hans-thomas/filament-filterable-overview-widget/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/hans-thomas/filterablestatsoverviewwidget/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/hans-thomas/filament-filterable-overview-widget.svg?style=flat-square)](https://packagist.org/packages/hans-thomas/filterablestatsoverviewwidget)



This widget enables you to filter your overview data and apply conditions on your stats.

## Installation

You can install the package via composer:

```bash
composer require hans-thomas/filterable-overview-widget
```

![](./assets/screenshot.png "screenshot of filterable overview widget")

## Usage

Create your widget using the command:

```shell
> php artisan make:filterable-overview-widget -h
Description:
  Create a Filterable stats overview widget class

Usage:
  make:filterable-overview-widget [options] [--] <name>

Arguments:
  name                  Name of the widget

Options:
  -p, --panel[=PANEL]   Select a panel [default: "default"]
  -h, --help            Display help for the given command. When no command is given display help for the list command
      --silent          Do not output any message
  -q, --quiet           Only errors are displayed. All other output is suppressed
  -V, --version         Display this application version
      --ansi|--no-ansi  Force (or disable --no-ansi) ANSI output
  -n, --no-interaction  Do not ask any interactive question
      --env[=ENV]       The environment the command should run under
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Hans Thomas](https://github.com/hans-thomas)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
