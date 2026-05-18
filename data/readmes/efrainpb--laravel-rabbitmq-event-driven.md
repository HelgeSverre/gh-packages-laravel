# RabbitMQ Event Driven

A Laravel package for event-driven messaging with RabbitMQ using topic exchanges and routing keys.

## Installation

```bash
composer require efrainpb/laravel-rabbitmq-event-driven
```

## Configuration

### Publish the config file

```bash
php artisan vendor:publish --provider="Efrainpb\RabbitMQEventDriven\ServiceProvider"
```

### Set your `.env` variables

```env
RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
RABBITMQ_QUEUE=my-service-queue
RABBITMQ_EXCHANGE=my-exchange
RABBITMQ_SSL=false
```

## Usage

### Create a listener

```bash
php artisan make:rabbitmq-listener OrderCreatedListener
```

This generates a listener class at `app/Listeners/RabbitMQ/OrderCreatedListener.php`:

```php
<?php

namespace App\Listeners\RabbitMQ;

use Efrainpb\RabbitMQEventDriven\Infrastructure\RabbitMQ\Contracts\Listener;

class OrderCreatedListener extends Listener
{
    protected string $exchange = 'orders';
    protected string $routingKey = 'order.created';

    public function handle(string $msg): void
    {
        $data = json_decode($msg, true);
        // Process the message
    }
}
```

### Register the listener in `config/rabbitmq.php`

```php
'listeners' => [
    \App\Listeners\RabbitMQ\OrderCreatedListener::class,
]
```

### Start the consumer

```bash
php artisan rabbitmq:consume
```

### Publishing messages

```php
use Efrainpb\RabbitMQEventDriven\Infrastructure\RabbitMQ\Connections\RabbitMQService;

$service = app(RabbitMQService::class);

// Publish to a topic exchange with routing key
$service->publishMessage('{"order_id": 123}', 'order.created');

// Publish directly to a queue
$service->publishDirectMessage('{"order_id": 123}', 'my-queue');
```

## Requirements

- PHP >= 8.1
- Laravel 10+
- RabbitMQ Server
