# Bootstrap Snippet — Laravel Page Builder

A drag-and-drop page builder for Laravel that lets you compose pages from reusable Bootstrap 5 sections. Built with a live field editor sidebar, image uploads, embed support, and a JSON-driven section library you can extend with your own custom sections.

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12
- Bootstrap 5 (loaded in your layout)

---

## Installation

Install via Composer:

```bash
composer require binod/bootstrap-snippet
```

The package auto-discovers its service provider. No manual registration needed.

Run the migrations to create the builder tables:

```bash
php artisan migrate
```

Publish everything at once (config, assets, and section files):

```bash
php artisan vendor:publish --tag=bootstrap-snippet
```

Or publish only what you need:

```bash
# Config file → config/bootstrap-snippet.php
php artisan vendor:publish --tag=bootstrap-snippet-config

# Compiled CSS/JS → public/vendor/bootstrap-snippet/
php artisan vendor:publish --tag=bootstrap-snippet-assets

# Section JSON files → resources/bootstrap-snippet/sections/
php artisan vendor:publish --tag=bootstrap-snippet-sections
```

---

## Usage

Open the builder in your browser:

```
http://your-app.test/snippet-builder
```

From the builder you can:

- **Create** a new page component and give it a name
- **Add sections** from the library (hero, features, CTA, testimonials, pricing, and more)
- **Edit field values** (text, textarea, image, URL, color, video embed) in the live sidebar
- **Reorder** sections by dragging them
- **Preview** the finished page
- **Publish** the component to make it visible to front-end visitors

To embed a built component anywhere in your Blade templates:

```blade
@include('bootstrap-snippet::render', ['slug' => 'your-page-slug'])
```

---

## Configuration

After publishing, edit `config/bootstrap-snippet.php`:

```php
return [
    // URL prefix for all builder routes (default: 'snippet-builder')
    'prefix' => 'snippet-builder',

    // Middleware stack for builder routes
    'middleware' => ['web'],

    // Storage disk and directory for uploaded images
    'upload_disk' => 'public',
    'upload_path' => 'snippet-uploads',

    // Database table prefix
    'table_prefix' => 'bsnippet_',

    // Auth: show draft components to logged-in users only
    'auth' => [
        'enabled' => false,
        'guard'   => 'web',
    ],

    // Defaults applied to new components
    'defaults' => [
        'layout_type' => 'container',   // container | container-fluid
        'status'      => 'draft',
    ],
];
```

---

## Section Library

The package ships with a set of Bootstrap 5 sections across these categories:

- **Hero** — full-width and split hero banners
- **Features** — icon grids and feature lists
- **Content** — text + image rows, company intro blocks
- **CTA** — call-to-action banners
- **Testimonials** — quote cards and review grids
- **Pricing** — pricing table layouts
- **FAQ** — accordion FAQ blocks
- **Gallery** — image grid layouts
- **Contact** — contact form sections
- **Footer** — footer layouts

### Adding custom sections

Publish the default section JSON files so you can extend them:

```bash
php artisan vendor:publish --tag=bootstrap-snippet-sections
```

Your customisable sections will be at `resources/bootstrap-snippet/sections/`. See [CREATING_SECTIONS.md](CREATING_SECTIONS.md) for a full guide with field types, placeholder syntax, and a complete worked example.

---

## Running Tests

The test suite uses Laravel's built-in PHPUnit setup — no additional packages required.

```bash
# Run only the package tests
php artisan test --testsuite="Package Unit,Package Feature"

# Run everything
php artisan test
```

---

## Field Types

Each editable field in a section template is backed by one of these types:

| Type       | Editor Input        | Use For                            |
|------------|---------------------|------------------------------------|
| `text`     | Single-line input   | Headings, short labels             |
| `textarea` | Multi-line textarea | Paragraphs, long descriptions      |
| `url`      | URL input           | Link `href` values                 |
| `image`    | Upload + URL input  | Image `src` attributes             |
| `color`    | Color picker        | Background and text colours        |
| `embed`    | URL input           | YouTube / Vimeo embed URLs         |
| `repeater` | Dynamic rows        | Lists, team members, pricing tiers |

---

## License

MIT — see [LICENSE](LICENSE) for details.
