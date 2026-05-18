# 🛡️ Privata

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrfrkayvaz/privata.svg?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/privata)
[![License](https://img.shields.io/packagist/l/mrfrkayvaz/privata?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/privata)
[![Total Downloads](https://img.shields.io/packagist/dt/mrfrkayvaz/privata?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/privata)
![GitHub stars](https://img.shields.io/github/stars/mrfrkayvaz/privata?style=flat-square)

A comprehensive Laravel package that provides tools for masking, anonymizing, and managing personal data to help with privacy compliance. Privata offers automatic encryption, data masking, and secure storage capabilities for sensitive information.

## Features

- 🔐 **Automatic Encryption**: Seamlessly encrypt sensitive data using AES encryption
- 🎭 **Data Masking**: Built-in masking for emails, phones, names, and custom data types
- 🛡️ **Privacy Compliance**: Help meet GDPR, CCPA, and other privacy regulations
- 🔧 **Flexible Configuration**: Customizable encryption drivers and masking rules
- 📊 **Eloquent Integration**: Easy-to-use trait for Laravel models
- 🧪 **Well Tested**: Comprehensive test suite with Pest PHP

## Installation

You can install the package via Composer:

```bash
composer require mrfrkayvaz/privata
```

### Laravel Auto-Discovery

The package will automatically register itself with Laravel 5.5+.

### Manual Registration

If you're using an older version of Laravel, add the service provider to your `config/app.php`:

```php
'providers' => [
    // ...
    Privata\PrivataServiceProvider::class,
],
```

And add the facade alias:

```php
'aliases' => [
    // ...
    'Privata' => Privata\Facades\Privata::class,
],
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Privata\PrivataServiceProvider" --tag="privata-config"
```

### Environment Variables

Add these variables to your `.env` file:

```env
PRIVATA_ENCRYPTION_DRIVER=aes
PRIVATA_ENCRYPTION_KEY=your-32-character-secret-key-here
PRIVATA_ENCRYPTION_CIPHER=aes-256-cbc
```

### Generate Encryption Key

You can generate a secure encryption key using:

```bash
php artisan tinker
>>> base64_encode(random_bytes(32))
```

## Usage

### Basic Encryption/Decryption

```php
use Privata\Facades\Privata;

// Encrypt data
$encrypted = Privata::encrypt('sensitive data');

// Decrypt data
$decrypted = Privata::decrypt($encrypted);
```

### Model Integration

Use the `Encryptable` trait in your Eloquent models:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Privata\Traits\Encryptable;
use Privata\Masks\EmailMask;
use Privata\Masks\PhoneMask;

class User extends Model
{
    use Encryptable;

    protected $fillable = ['name', 'email', 'phone'];

    protected function encrypted(): array
    {
        return ['email', 'phone'];
    }

    protected function encryptionMasks(): array
    {
        return [
            'email' => EmailMask::class,
            'phone' => PhoneMask::class,
        ];
    }
}
```

### Database Migration

Create the necessary database columns:

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    
    // Encrypted fields
    $table->text('email_encrypted')->nullable();
    $table->timestamp('email_encrypted_at')->nullable();
    
    $table->text('phone_encrypted')->nullable();
    $table->timestamp('phone_encrypted_at')->nullable();
    
    $table->timestamps();
});
```

### Working with Encrypted Models

```php
// Create a user with encrypted data
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'phone' => '+1234567890'
]);

// The email and phone are automatically encrypted and stored
// Access the decrypted values
echo $user->email; // john@example.com
echo $user->phone; // +1234567890

// Access masked values
echo $user->email_masked; // j*******@e*******.com
echo $user->phone_masked; // +1*******90
```

### Conditional Decryption

Control when data can be decrypted:

```php
class User extends Model
{
    use Encryptable;

    protected function canDecrypt(): bool
    {
        // Only decrypt for authenticated users
        return auth()->check();
    }
}
```

## Built-in Masks

### Email Mask

```php
use Privata\Masks\EmailMask;

$masked = EmailMask::mask('john@example.com');
// Result: j*******@e*******.com
```

### Phone Mask

```php
use Privata\Masks\PhoneMask;

$masked = PhoneMask::mask('+1234567890');
// Result: +1*******90
```

### String Mask

```php
use Privata\Masks\StringMask;

$masked = StringMask::mask('sensitive data');
// Result: se**********
```

## Custom Masks

Create your own masking classes:

```php
<?php

namespace App\Masks;

use Privata\Contracts\Mask;

class CustomMask implements Mask
{
    public static function mask(string $data, string $maskingCharacter = '*'): string
    {
        // Your custom masking logic
        return substr($data, 0, 2) . str_repeat($maskingCharacter, strlen($data) - 2);
    }
}
```

## Configuration Options

### Encryption Settings

```php
// config/privata.php
'encryption' => [
    'driver' => 'aes',
    'masking_character' => '*',
],

'drivers' => [
    'aes' => [
        'key' => env('PRIVATA_ENCRYPTION_KEY'),
        'cipher' => env('PRIVATA_ENCRYPTION_CIPHER', 'aes-256-cbc'),
    ]
],

'database' => [
    'encrypted_data_suffix' => '_encrypted',
    'encrypted_timestamp_suffix' => '_encrypted_at',
    'encrypted_masked_suffix' => '_masked',
    'add_masked_value' => true,
],
```

## Security Considerations

- **Key Management**: Store your encryption key securely and never commit it to version control
- **Key Rotation**: Plan for key rotation if required by your compliance needs
- **Access Control**: Use the `canDecrypt()` method to control when data can be decrypted
- **Backup Strategy**: Ensure encrypted data is included in your backup strategy

## Testing

The package includes a comprehensive test suite. Run tests using:

```bash
composer test
```

## Requirements

- PHP 8.2+
- Laravel 12.0+
- OpenSSL extension

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

If you find this package useful, please consider starring it on GitHub. For issues and feature requests, please use the [GitHub issue tracker](https://github.com/mrfrkayvaz/privata/issues).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

**Made with ❤️ for the Laravel community**
