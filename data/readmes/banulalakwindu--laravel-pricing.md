# Laravel Pricing (`banulakwin/laravel-pricing`)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/banulakwin/laravel-pricing.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-pricing)
[![Tests](https://github.com/banulalakwindu/laravel-pricing/actions/workflows/tests.yml/badge.svg)](https://github.com/banulalakwindu/laravel-pricing/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/banulakwin/laravel-pricing.svg?style=flat-square)](https://packagist.org/packages/banulakwin/laravel-pricing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Portable Laravel package: a small **rule-based pricing engine** with **config toggles**, **injectable coupon validation**, and defaults for **coupon (percent)**, **tax**, and **flat shipping**.

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0|^12.0|^13.0`

---

## Installation

Registration is automatic via Composer `extra.laravel.providers`:

- `Banulakwin\Pricing\PricingServiceProvider`

Optional facade alias: `Pricing` → `Banulakwin\Pricing\Facades\Pricing`.

Publish configuration (optional):

```bash
php artisan vendor:publish --tag=pricing-config
```

Publish migrations (optional):

```bash
php artisan vendor:publish --tag=pricing-migrations
php artisan migrate
```

---

## Configuration

| Config key | Purpose |
|------------|---------|
| `pricing.rules` | Booleans: `coupon`, `tax`, `shipping` (your app branches when building the engine). |
| `pricing.user_model` | Class string for the user model, used for coupon user restrictions and first-time validation. |
| `pricing.user_orders_relation` | Method name on the user model (e.g., `orders`) to verify `first_time_only` coupon eligibility. |
| `pricing.tax.rate` | Default tax rate for `TaxRule` (overridable in constructor). |
| `pricing.shipping.flat` | Default flat shipping for `ShippingRule` (overridable in constructor). |
| `pricing.auto_rules` | Optional list of rule class names to resolve with `app($class)` and attach to the engine. |

Environment: `PRICING_TAX_RATE`, `PRICING_SHIPPING_FLAT` (see `config/pricing.php`).

---

## Usage

### Basic Pricing

```php
use Banulakwin\Pricing\Facades\Pricing;
use Banulakwin\Pricing\Rules\CouponRule;
use Banulakwin\Pricing\Rules\ShippingRule;
use Banulakwin\Pricing\Rules\TaxRule;

$engine = Pricing::engine();
// or: pricing()->engine();

$engine
    ->addRule(new CouponRule(['type' => 'percent', 'value' => 10, 'items' => [], 'users' => []]))
    ->addRule(new TaxRule)
    ->addRule(new ShippingRule);

$context = $engine->calculate($items, ['user_id' => auth()->id()]);

echo $context->subtotal;   // 250.00
echo $context->discount;   // 25.00
echo $context->tax;        // 22.50
echo $context->shipping;   // 10.00
echo $context->total;      // 257.50
```

### Line Item Format

```php
$items = [
    ['price' => 100, 'qty' => 2, 'type' => 'product', 'id' => 1],
    ['price' => 50, 'qty' => 1, 'type' => 'product', 'id' => 2],
];
```

### Conditional Rule Registration

```php
$rules = config('pricing.rules', []);
$engine = pricing()->engine();

if ($rules['coupon'] ?? false) {
    $engine->addRule(new CouponRule($coupon, ['couponable_type' => 'type', 'couponable_id' => 'id']));
}
if ($rules['tax'] ?? false) {
    $engine->addRule(new TaxRule);
}
if ($rules['shipping'] ?? false) {
    $engine->addRule(new ShippingRule);
}

$result = $engine->calculate($items, ['user_id' => auth()->id()]);
```

---

## Architecture

### Engine Flow

1. `calculate()` builds `PriceContext`, sets `subtotal` / initial `total` from line items (`price` × `qty`).
2. Each registered rule mutates `discount`, `tax`, `shipping`, and `total` in order.

**Rule order matters** — compose rules explicitly in your app.

### Contracts

- `Banulakwin\Pricing\Contracts\PriceRule` — `apply(PriceContext $context): void`
- `Banulakwin\Pricing\Contracts\RuleValidator` — `validate(PriceContext $context, array $data): bool` (optional for `CouponRule`)

---

## Coupon Types

### Global Coupon

Applies to all items in the cart (empty `items` relation).

### Targeted Coupon

Applies only to specific items via `coupon_items` pivot table.

### User-Restricted Coupon

Only redeemable by specific users via `coupon_users` pivot table.

### First-Time Only Coupon

Validates that the user has no prior orders via the configured `user_orders_relation`.

---

## Testing

```bash
composer test          # Run PHPUnit
composer pint          # Fix code style
composer phpstan       # Static analysis
composer quality       # Run all (pint + phpstan + test)
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Run `composer quality` to ensure tests and style pass
4. Commit and push
5. Open a pull request

---

## Package layout (reference)

```
src/
  PricingServiceProvider.php
  helpers.php
  Contracts/
    PriceRule.php
    RuleValidator.php
  Engine/
    PriceContext.php
    PricingEngine.php
  Facades/
    Pricing.php
  Managers/
    PricingManager.php
  Models/
    Coupon.php
    CouponItem.php
    CouponUser.php
  Rules/
    CouponRule.php
    ShippingRule.php
    TaxRule.php
config/
  pricing.php
database/
  migrations/
    2026_05_11_000000_create_coupons_table.php
    2026_05_11_000001_create_coupon_items_table.php
    2026_05_11_000002_create_coupon_users_table.php
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
