# eBay API SDK for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sashalenz/ebay-api.svg?style=flat-square)](https://packagist.org/packages/sashalenz/ebay-api)
[![Total Downloads](https://img.shields.io/packagist/dt/sashalenz/ebay-api.svg?style=flat-square)](https://packagist.org/packages/sashalenz/ebay-api)

A modern Laravel package for interacting with the eBay API. This package provides a clean, fluent interface for working with eBay's Sell and Commerce APIs using Laravel Data objects for type safety.

## Features

- 🚀 Built for Laravel 12+ and PHP 8.4+
- 🔐 OAuth 2.0 Application Token authentication with automatic token refresh
- 👤 OAuth 2.0 User Token support for user-specific APIs (Post-Order, Identity)
- 📦 Type-safe request/response handling with **190 Data classes** using Spatie Laravel Data
- 🔄 Auto-Injection - EbayClient automatically injected into Request classes
- 🏗️ **Builder Pattern** - Fluent interface for all complex requests with type-safe Data objects
- ✅ **Request Validation** - Automatic validation before sending requests with detailed error messages
- 📡 **Platform Notifications** - Complete SOAP webhook system with Events, Queue Jobs, and GDPR compliance
- ⚙️ **Complete Sell Account API v1** - All 36 methods for account configuration (12 Data objects)
- ⚙️ **Complete Sell Account API v2** - All 4 methods for rate tables and payout settings
- 💰 **Complete Sell Finances API** - All 7 methods for payouts and transactions (8 Data objects)
- 📦 **Complete Sell Fulfillment API** - All 15 methods for order management and disputes (9 Data objects)
- 🚚 **Complete Sell Logistics API** - All 6 methods for shipping quotes and labels (3 Data objects)
- 📋 **Complete Sell Feed API** - All 23 methods for feed management and reporting (6 Data objects)
- 🔍 **Complete Sell Metadata API** - All 22 methods for marketplace policies and configurations (4 Data objects)
- 💝 **Complete Sell Charity API** - All 2 methods for charitable organizations (3 Data objects)
- 🛒 **Complete Sell Catalog API** - All 2 methods for product search and discovery (3 Data objects)
- 🔔 **Complete Sell Notification API** - All 21 methods for managing eBay push notifications (9 Data objects)
- 💬 **Complete Sell Negotiation API** - All 2 methods for sending discount offers to interested buyers (3 Data objects)
- 📊 **Complete Sell Marketing API** - All 81 methods for Promoted Listings, campaigns, and promotions (11 Data objects, 7 Enums)
- 💡 **Complete Sell Recommendation API** - 1 method for listing optimization suggestions (2 Data objects)
- 📈 **Complete Sell Analytics API** - All 4 methods for performance metrics and traffic reports (14 Data objects)
- 🌐 **Complete Sell Translation API** - 1 method for translating item titles/descriptions between languages (2 Data objects)
- ⚖️ **Complete Sell Compliance API** - All 2 methods for listing violations monitoring and corrective recommendations (7 Data objects)
- 👤 **Complete Sell Identity API** - 1 method for retrieving authenticated user profile (OAuth login) (4 Data objects)
- 📮 **Complete Post-Order API** - All 42 methods for managing cancellations, returns, cases, and inquiries (16 Data objects)
- 📦 **Complete Sell Stores API** - All 8 methods for eBay Store management (3 Data objects)
- 📊 **Complete Sell Inventory API** - All 35 methods with full Data structure (43 Data objects)
- 🌳 **Complete Commerce Taxonomy API** - All 9 methods with recursive Data support (21 Data objects)
- 🎯 **Comprehensive Enums** - 35 type-safe enums for all API constants
- 🌍 Multi-marketplace support for all eBay marketplaces
- ⚡ Built with Guzzle for reliable HTTP communication
- 🧪 **Fully tested with Pest** - 127 comprehensive tests with 100% Request class coverage
- 🎪 **10 Laravel Events** - Real-time event system for eBay notifications
- 📝 Comprehensive documentation and examples

## Installation

You can install the package via composer:

```bash
composer require sashalenz/ebay-api
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="ebay-api-config"
```

## OAuth Authentication

### Application Token (Client Credentials)

Used for most Sell APIs and Commerce APIs. Configured automatically from `.env`:

```env
EBAY_APP_ID=your-app-id
EBAY_CERT_ID=your-cert-id
EBAY_ENVIRONMENT=sandbox
```

### User Token (Authorization Code Flow)

Required for Post-Order API and Identity API. You must implement OAuth flow in your app:

```php
use Sashalenz\EbayApi\Client\Auth\UserToken;
use Sashalenz\EbayApi\Client\EbayClient;

// After obtaining user's OAuth token through authorization flow:
$userToken = new UserToken(
    appId: config('ebay-api.app_id'),
    certId: config('ebay-api.cert_id'),
    environment: \Sashalenz\EbayApi\Enums\Environment::from(config('ebay-api.environment')),
    accessToken: $userAccessToken,
    refreshToken: $userRefreshToken,
    expiresAt: $expiresAt, // Unix timestamp
    cacheKey: 'ebay_user_token_'.$userId // Optional: for caching
);

// Use with client
$client = app(EbayClient::class);
$client->setUserToken($userToken);

// Now you can call Post-Order API methods
$return = GetReturnRequest::make($returnId)->asData();

// Clear user token when done (reverts to Application Token)
$client->clearUserToken();
```

**Note:** The UserToken automatically refreshes when expired using the refresh token.

This is the contents of the published config file:

```php
return [
    'app_id' => env('EBAY_APP_ID'),
    'cert_id' => env('EBAY_CERT_ID'),
    'dev_id' => env('EBAY_DEV_ID'),
    'environment' => env('EBAY_ENVIRONMENT', 'sandbox'),
    'marketplace_id' => env('EBAY_MARKETPLACE_ID', 'EBAY_US'),
    'content_language' => env('EBAY_CONTENT_LANGUAGE', 'en-US'),
    'timeout' => env('EBAY_TIMEOUT', 30),
    'token_cache_ttl' => env('EBAY_TOKEN_CACHE_TTL', 3300),
];
```

## Configuration

Add your eBay API credentials to your `.env` file:

```env
EBAY_APP_ID=your_app_id
EBAY_CERT_ID=your_cert_id
EBAY_DEV_ID=your_dev_id
EBAY_ENVIRONMENT=sandbox
EBAY_MARKETPLACE_ID=EBAY_US
EBAY_CONTENT_LANGUAGE=en-US
EBAY_OAUTH_SCOPES="https://api.ebay.com/oauth/api_scope"
```

### OAuth Scopes

The package uses OAuth 2.0 **Client Credentials** (Application Token) for authentication. By default, it uses the base scope `https://api.ebay.com/oauth/api_scope`, which provides access to most public and seller-specific APIs.

If you need specific scopes, you can customize them in your `.env`:

```env
# Single scope (recommended for most use cases)
EBAY_OAUTH_SCOPES="https://api.ebay.com/oauth/api_scope"

# Multiple scopes (space-separated, if needed)
EBAY_OAUTH_SCOPES="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory"
```

**⚠️ Important:** Using too many scopes or invalid scopes will result in `invalid_scope` error. Start with the base scope first.

### Available Environments

- `sandbox` - eBay Sandbox environment (for testing)
- `production` - eBay Production environment (for live data)

### Available Marketplaces

The package supports all eBay marketplaces:
- `EBAY_US` - United States
- `EBAY_GB` - United Kingdom
- `EBAY_CA` - Canada
- `EBAY_AU` - Australia
- `EBAY_DE` - Germany
- `EBAY_FR` - France
- And many more...

## Usage

### Automatic Data Mapping (Recommended)

The package automatically maps API responses to type-safe Data objects.  
**NEW:** Client is auto-injected, no need to pass it manually!

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\GetInventoryItemRequest;

// Client is automatically injected via Laravel Container
$item = GetInventoryItemRequest::make('SKU123')->asData();

// Type-safe access to properties
echo $item->sku; // 'SKU123'
echo $item->product?->title; // Product title
echo $item->condition; // 'NEW'
```

### Using the Facade

```php
use Sashalenz\EbayApi\Facades\EbayApi;
use Sashalenz\EbayApi\Requests\Sell\Inventory\GetInventoryItemRequest;

// Get an inventory item
$request = new GetInventoryItemRequest(app(EbayApi::class), 'SKU123');
$response = $request->send();

if ($response->successful()) {
    $data = $response->json();
    // Process the data
}
```

### Using Dependency Injection

```php
use Sashalenz\EbayApi\Client\EbayClient;
use Sashalenz\EbayApi\Requests\Sell\Inventory\GetInventoryItemsRequest;

class InventoryService
{
    public function __construct(private EbayClient $client)
    {
    }

    public function getAllItems()
    {
        $request = new GetInventoryItemsRequest($this->client);
        $request->limit(50)->offset(0);
        
        $response = $request->send();
        return $response->json();
    }
}
```

### Sell API - Inventory Examples

#### Get a Single Inventory Item

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\InventoryItem\GetInventoryItemRequest;

// Auto-injection + Data mapping (recommended)
$item = GetInventoryItemRequest::make('YOUR-SKU')->asData();

// Access all properties type-safely
echo "SKU: {$item->sku}" . PHP_EOL;
echo "Title: {$item->product?->title}" . PHP_EOL;
echo "Condition: {$item->condition?->value}" . PHP_EOL;
echo "Quantity: {$item->availability?->shipToLocationAvailability?->quantity}" . PHP_EOL;

// Product details
echo "Brand: {$item->product?->brand}" . PHP_EOL;
echo "Description: {$item->product?->description}" . PHP_EOL;

// Images
foreach ($item->product?->imageUrls ?? [] as $imageUrl) {
    echo "Image: {$imageUrl}" . PHP_EOL;
}
```

#### Get All Inventory Items

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\InventoryItem\GetInventoryItemsRequest;

// Auto-injection + automatic mapping to DataCollection
$items = GetInventoryItemsRequest::make()
    ->limit(50)
    ->offset(0)
    ->asData();

// $items is DataCollection<InventoryItemData>
foreach ($items as $item) {
    echo "SKU: {$item->sku}" . PHP_EOL;
    echo "Title: {$item->product?->title}" . PHP_EOL;
    echo "Condition: {$item->condition?->value}" . PHP_EOL;
}

// DataCollection methods
$skus = $items->pluck('sku');
$newItems = $items->filter(fn($item) => $item->condition === Condition::NEW);
```

#### Create or Update an Inventory Item (Builder Pattern)

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\InventoryItem\CreateOrReplaceInventoryItemRequest;
use Sashalenz\EbayApi\Data\Sell\Inventory\ProductData;
use Sashalenz\EbayApi\Data\Sell\Inventory\AvailabilityData;
use Sashalenz\EbayApi\Data\Sell\Inventory\ShipToLocationAvailabilityData;
use Sashalenz\EbayApi\Enums\Condition;
use Sashalenz\EbayApi\Enums\Locale;

// Using Builder Pattern with Data objects and Enums
$response = CreateOrReplaceInventoryItemRequest::make('YOUR-SKU')
    ->product(ProductData::from([
        'title' => 'Apple iPhone 15 Pro',
        'description' => 'Brand new Apple iPhone 15 Pro with 256GB storage',
        'brand' => 'Apple',
        'mpn' => 'MTUW3',
        'aspects' => [
            'Brand' => ['Apple'],
            'Model' => ['iPhone 15 Pro'],
            'Storage Capacity' => ['256 GB'],
        ],
        'imageUrls' => ['https://example.com/image1.jpg'],
    ]))
    ->condition(Condition::NEW)
    ->locale(Locale::EN_US)
    ->availability(AvailabilityData::from([
        'shipToLocationAvailability' => ShipToLocationAvailabilityData::from([
            'quantity' => 10,
        ]),
    ]))
    ->send();

if ($response->successful()) {
    echo "Inventory item created/updated successfully";
}
```

#### Delete an Inventory Item

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\InventoryItem\DeleteInventoryItemRequest;

// Delete inventory item (also deletes unpublished offers and listings)
$response = DeleteInventoryItemRequest::make('YOUR-SKU')->send();

if ($response->successful()) {
    echo "Inventory item deleted successfully";
}
```

#### Create an Offer (Builder Pattern)

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\Offer\CreateOfferRequest;
use Sashalenz\EbayApi\Data\Sell\Inventory\PricingSummaryData;
use Sashalenz\EbayApi\Data\Sell\Inventory\AmountData;
use Sashalenz\EbayApi\Data\Sell\Inventory\ListingPoliciesData;
use Sashalenz\EbayApi\Enums\MarketplaceId;

$offer = CreateOfferRequest::make('YOUR-SKU', MarketplaceId::EBAY_US, 'FIXED_PRICE')
    ->categoryId('139971')
    ->pricingSummary(PricingSummaryData::from([
        'price' => AmountData::from([
            'currency' => 'USD',
            'value' => '999.99',
        ]),
    ]))
    ->listingPolicies(ListingPoliciesData::from([
        'fulfillmentPolicyId' => 'policy-123',
        'paymentPolicyId' => 'policy-456',
        'returnPolicyId' => 'policy-789',
    ]))
    ->quantityLimitPerBuyer(5)
    ->merchantLocationKey('warehouse-01')
    ->asData();

echo "Offer ID: {$offer->offerId}";
```

#### Bulk Operations

```php
use Sashalenz\EbayApi\Requests\Sell\Inventory\InventoryItem\BulkUpdatePriceQuantityRequest;
use Sashalenz\EbayApi\Data\Sell\Inventory\AvailabilityData;
use Sashalenz\EbayApi\Data\Sell\Inventory\PricingSummaryData;

// Update price and quantity for multiple items
$response = BulkUpdatePriceQuantityRequest::make()
    ->addRequest(
        'SKU-001',
        AvailabilityData::from(['shipToLocationAvailability' => ['quantity' => 50]]),
        PricingSummaryData::from(['price' => ['value' => '29.99', 'currency' => 'USD']])
    )
    ->addRequest(
        'SKU-002',
        AvailabilityData::from(['shipToLocationAvailability' => ['quantity' => 100]]),
        PricingSummaryData::from(['price' => ['value' => '49.99', 'currency' => 'USD']])
    )
    ->send();
```

### Commerce API - Taxonomy Examples

#### Get Default Category Tree ID

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetDefaultCategoryTreeIdRequest;
use Sashalenz\EbayApi\Enums\MarketplaceId;

// Get default category tree for US marketplace
$tree = GetDefaultCategoryTreeIdRequest::make(MarketplaceId::EBAY_US)->asData();

echo "Tree ID: {$tree->categoryTreeId}" . PHP_EOL;
echo "Version: {$tree->categoryTreeVersion}" . PHP_EOL;

// For different marketplaces
$ukTree = GetDefaultCategoryTreeIdRequest::make(MarketplaceId::EBAY_GB)->asData();
$deTree = GetDefaultCategoryTreeIdRequest::make(MarketplaceId::EBAY_DE)->asData();
```

#### Get Category Suggestions

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetCategorySuggestionsRequest;

// Client auto-injected + automatic mapping to DataCollection<CategorySuggestionData>
$suggestions = GetCategorySuggestionsRequest::make('0', 'iphone')->asData();

foreach ($suggestions as $suggestion) {
    echo "Category: {$suggestion->category?->categoryName}" . PHP_EOL;
    echo "ID: {$suggestion->category?->categoryId}" . PHP_EOL;
    echo "Relevancy: {$suggestion->relevancy}" . PHP_EOL;
}
```

#### Get Category Tree

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetCategoryTreeRequest;

// Client auto-injected + automatic mapping to CategoryTreeData with full recursive structure
$tree = GetCategoryTreeRequest::make('0')->asData();

echo "Tree ID: {$tree->categoryTreeId}" . PHP_EOL;
echo "Version: {$tree->categoryTreeVersion}" . PHP_EOL;

// applicableMarketplaceIds is array<MarketplaceId>
foreach ($tree->applicableMarketplaceIds ?? [] as $marketplace) {
    echo "Marketplace: {$marketplace->value}" . PHP_EOL;
}

// Navigate the tree
$rootNode = $tree->rootCategoryNode;
echo "Root: {$rootNode->category?->categoryName}" . PHP_EOL;

// Access child nodes (recursive structure)
foreach ($rootNode->childCategoryTreeNodes ?? [] as $child) {
    echo "- {$child->category?->categoryName}" . PHP_EOL;
}
```

#### Get Category Subtree

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetCategorySubtreeRequest;

// Get subtree below a specific category
$subtree = GetCategorySubtreeRequest::make('0', '11450')->asData();

echo "Tree ID: {$subtree->categoryTreeId}" . PHP_EOL;
echo "Version: {$subtree->categoryTreeVersion}" . PHP_EOL;

$node = $subtree->categorySubtreeNode;
echo "Root: {$node->category?->categoryName}" . PHP_EOL;
echo "Children: {$node->childCategoryTreeNodes?->count()}" . PHP_EOL;

// Navigate subtree
foreach ($node->childCategoryTreeNodes ?? [] as $child) {
    echo "- {$child->category?->categoryName}" . PHP_EOL;
}
```

#### Get Item Aspects For Category

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetItemAspectsForCategoryRequest;

// Get aspects for a specific leaf category
$metadata = GetItemAspectsForCategoryRequest::make('0', '178090')->asData();

foreach ($metadata->aspects ?? [] as $aspect) {
    echo "Aspect: {$aspect->localizedAspectName}";
    
    if ($aspect->aspectConstraint?->aspectRequired) {
        echo " [Required]";
    }
    
    echo " ({$aspect->aspectConstraint?->aspectUsage?->value})" . PHP_EOL;
    
    // Available values
    if ($aspect->aspectValues !== null) {
        $values = $aspect->aspectValues->pluck('localizedValue')->take(3)->toArray();
        echo "  Values: " . implode(', ', $values) . PHP_EOL;
    }
}
```

#### Get Compatibility Properties

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetCompatibilityPropertiesRequest;

// Get compatible vehicle properties for a parts category
$response = GetCompatibilityPropertiesRequest::make('100', '33733')->asData();

foreach ($response->compatibilityProperties ?? [] as $property) {
    echo "Property: {$property->name} (Localized: {$property->localizedName})" . PHP_EOL;
}

// Output: Year, Make, Model, Trim, Engine
```

#### Get Compatibility Property Values

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetCompatibilityPropertyValuesRequest;

// Get all 2018 Honda models
$models = GetCompatibilityPropertyValuesRequest::make('100', '33559', 'Model')
    ->filter('Year', '2018')
    ->filter('Make', 'Honda')
    ->asData();

foreach ($models->compatibilityPropertyValues ?? [] as $model) {
    echo "Model: {$model->value}" . PHP_EOL;
}

// Or use filters() method
$trims = GetCompatibilityPropertyValuesRequest::make('100', '6030', 'Trim')
    ->filters([
        'Year' => '2018',
        'Make' => 'Ferrari',
    ])
    ->asData();

foreach ($trims->compatibilityPropertyValues ?? [] as $trim) {
    echo "Trim: {$trim->value}" . PHP_EOL;
}
```

#### Get Expired Categories

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\GetExpiredCategoriesRequest;

// Get mappings of expired categories to active replacements
$response = GetExpiredCategoriesRequest::make('0')->asData();

foreach ($response->expiredCategories ?? [] as $mapping) {
    echo "Expired: {$mapping->fromCategoryId} -> Active: {$mapping->toCategoryId}" . PHP_EOL;
}
```

#### Fetch Item Aspects

```php
use Sashalenz\EbayApi\Requests\Commerce\Taxonomy\CategoryTree\FetchItemAspectsRequest;

// Get all aspects for all leaf categories (large response, gzipped)
$response = FetchItemAspectsRequest::make('0')->asData();

echo "Tree ID: {$response->categoryTreeId}" . PHP_EOL;
echo "Version: {$response->categoryTreeVersion}" . PHP_EOL;
echo "Categories with aspects: {$response->categoryAspects?->count()}" . PHP_EOL;

// Iterate through category aspects
foreach ($response->categoryAspects ?? [] as $categoryAspect) {
    echo "Category: {$categoryAspect->category?->categoryName}" . PHP_EOL;
    
    foreach ($categoryAspect->aspects ?? [] as $aspect) {
        echo "  - {$aspect->localizedAspectName}";
        
        if ($aspect->aspectConstraint?->aspectRequired) {
            echo " (Required)";
        }
        
        echo PHP_EOL;
    }
}
```

### Sell API - Marketing Examples

#### Create a Promoted Listings Campaign

```php
use Sashalenz\EbayApi\Requests\Sell\Marketing\Campaign\CreateCampaignRequest;

$campaign = CreateCampaignRequest::make([
    'campaignName' => 'Holiday Sale 2025',
    'fundingStrategy' => 'COST_PER_SALE',
    'marketplaceId' => 'EBAY_US',
    'startDate' => '2025-12-01T00:00:00Z',
    'endDate' => '2025-12-31T23:59:59Z',
    'budget' => ['value' => '500.00', 'currency' => 'USD'],
])->asData();

echo "Campaign ID: {$campaign->campaignId}";
```

#### Manage Ads in Bulk

```php
use Sashalenz\EbayApi\Requests\Sell\Marketing\Ad\BulkCreateAdsByListingIdRequest;

// Create multiple ads at once
$response = BulkCreateAdsByListingIdRequest::make('campaign-123', [
    ['listingId' => 'listing-001', 'bidPercentage' => '5.0'],
    ['listingId' => 'listing-002', 'bidPercentage' => '7.5'],
])->send();
```

#### Create Item Promotion

```php
use Sashalenz\EbayApi\Requests\Sell\Marketing\ItemPromotion\CreateItemPromotionRequest;

$promotion = CreateItemPromotionRequest::make([
    'name' => '20% Off Electronics',
    'promotionType' => 'ORDER_DISCOUNT',
    'marketplaceId' => 'EBAY_US',
    'startDate' => '2025-12-01T00:00:00Z',
    'endDate' => '2025-12-31T23:59:59Z',
    'discountRules' => [
        ['discountBenefit' => ['percentageOffOrder' => '20'], 'ruleOrder' => 1]
    ],
])->send();
```

#### Send Discount Offers to Interested Buyers

```php
use Sashalenz\EbayApi\Requests\Sell\Negotiation\Offer\FindEligibleItemsRequest;
use Sashalenz\EbayApi\Requests\Sell\Negotiation\Offer\SendOfferToInterestedBuyersRequest;

// Find eligible items
$eligible = FindEligibleItemsRequest::make()->limit(50)->asData();

// Send offers
SendOfferToInterestedBuyersRequest::make()
    ->addOfferedItem($eligible->eligibleItems->first()->listingId, discountPercentage: 10.0)
    ->message('Special offer!')
    ->send();
```

## Available Request Classes

### Sell API - Inventory Mapping (GraphQL)

**AI-Powered Listing Creation (2/2):**
- `StartListingPreviewsCreationRequest` - Create listing previews from product data (GraphQL mutation)
- `GetListingPreviewsCreationTaskRequest` - Get task status and results (GraphQL query)

### Commerce API - Media

**Image (3/3):**
- `CreateImageFromFileRequest`, `CreateImageFromUrlRequest`, `GetImageRequest`

**Video (3/3):**
- `CreateVideoRequest`, `GetVideoRequest`, `UploadVideoRequest`

**Document (4/4):**
- `CreateDocumentRequest`, `CreateDocumentFromUrlRequest`, `GetDocumentRequest`, `UploadDocumentRequest`

### Sell API - Catalog

**Product Search (2/2):**
- `GetProductRequest` - Get details of a specific eBay catalog product by EPID
- `SearchProductsRequest` - Search catalog products by query, GTIN, MPN, brand, category, aspects

Example usage:

```php
use Sashalenz\EbayApi\Requests\Sell\Catalog\GetProductRequest;
use Sashalenz\EbayApi\Requests\Sell\Catalog\SearchProductsRequest;

// Get a specific product by EPID
$product = GetProductRequest::make('123456789')->asData();
echo $product->title; // Product title
echo $product->brand; // Product brand
echo $product->mpn; // Manufacturer part number

// Search for products
$results = SearchProductsRequest::make()
    ->query('iPhone 15')
    ->brand('Apple')
    ->limit(20)
    ->asData();

foreach ($results as $product) {
    echo "{$product->title} - {$product->epid}" . PHP_EOL;
}

// Search by GTIN (UPC, EAN, ISBN)
$byGtin = SearchProductsRequest::make()
    ->gtin('885909950805')
    ->asData();

// Search with aspect filters
$filtered = SearchProductsRequest::make()
    ->categoryId('9355')
    ->aspectFilter('Storage Capacity:256 GB')
    ->asData();
```

### Sell API - Stores

**Store Management (8/8):**
- `GetStoreRequest` - Get store configuration
- `GetStoreCategoriesRequest` - Get all store categories (paginated)
- `AddStoreCategoryRequest` - Add new custom category (async)
- `DeleteStoreCategoryRequest` - Delete store category
- `RenameStoreCategoryRequest` - Rename store category
- `MoveStoreCategoryRequest` - Move category in hierarchy
- `GetStoreTaskRequest` - Get task status
- `GetStoreTasksRequest` - Get all tasks (paginated)

### Sell API - Inventory

**InventoryItem (7/7):**
- `GetInventoryItemRequest`, `GetInventoryItemsRequest`
- `CreateOrReplaceInventoryItemRequest`, `DeleteInventoryItemRequest`
- `BulkCreateOrReplaceInventoryItemRequest`, `BulkGetInventoryItemRequest`, `BulkUpdatePriceQuantityRequest`

**ProductCompatibility (3/3):**
- `GetProductCompatibilityRequest`, `CreateOrReplaceProductCompatibilityRequest`, `DeleteProductCompatibilityRequest`

**InventoryItemGroup (3/3):**
- `GetInventoryItemGroupRequest`, `CreateOrReplaceInventoryItemGroupRequest`, `DeleteInventoryItemGroupRequest`

**Location (7/7):**
- `GetInventoryLocationRequest`, `GetInventoryLocationsRequest`
- `CreateInventoryLocationRequest`, `UpdateInventoryLocationRequest`, `DeleteInventoryLocationRequest`
- `EnableInventoryLocationRequest`, `DisableInventoryLocationRequest`

**Listing (4/4):**
- `BulkMigrateListingRequest`, `GetSkuLocationMappingRequest`
- `CreateOrReplaceSkuLocationMappingRequest`, `DeleteSkuLocationMappingRequest`

**Offer (11/11):**
- `GetOfferRequest`, `GetOffersRequest`, `CreateOfferRequest`, `UpdateOfferRequest`, `DeleteOfferRequest`
- `PublishOfferRequest`, `WithdrawOfferRequest`
- `PublishOfferByInventoryItemGroupRequest`, `WithdrawOfferByInventoryItemGroupRequest`
- `BulkCreateOfferRequest`, `BulkPublishOfferRequest`, `GetListingFeesRequest`

### Sell API - Metadata

**Marketplace Policies (16/16):**
- `GetAutomotivePartsCompatibilityPoliciesRequest`, `GetCategoryPoliciesRequest`, `GetClassifiedAdPoliciesRequest`
- `GetCurrenciesRequest`, `GetExtendedProducerResponsibilityPoliciesRequest`, `GetHazardousMaterialsLabelsRequest`
- `GetItemConditionPoliciesRequest`, `GetListingStructurePoliciesRequest`, `GetListingTypePoliciesRequest`
- `GetMotorsListingPoliciesRequest`, `GetNegotiatedPricePoliciesRequest`, `GetProductSafetyLabelsRequest`
- `GetRegulatoryPoliciesRequest`, `GetReturnPoliciesRequest`, `GetShippingPoliciesRequest`, `GetSiteVisibilityPoliciesRequest`

**Compatibility Data (5/5):**
- `GetCompatibilitiesBySpecificationRequest`, `GetCompatibilityPropertyNamesRequest`, `GetCompatibilityPropertyValuesRequest`
- `GetMultiCompatibilityPropertyValuesRequest`, `GetProductCompatibilitiesRequest`

**Sales Tax (1/1):**
- `GetSalesTaxJurisdictionsRequest`

### Sell API - Feed

**Order Tasks (3/3):**
- `CreateOrderTaskRequest`, `GetOrderTaskRequest`, `GetOrderTasksRequest`

**Inventory Tasks (3/3):**
- `CreateInventoryTaskRequest`, `GetInventoryTaskRequest`, `GetInventoryTasksRequest`

**Generic Tasks (6/6):**
- `CreateTaskRequest`, `GetTaskRequest`, `GetTasksRequest`
- `UploadFileRequest`, `GetInputFileRequest`, `GetResultFileRequest`

**Schedules (8/8):**
- `CreateScheduleRequest`, `GetScheduleRequest`, `GetSchedulesRequest`, `UpdateScheduleRequest`, `DeleteScheduleRequest`
- `GetLatestResultFileRequest`, `GetScheduleTemplateRequest`, `GetScheduleTemplatesRequest`

**Customer Service Metrics (3/3):**
- `CreateCustomerServiceMetricTaskRequest`, `GetCustomerServiceMetricTaskRequest`, `GetCustomerServiceMetricTasksRequest`

### Sell API - Account

**Fulfillment Policies (6/6):**
- `CreateFulfillmentPolicyRequest`, `GetFulfillmentPolicyRequest`, `GetFulfillmentPoliciesRequest`
- `GetFulfillmentPolicyByNameRequest`, `UpdateFulfillmentPolicyRequest`, `DeleteFulfillmentPolicyRequest`

**Payment Policies (6/6):**
- `CreatePaymentPolicyRequest`, `GetPaymentPolicyRequest`, `GetPaymentPoliciesRequest`
- `GetPaymentPolicyByNameRequest`, `UpdatePaymentPolicyRequest`, `DeletePaymentPolicyRequest`

**Return Policies (6/6):**
- `CreateReturnPolicyRequest`, `GetReturnPolicyRequest`, `GetReturnPoliciesRequest`
- `GetReturnPolicyByNameRequest`, `UpdateReturnPolicyRequest`, `DeleteReturnPolicyRequest`

**Custom Policies (4/4):**
- `CreateCustomPolicyRequest`, `GetCustomPolicyRequest`, `GetCustomPoliciesRequest`, `UpdateCustomPolicyRequest`

**Sales Tax (4/4):**
- `CreateOrReplaceSalesTaxRequest`, `GetSalesTaxRequest`, `GetSalesTaxesRequest`, `DeleteSalesTaxRequest`

**Programs (3/3):**
- `GetOptedInProgramsRequest`, `OptInToProgramRequest`, `OptOutOfProgramRequest`

**Other (7/7):**
- `GetPaymentsProgramRequest`, `GetPaymentsProgramOnboardingRequest`, `GetPrivilegesRequest`
- `GetRateTablesRequest`, `GetSubscriptionRequest`, `GetKYCRequest` (deprecated), `GetAdvertisingEligibilityRequest`

### Sell API - Account v2

**Rate Tables (2/2):**
- `GetRateTableRequest` - Get details of a specific shipping rate table
- `UpdateShippingCostRequest` - Update shipping rates for a rate table

**Payout Settings (2/2):**
- `GetPayoutSettingsRequest` - Get payout settings (mainland China only)
- `UpdatePayoutPercentageRequest` - Update split-payout percentages (mainland China only)

### Sell API - Fulfillment

**Orders (3/3):**
- `GetOrderRequest` - Get details of a specific order
- `GetOrdersRequest` - Get orders with filtering by dates, status, etc.
- `IssueRefundRequest` - Issue full or partial refund to buyer

**Shipping Fulfillment (3/3):**
- `CreateShippingFulfillmentRequest` - Create shipping fulfillment with tracking info
- `GetShippingFulfillmentRequest` - Get specific shipping fulfillment details
- `GetShippingFulfillmentsRequest` - Get all shipping fulfillments for an order

**Payment Disputes (9/9):**
- `GetPaymentDisputeRequest` - Get full details on a payment dispute
- `GetPaymentDisputeSummariesRequest` - Get payment disputes by search criteria
- `GetActivitiesRequest` - Get activity log for a payment dispute
- `FetchEvidenceContentRequest` - Get specific evidence file
- `ContestPaymentDisputeRequest` - Contest a payment dispute
- `AcceptPaymentDisputeRequest` - Accept a payment dispute
- `UploadEvidenceFileRequest` - Upload evidence file for dispute
- `AddEvidenceRequest` - Add evidence for dispute
- `UpdateEvidenceRequest` - Update evidence set for dispute

### Sell API - Logistics

**Shipping Quotes (2/2):**
- `CreateShippingQuoteRequest` - Create shipping quote for live rates
- `GetShippingQuoteRequest` - Get shipping quote details

**Shipments (4/4):**
- `CreateFromShippingQuoteRequest` - Create shipment and generate label
- `GetShipmentRequest` - Get shipment details
- `CancelShipmentRequest` - Cancel shipment and invalidate label
- `DownloadLabelFileRequest` - Download shipping label PDF

### Sell API - Finances

**Payouts (3/3):**
- `GetPayoutRequest` - Get details of a specific payout
- `GetPayoutsRequest` - Get all payouts with filtering and sorting
- `GetPayoutSummaryRequest` - Get summary of payouts and transactions

**Transactions (2/2):**
- `GetTransactionsRequest` - Get monetary transactions with filtering
- `GetTransactionSummaryRequest` - Get summary of transactions by type

**Funds Summary (1/1):**
- `GetSellerFundsSummaryRequest` - Get pending funds summary

**Transfers (1/1):**
- `GetTransferRequest` - Get transfer transaction details (seller reimbursing eBay)

### Sell API - Charity

**Charitable Organizations (2/2):**
- `GetCharityOrgRequest` - Get details of a specific charitable organization
- `GetCharityOrgsRequest` - Search charitable organizations by name or registration ID

### Sell API - Catalog

**Product Search (2/2):**
- `GetProductRequest` - Get details of a specific eBay catalog product by EPID
- `SearchProductsRequest` - Search catalog products by query, GTIN, MPN, brand, category, aspects

### Sell API - Notification

**Configuration (2/2):**
- `GetConfigRequest` - Get the alert email address
- `UpdateConfigRequest` - Update the alert email address

**Destinations (5/5):**
- `CreateDestinationRequest` - Create a notification destination endpoint
- `GetDestinationRequest` - Get details of a destination endpoint
- `GetDestinationsRequest` - Get all destination endpoints
- `UpdateDestinationRequest` - Update destination name or status
- `DeleteDestinationRequest` - Delete a disabled destination

**Subscriptions (11/11):**
- `CreateSubscriptionRequest` - Subscribe to a notification topic
- `GetSubscriptionRequest` - Get details of a subscription
- `GetSubscriptionsRequest` - Get all subscriptions
- `UpdateSubscriptionRequest` - Update subscription destination or status
- `DeleteSubscriptionRequest` - Delete a subscription
- `EnableSubscriptionRequest` - Enable a disabled subscription
- `DisableSubscriptionRequest` - Disable an active subscription
- `TestSubscriptionRequest` - Send a test notification
- `CreateSubscriptionFilterRequest` - Create a filter for subscription
- `GetSubscriptionFilterRequest` - Get subscription filter details
- `DeleteSubscriptionFilterRequest` - Delete a subscription filter

**Topics (2/2):**
- `GetTopicRequest` - Get details of a notification topic
- `GetTopicsRequest` - Get all available notification topics

**Public Keys (1/1):**
- `GetPublicKeyRequest` - Get public key for validating notification payloads

### Sell API - Negotiation

**Offers (2/2):**
- `FindEligibleItemsRequest` - Find listings eligible for seller-initiated discount offers
- `SendOfferToInterestedBuyersRequest` - Send discount offers to buyers who showed interest (Watch list, abandoned cart)

### Sell API - Marketing

**Campaigns (19/19):**
- CRUD: `CreateCampaignRequest`, `GetCampaignRequest`, `GetCampaignsRequest`, `DeleteCampaignRequest`
- Lifecycle: `EndCampaignRequest`, `PauseCampaignRequest`, `ResumeCampaignRequest`, `LaunchCampaignRequest`
- Management: `CloneCampaignRequest`, `UpdateCampaignBudgetRequest`, `UpdateCampaignIdentificationRequest`, `UpdateAdRateStrategyRequest`, `UpdateBiddingStrategyRequest`
- Helpers: `GetCampaignByNameRequest`, `FindCampaignByAdReferenceRequest`, `SetupQuickCampaignRequest`, `SuggestBudgetRequest`, `SuggestItemsRequest`, `SuggestMaxCpcRequest`

**Ads (16/16):**
- Single: `CreateAdByListingIdRequest`, `GetAdRequest`, `GetAdsRequest`, `DeleteAdRequest`, `UpdateBidRequest`
- By Inventory: `CreateAdsByInventoryReferenceRequest`, `GetAdsByInventoryReferenceRequest`, `DeleteAdsByInventoryReferenceRequest`
- Bulk Operations: `BulkCreateAdsByListingIdRequest`, `BulkCreateAdsByInventoryReferenceRequest`, `BulkDeleteAdsByListingIdRequest`, `BulkDeleteAdsByInventoryReferenceRequest`, `BulkUpdateAdsBidByListingIdRequest`, `BulkUpdateAdsBidByInventoryReferenceRequest`, `BulkUpdateAdsStatusRequest`, `BulkUpdateAdsStatusByListingIdRequest`

**Ad Groups (6/6):**
- `CreateAdGroupRequest`, `GetAdGroupRequest`, `GetAdGroupsRequest`, `UpdateAdGroupRequest`, `SuggestBidsRequest`, `SuggestKeywordsRequest`

**Keywords (6/6):**
- `CreateKeywordRequest`, `GetKeywordRequest`, `GetKeywordsRequest`, `UpdateKeywordRequest`, `BulkCreateKeywordRequest`, `BulkUpdateKeywordRequest`

**Negative Keywords (6/6):**
- `CreateNegativeKeywordRequest`, `GetNegativeKeywordRequest`, `GetNegativeKeywordsRequest`, `UpdateNegativeKeywordRequest`, `BulkCreateNegativeKeywordRequest`, `BulkUpdateNegativeKeywordRequest`

**Promotions (12/12):**
- Base: `GetPromotionsRequest`, `GetListingSetRequest`, `PausePromotionRequest`, `ResumePromotionRequest`
- Item Promotion: `CreateItemPromotionRequest`, `GetItemPromotionRequest`, `UpdateItemPromotionRequest`, `DeleteItemPromotionRequest`
- Price Markdown: `CreateItemPriceMarkdownPromotionRequest`, `GetItemPriceMarkdownPromotionRequest`, `UpdateItemPriceMarkdownPromotionRequest`, `DeleteItemPriceMarkdownPromotionRequest`

**Reports (9/9):**
- Ad Report: `GetReportRequest`
- Ad Report Metadata: `GetReportMetadataRequest`, `GetReportMetadataForReportTypeRequest`
- Ad Report Task: `CreateReportTaskRequest`, `GetReportTaskRequest`, `GetReportTasksRequest`, `DeleteReportTaskRequest`
- Promotion Report: `GetPromotionReportsRequest`, `GetPromotionSummaryReportRequest`

**Email Campaign (8/8):**
- `CreateEmailCampaignRequest`, `GetEmailCampaignRequest`, `GetEmailCampaignsRequest`, `UpdateEmailCampaignRequest`, `DeleteEmailCampaignRequest`, `GetAudiencesRequest`, `GetEmailPreviewRequest`, `GetEmailReportRequest`

### Sell API - Recommendation

**Listing Recommendations (1/1):**
- `FindListingRecommendationsRequest` - Get optimization recommendations and suggested bid rates for Promoted Listings

### Sell API - Analytics

**Customer Service Metrics (1/1):**
- `GetCustomerServiceMetricRequest` - Get customer service performance metrics (ITEM_NOT_AS_DESCRIBED, ITEM_NOT_RECEIVED) with benchmarks vs peer group

**Seller Standards Profile (2/2):**
- `FindSellerStandardsProfilesRequest` - Get detailed performance metrics for seller account (service level, defect rate, performance indicators)
- `GetSellerStandardsProfileRequest` - Get specific performance metrics by program (PROGRAM_US, PROGRAM_UK, PROGRAM_DE, PROGRAM_GLOBAL) and cycle

**Traffic Reports (1/1):**
- `GetTrafficReportRequest` - Generate customized traffic report showing buyer engagement (impressions, clicks, conversion rates, transactions) by DAY or LISTING dimension

### Sell API - Translation

**Translation (1/1):**
- `TranslateRequest` - Translate item titles or descriptions between languages (en, de, fr, it, es, zh-Hans, zh-Hant) with context support (ITEM_TITLE, ITEM_DESCRIPTION)

### Sell API - Compliance

**Listing Violations Summary (1/1):**
- `GetListingViolationsSummaryRequest` - Get count of listing violations grouped by compliance type (PRODUCT_ADOPTION, RETURN_POLICY, HTTPS_IMAGE_ISSUES, PRODUCT_SAFETY, etc.)

**Listing Violations (1/1):**
- `GetListingViolationsRequest` - Get detailed violations with specific issues, affected listings, and corrective recommendations for fixing compliance problems

### Sell API - Identity

**User Profile (1/1):**
- `GetUserRequest` - Retrieve authenticated user's account profile information for OAuth login scenarios. ⚠️ Requires User OAuth Token (not Application Token). Returns username, userId, and PII based on granted scopes.

### Post-Order API

⚠️ **All Post-Order API methods require User OAuth Token (not Application Token)**

**Cancellation Resource (7/7):**
- `ApproveCancellationRequest` - Seller approves buyer's cancellation request
- `CheckCancellationEligibilityRequest` - Verify if order is eligible for cancellation
- `ConfirmCancellationRefundRequest` - Buyer confirms refund was received
- `CreateCancellationRequest` - Create cancellation request (buyer or seller)
- `GetCancellationRequest` - Get cancellation details
- `RejectCancellationRequest` - Seller rejects cancellation request
- `SearchCancellationsRequest` - Search cancellations with filters (date, state, role)

**Case Management Resource (10/10):**
- `AppealCaseDecisionRequest` - Appeal a case decision made by eBay
- `GetCaseRequest` - Get case details (INR, SNAD disputes)
- `IssueCaseRefundRequest` - Seller issues refund for a case
- `ProvideReturnAddressRequest` - Seller provides return address
- `ProvideShippingInfoRequest` - Seller provides tracking info
- `SearchCasesRequest` - Search cases with filters (date, status, item)
- `SendMessageRequest` - Send message to other party in case
- `SubmitEvidenceRequest` - Submit evidence (tracking, documents)
- `UploadEvidenceFileRequest` - Upload evidence files (photos, docs)
- `GetActivityOptionsRequest` - Get available actions for current case state

**Return Resource (20/20):**
- `CheckReturnEligibilityRequest` - Check if item is eligible for return
- `CreateReturnRequest` - Buyer creates return request
- `GetReturnRequest` - Get return details
- `SearchReturnsRequest` - Search returns with filters (date, state, item)
- `EscalateReturnRequest` - Escalate return to eBay Customer Service
- `GetEstimateRequest` - Get return shipping cost estimate
- `GetReturnPreferencesRequest` - Get seller's return preferences
- `SetReturnPreferencesRequest` - Set seller's return preferences (auto-accept)
- `ProvideSellerInfoRequest` - Seller provides return info/address
- `InitiateShippingLabelRequest` - Generate return shipping label
- `IssueReturnRefundRequest` - Seller issues refund for returned item
- `MarkReturnReceivedRequest` - Mark returned item as received
- `ProcessReturnRequestRequest` - Seller decides on return (accept/reject/partial)
- `SendReturnMessageRequest` - Send message about return
- `SubmitReturnFileRequest` - Activate uploaded return files
- `UploadReturnFileRequest` - Upload return photos/documents
- `CreateReturnDraftRequest` - Create draft return (complete later)
- `GetReturnDraftRequest` - Get draft return details
- `DeleteReturnDraftRequest` - Delete draft return
- `DecideReturnRequest` - Make decision on return request

**Inquiry Resource (5/5):**
- `CheckInquiryEligibilityRequest` - Check if item is eligible for inquiry
- `CloseInquiryRequest` - Close inquiry (buyer satisfied)
- `CreateInquiryRequest` - Buyer creates inquiry about order issue
- `GetInquiryRequest` - Get inquiry details
- `SearchInquiriesRequest` - Search inquiries with filters

### Commerce API - Taxonomy

**Category Navigation (9/9):**
- `GetDefaultCategoryTreeIdRequest` - Get the default category tree ID for a marketplace
- `GetCategorySuggestionsRequest` - Get category suggestions for a query
- `GetCategoryTreeRequest` - Get the complete category tree
- `GetCategorySubtreeRequest` - Get a subtree below a specific category
- `GetItemAspectsForCategoryRequest` - Get aspects for a specific leaf category
- `GetCompatibilityPropertiesRequest` - Get compatible vehicle properties for parts categories
- `GetCompatibilityPropertyValuesRequest` - Get values for a specific compatibility property (with filters)
- `GetExpiredCategoriesRequest` - Get mappings of expired categories to active replacements
- `FetchItemAspectsRequest` - Fetch all item aspects for leaf categories (gzipped response)

## Available Enums

The package provides 27 type-safe enums for API constants:

### Core Enums
- `Environment` - API environment (sandbox/production)
- `MarketplaceId` - All eBay marketplaces (EBAY_US, EBAY_GB, etc.)
- `ContentLanguage` - Content language codes (en-US, en-GB, de-DE, etc.)
- `Locale` - Category tree locales

### Inventory Enums
- `Condition` - Item condition (NEW, USED_EXCELLENT, REFURBISHED, etc.)
- `AvailabilityType` - Availability types (IN_STOCK, OUT_OF_STOCK, SHIP_TO_STORE)
- `PackageType` - Package types (LETTER, BULKY_GOODS, CARAVAN, etc.)
- `LengthUnitOfMeasure` - Length units (INCH, FEET, CENTIMETER, METER)
- `WeightUnitOfMeasure` - Weight units (POUND, KILOGRAM, OUNCE, GRAM)
- `TimeDurationUnit` - Time duration units (YEAR, MONTH, DAY, HOUR, etc.)
- `LocationType` - Location types (WAREHOUSE, STORE)
- `MerchantLocationStatus` - Location status (ENABLED, DISABLED)

### Offer Enums
- `OfferFormat` - Listing format (FIXED_PRICE, AUCTION)
- `OfferStatus` - Offer status (PUBLISHED, UNPUBLISHED, OUT_OF_STOCK, ENDED)

### Taxonomy Enums
- `AspectApplicableTo` - Aspect applicability (ITEM, PRODUCT)
- `AspectDataType` - Aspect data types (STRING, STRING_ARRAY, NUMBER, DATE)
- `AspectMode` - Aspect mode (FREE_TEXT, SELECTION_ONLY)
- `AspectUsage` - Aspect usage (RECOMMENDED, OPTIONAL, REQUIRED)
- `ItemToAspectCardinality` - Item-to-aspect relationship (SINGLE, MULTI)
- `AspectAdvancedDataType` - Advanced aspect data types (RATING, RANGE, CURRENCY, etc.)

### Stores Enums
- `StoreSubscriptionLevel` - Store subscription levels (BASIC, PREMIUM, ANCHOR, STARTER)
- `StoreTaskStatus` - Store task status (PENDING, IN_PROGRESS, COMPLETED, FAILED)

### Media Enums
- `MediaStatus` - Media status (PENDING, PROCESSING, LIVE, FAILED, BLOCKED)
- `DocumentPurpose` - Document purposes (PRODUCT_SAFETY, PRODUCT_COMPLIANCE, etc.)

### Feed Enums
- `FeedType` - Feed types (LMS_ORDER_REPORT, LMS_ACTIVE_INVENTORY_REPORT, etc.)
- `TaskStatus` - Task status (QUEUED, IN_PROCESS, COMPLETED, COMPLETED_WITH_ERROR, FATAL)
- `ScheduleStatus` - Schedule status (ACTIVE, INACTIVE)

### Marketing Enums
- `CampaignStatus` - Campaign status (RUNNING, PAUSED, ENDED, SCHEDULED)
- `CampaignCriterionType` - Campaign criterion types (INVENTORY_PARTITION, INVENTORY_BY_RULE)
- `FundingStrategy` - Funding strategy (COST_PER_SALE, COST_PER_CLICK)
- `PromotionStatus` - Promotion status (DRAFT, SCHEDULED, RUNNING, PAUSED, ENDED)
- `PromotionType` - Promotion types (MARKDOWN_SALE, ORDER_DISCOUNT, VOLUME_DISCOUNT, SHIPPING_DISCOUNT)
- `AdStatus` - Ad status (ACTIVE, PAUSED, ARCHIVED)
- `EmailCampaignStatus` - Email campaign status (DRAFT, SCHEDULED, SENT, CANCELED)

## Testing

The package includes a comprehensive test suite with 127 tests covering all 58 Request classes.

### Running Tests

```bash
composer test
```

### Test Coverage

- **100% Request Class Coverage** - All 58 Request classes tested
- **127 Tests** across 10 test files
- **Test Infrastructure**:
  - MocksApiResponses trait for mocking Guzzle responses
  - 3 Factories for complex Data objects
  - 8 JSON Fixtures for realistic mock responses

### Test Breakdown

- **InventoryItem**: 16 tests (validation, builder, endpoint, data mapping)
- **Offer**: 22 tests (all 12 Request classes)
- **Location**: 10 tests (full location management)
- **InventoryItemGroup**: 5 tests (builder, validation)
- **ProductCompatibility**: 4 tests (builder, validation)
- **Listing**: 4 tests (bulk operations)
- **Taxonomy**: 12 tests (all 12 methods)
- **Stores**: 15 tests (all 8 methods)
- **Validation**: 39 tests (comprehensive scenarios)

### Writing Tests

Use the provided factories and fixtures:

```php
use Sashalenz\EbayApi\Tests\Factories\InventoryItemDataFactory;
use Sashalenz\EbayApi\Tests\Factories\OfferDataFactory;

// Create test data
$item = InventoryItemDataFactory::make(['sku' => 'TEST-SKU']);
$offer = OfferDataFactory::makeComplete();

// Mock API responses
$mockResponse = $this->successResponse($this->loadFixture('OfferResponse.json'));
$client = $this->createMockClient([$mockResponse]);
```

## Error Handling

The package provides specific exceptions for different error scenarios:

```php
use Sashalenz\EbayApi\Exceptions\AuthenticationException;
use Sashalenz\EbayApi\Exceptions\RequestException;

try {
    $response = $request->send();
} catch (AuthenticationException $e) {
    // Handle authentication errors
    Log::error('eBay authentication failed: ' . $e->getMessage());
} catch (RequestException $e) {
    // Handle request errors
    Log::error('eBay request failed: ' . $e->getMessage());
    
    // Get detailed error information
    $errors = $e->getErrors();
}
```

## Platform Notifications (Webhooks)

The package includes complete support for eBay Platform Notifications - SOAP-based push notifications sent by eBay when events occur on the platform.

### Setup

1. **Publish and run migrations:**

```bash
php artisan vendor:publish --tag="ebay-api-migrations"
php artisan migrate
```

2. **Configure webhook URL** in `.env`:

```env
EBAY_NOTIFICATIONS_ENABLED=true
EBAY_NOTIFICATIONS_ROUTE=ebay/notifications
EBAY_NOTIFICATIONS_VALIDATE_SIGNATURE=false
EBAY_NOTIFICATIONS_QUEUE=default
EBAY_NOTIFICATIONS_STORE_DB=true
```

3. **Configure in eBay Seller Hub:**
   - Go to eBay Developer Account
   - Set notification delivery URL: `https://your-domain.com/ebay/notifications`
   - Subscribe to desired events (ItemListed, ItemSold, OrderCreated, etc.)

### Webhook Endpoint

The package automatically registers a webhook endpoint at the configured route (default: `/ebay/notifications`).

The controller:
- Parses incoming SOAP XML
- Validates signature (optional)
- Stores notification in database
- Dispatches queue job for async processing
- Returns HTTP 200 (required by eBay)

### Listening to Events

Listen to notification events in your `EventServiceProvider`:

```php
use Sashalenz\EbayApi\Events\Notifications\ItemSoldEvent;
use Sashalenz\EbayApi\Events\Notifications\MarketplaceAccountDeletionEvent;

protected $listen = [
    ItemSoldEvent::class => [
        SendOrderConfirmationEmail::class,
        UpdateInventoryQuantity::class,
    ],
    MarketplaceAccountDeletionEvent::class => [
        DeleteUserData::class, // GDPR compliance
    ],
];
```

### Available Events

- `ItemListedEvent` - Item was listed
- `ItemSoldEvent` - Item was sold
- `ItemEndedEvent` - Listing ended
- `ItemRevisedEvent` - Listing was revised
- `FeedbackReceivedEvent` - Feedback received
- `OrderCreatedEvent` - Order was created
- `OrderCancelledEvent` - Order was cancelled
- `MarketplaceAccountDeletionEvent` - User deleted account (GDPR)
- `BuyerRequestedPurchaseQuoteEvent` - Buyer requested quote
- `ItemAvailabilityEvent` - Item availability changed

### Event Handler Example

```php
namespace App\Listeners;

use Sashalenz\EbayApi\Events\Notifications\ItemSoldEvent;
use Illuminate\Support\Facades\Log;

class HandleItemSold
{
    public function handle(ItemSoldEvent $event): void
    {
        Log::info('Item sold on eBay', [
            'item_id' => $event->itemId,
            'transaction_id' => $event->transactionId,
            'buyer' => $event->buyerUserId,
            'quantity' => $event->quantityPurchased,
            'price' => $event->transactionPrice,
        ]);

        // Update your inventory
        // Send confirmation email
        // Create shipping label
        // etc.
    }
}
```

### GDPR Compliance - Account Deletion

**CRITICAL:** Handle `MarketplaceAccountDeletionEvent` to comply with data protection regulations:

```php
use Sashalenz\EbayApi\Events\Notifications\MarketplaceAccountDeletionEvent;

class DeleteUserData
{
    public function handle(MarketplaceAccountDeletionEvent $event): void
    {
        // Delete or anonymize user data
        User::where('ebay_user_id', $event->userId)->delete();
        
        Log::info('User data deleted for GDPR compliance', [
            'user_id' => $event->userId,
            'deletion_date' => $event->deletionDate,
        ]);
    }
}
```

### Querying Notifications

```php
use Sashalenz\EbayApi\Models\EbayNotification;

// Get unprocessed notifications
$pending = EbayNotification::unprocessed()->get();

// Get failed notifications
$failed = EbayNotification::failed()->get();

// Get notifications by event type
$itemSoldNotifications = EbayNotification::byEventName('ItemSold')->get();

// Get notifications for specific user
$userNotifications = EbayNotification::byRecipient('user123')->get();
```

### Signature Validation

For production, enable signature validation to verify notifications are from eBay:

```env
EBAY_NOTIFICATIONS_VALIDATE_SIGNATURE=true
```

The package validates:
- MD5 signature: `base64_encode(md5(Timestamp + DevId + AppId + CertId))`
- Timestamp within 10-minute window (prevents replay attacks)

Invalid signatures are logged but webhook still returns 200 to prevent eBay retries.

### Manual Processing

Reprocess failed notifications:

```php
use Sashalenz\EbayApi\Jobs\ProcessEbayNotificationJob;

$failedNotifications = EbayNotification::failed()->get();

foreach ($failedNotifications as $notification) {
    ProcessEbayNotificationJob::dispatch($notification->id);
}
```

## Marketplace Account Deletion (GDPR Compliance)

In addition to Platform Notifications, eBay requires a separate HTTP endpoint for marketplace account deletion notifications. This is an additional GDPR compliance requirement.

**Documentation**: https://developer.ebay.com/marketplace-account-deletion

### Setup

1. **Enable the endpoint** in `.env`:

```env
EBAY_MAD_ENABLED=true
EBAY_MAD_ROUTE=ebay/account-deletion
EBAY_MAD_VERIFICATION_TOKEN=your-secure-token-32-80-chars
EBAY_MAD_QUEUE=default
EBAY_MAD_STORE_DB=true
```

2. **Generate verification token** (32-80 characters required):

```bash
openssl rand -base64 48
```

Copy the generated token to `EBAY_MAD_VERIFICATION_TOKEN` in `.env`.

3. **Register endpoint in eBay Developer Portal:**
   - Go to: https://developer.ebay.com/my/auth/?tab=marketplaceAccountDeletion
   - Enter your endpoint URL: `https://your-domain.com/ebay/account-deletion`
   - eBay will send a verification challenge to validate your endpoint

### How it Works

The endpoint handles two types of requests:

#### 1. Verification Challenge (GET)

eBay sends a GET request with `challenge_code` parameter:

```
GET https://your-domain.com/ebay/account-deletion?challenge_code=ABC123...
```

The controller automatically calculates and returns:

```json
{
  "challengeResponse": "hash(challenge_code + verification_token + endpoint_url)"
}
```

#### 2. Deletion Notification (POST)

eBay sends a POST request when a user deletes their marketplace account:

```json
{
  "metadata": {
    "topic": "MARKETPLACE_ACCOUNT_DELETION",
    "schemaVersion": "1.0"
  },
  "notification": {
    "notificationId": "...",
    "eventDate": "2025-10-15T12:34:56.000Z",
    "data": {
      "username": "buyer123",
      "userId": "U123456789",
      "eiasToken": "..."
    }
  }
}
```

### Listening to Deletion Notifications

Register listener in your `EventServiceProvider`:

```php
use Sashalenz\EbayApi\Events\Notifications\MarketplaceAccountDeletionNotificationEvent;

protected $listen = [
    MarketplaceAccountDeletionNotificationEvent::class => [
        DeleteUserEbayData::class,
    ],
];
```

### Event Handler Example

**CRITICAL**: You MUST delete or anonymize all user data to comply with GDPR:

```php
namespace App\Listeners;

use Sashalenz\EbayApi\Events\Notifications\MarketplaceAccountDeletionNotificationEvent;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class DeleteUserEbayData
{
    public function handle(MarketplaceAccountDeletionNotificationEvent $event): void
    {
        $username = $event->getUsername();
        $userId = $event->getUserId();

        // Find user by eBay user ID
        $user = User::where('ebay_user_id', $userId)->first();

        if ($user) {
            // Delete or anonymize all eBay-related data
            $user->orders()->where('source', 'ebay')->delete();
            $user->ebay_listings()->delete();
            $user->ebay_transactions()->delete();
            
            // Anonymize user data
            $user->update([
                'ebay_user_id' => null,
                'ebay_username' => null,
                'ebay_access_token' => null,
                'ebay_refresh_token' => null,
            ]);

            Log::info('User eBay data deleted for GDPR compliance', [
                'username' => $username,
                'user_id' => $userId,
                'notification_id' => $event->notification->notification_id,
            ]);
        }
    }
}
```

### Testing the Endpoint

**1. Test verification challenge:**

```bash
curl "https://your-domain.com/ebay/account-deletion?challenge_code=TEST123"
```

Expected response:

```json
{
  "challengeResponse": "abc123..."
}
```

**2. Test deletion notification (POST):**

```bash
curl -X POST https://your-domain.com/ebay/account-deletion \
  -H "Content-Type: application/json" \
  -d '{
    "notification": {
      "notificationId": "test-123",
      "data": {
        "username": "testuser",
        "userId": "U12345"
      }
    }
  }'
```

Expected response:

```json
{
  "status": "accepted"
}
```

### Queue Processing

Deletion notifications are processed asynchronously via queue jobs:

```php
use Sashalenz\EbayApi\Jobs\ProcessMarketplaceAccountDeletionJob;

// Manually dispatch job
ProcessMarketplaceAccountDeletionJob::dispatch($notificationId);

// Check queue status
php artisan queue:work --queue=default
```

### Database Storage

If `EBAY_MAD_STORE_DB=true`, notifications are stored in `ebay_notifications` table with:

- `event_name`: `MARKETPLACE_ACCOUNT_DELETION`
- `notification_id`: eBay notification ID
- `recipient_user_id`: eBay user ID
- `payload`: Full JSON payload
- `processed`: Boolean flag

### Security Notes

1. **Verification Token**:
   - Must be 32-80 characters
   - Keep it secure (never commit to version control)
   - Use strong random generation: `openssl rand -base64 48`

2. **HTTPS Required**:
   - eBay only sends requests to HTTPS endpoints
   - Ensure your SSL certificate is valid

3. **Endpoint Validation**:
   - eBay validates your endpoint before activation
   - Ensure verification token is configured before registering

### Difference from Platform Notifications

| Feature | Platform Notifications | Account Deletion |
|---------|----------------------|------------------|
| Protocol | SOAP XML | JSON HTTP |
| Events | 10+ event types | 1 event type only |
| Request Type | POST only | GET (challenge) + POST |
| Verification | MD5 signature | Challenge/response |
| Purpose | Real-time events | GDPR compliance |

Both systems can coexist - use Platform Notifications for operational events and Account Deletion endpoint for GDPR compliance.

## Post-Order API Examples

⚠️ **Important**: Post-Order API requires User OAuth Token. Set it before making requests:

```php
use Sashalenz\EbayApi\Client\Auth\UserToken;
use Sashalenz\EbayApi\Requests\PostOrder\Return\CreateReturnRequest;
use Sashalenz\EbayApi\Requests\PostOrder\Cancellation\CreateCancellationRequest;

// Create user token
$userToken = new UserToken(
    appId: config('ebay-api.app_id'),
    certId: config('ebay-api.cert_id'),
    environment: \Sashalenz\EbayApi\Enums\Environment::from(config('ebay-api.environment')),
    accessToken: $user->ebay_access_token,
    refreshToken: $user->ebay_refresh_token,
    expiresAt: $user->ebay_token_expires_at,
    cacheKey: 'ebay_user_token_'.$user->id
);

// Set on client
$client = app(\Sashalenz\EbayApi\Client\EbayClient::class);
$client->setUserToken($userToken);
```

### Returns Management

```php
// Check return eligibility
$eligible = CheckReturnEligibilityRequest::make()
    ->itemId('110111222333')
    ->transactionId('123456')
    ->returnReason('NOT_AS_DESCRIBED')
    ->asData();

// Create return request
$return = CreateReturnRequest::make()
    ->itemId('110111222333')
    ->transactionId('123456')
    ->returnReason('NOT_AS_DESCRIBED')
    ->comments('Item has scratches not mentioned in description')
    ->preferredResolution('MONEY_BACK')
    ->asData();

echo "Return ID: {$return->returnId}";

// Search seller's returns
$returns = SearchReturnsRequest::make()
    ->returnState('RETURN_OPEN')
    ->role('SELLER')
    ->limit(50)
    ->asData();

foreach ($returns->returns as $return) {
    echo "Return {$return->returnId}: {$return->returnReason}\n";
}

// Seller provides return address
ProvideSellerInfoRequest::make($returnId)
    ->returnAddress([
        'addressLine1' => '123 Main St',
        'city' => 'San Jose',
        'stateOrProvince' => 'CA',
        'postalCode' => '95101',
        'country' => 'US'
    ])
    ->comments('Please return item to this address')
    ->send();

// Issue refund
IssueReturnRefundRequest::make($returnId)
    ->refundAmount('25.99', 'USD')
    ->comments('Refund issued for returned item')
    ->send();
```

### Cancellations

```php
// Buyer checks if order can be cancelled
$eligible = CheckCancellationEligibilityRequest::make()
    ->orderId('12-34567-89012')
    ->asData();

if ($eligible->eligible) {
    // Create cancellation request
    $cancellation = CreateCancellationRequest::make()
        ->orderId('12-34567-89012')
        ->cancelReason('BUYER_CANCEL_ORDER')
        ->cancelReasonMessage('Changed my mind')
        ->asData();
}

// Seller approves cancellation
ApproveCancellationRequest::make($cancelId)->send();

// Or seller rejects
RejectCancellationRequest::make($cancelId)
    ->rejectReasonMessage('Item already shipped')
    ->send();
```

### Cases (Disputes)

```php
// Search for open cases
$cases = SearchCasesRequest::make()
    ->caseStatusFilter('OPEN')
    ->role('SELLER')
    ->limit(50)
    ->asData();

// Get case details
$case = GetCaseRequest::make($caseId)
    ->fieldGroups('FULL')
    ->asData();

// Seller provides tracking info
ProvideShippingInfoRequest::make($caseId)
    ->trackingNumber('1Z999AA10123456784')
    ->shippingCarrierName('UPS')
    ->comments('Item was shipped on time')
    ->send();

// Upload evidence file
$file = UploadEvidenceFileRequest::make($caseId)
    ->file(file_get_contents($photoPath), 'proof.jpg')
    ->asData();

// Submit evidence with file
SubmitEvidenceRequest::make($caseId)
    ->evidenceType('PROOF_OF_SHIPMENT')
    ->trackingNumber('1Z999AA10123456784')
    ->fileIds([$file->fileId])
    ->text('Tracking shows delivered on time')
    ->send();

// Issue refund to resolve case
IssueCaseRefundRequest::make($caseId)
    ->refundAmount('50.00', 'USD')
    ->comments('Issuing full refund')
    ->send();
```

### Inquiries

```php
// Buyer creates inquiry
$inquiry = CreateInquiryRequest::make()
    ->itemId('110111222333')
    ->transactionId('123456')
    ->inquirySubject('SHIPPING_INFO')
    ->comments('When will item be shipped?')
    ->asData();

// Close inquiry (buyer satisfied)
CloseInquiryRequest::make($inquiryId)
    ->comments('Seller responded, issue resolved')
    ->send();
```

## Data Mapping

This package automatically maps API responses to type-safe Data objects using [Spatie Laravel Data](https://spatie.be/docs/laravel-data).

### Quick Examples

```php
// Single object - client is auto-injected!
$item = GetInventoryItemRequest::make('SKU-123')->asData();
echo $item->sku;

// Collection
$items = GetInventoryItemsRequest::make()->asData();
foreach ($items as $item) {
    echo $item->product?->title;
}
```


## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Vulnerabilities

If you discover a security vulnerability within this package, please send an email to sasha.lenz@gmail.com.

## Credits

- [Oleksandr Petrovskyi](https://github.com/sashalenz)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

