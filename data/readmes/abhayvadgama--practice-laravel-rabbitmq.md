# Laravel 12 + RabbitMQ Demo

A demo project showcasing RabbitMQ integration with Laravel 12 using the Queue system.

## Features

- Order processing via RabbitMQ queues
- Email notification jobs dispatched to RabbitMQ
- Failed job handling
- Dead Letter Queue (DLQ) setup
- Multiple queue priorities
- REST API to trigger jobs

## Architecture

```
HTTP Request → Laravel Controller → Dispatch Job → RabbitMQ Exchange
                                                         ↓
                                              Queue Worker → Process Job
```

## Requirements

- PHP 8.2+
- Composer
- RabbitMQ 3.x
- Laravel 12

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd laravel-rabbitmq-demo
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Start RabbitMQ via Docker

```bash
docker-compose up -d rabbitmq
```

RabbitMQ Management UI: http://localhost:15672 (guest/guest)

### 3. Configure Environment

Update `.env`:
```env
QUEUE_CONNECTION=rabbitmq

RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/
RABBITMQ_LOGIN=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=default
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Start Queue Worker

```bash
# Process all queues
php artisan queue:work rabbitmq

# Process specific queue with priority
php artisan queue:work rabbitmq --queue=high,default,low

# With supervisor (recommended for production)
# See supervisor.conf
```

### 6. Start Laravel Dev Server

```bash
php artisan serve
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order (dispatches OrderProcessed job) |
| POST | `/api/notifications` | Send a notification (dispatches SendNotification job) |
| POST | `/api/reports` | Generate report (dispatches GenerateReport on low priority) |
| GET  | `/api/jobs/status` | View failed jobs count |

### Example Requests

**Place an Order:**
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"product": "Laptop", "quantity": 2, "customer_email": "john@example.com"}'
```

**Send Notification:**
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"type": "email", "recipient": "jane@example.com", "message": "Your order shipped!"}'
```

**Generate Report (low priority):**
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"type": "monthly_sales", "month": "2025-01"}'
```

## Queue Structure

| Queue | Priority | Purpose |
|-------|----------|---------|
| `high` | High | Critical alerts, payment confirmations |
| `default` | Normal | Order processing, notifications |
| `low` | Low | Report generation, analytics |

## Project Structure

```
app/
├── Http/Controllers/Api/
│   ├── OrderController.php
│   ├── NotificationController.php
│   └── ReportController.php
├── Jobs/
│   ├── ProcessOrder.php
│   ├── SendNotification.php
│   └── GenerateReport.php
├── Models/
│   └── Order.php
config/
└── queue.php          # RabbitMQ connection config
docker-compose.yml     # RabbitMQ + Laravel setup
supervisor.conf        # Production worker config
```

## Dead Letter Queue

Failed jobs are automatically routed to `failed_jobs` table AND a `dead_letter` RabbitMQ queue. Configure in `config/queue.php`:

```php
'rabbitmq' => [
    'queue' => env('RABBITMQ_QUEUE', 'default'),
    'options' => [
        'queue' => [
            'arguments' => [
                'x-dead-letter-exchange' => ['S', 'dead_letter'],
            ],
        ],
    ],
],
```

## Monitoring

- **RabbitMQ UI**: http://localhost:15672
- **Laravel Horizon** (optional): `composer require laravel/horizon` then `php artisan horizon`
