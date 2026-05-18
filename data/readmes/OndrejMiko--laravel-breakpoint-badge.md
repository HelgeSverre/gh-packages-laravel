# Laravel Breakpoint Badge

A lightweight Laravel package that displays the current responsive breakpoint and viewport width directly in your app during development.

<p align="center">
  <img src=".github/assets/screenshot.png" alt="Laravel Breakpoint Badge preview" width="900">
</p>

## Why use it?

When building responsive layouts, it is easy to lose track of the currently active breakpoint.

Laravel Breakpoint Badge gives you a small on-screen badge that shows the active breakpoint and optional viewport width directly inside your app while you work.

## Features

- Shows the active responsive breakpoint
- Optionally shows the current viewport width
- Designed for local development
- Simple Blade component usage
- Configurable position, theme, and z-index
- Tailwind-style breakpoint visibility

## Demo

### Static preview

![Static preview](.github/assets/preview.png)

### Responsive behavior

![Responsive demo](.github/assets/demo.gif)

## Requirements

- PHP 8.1+
- Laravel 9, 10, 11, 12, or 13

## Installation

Install the package via Composer:

```bash
composer require ondrejmiko/laravel-breakpoint-badge
```

## Basic usage

Render the badge anywhere in your main layout, usually near the end of the `<body>`:

```blade
<x-breakpoint-badge />
```

You can also override settings directly in the component:

```blade
<x-breakpoint-badge
    position="right-bottom"
    theme="dark"
    :show-width="true"
    :z-index="9999"
/>
```

## Example output

The badge can display values like:

- `sm`
- `md`
- `lg`
- `xl`
- `2xl`

And optionally:

- `md · 824px`

## Configuration

If you want to customize the package config, publish it:

```bash
php artisan vendor:publish --tag=breakpoint-badge-config
```

Default configuration:

```php
return [
    'enabled' => env('BREAKPOINT_BADGE_ENABLED', app()->environment('local')),
    'position' => env('BREAKPOINT_BADGE_POSITION', 'center-top'),
    'theme' => env('BREAKPOINT_BADGE_THEME', 'auto'),
    'show_width' => env('BREAKPOINT_BADGE_SHOW_WIDTH', true),
    'z_index' => env('BREAKPOINT_BADGE_Z_INDEX', 9999),
];
```

### Supported positions

- `left-top`
- `center-top`
- `right-top`
- `left-bottom`
- `center-bottom`
- `right-bottom`

### Supported themes

- `auto`
- `light`
- `dark`

## View publishing

If you want to customize the package view, publish it:

```bash
php artisan vendor:publish --tag=breakpoint-badge-views
```

## Tailwind setup

The badge uses Tailwind utility classes for breakpoint visibility.

If your Tailwind config already scans vendor Blade views, no extra setup is needed.

If not, add the package view path to your Tailwind content configuration:

```js
export default {
  content: [
    './resources/**/*.blade.php',
    './vendor/ondrejmiko/laravel-breakpoint-badge/resources/views/**/*.blade.php',
  ],
};
```

Alternatively, you can publish the package views and let Tailwind scan them from:

```txt
resources/views/vendor/breakpoint-badge
```

## Recommended environment usage

This package is intended primarily for local development.

Example:

```env
BREAKPOINT_BADGE_ENABLED=true
BREAKPOINT_BADGE_POSITION=center-top
BREAKPOINT_BADGE_THEME=auto
BREAKPOINT_BADGE_SHOW_WIDTH=true
BREAKPOINT_BADGE_Z_INDEX=9999
```

## Roadmap

- Custom breakpoint labels
- Custom breakpoint values
- Additional debug display options

## Contributing

Contributions, ideas, and improvements are welcome.

## License

MIT
