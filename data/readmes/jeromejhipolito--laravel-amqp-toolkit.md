# Laravel AMQP Toolkit

A Laravel package for robust AMQP message handling with automatic retry, dead letter queue management, and comprehensive failure tracking.

## Features

- **Base Consumer Class**: Abstract class for building AMQP consumers with built-in error handling
- **Automatic Retry**: Exponential backoff retry mechanism (1, 5, 15, 60 minutes)
- **Dead Letter Queue**: Messages that exceed max retries are moved to dead letter status
- **Failure Tracking**: All failed messages are stored in database for inspection and manual retry
- **Artisan Commands**: CLI commands for managing failed messages
- **Statistics**: Get insights into message processing status

## Requirements

- PHP 8.2+
- Laravel 11.0+
- bschmitt/laravel-amqp package

## Installation

```bash
composer require jeromejhipolito/laravel-amqp-toolkit
```

The package will auto-register its service provider.

### Publish Migration

```bash
php artisan vendor:publish --tag=amqp-toolkit-migrations
php artisan migrate
```

## Usage

### Creating a Consumer

Extend the `BaseAmqpConsumer` class to create your own consumer:

```php
<?php

namespace App\Console\Commands\Consumer;

use JeromeHipolito\AmqpToolkit\Console\Commands\BaseAmqpConsumer;

class OrderCreatedConsumer extends BaseAmqpConsumer
{
    protected $signature = 'amqp:consume:order-created';
    protected $description = 'Consume order created messages';

    protected function getQueueName(): string
    {
        return 'order-created-queue';
    }

    protected function getRoutingKey(): string
    {
        return 'order.created';
    }

    protected function getExchange(): string
    {
        return 'orders-exchange';
    }

    protected function validatePayload(array $data): bool
    {
        return isset($data['order_id']) && isset($data['user_id']);
    }

    protected function processMessage(array $data): void
    {
        // Your message processing logic here
        logger()->info('Processing order', ['order_id' => $data['order_id']]);
    }

    // Optional: Override max retries (default: 3)
    protected function getMaxRetries(): int
    {
        return 5;
    }
}
```

### Running the Consumer

```bash
php artisan amqp:consume:order-created
```

### Artisan Commands

#### List Failed Messages

```bash
# List all failed messages
php artisan amqp:failed

# Filter by queue
php artisan amqp:failed --queue=order-created-queue

# Filter by status
php artisan amqp:failed --status=dead_letter
```

#### Retry Failed Messages

```bash
# Retry all messages ready for retry
php artisan amqp:retry-failed

# Limit number of messages to retry
php artisan amqp:retry-failed --limit=50
```

#### Force Retry Specific Message

```bash
# Retry a specific message by ID
php artisan amqp:force-retry 123

# Reset retry count and retry
php artisan amqp:force-retry 123 --reset-count
```

#### Purge Dead Letter Messages

```bash
# Purge all dead letter messages (with confirmation)
php artisan amqp:purge-dead-letters

# Skip confirmation
php artisan amqp:purge-dead-letters --force
```

### Using AmqpRetryService

You can inject `AmqpRetryService` for programmatic access:

```php
use JeromeHipolito\AmqpToolkit\Services\AmqpRetryService;

class MessageController extends Controller
{
    public function index(AmqpRetryService $retryService)
    {
        // Get all failed messages
        $messages = $retryService->getFailedMessages();

        // Get messages with filters
        $messages = $retryService->getFailedMessages([
            'queue_name' => 'order-created-queue',
            'status' => 'failed',
        ]);

        // Get statistics
        $stats = $retryService->getStatistics();
        // Returns: ['total' => 10, 'by_status' => ['failed' => 5, 'retrying' => 3, 'dead_letter' => 2]]

        // Manually retry a message
        $message = FailedAmqpMessage::find($id);
        $retryService->retryMessage($message);

        // Purge dead letters
        $deleted = $retryService->purgeDeadLetters();
    }
}
```

### Message Status Lifecycle

1. **FAILED**: Initial state when a message fails processing
2. **RETRYING**: Message is being retried
3. **DEAD_LETTER**: Message has exceeded max retries

### Exponential Backoff Schedule

| Retry # | Delay |
|---------|-------|
| 1 | 1 minute |
| 2 | 5 minutes |
| 3 | 15 minutes |
| 4+ | 60 minutes |

## Configuration

The package works out of the box with sensible defaults. You can customize behavior by:

1. Overriding `getMaxRetries()` in your consumer (default: 3)
2. Overriding `shouldAcknowledgeOnFailure()` to control message acknowledgment (default: false)

## Database Schema

The `failed_amqp_messages` table stores:

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| uuid | uuid | Unique identifier |
| queue_name | string | Source queue name |
| routing_key | string | AMQP routing key |
| exchange | string | AMQP exchange |
| payload | longText | Original message payload |
| exception | longText | Exception message and trace |
| retry_count | integer | Number of retry attempts |
| max_retries | integer | Maximum allowed retries |
| failed_at | timestamp | When the message first failed |
| last_retry_at | timestamp | When last retry was attempted |
| next_retry_at | timestamp | When next retry should happen |
| status | enum | failed, retrying, dead_letter |

## Testing

```bash
composer test
```

## License

MIT License. See [LICENSE](LICENSE) for details.
