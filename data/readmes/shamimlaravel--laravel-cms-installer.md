# Laravel CMS Installer Package

A self-contained Laravel 11+ CMS auto-installer package with multi-step web wizard, license validation, and frontend-agnostic UI.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Installation Wizard Steps](#installation-wizard-steps)
- [Artisan Commands](#artisan-commands)
- [Events](#events)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

### Multi-Step Installation Wizard
- **8-Step Interactive Process**: Guided setup from license validation to final configuration
- **Real-time Validation**: Instant feedback on requirements, permissions, and database connections
- **Frontend-Agnostic**: Automatically detects and adapts to your frontend stack (Blade, Livewire, Vue, React, Next.js, etc.)

### Enterprise-Grade Features
- **License Validation**: Remote license verification with API integration
- **Environment Management**: Automatic `.env` file configuration
- **Database Setup**: Support for MySQL, PostgreSQL, SQLite, and SQL Server
- **Migration & Seeding**: Automated database migrations and seeder execution
- **Admin Account Creation**: Built-in admin user setup with role support (Spatie permission compatible)
- **Logging System**: Dedicated installer logging channel for troubleshooting

### Developer-Friendly
- **Artisan Commands**: CLI tools for installation management
- **Event System**: Dispatch events for customization and extensibility
- **Service Contracts**: Clean interfaces for easy testing and mocking
- **Publishable Assets**: Customize views, config, and assets

## 📦 Requirements

### Server Requirements
- **PHP**: >= 8.2
- **Laravel**: 11.x or 12.x
- **Database**: MySQL, PostgreSQL, SQLite, or SQL Server
- **Extensions**: PDO, OpenSSL, JSON, MBstring

### Required PHP Extensions
- `pdo` - Database abstraction layer
- `openssl` - Encryption and security
- `json` - Data interchange
- `mbstring` - Multibyte string handling
- `fileinfo` - File type detection
- `tokenizer` - Code tokenization

## 🔧 Installation

### Step 1: Install via Composer

```bash
composer require shamimstack/laravel-cms-installer
```

### Step 2: Service Provider Registration (Laravel 10 and below)

For Laravel 11+, package discovery is automatic. For older versions, add to `config/app.php`:

```php
'providers' => [
    // ...
    shamimstack\Installer\InstallerServiceProvider::class,
],
```

### Step 3: Publish Assets (Optional)

```bash
# Publish all assets
php artisan vendor:publish --tag=cms-installer

# Publish only config
php artisan vendor:publish --tag=config

# Publish only views
php artisan vendor:publish --tag=views

# Publish only CSS and JS
php artisan vendor:publish --tag=assets
```

### Step 4: Access the Installer

Once installed, navigate to your application URL. If the application is not installed, you'll be automatically redirected to `/install`.

Or directly visit: `http://your-domain.com/install`

## ⚙️ Configuration

### Configuration File

After publishing the config file (`cms-installer.php`), you can customize the following options:

#### License Configuration
```php
'license' => [
    'api_url' => env('LICENSE_API_URL', 'https://api.yourservice.com/validate'),
    'api_key' => env('LICENSE_API_KEY', ''),
    'enabled' => env('LICENSE_ENABLED', true),
    'token_path' => storage_path('app/.license'),
],
```

#### Database Settings
```php
'database' => [
    'supported_drivers' => ['mysql', 'pgsql', 'sqlite', 'sqlsrv'],
    'default_driver' => 'mysql',
],
```

#### Admin User Configuration
```php
'admin' => [
    'model' => App\Models\User::class,
    'role_system' => 'spatie', // or 'column'
    'admin_role_name' => 'admin',
    'role_column' => 'role',
    'admin_email_default' => 'admin@example.com',
],
```

#### Permissions
```php
'permissions' => [
    'directories' => [
        'storage' => 'writable',
        'bootstrap/cache' => 'writable',
        'public' => 'writable',
    ],
],
```

#### Logging
```php
'logging' => [
    'channel' => 'installer',
    'retention_days' => 7,
],
```

## 📖 Usage

### Web Interface

The installer provides a beautiful, step-by-step web interface:

1. **Welcome Screen** - Accept license terms
2. **Requirements Check** - Server and PHP extension verification
3. **Permissions Check** - Directory and file permissions
4. **Database Configuration** - Connection setup and testing
5. **Migration & Seeding** - Database schema and data
6. **Admin Account** - Create administrator credentials
7. **Application Settings** - Site name, URL, timezone
8. **Completion** - Installation summary and access details

### Manual Installation Flow

If you prefer manual control:

```php
// In your service provider or bootstrap file
use shamimstack\Installer\Services\DatabaseManager;
use shamimstack\Installer\Services\AdminManager;

$database = app(DatabaseManager::class);
$admin = app(AdminManager::class);

// Configure database
$database->update([
    'DB_CONNECTION' => 'mysql',
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_DATABASE' => 'your_db',
    'DB_USERNAME' => 'root',
    'DB_PASSWORD' => 'password',
]);

// Run migrations
$database->runMigrations();

// Create admin
$admin->create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
]);
```

## 🎯 Installation Wizard Steps

### Step 1: Welcome / License
- Review license terms
- Enter license key and API key
- Validate credentials remotely

### Step 2: Requirements
- PHP version check (>= 8.2)
- Required extensions verification
- Laravel version compatibility

### Step 3: Permissions
- Storage directory writability
- Bootstrap/cache permissions
- Public directory access

### Step 4: Database
- Select database driver
- Enter connection details
- Test connection in real-time
- Save configuration to .env

### Step 5: Migration & Seeding
- Run database migrations
- Execute seeders
- View migration output
- Error handling and rollback info

### Step 6: Admin Account
- Choose admin creation method
- Enter administrator details
- Configure roles (if using Spatie)
- Email verification setup

### Step 7: Application Settings
- Application name
- Base URL
- Default timezone
- Locale settings
- Debug mode toggle

### Step 8: Complete
- Installation summary
- Created resources overview
- Login credentials reminder
- Next steps and recommendations

## 🛠️ Artisan Commands

### installer:status
Display current installation state, frontend stack, and license status.

```bash
php artisan installer:status
```

**Output includes:**
- Installation status (installed/not installed)
- Environment information
- Frontend stack detection
- License validation status
- Metadata (installation date, versions, etc.)

### installer:reset
Reset the installation process by removing the lock file.

```bash
# Safe reset (asks for confirmation in production)
php artisan installer:reset

# Force reset (no confirmation)
php artisan installer:reset --force
```

**Use cases:**
- Re-running the installer
- Development environment resets
- Troubleshooting installation issues

## 📡 Events

The package dispatches events throughout the installation process for extensibility:

### Available Events

| Event | Description |
|-------|-------------|
| `InstallerStarted` | Installation wizard begins |
| `LicenseValidated` | License successfully validated |
| `DatabaseConfigured` | Database connection configured |
| `MigrationsCompleted` | All migrations executed |
| `SeedingCompleted` | Database seeding finished |
| `AdminCreated` | Admin account created |
| `InstallationCompleted` | Full installation complete |

### Listening to Events

Register event listeners in your `EventServiceProvider`:

```php
use shamimstack\Installer\Events\InstallationCompleted;

protected $listen = [
    InstallationCompleted::class => [
        'App\Listeners\SendInstallationNotification',
    ],
];
```

### Example Listener

```php
namespace App\Listeners;

use shamimstack\Installer\Events\InstallationCompleted;

class SendInstallationNotification
{
    public function handle(InstallationCompleted $event): void
    {
        // Send email notification
        // Log to external monitoring
        // Trigger webhook
        // etc.
    }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Directory Not Writable" Error
**Solution:** Ensure proper permissions:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 2. Database Connection Failed
**Solutions:**
- Verify database credentials
- Check database server is running
- Ensure database exists (or has CREATE privileges)
- Check firewall rules for remote connections

#### 3. License Validation Fails
**Solutions:**
- Verify API key is correct
- Check server can reach license API endpoint
- Ensure SSL certificates are up to date
- Review `storage/logs/installer.log` for details

#### 4. Migration Errors
**Solutions:**
- Check database connection
- Verify migrations exist and are valid
- Increase PHP memory limit if needed
- Review database user privileges

#### 5. Frontend Detection Issues
**Solutions:**
- Ensure `composer.json` and `package.json` are present
- Check that frontend dependencies are installed
- Review detected stack in `installer:status` command

### Log Files

The installer maintains detailed logs:
- **Location:** `storage/logs/installer.log`
- **Retention:** Configurable (default: 7 days)
- **Level:** Debug (captures all operations)

View logs in real-time:
```bash
tail -f storage/logs/installer.log
```

### Getting Help

If you encounter issues:

1. Check the log file: `storage/logs/installer.log`
2. Run status command: `php artisan installer:status`
3. Review requirements documentation
4. Contact support with:
   - Log file contents
   - PHP version (`php -v`)
   - Laravel version (`php artisan --version`)
   - Database type and version
   - Error messages and screenshots

## 📝 License

This package is proprietary software licensed under the terms agreed upon during purchase.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- Laravel framework and community
- All contributors and testers
- Our amazing users providing feedback

## 📞 Support

For support and questions:
- **Documentation:** https://docs.shamimstack.com/installer
- **Email:** support@shamimstack.com
- **GitHub Issues:** https://github.com/shamimstack/laravel-cms-installer/issues

---

**Made with ❤️ by ShamimStack**
