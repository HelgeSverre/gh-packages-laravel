# Laravel Printavo

[![Tests](https://github.com/brandonjjon/laravel-printavo/actions/workflows/run-tests.yml/badge.svg)](https://github.com/brandonjjon/laravel-printavo/actions/workflows/run-tests.yml)
[![PHPStan](https://github.com/brandonjjon/laravel-printavo/actions/workflows/phpstan.yml/badge.svg)](https://github.com/brandonjjon/laravel-printavo/actions/workflows/phpstan.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/brandonjjon/laravel-printavo.svg)](https://packagist.org/packages/brandonjjon/laravel-printavo)
[![Total Downloads](https://img.shields.io/packagist/dt/brandonjjon/laravel-printavo.svg)](https://packagist.org/packages/brandonjjon/laravel-printavo)
[![License](https://img.shields.io/packagist/l/brandonjjon/laravel-printavo.svg)](https://packagist.org/packages/brandonjjon/laravel-printavo)

A Laravel package providing an Eloquent-like interface to the Printavo GraphQL API. Query customers, orders, invoices, and more using familiar Laravel patterns.

## Installation

Install the package via Composer:

```bash
composer require brandonjjon/laravel-printavo
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="printavo-config"
```

## Configuration

Add your Printavo API credentials to your `.env` file:

```env
PRINTAVO_EMAIL=your-email@example.com
PRINTAVO_TOKEN=your-api-token
```

You can find your API credentials in your Printavo account settings under API Access.

### Optional Configuration

```env
# Caching (enabled by default)
PRINTAVO_CACHE_ENABLED=true
PRINTAVO_CACHE_TTL=300
PRINTAVO_CACHE_STORE=redis

# Rate limiting (10 requests per 5 seconds by default)
PRINTAVO_RATE_LIMIT_REQUESTS=10
PRINTAVO_RATE_LIMIT_SECONDS=5
PRINTAVO_RATE_LIMIT_BEHAVIOR=wait  # or 'throw'
```

## Usage

### Basic Queries

```php
use Brandonjjon\Printavo\Facades\Printavo;

// Get all customers (returns Collection)
$customers = Printavo::customers()->get();

// Collection methods work as expected
$count = $customers->count();
$first = $customers->first();
$filtered = $customers->filter(fn ($c) => $c->orderCount > 10);

// Find a customer by ID
$customer = Printavo::customers()->find('abc123');

// Get the first customer
$customer = Printavo::customers()->first();
```

### Filtering

Each query builder has typed filter methods generated from the GraphQL schema.

```php
use Brandonjjon\Printavo\Data\Generated\Enums\OrderPaymentStatus;
use Brandonjjon\Printavo\Data\Generated\Enums\OrderSortField;

// Filter by payment status (enum)
$unpaid = Printavo::invoices()
    ->paymentStatus(OrderPaymentStatus::Unpaid)
    ->get();

// Filter by date range
$invoices = Printavo::invoices()
    ->inProductionAfter('2024-01-01')
    ->inProductionBefore('2024-12-31')
    ->get();

// Sort results
$invoices = Printavo::invoices()
    ->sortOn(OrderSortField::CustomerDueAt)
    ->sortDescending(true)
    ->get();

// Search with query string
$invoices = Printavo::invoices()
    ->query('acme corp')
    ->get();

// Filter by status IDs (get IDs from Printavo::statuses()->get())
$statuses = Printavo::statuses()->get();
$invoices = Printavo::invoices()
    ->statusIds([$statuses->first()->id])
    ->get();
```

Use your IDE's autocomplete to discover available filter methods for each resource.

### Selecting Fields

Use field constants for type-safe field selection:

```php
use Brandonjjon\Printavo\Data\Generated\Fields\CustomerFields;

$customers = Printavo::customers()
    ->select([
        CustomerFields::ID,
        CustomerFields::COMPANY_NAME,
        CustomerFields::ORDER_COUNT,
    ])
    ->get();
```

### Pagination

```php
// Paginate results (cursor-based)
$page = Printavo::customers()->paginate(25);

// Access items
foreach ($page->items() as $customer) {
    echo $customer->companyName;
}

// Get the next page
if ($page->hasMorePages()) {
    $nextPage = Printavo::customers()
        ->cursor($page->getNextCursor())
        ->paginate(25);
}
```

### Limiting Results

```php
// Get only 10 customers
$customers = Printavo::customers()->take(10)->get();
```

### Creating Records

```php
use Brandonjjon\Printavo\Data\Generated\CustomerCreateInput;

$response = Printavo::customerMutations()->create(
    new CustomerCreateInput(
        companyName: 'Acme Corp',
        // ... other fields
    )
);

if ($response->successful()) {
    $customer = $response->data();
}
```

### Updating Records

```php
use Brandonjjon\Printavo\Data\Generated\CustomerInput;

$response = Printavo::customerMutations()->update(
    'customer-id',
    new CustomerInput(
        companyName: 'Acme Corporation',
    )
);
```

### Deleting Records

```php
$response = Printavo::customerMutations()->delete('customer-id');
```

## Available Resources

### Queries

| Method | Description |
|--------|-------------|
| `contacts()` | Query contacts |
| `customers()` | Query customers |
| `inquiries()` | Query inquiries |
| `invoices()` | Query invoices |
| `merchStores()` | Query merch stores |
| `orders()` | Query orders |
| `paymentRequests()` | Query payment requests |
| `products()` | Query products |
| `quotes()` | Query quotes |
| `statuses()` | Query statuses |
| `tasks()` | Query tasks |
| `threads()` | Query threads |
| `transactions()` | Query transactions |

### Mutations

| Method | Operations |
|--------|------------|
| `contactMutations()` | create, update, delete |
| `customerMutations()` | create, update, delete |
| `customAddressMutations()` | create, creates, update, updates, delete, deletes |
| `feeMutations()` | create, creates, update, updates, delete, deletes |
| `imprintMutations()` | create, creates, update, updates, delete, deletes |
| `invoiceMutations()` | update, delete, duplicate |
| `lineItemMutations()` | create, creates, update, updates, delete, deletes |
| `lineItemGroupMutations()` | create, creates, update, updates, delete, deletes |
| `quoteMutations()` | create, update, delete, duplicate |
| `taskMutations()` | create, update, delete |
| `threadMutations()` | update |
| `transactionPaymentMutations()` | create, update, delete |
| ...and more | See full API documentation |

## DTOs

All responses are hydrated into typed Data Transfer Objects with IDE autocompletion support:

```php
$customer = Printavo::customers()->find('abc123');

// All properties are typed
echo $customer->id;           // string
echo $customer->companyName;  // ?string
echo $customer->orderCount;   // ?int
echo $customer->timestamps->createdAt; // ?Carbon
```

## Error Handling

```php
use Brandonjjon\Printavo\Exceptions\PrintavoException;
use Brandonjjon\Printavo\Exceptions\RateLimitException;

try {
    $customers = Printavo::customers()->get();
} catch (RateLimitException $e) {
    // Handle rate limit (only thrown if behavior is 'throw')
} catch (PrintavoException $e) {
    // Handle API errors
    echo $e->getMessage();
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

