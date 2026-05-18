# Laravel Reactions

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ritechoice23/laravel-reactions.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-reactions)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-reactions/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/ritechoice23/laravel-reactions/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-reactions/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/ritechoice23/laravel-reactions/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/ritechoice23/laravel-reactions.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-reactions)

A simple, flexible Laravel package for adding polymorphic reactions to any Eloquent model. React with any text - like, love, care, celebrate, or even custom emojis 🔥💯. Unlimited flexibility with full polymorphic relationship support.

## Table of Contents

-   [Why This Package?](#why-this-package)
-   [Features](#features)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [Setup Models](#setup-models)
    -   [Basic Operations](#basic-operations)
    -   [Working with Reactions on Models](#working-with-reactions-on-models)
    -   [Query Scopes](#query-scopes)
    -   [Advanced Queries](#advanced-queries)
    -   [Filtering Reactions](#filtering-reactions)
    -   [Polymorphic Reactions](#polymorphic-reactions)
    -   [Custom Reaction Types](#custom-reaction-types)
-   [Practical Examples](#practical-examples)
    -   [Social Media Feed](#social-media-feed)
    -   [Trending Content Dashboard](#trending-content-dashboard)
    -   [User Profile Reactions](#user-profile-reactions)
    -   [Reaction Analytics](#reaction-analytics)
-   [Important Notes](#important-notes)
    -   [Update or Create Behavior](#update-or-create-behavior)
    -   [Unique Constraint](#unique-constraint)
    -   [Performance Considerations](#performance-considerations)
    -   [Database Indexes](#database-indexes)
    -   [Reaction Validation](#reaction-validation)
-   [API Reference](#api-reference)
    -   [CanReact Trait Methods](#canreact-trait-methods)
    -   [CanReact Trait Scopes](#canreact-trait-scopes)
    -   [HasReactions Trait Methods](#hasreactions-trait-methods)
    -   [HasReactions Trait Scopes](#hasreactions-trait-scopes)
    -   [Reaction Model Scopes](#reaction-model-scopes)
-   [Testing](#testing)
-   [Changelog](#changelog)
-   [Contributing](#contributing)
-   [Security Vulnerabilities](#security-vulnerabilities)
-   [Credits](#credits)
-   [License](#license)

## Why This Package?

### The Simplest Yet Most Flexible Reaction System

While there are several reaction packages available for Laravel, this package offers the perfect balance of **simplicity** and **flexibility** - designed for developers who want powerful features without unnecessary complexity.

### Popular Alternatives

-   [cybercog/laravel-love](https://github.com/cybercog/laravel-love) - Feature-rich but complex (weighted reactions, reputation systems)
-   [thedevdojo/laravel-reactions](https://github.com/thedevdojo/laravel-reactions) - Limited to predefined emoji sets
-   [qirolab/laravel-reactions](https://github.com/qirolab/laravel-reactions) - Good but less flexible reaction types

### What Makes This Package Unique

✅ **Unlimited Flexibility** - React with ANY text, not limited to predefined emoji sets like Facebook/Discord  
✅ **Update-or-Create Logic** - Automatically updates existing reactions (no duplicate prevention code needed)  
✅ **Comprehensive Analytics** - Built-in `reactionsBreakdown()` method for instant statistics  
✅ **Trending Scopes** - `mostReacted()` scope for viral content discovery out of the box  
✅ **User-Specific Status** - `withReactionStatus()` scope prevents N+1 queries in feeds  
✅ **Developer-First API** - Intuitive method naming: `react()`, `unreact()`, `hasReactedTo()`, `reactionTo()`  
✅ **Zero Configuration** - Works immediately with sensible defaults, configure only when needed  
✅ **Performance Optimized** - Efficient database queries with proper indexing and eager loading support

### Key Differentiator

> **"React with anything, anywhere, anytime."**  
> Use emojis 🔥, text reactions, or custom strings - no predefined limitations. The package adapts to your needs, not the other way around.

**This package** is intentionally simpler, more flexible, and easier to integrate - perfect for **80% of use cases without the overhead**. You get:

-   Drop-in installation (2 minutes)
-   Intuitive API that feels native to Laravel
-   Full polymorphic support for any model combination
-   Production-ready with comprehensive test coverage

### Perfect For

-   Social media platforms and feeds
-   Content management systems
-   Community forums and discussion boards
-   E-learning platforms with interactive content
-   Any application needing flexible user engagement

## Features

-   **Fully Polymorphic**: Any model can react to any other model (User → Post, User → Comment, Team → Article, etc.)
-   **Flexible Reaction Types**: Use any text as reaction type - "like", "love", "celebrate", "🔥", "💯", or anything you want
-   **Simple API**: Intuitive methods like `react()`, `unreact()`, `hasReactedTo()`, `reactionTo()`
-   **Rich Analytics**: Get reaction counts, breakdowns by type, and most popular reactions
-   **Expressive Scopes**: Chainable query scopes like `reactedTo()`, `reactedWith()`, `mostReacted()`
-   **Update or Create**: Changing a reaction automatically updates the existing one (no duplicates)
-   **Zero Configuration**: Works out of the box with sensible defaults
-   **Full Test Coverage**: Comprehensive Pest PHP test suite included

## Installation

Install the package via composer:

```bash
composer require ritechoice23/laravel-reactions
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-reactions-migrations"
php artisan migrate
```

Optionally, publish the config file:

```bash
php artisan vendor:publish --tag="laravel-reactions-config"
```

## Configuration

The published config file (`config/reactions.php`) includes:

```php
return [
    'table_name' => 'reactions',
    'default_reaction_type' => 'like',
];
```

## Usage

### Setup Models

Add traits to your models:

```php
use Illuminate\Database\Eloquent\Model;
use Ritechoice23\Reactions\Traits\CanReact;
use Ritechoice23\Reactions\Traits\HasReactions;

class User extends Model
{
    use CanReact;      // Can react to other models
}

class Post extends Model
{
    use HasReactions;   // Can receive reactions
}

class Comment extends Model
{
    use CanReact;      // Can react to posts
    use HasReactions;   // Can also receive reactions
}
```

### Basic Operations

```php
// React to a model with default type (like)
$user->react($post);

// React with a specific type
$user->react($post, 'love');
$user->react($comment, 'celebrate');
$user->react($article, '🔥');

// Change reaction (automatically updates)
$user->react($post, 'like');
$user->react($post, 'love');  // Changes from 'like' to 'love'

// Remove reaction
$user->unreact($post);

// Check if user has reacted
if ($user->hasReactedTo($post)) {
    // User has reacted to the post
}

// Get the reaction type
$reactionType = $user->reactionTo($post);  // Returns 'love' or null
```

### Working with Reactions on Models

#### Get Reaction Statistics

```php
// Get total reaction count
$count = $post->reactionsCount();

// Get reaction breakdown by type
$breakdown = $post->reactionsBreakdown();
// Returns: ['like' => 45, 'love' => 32, 'celebrate' => 18, '🔥' => 12]

// Check if a specific user has reacted
if ($post->isReactedBy($user)) {
    // This user has reacted to the post
}

// Get a specific user's reaction
$reaction = $post->reactionBy($user);  // Returns Reaction model or null
if ($reaction) {
    echo $reaction->reaction_type;  // 'love'
    echo $reaction->created_at;     // When they reacted
}

// Remove a specific user's reaction
$post->removeReaction($user);
```

#### Accessing Reaction Relationships

```php
// Get all reactions for a post
$reactions = $post->reactions;  // Collection of Reaction models

// Get all reactions given by a user
$reactionsGiven = $user->reactionsGiven;  // Collection of Reaction models

// Eager load relationships
$posts = Post::with('reactions')->get();

// Access reactor and reactable
foreach ($post->reactions as $reaction) {
    $reactor = $reaction->reactor;        // The User who reacted
    $reactable = $reaction->reactable;    // The Post that was reacted to
    $type = $reaction->reaction_type;     // The reaction type
}
```

### Query Scopes

Find models based on reaction relationships:

```php
// Find all users who reacted to a post
$users = User::reactedTo($post)->get();

// Find all users who reacted with a specific type
$loveUsers = User::reactedWith($post, 'love')->get();

// Chain with other queries
$activeUsers = User::reactedTo($post)
    ->where('status', 'active')
    ->orderBy('created_at', 'desc')
    ->get();
```

### Advanced Queries

#### Eager Loading Reaction Counts

```php
// Load posts with reaction counts
$posts = Post::withReactionsCount()->get();

foreach ($posts as $post) {
    echo $post->reactions_count;
}
```

#### Get Most Reacted Posts

```php
// Get top 10 most reacted posts
$topPosts = Post::mostReacted(10)->get();

// Custom limit
$topPosts = Post::mostReacted(5)->get();

// Combine with other queries
$topRecentPosts = Post::mostReacted(10)
    ->where('created_at', '>', now()->subWeek())
    ->get();
```

#### Check Reaction Status for Current User

```php
// Add reaction status for a specific user to query results
$posts = Post::withReactionStatus($currentUser)->get();

foreach ($posts as $post) {
    // Check if current user has reacted
    if ($post->has_reacted) {
        echo "You reacted with: " . $post->reactor_reaction_type;
    } else {
        echo "You haven't reacted yet";
    }
}
```

### Filtering Reactions

The `Reaction` model includes useful scopes:

```php
use Ritechoice23\Reactions\Models\Reaction;

// Get all reactions by type
$loveReactions = Reaction::byType('love')->get();

// Get all reactions by a specific reactor
$userReactions = Reaction::byReactor($user)->get();

// Get all reactions to a specific model
$postReactions = Reaction::byReactable($post)->get();

// Combine filters
$userLoveReactions = Reaction::byReactor($user)
    ->byType('love')
    ->get();
```

### Polymorphic Reactions

React to any model type:

```php
// Users reacting to posts
$user->react($post, 'love');

// Users reacting to comments
$user->react($comment, 'like');

// Teams reacting to articles (if Team uses CanReact)
$team->react($article, 'celebrate');

// Comments reacting to posts (nested reactions)
$comment->react($post, '🔥');
```

### Custom Reaction Types

Use any text as a reaction type:

```php
// Standard reactions
$user->react($post, 'like');
$user->react($post, 'love');
$user->react($post, 'care');
$user->react($post, 'wow');
$user->react($post, 'sad');
$user->react($post, 'angry');

// Custom text
$user->react($post, 'inspired');
$user->react($post, 'mindblown');
$user->react($post, 'thankful');

// Emojis
$user->react($post, '🔥');
$user->react($post, '💯');
$user->react($post, '❤️');
$user->react($post, '😂');
$user->react($post, '🎉');

// The sky's the limit!
$user->react($post, 'chef-kiss');
$user->react($post, 'big-brain');
```

## Practical Examples

### Social Media Feed

```php
// Display post with reactions
class PostController extends Controller
{
    public function show(Post $post)
    {
        $post->load('reactions');

        $breakdown = $post->reactionsBreakdown();
        $totalReactions = $post->reactionsCount();
        $userReaction = $post->reactionBy(auth()->user());

        return view('posts.show', compact('post', 'breakdown', 'totalReactions', 'userReaction'));
    }

    public function react(Post $post, Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:50'
        ]);

        auth()->user()->react($post, $request->type);

        return back()->with('success', 'Reacted!');
    }

    public function unreact(Post $post)
    {
        auth()->user()->unreact($post);

        return back()->with('success', 'Reaction removed!');
    }
}
```

### Trending Content Dashboard

```php
// Get trending posts
public function trending()
{
    // Posts with most reactions in the last 24 hours
    $trendingPosts = Post::mostReacted(10)
        ->where('created_at', '>', now()->subDay())
        ->with(['reactions' => function($query) {
            $query->select('reactable_id', 'reaction_type')
                  ->selectRaw('count(*) as count')
                  ->groupBy('reactable_id', 'reaction_type');
        }])
        ->get();

    return view('trending', compact('trendingPosts'));
}
```

### User Profile Reactions

```php
// Show all posts a user has reacted to
public function userReactions(User $user)
{
    $reactedPosts = Post::whereHas('reactions', function($query) use ($user) {
        $query->byReactor($user);
    })
    ->with(['reactions' => function($query) use ($user) {
        $query->byReactor($user);
    }])
    ->paginate(20);

    return view('profile.reactions', compact('user', 'reactedPosts'));
}
```

### Reaction Analytics

```php
// Get analytics for a post
public function analytics(Post $post)
{
    $breakdown = $post->reactionsBreakdown();
    $totalReactions = $post->reactionsCount();

    // Get reactions over time
    $reactionsTimeline = $post->reactions()
        ->selectRaw('DATE(created_at) as date, reaction_type, count(*) as count')
        ->groupBy('date', 'reaction_type')
        ->orderBy('date')
        ->get()
        ->groupBy('date');

    // Get top reactors
    $topReactors = Reaction::byReactable($post)
        ->with('reactor')
        ->get()
        ->groupBy('reactor_id')
        ->map(fn($reactions) => [
            'reactor' => $reactions->first()->reactor,
            'count' => $reactions->count()
        ])
        ->sortByDesc('count')
        ->take(10);

    return view('analytics', compact('post', 'breakdown', 'totalReactions', 'reactionsTimeline', 'topReactors'));
}
```

## Important Notes

### Update or Create Behavior

When a model reacts to the same model again with a different type, the package automatically updates the existing reaction instead of creating a duplicate:

```php
$user->react($post, 'like');
// Database: 1 reaction of type 'like'

$user->react($post, 'love');
// Database: Still 1 reaction, now type 'love' (updated, not duplicated)
```

### Unique Constraint

The migration includes a unique constraint to prevent duplicates at the database level:

```php
$table->unique(['reactor_type', 'reactor_id', 'reactable_type', 'reactable_id'], 'unique_reaction');
```

This ensures one reactor can only have one reaction per reactable model at any time.

### Performance Considerations

The package uses optimized database queries:

-   **Indexed columns**: All foreign keys and reaction types are indexed
-   **Eager loading support**: Use `with()` and `withCount()` to avoid N+1 queries
-   **Efficient scopes**: Query scopes use optimized joins and subqueries
-   **Unique constraints**: Prevents duplicate data at the database level

```php
// ✅ Good - Efficient
$posts = Post::with('reactions')
    ->withReactionsCount()
    ->mostReacted(10)
    ->get();

// ❌ Bad - N+1 queries
$posts = Post::all();
foreach ($posts as $post) {
    $count = $post->reactions()->count();  // N+1 query
}
```

### Database Indexes

The migration includes optimized indexes for performance:

-   Unique composite index on reactor and reactable (prevents duplicates)
-   Index on reactable_type and reactable_id (for lookups)
-   Index on reactor_type and reactor_id (for reverse lookups)
-   Index on reaction_type (for filtering by type)

### Reaction Validation

Validate reaction types in your controller:

```php
public function react(Post $post, Request $request)
{
    $request->validate([
        'type' => 'required|in:like,love,celebrate,wow,sad,angry'
    ]);

    auth()->user()->react($post, $request->type);

    return response()->json(['success' => true]);
}
```

## API Reference

### CanReact Trait Methods

| Method             | Parameters                           | Return      | Description                           |
| ------------------ | ------------------------------------ | ----------- | ------------------------------------- |
| `react()`          | `Model $model, ?string $type = null` | `Reaction`  | React to a model (creates or updates) |
| `unreact()`        | `Model $model`                       | `bool`      | Remove reaction from a model          |
| `hasReactedTo()`   | `Model $model`                       | `bool`      | Check if has reacted to a model       |
| `reactionTo()`     | `Model $model`                       | `?string`   | Get reaction type to a model          |
| `reactionsGiven()` | -                                    | `MorphMany` | Relationship: all reactions given     |

### CanReact Trait Scopes

| Scope           | Parameters                   | Description                              |
| --------------- | ---------------------------- | ---------------------------------------- |
| `reactedTo()`   | `Model $model`               | Models that reacted to a specific model  |
| `reactedWith()` | `Model $model, string $type` | Models that reacted with a specific type |

### HasReactions Trait Methods

| Method                 | Parameters       | Return      | Description                          |
| ---------------------- | ---------------- | ----------- | ------------------------------------ |
| `reactions()`          | -                | `MorphMany` | Relationship: all reactions received |
| `reactionsCount()`     | -                | `int`       | Total number of reactions            |
| `reactionsBreakdown()` | -                | `array`     | Reaction count by type               |
| `isReactedBy()`        | `Model $reactor` | `bool`      | Check if reacted by a specific model |
| `reactionBy()`         | `Model $reactor` | `?Reaction` | Get reaction by a specific model     |
| `removeReaction()`     | `Model $reactor` | `bool`      | Remove a specific model's reaction   |

### HasReactions Trait Scopes

| Scope                  | Parameters        | Description                                |
| ---------------------- | ----------------- | ------------------------------------------ |
| `withReactionsCount()` | -                 | Eager load reaction count                  |
| `mostReacted()`        | `int $limit = 10` | Order by most reacted                      |
| `withReactionStatus()` | `Model $reactor`  | Add reaction status for a specific reactor |

### Reaction Model Scopes

| Scope           | Parameters         | Description                   |
| --------------- | ------------------ | ----------------------------- |
| `byType()`      | `string $type`     | Filter reactions by type      |
| `byReactor()`   | `Model $reactor`   | Filter reactions by reactor   |
| `byReactable()` | `Model $reactable` | Filter reactions by reactable |

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Run static analysis:

```bash
composer analyse
```

Run code formatting:

```bash
composer format
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Daramola Babatunde Ebenezer](https://github.com/ritechoice23)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
