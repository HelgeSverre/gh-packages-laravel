# ErrorVault Laravel Package

Send PHP exceptions to your ErrorVault dashboard for centralized error monitoring with automatic health monitoring and reliability features.

## Installation

```bash
composer require errorvault/laravel
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=errorvault-config
```

Add these environment variables to your `.env` file:

```env
ERRORVAULT_ENABLED=true
ERRORVAULT_API_ENDPOINT=https://your-errorvault-portal.com/api/v1/errors
ERRORVAULT_API_TOKEN=your-site-api-token
```

## Usage

Once configured, exceptions are automatically reported to ErrorVault. You can also manually report errors:

```php
use ErrorVault\Laravel\Facades\ErrorVault;

// Report a custom error
ErrorVault::reportError('Something went wrong', 'warning', __FILE__, __LINE__);

// Report with additional context
ErrorVault::reportError(
    'Payment failed',
    'critical',
    __FILE__,
    __LINE__,
    ['order_id' => $orderId, 'amount' => $amount]
);

// Manually report an exception
try {
    // risky operation
} catch (\Exception $e) {
    ErrorVault::report($e, ['custom' => 'context']);
}
```

## Verify Connection

```php
use ErrorVault\Laravel\Facades\ErrorVault;

$result = ErrorVault::verify();

if ($result['success']) {
    echo "Connected to: " . $result['data']['site_name'];
} else {
    echo "Error: " . $result['error'];
}
```

## Get Statistics

```php
$stats = ErrorVault::stats();

if ($stats) {
    echo "Total errors: " . $stats['total_errors'];
    echo "New errors: " . $stats['new_errors'];
}
```

## Reliability Features (v1.3.0+)

### Automatic Heartbeat

The package automatically sends a lightweight ping every 5 minutes to keep your site's `last_seen_at` updated in the portal. This prevents your site from appearing offline.

### Connection Failure Tracking

All API connection failures are automatically logged with:
- Timestamp and error message
- Consecutive failure counter
- Last 20 failures stored
- Admin notification after 5 consecutive failures

### Artisan Commands

**Test Connection**
```bash
php artisan errorvault:test-connection
```
Tests connectivity to the ErrorVault portal and displays detailed results.

**View Diagnostics**
```bash
php artisan errorvault:diagnostics
```
Displays comprehensive diagnostics including:
- Configuration status
- Health monitoring settings
- Connection failure history
- Scheduled task information

**Clear Failure Logs**
```bash
php artisan errorvault:diagnostics --clear-failures
```
Clears all connection failure logs.

**Send Health Report**
```bash
php artisan errorvault:health-report
```
Manually trigger a health report to the portal.

### Programmatic Access

```php
use ErrorVault\Laravel\Facades\ErrorVault;

// Test connection
$result = ErrorVault::testConnection();
if ($result['success']) {
    echo "Connection successful!";
}

// Get connection failures
$failures = ErrorVault::getConnectionFailures();
foreach ($failures as $failure) {
    echo $failure['timestamp'] . ': ' . $failure['message'];
}

// Get consecutive failure count
$count = ErrorVault::getConsecutiveFailures();

// Clear failure logs
ErrorVault::clearFailureLog();

// Send heartbeat/ping
ErrorVault::sendPing(); // Non-blocking
ErrorVault::sendPing(true); // Blocking
```

## Health Monitoring

Enable comprehensive server health monitoring:

```env
ERRORVAULT_HEALTH_ENABLED=true
ERRORVAULT_CPU_THRESHOLD=80
ERRORVAULT_MEMORY_THRESHOLD=80
ERRORVAULT_REQUEST_RATE_THRESHOLD=1000
ERRORVAULT_HEALTH_INTERVAL=5
```

Health monitoring tracks:
- CPU load and usage
- Memory consumption
- Request rates and traffic spikes
- Disk space
- Potential DDoS attacks

Reports are automatically sent every 5 minutes (configurable) and alerts are triggered when thresholds are exceeded.

## Configuration Options

### Basic Options

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Enable/disable reporting | `false` |
| `api_endpoint` | Your ErrorVault API endpoint | `''` |
| `api_token` | Your site's API token | `''` |
| `send_immediately` | Send errors immediately vs batch | `true` |
| `ignore` | Exception classes to ignore | See config |
| `ignore_patterns` | Message patterns to ignore | `[]` |
| `severity_map` | Map exceptions to severities | `[]` |

### Health Monitoring Options

| Option | Description | Default |
|--------|-------------|---------|  
| `health_monitoring.enabled` | Enable health monitoring | `false` |
| `health_monitoring.cpu_load_threshold` | CPU load alert threshold (%) | `80` |
| `health_monitoring.memory_threshold` | Memory usage alert threshold (%) | `80` |
| `health_monitoring.request_rate_threshold` | Request rate alert (req/min) | `1000` |
| `health_monitoring.request_spike_multiplier` | Traffic spike multiplier | `5` |
| `health_monitoring.alert_cooldown` | Alert cooldown (minutes) | `15` |
| `health_monitoring.report_interval` | Report interval (minutes) | `5` |
| `health_monitoring.disk_threshold` | Disk usage alert threshold (%) | `90` |

## Ignoring Exceptions

Add exceptions to the `ignore` array in `config/errorvault.php`:

```php
'ignore' => [
    \App\Exceptions\IgnoredException::class,
],
```

Or use patterns to ignore by message content:

```php
'ignore_patterns' => [
    'deprecated',
    'cache miss',
],
```

## Scheduled Tasks

The package automatically registers the following scheduled tasks:

1. **Heartbeat** (every 5 minutes) - Keeps site active in portal
2. **Health Report** (configurable, default 5 minutes) - Sends health metrics

Ensure your Laravel scheduler is running:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or use Laravel's queue worker in production.

## Version History

- **1.3.0** - Added heartbeat/ping system, connection failure tracking, diagnostics commands, and reliability improvements
- **1.2.0** - Added comprehensive server health monitoring
- **1.1.0** - Enhanced error context and server information
- **1.0.0** - Initial release

## License

MIT
