# Laravel Caching Model
- Simple package for caching laravel eloquent model
- Support retrieve model stored in cache store by id (or other primary key)

# Usage
1. Implement Cacheable interface then use HasCache trait:
```php
use TanNhatCMS\CachingModel\Contracts\Cacheable;
use TanNhatCMS\CachingModel\Traits\HasCache;

class Setting extends Model implements Cacheable
{
    use HasCache;

    ...
}
```

2. use `fromCache()` static method to retrieve model data from cache storage
```php
$cachedInstance = Setting::fromCache()->find($key);
```

# Available methods:
1. public static function primaryCacheKey(): string;
- Return primary key for creating cache key 
- Default: id

2. public static function getCacheKey($id): string;
- Return cache key for specific instance with primary key is $id

3. public static function cacheTimeout(): int;
- Return cache timeout

4. public function scopeCacheWithRelation($query);
- Specific relationship will cache together model
```php
public function scopeCacheWithRelation($query)
{
    return $query->with('relationship:id);
}
```