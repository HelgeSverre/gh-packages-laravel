# Laravel Simple Cold Storage

[![Latest Version on Packagist](https://img.shields.io/packagist/v/websolutionfalcon/laravel-simple-cold-storage.svg?style=flat-square)](https://packagist.org/packages/websolutionfalcon/laravel-simple-cold-storage)
[![Total Downloads](https://img.shields.io/packagist/dt/websolutionfalcon/laravel-simple-cold-storage.svg?style=flat-square)](https://packagist.org/packages/websolutionfalcon/laravel-simple-cold-storage)
![GitHub Actions](https://github.com/websolutionfalcon/laravel-simple-cold-storage/actions/workflows/main.yml/badge.svg)

A simple, extensible Laravel package for storing data to the local filesystem using a clean, type-safe API with StorageKey DTOs.

## Features

- **Dead simple**: One main class, minimal configuration
- **Easily extensible**: Create custom encoders and storage implementations
- **Type-safe API**: Modern PHP 8.2+ with readonly properties
- **StorageKey DTO**: Powered by Spatie Laravel Data with validation attributes
- **Laravel Storage**: Works with any Laravel filesystem disk (local, s3, ftp, etc.)
- **Configurable prefix**: Customize storage paths
- **JSON encoding**: Built-in JSON encoder, add your own encoders easily

## Installation

```bash
composer require websolutionfalcon/laravel-simple-cold-storage
```

Publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="Websolutionfalcon\LaravelSimpleColdStorage\LaravelSimpleColdStorageServiceProvider" --tag="config"
```

## Quick Start

```php
use Websolutionfalcon\LaravelSimpleColdStorage\DTOs\StorageKey;
use Websolutionfalcon\LaravelSimpleColdStorage\Facades\LaravelSimpleColdStorage;

// Create a storage key
$key = new StorageKey('orders', '12345', 'archived');

// Store data
LaravelSimpleColdStorage::store(['order_id' => 12345, 'total' => 99.99], $key);

// Retrieve data
$data = LaravelSimpleColdStorage::retrieve($key);

// Check existence
if (LaravelSimpleColdStorage::exists($key)) {
    // Data exists
}

// Delete data
LaravelSimpleColdStorage::delete($key);
```

## Configuration

`config/laravel-simple-cold-storage.php`:

```php
return [
    // Storage implementation class
    'storage' => \Websolutionfalcon\LaravelSimpleColdStorage\ColdStorage::class,

    // Settings passed to the storage implementation
    'settings' => [
        'disk' => env('COLD_STORAGE_DISK', 'local'),
        'prefix' => env('COLD_STORAGE_PREFIX', 'cold-storage'),
    ],

    // Encoder implementation class
    'encoder' => \Websolutionfalcon\LaravelSimpleColdStorage\Encoders\JsonEncoder::class,
];
```

The package uses Laravel's Storage facade, so you can use **any disk** configured in `config/filesystems.php`:

- `local` - Local filesystem (default)
- `s3` - Amazon S3
- `ftp` - FTP server
- `sftp` - SFTP server
- Or any custom disk you configure

Files are stored at: `{disk}/{prefix}/{type}/{identifier}[.{variant}].json`

## Using Different Storage Disks

Simply change the disk in your config or `.env`:

```env
# Use S3
COLD_STORAGE_DISK=s3

# Use local (default)
COLD_STORAGE_DISK=local

# Use a custom disk
COLD_STORAGE_DISK=my_custom_disk

# Customize the path prefix
COLD_STORAGE_PREFIX=archives
```

Files will be stored at: `{disk}/{prefix}/{type}/{identifier}[.{variant}].json`

Example:
- Disk: `s3`, Prefix: `archives` → `s3://bucket/archives/orders/12345.json`
- Disk: `local`, Prefix: `cold-storage` → `storage/app/cold-storage/orders/12345.json`

## Extending with Custom Encoders

### 1. Create Your Encoder

Create a custom encoder in your Laravel application:

```php
// app/ColdStorage/Encoders/MsgPackEncoder.php

namespace App\ColdStorage\Encoders;

use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\EncoderInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\EncodingException;

class MsgPackEncoder implements EncoderInterface
{
    public function encode(mixed $data): string
    {
        try {
            return msgpack_pack($data);
        } catch (\Exception $e) {
            throw new EncodingException('Failed to encode: ' . $e->getMessage(), 0, $e);
        }
    }

    public function decode(string $data): mixed
    {
        try {
            return msgpack_unpack($data);
        } catch (\Exception $e) {
            throw new EncodingException('Failed to decode: ' . $e->getMessage(), 0, $e);
        }
    }

    public function getContentType(): string
    {
        return 'application/msgpack';
    }

    public function getFileExtension(): string
    {
        return 'msgpack';  // Files will have .msgpack extension
    }
}
```

### 2. Configure Your Encoder

Update your published config file:

```php
// config/laravel-simple-cold-storage.php

return [
    'encoder' => \App\ColdStorage\Encoders\MsgPackEncoder::class,
    // ... rest of config
];
```

That's it! The package will now use your custom encoder.

## Extending with Custom Storage

### Example: MySQL Storage

Create a custom storage implementation for MySQL:

```php
// app/ColdStorage/MySqlColdStorage.php

namespace App\ColdStorage;

use Illuminate\Support\Facades\DB;
use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\ColdStorageInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\EncoderInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\DTOs\StorageKey;
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\StorageNotFoundException;

class MySqlColdStorage implements ColdStorageInterface
{
    public function __construct(
        protected EncoderInterface $encoder,
        protected string $table = 'cold_storage',
        protected ?string $connection = null
    ) {}

    public static function fromSettings(EncoderInterface $encoder, array $settings): static
    {
        return new static(
            encoder: $encoder,
            table: $settings['table'] ?? 'cold_storage',
            connection: $settings['connection'] ?? null
        );
    }

    public function store(mixed $data, StorageKey $key): void
    {
        $encoded = $this->encoder->encode($data);

        DB::connection($this->connection)->table($this->table)->updateOrInsert(
            [
                'type' => $key->type,
                'identifier' => $key->identifier,
                'variant' => $key->variant,
            ],
            [
                'data' => $encoded,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function retrieve(StorageKey $key): mixed
    {
        $record = DB::connection($this->connection)
            ->table($this->table)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->first();

        if (!$record) {
            throw new StorageNotFoundException("Not found: {$key}");
        }

        return $this->encoder->decode($record->data);
    }

    public function delete(StorageKey $key): bool
    {
        return DB::connection($this->connection)
            ->table($this->table)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->delete() > 0;
    }

    public function exists(StorageKey $key): bool
    {
        return DB::connection($this->connection)
            ->table($this->table)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->exists();
    }
}
```

### Configure Your Custom Storage

Just update the config:

```php
// config/laravel-simple-cold-storage.php

return [
    'storage' => \App\ColdStorage\MySqlColdStorage::class,

    'settings' => [
        'table' => 'cold_storage',
        'connection' => null,  // Or 'mysql', 'pgsql', etc.
    ],

    'encoder' => \Websolutionfalcon\LaravelSimpleColdStorage\Encoders\JsonEncoder::class,
];
```

The `fromSettings()` method lets each storage implementation define its own configuration needs!

## Use Cases

### Archive Old Data

```php
$oldOrders = Order::where('created_at', '<', now()->subYears(2))->get();

foreach ($oldOrders as $order) {
    $key = new StorageKey('orders', (string) $order->id, 'archived');

    LaravelSimpleColdStorage::store([
        'order_data' => $order->toArray(),
        'items' => $order->items->toArray(),
    ], $key);

    $order->update(['archived_key' => $key->toString()]);
    $order->delete();
}
```

### Versioned Backups

```php
$version = now()->format('Y-m-d-His');
$key = new StorageKey('backups', 'database', $version);

LaravelSimpleColdStorage::store([
    'tables' => $databaseDump,
    'created_at' => now(),
], $key);
```

### Session Data

```php
$key = new StorageKey('sessions', session()->getId(), 'cart');

LaravelSimpleColdStorage::store([
    'items' => $cart->items,
    'total' => $cart->total,
], $key);
```

## StorageKey

The `StorageKey` DTO identifies stored data:

```php
// With variant
$key = new StorageKey('users', '123', 'profile');

// Without variant
$key = new StorageKey('orders', '456');

// From string
$key = StorageKey::fromString('users:123:profile');

// To string
$str = $key->toString(); // "users:123:profile"
$str = (string) $key;     // "users:123:profile"
```

### File Structure

```
storage/cold-storage/
  orders/
    12345.json                 # StorageKey('orders', '12345')
    12345.archived.json        # StorageKey('orders', '12345', 'archived')
  users/
    789.profile.json           # StorageKey('users', '789', 'profile')
```

## Dependency Injection

```php
use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\ColdStorageInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\DTOs\StorageKey;

class OrderService
{
    public function __construct(
        protected ColdStorageInterface $coldStorage
    ) {}

    public function archiveOrder(Order $order): void
    {
        $key = new StorageKey('orders', (string) $order->id, 'archived');
        $this->coldStorage->store($order->toArray(), $key);
    }
}
```

## Example: Custom MySQL Storage

Here's a complete example of creating a MySQL storage implementation:

```php
// app/ColdStorage/Storages/MySqlColdStorage.php

namespace App\ColdStorage\Storages;

use Illuminate\Support\Facades\DB;
use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\ColdStorageInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\Contracts\EncoderInterface;
use Websolutionfalcon\LaravelSimpleColdStorage\DTOs\StorageKey;
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\StorageNotFoundException;

class MySqlColdStorage implements ColdStorageInterface
{
    public function __construct(
        protected EncoderInterface $encoder,
        protected string $basePath,  // Used as table name
        protected ?string $connection = null
    ) {}

    public function store(mixed $data, StorageKey $key): void
    {
        $encoded = $this->encoder->encode($data);

        DB::connection($this->connection)->table($this->basePath)->updateOrInsert(
            [
                'type' => $key->type,
                'identifier' => $key->identifier,
                'variant' => $key->variant,
            ],
            [
                'data' => $encoded,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function retrieve(StorageKey $key): mixed
    {
        $record = DB::connection($this->connection)
            ->table($this->basePath)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->first();

        if (!$record) {
            throw new StorageNotFoundException("Not found: {$key}");
        }

        return $this->encoder->decode($record->data);
    }

    public function delete(StorageKey $key): bool
    {
        return DB::connection($this->connection)
            ->table($this->basePath)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->delete() > 0;
    }

    public function exists(StorageKey $key): bool
    {
        return DB::connection($this->connection)
            ->table($this->basePath)
            ->where('type', $key->type)
            ->where('identifier', $key->identifier)
            ->where('variant', $key->variant)
            ->exists();
    }
}
```

Then configure it:

```php
// config/laravel-simple-cold-storage.php
return [
    'base_path' => 'cold_storage',  // table name
    'storage' => \App\ColdStorage\Storages\MySqlColdStorage::class,
];
```

## Testing

Run the package tests:

```bash
composer test
```

Run with coverage:

```bash
composer test-coverage
```

## Architecture

The package provides:

- **Contracts**: `ColdStorageInterface`, `EncoderInterface`
- **Default Storage**: `ColdStorage` (local filesystem)
- **Default Encoder**: `JsonEncoder`
- **DTO**: `StorageKey` for type-safe keys
- **Exceptions**: Custom exceptions for error handling

You extend by:

1. **Create** a class implementing `ColdStorageInterface` or `EncoderInterface`
2. **Configure** it in `config/laravel-simple-cold-storage.php`
3. **Done** - the package will use your implementation

## Error Handling

```php
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\StorageNotFoundException;
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\EncodingException;
use Websolutionfalcon\LaravelSimpleColdStorage\Exceptions\InvalidStorageKeyException;

try {
    $data = LaravelSimpleColdStorage::retrieve($key);
} catch (StorageNotFoundException $e) {
    // Data not found
} catch (EncodingException $e) {
    // Encoding/decoding failed
} catch (InvalidStorageKeyException $e) {
    // Invalid key format
}
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security issues, please email websolution.falcon@gmail.com.

## Credits

- [Slava Mehovich](https://github.com/websolutionfalcon)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
