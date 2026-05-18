# Laravel OpenTelemetry Package

A comprehensive OpenTelemetry integration package for Laravel applications that provides complete observability through distributed tracing, metrics collection, and visualization. This package enables you to monitor your application's performance, track requests across microservices, and identify bottlenecks in your Laravel application.

**Learn more about OpenTelemetry:**
- [OpenTelemetry Official Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry PHP Documentation](https://opentelemetry.io/docs/languages/php/)

## 🚀 Features

- **Easy Integration**: Single composer require + artisan publish
- **Environment-Driven**: All settings configurable via .env variables
- **Complete Observability Stack**: Includes OpenTelemetry Collector, Tempo, and Grafana
- **Custom Tracing**: Simple TracerService for business logic tracing
- **Docker Ready**: Complete observability stack with Docker Compose
- **Laravel Integration**: Automatic service provider registration
- **Production Ready**: Configurable sampling, batching, and resource limits
- **Automatic Instrumentation**: PHP extension support for zero-code tracing
- **Error Tracking**: Automatic exception recording in traces
- **Test Routes**: Built-in test endpoints to verify integration

## 📋 Prerequisites

- **PHP 8.4+** (Laravel 11 with latest Symfony dependencies requires PHP 8.4)
- **Laravel 11.0+**
- **Docker & Docker Compose** (for observability stack)
- **OpenTelemetry PHP Extension** (required for automatic instrumentation)
- **Composer** (for package installation)

## 🛠️ Installation

> ⚠️ **CRITICAL**: The OpenTelemetry PHP extension must be installed BEFORE running `composer require`. The package installation will fail without it.

### Docker Environment (Recommended)

> **For Fresh Laravel Projects**: If you don't have Docker setup yet, create these files first:

**Create `Dockerfile`:**
```dockerfile
FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install OpenTelemetry extension
RUN pecl install opentelemetry && docker-php-ext-enable opentelemetry

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install dependencies
RUN composer install

# Set permissions
RUN chown -R www-data:www-data /var/www
```

**Create `docker-compose.yml`:**
```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www
    command: php artisan serve --host=0.0.0.0 --port=8000
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Step 1: Add Extension to Dockerfile (If Docker Already Exists)

Add the OpenTelemetry extension to your Dockerfile:

```dockerfile
# Install OpenTelemetry extension
RUN pecl install opentelemetry && docker-php-ext-enable opentelemetry

# Or copy the provided PHP configuration
COPY docker/php/20-otel.ini /usr/local/etc/php/conf.d/
```

#### Step 2: Rebuild Docker Container

```bash
docker-compose build app
```

#### Step 3: Install the Package

```bash
# Start the container
docker-compose up -d app

# Install the package inside the container
docker-compose exec app composer require mumzworld/laravel-opentelemetry
```

*Note: The service provider is automatically registered via Laravel's package auto-discovery.*

### Non-Docker Environment

#### Step 1: Install OpenTelemetry PHP Extension

**Using PECL (Most Common):**
```bash
# Install the extension
pecl install opentelemetry

# Add to your php.ini
echo "extension=opentelemetry" >> /path/to/php.ini

# Restart your web server
sudo systemctl restart apache2  # or nginx/php-fpm
```

**Verify Installation:**
```bash
php -m | grep opentelemetry
# Should output: opentelemetry
```

#### Step 2: Install the Package

```bash
composer require mumzworld/laravel-opentelemetry
```

*Note: The service provider is automatically registered via Laravel's package auto-discovery.*

#### Step 4: Publish Configuration Files

> **Note**: The publish command creates a `.env.opentelemetry.example` file as a reference. You can safely delete this file after copying the variables to your `.env` file.

**For Docker Environment:**
```bash
# Publish all OpenTelemetry files
docker-compose exec app php artisan vendor:publish --provider="Mumzworld\LaravelOpenTelemetry\LaravelOpenTelemetryServiceProvider"

# Or publish specific components
docker-compose exec app php artisan vendor:publish --tag=opentelemetry-config
docker-compose exec app php artisan vendor:publish --tag=opentelemetry-docker
docker-compose exec app php artisan vendor:publish --tag=opentelemetry-bootstrap
docker-compose exec app php artisan vendor:publish --tag=opentelemetry-env
docker-compose exec app php artisan vendor:publish --tag=opentelemetry-test-routes
```

**For Non-Docker Environment:**
```bash
# Publish all OpenTelemetry files
php artisan vendor:publish --provider="Mumzworld\LaravelOpenTelemetry\LaravelOpenTelemetryServiceProvider"

# Or publish specific components
php artisan vendor:publish --tag=opentelemetry-config
php artisan vendor:publish --tag=opentelemetry-docker
php artisan vendor:publish --tag=opentelemetry-bootstrap
php artisan vendor:publish --tag=opentelemetry-env
php artisan vendor:publish --tag=opentelemetry-test-routes
```

#### Step 5: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Core OpenTelemetry Settings
OTEL_ENABLED=true
OTEL_SERVICE_NAME=${APP_NAME}
OTEL_SERVICE_VERSION=1.0.0
OTEL_ENVIRONMENT=${APP_ENV}

# Trace Export Settings
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_PROPAGATORS=baggage,tracecontext

# Sampling Configuration (adjust for production)
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=1.0

# PHP Extension Settings
OTEL_PHP_AUTOLOAD_ENABLED=true
OTEL_INSTRUMENTATION_ENABLED=true
OTEL_ATTR_HOOKS_ENABLED=true

# Debug Settings (disable in production)
OTEL_DEBUG=false
```

#### Step 6: Setup Docker Observability Stack

Add the OpenTelemetry services to your `docker-compose.yml`:

```yaml
# Include the OpenTelemetry stack
include:
  - docker/opentelemetry/docker-compose.opentelemetry.yml

services:
  app:
    environment:
      # OpenTelemetry configuration for your Laravel app
      OTEL_SERVICE_NAME: ${OTEL_SERVICE_NAME:-my-laravel-app}
      OTEL_TRACES_EXPORTER: ${OTEL_TRACES_EXPORTER:-otlp}
      OTEL_EXPORTER_OTLP_ENDPOINT: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://otel-collector:4318}
      OTEL_EXPORTER_OTLP_PROTOCOL: ${OTEL_EXPORTER_OTLP_PROTOCOL:-http/protobuf}
      OTEL_PROPAGATORS: ${OTEL_PROPAGATORS:-baggage,tracecontext}
      OTEL_PHP_AUTOLOAD_ENABLED: ${OTEL_PHP_AUTOLOAD_ENABLED:-true}
    networks:
      - app-network
    depends_on:
      - otel-collector

networks:
  app-network:
    driver: bridge
```

#### Step 7: Start the Observability Stack

```bash
# Create the external network (required for Docker services)
docker network create app-network

# Start the observability stack
docker-compose up -d otel-collector tempo grafana

# Start your application
docker-compose up -d app
```

#### Step 8: Verify Installation

```bash
# Check if services are running
docker-compose ps otel-collector tempo grafana

# Check Grafana is accessible
curl http://localhost:3000

# Test the integration (if test routes are published and enabled)
curl http://localhost:8000/api/opentelemetry/test
curl http://localhost:8000/api/opentelemetry/config
```

**If test routes return 404:**
1. Ensure you've added the test route inclusion to `routes/api.php`
2. Clear route cache: `docker-compose exec app php artisan route:clear`
3. Restart the app container: `docker-compose restart app`

## 🔍 Troubleshooting

### Common Issues

**1. No traces appearing in Grafana**

Check if services are running:
```bash
docker-compose ps otel-collector tempo grafana
```

Check collector logs:
```bash
docker-compose logs otel-collector
```

**2. PHP Extension not loading**

Verify OpenTelemetry extension is installed:
```bash
php -m | grep opentelemetry
```

Check PHP configuration:
```bash
php --ini
php -i | grep opentelemetry
```

**3. Traces not being exported**

Check environment variables:
```bash
php artisan tinker
>>> config('opentelemetry.enabled')
>>> config('opentelemetry.service.name')
>>> config('opentelemetry.exporter.otlp.endpoint')
```

Test with debug mode:
```bash
# Add to .env
OTEL_DEBUG=true
APP_DEBUG=true

# Check logs
tail -f storage/logs/laravel.log
```

**4. High memory usage**

Adjust sampling rate:
```env
OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces
```

## 🎯 Usage Examples

### Basic Custom Tracing

```php
<?php

namespace App\Services;

use Mumzworld\LaravelOpenTelemetry\Services\TracerService;

class UserService
{
    public function __construct(
        private TracerService $tracerService
    ) {}

    public function createUser(array $userData): User
    {
        return $this->tracerService->trace('user.create', function () use ($userData) {
            // Your business logic here
            $user = User::create($userData);
            
            // Send welcome email
            $this->sendWelcomeEmail($user);
            
            return $user;
        }, [
            'user.email' => $userData['email'],
            'user.type' => $userData['type'] ?? 'regular'
        ]);
    }

    private function sendWelcomeEmail(User $user): void
    {
        $this->tracerService->trace('email.welcome.send', function () use ($user) {
            Mail::to($user)->send(new WelcomeEmail($user));
        }, [
            'email.recipient' => $user->email,
            'email.type' => 'welcome'
        ]);
    }
}
```

### Controller Integration

```php
<?php

namespace App\Http\Controllers;

use Mumzworld\LaravelOpenTelemetry\Services\TracerService;

class ProductController extends Controller
{
    public function __construct(
        private TracerService $tracerService
    ) {}

    public function store(StoreProductRequest $request)
    {
        return $this->tracerService->trace('product.create', function () use ($request) {
            $product = Product::create($request->validated());
            
            // Process images
            if ($request->hasFile('images')) {
                $this->processProductImages($product, $request->file('images'));
            }
            
            // Update search index
            $this->updateSearchIndex($product);
            
            return new ProductResource($product);
        }, [
            'product.name' => $request->name,
            'product.category' => $request->category,
            'product.has_images' => $request->hasFile('images')
        ]);
    }

    private function processProductImages(Product $product, array $images): void
    {
        $this->tracerService->trace('product.images.process', function () use ($product, $images) {
            foreach ($images as $image) {
                // Process each image
                $this->tracerService->addSpan('product.image.upload', [
                    'image.size' => $image->getSize(),
                    'image.type' => $image->getMimeType()
                ]);
            }
        }, [
            'product.id' => $product->id,
            'images.count' => count($images)
        ]);
    }
}
```

### Database Query Tracing

```php
<?php

namespace App\Repositories;

use Mumzworld\LaravelOpenTelemetry\Services\TracerService;

class ProductRepository
{
    public function __construct(
        private TracerService $tracerService
    ) {}

    public function findWithFilters(array $filters): Collection
    {
        return $this->tracerService->trace('product.query.filtered', function () use ($filters) {
            $query = Product::query();
            
            if (isset($filters['category'])) {
                $query->where('category_id', $filters['category']);
            }
            
            if (isset($filters['price_range'])) {
                $query->whereBetween('price', $filters['price_range']);
            }
            
            return $query->get();
        }, [
            'query.filters' => json_encode($filters),
            'query.type' => 'product_search'
        ]);
    }
}
```

### Job Tracing

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Mumzworld\LaravelOpenTelemetry\Services\TracerService;

class ProcessOrderJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $orderId
    ) {}

    public function handle(TracerService $tracerService): void
    {
        $tracerService->trace('job.process_order', function () use ($tracerService) {
            $order = Order::findOrFail($this->orderId);
            
            // Process inventory
            $tracerService->trace('order.inventory.reserve', function () use ($order) {
                $this->reserveInventory($order);
            });
            
            // Send confirmation email
            $tracerService->trace('order.email.confirmation', function () use ($order) {
                Mail::to($order->customer)->send(new OrderConfirmation($order));
            });
            
            // Update analytics
            $tracerService->addSpan('order.analytics.update', [
                'order.value' => $order->total,
                'customer.type' => $order->customer->type
            ]);
            
        }, [
            'job.name' => 'ProcessOrderJob',
            'order.id' => $this->orderId
        ]);
    }
}
```

## 🧪 Testing the Integration

The package includes test routes to verify your OpenTelemetry setup:

### Test Routes

```bash
# Basic functionality test
curl http://your-host/api/opentelemetry/test

# Configuration verification
curl http://your-host/api/opentelemetry/config

# Error handling test
curl http://your-host/api/opentelemetry/error

# Nested spans test
curl http://your-host/api/opentelemetry/nested
```

### Enable Test Routes

Add to your `routes/api.php` (development only):

```php
// OpenTelemetry test routes (remove in production)
if (app()->environment(['local', 'testing'])) {
    require __DIR__ . '/opentelemetry-test.php';
}
```

> **Note**: After testing is complete, you can safely remove the `opentelemetry-test.php` file and the test route inclusion from `routes/api.php`. These files are only for setup verification and are not needed in production.

### Expected Test Responses

**Basic Test (`/api/opentelemetry/test`):**
```json
{
    "message": "OpenTelemetry tracing is working!",
    "service": "my-laravel-app",
    "endpoint": "http://otel-collector:4318",
    "timestamp": "2024-03-15T10:30:00.000000Z",
    "trace_enabled": true
}
```

**Configuration Test (`/api/opentelemetry/config`):**
```json
{
    "enabled": true,
    "service": {
        "name": "my-laravel-app",
        "version": "1.0.0",
        "environment": "local"
    },
    "environment_variables": {
        "OTEL_SERVICE_NAME": "my-laravel-app",
        "OTEL_TRACES_EXPORTER": "otlp",
        "OTEL_EXPORTER_OTLP_ENDPOINT": "http://otel-collector:4318"
    }
}
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OTEL_ENABLED` | `true` | Enable/disable OpenTelemetry |
| `OTEL_SERVICE_NAME` | `APP_NAME` | Service name for traces |
| `OTEL_SERVICE_VERSION` | `1.0.0` | Service version |
| `OTEL_ENVIRONMENT` | `APP_ENV` | Deployment environment |
| `OTEL_TRACES_EXPORTER` | `otlp` | Trace exporter type |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://otel-collector:4318` | OTLP endpoint |
| `OTEL_PROPAGATORS` | `baggage,tracecontext` | Trace propagators |
| `OTEL_TRACES_SAMPLER` | `parentbased_traceidratio` | Sampling strategy |
| `OTEL_TRACES_SAMPLER_ARG` | `1.0` | Sampling ratio (0.0-1.0) |
| `OTEL_PHP_AUTOLOAD_ENABLED` | `true` | Enable PHP auto-instrumentation |
| `OTEL_INSTRUMENTATION_ENABLED` | `true` | Enable instrumentation |

### Configuration File

The package publishes a configuration file at `config/opentelemetry.php`:

```php
return [
    'enabled' => env('OTEL_ENABLED', true),
    
    'service' => [
        'name' => env('OTEL_SERVICE_NAME', env('APP_NAME', 'laravel-app')),
        'version' => env('OTEL_SERVICE_VERSION', '1.0.0'),
        'environment' => env('OTEL_ENVIRONMENT', env('APP_ENV', 'production')),
    ],
    
    'traces' => [
        'exporter' => env('OTEL_TRACES_EXPORTER', 'otlp'),
        'sampler' => env('OTEL_TRACES_SAMPLER', 'parentbased_traceidratio'),
        'sampler_arg' => env('OTEL_TRACES_SAMPLER_ARG', 1.0),
    ],
    
    'exporter' => [
        'otlp' => [
            'endpoint' => env('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://otel-collector:4318'),
            'protocol' => env('OTEL_EXPORTER_OTLP_PROTOCOL', 'http/protobuf'),
        ],
    ],
    
    // ... more configuration options
];
```

## 🐳 Docker Integration

### Complete Stack

The package includes a complete observability stack:

```bash
# Start the observability stack
docker-compose up -d otel-collector tempo grafana

# Check service health
curl http://your-host:13133/  # Collector health check
curl http://your-host:3200/ready  # Tempo health check
curl http://your-host:3000/  # Grafana UI
```

### Service URLs

- **Grafana Dashboard**: http://your-host:3000 (admin/admin)
- **Tempo API**: http://your-host:3200
- **Collector Health**: http://your-host:13133
- **Test Routes**: http://your-host/api/opentelemetry/test

## 📊 Viewing Traces

### Grafana Dashboard

1. Open Grafana at http://your-host:3000
2. Login with admin/admin
3. Go to "Explore" → Select "Tempo" datasource
4. Search for traces by:
   - Service name: `{service.name="your-service-name"}`
   - HTTP operations: `{service.name="your-service-name" && name=~".*GET.*"}`
   - Slow traces: `{service.name="your-service-name" && duration>100ms}`

### Sample Trace Queries

```
# Find all traces for a specific service
{service.name="your-service-name"}
# or
{resource.service.name="your-service-name"}

# Find traces with errors
{service.name="your-service-name" && status=error}
# or
{resource.service.name="your-service-name" && status=error}

# Find slow traces (duration > 100ms)
{service.name="your-service-name" && duration>100ms}
# or
{resource.service.name="your-service-name" && duration>100ms}

# Find traces for specific HTTP methods
{service.name="your-service-name" && name=~".*GET.*"}
# or
{resource.service.name="your-service-name" && name=~".*GET.*"}

# Find traces for specific endpoints
{service.name="your-service-name" && name=~".*api/users.*"}
# or
{resource.service.name="your-service-name" && name=~".*api/users.*"}
```

### Runtime Issues

**No traces in Grafana:**
```bash
# Check services
docker-compose ps otel-collector tempo grafana

# Check collector logs
docker-compose logs otel-collector
```

**Traces not exported:**
```bash
# Verify configuration
php artisan tinker
>>> config('opentelemetry.enabled')
>>> config('opentelemetry.service.name')

# Enable debug mode
# Add to .env: OTEL_DEBUG=true
```

**High memory usage:**
```env
# Reduce sampling in .env
OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces
```

## 🚀 Production Deployment

### Environment Configuration

```env
# Production settings
OTEL_ENABLED=true
OTEL_SERVICE_NAME=my-production-app
OTEL_ENVIRONMENT=production
OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces

# Use production collector
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-production-collector:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Disable debug
OTEL_DEBUG=false
```

### Performance Considerations

1. **Sampling**: Use appropriate sampling rates for production (0.1 = 10%)
2. **Batching**: Configure batch processors in collector
3. **Resource Limits**: Set memory and CPU limits
4. **Network**: Use gRPC for better performance
5. **Storage**: Configure appropriate retention policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This package is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the Laravel OpenTelemetry documentation

---

**Built with ❤️ by Mumzworld Development Team**