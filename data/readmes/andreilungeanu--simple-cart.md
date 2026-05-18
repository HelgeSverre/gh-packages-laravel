# Simple Cart Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/andreilungeanu/simple-cart.svg?style=flat-square)](https://packagist.org/packages/andreilungeanu/simple-cart)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/andreilungeanu/simple-cart/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/andreilungeanu/simple-cart/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/andreilungeanu/simple-cart/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/andreilungeanu/simple-cart/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/andreilungeanu/simple-cart.svg?style=flat-square)](https://packagist.org/packages/andreilungeanu/simple-cart)

**Modern Laravel shopping cart package with clean architecture**

> **📖 For detailed documentation, examples, and advanced usage, see [DOCUMENTATION.md](DOCUMENTATION.md)**


## 🎯 Features
- ✅ **Event-Driven Design** - Comprehensive listeners for cart lifecycle events
- ✅ **Advanced Calculations** - Dynamic tax system, flexible shipping, flexible discount system (fixed, percentage, free shipping with conditional logic)
- ✅ **Multiple Cart Instances** - Proper user/session isolation and state management
- ✅ **Service-Based API** - Clean service layer for cart operations
- ✅ **Database Persistence** - Reliable storage with automatic expiration handling


## 📦 Installation

Install via Composer:
```bash
composer require andreilungeanu/simple-cart
```

Publish and run migrations:
```bash
php artisan vendor:publish --tag="simple-cart-migrations"
php artisan migrate
```

Optionally publish the configuration:
```bash
php artisan vendor:publish --tag="simple-cart-config"
```

## 🚀 Quick Start

### Basic Usage

```php
use AndreiLungeanu\SimpleCart\Facades\Cart;

// Create cart for user
$cart = Cart::create(userId: 123);

// Add items to cart
Cart::addItem($cart, [
    'product_id' => 'prod_1',
    'name' => 'Gaming Laptop', 
    'price' => 1299.99,
    'quantity' => 1,
    'category' => 'electronics'
]);

Cart::addItem($cart, [
    'product_id' => 'prod_2',
    'name' => 'Wireless Mouse',
    'price' => 25.50,
    'quantity' => 2
]);

// Apply tax
Cart::applyTax($cart, [
    'code' => 'VAT_UK',
    'rate' => 0.20,
    'apply_to_shipping' => true
]);

// Apply discount
Cart::applyDiscount($cart, [
    'code' => 'SAVE50',
    'type' => 'fixed',
    'value' => 50,
    'conditions' => ['minimum_amount' => 100]
]);

// Apply shipping
Cart::applyShipping($cart, [
    'method_name' => 'Express Shipping',
    'cost' => 15.99,
    'carrier' => 'UPS'
]);

// Get calculations
$subtotal = Cart::calculateSubtotal($cart);    // 1350.99
$shipping = Cart::calculateShipping($cart);    // 15.99 (or 0 if free shipping)
$tax = Cart::calculateTax($cart);              // Based on applied tax config
$total = Cart::calculateTotal($cart);          // Final total with all calculations

echo "Final Total: $" . $total;
```

### Cart Summary

```php
// Get complete cart overview
$summary = Cart::getCartSummary($cart);
/*
[
    'id' => 'cart-uuid',
    'item_count' => 3,
    'subtotal' => 1350.99,
    'shipping' => 15.99,
    'tax' => 270.20,
    'discounts' => 50.00,
    'total' => 1586.18,
    'status' => 'active',
    'expires_at' => '2025-10-07T12:00:00.000000Z'
]
*/
```

### Cart merge stratery on login

When a user logs in and both a guest session cart and a user cart exist, you can control behavior via `login_cart_strategy` (env: `CART_ON_LOGIN_CART_STRATEGY`). Options: `merge` (default), `guest`, `user`.

For details, see the documentation section “Cart Merge Strategy on Login”.


## 🔧 Key Features Overview

### Dynamic Tax System
- **Priority-based rates**: Item-specific > Category > Type > Default
- **Flexible conditions**: Support for any tax scenario
- **API integration ready**: Perfect for external tax services

### Advanced Discounts
- **Multiple types**: Percentage, fixed amount, free shipping
- **Conditional logic**: Minimum amounts, item requirements, categories
- **Stacking support**: Configure multiple discount behavior

### Flexible Shipping
- **Dynamic rates**: Your app provides shipping data
- **Free shipping**: Threshold-based or discount-based
- **Carrier integration**: Store any shipping method data

### Event-Driven Architecture
All cart operations dispatch events for:
- Analytics tracking
- Inventory management  
- Cache invalidation
- Custom business logic

## 📖 Complete Documentation

For comprehensive documentation including:
- **Detailed API reference** with all methods and parameters
- **Advanced tax scenarios** (EU VAT, US State tax, API integration)
- **Conditional discount patterns** (percentage, fixed amount, free shipping; quantity/amount conditions)
- **Event handling examples** (analytics, inventory, notifications)
- **Performance optimization** tips and caching strategies
- **Security best practices** and error handling
- **Complete usage examples** for real-world scenarios

**👉 See [DOCUMENTATION.md](DOCUMENTATION.md)**

## ⚡ Configuration

Basic configuration in `config/simple-cart.php`:

```php
return [
    'storage' => [
        'ttl_days' => 30,              // Cart expiration
    ],
    'shipping' => [
        'free_shipping_threshold' => 100.00,  // Free shipping over $100
    ],
    'discounts' => [
        'allow_stacking' => false,     // Allow multiple discount codes
        'max_discount_codes' => 3,     // Maximum discount codes per cart
    ],
];
```

## 🧹 Maintenance

Clean up expired carts:
```bash
# Manual cleanup
php artisan simple-cart:cleanup

# Scheduled cleanup (add to Kernel.php)
$schedule->command('simple-cart:cleanup --force')->daily();
```

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

**Need help?** Check the [complete documentation](DOCUMENTATION.md) or create an issue on GitHub.
