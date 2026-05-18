# FlexWave WYSIWYG

A modern, feature-rich WYSIWYG rich-text editor package for **Laravel 10+** and **PHP 8.2+**.

---

## Features

- **Blade component** `<x-flexwave-editor />` — drop in anywhere
- Formatting: bold, italic, underline, strikethrough
- Headings H1–H6, paragraph
- Ordered & unordered lists, blockquotes
- Inline code & code blocks
- Link insertion (modal) + image upload
- Text alignment (left / center / right / justify)
- Drag & drop and paste images directly into the editor
- HTML source view & live preview panel
- Fullscreen editing mode
- Word count / character count status bar
- Dark mode (`auto`, `light`, `dark`)
- Configurable toolbar via `config/flexwave-wysiwyg.php`
- Laravel events on upload/delete (`ImageUploaded`, `ImageDeleted`)
- Optional image resizing via Intervention Image v3
- Custom plugin support
- Public API (`FlexWave.getInstance(id)`)
- Fully responsive
- Zero JS dependencies (vanilla JS, ~12 KB)

---

## Requirements

| Requirement | Version |
|---|---|
| PHP | ^8.2 |
| Laravel | ^10.0 or ^11.0 |
| Intervention Image | ^3.0 |

---

## Installation

### 1. Install via Composer

```bash
composer require flexwave/wysiwyg
```

The package is auto-discovered via Laravel's package auto-discovery (no need to add the provider manually).

### 2. Publish assets

```bash
# Publish everything (config + views + assets)
php artisan vendor:publish --tag=flexwave-wysiwyg

# Or publish individually:
php artisan vendor:publish --tag=flexwave-wysiwyg-config
php artisan vendor:publish --tag=flexwave-wysiwyg-views
php artisan vendor:publish --tag=flexwave-wysiwyg-assets
```

### 3. Create the storage symlink (if using the `public` disk)

```bash
php artisan storage:link
```

### 4. Include assets in your layout

Add to your main Blade layout (e.g. `resources/views/layouts/app.blade.php`):

```blade
<head>
    @wysiwygStyles
</head>
<body>
    {{-- page content --}}
    @wysiwygScripts
</body>
```

Or use standard HTML tags after publishing assets:

```html
<link rel="stylesheet" href="{{ asset('vendor/flexwave-wysiwyg/css/editor.css') }}">
<script src="{{ asset('vendor/flexwave-wysiwyg/js/editor.js') }}" defer></script>
```

---

## Usage

### Basic usage inside a Blade form

```blade
<form method="POST" action="/posts">
    @csrf

    <x-flexwave-editor
        name="content"
        :value="old('content', $post->content ?? '')"
        placeholder="Write your post content here..."
    />

    <button type="submit">Save</button>
</form>
```

### Component attributes

| Attribute     | Type      | Default                      | Description                              |
|---------------|-----------|------------------------------|------------------------------------------|
| `name`        | `string`  | `content`                    | HTML form field name                     |
| `value`       | `string`  | `''`                         | Initial HTML content                     |
| `placeholder` | `string`  | *(from config)*              | Placeholder text when empty              |
| `height`      | `int`     | `400`                        | Minimum editor height in pixels          |
| `id`          | `string`  | *(auto-generated)*           | HTML id for the editor wrapper           |
| `required`    | `bool`    | `false`                      | Mark textarea as required                |
| `readonly`    | `bool`    | `false`                      | Disable editing                          |
| `dark-mode`   | `string`  | `auto`                       | `auto`, `light`, or `dark`               |
| `class`       | `string`  | `''`                         | Extra CSS classes on the wrapper         |

### Validation errors

The component automatically reads and displays Laravel validation errors:

```php
// In your controller:
$request->validate([
    'content' => 'required|string|min:10',
]);
```

```blade
{{-- In your view: --}}
<x-flexwave-editor name="content" :value="old('content')" />
@error('content')
    <p>{{ $message }}</p>
@enderror
```

*(The component renders the error message automatically — no need for a separate `@error` block.)*

---

## Server-side Helpers

Use the `Wysiwyg` facade for server-side processing:

```php
use FlexWave\Wysiwyg\Facades\Wysiwyg;

// Sanitize untrusted HTML from the editor
$clean = Wysiwyg::sanitize($request->input('content'));

// Convert HTML to plain text
$text = Wysiwyg::toText($html);

// Get a plain-text excerpt
$excerpt = Wysiwyg::excerpt($html, 160);

// Word count
$words = Wysiwyg::wordCount($html);
```

---

## Configuration

`config/flexwave-wysiwyg.php` (after publishing):

```php
return [
    // Route prefix for upload endpoints
    'route_prefix' => 'flexwave',

    // Middleware applied to upload routes
    'middleware' => ['web', 'auth'],

    // File upload settings
    'upload' => [
        'disk'     => env('FLEXWAVE_UPLOAD_DISK', 'public'),
        'path'     => env('FLEXWAVE_UPLOAD_PATH', 'wysiwyg/uploads'),
        'max_size' => 5120,  // KB
        'allowed'  => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ],

    // Optional image resizing (Intervention Image)
    'image_resize' => [
        'enabled'    => true,
        'max_width'  => 1920,
        'max_height' => 1080,
        'quality'    => 85,
    ],

    // Toolbar groups (remove items to hide them)
    'toolbar' => [
        ['heading', 'paragraph'],
        ['bold', 'italic', 'underline', 'strikethrough'],
        // ...
    ],

    // Editor defaults
    'defaults' => [
        'height'      => 400,
        'placeholder' => 'Start writing here...',
        'dark_mode'   => 'auto', // 'auto' | 'light' | 'dark'
    ],
];
```

### Environment variables

```env
FLEXWAVE_UPLOAD_DISK=public
FLEXWAVE_UPLOAD_PATH=wysiwyg/uploads
FLEXWAVE_MAX_SIZE=5120
FLEXWAVE_RESIZE_ENABLED=true
FLEXWAVE_RESIZE_MAX_WIDTH=1920
FLEXWAVE_RESIZE_MAX_HEIGHT=1080
FLEXWAVE_RESIZE_QUALITY=85
```

---

## Events

Listen to upload events in `EventServiceProvider` or using `#[AsEventListener]`:

```php
use FlexWave\Wysiwyg\Events\ImageUploaded;
use FlexWave\Wysiwyg\Events\ImageDeleted;

// EventServiceProvider.php
protected $listen = [
    ImageUploaded::class => [
        \App\Listeners\LogImageUpload::class,
    ],
];
```

`ImageUploaded` properties:

| Property | Type | Description |
|---|---|---|
| `$path` | `string` | Storage path of the uploaded file |
| `$url` | `string` | Public URL of the uploaded file |
| `$disk` | `string` | Laravel disk used |
| `$user` | `?User` | Authenticated user (or `null`) |

---

## JavaScript API

```js
// Get instance by editor ID or wrapper element
const editor = FlexWave.getInstance('fw-editor-abc123');

// Get the current HTML content
const html = editor.getHTML();

// Set content programmatically
editor.setHTML('<p>Hello <strong>world</strong>!</p>');

// Clear the editor
editor.clear();

// Focus the editor
editor.focus();

// Set dark mode at runtime
editor.setDarkMode('dark'); // 'auto' | 'light' | 'dark'
```

### JavaScript Events

Listen for editor events on the wrapper element:

```js
const wrapper = document.querySelector('[data-fw-editor]');

wrapper.addEventListener('fw:init', e => console.log('Editor ready', e.detail));
wrapper.addEventListener('fw:change', e => console.log('HTML changed', e.detail.html));
wrapper.addEventListener('fw:uploadStart', e => console.log('Uploading', e.detail.file));
wrapper.addEventListener('fw:uploadSuccess', e => console.log('Uploaded', e.detail.url));
wrapper.addEventListener('fw:uploadError', e => console.warn('Upload failed', e.detail));
wrapper.addEventListener('fw:linkInserted', e => console.log('Link added', e.detail.href));
wrapper.addEventListener('fw:fullscreen', e => console.log('Fullscreen:', e.detail.active));
wrapper.addEventListener('fw:pluginLoaded', e => console.log('Plugin loaded', e.detail.src));
```

---

## Custom Plugins

Create a JS file and register it in the config:

```php
// config/flexwave-wysiwyg.php
'plugins' => [
    '/js/my-wysiwyg-plugin.js',
],
```

In your plugin file:

```js
// /public/js/my-wysiwyg-plugin.js
document.querySelectorAll('[data-fw-editor]').forEach(wrapper => {
    wrapper.addEventListener('fw:init', ({ detail }) => {
        const editor = FlexWave.getInstance(detail.editorId);
        // extend the editor here
    });
});
```

---

## Security

- All upload routes use the configured `middleware` (default: `['web', 'auth']`), ensuring only authenticated users can upload.
- File type is validated by MIME type, not just extension.
- Delete requests are restricted to the configured upload path prefix.
- The `Wysiwyg::sanitize()` helper strips disallowed HTML tags and blocks `javascript:` in `href`/`src` attributes.

---

## License

MIT — © 2026 FlexWave
