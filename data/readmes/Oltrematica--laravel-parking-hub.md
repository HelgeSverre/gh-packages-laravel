![GitHub Tests Action Status](https://github.com/Oltrematica/laravel-parking-hub/actions/workflows/run-tests.yml/badge.svg)
![GitHub PhpStan Action Status](https://github.com/Oltrematica/laravel-parking-hub/actions/workflows/phpstan.yml/badge.svg)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/oltrematica/laravel-parking-hub.svg?style=flat-square)](https://packagist.org/packages/oltrematica/laravel-parking-hub)
[![Total Downloads](https://img.shields.io/packagist/dt/oltrematica/laravel-parking-hub.svg?style=flat-square)](https://packagist.org/packages/oltrematica/laravel-parking-hub)

# Laravel ParkingHub

<img src="https://github.com/user-attachments/assets/3e57322c-204d-4fb2-a89e-02609fe67fa3" width="100" height="100" />


`laravel-parking-hub` is a Laravel package designed to create a unified and consistent way to interact with different
parking service APIs (e.g., Parkeon, My Cicero). It aims to standardize the input and output of parking validation
requests, making it easier to integrate and manage multiple parking providers.

## Key features:

- **Standardized Data Transfer Objects (DTOs)**: Defines DTOs for representing standard responses from parking service APIs, ensuring consistency across different providers.
- **Unified Interface**: Provides a common interface for executing parking validation requests (e.g., checking license plates) across different services.
- **Response Standardization**: Standardizes the response format, including status (success/error), parking validity, and expiration details.
- **Easy Integration**: Simplifies the integration of new parking service providers by providing a clear structure for data mapping and response handling.

## Prerequisites

- Laravel v10, v11 and v12
- PHP 8.3 or higher

## Installation

```bash
composer require oltrematica/laravel-parking-hub
```

# Usage Guide

## Configuration

1.  **Publish the configuration file**:
    To customize the default configuration, publish the `parking-hub.php` config file using the following Artisan command:

    ```bash
    php artisan vendor:publish --provider="Oltrematica\\ParkingHub\\ParkingHubServiceProvider" --tag="parking-hub-config"
    ```
    This will create a `config/parking-hub.php` file in your application's config directory.

2.  **Configure Your Drivers**:
    Open the `config/parking-hub.php` file. Here you can define and configure your parking drivers.

    *   **Default Driver**: Set the `default_driver` option to specify the driver to be used when no driver is explicitly chosen.
        ```php
        'default_driver' => env('PARKING_HUB_DEFAULT_DRIVER', 'easypark'),
        ```

    *   **Driver Settings**: Under the `drivers` array, configure each provider. Each driver configuration must include a `class` key, which specifies the class that implements the `Oltrematica\\ParkingHub\\Contracts\\ParkingValidator` interface. You will also add provider-specific settings like API keys, endpoints, etc.

        ```php
        'drivers' => [
            'easypark' => [
                'class' => YourVendor\\LaravelEasyPark\\EasyParkValidator::class, // Replace with the actual validator class
                'api_url' => env('EASYPARK_API_URL', 'https://cityname.parkinghub.net/restresources'),
                'username' => env('EASYPARK_USERNAME'),
                'password' => env('EASYPARK_PASSWORD'),
                // other configuration options specific to EasyPark
            ],

            'mycicero' => [
                'class' => YourVendor\\LaravelMyCicero\\MyCiceroValidator::class, // Replace with the actual validator class
                'username' => env('MYCICERO_USERNAME'),
                'password' => env('MYCICERO_PASSWORD'),
                'soap' => [
                    'endpoint' => env('MYCICERO_SOAP_ENDPOINT', 'https://cldweb.autobus.it/proxy.imomo/api/wsisosta_verifica'),
                    'namespace' => env('MYCICERO_SOAP_NAMESPACE', 'http://pluservice.net/ISosta'),
                    // ... other MyCicero specific SOAP settings
                ],
            ],

            'parkeon' => [
                'class' => Oltrematica\\ParkingHub\\Validators\\ParkeonValidator::class, // Example, replace with actual
                'username' => env('PARKEON_USERNAME'),
                'password' => env('PARKEON_PASSWORD'),
                'endpoint' => env('PARKEON_ENDPOINT', 'https://parkeon.services/jlab/rest/1/pbs/getTransactions'),
                // other configuration options specific to Parkeon
            ],

            // Add other parking providers here
        ],
        ```
    Ensure you have the necessary environment variables (e.g., `EASYPARK_USERNAME`, `MYCICERO_PASSWORD`) set in your `.env` file.

## Basic Usage

You can interact with the parking drivers through the `ParkingHub` facade or by resolving the manager from the service container.

### Using the Facade

```php
use Oltrematica\\ParkingHub\\Facades\\ParkingHub;
use Carbon\\Carbon;

// Check plate using the default driver
$response = ParkingHub::checkPlate('AA123BB', Carbon::now());

// Check plate using a specific driver
$responseEasypark = ParkingHub::driver('easypark')->checkPlate('AA123BB', Carbon::now());
$responseMyCicero = ParkingHub::driver('mycicero')->checkPlate('CC456DD', Carbon::now());

// The $response will be an instance of Oltrematica\ParkingHub\DTOs\ParkingValidationResponseData
if ($response->isValid) {
    // Parking is valid
    echo "Plate {$response->plate} parking is valid. Ends at: " . ($response->parkingEndTime ? $response->parkingEndTime->format('Y-m-d H:i:s') : 'N/A');
} else {
    // Parking is not valid or an error occurred
    echo "Plate {$response->plate} parking is not valid. Status: {$response->responseStatus->value}";
}
```

### Resolving from the Container

```php
use Oltrematica\\ParkingHub\\Support\\Manager\\ParkingHubManager;
use Carbon\\Carbon;

// Resolve the manager
$parkingHubManager = app(ParkingHubManager::class);

// Check plate using the default driver
$response = $parkingHubManager->driver()->checkPlate('AA123BB', Carbon::now());

// Check plate using a specific driver
$responseParkeon = $parkingHubManager->driver('parkeon')->checkPlate('EE789FF', Carbon::now());
```

## Understanding the Response

The `checkPlate` method returns a `Oltrematica\ParkingHub\DTOs\ParkingValidationResponseData` object. This DTO contains the following properties:

- `responseStatus`: An enum (`Oltrematica\ParkingHub\Enums\ProviderInteractionStatus`) indicating the outcome of the interaction with the provider (e.g., `SUCCESS`, `ERROR_PROVIDER_UNREACHABLE`, `ERROR_INVALID_CREDENTIALS`).
- `plate`: The license plate number checked.
- `requestTimestamp`: A `CarbonInterface` object representing when the request was initiated.
- `verificationTimestamp`: A `CarbonInterface` object representing the date and time for which parking validity was checked.
- `isValid`: A boolean indicating if the parking is valid for the given `verificationTimestamp`.
- `parkingEndTime`: A `CarbonInterface` object indicating when the parking expires, or `null` if not applicable or unknown.
- `purchasedParkings`: An array of `Oltrematica\ParkingHub\DTOs\PurchasedParkingData` objects, providing details of active parking sessions if available from the provider. Each `PurchasedParkingData` object has `startDateTime` and `endDateTime`.

## Adding a New Driver

To add support for a new parking service provider:

1.  **Create a Validator Class**: Implement the `Oltrematica\ParkingHub\Contracts\ParkingValidator` interface. This class will handle the interaction with the provider's API. The `checkPlate` method should:

    - Accept the license plate number and verification date/time as parameters.
    - Handle API response (success, errors, authentication issues).
    - Map the provider's response to the fields of `ParkingValidationResponseData`.

    Example (replace with actual API interaction and mapping logic):

    ```php
    public function checkPlate(string $plateNumber, CarbonInterface $verificationDateTime): ParkingValidationResponseData
    {
        $requestTimestamp = now();

        // Simulate an API call that finds a valid parking
        $isValid = false; // Determine from API response
        $parkingEndTime = null; // Determine from API response
        $purchasedParkings = []; // Populate if provider returns multiple active parkings
        $responseStatus = ProviderInteractionStatus::SUCCESS; // Set based on API interaction outcome

        if ($plateNumber === 'VALID123') {
            $isValid = true;
            $parkingEndTime = $verificationDateTime->copy()->addHours(2);
            $purchasedParkings[] = new \Oltrematica\ParkingHub\DTOs\PurchasedParkingData(
                startDateTime: $verificationDateTime->copy()->subHour(),
                endDateTime: $parkingEndTime
            );
        } elseif ($plateNumber === 'APIERROR') {
            $responseStatus = ProviderInteractionStatus::ERROR_PROVIDER_SPECIFIC;
        }

        return new ParkingValidationResponseData(
            responseStatus: $responseStatus,
            plate: $plateNumber,
            requestTimestamp: $requestTimestamp,
            verificationTimestamp: $verificationDateTime,
            isValid: $isValid,
            parkingEndTime: $parkingEndTime,
            purchasedParkings: $purchasedParkings
        );
    }
    ```

2.  **Configure the New Driver**: Add its configuration to the `drivers` array in `config/parking-hub.php`:
    ```php
    'drivers' => [
        // ... other drivers
        'your_new_driver' => [
            'class' => YourVendor\\YourPackage\\YourNewDriverValidator::class,
            'api_key' => env('YOUR_NEW_DRIVER_API_KEY'),
            'api_secret' => env('YOUR_NEW_DRIVER_API_SECRET'),
            // other necessary configuration
        ],
    ],
    ```

3.  **Use the New Driver**:
    ```php
    $response = ParkingHub::driver('your_new_driver')->checkPlate('XYZ789', Carbon::now());
    ```

## Translations

This package includes translations for messages. To publish the translation files to your application's `lang/vendor` directory, use:

```bash
php artisan vendor:publish --provider="Oltrematica\\\\ParkingHub\\\\ParkingHubServiceProvider" --tag="oltrematica-parking-hub-translations"
```
You can then customize the translations in `lang/vendor/oltrematica-parking-hub/{locale}`.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details. If this file does not exist, you can create one or refer to the main repository's contributing guidelines. For now, contributions can be made via Pull Requests on the [GitHub repository](https://github.com/Oltrematica/laravel-parking-hub).

## Security Vulnerabilities

If you discover a security vulnerability within this package, please send an e-mail to [security@oltrematica.it](mailto:security@oltrematica.it). All security vulnerabilities will be promptly addressed. Alternatively, you can check the [security policy](https://github.com/Oltrematica/laravel-parking-hub/security/policy) on GitHub.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
