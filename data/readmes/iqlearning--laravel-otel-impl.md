# Laravel OpenTelemetry Package

[![Latest Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/antigravity/laravel-otel)
[![PHP Version](https://img.shields.io/badge/php-%5E8.1-purple.svg)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/laravel-%5E10.0%20%7C%20%5E11.0-red.svg)](https://laravel.com/)

A Laravel package providing OpenTelemetry integration with dual exporters for Jaeger and Zipkin using the JSON protocol.

## Features

-   ✅ **Dual Exporters**: Send traces to both Jaeger and Zipkin simultaneously
-   ✅ **JSON Protocol**: OTLP HTTP JSON for Jaeger, HTTP JSON for Zipkin
-   ✅ **Auto-Discovery**: Automatic service provider registration
-   ✅ **Flexible Sampling**: Support for multiple sampling strategies
-   ✅ **Easy Configuration**: Environment-based configuration
-   ✅ **Laravel Integration**: Native Laravel service provider

## Disclaimer

-   Made with Google Antigravity
-   Be extra cautious using this package for possible security vulnerability

## Installation

### 1. Install via Composer

```bash
composer require iqlearning/laravel-otel
```

### 2. Publish Configuration

```bash
php artisan vendor:publish --provider="Iqlearning\LaravelOtel\OpenTelemetryServiceProvider"
```

This will publish the `config/opentelemetry.php` configuration file.

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=your-app-name
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_TYPE=both
OTEL_EXPORTER_OTLP_PROTOCOL=http/json

# Jaeger Exporter
OTEL_EXPORTER_JAEGER_ENABLED=true
OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:4318/v1/traces

# Zipkin Exporter
OTEL_EXPORTER_ZIPKIN_ENABLED=true
OTEL_EXPORTER_ZIPKIN_ENDPOINT=http://localhost:9411/api/v2/spans

# Trace Sampling
OTEL_TRACES_SAMPLER=always_on
OTEL_TRACES_SAMPLER_ARG=1.0
```

## Usage

### Basic Usage

The package automatically registers the OpenTelemetry service provider. Simply inject the `TracerInterface` into your classes:

```php
use OpenTelemetry\API\Trace\TracerInterface;

class YourController extends Controller
{
    public function __construct(
        private TracerInterface $tracer
    ) {}

    public function yourMethod()
    {
        $span = $this->tracer
            ->spanBuilder('your.operation')
            ->startSpan();

        try {
            // Your business logic
            $result = $this->doSomething();

            $span->addEvent('operation.completed');

            return $result;
        } finally {
            $span->end();
        }
    }
}
```

### Configuration

#### Exporter Selection

Choose which exporter(s) to use:

```env
# Use only Jaeger
OTEL_EXPORTER_TYPE=jaeger

# Use only Zipkin
OTEL_EXPORTER_TYPE=zipkin

# Use both (default)
OTEL_EXPORTER_TYPE=both
```

#### Sampling Strategies

Control which traces are collected:

```env
# Sample all traces (development)
OTEL_TRACES_SAMPLER=always_on

# Sample no traces
OTEL_TRACES_SAMPLER=always_off

# Sample 10% of traces (production)
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

## Infrastructure Setup

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
services:
    jaeger:
        image: jaegertracing/all-in-one:latest
        environment:
            - COLLECTOR_OTLP_ENABLED=true
        ports:
            - "16686:16686" # Jaeger UI
            - "4318:4318" # OTLP HTTP receiver

    zipkin:
        image: openzipkin/zipkin:latest
        ports:
            - "9411:9411" # Zipkin UI and API
```

Start the services:

```bash
docker-compose up -d
```

### Viewing Traces

-   **Jaeger UI**: http://localhost:16686
-   **Zipkin UI**: http://localhost:9411

## Requirements

-   PHP 8.1 or higher
-   Laravel 10.0 or 11.0
-   OpenTelemetry PHP Extension (for auto-instrumentation)

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/antigravity/laravel-otel).

