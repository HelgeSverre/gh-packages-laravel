# Laravel License API

RESTful API package for [laravel-license-core](https://github.com/akira/laravel-license-core). This package provides complete API endpoints for license validation, activation, usage tracking, and management.

## Features

- License listing and retrieval
- License validation by key
- License activation management
- Full REST API with proper HTTP status codes
- Laravel Sanctum ready for authentication
- Comprehensive API Resources for clean JSON responses
- Form Request validation for all endpoints
- Spatie Route Attributes for clean route definitions

## Installation

```bash
composer require akira/laravel-licence-api
```

## API Endpoints

### Licenses

#### List Licenses
```
GET /api/v1/licenses
```

#### Get License
```
GET /api/v1/licenses/{id}
```

#### Validate License
```
POST /api/v1/licenses/validate
Content-Type: application/json

{
  "key": "LICENSE-KEY"
}
```

### License Activations

#### List Activations
```
GET /api/v1/licenses/{license}/activations
```

#### Get Activation
```
GET /api/v1/licenses/{license}/activations/{activation}
```

#### Create Activation
```
POST /api/v1/licenses/{license}/activations
Content-Type: application/json

{
  "license_id": 1,
  "domain": "example.com",
  "machine_hash": "abc123def456",
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0"
}
```

#### Delete Activation
```
DELETE /api/v1/licenses/{license}/activations/{activation}
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Akira\LaravelLicenseApi\LaravelLicenseApiServiceProvider"
```

Configure the API prefix and middleware in `config/licence-api.php`:

```php
return [
    'prefix' => env('LICENCE_API_PREFIX', 'api/v1'),
    'middleware' => ['api'],
];
```

## Testing

Run the test suite:

```bash
composer test
```

Run specific test suites:

```bash
composer run test:lint    # Code style
composer run test:refactor # Rector checks
composer run test:types    # PHPStan static analysis
composer run test:arch     # Architecture tests
composer run test:coverage # Code coverage
```

## Requirements

- PHP 8.4+
- Laravel 12.0+
- laravel-license-core ^1.0

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
