# HyperVerge Laravel Package

A comprehensive Laravel package for HyperVerge KYC APIs with document signing, QR verification, blockchain timestamping, and certificate generation.

## Compatibility
- Laravel 11, 12, 13
- PHP 8.3+

## Features

✅ **KYC Verification** - Selfie liveness, face match, ID verification
✅ **Face Verification** - Biometric authentication with stored reference selfies
✅ **Document Signing** - PKCS#7 digital signatures with tamper detection
✅ **QR Code Verification** - Instant document verification via QR codes
✅ **Blockchain Timestamping** - Immutable proof on Bitcoin via OpenTimestamps
✅ **Verification Certificates** - Professional PDF certificates with QR codes
✅ **Type-Safe DTOs** - Spatie Laravel Data for type safety
✅ **Laravel Actions** - Flexible, reusable operations

## Installation

```bash
composer require lbhurtado/hyperverge
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Hyperverge\HypervergeServiceProvider"
```

Add your HyperVerge credentials to `.env`:

```env
HYPERVERGE_BASE_URL=https://api.hyperverge.co
HYPERVERGE_APP_ID=your-app-id
HYPERVERGE_APP_KEY=your-app-key
```

## Usage

### Selfie Liveness

```php
use LBHurtado\HyperVerge\Services\SelfieLivenessService;

$service = app(SelfieLivenessService::class);
$result = $service->verify($base64Image);

if ($result->isLive) {
    // Selfie is live
}
```

### Face Match

```php
use LBHurtado\HyperVerge\Services\FaceMatchService;

$service = app(FaceMatchService::class);
$result = $service->match($referenceImage, $selfieImage);

if ($result->isMatch) {
    echo "Confidence: {$result->confidence}";
}
```

### Link-based KYC

```php
use LBHurtado\HyperVerge\Services\LinkKYCService;

$service = app(LinkKYCService::class);
$session = $service->createSession([
    'redirectUrl' => 'https://yourapp.com/callback',
]);
```

### Fetch Results

```php
use LBHurtado\HyperVerge\Services\ResultsService;

$service = app(ResultsService::class);
$result = $service->fetch($sessionId);

echo $result->applicationStatus;
```

## Face Verification

Biometric authentication using stored reference selfies for login, payments, and more.

### Enroll a Face

```php
use LBHurtado\HyperVerge\Traits\HasFaceVerification;

// Add trait to your model
class User extends Model implements HasMedia
{
    use InteractsWithMedia, HasFaceVerification;
}

// Enroll reference selfie
$user->enrollFace(
    selfie: $request->file('selfie'),
    checkLiveness: true,
    metadata: ['enrolled_at' => now(), 'ip' => $request->ip()]
);
```

### Verify a Face

```php
$result = $user->verifyFace(
    selfie: $request->file('selfie'),
    context: ['action' => 'login', 'ip' => $request->ip()]
);

if ($result->verified) {
    Auth::login($user);
    echo "Match confidence: {$result->matchConfidence}";
} else {
    echo "Failed: {$result->failureReason}";
}
```

### Check Enrollment Status

```php
if ($user->hasReferenceSelfie()) {
    // User can verify by face
}

// Get statistics
$stats = $user->getFaceVerificationStats();
echo "Success rate: {$stats['success_rate']}%";
```

**Full Documentation**: See [Face Verification Guide](docs/FACE_VERIFICATION.md) for:
- Login by face
- Payment authorization
- Document signing
- Access control
- Security best practices
- Troubleshooting

## QR Code Verification

### Generate QR Code for Verification

```php
use LBHurtado\HyperVerge\Actions\Document\GenerateVerificationQRCode;

// Generate QR code with verification URL
$qrData = GenerateVerificationQRCode::run(
    url: 'https://yourapp.com/verify/campaign-uuid/transaction-id',
    size: 300,
    margin: 10
);

// Returns:
// [
//     'data_uri' => 'data:image/png;base64,...',  // For embedding in images
//     'file_path' => '/tmp/qr_abc123.png',        // Physical file path
//     'url' => 'https://...',                     // Original URL
//     'size' => 300,                              // QR dimensions
//     'margin' => 10,                             // QR margin
// ]
```

### Add QR Watermark to Signed PDF

```php
use LBHurtado\HyperVerge\Actions\Document\AddQRWatermarkToPDF;

// Add QR code to PDF (bottom-right corner by default)
$watermarkedPdf = AddQRWatermarkToPDF::run(
    pdfPath: $signedPdfPath,
    qrCodePath: $qrData['file_path']
);

// With custom options
$watermarkedPdf = AddQRWatermarkToPDF::run(
    pdfPath: $signedPdfPath,
    qrCodePath: $qrData['file_path'],
    page: -1,              // -1 = last page, 0 = all pages, 1+ = specific page
    position: 'bottom-right',
    size: 100,             // QR size in pixels
    opacity: 100           // 0-100% opacity
);
```

### Generate Verification Certificate

```php
use LBHurtado\HyperVerge\Actions\Certificate\GenerateVerificationCertificate;

$certificatePath = GenerateVerificationCertificate::run(
    model: $submission,
    transactionId: $transactionId,
    options: [
        'verificationUrl' => route('verify', [$uuid, $transactionId]),
        'metadata' => [
            'campaign' => $campaign->name,
            'campaign_id' => $campaign->id,
        ],
    ]
);
// Certificate automatically includes QR code
```

### Complete Document Signing Workflow

```php
use LBHurtado\HyperVerge\Actions\Document\MarkDocumentWithKYC;

// Signs document, adds QR watermark, stores in media library
$result = MarkDocumentWithKYC::run(
    model: $submission,
    transactionId: $transactionId,
    additionalMetadata: [
        'signer' => $submission->name,
        'purpose' => 'Identity Verification',
    ],
    tile: 1,  // Signature position (1-9 for multi-signer)
    logoPath: public_path('images/logo.png')
);

// Returns:
// [
//     'stamp' => $signatureMark,      // Media object for signature stamp
//     'signed_document' => $signedDoc, // Media object for signed PDF with QR
// ]
```

## Configuration

### QR Code Settings

```php
// config/hyperverge.php

'qr_code' => [
    'enabled' => true,
    'default_size' => 300,
    'margin' => 10,
    'error_correction' => 'H', // L, M, Q, H (7%, 15%, 25%, 30%)
],

'document_signing' => [
    'qr_watermark' => [
        'enabled' => true,
        'position' => 'bottom-right',  // Any 9 positions supported
        'size' => 100,                 // QR size in pixels (~0.33 inches at 300 DPI)
        'page' => -1,                  // -1 = last page, 0 = all, 1+ = specific
        'opacity' => 100,              // 0-100% opacity
    ],
],
```

### Environment Variables

```env
# HyperVerge API
HYPERVERGE_BASE_URL=https://ind.idv.hyperverge.co/v1
HYPERVERGE_APP_ID=your_app_id
HYPERVERGE_APP_KEY=your_app_key
HYPERVERGE_URL_WORKFLOW=onboarding

# QR Code Settings (optional)
HYPERVERGE_QR_ENABLED=true

# Document Signing (optional)
HYPERVERGE_DOCUMENT_SIGNING_ENABLED=true
HYPERVERGE_AUTO_SIGN_ON_APPROVAL=false
```

## Verification URL Format

All QR codes point to the verification URL:

```
https://yourapp.com/verify/{campaign_uuid}/{transaction_id}
```

**URL Components**:
- `campaign_uuid`: Unique campaign identifier
- `transaction_id`: HyperVerge transaction ID

**What Users See**:
- ✅ Verified identity information (name, DOB, ID type, etc.)
- ✅ Signature stamp with ID card image
- ✅ Signed document download
- ✅ Blockchain timestamp status
- ✅ Shareable QR code
- ✅ Security features checklist

## Testing

### Run All Tests

```bash
cd packages/hyperverge-php
../../vendor/bin/pest
```

### Run Specific Test Suite

```bash
# Unit tests
../../vendor/bin/pest tests/Actions/

# Integration tests
../../vendor/bin/pest tests/Integration/

# Specific test file
../../vendor/bin/pest tests/Actions/GenerateVerificationQRCodeTest.php
```

### Test Coverage

```bash
../../vendor/bin/pest --coverage
```

**Current Coverage**: 33 tests across 4 test files
- QR Generation: 4 tests
- QR Watermarking: 12 tests
- Certificate Generation: 6 tests
- Integration Workflows: 11 tests

## Troubleshooting

### QR Code Not Appearing

1. **Check if enabled**:
   ```php
   config('hyperverge.document_signing.qr_watermark.enabled')
   ```

2. **Verify QR generation**:
   ```php
   $qr = GenerateVerificationQRCode::run('https://example.com');
   dd(file_exists($qr['file_path']));
   ```

3. **Check PHP extensions**:
   ```bash
   php -m | grep -E "gd|imagick"
   ```

### Performance Issues

- QR generation: < 100ms (normal)
- PDF watermarking: < 2s (normal)
- If slower, check PDF size and page count
- Consider using queue for bulk operations

### QR Not Scannable

- Ensure QR size is at least 100px
- Check error correction level (use 'H' for best results)
- Verify URL is accessible from mobile devices
- Test with multiple QR scanner apps

## Documentation

Detailed documentation available in `docs/` directory:

- **QR_WATERMARK_IMPLEMENTATION.md** - Phase 1 implementation guide
- **CERTIFICATE_QR_INTEGRATION.md** - Phase 2 certificate features
- **COMPREHENSIVE_TESTING.md** - Phase 3 testing guide

## Requirements

- PHP 8.2+
- Laravel 11.0+ or 12.0+
- GD or Imagick extension
- Composer dependencies (auto-installed):
  - `endroid/qr-code` (QR generation)
  - `intervention/image` (Image manipulation)
  - `filippo-toso/pdf-watermarker` (PDF watermarking)
  - `spatie/laravel-data` (Type-safe DTOs)
  - `lorisleiva/laravel-actions` (Action pattern)

## License

MIT
