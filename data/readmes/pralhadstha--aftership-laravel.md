# AfterShip Laravel SDK

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pralhadstha/aftership-laravel.svg?style=flat-square)](https://packagist.org/packages/pralhadstha/aftership-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/pralhadstha/aftership-laravel.svg?style=flat-square)](https://packagist.org/packages/pralhadstha/aftership-laravel)
[![License](https://img.shields.io/packagist/l/pralhadstha/aftership-laravel.svg?style=flat-square)](LICENSE)
[![PHP Version](https://img.shields.io/packagist/php-v/pralhadstha/aftership-laravel.svg?style=flat-square)](https://packagist.org/packages/pralhadstha/aftership-laravel)
[![Laravel](https://img.shields.io/badge/Laravel-10%20|%2011%20|%2012-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)

A modern, production-ready Laravel package for integrating with the [AfterShip Tracking API](https://www.aftership.com/docs/tracking) to track shipments, parcels, and deliveries across 1,200+ carriers worldwide. Supports DHL, FedEx, UPS, USPS, and more with a clean driver-based architecture, immutable DTOs, webhook verification, and full test support.

If you're building an e-commerce platform, order management system, or logistics dashboard in Laravel and need shipment tracking, courier detection, or delivery estimates from AfterShip, this package provides a clean, testable integration out of the box.

## Why This Package?

- **Driver Pattern** — Choose between the official AfterShip SDK or Laravel's HTTP client. Swap drivers without changing your code.
- **Immutable DTOs** — All API responses are mapped to typed, immutable Data Transfer Objects.
- **Webhook Support** — Built-in HMAC signature verification for secure webhook handling.
- **Testable** — Includes a `FakeDriver` for testing without API calls. No mocking needed.
- **Interactive Installer** — `php artisan aftership:install` guides you through setup with Laravel Prompts.
- **Laravel Auto-Discovery** — Zero-config service provider and facade registration.

## Requirements

- PHP >= 8.2
- Laravel 10, 11, or 12

## Installation

```bash
composer require pralhadstha/aftership-laravel
```

Then run the interactive installer:

```bash
php artisan aftership:install
```

The installer will guide you through:
- Selecting a driver (`sdk` or `http`)
- Installing the AfterShip SDK (if the `sdk` driver is selected)
- Configuring your API key
- Publishing the config file

### Manual Setup

If you prefer to configure manually, publish the config and set your `.env` values:

```bash
php artisan vendor:publish --tag=aftership-config
```

## Configuration

Set your API key in `.env`:

```env
AFTERSHIP_API_KEY=your-api-key
AFTERSHIP_DRIVER=sdk
```

Full configuration options in `config/aftership.php`:

```php
return [
    'api_key'        => env('AFTERSHIP_API_KEY', ''),
    'driver'         => env('AFTERSHIP_DRIVER', 'sdk'),   // sdk, http
    'base_url'       => env('AFTERSHIP_BASE_URL', 'https://api.aftership.com'),
    'api_version'    => env('AFTERSHIP_API_VERSION', 'tracking/2026-01'), // HTTP driver only
    'timeout'        => env('AFTERSHIP_TIMEOUT', 30),
    'webhook_secret' => env('AFTERSHIP_WEBHOOK_SECRET', ''),
];
```

### Drivers

| Driver | Description | Extra dependency |
|--------|-------------|-----------------|
| `sdk`  | Wraps the official [AfterShip Tracking SDK](https://github.com/AfterShip/tracking-sdk-php) (default) | `aftership/tracking-sdk` |
| `http` | Uses Laravel's HTTP client (`Http::`) directly | None |

If you choose the `sdk` driver, the `aftership:install` command will install the SDK for you automatically. For manual setup, run:

```bash
composer require aftership/tracking-sdk
```

The `http` driver works out of the box with no extra dependencies.

## Usage

### Tracking Shipments

```php
use OmniCargo\Aftership\Laravel\Facades\AfterShip;

// Create a tracking
$tracking = AfterShip::tracking()->create([
    'tracking_number' => '1234567890',
    'slug' => 'dhl',
]);

// Get a tracking
$tracking = AfterShip::tracking()->get('tracking-id');

// List trackings
$collection = AfterShip::tracking()->list(['page' => 1, 'limit' => 10]);

// Update a tracking
$tracking = AfterShip::tracking()->update('tracking-id', [
    'title' => 'My Shipment',
]);

// Delete a tracking
AfterShip::tracking()->delete('tracking-id');

// Mark as completed
AfterShip::tracking()->markCompleted('tracking-id', 'DELIVERED');
```

### Couriers

```php
// List all couriers
$couriers = AfterShip::courier()->list();

// Detect courier by tracking number
$detected = AfterShip::courier()->detect([
    'tracking_number' => '1234567890',
]);

// Get courier details
$courier = AfterShip::courier()->get('dhl');
```

### Delivery Estimates

```php
$estimate = AfterShip::deliveryEstimate()->estimate([
    'slug' => 'dhl',
    'service_type_name' => 'Express',
    'origin_address' => 'New York, USA',
    'destination_address' => 'London, UK',
]);
```

### Dependency Injection

```php
use OmniCargo\Aftership\Laravel\Client\AfterShipClient;

class ShipmentController extends Controller
{
    public function __construct(
        private readonly AfterShipClient $aftership,
    ) {}

    public function show(string $id)
    {
        $tracking = $this->aftership->tracking()->get($id);

        return response()->json($tracking->toArray());
    }
}
```

### Webhooks

```php
use OmniCargo\Aftership\Laravel\Webhooks\WebhookHandler;

class AfterShipWebhookController extends Controller
{
    public function __construct(
        private readonly WebhookHandler $webhook,
    ) {}

    public function handle(Request $request)
    {
        $payload = $this->webhook->handle(
            $request->getContent(),
            $request->header('aftership-hmac-sha256'),
        );

        $event = $this->webhook->getEventName($payload);
        $tracking = $this->webhook->getTrackingData($payload);

        // Handle events: tracking.updated, tracking.delivered, tracking.exception
        match ($event) {
            'tracking.delivered' => $this->handleDelivered($tracking),
            'tracking.exception' => $this->handleException($tracking),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }
}
```

### DTOs

All API responses are mapped to immutable Data Transfer Objects:

- `TrackingData` — tracking information with checkpoints
- `CourierData` — courier details
- `DeliveryEstimateData` — estimated delivery date
- `TrackingCollection` — paginated list of trackings
- `CheckpointData` — individual checkpoint

```php
$tracking = AfterShip::tracking()->get('id');

$tracking->trackingNumber;  // string
$tracking->slug;            // string
$tracking->tag;             // string (e.g., "InTransit", "Delivered")
$tracking->checkpoints;     // array<CheckpointData>
$tracking->toArray();       // array representation
```

### Error Handling

The package throws specific exceptions for different API error scenarios:

```php
use OmniCargo\Aftership\Laravel\Exceptions\AuthenticationException;
use OmniCargo\Aftership\Laravel\Exceptions\RateLimitException;
use OmniCargo\Aftership\Laravel\Exceptions\ApiException;

try {
    $tracking = AfterShip::tracking()->get('id');
} catch (AuthenticationException $e) {
    // Invalid or missing API key (401)
} catch (RateLimitException $e) {
    // Rate limit exceeded (429)
} catch (ApiException $e) {
    // Other API errors
    $e->getStatusCode();
    $e->getErrorType();
    $e->getMessage();
}
```

### Testing

Use the built-in `FakeDriver` for testing without making real API calls:

```php
use OmniCargo\Aftership\Laravel\AfterShipManager;
use OmniCargo\Aftership\Laravel\Contracts\ClientInterface;

// In your test
$this->app['config']->set('aftership.driver', 'fake');

$client = $this->app->make(ClientInterface::class);
$tracking = $client->tracking()->create([
    'tracking_number' => 'TEST123',
    'slug' => 'dhl',
]);

// Assert on the FakeDriver
$fakeDriver = $client->driver();
$this->assertTrue($fakeDriver->assertCalled('createTracking'));
```

## Running Tests

```bash
composer install
vendor/bin/phpunit
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security-related issues, please report them via [GitHub Security Advisories](https://github.com/pralhadstha/aftership-laravel/security/advisories) instead of using the issue tracker.

## Credits

- [Pralhad Kumar Shrestha](https://github.com/pralhadstha)

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
