# Blueprint IconPark Icons

<a href="https://github.com/myxiaoao/blade-blueprint-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/myxiaoao/blade-blueprint-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/cooper/blade-blueprint-icons">
    <img src="https://poser.pugx.org/cooper/blade-blueprint-icons/v/stable.svg" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/cooper/blade-blueprint-icons">
    <img src="https://poser.pugx.org/cooper/blade-blueprint-icons/d/total.svg" alt="Total Downloads">
</a>

A package to easily make use of [Blueprint Icons](https://github.com/palantir/blueprint/tree/develop/packages/icons) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [Blueprint icons](https://blueprintjs.com/docs/#icons).

## Requirements

- PHP 8.0 or higher
- Laravel 9.0 or higher

## Installation

```bash
composer require cooper/blade-blueprint-icons
```

## Usage

Icons can be used a self-closing Blade components which will be compiled to SVG icons:

```blade
<x-blueprint-add/>
```

You can also pass classes to your icon components:

```blade
<x-blueprint-add class="text-primary"/>
```

And even use inline styles:

```blade
<x-blueprint-add style="color: #666"/>
```


### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-blueprint-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-blueprint-icons/add.svg') }}" width="10" height="10"/>
```

### Blade Icons

Blade IconPark Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality.

## Maintainers

Blade Blueprint Icons is developed and maintained by [Blueprint](https://blueprintjs.com/docs/#icons).

Blade Icons is developed and maintained by [Dries Vints](https://driesvints.com/).

## License

Blade IconPark Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
