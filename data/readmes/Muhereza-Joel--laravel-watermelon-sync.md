# Laravel Watermelon Sync

A robust, highly-configurable Laravel package designed to synchronize Eloquent models with WatermelonDB. It handles incremental pulls, batch pushes (upserts), and file synchronization via Spatie MediaLibrary.

## Features

- **Flexible Sync Keys**: Choose between `watermelon_id`, `uuid`, or any custom string column.
- **Automatic Scoping**: Automatically scopes sync data to the authenticated user.
- **Smart Type Conversion**: Handles Carbon timestamps to milliseconds (JS) and back.
- **Whitelisting**: Fine-grained control over which columns are sent to the client.
- **File Sync**: Built-in support for syncing media/images attached to models.

---

## Installation

### 1. Requirements

- PHP 8.1+
- Laravel 10.0,11.0 or 12.0
- Spatie MediaLibrary (Optional, for File Sync)

### 2. Install via Composer

```bash
composer require muhereza-joel/laravel-watermelon-sync
```

### 3. Publish Configuration

```bash
php artisan vendor:publish --tag="watermelon-sync-config"
```

## Setup

### 1. Prepare Your Models

Add the Syncable trait to any model you wish to synchronize.

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use MuherezaJoel\LaravelWatermelonSync\Traits\Syncable;

class Contact extends Model
{
    use Syncable;

    // Optional: Define which columns to sync (Defaults to $fillable)
    protected array $syncWhitelist = ['first_name', 'last_name', 'email'];

    // Optional: Change the sync key (Defaults to 'watermelon_id')
    protected string $syncKeyName = 'watermelon_id';

    // Optional: Disable user_id scoping for global data
    protected bool $isGlobalSync = false;
}
```

### 2. Database Migration

Ensure your tables have the identifier column required by WatermelonDB.

```php
Schema::table('contacts', function (Blueprint $table) {
    $table->string('watermelon_id')->unique()->nullable();
    // OR $table->uuid('uuid')->unique();
});
```

### 3. Register Models

Open config/sync.php and map your frontend table names to your Laravel models:

```php
return [
    'models' => [
        'contacts' => \App\Models\Contact::class,
        'tasks' => \App\Models\Task::class,
    ],
    'windows' => [
        'tasks' => '1 month', // Only pull tasks from the last month
    ],
];
```

## API Endpoints

The package automatically registers the following routes under the auth:sanctum middleware:

## Example Pull Request

### Pull Changes

`GET /api/sync/pull`  
Pull changes from server to client.

### Push Changes

`POST /api/sync/push`  
Push changes from client to server.

### File Status

`GET /api/sync/files/status`  
Check for new files to download.

### Upload File

`POST /api/sync/files/upload`  
Upload a file associated with an entity.

## Sync API Endpoints Reference Table

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| GET    | /api/sync/pull         | Pull changes from server to client      |
| POST   | /api/sync/push         | Push changes from client to server      |
| GET    | /api/sync/files/status | Check for new files to download         |
| POST   | /api/sync/files/upload | Upload a file associated with an entity |
