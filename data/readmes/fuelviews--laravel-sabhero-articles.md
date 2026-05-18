# SAB Hero Articles Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-sabhero-articles.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-articles)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-sabhero-articles.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sabhero-articles)

A full-featured article management solution for Laravel applications with Filament admin panel integration. This package provides a complete article publishing platform with advanced features and an intuitive admin interface.

## Features

### Content Management
- **Complete Article Management**: Posts, categories, tags, and authors with full CRUD operations
- **Scheduled Publishing**: Schedule posts to be published automatically via queue jobs
- **Advanced Markdown Editor**: Rich markdown editing with file attachments and preview
- **Media Management**: Image uploads with responsive images, cloud storage support, and Spatie Media Library integration
- **Author System**: Full author profiles with avatars, bios, social links, and public author pages
- **Categories & Tags**: Organize content with many-to-many relationships
- **Post Status**: Draft, scheduled, and published states with automatic status transitions

### Admin Panel (Filament)
- **Filament Integration**: Full admin panel with resources for posts, categories, tags, pages, and users
- **Import/Export**: Export posts as CSV or production-ready migrations, import from CSV with images
- **Bulk Operations**: Delete, export, and manage multiple posts at once
- **Post Replication**: Duplicate posts with all media, categories, and tags
- **Advanced Filtering**: Filter posts by author, status, and dates
- **Charts & Analytics**: Publication statistics widget
- **Search**: Real-time post search in admin panel

### Frontend Features
- **Blade Components**: Ready-to-use UI components including cards, feature cards, breadcrumbs, and headers
- **Search Autocomplete**: Real-time Livewire search with keyboard navigation
- **SEO Optimization**: Built-in SEO metadata, Open Graph, and Twitter Card support
- **RSS Feed**: Automatic feed generation at `/articles/rss` with customizable settings
- **Breadcrumb Navigation**: Automatic breadcrumb generation with diglactic/laravel-breadcrumbs
- **Tailwind Pagination**: Custom pagination views styled for Tailwind CSS
- **Responsive Images**: Automatic srcset generation for all images
- **Related Posts**: Automatic related post suggestions based on categories

### Developer Features
- **Advanced Markdown Rendering**: Table of contents, heading permalinks, external link styling, task lists, footnotes, embeds (YouTube, Twitter, GitHub)
- **Video/Social Embeds**: Automatic embedding of videos and social media content
- **Route Model Binding**: Slug-based URLs with eager loading
- **Events**: `ArticlePublished` event for custom integrations
- **Queue Jobs**: `PostScheduleJob` for automatic publishing
- **Upgrade Command**: `sabhero-articles:upgrade-v2` for seamless v1→v2 migrations
- **Cloud Storage**: Full support for S3, DigitalOcean Spaces, and other storage providers
- **Configurable**: Table prefixes, route prefixes, middleware, and more

## Installation

### Prerequisites

This package requires Filament. If your project doesn't have Filament yet:

```bash
composer require filament/filament:"^3.3" -W
php artisan filament:install --panels
```

### Create a Filament User
```bash
php artisan make:filament-user
```

### Install the SAB Hero Articles Package

```bash
composer require fuelviews/laravel-sabhero-articles
```

## Configuration

### 1. Publish Configuration Files

```bash
php artisan vendor:publish --tag="sabhero-articles-config"
```

The configuration file (`config/sabhero-articles.php`) allows you to customize:

- **Table Prefixes**: Customize database table naming (default: `articles_`)
- **Route Configuration**: Set route prefix (default: `/articles`) and middleware (default: `['web']`)
- **User Model**: Configure which user model to use and column mappings
- **Panel Access**: Set allowed email domains for Filament panel access
- **Media Storage**: Configure which disk to use for media files (supports local, S3, etc.)
- **Heading Permalinks**: Customize CSS classes for markdown heading links

Example configuration:
```php
return [
    'tables' => [
        'prefix' => 'articles_',
    ],
    'route' => [
        'prefix' => 'articles',
        'middleware' => ['web'],
    ],
    'user' => [
        'model' => User::class,
        'foreign_key' => 'user_id',
        'columns' => [
            'name' => 'name',
            'slug' => 'slug',
        ],
        'allowed_domains' => [
            '@fuelviews.com', // Domains allowed to access Filament panel
        ],
    ],
    'heading_permalink' => [
        'html_class' => 'scroll-mt-40',
    ],
    'media' => [
        'disk' => 'public', // or 's3', 'digitalocean', etc.
    ],
];
```

### 2. Publish Migrations

```bash
php artisan vendor:publish --tag="sabhero-articles-migrations"
```

### 3. Run Migrations

```bash
php artisan migrate
```

This creates the following tables:
- `articles_posts` - Blog posts
- `articles_categories` - Post categories
- `articles_tags` - Post tags
- `articles_category_articles_post` - Category-post pivot
- `articles_post_articles_tag` - Post-tag pivot
- `pages` - SEO page metadata
- `media` - Spatie Media Library (images)

### 4. Publish Seeders

```bash
php artisan vendor:publish --tag="sabhero-articles-seeders"
```

### 5. Configure Page Seeder

Fill pages data in `database/seeders/PageTableSeeder.php` with your application's pages:

```php
use Fuelviews\SabHeroArticles\Models\Page;

public function run(): void
{
    $pages = [
        [
            'title' => 'Home',
            'route' => 'home', // Laravel route name, not URL slug
            'description' => 'Welcome to our home page',
        ],
        [
            'title' => 'About Us',
            'route' => 'about',
            'description' => 'Learn more about our company',
        ],
        [
            'title' => 'Contact',
            'route' => 'contact',
            'description' => 'Get in touch with us',
        ],
        // Add more pages...
    ];

    foreach ($pages as $pageData) {
        $page = Page::updateOrCreate(
            ['route' => $pageData['route']],
            $pageData
        );

        // Optional: Attach feature image to page
        // if (isset($pageData['image_path']) && file_exists($pageData['image_path'])) {
        //     $page->addMedia($pageData['image_path'])
        //         ->toMediaCollection('page_feature_image');
        // }
    }
}
```

**Note:** Pages support feature images via the `page_feature_image` media collection. You can attach images programmatically in the seeder (as shown in the commented code) or add them later through the Filament admin panel.

### 6. Run Seeders

```bash
php artisan db:seed --class=PageTableSeeder
```

### 7. Configure Storage (For Media Uploads)

Link public storage:
```bash
php artisan storage:link
```

For cloud storage (S3, etc.), configure your `.env` for AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
```

Then update `config/sabhero-articles.php`:
```php
'media' => [
    'disk' => 's3', // or 'digitalocean', etc.
],
```

## Integration

### 1. Attach to Filament Panel

Add the SAB Hero Articles plugin to your Filament panel provider:

```php
use Fuelviews\SabHeroArticles\Facades\SabHeroArticles;

public function panel(Panel $panel): Panel
{
    return $panel
        ->sidebarCollapsibleOnDesktop() // Optional: Enable collapsible sidebar on desktop
        ->plugins([
            SabHeroArticles::make()
        ]);
}
```

### 2. Add Traits and CanAccessPanel to User Model

Your user model needs to use the `HasArticle` trait and implement `FilamentUser`:

```php
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Fuelviews\SabHeroArticles\Traits\HasArticle;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class User extends Authenticatable implements FilamentUser, HasMedia
{
    use HasFactory, Notifiable, HasArticle, InteractsWithMedia;

    protected $fillable = [
        'name',
        'email',
        'password',
        'slug',      // Added by HasArticle trait
        'bio',       // Added by HasArticle trait
        'links',     // Added by HasArticle trait (JSON)
        'is_author', // Added by HasArticle trait
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'links' => 'array',
        'is_author' => 'boolean',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        $allowedDomains = config('sabhero-articles.user.allowed_domains', []);

        foreach ($allowedDomains as $domain) {
            if (str_ends_with($this->email, $domain)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Register media collections for user avatars
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->registerMediaConversions(function () {
                $this->addMediaConversion('thumb')
                    ->width(208)
                    ->height(208)
                    ->crop('crop', 208, 208);
            });
    }
}
```

**Note:** The `HasArticle` trait provides:
- Automatic slug generation for users
- `is_author` default value of `true`
- Author-specific query scopes
- Relationship to posts
- Avatar management methods

## Upgrading

### Upgrading from v1 to v2

The package includes an automated upgrade command that handles schema changes, seeder updates, and wrapper package upgrades:

```bash
php artisan sabhero-articles:upgrade-v2
```

**What it does:**
- Renames `pages.slug` to `pages.route` (stores Laravel route names, not URL slugs)
- Renames `posts.feature_image_alt_text` to `posts.post_feature_image_alt_text`
- Drops obsolete `feature_image` and `page_feature_image` columns (now handled by Spatie Media Library)
- Updates media collection names from `feature_image` to `post_feature_image` and `page_feature_image`
- Updates your published `PageTableSeeder.php` to use new column names
- Optionally upgrades the wrapper package to ^2.0

**Options:**
- `--force` - Re-run migrations even if already executed

**Example:**
```bash
# Standard upgrade
php artisan sabhero-articles:upgrade-v2

# Force re-run (if upgrade failed previously)
php artisan sabhero-articles:upgrade-v2 --force
```

The command provides detailed output showing what changes are being made and verifies successful completion.

## Import/Export Features

The package includes powerful import/export functionality for migrating posts between installations or backing up content.

### CSV Export

Export selected posts as a ZIP file containing a CSV and all images:

1. Navigate to Posts in Filament admin panel
2. Select posts using checkboxes
3. Click "Bulk actions" → "Export posts (csv)"
4. Download ZIP file

**ZIP Contents:**
- `posts.csv` - All post data with headers
- `images/` - All post feature images

**CSV Format:**
```csv
ID,Title,Subtitle,Content,Slug,Status,Categories,Tags,Feature Image Alt Text,Additional Media,Author,Published At,Scheduled For,Created At,Updated At
```

### CSV Import

Import posts from a CSV + images ZIP file:

1. Click "Import posts" in the table header
2. Upload your ZIP file (must contain `posts.csv` and `images/` directory)
3. Posts are created or updated based on slug
4. Categories and tags are automatically created if they don't exist

**Features:**
- Idempotent: Running the same import multiple times updates existing posts (no duplicates)
- Creates missing categories and tags automatically
- Attaches images via Spatie Media Library
- Imports in chronological order (oldest to newest)
- Supports cloud storage uploads

### Migration Export

Export posts as a production-ready Laravel migration package:

1. Select posts in Filament
2. Click "Bulk actions" → "Export posts (migration)"
3. Download ZIP file

**ZIP Contents:**
- `{timestamp}_populate_exported_posts.php` - Laravel migration file
- `posts/markdown/*.md` - Each post as markdown with YAML frontmatter
- `images/` - All post feature images and user avatars
- `README.md` - Installation instructions

**Migration Features:**
- Creates or updates users/authors with avatars
- Generates random secure passwords for new users
- Imports posts in reverse order (newest first, oldest last)
- Creates categories and tags automatically
- Attaches images via Spatie Media Library
- Includes reversible `down()` method
- Comprehensive error handling and logging
- Idempotent: Safe to run multiple times

**Installation (on receiving server):**
```bash
# 1. Copy files
cp {timestamp}_populate_exported_posts.php database/migrations/
cp -r posts database/
cp -r images public/

# 2. Run migration
php artisan migrate

# 3. Rollback (if needed)
php artisan migrate:rollback
```

**Markdown Format Example:**
```markdown
---
export_order: 1
title: "My Post Title"
slug: "my-post-slug"
status: "published"
published_at: "2024-01-15 10:00:00"
user_email: "author@example.com"
categories:
  - "Technology"
  - "Laravel"
tags:
  - "PHP"
  - "Web Development"
post_feature_image: "my-post-slug-123.jpg"
post_feature_image_alt_text: "Image description"
---

# Post content in markdown

Your post body goes here...
```

## Advanced Features

### Scheduled Publishing

Posts can be scheduled to publish automatically at a future date/time:

1. Set post status to "Scheduled"
2. Set the "Scheduled For" date and time
3. The `PostScheduleJob` will automatically publish the post when the time arrives

**Requirements:**
- Queue worker must be running (`php artisan queue:work`)
- Job runs every minute checking for posts to publish
- Status changes from `scheduled` to `published` automatically
- `published_at` timestamp is set when published

### RSS Feed

The package automatically generates an RSS feed of your published posts:

**Feed URL:** `/articles/rss` (or `/{your-route-prefix}/rss`)

**Configuration:** Publish the feed config to customize:
```bash
php artisan vendor:publish --tag="feed-config"
```

Edit `config/feed.php`:
```php
'feeds' => [
    'articles' => [
        'items' => 'Fuelviews\SabHeroArticles\Models\Post@getFeedItems',
        'url' => '/articles/rss',
        'title' => 'My Blog',
        'description' => 'Latest articles from my blog',
        'language' => 'en-US',
        'format' => 'rss', // Also supports 'atom' and 'json'
    ],
],
```

**Feed includes:**
- Title, description, and link for each post
- Author information
- Feature images and enclosures
- Full HTML content or excerpt
- Publication dates
- 50 most recent published posts

### SEO Optimization

Every post and page includes comprehensive SEO metadata:

**Features:**
- Dynamic Open Graph metadata
- Twitter Card support
- Per-post custom titles and descriptions
- Author metadata
- Feature images for social sharing
- Powered by ralphjsmit/laravel-seo

**Customization:**
Posts automatically use:
- Title as page title
- Subtitle or excerpt as description
- Feature image for Open Graph image
- Author information

### Search Autocomplete

Real-time search with Livewire component:

**Usage:**
```blade
<livewire:search-autocomplete />
```

**Features:**
- Searches post titles and subtitles
- Shows results after 2+ characters
- Keyboard navigation (up/down arrows, enter, escape)
- Debounced for performance
- Click outside to close
- Responsive design

### Author System

Full author management with public profiles:

**Admin Features:**
- User resource with author fields (slug, bio, links, is_author)
- Avatar upload with responsive images
- Filter posts by author
- Author-specific permissions

**Frontend Features:**
- Author archive pages at `/articles/authors/{slug}`
- Author profile with avatar, bio, and social links
- List all authors at `/articles/authors`
- Only shows authors with `is_author = true` and published posts
- Avatar fallback to UI Avatars (https://ui-avatars.com)

**User Fields:**
- `slug` - URL-friendly identifier
- `bio` - Author biography (text)
- `links` - Social links (JSON: `{"twitter": "@handle", "github": "username"}`)
- `is_author` - Toggle to show/hide on public author pages

### Advanced Markdown Rendering

The markdown renderer includes powerful extensions:

**Features:**
- **Table of Contents**: Auto-generated with heading links
- **Heading Permalinks**: Click-to-copy links for all headings
- **External Links**: Automatically styled and opened in new tab
- **Task Lists**: `- [ ]` and `- [x]` for checkboxes
- **Footnotes**: Reference-style footnotes with backlinks
- **Description Lists**: Definition lists support
- **Tables**: Full GitHub Flavored Markdown tables
- **Autolinks**: Automatic URL detection and linking
- **Video Embeds**: YouTube, Vimeo auto-embedding
- **Social Embeds**: Twitter, GitHub embeds
- **Image Rendering**: Glide integration for on-the-fly image manipulation

**Usage:**
```blade
<x-sabhero-articles::markdown :content="$post->body" />
```

**Configuration:**
```php
// config/sabhero-articles.php
'heading_permalink' => [
    'html_class' => 'scroll-mt-40', // CSS class for heading links
],
```

## Available Routes

All routes are prefixed with `/articles` by default (configurable in `config/sabhero-articles.php`):

| Route | Description |
|-------|-------------|
| `GET /articles` | Post index (paginated) |
| `GET /articles/page/{page}` | Post pagination |
| `GET /articles/search` | Post search results |
| `GET /articles/{post:slug}` | Single post view |
| `GET /articles/categories` | All categories |
| `GET /articles/categories/{category:slug}` | Posts in category |
| `GET /articles/tags` | All tags |
| `GET /articles/tags/{tag:slug}` | Posts with tag |
| `GET /articles/authors` | All authors |
| `GET /articles/authors/{user:slug}` | Author's posts |
| `GET /articles/rss` | RSS feed |

**Route Features:**
- Slug-based URLs for SEO
- Route model binding with eager loading
- Only published posts shown on frontend
- Scoped bindings (e.g., only published posts)

## Available Components

SAB Hero Articles comes with several Blade components for easy UI implementation:

### Layout & Structure
- `<x-sabhero-articles::layout>` - Main article layout wrapper
- `<x-sabhero-articles::breadcrumb>` - Breadcrumb navigation (uses diglactic/laravel-breadcrumbs)

### Post Display
- `<x-sabhero-articles::card>` - Standard post card for listings
- `<x-sabhero-articles::feature-card>` - Featured post card with larger image
- `<x-sabhero-articles::recent-post>` - Recent posts sidebar widget

### Headers
- `<x-sabhero-articles::header-category>` - Category header with title and description
- `<x-sabhero-articles::header-metro>` - Metro-style header layout

### Content Rendering
- `<x-sabhero-articles::markdown>` - Advanced markdown renderer with:
  - Table of contents generation
  - Heading permalinks
  - External link styling
  - Task lists support
  - Footnotes
  - Video/social embeds (YouTube, Twitter, GitHub)
  - Glide image rendering

### Livewire Components
- `<livewire:search-autocomplete />` - Real-time search with autocomplete

**Example Usage:**
```blade
{{-- Post listing page --}}
<x-sabhero-articles::layout>
    <x-sabhero-articles::breadcrumb :breadcrumbs="$breadcrumbs" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($posts as $post)
            <x-sabhero-articles::card :post="$post" />
        @endforeach
    </div>
</x-sabhero-articles::layout>

{{-- Single post page --}}
<x-sabhero-articles::layout>
    <article>
        <h1>{{ $post->title }}</h1>
        <x-sabhero-articles::markdown :content="$post->body" />
    </article>

    <aside>
        <x-sabhero-articles::recent-post :limit="5" />
    </aside>
</x-sabhero-articles::layout>
```

## Testing

```bash
composer test
```

## Documentation

- **[Import/Export Guide](docs/IMPORT_EXPORT.md)** - Complete guide to CSV and migration import/export features
- **[Configuration](config/sabhero-articles.php)** - All configuration options explained
- **[Changelog](CHANGELOG.md)** - Recent changes and version history
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on recent changes.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for contribution guidelines.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Joshua Mitchener](https://github.com/thejmitchener)
- [Daniel Clark](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
- [Firefly](https://github.com/thefireflytech)
- [Asmit Nepali](https://github.com/AsmitNepali)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
