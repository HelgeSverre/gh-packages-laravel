# BladeUIX DaisyUI

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bladeuix/daisyui.svg?style=flat-square)](https://packagist.org/packages/bladeuix/daisyui)
[![Total Downloads](https://img.shields.io/packagist/dt/bladeuix/daisyui.svg?style=flat-square)](https://packagist.org/packages/bladeuix/daisyui)

**BladeUIX DaisyUI** is a Laravel package for adding [daisyUI](https://daisyui.com/) components to your Blade templates.

## Requirements

| Version | PHP                                | Laravel    |
|---------|------------------------------------|------------|
| 1.x     | 8.2.x, 8.3.x, 8.4.x, 8.5.x         | 12.x, 13.x |

## Installation

### Prerequisites

You need to have daisyUI installed in your project. If you haven't already, you can install it via your terminal:

```bash
npm i -D daisyui@latest
```

### Package Installation

Install the BladeUIX DaisyUI package via Composer:

```bash
composer require bladeuix/daisyui
```

### Configure Tailwind CSS

- Ensure that `daisyui` tailwindcss plugin in installed.
- `../../vendor/bladeuix/daisyui/src/View/Components/*.php` is included in tailwindcss scan files.

```css
@import "tailwindcss";

/*Your other @source...*/

@source "../../vendor/bladeuix/daisyui/src/View/Components/*.php";
@plugin "daisyui";

/*Your other css utilities...*/
```

### Basic Usage

Once everything is installed and configured, you can use the components in your Blade templates:

```html
<x-daisyui::button color="primary">
    Click Me
</x-daisyui::button>
```

## Documentation

Full documentation is available at [bladeuix.njoguamos.me.ke/daisyui](https://daisyui.bladeuix.com?source=GitHubRepo).


## Testing

```bash
composer test
```

## Changelog

Please see [GitHub Releases](https://github.com/bladeuix/daisyui/releases) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Njogu Amos](https://github.com/njoguamos)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.