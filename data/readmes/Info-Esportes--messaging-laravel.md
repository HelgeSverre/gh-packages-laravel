# Messaging Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/infoesportes/messaging-laravel.svg?style=flat-square)](https://packagist.org/packages/infoesportes/messaging-laravel)
[![Tests](https://github.com/Info-Esportes/messaging-laravel/workflows/Tests/badge.svg)](https://github.com/Info-Esportes/messaging-laravel/actions)
[![Total Downloads](https://img.shields.io/packagist/dt/infoesportes/messaging-laravel.svg?style=flat-square)](https://packagist.org/packages/infoesportes/messaging-laravel)

Laravel adapter for InfoEsportes messaging microservice with RabbitMQ. Provides Horizon integration for Email, SMS, and WhatsApp messaging.

## Features

- 🚀 **RabbitMQ Integration** - Topic exchange with routing keys
- 📧 **Email Support** - Transactional and marketing emails
- 📱 **SMS Support** - OTP and alerts
- 💬 **WhatsApp Support** - Notifications and support messages
- 🔄 **Laravel Horizon** - Queue monitoring and management
- ⚡ **Background Jobs** - Async processing with Laravel queues
- 🎯 **Routing Keys** - Flexible message routing
- 🛡️ **Reliability** - Quorum queues for high availability

## Architecture

```
CodeIgniter/Laravel → Plain JSON → RabbitMQ
                                      ↓
                    Consumer (ACK immediately)
                                      ↓
                    Dispatch Laravel Job
                                      ↓
                    Redis/Database Queue (Horizon)
                                      ↓
                    ProcessEmailJob/ProcessSMSJob/ProcessWhatsAppJob
```

## Installation

```bash
composer require infoesportes/messaging-laravel
```

### Publish Configuration

```bash
php artisan vendor:publish --tag=messaging-config
```

### Environment Variables

Add to your `.env` file:

```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
RABBITMQ_EXCHANGE=messages.topic
RABBITMQ_PREFETCH_COUNT=10
RABBITMQ_CONSUMER_TAG=laravel_consumer

MESSAGING_QUEUE_CONNECTION=redis
MESSAGING_QUEUE_NAME=messaging
```

## Usage

### Publishing Messages

#### Using Facade

```php
use Infoesportes\Messaging\Laravel\Facades\Messaging;

// Email - Transactional
Messaging::publishEmail('transactional', [
    'to' => 'user@example.com',
    'subject' => 'Your Invoice',
    'body' => 'Invoice details...',
]);

// Email - Marketing
Messaging::publishEmail('marketing', [
    'to' => 'user@example.com',
    'subject' => 'Newsletter',
    'template' => 'newsletter',
]);

// SMS - OTP
Messaging::publishSms('otp', [
    'to' => '+5511999999999',
    'code' => '123456',
]);

// SMS - Alert
Messaging::publishSms('alert', [
    'to' => '+5511999999999',
    'message' => 'Urgent alert!',
]);

// WhatsApp - Notification
Messaging::publishWhatsApp('notification', [
    'to' => '+5511999999999',
    'message' => 'You have a new message',
]);

// WhatsApp - Support
Messaging::publishWhatsApp('support', [
    'to' => '+5511999999999',
    'message' => 'Support ticket created',
]);
```

#### Using Service Container

```php
$messaging = app('messaging');

$messaging->publish('email.transactional', [
    'to' => 'user@example.com',
    'subject' => 'Custom Email',
]);
```

### Consuming Messages

Start the consumer for each queue type:

```bash
# Consume email messages
php artisan messaging:consume email

# Consume SMS messages
php artisan messaging:consume sms

# Consume WhatsApp messages
php artisan messaging:consume whatsapp

# With timeout (in seconds)
php artisan messaging:consume email --timeout=3600
```

### Supervisor Configuration

Create `/etc/supervisor/conf.d/messaging-consumer.conf`:

```ini
[program:messaging-email-consumer]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan messaging:consume email
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/messaging-email-consumer.log

[program:messaging-sms-consumer]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan messaging:consume sms
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/messaging-sms-consumer.log

[program:messaging-whatsapp-consumer]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan messaging:consume whatsapp
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/messaging-whatsapp-consumer.log
```

Then reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start messaging-email-consumer:*
sudo supervisorctl start messaging-sms-consumer:*
sudo supervisorctl start messaging-whatsapp-consumer:*
```

## Routing Keys

The package uses the following routing key structure:

### Email
- `email.transactional` - Invoices, receipts, confirmations
- `email.marketing` - Newsletters, promotions

### SMS
- `sms.otp` - One-time passwords, verification codes
- `sms.alert` - Urgent alerts, notifications

### WhatsApp
- `whatsapp.notification` - General notifications
- `whatsapp.support` - Support messages, tickets

## Job Processing

The consumer dispatches jobs to Laravel's queue system. Customize the job classes:

### ProcessEmailJob

```php
namespace Infoesportes\Messaging\Laravel\Jobs;

use Illuminate\Support\Facades\Mail;

class ProcessEmailJob implements ShouldQueue
{
    public function handle(): void
    {
        // Implement your email sending logic
        Mail::to($this->data['to'])
            ->send(new YourMailable($this->data));
    }
}
```

### ProcessSMSJob

```php
public function handle(): void
{
    // Implement your SMS provider logic
    $smsProvider = app(SMSProviderInterface::class);
    $smsProvider->send($this->data['to'], $this->data['message']);
}
```

### ProcessWhatsAppJob

```php
public function handle(): void
{
    // Implement your WhatsApp provider logic
    $whatsappProvider = app(WhatsAppProviderInterface::class);
    $whatsappProvider->send($this->data['to'], $this->data['message']);
}
```

## Testing

```bash
composer test
```

## Code Style

```bash
composer format
```

## Configuration

See [config/messaging.php](src/config/messaging.php) for all available options.

Key configuration sections:
- **RabbitMQ Connection** - Host, port, credentials
- **Exchange Configuration** - Topic exchange settings
- **Queue Configuration** - Queue names, routing keys, durability
- **Consumer Configuration** - Prefetch count, consumer tag
- **Job Mapping** - Map queue types to job classes

## Horizon Integration

This package works seamlessly with Laravel Horizon. Jobs dispatched from the RabbitMQ consumer appear in Horizon for monitoring:

1. Install Horizon: `composer require laravel/horizon`
2. Publish config: `php artisan horizon:install`
3. Start Horizon: `php artisan horizon`
4. View dashboard: `http://your-app.test/horizon`

## Requirements

- PHP 8.1 or higher
- Laravel 10.x or 11.x
- RabbitMQ 3.8 or higher
- Redis (for queue driver)

## Credits

- [Lucas Pinheiro](https://github.com/zluckx)
- [InfoEsportes](https://github.com/Info-Esportes)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
