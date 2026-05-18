# OpenSalesTax for Bagisto

> **v0.1.0-alpha.1.** Installable; passes its unit-test suite; not yet validated against a live Bagisto storefront. The live cart integration test happens in the orchestrator project's VM 916 once this repo lands.

A free, self-hostable [Bagisto](https://bagisto.com/) package that swaps Bagisto's flat tax-rate tables for the [OpenSalesTax engine](https://github.com/ejosterberg/opensalestax) on US-destination, USD checkouts. No per-transaction fees, no SaaS lock-in — merchants run both Bagisto and OpenSalesTax on their own infrastructure.

> **Tax calculations are provided as-is for convenience. The merchant is solely responsible for tax-collection accuracy and remittance to the appropriate jurisdictions. Verify against your state Department of Revenue before remitting.**

## What this package does

- Registers a Laravel listener on Bagisto's `checkout.cart.collect.totals.after` event so the OpenSalesTax engine computes destination-based tax for the cart at every totals recalculation.
- Falls back silently to Bagisto's built-in tax-rate tables when the destination is non-US, the currency is non-USD, the destination ZIP can't be resolved, or the engine is unreachable (default fail-soft behavior — configurable to fail-hard).
- Caches engine responses keyed by ZIP-5 for the configured TTL (default 24 hours) via Laravel's cache layer, so a busy storefront makes one engine call per ZIP per day rather than one per cart recompute.
- Exposes Composer / Laravel-native configuration via `config/opensalestax.php` (publishable) and standard env vars, with **SSRF defense** built into the URL validator (rejects private / loopback / link-local / CGNAT hosts unless the merchant explicitly opts in).

## What this package does NOT do

- File or remit tax (calculation only — the merchant remits)
- Validate addresses
- Handle non-USD currencies or non-US destinations (passes those through to Bagisto's built-in tax)
- Validate tax-exempt customer certificates against state DORs
- Ship with the engine bundled — point it at your own [OpenSalesTax engine](https://github.com/ejosterberg/opensalestax)
- Multi-vendor (Bagisto Marketplace) per-vendor tax allocation (v0.2 candidate)

## Requirements

| Component | Minimum | Tested with |
|---|---|---|
| PHP | 8.2 | 8.2, 8.3 |
| Bagisto | 2.0 | 2.3 |
| Laravel | 11.x | 11.x, 12.x |
| OpenSalesTax engine | 0.55.0 | 0.55.4 |

## Install

```bash
composer require ejosterberg/opensalestax-bagisto
php artisan vendor:publish --provider="OpenSalesTax\\Bagisto\\Providers\\OpenSalesTaxServiceProvider" --tag=config
```

The package's `OpenSalesTaxServiceProvider` is auto-discovered by Laravel — no manual registration needed.

## Configure

Edit `config/opensalestax.php` or set the env vars below:

| Setting | Env var | Default | Purpose |
|---|---|---|---|
| `base_url` | `OPENSALESTAX_BASE_URL` | (none) | Base URL of your OST engine, e.g. `https://ost.example.com` |
| `api_key` | `OPENSALESTAX_API_KEY` | (none) | Bearer token if your engine requires authentication. Use env-var storage; never commit. |
| `timeout` | `OPENSALESTAX_TIMEOUT` | `10` | HTTP timeout in seconds for engine requests. |
| `cache_ttl` | `OPENSALESTAX_CACHE_TTL` | `86400` | Cache TTL in seconds for engine responses, keyed by ZIP-5. |
| `fail_hard` | `OPENSALESTAX_FAIL_HARD` | `false` | When `true`, engine errors throw and surface to checkout. When `false` (default), engine errors fall back to Bagisto's built-in tax + log. |
| `allow_private_nets` | `OPENSALESTAX_ALLOW_PRIVATE_NETS` | `false` | When `true`, allows `base_url` to resolve to private / loopback / CGNAT hosts. Required when self-hosting OST on the same LAN as Bagisto. |
| `tls_verify` | `OPENSALESTAX_TLS_VERIFY` | `true` | Verify the engine's TLS certificate. Leave at `true` in production. |

Until `base_url` is set the package is inert — Bagisto's built-in tax calc handles every cart.

## How it works

1. Bagisto's checkout pipeline fires `checkout.cart.collect.totals.after` after totals collection.
2. Our `CartTotalsListener` checks the gate (engine configured? cart currency is USD? shipping country is US? destination has a 5-digit ZIP?). If any check fails, control returns silently to Bagisto's tax tables.
3. With gates green, the listener builds an OST engine payload from the cart's line items, calls `POST /v1/calculate` via the [PHP SDK](https://github.com/ejosterberg/opensalestax-php), and writes the resulting tax onto the cart's `tax_total` / `base_tax_total` columns.
4. The response (per ZIP-5) is cached for the configured TTL via Laravel's cache abstraction. Cache key: `ost:rate:{zip5}`.
5. On engine error (timeout, 5xx, malformed body), behavior depends on `fail_hard`: `false` (default) — log a warning, leave Bagisto's tax intact; `true` — throw, surface to checkout.

## Logging

Every engine interaction logs structured metadata (cart id, line count, HTTP status, RTT in milliseconds) via Laravel's default `Log` facade. **Customer addresses and full payloads are never logged.** The API key, when configured via env var, is held in process memory only — never written to logs.

## Security

See [`docs/SECURITY-REVIEW.md`](docs/SECURITY-REVIEW.md) for the v0.1 threat model and mitigation status.

To report a vulnerability privately, email **ejosterberg@gmail.com** — see [`SECURITY.md`](SECURITY.md). Don't open a public GitHub issue for security reports.

## Development

```bash
composer install
composer check     # phpunit + phpstan max + php-cs-fixer + composer audit
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch model, DCO sign-off, and the quality gate.

## Related projects

| Repo | What it is |
|---|---|
| [`ejosterberg/opensalestax`](https://github.com/ejosterberg/opensalestax) | The engine (Python + FastAPI) — the merchant runs an instance |
| [`ejosterberg/opensalestax-php`](https://github.com/ejosterberg/opensalestax-php) | The PHP SDK this package depends on |
| [`ejosterberg/opensalestax-magento`](https://github.com/ejosterberg/opensalestax-magento) | Magento 2 module — same engine, Magento storefront |
| [`ejosterberg/opensalestax-woocommerce`](https://github.com/ejosterberg/opensalestax-woocommerce) | WooCom (WooCommerce) plugin — same engine, WordPress storefront |

## License

Dual-licensed under your choice of [Apache-2.0](LICENSE-APACHE.txt) OR [GPL-2.0-or-later](LICENSE-GPL.txt). See [`LICENSE`](LICENSE).
