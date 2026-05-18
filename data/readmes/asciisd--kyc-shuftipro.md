# Asciisd KYC ShuftiPro Driver

[![Latest Version on Packagist](https://img.shields.io/packagist/v/asciisd/kyc-shuftipro.svg?style=flat-square)](https://packagist.org/packages/asciisd/kyc-shuftipro)
[![Total Downloads](https://img.shields.io/packagist/dt/asciisd/kyc-shuftipro.svg?style=flat-square)](https://packagist.org/packages/asciisd/kyc-shuftipro)
[![License](https://img.shields.io/packagist/l/asciisd/kyc-shuftipro.svg?style=flat-square)](https://packagist.org/packages/asciisd/kyc-shuftipro)
[![PHP Version](https://img.shields.io/packagist/php-v/asciisd/kyc-shuftipro.svg?style=flat-square)](https://packagist.org/packages/asciisd/kyc-shuftipro)

A Laravel package that provides **ShuftiPro integration** for the Asciisd KYC Core package. Features **automatic webhook handling**, **provider-specific status mapping**, and **zero-config infrastructure routes**.

## Package Information

-   **Package**: [asciisd/kyc-shuftipro](https://packagist.org/packages/asciisd/kyc-shuftipro)
-   **Latest Version**: v1.0.0
-   **PHP Requirements**: ^8.2
-   **Laravel Requirements**: ^12.0
-   **License**: MIT

## ✨ Features

-   **🚀 Zero-Config Setup**: Automatic webhook routes - no manual configuration needed!
-   **🎯 Smart Status Mapping**: ShuftiPro-specific event mapping to standardized KYC statuses
-   **🔄 Complete Integration**: Full API integration with ShuftiPro services
-   **🛣️ Journey Support**: Support for both IDV journeys and direct API verification
-   **📁 Document Management**: Automatic document download and storage
-   **🔒 Secure Webhooks**: Signature validation and comprehensive logging
-   **🖼️ Image Processing**: Support for document images, selfies, and verification videos
-   **🔍 Duplicate Detection**: Built-in duplicate account detection
-   **📊 Comprehensive Logging**: Detailed logging for debugging and monitoring
-   **⚡ Auto-Infrastructure**: Webhook endpoints automatically registered by KYC Core

## Installation

```bash
composer require asciisd/kyc-shuftipro
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=shuftipro-config
```

### Environment Variables

Add these variables to your `.env` file:

```env
# ShuftiPro API Configuration
SHUFTIPRO_CLIENT_ID=your_client_id
SHUFTIPRO_SECRET_KEY=your_secret_key
SHUFTIPRO_BASE_URL=https://api.shuftipro.com

# ShuftiPro Webhook Configuration
SHUFTIPRO_WEBHOOK_SECRET=your_webhook_secret
SHUFTIPRO_CALLBACK_URL=https://yourdomain.com/webhooks/kyc/callback
SHUFTIPRO_REDIRECT_URL=https://yourdomain.com/kyc/complete

# ShuftiPro Journey Configuration
SHUFTIPRO_DEFAULT_JOURNEY_ID=your_journey_id

# ShuftiPro Logging
SHUFTIPRO_LOGGING_ENABLED=true
SHUFTIPRO_LOG_CHANNEL=daily
```

## Usage

### Basic Verification

```php
use Asciisd\KycCore\Facades\Kyc;
use Asciisd\KycCore\DTOs\KycVerificationRequest;

// Create a simple verification
$response = Kyc::createSimpleVerification($user, [
    'country' => 'US',
    'language' => 'en'
]);

// Create a full verification request
$request = new KycVerificationRequest(
    email: 'user@example.com',
    country: 'US',
    language: 'en',
    journeyId: 'your_journey_id'
);

$response = Kyc::createVerification($user, $request);
```

### Journey-based Verification

```php
// Use a specific journey ID
$request = new KycVerificationRequest(
    email: 'user@example.com',
    journeyId: 'your_custom_journey_id',
    allowedCountries: ['US', 'CA', 'GB'],
    deniedCountries: ['IR', 'KP']
);

$response = Kyc::createVerification($user, $request);
```

### 🚀 Automatic Webhook Handling

**NEW!** Webhooks are now handled automatically - no manual route setup required!

#### Auto-Registered Webhook Routes

The KYC Core package automatically registers these routes:

```php
POST   /api/kyc/webhook                 // ✅ Use this URL in ShuftiPro dashboard
POST   /api/kyc/webhook/callback        // ✅ Alternative webhook endpoint
GET    /api/kyc/verification/complete   // ✅ Verification completion callback
```

#### ShuftiPro Configuration

Simply configure your ShuftiPro webhook URL to:

```env
SHUFTIPRO_CALLBACK_URL=https://yourdomain.com/api/kyc/webhook
```

#### Benefits

-   ✅ **Zero Setup** - Works immediately after installation
-   ✅ **Automatic Processing** - Webhooks processed with proper status mapping
-   ✅ **Secure** - Built-in signature validation
-   ✅ **Logged** - Comprehensive logging for debugging
-   ✅ **Consistent** - Same behavior across all applications

#### Manual Webhook Processing (Optional)

If you need custom webhook handling:

```php
// Optional: Custom webhook processing
$response = Kyc::processWebhook($request->all(), $request->headers->all());

if ($response->isSuccessful()) {
    // Custom logic after successful verification
}
```

### Document Management

```php
// Download documents for a user
$documents = Kyc::downloadDocuments($user, $reference);

// The documents are automatically stored in your configured storage disk
```

## Configuration

### API Configuration

```php
// config/shuftipro.php
'api' => [
    'client_id' => env('SHUFTIPRO_CLIENT_ID'),
    'secret_key' => env('SHUFTIPRO_SECRET_KEY'),
    'base_url' => env('SHUFTIPRO_BASE_URL', 'https://api.shuftipro.com'),
    'timeout' => env('SHUFTIPRO_TIMEOUT', 30),
],
```

### Webhook Configuration

```php
'webhook' => [
    'secret_key' => env('SHUFTIPRO_WEBHOOK_SECRET'),
    'callback_url' => env('SHUFTIPRO_CALLBACK_URL'),
    'redirect_url' => env('SHUFTIPRO_REDIRECT_URL'),
    'signature_validation' => env('SHUFTIPRO_WEBHOOK_SIGNATURE_VALIDATION', true),
],
```

### Document Configuration

```php
'documents' => [
    'auto_download' => env('SHUFTIPRO_AUTO_DOWNLOAD_DOCUMENTS', true),
    'storage_disk' => env('SHUFTIPRO_DOCUMENT_STORAGE_DISK', 's3'),
    'storage_path' => env('SHUFTIPRO_DOCUMENT_STORAGE_PATH', 'shuftipro/documents'),
    'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf', 'mp4'],
    'max_file_size' => env('SHUFTIPRO_MAX_FILE_SIZE', 10485760), // 10MB
],
```

## Supported Features

### Document Types

-   Identity documents (passport, driver's license, national ID)
-   Address verification documents
-   Selfie verification
-   Video verification
-   Verification reports

### Verification Methods

-   IDV Journey verification
-   Direct API verification
-   Custom journey configurations
-   Country-specific verification rules

### Security Features

-   Webhook signature validation
-   Secure document storage
-   Duplicate account detection
-   Comprehensive audit logging

## Events

The package fires standard KYC events that you can listen to:

```php
use Asciisd\KycCore\Events\VerificationStarted;
use Asciisd\KycCore\Events\VerificationCompleted;
use Asciisd\KycCore\Events\VerificationFailed;

Event::listen(VerificationCompleted::class, function ($event) {
    // Handle successful verification
    Log::info('ShuftiPro verification completed for user: ' . $event->user->id);
});
```

## Error Handling

The package includes comprehensive error handling:

```php
use Asciisd\KycShuftiPro\Exceptions\ShuftiProException;

try {
    $response = Kyc::createVerification($user, $request);
} catch (ShuftiProException $e) {
    // Handle ShuftiPro-specific errors
    Log::error('ShuftiPro error: ' . $e->getMessage());
}
```

## Testing

```bash
composer test
```

## 🎯 ShuftiPro Status Mapping

The driver automatically maps ShuftiPro events to standardized KYC statuses:

```php
// ShuftiPro Event → KYC Status
'request.pending'           → RequestPending
'verification.pending'      → InProgress
'verification.in_progress'  → InProgress
'verification.review_pending' → ReviewPending
'verification.completed'    → Completed
'verification.approved'     → Completed
'verification.accepted'     → VerificationCompleted
'verification.failed'       → VerificationFailed
'verification.declined'     → Rejected
'verification.cancelled'    → VerificationCancelled
'request.timeout'          → RequestTimeout
```

### Benefits

-   ✅ **Automatic Mapping** - No manual status handling required
-   ✅ **Standardized** - Consistent status across all KYC providers
-   ✅ **Provider-Specific** - Handles ShuftiPro's unique event names
-   ✅ **Extensible** - Easy to add new event mappings

## API Reference

### ShuftiProDriver Methods

-   `createVerification(Model $user, KycVerificationRequest $request): KycVerificationResponse`
-   `createSimpleVerification(Model $user, array $options = []): KycVerificationResponse`
-   `retrieveVerification(string $reference): KycVerificationResponse`
-   `processWebhook(array $payload, array $headers = []): KycVerificationResponse`
-   `downloadDocuments(Model $user, string $reference): array`
-   `validateWebhookSignature(array $payload, array $headers): bool`

### Response Data

The package returns comprehensive verification data including:

-   Verification status and results
-   Extracted document data
-   Document image URLs
-   Verification video URLs
-   Duplicate detection results
-   Decline reasons (if applicable)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
