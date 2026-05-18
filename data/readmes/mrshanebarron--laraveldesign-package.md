# LaravelDesign

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrshanebarron/laraveldesign.svg?style=flat-square)](https://packagist.org/packages/mrshanebarron/laraveldesign)
[![Total Downloads](https://img.shields.io/packagist/dt/mrshanebarron/laraveldesign.svg?style=flat-square)](https://packagist.org/packages/mrshanebarron/laraveldesign)
[![License](https://img.shields.io/packagist/l/mrshanebarron/laraveldesign.svg?style=flat-square)](https://github.com/mrshanebarron/laraveldesign-package/blob/main/LICENSE)

A WordPress-like CMS package for Laravel with a **Wix-style visual page builder**. Build beautiful pages with drag-and-drop, or use the classic editor for blog posts.

**Live demo:** [socialapparatus.com](https://socialapparatus.com) · **Homepage:** [laraveldesign.com](https://laraveldesign.com)

## Features

- **Visual Page Builder** - Drag-and-drop editor powered by GrapesJS
- **Pre-built Blocks** - Hero sections, features grids, testimonials, pricing tables, CTAs, galleries, contact forms, FAQs
- **Responsive Controls** - Preview on desktop, tablet, and mobile
- **Live Preview** - See your changes in real-time
- **Classic Editor** - Traditional rich text editing for posts
- **Full CMS** - Posts, pages, categories, tags, menus, media library

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- Filament 3.x
- Livewire 3.x

## Installation

Install via Composer:

```bash
composer require mrshanebarron/laraveldesign
```

Run the install command:

```bash
php artisan laraveldesign:install
```

This publishes the config and migrations, runs migrations, creates the storage link, and sets up default menus.

Add the plugin to your Filament panel provider:

```php
use MrShaneBarron\LaravelDesign\Filament\LaravelDesignPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugins([
            LaravelDesignPlugin::make(),
        ]);
}
```

Publish the config file (optional):

```bash
php artisan vendor:publish --tag=laraveldesign-config
```

## Visual Page Builder

The visual page builder gives you Wix-like editing capabilities:

1. Create or edit a page in Filament admin
2. Click "Visual Editor" button to launch the drag-and-drop builder
3. Drag blocks from the left panel onto your page
4. Click any element to edit text, styles, or settings
5. Use device buttons to preview responsive layouts
6. Click Save to publish your changes

### Available Blocks

| Block | Description |
|-------|-------------|
| Hero Section | Full-width header with headline, subtext, and CTA |
| Text Block | Rich text content area |
| Image + Text | Side-by-side layout for features |
| Features Grid | 3-column feature showcase |
| Testimonials | Customer quotes with avatars |
| Pricing Table | 3-tier pricing comparison |
| Call to Action | Conversion-focused section |
| Image Gallery | Grid of images |
| Contact Form | Name, email, message form |
| FAQ | Accordion-style Q&A |
| 2/3 Columns | Layout containers |
| Basic elements | Text, images, buttons, dividers, spacers |

## Features

### Content Management
- **Posts** - Blog posts with categories, tags, featured images, and SEO fields
- **Pages** - Static pages with hierarchical structure and custom templates
- **Categories** - Hierarchical categories for organizing posts
- **Tags** - Simple tags for post classification
- **Menus** - Flexible menu builder with nested items
- **Media** - Media library for images, videos, and documents

### Filament Admin Panel
Full Filament 3 integration with resources for:
- Posts (with rich editor, categories, tags, SEO)
- Pages (with parent/child hierarchy, templates)
- Categories (with nesting)
- Tags
- Menus (with nested menu items)
- Media Library

### Frontend Components

#### Menu Component
```blade
<x-laraveldesign::menu location="header" />
```

With custom classes:
```blade
<x-laraveldesign::menu
    location="header"
    class="main-nav"
    itemClass="nav-item"
    linkClass="nav-link"
    activeClass="active"
/>
```

#### Recent Posts
```blade
<x-laraveldesign::recent-posts :limit="5" />
```

#### Categories List
```blade
<x-laraveldesign::categories :showCount="true" />
```

#### Tags Cloud
```blade
<x-laraveldesign::tags />
```

## Configuration

```php
// config/laraveldesign.php

return [
    // Layout to extend for frontend views
    'layout' => 'layouts.app',

    // Section name for content
    'content_section' => 'content',

    // Blog settings
    'blog_prefix' => 'blog',
    'blog_title' => 'Blog',
    'posts_per_page' => 10,

    // Media settings
    'media' => [
        'disk' => 'public',
        'directory' => 'media',
        'max_size' => 51200, // 50MB
    ],

    // Menu locations
    'menu_locations' => [
        'header' => 'Header Menu',
        'footer' => 'Footer Menu',
        'sidebar' => 'Sidebar Menu',
    ],

    // Page templates
    'page_templates' => [
        'default' => 'Default',
        'home' => 'Homepage',
        'full-width' => 'Full Width',
        'sidebar' => 'With Sidebar',
    ],
];
```

## Routes

The package automatically registers these routes:

| Route | Description |
|-------|-------------|
| `/blog` | Blog index |
| `/blog/{slug}` | Single post |
| `/category/{slug}` | Category archive |
| `/tag/{slug}` | Tag archive |
| `/{slug}` | Static pages (catch-all) |

## Customizing Views

Publish views to customize:

```bash
php artisan vendor:publish --tag=laraveldesign-views
```

Views will be published to `resources/views/vendor/laraveldesign/`.

## Using Models Directly

```php
use MrShaneBarron\LaravelDesign\Models\Post;
use MrShaneBarron\LaravelDesign\Models\Page;
use MrShaneBarron\LaravelDesign\Models\Category;
use MrShaneBarron\LaravelDesign\Models\Tag;
use MrShaneBarron\LaravelDesign\Models\Menu;
use MrShaneBarron\LaravelDesign\Models\Media;

// Get published posts
$posts = Post::posts()->published()->get();

// Get published pages
$pages = Post::pages()->published()->get();

// Get menu by location
$menu = Menu::getByLocation('header');

// Get categories with post count
$categories = Category::withCount('posts')->get();
```

## License

MIT License. See LICENSE file for details.
