# Laravel Database Backup to Google Drive 🚀

Automate your Laravel database backups to Google Drive with cron jobs.

This Laravel project provides a complete solution to:

✅ Create a database backup (SQL dump)  
✅ Compress it into a ZIP file  
✅ Upload it automatically to Google Drive  
✅ Clean up local storage after upload  

---

## 📌 Features

* Automatic database backup
* ZIP compression for reduced file size
* Google Drive API integration
* Secure upload using OAuth2 refresh token
* Auto delete local backup after upload

---

## ⚙️ Requirements

* PHP >= 7.4 / 8+
* Laravel Framework
* Google Cloud Account
* Google Drive API enabled

---

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/xaizikhan/database_backup_to_google_drive_laravel.git
cd database_backup_to_google_drive_laravel
```

---

### 2. Install Dependencies

```bash
composer install
```

---
### 3. Install Required Packages
Your controller uses some external packages that need to be installed:

1. **Google API Client** (for Google Drive integration):

```bash
composer require google/apiclient:^2.0
```
2. **HTTP Client** (for HTTP requests, usually built-in in Laravel >=7, otherwise install Guzzle):
```bash
composer require guzzlehttp/guzzle
```
---
### 4. Configure `.env`

Add the following variables:

```env
DB_DATABASE=your_database_name

GOOGLE_DRIVE_CLIENT_NAME=your_app_name
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_CLIENT_API_KEY=your_api_key
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
```

---

### 5. Configure `config/services.php`

```php
'google' => [
    'driver'         => 'google',
    'client_id'      => env('GOOGLE_DRIVE_CLIENT_ID'),
    'client_secret'  => env('GOOGLE_DRIVE_CLIENT_SECRET'),
    'refresh_token'  => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
    'folder_id'      => env('GOOGLE_DRIVE_FOLDER_ID'),
],
```


---

## 🔑 Google Setup Guide

### Step 1: Create Google Cloud Project

* Go to Google Cloud Console
* Create a new project

### Step 2: Enable APIs

Enable:

* Google Drive API

### Step 3: Create Credentials

* OAuth 2.0 Client ID
* Get:

  * Client ID
  * Client Secret

### Step 4: Generate Refresh Token

* Use Postman or OAuth playground
* Save refresh token in `.env`

---

## 📁 Project Structure

```
app/
 └── Http/
     └── Controllers/
         └── DatabaseBackupController.php

storage/
 ├── app/
 │   ├── backup/   (SQL files)
 │   └── zip/      (ZIP files)
```

---

## 🚀 How It Works

### Step-by-Step Flow:

1. Fetch all database tables
2. Generate SQL dump file
3. Save file in:

   ```
   storage/app/backup/
   ```
4. Compress SQL file into ZIP
5. Move ZIP to:

   ```
   storage/app/zip/
   ```
6. Upload ZIP file to Google Drive
7. Delete local files after upload

---

## ▶️ Usage

### Create Route

```php
use App\Http\Controllers\DatabaseBackupController;

Route::get('/take-database-backup', [DatabaseBackupController::class, 'takeBackUp']);
```

---

### Run in Browser

```
http://your-domain.com/take-database-backup
```

---

## 📦 Controller Breakdown

### `takeBackUp()`

* Main function
* Calls backup + upload process

---

### `_create_db_backup()`

* Loops through all tables
* Generates SQL dump
* Saves file locally

---

### `__create_zip_file()`

* Converts `.sql` file into `.zip`
* Reduces file size

---

### `_uploadDbToDrive()`

* Uploads ZIP file to Google Drive
* Deletes local files after success

---

### `_token()`

* Generates access token using refresh token

---

## 🔐 Security Notes

* Never commit `.env` file
* Keep Google credentials secure
* Restrict API usage

---

## ⏰ Scheduler Setup (Recommended)

Add this in `app/Console/Kernel.php`:

```php
$schedule->call(function () {
    app(\App\Http\Controllers\DatabaseBackupController::class)->takeBackUp();
})->daily();
```

---

### Run Cron Job

```bash
php artisan schedule:run
```

---

## 🧪 Optional Improvements

* Add email notification after backup
* Add logs for backup history
* Store multiple backups
* Add restore functionality
* Add UI dashboard

---

## 📬 Support

If you need help, feel free to contact.

---

## ⭐ Credits

Developed and maintained by Faizan Raza  Powered by Contriver Mate 🚀

## License
This package is open-sourced software licensed under the MIT license.
