# Laravel SharedSync

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cslash/laravel-sharedsync.svg?style=flat-square)](https://packagist.org/packages/cslash/laravel-sharedsync)
[![Total Downloads](https://img.shields.io/packagist/dt/cslash/laravel-sharedsync.svg?style=flat-square)](https://packagist.org/packages/cslash/laravel-sharedsync)
[![Software License](https://img.shields.io/packagist/l/cslash/laravel-sharedsync.svg?style=flat-square)](LICENSE)

SharedSync is a Laravel package designed for deploying applications to shared hosting 
environments where only FTP or SFTP access is available. 
It builds the project locally and performs incremental uploads to the remote server.

This package is aimed at Laravel developers who want to deploy their applications to 
shared hosting environments that only support FTP or SFTP 
(A notable example is OVH's shared hosting basic plan)

## Features

- Build project locally before deployment (Composer, NPM, Artisan cache).
- Incremental deployment using a manifest file (`.deploy-manifest.json`).
- Supports both FTP and SFTP.
- Configurable ignore rules (supports `.deployignore`).
- Dry-run mode to see changes before uploading.
- Selective deployment using the `--only` flag.
- Post-deployment remote health checks (storage permissions, symlinks, etc.).

## Requirements

- PHP 8.2+
- Laravel 10.0+
- FTP or SFTP access to your hosting provider.

## Installation

You can install the package via composer:

```bash
composer require cslash/laravel-sharedsync
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharedsync-config
```

## Configuration

Edit `config/sharedsync.php` with your server details. You can also use environment variables.

Example `.env` configuration:

```env
SHAREDSYNC_DRIVER=ftp

FTP_HOST=ftp.example.com
FTP_USER=user@example.com
FTP_PASS=secret
FTP_ROOT=/public_html
FTP_PASSIVE=true
FTP_SSL=false

SFTP_HOST=sftp.example.com
SFTP_USER=user
SFTP_PASS=secret
SFTP_ROOT=/var/www/html
SFTP_PRIVATE_KEY=/path/to/id_rsa
SHAREDSYNC_URL=https://example.com
```

Example `config/sharedsync.php`:

```php
'driver' => env('SHAREDSYNC_DRIVER', 'ftp'),

'ftp' => [
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USER'),
    'password' => env('FTP_PASS'),
    'port' => env('FTP_PORT', 21),
    'root' => env('FTP_ROOT', '/'),
    'passive' => env('FTP_PASSIVE', true),
    'ssl' => env('FTP_SSL', false),
],

'sftp' => [
    'host' => env('SFTP_HOST'),
    'username' => env('SFTP_USER'),
    'password' => env('SFTP_PASS'),
    'port' => env('SFTP_PORT', 22),
    'root' => env('SFTP_ROOT', '/'),
    'privateKey' => env('SFTP_PRIVATE_KEY'),
],

'url' => env('SHAREDSYNC_URL'),
```

## Important Note on Local Build

The `composer` build step runs `composer install --no-dev --optimize-autoloader` in an isolated temporary 
directory. This ensures that your local development environment's `vendor` folder remains untouched 
and the current Artisan process is not affected by the removal of dev-dependencies.

This allows you to safely enable the `composer` build step in your configuration.

## Usage

### Basic Deployment

```bash
php artisan sharedsync:deploy
```

### Test Connection

Test the connection to your remote server:

```bash
php artisan sharedsync:test
```

### List Remote Files

List files on the remote server:

```bash
php artisan sharedsync:ls
```

Or list a specific directory:

```bash
php artisan sharedsync:ls path/to/directory
```

### Show Deployment Diff

List files that will be uploaded or updated:

```bash
php artisan sharedsync:diff
```

### Dry Run

See which files will be uploaded or deleted without actually performing the actions:

```bash
php artisan sharedsync:deploy --dry-run
```

### Force Deployment

Ignore the manifest and upload all files:

```bash
php artisan sharedsync:deploy --force
```

### Selective Deployment

Only upload files from specific directories:

```bash
php artisan sharedsync:deploy --only=app,config,resources/views
```

### Remote Health Checks

Run health checks on the remote server to ensure permissions are correct and necessary symlinks exist:

```bash
php artisan sharedsync:check
```

These checks are also automatically performed at the end of every successful deployment.

## How It Works

1. **Build**: Creates an isolated temporary directory, copies the project (excluding `vendor`, `node_modules`, `.git`), and runs `composer install --no-dev`, `npm install`, `npm run build`.
2. **Scan**: Recursively scans the build directory, applying ignore rules.
3. **Compare**: Compares the scanned files against the last deployment manifest.
4. **Upload**: Connects via FTP/SFTP and uploads new or modified files from the build directory.
5. **Delete**: Removes files from the remote server that no longer exist in the build directory (if enabled).
6. **Manifest**: Updates the local `.deploy-manifest.json` file.
7. **Remote Checks**: Connects to the remote `/sharedsync` endpoint (secured with a temporary token) to verify storage permissions and ensure the `public/storage` symlink exists.
8. **Cleanup**: Deletes the temporary build directory and the remote security token.

## License

The MIT License (MIT).
