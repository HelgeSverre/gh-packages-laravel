# Laravel RedX API Integration Package

`kejubayer/redx-api-integration` is a Laravel package for RedX courier API integration in Bangladesh. It provides a simple RedX HTTP client, configurable API endpoints, a webhook route, and automatic storage of RedX webhook payloads in a database table.

Use this package to create RedX parcels, track parcels, cancel parcels, call configured RedX API endpoints, and receive RedX delivery status webhook updates in your Laravel application.

## Features

- Laravel auto-discovery support
- RedX API client using Laravel HTTP client
- Configurable RedX base URL, API token header, timeout, and endpoints
- Easy named methods for common RedX endpoints
- Generic endpoint-name helpers for all custom RedX endpoints
- Built-in RedX webhook route
- Stores every webhook request in `redx_webhook_requests`
- Extracts searchable webhook fields like tracking number, status, invoice number, and delivery type
- Optional webhook shared-secret protection
- Event dispatch after every stored webhook request
- Supports Laravel 10, Laravel 11, and Laravel 12

## Requirements

- PHP 8.1 or higher
- Laravel 10, 11, or 12
- Composer

## Installation

Install the package with Composer:

```bash
composer require kejubayer/redx-api-integration
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=redx-config
```

Publish the migration:

```bash
php artisan vendor:publish --tag=redx-migrations
```

Run the migration:

```bash
php artisan migrate
```

## Environment Variables

Add your RedX API credentials to `.env`:

```env
REDX_BASE_URL=https://openapi.redx.com.bd/v1.0.0-beta
REDX_API_TOKEN="Bearer your-redx-jwt-token"
REDX_TOKEN_HEADER=API-ACCESS-TOKEN
REDX_TIMEOUT=30

REDX_WEBHOOK_ENABLED=true
REDX_WEBHOOK_PATH=redx/webhook
```

Optional webhook secret protection:

```env
REDX_WEBHOOK_SECRET=your-shared-secret
REDX_WEBHOOK_SECRET_HEADER=X-Redx-Webhook-Secret
```

RedX expects the token in this HTTP header:

```http
API-ACCESS-TOKEN: Bearer your-redx-jwt-token
```

So `REDX_TOKEN_HEADER` is the header name, and `REDX_API_TOKEN` is the full header value.

## Configuration

After publishing, the config file is available at:

```text
config/redx-api-integration.php
```

Default endpoint configuration:

```php
'endpoints' => [
    'create_parcel' => env('REDX_CREATE_PARCEL_ENDPOINT', '/parcel'),
    'track_parcel' => env('REDX_TRACK_PARCEL_ENDPOINT', '/parcel/track/{tracking_id}'),
    'parcel_details' => env('REDX_PARCEL_DETAILS_ENDPOINT', '/parcel/info/{tracking_id}'),
    'update_parcel' => env('REDX_UPDATE_PARCEL_ENDPOINT', '/parcels'),
    'areas' => env('REDX_AREAS_ENDPOINT', '/areas'),
    'create_pickup_store' => env('REDX_CREATE_PICKUP_STORE_ENDPOINT', '/pickup/store'),
    'pickup_stores' => env('REDX_PICKUP_STORES_ENDPOINT', '/pickup/stores'),
    'pickup_store_details' => env('REDX_PICKUP_STORE_DETAILS_ENDPOINT', '/pickup/store/info/{pickup_store_id}'),
    'charge_calculator' => env('REDX_CHARGE_CALCULATOR_ENDPOINT', '/charge/charge_calculator'),
],
```

If your RedX merchant account uses different endpoint paths, update the config or set these `.env` values:

```env
REDX_CREATE_PARCEL_ENDPOINT=/parcel
REDX_TRACK_PARCEL_ENDPOINT=/parcel/track/{tracking_id}
REDX_PARCEL_DETAILS_ENDPOINT=/parcel/info/{tracking_id}
REDX_UPDATE_PARCEL_ENDPOINT=/parcels
REDX_AREAS_ENDPOINT=/areas
REDX_CREATE_PICKUP_STORE_ENDPOINT=/pickup/store
REDX_PICKUP_STORES_ENDPOINT=/pickup/stores
REDX_PICKUP_STORE_DETAILS_ENDPOINT=/pickup/store/info/{pickup_store_id}
REDX_CHARGE_CALCULATOR_ENDPOINT=/charge/charge_calculator
```

## Basic Usage

Use the facade:

```php
use Kejubayer\RedxApiIntegration\Facades\Redx;

$data = Redx::createParcel([
    'customer_name' => 'Customer Name',
    'customer_phone' => '01700000000',
    'delivery_area' => 'Dhaka',
    'delivery_area_id' => 1,
    'customer_address' => 'Dhaka, Bangladesh',
    'cash_collection_amount' => 1000,
    'parcel_weight' => 1,
    'value' => 1000,
]);
```

Use dependency injection:

```php
use Kejubayer\RedxApiIntegration\RedxApiIntegration;

class ParcelController
{
    public function store(RedxApiIntegration $redx)
    {
        return $redx->createParcel([
            'customer_name' => 'Customer Name',
            'customer_phone' => '01700000000',
            'delivery_area' => 'Dhaka',
            'delivery_area_id' => 1,
            'customer_address' => 'Dhaka, Bangladesh',
            'cash_collection_amount' => 1000,
            'parcel_weight' => 1,
            'value' => 1000,
        ]);
    }
}
```

## Available Methods

Quick method list:

| Method | Purpose |
| --- | --- |
| `Redx::createParcel($payload)` | Create a RedX parcel |
| `Redx::trackParcel($trackingId)` | Track parcel by tracking number |
| `Redx::parcelDetails($trackingId)` | Get parcel details by tracking ID |
| `Redx::updateParcel($trackingId, $propertyName, $newValue, $reason)` | Update a parcel property |
| `Redx::updateParcelRaw($payload)` | Update a parcel with the full RedX payload |
| `Redx::cancelParcel($trackingId, $reason)` | Cancel parcel by tracking ID |
| `Redx::areas($query)` | Get RedX areas |
| `Redx::areasByPostCode($postCode)` | Get areas by postal code |
| `Redx::areasByDistrictName($districtName)` | Get areas by district name |
| `Redx::createPickupStore($payload)` | Create pickup store |
| `Redx::pickupStores($query)` | Get pickup stores |
| `Redx::pickupStoreDetails($pickupStoreId)` | Get pickup store details |
| `Redx::calculateCharge($query)` | Calculate parcel charge |
| `Redx::getEndpoint($name, $replacements, $query)` | Call a configured GET endpoint |
| `Redx::postEndpoint($name, $payload, $replacements)` | Call a configured POST endpoint |
| `Redx::putEndpoint($name, $payload, $replacements)` | Call a configured PUT endpoint |
| `Redx::patchEndpoint($name, $payload, $replacements)` | Call a configured PATCH endpoint |
| `Redx::deleteEndpoint($name, $payload, $replacements)` | Call a configured DELETE endpoint |
| `Redx::callEndpoint($method, $name, $payload, $replacements)` | Call any configured endpoint dynamically |
| `Redx::endpoint($name, $replacements)` | Resolve a configured endpoint path |
| `Redx::get($uri, $query)` | Raw GET request |
| `Redx::post($uri, $payload)` | Raw POST request |
| `Redx::put($uri, $payload)` | Raw PUT request |
| `Redx::patch($uri, $payload)` | Raw PATCH request |
| `Redx::delete($uri, $payload)` | Raw DELETE request |
| `Redx::request()` | Get the configured Laravel HTTP client |
| `Redx::getResponse($uri, $query)` | Raw GET request with Laravel response object |
| `Redx::postResponse($uri, $payload)` | Raw POST request with Laravel response object |
| `Redx::putResponse($uri, $payload)` | Raw PUT request with Laravel response object |
| `Redx::patchResponse($uri, $payload)` | Raw PATCH request with Laravel response object |
| `Redx::deleteResponse($uri, $payload)` | Raw DELETE request with Laravel response object |

### createParcel

Create a new RedX parcel.

```php
use Kejubayer\RedxApiIntegration\Facades\Redx;

$parcel = Redx::createParcel([
    'customer_name' => 'Customer Name',
    'customer_phone' => '01700000000',
    'delivery_area' => 'Dhaka',
    'delivery_area_id' => 1,
    'customer_address' => 'House 1, Road 2, Dhaka',
    'merchant_invoice_id' => 'INV-1001',
    'cash_collection_amount' => '1500',
    'parcel_weight' => 1,
    'instruction' => 'Handle with care',
    'value' => 1500,
    'is_closed_box' => false,
    'pickup_store_id' => 1,
    'parcel_details_json' => [
        [
            'name' => 'Product name',
            'category' => 'Product category',
            'value' => 1500,
        ],
    ],
]);
```

Required RedX create parcel fields usually include:

```text
customer_name, customer_phone, delivery_area, delivery_area_id,
customer_address, cash_collection_amount, parcel_weight, value
```

Use `merchant_invoice_id` for your invoice number when creating a parcel. Webhook payloads may return that value as `invoice_number`.

### parcelDetails

Get RedX parcel details by tracking ID.

```php
$parcel = Redx::parcelDetails('21A427TU4BN3R');
```

### trackParcel

Track a parcel by RedX tracking number.

```php
$tracking = Redx::trackParcel('25A223SU17V6CH');
```

### updateParcel

Update a RedX parcel property.

```php
$result = Redx::updateParcel(
    trackingId: '21A427TU4BN3R',
    propertyName: 'status',
    newValue: 'cancelled',
    reason: 'Customer cancelled the order'
);
```

Send the exact RedX update payload:

```php
$result = Redx::updateParcelRaw([
    'entity_type' => 'parcel-tracking-id',
    'entity_id' => '21A427TU4BN3R',
    'update_details' => [
        'property_name' => 'status',
        'new_value' => 'cancelled',
        'reason' => 'Customer cancelled the order',
    ],
]);
```

### cancelParcel

Cancel a parcel by tracking ID. This is a shortcut for `updateParcel($trackingId, 'status', 'cancelled', $reason)`.

```php
$result = Redx::cancelParcel('21A427TU4BN3R', 'Customer cancelled the order');
```

### areas

Get RedX delivery areas.

```php
$areas = Redx::areas();
```

With query parameters:

```php
$areas = Redx::areas([
    'district_name' => 'Dhaka',
]);
```

Get areas by post code:

```php
$areas = Redx::areasByPostCode(1206);
```

Get areas by district name:

```php
$areas = Redx::areasByDistrictName('Dhaka');
```

### createPickupStore

Create a RedX pickup store.

```php
$store = Redx::createPickupStore([
    'name' => 'Test Pickup Store',
    'phone' => '8801898000999',
    'address' => 'Test Address',
    'area_id' => 1,
]);
```

### pickupStores

Get RedX pickup stores.

```php
$stores = Redx::pickupStores();
```

### pickupStoreDetails

Get pickup store details.

```php
$store = Redx::pickupStoreDetails(1);
```

### calculateCharge

Calculate RedX parcel charge.

```php
$charge = Redx::calculateCharge([
    'delivery_area_id' => 12,
    'pickup_area_id' => 1,
    'cash_collection_amount' => 1500,
    'weight' => 500,
]);
```

## Easy Use For All Endpoints

You can add any RedX API endpoint to `config/redx-api-integration.php` and call it by name.

Example config:

```php
'endpoints' => [
    'create_parcel' => '/parcel',
    'track_parcel' => '/parcel/track/{tracking_id}',
    'parcel_details' => '/parcel/info/{tracking_id}',
    'update_parcel' => '/parcels',
    'my_custom_endpoint' => '/merchant/custom/{id}',
],
```

Call a configured GET endpoint:

```php
$data = Redx::getEndpoint(
    name: 'my_custom_endpoint',
    replacements: ['id' => 123],
    query: ['page' => 1]
);
```

Call a configured POST endpoint:

```php
$data = Redx::postEndpoint(
    name: 'create_parcel',
    payload: [
        'customer_name' => 'Customer Name',
        'customer_phone' => '01700000000',
    ]
);
```

Call a configured PUT endpoint:

```php
$data = Redx::putEndpoint(
    name: 'my_custom_endpoint',
    payload: ['status' => 'updated'],
    replacements: ['id' => 123]
);
```

Call a configured PATCH endpoint:

```php
$data = Redx::patchEndpoint(
    name: 'my_custom_endpoint',
    payload: ['status' => 'updated'],
    replacements: ['id' => 123]
);
```

Call a configured DELETE endpoint:

```php
$data = Redx::deleteEndpoint(
    name: 'my_custom_endpoint',
    payload: ['reason' => 'Not needed'],
    replacements: ['id' => 123]
);
```

Call any configured endpoint dynamically:

```php
$data = Redx::callEndpoint(
    method: 'post',
    name: 'my_custom_endpoint',
    payload: ['key' => 'value'],
    replacements: ['id' => 123]
);
```

Resolve only the endpoint path:

```php
$uri = Redx::endpoint('parcel_details', [
    'tracking_id' => '21A427TU4BN3R',
]);

// Result: /parcel/info/21A427TU4BN3R
```

### get

Call any RedX GET endpoint.

```php
$data = Redx::get('/parcel/track/25A223SU17V6CH');
```

### post

Call any RedX POST endpoint.

```php
$data = Redx::post('/parcel', [
    'customer_name' => 'Customer Name',
    'customer_phone' => '01700000000',
]);
```

### put

Call any RedX PUT endpoint.

```php
$data = Redx::put('/parcel/12345', [
    'customer_address' => 'Updated address, Dhaka',
]);
```

### patch

Call any RedX PATCH endpoint.

```php
$data = Redx::patch('/parcel/12345', [
    'customer_address' => 'Updated address, Dhaka',
]);
```

### delete

Call any RedX DELETE endpoint.

```php
$data = Redx::delete('/parcel/12345');
```

With a request body:

```php
$data = Redx::delete('/parcel/12345', [
    'reason' => 'Duplicate order',
]);
```

### request

Get the configured Laravel HTTP pending request instance.

```php
$response = Redx::request()
    ->withHeaders(['X-Custom-Header' => 'value'])
    ->post('/custom-endpoint', [
        'key' => 'value',
    ]);
```

## Webhook Route

The package registers this route by default:

```text
POST /redx/webhook
```

You can change the route path:

```env
REDX_WEBHOOK_PATH=api/redx/webhook
```

You can disable the route:

```env
REDX_WEBHOOK_ENABLED=false
```

## RedX Webhook Payload Structure

Expected RedX webhook JSON payload:

```json
{
    "tracking_number": "<REDX_TRACKING_ID>",
    "timestamp": "<TIMESTAMP>",
    "status": "<STATUS>",
    "message_en": "<MESSAGE_EN>",
    "message_bn": "<MESSAGE_BN>",
    "invoice_number": "<INVOICE_NUMBER>",
    "delivery_type": "<DELIVERY_TYPE>"
}
```

Example payload:

```json
{
    "tracking_number": "25A223SU17V6CH",
    "timestamp": "2026-05-12 10:30:00",
    "status": "delivered",
    "message_en": "Parcel has been delivered",
    "message_bn": "Bangla delivery status message",
    "invoice_number": "INV-1001",
    "delivery_type": "regular"
}
```

## Webhook Database Structure

Webhook requests are stored in the `redx_webhook_requests` table.

| Column | Type | Description |
| --- | --- | --- |
| `id` | integer | Primary key |
| `tracking_number` | string, nullable | RedX tracking number |
| `redx_timestamp` | timestamp, nullable | Timestamp sent by RedX |
| `status` | string, nullable | Parcel status |
| `message_en` | string, nullable | English status message |
| `message_bn` | string, nullable | Bangla status message |
| `invoice_number` | string, nullable | Merchant invoice number |
| `delivery_type` | string, nullable | RedX delivery type |
| `payload` | json | Full webhook payload |
| `headers` | json, nullable | Request headers |
| `ip_address` | string, nullable | Sender IP address |
| `user_agent` | string, nullable | Request user agent |
| `signature` | string, nullable | Signature header value, when available |
| `processed_at` | timestamp, nullable | Processing timestamp for your application |
| `created_at` | timestamp | Created timestamp |
| `updated_at` | timestamp | Updated timestamp |

## Webhook Model

The default model is:

```php
Kejubayer\RedxApiIntegration\Models\RedxWebhookRequest
```

Query stored webhooks:

```php
use Kejubayer\RedxApiIntegration\Models\RedxWebhookRequest;

$latest = RedxWebhookRequest::query()
    ->latest()
    ->take(10)
    ->get();
```

Find webhook requests by tracking number:

```php
$requests = RedxWebhookRequest::query()
    ->where('tracking_number', '25A223SU17V6CH')
    ->get();
```

Find delivered parcels:

```php
$delivered = RedxWebhookRequest::query()
    ->where('status', 'delivered')
    ->get();
```

Mark a webhook request as processed:

```php
$webhookRequest->markAsProcessed();
```

Use your own model:

```php
'webhook_model' => App\Models\RedxWebhookRequest::class,
```

Your custom model should extend the package model or provide the same fillable columns.

## Webhook Event

After storing a webhook request, the package dispatches:

```php
Kejubayer\RedxApiIntegration\Events\RedxWebhookReceived
```

Listen for the event:

```php
use Illuminate\Support\Facades\Event;
use Kejubayer\RedxApiIntegration\Events\RedxWebhookReceived;

Event::listen(RedxWebhookReceived::class, function (RedxWebhookReceived $event) {
    $webhookRequest = $event->webhookRequest;

    if ($webhookRequest->status === 'delivered') {
        // Update your order status here.
    }
});
```

Create a listener:

```bash
php artisan make:listener ProcessRedxWebhook
```

Example listener:

```php
namespace App\Listeners;

use Kejubayer\RedxApiIntegration\Events\RedxWebhookReceived;

class ProcessRedxWebhook
{
    public function handle(RedxWebhookReceived $event): void
    {
        $webhookRequest = $event->webhookRequest;

        // Match your order by invoice number or tracking number.
        $invoiceNumber = $webhookRequest->invoice_number;
        $status = $webhookRequest->status;

        $webhookRequest->markAsProcessed();
    }
}
```

## Secure Webhooks

Set a shared secret in your `.env`:

```env
REDX_WEBHOOK_SECRET=your-shared-secret
REDX_WEBHOOK_SECRET_HEADER=X-Redx-Webhook-Secret
```

RedX must send the same secret value in the configured header. If the secret does not match, the package returns `403 Forbidden`.

## Testing Webhook Locally

You can test the webhook route with curl:

```bash
curl -X POST "https://your-app.test/redx/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "25A223SU17V6CH",
    "timestamp": "2026-05-12 10:30:00",
    "status": "delivered",
    "message_en": "Parcel has been delivered",
    "message_bn": "Bangla delivery status message",
    "invoice_number": "INV-1001",
    "delivery_type": "regular"
  }'
```

With webhook secret:

```bash
curl -X POST "https://your-app.test/redx/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Redx-Webhook-Secret: your-shared-secret" \
  -d '{
    "tracking_number": "25A223SU17V6CH",
    "timestamp": "2026-05-12 10:30:00",
    "status": "delivered",
    "message_en": "Parcel has been delivered",
    "message_bn": "Bangla delivery status message",
    "invoice_number": "INV-1001",
    "delivery_type": "regular"
  }'
```

## Raw Response Usage

Normal package methods return PHP arrays directly. If you need the raw Laravel `Illuminate\Http\Client\Response` object, use the `*Response` methods or `request()`.

```php
$response = Redx::getResponse('/parcel/track/25A223SU17V6CH');

if ($response->successful()) {
    return $response->json();
}

if ($response->failed()) {
    report($response->body());
}

$response->throw();
```

## Error Handling

Because normal methods return arrays, RedX validation errors are available directly:

```php
$data = Redx::createParcel($payload);

if (isset($data['validation_errors'])) {
    return $data['validation_errors'];
}
```

## License

The MIT License.
