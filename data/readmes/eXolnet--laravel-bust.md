# laravel-bust

[![Latest Stable Version](https://poser.pugx.org/eXolnet/laravel-bust/v/stable?format=flat-square)](https://packagist.org/packages/eXolnet/laravel-bust)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/eXolnet/laravel-bust/tests.yml?label=tests&style=flat-square)](https://github.com/eXolnet/laravel-bust/actions?query=workflow%3Atests)
[![Total Downloads](https://img.shields.io/packagist/dt/eXolnet/laravel-bust.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-bust)

Provide cache busting helpers to Laravel.

## Installation

Require this package with composer:

```
composer require exolnet/laravel-bust
```

If you don't use package auto-discovery, add the service provider to the ``providers`` array in `config/app.php`:

```
Exolnet\Bust\BustServiceProvider::class
```

And the facade to the ``facades`` array in `config/app.php`: 

```
'Bust' => Exolnet\Bust\BustFacade::class
```

## Usage

You can retrieve an asset's URL containing its version this way:

```php
Bust::asset('example.css'); // Should return example.231.css
``` 

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
- [All Contributors](../../contributors)

## License

Copyright © [eXolnet](https://www.exolnet.com). All rights reserved.

This code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/).
Please see the [license file](LICENSE) for more information.
