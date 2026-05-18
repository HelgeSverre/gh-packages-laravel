# Steadfast Courier API Integration for Laravel

A Laravel package for integrating the Steadfast Courier API into Laravel applications. Use this package to create Steadfast parcels, create bulk parcel orders, track consignments, check account balance, receive delivery status webhooks, and store parcel status updates in your database.

This package is useful for Laravel e-commerce, order management, inventory, courier, logistics, and COD delivery systems in Bangladesh that need a clean Steadfast Courier API integration.

## Features

- Create a single Steadfast parcel order
- Create bulk parcel orders
- Track parcels by consignment ID
- Track parcels by invoice
- Track parcels by tracking code
- Check Steadfast account balance
- Receive delivery status webhook notifications
- Store webhook payloads in the `steadfast_parcel_statuses` table
- Laravel facade and service container binding
- Publishable configuration and migrations

## Requirements

- PHP 7.4 or higher
- Laravel 8, 9, 10, 11, or 12
- Steadfast API key and secret key

## Installation

Install the package with Composer:

```bash
composer require kejubayer/steadfast-api-integration
```

Laravel package auto-discovery will register the service provider and facade automatically.

## Publish Configuration

Publish the package configuration file:

```bash
php artisan vendor:publish --tag=steadfast-config
```

This creates:

```text
config/steadfast.php
```

## Environment Configuration

Add your Steadfast Courier API credentials to `.env`:

```env
STEADFAST_API_KEY=your-api-key
STEADFAST_SECRET_KEY=your-secret-key
STEADFAST_BASE_URL=https://portal.packzy.com/api/v1
STEADFAST_TIMEOUT=30

STEADFAST_WEBHOOK_ENABLED=true
STEADFAST_WEBHOOK_PATH=steadfast/webhook
```

## Configuration Reference

| Key | Environment Variable | Default | Description |
| --- | --- | --- | --- |
| `base_url` | `STEADFAST_BASE_URL` | `https://portal.packzy.com/api/v1` | Steadfast Courier API base URL. |
| `api_key` | `STEADFAST_API_KEY` | `null` | Your Steadfast API key. |
| `secret_key` | `STEADFAST_SECRET_KEY` | `null` | Your Steadfast secret key. |
| `timeout` | `STEADFAST_TIMEOUT` | `30` | HTTP request timeout in seconds. |
| `webhook.enabled` | `STEADFAST_WEBHOOK_ENABLED` | `true` | Enables or disables the package webhook route. |
| `webhook.path` | `STEADFAST_WEBHOOK_PATH` | `steadfast/webhook` | Webhook URL path used by Steadfast. |
| `webhook.middleware` | Config only | `['api']` | Middleware applied to the webhook route. |

## Database Migration

Run migrations to create the webhook status table:

```bash
php artisan migrate
```

The package loads its migration automatically. You can also publish the migration if you want to customize the table:

```bash
php artisan vendor:publish --tag=steadfast-migrations
```

## Basic Usage

Import the facade:

```php
use Kejubayer\Steadfast\Facades\Steadfast;
```

## Create Parcel

```php
$parcel = Steadfast::createParcel([
    'invoice' => 'INV-1001',
    'recipient_name' => 'Customer Name',
    'recipient_phone' => '01700000000',
    'recipient_address' => 'Dhaka, Bangladesh',
    'cod_amount' => 1500,
]);
```

## Bulk Create Parcels

```php
$bulk = Steadfast::bulkCreate([
    [
        'invoice' => 'INV-1002',
        'recipient_name' => 'Customer One',
        'recipient_phone' => '01700000000',
        'recipient_address' => 'Dhaka, Bangladesh',
        'cod_amount' => 1500,
    ],
    [
        'invoice' => 'INV-1003',
        'recipient_name' => 'Customer Two',
        'recipient_phone' => '01800000000',
        'recipient_address' => 'Chattogram, Bangladesh',
        'cod_amount' => 2200,
    ],
]);
```

## Track Parcel

Track by consignment ID:

```php
$status = Steadfast::track('12345');
```

Track by invoice:

```php
$status = Steadfast::trackByInvoice('INV-1001');
```

Track by tracking code:

```php
$status = Steadfast::trackByTrackingCode('tracking-code');
```

## Check Balance

```php
$balance = Steadfast::getBalance();
```

## Available Methods

| Method | Description | Returns |
| --- | --- | --- |
| `createParcel(array $data): array` | Creates a single Steadfast parcel order. | API response array |
| `bulkCreate(array $data): array` | Creates multiple Steadfast parcel orders. | API response array |
| `track(string $consignmentId): array` | Tracks parcel status by consignment ID. | API response array |
| `trackByInvoice(string $invoice): array` | Tracks parcel status by invoice number. | API response array |
| `trackByTrackingCode(string $trackingCode): array` | Tracks parcel status by tracking code. | API response array |
| `getBalance(): array` | Returns Steadfast account balance information. | API response array |

## Webhook Documentation

The package registers a webhook endpoint for Steadfast delivery status notifications:

```text
POST /steadfast/webhook
```

Webhook route example for your Steadfast dashboard:

```text
https://your-domain.com/steadfast/webhook
```

If you change `STEADFAST_WEBHOOK_PATH`, use that custom path instead. Every valid webhook request creates a new row in the `steadfast_parcel_statuses` table. This keeps a history of parcel delivery status changes.

## Stored Webhook Data Reference

Webhook payloads are stored in the `steadfast_parcel_statuses` table.

| Column | Type | Description |
| --- | --- | --- |
| `id` | bigint | Primary key. |
| `notification_type` | string | Webhook notification type. |
| `consignment_id` | string | Steadfast consignment ID. |
| `invoice` | string, nullable | Merchant invoice number. |
| `cod_amount` | decimal, nullable | COD amount from delivery status payload. |
| `status` | string, nullable | Delivery status. |
| `delivery_charge` | decimal, nullable | Delivery charge from delivery status payload. |
| `tracking_message` | text, nullable | Tracking or delivery message. |
| `provider_updated_at` | timestamp, nullable | Steadfast's `updated_at` value. |
| `payload` | json, nullable | Full original webhook payload. |
| `created_at` | timestamp | Local database creation timestamp. |
| `updated_at` | timestamp | Local database update timestamp. |

## Reading Stored Webhook Statuses

Use the included Eloquent model:

```php
use Kejubayer\Steadfast\Models\SteadfastParcelStatus;

$latestStatus = SteadfastParcelStatus::where('invoice', 'INV-67890')
    ->latest('provider_updated_at')
    ->first();

$history = SteadfastParcelStatus::where('consignment_id', '12345')
    ->orderBy('provider_updated_at')
    ->get();
```

## Error Handling

API methods may throw exceptions from Guzzle or JSON parsing. Handle them in your application when needed:

```php
use GuzzleHttp\Exception\GuzzleException;
use JsonException;

try {
    $parcel = Steadfast::createParcel($data);
} catch (GuzzleException|JsonException $exception) {
    report($exception);
}
```

If Steadfast returns `401 Unauthorized` with `Account is not active!` while creating a parcel, the package throws a clearer message:

```text
Your Steadfast account is not active. Please contact Steadfast authority to activate your account before creating parcels.
```

Webhook requests return Laravel validation errors if required fields are missing or invalid.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `401` or authentication error | Check `STEADFAST_API_KEY` and `STEADFAST_SECRET_KEY`. |
| Webhook returns `404` | Confirm `STEADFAST_WEBHOOK_ENABLED=true` and verify `STEADFAST_WEBHOOK_PATH`. |
| Webhook validation fails | Check `notification_type` and required fields for that webhook type. |
| Webhook data is not stored | Run `php artisan migrate` and confirm the database connection works. |
| API request times out | Increase `STEADFAST_TIMEOUT` in `.env`. |

## Keywords

Laravel Steadfast Courier API integration, Steadfast Laravel package, Steadfast Courier Bangladesh API, Laravel courier API, Laravel COD delivery integration, Laravel parcel tracking, Steadfast webhook, Steadfast delivery status webhook.

## License

The MIT License.
