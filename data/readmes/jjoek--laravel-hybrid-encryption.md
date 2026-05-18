# Laravel Hybrid Encryption

A Laravel package for hybrid encryption using RSA-OAEP + AES-256-GCM for secure API request handling.

## Features

- **Hybrid Encryption**: Combines RSA-OAEP for key exchange with AES-256-GCM for data encryption
- **Automatic Request Decryption**: Middleware automatically decrypts encrypted requests
- **Public Key Endpoint**: Built-in endpoint to expose your public key to frontend clients
- **Secure by Default**: Uses industry-standard encryption algorithms

## Installation


### From Packagist

```bash
composer require jjoek/laravel-hybrid-encryption
```

## Configuration

### 1. Generate RSA Key Pair

```bash
# Generate private key (2048 or 4096 bits)
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

### 2. Add Keys to Environment

Add to your `.env` file (replace newlines with `\n`):

```env
ENCRYPTION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----"
ENCRYPTION_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
```

**Tip**: Use this command to format your key for `.env`:

```bash
cat private_key.pem | tr '\n' '\\' | sed 's/\\/\\n/g'
```

### 3. Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=hybrid-encryption-config
```

## Usage

### Public Key Endpoint

The package automatically registers a public key endpoint:

```
GET /api/v1/public-key
```

Response:
```json
{
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "algorithm": "RSA-OAEP+AES-GCM-256",
    "keyFormat": "PEM"
}
```

### Decrypting Requests

Add the middleware to routes that should accept encrypted requests:

```php
// routes/api.php
Route::post('/endpoint', ServiceController::class)
    ->middleware('decrypt.request');
```

### Expected Request Format

Frontend sends encrypted data with these headers:

```
X-Encrypted: true
X-Encryption-Algorithm: RSA-OAEP+AES-GCM-256
```

Request body:
```json
{
    "encryptedKey": "<base64-encoded RSA-encrypted AES key>",
    "encryptedData": "<base64-encoded AES-GCM encrypted JSON payload>",
    "iv": "<base64-encoded 12-byte IV>"
}
```

### Using the Facade

```php
use Jjoek\HybridEncryption\Facades\HybridEncryption;

// Get public key
$publicKey = HybridEncryption::getPublicKey();

// Check if encryption is configured
if (HybridEncryption::isConfigured()) {
    // Manually decrypt data
    $decrypted = HybridEncryption::decrypt($encryptedPayload);
}
```

## Configuration Options

```php
// config/hybrid-encryption.php

return [
    // RSA private key (PEM format)
    'private_key' => env('ENCRYPTION_PRIVATE_KEY'),

    // RSA public key (PEM format)
    'public_key' => env('ENCRYPTION_PUBLIC_KEY'),

    // Route configuration
    'route' => [
        'enabled' => true,           // Enable/disable the public key route
        'prefix' => 'api/v1',        // Route prefix
        'path' => 'public-key',      // Route path
        'middleware' => ['api'],     // Applied middleware
        'name' => 'hybrid-encryption.public-key',
    ],

    // Middleware alias name
    'middleware_alias' => 'decrypt.request',
];
```

## Frontend Implementation (JavaScript)

```javascript
async function encryptPayload(data, publicKeyPem) {
    // Import the public key
    const publicKey = await crypto.subtle.importKey(
        'spki',
        pemToArrayBuffer(publicKeyPem),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );

    // Generate random AES key and IV
    const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data with AES-GCM
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encodedData
    );

    // Encrypt the AES key with RSA-OAEP
    const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        rawAesKey
    );

    return {
        encryptedKey: arrayBufferToBase64(encryptedKey),
        encryptedData: arrayBufferToBase64(encryptedData),
        iv: arrayBufferToBase64(iv)
    };
}
```

## Security Considerations

- **Never expose the private key** - Keep it secure in environment variables or a secrets manager
- **Use HTTPS** - Always use TLS in production to protect the encrypted payload in transit
- **Key Rotation** - Implement a key rotation strategy for production environments
- **Key Size** - Use at least 2048-bit RSA keys; 4096-bit recommended for sensitive applications

## License

MIT License
