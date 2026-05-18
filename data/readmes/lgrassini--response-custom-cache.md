Response Custom Cache

A lightweight Laravel package to cache whole HTTP responses.

Features:

- Middleware: `CustomCache`, `CustomCacheForce`, `CustomCacheSkip` to control caching per-route.
- Service: `CustomCacheService` to serialize, store, retrieve and purge cached responses.
- Supports tag-based invalidation and optional headers for cache time/age/tags.

Quick notes:

- Configure behavior via environment variables (prefix `CUSTOM_CACHE_`).
- Flush cache with the artisan command: `php artisan customcache:flush`.
- See `app/Services/CustomCacheService.php` and `app/Http/Middleware` for implementation details.

Keep it simple — register the middleware and enable via env to start caching full responses.
