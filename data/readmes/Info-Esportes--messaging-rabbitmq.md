# Messaging Core

[![Tests](https://github.com/infoesportes/messaging-rabbitmq/workflows/Tests/badge.svg)](https://github.com/infoesportes/messaging-rabbitmq/actions)
[![Latest Stable Version](https://poser.pugx.org/infoesportes/messaging-rabbitmq/v)](https://packagist.org/packages/infoesportes/messaging-rabbitmq)
[![License](https://poser.pugx.org/infoesportes/messaging-rabbitmq/license)](https://packagist.org/packages/infoesportes/messaging-rabbitmq)

Framework-agnostic messaging core for RabbitMQ with support for Email, SMS, and WhatsApp.

## Features

- ✅ Framework-agnostic (use with Laravel, CodeIgniter, Symfony, etc.)
- ✅ RabbitMQ with topic exchange
- ✅ Email, SMS, WhatsApp support
- ✅ Message validation
- ✅ Priority queues (1-10)
- ✅ Message publishing & consuming
- ✅ Automatic reconnection
- ✅ Manual & automatic acknowledgment
- ✅ Configurable prefetch count
- ✅ Full test coverage
- ✅ Type-safe with strict typing
- ✅ PSR-4 autoloading

## Requirements

- PHP 7.4 or higher (7.4, 8.0, 8.1, 8.2, 8.3)
- ext-json
- RabbitMQ server

## Installation

```bash
composer require infoesportes/messaging-rabbitmq
```

## Quick Start

### Publishing Messages

```php
<?php

use InfoEsportes\Messaging\Publisher\RabbitMQPublisher;
use InfoEsportes\Messaging\Core\MessagePriority;

$config = [
    'host' => '127.0.0.1',
    'port' => 5672,
    'user' => 'guest',
    'password' => 'guest',
    'vhost' => '/',
    'exchange' => 'messages.topic',
];

$publisher = new RabbitMQPublisher($config, 'my-app');

// Send an email
$publisher->sendEmail(
    'user@example.com',
    'Welcome!',
    '<h1>Welcome to our service</h1>',
    [
        'template' => 'welcome',
        'variables' => ['name' => 'John'],
    ],
    'email.transactional',
    MessagePriority::HIGH
);

// Send an SMS
$publisher->sendSMS(
    '+5511999999999',
    'Your verification code is: 123456',
    'sms.notification',
    MessagePriority::URGENT
);

// Send a WhatsApp message
$publisher->sendWhatsApp(
    '+5511999999999',
    'Your order has been shipped!',
    'whatsapp.notification',
    'https://example.com/tracking.jpg',
    MessagePriority::NORMAL
);
```

### Consuming Messages

```php
<?php

use InfoEsportes\Messaging\Consumer\RabbitMQConsumer;
use PhpAmqpLib\Message\AMQPMessage;

$config = [
    'host' => '127.0.0.1',
    'port' => 5672,
    'user' => 'guest',
    'password' => 'guest',
    'vhost' => '/',
    'exchange' => 'messages.topic',
    'prefetch_count' => 10,
    'auto_ack' => false, // Manual acknowledgment
];

$consumer = new RabbitMQConsumer($config);

// Declare a queue and bind routing keys
$consumer->declareQueue(
    'email.queue',
    ['email.#'],  // Routing keys to bind
    true,         // Durable
    false,        // Exclusive
    false,        // Auto-delete
    10            // Max priority
);

// Start consuming
$consumer->consume('email.queue', function (AMQPMessage $msg, $consumer) {
    $data = json_decode($msg->getBody(), true);
    
    echo "Processing message: " . $data['id'] . "\n";
    
    try {
        // Process your message here
        processEmail($data);
        
        // Message is automatically acknowledged on success
    } catch (\Exception $e) {
        // On error, message is rejected and requeued
        echo "Error: " . $e->getMessage() . "\n";
        throw $e;
    }
});
```

### Manual Acknowledgment

```php
$config = [
    'host' => '127.0.0.1',
    'port' => 5672,
    'user' => 'guest',
    'password' => 'guest',
    'vhost' => '/',
    'exchange' => 'messages.topic',
    'auto_ack' => false,
];

$consumer = new RabbitMQConsumer($config);
$consumer->declareQueue('my.queue', ['my.routing.key']);

$consumer->consume('my.queue', function (AMQPMessage $msg) use ($consumer) {
    $data = json_decode($msg->getBody(), true);
    
    if (shouldProcess($data)) {
        processMessage($data);
        // Acknowledge manually (though automatic in callback)
    } else {
        // Reject and requeue
        $consumer->nack($msg, true);
    }
});
```

## Configuration Options

### Publisher Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | string | `127.0.0.1` | RabbitMQ host |
| `port` | int | `5672` | RabbitMQ port |
| `user` | string | `guest` | Username |
| `password` | string | `guest` | Password |
| `vhost` | string | `/` | Virtual host |
| `exchange` | string | `messages.topic` | Exchange name |
| `connection_timeout` | float | `3.0` | Connection timeout (seconds) |
| `read_timeout` | float | `3.0` | Read timeout (seconds) |
| `write_timeout` | float | `3.0` | Write timeout (seconds) |
| `heartbeat` | int | `30` | Heartbeat interval (seconds) |
| `keepalive` | bool | `true` | Enable TCP keepalive |

### Consumer Configuration

All publisher options plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefetch_count` | int | `1` | Number of messages to prefetch |
| `auto_ack` | bool | `false` | Automatic message acknowledgment |
| `no_local` | bool | `false` | Don't receive messages published by this connection |
| `exclusive` | bool | `false` | Request exclusive consumer access |
| `no_wait` | bool | `false` | Don't wait for server confirmation |

## Message Priorities

Use the `MessagePriority` class for standardized priorities:

```php
use InfoEsportes\Messaging\Core\MessagePriority;

MessagePriority::LOWEST;    // 1
MessagePriority::LOW;       // 3
MessagePriority::NORMAL;    // 5
MessagePriority::HIGH;      // 7
MessagePriority::URGENT;    // 9
MessagePriority::CRITICAL;  // 10
```

## Routing Keys

The library uses topic exchanges with the following routing key patterns:

- `email.transactional` - Transactional emails (receipts, confirmations)
- `email.marketing` - Marketing emails
- `email.notification` - Email notifications
- `sms.notification` - SMS notifications
- `sms.verification` - SMS verification codes
- `whatsapp.notification` - WhatsApp notifications
- `whatsapp.marketing` - WhatsApp marketing messages

Use `#` for wildcard routing, e.g., `email.#` matches all email types.

## Testing

```bash
# Run tests
composer test

# Run tests with coverage
composer test-coverage

# Run static analysis
composer phpstan

# Fix code style
composer cs-fix

# Check code style
composer cs-check
```

## Framework Integration

### Laravel

Create a service provider:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use InfoEsportes\Messaging\Publisher\RabbitMQPublisher;
use InfoEsportes\Messaging\Consumer\RabbitMQConsumer;

class MessagingServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(RabbitMQPublisher::class, function ($app) {
            return new RabbitMQPublisher([
                'host' => config('rabbitmq.host'),
                'port' => config('rabbitmq.port'),
                'user' => config('rabbitmq.user'),
                'password' => config('rabbitmq.password'),
                'vhost' => config('rabbitmq.vhost'),
                'exchange' => config('rabbitmq.exchange'),
            ], config('app.name'));
        });
        
        $this->app->singleton(RabbitMQConsumer::class, function ($app) {
            return new RabbitMQConsumer([
                'host' => config('rabbitmq.host'),
                'port' => config('rabbitmq.port'),
                'user' => config('rabbitmq.user'),
                'password' => config('rabbitmq.password'),
                'vhost' => config('rabbitmq.vhost'),
                'exchange' => config('rabbitmq.exchange'),
                'prefetch_count' => config('rabbitmq.prefetch_count', 10),
            ]);
        });
    }
}
```

### CodeIgniter 4

Add to `app/Config/Services.php`:

```php
<?php

namespace Config;

use CodeIgniter\Config\BaseService;
use InfoEsportes\Messaging\Publisher\RabbitMQPublisher;
use InfoEsportes\Messaging\Consumer\RabbitMQConsumer;

class Services extends BaseService
{
    public static function messagePublisher($getShared = true)
    {
        if ($getShared) {
            return static::getSharedInstance('messagePublisher');
        }

        $config = config('RabbitMQ');
        return new RabbitMQPublisher($config->toArray(), 'my-app');
    }
    
    public static function messageConsumer($getShared = true)
    {
        if ($getShared) {
            return static::getSharedInstance('messageConsumer');
        }

        $config = config('RabbitMQ');
        return new RabbitMQConsumer($config->toArray());
    }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/infoesportes/messaging-rabbitmq/issues)
- **Source**: [GitHub Repository](https://github.com/infoesportes/messaging-rabbitmq)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Developed and maintained by [Info Esportes](https://github.com/Info-Esportes).
