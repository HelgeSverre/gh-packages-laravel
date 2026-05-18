<p align="center">
    <a href="https://gp247.net"><img src="https://static.gp247.net/logo/logo.png" height="100"></a>
</p>
<p align="center">Free e-commerce platform for businesses<br>
    <code><b>composer require GP247/Shop</b></code></p>

<p align="center">
<a href="https://packagist.org/packages/GP247/Shop"><img src="https://poser.pugx.org/GP247/Shop/d/total.svg" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/GP247/Shop"><img src="https://poser.pugx.org/GP247/Shop/v/stable.svg" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/GP247/Shop"><img src="https://poser.pugx.org/GP247/Shop/license.svg" alt="License"></a>
<a href="https://deepwiki.com/gp247net/shop"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

## Introduction

GP247/Shop is a core package in the GP247 ecosystem that turns your GP247 site into a full-featured online store. It provides comprehensive e-commerce functionality and inherits all GP247 ecosystem features.

## Key Features

### E-commerce Features
- Product Management
  - Product categories and attributes
  - Product variants and options
  - Inventory management
  - Bulk import/export
- Order Management
  - Order processing and tracking
  - Multiple payment gateways
  - Shipping methods integration
  - Order status management
- Customer Management
  - Customer profiles and accounts
  - Address management
  - Order history
  - Customer groups and discounts
- Marketing Tools
  - Promotions and discounts
  - Coupon management
  - Newsletter integration
  - Product reviews and ratings
- Shopping Features
  - Shopping cart
  - Wishlist
  - Product comparison
  - Recently viewed products
- Multi-vendor Support
  - Vendor dashboard
  - Commission management
  - Vendor product management
  - Vendor order tracking

### GP247 Ecosystem Features
- Page content management
- Flexible template system
- Extensible plugin system
- Navigation and link management
- Integrated contact and subscription forms
- Multi-language support
- SEO optimization
- Responsive design
- Security features
- Backup and restore

## Installation

### Option 1: New installation with GP247 CMS
1. Install gp247/cms (includes Laravel, GP247/Core, GP247/Front)

>`composer create-project gp247/cms`

2. Install gp247/shop package

>`composer require gp247/shop`

3. Register the service provider in `bootstrap/providers.php` (add at the end of the array)
```php
return [
    // ... existing providers
    GP247\Shop\ShopServiceProvider::class,
];
```

4. Install and create sample data

>`php artisan gp247:shop-install`

>`php artisan gp247:shop-sample`

### Option 2: Use S-Cart source code
S-Cart already includes all the necessary components. See the full details at the [GitHub repository](https://github.com/gp247net/s-cart).

1. Create the project

>`composer create-project gp247/s-cart`

2. Install sample data

>`php artisan sc:install`

>`php artisan sc:sample`


<img src="https://static.s-cart.org/guide/use/common/shop.jpg">
<img src="https://static.s-cart.org/guide/use/common/dashboard.jpg">

## Customization

### Customize Admin Views
To customize admin views, run:
>`php artisan vendor:publish --tag=gp247:view-shop-admin`

The views will be published to `resources/views/vendor/gp247-shop-admin`.

### Customize Front Views
To customize and update front views, run:

>`php artisan vendor:publish --tag=gp247:view-shop-admin`

The views will be stored in `app/GP247/Templates/Default`.

If you are not using the `Default` template, manually copy the views from `vendor/gp247/shop/Views/front` to your template directory.

## Documentation
- GP247 documentation: [https://gp247.net/en/docs](https://gp247.net/en/docs)

## License
The GP247/Shop is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
