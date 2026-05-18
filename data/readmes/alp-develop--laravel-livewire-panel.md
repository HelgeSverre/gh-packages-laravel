# Laravel Livewire Panel

<p align="center">
  <a href="https://packagist.org/packages/alp-develop/laravel-livewire-panel"><img src="https://img.shields.io/packagist/v/alp-develop/laravel-livewire-panel.svg?style=flat-square&label=stable" alt="Stable"></a>
  <a href="https://github.com/alp-develop/laravel-livewire-panel/actions/workflows/tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/alp-develop/larave-livewire-panel/tests.yml?branch=main&style=flat-square&label=tests" alt="Tests"></a>
  <a href="https://packagist.org/packages/alp-develop/laravel-livewire-panel"><img src="https://img.shields.io/packagist/l/alp-develop/laravel-livewire-panel.svg?style=flat-square" alt="License"></a>
</p>

A complete admin panel framework for Laravel. Supports Bootstrap 4, Bootstrap 5, and Tailwind CSS. Compatible with Livewire 3 and Livewire 4.

---

## Requirements

| Requirement | Version |
|---|---|
| PHP | 8.1 / 8.2 / 8.3 / 8.4 / 8.5 |
| Laravel | 10 / 11 / 12 / 13 |
| Livewire | 3.x / 4.x |

---

## Installation

```bash
composer require alp-develop/laravel-livewire-panel
php artisan panel:install
```

The installer runs an interactive menu:

1. **URL prefix** (default: `admin`)
2. **Navigation mode** — `config` or `modules`
3. **CSS Theme** — Bootstrap 5, Bootstrap 4, or Tailwind CSS
4. **Gate driver** — None, Spatie, or Laravel Gate
5. **Registration** — enable/disable
6. **CDN libraries** — Chart.js, SweetAlert2, Select2, Flatpickr
7. **Publish views** — optional

Use `--defaults` to skip prompts.


---

## Quick Start

### Create your first page

In config mode, create a Livewire component with the panel layout and register the route manually:

```php
namespace App\Livewire;

use Livewire\Attributes\Layout;
use Livewire\Component;

#[Layout('panel::layouts.app')]
class Dashboard extends Component
{
    public function render()
    {
        return view('livewire.dashboard');
    }
}
```

Register the route in `routes/web.php` with `PanelAuthMiddleware`. The `prefix` must match the panel prefix and the `name` must follow the pattern `panel.{panelId}.`:

```php
use App\Livewire\Dashboard;
use AlpDevelop\LivewirePanel\Http\Middleware\PanelAuthMiddleware;

Route::middleware(['web', PanelAuthMiddleware::class])
    ->prefix('prefix')
    ->name('panel.admin.')
    ->group(function () {
        Route::get('/', Dashboard::class)->name('home');
    });
```

Visit `http://yourapp.test/prefix/login` — after login you land on `/prefix` where your page renders inside the panel layout.

The `prefix` determines the base URL of the panel. For example, `'prefix' => 'admin'` means all panel routes live under `/admin/*`. After login, the user is redirected to `/{prefix}`. Route names must follow `panel.{panelId}.{name}` so the sidebar can resolve them.

See [Installation](docs/installation.md) for the full interactive menu, modules mode, and all options.

---

## Documentation

| Guide | Description |
|---|---|
| [Installation](docs/installation.md) | Interactive installer, navigation modes, getting started |
| [Commands](docs/commands.md) | All `panel:*` artisan commands |
| [Configuration](docs/configuration.md) | Panels, guards, modes, CDN, multi-panel, helpers |
| [Components](docs/components.md) | Login, register, sidebar, navbar per panel |
| [Navigation](docs/navigation.md) | Config mode, modules mode, groups, permissions, user menu |
| [Modules](docs/modules.md) | Dashboard, Users, Auth + custom modules |
| [Widgets](docs/widgets.md) | StatsCard, Chart, RecentTable + custom widgets |
| [Themes](docs/themes.md) | Bootstrap 4/5, Tailwind + custom themes |
| [Customization](docs/customization.md) | CSS variables, sidebar, navbar, dark mode, layout |
| [Icons](docs/icons.md) | Heroicons + custom icon libraries |
| [Localization](docs/localization.md) | Language selector, translations, i18n |
| [Plugins](docs/plugins.md) | Cross-panel extensions with navigation and widgets |
| [Notifications](docs/notifications.md) | Navbar bell icon, badge, polling, notification providers |
| [Events](docs/events.md) | Audit events for login, registration, CRUD, access control |
| [Security](docs/security.md) | Rate limiting, CSS sanitization, gate drivers, recommendations |
| [API Reference](docs/api-reference.md) | Interfaces, classes, registries, events |

---

## Features

- **Multi-panel** -- Multiple independent panels in a single app with separate config, theme, guard and navigation per panel.
- **3 CSS themes** -- Bootstrap 4, Bootstrap 5 and Tailwind CSS with full CSS variable theming (`--panel-*`).
- **Sidebar state management** -- Configurable initial state (expanded/collapsed), persistent or session-only state via `localStorage`, collapsible toggle control, and icons-only mode when collapsed. Zero-flash persistence across SPA navigations via `livewire:navigating` `onSwap`.
- **Dark mode** -- Toggle in navbar with `localStorage` persistence. Optional toggle on auth pages via `dark_mode_show_on_auth`.
- **Localization** -- Built-in translations for 10 languages (en, es, fr, pt, zh, hi, ar, bn, ru, ja). Language selector in navbar and auth pages. Sidebar labels support translation keys automatically. See [Localization](docs/localization.md).
- **Module system** -- Built-in Dashboard, Users and Auth modules. Create custom modules with `panel:make-module`.
- **Widget system** -- StatsCard, Chart and RecentTable widgets. Create custom widgets with `panel:make-widget`.
- **Plugin system** -- Cross-panel extensions with lifecycle hooks, navigation and widgets.
- **Search** -- Global search (`Ctrl+K`) with pluggable providers and permission filtering.
- **Notifications** -- Polling notification system with count badge and provider interface. See [Notifications](docs/notifications.md).
- **Gate authorization** -- PanelGate with Spatie, Laravel Gate or custom drivers.
- **Password reset** -- Full forgot-password -> email -> reset-password flow out of the box. Customizable notification class and email template via `panel:make-component forgot-password-notification`.
- **Audit events** -- 8 event classes for login, logout, registration, CRUD operations and access denial. See [Events](docs/events.md).
- **Security hardening** -- Rate limiting on login (5/60s), CSS injection prevention, SQL wildcard sanitization, `#[Locked]` on Livewire properties, locale whitelist in `LocaleController`. See [Security](docs/security.md).
- **Performance** -- ETag + HTTP 304 on asset serving, memoization in `PanelGate`/`PanelRenderer`/`CdnPluginResolver`, O(1) route lookups via `buildRouteMap()`, identical query caching in `PanelSearch`, Octane-safe `scoped()` bindings.
- **Extensibility** -- `CdnManagerInterface`, `ThemeInterface`, `ModuleInterface`, `WidgetInterface`, `NotificationProviderInterface`, `SearchProviderInterface` — all injectable and replaceable via the container.
- **SPA performance** -- CDN and theme scripts use `data-navigate-once` (load once, stay in memory). Configurable favicon. Page transitions trigger after Livewire hydration.
- **Reusable components** -- `<x-panel::locale-selector />`, `<x-panel::dark-mode-toggle />`, `<x-panel::alert />`, `<x-panel::button />`, `<x-panel::card />`, `<x-panel::icon />`, `<x-panel::portal />`.



## Testing

```bash
./vendor/bin/pest
```

---

## License

MIT
