# Laravel Service Health

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/mrtolouei/laravel-service-health/actions/workflows/tests.yml/badge.svg)](https://github.com/mrtolouei/laravel-service-health/actions/workflows/tests.yml)
[![Latest Stable Version](https://poser.pugx.org/mrtolouei/laravel-service-health/v/stable)](https://packagist.org/packages/mrtolouei/laravel-service-health)

A flexible and extensible **service health monitoring package for Laravel**.

This package helps you monitor the health of your application's critical services such as:

- Database connections
- Cache stores
- Queue connections
- Filesystem disks
- Redis connections
- External/internal HTTP endpoints

It includes:

- A web-based **dashboard**
- A **JSON API endpoint**
- An **Artisan command** for CLI / CI usage
- Built-in **authorization layer**
- Extensible architecture for adding **custom inspectors**

---

## Screenshot

![Laravel Service Health Dashboard](./screenshot.png)

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Publishing Assets](#publishing-assets)
    - [Publish Config](#publish-config)
    - [Publish Authorization Provider Stub](#publish-authorization-provider-stub)
    - [Publish Views](#publish-views)
- [Quick Start](#quick-start)
- [Routes](#routes)
- [Configuration](#configuration)
    - [Top-Level Config Options](#top-level-config-options)
    - [Monitor Configuration](#monitor-configuration)
- [Usage Examples](#usage-examples)
    - [Monitoring Multiple Database Connections](#monitoring-multiple-database-connections)
    - [Monitoring External APIs](#monitoring-external-apis)
    - [Monitoring Internal Services with Auth](#monitoring-internal-services-with-auth)
- [Dashboard](#dashboard)
- [JSON API](#json-api)
- [Artisan Command](#artisan-command)
- [Authorization](#authorization)
- [Custom Inspectors for Developers](#custom-inspectors-for-developers)
    - [Inspector Contract](#inspector-contract)
    - [Creating a Custom Inspector](#creating-a-custom-inspector)
    - [Registering a Custom Inspector](#registering-a-custom-inspector)
    - [Returning Rich Metadata](#returning-rich-metadata)
- [Status Model](#status-model)
- [CI Ideas](#ci-ideas)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Monitor important Laravel services in one place
- Detect:
    - healthy services
    - degraded services
    - failed services
- Measure response duration in milliseconds
- Configure slow thresholds per monitor
- Expose health results through:
    - Dashboard page
    - API endpoint
    - CLI command
- Protect access using authorization middleware
- Add your own custom service inspectors
- Works with Laravel auto-discovery

---

## Requirements

- PHP `>= 8.2`
- Laravel `11`, `12`, or `13`

Package dependencies include:

- `illuminate/support`
- `illuminate/http`
- `illuminate/cache`
- `illuminate/queue`
- `illuminate/filesystem`
- `illuminate/database`

---

## Installation

Install the package via Composer:

```bash
  composer require mrtolouei/laravel-service-health
```

Laravel will automatically discover and register the package service provider.

---

## Publishing Assets

### Publish Config

Publish the package configuration file:

```bash
  php artisan vendor:publish --tag=service-health-config
```

This creates:

```text
config/service-health.php
```

### Publish Authorization Provider Stub

If you want to define who can access the dashboard and API, publish the authorization provider stub:

```bash
  php artisan vendor:publish --tag=service-health-provider
```

This creates:

```text
app/Providers/HealthServiceServiceProvider.php
```

You can then register your own gate logic there.

### Publish Views

If you want to customize the dashboard UI:

```bash
  php artisan vendor:publish --tag=service-health-views
```

---

## Quick Start

### 1) Install the package

```bash
  composer require mrtolouei/laravel-service-health
```

### 2) Publish assets

```bash
  php artisan vendor:publish --tag=service-health-config
  php artisan vendor:publish --tag=service-health-provider
  php artisan vendor:publish --tag=service-health-views
```

### 3) Visit the dashboard

- Dashboard: `/service-health`
- API: `/service-health-api`

### 4) Run checks from CLI

```bash
  php artisan service-health:check
```

### 5) Optionally secure access

Publish the authorization provider and define your gate rules.

---

## Routes

By default, the package registers two routes:

```text
GET /service-health
GET /service-health-api
```

These are configurable via:

```php
'route' => [
    'prefix' => env('SERVICE_HEALTH_ROUTE_PREFIX', ''),
    'dashboard' => env('SERVICE_HEALTH_ROUTE_DASHBOARD', 'service-health'),
    'api' => env('SERVICE_HEALTH_ROUTE_API', 'service-health-api'),
    'middleware' => [
        'web',
        MrTolouei\ServiceHealth\Http\Middleware\Authorize::class,
    ],
],

```

### Example

If you set:

```dotenv
SERVICE_HEALTH_ROUTE_PREFIX=admin/tools
SERVICE_HEALTH_ROUTE_DASHBOARD=health
SERVICE_HEALTH_ROUTE_API=health-api
```

Routes become:

- `/admin/tools/health`
- `/admin/tools/health-api`

---

## Configuration

Main config file:

```text
config/service-health.php
```

### Top-Level Config Options

#### enabled

```php
'enabled' => env('SERVICE_HEALTH_ENABLED', true),
```

Globally enables or disables the package routes.

If set to false, routes will not be registered.

#### route

```php
'route' => [
    'prefix' => env('SERVICE_HEALTH_ROUTE_PREFIX', ''),
    'dashboard' => env('SERVICE_HEALTH_ROUTE_DASHBOARD', 'service-health'),
    'api' => env('SERVICE_HEALTH_ROUTE_API', 'service-health-api'),
    'middleware' => [
        'web',
        MrTolouei\ServiceHealth\Http\Middleware\Authorize::class,
    ],
],
```

Controls route URLs and middleware.

#### history_limit

```php
'history_limit' => env('SERVICE_HEALTH_LIMIT_HISTORY', 20),
```

Used by the dashboard for limiting displayed history items.

#### refresh_interval

```php
'refresh_interval' => env('SERVICE_HEALTH_REFRESH_INTERVAL', 3000),
```

Dashboard refresh interval in milliseconds.

Example:

- 3000 = every 3 seconds
- 10000 = every 10 seconds

#### expose_exception_messages

```php
'expose_exception_messages' => env('SERVICE_HEALTH_EXPOSE_EXCEPTION_MESSAGES', true),
```

Controls whether raw exception messages should be shown in results.

- `true`: actual exception messages are exposed
- `false`: generic safe messages are returned

For production environments, you may prefer setting this to `false`.

### Monitor Configuration

Each monitor has a structure similar to this:

```php
'monitor_name' => [
    'enabled' => true,
    'inspector' => SomeInspector::class,
    'slow_threshold' => 20,
    'connections' => [
    ...
    ],
],
```

#### Common fields

`enabled`

Whether this monitor is active.

`inspector`

The class responsible for performing the health check.

`slow_threshold`

If the check completes successfully but takes longer than this threshold (ms), the result becomes degraded instead of
healthy.

`connections`

The list of things to inspect.

> For some inspectors, each item is a string connection name.

> For HttpInspector, each item is a full config array.

---

## Usage Examples

### Monitoring Multiple Database Connections

```php
'database' => [
    'enabled' => true,
    'inspector' => MrTolouei\ServiceHealth\Inspectors\DatabaseInspector::class,
    'slow_threshold' => 50,
    'connections' => [
        'mysql',
        'analytics',
        'tenant',
    ],
],
```

This will create separate health results for each configured database connection.

### Monitoring External APIs

```php
'http' => [
    'enabled' => true,
    'inspector' => MrTolouei\ServiceHealth\Inspectors\HttpInspector::class,
    'connections' => [
        [
            'name' => 'GitHub API',
            'endpoint' => 'https://api.github.com',
            'method' => 'GET',
            'expected_status' => 200,
            'headers' => [
                'Accept' => 'application/json',
                'User-Agent' => 'LaravelServiceHealth',
            ],
            'timeout' => 5,
            'slow_threshold' => 2000,
        ],
        [
            'name' => 'Payment Gateway Health',
            'endpoint' => 'https://payments.example.com/health',
            'method' => 'GET',
            'expected_status' => 200,
            'auth' => [
                'type' => 'bearer',
                'token' => env('PAYMENT_GATEWAY_TOKEN'),
            ],
            'timeout' => 5,
            'slow_threshold' => 1000,
        ],
    ],
],
```

### Monitoring Internal Services with Auth

```php
'http' => [
    'enabled' => true,
    'inspector' => MrTolouei\ServiceHealth\Inspectors\HttpInspector::class,
    'connections' => [
        [
            'name' => 'Internal Admin API',
            'endpoint' => 'https://internal.example.com/api/health',
            'method' => 'GET',
            'expected_status' => 200,
            'headers' => [
                'Accept' => 'application/json',
            ],
            'auth' => [
                'type' => 'basic',
                'username' => env('INTERNAL_API_USER'),
                'password' => env('INTERNAL_API_PASSWORD'),
            ],
            'timeout' => 3,
            'slow_threshold' => 800,
        ],
    ],
],
```

---

## Dashboard

The dashboard route renders a Blade view:

```php
return view('service-health::dashboard');
```

By default, it is available at:

```text
/service-health
```

This dashboard is intended to give a quick visual overview of:

- service statuses
- degraded/failed services
- timings
- refresh-based updates

You may publish and customize the view if needed.

---

## JSON API

The API endpoint returns a structured JSON response including:

- checked_at
- summary
- services

Default route:

```text
/service-health-api
```

### Summary keys

- total
- healthy
- degraded
- failed
- average_duration
- slowest_service
- slowest_duration
- overall_status

### Service item keys

- name
- status
- is_healthy
- is_degraded
- is_failed
- is_up
- message
- duration
- metadata
- type
- connection

---

## Artisan Command

Run checks via CLI:

```bash
  php artisan service-health:check
```

### JSON output

```bash
  php artisan service-health:check --json
```

### Behavior

- Prints a table of all services
- Returns failure exit code if any service has failed
- Returns success if all services are either healthy or degraded

This makes it useful for:

- deployment pipelines
- cron jobs
- uptime scripts
- container health checks
- infrastructure monitoring

---

## Authorization

The package uses this middleware by default:

```php
MrTolouei\ServiceHealth\Http\Middleware\Authorize::class
```

That middleware delegates authorization to:

```php
ServiceHealth::check($request)
```

By default, if no custom auth callback is defined, access is only allowed in the `local` environment.

To customize this, publish the provider stub:

```bash
  php artisan vendor:publish --tag=service-health-provider
```

Then define your gate in the generated provider.

Example:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use MrTolouei\ServiceHealth\HealthServiceApplicationServiceProvider;

class HealthServiceServiceProvider extends HealthServiceApplicationServiceProvider
{
    protected function gate(): void
    {
        Gate::define('viewHealthService', function ($user = null) {
            return $user && $user->is_admin;
        });
    }
}
```

You can also make access conditional by email, role, permission, environment, IP, or any custom logic.

---

## Custom Inspectors for Developers

One of the main strengths of this package is that you can create your own inspectors.

### Inspector Contract

Every custom inspector must implement:

```php
MrTolouei\ServiceHealth\Inspectors\InspectorInterface
```

Which requires:

```php
public function monitor(): InspectorResult;
```

### Creating a Custom Inspector

Example: checking a third-party SDK, external service state, or internal app condition.

```php
<?php

namespace App\Health;

use MrTolouei\ServiceHealth\DTOs\InspectorResult;
use MrTolouei\ServiceHealth\Inspectors\InspectorInterface;
use Throwable;

class MailProviderInspector implements InspectorInterface
{
    public function __construct(protected string $connection)
    {
    }
    
    public function monitor(): InspectorResult
    {
        $startedAt = microtime(true);
        
        try {
            // Example custom logic
            $healthy = true;
            
            $duration = round((microtime(true) - $startedAt) * 1000, 2);
            
            return new InspectorResult(
                name: "mail-provider:{$this->connection}",
                status: $healthy
                    ? InspectorResult::STATUS_HEALTHY
                    : InspectorResult::STATUS_FAILED,
                message: $healthy
                    ? 'Mail provider is healthy.'
                    : 'Mail provider is unavailable.',
                duration: $duration,
                metadata: [
                    'provider' => $this->connection,
                ],
                type: 'mail',
                connection: $this->connection,
            );
        } catch (Throwable $e) {
            $duration = round((microtime(true) - $startedAt) * 1000, 2);
            
            return new InspectorResult(
                name: "mail-provider:{$this->connection}",
                status: InspectorResult::STATUS_FAILED,
                message: config('service-health.expose_exception_messages', true)
                    ? $e->getMessage()
                    : 'Mail provider health check failed.',
                duration: $duration,
                metadata: [],
                type: 'mail',
                connection: $this->connection,
            );
        }
    }
}
```

### Registering a Custom Inspector

Add it to your config:

```php
'mail_provider' => [
    'enabled' => true,
    'inspector' => App\Health\MailProviderInspector::class,
    'connections' => [
        'postmark',
        'ses',
    ],
],
```

The package manager will automatically instantiate the inspector for each connection and include its results in:

- dashboard
- API
- Artisan command

### Returning Rich Metadata

You can include extra details in `metadata`:

```php
metadata: [
    'region' => 'eu-central-1',
    'quota_remaining' => 1240,
    'response_code' => 200,
],
```

This is useful if you want the API consumers to understand more about the service state.

---

## Status Model

The package supports three statuses:

### `healthy`

The service is available and responding within the acceptable threshold.

### `degraded`

The service is working, but slower than expected.

### `failed`

The service is unavailable, returned unexpected results, or threw an exception.

---

## CI Ideas

You can use this package in CI/CD pipelines like this:

```bash
  php artisan service-health:check --json
```

Possible use cases:

- fail deployment if a critical dependency is down
- verify environment readiness after deployment
- expose health checks to orchestration systems
- monitor external API dependencies

You can also wrap the command inside cron or supervisor-based scripts.

---

## Testing

Run tests using PHPUnit:

```bash
  vendor/bin/phpunit
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
