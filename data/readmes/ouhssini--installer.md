# Laravel Envato Installer Wizard

[![Latest Version on Packagist](https://img.shields.io/packagist/v/softcortex/magic-installer.svg?style=flat-square)](https://packagist.org/packages/softcortex/magic-installer)
[![Total Downloads](https://img.shields.io/packagist/dt/softcortex/magic-installer.svg?style=flat-square)](https://packagist.org/packages/softcortex/magic-installer)
[![License](https://img.shields.io/packagist/l/softcortex/magic-installer.svg?style=flat-square)](https://packagist.org/packages/softcortex/magic-installer)

A professional WordPress-like installer wizard for Laravel 11+ applications with built-in Envato purchase code verification. Perfect for CodeCanyon products and commercial Laravel applications.

## ✨ Features

- 🎨 **Beautiful UI** - Clean, modern interface with TailwindCSS
- 🔐 **Envato Integration** - Real Envato API v3 purchase code verification with dev mode
- ✅ **Requirements Check** - Automatic PHP version, extensions, and permissions validation
- 🗄️ **Database Setup** - Interactive database configuration with real-time connection testing
- 🔄 **Auto Migration** - Automatic database migration during installation
- 👤 **Admin Creation** - Secure admin account setup with smart role assignment (supports Spatie Permission)
- 🔒 **Security First** - Stateless forms, secure session handling, password hashing
- 🚀 **One-Click Install** - Complete installation in 7 steps
- 🔓 **Recovery Command** - Unlock installer if needed
- 🧪 **Property Testing** - 39,000+ assertions with property-based tests
- 🔧 **Step Validation** - Prevents accessing steps out of order
- 💾 **File-First Storage** - Works before database setup

## 📋 Requirements

- PHP 8.2 or higher
- Laravel 11 or 12
- Composer
- Writable `storage/app` directory
- MySQL/PostgreSQL/SQLite database

## 📦 Installation

Install the package via Composer:

```bash
composer require softcortex/magic-installer
```

> **Note**: The installer uses file-based storage (`storage/app/.installed` and `storage/app/installer-settings.json`) and does NOT require database setup before running. This means it works immediately after `composer require` without any database configuration.

### Publish Assets (Recommended Before Installation)

**For developers distributing this as part of their product:**

1. **Publish the `.env.example` file** (includes pre-configured Envato settings):

```bash
php artisan vendor:publish --tag="installer-env"
```

2. **Edit the published `.env.example`** in your project root and add your Envato credentials:

```env
LICENSE_ENABLED=true
LICENSE_DEV_MODE=false
ENVATO_PERSONAL_TOKEN=your-token-here
ENVATO_ITEM_ID=12345678
```

3. The installer will use **your customized `.env.example`** as the template when creating `.env` during installation.

> **Why publish `.env.example`?** The installer prioritizes the project's `.env.example` over the package's version. This allows you to pre-configure Envato tokens and other settings for your end users.

**Optional: Publish other assets**

Publish the configuration file:

```bash
php artisan vendor:publish --tag="installer-config"
```

Optionally, publish the views for customization:

```bash
php artisan vendor:publish --tag="installer-views"
```

Optionally, publish the settings table migration (if you want to customize it before installation):

```bash
php artisan vendor:publish --tag="installer-migrations"
```

> **Note**: Publishing the migration is optional. The installer automatically creates the `settings` table during Step 4 (Database configuration) using Laravel's Schema builder.

**Or publish everything at once:**

```bash
php artisan vendor:publish --provider="SoftCortex\Installer\InstallerServiceProvider"
```

## ⚙️ Configuration

### Storage

The installer uses file-based storage to avoid database dependency issues:

- **Installation Status**: `storage/app/.installed`
- **Settings**: `storage/app/installer-settings.json`

This approach ensures the installer works before database configuration, eliminating the chicken-and-egg problem.

### 1. Envato Personal Token Setup

To enable Envato purchase code verification:

1. Visit [https://build.envato.com/create-token/](https://build.envato.com/create-token/)
2. Create a token with these permissions:
   - ✅ View and search Envato sites
   - ✅ View the user's account username
3. Add to your `.env` file:

```env
LICENSE_ENABLED=true
LICENSE_DEV_MODE=false
ENVATO_PERSONAL_TOKEN=your-personal-token-here
ENVATO_ITEM_ID=12345678  # Optional: Your CodeCanyon item ID
```

#### Development Mode

For development/testing without real Envato API calls:

```env
LICENSE_ENABLED=true
LICENSE_DEV_MODE=true
```

Then use the test purchase code: `dev-test-code-12345678-1234`

#### Skip License Step

To completely skip license verification:

```env
LICENSE_ENABLED=false
```

### 2. Middleware Setup

The installer automatically registers:

1. **Custom `installer` middleware group** (no EncryptCookies/StartSession) - Allows installation before `APP_KEY` exists
2. **Global `EnsureInstalled` middleware** - Redirects all routes to `/install` until installation completes

**Key Architecture:**
- Installer routes use custom middleware without session/cookie encryption
- All forms are stateless (no CSRF tokens, no `old()` helpers)
- Database drivers (session, cache, queue) switch to `database` automatically after installation

No manual middleware configuration required - works out of the box!

### 3. Configuration Options

Customize `config/installer.php`:

```php
return [
    'product' => [
        'name' => env('APP_NAME', 'Laravel Application'),
        'version' => '1.0.0',
    ],
    
    'requirements' => [
        'php' => '8.2',
        'extensions' => ['pdo', 'openssl', 'mbstring', 'tokenizer', 'xml', 'ctype', 'json', 'bcmath'],
        'directories' => ['storage/framework', 'storage/logs', 'bootstrap/cache'],
    ],
    
    'license' => [
        'enabled' => env('LICENSE_ENABLED', true),
        'dev_mode' => env('LICENSE_DEV_MODE', false),
        'envato_personal_token' => env('ENVATO_PERSONAL_TOKEN', ''),
        'envato_item_id' => env('ENVATO_ITEM_ID', null),
    ],
    
    'admin' => [
        'role' => 'admin',
        'create_role_if_missing' => true,
    ],
    
    'routes' => [
        'prefix' => 'install',
        'middleware' => 'installer',  // Custom middleware group
        'redirect_after_install' => 'dashboard',
    ],
];
```

## 🚀 Usage

### Installation Wizard

1. Navigate to `/install` in your browser
2. Follow the 7-step wizard:
   - **Step 1: Welcome** - Introduction and getting started
   - **Step 2: App Config** - Set application name, URL, timezone, locale (creates `.env` + `APP_KEY`)
   - **Step 3: Requirements** - PHP version, extensions, directory permissions check
   - **Step 4: Database** - Database configuration, connection test, **runs migrations**
   - **Step 5: License** - Purchase code verification (optional, can be disabled)
   - **Step 6: Admin** - Create administrator account with role assignment
   - **Step 7: Finalize** - Switch to database drivers, sync data, lock installer

**Step Validation:**
- Each step validates that previous steps are completed
- Attempting to access `/install/admin` before database setup redirects to `/install/database`
- Ensures proper installation sequence and prevents errors

### Real-Time Validation

- **Database Test Connection** - Verify credentials before saving
- **License Verification** - Validate purchase code against Envato API before continuing
- **Requirements Check** - Live status of PHP version, extensions, and permissions

### Purchase Code Format

Envato purchase codes must be in UUID format:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

The installer:
- ✅ Validates against Envato API in real-time
- ✅ Stores only SHA-256 hash (never the actual code)
- ✅ Retrieves license info: item name, buyer, dates, support expiry

### Unlock Installer

Re-run the installer if needed:

```bash
php artisan installer:unlock
```

Force unlock without confirmation:

```bash
php artisan installer:unlock --force
```

## 🎨 Customization

### Views

Publish and modify views:

```bash
php artisan vendor:publish --tag="installer-views"
```

Views location: `resources/views/vendor/installer/`

### Routes

Change the installer URL prefix in `config/installer.php`:

```php
'routes' => [
    'prefix' => 'setup',  // URL becomes /setup
],
```

### Styling

The installer uses TailwindCSS. Customize by:
1. Publishing views
2. Modifying Tailwind classes
3. Adding custom CSS to the layout

## 🔒 Security

### Best Practices

- ✅ Always use HTTPS in production
- ✅ Keep Envato Personal Token secure (never commit to Git)
- ✅ Use strong admin passwords
- ✅ Run `installer:unlock` only when necessary

### Data Storage

**File-based storage:**
- ✅ Installation status in `storage/app/.installed`
- ✅ Settings in `storage/app/installer-settings.json`
- ✅ SHA-256 hash of purchase code
- ✅ License metadata (item name, buyer, dates)

**Never stored:**
- ❌ Envato Personal Token
- ❌ Plain text purchase codes

## 🏗️ Architecture

### Stateless Forms

The installer uses **stateless forms** before `APP_KEY` generation:
- No CSRF tokens on installer routes
- No `old()` helpers or `$errors` variables
- Controllers return views directly with error messages
- Form values preserved via explicit `$credentials` or `$formData` variables

### File-First Storage

Installation state stored in files, **not database**:
- `storage/app/.installed` - Installation lock file
- `storage/app/installer-settings.json` - Step progress and settings
- Database sync happens in Step 7 (Finalize) to `settings` table

**Why?** Avoids chicken-and-egg problem - installer must work before database exists!

### Migration Timing

**Migrations run in Step 4 (Database)**, not Step 7:
- Creates `settings` table with `category` and `changeable` columns
- Creates `users` table before Step 6 (Admin creation)
- Uses Laravel Schema builder for database-agnostic compatibility

### Smart Admin Role Assignment

Automatically detects and assigns admin role:
1. Checks for `role` or `roles` column in `users` table
2. Detects Spatie Permission package (`HasRoles` trait)
3. Creates role if missing (when `create_role_if_missing=true`)
4. Assigns appropriate role to admin user

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MissingAppKeyException" | Normal on first access - installer creates `.env` and generates `APP_KEY` in Step 2 |
| "Envato Personal Token not configured" | Add `ENVATO_PERSONAL_TOKEN` to `.env` or set `LICENSE_ENABLED=false` |
| "Invalid purchase code format" | Use UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| "License verification failed: 401" | Token expired - create new one at [build.envato.com](https://build.envato.com/create-token/) |
| "Purchase code not found" | Verify code is correct in Envato or enable dev mode |
| Database connection failed | Check credentials, server status, firewall, ensure database exists |
| "Table 'users' doesn't exist" | Migrations run in Step 4 - ensure you complete database step before admin creation |
| Permission errors | Ensure `storage/app` directory is writable: `chmod -R 775 storage` |
| Form inputs lost after error | Fixed in v1.2.0+ - forms now preserve values on validation failure |
| Can't access step out of order | By design - each step validates previous steps are completed |
| Step validation not working | Clear browser cache, ensure you're not bypassing middleware |

## 🧪 Testing

Run the test suite:

```bash
composer test
```

Run specific test types:

```bash
vendor/bin/pest --group=property  # Property-based tests
vendor/bin/pest --group=unit      # Unit tests
```

## 📚 API Reference

### LicenseService

```php
use SoftCortex\Installer\Services\LicenseService;

$service = app(LicenseService::class);
$result = $service->verify('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

if ($result->isValid()) {
    echo $result->itemName;
    echo $result->buyerName;
    echo $result->licenseType; // 'regular' or 'extended'
}
```

### InstallerService

```php
use SoftCortex\Installer\Services\InstallerService;

$installer = app(InstallerService::class);

if ($installer->isInstalled()) {
    // App is installed
}

$installer->setSetting('key', 'value');
$value = $installer->getSetting('key', 'default');
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for recent changes.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 🔐 Security

Report security vulnerabilities via [our security policy](../../security/policy).

## 👥 Credits

- [Ouhssini](https://github.com/ouhssini)
- [All Contributors](../../contributors)

## 📄 License

MIT License. See [LICENSE.md](LICENSE.md) for details.
