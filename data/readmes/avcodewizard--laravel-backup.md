# 📦 Laravel Backup Package

<p align="center">
<a href="https://packagist.org/packages/avcodewizard/laravel-backup"><img src="https://img.shields.io/packagist/dt/avcodewizard/laravel-backup" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/avcodewizard/laravel-backup"><img src="https://img.shields.io/packagist/v/avcodewizard/laravel-backup" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/avcodewizard/laravel-backup"><img src="https://img.shields.io/packagist/l/avcodewizard/laravel-backup" alt="License"></a>
</p>

A simple Laravel package to automatically **backup your database and storage directory** to multiple destinations (Local, Amazon S3, Google Drive), with a Blade-based UI to view, download, and delete backups.

---

## 🚀 Features

- 🔄 Daily backup of database and storage (`storage/app/public`)
- ☁️ **Multi-destination support**: Local, Amazon S3, Google Drive
- 🧼 Auto-delete backups older than configurable days (default 5 days)
- 🎯 Configurable cleanup scope: clean all destinations or local only
- 🧾 List, download, and delete backups from all destinations via Blade UI
- 👤 Access control using roles and middleware
- 🛠 Configurable via `config/laravelBackup.php`

---

## 📥 Installation

Install the package via composer:

```bash
composer require avcodewizard/laravel-backup
```
---

## ⚙️ Configuration

Edit the config file at: `config/laravelBackup.php`

```php
return [
    'destinations' => [
        'local' => [
            'enabled' => true,
            'path' => storage_path('backups'),
        ],
        's3' => [
            'enabled' => false,
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'bucket' => env('AWS_BUCKET'),
            'endpoint' => env('AWS_ENDPOINT'), // Optional: for MinIO, DO Spaces
            'path' => 'backups',
        ],
        'google_drive' => [
            'enabled' => false,
            // OAuth 2.0 credentials - get refresh token using: php artisan backup:google-auth
            'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
            'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
            'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'), // Optional: specific folder ID
            'path' => 'backups',
        ],
    ],
    'keep_days' => 5, // Automatically delete backups older than 5 days
    'cleanup_scope' => 'all', // 'all' = clean cloud + local, 'local' = clean local only
    'backup_storage_directory' => false, // true or false - storage backup only if s3 or google_drive enabled
    'check_access' => false, // Enable/disable role-based access to UI
    'allowed_roles' => [], // Role Names Example: ['Admin', 'Super-Admin','Developer', 'Manager']
];
```

### Backup Destinations

Enable one or more destinations:

- **Local**: Saves backups to local disk (`storage/backups/` by default)
- **S3**: Uploads backups to Amazon S3 (or compatible services like DigitalOcean Spaces, MinIO)
- **Google Drive**: Uploads backups to Google Drive

When multiple destinations are enabled, backups are saved to **all enabled destinations** simultaneously.

### Cleanup Scope

- `'all'`: Delete old backups from **all destinations** (local + cloud)
- `'local'`: Delete old backups from **local storage only** (cloud backups kept indefinitely)

### Storage Directory Backup

- When `backup_storage_directory` is `true` AND S3/Google Drive is enabled: Storage is backed up to **cloud only** (skips local to save disk space)
- When only local storage is enabled: Storage backup is skipped even if `backup_storage_directory` is true

---

## 🛡️ Access Control

To enable UI access control based on user roles:

1. Set `'check_access' => true`
2. Add roles in `'allowed_roles' => ['Admin']`
3. Ensure your `User` model has a `hasRole()` method (e.g., using [spatie/laravel-permission](https://github.com/spatie/laravel-permission))

Middleware used:  
`Avcodewizard\LaravelBackup\Http\Middleware\CheckLaravelBackupAccess`

---

## 🖥️ Web Interface

Access the UI at:

```
/laravel-backup
```

Example route setup (already included in the package):

```php
Route::prefix('laravel-backup')
    ->middleware(['web', \Avcodewizard\LaravelBackup\Http\Middleware\CheckLaravelBackupAccess::class])
    ->group(function () {
        Route::get('/', [BackupController::class, 'index'])->name('laravel-backup.index');
        Route::get('/create', [BackupController::class, 'create'])->name('laravel-backup.create');
        Route::get('/download', [BackupController::class, 'download'])->name('laravel-backup.download');
        Route::delete('/delete', [BackupController::class, 'delete'])->name('laravel-backup.delete');
    });
```

---

## 🛠 Usage

### Create Backup via Web

1. Go to `/laravel-backup`
2. Click **Create Backup**
- If use want to create backup from ui, make sure to run the queue worker:
```bash
php artisan queue:work
```


### Create Backup via Terminal

```bash
php artisan backup:run
```

---

## 🧹 Automatic Cleanup

Backups older than `keep_days` will be deleted automatically.

### Add to Scheduler

**Laravel 11+** (routes/console.php):
```php
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    Artisan::call('backup:run');
})->name('backup:run')->withoutOverlapping()->daily();
```

**Laravel 10 and below** (app/Console/Kernel.php):
```php
$schedule->command('backup:run')->daily();
```

---

## 📂 Backup Storage

Backups are saved to all **enabled destinations**:

### Local Storage
```
storage/backups/
```

### Cloud Storage (S3, Google Drive)
Backups are stored in the configured path (default: `backups/` folder)

### File Naming
Each backup includes:

- `YYYY-MM-DD-HH-MM-SS_database.sql.gz` - Database backup
- `YYYY-MM-DD-HH-MM-SS_storage.zip` - Storage backup (cloud only)

---

## 🧑‍💻 Developer Notes

### Publish Config & Views

```bash
php artisan vendor:publish --tag=laravel-backup
```

This will publish:

- `config/laravelBackup.php`
- Blade views to `resources/views/vendor/laravel-backup/`


### Middleware Logic

The package uses a configurable middleware to restrict access:

```php
if (!config('laravelBackup.check_access')) return $next($request);

$user = Auth::user();
if (!$user) {
    abort(403, 'Unauthorized - no user authenticated.');
}

if (!method_exists($user, 'hasRole')) {
    abort(403, 'User Role Not Implemented!');
}

if (!$user->hasAnyRole(config('laravelBackup.allowed_roles'))) {
    abort(403, 'Unauthorized - insufficient permission.');
}

return $next($request);
```

You can customize access logic using roles or your own permission methods.

---

## ☁️ Cloud Storage Setup

### Amazon S3 / DigitalOcean Spaces / MinIO

1. Install AWS SDK
```bash
composer require aws/aws-sdk-php
```

2. Add AWS Credentials to `.env`
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-backup-bucket
# AWS_ENDPOINT=https://s3.custom-endpoint.com  # Optional: for MinIO, DO Spaces
```

3. Enable S3 in `config/laravelBackup.php`
```php
'destinations' => [
    's3' => [
        'enabled' => true,
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'bucket' => env('AWS_BUCKET'),
        'endpoint' => env('AWS_ENDPOINT'), // Optional: for MinIO, DO Spaces
        'path' => 'backups', // Folder in your bucket
    ],
],
```

### Google Drive

#### OAuth 2.0
Uses YOUR Google Drive storage for backups. Generate a refresh token to authenticate.

1. Install Google API Client
```bash
composer require google/apiclient
```

2. Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost`
7. Copy your **Client ID** and **Client Secret**

3. Add Test User (Required for Unverified Apps)
1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen** (left sidebar)
2. Make sure Publishing Status is **"Testing"**
3. Go to **Audience** section
4. Under **Test users**, click **Add Users**
5. Add your Google email address
6. Click **Save**

4. Generate Refresh Token

**Option A: Using credentials from config (if already set)**
```bash
php artisan backup:google-auth
```

**Option B: Passing credentials directly**
```bash
php artisan backup:google-auth --client-id=YOUR_CLIENT_ID --client-secret=YOUR_CLIENT_SECRET
```

Follow the prompts to authorize and get your refresh token.

5. Add to `.env`
```env
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-folder-id  # Optional
```

6. Enable in config
```php
'destinations' => [
    'google_drive' => [
        'enabled' => true,
        'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
        'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'),
        'path' => 'backups',
    ],
],
```

**Note:** If your refresh token becomes invalid (user revoked access), regenerate it:
```bash
php artisan backup:google-auth
```

---

## 📄 License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

© 2025 [Avcodewizard](https://github.com/avcodewizard)
