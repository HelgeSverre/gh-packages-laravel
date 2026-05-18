# Laravel Wisra

Inject HTML comments and attributes into compiled Blade templates to expose view file paths and source line numbers. Useful for debugging, IDE integration (e.g. [Wisra](https://github.com/laravel/wisra)), and **AI/LLM-assisted development**.

## Installation

Install via Composer as a development-only dependency:

```bash
composer require --dev bardh78/laravel-wisra
```

The package auto-discovers its service provider. Laravel Wisra is always local-only and should not be installed as a production/runtime dependency.

### Configuration (optional)

Publish the config file to customize behavior:

```bash
php artisan vendor:publish --tag=config
```

Or publish only this package's config:

```bash
php artisan vendor:publish --provider="Bardh78\LaravelWisra\LaravelWisraServiceProvider"
```

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LARAVEL_WISRA_ENABLED` | `true` | Enable or disable the instrumentation |
| `LARAVEL_WISRA_SKIP_LIVEWIRE` | `true` | Skip instrumentation for Livewire views and update requests |
| `LARAVEL_WISRA_INJECT_CONTEXT_META_TAGS` | `true` | Inject request-level Wisra meta tags into the document `<head>` |

> **Note:** After enabling or disabling Wisra, clear the compiled view cache so changes take effect:
> ```bash
> php artisan view:clear
> ```

## What it does

- **View path comments** — Wraps each compiled view with `<!-- [view] /path/to/view.blade.php -->` and `<!-- [/view] -->`
- **Line annotations** — Adds `wisra-start-line` and `wisra-end-line` attributes to HTML elements for source mapping
- **Translation comments** — Wraps `__()` and `trans()` echoes with `<!-- [laravel-translation] /path/to/lang/file.php -->` for easier translation debugging

## How LLMs benefit from it

When AI coding assistants (Cursor, Copilot, Claude, etc.) work with your Laravel app, they often need to:

1. **Inspect rendered output** — Via browser tools, DOM snapshots, or page source
2. **Map HTML back to source** — Find which Blade file and line produced a given element
3. **Suggest precise edits** — Know exactly where to change code

**Without Laravel Wisra:** The assistant sees raw HTML with no trace to the Blade source. It must guess files, search the codebase, or rely on structure alone.

**With Laravel Wisra:** The rendered HTML includes:

- **Exact file paths** in comments, so the assistant knows which view file to edit
- **Line numbers** on elements via `wisra-start-line` and `wisra-end-line`, so it can target the correct line
- **Translation file paths** for `__()` calls, so it can update the right lang file

### Example

Rendered HTML with Wisra:

```html
<!-- [view] /project/resources/views/welcome.blade.php -->
<div class="hero" wisra-start-line="5" wisra-end-line="12">
  <!-- [laravel-translation] /project/lang/en/welcome.php -->
  <h1>Welcome to our app</h1>
  <!-- [/laravel-translation] -->
</div>
<!-- [/view] /project/resources/views/welcome.blade.php -->
```

An LLM can now:

- Open `resources/views/welcome.blade.php` and edit around lines 5–12
- Open `lang/en/welcome.php` to change the translation for the heading
- Avoid searching or guessing which files to modify

### Best practices for LLM workflows

1. **Install in development only** — Use `composer require --dev`; the package also refuses to instrument non-local Laravel environments
2. **Use with browser MCP tools** — When the assistant inspects the page, it gets file/line hints
3. **Combine with Cursor rules** — Mention that view comments are present so the assistant knows to use them

## Livewire compatibility

Laravel Wisra skips instrumentation for Livewire by default:

- **Livewire update requests** are ignored so Wisra doesn't alter Livewire's AJAX payload rendering
- **Views in `resources/views/livewire/...`** are ignored
- **Templates containing Livewire syntax** like `@livewire`, `<livewire:...>`, `wire:*`, or `$wire` are ignored

If you intentionally want Wisra annotations inside Livewire-rendered Blade, set `LARAVEL_WISRA_SKIP_LIVEWIRE=false`.

## Request context meta tags

When a Blade document contains a `<head>` tag, Wisra can inject request-level meta tags like:

```html
<meta name="wisra-current-route" content="/app/panel">
<meta name="wisra-current-route-name" content="panel.index">
<meta name="wisra-current-controller" content="App\Http\Controllers\PanelController">
<meta name="wisra-current-action" content="index">
```

These values are rendered at runtime, so they stay correct even when Blade views are cached.

## Requirements

- PHP 8.2+
- Laravel 10.x, 11.x, or 12.x

## License

MIT
