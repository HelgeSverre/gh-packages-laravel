# programmerhasan/seo

<p align="center">
    <img src="https://raw.githubusercontent.com/programmerhasan/seo/master/art/banner.webp" alt="programmerhasan/seo">
</p>

<p align="center">
Modern AI-Powered SEO Toolkit for Laravel, Inertia.js & Modern Web Apps.
</p>

<p align="center">
    <a href="https://packagist.org/packages/programmerhasan/seo">
        <img src="https://img.shields.io/packagist/v/programmerhasan/seo.svg" alt="Latest Version">
    </a>
    <a href="https://packagist.org/packages/programmerhasan/seo">
        <img src="https://img.shields.io/packagist/dt/programmerhasan/seo.svg" alt="Downloads">
    </a>
    <a href="LICENSE.md">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
    </a>
</p>

---

# Features

- Meta Tags
- OpenGraph
- Twitter/X Cards
- JSON-LD Schema
- Multi Schema Builder
- Canonical & hreflang Links
- Inertia.js SEO Payloads
- React/Vue SSR Helpers
- SSR Support
- Sitemap Generator
- Image Sitemap
- Video Sitemap
- News Sitemap
- Robots.txt Generator
- SEO Audit Command
- Performance SEO Helpers
- Auto Model SEO
- Blade Components
- Optional AI SEO Drivers
- Laravel Auto Discovery
- Livewire Support
- Filament Support
- Nova Support
- Developer Friendly Fluent API

---

# Installation

```bash
composer require programmerhasan/seo
```

Publish config:

```bash
php artisan vendor:publish --tag=seo-config
```

Publish views:

```bash
php artisan vendor:publish --tag=seo-views
```

---

# Quick Usage

```php
use ProgrammerHasan\Seo\Facades\Seo;

Seo::title('Laravel SEO Package')
    ->description('A lightweight SEO toolkit for Laravel.')
    ->canonical(url()->current())
    ->image(asset('images/og.jpg'));
```

Render SEO tags:

```blade
<head>
    {!! Seo::generate() !!}
</head>
```

Or use the Blade component:

```blade
<x-seo />
```

---

# Fluent Builder API

```php
$html = Seo::make()
    ->title('Best Laravel SEO Toolkit')
    ->description('Modern SEO package for Laravel, Inertia and APIs.')
    ->canonical('https://example.com/packages/seo')
    ->image('https://example.com/images/seo-og.jpg')
    ->article(published: now()->toAtomString())
    ->generate();
```

---

# Meta Tags

```php
Seo::title('Page title');
Seo::description('Page description');
Seo::keywords(['laravel', 'seo', 'schema']);
Seo::canonical('https://example.com/page');
Seo::author('Programmer Hasan');
Seo::robots('index, follow');

Seo::noIndex();
Seo::noFollow();
```

---

# OpenGraph

```php
Seo::title('Product page')
    ->description('Product description')
    ->image('https://example.com/product.jpg')
    ->type('product')
    ->og('locale', 'en_US')
    ->og('site_name', 'Example Store');
```

---

# Twitter/X Cards

```php
Seo::twitter('card', 'summary_large_image')
    ->twitter('site', '@yourhandle')
    ->twitter('creator', '@programmerhasan');
```

---

# JSON-LD Schema

```php
$schema = Seo::schema();

Seo::make()
    ->title('SEO Toolkit')
    ->schema($schema->product(
        name: 'SEO Toolkit',
        description: 'Laravel SEO package',
        image: 'https://example.com/product.jpg',
        sku: 'SEO-001',
        offers: $schema->offer('49', 'USD')
    ))
    ->generate();
```

## Available Schema Helpers

```php
Seo::schema()->organization('Example', 'https://example.com');
Seo::schema()->website('Example', 'https://example.com');
Seo::schema()->person('Programmer Hasan');
Seo::schema()->article('Title', 'https://example.com/post');
Seo::schema()->blogPosting('Title', 'https://example.com/post');
Seo::schema()->newsArticle('Title', 'https://example.com/news');
Seo::schema()->product('Product name');
Seo::schema()->offer('49', 'USD');
Seo::schema()->aggregateRating(4.8, 120);
Seo::schema()->review('Great product', 'Hasan', 5);
Seo::schema()->faq([['question' => 'Question?', 'answer' => 'Answer.']]);
Seo::schema()->breadcrumb([['name' => 'Home', 'url' => '/']]);
Seo::schema()->event('Laravel Meetup', '2026-05-12');
Seo::schema()->course('Laravel SEO', 'Learn SEO for Laravel');
Seo::schema()->howTo('How to install', ['Install package', 'Publish config']);
Seo::schema()->recipe('Recipe name', ['Ingredient'], ['Step 1']);
Seo::schema()->videoObject('Video title', 'Description', 'thumb.jpg', '2026-05-12');
Seo::schema()->softwareApplication('App name');
```

---

# Inertia.js SEO

```php
return Inertia::render('Posts/Show', [
    'post' => $post,
    'seo' => Seo::make()
        ->title($post->title)
        ->description($post->excerpt)
        ->canonical(route('posts.show', $post))
        ->forInertia(),
]);
```

React example:

```jsx
import { Head } from '@inertiajs/react'

export default function Show({ post, seo }) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
      </Head>

      <h1>{post.title}</h1>
    </>
  )
}
```

---

# Auto Model SEO

```php
Seo::fromModel($post)->generate();
```

Supported model fields:

- seo_title
- title
- name
- seo_description
- description
- excerpt
- seo_image
- image_url
- image

---

# Canonical, hreflang & Pagination

```php
Seo::autoCanonical();

Seo::alternate('en', 'https://example.com/en/page');
Seo::alternate('bn', 'https://example.com/bn/page');
Seo::alternate('x-default', 'https://example.com/page');

Seo::pagination($posts);
```

---

# Sitemaps

This package supports dynamic sitemaps, static sitemap files, image/video/news sitemaps, model-based URLs, and sitemap indexes.

Basic example:

```php
$xml = Seo::sitemap()
    ->add('https://example.com')
    ->add('https://example.com/about')
    ->image('https://example.com/post', [
        'https://example.com/image.jpg'
    ])
    ->video('https://example.com/video', [
        ['title' => 'Demo video']
    ])
    ->news('https://example.com/news', [
        'name' => 'Example News',
        'language' => 'en',
        'title' => 'News title',
    ])
    ->toXml();
```

Save sitemap:

```php
Seo::sitemap()
    ->add('https://example.com')
    ->save(public_path('sitemap.xml'));
```

Sitemap index:

```php
Seo::sitemap()
    ->index('https://example.com/sitemap-posts.xml')
    ->index('https://example.com/sitemap-products.xml')
    ->save(public_path('sitemap.xml'));
```

Generate via command:

```bash
php artisan seo:sitemap
```
👉 Full documentation: [docs/sitemap.md](./docs/sitemap.md)
---

# Robots.txt

```php
$content = Seo::robots()
    ->allow('/')
    ->disallow('/admin')
    ->sitemap('https://example.com/sitemap.xml')
    ->toString();
```

Command:

```bash
php artisan seo:robots
```

---

# Performance SEO

```php
Seo::preload('/fonts/app.woff2', as: 'font', type: 'font/woff2', crossorigin: true);

Seo::preconnect('https://fonts.googleapis.com');

Seo::dnsPrefetch('https://cdn.example.com');
```

---

# Optional AI SEO

```php
Seo::ai()->generate($content);

Seo::ai()->improve($content);

Seo::ai()->analyze($content, 'laravel seo');
```

## OpenAI

```env
SEO_AI_DRIVER=openai
SEO_OPENAI_API_KEY=your-api-key
SEO_OPENAI_MODEL=gpt-4o-mini
```

## Gemini

```env
SEO_AI_DRIVER=gemini
SEO_GEMINI_API_KEY=your-api-key
SEO_GEMINI_MODEL=gemini-1.5-flash
```

## Ollama

```env
SEO_AI_DRIVER=ollama
SEO_OLLAMA_URL=http://localhost:11434
SEO_OLLAMA_MODEL=llama3
```

---

# Commands

```bash
php artisan seo:install
php artisan seo:sitemap
php artisan seo:robots
php artisan seo:audit
```

---

# Testing

```bash
composer install
composer test
composer format:test
composer analyse
```

Run all quality checks:

```bash
composer ci
```

---

# Version Support

| Package | Supported |
|---|---|
| PHP | 8.2, 8.3, 8.4 |
| Laravel | 10, 11, 12 |

---

# Documentation

Full docs are available in the `docs/` directory.
- [Installation](./docs/installation.md)
- [Configuration](./docs/configuration.md)
- [Basic Usage](./docs/basic-usage.md)
- [Meta Tags](./docs/meta-tags.md)
- [OpenGraph](./docs/open-graph.md)
- [Twitter Cards](./docs/twitter-cards.md)
- [JSON-LD Schema](./docs/json-ld.md)
- [Sitemaps](./docs/sitemap.md)
- [Robots.txt](./docs/robots.md)
- [Inertia.js](./docs/inertia.md)
- [AI SEO](./docs/ai.md)
- [Blade Components](./docs/blade-components.md)
- [Testing](./docs/testing.md)

---

# Security

Please see [SECURITY.md](SECURITY.md).

---

# Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).

---

# License

MIT License.

---

# Author

Programmer Hasan

- GitHub: https://github.com/programmerhasan
- LinkedIn: https://linkedin.com/in/programmerhasan
- Website: https://programmerhasan.com
