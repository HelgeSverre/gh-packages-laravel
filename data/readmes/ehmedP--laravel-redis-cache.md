# Laravel Redis Cache

A performant, scalable, and flexible Redis cache package for Laravel with **tags**, **groups**, **PHP 8 attributes**, **closure caching**, **Blade directives**, **automatic model invalidation**, and **Artisan commands**.

## Features

- 🚀 **High Performance** — SCAN-based key iteration (non-blocking), Redis pipelines for batch operations
- 🏷️ **Tag-based Caching** — Associate cache entries with tags, flush by tag
- 📁 **Group-based Caching** — Organize cache entries into logical groups
- 🎯 **PHP 8 Attributes** — `#[Cacheable]` on classes and methods, `#[CacheInvalidation]` for write operations
- 🔒 **Closure Caching** — Cache results of closures with automatic key generation
- 🧩 **Blade Directives** — `@cache` / `@endcache` for caching view fragments
- 🔄 **Auto Invalidation** — Automatic cache clearing on model create/update/delete
- 📊 **Dual Strategy** — Individual (per-key) or Bulk (per-tag) invalidation
- 🧹 **Artisan Commands** — Clear cache by key, tag, or flush everything
- 📡 **Events** — Hook into cache operations for monitoring and debugging
- 🔌 **Extensible** — Every component is interface-driven and replaceable
- 🧪 **Fully Testable** — 60+ test cases covering all functionality
- 📦 **Laravel Auto-Discovery** — Zero configuration required

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12
- Redis PHP extension (phpredis) or Predis

## Installation

```bash
composer require ehmedp/laravel-redis-cache
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=redis-cache-config
```

## Configuration

```php
// config/redis-cache.php
return [
    // Master switch — set to false to disable all caching
    'enabled' => env('REDIS_CACHE_ENABLED', true),

    // Redis connection from config/database.php
    'connection' => env('REDIS_CACHE_CONNECTION', 'default'),

    // Prefix for all cache keys (e.g., "rc:users:42")
    'prefix' => env('REDIS_CACHE_PREFIX', 'rc'),

    // Key segment separator
    'separator' => ':',

    // Default TTL in seconds (0 = no expiration)
    'default_ttl' => (int) env('REDIS_CACHE_TTL', 3600),

    // Tag and group prefixes
    'tag_prefix' => 'tag',
    'group_prefix' => 'group',

    // Blade @cache / @endcache directives
    'blade' => [
        'enabled' => true,
        'default_ttl' => null, // null = use global default_ttl
    ],

    // Cache events (CacheHit, CacheMissed, CacheWritten, etc.)
    'events' => [
        'enabled' => env('REDIS_CACHE_EVENTS_ENABLED', true),
    ],

    // Automatic cache invalidation on model changes
    'invalidation' => [
        'enabled' => env('REDIS_CACHE_INVALIDATION_ENABLED', true),
        'default_strategy' => 'individual', // or 'bulk'

        'models' => [
            // Per-record caching — only clears the specific user's cache:
            // \App\Models\User::class => [
            //     'strategy' => 'individual',
            //     'tags' => ['users'],
            // ],
            //
            // Collection caching — clears ALL subjects cache on any change:
            // \App\Models\Subject::class => [
            //     'strategy' => 'bulk',
            //     'tags' => ['subjects'],
            // ],
        ],
    ],
];
```

## Usage

### Basic Operations

```php
use EhmedP\RedisCache\Facades\RedisCache;

// Put & Get
RedisCache::put('user:1', $userData, 3600);
$user = RedisCache::get('user:1');
$user = RedisCache::get('user:1', 'default_value');

// Check existence
if (RedisCache::has('user:1')) { /* ... */ }

// Remove
RedisCache::forget('user:1');

// Remember (get or compute & cache)
$user = RedisCache::remember('user:1', 3600, function () {
    return User::find(1);
});

// Remember forever
$settings = RedisCache::rememberForever('app:settings', function () {
    return Settings::all();
});

// Batch operations
RedisCache::putMany(['key1' => 'val1', 'key2' => 'val2'], 3600);
$values = RedisCache::many(['key1', 'key2']);

// Increment / Decrement
RedisCache::increment('page:views');
RedisCache::decrement('stock:item:42', 5);
```

### Tag-based Caching

```php
// Cache with tags
RedisCache::tags('users')->put('user:1', $user, 3600);
RedisCache::tags(['users', 'api'])->put('api:user:1', $data, 3600);

// Remember with tags
$user = RedisCache::tags('users')->remember('user:1', 3600, fn () => User::find(1));

// Flush all entries for a tag
RedisCache::flushTag('users');

// Flush multiple tags
RedisCache::flushTags(['users', 'api']);

// Inspect keys under a tag
$keys = RedisCache::getTaggedKeys('users');
```

### Group-based Caching

```php
$group = RedisCache::group('dashboard');
$group->put('stats', $dashboardStats, 3600);
$group->put('charts', $chartData, 3600);

$stats = RedisCache::group('dashboard')->remember('stats', 3600, fn () => calculateStats());

RedisCache::flushGroup('dashboard');
```

### Closure Caching

```php
// Auto-generated key from source location
$result = RedisCache::rememberClosure(3600, function () {
    return heavyComputation();
});

// With arguments
$result = RedisCache::rememberClosure(3600, fn($id) => User::find($id), [42]);
```

### PHP 8 Attributes — Method-Level

```php
use EhmedP\RedisCache\Attributes\Cacheable;
use EhmedP\RedisCache\Traits\HasCacheable;

class UserService
{
    use HasCacheable;

    #[Cacheable(ttl: 3600, tags: ['users'])]
    public function findById(int $id): ?User
    {
        return User::find($id);
    }
}

$service = new UserService();
$user = $service->cached('findById', 42); // cached!
$service->flushMethodCache('findById', 42); // clear specific cache
```

### PHP 8 Attributes — Class-Level (Repository/Service)

Apply `#[Cacheable]` to a class and **ALL public methods** are automatically cached:

```php
use EhmedP\RedisCache\Attributes\Cacheable;
use EhmedP\RedisCache\Invalidation\InvalidationStrategy;

#[Cacheable(ttl: 3600, tags: ['subjects'], invalidation: InvalidationStrategy::Bulk)]
class SubjectRepository
{
    use HasCacheable;

    public function all(): Collection       // ← cached (from class attribute)
    {
        return Subject::all();
    }

    public function findById(int $id): ?Subject  // ← cached (from class attribute)
    {
        return Subject::find($id);
    }

    #[Cacheable(ttl: 60, tags: ['subjects', 'active'])]  // ← overrides class-level
    public function active(): Collection
    {
        return Subject::where('active', true)->get();
    }
}
```

### Cache Invalidation on Write Operations

```php
use EhmedP\RedisCache\Attributes\CacheInvalidation;
use EhmedP\RedisCache\Invalidation\InvalidationStrategy;

class UserRepository
{
    use HasCacheable;

    // Individual: only clears cache for the specific user ID
    #[CacheInvalidation(
        tags: ['users'],
        strategy: InvalidationStrategy::Individual,
        entityKey: 'id'
    )]
    public function update(int $id, array $data): User
    {
        return User::find($id)->update($data);
    }

    // Bulk: clears ALL "users" tagged cache
    #[CacheInvalidation(
        tags: ['users'],
        strategy: InvalidationStrategy::Bulk
    )]
    public function importUsers(array $data): bool
    {
        // mass import...
        return true;
    }
}

// Usage
$repo->cachedInvalidate('update', 42, ['name' => 'John']);  // clears only user:42
$repo->cachedInvalidate('importUsers', $csvData);            // clears ALL users cache
```

### Automatic Model Cache Invalidation

Configure models in `config/redis-cache.php`:

```php
'invalidation' => [
    'enabled' => true,
    'models' => [
        // Large table: clear only the changed record
        \App\Models\User::class => [
            'strategy' => 'individual',
            'tags' => ['users'],
        ],

        // Small lookup table: clear everything on any change
        \App\Models\Subject::class => [
            'strategy' => 'bulk',
            'tags' => ['subjects'],
        ],
    ],
],
```

Add the trait to your models for convenience methods:

```php
use EhmedP\RedisCache\Traits\HasCacheableModel;

class User extends Model
{
    use HasCacheableModel;

    protected array $cacheTags = ['users'];
    protected ?int $cacheTtl = 3600;
}

// Cache a model
$user->cacheThis();

// Retrieve from cache
$data = User::fromCache(42);

// Retrieve from cache or DB (with auto-cache)
$user = User::fromCacheOrFind(42);

// Clear single model cache
$user->clearCache();

// Clear ALL user cache
User::flushModelCache();
```

Now when you do:
```php
$user->update(['name' => 'New Name']);
// → ModelCacheObserver automatically clears cache for user:{id}

Subject::create(['title' => 'History']);
// → ModelCacheObserver automatically clears ALL "subjects" tagged cache
```

### Blade Directives — @cache / @endcache

Cache rendered HTML blocks directly in your Blade templates:

```blade
{{-- Basic: cache with default TTL --}}
@cache('sidebar')
    <div class="sidebar">
        @foreach($menuItems as $item)
            <a href="{{ $item->url }}">{{ $item->label }}</a>
        @endforeach
    </div>
@endcache

{{-- With custom TTL (2 hours) --}}
@cache('navigation', 7200)
    <nav>@include('partials.nav')</nav>
@endcache

{{-- With tags for targeted invalidation --}}
@cache('user-profile-' . $user->id, 3600, ['users', 'profiles'])
    <div class="profile">
        <h1>{{ $user->name }}</h1>
        <p>{{ $user->bio }}</p>
    </div>
@endcache

{{-- Dynamic keys with model data --}}
@cache('product-card-' . $product->id, 1800, ['products'])
    @include('components.product-card', ['product' => $product])
@endcache
```

### Events

Listen to cache events for monitoring, logging, or triggering side effects:

```php
use EhmedP\RedisCache\Events\CacheHit;
use EhmedP\RedisCache\Events\CacheMissed;
use EhmedP\RedisCache\Events\CacheWritten;
use EhmedP\RedisCache\Events\CacheFlushed;
use EhmedP\RedisCache\Events\CacheInvalidated;

// In EventServiceProvider or via Event::listen()
Event::listen(CacheHit::class, function (CacheHit $event) {
    Log::debug("Cache HIT: {$event->key}");
});

Event::listen(CacheMissed::class, function (CacheMissed $event) {
    Log::debug("Cache MISS: {$event->key}");
});

Event::listen(CacheInvalidated::class, function (CacheInvalidated $event) {
    Log::info("Cache invalidated: {$event->type} -> {$event->entity}", $event->context);
});
```

Disable events for maximum performance:
```env
REDIS_CACHE_EVENTS_ENABLED=false
```

### Extending — Custom Invalidation Logic

Implement `CacheInvalidatorInterface` for custom behavior:

```php
use EhmedP\RedisCache\Invalidation\CacheInvalidator;

class CustomInvalidator extends CacheInvalidator
{
    public function onUpdated(string $entity, string|int $id, array $changed = []): void
    {
        // Only invalidate if critical fields changed
        $criticalFields = ['name', 'email', 'role'];

        if (empty(array_intersect(array_keys($changed), $criticalFields))) {
            return; // Skip invalidation for non-critical changes
        }

        parent::onUpdated($entity, $id, $changed);
    }
}
```

Bind it in your `AppServiceProvider`:

```php
use EhmedP\RedisCache\Contracts\CacheInvalidatorInterface;

$this->app->bind(CacheInvalidatorInterface::class, CustomInvalidator::class);
```

## Artisan Commands

```bash
# Clear ALL cache (with confirmation)
php artisan redis-cache:clear

# Clear ALL cache (forced, for CI/CD)
php artisan redis-cache:clear --force

# Clear by tag(s)
php artisan redis-cache:clear-tag users
php artisan redis-cache:clear-tag users products api
php artisan redis-cache:clear-tag users --force

# Clear by key(s)
php artisan redis-cache:clear-key user:42
php artisan redis-cache:clear-key user:42 user:43 settings:theme
```

## Architecture

```
src/
├── Attributes/
│   ├── Cacheable.php                 # Class/method caching attribute
│   └── CacheInvalidation.php         # Write-operation invalidation attribute
├── Cache/
│   ├── CacheManager.php              # Main entry point (Facade root)
│   ├── CacheStore.php                # Redis store (SCAN-based, pipeline)
│   ├── TaggedCache.php               # Tag management via Redis SETs
│   └── CacheKeyGenerator.php         # Key generation strategy
├── Commands/
│   ├── ClearCacheCommand.php         # php artisan redis-cache:clear
│   ├── ClearTagCommand.php           # php artisan redis-cache:clear-tag
│   └── ClearKeyCommand.php           # php artisan redis-cache:clear-key
├── Contracts/
│   ├── CacheableInterface.php        # Cache store contract
│   ├── TaggableInterface.php         # Tagging contract
│   ├── KeyGeneratorInterface.php     # Key generator contract
│   └── CacheInvalidatorInterface.php # Invalidation contract
├── Events/
│   ├── CacheHit.php                  # Cache key found
│   ├── CacheMissed.php               # Cache key not found
│   ├── CacheWritten.php              # Value stored in cache
│   ├── CacheFlushed.php              # Cache entries flushed
│   └── CacheInvalidated.php          # Cache invalidated by data change
├── Facades/
│   └── RedisCache.php                # Laravel Facade
├── Invalidation/
│   ├── CacheInvalidator.php          # Default invalidation engine
│   ├── InvalidationStrategy.php      # Individual vs Bulk enum
│   └── ModelCacheObserver.php        # Eloquent model observer
├── Middleware/
│   └── CacheResponse.php             # HTTP response caching
├── Support/
│   ├── CacheGroup.php                # Group management
│   └── ClosureSerializer.php         # Closure fingerprinting
├── Traits/
│   ├── HasCacheable.php              # Class/method attribute caching
│   └── HasCacheableModel.php         # Eloquent model caching
├── View/
│   └── CacheBladeDirective.php       # @cache / @endcache
└── RedisCacheServiceProvider.php     # Service Provider
```

## Testing

```bash
composer test
# or
./vendor/bin/phpunit
```

## License

MIT License. See [LICENSE](LICENSE) for details.