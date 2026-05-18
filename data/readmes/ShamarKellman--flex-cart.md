# FlexCart - A Flexible Shopping Cart Package for Laravel 12+

[![Latest Version on Packagist](https://img.shields.io/packagist/v/shamarkellman/flex-cart.svg?style=flat-square)](https://packagist.org/packages/shamarkellman/flex-cart)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/shamarkellman/flex-cart/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/shamarkellman/flex-cart/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/shamarkellman/flex-cart/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/shamarkellman/flex-cart/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/shamarkellman/flex-cart.svg?style=flat-square)](https://packagist.org/packages/shamarkellman/flex-cart)

FlexCart is a flexible shopping cart package for Laravel 12+ that provides comprehensive cart functionality including multiple storage backends, tax calculations, shipping management, coupon/discounts, and Money PHP integration.

## Features

- Multiple storage backends (session and database)
- Flexible coupon/discount system with multiple discount types
- Tax calculations with configurable rates
- Shipping address and cost management
- Comprehensive event system for cart lifecycle hooks
- Money PHP integration for accurate financial calculations
- Custom exception handling with detailed error messages

## Installation

You can install the package via composer:

```bash
composer require shamarkellman/flex-cart
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="flex-cart-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="flex-cart-config"
```

## Usage

### Basic Cart Operations

```php
use ShamarKellman\FlexCart\Facades\FlexCart;
use Money\Money;
use Money\Currency;

// Add product to cart
$product = Product::find(1);
$cartItem = FlexCart::addItem($product, 2);

// Add item with options (e.g., size, color)
$cartItemWithOptions = FlexCart::addItem($product, 1, [
    'size' => 'large',
    'color' => 'blue'
]);

// Update quantity
FlexCart::updateItem($cartItem->id, 3);

// Remove specific item
FlexCart::removeItem($cartItem->id);

// Clear entire cart
FlexCart::clear();
```

### Cart Information

```php
// Get all cart items
$items = FlexCart::items();

// Get specific item
$item = FlexCart::getItem($itemId);

// Count total items (sum of quantities)
$totalItems = FlexCart::count();

// Check if cart is empty
$isEmpty = FlexCart::isEmpty();

// Get cart totals
$subtotal = FlexCart::subtotal();      // Money object
$tax = FlexCart::tax();                // Money object
$shipping = FlexCart::shippingCost();  // Money object
$total = FlexCart::total();            // Money object

// Get raw amounts
echo $total->getAmount();              // '10000' (in cents)
echo $total->getCurrency()->getCode(); // 'USD'
```

### Coupon System

FlexCart includes a comprehensive coupon/discount system supporting multiple discount types.

#### Adding Coupons

```php
use ShamarKellman\FlexCart\Facades\FlexCart;
use ShamarKellman\FlexCart\Models\Coupon;

// Add a coupon to cart
$coupon = Coupon::where('code', 'SAVE20')->first();
$result = FlexCart::addCoupon($coupon);

// Check if coupon was added successfully
if ($result) {
    echo "Coupon applied!";
}

// Check if cart has a specific coupon
$hasCoupon = FlexCart::hasCoupon('SAVE20');

// Get coupon details
$coupon = FlexCart::getCoupon('SAVE20');
```

#### Removing Coupons

```php
// Remove a specific coupon
FlexCart::removeCoupon('SAVE20');

// Clear all coupons
FlexCart::clearCoupons();
```

#### Getting Discounts

```php
// Get general discount (products)
$generalDiscount = FlexCart::generalDiscount();

// Get shipping discount
$shippingDiscount = FlexCart::shippingDiscount();

// Get total discount
$totalDiscount = FlexCart::totalDiscount();

// Get subtotal after discounts
$subtotalWithCoupons = FlexCart::subtotalWithCoupons();

// Get final total (subtotal + shipping - discounts)
$total = FlexCart::total();
```

### Coupon Model

Create coupons in your database using the CouponFactory:

```php
use ShamarKellman\FlexCart\Models\Coupon;

// Fixed amount coupon ($20 off)
$coupon = Coupon::factory()->fixedAmount(20)->create([
    'code' => 'SAVE20',
    'is_stackable' => true,
]);

// Percentage coupon (10% off)
$coupon = Coupon::factory()->percentage(10)->create([
    'code' => 'PERCENT10',
    'is_stackable' => false,
]);

// Free shipping coupon
$coupon = Coupon::factory()->shipping(0)->create([
    'code' => 'FREESHIP',
]);

// Coupon with restrictions
$coupon = Coupon::factory()
    ->withMinimumAmount(50)      // $50 minimum
    ->withUsageLimit(100)        // 100 uses max
    ->expiresInDays(30)          // Expires in 30 days
    ->create([
        'code' => 'SPECIAL',
    ]);
```

#### Coupon Types

| Type | Description | Value Format |
|------|-------------|--------------|
| `TYPE_FIXED_AMOUNT` | Fixed discount on order total | Amount in cents |
| `TYPE_PERCENTAGE` | Percentage off order total | Percentage (0-100) |
| `TYPE_SHIPPING` | Free or discounted shipping | Amount in cents |

#### Coupon Features

- **Stackable coupons**: Allow multiple coupons to be applied
- **Usage limits**: Limit total number of uses
- **Minimum amount**: Require minimum order total
- **Product-specific**: Apply to specific products only
- **Exclusions**: Exclude specific products from discount
- **Expiration**: Set expiration dates
- **Activation dates**: Set when coupon becomes active

#### Coupon Events

```php
use ShamarKellman\FlexCart\Events\CouponApplied;
use ShamarKellman\FlexCart\Events\CouponRemoved;
use ShamarKellman\FlexCart\Events\CouponExpired;

Event::listen(CouponApplied::class, function ($event) {
    $coupon = $event->getCoupon();
    logger()->info('Coupon applied', ['code' => $coupon->getCode()]);
});

Event::listen(CouponRemoved::class, function ($event) {
    $coupon = $event->getCoupon();
    logger()->info('Coupon removed', ['code' => $coupon->getCode()]);
});

Event::listen(CouponExpired::class, function ($event) {
    $coupon = $event->getCoupon();
    logger()->info('Coupon expired', ['code' => $coupon->getCode()]);
});
```

### Shipping Management

```php
// Set shipping address
FlexCart::setShippingAddress([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'company' => 'Acme Corp', // optional
    'address_line_1' => '123 Main St',
    'address_line_2' => 'Apt 4B', // optional
    'city' => 'New York',
    'state' => 'NY',
    'postal_code' => '10001',
    'country' => 'US',
    'phone' => '+1-555-0123', // optional
    'email' => 'john@example.com', // optional
]);

// Set shipping cost
FlexCart::setShippingCost(new Money(1000, new Currency('USD'))); // $10.00

// Get shipping details
$shippingDetail = FlexCart::getShippingDetail();
echo $shippingDetail->first_name; // 'John'
echo $shippingDetail->country; // 'US'
```

### Cart Item Operations

```php
$cartItem = FlexCart::addItem($product, 2);

// Get item details
$quantity = $cartItem->getQuantity();
$unitPrice = $cartItem->getUnitPrice();
$totalPrice = $cartItem->getTotal();
$taxAmount = $cartItem->getTaxAmount();
$options = $cartItem->getOptions();
$buyableProduct = $cartItem->getBuyable();

// Modify item directly
$cartItem->setQuantity(5);
$cartItem->setOptions(['size' => 'XL', 'gift_wrap' => true]);
```

### Working with Different Currencies

```php
// Set default currency in config/flex-cart.php
'default_currency' => 'EUR',

// Or change currency dynamically
FlexCart::setShippingCost(new Money(1000, new Currency('EUR')));
```

### Advanced Usage Examples

```php
// Check if item exists before adding
if (!FlexCart::getItem($productId)) {
    FlexCart::addItem($product, 1);
}

// Add multiple items at once
$products = [
    ['product' => $product1, 'quantity' => 2, 'options' => ['size' => 'M']],
    ['product' => $product2, 'quantity' => 1, 'options' => ['color' => 'red']],
];

foreach ($products as $item) {
    FlexCart::addItem($item['product'], $item['quantity'], $item['options'] ?? []);
}

// Calculate totals with tax (if tax rate is configured)
$subtotal = FlexCart::subtotal();
$taxRate = config('flex-cart.tax_rate', 0);
$totalWithTax = FlexCart::total();

// Format money for display
$formatter = new \NumberFormatter('en_US', \NumberFormatter::CURRENCY);
echo $formatter->formatCurrency($total->getAmount() / 100, $total->getCurrency()->getCode());
// Output: $100.00
```

## Configuration

### Environment Variables

```env
# .env file
CART_DEFAULT_CURRENCY=USD
CART_TAX_RATE=8.25
CART_STORAGE_DRIVER=session
```

### Configuration File

After publishing the config file (`config/flex-cart.php`):

```php
<?php

return [
    // Default currency for all cart operations
    'default_currency' => env('CART_DEFAULT_CURRENCY', 'USD'),

    // Tax rate as percentage (e.g., 8.25 for 8.25%)
    'tax_rate' => env('CART_TAX_RATE', 0),

    // Storage configuration
    'storage' => [
        // Driver: 'session' or 'database'
        'driver' => env('CART_STORAGE_DRIVER', 'session'),

        // Session key for session storage
        'session_key' => 'shopping_cart',

        // Available storage drivers
        'drivers' => [
            'session' => \ShamarKellman\FlexCart\Storage\SessionStorage::class,
            'database' => \ShamarKellman\FlexCart\Storage\DatabaseStorage::class,
        ],
    ],

    // Custom model classes (if you want to extend them)
    'models' => [
        'cart' => \ShamarKellman\FlexCart\Models\Cart::class,
        'cart_item' => \ShamarKellman\FlexCart\Models\CartItem::class,
        'shipping_detail' => \ShamarKellman\FlexCart\Models\ShippingDetail::class,
    ],
];
```

### Making Models Buyable

To use your models with FlexCart, implement the `BuyableInterface`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use ShamarKellman\FlexCart\Contracts\BuyableInterface;
use Money\Money;
use Money\Currency;

class Product extends Model implements BuyableInterface
{
    // ... existing model code

    public function getCartItemIdentifier(): int|string
    {
        return $this->id;
    }

    public function getCartItemName(): string
    {
        return $this->name;
    }

    public function getPrice(): Money
    {
        // Assuming price is stored in cents in database
        return new Money($this->price_cents, new Currency('USD'));
        
        // Or if stored as decimal:
        // return new Money((int) ($this->price * 100), new Currency('USD'));
    }

    public function getCartItemOptions(): array
    {
        return [
            'size' => $this->size,
            'color' => $this->color,
            // Add any other relevant options
        ];
    }
}
```

## API Reference

### FlexCart Facade Methods

#### Cart Management
- `addItem(Model $buyable, int $quantity = 1, array $options = []): CartItemInterface`
- `updateItem(int|string $itemId, int $quantity): bool`
- `removeItem(int|string $itemId): bool`
- `clear(): void`

#### Cart Information
- `items(): Collection<CartItemInterface>`
- `getItem(int|string $itemId): ?CartItemInterface`
- `count(): int`
- `isEmpty(): bool`

#### Totals and Calculations
- `subtotal(): Money`
- `subtotalNet(): Money`
- `tax(): Money`
- `shippingCost(): Money`
- `total(): Money`

#### Coupon Methods
- `addCoupon(CouponInterface $coupon): bool`
- `removeCoupon(string $code): bool`
- `hasCoupon(string $code): bool`
- `getCoupon(string $code): ?CouponInterface`
- `getCoupons(): Collection`
- `clearCoupons(): void`
- `generalDiscount(): Money`
- `shippingDiscount(): Money`
- `totalDiscount(): Money`
- `subtotalWithCoupons(): Money`
- `couponDiscount(): Money`

#### Shipping
- `setShippingAddress(array $address): void`
- `setShippingCost(Money $cost): void`
- `getShippingDetail(): ?ShippingDetail`

### CartItemInterface Methods

- `getQuantity(): int`
- `getUnitPrice(): Money`
- `getTotal(): Money`
- `getTaxAmount(): Money`
- `getOptions(): array`
- `setQuantity(int $quantity): void`
- `setOptions(array $options): void`
- `getBuyable(): Model`

### BuyableInterface Methods

- `getCartItemIdentifier(): int|string`
- `getCartItemName(): string`
- `getPrice(): Money`
- `getCartItemOptions(): array`

## Events

FlexCart dispatches events for various cart operations, allowing you to hook into cart lifecycle events:

### Cart Events

#### `ShamarKellman\FlexCart\Events\ItemAddedToCart`
Fired when an item is added to the cart for the first time.

```php
Event::listen(ItemAddedToCart::class, function ($event) {
    $cartItem = $event->getCartItem();
    $quantity = $event->getAddedQuantity();
    $buyable = $event->getBuyable();
    $options = $event->getOptions();
});
```

#### `ShamarKellman\FlexCart\Events\QuantityUpdated`
Fired when an item's quantity is modified.

```php
Event::listen(QuantityUpdated::class, function ($event) {
    $cartItem = $event->getCartItem();
    $oldQuantity = $event->getOldQuantity();
    $newQuantity = $event->getNewQuantity();
    $isIncrease = $event->isIncrease();
    $isDecrease = $event->isDecrease();
});
```

#### `ShamarKellman\FlexCart\Events\ItemRemovedFromCart`
Fired when an item is removed from the cart.

```php
Event::listen(ItemRemovedFromCart::class, function ($event) {
    $cartItem = $event->getCartItem();
    $removedQuantity = $event->getRemovedQuantity();
    $unitPrice = $event->getUnitPrice();
});
```

#### `ShamarKellman\FlexCart\Events\CartCleared`
Fired when the entire cart is cleared.

```php
Event::listen(CartCleared::class, function ($event) {
    $clearedItems = $event->getClearedItems();
    $itemCount = $event->getClearedItemCount();
    $totalQuantity = $event->getClearedTotalQuantity();
    $subtotal = $event->getClearedSubtotal();
});
```

#### `ShamarKellman\FlexCart\Events\ShippingCostSet`
Fired when shipping cost is set or changed.

```php
Event::listen(ShippingCostSet::class, function ($event) {
    $oldCost = $event->getOldCost();
    $newCost = $event->getNewCost();
    $difference = $event->getDifference();
    $hasIncreased = $event->hasIncreased();
    $hasDecreased = $event->hasDecreased();
});
```

#### `ShamarKellman\FlexCart\Events\ShippingAddressSet`
Fired when shipping address is set or changed.

```php
Event::listen(ShippingAddressSet::class, function ($event) {
    $oldAddress = $event->getOldAddress();
    $newAddress = $event->getNewAddress();
    $isFirstAddress = $event->isFirstAddress();
    $hasChanged = $event->hasChanged();
    $country = $event->getCountry();
    $postalCode = $event->getPostalCode();
});
```

### Coupon Events

#### `ShamarKellman\FlexCart\Events\CouponApplied`
Fired when a coupon is applied to the cart.

#### `ShamarKellman\FlexCart\Events\CouponRemoved`
Fired when a coupon is removed from the cart.

#### `ShamarKellman\FlexCart\Events\CouponExpired`
Fired when a coupon expires.

## Storage Backends

### Session Storage (Default)
- Stores cart data in Laravel sessions
- Perfect for guest carts
- Automatically cleaned when session expires
- No database overhead

### Database Storage
- Persists carts across sessions
- Supports user authentication integration
- Enables cart analytics and recovery
- Requires published migrations

To use database storage:

```php
// In config/flex-cart.php
'storage' => [
    'driver' => 'database',
    // ...
],
```

Don't forget to publish and run the migrations:

```bash
php artisan vendor:publish --tag="flex-cart-migrations"
php artisan migrate
```

## Testing

```bash
composer test
```

## Troubleshooting

### Common Issues

#### "Buyable model must implement BuyableInterface"
Make sure your model implements the `BuyableInterface` and all required methods.

#### Cart items not persisting
Check your storage driver configuration. For database storage, ensure migrations are published and run.

#### Tax calculations seem incorrect
Verify your tax rate configuration. The rate should be a percentage (e.g., 8.25 for 8.25%).

#### Money currency mismatch
Ensure all Money objects use the same currency, or configure the default currency properly.

### Debug Mode

To debug cart operations, you can temporarily access the cart instance:

```php
$cart = app(\ShamarKellman\FlexCart\FlexCart::class);
dd($cart->items(), $cart->total());
```

## Performance Considerations

- Use session storage for guest carts to reduce database load
- Implement cart cleanup jobs for abandoned carts
- Consider Redis for session storage in production
- Add indexes to the database tables (included in migrations)

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Shamar Kellman](https://github.com/shamarkellman)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
