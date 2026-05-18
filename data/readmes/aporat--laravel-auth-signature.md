# Laravel Auth Signature

A robust Laravel package providing a middleware for validating API requests with **HMAC-SHA256** signatures. It features configurable signature templates, version-specific authentication settings, and a secure, time-based validation to protect your endpoints.

[![Packagist Version](https://img.shields.io/packagist/v/aporat/laravel-auth-signature?style=flat-square)](https://packagist.org/packages/aporat/laravel-auth-signature)
[![Packagist Downloads](https://img.shields.io/packagist/dt/aporat/laravel-auth-signature?style=flat-square)](https://packagist.org/packages/aporat/laravel-auth-signature)
[![PHP Version](https://img.shields.io/badge/PHP-^8.4-777BB4.svg?style=flat-square)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-12|13-FF2D20.svg?style=flat-square)](https://laravel.com)
[![GitHub Actions CI](https://img.shields.io/github/actions/workflow/status/aporat/laravel-auth-signature/ci.yml?branch=main&style=flat-square)](https://github.com/aporat/laravel-auth-signature/actions)
[![Code Coverage](https://img.shields.io/codecov/c/github/aporat/laravel-auth-signature?style=flat-square)](https://codecov.io/github/aporat/laravel-auth-signature)
[![GitHub License](https://img.shields.io/github/license/aporat/laravel-auth-signature?style=flat-square)](LICENSE)

---

## ✨ Features

- **HMAC-SHA256 Validation**: Securely validates incoming API requests.
- **Configurable Signature Templates**: Easily define the exact order and components of the string-to-be-signed.
- **Version-Specific Rules**: Apply different secrets, states, and signature templates based on an `X-Auth-Version` header.
- **Timestamp Validation**: Protects against replay attacks by ensuring requests are recent.
- **Simple Middleware Integration**: Secure your routes with a single middleware alias: `auth.signature`.
- **Clean and Modern Codebase**: Fully typed, tested, and built on modern PHP and Laravel features.

---

## 📋 Requirements

- **PHP**: ^8.4
- **Laravel**: 12.x or 13.x

---

## 🚀 Installation

1.  Install the package via Composer:
    ```bash
    composer require aporat/laravel-auth-signature
    ```

2.  Publish the configuration file. The service provider is auto-discovered.
    ```bash
    php artisan vendor:publish --provider="Aporat\AuthSignature\AuthSignatureServiceProvider" --tag="config"
    ```
    This will create a new configuration file at `config/auth-signature.php`.

---

## 🔧 Configuration

Edit `config/auth-signature.php` to define your clients, authentication versions, and settings.

```php
<?php

return [
    /*
    | Defines the time window, in seconds, for which a signature is valid.
    | This helps prevent replay attacks. Default is 300 seconds (5 minutes).
    */
    'timestamp_tolerance_seconds' => 300,

    /*
    | Define each client that can make signed requests.
    | The key is the Client ID sent in the `X-Auth-Client-ID` header.
    */
    'clients' => [
        'your-client-id' => [
            // The secret key used to sign requests for this client.
            'client_secret' => env('CLIENT_SECRET_KEY'),
            // The bundle ID or unique identifier for the client application.
            'bundle_id' => 'com.yourcompany.yourapp',
            // (Optional) The minimum auth version this client must use.
            'min_auth_level' => 10,
        ],
    ],

    /*
    | Define rules for different signature versions.
    | This allows you to evolve your signature algorithm over time.
    */
    'auth_versions' => [
        10 => [
            // (Optional) A version-specific secret appended to the client's secret.
            'secret' => env('AUTH_V10_SECRET'),
            // (Optional) A static string included in the signature for this version.
            'state' => 'some_static_string_for_v10',
            // (Optional) The exact order of components for the string-to-be-signed.
            'signature_template' => [
                'bundle_id', 'timestamp', 'client_id', 'state',
                'auth_version', 'method', 'signature', 'path',
            ],
        ],
    ],
];
```

Remember to add the corresponding keys to your `.env` file for security.

---

## 🛠️ Usage

### Applying the Middleware

Apply the `auth.signature` middleware to any route or route group that requires signature validation.

```php
// in routes/api.php
Route::middleware('auth.signature')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
});
```

The middleware will automatically validate incoming requests and throw a `SignatureException` (resulting in a 4xx HTTP response) if validation fails.

### Generating a Signature

You can use the `SignatureGenerator` class to create a valid signature, which is useful for testing or for client-side implementations.

```php
use Aporat\AuthSignature\SignatureGenerator;

// Resolve the generator from the container
$generator = app(SignatureGenerator::class);

$signature = $generator->generate(
    clientId: 'your-client-id',
    authVersion: 10,
    timestamp: time(),
    method: 'GET',
    path: '/api/orders',
    params: ['page' => 1]
);

// The output will be a 64-character HMAC-SHA256 hash
// e.g., "b5f0029b48b61a9151528c11e74f115340f666d44a141b279d633036e88c0353"
```

### Example Client Request

A client would then make a request including the generated signature and other required headers.

```bash
# Store timestamp and generate signature first
TIMESTAMP=$(date +%s)
SIGNATURE="..." # Generate signature using the same timestamp

curl -X GET "[http://yourapp.test/api/orders?page=1](http://yourapp.test/api/orders?page=1)" \
  -H "Content-Type: application/json" \
  -H "X-Auth-Client-ID: your-client-id" \
  -H "X-Auth-Version: 10" \
  -H "X-Auth-Timestamp: $TIMESTAMP" \
  -H "X-Auth-Signature: $SIGNATURE"
```

---

## 🧪 Testing

The package is fully tested. To run the test suite:

```bash
# Run all tests
composer test

# Run tests with code coverage
composer test-ci
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to fork the repository, create a feature branch, and open a pull request.

## 📜 License

This package is open-source software licensed under the **[MIT License](https://opensource.org/licenses/MIT)**.

## 💬 Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/aporat/laravel-auth-signature/issues).