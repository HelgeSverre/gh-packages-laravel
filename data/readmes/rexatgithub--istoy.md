# Istoy

A Laravel package for managing social media service providers (SMM) with an extensible provider architecture. This package allows you to integrate multiple social media service providers into your Laravel application.

## Features

- **Extensible Provider Architecture**: Easily add new service providers by extending the `AbstractProvider` class
- **SMM Provider Included**: Ready-to-use SMM (Social Media Marketing) provider for services like likes, views, and comments
- **Order Management**: Built-in `OrderService` for managing orders across providers
- **Request Definitions**: Structured HTTP request handling with validation
- **Status Synchronization**: Sync order statuses between your application and external providers
- **Cancel Order:** Opt-out pushed order from the provider

## Requirements

- PHP ^8.0.2
- Composer
- Laravel ^9.0|^10.0|^11.0

## Installation

### Installing PHP and Composer (macOS)

If you don't have PHP and Composer installed:

**Using Homebrew:**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PHP
brew install php

# Install Composer
brew install composer
```

**Or download Composer directly:**
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
```

### Via Composer

```bash
composer require rexatgithub/istoy
```

### Publish Configuration and Migrations

```bash
# Publish configuration
php artisan vendor:publish --tag=istoy-config

# Publish migration (optional - see Order Model Setup below)
php artisan vendor:publish --tag=istoy-migrations
```

This will publish:
- Configuration file to `config/istoy.php`
- Migration file to `database/migrations/` (if you choose to publish it)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
SMM_PROVIDER_HOST=https://smmlite.com/api/v2
SMM_PROVIDER_KEY=your_api_key_here
ISTOY_ORDER_MODEL=App\Models\Order
```

### Order Model Setup

Your Order model must have the following required columns. The package provides a migration to help you set this up.

#### Option 1: Using the Package Migration (Recommended for New Projects)

If you don't have an `orders` table yet, or want to add the required columns:

1. **Publish the migration:**
   ```bash
   php artisan vendor:publish --tag=istoy-migrations
   ```

2. **Run the migration:**
   ```bash
   php artisan migrate
   ```

The migration will:
- Create the `orders` table with all required columns if it doesn't exist
- Add missing columns to an existing `orders` table if it already exists
- Safely skip columns that already exist

#### Option 2: Manual Setup (For Existing Order Tables)

If you already have an `orders` table with different structure, you can manually add the required columns:

**Required columns:**
   - `external_id` (string/int, nullable) - ID from the external provider
   - `service` (int, nullable) - Service ID
   - `link` (string, required) - URL to the social media post
   - `quantity` (int, required) - Quantity of services to order
   - `status` (string, default: 'pending') - Order status
   - `start_count` (int, default: 0) - Starting count
   - `remains` (int, default: 0) - Remaining count

**Example migration:**
```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'external_id')) {
                $table->string('external_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('orders', 'service')) {
                $table->integer('service')->nullable()->after('external_id');
            }
            if (!Schema::hasColumn('orders', 'link')) {
                $table->string('link')->after('service');
            }
            if (!Schema::hasColumn('orders', 'quantity')) {
                $table->integer('quantity')->after('link');
            }
            if (!Schema::hasColumn('orders', 'status')) {
                $table->string('status')->default('pending')->after('quantity');
            }
            if (!Schema::hasColumn('orders', 'start_count')) {
                $table->integer('start_count')->default(0)->after('status');
            }
            if (!Schema::hasColumn('orders', 'remains')) {
                $table->integer('remains')->default(0)->after('start_count');
            }
        });
    }

    public function down(): void
    {
        // Optionally remove columns if needed
        // Be careful not to lose data!
    }
};
```

#### Model Requirements

Your Order model should implement the following:

1. **Use the `HasIstoyFields` trait (Recommended):**
   
   The easiest way is to use the provided trait which automatically adds all required fields to your `$fillable` array:

   ```php
   use Istoy\Traits\HasIstoyFields;
   use Istoy\Contracts\OrderContract;

   class Order extends Model implements OrderContract
   {
       use HasIstoyFields;
       
       // Your other model code...
       // The fillable fields are automatically added!
   }
   ```

   **Or manually add to `$fillable` (if you prefer):**
   
   If you don't want to use the trait, you can manually add these fields to your `$fillable` array:
   - `external_id`
   - `service`
   - `link`
   - `quantity`
   - `status`
   - `start_count`
   - `remains`

2. **Implement a scope for finding by external ID:**

```php
use Illuminate\Database\Eloquent\Builder;

public function scopeWithExternalId(Builder $query, $externalId): Builder
{
    return $query->where(['external_id' => $externalId]);
}
```

3. Optionally implement the `OrderContract` interface:

```php
use Istoy\Contracts\OrderContract;
use Istoy\Traits\HasIstoyFields;

class Order extends Model implements OrderContract
{
    use HasIstoyFields;
    
    // All Istoy fields are automatically fillable!
    // You can still add your own fillable fields if needed
}
```

**Complete Example:**

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Istoy\Contracts\OrderContract;
use Istoy\Traits\HasIstoyFields;
use Istoy\Models\Enums\OrderStatuses;

class Order extends Model implements OrderContract
{
    use HasIstoyFields;

    protected $fillable = [
        // Your custom fields here (Istoy fields are added automatically)
        'user_id',
        'payment_status',
    ];

    protected $casts = [
        'status' => OrderStatuses::class,
    ];

    public function scopeWithExternalId(Builder $query, $externalId): Builder
    {
        return $query->where('external_id', $externalId);
    }
}
```

## Usage

### Starting an Order

```php
use Istoy\Services\OrderService;
use App\Models\Order;

$order = Order::find(1);
$orderService = new OrderService($order);

// Start the order (pushes to provider)
$success = $orderService->start();

// Start with interval (in minutes)
$success = $orderService->start(interval: 5);
```

### Syncing Order(s) Statuses

```php
use Istoy\Services\OrderService;

$orderService = new OrderService($order);
$orderService->syncStatuses();
```

### Cancelling Order(s)

```php
use Istoy\Services\OrderService;

$orderService = new OrderService($order);
$orderService->cancel();
```


### Using Providers Directly

```php
use Istoy\Providers\Factory;
use App\Models\Order;

$order = Order::find(1);
$provider = Factory::create($order);

// Add order to provider
$provider->add();

// Add with interval
$provider->add(interval: 10);

// Check statuses
$provider->statuses();

// Cancel Order
$provider->cancel();
```

### Using SMM Provider Directly

```php
use Istoy\Providers\Smm\Service;
use App\Models\Order;

$order = Order::find(1);
$smmService = new Service($order);

$smmService->add(interval: 5);
$smmService->statuses();
$smmService->cancel();
```

## Creating Custom Providers

To create a custom provider:

1. Extend the `AbstractProvider` class:

```php
namespace App\Providers\Custom;

use Istoy\Providers\AbstractProvider;
use Istoy\Providers\Factory;

class CustomProvider extends AbstractProvider
{
    public function getId(): int
    {
        return 2; // Your provider ID
    }

    public function add(?int $interval = null): void
    {
        // Implement your add logic
    }

    public function statuses(): void
    {
        // Implement your status check logic
    }

    public function cancel(): void
    {
        // Implement your status check logic
    }
}
```

2. Register your provider:

```php
use Istoy\Providers\Factory;
use App\Providers\Custom\CustomProvider;

Factory::register(2, CustomProvider::class);
```

3. Use it:

```php
$provider = Factory::create($order, providerId: 2);
```

## Order Statuses

The package includes the following order statuses:

- `Pending` - Order is pending
- `InProgress` - Order is in progress
- `Cancelled` - Order is cancelled
- `Completed` - Order is completed
- `Paused` - Order is paused

## Testing

The package includes a comprehensive test suite using PHPUnit and Orchestra Testbench.

### Setup for Testing

**Important:** You must install dependencies before running tests.

First, install development dependencies:

```bash
composer install
```

### Running Tests

Once dependencies are installed, you can run tests:

```bash
# Run all tests (recommended)
composer test

# Or run PHPUnit directly
vendor/bin/phpunit

# Run tests with coverage
composer test-coverage

# Or run PHPUnit with coverage directly
vendor/bin/phpunit --coverage-html coverage
```

### Test Structure

The test suite includes:

- **Unit Tests**: Tests for individual components
  - Enums (Statuses)
  - Factory pattern for provider creation
  - OrderService for order management
  - SMM Service provider
  - Request definitions (Add, Status)
  - Generic request definition base classes

### Test Coverage

The tests cover:
- Provider registration and factory pattern
- Order creation and status synchronization
- Request definition validation
- Enum functionality and mappings
- Error handling and edge cases

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.

