# Laravel Installer Package

A WordPress-like installer package for Laravel applications that provides a smooth, multi-step installation process.

## Requirements

- **PHP**: 7.4, 8.0, 8.1, 8.2, 8.3, or 8.4
- **Laravel**: 8.x, 9.x, 10.x, 11.x, or 12.x
- **Extensions**: PDO, cURL, OpenSSL, JSON, Mbstring

## Features

- **Multi-step Installation Process**: Guided installation similar to WordPress
- **System Requirements Check**: Validates PHP version, extensions, and folder permissions
- **License Verification**: API-based license validation system
- **Database Setup**: Automated database configuration and SQL import
- **Security Features**: Installation lock, CSRF protection, and secure API communication
- **Wide Compatibility**: Supports PHP 7.4 through 8.4 and Laravel 8 through 12

## Quick Start

```bash
composer require codelone/codec-web-installer
```

```env
INSTALLER_LICENSE_API_URL=https://api.brainandbolt.com/api/verify-license
INSTALLER_PRODUCT_ID=1
INSTALLER_VERIFY_SSL=true
```

Visit `/installer` in your browser and follow the steps.

## Installation

### 1. Require the package

```bash
composer require codelone/codec-web-installer
```

Laravel auto-discovers the service provider (no manual registration needed).

### 2. Publish configuration (optional, recommended)

```bash
php artisan vendor:publish --tag=installer-config
```

### 3. (Optional) Publish views for customization

```bash
php artisan vendor:publish --tag=installer-views
```

### 4. Configure environment variables

Add or update these in your `.env` file:

```env
INSTALLER_LICENSE_API_URL=https://api.brainandbolt.com/api/verify-license
INSTALLER_PRODUCT_ID=1
INSTALLER_VERIFY_SSL=true
```

Note: the service provider will append these variables to `.env` if they are missing, using the defaults in `config/installer.php`.

### 5. Clear cached routes (only if you cache routes)

```bash
php artisan route:clear
```

## Usage

### 1. Access the Installer

Visit `/installer` in your browser to start the installation process (or the custom prefix set in `config/installer.php`).

### 2. Installation Steps

1. **Welcome Page**: Introduction and overview
2. **System Requirements**: Check PHP version, extensions, and permissions
3. **License Verification**: Enter license key and email for validation
4. **Database Setup**: Configure database connection and import data
5. **Completion**: Installation summary and next steps

### 3. API Endpoint

Your server should provide this API endpoint (update the URL above to match your server if you are not using the default):

#### License Verification Endpoint
```
POST /api/verify-license
Content-Type: application/json

{
    "license_key": "DYTIOHVHHABDQVOH",
    "product_id": 1
}

Success Response:
{
    "success": true,
    "message": "License verified successfully",
    "product_id": 1,
    "license_id": 123,
    "product_data": "SQL content for installation",
    "product_name": "Test Website",
    "product_version": "1.0.0",
    "allowed_domains": 3,
    "license_status": "active",
    "expires_at": "2025-01-12 10:30:00"
}

Error Response:
{
    "success": false,
    "message": "Invalid license key"
}
```

**Note:** The `product_data` field contains the SQL content that will be imported into the database during installation.

## Configuration Options

### System Requirements

Customize requirements in `config/installer.php`:

```php
'requirements' => [
    'php' => '8.2.0',
    'extensions' => [
        'PDO', 'cURL', 'OpenSSL', 'BCMath', 'Ctype',
        'Fileinfo', 'JSON', 'Mbstring', 'Tokenizer', 'XML', 'ZIP'
    ],
    'folders' => [
        'storage/app/' => '775',
        'storage/framework/' => '775',
        'storage/logs/' => '775',
        'bootstrap/cache/' => '775',
    ],
],
```

### Customization

Publish views for customization:

```bash
php artisan vendor:publish --tag=installer-views
```

## Security

- Installation is locked after completion via a lock file
- Routes are protected by middleware
- All forms include CSRF protection
- Database credentials are validated before use
- API communication uses secure HTTPS

## License Lock

After successful installation, a lock file is created at `storage/installer.lock`. To reinstall:

1. Delete the lock file
2. Clear browser cache
3. Visit `/installer` again

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email security@yourvendor.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

