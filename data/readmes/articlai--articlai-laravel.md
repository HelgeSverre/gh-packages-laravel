# ArticlAI Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/articlai/articlai-laravel.svg?style=flat-square)](https://packagist.org/packages/articlai/articlai-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/articlai/articlai-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/articlai/articlai-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/articlai/articlai-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/articlai/articlai-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/articlai/articlai-laravel.svg?style=flat-square)](https://packagist.org/packages/articlai/articlai-laravel)

A Laravel package that enables seamless integration with ArticlAI's Custom API connection type. This package provides secure API endpoints that allow ArticlAI to create, update, and delete blog posts in your Laravel application.

## Installation

You can install the package via composer:

```bash
composer require articlai/articlai-laravel
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="articlai-laravel-migrations"
php artisan vendor:publish --tag="medialibrary-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="articlai-laravel-config"
```

## Configuration

After publishing the config file, update your `.env` file with your ArticlAI settings:

```env
# Authentication Method (api_key, bearer_token, or basic_auth)
ARTICLAI_AUTH_METHOD=api_key
ARTICLAI_API_KEY=your-secret-api-key
```

## API Endpoints

The package provides the following endpoints for ArticlAI integration:

### Validation Endpoint
```
GET /api/articlai/validate
```
Returns platform information and validates the connection.

### Content Management
```
POST /api/articlai/posts          # Create a new post
GET /api/articlai/posts/{id}      # Get a specific post
PUT /api/articlai/posts/{id}      # Update a post
DELETE /api/articlai/posts/{id}   # Delete a post
```

### Banner Images

The package supports banner images through Spatie Media Library integration. When creating or updating posts, you can include banner image URLs:

```json
{
  "title": "Blog Post Title",
  "content": "<p>Post content</p>",
  "banner_image": "https://example.com/image.jpg",
  "banner_original": "https://example.com/original.jpg"
}
```

The package will automatically download and store the images, creating multiple conversions:
- **thumbnail**: 150x150px (cropped)
- **medium**: 300x300px (cropped)
- **large**: 800x600px (cropped)
- **original**: Original image

## Usage

### Using the Service Class

```php
use Articlai\Articlai\Articlai;

$articlai = app(Articlai::class);

// Create a post with banner image
$post = $articlai->createPost([
    'title' => 'My Blog Post',
    'content' => '<p>This is the content</p>',
    'excerpt' => 'Post excerpt',
    'status' => 'published',
    'banner_image' => 'https://example.com/banner.jpg'
]);

// Update a post
$updatedPost = $articlai->updatePost($post->id, [
    'title' => 'Updated Title'
]);

// Get posts
$posts = $articlai->getPosts(['status' => 'published']);
```

### Using the Facade

```php
use Articlai\Articlai\Facades\Articlai;

$post = Articlai::createPost([
    'title' => 'My Blog Post',
    'content' => '<p>This is the content</p>'
]);
```

### Using the Model Directly

```php
use Articlai\Articlai\Models\ArticlaiPost;

$post = ArticlaiPost::create([
    'title' => 'My Blog Post',
    'content' => '<p>This is the content</p>',
    'status' => 'published'
]);

// Get published posts
$publishedPosts = ArticlaiPost::published()->get();

// Access banner images
$post = ArticlaiPost::find(1);
echo $post->banner_image;      // Large version URL
echo $post->banner_thumbnail;  // Thumbnail URL
echo $post->banner_medium;     // Medium URL
echo $post->banner_large;      // Large URL
echo $post->banner_original;   // Original URL
```

## Command Line Interface

Check the package status and view recent posts:

```bash
php artisan articlai:status --posts=10
```

## Testing

```bash
composer test
```

## Credits

- [ArticlAI](https://github.com/articlai)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
