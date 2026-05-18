# Advanced E-commerce Toolkit for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jmrashed/ecommerce.svg?style=flat-square)](https://packagist.org/packages/jmrashed/ecommerce)
[![Total Downloads](https://img.shields.io/packagist/dt/jmrashed/ecommerce.svg?style=flat-square)](https://packagist.org/packages/jmrashed/ecommerce)
[![PHP Version](https://img.shields.io/packagist/php-v/jmrashed/ecommerce.svg?style=flat-square)](https://packagist.org/packages/jmrashed/ecommerce)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%2C11%2C12%2C13-green.svg?style=flat-square)](https://laravel.com)
[![License](https://img.shields.io/packagist/l/jmrashed/ecommerce.svg?style=flat-square)](LICENSE)

## Introduction

The **Advanced E-commerce Toolkit** is a comprehensive Laravel package that provides everything needed to build a full-featured online store. It includes product catalog management (with variants/attributes), shopping cart, wishlist, checkout flow, Stripe/PayPal payments, order management, customer dashboards, admin panel, API endpoints, inventory tracking, coupons, reviews, shipping zones, loyalty points, and more.

Key benefits:
- Production-ready with migrations, factories, seeders, tests.
- Modular services (CartService, OrderService, PaymentService).
- Responsive Blade views for frontend + API support.
- Easy installation via Artisan commands.

Perfect for Laravel developers building SaaS, marketplaces, or custom stores.

## Requirements

| Requirement | Version |
|-------------|---------|
| PHP | ^8.2 |
| Laravel | ^10.0 \|^11.0 \|^12.0 \|^13.0 |
| Laravel Sanctum | ^3.0 \|^4.0 |
| darkaonline/l5-swagger | ^8.5 \|^9.0 \|^10.0 |

**Optional (suggested)**:
- `stripe/stripe-php` for Stripe payments.

## Installation

1. **Install via Composer**:
   ```bash
   composer require jmrashed/ecommerce
   ```

2. **Install package** (registers provider, publishes assets):
   ```bash
   php artisan ecommerce:install
   ```
   Or manually:
   ```bash
   php artisan vendor:publish --provider=\"Jmrashed\\Ecommerce\\EcommerceServiceProvider\" --tag=ecommerce-config
   php artisan vendor:publish --tag=ecommerce-views
   php artisan vendor:publish --tag=ecommerce-assets
   ```

3. **Run migrations**:
   ```bash
   php artisan migrate
   ```

4. **(Optional) Seed demo data**:
   ```bash
   php artisan ecommerce:seed
   ```

## Configuration

Copy `config/ecommerce.php` and update `.env`:

```env
# Payments
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx

# Store
ECOMMERCE_CURRENCY=USD
ECOMMERCE_TAX_RATE=0.08
ECOMMERCE_DEFAULT_SHIPPING=5.00

# Other (full list in config/ecommerce.php)
```

## Usage Examples

### Products & Cart
```php
use Jmrashed\Ecommerce\Services\CartService;
use Jmrashed\Ecommerce\Models\Product;

// Add to cart
$cartService = app(CartService::class);
$cartService->add(1, 2); // product ID, quantity

// Totals with tax/shipping
$total = $cartService->getTotal();
$tax = $cartService->calculateTax($subtotal);
```

### Checkout & Orders
```php
use Jmrashed\Ecommerce\Services\OrderService;

// Create order from cart
$order = $orderService->createFromCart($userId, $address);
```

### Payments
```php
use Jmrashed\Ecommerce\Services\PaymentService;

$paymentService = app(PaymentService::class);
$payment = $paymentService->processStripe($order, $token);
```

Full API: `/api/ecommerce/products`, `/api/ecommerce/cart`, etc.

## Publishing Assets
```
php artisan vendor:publish --tag=ecommerce-views    # Blade templates
php artisan vendor:publish --tag=ecommerce-assets   # CSS/JS
```

## Key Features Tables

### Models
| Model | Purpose |
|-------|---------|
| Product | Catalog with images, variants, attributes |
| Category/Brand/Tag | Organization |
| CartItem/Wishlist | Session-based |
| Order/OrderItem | Full lifecycle |
| Payment/Refund | Gateways |
| Customer/Address | Accounts |
| Review/Coupon | Engagement |

### Services
| Service | Features |
|---------|----------|
| CartService | Add/remove, totals, tax/shipping calc |
| OrderService | Create, status update |
| PaymentService | Stripe/PayPal/COD |
| ProductService | Search/filter |

### Routes
**Web**: `/products`, `/cart`, `/checkout`, `/customer/*`, `/admin/ecommerce/*`
**API**: `/api/ecommerce/*` (auth/products/cart/orders/payments)

## Testing
```bash
composer test                          # All tests
composer test:unit                     # Unit
composer test:feature                  # Feature
composer test:coverage                 # Coverage report
```
Scripts use `./run-tests.sh`.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security
Report to [SECURITY.md](SECURITY.md) or jmrashed@gmail.com.

## Changelog
[CHANGELOG.md](CHANGELOG.md).

## License
MIT. See [LICENSE](LICENSE).

---
⭐ &nbsp; Star on [GitHub](https://github.com/jmrashed/ecommerce)

