# Pixelify - Facebook Conversion API Integration for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/revoltify/pixelify.svg?style=flat-square)](https://packagist.org/packages/revoltify/pixelify)
[![Total Downloads](https://img.shields.io/packagist/dt/revoltify/pixelify.svg?style=flat-square)](https://packagist.org/packages/revoltify/pixelify)
[![Tests](https://img.shields.io/github/actions/workflow/status/revoltify/pixelify/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/revoltify/pixelify/actions/workflows/run-tests.yml)
[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2%2B-777BB4.svg?style=flat-square&logo=php)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-11%2B-FF2D20.svg?style=flat-square&logo=laravel)](https://laravel.com)

A Laravel package for easy integration with Facebook Conversion API to track various events like ViewContent, PageView, AddToCart, InitiateCheckout, and Purchase.

## Installation

**For Laravel 11+**

```bash
composer require revoltify/pixelify "^2.0"
```

**For Laravel 9+**

```bash
composer require revoltify/pixelify "^1.0"
```

## Configuration

Publish the configuration file:

```bash
php artisan pixelify:setup
```

Add your Facebook Pixel credentials to your `.env` file:

```env
FACEBOOK_PIXEL_ID=your_pixel_id
FACEBOOK_CONVERSION_API_TOKEN=your_api_token
FACEBOOK_TEST_EVENT_CODE=your_test_event_code (optional)
FACEBOOK_PIXEL_DEBUG=false
```


#### Getting Your Facebook Pixel ID and Access Token

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Go to the "Settings" tab
4. Copy the Dataset ID (this is your Pixel ID)
5. Scroll down to "Set up direct integration"
6. Click "Generate access token"
7. Copy the generated Pixel Access Token

## Usage

### Model Integration

Implement the interfaces in your models:

```php
use Revoltify\Pixelify\Contracts\PixelifyUserInterface;
use Revoltify\Pixelify\Traits\HasPixelifyUser;

class User extends Model implements PixelifyUserInterface
{
    use HasPixelifyUser;

    // overwrite methods if needed
    public function getPixelFirstName(): ?string
    {
        return $this->name;
    }
}

use Revoltify\Pixelify\Contracts\PixelifyProductInterface;
use Revoltify\Pixelify\Traits\HasPixelifyProduct;

class Product extends Model implements PixelifyProductInterface
{
    use HasPixelifyProduct;

    // overwrite methods if needed
    public function getPixelProductCurrency(): string
    {
        return $this->product_currency;
    }
}
```

### Tracking Events

```php
use App\Models\User;
use App\Models\Product;
use Revoltify\Pixelify\Facades\Pixelify;

$user = User::first();
$product = Product::first();

// Track page view
Pixelify::pageView($user);

// Track view content
Pixelify::viewContent($product, $user);

// Track add to cart
Pixelify::addToCart($product, $user);

// Track initiate checkout
Pixelify::initiateCheckout($product, $user);

// Track purchase
Pixelify::purchase($product, $user);
```

### Using DTOs Directly

You can also create DTOs manually:

```php
use Revoltify\Pixelify\DTO\UserData;
use Revoltify\Pixelify\DTO\ProductData;
use Revoltify\Pixelify\Facades\Pixelify;

$userData = new UserData(
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    phone: '+1234567890',
);

$productData = new ProductData(
    productId: '123',
    price: 99.99,
    quantity: 1,
    currency: 'USD'
);

Pixelify::purchase($productData, $userData);
```

## Testing

```bash
composer test
```

## Contributing

Thank you for considering contributing to the Pixelify package! We welcome all contributions, including bug reports, feature requests, and pull requests. 

Please review existing issues and pull requests before submitting your own to avoid duplicates.

If you discover any security-related issues, please email `info@revoltify.net` directly instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
