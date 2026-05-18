# Rivigo PHP/Laravel SDK

PHP/Laravel SDK for integrating with Rivigo API - A delivery and logistics service provider.

[![PHP Version](https://img.shields.io/badge/php-%5E8.0-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-%5E9.0%7C%5E10.0%7C%5E11.0-red)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Features

✅ **Complete API Coverage** - All Rivigo API endpoints included  
✅ **Laravel Integration** - Service Provider, Facades, and configuration  
✅ **PSR-4 Compliant** - Follows PHP-FIG standards  
✅ **Type Safety** - Full PHP 8.0+ type hints  
✅ **Well Documented** - Comprehensive inline documentation  
✅ **Easy to Use** - Intuitive and fluent API  
✅ **Tested** - Converted from validated Java SDK  

## Requirements

- PHP 8.0 or higher
- Laravel 9.x, 10.x, or 11.x (for Laravel integration)
- Guzzle HTTP Client 7.x

## Installation

Install via Composer:

```bash
composer require sparrowbytes-fintech-solutions/rivigo-php-laravel-client
```

### Laravel Setup

The package will automatically register its service provider.

#### Publish Configuration

```bash
php artisan vendor:publish --tag=rivigo-config
```

This will create `config/rivigo.php` where you can configure your API credentials.

#### Environment Variables

Add the following to your `.env` file:

```env
RIVIGO_BASE_URL=https://client-integration-api.rivigo.com
RIVIGO_APP_UUID=your-app-uuid
RIVIGO_APP_SECRET=your-app-secret
RIVIGO_CONNECT_TIMEOUT=10
RIVIGO_TIMEOUT=30
RIVIGO_DEBUG=false
RIVIGO_VERIFY_SSL=true
```

## Usage

### Using Facades (Laravel)

```php
use Rivigo\Client\Facades\RivigoAuth;
use Rivigo\Client\Facades\RivigoBooking;
use Rivigo\Client\Facades\RivigoTracking;
use Rivigo\Client\Models\CreateBookingDto;
use Rivigo\Client\Models\FromClientContactDetailsDto;
use Rivigo\Client\Models\CreateIndividualBookingDto;

// Get JWT Token
$tokenResponse = RivigoAuth::getToken();
$jwtToken = $tokenResponse->getPayload()['token'];

// Create a Booking
$booking = new CreateBookingDto();
$booking->setScheduledBookingDateTime(time() * 1000); // milliseconds

// Set consignor details
$fromAddress = new FromClientContactDetailsDto();
// ... set address details
$booking->setFromAddress($fromAddress);

// Add individual bookings
$individualBooking = new CreateIndividualBookingDto();
// ... set booking details
$booking->addIndividualBooking($individualBooking);

// Create booking
$response = RivigoBooking::createBooking($booking, config('rivigo.app_uuid'));

// Track Booking
$trackingResponse = RivigoTracking::trackBooking(
    config('rivigo.app_uuid'),
    null,
    $bookingId
);
```

### Using Dependency Injection

```php
use Rivigo\Client\Api\BookingApi;
use Rivigo\Client\Api\TrackingApi;
use Rivigo\Client\Api\AuthorizationApi;

class ShippingController extends Controller
{
    public function __construct(
        private BookingApi $bookingApi,
        private TrackingApi $trackingApi,
        private AuthorizationApi $authApi
    ) {}

    public function createShipment(Request $request)
    {
        $booking = new CreateBookingDto();
        // ... populate booking data
        
        $response = $this->bookingApi->createBooking(
            $booking,
            config('rivigo.app_uuid')
        );
        
        return response()->json($response);
    }

    public function trackShipment($bookingId)
    {
        $response = $this->trackingApi->trackBooking(
            config('rivigo.app_uuid'),
            null,
            $bookingId
        );
        
        return response()->json($response);
    }
}
```

### Standalone PHP Usage (without Laravel)

```php
use Rivigo\Client\ApiClient;
use Rivigo\Client\Configuration;
use Rivigo\Client\Api\AuthorizationApi;
use Rivigo\Client\Api\BookingApi;

// Create and configure API client
$client = new ApiClient();
$client->setBasePath('https://client-integration-api.rivigo.com');
$client->setUsername('your-app-uuid');
$client->setPassword('your-app-secret');
$client->setTimeout(30);

// Set as default client
Configuration::setDefaultApiClient($client);

// Get token
$authApi = new AuthorizationApi($client);
$tokenResponse = $authApi->getToken();
$jwtToken = $tokenResponse->getPayload()['token'];

// Use token for subsequent requests
$client->setAccessToken($jwtToken);

// Create booking
$bookingApi = new BookingApi($client);
$booking = new CreateBookingDto();
// ... populate booking
$response = $bookingApi->createBooking($booking, 'your-app-uuid');
```

## API Reference

### Authorization API

#### Get Token

```php
RivigoAuth::getToken(): GenericResponse
```

Use App UUID and App Secret as Basic Auth credentials to generate a JWT token.

### Booking API

#### Create Booking

```php
RivigoBooking::createBooking(
    CreateBookingDto $createBookingDto,
    string $appUuid
): GenericResponse
```

Create a new booking with consignor and consignee details.

#### Update Booking

```php
RivigoBooking::updateBooking(
    UpdateBookingDto $updateBookingDto,
    string $appUuid
): GenericResponse
```

Update an existing booking.

#### Cancel Booking

```php
RivigoBooking::cancelBooking(
    string $appUuid,
    int $bookingId,
    ?CnotesList $cnotesList = null
): GenericResponse
```

Cancel a booking. Optionally specify specific consignment notes to cancel.

### Tracking API

#### Track Booking

```php
RivigoTracking::trackBooking(
    string $appUuid,
    ?CnotesList $cnotesList = null,
    ?int $bookingId = null
): GenericResponse
```

Track a booking by booking ID or specific consignment notes.

### RTO API

#### Initiate RTO

```php
use Rivigo\Client\Api\RtoApi;

$rtoApi = app(RtoApi::class);
$response = $rtoApi->initiateRto($appUuid, $cnote);
```

Initiate Return to Origin for a consignment.

## Models

All models implement `JsonSerializable` and provide:

- Type-safe getters and setters
- `jsonSerialize()` method for JSON encoding
- `fromArray()` static method for deserialization
- Fluent interface (chainable setters)

### Key Models

- **CreateBookingDto** - Booking creation details
- **UpdateBookingDto** - Booking update details
- **FromClientContactDetailsDto** - Consignor contact information
- **ToClientContactDetailsDto** - Consignee contact information
- **PartTruckLoadDetailsDto** - Load and shipment details
- **GenericResponse** - Standard API response wrapper
- **CnotesList** - List of consignment notes

### Example: Creating a Complete Booking

```php
use Rivigo\Client\Models\*;

// Create consignor address
$fromAddress = new FromClientAddressDto();
$fromAddress->setDetailedAddress('123 Business St')
    ->setCity('Mumbai')
    ->setPincode('400001')
    ->setLatitude(19.0760)
    ->setLongitude(72.8777);

// Create consignor call details
$fromCall = new FromCallDetailsDto();
$fromCall->setName('John Doe')
    ->setPhoneNumber('9876543210')
    ->setEmail('john@example.com');

// Create consignor company details
$fromCompany = new FromCompanyDetailsDto();
$fromCompany->setCompanyName('ABC Pvt Ltd')
    ->setGstin('29ABCDE1234F1Z5')
    ->setPan('ABCDE1234F');

// Combine consignor details
$fromContactDetails = new FromClientContactDetailsDto();
$fromContactDetails->setAddressDetails($fromAddress)
    ->setCallDetails($fromCall)
    ->setCompanyDetails($fromCompany);

// Create consignee details (similar structure)
$toAddress = new ToClientAddressDto();
$toAddress->setDetailedAddress('456 Receiver St')
    ->setCity('Delhi')
    ->setPincode('110001');

$toCall = new ToCallDetailsDto();
$toCall->setName('Jane Smith')
    ->setPhoneNumber('9876543211');

$toCompany = new ToCompanyDetailsDto();
$toCompany->setCompanyName('XYZ Corp');

$toContactDetails = new ToClientContactDetailsDto();
$toContactDetails->setAddressDetails($toAddress)
    ->setCallDetails($toCall)
    ->setCompanyDetails($toCompany);

// Create load details
$volume = new ClientVolumeDto();
$volume->setLength(10.0)
    ->setBreadth(10.0)
    ->setHeight(10.0)
    ->setCount(5);

$loadDetails = new PartTruckLoadDetailsDto();
$loadDetails->setTotalBoxes(5)
    ->setWeight(50.0)
    ->setUnit('CM')
    ->addBoxType($volume)
    ->setPaymentMode('PAID')
    ->setPackaging('CARTON_BOX');

// Create individual booking
$individualBooking = new CreateIndividualBookingDto();
$individualBooking->addToAddress($toContactDetails)
    ->setLoadDetails($loadDetails);

// Create main booking
$booking = new CreateBookingDto();
$booking->setScheduledBookingDateTime(time() * 1000)
    ->setFromAddress($fromContactDetails)
    ->addIndividualBooking($individualBooking);

// Submit booking
$response = RivigoBooking::createBooking($booking, config('rivigo.app_uuid'));

if ($response->getStatus() === 'SUCCESS') {
    $bookingId = $response->getPayload()['bookingId'];
    echo "Booking created with ID: {$bookingId}";
} else {
    echo "Error: " . $response->getErrorMessage();
}
```

## Error Handling

All API methods may throw `ApiException`:

```php
use Rivigo\Client\Exceptions\ApiException;

try {
    $response = RivigoBooking::createBooking($booking, $appUuid);
} catch (ApiException $e) {
    echo "API Error: " . $e->getMessage();
    echo "Status Code: " . $e->getStatusCode();
    echo "Response Body: " . $e->getResponseBody();
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `base_url` | string | `https://client-integration-api.rivigo.com` | API base URL |
| `app_uuid` | string | - | Your application UUID |
| `app_secret` | string | - | Your application secret |
| `jwt_token` | string | - | JWT token (alternative to uuid/secret) |
| `connect_timeout` | int | 10 | Connection timeout in seconds |
| `timeout` | int | 30 | Request timeout in seconds |
| `debug` | bool | false | Enable debug mode |
| `verify_ssl` | bool | true | Verify SSL certificates |

## Testing

```bash
# Run tests
composer test

# Run tests with coverage
composer test-coverage
```

## Development

### Requirements

- PHP 8.0+
- Composer
- Git

### Setup

```bash
git clone https://github.com/yourusername/rivigo-php-laravel-client.git
cd rivigo-php-laravel-client
composer install
```

## Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/SparrowBytes-FinTech-Solutions/rivigo-php-laravel-client/issues)
- **Documentation**: This README and inline code documentation
- **Rivigo API Docs**: Contact Rivigo for official API documentation

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Credits

- Converted from official Rivigo Java SDK
- Follows PSR standards and Laravel best practices
- Built with ❤️ for the PHP/Laravel community

## Changelog

### Version 1.0.0 (2026-01-03)

- Initial release
- Complete API coverage (Authorization, Booking, Tracking, RTO)
- All 21 model classes implemented
- Laravel Service Provider and Facades
- Comprehensive documentation
- PSR-4 compliant
- PHP 8.0+ type safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository at [SparrowBytes-FinTech-Solutions/rivigo-php-laravel-client](https://github.com/SparrowBytes-FinTech-Solutions/rivigo-php-laravel-client)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

If you discover any security-related issues, please email support@sparrowbytes.com instead of using the issue tracker.

---

Made with ❤️ for seamless logistics integration
