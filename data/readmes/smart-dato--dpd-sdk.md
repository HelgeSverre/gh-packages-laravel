# DPD SDK for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/smart-dato/dpd-sdk.svg?style=flat-square)](https://packagist.org/packages/smart-dato/dpd-sdk)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/dpd-sdk/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/smart-dato/dpd-sdk/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/dpd-sdk/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/smart-dato/dpd-sdk/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/smart-dato/dpd-sdk.svg?style=flat-square)](https://packagist.org/packages/smart-dato/dpd-sdk)

A Laravel package for integrating with DPD's SOAP API. Create shipments, generate labels, and track parcels with a fluent, Laravel-style interface.

## Features

- 🚀 **Fluent API** - Laravel-style builders for creating shipments
- 🔐 **Automatic Authentication** - Token management with 24-hour caching
- 🌍 **Multi-Environment** - Support for both staging and production endpoints
- 🏢 **Multi-Tenant Ready** - Runtime configuration override for different accounts
- 📦 **Full SOAP Support** - LoginService, ShipmentService, and ParcelLifeCycleService
- ✅ **Type-Safe** - Modern PHP 8.4 with readonly DTOs and enums
- 🧪 **Well Tested** - Comprehensive test suite with Pest PHP

## Requirements

- PHP 8.4 or higher
- Laravel 11.0 or 12.0
- ext-soap PHP extension

## Installation

Install the package via composer:

```bash
composer require smart-dato/dpd-sdk
```

Publish the config file:

```bash
php artisan vendor:publish --tag="dpd-sdk-config"
```

Add your DPD credentials to your `.env` file:

```env
DPD_ENVIRONMENT=staging
DPD_DELIS_ID=your_delis_id
DPD_PASSWORD=your_password
DPD_CACHE_STORE=redis
```

## Usage

### Creating a Shipment (Facade)

Use the facade for simple, application-wide configuration:

```php
use SmartDato\Dpd\Facades\Dpd;

$shipment = Dpd::shipment()
    ->sendingDepot('0000')
    ->sender(fn($sender) => $sender
        ->name('John Doe')
        ->company('Acme Corp')
        ->street('Main Street')
        ->houseNumber('123')
        ->zipCode('12345')
        ->city('Berlin')
        ->country('DE')
    )
    ->recipient(fn($recipient) => $recipient
        ->name('Jane Smith')
        ->street('Second Avenue')
        ->houseNumber('456')
        ->zipCode('54321')
        ->city('Hamburg')
        ->country('DE')
        ->email('jane@example.com')
        ->phone('+49123456789')
    )
    ->parcel(fn($parcel) => $parcel
        ->weight(2.5)
        ->content('Books')
        ->reference('ORDER-12345')
    )
    ->labelFormat('PDF')
    ->create();

// Access response data
echo "Parcel Number: {$shipment->parcelNumber}\n";
echo "MPS ID: {$shipment->mpsId}\n";
echo "Tracking URL: {$shipment->trackingUrl}\n";

// Save label to file
file_put_contents('label.pdf', $shipment->label->content);
```

### Runtime Configuration Override (Multi-Tenant)

For multi-tenant applications or dynamic credentials:

```php
use SmartDato\Dpd\Dpd;

// Tenant A with their own credentials
$dpdA = new Dpd([
    'environment' => 'production',
    'credentials' => [
        'delis_id' => $tenantA->dpd_delis_id,
        'password' => $tenantA->dpd_password,
    ],
]);

$shipment = $dpdA->shipment()
    ->sendingDepot('0000')
    ->sender(/* ... */)
    ->recipient(/* ... */)
    ->parcel(/* ... */)
    ->create();

// Tenant B with different credentials
$dpdB = new Dpd([
    'credentials' => [
        'delis_id' => $tenantB->dpd_delis_id,
        'password' => $tenantB->dpd_password,
    ],
]);
```

### Tracking Parcels

```php
use SmartDato\Dpd\Facades\Dpd;

$events = Dpd::track('1234567890');

foreach ($events as $event) {
    echo "{$event->timestamp->format('Y-m-d H:i:s')} - {$event->status} at {$event->location}\n";
}
```

### Multiple Parcels per Shipment

```php
$shipment = Dpd::shipment()
    ->sendingDepot('0000')
    ->sender(/* ... */)
    ->recipient(/* ... */)
    ->parcel(fn($parcel) => $parcel
        ->weight(2.5)
        ->content('Books')
        ->reference('BOX-1')
    )
    ->parcel(fn($parcel) => $parcel
        ->weight(3.0)
        ->content('Electronics')
        ->reference('BOX-2')
    )
    ->create();
```

### Custom Label Formats

```php
// PDF Label (A4)
$shipment = Dpd::shipment()
    // ...
    ->labelFormat('PDF')
    ->paperFormat('A4')
    ->create();

// ZPL Label for thermal printers (barcode is automatically extracted)
$shipment = Dpd::shipment()
    // ...
    ->labelFormat('ZPL')
    ->create();

// Access barcode from ZPL label
echo "Barcode: {$shipment->label->barcode}\n"; // Only available for ZPL labels
file_put_contents('label.zpl', $shipment->label->content);
```

### Customer Reference Numbers and MPS ID

Add custom reference numbers to track your shipments and group related shipments together:

```php
$shipment = Dpd::shipment()
    ->sendingDepot('0000')
    ->mpsId('MPS-ORDER-12345') // Multi Parcel Shipment ID to group shipments
    ->customerReferenceNumber1('ORDER-12345') // e.g., Order number
    ->customerReferenceNumber2('CUSTOMER-98765') // e.g., Customer ID
    ->customerReferenceNumber3('WAREHOUSE-A') // e.g., Warehouse location
    ->customerReferenceNumber4('BATCH-001') // e.g., Batch number
    ->sender(/* ... */)
    ->recipient(/* ... */)
    ->parcel(/* ... */)
    ->create();

// The MPS ID is returned in the response
echo "MPS ID: {$shipment->mpsId}\n";
```

**Use cases:**
- **MPS ID**: Group multiple shipments together (useful for split orders or multi-box shipments)
- **Reference Number 1**: Order number or invoice number
- **Reference Number 2**: Customer ID or account number
- **Reference Number 3**: Warehouse location or department
- **Reference Number 4**: Batch number or shipping wave

## Configuration

The config file (`config/dpd-sdk.php`) provides extensive customization options:

```php
return [
    // Environment: 'staging' or 'production'
    'environment' => env('DPD_ENVIRONMENT', 'staging'),

    // DPD API Credentials
    'credentials' => [
        'delis_id' => env('DPD_DELIS_ID'),
        'password' => env('DPD_PASSWORD'),
    ],

    // Authentication Token Caching (24 hours)
    'cache' => [
        'store' => env('DPD_CACHE_STORE', null), // null = default
        'prefix' => 'dpd_auth',
        'ttl' => 86400,
    ],

    // SOAP Client Options
    'soap' => [
        'trace' => env('DPD_SOAP_TRACE', true),
        'connection_timeout' => 30,
        // ...
    ],

    // Rate Limits
    'rate_limits' => [
        'labels_per_minute' => 30,
        'calls_per_minute' => 60,
    ],

    // Default Label Options
    'defaults' => [
        'label_format' => 'PDF',
        'print_options' => [
            'printer_language' => 'PDF',
            'paper_format' => 'A4',
        ],
    ],

    // Logging for Debugging
    'logging' => [
        'enabled' => env('DPD_LOGGING_ENABLED', false),
        'channel' => env('DPD_LOGGING_CHANNEL', 'stack'),
    ],
];
```

## Error Handling

The SDK throws specific exceptions for different error scenarios:

```php
use SmartDato\Dpd\Facades\Dpd;
use SmartDato\Dpd\Exceptions\AuthenticationException;
use SmartDato\Dpd\Exceptions\RateLimitException;
use SmartDato\Dpd\Exceptions\ValidationException;
use SmartDato\Dpd\Exceptions\SoapException;

try {
    $shipment = Dpd::shipment()
        ->sender(/* ... */)
        ->recipient(/* ... */)
        ->parcel(/* ... */)
        ->create();
} catch (AuthenticationException $e) {
    // Invalid credentials
    logger()->error('DPD authentication failed', ['error' => $e->getMessage()]);
} catch (RateLimitException $e) {
    // Too many requests
    logger()->warning('DPD rate limit exceeded', ['error' => $e->getMessage()]);
} catch (ValidationException $e) {
    // Invalid shipment data
    return back()->withErrors(['shipment' => $e->getMessage()]);
} catch (SoapException $e) {
    // SOAP/network error
    logger()->error('DPD SOAP error', ['error' => $e->getMessage()]);
}
```

### DPD API Error Responses

The SDK automatically detects and formats errors returned by the DPD API. When the API returns error information in the response (instead of SOAP faults), you'll get clear error messages with error codes:

```php
try {
    $shipment = Dpd::shipment()
        ->sendingDepot('0000')
        ->sender(/* ... */)
        ->recipient(/* ... */)
        ->create();
} catch (\RuntimeException $e) {
    // Example error message:
    // "DPD API Error: [ERR123] Invalid sender address; [ERR456] Missing required field"
    echo $e->getMessage();
}
```

Common DPD error codes:
- **Invalid address data** - Check sender/recipient address fields (name, street, zip code, city, country)
- **Missing required fields** - Ensure all mandatory fields are provided
- **Invalid depot code** - Verify the sending depot code (must be exactly 4 digits)
- **Authentication issues** - Check your DPD credentials (delis_id and password)

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Run static analysis:

```bash
composer analyse
```

Fix code style:

```bash
composer format
```

## Architecture

The SDK is built with a layered architecture:

1. **SOAP Clients** - Low-level SOAP wrappers (`BaseSoapClient`, `LoginServiceClient`, etc.)
2. **Token Management** - Automatic authentication with 24-hour token caching
3. **Services** - High-level business logic (`ShipmentService`, `TrackingService`)
4. **Builders** - Fluent API for creating shipments (`ShipmentBuilder`, `AddressBuilder`, `ParcelBuilder`)
5. **DTOs** - Type-safe data transfer objects (`ShipmentResponse`, `TrackingEvent`, etc.)

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [SmartDato](https://github.com/smart-dato)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
