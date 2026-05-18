# Blemlicons

<a href="https://github.com/blemli/blade-blemlicons/actions?query=workflow%3ATests">    <img src="https://github.com/blemli/blade-blemlicons/workflows/Tests/badge.svg" alt="Tests"></a><a href="https://packagist.org/packages/blemli/blade-blemlicons"><img src="https://img.shields.io/packagist/v/blemli/blade-blemlicons" alt="Latest Stable Version"></a><a href="https://packagist.org/packages/blemli/blade-blemlicons"><img src="https://img.shields.io/packagist/dt/blemli/blade-blemlicons" alt="Total Downloads"></a>

A package to easily make use of [Blemlicons](https://github.com/blemli/blemlicons) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) ~~or preview them at [icons.problem.li](https://icons.problem.li).~~

## Requirements

- PHP 8.2 or higher
- Laravel 10.0 or higher

## Installation

```bash
composer require blemli/blade-blemlicons
```

## Updating

```bash
npm update
vendor/bin/blade-icons-generate
```


## Blade Icons

Blade Blemlicons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/driesvints/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/driesvints/blade-icons#caching) with this library.

## Configuration

Blade Blemlicons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-blemlicons.php` config file:

```bash
php artisan vendor:publish --tag=blade-blemlicons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-blemlicon-problemli/>
```

You can also pass classes to your icon components:

```blade
<x-blemlicon-problemli class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-blemlicon-problemli style="color: #555"/>
```

The solid icons can be referenced like this:

```blade
<x-blemlicon-s-problemli/>
```



### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-blemlicons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-blemlicons/problemli.svg') }}" width="10" height="10"/>
```



### Filament

If youre using Filamentphp you should use [filament-icons](https://github.com/GuavaCZ/filament-icons) to install blemlicons:

```bash
composer require --dev guava/filament-icons
php artisan filament-icons:install
php artisan filament-icons:generate
```



## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Contributing

Don't change icons here, make a PR in [blemli/blemlicons](https://github.com/blemli/blemlicons) then here run:

```
npm update
vendor/bin/blade-icons-generate
```

## Todo

- [ ] Solid (s-) and outlined (-o)
- [ ] make PR on 

## Maintainers

Blade Blemlicons is developed and maintained by [Problemli](https://problem.li).

## License

Blade Blemlicons is open-sourced software licensed under [the MIT license](LICENSE.md).
