# Gumroad PHP SDK for Laravel

A comprehensive Laravel package for interacting with the Gumroad API. This package provides full support for all Gumroad API endpoints with **constructor-based Laravel Data DTOs**, QueryBuilders, and Laravel integration.

Built with [Spatie Laravel Data](https://github.com/spatie/laravel-data) featuring constructor-based instantiation for improved type safety and immutability.

## Features

- ✅ Full API coverage for all Gumroad endpoints
- ✅ **Constructor-based Laravel Data DTOs** with type safety and immutability
- ✅ Fluent QueryBuilder classes for complex queries
- ✅ Laravel Service Provider and Facade integration
- ✅ Proper exception handling
- ✅ PSR-4 autoloading
- ✅ Comprehensive documentation
- ✅ Automatic array-to-DTO conversion utilities
- ✅ Backward compatibility with factory methods

## Installation

```bash
composer require serenity_technologies/gumroad
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Gumroad\GumroadServiceProvider" --tag=config
```

Add your Gumroad access token to your `.env` file:

```env
GUMROAD_ACCESS_TOKEN=your_gumroad_access_token_here
```

## Usage

### Using the Facade

```php
use Gumroad\Facades\Gumroad;

// Get all products
$products = Gumroad::getAllProducts();

// Get a specific product
$product = Gumroad::getProduct('product-id-here');

// Create a new offer code using constructor
$offerCodeData = new CreateOfferCodeDTO(
    name: 'SPRING20',
    amount_off: null,
    percent_off: 20,
    offer_type: 'percent',
    max_purchase_count: null,
    universal: null
);

$offerCode = Gumroad::createOfferCode('product-id', $offerCodeData);
```

### Using Dependency Injection

```php
use Gumroad\Clients\GumroadClient;

class ProductService 
{
    public function __construct(private GumroadClient $gumroad) {}
    
    public function getAllProducts()
    {
        return $this->gumroad->getAllProducts();
    }
}
```

## API Coverage

### Products
- `getAllProducts()` - Get all products
- `getProduct($productId)` - Get specific product details
- `createProduct($productData)` - Create a new product
- `enableProduct($productId)` - Enable a product
- `disableProduct($productId)` - Disable a product
- `deleteProduct($productId)` - Delete a product

#### Creating a Product

```php
use Gumroad\DTOs\CreateProductRequestDTO;
use Gumroad\Enums\CurrencyCode;
use Gumroad\Enums\ProductNativeType;
use Gumroad\Enums\RecurrenceId;

$productData = new CreateProductRequestDTO(
    name: 'My Product',
    price: '1000', // Price in cents
    price_currency_type: CurrencyCode::USD,
    native_type: ProductNativeType::DIGITAL,
    is_physical: false,
    is_recurring_billing: true,
    subscription_duration: RecurrenceId::MONTHLY,
    description: 'Product description',
    custom_summary: 'Custom summary',
    ai_prompt: 'AI prompt content',
    number_of_content_pages: 10,
    release_at_date: '2024-01-01T00:00:00Z'
);

$product = Gumroad::createProduct($productData);
```

### Variant Categories
- `getVariantCategories($productId)` - Get all variant categories
- `getVariantCategory($productId, $categoryId)` - Get specific variant category
- `createVariantCategory($productId, $data)` - Create new variant category
- `updateVariantCategory($productId, $categoryId, $data)` - Update variant category
- `deleteVariantCategory($productId, $categoryId)` - Delete variant category

### Variants
- `getVariants($productId, $categoryId)` - Get all variants in a category
- `getVariant($productId, $categoryId, $variantId)` - Get specific variant
- `createVariant($productId, $categoryId, $data)` - Create new variant
- `updateVariant($productId, $categoryId, $variantId, $data)` - Update variant
- `deleteVariant($productId, $categoryId, $variantId)` - Delete variant

### Offer Codes
- `getOfferCodes($productId)` - Get all offer codes
- `getOfferCode($productId, $offerCodeId)` - Get specific offer code
- `createOfferCode($productId, $offerCodeData)` - Create new offer code
- `updateOfferCode($productId, $offerCodeId, $offerCodeData)` - Update offer code
- `deleteOfferCode($productId, $offerCodeId)` - Delete offer code

### Sales
- `getSales($queryParams)` - Get sales with filtering
- `getSale($saleId)` - Get specific sale details
- `markSaleAsShipped($saleId, $trackingData)` - Mark sale as shipped
- `refundSale($saleId)` - Refund a sale

### Licenses
- `verifyLicense($licenseData)` - Verify a license key
- `enableLicense($licenseData)` - Enable a license
- `disableLicense($licenseData)` - Disable a license
- `decrementLicenseUses($licenseData)` - Decrement license usage count

### Users
- `getUser()` - Get current user information

### Custom Fields
- `getCustomFields($productId)` - Get product custom fields
- `addCustomField($productId, $data)` - Add custom field to product
- `updateCustomField($productId, $fieldName, $data)` - Update custom field
- `deleteCustomField($productId, $fieldName)` - Delete custom field

### Subscribers
- `getActiveSubscribers($productId, $queryParams)` - Get active subscribers
- `getSubscriberDetails($subscriberId)` - Get subscriber details

## Query Builders

### Sales Query Builder

```php
use Gumroad\QueryBuilders\SalesQueryBuilder;

$query = (new SalesQueryBuilder())
    ->after('2023-01-01')
    ->before('2023-12-31')
    ->productId('product-id')
    ->email('customer@example.com')
    ->build();

$sales = Gumroad::getSales($query);
```

### Subscribers Query Builder

```php
use Gumroad\QueryBuilders\SubscribersQueryBuilder;

$query = (new SubscribersQueryBuilder())
    ->email('subscriber@example.com')
    ->paginated(true)
    ->pageKey('next-page-key')
    ->build();

$subscribers = Gumroad::getActiveSubscribers('product-id', $query);
```

## DTO Usage

### Constructor-Based Approach (Recommended)

```php
use Gumroad\DTOs\CreateOfferCodeDTO;
use Gumroad\DTOs\VerifyLicenseDTO;

// Create offer code with named parameters
$offerCode = new CreateOfferCodeDTO(
    name: 'WELCOME10',
    amount_off: null,
    percent_off: 10,
    offer_type: 'percent',
    max_purchase_count: 100,
    universal: null
);

// Verify license
$license = new VerifyLicenseDTO(
    product_id: 'product-123',
    license_key: 'ABC123-DEF456',
    increment_uses_count: true
);
```

### Factory Method Approach (Backward Compatible)

```php
use Gumroad\DTOs\CreateOfferCodeDTO;

// Create from array data
$offerCode = CreateOfferCodeDTO::fromArray([
    'name' => 'BACKWARD20',
    'amount_off' => null,
    'percent_off' => 20,
    'offer_type' => 'percent',
    'max_purchase_count' => 50,
    'universal' => null
]);
```

### DTO to Array Conversion

```php
use Gumroad\DTOs\ProductDTO;

// Convert DTO to array
$productDto = new ProductDTO(/* ... */);
$arrayData = $productDto->toArray();
```

## Error Handling

All API errors are wrapped in `GumroadException`:

```php
use Gumroad\Exceptions\GumroadException;

try {
    $product = Gumroad::getProduct('invalid-id');
} catch (GumroadException $e) {
    echo "API Error: " . $e->getMessage();
}
```

## Testing

```bash
composer test
```

## DTO Conversion Tools

This package includes automated tools for converting DTOs to constructor-based definitions:

```bash
# Batch convert all DTOs
php batch_convert_dtos.php

# Full-featured converter with logging
php convert_dtos_to_constructors.php

# Convert single DTO file
php simple_dto_converter.php ProductDTO.php
```

See `DTO_CONVERSION_SCRIPTS.md` for detailed documentation.

## Requirements

- PHP ^8.1
- Laravel ^9.0|^10.0|^11.0
- GuzzleHttp ^7.0
- Spatie Laravel Data ^4.19

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email kyerematics@gmail.com instead of using the issue tracker.