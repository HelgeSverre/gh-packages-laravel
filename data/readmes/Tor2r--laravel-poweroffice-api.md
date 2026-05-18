# Laravel PowerOffice API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/tor2r/laravel-poweroffice-api.svg?style=flat-square)](https://packagist.org/packages/tor2r/laravel-poweroffice-api)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/tor2r/laravel-poweroffice-api/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/tor2r/laravel-poweroffice-api/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/tor2r/laravel-poweroffice-api/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/tor2r/laravel-poweroffice-api/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/tor2r/laravel-poweroffice-api.svg?style=flat-square)](https://packagist.org/packages/tor2r/laravel-poweroffice-api)

A Laravel client library for communicating with the [PowerOffice Go REST API](https://developer.poweroffice.net/) using OAuth 2.0 Client Credentials.
Provides a clean, resource-based
interface with automatic token caching, retry logic, and comprehensive error handling.

## Installation

You can install the package via composer:

```bash
composer require tor2r/laravel-poweroffice-api
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="poweroffice-api-config"
```

## Configuration

Set these environment variables in your `.env`:

```env
POWEROFFICE_ENVIRONMENT=demo          # "demo" or "production"
POWEROFFICE_APP_KEY=your-app-key
POWEROFFICE_CLIENT_KEY=your-client-key
POWEROFFICE_SUBSCRIPTION_KEY=your-subscription-key
```

Tokens are cached for 15 minutes (configurable via `POWEROFFICE_TOKEN_TTL`). The API token expires after 20 minutes -- the 5-minute buffer prevents
using an about-to-expire token.

This is the contents of the published config file:

```php
return [
    'environment' => env('POWEROFFICE_ENVIRONMENT', 'demo'),

    'app_key' => env('POWEROFFICE_APP_KEY'),
    'client_key' => env('POWEROFFICE_CLIENT_KEY'),
    'subscription_key' => env('POWEROFFICE_SUBSCRIPTION_KEY'),

    'environments' => [
        'production' => [
            'base_url' => 'https://goapi.poweroffice.net/v2',
            'token_url' => 'https://goapi.poweroffice.net/OAuth/Token',
        ],
        'demo' => [
            'base_url' => 'https://goapi.poweroffice.net/Demo/OAuth/Token',
            'token_url' => 'https://goapi.poweroffice.net/Demo/OAuth/Token',
        ],
    ],

    'token_ttl' => env('POWEROFFICE_TOKEN_TTL', 900),
];
```

## Usage

Access everything through the `PowerOfficeApi` facade:

```php
use Tor2r\PowerOfficeApi\Facades\PowerOfficeApi;
```

Or inject the client directly:

```php
use Tor2r\PowerOfficeApi\PowerOfficeClient;

public function __construct(private PowerOfficeClient $powerOffice) {}
```

## Available Methods

### Client Methods

| Method                                             | Description                                  |
|----------------------------------------------------|----------------------------------------------|
| `authenticate(): string`                           | Authenticate and return a fresh access token |
| `getAccessToken(): string`                         | Get cached token (authenticates if needed)   |
| `flushToken(): void`                               | Clear the cached token                       |
| `get(string $endpoint, array $query = []): array`  | Send a GET request                           |
| `post(string $endpoint, array $data = []): array`  | Send a POST request                          |
| `patch(string $endpoint, array $data = []): array` | Send a PATCH request                         |

### Resources

| Method                              | Description                   |
|-------------------------------------|-------------------------------|
| `customers(): CustomerResource`     | Get the customers resource    |
| `products(): ProductResource`       | Get the products resource     |
| `projects(): ProjectResource`       | Get the projects resource     |
| `salesOrders(): SalesOrderResource` | Get the sales orders resource |

### [CustomerResource](https://prdm0go0stor0apiv20eurw.z6.web.core.windows.net/?urls.primaryName=Customers)

| Method                                      | Description                                        |
|---------------------------------------------|----------------------------------------------------|
| `get(int $id): array`                       | Get a single customer                              |
| `getByOrgNr(int $id): array`                | Get customers by organization nr. OBS! Not unique. |
| `list(array $filters = []): array`          | List customers with optional filters               |
| `create(array $data): array`                | Create a customer                                  |
| `update(int $id, array $operations): array` | Update a customer (JSON Patch RFC 6902 operations) |

### [ProductResource](https://prdm0go0stor0apiv20eurw.z6.web.core.windows.net/?urls.primaryName=Products%20and%20Product%20Groups)

| Method                                      | Description                                       |
|---------------------------------------------|---------------------------------------------------|
| `get(int $id): array`                       | Get a single product                              |
| `list(array $filters = []): array`          | List products with optional filters               |
| `create(array $data): array`                | Create a product                                  |
| `update(int $id, array $operations): array` | Update a product (JSON Patch RFC 6902 operations) |

### [ProjectResource](https://prdm0go0stor0apiv20eurw.z6.web.core.windows.net/?urls.primaryName=Projects)

| Method                                      | Description                                       |
|---------------------------------------------|---------------------------------------------------|
| `get(int $id): array`                       | Get a single project                              |
| `list(array $filters = []): array`          | List projects with optional filters               |
| `create(array $data): array`                | Create a project                                  |
| `update(int $id, array $operations): array` | Update a project (JSON Patch RFC 6902 operations) |

### [SalesOrderResource](https://prdm0go0stor0apiv20eurw.z6.web.core.windows.net/?urls.primaryName=Sales%20Orders)

| Method                             | Description                             |
|------------------------------------|-----------------------------------------|
| `get(string $id): array`           | Get a single sales order (UUID)         |
| `list(array $filters = []): array` | List sales orders with optional filters |
| `create(array $data): array`       | Create a sales order                    |

## Examples

Each resource links to the corresponding PowerOffice API documentation for a complete list of parameter / attribute names.

### Customers

```php
// Get a single customer
$customer = PowerOfficeApi::customers()->get(12345);

// List customers with filters
$customers = PowerOfficeApi::customers()->list([
    'lastChangedDateTimeOffsetGreaterThan' => '2025-01-01T00:00:00+00:00',
]);

// Create a customer
$customer = PowerOfficeApi::customers()->create([
    'Name' => 'Acme Corp',
    'OrganizationNumber' => '912345678',
    'EmailAddress' => 'invoice@acme.no',
    'MailAddress' => [
        'AddressLine1' => 'Storgata 1',
        'City' => 'Oslo',
        'ZipCode' => '0150',
        'CountryCode' => 'NO',
    ],
]);

// Update a customer (JSON Patch RFC 6902)
$customer = PowerOfficeApi::customers()->update(12345, [
    ['op' => 'replace', 'path' => '/Name', 'value' => 'Acme Corp AS'],
    ['op' => 'replace', 'path' => '/EmailAddress', 'value' => 'new-invoice@acme.no'],
]);
```

### Products

```php
// Get a single product
$product = PowerOfficeApi::products()->get(100);

// List all products
$products = PowerOfficeApi::products()->list();

// Create a product
$product = PowerOfficeApi::products()->create([
    'Name' => 'Consulting Hour',
    'Description' => 'Standard consulting rate',
    'UnitPrice' => 1500.00,
    'UnitOfMeasureCode' => 'HUR',
]);

// Update a product (JSON Patch RFC 6902)
$product = PowerOfficeApi::products()->update(100, [
    ['op' => 'replace', 'path' => '/UnitPrice', 'value' => 1750.00],
]);
```

### Projects

```php
// Get a single project
$project = PowerOfficeApi::projects()->get(300);

// List active projects
$projects = PowerOfficeApi::projects()->list([
    'status' => 'Active',
    'excludeArchivedProject' => true,
]);

// Create a project
$project = PowerOfficeApi::projects()->create([
    'Name' => 'Website Redesign',
    'Code' => 'WEB-001',
    'CustomerId' => 12345,
    'StartDate' => '2025-06-01',
    'EndDate' => '2025-12-31',
    'ProjectBillingMethod' => 'TimeAndExpenses',
    'IsBillable' => true,
    'BillableRate' => 1500.00,
    'BudgetedHours' => 200,
]);

// Update a project (JSON Patch RFC 6902)
$project = PowerOfficeApi::projects()->update(300, [
    ['op' => 'replace', 'path' => '/Name', 'value' => 'Website Redesign v2'],
    ['op' => 'replace', 'path' => '/BudgetedHours', 'value' => 250],
]);
```

### Sales Orders

```php
// Get a single sales order (UUID)
$order = PowerOfficeApi::salesOrders()->get('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

// List sales orders
$orders = PowerOfficeApi::salesOrders()->list([
    'customerNos' => '12345',
]);

// Create a sales order
$order = PowerOfficeApi::salesOrders()->create([
    'CustomerId' => 12345,
    'SalesOrderDate' => '2025-06-01',
    'SalesOrderLines' => [
        [
            'ProductId' => 100,
            'Quantity' => 10,
            'UnitPrice' => 1500.00,
            'Description' => 'Consulting Hours - June',
        ],
        [
            'ProductId' => 200,
            'Quantity' => 1,
            'UnitPrice' => 5000.00,
            'Description' => 'Project setup fee',
        ],
    ],
]);
```

## Error Handling

The client throws specific exceptions based on the API response code:

| Exception                        | Status Code | Description                         |
|----------------------------------|-------------|-------------------------------------|
| `PowerOfficeValidationException` | 400, 422    | Bad request or validation errors    |
| `PowerOfficeAuthException`       | 401, 403    | Unauthorized or forbidden           |
| `PowerOfficeNotFoundException`   | 404         | Resource not found                  |
| `PowerOfficeConflictException`   | 409         | Resource in use, cannot be deleted  |
| `PowerOfficeApiException`        | 429, 5xx    | Rate limit exceeded or server error |

`PowerOfficeNotFoundException` and `PowerOfficeConflictException` extend `PowerOfficeApiException`, so you can catch the base class for any API error.

A `204 No Content` response (e.g. successful delete) returns an empty array.

```php
use Tor2r\PowerOfficeApi\Exceptions\PowerOfficeApiException;
use Tor2r\PowerOfficeApi\Exceptions\PowerOfficeAuthException;
use Tor2r\PowerOfficeApi\Exceptions\PowerOfficeConflictException;
use Tor2r\PowerOfficeApi\Exceptions\PowerOfficeNotFoundException;
use Tor2r\PowerOfficeApi\Exceptions\PowerOfficeValidationException;

try {
    $customer = PowerOfficeApi::customers()->create($data);
} catch (PowerOfficeValidationException $e) {
    // 400 / 422 -- bad request or validation errors
    $e->errors;   // ['name' => ['Name is required']]
    $e->response; // Illuminate\Http\Client\Response
} catch (PowerOfficeAuthException $e) {
    // 401 / 403 -- unauthorized or forbidden
    $e->context;  // ['body' => '...']
} catch (PowerOfficeNotFoundException $e) {
    // 404 -- resource does not exist
    $e->response; // Illuminate\Http\Client\Response
} catch (PowerOfficeConflictException $e) {
    // 409 -- resource is in use, cannot be deleted
    $e->response; // Illuminate\Http\Client\Response
} catch (PowerOfficeApiException $e) {
    // 429 / 5xx -- rate limit or server error (base class for all API errors)
    $e->response; // Illuminate\Http\Client\Response
    $e->getCode(); // HTTP status code
}
```

## Retry Behavior

Requests automatically retry up to 3 times with exponential backoff (500ms, 1000ms, 1500ms) on:

- **401** -- flushes the cached token, re-authenticates, then retries
- **429** -- rate limited, waits and retries
- **5xx** -- server errors, waits and retries

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Tor L](https://github.com/Tor2r)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
