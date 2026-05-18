# Queue Schema Validator

> **Real-time message validation for already distributed monoliths and microservices**

A powerful, framework-agnostic validation engine that ensures message integrity across your distributed systems. Validate messages sent/received via RabbitMQ, HTTP endpoints, or any async communication channel with **instant, actionable error feedback**.

## 🎯 The Problem

In distributed monoliths and microservice architectures, messages flow between services without validation. This leads to:

- ❌ Silent failures or weird behaviour when consumers receive malformed data
- ❌ Orphaned messages in queues
- ❌ Data corruption cascading through multiple services
- ❌ Hours of debugging to trace the source of the problem
- ❌ No clear contract between producer and consumer

## ✅ The Solution

**Queue Schema Validator** acts as a **central validation hub** for all your inter-service communication. Define schemas once, validate everywhere—with **real-time error reporting**.

```
Publisher Service          Queue Schema Validator        Consumer Service
       |                           |                            |
       |-- publish message ------->|                            |
       |                    ✓ Valid|-- forward message -------->|
       |                           |                            |
       |-- publish bad message --->|                            |
       |                    ✗ Invalid - Return errors           |
       |                           |                            |
```

## 📦 Installation

Install the package via Composer:

```bash
composer require glacueva/laravel-queue-schema
```

Publish configuration and migrations:

```bash
php artisan vendor:publish --provider="Glacueva\LaravelQueueSchema\Providers\QueueSchemaServiceProvider" --tag="queue-schema-config"
php artisan vendor:publish --provider="Glacueva\LaravelQueueSchema\Providers\QueueSchemaServiceProvider" --tag="queue-schema-migrations"
```

Run migrations:

```bash
php artisan migrate
```

## 🚀 Quick Start

### Define Schemas Using data.json (Recommended)

The package includes a **seeder** that automatically loads schemas from a `data.json` file. This is the recommended approach for managing your schemas declaratively.

1. **Publish the seeder data**:

```bash
php artisan vendor:publish --provider="Glacueva\LaravelQueueSchema\Providers\QueueSchemaServiceProvider" --tag="queue-schema-data"
```

2. **Edit your `resources/schemas/data.json`**:

```json
[
    {
        "publisher": "user-service",
        "consumers": ["email-service", "analytics-service", "notification-service"],
        "rules": [
            {
                "field": "user_id",
                "validation": ["required", "integer"]
            },
            {
                "field": "email",
                "validation": ["required", "email", "max:255"]
            },
            {
                "field": "name",
                "validation": ["required", "string", "min:3", "max:255"]
            },
            {
                "field": "timestamp",
                "validation": ["required", "date_format:Y-m-d H:i:s"]
            }
        ]
    },
    {
        "publisher": "order-service",
        "consumers": ["payment-service", "inventory-service"],
        "rules": [
            {
                "field": "order_id",
                "validation": ["required", "integer"]
            },
            {
                "field": "total_amount",
                "validation": ["required", "numeric", "min:0"]
            }
        ]
    }
]
```

3. **Run the seeder**:

```bash
php artisan db:seed --class="Database\\Seeders\\QueueSchemasTableSeeder"
# Or if running all seeders:
php artisan db:seed
```

**Why use `data.json`?**
- 📄 Version control your schemas alongside your code
- 🔄 Easy to share schemas between teams/services
- 🚀 Reproducible environments (dev, staging, production)
- 💾 Single source of truth for all message contracts

### Define a Schema Programmatically

Alternatively, define schemas directly in code:

```php
use Glacueva\LaravelQueueSchema\Infrastructure\Schema\Models\QueueSchema;

QueueSchema::create([
    'id' => 'user-created-v1',
    'publisher' => 'user-service',
    'consumers' => ['email-service', 'analytics-service', 'notification-service'],
    'version' => '1.0.0',
    'rules' => [
        ['field' => 'user_id', 'validation' => ['required', 'integer', 'exists:users,id']],
        ['field' => 'email', 'validation' => ['required', 'email', 'max:255']],
        ['field' => 'name', 'validation' => ['required', 'string', 'min:3', 'max:255']],
        ['field' => 'timestamp', 'validation' => ['required', 'date_format:Y-m-d H:i:s']],
    ],
]);
```

### Validate in Your Application

```php
use Glacueva\LaravelQueueSchema\Application\Message\Validate\MessageValidationService;

$validator = app(MessageValidationService::class);

try {
    // Validate as publisher
    $validatedData = $validator->publisher('user-service', [
        'user_id' => 1,
        'email' => 'john@example.com',
        'name' => 'John Doe',
        'timestamp' => now()->format('Y-m-d H:i:s'),
    ]);
    
    // ✓ Data is valid - safe to publish
    $queue->publish('user.created', $validatedData);
    
} catch (\Glacueva\LaravelQueueSchema\Domain\Schema\Exception\InvalidSchemaException $e) {
    // ✗ Validation failed - return errors to client immediately
    return response()->json([
        'error' => 'Invalid message format',
        'violations' => $e->getErrors(),
    ], 422);
}
```

### Validate on Consumer Side

```php
// In your message handler
try {
    $validatedData = $validator->consumer('email-service', $message);
    
    // Process the guaranteed-valid message
    $this->sendEmail($validatedData);
    
} catch (InvalidSchemaException $e) {
    // Dead-letter queue this message
    $deadLetterQueue->push($message, $e->getErrors());
    logger()->warning('Invalid message received', $e->getErrors());
}
```

## 🏗️ Architecture

This package implements **Hexagonal Architecture** (Ports & Adapters) for maximum flexibility:

```
┌─────────────────────────────────────────────────────┐
│              Domain Layer (Pure Business)            │
│  • Schema (Entity) • SchemaRepository (Port)         │
│  • Value Objects • Domain Exceptions                 │
│  ⚠️  Zero external dependencies                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         Application Layer (Use Cases)                │
│  • MessageValidationService                         │
│  • MessageValidator • MessageValidateHandler        │
│  📌 Orchestrates validation flows                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      Infrastructure Layer (Implementations)          │
│  • EloquentSchemaRepository (Adapter)               │
│  • LaravelValidatorAdapter                          │
│  🔌 Swappable, replaceable implementations          │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ **Testable**: Domain logic tested without frameworks
- ✅ **Portable**: Use in any PHP environment
- ✅ **Extendable**: Swap implementations easily
- ✅ **Clean**: No framework bleeding into business logic

## 💾 Storage: SQL & NoSQL Support

### SQL (Eloquent - Default)

Works out of the box with all Laravel databases:

```php
// SQLite (testing)
// MySQL
// PostgreSQL
// SQL Server
```

### NoSQL (MongoDB, DynamoDB, etc.)

Switch to your preferred NoSQL store by creating a custom adapter:

```php
namespace App\Infrastructure\Schema;

use Glacueva\LaravelQueueSchema\Domain\Schema\SchemaRepository;

class MongoSchemaRepository implements SchemaRepository
{
    public function getById(string $id): Schema
    {
        $doc = DB::collection('schemas')->find(['_id' => $id])->first();
        return Schema::fromArray($doc->toArray());
    }
    
    // Implement other methods...
}

// Register in service provider
$this->app->bind(SchemaRepository::class, MongoSchemaRepository::class);
```

## 🔌 Integration Examples

### With RabbitMQ (via `laravel-queue`)

```php
// In your RabbitMQ consumer
Queue::exceptionCallback(function (Throwable $exception) {
    if ($exception instanceof InvalidSchemaException) {
        // Send validation errors to error topic
        Bus::dispatch(new LogValidationError($exception->getErrors()));
    }
});
```

### With HTTP Endpoints

```php
// In your API controller
Route::post('/events/user-created', function (Request $request) {
    try {
        $validated = app(MessageValidationService::class)
            ->publisher('user-service', $request->all());
        
        event(new UserCreated($validated));
        return response()->json(['status' => 'processed']);
        
    } catch (InvalidSchemaException $e) {
        return response()->json([
            'status' => 'validation_failed',
            'errors' => $e->getErrors(),
        ], 422);
    }
});
```

### With Async Job Queues

```php
class ProcessUserMessage implements ShouldQueue
{
    public function handle(MessageValidationService $validator)
    {
        $validated = $validator->consumer('email-service', $this->message);
        // Process validated message
    }
}
```

## 📋 API Reference

### MessageValidationService

#### `publisher(string $publisher, array $message): array`
Validate a message from a specific publisher. Returns validated data.

```php
$validator->publisher('user-service', $data);
// Returns: array (validated data with only schema-defined fields)
// Throws: InvalidSchemaException on validation failure
```

#### `consumer(string $consumer, array $message): array`
Validate a message for a specific consumer. Returns validated data.

```php
$validator->consumer('email-service', $data);
// Returns: array (validated data)
// Throws: InvalidSchemaException on validation failure
```

### SchemaRepository

#### `getById(string $id): Schema`
Fetch a schema by its unique identifier.

```php
$repo->getById('user-created-v1');
// Throws: SchemaNotFoundException if not found
```

#### `getByPublisher(string $publisher): Schema`
Fetch the schema for a publisher service.

```php
$repo->getByPublisher('user-service');
// Throws: SchemaNotFoundException if not found
```

#### `getByConsumer(string $consumer): Schema`
Fetch the schema for a consumer service.

```php
$repo->getByConsumer('email-service');
// Throws: SchemaNotFoundException if not found
```

#### `all(): array`
Fetch all registered schemas.

```php
$schemas = $repo->all();
// Returns: array<int, Schema>
```

## 🛠️ Use as Standalone Microservice

You can run this as a **completely independent microservice** in your infrastructure:

### Option 1: Standalone Validation Service

```bash
# Clone/fork the repository
git clone https://github.com/glacueva/laravel-queue-schema.git
cd laravel-queue-schema

# Set up as Laravel app
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Expose HTTP API
php artisan serve --port=8001
```

Then validate from any service:

```php
// In any service (Laravel or not)
$response = Http::post('http://validation-service:8001/api/validate', [
    'schema_id' => 'user-created-v1',
    'role' => 'publisher', // or 'consumer'
    'data' => $message,
]);

if ($response->ok()) {
    // Message is valid
} else {
    // Log validation errors
}
```

### Option 2: Embedded Package

Include it directly in your monolith or any Laravel service:

```bash
composer require glacueva/laravel-queue-schema
php artisan vendor:publish --tag="queue-schema-*"
php artisan migrate
```

### Option 3: Fork & Customize

The package is **open-source under MIT license**. You're free to:

✅ Fork the repository
✅ Modify for your specific needs
✅ Deploy as your own microservice
✅ Extend with custom validators
✅ Keep it private or open-source

```bash
# Example: Add custom validation rules
git clone <your-fork>
# Add your validation logic
# Deploy to your infrastructure
```

## 📊 Validation Rules

Use any **Laravel validation rule**:

```php
'rules' => [
    'required',                    // Field must exist
    'email',                       // Valid email format
    'numeric',                     // Numeric value
    'integer',                     // Integer value
    'string',                      // String value
    'array',                       // Array value
    'min:3',                       // Minimum length/value
    'max:255',                     // Maximum length/value
    'regex:/pattern/',             // Regex pattern
    'exists:users,id',             // Exists in DB (SQL only)
    'unique:users,email',          // Unique in DB (SQL only)
    'date_format:Y-m-d H:i:s',    // Date format validation
    'after:2024-01-01',            // Date validation
    'json',                        // Valid JSON
    'url',                         // Valid URL
    'ip',                          // Valid IP address
    // ... and 50+ more Laravel validation rules
]
```

## 🧪 Testing

```bash
php vendor/bin/pest
```

The package includes comprehensive tests:
- ✅ Unit tests for domain logic
- ✅ Integration tests with database
- ✅ Feature tests for validation scenarios
- ✅ 25+ assertions covering all functionality

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report issues
- Submit pull requests
- Fork and create your own distribution
- Use as a foundation for your microservice

---

**Built with ❤️ for distributed systems that deserve better validation.**
