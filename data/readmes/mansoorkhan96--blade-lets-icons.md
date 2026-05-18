# Blade Lets Icons

<a href="https://github.com/mansoorkhan96/blade-lets-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/mansoorkhan96/blade-lets-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/mansoor/blade-lets-icons">
    <img src="https://img.shields.io/packagist/v/mansoor/blade-lets-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/mansoor/blade-lets-icons">
    <img src="https://img.shields.io/packagist/dt/mansoor/blade-lets-icons" alt="Total Downloads">
</a>

A package to easily make use of [Lets Icons](https://www.figma.com/community/file/886554014393250663) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [icones.js.org/collection/lets-icons](https://icones.js.org/collection/lets-icons). Lets Icons are originally developed by [Leonid Tsvetkov](https://dribbble.com/Lets).

## Requirements

- PHP 8.0 or higher
- Laravel 9.0 or higher

## Installation

```bash
composer require mansoor/blade-lets-icons
```

## Blade Icons

Blade Lets Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Configuration

Blade Lets Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-lets-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-lets-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-letsicon-bell />
```

You can also pass classes to your icon components:

```blade
<x-letsicon-bell class="w-6 h-6 text-gray-500" />
```

And even use inline styles:

```blade
<x-letsicon-bell style="color: #555" />
```

Or use the `@svg` directive:

```blade
@svg('letsicon-bell', 'w-6 h-6', ['style' => 'color: #555'])
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-lets-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-lets-icons/letsicon-bell.svg') }}" width="10" height="10"/>
```

## Acknowledgements

This project uses icons from [Lets Icons](https://www.figma.com/community/file/886554014393250663) which are licensed under the Creative Commons Attribution 4.0 International License. You can view the license [here](https://creativecommons.org/licenses/by/4.0/).

Icons by [Leonid Tsvetkov](https://dribbble.com/Lets) from [Lets Icons].

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## License

Blade Lets Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
