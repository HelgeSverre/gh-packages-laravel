# laravel-html-list

[![Latest Stable Version](https://poser.pugx.org/eXolnet/laravel-html-list/v/stable?format=flat-square)](https://packagist.org/packages/eXolnet/laravel-html-list)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/eXolnet/laravel-html-list/tests.yml?label=tests&style=flat-square)](https://github.com/eXolnet/laravel-html-list/actions?query=workflow%3Atests)
[![Total Downloads](https://img.shields.io/packagist/dt/eXolnet/laravel-html-list.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-html-list)

Facilitate HTML element creation from Laravel collections

## Installation

Require this package with composer:

```
composer require exolnet/laravel-html-list
```

If you don't use package auto-discovery, add the service provider to the ``providers`` array in `config/app.php`:

```
Exolnet\HtmlList\HtmlListServiceProvider::class
```

And the facade to the ``facades`` array in `config/app.php`: 

```
'HtmlList' => Exolnet\HtmlList\HtmlListFacade::class
```

## Usage

Explain how to use your package.

## Testing

To run the phpUnit tests, please use:

``` bash
composer test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please email security@exolnet.com instead of using the issue tracker.

## Credits

- [Alexandre D'Eschambeault](https://github.com/xel1045)
- [Simon Gaudreau](https://github.com/Gandhi11)
- [All Contributors](../../contributors)

## License

Copyright © [eXolnet](https://www.exolnet.com). All rights reserved.

This code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/).
Please see the [license file](LICENSE) for more information.
