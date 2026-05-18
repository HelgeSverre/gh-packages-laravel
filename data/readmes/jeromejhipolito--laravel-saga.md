# Laravel Saga

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jeromejhipolito/laravel-saga.svg?style=flat-square)](https://packagist.org/packages/jeromejhipolito/laravel-saga)
[![Total Downloads](https://img.shields.io/packagist/dt/jeromejhipolito/laravel-saga.svg?style=flat-square)](https://packagist.org/packages/jeromejhipolito/laravel-saga)

Laravel package for implementing the **Saga transaction pattern** - manage distributed transactions with automatic rollback support.

## Features

- **Step-by-step execution** - Execute multiple steps in sequence with automatic tracking
- **Automatic rollback** - When a step fails, previously executed steps are automatically rolled back in reverse order
- **Database persistence** - Transaction and step states are persisted for debugging and recovery
- **Status tracking** - Detailed status enums for both transactions and steps
- **Easy integration** - Simple trait for Jobs and Consumers

## Installation

```bash
composer require jeromejhipolito/laravel-saga
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="saga-migrations"
php artisan migrate
```

## Usage

### Creating a Saga Step

Create a step by extending `AbstractSagaStep`:

```php
<?php

namespace App\Saga\Steps;

use JeromeJHipolito\Saga\Steps\AbstractSagaStep;

class CreateOrderStep extends AbstractSagaStep
{
    public function execute(array $data): mixed
    {
        // Create the order
        $order = Order::create([
            'user_id' => $data['user_id'],
            'total' => $data['total'],
        ]);

        return ['order_id' => $order->id];
    }

    public function rollback(mixed $result, array $data): void
    {
        // Rollback: Delete the created order
        if (isset($result['order_id'])) {
            Order::find($result['order_id'])?->delete();
        }
    }
}
```

### Using the UsesSaga Trait in Jobs

```php
<?php

namespace App\Jobs;

use App\Saga\Steps\CreateOrderStep;
use App\Saga\Steps\ReserveInventoryStep;
use App\Saga\Steps\ProcessPaymentStep;
use JeromeJHipolito\Saga\Traits\UsesSaga;

class ProcessOrderJob implements ShouldQueue
{
    use UsesSaga;

    public function handle(): void
    {
        $data = [
            'user_id' => $this->userId,
            'items' => $this->items,
            'total' => $this->total,
        ];

        // Initialize the saga
        $saga = $this->initializeSaga($data);

        // Add steps
        $saga->addStep(new CreateOrderStep())
             ->addStep(new ReserveInventoryStep())
             ->addStep(new ProcessPaymentStep());

        // Execute - if any step fails, previous steps are rolled back
        $this->executeSaga($data);
    }
}
```

### Direct Usage with SagaTransactionManager

```php
<?php

use JeromeJHipolito\Saga\Services\SagaTransactionManager;

$saga = SagaTransactionManager::createTransaction(
    transactionId: 'order-'.Str::uuid(),
    jobClass: 'ProcessOrderJob',
    payload: $data
);

$saga->addStep(new CreateOrderStep())
     ->addStep(new ReserveInventoryStep())
     ->addStep(new ProcessPaymentStep());

try {
    $result = $saga->execute($data);
    // Transaction completed successfully
} catch (Exception $e) {
    // Transaction failed, steps were rolled back
    $saga->rollback(); // Manual rollback for additional cleanup
}
```

### Checking Transaction Status

```php
// Find an existing transaction
$saga = SagaTransactionManager::findByTransactionId('order-123');

$saga->isCompleted(); // true if all steps succeeded
$saga->hasFailed();   // true if any step failed
```

### Transaction and Step Statuses

**Transaction Statuses:**
- `PENDING` - Transaction created, not yet started
- `RUNNING` - Transaction is executing steps
- `COMPLETED` - All steps executed successfully
- `FAILED` - A step failed during execution
- `ROLLING_BACK` - Rollback is in progress
- `ROLLED_BACK` - Rollback completed

**Step Statuses:**
- `PENDING` - Step not yet executed
- `EXECUTED` - Step completed successfully
- `FAILED` - Step execution failed
- `ROLLED_BACK` - Step was rolled back
- `CANCELLED` - Step was never executed (skipped due to earlier failure)

## Database Schema

The package creates two tables:

### saga_transactions
- `id` - Primary key
- `uuid` - Unique identifier
- `transaction_id` - Your custom transaction ID
- `job_class` - The class that initiated the saga
- `payload` - JSON payload data
- `status` - Current transaction status
- `started_at`, `completed_at`, `failed_at` - Timestamps
- `rollback_started_at`, `rollback_completed_at` - Rollback timestamps
- `error_message` - Error details if failed

### saga_steps
- `id` - Primary key
- `uuid` - Unique identifier
- `saga_transaction_id` - Foreign key to transaction
- `step_name` - Name of the step
- `step_class` - Full class name of the step
- `step_order` - Execution order
- `status` - Current step status
- `executed_at`, `rollback_at` - Timestamps
- `result_data` - JSON result from execution
- `error_message` - Error details if failed

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
