# Laravel Caddy Metrics

[![Latest Version on Packagist](https://img.shields.io/packagist/v/iperamuna/laravel-caddy-metrics.svg?style=flat-square)](https://packagist.org/packages/iperamuna/laravel-caddy-metrics)
[![Total Downloads](https://img.shields.io/packagist/dt/iperamuna/laravel-caddy-metrics.svg?style=flat-square)](https://packagist.org/packages/iperamuna/laravel-caddy-metrics)

A beautiful, real-time metrics dashboard for Caddy server in your Laravel application. Monitor performance, visualize traffic, and optimize your FrankenPHP thread configuration with an interactive simulator.

## Features

- 📊 **Real-time Metrics** - Live updating charts with 5-second polling (Chart.js)
- 🧠 **Thread Optimization Advisor** - Smart analysis of your Go goroutines and memory usage
- 🎚️ **Interactive Simulator** - Test different safety margins to find your ideal `num_threads` setting
- 🎨 **Premium UI** - Modern, status-reactive dashboard with distinct "System Optimal", "Can Scale", and "Caution" states
- 📈 **Core Metrics** - Request counts, response sizes, goroutines, memory, and total responses
- 🔧 **Easy Installation** - Interactive CLI installer for systemd (Linux) and launchd (macOS)
- 🗑️ **Data Management** - Built-in commands for pruning data and clearing the entire metrics history
- 🧪 **Full Test Suite** - Comprehensive Pest tests for advisor logic and data generation

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12
- Livewire 3.x
- Caddy server with metrics enabled (`servers { metrics }` in Caddyfile)
- SQLite support

## Installation

### 1. Install the package

```bash
composer require iperamuna/laravel-caddy-metrics
```

### 2. Publish configurations and assets

```bash
# Configuration
php artisan vendor:publish --tag=caddy-metrics-config

# Collector Binary
php artisan vendor:publish --tag=caddy-metrics-binary

# Dashboard Views (Optional for customization)
php artisan vendor:publish --tag=caddy-metrics-views
```

### 3. Install the collector service
The installer handles everything for you:
- Installs the Go collector binary
- Creates the systemd (Linux) or launchd (macOS) service
- Publishes the `CaddyMetricsServiceProvider` for access control
- Registers the provider in `bootstrap/providers.php`

```bash
# Linux (requires sudo)
sudo php artisan caddy-metrics:install

# macOS
php artisan caddy-metrics:install
```

### 3a. Configure Remote Servers
On remote servers where you cannot run the full installer or need to manage settings via environment variables, use the configuration command:

```bash
php artisan caddy-metrics:configure
```

This interactive command will help you set up your `.env` file with the correct ports, URLs, and paths for Caddy metrics. You can run it with `--no-interaction` in deployment scripts as long as your environment variables are already set.

### 4. Dashboard Authorization

To control who can access the Caddy Metrics dashboard in production, you must configure the `viewCaddyMetrics` gate in your `app/Providers/CaddyMetricsServiceProvider.php` file (created during installation).

```php
/**
 * Register the Caddy Metrics gate.
 *
 * This gate determines who can access Caddy Metrics in non-local environments.
 *
 * @return void
 */
protected function gate()
{
    Gate::define('viewCaddyMetrics', function ($user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

By default, the dashboard is only accessible in the `local` environment.

## Configuration

Edit `config/caddy-metrics.php` to match your environment:

```php
return [
    'enabled' => env('CADDY_METRICS_ENABLED', true),
    'dashboard_url' => env('CADDY_METRICS_DASHBOARD_URL', '/caddy/metrics'),
    'frankenphp_threads' => env('FRANKENPHP_THREADS', 12),
    'caddyfile_path' => env('CADDYFILE_PATH', '/etc/frankenphp/Caddyfile'),
    'retention_days' => env('CADDY_METRICS_RETENTION_DAYS', 7),
];
```

## Thread Optimization Advisor

The dashboard includes a dedicated **Thread Advisor** that analyzes your server's average and peak loads.

- **Interactive Simulation**: Adjust the **Safety Margin Slider** to see exactly how many threads you should allocate to maintain your desired headroom.
- **Can Scale Branding**: Identifies when your server has "headroom" to scale up for better performance.
- **Caddyfile Recommendations**: provides copy-and-paste snippets for your `Caddyfile` based on simulation results.

## Commands

| Command | Description |
|---------|-------------|
| `caddy-metrics:install` | Interactive installer for the collector service |
| `caddy-metrics:configure` | Helper for configuring `.env` variables on remote servers |
| `caddy-metrics:maintain` | Manage service (start/stop/restart/status/enable/disable) |
| `caddy-metrics:generate` | Generate scenario-based dummy data (Optimal, High Load, Spikes, etc.) |
| `caddy-metrics:clear` | Wipe all metrics data from the database (includes `--force`) |

### Service Management Examples

```bash
# Check if the collector is running
sudo php artisan caddy-metrics:maintain status

# Restart the service after config changes
sudo php artisan caddy-metrics:maintain restart

# Stop the collector
sudo php artisan caddy-metrics:maintain stop
```

## Testing

The package includes a robust test suite using Pest.

```bash
cd packages/iperamuna/laravel-caddy-metrics
composer install
vendor/bin/pest
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Author

**Indunil Peramuna**
- Website: [iperamuna.online](https://iperamuna.online)
- GitHub: [@iperamuna](https://github.com/iperamuna)
- Email: iperamuna@gmail.com
