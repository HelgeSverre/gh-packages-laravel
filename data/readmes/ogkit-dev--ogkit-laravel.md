# OG Kit for Laravel

A Laravel package for [OG Kit](https://ogkit.dev) — generate Open Graph images from your existing HTML and CSS.

## Installation

```bash
composer require ogkit/ogkit-laravel
```

Add your API key to `.env`:

```env
OGKIT_API_KEY=your-api-key
```

Optionally publish the config file:

```bash
php artisan vendor:publish --tag=ogkit-config
```

## Usage

### OG template

Use the `@ogTemplate` Blade directives anywhere in your page body to define the HTML that OG Kit should render:

```blade
<body>
    <article>
        <h1>{{ $post->title }}</h1>
        <p>{{ $post->excerpt }}</p>
    </article>

    @ogTemplate
        <div class="w-full h-full bg-slate-900 text-white p-16 flex flex-col justify-end">
            <p class="text-xl opacity-80">{{ config('app.name') }}</p>
            <h1 class="mt-6 text-6xl font-bold">{{ $post->title }}</h1>
            <p class="mt-4 text-2xl">{{ $post->excerpt }}</p>
        </div>
    @endOgTemplate
</body>
```

OG Kit renders this template from the page itself, so it has access to the same Blade variables, CSS, fonts, images, and other assets or resources that are already available on your site.

This outputs:

```html
<template data-og-template>
    ...
</template>
```

If you need to build the template string in PHP first, you can also use the facade directly:

```php
use OgKit\Facades\OgKit;

$template = OgKit::template('<div class="w-full h-full">Hello</div>');
```

### Meta tags

Use the `@ogMeta` Blade directive in your `<head>` to render all the Open Graph and Twitter Card meta tags:

```blade
<head>
    @ogMeta($post->title, $post->excerpt)
</head>
```

This renders:

```html
<meta property="og:title" content="My Post Title" />
<meta property="og:description" content="A short excerpt." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yoursite.com/posts/my-post" />
<meta property="og:image" content="https://ogkit.dev/img/your-api-key.jpeg?url=https%3A%2F%2Fyoursite.com%2Fposts%2Fmy-post" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="My Post Title" />
<meta name="twitter:description" content="A short excerpt." />
<meta name="twitter:image" content="https://ogkit.dev/img/your-api-key.jpeg?url=https%3A%2F%2Fyoursite.com%2Fposts%2Fmy-post" />
```

The URL defaults to the current request URL. You can pass it explicitly, along with a custom type:

```blade
@ogMeta($title, $description, $canonicalUrl, 'article')
```

### Local preview

Use the `@ogPreview` directive to load the OG Kit preview script. It only outputs in local development, so you can keep it in your layout permanently:

```blade
<head>
    @ogPreview
    @ogMeta($title, $description)
</head>
```

Then append `?ogkit-render` to any URL to see your OG image template rendered at 1200x630px.

For package development with Workbench:

```bash
OGKIT_API_KEY=your-api-key \
OGKIT_BASE_URL=http://127.0.0.1:8001/img/ \
APP_URL=http://127.0.0.1:8000 \
./vendor/bin/testbench serve --host=127.0.0.1 --port=8000
```

### URL generation

If you need the image URL directly (e.g. in an API response or a custom meta tag setup), use the facade:

```php
use OgKit\Facades\OgKit;

$imageUrl = OgKit::url('https://yoursite.com/posts/my-post');
// https://ogkit.dev/img/your-api-key.jpeg?url=https%3A%2F%2Fyoursite.com%2Fposts%2Fmy-post
```

## Wildcard domains (signed URLs)

If your API key uses a wildcard domain pattern, add your secret key to `.env`:

```env
OGKIT_SECRET_KEY=your-secret-key
```

When a secret key is configured, all generated URLs automatically include an HMAC-SHA256 signature:

```
https://ogkit.dev/img/your-api-key.jpeg?url=...&signature=abc123...
```

## Configuration

```php
// config/ogkit.php

return [
    // Your OG Kit API key
    'api_key' => env('OGKIT_API_KEY', ''),

    // Secret key for wildcard domain signing
    'secret_key' => env('OGKIT_SECRET_KEY', ''),

    // OG Kit API base URL
    'base_url' => env('OGKIT_BASE_URL', 'https://ogkit.dev/img/'),

    // Environments where the preview script is loaded
    'preview_environments' => ['local'],
];
```

## License

MIT
