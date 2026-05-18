# Laravel Followable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ritechoice23/laravel-followable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-followable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-followable/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/ritechoice23/laravel-followable/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-followable/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/ritechoice23/laravel-followable/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/ritechoice23/laravel-followable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-followable)

**The only fully polymorphic follow package that handles mixed follower types elegantly with metadata support.**

A modern Laravel package that adds follow/unfollow functionality to Eloquent models with true bidirectional polymorphism. Any model can follow any other model, with intelligent handling of mixed-type relationships and optimized queries.

## Why This Package?

While other popular packages like [overtrue/laravel-follow](https://github.com/overtrue/laravel-follow) and [rennokki/laravel-eloquent-interactions](https://github.com/rennokki/laravel-eloquent-interactions) offer basic follow functionality, they often force you to hardcode the User model or require complex workarounds for heterogeneous relationships.

**Laravel Followable** was built to solve real-world challenges in complex applications where:

-   Organizations follow other organizations
-   Teams follow users and other teams
-   Mixed-type followers need to be handled elegantly (Users + Teams + Organization following the same post)
-   You need metadata for analytics (tracking follow sources, campaigns, referrers)
-   Mutual relationships and bidirectional queries are essential
-   Performance matters (optimized queries, no N+1 problems)

### What Makes It Unique

✅ **True Bidirectional Polymorphism** - Both follower AND followable can be ANY model type (User→Team, Team→Team, Organization→User, etc.)

✅ **Intelligent Mixed-Type Handling** - Smart `MixedModelsCollection` for when followers are of different types (Users + Teams + Organizations)

✅ **Rich Metadata Support** - Attach JSON metadata to track source, campaign data, referrer, or any custom attributes

✅ **Flexible Query API** - Separate optimized methods for single-type (`followers()`) vs multi-type (`followersGrouped()`) scenarios

✅ **Mutual Relationships** - Built-in support for identifying mutual follows and connections

✅ **Full MorphMap Support** - Works seamlessly with Laravel's `Relation::morphMap()` for cleaner database storage

✅ **Modern Architecture** - Uses latest Laravel features with 100+ comprehensive tests using Pest PHP

## Features

-   **Fully Polymorphic**: Any model can follow any other model (User → Team, User → User, Team → Team, etc.)
-   **Simple API**: Intuitive methods like `follow()`, `unfollow()`, `toggleFollow()`, `isFollowing()`
-   **Expressive Scopes**: Chainable query scopes like `whereFollowing()` and `whereFollowers()`
-   **Metadata Support**: Attach custom JSON metadata to follows
-   **Zero Configuration**: Works out of the box with sensible defaults
-   **Full Test Coverage**: Comprehensive Pest PHP test suite included

## Installation

Install the package via composer:

```bash
composer require ritechoice23/laravel-followable
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="followable-migrations"
php artisan migrate
```

Optionally, publish the config file:

```bash
php artisan vendor:publish --tag="followable-config"
```

## Configuration

The published config file (`config/follow.php`) includes:

```php
return [
    'table_name' => 'follows',
    'allow_self_follow' => false,
    'metadata_column' => 'metadata',
];
```

## Usage

### Setup Models

Add traits to your models:

```php
use Illuminate\Database\Eloquent\Model;
use Ritechoice23\Followable\Traits\CanFollow;
use Ritechoice23\Followable\Traits\HasFollowers;

class User extends Model
{
    use CanFollow;      // Can follow other models
    use HasFollowers;   // Can be followed by other models
}

class Team extends Model
{
    use HasFollowers;   // Can be followed
}
```

### Basic Operations

```php
// Follow a model
$user->follow($team);

// Unfollow a model
$user->unfollow($team);

// Toggle follow status
$user->toggleFollow($team);

// Check if following
if ($user->isFollowing($team)) {
    // User is following the team
}

// Check if followed by
if ($team->isFollowedBy($user)) {
    // Team is followed by user
}

// Get counts
$user->followingCount();  // Number of models user is following
$team->followersCount();  // Number of followers team has
```

### Working with Followers

#### Get Actual Follower Models

The `followers()` method returns actual follower models (User, Team, etc.), not Follow pivot records:

```php
// Get all followers (single type or homogeneous followers)
$followers = $team->followers()->get();

// Paginate followers
$followers = $team->followers()->paginate(15);

// Filter and query like any Eloquent relation
$activeFollowers = $team->followers()
    ->where('is_active', true)
    ->orderBy('name')
    ->get();

// Quick pagination helper
$followers = $team->followersPaginated(10);

// Filter by specific follower type
$userFollowers = $team->followersOfType(User::class)->get();
```

#### Handling Mixed Follower Types

When a model has followers of different types (e.g., both Users and Teams), use `followersGrouped()`:

```php
// ✅ Best approach for mixed types
$grouped = $post->followersGrouped();
// Returns: ['App\Models\User' => Collection<User>, 'App\Models\Team' => Collection<Team>]

// Iterate through each type
foreach ($grouped as $type => $followers) {
    echo "{$type}: {$followers->count()} followers\n";

    foreach ($followers as $follower) {
        // $follower is the actual User or Team model
        echo $follower->name;
    }
}

// Or query specific types separately
$userFollowers = $post->followers(User::class)->get();
$teamFollowers = $post->followers(Team::class)->get();
```

#### Counting Followers

```php
// Total followers
$totalFollowers = $team->followersCount();

// Count by specific type
$userFollowers = $team->followersCount(User::class);
$teamFollowers = $team->followersCount(Team::class);
```

#### Access Follow Pivot Records

When you need the actual Follow records (e.g., for metadata):

```php
// Get Follow pivot records
$followRecords = $team->followRecords;  // Collection<Follow>

// With eager loading
$followRecords = $team->followRecords()->with('follower')->get();

// Access metadata
foreach ($followRecords as $follow) {
    $metadata = $follow->metadata;
    $followerModel = $follow->follower;
}
```

### Follow with Metadata

Attach custom data to follows:

```php
$user->follow($team, [
    'source' => 'web',
    'campaign' => 'summer_2024',
    'referrer' => 'homepage'
]);

// Access and modify metadata (metadata is cast as array)
$follow = Follow::first();

// Set metadata
$metadata = $follow->metadata ?? [];
$metadata['key'] = 'value';
$follow->metadata = $metadata;
$follow->save();

// Get metadata
$value = $follow->metadata['key'] ?? null;

// Remove metadata key
$metadata = $follow->metadata;
unset($metadata['key']);
$follow->metadata = $metadata;
$follow->save();
```

### Query Scopes

Find models based on follow relationships:

```php
// Find all users following a team
$users = User::whereFollowing($team)->get();

// Find all teams followed by a user
$teams = Team::whereFollowers($user)->get();

// Chain with other queries
$activeUsers = User::whereFollowing($team)
    ->where('status', 'active')
    ->orderBy('created_at', 'desc')
    ->get();
```

### Polymorphic Follows

Follow any model type:

```php
$user->follow($organization);  // User → Organization
$user->follow($anotherUser);   // User → User
$team->follow($anotherTeam);   // Team → Team
$user->follow($post);          // User → Post
```

### Relationships

Access follow relationships:

```php
// Get all follows made by user (Follow records)
$user->followingRecords;

// Get actual follower models
$actualFollowers = $team->followers()->get();

// Get Follow pivot records
$followRecords = $team->followRecords;

// Eager load relationships on Follow records
$follows = Follow::with(['follower', 'followable'])->get();
```

### Working with Followings

The `CanFollow` trait provides powerful methods to query what models a user is following.

#### Get Actual Followable Models

The `followings()` method returns actual followable models (User, Team, etc.), not Follow pivot records:

```php
// Get all followings (single type or homogeneous followings)
$followings = $user->followings()->get();

// Paginate followings
$followings = $user->followings()->paginate(15);

// Filter and query like any Eloquent relation
$activeTeams = $user->followings()
    ->where('is_active', true)
    ->orderBy('name')
    ->get();

// Quick pagination helper
$followings = $user->followingsPaginated(10);

// Filter by specific followable type
$teamFollowings = $user->followingsOfType(Team::class)->get();
```

#### Handling Mixed Followable Types

When a user follows different types of models (e.g., both Users and Teams), use `followingsGrouped()`:

```php
// ✅ Best approach for mixed types
$grouped = $user->followingsGrouped();
// Returns: ['App\Models\User' => Collection<User>, 'App\Models\Team' => Collection<Team>]

// Iterate through each type
foreach ($grouped as $type => $followables) {
    echo "{$type}: {$followables->count()} followings\n";

    foreach ($followables as $followable) {
        // $followable is the actual User or Team model
        echo $followable->name;
    }
}

// Or query specific types separately
$userFollowings = $user->followings(User::class)->get();
$teamFollowings = $user->followings(Team::class)->get();
```

#### Counting Followings

```php
// Total followings
$totalFollowings = $user->followingCount();

// Count by specific type
$userFollowings = $user->followingCount(User::class);
$teamFollowings = $user->followingCount(Team::class);
```

#### Access Following Records

When you need the actual Follow records (e.g., for metadata):

```php
// Get Follow pivot records
$followingRecords = $user->followingRecords;  // Collection<Follow>

// With eager loading
$followingRecords = $user->followingRecords()->with('followable')->get();

// Access metadata
foreach ($followingRecords as $follow) {
    $metadata = $follow->metadata;
    $followableModel = $follow->followable;
}
```

## Important Notes

### Use Cases for Different Methods

**For Followers (HasFollowers trait):**

**Use `followers()` when:**

-   All followers are of the same type (e.g., only Users)
-   You're filtering by a specific type
-   You need to chain Eloquent query methods
-   You're working with pagination

**Use `followersGrouped()` when:**

-   A model has followers of multiple different types
-   You need followers organized by their model type
-   You want to iterate through each type separately

**Use `followRecords` when:**

-   You need access to the Follow pivot records
-   You want to work with follow metadata
-   You need the follow timestamps or other pivot data

**For Followings (CanFollow trait):**

**Use `followings()` when:**

-   Following models of the same type (e.g., only Teams)
-   You're filtering by a specific type
-   You need to chain Eloquent query methods
-   You're working with pagination

**Use `followingsGrouped()` when:**

-   Following multiple different types of models
-   You need followings organized by their model type
-   You want to iterate through each type separately

**Use `followingRecords` when:**

-   You need access to the Follow pivot records
-   You want to work with follow metadata
-   You need the follow timestamps or other pivot data

### Performance Considerations

The package uses optimized database queries with negligible overhead:

-   **Single type queries**: Both `followers()` and `followings()` use efficient JOIN queries (1 query instead of N+1)
-   **Multiple types**: `followersGrouped()` and `followingsGrouped()` fetch all types efficiently with batch queries
-   **Smart Collection Wrapping**: `MixedModelsCollection` adds ~0.006ms overhead per operation (tested with 100 items)
-   **Counting**: Direct COUNT queries on indexed columns
-   **All queries leverage database indexes** for fast lookups
-   **MorphMap Compatible**: Works seamlessly with morphMap for cleaner storage and better performance

**Benchmark Results** (50 followings, mixed types):

-   Single type query: ~1.1ms
-   Mixed types (2 types): ~16-20ms (includes multiple type queries + sorting)
-   Grouped query: ~3.8ms (most efficient for mixed types)

💡 **Pro Tip**: For mixed-type scenarios, `followingsGrouped()` is 4x faster than `followings()->get()`

### Working with Mixed Follower Types

If your model can be followed by different types (polymorphic scenario):

```php
// ✅ Recommended: Use followersGrouped()
$grouped = $post->followersGrouped();
foreach ($grouped as $type => $followers) {
    // Each type's followers as proper model instances
}

// ✅ Alternative: Query specific types
$userFollowers = $post->followers(User::class)->get();
$teamFollowers = $post->followers(Team::class)->get();

// ✅ Or: Query and merge manually
$users = $post->followers(User::class)->get();
$teams = $post->followers(Team::class)->get();
$allFollowers = $users->merge($teams);
```

## Advanced Usage

### Prevent Self-Following

By default, models cannot follow themselves. Enable it in config if needed:

```php
// config/follow.php
'allow_self_follow' => true,
```

### Idempotent Operations

Following an already-followed model returns `false` without creating duplicates:

```php
$user->follow($team);  // true
$user->follow($team);  // false (already following)
```

### Database Indexes

The migration includes optimized indexes for performance:

-   Unique composite index on follower and followable (prevents duplicates)
-   Index on followable_type and followable_id (for lookups)
-   Index on follower_type and follower_id (for reverse lookups)
-   Index on created_at (for trending queries)

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
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
