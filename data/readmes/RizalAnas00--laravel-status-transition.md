# Laravel Status Transition

[![Tests](https://github.com/rizalsaja/laravel-status-transition/actions/workflows/tests.yml/badge.svg)](https://github.com/rizalsaja/laravel-status-transition/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/rizalsaja/laravel-status-transition.svg)](https://packagist.org/packages/rizalsaja/laravel-status-transition)
[![Total Downloads](https://img.shields.io/packagist/dt/rizalsaja/laravel-status-transition.svg)](https://packagist.org/packages/rizalsaja/laravel-status-transition)
[![License](https://img.shields.io/packagist/l/rizalsaja/laravel-status-transition.svg)](LICENSE.md)
[![PHP Version](https://img.shields.io/packagist/php-v/rizalsaja/laravel-status-transition.svg)](composer.json)

A simple and flexible trait to add state machine behaviour to Laravel Eloquent models, with transition validation and automatic history tracking.

## Features

- Attach status state machine to any Eloquent model via a single trait
- Define allowed statuses and enforce valid transition paths
- Automatic status history recording with reason and actor tracking
- Polymorphic history — one `status_histories` table for all models
- Query scopes for filtering by status
- Configurable: disable history recording globally via config
- Auto-discovery support — no manual provider registration needed

## Requirements

| Package version | Laravel    | PHP  |
|-----------------|------------|------|
| 1.x             | 10, 11, 12 | 8.1+ |

## Installation

Install via Composer:

```bash
composer require rizalsaja/laravel-status-transition
```

The service provider is auto-discovered. No manual registration needed.

Publish the config file:

```bash
php artisan vendor:publish --tag=laravel-status-transition-config
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag=laravel-status-transition-migrations
php artisan migrate
```

## On-Progress Features

> [!WARNING]
> The following features are available on the [`1.1`](https://github.com/RizalAnas00/laravel-status-transition/tree/1.1) branch and are part of the upcoming **[v1.1.0](https://github.com/RizalAnas00/laravel-status-transition/milestone/1)** milestone. They are **not yet stable** and the API may change before the final release. Use at your own risk.

### Before and/or After Hooks for Status Transitions

Attach `before` and/or `after` callbacks to specific transitions directly in your model's `$transitions` map.

```php
protected $transitions = [
    'pending' => [
        'processing' => [
            'before' => 'validateStock',        // method name
            'after'  => 'sendProcessingEmail',  // method name
        ],
        'cancelled', // no hooks needed — plain string is fine
    ],
];

public function validateStock(): void
{
    // runs before the status is saved
}

public function sendProcessingEmail(): void
{
    // runs after the status is saved
}
```

Closures are also supported:

```php
'cancelled' => [
    'after' => function ($model) {
        Log::info("Order {$model->id} was cancelled.");
    },
],
```

## Usage

### 1. Add the trait to your model

```php
use Rizalsaja\LaravelStatusTransition\Traits\HasStatus;

class Order extends Model
{
    use HasStatus;

    /**
     * All valid statuses for this model.
     */
    protected $statuses = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
    ];

    /**
     * Allowed transition map.
     * Omit this property to allow all transitions freely.
     */
    protected $transitions = [
        'pending'    => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped'    => ['delivered'],
        'delivered'  => [],
        'cancelled'  => [],
    ];
}
```

Make sure your model's table has a `status` column:

```php
$table->string('status')->default('pending');
```

### 2. Transition to a new status

```php
$order = Order::create(['title' => 'New Order']);

// Simple transition
$order->transitionTo('processing');

// With a reason
$order->transitionTo('cancelled', reason: 'Customer requested cancellation');
```

### 3. Check current status

```php
$order->getCurrentStatus();         // 'processing'
$order->isStatus('processing');     // true
$order->isNotStatus('shipped');     // true
$order->canTransitionTo('shipped'); // true
$order->availableTransitions();     // ['shipped', 'cancelled']
```

### 4. Query by status

```php
Order::whereStatus('pending')->get();
Order::whereNotStatus('cancelled')->get();
Order::whereStatusIn(['pending', 'processing'])->get();
```

### 5. Access history

```php
// All history records (ordered by latest inserted)
$order->statusHistory;

// Most recent record only
$order->latestStatus;

// History fields
$history->from;        // 'pending'
$history->to;          // 'processing'
$history->reason;      // 'Payment confirmed'
$history->changed_by;  // user id (nullable)
$history->created_at;
```

### 6. Resolve back to the model

```php
$history = $order->statusHistory->first();
$history->statusable; // returns the Order instance
```

## Configuration

After publishing, edit `config/laravel-status-transition.php`:

```php
return [
    /*
     * Default statuses if the model does not define its own $statuses property.
     */
    'default_statuses' => ['active', 'inactive'],

    /*
     * Set to false to disable status history recording entirely.
     */
    'record_history' => true,
];
```

## Customisation

### Custom status column

```php
// default: 'status'
protected $statusColumn = 'state';
```

### Custom initial status

```php
// default: first item in $statuses
protected $initialStatus = 'draft';
```

### Allow all transitions freely

Omit `$transitions` from your model. Without it, any status can transition to any other status defined in `$statuses`.

## Error Handling

```php
use Rizalsaja\LaravelStatusTransition\Exceptions\InvalidStatusTransitionException;

try {
    $order->transitionTo('shipped'); // invalid from 'pending'
} catch (InvalidStatusTransitionException $e) {
    // "Cannot transition from [pending] to [shipped]. Allowed transitions: [processing, cancelled]."
    report($e);
}

try {
    $order->transitionTo('unknown');
} catch (\InvalidArgumentException $e) {
    // "Status [unknown] is not a valid status."
    report($e);
}
```

## Testing

```bash
vendor/bin/phpunit --testdox
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
