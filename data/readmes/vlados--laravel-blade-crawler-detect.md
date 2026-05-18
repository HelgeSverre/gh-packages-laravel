# Laravel Blade Crawler Detect

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vlados/laravel-blade-crawler-detect.svg?style=flat-square)](https://packagist.org/packages/vlados/laravel-blade-crawler-detect)
[![Total Downloads](https://img.shields.io/packagist/dt/vlados/laravel-blade-crawler-detect.svg?style=flat-square)](https://packagist.org/packages/vlados/laravel-blade-crawler-detect)
[![PHP Version Require](https://img.shields.io/packagist/php-v/vlados/laravel-blade-crawler-detect.svg?style=flat-square)](https://packagist.org/packages/vlados/laravel-blade-crawler-detect)
[![License](https://img.shields.io/packagist/l/vlados/laravel-blade-crawler-detect.svg?style=flat-square)](LICENSE.md)

**Two Blade directives that boost your Lighthouse and PageSpeed scores without changing a thing for real users.**

Wrap your cookie banner, chat widget, analytics scripts, video embeds and other heavy chrome in `@user ... @enduser`. Bots like Googlebot, Lighthouse and PageSpeed will skip it entirely; humans see the same experience as before.

```blade
@user
    <script src="https://heavy-chat-widget.com/loader.js" async></script>
    <cookie-banner></cookie-banner>
@enduser
```

Result: lighter HTML for crawlers, better Core Web Vitals, more crawl budget spent on the content that actually matters — and zero JS or middleware changes.

---

## Why developers reach for this

- **Better Lighthouse / PageSpeed scores.** Audit tools render the page like a low-power phone. Strip the widgets they don't need and the score climbs.
- **Better Core Web Vitals.** LCP, INP and CLS all benefit when crawlers stop pulling in chat libraries and consent banners.
- **More crawl budget for real content.** Googlebot fetches less JS, indexes more pages.
- **One-line wrap.** No middleware, no service container plumbing, no view composers — just Blade.
- **Octane-safe.** Reads the user agent per request, so long-running workers don't serve stale data.
- **ReDoS-hardened.** User-agent input is clamped before any regex runs.
- **Up to date.** Built on [`jaybizzle/crawler-detect`](https://github.com/JayBizzle/Crawler-Detect) (thousands of bots, regularly updated) plus Lighthouse and PageSpeed out of the box.

## Install

```bash
composer require vlados/laravel-blade-crawler-detect
```

That's it — the service provider auto-registers. No config file, no migrations, no env vars.

**Requires** PHP 8.1+ and Laravel 10, 11, 12 or 13.

## The two directives

### `@user` — render only for humans

Anything that hurts your audit score, is invisible to bots anyway, or just doesn't need to ship to crawlers.

```blade
{{-- Cookie / consent banners --}}
@user
    <x-cookie-consent />
@enduser

{{-- Chat widgets, support bubbles --}}
@user
    <script src="https://widget.intercom.io/widget/{{ config('services.intercom.id') }}"></script>
@enduser

{{-- Heavy analytics / tag managers --}}
@user
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
@enduser

{{-- Lazy-mounted Vue / Livewire / Alpine widgets --}}
@user
    <livewire:product-recommendations :product="$product" />
@enduser
```

### `@unlessuser` — render only for crawlers

Server-render the SEO-friendly equivalent of something you ship as JS to humans.

```blade
{{-- Humans get the interactive gallery --}}
@user
    <product-gallery :images="{{ $product->images->toJson() }}" />
@enduser

{{-- Crawlers get plain, indexable images --}}
@unlessuser
    @foreach ($product->images as $image)
        <img src="{{ $image->url }}" alt="{{ $image->alt }}" loading="lazy">
    @endforeach
@enduser
```

## Real-world wins

| Wrap this in `@user` | Why it helps |
|---|---|
| Cookie consent banner | Removes ~200ms LCP delay on Lighthouse |
| Intercom / Drift / Zendesk widget | Removes 100-300KB of third-party JS |
| Google Tag Manager / Analytics | Removes blocking script + network round-trip |
| Optimizely / VWO / experimentation SDKs | Removes render-blocking script |
| Hotjar / FullStory / session recording | Removes 50-150KB of third-party JS |
| YouTube / Vimeo iframe embeds | Removes a heavy iframe + its JS |
| Mapbox / Google Maps iframes | Removes a heavy iframe + its tile fetches |
| Carousel / slider libraries | Removes JS + CSS that crawlers don't render |
| Chat triggers, modal openers | Removes interactive chrome bots can't click |

## What "crawler" means

Detection is delegated to [`jaybizzle/crawler-detect`](https://github.com/JayBizzle/Crawler-Detect), a battle-tested PHP library that ships a regex covering thousands of bots — Googlebot, Bingbot, DuckDuckBot, AhrefsBot, SemrushBot, Applebot, and so on.

This package additionally treats these as crawlers, since they typically run as audits rather than real visits:

- `Chrome-Lighthouse`
- `Google Page Speed`

Want to add your own? You can swap or wrap the `CrawlerDetect` instance through Laravel's container.

## Performance

The crawler regex is compiled **once per process** (so Octane workers compile it at boot, traditional FPM workers compile it on first hit). Each render only does:

1. One `substr` to clamp the UA to 2KB.
2. One `preg_replace` for exclusions.
3. One `preg_match` against the compiled crawler pattern.

No DB queries, no cache lookups, no allocations beyond the strings above.

## Octane / Swoole / RoadRunner

Safe by design. The user agent is read from the current request **inside** the directive's closure, so long-running workers always see the active request's UA — never a stale one cached at boot.

## When NOT to use this

This package is a tool for hiding things crawlers don't need (heavy widgets, third-party scripts, modal chrome). It is **not** a tool for showing crawlers different *content* than you show users — that's [cloaking](https://developers.google.com/search/docs/essentials/spam-policies#cloaking) under Google's spam policies and can earn a manual penalty. Use `@unlessuser` for SSR-equivalents of things you JS-render for humans, not for keyword stuffing.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md).

## Contributing

Please see [CONTRIBUTING](https://github.com/vlados/.github/blob/main/CONTRIBUTING.md).

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Vladislav Stoitsov](https://github.com/vlados)
- [`jaybizzle/crawler-detect`](https://github.com/JayBizzle/Crawler-Detect) — the regex behind this package
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
