# Dropday for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/dropday-io/laravel.svg?style=flat-square)](https://packagist.org/packages/dropday-io/laravel)
[![License](https://img.shields.io/github/license/dropday-io/laravel.svg?style=flat-square)](LICENSE)

Official Laravel package for the [Dropday](https://dropday.io) API — [GitHub](https://github.com/dropday-io/laravel) · [API docs](https://docs.dropday.io)

Send orders to dropshipping suppliers and track fulfillment status from your Laravel application.

**Dropday** is an order automation platform that connects your store to dropshipping suppliers. You push an order through the API; Dropday routes it to the right supplier, handles the fulfillment flow, and keeps you updated on the status.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## Installation

```bash
composer require dropday-io/laravel
```

The service provider and `Dropday` facade are registered automatically via Laravel's package auto-discovery.

Publish the config file:

```bash
php artisan vendor:publish --provider="Dropday\Dropday\DropdayServiceProvider"
```

## Configuration

Add your credentials to `.env`:

```env
DROPDAY_API_KEY=your-api-key
DROPDAY_ACCOUNT_ID=your-account-id
```

Both values are available in your [Dropday account settings](https://dropday.io). If you don't have an account yet, [sign up at dropday.io](https://dropday.io).

The config also exposes `DROPDAY_BASE_URL` if you need to point at a staging endpoint.

## Usage

You can use the facade or dependency injection.

### Facade

```php
use Dropday\Dropday\Facades\Dropday;

$order = Dropday::createOrder([
    'external_id' => 'your-internal-order-id',
    'shipping_address' => [
        'first_name' => 'Jane',
        'last_name'  => 'Doe',
        'address1'   => '123 Main St',
        'city'       => 'Amsterdam',
        'country'    => 'NL',
        'postcode'   => '1234AB',
    ],
    'products' => [
        ['sku' => 'PROD-001', 'quantity' => 1],
    ],
]);
```

### Dependency injection

```php
use Dropday\Dropday\Dropday;

class OrderController extends Controller
{
    public function __construct(protected Dropday $dropday) {}

    public function store(Request $request): JsonResponse
    {
        $result = $this->dropday->createOrder($request->validated());

        return response()->json($result);
    }
}
```

## Available methods

```php
// Submit a new order for fulfillment
Dropday::createOrder(array $data): array

// List orders, optionally filtered
Dropday::getOrders(array $filters = []): array

// Retrieve a single order by its Dropday reference ID
Dropday::getOrder(string $reference): array
```

**Filter keys for `getOrders`:** `statuses`, `per_page`, `page`, `date_from`, `date_to`, `external_id`, `source`.

**Duplicate orders:** if you submit an order with an `external_id` that already exists, Dropday returns HTTP 200 with `"Order already exists"` in the `message` key rather than an error.

For full request/response shapes, see the [Dropday API docs](https://docs.dropday.io).

## Test mode

Pass `"test" => true` in any order payload during development. Dropday will process the order through the full validation flow but skip actual supplier routing.

```php
Dropday::createOrder([
    'external_id' => 'test-order-001',
    'test'        => true,
    // ...
]);
```

## Error handling

| Situation | Behaviour |
|---|---|
| Validation failure (422) | Throws `Dropday\Dropday\Exceptions\DropdayException` |
| Any other HTTP error | Throws `Illuminate\Http\Client\RequestException` |
| Duplicate `external_id` | Returns 200; check `$result['message']` |

```php
use Dropday\Dropday\Exceptions\DropdayException;
use Illuminate\Http\Client\RequestException;

try {
    $order = Dropday::createOrder($data);
} catch (DropdayException $e) {
    // HTTP 422 — validation error
} catch (RequestException $e) {
    // Network or server error
}
```

## Testing

Use Laravel's `Http::fake()` to mock Dropday responses without hitting the real API:

```php
use Illuminate\Support\Facades\Http;

Http::fake([
    '*/orders' => Http::response(['id' => 'ORD-1', 'status' => 'pending'], 200),
]);

$result = Dropday::createOrder(['external_id' => 'test-1', 'test' => true]);

expect($result['status'])->toBe('pending');
```

## Get started with Dropday

1. [Create a Dropday account](https://dropday.io)
2. Copy your API key and account ID from the account settings
3. Add them to your `.env` and start sending orders

Browse the full [API reference](https://docs.dropday.io) for available fields, order statuses, and webhook events.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of changes.

## License

MIT
