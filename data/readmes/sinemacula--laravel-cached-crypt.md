# Laravel Cached Crypt

[![Latest Stable Version](https://img.shields.io/packagist/v/sinemacula/laravel-cached-crypt.svg)](https://packagist.org/packages/sinemacula/laravel-cached-crypt)
[![Build Status](https://github.com/sinemacula/laravel-cached-crypt/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/sinemacula/laravel-cached-crypt/actions/workflows/tests.yml)
[![StyleCI](https://github.styleci.io/repos/989824280/shield?style=flat&branch=master)](https://github.styleci.io/repos/989824280)
[![Maintainability](https://qlty.sh/badges/38be203a-933b-4ae8-9e80-f6e8f924ecb9/maintainability.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-cached-crypt)
[![Code Coverage](https://qlty.sh/badges/38be203a-933b-4ae8-9e80-f6e8f924ecb9/test_coverage.svg)](https://qlty.sh/gh/sinemacula/projects/laravel-cached-crypt)
[![Total Downloads](https://img.shields.io/packagist/dt/sinemacula/laravel-cached-crypt.svg)](https://packagist.org/packages/sinemacula/laravel-cached-crypt)

Laravel Cached Crypt wraps Laravel's encrypter to reduce repeated decrypt overhead in hot paths.
It is drop-in by default, memoizes decrypt results in-process, and can optionally persist plaintext with bounded TTL,
epoch versioning, and size guardrails.

> ⚠️ **Security Warning**
> Persisted plaintext caching should only be enabled when operational controls are in place.
> Use secured Redis/Memcached with encryption in transit and at rest, private networking, and short TTLs.
> Prefer memo-only mode unless cross-request reuse is required.

## Features

- Drop-in provider integration with no manual registration order requirements
- Enabled-by-default memo-only optimization path (`enabled=true`, `memo_only=true`, `cache_plaintext=false`)
- Optional cross-request plaintext persistence with TTL (no `rememberForever`)
- Epoch and optional key fingerprint namespacing for safe invalidation boundaries
- SHA-256 payload hashing for cache keys
- Optional dedicated cache store and optional cache tagging
- Size guardrails (`min_bytes_to_cache`, `max_memo_bytes`, `max_bytes_to_cache`)
- Optional eligibility resolver hook for app-specific persistence decisions
- Fail-open behavior for cache backend and resolver failures (decrypt path preserved)
- Optional sampled metric logging for cache/decrypt behavior

## Installation

```bash
composer require sinemacula/laravel-cached-crypt
```

Laravel will automatically register the service provider via package discovery.
No manual provider ordering is required.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=config
```

Default configuration in `config/cached-crypt.php`:

```php
return [
    'enabled' => true,
    'cache_plaintext' => false,
    'memo_only' => true,
    'ttl_seconds' => 120,
    'epoch' => 'v1',
    'key_fingerprint' => null,
    'store' => null,
    'min_bytes_to_cache' => 1024,
    'max_memo_bytes' => 262144,
    'max_bytes_to_cache' => 262144,
    'use_tags' => false,
    'eligibility_resolver' => null,
    'metrics' => [
        'enabled' => false,
        'sample_rate' => 0.10,
    ],
];
```

Safe defaults:

- Works out of the box with no additional env vars
- Package enabled in memo-only mode by default
- Cross-request plaintext persistence remains off unless explicitly enabled

## How It Works

For each decrypt call:

1. Build a namespaced key with epoch and SHA-256 payload hash.
2. Read from in-process memoization cache first.
3. Optionally read/write persistent plaintext cache when enabled and eligible.
4. Decrypt via Laravel when needed, then memoize and optionally persist.
5. Fail open on cache/resolver errors so decrypt behavior is preserved.

Persistent writes are bounded by:

- `ttl_seconds`
- `min_bytes_to_cache` (encrypted payload size)
- `max_memo_bytes` (in-process memo value size estimate)
- `max_bytes_to_cache` (decrypted value size estimate)
- Optional resolver callback (`eligibility_resolver`)

## Operating Modes

- `memo_only = true`: in-process reuse only, no cross-request plaintext persistence.
- `cache_plaintext = true` and `memo_only = false`: allows persistent plaintext caching with guardrails.

## Key Rotation and Invalidation

When encryption settings change (for example `APP_KEY`, cipher, or `previous_keys`), bump `epoch`.
This immediately cold-starts cached plaintext keys without requiring global cache flushes.

If `use_tags` is enabled and the store supports tags, entries are grouped under:

- `cached-crypt`
- `cached-crypt:{epoch}`

## Metrics

When `metrics.enabled` is true, sampled events are logged with:

- cache hit/miss source (`memo` or `persistent`)
- decrypt duration in milliseconds
- approximate bytes persisted for cache writes
- cache error events for persistent read/write failures

## Testing

```bash
composer test
composer test-coverage
composer check
```

## Contributing

Contributions are welcome via GitHub pull requests.

## Security

If you discover a security issue, please contact Sine Macula directly rather than opening a public issue.

## License

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
