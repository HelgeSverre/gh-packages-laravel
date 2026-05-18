# laravel-bootstrap4-form

[![Latest Stable Version](https://poser.pugx.org/eXolnet/laravel-bootstrap4-form/v/stable?format=flat-square)](https://packagist.org/packages/eXolnet/laravel-bootstrap4-form)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/travis/eXolnet/laravel-bootstrap4-form/main.svg?style=flat-square)](https://travis-ci.org/eXolnet/laravel-bootstrap4-form)
[![Total Downloads](https://img.shields.io/packagist/dt/eXolnet/laravel-bootstrap4-form.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-bootstrap4-form)

Package use to extend laravelcollective/html and help building Boostrap4 form

## Installation

Require this package with composer:

```
composer require exolnet/laravel-bootstrap4-form
```

If you don't use package auto-discovery, add the service provider to the ``providers`` array in `config/app.php`:

```
Exolnet\LaravelBootstrap4Form\LaravelBootstrap4FormServiceProvider::class
```

And the facade to the ``facades`` array in `config/app.php`: 

```
'LaravelBootstrap4Form' => Exolnet\LaravelBootstrap4Form\LaravelBootstrap4FormFacade::class
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

- [Simon Gaudreau](https://github.com/Gandhi11)
- [Patricia Gagnon-Renaud](https://github.com/pgrenaud)
- [All Contributors](../../contributors)

## License

Copyright © [eXolnet](https://www.exolnet.com). All rights reserved.

This code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/).
Please see the [license file](LICENSE) for more information.
