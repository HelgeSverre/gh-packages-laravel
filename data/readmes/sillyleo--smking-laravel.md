# smking/laravel

AI-native SEO (AEO) for Laravel. Auto-inject JSON-LD, FAQ, and AI summaries into your pages so ChatGPT, Perplexity, and Google AI can cite them.

## Install

**Don't follow this README to install.** Your smking dashboard generates a per-site install prompt with the real `SMKING_API_KEY`, `SMKING_BASE_URL`, and (if you use CMS) `SMKING_WEBHOOK_SECRET` baked in, plus the exact `composer require`, `vendor:publish`, and `php artisan smking:doctor` commands. The prompt is the source of truth and stays in sync with the SDK version.

Two ways to get it:

```bash
# Option 1 — one-shot wizard (composer require + .env + doctor)
npx @soloworks/smking-wizard

# Option 2 — copy the prompt manually from your smking dashboard's
# install panel into your editor / coding agent.
```

Once `php artisan smking:doctor` is green, the middleware auto-registers and every HTML GET response picks up:

- **AEO** — JSON-LD, FAQ/summary blocks (for ChatGPT, Perplexity, Google AI)
- **SEO** — `<title>`, `og:*`, `twitter:*`, `<link rel="canonical">` (for Google snippet + social shares)
- **Markdown for Agents** (v0.4.0+) — agents requesting `Accept: text/markdown` get a structured markdown rendition. Boosts your Cloudflare Agent Readiness score.
- **Markdown alternate Link header** (v0.5.0+) — every HTML response advertises the markdown rendition via `Link: <{url}>; rel="alternate"; type="text/markdown"`.

smking is the source of truth for SEO/AEO meta. Any existing `<title>`, `<meta name="description">`, `og:*`, or `<link rel="canonical">` in your layout is stripped and replaced with smking's version (v0.3.0+). To keep a tag under your control, disable it via `config('smking.inject.{tag}', false)` or render it yourself with the `<x-smking-meta />` Blade component.

## Manual usage

Disable auto-injection and render where you want:

```php
// config/smking.php
'auto_inject' => false,
```

```blade
{{-- 1. Body content (JSON-LD + FAQ + summary) --}}
<x-smking-aeo path="/products/{{ $product->slug }}" />

{{-- 2. SEO meta inside <head> with fallback to your own page data --}}
<head>
    <x-smking-meta
        :path="request()->path()"
        :fallback-title="$product->name"
        :fallback-og-description="$product->short_description"
    />
</head>

{{-- 3. Facade for full control --}}
@php($aeo = \Smking::forPath('/products/'.$product->slug))
@if ($aeo->isReady())
    <script type="application/ld+json">{!! json_encode($aeo->jsonLd) !!}</script>
    <title>{{ $aeo->seo?->title ?? $product->name }}</title>
@endif
```

The `<x-smking-meta />` component mirrors `getSmkingMetadata()` from `@smking/next` — call it inside `<head>` and it emits exactly the SEO tags the API has values for, falling back to the `fallback-*` props otherwise. Use it when you want SEO meta in your Blade layout but body injection from the middleware.

## Config (config/smking.php)

| Key | Default | Notes |
|-----|---------|-------|
| `api_key` | `env('SMKING_API_KEY')` | Publishable key from the dashboard |
| `base_url` | _(required, no default)_ | Set `SMKING_BASE_URL` to your smking deployment origin |
| `auto_inject` | `true` | Register middleware globally |
| `inject_in_tests` | `false` | When false (v0.7.3+ default), middleware short-circuits under `php artisan test` / Pest so feature tests don't time out against an unreachable backend. Set `SMKING_INJECT_IN_TESTS=true` in `.env.testing` for genuine integration tests |
| `only` / `except` | see file | Path filters (Laravel wildcard) |
| `inject.*` | all `true` | Toggle json_ld / meta_description / faq / summary / seo_title / og_title / og_description / og_image / canonical / markdown |
| `inject.visibility` | `sr_only` | Body-fragment visibility: `sr_only` (default, visually hidden), `visible` (raw, v0.5.x behavior), `noscript` |
| `cache.ttl` | `3600` | Seconds; `0` disables |
| `timeout` | `3` | HTTP timeout in seconds |

## How it works

1. Middleware runs after your response is built.
2. For each HTML `GET` 200, it calls `POST /api/v1/public/aeo` with the request path.
3. If smking has ready content, structured data + SEO meta go into `<head>`; FAQ + summary go before `</body>`.
4. **Always override** (v0.3.0+): every enabled SEO tag (`<title>`, `og:*`, `canonical`, `meta description`) gets written by smking. Any matching host markup is stripped first (attribute-order-insensitive) so the document only ever has one of each. To keep a tag under your control, set `config('smking.inject.{tag}', false)` or render it yourself.
5. Unknown paths are registered for background crawling — next request will serve content.
6. Responses are cached per path in Laravel's cache. Pending/error states fail open.
7. **Agent content negotiation** (v0.4.0+): when `Accept: text/markdown` is preferred over `text/html` (q-value-aware), the middleware fetches `/api/v1/public/md` and replaces the body with markdown. `Vary: Accept` is added so caches stay consistent. First-time misses fall through to HTML and trigger the same background crawl.
8. **Agent discovery** (v0.5.0+): every HTML response advertises the markdown alternate via `Link: <{url}>; rel="alternate"; type="text/markdown"` (RFC 8288). Appended to any existing Link headers; idempotent if you already wired your own.
9. **Visually-hidden body fragments by default** (v0.6.0+): auto-injected `summaryHtml` / `faqHtml` are wrapped in an inline-style sr-only `<div>` so they don't pollute SPA layouts where `</body>` injection lands outside `#app`. Microdata stays in the DOM (Googlebot reads it); JSON-LD in `<head>` is the primary AEO signal. Switch with `SMKING_INJECT_VISIBILITY=visible` if you want the v0.5.x behavior. The `<x-smking-aeo />` Blade component is unaffected — explicit placement is always rendered as you wrote it.

## Gradual rollout / A/B comparison

`config('smking.only')` is a strict whitelist — when non-empty, the middleware only runs on paths that match. Use it to roll out smking gradually, or to A/B-compare smking-enabled paths against untouched ones.

### Soft launch one URL

```php
// config/smking.php
'only' => ['products/widget'],
```

Now only `https://your-site.com/products/widget` gets smking-injected meta + JSON-LD. Every other page is untouched. Measure impact for a week before expanding.

### Expand to one section

```php
'only' => ['products/*'],
```

All product pages enabled, rest of site untouched. Continue measuring against control pages (homepage, blog, etc.).

### A/B comparison

```php
'only' => [
    'products/widget',   // Variant A — smking enabled
    'products/gizmo',    // Variant B — smking enabled
    // 'products/sprocket' — Control: NOT in `only`, no smking
],
```

Compare AEO score / search ranking / AI-citation share across the three pages over your measurement window.

### Full rollout

```php
'only' => [],   // empty == every HTML page (default behavior)
```

`only` patterns use Laravel's `Request::is()` syntax, identical to `except`. Combine both — `only` is checked first (must match), then `except` (must not match) — so you can whitelist `products/*` and blacklist `products/draft-*` simultaneously.

## Outage Runbook

When the smking SaaS is down or unreachable, the SDK fails open — your pages still render normally, just without smking-injected content. Three knobs you may want to know about:

### 0. Layered protection — single-flight + circuit breaker (v0.7.0+)

Two complementary defenses run on every cache miss:

**Single-flight cache lock** — When a path is uncached and traffic spikes, only ONE PHP-FPM worker calls smking upstream; others fail open immediately (return un-injected page). Per-path protection. Uses `Cache::lock()` (redis / memcached / database / array drivers; graceful fallback for stores without lock support).

**Per-surface circuit breaker** — Once any path hits a 5xx / transport error, a flag is set for `circuit_breaker_ttl` seconds (default 60). While the flag is present, every path on THAT surface short-circuits without touching the upstream. Protects against high-cardinality outage events (catalog spray, full-site crawler) where per-path cache wouldn't help — the second URL in the burst doesn't know the first one just failed. Auto half-open: when the flag expires the next request hits upstream; success closes the breaker, another failure trips it again. Disable with `SMKING_CIRCUIT_BREAKER=false` if your customer cache layer can't store namespace flags reliably.

Two independent breakers exist (since v0.7.0 round-4):

- HTML AEO injection (`/api/v1/public/aeo`, every page render) — `smking:circuit:aeo:{ns}`
- Markdown for agents (`/api/v1/public/md`, agent-only `Accept: text/markdown` clients) — `smking:circuit:md:{ns}`

A markdown outage no longer suppresses HTML injection: the agent surface is optional, and an issue isolated there should never affect the customer-facing render path. Both surfaces still rotate together when `(api_key, base_url)` changes.

### 1. Cache absorbs most outages automatically (v0.7.0+, refined in v0.10.0)

Four-tier cache TTL with adaptive backoff on errors:

| Status | TTL | Behavior |
|---|---|---|
| `ready` | 1 hour | Customer's cached AEO content keeps serving |
| `not_found` (4xx) | 60 sec | Backend audit catching up; first-launch products visible within ~1 min after crawl/generate completes |
| `pending` (202) | 15 sec | SaaS explicit "in-progress" signal — short cushion against hot-launch polling |
| `server_error` (5xx, DNS, TCP, timeout) | **30s → 5min → 30min → 24hr** | Adaptive backoff per consecutive failure (v0.10.0+) |

The `server_error` ladder is keyed by consecutive-failure count for each cache key independently. A first failure (typical of an install-time typo or transient network blip) caches for 30 seconds — auto-recovers without operator intervention once the underlying issue is fixed. Steady-state outage protection kicks in by failure #4 at the full 24hr fallback, preserving the FPM-pool-saturation defense that made the flat 24hr TTL necessary in v0.7.0.

A successful `ready` response resets the counter, so the next outage starts at 30s again. Customize the ladder via `cache.server_error_backoff` in `config/smking.php`, or set to `[]` to disable backoff and restore the pre-v0.10.0 flat 24hr behavior.

### 2. Tighten timeouts further if you're at scale

Default since v0.7.0: `connect_timeout=1s`, `timeout=1.5s`. For million-PV sites where every millisecond counts:

```dotenv
SMKING_CONNECT_TIMEOUT=0.5
SMKING_HTTP_TIMEOUT=1
```

### 3. Kill switch when SaaS is in trouble

Set in `.env` and clear config cache:

```dotenv
SMKING_AUTO_INJECT=false
```

Middleware still emits `X-Smking-Status` headers (so `curl -I` install verification works) but doesn't try to fetch any content. Reverts to original page entirely.

### 4. Recovering after SaaS comes back

Per-path:

```bash
php artisan smking:cache:purge /products/widget
```

This forgets both `smking:aeo:*` and `smking:md:*` cache for that path AND clears the per-surface circuit breakers so the next request actually re-fetches (no waiting for breaker TTL). Use this whenever you've fixed something upstream and want immediate recovery on a specific path.

Per WC product:

```bash
php artisan smking:cache:purge --product-id=42
```

Clears the AEO-surface entry for that product plus the AEO-surface circuit breaker.

For wholesale recovery (clears the whole app cache):

```bash
php artisan cache:clear
```

### 5. Inspecting circuit-breaker state (v0.7.1+)

When AEO content stops appearing in production, the breaker may be silently short-circuiting upstream calls. Check it without touching the cache:

```bash
php artisan smking:circuit:status
```

Sample output (any surface open → exit code 1 for scripted health checks):

```
smking circuit breaker status:

  aeo (HTML AEO injection): closed
       key: smking:circuit:aeo:abc123
  md  (markdown for agents): OPEN — re-check after configured TTL (60s)
       key: smking:circuit:md:abc123

Recovery: wait for TTL, or `php artisan smking:cache:purge <path>` / `--product-id=N` to force-clear.
```

The breaker also logs trip + close events through the configured `LoggerInterface`:

```
[warning] smking: circuit breaker tripped for aeo surface
  context: {"surface":"aeo","ttl_seconds":60,"key":"smking:circuit:aeo:..."}

[info] smking: circuit closed for aeo surface
  context: {"surface":"aeo"}
```

The trip log is rate-limited to one line per outage window (a million-request burst produces one log, not a million). The close log fires once on the first successful upstream call after recovery — implemented via an atomic tombstone pull, so concurrent recovery requests log at most once.

Wire your usual log → metric path (Datadog Logs / Sentry / etc.) to alert on either string when you want a paging trigger instead of a polling status check.

## Upgrading

This package is in `v0.x`. Per Composer's caret convention for pre-1.0 packages, **every minor bump (0.5 → 0.6, 0.6 → 0.7) is treated as breaking** — the constraint `"smking/laravel": "^0.6"` resolves to `>=0.6.0 <0.7.0` and `composer update` won't cross into 0.7.

### Cross-minor upgrade (e.g. 0.6 → 0.7)

Edit `composer.json` to bump the constraint, then update:

```bash
# 1. Bump constraint
composer require smking/laravel:^0.7

# 2. (optional) refresh published config — see docs/upgrading note below
php artisan vendor:publish --tag=smking-config --force
php artisan config:clear

# 3. Verify install
php artisan smking:doctor
```

`smking:doctor` (v0.6.3+) shows a "config schema drift" row that lists any new keys present in the package default but missing from your published `config/smking.php` — handy for deciding whether to re-publish.

### In-minor upgrade (patch, e.g. 0.6.1 → 0.6.2)

Patches stay in your existing `^0.X` range — `composer update` is enough:

```bash
composer update smking/laravel
```

### Deploying to production

Always commit `composer.lock` to your repo and use `composer install` (NOT `update`) on production deploys:

```bash
# CI / deploy script
composer install --no-dev --optimize-autoloader
```

`composer install` reads the lockfile and installs the exact versions you tested in staging. `composer update` re-resolves and may pull a release into prod that bypassed QA — especially risky while this package is `v0.x` with breaking minors. Always bump in dev, test in staging, then ship the lockfile.

See [CHANGELOG.md](CHANGELOG.md) for what each release changes.

## Requirements

- PHP 8.1+
- Laravel 10 / 11 / 12

## License

MIT
