# Laravel Business Events

[![PHP Version](https://img.shields.io/badge/php-%5E8.2-blue)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/laravel-%5E11.0%20%7C%20%5E12.0-red)](https://laravel.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A powerful Laravel package for handling business events with priority-based queue processing and polymorphic model support. Perfect for tracking critical business operations like order creation, payment processing, user registration, and more.

## Features

- 🎯 **Priority-Based Processing** - Handle critical events first with configurable priority levels
- 🔄 **Polymorphic Relationships** - Track events for any model type (User, Order, Payment, etc.)
- 📊 **Event Status Tracking** - Monitor event lifecycle (pending, processing, completed, failed)
- ⚡ **Background Processing** - Async event handling with Laravel queues
- 🎨 **Flexible Event System** - Easy to extend with custom event types
- 📝 **Comprehensive Logging** - Track event metadata and processing results

## Installation

Install the package via Composer:

```bash
composer require kiamars/laravel-business-events
```

Publish and run the migrations:

```bash
php artisan vendor:publish --provider="BusinessEvents\BusinessEventsServiceProvider"
php artisan migrate
```

## Quick Start

### 1. Create a Business Event

```php
use BusinessEvents\Models\BusinessEvent;

// Create an event for an order
$order = Order::find(1);

BusinessEvent::create([
    'event_type' => 'OrderCreated',
    'eventable_type' => Order::class,
    'eventable_id' => $order->id,
    'priority' => 1, // High priority
    'status' => 'pending',
    'metadata' => [
        'total' => $order->total,
        'customer_id' => $order->customer_id,
    ],
]);
```

### 2. Process Events

Events are automatically processed in the background based on priority:

```php
// Dispatch the event processor job
ProcessBusinessEventsJob::dispatch();
```

### 3. Listen to Events

Create a listener for specific event types:

```php
namespace App\Listeners;

use BusinessEvents\Events\BusinessEventCreated;

class SendOrderConfirmation
{
    public function handle(BusinessEventCreated $event)
    {
        if ($event->businessEvent->event_type === 'OrderCreated') {
            // Send confirmation email
            Mail::to($event->businessEvent->eventable->customer)
                ->send(new OrderConfirmationMail($event->businessEvent));
        }
    }
}
```

## Usage Examples

### Priority Levels

```php
// Critical events (processed first)
BusinessEvent::create([
    'event_type' => 'PaymentFailed',
    'priority' => 1,
    // ...
]);

// Normal priority
BusinessEvent::create([
    'event_type' => 'UserLoggedIn',
    'priority' => 5,
    // ...
]);

// Low priority
BusinessEvent::create([
    'event_type' => 'NewsletterSubscribed',
    'priority' => 10,
    // ...
]);
```

### Polymorphic Events

Track events for any model:

```php
// User registration event
BusinessEvent::create([
    'event_type' => 'UserRegistered',
    'eventable_type' => User::class,
    'eventable_id' => $user->id,
]);

// Payment processed event
BusinessEvent::create([
    'event_type' => 'PaymentProcessed',
    'eventable_type' => Payment::class,
    'eventable_id' => $payment->id,
]);
```

### Event Status Tracking

```php
// Check event status
$event = BusinessEvent::find(1);

if ($event->status === 'completed') {
    // Event processed successfully
}

// Update event status
$event->update(['status' => 'processing']);
```

## Configuration

The package uses the following event statuses:

- `pending` - Event created, waiting to be processed
- `processing` - Event is currently being processed
- `completed` - Event processed successfully
- `failed` - Event processing failed

## Database Schema

The package creates a `business_events` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| event_type | string | Type of business event |
| eventable_type | string | Model class name |
| eventable_id | bigint | Model ID |
| priority | integer | Processing priority (1-10) |
| status | string | Event status |
| metadata | json | Additional event data |
| processed_at | timestamp | When event was processed |
| created_at | timestamp | Event creation time |
| updated_at | timestamp | Last update time |

## Advanced Usage

### Custom Event Types

Create custom event types for your business logic:

```php
class OrderShippedEvent extends BusinessEventCreated
{
    public function handle()
    {
        // Custom shipping logic
        $order = $this->businessEvent->eventable;
        
        // Update tracking information
        $order->update([
            'tracking_number' => $this->generateTrackingNumber(),
            'shipped_at' => now(),
        ]);
    }
}
```

### Batch Processing

Process multiple events efficiently:

```php
// Get pending events by priority
$events = BusinessEvent::where('status', 'pending')
    ->orderBy('priority')
    ->orderBy('created_at')
    ->limit(100)
    ->get();

foreach ($events as $event) {
    ProcessBusinessEventJob::dispatch($event);
}
```

## Testing

Run the test suite:

```bash
composer test
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email kiamars.mirzaee@gmail.com instead of using the issue tracker.

## Credits

Made with ❤️ by [Architect Systems](https://github.com/kiamars-mirzaee)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
