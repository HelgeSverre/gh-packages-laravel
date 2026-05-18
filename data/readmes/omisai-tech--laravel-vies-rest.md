# Laravel VIES REST

[![Latest Version on Packagist](https://img.shields.io/packagist/v/omisai/laravel-vies-rest.svg?style=flat-square)](https://packagist.org/packages/omisai/laravel-vies-rest)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/sponsors/omisai-tech/LICENSE)
[![Test](https://github.com/omisai-tech/laravel-vies-rest/actions/workflows/test.yml/badge.svg)](https://github.com/omisai-tech/laravel-vies-rest/actions/workflows/test.yml)
[![PHP Version Require](https://img.shields.io/badge/PHP-%3E%3D8.1-blue?style=flat-square&logo=php)](https://packagist.org/packages/omisai/laravel-vies-rest)

A Laravel adapter for the [VIES REST API package](https://github.com/omisai-tech/php-vies-rest), utilizing Laravel's HTTP client.

## Features

- **Type-safe**: PHP 8.1+ type declarations and modern enum support
- **Clean architecture**: DTOs, validation, and HTTP adapters
- **Production + test modes**: Switch services via `ViesConfig`
- **Error handling**: Structured exceptions for validation and REST errors
- **Approximate matching**: Trader detail matching support
- **All EU countries**: EU member states plus Northern Ireland
- **Tested**: Pest-based test suite

## Requirements

- PHP 8.1 or higher
- omisai/vies-rest (base package)
- illuminate/http v10 or higher (Laravel HTTP client)

## Installation

Install the package via Composer:

```bash
composer require omisai/laravel-vies-rest
```

## Quick Start

This package requires the base `omisai/vies-rest` package.

The `Omisai\LaravelViesRest\ViesRestServiceProvider` service provider automatically registers the Laravel HTTP client adapter. The `Omisai\ViesRest\ViesClient` will use Laravel's HTTP client instead of direct Guzzle.

### Via Dependency Injection

```php
...
use Omisai\ViesRest\ViesClient;
use Omisai\ViesRest\Enum\EuropeanUnionCountry;

class ExampleController extends Controller
{
    public function __construct(
        private ViesClient $viesClient,
    ) {}

    public function checkVat(Request $request)
    {
        $countryCode = $request->input('country_code');
        $vatNumber = $request->input('vat_number');

        $isValidCountryCode = EuropeanUnionCountry::validateCountryCode($countryCode);
        if (!$isValidCountryCode) {
            return response()->json(['error' => 'Invalid country code'], 400);
        }

        $response = $this->viesClient->checkVat($countryCode, $vatNumber);

        return response()->json([
            'valid' => $response->valid,
            'name' => $response->name,
            'address' => $response->address,
        ]);
    }
}
```

### Via Service Container Resolution

```php
<?php
// In a controller, service, or route closure
$client = app(ViesClient::class);
$response = $client->checkVat('DE', '123456789');
```

### Using the Test Service

```php
use Omisai\ViesRest\ViesClient;
use Omisai\ViesRest\ViesConfig;

$config = ViesConfig::test(); /
$factory = app(HttpClientFactoryInterface::class);
$client = new ViesClient($config, $factory);

$response = $client->checkVat('DE', '100');

var_dump($response->valid); // true for test numbers
```

## Configuration

### Environment Configuration

```php
use Omisai\ViesRest\ViesConfig;

$production = ViesConfig::production();
$test = ViesConfig::test();

$custom = ViesConfig::production(baseUrl: 'https://custom-vies.example.com');
```

### HTTP Client Options

```php
use Omisai\ViesRest\ViesClient;
use Omisai\ViesRest\ViesConfig;

$options = [
    'timeout' => 30,
    'connect_timeout' => 10,
    'headers' => [
        'User-Agent' => 'MyApp/1.0',
    ],
];

$client = new ViesClient(ViesConfig::production(options: $options));
```

## API Reference

### ViesClient

#### `checkVat(string $countryCode, string $vatNumber): CheckVatResponse`

Validates a VAT number and returns basic information.

#### `checkVatApprox(CheckVatRequest $request): CheckVatResponse`

Performs approximate validation with trader details.

#### `checkStatus(): StatusInformationResponse`

Returns availability info for member states.

### Data Transfer Objects (DTOs)

#### CheckVatRequest

```php
use Omisai\ViesRest\DTO\CheckVatRequest;

$request = new CheckVatRequest(
    countryCode: 'NL',
    vatNumber: '123456789B01',
    traderName: 'Example B.V.',
    traderStreet: 'Main Street 123',
    traderPostalCode: '1234AB',
    traderCity: 'Amsterdam',
    requesterMemberStateCode: 'DE',
    requesterNumber: '123456789',
);
```

#### CheckVatResponse

```php
# Omisai\ViesRest\DTO\CheckVatResponse;

echo $response->countryCode;
echo $response->vatNumber;
echo $response->requestDate->format('Y-m-d');
echo $response->valid ? 'Yes' : 'No';
```

## Supported Countries

```php
use Omisai\ViesRest\Enum\EuropeanUnionCountry;

$isValid = EuropeanUnionCountry::isEuropeanUnionCountryCode('DE'); // true
$isValid = EuropeanUnionCountry::isEuropeanUnionCountryCode('US'); // false
```

## Error Handling

### Validation Errors

```php
use Omisai\ViesRest\Exceptions\ViesValidationException;
use Omisai\ViesRest\ViesClient;

$client = app(ViesClient::class);

try {
    $client->checkVat('INVALID', '123');
} catch (ViesValidationException $e) {
    echo "Validation error: {$e->getMessage()}\n";
}
```

### REST API Errors

```php
use Omisai\ViesRest\Exceptions\ViesApiException;
use Omisai\ViesRest\ViesClient;

$client = app(ViesClient::class);

try {
    $client->checkVat('DE', '123456789');
} catch (ViesApiException $e) {
    echo "API error: {$e->getMessage()}\n";
    echo "Status code: {$e->getStatusCode()}\n";
}
```

## Advanced Usage

### Custom HTTP Client Factory

```php
use Omisai\ViesRest\ViesClient;
use Omisai\ViesRest\Http\HttpClientFactoryInterface;

class CustomHttpClientFactory implements HttpClientFactoryInterface
{
    public function create(string $baseUrl, array $options = [])
    {
        // Return a custom adapter implementing HttpClientInterface
    }
}

$client = new ViesClient(clientFactory: new CustomHttpClientFactory());
```

### Custom Validation

```php
use Omisai\ViesRest\ViesClient;
use Omisai\ViesRest\Validation\VatNumberValidator;

class CustomVatNumberValidator extends VatNumberValidator
{
    // Implement custom validation logic
}

$client = new ViesClient(validator: new CustomVatNumberValidator());
```

### Batch Processing

```php
use Omisai\ViesRest\ViesClient;

$client = app(ViesClient::class);
$vatNumbers = [
    ['DE', '123456789'],
    ['NL', '123456789B01'],
    ['FR', '12345678901'],
];

$results = [];
foreach ($vatNumbers as [$country, $vat]) {
    try {
        $response = $client->checkVat($country, $vat);
        $results[] = [
            'country' => $response->countryCode,
            'vat' => $response->vatNumber,
            'valid' => $response->valid,
            'name' => $response->name,
        ];
    } catch (Exception $e) {
        $results[] = [
            'country' => $country,
            'vat' => $vat,
            'error' => $e->getMessage(),
        ];
    }
}

print_r($results);
```

## Testing

Run the test suite using Pest:

```bash
composer test
```

## Performance Considerations

- The VIES service has rate limits - avoid excessive requests
- REST calls are synchronous and may take 1-5 seconds
- Consider caching valid VAT numbers to reduce API calls
- Use the test service for development to avoid affecting production quotas

## Limitations

- Requires internet connection to VIES service
- Service may be unavailable during maintenance windows
- Rate limiting applies to prevent abuse
- Some countries may have additional validation rules

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Security

Please see [SECURITY.md](.github/SECURITY.md) for details on reporting security vulnerabilities.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Sponsoring

If you find this package useful, please consider sponsoring the development: [Sponsoring on GitHub](https://github.com/sponsors/omisai-tech)

Your support helps us maintain and improve this open-source project!

## Official VIES Documentation

- [European Commission VIES Website](https://ec.europa.eu/taxation_customs/vies)
- [VIES REST API Documentation](https://ec.europa.eu/assets/taxud/vow-information/swagger_publicVAT.yaml)
