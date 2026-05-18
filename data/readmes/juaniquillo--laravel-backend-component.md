# Laravel Backend Component

[![Tests](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/run-tests.yml/badge.svg)](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/run-tests.yml) [![PHPStan](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/phpstan.yml/badge.svg)](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/phpstan.yml) [![Laravel Pint](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/fix-php-code-style-issues.yml/badge.svg)](https://github.com/juaniquillo/laravel-backend-component/actions/workflows/fix-php-code-style-issues.yml)

A package that simplifies the creation of dynamic, class-based Laravel components.

This package allows you to build complex, reusable UI components in PHP, making your backend and frontend integration seamless.

> [!NOTE]
> 
> #### About this fork.
> 
> This repository is a fork of [Chat-Agency/laravel-backend-component](https://github.com/Chat-Agency/laravel-backend-component). I worked on this repository while I was working with that company and decided to fork it and take ownership of it.

View the full documentation (In Progress)

> [!TIP]
> #### Laravel Boost Skill
> If you use [Laravel Boost](https://github.com/aleksipopovicdev/laravel-boost), install the AI skill:
> ```bash
> php artisan boost:add-skill https://github.com/juaniquillo/laravel-backend-component
> ```

Install the package via Composer:
```bash
composer require juaniquillo/laravel-backend-component
```
To use the package’s [Tailwind](https://tailwindcss.com/) themes, configure Tailwind to scan the package's Blade files. The method differs slightly between Tailwind versions:

### Tailwind CSS v3:

Add the package's view path to the content array in your tailwind.config.js file:

```javascript
// tailwind.config.js
export default {
    content: [
        './vendor/juaniquillo/laravel-backend-component/resources/views/**/*.blade.php', // <- Add this line
        // other paths
    ],
    // ...
};
```

### Tailwind CSS v4:

In your main CSS file (e.g., resources/css/app.css), use the @source at-rule to include the package's view path:

```css
@import 'tailwindcss';

/* Add the path for the package's views */
@source '../../vendor/juaniquillo/laravel-backend-component/resources/views/**/*.blade.php';
```

## Basic use

Use the MainBackendComponent class to construct your component. Pass the component name/path as the first parameter:

```php
use Juaniquillo\BackendComponents\MainBackendComponent;

$button = new MainBackendComponent('inline.button');
```
Alternatively, builders and an enum are available to streamline instance creation:

```php
use Juaniquillo\BackendComponents\Builders\ComponentBuilder;
use Juaniquillo\BackendComponents\Enums\ComponentEnum;

$button = ComponentBuilder::make(ComponentEnum::BUTTON);
```
Since the main component class implements Laravel’s [Htmlable](https://laravel.com/api/8.x/Illuminate/Contracts/Support/Htmlable.html) interface, you can output the component using simple Blade syntax—no escaping needed:

```blade
{{-- This will render the button's HTML --}}
{{ $button }}
```

Components can be composed with other components:

```php
use Juaniquillo\BackendComponents\Builders\ComponentBuilder;
use Juaniquillo\BackendComponents\Enums\ComponentEnum;

$divWithButton = ComponentBuilder::make(ComponentEnum::DIV)
    ->setContent(
        ComponentBuilder::make(ComponentEnum::BUTTON)
            ->setContent('Click me!')
    );
```

## Theming

The package supports theming, primarily designed for use with Tailwind CSS classes. All themes are stored inside `resources/views/_themes/tailwind` by default, ensuring they are automatically discovered by Tailwind's scanner.

You can apply a theme using the `setTheme` method:

```php
use Juaniquillo\BackendComponents\Builders\ComponentBuilder;
use Juaniquillo\BackendComponents\Enums\ComponentEnum;

$button = ComponentBuilder::make(ComponentEnum::BUTTON)
    ->setTheme('theme_file', 'theme_name');
```

## Serialization

Component trees can be serialized to arrays and restored, preserving attributes, content, themes, and Livewire state:

```php
use Juaniquillo\BackendComponents\Factories\ComponentFactory;

// Serialize the entire component tree
$array = $component->toArray();

// Restore it later
$restored = ComponentFactory::fromArray($array);
```

This works recursively for nested content, making it useful for caching, session storage, or API responses.

# Tests

Run tests using Composer:

```
composer test
```

If you're submitting a pull request, use the `qa` command—it runs `phpstan`, `pint`, and `tests`. These are the same checks performed in GitHub Actions

```
composer qa 
```

# License

This package is licensed under the [MIT License](https://choosealicense.com/licenses/mit/#).