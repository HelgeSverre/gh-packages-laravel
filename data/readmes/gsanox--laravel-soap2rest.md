# SOAP to REST

<!--[![Latest Version on Packagist](https://img.shields.io/packagist/v/gsanox/soap2rest.svg?style=flat-square)](https://packagist.org/packages/gsanox/soap2rest)
[![Total Downloads](https://img.shields.io/packagist/dt/gsanox/soap2rest.svg?style=flat-square)](https://packagist.org/packages/gsanox/soap2rest)-->

<p align="center">
  <img src="img/logo_dth.png" width=20% height=20%>
</p>

This package provides a simple way to expose a SOAP API as a RESTful service in Laravel. It allows you to register a WSDL, and then call the SOAP operations via REST endpoints.
This package is currently in development status, it not published on composer reposotory yet, so in order to test it, you will need to add the github repository to your package.json file like follows.

```bash
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/gsanox/laravel-soap2rest"
        }
    ],
```

## Installation

You can install the package via composer:

```bash
composer require gsanox/soap2rest
```

### Initial Setup

After installing the package, you need to publish and run the migrations. This will create the `services` table in your database, which is used to store information about registered SOAP services.

```bash
php artisan vendor:publish --tag="migrations"
php artisan migrate
```

### Authentication

This package uses Laravel Sanctum for API authentication. You need to ensure Laravel Sanctum is set up in your consuming application. If you haven't already, you can install it using:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Then, configure your `App\Models\User` model to use the `HasApiTokens` trait:

```php
<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // ...
}
```

Finally, ensure your API routes are protected by the `sanctum` middleware. The package's routes are already configured to use `api` middleware group, which should include `sanctum` by default if you have it set up correctly in `app/Http/Kernel.php`.

### Service Provider (Optional)

In most cases, Laravel's package auto-discovery will register the `Soap2RestServiceProvider` automatically. However, if you need to manually register it, you can add it to your `config/app.php` file in the `providers` array:

```php
'providers' => [
    // ...
    gsanox\Soap2Rest\Providers\Soap2RestServiceProvider::class,
],
```

## Configuration

You can customize the routes and middleware used by this package by publishing the configuration file:

```bash
php artisan vendor:publish --tag="config"
```

This will create a `config/soap2rest.php` file in your application. This file allows you to change the route prefix and the middleware for the package's routes.

```php
<?php

return [
    'prefix' => 'api/soap-proxy', // Example: Change the prefix
    'middleware' => ['api'],    // Example: Use different middleware
];
```

## Usage

### Registering a Service

To register a SOAP service, you need to send a `POST` request to the `/api/soap2rest/register` endpoint with the URL of the WSDL file.

**Request:**

```bash
POST /api/soap2rest/register
Content-Type: application/json

{
    "wsdl": "http://www.dneonline.com/calculator.asmx?wsdl"
}
```

**Response:**

```json
{
    "serviceId": "svc_60a..."
}
```

The `serviceId` returned is a unique identifier for the registered service. You will use this ID to call the SOAP operations.

### Calling a SOAP Operation

To call a SOAP operation, you need to send a `POST` request to the ` /api/soap2rest/{serviceId}/{operation}` endpoint. The body of the request should contain the parameters for the SOAP operation.

**Request:**

```bash
POST /api/soap2rest/svc_60a.../Add
Content-Type: application/json

{
    "intA": 10,
    "intB": 5
}
```

**Response:**

```json
{
    "AddResult": 15
}
```

### Unregistering a Service

To unregister a SOAP service, you need to send a `DELETE` request to the `/api/soap2rest/unregister/{serviceId}` endpoint.

**Request:**

```bash
DELETE /api/soap2rest/unregister/svc_60a...
```

**Response:**

```json
{
    "message": "Service unregistered successfully"
}
```

## API Reference

| Method | Endpoint                                   | Description                   |
|--------|--------------------------------------------|-------------------------------|
| POST   | `/api/soap2rest/register`                  | Registers a new SOAP service. |
| POST   | `/api/soap2rest/{serviceId}/{operation}`   | Calls a SOAP operation.       |
| DELETE | `/api/soap2rest/unregister/{serviceId}`    | Unregisters a SOAP service.   |

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [David Torres](https://github.com/gsanox)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Make a contribution to the author

Help me create more free content with your donation, choose what you want to donate.

[ <img src="img/paypal.svg" width="80px"> ](https://www.paypal.com/ncp/payment/BUYBC54T47M7L)
