# laravel-vue-data

[![Latest Stable Version](https://poser.pugx.org/eXolnet/laravel-vue-data/v/stable?format=flat-square)](https://packagist.org/packages/eXolnet/laravel-vue-data)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/eXolnet/laravel-vue-data/tests.yml?label=tests&style=flat-square)](https://github.com/eXolnet/laravel-vue-data/actions?query=workflow%3Atests)
[![Total Downloads](https://img.shields.io/packagist/dt/eXolnet/laravel-vue-data.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-vue-data)

Adds utilities to easily pass data from Laravel to Vue.

## Installation

Require this package with composer:

```
composer require exolnet/laravel-vue-data
```

If you don't use package auto-discovery, add the service provider to the ``providers`` array in `config/app.php`:

```
Exolnet\VueData\VueDataServiceProvider::class
```

And the facade to the ``facades`` array in `config/app.php`: 

```
'Vue' => Exolnet\VueData\Facades\Vue::class
```

## Usage

### Define variables

First, you need to devine variable that will be available in your Vue application.

In your PHP code:

```php
Vue::put('variable', 'value')
```

In a Blade view:

```
@vue('variable', 'value')
```

### Make variables available

In your base layout, add the following view before your main `app.js` to make the variables available:

```
@include('vue-data::variables')
```

### Use variables

In your `app.js`, use the variables defined when they are available:

```js
new Vue({
    el: '#app',
    data: () => window.App || {},
});
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

- [Alexandre D’Eschambeault](https://github.com/xel1045)
- [All Contributors](../../contributors)

## License

Copyright © [eXolnet](https://www.exolnet.com). All rights reserved.

This code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/).
Please see the [license file](LICENSE) for more information.

