# Laravel Route Label

<div align="center">

<a href="https://packagist.org/packages/milenmk/laravel-route-label">![Latest Version on Packagist](https://img.shields.io/packagist/v/milenmk/laravel-route-label.svg?style=flat)</a>
<a href="https://packagist.org/packages/milenmk/laravel-route-label">![Total Downloads](https://img.shields.io/packagist/dt/milenmk/laravel-route-label.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-route-label">![GitHub User's stars](https://img.shields.io/github/stars/milenmk/laravel-route-label)</a>
<a href="https://laravel.com/docs">![Laravel 10 Support](https://img.shields.io/badge/Laravel-10.x|11.x|12.x-orange?style=flat&logo=laravel)</a>
<a href="https://www.php.net">![PHP Version Support](https://img.shields.io/packagist/php-v/milenmk/laravel-route-label?style=flat)</a>
<a href="https://github.com/milenmk/laravel-route-label/blob/main/LICENSE">![License](https://img.shields.io/packagist/l/milenmk/laravel-route-label.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-route-label/issues">![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)</a>
<a href="https://www.patreon.com/c/LaravelAddonsbyMilen">![Sponsor me](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ff69b4?style=flat)</a>

</div>

A tiny Laravel package that lets you attach human‑friendly labels to your routes and use them in views via a helper or a Blade directive.

- **Route macro**: `->label('My Label')` (supports string‑backed Enums)
- **Localizing the label** You can also pass a translatable string `->label(__('MyLabel'))` or key `->label(__('routes.home'))` for a label
- **Helper**: `routeLabel('route.name')` → label or route name fallback
- **Blade directive**: `@routeLink('route.name')` → `<a href="/...">Label</a>`
- **Extended Blade directive**: `@routeLink('route.name', ['class' => 'btn', 'wire:navigate' => true])` → enhanced `<a>` tag with custom attributes
- **Block Blade directives**: `@routeLinkStart('route.name', ['attributes'])` ... `@routeLinkEnd` → for complex link content
- **Blade component**: `<x-route-link route="route.name" />`

## Requirements

- **PHP**: 8.2, 8.3, 8.4
- **Laravel**: 10.x, 11.x, 12.x (Illuminate Support/View/Routing)

## Installation

```bash
composer require milenmk/laravel-route-label
```

No further setup is needed (package discovery enabled).

## Quick Start

### 1) Define routes with labels

```php
use Illuminate\Support\Facades\Route;

// Simple string label
Route::get('/users', [UserController::class, 'index'])
    ->name('users.index')
    ->label('Users');

// Dynamic label via closure
Route::get('/users/{user}/edit', [UserController::class, 'edit'])
    ->name('users.edit')
    ->label(fn($params) => "Edit {$params['user']->name}");

// Translation key
Route::get('/home', [HomeController::class, 'index'])
    ->name('home')
    ->label('trans:routes.home');

// String-backed Enum
enum RouteLabel: string { case Users = 'Users'; }
Route::get('/users', [UserController::class, 'index'])
    ->name('users.index')
    ->label(RouteLabel::Users);
```

> You must call `->name()` before `->label()`.

### 2) Use the label in Blade

#### Using the helper

```bladehtml
<a href="{{ route('users.index') }}">{{ routeLabel('users.index') }}</a>
<a href="{{ route('users.edit', ['user' => $user]) }}">{{ routeLabel('users.edit', ['user' => $user]) }}</a>
```

Renders

```html
<a href="/users">Users</a>
<a href="/users/1/edit">Edit John</a>
```

#### Using Blade directives

  1) Simple directive
  
      ```php
      @routeLink('users.index')
      ```
      
      Renders:
      
      ```html
      <a href="/users">Users</a>
      ```
  
  2) With additional attributes
  
      ```php
      @routeLink('users.index', ['class' => 'btn btn-primary', 'wire:navigate' => true])
      ```
      
      Renders:
      
      ```html
      <a href="/users" class="btn btn-primary" wire:navigate>Users</a>
      ```
  
  3) With Alpine.js / complex attributes
  
      ```php
      @routeLink('users.index', [
      'class' => 'menu-item',
      'x-data' => '{ open: false }',
      'x-show' => 'open',
      '@click' => 'open = !open'
      ])
      ```
      
      Renders:
      
      ```html
      <a href="/users" class="menu-item" x-data="{ open: false }" x-show="open" @click="open = !open">Users</a>
      ```

#### Block directives for complex content

```php
@routeLinkStart('home', ['class' => 'logo-link', 'wire:navigate' => true])
    <img class="logo" src="{{ asset('images/logo.png') }}" alt="Logo" />
    <span class="brand-name">{{ config('app.name') }}</span>
@routeLinkEnd
```

Renders

```html
<a href="/" class="logo-link" wire:navigate>
    <img class="logo" src="/images/logo.png" alt="Logo" />
    <span class="brand-name">My App</span>
</a>
```

Another example with Alpine.js

```php
@routeLinkStart('profile', [
    'class' => 'profile-link',
    'x-data' => '{ open: false }',
    '@click' => 'open = !open'
])
    <img class="avatar" src="{{ $user->avatar }}" alt="Profile" />
    <span class="name">{{ $user->name }}</span>
    <svg class="dropdown-icon" :class="open ? 'rotate-180' : ''">...</svg>
@routeLinkEnd
```

Renders

```html
<a href="/profile" class="profile-link" x-data="{ open: false }" @click="open = !open">
    <img class="avatar" src="/avatar.jpg" alt="Profile" />
    <span class="name">John Doe</span>
    <svg class="dropdown-icon">...</svg>
</a>
```

### 3) Using the Blade component

```html
<x-route-link route="users.index" class="btn btn-primary" />
<x-route-link route="users.edit" :params="['user' => $user]" />
<x-route-link route="home" />
<x-route-link route="users.index" :attributes="['wire:navigate' => true]" />
```

Renders

```html
<a href="/users" class="btn btn-primary">Users</a>
<a href="/users/1/edit" class="text-blue-500 hover:underline">Edit John</a>
<a href="/" class="text-blue-500 hover:underline">Homepage</a>
<a href="/users" class="text-blue-500 hover:underline" wire:navigate>Users</a>
```

> Boolean attributes (like `wire:navigate`) are added as attribute names only when set to `true`.
>
> HTML is escaped by default, configurable via `config/route-label.php`.
> 
> Fallbacks: if a route has no label, the route name is used (`missing_label_behavior`).

## Enum Support

You can use string-backed Enums for labels:

```php
enum RouteLabel: string { case Users = 'Users'; }

Route::get('/users', [UserController::class, 'index'])
    ->name('users.index')
    ->label(RouteLabel::Users);
```

For route names (Laravel expects a string), pass the enum value:

```php
enum RouteName: string { case UsersIndex = 'users.index'; }

Route::get('/users', [UserController::class, 'index'])
    ->name(RouteName::UsersIndex->value)
    ->label('Users');
```

> The `@routeLink()` directive expects a string route name (not an Enum), because it internally calls `route()`.

## Helper Reference

- **`routeLabel(string|BackedEnum $name): ?string`**
    - Returns the route label if set.
    - Returns the route name when no label is set.
    - Returns `null` if the route does not exist.

Usage examples:

```php
routeLabel('users.index');             // "Users" (if labeled), otherwise "users.index"
routeLabel(RouteName::UsersIndex);     // Works with string-backed Enum
```

In Blade:

```blade
{{ routeLabel('users.index') ?? 'Unknown route' }}
```

## Configuration (Optional / Advanced)

Publish the config to customize defaults:

```php
php artisan vendor:publish --tag=route-label-config
```

* **default_link_class** → default CSS class for the Blade component
* **escape_html** → whether labels are escaped (true by default)
* **missing_label_behavior** → controls fallback when a label is missing

> Basic usage does not require publishing the config.

## Errors and Edge Cases

- **Calling `->label()` before `->name()`** will throw a `LogicException`.
- **Passing a non string‑backed Enum** to `->label()` will throw an `InvalidArgumentException`.
- **Unknown routes**: `routeLabel()` returns `null` → use the null coalescing operator to provide a fallback.

## Why use route labels?

- **Consistency**: keep link texts centralized alongside routes.
- **Localization friendly**: prepare for i18n by mapping names to labels.
- **Cleaner views**: no more hard‑coded strings scattered in templates.
- **Dynamic content**: closures allow runtime-generated labels (e.g., usernames).

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

- Pull requests and issues are welcome at [GitHub](https://github.com/milenmk/laravel-route-label).
- Follow PSR‑12 requirements

## Support My Work

If this package saves you time, you can support ongoing development:  
👉 [Become a Patron](https://www.patreon.com/c/LaravelAddonsbyMilen)

## Other Packages

Check out my other Laravel packages:

- **[Laravel GDPR Cookie Manager](https://packagist.org/packages/milenmk/laravel-gdpr-cookie-manager)** - GDPR-compliant cookie consent management with user preference tracking
- **[Laravel Email Change Confirmation](https://packagist.org/packages/milenmk/laravel-email-change-confirmation)** - Secure email change confirmation system
- **[Laravel Blacklist](https://packagist.org/packages/milenmk/laravel-blacklist)** - A Laravel package for blacklist validation of user input
- **[Laravel GDPR Exporter](https://packagist.org/packages/milenmk/laravel-gdpr-exporter)** - GDPR-compliant data export functionality
- **[Laravel Locations](https://packagist.org/packages/milenmk/laravel-locations)** - Add Countries, Cities, Areas, Languages and Currencies models to your Laravel application
- **[Laravel Rate Limiting](https://packagist.org/packages/milenmk/laravel-rate-limiting)** - Advanced rate limiting capabilities with exponential backoff
- **[Laravel Datatables and Forms](https://packagist.org/packages/milenmk/laravel-simple-datatables-and-forms)** - Easy to use package to create datatables and forms for Livewire components

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This package is provided "as is", without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or noninfringement. The author(s) make no guarantees regarding the accuracy, reliability, or completeness of the code, and shall not be held liable for any damages or losses arising from its use. Please ensure you thoroughly test this package in your environment before deploying it to production.