# About

[![Latest Version on Packagist](https://img.shields.io/packagist/v/defstudio/filament-column-length-limiter.svg?style=flat-square)](https://packagist.org/packages/defstudio/filament-column-length-limiter)
[![Total Downloads](https://img.shields.io/packagist/dt/defstudio/filament-column-length-limiter.svg?style=flat-square)](https://packagist.org/packages/defstudio/filament-column-length-limiter)



Limit Filament columns length showing a tooltip when text exceeds

![Limited text](./img/limited.png) ![Tooltip on hover](./img/tooltip.png)

## Installation

You can install the package via composer:

```bash
composer require defstudio/filament-column-length-limiter
```

## Usage

After installation, just call `->limitWithTooltip(xx)` in one of your table columns to automatically limit it's length and showing a nice tooltip on hover with full content

```php
TextColumn::make('description')
    ->label('Post Description')
    ->limitWithTooltip(40)
```

if no length is set, the column will try to take all available space, cutting its length in case of overflow, still showing the tooltip only if its content is cut:

```php
TextColumn::make('description')
    ->label('Post Description')
    ->limitWithTooltip()
```


## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Fabio Ivona](https://github.com/fabio-ivona)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
