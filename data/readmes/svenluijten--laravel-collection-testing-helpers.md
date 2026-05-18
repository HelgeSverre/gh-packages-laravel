![Laravel Collection Testing Helpers](https://user-images.githubusercontent.com/11269635/115297729-d5be1700-a15c-11eb-9207-8c82d12f1cf7.jpg)

# Laravel Collection Testing Helpers

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Software License][ico-license]](LICENSE.md)
[![Build Status][ico-build]][link-build]
[![StyleCI][ico-styleci]][link-styleci]

This package adds several convenience methods to your Laravel collections to make
assertions against them more fluent and readable.

## Installation
You'll have to follow a couple of simple steps to install this package.

### Downloading
Via [composer](http://getcomposer.org):

```bash
$ composer require sven/laravel-collection-testing-helpers --dev
```

Or add the package to your development dependencies in `composer.json` and run
`composer update` on the command line to download the package:

```json
{
    "require-dev": {
        "sven/laravel-collection-testing-helpers": "^1.0"
    }
}
```

## Usage
To use this package in your tests, you must first call the `\Sven\LaravelCollectionTestingHelpers\Helpers::enable()` 
method where you want to use the assertions. You may then use the methods directly on your collections:

```php
<?php

use Sven\LaravelCollectionTestingHelpers\Helpers;
use Illuminate\Foundation\Testing\TestCase;

class ExampleTest extends TestCase
{
    public function test_collections()
    {
        Helpers::enable();
        
        collect(['apple', 'pear', 'banana'])
            ->assertContains('apple')
            ->assertNotContains('orange');
    }

    public function test_callable_filtering()
    {
        Helpers::enable();
        
        collect(['apple', 'pear', 'banana'])
            ->assertContains(fn ($fruit) => $fruit === 'pear')
            ->assertNotContains(fn ($fruit) => $fruit === 'kiwi');
    }

    public function test_keyed_collections()
    {
        Helpers::enable();
        
        collect([['name' => 'apple'], ['name' => 'pear'], ['name' => 'banana']])
            ->assertContains('name', 'apple')
            ->assertNotContains('name', 'grape');
    }
}
```

## Credits
Big thanks to [@eduarguz](https://github.com/eduarguz) for [his original work on this](https://github.com/svenluijten/laravel-testing-utils/pull/4) 
in the now-abandoned [`sven/laravel-testing-utils`](https://github.com/svenluijten/laravel-testing-utils) package.

## Contributing
All contributions (pull requests, issues and feature requests) are
welcome. Make sure to read through the [CONTRIBUTING.md](CONTRIBUTING.md) first,
though. See the [contributors page](../../graphs/contributors) for all contributors.

## License
`sven/laravel-collection-testing-helpers` is licensed under the MIT License (MIT). 
Please see the [license file](LICENSE.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/sven/laravel-collection-testing-helpers.svg?style=flat-square
[ico-license]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/sven/laravel-collection-testing-helpers.svg?style=flat-square
[ico-build]: https://img.shields.io/github/actions/workflow/status/svenluijten/laravel-collection-testing-helpers/run-tests.yml?style=flat-square
[ico-styleci]: https://styleci.io/repos/359575155/shield

[link-packagist]: https://packagist.org/packages/sven/laravel-collection-testing-helpers
[link-downloads]: https://packagist.org/packages/sven/laravel-collection-testing-helpers
[link-build]: https://github.com/svenluijten/laravel-collection-testing-helpers/actions/workflows/run-tests.yml
[link-styleci]: https://styleci.io/repos/359575155
