# Laravel Social Shareable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/escuelait/laravel-social-shareable.svg?style=flat-square)](https://packagist.org/packages/escuelait/laravel-social-shareable)
[![Total Downloads](https://img.shields.io/packagist/dt/escuelait/laravel-social-shareable.svg?style=flat-square)](https://packagist.org/packages/escuelait/laravel-social-shareable)
[![License](https://img.shields.io/packagist/l/escuelait/laravel-social-shareable.svg?style=flat-square)](LICENSE.md)

A Laravel package that makes it easy to generate sharing URLs for popular social networks. Share your content on X (Twitter), Facebook, WhatsApp, LinkedIn, Pinterest, Telegram, Email, Reddit, Bluesky, and Mastodon with just a few lines of code.

## Features

- 🚀 Generate sharing URLs for **10+ social networks**
- 📱 Support for X, Facebook, WhatsApp, LinkedIn, Pinterest, Telegram, Email, Reddit, Bluesky, and Mastodon
- 🎯 Simple and fluent API
- 🔧 Easy to integrate with your models
- ⚙️ Configurable (Facebook App ID support)
- ✅ Fully tested
- 🐘 PHP 8.1+ compatible
- 🎗️ Laravel 10, 11, and 12 support

## Installation

You can install the package via Composer:

```bash
composer require escuelait/laravel-social-shareable
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Escuelait\SocialShareable\SocialShareableServiceProvider"
```

Or, if you only want to publish the configuration file:

```bash
php artisan vendor:publish --tag=social-shareable-config
```

Update your `.env` file with optional Facebook App ID:

```env
FACEBOOK_APP_ID=your_facebook_app_id_here
```

## Usage

### Using the Trait

Add the `SocialShareable` trait to your model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Escuelait\SocialShareable\SocialShareable;

class Post extends Model
{
    use SocialShareable;

    public $title = 'Check out this amazing post!';
    public $url = 'https://example.com/posts/1';
}
```

### Generating Share URLs

Generate share URLs for any social network:

```php
$post = Post::first();

// Generate share URL for X (Twitter)
$xUrl = $post->getShareUrl('x');

// Generate share URL for Facebook
$facebookUrl = $post->getShareUrl('facebook');

// Generate share URL for WhatsApp
$whatsappUrl = $post->getShareUrl('whatsapp');

// And more...
$linkedinUrl = $post->getShareUrl('linkedin');
$pinterestUrl = $post->getShareUrl('pinterest');
$telegramUrl = $post->getShareUrl('telegram');
$redditUrl = $post->getShareUrl('reddit');
$blueskyUrl = $post->getShareUrl('bluesky');
$mastodonUrl = $post->getShareUrl('mastodon');
$emailUrl = $post->getShareUrl('email');
```

### Custom Parameters

Pass custom parameters to override defaults:

```php
$post = Post::first();

// Custom text for X with hashtags
$xUrl = $post->getShareUrl('x', [
    'text' => 'Custom message with #hashtags',
]);

// Custom URL for Facebook
$facebookUrl = $post->getShareUrl('facebook', [
    'u' => 'https://custom-url.com',
]);

// Custom quote for LinkedIn
$linkedinUrl = $post->getShareUrl('linkedin', [
    'title' => 'Custom title for LinkedIn',
]);
```

### Resolving Title and URL

The trait looks for `$title` and `$url` properties on your model. You can customize this by overriding the resolution methods:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Escuelait\SocialShareable\SocialShareable;

class Article extends Model
{
    use SocialShareable;

    protected function resolveShareUrl(): string
    {
        return route('articles.show', $this->slug);
    }

    protected function resolveShareTitle(): string
    {
        return $this->headline ?? $this->title;
    }
}
```

## Supported Social Networks

The package supports the following social networks:

| Network | Method | Description |
|---------|--------|-------------|
| X (Twitter) | `x` | Share on X with custom text (max 120 chars) |
| Facebook | `facebook` | Share on Facebook with quote and optional App ID |
| WhatsApp | `whatsapp` | Share via WhatsApp with title and URL |
| LinkedIn | `linkedin` | Share on LinkedIn with title |
| Pinterest | `pinterest` | Share on Pinterest with description |
| Telegram | `telegram` | Share via Telegram with text |
| Email | `email` | Share via email with subject and body |
| Reddit | `reddit` | Share on Reddit with title |
| Bluesky | `bluesky` | Share on Bluesky with text |
| Mastodon | `mastodon` | Share on Mastodon with text |

## Using the Generator Directly

You can also use the `SocialShareableGenerator` class directly without a model:

```php
use Escuelait\SocialShareable\SocialShareableGenerator;

$generator = SocialShareableGenerator::for(
    'https://example.com',
    'Check this out!'
);

$xUrl = $generator->x();
$facebookUrl = $generator->facebook();
$whatsappUrl = $generator->whatsapp();
```

## View Components (Optional)

You can create Blade components to generate share buttons:

```blade
<!-- resources/views/components/share-buttons.blade.php -->
<div class="share-buttons">
    <a href="{{ $post->getShareUrl('x') }}" target="_blank" rel="noopener noreferrer">
        Share on X
    </a>
    <a href="{{ $post->getShareUrl('facebook') }}" target="_blank" rel="noopener noreferrer">
        Share on Facebook
    </a>
    <a href="{{ $post->getShareUrl('whatsapp') }}" target="_blank" rel="noopener noreferrer">
        Share on WhatsApp
    </a>
    <a href="{{ $post->getShareUrl('linkedin') }}" target="_blank" rel="noopener noreferrer">
        Share on LinkedIn
    </a>
</div>
```

## Testing

Run the test suite:

```bash
composer test
```

## Requirements

- PHP 8.1 or higher
- Laravel 9, 10, 11, or 12
- illuminate/support package

## Changelog

See the [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).

## Author

**Miguel Angel Alvarez**
- Email: miguel@escuela.it
- Website: [escuela.it](https://escuela.it)

## Credits

Created by [EscuelaIT](https://github.com/EscuelaIt)
