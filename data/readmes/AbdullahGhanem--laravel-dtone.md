# Laravel Dtone

[![Latest Stable Version](https://poser.pugx.org/ghanem/dtone/v/stable.svg)](https://packagist.org/packages/ghanem/dtone) [![License](https://poser.pugx.org/ghanem/dtone/license.svg)](https://packagist.org/packages/ghanem/dtone) [![Total Downloads](https://poser.pugx.org/ghanem/dtone/downloads.svg)](https://packagist.org/packages/ghanem/dtone)

A package that provides an interface between [Laravel](https://laravel.com) and [DT One DVS API](https://dvs-api-doc.dtone.com/#section/Overview).

## Requirements

- PHP ^7.2.5 | ^8.0
- Laravel ^7.0 | ^8.0 | ^9.0 | ^10.0 | ^11.0 | ^12.0

## Installation

- [Dtone on Packagist](https://packagist.org/packages/ghanem/dtone)
- [Dtone on GitHub](https://github.com/abdullahghanem/dtone)

You can install the package via composer:

```bash
composer require ghanem/dtone
```

Publish the config file:

```bash
php artisan vendor:publish --provider="Ghanem\Dtone\DtoneServiceProvider" --tag="config"
```

## Configuration

Add the following to your `.env` file:

```env
DTONE_KEY=your-production-api-key
DTONE_SECRET=your-production-api-secret
DTONE_TEST_KEY=your-sandbox-api-key
DTONE_TEST_SECRET=your-sandbox-api-secret
DTONE_IS_PRODUCTION=false
DTONE_RETRIES=0
DTONE_RETRY_DELAY=100
```

Set `DTONE_IS_PRODUCTION=true` when you are ready to use the production API.

### Retry Configuration

You can enable automatic retries for failed requests:

```env
DTONE_RETRIES=3
DTONE_RETRY_DELAY=100
```

This will retry failed requests up to 3 times with a 100ms delay between attempts.

## Usage

You can use the `Dtone` facade or resolve it from the container.

```php
use Ghanem\Dtone\Facades\Dtone;
```

### Services

```php
// List all services (returns PaginatedResponse of Service DTOs)
$services = Dtone::services($page, $per_page);

$services->getData();           // array of Service DTOs
$services->getMeta()->getTotal(); // total count

// Get a service by ID
$service = Dtone::serviceById(1);
$service->getId();
$service->getName();
```

### Countries

```php
// List all countries
$countries = Dtone::countries($page, $per_page);

// Get a country by ISO code
$country = Dtone::countryByIsoCode('US');
$country->getIsoCode();    // 'US'
$country->getName();       // 'United States'
$country->getRegions();    // array
```

### Operators

```php
// List all operators (optionally filter by country)
$operators = Dtone::operators('US', $page, $per_page);

// Get an operator by ID
$operator = Dtone::operatorById(5);
$operator->getId();
$operator->getName();
$operator->getCountry();            // Country DTO
$operator->getCountry()->getName(); // nested access

// Lookup operators by mobile number
$result = Dtone::lookupOperatorsByMobileNumber('+1234567890');
```

### Products

```php
// List products with filters
$products = Dtone::products(
    $type,              // e.g. 'FIXED_VALUE_RECHARGE'
    $service_id,        // e.g. 1
    $country_iso_code,  // e.g. 'US'
    $benefit_types,     // e.g. ['Airtime']
    $page,
    $per_page
);

// Get a product by ID
$product = Dtone::productById(99);
$product->getId();
$product->getType();
$product->getService();              // Service DTO
$product->getOperator();             // Operator DTO
$product->getAttribute('prices');    // raw array for nested fields
```

### Campaigns

```php
// List active campaigns
$campaigns = Dtone::campaigns($page, $per_page);

// Get a campaign by ID
$campaign = Dtone::campaignById(7);
$campaign->getId();
$campaign->getName();
```

### Promotions

```php
// List promotions
$promotions = Dtone::promotions($page, $per_page);

// Get a promotion by ID
$promotion = Dtone::promotionById(3);
$promotion->getOperator(); // Operator DTO or null
```

### Benefit Types

```php
// List all benefit types
$benefitTypes = Dtone::benefitTypes($page, $per_page);
```

### Balances

```php
$balances = Dtone::balances(); // array of Balance DTOs

foreach ($balances as $balance) {
    $balance->getAmount();    // 150.50
    $balance->getCurrency();  // 'USD'
}
```

### Transactions

```php
// List transactions
$transactions = Dtone::transactions($page, $per_page);

// Get a transaction by ID
$transaction = Dtone::transactionById(456);
$transaction->getId();
$transaction->getStatus();
$transaction->getExternalId();
$transaction->getAttribute('product');  // raw array

// Create a transaction (async)
$transaction = Dtone::createTransaction(
    'external-id-123',                      // external_id
    99,                                     // product_id
    ['mobile_number' => '+1234567890'],     // credit_party_identifier
    false                                   // auto_confirm (default: false)
);

// Create a transaction (sync - waits for completion)
$transaction = Dtone::createTransactionSync(
    'external-id-123',
    99,
    ['mobile_number' => '+1234567890'],
    true                                    // auto_confirm
);

// Confirm a transaction (async)
$confirmed = Dtone::confirmTransaction($transaction_id);

// Confirm a transaction (sync - waits for completion)
$confirmed = Dtone::confirmTransactionSync($transaction_id);

// Cancel a transaction
$cancelled = Dtone::cancelTransaction($transaction_id);
```

### Lookups

```php
// Lookup operators by mobile number
$operators = Dtone::lookupOperatorsByMobileNumber('+1234567890');

// Statement inquiry
$statement = Dtone::statementInquiry(
    99,                                     // product_id
    ['account_number' => '123456']          // credit_party_identifier
);

// Get remaining benefits for a credit party
$benefits = Dtone::creditPartyBenefits(
    99,                                     // product_id
    ['mobile_number' => '+1234567890']      // credit_party_identifier
);

// Get status for a credit party
$status = Dtone::creditPartyStatus(
    99,                                     // product_id
    ['mobile_number' => '+1234567890']      // credit_party_identifier
);
```

### Response DTOs

All API responses are returned as typed DTO objects. Every DTO has a `toArray()` method for backward compatibility:

```php
$service = Dtone::serviceById(1);
$service->toArray();  // ['id' => 1, 'name' => 'Mobile']

$response = Dtone::services();
$response->toArray(); // ['data' => [...], 'meta' => [...]]
```

Available DTOs: `Service`, `Country`, `Operator`, `Product`, `Balance`, `Transaction`, `Campaign`, `Promotion`, `BenefitType`, `PaginatedResponse`, `Meta`.

### Paginated Responses

List endpoints return a `PaginatedResponse` DTO:

```php
$response = Dtone::services(1, 10);

$response->getData();                  // array of DTOs
$response->getMeta()->getTotal();      // total items
$response->getMeta()->getTotalPages(); // total pages
$response->getMeta()->getPage();       // current page
$response->getMeta()->getPerPage();    // items per page
$response->getMeta()->getNextPage();   // next page number
$response->getMeta()->getPrevPage();   // previous page number
```

## Webhooks

The package automatically registers a webhook endpoint to receive DT One transaction callbacks.

### Configuration

```env
DTONE_WEBHOOK_PATH=dtone/webhook
DTONE_WEBHOOK_SECRET=your-webhook-secret
DTONE_WEBHOOK_LOGGING=false
```

You can also configure middleware in `config/dtone.php`:

```php
'webhook_middleware' => ['api'],
```

Set `webhook_path` to `null` to disable the webhook route.

### Events

The webhook controller dispatches the following events:

| Event | Dispatched when |
|-------|----------------|
| `TransactionStatusChanged` | Every webhook (always dispatched) |
| `TransactionCompleted` | Status is `COMPLETED` |
| `TransactionFailed` | Status is `FAILED` or `DECLINED` |
| `TransactionConfirmed` | Status is `CONFIRMED` |
| `TransactionCancelled` | Status is `CANCELLED` |

Listen to events in your `EventServiceProvider`:

```php
use Ghanem\Dtone\Events\TransactionCompleted;

protected $listen = [
    TransactionCompleted::class => [
        YourTransactionCompletedListener::class,
    ],
];
```

Each event has `$payload`, `$status`, and `$transactionId` properties:

```php
public function handle(TransactionCompleted $event)
{
    $event->transactionId; // 123
    $event->status;        // 'COMPLETED'
    $event->payload;       // full webhook payload array
}
```

### Signature Verification

If `DTONE_WEBHOOK_SECRET` is set, the `VerifyWebhookSignature` middleware is available:

```php
// config/dtone.php
'webhook_middleware' => [
    \Ghanem\Dtone\Http\Middleware\VerifyWebhookSignature::class,
],
```

This verifies the `X-Dtone-Signature` header using HMAC-SHA256.

## Laravel Notifications Channel

Send top-ups as Laravel notifications using the `DtoneChannel`:

```php
use Ghanem\Dtone\Notifications\DtoneChannel;
use Ghanem\Dtone\Notifications\DtoneMessage;
use Illuminate\Notifications\Notification;

class SendAirtimeNotification extends Notification
{
    public function via($notifiable)
    {
        return [DtoneChannel::class];
    }

    public function toDtone($notifiable)
    {
        return DtoneMessage::create(99)          // product_id
            ->externalId('order-123')             // optional external ID
            ->toMobileNumber('+1234567890')       // recipient
            ->autoConfirm();                      // auto-confirm the transaction
    }
}
```

### DtoneMessage API

```php
DtoneMessage::create($productId)         // create with product ID
    ->externalId('ext-123')               // set external ID (auto-generated if not set)
    ->toMobileNumber('+1234567890')       // set mobile number recipient
    ->to(['account_number' => '123456'])  // or set custom identifier
    ->autoConfirm()                       // enable auto-confirm
    ->sync();                             // use synchronous API (default: async)
```

### On-Demand Notifications

```php
use Illuminate\Support\Facades\Notification;

Notification::route(DtoneChannel::class, null)
    ->notify(new SendAirtimeNotification());
```

## Caching

Discovery endpoints (services, countries, operators, products, campaigns, promotions, benefit-types) can be cached to reduce API calls:

```env
DTONE_CACHE_TTL=3600
```

Override TTL per endpoint:

```env
DTONE_CACHE_TTL_SERVICES=7200
DTONE_CACHE_TTL_COUNTRIES=86400
DTONE_CACHE_TTL_OPERATORS=3600
DTONE_CACHE_TTL_PRODUCTS=1800
```

Set `DTONE_CACHE_TTL=0` (default) to disable caching. Transactions, balances, and lookups are never cached.

Clear cache programmatically:

```php
use Ghanem\Dtone\Request;

Request::clearCache();              // clear all DT One cache
Request::clearCache('services');    // clear specific endpoint cache
```

## Artisan Commands

| Command | Description |
|---------|-------------|
| `dtone:balance` | Display account balances |
| `dtone:products` | List products (supports `--country`, `--type`, `--service`, `--page`, `--per-page`) |
| `dtone:transaction {id?}` | List transactions or get details by ID |
| `dtone:cache-clear {endpoint?}` | Clear DT One cache (all or specific endpoint) |
| `dtone:health` | Check API connectivity, balances, and service availability |

Examples:

```bash
php artisan dtone:balance
php artisan dtone:products --country=US --type=FIXED_VALUE_RECHARGE
php artisan dtone:transaction 456
php artisan dtone:cache-clear services
php artisan dtone:health
```

## Done

- [x] Services (list, get by ID)
- [x] Countries (list, get by ISO code)
- [x] Operators (list, get by ID)
- [x] Products (list with filters, get by ID)
- [x] Campaigns (list, get by ID)
- [x] Promotions (list, get by ID)
- [x] Benefit types (list)
- [x] Balances
- [x] Transactions (list, get by ID, create async/sync, confirm async/sync, cancel)
- [x] Lookup operators by mobile number
- [x] Statement inquiry lookup
- [x] Credit party lookup (remaining benefits, status)
- [x] Pagination support with meta data
- [x] Production / Sandbox environment switching
- [x] Retry mechanism for failed requests
- [x] Response DTOs (typed objects with toArray() compatibility)
- [x] Webhook / Callback support with event dispatching
- [x] Signature verification middleware
- [x] Laravel notifications channel integration
- [x] Caching layer for discovery endpoints
- [x] Configurable cache TTL per endpoint
- [x] Rate limiting awareness (respects `X-RateLimit` headers)
- [x] Artisan commands (`dtone:balance`, `dtone:products`, `dtone:transaction`, `dtone:cache-clear`, `dtone:health`)
- [x] Health check command
- [x] Test suite (110 tests, 248 assertions)
- [x] Support for Laravel 7 - 12

## Roadmap

- [ ] Batch transactions support
- [ ] Auto-paginate helper (fetch all pages automatically)
- [ ] Webhook queue integration (dispatch events to queue)

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
