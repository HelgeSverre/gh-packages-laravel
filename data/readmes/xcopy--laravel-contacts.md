# Laravel Contacts

[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/xcopy/laravel-contacts/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/xcopy/laravel-contacts/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/xcopy/laravel-contacts/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/xcopy/laravel-contacts/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/xcopy/laravel-contacts.svg?style=flat-square)](https://packagist.org/packages/xcopy/laravel-contacts)

A simple Laravel package for managing polymorphic contact information (phone, email, mobile, WhatsApp, Telegram, website, etc.) for any Eloquent model.
Perfect for multi-tenant SaaS applications, CRMs, or property management systems where multiple entities need contact details.

## Features

- **Polymorphic relationships**: Attach contacts to any Eloquent model
- **Multiple contact types**: Phone, Email, WhatsApp, Telegram, Website, and Other
- **Smart value handling**: Automatic validation and normalization via strategy pattern
- **Primary & verified flags**: Mark contacts as primary or verified
- **Unique constraints**: Prevents duplicate contacts per model
- **Type-safe**: Uses PHP 8.1+ enums and strict typing

## Installation

```
composer require xcopy/laravel-contacts:dev-main
```

Run the installation commands:

```bash
php artisan vendor:publish --provider="Jenishev\Laravel\Contacts\ContactsServiceProvider" --tag=config
php artisan vendor:publish --provider="Jenishev\Laravel\Contacts\ContactsServiceProvider" --tag=migrations
php artisan migrate
```

## Usage

### 1. Add the trait to your model

Add the `HasContacts` trait to any model that needs contact information:

```php
use Illuminate\Database\Eloquent\Model;
use Jenishev\Laravel\Contacts\Concerns\HasContacts;

class Company extends Model
{
    use HasContacts;
    
    // ... your model code
}
```

### 2. Create contacts

```php
use Jenishev\Laravel\Contacts\Enums\ContactTypeEnum;

$company = Company::find(1);

// Create a primary email contact
$company->contacts()->create([
    'type' => ContactTypeEnum::Email,
    'value' => 'info@company.com',
    'is_primary' => true,
    'is_verified' => true,
]);

// Create a phone contact
$company->contacts()->create([
    'type' => ContactTypeEnum::Phone,
    'value' => '+1234567890',
    'is_primary' => false,
]);

// Create a WhatsApp contact
$company->contacts()->create([
    'type' => ContactTypeEnum::Whatsapp,
    'value' => '+1234567890',
]);
```

### 3. Retrieve contacts

```php
// Get all contacts
$contacts = $company->contacts;

// Get contacts of a specific type
$emails = $company->contacts()->where('type', ContactTypeEnum::Email)->get();

// Get primary contact
$primaryContact = $company->contacts()->where('is_primary', true)->first();

// Get verified contacts
$verified = $company->contacts()->where('is_verified', true)->get();
```

### 4. Value validation & normalization

Contact values are automatically validated and normalized based on their type:

```php
// Email: lowercased and validated
$company->contacts()->create([
    'type' => ContactTypeEnum::Email,
    'value' => 'User@Example.COM', // stored as: user@example.com
]);

// Phone: formatted to E.164
$company->contacts()->create([
    'type' => ContactTypeEnum::Phone,
    'value' => '0555123456', // stored as: +996555123456
    'country_code' => 'KG',  // optional, defaults to config
]);

// Telegram: normalized username
$company->contacts()->create([
    'type' => ContactTypeEnum::Telegram,
    'value' => '@UserName', // stored as: username, retrieved as: @username
]);

// Website: normalized URL
$company->contacts()->create([
    'type' => ContactTypeEnum::Website,
    'value' => 'example.com', // stored as: https://example.com
]);

// WhatsApp: formatted to E.164
$company->contacts()->create([
    'type' => ContactTypeEnum::Whatsapp,
    'value' => '0555123456', // stored as: +996555123456
    'country_code' => 'KG',
]);
```

**Validation rules:**
- **Email**: Valid email format, lowercased
- **Phone**: Valid phone number for country, formatted per config (default: NATIONAL)
- **WhatsApp**: Valid phone number for country, E.164 format
- **Telegram**: 5–32 chars, alphanumeric and underscore, no consecutive/leading/trailing underscores
- **Website**: Valid URL, auto-adds `https://` if missing
- **Other**: No validation, stored as-is

### 5. Phone number formatting

Phone numbers support configurable formatting via `config/contacts.php`:

```php
// Available formats: E164, INTERNATIONAL, NATIONAL, RFC3966
// See: \libphonenumber\PhoneNumberFormat constants

'phone_format_set' => \libphonenumber\PhoneNumberFormat::NATIONAL,  // Storage format
'phone_format_get' => \libphonenumber\PhoneNumberFormat::NATIONAL,  // Retrieval format
```

**Format examples:**
- **E164**: `+996555123456`
- **INTERNATIONAL**: `+996 555 123 456`
- **NATIONAL**: `0555 123 456` (default)
- **RFC3966**: `tel:+996-555-123456`

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
