# Laravel Cart

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hnooz/laravel-shopping-cart.svg?style=flat-square)](https://packagist.org/packages/hnooz/laravel-shopping-cart)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/hnooz/laravel-shooping-cart/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/hnooz/laravel-shopping-cart/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/hnooz/laravel-shopping-cart/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/hnooz/laravel-shopping-cart/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/hnooz/laravel-shooping-cart.svg?style=flat-square)](https://packagist.org/packages/hnooz/laravel-shopping-cart)

A flexible and easy-to-use Laravel shopping cart package that supports both database and session storage. Perfect for e-commerce applications that need to handle both guest and authenticated user shopping experiences.

## Features

- **Flexible Storage**: Database, session, or hybrid storage options
- **Multi-User Support**: Seamlessly handles guest and authenticated users
- **Easy-to-Use Facade**: Simple, intuitive API
- **Item Management**: Add, remove, increase/decrease quantities
- **Calculations**: Automatic totals and item counts
- **Well Tested**: Comprehensive test coverage with Pest
- **Laravel 12 Ready**: Built for the latest Laravel version
- **Clean Code**: Uses Rector and Pint for code quality

## Installation

You can install the package via composer:

```bash
composer require hnooz/laravel-shopping-cart
```

### Publish and Run Migrations

Publish the migration file and run migrations:

```bash
php artisan vendor:publish --tag="laravel-cart-migrations"
php artisan migrate
```

### Publish Configuration (Optional)

If you want to customize the configuration:

```bash
php artisan vendor:publish --tag="laravel-cart-config"
```

## Configuration

The package comes with sensible defaults, but you can customize the behavior by publishing the config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Cart Storage Driver
    |--------------------------------------------------------------------------
    |
    | This option controls the default cart storage driver that will be used
    | to store cart items. You may set this to any of the storage options
    | listed below.
    |
    | Supported: "database", "session", "both"
    |
    */
    'driver' => env('CART_DRIVER', 'both'),

    /*
    |--------------------------------------------------------------------------
    | Cart Database Connection
    |--------------------------------------------------------------------------
    |
    | This is the database connection that will be used to store cart items
    | when using the "database" or "both" storage driver.
    |
    */
    'connection' => env('CART_DB_CONNECTION', null),

    /*
    |--------------------------------------------------------------------------
    | Cart Items Table
    |--------------------------------------------------------------------------
    |
    | This is the table that will be used to store cart items when using
    | the "database" or "both" storage driver.
    |
    */
    'table' => 'cart_items',

    /*
    |--------------------------------------------------------------------------
    | Session Key
    |--------------------------------------------------------------------------
    |
    | This is the session key that will be used to store cart items when
    | using the "session" or "both" storage driver.
    |
    */
    'session_key' => 'shopping_cart',
];
```

## Usage

### Basic Operations

```php
use Hnooz\LaravelCart\Facades\Cart;

// Add items to cart
Cart::add('product-1', 'iPhone 14', 999.99, 1);
Cart::add('product-2', 'MacBook Pro', 1999.99, 2, ['color' => 'Space Gray']);

// Remove an item
Cart::remove('product-1');

// Increase item quantity
Cart::increase('product-2', 1); // Adds 1 more MacBook Pro

// Decrease item quantity
Cart::decrease('product-2', 1); // Removes 1 MacBook Pro

// Get all cart items
$items = Cart::all();

// Get item count
$count = Cart::count(); // Total quantity of all items

// Get cart total
$total = Cart::total(); // Total price of all items

// Clear entire cart
Cart::clear();
```

### Working with Item Options

You can store additional data with each cart item:

```php
Cart::add('shirt-001', 'Cotton T-Shirt', 29.99, 2, [
    'size' => 'L',
    'color' => 'Blue',
    'customization' => 'Custom text on back'
]);

$items = Cart::all();
foreach ($items as $item) {
    echo $item['name'] . ' - Size: ' . $item['options']['size'];
}
```

### Storage Drivers

#### Session Storage
Best for simple applications or when you don't need persistent carts:

```php
// In config/cart.php or .env
'driver' => 'session'
// or
CART_DRIVER=session
```

#### Database Storage
Best for when you need persistent carts and user account integration:

```php
// In config/cart.php or .env
'driver' => 'database'
// or
CART_DRIVER=database
```

#### Hybrid Storage (Recommended)
Uses session for guests and database for authenticated users:

```php
// In config/cart.php or .env
'driver' => 'both'
// or
CART_DRIVER=both
```

### Guest to User Cart Migration

When a guest user logs in, their session cart can be easily migrated:

```php
// In your authentication logic
use Hnooz\LaravelCart\Facades\Cart;

// After user login
if (session()->has('shopping_cart')) {
    // Cart items are automatically available
    // The package handles the transition seamlessly
}
```

## API Reference

### `Cart::add(string $id, string $name, float $price, int $quantity = 1, array $options = [])`

Adds an item to the cart. If the item already exists, the quantity will be increased.

**Parameters:**
- `$id` - Unique identifier for the item
- `$name` - Display name of the item
- `$price` - Price per unit
- `$quantity` - Quantity to add (default: 1)
- `$options` - Additional data array (default: [])

### `Cart::remove(string $id)`

Removes an item completely from the cart.

### `Cart::increase(string $id, int $quantity = 1)`

Increases the quantity of an existing item.

### `Cart::decrease(string $id, int $quantity = 1)`

Decreases the quantity of an existing item. Minimum quantity is 1.

### `Cart::clear()`

Removes all items from the cart.

### `Cart::all()`

Returns all cart items as an array.

### `Cart::count()`

Returns the total quantity of all items in the cart.

### `Cart::total()`

Returns the total price of all items in the cart.

## Advanced Usage

### Using the Contract

You can type-hint the contract in your classes:

```php
use Hnooz\LaravelCart\Contracts\CartInterface;

class CheckoutService
{
    public function __construct(
        protected CartInterface $cart
    ) {}

    public function processOrder()
    {
        $items = $this->cart->all();
        $total = $this->cart->total();
        
        // Process order...
        
        $this->cart->clear();
    }
}
```

### Custom Cart Implementation

You can create your own cart implementation by implementing the `CartInterface`:

```php
use Hnooz\LaravelCart\Contracts\CartInterface;

class CustomCartManager implements CartInterface
{
    // Implement all required methods...
}

// In a service provider
$this->app->bind(CartInterface::class, CustomCartManager::class);
```

## Testing

The package comes with comprehensive tests. To run the tests:

```bash
composer test
```

## Code Quality

The package uses several tools to maintain code quality:

```bash

# Run Pint for style fix
composer style-fix

# Run rector for code improvements
composer rector-dry
composer rector-fix
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Mohamed Idris](https://github.com/hnooz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.