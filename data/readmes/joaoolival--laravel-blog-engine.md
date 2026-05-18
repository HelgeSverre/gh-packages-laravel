# Laravel Blog Engine

[![Latest Version on Packagist](https://img.shields.io/packagist/v/joaoolival/laravel-blog-engine.svg?style=flat-square)](https://packagist.org/packages/joaoolival/laravel-blog-engine)
[![Total Downloads](https://img.shields.io/packagist/dt/joaoolival/laravel-blog-engine.svg?style=flat-square)](https://packagist.org/packages/joaoolival/laravel-blog-engine)
[![PHP Version](https://img.shields.io/packagist/php-v/joaoolival/laravel-blog-engine.svg?style=flat-square)](https://packagist.org/packages/joaoolival/laravel-blog-engine)
[![License](https://img.shields.io/packagist/l/joaoolival/laravel-blog-engine.svg?style=flat-square)](https://packagist.org/packages/joaoolival/laravel-blog-engine)

A blog engine for Laravel with Filament admin panel integration. Manage posts, authors, and categories with automatic responsive image optimization.

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- Filament 5
- Spatie Laravel Media Library 11

## Installation

```bash
composer require joaoolival/laravel-blog-engine
php artisan blog-engine:install
php artisan storage:link
```

### Configuration

Publish the configuration file to customize resource labels, navigation, and icons:

```bash
php artisan vendor:publish --tag="laravel-blog-engine-config"
```

You can customize the following for Posts, Authors, and Categories in `config/laravel-blog-engine.php`:

- `label` & `plural_label`: Custom names for resources.
- `navigation_label`: Label shown in the sidebar.
- `navigation_group`: Group resources under a specific sidebar group (default: "Blog").
- `navigation_sort`: Order in the navigation.
- `navigation_icon`: Heroicon name (e.g., `heroicon-o-pencil`) for the sidebar icon.

### Authorization

To restrict access to blog resources, simply create Policies for the models (`BlogPost`, `BlogAuthor`, `BlogCategory`). Filament will automatically detect and enforce them.

This allows you to define granular permissions for who can **view**, **create**, **update**, **delete**, and **restore** resources.

```bash
php artisan make:policy BlogPostPolicy --model=\Joaoolival\LaravelBlogEngine\Models\BlogPost
```

Then register them in your application's `AuthServiceProvider` (or `AppServiceProvider` in newer Laravel versions).

For more details, see the [Filament Resource Authorization documentation](https://filamentphp.com/docs/5.x/panels/resources/getting-started#authorization).

## Basic Usage

```php
use Joaoolival\LaravelBlogEngine\Facades\Blog;

$posts = Blog::getPublishedPosts(perPage: 12);
$post = Blog::getPostBySlug('my-post');
$authors = Blog::getAllAuthors();
$categories = Blog::getAllCategories();
```

## Content & Responsive Images

Post content is stored as an HTML string (database `longtext`). When building APIs, use the provided HTTP Resources to automatically render content with responsive images:

```php
use Joaoolival\LaravelBlogEngine\Http\Resources\Posts\BlogPostResource;

return new BlogPostResource($post);
```

The resource transforms the `content` HTML, finding image tags with `data-id` and replacing them with:

- WebP conversion
- `srcset` attributes for responsive loading
- Lazy loading and async decoding

> **Note:** Accessing `$post->content` directly returns the raw HTML with custom attributes. Use `BlogPostResource` for fully rendered HTML with responsive images.

## Facade Methods

| Method                                              | Description                               |
| --------------------------------------------------- | ----------------------------------------- |
| `getPublishedPosts(?int $perPage)`                  | Published posts (paginated or collection) |
| `getPostBySlug(string $slug)`                       | Single post by slug                       |
| `getRecentPosts(int $limit = 5)`                    | Most recent posts (for sidebars)          |
| `getRelatedPosts(BlogPost $post, int $limit = 4)`   | Related posts by category/tags            |
| `searchPosts(string $query, ?int $perPage)`         | Search posts by title/excerpt/content     |
| `getAllAuthors()`                                   | All visible authors                       |
| `getAuthorWithPosts(string $slug, ?int $perPage)`   | Author with their posts                   |
| `getAllCategories()`                                | All visible categories                    |
| `getCategoryWithPosts(string $slug, ?int $perPage)` | Category with its posts                   |

## Models

### BlogPost

| Attribute      | Type             | Description             |
| -------------- | ---------------- | ----------------------- |
| `title`        | `string`         | Post title              |
| `slug`         | `string`         | URL-friendly identifier |
| `excerpt`      | `string \| null` | Short summary           |
| `content`      | `string \| null` | HTML content (longtext) |
| `tags`         | `array \| null`  | Post tags               |
| `is_visible`   | `bool`           | Visibility flag         |
| `published_at` | `Carbon \| null` | Publish date            |

**Scopes:**

```php
BlogPost::whereIsPublished()->get();
BlogPost::whereIsDraft()->get();
BlogPost::whereIsVisible()->get();
```

### BlogAuthor

| Attribute                                | Type           |
| ---------------------------------------- | -------------- |
| `name`, `slug`, `email`                  | `string`       |
| `bio`, `github_handle`, `twitter_handle` | `string\|null` |

### BlogCategory

| Attribute                                     | Type           |
| --------------------------------------------- | -------------- |
| `name`, `slug`                                | `string`       |
| `description`, `seo_title`, `seo_description` | `string\|null` |
| `is_visible`                                  | `bool`         |

## Admin Panel

Access the Filament admin at `/admin`:

- `/admin/blog-posts`
- `/admin/blog-authors`
- `/admin/blog-categories`

## Responsive Images

This package uses [Spatie Media Library](https://spatie.be/docs/laravel-medialibrary) for image handling. Images are automatically converted to WebP with responsive variants.

For background processing, install Laravel Horizon:

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
```

## Generating Demo Content

Quickly populate your blog with dummy content using the `blog:generate` command:

```bash
php artisan blog:generate
```

This will prompt for the number of authors, categories, and posts to create (defaults: 1, 1, 12).

You can also pass options directly:

```bash
php artisan blog:generate --authors=3 --categories=5 --posts=50
```

## Testing

```bash
composer test
```

## Credits

- [João Olival](https://github.com/joaoolival)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/joaoolival/laravel-blog-engine/issues) on GitHub.

## License

MIT. See [LICENSE.md](LICENSE.md).
