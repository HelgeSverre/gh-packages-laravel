# Laravel Message Brokers

A RabbitMQ message broker for Laravel that provides clean routing, similar to Laravel's route system, for sending and consuming messages.

```php
// Subscribe: in routes/message-broker.php
Route::make()
    ->subscribe($exchangeName)
    ->listenTo($routingKey, function (MessageData $dataMessage) {
        dump($dataMessage->payload);
    });

//Publish: from any file
MessageBroker::sendTo($exchangeName, $payloadMessage, $routingKey);
```

## Prerequisites

Before installing, ensure your project meets the following requirements:

```json
{
    "php": ">=8.0",
    "laravel/framework": ">=8.0",
    "kakaprodo/custom-data": ">=2.3.3 || dev-develop",
    "php-amqplib/php-amqplib": "^3.7"
}
```

We assume that you have RabbitMQ installed on your computer.

## Installation

Run the following Composer command:

```bash
composer require kakaprodo/laravel-message-broker
```

## Setup

### 1. Publish Package Files

Before using the package, publish its configuration and route files:

```bash
php artisan message-broker:install
```

This will publish:

- `config/message-broker.php`
- `routes/message-broker.php`

### 2. Configure Environment Variables

Add the following RabbitMQ connection settings to your `.env` file:

```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_VHOST='/'
```

## Usage

### Sending Messages

You can send messages to a specific subscriber or broadcast to multiple subscribers.

#### Send Direct Message

Use the `sendTo` method to send a message to a specific subscriber by providing the `exchange_name`, `payload_message`, and `routing_key`.

```php
use Kakaprodo\MessageBroker\Facades\MessageBroker;

$exchangeName = "order-lifecycle";
$payloadMessage = ['message' => "order created"];
$routingKey = "created";

MessageBroker::sendTo($exchangeName, $payloadMessage, $routingKey);
```

#### Broadcast Message

Use the `broadcast` method to send a message to all subscribers of an exchange.

```php
use Kakaprodo\MessageBroker\Facades\MessageBroker;

$exchangeName = "hello-world";
$payloadMessage = ['message' => "It's a new day"];

MessageBroker::broadcast($exchangeName, $payloadMessage);
```

### Subscribing to Exchanges

You can subscribe to `fanout` (broadcast), `direct`, and `topic` messages. Define routes in `routes/message-broker.php`.

#### Broadcasted Messages

Subscribe to broadcast messages using `any`:

```php
use Kakaprodo\MessageBroker\Brokers\RabbitMq\Routing\Route;
use Kakaprodo\MessageBroker\Brokers\RabbitMq\Data\MessageData;

$exchangeName = "hello-world";

Route::make()->any()->subscribe($exchangeName, function (MessageData $dataMessage) {
    dump($dataMessage->payload, $dataMessage->getRawPayload());
});
```

#### Direct Messages

Subscribe to a direct message by specifying the `exchange_name` and `routing_key`:

```php
use Kakaprodo\MessageBroker\Brokers\RabbitMq\Routing\Route;
use Kakaprodo\MessageBroker\Brokers\RabbitMq\Data\MessageData;

$exchangeName = 'order-lifecycle';
$routingKey = "created";

Route::make()
    ->subscribe($exchangeName)
    ->listenTo($routingKey, function (MessageData $dataMessage) {
        dump($dataMessage->payload);
    });
```

Subscribe to multiple routing keys:

```php
Route::make()
    ->subscribe('order-lifecycle')
    ->listenToMany([
        'created' => function (MessageData $dataMessage) {
            dump($dataMessage->payload);
        },
        'paid' => MyOrderPaidAction::class,
    ]);
```

#### Topic Messages

Subscribe to topic messages by specifying the topic exchange and routing key:

```php
use Kakaprodo\MessageBroker\Brokers\RabbitMq\Routing\Route;

Route::make()
    ->topic()
    ->subscribe($topicExchange)
    ->listenTo($topicRoutingKey, function (MessageData $dataMessage) {
        dump($dataMessage->payload);
    });
```

### Message Handlers

The package supports three types of handlers:

1. **Closure Handler**

    ```php
    $handler = function (MessageData $dataMessage) {
        dump($dataMessage->payload);
    };

    Route::make()
        ->subscribe($exchangeName)
        ->listenTo($routingKey, $handler);
    ```

2. **PHP Action Classes**

    The class should have a `handle` method:

    ```php
    use Kakaprodo\MessageBroker\Brokers\RabbitMq\Data\MessageData;

    class MyOrderPaidAction
    {
        public function handle(MessageData $dataMessage)
        {
            dump($dataMessage->payload);
        }
    }

    Route::make()
        ->subscribe($exchangeName)
        ->listenTo($routingKey, MyOrderPaidAction::class);
    ```

3. **Custom Data Action Classes (`kakaprodo/custom-data`)**

    ```php
    use Kakaprodo\CustomData\CustomData;
    use Kakaprodo\CustomData\Helpers\CustomActionBuilder;
    use Kakaprodo\MessageBroker\Brokers\RabbitMq\Data\MessageData;

    class MyOrderPaidData extends CustomData
    {
        protected function expectedProperties(): array
        {
            return [
                'data_message' => $this->property(MessageData::class),
                'order_number' => $this->property()->number(),
            ];
        }
    }

    class MyOrderPaidAction extends CustomActionBuilder
    {
        public function handle(MyOrderPaidData $data)
        {
            dump($data->all());
        }
    }

    Route::make()
        ->subscribe($exchangeName)
        ->listenTo($routingKey, MyOrderPaidAction::class);
    ```

## Consuming Messages

After defining your subscription routes, you can start processing published messages using the following Artisan command:

```bash
php artisan message-broker:consume
```

If there are any messages that are stuck and you want to acknowledge them so they are not repeatedly pulled, use the `--ack` flag:

```bash
php artisan message-broker:consume --ack
```
