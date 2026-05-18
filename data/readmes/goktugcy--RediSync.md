# RediSync

High-performance HTTP caching for PHP with Redis storage and optional DB-driven invalidation/write-through (MySQL/PostgreSQL via Doctrine DBAL).

![Packagist Version](https://img.shields.io/packagist/v/redisync/core?style=flat-square)
![Total Downloads](https://img.shields.io/packagist/dt/redisync/core?style=flat-square)
![PHP Version](https://img.shields.io/packagist/php-v/redisync/core?style=flat-square)
![License](https://img.shields.io/packagist/l/redisync/core?style=flat-square)
![PSR](https://img.shields.io/badge/PSR--7%2F17-1.x%20%7C%202.x-blue?style=flat-square)

> Zero-friction HTTP caching for PHP apps: PSR-15 middleware, Redis-backed, DB-aware invalidation.

Quick nav: [Install](#install) · [Configuration](#configuration) · [Middleware](#middleware-usage) · [Facade](#facade-usage) · [Logging](#logging-psr-3) · [Write-through](#write-through-db-to-cache) · [Laravel](#laravel-quickstart) · [CLI](#cli) · [Notes](#notes) · [API contracts](#api-contracts-and-errors) · [Troubleshooting](#troubleshooting-installs-laravelcarbon-and-doctrine-dbal) · [Proof](#proof)

## ✨ Features

- PSR-15 middleware: automatic HTTP cache hit/miss flow.
- PSR-7/17 support via nyholm/psr7.
- GET/HEAD-only caching by default, optional bypass with the X-Bypass-Cache header.
- Cache headers: X-RediSync-Cache (HIT/MISS) and Age on hits (PSR-15 and Laravel).
- Conditional requests: automatic ETag generation and If-None-Match → 304.
- Cache-Control aware: respects no-store and private (won't serve/store).
- Vary safety: bypasses cache when Authorization or Cookie exist to avoid leakage.
- Safe caching via status whitelist (default: [200]) and Content-Type allow list.
- TTL map by path pattern/regex for per-endpoint TTL control.
- CLI for cache ops: clear-cache, list-keys, key-info, warmup.
- Doctrine DBAL-based DatabaseManager with invalidation hooks.
- Write-through DB helper: update cache immediately after successful DB writes.
- remember() helper: compute-or-cache convenience API (vanilla and Laravel facades).
- PSR-3 logging hooks: cache hit/miss/store, bypass reasons, DB write-through.

## 🔧 Install

Add to your project:

```bash
composer require redisync/core
```

Requirements: PHP 8.1+, Redis (via Predis 1.x or 2.x). Optional: Doctrine DBAL and DB drivers (pdo_mysql/pdo_pgsql) if you use DatabaseManager.

## ⚙️ Configuration

Configure programmatically (ENV not required):

```php
use RediSync\Cache\CacheManager;

$cache = CacheManager::fromConfig([
  'host' => '127.0.0.1',
  'port' => 6379,
  'database' => 0,
  'prefix' => 'redisync:'
]);
```

DatabaseManager (optional):

```php
use RediSync\Database\DatabaseManager;

$db = DatabaseManager::fromDsn('mysql://user:pass@127.0.0.1:3306/app?charset=utf8mb4');

// Cache invalidation after data changes
$db->onInvalidate(function (string $sql, array $params) use ($cache) {
  if (str_starts_with(strtoupper(ltrim($sql)), 'UPDATE USERS')
    || str_starts_with(strtoupper(ltrim($sql)), 'DELETE FROM USERS')
    || str_starts_with(strtoupper(ltrim($sql)), 'INSERT INTO USERS')
  ) {
    $cache->clearByPattern('users:*');
  }
});
```

## 🧩 Middleware Usage

```php
use Nyholm\Psr7\Factory\Psr17Factory;
use RediSync\Middleware\CacheMiddleware;
use RediSync\Utils\KeyGenerator;

$psr17 = new Psr17Factory();

$middleware = new CacheMiddleware(
  cache: $cache,
  keys: new KeyGenerator('http', ignoredParams: ['nonce', '_ts']),
  ttl: 300,
  responseFactory: $psr17,
  streamFactory: $psr17,
  statusWhitelist: [200],
  allowedContentTypes: ['application/json'],
  ttlMap: [
    '/public/*' => 60,
    '#^/users/\\d+$#' => 300,
  ],
);

// Add it to your PSR-15 stack (Mezzio, Slim, etc.). Middleware caches only GET/HEAD by default.
// Conditional requests: send If-None-Match; 304 is returned when ETag matches (ETag is auto-generated if missing).
// Cache-Control: requests with no-store bypass; responses with no-store/private are not stored.
// Vary safety: Authorization/Cookie on the request bypass the cache to protect user-specific content.
// To force-bypass: send header X-Bypass-Cache: 1. Responses include X-RediSync-Cache: HIT|MISS and Age.
```

### HTTP semantics: ETag, 304, no-store/private, vary

- ETag: If the origin response doesn't include ETag, RediSync computes one from the body. Clients sending `If-None-Match` get `304 Not Modified` when it matches.
- no-store/private: A request with `Cache-Control: no-store` bypasses cache. A response with `no-store` or `private` is not stored by RediSync (shared cache).
- Vary safety: Requests carrying `Authorization` or `Cookie` headers bypass cache to avoid leaking personalized content.
- Headers: On cache HITs RediSync adds `X-RediSync-Cache: HIT` and `Age`. On MISS it sets `X-RediSync-Cache: MISS`.

## 🧩 Facade usage

### Vanilla PHP (framework-agnostic)

```php
use RediSync\Cache\CacheManager;
use RediSync\Facades\RediSync;

$cache = CacheManager::fromConfig(['host' => '127.0.0.1', 'port' => 6379, 'database' => 0, 'prefix' => 'app:']);
RediSync::setInstance($cache);

// get / set
RediSync::set('users:1', ['id' => 1, 'name' => 'Ada'], 300);
$data = RediSync::get('users:1');

// remember (compute-or-cache)
$user = RediSync::remember('users:1', 300, function () {
  // expensive work or DB fetch
  return ['id' => 1, 'name' => 'Ada'];
});

// Evict: set with null deletes the key (by design)
RediSync::set('users:1', null); // equivalent to delete
// Bulk invalidation example
// $cache->clearByPattern('users:*');
```

## 📜 Logging (PSR-3)

RediSync logs key events with any PSR-3–compatible logger: `cache.hit`, `cache.miss`, `cache.set`, `cache.delete`, `cache.clear_by_pattern`, `httpcache.hit|miss|store|conditional_304|not_cacheable|bypass`, `db.execute`, `db.fetch_*`, `db.write_through.cache_updated`.

Vanilla PHP (Monolog):

```php
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use RediSync\Cache\CacheManager;
use RediSync\Facades\RediSync;

$logger = new Logger('app');
$logger->pushHandler(new StreamHandler('php://stdout'));

$cache = CacheManager::fromConfig(['host' => '127.0.0.1', 'port' => 6379]);
$cache->setLogger($logger);
RediSync::setInstance($cache);
RediSync::setLogger($logger); // optional facade shortcut
```

Laravel: LoggerInterface is automatically injected from the container. The ServiceProvider forwards the framework logger to CacheManager and DatabaseManager; no extra setup required.

## Write-through DB to Cache

Update cache immediately after a successful DB write (inside a transaction):

```php
use RediSync\Database\DatabaseManager;
use RediSync\Cache\CacheManager;

$db = DatabaseManager::fromDsn('sqlite:///:memory:');
// ... create table/users ...

$affected = $db->writeThrough(
  'UPDATE users SET name = :n WHERE id = :id', ['n' => 'alice', 'id' => 1],
  $cache,
  // Build cache entries from the write result
  function (int $affected, array $params, \Doctrine\DBAL\Connection $conn): array {
    if ($affected > 0) {
      return [ ['key' => "users:{$params['id']}", 'value' => ['id' => $params['id'], 'name' => $params['n']], 'ttl' => 300] ];
    }
    return [];
  }
);
```

Shortcut: you can also pass a simple associative array as the plan and use a default TTL:

```php
$db->writeThrough(
  'DELETE FROM users WHERE id = :id', ['id' => 1], $cache,
  [ 'users:1' => null ], // set null or use clearByPattern in an onInvalidate callback
  60
);
```

## Laravel Quickstart

Auto-discovery registers a Service Provider, Facades, and `redisync.cache` middleware.

- Facade (controller) using remember():

```php
use RediSync\Bridge\Laravel\Facades\RediSync; // static facade
public function show(int $id) {
  $user = RediSync::remember("users:$id", 300, fn() => \App\Models\User::findOrFail($id)->toArray());
  return response()->json($user);
}
```

- Route cache (GET):

```php
use Illuminate\Support\Facades\Route;
Route::middleware('redisync.cache')->get('/api/users/{id}', [UserController::class, 'show']);
```

- HTML cache (view) via RediSyncCache (array/string payloads):

```php
use Illuminate\Support\Facades\Auth;
use RediSync\Bridge\Laravel\Facades\RediSyncCache as Cache;
public function getProfile() {
  $u = Auth::user(); if (! $u) return redirect('404');
  $k = "users:profile:{$u->id}"; if ($h = Cache::get($k)) return response($h);
  $h = view('profile', ['user' => $u])->render(); Cache::set($k, $h, 300); return response($h);
}
```

- Data cache (array) via RediSyncCache:

```php
use Illuminate\Support\Facades\Auth;
use RediSync\Bridge\Laravel\Facades\RediSyncCache as Cache;
public function getProfileData() {
  $u = Auth::user(); if (! $u) return redirect('404');
  $k = "users:data:{$u->id}"; $d = Cache::get($k) ?: $u->toArray();
  if (! Cache::get($k)) Cache::set($k, $d, 300);
  return view('profile', ['user' => $u]);
}
```

- Invalidation (events):

```php
// app/Providers/AppServiceProvider.php
public function boot(\RediSync\Cache\CacheManager $cache): void
{
  \App\Models\User::saved(fn() => $cache->clearByPattern('users:*'));
  \App\Models\User::deleted(fn() => $cache->clearByPattern('users:*'));
}
```

Notes: Uses Laravel Redis config automatically. By default, JSON 200 responses are cached for ~300s. Bypass with header `X-Bypass-Cache: 1`.

HTTP semantics in Laravel middleware:

- GET/HEAD cache with `X-RediSync-Cache` (HIT/MISS) and `Age` on hits.
- `If-None-Match` supported; returns `304 Not Modified` when matching the stored ETag (computed if absent).
- Respects `Cache-Control: no-store` on requests and `no-store`/`private` on responses (won't store).
- Requests containing `Authorization` or cookies bypass the cache for safety.

### Write-through in Laravel

```php
// In a service or controller where you have the DB connection DSN
use RediSync\Bridge\Laravel\Facades\RediSyncCache as Cache;
use RediSync\Database\DatabaseManager;

$db = DatabaseManager::fromDsn(env('DATABASE_URL'));
$db->writeThrough(
  'INSERT INTO posts (title) VALUES (:t)', ['t' => $title],
  app(\RediSync\Cache\CacheManager::class),
  fn(int $affected, array $p, \Doctrine\DBAL\Connection $c) => $affected
    ? [ ['key' => 'posts:latest', 'value' => /* recompute */ [], 'ttl' => 120] ]
    : []
);
```

## 🛠️ CLI

Use the bundled CLI for quick cache operations. The tool reads Redis config from `config/config.php`.

```bash
vendor/bin/redisync help
```

Commands:

- clear-cache [pattern]
  - Delete keys by pattern (default: `*`).
  - Example: `vendor/bin/redisync clear-cache users:*`
- list-keys [pattern] [limit]
  - List keys (default pattern `*`, limit `100`).
  - Example: `vendor/bin/redisync list-keys api:* 50`
- key-info <key>
  - Show TTL/type/size/exists.
  - Example: `vendor/bin/redisync key-info users:1`
- warmup [ttl]
  - Read keys from STDIN and set placeholder values with TTL (default 60).
  - Example:

```bash
printf "a\nb\n" | vendor/bin/redisync warmup 30
```

## 📷 Proof

![RediSync usage proof](https://rffureejqjzrbqzrcyxv.supabase.co/storage/v1/object/public/images/redisync.png)

## 📝 Notes

- Middleware caches only GET/HEAD requests by default.
- Use status whitelist and Content-Type filters for safe caching.
- TTL map allows per-path TTL control.

### API contracts and errors

- Cache null semantics: `set($key, null)` evicts the key to avoid ambiguity with `get()` returning null.
- Exceptions: Redis/DB errors currently bubble up from underlying libraries. There’s no wrapper exception layer in 1.x; handle with try/catch in your app as needed.

## Troubleshooting installs (Laravel/Carbon and Doctrine DBAL)

If your app uses Laravel 11 + Carbon 3, you may see a conflict involving `doctrine/dbal` and `carbonphp/carbon-doctrine-types` when installing `redisync/core`.

What changed: RediSync no longer hard-requires `doctrine/dbal`. It's optional and only needed if you plan to use `DatabaseManager`.

- Install RediSync first:

  ```bash
  composer require redisync/core
  ```

- If you need DB features, require a DBAL version compatible with your stack. For example:

  ```bash
  composer require doctrine/dbal:^3.8
  ```

If Composer still reports conflicts, align DBAL with the versions compatible with your Laravel/Carbon lock (check `composer why doctrine/dbal` and `composer why-not doctrine/dbal:^3.10`).
