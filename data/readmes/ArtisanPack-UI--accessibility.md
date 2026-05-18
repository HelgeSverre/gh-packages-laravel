# ArtisanPack UI Accessibility

A PHP package for ensuring web applications meet accessibility standards, particularly for color contrast.

## Features

- **Color Contrast Checking**: Determine if text colors have sufficient contrast against background colors
- **Accessible Text Color Generation**: Generate accessible text colors based on background colors
- **Color Format Support**: Support for hex, Tailwind CSS, `rgb()`, and `hsl()` color formats.
- **User Accessibility Settings**: Manage user preferences for accessibility features
- **Laravel Integration**: Seamless integration with Laravel applications

## Installation

You can install the package via Composer:

```bash
composer require artisanpack-ui/accessibility
```

For detailed installation instructions, including Laravel integration, see the [Getting Started Guide](docs/getting-started.md).

## Usage

Here is a practical, real-world example of how to use the package to create an accessible button component in Laravel.

### Creating an Accessible Button Component

**1. Create a new Blade component:**

```bash
php artisan make:component Button
```

**2. Modify the component class:**

In `app/View/Components/Button.php`, we'll accept a background color and automatically determine the correct text color.

```php
// app/View/Components/Button.php

namespace App\View\Components;

use Illuminate\View\Component;

class Button extends Component
{
    public string $bgColor;
    public string $textColor;

    public function __construct(string $bgColor = '#3b82f6')
    {
        $this->bgColor = $bgColor;
        $this->textColor = a11yGetContrastColor($this->bgColor);
    }

    public function render()
    {
        return view('components.button');
    }
}
```

**3. Update the component view:**

In `resources/views/components/button.blade.php`, we'll apply the colors as inline styles.

```blade
// resources/views/components/button.blade.php

@props(['bgColor', 'textColor'])

<button {{ $attributes->merge(['class' => 'px-4 py-2 rounded']) }} style="background-color: {{ $bgColor }}; color: {{ $textColor }};">
    {{ $slot }}
</button>
```

**4. Use the component in your views:**

Now you can easily create accessible buttons with any background color.

```blade
<x-button>Click Me</x-button>

<x-button bg-color="#dc2626">Delete</x-button>

<x-button bg-color="rgb(16, 185, 129)">Success</x-button>
```

For more detailed examples, including Livewire components and dynamic theming, see the [Real-World Examples](docs/examples.md) documentation.

## Documentation

For complete documentation, please visit the links below.

- [**Real-World Examples**](docs/examples.md) - Practical examples of Blade and Livewire components.
- [**Best Practices**](docs/best-practices.md) - Learn how to use the package efficiently and performantly.
- [**Migration and Advanced Usage**](docs/migration.md) - Guide for migrating to a more advanced architecture.
- [**Troubleshooting**](docs/troubleshooting.md) - Solutions for common issues.
- [**API Reference**](docs/reference/api-reference.md) - Complete technical documentation.

## Requirements

- PHP 8.2 or higher
- Laravel 5.3 or higher (for Laravel integration)

## Contributing

As an open source project, this package is open to contributions from anyone. Please [read through the contributing
guidelines](CONTRIBUTING.md) to learn more about how you can contribute to this project.

## License

This package is open-sourced software licensed under the [GPL-3.0-or-later license](LICENSE).
