# Laravel User Tags

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mujahidabbas/laravel-user-tags.svg?style=flat-square)](https://packagist.org/packages/mujahidabbas/laravel-user-tags)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/mujahidabbas/laravel-user-tags/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mujahidabbas/laravel-user-tags/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/mujahidabbas/laravel-user-tags.svg?style=flat-square)](https://packagist.org/packages/mujahidabbas/laravel-user-tags)
[![License](https://img.shields.io/packagist/l/mujahidabbas/laravel-user-tags?style=flat-square)](LICENSE.md)

User-scoped tagging for Laravel Eloquent models. Each user has their own private set of tags that are invisible to and independent from other users' tags.

```php
// User A tags an article
$article->attachUserTag('important'); // Creates User A's "important" tag

// User B tags the same article
Auth::login($userB);
$article->attachUserTag('important'); // Creates User B's separate "important" tag

// Query User A's tagged articles (only sees their own tags)
Auth::login($userA);
$articles = Article::withAnyUserTags(['important'])->get();
```

## Why This Package?

If you've used [spatie/laravel-tags](https://github.com/spatie/laravel-tags) and wondered how to give each user their own private tag namespace, this package is for you.

**The problem:** Global tagging packages share tags across all users. User A's "important" tag is the same as User B's "important" tag.

**The solution:** This package isolates tags per user. Each user has their own private set of tags that are completely invisible to and independent from other users' tags.

**Use cases:**
- Personal CRM systems where users organize their own contacts
- Bookmark managers with private collections
- Note-taking apps with personal organization
- Any multi-user app where users need private categorization

## Requirements

- PHP 8.1, 8.2, or 8.3
- Laravel 10.x, 11.x, or 12.x

## Installation

You can install the package via composer:

```bash
composer require mujahidabbas/laravel-user-tags
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="user-tags-migrations"
php artisan migrate
```

Optionally, you can publish the config file:

```bash
php artisan vendor:publish --tag="user-tags-config"
```

## Configuration

The published config file (`config/user-tags.php`) contains:

```php
return [
    // Your User model class
    'user_model' => 'App\\Models\\User',

    // Table names (customize if needed)
    'tables' => [
        'tags' => 'user_tags',
        'taggables' => 'user_taggables',
    ],
];
```

## Usage

### Preparing Your Model

Add the `HasUserTags` trait to any Eloquent model you want to tag:

```php
use Illuminate\Database\Eloquent\Model;
use MujahidAbbas\LaravelUserTags\Traits\HasUserTags;

class Article extends Model
{
    use HasUserTags;
}
```

### Attaching Tags

Use `attachUserTag()` to add tags to a model. Tags are automatically created if they don't exist:

```php
// Attach a single tag (uses authenticated user)
$article->attachUserTag('important');

// Attach multiple tags at once
$article->attachUserTag(['important', 'read-later', 'favorites']);

// Attach with a specific user (useful in queues, commands, etc.)
$article->attachUserTag('important', $user);
```

Tags are user-scoped, so User A's "important" tag is completely separate from User B's "important" tag.

### Detaching Tags

Use `detachUserTag()` to remove tags from a model. Non-existent tags are silently ignored:

```php
// Detach a single tag
$article->detachUserTag('important');

// Detach multiple tags
$article->detachUserTag(['important', 'read-later']);

// Detach with a specific user
$article->detachUserTag('important', $user);
```

Note: This only removes the association; the tag itself is not deleted.

### Syncing Tags

Use `syncUserTags()` to replace all of a user's tags on a model with a new set:

```php
// Replace all current user's tags with exactly these
$article->syncUserTags(['priority', 'work']);

// Sync with a specific user
$article->syncUserTags(['priority', 'work'], $user);
```

**Important:** `syncUserTags()` only affects the specified user's tags. Other users' tags on the same model remain untouched.

### Accessing Tags

The `userTags()` relationship returns all tags attached to a model (from all users):

```php
// Get all tags on this model
$tags = $article->userTags;

// Eager load tags
$articles = Article::with('userTags')->get();

// Filter to a specific user's tags
$myTags = $article->userTags->where('user_id', auth()->id());
```

### Querying by Tags

Query models that have specific tags using scope methods:

```php
// Get posts with ANY of these tags (OR logic)
$posts = Post::withAnyUserTags(['important', 'urgent'])->get();

// Get posts with ALL of these tags (AND logic)
$posts = Post::withAllUserTags(['priority', 'review'])->get();

// Get posts WITHOUT specific tags
$posts = Post::withoutUserTags(['archived', 'spam'])->get();

// Chain scopes
$posts = Post::withAnyUserTags(['tech', 'science'])
    ->withoutUserTags(['archived'])
    ->get();

// With a specific user (useful in queues, commands)
$posts = Post::withAnyUserTags(['important'], $user)->get();
```

**Note:** Query scopes respect user isolation - User A's scope queries only consider User A's tags.

### Using a Custom User

All tag methods accept an optional user parameter. This is useful when the authenticated user is not available:

```php
// In a queue job
public function handle()
{
    $user = User::find($this->userId);
    $article->attachUserTag('processed', $user);
}

// In a console command
$user = User::find($userId);
$article->syncUserTags(['archived'], $user);
```

If no user is authenticated and none is passed, a `NoAuthenticatedUserException` is thrown:

```php
use MujahidAbbas\LaravelUserTags\Exceptions\NoAuthenticatedUserException;

try {
    $article->attachUserTag('important');
} catch (NoAuthenticatedUserException $e) {
    // Handle missing user
}
```

## Important: MorphMap Configuration

This package uses polymorphic relationships to attach tags to any model. By default, Laravel stores the full class name (e.g., `App\Models\Article`) in the database.

**Why MorphMap matters:**

- If you rename or move a model class, existing tag associations break
- Full class names are verbose and expose your application structure
- Consistent short names make database queries cleaner

**Recommended: Configure MorphMap in your AppServiceProvider:**

```php
use Illuminate\Database\Eloquent\Relations\Relation;

public function boot(): void
{
    Relation::enforceMorphMap([
        'article' => \App\Models\Article::class,
        'post' => \App\Models\Post::class,
        'comment' => \App\Models\Comment::class,
        // Add all models that use HasUserTags
    ]);
}
```

This ensures stable, clean identifiers in your `user_taggables` table instead of full class paths.

## Alternatives

If you need **global tags** (shared across all users), use [spatie/laravel-tags](https://github.com/spatie/laravel-tags) instead. It's excellent for content categorization, blog post tags, and similar use cases where tags are public.

This package is designed to **complement** spatie/laravel-tags, not replace it. You can use both in the same application:
- `spatie/laravel-tags` for public/global tags (e.g., blog categories)
- `mujahidabbas/laravel-user-tags` for private/user-scoped tags (e.g., personal bookmarks)

## Testing

```bash
composer test
```

## Static Analysis

```bash
composer analyse
```

## Code Style

```bash
composer format
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Roadmap

Future releases may include:
- Tag management utilities (`Tag::forUser()`, tag search/autocomplete)
- Events (`UserTagAttached`, `UserTagDetached`, `UserTagCreated`)
- Tag metadata (colors, icons via JSON column)
- Tag usage statistics

See the [GitHub issues](https://github.com/mujahidabbas/laravel-user-tags/issues) for feature requests and discussions.

## Credits

- [Mujahid Abbas](https://github.com/MujahidAbbas)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
