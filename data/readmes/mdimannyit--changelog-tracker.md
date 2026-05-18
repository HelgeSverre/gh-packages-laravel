# Laravel AI Changelog Tracker

An AI-powered, plug-and-play Laravel package that automates the generation and presentation of system changelogs. It records application events and uses AI (OpenAI by default, with powerful Custom/Fallback support) to generate rich, beautiful Markdown summaries presented in a pre-built Livewire timeline.

## Repository

Source and issue tracking: [github.com/mdimannyit/changelog-tracker](https://github.com/mdimannyit/changelog-tracker). Published package: [Packagist](https://packagist.org/packages/mdimannyit/changelog-tracker).

## Features

- 🤖 **Automated Summaries**: Pipes raw event data into AI to describe changes intelligently using standard Semantic formats (TL;DR, Breaking Changes, Action Items).
- 🔁 **Resilient AI Failovers**: Built-in support to seamlessly failover to secondary AI providers like Groq, DeepSeek, Anthropic, or local Ollama if your main provider hits a rate limit or timeout.
- 🕒 **Interactive Timeline**: Ships with a beautiful, pre-styled Tailwind CSS + Livewire timeline panel ready right out of the box.
- ✍️ **Markdown editor**: Edit summaries with EasyMDE (CodeMirror); stored Markdown renders with `Str::markdown()` on the timeline.
- 🚦 **Queue Native**: Completely non-blocking. Interacts gracefully with AI constraints leveraging Laravel's native queuing and backoff mechanics.
- 🔒 **Configurable Access**: Easily wrap the timeline behind your application's existing authentication UI logic.

## Installation

You can install the package via Composer:

```bash
composer require mdimannyit/changelog-tracker
```

### Livewire 4 and Composer versions

**Livewire 4** apps should require **1.1.0 or newer** (installs that support `livewire/livewire` 3 and 4):

```bash
composer require mdimannyit/changelog-tracker:^1.1
```

**Livewire 3** apps may use `^1.0` or `^1.1`. See [CHANGELOG.md](CHANGELOG.md) for what changed in 1.1.x.

1. **Publish the Configuration**
```bash
php artisan vendor:publish --tag="changelog-config"
```

2. **Optional: append missing `.env` keys** (OpenAI, fallback, optional UI vars). Skips any key that already exists:

```bash
php artisan changelog:sync-env --dry-run
php artisan changelog:sync-env
```

3. **Run Migrations**
The package will seamlessly publish a new `changelog_entries` table directly into your application's existing database to store the timeline events:
```bash
php artisan migrate
```

4. **Configure AI Drivers**
Add your Primary API key to your `.env` file to enable AI summaries. You can optionally configure an automatic Fallback driver (e.g., Groq or Ollama) to guarantee the changelog generates correctly even if OpenAI limits are exhausted!

```env
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4o"

# Optional: Automatic Fallback Driver (Example: Groq)
CHANGELOG_FALLBACK_ENABLED=true
CHANGELOG_FALLBACK_API_KEY="gsk-your-groq-key"
CHANGELOG_FALLBACK_BASE_URI="https://api.groq.com/openai/v1"
CHANGELOG_FALLBACK_MODEL="llama3-70b-8192"
```

5. **Optional: publish Blade views** so you can edit markup and classes to match your design system:

```bash
php artisan vendor:publish --tag=changelog-views
```

Overrides live under `resources/views/vendor/changelog/`. Laravel resolves the `changelog::` namespace against that folder first, then the package.

If you published the timeline view and embed the component, merge changes from the package view (EasyMDE `@assets`, markdown display styles) or remove `resources/views/vendor/changelog/livewire/changelog-timeline.blade.php` so the package default is used again. Composer does not overwrite published files.

## Styling, layout, and embedding

### Match your app template (full page)

The package route renders `ChangelogTimeline` as a **full page** only when the current route name is `changelog.index` (or any name listed in `full_page_route_names` in config). In that case the component applies `layout_view` and `page_title`.

- **Default:** `layout_view` is `changelog::layouts.app` (CDN Tailwind; EasyMDE ships from the timeline view via Livewire assets). Good for trying the feature quickly.
- **Production:** set `layout_view` in published `config/changelog.php` to your shell, for example `components.layouts.app`, so the changelog uses the same layout, Vite assets, and typography as the rest of the site. Your layout should include `@livewireStyles` / `@livewireScripts` (and `@stack('changelog-styles')` / `@stack('changelog-scripts')` if you push assets from customized views).

Set `layout_view` to `null` or `''` to skip an explicit `->layout()` call and use your Livewire default page layout (see `config/livewire.php`, for example `component_layout` on Livewire 4).

Env overrides (optional): `CHANGELOG_LAYOUT`, `CHANGELOG_PAGE_TITLE`, `CHANGELOG_ROUTE_NAME`, `CHANGELOG_TIMELINE_VIEW`.

### Embed in any page (not the package URL)

Register the component anywhere Livewire runs:

```blade
<livewire:changelog-timeline />
```

On routes **other** than the configured full-page names, the component returns **only** the timeline markup (no outer `layout_view`), so it sits inside your existing `@extends` / layout and picks up your CSS.

**Markdown summaries:** rendered HTML uses the class `changelog-markdown` with scoped CSS registered via Livewire `@assets`. You do **not** need to add `@tailwindcss/typography` for lists and headings to look right. If you prefer Tailwind Typography’s `prose` theme instead, publish the timeline view, remove `changelog-markdown` / the markdown `@assets` block, and apply your own `prose` classes.

**EasyMDE:** the timeline view registers EasyMDE CSS and JS with Livewire `@assets`, so the modal works on the package route and when you embed the component. Publish the Blade view if you need pinned or self-hosted EasyMDE URLs instead of unpkg.

### Rename the package route

Publish config and set `route_prefix`, `middleware`, and `route_name`. The route file uses `route_name` for `Route::…->name(...)`. If you add another named route that points at `ChangelogTimeline::class`, add that name to `full_page_route_names` so it still gets layout + title.

## Usage

### 1. Recording an Event
Whenever a notable action happens in your application, call the `Changelog` facade. Parameter names match `ChangelogRecorderService::record()`:

```php
use MannyDesignedIt\ChangelogTracker\Facades\Changelog;

Changelog::record(
    title: 'Product inventory adjusted',
    raw_change: [
        'old_stock' => 10,
        'new_stock' => 45,
        'user' => auth()->user()?->name,
    ],
    source_type: 'App\\Models\\Product',
    actor_user_id: auth()->id(),
);
```

`actor_user_id` is optional; when omitted, the current authenticated user id is used when available. Put any external identifier (for example a product id) inside `raw_change` so the AI prompt still has full context.

Once recorded, a queued job event automatically kicks off in the background to communicate with your AI Provider and draft a rich Markdown summary.

### 2. The Timeline Panel & Markdown Editor
By default, you can view your real-time changelog timeline at the URL from `route_prefix` (see `config/changelog.php`), for example:

👉 **`your-domain.com/admin/changelog`**

You can also embed the same UI with `<livewire:changelog-timeline />` on any other page (see **Styling, layout, and embedding** above).

From this beautifully styled Livewire timeline, you can visually observe actions taking place.
- **Manual Adjustments:** Click the "New Entry" or "Edit" buttons to launch the inline Markdown Text Editor to manually document features or overrule AI suggestions.
- **Status Control:** Alter the visibility states (`Processed`, `Pending`, `Failed`) of any item effortlessly right from the modal UI.

### 3. Securing the Timeline Route
By default, the package leverages the standard `web` middleware, meaning the page is accessible publicly. You should restrict access to this page by updating the middleware settings inside your published `config/changelog.php`:

```php
// config/changelog.php
return [
    'route_prefix' => 'admin/changelog',
    
    // Add your auth middleware here to secure the panel
    'middleware' => ['web', 'auth', 'can:view-changelog'],
    
    // ...
];
```

## Requirements
- PHP 8.2+
- Laravel 11.x, 12.x, or 13.x
- Livewire 3.x or 4.x (this package declares `^3.0|^4.0`). On Livewire 4, full-page changelog routes use `Route::livewire()` when that macro is available; Livewire 3 continues to use `Route::get(..., Component::class)`.
- An Active Queue Worker (e.g., `php artisan queue:work` or Laravel Horizon) to process the AI generation requests in the background.

If you upgrade an app from Livewire 3 to 4, follow the [official upgrade guide](https://livewire.laravel.com/docs/4.x/upgrading). Remove or replace `livewire/volt` if you are not using Volt on v4; check your Volt version’s Livewire constraint in Composer.

## License

MIT. See [LICENSE](LICENSE) in this repository.
